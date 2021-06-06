import Stop from "./stop";

export default class hotel extends Stop {
  bookingComLink: String;
  generalLink: String;
  expediaLink: String;
  hotelStars: Number;
  hotelPrice: Number;
  stopKind: String;

  constructor(
    stopId,
    startDate,
    dayDuration,
    location,
    bookingComLink,
    generalLink,
    expediaLink,
    hotelStars,
    hotelPrice
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
