var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        "use strict";
        var NavbarController = (function (_super) {
            __extends(NavbarController, _super);
            function NavbarController($scope, $http, modal, studyArea) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.http = $http;
                _this.modalService = modal;
                _this.studyAreaService = studyArea;
                _this.environment = configuration.environment;
                _this.AppVersion = configuration.version;
                _this.cloud = configuration.cloud;
                _this.checkURLParams();
                if (configuration.showWarningModal) {
                    _this.openWarningMessage();
                }
                if (window.location.host === "test.streamstats.usgs.gov") {
                    _this.showBatchButton == false;
                }
                return _this;
            }
            NavbarController.prototype.checkURLParams = function () {
                var queryString = window.location.search;
                var urlParams = new URLSearchParams(queryString);
                var BP = urlParams.get("BP");
                if (BP) {
                    if (BP == "submitBatch") {
                        this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor, {
                            tabName: "submitBatch",
                        });
                    }
                    if (BP == "batchStatus") {
                        var email = urlParams.get("email");
                        if (email) {
                            this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor, {
                                tabName: "batchStatus",
                                urlParams: email,
                            });
                        }
                        else {
                            this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor, {
                                tabName: "batchStatus",
                            });
                        }
                    }
                    if (BP == "streamGrid") {
                        this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor, {
                            tabName: "streamGrid",
                        });
                    }
                    if (BP == "manageQueue") {
                        this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor, {
                            tabName: "manageQueue",
                        });
                    }
                }
            };
            NavbarController.prototype.openBatchProcessor = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_batchprocessor);
            };
            NavbarController.prototype.openReport = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_report);
            };
            NavbarController.prototype.openAbout = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_about);
            };
            NavbarController.prototype.openHelp = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_help);
            };
            NavbarController.prototype.openWarningMessage = function () {
                this.modalService.openModal(StreamStats.Services.SSModalType.e_warningmessage);
            };
            NavbarController.prototype.readCookie = function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(";");
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == " ")
                        c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0)
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            };
            NavbarController.prototype.createCookie = function (name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                    var expires = "; expires=" + date.toUTCString();
                }
                else
                    var expires = "";
                document.cookie = name + "=" + value + expires + "; path=/";
            };
            NavbarController.$inject = [
                "$scope",
                "$http",
                "StreamStats.Services.ModalService",
                "StreamStats.Services.StudyAreaService",
            ];
            return NavbarController;
        }(WiM.Services.HTTPServiceBase));
        angular
            .module("StreamStats.Controllers")
            .controller("StreamStats.Controllers.NavbarController", NavbarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
