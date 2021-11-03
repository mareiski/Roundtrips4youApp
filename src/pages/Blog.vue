<template>
	<q-layout view="lHh Lpr lFf">
		<trip-inspiration></trip-inspiration>
	</q-layout>
</template>

<script>
	import TripInspiration from "./TripInspiration.vue";
	import { Loading } from "quasar";
	export default {
		components: { TripInspiration },
		created() {
			Loading.hide();
		},
	};
</script>

<style>
</style>