//------------------------------------------------------------------------------
//----- FlowAnywhereController ----------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2019 WiM - USGS

//    authors:  Jeremy K. Newson USGS Web Informatics and Mapping
//             
// 
//   purpose:  Flow Anywhere Controller
//          
//discussion:


//Comments
//07.24.2019 jkn - Created

//Import

module StreamStats.Controllers {
    interface IFlowAnywhereControllerScope extends ng.IScope {
        vm: IFlowAnywhereController;
    }
    interface IModal {
        close(): void
    }
    interface IFlowAnywhereController extends IModal {
    }
    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }
    class FlowAnywhereController extends WiM.Services.HTTPServiceBase implements IFlowAnywhereController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private explorationService: Services.IExplorationService;
        private studyAreaService: Services.IStudyAreaService;
        private modalService: Services.IModalService;
        private eventManager: WiM.Event.IEventManager;

        public angulartics: any;
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
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
        constructor($scope: IFlowAnywhereControllerScope, $analytics, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, studyArea: Services.IStudyAreaService, private events: WiM.Event.IEventManager, $http: ng.IHttpService, toaster) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.angulartics = $analytics;
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
                this.studyAreaService.flowAnywhereData = {};
                this.studyAreaService.flowAnywhereData.dateRange = this.dateRange;
                this.studyAreaService.flowAnywhereData.selectedGage = this.selectedReferenceGage;
                this.toaster.pop('success', "Flow Anywhere Method was successfully configured", "Please continue", 5000);
            } else {
                this.toaster.pop('error', "Error", errorMessage, 0);
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
            var url = configuration.baseurls.FlowAnywhereMapServices + configuration.queryparams.FlowAnywhereGages.format(lon, lat)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.features) {
                        this.referenceGageList = [];
                        response.data.features.forEach(gage => {
                            this.gage = new Models.ReferenceGage(gage.attributes["reference_gages.site_id"], gage.attributes["reference_gages.site_name"])
                            this.gage.DrainageArea_sqMI = gage.attributes["reference_gages.da_gis_mi2"];
                            this.gage.Latitude_DD = gage.attributes["reference_gages.lat_dd_nad"];
                            this.gage.Longitude_DD = gage.attributes["reference_gages.long_dd_na"];
                            this.gage.AggregatedRegion = gage.attributes["regions_local.Region_Agg"];
                            this.getNWISPeriodOfRecord(this.gage);
                            this.referenceGageList.push(this.gage);
                        });
                    } else if (response.error.code == 400) {
                        this.referenceGageList = null;
                    }
                    this.isBusy = false;
                    
                }, (error) => {
                    this.toaster.clear();
                    this.isBusy = false;
                    this.toaster.pop('error', "Error", "Error accessing Flow Anywhere gages", 0);
                }).finally(() => {
                    
            });

            // Set initial date range for date selector
            this.dateRange = { dates: { startDate: this.addDay(new Date(), -32), endDate: this.addDay(new Date(), -2) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
        }
        private load(): void {
            // Get drainage area if not already retrieved/retrieving
            if (this.getDrainageArea() == 'N/A' && !this.studyAreaService.loadingDrainageArea) this.studyAreaService.loadDrainageArea();

            if (this.studyAreaService.flowAnywhereData) {
                // Get selected reference gage if it was already selected
                if (this.studyAreaService.flowAnywhereData.selectedGage) {
                    this.selectedReferenceGage = this.studyAreaService.flowAnywhereData.selectedGage;
                }
                // Set date range if it was already selected
                if (this.studyAreaService.flowAnywhereData.dateRange) {
                    this.dateRange = this.studyAreaService.flowAnywhereData.dateRange;
                }
            }
        }

        private verifyExtensionCanContinue() {

            // Check that a reference gage was selected
            if (!this.selectedReferenceGage) {
                return "A reference gage must be selected.";
            }
            if (this.selectedReferenceGage.StationID == "") {
                return "A reference gage must be selected.";
            }

            // Check that dates are valid
            if (this.dateRange) {
                if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {
                    return "Date range is not valid.";
                }
            }
            if (this.selectedReferenceGage.StartDate > this.dateRange.dates.startDate) {
                return "The selected start date is not valid for the selected reference gage."
            } 
            if (this.selectedReferenceGage.EndDate < this.dateRange.dates.endDate) {
                return "The selected end date is not valid for the selected reference gage."
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

        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modalService.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }

        public selectGage(gage) {
            this.selectedReferenceGage = gage;
        }

        public getStyling(gage) {
            if (this.selectedReferenceGage && gage.StationID == this.selectedReferenceGage.StationID) 
                return {'background-color': '#FFF' }
            else
                return {'background-color': 'unset'}
        }

        public getNWISPeriodOfRecord(gage) {
            this.isBusy = true;
            if (!gage.StationID) return;
            var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISperiodOfRecord + gage.StationID;
            var nwis_request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(nwis_url, true, WiM.Services.Helpers.methodType.GET, 'TEXT');

            this.Execute(nwis_request).then(
                (response: any) => {
                    var data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    var headers:Array<string> = data.shift().split('\t');
                    //remove extra random line
                    data.shift();
                    do {
                        var station = data.shift().split('\t');
                        if (station[headers.indexOf("parm_cd")] == "00060") {
                            if (gage['StartDate'] == undefined) gage['StartDate'] = new Date(station[headers.indexOf("begin_date")]);
                            else {
                                var nextStartDate = new Date(station[headers.indexOf("begin_date")]);
                                if (nextStartDate < gage['StartDate']) gage['StartDate'] = nextStartDate;
                            }

                            if (gage['EndDate'] == undefined) gage['EndDate'] = new Date(station[headers.indexOf("end_date")]);
                            else {
                                var nextEndDate = new Date(station[headers.indexOf("end_date")]);
                                if (nextEndDate > gage['EndDate']) gage['EndDate'] = nextEndDate;
                            }
                        }
                    } while (data.length > 0);
                    this.toaster.clear();
                    this.isBusy = false;

                }, (error) => {
                    //sm when error
                    this.toaster.clear();
                    this.isBusy = false;
                    this.toaster.pop('error', "Error", "NWIS period of record not found", 0);
                }).finally(() => {

            });
        }

        public getDrainageArea() {
            var drainageArea = this.studyAreaService.studyAreaParameterList.filter(p => p.code.toLowerCase() == 'drnarea')[0];
            if (drainageArea && drainageArea.hasOwnProperty('value')) return drainageArea.value;
            else return 'N/A';
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.FlowAnywhereController', FlowAnywhereController);
}//end module 