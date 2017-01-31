var locations = [{
	
        title: 'Marathalli Bridge',
        location: {
            lat: 37.793945,
            lng: -122.407079
        },
        type: ["Home"],
        id: '4a788bcdf964a520d9e51fe3',
    },{
        title: 'Diamond District',
        location: {
            lat: 37.763695,
            lng: -122.479830
        },
        type: ["PokeStop"],
        id: '4b7629aff964a520f0402ee3',
    }, {
        title: 'Ecospace ',
        location: {
            lat: 37.738948,
            lng: -122.479902
        },
        type: ["PokeStop"],
        id: '4a918d27f964a520a81a20e3',
    }, {
        title: '100 Feet Road',
        location: {
            lat: 37.794188,
            lng: -122.404117
        },
        type: ["PokeStop"],
        id: '4abfdac7f964a5209f9220e3',
    }, {
        title: 'Brookfield',
        location: {
            lat: 37.781281,
            lng: -122.463974
        },
        type: ["PokeStop"],
        id: '49eaa620f964a52087661fe3',
    }];	
	//model
var Location = function(data) {
	var self = this;
	self.title = data.title;
	self.location = data.location;
	self.type = data.type;
	self.id = data.id;
	self.show = ko.observable(true);
	};

//this is view model function
//1. it stores the locations in an observable array for knockout doc
//2. here the data are displayed in knockout format

var ViewModel = function() {
	var self = this;
	self.locs = ko.observableArray(locations);
	self.query = ko.observable('');
	self.filteredLocations = ko.observableArray();//array to store all locations info/data
	self.mapErrorMessage = ko.observable(false);
	self.apiErrorMessage = ko.observable(false);

	for (var i = 0 ; i < locations.length; i++) {//iterating through the locations object
		var loc = new Location(locations[i]);
		self.filteredLocations.push(loc);//adding the locations in filteredLocations array
	}

	self.filterFunctions = ko.computed(function() {
		var value = self.query();
		for (var i = 0; i < self.filteredLocations().length; i++) {//now iterating through the filtered location array
			if (self.filteredLocations()[i].title.toLowerCase().indexOf(value) >= 0) {//to check if it is not empty 
				self.filteredLocations()[i].show(true);
				if (self.filteredLocations()[i].marker) {//if it has a marker
					self.filteredLocations()[i].marker.setVisible(true);//show the marker
				}
			} else {
				self.filteredLocations()[i].show(false);//else don't show
				if (self.filteredLocations()[i].marker) {
					self.filteredLocations()[i].marker.setVisible(false);
				}
			}
		}
	});

	self.showInfo = function(locations) {
		google.maps.event.trigger(locations.marker, 'click');
	};
};

var map;

var markers = [];
      
