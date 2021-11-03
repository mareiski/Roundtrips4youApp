import { Notify, date, scroll } from "quasar";
const { setScrollPosition, getScrollTarget } = scroll;

import axios from "axios";
import wiki from "wikijs";
import { Loader } from "@googlemaps/js-api-loader";
import Geonames from "geonames.js";

let cachedWikivoyageData = [];

export default {
  toolbar($q, uploadButton) {
    const bar = [
      [
        {
          label: $q.lang.editor.align,
          icon: $q.iconSet.editor.align,
          fixedLabel: true,
          list: "only-icons",
          options: ["left", "center", "right", "justify"]
        }
      ],
      ["bold", "italic", "underline", "subscript", "superscript"],
      ["token", "hr", "link", "fullscreen"],
      [
        {
          label: $q.lang.editor.formatting,
          icon: $q.iconSet.editor.formatting,
          list: "no-icons",
          options: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "code"]
        },
        {
          label: $q.lang.editor.fontSize,
          icon: $q.iconSet.editor.fontSize,
          fixedLabel: true,
          fixedIcon: true,
          list: "no-icons",
          options: [
            "size-1",
            "size-2",
            "size-3",
            "size-4",
            "size-5",
            "size-6",
            "size-7"
          ]
        },
        "removeFormat"
      ],
      ["quote", "unordered", "ordered"],
      ["undo", "redo"]
    ];

    if (uploadButton) {
      bar.push(["upload"]);
    }
    return bar;
  },
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
   * @returns a date from a date string in format dd.mm.yy MM:hh
   * @param {String} string date string to get date from
   */
  getDateFromString(string) {
    if (!string) return new Date();

    let dateParts;
    let timeParts = ["00", "00"];

    if (string.includes(" ")) {
      const dateTimeParts = string.split(" ");
      dateParts = dateTimeParts[0].split(".");
      timeParts = dateTimeParts[1].split(":");
    } else {
      dateParts = string.split(".");
    }
    return new Date(
      dateParts[2],
      dateParts[1] - 1,
      dateParts[0],
      timeParts[0],
      timeParts[1],
      "00"
    );
  },
  getRiverRoute(startLocation, endLocation) {
    return new Promise((resolve, reject) => {
      try {
        let url =
          "https://app.roundtrips4you.de/.netlify/functions/getRiverRoute?startLocation=" +
          JSON.stringify(startLocation) +
          "&endLocation=" +
          JSON.stringify(endLocation);

        let response = axios.get(url);
        resolve(response);
      } catch (e) {
        console.log(e);
        resolve(null);
      }
    });
  },
  /**
   * @returns a promise resoving country as a param
   */
  getCountryForLatLng(lat, lng) {
    return new Promise((resolve, reject) => {
      const geonames = Geonames({
        username: "roundtrips4you",
        lan: "de",
        encoding: "JSON"
      });

      resolve(geonames.countryCode({ lat: lat, lng: lng }));
    });
  },
  /**
   * @return a string date from given timestamp
   */
  getStringDateFromTimestamp(timestamp) {
    const timeStampDate = new Date(timestamp.seconds * 1000);
    return date.formatDate(timeStampDate, "DD.MM.YYYY HH:mm");
  },
  /**
   * @return a string date from given date
   */
  getFormattedDate(givenDate) {
    return date.formatDate(givenDate, "DD.MM.YYYY HH:mm");
  },
  /**
   * @returns a Date from timestamp
   */
  getDateFromTimeStamp(timestamp) {
    return new Date(timestamp.seconds * 1000);
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
   * get the best route for given stops
   * @param startStop which stop to start with (mandatory!)
   * @param endStop which stop to end (set startStop and endStop to the same for a roundtrip) optional
   */
  getBestRoute(stopList, startStop, endStop) {
    return new Promise(resolve => {
      const jobs = [];
      stopList.forEach((stop, index) => {
        if (
          stop.stopId !== startStop.stopId &&
          (!endStop || stop.stopId !== endStop.stopId)
        ) {
          jobs.push({
            id: index,
            location: [stop.location.lng, stop.location.lat],
            skills: [1]
          });
        }
      });

      let vehicles =
        '"vehicles":[{"id":1,"profile":"driving-car","start":[' +
        startStop.location.lng +
        "," +
        startStop.location.lat +
        '], "skills":[1,14]';

      if (endStop) {
        vehicles +=
          ', "end":[' + endStop.location.lng + "," + endStop.location.lat + "]";
      }

      vehicles += "}]";

      const body = '{"jobs":' + JSON.stringify(jobs) + ", " + vehicles + "}";

      // const body =
      //   '{"jobs":[{"id":1,"location":[1.98935,48.701],"skills":[1]},{"id":2,"service":300,"amount":[1],"location":[2.03655,48.61128],"skills":[1]},{"id":3,"service":300,"amount":[1],"location":[2.39719,49.07611],"skills":[2]},{"id":4,"service":300,"amount":[1],"location":[2.41808,49.22619],"skills":[2]},{"id":5,"service":300,"amount":[1],"location":[2.28325,48.5958],"skills":[14]},{"id":6,"service":300,"amount":[1],"location":[2.89357,48.90736],"skills":[14]}],"vehicles":[{"id":1,"profile":"driving-car","start":[2.35044,48.71764],"end":[2.35044,48.71764],"capacity":[4],"skills":[1,14],"time_window":[28800,43200]},{"id":2,"profile":"driving-car","start":[2.35044,48.71764],"end":[2.35044,48.71764],"capacity":[4],"skills":[2,14],"time_window":[28800,43200]}]}';

      const newStopList = [];

      console.log(body);

      axios
        .post(
          "https://api.openrouteservice.org/optimization",
          JSON.parse(body),
          {
            headers: {
              Accept:
                "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
              Authorization:
                "5b3ce3597851110001cf6248a1a70f8d612247f796b9dbbcf07910d7",
              "Content-Type": "application/json"
            }
          }
        )
        .then(response => {
          console.log(response.data.routes[0]);
          console.log(stopList);

          response.data.routes[0].steps.forEach((step, index) => {
            let stop;
            if (
              index === 0 ||
              index === response.data.routes[0].steps.length - 1
            ) {
              stop = stopList[index];
            } else if (step.id) {
              console.log(step.id);

              stop = stopList[step.id];
            }

            console.log(stop);
            if (stop) {
              newStopList.push(stop);
            }
          });

          resolve(newStopList);
        })
        .catch(e => {
          this.showErrorNotification("Route konnte nicht opitmiert werden");
          console.log(e);
          resolve(false);
        });
    });
  },
  /**
   * Scrolls to a element
   * @param refName element get via $refs
   */
  scrollToRef(el) {
    const target = getScrollTarget(el);
    const offset = el.offsetTop;
    setScrollPosition(target, offset, 400);
  },
  /**
   * get a wikivoyage image for given page name
   * @param {string} pageName
   */
  async getWikivoyageImage(pageName) {
    let index = cachedWikivoyageData.findIndex(x => x.title === pageName);
    if (index >= 0) {
      resolve(cachedWikivoyageData[index]);
    } else {
      await wiki({ apiUrl: "https://de.wikipedia.org/w/api.php" })
        .find(pageName)
        .then(page => {
          page.mainImage().then(mainImage => {
            resolve(mainImage);
          });
        })
        .catch(function(error) {
          console.log("Error " + error);
          resolve(null);
        });
    }
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
      axios.get(url).then(response => {
        resolve(response);
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
