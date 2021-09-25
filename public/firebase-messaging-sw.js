importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

let config = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "roundtrips4you.firebaseapp.com",
  databaseURL: "https://roundtrips4you.firebaseio.com",
  projectId: "roundtrips4you",
  storageBucket: "gs://roundtrips4you.appspot.com",
  messagingSenderId: "295257024914",
  appId: "1:295257024914:web:11432138a1faf186"
};

try {
  firebase.initializeApp(config);
} catch (e) {
  console.log(e);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
});
