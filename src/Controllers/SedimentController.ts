//------------------------------------------------------------------------------
//----- FlowAnywhereController ----------------------------------------
//------------------------------------------------------------------------------

module StreamStats.Controllers {

    declare var turf;

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
        public referenceGageListAll;
        public queryBy = 'Nearest';
        public getNearest = false;
        public distance = 10;
        public stationNumber = '';
        
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
        public setReferenceGageFromMap(name) {
            this.isBusy = true;
            this.studyAreaService.doSelectMapGage = true;
            this.modalInstance.dismiss('cancel');
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            this.isBusy = false;

            this.selectedReferenceGage = new Models.ReferenceGage("", ""); 

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

        private getExtensionParameters(codes: Array<string> = null): Array<any> {

            var parameters = this.studyAreaService.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []);
            if (codes) {
                parameters = parameters.filter(f => { return (codes.indexOf(<string>(f.code)) > -1) });
            }

            return parameters;
        }
        private onStudyServiceBusyChanged() {
            this.studyAreaService.onStudyAreaServiceBusyChanged.unsubscribe(new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onStudyServiceBusyChanged();
            }));

            this.load();
            this.isBusy = false;
        }
        public updateReferenceGage(item) {
            this.selectedReferenceGage = item;
            this.studyAreaService.selectedGage = item;
        }

        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modalService.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }

        public getGageInfo() {
            this.toaster.pop('wait', "Querying gage information", "Please wait...", 0);
            this.isBusy = true;
            var selectedGageDone = false;
            if (this.referenceGageList)
                for (var i = this.referenceGageList.length - 1; i >= 0; i--) {
                    var gage = this.referenceGageList[i];
                    if (this.selectedReferenceGage && this.selectedReferenceGage.StationID && gage.StationID == this.selectedReferenceGage.StationID) selectedGageDone = true;
                    this.getGageStatsStationInfo(gage);
                }
            if (this.selectedReferenceGage && this.selectedReferenceGage.StationID != "" && !selectedGageDone) {
                this.getGageStatsStationInfo(this.selectedReferenceGage);
            }
                
        }

        public getGageStatsStationInfo(gage, newGage = false) {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + gage.StationID;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    var gageInfo = response.data;
                    // remove gages that are not continuous record
                    if (gageInfo.stationType && gageInfo.stationType.code != 'GS') {
                        if (newGage) {
                            this.toaster.clear();
                            this.toaster.pop('error', "Invalid gage", "Gage is not continuous record", 0);
                            this.isBusy = false;
                        } else {
                            this.removeItem(gage);
                            if (this.referenceGageList.length == 0) {
                                this.toaster.pop('warning', "No valid gages returned", "Gages without continuous record removed from response", 0);
                            } else {
                                this.toaster.clear();
                                this.toaster.pop('error', "Invalid gage", "Gage is not continuous record", 0);
                                this.isBusy = false;
                            }
                        }
                    } else {
                        if (gageInfo.hasOwnProperty('isRegulated')) gage['isRegulated'] = gageInfo.isRegulated;
                        if (gageInfo.hasOwnProperty('stationType')) gage['stationType'] = gageInfo.stationType;
                        if (gageInfo.hasOwnProperty('statistics')) {
                            var hasFlowDurationStats = false;
                            gageInfo['statistics'].forEach(stat => {
                                if (stat['statisticGroupType'].code == 'FDS' && stat['isPreferred']) hasFlowDurationStats = true;
                            })
                            gage['HasFlowDurationStats'] = hasFlowDurationStats;
                        }
                        if (gageInfo.hasOwnProperty('characteristics')) {
                            gageInfo.characteristics.forEach(char => {
                                if (char['variableType'].code == 'DRNAREA') gage['DrainageArea'] = char['value'];
                            })
                        }
                        if (gageInfo.hasOwnProperty('name')) gage['Name'] = gageInfo.name;
                        if (newGage) {
                            if (!this.referenceGageList) this.referenceGageList = [];
                            if (this.referenceGageList.length == 0 || !this.referenceGageList.some(g => g.StationID == gage.StationID)) this.referenceGageList.unshift(gage);
                        }

                        if (gageInfo.hasOwnProperty('location')) {
                            var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                            var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                            var from = turf.point(gageInfo.location.coordinates);
                            var to = turf.point([long, lat]);
                            var options = {units: 'miles'};
                            var distance = turf.distance(from, to, options);
                            gage['distanceFromClick'] = distance.toFixed(2);
                        }
                        this.getNWISPeriodOfRecord(gage);
                    }

                }, (error) => {
                    //sm when error
                    this.toaster.clear();
                    this.isBusy = false;
                    console.log(error);
                    if (error.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(error.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            headerMsgs[key].forEach(element => {
                                this.toaster.pop(key, key, element);
                            });
                        })
                    }
                    this.removeItem(gage);
                }).finally(() => {
            });
        }

        public removeItem(gage) {
            var gageIndex = this.referenceGageList.indexOf(this.referenceGageList.filter(item => item.StationID == gage.StationID)[0]);
            if (gageIndex) this.referenceGageList.splice(gageIndex, 1);
        }

        public getNearestGages() {
            this.isBusy = true;
            this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
            var headers = {
                "X-Is-Streamstats": true
            };
            var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
            var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
            var url = configuration.baseurls.GageStatsServices;
            if (this.queryBy == 'Nearest') url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, (this.distance * 1.60934).toFixed(0));
            if (this.queryBy == 'Network') url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, (this.distance * 1.60934).toFixed(0));

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
            this.referenceGageList = []; // reset nearby gages
            this.selectedReferenceGage.StationID = ''; // reset selected gage
            this.Execute(request).then(
                (response: any) => {
                    this.toaster.clear();
                    this.isBusy = false;
                    if (typeof response.data == 'string') {
                        this.toaster.pop("warning", "Warning", response.data, 0);
                    } else if (response.data && response.data.length == 0) {
                        this.toaster.pop("warning", "Warning", "No stations located within search distance")
                    } else if (response.data && response.data.length > 0) {
                        for (var i = response.data.length - 1; i >= 0; i--) {
                            var gage = response.data[i];
                            // remove gages that are not continuous record from list
                            if (gage.stationType.code != 'GS') {
                                response.data.splice(i, 1);
                                if (response.data.length == 0) this.toaster.pop('warning', "No valid gages returned", "Gages without continuous record removed from response", 0);
                            } else {
                                if (gage.hasOwnProperty('statistics')) {
                                    var hasFlowDurationStats = false;
                                    gage.statistics.forEach(stat => {
                                        if (stat['statisticGroupType'].code == 'FDS' && stat['isPreferred']) hasFlowDurationStats = true;
                                    })
                                    gage['HasFlowDurationStats'] = hasFlowDurationStats;
                                }
                                if (gage.hasOwnProperty('characteristics')) {
                                    gage.characteristics.forEach(char => {
                                        if (char['variableType'].code == 'DRNAREA') gage['DrainageArea'] = char['value'];
                                    })
                                }
                                if (gage.hasOwnProperty('name')) gage.Name = gage.name;
                                if (gage.hasOwnProperty('code')) gage.StationID = gage.code;
                                if (gage.hasOwnProperty('location')){
                                    var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
                                    var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
                                    var from = turf.point(gage.location.coordinates);
                                    var to = turf.point([long, lat]);
                                    var options = {units: 'miles'};
                                    var distance = turf.distance(from, to, options);
                                    gage['distanceFromClick'] = distance.toFixed(2);
                                }
                                this.getNWISPeriodOfRecord(gage);
                            }
                        }
                        this.referenceGageList = response.data;
                        this.getNWISDailyValues();

                    }

                    if (response.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(response.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            headerMsgs[key].forEach(element => {
                                this.toaster.pop(key, key, element);
                            });
                        })
                    }
                }, (error) => {
                    //sm when complete
                    this.toaster.clear();
                    this.isBusy = false;
                    console.log(error);
                    if (error.headers()['x-usgswim-messages']) {
                        var headerMsgs = JSON.parse(error.headers()['x-usgswim-messages']);
                        Object.keys(headerMsgs).forEach(key => {
                            headerMsgs[key].forEach(element => {
                                this.toaster.pop(key, key, element);
                            });
                        })
                    } else {
                        this.toaster.pop('error', "There was an error finding nearby gages.", "Please retry", 0);
                    }
                });
        }

        public selectGage(gage) {
            var sid: Array<any> = this.studyAreaService.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []).filter(f => { return (<string>(f.code)).toLowerCase() == "sid" });
            let rg = new Models.ReferenceGage(gage.StationID, gage.Name);
            if (gage.geometry) {
                rg.Latitude_DD = gage.geometry.coordinates[0];
                rg.Longitude_DD = gage.geometry.coordinates[1];
            }
            //add to list of reference gages
            // sid[0].options = this.referenceGageList;
            // sid[0].value = rg;
            this.selectedReferenceGage = rg;
            this.studyAreaService.selectedGage = rg;
        }

        public getStyling(gage) {
            if (gage.StationID == this.selectedReferenceGage.StationID) 
                return {'background-color': '#ebf0f5' }
            else
                return {'background-color': 'unset'}
        }

        public getNWISPeriodOfRecord(gage) {
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

        public checkPeriodOfRecord(gage) {
            if (!this.dateRange.dates && gage.hasOwnProperty('SelectEnabled')) return gage['SelectEnabled']; // keep last set enabled/disabled setting if user is changing dates

            if (this.dateRange.dates.startDate >= this.addDay(gage['StartDate'], 1) && this.addDay(gage['EndDate'], 1) >= this.dateRange.dates.endDate) gage['SelectEnabled'] = true;
            else {
                gage['SelectEnabled'] = false;
            }
            return gage['SelectEnabled'];
        }

        public getNWISDailyValues() {
            if (!this.referenceGageList) return;
            var start = this.dateRange.dates.startDate.toISOString();
            start = start.substr(0, start.indexOf('T'));
            var end = this.dateRange.dates.endDate.toISOString();
            end = end.substr(0, end.indexOf('T'));
            this.referenceGageList.forEach((gage) => {
                gage['HasZeroFlows'] = 'N/A';

                var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISdailyValues.format(gage.StationID, start, end);
                var nwis_request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(nwis_url, true, WiM.Services.Helpers.methodType.GET, 'TEXT');

                this.Execute(nwis_request).then((response: any) => {
                    var data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    //remove extra random line
                    data.shift();
                    gage['HasZeroFlows'] = false;
                    if (data.length <= 2) gage['HasZeroFlows'] = 'N/A'; // if no values returned, length here will be 2
                    do {
                        var row = data.shift().split('\t');
                        var value = parseInt(row[3]);
                        if (typeof(value) == 'number' && value == 0) gage['HasZeroFlows'] = 'true';
                    } while (data.length > 0);
                    
                }, (error) => {
                    //sm when error
                    gage['HasZeroFlows'] = 'N/A';
                });

            });

        }

        public queryGage() {
            this.toaster.pop('wait', "Querying gage information", "Please wait...", 0);
            this.isBusy = true;
            var gage = new Models.ReferenceGage(this.stationNumber, '');
            this.getGageStatsStationInfo(gage, true);
        }


    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.SedimentController', SedimentController);
}//end module 