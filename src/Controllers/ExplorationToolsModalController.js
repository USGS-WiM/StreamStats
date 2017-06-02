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
                var csvFile = 'long,lat,elevation(feet)\r\n';
                //write out values
                this.explorationService.elevationProfileGeoJSON.features[0].geometry.coordinates.forEach(function (value) {
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExplorationToolsModalController.$inject = ['$scope', '$analytics', '$sce', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.ExplorationService'];
            return ExplorationToolsModalController;
        }()); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExplorationToolsModalController', ExplorationToolsModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ExplorationToolsModalController.js.map