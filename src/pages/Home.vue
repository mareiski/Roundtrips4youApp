<template>
	<q-page style="padding-top:0;">
		<div
			class="home q-px-xl"
			style="margin-bottom 0; padding-bottom: 0;"
		>
			<div id="MainImg"></div>
			<div id="MainImgOverlay"></div>
			<div id="MainImgPlacholder">
				<div>
					<h2 class="main-qoute">Plane deine eigene Reise</h2>
					<h3 class="quote-subtext">
						Mit unserem Reiseplaner kannst du deine eigene Reise individuell zusammenstellen.
						Ganz einfach, perfekt geplant und ohne Einschränkungen.
					</h3>
					<q-btn
						@click="$router.push('/Registrieren')"
						color="primary"
						style="margin-top:40px;"
					>kostenlos starten</q-btn>
				</div>
				<div class="flex justify-center">
					<q-icon
						class="scroll-down-icon cursor-pointer"
						name="keyboard_arrow_down"
						@click="sharedMethods.scrollToRef($refs['sndSection'])"
					/>
				</div>
			</div>
			<div
				class="clouds"
				v-if="!isMobile"
			>
				<img
					v-for="index in 4"
					:key="index"
					:src="'../cloud' + (index + 1) + '.png'"
					:style="'--i:' + (index + 1) + '; max-height: 350px;'"
				/>
				<img
					v-for="index in 3"
					:key="index"
					:src="'../cloud' + (index + 1) + '.png'"
					:style="'--i:' + (index + 6)+ '; max-height: 400px; left:100px;'"
				/>
				<img
					v-for="index in 2"
					:key="index"
					:src="'../cloud' + (index + 1) + '.png'"
					:style="'--i:' + (index + 9)+ '; max-height: 350px; left:100px;'"
				/>
			</div>
			<div
				ref="sndSection"
				class="box-seperator shadow-2"
				style="z-index:2;"
			>
				<h1
					style="z-index:2;"
					class="text-h4"
				>Plane deine eigene Reise kostenlos & perfekt auf dich zugeschnitten</h1>
			</div>
			<div class="box-seperator-placholder"></div>
			<div class="card-container">
				<div class="card-wrap left">
					<div
						class="card cursor-pointer shadow-2"
						@click="$router.push('/Inspiration')"
					>
						<q-icon name="fas fa-lightbulb" />
						<h4>Inspiration</h4>
						<span>Entdecke die Reisen anderer User und bekomme wertvolle Tipps zu den besten Orten einer Region.</span>
					</div>
				</div>
				<div class="card-wrap">
					<div
						class="card cursor-pointer shadow-2"
						@click="$router.push('/Registrieren');"
					>
						<q-icon name="explore" />
						<h4>Individualität</h4>
						<span>Du planst deine Reise genau so wie du sie haben möchtest und bestimmst wann und wie du an einem bestimmten Ort sein möchtest.</span>
					</div>
				</div>
				<div class="card-wrap right">
					<div
						class="card cursor-pointer shadow-2"
						@click="$router.push('/Registrieren');"
					>
						<q-icon name="edit" />
						<h4>Simpel</h4>
						<span>Bei uns kannst du ganz schnell und kinderleicht deine eigene Reise zusammenstellen, genau wie eine Katalogreise nur individueller.</span>
					</div>
				</div>
			</div>

			<h4 style="text-align:center; padding-top: 30px;">In diesen Schritten planst du deine Reise in kürzester Zeit</h4>
			<div
				class="flex"
				id="scroll-container"
			>
				<div class="scroll-col left-scroll-col flex justify-center">
					<arrival-departure
						ref="arrivalDeparture"
						v-show="scrollSectionVisibleIndex === 0"
					></arrival-departure>
					<bottom-dialog
						v-model="bottomDialogShowed"
						:data="bottomDialogDemoData"
					></bottom-dialog>
					<q-list
						bordered
						class="rounded-borders"
						v-show="scrollSectionVisibleIndex === 2"
					>
						<draggable
							v-model="demoStops"
							handle=".handle"
						>
							<q-item
								v-for="(stop) in demoStops"
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
								<q-item-section>
									<q-item-label
										lines="1"
										class="text-secondary"
									>{{
                stop.title
              }}</q-item-label>

								</q-item-section>

								<q-item-section
									side
									top
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
				</div>
				<div class="scroll-col right-scroll-col">
					<div class="section-1">
						<h5>Grundinfos angeben</h5>
						<p>Gib am Anfang dein Startdatum, deine Startadresse und optional noch dein Ziel ein.</p>
						<p>Danach kannst du deine Reise entweder mit einer Vorlage erstellen oder sie komplett selbst planen.</p>
						<div
							class="flex"
							style="padding-top:20px;"
						>
							<a
								@click="$router.push('/Registrieren')"
								class="font-medium cursor-pointer"
							>Zum Reiseplaner</a>
							<div
								class="flex justify-center"
								style="flex-direction:column;"
							>
								<q-icon
									name="arrow_right_alt"
									color="primary"
									size="30px"
								/>
							</div>
						</div>
					</div>
					<div class="section-2">
						<h5>Reiseziele wählen</h5>
						<p>Mit dem Klick auf eine Stadt auf der Karte kannst du diese sofort hinzufügen.</p>
						<p>Außerdem erhältst du wichtige Informationen und die besten Sehenswürdigkeiten des jeweiligen Ortes.</p>
						<p>Natürlich kannst du hier auch ein Hotel hinzufügen, welches du bei den bekanntesten Anbietern buchen kannst.</p>
						<div
							class="flex"
							style="padding-top:20px;"
						>
							<a
								@click="$router.push('/Registrieren')"
								class="font-medium cursor-pointer"
							>Zum Reiseplaner</a>
							<div
								class="flex justify-center"
								style="flex-direction:column;"
							>
								<q-icon
									name="arrow_right_alt"
									color="primary"
									size="30px"
								/>
							</div>
						</div>
					</div>
					<div class="section-3">
						<h5>Reiseübersicht</h5>
						<p>Um deine Reiseplanung noch strukturierter zu gestalten, erhältst du eine übersichtliche Zusammenfassung deiner Reise mit all deinen Stopps und Routen.</p>
						<p>Wenn du möchtest kannst du auch deine Reise abschließend auf Roundtrips4you veröffentlichen um sie der ganzen Welt zu zeigen.</p>
						<div
							class="flex"
							style="padding-top:20px;"
						>
							<a
								@click="$router.push('/Registrieren')"
								class="font-medium cursor-pointer"
							>Zum Reiseplaner</a>
							<div
								class="flex justify-center"
								style="flex-direction:column;"
							>
								<q-icon
									name="arrow_right_alt"
									color="primary"
									size="30px"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section-img"></div>
			<div class="section-img-placeholder">
				<h3 class="text-white text-h4">Plane jetzt gleich und ohne Anmeldung deine ganz eigene Reise</h3>
				<q-btn
					color="primary"
					@click="$router.push('/Registrieren')"
					class="q-mt-md"
				>Reise erstellen</q-btn>
			</div>
			<!-- <p style="text-align:center; font-size:20px; padding-top:40px;">Möchtest du erstmal ein paar Beispiele sehen?<br> Wähle ein Land und sehe dir von anderen Usern mit unserem Reiseplaner kostenlos und online erstellte Rundreisen an</p>
			<div class="card-container">
				<div
					class="card-wrap left"
					v-in-viewport.once
				>
					<router-link
						class="card"
						to="/rundreisen/Portugal"
						itemtype="http://schema.org/Offer"
					>
						<div id="PortugalImg"></div>
						<h3>Portugal</h3>
						<span>Erlebe einzigartige Landschaften und fazinierende Städte</span>
					</router-link>
				</div>
				<div
					class="card-wrap"
					v-in-viewport.once
				>
					<router-link
						class="card"
						to="/rundreisen/Indonesien"
						itemtype="http://schema.org/Offer"
					>
						<div id="BaliImg"></div>
						<h3>Indonesien</h3>
						<span>Erlebe das Land der Tempel und Reisfelder</span>
					</router-link>
				</div>
				<div
					class="card-wrap right"
					v-in-viewport.once
				>
					<router-link
						class="card"
						to="/rundreisen/Italien"
						itemtype="http://schema.org/Offer"
					>
						<div id="ItalyImg"></div>
						<h3>Italien</h3>
						<span>Erlebe mediteranen Flair in antiken Städten</span>
					</router-link>
				</div>
			</div> -->
		</div>
	</q-page>
