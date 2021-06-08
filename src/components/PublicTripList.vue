<template>
  <div class="public-trip-list">
    <q-card flat bordere v-for="trip in publicTrips" :key="trip.TripId">
      <q-card-section horizontal>
        <q-card-section class="col-5 flex flex-center">
          <q-img
            class="rounded-borders fit"
            contain
            src="../assets/aircraft.svg"
          />
        </q-card-section>
        <q-card-section class="q-pt-xs">
          <div class="text-h5 q-mt-sm q-mb-xs text-secondary">Leer</div>
          <div class="text-caption text-grey">8 Tage</div>
          <div class="text-secondary">
            Erstelle deine Reise von Anfang an ohne Einschränkungen oder
            Vorgaben.
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-card flat bordered @click="createEmptyTrip()">
      <q-card-section horizontal>
        <q-card-section class="col-5 flex flex-center">
          <q-img
            class="rounded-borders fit"
            contain
            src="../assets/aircraft.svg"
          />
        </q-card-section>
        <q-card-section class="q-pt-xs">
          <div class="text-h5 q-mt-sm q-mb-xs text-secondary">Leer</div>
          <div class="text-secondary">
            Erstelle deine Reise von Anfang an ohne Einschränkungen oder
            Vorgaben.
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <p v-if="!country" class="text-secondary" style="margin-top:20px;">
      Suche eine Stadt oder ein Land oben um mehr Vorlagen zu entdecken
    </p>
    <p
      class="text-secondary"
      style="margin-top:20px;"
      v-else-if="!publicTrips || publicTrips.length === 0"
    >
      Es wurde leider noch keine Reise in diesem Land veröffentlicht
    </p>
  </div>
</template>

<script setup>
export default {
  props: {
    country: String,
    title: String
  },
  data() {
    return {
      publicTrips: []
    };
  },
  methods: {
    fetchTrips() {
      this.$store
        .dispatch("tripList/fetchPublicTripsForCountry", this.country)
        .then(trips => {
          this.publicTrips = trips;
        });
    },
    createEmptyTrip() {
      this.$store
        .dispatch("tripList/addTrip", { title: this.title })
        .then(trips => {
          this.publicTrips = trips;
        });
    }
  },
  created() {
    this.fetchTrips();
  }
};
</script>

<style lang="scss" scoped>
.public-trip-list {
  .q-card {
    margin-top: 10px;
    margin-bottom: 10px;
  }
}
</style>
