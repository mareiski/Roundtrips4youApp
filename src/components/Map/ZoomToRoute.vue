<template>
  <div class="mapbox-ctrl mapbox-ctrl-group">
    <q-btn
      color="white"
      text-color="secondary"
      icon="fas fa-route"
      round
      @click="$emit('clicked')"
      style="position:absolute; right:9px; top:230px;"
    >
    </q-btn>
  </div>
</template>

<script>
export default {
  name: "MapLayerPlugin",
};
</script>
