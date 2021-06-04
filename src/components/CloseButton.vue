<template>
  <div style="width:100%; position:absolute; z-index:1; top:10px; left:5px;">
    <q-btn
      @click="$emit('click')"
      color="secondary"
      icon="close"
      flat
      :ripple="false"
    >
    </q-btn>
  </div>
</template>
