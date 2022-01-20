const fs = require("fs");
const httpServer = require("https").createServer({
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.crt"),
  ca: fs.readFileSync("./root.crt"),
  requestCert: true,
});

const io = require("socket.io")(httpServer, {
  connectTimeout: 20000,
  pingTimeout: 20000,
  pingInterval: 10000,
});

const state = {
  lock: 0,
  shutdown: 0,
};

const shutdownTimer = 1800;
const lockTimer = 300;

io.on("connection", (socket) => {
  socket.emit("config", {
    shutdownAfter: shutdownTimer,
    lockAfter: lockTimer,
    state,
  });

  socket.on("getWallpaper", () => {
    socket.emit("wallpaper", {
      wallpaper: fs.readFileSync("./wallpaper.png"),
    });
  });

  socket.on("getWallpaperOffline", () => {
    socket.emit("wallpaper_offline", {
      wallpaper: fs.readFileSync("./wallpaper-offline.png"),
    });
  });

  socket.on("adminLock", (fn) => {
    state.lock = Date.now();
    console.log("Locking all machines");
    io.emit("config", {
      shutdownAfter: shutdownTimer,
      lockAfter: lockTimer,
      state,
    });
    fn();
  });

  socket.on("adminShutdown", (fn) => {
    state.shutdown = Date.now();
    console.log("Shutting all machines down");
    io.emit("config", {
      shutdownAfter: shutdownTimer,
      lockAfter: lockTimer,
      state,
    });
    fn();
  });
});

httpServer.listen(4000);
