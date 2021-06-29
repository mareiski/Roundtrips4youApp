import { Notify } from "quasar";
const getAxios = () => import("axios");
import wiki from "wikijs";
import { Loader } from "@googlemaps/js-api-loader";

let cachedWikivoyageData = [];

export default {
  /**
   * Display a quasar notify error message
   */
  showErrorNotification(message) {
    Notify.create({
      color: "red-5",
      textColor: "white",
      icon: "error",
      message: message
    });
  },
  /**
   * Display a quasar notify success message
   */
  showSuccessNotification(message) {
    Notify.create({
      color: "green-4",
      textColor: "white",
      icon: "check_circle",
      message: message
    });
  },
  /**
   * creates a string from milliseconds (fontmat: 5h 10min)
   * @param duration the milliseconds to format
   */
  msToTime(duration) {
    var ms = duration % 1000;
    duration = (duration - ms) / 1000;

    var secs = duration % 60;
    duration = (duration - secs) / 60;

    var minutes = duration % 60;
    duration = (duration - minutes) / 60;

    var hours = duration % 24;
    duration = (duration - hours) / 24;

    var days = duration % 24;

    let returnVal = "";
    if (days === 0 && hours === 0 && minutes === 0) returnVal = 0;
    else if (days < 0 || hours < 0 || minutes < 0) returnVal = null;

    if (days && days > 0) returnVal += days + " Tag(e) ";
    if (hours && hours > 0) returnVal += hours + "h ";
    if (minutes && minutes > 0) returnVal += minutes + "min";

    return returnVal;
  },
  /**
   * gets a parent component
   * @param {String} name name of the parent to get
   */
  getParent(name, context) {
    let p = context.$parent;
    while (typeof p !== "undefined") {
      if (p.$options.name === name) {
        return p;
      } else {
        p = p.$parent;
      }
    }
    return false;
  },
  /**
   * gets data from wikivoyage/wikipedia for a given page name
   * @param {string} pageName the page name to get data from
   * @returns {object} object that contains mainImage, shortDescription, description and imgSrcs for the given page
   */
  getWikivoyageData(pageName) {
    let returnData = {};
    let promiseList = [];

    // check if we have cached data

    return new Promise((resolve, reject) => {
      let index = cachedWikivoyageData.findIndex(x => x.title === pageName);
      if (index >= 0) {
        resolve(cachedWikivoyageData[index]);
      } else {
        returnData.title = pageName;

        wiki({ apiUrl: "https://de.wikipedia.org/w/api.php" })
          .find(pageName)
          .then(page => {
            promiseList.push(
              page.categories().then(categories => {
                let category = categories[1].split("Kategorie:")[1];
                returnData.shortDescription = category;
              }),
              page.summary().then(summary => {
                returnData.description = summary;
              }),
              page.mainImage().then(mainImage => {
                returnData.mainImage = mainImage;
              }),
              page.images().then(images => {
                returnData.imgSrcs = images;
              })
            );

            Promise.all(promiseList)
              .then(() => {
                let returnImgs = [];
                returnData.imgSrcs.forEach((image, index) => {
                  // add only if not svg
                  if (image.match(/\.(jpeg|jpg|png)$/)) returnImgs.push(image);
                  if (index === returnData.imgSrcs.length - 1) {
                    returnData.imgSrcs = returnImgs;

                    // cache data
                    cachedWikivoyageData.push(returnData);

                    resolve(returnData);
                  }
                });
              })
              .catch(function(error) {
                console.log("Error " + error);
                resolve(null);
              });
          });
      }
    });
  },
  getGooglePlacesData(lat, lng, context) {
    let key = context.$store.getters["api/getGooglePlacesKey"];
    return new Promise(resolve => {
      const loader = new Loader({
        apiKey: key,
        version: "weekly",
        libraries: ["places"]
      });

      // google is available here
      loader.load().then(() => {
        // eslint-disable-next-line no-undef
        let map = new google.maps.Map(document.createElement("div"), {});

        // eslint-disable-next-line no-undef
        let service = new google.maps.places.PlacesService(map);

        let request = {
          radius: 5000,
          language: "de",
          type: "tourist_attraction",
          location: { lat: parseFloat(lat), lng: parseFloat(lng) }
        };

        service.nearbySearch(request, response => {
          let returnDataArr = [];

          response.forEach(poi => {
            let returnData = {};
            returnData.name = poi.name;
            returnData.photoUrl = poi.photos
              ? poi.photos[0].getUrl()
              : "/statics/dummy-image-landscape-1-150x150.jpg";
            returnData.placeId = poi.place_id;
            returnData.rating = poi.rating;
            returnData.totalRatings = poi.user_ratings_total;
            returnData.location = poi.geometry.location;
            returnData.location.lat = returnData.location.lat();
            returnData.location.lng = returnData.location.lng();
            returnData.nowOpen = poi.opening_hours
              ? poi.opening_hours.open_now
              : false;

            returnData.location.label = poi.vicinity;
            returnData.tags = poi.types;

            returnDataArr.push(returnData);
          });

          resolve(returnDataArr);
        });
      });
    });
  },
  /**
   * makes a new request to given url
   */
  requestURL(url) {
    return new Promise(resolve => {
      getAxios().then(axios => {
        axios.get(url).then(response => {
          resolve(response);
        });
      });
    });
  },
  /**
   * checks if string is a url
   */
  validURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  },
  /**
   * @returns if mail is valid
   */
  validEmail(mailToCheck) {
    let reg = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
    );
    return !!reg.test(mailToCheck);
  }
};
