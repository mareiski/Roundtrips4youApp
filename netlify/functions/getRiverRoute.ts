const riverRoute = require("../../src/assets/riverRoute.ts");

exports.handler = async function(event: { body: string }) {
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
