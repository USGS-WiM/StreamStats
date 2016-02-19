//------------------------------------------------------------------------------
//----- WaterUse ---------------------------------------------------------------
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
module StreamStats.Controllers {
    'use string';
    interface IWateruseControllerScope extends ng.IScope {
        vm: IWateruseController;
    }

    interface IModal {
        Close():void
    }
    
    interface IWateruseController extends IModal {
        StartYear: number;
        EndYear: number; 
    }

    class WateruseController extends WiM.Services.HTTPServiceBase implements IWateruseController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        public StartYear: number;      
        public EndYear: number;              
        private _yearRange: any;
        public get YearRange():any {
            return this._yearRange;
        }
        public CanContiue: boolean;
        public result: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.StudyAreaService', '$modalInstance'];
        constructor($scope: IWateruseControllerScope, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, 'http://ssdev.cr.usgs.gov');
            $scope.vm = this;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.init();  
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetWaterUse() {
            this.CanContiue = false;
            //http://ssdev.cr.usgs.gov/streamstatsservices/wateruse.json?rcode=OH&workspaceID=OH20160217071851546000&startyear=2005&endyear=2009
            var url = configuration.queryparams['Wateruse'].format(this.StudyArea.RegionID, this.StudyArea.WorkspaceID,this.StartYear, this.EndYear);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response: any) => {                   
                    //sm when complete
                    this.result = response.data;
                    this.showResults = true;
                }, (error) => {
                    //sm when error

                    
                }).finally(() => {  
                    this.CanContiue = true;        
                });
        }
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.StartYear = new Date().getFullYear();
            this.EndYear = new Date().getFullYear();
            this._yearRange = { floor: 1980, draggableRange: true, noSwitching: true, showTicks: true, ceil: 2016 };
            this.CanContiue = true;
            this.showResults = false;
        }
        
    }//end wimLayerControlController class


    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.WateruseController', WateruseController);
}//end module 