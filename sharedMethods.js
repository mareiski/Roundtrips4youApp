import { Notify } from "quasar";
const getAxios = () => import("axios");

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
