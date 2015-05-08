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
        var StudyAreaService = (function (_super) {
            __extends(StudyAreaService, _super);
            //Properties
            //-+-+-+-+-+-+-+-+-+-+-+-
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StudyAreaService($http, $q) {
                _super.call(this, $http, configuration['StreamStats']);
                this.$q = $q;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StudyAreaService.prototype.loadStudyBoundary = function (sa) {
                var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(), sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false);
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
                    sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
                    //sm when complete
                }, function (error) {
                    //sm when complete
                });
            };
            StudyAreaService.prototype.loadParameters = function (sa, params) {
                var _this = this;
                if (params === void 0) { params = []; }
                if (!sa.WorkspaceID || !sa.RegionID)
                    return; //sm study area is incomplete
                var paramsToCalc = params.length < 1 ? sa.Parameters : params;
                if (paramsToCalc.length < 1)
                    return;
                var url = configuration.requests['SSparams'].format(sa.RegionID, sa.WorkspaceID, paramsToCalc.map(function (param) {
                    param.code;
                }).join(';'));
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    var msg;
                    response.hasOwnProperty("parameters") ? _this.loadParameterResults(response["parameters"], sa) : [];
                    //sm when complete
                }, function (error) {
                    //sm when complete
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-       
            StudyAreaService.prototype.loadParameterResults = function (results, sa) {
                for (var i = 0; i < results.length; i++) {
                    for (var j = 0; j < sa.Parameters.length; j++) {
                        if (results[i].code.toUpperCase().trim() === sa.Parameters[j].code.toUpperCase().trim()) {
                            sa.Parameters[j].value = results[i].value;
                            break;
                        } //endif
                    }
                }
            };
            return StudyAreaService;
        })(WiM.Services.HTTPServiceBase); //end class
        factory.$inject = ['$http', '$q'];
        function factory($http, $q) {
            return new StudyAreaService($http, $q);
        }
        angular.module('StreamStats.Services').factory('StreamStats.Services.StudyAreaService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {})); //end module
//# sourceMappingURL=StudyAreaService.js.map