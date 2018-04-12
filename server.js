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
			status: 201,
			time: data.time,
			message: data.msg,
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
				status: 201,
				me: user.username,
				pair: user.pair
			}));

			pair.wsclient.send(JSON.stringify({
				action: 'paired',
				status: 201,
				me: pair.username,
				pair: pair.pair
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
			user.pair = '';
			findPair(user);
		} else if (m.action == 'sendmsg') {
			console.log(m);
			addMessage(m);
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
