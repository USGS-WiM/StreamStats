//------------------------------------------------------------------------------
//----- Station ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Represents the FDCTM model
//          
//discussion:
//

//Comments
//09.14.2014 jkn - Created


//Imports"
///<reference path="../TimeSeries/Timeseries.ts"/>
// Class
module StreamStats.Models.Station {
    export class Station {
        //Properties
        public StationID: string;
        public Name: string;
        public DrainageArea_sqMI: number;
        public Latitude_DD: number;
        public Longitude_DD: number;
        public Discharge: StreamStats.Models.TimeSeries;
        public URL: string;

        // Constructor
        constructor(id: string) {
            this.StationID = id;
            this.URL = "http://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=" + id;
        }

        public static FromJSON(jsn: Object): Station {
            var rg = new Station("");

            rg.StationID = jsn.hasOwnProperty("StationID") ? jsn["StationID"] : null;
            rg.Name = jsn.hasOwnProperty("Name") ? jsn["Name"] : null;
            rg.DrainageArea_sqMI = jsn.hasOwnProperty("DrainageArea_sqMI") ? jsn["DrainageArea_sqMI"] : null;
            rg.Latitude_DD = jsn.hasOwnProperty("Latitude_DD") ? jsn["Latitude_DD"] : null;
            rg.Longitude_DD = jsn.hasOwnProperty("Longitude_DD") ? jsn["Longitude_DD"] : null;
            rg.URL = jsn.hasOwnProperty("URL") ? jsn["URL"] : null;

            rg.Discharge = jsn.hasOwnProperty("Discharge") ? TimeSeries.FromJSON(jsn["Discharge"]) : null;

            return rg;
        }
    }

    export class CorrelatedStation extends Station {
        //Properties
        public Correlation: number;

        // Constructor
        constructor(id: string) {
            super(id);
        }

        public static FromJSON(jsn: Object): CorrelatedStation {
            var rg = new CorrelatedStation("");

            rg.StationID = jsn.hasOwnProperty("ID") ? jsn["ID"] : null;
            rg.Name = jsn.hasOwnProperty("Name") ? jsn["Name"] : null;
            rg.DrainageArea_sqMI = jsn.hasOwnProperty("DrainageArea") ? jsn["DrainageArea"] : null;
            rg.Correlation = jsn.hasOwnProperty("Correlation") ? jsn["Correlation"] : null;

            return rg;
        }

    }
}//end module