import { auth } from "src/firebaseInit.js";

export default {
  getTripList: state => state.TripList,
  getUsersTripList: state => {
    try {
      state.TripList.reduce(function(userTrips, e) {
        if (e.userId === auth.user().uid) {
          userTrips.push(e);
        }
        return userTrips;
      }, []);
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  getPublicTripList: state => {
    try {
      state.TripList.reduce(function(publicTrips, e) {
        if (e.published) {
          publicTrips.push(e);
        }
        return publicTrips;
      }, []);
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  getSingleTrip: state => tripId => {
    let index = state.TripList.findIndex(x => x.TripId === tripId);
    try {
      return state.TripList[index];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};
