//------------------------------------------------------------------------------
//----- Prosper ----------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2018 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//07.17.2018 jkn - Created

//Import
module StreamStats.Controllers {
    'use strict';
    interface IProsperScope extends ng.IScope {
        vm: IProsperController;
    }

    interface IProsperController {

    }

    class ProsperController implements IProsperController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;    
        public CanContiue: boolean;
        private prosperServices: Services.IProsperService;
        
      //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance','StreamStats.Services.ProsperService'];
        constructor($scope: IProsperScope, modal:ng.ui.bootstrap.IModalServiceInstance, pservices:StreamStats.Services.IProsperService) {
            $scope.vm = this;
            this.modalInstance = modal;
            this.init();   
            this.prosperServices = pservices;
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
        public Reset(): void {
            this.init();
        }
        public Print(): void {
            window.print();
        }
        
        public DownloadCSV() {            
            
        }   
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {

        }
        
    }//end Controller class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ProsperController', ProsperController);
}//end module 