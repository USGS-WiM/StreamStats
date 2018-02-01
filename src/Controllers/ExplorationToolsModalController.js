//------------------------------------------------------------------------------
//----- ExplorationToolsModalController ----------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Example of Modal Controller
//          
//discussion:
//Comments
//04.24.2017 mjs - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var ExplorationToolsModalController = (function () {
            function ExplorationToolsModalController($scope, $analytics, $sce, modal, modalservice, exploration, studyArea) {
                $scope.vm = this;
                this.sce = $sce;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.explorationService = exploration;
                this.studyAreaService = studyArea;
                //init required values
                if (this.explorationService.selectedMethod.navigationInfo.configuration) {
                    this.selectExclusiveOption('downstream', 'Direction');
                    this.selectOption('flowline', 'Query Source');
                    this.checkWorkspaceID();
                }
                this.print = function () {
                    window.print();
                };
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationToolsModalController.prototype.close = function () {
                this.explorationService.showElevationChart = false;
                this.explorationService.setMethod(0, {});
                this.modalInstance.dismiss('cancel');
            };
            ExplorationToolsModalController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ExplorationToolsModalController.prototype.downloadCSV = function () {
                //ga event
                this.angulartics.eventTrack('Download', { category: 'ElevationProfile', label: 'CSV' });
                var filename = 'elevation-profile.csv';
                //main file header with site information
                var csvFile = 'long,lat,elevation(feet),distance(feet)\r\n';
                //write out values
                this.explorationService.coordinateList.forEach(function (value) {
                    csvFile += value.join(',') + '\r\n';
                });
                //download
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
                        // Browsers that support HTML5 download attribute
                        link.setAttribute("href", url);
                        link.setAttribute("download", filename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        window.open(url);
                    }
                }
            };
            ExplorationToolsModalController.prototype.addLimit = function (item) {
                var _this = this;
                this.selectedLimit = item;
                this.deleteConfig('Limit');
                //add limit object
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == 'Limit') {
                        var limitObject = JSON.parse(JSON.stringify(item));
                        limitObject.value = _this.selectedLimit;
                        //console.log('limit object:',limitObject)
                        _this.explorationService.selectedMethod.navigationConfiguration.push(limitObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.selectExclusiveOption = function (option, configName) {
                var _this = this;
                //init selected direction
                this.selectedDirection = option;
                this.deleteConfig(configName);
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == configName) {
                        var configObject = JSON.parse(JSON.stringify(item));
                        configObject.value = option;
                        //console.log('adding selectExclusiveOption config object:', configObject)
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.selectOption = function (option, configName) {
                var _this = this;
                //init list if it doesn't exist
                if (!this.selectedQuerySourceList)
                    this.selectedQuerySourceList = [];
                var index = this.selectedQuerySourceList.indexOf(option);
                (index > -1) ? this.selectedQuerySourceList.splice(index, 1) : this.selectedQuerySourceList.push(option);
                this.deleteConfig(configName);
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == configName) {
                        var configObject = JSON.parse(JSON.stringify(item));
                        configObject.value = _this.selectedQuerySourceList;
                        //console.log('adding selectOption config object:', configObject)
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.checkWorkspaceID = function () {
                var _this = this;
                if (this.studyAreaService.selectedStudyArea && this.studyAreaService.selectedStudyArea.WorkspaceID !== '') {
                    //console.log('in exploration service we have a workspace:', this.studyAreaService.selectedStudyArea.WorkspaceID, this.explorationService.selectedMethod.navigationInfo.configuration);
                    this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                        if (item.name == 'Limit') {
                            item.value.forEach(function (limit, key) {
                                if (limit.name == 'Polygon geometry') {
                                    //reset limit polygon with delineated basin
                                    //console.log('in here', this.studyAreaService.selectedStudyArea, this.studyAreaService.selectedStudyArea.Features[1].feature.features[0].geometry)
                                    limit.name = 'Polygon geometry from delineated watershed';
                                    limit.value = _this.studyAreaService.selectedStudyArea.Features[1].feature.features[0].geometry;
                                }
                            });
                        }
                    });
                    //if ((<Models.FlowPath>this.explorationService.selectedMethod).workspaceID !== '') (<Models.FlowPath>this.explorationService.selectedMethod).workspaceID = ''
                    //else {
                    //    (<Models.FlowPath>this.explorationService.selectedMethod).workspaceID = this.studyAreaService.selectedStudyArea.WorkspaceID;
                    //    //this.toaster.pop("info", "Information", "Ensure your selected point resides within the basin", 5000);
                    //}
                }
            };
            ExplorationToolsModalController.prototype.ExecuteNav = function () {
                //validate request
                if (this.explorationService.selectedMethod.navigationPointCount != this.explorationService.selectedMethod.minLocations) {
                    //this.toaster.pop("warning", "Warning", "You must select at least " + this.explorationService.selectedMethod.minLocations + " points.", 10000);
                    return;
                }
                var isOK = false;
                this.explorationService.explorationMethodBusy = true;
                this.explorationService.ExecuteSelectedModel();
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationToolsModalController.prototype.deleteConfig = function (name) {
                var _this = this;
                //delete existing limit object
                this.explorationService.selectedMethod.navigationConfiguration.forEach(function (item, key) {
                    if (item.name == name) {
                        //console.log('deleting:', item.name)
                        _this.explorationService.selectedMethod.navigationConfiguration.splice(key, 1);
                    }
                });
            };
            return ExplorationToolsModalController;
        }()); //end  class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        ExplorationToolsModalController.$inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService', 'StreamStats.Services.StudyAreaService'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationToolsModalController.js.map