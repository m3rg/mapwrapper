/**
 * Depends lscache for getting current location
 * @param {type} type
 * @param {type} el
 * @param {type} conf
 * @param {type} callback
 * @returns {gmaps}
 */
var mapWrapper = function(type, el, conf, callback){
	if("gmaps" == type) {
		return new gmaps(el, conf, callback);
	}
};
/**
 * Wrapper for google maps
 * @param {DOMNode} el
 * @param {Object} conf lat|lng|zoom
 * @param {Function} callback
 * @returns gmap
 */
var gmaps = function(el, conf, callback) {
	this.map = null;
	this.markerLat = null;
	this.marketLng = null;
	this.EVENT_IDLE = "idle";
	this.EVENT_CLICK = "click";
	this.NAME_SPACE = "google";
	this.globalMarkers = [];
	this.globalInfoWindows = [];
	this.mapInitialized = false;
	var _this = this;
	/**
	 * Initialization method with a single marker selection
	 */
	this.initialize = function() {
		this.map = new google.maps.Map(el, {
			center: {lat: conf.lat, lng: conf.lng},
			zoom: conf.zoom
		});
		this.findMyLocation();
		var previousMarkers = [];
		this.addListener("click", function(event){
			var marker = _this.addMarker(event.latLng.lat(), event.latLng.lng());
            _this.removeMarkers();
			_this.markerLat = marker.getPosition().lat();
			_this.markerLng = marker.getPosition().lng();
			_this.globalMarkers.push(marker);
		});
        if(callback) {
			callback();
        }
	}
	/**
	 * Initialize base
	 * @param {Float} lat Optional
	 * @param {Float} lng Optional
	 * @returns {undefined}
	 */
	this.initializeBase = function(lat, lng, zoom) {
		if(typeof lat == "undefined" || !lat) {
			lat = conf.lat;
		}
		if(typeof lng == "undefined" || !lng) {
			lng = conf.lng;
		}
        if(typeof zoom == "undefined" || !zoom) {
			zoom = conf.zoom;
		}
		this.map = new google.maps.Map(el, {
			center: {lat: lat, lng: lng},
			zoom: zoom
		});
		this.mapInitialized = true;
        if(callback) {
			callback();
        }
	}
	
	this.getMarkerLat = function() {
		return this.markerLat;
	}
	
	this.getMarkerLng = function() {
		return this.markerLng;
	}
	/**
	 * Add a listener to given map with the defined event and run the handler when the event is occurred
	 * @param GoogleMapObject map
	 * @param string eventType click, mouseover etc.
	 * @param function handler The function to be run when the event is occurred
	 */
	this.addListener = function(eventType, handler) {
		google.maps.event.addListener(this.map, eventType, handler);
	}
	/**
	 * Add a marker to given map and position
	 * @param GoogleMapObject map
	 * @param object position
	 * @returns google.maps.Marker Object
	 */
	this.addMarker = function(lat, lng, conf) {
		if(!conf)
			conf = {};
		conf.map = this.map;
		conf.position = this.getPosFromLatLng(lat, lng);
		return new google.maps.Marker(conf);
	}
	/**
	 * Add an info window
	 * @param string content
	 * @returns {google.maps.InfoWindow}
	 */
	this.addInfoWindow = function(content) {
		return new google.maps.InfoWindow({
			content: content
		});
	}
	/**
	 * Bind an infowindow to a marker
	 * @param google.maps.Marker marker
	 * @param google.maps.InfoWindow infowindow
	 * @param string eventType click etc.
	 */
	this.addInfoToMarker = function(marker, infowindow, eventType, closeOthers) {
		marker.addListener(eventType, function(){
			if(typeof closeOthers != "undefined" && closeOthers) {
				_this.closeInfoWindows();
			}
			infowindow.open(_this.map, marker);
		});
	}
	/**
	 * Returns google.maps position object
	 * @param float lat
	 * @param float lng
	 * @returns {google.maps.LatLng}
	 */
	this.getPosFromLatLng = function(lat, lng) {
		return new google.maps.LatLng(lat, lng);
	}
	
	this.findMyLocation = function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				_this.map.setCenter(pos);
			}, function() {
				console.log("Location not found!");
			});
		} else {
			console.log("Geolocation is not supported!");
		}
	}
	/**
	 * Icon configuration object from paths
	 * @param string fillColor
	 * @param string strokeColor
	 * @returns object
	 */
	this.addMarkerIconVector = function(fillColor, strokeColor) {
		if("undefined" == typeof(fillColor))
			fillColor = "#FFF";
		if("undefined" == typeof(strokeColor))
			strokeColor = "#000";
		return {
			path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
			fillColor: fillColor,
			fillOpacity: 1,
			strokeColor: strokeColor,
			strokeWeight: 2,
			scale: 1,
		}
	}
	/**
	 * Close given or global info windows
	 * @param {Array} infoWindows
	 */
	this.closeInfoWindows = function(infoWindows)
	{
		if("undefined" == typeof(infoWindows) || infoWindows.length < 1) {
			infoWindows = this.globalInfoWindows;
		}
		for(var i in infoWindows) {
			if(!infoWindows.hasOwnProperty(i)) {
				continue;
			}
			infoWindows[i].close();
		}
	}
	/**
	 * If markers are not set, global markers will be removed
	 * @param Array markers optional
	 */
	this.removeMarkers = function(markers)
	{
		if("undefined" == typeof(markers) || markers.length < 1) {
			markers = this.globalMarkers;
		}
		for(var i in markers) {
			if(!markers.hasOwnProperty(i)) {
				continue;
			}
			markers[i].setMap(null);
		}
		if("undefined" == typeof(markers) || markers.length < 1) {
			this.globalMarkers = [];
		}
	}
	
	this.addLoadingPane = function() {
		$(el).append("<div id=\"map-loader\" style=\"font-weight: bold; position: relative; width:100%; height: 100%; background-color: #FFF; padding-top: 150px; padding-left: 150px;\">LOADING...</div>");
	}
	
	this.removeLoadingPane = function() {
		$("#map-loader").remove();
	}
	/**
	 * Find the current address and call the calback function. Use cache
	 * @param {Function} callback
	 * @param {Boolean} persist If true, bypass cache
	 * @param {Integer} cacheMin in seconds
	 * @returns {Boolean}
	 */
	this.getAddressOfMyLocation = function(callback, persist, cacheMin) {
		if(!persist || typeof persist == "undefined") {
			var results = lscache.get("currentAddress");
			if(results) {
				console.log("from cache");
				return callback(results);
			}
		}
		if(!navigator.geolocation) {
			return false;
		}
		navigator.geolocation.getCurrentPosition(function(position) {
			var latLng = {lat: position.coords.latitude, lng: position.coords.longitude};
			if(!google) {
				return latLng;
			}
			var geocoder = new google.maps.Geocoder;
			geocoder.geocode({"location": latLng}, function(results, status){
				if(status === google.maps.GeocoderStatus.OK) {
					if(!cacheMin || typeof cacheMin == "undefined")
						cacheMin = 100;
					var data = _this.parseAddressResult(results);
					lscache.set("currentAddress", data, cacheMin);
					callback(data);
				}
			});
		});
	}
	/**
	 * Centers the map to the given lat, lng
	 * @param {Float} lat
	 * @param {Float} lng
	 */
	this.setCenter = function(lat, lng)
	{
		this.map.setCenter(this.getPosFromLatLng(lat, lng));
	}
	/**
	 * get center coordinates of current viewed area
	 * @param {Object} map Optional
	 * @returns {Object}
	 */
	this.getCenter = function(map)
	{
		if(typeof map == "undefined" || !map) {
			map = this.map;
		}
		return {
			lat: map.getCenter().lat(),
			lng: map.getCenter().lng()
		};
	}
	/**
	 * Sets the zoom to given value
	 * @param {Integer} zoom
	 */
	this.setZoom = function(zoom)
	{
		this.map.setZoom(zoom);
	}
	/**
	 * Returns map's zoom level
	 * @returns {Integer}
	 */
	this.getZoom = function()
	{
		return this.map.getZoom();
	}
	/**
	 * Parses the geolocation address query result
	 * @param {Object} results
	 * @returns {Object}
	 */
	this.parseAddressResult = function(results)
	{
		var data = {
			"formatted_address": results[0].formatted_address,
			/*"street": results[0].address_components[0].short_name,
			"district": results[0].address_components[1].long_name,
			"county": results[0].address_components[2].long_name,
			"city": results[0].address_components[3].long_name,
			"country": results[0].address_components[4].long_name,
			"country_code": results[0].address_components[4].short_name,
			"zip": results[0].address_components[5].short_name,*/
			"lat": results[0].geometry.location.lat(),
			"lng": results[0].geometry.location.lng()
		};
		$.each(results, function(index, addr){
			if(addr.types[0] == "country") {
				data.country = addr.address_components[0].long_name;
				data.country_code = addr.address_components[0].short_name;
			} else if(addr.types[0] == "administrative_area_level_1") {
				data.city = addr.address_components[0].long_name;
			} else if(addr.types[0] == "administrative_area_level_2") {
				data.county = addr.address_components[0].long_name;
			} else if(addr.types[0] == "administrative_area_level_4") {
				data.district = addr.address_components[0].long_name;
			} else if(addr.types[0] == "street_address" || addr.types[0] == "route") {
				//data.street = addr.address_components[1].short_name;
				for(var i in addr.address_components) {
					if(addr.address_components[i].types[0] == "street_number") {
						data.street_no = addr.address_components[i].long_name;
					} else if(addr.address_components[i].types[0] == "route") {
						if(addr.address_components[i].long_name.match(/sokak/i)) {
							data.street = addr.address_components[i].short_name;
						} else {
							data.avenue = addr.address_components[i].short_name;
						}
					}
				}
				/*if(addr.address_components[0].long_name) {
					data.street_no = addr.address_components[0].long_name;
				}*/
			} else if(addr.types[0] == "postal_code") {
				data.zip = addr.address_components[0].short_name;
			}
		});
		return data;
	}
	/**
	 * Finds the readeble address of given lat, lng and calls the callback function
	 * @param {Float} lat
	 * @param {Float} lng
	 * @param {Function} callback
	 */
	this.addressFromLatLng = function(lat, lng, callback)
	{
		var _this = this;
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({"location": {lat: lat, lng: lng}}, function(results, status){
			if(status === google.maps.GeocoderStatus.OK) {
				callback(_this.parseAddressResult(results));
			}
		});
	}
	/**
	 * Finds the lat, lng of given readeble address and calls the callback function
	 * @param {String} address
	 * @param {Function} callback
	 */
	this.latLngFromAddress = function(address, callback)
	{
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({"address": address}, function(results, status){
			if(status === google.maps.GeocoderStatus.OK) {
				if(callback) {
					callback(results[0].geometry.location.lat(), results[0].geometry.location.lng());
				}
			}
		});
	}
	
	this.triggerEvent = function(obj, eventType)
	{
		return new google.maps.event.trigger(obj, eventType);
	}
	/**
	 * Fix with triggering resize event when map is initialized inside hidden div
	 */
	this.resizeFix = function()
	{
		var center = this.getCenter();
		this.triggerEvent(this.map, "resize");
		this.setCenter(center.lat, center.lng);
	}
}