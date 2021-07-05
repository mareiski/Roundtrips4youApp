import lineIntersect from "@turf/line-intersect";
import nearestPoint from "@turf/nearest-point";
import turf from "turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";

import {
  FeatureCollection,
  Feature,
  LineString,
  GeoJsonProperties,
  MultiLineString,
  Point,
  Position
} from "geojson";
import PointLocation from "src/classes/pointLocation";
import booleanWithin from "@turf/boolean-within";

export default {
  /**
   * calculates a river route to given locations
   * @param startLocation
   * @param endLocation
   * @param riversArr
   * @param startRiverPoint
   * @param takenCoords
   * @param currentRiver
   * @returns a array of coordinates for a route
   */
  getRiverRoute(
    startLocation: PointLocation,
    endLocation: PointLocation,
    riverCollection: FeatureCollection<
      LineString | MultiLineString,
      GeoJsonProperties
    >[],
    takenCoords: Position[],
    startRiverPoint?: Feature<Point>,
    currentRiver?: Feature<LineString | MultiLineString, GeoJsonProperties>
  ) {
    if (!currentRiver) {
      // find the nearest river to start location
      currentRiver = this.getClosestRiver(startLocation, riverCollection, true);
    }

    if (!startRiverPoint) {
      //find the nearest point on the river to start location
      startRiverPoint = nearestPointOnLine(
        currentRiver,
        turf.point([startLocation.lng, startLocation.lat])
      );
    }

    // find the nearest point on the river to stop position
    let stopRiverPoint = nearestPointOnLine(
      currentRiver,
      turf.point([endLocation.lng, endLocation.lat])
    );

    let distanceToEndLocation = stopRiverPoint.properties.dist || 0;

    console.log(distanceToEndLocation);

    // check if distance from stop river point to end location is less than 2km
    if (Math.round(distanceToEndLocation) > 2) {
      let currentRiverBBox = turf.bbox(currentRiver);
      currentRiverBBox = turf.buffer(currentRiver, 0.2);
      // todo dget intersecing rivers with current river bbox +200m padding

      // we need to check if there are other rivers to get to end location
      let intersectingRivers: FeatureCollection<
        LineString | MultiLineString,
        GeoJsonProperties
      > = turf.featureCollection([]);

      riverCollection.forEach(collection => {
        collection.features.forEach(river => {
          if (
            river !== currentRiver &&
            lineIntersect(currentRiverBBox, river).features.length > 0
          ) {
            // push only if we didnt visit this coordinates yet
            let ableToPush = true;
            river.geometry.coordinates.forEach(coordinate => {
              if (
                takenCoords.some(
                  coord =>
                    coord[0] === coordinate[0] && coord[1] === coordinate[1]
                )
              ) {
                ableToPush = false;
              }
            });

            if (ableToPush) intersectingRivers.features.push(river);
          }
        });
      });

      console.log("====");
      console.log(currentRiver);

      // get best interscting river (closest to end location)
      if (intersectingRivers.features.length > 0) {
        let bestIntersectingRiver = this.getClosestRiver(
          endLocation,
          [intersectingRivers],
          false
        );

        let intersectingPoints = lineIntersect(
          currentRiverBBox,
          bestIntersectingRiver
        );

        // get closest intersecting point to end location
        let closestIntersectingPoint: Feature<Point> = nearestPoint(
          turf.point([endLocation.lng, endLocation.lat]),
          intersectingPoints
        );

        // ro prevent an infinite loop we check if this coordinates wasnt already added
        // we also abort if there are more then 300 coords
        if (
          !takenCoords.some(
            coord =>
              coord[0] === closestIntersectingPoint.geometry.coordinates[0] &&
              coord[1] === closestIntersectingPoint.geometry.coordinates[1]
          ) &&
          takenCoords.length < 300
        ) {
          // get route from start point to intersecting point
          let routeToIntersectingRiver = turf.lineSlice(
            startRiverPoint,
            closestIntersectingPoint,
            currentRiver
          );

          takenCoords.push.apply(
            takenCoords,
            this.revertRiver(
              currentRiver,
              startRiverPoint,
              routeToIntersectingRiver
            )
          );

          // restart method with intersecting point as start
          this.getRiverRoute(
            new PointLocation(
              closestIntersectingPoint.geometry.coordinates[1],
              closestIntersectingPoint.geometry.coordinates[0],
              "abc"
            ),
            endLocation,
            riverCollection,
            takenCoords,
            closestIntersectingPoint,
            bestIntersectingRiver
          );
        } else {
          console.log("else 1");
          let route = turf.lineSlice(
            startRiverPoint,
            stopRiverPoint,
            currentRiver
          );
          takenCoords.push.apply(
            takenCoords,
            this.revertRiver(currentRiver, startRiverPoint, route)
          );
        }
      } else {
        console.log("else 2");
        let route = turf.lineSlice(
          startRiverPoint,
          stopRiverPoint,
          currentRiver
        );
        takenCoords.push.apply(
          takenCoords,
          this.revertRiver(currentRiver, startRiverPoint, route)
        );
      }
    } else {
      console.log("else 3");

      if (startRiverPoint) {
        let route = turf.lineSlice(
          startRiverPoint,
          stopRiverPoint,
          currentRiver
        );

        takenCoords.push.apply(
          takenCoords,
          this.revertRiver(currentRiver, startRiverPoint, route)
        );
      }
    }

    // return all taken coords
    return takenCoords;
  },
  revertRiver(
    river: Feature<LineString | MultiLineString, GeoJsonProperties>,
    point: Feature<Point, GeoJsonProperties>,
    route: Feature<LineString, GeoJsonProperties>
  ) {
    let distanceToFirst;
    let distanceToLast;

    // get distance of current rivers 0 and last point to start point
    if (Array.isArray(river.geometry.coordinates[0][0])) {
      console.log(river.geometry.coordinates[0]);
      // multiline string
      distanceToFirst = turf.distance(point, river.geometry.coordinates[0][0]);

      let coordinatesLength = river.geometry.coordinates.length;

      distanceToLast = turf.distance(
        point,
        river.geometry.coordinates[coordinatesLength - 1][
          river.geometry.coordinates[coordinatesLength - 1].length - 1
        ]
      );
    } else {
      distanceToFirst = turf.distance(point, river.geometry.coordinates[0]);

      distanceToLast = turf.distance(
        point,
        river.geometry.coordinates[river.geometry.coordinates.length - 1]
      );
    }

    if (distanceToLast < distanceToFirst) {
      // revert route

      return route.geometry.coordinates.reverse();
    } else {
      return route.geometry.coordinates;
    }
  },
  getClosestRiver(
    location: PointLocation,
    riverArr: FeatureCollection<
      LineString | MultiLineString,
      GeoJsonProperties
    >[],
    checkIfInBBox: boolean
  ) {
    let distance = -1;
    let foundRiver: Feature<
      MultiLineString | LineString,
      GeoJsonProperties
    > = turf.lineString([
      [0, 0],
      [0, 0]
    ]);
    let point = turf.point([location.lng, location.lat]);

    riverArr.forEach(riverCollection => {
      riverCollection.features.forEach(river => {
        let bboxPolygon = turf.bboxPolygon(river.geometry.bbox);

        if (
          !checkIfInBBox ||
          !river.geometry.bbox ||
          booleanWithin(point, bboxPolygon)
        ) {
          let distanceToCheck = -1;
          let closestPoint;

          closestPoint = nearestPointOnLine(river, point);

          if (closestPoint.properties.dist) {
            distanceToCheck = closestPoint.properties.dist;
          }

          if (
            distanceToCheck !== -1 &&
            (distance === -1 || distanceToCheck < distance)
          ) {
            distance = distanceToCheck;
            foundRiver = river;
          }
        }
      });
    });

    return foundRiver;
  }
};
