var GoogleDistance = require('./googledistance.js');
var OpenWeatherMap = require('./openweathermap.js');
var express = require('express');
var io = require('socket.io')(3001);

var app = express();

var googleApiKey = 'YOUR_GOOGLE_API_KEY';
var openWeatherMap = 'YOUR_OPENWEATHER_API_KEY';

var debug = true;

var user = [
	{
		id: 0,
		name: 'René Veenhuis',
		secret: "YOUR_SECRET",
		origin: 'YOUR_ORIGIN',
    personalTime: [1, 0],
		destinations: {
			Schule: 'YOUR_DESTINATION', 
			Buero: 'YOUR_DESTINATION'
		},
    preferences: [
      {
        destination: 'Schule',
        time: [08, 00],
        status: false,
        mode: 'bicycling'
      },
      {
        destination: 'Buero',
        time: [09, 00],
        status: false,
        mode: 'driving'
      }
    ]
	}
];

// MODE OVERVIEW
// - walking
// - bicycling
// - driving
// - train
// - transit

var currentDate = new Date,
  currentDay = currentDate.getDate(),
  currentHours = currentDate.getHours(),
  currentMinutes = currentDate.getMinutes();

var apiData = {
  currentTime: [currentHours, currentMinutes]
};

var GoogleClass = new GoogleDistance(googleApiKey);
var WeatherClass = new OpenWeatherMap(openWeatherMap);

function updateApiData(origin, destination, mode, callback) {
  if (debug) console.log("updateApiData");
  GoogleClass.calculateDistance(origin, destination, mode, function (err, mapsData) {
          WeatherClass.getWeather(origin, function(err, weatherData) {

            apiData.traffic = {
              duration: [Math.floor(mapsData/3600), Math.floor(mapsData/60%60)]
            }

            apiData.weather = weatherData;

            callback(null, apiData);
          });
      });
}

io.sockets.on('connection', function (socket) {
  console.log('User connected');

  socket.on('switch', function(data) {
    user.forEach(function(element) {
      if(element.id == data.userId && element.secret == data.userSecret) {
        var preference = element.preferences[data.switchId];
        preference.status = data.switchStatus;

        if(preference.status) {
          element.deadline = {
            time: preference.time,
            destination: user[data.userId].destinations[preference.destination],
            mode: preference.mode
          };
        } else element.deadline = null;
      }
    });
    if(debug) console.log('Switch: ' + JSON.stringify(data));
  });

  socket.on('preferencesRequest', function(data) {

    user.forEach(function(element) {
      if(element.id == data.userId && element.secret == data.userSecret) {
        console.log('User found!');
        socket.emit("preferencesAnswer", element.preferences);
      } else console.log('User not found!');
    });
  });
});

app.get('/api', function (req, res) {
  var userId = req.query.userid;
  var userSecret = req.query.usersecret;

  user.forEach(function (element, index) {
    if(userId == element.id && userSecret == element.secret) {
      deadline = element.deadline || false;
      updateApiData(element.origin, deadline.destination, deadline.mode,function(err, data) {
        data.deadline = deadline;
        data.alarm = [];
        data.alarm[0] = data.deadline.time[0] - data.traffic.duration[0];
        data.alarm[1] = data.deadline.time[1] - data.traffic.duration[1];

        if(data.alarm[1] < 0) {
          data.alarm[1] = 60 + data.alarm[1];
          data.alarm[0]--;
        }

        // TODO IMPLEMENT PERSONAL TIME
        data.alarm[0] = data.alarm[0] - element.personalTime[0];

        var answer = {
          currentTime: apiData.currentTime,
          alarm: "false"
        };

        res.send(JSON.stringify(data));
      });   
    }
  });
});

app.listen(8080, function () {
  console.log('Server listening on port 8080!');
});
