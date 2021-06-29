<template>
  <div style="overflow:hidden;" class="map fit">
    <q-pull-to-refresh @refresh="getTrip">
      <div
        class="bg-white full-width flex justify-between text-secondary"
        style="height:35px; padding: 5px 10px;"
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
    </q-pull-to-refresh>
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
        ref="geocoder"
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
      <MapLayerPlugin
        @styleChanged="addAllRoutes()"
        class="mapboxgl-ctrl"
        position="top-right"
      />

      <zoom-to-route @clicked="fitToBounds(bounds)"></zoom-to-route>

      <template v-if="trip">
        <MglMarker
          v-for="(stop, index) in trip.stopList"
          :key="stop.stopId"
          :coordinates="[stop.location.lng, stop.location.lat]"
          color="#D56026"
          :offset="[multipleSameStops(stop.location) ? index * 4 : 0, 0]"
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
    </MglMap>
    <bottom-dialog
      v-model="bottomDialogShowed"
      :data="dialogObject"
      @poiClicked="flyTo($event)"
    ></bottom-dialog>
  </div>
</template>

<script>
const MglMap = () => import("vue-mapbox");
const MglGeocoderControl = () => import("vue-mapbox-geocoder");
import turf from "turf";
import pointToLineDistance from "@turf/point-to-line-distance";
import lineIntersect from "@turf/line-intersect";
import nearestPoint from "@turf/nearest-point";

import Mapbox from "mapbox-gl";
import MapLayerPlugin from "../components/Map/MapLayerPlugin.vue";
import ZoomToRoute from "../components/Map/ZoomToRoute.vue";
import { auth } from "../firebaseInit.js";

import { MglMarker, MglNavigationControl } from "vue-mapbox";
import Trip from "src/classes/trip";
import BottomDialog from "src/components/Map/BottomDialog.vue";
import CloseButton from "../components/Buttons/CloseButton.vue";
import { uuid } from "vue-uuid";
import sharedMethods from "app/sharedMethods";
import shp from "shpjs";

let map;
let rawEuropeanRivers;
let rawRivers;

