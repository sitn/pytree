import logging, os, re, subprocess, yaml, sys, json
from flask import Flask, jsonify, request, render_template, abort
from flask_cors import cross_origin
from flask_sock import Sock

COORD_REGEX = r'\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}, ?(\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}(, ?)?)+'
REQUIRED_PARAMETERS_SOCKET = ['coordinates', 'width', 'pointCloud']
REQUIRED_PARAMETERS_HTTP = ['coordinates', 'width', 'pointCloud', 'minLOD', 'maxLOD']

def start_app(config_file, cpotree_exe, data_dir):
    try:
        with open(config_file, 'r') as f:
            config = yaml.load(f, Loader=yaml.FullLoader)
    except FileNotFoundError:
        sys.exit(f"Unable to find configuration file in {config_file}")

    POINT_CLOUDS = config['vars']['pointclouds']

    app = Flask(__name__)
    sock = Sock(app)
    app.logger.setLevel(logging.DEBUG if os.environ.get('DEPLOY_ENV') == 'DEV' else logging.ERROR)

    def error(code, msg, socket=None):
        print(f"Error {code} : {msg}")
        if socket != None : socket.send(f"Error {code} : {msg}")
        abort(code, f"Error {code} : {msg}")

    def check_parameters(params, required_param, potree_file, socket=None):
        for param in required_param:
            if param not in params :
                error(400, f'Missing required {param} parameter', socket)
        if not re.match(COORD_REGEX, params['coordinates']):
            error(400, 'coordinates parameter is malformed')
        try :
            params['width'] = float(params['width'])
        except Exception :
            error(400, 'width is not a float', socket)
        if params['pointCloud'] not in POINT_CLOUDS:
            error(400, 'The referenced pointcloud is unknown.')
        try:
            with open(potree_file): pass
        except:
            error(500, 'Error opening requested point cloud metadata')

    def cpotree(potree_file, coord, width, minLOD, maxLOD):
        cmd = [cpotree_exe, potree_file, "--stdout", "-o", 'stdout', "--coordinates", coord, "--width", str(width), "--min-level", str(minLOD), "--max-level", str(maxLOD)]
        result = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0]
        headerSize = int.from_bytes(result[0:4], byteorder='little')
        if os.name == 'nt': # Under Windows \n are replaced by \r\n so we need to invert that
            result = bytes(result.replace(b'\r\n', b'\n')) 
        header = json.loads(result[4:4+headerSize].decode())
        header['headerSize'] = headerSize
        return (result, header)

    @app.route("/profile/get")
    @cross_origin()
    def get():
        params = request.args.to_dict()
        potree_file = data_dir+POINT_CLOUDS[params["pointCloud"]]
        check_parameters(params, REQUIRED_PARAMETERS_HTTP, potree_file)
        app.logger.debug(f'Pytree config: {config}')
        app.logger.debug(f'Request args: {request.args}')
        params = request.args.to_dict()
        profile, _ = cpotree(potree_file, params['coordinates'], params['width'], params['minLOD'], params['maxLOD'])
        return profile

    @sock.route('/echo')
    def echo(socket):
        while True:
            try:
                params = json.loads(socket.receive())
            except Exception as e:
                return socket.send(f"Invalid JSON parameters : {repr(e)}")
            potree_file = data_dir+POINT_CLOUDS[params["pointCloud"]]
            check_parameters(params, REQUIRED_PARAMETERS_SOCKET, potree_file, socket)
            points_per_chunk = params['pointsPerChunk'] if "pointsPerChunk" in params else 0

            with open(potree_file, "r") as f:
                metadata = json.loads(f.read())

            nb_points = 0
            current_LOD = 0
            while nb_points < params['maxPoints'] and current_LOD < metadata['hierarchy']['depth']:
                params['minLOD'] = current_LOD
                params['maxLOD'] = current_LOD
                current_LOD += 1
                profile, header = cpotree(potree_file, params['coordinates'], params['width'], params['minLOD'], params['maxLOD'])
                nb_points += int(header['points'])
                if nb_points < params['maxPoints'] :
                    if points_per_chunk == 0 or points_per_chunk > header['points']:
                        socket.send(profile)
                    else:
                        current_byte = 4+header['headerSize']
                        data_header = profile[0:current_byte]
                        chunk_size = points_per_chunk*header['bytesPerPoint']
                        current_byte += chunk_size
                        while current_byte < header['points']*header['bytesPerPoint']:
                            socket.send(data_header + profile[current_byte : current_byte+chunk_size])
                            current_byte += chunk_size

    @app.route('/')
    def home():
        return render_template('home.html', point_cloud=config['vars']['default_point_cloud'])

    @app.route('/websocket')
    def websocket():
        return render_template('websocket.html')
    
    # Old profile config for compatibility with c2cgeoportal
    @app.route("/profile/config")
    @cross_origin()
    def profile_config_gmf2():
        vars = config['vars'].copy()
        if 'cpotree_executable' in vars:
            vars.pop('cpotree_executable')
        if 'pointclouds' in vars:
            vars['pointclouds'] = list(vars['pointclouds'].keys())
        return str(vars)
    
    @app.route("/config")
    @cross_origin()
    def profile_config():
        vars = config['vars'].copy()
        if 'cpotree_executable' in vars:
            vars.pop('cpotree_executable')
        if 'pointclouds' in vars:
            vars['pointclouds'] = list(vars['pointclouds'].keys())
        return jsonify(vars)
    
    return app