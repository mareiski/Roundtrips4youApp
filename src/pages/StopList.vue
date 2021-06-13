<template>
  <div>
    <div
      class="bg-white full-width flex justify-between text-secondary"
      style="height:30px; padding: 5px 10px; margin-bottom:70px"
    >
      <div>
        <back-button :top="-1" @click="$router.push('/')"></back-button>
      </div>
      <b class="raleway text-primary">{{ trip.title }}</b>
      <q-icon name="settings" size="sm" />
    </div>
    <q-btn
      color="white"
      text-color="secondary"
      icon="map"
      label="Karte"
      @click="$router.push('/Karte/' + trip.TripId)"
      style="position:absolute; right:9px; top:46px; z-index:1;"
    >
    </q-btn>
    <q-list
      bordered
      class="rounded-borders"
      v-show="trip.stopList && trip.stopList.length > 0"
    >
      <draggable
        v-model="trip.stopList"
        @end="emitOnDragged()"
        handle=".handle"
      >
        <q-item
          v-for="(stop, index) in trip.stopList"
          :key="stop"
          v-ripple
          clickable
          style="padding-left:8px; padding-right:5px;"
        >
          <q-item-section avatar>
            <q-icon
              color="primary"
              name="drag_indicator"
              class="cursor-DandD handle"
            />
          </q-item-section>
          <q-item-section @click="$emit('editStop', index)">
            <q-item-label lines="1" class="text-secondary">{{
              stop.title
            }}</q-item-label>
            <q-item-label caption lines="1" style="max-width:400px;">
              <q-icon name="location_on" />
              {{ stop.location.label.split(",")[0] }}
              <!-- <span
                      v-if="stop.Description"
                      v-html="'<span class=&quot;text-weight-bold&quot;>' + stop.Location.label.split(',')[0] + (stop.Description ? ' - ' : '') + '</span>' + stop.Description"
                    >
                    </span> -->
            </q-item-label>
          </q-item-section>

          <q-item-section side top @click="$emit('editStop', index)">
            <div
              class="flex justify-center"
              style="flex-direction:column; height:100%;"
            >
              <!-- {{stop.InitDate.split(' ')[0]}} -->
            </div>
          </q-item-section>

          <q-item-section side top style="padding:0;">
            <div>
              <q-btn
                @click="$emit('editStop', index)"
                flat
                round
                size="md"
                icon="edit"
              >
                <q-tooltip>Optionen</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>

          <q-item-section side top style="padding:0;">
            <div>
              <q-btn
                @click="deleteStop(stop.stopId)"
                v-if="trip.stopList && trip.stopList.length > 1"
                flat
                round
                size="md"
                icon="delete"
              >
                <q-tooltip>Stopp löschen</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </draggable>
      <q-separator inset="item" />
    </q-list>
    <div
      style="padding: 10px 10px 0 10px;"
      v-if="trip.stopList && trip.stopList.length <= 1"
    >
      <span
        v-if="trip.stopList && trip.stopList.length === 0"
        class="font-medium"
        >Klicke auf einen Ort auf der Karte um ihn hinzuzufügen.</span
      >
      <span v-else class="font-medium"
        >Füge einen weiteren Stopp hinzu, um die Orte hier neu anzuordnen.</span
      >
    </div>
  </div>
</template>

<script>
import Trip from "src/classes/trip";
import draggable from "vuedraggable";
import BackButton from "src/components/Buttons/BackButton.vue";

export default {
  name: "StopList",
  components: {
    draggable,
    BackButton
  },
  data() {
    return {
      trip: Trip
    };
  },
  created() {
    const TripId = this.$route.params.tripId;

    this.$store
      .dispatch("tripList/fetchSingleTrip", {
        isUserTrip: true,
        TripId: TripId
      })
      .then(fetchedTrip => {
        this.trip = fetchedTrip;
      });
  },
  methods: {
    emitOnDragged() {
      let payload = {
        newStopList: this.trip.toObject().stopList,
        TripId: this.trip.TripId
      };
      this.$store.dispatch("tripList/setNewStopList", payload);
    },
    deleteStop(stopId) {
      this.$store.dispatch("tripList/deleteStop", {
        stopId: stopId,
        TripId: this.trip.TripId,
        isUserTrip: true
      });
    }
  }
};
</script>
