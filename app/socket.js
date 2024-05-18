const http = require('http');
const socketIO = require('socket.io');
const mongoose = require("mongoose");

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

// Export the server and io instance


// Start the server on port 3002
const PORT_SOCKET = 3002;
server.listen(PORT_SOCKET, () => {
    console.log(`Server is running on port ${PORT_SOCKET}`);
});

const sendMessageToGroup = (groupId, senderId, content) => {
    console.log(groupId)
    const messageData = {
        groupId: groupId,
        id: new mongoose.Types.ObjectId().toString(),
        senderId: senderId,
        content: content,
    };

    // Emit the message to the group
    if (io.to(groupId).emit('group_message', messageData)) {
        console.log('Sent message from sendMessageToGroup function:', messageData);
    } else {
        console.log('cant send the message from api')
    }
};

module.exports = { server, io, sendMessageToGroup };
