"use strict";

var request = require('request');

class OpenWeatherMap {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	getWeather(originTown, callback) {
		var url = 'http://api.openweathermap.org/data/2.5/forecast/city?q=' + originTown + ',de&APPID=' + this.apiKey + '&units=metric';
        request(url, function (error, response, body) {
  			if (!error && response.statusCode == 200) {
    			var bodyJSON = JSON.parse(body);
    			var apiTemperature = bodyJSON.list[0].main.temp;
                var apiHumidity = bodyJSON.list[0].main.humidity;
    			var apiWind = (bodyJSON.list[0].wind.speed)*3.6;
    			
                try{
                    var apiSnow = bodyJSON.list[0].snow['3h'];
                }catch(e){
                    var apiSnow = 0;
                }

                try{
                    var apiRain = bodyJSON.list[0].rain['3h'];
                }catch(e){
                    var apiRain = 0;
                }

    			var weather = {
    				temperature: apiTemperature,
    				wind: apiWind,
                    humidity: apiHumidity,
                    snow: apiSnow,
    				rain: apiRain
    			};

    			callback(null, weather);
  			}
		})
	}

}

module.exports = OpenWeatherMap;
