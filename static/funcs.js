//Visual settings for el 
var gas = {
 'connection': new ol.style.Style({
  image: new ol.style.Circle({
   fill: new ol.style.Fill({
    color: '#D500F9'
  }),
   radius: 5
 })
}),
 'arc': new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#D500F9',
    width: 2
  })
}),
 'node': new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0e7 ',
    font: 'normal 35px FontAwesome',
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: '#D500F9',
    })
  })   
})};
   //Visual settings for heating
   var heating = {
     'connection': new ol.style.Style({
      image: new ol.style.Circle({
       fill: new ol.style.Fill({
        color: 'black'
      }),
       radius: 5
     })
    }),

     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        lineDash: [5,1,5],
        width: 2
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7',
        font: 'normal 35px FontAwesome',
        textBaseline: 'Bottom',
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 8}),
        fill: new ol.style.Fill({
          color: 'black',
        })
      })   
     })};

     var brokenHeating = {
       'connection': new ol.style.Style({
        image: new ol.style.Circle({
         fill: new ol.style.Fill({
          color: 'black'
        }),
         radius: 5,
         stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 10})
       })
      }),

       'arc': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'black',
          lineDash: [5,1,5],
          width: 4
        })
      }),
       'node': new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf0e7',
          font: 'normal 35px FontAwesome',
          textBaseline: 'Bottom',
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 140, 0, 0.6)',
            width: 8}),
          fill: new ol.style.Fill({
            color: 'black',
          })
        })   
       })};

   //Visual settings for water
   var water = {
     'connection': new ol.style.Style({
      image: new ol.style.Circle({
       fill: new ol.style.Fill({
        color: '#2196F3'
      }),
       radius: 5
     })
    }),
     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#2196F3',
        lineDash: [5,5],
        width: 3
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7 ',
        font: 'normal 35px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: '#2196F3'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 8}),
      })   
     })};

     var brokenWater = {
       'connection': new ol.style.Style({
        image: new ol.style.Circle({
         fill: new ol.style.Fill({
          color: '#2196F3'
        }),
         radius: 5,
         stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 10})
       })
      }),
       'arc': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#2196F3',
          lineDash: [8,8],
          width: 4
        })
      }),
       'node': new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf0e7 ',
          font: 'normal 35px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: '#2196F3'}),
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 140, 0, 0.6)',
            width: 8}),
        })   
       })};

       var customerStyle = new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf007',
          font: 'normal 20px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: 'pink',
          })
        })   
       })

       var styles = {'heating':heating, 'gas':gas, 'water':water}
       var brokenStyles = {'heating':brokenHeating, 'water':brokenWater}

   //Takes the type of network and the object to visualize as input.
   var styleFunction = function(visualize, network_type, broken) {
    if(broken==true){
      return brokenStyles[network_type][visualize];
    }else{
      return styles[network_type][visualize];
    }
    
  };

  //Makes HTTP-request to the file, via the python http server.
  //Python http-server is started with: python -m http.server
  function makeRequest (method, url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  //Object containing the combinations of linetypes. Does not include the small link into the house for the water networks.
  var linetypes = {
    'gas': {'big':{'otyp':928000, 'subtyp':80},'main':{'otyp':928000, 'subtyp':1}, 'small':{'otyp':901000, 'subtyp':1}},
    'heating':{'big':{'otyp':602000, 'subtyp':1},'main':{'otyp':602000, 'subtyp':3}, 'small':{'otyp':602000, 'subtyp':4}},
    'water':{'big':{'otyp':808000, 'subtyp':12},'main':{'otyp':808000, 'subtyp':6}, 'small':{'otyp':808000, 'subtyp':2}}
  }
  //"el" aka el

  var pointColors = {
    '933000':{'type':'gas','color':'#006f00'}, '606000':{'type':'heating','color':'#000000'}, 
    '890400':{'type':'water','color':'#0066ff'}, '614000':{'type':'heating','color':'#ff69b4'},
    '804000':{'type':'water','color':'#0066ff'}, '934000':{'type':'gas','color':'#00FF00'},
    '112233':{'type':'installation','color':'#FFC107', 'icon':'\uf1e6', 'rotation':0}, 
    '123123':{'type':'reparation','color':'#FF5722', 'icon':'\uf0ad','rotation':3*Math.PI/2},
    '333333':{'type':'customer','color':'pink', 'icon':'\uf007','rotation':3*Math.PI/2}
  }

  var lineColors = {
    '901000':{'type':'gas','color':'#006f00'}, '602000':{'type':'heating','color':'#000000'}, 
    '808000':{'type':'water','color':'#0066ff'},'901000':{'type':'gas','color':'#006f00'},
  }

  var iconSizes = {
    1:'normal 20px FontAwesome',2:'normal 30px FontAwesome', 3:'normal 30px FontAwesome', 4:'normal 30px FontAwesome', 5:'normal 30px FontAwesome', 6:'normal 35px FontAwesome',7:'normal 35px FontAwesome', 8:'normal 35px FontAwesome', 9:'normal 35px FontAwesome', 10:'normal 35px FontAwesome'
  }

  init = function() {
  //Requests from all the different text files.
  //To be implemeted: somehow group them together already in the requests-phase.
  requests = {'gasArc':
  makeRequest('GET', '/arc/gas_arcs'),
  'gasNode':
  makeRequest('GET', '/node/gas_arcs_vertices_pgr'),
  'heatArc':
  makeRequest('GET', '/arc/heat_arcs'),
  'heatNode':
  makeRequest('GET', '/node/heat_nodes'),
  'waterArc':
  makeRequest('GET', '/arc/vatten_arc'),
  'waterNode':
  makeRequest('GET', '/node/vatten_arc_vertices_pgr'),
  'heatConn':
  makeRequest('GET', '/conn/heat_cust'),
  'gasConn':
  makeRequest('GET', '/conn/gas_cust'),
  'waterConn':
  makeRequest('GET', '/conn/vatten_cust'),
  'heatmap': 
  makeRequest('GET', '/heatmap'),
  'repairs': 
  makeRequest('GET', '/repairs'),
  'installations': 
  makeRequest('GET', '/installations'),
  'customers': 
  makeRequest('GET', '/customers')
}
Promise
.props(requests)
.then(function(responses) {
  $(function () {
    $('[data-toggle="popover"]').popover()
  })
  layers = {'Arcs': [], 'Nodes': [], 'Connections':[], 'Networks':[], 'Data':[], 'Types':['gas', 'heating', 'water'], 'Clusters':[]}
  layerGroups = [];
  inLayers = {'Arcs': [responses.gasArc, responses.heatArc, responses.waterArc], 'Nodes': [responses.gasNode, responses.heatNode, responses.waterNode], 'Connections':[responses.gasConn, responses.heatConn, responses.waterConn]}
    //inLayers = {'Arcs':responses.Arcs, 'Nodes':responses.Nodes, 'Connections':responses.Connections}
    connection = [] 
    data = []
    network = []
    workLayers = []
    //For each "network type"(nyttighet): creates the data, creates the network, creates connections and adds the layers.
    for (var i = 0; i < layers.Types.length; i++) {
      data.push(dataMaker(inLayers.Arcs[i], inLayers.Nodes[i]));
      //console.log(data[i].arcSource.getFeatures(), 'data')
      network.push(networkMaker(data[i].arcSource.getFeatures(), data[i].nodeSource.getFeatures()));
      layers.Data.push(data[i]);
      //console.log(layers.Data[i].arcSource.getFeatures(), 'lagerdata')
      layers.Networks.push(network[i]);
      connection.push(connectionMaker(inLayers.Connections[i]));
      layerMaker(data[i],layers,connection[i], layers.Types[i], false,false,false, layerGroups, layers.Types[i]+'_Full', false);
      //Stores the raw data
    }
    heatmap = heatmapMaker(responses.heatmap)
    customers = customerMaker(responses.customers)
    workLayers.push(workCluster(responses.repairs, 'Pågående Reparationer', true, workStyler))
    workLayers.push(workCluster(responses.installations, 'Pågående Installationer', true, workStyler))
    
    map = mapMaker(layerGroups, layers, heatmap, workLayers, customers);   
  })
.catch(function (err) {
  console.error('Augh, there was an error!', err.statusText);
  console.error(err);
});
};


//Creates OL-sources and fills them with freshly read json
function dataMaker(json_arc, json_node){
  var arcSource_in = new ol.source.Vector()
  var nodeSource_in = new ol.source.Vector()
  //console.log(JSON.parse(json_arc), 'jsarc')
  arcSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_arc)))
  nodeSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_node)))
  return {'arcSource': arcSource_in, 'nodeSource':nodeSource_in}
}

