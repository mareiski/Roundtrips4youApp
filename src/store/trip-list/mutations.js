export default {
  /**
   * @param {Trip[]} trips
   */
  setTrips: (state, trips) => {
    state.TripList = trips;
  },
  /**
   * @param {Trip[]} trips
   */
  addTrips: (state, trips) => {
    trips.forEach(trip => {
      let index = state.TripList.findIndex(x => x.TripId === trip.TripId);
      if (index === -1) {
        state.TripList.push(trip);
      } else {
        state.TripList[index] = trip;
      }
    });
  },
  /**
   * @param {Trip} trip
   */
  addTrip: (state, trip) => {
    let index = state.TripList.findIndex(x => x.TripId === trip.TripId);
    if (index === -1) {
      state.TripList.push(trip);
    } else {
      state.TripList[index] = trip;
    }
  },
  /**
   * @param {Trip} trip
   */
  setTrip: (state, trip) => {
    let index = state.TripList.findIndex(x => x.TripId === trip.TripId);
    if (index !== -1) {
      state.TripList[index] = trip;
    }
  },
  /**
   * @param {Number} roundtripDocId
   */
  removeTrip: (state, TripId) => {
    if (state.TripList) {
      let index = state.TripList.findIndex(x => x.TripId === TripId);
      state.TripList.splice(index, 1);
    }
  },
  setStopList: (state, payload) => {
    let index = state.TripList.findIndex(
      x => x.TripId === payload.roundtripDocId
    );
    state.TripList[index].StopList = payload.stopList;
  }
};
