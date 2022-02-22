<template>
  <q-page style="padding-top:0;">
    <div class="home q-px-xl" style="margin-bottom: 0; padding-bottom: 0;">
      <div id="MainImg"></div>
      <div id="MainImgOverlay"></div>
      <div id="MainImgPlacholder">
        <div>
          <h2 class="main-qoute">Plane deine Reise</h2>
          <h3 class="quote-subtext">
            Mit unserem Reiseplaner kannst du deine eigene Reise individuell
            zusammenstellen. Hotelsuche oder Routenplanung, alles in einer App,
            ganz einfach ohne Einschränkungen.
          </h3>
          <div class="flex">
            <q-btn
              @click="$emit('showWizard')"
              color="primary"
              style="margin-top:40px;"
              >kostenlos starten</q-btn
            >
            <q-btn
              @click="$router.push('/login')"
              color="secondary"
              class="q-ml-md"
              style="margin-top:40px;"
              >login</q-btn
            >
          </div>
        </div>
        <!-- <div class="flex justify-center">
					<q-icon
						class="scroll-down-icon cursor-pointer"
						name="keyboard_arrow_down"
						@click="sharedMethods.scrollToRef($refs['sndSection'])"
					/>
				</div> -->
      </div>
      <div class="clouds" v-if="!isMobile">
        <img
          v-for="index in 4"
          :key="index + 'c1'"
          :src="'../cloud' + (index + 1) + '.png'"
          :style="'--i:' + (index + 1) + '; max-height: 350px;'"
        />
        <img
          v-for="index in 3"
          :key="index + 'c2'"
          :src="'../cloud' + (index + 1) + '.png'"
          :style="'--i:' + (index + 6) + '; max-height: 400px; left:100px;'"
        />
        <img
          v-for="index in 2"
          :key="index + 'c3'"
          :src="'../cloud' + (index + 1) + '.png'"
          :style="'--i:' + (index + 9) + '; max-height: 350px; left:100px;'"
        />
      </div>
      <div ref="sndSection" class="box-seperator shadow-2" style="z-index:2;">
        <h1 style="z-index:2;" class="text-h4">
          Plane deinen Roadtrip schnell, kostenlos und einfach
        </h1>
      </div>
      <div class="box-seperator-placholder"></div>
      <div class="card-container">
        <div class="card-wrap left">
          <div
            class="card cursor-pointer shadow-2"
            @click="$router.push('/Inspiration')"
          >
            <q-icon name="fas fa-lightbulb" />
            <h2 class="text-h4">Inspiration</h2>
            <span
              >Entdecke die Reisen anderer User und bekomme wertvolle Tipps zu
              den besten Orten einer Region.</span
            >
          </div>
        </div>
        <div class="card-wrap">
          <div
            class="card cursor-pointer shadow-2"
            @click="$router.push('/Registrieren')"
          >
            <q-icon name="explore" />
            <h2 class="text-h4">Individualität</h2>
            <span
              >Du planst deine Reise genau so wie du sie haben möchtest und
              bestimmst wann und wie du an einem bestimmten Ort sein
              möchtest.</span
            >
          </div>
        </div>
        <div class="card-wrap right">
          <div
            class="card cursor-pointer shadow-2"
            @click="$router.push('/Registrieren')"
          >
            <q-icon name="edit" />
            <h2 class="text-h4">Simpel</h2>
            <span
              >Bei uns kannst du ganz schnell und kinderleicht deine eigene
              Reise zusammenstellen, genau wie eine Katalogreise nur
              individueller.</span
            >
          </div>
        </div>
      </div>

      <div class="flex" id="scroll-container">
        <div class="scroll-col left-scroll-col flex justify-center">
          <arrival-departure
            ref="arrivalDeparture"
            v-show="scrollSectionVisibleIndex === 0"
          ></arrival-departure>
          <Map
            :asComponent="true"
            componentTripId="ARE7K02N3DEzeamwGIHr"
            v-show="scrollSectionVisibleIndex === 1"
            class="fit "
          ></Map>
          <q-list
            bordered
            class="rounded-borders"
            v-show="scrollSectionVisibleIndex === 2"
          >
            <draggable v-model="demoStops" handle=".handle">
              <q-item
                v-for="stop in demoStops"
                :key="stop.id"
                v-ripple
                clickable
                style="padding-left:8px; padding-right:5px;"
              >
                <q-item-section avatar>
                  <q-icon
                    color="primary"
                    name="drag_indicator"
                    class="cursor-DandD handle"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1" class="text-secondary">{{
                    stop.title
                  }}</q-item-label>
                </q-item-section>

                <q-item-section side top>
                  <div
                    class="flex justify-center"
                    style="flex-direction:column; height:100%;"
                  >
                    <!-- {{stop.InitDate.split(' ')[0]}} -->
                  </div>
                </q-item-section>

                <q-item-section side top style="padding:0;">
                  <div>
                    <q-btn flat round size="md" icon="edit" :ripple="false">
                      <q-tooltip>Optionen</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
                <q-item-section side top style="padding:0;">
                  <div>
                    <q-btn flat round size="md" icon="delete">
                      <q-tooltip>Stopp löschen</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </draggable>
            <q-separator inset="item" />
          </q-list>
        </div>
        <div class="scroll-col right-scroll-col">
          <div class="section-1">
            <h5>Organisiert in deinen Roadtrip starten</h5>
            <p>
              Plane deine komplette Reise an einem Ort, egal ob Hotelsuche,
              Routenplanung oder die Übersicht wärend der Reise.
            </p>
            <p>
              Danach kannst du deine Reise entweder mit der Communty oder deinen
              Social Media Kanälen teilen.
            </p>
            <div class="flex" style="padding-top:20px;">
              <a @click="$emit('showWizard')" class="font-medium cursor-pointer"
                >Zum Reiseplaner</a
              >
              <div class="flex justify-center" style="flex-direction:column;">
                <q-icon name="arrow_right_alt" color="primary" size="30px" />
              </div>
            </div>
          </div>
          <div class="section-2">
            <h5>Reiseziele wählen</h5>
            <p>
              Mit dem Klick auf eine Stadt auf der Karte kannst du diese sofort
              hinzufügen.
            </p>
            <p>
              Außerdem erhältst du wichtige Informationen und die besten
              Sehenswürdigkeiten des jeweiligen Ortes.
            </p>
            <p>
              Natürlich kannst du hier auch ein Hotel hinzufügen, welches du bei
              den bekanntesten Anbietern buchen kannst.
            </p>
            <div class="flex" style="padding-top:20px;">
              <a @click="$emit('showWizard')" class="font-medium cursor-pointer"
                >Zum Reiseplaner</a
              >
              <div class="flex justify-center" style="flex-direction:column;">
                <q-icon name="arrow_right_alt" color="primary" size="30px" />
              </div>
            </div>
          </div>
          <div class="section-3">
            <h5>Reiseübersicht</h5>
            <p>
              Um deine Reiseplanung noch strukturierter zu gestalten, erhältst
              du eine übersichtliche Zusammenfassung deiner Reise mit all deinen
              Stopps und Routen.
            </p>
            <p>
              Wenn du möchtest kannst du auch deine Reise abschließend auf
              Roundtrips4you veröffentlichen um sie der ganzen Welt zu zeigen.
            </p>
            <div class="flex" style="padding-top:20px;">
              <a @click="$emit('showWizard')" class="font-medium cursor-pointer"
                >Zum Reiseplaner</a
              >
              <div class="flex justify-center" style="flex-direction:column;">
                <q-icon name="arrow_right_alt" color="primary" size="30px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-img"></div>
      <div class="section-img-placeholder">
        <h3 class="text-white text-h4">
          Plane jetzt gleich und ohne Anmeldung deine ganz eigene Reise
        </h3>
        <q-btn color="primary" @click="$emit('showWizard')" class="q-mt-md"
          >Reise erstellen</q-btn
        >
      </div>
      <div class="flex q-pt-sm q-pb-sm">
        <router-link class="text-primary" to="/Impressum"
          >Impressum</router-link
        >
        <router-link class="text-primary q-pl-sm" to="/Datenschutz"
          >Datenschutz</router-link
        >
        <router-link class="text-primary q-pl-sm" to="/Haftungsausschluss"
          >Haftungsausschluss</router-link
        >
      </div>
    </div>
  </q-page>
