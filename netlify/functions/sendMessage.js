const admin = require("firebase-admin");

exports.handler = async function(event) {
  const token = event.queryStringParameters.token;
  const message = JSON.parse(event.queryStringParameters.message);

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://roundtrips4you.firebaseio.com",
    name: "admin"
  });

  const messaging = admin.messaging();

  messaging.sendToDevice(token, message);
};
