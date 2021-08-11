<template>
	<div :style="
      'width:100%; position:absolute; z-index:1; top:' + top + 'px; left:5px;'
    ">
		<q-btn
			@click="$emit('click')"
			color="secondary"
			icon="save"
			flat
			:size="size || 'lg'"
			:ripple="false"
		>
		</q-btn>
	</div>
</template>
<script>
	export default {
		props: {
			top: Number,
			size: String,
		},
	};
</script>
