require("../../../src/components/Map/riverRoute.ts");

exports.handler = async function(event) {
  const {
    startLocation,
    endLocation,
    rawRivers,
    rawEuropeanRivers
  } = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify(
      riverRoute.getRiverRoute(
        startLocation,
        endLocation,
        [rawRivers, rawEuropeanRivers],
        []
      )
    )
  };
};
