/***
@MS/POTREE 2017
cPotree outputs binary file:
    - the 4 first bytes is an integer that gives the length of the json header
    - the json header
    - A buffer containing the points
The buffers may contain following attributes encoded as described bellow
***/

PointAttributes = {};

PointAttributes.POSITION_CARTESIAN = {
    name: 'POSITION_CARTESIAN',
    elements: 3,
    bytes: 12
}

PointAttributes.POSITION_PROJECTED_PROFILE = {
    name: 'POSITION_PROJECTED_PROFILE',
    elements: 2,
    bytes: 8
}

PointAttributes.COLOR_PACKED = {
    name: 'COLOR_PACKED',
    elements: 4,
    bytes: 4
}

PointAttributes.RGB = {
    name: 'RGB',
    elements: 3,
    bytes: 3
}

PointAttributes.RGBA = {
    name: 'RGBA',
    elements: 4,
    bytes: 4
}

PointAttributes.INTENSITY = {
    name: 'INTENSITY',
    elements: 1,
    bytes: 2
}

PointAttributes.CLASSIFICATION = {
    name: 'CLASSIFICATION',
    elements: 1,
    bytes: 1
}