//Visual settings for el
var styles = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 2,
				fill: new ol.style.Fill({
					color: 'black'
				})
			})
		})],
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'green',
				width: 1
			})
		}),
		'MultiLineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'green',
				width: 1
			})
		}),
		'Polygon': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'blue',
				lineDash: [4],
				width: 3
			}),
			fill: new ol.style.Fill({
				color: 'rgba(0, 0, 255, 0.1)'
			})
		}),
		'Circle': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'red',
				width: 2
			}),
			fill: new ol.style.Fill({
				color: 'rgba(255,0,0,0.2)'
			})
		})
};

var styleFunction = function(feature) {
	return styles[feature.getGeometry().getType()];
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

init = function() {
	//Requests from all the different text files.
	//To be implemeted: somehow group them together already in the requests-phase.
	requests = {
			'lines':
				makeRequest('GET', '/cbl/'),
				'bays':
					makeRequest('GET', '/bay_stats')
	}
	Promise
	.props(requests)
	.then(function(responses) {
		$(function () {
			$('[data-toggle="popover"]').popover()
		})
		var bayObject = JSON.parse(JSON.parse(responses.bays));
		var lineObject = JSON.parse(responses.lines);
		var lineSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(lineObject)
		})
		var lineLayer = new ol.layer.Vector({
			source: lineSource,
			style: styleFunction
		});
		map = mapMaker(lineLayer,bayObject);
	})
	/*	.catch(function (err) {
		console.error('Augh, there was an error!', err.statusText);
		console.error(err);
	});*/
};

function checkExistance(features,map){
	idArray = [];
	for (i=0; i<features.length; i++){
		var bayID = features[i].get("fack_oid");
		var idx = $.inArray(bayID, idArray);
		if (idx == -1) {
			idArray.push(bayID);
		}
	}
	var bayLayer = getExtentofBay(idArray,features,map);
	return bayLayer;
}

function getBayObject(feature,bayObject){
	var feature_oid = feature.get("fack_oid");
	console.log(bayObject[1].fack_oid);
	var returnedBay = bayObject.filter(function(entry){
		return entry.fack_oid === feature_oid
	});
}


