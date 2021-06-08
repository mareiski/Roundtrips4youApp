<template>
  <div>
    <q-dialog seamless v-model="dialogShowed" position="bottom">
      <q-carousel
        animated
        autoplay
        arrows
        infinite
        v-model="slideNum"
        height="100px"
      >
        <q-carousel-slide
          v-for="(url, index) in data.imgUrls"
          :name="index"
          :key="index"
          :img-src="url"
          @click="showImageDialog(url)"
        >
        </q-carousel-slide>
      </q-carousel>
      <q-card :class="max ? 'dialog-max-height' : 'dialog-min-height'">
        <q-card-section class="column" style="height: 120px">
          <div class="row flex justify-between no-wrap" @click="max = !max">
            <div>
              <div class="text-weight-bold text-secondary">
                {{ data.title }}
              </div>
              <div class="text-grey">
                <q-icon name="location_on" />{{ data.subtitle }}
              </div>
            </div>
            <q-icon
              :class="(max ? 'rotate' : '') + ' text-secondary'"
              style="transition: 0.2s all;"
              name="expand_less"
              size="sm"
            />
          </div>
          <div class="flex justify-end" style="margin-top:10px;">
            <q-btn
              style="margin-right:5px"
              flat
              color="secondary"
              label="Optionen"
            >
              <q-menu>
                <q-list style="min-width: 100px" class="text-secondary">
                  <q-item clickable v-close-popup>
                    <q-item-section>Erneut hinzufügen</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="max = !max">
                    <q-item-section>Infos</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <!-- add or delete depending if already added -->
            <q-btn icon="add" outline color="primary" label="Hinzufügen" />
          </div>
        </q-card-section>
        <q-card-section
          class="row items-center no-wrap"
          style="padding-top:30px;"
        >
          <div>
            <div class="text-secondary">
              Beschreibung der stadt Sehenswürdigkeiten usw
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <image-dialog
      v-model="imageDialogShowed"
      :dialogImgSrc="imageDialogSrc"
    ></image-dialog>
  </div>
</template>

<script>
import ImageDialog from "../ImageDialog.vue";
export default {
  components: { ImageDialog },
  props: {
    data: Object,
    showed: Boolean
  },
  data() {
    return {
      slideNum: 0,
      max: false,
      imageDialogShowed: false,
      imageDialogSrc: ""
    };
  },
  model: {
    prop: "showed",
    event: "showedChanged"
  },
  methods: {
    showImageDialog(src) {
      this.imageDialogSrc = src;
      this.imageDialogShowed = true;
    }
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
<style lang="scss">
.q-card {
  transition: all 0.5s !important;
  overflow: hidden !important;
}

.dialog-max-height {
  height: 60vh;
}

.dialog-min-height {
  height: 120px;
}
</style>
