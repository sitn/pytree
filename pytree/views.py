# -*- coding: utf-8 -*-

#%%
from pytree import app
from flask import request, render_template
from flask import jsonify
import os, sys
from os.path import join, abspath, dirname
import subprocess
import struct
import json
import yaml
from yaml import FullLoader
import urllib
import math
from flask_cors import cross_origin
from pytree.logging import log_profiles
#%%

yaml_config_file = (dirname(abspath(__file__)) + ".yml")
with open(yaml_config_file, 'r') as f:
    pytree_config = yaml.load(f, Loader=FullLoader)


@app.context_processor
def yaml_config_vars():
    return dict(yaml_config_vars=get_yaml_config_vars())
#%%

def get_yaml_config_vars():
    return pytree_config
#%%

@app.route('/')
def home(name=None):
    return render_template('home.html', name=name)
#%%

@app.route("/profile/get")
@cross_origin()
def get_profile():
    """ Docstring
    """
    cpotree = pytree_config['vars']['cpotree_executable']
    point_clouds = pytree_config['vars']['pointclouds']
    print("point_clouds: {}".format(point_clouds))
    polyline = request.args['coordinates']
    if polyline == '':
        return 'Empty coordinates'

    maxLevel = request.args['maxLOD']
    minLevel = request.args['minLOD']
    width = request.args['width']
    point_cloud = request.args['pointCloud']
    potree_file = point_clouds[point_cloud]
    attributes = [request.args['attributes']]
    p = subprocess.Popen([cpotree, potree_file, "--stdout"] + attributes +
        [
            "-o", 'stdout',
            "--coordinates", polyline,
            "--width", width,
            "--min-level", minLevel,
            "--max-level", maxLevel
        ],
        bufsize=-1,
        stdout=subprocess.PIPE
    )

    [out, err] = p.communicate()

    return out
#%%

# proxy to gmf raster dem/dsm profile service
@app.route("/dem/get")
@cross_origin()
def get_gmf_dem_dsm():

    url = 'http://sitn.ne.ch/production/wsgi/profile.json'

    coord = request.args['coord'].split(',')

    coordinates = []
    i = 0
    while i < len(coord):

        coordinates.append([int(coord[i]), int(coord[i+1])])
        i += 2
    nbPoints = request.args['nbPoints']

    dico = {
        'layers': 'mnt,mns',
        'geom': '{"type":"LineString","coordinates":' + str(coordinates) + '}',
        'nbPoints': str(nbPoints)
    }

    data = urllib.urlencode(dico)

    req = urllib.Request(url, data=data)
    response = urllib.urlopen(req)
    demdsm = response.read()

    return jsonify(demdsm)
#%%

@app.route("/profile/config")
@cross_origin()
def profile_config_gmf2():

    vars = pytree_config['vars'].copy()

    if 'cpotree_executable' in vars:
        vars.pop('cpotree_executable')

    if 'pointclouds' in vars:
        vars.pop('pointclouds')

    if 'log_folder' in vars:
        vars.pop('log_folder')

    return jsonify(vars)
#%%

class PointAttribute:
    def __init__(s, name, elements, bytes):
        s.name = name
        s.elements = elements
        s.bytes = bytes
#%%

class PointAttributes:

    POSITION_CARTESIAN = PointAttribute("POSITION_CARTESIAN", 3, 12)
    POSITION_PROJECTED_PROFILE = PointAttribute(
        "POSITION_PROJECTED_PROFILE", 2, 8)
    COLOR_PACKED = PointAttribute("COLOR_PACKED", 4, 4)
    RGB = PointAttribute("RGB", 3, 3)
    RGBA = PointAttribute("RGBA", 4, 4)
    INTENSITY = PointAttribute("INTENSITY", 1, 2)
    CLASSIFICATION = PointAttribute("CLASSIFICATION", 1, 1)

    def __init__(s):
        s.attributes = []
        s.bytes = 0

    def add(s, attribute):
        s.attributes.append(attribute)
        s.bytes = s.bytes + attribute.bytes * attribute.elements

    @staticmethod
    def fromName(name):
        return getattr(PointAttributes, name)
#%%