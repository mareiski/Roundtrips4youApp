<template>
	<div>
		<q-dialog
			seamless
			v-model="dialogShowed"
			position="bottom"
		>
			<q-carousel
				animated
				:autoplay="7000"
				arrows
				infinite
				v-model="slideNum"
				v-show="data.buttons && imageSrcs.length > 0"
				height="100px"
			>
				<q-carousel-slide
					v-for="(url, index) in imageSrcs"
					:name="index"
					:key="index"
					:img-src="url"
					@click="showImageDialog(url)"
				>
				</q-carousel-slide>
			</q-carousel>
			<q-card :class="max ? 'dialog-max-height' : 'dialog-min-height'">
				<q-card-section
					class="column flex-nowrap"
					style="height: 120px"
				>
					<div
						class="row flex justify-between no-wrap"
						@click="data.buttons ? (max = !max) : false"
					>
						<div>
							<div class="text-weight-bold text-secondary">
								{{ data.title }}
							</div>
							<div class="text-grey">
								<q-icon
									v-show="data.locationIcon"
									name="location_on"
								/>{{
                  data.subtitle
                }}
							</div>
						</div>
						<q-icon
							:class="(max ? 'rotate' : '') + ' text-secondary'"
							style="transition: 0.2s all;"
							name="expand_less"
							size="sm"
							v-show="data.buttons"
						/>
					</div>
					<div
						class="flex justify-end"
						style="margin-top:10px;"
					>
						<q-btn
							v-show="data.buttons"
							style="margin-right:5px"
							flat
							color="secondary"
							label="Optionen"
						>
							<q-menu>
								<q-list
									style="min-width: 100px"
									class="text-secondary"
								>
									<q-item
										clickable
										v-close-popup
										@click="addStop()"
										v-show="data.alreadyAdded"
									>
										<q-item-section>Erneut hinzufügen</q-item-section>
									</q-item>
									<q-item
										clickable
										v-close-popup
										@click="$router.push('/Liste/' + data.TripId)"
									>
										<q-item-section>Neu anordnen</q-item-section>
									</q-item>
									<q-item
										clickable
										v-close-popup
										@click="max = !max"
									>
										<q-item-section>Infos</q-item-section>
									</q-item>
									<q-item
										v-show="data.alreadyAdded"
										@click="deleteStop(data.stop.stopId)"
										clickable
										v-close-popup
									>
										<q-item-section>Löschen</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
						<!-- add or edit depending if already added -->
						<q-btn
							icon="add"
							outline
							color="primary"
							v-show="data.buttons"
							@click="
                data.alreadyAdded ? (showEditStopDialog = true) : addStop()
              "
							:label="data.alreadyAdded ? 'Bearbeiten' : 'Hinzufügen'"
						/>
					</div>
				</q-card-section>
				<q-card-section
					class="row items-center no-wrap"
					style="padding-top:30px; flex-direction:column;"
				>
					<div
						@click="textMax = !textMax"
						:class="'text-secondary ' + (textMax ? '' : 'ellipsis-8-lines')"
					>
						{{ mainDescription }}
					</div>
					<h6
						class="bold text-secondary"
						style="padding-top:20px; padding-bottom:10px;"
					>
						{{ suggestedPOIs.length }} Top Sehenswürdigkeiten
					</h6>
					<q-card
						class="city-card cursor-pointer full-width"
						style="margin-bottom:10px;"
						v-for="(poi, index) in suggestedPOIs"
						:key="index"
						:id="'POI' + poi.name"
						@click="
              $emit('poiClicked', {
                lat: poi.location.lat,
                lng: poi.location.lng,
                label: poi.name
              })
            "
					>
						<div>
							<div>
								<q-img
									:alt="'Bild von' + poi.name"
									v-if="poi.photoUrl"
									:src="poi.photoUrl"
									style="height:170px;"
									placeholder-src="statics/dummy-image-landscape-1-150x150.jpg"
								>
									<div class="absolute-bottom text-h6 ellipsis">
										{{ poi.name }}
										<q-tooltip>{{ poi.name }}</q-tooltip>
									</div>
								</q-img>
							</div>

							<div
								class="text-secondary text-raleway"
								style="padding-left:20px; padding-top:10px"
							>
								{{ poi.rating }}
								<q-rating
									class="stars"
									:value="poi.rating"
									size="15px"
									color="gold"
									readonly
									style="margin-right:10px;"
								/>
								({{ poi.totalRatings }})
							</div>
							<a
								:href="
                  'https://www.google.com/maps/search/?api=1&query=' + poi.name
                "
								target="_blank"
							>
								<q-card-section class="text-secondary">
									<q-icon name="location_on" />
									{{ poi.location.label }}
								</q-card-section>
							</a>
						</div>
					</q-card>
				</q-card-section>
			</q-card>
		</q-dialog>
		<q-dialog
			maximized
			v-model="showEditStopDialog"
			@hide="updateStop()"
		>
			<div>
				<close-button
					:top="10"
					@click="showEditStopDialog = !showEditStopDialog"
				></close-button>
				<edit-stop-dialog
					v-if="stop"
					v-model="stop"
					:trip="{adults: data.adults, rooms: data.rooms, childrenAges: data.childrenAges}"
				></edit-stop-dialog>
			</div>
		</q-dialog>
		<image-dialog
			v-model="imageDialogShowed"
			:dialogImgSrc="imageDialogSrc"
		></image-dialog>
	</div>
