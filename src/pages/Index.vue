<template>
	<q-page class="flex justify-start flex-direction-col align-center">
		<div class="width-80-percent">
			<h4>Deine Reisen</h4>
		</div>
		<q-list
			bordered
			padding
			class="rounded-borders width-80-percent"
		>
			<q-intersection
				v-for="trip in trips"
				:key="trip.TripId"
				once
				transition="flip-right"
			>
				<q-item
					v-ripple
					clickable
					@click="$router.push('Karte/' + trip.TripId)"
				>
					<q-item-section
						avatar
						top
					>
						<q-avatar class="background-light-grey">
							<img
								v-if="trip.titleImageUrl && trip.titleImageUrl !== '../assets/aircraft.svg'"
								:src="trip.titleImageUrl"
							/>
							<img
								v-else
								src="../assets/aircraft.svg"
								style="width:30px"
							/>
						</q-avatar>
					</q-item-section>

					<q-item-section>
						<q-item-label
							lines="1"
							class="text-secondary bold"
						>{{
              trip.title
            }}</q-item-label>
						<q-item-label caption>
							{{ trip.getCreatedAtString("DD.MM.YYYY") }}
							<q-tooltip>
								erstellt am {{ trip.getCreatedAtString("DD.MM.YYYY") }}
							</q-tooltip>
						</q-item-label>
					</q-item-section>

					<q-item-section side>
						<q-item-label
							lines="1"
							:class="trip.published ? 'text-primary' : 'text-secondary'"
						>
							{{ trip.published ? "öffentlich" : "privat" }}</q-item-label>
					</q-item-section>

					<q-item-section side>
						<q-icon
							name="keyboard_arrow_right"
							color="secondary"
						/>
					</q-item-section>
				</q-item>
			</q-intersection>
			<q-item v-if="!trips || trips.length === 0">
				<p class="text-secondary">Du hast noch keine Reise erstellt</p>
			</q-item>
		</q-list>
		<q-btn
			color="primary"
			outline
			icon-right="add_circle_outlined"
			label="Reise hinzufügen"
			align="between"
			class="width-80-percent"
			style="height:40px;"
			@click="$emit('showWizard')"
		/>
		<template v-if="tips && tips.length > 0">
			<div class="width-80-percent">
				<h4>Deine Tipps</h4>
			</div>
			<q-list
				bordered
				padding
				class="rounded-borders width-80-percent"
			>
				<q-intersection
					v-for="tip in tips"
					:key="tip.TipId"
					once
					transition="flip-right"
				>
					<q-item
						v-ripple
						clickable
						@click="$emit('showTipWizard', tip)"
					>
						<!-- <q-item-section
							avatar
							top
						>
							<q-avatar class="background-light-grey">
								<img
									v-if="tip.titleImageUrl !== '../assets/aircraft.svg'"
									:src="tip.titleImageUrl"
								/>
								<img
									v-else
									src="../assets/aircraft.svg"
									style="width:30px"
								/>
							</q-avatar>
						</q-item-section> -->

						<q-item-section>
							<q-item-label
								lines="1"
								class="text-secondary bold"
							>{{
              tip.title
            }}</q-item-label>
							<q-item-label caption>
								{{ tip.getCreatedAtString("DD.MM.YYYY") }}
								<q-tooltip>
									erstellt am {{ tip.getCreatedAtString("DD.MM.YYYY") }}
								</q-tooltip>
							</q-item-label>
						</q-item-section>

						<q-item-section side>
							<q-icon
								name="keyboard_arrow_right"
								color="secondary"
							/>
						</q-item-section>
					</q-item>
				</q-intersection>
			</q-list>

		</template>
	</q-page>
</template>

<script>
	export default {
		name: "PageIndex",
		computed: {
			trips() {
				return this.$store.getters["tripList/getUsersTripList"];
			},
			tips() {
				return this.$store.getters["tipList/getUsersTipList"];
			},
		},
		methods: {
			fetchTrips() {
				this.$store.dispatch("tripList/fetchAllUserTrips");
			},
			fetchTips() {
				this.$store.dispatch("tipList/fetchAllUserTips");
			},
		},
		created() {
			this.fetchTrips();
			this.fetchTips();
		},
	};
</script>
