'use strict';

const session = require('express-session');
const express = require('express');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

function sendAll(message) {
	for (var i=0; i < CLIENTS.length; i++) {
		// check readystate or else it'll crash
		if (CLIENTS[i].readyState == CLIENTS[0].OPEN) {
			CLIENTS[i].send(message);
		}
	}
}

var server = app.listen(process.env.PORT || 5000, function() {
	console.log("Server is ready and listening!");
});

// ===========================
// WEBSOCKET SERVER CODE BELOW
// ===========================

var wss = new WebSocket.Server({ server: server });
var CLIENTS = [];

wss.on('connection', function (wsclient) {
	CLIENTS.push(ws);

	wsclient.on('message', function (data) {
		console.log("Client ", wsclient, " said ", data);
	});

	ws.on('close', function(client) {
		// remove one socket from array of clients
		CLIENTS.splice(CLIENTS.indexOf(client), 1);
	});

	ws.on('error', function(client) {
		// remove one socket from array if error
		CLIENTS.splice(CLIENTS.indexOf(client), 1);
	});
});
