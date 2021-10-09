<template>
	<div>
		<p class="text-secondary">Startdatum:</p>
		<q-input
			v-model="startDate"
			bottom-slots
			outlined
			@input="validInput()"
			:rules="[val => val && val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/) || 'Gib ein richtiges Datum ein']"
		>
			<template v-slot:append>
				<q-icon
					name="event"
					class="cursor-pointer text-primary"
				>
					<q-popup-proxy
						transition-show="scale"
						transition-hide="scale"
						@hide="validInput()"
					>
						<q-date
							v-model="startDate"
							today-btn
							mask="DD.MM.YYYY"
						>
							<div class="row items-center justify-end q-gutter-sm">
								<q-btn
									label="Cancel"
									color="primary"
									flat
									v-close-popup
								/>
								<q-btn
									label="OK"
									color="primary"
									flat
									v-close-popup
								/>
							</div>
						</q-date>
					</q-popup-proxy>
				</q-icon>
			</template>
		</q-input>

		<p class="text-secondary">Startort (Heimatadresse):</p>
		<geocoder
			:id="'geocoder' +Date.now()"
			@inputLocation="(startLocation = $event); validInput()"
			@clear="startLocation = {}; validInput()"
		></geocoder>

		<q-toggle
			v-model="roundtrip"
			@input="validInput()"
			label="Rundreise (Start ist Ziel)"
			class="text-secondary q-pt-md"
		></q-toggle>
		<div
			v-show="!roundtrip"
			class="q-pt-lg"
		>
			<p class="text-secondary">Ziel:</p>
			<geocoder
				:id="'geocoder2' + Date.now()"
				@inputLocation="(endLocation = $event); validInput()"
				@clear="endLocation = {}; validInput()"
			></geocoder>
		</div>
	</div>
</template>

<script>
	import PointLocation from "src/classes/pointLocation";
	import Geocoder from "../Geocoder.vue";
	import sharedMethods from "app/sharedMethods";
	const timeStamp = Date.now();

	export default {
		name: "ArrivalDeparture",
		components: {
			Geocoder,
		},
		data() {
			return {
				startDate: sharedMethods.getFormattedDate(timeStamp).split(" ")[0],
				startLocation: new PointLocation(),
				endLocation: new PointLocation(),
				roundtrip: false,
			};
		},
		methods: {
			validInput() {
				if (
					this.startDate &&
					this.startDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
				) {
					if (this.startLocation.lat) {
						if (this.endLocation.lat || this.roundtrip) {
							this.$emit("validate", true);

							let endLocation = this.endLocation;
							if (this.roundtrip) {
								endLocation = this.startLocation;
							}

							sharedMethods
								.getCountryForLatLng(
									this.startLocation.lat,
									this.startLocation.lng
								)
								.then((country) => {
									this.$emit("input", {
										startDate: this.startDate,
										startLocation: this.startLocation,
										endLocation: endLocation,
										startCountry: country.countryName,
									});
								});
							return true;
						}
					}
				}
				this.$emit("validate", false);
				return false;
			},
		},
	};
</script>

<style>
</style>