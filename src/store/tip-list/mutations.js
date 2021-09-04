export default {
  /**
   * @param {Tip[]} tips
   */
  setTips: (state, tips) => {
    state.TipList = tips;
  },
  /**
   * @param {Tip[]} tips
   */
  addTips: (state, tips) => {
    tips.forEach(tip => {
      let index = state.TipList.findIndex(x => x.TipId === tip.TipId);
      if (index === -1) {
        state.TipList.push(tip);
      } else {
        state.TipList[index] = tip;
      }
    });
  },
  /**
   * @param {Tip} tip
   */
  addTip: (state, tip) => {
    let index = state.TipList.findIndex(x => x.TipId === tip.TipId);
    if (index === -1) {
      state.TipList.push(tip);
    } else {
      state.TipList[index] = tip;
    }
  },
  /**
   * @param {Tip} tip
   */
  setTip: (state, tip) => {
    let index = state.TipList.findIndex(x => x.TipId === tip.TipId);
    if (index !== -1) {
      state.TipList[index] = tip;
    }
  },
  /**
   * @param {Number} tipId
   */
  removeTip: (state, TipId) => {
    if (state.TipList) {
      let index = state.TipList.findIndex(x => x.TipId === TipId);
      state.TipList.splice(index, 1);
    }
  }
};
