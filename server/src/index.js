const express = require("express");
const upload = require("express-fileupload");
const app = express();
const cors = require("cors");
require("./config/dbConfig");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(upload());
const route = require("./routes/route");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Accept,X-Access-Token,X-Key,Authorization,X-Requested-With,Origin,Access-Control-Allow-Origin,Access-Control-Allow-Credentials"
  );
  next();
});

app.use("/", route);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRN_HOST,
  },
});

io.on("connection", (socket) => {
  // -------------------------------- for One-to-one-chat ------------------------------------
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join chat", ({ room }) => {
    socket.join(room);
  });

  socket.on("typing", ({ room, sender, receiver }) => {
    io.to(room).emit("typing", {
      room: room,
      sender: sender,
      receiver: receiver,
    });
  });

  socket.on("typing group", ({ room }) => {
    io.to(room).emit("typing group", {
      room: room,
    });
  });

  socket.on("stop typing", ({ room, sender, receiver }) => {
    io.to(room).emit("stop typing", {
      room: room,
      sender: sender,
      receiver: receiver,
    });
  });

  socket.on("stop typing group", ({ room }) => {
    io.to(room).emit("stop typing group", {
      room: room,
    });
  });

  socket.on("new message", ({ data, room, sender, receiver }) => {
    if (data.msg.personId === data.senderId) return;
    if (!data.msg.chatSenderId && !data.msg.personId) {
      return console.log("Message Sender or chat sender not defined!");
    }

    io.to(room).emit("message recieved", {
      data: data,
      room: room,
      sender: sender,
      receiver: receiver,
    });
  });

  socket.on("new message group", ({ data, room, users }) => {
    io.to(room).emit("message recieved group", {
      data: data,
      room: room,
    });
  });

  socket.off("setoff", (userData) => {
    socket.leave(userData.id);
  });
});
