import { auth } from "../firebaseInit.js";
export default {
  manageRoutes(router) {
    return new Promise(resolve => {
      try {
        let loggedIn = auth.user() !== null;

        if (!loggedIn) {
          router.push("/login");
        }

        auth.authRef().onAuthStateChanged(() => {
          router.beforeEach((to, from, next) => {
            let requireAuth = to.matched.some(
              record => record.meta.requireAuth
            );
            let guestOnly = to.matched.some(record => record.meta.guestOnly);

            if (requireAuth && !loggedIn) {
              next("Registrieren");
            } else if (guestOnly && loggedIn) {
              next("/");
            } else next();

            resolve(true);
          });
        });
      } catch (e) {
        console.log(e);
        resolve(false);
      }
    });
  }
};
