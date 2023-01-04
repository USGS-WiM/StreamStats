//Maggie Jaenicke
//10-6-2022
//Configures a plot of annual peak streamflow and f, retrieved from the NWIS
//and the x-percent AEP flood statistics as horizontal lines retrieved from our own GageStatsServices API.

module StreamStats.Controllers {
    'use strict';

    interface IGagePlotControllerScope extends ng.IScope {
        vm: IGagePlotController;
    }

    interface IModal {
        Close():void
    }

    interface IGagePlotController extends IModal {
    }

    class GageInfo {     
        peakValues: any;
        date: any;
        code: string;
        name: string;
            constructor(sid: string) {
            this.code = sid;
            }
    }

    class peakValue {
        agency_cd: String;
        site_no: String;
        peak_dt: Date;
        peak_tm?: Number;
        peak_va: Number;
        peak_cd?: String;
        gage_ht: Number;
    }

    class GagePlotController extends WiM.Services.HTTPServiceBase implements IGagePlotController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public peakValueData: Array<any>;
        public peakValuePlot: any;
        public annualFlowPlot: any;
        public print: any;
        public sce: any;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        private modalService: Services.IModalService;
        public AppVersion: string;
        //won't need next line eventually, but rn it affects functionality
        public gage: GageInfo;
        //public peakValues: any;
        public floodFreq = undefined;
        public peakDates = undefined;
        public estPeakDates = undefined;
        public dailyFlow = undefined;
        public formattedFloodFreq = undefined;
        public formattedPeakDates = undefined;
        public formattedEstPeakDates = undefined;
        public formattedDailyFlow = undefined;
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

