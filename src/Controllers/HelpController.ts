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
        public Server: string;
        private modalService: Services.IModalService;
        public currentDate = new Date(); 

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

        // public submitFreshDeskTicket(isValid): void {

        //     if (!isValid) return;

        //     var url = configuration.SupportTicketService.BaseURL + configuration.SupportTicketService.CreateTicket;

        //     var formdata = new FormData();

        //     formdata.append('helpdesk_ticket[email]', this.freshdeskTicketData.email);
        //     formdata.append('helpdesk_ticket[subject]', this.freshdeskTicketData.subject);
        //     formdata.append('helpdesk_ticket[description]', this.freshdeskTicketData.description);

        //     formdata.append('helpdesk_ticket[custom_field][regionid_' + this.freshdeskCreds['AccountID'] + ']', this.RegionID);
        //     formdata.append('helpdesk_ticket[custom_field][workspaceid_' + this.freshdeskCreds['AccountID'] + ']', this.WorkspaceID);
        //     formdata.append('helpdesk_ticket[custom_field][server_' + this.freshdeskCreds['AccountID'] + ']', this.Server);
        //     formdata.append('helpdesk_ticket[custom_field][browser_' + this.freshdeskCreds['AccountID'] + ']', this.Browser);
        //     formdata.append('helpdesk_ticket[custom_field][softwareversion_' + this.freshdeskCreds['AccountID'] + ']', this.AppVersion);

        //     //can loop over an opject and keep appending attachments here
        //     if (this.freshdeskTicketData.attachment) formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);

        //     var headers = {
        //         "Authorization": "Basic " + btoa(this.freshdeskCreds['Token'] + ":" + 'X'),
        //         "Content-Type": undefined
        //     };

        //     var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity);

        //     this.submittingSupportTicket = true;

        //     this.Execute(request).then(
        //         (response: any) => {
        //             //console.log('Successfully submitted help ticket: ', response);
                    
        //             //clear out fields
        //             this.freshdeskTicketData = new FreshdeskTicketData();

        //             //show user feedback
        //             this.showSuccessAlert = true;

        //         }, (error) => {
        //             //sm when error
        //         }).finally(() => {
        //             this.submittingSupportTicket = false;
        //         });
        // }

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
            this.AppVersion = configuration.version;

            if (this.StudyArea && this.StudyArea.WorkspaceID) this.WorkspaceID = this.StudyArea.WorkspaceID;
            else this.WorkspaceID = 'None';
            if (this.StudyArea && this.StudyArea.RegionID) this.RegionID = this.StudyArea.RegionID;
            else this.RegionID = 'None';
            if (this.StudyArea && this.StudyArea.Server) this.Server = this.StudyArea.Server;
            else this.Server = 'NA';

            if (this.modalService.modalOptions) { // Open correct tab
                if (this.modalService.modalOptions.tabName) this.selectHelpTab(this.modalService.modalOptions.tabName);
            }
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.HelpController', HelpController);
}//end module 