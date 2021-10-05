<template>
	<div>
		<q-btn
			color="white"
			:text-color="active ? 'blue' : 'secondary'"
			@click="getCurrentPosition"
			icon="my_location"
			round
			style="position:absolute; right:9px; top:175px;"
		></q-btn>
	</div>
</template>

<script>
	import { Geolocation } from "@capacitor/geolocation";

	export default {
		data() {
			return {
				geoId: null,
				active: false,
			};
		},
		methods: {
			getCurrentPosition() {
				console.log(Geolocation);
				Geolocation.requestPermissions().then(() => {
					Geolocation.getCurrentPosition().then((newPosition) => {
						this.active = true;
						this.$emit("positionDetected", newPosition);
					});

					// we start listening
					this.geoId = Geolocation.watchPosition({}, (newPosition) => {
						this.$emit("positionChanged", newPosition);
					});
				});
			},
		},
		beforeUnmount() {
			// we do cleanup
			Geolocation.clearWatch(this.geoId);
			this.active = false;
		},
	};
</script>