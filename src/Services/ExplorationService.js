//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
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
//             the ViewModel.
//          
//discussion:
//
//Comments
//04.15.2015 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var ExplorationService = (function (_super) {
            __extends(ExplorationService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function ExplorationService($http, $q, toaster) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$q = $q;
                this.toaster = toaster;
                this.drawElevationProfile = false;
                this.drawMeasurement = false;
                this.measurementData = '';
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationService.prototype.elevationProfile = function (esriJSON) {
                var _this = this;
                var url = 'http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute';
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 1 /* POST */, 'json', { InputLineFeatures: esriJSON, returnZ: true, f: 'json' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                //do ajax call for future precip layer, needs to happen even if only runoff value is needed for this region
                this.Execute(request).then(function (response) {
                    console.log('elevation profile response: ', response.data);
                    var coords = response.data.results[0].value.features[0].geometry.paths[0];
                    if (coords.length > 0) {
                        _this.elevationProfileGeoJSON = {
                            "name": "NewFeatureType",
                            "type": "FeatureCollection",
                            "features": [
                                { "type": "Feature", "geometry": { "type": "LineString", "coordinates": coords }, "properties": "" }
                            ]
                        };
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            return ExplorationService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q', 'toaster'];
        function factory($http, $q, toaster) {
            return new ExplorationService($http, $q, toaster);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.ExplorationService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationService.js.map