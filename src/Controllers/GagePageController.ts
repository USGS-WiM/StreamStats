﻿//------------------------------------------------------------------------------
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
        public floodFreq = undefined;
        public peakDates = undefined;
        public estPeakDates = undefined;
        public dailyFlow = undefined;
        public NWSforecast = undefined;
        public meanPercentileStats = undefined;
        public meanPercent = undefined;
        public formattedP0to10 = [];
        public formattedP10to25 = [];
        public formattedP25to75 = [];
        public formattedP75to90 = [];
        public formattedP90to100 = [];
        public formattedFloodFreq = [];
        public formattedPeakDates = [];
        public formattedPeakDatesOnYear = [];
        public formattedEstPeakDatesOnYear = [];
        public formattedEstPeakDates = [];
        public formattedDailyFlow = [];
        public dailyDatesOnly = [];

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        chartConfig: {  chart: { height: number, width: number, zooming: {type: string}, panning: boolean, panKey: string },
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},
                        rangeSelector: { enabled: boolean, inputPosition: {align: string, x: number, y: number}, 
                        //buttons: {type: string, count: number, text: string, title: string }[], 
                                        selected: number, buttonPosition: {align: string, x: number, y: number}},
                        navigator: { enabled: boolean}, 
                        xAxis: {  type: string, title: {text: string}, custom: { allowNegativeLog: Boolean }},
                        yAxis: { title: {text: string}, custom: { allowNegativeLog: Boolean }, plotLines: [{value: number, color: string, width: number, zIndex: number, label: {text: string}, id: string}]},
                        series: { name: string; showInNavigator: boolean, tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                                fillOpacity: number, lineWidth: number, data: number[], linkedTo: string, marker: {symbol: string, radius: number}, showInLegend: boolean; }[]; };
        constructor($scope: IGagePageControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            this.modalInstance = modal;
            this.modalService = modalService;
            this.init(); 
            this.selectedStatisticGroups = [];
            this.selectedCitations = [];
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
                console.log(this.filteredStatGroupsChar)
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
            this.getPeakInfo(); // Annual Peak Streamflow plot
        }

        //Get peak values from NWIS
        public getPeakInfo() {
            const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + this.gage.code
            //console.log('GetPeakURL', url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const peakValues = [];
                    const estPeakValues = []; //dates that include a '-00'
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
                            peak_va: parseFloat(dataRow[4])
                        };
                        peakValues.push(peakObj)
                        //making a new array of invalid dates (dates with month or day of '00') that will be 'estimated' (changed to '01')
                        const estPeakObj = {
                            agency_cd: dataRow[0], 
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].replaceAll('-00','-01'),
                            peak_va: parseFloat(dataRow[4])
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
                    // create a lookup array for desired AEP IDs
                    const AEPlookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318];
                    let chartData = [];
                    do {
                        var IDs = data.statistics
                        for (let item of IDs) {
                            if(AEPlookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
                                chartData.push(item);
                            } 
                        }
                } while (data.length > 0);
                this.floodFreq = chartData
            }).finally(() => {
                this.getDailyFlow();
            });
        }

        //Pull in data for daily flow values
        public getDailyFlow() {
            var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01';
            console.log('GetDailyFlowURL', url);
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
                        return (parseFloat(item.value) !== -999999)
                    });
                    this.dailyFlow = filteredDaily;
                    }
                    this.getNWSForecast();
                }); 
            }

        public getNWSForecast() {
            var self = this;
            //var url = undefined;
            var nwisCode = this.gage.code
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
                            smallerData.forEach(datum => {
                                if (datum.childNodes[0] !== undefined) {
                                const forecastObj = {
                                    x: new Date(datum.childNodes[0].textContent),
                                    //stage: parseFloat(datum.childNodes[1].textContent),
                                    y: parseFloat(datum.childNodes[2].textContent)
                                }
                                if ((smallerData[2].childNodes[2].getAttribute("units")) === 'kcfs') {
                                    forecastObj.y *= 1000
                                }
                                forecastArray.push(forecastObj);
                                self.NWSforecast = forecastArray;
                            }
                            })
                        }
                            self.getShadedDailyStats();
                        }
                    );
                } else {
                    self.getShadedDailyStats();
                }
                });
        }
        
        public getShadedDailyStats() {
            var url = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb,1.0&indent=on&sites=' + this.gage.code + '&statReportType=daily&statTypeCd=all&parameterCd=00060';
            //console.log('shaded url', url);
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const meanPercentileStats = [];
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    if (data.length > 0) {
                    data.shift().split('\t');
                    data.shift();
                    do {
                        //let dataRow = data;
                        //console.log('dataRow', dataRow)
                        let nonArrayDataRow = data.shift().split('\t');
                        var finalIndex = this.dailyFlow.length-1;
                        var finalDate = new Date(this.dailyFlow[finalIndex].dateTime)
                        var finalYear = finalDate.getUTCFullYear();
                        let stringDate = parseFloat(nonArrayDataRow[5]) + '/' + parseFloat(nonArrayDataRow[6]) + '/' + finalYear;
                        let date = new Date(stringDate);
                        const meanPercentiles = {
                            date: date.toUTCString(),
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
                    this.formatData();
                });
            
        }

        //Get data into (x, y) format and convert to dates in order to add it to the plot
        public formatData(): void {
            if (this.peakDates) {
                this.peakDates.forEach(peakObj => {
                    if (!isNaN(peakObj.peak_va)) {
                    this.formattedPeakDates.push({x: new Date(peakObj.peak_dt), y: peakObj.peak_va})
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
                    this.formattedP0to10.push({x: new Date(stats.date), low: stats.min_va, high: stats.p10_va});
                    this.formattedP10to25.push({x: new Date(stats.date), low: stats.p10_va, high: stats.p25_va});
                    this.formattedP25to75.push({x: new Date(stats.date), low: stats.p25_va, high: stats.p75_va});
                    this.formattedP75to90.push({x: new Date(stats.date), low: stats.p75_va, high: stats.p90_va});
                    this.formattedP90to100.push({x: new Date(stats.date), low: stats.p90_va, high: stats.max_va});

                })
            }
            if (this.dailyFlow) {
                this.dailyFlow.forEach(dailyObj => {
                    if (parseFloat(dailyObj.value) !== -999999) {
                    this.formattedDailyFlow.push({x: new Date(dailyObj.dateTime), y: parseFloat(dailyObj.value)})
                    this.dailyDatesOnly.push(new Date(dailyObj.dateTime))
                }
                });
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
            if (this.floodFreq) {
                //set up AEP plotLines
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
                        1438: '#469990',
                        2311: '#f58231',
                        2312: '#3cb44b',
                        2313: '#e6194B',
                        2314: '#bfef45',
                        2315: '#911eb4',
                        2316: '#9A6324',
                        2317: '#ffe119',
                        2318: '#42d4f4'
                    };
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
                    this.formattedFloodFreq = [];
                    this.floodFreq.forEach((floodFreqItem) => {
                        let colorIndex = floodFreqItem.regressionTypeID;
                        let endYear = endDate.getUTCFullYear();
                        let endOfFinalYear = new Date(12 + '/' + 31 + '/' + endYear)
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
                            linkedTo: ':previous',
                            marker: {
                                symbol: 'circle',
                                radius: 0.1
                            },
                            })
                    });
            this.createAnnualFlowPlot();
        }}

        //Create chart
        public createAnnualFlowPlot(): void {
            //console.log('peak value plot data', this.formattedPeakDates);
            //console.log('estimated peak plot data', this.formattedEstPeakDates);
            //console.log('daily flow plot data', this.formattedDailyFlow);
            //console.log('peak value plot data plotted on one year', this.formattedPeakDatesOnYear)
            //console.log(this.formattedP90to100);
            //console.log('NWS Forecast', this.NWSforecast)
            this.chartConfig = {
                chart: {
                    height: 550,
                    width: 800,
                    zooming: {
                        type: 'xy'
                    },
                    panning: true, 
                    panKey: 'shift'
                },
                title: {
                    text: 'Annual Peak Streamflow',
                    align: 'center'
                },
                subtitle: {
                    text: 'Click and drag to zoom in. Hold down shift key to pan.<br>AEP = Annual Exceedance Probability',
                    align: 'center'
                },
                rangeSelector: {
                    enabled: true,
                    inputPosition: {
                        align: 'left',
                        x: 0,
                        y: 0
                    },
                    selected: 3,
                    buttonPosition: {
                        align: 'right',
                        x: 0,
                        y: 0
                    },
                },
                navigator: {
                    enabled: true
                },
                xAxis: {
                    type: 'datetime',
                    //min: 1875,
                    // max: 2050,
                    title: {
                        text: 'Date'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                yAxis: {
                    title: {
                        text: 'Discharge (Q), in ft³/s'
                    },
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
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedPeakDates.length > 0
                },
                {
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
                    marker: {
                        symbol: 'square',
                        radius: 3
                    },
                    showInLegend: this.formattedEstPeakDates.length > 0 //still showing up in legend if y is NaN
                },
                {
                    name: 'Shaded Daily Statistics', //P 90 - 100 %
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>P 90-100 %</b>',
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
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: this.formattedP90to100.length > 0
                },
                {
                    name: 'P 0-10%',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>P 0-10 %</b>',
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
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },
                {
                    name: 'p 10-25 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>P 10-25 %</b>',
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
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },
                {
                    name: 'p 25-75 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>P 25-75 %</b>',
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
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },
                {
                    name: 'p 75-90 %',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>P 75-90 %</b>',
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
                    marker: {
                        symbol: null,
                        radius: null
                    },
                    showInLegend: false
                },
                {
                    name    : 'Daily Streamflow',
                    showInNavigator: true,
                    tooltip: {
                        headerFormat:'<b>Daily Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedPeakDates !== null){
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
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedDailyFlow.length > 0
                },
                {
                    name    : 'NWS Forecast',
                    showInNavigator: false,
                    tooltip: {
                        headerFormat:'<b>NWS Forecast</b>',
                        pointFormatter: function(){
                            if (this.formattedPeakDates !== null){
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
                    color   : 'purple',
                    fillOpacity: null, 
                    lineWidth: 1.5,
                    data    : this.NWSforecast,
                    linkedTo: null,
                    marker: {
                        symbol: '',
                        radius: 3
                    },
                    showInLegend: this.NWSforecast !== undefined
                },
                {
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
                    marker: {
                        symbol: 'line',
                        radius: 0.1
                    },
                    showInLegend: false
                }
            ] 
            } 

            // this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
            //     this.chartConfig.yAxis.plotLines.push(formattedFloodFreqItem)
            this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
                this.chartConfig.series.push(formattedFloodFreqItem)
            });

        }

        //checkbox for turning on and off AEP lines
        public showAEP = true;
        public toggleAEPlines () {
            let chart = $('#chart1').highcharts();
            let AEPseries = chart.series[9]
            if (this.showAEP) {
                AEPseries.show();
            } else {
                AEPseries.hide();
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
            if (this.peaksOnYear) {
                //var finalIndex = this.formattedDailyFlow.length-1;
                //var finalYear = (this.formattedDailyFlow[finalIndex].x).getUTCFullYear();
                chart.series[0].update({ data: this.formattedPeakDatesOnYear });
                chart.series[1].update({ data: this.formattedEstPeakDatesOnYear});
                chart.rangeSelector.update({ selected: 3 });
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
                chart.rangeSelector.update({ selected: 5 });
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
        };
        
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
