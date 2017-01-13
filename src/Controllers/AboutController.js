//------------------------------------------------------------------------------
//----- About ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2016 WiM - USGS
//    authors:  Martyn J. Smith USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//Comments
//03.07.2016 mjs - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var AboutController = (function (_super) {
            __extends(AboutController, _super);
            function AboutController($scope, $http, $sce, modalService, region, studyAreaService, modal) {
                _super.call(this, $http, configuration.baseurls.StreamStats);
                $scope.vm = this;
                this.sce = $sce;
                this.modalInstance = modal;
                this.modalService = modalService;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.regionService = region;
                this.selectedAboutTabName = "about";
                this.init();
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            AboutController.prototype.selectAboutTab = function (tabname) {
                if (this.selectedAboutTabName == tabname)
                    return;
                this.selectedAboutTabName = tabname;
                //console.log('selected tab: '+tabname);
            };
            AboutController.prototype.getActiveNews = function () {
                //console.log("Trying to open active news articles folder");
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    //console.log('Successfully retrieved active news articles folder');
                    if (response.data.folder.articles.length) {
                        _this.activeNewsArticles = response.data.folder.articles;
                    }
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            AboutController.prototype.getPastNews = function () {
                //console.log("Trying to open past news articles folder");
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.PastNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    //console.log('Successfully retrieved past news articles folder');
                    _this.pastNewsArticles = response.data.folder.articles;
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            AboutController.prototype.getAboutArticle = function () {
                //console.log("Trying to open about article");
                var _this = this;
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.AboutArticle;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    //console.log('Successfully retrieved about article');
                    _this.aboutArticle = response.data.article.description;
                }, function (error) {
                    //sm when error
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
                //console.log("Trying to open help article for: ", regionID);
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.RegionInfoFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                //clear article
                this.regionArticle = null;
                this.Execute(request).then(function (response) {
                    response.data.folder.articles.forEach(function (article) {
                        if (article.title == regionID) {
                            //console.log("Help article found for : ", regionID);
                            _this.regionArticle = article;
                            return;
                        }
                    });
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            AboutController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.prototype.init = function () {
                //console.log("in about controller");
                this.getAboutArticle();
                this.getRegionHelpArticle();
                this.getActiveNews();
                this.getPastNews();
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            AboutController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
            return AboutController;
        }(WiM.Services.HTTPServiceBase)); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.AboutController', AboutController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=AboutController.js.map