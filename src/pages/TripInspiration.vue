<template>
	<q-page>
		<geocoder
			id="geocoder4"
			class="q-px-lg"
			@inputCountry="e => (country = e)"
		></geocoder>
		<h5 class="q-pl-lg">Tipps <q-icon
				@click="$emit('showTipWizard')"
				name="add"
			></q-icon>
		</h5>
		<q-dialog
			v-model="tipDialogShowed"
			style="max-width:auto;"
			maximized
		>
			<close-button
				color="white"
				@click="tipDialogShowed = !tipDialogShowed"
			></close-button>
			<q-card v-if="tips[selectedTipIndex]">

				<q-img
					cover
					height="200px"
					:src="tips[selectedTipIndex].imageUrl"
				/>
				<q-card-section>
					<q-item-label class="text-primary">{{tips[selectedTipIndex].title}}</q-item-label>
					<q-item-label
						caption
						class="ellipsis"
					>
						<q-icon name="location_on" />
						{{tips[selectedTipIndex].location.label}}
					</q-item-label>
				</q-card-section>
				<q-card-section
					class="text-grey ellipsis-3-lines	"
					style="padding-top:0; height:65px;"
					v-html="tips[selectedTipIndex].content"
				>
				</q-card-section>
			</q-card>
		</q-dialog>
		<q-scroll-area
			v-if="tips && tips.length > 0"
			horizontal
			style="height: 280px; width: 100vw; padding-left:10px;"
			class="bg-grey-1 rounded-borders"
		>
			<div class="flex flex-nowrap full-height">
				<q-card
					v-for="(tip, index) in tips"
					:key="tip.TipId"
					style="width:200px; margin:5px;"
				>
					<q-btn
						v-if="tip.creator === user.uid"
						icon="delete"
						flat
						style="position:absolute; right:0; z-index:1"
						round
						color="white"
						@click="deleteDialogShowed = true; tipToDelete = tip"
					>
					</q-btn>
					<div
						@click="selectedTipIndex = index; tipDialogShowed = true"
						class="cursor-pointer"
					>
						<q-img :src="tip.imageUrl" />
						<q-card-section>
							<q-item-label class="text-primary">{{tip.title}}</q-item-label>
							<q-item-label
								caption
								class="ellipsis"
							>
								<q-icon name="location_on" />
								{{tip.location.label}}
							</q-item-label>
						</q-card-section>
						<q-card-section
							class="text-grey ellipsis-3-lines	"
							style="padding-top:0; height:65px;"
							v-html="tip.content"
						>
						</q-card-section>
					</div>
				</q-card>
			</div>
		</q-scroll-area>
		<div
			v-else
			class="q-pl-lg"
		>
			<p class="text-secondary">Es wurden leider noch keine Tipps in {{country}} veröffentlicht.</p>
		</div>
		<h5 class="q-pl-lg">Reisen <q-icon
				@click="$emit('showWizard')"
				name="add"
			></q-icon>
		</h5>
		<q-scroll-area
			horizontal
			style="height: 280px; width: 100vw; padding-left:10px;"
			class="bg-grey-1 rounded-borders"
			v-if="publicTrips"
		>
			<div class="flex flex-nowrap full-height">
				<q-card
					v-for="trip in publicTrips"
					:key="trip.TripId"
					style="width:200px; margin:5px;"
					@click="$router.push('/Karte/'+trip.TripId)"
				>
					<q-img :src="trip.titleImageUrl" />
					<q-card-section class="flex">
						<div class="text-primary">{{ trip.title }}</div>
					</q-card-section>
					<q-card-section
						class="text-grey ellipsis-3-lines	"
						style="padding-top:0; height:65px;"
					>
						{{trip.description}}
					</q-card-section>
				</q-card>
			</div>

		</q-scroll-area>
		<div
			v-else
			class="q-pl-lg"
		>
			<p class="text-secondary">Es wurden leider noch keine Reisen in {{country}} veröffentlicht.</p>
		</div>
		<h5 class="q-pl-lg">Personen</h5>
		<q-scroll-area
			v-if="false"
			horizontal
			style="height: 280px; width: 100vw; padding-left:10px;"
			class="bg-grey-1 rounded-borders q-pr-md"
		>
			<div class="flex flex-nowrap full-height">

				<!-- <q-card
					v-for="n in 10"
					:key="n"
					style="width:200px; margin:5px;"
				>
					<q-img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.hellogiggles.com%2Fuploads%2F2017%2F07%2F10085540%2FPuertoRicoSummer-e1500342104215.jpg&f=1&nofb=1" />
					<q-card-section class="flex">
						<div class="text-primary">Person {{ n }}</div>
					</q-card-section>
					<q-card-section
						class="text-grey ellipsis-3-lines	"
						style="padding-top:0; height:65px;"
					>
						Beschreibung zu dieser Nachricht die bis zu drei Zeilen lang sein
						kann. Wenn Sie länger ist, kann sie auch abgeschnitten werden.
					</q-card-section>
				</q-card> -->
			</div>
		</q-scroll-area>
		<q-dialog
			persistent
			v-model="deleteDialogShowed"
		>
			<q-card>
				<q-card-section class="row items-center">
					<span class="q-ml-sm color-secondary">Willst du diesen Tipp löschen? <br> Dies kann nicht mehr rückgängig gemacht werden.</span>
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
						label="Tipp Löschen"
						@click="deleteTip()"
						color="primary"
						v-close-popup
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<p class="text-secondary q-px-lg">coming soon</p>
	</q-page>
</template>

<script>
	import Geocoder from "src/components/Geocoder.vue";
	import CloseButton from "src/components/Buttons/CloseButton.vue";
	import { auth } from "src/firebaseInit";
	import sharedMethods from "app/sharedMethods";
	export default {
		components: {
			Geocoder,
			CloseButton,
		},
		data() {
			return {
				country: "Deutschland",
				publicTrips: [],
				disableAdding: false,
				selectedTipIndex: 0,
				tipDialogShowed: false,
				deleteDialogShowed: false,
				tipToDelete: null,
			};
		},
		computed: {
			user() {
				return auth.user();
			},
			tips() {
				return this.$store.getters["tipList/getTipList"];
			},
		},
		watch: {
			country: function (newCountry, oldCountry) {
				if (newCountry !== oldCountry) {
					this.fetchTrips();
					this.fetchTips();
				}
			},
		},
		methods: {
			fetchTrips() {
				this.$store
					.dispatch("tripList/fetchPublicTripsForCountry", this.country)
					.then((trips) => {
						this.publicTrips = trips;
					});
			},
			fetchTips() {
				this.$store.dispatch("tipList/fetchPublicTipsForCountry", this.country);
			},
			deleteTip() {
				if (this.tipToDelete) {
					this.$store.dispatch("tipList/deleteTip", this.tipToDelete.TipId);
				} else {
					sharedMethods.showErrorNotification(
						"Tipp konnte nicht gelöscht werden: null"
					);
				}
			},
		},
		created() {
			this.fetchTrips();
			this.fetchTips();
		},
	};
</script>

<style></style>
