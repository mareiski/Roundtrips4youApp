<template>
	<q-dialog
		v-model="dialogShowed"
		auto-close
	>
		<q-card style="width:100%; max-width:100vh; overflow:hidden;">
			<q-card-section
				class="row flex justify-end q-pb-none"
				style="z-index:100; width:100%; position:absolute; color:white;"
			>
				<q-btn
					icon="close"
					flat
					round
					dense
					v-close-popup
				/>
			</q-card-section>
			<q-card-section>
				<q-carousel
					animated
					:autoplay="7000"
					arrows
					infinite
					v-model="slideNum"
					height="100px"
				>
					<q-carousel-slide
						v-for="(url, index) in imageSrcs"
						:name="index"
						:key="index"
						:img-src="url"
					>
					</q-carousel-slide>
				</q-carousel>
				<!-- <q-img style="width:100%;" :src="dialogImgSrc"></q-img> -->
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script>
	export default {
		props: {
			imageSrcs: Array,
			showed: Boolean,
			activeIndex: Number,
		},
		model: {
			prop: "showed",
			event: "showedChanged",
		},
		computed: {
			dialogShowed: {
				get: function () {
					return this.showed;
				},
				set: function (newValue) {
					if (this.showed !== newValue) {
						this.$emit("showedChanged", newValue);
					}
				},
			},
			slideNum: {
				get: function () {
					console.log(this.activeIndex);
					return this.activeIndex;
				},
			},
		},
	};
</script>
