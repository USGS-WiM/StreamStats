var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var ExtensionModalController = (function () {
            function ExtensionModalController($scope, $analytics, modal, modalservice, studyArea) {
                var _this = this;
                this.isBusy = false;
                this.dateRange = null;
                this.selectedReferenceGage = null;
                $scope.vm = this;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.studyAreaService = studyArea;
                this.modalService = modalservice;
                if (this.dateRangeOptions == undefined) {
                    this.dateRangeOptions = {
                        locale: { format: 'MMMM D, YYYY' },
                        eventHandlers: { 'hide.daterangepicker': function (e) { return _this.SetExtensionDate(e); } }
                    };
                }
                this.init();
                this.load();
            }
            ExtensionModalController.prototype.close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.ok = function () {
                if (this.verifyExtensionCanContinue()) {
                    this.close();
                }
            };
            ExtensionModalController.prototype.setReferenceGageFromMap = function (name) {
                this.isBusy = true;
                this.studyAreaService.doQueryNWIS = true;
                this.modalInstance.dismiss('cancel');
            };
            ExtensionModalController.prototype.setBestCorrelatedReferenceGage = function () {
                var _this = this;
                this.isBusy = true;
                this.studyAreaService.onStudyAreaServiceBusyChanged.subscribe(new WiM.Event.EventHandler(function () {
                    _this.onStudyServiceBusyChanged();
                }));
                this.studyAreaService.GetKriggedReferenceGages();
            };
            ExtensionModalController.prototype.SetExtensionDate = function (event) {
                var _this = this;
                var dates = this.getExtensionParameters(['sdate', 'edate']);
                dates.forEach(function (dt) {
                    if (dt.code === "sdate")
                        dt.value = _this.dateRange.dates.startDate;
                    if (dt.code === "edate")
                        dt.value = _this.dateRange.dates.endDate;
                });
            };
            ExtensionModalController.prototype.openNearestGages = function () {
                this.modalInstance.dismiss('cancel');
                this.studyAreaService.doSelectNearestGage = true;
                this.modalService.openModal(StreamStats.Services.SSModalType.e_nearestgages);
            };
            ExtensionModalController.prototype.init = function () {
                this.selectedReferenceGage = null;
                if (this.studyAreaService.selectedStudyAreaExtensions == null)
                    return;
                this.title = this.studyAreaService.selectedStudyAreaExtensions.map(function (c) { return c.name; }).join(", ");
                var parameters = this.getExtensionParameters();
                var pcodes = parameters.map(function (p) { return p.code; });
                if (['sid'].some(function (r) { return pcodes.indexOf(r) > -1; })) {
                    this.selectedReferenceGage = new StreamStats.Models.ReferenceGage("", "");
                }
                if (['sdate', 'edate'].every(function (elem) { return pcodes.indexOf(elem) > -1; })) {
                    this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                    parameters[pcodes.indexOf('sdate')].value = this.dateRange.dates.startDate;
                    parameters[pcodes.indexOf('edate')].value = this.dateRange.dates.endDate;
                }
            };
            ExtensionModalController.prototype.load = function () {
                var parameters = this.getExtensionParameters();
                do {
                    var f = parameters.pop();
                    if (typeof f.value === 'string')
                        continue;
                    if (this.selectedReferenceGage && ['sid'].indexOf(f.code) > -1) {
                        this.selectedReferenceGage = f.value;
                        this.referenceGageList = f.options;
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
                if (this.dateRange) {
                    if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                        (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                        (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                        return false;
                    }
                }
                if (this.selectedReferenceGage) {
                    if (this.selectedReferenceGage.StationID == "") {
                        return false;
                    }
                }
                this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                    ext.parameters.forEach(function (p) {
                        if (p.code == "sid") {
                            p.value = _this.selectedReferenceGage.StationID;
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
            ExtensionModalController.prototype.getExtensionParameters = function (codes) {
                if (codes === void 0) { codes = null; }
                var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce(function (acc, val) { return acc.concat(val.parameters); }, []);
                if (codes) {
                    parameters = parameters.filter(function (f) { return (codes.indexOf((f.code)) > -1); });
                }
                return parameters;
            };
            ExtensionModalController.prototype.onStudyServiceBusyChanged = function () {
                var _this = this;
                this.studyAreaService.onStudyAreaServiceBusyChanged.unsubscribe(new WiM.Event.EventHandler(function () {
                    _this.onStudyServiceBusyChanged();
                }));
                this.load();
                this.isBusy = false;
            };
            ExtensionModalController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return ExtensionModalController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
