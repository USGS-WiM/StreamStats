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
///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="../../bower_components/wim_angular/src/Models/Point.ts" />
///<reference path="../../bower_components/wim_angular/src/Services/HTTPServiceBase.ts" />
///<reference path="../../bower_components/wim_angular/src/Services/Helpers/RequestInfo.ts" />
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var StreamStatsService = (function (_super) {
            __extends(StreamStatsService, _super);
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StreamStatsService($http, $q) {
                _super.call(this, $http, configuration.requests['StreamStats']);
                this.$q = $q;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StreamStatsService.prototype.AddStudyBoundary = function () {
                var _this = this;
                var sa = this.SelectedStudyArea;
                var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(), sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false);
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
                    sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
                }, function (error) {
                    return _this.$q.reject(error.data);
                });
                this.SetSelectedStudy(sa);
            };
            StreamStatsService.prototype.AddStudyParameters = function () {
            };
            StreamStatsService.prototype.SetSelectedStudy = function (sa) {
                var saIndex = this.StudyAreaList.indexOf(sa);
                if (saIndex <= 0)
                    throw new Error("Study area not in collection");
                this.SelectedStudyArea = this.StudyAreaList[this.StudyAreaList.indexOf(sa)];
            };
            return StreamStatsService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new StreamStatsService($http, $q);
        }
        angular.module('WiM.Services').factory('WiM.Services.DelineationService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=RegionService.js.map