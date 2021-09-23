export default {
  user: state => state.user,
  isLoggedIn: state => state.user !== null,
  userEntry: state => state.userEntry,
  unreadMessages: state => {
    if (state.userEntry && state.userEntry.messages) {
      for (let i = 0; i < state.userEntry.messages.length; i++) {
        const msg = state.userEntry.messages[i];

        if (!msg.seen) {
          return true;
        }
      }
    }
    return false;
  }
};
