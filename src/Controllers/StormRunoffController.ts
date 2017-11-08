//------------------------------------------------------------------------------
//----- Storm runnoff controller------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//02.17.2016 jkn - Created

//Import
declare var d3: any;
module StreamStats.Controllers {
    'use strict';
    interface IStormRunoffControllerScope extends ng.IScope {
        vm: IStormRunoffController;
    }

    interface IModal {
        Close():void
    }
    
    interface IStormRunoffController extends IModal {
    }

    class StormRunoffController extends WiM.Services.HTTPServiceBase implements IStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        public result: any;

      //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout'];
        constructor($scope: IStormRunoffControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance, public $timeout:ng.ITimeoutService) {
            super($http, configuration.baseurls.WaterUseServices);
            $scope.vm = this;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.init();              
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
        
        
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            
        }
        
    }//end wimLayerControlController class    
    

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
}//end module 