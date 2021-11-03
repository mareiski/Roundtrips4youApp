<template>
	<q-card
		style="padding-top:80px;"
		class="fit"
		flat
	>
		<q-card-section class="full-height flex justify-around flex-direction-col flex-nowrap">
			<q-input
				v-model="stop.title"
				label="Titel"
			></q-input>
			<q-input
				type="number"
				v-model.number="stop.dayDuration"
				label="Tage"
			></q-input>
			<q-select
				v-model="profile"
				:options="profileOptions"
				label="Reisemittel"
			/>
			<q-btn
				icon="launch"
				label="Booking.com Hotels"
				no-caps
				class="text-secondary"
				@click="openInNewTab('https://www.booking.com/searchresults.de.html?ss=' + stop.location.label.split(',')[0] + '&checkin_year=' + stop.date.split(' ')[0].split('.')[2] + '&checkin_month=' + stop.date.split('.')[1] + '&checkin_monthday=' + stop.date.split('.')[0] + '&checkout_year=' + getCheckOutDate().getFullYear() + '&checkout_month=' + (getCheckOutDate().getMonth() +1) + '&checkout_monthday=' + getCheckOutDate().getDate() + '&group_adults=' + trip.adults + getChildrenText() +  '&no_rooms=' + trip.rooms + '&ac_langcode=de')"
			></q-btn>
			<q-editor
				v-model="stop.notes"
				content-class="text-secondary"
				placeholder="Notizen zu diesem Stopp"
				:definitions="{
					upload: {
					tip: 'Upload to cloud',
					icon: 'cloud_upload',
					label: 'Upload',
					handler: uploadImage
					}
				}"
				:toolbar="sharedMethods.toolbar($q, true)"
			></q-editor>
		</q-card-section>
	</q-card>
</template>
<script>
	import sharedMethods from "app/sharedMethods";
	export default {
		props: ["stopProp", "trip"],
		model: {
			prop: "stopProp",
			event: "stopChanged",
		},
		name: "EditStopDialog",

		data() {
			return {
				profileOptions: ["Auto", "Fahrrad", "Zu Fuß", "SUP"],
			};
		},
		computed: {
			stop: {
				get: function () {
					return this.stopProp;
				},
				set: function (newValue) {
					if (this.stop !== newValue) {
						this.$emit("stopChanged", newValue);
					}
				},
			},
			profile: {
				get: function () {
					return this.revertProfile(this.stop.profile);
				},
				set: function (newValue) {
					this.stop.profile = this.revertProfile(newValue);
				},
			},
			sharedMethods() {
				return sharedMethods;
			},
		},
		created() {
			this.getStopDates();
		},
		methods: {
			openInNewTab(link) {
				window.open(link, "_blank");
			},
			getChildrenText() {
				let text = "&group_children=" + this.trip.childrenAges.length;
				this.trip.childrenAges.forEach((child) => {
					text += "&age=" + child;
				});
				return text;
			},
			getStopDates() {
				let startDate;
				if (this.trip.startDate.seconds) {
					startDate = sharedMethods.getDateFromTimeStamp(this.trip.startDate);
				} else {
					startDate = sharedMethods.getDateFromString(this.trip.startDate);
				}

				if (this.trip.stopList[0] === this.stop) {
					this.stop.date = sharedMethods
						.getFormattedDate(startDate)
						.split(" ")[0];
				} else {
					let context = this;
					this.trip.stopList.forEach((stop) => {
						startDate.setDate(startDate.getDate() + stop.dayDuration);

						if (stop === context.stop) {
							context.stop.date = sharedMethods
								.getFormattedDate(startDate)
								.split(" ")[0];
							return true;
						}
					});
				}
			},
			uploadImage() {},
			getCheckOutDate() {
				let date = sharedMethods.getDateFromString(this.stop.date);
				date.setDate(date.getDate() + this.stop.dayDuration);
				return date;
			},
			revertProfile(profile) {
				switch (profile) {
					case "driving": {
						return this.profileOptions[0];
					}
					case "cycling": {
						return this.profileOptions[1];
					}
					case "walking": {
						return this.profileOptions[2];
					}
					case "SUP": {
						return this.profileOptions[3];
					}
					case this.profileOptions[0]: {
						return "driving";
					}
					case this.profileOptions[1]: {
						return "cycling";
					}
					case this.profileOptions[2]: {
						return "walking";
					}
					case this.profileOptions[3]: {
						return "SUP";
					}
				}
			},
		},
	};
</script>
<style></style>
