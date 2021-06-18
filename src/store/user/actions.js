import { auth } from "../../firebaseInit.js";
import sharedMethods from "../../../sharedMethods.js";
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
          commit("demoSession/resetRoundtrip");
          resolve(true);
          payload.context.$router.replace({ path: "/" });
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
  signInOrUpWithGoogle(payload) {
    return new Promise(resolve => {
      getFirebase().then(firebase => {
        var provider = new firebase.default.auth.GoogleAuthProvider();
        auth
          .authRef()
          .signInWithPopup(provider)
          .then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            const credential = firebase.auth
              .GoogleAuthProvider()
              .credential(token);

            if (payload.signUp) {
              dispatch("createUserEntry");
            }

            // Sign in with credential from the Google user.
            auth
              .signInWithCredential(credential)
              .then(function() {
                payload.context.$router.replace("/");
                resolve(true);
              })
              .catch(function(error) {
                console.log(error);
                resolve(false);
              });
          })
          .catch(function(error) {
            console.log(error);
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

            if (payload.context.$store.getters["demoSession/isInDemoSession"]) {
              payload.context.$store
                .dispatch("demoSession/saveRoundtrip", user.user().uid)
                .then(newTripId => {
                  // evt.target.submit()
                  payload.context.$router.replace(
                    "rundreise-ansehen/" + newTripId
                  );
                  resolve(true);
                });
            } else {
              evt.target.submit();
              payload.context.$router.replace("/");
              resolve(true);
            }
          },
          err => {
            console.log(err);
            sharedMethods.showErrorNotification(
              "Du konntest leider nicht registriert werden, bitte kontaktiere uns unter hello@roundtrips4you.de"
            );

            resolve(false);
          }
        );
    });
  },
  updateUserReputation(reputation) {
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
  deleteAccount(context) {
    auth
      .user()
      .delete()
      .then(function() {
        sharedMethods.showSuccessNotification(
          "Schade, dein Konto wurde gelöscht"
        );
        context.$router.push("/");
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
  createUserEntry() {
    const timeStamp = Date.now();

    db.collection("User").add({
      reputation: 0,
      userUID: auth.user().uid,
      createdAt: new Date(timeStamp)
    });

    dispatch("verifyMail");
  },
  verifyMail() {
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
