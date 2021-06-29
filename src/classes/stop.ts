import PointLocation from "./pointLocation";

export default class Stop {
  private stopId: number;
  dayDuration: number;
  location: PointLocation;
  title: string;
  notes: string;
  images: Array<string>;
  stopKind: string;
  profile: string;
  children: Array<Stop>;

  /**
   * @returns new stop created from a object
   */
  static fromDBObject(obj: any) {
    let stop = new this(
      obj.stopId,
      obj.dayDuration,
      PointLocation.fromObject(obj.location)
    );

    stop.title = obj.title;
    stop.notes = obj.notes;
    stop.images = obj.images;
    stop.stopKind = obj.stopKind;
    stop.profile = obj.profile;
    stop.children = obj.children;

    return stop;
  }

  /**
   * @param obj
   * must contain stop id, start date, day duration and location
   */
  constructor(stopId: number, dayDuration: number, location: PointLocation) {
    this.stopId = stopId;
    this.dayDuration = dayDuration;
    this.location = location;

    // set title to same name as location
    if (this.location && this.location.label) {
      if (this.location.label.includes(",")) {
        this.title = this.location.label.split(",")[0];
      } else {
        this.title = this.location.label;
      }
    } else {
      this.title = "1. Stopp";
    }

    this.notes = "";
    this.images = [];

    this.stopKind = "stop";
    this.profile = "driving";
    this.children = [];
  }

  getStopId() {
    return this.stopId;
  }

  toObject() {
    return {
      stopId: this.stopId,
      dayDuration: this.dayDuration,
      location: this.location.toObject(),
      title: this.title,
      notes: this.notes,
      images: this.images,
      stopKind: this.stopKind,
      profile: this.profile,
      children: this.children
    };
  }
}
