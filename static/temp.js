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
  requests = {'gasArc':
  makeRequest('GET', '/svett/el_cust'),
  'gasNode':
  makeRequest('GET', '/static/data/knutpunkt.json'),
  'heatArc':
  makeRequest('GET', '/static/data/heating_arc.json'),
  'heatNode':
  makeRequest('GET', '/static/data/heating_node.json'),
  'waterArc':
  makeRequest('GET', '/static/data/vatten_arcs.json'),
  'waterNode':
  makeRequest('GET', '/static/data/vatten_node.json'),
  'heatCust':
  makeRequest('GET', '/static/data/kunder.json'),
  'gasCust':
  makeRequest('GET', '/static/data/el_cust.json'),
  'waterCust':
  makeRequest('GET', '/static/data/vatten_cust.json'),
}
Promise
 .props(requests)
 .then(function(responses) {
console.log(requests.gasArc)


function dataMaker(json_arc, json_node){
  var arcSource_in = new ol.source.Vector()
  var nodeSource_in = new ol.source.Vector()
  arcSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(json_arc))
  nodeSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(json_node))
  //console.log(arcSource_in.getFeatures(), 'featurez')
  return {'arcSource': arcSource_in, 'nodeSource':nodeSource_in}
}

console.log(dataMaker(requests.gasArch, requests.gasNode))
})
 .catch(function (err) {
  console.error('Augh, there was an error!', err.statusText);
  console.error(err);
})}
init()