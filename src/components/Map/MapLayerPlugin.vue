<template>
	<div class="mapbox-ctrl mapbox-ctrl-group">
		<q-btn
			color="white"
			text-color="secondary"
			icon="layers"
			round
			style="position:absolute; right:9px; top:210px;"
		>
			<q-tooltip>Kartendesign</q-tooltip>
			<q-menu>
				<q-list
					style="min-width: 100px"
					class="text-secondary"
				>
					<q-item
						:active="styleName === null"
						clickable
						@click="switchMapStyle(null)"
						v-close-popup
					>
						<q-item-section>Standard</q-item-section>
					</q-item>
					<q-separator />

					<q-item
						:active="styleName === 'nav'"
						clickable
						@click="switchMapStyle('nav')"
						v-close-popup
					>
						<q-item-section>Navigation</q-item-section>
					</q-item>
					<q-separator />
					<q-item
						:active="styleName === 'sat'"
						clickable
						@click="switchMapStyle('sat')"
						v-close-popup
					>
						<q-item-section>Satellit</q-item-section>
					</q-item>
					<q-separator />

					<q-item
						:active="styleName === 'out'"
						clickable
						@click="switchMapStyle('out')"
						v-close-popup
					>
						<q-item-section>Outdoor</q-item-section>
					</q-item>

					<q-separator />

					<q-item
						clickable
						@click="switchMapStyle('rivers')"
						v-close-popup
					>
						<q-item-section>Flüsse</q-item-section>
					</q-item>
				</q-list>
			</q-menu>
		</q-btn>
	</div>
</template>

<script>
	import sharedMethods from "../../../sharedMethods.js";

	export default {
		name: "MapLayerPlugin",
		data() {
			return {
				styleName: null,
			};
		},
		methods: {
			switchMapStyle(styleName) {
				let parent = sharedMethods.getParent("map", this);

				if (styleName !== "rivers") {
					this.styleName = styleName;
				}

				switch (styleName) {
					case "nav":
						parent.mapStyle =
							"mapbox://styles/mareiski/ckcevjmf81b7t1imouvv52xrh";
						break;
					case "out":
						parent.mapStyle =
							"mapbox://styles/mareiski/ckcew03vc12dy1imgq1eonlvt";
						break;
					case "sat":
						parent.mapStyle =
							"mapbox://styles/mareiski/ckcevopcq123g1imgb36xu37s";
						break;
					default:
						parent.mapStyle =
							"mapbox://styles/mareiski/ck27d9xpx5a9s1co7c2golomn";
						break;
				}

				if (styleName !== "rivers") {
					// wait to ensure style fully loaded
					let context = this;
					setTimeout(function () {
						context.$emit("styleChanged");
					}, 500);
				}
			},
		},
	};
</script>