//Creates source object and fills it with connections from the json
function connectionMaker(json_connections){
  var connSource_in = new ol.source.Vector()
  connSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_connections)))
  return {'connSource': connSource_in}
}


function networkMaker(inArc, inNode){
  return {'arcArray': inArc, 'nodeArray':inNode}
}

swe_eng = {'full':{
  'water': {'title':'Vattennät', 'arc': 'Ledningar', 'conn': 'Anslutningar'},
  'gas': {'title':'Gasnät','arc':'Ledningar', 'conn':'Anslutningar' },
  'heating': {'title':'Fjärrvärmenät','arc':'Ledningar','conn':'Anslutningar' }},
  'broken':{
    'water': {'title':'Avbrott: Vatten','node': 'Trasig nod: '},
    'gas': {'title': 'Avbrott: Gas','node':'Trasig nod:'},
    'heating': {'title':'Avbrott: Fjärrvärme', 'node':'Trasig nod: ' }}}

// Creates the layers and sets the styles determining the visualization
function layerMaker(data,layers,connection,network,showArc, showNode, showConn,layerGroups,title,bool_broken){

  broken = ''
  if(bool_broken===true){
    broken = 'broken'
  } else{
    broken = 'full'
  }
  tmpArc = new ol.layer.Vector({
    source: data.arcSource,
    style: styleFunction('arc', network, bool_broken),
    visible: showArc,
    network: network,
    title: swe_eng['full'][network]['arc'],
    type: 'arc'
  })

  tmpNode = new ol.layer.Vector({
    source: data.nodeSource,
    style: styleFunction('node', network, bool_broken),
    visible: showNode,
    network: network,
    title: swe_eng[broken][network]['node']+title,
    type: 'node'
  })

  if(bool_broken===false){
    tmpNode.unset('title')
  }
  tmpConn = new ol.layer.Vector({
    source: connection.connSource,
    style: styleFunction('connection',network, bool_broken),
    visible: showConn,
    title: swe_eng['full'][network]['conn'],
    network: network,
    type: 'conn'
  })
  layerGroups.push(new ol.layer.Group({
    'title': swe_eng[broken][network]['title'],
    layers: [tmpArc, tmpNode, tmpConn]
  }))
  layers.Arcs.push(tmpArc)
  layers.Nodes.push(tmpNode)
  layers.Connections.push(tmpConn)
  //If multiple clusters, add clustering vector creation here
}

