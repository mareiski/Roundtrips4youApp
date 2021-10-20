<template>
	<div>
		<div
			v-for="stop in trip.stopList"
			:key="stop.getStopId()"
		>
			<h3>stop.title</h3>
			<p>stop.description</p>
		</div>
	</div>
</template>

<script>
	import Trip from "src/classes/trip";
	export default {
		data() {
			return {
				trip: new Trip(),
			};
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
		},
		created() {
			this.getTrip();
		},
	};
</script>

<style>
</style>