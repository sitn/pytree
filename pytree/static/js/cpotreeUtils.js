/***@SITN/OM 2017
Utility fonctions for LiDAR Profile
***/


/***
Transform cPotree linetring format into somehing more practical
***/
var getLinestring = function () {

    var linestringStr = $('#coordinates').val().replace(/{/g, '').replace(/}/g, '').split(',');
    var linestring = [];

    for (let j=0; j<linestringStr.length;j++) {
        linestring.push([parseFloat(linestringStr[j]), parseFloat(linestringStr[j+1])]);
        j+=1;
    }

    var lShifted = [];
    var distance = 0;
    for (let k=0; k<linestring.length - 1; k++) {
        var shiftedX = linestring[k+1][0]-linestring[k][0];
        var shiftedY = linestring[k+1][1]-linestring[k][1];

        var endDistance = distance + Math.sqrt(Math.pow(shiftedX,2) + Math.pow(shiftedY,2));

        lShifted.push({
            shiftedX: shiftedX,
            shiftedY: shiftedY,
            origX: linestring[k][0],
            origY: linestring[k][1],
            endX: linestring[k+1][0],
            endY: linestring[k+1][1],
            coeffA: shiftedY/shiftedX, 
            startD: distance,
            endD: endDistance
        });

        distance += Math.sqrt(Math.pow(shiftedX,2) + Math.pow(shiftedY,2));

    }
    return lShifted;
}

/***
Interpolate the 2D coodinate from a profile distance (=measure M)
***/
var interpolatePoint = function (d, segment) {
    var xLocal = Math.round(Math.sqrt(Math.pow(d,2)/(1 + Math.pow(segment.coeffA,2))));
    var yLocal = Math.round(segment.coeffA * xLocal);
    var x = xLocal + segment.origX;
    var y = yLocal + segment.origY;
    return [x,y]
}

/***
Clip a linestring to a given plot domain
***/
var clipLineByMeasure = function (dLeft, dRight) {

    var l = getLinestring();

    var clippedLine = [];
    for (let i in l) {
        var startPoint, endPoint;
        // Start point
        if (dLeft > l[i].startD && dLeft < l[i].endD) {
            clippedLine.push(interpolatePoint(dLeft, l[i]));
        } else if (dLeft <= l[i].startD && i==0) {
            clippedLine.push([l[i].origX, l[i].origY]);
        }
        if (dRight > l[i].startD && dRight < l[i].endD) {
            clippedLine.push(interpolatePoint(dRight, l[i]));
        } else if (dRight >= l[i].endD) {
            clippedLine.push([l[i].endX, l[i].endY]);
        }
    }

    return {
        clippedLine: clippedLine,
        distanceOffset: dLeft
    }

}

var getNiceLOD = function(span) {
    var maxLOD = 0;
    if (span < 200) {
        maxLOD = 12;
    } else if (span < 250) {
        maxLOD = 11;
    } else if (span < 500) {
        maxLOD = 10;
    } else if (span < 1000) {
        maxLOD = 9;
    } else if (span < 1500) {
        maxLOD = 8;
    } else if (span < 2000) {
        maxLOD = 7;
    }
    return maxLOD
}

var downloadDataUrlFromJavascript = function(filename, dataUrl) {

    // Construct the a element
    var link = document.createElement("a");
    link.download = filename;
    link.target = "_blank";

    // Construct the uri
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();

    // Cleanup the DOM
    document.body.removeChild(link);
    delete link;
}