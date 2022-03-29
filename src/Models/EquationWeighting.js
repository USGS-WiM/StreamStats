var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var EquationWeighting = (function () {
            function EquationWeighting(Name, Unit) {
                this._name = Name;
                this._unit = Unit;
            }
            Object.defineProperty(EquationWeighting.prototype, "unit", {
                get: function () {
                    return this._unit;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(EquationWeighting.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: false,
                configurable: true
            });
            EquationWeighting.prototype.Execute = function () {
                return 'test';
            };
            return EquationWeighting;
        }());
        Models.EquationWeighting = EquationWeighting;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
