'use strict';

const session = require('express-session');
const express = require('express');
const WebSocket = require('ws');

const wss = new WebSocket.Server({
	port: 8080,
	perMessageDeflate: {
		zlibDeflateOptions: { // See zlib defaults.
			chunkSize: 1024,
			memLevel: 7,
			level: 3,
		},
		zlibInflateOptions: {
			chunkSize: 10 * 1024
		},
		// Other options settable:
		clientNoContextTakeover: true,	// Defaults to negotiated value.
		serverNoContextTakeover: true,	// Defaults to negotiated value.
		clientMaxWindowBits: 10,		// Defaults to negotiated value.
		serverMaxWindowBits: 10,		// Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10,			// Limits zlib concurrency for perf.
		threshold: 1024,				// Size (in bytes) below which messages
		// should not be compressed.
	}
});

var CLIENTS = [];
const app = express();
app.use(express.static('public'));

// ws.on('open', function open() {
// 	ws.send('something');
// });

// ws.on('message', function incoming(data) {
// 	console.log(data);
// });

wss.on('connection', function(ws) {
	CLIENTS.push(ws);
	ws.on('message', function(message) {

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

function sendAll(message) {
	for (var i=0; i < CLIENTS.length; i++) {
		// check readystate or else it'll crash
		if (CLIENTS[i].readyState == CLIENTS[0].OPEN) {
			CLIENTS[i].send(message);
		}
	}
}

app.listen(process.env.PORT || 5000, function() {
	console.log("Server is ready and listening!");
});
