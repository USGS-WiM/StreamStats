//------------------------------------------------------------------------------
//----- Table ---------------------------------------------------------------
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
// Class
var WiM;
(function (WiM) {
    var Models;
    (function (Models) {
        var Parameter = (function () {
            // Constructor
            function Parameter(n, v, c, d, u, limit) {
                this.name = n;
                this.value = v;
                this.code = c;
                this.unit = u;
                this.description = d;
                this.limits = limit;
            } //end constructor
            Parameter.FromJSON = function (obj) {
                var name = obj.hasOwnProperty("name") ? obj["name"] : "---";
                var descr = obj.hasOwnProperty("description") ? obj["description"] : "---";
                var code = obj.hasOwnProperty("code") ? obj["code"] : "---";
                var unit = obj.hasOwnProperty("unit") ? obj["unit"] : "---";
                var value = obj.hasOwnProperty("value") ? obj["value"] : -999;
                var limit = obj.hasOwnProperty("limits") && obj["limits"] != null ? Limit.FromJSON(obj["limits"]) : null;
                return new Parameter(name, value, code, descr, unit, limit);
            }; //end FromJSON
            return Parameter;
        })(); //end class
        // Class
        var Limit = (function () {
            // Constructor
            function Limit(min, max) {
                this.min = min;
                this.max = max;
            }
            Limit.FromJSON = function (obj) {
                var min = obj.hasOwnProperty("min") ? obj["min"] : -999;
                var max = obj.hasOwnProperty("max") ? obj["max"] : -999;
                return new Limit(min, max);
            }; //end FromJSON
            return Limit;
        })(); //end class
    })(Models = WiM.Models || (WiM.Models = {}));
})(WiM || (WiM = {})); //end module
//# sourceMappingURL=Parameter.js.map