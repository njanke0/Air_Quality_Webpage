var vueModel = new Vue({
	el: "#whole_thing",
	data: {
		latitude: 44.9537,
		longitude: -93.0900,
		results: [],
		items: []
	}
});

var updateTimeout = null;

var map = L.map('map').setView([vueModel.latitude, vueModel.longitude], 10);

var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var greenIcon = L.icon({
    iconUrl: 'leaf-green.png', //We can rock any image
    shadowUrl: 'leaf-shadow.png', //Some sort of shadow

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var particleSpot = [44.9537, -93.0900];

var marker = L.marker([44.9537, -93.0900],{icon: greenIcon}).addTo(map).bindPopup("This is a air quality measurement.");

var heat = L.heatLayer([
[particleSpot[0], particleSpot[1], 200.0] // lat, lng, intensity (each member of this list is another point to add the heat to. Just import the station data as a list)
], {radius: 30}).addTo(map);

//var map = L.map('map')
//	.addLayer(mapboxTiles)
//	.setView([44.9537, -93.0900], 12);

var searchLayer = L.layerGroup().addTo(map);
//... adding data in searchLayer ...
//map.addControl( new L.Control.Search({layer: searchLayer}) );
//searchLayer is a L.LayerGroup contains searched markers

//location vars
var curLat, curLong, current_center, current_radius;
//Get the data to populate the map we will need to wait until there is a pause in the movements

map.on('movestart', function() {
	if (updateTimeout !== null)
	{
    	clearTimeout(updateTimeout);
     	updateTimeout = null;
 	}
})
map.on('moveend', function() {
	updateTimeout = setTimeout(function() {
		updateTimeout = null;
		current_corner = map.getBounds().getNorthEast();
		current_radius = current_corner.distanceTo(map.getCenter());
		vueModel.latitude = map.getCenter().lat;
		vueModel.longitude = map.getCenter().lng;
		//current_radius = current_distance/1000;
		const url = "https://api.openaq.org/v1/measurements?coordinates="+vueModel.latitude+","+vueModel.longitude+"&radius="+current_radius+"";
        axios.get(url).then(response => {
        vueModel.results = response.data;
        var results = vueModel.results;
        //All the data
        //One city long and lat example - Just loop -
        for(var i = 0; i < response.data.results.length; i++)
        {
				if (response.data.results[i].hasOwnProperty('coordinates'))
				{
    			//var marker = L.marker([response.data.results[i].coordinates.latitude, response.data.results[i].coordinates.longitude],{icon: greenIcon}).addTo(map).bindPopup("This is a air quality measurement.");
    			if(vueModel.items.length == 0)
    			{
					vueModel.items.push({
						latitude: response.data.results[i].coordinates.latitude,
						longitude: response.data.results[i].coordinates.longitude,
						pm25: null,
						pm10: null,
						so2: null,
						no2: null,
						o3: null,
						co: null,
						bc: null
					});
					var meas = response.data.results[i].parameter;
					vueModel.items[0].meas = response.data.results[i].value;
    			}
    			for(var k = 0; k < vueModel.items.length; k++)
    			{
    				if(vueModel.items[k].longitude == response.data.results[i].coordinates.longitude && 
    					vueModel.items[k].latitude == response.data.results[i].coordinates.latitude &&
    					vueModel.items.length > 0)
    				{
    					var meas = response.data.results[i].parameter;
    					vueModel.items[k].meas = response.data.results[i].value;
    				}
    				else
    				{
						vueModel.items.push({
							latitude: response.data.results[i].coordinates.latitude,
							longitude: response.data.results[i].coordinates.longitude,
							pm25: null,
							pm10: null,
							so2: null,
							no2: null,
							o3: null,
							co: null,
							bc: null
						});
    					var meas = response.data.results[i].parameter;
    					vueModel.items[vueModel.items.length-1].meas = response.data.results[i].value;
    				}
    			}
        	}           	
        }
      })
	}, 1000);
});