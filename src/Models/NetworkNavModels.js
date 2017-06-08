//------------------------------------------------------------------------------
//----- Network Navigation ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
            function NetworkNav(modelID, maxLocations) {
                this.requiredLocationLength = maxLocations;
                this.ModelType = modelID;
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
                if (this._locations.length > this.requiredLocationLength)
                    this._locations.shift();
            };
            return NetworkNav;
        }()); //end class
        var PathBetweenPoints = (function (_super) {
            __extends(PathBetweenPoints, _super);
            //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/1.geojson?rcode=RRB&startpoint=[-94.311504,48.443681]&endpoint=[-94.349721,48.450215]&crs=4326
            //properties
            //Constructor
            function PathBetweenPoints() {
                return _super.call(this, 1, 2) || this;
            }
            return PathBetweenPoints;
        }(NetworkNav)); //end class
        Models.PathBetweenPoints = PathBetweenPoints;
        var Path2Outlet = (function (_super) {
            __extends(Path2Outlet, _super);
            //Constructor
            function Path2Outlet() {
                var _this = _super.call(this, 2, 1) || this;
                _this._workspaceID = '';
                return _this;
            }
            Object.defineProperty(Path2Outlet.prototype, "workspaceID", {
                get: function () {
                    return this._workspaceID;
                },
                set: function (val) {
                    this._workspaceID = val;
                },
                enumerable: true,
                configurable: true
            });
            return Path2Outlet;
        }(NetworkNav)); //end class
        Models.Path2Outlet = Path2Outlet;
        var NetworkReport = (function (_super) {
            __extends(NetworkReport, _super);
            //Constructor
            function NetworkReport() {
                var _this = _super.call(this, 3, 1) || this;
                //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/4.geojson?rcode=RRB&startpoint=[-94.719923,48.47219]&crs=4326&direction=Upstream&layers=NHDFlowline
                //properties
                _this.layerOptions = [{ name: "NHDFlowline", selected: true }, { name: "Gage", selected: false }, { name: "Dam", selected: false }];
                _this.DirectionOptions = ["Upstream", "Downstream"];
                _this.selectedDirectionType = _this.DirectionOptions[1];
                return _this;
            }
            return NetworkReport;
        }(NetworkNav)); //end class
        Models.NetworkReport = NetworkReport;
    })(Models = StreamStats.Models || (StreamStats.Models = {}));
})(StreamStats || (StreamStats = {})); //end namespace
//# sourceMappingURL=NetworkNavModels.js.map