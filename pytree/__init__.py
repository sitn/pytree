import logging, os, re, subprocess, yaml, sys, json, pathlib
from flask import Flask, jsonify, request, render_template, abort
from flask_cors import cross_origin
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)
app.config['JSON_SORT_KEYS'] = False
app.logger.setLevel(logging.ERROR)
if os.environ.get('DEPLOY_ENV') == 'DEV':
    app.logger.setLevel(logging.DEBUG)

CONFIG_FILE = './pytree.yml'
COORD_REGEX = r'\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}, ?(\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}(, ?)?)+'

try:
    with open(CONFIG_FILE, 'r') as f:
        config = yaml.load(f, Loader=yaml.FullLoader)
except FileNotFoundError:
    sys.exit(f"Unable to find configuration file in {CONFIG_FILE}")

def error(code, msg, socket=None):
    if socket != None :
        socket.send(f"Error {code} : {msg}")
    abort(code, msg)

def ensure_params(params_list, dict, socket=None):
    for param in params_list:
        if param not in dict :
            error(400, f'Missing {param} parameter', socket)

def apply_or_error(value, func, code, msg, socket=None):
    try :
        return func(value)
    except Exception :
        error(code, msg, socket)


def call_cpotree(potree_file, coord, width, maxPoints):
    with open(potree_file, "r") as f:
        metadata = json.loads(f.read())
    result = ""
    header = {}
    previous_result = ""
    previous_header = {}
    currentLOD = 0
    while currentLOD == 0 or (currentLOD <= metadata['hierarchy']['depth'] and int(header['points']) < maxPoints):
        previous_result = result
        previous_header = header
        header = {}
        cmd = [config['vars']['cpotree_executable'], potree_file, "--stdout", "-o", 'stdout', "--coordinates", coord, "--width", str(width), "--min-level", "0", "--max-level", str(currentLOD)]
        result = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()[0]
        header['headerSize'] = int.from_bytes(result[0:4], byteorder='little')
        result_filtered = bytes(filter(lambda b: b != b'\r'[0], result)) # Filter \r characters, because headerSize considers \r\n as one char
        header.update(json.loads(result_filtered[4:4+header['headerSize']].decode()))
        currentLOD += 1
    app.logger.debug(f'Subprocess command: {cmd}')
    return [previous_result, previous_header] if previous_result != "" else [result, header]


def get_profile(params, socket=None):
    ensure_params(['coordinates', 'width', 'pointCloud', 'maxPoints'], params, socket)
    coordinates = params['coordinates']
    point_cloud = params['pointCloud']
    point_clouds = config['vars']['pointclouds']
    maxPoints = apply_or_error(params['maxPoints'], int, 400, 'maxPoints is not an integer', socket)
    width = apply_or_error(params['width'], float, 400, 'width is not a float', socket)
    if coordinates == None or not re.match(COORD_REGEX, coordinates):
        error(400, 'coordinates parameter is malformed')
    if point_cloud not in point_clouds:
        error(400, 'The referenced pointcloud is unknown.')
    potree_file = point_clouds[point_cloud]
    if not pathlib.Path(potree_file).is_file():
        app.logger.error(f'metadata.json not found for point cloud {potree_file}')
        error(404, 'The requested point cloud is not available')
    return call_cpotree(potree_file, coordinates, width, maxPoints)


@app.route('/')
def home():
    return render_template('home.html', point_cloud=config['vars']['default_point_cloud'])

@app.route('/websocket')
def websocket():
    return render_template('websocket.html')

@app.route("/profile/get")
@cross_origin()
def get():
    app.logger.debug(f'Pytree config: {config}')
    app.logger.debug(f'Request args: {request.args}')
    return get_profile(request.args.to_dict())[0]

@sock.route('/echo')
def echo(socket):
    while True:
        try:
            params = json.loads(socket.receive())
        except Exception as e:
            return socket.send(f"Invalid JSON parameters : {repr(e)}")
        points_per_chunk = params['pointsPerChunk'] if "pointsPerChunk" in params else 0
        [profile, header] = get_profile(params, socket)
        if points_per_chunk == 0 or points_per_chunk > header['points']:
            socket.send(profile)
        else:
            socket.send(profile[0:4+header['headerSize']])
            current_byte = 4+header['headerSize']
            while current_byte < header['points']*header['bytesPerPoint']:
                chunk_size = points_per_chunk*header['bytesPerPoint']
                socket.send(profile[current_byte : current_byte+chunk_size])
                current_byte += chunk_size


@app.route("/profile/config")
@cross_origin()
def profile_config_gmf2():
    vars = config['vars'].copy()
    if 'cpotree_executable' in vars:
        vars.pop('cpotree_executable')
    if 'pointclouds' in vars:
        vars['pointclouds'] = list(vars['pointclouds'].keys())
    return jsonify(vars)