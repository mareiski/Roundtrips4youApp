<template>
  <q-card style="padding-top:80px;" class="fit" flat>
    <q-card-section
      class="full-height flex justify-around flex-direction-col flex-nowrap"
    >
      <q-input v-model="stop.title" label="Titel"></q-input>
      <q-input
        type="number"
        v-model.number="stop.dayDuration"
        label="Tage"
      ></q-input>
      <q-select
        v-model="profile"
        :options="profileOptions"
        label="Reisemittel"
      />
      <q-editor
        v-model="stop.notes"
        content-class="text-secondary"
        placeholder="Notizen zu diesem Stopp"
      ></q-editor>
    </q-card-section>
  </q-card>
</template>
<script>
export default {
  props: ["stopProp"],
  model: {
    prop: "stopProp",
    event: "stopChanged"
  },
  name: "EditStopDialog",

  data() {
    return {
      profileOptions: ["Auto", "Fahrrad", "Zu Fuß", "SUP"]
    };
  },
  computed: {
    stop: {
      get: function() {
        return this.stopProp;
      },
      set: function(newValue) {
        if (this.stop !==newValue) {
          this.$emit("stopChanged", newValue);
        }
      }
    },
    profile: {
      get: function() {
        return this.revertProfile(this.stop.profile);
      },
      set: function(newValue) {
        this.stop.profile = this.revertProfile(newValue);
      }
    }
  },
  methods: {
    revertProfile(profile) {
      switch (profile) {
        case "driving": {
          return this.profileOptions[0];
        }
        case "cycling": {
          return this.profileOptions[1];
        }
        case "walking": {
          return this.profileOptions[2];
        }
        case "SUP": {
          return this.profileOptions[3];
        }
        case this.profileOptions[0]: {
          return "driving";
        }
        case this.profileOptions[1]: {
          return "cycling";
        }
        case this.profileOptions[2]: {
          return "walking";
        }
        case this.profileOptions[3]: {
          return "SUP";
        }
      }
    }
  }
};
</script>
<style></style>
