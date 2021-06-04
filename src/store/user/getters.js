export default {
  user: state => state.user,
  isLoggedIn: state => (state.user !== null)
} 
