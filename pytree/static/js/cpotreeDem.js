/***
@SITN/OM 2017
Load DEM/DSM from gmf profile service and draw is as svg line overlay over the points data
***/

var getGmfProfile = function(nbPoints, coordinates, distanceOffset) {

    if (distanceOffset > 0) {
        svg.selectAll("#line_dem").remove();
        svg.selectAll("#line_dsm").remove();
    }

    let gmfurl = gmfServerUrl + "?";

    gmfurl += 'coord=' + coordinates;
    gmfurl += '&nbPoints=' + nbPoints;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', gmfurl, true);
    xhr.responseType = 'json';
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                drawDem(JSON.parse(xhr.response), distanceOffset);
            } else {
                console.log('Failed to load data! HTTP status: ' + xhr.status + ", file: " + gmfurl);
            }
        }
    };

    try {
        xhr.send(null);
    } catch(e) {
        console.log("Error: " + e);
    }
}

var drawDem = function(data, distanceOffset) {
    let d = data.profile;
    let sx = plotParams.currentScaleX;
    let sy = plotParams.currentScaleY;
    for (let i=0; i<d.length-1;i++) {
        var line = d3.select("svg#profileSVG").append("line")
        .attr("id", "line_dem")
        .attr("x1", sx(d[i].dist + distanceOffset) + margin.left)
        .attr("y1", sy(d[i].values.mnt) + margin.top)
        .attr("x2", sx(d[i+1].dist + distanceOffset) + margin.left)
        .attr("y2", sy(d[i+1].values.mnt) + margin.top)
        .attr("stroke-width", 1.5)
        .attr("stroke", "#41caf4");

        // var line = d3.select("svg#profileSVG").append("line")
        // .attr("id", "line_dsm")
        // .attr("x1", sx(d[i].dist + distanceOffset) + margin.left)
        // .attr("y1", sy(d[i].values.mns) + margin.top)
        // .attr("x2", sx(d[i+1].dist + distanceOffset) + margin.left)
        // .attr("y2", sy(d[i+1].values.mns) + margin.top)
        // .attr("stroke-width", 1.5)
        // .attr("stroke", "#a4f442");

    }
}
