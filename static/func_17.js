//Visual settings for el
var styles = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 1.5,
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

var ageStyle = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 1.5,
				fill: new ol.style.Fill({
					color: 'red'
				})
			})
		})],
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'red',
				width: 1.5
			})
		})
}

var ageStyle_40 = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 1.5,
				fill: new ol.style.Fill({
					color: 'red'
				})
			})
		})],
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'red',
				width: 1.5
			})
		})
}
var ageStyle_35 = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 1.5,
				fill: new ol.style.Fill({
					color: "#e79516"
				})
			})
		})],
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: "#e79516",
				width: 1.5
			})
		})
}
var ageStyle = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				radius: 1.5,
				fill: new ol.style.Fill({
					color: 'gray'
				})
			})
		})],
		'LineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'gray',
				width: 1
			})
		})
}

var ageStyleFunc = function(feature) {
	if (feature.get("installerad") <= 1977){
		return ageStyle_40[feature.getGeometry().getType()];
	}
	else if (feature.get("installerad")<= 1982 && feature.get("installerad")>1978){
		return ageStyle_35[feature.getGeometry().getType()];
	}
	else {
		return ageStyle[feature.getGeometry().getType()];
	}
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
	requests = {
			'objects':
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
		var lineObject = JSON.parse(responses.objects);
		var lineFeature = (new ol.format.GeoJSON()).readFeatures(lineObject)
		var lineLayer = createLayer(lineFeature, styleFunction, 99, 'Objekt');
		var ageLayer = createLayer(lineFeature, ageStyleFunc, 100, 'Ålder');
		ageLayer.setVisible(false);
		map = mapMaker(lineLayer,bayObject,ageLayer);
	})
/*		.catch(function (err) {
		console.error('Augh, there was an error!', err.statusText);
		console.error(err);
	});*/
};

function checkExistance(features,map, bayObject){
	idArray = [];
	//For every feature
	for (i=0; i<features.length; i++){
		//Get id
		var bayID = features[i].get("fack_oid");
		var idx = $.inArray(bayID, idArray);
		//If id not already in idArray
		if (idx == -1) {
			//Add id to idArray
			idArray.push(bayID);
		}
	}
	//Get bay
	var bayFeat = getExtentofBay(idArray,features,map, bayObject);
	return bayFeat;
}


function getBayObject(feature,bayObject){
	var feature_oid = feature.get("fack_oid");
	console.log(bayObject[1].fack_oid);
	var returnedBay = bayObject.filter(function(entry){
		return entry.fack_oid === feature_oid
	});
}

function createLayer(feature, style, zIndex, title){
	var source = new ol.source.Vector({
        features: feature
      });
	var vectorLayer = new ol.layer.Vector({
		source: source,
		style: style,
		title: title
	});
	vectorLayer.setZIndex(zIndex);
	return vectorLayer;
}

