<<<<<<< HEAD
//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//   purpose:  
//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.
//Comments
//04.14.2015 jkn - Created
//Imports"
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var NavbarController = (function (_super) {
            __extends(NavbarController, _super);
            function NavbarController($scope, $http, modal, studyArea) {
                _super.call(this, $http, configuration.baseurls.StreamStatsServices);
                $scope.vm = this;
                this.modalService = modal;
                this.checkActiveNews();
                this.newArticleCount = 0;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.prototype.checkActiveNews = function () {
                var _this = this;
                console.log("Checking for active news articles");
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved active news articles page');
                    if (response.data.folder.articles.length > 0) {
                        response.data.folder.articles.forEach(function (article) {
                            //check if a cookie exists for this article;
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
                    //sm when error
                }).finally(function () {
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
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return NavbarController;
        }(WiM.Services.HTTPServiceBase)); //end class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NavbarController', NavbarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
=======
//------------------------------------------------------------------------------
//----- NavbarController ------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2014 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//   purpose:  
//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.
//Comments
//04.14.2015 jkn - Created
//Imports"
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var NavbarController = (function (_super) {
            __extends(NavbarController, _super);
            function NavbarController($scope, $http, modal, studyArea) {
                _super.call(this, $http, configuration.baseurls.StreamStatsServices);
                $scope.vm = this;
                this.modalService = modal;
                this.checkActiveNews();
                this.newArticleCount = 0;
            }
            //Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.prototype.checkActiveNews = function () {
                var _this = this;
                console.log("Checking for active news articles");
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.ActiveNewsFolder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved active news articles page');
                    if (response.data.folder.articles.length > 0) {
                        response.data.folder.articles.forEach(function (article) {
                            //check if a cookie exists for this article;
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
                    //sm when error
                }).finally(function () {
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
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
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
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            NavbarController.$inject = ['$scope', '$http', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService'];
            return NavbarController;
        }(WiM.Services.HTTPServiceBase)); //end class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.NavbarController', NavbarController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module
>>>>>>> 3fbfe1fe657d77c9a55950f17e25ea44d89caa5d
//# sourceMappingURL=Navbarcontroller.js.map