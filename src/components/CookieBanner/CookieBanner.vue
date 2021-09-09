<template>

	<q-dialog
		v-model="showCookieDialog"
		persistent
	>
		<q-card>
			<q-card-section class="row items-center">
				<q-avatar
					icon="admin_panel_settings"
					color="primary"
					text-color="white"
				/>
				<div style="max-width:90%; padding-left:20px;">
					<span>Wir verwenden Cookies um Dienste, wie den Login bereitzustellen und zu verbessern.
						Mit einem Klick auf "Akzeptieren" akzeptierst du die Cookies und das wir Analyetools einsetzen um Roundtrips4you zu verbessern.<br>Mehr dazu findest du unter Datenschutz.<br>
						<a
							style="text-decoration:underline;"
							@click="showCookieDialog = false"
						>Hier</a> geht es nur mit den essentiellen Cookies weiter.</span>
				</div>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					label="Akzeptieren"
					color="primary"
					outline
					@click="allowCookies()"
					v-close-popup
					style="min-width:0;"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>
<style lang="scss">
	@import url("../../css/cookie.scss");
</style>
<script>
	function enableCookieFunctions() {
		// enable analytics
		// eslint-disable-next-line no-undef
		onOptIn();
	}

	export default {
		data() {
			return {
				showCookieDialog: false,
			};
		},
		methods: {
			allowCookies() {
				this.$q.cookies.set("cookies_allowed", true, { expires: 10 });
				try {
					// eslint-disable-next-line no-undef
					cookiesAllowed = true;
				} catch (e) {
					console.log(e);
				}
				enableCookieFunctions();
			},
		},
		mounted() {
			let cookiesAllowedCookie = this.$q.cookies.get("cookies_allowed");
			if (cookiesAllowedCookie) {
				try {
					// eslint-disable-next-line no-undef
					cookiesAllowed = true;
					this.allowCookies();
				} catch (e) {
					console.log(e);
				}
			}
		},
		created() {
			let cookiesAllowedCookie = this.$q.cookies.get("cookies_allowed");
			if (!cookiesAllowedCookie) {
				let context = this;
				setTimeout(function () {
					context.showCookieDialog = true;
				}, 1000);
			}
		},
	};
</script>
