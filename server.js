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
	if (USERS[pair].wsclient.readyState == USERS[user].wsclient.OPEN) {
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

	// check readystate or else it'll crash
	if (USERS[user.ID].wsclient.readyState == USERS[user.ID].wsclient.OPEN) {

		for (var client in USERS) {
			var pair = USERS[client];

			if (user.ID != pair.ID && user.pair == null && pair.pair == null) {

				user.pair = pair.ID;
				pair.pair = user.ID;

				// startChat(user, pair);
				console.log("Paired " + user.username + " with " + pair.username);
				USERS[user.ID].wsclient.send(JSON.stringify({
					action: 'paired',
					status: 200,
					me: user.ID,
					username: user.username,
					userColor: user.color,
					pair: user.pair,
					pairname: USERS[pair.ID].username,
					pairColor: pair.color
				}));

				pair.wsclient.send(JSON.stringify({
					action: 'paired',
					status: 200,
					me: pair.ID,
					username: pair.username,
					userColor: pair.color,
					pair: pair.pair,
					pairname: USERS[user.ID].username,
					pairColor: user.color
				}));
			}
		}
	}
}

function disconnect(data) {
	// check readystate or else it'll crash
	if (USERS[data.pair].wsclient.readyState == USERS[data.user].wsclient.OPEN) {
		USERS[data.pair].wsclient.send(JSON.stringify({
			action: 'disconnected',
			status: 200,
			message: data
		}));

		console.log(USERS[data.user].username + ' and ' + USERS[data.pair].username + ' disconnected.');
	}
}

wss.on('connection', function (wsclient) {

	wsclient.on('message', function (data) {
		var m = JSON.parse(data);
		if (m.action == 'ident') {
			var user = Date.now();
			USERS[user] = {
				ID: user,
				username: m.username,
				color: m.color,
				pair: null,
				wsclient: wsclient
			};
			findPair(USERS[user]);

		} else if (m.action == 'pair') {
			var user = USERS[m.ID];
			user.pair = null;
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
				disconnect({
					action: 'disconnect',
					message: {
						status: true,
						class: 'disabled',
						message: USERS[user].username + " has left the chat."
					},
					user: user,
					pair: USERS[USERS[user].pair].ID
				});
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
