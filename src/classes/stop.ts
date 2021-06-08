import PointLocation from "./pointLocation";

export default class Stop {
  private stopId: number;
  startDate: Date;
  dayDuration: number;
  location: PointLocation;
  title: string;
  notes: string;
  images: Array<string>;
  stopKind: string;

  /**
   * @returns new stop created from a object
   */
  static fromDBObject(obj: any) {
    return new this(
      obj.stopId,
      obj.startDate,
      obj.dayDuration,
      PointLocation.fromObject(obj.location)
    );
  }

  /**
   * @param obj
   * must contain stop id, start date, day duration and location
   */
  constructor(
    stopId: number,
    startDate: Date,
    dayDuration: number,
    location: PointLocation
  ) {
    this.stopId = stopId;
    this.startDate = startDate;
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

    this.notes = "Notizen zu diesem Stopp";
    this.images = [];

    this.stopKind = "stop";
  }

  getStopId() {
    return this.stopId;
  }

  toObject() {
    return {
      stopId: this.stopId,
      startDate: this.startDate,
      dayDuration: this.dayDuration,
      location: this.location.toObject(),
      title: this.title,
      notes: this.notes,
      images: this.images,
      stopKind: this.stopKind
    };
  }
}
