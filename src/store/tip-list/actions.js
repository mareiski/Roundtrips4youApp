import { db, auth } from "../../firebaseInit.js";
import Tip from "../../classes/tip.ts";
import sharedMethods from "app/sharedMethods.js";

export default {
  /**
   * @returns a tip object of tip with given id
   * !important! this method gives you only public or user tips
   * if tip is not found or not published it return null
   * @see Tip
   */
  fetchSingleTip({ commit, getters }, payload) {
    return new Promise((resolve, reject) => {
      // check if this tip already exists
      let tip = getters.getSingleTip(payload.TipId);

      if (tip && !payload.forceRefresh) {
        resolve(tip);
      } else {
        // fetch this tip only
        let roundtipsRef;

        // fetch tip only if its a user tip or a public tip
        if (payload.isUserTip) {
          roundtipsRef = db
            .collection("Tips")
            .where("TipId", "==", payload.TipId)
            .where("userId", "==", auth.user().uid)
            .limit(1);
        } else {
          roundtipsRef = db
            .collection("Tips")
            .where("TipId", "==", payload.TipId)
            .where("published", "==", true)
            .limit(1);
        }

        roundtipsRef
          .get()
          .then(snapshot => {
            if (snapshot.empty) resolve(null);

            snapshot.forEach(doc => {
              tip = Tip.fromObject(doc.data());

              // add tip to tip list
              commit("addTip", tip);

              resolve(tip);
            });
          })
          .catch(function(error) {
            // sth went wrong (no user or not a public tip)
            console.log("Error " + error);
            sharedMethods.showErrorNotification(
              "Auf diesen Tipp kann nicht zugegriffen werden."
            );
            resolve(null);
          });
      }
    });
  },
  fetchAllUserTips({ commit, getters }) {
    return new Promise(resolve => {
      let userTipList = getters.getUsersTipList;
      if (userTipList && userTipList.length > 0) {
        resolve(userTipList);
      }

      let tipArr = [];

      if (!auth.user()) resolve(null);

      let roundtipsRef = db
        .collection("Tips")
        .where("creator", "==", auth.user().uid)
        .orderBy("createdAt")
        .limit(20);
      roundtipsRef
        .get()
        .then(snapshot => {
          let index = 0;

          // cancel here if no tips created yet
          if (snapshot.size === 0) resolve(null);

          snapshot.docs.forEach(doc => {
            // add tip
            tipArr.push(Tip.fromObject(doc.data()));

            index++;

            // its last tip > finished
            if (index === snapshot.size) {
              commit("addTips", tipArr);
              resolve(tipArr);
            }
          });
        })
        .catch(function(error) {
          console.log(error);
          resolve(null);
        });
    });
  },
  fetchPublicTipsForCountry({ commit, getters }, country) {
    return new Promise(resolve => {
      let publicTipList = getters.getPublicTipList;
      if (publicTipList && publicTipList.length > 0) {
        resolve(publicTipList);
      }

      let tipArr = [];

      let roundtipsRef = db
        .collection("Tips")
        .where("country", "==", country)
        .orderBy("createdAt")
        .limit(20);
      roundtipsRef.get().then(snapshot => {
        let index = 0;

        // cancel here if no tips created yet
        if (snapshot.empty) resolve(null);

        snapshot.forEach(doc => {
          // add tip
          tipArr.push(Tip.fromObject(doc.data()));

          index++;

          // its last tip > finished
          if (index === snapshot.size) {
            commit("addTips", tipArr);
            resolve(tipArr);
          }
        });
      });
    });
  },
  addTip({ commit }, tip) {
    return new Promise(resolve => {
      try {
        let tempTipId = Math.floor(Math.random() * 10000000000000);
        tip.TipId = tempTipId;

        // add arrival departure
        if (auth.user()) {
          // add new tip with new temp TipId
          db.collection("Tips")
            .add(tip.toObject())
            .then(() => {
              // get create tip and change TipId to doc id
              let roundtipsRef = db
                .collection("Tips")
                .where("TipId", "==", tempTipId)
                .limit(1);

              roundtipsRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                  db.collection("Tips")
                    .doc(doc.id)
                    .update({
                      TipId: doc.id
                    })
                    .then(() => {
                      commit("addTip", tip);

                      sharedMethods.showSuccessNotification(
                        "Tipp wurde erstellt"
                      );
                      tip.TipId = doc.id;
                      resolve(doc.id);
                    });
                });
              });
            });
        } else {
          newTipObject.TipId = newTipObject.TipId + "temp";
          commit("addTip", newTipObject);
          resolve(newTipObject.TipId);
        }
      } catch (e) {
        console.log(e);
        resolve(null);
      }
    });
  },

  updateTip({ commit }, tip) {
    return new Promise(resolve => {
      if (auth.user()) {
        db.collection("Tips")
          .doc(tip.TipId)
          .update(tip.toObject())
          .then(function() {
            // add tip to tip list
            commit("setTip", tip);
            resolve(true);
          })
          .catch(e => {
            console.log(e);
            resolve(false);
          });
      } else {
        commit("setTip", tip);
        resolve(true);
      }
    });
  },
  deleteTip({ commit }, TipId) {
    return new Promise(resolve => {
      db.collection("Tips")
        .doc(TipId)
        .delete()
        .then(function() {
          sharedMethods.showSuccessNotification("Tipp wurde gelöscht");
          commit("removeTip", TipId);
          resolve(true);
        })
        .catch(function(error) {
          sharedMethods.showErrorNotification(
            "Tipp konnte nicht gelöscht werden"
          );
          console.log(error);
          resolve(false);
        });
    });
  },
  resetCachedTips({ commit }) {
    commit("setTips", []);
  }
};