function mapMaker(lineLayer,bayObject,ageLayer){
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
	var features = lineLayer.getSource().getFeatures();
	var basemap = new ol.layer.Group({ 'title': 'Bakgrundskarta', layers: [darkRaster,raster]});
	var objectGroup = new ol.layer.Group({ 'title': 'Kartlager', zIndex: 99, layers: [lineLayer, ageLayer]});

	ol.proj.addProjection(myProjection);
	var map = new ol.Map({
		layers:[basemap,objectGroup],
		target: 'map',
		interactions : ol.interaction.defaults({doubleClickZoom :true}).extend([new ol.interaction.MouseWheelZoom({duration :500})]),
		view: new ol.View({
			center: [138577,6307000],
			resolution: 10,
			projection: myProjection,
		})
	});
	var layerSwitcher = new ol.control.LayerSwitcher({target:'layer_panel',
		tipLabel: 'Legend' // Optional label for button
	});

	var element = document.getElementById('popup');
	var overlay = new ol.Overlay({
		element: element,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});
	map.addOverlay(overlay);
	
	var closer = document.getElementById('popup-closer');
	closer.onclick = function() {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	};
	var content = document.getElementById('popup-content');
	var bayFeatSource = new ol.source.Vector({})
	var bayFeatLayer = new ol.layer.Vector({
        source: bayFeatSource,
        style: styleFunction,
        title: 'Fack',
        zIndex: 0
    });

	map.on('singleclick', function(evt) {
		if (checkLayer(bayFeatLayer,map)){
			map.removeLayer(bayFeatLayer);
			bayFeatLayer.getSource().clear();
		}
		var foundFeat = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
			return feature;
		}, {
			hitTolerance: 10
		});
		if (foundFeat){
			fack_oid=foundFeat.get("fack_oid")
			var featBay = getExtentofBay(fack_oid,features,map, bayObject);
			bayFeatSource.addFeature(featBay[0]);
			map.addLayer(bayFeatLayer);
			layerDown(bayFeatLayer, map);
			if (foundFeat.getGeometry().getType() === 'Point' || foundFeat.getGeometry().getType() === 'LineString'){
				var coordinate = evt.coordinate;
				content.innerHTML ='<b>Oid: </b>' + foundFeat.get('obj_oid') + '<br><b>Otype: </b>' + foundFeat.get('obj_otype')+'<br><b>Tillhör fack oid: </b>'+foundFeat.get('fack_oid')+'<br><b>Ålder: </b>' + (new Date().getFullYear() - foundFeat.get('installerad'))+ ' år';
				overlay.setPosition(coordinate);
			}
			else {
				var coordinate = evt.coordinate;
				content.innerHTML ='<b>Fack oid: </b>' + foundFeat.get('fack_oid') + '<br><b> Besiktningsanmärkningar: </b>' + foundFeat.get('antal_anm')+ ' st' + '<br><b>Allvarliga besiktningsanmärkningar: </b>'+ foundFeat.get('anm_grad') +' st' + '<br><b> Objekt>35 år: </b>' +foundFeat.get('antal_obj_35') + ' st' + '<br><b> Avbrott: </b>'+ foundFeat.get('antal_avbr') + ' st' + '<br><b> Kundtid: </b>' + foundFeat.get('kundtid')+ ' h' ;
				overlay.setPosition(coordinate);
			}
		}
	});
	
	map.on('pointermove', function(evt) {
		map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
	});
	
	map.addControl(layerSwitcher);

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
			hideForm('weightForm');
			showForm('legendDiv');
			getParamName();
			var bayFeat = checkExistance(features,map, bayObject);
			getParamValue(bayObject,map, bayFeat);
			legendPlacement();
			
			

		}
	})
}


function getParamName(){
	var slidervalue = getSliderValue();
	if (value1.checked){
		var text = $("#v1").contents().filter(function(){ 
			  return this.nodeType == 3; 
		})[0].nodeValue
		var slidernum = Math.round(slidervalue[0]*100);
		$("#param1").html(text+": "+slidernum+"%");
		$("#param1").show();
	}
	if (value2.checked){
		var text = $("#v2").contents().filter(function(){ 
			  return this.nodeType == 3; 
		})[0].nodeValue
		var slidernum = Math.round(slidervalue[1]*100);
		$("#param2").html(text+": "+slidernum+"%");
		$("#param2").show();
	}
	if (value3.checked){
		var text = $("#v3").contents().filter(function(){ 
			  return this.nodeType == 3; 
		})[0].nodeValue
		var slidernum = Math.round(slidervalue[2]*100);
		$("#param3").html(text+": "+slidernum+"%");
		$("#param3").show();
	}
	if (value4.checked){
		var text = $("#v4").contents().filter(function(){ 
			  return this.nodeType == 3; 
		})[0].nodeValue
		var slidernum = Math.round(slidervalue[3]*100);
		$("#param4").html(text+": "+slidernum+"%");
		$("#param4").show();
	}
	if (value5.checked){
		var text = $("#v5").contents().filter(function(){ 
			  return this.nodeType == 3; 
		})[0].nodeValue
		var slidernum = Math.round(slidervalue[4]*100);
		$("#param5").html(text+": "+slidernum+"%");
		$("#param5").show();
	}
	
}



