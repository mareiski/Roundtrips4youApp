<template>
  <div>
    <div id="geocoder"></div>
  </div>
</template>

<script>
export default {
  mounted() {
    var geocoder = new MapboxGeocoder({
      accessToken:
        "pk.eyJ1IjoibWFyZWlza2kiLCJhIjoiY2tucTMwOHVqMW96ZDJucHJjYWg4cWZ2ciJ9.iVPMUfC-Nb5Ktb77hfI2xw",
      types: "country,region,place,postcode,locality,neighborhood"
    });

    geocoder.addTo("#geocoder");

    // Add geocoder result to container.
    geocoder.on("result", function(e) {});

    // Clear results container when search is cleared.
    geocoder.on("clear", function() {});
  }
};
</script>

<style></style>
