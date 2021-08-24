const riverRoute = require("../../src/assets/riverRoute.ts");
const rawRivers = require("../../src/assets/WorldRivers.json");
const rawEuropeanRivers = require("../../src/assets/EuropeanRivers.json");

exports.handler = async function(event: {
  queryStringParameters: { startLocation: any; endLocation: any };
}) {
  const startLocation = JSON.parse(event.queryStringParameters.startLocation);
  const endLocation = JSON.parse(event.queryStringParameters.endLocation);

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET"
  };

  return {
    statusCode: 200,
    headers,
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
