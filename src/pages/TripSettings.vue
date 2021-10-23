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
		<image-upload
			:titleImgUrl="trip.titleImageUrl"
			:galeryImages="false"
			:TripId="trip.getTripId()"
			:trip="true"
			@titleImageChanged="url => trip.titleImageUrl = url"
		></image-upload>
		<p class="text-secondary">Startdatum:</p>
		<q-input
			v-model="startDate"
			bottom-slots
			outlined
			@input="validInput()"
			:rules="[val => val && val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/) || 'Gib ein richtiges Datum ein']"
		>
			<template v-slot:append>
				<q-icon
					name="event"
					class="cursor-pointer text-primary"
				>
					<q-popup-proxy
						transition-show="scale"
						transition-hide="scale"
						@hide="validInput()"
					>
						<q-date
							v-model="startDate"
							today-btn
							mask="DD.MM.YYYY"
						>
							<div class="row items-center justify-end q-gutter-sm">
								<q-btn
									label="Cancel"
									color="primary"
									flat
									v-close-popup
								/>
								<q-btn
									label="OK"
									color="primary"
									flat
									v-close-popup
								/>
							</div>
						</q-date>
					</q-popup-proxy>
				</q-icon>
			</template>
		</q-input>

		<q-toggle
			v-model="trip.published"
			label="Öffentlich"
		></q-toggle>
		<q-input
			type="number"
			v-model.number="trip.price"
			label="Preis"
		></q-input>
		<!-- <q-input
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
		></q-input> -->
		<h5 style="padding-top:30px;">Danger Zone</h5>
		<q-list
			bordered
			class="rounded-borders"
			style="padding:10px; border-color:red;"
		>
			<p class="text-secondary">
				Diese Reise und alle enthaltenen Inhalte löschen
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

					<q-card-actions class="flex">
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
	import sharedMethods from "app/sharedMethods";
	import ImageUpload from "src/components/ImageUpload.vue";
	export default {
		name: "settings",
		components: {
			BackButton,
			ImageUpload,
		},
		data() {
			return {
				trip: new Trip(),
				deleteDialog: false,
				deleting: false,
				startDate: null,
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
			validInput() {
				if (
					this.startDate &&
					this.startDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
				) {
					this.trip.startDate = sharedMethods.getDateFromString(this.startDate);
				}
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
						if (!fetchedTrip) {
							this.$router.push("/Home");
						} else {
							if (
								this.$route.params.tripId.includes("temp") ||
								this.$store.getters["user/user"].uid === fetchedTrip.userId
							) {
								this.trip = fetchedTrip;

								if (typeof this.trip.startDate === "string") {
									this.startDate = JSON.parse(
										JSON.stringify(this.trip.startDate)
									);
								} else {
									this.startDate = sharedMethods
										.getStringDateFromTimestamp(this.trip.startDate)
										.split(" ")[0];
								}
								if (done) done();
							} else {
								this.$router.push("/Home");
							}
						}
					});
			},
			deleteTrip() {
				const TripId = this.$route.params.tripId;

				this.$store.dispatch("tripList/deleteTrip", TripId).then(() => {
					this.$router.push("/Home");
				});
			},
		},
	};
</script>