# -*- coding: utf-8 -*-

from pytree import app
from flask import request, render_template
from flask import jsonify, abort
import subprocess
import struct
import json
import os
import yaml
import urllib
import math
from flask_cors import CORS, cross_origin
from pytree.logging import log_profiles

pytree_config = yaml.load(open(os.path.dirname(os.path.abspath(__file__)) + ".yaml", 'r'))

@app.context_processor
def yaml_config_vars():
    return dict(yaml_config_vars=get_yaml_config_vars())

def get_yaml_config_vars():
    return pytree_config

@app.route('/')
def home(name=None):
    return render_template('home.html', name=name)


@app.route("/profile/get")
@cross_origin()
def get_profile():
    cpotree = point_clouds = pytree_config['vars']['cpotree_executable']

    point_clouds = pytree_config['vars']['pointclouds']

    polyline = request.args['coordinates']

    if polyline == '':
      return 'Empty coordinates'

    maxLevel = request.args['maxLOD']
    minLevel = request.args['minLOD']

    width = request.args['width']
    point_cloud = request.args['pointCloud']
    file = point_clouds[point_cloud]
    attributes = [request.args['attributes']]
    p = subprocess.Popen([cpotree, file, "--stdout"] + attributes + ["--coordinates", polyline, "--width", width, "--min-level", minLevel, "--max-level", maxLevel], bufsize=-1, stdout=subprocess.PIPE)

    [out, err] = p.communicate()

    return out


@app.route("/profile_v1/get")
@cross_origin()
def get_profile_gmf1():

    data_type = request.args['dataType']
    polyline = request.args['geom']
    callback_name = request.args['callback']
    intranet_code = request.args['code']
    point_cloud = point_clouds = pytree_config['vars']['default_point_cloud']

    cpotree = point_clouds = pytree_config['vars']['cpotree_executable']
    point_clouds = pytree_config['vars']['pointclouds']
    classes = pytree_config['vars']['classes_names_' + data_type]
    maxLevels = pytree_config['vars']['max_levels_gmf1']
    minLevel = str(pytree_config['vars']['minLOD'])
    log_folder = str(pytree_config['vars']['log_folder'])

    width = str(pytree_config['vars']['width'])

    series = []

    if polyline == '':
        return 'Error: empty linestring'
    else:
        coords = json.loads(polyline)["coordinates"]
        potreeGeom = ""
        mileage = 0
        for i in range(0,len(coords)):
            x = coords[i][0]
            y = coords[i][1]
            potreeGeom += '{' + str(x) + ',' + str(y) + '},'
            if i < len(coords)-1:
                xn = coords[i+1][0]
                yn = coords[i+1][1]
            mileage += math.sqrt((xn-x) * (xn-x) + (yn-y) * (yn-y))

        adaptativeLevel = 0
        for level in maxLevels:
            if mileage <= level and adaptativeLevel <= maxLevels[level]['max']:
                adaptativeLevel = maxLevels[level]['max']
 

        potreeGeom = potreeGeom[:-1]
    
    log_profiles(log_folder, coords)
    
    file = point_clouds[point_cloud]

    p = subprocess.Popen([cpotree, file, "--stdout"] + ["--coordinates", potreeGeom, "--width", width, "--min-level", minLevel, "--max-level", str(adaptativeLevel)], bufsize=-1, stdout=subprocess.PIPE)

    [out, err] = p.communicate()

    headerSize = struct.unpack('i', out[0:4])[0];
    header = out[4:4+headerSize].decode("ascii")
    buffer = out[4+headerSize:]
    try:
      jHeader = json.loads(header)
    except:  # reading an empty buffer will cause an error => return empty json
        jsonp = "/**/" + callback_name + "();"

        return jsonp

    numPoints = int(jHeader["points"])
    scale = float(jHeader["scale"])
    bytesPerPoint = int(jHeader["bytesPerPoint"])

    attributes = []
    for attribute in jHeader["pointAttributes"]:
        attributes.append(PointAttributes.fromName(attribute))

    jsonOutput=[]

    for i in range(numPoints):
        byteOffset = bytesPerPoint * i
        pbuffer = buffer[byteOffset:byteOffset + bytesPerPoint]

        aoffset = 0

        for attribute in attributes:

            if attribute == PointAttributes.POSITION_CARTESIAN:
                ux = struct.unpack('i', pbuffer[aoffset + 0: aoffset + 4])[0]
                uy = struct.unpack('i', pbuffer[aoffset + 4: aoffset + 8])[0]
                uz = struct.unpack('i', pbuffer[aoffset + 8: aoffset + 12])[0]
                x = ux * scale
                x = ux * scale + jHeader["boundingBox"]["lx"]
                y = uy * scale + jHeader["boundingBox"]["ly"]
                z = uz * scale + jHeader["boundingBox"]["lz"]
                alti = z

            elif attribute == PointAttributes.POSITION_PROJECTED_PROFILE:

                ux = struct.unpack('i', pbuffer[aoffset + 0: aoffset + 4])[0]
                dist = ux * scale

            elif attribute == PointAttributes.CLASSIFICATION:
                classif = struct.unpack('B', pbuffer[aoffset: aoffset + 1])[0]

            aoffset = aoffset + attribute.bytes

        if classif in classes:
            if classes[classif] not in series:
                series.append(classes[classif])
        else:
            classes.update({classif: pytree_config['vars']['undefined_class']})
            if classes[classif] not in series:
                series.append(classes[classif])

        jsonOutput.append({
            'dist': round(dist*100) / 100,
            'values': {
                classes[classif]: round(alti*100) / 100
            },
            'x': round(x*100)/100,
            'y': round(y*100)/100
        })

    jsonOutput = sorted(jsonOutput, key=lambda k: k['dist'])

    las_extractor_output =  {
    'profile': jsonOutput,
    'series': series,
    'csvId': '',
    'zRange': {
        'zMin': jHeader["boundingBox"]["lz"],
        'zMax': jHeader["boundingBox"]["uz"]
        }
    }

    jsonp = "/**/" + callback_name + "("
    jsonp += str(las_extractor_output)
    jsonp += ");"
    return jsonp


#proxy to gmf raster dem/dsm profile service
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

@app.route("/profile/config")
@cross_origin()
def profile_config_gmf2():

    vars = pytree_config['vars']

    vars.pop('cpotree_executable')
    vars.pop('pointclouds')
    vars.pop('log_folder')

    return jsonify(vars)

class PointAttribute:
    def __init__(s, name, elements, bytes):
        s.name = name
        s.elements = elements
        s.bytes = bytes

class PointAttributes:

    POSITION_CARTESIAN = PointAttribute("POSITION_CARTESIAN", 3, 12)
    POSITION_PROJECTED_PROFILE = PointAttribute("POSITION_PROJECTED_PROFILE", 2, 8)
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