function mapMaker(lineLayer,bayObject){
	proj4.defs("EPSG:3009","+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ");
	var myProjection = ol.proj.get('EPSG:3009');
	var raster = new ol.layer.Tile({  
		type:'base',
		title:'Bakgrund ljus', 
		source: new ol.source.XYZ({
			tileSize: [512, 512],
			url: 'https://api.mapbox.com/styles/v1/fhilding/cin084lbc004mc9maksu66pyt/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmhpbGRpbmciLCJhIjoiY2luMDgyMXB3MDBubXY5bHlsZ3d0NXpuMCJ9.YzM1KUyixi_b2Vl1CF0e2g',
			crossOrigin: 'anonymous'
		})
	});
	var darkRaster = new ol.layer.Tile({  
		type:'base',
		title:'Bakgrund mörk', 
		source: new ol.source.XYZ({
			url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmhpbGRpbmciLCJhIjoiY2luMDgyMXB3MDBubXY5bHlsZ3d0NXpuMCJ9.YzM1KUyixi_b2Vl1CF0e2g',
			crossOrigin: 'anonymous'
		})
	});
	var basemap = new ol.layer.Group({ 'title': 'Baselayer', layers: [darkRaster,raster]})
	ol.proj.addProjection(myProjection);
	var map = new ol.Map({
		layers: [basemap],
		target: 'map',
		interactions : ol.interaction.defaults({doubleClickZoom :true}).extend([new ol.interaction.MouseWheelZoom({duration :500})]),
		view: new ol.View({
			center: [138577,6307000],
			resolution: 20,
			projection: myProjection,
		})
	});
	var layerSwitcher = new ol.control.LayerSwitcher({target: 'layer_panel',
		tipLabel: 'Legend' // Optional label for button
	});
	var element = document.getElementById('popup');
	var popup = new ol.Overlay({
		element: element,
		positioning: 'bottom-center',
		stopEvent: false
	});
	map.addOverlay(popup);
	map.on('click', function (evt) {
		var feature = map.forEachFeatureAtPixel(evt.pixel,

				function (feature, layer) {
			return feature;
		});
		if (feature) {
			var geometry = feature.getGeometry();
			var coord = geometry.getCoordinates();
			popup.setPosition(coord);
			$(element).popover({
				'placement': 'top',
				'html': true,
				'content': "<p>" + 'Antal anmärkningar: ' + feature.get("antal_anm")+"</p>" + "<p>"+'Anmärkningsgrad: ' + feature.get("grad")+"</p>"
			});
			$(element).popover('show');
		} else {
			$(element).popover('destroy');
		}
	});
	map.addControl(layerSwitcher);
	var features = lineLayer.getSource().getFeatures();
	
	$("#runBtn").click(function(){
		var sum = 0
		//For each slider..
		var sliders = $("#sliders .slider");
		sliders.each(function(){
			//..add value of slider to sum variable
			sum += $(this).slider("option","value");
		});

		if (sum < 100) {
			alert ("Totala vikten är " + sum + "%. Måste vara 100%")
		}
		else {
			var bayLayer = checkExistance(features,map)
			getParamValue(bayObject,map, bayLayer);
			hideForm('weightForm');
		}
	})
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

//Creates the layers and sets the styles determining the visualization
function layerMaker(data,layers,network,showArc, showNode, showConn,layerGroups,title,bool_broken){

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
	layerGroups.push(new ol.layer.Group({
		'title': swe_eng[broken][network]['title'],
		layers: [tmpArc, tmpNode, tmpConn]
	}))
	layers.Arcs.push(tmpArc)
	layers.Nodes.push(tmpNode)
	//If multiple clusters, add clustering vector creation here
}


function openNav() {
	var e = document.getElementById("mySidenav");
	var x = document.getElementById("openButton")
	if (e.style.width == '250px' && x.style.marginLeft == '251px')

	{
		e.style.width = '0px';
		x.style.marginLeft = '0px';
	}
	else 
	{
		e.style.width = '250px';
		x.style.marginLeft='251px';
	}
}

/*function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
 */
function extendMenu(){
	var acc = document.getElementsByClassName("accordion");

	for (i = 0; i < acc.length; i++) {
		acc[i].onclick = function() {
			this.classList.toggle("active");
			var extend = this.nextElementSibling;
			if (extend.style.maxHeight){
				extend.style.maxHeight = null;
			} else {
				extend.style.maxHeight = extend.scrollHeight + "px";
			} 
		}
	}
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


	//If single cluster creation, keep this layer creation
	var clusterLayer = new ol.layer.Vector({
		source: clusterSource,
		title: 'Kluster',
		style: styleF,
		visible: true,
		type: 'cluster'
	});
	inGroup.get("layers").push(clusterLayer)
	layers.Clusters.push(clusterLayer)
}

function polyMaker(lineFeat, pointFeat, map, bayID) {
	var parser = new jsts.io.OL3Parser();
	var tmpLine = _.map(lineFeat, function(num){
		return num.getGeometry().getCoordinates();
	});
	var tmpPoint = _.map(pointFeat, function(num){
		return num.getGeometry().getCoordinates();
	});
	var newLine = new ol.geom.MultiLineString(tmpLine);
	var newPoint = new ol.geom.MultiPoint(tmpPoint);
	var jstsLine = parser.read(newLine);
	var jstsPoint = parser.read(newPoint);
	var chLine = jstsLine.convexHull();
	var chPoint = jstsPoint.convexHull();
	
	var polySource = new ol.source.Vector();
	var polyLine = new ol.Feature({
		geometry: parser.write(chLine)
	})
	var polyPoint = new ol.Feature({
		geometry: parser.write(chPoint)
	})
	
	var unionGeom = parser.read(polyLine.getGeometry());
	unionGeom = unionGeom.union(parser.read(polyPoint.getGeometry()));
	
	var unionFeat = new ol.Feature({
		geometry: parser.write(unionGeom),
		fack_oid: bayID
	})
	
	polySource.addFeature(unionFeat);
	var polyLayer = new ol.layer.Vector({
		source: polySource
	});
	map.addLayer(polyLayer);
	return polySource;
}

function MCEmapMaker(map, bayObject, bayLayer){
	var styleRed = {'Point': [new ol.style.Style({
		image: new ol.style.Circle({
			radius: 3,
			fill: new ol.style.Fill({
				color: 'red'
			})
		})
	})],
	'LineString': new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'red',
			width: 1
		})
	})
	};
	var styleGreen = {'Point': [new ol.style.Style({
		image: new ol.style.Circle({
			radius: 3,
			fill: new ol.style.Fill({
				color: 'green'
			})
		})
	})],
	'LineString': new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'green',
			width: 1
		})
	})
	};
	var styleYellow = {'Point': [new ol.style.Style({
		image: new ol.style.Circle({
			radius: 3,
			fill: new ol.style.Fill({
				color: 'yellow'
			})
		})
	})],
	'LineString': new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'yellow',
			width: 1
		})
	})
	};
	//var bayFeat = bayLayer.getSource().getFeatures();
	console.log(bayLayer);
