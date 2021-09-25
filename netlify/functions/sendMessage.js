const admin = require("firebase-admin");

exports.handler = async function(event) {
  const token = event.queryStringParameters.token;
  const message = JSON.parse(event.queryStringParameters.message);

  const cred = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  console.log(cred);

  if (
    firebase.default.apps.findIndex(x => x.name === "adminMessaging") === -1
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(cred),
      databaseURL: "https://roundtrips4you.firebaseio.com",
      name: "adminMessaging"
    });
  }

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
