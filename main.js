const express = require('express');
const app = express();
const server = app.listen(3000)
const io = require('socket.io')(server, {
    cors: {
        origin: "https://mq-chat.web.app/",
        methods: ["GET", "POST"]
    }
})

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on("connection", (socket) => {
    console.log("user entered the chat")

    socket.on("disconnect", () => {
        var userName = socket.userName;
        if (userName) {
            socket.broadcast.emit("userleave", { msg: `${userName} desconectou` })
        }
    })
    socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg);
    })

    socket.on("typing", (obj) => {
        socket.broadcast.emit("typing", obj);
    })

    socket.on("finishtyping", (obj) => {
        socket.broadcast.emit("finishtyping", obj);
    });

    io.users = [];
    io.online = [];

    socket.on("join", (userName) => {
        if (userName) {
            socket.userName = userName;
            socket.broadcast.emit("join", { msg: `${userName} conectou` })
        }
    })
})