function workCluster(responses, title, visibility, styleF){
  var workSource = new ol.source.Vector()
  workSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  var clusterSource = new ol.source.Cluster({
    distance: 100,
    source: workSource
  });

  var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    title: title,
    style: styleF,
    visible: true,
    type: 'cluster'
  });
  if(workSource.getFeatures()[0].get("dp_otype")===112233){
    $('#numInstalls').text('Installationer: '+workSource.getFeatures().length);
  }else if(workSource.getFeatures()[0].get("dp_otype")===123123){
    $('#numRepairs').text('Reparationer: '+workSource.getFeatures().length);
  }
  return clusterLayer
}

function brokenCluster(inConn, visibility, inGroup, styleF){
  var clusterSource = new ol.source.Cluster({
    distance: 2000,
    source: inConn
  });

  //console.log(clusterSource)
  //If single cluster creation, keep this layer creation
  var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    title: 'Cluster',
    style: styleF,
    visible: true,
    type: 'cluster'
  });
  inGroup.get("layers").push(clusterLayer)
  layers.Clusters.push(clusterLayer)
}

function polyMaker(feature) {
  var parser = new jsts.io.OL3Parser();
  var tmpgeom = _.map(feature.get('features'), function(num){
    return num.getGeometry().getCoordinates();
  }) 
  var newGeom = new ol.geom.MultiPoint(tmpgeom)
  var jstsGeom = parser.read(newGeom);
  var convexHull = jstsGeom.convexHull();
  var size = feature.get('features').length;
  data = _.countBy(_.map(feature.get('features'), function(num){
    return num.get('dp_otype')
  }), _.identity);
  var color = _.flatten(_.map(data, function(num, key){
    return pointColors[key].color
  }))
  style =  new ol.style.Style({
    geometry: parser.write(convexHull),
    text: new ol.style.Text({
      text: size.toString(),
      fill: new ol.style.Fill({
        color: '#ffffff'
      })
    }),
    fill: new ol.style.Fill({
      color: hexToRgbA(color.toString())

    })
  })
  return style;
}


