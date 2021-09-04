import { date } from "quasar";
import PointLocation from "./pointLocation";

export default class Tip {
  title: string;
  creator: number;
  content: string;
  createdAt: Date | any;
  location: PointLocation;
  TipId: string;

  static fromObject(obj: any) {
    return new this(
      obj.title,
      obj.creator,
      obj.content,
      obj.createdAt,
      obj.TipId,
      obj.location
    );
  }

  valid() {
    return (
      this.title &&
      this.creator &&
      this.content.length >= 50 &&
      this.createdAt &&
      this.location
    );
  }

  constructor(
    title: string,
    creator: number,
    content: string,
    createdAt: Date,
    TipId?: string,
    location?: object
  ) {
    this.title = title;
    this.creator = creator;
    this.content = content;
    this.createdAt = createdAt;

    if (location) {
      this.location = PointLocation.fromObject(location);
    } else {
      this.location = new PointLocation(0, 0, "");
    }

    if (TipId) {
      this.TipId = TipId;
    } else {
      this.TipId = "";
    }
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

  toObject() {
    return {
      title: this.title,
      creator: this.creator,
      content: this.content,
      createdAt: this.createdAt,
      location: this.location.toObject(),
      TipId: this.TipId
    };
  }
}
