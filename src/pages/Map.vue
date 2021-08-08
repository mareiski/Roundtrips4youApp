<template>
	<div
		style="overflow:hidden;"
		class="map fit"
	>
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
				<q-icon
					style="z-index:1;"
					@click="$router.push('/Einstellungen/' + trip.TripId)"
					name="settings"
					size="sm"
				/>
			</div>
		</q-pull-to-refresh>
		<q-inner-loading
			:showing="mapLoading"
			style="z-index: 1;"
		>
			<q-spinner
				size="42px"
				color="primary"
			> </q-spinner>
			<p
				class="font-medium"
				style="margin-top:10px;"
			>{{ mapLoadingText }}</p>
		</q-inner-loading>
		<keep-alive>
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
					@styleChanged="
          addAllRoutes(true);
          loadRiverLayers();
        "
					class="mapboxgl-ctrl"
					position="top-right"
				/>

				<zoom-to-route @clicked="fitToBounds()"></zoom-to-route>

				<!-- popups for routes -->
				<template v-if="cachedRouteLayers">
					<MglPopup
						v-for="(layer, index) in cachedRouteLayers"
						:coordinates="layer.layer.source.data.properties.centerCoordinates"
						:key="layer.id + index"
						:ref="'routeLayer' + index"
						:showed="true"
						:closeButton="false"
						:closeOnClick="false"
						anchor="bottom"
						style="padding:0;"
					>
						<div
							class="cursor-pointer"
							@click="showBottomDialogFromRoute(layer.layer.source.data.properties.startStop, layer.layer.source.data.properties.endStop, layer.layer.source.data.properties.title, layer.layer.source.data.properties.subtitle)"
						>
							<p style="margin:0;">{{layer.layer.source.data.properties.title}}</p>
							<p style="font-size:11px; margin:0;">{{layer.layer.source.data.properties.subtitle}}</p>
						</div>
					</MglPopup>
				</template>

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

				<MglPopup
					ref="popup"
					:coordinates="[0, 0]"
					:showed="true"
					anchor="bottom"
				>
					<div>Hello</div>
				</MglPopup>

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
		</keep-alive>
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
	import riverRoute from "components/Map/riverRoute.ts";

	import Mapbox from "mapbox-gl";
	import MapLayerPlugin from "../components/Map/MapLayerPlugin.vue";
	import ZoomToRoute from "../components/Map/ZoomToRoute.vue";
	import { auth } from "../firebaseInit.js";

	import { MglMarker, MglNavigationControl, MglPopup } from "vue-mapbox";
	import Trip from "src/classes/trip";
	import BottomDialog from "src/components/Map/BottomDialog.vue";
	import CloseButton from "../components/Buttons/CloseButton.vue";
	import { uuid } from "vue-uuid";
	import sharedMethods from "app/sharedMethods";
	import shp from "shpjs";
	import { LocalStorage } from "quasar";

	let map;
	let rawEuropeanRivers;
	let rawRivers;
	let rawBuildings;

	export default {
		meta: {
			link: {
				material: {
					rel: "stylesheet",
					href: "https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css",
				},
			},
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
			ZoomToRoute,
			MglPopup,
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
			},
		},
		data() {
			return {
				mapStyle: "mapbox://styles/mareiski/ck27d9xpx5a9s1co7c2golomn",
				mapbox: null,
				mapLoading: true,
				mapLoadingText: "Karte wird geladen",
				centerLocation: [],
				trip: new Trip(),
				dialogObject: {},
				lastClickCoordinates: { lat: 0, lng: 0, label: "abc" },
				bottomDialogShowed: false,
				dialogVisible: false,
				showAddStopMarker: false,
				bounds: [],
				TripId: null,
				markerClicked: false,
				routeIds: [],
				hoveredStateId: null,
				tempTotalDistance: 0,
				whitelistedLabels: [
					"airport-label",
					"place-label",
					"state-label",
					"poi-label",
					"settlement-label",
					"natural-point-label",
					"settlement-minor-label",
					"settlement-major-label",
				], // 'country-label',
				suggestedSearches: [
					{ title: "Vorgeschlagene Orte:" },
					{ title: "Berlin", caption: "Deutschland" },
					{ title: "Venedig", caption: "Italien" },
					{ title: "Barcelona", caption: "Spanien" },
					{ title: "Stockholm", caption: "Schweden" },
				],
				cachedRouteLayers: [],
			};
		},
		watch: {
			stopList: function (newStopList, oldStopList) {
				// hide all existing routes
				this.routeIds.forEach((idObject) => {
					map.setLayoutProperty(idObject.routeId, "visibility", "none");
				});

				// recalculate all routes
				this.addAllRoutes();

				// hide dialog always if a stop was added or removed
				this.hideBottomDialog();
				this.showAddStopMarker = false;
			},
		},
		methods: {
			async onMapLoaded(event) {
				map = event.map;

				// try to get routes again
				this.loadRiverLayers().then(() => {
					this.addAllRoutes().then(() => {
						this.fitToBounds();
					});
				});
			},
			loadRiverLayers() {
				this.mapLoadingText = "Flüsse werden geladen";

				let promiseList = [];
				promiseList.push(
					shp("../buildings_bavaria.zip").then((geojson) => {
						this.mapLoadingText = "Routen werden berechnet";
						rawBuildings = geojson;
					})
				);

				promiseList.push(
					shp("../rivers.zip").then((geojson) => {
						this.mapLoadingText = "Routen werden berechnet";
						rawRivers = geojson;
					})
				);

				promiseList.push(
					shp("../european_rivers.zip").then((geojson) => {
						this.mapLoadingText = "Routen werden berechnet";
						rawEuropeanRivers = geojson;
					})
				);

				return Promise.all(promiseList);
			},
			flyTo(event) {
				this.lastClickCoordinates = event;
				this.showAddStopMarker = true;

				setTimeout(
					function () {
						map.flyTo({
							center: [event.lng, event.lat],
							speed: 0.8,
							curve: 1,
							zoom: 14,
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
				this.trip.stopList.forEach((stop) => {
					if (
						stop.location.lat === location.lat &&
						stop.location.lng === location.lng
					) {
						count++;
					}
				});

				return count > 1;
			},
			async addAllRoutes(useCache) {
				if (!map) return;
				if (!useCache) this.cachedRouteLayers = [];

				let promiseList = [];

				if (this.trip && this.trip.stopList) {
					this.bounds = [];
					this.tempTotalDistance = 0;

					this.trip.stopList.forEach((stop, index) => {
						// add bounds
						this.bounds.push([stop.location.lng, stop.location.lat]);

						// add route from last to this stop
						if (index > 0) {
							promiseList.push(
								this.addRoute(
									this.trip.stopList[index - 1],
									stop,
									index,
									useCache
								)
							);
						}
					});

					Promise.all(promiseList).then(() => {
						this.mapLoading = false;
						this.trip.totalDistance = JSON.parse(
							JSON.stringify(this.tempTotalDistance)
						);

						let context = this;
						setTimeout(function () {
							context.cachedRouteLayers.forEach((layer, index) => {
								context.$refs["routeLayer" + index][0].popup.addTo(map);
							});
						}, 500);

						this.$store.dispatch("tripList/updateTrip", this.trip);

						return;
					});
				}
			},
			fitToBounds() {
				try {
					if (this.bounds.length > 1) {
						var line = turf.lineString(this.bounds);
						var bbox = turf.bbox(line);
						map.fitBounds(new Mapbox.LngLatBounds(bbox), { padding: 80 });
					} else if (this.bounds.length === 1) {
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
				var displayFeatures = features.map(function (feat) {
					var displayFeat = {};
					displayProperties.forEach(function (prop) {
						displayFeat[prop] = feat[prop];
					});
					return displayFeat;
				});

				displayFeatures.forEach((feature) => {
					if (this.whitelistedLabels.includes(feature.layer.id)) {
						// set marker to new position
						this.lastClickCoordinates.lng = feature.geometry.coordinates[0];
						this.lastClickCoordinates.lat = feature.geometry.coordinates[1];
						this.lastClickCoordinates.label =
							feature.properties.name_de || feature.properties.name;

						this.showAddStopMarker = true;

						if (this.trip.stopList[0]) {
							map.flyTo({
								center: [
									this.lastClickCoordinates.lng,
									this.lastClickCoordinates.lat,
								],
								speed: 0.5,
								curve: 1,
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
						TripId: this.TripId,
					})
					.then((fetchedTrip) => {
						this.trip = fetchedTrip;
						this.addAllRoutes();
						if (done) done();
					});
			},
			async addRoute(startStop, endStop, index, useCache) {
				if (!map) return false;

				// add layers from cached layers
				let cachedRouteIndex = this.cachedRouteLayers.findIndex(
					(x) => x.id === startStop.stopId
				);

				if (useCache && cachedRouteIndex >= 0) {
					let layer = this.cachedRouteLayers[cachedRouteIndex].layer;

					if (map.getSource(layer.id)) {
						map
							.getSource(layer.id)
							.setData(layer.source.data.geometry.coordinates);
					} else {
						map.addLayer(layer);
						map
							.getSource(layer.id)
							.setData(layer.source.data.geometry.coordinates);
					}

					return;
				}

				let profile = startStop.profile || this.trip.transportProfile;
				// get random color for route
				let color = this.getRandomColor(index, this.trip.stopList.length);

				// generate id
				let id = uuid.v4() + startStop.stopId;

				this.routeIds.push({ stopId: startStop.stopId, routeId: id });

				let storageId = startStop.stopId + endStop.stopId + profile;

				// try to get cached route from local storage
				let cachedRoute;
				try {
					cachedRoute = LocalStorage.getItem("Route" + storageId);
				} catch (e) {
					console.log(e);
				}

				let promise;
				// load route from local storage -> only if already set and its a full load of the page
				if (cachedRoute && cachedRouteIndex === -1) {
					this.tempTotalDistance += cachedRoute.rawDistance;
					promise = new Promise((resolve, reject) => {
						resolve(cachedRoute);
					});
				} else {
					promise = this.getRoute(profile, startStop.location, endStop.location);
				}

				promise.then((data) => {
					var geojson = {
						id: id,
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: data.route,
						},
					};

					try {
						LocalStorage.set("Route" + storageId, data);
					} catch (e) {
						console.log(e);
					}

					// if the route already exists on the map, reset it using setData
					if (map.getSource(id)) {
						map.getSource(id).setData(geojson);
						map.setPaintProperty(id, "line-color", color);
						map.setLayoutProperty(id, "visibility", "visible");

						let index = this.cachedRouteLayers.findIndex(
							(x) => x.id === startStop.stopId
						);

						if (index >= 0) {
							this.cachedRouteLayers[index].layer = map.getLayer(id);
						}
					} else {
						// calculate mid point of route for route marker
						let distance = turf.distance(
							[startStop.location.lat, startStop.location.lng],
							[endStop.location.lat, endStop.location.lng]
						);

						let along = turf.along(turf.lineString(data.route), distance / 2);

						// otherwise, make a new route
						let routeLayer = {
							id: id,
							type: "line",
							source: {
								type: "geojson",
								data: {
									type: "Feature",
									properties: {
										centerCoordinates: along.geometry.coordinates,
										title: data.duration,
										subtitle: data.distance,
										startStop: startStop,
										endStop: endStop,
									},
									geometry: {
										type: "LineString",
										coordinates: geojson,
									},
								},
							},
							layout: {
								"line-join": "round",
								"line-cap": "round",
								visibility: "visible",
							},
							paint: {
								"line-color": color,
								"line-width": 5,
								"line-opacity": [
									"case",
									["boolean", ["feature-state", "hover"], false],
									0.75,
									0.4,
								],
							},
						};

						map.addLayer(routeLayer);
						this.cachedRouteLayers.push({
							id: startStop.stopId,
							layer: routeLayer,
						});

						// on click listener for route
						let context = this;
						map.on("click", id, function (e) {
							context.showBottomDialogFromRoute(
								startStop,
								endStop,
								data.duration,
								data.distance
							);
						});

						// When the user moves their mouse over the route, we'll update the
						// feature state for the feature under the mouse.
						map.on("mousemove", id, function (e) {
							if (e.features.length > 0) {
								if (
									this.hoveredStateId &&
									typeof this.hoveredStateId !== "undefined"
								) {
									map.setFeatureState(
										{ source: id, id: this.hoveredStateId },
										{ hover: false }
									);
								}
								if (
									e.features[0].layer.id &&
									typeof e.features[0].layer.id !== "undefined"
								) {
									this.hoveredStateId = e.features[0].layer.id;
									map.setFeatureState(
										{ source: id, id: this.hoveredStateId },
										{ hover: true }
									);
								}
							}
						});

						// When the mouse leaves the route, update the feature state of the
						// previously hovered feature.
						map.on("mouseleave", id, function () {
							if (
								this.hoveredStateId &&
								typeof this.hoveredStateId !== "undefined"
							) {
								map.setFeatureState(
									{ source: id, id: this.hoveredStateId },
									{ hover: false }
								);
							}
							this.hoveredStateId = null;
						});
						map.getSource(id).setData(geojson);
					}

					return;
				});
			},
			getRoute(profile, startLocation, endLocation) {
				return new Promise((resolve, reject) => {
					if (profile === "SUP") {
						let route = riverRoute.getRiverRoute(
							startLocation,
							endLocation,
							[rawRivers, rawEuropeanRivers],
							[]
						);

						var routeLineString = {
							id: "SUPRoute",
							type: "Feature",
							properties: {},
							geometry: {
								type: "LineString",
								coordinates: route,
							},
						};

						console.log(riverRoute.getLocks(routeLineString, rawBuildings));

						// get distance
						let rawRouteDistance = Math.round(
							turf.lineDistance(routeLineString, "kilometers")
						);

						let routeDistance =
							rawRouteDistance > 0 ? rawRouteDistance + " km" : null;

						let rawDurationHours = rawRouteDistance / 5;

						this.tempTotalDistance += rawRouteDistance;

						resolve({
							route: route,
							rawDuration: rawDurationHours,
							duration: Math.round(rawDurationHours) + "h",
							rawDistance: rawRouteDistance,
							distance: routeDistance,
							from: startLocation.label,
							to: endLocation.label,
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
						sharedMethods.requestURL(url).then((response) => {
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

							this.tempTotalDistance += rawDistance;

							resolve({
								route: route,
								rawDuration: rawDuration,
								duration: duration,
								rawDistance: rawDistance,
								distance: distance,
								from: startLocation.label,
								to: endLocation.label,
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
					locationIcon: subtitle === stop.location.label,
					adults: this.trip.adults,
					rooms: this.trip.rooms,
					childrenAges: this.trip.childrenAges,
				};

				let context = this;
				// wait to ensure a dialog hide is excecuted before this
				setTimeout(function () {
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

				if (lastStop && lastStop.profile !== "SUP") {
					this.getRoute(
						lastStop.profile || this.trip.transportProfile,
						lastStop.location,
						this.lastClickCoordinates
					).then((data) => {
						this.showBottomDialog(
							{
								title: this.lastClickCoordinates.label,
								location: this.lastClickCoordinates,
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
							location: this.lastClickCoordinates,
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
						location: startStop.location,
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
						this.suggestedSearches.forEach((search) => {
							const li = document.createElement("li");
							const a = document.createElement("a");
							const wrapperDiv = document.createElement("div");
							const context = this;

							if (this.suggestedSearches.indexOf(search) !== 0) {
								a.addEventListener("click", function () {
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
			},
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
		},
	};
</script>

<style lang="scss">
	@import url("../css/map.scss");
</style>
