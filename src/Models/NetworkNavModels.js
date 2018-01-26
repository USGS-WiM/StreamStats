//------------------------------------------------------------------------------
//----- Network Navigation ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose: hold relative information for network navigation tools 
//          
//discussion:
//   FINDPATHBETWEENPOINTS = 1,
//   FINDPATH2OUTLET = 2,3
//   GETNETWORKREPORT = 4
//Comments
//07.06.2016 jkn - Created
// Class
var StreamStats;
(function (StreamStats) {
    var Models;
    (function (Models) {
        var NetworkNav = (function () {
            //Constructor
            function NetworkNav(methodtype, navigationInfo, totalPointCount, totalOptionsCount) {
                this.navigationID = methodtype;
                this.navigationInfo = navigationInfo;
                this.minLocations = totalPointCount;
                this.navigationConfiguration = [];
                this.optionsCount = totalOptionsCount;
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
            //Methods
            NetworkNav.prototype.addLocation = function (pnt) {
                this._locations.push(pnt);
                this.navigationPointCount += 1;
                console.log('in add location:', pnt, this.navigationPointCount);
                //replace configuration item with new point
                this.navigationInfo.configuration.forEach(function (item) {
                });
                if (this.navigationPointCount === 1) {
                    this.navigationConfiguration.push({
                        "id": 1,
                        "name": "Start point location",
                        "required": true,
                        "description": "Specified lat/long/crs  navigation start location",
                        "valueType": "geojson point geometry",
                        "value": {
                            "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                        }
                    });
                }
                if (this.navigationPointCount === 2) {
                    this.navigationConfiguration.push({
                        "id": this.navigationPointCount,
                        "name": "End point location",
                        "required": true,
                        "description": "Specified lat/long/crs  navigation end location",
                        "valueType": "geojson point geometry",
                        "value": {
                            "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                        }
                    });
                }
                console.log('navigationConfiguration:', this.navigationConfiguration);
                if (this._locations.length > this.minLocations)
                    this._locations.shift();
            };
            return NetworkNav;
        }()); //end class
        Models.NetworkNav = NetworkNav;
        var NetworkPath = (function (_super) {
            __extends(NetworkPath, _super);
            //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/1.geojson?rcode=RRB&startpoint=[-94.311504,48.443681]&endpoint=[-94.349721,48.450215]&crs=4326
            //properties
            //Constructor
            function NetworkPath() {
                return _super.call(this, 2, 2, 0, 1) || this;
            }
            return NetworkPath;
        }(NetworkNav)); //end class
        Models.NetworkPath = NetworkPath;
        var FlowPath = (function (_super) {
            __extends(FlowPath, _super);
            //Constructor
            function FlowPath() {
                var _this = _super.call(this, 1, 1, 1, 1) || this;
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
                enumerable: true,
                configurable: true
            });
            return FlowPath;
        }(NetworkNav)); //end class
        Models.FlowPath = FlowPath;
        var NetworkTrace = (function (_super) {
            __extends(NetworkTrace, _super);
            //Constructor
            function NetworkTrace() {
                var _this = _super.call(this, 3, 1, 4, 1) || this;
                //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/4.geojson?rcode=RRB&startpoint=[-94.719923,48.47219]&crs=4326&direction=Upstream&layers=NHDFlowline
                //properties
                _this.layerOptions = [{ name: "NHDFlowline", selected: true }, { name: "Gage", selected: false }, { name: "Dam", selected: false }];
                _this.DirectionOptions = ["Upstream", "Downstream"];
                _this.selectedDirectionType = _this.DirectionOptions[1];
                return _this;
            }
            return NetworkTrace;
        }(NetworkNav)); //end class
        Models.NetworkTrace = NetworkTrace;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {})); //end namespace
//# sourceMappingURL=NetworkNavModels.js.map