function initMap() {//style reference during course video

	var styles = [
	{
                featureType: 'water',
                stylers: [
                {color: '#19a0d8'}
                ]
            },{
                featureType: 'administrative',
                elementType: 'labels.text.stroke',
                stylers: [
                {color: '#ffffff'},
                {weight: 6}
                ]
            },{
                featureType: 'administrative',
                elementType: 'labels.text.fill',
                stylers: [
                {color: '#e85113'}
                ]
            },{
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [
                {color: '#efe9e4'},
                {lightness: -40}
                ]
            },{
                featureType: 'transit.station',
                stylers: [
                {weight: 9},
                {hue: '#e85113'}
                ]
            },{
                featureType: 'road.highway',
                elementType: 'labels.icon',
                stylers: [
                {visibility: 'off'}
                ]
            },{
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [
                {color: '#efe9e4'},
                {lightness: -25}
                ]
            }, 
	];
	
	//created the map and deployed in div with id map. Required property center and zoom
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.763695, lng: -122.479830},
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});

	
	//initializing a drawing manager, chose polygon
	var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          }
        });
		
	//initializing a google map function for info window
	var largeInfowindow = new google.maps.InfoWindow();
	for (var i = 0; i < viewModel.filteredLocations().length; i++) {//iterating through the array which contains all the locations
		var locId = viewModel.filteredLocations()[i].id;
		var position = viewModel.filteredLocations()[i].location;
		var title = viewModel.filteredLocations()[i].title;
		var type = viewModel.filteredLocations()[i].type;

		// Style the marker a bit. This will be our listing marker icon.
    	var defaultIcon = makeMarkerIcon('Before', type);

   		// Create a "highlighted location" marker color for when the user mouse over the marker.
    	var highlightedIcon = makeMarkerIcon('After', type);
		// Create a marker per location, and put into marker array.
		var marker = new google.maps.Marker({
			map: map,
			type: type,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
			highlightedIcon: highlightedIcon,
			defaultIcon: defaultIcon,
			id: locId,
		});

		// Push the marker to our marker array.
		viewModel.filteredLocations()[i].marker = marker;
		markers.push(marker);

		// Create an onlick event to open an infowindow at each marker.
        marker.addListener('click', function() {//onlclick 1) some animation 2) calling populateInfoWindow function
        	var self = this;
        	self.setAnimation(google.maps.Animation.BOUNCE);
        	setTimeout(function() {
        		self.setAnimation(null);
        	}, 1400);
        	populateInfoWindow(this, largeInfowindow);//contents which will be displayed in the infomarker area
        });
		// Two event listener - One for mouse over, one for mouse out. to change the color back and forth. 
        marker.addListener('mouseover', function() {
        	this.setIcon(this.highlightedIcon); 
        });
        marker.addListener('mouseout', function() {
        	this.setIcon(this.defaultIcon);
        });
	}
}

function makeMarkerIcon(beforeAfter, type) {

    var markerImage = new google.maps.MarkerImage(	'img/' + type + '_' + beforeAfter + '.svg',
        new google.maps.Size(64, 64),
        new google.maps.Point(0, 0),
        new google.maps.Point(32, 64),
        new google.maps.Size(64, 64));
        return markerImage;
}

function populateInfoWindow(marker, infowindow){ //this function render the information into info window. It takes 2 parameter marker and infowindow
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {//if infowindow's marker parameter is not equal to the passed marker
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;//setting the passed marker value to the infowindow's marker
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          
          var CLIENT_ID_Foursquare = '?client_id=LLZ2Y4XNAN2TO4UN4BOT4YCC3GVPMSG5BVI545HG1ZEMBDRM';
		  var CLIENT_SECRET_Foursquare = '&client_secret=0UTHYFC5UAFI5FQEXVAB5WIQREZCLCANHT3LU2FA2O05GW3D';

	/*Foursquare api ajax request*/
						$.ajax({
								type: "GET",
								dataType: 'json',
								cache: false,
								url: 'https://api.foursquare.com/v2/venues/' + marker.id + CLIENT_ID_Foursquare + CLIENT_SECRET_Foursquare + '&v=20170115',
								async: true,
								success: function(data) {
										console.log(data.response);
										console.log(data.response.venue.name);
										console.log(data.response.venue.location.formattedAddress);
					//Map info windows to each Location in the markers array
										var venuename = data.response.venue.name;
										var formattedAddress = data.response.venue.location.formattedAddress;
										

								marker.infowindow = infowindow;


										/*callback function if succes - Will add the rating received from foursquare to the content of the info window*/
										if (!data.response) {
												data.response = 'No rating in foursquare';
										}
								},
								error: function(data) {
										/*callback function if error - an alert will be activaded to notify the user of the error*/
										alert("Could not load data from foursquare.");
								}
						})
        }
	}
	
function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }

      // This function will loop through the listings and hide them all.
      function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }

var viewModel = new ViewModel(); //make a new instance of ViewModel function
ko.applyBindings(viewModel);

function googleError() {
    viewModel.mapErrorMessage(true);
}
