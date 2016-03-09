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

module StreamStats.Controllers {
    'use string';
    interface IHelpControllerScope extends ng.IScope {
        vm: IHelpController;
    }

    interface IModal {
        Close():void
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
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public selectedHelpTabName: string;
        public displayMessage: string;
        public isValid: boolean;
        public uploader: any;
        public user: string;
        public token: string;
        public freshdeskTicketData: FreshdeskTicketData;
        public picFile: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'Upload'];
        constructor($scope: IHelpControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, Upload) {
            super($http, '');
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

            this.init();  

        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public submitFreshDeskTicket(isValid): void {

            //if (!isValid) return;

            var url = 'https://clhimages.freshdesk.com/helpdesk/tickets.json';

            var formdata = new FormData();

            //for (var key in this.freshdeskTicketData) {
            //    formdata.append(key, this.freshdeskTicketData[key]);
            //}

            formdata.append('helpdesk_ticket[description]', 'sample description');
            formdata.append('helpdesk_ticket[email]', 'demo@freshdesk.com');
            formdata.append('helpdesk_ticket[subject]', 'Test subject');
            formdata.append('helpdesk_ticket[custom_field]', angular.toJson({"WorkspaceID":"testID1234"}));
            //if (this.freshdeskTicketData.attachment) formdata.append('helpdesk_ticket[attachments][][resource]', this.freshdeskTicketData.attachment, this.freshdeskTicketData.attachment.name);

            var headers = {
                "Authorization": "Basic " + btoa('Z5xWbeVI7HEPg2Wb9mii' + ":" + 'X'),
                "Content-Type": undefined
            };

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', formdata, headers, angular.identity );

            this.Execute(request).then(
                (response: any) => {
                    console.log('Got a response: ', response);
                    //sm when complete
                }, (error) => {
                    //sm when error
                }).finally(() => {
                });
        }

        public selectHelpTab(tabname: string): void {
            if (this.selectedHelpTabName == tabname) return;
            this.selectedHelpTabName = tabname;
            //console.log('selected tab: ' + tabname);
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
          
        }
      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.HelpController', HelpController);
}//end module 