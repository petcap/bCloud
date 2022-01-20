TinyCA - A minimal set of scripts to create and maintain a certificate authority.

Requirements: PHP, including support for OpenSSL

===== Create a new root CA =====
First edit DN parameters in the three PHP files. Change it so that it
has a correct name, email address and so on.

Then run this script:
$ php root_create.php

A new CA will be created. Its key and corresponding certificate will be
put inside the 'certs' folder.

===== Create new certificates =====
There are two scripts depending on what type of certificate you want to
create. server_create.php creates a server certificate suitable for web
servers, ftp server, openvpn servers etc. user_create.php creates a
certificate for clients, suitable for use in a web browser, openvpn
client etc.

To create a new user/server certificate, run somthing like:
$ php server_create.php acme.com
where acme.com will be the common name of the certificate.

Again, the certificates will be stored under the 'certs' folder. To get
more control over the parameters being signed into the certificate, edit
the soruce code of the script directly.

===== Converting certificates to P12 for Android/Firefox/Chrome =====
No built in support, but OpenSSL has a one-liner for it:
$ openssl pkcs12 -export -out CN_NAME.pfx -inkey CN_NAME.key -in CN_NAME.crt

===== Revocation lists =====
No built in support (the OpenSSL PHP API does not support it at all), so
you will have to use OpenSSL directly to generate CRLs. I don't remember
the commands right now so ask google instead!
