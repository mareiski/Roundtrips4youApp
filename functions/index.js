const functions = require("firebase-functions");

exports.scheduledFunctionCrontab = functions.pubsub
  .schedule("5 11 * * *")
  .timeZone("Europe/Berlin")
  .onRun(context => {
    console.log("This will be run every day at 11:05 AM Eastern!");

    //    axios.get(
    //      "https://roundtrips4you.de/.netlify/functions/sendMessage?token=" +
    //        payload.token +
    //        "&message=" +
    //        JSON.stringify(payload.message)
    //    );
    return null;
  });
