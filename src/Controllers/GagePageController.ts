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
        public formattedFloodFreq = undefined;
        public formattedDailyHeat = [];
        public formattedPeakDates = [];
        public formattedEstPeakDates = [];
        public formattedDailyFlow = [];
        public dailyRange = [];

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        chartConfig: {  chart: { height: number, width: number, zooming: {type: string} },
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        xAxis: {  type: string, title: {text: string}},
                        yAxis: { title: {text: string}, plotLines: [{value: number, color: string, width: number, zIndex: number, label: {text: string}}]},
                        series: { name: string; tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                        data: number[], marker: {symbol: string, radius: number}, showInLegend: boolean; }[]; };
        heatChartConfig: { 
                        chart: { height: number, width: number, zooming: {type: string} },
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        xAxis: { type: string, min: number, tickPositions: any[], threshold: number, title: {text: string}, labels: {formatter: Function}},
                        yAxis: { title: {text: string}, custom: { allowNegativeLog: boolean}},
                        colorAxis: { type: string, min: number, max: number, stops: any[], startOnTick: boolean, endOnTick: boolean, allowNegativeLog: boolean}
                        series: { name: string, type: string, data: number[], tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number}[]; };
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
            // console.log('GetPeakURL', url)
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
                            peak_va: parseInt(dataRow[4])
                        };
                        peakValues.push(peakObj)
                        //making a new array of invalid dates (dates with month or day of '00') that will be 'estimated' (changed to '01')
                        const estPeakObj = {
                            agency_cd: dataRow[0], 
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].replaceAll('-00','-01'),
                            peak_va: parseInt(dataRow[4])
                        };
                        if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                            estPeakValues.push(estPeakObj) //pushing invalid dates to a new array
                        };
                    } while (data.length > 0);
                    const filteredArray = peakValues.filter(item => {
                        return (item.peak_dt[8] + item.peak_dt[9] !== '00' || item.peak_dt[8] + item.peak_dt[9] !== '00') //filtering out invalid dates from main array
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
            // console.log('GetFloodFreqURL', url)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const data = response.data
                    // create a lookup array for desired AEP IDs
                    const lookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438, 818];
                    let chartData = [];
                    do {
                        var IDs = data.statistics
                        for (let item of IDs) {
                            if(lookup.indexOf(item.regressionTypeID) >=0 && item.isPreferred == true){
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
                    this.dailyFlow = dailyValues
                    this.formatData();
                }); 
            }

        //Get data into (x, y) format and convert to dates in order to add it to the plot
        public formatData(): void {
            if (this.peakDates) {
                this.peakDates.forEach(peakObj => {
                    this.formattedPeakDates.push({x: new Date(peakObj.peak_dt), y: peakObj.peak_va})
                });
            } 
            if (this.estPeakDates) {
                this.estPeakDates.forEach(estPeakObj => {
                    this.formattedEstPeakDates.push({x: new Date(estPeakObj.peak_dt), y: estPeakObj.peak_va})
                });
            }
            if (this.dailyFlow) {
                this.dailyFlow.forEach(dailyObj => {
                    if (dailyObj.qualifiers[0] === 'A') {
                    this.formattedDailyFlow.push({x: new Date(dailyObj.dateTime), y: parseInt(dailyObj.value)})
                    }
                });
            }
            if (this.dailyFlow) {
                this.dailyFlow.forEach(dailyHeatObj => {
                    //console.log('dailyFlow', this.dailyFlow);
                    let now = new Date(dailyHeatObj.dateTime);
                    let year = new Date(dailyHeatObj.dateTime).getUTCFullYear();
                    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {

                        //console.log(year + ' is a leap year');
                    }
                    else {
                        this.dailyFlow.push({value: null, qualifiers: ['A'], dateTime: new Date( Date.UTC(year, 1, 29))});
                    
                    }
                    //Getting dates in Julian days - pulled from this exchange: https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
                    function daysIntoYear(now){
                        return (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
                    };
                    var doy = daysIntoYear(now);
                    //console.log(doy);
                    //if (doy == 60 )
                    function isLeapYear(year) {
                        if (year % 400 === 0) return true;
                        if (year % 100 === 0) return false;
                        return year % 4 === 0;
                    };
                    if (isLeapYear(year) == false && doy > 59) {
                        doy += 1; //add a day onto non-leap years so that dates after Feb 28 will line up with leap years
                    };
                    if (doy < 275) {
                        doy += 366; //making 275 (Oct 1) the lowest number so the x-axis can start at the beginning of the water year
                    };
                    if (dailyHeatObj.qualifiers[0] === 'A') {
                        this.formattedDailyHeat.push({x: doy, y: new Date(dailyHeatObj.dateTime).getUTCFullYear(), value: parseInt(dailyHeatObj.value)});
                    };
                    if (isLeapYear(year) == false) {
                        this.formattedDailyHeat.push({x: 60, y: year, value: null}); //adding a blank cell on Feb 29 on non-leap years so that data will line up
                    } ;                   
                    // if (dailyHeatObj.qualifiers[0] === 'A') {
                    // this.dailyRange.push(dailyHeatObj.value);
                    // }
                });
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
                this.floodFreq.forEach((floodFreqItem) => {
                    let colorIndex = floodFreqItem.regressionTypeID;
                    let formattedName = floodFreqItem.regressionType.name.substring(0, floodFreqItem.regressionType.name.length-18);
                    this.formattedFloodFreq.push({
                        value: floodFreqItem.value,
                        color: AEPColors[colorIndex],
                        width: 1.5,
                        zIndex: 4,
                        label: {text: formattedName + '% AEP'}
                        });
                    });
            this.createAnnualFlowPlot();
            this.createDailyRasterPlot();
        }}

        public createAnnualFlowPlot(): void {
            //console.log('peak value plot data', this.formattedPeakDates);
            //console.log('estimated peak plot data', this.formattedEstPeakDates);
            //console.log('daily flow plot data', this.formattedDailyFlow);
            this.chartConfig = {
                chart: {
                    height: 450,
                    width: 800,
                    zooming: {
                        type: 'xy'
                    }
                },
                title: {
                    text: 'Annual Peak Streamflow',
                    align: 'center'
                },
                subtitle: {
                    text: 'Click and drag in the plot area to zoom in<br>AEP = Annual Exceedance Probability',
                    align: 'center'
                },
                xAxis: {
                    type: 'datetime',
                    title: {
                        text: 'Date'
                    },
                },
                yAxis: {
                    title: {
                        text: 'Discharge (Q), in ft³/s'
                    },
                    plotLines: [{value: null, color: null, width: null, zIndex: null, label: {text: null}}]
                },
                series  : [
                {
                    name    : 'Daily Streamflow',
                    tooltip: {
                        headerFormat:'<b>Daily Streamflow</b>',
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
                    color   : '#add8f2',
                    data    : this.formattedDailyFlow,
                    marker: {
                        symbol: '',
                        radius: 3
                    },
                    showInLegend: this.formattedDailyFlow.length > 0
                },
                {
                    name    : 'Annual Peak Streamflow',
                    tooltip: {
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
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',
                    color   : 'black',
                    data    : this.formattedPeakDates,
                    marker: {
                        symbol: 'circle',
                        radius: 3
                    },
                    showInLegend: this.formattedPeakDates.length > 0
                },
                {
                    name    : 'Annual Peak Streamflow (Date Estimated)',
                    tooltip: {
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
                                return '<br>Date (estimated): <b>'  + formattedUTCPeakDate + '</b><br>Value: <b>' + this.y + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    },
                    turboThreshold: 0, 
                    type    : 'scatter',
                    color   : 'red',
                    data    : this.formattedEstPeakDates,
                    marker: {
                        symbol: 'square',
                        radius: 3
                    },
                    showInLegend: this.formattedEstPeakDates.length > 0
                }] 
            } 
            this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
                this.chartConfig.yAxis.plotLines.push(formattedFloodFreqItem)
            });
        }

        public createDailyRasterPlot(): void {
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
                    tickPositions: [275, 306, 336, 368, 398, 426, 457, 487, 519, 548, 579, 610],
                    title: {
                        text: 'Day of the Year'
                    },
                    threshold: 273,
                    labels: {
                        formatter: function() {
                            if (this.value > 366) {
                                this.value -= 365
                            }
                            if(this.value == 370) return 'Annual';
                            return moment("2015 "+this.value, "YYYY DDD").format("MMM");
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Year'
                    },
                    custom: {
                        allowNegativeLog: true
                    }
                },
                colorAxis: {
                    type: 'logarithmic',
                    min: null, 
                    max: null,
                    stops: [
                        [0 ,   '#FF0000'],
                        [0.3, '#FFCC33'],
                        [0.8, '#66CCFF'],
                        [1 ,   '#3300CC']
                    ],
                    startOnTick: false,
                    endOnTick: false,
                    allowNegativeLog: true
                },
                series: [{
                    name: 'Daily Streamflow',
                    type: 'heatmap',
                    data: this.formattedDailyHeat,
                    tooltip: {
                        headerFormat:'<b>Daily Streamflow</b>',
                        pointFormatter: function(){
                            if (this.formattedDailyHeat !== null){
                                //let UTCday = this.x.getUTCDate();
                                let year = this.y;
                                let doy = this.x;
                                if (doy > 275) {
                                    doy -= 366 //returning doy to 1-366 for labeling purposes
                                };
                                if (isLeapYear(year) == false && doy > 59) {
                                    doy -= 1 //subtracting a day off of non-leap years after Feb 28 so that the labels are accurate
                                };
                                let fullDate = new Date(year, 0, doy)
                                let UTCday = fullDate.getUTCDate();
                                let month = fullDate.getUTCMonth();
                                    month += 1; // adding a month to the UTC months (which are zero-indexed)
                                let formattedUTCDate = month + '/' + UTCday + '/' + year;
                                let waterYear = this.y;
                                if (month > 9) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
                                    waterYear += 1; // adding a year to dates that fall into the next water year
                                };
                                //return new Date(year, 0, doy); 
                                return '<br>Date: <b>'  + formattedUTCDate + '</b><br>Value: <b>' + this.value + ' ft³/s</b><br>Water Year: <b>' + waterYear
                            }
                        }
                    },
                    turboThreshold: 0
                }]
            }
        };

