if (process.argv.length < 3) {
    console.log('Usage');
    console.log('$ node app.js <secret> [<stream-port> <websocket-port>]');

    process.exit(1);
}

const STREAM_MAGIC_BYTES = 'jsmp';
var STREAM_SECRET = process.argv[2],
    STREAM_PORT = process.argv[3] || 8082,
    WEBSOCKET_PORT = process.argv[4] || 8084;

var width = 1280,
    height = 720;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

wss.on('connection', function(ws) {
    var streamHeader = new Buffer(8);

    streamHeader.write(STREAM_MAGIC_BYTES);
    streamHeader.writeUInt16BE(width, 4);
    streamHeader.writeUInt16BE(height, 6);

    ws.send(streamHeader, {binary: true});

    console.log("New WebSocket Connected. Total %d clients", wss.clients.size);

    ws.on('close', function(code, msg) {
        console.log("Disconnected WebSocket. Total %d clients", wss.clients.size);
    });
});

wss.broadcast = function(data, opts) {
    this.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, opts);
        }
    });
};

const HTTP = require('http');
var incomingServer = HTTP.createServer(function(req, res) {
    var params = req.url.substr(1).split('/');

    if (params[0] == STREAM_SECRET) {
        res.connection.setTimeout(0);

        width = params[1] || 640;
        height = params[2] || 480;

        console.log("Stream connected: %s:%d size: %d x %d",
            req.socket.address()['address'],
            req.socket.address()['port'],
            width, height
        );

        req.on('data', function(data) {
            wss.broadcast(data, {binary: true});
        });
    }
    else {
        console.log("Failed stream connection: %s:%d - wrong secret.",
            req.socket.address()['address'],
            req.socket.address()['port']
        );
        res.end();
    }
}).listen(STREAM_PORT);

console.log("Listening for MPEG Stream on http://127.0.0.1:%d/%d/%d/%d",
    STREAM_PORT, STREAM_SECRET, width, height
);
console.log("Awaiting WebSocket connections on ws://127.0.0.1:%d/", WEBSOCKET_PORT);

const express = require('express');
var web = express();

web.use('/', express.static(__dirname));
web.listen(3000, function() {
    console.log("Demo web page listening on http://127.0.0.1:3000");
});
