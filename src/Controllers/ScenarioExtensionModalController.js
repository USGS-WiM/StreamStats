//------------------------------------------------------------------------------
//----- ExplorationToolsModalController ----------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2019 WiM - USGS
//    authors:  Jeremy K. Newson USGS Web Informatics and Mapping
//             
// 
//   purpose:  Example of Modal Controller
//          
//discussion:
//Comments
//07.24.2019 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var ExtensionModalController = /** @class */ (function () {
            function ExtensionModalController($scope, $analytics, modal, modalservice, studyArea) {
                $scope.vm = this;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.studyAreaService = studyArea;
                //init required values
                this.dateRange = { dates: { startDate: this.addDay(new Date(), -1), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExtensionModalController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.addExplorationPointFromMapt = function (name) {
                this.modalInstance.dismiss('cancel');
                //this.explorationService.explorationPointType = name;
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExtensionModalController.prototype.verifyExtensionCanContinue = function () {
                //check dates
                if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                    return false;
                }
                return true;
            };
            ExtensionModalController.prototype.addDay = function (d, days) {
                try {
                    var dayAsTime = 1000 * 60 * 60 * 24;
                    return new Date(d.getTime() + days * dayAsTime);
                }
                catch (e) {
                    return d;
                }
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExtensionModalController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return ExtensionModalController;
        }()); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ScenarioExtensionModalController.js.map