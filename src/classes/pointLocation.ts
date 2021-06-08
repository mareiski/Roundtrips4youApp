export default class PointLocation {
  lat: number;
  lng: number;
  label: string;

  static fromObject(obj: any) {
    return new this(obj.lat, obj.lng, obj.label);
  }

  constructor(lat: number, lng: number, label: string) {
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

  asStrings() {
    return {
      lat: this.lat.toString(),
      lng: this.lng.toString(),
      label: this.label
    };
  }
}
