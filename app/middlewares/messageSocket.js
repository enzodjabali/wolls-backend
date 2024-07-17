const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Socket.io server\n');
});

// Create a Socket.io instance and attach it to the server
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Start the server on port 3002
server.listen(process.env.APP_SOCKET_PORT, () => {
    console.log(`Socket.io is running on port ${process.env.APP_SOCKET_PORT}`);
});

// Export the server and io instance
module.exports = { server, io };