function getLayerIndex(layer,map) {
    var res = false;
    for (var i=0;i<map.getLayers().getLength();i++) {
        if (map.getLayers().getArray()[i] === layer) { //check if layer exists
            res = i; //if exists, return index
        }
    }
    return res;
}

function layerDown(layer,map) {
	//Check index of layer
    var e = getLayerIndex(layer,map);
    //If layer exists and index is not 0
    if (e != false && e != 0) {
        var f = map.getLayers().getArray()[e - 1];
        map.getLayers().getArray()[e - 1] = layer;
        map.getLayers().getArray()[e] = f;
        map.updateSize();
    }
}

function checkLayer(layer,map){
    var res = false;
    //For every layer in map
    for (var i=0;i<map.getLayers().getLength();i++) {
        if (map.getLayers().getArray()[i] === layer) { //check if layer exists
            res = true; //if exists, return true
        }
    }
    return res;
}

function openNav() {
	var e = document.getElementById("mySidenav");
	var x = document.getElementById("openButton");
	var y= document.getElementById("legendDiv")
	if (e.style.width == '200px' && x.style.marginLeft == '200px')

	{
		e.style.width = '0px';
		x.style.marginLeft = '0px';
		y.style.marginLeft='5px';
	}
	else 
	{
		e.style.width = '200px';
		x.style.marginLeft='200px';
		y.style.marginLeft='205px';
	}
}

/*function closeTable() {
	var table = document.getElementById("tableDiv");
	var button = document.getElementById("closeTable")
	var legend = document.getElementById("legend")
	if (table.style.width == '0px' && button.style.marginRight == '-15px'){
		table.style.width = '250px';
		button.style.marginRight = '235px';
		legend.style.marginRight='270px';
	}
	else {
		table.style.width = '0px';
		button.style.marginRight='-15px';
		legend.style.marginRight = '20px';
	}
}*/

function legendPlacement() {
	var table = document.getElementById("tableDiv");
	var legend = document.getElementById("legend")

	if (table.style.display=='none'&& legend.style.marginRight=='200px'&& legend.style.display=='block'&& table.style.width == '0px'){	
		legend.style.marginRight = '5px';
	}
	else {
		legend.style.marginRight='200px';
	}
}

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

function polyMaker(lineFeat, pointFeat, map, bayID, bays) {
	//create io parser
	var parser = new jsts.io.OL3Parser();
	//Create variable with coordinates
	var tmpLine = _.map(lineFeat, function(num){
		return num.getGeometry().getCoordinates();
	});
	var tmpPoint = _.map(pointFeat, function(num){
		return num.getGeometry().getCoordinates();
	});
	//Create geoms from coordinates
	var newLine = new ol.geom.MultiLineString(tmpLine);
	var newPoint = new ol.geom.MultiPoint(tmpPoint);
	//Parse geoms to jsts
	var jstsLine = parser.read(newLine);
	var jstsPoint = parser.read(newPoint);
	//Create convex hull
	var chLine = jstsLine.convexHull();
	var chPoint = jstsPoint.convexHull();
	//Cretae features from jsts
	var polyLine = new ol.Feature({
		geometry: parser.write(chLine)
	})
	var polyPoint = new ol.Feature({
		geometry: parser.write(chPoint)
	})
	//Union convexhull from lines and points
	var unionGeom = parser.read(polyLine.getGeometry());
	unionGeom = unionGeom.union(parser.read(polyPoint.getGeometry()));
	//Create feature from union
	var unionFeat = new ol.Feature({
		geometry: parser.write(unionGeom),
		fack_oid: bayID,
		antal_anm: bays[0].antal_anm,
		antal_obj_35: bays[0].ant_obj_over_35,
		anm_grad: bays[0].anm_grad,
		antal_avbr: bays[0].antal_avbr,
		kundtid: bays[0].kundtid
	})
	return unionFeat;
}