function hexToRgbA(hex){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.3)';
  }
  throw new Error('Bad Hex');
}

// Creates the final map, along with two mouse events.
// To-do: Set correct data on load.
function mapMaker(inGroups, inLayers, heatmap, workLayers, customers){
  proj4.defs("EPSG:3006","+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  var myProjection = ol.proj.get('EPSG:3006');
  var raster = new ol.layer.Tile({  
    type:'base',
    title:'Bakgrund', 
    source: new ol.source.XYZ({
      tileSize: [512, 512],
      url: 'https://api.mapbox.com/styles/v1/fhilding/cin084lbc004mc9maksu66pyt/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmhpbGRpbmciLCJhIjoiY2luMDgyMXB3MDBubXY5bHlsZ3d0NXpuMCJ9.YzM1KUyixi_b2Vl1CF0e2g',
      crossOrigin: 'anonymous'
    })
  });
  var osm_bg =  new ol.layer.Tile({
      source: new ol.source.OSM(),
      type:'base',
      title:'Bakgrund OSM'
    })
  
  var basemap = new ol.layer.Group({ 'title': 'Basemap', layers: [raster, osm_bg]})

  var heatmapGroup = new ol.layer.Group({ 'title': 'Gamla Avbrott', layers: [heatmap]})
  var repairsGroup = new ol.layer.Group({ 'title': 'Pågående aktiviteter', layers: workLayers})
  var customerGroup = new ol.layer.Group({ 'title': 'Kunder', layers: [customers]})
  ol.proj.addProjection(myProjection);
  var map = new ol.Map({
    layers: _.flatten([basemap, heatmapGroup, inGroups, customerGroup, repairsGroup]),
    target: 'map',
    interactions : ol.interaction.defaults({doubleClickZoom :false}).extend([new ol.interaction.MouseWheelZoom({duration :500})]),
    view: new ol.View({
      center: [670162.497556056,6579305.28607494],
      resolution: 10,
      projection: myProjection,
      resolutions: [7.5,5,4,3,2,1.5,1,0.5,0.25]

    })
  });
  var element = document.getElementById('popup');
  var popup = new ol.Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false
  });
  map.addOverlay(popup);

  var layerSwitcher = new ol.control.LayerSwitcher({target: 'bg1',
        tipLabel: 'Legend' // Optional label for button
      });
  map.addControl(layerSwitcher);

  //To extract info about what you click on
  map.on('singleclick', function(evt) {                         
    console.log(map.getView().getResolution());
    var feature = map.forEachFeatureAtPixel(evt.pixel,
     function(feature, layer) {
      popupMaker(feature,popup)
    });                                                         
  });

  map.getLayers().forEach(function(layerGroup) {
    if(layerGroup.getLayers().getArray()[0] instanceof ol.layer.Vector){      
      _.each(layerGroup.getLayers().getArray(), function(layer){
        if(layer.get("type")==='node'){
          bindNodeInputs(layer, inLayers, map, inGroups, customers);
        }
      })
    }
  }); 

  map.on('dblclick', function(evt) {    
    var networkType = map.forEachLayerAtPixel(evt.pixel,
     function(layer) {
      if(layer instanceof ol.layer.Vector){
        deleteLayers(inLayers, layer, map, inGroups)
      }
    },null, function(layer) {
      return _.contains(inLayers.Arcs, layer);
    });
  }); 
  //UPDATE heat_nodes SET gid=post.id FROM heat_arcs_vertices_pgr post WHERE ST_intersects(heat_nodes.the_geom, ST_Buffer(post.the_geom,0.5))
  //When zooming, re-assesses what data to show, depending on the current resolution.
  map.getView().on('change:resolution', function(e) {
    console.log(e.oldValue);
    var cur_res = e.target.get('resolution');
    var restraints = resolutionEvaluator(cur_res,inLayers);
    trimData(restraints, inLayers, inGroups);
    $(element).popover('destroy');
  });

  map.on('pointermove', function(e) {
    if (e.dragging) {
      $(element).popover('destroy');
      return;
    }
  });

}

