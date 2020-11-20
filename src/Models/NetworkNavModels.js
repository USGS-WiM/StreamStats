//------------------------------------------------------------------------------
//----- Network Navigation ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
                enumerable: true,
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
        })();
        Models.NetworkNav = NetworkNav;
        var NetworkPath = (function (_super) {
            __extends(NetworkPath, _super);
            function NetworkPath() {
                _super.call(this, 2, 2);
            }
            return NetworkPath;
        })(NetworkNav);
        Models.NetworkPath = NetworkPath;
        var FlowPath = (function (_super) {
            __extends(FlowPath, _super);
            function FlowPath() {
                _super.call(this, 1, 1);
                this._workspaceID = '';
            }
            Object.defineProperty(FlowPath.prototype, "workspaceID", {
                get: function () {
                    return this._workspaceID;
                },
                set: function (val) {
                    this._workspaceID = val;
                },
                enumerable: true,
                configurable: true
            });
            return FlowPath;
        })(NetworkNav);
        Models.FlowPath = FlowPath;
        var NetworkTrace = (function (_super) {
            __extends(NetworkTrace, _super);
            function NetworkTrace() {
                _super.call(this, 3, 1);
                this.layerOptions = [{ name: "NHDFlowline", selected: true }, { name: "Gage", selected: false }, { name: "Dam", selected: false }];
                this.DirectionOptions = ["Upstream", "Downstream"];
                this.selectedDirectionType = this.DirectionOptions[1];
            }
            return NetworkTrace;
        })(NetworkNav);
        Models.NetworkTrace = NetworkTrace;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {}));
