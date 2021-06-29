<template>
  <q-page style="padding-top:0;">
    <q-pull-to-refresh @refresh="fetchTrip">
      <div
        class="bg-white full-width flex justify-between text-secondary"
        style="height:35px; padding: 5px 10px; margin-bottom:70px"
      >
        <div>
          <close-button
            :top="0"
            size="md"
            @click="$router.push('/')"
          ></close-button>
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
            v-for="stop in trip.stopList"
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
            <q-item-section @click="showEditStopDialog(stop)">
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

            <q-item-section side top @click="showEditStopDialog(stop)">
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
                  @click="showEditStopDialog(stop)"
                  flat
                  round
                  size="md"
                  icon="edit"
                  :ripple="false"
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
          >Füge einen weiteren Stopp hinzu, um die Orte hier neu
          anzuordnen.</span
        >
      </div>
    </q-pull-to-refresh>
    <q-dialog maximized v-model="editStopDialogVisible" @hide="updateStop()">
      <div>
        <close-button
          :top="10"
          @click="editStopDialogVisible = !editStopDialogVisible"
        ></close-button>
        <edit-stop-dialog
          v-if="selectedStop"
          v-model="selectedStop"
        ></edit-stop-dialog>
      </div>
    </q-dialog>
  </q-page>
</template>

<script>
import Trip from "src/classes/trip";
import draggable from "vuedraggable";
import CloseButton from "src/components/Buttons/CloseButton.vue";
import Stop from "src/classes/stop";
import EditStopDialog from "src/components/Wizard/EditStopDialog.vue";

export default {
  name: "list",
  components: {
    draggable,
    CloseButton,
    EditStopDialog
  },
  data() {
    return {
      trip: Trip,
      editStopDialogVisible: false,
      selectedStop: Stop
    };
  },
  created() {
    this.fetchTrip();
  },
  methods: {
    fetchTrip(done) {
      const TripId = this.$route.params.tripId;

      this.$store
        .dispatch("tripList/fetchSingleTrip", {
          isUserTrip: true,
          TripId: TripId,
          forceRefresh: !!done
        })
        .then(fetchedTrip => {
          this.trip = fetchedTrip;
          console.log("fetched");
          if (done) done();
        });
    },
    showEditStopDialog(stop) {
      this.selectedStop = stop;
      this.editStopDialogVisible = true;
    },
    updateStop() {
      this.$store.dispatch("tripList/updateStop", {
        stop: this.selectedStop,
        TripId: this.trip.TripId,
        isUserTrip: true
      });
    },
    emitOnDragged() {
      let payload = {
        newStopList: this.trip.toObject().stopList,
        TripId: this.trip.TripId
      };
      this.$store.dispatch("tripList/setNewStopList", payload);
    },
    focusGeocoder() {
      this.$router.push("/Karte/" + this.trip.TripId);
      // wait to ensure we are on the map todo
      let context = this;
      setTimeout(function() {
        context.$emit("clickActionButton");
      }, 500);
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
