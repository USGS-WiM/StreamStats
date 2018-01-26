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
            function ExplorationToolsModalController($scope, $analytics, $sce, modal, modalservice, exploration) {
                $scope.vm = this;
                this.sce = $sce;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.explorationService = exploration;
                //init required values
                this.selectedDirection = 'downstream';
                this.selectedQuerySourceList = ['flowline'];
                this.selectExclusiveOption(this.selectedDirection, 'Direction');
                this.selectOption(this.selectedQuerySourceList[0], 'Query Source');
                this.print = function () {
                    window.print();
                };
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationToolsModalController.prototype.close = function () {
                this.explorationService.showElevationChart = false;
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
                        console.log('limit object:', limitObject);
                        _this.explorationService.selectedMethod.navigationConfiguration.push(limitObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.selectExclusiveOption = function (option, configName) {
                var _this = this;
                this.selectedDirection = option;
                this.deleteConfig(configName);
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == configName) {
                        var configObject = JSON.parse(JSON.stringify(item));
                        configObject.value = option;
                        console.log('adding selectExclusiveOption config object:', configObject);
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.selectOption = function (option, configName) {
                var _this = this;
                console.log('in selection option', option, configName, this.selectedQuerySourceList);
                var index = this.selectedQuerySourceList.indexOf(option);
                if (index > -1) {
                    this.selectedQuerySourceList.splice(index, 1);
                }
                else
                    this.selectedQuerySourceList.push(option);
                this.deleteConfig(configName);
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == configName) {
                        var configObject = JSON.parse(JSON.stringify(item));
                        configObject.value = option;
                        console.log('adding selectOption config object:', configObject);
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
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
                        console.log('deleting:', item.name);
                        _this.explorationService.selectedMethod.navigationConfiguration.splice(key, 1);
                    }
                });
            };
            ExplorationToolsModalController.prototype.checkLimit = function (name, config) {
                config.forEach(function (item, key) {
                    console.log('checking1', item.name, item.value.name, name);
                    if (item.name == 'Limit' && item.value.name == name) {
                        console.log('FOUND:', item.name, name);
                        return true;
                    }
                });
                return false;
            };
            ExplorationToolsModalController.prototype.configExists = function (name, config) {
                console.log('checking1', name, config);
                for (var i = 0; i < config.length; i++) {
                    if (config[i].name === name) {
                        console.log('checking:', config[i].name, name);
                        return true;
                    }
                }
                return false;
            };
            return ExplorationToolsModalController;
        }()); //end  class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        ExplorationToolsModalController.$inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationToolsModalController.js.map