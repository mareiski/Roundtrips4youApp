<template>
  <q-page class="flex justify-start flex-direction-col q-px-lg">
    <div class="align-center flex flex-direction-col">
      <h4 class="max-with-400 width-90-percent">Anmelden</h4>
      <p style="padding-bottom:10px;" class="text-secondary">
        Willkommen zurück, logge dich ein um deine Reisen zu bearbeiten
      </p>
    </div>
    <q-form
      @submit="onUserLogin"
      bordered
      class="q-gutter-md rounded-borders flex column align-center"
    >
      <q-input
        v-model="userEmail"
        outlined
        type="email"
        lazy-rules
        class="max-with-400 width-90-percent"
        :rules="[
          val => (val !== null && val !== '') || 'Bitte gib eine Email an',
          val =>
            sharedMethods.validEmail(val) || 'Bitte gib eine richtige Email an'
        ]"
        label="Email"
        style="padding:0;"
      />
      <q-input
        v-model="password"
        outlined
        :type="isPwd ? 'password' : 'text'"
        label="Passwort"
        class="max-with-400 width-90-percent"
        :rules="[
          val => (val !== null && val !== '') || 'Bitte gib dein Passwort ein'
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <div class="flex justify-center width-90-percent">
        <q-btn
          type="submit"
          :loading="loginLoading"
          label="Login"
          class="q-mt-md full-width max-with-400"
          color="primary"
          outline
        >
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
      </div>
    </q-form>
    <div class="flex justify-center">
      <q-btn
        :loading="googleLoading"
        outline
        label="Anmelden mit Google"
        class="q-mt-md google-btn text-secondary max-with-400 width-90-percent"
        style="margin-top: 0; height:36px;"
        icon="fab fa-google"
        no-caps
        @click="signInWithGoogle()"
      >
        <template v-slot:loading>
          <q-spinner />
        </template>
      </q-btn>
    </div>
    <div class="flex justify-center">
      <p
        @click="showResetPasswordDialog = true"
        class="q-mt-md text-secondary underlined"
      >
        Passwort vergessen
      </p>
    </div>
    <q-dialog v-model="showResetPasswordDialog">
      <q-card style="width:100%; max-width:100vh;">
        <q-card-section class="flex justify-center">
          <q-input
            v-model="userEmail"
            outlined
            type="email"
            outline
            lazy-rules
            style="width:100%;"
            :rules="[
              val => (val !== null && val !== '') || 'Bitte gib eine Email an',
              val =>
                sharedMethods.validEmail(val) ||
                'Bitte gib eine richtige Email an'
            ]"
            label="Email"
          />
        </q-card-section>

        <q-card-actions align="right" class="flex">
          <q-btn
            outline
            label="Zurücksetzen"
            @click="resetPassword()"
            color="primary"
            v-close-popup
          />
          <q-btn flat label="Abbrechen" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <br />
    <div class="text-secondary" style="text-align:center; width:100%;">
      Du hast noch kein Konto?
      <router-link
        v-if="!$route.query.TripId"
        to="/Registrieren"
        class="text-secondary underlined"
        >Jetzt registrieren</router-link
      >
      <router-link
        v-else
        :to="'/Registrieren?TripId=' + $route.query.TripId"
        class="text-secondary underlined"
        >Jetzt registrieren</router-link
      >
    </div>
  </q-page>
</template>
<script>
import sharedMethods from "../../sharedMethods.js";
export default {
  meta: {
    title: "Login",
    meta: {
      description: {
        name: "description",
        content:
          "Jetzt bei Roundtrips4you anmelden. Dein Reiseplaner mit Kartenfunktion, Städtevorschlag, Hotelsuche..."
      }
    }
  },
  name: "login",
  computed: {
    sharedMethods() {
      return sharedMethods;
    }
  },
  data() {
    return {
      userEmail: "",
      password: "",
      passwordRepeat: "",
      isPwd: true,
      isPwdRepeat: true,
      loginLoading: false,
      googleLoading: false,
      showResetPasswordDialog: false
    };
  },
  methods: {
    onUserLogin() {
      this.loginLoading = true;
      const TripId = this.$route.query.TripId;

      // if we have a tripid given, we get the trip from vuex
      if (TripId) {
        this.$store
          .dispatch("tripList/fetchSingleTrip", {
            isUserTrip: false,
            TripId: TripId,
            forceRefresh: false
          })
          .then(trip => {
            this.$store
              .dispatch("user/login", {
                email: this.userEmail,
                password: this.password,
                context: this
              })
              .then(() => {
                // if profile was created, we add the trip of vuex store to users profile
                if (trip) {
                  this.$store.dispatch("tripList/addTrip", trip);
                }

                this.$store.dispatch("tripList/fetchAllUserTrips");

                this.loginLoading = false;
              });
          });
      } else {
        this.$store
          .dispatch("user/login", {
            email: this.userEmail,
            password: this.password,
            context: this
          })
          .then(() => {
            this.$store.dispatch("tripList/fetchAllUserTrips");
            this.loginLoading = false;
          });
      }
    },
    resetPassword() {
      this.$store.dispatch("user/resetPassword", { email: this.userEmail });
    },
    signInWithGoogle() {
      this.googleLoading = true;
      this.$store
        .dispatch("user/signInOrUpWithGoogle", { signUp: false, context: this })
        .then(() => {
          this.googleLoading = false;
        });
    }
  }
};
</script>