</template>
<style lang="scss">
@import url("../css/home.scss");
</style>
<script>
import { scroll } from "quasar";
const { getScrollTarget, setScrollPosition } = scroll;
import sharedMethods from "../../sharedMethods.js";
import draggable from "vuedraggable";
import arrivalDeparture from "../components/Wizard/ArrivalDeparture.vue";
import Map from "./Map.vue";

export default {
  meta: {
    title: "Reiseplaner",
    meta: {
      description: {
        name: "description",
        content:
          "Orte planen, Hotels finden, Reisen teilen und die beste Route finden. Reise mit unserem Reiseplaner kostenlos erstellen & online planen"
      }
    }
  },
  components: {
    draggable,
    arrivalDeparture,
    Map
  },
  name: "PageIndex",
  data() {
    return {
      date: "2019/02/01",
      searchLocation: "",
      imgLoaded: false,
      title: "Meine Reise",
      scrollSectionVisibleIndex: 0,
      demoStops: [
        {
          id: "abc",
          title: "Stopp in Paris",
          description: "Raum für Notizen, Beschreibungen...",
          location: {
            lat: 48.856613,
            lng: 2.352222,
            label: "Paris, Frankreich"
          },
          dayDuration: 1
        },
        {
          id: "def",
          title: "Stopp in Straßburg",
          description: "Raum für Notizen, Beschreibungen...",
          location: {
            lat: 48.582951,
            lng: 7.74375,
            label: "Straßburg, Frankreich"
          },
          dayDuration: 1
        },
        {
          id: "hij",
          title: "Stopp in Lyon",
          description: "Raum für Notizen, Beschreibungen...",
          location: {
            lat: 45.764042,
            lng: 4.835659,
            label: "Lyon, Frankreich"
          },
          dayDuration: 1
        }
      ]
    };
  },
  computed: {
    sharedMethods() {
      return sharedMethods;
    },
    isMobile() {
      return window.matchMedia("(max-width: 550px)").matches;
    }
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  beforeRouteLeave(to, from, next) {
    this.scrollSectionVisibleIndex = 0;
    next();
  },
  methods: {
    scrollTo(refName) {
      var el = this.$refs[refName];
      const target = getScrollTarget(el);
      const offset = el.offsetTop;
      const duration = 400;
      setScrollPosition(target, offset, duration);
    },
    openInNewTab(link) {
      window.open(link, "_blank");
    },
    /**
     * method checks which scroll section should be shown in scroll container
     * @returns the index of the section
     */
    handleScroll() {
      let leftScrollCol = document.getElementsByClassName("left-scroll-col")[0];
      let rightScrollCol = document.getElementsByClassName(
        "right-scroll-col"
      )[0];
      if (!rightScrollCol) return false;

      let sections = rightScrollCol.children;

      let offsets = [];
      sections.forEach(section => {
        offsets.push(Math.abs(section.offsetTop - leftScrollCol.offsetTop));
      });

      let minOffset = Math.min.apply(null, offsets);

      this.scrollSectionVisibleIndex = offsets.indexOf(minOffset);
    }
  }
};
</script>
