/***
@SITN/OM 2017
LiDAR profile from protreeViewer adapated for new d3 API after d3 4.0 API break
***/

/***
Draw the points to canvas
***/
var drawPoints = function(points, material, scale) {
    var pointSize = 2.5;
    if (scale != null) {
        pointSize = 0.75 * pointSize/scale;
    }
    var i = -1, n = points.distance.length, cx, cy

    while (++i < n) {

        let distance = points.distance[i];
        let altitude = points.altitude[i];
        let rgb = points.color_packed[i];
        let intensity = points.intensity[i];
        let classification = points.classification[i];

        if (profileConfig.classification[classification] && profileConfig.classification[classification].visible) {
            cx = scaleX(distance);
            cy = scaleY(altitude);
            context.beginPath();
            context.moveTo(cx, cy);
            if (material == 'COLOR_PACKED') {
                context.fillStyle = 'RGB(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
            } else if (material == 'INTENSITY') {
                context.fillStyle = 'RGB(' + intensity + ', ' + intensity + ', ' + intensity + ')';
            } else if (material == 'CLASSIFICATION') {
                context.fillStyle = 'RGB(' + profileConfig.classification[classification].color + ')';
            } else {
                context.fillStyle = 'RGB(' + 150 + ', ' + 150 + ', ' + 150 + ')';
            }
            context.fillRect(cx, cy, pointSize, pointSize);
        }

        if (points.classification.length == 0) {
          cx = scaleX(distance);
          cy = scaleY(altitude);
          context.beginPath();
          context.moveTo(cx, cy);
          context.fillStyle = 'RGB(255, 0, 0)';
          context.fillRect(cx, cy, pointSize, pointSize);

        }
    }
};

/***
Setup the d3 canvas & svg plot
***/
setupPlot = function (rangeX, rangeY) {

    margin = {
        'left': 40,
        'top': 10,
        'right': 10,
        'bottom': 40
    }

    var containerWidth = $('#profile_draw_container').width();
    var containerHeight = $('#profile_draw_container').height();
    var width = containerWidth - (margin.left + margin.right);
    var height = containerHeight - (margin.top + margin.bottom);

    var domainProfileWidth = rangeX[1] - rangeX[0];
    var domainProfileHeight = rangeY[1] - rangeY[0];

    var domainRatio = domainProfileWidth / domainProfileHeight;
    var rangeProfileWidth = width;
    var rangeProfileHeight = height;
    var rangeRatio = rangeProfileWidth / rangeProfileHeight;

    if(domainRatio < rangeRatio){
        var targetWidth = domainProfileWidth * (rangeProfileHeight / domainProfileHeight);
        // scale
        var domainScale = rangeRatio / domainRatio;
        var domainScaledWidth = domainProfileWidth * domainScale;
        scaleX = d3.scaleLinear()
            .domain([
                domainProfileWidth / 2 - domainScaledWidth / 2 ,
                domainProfileWidth / 2 + domainScaledWidth / 2 ])
            .range([0, width]);
        scaleY = d3.scaleLinear()
            .domain(rangeY)
            .range([height, 0]);
    } else {

        var targetHeight = domainProfileHeight* (rangeProfileWidth / domainProfileWidth);
        var domainScale =  domainRatio / rangeRatio;
        var domainScaledHeight = domainProfileHeight * domainScale;
        var domainHeightCentroid = (rangeY[1] + rangeY[0]) / 2;
        scaleX = d3.scaleLinear()
            .domain(rangeX)
            .range([0, width]);
        scaleY = d3.scaleLinear()
            .domain([
                domainHeightCentroid - domainScaledHeight / 2 ,
                domainHeightCentroid + domainScaledHeight / 2 ])
            .range([height, 0]);
    }
    plotParams.currentScaleX = scaleX;
    plotParams.currentScaleY = scaleY;
    var zoom  = d3.zoom();
    function zoomed() {
        var ctx = d3.select("#profileCanvas")
        .attr("width", width)
        .attr("height", height)
        .node().getContext("2d");
        var tr = d3.event.transform;
        ctx.translate(tr.x, tr.y);
        ctx.scale(tr.k, tr.k);
        ctx.clearRect(0, 0, width, height);
        svg.select("canvas").attr("transform", tr);
        svg.select(".x.axis").call(xAxis.scale(tr.rescaleX(scaleX)));
        svg.select(".y.axis").call(yAxis.scale(tr.rescaleY(scaleY)));
        plotParams.currentZoom = tr.k;
        plotParams.currentScaleX = tr.rescaleX(scaleX);
        plotParams.currentScaleY = tr.rescaleY(scaleY);
        d3.select("g.y.axis").selectAll("g.tick line")
        .style("opacity", "0.5")
        .style("stroke", "#d8d8d8")
        clearMeasure();

    }

    d3.select("svg#profileSVG").call(zoom.on("zoom", zoomed));
    d3.select("svg#profileSVG").call(zoom.on("end", loadDeeperLOD));
    // handle d3 event mess
    d3.select("svg#profileSVG").call(zoom.on("start", function(){
        mousePositionStart = d3.mouse(this);
    }));


    context = d3.select("#profileCanvas")
        .attr("width", width )
        .attr("height", height)
        .node().getContext("2d");


    d3.select("#profileCanvas")
        .style("left", margin.left)
        .style("bottom", margin.bottom)
        .style("background-color", "black")
        .style("position", "absolute");

    d3.select("svg#profileSVG").selectAll("*").remove();

    svg = d3.select("svg#profileSVG")
    .attr("width", (width + margin.left + margin.right).toString())
    .attr("height", (height + margin.top + margin.bottom).toString())
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    d3.select("svg#profileSVG")
    .on("mousemove", pointHighlight);

    // Create x axis
    var xAxis = d3.axisBottom(scaleX)
    // Create y axis
    var yAxis = d3.axisLeft(scaleY)
    .tickSize(-width);

    // d3.select("g.y.axis").selectAll("g.tick line").attr("stroke", "#d8d8d8");
    d3.select("g.y.axis").selectAll("g.tick line").style("stroke", "#d8d8d8");
    // Append axis to the chart
    var gx = svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.select(".y.axis").attr("transform", "translate("+ (margin.left).toString() + "," + margin.top.toString() + ")");
    svg.select(".x.axis").attr("transform", "translate(" + margin.left.toString() + "," + (height + margin.top).toString() + ")");

    d3.select("g.y.axis").selectAll("g.tick line")
    .style("opacity", "0.5")
    .style("stroke", "#d8d8d8");

};

