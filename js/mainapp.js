var locations = [{
        title: 'Rupa 4, Satyanagar',
        location: {
            lat: 20.281173,
            lng: 85.851325
        },
        type: ["Home"],
        id: 'ChIJ7SXXYqqgGToRX8ruG4_ynUY',
    },{
        title: 'Forum Mart',
        location: {
            lat: 20.2783847,
            lng: 85.84558849999999
        },
        type: ["PokeStop"],
        id: 'ChIJj4AmTlSnGToRAHYXsQkbsPM',
    }, {
        title: 'New-Marrion',
        location: {
            lat: 20.277295,
            lng: 85.84444099999999
        },
        type: ["PokeStop"],
        id: 'ChIJWY7_FlSnGToRxb1Lq421ADo',
    }, {
        title: 'All that Jazz',
        location: {
            lat: 20.2909549,
            lng: 85.8432895
        },
        type: ["PokeStop"],
        id: 'ChIJffsQJfwJGToRcCwsZON4PRs',
    }, {
        title: 'Jharpada',
        location: {
            lat: 20.2836321,
            lng: 85.87192999999999
        },
        type: ["PokeStop"],
        id: 'ChIJB9liQ6SgGToR3xyBjzDIcBw',
    }, {
        title: 'Master Canteen',
        location: {
            lat: 20.274909,
            lng: 85.847093
        },
        type: ["PokeStop"],
        id: 'ChIJSXNrF06nGToRFM9Uo1vPvIg',
    }, {
        title: 'Bhavani Mall',
        location: {
            lat: 20.2862057,
            lng: 85.84939799999999
        },
        type: ["PokeStop"],
        id: 'ChIJaYv7wgEKGToRdJv00qULjZs',
    }, {
        title: 'Kali mandir',
        location: {
            lat: 20.2831395,
            lng: 85.85058169999999
        },
        type: ["PokeStop"],
        id: 'ChIJ71-iE_4JGToRI9L1JApd0tM',
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
		center: {lat: 20.281173, lng: 85.851325},
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
    	var defaultIcon = makeMarkerIcon('0091ff');

   		// Create a "highlighted location" marker color for when the user mouse over the marker.
    	var highlightedIcon = makeMarkerIcon('FFFF24');

		// Create a marker per location, and put into marker array.
		var marker = new google.maps.Marker({
			position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: locId,
			type: type
		});

		// Push the marker to our marker array.
		viewModel.filteredLocations()[i].marker = marker;
		markers.push(marker);

		// Create an onlick event to open an infowindow at each marker.
        marker.addListener('click', function() {
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

function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

/*function populateInfoWindow(marker, infoWindow){ //this function render the information into info window. It takes 2 parameter marker and infowindow
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {//if infowindow's marker parameter is not equal to the passed marker
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;//setting the passed marker value to the infowindow's marker
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
			// Use streetview service to get the closest streetview image within
			// 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
	}*/
	
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
