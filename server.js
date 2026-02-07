const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", socket => {

  socket.on("join", room => {
    socket.join(room);

    const users = [...io.sockets.adapter.rooms.get(room) || []];
    socket.emit("users", users.filter(id => id !== socket.id));
    socket.to(room).emit("new-user", socket.id);
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });

});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () =>
  console.log("Server running on port", PORT)
);
