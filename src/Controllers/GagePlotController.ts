//Maggie Jaenicke
//10-6-2022
//Adds a new link to the gage pop-ups that opens a new modal showing a plot of annual peak streamflow, retrieved from the NWIS
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
        public dailyFlow = undefined;
        public formattedFloodFreq = undefined;
        public formattedPeakDates = undefined;
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
        chartConfig: {  chart: {zooming: {type: string}},
                        title: { text: string, align: string},
                        subtitle: { text: string, align: string},  
                        xAxis: {  type: string, title: {text: string}},
                        yAxis: { title: {text: string}},
                        series: { name: string; tooltip: { headerFormat: string, pointFormatter: Function}, turboThreshold: number; type: string, color: string, data: number[]; }[]; };
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
                    const peakValues = []
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
                    } while (data.length > 0);
                    this.peakDates = peakValues;
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
                    console.log('AEP data', data)
                    // create a lookup array
                    const lookup = [9, 852, 8, 4, 7, 3, 6, 1, 501, 5, 2, 500, 851, 1438];
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
                var data = response.data.value.timeSeries[0].values[0].value;
                this.dailyFlow = data
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
        if (this.dailyFlow) {
            this.formattedDailyFlow = [];
            this.dailyFlow.forEach(test => {
                this.formattedDailyFlow.push({x: new Date(test.dateTime), y: parseInt(test.value)})
            });
        }
        if (this.floodFreq) {
                var finalYearIndex = this.formattedPeakDates.length-1;
                var endWY = this.formattedPeakDates[finalYearIndex].x;
                var startWY = this.formattedPeakDates[0].x
                this.formattedFloodFreq = [];
                this.floodFreq.forEach((floodFreqItem) => {
                    this.formattedFloodFreq.push({
                        name: floodFreqItem.regressionType.name,
                        tooltip: {
                            headerFormat:'<b>Annual Exceedance Percentage (AEP)<br>',
                            pointFormatter: function(){
                                if (this.formattedPeakDates !== null){
                                    return '<b>'  + floodFreqItem.regressionType.name + '<br>Value: ' + floodFreqItem.value + ' ft³/s<br>'
                                }
                            }
                        },
                        turboThreshold: 0, 
                        type: 'line',
                        color: '',
                        data:
                        [
                            {
                                x: startWY,
                                y: floodFreqItem.value
                            },{
                                x: endWY,
                                y: floodFreqItem.value
                            }
                        ]
                        })
                });
        this.createAnnualFlowPlot();
    }}



    //Create chart
    public createAnnualFlowPlot(): void {
        console.log('peak value plot data', this.formattedPeakDates);
        console.log('flood freq plot data', this.formattedFloodFreq);
        console.log('daily flow plot data', this.formattedDailyFlow);

        this.chartConfig = {
            chart: {
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
                }
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
                data    : this.formattedDailyFlow
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
                data    : this.formattedPeakDates
            }
            ] 
        } 

        console.log(this.chartConfig)

        this.formattedFloodFreq.forEach((formattedFloodFreqItem) => {
            this.chartConfig.series.push(formattedFloodFreqItem)
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