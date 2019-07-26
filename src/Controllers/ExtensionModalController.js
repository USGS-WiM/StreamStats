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
                //QPPQ
                this.dateRange = null;
                this.referenceGage = null;
                $scope.vm = this;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.studyAreaService = studyArea;
                //init required values
                this.referenceGage = new StreamStats.Models.ReferenceGage("", "");
                //this.init();
                //this.load();            
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExtensionModalController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.ok = function () {
                //validate info
                if (this.verifyExtensionCanContinue()) {
                    //close
                    this.close();
                }
            };
            ExtensionModalController.prototype.addReferanceGageFromMap = function (name) {
                this.studyAreaService.doQueryNWIS = true;
                this.modalInstance.dismiss('cancel');
                //this.explorationService.explorationPointType = name;
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ExtensionModalController.prototype.init = function () {
                //default
                this.referenceGage = null;
                //load from services
                if (this.studyAreaService.selectedStudyAreaExtensions == null)
                    return;
                this.title = this.studyAreaService.selectedStudyAreaExtensions.map(function (c) { return c.name; }).join(", ");
                var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters.map(function (c) { return c.code; })); }, []);
                if (['sid'].some(function (r) { return parameters.indexOf(r) > -1; })) {
                    this.referenceGage = new StreamStats.Models.ReferenceGage("", "");
                } //endif
                if (['sdate', 'edate'].every(function (elem) { return parameters.indexOf(elem) > -1; })) {
                    this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                } //endif
            };
            ExtensionModalController.prototype.load = function () {
                var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []);
                do {
                    var f = parameters.pop();
                    if (typeof f.value === 'string')
                        continue;
                    if (this.referenceGage && ['sid'].indexOf(f.code) > -1) {
                        this.referenceGage = f.value;
                    }
                    if (this.dateRange && ['sdate', 'edate'].indexOf(f.code) > -1) {
                        if (f.code == "sdate")
                            this.dateRange.dates.startDate = f.value;
                        if (f.code == "edate")
                            this.dateRange.dates.endDate = f.value;
                    }
                } while (parameters.length > 0);
            };
            ExtensionModalController.prototype.verifyExtensionCanContinue = function () {
                var _this = this;
                //check dates
                if (this.dateRange) {
                    if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                        (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                        (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                        return false;
                    }
                }
                if (this.referenceGage) {
                    if (this.referenceGage.StationID == "") {
                        return false;
                    }
                }
                //load service
                this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                    ext.parameters.forEach(function (p) {
                        if (p.code == "sdate")
                            p.value = _this.dateRange.dates.startDate;
                        if (p.code == "edate")
                            p.value = _this.dateRange.dates.startDate;
                        if (p.code == "sid") {
                            p.value = _this.referenceGage;
                        }
                        ;
                    });
                });
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
//# sourceMappingURL=ExtensionModalController.js.map