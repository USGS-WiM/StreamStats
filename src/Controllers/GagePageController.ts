//------------------------------------------------------------------------------
//----- GagePage ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Martyn J. Smith USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:


//Comments
//07.16.2020 mjs - Created

//Import

module StreamStats.Controllers {
    'use strict';

    interface IGagePageControllerScope extends ng.IScope {
        vm: IGagePageController;
    }

    interface IModal {
        Close():void
    }
    
    interface IGagePageController extends IModal {
    }

    class GageInfo {
        siteid: string;
        sitename: string;
        lat: number;
        lng: number;
        stationtype: string;
        isRegulated: boolean;
        agency: string;
        characteristics: Array<GageCharacteristic>;
        statisticsgroups: Array<GageStatisticGroup>;
        citations: Array<Citation>;
        constructor(sid: string) {
            this.siteid = sid;
        }
    }

    class GageCharacteristic {
        name: string;
        value: string;
        units: string;
        comments: string;
        citationID: number;
    }

    class Citation {
        id: number;
        title: string;
        author: string; 
        url: string; 
    }

    class GageStatisticGroup {
        id: number;
        name: string;
        code: string;
        statistics: Array<GageStatistic>;
    }

    class GageStatistic {
        name: string;
        value: string;
        units: string;
        citationID: number;

        comments: string;
        isPreferred: boolean;
        regressionTypeID: number;
        statisticErrors: Array<any>;
        statisticGroupTypeID: number;
        unitTypeID: number;
        yearsofRecord: number;
    }

    class GagePageController extends WiM.Services.HTTPServiceBase implements IGagePageController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public AppVersion: string;
        public gage: GageInfo;
        public selectedStatisticGroups;
        public showPreferred = false;
        public multiselectOptions = {
            displayProp: 'name'
        }

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        constructor($scope: IGagePageControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init();  
            this.selectedStatisticGroups = [];
            this.showPreferred = false;
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public getGagePage() {

            //instantiate gage
            this.gage = new GageInfo(this.modalService.modalOptions.siteid);

            //console.log('gage',this.gage)
                    
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.siteid;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {

                    //console.log('response', response.data)

                    this.gage.sitename = response.data.name;
                    this.gage.lat = response.data.location.coordinates[1];
                    this.gage.lng = response.data.location.coordinates[0];
                    this.gage.isRegulated = response.data.isRegulated;
                    this.gage.characteristics = [];
                    this.gage.statisticsgroups = [];
                    this.gage.citations = [];

                    this.getStationType(response.data.stationTypeID);
                    this.getStationAgency(response.data.agencyID)
                    this.getStationCharacteristics(response.data.characteristics);
                    this.getStationStatistics(response.data.statistics);

                    console.log('gage info:', this.gage)

                }, (error) => {
                    //sm when error
                }).finally(() => {

                });

        }

        public setPreferred(pref: boolean) {
            this.showPreferred = pref;
        }

