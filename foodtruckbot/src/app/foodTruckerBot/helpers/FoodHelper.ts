import axios from 'axios';
import * as debug from "debug";
import MapHelper from './MapHelper';

const log = debug("msteams");

const getFoodTruckLocationDataUrl = "https://data.sfgov.org/resource/rqzj-sfat.json?status=APPROVED";

const baseAtlastQuery = "https://atlas.microsoft.com/search/address/json?api-version=1.0&view=Auto&subscription-key="+process.env.ATLAS_API_KEY+"&radius=800&countrySet=US&idxSet=PAD&query=";
const sfPostFix = "%20San%Fransico%CA";
const emptyLatLon = { lat: null, lon: null , id: null, distance: Infinity};

class FoodHelper {
    static truckLocationsDummyCache = [{ lat: null, lon: null , id: null, distance: Infinity, objectid: "",applicant: null, fooditems: "", address: null, latitude: null, longitude: null}];
    static async convertStreetAddressToCoord(streetAddress: string){
        try {
            let response = await axios.get(baseAtlastQuery + streetAddress + sfPostFix);
            if(response.data){
                if(response.data.results){
                    if(response.data.results.length > 0){
                        // filter based on the type of location
                        let filteredLocations = response.data.results.filter(r => r.type === "Point Address");
                        // select the location with the highest accuracy estimate
                        let maxScore = Math.max.apply(Math, filteredLocations.map(function(o){return o.score;}));
                        let location = filteredLocations.find(function(o){ return o.score == maxScore; });
                        return {lat: location.position.lat, lon: location.position.lon, id: location.id, distance: Infinity};
                    }
                }
            }
            return emptyLatLon;
        } catch (exception) {
            log("Encoutered an error while trying to look up the lat and lon of the street adress.");
            return emptyLatLon;
        }
    }
    static async getClosestFoodTrucksToCoord(searchLocation: LocationJSON, radius = 0.4){
        if(searchLocation.lat != undefined && searchLocation.lon != undefined && searchLocation.id != undefined){
            //TODO: need to load this into a cache instead of reaching to API all the time
            let response = await axios.get(getFoodTruckLocationDataUrl);
            FoodHelper.truckLocationsDummyCache[0].id !== null ? FoodHelper.truckLocationsDummyCache : FoodHelper.truckLocationsDummyCache = response.data; // this will act as a "cache" until a proper cache can be implemented
            return await response.data
                .map(t => MapHelper.getDistanceBetweenPoints(searchLocation,{lat: Number.parseFloat(t.latitude), lon:Number.parseFloat(t.longitude), id:t.objectid, distance: Infinity}))
                .filter(truck => truck.distance < radius);;
        }
    }
    static getTruckLocationCache(){ return FoodHelper.truckLocationsDummyCache; }
    static async updateTruckLocationCache(){
        let response = await axios.get(getFoodTruckLocationDataUrl);
        if(response.data !== undefined){
            if(response.data.length > 0){
                FoodHelper.truckLocationsDummyCache = response.data;
            }
        }
    }
    // This function will bump out the search radius until it gets at least 5 trucks
    static async getClosestAndValidateEnoughLocations(coordinates: LocationJSON, radius = 0.4){
        let trucks = await FoodHelper.getClosestFoodTrucksToCoord(coordinates,radius);
        if(trucks.length >= 5){
            return trucks;
        } else {
            return await FoodHelper.getClosestAndValidateEnoughLocations(coordinates,radius+0.3);
        }
    }
}

interface LocationJSON {
    lat: number;
    lon: number;
    id: string;
    distance: number;
}

export default FoodHelper;