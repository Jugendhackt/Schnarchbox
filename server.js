var express = require('express');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var apiServer = "http://172.16.108.120:3001/";


var debug = true;

var clients = [];

http.listen(1337, function(){
	console.log('listening on *:1337');
});


function setTime() {
	var date = new Date();
	var currentHour = date.getHours();
	if (currentHour < 10) {currentHour = "0" + currentHour};
	var currentMinute = date.getMinutes();
	if (currentMinute < 10) {currentMinute = "0" + currentMinute};

	var currentTime = currentHour + ":" + currentMinute;

	io.emit("time", currentTime);
} 

io.on('connection', function (socket) {
	console.log("connection found!");
	setTime();

	socket.on('sendRequest', function (data) {
		console.log('sendRequest: ' + data);
		var request = JSON.parse(data);

		var minute = request.time.substring(3,5);
		var hour = request.time.substring(0,2);

		// TODO: Vorhersage treffen
		// var forecast = hour + ":" + (Math.floor((Math.random()*10)) + parseInt(minute));

		minute = parseInt(minute) + 8;
		if(minute < 10) minute = "0" + minute;
		var forecast = hour + ":" + minute;

		var answer = {
			time: forecast
		};
		socket.emit('sendAnswer', JSON.stringify(answer));
		setTime();
		console.log("sendAnswer: " + JSON.stringify(answer));
	});
});

app.get('/alarm', function (req, res) {
	setTime();
	console.log("alarm!");
	io.emit("alarm", "");
});