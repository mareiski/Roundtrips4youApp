<template>
	<div class="public-user-profile">
		<span v-if="userEntry.createdAt">Mitglied seit {{sharedMethods.getStringDateFromTimestamp(userEntry.createdAt)}}</span>
		<br>
		<span v-if="userEntry.companyWebsite">Unternehmenswebsite:
			<a @click="openInNewTab(userEntry.companyWebsite)">{{userEntry.companyWebsite}}</a>
		</span>
		<br>
		<span
			v-if="userEntry.companyDescription"
			style="max-width:460px;"
		>
			{{userEntry.companyDescription}}
		</span>
		<div
			style="margin-top:10px;"
			class="flex justify-between details-container"
		>
			<div>
				<h4>Reputation: {{userEntry.reputation || 0}}</h4>
				<ul>
					<li>100 für "Nutzer der 1. Stunde" Badge</li>
					<li>{{ publicUserTrips ? publicUserTrips.length * 25 : 0 }} für veröffentlichte Rundreisen</li>
					<!-- <li>für hilfreiche Kommentare</li> -->
					<!-- <li>für Bewertungen</li> -->
					<!-- <li>für folgende Nutzer</li> -->
					<li>{{ userEntry.RTEdited ? userEntry.RTEdited * 50 : 0}} für eigene Rundreisen die bearbeitet wurden</li>
				</ul>
			</div>
			<div>
				<h4>Inhalte</h4>
				<ul>
					<li v-if="publicUserTrips">{{ publicUserTrips.length }} öffentliche Rundreise{{ publicUserTrips.length === 1 ? '' : 'n' }} erstellt</li>
					<!-- <li>hilfreiche Kommentare erstellt</li> -->
					<!-- <li>Bewertungen erstellt</li> -->
					<!-- <li>Follower</li> -->
					<li>{{ userEntry.RTEdited || 0 }}x wurden Reisen bereits bearbeitet</li>
				</ul>
			</div>
			<!-- <div>
				<h4></h4>
				<q-img
					width="100px"
					:src="user.photoURL"
				/>
			</div> -->
		</div>
		<div class="badge-container q-pt-md">
			<h4>Badges</h4>
			<b>Erste Schritte</b>
			<div class="q-pb-sm">
				<q-badge color="secondary">Nutzer der 1. Stunde</q-badge>
				<!-- <q-badge color="secondary">Newbie</q-badge> -->
			</div>
			<b>Reisen</b>
			<div>
				<template v-if="publicUserTrips">
					<q-badge
						v-if="publicUserTrips.length < 5"
						:disabled="publicUserTrips.length < 1"
						color="secondary"
					>Reiseanfänger <q-tooltip>(min. 1 Reise veröffentlicht)</q-tooltip>
					</q-badge>
					<q-badge
						v-if="publicUserTrips.length <= 10"
						:disabled="publicUserTrips.length < 5"
						color="secondary"
					>Reiselustiger <q-tooltip>(min. 5 Reisen veröffentlicht)</q-tooltip>
					</q-badge>
					<q-badge
						:disabled="publicUserTrips.length <= 10"
						color="secondary"
					>Reiseexperte <q-tooltip>(mehr als 10 Reisen veröffentlicht)</q-tooltip>
					</q-badge>
				</template>
				<q-badge
					:disabled="!userRTEdited || userRTEdited <= 5"
					color="secondary"
				>Reisevermittler <q-tooltip>(mehr als 5 eigene Rundreisen, die bearbeitet wurden)</q-tooltip>
				</q-badge>
				<!-- <q-badge color="secondary">DaFehltNochWas (mehr als 5 Reisen bearbeitet)</q-badge> -->
			</div>
			<!-- <b>Community</b>
      <div>
        <q-badge color="secondary">Ratgeber (mehr als 10 Kommentare verfasst)</q-badge>
        <q-badge color="secondary">Reisetester (mehr als 10 Bewertungen abgegeben)</q-badge>
        <q-badge color="secondary">Berühmtheit (mehr als 20 Follower)</q-badge>
      </div> -->
		</div>
		<div
			class="trip-container"
			v-if="publicUserTrips"
		>
			<h4 class="q-pt-lg">Veröffentlichte Reisen</h4>
			<q-list :bordered="publicUserTrips.length> 0">
				<div>
					<div v-if="publicUserTrips.length === 0">
						<span style="font-size:18px;">Leider wurden noch keine Rundreisen veröffentlicht.</span>
					</div>
					<q-item
						clickable
						@click="$router.push('/Karte/' + trip.RTId)"
						v-ripple
						v-for="(trip) in publicUserTrips"
						:key="trip.TripId"
					>
						<q-item-section
							avatar
							top
						>
							<q-avatar
								color="primary"
								text-color="white"
								style="padding:0;"
							>
								<img
									v-if="trip.titleImageUrl && trip.titleImageUrl !== '../assets/aircraft.svg'"
									:src="trip.titleImageUrl"
								>
								<img
									v-else
									src="../assets/aircraft.svg"
								/>
							</q-avatar>
						</q-item-section>

						<q-item-section>
							<q-item-label lines="1">{{trip.title}}</q-item-label>
							<q-item-label
								caption
								style="width:100px;"
							>
								{{ trip.getCreatedAtString("DD.MM.YYYY") }}
								<q-tooltip>
									Diese Rundreise wurde am {{ trip.getCreatedAtString("DD.MM.YYYY") }} erstellt
								</q-tooltip>
							</q-item-label>
						</q-item-section>

						<q-item-section side>
							<q-icon
								name="keyboard_arrow_right"
								color="primary"
							/>
						</q-item-section>
					</q-item>
				</div>
			</q-list>
		</div>
	</div>
</template>

<style lang="scss">
	.q-badge {
		margin-right: 8px;
	}
</style>

<script>
	import sharedMethods from "app/sharedMethods";
	export default {
		computed: {
			user() {
				return this.$store.getters["user/user"];
			},
			userEntry() {
				return this.$store.getters["user/userEntry"];
			},
			userRTEdited() {
				return 0;
			},
			sharedMethods() {
				return sharedMethods;
			},
			publicUserTrips() {
				return this.$store.getters["tripList/getPublicUserTripList"];
			},
		},
		data() {
			return {};
		},
		created() {
			let userEntry = this.userEntry;
			// reputation calc
			let reputation = 100;
			if (this.publicUserTrips) {
				reputation += this.publicUserTrips.length * 25;
			}
			if (this.userRTEdited) {
				reputation += this.userRTEdited * 50;
			}

			userEntry.reputation = reputation;
			this.$store.dispatch("user/updateUserEntry", userEntry);
		},
	};
</script>