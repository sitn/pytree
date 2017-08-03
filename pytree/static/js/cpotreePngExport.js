/***
Export chart to a png file
@SITN/OM 2017 Adapted from http://stackoverflow.com/questions/11567668/svg-to-canvas-with-d3-js
***/
var exportToImageFile= function (format) {

    let svg = d3.select("#profileSVG").node();

    let img = new Image();
    let serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svg);
    console.log(svgStr);
    img.onload = function() {

        let canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        let w = d3.select("#profileSVG").attr("width");
        let h = d3.select("#profileSVG").attr("height");
        canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,w,h);
        let pointsCanvas = d3.select('#profileCanvas').node();
        canvas.getContext("2d").drawImage(pointsCanvas,margin.left,margin.top,w - (margin.left + margin.right),h - (margin.top + margin.bottom));
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        let dataURL = canvas.toDataURL();
        downloadDataUrlFromJavascript("sitn_profile.png", dataURL);

    };

    img.src = "data:image/svg+xml;utf8," + svgStr;

}

