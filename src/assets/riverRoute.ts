import lineIntersect from "@turf/line-intersect";
import nearestPoint from "@turf/nearest-point";
const turf = require("turf");
import nearestPointOnLine from "@turf/nearest-point-on-line";
import booleanIntersects from "@turf/boolean-intersects";

import {
  FeatureCollection,
  Feature,
  LineString,
  GeoJsonProperties,
  MultiLineString,
  Point,
  Position
} from "geojson";
import PointLocation from "../classes/pointLocation.ts";
import booleanWithin from "@turf/boolean-within";

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
function getRiverRoute(
  startLocation: InstanceType<typeof PointLocation>,
  endLocation: InstanceType<typeof PointLocation>,
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
    currentRiver = getClosestRiver(startLocation, riverCollection, true);
  }

  if (!startRiverPoint) {
    //find the nearest point on the river to start location
    // @ts-ignore
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

  // check if distance = require( stop river point to end location is less than 2km
  if (Math.round(distanceToEndLocation) > 2) {
    let currentRiverBBox = turf.bbox(currentRiver);
    // @ts-ignore
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
          booleanIntersects(currentRiverBBox, river)
        ) {
          // push only if we didnt visit this coordinates yet
          let ableToPush = true;
          river.geometry.coordinates.forEach(
            (coordinate: Position | Position[]) => {
              if (
                takenCoords.some(
                  coord =>
                    coord[0] === coordinate[0] && coord[1] === coordinate[1]
                )
              ) {
                ableToPush = false;
              }
            }
          );

          if (ableToPush) intersectingRivers.features.push(river);
        }
      });
    });

    // get best interscting river (closest to end location)
    if (intersectingRivers.features.length > 0) {
      let bestIntersectingRiver = getClosestRiver(
        endLocation,
        [intersectingRivers],
        false
      );
      console.log(bestIntersectingRiver);

      let intersectingPoints = lineIntersect(
        currentRiverBBox,
        bestIntersectingRiver
      );

      console.log(intersectingPoints);

      // get closest intersecting point to end location
      // @ts-ignore
      let closestIntersectingPoint: Feature<Point> = nearestPoint(
        turf.point([endLocation.lng, endLocation.lat]),
        intersectingPoints
      );

      // ro prevent an infinite loop we check if this coordinates wasnt already added
      // we also abort if there are more then 1000 coords
      if (
        !takenCoords.some(
          coord =>
            coord[0] === closestIntersectingPoint.geometry.coordinates[0] &&
            coord[1] === closestIntersectingPoint.geometry.coordinates[1]
        ) &&
        takenCoords.length < 1000 &&
        // @ts-ignore
        closestIntersectingPoint.properties.distanceToPoint <
          distanceToEndLocation * 3
      ) {
        // get route = require( start point to intersecting point
        let routeToIntersectingRiver = turf.lineSlice(
          // @ts-ignore
          startRiverPoint,
          closestIntersectingPoint,
          currentRiver
        );

        takenCoords.push.apply(
          takenCoords,
          revertRiver(
            currentRiver,
            // @ts-ignore
            startRiverPoint,
            routeToIntersectingRiver
          )
        );

        // restart method with intersecting point as start
        getRiverRoute(
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
      } else if (startRiverPoint && stopRiverPoint) {
        console.log("else1");

        let route = turf.lineSlice(
          startRiverPoint,

          // @ts-ignore
          stopRiverPoint,
          currentRiver
        );

        takenCoords.push.apply(
          takenCoords,
          revertRiver(currentRiver, startRiverPoint, route)
        );
      }
    } else if (startRiverPoint && stopRiverPoint) {
      console.log("else2");

      let route = turf.lineSlice(
        startRiverPoint,
        // @ts-ignore
        stopRiverPoint,
        currentRiver
      );
      takenCoords.push.apply(
        takenCoords,
        revertRiver(currentRiver, startRiverPoint, route)
      );
    }
  } else if (startRiverPoint && stopRiverPoint) {
    console.log("else3");
    let route = turf.lineSlice(
      startRiverPoint,
      // @ts-ignore
      stopRiverPoint,
      currentRiver
    );

    takenCoords.push.apply(
      takenCoords,
      revertRiver(currentRiver, startRiverPoint, route)
    );
  }

  // return all taken coords
  return takenCoords;
}

function revertRiver(
  river: Feature<LineString | MultiLineString, GeoJsonProperties>,
  point: Feature<Point, GeoJsonProperties>,
  route: Feature<LineString, GeoJsonProperties>
) {
  let distanceToFirst;
  let distanceToLast;

  // get distance of current rivers 0 and last point to start point
  if (Array.isArray(river.geometry.coordinates[0][0])) {
    // multiline string
    // @ts-ignore
    distanceToFirst = turf.distance(point, river.geometry.coordinates[0][0]);

    let coordinatesLength = river.geometry.coordinates.length;

    distanceToLast = turf.distance(
      point,
      // @ts-ignore
      river.geometry.coordinates[coordinatesLength - 1][
        river.geometry.coordinates[coordinatesLength - 1].length - 1
      ]
    );
  } else {
    // @ts-ignore
    distanceToFirst = turf.distance(point, river.geometry.coordinates[0]);

    distanceToLast = turf.distance(
      point,
      // @ts-ignore
      river.geometry.coordinates[river.geometry.coordinates.length - 1]
    );
  }

  if (distanceToLast < distanceToFirst) {
    // revert route
    return route.geometry.coordinates.reverse();
  } else {
    return route.geometry.coordinates;
  }
}

function getClosestRiver(
  location: InstanceType<typeof PointLocation>,
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
      let within = false;
      let bbox;
      if (river.geometry.bbox) {
        bbox = river.geometry.bbox;
      } else {
        // @ts-ignore
        bbox = turf.bbox(turf.multiPoint(river.geometry.coordinates[0]));
      }

      if (checkIfInBBox) {
        // @ts-ignore
        let bboxPolygon = turf.bboxPolygon(bbox);
        bboxPolygon = turf.buffer(bboxPolygon, 5);
        within = booleanWithin(point, bboxPolygon);
      } else {
        // @ts-ignore
        let bboxPolygon = turf.bboxPolygon(bbox);

        // we create a very big polygon (max km a route can take)
        bboxPolygon = turf.buffer(bboxPolygon, 900);
        within = booleanWithin(point, bboxPolygon);
      }

      if (!bbox || within) {
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

  if (foundRiver.geometry.type === "MultiLineString") {
    // @ts-ignore
    foundRiver = turf.lineString(foundRiver.geometry.coordinates[0]);
  }
  return foundRiver;
}

function getLocks(
  route: LineString,
  riverCollection: FeatureCollection<
    LineString | MultiLineString,
    GeoJsonProperties
  >
) {
  let locks = getFeaturesByProperty("fclass", "weir", riverCollection);

  let locksOnRoute: Feature<
    LineString | MultiLineString,
    GeoJsonProperties
  >[] = [];
  locks.forEach(lock => {
    if (booleanIntersects(route, lock)) {
      locksOnRoute.push(lock);
    }
  });

  return locksOnRoute;
}

function getFeaturesByProperty(
  key: string,
  value: string,
  riverCollection: FeatureCollection<
    LineString | MultiLineString,
    GeoJsonProperties
  >
) {
  return riverCollection.features.filter(function(feature) {
    if (feature.properties !== null && feature.properties[key] === value) {
      return true;
    } else {
      return false;
    }
  });
}

export { getLocks, getFeaturesByProperty, getRiverRoute };
