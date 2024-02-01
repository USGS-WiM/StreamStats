//------------------------------------------------------------------------------
//----- FlowAnywhereController ----------------------------------------
//------------------------------------------------------------------------------

module StreamStats.Controllers {
    interface ISedimentControllerScope extends ng.IScope {
        vm: ISedimentController;
    }
    interface IModal {
        close(): void
    }
    interface ISedimentController extends IModal {
    }
    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }
    class SedimentController extends WiM.Services.HTTPServiceBase implements ISedimentController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private explorationService: Services.IExplorationService;
        private studyAreaService: Services.IStudyAreaService;
        private modalService: Services.IModalService;
        private eventManager: WiM.Event.IEventManager;

        public title: string;
        public isBusy: boolean = false;
        public toaster: any;
        public dateRange: IDateRange;
        public dateRangeOptions;
        public selectedReferenceGage: StreamStats.Models.IReferenceGage = null;
        public referenceGageList: Array<StreamStats.Models.IReferenceGage>;        
        private gage: StreamStats.Models.IReferenceGage;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
        constructor($scope: ISedimentControllerScope, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, studyArea: Services.IStudyAreaService, private events: WiM.Event.IEventManager, $http: ng.IHttpService, toaster) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.studyAreaService = studyArea; 
            this.modalService = modalservice;
            this.eventManager = events;
            this.toaster = toaster;

            this.init();
            this.load();

        }
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.modalInstance.dismiss('cancel');
        }
        public ok(): void {
            //validate info
            var errorMessage = this.verifyExtensionCanContinue();
            if (!errorMessage) {
                this.close();
                // this.studyAreaService.flowAnywhereData = {};
                // this.studyAreaService.flowAnywhereData.dateRange = this.dateRange;
                // this.studyAreaService.flowAnywhereData.selectedGage = this.selectedReferenceGage;
                this.toaster.pop('success', "Sediment Machine Learning Method was successfully configured", "Please continue", 5000);
            } else {
                this.toaster.pop('error', "Error", errorMessage, 5000);
            }
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.isBusy = true;

            // Load list of reference gages from Flow Anywhere Gages service
            this.referenceGageList = null;
            var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
            var lon = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
            var url = configuration.baseurls.StreamStatsMapServices + configuration.queryparams.FlowAnywhereGages.format(lon, lat)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            // this.Execute(request).then(
            //     (response: any) => {
            //         if (response.data.features) {
            //             this.referenceGageList = [];
            //             response.data.features.forEach(gage => {
            //                 this.gage = new Models.ReferenceGage(gage.attributes["reference_gages.site_id"], gage.attributes["reference_gages.site_name"])
            //                 this.gage.DrainageArea_sqMI = gage.attributes["reference_gages.da_pub_mi2"];
            //                 this.gage.Latitude_DD = gage.attributes["reference_gages.lat_dd_nad"];
            //                 this.gage.Longitude_DD = gage.attributes["reference_gages.long_dd_na"];
            //                 this.gage.AggregatedRegion = gage.attributes["regions_local.Region_Agg"];
            //                 this.getNWISPeriodOfRecord(this.gage);
            //                 this.referenceGageList.push(this.gage);
            //             });
            //         } else if (response.error.code == 400) {
            //             this.referenceGageList = null;
            //         }
            //         this.isBusy = false;
                    
            //     }, (error) => {
            //         this.toaster.clear();
            //         this.isBusy = false;
            //         this.toaster.pop('error', "Error", "Error accessing Flow Anywhere gages", 0);
            //     }).finally(() => {
                    
            // });

            // // Set initial date range for date selector
            this.dateRange = { dates: { startDate: this.addDay(new Date(), -32), endDate: this.addDay(new Date(), -2) }, minDate: new Date(2006, 0, 1), maxDate: this.addDay(new Date(), -1) };
        }
        private load(): void {
            // Get drainage area if not already retrieved/retrieving
            // if (this.getDrainageArea() == 'N/A' && !this.studyAreaService.loadingDrainageArea) this.studyAreaService.loadDrainageArea();

            // if (this.studyAreaService.flowAnywhereData) {
            //     // Get selected reference gage if it was already selected
            //     if (this.studyAreaService.flowAnywhereData.selectedGage) {
            //         this.selectedReferenceGage = this.studyAreaService.flowAnywhereData.selectedGage;
            //     }
            //     // Set date range if it was already selected
            //     if (this.studyAreaService.flowAnywhereData.dateRange) {
            //         this.dateRange = this.studyAreaService.flowAnywhereData.dateRange;
            //     }
            // }
        }
        private verifyExtensionCanContinue() {

            // Check that dates are valid
            if (this.dateRange) {
                if ((this.dateRange.dates === undefined || this.dateRange.dates.startDate === undefined || this.dateRange.dates.endDate === undefined) || !((this.dateRange.dates || this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                    return "Date range is not valid.";
                }
            }

            return null;
        }
        private addDay(d: Date, days: number): Date {
            try {
                var dayAsTime: number = 1000 * 60 * 60 * 24;
                return new Date(d.getTime() + days * dayAsTime);
            }
            catch (e) {
                return d;
            }
        }


    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.SedimentController', SedimentController);
}//end module 