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
        'use strict';
        var NavbarController = (function (_super) {
            __extends(NavbarController, _super);
            function NavbarController($scope, $http, modal, studyArea) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.http = $http;
                _this.modalService = modal;
                _this.getFreshdeskCreds();
                _this.studyAreaService = studyArea;
                _this.newArticleCount = 0;
                _this.environment = configuration.environment;
                _this.AppVersion = configuration.version;
                _this.cloud = configuration.cloud;
                return _this;
            }
            NavbarController.prototype.checkActiveNews = function () {
                var _this = this;
                console.log("Checking for active news articles");
                var headers = {
                    "Authorization": "Basic " + btoa(this.freshdeskCreds['Token'] + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved active news articles page');
                    if (response.data.folder.articles.length > 0) {
                        response.data.folder.articles.forEach(function (article) {
                            if (_this.readCookie(article.id) == null) {
                                console.log('New news article found: ', article);
                                _this.newArticleCount += 1;
                                _this.createCookie(article.id, true, 30);
                            }
                        });
                        if (_this.newArticleCount > 0)
                            _this.modalService.openModal(StreamStats.Services.SSModalType.e_about, { "tabName": "news", "regionID": '' });
                    }
                }, function (error) {
                }).finally(function () {
                });
            };
            NavbarController.prototype.getFreshdeskCreds = function () {
                var self = this;
                this.http.get('./data/secrets.json').then(function (response) {
                    self.studyAreaService.freshdeskCredentials = response.data;
                    self.freshdeskCreds = response.data;
                    self.checkActiveNews();
                });
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
            NavbarController.prototype.readCookie = function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ')
                        c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0)
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            };
            NavbarController.prototype.createCookie = function (name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    var expires = "; expires=" + date.toUTCString();
                }
                else
                    var expires = "";
                document.cookie = name + "=" + value + expires + "; path=/";
            };
            NavbarController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return NavbarController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NavbarController', NavbarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
