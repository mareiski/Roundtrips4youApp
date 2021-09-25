const admin = require("firebase-admin");
const firebase = require("firebase");

exports.handler = async function(event) {
  const token = event.queryStringParameters.token;
  const message = JSON.parse(event.queryStringParameters.message);

  const cred = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  console.log(firebase.apps);

  let index = firebase.apps.findIndex(x => x.name === "adminMessaging");
  let app;
  if (index === -1) {
    app = admin.initializeApp(
      {
        credential: admin.credential.cert(cred),
        databaseURL: "https://roundtrips4you.firebaseio.com"
      },
      "adminMessaging"
    );
  } else {
    app = firebase.apps[index];
  }

  const messaging = admin.messaging(app);

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