/***
Find the closest neighboor of the mouse coordinates within tolerance
***/
var getClosetPoint = function (points, xs,ys,tolerance) {
    let d = points;
    let tol = tolerance;
    let sx = plotParams.currentScaleX;
    let sy = plotParams.currentScaleY;
    let distances = [];
    let hP = [];

    for (let i=0; i < d.distance.length; i++){
        if(sx(d.distance[i]) < xs + tol && sx(d.distance[i]) > xs - tol && sy(d.altitude[i]) < ys + tol && sy(d.altitude[i]) > ys -tol){

            let pDistance =  Math.sqrt(Math.pow((sx(d.distance[i]) - xs), 2) + Math.pow((sy(d.altitude[i]) - ys), 2));

            hP.push({
                distance: d.distance[i],
                altitude: d.altitude[i],
                classification: d.classification[i],
                color_packed: d.color_packed[i],
                intensity: d.intensity[i],
            });
            distances.push(pDistance);
        }
    }

    let closestPoint;

    if (hP.length > 0) {
        let minDist = Math.min(distances);
        let indexMin = distances.indexOf(minDist);
        if (indexMin != -1) {
            closestPoint = hP[indexMin];
        } else {
            closestPoint = hP[0];
        }
    }
    return closestPoint;
}

/***
Find the closest neighboor of the mouse coordinates within tolerance
***/
pointHighlight = function () {

    var pointSize = 2;

    var canvasCoordinates = d3.mouse(d3.select("#profileCanvas").node());
    var svgCoordinates = d3.mouse(this);
    var xs = svgCoordinates[0];
    var ys = svgCoordinates[1];
    var tolerance = 5;
    let sx = plotParams.currentScaleX;
    let sy = plotParams.currentScaleY;

    var p = getClosetPoint(profilePoints, canvasCoordinates[0], canvasCoordinates[1], tolerance);
    if (p != undefined) {

        cx = sx(p.distance ) + margin.left;
        cy = sy(p.altitude) + margin.top;

        svg.selectAll("#highlightCircle").remove();

        var highlightCircle = d3.select("svg#profileSVG").append("circle")
        .attr("id", "highlightCircle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", pointSize)
        .style("fill", "orange");

        var html = 'distance: ' + Math.round(10 * p.distance) / 10 + ' alti: ' + Math.round( 10 * p.altitude) / 10 + '  -  ';
        if (profileConfig.classification[p.classification]) {
            html += "Classification: " + profileConfig.classification[p.classification].name + '  -  ';
        }


        html += "Intensity: " + p.intensity;

        $('#profileInfo').css('color', 'orange');
        $('#profileInfo').html(html);

    } else {
        svg.select("#highlightCircle").remove();
    }
};

var arrayMax = function (array) {
  return array.reduce((a, b) => Math.max(a, b));
}

var arrayMin = function (array) {
  return array.reduce((a, b) => Math.min(a, b));
}

var changeStyle = function(material) {
    var ctx = d3.select("#profileCanvas")
    .node().getContext("2d");
    ctx.clearRect(0, 0, $('#profileCanvas').width(), $('#profileCanvas').height());
    drawPoints(profilePoints, material, plotParams.currentZoom);
}
