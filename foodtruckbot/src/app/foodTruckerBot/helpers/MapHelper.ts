import * as debug from "debug";

const log = debug("msteams");

const earthRadius = 3956; // in miles

class MapHelper {
    static convertDegreeToRadian(degrees: number){ return degrees * (Math.PI / 180); }
    static calculateGreatCircleDistance(xCoord: LocationJSON, yCoord: LocationJSON){
        const xlonRadians = MapHelper.convertDegreeToRadian(xCoord.lon);
        const ylonRadians = MapHelper.convertDegreeToRadian(yCoord.lon);
        const xlatRadians = MapHelper.convertDegreeToRadian(xCoord.lat);
        const ylatRadians = MapHelper.convertDegreeToRadian(yCoord.lat);

        const deltaLon = ylonRadians - xlonRadians;
        const deltaLat = ylatRadians - xlatRadians;
        let a =  Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(xlatRadians) * Math.cos(ylatRadians) * Math.pow(Math.sin(deltaLon / 2),2);
        let c = 2 * Math.asin(Math.sqrt(a));
        yCoord.distance = (c * earthRadius);
        return yCoord;
    }
    static getDistanceBetweenPoints(xLocation: LocationJSON, yLocation: LocationJSON){
        return MapHelper.calculateGreatCircleDistance(xLocation, yLocation);
    }
}

interface LocationJSON {
    lat: number;
    lon: number;
    id: string;
    distance: number;
}

export default MapHelper;