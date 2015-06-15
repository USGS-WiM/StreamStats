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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            function StudyAreaService($http, $q) {
                _super.call(this, $http, configuration.baseurls['StreamStats']);
                this.$q = $q;
                this._onSelectedStudyAreaChanged = new WiM.Event.Delegate();
                this._studyAreaList = [];
                this.canUpdate = true;
                this.doDelineateFlag = false;
            }
            Object.defineProperty(StudyAreaService.prototype, "onSelectedStudyAreaChanged", {
                get: function () {
                    return this._onSelectedStudyAreaChanged;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "StudyAreaList", {
                get: function () {
                    return this._studyAreaList;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StudyAreaService.prototype, "selectedStudyArea", {
                get: function () {
                    return this._selectedStudyArea;
                },
                set: function (val) {
                    if (!this.canUpdate)
                        return;
                    if (this._selectedStudyArea != val) {
                        this._selectedStudyArea = val;
                        this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
                    }
                },
                enumerable: true,
                configurable: true
            });
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            StudyAreaService.prototype.AddStudyArea = function (sa) {
                //add the study area to studyAreaList
                this.StudyAreaList.push(sa);
                this.selectedStudyArea = sa;
            };
            StudyAreaService.prototype.RemoveStudyArea = function () {
                //remove the study area to studyAreaList
            };
            StudyAreaService.prototype.loadStudyBoundary = function () {
                var _this = this;
                this.canUpdate = false;
                var url = configuration.queryparams['SSdelineation'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(), this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false);
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    _this.selectedStudyArea.Basin = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"][0].feature : null;
                    _this.selectedStudyArea.Pourpoint = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"][1].feature : null;
                    _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    //sm when complete
                }, function (error) {
                    //sm when error
                }).finally(function () {
                    _this.canUpdate = true;
                    _this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
                });
            };
            StudyAreaService.prototype.loadParameters = function (params) {
                var _this = this;
                if (params === void 0) { params = []; }
                this.canUpdate = false;
                if (!this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID)
                    return; //sm study area is incomplete
                var paramsToCalc = params.length < 1 ? this.selectedStudyArea.Parameters : params;
                if (paramsToCalc.length < 1)
                    return;
                var url = configuration.requests['SSparams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, paramsToCalc.map(function (param) {
                    param.code;
                }).join(';'));
                var request = new WiM.Services.Helpers.RequestInfo(url);
                this.Execute(request).then(function (response) {
                    var msg;
                    response.hasOwnProperty("parameters") ? _this.loadParameterResults(response["parameters"]) : [];
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                    _this.canUpdate = true;
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-       
            StudyAreaService.prototype.loadParameterResults = function (results) {
                for (var i = 0; i < results.length; i++) {
                    for (var j = 0; j < this.selectedStudyArea.Parameters.length; j++) {
                        if (results[i].code.toUpperCase().trim() === this.selectedStudyArea.Parameters[j].code.toUpperCase().trim()) {
                            this.selectedStudyArea.Parameters[j].value = results[i].value;
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