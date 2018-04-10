'use strict';

const session = require('express-session');
const express = require('express');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

var server = app.listen(process.env.PORT || 5000, function() {
	console.log("Server is ready and listening!");
});

// ===========================
// WEBSOCKET SERVER CODE BELOW
// ===========================

var wss = new WebSocket.Server({ server: server });
var USERS = [];

function sendAll(message) {
	for (var i=0; i < USERS.length; i++) {
		// check readystate or else it'll crash
		if (USERS[i].readyState == USERS[0].OPEN) {
			USERS[i].send(message);
		}
	}
}

function findPair(user) {
	USERS.forEach(function (pair) {
		if (pair.pair == null && pair.username != user.username) {
			pair.pair = user.username;
			user.username = pair.username;
			console.log("Paired" + user.username + " with " + pair.username);

			return;
		}

		// TODO if no pair found...
		console.log("No empty pairs.  Please try again letter.");
	})
}

wss.on('connection', function (wsclient) {

	wsclient.on('message', function (data) {
		var m = JSON.parse(data);
		if (m.action == 'ident') {
			var client = m.username;
			USERS.push({
				username: m.username,
				color: m.color,
				pair: null
			});
		} else if (m.action == 'pair') {
			var user = players[m.username];
			findPair(user);
		}

		console.log(USERS.length, USERS);

	});

	wsclient.on('close', function(client) {
		USERS.splice(USERS.indexOf(client), 1); // remove one socket from array of clients
	});

	wsclient.on('error', function(client) {
		USERS.splice(USERS.indexOf(client), 1); // remove one socket from array if error
	});

});
