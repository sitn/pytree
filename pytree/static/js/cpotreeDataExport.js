/***
Code adapted from Markus Schuetz @Potree
***/

var getPointsInProfileAsCSV = function (profilePoints) {
    console.log(profilePoints)
    if(profilePoints.distance.length === 0){
        console.log("no points in profile");
        return;
    }

    let file = "data:text/csv;charset=utf-8,";

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

    { // header-line
        let header = "";
        if(points[0].hasOwnProperty("x")){
            header += ", x";
        }
        if(points[0].hasOwnProperty("y")){
            header += ", y";
        }
        if(points[0].hasOwnProperty("distance")){
            header += ", distance";
        }
        if(points[0].hasOwnProperty("altitude")){
            header += ", altitude";
        }
        if(points[0].hasOwnProperty("color_packed")){
            header += ", r, g, b";
        }

        if(points[0].hasOwnProperty("intensity")){
            header += ", intensity";
        }

        if(points[0].hasOwnProperty("classification")){
            header += ", classification";
        }

        if(points[0].hasOwnProperty("numberOfReturns")){
            header += ", numberOfReturns";
        }

        if(points[0].hasOwnProperty("pointSourceID")){
            header += ", pointSourceID";
        }

        if(points[0].hasOwnProperty("returnNumber")){
            header += ", returnNumber";
        }
        file += header.substr(2) + "\n";
    }

    // actual data
    for(let point of points){
        let line = point.distance.toFixed(4) + ", ";
        line += point.altitude.toFixed(4) + ", ";

        if(point.hasOwnProperty("color_packed")){
            line += point.color_packed.join(", ");
        }

        if(point.hasOwnProperty("intensity")){
            line += ", " + point.intensity;
        }

        if(point.hasOwnProperty("classification")){
            line += ", " + point.classification;
        }

        if(point.hasOwnProperty("numberOfReturns")){
            line += ", " + point.numberOfReturns;
        }

        if(point.hasOwnProperty("pointSourceID")){
            line += ", " + point.pointSourceID;
        }

        if(point.hasOwnProperty("returnNumber")){
            line += ", " + point.returnNumber;
        }

        line += "\n";

        file = file + line;
    }

    var encodedUri = encodeURI(file);
    // window.open(encodedUri)
    downloadDataUrlFromJavascript("sitn_profile.csv", encodedUri);

}
