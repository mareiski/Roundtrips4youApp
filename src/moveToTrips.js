import { db, storage, auth } from "./firebaseInit";
import sharedMethods from "app/sharedMethods";

export default {
  move() {
    this.fetchAllRoundtrips().then(roundtrips => {
      console.log(roundtrips);

      roundtrips.forEach(roundtrip => {
        try {
          let rt = roundtrip;
          let trip = {};
          trip.adults = rt.Adults || 2;
          trip.childrenAges = rt.ChildrenAges || [];
          trip.countries = rt.Location;
          trip.TripId = rt.RTId;

          trip.createdAt = rt.createdAt;
          if (rt.createdAt.seconds) {
            trip.createdAt = sharedMethods.getDateFromTimeStamp(rt.createdAt);
          }

          switch (rt.Days) {
            case "< 5 Tage": {
              trip.days = 4;
              break;
            }
            case "5-8 Tage": {
              trip.days = 6;
              break;
            }
            case "9-11 Tage": {
              trip.days = 10;
              break;
            }
            case "12-15 Tage": {
              trip.days = 13;
              break;
            }
            case "> 15 Tage": {
              trip.days = 16;
              break;
            }
          }

          trip.departureDate = new Date(Date.now());
          trip.description = rt.Description;
          trip.destination = null;
          trip.highlights = rt.Highlights;
          trip.nonStop = true;
          trip.offerEndPeriod = rt.OfferEndPeriod;
          trip.offerStartPeriod = rt.OfferStartPeriod;
          trip.offerWholeYear = rt.OfferWholeYear;
          trip.origin = null;
          trip.participants = [];
          trip.price = rt.Price || 0;
          trip.published = rt.Public || false;
          trip.rooms = rt.Rooms || 1;
          trip.stars = rt.Stars || 3;
          trip.startDate = new Date(Date.now());
          trip.returnDAte = new Date(Date.now());
          trip.tags = rt.Tags || [];
          trip.title = rt.Title;
          trip.totalDistance = 0;
          trip.transportProfile = "driving";
          trip.travelClass = "Economy";
          trip.userId = rt.UserId;
          trip.titleImageUrl = "";
          trip.stopList = [];

          let promise = new Promise((resolve, reject) => {
            resolve(null);
          });
          try {
            var fileRef = storage
              .ref()
              .child("Images/Roundtrips/" + rt.RTId + "/Title/titleImg");

            promise = new Promise((resolve, reject) => {
              fileRef
                .getDownloadURL()
                .then(url => {
                  trip.titleImageUrl = url || "../assets/aircraft.svg";
                  resolve(true);
                })
                .catch(e => {
                  console.log(e);
                  resolve(false);
                });
            });
          } catch (e) {
            console.log(e);
          }

          promise.then(() => {
            this.getStops(rt.RTId).then(stops => {
              trip.stopList = stops;

              console.log("add trip");

              db.collection("Trips")
                .add(trip)
                .then(() => {
                  let roundtripsRef = db
                    .collection("Trips")
                    .where("TripId", "==", trip.TripId)
                    .limit(1);

                  roundtripsRef.get().then(snapshot => {
                    snapshot.forEach(doc => {
                      db.collection("Trips")
                        .doc(doc.id)
                        .update({
                          TripId: doc.id
                        })
                        .then(() => {
                          sharedMethods.showSuccessNotification("added trip");
                        });
                    });
                  });
                });
            });
          });
        } catch (e) {
          console.log(e);
        }
      });
    });
  },
  compare(a, b) {
    const dateA = sharedMethods.getDateFromString(a.date);
    const dateB = sharedMethods.getDateFromString(b.date);

    if (dateA > dateB) return 1;
    if (dateB > dateA) return -1;

    return 0;
  },
  getStops(RTId) {
    return new Promise(resolve => {
      // get stops
      let roundtripsRef = db
        .collection("RoundtripDetails")
        .where("RTId", "==", RTId)
        .orderBy("InitDate");
      roundtripsRef.get().then(snapshot => {
        let stops = [];
        let newStops = [];
        let index = 0;
        snapshot.forEach(doc => {
          let stop = doc.data();

          let newStop = {};

          newStop.children = [];
          newStop.dayDuration = stop.DayDuration || 0;
          newStop.images = [];

          if (stop.Sights) newStop.sights = stop.Sights;

          newStop.location = {};
          newStop.location.label = stop.Location.label;
          newStop.location.lat = Number(stop.Location.lat);
          newStop.location.lng = Number(stop.Location.lng);

          newStop.notes = stop.Description;
          newStop.profile = stop.Profile || "driving";
          newStop.stopId = doc.id;
          newStop.stopKind = "stop";
          newStop.title = stop.Title;
          stop.StopId = doc.id;

          stops.push(stop);
          newStops.push(newStop);

          if (index === snapshot.size - 1) {
            let returnStopList = [];
            stops.sort(this.compare);

            stops.forEach(stop => {
              let i = newStops.findIndex(x => x.stopId === stop.StopId);
              returnStopList.push(newStops[i]);
            });

            resolve(returnStopList);
          }

          index++;
        });
      });
    });
  },
  fetchAllRoundtrips() {
    return new Promise(resolve => {
      let tripArr = [];
      let roundtripsRef = db.collection("Roundtrips").orderBy("createdAt");
      roundtripsRef
        .get()
        .then(snapshot => {
          let index = 0;

          // cancel here if no trips created yet
          if (snapshot.size === 0) resolve(null);

          snapshot.docs.forEach(doc => {
            // add trip
            tripArr.push(doc.data());

            index++;

            // its last trip > finished
            if (index === snapshot.size) {
              resolve(tripArr);
            }
          });
        })
        .catch(function(error) {
          console.log(error);
          resolve(null);
        });
    });
  }
};
