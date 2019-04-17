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
// Interface
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var CoordinatedReach = /** @class */ (function () {
            function CoordinatedReach(name, id) {
                this._name = "Coordinated Reach: " + name;
                this._id = id;
                this._flowCoefficients = {};
            }
            Object.defineProperty(CoordinatedReach.prototype, "FlowCoefficients", {
                get: function () {
                    return this._flowCoefficients;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "Name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "ID", {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            CoordinatedReach.prototype.AddFlowCoefficient = function (code, aCoeff, bCoeff) {
                if (this._flowCoefficients[code] === null)
                    return;
                this._flowCoefficients[code] = { CoefficientA: aCoeff, CoefficientB: bCoeff };
            };
            CoordinatedReach.prototype.Execute = function (parameters) {
                try {
                    var result = [];
                    for (var key in this.FlowCoefficients) {
                        if (this.FlowCoefficients.hasOwnProperty(key)) {
                            var item = this.FlowCoefficients[key];
                            result.push({
                                Code: key,
                                Description: this.getDescription(key),
                                Name: this.getName(key),
                                Unit: { Unit: "cubic feet per second", Abbr: "ft^3/s" },
                                Value: this.getValue(item, parameters[0].value)
                            });
                        } //end if
                    } //next item
                    var params = [];
                    params.push({
                        Code: parameters[0].code,
                        Value: parameters[0].value,
                        Name: parameters[0].name,
                        UnitType: { Abbr: parameters[0].unit, Unit: parameters[0].unit }
                    });
                    //http://www.in.gov/dnr/water/4898.htm
                    for (var key in this.FlowCoefficients) {
                        params.push({
                            Code: key + "CoeffA",
                            Value: this.FlowCoefficients[key].CoefficientA.toFixed(3),
                            Name: key + " CoefficientA",
                            UnitType: { Abbr: "dim", Unit: "dimensionless" }
                        });
                        params.push({
                            Code: key + "CoeffB",
                            Value: this.FlowCoefficients[key].CoefficientB.toFixed(3),
                            Name: key + " CoefficientB",
                            UnitType: { Abbr: "dim", Unit: "dimensionless" }
                        });
                    } //next key
                    var ssg = {
                        ID: 0,
                        Name: this.Name,
                        Code: this.ID,
                        Parameters: params,
                        Results: result
                    };
                    return ssg;
                }
                catch (e) {
                    return null;
                }
            };
            CoordinatedReach.prototype.getDescription = function (key) {
                var result = "";
                switch (key) {
                    case "PK10":
                        result = "10";
                        break;
                    case "PK25":
                        result = "25";
                        break;
                    case "PK50":
                        result = "50";
                        break;
                    case "PK100":
                        result = "100";
                        break;
                    case "PK200":
                        result = "200";
                        break;
                    case "PK500":
                        result = "500";
                        break;
                    default: result = "undefined";
                }
                return "Maximum instantaneous flow that occurs on average once in {0} years".format(result);
            };
            CoordinatedReach.prototype.getName = function (key) {
                var result = "";
                switch (key) {
                    case "PK10":
                        result = "10";
                        break;
                    case "PK25":
                        result = "25";
                        break;
                    case "PK50":
                        result = "50";
                        break;
                    case "PK100":
                        result = "100";
                        break;
                    case "PK200":
                        result = "200";
                        break;
                    case "PK500":
                        result = "500";
                        break;
                    default: result = "undefined";
                }
                return "{0} year Peak Flood".format(result);
            };
            CoordinatedReach.prototype.getValue = function (item, drnArea) {
                //compute flow = acoeff*DRNArea^bcoeff
                try {
                    if (!item.CoefficientA || !item.CoefficientB || !drnArea)
                        return null;
                    return item.CoefficientA * Math.pow(drnArea, item.CoefficientB); //** is equivalent to Math.pow
                }
                catch (e) {
                    return null;
                }
            };
            return CoordinatedReach;
        }()); //end class
        Models.CoordinatedReach = CoordinatedReach;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=CoordinatedReach.js.map