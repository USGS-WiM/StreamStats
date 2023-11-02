var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var ExplorationToolsModalController = (function () {
            function ExplorationToolsModalController($scope, $sce, modal, modalservice, exploration, studyArea) {
                $scope.vm = this;
                this.sce = $sce;
                this.modalInstance = modal;
                this.explorationService = exploration;
                this.studyAreaService = studyArea;
                this.DEMresolutionList = ['FINEST', '10m', '30m', '90m', '1000m'];
                if (this.explorationService.selectedMethod.navigationInfo.configuration) {
                    this.selectExclusiveOption('downstream', 'Direction');
                    this.selectOption('flowline', 'Query Source');
                    this.checkWorkspaceID();
                }
                this.print = function () {
                    gtag('event', 'Download', { 'Category': 'ElevationProfile', "Type": 'Print' });
                    window.print();
                };
            }
            ExplorationToolsModalController.prototype.close = function () {
                this.explorationService.showElevationChart = false;
                this.explorationService.setMethod(0, {});
                this.modalInstance.dismiss('cancel');
            };
            ExplorationToolsModalController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ExplorationToolsModalController.prototype.selectElevationPoints = function () {
                this.modalInstance.dismiss('cancel');
                this.explorationService.selectElevationPoints = true;
            };
            ExplorationToolsModalController.prototype.addExplorationPointFromMapt = function (name) {
                this.modalInstance.dismiss('cancel');
                this.explorationService.explorationPointType = name;
            };
            ExplorationToolsModalController.prototype.addExplorationPointFromPourpoint = function (name, lat, lng, crs) {
                this.explorationService.selectedMethod.addLocation(name, new WiM.Models.Point(lat, lng, crs));
            };
            ExplorationToolsModalController.prototype.downloadCSV = function () {
                gtag('event', 'Download', { 'Category': 'ElevationProfile', "Type": 'CSV' });
                var filename = 'elevation-profile.csv';
                var csvFile = 'lat,long,elevation(feet),distance(mi)\r\n';
                this.explorationService.coordinateList.forEach(function (value) {
                    csvFile += value.join(',') + '\r\n';
                });
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
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
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == 'Limit') {
                        var limitObject = JSON.parse(JSON.stringify(item));
                        limitObject.value = _this.selectedLimit;
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
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.selectOption = function (option, configName) {
                var _this = this;
                if (!this.selectedQuerySourceList)
                    this.selectedQuerySourceList = [];
                var index = this.selectedQuerySourceList.indexOf(option);
                (index > -1) ? this.selectedQuerySourceList.splice(index, 1) : this.selectedQuerySourceList.push(option);
                this.deleteConfig(configName);
                this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                    if (item.name == configName) {
                        var configObject = JSON.parse(JSON.stringify(item));
                        configObject.value = _this.selectedQuerySourceList;
                        _this.explorationService.selectedMethod.navigationConfiguration.push(configObject);
                    }
                });
            };
            ExplorationToolsModalController.prototype.checkWorkspaceID = function () {
                var _this = this;
                if (this.studyAreaService.selectedStudyArea && this.studyAreaService.selectedStudyArea.WorkspaceID !== '') {
                    this.explorationService.selectedMethod.navigationInfo.configuration.forEach(function (item, key) {
                        if (item.name == 'Limit') {
                            item.value.forEach(function (limit, key) {
                                if (limit.name == 'Polygon geometry') {
                                    limit.name = 'Polygon geometry from delineated watershed';
                                    limit.value = _this.studyAreaService.selectedStudyArea.FeatureCollection.features.filter(function (f) { return (f.id).toLowerCase() == "globalwatershed"; })[0].geometry;
                                }
                            });
                        }
                    });
                }
            };
            ExplorationToolsModalController.prototype.ExecuteNav = function () {
                if (this.explorationService.selectedMethod.navigationPointCount != this.explorationService.selectedMethod.minLocations) {
                    return;
                }
                var isOK = false;
                this.explorationService.explorationMethodBusy = true;
                this.explorationService.ExecuteSelectedModel();
            };
            ExplorationToolsModalController.prototype.deleteConfig = function (name) {
                var _this = this;
                this.explorationService.selectedMethod.navigationConfiguration.forEach(function (item, key) {
                    if (item.name == name) {
                        _this.explorationService.selectedMethod.navigationConfiguration.splice(key, 1);
                    }
                });
            };
            ExplorationToolsModalController.$inject = ['$scope', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService', 'StreamStats.Services.StudyAreaService'];
            return ExplorationToolsModalController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
