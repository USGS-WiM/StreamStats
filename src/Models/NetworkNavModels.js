//------------------------------------------------------------------------------
//----- Network Navigation ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        var NetworkNav = /** @class */ (function () {
            //Constructor
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
            //Methods
            NetworkNav.prototype.addLocation = function (name, pnt) {
                var _this = this;
                this._locations.push(pnt);
                //console.log('in add location:', name, pnt, this.navigationPointCount, this.navigationConfiguration);
                //delete point if already exists
                this.navigationConfiguration.reverse().forEach(function (config, index) {
                    if (config.name == name) {
                        console.log('found this point already, deleting:', _this.navigationConfiguration, index);
                        _this.navigationConfiguration.splice(index, 1);
                        _this.navigationPointCount -= 1;
                    }
                });
                //add point
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
                //console.log('navigationConfiguration:', this.navigationConfiguration)
                if (this._locations.length > this.minLocations)
                    this._locations.shift();
            };
            NetworkNav.prototype.getCountByType = function (object, text) {
                return object.filter(function (item) { return (item.valueType.toLowerCase().indexOf(text) >= 0); }).length;
            };
            return NetworkNav;
        }()); //end class
        Models.NetworkNav = NetworkNav;
        var NetworkPath = /** @class */ (function (_super) {
            __extends(NetworkPath, _super);
            //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/1.geojson?rcode=RRB&startpoint=[-94.311504,48.443681]&endpoint=[-94.349721,48.450215]&crs=4326
            //properties
            //Constructor
            function NetworkPath() {
                return _super.call(this, 2, 2) || this;
            }
            return NetworkPath;
        }(NetworkNav)); //end class
        Models.NetworkPath = NetworkPath;
        var FlowPath = /** @class */ (function (_super) {
            __extends(FlowPath, _super);
            //Constructor
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
                enumerable: true,
                configurable: true
            });
            return FlowPath;
        }(NetworkNav)); //end class
        Models.FlowPath = FlowPath;
        var NetworkTrace = /** @class */ (function (_super) {
            __extends(NetworkTrace, _super);
            //Constructor
            function NetworkTrace() {
                var _this = _super.call(this, 3, 1) || this;
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