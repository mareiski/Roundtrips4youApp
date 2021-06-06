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

  constructor(stopId, startDate, dayDuration, location) {
    this.stopId = stopId;
    this.startDate = startDate;
    this.dayDuration = dayDuration;
    this.location = location;

    // set title to same name as location
    if (location && location.label) {
      if (location.label.includes(",")) {
        this.title = location.label.split(",")[0];
      } else {
        this.title = location.label;
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
