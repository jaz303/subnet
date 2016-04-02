"use strict";

const PORT = 1234;
const HOST = '127.0.0.1';

const EventEmitter = require('events').EventEmitter;
const net = require('net');
const logger = console;

const server = net.createServer((socket) => {
    const conn = createConnection(socket);
}).on('error', (err) => {
    throw err;
});

server.listen({ port: PORT, host: HOST, }, () => {
    const address = server.address();
    console.log("server listening on %s:%d", HOST, PORT);
});

let connections = {};
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
    connections[id] = conn;
    logger.log("new connection id %d", conn.id);
    return conn;
}