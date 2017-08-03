/***
Height measure toolbar
***/

var clearMeasure = function () {
    
    console.log("measure cleared")

    profileMeasure = {
        pStart: {
            set: false
        },
        pEnd: {
            set: false
        }
    };

    svg.selectAll("#text_m").remove();
    svg.selectAll("#start_m").remove();
    svg.selectAll("#end_m").remove();
    svg.selectAll("#line_m").remove();

    $('#height_measure').html("");

}

var startMeasure = function () {

    clearMeasure();
    d3.select("svg#profileSVG").on("click", measureHeight)

}

var stopMeasure = function () {

    clearMeasure();
    d3.select("svg#profileSVG").on("click", null)

}

var measureHeight = function () {

    var canvasCoordinates = d3.mouse(d3.select("#profileCanvas").node());
    var svgCoordinates = d3.mouse(this);
    var xs = svgCoordinates[0];
    var ys = svgCoordinates[1];
    var tolerance = 2; 
    let sx = plotParams.currentScaleX;
    let sy = plotParams.currentScaleY;
    var pointSize = 3;
    var p = getClosetPoint(profilePoints, canvasCoordinates[0], canvasCoordinates[1], tolerance);

    if (!profileMeasure.pStart.set) {
        if (p != undefined) {
            profileMeasure.pStart.distance = p.distance;
            profileMeasure.pStart.altitude = p.altitude;
            profileMeasure.pStart.cx = sx(p.distance ) + margin.left;
            profileMeasure.pStart.cy = sy(p.altitude) + margin.top;
        } else {
            profileMeasure.pStart.distance = sx.invert(xs);
            profileMeasure.pStart.altitude = sy.invert(ys);
            profileMeasure.pStart.cx = xs ;
            profileMeasure.pStart.cy = ys;
        }

        profileMeasure.pStart.set = true;
        
        var highlightCircle = d3.select("svg#profileSVG").append("circle")
        .attr("id", "start_m")
        .attr("cx", profileMeasure.pStart.cx)
        .attr("cy", profileMeasure.pStart.cy)
        .attr("r", pointSize)
        .style("fill", "red");


    } else if (!profileMeasure.pEnd.set){
        if (p != undefined) {
            profileMeasure.pEnd.distance = p.distance;
            profileMeasure.pEnd.altitude = p.altitude;
            profileMeasure.pEnd.cxEnd = sx(p.distance ) + margin.left;
            profileMeasure.pEnd.cyEnd = sy(p.altitude) + margin.top;
        } else {
            profileMeasure.pEnd.distance = sx.invert(xs);
            profileMeasure.pEnd.altitude = sy.invert(ys);
            profileMeasure.pEnd.cx = xs;
            profileMeasure.pEnd.cy = ys;
        }

        profileMeasure.pEnd.set = true;
        var highlightCircle = d3.select("svg#profileSVG").append("circle")
        .attr("id", "end_m")
        .attr("cx", profileMeasure.pEnd.cx)
        .attr("cy", profileMeasure.pEnd.cy)
        .attr("r", pointSize)
        .style("fill", "red");

        var line = d3.select("svg#profileSVG").append("line")
        .attr("id", "line_m")
        .attr("x1", profileMeasure.pStart.cx)
        .attr("y1", profileMeasure.pStart.cy)
        .attr("x2", profileMeasure.pEnd.cx)
        .attr("y2", profileMeasure.pEnd.cy)
        .attr("stroke-width", 2)
        .attr("stroke", "red");


    } else {
        startMeasure();

    }

    let dH = profileMeasure.pEnd.altitude-profileMeasure.pStart.altitude;
    let dD = profileMeasure.pEnd.distance-profileMeasure.pStart.distance;
    let height = Math.round(10 * Math.sqrt(Math.pow(dH,2) + Math.pow(dD,2)))/10;

    if (!isNaN(height)) {
        $('#height_measure').html('Hauteur: ' + height + '</p>');
        d3.select("svg#profileSVG").append("text")
        .attr("id", "text_m")
        .attr("x", 10 + (profileMeasure.pStart.cx + profileMeasure.pEnd.cx)/2)
        .attr("y", (profileMeasure.pStart.cy + profileMeasure.pEnd.cy)/2)
        .text( height + 'm')
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("fill", "red");
    }

}