var pointTexts = {
  '606000':{'type':'fjärrvärmenät','body':'Heatinganslutning', 'title':'Fjärrvärmenät'}, 
  '890400':{'type':'vattennät','body':'Vattenanslutning', 'title':'Vattennät'},
  '804000':{'type':'vattennod','body':'Vattennod', 'title':'Avbrott i vattennät'},
  '933000':{'type':'gasnod','body':'Gasnod', 'title':'Avbrott i gasnät'},
  '800004':{'type':'fjärrvärmenod','body':'Fjärrvärmenod', 'title':'Avbrott i fjärrvärmenät'},
  '934000':{'type':'gasnät','body':'Gasanslutning', 'title':'Gasnät'},
  '112233':{'type':'installation','body':'#3F51B5', 'title':'Installation'}, 
  '123123':{'type':'reparation','body':'#EC407A', 'title':'Reparation'},
  '333333':{'type':'kund','body':'pink', 'title':'Kund'}
}


var lineTexts = {
  '901000':{'type':'gas','title':'Gas'}, '602000':{'type':'fjärrvärme','title':'Fjärrvärme'}, 
  '808000':{'type':'vatten','title':'Vatten'},'901000':{'type':'gas','title':'Gas'},
}


//'703000':['el','#006f00'], '606000':['heating','#000000'], '890400':['water','#0066ff']
function popupMaker(feature,popup){

  var coord
  var title = "2"
  var content = "1"
  //If polygon
  
  if(typeof feature.get('features') != 'undefined' && feature.get('features').length > 1){
    data = _.countBy(_.map(feature.get('features'), function(num){
      return num.get('dp_otype')
    }), _.identity);
    key = _.keys(data)[0]
    count = _.values(data)[0]
    
    if(key === '606000' || key === '890400' || key === '934000'){
      title = 'Avbrott i '+pointTexts[key].type
      content = 'Drabbade: '.concat(_.flatten(_.map(data, function(num, key){
        return num + "st"
      })))
    } else {
      title = pointTexts[key].title
      content = 'Antal: '.concat(_.flatten(_.map(data, function(num, key){
        return num + "st"
      })))

    }
    
    coord = feature.getGeometry().getCoordinates()
  } else {

    if(feature.getGeometry().getType() == 'Point'){
      var key
      if(typeof feature.get('features') != 'undefined'){
        key = feature.get('features')[0].get("dp_otype").toString()
      } else {
        key = feature.get("dp_otype").toString()
      }
      //Kund
      //if-clause broken
      if(key==='333333'){
        title = pointTexts[key].title
        content = 'ID: '+feature.get('gid')+ '\
        Namn: '+ feature.get('firstname')+' '+feature.get('lastname') + '\
        Adress: '+feature.get('address')+' \
        Anslutningspunkter: '+ feature.get('gas_id') +' '+feature.get('water_id')+' '+feature.get('heating_id')
        coord = feature.getGeometry().getCoordinates()
      }else if(key === '606000' || key === '890400' || key === '934000'){
        title = 'Anslutningspunkt i '+pointTexts[key].type
        content = 'Tillhör kund med ID: '+feature.get('cust_id')
        coord = feature.getGeometry().getCoordinates()
      } else if(key === '933000' || key === '804000' || key === '800004'){
        title = pointTexts[key].title
        content = 'ID på trasig nod: '+feature.get('gid')
        coord = feature.getGeometry().getCoordinates()
      } else{
        console.log(feature, 'debug')
        title = pointTexts[key].title
        if(key==='112233'){
          content = 'Startdatum: 2016-05-18 \ Beräknat slutdatum: 2016-05-25 \ Typ: Nyanslutning'  
        } else {
          content = 'Startdatum: 2016-05-19 \ Beräknat slutdatum: 2016-05-20 \ Typ: Avgrävd kabel'  
        }
        coord = feature.getGeometry().getCoordinates()
      }
    } else {
      key = feature.get("dp_otype").toString()
      title = lineTexts[key].title+'nät'
      content = ''
      coord = feature.getGeometry().getCoordinateAt(0.5)      
    }
  }
  console.log(title, content, coord)
  popup.setPosition(coord);
  $(popup.getElement()).attr( 'data-placement', 'top' );
  $(popup.getElement()).attr( 'data-original-title', title );
  $(popup.getElement()).attr( 'data-content', content);
  $(popup.getElement()).attr( 'data-html', true );
  $(popup.getElement()).popover();
  $(popup.getElement()).popover('show');
}


