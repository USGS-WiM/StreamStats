//------------------------------------------------------------------------------
//----- DelineationService -----------------------------------------------------
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
//https://docs.angularjs.org/api/ng/service/$http
//Comments
//03.26.2015 jkn - Created
//Import
///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="../Scripts/WiM/Models/Point.ts" />
///<reference path="../Scripts/WiM/Services/HTTPServiceBase.ts" />
///<reference path="../Scripts/WiM/Services/Helpers/RequestInfo.ts" />
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var StreamStatsService = (function (_super) {
            __extends(StreamStatsService, _super);
            //Properties
            //-+-+-+-+-+-+-+-+-+-+-+-
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StreamStatsService($http, $q) {
                _super.call(this, $http, configuration.requests['StreamStats']);
                this.$q = $q;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StreamStatsService.prototype.getRegionList = function (point) {
                return this.Execute(null);
            };
            return StreamStatsService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new StreamStatsService($http, $q);
        }
        angular.module('StreamStats.Services ').factory('StreamStats.Services.StreamStatsService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=StreamStatsService.js.map