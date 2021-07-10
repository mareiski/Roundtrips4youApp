<template>
	<q-page
		padding
		class="flex justify-start flex-direction-col q-px-lg"
	>
		<back-button
			:top="0"
			@click="$router.go(-1)"
		></back-button>
		<q-input
			style="margin-top:30px;"
			v-model="trip.title"
			label="Titel"
		></q-input>
		<q-input
			v-model="trip.description"
			autogrow
			label="Beschreibung"
		></q-input>
		<q-toggle
			v-model="trip.published"
			label="Öffentlich"
		></q-toggle>
		<q-input
			type="number"
			v-model.number="trip.price"
			label="Preis"
		></q-input>
		<q-input
			v-for="num in 3"
			:key="num"
			v-model="trip.highlights[num]"
			:label="'Highlight ' + num++"
		></q-input>
		<q-input
			v-for="num in 3"
			:key="num"
			v-model="trip.tags[num]"
			:label="'Tag ' + num++"
		></q-input>
		<h5 style="padding-top:30px;">Danger Zone</h5>
		<q-list
			bordered
			class="rounded-borders"
			style="padding:10px; border-color:red;"
		>
			<p class="text-secondary">
				Dieses Reise und alle enthaltenen Inhalte löschen
			</p>
			<q-btn
				outline
				:loading="deleting"
				label="Löschen"
				class="q-mt-md"
				color="secondary"
				@click="deleteDialog = true"
			>
				<template v-slot:loading>
					<q-spinner />
				</template>
			</q-btn>
			<q-dialog
				persistent
				v-model="deleteDialog"
			>
				<q-card>
					<q-card-section class="row items-center">
						<span class="q-ml-sm">Willst du diese Reise wirklich löschen ? Dies kann nicht mehr rückgängig gemacht werden.</span>
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
							label="Reise Löschen"
							@click="deleteTrip()"
							color="primary"
							v-close-popup
						/>
					</q-card-actions>
				</q-card>
			</q-dialog>
		</q-list>
	</q-page>
</template>

<script>
	import BackButton from "src/components/Buttons/BackButton.vue";
	import Trip from "src/classes/trip";
	export default {
		name: "settings",
		components: {
			BackButton,
		},
		data() {
			return {
				trip: new Trip(),
				deleteDialog: false,
				deleting: false,
			};
		},
		created() {
			this.fetchTrip();
		},
		beforeRouteLeave(to, from, next) {
			// save trip before user leaves
			this.$store.dispatch("tripList/updateTrip", this.trip);
			next();
		},
		methods: {
			focusGeocoder() {
				this.$router.push("/Karte/" + this.trip.TripId);
				// wait to ensure we are on the map todo
				let context = this;
				setTimeout(function () {
					context.$emit("clickActionButton");
				}, 500);
			},
			fetchTrip(done) {
				const TripId = this.$route.params.tripId;

				this.$store
					.dispatch("tripList/fetchSingleTrip", {
						isUserTrip: true,
						TripId: TripId,
						forceRefresh: !!done,
					})
					.then((fetchedTrip) => {
						this.trip = fetchedTrip;
						console.log("fetched");
						if (done) done();
					});
			},
			deleteTrip() {
				const TripId = this.$route.params.tripId;

				this.$store.dispatch("tripList/deleteTrip", TripId).then(() => {
					this.$router.push("/");
				});
			},
		},
	};
</script>