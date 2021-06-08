import pointLocation from "./pointLocation";
import Stop from "./stop";

export default class hotel extends Stop {
  bookingComLink: string;
  generalLink: string;
  expediaLink: string;
  hotelStars: number;
  hotelPrice: number;
  stopKind: string;

  constructor(
    stopId: number,
    startDate: Date,
    dayDuration: number,
    location: pointLocation,
    bookingComLink: string,
    generalLink: string,
    expediaLink: string,
    hotelStars: number,
    hotelPrice: number
  ) {
    super(stopId, startDate, dayDuration, location);

    this.bookingComLink = bookingComLink;
    this.generalLink = generalLink;
    this.expediaLink = expediaLink;
    this.hotelStars = hotelStars;
    this.hotelPrice = hotelPrice;

    this.stopKind = "hotel";
  }
}
