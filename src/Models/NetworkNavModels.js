var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var NetworkNav = (function () {
            function NetworkNav(methodtype, navigationInfo) {
                this.navigationID = methodtype;
                this.navigationInfo = navigationInfo;
                if (this.navigationInfo.configuration)
                    this.minLocations = this.getCountByType(this.navigationInfo.configuration, 'geojson point geometry');
                this.navigationConfiguration = [];
                this.navigationPointCount = 0;
                this._locations = [];
            }
            Object.defineProperty(NetworkNav.prototype, "locations", {
                get: function () {
                    return this._locations;
                },
                enumerable: false,
                configurable: true
            });
            NetworkNav.prototype.addLocation = function (name, pnt) {
                var _this = this;
                this._locations.push(pnt);
                this.navigationConfiguration.reverse().forEach(function (config, index) {
                    if (config.name == name) {
                        console.log('found this point already, deleting:', _this.navigationConfiguration, index);
                        _this.navigationConfiguration.splice(index, 1);
                        _this.navigationPointCount -= 1;
                    }
                });
                this.navigationPointCount += 1;
                this.navigationConfiguration.push({
                    "id": this.navigationPointCount,
                    "name": name,
                    "required": true,
                    "description": "Specified lat/long/crs  navigation start location",
                    "valueType": "geojson point geometry",
                    "value": {
                        "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                    }
                });
                if (this._locations.length > this.minLocations)
                    this._locations.shift();
            };
            NetworkNav.prototype.getCountByType = function (object, text) {
                return object.filter(function (item) { return (item.valueType.toLowerCase().indexOf(text) >= 0); }).length;
            };
            return NetworkNav;
        }());
        Models.NetworkNav = NetworkNav;
        var NetworkPath = (function (_super) {
            __extends(NetworkPath, _super);
            function NetworkPath() {
                return _super.call(this, 2, 2) || this;
            }
            return NetworkPath;
        }(NetworkNav));
        Models.NetworkPath = NetworkPath;
        var FlowPath = (function (_super) {
            __extends(FlowPath, _super);
            function FlowPath() {
                var _this = _super.call(this, 1, 1) || this;
                _this._workspaceID = '';
                return _this;
            }
            Object.defineProperty(FlowPath.prototype, "workspaceID", {
                get: function () {
                    return this._workspaceID;
                },
                set: function (val) {
                    this._workspaceID = val;
                },
                enumerable: false,
                configurable: true
            });
            return FlowPath;
        }(NetworkNav));
        Models.FlowPath = FlowPath;
        var NetworkTrace = (function (_super) {
            __extends(NetworkTrace, _super);
            function NetworkTrace() {
                var _this = _super.call(this, 3, 1) || this;
                _this.layerOptions = [{ name: "NHDFlowline", selected: true }, { name: "Gage", selected: false }, { name: "Dam", selected: false }];
                _this.DirectionOptions = ["Upstream", "Downstream"];
                _this.selectedDirectionType = _this.DirectionOptions[1];
                return _this;
            }
            return NetworkTrace;
        }(NetworkNav));
        Models.NetworkTrace = NetworkTrace;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
