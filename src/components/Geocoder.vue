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

    let context = this;
    // Add geocoder result to container.
    geocoder.on("result", function(e) {
      let country;
      if (e.result.place_name.includes(",")) {
        let locationParts = e.result.place_name.split(",");
        country = locationParts[locationParts.length - 1];
      } else {
        counry = e.result.place_Name;
      }

      context.$emit("inputCountry", country);
    });

    // Clear results container when search is cleared.
    geocoder.on("clear", function() {
      context.$emit("input", null);
    });
  }
};
</script>

<style></style>
