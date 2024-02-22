var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var ModalService = (function () {
            function ModalService($modal) {
                this.modal = $modal;
            }
            ModalService.prototype.openModal = function (mType, options) {
                if (options === void 0) { options = null; }
                if (options) {
                    this.modalOptions = options;
                }
                this.modal.open(this.getModalSettings(mType));
            };
            ModalService.prototype.getModalSettings = function (mType) {
                var msg;
                try {
                    switch (mType) {
                        case SSModalType.e_exploration:
                            return {
                                templateUrl: 'Views/explorationview.html',
                                controller: 'StreamStats.Controllers.ExplorationToolsModalController',
                                size: 'sm',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_report:
                            return {
                                templateUrl: 'Views/reportview.html',
                                controller: 'StreamStats.Controllers.ReportController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_wateruse:
                            return {
                                templateUrl: 'Views/wateruse.html',
                                controller: 'StreamStats.Controllers.WateruseController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_stormrunnoff:
                            return {
                                templateUrl: 'Views/stormrunoff.html',
                                controller: 'StreamStats.Controllers.StormRunoffController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_scstormrunnoff:
                            return {
                                templateUrl: 'Views/scstormrunoff.html',
                                controller: 'StreamStats.Controllers.SCStormRunoffController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_about:
                            return {
                                templateUrl: 'Views/about.html',
                                controller: 'StreamStats.Controllers.AboutController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_help:
                            return {
                                templateUrl: 'Views/help.html',
                                controller: 'StreamStats.Controllers.HelpController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_navreport:
                            return {
                                templateUrl: 'Views/navreportmodal.html',
                                controller: 'StreamStats.Controllers.NavigationReportModalController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ'
                            };
                        case SSModalType.e_prosper:
                            return {
                                templateUrl: 'Views/prosperview.html',
                                controller: 'StreamStats.Controllers.ProsperController',
                                size: 'sm',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_extensionsupport:
                            return {
                                templateUrl: 'Views/extensionview.html',
                                controller: 'StreamStats.Controllers.ExtensionModalController',
                                size: 'sm',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_gagepage:
                            return {
                                templateUrl: 'Views/gagepage.html',
                                controller: 'StreamStats.Controllers.GagePageController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ modal-xl',
                            };
                        case SSModalType.e_nearestgages:
                            return {
                                templateUrl: 'Views/nearestgages.html',
                                controller: 'StreamStats.Controllers.NearestGagesController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ modal-xl',
                            };
                        case SSModalType.e_flowanywhere:
                            return {
                                templateUrl: 'Views/flowanywhere.html',
                                controller: 'StreamStats.Controllers.FlowAnywhereController',
                                size: 'sm',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_warningmessage:
                            return {
                                templateUrl: 'Views/warningmessage.html',
                                controller: 'StreamStats.Controllers.WarningMessageController',
                                size: 'sm',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        case SSModalType.e_batchprocessor:
                            return {
                                templateUrl: 'Views/batchprocessor.html',
                                controller: 'StreamStats.Controllers.BatchProcessorController',
                                size: 'lg',
                                backdropClass: 'backdropZ',
                                backdrop: 'static',
                                windowClass: 'windowZ',
                            };
                        default:
                            return null;
                    }
                }
                catch (e) {
                    return null;
                }
            };
            return ModalService;
        }());
        var SSModalType;
        (function (SSModalType) {
            SSModalType[SSModalType["e_report"] = 1] = "e_report";
            SSModalType[SSModalType["e_wateruse"] = 2] = "e_wateruse";
            SSModalType[SSModalType["e_about"] = 3] = "e_about";
            SSModalType[SSModalType["e_help"] = 4] = "e_help";
            SSModalType[SSModalType["e_navreport"] = 5] = "e_navreport";
            SSModalType[SSModalType["e_exploration"] = 6] = "e_exploration";
            SSModalType[SSModalType["e_stormrunnoff"] = 7] = "e_stormrunnoff";
            SSModalType[SSModalType["e_prosper"] = 8] = "e_prosper";
            SSModalType[SSModalType["e_extensionsupport"] = 9] = "e_extensionsupport";
            SSModalType[SSModalType["e_gagepage"] = 10] = "e_gagepage";
            SSModalType[SSModalType["e_nearestgages"] = 11] = "e_nearestgages";
            SSModalType[SSModalType["e_flowanywhere"] = 12] = "e_flowanywhere";
            SSModalType[SSModalType["e_warningmessage"] = 13] = "e_warningmessage";
            SSModalType[SSModalType["e_batchprocessor"] = 14] = "e_batchprocessor";
        })(SSModalType = Services.SSModalType || (Services.SSModalType = {}));
        factory.$inject = ['$modal'];
        function factory($modal) {
            return new ModalService($modal);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ModalService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
