const fs = require("fs");
const path = require("path");

const socket = require("socket.io-client")("https://YOUR-SERVER:4000", {
  cert: fs.readFileSync(path.join(__dirname, "./client.crt")),
  key: fs.readFileSync(path.join(__dirname, "./client.key")),
  ca: fs.readFileSync(path.join(__dirname, "./root.crt")),
});

socket.on("connect", () => {
  if (process.argv.includes("--lock")) {
    console.log("Locking all machines...");
    socket.emit("adminLock", () => {
      console.log("Got ack from server!");
      process.exit(0);
    });
  } else if (process.argv.includes("--shutdown")) {
    console.log("Shutting down all machines...");
    socket.emit("adminShutdown", () => {
      console.log("Got ack from server!");
      process.exit(0);
    });
  } else {
    console.log("No command supplied. Try --lock or --shutdown.");
    process.exit(0);
  }
});

console.log("Starting admin tool");
