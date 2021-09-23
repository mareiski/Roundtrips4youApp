<template>
	<div>
		<div
			:id="id || 'geocoder'"
			class="geocoder"
		></div>
	</div>
</template>

<script>
	import PointLocation from "src/classes/pointLocation";
	let geocoder;
	export default {
		props: {
			id: String,
		},
		methods: {
			query(searchTerm) {
				geocoder.query(searchTerm);
			},
		},
		mounted() {
			geocoder = new MapboxGeocoder({
				accessToken: this.$store.getters["api/getMapboxKey"],
				types: "country,region,place,postcode,locality,neighborhood",
			});

			geocoder.addTo("#" + (this.id || "geocoder"));

			let context = this;
			// Add geocoder result to container.
			geocoder.on("result", function (e) {
				let country;
				if (e.result.place_name.includes(",")) {
					let locationParts = e.result.place_name.split(",");
					country = locationParts[locationParts.length - 1];
				} else {
					country = e.result.place_name;
				}

				context.$emit("inputCountry", country);

				let location = new PointLocation(
					e.result.center[1],
					e.result.center[0],
					e.result.place_name
				);
				context.$emit("inputLocation", location);
			});

			// Clear results container when search is cleared.
			geocoder.on("clear", function () {
				context.$emit("clear");
			});
		},
	};
</script>

<style lang="scss">
	.map,
	.geocoder {
		.mapboxgl-ctrl-geocoder {
			border: 1px solid rgba(0, 0, 0, 0.12);
			margin-right: 65px !important;
			width: 75%;
			box-shadow: none;
		}
	}

	.geocoder .mapboxgl-ctrl-geocoder {
		width: 100%;
	}

	.mapboxgl-popup-content {
		padding: 6px !important;
	}
</style>