</template>
<style lang="scss">
	@import url("../css/home.scss");
</style>
<script>
	import { scroll } from "quasar";
	const { getScrollTarget, setScrollPosition } = scroll;
	import { auth } from "../firebaseInit.js";
	import sharedMethods from "../../sharedMethods.js";
	import draggable from "vuedraggable";
	import arrivalDeparture from "../components/Wizard/ArrivalDeparture.vue";
	import bottomDialog from "../components/Map/BottomDialog.vue";

	export default {
		meta: {
			title: "Reiseplaner kostenlos",
			meta: {
				description: {
					name: "description",
					content:
						"Orte planen, Hotels finden, Reisen teilen und die beste Route finden. Reise mit unserem Reiseplaner kostenlos erstellen & online planen",
				},
			},
		},
		components: {
			draggable,
			arrivalDeparture,
			bottomDialog,
		},
		name: "PageIndex",
		data() {
			return {
				date: "2019/02/01",
				searchLocation: "",
				imgLoaded: false,
				title: "Meine Reise",
				scrollSectionVisibleIndex: 0,
				demoStops: [
					{
						title: "Stopp in Paris",
						description: "Raum für Notizen, Beschreibungen...",
						location: {
							lat: 48.856613,
							lng: 2.352222,
							label: "Paris, Frankreich",
						},
						dayDuration: 1,
					},
					{
						title: "Stopp in Straßburg",
						description: "Raum für Notizen, Beschreibungen...",
						location: {
							lat: 48.582951,
							lng: 7.74375,
							label: "Straßburg, Frankreich",
						},
						dayDuration: 1,
					},
					{
						title: "Stopp in Lyon",
						description: "Raum für Notizen, Beschreibungen...",
						location: {
							lat: 45.764042,
							lng: 4.835659,
							label: "Lyon, Frankreich",
						},
						dayDuration: 1,
					},
				],
				bottomDialogDemoData: {
					title: "Stopp in Straßburg",
					subtitle: "Straßburg, Frankreich",
					stop: {},
					TripId: null,
					alreadyAdded: false,
					buttons: true,
					locationIcon: true,
					adults: 2,
					rooms: 1,
					childrenAges: [],
					ableToDelete: false,
				},
				demoRoundtrip: { Title: "Meine Reise" },
				demoStars: 5,
			};
		},
		computed: {
			sharedMethods() {
				return sharedMethods;
			},
			isMobile() {
				return window.matchMedia("(max-width: 550px)").matches;
			},
			bottomDialogShowed() {
				return this.scrollSectionVisibleIndex === 1;
			},
		},
		created() {
			this.bottomDialogDemoData.stop = this.demoStops[1];
			window.addEventListener("scroll", this.handleScroll);
		},
		destroyed() {
			window.removeEventListener("scroll", this.handleScroll);
		},
		methods: {
			scrollTo(refName) {
				var el = this.$refs[refName];
				const target = getScrollTarget(el);
				const offset = el.offsetTop;
				const duration = 400;
				setScrollPosition(target, offset, duration);
			},
			openInNewTab(link) {
				window.open(link, "_blank");
			},
			/**
			 * method checks which scroll section should be shown in scroll container
			 * @returns the index of the section
			 */
			handleScroll() {
				let leftScrollCol = document.getElementsByClassName("left-scroll-col")[0];
				let rightScrollCol =
					document.getElementsByClassName("right-scroll-col")[0];
				if (!rightScrollCol) return false;

				let sections = rightScrollCol.children;

				let offsets = [];
				sections.forEach((section) => {
					offsets.push(Math.abs(section.offsetTop - leftScrollCol.offsetTop));
				});

				let minOffset = Math.min.apply(null, offsets);

				this.scrollSectionVisibleIndex = offsets.indexOf(minOffset);
			},
		},
	};
</script>
