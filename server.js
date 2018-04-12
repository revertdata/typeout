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

var USERS = {};

function addMessage(message, user, pair) {
	// check readystate or else it'll crash
	if (USERS[pair].readyState == USERS[user].OPEN) {
		USERS[pair].send(message);
	}
}

function findPair(user) {
	for (var client in USERS) {
		var pair = USERS[client];

		if (user.ID != pair.ID && user.pair == null && pair.pair == null) {

			user.pair = pair.username;
			pair.pair = user.username;

			// startChat(user, pair);
			console.log("Paired " + user.username + " with " + pair.username);
			USERS[user.username].wsclient.send(JSON.stringify({
				me: user.username,
				pair: user.pair,
				status: 201
			}));

			pair.wsclient.send(JSON.stringify({
				me: pair.username,
				pair: pair.pair,
				status: 201
			}));
		}
	}
}

wss.on('connection', function (wsclient) {

	wsclient.on('message', function (data) {
		var m = JSON.parse(data);
		if (m.action == 'ident') {
			var id = Date.now();
			var user = m.username;
			USERS[user] = {
				ID: id,
				username: m.username,
				color: m.color,
				pair: null,
				pendingMessages: [],
				wsclient: wsclient
			};
			findPair(USERS[user]);

		} else if (m.action == 'pair') {
			var user = USERS[m.username];
			findPair(user);
		}

	});

	wsclient.on('close', function(client) {
		for (var user in USERS) {
			if (USERS[user].wsclient == wsclient) {
				delete USERS.user;
				console.log(USERS[user].username, 'disconnected.');
			}
		}
	});

	wsclient.on('error', function(client) {
		for (var user in USERS) {
			if (USERS[user].wsclient == wsclient) {
				console.log('error with', USERS[user].username, '. Forced to disconnect.');
				delete USERS.user;
			}
		}
	});

});