//don't think a log - linear checkbox will work on the heatmap but leaving this code here for now as reference
        //checkbox for change log to linear scale
        // public logScale = true; 
        // public logToLinear () {
        //     let chart = $('#chart2').highcharts();
        //     // if (this.dailyRange.length > 0) {
        //     //     let dailyMax  = this.dailyRange.reduce(function (accumulatedValue, currentValue) {
        //     //         return Math.max(accumulatedValue, currentValue);
        //     //     }); console.log('Daily Max', dailyMax);
        //     //     let dailyMin  = this.dailyRange.reduce(function (accumulatedValue, currentValue) {
        //     //         return Math.min(accumulatedValue, currentValue);
        //     //     }); console.log('Daily Min', dailyMin);
        //     //     // sort array ascending
        //     //     const asc = this.dailyRange.sort((a, b) => a - b);
        //     //     console.log('sorted range', asc)
        //     //     //caluculate percentile values
        //     //     var tenthPercentile = asc[Math.floor(asc.length * 0.1)];
        //     //     var twentiethPercentile = asc[Math.floor(asc.length * 0.2)];
        //     //     var thirtiethPercentile = asc[Math.floor(asc.length * 0.3)];
        //     //     var fortiethPercentile = asc[Math.floor(asc.length * 0.4)];
        //     //     var fiftiethPercentile = asc[Math.floor(asc.length * 0.5)];
        //     //     var sixtiethPercentile = asc[Math.floor(asc.length * 0.6)];
        //     //     var seventiethPercentile = asc[Math.floor(asc.length * 0.7)];
        //     //     var eightiethPercentile = asc[Math.floor(asc.length * 0.8)];
        //     //     var ninetiethPercentile = asc[Math.floor(asc.length * 0.9)];
        //     //     console.log('percentiles', tenthPercentile, twentiethPercentile, thirtiethPercentile, fortiethPercentile, fiftiethPercentile, sixtiethPercentile, seventiethPercentile, eightiethPercentile, ninetiethPercentile);
        //     //     //convert percentile values to percentages for color stops
        //     //     var firstStop = (tenthPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var secondStop = (twentiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var thirdStop = (thirtiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var fourthStop = (fortiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var fifthStop = (fiftiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var sixthStop = (sixtiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var seventhStop = (seventiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var eigthStop = (eightiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     var ninthStop = (ninetiethPercentile - (dailyMin)) / (dailyMax - (dailyMin));
        //     //     console.log('color stops', firstStop, secondStop, thirdStop, fourthStop, fifthStop, sixthStop, seventhStop, eigthStop, ninthStop);
        //     //     };
        //     if (this.logScale) {
        //         chart.colorAxis[0].update({ type: 'logarithmic' });
        //         console.log('log');
        //     } else {
        //         chart.colorAxis[0].update({ type: 'linear' });
        //         console.log('linear');
        //     }
        // };


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