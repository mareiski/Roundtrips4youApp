<template>
	<q-scroll-area
		class="fit q-px-md"
		style="padding-top:40px;"
	>
		<div v-if="userEntry && userEntry.messages && userEntry.messages.length > 0">
			<div
				v-for="(n, index) in userEntry.messages"
				:key="index"
			>
				<router-link
					v-if="n.url"
					:to="n.url"
				>
					<q-card
						flat
						:class="n.seen ? '' : 'bg-grey-3'"
					>
						<q-card-section class="flex">
							<div
								class="center-content-horizontal"
								style="padding-right:10px;"
							>
								<q-icon
									:name="n.icon"
									size="sm"
									color="primary"
								/>
							</div>
							<div class="text-primary">{{n.title}}</div>
						</q-card-section>
						<q-card-section
							class="text-grey ellipsis-3-lines"
							style="padding-top:0; height:65px;"
						>
							<div v-html="n.description"></div>
						</q-card-section>
						<q-separator
							spaced
							inset
						></q-separator>
					</q-card>
				</router-link>
				<q-card
					v-else
					flat
					:class="n.seen ? '' : 'bg-grey-3'"
				>
					<q-card-section class="flex">
						<div
							class="center-content-horizontal"
							style="padding-right:10px;"
						>
							<q-icon
								:name="n.icon"
								size="sm"
								color="primary"
							/>
						</div>
						<div class="text-primary">{{n.title}}</div>
					</q-card-section>
					<q-card-section
						class="text-grey ellipsis-3-lines"
						style="padding-top:0; height:65px;"
					>
						<div v-html="n.description"></div>
					</q-card-section>
					<q-separator
						spaced
						inset
					></q-separator>
				</q-card>
			</div>

		</div>

		<q-card
			flat
			v-else
		>
			<q-card-section class="flex text-secondary">
				Hier findest du Benachrichtigungen und wichtige Infos
			</q-card-section>
		</q-card>
	</q-scroll-area>
</template>

<style lang="sass">
a
	color: $primary
</style>

<script>
	// import { messaging } from "../firebaseInit";

	export default {
		computed: {
			userEntry() {
				return this.$store.getters["user/userEntry"];
			},
		},
		data() {
			return {};
		},
		created() {
			this.$store.dispatch("user/fetchUserEntry");
			// messaging.getToken().then((token) => {
			// 	messaging.onMessage(messaging, (payload) => {
			// 		console.log("got message");
			// 		console.log(payload);
			// 	});
			// });
		},
	};
</script>
