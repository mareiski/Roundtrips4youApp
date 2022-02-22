<template>
  <q-page class="flex justify-start flex-direction-col q-px-lg">
    <div class="align-center flex flex-direction-col">
      <h4 class="max-with-400 width-90-percent">Registrieren</h4>
      <p
        style="padding-bottom:10px;"
        class="text-secondary max-with-400 width-90-percent"
      >
        Starte jetzt durch und nutze all unsere Funktionen komplett kostenlos
      </p>
      <a
        v-if="!$route.query.TripId"
        @click="$emit('showWizard')"
        class="text-primary cursor-pointer max-with-400 width-90-percent"
        >ohne Anmeldung testen</a
      >
    </div>

    <q-form
      @submit="signUp"
      bordered
      style="margin-bottom:10px;"
      class="q-gutter-md rounded-borders flex column justify-center align-center"
    >
      <!-- add this above for auto mailchimp subcribtion action="https://roundtrips4you.us18.list-manage.com/subscribe/post?u=ca8f607f808c8e5a9812aec8f&id=c64c971288&gdpr[71542]=true" -->
      <q-input
        v-model="email"
        outlined
        type="email"
        :rules="[
          val => (val !== null && val !== '') || 'Bitte gib eine Email an',
          val =>
            sharedMethods.validEmail(val) || 'Bitte gib eine richtige Email an'
        ]"
        label="Email"
        lazy-rules
        name="EMAIL"
        style="padding:0;"
        class="max-with-400 width-90-percent"
      />
      <q-input
        v-model="password"
        outlined
        :type="isPwd ? 'password' : 'text'"
        label="neues Passwort"
        lazy-rules
        style="padding:0;"
        class="max-with-400 width-90-percent"
        :rules="[
          val =>
            (val !== null && val !== '') || 'Bitte gib dein neues Passwort ein'
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
      <q-input
        v-model="passwordRepeat"
        outlined
        :type="isPwdRepeat ? 'password' : 'text'"
        label="neues Passwort wiederholen"
        lazy-rules
        style="padding:0;"
        class="max-with-400 width-90-percent"
        :rules="[
          val =>
            (val !== null && val !== '') || 'Bitte wiederhole dein Passwort',
          val =>
            val === password || 'Die beiden Passwörter stimmen nicht überein'
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwdRepeat ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwdRepeat = !isPwdRepeat"
          />
        </template>
      </q-input>
      <div class="flex justify-center width-90-percent">
        <q-btn
          type="submit"
          :loading="submitting"
          label="Registrieren"
          class="q-mt-md max-with-400 full-width"
          color="primary"
          outline
          style="margin:0;"
        >
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
      </div>
    </q-form>
    <div class="google-form" style="margin:0;">
      <div class="flex justify-center">
        <span class="text-secondary">oder</span>
      </div>
      <br />
      <div class="flex justify-center">
        <q-btn
          :loading="googleLoading"
          label="Google Konto verwenden"
          class="q-mt-md google-btn text-secondary max-with-400 width-90-percent"
          style="margin:0;"
          no-caps
          outline
          icon="fab fa-google"
          @click="signUpWithGoogle()"
        >
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
      </div>
    </div>
    <br />
    <div class="text-secondary center-text">
      Du hast bereits einen Account?
      <router-link
        v-if="!$route.query.TripId"
        to="/Login"
        class="text-secondary underlined"
        >Jetzt anmelden</router-link
      >
      <router-link
        v-else
        :to="'/Login?TripId=' + $route.query.TripId"
        class="text-secondary underlined"
        >Jetzt anmelden</router-link
      >
    </div>
    <br />
    <div style="padding-top:30px">
      <p class="text-secondary">
        Mit der Registrierung stimmst du zu das wir dir Emails an deine
        angegebene Adresse senden dürfen.
      </p>
      <q-list bordered>
        <q-expansion-item
          class="text-secondary"
          label=" Warum muss man sich bei Roundtrips4you registrieren?"
        >
          <q-card>
            <q-card-section class="text-secondary">
              <p>
                Bei uns musst du dich nur Registrieren, damit wir deine Reisen
                auch dir zuordnen können.
              </p>
              <p>
                Leider geht dies nur wenn du einen Account hast der eindeutig zu
                dir gehört (deshalb brauchen wir deine Email Adresse).
              </p>
              <p>
                Nach der Registrierung musst du allerdings gar keine weiteren
                Daten angeben, wenn du das nicht möchtest.
              </p>
              <p>
                Natürlich kannst du uns auch jederzeit unter
                <a href="mailto:hello@roundtrips4you.de"
                  >hello@roundtrips4you.de</a
                >
                fragen zum Datenschutz stellen oder einfach in der
                Datenschutzerklärung nachlesen.
              </p>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Ungesicherte Änderungen</div>
          <span
            >Wenn du jetzt zurück gehst werden deine Änderungen verworfen!
            <br />
            Möchtest du trotzdem zurück?</span
          >
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn
            label="Änderungen verwerfen"
            v-close-popup
            flat
            @click="$store.commit('demoSession/resetRoundtrip')"
          />
          <q-btn type="submit" label="Abbrechen" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import sharedMethods from "../../sharedMethods.js";
export default {
  meta: {
    title: "Registrieren",
    meta: {
      description: {
        name: "description",
        content:
          "Registriere dich jetzt kostenlos bei Roundtrips4you und erstelle selbst deine eigenen Reisen. Dein Reiseplaner mit Kartenfunktion, Städtevorschlag..."
      }
    }
  },
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
      passwordRepeat: "",
      isPwd: true,
      isPwdRepeat: true,
      submitting: false,
      googleLoading: false,
      showCancelDialog: false,
      cancelDialogNext: null
    };
  },
  computed: {
    sharedMethods() {
      return sharedMethods;
    }
  },
  methods: {
    signUp() {
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
              .dispatch("user/signUp", {
                email: this.email,
                password: this.password,
                context: this
              })
              .then(success => {
                // if profile was created, we add the trip of vuex store to users profile
                if (success && trip) {
                  this.$store.dispatch("tripList/addTrip", trip);
                }
              });
          });
      } else {
        this.$store.dispatch("user/signUp", {
          email: this.email,
          password: this.password,
          context: this
        });
      }
    },
    signUpWithGoogle() {
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
              .dispatch("user/signInOrUpWithGoogle", {
                signUp: true,
                context: this
              })
              .then(success => {
                if (success && trip) {
                  this.$store.dispatch("tripList/addTrip", trip);
                }
              });
          });
      }

      this.$store.dispatch("user/signInOrUpWithGoogle", {
        signUp: true,
        context: this
      });
    }
  }
};
</script>
