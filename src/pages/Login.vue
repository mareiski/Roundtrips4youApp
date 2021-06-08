<template>
  <div class="login q-px-lg q-pb-md">
    <h1>Anmelden</h1>
    <p style="text-align:center; font-size:20px; padding-bottom:10px;">
      Willkommen zurück, logge dich ein um deine Reisen zu bearbeiten
    </p>
    <q-form
      @submit="onUserLogin"
      bordered
      class="q-gutter-md rounded-borders flex column"
      style="align-items:center;"
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
      <div style="padding:10px;">
        <q-btn
          type="submit"
          :loading="loginLoading"
          label="Login"
          class="q-mt-md"
          color="primary"
          text-color="white"
          style="width:300px;"
        >
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
      </div>
    </q-form>
    <div class="flex justify-center">
      <q-btn
        label="Passwort vergessen"
        class="q-mt-md"
        style="width:300px;"
        @click="showResetPasswordDialog = true"
      >
      </q-btn>
    </div>
    <q-dialog v-model="showResetPasswordDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-input
            v-model="userEmail"
            outlined
            type="email"
            lazy-rules
            :rules="[
              val => (val !== null && val !== '') || 'Bitte gib eine Email an',
              val =>
                sharedMethods.validEmail(val) ||
                'Bitte gib eine richtige Email an'
            ]"
            label="Email"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Passwort zurücksetzen"
            @click="resetPassword()"
            color="primary"
            v-close-popup
          />
          <q-btn flat label="Abbrechen" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="google-form">
      <div class="form-option">oder</div>
      <q-btn
        :loading="googleLoading"
        label="Anmelden mit Google"
        class="q-mt-md google-btn"
        style="width:300px; text-transform:none; font-family:roboto;"
        icon="fab fa-google"
        @click="signInWithGoogle()"
      >
        <template v-slot:loading>
          <q-spinner />
        </template>
      </q-btn>
    </div>
    <br />
    <div style="font-size:18px; text-align:center; width:100%;">
      Du hast noch kein Konto?
      <router-link to="/registrieren">Jetzt Registrieren</router-link>
    </div>
  </div>
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
          "Jetzt bei deinem Reiseplaner Roundtrips4you anmelden. Dein Reiseplaner mit Kartenfunktion, Städtevorschlag, Hotelsuche..."
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
      loginLoading = true;
      $store
        .dispatch("user/login", {
          email: this.userEmail,
          password: this.password,
          context: this
        })
        .then(() => {
          loginLoading = false;
        });
    },
    resetPassword() {
      $store.dispatch("user/resetPassword", { email: this.userEmail });
    },
    signInWithGoogle() {
      this.googleLoading = true;
      $store
        .dispatch("user/signInOrUpWithGoogle", { signUp: false, context: this })
        .then(() => {
          this.googleLoading = false;
        });
    }
  }
};
</script>
