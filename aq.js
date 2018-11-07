var vueModel = new Vue({
	el: "#whole_thing",
	data: {
		latitude: 44.9537,
		longitude: -93.0900,
		results: [],
		items: [],
		location: "Empire State Building",
		info: []
	},
	computed: {
		url: function() {
 			return "https://us1.locationiq.com/v1/search.php?key=174d247abdd29b&q=" + encodeURI(this.location) + "&format=json"
 		}
	},
	methods: {
		xhr: function() {
			var wholething = document.getElementById("whole_thing")
			if (wholething.requestFullscreen) {
			  wholething.requestFullscreen();
			} else if (wholething.msRequestFullscreen) {
			  wholething.msRequestFullscreen();
			} else if (wholething.mozRequestFullScreen) {
			  wholething.mozRequestFullScreen();
			} else if (wholething.webkitRequestFullscreen) {
			  wholething.webkitRequestFullscreen();
			}

			vueModel.info = "Requesting ...";
			var rq = new XMLHttpRequest();

			rq.onreadystatechange = function() {
				if (rq.readyState === XMLHttpRequest.DONE) {
					if (rq.status === 200) {
						vueModel.info = JSON.parse(rq.responseText);
						if (vueModel.info.length > 0 && vueModel.info[0].hasOwnProperty('lat') && vueModel.info[0].hasOwnProperty('lon')) {
							vueModel.latitude = vueModel.info[0].lat;
							vueModel.longitude = vueModel.info[0].lon;
							map.setView([vueModel.latitude, vueModel.longitude], map.getZoom());
						}
					} else {
						vueModel.info = "Request Failed";
					}
				}
			};
			console.log(vueModel.url);
			rq.open("GET", vueModel.url);
			rq.send();
		}
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
		current_radius = Math.round(current_corner.distanceTo(map.getCenter()));
		vueModel.latitude = Math.round((map.getCenter().lat)*1000)/1000;
		vueModel.longitude = Math.round((map.getCenter().lng)*1000)/1000;
		//current_radius = current_distance/1000;
		const url = "https://api.openaq.org/v1/measurements?coordinates="+vueModel.latitude+","+vueModel.longitude+"&radius="+current_radius+"";
        axios.get(url).then(response => {
        vueModel.results = response.data;
        var results = vueModel.results;
        vueModel.items = [];
        //All the data
        //One city long and lat example - Just loop -
        /*for(var i = 0; i < response.data.results.length; i++)
        {
				if (response.data.results[i].hasOwnProperty('coordinates'))
				{
    			//var marker = L.marker([response.data.results[i].coordinates.latitude, response.data.results[i].coordinates.longitude],{icon: greenIcon}).addTo(map).bindPopup("This is a air quality measurement.");
    			if(vueModel.items.length == 0)
    			{
					vueModel.items.push({
						latitude: Math.round(response.data.results[i].coordinates.latitude*1000)/1000,
						longitude: Math.round(response.data.results[i].coordinates.longitude*1000)/1000,
						pm25: null,
						pm10: null,
						so2: null,
						no2: null,
						o3: null,
						co: null,
						bc: null
					});
					var meas = response.data.results[i].parameter;
					vueModel.items[0][meas] = response.data.results[i].value;
    			}

				var found = false;
    			for(var k = 0; k < vueModel.items.length; k++)
    			{

    				if(vueModel.items[k].longitude == Math.round(response.data.results[i].coordinates.longitude*1000)/1000 && 
    					vueModel.items[k].latitude == Math.round(response.data.results[i].coordinates.latitude*1000)/1000
    					)
    				{
	    				//console.log(i);
	    				found = true;
    					var meas = response.data.results[i].parameter;
    					vueModel.items[k][meas] = response.data.results[i].value;
						//console.log(vueModel.items);
    					break;
    				}

    			}
    			if(!found)
    			{
					vueModel.items.push({
						latitude: Math.round(response.data.results[i].coordinates.latitude*1000)/1000,
						longitude: Math.round(response.data.results[i].coordinates.longitude*1000)/1000,
						pm25: null,
						pm10: null,
						so2: null,
						no2: null,
						o3: null,
						co: null,
						bc: null
					});
					var meas = response.data.results[i].parameter;
					vueModel.items[vueModel.items.length-1][meas] = response.data.results[i].value;
    			}
        	}           	
<<<<<<< HEAD
        }*/
=======
        }

        //Populate the AQ markers on the map
        for(var i = 0; i < vueModel.items.length; i++)
        {
        	var _long = vueModel.items[i].longitude;
        	var _lat = vueModel.items[i].latitude;
        	var pm25 = vueModel.items[i].pm25;
        	var pm10 = vueModel.items[i].pm10;
        	var so2 = vueModel.items[i].so2;
        	var no2 = vueModel.items[i].no2;
        	var o3 = vueModel.items[i].o3;
        	var co = vueModel.items[i].co;
        	var bc = vueModel.items[i].bc;

			var ul = document.createElement('ul');

		    if(_long != null)
		    	{
		   		var li = document.createElement('li');
			    ul.appendChild(li);
		    	li.innerHTML += "Longitude: "+_long;}
		    if(_lat != null)
		    	{
		   		var li2 = document.createElement('li');
		   		ul.appendChild(li2);
		    	li2.innerHTML += "Latitude: "+_lat;}
		    if(pm25 != null)
		    	{
		   		var li3 = document.createElement('li');
		  		ul.appendChild(li3);
		    	li3.innerHTML += "PM25: "+pm25;}
		    if(pm10 != null)
		    	{
		   		var li4 = document.createElement('li');
		  		ul.appendChild(li4);
		    	li4.innerHTML += "PM10: "+pm10;}
		    if(so2 != null)
		    	{
		 		var li5 = document.createElement('li');
		  		ul.appendChild(li5);
		    	li5.innerHTML += "SO2: "+so2;}
		    if(no2 != null)
		    	{
		  		var li6 = document.createElement('li');
		  		ul.appendChild(li6);
		    	li6.innerHTML += "NO2: "+no2;}
		    if(o3 != null)
		    	{
		   		var li7 = document.createElement('li');
		  		ul.appendChild(li7);
		    	li7.innerHTML += "O3: "+o3;}
		    if(co != null)
		    	{
		   		var li8 = document.createElement('li');
		  		ul.appendChild(li8);
		    	li8.innerHTML += "CO: "+co;}
		    if(bc != null)
		    	{
		   	 	var li9 = document.createElement('li');
		  		ul.appendChild(li9);
		    	li9.innerHTML += "BC: "+bc;}

			marker = L.marker([_lat, _long],{icon: greenIcon}).addTo(map)
			.bindPopup(ul).on('mouseover', function(event){
			  this.openPopup();
			});;
        }
>>>>>>> fa490889aafb002e1c00e8ecab3c1dec2a3eeb1f
      })
	}, 1000);
});


