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
var WiM;
(function (WiM) {
    var Models;
    (function (Models) {
        var TimeSeries;
        (function (_TimeSeries) {
            var TimeSeries = (function () {
                // Constructor
                function TimeSeries() {
                }
                TimeSeries.FromJSON = function (jsn) {
                    var ts = new TimeSeries();
                    ts.Name = jsn.hasOwnProperty("Name") ? jsn["Name"] : null;
                    ts.SeriesID = jsn.hasOwnProperty("SeriesID") ? jsn["SeriesID"] : null;
                    ts.SeriesDescription = jsn.hasOwnProperty("SeriesDescription") ? jsn["SeriesDescription"] : null;
                    ts.ValueMax = jsn.hasOwnProperty("ValueMax") ? jsn["ValueMax"] : null;
                    ts.ValueMin = jsn.hasOwnProperty("ValueMin") ? jsn["ValueMin"] : null;
                    ts.StartDate = jsn.hasOwnProperty("StartDate") ? new Date(jsn["StartDate"]) : null;
                    ts.EndDate = jsn.hasOwnProperty("EndDate") ? new Date(jsn["EndDate"]) : null;
                    ts.ValueUnits = jsn.hasOwnProperty("ValueUnits") ? jsn["ValueUnits"] : null;
                    var obs = jsn.hasOwnProperty("Observations") ? jsn["Observations"] : null;
                    if (obs != null) {
                        ts.Observations = [];
                        obs.forEach(function (p) { return ts.Observations.push(TimeSeriesObservation.FromJSON(p)); });
                    }
                    return ts;
                };
                return TimeSeries;
            })();
            var TimeSeriesObservation = (function () {
                function TimeSeriesObservation(d, v, c) {
                    this.Date = d;
                    this.Value = v;
                    this.Code = c;
                }
                TimeSeriesObservation.FromJSON = function (jsn) {
                    var date = jsn.hasOwnProperty("Date") ? new Date(jsn["Date"]) : null;
                    var value = jsn.hasOwnProperty("Value") ? jsn["Value"] : -9999;
                    var dc = jsn.hasOwnProperty("DataCode") ? jsn["DataCode"] : null;
                    return new TimeSeriesObservation(date, value, dc);
                };
                return TimeSeriesObservation;
            })(); //end class
        })(TimeSeries = Models.TimeSeries || (Models.TimeSeries = {}));
    })(Models = WiM.Models || (WiM.Models = {}));
})(WiM || (WiM = {})); //end module
//# sourceMappingURL=TimeSeries.js.map