//------------------------------------------------------------------------------
//----- NearestGages ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Katrin E. Jacobsen USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//12.16.2020 mjs - Created

//Import

module StreamStats.Controllers {
    'use strict';

    interface INearestGagesControllerScope extends ng.IScope {
        vm: INearestGagesController;
    }

    interface IModal {
        Close():void
    }
    
    interface INearestGagesController extends IModal {
    }

    class GageInfo {
        code: string;
        name: string;
        lat: number;
        lng: number;
        stationType: StationType;
        isRegulated: boolean;
        agency: Agency;
        characteristics: Array<GageCharacteristic>;
        statisticsgroups: Array<GageStatisticGroup>;
        citations: Array<Citation>;
        statistics: Array<GageStatistic>;
        constructor(sid: string) {
            this.code = sid;
        }
    }

    class GageCharacteristic {
        id: number;
        value: string;
        unitType: UnitType;
        comments: string;
        citationID: number;
        citation: Citation;
        variableTypeID: number;
        variableType: VariableType;
    }

    class UnitType {
        id: number;
        name: string;
        abbreviation: string;
        unitSystemTypeID: number;
    }

    class VariableType {
        id: number;
        name: string;
        code: string;
        description: string;
    }

    class Citation {
        id: number;
        title: string;
        author: string; 
        citationURL: string; 
    }

    class GageStatisticGroup {
        id: number;
        name: string;
        code: string;
    }

    class GageStatistic {
        comments: string;
        id: number;
        isPreferred: boolean;
        regressionType: RegressionType;
        regressionTypeID: number;
        statisticErrors: Array<any>;
        statisticGroupTypeID: number;
        statisticGroupType: GageStatisticGroup;
        unitTypeID: number;
        unitType: UnitType;
        value: string;
        citationID: number;
        citation: Citation;
        yearsofRecord: number;
        predictionInterval: PredictionInterval
    }

    class PredictionInterval {
        id: number;
        variance: number;
        lowerConfidenceInterval: number;
        upperConfidenceInterval: number;
    }

    class StationType {
        id: number;
        code: string;
        description: string;
        name: string;
    }
    
    class Agency {
        id: number;
        code: string;
        description: string;
        name: string;
    }

    class RegressionType {
        id: number;
        code: string;
        name: string;
        description: string;
    }

