import Stop from "./stop";
import PointLocation from "./pointLocation";

export default class Trip {
  private RTId: number;
  description: string;
  private userId: string;
  title: string;
  countries: Array<string>;
  private participants: Array<string>;
  titleImageUrl: string;
  days: number;
  published: boolean;
  price: number;
  highlights: Array<string>;
  stars: number;
  tags: Array<string>;
  offerEndPeriod: Date;
  offerStartPeriod: Date;
  offerWholeYear: boolean;
  createdAt: Date;
  private stopList: Array<Stop>;
  depatureDate: Date;
  transportProfile: string;
  origin: any;
  destination: any;
  returnDate: Date;
  travelClass: string;
  nonStop: boolean;
  rooms: number;
  adults: number;
  childrenAges: Array<number>;

  getRTId() {
    return this.RTId;
  }

  // constructor only takes neccessary values
  constructor(RTId, title, description, userId, timeStamp) {
    this.RTId = RTId;
    this.title = title;
    this.description = description;
    this.userId = userId;

    // will be overriten when editing
    this.countries = [];
    this.participants = [];
    this.titleImageUrl = "../assets/aircraft.svg";
    this.days = 0;

    // set default share values
    this.published = false;
    this.price = 0;
    this.highlights = [];
    this.stars = 3;
    this.tags = [];
    this.offerEndPeriod = new Date(timeStamp);
    this.offerStartPeriod = new Date(timeStamp);
    this.offerWholeYear = true;
    this.createdAt = new Date(timeStamp);
    this.stopList = [];

    // arrival departure default values
    this.depatureDate = new Date(timeStamp);
    this.transportProfile = "";
    this.origin = null;
    this.destination = null;
    this.returnDate = new Date(timeStamp);
    this.travelClass = "Economy";
    this.nonStop = true;
    this.rooms = 1;
    this.adults = 2;
    this.childrenAges = [];
  }

  /**
   * returns a simple object of all values set on this trip
   */
  toObject() {
    let stopListArray = [];
    this.stopList.forEach(stop => {
      stopListArray.push(stop.toObject());
    });

    return {
      RTId: this.RTId,
      description: this.description,
      userId: this.userId,
      title: this.title,
      countries: this.countries,
      participants: this.participants,
      titleImageUrl: this.titleImageUrl,
      days: this.days,
      published: this.published,
      price: this.price,
      highlights: this.highlights,
      stars: this.stars,
      tags: this.tags,
      offerEndPeriod: this.offerEndPeriod,
      offerStartPeriod: this.offerStartPeriod,
      offerWholeYear: this.offerWholeYear,
      createdAt: this.createdAt,
      stopList: stopListArray,
      depatureDate: this.depatureDate,
      transportProfile: this.transportProfile,
      origin: this.origin,
      destination: this.destination,
      returnDate: this.returnDate,
      travelClass: this.travelClass,
      nonStop: this.nonStop,
      rooms: this.rooms,
      adults: this.adults,
      childrenAges: this.childrenAges
    };
  }

  /**
   * sets the values to share a trip (when user publishes it)
   */
  setShareValues(
    price,
    published,
    highlights,
    stars,
    offerEndPeriod,
    offerStartPeriod,
    offerWholeYear,
    tags
  ) {
    this.price = price;
    this.published = published;
    this.highlights = highlights;
    this.stars = stars;
    this.offerEndPeriod = offerEndPeriod;
    this.offerStartPeriod = offerStartPeriod;
    this.offerWholeYear = offerWholeYear;
    this.tags = tags;
  }

  setArrivalDeparture(
    depatureDate,
    transportProfile,
    origin,
    destination,
    returnDate,
    travelClass,
    nonStop,
    rooms,
    adults,
    childrenAges
  ) {
    this.depatureDate = depatureDate;
    this.transportProfile = transportProfile;
    this.origin = origin;
    this.destination = destination;
    this.returnDate = returnDate;
    this.travelClass = travelClass;
    this.nonStop = nonStop;
    this.rooms = rooms;
    this.adults = adults;
    this.childrenAges = childrenAges;
  }

  /**
   * adds a default stop when stop list is empty
   * !important does nothing if there is already a stop
   */
  addFallbackStop(payloadDepartureDate, timeStamp) {
    if (this.stopList.length === 0) {
      let depatureDate = null;
      if (payloadDepartureDate) {
        const dateParts = payloadDepartureDate.split(".");
        depatureDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      }

      let stop = new Stop(
        0,
        depatureDate || new Date(timeStamp),
        1,
        new PointLocation("52.5170365", "13.3888599", "Berlin, 10117, Germany")
      );

      this.addStop(stop);
    }
  }

  getParticipants() {
    return this.participants;
  }

  getUserId() {
    return this.userId;
  }

  /**
   * sets a new stop list
   * @param {Stop[]} stopList
   */
  setStopList(stopList) {
    this.stopList = stopList;
  }

  /**
   * addst new stop to stop list
   * @param {Stop} stop
   */
  addStop(stop) {
    this.stopList.push(stop);
  }
}
