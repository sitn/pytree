/***
@SITN/OM 2017
***/
var generateDemDsm = function() {
    console.log("generateDemDsm");
    // read and sort points
    svg.selectAll("#line_js_dem").remove();
    svg.selectAll("#line_js_dsm").remove();
    let points = [];
    for (let i=0; i<profilePoints.distance.length; i++) {

        points.push({
            distance: profilePoints.distance[i],
            altitude: profilePoints.altitude[i],
            color_packed: profilePoints.color_packed[i],
            intensity: profilePoints.intensity[i],
            classification: profilePoints.classification[i]
        })

    }

    points.sort((a, b) => (a.distance - b.distance));

    // let step = 1;
    let startD = points[0].distance;
    let endD = points[points.length-1].distance;
    let range = endD - startD;
    let step =  range / (10* Math.log(points.length));
    let output = [];
    let mileage_left = 0;
    let mileage_right = 0;
    let increment = 0;
    let mileage = [];
    for (let i=0; i<points.length; i++) {

        if (mileage_right <= points[i].distance) {
            while (mileage_right <= points[i].distance) {
                mileage_left = mileage_right;
                mileage_right += step;
            }
            if(points[i].distance > mileage_left && points[i].distance <= mileage_right) {
                increment += 1;
            }
        }
        if (output[increment]===undefined) {
            output[increment] = {
                distanceDem: 0,
                dem: 1000000,
                distanceDsm: 0,
                dsm: -1
            }
        }
        mileage.push(mileage_left + ' - ' + mileage_right);
        if(points[i].distance > mileage_left && points[i].distance <= mileage_right) {
            if (output[increment].dem > points[i].altitude) {
                output[increment].dem = points[i].altitude;
                output[increment].distanceDem =  points[i].distance;
            }

            if (output[increment].dsm < points[i].altitude) {
                output[increment].dsm = points[i].altitude;
                output[increment].distanceDsm = points[i].distance;
            }

        }

    }
    let sx = plotParams.currentScaleX;
    let sy = plotParams.currentScaleY;
    for (let i=0; i<output.length-1;i++) {

        if (output[i] != undefined) {
            
            var line = d3.select("svg#profileSVG").append("line")
            .attr("id", "line_js_dsm")
            .attr("x1", sx(output[i].distanceDsm) + margin.left)
            .attr("y1", sy(output[i].dsm) + margin.top)
            .attr("x2", sx(output[i+1].distanceDsm) + margin.left)
            .attr("y2", sy(output[i+1].dsm) + margin.top)
            .attr("stroke-width", 1.5)
            .attr("stroke", "#a4f442");
        }

    }

}
