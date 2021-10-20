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
	import { Plugins } from "@capacitor/core";
	import sharedMethods from "app/sharedMethods";
	const { Geolocation } = Plugins;

	export default {
		data() {
			return {
				geoId: null,
				active: false,
				gotGeolocationPermission: false,
			};
		},
		methods: {
			getCurrentPosition() {
				if (process.env !== "spa") {
					Geolocation.requestPermissions()
						.then(() => {
							this.gotGeolocationPermission = true;
						})
						.catch((e) => {
							console.log(e);
							sharedMethods.showErrorNotification(
								"Bitte überprüfe deine Standortberechtigung"
							);
						});
				} else {
					this.gotGeolocationPermission = true;
				}

				if (this.gotGeolocationPermission === true) {
					Geolocation.getCurrentPosition()
						.then((newPosition) => {
							this.active = true;
							this.$emit("positionDetected", newPosition);
						})
						.catch((e) => {
							console.log(e);
							sharedMethods.showErrorNotification(
								"Bitte aktiviere deinen Standort"
							);
						});

					// we start listening
					this.geoId = Geolocation.watchPosition({}, (newPosition) => {
						this.$emit("positionChanged", newPosition);
					});
				}
			},
		},
		beforeUnmount() {
			// we do cleanup
			Geolocation.clearWatch(this.geoId);
			this.active = false;
		},
	};
</script>