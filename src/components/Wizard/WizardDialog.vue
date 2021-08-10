<template>
	<q-card
		style="height:100%; width:100%; padding-top:80px;"
		class="flex justify-between flex-direction-col flex-nowrap"
	>
		<q-tab-panels
			v-model="step"
			animated
			class="shadow-2 rounded-borders fit"
		>
			<q-tab-panel
				:name="1"
				class="flex justify-between flex-direction-col flex-nowrap"
			>
				<div>
					<q-card-section>
						<div class="flex justify-center">
							<q-icon
								size="xl"
								name="add_circle_outline"
								color="primary"
							/>
						</div>
						<h4 class="center-text">Reise erstellen</h4>
					</q-card-section>
					<q-card-section class="flex justify-center">
						<q-input
							label="Titel der Reise"
							v-model="title"
							@input="titleChanged()"
							lazy-rules
							class="width-80-percent"
							:rules="[
                val => (val !==null && val.length > 0) || 'Gib einen Titel an'
              ]"
						/>
					</q-card-section>
				</div>
				<q-card-actions
					class="flex justify-center"
					style="padding-bottom:30px;"
				>
					<q-btn
						:disable="title == null || title.length <= 0"
						color="primary"
						outline
						@click="step = 2"
					>Weiter</q-btn>
				</q-card-actions>
			</q-tab-panel>
			<q-tab-panel
				:name="2"
				class="flex justify-between flex-direction-col flex-nowrap"
			>
				<q-card-section>
					<arrival-departure
						@validate="e => arrivalDepartureValid = e"
						@input="e => arrivalDepartureValues = e"
						ref="arrivalDeparture"
					></arrival-departure>
				</q-card-section>
				<q-card-actions
					class="flex justify-center"
					style="padding-bottom:30px;"
				>
					<q-btn
						color="primary"
						:disable="!arrivalDepartureValid"
						outline
						@click="step = 3"
					>Weiter</q-btn>
				</q-card-actions>
			</q-tab-panel>
			<q-tab-panel
				:name="3"
				class="flex justify-between flex-direction-col flex-nowrap"
			>
				<q-card-section>
					<geocoder
						id="geocoder3"
						ref="suggestionGeocoder"
						@inputCountry="e => (country = e)"
					></geocoder>
					<public-trip-list
						@createTrip="createTripFromTemplate($event)"
						@createEmptyTrip="createEmptyTrip()"
						:country="country"
						:title="title"
						:showEmpty="true"
					></public-trip-list>
				</q-card-section>
			</q-tab-panel>
		</q-tab-panels>
	</q-card>
</template>
<script>
	import geocoder from "components/Geocoder.vue";
	import PublicTripList from "../PublicTripList.vue";
	import ArrivalDeparture from "./ArrivalDeparture.vue";
	import sharedMethods from "app/sharedMethods";
	import Stop from "src/classes/stop";
	import { uuid } from "vue-uuid";

	export default {
		props: ["stepNum", "titleProp"],
		model: {
			prop: "stepNum",
			event: "stepChange",
		},
		name: "WizardDialog",
		components: {
			geocoder,
			PublicTripList,
			ArrivalDeparture,
		},
		data() {
			return {
				title: this.titleProp,
				country: null,
				arrivalDepartureValid: false,
				arrivalDepartureValues: {},
			};
		},
		computed: {
			step: {
				get: function () {
					return this.stepNum;
				},
				set: function (newValue) {
					if (this.step !== newValue) {
						this.$emit("stepChange", newValue);
					}
				},
			},
		},
		watch: {
			step(newStep, oldStep) {
				if (newStep !== oldStep && newStep === 3) {
					let context = this;
					setTimeout(function () {
						context.$refs.suggestionGeocoder.query(
							context.arrivalDepartureValues.startCountry
						);
					}, 500);
				}
			},
		},
		methods: {
			titleChanged() {
				this.$emit("titleChange", this.title);
			},
			createEmptyTrip() {
				sharedMethods.showSuccessNotification("Reise wird erstellt");

				let payload = {
					title: this.title,
					startDate: this.arrivalDepartureValues.startDate,
				};

				let timeStamp = Date.now();

				console.log(this.arrivalDepartureValues);
				let startStop = new Stop(
					uuid.v4() + timeStamp,
					0,
					this.arrivalDepartureValues.startLocation
				);

				let endStop = new Stop(
					uuid.v4() + timeStamp,
					0,
					this.arrivalDepartureValues.endLocation,
					true
				);
				payload.stopList = [startStop, endStop];

				this.$store.dispatch("tripList/addTrip", payload).then((TripId) => {
					this.$emit("createdTrip");
					this.$router.push("/Karte/" + TripId);
				});
			},
			createTripFromTemplate(trip) {
				sharedMethods.showSuccessNotification("Reise wird erstellt");

				let payload = {
					title: this.title,
					TripId: trip.TripId,
					startDate: this.arrivalDepartureValues.startDate,
				};

				let timeStamp = Date.now();
				let startStop = new Stop(
					uuid.v4() + timeStamp,
					0,
					this.arrivalDepartureValues.startLocation
				);

				let endStop = new Stop(
					uuid.v4() + timeStamp,
					0,
					this.arrivalDepartureValues.endLocation,
					true
				);

				payload.startStop = startStop;
				payload.endStop = endStop;

				this.$store
					.dispatch("tripList/addTripFromTemplate", payload)
					.then((TripId) => {
						this.$emit("createdTrip");
						this.$router.push("/Karte/" + TripId);
					});
			},
		},
	};
</script>
<style></style>
