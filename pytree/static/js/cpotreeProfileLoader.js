/***
@MS/POTREE 2017
Process the pytree/cpotree output
***/

// Global object storing the data of the entire profile
profilePoints = {};
profilePoints.distance = [];
profilePoints.altitude = [];
profilePoints.color_packed = [];
profilePoints.intensity = [];
profilePoints.classification = [];

plotParams = {};
plotParams.currentScaleX = {};
plotParams.currentScaleY = {};
plotParams.currentZoom = 1;

var processBuffer = function (profile, iter, distanceOffset, clearPlot, lastLOD) {

    try {
        // ***Get header size***
        var typedArrayInt32 = new Int32Array(profile, 0,4);
        var headerSize = typedArrayInt32[0];

        // ***Get JSON header content***
        var uInt8header = new Uint8Array(profile, 4, headerSize);
        var strHeaderLocal = '';
        for (var i =0; i < uInt8header.length; i++) {
            strHeaderLocal += String.fromCharCode(uInt8header[i]);
        }

        var jHeader = JSON.parse(strHeaderLocal);

        var attr = jHeader.pointAttributes;
        var attributes = [];
        for (var j=0; j<attr.length; j++){
            if (PointAttributes[attr[j]] != undefined){
                attributes.push(PointAttributes[attr[j]]);
            }
        }

        // ***Get points from buffer ***
        var points = {};
        var scale = jHeader.scale;
        points.distance = [];
        points.altitude = [];
        points.classification = [];
        points.intensity = [];
        points.color_packed = [];
        var bytesPerPoint = jHeader.bytesPerPoint;
        var buffer = profile.slice(4 + headerSize);
        for (let i = 0; i < jHeader.points; i++) {

            let byteOffset = bytesPerPoint * i;
            let view = new DataView(buffer, byteOffset, bytesPerPoint);
            let aoffset = 0;
            for(let k=0; k<attributes.length; k++) {

                let attribute = attributes[k];

                if (attribute.name == "POSITION_PROJECTED_PROFILE") {

                    let ux = view.getUint32(aoffset, true);
                    let uy = view.getUint32(aoffset + 4, true);
                    let x = ux * scale;
                    let y = uy * scale;
                    points.distance.push(Math.round(100 * (distanceOffset + x))/100);
                    points.altitude.push(Math.round(100 * y)/100);
                    profilePoints.distance.push(Math.round(100 * (distanceOffset + x))/100);
                    profilePoints.altitude.push(Math.round(100 * y)/100);

                } else if (attribute.name == 'CLASSIFICATION') {

                    let classif = view.getUint8(aoffset, true);
                    points.classification.push(classif);
                    profilePoints.classification.push(classif);

                } else if (attribute.name == 'INTENSITY') {
                    let intensity = view.getUint16(aoffset, true);
                    points.intensity.push(intensity);
                    profilePoints.intensity.push(intensity);
                } else if (attribute.name == 'COLOR_PACKED') {
                    let r = view.getUint8(aoffset, true);
                    let g = view.getUint8(aoffset + 1, true);
                    let b = view.getUint8(aoffset + 2, true);
                    points.color_packed.push([r, g, b]);
                    profilePoints.color_packed.push([r, g, b]);
                }
                aoffset = aoffset + attribute.bytes;
            }
        }

        if (clearPlot) {
            var ctx = d3.select("#profileCanvas")
            .node().getContext("2d");
            ctx.clearRect(0, 0, $('#profileCanvas').width(), $('#profileCanvas').height());
        }
        // draw this LOD
        if (iter == 0) {
            var rangeX = [arrayMin(points.distance), arrayMax(points.distance)];
            var rangeY = [arrayMin(points.altitude), arrayMax(points.altitude)];
            setupPlot(rangeX, rangeY);
            drawPoints(points, $('#material').val(), plotParams.currentZoom);
        } else {
            var rangeX = [arrayMin(points.distance), arrayMax(points.distance)];
            var rangeY = [arrayMin(points.altitude), arrayMax(points.altitude)];
            // setupPlot(rangeX, rangeY);
            drawPoints(points, $('#material').val(), plotParams.currentZoom);
        }

        if (lastLOD) {
            generateDemDsm();
        }

    } catch (e) {
        console.log("error during buffer processing: " + e);
    }

}

/*
* Sends request to pytree/cpotree
*/
var xhrRequest = function(method, minLOD, maxLOD, iter, coordinates, distanceOffset, clearPlot, lastLOD) {

    var hurl = pytreeServerUrl + "/get_profile?minLOD=" + minLOD + "&maxLOD=" + maxLOD;
    hurl += "&width=" + $('#width').val() + "&coordinates=" + coordinates;
    hurl += "&pointCloud=" + $('#pointCloud').val();
    hurl += "&attributes=" + $('#attributes').val();
    console.log(hurl);
    var xhr = new XMLHttpRequest();
    xhr.open(method, hurl, true);
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                processBuffer(xhr.response, iter, distanceOffset, clearPlot, lastLOD);
            } else {
                console.log('Failed to load data! HTTP status: ' + xhr.status + ", file: " + url);
            }
        }
    };
    try {
        xhr.send(null);
    } catch(e) {
        console.log("Error: " + e);
    }
}

/***
Load deeper load for limited domain
***/
var loadDeeperLOD = function () {

    // reload only of mouse position changed

    var domain = plotParams.currentScaleX.domain();
    var clip = clipLineByMeasure(domain[0], domain[1]);
    var line = clip.clippedLine;
    // create the line String as taken by cpotree
    var cPotreeLineStr = '';
    for (let i in line) {
        cPotreeLineStr += '{' + line[i][0] + ',' + line[i][1] + '},';
    }
    cPotreeLineStr = cPotreeLineStr.substr(0,cPotreeLineStr.length-1);
    var minLOD = 0;
    var maxLOD = 6;

    var span = domain[1] - domain[0];

    var niceLOD = getNiceLOD(span);

    // Load gmf dem/dsm from gmf webservice
    if (d3.select('#demdsm').node().checked){
        getGmfProfile(100, line, clip.distanceOffset);
    } else {
        svg.selectAll("#line_dem").remove();
        svg.selectAll("#line_dsm").remove();
    }
    if (parseInt($('#maxLOD').val()) >= niceLOD) {
        drawPoints(profilePoints, $('#material').val(), plotParams.currentZoom);
        console.log("no loading required")
        return;
    } else {

        profilePoints = {};
        profilePoints.distance = [];
        profilePoints.altitude = [];
        profilePoints.color_packed = [];
        profilePoints.intensity = [];
        profilePoints.classification = [];

        console.log("loading additionnal LOD");
        var m = d3.mouse(this);
        if (mousePositionStart[0] !==  m[0] && mousePositionStart[1] !== m[1]){
            xhrRequest('GET', 0, niceLOD, 100, cPotreeLineStr, clip.distanceOffset, true, true);
        }

    }

}
