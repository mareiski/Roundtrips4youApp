import { auth } from "../firebaseInit.js";
export default {
  manageRoutes(router) {
    return new Promise(resolve => {
      try {
        auth.authRef().onAuthStateChanged(() => {
          router.beforeEach((to, from, next) => {
            // leave this here, its not working elsewhere
            let loggedIn = auth.user() !== null;

            let requireAuth = to.matched.some(
              record => record.meta.requireAuth
            );
            let guestOnly = to.matched.some(record => record.meta.guestOnly);

            if (requireAuth && !loggedIn) {
              if (process.env.MODE === "spa") {
                next("/");
              } else {
                next("/Registrieren");
              }
            } else if (guestOnly && loggedIn) {
              next("/Home");
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