</template>

<script>
	import Stop from "src/classes/stop";
	import ImageDialog from "../ImageDialog.vue";
	import PointLocation from "src/classes/pointLocation";
	import { uuid } from "vue-uuid";
	import sharedMethods from "../../../sharedMethods.js";
	import EditStopDialog from "../Wizard/EditStopDialog.vue";
	import CloseButton from "../Buttons/CloseButton.vue";

	let timeStamp;

	export default {
		components: { ImageDialog, EditStopDialog, CloseButton },
		props: {
			data: Object,
			showed: Boolean,
		},
		data() {
			return {
				slideNum: 0,
				max: false,
				imageSrcs: [],
				imageDialogShowed: false,
				imageDialogSrc: "",
				mainDescription: "",
				textMax: false,
				suggestedPOIs: [],
				showEditStopDialog: false,
				stop: this.data.stop,
			};
		},
		watch: {
			showed: function (newState, oldState) {
				if (!!newState) {
					// refresh stop object for edit stop dialog
					this.stop = this.data.stop;
					this.max = false;
					let title = this.data.title;

					if (this.data.buttons) {
						sharedMethods.getWikivoyageData(title).then((results) => {
							this.imageSrcs = results.imgSrcs;
							this.imageSrcs[0] = results.mainImage;
							this.mainDescription = results.description;
						});
					}
				} else {
					// reset data
					this.imageSrcs = [];
					this.mainDescription = "";
				}
			},
			max: function (newState, oldState) {
				if (!!newState) {
					let location = PointLocation.fromObject(this.data.stop.location);

					let context = this;

					sharedMethods
						.getGooglePlacesData(location.lat, location.lng, context)
						.then((result) => {
							context.suggestedPOIs = result;
						});
				} else {
				}
			},
		},
		model: {
			prop: "showed",
			event: "showedChanged",
		},
		methods: {
			showImageDialog(src) {
				this.imageDialogSrc = src;
				this.imageDialogShowed = true;
			},
			addStop() {
				timeStamp = Date.now();

				// stop id ist time in millis
				let stop = new Stop(
					uuid.v4() + timeStamp,
					1,
					PointLocation.fromObject(this.data.stop.location)
				);
				this.$store.dispatch("tripList/addStop", {
					stop: stop,
					TripId: this.data.TripId,
					isUserTrip: true,
				});
			},
			updateStop() {
				this.$store.dispatch("tripList/updateStop", {
					stop: this.stop,
					TripId: this.data.TripId,
					isUserTrip: true,
				});
			},
			deleteStop(stopId) {
				this.$store.dispatch("tripList/deleteStop", {
					stopId: stopId,
					TripId: this.data.TripId,
					isUserTrip: true,
				});
				this.dialogShowed = false;
			},
		},
		computed: {
			dialogShowed: {
				get: function () {
					return this.showed;
				},
				set: function (newValue) {
					if (this.showed !== newValue) {
						this.$emit("showedChanged", newValue);
					}
				},
			},
		},
	};
</script>
<style lang="scss">
	.q-card {
		transition: all 0.5s !important;
	}

	.dialog-max-height {
		height: 50vh;
	}

	.dialog-min-height {
		height: 120px;
		overflow: hidden !important;
	}
</style>
