<template>
  <q-scroll-area class="fit" style="padding-top:40px;">
    <q-card v-for="n in 20" :key="n">
      <q-card-section class="flex">
        <div class="center-content-horizontal" style="padding-right:10px;">
          <q-icon name="notifications" size="sm" color="primary" />
        </div>
        <div class="text-primary">Notification {{ n }}</div>
      </q-card-section>
      <q-card-section class="text-grey" style="padding-top:0;">
        Beschreibung zu dieser Nachricht die bis zu drei Zeilen lang sein kann.
        Wenn Sie länger ist, kann sie auch abgeschnitten werden.
      </q-card-section>
    </q-card>
  </q-scroll-area>
</template>

<script>
export default {};
</script>