        public getStationType(id: number) {

            //get station type
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStationTypes + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    this.gage.stationtype = response.data.name;
                });

        }

        public getUnit(id: number, statistic: GageStatistic) {

            //get station type
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesUnits + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    statistic.units = response.data.name
                });
        }

        
        public getStationAgency(id: number) {

            //get station type
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesAgencies + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    this.gage.agency = response.data.name;

                });

        }

        public getStationCharacteristics(characteristics: Array<any>) {

            //loop over each characteristic and request more info
            characteristics.forEach((char, index) => {

                //console.log('characteristic loop:', char);
                var characteristic = new GageCharacteristic;

                characteristic.comments = char.comments;
                characteristic.value = char.value;
                
                //does the characteristic have a citation
                if (char.hasOwnProperty('citation') && char.citation.id) {

                    characteristic.citationID = char.citation.id;

                    //remove hashes in url (in case db update misses this)
                    if (char.ciation && char.citation.citationURL) char.citation.citationURL = char.citation.citationURL.replace('#', '');

                    //check if we already have the citation
                    if (!this.checkForCitation(char.citation.id)) {
                        this.gage.citations.push(char.citation);
                    }
                }

                //some characteristics have citationID's and some dont?
                else {
                    if (char.citationID) {
                        characteristic.citationID = char.citationID;
                    }
                }

                //requests for each characteristic
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesCharacteristics + char.id;
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(
                    (response: any) => {

                        //console.log('characteristic response', response.data)
                        characteristic.name = response.data.variableType.name;
                        characteristic.units = response.data.unitType.name;
                        this.gage.characteristics.push(characteristic)

                        //console.log('this gage', this.gage)

                    });
        
            }); 
        }


        public checkForCitation(id: number) {

            //console.log('checking for citation', id, this.gage.citations)
            var found = this.gage.citations.some(el => el.id === id);
            return found;
        }

        public getCitation(id: number) {

            //request for citations for each characteristic
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesCitations + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {

                    console.log('get citation response:', response.data)

                    if (response.data.title && response.data.title.length !== 0 ) {

                        var citation = new Citation;

                        citation.id = response.data.id;
                        citation.title = response.data.title;
                        citation.author = response.data.author;

                        //remove hashes in url (in case db update misses this)
                        citation.url = response.data.citationURL.replace('#', '');

                        if (citation.url) citation.url = citation.url.replace('#', '');

                        //dont need to push duplicate or blank citations
                        var found = this.gage.citations.some(el => el.id === citation.id);
                        if (!found) this.gage.citations.push(citation);

                    }
                });
        }

        public getStationStatistics(statistics: Array<any>) {

            //loop over each statistic and request more info
            statistics.forEach((stat, index) => {

                //console.log('statistic loop:', stat);
                var statistic = new GageStatistic;

                statistic.comments = stat.comments;
                statistic.isPreferred = stat.isPreferred;
                if (!stat.isPreferred) console.log('false')
                statistic.value = stat.value;
                statistic.yearsofRecord = stat.yearsofRecord;
                
                if (stat.hasOwnProperty('citation') && stat.citation.id) {

                    statistic.citationID = stat.citation.id;

                    ///remove hashes in url (in case db update misses this)
                    if (stat.citation && stat.citation.citationURL) stat.citation.citationURL = stat.citation.citationURL.replace('#', '');

                    //check if we already have the citation
                    if (!this.checkForCitation(stat.citation.id)) {
                        this.gage.citations.push(stat.citation);
                    }
                }

                //some characteristics have citationID's and some dont?
                else {
                    if (stat.citationID) {
                        statistic.citationID = stat.citationID;   
                    }
                }

                //requests for each statistic
                var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatistics + stat.id;
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then(
                    (response: any) => {

                        //console.log('statistic response', response.data);

                        statistic.name = response.data.regressionType.name;
                        this.getUnit(response.data.unitTypeID, statistic)

                        //check to see if we have this statisticsgroup
                        if (!this.checkForStatisticGroup(response.data.statisticGroupType.id)) {
                            var statgroup = response.data.statisticGroupType;
                            statgroup.statistics = [statistic];
                            this.gage.statisticsgroups.push(statgroup);
                        }

                        //if we already have this group just append stat to it
                        else {
                            this.gage.statisticsgroups.forEach((sg, index) => {
                                if (sg.id === response.data.statisticGroupTypeID) {
                                    sg.statistics.push(statistic)
                                }
                            });
                        }
                        
                        //console.log('gage in stat request', this.gage)
                        //this.gage.statistics.push(statistic)

                    });

            });

        }

        public checkForStatisticGroup(id: number) {

            //console.log('checking for statisticGroup', id, this.gage.statisticsgroups)
            var found = this.gage.statisticsgroups.some(el => el.id === id);
            return found;
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in GagePage controller");
            this.AppVersion = configuration.version;

            this.getGagePage()

        }


      
    }//end  class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.GagePageController', GagePageController);
}//end module 