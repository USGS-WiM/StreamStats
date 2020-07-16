var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var CoordinatedReach = (function () {
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
                                code: key,
                                description: this.getDescription(key),
                                name: this.getName(key),
                                unit: { unit: "cubic feet per second", abbr: "ft^3/s" },
                                value: this.getValue(item, parameters[0].value)
                            });
                        }
                    }
                    var params = [];
                    params.push({
                        Code: parameters[0].code,
                        Value: parameters[0].value,
                        Name: parameters[0].name,
                        UnitType: { Abbr: parameters[0].unit, Unit: parameters[0].unit }
                    });
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
                    }
                    var ssg = {
                        id: 0,
                        name: this.Name,
                        code: this.ID,
                        parameters: params,
                        results: result
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
                try {
                    if (!item.CoefficientA || !item.CoefficientB || !drnArea)
                        return null;
                    return item.CoefficientA * Math.pow(drnArea, item.CoefficientB);
                }
                catch (e) {
                    return null;
                }
            };
            return CoordinatedReach;
        }());
        Models.CoordinatedReach = CoordinatedReach;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
