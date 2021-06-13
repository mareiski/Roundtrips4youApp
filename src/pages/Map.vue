<template>
  <div style="overflow:hidden;" class="map fit">
    <div
      class="bg-white full-width flex justify-between text-secondary"
      style="height:30px; padding: 5px 10px;"
    >
      <div>
        <back-button :top="-1" @click="$router.push('/')"></back-button>
      </div>
      <b class="raleway text-primary">{{ trip.title }}</b>
      <q-icon name="settings" size="sm" />
    </div>
    <q-inner-loading :showing="mapLoading" style="z-index: 1;">
      <q-spinner size="42px" color="primary"> </q-spinner>
      <p class="font-medium" style="margin-top:10px;">Karte wird geladen</p>
    </q-inner-loading>
    <MglMap
      v-if="accTo"
      :accessToken="accTo"
      :mapStyle.sync="mapStyle"
      style="height: 85vh"
      :center="centerLocation"
      :zoom="6"
      :mapboxGl="mapbox"
      :attributionControl="false"
      logoPosition="bottom-left"
      keyboard
      doubleClickZoom
      @load="onMapLoaded"
      @click="onMapClicked"
    >
      <MglGeocoderControl
        :accessToken="accTo"
        @result="handleGeocoderSearch"
        placeholder="Ort suchen"
      />
      <q-btn
        color="white"
        text-color="secondary"
        icon="list"
        round
        @click="$router.push('/Liste/' + trip.TripId)"
        style="position:absolute; right:9px; top:16px;"
      >
      </q-btn>
      <MglNavigationControl position="top-right" />
      <MapLayerPlugin class="mapboxgl-ctrl" position="top-right" />

      <template v-if="trip">
        <MglMarker
          v-for="(stop, index) in trip.stopList"
          :key="stop.stopId"
          :coordinates="[stop.location.lng, stop.location.lat]"
          color="#D56026"
          v-text="index"
          @click="showBottomDialog(stop, true, true)"
        >
          <div slot="marker">
            <q-icon
              style="top:-14px"
              name="fas fa-map-marker"
              color="primary"
              size="lg"
            />
            <b
              style="position:absolute; left:16px; top:-9px;"
              class="text-white"
            >
              {{ index + 1 }}
            </b>
          </div>
        </MglMarker>
      </template>
      <!-- last clicked marker -->
      <MglMarker
        :coordinates="[lastClickCoordinates.lng, lastClickCoordinates.lat]"
        color="#70707075"
        :offset="[5, 10]"
        ref="addStopMarker"
        v-if="showAddStopMarker"
        @click="showBottomDialogFromLastClick()"
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
const turf = () => import("turf");
import Mapbox from "mapbox-gl";
import MapLayerPlugin from "../components/Map/MapLayerPlugin.vue";
import { auth } from "../firebaseInit.js";

import { MglMarker, MglNavigationControl } from "vue-mapbox";
import Trip from "src/classes/trip";
import BottomDialog from "src/components/Map/BottomDialog.vue";
import BackButton from "../components/Buttons/BackButton.vue";
import { uuid } from "vue-uuid";
import sharedMethods from "app/sharedMethods";

