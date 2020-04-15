const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: process.env.PORT || 8080
});

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log(message);
    });

    ws.on('disconnect', function () {
        console.log('disconnect');
    });
});