/*	for (i=0; i<bayObject.length;i++){
		if (feature[i].get('totval') >= 10000){
			feature[i].setStyle(styleRed[feature[i].getGeometry().getType()]);
		} 
		else if (10000 >= feature[i].get('totval') && feature[i].get('totval') > 5000){
			feature[i].setStyle(styleYellow[feature[i].getGeometry().getType()]);
		} 
		else {
			feature[i].setStyle(styleGreen[feature[i].getGeometry().getType()]);;
		}
	}*/
	populateTable(bayObject,map);
}

function getParamValue(bayObject, map, bayLayer){
	//Get faetures from layers 
	//var features = lineLayer.getSource().getFeatures();
	oid = [];
	otype = [];
	age_over_35 = [];
	weightAge = [];
	no_of_obs = [];
	weightno_of_obs = [];
	obs_degree = [];
	weightobs_degree = [];
	tot_out = [];
	weighttot_out = [];
	totalValue = [];
	var sliderValues = getSliderValue(); //Get value from each slider

	//For every parameter...
	for (i=0; i<bayObject.length; i++){
		//..push value into array
		//var bay = getBayObject(features[i], bayObject);
		//var bayID = (bay.fack_oid);
		oid.push(bayObject[i].fack_oid)
		otype.push(bayObject[i].fack_otype);
		no_of_obs.push(bayObject[i].antal_anm);
		obs_degree.push(bayObject[i].anm_grad);
		age_over_35.push(bayObject[i].ant_obj_over_35);
		tot_out.push(bayObject[i].antal_avbr);
		//getExtent(bayID,features[i]);
	}
	//get minimum and maximum value
	var minAge = Math.min.apply(null,age_over_35);
	var maxAge = Math.max.apply(null,age_over_35);
	var minOutage = Math.min.apply(null,no_of_obs);
	var maxOutage = Math.max.apply(null,no_of_obs);
	var minobs_degree = Math.min.apply(null,obs_degree); 
	var maxobs_degree = Math.max.apply(null,obs_degree);
	var mintot_out = Math.min.apply(null,tot_out); 
	var maxtot_out = Math.max.apply(null,tot_out);

	for ( j=0; j<no_of_obs.length; j++){
		//Norm values
		var normedAge = normValues(age_over_35[j], minAge, maxAge);
		var normedOutage = normValues(no_of_obs[j], minOutage, maxOutage);
		var normedobs_degree = normValues(obs_degree[j], minobs_degree, maxobs_degree);
		var normedtot_out = normValues(tot_out[j], mintot_out, maxtot_out);

		//Multiply normed value with weight
		weightno_of_obs.push(normedOutage*sliderValues[0]);
		weightobs_degree.push(normedobs_degree*sliderValues[1]);
		weightAge.push(normedAge*sliderValues[2]);
		weighttot_out.push(normedtot_out*sliderValues[3]);
		//Sum the weighted parameters to a total score
		totalValue.push(weightno_of_obs[j] + weightobs_degree[j]+weightAge[j]+weighttot_out[j]);
	}

	for (k=0; k<bayObject.length; k++){
		totVal = totalValue[k].toFixed(2);
		bayObject[k].totval = totVal;
		//features[i].set('id',i);
		//console.log(features[k]);
	}
	/*	for (k=0; k<10; k++){
		var totVal = parseFloat((totalValue[k]).toFixed(2));
		features[k].set("totalvalue", totVal);
		//Update arc id[i] with totalValue[k]
		requests.push({'GET': makeRequest('GET', '/updateTotalValue/'+id[k]+'/'+totVal+'')});
	}
	//console.log(requests);
	Promise.all(requests).then(function() {
		console.log("Klar");
		MCEmapMaker(features, map);
	});*/
	MCEmapMaker(map,bayObject, bayLayer);
	//Reset parameters
	resetForm('checkParamForm')
	resetForm('weightForm1')
	resetSliders()
}

