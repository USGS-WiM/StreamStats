var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var AboutController = (function (_super) {
            __extends(AboutController, _super);
            function AboutController($scope, $http, $sce, modalService, region, studyAreaService, modal) {
                var _this = _super.call(this, $http, configuration.baseurls.StreamStats) || this;
                $scope.vm = _this;
                _this.sce = $sce;
                _this.modalInstance = modal;
                _this.modalService = modalService;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.regionService = region;
                _this.selectedAboutTabName = "about";
                _this.regionArticle = '<h3>No State or Region Selected</h3>';
                _this.init();
                return _this;
            }
            AboutController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            AboutController.prototype.selectAboutTab = function (tabname) {
                if (this.selectedAboutTabName == tabname)
                    return;
                this.selectedAboutTabName = tabname;
            };
            AboutController.prototype.getActiveNews = function () {
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    var publishedArticles = [];
                    if (response.data.folder.articles.length) {
                        if (window.location.host == 'test.streamstats.usgs.gov') {
                            _this.activeNewsArticles = response.data.folder.articles;
                        }
                        else {
                            response.data.folder.articles.forEach(function (element) {
                                if (element.status == 2)
                                    publishedArticles.push(element);
                            });
                            _this.activeNewsArticles = publishedArticles;
                        }
                    }
                }, function (error) {
                }).finally(function () {
                });
            };
            AboutController.prototype.getPastNews = function () {
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.PastNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    var publishedArticles = [];
                    if (response.data.folder.articles.length) {
                        if (window.location.host.indexOf('test.streamstats.usgs.gov') > -1) {
                            _this.pastNewsArticles = response.data.folder.articles;
                        }
                        else {
                            response.data.folder.articles.forEach(function (element) {
                                if (element.status == 2)
                                    publishedArticles.push(element);
                            });
                            _this.pastNewsArticles = publishedArticles;
                        }
                    }
                }, function (error) {
                }).finally(function () {
                });
            };
            AboutController.prototype.getAboutArticle = function () {
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.AboutArticle;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    _this.aboutArticle = response.data.article.description;
                }, function (error) {
                }).finally(function () {
                });
            };
            AboutController.prototype.getRegionHelpArticle = function () {
                var _this = this;
                var regionID;
                if (this.modalService.modalOptions) {
                    if (this.modalService.modalOptions.tabName)
                        this.selectAboutTab(this.modalService.modalOptions.tabName);
                    regionID = this.modalService.modalOptions.regionID;
                }
                if (this.regionService.selectedRegion)
                    regionID = this.regionService.selectedRegion.Name;
                if (!regionID)
                    return;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.RegionInfoFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                configuration.regions.forEach(function (value, index) {
                    if (value.Name === regionID) {
                        if (!value.regionEnabled) {
                            _this.regionArticle = '<div class="wim-alert">StreamStats has not been developed for <strong>' + value.Name + '</strong>.  Please contact the <a href="mailto:support@streamstats.freshdesk.com">streamstats team</a> if you would like StreamStats enabled for this State/Region.</div>';
                        }
                        else {
                            _this.regionArticle = '<i class="fa fa-spinner fa-3x fa-spin loadingSpinner"></i>';
                            _this.Execute(request).then(function (response) {
                                response.data.folder.articles.forEach(function (article) {
                                    if (article.title == regionID) {
                                        if (window.location.host.indexOf('test.streamstats.usgs.gov') > -1) {
                                            _this.regionArticle = article.description;
                                        }
                                        else if (article.status == 2) {
                                            _this.regionArticle = article.description;
                                        }
                                        return;
                                    }
                                });
                            }, function (error) {
                            }).finally(function () {
                            });
                        }
                    }
                });
            };
            AboutController.prototype.getDisclaimersArticle = function () {
                var _this = this;
                console.log("Trying to open disclaimers article");
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.DisclaimersArticle;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved disclaimers article');
                    _this.disclaimersArticle = response.data.article.description;
                }, function (error) {
                }).finally(function () {
                    _this.getCreditsArticle();
                });
            };
            AboutController.prototype.getCreditsArticle = function () {
                var _this = this;
                console.log("Trying to open credits article");
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.CreditsArticle;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved credits article');
                    _this.disclaimersArticle += response.data.article.description;
                }, function (error) {
                }).finally(function () {
                });
            };
            AboutController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            AboutController.prototype.init = function () {
                this.AppVersion = configuration.version;
                this.getAboutArticle();
                this.getRegionHelpArticle();
                this.getActiveNews();
                this.getPastNews();
                this.getDisclaimersArticle();
            };
            AboutController.prototype.readCookie = function (name) {
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
            AboutController.prototype.createCookie = function (name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    var expires = "; expires=" + date.toUTCString();
                }
                else
                    var expires = "";
                document.cookie = name + "=" + value + expires + "; path=/";
            };
            AboutController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
            return AboutController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.AboutController', AboutController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
