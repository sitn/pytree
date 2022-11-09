# -*- coding: utf-8 -*-
from pathlib import Path
import re
import subprocess
import yaml
from yaml import FullLoader

from flask import jsonify, request, render_template, abort
from flask_cors import cross_origin

from pytree import app

with open('/app/pytree.yml', 'r') as f:
    pytree_config = yaml.load(f, Loader=FullLoader)

@app.route('/')
def home():
    return render_template(
        'home.html',
        default_point_cloud=pytree_config['vars']['default_point_cloud']
    )


@app.route("/profile/get")
@cross_origin()
def get_profile():
    app.logger.debug('Pytree config:')
    app.logger.debug(pytree_config)

    COORD_REGEX = r'\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}, ?(\{([0-9]+(\.[0-9]+)?), ?([0-9]+(\.[0-9]+)?)\}(, ?)?)+'

    cpotree = pytree_config['vars']['cpotree_executable']
    point_clouds = pytree_config['vars']['pointclouds']
    app.logger.debug('Request args:')
    app.logger.debug(request.args)

    coordinates = request.args.get('coordinates')
    if not re.match(COORD_REGEX, coordinates):
        abort(400, 'coordinates parameter is malformed')

    try:
        maxLOD = int(request.args.get('maxLOD'))
    except ValueError:
        abort(400, 'maxLOD is not an integer')

    try:
        minLOD = int(request.args.get('minLOD'))
    except ValueError:
        abort(400, 'minLOD is not an integer')

    try:
        width = float(request.args.get('width'))
    except ValueError:
        abort(400, 'width is not a float')

    point_cloud = request.args.get('pointCloud')

    if point_cloud not in point_clouds:
        abort(400, 'The referenced pointcloud is unknown.')

    potree_file = point_clouds[point_cloud]

    if not Path(potree_file).is_file():
        app.logger.error('metadata.json file not found could not be found')
        return 'metadata.json file not found'
    
    cmd = [cpotree, potree_file, "--stdout"] + [
        "-o", 'stdout',
        "--coordinates", coordinates,
        "--width", str(width),
        "--min-level", str(minLOD),
        "--max-level", str(maxLOD)
    ]

    app.logger.debug('Subprocess command:')
    app.logger.debug(cmd)

    p = subprocess.Popen(cmd,
        bufsize=-1,
        stdout=subprocess.PIPE
    )

    [out, err] = p.communicate()

    return out


@app.route("/profile/config")
@cross_origin()
def profile_config_gmf2():

    vars = pytree_config['vars'].copy()

    if 'cpotree_executable' in vars:
        vars.pop('cpotree_executable')

    if 'pointclouds' in vars:
        vars['pointclouds'] = list(vars['pointclouds'].keys())

    return jsonify(vars)
