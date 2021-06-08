<template>
  <div style="overflow:hidden;" class="map fit">
    <q-inner-loading :showing="mapLoading" style="z-index: 1;">
      <q-spinner size="42px" color="primary"> </q-spinner>
      <p class="font-medium" style="margin-top:10px;">Karte wird geladen</p>
    </q-inner-loading>
    <MglMap
      v-if="accTo"
      :accessToken="accTo"
      :mapStyle.sync="mapStyle"
      style="height: 90vh"
      :center="centerLocation"
      :zoom="6"
      :mapboxGl="mapbox"
      :attributionControl="false"
      logoPosition="bottom-left"
      keyboard
      doubleClickZoom
      @load="onMapLoaded"
      @click="dialogVisible ? hideBottomDialog() : false"
    >
      <MglGeocoderControl
        :accessToken="accTo"
        @result="handleGeocoderSearch()"
        placeholder="Ort suchen"
      />
      <MglNavigationControl position="top-right" />
      <MapLayerPlugin class="mapboxgl-ctrl" position="top-right" />

      <q-btn
        color="white"
        text-color="secondary"
        icon="apartment"
        style="position:absolute; right:9px; top:220px;"
        @click="
          showSuggestionCountryDialog = true;
          showDrawerList = false;
          miniDisabled = true;
        "
      >
        <q-tooltip>Vorschläge</q-tooltip>
      </q-btn>
      <MglFullscreenControl position="bottom-right" />

      <template v-if="trip">
        <MglMarker
          v-for="stop in trip.stopList"
          :key="stop.stopId"
          :coordinates="[stop.location.lng, stop.location.lat]"
          color="#D56026"
          @click="dialogVisible ? hideBottomDialog() : showBottomDialog(stop)"
        >
        </MglMarker>
      </template>
      <!-- last clicked marker -->
      <MglMarker
        :coordinates="lastClickCoordinates"
        color="#70707075"
        :offset="[5, 10]"
        ref="addStopMarker"
      >
      </MglMarker>
      <!-- <div
        v-for="(stop, index) in trip.stopList"
        :key="'StopContainer' + stop.stopId + index"
      >
        <MglMarker
          v-if="stop.Parking && !isNaN(stop.Parking.lng)"
          :key="'Stop' + stop.DocId"
          :coordinates="[stop.Parking.lng, stop.Parking.lat]"
          color="#D56026"
          @click="onMarkerClicked($event)"
        >
        </MglMarker>
      </div> -->
      <!-- city markers -->
      <!-- <template v-if="showCityMarkers">
        <MglMarker
          v-for="(city, index) in suggestedCities"
          :key="city.name + index"
          :coordinates="[city.longitude, city.latitude]"
          :offset="[10, 5]"
          :ref="'cityMarker' + index"
        >
          <q-icon
            :ref="'cityMarkerIcon' + index"
            slot="marker"
            name="place"
            color="amber-14"
            size="30px"
          />
        </MglMarker>
      </template> -->
      <!-- POI Markers -->
      <!-- <template v-if="showPOIMarkers">
        <MglMarker
          v-for="(poi, index) in suggestedPOIs"
          :key="poi.name + index"
          :coordinates="[poi.location.lng, poi.location.lat]"
          :offset="[10, 5]"
        >
          <q-icon
            :ref="'poiMarkerIcon' + index"
            slot="marker"
            name="place"
            color="amber-14"
            size="30px"
          />
        </MglMarker>
      </template> -->

      <!-- <MglMarker
        v-for="(route, index) in addedRoutes"
        :key="'route' + index"
        :coordinates="route.location"
        :color="route.color"
        :ref="'route' + route.id"
      >
        <q-icon
          slot="marker"
          :style="{
            color: route.color,
            'background-color': 'white',
            'border-radius': '50%'
          }"
          :ref="'speedMarker' + route.id"
          :class="'speedMarker' + index"
          name="speed"
        />
      </MglMarker> -->
    </MglMap>
    <bottom-dialog
      v-model="bottomDialogShowed"
      :data="dialogObject"
    ></bottom-dialog>
  </div>
</template>

<script>
const MglMap = () => import("vue-mapbox");
const MglGeocoderControl = () => import("vue-mapbox-geocoder");
import Mapbox from "mapbox-gl";
import MapLayerPlugin from "../components/Map/MapLayerPlugin.vue";
import { auth } from "../firebaseInit.js";

import {
  MglMarker,
  MglNavigationControl,
  MglFullscreenControl
} from "vue-mapbox";
import Trip from "src/classes/trip";
import BottomDialog from "src/components/Map/BottomDialog.vue";

export default {
  meta: {
    link: {
      material: {
        rel: "stylesheet",
        href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css"
      }
    }
  },
  name: "Map",
  components: {
    MglMap,
    MglMarker,
    MglNavigationControl,
    MglFullscreenControl,
    MglGeocoderControl,
    MapLayerPlugin,
    BottomDialog
  },
  computed: {
    isMobile() {
      return window.matchMedia("(max-width: 550px)").matches;
    },
    accTo() {
      return this.$store.getters["api/getMapboxKey"];
    }
  },
  data() {
    return {
      mapStyle: "mapbox://styles/mareiski/ck27d9xpx5a9s1co7c2golomn",
      mapbox: null,
      mapLoading: true,
      centerLocation: [],
      trip: Trip,
      addedRoutes: [],
      dialogObject: {},
      lastClickCoordinates: { lat: 0, lng: 0, label: "abc" },
      bottomDialogShowed: false,
      dialogVisible: false
    };
  },
  methods: {
    onMapLoaded(event) {
      this.mapLoading = false;

      this.map = event.map;
    },
    handleGeocoderSearch() {},
    getTrip(userTrip, tripId) {
      this.$store
        .dispatch("tripList/fetchSingleTrip", {
          isUserTrip: userTrip,
          TripId: tripId
        })
        .then(fetchedTrip => {
          this.trip = fetchedTrip;
        });
    },
    hideBottomDialog() {
      this.bottomDialogShowed = false;
      this.dialogVisible = false;
    },
    showBottomDialog(stop) {
      this.dialogObject = {
        title: stop.title,
        subtitle: stop.location.label,
        imgUrls: [
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1",
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1",
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1"
        ]
      };
      this.bottomDialogShowed = true;

      let context = this;
      setTimeout(function() {
        context.dialogVisible = true;
      }, 100);
    }
  },
  created() {
    this.centerLocation = [10.451526, 51.165691];

    this.mapbox = Mapbox;
    this.map = null;

    let tripId = this.$route.params.tripId;
    let loggedIn = auth.user() !== null;

    this.getTrip(loggedIn, tripId);
  }
};
</script>