//Based on the resolution, changes the content in the source of the line- and node layers, thus changing what is drawn.
//Also sets / unsets the visibility of the connections, depending on the layer.
function trimData(restraints, layers, inGroups){
  for (var i = 0; i < layers.Arcs.length; i++) {
    arcs = layers.Arcs[i]
    nodes = layers.Nodes[i]
    networks = layers.Networks[i]
    data = layers.Data[i]
    connections = layers.Connections[i]
    //Clears all current arcs
    arcs.getSource().clear();
    //For each restraint-set(i.e. one per network type)
    _.each(restraints[i]['line'], function(rest){
      //Adds arcs matching the current restriction set
      arcs.getSource().addFeatures(_.filter(networks.arcArray, function(line){
        tmp = line.get('dp_subtype')==linetypes[layers.Types[i]][rest]['subtyp'] && line.get('dp_otype')==linetypes[layers.Types[i]][rest]['otyp']       
        return tmp
      }))
    })
    arcs.getSource().dispatchEvent('removefeature')
    //Extracts so only nodes that intersect a currently drawn arc is shown. Not used currently.
    var pointsOnLinesource = _.map(arcs.getSource().getFeatures(), function(line){
      return line.get('gid')
    })
    pointsOnLinesource.sort();
  }
  _.each(inGroups, function(layerGroup){
    if(layerGroup.getLayers().getArray()[0] instanceof ol.layer.Vector){      
      _.each(layerGroup.getLayers().getArray(), function(layer){
        if(layer.get("type")==='conn'){
          if(restraints[0]['connection']==true){
            layer.setVisible(false);
          } else {
            layer.setVisible(false);
          }

        } else if (layer.get("type")==='cluster'){
          if(restraints[0]['connection']==true){
            layer.setVisible(false);
          } else {
            layer.setVisible(true);
          }
        }
      })
    }
  })
    //Shows connections for the correct zoom-levels.


    // Om vi skall visa upp noder, slutför förändringen här
    // Restraints innehåller inget om connectivity nu - är det verkligen relevant? Blev inga bra visualiseringar.
    /*
    _.each(restraints, function(rest){
      nodes.getSource().addFeatures(_.filter(networks.nodeArray, function(point){ 
        if(point.get('connectivity')>restraints.Connect && _.some(point.get('lineArray'), function(x) { return (_.indexOf(pointsOnLinesource, x, true) >= 0) })
        ) {
        return point
        }
      }))
    })*/

  }


  //Decides what to show and to not show based on arbitrary zoom levels.
  function resolutionEvaluator(cur_res,layers){
    restraints = [];
    for (var i = 0; i < layers.Arcs.length; i++) {
      var showLine = [];
      var showCon = false;

      switch (true){
        case (cur_res>=6):
        showLine = [];
        break;
        case (cur_res<6 && cur_res>=4):
        showLine = ['big']
        break;
        case (cur_res<4 && cur_res>=1.5):
        showLine = ['big', 'main']
        break;
        case (cur_res<1.5 && cur_res>=1):
        showLine = ['big', 'main', 'small']
        break;
        case (cur_res<1):
        showLine = ['big', 'main', 'small']
        showCon = true;
        break;
      }
      toShow = {'line': showLine, 'connection': showCon}
      restraints.push(toShow);
    }
    return restraints
  }