    class NearestGagesController extends WiM.Services.HTTPServiceBase implements INearestGagesController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        private studyAreaService: Services.IStudyAreaService;
        public AppVersion: string;
        public gage: GageInfo;
        public selectedStatisticGroups;
        public showPreferred = false;
        public multiselectOptions = {
            displayProp: 'name'
        }
        public NWISlat: string;
        public NWISlng: string;
        public queryBy = 'Nearest';
        public distance = 10;
        public toaster: any;
        public nearbyGages = [];

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', 'toaster', '$http', 'StreamStats.Services.ModalService', '$modalInstance', 'StreamStats.Services.StudyAreaService'];
        constructor($scope: INearestGagesControllerScope, toaster, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance, studyArea: Services.IStudyAreaService) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init();  
            this.selectedStatisticGroups = [];
            this.showPreferred = false;
            this.studyAreaService = studyArea;
            this.toaster = toaster;
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public getGagePage() {

            //instantiate gage
            this.gage = new GageInfo('07022000');
                    
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {

                    //console.log('response', response.data)
                    this.gage = response.data;
                    this.gage.lat = response.data.location.coordinates[1];
                    this.gage.lng = response.data.location.coordinates[0];
                    this.gage.statisticsgroups = [];
                    this.gage.citations = [];

                    this.getStationCharacteristics(response.data.characteristics);
                    this.getStationStatistics(response.data.statistics);

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public setPreferred(pref: boolean) {
            this.showPreferred = pref;
        }

        public getStationCharacteristics(characteristics: Array<any>) {

            //loop over each characteristic and request more info
            characteristics.forEach((char, index) => {

                //console.log('characteristic loop:', char);
                var characteristic = char;
                
                //does the characteristic have a citation
                if (char.hasOwnProperty('citation') && char.citation.id) {

                    //remove hashes in url (in case db update misses this)
                    if (char.citation && char.citation.citationURL) char.citation.citationURL = char.citation.citationURL.replace('#', '');

                    //check if we already have the citation
                    if (!this.checkForCitation(char.citation.id)) {
                        this.gage.citations.push(char.citation);
                    }
                }
        
            }); 
        }


        public checkForCitation(id: number) {

            //console.log('checking for citation', id, this.gage.citations)
            var found = this.gage.citations.some(el => el.id === id);
            return found;
        }

        public getStationStatistics(statistics: Array<any>) {

            //loop over each statistic and request more info
            statistics.forEach((stat, index) => {
                
                if (stat.hasOwnProperty('citation') && stat.citation.id) {

                    //remove hashes in url (in case db update misses this)
                    if (stat.citation && stat.citation.citationURL) stat.citation.citationURL = stat.citation.citationURL.replace('#', '');

                    //check if we already have the citation
                    if (!this.checkForCitation(stat.citation.id)) {
                        this.gage.citations.push(stat.citation);
                    }
                }

                if (!this.checkForStatisticGroup(stat.statisticGroupTypeID)) {
                    if (stat.hasOwnProperty('statisticGroupType')) {
                        var statgroup = stat.statisticGroupType;
                        this.gage.statisticsgroups.push(statgroup);
                    } else {
                        this.getStatGroup(stat.statisticGroupTypeID);
                    }
                }

            });

        }

        public getStatGroup(id: number) {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatGroups + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    if (!this.checkForStatisticGroup(response.data.id)) this.gage.statisticsgroups.push(response.data);
                });
        }

        public checkForStatisticGroup(id: number) {

            //console.log('checking for statisticGroup', id, this.gage.statisticsgroups)
            var found = this.gage.statisticsgroups.some(el => el.id === id);
            return found;
        }

        public checkForPredInt(statGroupID: number) {
            // check if any items in this stat group have prediction intervals
            var found = this.gage.statistics.some(el => el.statisticGroupTypeID == statGroupID && el.hasOwnProperty('predictionInterval'))
            return found;
        }

        public getNWISInfo() {

            /* var url = configuration.baseurls.NWISurl + configuration.queryparams.NWISsiteinfo + this.gage.code;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    var regex = /[+-]?((\d+(\.\d*)?)|(\.\d+))/g;
                    var latLong = response.data.split(this.gage.name)[1].match(regex);
                    this.NWISlat = latLong[0];
                    this.NWISlng = latLong[1];
                }); */
        }

        public getNearestGages() {
            // TODO: cleanup, check if report is opening without delineated basin
            this.toaster.pop("wait", "Searching for gages", "Please wait...", 0);
            var headers = {
                "X-Is-Streamstats": true
            };
            var lat = this.studyAreaService.selectedStudyArea ? this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toString() : '41.50459213282905';
            var long = this.studyAreaService.selectedStudyArea ? this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toString() : '-88.30548763275146';
            //var lat = '41.50459213282905';
            //var long = '-88.30548763275146';
            var url = configuration.baseurls.GageStatsServices;
            if (this.queryBy == 'Nearest') url += configuration.queryparams.GageStatsServicesNearest.format(lat, long, this.distance);
            if (this.queryBy == 'Network') url += configuration.queryparams.GageStatsServicesNetwork.format(lat, long, this.distance);
            //url = url.format(lat, long, this.distance);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json', '', headers);
            this.nearbyGages = []; // reset nearby gages
            this.Execute(request).then(
                (response: any) => {
                    console.log(response.data);
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
                        });
                        this.nearbyGages = response.data.features;

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

        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modalService.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in NearestGages controller");
            this.AppVersion = configuration.version;

        }


      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.NearestGagesController', NearestGagesController);
}//end module 