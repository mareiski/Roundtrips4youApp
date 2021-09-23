importScripts("https://www.gstatic.com/firebasejs/5.5.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.5.0/firebase-messaging.js");

let config = {
  apiKey: "AIzaSyBVkBCl3dY49g3lyX8ns1SYsErNdkCO8sc",
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

messaging.setBackgroundMessageHandler(function(payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
});
