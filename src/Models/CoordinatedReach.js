var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var CoordinatedReach = (function () {
            function CoordinatedReach(basinName, eqID, streamName, streamID) {
                this._label = "Coordinated Reach - Stream ID: " + streamID + ", Stream Name: " + streamName + ", Basin Name: " + basinName;
                this._basinName = basinName;
                this._eqID = eqID;
                this._streamName = streamName;
                this._streamID = streamID;
                this._flowCoefficients = {};
            }
            Object.defineProperty(CoordinatedReach.prototype, "FlowCoefficients", {
                get: function () {
                    return this._flowCoefficients;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "basinName", {
                get: function () {
                    return this._basinName;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "eqID", {
                get: function () {
                    return this._eqID;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "streamID", {
                get: function () {
                    return this._streamID;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "streamName", {
                get: function () {
                    return this._streamName;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(CoordinatedReach.prototype, "label", {
                get: function () {
                    return this._label;
                },
                enumerable: false,
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
                        code: parameters[0].code,
                        value: parameters[0].value,
                        name: parameters[0].name,
                        unitType: { abbr: parameters[0].unit, unit: parameters[0].unit }
                    });
                    for (var key in this.FlowCoefficients) {
                        params.push({
                            code: key + "CoeffA",
                            value: Number(this.FlowCoefficients[key].CoefficientA).toFixed(3),
                            name: key + " CoefficientA",
                            unitType: { abbr: "dim", unit: "dimensionless" }
                        });
                        params.push({
                            code: key + "CoeffB",
                            value: Number(this.FlowCoefficients[key].CoefficientB).toFixed(3),
                            name: key + " CoefficientB",
                            unitType: { abbr: "dim", unit: "dimensionless" }
                        });
                    }
                    var ssg = {
                        id: 0,
                        name: this.label,
                        code: this.eqID,
                        parameters: params,
                        results: result
                    };
                    return ssg;
                }
                catch (e) {
                    console.log(e);
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
