<template>
	<div>
		<q-btn
			v-if="false"
			@click="getCurrentPosition"
			label="track position"
		></q-btn>
	</div>
</template>

<script>
	import { Geolocation } from "@capacitor/geolocation";

	export default {
		data() {
			return {
				geoId: null,
			};
		},
		methods: {
			getCurrentPosition() {
				Geolocation.getCurrentPosition().then((newPosition) => {
					this.$emit("positionChanged", newPosition);
				});

				// we start listening
				this.geoId = Geolocation.watchPosition({}, (newPosition) => {
					this.$emit("positionChanged", newPosition);
				});
			},
		},
		beforeUnmount() {
			// we do cleanup
			Geolocation.clearWatch(this.geoId);
		},
	};
</script>