<template>
	<q-card
		style="height:100%; width:100%; padding-top:80px;"
		class="flex justify-between flex-direction-col flex-nowrap"
	>
		<q-card-section>
			<q-input
				label="Titel"
				v-model="tip.title"
				class="q-pb-md"
			></q-input>
			<geocoder
				v-if="!defaultTip"
				id="geocoder5"
				@inputLocation="tip.location = $event"
			></geocoder>
			<p v-else>{{tip.location.label}}</p>
		</q-card-section>
		<q-card-section>
			<q-editor
				v-model="tip.content"
				placeholder="Dein Tipp..."
				class="text-secondary"
			></q-editor>
			<p
				class="full-width text-primary"
				style="text-align:right;"
				v-if="tip.content.length < 50"
			>{{50 - tip.content.length}} Zeichen fehlen</p>
		</q-card-section>
		<q-card-actions class="flex justify-center q-pb-lg">
			<q-btn
				v-if="!defaultTip"
				outline
				:disable="!tip.valid()"
				label="Tipp erstellen"
				color="primary"
				@click="createTip()"
			/>
			<template v-else>
				<q-btn
					outline
					label="Tipp löshcen"
					color="secondary"
					class="q-mb-md"
					@click="deleteTip()"
				/>
				<q-btn
					outline
					:disable="!tip.valid()"
					label="Tipp speichern"
					color="primary"
					@click="updateTip()"
				/>
			</template>
		</q-card-actions>
	</q-card>
</template>

<script>
	import Tip from "../classes/tip.ts";
	import Geocoder from "../components/Geocoder.vue";
	export default {
		components: { Geocoder },
		data() {
			return {
				tip: new Tip(),
			};
		},
		props: {
			defaultTip: Tip,
		},
		created() {
			let user = this.$store.getters["user/user"];
			if (this.defaultTip) {
				this.tip = this.defaultTip;
			} else {
				this.tip = new Tip("", user.uid, "", Date.now());
			}
		},
		methods: {
			createTip() {
				this.$store.dispatch("tipList/addTip", this.tip).then(() => {
					this.$emit("hideDialog");
				});
			},
			updateTip() {
				this.$store.dispatch("tipList/updateTip", this.tip).then(() => {
					this.$emit("hideDialog");
				});
			},
			deleteTip() {
				this.$store.dispatch("tipList/deleteTip", this.tip.TipId).then(() => {
					this.$emit("hideDialog");
				});
			},
		},
	};
</script>