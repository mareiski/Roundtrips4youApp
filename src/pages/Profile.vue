<template>
  <q-page class="flex flex-center">
    <div class="user q-px-lg q-pb-md" v-if="user">
      <h5>Hallo, {{ user.displayName }}</h5>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
        style="padding-top:40px;"
      >
        <q-tab name="settings" label="Einstellungen" />
        <q-tab name="publicProfile" label="Öffentliches Profil"> </q-tab>
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" keep-alive animated>
        <q-tab-panel name="publicProfile">
          <public-user-profile></public-user-profile>
        </q-tab-panel>
        <q-tab-panel name="settings">
          <h5>Einstellungen</h5>
          <q-form
            @submit="onSaveUserSettings"
            bordered
            class="q-gutter-md rounded-borders"
          >
            <q-list
              bordered
              class="rounded-borders"
              style="padding:10px; margin-bottom:30px;"
            >
              <q-input
                v-model="userDisplayName"
                outlined
                :rules="[
                  val =>
                    (val !== null &&
                      val !== '' &&
                      (user.displayName === val || uniqueUserName(val))) ||
                    'Bitte wähle einen Benutzernamen'
                ]"
                label="Benutzername"
                lazy-rules
              />

              <div class="row">
                <q-btn
                  type="submit"
                  :loading="submitting"
                  label="Speichern"
                  class="q-mt-md"
                  color="primary"
                  text-color="white"
                >
                  <template v-slot:loading>
                    <q-spinner />
                  </template>
                </q-btn>
              </div>
            </q-list>
          </q-form>
          <q-form
            @submit="onSaveUserPass"
            bordered
            class="q-gutter-md rounded-borders"
          >
            <q-list bordered class="rounded-borders">
              <q-expansion-item
                clickable
                expand-separator
                v-model="addExpanded"
                class="add-item"
                @click="addButtonActive = !addButtonActive"
              >
                <template v-slot:header>
                  <q-item-section style="align-items: center;">
                    <span>Passwort ändern</span>
                  </q-item-section>
                </template>
                <div style="padding:10px;">
                  <q-input
                    v-model="password"
                    outlined
                    :type="isPwd ? 'password' : 'text'"
                    label="neues Passwort"
                    :rules="[
                      val =>
                        (val !== null && val !== '') ||
                        'Bitte gib dein neues Passwort ein'
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
                    :rules="[
                      val =>
                        (val !== null && val !== '') ||
                        'Bitte wiederhole dein Passwort',
                      val =>
                        val === password ||
                        'Die beiden Passwörter stimmen nicht überein'
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
                  <div class="row">
                    <q-btn
                      type="submit"
                      :loading="submitting"
                      label="Speichern"
                      class="q-mt-md"
                      color="primary"
                      text-color="white"
                    >
                      <template v-slot:loading>
                        <q-spinner />
                      </template>
                    </q-btn>
                  </div>
                </div>
              </q-expansion-item>
            </q-list>
          </q-form>
          <h5>Logout</h5>
          <q-btn label="Logout" @click="logOut()" />
          <h5>Danger Zone</h5>
          <q-list
            bordered
            class="rounded-borders"
            style="padding:10px; border-color:red;"
          >
            <p style="font-size:18px;">
              Dieses Konto und alle enthaltenen Inhalte löschen
            </p>
            <q-btn
              :loading="deleting"
              label="Löschen"
              class="q-mt-md"
              color="primary"
              text-color="white"
              @click="deleteDialog = true"
            >
              <template v-slot:loading>
                <q-spinner />
              </template>
            </q-btn>
            <q-dialog persistent v-model="deleteDialog">
              <q-card>
                <q-card-section class="row items-center">
                  <span class="q-ml-sm"
                    >Willst du wirklich deinen Konto und alle deine Reisen
                    löschen ? Dies kann nicht mehr rückgängig gemacht
                    werden.</span
                  >
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Abbrechen" color="primary" v-close-popup />
                  <q-btn
                    flat
                    label="Konto Löschen"
                    @click="deleteAccount()"
                    color="primary"
                    v-close-popup
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { auth, storage, db } from "../firebaseInit.js";
import sharedMethods from "../../sharedMethods.js";

export default {
  meta: {
    title: "Profil",
    meta: {
      robot: {
        name: "description",
        content:
          "Dein Profil auf roundtrips4you. Dein Reiseplaner mit Kartenfunktion, Städtevorschlag, Hotelsuche..."
      }
    }
  },
  name: "profile",
  data() {
    return {
      UserDisplayName: "",
      UserEmail: "",
      submitting: false,
      titleImgUrl: "",
      password: "",
      isPwd: true,
      passwordRepeat: "",
      isPwdRepeat: true,
      deleteDialog: false,
      deleting: false,
      CompanyWebsite: null,
      companyProfile: false,
      companyDescription: null,
      tab: "settings",
      addExpanded: false
    };
  },
  computed: {
    user() {
      return this.$store.getters["user/user"];
    },
    sharedMethods() {
      return sharedMethods;
    }
  },
  methods: {
    logOut() {
      auth.logout(this.$router, this.$store);
    }
  }
};
</script>

<style></style>
