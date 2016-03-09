//------------------------------------------------------------------------------
//----- Help ---------------------------------------------------------------
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
        var FreshdeskTicketData = (function () {
            function FreshdeskTicketData() {
            }
            return FreshdeskTicketData;
        })();
        var HelpController = (function (_super) {
            __extends(HelpController, _super);
            function HelpController($scope, $http, studyAreaService, modal, Upload) {
                _super.call(this, $http, '');
                $scope.vm = this;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.Upload = Upload;
                this.http = $http;
                this.modalInstance = modal;
                this.StudyArea = studyAreaService.selectedStudyArea;
                this.freshdeskTicketData = new FreshdeskTicketData();
                this.selectedHelpTabName = "faq";
                this.user = 'marsmith@usgs.gov';
                this.token = '7hwJo1vC8WXCCM8UtsGc5U8tj4gYedRlpnK0nrBb';
                this.showSuccessAlert = false;
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
                var url = 'https://streamstats.freshdesk.com/helpdesk/tickets.json';
                var formdata = new FormData();
                //for (var key in this.freshdeskTicketData) {
                //    formdata.append(key, this.freshdeskTicketData[key]);
                //}
                /*  TESTING DATA  */
                //formdata.append('helpdesk_ticket[description]', 'sample description');
                //formdata.append('helpdesk_ticket[email]', 'demo@freshdesk.com');
                //formdata.append('helpdesk_ticket[subject]', 'Test subject');
                //formdata.append('helpdesk_ticket[WorkspaceID]',  'testID1234' );
                //formdata.append('helpdesk_ticket[custom_field]', angular.toJson({ "WorkspaceID": "testID1234" }));
                //formdata.append('helpdesk_ticket[custom_field]', angular.toJson({ "Server": "testID1234" }));
                //formdata.append('helpdesk_ticket[custom_field]', angular.toJson({ "Browser": "testID1234" }));
                //formdata.append('helpdesk_ticket[custom_field]', angular.toJson({ "SoftwareVersion": "testID1234" }));
                formdata.append('helpdesk_ticket[email]', this.freshdeskTicketData.email);
                formdata.append('helpdesk_ticket[subject]', this.freshdeskTicketData.subject);
                formdata.append('helpdesk_ticket[description]', this.freshdeskTicketData.description);
                //can loop over an opject and keep appending attachments here
                if (this.freshdeskTicketData.attachment)
                    formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);
                var headers = {
                    "Authorization": "Basic " + btoa('***REMOVED***' + ":" + 'X'),
                    "Content-Type": undefined
                };
                var request = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity);
                this.Execute(request).then(function (response) {
                    console.log('Successfully submitted help ticket: ', response);
                    //clear out fields
                    _this.freshdeskTicketData = new FreshdeskTicketData();
                    //show user feedback
                    _this.showSuccessAlert = true;
                }, function (error) {
                    //sm when error
                }).finally(function () {
                });
            };
            HelpController.prototype.selectHelpTab = function (tabname) {
                if (this.selectedHelpTabName == tabname)
                    return;
                this.selectedHelpTabName = tabname;
                //console.log('selected tab: ' + tabname);
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            HelpController.prototype.init = function () {
            };
            HelpController.prototype.getBrowser = function () {
                //// Opera 8.0+
                //var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                //// Firefox 1.0+
                //var isFirefox = typeof InstallTrigger !== 'undefined';
                //// At least Safari 3+: "[object HTMLElementConstructor]"
                //var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                //// Internet Explorer 6-11
                //var isIE = /*@cc_on!@*/false || !!document.documentMode;
                //// Edge 20+
                //var isEdge = !isIE && !!window.StyleMedia;
                //// Chrome 1+
                //var isChrome = !!window.chrome && !!window.chrome.webstore;
                //// Blink engine detection
                //var isBlink = (isChrome || isOpera) && !!window.CSS;
            };
            //Constructor
            //-+-+-+-+-+-+-+-+-+-+-+-
            HelpController.$inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload'];
            return HelpController;
        })(WiM.Services.HTTPServiceBase); //end  class
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.HelpController', HelpController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=HelpController.js.map