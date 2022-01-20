# bCloud

Ever left your encrypted laptop unlocked in a public place? I have, and every time, I worry someone might steal my data. This project implements remote screen lock and shutdown of your Linux based machine.

bCloud establishes a Socket.IO connection using mutual TLS authentication. The client-server model is written in such a way that if you issue a lock or shutdown command, it will eventually always reach your client machines, even if they are taken offline! This is possible due to the client starting a lock and shutdown timer if it loses its connection to the server, guaranteeing that your machine will remain safe. If you unlock your screen after it has been automatically locked, the shutdown timer is cancelled, allowing you to work offline.

## Building instructions

First, you need to generate a PKI. This includes a root CA, a server key/cert and a client key/cert. You can use the included tiny-ca tool, or just use OpenSSL or any PKI tool of your choice. Just make sure to issue the server certificate in the same common name as your servers domain name. Once you have generated your certificates and keys, you need to edit the paths in `index.js`, `client.js` and `admin.js`. In addition, you need to edit the URL to your server in these files.

Then build the project by executing `npm run build`. You should now have two binary files, `bcloud` and `admin`. The `bcloud` binary is the one you should auto start on your laptops. The `admin` binary is used to issue lock and shutdown commands, either call it with `--lock` or `--shutdown`.

On the server side, copy the source folder and execute `node index.js`, and you should have your bCloud server up and running on port 4000 by default.

## Quirks

- There is no documentation or code comments. This project was written for use by myself, but after showing it to some friends, I was asked to put the source code on Github.
- The bCloud client currently only works on Gnome 3 in Linux. If you want support for other WMs or OSes, you need to change the `exec()` calls and file paths in `client.js`.
- The client will pull an online and offline wallpaper from the server. The online wallpaper will be shown when the client is connected to the server and the offline wallpaper will be shown otherwise. To use your own wallpaper, edit `wallpaper.png` and `wallpaper-offline.png` on the server. The reason this functionality is included is because I rotate wallpapers during the day, and I want them synced on all my machines.
