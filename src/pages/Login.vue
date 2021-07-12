<template>
  <q-page class="flex justify-start flex-direction-col q-px-lg">
    <h4>Anmelden</h4>
    <p style="padding-bottom:10px;" class="text-secondary">
      Willkommen zurück, logge dich ein um deine Reisen zu bearbeiten
    </p>
    <q-form
      @submit="onUserLogin"
      bordered
      class="q-gutter-md rounded-borders flex column"
    >
      <q-input
        v-model="userEmail"
        outlined
        type="email"
        lazy-rules
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
      <q-btn
        type="submit"
        :loading="loginLoading"
        label="Login"
        class="q-mt-md"
        color="primary"
        outline
        style="width:300px;"
      >
        <template v-slot:loading>
          <q-spinner />
        </template>
      </q-btn>
    </q-form>
    <q-btn
      :loading="googleLoading"
      outline
      label="Anmelden mit Google"
      class="q-mt-md google-btn text-secondary"
      style="width:300px; text-transform:none; margin-top: 0"
      icon="fab fa-google"
      @click="signInWithGoogle()"
    >
      <template v-slot:loading>
        <q-spinner />
      </template>
    </q-btn>
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
      <router-link to="/registrieren" class="text-secondary"
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
      this.$store
        .dispatch("user/login", {
          email: this.userEmail,
          password: this.password,
          context: this
        })
        .then(() => {
          this.loginLoading = false;
        });
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
