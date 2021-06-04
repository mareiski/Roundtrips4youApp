import { auth } from "src/firebaseInit.js";

export default {
  getTripList: state => state.TripList,
  getUsersTripList: state => {
    try {
      state.roundtrips.reduce(function(userTrips, e) {
        if (e.UserId === auth.user().uid) {
          userTrips.push(e);
        }
        return userTrips;
      }, []);
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  getSingleTrip: state => roundtripId => {
    let index = state.roundtrips.findIndex(x => x.RTId === roundtripId);
    try {
      return state.roundtrips[index];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};
