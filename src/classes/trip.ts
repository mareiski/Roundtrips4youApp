import Stop from "./stop";
import PointLocation from "./pointLocation";
import { date } from "quasar";

export default class Trip {
  private TripId: number;
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
  createdAt: Date | any;
  stopList: Array<Stop>;
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
  startDate: Date;

  getTripId() {
    return this.TripId;
  }

  /**
   * @param pattern format of the date like "DD.MM.YYYY HH:mm"
   * @returns created at timestemp as a string
   */
  getCreatedAtString(pattern: string) {
    let dateToConvert;
    if (this.createdAt instanceof Date) {
      dateToConvert = this.createdAt;
    } else {
      dateToConvert = new Date(this.createdAt.seconds * 1000);
    }

    return date.formatDate(dateToConvert, pattern);
  }

  static fromObject(obj: any) {
    // create trip object
    let trip = new this(
      obj.TripId,
      obj.title,
      obj.description,
      obj.userId,
      obj.createdAt
    );

    // override all values (also share, arrival departure etc)
    trip.overrideFromObject(obj);

    return trip;
  }

  // constructor only takes neccessary values
  constructor(
    TripId: number,
    title: string,
    description: string,
    userId: string,
    timeStamp: string | number | Date
  ) {
    this.TripId = TripId;
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
    this.startDate = new Date(timeStamp);
    this.stopList = [];

    // arrival departure default values
    this.depatureDate = new Date(timeStamp);
    this.transportProfile = "driving";
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
   *  override all values with those from the given object
   */
  overrideFromObject(obj: any) {
    this.TripId = obj.TripId;
    this.description = obj.description;
    this.userId = obj.userId;
    this.title = obj.title;
    this.countries = obj.countries;
    this.participants = obj.participants;
    this.titleImageUrl = obj.titleImageUrl;
    this.days = obj.days;
    this.published = obj.published;
    this.price = obj.price;
    this.highlights = obj.highlights;
    this.stars = obj.stars;
    this.tags = obj.tags;
    this.offerEndPeriod = obj.offerEndPeriod;
    this.offerStartPeriod = obj.offerStartPeriod;
    this.offerWholeYear = obj.offerWholeYear;
    this.createdAt = obj.createdAt;
    this.depatureDate = obj.depatureDate;
    this.transportProfile = obj.transportProfile;
    this.origin = obj.origin;
    this.destination = obj.destination;
    this.returnDate = obj.returnDate;
    this.travelClass = obj.travelClass;
    this.nonStop = obj.nonStop;
    this.rooms = obj.rooms;
    this.adults = obj.adults;
    this.childrenAges = obj.childrenAges;
    this.startDate = obj.startDAte;

    this.stopList = [];

    obj.stopList.forEach((stop: any) => {
      this.stopList.push(Stop.fromDBObject(stop));
    });
  }

  /**
   * @returns a simple object of all values set on this trip
   */
  toObject() {
    let stopListArray: {
      stopId: number;
      dayDuration: number;
      location: { lat: Number; lng: Number; label: String };
      title: string;
      notes: string;
      images: string[];
      stopKind: string;
    }[] = [];

    this.stopList.forEach(stop => {
      stopListArray.push(stop.toObject());
    });
    return {
      TripId: this.TripId,
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
      childrenAges: this.childrenAges,
      startDate: this.startDate
    };
  }

  /**
   * sets the values to share a trip (when user publishes it)
   */
  setShareValues(
    price: number,
    published: boolean,
    highlights: string[],
    stars: number,
    offerEndPeriod: Date,
    offerStartPeriod: Date,
    offerWholeYear: boolean,
    tags: string[]
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
    depatureDate: Date,
    transportProfile: string,
    origin: any,
    destination: any,
    returnDate: Date,
    travelClass: string,
    nonStop: boolean,
    rooms: number,
    adults: number,
    childrenAges: number[]
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
  addFallbackStop(payloadDepartureDate: string) {
    if (this.stopList.length === 0) {
      let depatureDate = null;
      if (payloadDepartureDate) {
        const dateParts = payloadDepartureDate.split(".");
        depatureDate = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );
      }

      let stop = new Stop(
        0,
        1,
        new PointLocation(52.5170365, 13.3888599, "Berlin, 10117, Germany")
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

  getStopList() {
    return this.stopList;
  }

  /**
   * sets a new stop list
   * @param {Stop[]} stopList
   */
  setStopList(stopList: Stop[]) {
    this.stopList = stopList;
  }

  /**
   * adds new stop to stop list
   * @param {Stop} stop
   */
  addStop(stop: Stop) {
    this.stopList.push(stop);
  }

  /**
   * updates stop with given object
   */
  updateStop(stop: Stop) {
    let index = this.stopList.findIndex(
      x => x.getStopId() === stop.getStopId()
    );
    if (index >= 0) this.stopList.splice(index, 1, stop);
  }

  /**
   * removes stop for given id
   */
  removeStop(stopId: number) {
    let index = this.stopList.findIndex(x => x.getStopId() === stopId);
    if (index >= 0) this.stopList.splice(index, 1);
  }
}
