<template>
	<q-layout view="lHh Lpr lFf">
		<q-drawer
			v-model="showNotifications"
			overlay
		>
			<close-button
				:top="0"
				@click="showNotifications = !showNotifications"
			></close-button>
			<notifications></notifications>
		</q-drawer>

		<q-dialog
			maximized
			v-model="showWizardDialog"
		>
			<div>
				<close-button
					:top="10"
					@click="showWizardDialog = !showWizardDialog"
					v-show="wizardStep === 1"
				></close-button>
				<back-button
					v-show="wizardStep > 1"
					@click="wizardStep--"
					style="z-index: 2;"
					:top="10"
				></back-button>
				<h6
					v-show="wizardStep > 1"
					class="position-absolute text-center text-primary full-width"
					style="z-index: 1;"
				>
					{{ wizardTitle }}
				</h6>
				<wizard-dialog
					v-model="wizardStep"
					:titleProp="wizardTitle"
					@titleChange="wizardTitle = $event"
					@createdTrip="wizardStep = 1, wizardTitle = ''"
				></wizard-dialog>
			</div>
		</q-dialog>

		<q-dialog
			maximized
			v-model="showTipDialog"
		>
			<div>
				<close-button
					:top="10"
					style="z-index: 2;"
					@click="showTipDialog = !showTipDialog; defaultTip = null"
				></close-button>
				<h6
					style="z-index: 1;"
					class="position-absolute text-center text-primary full-width"
				>
					{{defaultTip ? defaultTip.title : 'Tipp erstellen'}}
				</h6>
				<tip-dialog
					:defaultTip="defaultTip"
					@hideDialog="showTipDialog = !showTipDialog; defaultTip = null"
				></tip-dialog>
			</div>
		</q-dialog>

		<q-page-container ref="pages">
			<keep-alive>
				<router-view
					:key="$route.fullPath"
					@showWizard="showWizardDialog = !showWizardDialog"
					@showTipWizard="openTipDialog($event)"
					@clickActionButton="actionButtonClicked()"
				/>
			</keep-alive>
		</q-page-container>

		<q-footer
			style="height:60px;"
			class="flex justify-around bg-white shadow-8"
			v-show="!$router.currentRoute.meta.guestOnly"
		>
			<template v-if="user">
				<router-link
					to="/"
					class="center-content-horizontal"
				>
					<q-icon
						class="icon-outline"
						size="md"
						name="home"
					/>
				</router-link>
				<router-link
					to="/Inspiration"
					class="center-content-horizontal"
				>
					<q-icon
						class="icon-outline"
						size="md"
						name="lightbulb"
					/>
				</router-link>
				<router-link
					to=""
					class="center-content-horizontal"
					style="width:54px;"
				>
					<!-- floating action button with single option -->
					<q-btn
						v-if="!$router.currentRoute.meta.fabMultipleActions"
						icon="add"
						color="primary"
						round
						class="add-btn shadow-15-orange"
						@click="actionButtonClicked()"
					></q-btn>

					<!-- fab with multiple actions -->
					<q-fab
						v-else
						icon="add"
						color="primary"
						round
						class="add-btn shadow-15-orange"
						direction="up"
					>
						<q-fab-action
							color="secondary"
							icon="add"
							label="Reise"
							@click="showWizardDialog = !showWizardDialog;"
						/>
						<q-fab-action
							color="secondary"
							icon="add"
							label="Tipp"
							@click="showTipDialog = !showTipDialog"
						/>
					</q-fab>
				</router-link>
				<router-link
					to=""
					class="center-content-horizontal"
				>
					<q-icon
						size="md"
						color="primary"
						:name="showNotifications ? 'notifications' : 'notifications_none'"
						@click="showNotifications = !showNotifications"
					/>
				</router-link>
				<router-link
					to="/Profil"
					class="center-content-horizontal"
				>
					<q-icon
						class="icon-outline"
						size="md"
						name="person"
					/>
				</router-link>
			</template>
			<template v-else>
				<p class="text-secondary q-pl-sm">Du bist nicht Angemeldet! Um deine Reise zu speichern musst du dich später links oben Registrieren
				</p>
			</template>
		</q-footer>
	</q-layout>
</template>

<script>
	import WizardDialog from "src/components/Wizard/WizardDialog.vue";
	import CloseButton from "src/components/Buttons/CloseButton.vue";
	import Notifications from "src/components/Notifications.vue";
	import BackButton from "src/components/Buttons/BackButton.vue";
	import TipDialog from "src/components/TipDialog.vue";
	import { Loading } from "quasar";
	import { auth } from "../firebaseInit.js";

	export default {
		components: {
			WizardDialog,
			CloseButton,
			Notifications,
			BackButton,
			TipDialog,
		},
		name: "MainLayout",
		data() {
			return {
				showNotifications: false,
				showWizardDialog: false,
				wizardStep: 1,
				wizardTitle: null,
				redirectionFinished: false,
				mountFinished: false,
				showTipDialog: false,
				defaultTip: null,
			};
		},
		computed: {
			user() {
				return this.$store.getters["user/user"];
			},
		},
		methods: {
			actionButtonClicked() {
				let actionButtonMethod =
					this.$router.currentRoute.meta.actionButtonMethod;
				if (actionButtonMethod) {
					let name = this.$router.currentRoute.name;
					this.getChild(name)[actionButtonMethod]();
				} else {
					this.showWizardDialog = !this.showWizardDialog;
				}
			},
			openTipDialog(e) {
				console.log(e);
				if (this.showTipDialog) {
					this.showTipDialog = false;
					this.defaultTip = null;
				} else {
					this.showTipDialog = true;
					if (e) {
						this.defaultTip = e;
					}
				}
			},
			getChild(name) {
				for (let child of this.$refs.pages.$children) {
					if (child.$options.name == name) return child;
				}
			},
		},
		created() {
			let loggedIn = auth.user() !== null;

			if (!loggedIn) {
				this.$router.push("/Registrieren");
			}
		},
		mounted() {
			Loading.hide();
		},
	};
</script>
