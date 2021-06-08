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
    return !!reg.test();
  }
};
