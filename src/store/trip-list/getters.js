import { auth } from "src/firebaseInit.js";

export default {
  getTripList: state => state.TripList,
  getUsersTripList: state => {
    try {
      let userTrips = [];
      state.TripList.reduce(function(trips, e) {
        if (auth.user() && e.userId === auth.user().uid) {
          userTrips.push(e);
        }
      }, []);

      return userTrips;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  getPublicTripList: state => {
    try {
      let publicTrips = [];
      state.TripList.reduce(function(trips, e) {
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