export default {
  meta: {
    link: {
      material: {
        rel: "stylesheet",
        href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css"
      }
    }
  },
  name: "map",
  components: {
    MglMap,
    MglMarker,
    MglNavigationControl,
    MglGeocoderControl,
    MapLayerPlugin,
    BottomDialog,
    CloseButton,
    ZoomToRoute
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
      ], // 'country-label',
      suggestedSearches: [
        { title: "Vorgeschlagene Orte:" },
        { title: "Berlin", caption: "Deutschland" },
        { title: "Venedig", caption: "Italien" },
        { title: "Barcelona", caption: "Spanien" },
        { title: "Stockholm", caption: "Schweden" }
      ]
    };
  },
  watch: {
    stopList: function(newStopList, oldStopList) {
      // hide all existing routes
      this.routeIds.forEach(idObject => {
        map.setLayoutProperty(idObject.routeId, "visibility", "none");
      });

      // recalculate all routes
      this.addAllRoutes();

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
      let promiseList = [];
      promiseList.push(
        shp("../rivers.zip").then(geojson => {
          rawRivers = geojson;
          map.addLayer({
            id: "rivers",
            type: "line",
            source: {
              type: "geojson",
              data: geojson
            },
            paint: {
              "line-color": "#000",
              "line-width": 5,
              "line-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.75,
                0.4
              ]
            }
          });
        })
      );

      promiseList.push(
        shp("../european_rivers.zip").then(geojson => {
          rawEuropeanRivers = geojson;
          map.addLayer({
            id: "europeanRivers",
            type: "line",
            source: {
              type: "geojson",
              data: geojson
            },
            paint: {
              "line-color": "#000",
              "line-width": 5,
              "line-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.75,
                0.4
              ]
            }
          });
        })
      );

      Promise.all(promiseList).then(() => {
        this.addAllRoutes();
      });
    },
    flyTo(event) {
      this.lastClickCoordinates = event;
      this.showAddStopMarker = true;

      setTimeout(
        function() {
          map.flyTo({
            center: [event.lng, event.lat],
            speed: 0.8,
            curve: 1,
            zoom: 14
          });
        },
        map == null ? 3000 : 100
      );
    },
    /**
     * @returns if there is one more stop with same loation
     */
    multipleSameStops(location) {
      let count = 0;
      this.trip.stopList.forEach(stop => {
        if (
          stop.location.lat === location.lat &&
          stop.location.lng === location.lng
        ) {
          count++;
        }
      });

      return count > 1;
    },
    addAllRoutes() {
      if (this.trip && this.trip.stopList) {
        this.bounds = [];

        this.trip.stopList.forEach((stop, index) => {
          // ad bounds
          this.bounds.push([stop.location.lng, stop.location.lat]);

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
          var line = turf.lineString(bounds);
          var bbox = turf.bbox(line);
          map.fitBounds(new Mapbox.LngLatBounds(bbox), { padding: 80 });
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
        } else if (
          feature.layer.id === "rivers" ||
          feature.layer.id === "europeanRivers"
        ) {
          console.log("Geklickter Fluss: " + feature.properties.name_de);
          console.log(feature);
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
    getTrip(done) {
      let userTrip = auth.user() !== null;

      this.$store
        .dispatch("tripList/fetchSingleTrip", {
          isUserTrip: userTrip,
          TripId: this.TripId
        })
        .then(fetchedTrip => {
          this.trip = fetchedTrip;
          this.addAllRoutes();
          if (done) done();
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

            // on click listener for route
            let context = this;
            map.on("click", id, function(e) {
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
    getRiverRoute(
      startLocation,
      endLocation,
      takenCoords,
      currentRiver,
      startRiverPoint
    ) {
      if (!currentRiver) {
        // find the nearest river to start location
        currentRiver = this.getClosestRiver(startLocation);
      }

      if (!startRiverPoint) {
        //find the nearest point on the river to start location
        startRiverPoint = turf.pointOnLine(currentRiver.geometry, [
          startLocation.lng,
          startLocation.lat
        ]);
      }

      // find the nearest point on the river to stop position
      let stopRiverPoint = turf.pointOnLine(currentRiver.geometry, [
        endLocation.lng,
        endLocation.lat
      ]);

      let distanceToEndLocation = turf.distance(stopRiverPoint, [
        endLocation.lng,
        endLocation.lat
      ]);

      console.log(stopRiverPoint);
      console.log(distanceToEndLocation);

      // check if distance from stop river point to end location is less than 5km
      if (Math.round(distanceToEndLocation) > 5) {
        // we need to check if there are other rivers to get to end location
        let intersectingRivers = [];
        rawEuropeanRivers.features.forEach(river => {
          if (
            river !== currentRiver &&
            lineIntersect(currentRiver, river).features.length > 0
          ) {
            intersectingRivers.push(river);
          }
        });

        rawRivers.features.forEach(river => {
          if (
            river !== currentRiver &&
            lineIntersect(currentRiver, river).features.length > 0
          ) {
            intersectingRivers.push(river);
          }
        });

        // get best interscting river (closest to end location)
        if (intersectingRivers.length > 0) {
          let bestIntersectingRiver = this.getClosestRiver(
            endLocation,
            intersectingRivers
          );

          let intersectingPoints = lineIntersect(
            currentRiver,
            bestIntersectingRiver
          );

          // get closest intersecting point to end location
          let closestIntersectingPoint = nearestPoint(
            [endLocation.lng, endLocation.lat],
            intersectingPoints
          );

          if (
            !takenCoords.includes(closestIntersectingPoint.geometry.coordinates)
          ) {
            // get route from start point to intersecting point
            let routeToIntersectingRiver = turf.lineSlice(
              startRiverPoint,
              closestIntersectingPoint,
              currentRiver
            );

            console.log(routeToIntersectingRiver);

            // todo this makes also a route back
            takenCoords.push.apply(
              takenCoords,
              routeToIntersectingRiver.geometry.coordinates
            );

            console.log(closestIntersectingPoint);
            console.log(endLocation);
            console.log(takenCoords);
            console.log(bestIntersectingRiver);

            // restart method with intersecting point as start
            takenCoords.push.apply(
              takenCoords,
              this.getRiverRoute(
                {
                  lat: closestIntersectingPoint.geometry.coordinates[1],
                  lng: closestIntersectingPoint.geometry.coordinates[0]
                },
                endLocation,
                takenCoords,
                bestIntersectingRiver,
                closestIntersectingPoint
              )
            );
          } else {
            console.log("else 1");
            let route = turf.lineSlice(
              startRiverPoint,
              stopRiverPoint,
              currentRiver
            );
            takenCoords.push.apply(takenCoords, route.geometry.coordinates);
          }
        } else {
          console.log("else 2");
          let route = turf.lineSlice(
            startRiverPoint,
            stopRiverPoint,
            currentRiver
          );
          takenCoords.push.apply(takenCoords, route.geometry.coordinates);
        }
      } else {
        console.log("else 3");
        let route = turf.lineSlice(
          startRiverPoint,
          stopRiverPoint,
          currentRiver
        );
        takenCoords.push.apply(takenCoords, route.geometry.coordinates);
      }

      // return all taken coords
      return takenCoords;
    },
    getClosestRiver(location, rivers) {
      let distance = -1;
      let foundRiver;

      if (!rivers) {
        rawEuropeanRivers.features.forEach(river => {
          let distanceToCheck;
          if (river.geometry.type !== "MultiLineString") {
            distanceToCheck = pointToLineDistance(
              [location.lng, location.lat],
              river
            );
          } else {
            let shortestSubLineDistance = -1;
            let distanceToCheck;
            river.geometry.coordinates.forEach(coordinateArray => {
              shortestSubLineDistance = pointToLineDistance(
                [location.lng, location.lat],
                coordinateArray
              );

              if (
                shortestSubLineDistance === -1 ||
                shortestSubLineDistance < distanceToCheck
              ) {
                distanceToCheck = shortestSubLineDistance;
              }
            });
          }

          if (distance === -1 || distanceToCheck < distance) {
            distance = distanceToCheck;
            foundRiver = river;
          }
        });

        rawRivers.features.forEach(river => {
          let distanceToCheck;
          if (river.geometry.type !== "MultiLineString") {
            distanceToCheck = pointToLineDistance(
              [location.lng, location.lat],
              river
            );
          } else {
            let shortestSubLineDistance = -1;
            let distanceToCheck;
            river.geometry.coordinates.forEach(coordinateArray => {
              shortestSubLineDistance = pointToLineDistance(
                [location.lng, location.lat],
                coordinateArray
              );

              if (
                shortestSubLineDistance === -1 ||
                shortestSubLineDistance < distanceToCheck
              ) {
                distanceToCheck = shortestSubLineDistance;
              }
            });
          }
          if (distance === -1 || distanceToCheck < distance) {
            distance = distanceToCheck;
            foundRiver = river;
          }
        });
      } else {
        rivers.forEach(river => {
          let distanceToCheck;
          if (river.geometry.type !== "MultiLineString") {
            distanceToCheck = pointToLineDistance(
              [location.lng, location.lat],
              river
            );
          } else {
            let shortestSubLineDistance = -1;
            let distanceToCheck;
            river.geometry.coordinates.forEach(coordinateArray => {
              shortestSubLineDistance = pointToLineDistance(
                [location.lng, location.lat],
                coordinateArray
              );

              if (
                shortestSubLineDistance === -1 ||
                shortestSubLineDistance < distanceToCheck
              ) {
                distanceToCheck = shortestSubLineDistance;
              }
            });
          }
          if (distance === -1 || distanceToCheck < distance) {
            distance = distanceToCheck;
            foundRiver = river;
          }
        });
      }

      return foundRiver;
    },
    getRoute(profile, startLocation, endLocation) {
      return new Promise(resolve => {
        if (profile === "SUP") {
          let route = this.getRiverRoute(startLocation, endLocation, []);
          var routeLineString = {
            id: "SUPRoute",
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route
            }
          };

          // get distance
          let rawRouteDistance = Math.round(
            turf.lineDistance(routeLineString, "kilometers")
          );

          let routeDistance =
            rawRouteDistance > 0 ? rawRouteDistance + " km" : null;

          console.log(routeLineString);

          let rawDurationHours = rawRouteDistance / 6;

          resolve({
            route: route,
            rawDuration: rawDurationHours,
            duration: rawDurationHours + "h",
            rawDistance: rawRouteDistance,
            distance: routeDistance,
            from: startLocation.label,
            to: endLocation.label
          });
        } else {
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
        }
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
        stop: stop,
        TripId: this.TripId,
        alreadyAdded: alreadyAdded,
        buttons: buttons,
        locationIcon: subtitle === stop.location.label
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
    },
    focusGeocoder() {
      let suggestionsUl = document.getElementsByClassName("suggestions")[0];

      // fill the geocoder with suggestions
      if (suggestionsUl.style.display === "none") {
        if (suggestionsUl.childElementCount === 0) {
          this.suggestedSearches.forEach(search => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const wrapperDiv = document.createElement("div");
            const context = this;

            if (this.suggestedSearches.indexOf(search) !== 0) {
              a.addEventListener("click", function() {
                context.$refs.geocoder.control.query(search.title);
              });
            }
            wrapperDiv.classList.add("mapboxgl-ctrl-geocoder--suggestion");

            const titleDiv = document.createElement("div");
            titleDiv.appendChild(document.createTextNode(search.title));
            titleDiv.classList.add("mapboxgl-ctrl-geocoder--suggestion-title");
            wrapperDiv.appendChild(titleDiv);

            if (search.caption) {
              const captionDiv = document.createElement("div");
              captionDiv.appendChild(document.createTextNode(search.caption));
              captionDiv.classList.add(
                "mapboxgl-ctrl-geocoder--suggestion-address"
              );

              wrapperDiv.appendChild(captionDiv);
            }

            li.appendChild(a);
            a.appendChild(wrapperDiv);

            suggestionsUl.appendChild(li);
          });
        }
        suggestionsUl.style.display = "block";
      } else {
        suggestionsUl.style.display = "none";
      }
    }
  },
  created() {
    this.centerLocation = [10.451526, 51.165691];

    this.mapbox = Mapbox;
    map = null;

    this.TripId = this.$route.params.tripId;

    this.getTrip();
  },
  beforeRouteLeave(to, from, next) {
    this.hideBottomDialog();
    next();
  }
};
</script>

<style lang="scss">
@import url("../css/map.scss");
</style>
