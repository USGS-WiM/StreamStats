//------------------------------------------------------------------------------
//----- Point ------------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//

//Comments
//08.20.2014 jkn - Created


//Imports"
///<reference path="../../WiM/Extensions/String.ts"/>
// Interface
module WiM.Models {
    export interface IPoint {
        Latitude: number;
        Longitude: number;
        crs: string;

    }
    interface IPointFn {
        new (): Point;
    }

    export class Point implements IPoint {
        //properties
        public Latitude: number;
        public Longitude: number;
        public crs: string;
        constructor(lat: number, long: number, crs: string) {
            this.Latitude = lat;
            this.Longitude = long;
            this.crs = crs;
        }

        public ToEsriString(): string {

            return "{" + "x:{0},y:{1}".format(this.Longitude.toString(), this.Latitude.toString()) + "}";
        }
        public static FromJson(json: Object): Point {
            var lat: number = json.hasOwnProperty("Latitude") ? json["Latitude"] : -9999;
            var long: number = json.hasOwnProperty("Longitude") ? json["Longitude"] : -9999;
            var wkid: string = json.hasOwnProperty("wkid") ? json["wkid"] : "---";

            return new Point(lat, long, wkid);
        }
    }//end class
}//end module