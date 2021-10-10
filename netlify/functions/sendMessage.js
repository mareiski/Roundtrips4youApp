const admin = require("firebase-admin");
const firebase = require("firebase");

const cred = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
//const serviceAcc = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

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

exports.handler = async function(event) {
  const token = event.queryStringParameters.token;
  const message = JSON.parse(event.queryStringParameters.message);
  let tokens = [];

  if (token.includes(",")) {
    tokens = token.split(",");
  } else {
    tokens[0] = token;
  }

  const messaging = admin.messaging(app);

  let resp;
  await messaging.sendToDevice(tokens, message).then(response => {
    resp = response;
    console.log(response);
  });

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET"
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resp) || "error occured"
  };
};
