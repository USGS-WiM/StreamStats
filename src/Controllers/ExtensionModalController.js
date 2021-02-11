var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var ExtensionModalController = (function () {
            function ExtensionModalController($scope, $analytics, modal, modalservice, studyArea) {
                var _this = this;
                this.isBusy = false;
                this.selectedReferenceGage = null;
                $scope.vm = this;
                this.angulartics = $analytics;
                this.modalInstance = modal;
                this.studyAreaService = studyArea;
                this.modalService = modalservice;
                this.dateRangeOptions = {
                    locale: { format: 'MMMM D, YYYY' },
                    eventHandlers: { 'hide.daterangepicker': function (e) { return _this.SetExtensionDate(e); } }
                };
                this.init();
                this.load();
                $scope.$watch(function () { return _this.usePublishedFDC; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    _this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                        ext.parameters.forEach(function (p) {
                            if (p.code == "usePublishedFDC") {
                                p.value = _this.usePublishedFDC;
                            }
                        });
                    });
                });
                $scope.$watch(function () { return _this.dateRange.dates; }, function (newval, oldval) {
                    if (newval == oldval)
                        return;
                    _this.studyAreaService.selectedStudyAreaExtensions.forEach(function (ext) {
                        ext.parameters.forEach(function (p) {
                            if (p.code == "sdate") {
                                p.value = _this.dateRange.dates.startDate;
                            }
                            if (p.code == "edate") {
                                p.value = _this.dateRange.dates.endDate;
                            }
                        });
                    });
                });
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
                this.studyAreaService.doSelectMapGage = true;
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
                this.studyAreaService.extensionDateRange = this.dateRange;
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
                    if (this.studyAreaService.extensionDateRange != undefined) {
                        this.dateRange = this.studyAreaService.extensionDateRange;
                    }
                    else {
                        this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                    }
                    parameters[pcodes.indexOf('sdate')].value = this.dateRange.dates.startDate;
                    parameters[pcodes.indexOf('edate')].value = this.dateRange.dates.endDate;
                }
                if (['usePublishedFDC'].some(function (r) { return pcodes.indexOf(r) > -1; })) {
                    this.usePublishedFDC = false;
                }
            };
            ExtensionModalController.prototype.load = function () {
                var parameters = this.getExtensionParameters();
                do {
                    var f = parameters.pop();
                    if (this.selectedReferenceGage && ['sid'].indexOf(f.code) > -1) {
                        if (typeof f.value != 'string')
                            this.selectedReferenceGage = f.value;
                        else if (typeof f.options == 'object')
                            this.selectedReferenceGage = f.options[0];
                        this.referenceGageList = f.options;
                    }
                    if (this.dateRange && ['sdate', 'edate'].indexOf(f.code) > -1) {
                        if (f.code == "sdate")
                            this.dateRange.dates.startDate = f.value;
                        if (f.code == "edate")
                            this.dateRange.dates.endDate = f.value;
                    }
                    if (this.usePublishedFDC != undefined && ['usePublishedFDC'].indexOf(f.code) > -1) {
                        this.usePublishedFDC = f.value;
                    }
                } while (parameters.length > 0);
                this.studyAreaService.selectedGage = this.selectedReferenceGage;
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
                        if (p.code == "sid" && typeof p.value != 'string') {
                            p.value = _this.selectedReferenceGage.StationID;
                        }
                        ;
                        if (p.code == "usePublishedFDC") {
                            p.value = _this.usePublishedFDC;
                        }
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
            ExtensionModalController.prototype.updateReferenceGage = function (item) {
                this.selectedReferenceGage = item;
                this.studyAreaService.selectedGage = item;
            };
            ExtensionModalController.prototype.openGagePage = function (siteid) {
                console.log('gage page id:', siteid);
                this.modalService.openModal(StreamStats.Services.SSModalType.e_gagepage, { 'siteid': siteid });
            };
            ExtensionModalController.$inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return ExtensionModalController;
        }());
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
