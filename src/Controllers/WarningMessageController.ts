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
    interface IWarningMessageControllerScope extends ng.IScope {
        vm: IWarningMessageController;
    }

    interface IModal {
        Close(): void
    }

    interface IWarningMessageController extends IModal {
    }

    class WarningMessageController extends WiM.Services.HTTPServiceBase implements IWarningMessageController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public warningMessage: string;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', '$modalInstance'];
        constructor($scope: IWarningMessageControllerScope, $http: ng.IHttpService, modal: ng.ui.bootstrap.IModalServiceInstance) {
            super($http, '');
            $scope.vm = this;
            this.modalInstance = modal;
            this.init();
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel');
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.warningMessage = configuration.warningModalMessage;
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.WarningMessageController', WarningMessageController);
}//end module 