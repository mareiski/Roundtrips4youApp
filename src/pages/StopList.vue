<template>
	<div
		style="padding-top:0;"
		class="q-pl-sm q-pr-sm"
	>
		<q-pull-to-refresh @refresh="fetchTrip">
			<div
				class="bg-white full-width flex justify-between text-secondary"
				style="height:35px; padding: 5px 10px; margin-bottom:30px"
			>
				<div>
					<close-button
						:top="0"
						size="md"
						@click="$router.push('/')"
					></close-button>
				</div>
				<b class="raleway text-primary">{{ trip.title }}</b>
				<q-icon
					style="z-index:1"
					@click="$router.push('/Einstellungen/' + trip.getTripId())"
					name="settings"
					size="sm"
				/>
			</div>
			<div class="flex justify-between">
				<div>
					<span
						class="text-secondary"
						v-show="trip.days"
					>{{trip.days}} Tage</span>
					<span
						class="text-secondary"
						v-show="trip.totalDistance"
					>, {{trip.totalDistance}} km</span>
				</div>
				<q-btn
					color="white"
					text-color="secondary"
					icon="map"
					label="Karte"
					@click="$router.push('/Karte/' + trip.getTripId())"
				>
				</q-btn>
			</div>
		</q-pull-to-refresh>
		<q-list
			bordered
			class="rounded-borders"
			v-show="trip.stopList && trip.stopList.length > 0"
		>
			<draggable
				v-model="trip.stopList"
				@end="onDragged()"
				handle=".handle"
			>
				<q-item
					v-for="(stop, index) in trip.stopList"
					:key="stop"
					v-ripple
					clickable
					style="padding-left:8px; padding-right:5px;"
				>
					<q-item-section avatar>
						<q-icon
							color="primary"
							name="drag_indicator"
							class="cursor-DandD handle"
						/>
					</q-item-section>
					<q-item-section @click="showEditStopDialog(stop)">
						<q-item-label
							lines="1"
							class="text-secondary"
						>{{
                stop.title
              }}</q-item-label>
						<q-item-label
							caption
							lines="1"
							style="max-width:400px;"
						>
							<q-icon name="history" />
							{{index === 0 ? formattedStartDate : stop.date}}
							<!-- {{ stop.location.label.split(",")[0] }} -->
						</q-item-label>
					</q-item-section>

					<q-item-section
						side
						top
						@click="showEditStopDialog(stop)"
					>
						<div
							class="flex justify-center"
							style="flex-direction:column; height:100%;"
						>
							<!-- {{stop.InitDate.split(' ')[0]}} -->
						</div>
					</q-item-section>

					<q-item-section
						side
						top
						style="padding:0;"
					>
						<div>
							<q-btn
								@click="showEditStopDialog(stop)"
								flat
								round
								size="md"
								icon="edit"
								:ripple="false"
							>
								<q-tooltip>Optionen</q-tooltip>
							</q-btn>
						</div>
					</q-item-section>

					<q-item-section
						side
						top
						style="padding:0;"
					>
						<div>
							<q-btn
								@click="deleteStop(stop.getStopId())"
								v-if="trip.stopList && trip.stopList.length > 1"
								flat
								round
								size="md"
								icon="delete"
							>
								<q-tooltip>Stopp löschen</q-tooltip>
							</q-btn>
						</div>
					</q-item-section>
				</q-item>
			</draggable>
			<q-separator inset="item" />
		</q-list>
		<div
			style="padding: 10px 10px 0 10px;"
			v-if="trip.stopList && trip.stopList.length <= 1"
		>
			<span
				v-if="trip.stopList && trip.stopList.length === 0"
				class="font-medium"
			>Klicke auf einen Ort auf der Karte um ihn hinzuzufügen.</span>
			<span
				v-else
				class="font-medium"
			>Füge einen weiteren Stopp hinzu, um die Orte hier neu
				anzuordnen.</span>
		</div>
		<q-dialog
			maximized
			v-model="editStopDialogVisible"
			@hide="updateStop()"
		>
			<div>
				<close-button
					:top="10"
					@click="editStopDialogVisible = !editStopDialogVisible"
				></close-button>
				<edit-stop-dialog
					v-if="selectedStop"
					v-model="selectedStop"
					:trip="trip"
				></edit-stop-dialog>
			</div>
		</q-dialog>
	</div>
</template>

<script>
	import Trip from "src/classes/trip";
	import draggable from "vuedraggable";
	import CloseButton from "src/components/Buttons/CloseButton.vue";
	import Stop from "src/classes/stop";
	import EditStopDialog from "src/components/Wizard/EditStopDialog.vue";
	import sharedMethods from "app/sharedMethods";

	export default {
		name: "list",
		components: {
			draggable,
			CloseButton,
			EditStopDialog,
		},
		data() {
			return {
				trip: new Trip(),
				editStopDialogVisible: false,
				selectedStop: new Stop(),
			};
		},
		computed: {
			formattedStartDate() {
				let date = sharedMethods.getStringDateFromTimestamp(this.trip.startDate);
				if (!date) {
					date = sharedMethods.getFormattedDate(this.trip.startDate);
				}
				return date.split(" ")[0];
			},
			// need this beause of watcher below
			stopList() {
				return this.trip ? this.trip.stopList : [];
			},
		},
		watch: {
			stopList: function (newStopList, oldStopList) {
				this.getStopDates();
			},
		},
		created() {
			this.fetchTrip();
		},
		methods: {
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
						this.getStopDates();

						console.log("fetched");
						if (done) done();
					});
			},
			getStopDates() {
				let startDate = sharedMethods.getDateFromTimeStamp(this.trip.startDate);
				this.trip.stopList[0].date = sharedMethods
					.getFormattedDate(startDate)
					.split(" ")[0];

				this.trip.stopList.forEach((stop, index) => {
					startDate.setDate(startDate.getDate() + stop.dayDuration);
					let nextStop = this.trip.stopList[index + 1];
					if (nextStop) {
						nextStop.date = sharedMethods
							.getFormattedDate(startDate)
							.split(" ")[0];
					}
				});
			},
			showEditStopDialog(stop) {
				this.selectedStop = stop;
				this.editStopDialogVisible = true;
			},
			updateStop() {
				this.$store.dispatch("tripList/updateStop", {
					stop: this.selectedStop,
					TripId: this.trip.TripId,
					isUserTrip: true,
				});
			},
			onDragged() {
				let payload = {
					newStopList: this.trip.toObject().stopList,
					TripId: this.trip.TripId,
				};
				this.$store.dispatch("tripList/setNewStopList", payload).then(() => {
					let context = this;
					setTimeout(function () {
						context.getStopDates();
					}, 100);
				});
			},
			focusGeocoder() {
				this.$router.push("/Karte/" + this.trip.TripId);
				// wait to ensure we are on the map todo
				let context = this;
				setTimeout(function () {
					context.$emit("clickActionButton");
				}, 500);
			},
			deleteStop(stopId) {
				this.$store.dispatch("tripList/deleteStop", {
					stopId: stopId,
					TripId: this.trip.TripId,
					isUserTrip: true,
				});
			},
		},
	};
</script>
