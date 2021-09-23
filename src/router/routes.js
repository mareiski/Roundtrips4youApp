const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/Home",
        name: "index",
        component: () => import("pages/Index.vue"),
        meta: {
          requireAuth: true
        }
      },
      {
        path: "",
        name: "home",
        component: () => import("pages/Home.vue"),
        meta: {
          guestOnly: true
        }
      },
      {
        path: "/Registrieren",
        name: "register",
        component: () => import("pages/Register.vue"),
        meta: {
          guestOnly: true
        }
      },
      {
        path: "/Login",
        component: () => import("pages/Login.vue"),
        name: "login",
        meta: {
          guestOnly: true
        }
      },
      {
        path: "/Karte/:tripId",
        name: "map",
        component: () => import("src/pages/Map.vue"),
        meta: {
          actionButtonMethod: "focusGeocoder"
        }
      },
      {
        path: "/Liste/:tripId",
        name: "list",
        component: () => import("src/pages/StopList.vue"),
        meta: {
          actionButtonMethod: "focusGeocoder"
        }
      },
      {
        path: "/Einstellungen/:tripId",
        name: "settings",
        component: () => import("src/pages/TripSettings.vue"),
        meta: {
          actionButtonMethod: "focusGeocoder"
        }
      },
      {
        path: "/Profil",
        name: "profile",
        component: () => import("src/pages/Profile.vue"),
        meta: {
          requireAuth: true
        }
      },
      {
        path: "/Inspiration",
        name: "search",
        component: () => import("src/pages/TripInspiration.vue"),
        meta: {
          fabMultipleActions: true
        }
      },
      {
        path: "/MessageAdmin",
        name: "messageAdmin",
        component: () => import("pages/MessageAdmin.vue"),
        meta: {
          requireAuth: true
        }
      }
    ]
  },
  {
    path: "/Impressum",
    name: "impress",
    component: () => import("src/pages/Legal/Impressum.vue")
  },
  {
    path: "/Haftungsausschluss",
    name: "haftunsausschluss",
    component: () => import("../pages/Legal/Haftungsausschluss.vue")
  },
  {
    path: "/Datenschutz",
    name: "privacy",
    component: () => import("src/pages/Legal/Datenschutz.vue")
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
