//------------------------------------------------------------------------------
//----- ExplorationToolsModalController ----------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2019 WiM - USGS

//    authors:  Jeremy K. Newson USGS Web Informatics and Mapping
//             
// 
//   purpose:  Example of Modal Controller
//          
//discussion:


//Comments
//07.24.2019 jkn - Created

//Import

module StreamStats.Controllers {
    'use string';
    interface IExtensionModalControllerScope extends ng.IScope {
        vm: IExtensionModalController;
    }
    interface IModal {
        close(): void
    }
    interface IExtensionModalController extends IModal {
    }
    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }
    class ExtensionModalController extends WiM.Services.HTTPServiceBase implements IExtensionModalController {
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
        
        //QPPQ
        public dateRange: IDateRange;
        public dateRangeOptions;
        public selectedReferenceGage: StreamStats.Models.IReferenceGage = null;
        public referenceGageList: Array<StreamStats.Models.IReferenceGage>;
        public queryBy = 'Nearest';
        public getNearest = false;
        public distance = 10;
        
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$modalInstance', 'StreamStats.Services.ModalService', 'StreamStats.Services.StudyAreaService', 'WiM.Event.EventManager', '$http', 'toaster'];
        constructor($scope: IExtensionModalControllerScope, $analytics, modal: ng.ui.bootstrap.IModalServiceInstance, modalservice: Services.IModalService, studyArea: Services.IStudyAreaService, private events: WiM.Event.IEventManager, $http: ng.IHttpService, toaster) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.studyAreaService = studyArea; 
            this.modalService = modalservice;
            this.eventManager = events;
            this.toaster = toaster;
            this.dateRangeOptions = {
                locale: { format: 'MMMM D, YYYY' },
                eventHandlers: { 'hide.daterangepicker': (e) => this.SetExtensionDate(e) }
            };

            this.init();
            this.load();

            $scope.$watch(() => this.dateRange.dates,(newval, oldval) => {
                this.studyAreaService.selectedStudyAreaExtensions.forEach(ext => {
                    ext.parameters.forEach(p => {
                        if (p.code == "sdate") {p.value = this.dateRange.dates.startDate; }
                        if (p.code == "edate") {p.value = this.dateRange.dates.endDate; }
                    })
                });
            });
        }
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public close(): void {
            this.modalInstance.dismiss('cancel');
        }
        public ok(): void {
            //validate info
            if (this.verifyExtensionCanContinue()) {
                this.close();
            }
            
        }
        public setReferenceGageFromMap(name) {
            this.isBusy = true;
            this.studyAreaService.doSelectMapGage = true;
            this.modalInstance.dismiss('cancel');
        }
        public setBestCorrelatedReferenceGage() {
            //subscribe
            this.isBusy = true;
            this.studyAreaService.onStudyAreaServiceBusyChanged.subscribe( new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onStudyServiceBusyChanged();
            }));
            this.studyAreaService.GetKriggedReferenceGages();
        }
        public SetExtensionDate(event) {
            //set selected dates to 
            var dates: Array<any> = this.getExtensionParameters(['sdate', 'edate']);
            dates.forEach(dt => {
                if (dt.code === "sdate") dt.value = this.dateRange.dates.startDate;
                if (dt.code === "edate") dt.value = this.dateRange.dates.endDate;
            });
            this.studyAreaService.extensionDateRange = this.dateRange;
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
            //default
            
            this.selectedReferenceGage = null;

            //load from services
            if (this.studyAreaService.selectedStudyAreaExtensions == null) return;
            this.title = this.studyAreaService.selectedStudyAreaExtensions.map(c => c.name).join(", ");
            let parameters = this.getExtensionParameters();
            let pcodes =parameters.map(p => p.code)

            if (['sid'].some(r => pcodes.indexOf(r) > -1)) {
                this.selectedReferenceGage = new Models.ReferenceGage("", ""); 
            }//endif
            if (['sdate', 'edate'].every(elem => pcodes.indexOf(elem) > -1))
            {
                if (this.studyAreaService.extensionDateRange != undefined) {
                    this.dateRange = this.studyAreaService.extensionDateRange;
                } else {
                    this.dateRange = { dates: { startDate: this.addDay(new Date(), -30), endDate: this.addDay(new Date(), -1) }, minDate: new Date(1900, 1, 1), maxDate: this.addDay(new Date(), -1) };
                }
                //set start date
                parameters[pcodes.indexOf('sdate')].value = this.dateRange.dates.startDate;
                parameters[pcodes.indexOf('edate')].value = this.dateRange.dates.endDate;

            }//endif

        }
        private load(): void {
            let parameters:Array<any> = this.getExtensionParameters();

            do {
                let f = parameters.pop();

                if (this.selectedReferenceGage && ['sid'].indexOf(f.code) > -1) {
                    if (typeof f.value != 'string') this.selectedReferenceGage = f.value;
                    else if (typeof f.options == 'object') this.selectedReferenceGage = f.options.filter(g => g.StationID == f.value)[0];
                    this.referenceGageList = f.options;
                }
                if (this.dateRange && ['sdate', 'edate'].indexOf(f.code) > -1) {
                    if (f.code == "sdate") this.dateRange.dates.startDate = f.value;
                    if (f.code == "edate") this.dateRange.dates.endDate = f.value;
                }
            } while (parameters.length > 0);
           
            if (this.studyAreaService.selectedGage) this.studyAreaService.selectedGage = this.selectedReferenceGage;
            this.getGageInfo();
        }
        private verifyExtensionCanContinue(): boolean {

            //check dates
            if (this.dateRange) {
                if (!((this.dateRange.dates.startDate <= this.dateRange.maxDate || this.dateRange.dates.endDate <= this.dateRange.maxDate) &&
                    (this.dateRange.dates.startDate >= this.dateRange.minDate || this.dateRange.dates.endDate >= this.dateRange.minDate) &&
                    (this.dateRange.dates.startDate <= this.dateRange.dates.endDate))) {

                    return false;
                }
            }

            if (this.selectedReferenceGage) {
                if (this.selectedReferenceGage.StationID == "") return false;
            }
            //load service
            this.studyAreaService.selectedStudyAreaExtensions.forEach(ext => {
                ext.parameters.forEach(p => {
                    if (p.code == "sid" && typeof p.value != 'string') { 
                        if (p.options == undefined || p.options.length == 0) p.options = [this.selectedReferenceGage];
                        p.value = this.selectedReferenceGage.StationID
                    };
                    if (p.code == "sdate") {p.value = this.dateRange.dates.startDate; }
                    if (p.code == "edate") {p.value = this.dateRange.dates.endDate; }
                })
            });
            this.studyAreaService.updateExtensions(); // make sure extension params are updated in sidebar/nss service

            return true;
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
            // TODO: we can remove all this "properties" nonsense if we remove the geojson option from the nearest gages call?
            var selectedGageDone = false;
            if (this.referenceGageList)
                this.referenceGageList.forEach(gage => {
                    if (this.selectedReferenceGage && this.selectedReferenceGage.StationID && gage.StationID == this.selectedReferenceGage.StationID) selectedGageDone = true;
                    var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + gage.StationID;
                    var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

                    this.Execute(request).then(
                        (response: any) => {
                            var gageInfo = response.data;
                            if (!gage.hasOwnProperty('properties')) gage['properties'] = {};
                            if (gageInfo.hasOwnProperty('statistics')) {
                                var hasFlowDurationStats = false;
                                gageInfo.statistics.forEach(stat => {
                                    if (stat['statisticGroupType'].code == 'FDS') hasFlowDurationStats = true;
                                })
                                gage['properties']['HasFlowDurationStats'] = hasFlowDurationStats;
                            }
                            if (gageInfo.hasOwnProperty('isRegulated')) gage['properties'].IsRegulated = gageInfo.isRegulated;
                            if (gageInfo.hasOwnProperty('characteristics')) {
                                gageInfo.characteristics.forEach(char => {
                                    if (char['variableType'].code == 'DRNAREA') gage['properties']['DrainageArea'] = char['value'];
                                })
                            }
                            if (gageInfo.stationType) gage['properties'].StationType = gageInfo.stationType;

                        }, (error) => {
                            //sm when error
                        }).finally(() => {

                    });
                    
                    this.getNWISPeriodOfRecord(gage);
                })
            if (this.selectedReferenceGage && !selectedGageDone) {
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.selectedReferenceGage.StationID;
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

                this.Execute(request).then(
                    (response: any) => {
                        var gageInfo = response.data;
                        if (gageInfo.hasOwnProperty('statistics')) {
                            var hasFlowDurationStats = false;
                            gageInfo.statistics.forEach(stat => {
                                if (stat['statisticGroupType'].code == 'FDS') hasFlowDurationStats = true;
                            })
                            this.selectedReferenceGage['properties']['HasFlowDurationStats'] = hasFlowDurationStats;
                        }
                        if (gageInfo.hasOwnProperty('characteristics')) {
                            gageInfo.characteristics.forEach(char => {
                                if (char['variableType'].code == 'DRNAREA') this.selectedReferenceGage['properties']['DrainageArea'] = char['value'];
                            })
                        }

                    }, (error) => {
                        //sm when error
                    }).finally(() => {

                });

                this.getNWISPeriodOfRecord(this.selectedReferenceGage);
            }
                
        }

        public getNearestGages() {
            this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
            var headers = {
                "X-Is-Streamstats": true
            };
            var lat = this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString();
            var long = this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString();
            var url = configuration.baseurls.GageStatsServices;
            if (this.queryBy == 'Nearest') url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, this.distance);
            if (this.queryBy == 'Network') url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, this.distance);

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
            this.referenceGageList = []; // reset nearby gages
            this.selectedReferenceGage.StationID = ''; // reset selected gage
            this.Execute(request).then(
                (response: any) => {
                    this.toaster.clear();
                    if (typeof response.data == 'string') {
                        this.toaster.pop("warning", "Warning", response.data, 0);
                    } else if (response.data.hasOwnProperty('features') && response.data.features.length == 0) {
                        this.toaster.pop("warning", "Warning", "No stations located within search distance")
                    } else if (response.data.hasOwnProperty('features') && response.data.features.length > 0) {
                        response.data.features.forEach(feat => {
                            if (feat.properties.hasOwnProperty('Statistics')) {
                                var hasFlowDurationStats = false;
                                feat.properties.Statistics.forEach(stat => {
                                    if (stat['statisticGroupType'].code == 'FDS') hasFlowDurationStats = true;
                                })
                                feat.properties['HasFlowDurationStats'] = hasFlowDurationStats;
                            }
                            if (feat.properties.hasOwnProperty('Characteristics')) {
                                feat.properties.Characteristics.forEach(char => {
                                    if (char['variableType'].code == 'DRNAREA') feat.properties['DrainageArea'] = char['value'];
                                })
                            }
                            if (feat.properties.code) feat.StationID = feat.properties.code;
                            else if (feat.properties.Code) feat.StationID = feat.properties.Code;
                            this.getNWISPeriodOfRecord(feat);
                        });
                        this.referenceGageList = response.data.features;

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
            let rg;
            if (gage.properties && gage.properties.Code) {
                rg = new Models.ReferenceGage(gage.properties.Code, gage.properties.Name);
                rg.properties = gage.properties;
            } else {
                rg = new Models.ReferenceGage(gage.StationID, gage.Name);
            }
            if (gage.geometry) {
                rg.Latitude_DD = gage.geometry.coordinates[0];
                rg.Longitude_DD = gage.geometry.coordinates[1];
            }
            //add to list of reference gages
            sid[0].options = this.referenceGageList;
            sid[0].value = rg;
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

                }, (error) => {
                    //sm when error
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

        public checkCorrelation() {
            if (this.referenceGageList) return this.referenceGageList.some(g => g.hasOwnProperty('correlation'));
            else return false;
        }

        public getDrainageArea() {
            var drainageArea = this.studyAreaService.studyAreaParameterList.filter(p => p.code.toLowerCase() == 'drnarea')[0];
            if (drainageArea && drainageArea.hasOwnProperty('value')) return drainageArea.value;
            else return 'N/A';
        }

    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ExtensionModalController', ExtensionModalController);
}//end module 