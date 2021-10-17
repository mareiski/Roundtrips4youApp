<template>
	<q-card
		class="flex justify-between"
		style="flex-direction:column;"
	>
		<div>
			<q-card-section>
				<h4>Ein Update steht bereit!</h4>
			</q-card-section>
			<q-card-section>
				Mache ein Update um die neusten Funktionen und Verbesserungen zu erhalten
			</q-card-section>
		</div>
		<q-card-actions
			class="flex update-dialog"
			align="right"
			style="padding-bottom:30px;"
		>
			<q-btn
				@click="$emit('hideDialog')"
				label="Später"
				flat
				style="min-width:auto"
				v-if="!timeExpired"
			></q-btn>
			<q-btn
				color="primary"
				label="Zum Playstore"
				outline
				@click="openInNewTab('https://play.google.com/store/apps/details?id=org.capacitor.roundtrips4you.app')"
				style="min-width:auto"
			></q-btn>
		</q-card-actions>
	</q-card>
</template>

<script>
	export default {
		data() {
			return {
				timeExpired: false,
			};
		},
		methods: {
			openInNewTab(link) {
				window.open(link, "_blank");
			},
		},
		created() {
			const versionObject = this.$store.getters["api/getAppVersion"];
			this.timeExpired = Date.now() > versionObject.Expires.valueOf();
		},
	};
</script>

<style>
</style>