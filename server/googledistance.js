"use strict";

var request = require('request');

class GoogleDistance {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	calculateDistance(origin, destination, mode, callback) {
		var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origin + '&destinations=' + destination+ '&traffic_model=best_guess&departure_time=now&mode=' + mode + '&key=' + this.apiKey;
		request(url, function (error, response, body) {
  			if (!error && response.statusCode == 200) {
    			var bodyJSON = JSON.parse(body);
    			var apiStatus = bodyJSON.status;

    			try{
    				var apiValue = bodyJSON.rows[0].elements[0].duration_in_traffic.value;
				}catch(e){
					var apiValue = bodyJSON.rows[0].elements[0].duration.value;
				}

    			callback(null, apiValue);
  			} else {
  				callback(true, null);
  			}
		})
	}

}

module.exports = GoogleDistance;
