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
                this.parametersLoaded = false;
                this.parametersLoading = false;
                this.doDelineateFlag = false;
                this.studyAreaParameterList = [];
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
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(), this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    _this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                    _this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    //sm when complete
                }, function (error) {
                    //sm when error
                }).finally(function () {
                    _this.canUpdate = true;
                    _this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
                });
            };
            StudyAreaService.prototype.loadParameters = function () {
                var _this = this;
                console.log('in load parameters');
                //this.canUpdate = false;
                this.parametersLoading = true;
                this.parametersLoaded = false;
                if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                    alert('No Study Area');
                    return; //sm study area is incomplete
                }
                var requestParameterList = [];
                this.studyAreaParameterList.map(function (param) {
                    requestParameterList.push(param.code);
                });
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, requestParameterList.join(','));
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        var results = response.data.parameters;
                        _this.loadParameterResults(results);
                        _this.parametersLoaded = true;
                    }
                    //sm when complete
                }, function (error) {
                    //sm when complete
                }).finally(function () {
                    //this.canUpdate = true;
                    _this.parametersLoading = false;
                });
            };
            StudyAreaService.prototype.upstreamRegulation = function () {
                var _this = this;
                this.isRegulated = false;
                this.canUpdate = false;
                var watershed = JSON.stringify(this.selectedStudyArea.Features[1].feature, null);
                var url = configuration.baseurls['RegulationServices'] + configuration.queryparams['COregulationService'];
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 1 /* POST */, 'json', { watershed: watershed, outputcrs: 4326, f: 'geojson' }, { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, WiM.Services.Helpers.paramsTransform);
                this.Execute(request).then(function (response) {
                    console.log(response);
                    if (response.data.percentarearegulated > 0) {
                        _this.selectedStudyArea.Features.push(response.data["featurecollection"][0]);
                        var regulatedResults = response.data.parameters;
                        _this.loadRegulatedParameterResults(regulatedResults);
                        _this.isRegulated = true;
                    }
                    else {
                        alert("No regulation found");
                    }
                    //sm when complete
                }, function (error) {
                    //sm when error
                }).finally(function () {
                    _this.canUpdate = true;
                    _this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
                });
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-       
            StudyAreaService.prototype.loadParameterResults = function (results) {
                console.log('in load parameter results');
                var paramList = this.studyAreaParameterList;
                results.map(function (val) {
                    angular.forEach(paramList, function (value, index) {
                        if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                            value.value = val.value;
                            return; //exit loop
                        } //endif
                    });
                });
                /*
                for (var i: number = 0; i < results.length; i++) {
                    for (var j: number = 0; j < this.studyAreaParameterList.length; j++) {
                        if (results[i].code.toUpperCase().trim() === this.studyAreaParameterList[j].code.toUpperCase().trim()) {
                            this.studyAreaParameterList[j].value = results[i].value;
                            break;//exit loop
                        }//endif
                    }//next sa Parameter
                }//next result
                */
                console.log('params', this.studyAreaParameterList);
            };
            StudyAreaService.prototype.loadRegulatedParameterResults = function (results) {
                console.log('in load regulated parameter results');
                var paramList = this.studyAreaParameterList;
                results.map(function (val) {
                    angular.forEach(paramList, function (value, index) {
                        if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                            value.regulatedValue = val.value;
                            return; //exit loop
                        } //endif
                    });
                });
                /*
                for (var i: number = 0; i < results.length; i++) {
                    for (var j: number = 0; j < this.studyAreaParameterList.length; j++) {
                        if (results[i].code.toUpperCase().trim() === this.studyAreaParameterList[j].code.toUpperCase().trim()) {
                            this.studyAreaParameterList[j].regulatedValue = results[i].value;
                            break;//exit loop
                        }//endif
                    }//next sa Parameter
                }//next result
                */
                console.log('regulated params', this.studyAreaParameterList);
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