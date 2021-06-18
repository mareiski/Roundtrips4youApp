import { db, auth } from "../../firebaseInit.js";
import Trip from "../../classes/trip.ts";
import sharedMethods from "app/sharedMethods.js";

export default {
  /**
   * @returns a trip object of trip with given id
   * !important! this method gives you only public or user trips
   * if trip is not found or not published it return null
   * @see Trip
   */
  fetchSingleTrip({ commit, getters }, payload) {
    return new Promise((resolve, reject) => {
      // check if this trip already exists
      let trip = getters.getSingleTrip(payload.TripId);
      if (trip && !payload.forceRefresh) {
        resolve(trip);
      } else {
        // fetch this trip only
        let roundtripsRef;

        // fetch trip only if its a user trip or a public trip
        if (payload.isUserTrip) {
          roundtripsRef = db
            .collection("Trips")
            .where("TripId", "==", payload.TripId)
            .where("userId", "==", auth.user().uid)
            .limit(1);
        } else {
          roundtripsRef = db
            .collection("Trips")
            .where("TripId", "==", payload.TripId)
            .where("public", "==", true)
            .limit(1);
        }

        roundtripsRef
          .get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              if (snapshot.empty) resolve(null);

              trip = Trip.fromObject(doc.data());

              // add trip to trip list
              commit("addTrip", trip);

              resolve(trip);
            });
          })
          .catch(function(error) {
            // sth went wrong (no user or not a public trip)
            console.log("Error " + error);
            resolve(null);
          });
      }
    });
  },
  fetchAllUserTrips({ commit, getters }) {
    return new Promise(resolve => {
      let userTripList = getters.getUsersTripList;
      if (userTripList && userTripList.length > 0) {
        resolve(userTripList);
      }

      let tripArr = [];

      if (!auth.user()) resolve(null);

      let roundtripsRef = db
        .collection("Trips")
        .where("userId", "==", auth.user().uid)
        .orderBy("createdAt")
        .limit(20);
      roundtripsRef
        .get()
        .then(snapshot => {
          let index = 0;

          // cancel here if no trips created yet
          if (snapshot.size === 0) resolve(null);

          snapshot.docs.forEach(doc => {
            // add trip
            tripArr.push(Trip.fromObject(doc.data()));

            index++;

            // its last trip > finished
            if (index === snapshot.size) {
              commit("addTrips", tripArr);
              resolve(tripArr);
            }
          });
        })
        .catch(function(error) {
          console.log(error);
          resolve(null);
        });
    });
  },
  fetchPublicTripsForCountry({ commit, getters }, country) {
    return new Promise(resolve => {
      let publicTripList = getters.getPublicTripList;
      if (publicTripList && publicTripList.length > 0) {
        resolve(publicTripList);
      }

      let tripArr = [];

      let roundtripsRef = db
        .collection("Trips")
        .where("countries", "array-contains", country)
        .where("published", "==", true)
        .orderBy("createdAt")
        .limit(20);
      roundtripsRef.get().then(snapshot => {
        let index = 0;

        // cancel here if no trips created yet
        if (snapshot.size === 0) resolve(null);

        snapshot.forEach(doc => {
          // add trip
          tripArr.push(Trip.fromObject(doc.data()));

          index++;

          // its last trip > finished
          if (index === snapshot.size - 1) {
            commit("addTrips", tripArr);
            resolve(tripArr);
          }
        });
      });
    });
  },
  addTripFromTemplate({ dispatch }, payload) {
    return new Promise(resolve => {
      dispatch("fetchSingleTrip", payload)
        .then(templateTrip => {
          dispatch("addTrip", templateTrip)
            .then(newTrip => {
              resolve(newTrip);
            })
            .catch(e => {
              console.log(e);
              resolve(null);
            });
        })
        .catch(e => {
          console.log(e);
          resolve(null);
        });
    });
  },
  addTrip({}, payload) {
    return new Promise(resolve => {
      try {
        const timeStamp = Date.now();
        let tempTripId = Math.floor(Math.random() * 10000000000000);

        let newTripObject = new Trip(
          tempTripId,
          payload.title,
          "Beschreibe deine Reise",
          auth.user().uid,
          timeStamp
        );

        // add stops
        if (payload.stopList) {
          newTripObject.setStopList(payload.stopList);
        } else {
          newTripObject.addFallbackStop(payload.depatureDate);
        }

        // add arrival departure
        if (payload.transportProfile) {
          newTripObject.setArrivalDeparture(
            payload.depatureDate,
            payload.transportProfile,
            payload.origin,
            payload.destination,
            payload.returnDate,
            payload.travelClass,
            payload.nonStop,
            payload.rooms,
            payload.adults,
            payload.childrenAges
          );
        }

        // add new trip with new temp TripId
        db.collection("Trips")
          .add(newTripObject.toObject())
          .then(() => {
            // get create trip and change TripId to doc id
            let roundtripsRef = db
              .collection("Trips")
              .where("TripId", "==", tempTripId)
              .limit(1);
            roundtripsRef.get().then(snapshot => {
              snapshot.forEach(doc => {
                db.collection("Trips")
                  .doc(doc.id)
                  .update({
                    TripId: doc.id
                  })
                  .then(() => {
                    newTripObject.TripId = doc.id;
                    resolve(doc.id);
                  });
              });
            });
          });
      } catch (e) {
        console.log(e);
        resolve(null);
      }
    });
  },
  setNewStopList({}, payload) {
    return new Promise(resolve => {
      db.collection("Trips")
        .doc(payload.TripId)
        .update({
          stopList: payload.newStopList
        })
        .then(function() {
          resolve(true);
        })
        .catch(e => {
          console.log(e);
          resolve(false);
        });
    });
  },
  addStop({ dispatch }, payload) {
    console.log("add stop now!");
    return new Promise(resolve => {
      dispatch("fetchSingleTrip", payload).then(trip => {
        trip.addStop(payload.stop);

        let stopListPayload = {
          newStopList: trip.toObject().stopList,
          TripId: trip.TripId
        };

        dispatch("setNewStopList", stopListPayload).then(success => {
          if (!success) {
            sharedMethods.showErrorNotification(
              "Stop konnte nicht hinzugefügt werden"
            );
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    });
  },
  deleteStop({ dispatch }, payload) {
    return new Promise(resolve => {
      dispatch("fetchSingleTrip", payload).then(trip => {
        trip.removeStop(payload.stopId);

        let stopListPayload = {
          newStopList: trip.toObject().stopList,
          TripId: trip.TripId
        };

        dispatch("setNewStopList", stopListPayload).then(success => {
          if (!success) {
            sharedMethods.showErrorNotification(
              "Stop konnte nicht gelöscht werden"
            );
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    });
  },
  deleteTrip({ commit }, TripId) {
    return new Promise(resolve => {
      db.collection("Trips")
        .doc(TripId)
        .where("UserId", "==", auth.user().uid)
        .delete()
        .then(function() {
          commit("removeRoundtrip", TripId);
          resolve(true);
        })
        .catch(function(error) {
          console.log(error);
          resolve(false);
        });
    });
  },
  resetCachedTrips({ commit }) {
    commit("setTrips", []);
  }
};
