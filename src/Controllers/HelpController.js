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
        'use string';
        var FreshdeskTicketData = (function () {
            function FreshdeskTicketData() {
            }
            return FreshdeskTicketData;
        }());
        var HelpController = (function (_super) {
            __extends(HelpController, _super);
            function HelpController($scope, $http, $sce, studyAreaService, modal, Upload) {
                var _this = _super.call(this, $http, '') || this;
                $scope.vm = _this;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.Upload = Upload;
                _this.http = $http;
                _this.sce = $sce;
                _this.modalInstance = modal;
                _this.StudyAreaService = studyAreaService;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.freshdeskTicketData = new FreshdeskTicketData();
                _this.selectedHelpTabName = "help";
                _this.showSuccessAlert = false;
                _this.submittingSupportTicket = false;
                _this.init();
                return _this;
            }
            HelpController.prototype.Close = function () {
                this.showSuccessAlert = false;
                this.modalInstance.dismiss('cancel');
            };
            HelpController.prototype.submitFreshDeskTicket = function (isValid) {
                var _this = this;
                if (!isValid)
                    return;
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.CreateTicket;
                var formdata = new FormData();
                formdata.append('helpdesk_ticket[email]', this.freshdeskTicketData.email);
                formdata.append('helpdesk_ticket[subject]', this.freshdeskTicketData.subject);
                formdata.append('helpdesk_ticket[description]', this.freshdeskTicketData.description);
                formdata.append('helpdesk_ticket[custom_field][regionid_' + this.freshdeskCreds['AccountID'] + ']', this.RegionID);
                formdata.append('helpdesk_ticket[custom_field][workspaceid_' + this.freshdeskCreds['AccountID'] + ']', this.WorkspaceID);
                formdata.append('helpdesk_ticket[custom_field][server_' + this.freshdeskCreds['AccountID'] + ']', this.Server);
                formdata.append('helpdesk_ticket[custom_field][browser_' + this.freshdeskCreds['AccountID'] + ']', this.Browser);
                formdata.append('helpdesk_ticket[custom_field][softwareversion_' + this.freshdeskCreds['AccountID'] + ']', this.AppVersion);
                if (this.freshdeskTicketData.attachment)
                    formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);
                var headers = {
                    "Authorization": "Basic " + btoa(this.freshdeskCreds['Token'] + ":" + 'X'),
                    "Content-Type": undefined
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity);
                this.submittingSupportTicket = true;
                this.Execute(request).then(function (response) {
                    _this.freshdeskTicketData = new FreshdeskTicketData();
                    _this.showSuccessAlert = true;
                }, function (error) {
                }).finally(function () {
                    _this.submittingSupportTicket = false;
                });
            };
            HelpController.prototype.getFreshDeskArticles = function (folder) {
                var headers = {
                    "Authorization": "Basic " + btoa(this.freshdeskCreds['Token'] + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + folder;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                return this.Execute(request).then(function (response) {
                    var publishedArticles = [];
                    if (response.data.folder.articles.length) {
                        response.data.folder.articles.forEach(function (element) {
                            if (element.status == 2) {
                                publishedArticles.push(element);
                            }
                            ;
                        });
                        return publishedArticles;
                    }
                }, function (error) {
                    return "There was a problem getting this article";
                }).finally(function () {
                });
            };
            HelpController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            HelpController.prototype.selectHelpTab = function (tabname) {
                if (this.selectedHelpTabName == tabname)
                    return;
                this.selectedHelpTabName = tabname;
            };
            HelpController.prototype.init = function () {
                var _this = this;
                this.getBrowser();
                this.AppVersion = configuration.version;
                this.freshdeskCreds = this.StudyAreaService.freshdeskCredentials;
                if (this.freshdeskCreds) {
                    this.getFreshDeskArticles(configuration.SupportTicketService.FAQarticlesFolder).then(function (response) { _this.faqArticles = response; });
                    this.getFreshDeskArticles(configuration.SupportTicketService.UserManualArticlesFolder).then(function (response) { _this.helpArticles = response; });
                }
                if (this.StudyArea && this.StudyArea.WorkspaceID)
                    this.WorkspaceID = this.StudyArea.WorkspaceID;
                else
                    this.WorkspaceID = '';
                if (this.StudyArea && this.StudyArea.RegionID)
                    this.RegionID = this.StudyArea.RegionID;
                else
                    this.RegionID = '';
                if (this.StudyArea && this.StudyArea.Server)
                    this.Server = this.StudyArea.Server;
                else
                    this.Server = '';
            };
            HelpController.prototype.getBrowser = function () {
                if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
                    this.Browser = "Opera";
                if (typeof InstallTrigger !== 'undefined')
                    this.Browser = "Firefox";
                if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
                    this.Browser = "Safari";
                if (!!window.chrome && !!window.chrome.webstore)
                    this.Browser = "Chrome";
                if (!(false || !!document.documentMode) && !!window.StyleMedia)
                    this.Browser = "Edge";
                if (false || !!document.documentMode)
                    this.Browser = "IE";
            };
            HelpController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload'];
            return HelpController;
        }(WiM.Services.HTTPServiceBase));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.HelpController', HelpController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
