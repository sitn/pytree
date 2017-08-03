/***
@SITN/OM 2017
Read client app config from server
***/

profileConfig = {};

var setClassActive = function(me) {
    profileConfig.classification[me.value].visible = me.checked;
    var ctx = d3.select("#profileCanvas")
    .node().getContext("2d");
    ctx.clearRect(0, 0, $('#profileCanvas').width(), $('#profileCanvas').height());
    drawPoints(profilePoints, $('#material').val(), plotParams.currentZoom);
}

var getProfileConfig = function (pytreeserver_url) {
    
    // Available point clouds
    $.ajax({
      url: pytreeserver_url + "/get_point_clouds",
    })
    .done(function(data) {
        profileConfig.pointclouds = data;
    });
    
    // Classification colors
    $.ajax({
      url: pytreeserver_url + "/get_classification_colors",
    })
    .done(function(data) {
        profileConfig.classification = data;
        var html = '';
        for (let i in data) {
            html += '<input checked type="checkbox" onchange="setClassActive(this);" value="'+ i +'">classe: '+  data[i].name
        }
        $('#classes').html(html);        
    });
    
    // Default material
    $.ajax({
      url: pytreeserver_url + "/get_default_material",
    })
    .done(function(data) {
        profileConfig.defautMaterial = data;
    });

}