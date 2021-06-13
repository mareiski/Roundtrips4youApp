<template>
  <q-card
    style="height:100%; width:100%; padding-top:80px;"
    class="flex justify-between flex-direction-col flex-nowrap"
  >
    <q-tab-panels v-model="step" animated class="shadow-2 rounded-borders fit">
      <q-tab-panel
        :name="1"
        class="flex justify-between flex-direction-col flex-nowrap"
      >
        <div>
          <q-card-section>
            <div class="flex justify-center">
              <q-icon size="xl" name="add_circle_outline" color="primary" />
            </div>
            <h4 class="center-text">Reise erstellen</h4>
          </q-card-section>
          <q-card-section class="flex justify-center">
            <q-input
              label="Titel der Reise"
              v-model="title"
              @input="titleChanged()"
              lazy-rules
              class="width-80-percent"
              :rules="[
                val => (val != null && val.length > 0) || 'Gib einen Titel an'
              ]"
            />
          </q-card-section>
        </div>
        <q-card-actions
          class="flex justify-center"
          style="padding-bottom:30px;"
        >
          <q-btn
            :disable="title == null || title.length <= 0"
            color="primary"
            outline
            @click="step = 2"
            >Weiter</q-btn
          >
        </q-card-actions>
      </q-tab-panel>
      <q-tab-panel
        :name="2"
        class="flex justify-between flex-direction-col flex-nowrap"
      >
        <q-card-section>
          <geocoder @inputCountry="e => (country = e)"></geocoder>
          <public-trip-list
            :country="country"
            :title="title"
          ></public-trip-list>
        </q-card-section>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>
<script>
import geocoder from "components/Geocoder.vue";
import PublicTripList from "../PublicTripList.vue";
export default {
  props: ["stepNum", "titleProp"],
  model: {
    prop: "stepNum",
    event: "stepChange"
  },
  name: "WizardDialog",
  components: {
    geocoder,
    PublicTripList
  },
  data() {
    return {
      title: this.titleProp,
      country: null
    };
  },
  computed: {
    step: {
      get: function() {
        return this.stepNum;
      },
      set: function(newValue) {
        if (this.step != newValue) {
          this.$emit("stepChange", newValue);
        }
      }
    }
  },
  methods: {
    titleChanged() {
      this.$emit("titleChange", this.title);
    }
  }
};
</script>
<style></style>