function populateTable(bayObject, map){
	//Sort bayObjects based on totalvalue --> highest value on top
	bayObject.sort(function(obj1, obj2) {
		return obj2.totval - obj1.totval
	});
	var table = document.getElementById("featureTable");
/*	var header = table.createTHead();
	var headerRow = header.insertRow(0);
	headerRow.innerHTML=""
	headerRow.insertCell(0).innerHTML="<th>Rank</th>";
	headerRow.insertCell(1).innerHTML="<th>Fack</th>";
	headerRow.insertCell(2).innerHTML="<th>Värde</th>";
	headerRow.insertCell(3).innerHTML="<th></th>";*/
	//For each object...
	var tBody = document.getElementById("tbody")
	for(i=0; i<bayObject.length; i++) {
		//Create a row
		var row = tBody.insertRow(i+1);
		//Get oid of bayObject
		var featureID = bayObject[i].fack_oid;
		//Insert columns for
		row.insertCell(0).innerHTML="<td>"+(i+1)+"</td>";
		row.insertCell(1).innerHTML="<td id="+bayObject[i].fack_oid+">"+bayObject[i].fack_oid+"</td>";
		row.insertCell(2).innerHTML="<td>"+bayObject[i].totval+"</td>";

		if (bayObject[i].totval>=0.8){
			row.insertCell(3).innerHTML="<div class='colcircle_red'> </div>";
		}
		else if (0.8 >bayObject[i].totval && bayObject[i].totval>= 0.4){
			row.insertCell(3).innerHTML="<div class='colcircle_yellow'> </div>";
		}
		else {
			row.insertCell(3).innerHTML="<div class='colcircle_green'> </div>";
		}
		//When click on column with ID bayObject[i].fack_oid
		$("#"+bayObject[i].fack_oid+"").click(function(test){
			//getExtent(map, test.target.outerText, features)
		});
	};
	$('#tableDiv').show();
//	$('#tableDiv').scroll(moveScroll);

}

