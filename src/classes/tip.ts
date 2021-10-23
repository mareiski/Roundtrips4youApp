import { date } from "quasar";
import PointLocation from "./pointLocation";

export default class Tip {
  title: string;
  creator: string;
  content: string;
  createdAt: Date | any;
  location: PointLocation;
  TipId: string;
  country: string;
  imageUrl: string;

  static fromObject(obj: any) {
    return new this(
      obj.title,
      obj.creator,
      obj.content,
      obj.createdAt,
      obj.imageUrl,
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
      this.location &&
      this.imageUrl
    );
  }

  constructor(
    title: string,
    creator: string,
    content: string,
    createdAt: Date,
    imageUrl: string,
    TipId: string,
    location?: object
  ) {
    this.title = title;
    this.creator = creator;
    this.content = content;
    this.createdAt = createdAt;
    this.imageUrl = imageUrl;

    if (location) {
      this.location = PointLocation.fromObject(location);

      if (this.location.label.includes(",")) {
        let locationParts = this.location.label.split(",");
        this.country = locationParts[locationParts.length - 1].substring(1);
      } else {
        this.country = this.location.label;
      }
    } else {
      this.country = "";
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
    if (!this.country) {
      if (this.location.label.includes(",")) {
        let locationParts = this.location.label.split(",");
        this.country = locationParts[locationParts.length - 1].substring(1);
      } else {
        this.country = this.location.label;
      }
    }

    return {
      title: this.title,
      creator: this.creator,
      content: this.content,
      createdAt: this.createdAt,
      location: this.location.toObject(),
      TipId: this.TipId,
      country: this.country,
      imageUrl: this.imageUrl
    };
  }
}
