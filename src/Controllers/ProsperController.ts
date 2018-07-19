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
        public get description():string {
            return "The U.S. Geological Survey (USGS) has developed the PRObability of Streamflow PERmanence (PROSPER) model, a GIS raster-based empirical model that provides streamflow permanence probabilities (probabilistic predictions) of a stream channel having year-round flow for any unregulated and minimally-impaired stream channel in the Pacific Northwest region, U.S. The model provides annual predictions for 2004-2016 at a 30-m spatial resolution based on monthly or annually updated values of climatic conditions and static physiographic variables associated with the upstream basin (Raw streamflow permanence probability rasters). Predictions correspond to pixels on the channel network consistent with the medium resolution National Hydrography Dataset channel network stream grid. Probabilities were converted to wet and dry streamflow permanence classes (Categorical wet/dry rasters) with an associated confidence (Threshold and confidence interval rasters)."
        }
        
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