// Taken from http://www.acuriousanimal.com/thebookofopenlayers3/chapter03_04_imagecanvas.html
var canvasFunction = function(inFeature, inArray, inColors) {
  var canvas = document.createElement('canvas');
  canvas.id = 'someId';
  var context = canvas.getContext('2d');
  //var canvasWidth = size[0], canvasHeight = size[1];
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
    context.save();
    
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

var proportions = function(data) {
  tot = data.length;
  data = _.countBy(data, _.identity);
  data = _.map(data, function(num, key) { return [key, 100*(num/tot)]; })
  return _.object(data);
}

function workStyler(feature) {
  var size = feature.get('features').length;
  var type = feature.get('features')[0].get('dp_otype')
  style = new ol.style.Style({
   text: new ol.style.Text({
    text: pointColors[type].icon,
    font: iconSizes[size],
    rotation: pointColors[type].rotation,
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: pointColors[type].color,
    })
  })
 })
  return style
}


function styleFunc(feature) {
  var size = feature.get('features').length;
  var inputFeatures = feature.get('features');
  var all_otypes = _.map(inputFeatures, function(ol) {
    return ol.get('dp_otype');
  })
  var share_array = _.values(proportions(all_otypes));
  var fixedColors = _.map(_.keys(proportions(all_otypes)), function(type) {return pointColors[type].color});
  var expCanvas = canvasFunction(feature, share_array, fixedColors);    
  style =  new ol.style.Style({
    image: new ol.style.Icon(({
      img: expCanvas,
      imgSize: [100,100]
    })),
    text: new ol.style.Text({
      text: size.toString(),
      fill: new ol.style.Fill({
        color: '#ffffff'
      })
    })
  });
  return style;
}

function bindNodeInputs(layer, inLayers, inMap, layerGroups, customers) {
  var textbox = $('input#usr');
  textbox.on('change', function() {
    console.log('CHANGE')
    var selectedText = $('#Networks').find("option:selected").text();
    if(layer.get("network") === selectedText.toLowerCase()){
      feature = _.find(layer.getSource().getFeatures(),function(feat){return feat.get("gid").toString()===textbox.val()})
      disableNode(feature, inLayers, inMap, layerGroups, customers)
    }    
  })
};

function disableNode(feature, inLayers, map, layerGroups, customers) {
  networkType = pointColors[feature.get("dp_otype")].type
  requests = {'broken': makeRequest('GET', '/broken/'+networkType+'/'+feature.get("gid"))}
  Promise.props(requests).then(function(responses) {
    if(responses.broken === 'NULL') {
      alert("This node is redundant - no effect.")
    } else {
      responses = JSON.parse(responses.broken)
      tmpLayers = {'Arcs': JSON.stringify(responses.Arc), 'Nodes': JSON.stringify(responses.Node), 'Connections':JSON.stringify(responses.Conn)}
      connection = [] 
      data = []
      network = []
      data.push(dataMaker(tmpLayers.Arcs, tmpLayers.Nodes));
      network.push(networkMaker(data[0].arcSource.getFeatures(), data[0].nodeSource.getFeatures()));
      inLayers.Data.push(data[0]);
      inLayers.Networks.push(network[0]);
      inLayers.Types.push(networkType)
      connection.push(connectionMaker(tmpLayers.Connections));
      conn_id_list = _.map(connection[0].connSource.getFeatures(), function(key, value){
        return key.get("cust_id")
      })
      fillCustomer(conn_id_list, networkType, customers, map)
      layerMaker(data[0],inLayers,connection[0], networkType, true, true, false, layerGroups, feature.get("gid"), true);
      brokenCluster(connection[0].connSource, true, layerGroups[layerGroups.length-1], polyMaker)      
      //Fixa stöd för grupper
      map.addLayer(layerGroups[layerGroups.length-1])
      layerGroups[layerGroups.length-1].dispatchEvent('change:layers')
      map.render()
      map.dispatchEvent('change:resolution')
      alertOutage(swe_eng['full'][networkType]['title'], conn_id_list.length, feature.get("gid"));
      $('#zoomButton').click(function() {
        var extent = inLayers.Clusters[inLayers.Clusters.length-1].getSource().getExtent()
        map.getView().fit(extent,map.getSize());
      });
    }
  })
};

