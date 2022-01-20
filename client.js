const fs = require("fs");
const path = require("path");
const wallpaper = require("wallpaper");
const exec = require("child_process").execFileSync;

const cache = {};

const socket = require("socket.io-client")("https://YOUR-SERVER:4000", {
  cert: fs.readFileSync(path.join(__dirname, "./client.crt")),
  key: fs.readFileSync(path.join(__dirname, "./client.key")),
  ca: fs.readFileSync(path.join(__dirname, "./root.crt")),
  reconnectionDelay: 100,
  reconnectionDelayMax: 10000,
  timeout: 5000,
});

const shutdownIfLocked = () => {
  if (!screenIsLocked()) {
    console.log("Would have shut down, but screen has been unlocked");
    return;
  }

  console.log("Shutting down");
  shutdown();
};

const shutdown = () => {
  exec("shutdown", ["-h", "0"], {}, (err, data) => {
    if (err) {
      console.log("Failed to shut down:", err);
    }
  });
};

const lockScreen = () =>
  exec("gnome-screensaver-command", ["-l"], {}, (err, data) => {
    if (err) {
      console.log("Failed to lock screen:", err);
    }
  });

const screenIsLocked = () => {
  const stdout = exec("gnome-screensaver-command", ["-q"], {}, (err, data) => {
    if (err) {
      console.log("Failed to lock screen:", err);
      return true;
    }
  });
  return !stdout.toString().includes("inactive");
};

let config = {
  shutdownAfter: 7200,
  lockAfter: 300,
  state: {},
};

let shutdownTimeout;
let lockTimeout;

socket.on("connect", () => {
  console.log("Connected to server");

  if (shutdownTimeout) {
    clearTimeout(shutdownTimeout);
    console.log("Aborting shutdown");
    shutdownTimeout = undefined;
  }

  if (lockTimeout) {
    clearTimeout(lockTimeout);
    console.log("Aborting screen lock");
    lockTimeout = undefined;
  }

  if (cache.wallpaper == undefined) {
    socket.emit("getWallpaper");
  } else {
    fs.writeFileSync("/dev/shm/wp", cache.wallpaper);
    wallpaper.set("/dev/shm/wp");
  }

  if (cache.wallpaper_offline == undefined) {
    socket.emit("getWallpaperOffline");
  }
});

socket.on("disconnect", () => {
  console.log("Lost connection to the server, attempting to reconnect");

  if (cache.wallpaper_offline != undefined) {
    fs.writeFileSync("/dev/shm/wp", cache.wallpaper_offline);
    wallpaper.set("/dev/shm/wp");
  }

  if (shutdownTimeout) {
    clearTimeout(shutdownTimeout);
    shutdownTimeout = undefined;
  }

  if (lockTimeout) {
    clearTimeout(lockTimeout);
    lockTimeout = undefined;
  }

  shutdownTimeout = setTimeout(() => {
    shutdownIfLocked();
  }, config.shutdownAfter * 1000);

  lockTimeout = setTimeout(() => {
    lockScreen();
  }, config.lockAfter * 1000);

  console.log("Locking screen in", config.lockAfter, "seconds");
  console.log("Shutting down in", config.shutdownAfter, "seconds");
});

socket.on("config", (data) => {
  console.log("Received server configuration");

  if (data.state.lock != undefined) {
    if (data.state.lock > config.state.lock) {
      lockScreen();
    }
  }

  if (data.state.shutdown != undefined) {
    if (data.state.shutdown > config.state.shutdown) {
      shutdown();
    }
  }

  config = data;
});

socket.on("wallpaper", (data) => {
  console.log(
    "Received wallpaper of size",
    Math.round(data.wallpaper.length / 1000),
    "KB"
  );
  cache.wallpaper = data.wallpaper;
  fs.writeFileSync("/dev/shm/wp", data.wallpaper);
  wallpaper.set("/dev/shm/wp");
});

socket.on("wallpaper_offline", (data) => {
  console.log(
    "Received offline wallpaper of size",
    Math.round(data.wallpaper.length / 1000),
    "KB"
  );
  cache.wallpaper_offline = data.wallpaper;
});

const terminateApplication = () => {
  console.log();
  fs.writeFileSync("/dev/shm/wp", "");
  process.exit(0);
};

process.on("SIGINT", terminateApplication);
process.on("SIGTERM", terminateApplication);
process.on("SIGUSR1", () => {
  socket.disconnect();
  console.log("Reconnecting...");
  delete cache.wallpaper;
  delete cache.wallpaper_offline;
  setTimeout(() => socket.connect(), 0);
});

console.log("Starting bCloud 2");
