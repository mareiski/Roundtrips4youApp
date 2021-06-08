<template>
  <q-dialog v-model="dialogShowed" auto-close>
    <q-card style="width:100%; max-width:100vh; overflow:hidden;">
      <q-card-section
        class="row flex justify-end q-pb-none"
        style="z-index:100; width:100%; position:absolute; color:white;"
      >
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-img style="width:100%;" :src="dialogImgSrc"></q-img>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    dialogImgSrc: String,
    showed: Boolean
  },
  model: {
    prop: "showed",
    event: "showedChanged"
  },
  computed: {
    dialogShowed: {
      get: function() {
        return this.showed;
      },
      set: function(newValue) {
        if (this.showed != newValue) {
          this.$emit("showedChanged", newValue);
        }
      }
    }
  }
};
</script>
