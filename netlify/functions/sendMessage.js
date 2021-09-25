const admin = require("firebase-admin");

exports.handler = async function(event) {
  const token = event.queryStringParameters.token;
  const message = JSON.parse(event.queryStringParameters.message);

  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  admin.initializeApp({
    credential: admin.credential.cert(cred),
    databaseURL: "https://roundtrips4you.firebaseio.com",
    name: "adminMessaging"
  });

  const messaging = admin.messaging();

  await messaging.sendToDevice(token, message);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET"
  };

  return {
    statusCode: 200,
    headers,
    body: "message sent"
  };
};
