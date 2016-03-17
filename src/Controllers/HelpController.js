//------------------------------------------------------------------------------
//----- Help ---------------------------------------------------------------
//------------------------------------------------------------------------------
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use string';
        var FreshdeskTicketData = (function () {
            function FreshdeskTicketData() {
            }
            return FreshdeskTicketData;
        })();
        var HelpController = (function (_super) {
            __extends(HelpController, _super);
            function HelpController($scope, $http, $sce, studyAreaService, modal, Upload) {
                _super.call(this, $http, '');
                $scope.vm = this;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.Upload = Upload;
                this.http = $http;
                this.sce = $sce;
                this.modalInstance = modal;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.freshdeskTicketData = new FreshdeskTicketData();
                this.selectedHelpTabName = "faq";
                this.showSuccessAlert = false;
                this.submittingSupportTicket = false;
                this.init();
            }
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
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
                //for (var key in this.freshdeskTicketData) {
                //    formdata.append(key, this.freshdeskTicketData[key]);
                //}
                /*  TESTING DATA  */
                //formdata.append('helpdesk_ticket[description]', 'sample description');
                //formdata.append('helpdesk_ticket[email]', 'demo@freshdesk.com');
                //formdata.append('helpdesk_ticket[subject]', 'Test subject');
                formdata.append('helpdesk_ticket[email]', this.freshdeskTicketData.email);
                formdata.append('helpdesk_ticket[subject]', this.freshdeskTicketData.subject);
                formdata.append('helpdesk_ticket[description]', this.freshdeskTicketData.description);
                formdata.append('helpdesk_ticket[custom_field][regionid_' + configuration.SupportTicketService.AccountID + ']', this.RegionID);
                formdata.append('helpdesk_ticket[custom_field][workspaceid_' + configuration.SupportTicketService.AccountID + ']', this.WorkspaceID);
                formdata.append('helpdesk_ticket[custom_field][server_' + configuration.SupportTicketService.AccountID + ']', this.Server);
                formdata.append('helpdesk_ticket[custom_field][browser_' + configuration.SupportTicketService.AccountID + ']', this.Browser);
                formdata.append('helpdesk_ticket[custom_field][softwareversion_' + configuration.SupportTicketService.AccountID + ']', this.AppVersion);
                //can loop over an opject and keep appending attachments here
                if (this.freshdeskTicketData.attachment)
                    formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                    "Content-Type": undefined
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity);
                this.submittingSupportTicket = true;
                this.Execute(request).then(function (response) {
                    console.log('Successfully submitted help ticket: ', response);
                    //clear out fields
                    _this.freshdeskTicketData = new FreshdeskTicketData();
                    //show user feedback
                    _this.showSuccessAlert = true;
                }, function (error) {
                    //sm when error
                }).finally(function () {
                    _this.submittingSupportTicket = false;
                });
            };
            HelpController.prototype.getFAQarticles = function () {
                var _this = this;
                console.log("Trying to open faq articles");
                var headers = {
                    "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                };
                var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.FAQarticles;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
                this.Execute(request).then(function (response) {
                    console.log('Successfully retrieved faq articles');
                    _this.faqArticles = response.data.folder.articles;
                }, function (error) {
                    //sm when error
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
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            HelpController.prototype.init = function () {
                this.getAppVersion();
                this.getBrowser();
                this.getFAQarticles();
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
                //modified from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
                // Opera 8.0+
                if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
                    this.Browser = "Opera";
                // Firefox 1.0+
                if (typeof InstallTrigger !== 'undefined')
                    this.Browser = "Firefox";
                // At least Safari 3+: "[object HTMLElementConstructor]"
                if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
                    this.Browser = "Safari";
                // Chrome 1+
                if (!!window.chrome && !!window.chrome.webstore)
                    this.Browser = "Chrome";
                // Edge 20+
                if (!(false || !!document.documentMode) && !!window.StyleMedia)
                    this.Browser = "Edge";
                // Internet Explorer 6-11
                if (false || !!document.documentMode)
                    this.Browser = "IE";
            };
            HelpController.prototype.getAppVersion = function () {
                var _this = this;
                $.getJSON("version.js", function (data) {
                    _this.AppVersion = data.version;
                });
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            HelpController.$inject = ['$scope', '$http', '$sce', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload'];
            return HelpController;
        })(WiM.Services.HTTPServiceBase); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.HelpController', HelpController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=HelpController.js.map