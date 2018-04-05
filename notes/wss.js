const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast to all
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState) {
            // ahhhhh haha i wasnt paying attention
        }
    })
}

wss.on('connection', function (ws) {
    ws.on('message', function (data) {
        // Broadcast to everyone else
        wss.clients.forEach(function (client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

var sendWord = function() {
    var words = ["monkey", "pizza", "lasagna", "burrito", "soccer", "bentobox"];
    var r = Math.random(Math.random() * words.length);
    var t = var Math.floor(Math.random() * 2000);

    setTimeout(function () {
        wss.broadcast(words[r]);
        sendWord();
    }, t);
}