function customerMaker(responses){
  var custSource = new ol.source.Vector()
  custSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  custLayer = new ol.layer.Vector({
    source: custSource,
    visible: false,
    style: customerStyle,
    title: 'Kunder',
    type: 'Old',
  })
  return custLayer
}


function heatmapMaker(responses){
  var heatSource = new ol.source.Vector()
  heatSource.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(responses)))
  heatLayer = new ol.layer.Heatmap({
    source: heatSource,
    visible: false,
    title: 'Avbrottshistorik',
    type: 'cust',
    radius: 20,
    blur: 10,
    gradient: ['#FFEBEE','#E57373', '#EF5350','#F44336', '#E53935', '#C62828'],
    //gradient: ['rgba(244, 67, 54, 0.2)','rgba(244, 67, 54, 0.3)','rgba(244, 67, 54, 0.4)','rgba(244, 67, 54, 0.6)','rgba(244, 67, 54, 0.75)','rgba(244, 67, 54, 0.9)','rgba(244, 67, 54, 1)'],
    opacity: 0.8
  })
  return heatLayer
}

function fillCustomer(gidList, network_type, customers, map){ 
  requests = {'cust': makeRequest('GET', '/menu/cust/('+gidList+')')}
  Promise.props(requests).then(function(responses) {
    var table = document.getElementById("custTable");
    customerArray = JSON.parse(responses.cust)
    for(i=0; i<customerArray.length; i++) {
      var row = custTable.insertRow(i+1);
      var custID = customerArray[i].gid
      row.insertCell(0).innerHTML="<p id='rowClick'>"+customerArray[i].gid+"</p>";
      row.insertCell(1).innerHTML="<p>"+customerArray[i].firstname+"</p>";
      row.insertCell(2).innerHTML="<p>"+customerArray[i].lastname+"</p>";
      row.insertCell(3).innerHTML="<p>"+customerArray[i].address+"</p>";
      row.insertCell(4).innerHTML="<p>"+customerArray[i].gas_id+"</p>";
      row.insertCell(5).innerHTML="<p>"+customerArray[i].water_id+"</p>";
      row.insertCell(5).innerHTML="<p>"+customerArray[i].heating_id+"</p>";
      $("#rowClick").click(function(){
        zoomToCust(map, custID, customers)})
    }

  })};

  function zoomToCust(map,custID, customers){
    console.log(custID, 'id')
    var foundCust = _.filter(customers.getSource().getFeatures(), function(feature){
      return feature.get("gid") == custID
    })
    
    extent = foundCust[0].getGeometry().getExtent()
    map.getView().fit(extent,map.getSize());
    popup = map.getOverlays().item(0)
    console.log(popup, map.getOverlays())
    popupMaker(foundCust[0],popup)
  }

  function deleteLayers(inLayers, layer, map, layerGroups){
    layerType = {'arc': inLayers.Arcs, 'node': inLayers.Nodes, 'conn':inLayers.Connections}
    index = _.indexOf(layerType[layer.get('type')], layer)
    _.each(inLayers, function(value, key){
      if(key !== 'Clusters' && index >= 3){
        map.removeLayer(layerGroups[index])
        value.splice(index,1)
        map.render()
      }
    });
  }