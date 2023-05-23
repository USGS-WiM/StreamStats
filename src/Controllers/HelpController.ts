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

    class TicketData {
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
        private StudyAreaService: Services.IStudyAreaService;
        public Upload: any;
        public http: any;
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public selectedHelpTabName: string;
        public ticketData: TicketData;
        public showSuccessAlert: boolean;
        public submittingSupportTicket: boolean;
        public WorkspaceID: string;
        public RegionID: string;
        public AppVersion: string;
        public Browser: string;
        public Server: string;
        private modalService: Services.IModalService;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$sce', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload', 'StreamStats.Services.ModalService'];
        constructor($scope: IHelpControllerScope, $http: ng.IHttpService, $sce: any, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, Upload, modalService: Services.IModalService) {
            super($http, '');
            $scope.vm = this;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.Upload = Upload;
            this.http = $http;
            this.sce = $sce;
            this.modalService = modalService;
            this.modalInstance = modal;
            this.StudyAreaService = studyAreaService;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.ticketData = new TicketData();
            this.selectedHelpTabName = "help";
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

        public submitTicket(isValid): void {

            if (!isValid) return;

            //var formdata = new FormData();

            // formdata.append('helpdesk_ticket[email]', this.ticketData.email);
            // formdata.append('helpdesk_ticket[subject]', this.ticketData.subject);
            // formdata.append('helpdesk_ticket[description]', this.ticketData.description);
            // formdata.append('helpdesk_ticket[custom_field][regionid]', this.RegionID);
            // formdata.append('helpdesk_ticket[custom_field][workspaceid]', this.WorkspaceID);
            // formdata.append('helpdesk_ticket[custom_field][server]', this.Server);
            // formdata.append('helpdesk_ticket[custom_field][browser]', this.Browser);
            // formdata.append('helpdesk_ticket[custom_field][softwareversion]', this.AppVersion);

            this.submittingSupportTicket = true;

            var description = this.ticketData.description + 
            '\n\nRegion: ' + this.RegionID +
            '\nWorkspaceID: ' + this.WorkspaceID +
            '\nServer: ' + this.Server +
            '\nBrowser: ' + this.Browser +
            '\nAppVersion: ' + this.AppVersion 

            var link = "mailto:streamstats@usgs.gov"
            + "?subject=" + encodeURIComponent(this.ticketData.subject)
            + "&body=" + encodeURIComponent(description);
   
            window.location.href = link;

            // this.Execute(request).then(
            //     (response: any) => {
            //         //console.log('Successfully submitted help ticket: ', response);
                    
            //         //clear out fields
            //         this.ticketData = new TicketData();

            //         //show user feedback
            //         this.showSuccessAlert = true;

            //     }, (error) => {
            //         //sm when error
            //     }).finally(() => {
            //         this.submittingSupportTicket = false;
            //     });
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
            this.getBrowser();
            this.AppVersion = configuration.version;

            if (this.StudyArea && this.StudyArea.WorkspaceID) this.WorkspaceID = this.StudyArea.WorkspaceID;
            else this.WorkspaceID = '';
            if (this.StudyArea && this.StudyArea.RegionID) this.RegionID = this.StudyArea.RegionID;
            else this.RegionID = '';
            if (this.StudyArea && this.StudyArea.Server) this.Server = this.StudyArea.Server;
            else this.Server = '';

            if (this.modalService.modalOptions) { // Open correct tab
                if (this.modalService.modalOptions.tabName) this.selectHelpTab(this.modalService.modalOptions.tabName);
            }
        }

        private getBrowser() {
            //modified from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

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

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.HelpController', HelpController);
}//end module 