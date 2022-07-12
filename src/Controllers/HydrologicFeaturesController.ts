//------------------------------------------------------------------------------
//----- Hydrologic Features controller------------------------------------------------
//------------------------------------------------------------------------------

//Import
module StreamStats.Controllers {
    'use strict';
    interface IHydrologicFeaturesControllerScope extends ng.IScope {
        vm: IHydrologicFeaturesController;
    }

    interface IModal {
        close():void
    }

    interface IHydrologicFeaturesController extends IModal {
    }

    class HydrologicFeaturesController extends WiM.Services.HTTPServiceBase implements IHydrologicFeaturesController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private studyAreaService: Services.IStudyAreaService;
        public angulartics: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', 'toaster', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: IHydrologicFeaturesControllerScope, $analytics, toaster, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.studyAreaService = studyAreaService;
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public selectStream(stream) {
            console.log("Stream selected: " + stream.GNIS_ID);
            this.studyAreaService.selectedStudyArea.NHDStream = stream;
        }

        public selectHUC8(HUC8) {
            console.log("HUC8 selected: " + HUC8.huc8);
            this.studyAreaService.selectedStudyArea.WBDHUC8 = HUC8;
        }

        public close(): void {
            this.modalInstance.dismiss('cancel');
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private init(): void {}
        
    } 

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.HydrologicFeaturesController', HydrologicFeaturesController);

}//end module 