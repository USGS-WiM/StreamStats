//------------------------------------------------------------------------------
//----- Help ---------------------------------------------------------------
//------------------------------------------------------------------------------

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
declare var opr: any;
declare var InstallTrigger: any;
module StreamStats.Controllers {
    'use string';
    interface IHelpControllerScope extends ng.IScope {
        vm: IHelpController;
    }

    interface IModal {
        Close(): void
    }

    interface IHelpController extends IModal {
        selectedHelpTabName: string;
    }

    class FreshdeskTicketData {
        public email: string;
        public description: string;
        public subject: string;
        public attachment: any;
        public custom_field: Object;
    }

    class HelpController extends WiM.Services.HTTPServiceBase implements IHelpController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamStats.Models.IStudyArea;
        public Upload: any;
        public http: any;
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public selectedHelpTabName: string;
        public user: string;
        public token: string;
        public freshdeskTicketData: FreshdeskTicketData;
        public showSuccessAlert: boolean;
        public submittingSupportTicket: boolean;
        public WorkspaceID: string; 
        public RegionID: string; 
        public AppVersion: string;
        public Browser: string;
        public Server: string;
        public faqArticles: Object;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$sce', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload'];
        constructor($scope: IHelpControllerScope, $http: ng.IHttpService, $sce: any, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, Upload) {
            super($http, '');
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
        public Close(): void {
            this.showSuccessAlert = false;
            this.modalInstance.dismiss('cancel');
        }

        public submitFreshDeskTicket(isValid): void {

            if (!isValid) return;

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
            if (this.freshdeskTicketData.attachment) formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
                "Content-Type": undefined
            };

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity);

            this.submittingSupportTicket = true;

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Successfully submitted help ticket: ', response);
                    
                    //clear out fields
                    this.freshdeskTicketData = new FreshdeskTicketData();

                    //show user feedback
                    this.showSuccessAlert = true;

                }, (error) => {
                    //sm when error
                }).finally(() => {
                    this.submittingSupportTicket = false;
                });
        }

        public getFAQarticles() {

            //console.log("Trying to open faq articles folder");

            var headers = {
                "Authorization": "Basic " + btoa(configuration.SupportTicketService.Token + ":" + 'X'),
            };

            var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.FAQarticlesFolder;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Successfully retrieved faq articles folder');

                    this.faqArticles = response.data.folder.articles;

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public convertUnsafe(x:string) {
            return this.sce.trustAsHtml(x);
        };

        public selectHelpTab(tabname: string): void {
            if (this.selectedHelpTabName == tabname) return;
            this.selectedHelpTabName = tabname;
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.getAppVersion();
            this.getBrowser();
            this.getFAQarticles()
            if (this.StudyArea && this.StudyArea.WorkspaceID) this.WorkspaceID = this.StudyArea.WorkspaceID;
            else this.WorkspaceID = '';
            if (this.StudyArea && this.StudyArea.RegionID) this.RegionID = this.StudyArea.RegionID;
            else this.RegionID = '';
            if (this.StudyArea && this.StudyArea.Server) this.Server = this.StudyArea.Server;
            else this.Server = '';
        }

        private getBrowser() {
            //modified from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

            // Opera 8.0+
            if ((!!(<any>window).opr && !!opr.addons) || !!(<any>window).opera || navigator.userAgent.indexOf(' OPR/') >= 0) this.Browser = "Opera";
            // Firefox 1.0+
            if (typeof InstallTrigger !== 'undefined') this.Browser = "Firefox";
            // At least Safari 3+: "[object HTMLElementConstructor]"
            if (Object.prototype.toString.call((<any>window).HTMLElement).indexOf('Constructor') > 0) this.Browser = "Safari";
            // Chrome 1+
            if (!!(<any>window).chrome && !!(<any>window).chrome.webstore) this.Browser = "Chrome";
            // Edge 20+
            if (!(/*@cc_on!@*/false || !!(<any>document).documentMode) && !!(<any>window).StyleMedia) this.Browser = "Edge";
            // Internet Explorer 6-11
            if (/*@cc_on!@*/false || !!(<any>document).documentMode) this.Browser = "IE";
        }

        private getAppVersion() {
            $.getJSON("version.js", (data) => {
                this.AppVersion = data.version;
            });
        }


    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.HelpController', HelpController);
}//end module 