let map;

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
    MglGeocoderControl,
    MapLayerPlugin,
    BottomDialog,
    BackButton
  },
  computed: {
    isMobile() {
      return window.matchMedia("(max-width: 550px)").matches;
    },
    accTo() {
      return this.$store.getters["api/getMapboxKey"];
    },
    // need this beause of watcher below
    stopList() {
      return this.trip ? this.trip.stopList : [];
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
      dialogVisible: false,
      showAddStopMarker: false,
      bounds: [],
      TripId: null,
      markerClicked: false,
      routeIds: [],
      whitelistedLabels: [
        "airport-label",
        "place-label",
        "state-label",
        "poi-label",
        "settlement-label",
        "natural-point-label"
      ] // 'country-label',
    };
  },
  watch: {
    stopList: function(newStopList, oldStopList) {
      // hide all existing routes
      this.routeIds.forEach(idObject => {
        map.setLayoutProperty(idObject.routeId, "visibility", "none");
      });

      // recalculate all routes
      if (newStopList) {
        newStopList.forEach((stop, index) => {
          // add route from last to this stop
          if (index > 0) {
            this.addRoute(this.trip.stopList[index - 1], stop, index);
          }
        });
      }

      // hide dialog always if a stop was added or removed
      this.hideBottomDialog();
      this.showAddStopMarker = false;
    }
  },
  methods: {
    onMapLoaded(event) {
      this.mapLoading = false;

      map = event.map;

      let context = this;
      // wait 1 second to ensure map is realy loaded
      setTimeout(function() {
        context.fitToBounds(context.bounds);
      }, 1000);

      // try to get routes again
      if (this.trip && this.trip.stopList) {
        this.trip.stopList.forEach((stop, index) => {
          // add route from last to this stop
          if (index > 0) {
            this.addRoute(this.trip.stopList[index - 1], stop, index);
          }
        });
      }
    },
    fitToBounds(bounds) {
      try {
        if (bounds.length > 1) {
          turf().then(turf => {
            var line = turf.lineString(bounds);
            var bbox = turf.bbox(line);
            map.fitBounds(new Mapbox.LngLatBounds(bbox), { padding: 80 });
          });
        } else if (bounds.length === 1) {
          this.centerLocation = this.bounds[0];
        }
      } catch (e) {
        console.log(e);
      }
    },
    onMapClicked(event) {
      if (this.markerClicked) {
        this.markerClicked = false;
        return;
      }

      if (this.dialogVisible) {
        this.hideBottomDialog();
      }

      let e = event.mapboxEvent;

      var features = map.queryRenderedFeatures(e.point);
      var displayProperties = ["properties", "id", "layer", "geometry"];

      // get data around clicked point
      var displayFeatures = features.map(function(feat) {
        var displayFeat = {};
        displayProperties.forEach(function(prop) {
          displayFeat[prop] = feat[prop];
        });
        return displayFeat;
      });

      displayFeatures.forEach(feature => {
        if (this.whitelistedLabels.includes(feature.layer.id)) {
          // set marker to new position
          this.lastClickCoordinates.lng = feature.geometry.coordinates[0];
          this.lastClickCoordinates.lat = feature.geometry.coordinates[1];
          this.lastClickCoordinates.label = feature.properties.name_de;

          this.showAddStopMarker = true;

          if (this.trip.stopList[0]) {
            map.flyTo({
              center: [
                this.lastClickCoordinates.lng,
                this.lastClickCoordinates.lat
              ],
              speed: 0.5,
              curve: 1
            });
          }

          this.showBottomDialogFromLastClick();
        }
      });
    },
    handleGeocoderSearch(event) {
      let result = event.result;

      this.lastClickCoordinates.lng = result.geometry.coordinates[0];
      this.lastClickCoordinates.lat = result.geometry.coordinates[1];
      let placeName = result.place_name;

      if (placeName.includes(",")) placeName = placeName.split(",")[0];

      this.lastClickCoordinates.label = placeName;

      this.showAddStopMarker = true;

      //this.loadMarkerInfos(placeName)
      this.showBottomDialogFromLastClick();
    },
    getTrip(userTrip) {
      this.$store
        .dispatch("tripList/fetchSingleTrip", {
          isUserTrip: userTrip,
          TripId: this.TripId
        })
        .then(fetchedTrip => {
          this.trip = fetchedTrip;

          this.trip.stopList.forEach((stop, index) => {
            this.bounds.push([stop.location.lng, stop.location.lat]);

            // add route from last to this stop
            if (index > 0) {
              this.addRoute(this.trip.stopList[index - 1], stop, index);
            }
          });
        });
    },
    addRoute(startStop, endStop, index) {
      if (!map) return false;

      let profile = startStop.profile || this.trip.transportProfile;
      // get random color for route
      let color = this.getRandomColor(index, this.trip.stopList.length);

      // generate id
      let id = uuid.v4() + startStop.stopId;
      this.routeIds.push({ stopId: startStop.stopId, routeId: id });

      this.getRoute(profile, startStop.location, endStop.location).then(
        data => {
          var geojson = {
            id: id,
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: data.route
            }
          };

          // if the route already exists on the map, reset it using setData
          if (map.getSource(id)) {
            map.getSource(id).setData(geojson);
            map.setPaintProperty(id, "line-color", color);
            map.setLayoutProperty(id, "visibility", "visible");
          } else {
            // otherwise, make a new route
            map.addLayer({
              id: id,
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: geojson
                  }
                }
              },
              layout: {
                "line-join": "round",
                "line-cap": "round",
                visibility: "visible"
              },
              paint: {
                "line-color": color,
                "line-width": 5,
                "line-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.75,
                  0.4
                ]
              }
            });

            // onc lick listener for route
            let context = this;
            map.on("click", id, function(_e) {
              context.showBottomDialogFromRoute(
                startStop,
                endStop,
                data.duration,
                data.distance
              );
            });
            map.getSource(id).setData(geojson);
          }
        }
      );
    },
    getRoute(profile, startLocation, endLocation) {
      return new Promise(resolve => {
        var url =
          "https://api.mapbox.com/directions/v5/mapbox/" +
          profile +
          "/" +
          startLocation.lng +
          "," +
          startLocation.lat +
          ";" +
          endLocation.lng +
          "," +
          endLocation.lat +
          "?geometries=geojson&access_token=" +
          this.accTo;

        // retrieve data from mapbox
        sharedMethods.requestURL(url).then(response => {
          var data = response.data.routes[0];
          var route = data.geometry.coordinates;

          // get duration
          let rawDuration = data.duration * 1000;
          let duration = sharedMethods.msToTime(rawDuration);

          let rawDistance =
            Math.floor(data.distance / 1000) > 0
              ? Math.floor(data.distance / 1000)
              : 0;
          let distance = rawDistance > 0 ? rawDistance + " km" : null;

          resolve({
            route: route,
            rawDuration: rawDuration,
            duration: duration,
            rawDistance: rawDistance,
            distance: distance,
            from: startLocation.label,
            to: endLocation.label
          });
        });
      });
    },
    getRandomColor(step, numOfSteps) {
      var r, g, b;
      var h = step / numOfSteps;
      var i = ~~(h * 6);
      var f = h * 6 - i;
      var q = 1 - f;
      switch (i % 6) {
        case 0:
          r = 1;
          g = f;
          b = 0;
          break;
        case 1:
          r = q;
          g = 1;
          b = 0;
          break;
        case 2:
          r = 0;
          g = 1;
          b = f;
          break;
        case 3:
          r = 0;
          g = q;
          b = 1;
          break;
        case 4:
          r = f;
          g = 0;
          b = 1;
          break;
        case 5:
          r = 1;
          g = 0;
          b = q;
          break;
      }
      var c =
        "#" +
        ("00" + (~~(r * 255)).toString(16)).slice(-2) +
        ("00" + (~~(g * 255)).toString(16)).slice(-2) +
        ("00" + (~~(b * 255)).toString(16)).slice(-2);
      return c;
    },
    showBottomDialog(
      stop,
      alreadyAdded,
      buttons,
      subtitle = stop.location.label
    ) {
      this.hideBottomDialog();
      if (alreadyAdded) {
        this.showAddStopMarker = false;
        this.markerClicked = true;
      }
      this.dialogObject = {
        title: stop.title,
        subtitle: subtitle,
        location: stop.location,
        stopId: stop.stopId,
        TripId: this.TripId,
        alreadyAdded: alreadyAdded,
        buttons: buttons,
        locationIcon: subtitle === stop.location.label,
        imgUrls: [
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1",
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1",
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Forbisreisen.com%2Fwp-content%2Fuploads%2F2018%2F04%2Freisen.jpg&f=1&nofb=1"
        ]
      };

      let context = this;
      // wait to ensure a dialog hide is excecuted before this
      setTimeout(function() {
        context.bottomDialogShowed = true;
        context.dialogVisible = true;
      }, 100);
    },
    hideBottomDialog() {
      this.bottomDialogShowed = false;
      this.dialogVisible = false;
    },
    showBottomDialogFromLastClick() {
      let lastStop = this.trip.stopList[this.trip.stopList.length - 1];

      if (lastStop) {
        this.getRoute(
          lastStop.profile || this.trip.transportProfile,
          lastStop.location,
          this.lastClickCoordinates
        ).then(data => {
          this.showBottomDialog(
            {
              title: this.lastClickCoordinates.label,
              location: this.lastClickCoordinates
            },
            false,
            true,
            data.duration + " ab " + lastStop.location.label
          );
        });
      } else {
        this.showBottomDialog(
          {
            title: this.lastClickCoordinates.label,
            location: this.lastClickCoordinates
          },
          false,
          true
        );
      }
    },
    showBottomDialogFromRoute(startStop, endStop, duration, distance) {
      this.showBottomDialog(
        {
          title:
            "Route von " +
            startStop.location.label +
            " nach " +
            endStop.location.label,
          location: startStop.location
        },
        false,
        false,
        duration + ", " + distance
      );
    }
  },
  created() {
    this.centerLocation = [10.451526, 51.165691];

    this.mapbox = Mapbox;
    map = null;

    this.TripId = this.$route.params.tripId;
    let loggedIn = auth.user() !== null;

    this.getTrip(loggedIn);
  }
};
</script>

<style lang="scss">
@import url("../css/map.scss");
</style>