function MCEmapMaker(map, bayObject, bayFeat){
	var polySource = new ol.source.Vector();
	var styleRed = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'red',
			width: 3
		}),
		fill: new ol.style.Fill({
			color: 'rgba(255, 0, 0, 0.3)'
		})
	});
	var styleGreen = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'green',
			width: 3
		}),
		fill: new ol.style.Fill({
			color: 'rgba(0, 255, 0, 0.3)'
		})
	});
	var styleYellow = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'yellow',
			width: 3
		}),
		fill: new ol.style.Fill({
			color: 'rgba(255, 255, 51, 0.3)'
		})
	});
	//For every bay...
	for (i=0; i<bayFeat.length;i++){
		//Filter out bays where fack_oid is the same as id- to be able to bind properties from bayObject to bayFeat
		var bayfeature = bayFeat.filter(function(bayFeat){
			return bayFeat.get("fack_oid") === bayObject[i].fack_oid 
		});
		//If value is greater than 0.8..
		if (bayObject[i].totval >= 0.8){
			//Style red
			bayfeature[0].setStyle(styleRed);
			//Add polygon to source
			polySource.addFeature(bayfeature[0]);
		}
		//Ifa value is between 0.8 and 0.4..
		else if (0.8 > bayObject[i].totval && bayObject[i].totval >= 0.4){
			//Color yellow
			bayfeature[0].setStyle(styleYellow);
		} 
		else {
			//Color green
			bayfeature[0].setStyle(styleGreen);;
		}
	}
	var polyLayer = new ol.layer.Vector({
		source: polySource
	});
	//Add polygon layer to map
	map.addLayer(polyLayer);
	//Remove zoomed in layer
	map.removeLayer(zoomLayer);
	//populate table
	populateTable(bayObject, bayFeat,map);
	//When button clear analysis is clicked..
	$("#clearanalysis").click(function(test){
		//Remove polygons from source
		polySource.clear();
		//Hide table
		$('#tableDiv').hide();
//		$('#closeTable').hide();
		$('#legendDiv').hide();
		//Remove polygons from zoomed layer
		zoomSource.clear();
		var legend = document.getElementById("legend")
		legend.style.marginRight = '0px';
	});
}

/*$(document).ready(function(){
	$("#closeTable").on("click", function(){
		closeTable();
	});
});*/

