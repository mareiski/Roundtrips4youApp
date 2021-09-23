export default {
  setUser: (state, user) => {
    state.user = user;
  },
  setUserEntry: (state, userEntry) => {
    state.userEntry = userEntry;
  },
  markAllMessagesAsSeen: state => {
    state.userEntry.messages.forEach(msg => {
      msg.seen = true;
    });
  },
  appendMessage: (state, msg) => {
    state.userEntry.messages.splice(0, 0, msg.toObject());
  }
};
