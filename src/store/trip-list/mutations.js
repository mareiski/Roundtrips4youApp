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
    state.TripList.push(trips);
  },
  /**
   * @param {Trip} trip
   */
  addTrip: (state, trip) => {
    state.TripList.push(trip);
  },
  /**
   * @param {Number} roundtripDocId
   */
  removeTrip: (state, roundtripDocId) => {
    if (state.TripList) {
      let index = state.TripList.findIndex(x => x.RTId === roundtripDocId);
      state.TripList.splice(index, 1);
    }
  },
  setStopList: (state, payload) => {
    let index = state.TripList.findIndex(
      x => x.RTId === payload.roundtripDocId
    );
    state.TripList[index].StopList = payload.stopList;
  }
};
