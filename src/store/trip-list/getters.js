import user from "../user";

export default {
    getTripList: state => state.TripList,
    getUsersTripList: (state) => {        
        state.roundtrips.reduce(function(userTrips, e) {
            if (e.UserId === user.getters.userId) {
                userTrips.push(e);
            }
            return userTrips;
        }, []); 
    },
    getSingleRoundtrip: (state) => (roundtripId) => {
      return state.roundtrips[state.roundtrips.findIndex(x => x.RTId === roundtripId)]
    }
}
