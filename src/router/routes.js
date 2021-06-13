const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      {
        path: "/Registrieren",
        component: () => import("pages/Register.vue"),
        meta: {
          guestOnly: true
        }
      },
      {
        path: "Login",
        component: () => import("pages/Login.vue"),
        meta: {
          guestOnly: true
        }
      },
      {
        path: "/Karte/:tripId",
        component: () => import("src/pages/Map.vue")
      },
      {
        path: "/Liste/:tripId",
        component: () => import("src/pages/StopList.vue")
      },
      {
        path: "/Profil",
        component: () => import("src/pages/Profile.vue"),
        meta: {
          requireAuth: true
        }
      },
      { path: "/Suche", component: () => import("src/pages/TripSearch.vue") }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
