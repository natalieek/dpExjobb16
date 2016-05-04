             // Taken from http://www.acuriousanimal.com/thebookofopenlayers3/chapter03_04_imagecanvas.html
                var canvasFunction = function(size,inFeature, inArray, inColors) {
                var canvas = document.createElement('canvas');
                canvas.id = 'someId';
                var context = canvas.getContext('2d');
                var canvasWidth = size[0], canvasHeight = size[1];
                canvas.setAttribute('width', 100);
                canvas.setAttribute('height', 100);
                var feat = inFeature;
                var colors = inColors
                var radius = 15;

                // Track the accumulated arcs drawn
                var totalArc = -90*Math.PI / 180;
                var percentToRadians = 1 / 100*360 *Math.PI / 180;
                var wedgeRadians;
                var coordinate = inFeature.getGeometry().getCoordinates();
                var data = inArray; //Placeholder
                
                function drawWedge(coordinate, percent, color) {
                    // Compute size of the wedge in radians
                    wedgeRadians = percent * percentToRadians;
                    // Draw
                    //context.save();
                    context.beginPath();
                    context.moveTo(50, 50);
                    context.arc(50, 50, radius, totalArc, totalArc + wedgeRadians, false);
                    context.closePath();
                    context.fillStyle = color;
                    
                    context.fill();
                    context.lineWidth = 0;
                    context.strokeStyle = '#666666';
                    //context.stroke();
                    context.restore();
                    
                    // Accumulate the size of wedges
                    totalArc += wedgeRadians;
                }
                var drawPie = function(coordinate, data, colors) {
                    for(var i=0;i<data.length;i++){
                      
                        drawWedge(coordinate,data[i],colors[i]);
                    }
                }
                drawPie(coordinate, data, colors);
                return canvas;            
            };
function styleFunc(feature) {
    console.log(feature)
    var size = feature.get('features').length;
    var inputFeatures = feature.get('features');
    var calleInput = _.map(inputFeatures, function(ol) {
      return ol.get('value');
    })
    
    var share_array = _.values(proportions(calleInput));
    var fixedColors = _.map(_.keys(proportions(calleInput)), function(x) {return colors[x]});
    
    var expCanvas = canvasFunction(map.getSize(), feature, share_array, fixedColors);    
    
      style =  new ol.style.Style({
        image: new ol.style.Icon(({
          img: expCanvas,
          imgSize: [100,100]
        })),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: '#66666'
          })
        })
    });
    
    return style;
  }