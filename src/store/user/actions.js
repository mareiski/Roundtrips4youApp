import { auth, db } from "../../firebaseInit.js";
import sharedMethods from "../../../sharedMethods.js";
import Message from "src/classes/message.ts";
import axios from "axios";
const getFirebase = () => import("firebase");

export default {
  setCurrentUser: ({ commit }) => {
    commit("setUser", auth.user());
  },
  login: ({ commit }, payload) => {
    return new Promise(resolve => {
      auth
        .authRef()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(function() {
          resolve(true);
          payload.context.$router.replace({ path: "/Home" });
        })
        .catch(function(error) {
          console.log(error);
          resolve(false);
          if (error.code === "auth/user-not-found") {
            sharedMethods.showErrorNotification(
              "Dieser Benutzer existiert nicht"
            );
          } else {
            sharedMethods.showErrorNotification(
              "Das Passwort oder der Benutzername ist leider falsch"
            );
          }
        });
    });
  },
  signInOrUpWithGoogle({ dispatch }, payload) {
    return new Promise(resolve => {
      getFirebase().then(firebase => {
        var provider = new firebase.default.auth.GoogleAuthProvider();
        auth
          .authRef()
          .signInWithPopup(provider)
          .then(() => {
            if (payload.signUp) {
              dispatch("createUserEntry");
            }

            payload.context.$router.replace("/Home");
            resolve(true);
          })
          .catch(function(error) {
            console.log(error);
            sharedMethods.showErrorNotification(
              "Du konntest nicht registriert werden " + error
            );
            resolve(false);
          });
      });
    });
  },
  resetPassword(userEmail) {
    return new Promise(resolve => {
      auth
        .authRef()
        .sendPasswordResetEmail(userEmail)
        .then(function() {
          // Email sent.
          sharedMethods.showSuccessNotification(
            "Wir haben dir eine Email mit einem Resetlink gesendet"
          );

          resolve(true);
        })
        .catch(function(error) {
          console.log(error);

          // An error happened.
          sharedMethods.showErrorNotification(
            "Es ist ein Fehler aufgetreten, versuch es noch einmal"
          );

          resolve(false);
        });
    });
  },
  signUp({ dispatch }, payload) {
    return new Promise(resolve => {
      auth
        .authRef()
        .createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            dispatch("createUserEntry");

            sharedMethods.showSuccessNotification(
              "Juhuuu dein Konto wurde erfolgreich erstellt"
            );

            payload.context.$router.replace("/Home");
            resolve(true);
          },
          err => {
            console.log(err);
            if (err.code === "auth/email-already-in-use") {
              sharedMethods.showErrorNotification(
                "Du hast dich bereits registriert"
              );
            } else {
              sharedMethods.showErrorNotification(
                "Du konntest leider nicht registriert werden, bitte kontaktiere uns unter hello@roundtrips4you.de"
              );
            }

            resolve(false);
          }
        );
    });
  },
  async fetchUserEntry({ commit }) {
    let roundtripsRef = db
      .collection("User")
      .where("UserUID", "==", auth.user().uid)
      .limit(1);

    console.log(auth.user().uid);
    await roundtripsRef.get().then(snapshot => {
      commit("setUserEntry", snapshot.docs[0].data());

      return snapshot.docs[0].data();
    });
  },
  markAllMessagesAsSeen({ commit, dispatch, getters }) {
    commit("markAllMessagesAsSeen");
    dispatch("updateUserMessages", getters.userEntry.messages);
  },
  appendUserMessage({ dispatch, getters, commit }, msg) {
    commit("appendMessage", msg);
    dispatch("updateUserMessages", getters.userEntry.messages);
  },
  updateUserMessages({}, messages) {
    let roundtripsRef = db
      .collection("User")
      .where("UserUID", "==", auth.user().uid)
      .limit(1);
    roundtripsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        db.collection("User")
          .doc(doc.id)
          .update({ messages: messages });
      });
    });
  },
  updateUserEntry({}, entry) {
    let roundtripsRef = db
      .collection("User")
      .where("UserUID", "==", auth.user().uid)
      .limit(1);
    roundtripsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        db.collection("User")
          .doc(doc.id)
          .update(entry);
      });
    });
  },
  sendPushNotification({}, payload) {
    axios
      .get(
        "https://roundtrips4you.de/.netlify/functions/sendMessage?token=" +
          payload.token +
          "&message=" +
          JSON.stringify(payload.message)
      )
      .then(() => {
        console.log("message sent");
        console.log(
          "https://roundtrips4you.de/.netlify/functions/sendMessage?token=" +
            payload.token +
            "&message=" +
            JSON.stringify(payload.message)
        );
      });
  },
  setFCMToken({}, token) {
    if (!auth.user()) {
      return;
    }

    let roundtripsRef = db
      .collection("User")
      .where("UserUID", "==", auth.user().uid)
      .limit(1);
    roundtripsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        db.collection("User")
          .doc(doc.id)
          .update({ fcmToken: token });
      });
    });
  },
  updateUserReputation({}, reputation) {
    let roundtripsRef = db
      .collection("User")
      .where("UserUID", "==", auth.user().uid)
      .limit(1);
    roundtripsRef.get().then(snapshot => {
      snapshot.forEach(doc => {
        db.collection("User")
          .doc(doc.id)
          .update({ reputation: reputation });
      });
    });
  },
  deleteAccount({}, context) {
    auth
      .user()
      .delete()
      .then(function() {
        sharedMethods.showSuccessNotification(
          "Schade, dein Konto wurde gelöscht"
        );
        context.$router.push("/Login");
      })
      .catch(function(error) {
        console.log(error);
        if (error.code === "auth/requires-recent-login") {
          sharedMethods.showSuccessNotification(
            "Bitte melde dich erneut an, bevor du dein Konto löscht"
          );
        } else {
          sharedMethods.showSuccessNotification(
            "Es ist ein Fehler aufgetreten, dein Konto konnte nicht gelöscht werden"
          );
        }
      });
  },
  createUserEntry({ dispatch }) {
    const timeStamp = Date.now();
    const message = Message.createWelcomeMessage();

    db.collection("User").add({
      reputation: 0,
      userUID: auth.user().uid,
      createdAt: new Date(timeStamp),
      messages: [message]
    });

    dispatch("verifyMail");
  },
  verifyMail() {
    var actionCodeSettings = {
      // todo change to android app
      url: "https://roundtrips4you.de/login",
      // This must be true.
      handleCodeInApp: true
    };

    if (!auth.user().emailVerified) {
      auth
        .user()
        .sendEmailVerification(actionCodeSettings)
        .then(function() {
          sharedMethods.showSuccessNotification(
            "Wir haben dir eine Bestätigungsmail für deine Email gesendet"
          );
        })
        .catch(function(error) {
          console.log(error);
          sharedMethods.showErrorNotification(
            "Wir konnten dir leider keine email senden, bitte kontaktiere uns unter hello@roundtrips4you.de"
          );
          sharedMethods.showErrorNotification("Fehler: " + error);
        });
    }
  }
};
