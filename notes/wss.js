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
