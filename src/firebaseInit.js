import Vue from "vue";
import firebase from "firebase";
import { firestorePlugin } from "vuefire";

Vue.config.productionTip = false;

Vue.use(firestorePlugin);

let db = null;
let storage = null;
let messaging = null;

const auth = {
  context: null,
  ui: null,

  init(context, store, router) {
    this.context = context;

    let config = {
      apiKey: process.env.FIREBASE_KEY,
      authDomain: "roundtrips4you.firebaseapp.com",
      databaseURL: "https://roundtrips4you.firebaseio.com",
      projectId: "roundtrips4you",
      storageBucket: "gs://roundtrips4you.appspot.com",
      messagingSenderId: "295257024914",
      appId: "1:295257024914:web:11432138a1faf186"
    };

    const app = firebase.initializeApp(config);
    // navigator.serviceWorker
    //   .register("firebase-messaging-sw.js", {
    //     scope: "firebase-cloud-messaging-push-scope"
    //   })
    //   .then(registration => {

    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });

    if (process.env.MODE === "spa") {
      messaging = firebase.messaging(app);
      messaging.getToken().then(token => {
        this.fcmToken = token;
        if (this.fcmToken) store.dispatch("user/setFCMToken", this.fcmToken);
      });
    }

    db = firebase.firestore(app);
    storage = firebase.storage(app);

    // enables offline usage of data
    db.enablePersistence().catch(err => {
      console.log("firebase persistence failed");
      if (err.code === "failed-precondition") {
        console.log("multiple tabs opened");
      } else if (err.code === "unimplemented") {
        console.log("browser too old");
      }
    });

    firebase.auth().onAuthStateChanged(user => {
      store.dispatch("user/setCurrentUser");
      if (this.fcmToken) store.dispatch("user/setFCMToken", this.fcmToken);

      if (router.$route) {
        let requireAuth = router.$route.matched.some(
          record => record.meta.requireAuth
        );
        let guestOnly = router.$route.matched.some(
          record => record.meta.guestOnly
        );

        if (requireAuth && !user) router.push("/login");
        else if (guestOnly && user) router.push("/Home");
      }
    });
  },
  user() {
    return firebase.auth().currentUser;
  },
  logout(router, store) {
    firebase
      .auth()
      .signOut()
      .then(r => {
        store.dispatch("tripList/resetCachedTrips");
        store.dispatch("tipList/resetCachedTips");
        router.push("/Login");
      });
  },
  authRef() {
    return firebase.auth();
  }
};

export { auth, db, storage, messaging };
