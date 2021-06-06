export default class PointLocation {
  lat: Number;
  lng: Number;
  label: String;

  constructor(lat, lng, label) {
    this.lat = lat;
    this.lng = lng;
    this.label = label;
  }

  toObject() {
    return {
      lat: this.lat,
      lng: this.lng,
      label: this.label
    };
  }
}