function getParamValue(bayObject, map, bayFeat){
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
	tot_out_time = [];
	weighttot_out_time = [];
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
		tot_out_time.push(bayObject[i].kundtid);
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
	var mintot_out_time = Math.min.apply(null,tot_out_time); 
	var maxtot_out_time = Math.max.apply(null,tot_out_time);

	for ( j=0; j<no_of_obs.length; j++){
		//Norm values
		var normedAge = normValues(age_over_35[j], minAge, maxAge);
		var normedno_obs = normValues(no_of_obs[j], minOutage, maxOutage);
		var normedobs_degree = normValues(obs_degree[j], minobs_degree, maxobs_degree);
		var normedtot_out = normValues(tot_out[j], mintot_out, maxtot_out);
		var normedtot_out_time = normValues(tot_out_time[j], mintot_out_time, maxtot_out_time);

		//Multiply normed value with weight
		weightno_of_obs.push(normedno_obs*sliderValues[0]);
		weightobs_degree.push(normedobs_degree*sliderValues[1]);
		weightAge.push(normedAge*sliderValues[2]);
		weighttot_out.push(normedtot_out*sliderValues[3]);
		weighttot_out_time.push(normedtot_out_time*sliderValues[4]);
		//Sum the weighted parameters to a total score
		totalValue.push(weightno_of_obs[j] + weightobs_degree[j]+weightAge[j]+weighttot_out[j]+weighttot_out_time[j]);
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
	MCEmapMaker(map,bayObject, bayFeat);
	//Reset parameters
	resetForm('checkParamForm')
	resetForm('weightForm1')
	resetSliders()
}

function populateTable(bayObject, bayFeat, map){
	//Sort bayObjects based on totalvalue --> highest value on top
	bayObject.sort(function(obj1, obj2) {
		return obj2.totval - obj1.totval
	});
	var table = document.getElementById("featureTable");
	//For each object...
	var tBody = document.getElementById("tbody")
	for(i=0; i<bayObject.length; i++) {
		//Create a row
		var row = tBody.insertRow(i+1);
		//Get oid of bayObject
		var featureID = bayObject[i].fack_oid;
		//Insert columns for
		row.id=bayObject[i].fack_oid;
		row.insertCell(0).innerHTML="<td>"+(i+1)+"</td>";
		row.insertCell(1).innerHTML="<td>"+bayObject[i].fack_oid+"</td>";
		//row.insertCell(2).innerHTML="<td>"+bayObject[i].totval+"</td>";

		if (bayObject[i].totval>=0.8){
			row.insertCell(2).innerHTML="<div class='colcircle_red'> </div>";
		}
		else if (0.8 >bayObject[i].totval && bayObject[i].totval>= 0.4){
			row.insertCell(2).innerHTML="<div class='colcircle_yellow'> </div>";
		}
		else {
			row.insertCell(2).innerHTML="<div class='colcircle_green'> </div>";
		}
		//console.log(row);
		//When click on column with ID bayObject[i].fack_oid
		$("#"+bayObject[i].fack_oid).click(function(test){
			var id = $(this).closest("tr").find('td:eq(1)').text();
			zoomSource.clear();
			zoomToMap(map, id, bayFeat);
		});

	};
	$('#tableDiv').show();
	//$('#closeTable').show();
	
	
	map.addLayer(zoomLayer);
}

function getExtentofBay(idArray,features,map, bayObject){
	var baySource = new ol.source.Vector({});
	bayArray = [];
	//If more than one object in idArray..
	if (idArray.length>1){
		//For every id..
		for (i=0; i<idArray.length;i++){
			var bayID = idArray[i]
			//Filter out line features with the same bay oid
			var lineFeat = features.filter(function(features){
				return features.get("fack_oid") === bayID && features.getGeometry().getType() === 'LineString'
			});
			//Filter out point features with the same bay oid
			var pointFeat = features.filter(function(features){
				return features.get("fack_oid") === bayID && features.getGeometry().getType() === 'Point'
			});
			//Filter out corresponding bay
			var bays = bayObject.filter(function(features){
				return features.fack_oid === bayID
			});
			//Create polygons for bays
			var bayFeat = polyMaker(lineFeat,pointFeat,map, bayID, bays);
			//Push bay into array
			bayArray.push(bayFeat);
		}
	}
	//If only one id in idArray
	else {
		//Filter out line features where bay oid is the same as id
		var lineFeat = features.filter(function(features){
			return features.get("fack_oid") === idArray && features.getGeometry().getType() === 'LineString'
		});
		//Filter out point features where bay oid is the same as id
		var pointFeat = features.filter(function(features){
			return features.get("fack_oid") === idArray && features.getGeometry().getType() === 'Point'
		});
		//Filter out corresponding bay
		var bays = bayObject.filter(function(features){
			return features.fack_oid === idArray
		});
		//Create polygons for bays
		var bayFeat = polyMaker(lineFeat,pointFeat,map, bayID, bays);
		//Push bay into array
		bayArray.push(bayFeat);
	}
	return bayArray;
}

var zoomSource = new ol.source.Vector();
var zoomLayer = new ol.layer.Vector({
	source: zoomSource
});

function zoomToMap(map,featureID, bayFeat){
	//Filter out feature - return the ones that match feature ID
	var foundFeat = bayFeat.filter(function(features){
		return features.get("fack_oid") == featureID
	});
	//Add the returned feature to the source
	zoomSource.addFeature(foundFeat[0]);
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
