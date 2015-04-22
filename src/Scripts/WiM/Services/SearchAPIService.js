//http://txpub.usgs.gov/DSS/search_api/1.0/dataService/dataService.ashx/search?term=05454500&state=%25&topN=100&LATmin=-90&LATmax=90&LONmin=-180&LONmax=180&includeGNIS=true&includeState=true&includeUsgsSiteSW=true&includeUsgsSiteGW=true&includeUsgsSiteSP=false&includeUsgsSiteAT=false&includeUsgsSiteOT=false&includeZIPcodes=true&includeAREAcodes=true&useCommonGnisClasses=false
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
var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        'use strict';
        var SearchLocation = (function () {
            function SearchLocation(nm, ct, st, lat, long) {
                this.Name = nm;
                this.Category = ct;
                this.State = st;
                this.Latitude = lat;
                this.Longitude = long;
                this.crs = "4326";
            }
            return SearchLocation;
        })();
        Services.SearchLocation = SearchLocation;
        var SearchAPIService = (function (_super) {
            __extends(SearchAPIService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function SearchAPIService($http, $q) {
                _super.call(this, $http, configuration.baseurls['SearchAPI']);
                this.$q = $q;
                this.init();
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SearchAPIService.prototype.getLocations = function (searchTerm) {
                var _this = this;
                var request = new WiM.Services.Helpers.RequestInfo("/search");
                request.params = {
                    term: searchTerm,
                    includeGNIS: this.includeGNIS,
                    useCommonGnisClasses: this.useCommonGnisClasses,
                    includeUsgsSiteSW: this.includeUsgsSiteSW,
                    includeUsgsSiteGW: this.includeUsgsSiteGW,
                    includeUsgsSiteSP: this.includeUsgsSiteSP,
                    includeUsgsSiteAT: this.includeUsgsSiteAT,
                    includeUsgsSiteOT: this.includeUsgsSiteOT,
                    includeZIPcodes: this.includeZIPcodes,
                    includeAREAcodes: this.includeAREAcodes,
                    includeState: this.includeState,
                    topN: this.topN,
                    debug: this.debug
                };
                return this.Execute(request).then(function (response) {
                    return response.data.map(function (item) {
                        return new SearchLocation(item.nm, item.ct, item.st, item.y, item.x);
                    });
                }, function (error) {
                    return _this.$q.reject(error.data);
                });
            };
            //HelperMethods
            //-+-+-+-+-+-+-+-+-+-+-+-
            SearchAPIService.prototype.init = function () {
                this.includeGNIS = true;
                this.useCommonGnisClasses = true;
                this.includeUsgsSiteSW = true;
                this.includeUsgsSiteGW = true;
                this.includeUsgsSiteSP = true;
                this.includeUsgsSiteAT = true;
                this.includeUsgsSiteOT = true;
                this.includeZIPcodes = true;
                this.includeAREAcodes = true;
                this.includeState = true;
                this.topN = 100;
                this.debug = false;
            };
            return SearchAPIService;
        })(Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new SearchAPIService($http, $q);
        }
        angular.module('WiM.Services').factory('WiM.Services.SearchAPIService', factory);
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {})); //end module 
//# sourceMappingURL=SearchAPIService.js.map