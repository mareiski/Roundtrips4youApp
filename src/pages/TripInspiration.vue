<template>
	<q-page class="flex flex-center">
		<geocoder
			id="geocoder4"
			@inputCountry="e => (country = e)"
		></geocoder>
		<h5 style="margin:0;">Tipps</h5>
		<q-scroll-area
			horizontal
			style="height: 280px; width: 100vh; padding-left:10px;"
			class="bg-grey-1 rounded-borders"
		>
			<div class="flex flex-nowrap full-height">
				<q-card
					v-for="n in 10"
					:key="n"
					style="width:200px; margin:5px;"
				>
					<q-img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.hellogiggles.com%2Fuploads%2F2017%2F07%2F10085540%2FPuertoRicoSummer-e1500342104215.jpg&f=1&nofb=1" />
					<q-card-section>
						<q-item-label class="text-primary">Titel Tipp {{ n }}</q-item-label>
						<q-item-label caption>
							<q-icon name="location_on" /> Ort
						</q-item-label>
					</q-card-section>
					<q-card-section
						class="text-grey ellipsis-3-lines	"
						style="padding-top:0; height:65px;"
					>
						Beschreibung zu dieser Nachricht die bis zu drei Zeilen lang sein
						kann. Wenn Sie länger ist, kann sie auch abgeschnitten werden.
					</q-card-section>
				</q-card>
			</div>
		</q-scroll-area>
		<h5>Reisen</h5>
		<q-scroll-area
			horizontal
			style="height: 280px; width: 100vh; padding-left:10px;"
			class="bg-grey-1 rounded-borders"
		>
			<div class="flex flex-nowrap full-height">
				<q-card
					v-for="n in 10"
					:key="n"
					style="width:200px; margin:5px;"
				>
					<q-img src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.hellogiggles.com%2Fuploads%2F2017%2F07%2F10085540%2FPuertoRicoSummer-e1500342104215.jpg&f=1&nofb=1" />
					<q-card-section class="flex">
						<div class="text-primary">Reise {{ n }}</div>
					</q-card-section>
					<q-card-section
						class="text-grey ellipsis-3-lines	"
						style="padding-top:0; height:65px;"
					>
						Beschreibung zu dieser Nachricht die bis zu drei Zeilen lang sein
						kann. Wenn Sie länger ist, kann sie auch abgeschnitten werden.
					</q-card-section>
				</q-card>
			</div>
		</q-scroll-area>
		<h5>Personen</h5>
		<q-scroll-area
			horizontal
			style="height: 280px; width: 100vh; padding-left:10px;"
			class="bg-grey-1 rounded-borders"
		>
			<div class="flex flex-nowrap full-height">
				<q-card
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
				</q-card>
			</div>
		</q-scroll-area>
	</q-page>
</template>

<script>
	import Geocoder from "src/components/Geocoder.vue";
	export default {
		components: {
			Geocoder,
		},
		data() {
			return {
				country: {},
			};
		},
	};
</script>

<style></style>
