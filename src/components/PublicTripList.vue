<template>
  <div class="public-trip-list">
    <h5 v-if="showEmpty">Neue Reise</h5>
    <q-card
      v-if="showEmpty"
      flat
      bordered
      @click="
        !disableAdding
          ? ((disableAdding = true), $emit('createEmptyTrip'))
          : null
      "
    >
      <q-card-section horizontal>
        <q-card-section
          class="col-5 flex flex-center"
          style="max-height: 200px;"
        >
          <q-img
            class="rounded-borders fit"
            contain
            src="../assets/aircraft.svg"
          />
        </q-card-section>
        <q-card-section class="q-pt-xs">
          <div class="text-h5 q-mt-sm q-mb-xs text-secondary">Neue Reise</div>
          <div class="text-secondary">
            Erstelle deine Reise von Anfang an ohne Einschränkungen oder
            Vorgaben.
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <h5>Vorlage wählen</h5>
    <q-card
      flat
      bordered
      v-for="trip in publicTrips"
      :key="trip.TripId"
      class="cursor-pointer"
      @click="$emit('createTrip', trip)"
    >
      <q-card-section horizontal>
        <q-card-section
          class="col-5 flex flex-center"
          style="max-height: 200px;"
        >
          <q-img
            class="rounded-borders"
            cover
            v-if="
              trip.titleImageUrl &&
                trip.titleImageUrl !== '../assets/aircraft.svg'
            "
            :src="trip.titleImageUrl"
            height="170px"
          />
          <q-img
            v-else
            src="../assets/aircraft.svg"
            class="rounded-borders fit"
            contain
          />
        </q-card-section>
        <q-card-section class="q-pt-xs">
          <div class="text-h5 q-mt-sm q-mb-xs text-secondary">
            {{ trip.title }}
          </div>
          <div class="text-caption text-grey">{{ trip.days }} Tage</div>
          <div class="text-secondary">
            {{ trip.description }}
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
      Es wurde leider noch keine Reise in {{ country }} veröffentlicht
    </p>
  </div>
</template>

<script>
export default {
  props: {
    country: String,
    title: String,
    showEmpty: Boolean
  },
  data() {
    return {
      publicTrips: [],
      disableAdding: false
    };
  },
  watch: {
    country: function(newCountry, oldCountry) {
      if (newCountry !== oldCountry) {
        this.fetchTrips();
      }
    }
  },
  methods: {
    fetchTrips() {
      this.$store
        .dispatch("tripList/fetchPublicTripsForCountry", this.country)
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

h5 {
  margin-top: 35px;
  margin-bottom: 5px;
}
</style>
