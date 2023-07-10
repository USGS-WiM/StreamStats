﻿﻿//------------------------------------------------------------------------------
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
// TODO: remove extra queries that we can get from the gage return
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
        // Gage Information variables
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

        // Gage Analysis Plots variables
        peakValues: any;
        date: any;

        constructor(sid: string) {
            this.code = sid;
        }
    }

    // Gage Information classes

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

    class GagePageController extends WiM.Services.HTTPServiceBase implements IGagePageController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        
        // Gage Information properties
        public print: any;
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public AppVersion: string;
        public gage: GageInfo;
        public selectedStatisticGroups;
        public selectedCitations;
        public selectedStatGroupsChar;
        public selectedCitationsChar;
        public filteredStatGroupsChar = [];
        public statCitationList;
        public charCitationList;
        public statIds;
        public crossWalk: Object;
        public statIdsChar;
        public showPreferred = false;
        public multiselectOptions = {
            displayProp: 'name'
        }
        public citationMultiselectOptions = {
            displayProp: 'id'
        }
        public NWISlat: string;
        public NWISlng: string;
        public URLsToDisplay = [];

        private _selectedTab: GagePageTab;
        public get SelectedTab(): GagePageTab {
            return this._selectedTab;
        }
        public set SelectedTab(val: GagePageTab) {
            if (this._selectedTab != val) {
                this._selectedTab = val;
            }      
        }

        // Gage Analysis Plots properties
        public peakValueData: Array<any>;
        public peakValuePlot: any;
        public annualFlowPlot: any;
        public peakValues: any;
        public selectedFloodFreqStats;
        public dischargeObj = undefined; // Stage vs. Discharge Plot
        public measuredObj = undefined; // Stage vs. Discharge Plot
        public floodFreq = undefined;
        public altFloodFreq = undefined;
        public oneDayStats = undefined;
        public sevenDayStats = undefined;
        public fourteenDayStats = undefined;
        public thirtyDayStats = undefined;
        public contrOneDayStats = undefined;
        public contrSevenDayStats = undefined;
        public contrFourteenDayStats = undefined;
        public contrThirtyDayStats = undefined;
        public weightedOneDayStats = undefined;
        public weightedSevenDayStats = undefined;
        public weightedThirtyDayStats = undefined;
        public peakDates = undefined;
        public estPeakDates = undefined;
        public dailyFlow = undefined;
        public instFlow = undefined;
        public gageTimeZone = undefined;
        public NWSforecast = undefined;
        public meanPercentileStats = undefined;
        public meanPercent = undefined;
        public rawShaded = undefined;
        public formattedP0to10 = [];
        public formattedP10to25 = [];
        public formattedP25to75 = [];
        public formattedP75to90 = [];
        public formattedP90to100 = [];
        public formattedFloodFreq = [];
        public formattedAltFloodFreq = [];
        public formattedOneDayStats = [];
        public formattedSevenDayStats = [];
        public formattedFourteenDayStats = [];
        public formattedThirtyDayStats = [];
        public formattedContrOneDayStats = [];
        public formattedContrSevenDayStats = [];
        public formattedContrFourteenDayStats = [];
        public formattedContrThirtyDayStats = [];
        public formattedWeightedOneDayStats = [];
        public formattedWeightedSevenDayStats = [];
        public formattedWeightedThirtyDayStats = [];
        public allFloodFreqStats = [];
        public formattedPeakDates = [];
        public formattedPeakDatesOnYear = [];
        public formattedEstPeakDatesOnYear = [];
        public formattedEstPeakDates = [];
        public formattedDailyFlow = [];
        public formattedInstFlow = [];
        public dailyDatesOnly = [];
        public startAndEnd = []; 
        public extremes;
        public formattedDailyHeat = [];
        public formattedDailyPlusAvg = [];
        public formattedDischargePeakDates = []; // Stage vs. Discharge Plot
        public dailyValuesOnly = [];
        public ageQualityData = 'age'; //Stage vs. Discharge Plot
        public error: any; //Stage vs. Discharge Plot

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        chartConfig: {  chart: {height: number, width: number, zooming: {type: string}, panning: boolean, panKey: string, events: {load: Function}},
                        title: { text: string, align: string},
                        time: { useUTC: false, timezone: string},
                        subtitle: { text: string, align: string}, 
                        legend: { useHTML: true, symbolPadding: number, symbolWidth: number, symbolHeight: number, squareSymbol: boolean, labelFormatter: Function},
                        rangeSelector: { enabled: boolean, inputPosition: {align: string, x: number, y: number}, 
                        buttons: {type: string, count: number, text: string}[], 
                                       // selected: number, buttonPosition: {align: string, x: number, y: number}
                                    },
                        navigator: { enabled: boolean}, 
                        xAxis: {  type: string, events: { afterSetExtremes: Function}, gridLineWidth: number, min: number, max: number, title: {text: string}, custom: { allowNegativeLog: Boolean }},
                        yAxis: { title: {text: string}, gridLineWidth: number, custom: { allowNegativeLog: Boolean }, plotLines: [{value: number, color: string, width: number, zIndex: number, label: {text: string}, id: string}]},
                        series: { name: string; showInNavigator: boolean, tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                                fillOpacity: number, lineWidth: number, data: number[], linkedTo: string, visible: boolean, id: string, zIndex: number, marker: {symbol: string, radius: number}, showInLegend: boolean; }[]; };
        dischargeChartConfig: {  
                        chart: { height: number, width: number, zooming: {type: string} },
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        rangeSelector: { enabled: boolean, inputPosition: {align: string, x: number, y: number}, selected: number, buttonPosition: {align: string, x: number, y: number}},
                        navigator: { enabled: boolean},  
                        xAxis: {  type: string, min: number, max: number, title: {text: string}, custom: { allowNegativeLog: Boolean }},
                        yAxis: { title: {text: string}, custom: { allowNegativeLog: Boolean }, plotLines: [{value: number, color: string, width: number, zIndex: number, label: {text: string}, id: string}]},
                        series: { name: string; showInNavigator: boolean, tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                        data: number[], marker: {symbol: string, radius: number}, showInLegend: boolean; }[]; };
        heatChartConfig: { chart: { height: number, width: number, zooming: {type: string} },
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        xAxis: { type: string, min: number, max: number, tickPositions: any[], threshold: number, title: {text: string}, labels: {formatter: Function}},
                        yAxis: { title: {text: string}, custom: { allowNegativeLog: boolean}},
                        colorAxis: { type: string, min: number, max: number, stops: any[], startOnTick: boolean, endOnTick: boolean, labels: {format: string}, allowNegativeLog: boolean}
                        series: { name: string, pixelSpacing: number[], borderWidth: number, borderColor: string, type: string, data: number[], tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number}[]; };
            constructor($scope: IGagePageControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init(); 
            this.selectedStatisticGroups = [];
            this.selectedCitations = [];
            this.selectedFloodFreqStats = [];
            this.selectedStatGroupsChar = [];
            this.selectedCitationsChar = [];
            this.statCitationList = [];
            this.charCitationList = [];
            this.showPreferred = false;
            this.print = function () {
                //ga event
                gtag('event', 'Download', { 'Category': 'GagePage', "Type": 'Print' });
                window.print();
            };

        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }


        // Gage Information methods
        public getGagePage() {

            //instantiate gage
            this.gage = new GageInfo(this.modalService.modalOptions.siteid);
                    
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
                    this.getNWISInfo();
                    this.getNWISPeriodOfRecord(this.gage);
                    this.additionalLinkCheck(this.gage.code);

                }, (error) => {
                    //sm when error
                }).finally(() => {
                }
            );
        }

        public additionalLinkCheck(siteNo)  {
            this.URLsToDisplay = [];
            var additionalURLs = 
            [
                { 
                    url: 'https://streamstats.usgs.gov/gagePages/NC/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-wateryears.txt', 
                    text: "Flow-Duration Statistics by Water Year",
                    available: false 
                },
                { 
                    url: 'https://streamstats.usgs.gov/gagePages/NC/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-day-month-seasonal.txt', 
                    text: "Flow-Duration Statistics by Period of Record, Calendar Day & Month, & Seasonal Periods",
                    available: false 
                },
                { 
                    url: 'https://streamstats.usgs.gov/gagePages/IA/' + siteNo + '_stats.pdf', 
                    text: "Stream Flow Statistics",
                    available: false 
                }
            ]

            for (let index = 0; index < additionalURLs.length; index++) {
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(additionalURLs[index].url, true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then((response: any) => {
                    if (response.status == 200) { 
                        additionalURLs[index].available = true; 
                        this.URLsToDisplay.push(additionalURLs[index]);
                    }
                },(error) => {
                }).finally(() => {
                });  
            }
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

                    // Citation options for filtering chars by citation
                    if (!this.checkForStatOrCharCitation(char.citation.id, this.charCitationList)) {
                        this.charCitationList.push(char.citation)
                    }
                }

                if (!this.checkForCharStatisticGroup(char.variableType.statisticGroupTypeID)) {
                    if (char.hasOwnProperty('statisticGroupType')) {
                        var statgroup = char.statisticGroupType;
                        this.filteredStatGroupsChar.push(statgroup);
                    } else {
                        this.getCharStatGroup(char.variableType.statisticGroupTypeID);
                    }
                }
        
            }); 
        }


        public checkForCitation(id: number) {

            //console.log('checking for citation', id, this.gage.citations)
            var found = this.gage.citations.some(el => el.id === id);
            return found;
        }

        public checkForStatOrCharCitation(id: number, citationlist: Array<any>) {
            var found = citationlist.some(el => el.id === id);
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

                    // Citation options for filtering stats by citation
                    if (!this.checkForStatOrCharCitation(stat.citation.id, this.statCitationList)) {
                        this.statCitationList.push(stat.citation)
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

        public getCharStatGroup(id: number) {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStatGroups + id;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    if (!this.checkForCharStatisticGroup(response.data.id)) this.filteredStatGroupsChar.push(response.data);
                });
        }

        public checkForStatisticGroup(id: number) {

            //console.log('checking for statisticGroup', id, this.gage.statisticsgroups)
            var found = this.gage.statisticsgroups.some(el => el.id === id);
            return found;
        }

        public checkForCharStatisticGroup(id: number) {

            var found = this.filteredStatGroupsChar.some(el => el.id === id);
            return found;
        }

        public checkForPredInt(statGroupID: number) {
            // check if any items in this stat group have prediction intervals
            var found = this.gage.statistics.some(el => el.statisticGroupTypeID == statGroupID && el.hasOwnProperty('predictionInterval'))
            return found;
        }

        public getNWISInfo() {

            var url = configuration.baseurls.NWISurl + configuration.queryparams.NWISsiteinfo + this.gage.code;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    var regex = /[+-]?((\d+(\.\d*)?)|(\.\d+))/g;
                    var latLong = response.data.split(this.gage.name)[1].match(regex);
                    this.NWISlat = latLong[0];
                    this.NWISlng = latLong[1];
                });
        }

        public getNWISPeriodOfRecord(gage) {
            if (!gage.code) return;
            var nwis_url = configuration.baseurls.NWISurl + configuration.queryparams.NWISperiodOfRecord + gage.code;
            var nwis_request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(nwis_url, true, WiM.Services.Helpers.methodType.GET, 'TEXT');

            this.Execute(nwis_request).then(
                (response: any) => {
                    var data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    var headers:Array<string> = data.shift().split('\t');
                    //remove extra random line
                    data.shift();
                    do {
                        var station = data.shift().split('\t');
                        // Physical - discharge, cubic feet per second
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
                    gage['StartDate'] = undefined;
                    gage['EndDate'] = undefined;
                }).finally(() => {

            });
        }

        public citationSelected(item, list) {
            for(var citation in list){
                if(list[citation].id === item.citationID){
                    return true;
                }
            }
            return false;
        }

        private downloadCSV() {

            //ga event
            gtag('event', 'Download', { 'Category': 'GagePage', "Type": 'CSV' });

            let disclaimer = '"USGS Data Disclaimer: Unless otherwise stated, all data, metadata and related materials are considered to satisfy the quality standards relative to the purpose for which the data were collected. Although these data and associated metadata have been reviewed for accuracy and completeness and approved for release by the U.S. Geological Survey (USGS), no warranty expressed or implied is made regarding the display or utility of the data for other purposes, nor on all computer systems, nor shall the act of distribution constitute any such warranty."\n'
            + '"USGS Software Disclaimer: This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use."\n'
            + '"USGS Product Names Disclaimer: Any use of trade, firm, or product names is for descriptive purposes only and does not imply endorsement by the U.S. Government."\n\n';
            
            let periodOfRecord = (this.gage['StartDate'] !== undefined || this.gage['EndDate'] !== undefined) ? this.convertDateToString(this.gage['StartDate']) + " - " + this.convertDateToString(this.gage['EndDate']) : "Undefined";

            var filename = 'data.csv';
            var csvFile = '\uFEFFStreamStats Gage Page\n\n'
            + 'Gage Information\n'
            + 'Name,Value\n'
            + 'USGS Station Number,"' + this.gage.code + '"\n'
            + 'Station Name,"' + this.gage.name + '"\n'
            + 'Station Type,"' + this.gage.stationType.name + '"\n'
            + 'Latitude,"' + this.gage.lat + '"\n'
            + 'Longitude,"' + this.gage.lng + '"\n'
            + 'NWIS Latitude,"' + this.NWISlat + '"\n'
            + 'NWIS Longitude,"' + this.NWISlng + '"\n'
            + 'Is regulated?,"' + this.gage.isRegulated + '"\n'
            + 'Agency,"' + this.gage.agency.name + '"\n'
            + 'NWIS Discharge Period of Record,"' + periodOfRecord + '"\n\n';

            // Physical Characteristics tables
            var _this = this;
            if (this.gage.characteristics.length > 0) {
                csvFile += 'Physical Characteristics\n\n';
                this.filteredStatGroupsChar.forEach(function (statisticGroup) {
                    if (_this.selectedStatGroupsChar.length == 0 || _this.selectedStatGroupsChar.indexOf(statisticGroup) > -1) {
                        csvFile += '"' + statisticGroup.name + '"\n'
                        + _this.tableToCSV($('#physical-characteristics-table-' + statisticGroup.id)) + "\n\n";
                    }
                });
            }

            // Streamflow Statistics tables
            if (this.gage.statisticsgroups.length > 0) {
                csvFile += 'Streamflow Statistics\n\n';
                this.gage.statisticsgroups.forEach(function (statisticGroup) {
                    if (_this.selectedStatisticGroups.length == 0 || _this.selectedStatisticGroups.indexOf(statisticGroup) > -1) {
                        csvFile += '"' + statisticGroup.name + '"\n'
                        + _this.tableToCSV($('#streamflow-statistics-table-' + statisticGroup.id)) + "\n\n";
                    }
                });
            }

            // Citations table
            if (this.gage.citations.length > 0) {
                csvFile += "Citations\n"
                + this.tableToCSV($('#citations-table')) + "\n\n";
            }
            
            csvFile += disclaimer
            + '"Application Version:",' + this.AppVersion;

            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });

            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = <any>document.createElement("a");
                var url = URL.createObjectURL(blob);
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                else {
                    window.open(url);
                }
            }
        }

        // Gage Analysis Plots methods

        public getGagePlots() {
            this.getPeakInfo();
        }

        //Get peak values from NWIS
        public getPeakInfo() {
            const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + this.gage.code
            //console.log('GetPeakURL', url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const peakValues = [];
                    const estPeakValues = []; //dates that include a '-00'. Need to estimate these since they can't be date objects as they are not real dates.
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    data.shift().split('\t');
                    //remove extra random line
                    data.shift();
                    do {
                        let dataRow = data.shift().split('\t');
                        const peakObj = {
                            agency_cd: dataRow[0], 
                            site_no: dataRow[1],
                            peak_dt: dataRow[2],
                            peak_va: parseInt(dataRow[4]),
                            peak_stage: parseFloat(dataRow[6])
                        };
                        peakValues.push(peakObj)
                        //making a new array of invalid dates (dates with month or day of '00') that will be 'estimated' (changed to '01')
                        const estPeakObj = {
                            agency_cd: dataRow[0], 
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].replaceAll('-00','-01'),
                            peak_va: parseInt(dataRow[4]),
                            peak_stage: parseFloat(dataRow[6])
                        };
                        if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                            estPeakValues.push(estPeakObj) //pushing invalid dates to a new array
                        };
                    } while (data.length > 0);
                    const filteredArray = peakValues.filter(item => {
                        return (item.peak_dt[8] + item.peak_dt[9] !== '00' || item.peak_dt[8] + item.peak_dt[9] !== '00') //filtering out invalid dates from main array
                        //return (item.pead_va !== NaN)
                    });
                    this.peakDates = filteredArray;
                    this.estPeakDates = estPeakValues;
                }, (error) => {
                }).finally(() => {
                    this.getFloodFreq();
                });
        }             

        //Pull in data for flood frequency statistics
        //This will be used to plot x-percent AEP flood values as horizontal plotLines
        public getFloodFreq() {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
            //console.log('GetFloodFreqURL', url)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const data = response.data
                    //Lookup arrays for desired Flood Statistic IDs
                    const AEPlookup = [9,852,8,4,7,3,6,1,501,5,2,500,851,1438,818];
                    const altAEPlookup = [2311,2312,2313,2314,2315,2316,2317,2318]
                    const oneDayLookup = [82,83,84,85,596,820,1737];
                    const sevenDayLookup = [90,91,92,93,589,822,1165,1166,1167];
                    const fourteenDayLookup = [94,95,96,97,828,829];
                    const thirtyDayLookup = [98,99,100,101,657,830,1174,1175,1176];
                    const contrOneDayLookup = [1753,1773,1081,1744,1766,1712];
                    const contrSevenDayLookup = [1082,1083,1992,2015,2039,2048];
                    const contrFourteenDayLookup = [1645,1652,1662,1669,1677,1683];
                    const contrThirtyDayLookup = [1084,1891,1085,1861,1882,1837];
                    const weightedOneDayLookup = [1755,1775,1732,1746];
                    const weightedSevenDayLookup = [2025,2050,2001,2017,2041,2007];
                    const weightedThirtyDayLookup = [1871,1893,1845,1863,1884,1854];
                    let AEPchartData = [];
                    let altAEPchartData = [];
                    let oneDayChartData = [];
                    let sevenDayChartData = [];
                    let fourteenDayChartData = [];
                    let thirtyDayChartData = [];
                    let contrOneDayChartData = [];
                    let contrSevenDayChartData = [];
                    let contrFourteenDayChartData = [];
                    let contrThirtyDayChartData = [];
                    let weightedOneDayChartData = [];
                    let weightedSevenDayChartData = [];
                    let weightedThirtyDayChartData = [];
                    do {
                        var IDs = data.statistics
                        for (let item of IDs) {
                            if(AEPlookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                AEPchartData.push(item);
                            }
                            if(altAEPlookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                altAEPchartData.push(item);
                            }
                            if(oneDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                oneDayChartData.push(item);
                            } 
                            if(sevenDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                sevenDayChartData.push(item);
                            }          
                            if(fourteenDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                fourteenDayChartData.push(item);
                            }
                            if(thirtyDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                thirtyDayChartData.push(item);
                            }  
                            if(contrOneDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                contrOneDayChartData.push(item);
                            }    
                            if(contrSevenDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                contrSevenDayChartData.push(item);
                            }
                            if(contrFourteenDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                contrFourteenDayChartData.push(item);
                            }
                            if(contrThirtyDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                contrThirtyDayChartData.push(item);
                            }
                            if(weightedOneDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                weightedOneDayChartData.push(item);
                            }
                            if(weightedSevenDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                weightedSevenDayChartData.push(item);
                            }
                            if(weightedThirtyDayLookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                weightedThirtyDayChartData.push(item);
                            }
                        }
                } while (data.length > 0);
                this.floodFreq = AEPchartData;
                this.altFloodFreq = altAEPchartData;
                this.oneDayStats = oneDayChartData;
                this.sevenDayStats = sevenDayChartData;
                this.fourteenDayStats = fourteenDayChartData;
                this.thirtyDayStats = thirtyDayChartData;
                this.contrOneDayStats = contrOneDayChartData;
                this.contrSevenDayStats = contrSevenDayChartData;
                this.contrFourteenDayStats = contrFourteenDayChartData;
                this.contrThirtyDayStats = contrThirtyDayChartData;
                this.weightedOneDayStats = weightedOneDayChartData;
                this.weightedSevenDayStats = weightedSevenDayChartData;
                this.weightedThirtyDayStats = weightedThirtyDayChartData;
            }).finally(() => {
                this.getDailyFlow();
            });
        }

        //Pull in data for daily flow values
        public getDailyFlow() {
            var date = new Date ();
			var timeInMillisec = date.getTime ();	// the milliseconds elapsed since 01 January, 1970 00:00:00 UTC
			timeInMillisec -= 15 * 24 * 60 * 60 * 1000; 	// 14 days in milliseconds
			date.setTime (timeInMillisec);
            var twoWeeksAgo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 )) //ending date range two weeks ago to replace with IV
                    .toISOString()
                    .split("T")[0];
            var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01&endDT=' + twoWeeksAgo;
            //console.log('GetDailyFlowURL', url);
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const data = response.data.value.timeSeries;
                    if (data.length !== 0) {
                        var dailyValues = data[0].values[0].value
                    }
                    else {
                        dailyValues = 0
                    };
                    if (dailyValues !== 0) {
                    const filteredDaily = dailyValues.filter(item => {
                        return (parseFloat(item.value) !== -999999) //removes placeholder values
                    });
                    this.dailyFlow = filteredDaily;
                    }
                    this.getInstantaneousFlow();
                }); 
            }
        
        //Pull in instantaneous flow value data from NWIS
        public getInstantaneousFlow(){
            var date = new Date ();
			var timeInMillisec = date.getTime ();	// the milliseconds elapsed since 01 January, 1970 00:00:00 UTC
			timeInMillisec -= 15 * 24 * 60 * 60 * 1000; 	// 14 days in milliseconds
			date.setTime (timeInMillisec);
            var twoWeeksAgo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0]; //removes the timezone offset so the dates will appear in their recorded timezone
            var url = 'https://nwis.waterservices.usgs.gov/nwis/iv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&startDT=' + twoWeeksAgo;
            //console.log(url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const data = response.data.value.timeSeries;
                    if (data.length !== 0) {
                        var instValues = data[0].values[0].value
                        var timeZoneInfo = data[0].sourceInfo.timeZoneInfo;
                        this.gageTimeZone = timeZoneInfo;
                    }
                    else {
                        instValues = 0
                    };
                    if (instValues !== 0) {
                    const filteredInst = instValues.filter(item => {
                        return (parseFloat(item.value) !== -999999 ) //removes placeholder values
                    });
                    this.instFlow = filteredInst;
                    }
                    //console.log('inst', this.instFlow)
                    this.getNWSForecast();
                                        console.log(this.gageTimeZone)

                });
        }

        //Pull in NWS Forecasted flow values
        public getNWSForecast() {
            var self = this;
            var nwisCode = this.gage.code
                //translates the gage code from NWIS to NWS using a crosswalk
                this.$http.get('./data/gageNumberCrossWalk.json').then(function(response) {
                self.crossWalk = response.data
                var NWScode = self.crossWalk[nwisCode];
                if (NWScode !== undefined) {
                    var url =  "https://water.weather.gov/ahps2/hydrograph_to_xml.php?output=xml&gage="+ NWScode;
                    //console.log('NWS forecast url', url)
                    const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'xml');
                    self.Execute(request).then(
                        (response: any) => {
                            const xmlDocument = new DOMParser().parseFromString(response.data, "text/xml")
                            const forecastData = xmlDocument.querySelectorAll("forecast");
                            if (forecastData[0] !== undefined) {
                            const smallerData = forecastData[0].childNodes;
                            let forecastArray = [];
                            if (self.dailyFlow !== undefined) {
                            let timeZoneOffset = self.gageTimeZone.defaultTimeZone.zoneOffset;
                            let numberOffset = parseFloat(timeZoneOffset);
                            smallerData.forEach(datum => {
                                if (datum.childNodes[0] !== undefined) {
                                    let date = new Date(datum.childNodes[0].textContent)
                                    //console.log(date.getUTCHours());
                                    date.setUTCHours(date.getUTCHours() + numberOffset); //this is going to be where we put it in the time zone of the gage,
                                    //but I need to make it work for 1) the specific time zone and 2) when the subtracting spans multiple days
                                    //ex: Sep 22 00:00:00 when you subtract 5 it goes onto a diff day but the set hours doesn't seem to like that
                                const forecastObj = {
                                    x: date,
                                    //stage: parseFloat(datum.childNodes[1].textContent),
                                    y: parseFloat(datum.childNodes[2].textContent)
                                }
                                
                                //forecastObj.x.setHours(12, 0, 0);
                                if ((smallerData[2].childNodes[2].getAttribute("units")) === 'kcfs') {
                                    forecastObj.y *= 1000 //standardizing units (some were in kcfs and some were in cfs)
                                }
                                forecastArray.push(forecastObj);
                                self.NWSforecast = forecastArray;
                            }
                            })
                        }}
                            self.getShadedDailyStats();
                        }
                    );
                } else {
                    self.getShadedDailyStats();
                }
                });
        }
        
        //Pull in Shaded Stats data
        public getShadedDailyStats() {
            var url = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb,1.0&indent=on&sites=' + this.gage.code + '&statReportType=daily&statTypeCd=all&parameterCd=00060';
            //console.log('shaded url', url);
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const meanPercentileStats = [];
                    let raw = [];
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    if (data.length > 0) {
                    data.shift().split('\t');
                    data.shift();
                    do {
                        let nonArrayDataRow = data.shift().split('\t');
                        raw.push(nonArrayDataRow)
                        var finalIndex = this.dailyFlow.length-1;
                        var finalDate = new Date(this.dailyFlow[finalIndex].dateTime)
                        var finalYear = finalDate.getUTCFullYear();
                        let stringDate = new Date(parseFloat(nonArrayDataRow[5]) + '/' + parseFloat(nonArrayDataRow[6]) + '/' + finalYear);
                        const meanPercentiles = {
                            date: stringDate,
                            begin_yr: parseFloat(nonArrayDataRow[7]),
                            end_yr: parseFloat(nonArrayDataRow[8]),
                            min_va: parseFloat(nonArrayDataRow[13]),
                            p10_va: parseFloat(nonArrayDataRow[16]),
                            p25_va: parseFloat(nonArrayDataRow[18]),
                            p75_va: parseFloat(nonArrayDataRow[20]),
                            p90_va: parseFloat(nonArrayDataRow[22]),
                            max_va: parseFloat(nonArrayDataRow[11])
                        }
                        meanPercentileStats.push(meanPercentiles);
                    } while (data.length > 0);
                }
                    this.meanPercent = meanPercentileStats;
                    this.rawShaded = raw;
                    this.getRatingCurve();
                });
        }

        public getRatingCurve() {
            const url = 'https://waterdata.usgs.gov/nwisweb/get_ratings?site_no=' + this.gage.code + '&file_type=exsa'
            // console.log('getDischargeInfo', url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            
            this.dischargeObj = [];
            // console.log('discharge data', this.dischargeObj)

            this.Execute(request).then(
                (response: any) => {
                    // console.log('response?', response)
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    //console.log('data', data)
                    data.shift().split('\t');
                    //console.log('data with shift', data)
                    data.shift();
                    // console.log('discharge data', dischargeObj)
                    data.forEach(row => {
                        let dataRow = row.split('\t')
                        const object = {
                            x: parseFloat(dataRow[2]),
                            y: parseFloat(dataRow[0])
                        };
                        this.dischargeObj.push(object) 
                    });
                   // console.log('this.discharge obj 1st one', this.dischargeObj)
                    // console.log('dischargeObj', dischargeValue)
                }, (error) => {
                    // console.log(error)
                }).finally(() => {
                    this.getUSGSMeasured()
                });
        }       

        public getUSGSMeasured() {
            const url = 'https://waterdata.usgs.gov/nwis/measurements?site_no=' + this.gage.code + '&agency_cd=USGS&format=rdb_expanded'
            // console.log('usgsMeasuredURL', url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            
            this.measuredObj = [];
            // console.log('is measured obj have data', this.measuredObj)
            this.Execute(request).then(
                (response: any) => {
                    const data = response.data
                    //console.log('data error message', data)
                    var errorMessage = '<title>USGS NwisWeb error message</title>'
                    this.error = data.includes(errorMessage)
                    if (this.error == false) { // No error
                    // console.log('response usgsmeasured', response)
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    // console.log('data', data)
                    data.shift().split('\t');
                    // console.log('data with shift', data)
                    data.shift();
                    //console.log('another data shift', data)
                    // let dataRow = data.shift().split('\t');
                    // console.log('datarow splits', dataRow)
                    // debugger;
                    data.forEach(row => {
                        let dataRow = row.split('\t')
                        // console.log('datarow', dataRow)
                        const object = { 
                            dateTime: dataRow[3],
                            timeZone: dataRow[4],
                            quality: dataRow[10],
                            control: dataRow[13],
                            x: parseFloat(dataRow[9]),
                            y: parseFloat(dataRow[8]),
                            qualityColor: this.stageDischargeQualityColor(dataRow[10]),
                            color: this.stageDischargeAgeColor (new Date(dataRow[3])),
                            ageColor: this.stageDischargeAgeColor (new Date(dataRow[3]))
                            // time: this.dateTime (dataRow[3]),
                            // color: this.getQualityCorrectColor (dataRow[10])
                        };
                        // console.log(object)
                        this.measuredObj.push(object) 
                    });
                }
                    // console.log('measured obj', this.measuredObj)
                        // console.log('dischargeObj', dischargeValue)
                }, (error) => {
                    // console.log(error)
                }).finally(() => {
                    this.formatData()
                });

        } 

        // using this to eventually show flood stage
        // public getFloodStage() {
        //     const url = 'https://water.weather.gov/ahps2/hydrograph_to_xml.php?output=xml&gage=' + this.nwsStations
        //     //console.log('flood stage data', url)
        //     const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            
        //     this.measuredObj = [];

        //     this.Execute(request).then(
        //         (response: any) => {
        //             // console.log('response usgsmeasured', response)
        //             const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
        //             // console.log('data', data)
        //             data.shift().split('\t');
        //             // console.log('data with shift', data)
        //             data.shift();
        //             //console.log('another data shift', data)
        //             // let dataRow = data.shift().split('\t');
        //             // console.log('datarow splits', dataRow)
        //             // debugger;
        //             data.forEach(row => {
        //                 let dataRow = row.split('\t')
        //                 // console.log('datarow', dataRow)
        //                 const object = { 
        //                     dateTime: dataRow[3],
        //                     timeZone: dataRow[4],
        //                     quality: dataRow[10],
        //                     control: dataRow[13],
        //                     x: parseFloat(dataRow[9]),
        //                     y: parseFloat(dataRow[8]),
        //                     qualityColor: this.stageDischargeQualityColor(dataRow[10]),
        //                     color: this.stageDischargeAgeColor (new Date(dataRow[3]))
        //                     // time: this.dateTime (dataRow[3]),
        //                     // color: this.getQualityCorrectColor (dataRow[10])
        //                 };
        //                 // console.log(object)
        //                 this.measuredObj.push(object) 
        //             });
        //             // console.log('measured obj', this.measuredObj)
        //                 // console.log('dischargeObj', dischargeValue)
        //         }, (error) => {
        //             // console.log(error)
        //         }).finally(() => {
        //             this.formatData()
        //         });

        // } 

        //Get data into format necessary for plotting in Highcharts
        public formatData(): void {
            if (this.peakDates) {
                this.peakDates.forEach(peakObj => {
                    if (!isNaN(peakObj.peak_va)) {
                    this.formattedPeakDates.push({x: new Date(peakObj.peak_dt), y: peakObj.peak_va})
                    this.formattedDischargePeakDates.push({x: peakObj.peak_va, y: peakObj.peak_stage, date: peakObj.peak_dt})
                }
                });
            } 
            if (this.estPeakDates) {
                this.estPeakDates.forEach(estPeakObj => {
                    if (!isNaN(estPeakObj.peak_va)) {
                    this.formattedEstPeakDates.push({x: new Date(estPeakObj.peak_dt), y: estPeakObj.peak_va})
                    }
                });
            }
            if (this.meanPercent) {
                this.meanPercent.forEach(stats => {
                    this.formattedP0to10.push({x: stats.date, low: stats.min_va, high: stats.p10_va});
                    this.formattedP10to25.push({x: stats.date, low: stats.p10_va, high: stats.p25_va});
                    this.formattedP25to75.push({x: stats.date, low: stats.p25_va, high: stats.p75_va});
                    this.formattedP75to90.push({x: stats.date, low: stats.p75_va, high: stats.p90_va});
                    this.formattedP90to100.push({x: stats.date, low: stats.p90_va, high: stats.max_va});
                })
            }
            this.formattedP0to10.sort((a, b) => a.x - b.x);
            this.formattedP10to25.sort((a, b) => a.x - b.x);
            this.formattedP25to75.sort((a, b) => a.x - b.x);
            this.formattedP75to90.sort((a, b) => a.x - b.x);
            this.formattedP90to100.sort((a, b) => a.x - b.x);

            if (this.dailyFlow) {
                this.dailyFlow.forEach(dailyObj => {
                    if (parseFloat(dailyObj.value) !== -999999) {
                    var date = new Date(dailyObj.dateTime);
                    date.setHours(12, 0, 0);
                    this.formattedDailyFlow.push({x: date, y: parseFloat(dailyObj.value)})
                    this.dailyDatesOnly.push(new Date(dailyObj.dateTime))
                }
                //console.log('before', this.formattedDailyFlow)

                let now = new Date(dailyObj.dateTime);
                    let year = new Date(dailyObj.dateTime).getUTCFullYear();
                    //Getting dates in Julian days
                    function daysIntoYear(now){
                        return (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
                    };
                    var doy = daysIntoYear(now);
                    function isLeapYear(year) {
                        if (year % 400 === 0) return true;
                        if (year % 100 === 0) return false;
                        return year % 4 === 0;
                    };
                    if (parseInt(dailyObj.value) !== -999999) {
                    this.dailyValuesOnly.push(parseInt(dailyObj.value));

                    if (isLeapYear(year) == false && doy > 59) {
                        doy += 1; //add a day onto non-leap years so that dates after Feb 28 will line up with leap years
                    };
                    if (doy > 274) {
                        year += 1 //converting years into water years for plotting (adjusted in tooltip to show real dates)
                    };
                    if (doy < 275) {
                        doy += 366; //making 275 (Oct 1) the lowest number so the x-axis can start at the beginning of the water year
                    };
                    if (parseInt(dailyObj.value) !== -999999) {
                        this.formattedDailyHeat.push({x: doy, y: year, value: parseInt(dailyObj.value), length: 1});
                    };
                    if (isLeapYear(year) == false) {
                        this.formattedDailyHeat.push({x: 60, y: year, value: null, length: 1}); //adding a blank cell on Feb 29 on non-leap years so that data will line up
                    };
                }
                });
            }
            if (this.instFlow) {
                this.instFlow.forEach(instObj => {
                    if (parseFloat(instObj.value) !== -999999) {
                        let index  = this.formattedDailyFlow.length-1
                        let finalDate = this.formattedDailyFlow[index].x
                        let stringDate = instObj.dateTime.split('.')[0];
                        let instDate = new Date(stringDate);
                    if (instDate > finalDate) {
                    this.formattedInstFlow.push({x: instDate, y: parseFloat(instObj.value)})
                    }
                }
            })
            }
            //checking for the latest year between the peaks and the daily flow
            let finalPeakorDailyDate = new Date('January 1, 1800') // assign way in past
            if (this.formattedPeakDates.length > 0) {
                var finalPeakIndex = this.formattedPeakDates.length-1;
                if (this.formattedPeakDates[finalPeakIndex].x > finalPeakorDailyDate) {
                    finalPeakorDailyDate = this.formattedPeakDates[finalPeakIndex].x
                }
            }
            if (this.formattedDailyFlow.length > 0) {
                var finalDailyIndex = this.formattedDailyFlow.length-1;
                if (this.formattedDailyFlow[finalDailyIndex].x > finalPeakorDailyDate) {
                    finalPeakorDailyDate = this.formattedDailyFlow[finalDailyIndex].x
                }
            }
            var finalIndex = this.formattedDailyFlow.length-1;
            var finalYear = (finalPeakorDailyDate).getUTCFullYear(); //currently using the final daily flow point as latest year, but sometimes gage has more recent peaks
            //return an array with a date each day between first recording and last
            function dateRange(startDate, endDate, steps = 1) {
                const dateArray = [];
                let currentDate = new Date(startDate);
                while (currentDate <= new Date(endDate)) {
                    dateArray.push(new Date(currentDate));
                  // Use UTC date to prevent problems with time zones and DST
                currentDate.setUTCDate(currentDate.getUTCDate() + steps);
                }
                return dateArray;
            }
            let dates;
            function difference(a1, a2) {
                var result = [];
                for (var i = 0; i < a1.length; i++) {
                    if (a2.indexOf(a1[i]) === -1) {
                    result.push(new Date(a1[i]));
                    }
                }
                return result;
            }
            if (this.formattedDailyFlow.length > 0) {
            dates = dateRange(this.formattedDailyFlow[0].x, this.formattedDailyFlow[finalIndex].x);
            //format the arrays (all dates in range and all dates with a recorded value) to be compared to each other
            dates = dates.map(date => (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear());
            
            let observedDates = this.dailyDatesOnly.map(observedDate => (observedDate.getUTCMonth() + 1) + "/" + observedDate.getUTCDate() + "/" + observedDate.getUTCFullYear());
            //find the difference between the two arrays (which dates are in the dates array but not the observedDates array)
            let differences = difference(dates, observedDates)
            //add the difference dates to the plot data with null values so that there can be breaks in the line when there are no recordings
            differences.forEach(date => this.formattedDailyFlow.push({x: date, y: null}))
        
            this.formattedDailyFlow.sort((a, b) => a.x - b.x);
            }
            if (this.peakDates) {
                this.peakDates.forEach(peakOnYear => {
                    let adjustedDate = new Date(peakOnYear.peak_dt);
                    adjustedDate.setUTCFullYear(finalYear);
                    let currentYear = new Date(adjustedDate.toUTCString())
                    if (!isNaN(peakOnYear.peak_va)) {
                        this.formattedPeakDatesOnYear.push({x: currentYear, y: peakOnYear.peak_va, realDate: new Date(peakOnYear.peak_dt)})
                        }
                });
            }
            if (this.estPeakDates) {
                this.estPeakDates.forEach(estPeakOnYear => {
                    let adjustedDate = new Date(estPeakOnYear.peak_dt);
                    adjustedDate.setUTCFullYear(finalYear);
                    let currentYear = new Date(adjustedDate.toUTCString())
                    this.formattedEstPeakDatesOnYear.push({x: currentYear, y: estPeakOnYear.peak_va, realDate: new Date(estPeakOnYear.peak_dt)})
                });
            }
            //finding the earliest and latest dates out of all three data series
            let startDate = new Date('January 1, 3000')  // assign way in future
            let endDate = new Date('January 1, 1800') // assign way in past
                if (this.formattedPeakDates.length > 0) {
                    if (this.formattedPeakDates[0].x < startDate) {
                        startDate = this.formattedPeakDates[0].x
                    }
                    var finalPeakIndex = this.formattedPeakDates.length-1;
                    if (this.formattedPeakDates[finalPeakIndex].x > endDate) {
                        endDate = this.formattedPeakDates[finalPeakIndex].x
                    }
                }
                if (this.formattedDailyFlow.length > 0) {
                    if (this.formattedDailyFlow[0].x < startDate) {
                        startDate = this.formattedDailyFlow[0].x 
                    }
                    var finalDailyIndex = this.formattedDailyFlow.length-1;
                    if (this.formattedDailyFlow[finalDailyIndex].x > endDate) {
                        endDate = this.formattedDailyFlow[finalDailyIndex].x
                    }
                }
                if (this.formattedEstPeakDates.length > 0) {
                    if (this.formattedEstPeakDates[0].x < startDate) {
                        startDate = this.formattedEstPeakDates[0].x
                    }
                    var finalEstIndex = this.formattedEstPeakDates.length-1;
                    if (this.formattedEstPeakDates[finalEstIndex].x > endDate) {
                        endDate = this.formattedEstPeakDates[finalEstIndex].x
                    }
                }
                if (this.formattedPeakDatesOnYear.length > 0) {
                    this.formattedPeakDatesOnYear.sort((a, b) => a.x - b.x);
                    if (this.formattedPeakDatesOnYear[0].x < startDate) {
                        startDate = this.formattedPeakDatesOnYear[0].x 
                    }
                    var finalPeakOnYearIndex = this.formattedPeakDatesOnYear.length-1;
                    if (this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x > endDate) {
                        endDate = this.formattedPeakDatesOnYear[finalPeakOnYearIndex].x
                    }
                }
            this.startAndEnd.push(startDate, endDate);
            let endYear = endDate.getUTCFullYear();
            let endOfFinalYear = new Date(12 + '/' + 31 + '/' + endYear)            
            if (this.oneDayStats) {
                this.formattedOneDayStats = [];
                const oneDayStatsColors = {
                    82: '#e6194B',
                    83: '#f58231',
                    84: '#ffe119',
                    85: '#bfef45',
                    596: '#3cb44b',
                    820: '#42d4f4',
                    1737: '#911eb4'
                };
                this.oneDayStats.forEach((oneDayItem) => {
                    let colorIndex = oneDayItem.regressionTypeID;
                    let formattedName = oneDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedOneDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>1-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + oneDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: oneDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: oneDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: oneDayItem.value
                            }
                        ],
                        linkedTo: 'oneDay',
                        number: 10,
                        marker: {
                            symbol: 'circle',
                            radius: 1
                        },
                        })
                })
            }
            if (this.sevenDayStats) {
                this.formattedSevenDayStats = [];
                const sevenDayStatsColors = {
                    90: '#9A6324',
                    91: '#e6194B',
                    92: '#f58231',
                    93: '#ffe119',
                    589: '#bfef45',
                    822: '#3cb44b',
                    1165: '#42d4f4',
                    1166: '#911eb4',
                    1167: '#dcbeff'
                };
                this.sevenDayStats.forEach((sevenDayItem) => {
                    let colorIndex = sevenDayItem.regressionTypeID;
                    let formattedName = sevenDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedSevenDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>7-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + sevenDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: sevenDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: sevenDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: sevenDayItem.value
                            }
                        ],
                        linkedTo: 'sevenDay',
                        number: 11,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.fourteenDayStats) {
                this.formattedFourteenDayStats = [];
                const fourteenDayStatsColors = {
                    94: '#e6194B',
                    95: '#f58231',
                    96: '#ffe119',
                    97: '#3cb44b',
                    828: '#42d4f4',
                    829: '#911eb4'
                };
                this.fourteenDayStats.forEach((fourteenDayItem) => {
                    let colorIndex = fourteenDayItem.regressionTypeID;
                    let formattedName = fourteenDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedFourteenDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>14-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + fourteenDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: fourteenDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: fourteenDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: fourteenDayItem.value
                            }
                        ],
                        linkedTo: 'fourteenDay',
                        number: 12,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.thirtyDayStats) {
                this.formattedThirtyDayStats = [];
                const thirtyDayStatsColors = {
                    98: '#9A6324',
                    99: '#e6194B',
                    100: '#f58231',
                    101: '#ffe119',
                    657: '#bfef45',
                    830: '#3cb44b',
                    1174: '#42d4f4',
                    1175: '#911eb4',
                    1176: '#dcbeff'
                };
                this.thirtyDayStats.forEach((thirtyDayItem) => {
                    let colorIndex = thirtyDayItem.regressionTypeID;
                    let formattedName = thirtyDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedThirtyDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>30-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + thirtyDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: thirtyDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: thirtyDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: thirtyDayItem.value
                            }
                        ],
                        linkedTo: 'thirtyDay',
                        number: 13,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.contrOneDayStats) {
                this.formattedContrOneDayStats = [];
                const contrOneDayStatsColors = {
                    1081: '#ffe119',
                    1712: '#911eb4',
                    1744: '#3cb44b',
                    1753: '#e6194B', 
                    1766: '#42d4f4',
                    1773: '#f58231' 
                };
                this.contrOneDayStats.forEach((contrOneDayItem) => {
                    let colorIndex = contrOneDayItem.regressionTypeID;
                    let formattedName = contrOneDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedContrOneDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Controlled 1-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + contrOneDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrOneDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: contrOneDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: contrOneDayItem.value
                            }
                        ],
                        linkedTo: 'contrOneDay',
                        number: 14,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.contrSevenDayStats) {
                this.formattedContrSevenDayStats = [];
                const contrSevenDayStatsColors = {
                    1082: '#e6194B',
                    1083: '#ffe119',
                    1992: '#911eb4',
                    2015: '#3cb44b',
                    2039: '#42d4f4',
                    2048: '#f58231'
                };
                this.contrSevenDayStats.forEach((contrSevenDayItem) => {
                    let colorIndex = contrSevenDayItem.regressionTypeID;
                    let formattedName = contrSevenDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedContrSevenDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Controlled 7-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + contrSevenDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrSevenDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: contrSevenDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: contrSevenDayItem.value
                            }
                        ],
                        linkedTo: 'contrSevenDay',
                        number: 16,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.contrFourteenDayStats) {
                this.formattedContrFourteenDayStats = [];
                const contrFourteenDayStatsColors = {
                    1645: '#911eb4',
                    1652: '#ffe119',
                    1662: '#3cb44b',
                    1669: '#e6194B',
                    1677: '#42d4f4',
                    1683: '#f58231'
                };
                this.contrFourteenDayStats.forEach((contrFourteenDayItem) => {
                    let colorIndex = contrFourteenDayItem.regressionTypeID;
                    let formattedName = contrFourteenDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedContrFourteenDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Controlled 14-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + contrFourteenDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrFourteenDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: contrFourteenDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: contrFourteenDayItem.value
                            }
                        ],
                        linkedTo: 'contrFourteenDay',
                        number: 17,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.contrThirtyDayStats) {
                this.formattedContrThirtyDayStats = [];
                const contrThirtyDayStatsColors = {
                    1084: '#e6194B',
                    1085: '#ffe119',
                    1837: '#911eb4',
                    1861: '#3cb44b',
                    1882: '#42d4f4',
                    1891: '#f58231'
                };
                this.contrThirtyDayStats.forEach((contrThirtyDayItem) => {
                    let colorIndex = contrThirtyDayItem.regressionTypeID;
                    let formattedName = contrThirtyDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedContrThirtyDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Controlled 30-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + contrThirtyDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrThirtyDayStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: contrThirtyDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: contrThirtyDayItem.value
                            }
                        ],
                        linkedTo: 'contrThirtyDay',
                        number: 18,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.weightedOneDayStats) {
                this.formattedWeightedOneDayStats = [];
                const contrweightedOneStatsColors = {
                    1755: '#e6194B',
                    1775: '#ffe119',
                    1732: '#3cb44b',
                    1746: '#42d4f4'
                };
                this.weightedOneDayStats.forEach((weightedOneDayItem) => {
                    let colorIndex = weightedOneDayItem.regressionTypeID;
                    let formattedName = weightedOneDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedWeightedOneDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Weighted 1-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + weightedOneDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrweightedOneStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: weightedOneDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: weightedOneDayItem.value
                            }
                        ],
                        linkedTo: 'weightedOneDay',
                        number: 19,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.weightedSevenDayStats) {
                this.formattedWeightedSevenDayStats = [];
                const contrweightedSevenStatsColors = {
                    2025: '#e6194B',
                    2050: '#f58231',
                    2001: '#ffe119',
                    2017: '#3cb44b',
                    2041: '#42d4f4',
                    2007: '#911eb4'
                };
                this.weightedSevenDayStats.forEach((weightedSevenDayItem) => {
                    let colorIndex = weightedSevenDayItem.regressionTypeID;
                    let formattedName = weightedSevenDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedWeightedSevenDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Weighted 7-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + weightedSevenDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrweightedSevenStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: weightedSevenDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: weightedSevenDayItem.value
                            }
                        ],
                        linkedTo: 'weightedSevenDay',
                        number: 20,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.weightedThirtyDayStats) {
                this.formattedWeightedThirtyDayStats = [];
                const contrweightedThirtyStatsColors = {
                    1871: '#e6194B',
                    1893: '#f58231',
                    1845: '#ffe119',
                    1863: '#3cb44b',
                    1884: '#42d4f4',
                    1854: '#911eb4'
                };
                this.weightedThirtyDayStats.forEach((weightedThirtyDayItem) => {
                    let colorIndex = weightedThirtyDayItem.regressionTypeID;
                    let formattedName = weightedThirtyDayItem.regressionType.name.replaceAll('_',' ');
                    this.formattedWeightedThirtyDayStats.push({
                        name: formattedName,
                        tooltip: {
                            headerFormat:'<b>Weighted 30-Day Low Flow Statistics',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>Value: <b>' + weightedThirtyDayItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: contrweightedThirtyStatsColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: weightedThirtyDayItem.value
                            },{
                                x: endOfFinalYear,
                                y: weightedThirtyDayItem.value
                            }
                        ],
                        linkedTo: 'weightedThirtyDay',
                        number: 21,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            if (this.altFloodFreq) {
                this.formattedAltFloodFreq = [];
                const altFloodFreqColors = {
                    2311: '#f58231',
                    2312: '#3cb44b',
                    2313: '#e6194B',
                    2314: '#bfef45',
                    2315: '#911eb4',
                    2316: '#9A6324',
                    2317: '#ffe119',
                    2318: '#42d4f4'
                };
                this.altFloodFreq.forEach((altFloodFreqItem) => {
                    let colorIndex = altFloodFreqItem.regressionTypeID;
                    let formattedName = altFloodFreqItem.regressionType.name.substring(0, altFloodFreqItem.regressionType.name.length-18);
                    this.formattedAltFloodFreq.push({
                        name: altFloodFreqItem.regressionType.name,
                        tooltip: {
                            headerFormat:'<b>Alternative Annual Exceedance Probability (AEP)',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '</b><br>AEP: <b>'  + formattedName + '%' + '</b><br>Value: <b>' + altFloodFreqItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: altFloodFreqColors[colorIndex],
                        dataLabels: {
                            enabled: true,
                            zIndex: 3,
                            pointFormatter: function() { 
                                if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                    return formattedName + '% AEP'
                                }
                            } 
                        },
                        data:
                        [
                            {
                                x: startDate,
                                y: altFloodFreqItem.value
                            },{
                                x: endOfFinalYear,
                                y: altFloodFreqItem.value
                            }
                        ],
                        linkedTo: 'altAEP',
                        number: 15,
                        marker: {
                            symbol: 'circle',
                            radius: 0.1
                        },
                        })
                })
            }
            //Sum and average daily values by year
            if (this.formattedDailyHeat.length >0) {
            const noNulls = this.formattedDailyHeat.filter(item => {
                return(item.value != null) // getting rid of any objects with null values so they don't affect average
            });
            let previousYear = noNulls[0].y
            let sum = 0;
            let length = 0;
            let listOfSummations = [];
            for (let i=0; i<noNulls.length; i++){
                let currentData = noNulls[i];
                let currentYear = currentData.y;
                if (previousYear == currentYear){
                sum += currentData.value
                length += currentData.length
                } else {
                listOfSummations.push({x: 650, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 651, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 652, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 653, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 654, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 655, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 656, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 657, y: currentYear -1, value: sum / length, sum: sum, length: length}, 
                                    {x: 658, y: currentYear -1, value: sum / length, sum: sum, length: length});
                sum = currentData.value;
                length = currentData.length;
                }
                if (i == noNulls.length - 1){
                    listOfSummations.push({x: 650, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 651, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 652, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 653, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 654, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 655, y: currentYear, value: sum / length, sum: sum, length: length},
                                        {x: 656, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 657, y: currentYear, value: sum / length, sum: sum, length: length}, 
                                        {x: 658, y: currentYear, value: sum / length, sum: sum, length: length},)
                    }
                previousYear = currentYear;
            }
            var addAvg = this.formattedDailyHeat.concat(listOfSummations); //adding the averages into the daily value array so they can be plotted
            this.formattedDailyPlusAvg.push(addAvg);
            }
            if (this.floodFreq) { //set up AEP plotLines, defining their colors
                this.formattedFloodFreq = [];
                    const AEPColors = {
                        9: '#9A6324',
                        852: '#800000',
                        8: '#e6194B',
                        818: '#ffd8b1',
                        7: '#f58231',
                        6: '#ffe119', 
                        5: '#bfef45',
                        4: '#3cb44b',
                        3: '#42d4f4',
                        1: '#4363d8',
                        501: '#000075',
                        2: '#911eb4',
                        500: '#dcbeff',
                        851: '#fabed4',
                        1438: '#469990'
                    };
                    //this.formattedFloodFreq = [];
                    this.floodFreq.forEach((floodFreqItem) => {
                        let colorIndex = floodFreqItem.regressionTypeID;
                        let formattedName = floodFreqItem.regressionType.name.substring(0, floodFreqItem.regressionType.name.length-18);
                        this.formattedFloodFreq.push({
                            name: floodFreqItem.regressionType.name,
                            tooltip: {
                                headerFormat:'<b>Annual Exceedance Probability (AEP)',
                                pointFormatter: function(){
                                    if (this.formattedPeakDates !== null){
                                        return '</b><br>AEP: <b>'  + formattedName + '%' + '</b><br>Value: <b>' + floodFreqItem.value + ' ft³/s<br>'
                                    }
                                }
                            },
                            turboThreshold: 0, 
                            type: 'line',
                            color: AEPColors[colorIndex],
                            dataLabels: {
                                enabled: true,
                                zIndex: 3,
                                pointFormatter: function() { 
                                    if (this.x.getUTCFullYear() == endDate.getUTCFullYear()) {
                                        return formattedName + '% AEP'
                                    }
                                } 
                            },
                            data:
                            [
                                {
                                    x: startDate,
                                    y: floodFreqItem.value
                                },{
                                    x: endOfFinalYear,
                                    y: floodFreqItem.value
                                }
                            ],
                            linkedTo: 'dummyAEP',
                            number: 9,
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                            })
                    });
            this.allFloodFreqStats.push(this.formattedFloodFreq, this.formattedAltFloodFreq, this.formattedOneDayStats, this.formattedSevenDayStats, this.formattedFourteenDayStats, this.formattedThirtyDayStats, this.formattedContrOneDayStats, this.formattedContrSevenDayStats, this.formattedContrFourteenDayStats, this.formattedContrThirtyDayStats, this.formattedWeightedOneDayStats, this.formattedWeightedSevenDayStats, this.formattedWeightedThirtyDayStats);
            
            this.allFloodFreqStats = this.allFloodFreqStats.filter(group => group.length > 0);

            this.allFloodFreqStats.forEach((group, index) => {
                this.allFloodFreqStats[index] = {
                    name: group[0].tooltip.headerFormat.replace("<b>",""),
                    statistics: group,
                    seriesIndex: group[0].number
                }
            });
            this.selectedFloodFreqStats = this.allFloodFreqStats[0];
            this.createAnnualFlowPlot();
            this.createDailyRasterPlot();
            this.createDischargePlot();
        }}

        public createAnnualFlowPlot(): void {
            //console.log('peak value plot data', this.formattedPeakDates);
            //console.log('estimated peak plot data', this.formattedEstPeakDates);
            //console.log('daily flow plot data', this.formattedDailyFlow);
            //console.log('peak value plot data plotted on one year', this.formattedPeakDatesOnYear.length)
            //console.log('0-10', this.formattedP0to10);
            //console.log('NWS Forecast', this.NWSforecast)
            //console.log('Inst Flow', this.formattedInstFlow.length)
            let timezone;
            //	09383100
            let zoneAbbreviation;
            if (this.formattedInstFlow.length > 0) {
            zoneAbbreviation = this.gageTimeZone.defaultTimeZone.zoneAbbreviation
            //console.log(zoneAbbreviation)
            if (zoneAbbreviation === 'EST' || zoneAbbreviation === 'EDT' || zoneAbbreviation === 'ET') {
                timezone = 'America/New_York'
            }
            if (zoneAbbreviation === 'CST' || zoneAbbreviation === 'CDT' || zoneAbbreviation === 'CT') {
                timezone = 'America/Chicago'
            }
            if (zoneAbbreviation === 'MST' || zoneAbbreviation === 'MDT' || zoneAbbreviation === 'MT') {
                timezone = 'America/Denver'
            }
            if (zoneAbbreviation === 'PST' || zoneAbbreviation === 'PDT' || zoneAbbreviation === 'PT') {
                timezone = 'America/Los_Angeles'
            }
            if (zoneAbbreviation === 'AKST' || zoneAbbreviation === 'AKDT' || zoneAbbreviation === 'AKT') {
                timezone = 'America/Anchorage' // test gage 15276000
            }
            if (zoneAbbreviation === 'HST' || zoneAbbreviation === 'HT' || zoneAbbreviation === 'HDT') {
                timezone === 'Pacific/Honolulu' // test gage 16759600
            }
            if (zoneAbbreviation === 'AST' || zoneAbbreviation === 'ADT') {
                timezone === 'America/Puerto_Rico' // test gage 50044810
            }
            }
            if (zoneAbbreviation === undefined) {
                zoneAbbreviation = ''
            }

            var self = this
            let min;
                if (this.formattedPeakDatesOnYear.length > 0) {
                    min = (new Date(1 +'/' + 1 + '/' + this.startAndEnd[1].getFullYear())).getTime()
                } else {
                    min = this.startAndEnd[0].getTime()
                }
            let max = (new Date(12 +'/' + 31 + '/' + this.startAndEnd[1].getFullYear())).getTime()
            this.chartConfig = {
                chart: {
                    height: 550,
                    width: 800,
                    zooming: {
                        type: 'xy'
                    },
                    panning: true, 
                    panKey: 'shift',
                    events: {
                        load: function () {
                            self.updateShadedStats();
                        }
                    }
                },
                title: {
                    text: 'Annual Peak Streamflow',
                    align: 'center'
                },
                time: {
                    useUTC: false, 
                    timezone: 'America/New_York'
                },
                legend: {
                    useHTML: true,
                    symbolPadding: null,
                    symbolWidth: null,
                    symbolHeight: null,
                    squareSymbol: null,
                    labelFormatter: function() {
                    return this.name
                    //     if (this.name === 'Shaded Daily Statistics') {
                    //     return this.name + '<img src="./images/shadedLegend.png" width="15" height="15">'
                    // } else {
                    //     return this.name
                    // }
                }
                },
                subtitle: {
                    text: 'Click and drag to zoom in. Hold down shift key to pan.<br>AEP = Annual Exceedance Probability',
                    align: 'center'
                },
                rangeSelector: {
                    enabled: false,
                    inputPosition: {
                        align: 'left',
                        x: 0,
                        y: 0
                    },
                    buttons: [],
                },
                navigator: {
                    enabled: true
                },
                xAxis: {
                    type: 'datetime',
                    events: {
                        afterSetExtremes: function() {
                            //console.log('the x axis has been resized')
                            self.updateShadedStats();
                        }
                    },
                    gridLineWidth: 0,
                    min: min,
                    max: max,
                    title: {
                        text: 'Date '
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                yAxis: {
                    title: {
                        text: 'Discharge (Q), in ft³/s'
                    },
                    gridLineWidth: 1,
                    custom: {
                        allowNegativeLog: true
                    },
                    plotLines: [{value: null, color: null, width: null, zIndex: null, label: {text: null}, id: 'plotlines'}]
                },
                series  : [
                {
                    name    : 'Annual Peak Streamflow',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                        pointFormatter: function(){
                            if (this.formattedPeakDatesOnYear !== null){
                                let waterYear = this.realDate.getUTCFullYear();
                                if (this.realDate.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.realDate.getUTCDate();
                                let year = this.realDate.getUTCFullYear();
                                let month = this.realDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',
                    color   : 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data    : this.formattedPeakDatesOnYear,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 5,
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedPeakDates.length > 0
                },{
                    name    : 'Annual Peak Streamflow (Date Estimated)',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                        pointFormatter: function(){
                            if (this.formattedEstPeakDatesOnYear !== null){
                                let waterYear = this.realDate.getUTCFullYear();
                                if (this.realDate.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.realDate.getUTCDate();
                                let year = this.realDate.getUTCFullYear();
                                let month = this.realDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date (estimated): <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',
                    color   : 'red',
                    fillOpacity: null, 
                    lineWidth: null,
                    data    : this.formattedEstPeakDatesOnYear,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 5,
                    marker: {
                        symbol: 'square',
                        radius: 3
                    },
                    showInLegend: this.formattedEstPeakDates.length > 0 //still showing up in legend if y is NaN
                },{
                    name: 'Daily Percentile Streamflow', //P 90 - 100 %
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>90-100% Streamflow</b>',
                        pointFormatter: function(){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDate = month + '/' + UTCday + '/' + year;
                            return '<br>Date: <b>'  + formattedUTCDate + '</b><br>90th percentile: <b>' + this.low + ' ft³/s</b><br>Max: <b>' + this.high + ' ft³/s'
                        }
                    },
                    turboThreshold: 0, 
                    type: 'arearange',
                    color: '#0000FF',
                    fillOpacity: 0.2, 
                    lineWidth: 0,
                    data: this.formattedP90to100,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 1,
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: this.formattedP90to100.length > 0
                },{
                    name: 'P 0-10%',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>0-10% Streamflow</b>',
                        pointFormatter: function(){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDate = month + '/' + UTCday + '/' + year;
                            return '<br>Date: <b>'  + formattedUTCDate + '</b><br>Min: <b>' + this.low + ' ft³/s</b><br>10th percentile: <b>' + this.high + ' ft³/s'
                        }
                    },
                    turboThreshold: 0, 
                    type: 'arearange',
                    color: '#8B0000',
                    fillOpacity: 0.2, 
                    lineWidth: 0,
                    data: this.formattedP0to10,
                    linkedTo: ':previous',
                    visible: true,
                    id: null,
                    zIndex: 1,
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },{
                    name: 'p 10-25 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>10-25% Streamflow</b>',
                        pointFormatter: function(){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDate = month + '/' + UTCday + '/' + year;
                            return '<br>Date: <b>'  + formattedUTCDate + '</b><br>10th percentile: <b>' + this.low + ' ft³/s</b><br>25th percentile: <b>' + this.high + ' ft³/s'
                        }
                    },
                    turboThreshold: 0, 
                    type: 'arearange',
                    color: '#B8860B',
                    fillOpacity: 0.2, 
                    lineWidth: 0,
                    data: this.formattedP10to25,
                    linkedTo: ':previous',
                    visible: true,
                    id: null,
                    zIndex: 1,
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },{
                    name: 'p 25-75 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>25-75% Streamflow</b>',
                        pointFormatter: function(){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDate = month + '/' + UTCday + '/' + year;
                            return '<br>Date: <b>'  + formattedUTCDate + '</b><br>25th percentile: <b>' + this.low + ' ft³/s</b><br>75th percentile: <b>' + this.high + ' ft³/s'
                        }
                    },
                    turboThreshold: 0, 
                    type: 'arearange',
                    color: '#006400',
                    fillOpacity: 0.2, 
                    lineWidth: 0,
                    data: this.formattedP25to75,
                    linkedTo: ':previous',
                    visible: true,
                    id: null,
                    zIndex: 1,
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },{
                    name: 'p 75-90 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>75-90% Streamflow</b>',
                        pointFormatter: function(){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDate = month + '/' + UTCday + '/' + year;
                            return '<br>Date: <b>'  + formattedUTCDate + '</b><br>75th percentile: <b>' + this.low + ' ft³/s</b><br>90th percentile: <b>' + this.high + ' ft³/s'
                        }
                    },
                    turboThreshold: 0, 
                    type: 'arearange',
                    color: '#008B8B',
                    fillOpacity: 0.2, 
                    lineWidth: 0,
                    data: this.formattedP75to90,
                    linkedTo: ':previous',
                    visible: true,
                    id: null,
                    zIndex: 1,
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },{
                    name    : 'Daily Mean Streamflow',
                    showInNavigator: true,
                    tooltip: {
                        headerFormat:'<b>Daily Mean Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedDailyFlow !== null){
                                let UTCday = this.x.getUTCDate();
                                let year = this.x.getUTCFullYear();
                                let month = this.x.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedUTCDailyDate + '</b><br>Value: <b>' + this.y + ' ft³/s'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'line',
                    color   : '#1434A4',
                    //color   : '#add8f2',
                    fillOpacity: null, 
                    lineWidth: 1.5,
                    data    : this.formattedDailyFlow,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 4,
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedDailyFlow.length > 0
                },{
                    name    : 'NWS Forecast',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>NWS Forecast</b>',
                        pointFormatter: function(){
                            if (this.formattedPeakDates !== null){
                                let hours = this.x.getHours();
                                if (hours < 10)  {
                                    hours = '0'+hours;
                                }
                                let minutes = this.x.getMinutes();
                                if (minutes < 10)  {
                                    minutes = '0'+minutes;
                                }
                                let UTCday = this.x.getDate();
                                let year = this.x.getFullYear();
                                let month = this.x.getMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedDailyDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedDailyDate + ' (' + hours + ':' + minutes +  ' ' + zoneAbbreviation + ')</b><br>Value: <b>' + this.y + ' ft³/s'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'line',
                    color   : 'purple',
                    fillOpacity: null, 
                    lineWidth: 1.5,
                    data    : this.NWSforecast,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 3,
                    marker: {
                        symbol: '',
                        radius: 3
                    },
                    showInLegend: this.NWSforecast !== undefined
                },{
                    name: 'Annual Exceedance Probability',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: true,
                    id: 'dummyAEP',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: '1-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'oneDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: '7-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'sevenDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: '14-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'fourteenDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: '30-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'thirtyDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Controlled 1-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'contrOneDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Alternative Annual Exceedance Probability (AEP)',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: this.formattedFloodFreq.length === 0,
                    id: 'altAEP',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Controlled 7-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'contrSevenDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Controlled 14-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'contrFourteenDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Controlled 30-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'contrThirtyDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Weighted 1-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'weightedOneDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Weighted 7-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'weightedSevenDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name: 'Weighted 30-Day Low Flow Statistics',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat: null,
                        pointFormatter: function(){
                        }
                    },
                    turboThreshold: 0, 
                    type: null,
                    color: 'black',
                    fillOpacity: null, 
                    lineWidth: null,
                    data: null,
                    linkedTo: null,
                    visible: false,
                    id: 'weightedThirtyDay',
                    zIndex: 2,
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                },{
                    name    : 'Instantaneous Streamflow',
                    showInNavigator: true,
                    tooltip: {
                        headerFormat:'<b>Instantaneous Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedInstFlow !== null){
                                let hours = this.x.getHours();
                                //hours-= 5 // need to make this work if hours is < 5
                                if (hours < 10)  {
                                    hours = '0'+hours;
                                }
                                let minutes = this.x.getMinutes();
                                if (minutes < 10)  {
                                    minutes = '0'+minutes;
                                }
                                let UTCday = this.x.getUTCDate();
                                let year = this.x.getUTCFullYear();
                                let month = this.x.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedUTCDailyDate + ' (' + hours + ':' + minutes + ' ' + zoneAbbreviation + ')</b><br>Value: <b>' + this.y + ' ft³/s'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'line',
                    color   : '#008000',
                    //color   : '#add8f2',
                    fillOpacity: null, 
                    lineWidth: 1.5,
                    data    : this.formattedInstFlow,
                    linkedTo: null,
                    visible: true,
                    id: null,
                    zIndex: 4,
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedInstFlow.length > 0
                }
            ] 
            }
            this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
                this.chartConfig.series.push(formattedFloodFreqItem)
            });
            this.formattedOneDayStats.forEach((formattedOneDay) => {
                this.chartConfig.series.push(formattedOneDay)
            });
            this.formattedSevenDayStats.forEach((formattedSevenDay) => {
                this.chartConfig.series.push(formattedSevenDay)
            });
            this.formattedFourteenDayStats.forEach((formattedFourteenDay) => {
                this.chartConfig.series.push((formattedFourteenDay))
            });
            this.formattedThirtyDayStats.forEach((formattedThirtyDay) => {
                this.chartConfig.series.push((formattedThirtyDay))
            });
            this.formattedContrOneDayStats.forEach((formattedContrOneDay) => {
                this.chartConfig.series.push((formattedContrOneDay))
            });
            this.formattedAltFloodFreq.forEach((formattedAltFloodFreqItem) => {
                this.chartConfig.series.push(formattedAltFloodFreqItem)
            });
            this.formattedContrSevenDayStats.forEach((formattedContrSevenDay) => {
                this.chartConfig.series.push((formattedContrSevenDay))
            });
            this.formattedContrFourteenDayStats.forEach((formattedContrFourteenDay) => {
                this.chartConfig.series.push((formattedContrFourteenDay))
            });
            this.formattedContrThirtyDayStats.forEach((formattedContrThirtyDay) => {
                this.chartConfig.series.push((formattedContrThirtyDay))
            });
            this.formattedWeightedOneDayStats.forEach((formattedWeightedOneDay) => {
                this.chartConfig.series.push((formattedWeightedOneDay))
            });
            this.formattedWeightedSevenDayStats.forEach((formattedWeightedSevenDay) => {
                this.chartConfig.series.push((formattedWeightedSevenDay))
            });
            this.formattedWeightedThirtyDayStats.forEach((formattedWeightedThirtyDay) => {
                this.chartConfig.series.push((formattedWeightedThirtyDay))
            });
        }

        //dropdown for choosing flood statistics
        public chooseFloodStats() {
            let chart = $('#chart1').highcharts();
            let floodSeries = chart.series[this.selectedFloodFreqStats.seriesIndex]
            //figure out how to have this option loaded when the plot is instantiated
            if (this.selectedFloodFreqStats.name === this.selectedFloodFreqStats.name) {
                this.allFloodFreqStats.forEach((stat) => {
                    let index = stat.seriesIndex
                    chart.series[index].hide();
                })
                floodSeries.show();
            }
        }

        public stageDischargeAgeColor(date): string {
            let days = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
                if (days <= 31) {
                    // console.log("first month", days)
                    return 'red'; // orange
                } else if (days <= 365) {
                    return 'orange'; // orange    
                } else if (days <= 730) {
                    return "#0000cdcc"; // blue
                } else {
                    return "#0000cd4d"; // light blue
                }
        }

        public stageDischargeQualityColor(quality) {
            if (quality === "Good") {
            return "#2ED017";
            } else if (quality === "Fair") {
            return "#E7F317";
            } else { (quality === "Poor") }
            return "#FFA200";
            } 



        //Create discharge and rating curve chart
        public createDischargePlot(): void {
            // console.log('peak value plot data', this.formattedPeakDates);
            this.dischargeChartConfig = {
                chart: {
                    height: 450,
                    width: 800,
                    zooming: {
                        type: 'xy'
                    }
                },
                title: {
                    text: 'Stage vs. Discharge',
                    align: 'center'
                },
                subtitle: {
                    text: 'Click and drag in the plot area to zoom in',
                    align: 'center'
                },
                xAxis: {
                    type: null,
                    title: {
                        text: 'River Discharge (cfs)'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                yAxis: {
                    title: {
                        text: 'River Stage (ft)'
                    },
                    custom: {
                        allowNegativeLog: true
                    },
                    plotLines: [{value: null, color: null, width: null, zIndex: null, label: {text: null}, id: 'plotlines'}]
                },
                series  : [
                {
                    name    : 'USGS Rating Curve',
                    showInNavigator: false,
                    tooltip: { headerFormat:'<b>USGS Rating Curve</b>',
                        pointFormatter: function(){
                            if (this.dischargeObj !== null){
                                let discharge = this.x;
                                let stage = this.y;
                                return '<br>Gage Height: <b>' + stage + ' ft' + '</b><br>Discharge: <b>' + discharge + ' cfs'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'spline',
                    color   : 'black ',
                    data    : this.dischargeObj,
                    marker: {
                        symbol: 'square',
                        radius: 2.5
                    },
                    showInLegend: this.dischargeObj.length > 5
                },
                {
                    name    : 'Annual Peaks',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>Annual Peaks</b>',
                        pointFormatter: function(){
                            if (this.formattedPeakDates !== null){
                                let UTCday = this.getUTCDate;
                                let year = this.getUTCFullYear;
                                let month = this.getUTCMonth;
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                let discharge = this.x;
                                let stage = this.y;
                                let peakDate = this.date
                                return '<br>Date: <b>' + peakDate +  '</b></br>Peak: <b>' + discharge + ' cfs</b></br>at stage <b>' + stage + ' ft</b></br>'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',
                    color   : 'black',
                    data    : this.formattedDischargePeakDates,
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedDischargePeakDates.length > 0
                },
                {
                    name    : 'USGS Measured',
                    showInNavigator: false,
                    tooltip: { headerFormat:'<b>USGS Measured Discharge</b>',
                        pointFormatter: function(){
                            if (this.measuredObj !== null){
                                let dateTime = this.dateTime;
                                let timeZone = this.timeZone;
                                let quality = this.quality;
                                let control = this.control;
                                let discharge = this.x;
                                let stage = this.y;
                                return '<br> Date: <b>' + dateTime + ' ' + timeZone + '</b></br>Gage Height: <b>' + stage + ' ft</b></br>' + 'Discharge: <b>' + discharge + ' cfs</b></br>' + 'Quality: <b>' + quality + '</b></br>Control: <b>' + control + '</b></br>'
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',  
                    color: null,
                    data    : this.measuredObj,
                    marker: {
                        symbol: 'diamond',
                        radius: 3
                    },
                    showInLegend: this.error == false //!this.measuredObj.every(item => isNaN(item.y)) 
                }] 
            } 
        }
        public createDailyRasterPlot(): void {
            if (this.dailyValuesOnly.length > 0) {
                // sort array ascending
                const asc = this.dailyValuesOnly.sort((a, b) => a - b);
                //caluculate percentile values
                var fifthPercentile = asc[Math.floor(asc.length * 0.05)];
                var ninetyfifthPercentile = asc[Math.floor(asc.length * 0.95)];
            };
            function logOrLinear(dailyValuesOnly) {
                if (dailyValuesOnly.some(v => v <= 0)) {
                    return {
                        type: 'linear',
                        min: fifthPercentile, 
                        max: ninetyfifthPercentile,
                        stops: 
                        //viridis color palette
                        [
                            [0, '#fde725'],
                            [0.3, '#7ad151'],
                            [0.5, '#22a884'],
                            [0.6, '#2a788e'],
                            [0.8, '#414487'],
                            [1, '#440154']
                        ],
                        startOnTick: false,
                        endOnTick: false,
                        labels: {
                            format: '{value} ft³/s'
                        },
                        allowNegativeLog: true
                    }
                }
                if (dailyValuesOnly.some(v => v > 0)) {
                    return {
                        type: 'logarithmic',
                        min: null, 
                        max: null,
                        stops:
                        //viridis color palette
                        [
                            [0, '#fde725'],
                            [0.3, '#7ad151'],
                            [0.5, '#22a884'],
                            [0.6, '#2a788e'],
                            [0.8, '#414487'],
                            [1, '#440154']
                        ],
                        startOnTick: false,
                        endOnTick: false,
                        labels: {
                            format: '{value} ft³/s'
                        },
                        allowNegativeLog: true
                    }
                }
            }
            function isLeapYear(year) {
                if (year % 400 === 0) return true;
                if (year % 100 === 0) return false;
                return year % 4 === 0;
            }
            this.heatChartConfig = {
                chart: {
                        height: 450,
                        width: 800,
                        zooming: {
                            type: 'xy'
                        }
                },
                title: {
                    text: 'Daily Streamflow',
                    align: 'center'
                },
                subtitle: {
                    text: 'Click and drag in the plot area to zoom in',
                    align: 'center'
                },
                xAxis: {
                    type: null,
                    min: 275,
                    max: 665,
                    tickPositions: [275, 306, 336, 367, 398, 427, 458, 488, 519, 549, 580, 611, 650],
                    title: {
                        text: 'Day of Year'
                    },
                    threshold: 273,
                    labels: {
                        formatter: function() {
                            if (this.value > 366) {
                                this.value -= 365
                            }
                            if(this.value == 285) return 'Annual Average';
                            return moment("2015 "+this.value, "YYYY DDD").format("MMM");
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Water Year'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                colorAxis: logOrLinear(this.dailyValuesOnly),
                series: [{
                    name: 'Daily Streamflow',
                    pixelSpacing: null,
                    borderWidth: 0,
                    borderColor: 'white',
                    type: 'heatmap',
                    data: this.formattedDailyPlusAvg[0],
                    tooltip: {
                        headerFormat:'<b>Daily Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedDailyPlusAvg !== null){
                                let year = this.y;
                                let doy = this.x;
                                if (doy > 366) {
                                    doy -= 366; //returning doy to 1-366 for labeling purposes
                                };
                                if (doy > 274) {
                                    year -= 1; //subracting a year from Oct-Dec dates to get the cal year vs water year
                                };
                                if (isLeapYear(year) == false && doy > 59) {
                                    doy -= 1 //subtracting a day off of non-leap years after Feb 28 so that the labels are accurate
                                };
                                let fullDate = new Date(year, 0, doy)
                                let UTCday = fullDate.getUTCDate();
                                let month = fullDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCDate = month + '/' + UTCday + '/' + year;
                                let waterYear = year;
                                if (month > 9) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                if (doy > 282 && doy < 293) return '</b><br>Water Year: <b>' + waterYear + '</b><br>Water Year Average Value: <b>' + this.value.toFixed(2) + ' ft³/s</b>';
                                if (doy !== 283 && doy !== 284 && doy !== 285 && doy !== 286 && doy !== 287 && doy !== 288 && doy !== 289 && doy !== 290 && doy !== 291 && doy !== 292) return '<br>Date: <b>'  + formattedUTCDate + '</b><br>Value: <b>' + this.value + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    },
                    turboThreshold: 0
                }]
            }
        };

        public containsNegatives() {
            if (this.dailyValuesOnly.some(v => v <= 0)) {
                return true
            }
            if (this.dailyValuesOnly.some(v => v > 0)) {
                return false
            }
        }
        
        //checkbox for turning plotLines on and off
        public plotlines = true;
        public togglePlotLines () {
            let chart = $('#chart1').highcharts();
            if (this.plotlines) {
            this.chartConfig.yAxis.plotLines.forEach((plotLine) => {
                chart.yAxis[0].addPlotLine(plotLine);
            });
            }
        }

        //checkbox for turning on and off AEP lines
        public showFloodStats = true;
        public toggleFloodStats () {
            let chart = $('#chart1').highcharts();
            let floodSeries = chart.series[this.selectedFloodFreqStats.seriesIndex]
            if (this.showFloodStats) {
                floodSeries.show();
            } else {
                floodSeries.hide();
            }
        }

        //checkbox for change linear to log scale
        public logScale = false; 
        public toggleLogLinear () {
            let chart = $('#chart1').highcharts();
            if (this.logScale) {
                chart.yAxis[0].update({ type: 'logarithmic' });
            } else {
                chart.yAxis[0].update({ type: 'linear' });
            }
        };
        //checkbox to plot peaks on one year (2022 for now)
        public peaksOnYear = true;
        public togglePeakYear () {
            let chart = $('#chart1').highcharts();
            chart.showLoading('Loading...')

            setTimeout(() => {
        
                let min = this.startAndEnd[0].getTime()
                let oneYearMin = (new Date(1 +'/' + 1 + '/' + this.startAndEnd[1].getFullYear())).getTime()
                let max = (new Date(12 +'/' + 31 + '/' + this.startAndEnd[1].getFullYear())).getTime()
                if (this.peaksOnYear) {
                    chart.series[0].update({ data: this.formattedPeakDatesOnYear });
                    chart.series[1].update({ data: this.formattedEstPeakDatesOnYear});
                    chart.xAxis[0].setExtremes(oneYearMin, max);
                    chart.series[0].update( {tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                        pointFormatter: function(){
                            if (this.formattedPeakDatesOnYear !== null){
                                let waterYear = this.realDate.getUTCFullYear();
                                if (this.realDate.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.realDate.getUTCDate();
                                let year = this.realDate.getUTCFullYear();
                                let month = this.realDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    } })
                    chart.series[1].update( {tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b><br> Plotted on Latest Year',
                        pointFormatter: function(){
                            if (this.formattedEstPeakDatesOnYear !== null){
                                let waterYear = this.realDate.getUTCFullYear();
                                if (this.realDate.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.realDate.getUTCDate();
                                let year = this.realDate.getUTCFullYear();
                                let month = this.realDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date (estimated): <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    } })
                } else {
                    chart.series[0].update({ data: this.formattedPeakDates });
                    chart.series[1].update({ data: this.formattedEstPeakDates});
                    chart.xAxis[0].setExtremes(min, max);
                    chart.series[0].update({ tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedPeakDates !== null){
                                let waterYear = this.x.getUTCFullYear();
                                if (this.x.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.x.getUTCDate();
                                let year = this.x.getUTCFullYear();
                                let month = this.x.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date: <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    }})
                    chart.series[1].update({ tooltip: {
                        headerFormat:'<b>Annual Peak Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedEstPeakDates !== null){
                                let waterYear = this.x.getUTCFullYear();
                                if (this.x.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                let UTCday = this.x.getUTCDate();
                                let year = this.x.getUTCFullYear();
                                let month = this.x.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
                                return '<br>Date (estimated): <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    }})
                }
                chart.hideLoading();
            }, 100);
        };

        public destroyResetZoom() {
            let chart = $('#chart1').highcharts();
                chart.showResetZoom();
                chart.resetZoomButton.hide();
        }

        public resetZoom () {
            let chart = $('#chart1').highcharts();
            let min = this.startAndEnd[0].getTime()
            let oneYearMin = (new Date(1 +'/' + 1 + '/' + this.startAndEnd[1].getFullYear())).getTime()
            let max = (new Date(12 +'/' + 31 + '/' + this.startAndEnd[1].getFullYear())).getTime()
            if (this.peaksOnYear) {
                //reset to one year
                chart.xAxis[0].setExtremes(oneYearMin, max);
                chart.yAxis[0].setExtremes();
            } else {
                //reset to full extent
                chart.yAxis[0].setExtremes();
                chart.xAxis[0].setExtremes(min, max);
            }
        }

        public dateRangePicker () {
            let chart = $('#chart1').highcharts();
            if (($('#dischargeStart').val()).length === 10 && ($('#dischargeEnd').val()).length === 10) {
            let inputStart = Date.parse($('#dischargeStart').val())
            let inputEnd = Date.parse($('#dischargeEnd').val());
            chart.yAxis[0].setExtremes();
            chart.xAxis[0].setExtremes(inputStart, inputEnd);
            } else {
                //console.log('Please enter a valid date format')
            }
        }
        
        public updateShadedStats () {
            let chart = $('#chart1').highcharts();
            let extremes = chart.xAxis[0].getExtremes()
            let min = new Date(extremes.min)
            let max = new Date(extremes.max)
            var minDateString = new Date(min.getTime() - (min.getTimezoneOffset() * 60000 ))
                .toISOString()
                .split("T")[0];
            var maxDateString = new Date(max.getTime() - (min.getTimezoneOffset() * 60000 ))
                    .toISOString()
                            .split("T")[0];
            let minAndMax = {
                min: minDateString,
                max: maxDateString
            }
            this.extremes = minAndMax;
            let maxYear = max.getFullYear();
            let minYear = min.getFullYear();
            
            function inMonths(d1, d2) {
                var d1Y = d1.getFullYear();
                var d2Y = d2.getFullYear();
                var d1M = d1.getMonth();
                var d2M = d2.getMonth();
                return (d2M+12*d2Y)-(d1M+12*d1Y);
            }
            function generateYearsBetween(startYear = 2000, endYear) {
                const endDate = endYear || new Date().getFullYear();
                let years = [];
            
                for (var i = startYear; i <= endDate; i++) {
                    years.push(startYear);
                    startYear++;
                }
                return years;
            }
            if ((inMonths(min, max)) <= 60) {
                chart.series[3].show();
                chart.series[4].show();
                
            const yearsArray = generateYearsBetween(minYear, maxYear);
            let newData = [];
            //console.log('in the function', this.rawShaded)
            yearsArray.forEach(year => {
                this.rawShaded.forEach(index => {
                    const data = {
                        date: new Date(parseFloat(index[5]) + '/' + parseFloat(index[6]) + '/' + year),
                        //new Date(parseFloat(nonArrayDataRow[5]) + '/' + parseFloat(nonArrayDataRow[6]) + '/' + year),
                        begin_yr: parseFloat(index[7]),
                        end_yr: parseFloat(index[8]),
                        min_va: parseFloat(index[13]),
                        p10_va: parseFloat(index[16]),
                        p25_va: parseFloat(index[18]),
                        p75_va: parseFloat(index[20]),
                        p90_va: parseFloat(index[22]),
                        max_va: parseFloat(index[11])
                        }
                        //console.log('here', data)
                        newData.push(data);
                })
            })
            let newP0to10 = [];
            let newP10to25 = [];
            let newP25to75 = [];
            let newP75to90 = [];
            let newP90to100 = [];
            if (newData) {
                newData.forEach(stats => {
                    newP0to10.push({x: stats.date, low: stats.min_va, high: stats.p10_va});
                    newP10to25.push({x: stats.date, low: stats.p10_va, high: stats.p25_va});
                    newP25to75.push({x: stats.date, low: stats.p25_va, high: stats.p75_va});
                    newP75to90.push({x: stats.date, low: stats.p75_va, high: stats.p90_va});
                    newP90to100.push({x: stats.date, low: stats.p90_va, high: stats.max_va});
                })
            }
            //console.log('updated', newP0to10, newP10to25, newP25to75, newP75to90, newP90to100)
                chart.series[5].show();
                chart.series[6].show();
                chart.series[2].show();
                
                chart.series[3].update({data: newP0to10});
                chart.series[4].update({data: newP10to25});
                chart.series[5].update({data: newP25to75});
                chart.series[6].update({data: newP75to90});
                chart.series[2].update({data: newP90to100});
            } else {
                chart.series[3].hide();
                chart.series[4].hide();
                chart.series[5].hide();
                chart.series[6].hide();
                chart.series[2].hide();
            }
        }
            
        //checkbox to linear to log scale for discharge plot
        public logScaleDischarge = false; // starts with it uncehcked
            public toggleLogLinearDischarge() {
                // console.log('toggleLogLinearDischarge() called');
                let chart = $('#chart3').highcharts();
                // console.log('logScaleDischarge', this.logScaleDischarge);
                if (this.logScaleDischarge) {
                    chart.xAxis[0].update({ type: 'logarithmic' });
                    chart.yAxis[0].update({ type: 'logarithmic' });
                } else {
                    chart.xAxis[0].update({ type: 'linear' });
                    chart.yAxis[0].update({ type: 'linear' });
                }
            };

        public toggleDischargeData (dataType) {
            let chart = $('#chart3').highcharts();
            let currentUSGSMeasuredData = chart.series[2].data;
            currentUSGSMeasuredData.forEach(row => {
                row.color = (dataType == 'age') ? row.ageColor : row.qualityColor;
            });
            chart.series[2].update({data:currentUSGSMeasuredData});
        }
        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {   
            //console.log("in GagePage controller");
            this.AppVersion = configuration.version;
            this.getGagePage();
            this.getGagePlots();
            this.SelectedTab = GagePageTab.GageInformation;
        }

        private convertDateToString(date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth()+1).toString();
            var dd  = date.getDate().toString();
        
            var mmChars = mm.split('');
            var ddChars = dd.split('');
        
            return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
        }

        private tableToCSV($table) {
            var $headers = $table.find('tr:has(th)')
                , $rows = $table.find('tr:has(td)')

                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                , tmpColDelim = String.fromCharCode(11) // vertical tab character
                , tmpRowDelim = String.fromCharCode(0) // null character

                // actual delimiter characters for CSV format
                , colDelim = '","'
                , rowDelim = '"\r\n"';

            // Grab text from table into CSV formatted string
            var csv = '"';
            csv += formatRows($headers.map(grabRow));
            csv += rowDelim;
            csv += formatRows($rows.map(grabRow)) + '"';
            return csv

            //------------------------------------------------------------
            // Helper Functions 
            //------------------------------------------------------------
            // Format the output so it has the appropriate delimiters
            function formatRows(rows) {
                return rows.get().join(tmpRowDelim)
                    .split(tmpRowDelim).join(rowDelim)
                    .split(tmpColDelim).join(colDelim);
            }

            // Grab and format a row from the table
            function grabRow(i, row) {

                var $row = $(row);
                //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                var $cols = $row.find('td');
                if (!$cols.length) $cols = $row.find('th');

                return $cols.map(grabCol)
                    .get().join(tmpColDelim);
            }

            // Grab and format a column from the table 
            function grabCol(j, col) {
                var $col = $(col),
                    $text = $col.text();

                return $text.replace('"', '""'); // escape double quotes

            }
        }

    }//end  class

    enum GagePageTab {
        GageInformation = 1,
        GageAnalysisPlots = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.GagePageController', GagePageController);
}//end module 