        // //Constructor
        // //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$http', 'StreamStats.Services.ModalService', '$modalInstance'];
        chartConfig: {  chart: {height: number, width: number, zooming: {type: string}},
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        xAxis: {  type: string, title: {text: string}},
                        yAxis: { title: {text: string}, plotLines: [{value: number, color: string, width: number, zIndex: number, label: {text: string}}]},
                        series: { name: string; tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, 
                        data: number[], marker: {symbol: string, radius: number}; }[]; };
        constructor($scope: IGagePlotControllerScope, $http: ng.IHttpService, modalService: Services.IModalService, modal:ng.ui.bootstrap.IModalServiceInstance) {
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
                window.print();
            };
        }  

        // //Methods  
        // //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public getGagePlot() {

            //instantiate gage
            this.gage = new GageInfo(this.modalService.modalOptions.siteid);

            //below: how to get the data from API and setting it in controller
            const url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    this.gage = response.data;
                    this.getPeakInfo();
                    this.getFloodFreq();
                    this.getDailyFlow();
                }, (error) => {
                    //sm when error
                }).finally(() => {
                });
        }

        public setPreferred(pref: boolean) {
            this.showPreferred = pref;
        }

        //Get peak values from NWIS
        //These values will be used to make the scatterplot points
        public getPeakInfo() {
            const url = 'https://nwis.waterdata.usgs.gov/usa/nwis/peak/?format=rdb&site_no=' + this.gage.code
            console.log('GetPeakURL', url)
            const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');
            this.Execute(request).then(
                (response: any) => {
                    const peakValues = [];
                    const estPeakValues = []; // going to put dates here that have 00, make them 01, and change the symbology
                    const data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                    const headers:Array<string> = data.shift().split('\t');
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
                        //making a new array of invalid dates that will be 'estimated'
                        const estPeakObj = {
                            agency_cd: dataRow[0], 
                            site_no: dataRow[1],
                            peak_dt: dataRow[2].substring(0, 9) + '1', 
                            peak_va: parseInt(dataRow[4])
                        };
                        // const estPeakMonth = {
                        //     agency_cd: dataRow[0], 
                        //     site_no: dataRow[1],
                        //     peak_dt: dataRow[2].substring(0, 6) + '1' + dataRow[2].substring(7, 10),
                        //     peak_va: parseInt(dataRow[4])
                        // };
                        if (peakObj.peak_dt[8] + peakObj.peak_dt[9] === '00' || peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                            estPeakValues.push(estPeakObj) // pushing invalid dates to a new array
                        };
                        // if (peakObj.peak_dt[5] + peakObj.peak_dt[6] === '00') {
                        //     estPeakValues.push(estPeakMonth) // pushing invalid dates to a new array
                        // };
                    } while (data.length > 0);
                    const filteredArray = peakValues.filter(item => {
                        return (item.peak_dt[8] + item.peak_dt[9] !== '00' || item.peak_dt[8] + item.peak_dt[9] !== '00') //filtering out invalid dates
                    });
                    this.peakDates = filteredArray;
                    this.estPeakDates = estPeakValues;
                }, (error) => {
                }).finally(() => {
                    this.getFloodFreq()
                });
            }             

        //Pull in data for flood frequency statistics
        //This will be used to plot x-percent AEP flood values that a gage has as horizontal lines
        public getFloodFreq() {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesStations + this.gage.code;
            console.log('GetFloodFreqURL', url)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    const data = response.data
                    // create a lookup array
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
            this.getDailyFlow()
        }); 
    };

    //Pull in data for daily flow values
    //This will be used to plot a daily flow line
    public getDailyFlow() {
        //to do: figure out good start and end dates -- doesn't seem to have the right data format without them at all but I'm sure we'll want earlier data
        var url = 'https://nwis.waterservices.usgs.gov/nwis/dv/?format=json&sites=' + this.gage.code + '&parameterCd=00060&statCd=00003&startDT=1900-01-01';
        console.log('GetDailyFlowURL', url);
        const request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

        this.Execute(request).then(
            (response: any) => {
                var data = response.data.value.timeSeries;
                if (data.length !== 0) {
                    var dailyValues = data[0].values[0].value
                }
                else {
                    dailyValues = 0
                };
                console.log('test', dailyValues)
                this.dailyFlow = dailyValues
                this.formatData();
            }); 
        };

    //Get data into (x, y) format in order to add it to the plot
    public formatData(): void {
        if (this.peakDates) {
            this.formattedPeakDates = [];
            this.peakDates.forEach(test => {
                this.formattedPeakDates.push({x: new Date(test.peak_dt), y: test.peak_va})
            });
        }
        if (this.estPeakDates) {
            this.formattedEstPeakDates = [];
            this.estPeakDates.forEach(test => {
                this.formattedEstPeakDates.push({x: new Date(test.peak_dt), y: test.peak_va})
            });
        }
        if (this.dailyFlow) {
            this.formattedDailyFlow = [];
            this.dailyFlow.forEach(test => {
                if (test.qualifiers[0] === 'A') {
                this.formattedDailyFlow.push({x: new Date(test.dateTime), y: parseInt(test.value)})
                }
            });
        }

        if (this.floodFreq) {
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
    }};

    //Create chart
    public createAnnualFlowPlot(): void {
        console.log('peak value plot data', this.formattedPeakDates);
        console.log('estimated peak plot data', this.formattedEstPeakDates);
        console.log('daily flow plot data', this.formattedDailyFlow);

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
                text: 'Click and drag in the plot area to zoom in',
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
                plotLines: []
                },
            series  : [
            {
                name    : 'Daily Flow',
                tooltip: {
                    headerFormat:'<b>Daily Flow<br>',
                    pointFormatter: function(){
                        if (this.formattedPeakDates !== null){
                            let UTCday = this.x.getUTCDate();
                            let year = this.x.getUTCFullYear();
                            let month = this.x.getUTCMonth();
                                month += 1; // adding a month to the UTC months (which are zero-indexed)
                            let formattedUTCDailyDate = month + '/' + UTCday + '/' + year;
                            return '<b>Date: '  + formattedUTCDailyDate + '<br>Value: ' + this.y + ' ft³/s'
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
                }
            },
            {
                name    : 'Annual Peak Streamflow',
                tooltip: {
                    headerFormat:'<b>Peak Annual Flow<br>',
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
                            return '<b>Date: '  + formattedUTCPeakDate + '<br>Value: ' + this.y + ' ft³/s<br>Water Year: ' + waterYear
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
                }
            },
            // {
            //     name    : 'Annual Peak Streamflow (Date Estimated)',
            //     tooltip: {
            //         headerFormat:'<b>Peak Annual Flow<br>',
            //         pointFormatter: function(){
            //             if (this.formattedPeakDates !== null){
            //                 let waterYear = this.x.getUTCFullYear();
            //                 if (this.x.getUTCMonth() > 8) { // looking for dates that have a month beginning with 1 (this will be Oct, Nov, Dec)
            //                     waterYear += 1; // adding a year to dates that fall into the next water year
            //                 };
            //                 let UTCday = this.x.getUTCDate();
            //                 let year = this.x.getUTCFullYear();
            //                 let month = this.x.getUTCMonth();
            //                     month += 1; // adding a month to the UTC months (which are zero-indexed)
            //                 let formattedUTCPeakDate = month + '/' + UTCday + '/' + year;
            //                 return '<b>Date (estimated): '  + formattedUTCPeakDate + '<br>Value: ' + this.y + ' ft³/s<br>Water Year: ' + waterYear
            //             }
            //         }
            //     },
            //     turboThreshold: 0, 
            //     type    : 'scatter',
            //     color   : 'red',
            //     data    : this.formattedEstPeakDates,
            //     marker: {
            //         symbol: 'square',
            //         radius: 3
            //     }
            // }
            ] 
        } 
        this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
            this.chartConfig.yAxis.plotLines.push(formattedFloodFreqItem)
        });
    }

    //Helper Methods
    //-+-+-+-+-+-+-+-+-+-+-+-
    private init(): void {   
        this.AppVersion = configuration.version;
        this.getGagePlot()
    }
    }
    //end  class

    angular.module('StreamStats.Controllers').controller('StreamStats.Controllers.GagePlotController', GagePlotController);
}