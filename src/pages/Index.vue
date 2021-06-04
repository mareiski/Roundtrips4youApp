<template>
  <q-page class="flex justify-start flex-direction-col align-center">
    <div class="width-80-percent">
      <h4>Deine Reisen</h4>
    </div>
    <q-list bordered padding class="rounded-borders width-80-percent">
      <q-intersection
        v-for="roundtripID in 5"
        :key="roundtripID"
        once
        transition="flip-right"
      >
        <q-item v-ripple clickable>
          <q-item-section avatar top>
            <q-avatar class="background-light-grey">
              <img style="width:30px" src="../assets/aircraft.svg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1" class="text-secondary bold"
              >Titel</q-item-label
            >
            <q-item-label caption>
              11.05.2021
              <q-tooltip>
                erstellt am 11.05.2021
              </q-tooltip>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label lines="1" class="text-primary"
              >öffentlich</q-item-label
            >
          </q-item-section>

          <q-item-section side>
            <q-icon name="keyboard_arrow_right" color="secondary" />
          </q-item-section>
        </q-item>
      </q-intersection>
    </q-list>
    <q-btn
      color="primary"
      outline
      icon-right="add_circle_outlined"
      label="Reise hinzufügen"
      align="between"
      class="width-80-percent"
      style="height:40px;"
      @click="$emit('showWizard')"
    />
  </q-page>
</template>

<script>
export default {
  name: "PageIndex"
};
</script>
