export default {
  setTrips: (state, trips) => {
    state.TripList = trips;
  },
  addTrip: (state, trip) => {
    state.TripList.push(trip);
  },
  removeTrip: (state, roundtripDocId) => {
    if (state.TripList) {
      let index = state.TripList.findIndex(x => x.docId === roundtripDocId);
      state.TripList.splice(index, 1);
    }
  },
  setTitleImage: (state, payload) => {
    let index = state.TripList.findIndex(
      x => x.docId === payload.roundtripDocId
    );
    state.TripList[index].TitleImage = payload.image;
  },
  setStopList: (state, payload) => {
    let index = state.TripList.findIndex(
      x => x.docId === payload.roundtripDocId
    );
    state.TripList[index].StopList = payload.stopList;
  }
};
