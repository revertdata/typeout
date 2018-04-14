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

function addMessage(data) {

	var pair = data.to;
	var user = data.from;

	// check readystate or else it'll crash
	if (USERS[pair].readyState == USERS[user].OPEN) {
		USERS[pair].wsclient.send(JSON.stringify({
			action: 'message',
			status: 200,
			time: data.time,
			message: data.message,
			from: user,
			to: pair
		}));
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
				action: 'paired',
				status: 200,
				me: user.username,
				userColor: user.color,
				pair: user.pair,
				pairColor: pair.color
			}));

			pair.wsclient.send(JSON.stringify({
				action: 'paired',
				status: 200,
				me: pair.username,
				userColor: pair.color,
				pair: pair.pair,
				pairColor: user.color
			}));
		}
	}
}

function disconnect(data) {
	USERS[data.pair].wsclient.send(JSON.stringify({
		action: 'disconnected',
		status: 200,
		message: data
	}));

	console.log(data.user + ' and ' + data.pair + ' disconnected.');
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
				wsclient: wsclient
			};
			findPair(USERS[user]);

		} else if (m.action == 'pair') {
			var user = USERS[m.username];
			user.pair = '';
			findPair(user);
		} else if (m.action == 'sendmsg') {
			addMessage(m);
		} else if (m.action == 'disconnect') {
			disconnect(m);
		}

	});

	wsclient.on('close', function(client) {
		for (var user in USERS) {
			if (USERS[user].wsclient == wsclient) {
				delete USERS.user;
			}
		}
	});

	wsclient.on('error', function(client) {
		for (var user in USERS) {
			if (USERS[user].wsclient == wsclient) {
				delete USERS.user;
				console.log('error with', USERS[user].username, '. Forced to disconnect.');
			}
		}
	});

});
