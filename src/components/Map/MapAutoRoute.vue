<template>
	<div class="mapbox-ctrl mapbox-ctrl-group">
		<q-btn
			color="white"
			text-color="secondary"
			icon="auto_fix_high"
			round
			@click="showDialog = !showDialog"
			style="position:absolute; right:9px; top:325px;"
		>
		</q-btn>
		<q-dialog v-model="showDialog">
			<q-card>
				<q-card-section class="row items-center">
					<span class="q-ml-sm">Die Route deiner Reise wird optimiert. Dadurch wird die aktuelle Reihenfolge deiner Stopps verändert.</span>
				</q-card-section>

				<q-card-actions align="right">
					<q-btn
						flat
						label="Abbrechen"
						color="primary"
						v-close-popup
					/>
					<q-btn
						outline
						label="Route optimieren"
						@click="$emit('clicked')"
						color="primary"
						v-close-popup
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
	</div>

</template>

<script>
	export default {
		name: "MapAutoRoutePlugin",
		data() {
			return {
				showDialog: false,
			};
		},
	};
</script>