//function moveScroll(){
//	var scroll = $('#tableDiv').scrollTop();
//	var anchor_top = $("#featureTable").offset().top;
//	var anchor_bottom = $("#bottom_anchor").offset().top;
//	if (scroll>anchor_top && scroll<anchor_bottom) {
//		clone_table = $("#clone");
//		if(clone_table.length == 0){
//			clone_table = $("#featureTable").clone();
//			clone_table.attr('id', 'clone');
//			clone_table.css({position:'fixed',
//				'pointer-events': 'none',
//				top:0});
//			clone_table.width($("#featureTable").width());
//			$("#tableDiv").append(clone_table);
//			$("#clone").css({visibility:'hidden'});
//			$("#clone thead").css({visibility:'visible'});
//		}
//	} else {
//		$("#clone").remove();
//	}
//}

function getExtentofBay(idArray,features,map){
	var baySource = new ol.source.Vector({});
	bayArray = [];
	for (i=0; i<idArray.length;i++){
		var bayID = idArray[i]
		var lineFeat = features.filter(function(features){
			return features.get("fack_oid") === bayID && features.getGeometry().getType() === 'LineString'
		});
		var pointFeat = features.filter(function(features){
			return features.get("fack_oid") === bayID && features.getGeometry().getType() === 'Point'
		});
		//console.log(foundFeat);
		var bayLayer = polyMaker(lineFeat,pointFeat,map, bayID);
		bayArray.push(bayLayer);
	}
	return bayArray;
	
}

function zoomToMap(map,featureID, features){
	//Filter out feature - return the ones that match feature ID
	var foundFeat = features.filter(function(features){
		return features.get("fack") == featureID
	});
	console.log(foundFeat);
	//Get extent of feature
	extent = foundFeat[0].getGeometry().getExtent()
	//Zoom to extent
	map.getView().fit(extent,map.getSize());
}

//TODO:Normerar värden, hur ska denna göras? Just nu är det linear stretching
function normValues(value, min, max){
	var normedValue = (value-min)*(1/(max-min))
	return normedValue;	
}

function getSliderValue(){
	//Create empty array
	sliderValues = [];
	//For each slider...
	var sliders = $("#sliders .slider");
	sliders.each(function(){
		//...get value of slider and push it into array
		var value = ($(this).slider("option","value")/100);
		sliderValues.push(value);
	});

	return sliderValues;
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
						content = 'ID: '+feature.get('gid')+ '\r\n\
						Namn: '+ feature.get('firstname')+' '+feature.get('lastname') + '\r\n\
						\r\nAdress: \r\n\ '+feature.get('address')+' \r\n\
						\r\nAnslutningspunkter: \r\n'+ feature.get('gas_id') +' '+feature.get('water_id')+' '+feature.get('heating_id')
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
	popup.setPosition(coord);
	$(popup.getElement()).attr( 'data-placement', 'top' );
	$(popup.getElement()).attr( 'data-original-title', title );
	$(popup.getElement()).attr( 'data-content', content);
	//$(popup.getElement()).attr( 'data-html', true );
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
	//_.each(inGroups, function(layerGroup){
	if(inGroups.length>3){
		for(var i=3;i<inGroups.length;i++){
			group = inGroups[i]
			for(var j=0;j<group.getLayers().getLength();j++){
				layer = group.getLayers().item(j)
				if(layer.get("type")==='conn'){
					if(restraints[0]['connection']==true){
						layer.setVisible(true);
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
			}
		}
	}
	//Shows connections for the correct zoom-levels.
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


//Taken from http://www.acuriousanimal.com/thebookofopenlayers3/chapter03_04_imagecanvas.html
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

//	Track the accumulated arcs drawn
	var totalArc = -90*Math.PI / 180;
	var percentToRadians = 1 / 100*360 *Math.PI / 180;
	var wedgeRadians;
	var coordinate = inFeature.getGeometry().getCoordinates();
	var data = inArray; //Placeholder

	drawPie(coordinate, data, colors);
	return canvas;            
};

var proportions = function(data) {
	tot = data.length;
	data = _.countBy(data, _.identity);
	data = _.map(data, function(num, key) { return [key, 100*(num/tot)]; })
	return _.object(data);
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
