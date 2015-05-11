//------------------------------------------------------------------------------
//----- RegionService -----------------------------------------------------
//------------------------------------------------------------------------------
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the Controller.
//          
//discussion:
//
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//03.26.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var Region = (function () {
            function Region() {
            }
            return Region;
        })();
        Services.Region = Region; //end class
        var RegionService = (function (_super) {
            __extends(RegionService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function RegionService($http, $q) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$q = $q;
                this._onSelectedRegionChanged = new WiM.Event.Delegate();
                this.regionList = [];
            }
            Object.defineProperty(RegionService.prototype, "onSelectedRegionChanged", {
                get: function () {
                    return this._onSelectedRegionChanged;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RegionService.prototype, "selectedRegion", {
                get: function () {
                    return this._selectedRegion;
                },
                set: function (val) {
                    if (this._selectedRegion != val) {
                        this._selectedRegion = val;
                        this._onSelectedRegionChanged.raise(null, WiM.Event.EventArgs.Empty);
                    }
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            RegionService.prototype.loadRegionListByExtent = function (xmin, xmax, ymin, ymax, sr) {
                var _this = this;
                if (sr === void 0) { sr = 4326; }
                //    clear List
                this.regionList.length = 0; //clear array
                var input = {
                    f: 'json',
                    geometry: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                    tolerance: 2,
                    returnGeometry: false,
                    mapExtent: { "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax, "spatialReference": { "wkid": sr } },
                    imageDisplay: "1647, 457,96",
                    geometryType: "esriGeometryEnvelope",
                    sr: sr,
                    layers: "all: 4"
                };
                var request = new WiM.Services.Helpers.RequestInfo(configuration.queryparams['regionService'], 0 /* GET */, 'json');
                request.params = input;
                this.Execute(request).then(function (response) {
                    response.data.results.map(function (item) {
                        var region = _this.getRegion(item.attributes.st_abbr);
                        if (region != null)
                            _this.regionList.push(region);
                    });
                }, function (error) {
                    return _this.$q.reject(error.data);
                });
            };
            RegionService.prototype.loadRegionListByRegion = function (regionid) {
                this.regionList.length = 0; //clear array;
                var selectedRegion = this.getRegion(regionid);
                if (selectedRegion == null)
                    return false;
                this.regionList.push(selectedRegion);
                return true;
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            RegionService.prototype.getRegion = function (lookupID) {
                var regionArray = configuration.regions;
                try {
                    for (var i = 0; i < regionArray.length; i++) {
                        if (regionArray[i].Name.toUpperCase().trim() === lookupID.toUpperCase().trim() || regionArray[i].RegionID.toUpperCase().trim() === lookupID.toUpperCase().trim())
                            return regionArray[i];
                    }
                    return null;
                }
                catch (e) {
                    return null;
                }
            };
            return RegionService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new RegionService($http, $q);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.RegionService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=RegionService.js.map