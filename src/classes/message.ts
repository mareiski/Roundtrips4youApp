import { date } from "quasar";

export default class Message {
  title: string;
  description: string;
  seen: boolean;
  icon: string;
  url: string;
  createdAt: Date | any;

  static fromObject(obj: any) {
    return new this(
      obj.title,
      obj.description,
      obj.icon,
      obj.url,
      obj.createdAt
    );
  }

  static createWelcomeMessage() {
    return new this(
      "Willkommen",
      "Herzlich Willkommen bei Roundtrips4you! <a href='/Home'>Erstelle jetzt gleich deine erste Reise.</a>",
      "celebration",
      "/Home",
      new Date(Date.now())
    );
  }

  getCreatedAtString(pattern: string) {
    let dateToConvert;
    if (this.createdAt instanceof Date) {
      dateToConvert = this.createdAt;
    } else {
      dateToConvert = new Date(this.createdAt.seconds * 1000);
    }

    return date.formatDate(dateToConvert, pattern);
  }

  constructor(
    title: string,
    description: string,
    icon: string,
    url: string,
    timeStamp: string | number | Date
  ) {
    this.title = title;
    this.description = description;
    this.seen = false;
    this.icon = icon;
    this.url = url;
    this.createdAt = new Date(timeStamp);
  }

  toObject() {
    return {
      title: this.title,
      description: this.description,
      seen: this.seen,
      icon: this.icon,
      url: this.url,
      createdAt: this.createdAt
    };
  }
}
