import { auth } from "src/firebaseInit.js";

export default {
  getTipList: state => state.TipList,
  getUsersTipList: state => {
    try {
      let userTips = [];
      state.TipList.reduce(function(tips, e) {
        if (auth.user() && e.creator === auth.user().uid) {
          userTips.push(e);
        }
      }, []);

      return userTips;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  getSingleTip: state => tipId => {
    let index = state.TipList.findIndex(x => x.TipId === tipId);
    try {
      return state.TipList[index];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};
