//------------------------------------------------------------------------------
//----- Timeseries ---------------------------------------------------------------
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
module WiM.Models.TimeSeries {
    interface ITimeSeries {
        Name: string;
        SeriesID: number;
        SeriesDescription: number;
        ValueMax: number;
        ValueMin: number;
        StartDate: Date;
        EndDate: Date;
        ValueUnits: string;
    }

    class TimeSeries implements ITimeSeries {
        //Properties
        public Name: string;
        public SeriesID: number;
        public SeriesDescription: number;
        public ValueMax: number;
        public ValueMin: number;
        public StartDate: Date;
        public EndDate: Date;
        public ValueUnits: string;
        //Collections & Dictionaries
        public Observations: Array<TimeSeriesObservation>
        // Constructor
        constructor() { }

        public static FromJSON(jsn: Object): TimeSeries {
            var ts = new TimeSeries()
            ts.Name = jsn.hasOwnProperty("Name") ? jsn["Name"] : null;
            ts.SeriesID = jsn.hasOwnProperty("SeriesID") ? jsn["SeriesID"] : null;
            ts.SeriesDescription = jsn.hasOwnProperty("SeriesDescription") ? jsn["SeriesDescription"] : null;
            ts.ValueMax = jsn.hasOwnProperty("ValueMax") ? jsn["ValueMax"] : null;
            ts.ValueMin = jsn.hasOwnProperty("ValueMin") ? jsn["ValueMin"] : null;
            ts.StartDate = jsn.hasOwnProperty("StartDate") ? new Date(jsn["StartDate"]) : null;
            ts.EndDate = jsn.hasOwnProperty("EndDate") ? new Date(jsn["EndDate"]) : null;
            ts.ValueUnits = jsn.hasOwnProperty("ValueUnits") ? jsn["ValueUnits"] : null;

            var obs: Array<Object> = jsn.hasOwnProperty("Observations") ? jsn["Observations"] : null;

            if (obs != null) {
                ts.Observations = [];
                obs.forEach(p=> ts.Observations.push(TimeSeriesObservation.FromJSON(p)));
            }

            return ts;
        }
    }

    class TimeSeriesObservation {
        //Properties
        public Date: Date;
        public Value: number;
        public Code: string;

        constructor(d: Date, v: number, c: string) {
            this.Date = d;
            this.Value = v;
            this.Code = c;
        }

        public static FromJSON(jsn: Object): TimeSeriesObservation {
            var date: Date = jsn.hasOwnProperty("Date") ? new Date(jsn["Date"]) : null;
            var value: number = jsn.hasOwnProperty("Value") ? jsn["Value"] : -9999;
            var dc: string = jsn.hasOwnProperty("DataCode") ? jsn["DataCode"] : null;
            return new TimeSeriesObservation(date, value, dc);
        }
    }//end class
}//end module
