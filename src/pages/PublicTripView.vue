<template>
	<div class="q-px-md">
		<Map
			@showHeadline="scrollToRef"
			:asComponent="true"
			ref="map"
		></Map>
		<br>
		<div @click="$refs.map.hideBottomDialog()">
			<div
				v-for="(stop, index) in trip.stopList.slice().reverse()"
				:key="stop.getStopId()"
			>
				<h4 :ref="stop.getStopId()">{{!trip.showRoutes ? 'Platz ' + (trip.stopList.length -index) : ''}}: {{stop.title}}</h4>
				<p v-html="stop.notes"></p>
				<br>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	* {
		color: $secondary;
	}
</style>

<script>
	import Trip from "src/classes/trip";
	import Map from "./Map.vue";
	import sharedMethods from "../../sharedMethods";
	import { Loading } from "quasar";

	export default {
		data() {
			return {
				trip: new Trip(),
			};
		},
		components: {
			Map,
		},
		methods: {
			getTrip() {
				const TripId = this.$route.params.tripId;
				console.log(TripId);

				this.$store
					.dispatch("tripList/fetchSingleTrip", {
						isUserTrip: false,
						TripId: TripId,
					})
					.then((fetchedTrip) => {
						if (!fetchedTrip) {
							//	this.$router.push("/Home");
						} else {
							this.trip = fetchedTrip;
						}
					});
			},
			scrollToRef(event) {
				this.sharedMethods.scrollToRef(this.$refs[event][0]);
				this.$refs.map.hideBottomDialog();
			},
		},
		computed: {
			sharedMethods() {
				return sharedMethods;
			},
		},
		created() {
			this.getTrip();
		},
		mounted() {
			Loading.hide();
		},
	};
</script>

<style>
</style>