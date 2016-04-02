"use strict";

const EventEmitter = require('events').EventEmitter;
const WebSocketServer = require('ws').Server
const byline = require('byline');
const net = require('net');
const logger = console;

const PORT = 1234;
const HOST = '127.0.0.1';

//
//

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    logger.log("new websocket connection");
    ws.on('close', close);
    ws.on('error', (err) => {
        logger.error("websocket error: %s", err.message);
        close();
    });
    const sock = net.connect(PORT, HOST, () => {
        ws.on('message', (msg) => { sock.write(msg); });
        sock.on('data', (data, flags) => { ws.send(data); });
    });
    sock.setEncoding('utf8');
    sock.on('close', close);
    sock.on('error', (err) => {
        logger.error("socket error: %s", err.message);
        close();
    });
    function close() {
        ws.close();
        sock.end();
    }
});

//
//

const server = net.createServer((socket) => {
    const conn = createConnection(socket);
}).on('error', (err) => {
    throw err;
});

server.listen({ port: PORT, host: HOST, }, () => {
    const address = server.address();
    console.log("server listening on %s:%d", HOST, PORT);
});

const connections = {};
let nextConnectionId = 1;
function createConnection(socket) {
    const id = nextConnectionId++;
    const conn = new EventEmitter;
    conn.id = id;
    conn.socket = socket;
    socket.on('close', () => {
        logger.log("connection id %d closed", conn.id);
        delete connections[id];
    });

    socket.setEncoding('utf8');

    const stream = byline(socket);
    stream.on('data', (line) => {
        console.log("cid=%d received line '%s'", id, line);
        // TODO: parse incoming data + dispatch message
        socket.write(line + "\n");
    });

    connections[id] = conn;
    logger.log("new connection id %d", conn.id);
    return conn;
}