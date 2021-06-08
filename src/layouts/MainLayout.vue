<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer v-model="showNotifications" overlay>
      <close-button
        @click="showNotifications = !showNotifications"
      ></close-button>
      <notifications></notifications>
    </q-drawer>

    <q-dialog maximized v-model="showWizardDialog">
      <div>
        <close-button
          @click="showWizardDialog = !showWizardDialog"
          v-show="wizardStep === 1"
        ></close-button>
        <back-button
          v-show="wizardStep > 1"
          @click="wizardStep--"
        ></back-button>
        <h6
          v-show="wizardStep > 1"
          class="position-absolute text-center text-primary"
          style="z-index: 1; width:100%"
        >
          {{ wizardTitle }}
        </h6>
        <wizard-dialog
          v-model="wizardStep"
          :titleProp="wizardTitle"
          @titleChange="wizardTitle = $event"
        ></wizard-dialog>
      </div>
    </q-dialog>

    <q-page-container>
      <router-view @showWizard="showWizardDialog = !showWizardDialog" />
    </q-page-container>

    <q-footer
      elevated
      style="height:60px;"
      class="flex justify-around bg-white"
    >
      <router-link to="/" class="center-content-horizontal">
        <q-icon class="icon-outline" size="md" name="home" />
      </router-link>
      <router-link to="/Suche" class="center-content-horizontal">
        <q-icon
          :class="$route.path === '/Suche' ? 'icon-outline' : ''"
          color="primary"
          size="md"
          name="search"
        />
      </router-link>
      <router-link to="" class="center-content-horizontal" style="width:54px;">
        <q-btn
          icon="add"
          size="18px"
          color="primary"
          round
          class="add-btn shadow-15-orange"
          @click="showWizardDialog = !showWizardDialog"
        ></q-btn>
      </router-link>
      <router-link to="" class="center-content-horizontal">
        <q-icon
          size="md"
          color="primary"
          :name="showNotifications ? 'notifications' : 'notifications_none'"
          @click="showNotifications = !showNotifications"
        />
      </router-link>
      <router-link to="/Profil" class="center-content-horizontal">
        <q-icon class="icon-outline" size="md" name="person" />
      </router-link>
    </q-footer>
  </q-layout>
</template>

<script>
import WizardDialog from "src/components/Wizard/WizardDialog.vue";
import CloseButton from "src/components/Buttons/CloseButton.vue";
import Notifications from "src/components/Notifications.vue";
import BackButton from "src/components/Buttons/BackButton.vue";
import { Loading } from "quasar";

export default {
  components: { WizardDialog, CloseButton, Notifications, BackButton },
  name: "MainLayout",
  data() {
    return {
      showNotifications: false,
      showWizardDialog: false,
      wizardStep: 1,
      wizardTitle: null,
      redirectionFinished: false,
      mountFinished: false
    };
  },
  mounted() {
    Loading.hide();
  }
};
</script>
