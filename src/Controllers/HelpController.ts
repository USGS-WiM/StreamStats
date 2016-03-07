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

    class SupportTicketData {
        public name: string;
        public email: string;
        public subject: string;
        public comment: string;
        public attachments: any;
    }

    class GitHubIssueData {
        public firstName: string;
        public lastName: string;
        public email: string;
        public description: string;
        public type: string;
        public labels: Array<string>;
    }

    class HelpController extends WiM.Services.HTTPServiceBase implements IHelpController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public selectedHelpTabName: string;
        public gitHubIssues: GitHubIssueData;
        public SupportTicketData: SupportTicketData;
        public displayMessage: string;
        public isValid: boolean;
        public uploader: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', 'FileUploader'];
        constructor($scope: IHelpControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, uploader: any) {
            super($http, 'http://ssdev.cr.usgs.gov');
            $scope.vm = this;
            this.uploader = uploader;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.selectedHelpTabName = "faq";
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        //public submitGitHubIssue(): void {
        //    var url = 'https://api.github.com/repos/USGS-WIM/StreamStats/issues';

        //    if (this.gitHubIssueData.type) {
        //        this.gitHubIssueData.labels.push(this.gitHubIssueData.type)
        //    }
        //    this.gitHubIssueData.body = 'First Name: ' + this.gitHubIssueData.firstName + '\nLast Name: ' + this.gitHubIssueData.lastName + '\nEmail: ' + this.gitHubIssueData.email + '\nDescription: ' + this.gitHubIssueData.description;
        //    var data = angular.toJson(this.gitHubIssueData);
        //    var headers = {
        //        'Authorization': 'token 6991db72b598a37339260c9f4ef28a6fe20a1c4b'
        //    };
        //    var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url,true,Services.Helpers.methodType.POST,'json',data, headers);

        //    this.Execute(request).then(
        //        (response: any) => {
        //            console.log('Got a response: ', response.statusText);
        //            //sm when complete
        //        },(error) => {
        //            //sm when error
        //        }).finally(() => {
        //            this.toggleAboutSelected();
        //    });
        //}

        public submitTicket(isValid: boolean): void {

            //console.log("ticket form validity: ", isValid);

            //if (!isValid) return;
            var url = 'https://streamstatshelp.zendesk.com/api/v2/tickets.json ';
            var data = angular.toJson({ "ticket": this.SupportTicketData });
            var user = 'marsmith@usgs.gov';
            var token = 'bCkA8dLeVkzs5mTPamt1g7zv8EMKUCuTRpPkW7Ez';

            //console.log('ticket data',data);
            var headers = {
                "Authorization": "Basic " + btoa(user + '/token:' + token)
            };
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', data, headers);

            this.Execute(request).then(
                (response: any) => {
                    //console.log('Got a response: ', response);
                    alert("Your request has been submitted.  Your request will be addressed as soon as possible");
                    this.SupportTicketData = new SupportTicketData();
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