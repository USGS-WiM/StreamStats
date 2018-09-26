//------------------------------------------------------------------------------
//----- Storm runnoff controller------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping,
//              Tara A. Gross USGS Colorado Water Science Center
// 
//   purpose:  
//          
//discussion:


//Comments
//02.17.2016 jkn - Created

//Import
declare var d3: any;
module StreamStats.Controllers {
    'use strict';
    interface IStormRunoffControllerScope extends ng.IScope {
        vm: IStormRunoffController;
    }

    interface IModal {
        Close():void
    }

    interface IReportable {
        Graph: any;
        Table: any;
        PeakQ: any;
        Infiltration: any;
        ExcessPrecip: any;
    }

    interface IStormRunoffReportable {
        TR55: IReportable;
        RationalMethod: IReportable;
    }

    class StormRunoffReportable implements IStormRunoffReportable {
        public TR55: IReportable;
        public RationalMethod: IReportable;
        public constructor() {
            this.TR55 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            this.RationalMethod = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
        }
    }

    interface IStormRunoffController extends IModal {
    }

    class StormRunoffController extends WiM.Services.HTTPServiceBase implements IStormRunoffController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public print: any;
        public StudyArea: StreamStats.Models.IStudyArea;
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;
        public showResults: boolean;
        public hideAlerts: boolean;
        private parameterloadedEventHandler: WiM.Event.EventHandler<Services.StudyAreaEventArgs>;
        private regionParameters: Array<Services.IParameter> = [];

        private studyAreaService: Services.IStudyAreaService;
        private nssService: Services.InssService;

        public PrecipOptions: Array<Services.IParameter> = [];

        private _selectedPrecip: Services.IParameter;

        public get SelectedPrecip(): Services.IParameter {
            return this._selectedPrecip;
        }

        public set SelectedPrecip(val: Services.IParameter) {
            this._selectedPrecip = val;
            this.PIntensity = null;
            //console.log(this._selectedPrecip.code);
        }

        public SelectedParameterList: Array<Services.IParameter> = [];

        public PIntensity?: number;
   
        public DrnAreaAcres: number;

        public CanContinue: boolean;
        private parametersLoaded: boolean;
        public showPrint: boolean;
        public ReportOptions: any;
        public result: any;
        public excludearea: any;

        private _selectedTab: StormRunoffType;
        public get SelectedTab(): StormRunoffType {
            return this._selectedTab;
        }
        public set SelectedTab(val: StormRunoffType) {
            if (this._selectedTab != val) {
                this._selectedTab = val;
                this.selectRunoffType();
            }//end if           
        }

        public get SelectedParametersAreValid(): boolean {
            for (var i = 0; i < this.SelectedParameterList.length; i++) {
                var item = this.SelectedParameterList[i];
                if (isNaN(item.value)) {
                    return false;
                }
            }
            return true;
        }

        public DASizeAlert: String;
        public BrowserIE: boolean;
        public BrowserChrome: boolean;
        public ReportData: IStormRunoffReportable;
        public GraphLabels = [];
        public GraphXValues = [];
        public padY = 0;
        public padY2 = 0;
        public domainY = [];
        public domainY2 = [];
        public angulartics: any;
        public duration: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$analytics', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
        constructor($scope: IStormRunoffControllerScope, $analytics, $http: ng.IHttpService, studyAreaService: StreamStats.Services.IStudyAreaService, StatisticsGroup: Services.InssService, region: StreamStats.Services.IRegionService, modal: ng.ui.bootstrap.IModalServiceInstance, public $timeout: ng.ITimeoutService, private EventManager: WiM.Event.IEventManager) {
            super($http, configuration.baseurls.StormRunoffServices);
            $scope.vm = this;
            this.angulartics = $analytics;
            this.modalInstance = modal;
            this.StudyArea = studyAreaService.selectedStudyArea;
            this.nssService = StatisticsGroup;
            this.studyAreaService = studyAreaService;
            this.regionParameters = region.parameterList;
            this.BrowserIE = this.detectIE();

            this.parameterloadedEventHandler = new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                if (e.parameterLoaded) this.loadParameters()
            })
        
            this.init();  

            this.print = function () {
                window.print();
            };
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public GetStormRunoffResults() {
            try {
                this.CanContinue = false;
                var equation = "";

                var headers = {
                    "Content-Type": "application/json"
                };

                if (this.SelectedTab == 1) {
                    let equation = StormRunoffType.TR55;
                    var url = configuration.queryparams['StormRunoffTR55'].format(this.SelectedParameterList[0].value, this.SelectedPrecip.value, this.SelectedParameterList[1].value, this.SelectedPrecip.code);
                }
                else if (this.SelectedTab == 2) {
                    let equation = StormRunoffType.RationalMethod;
                    var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.DrnAreaAcres, this.PIntensity, this.SelectedParameterList[1].value, this.SelectedPrecip.code);
                }

                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

                this.Execute(request).then(
                    (response: any) => {
                        this.showResults = true;
                        //sm when complete
                        this.result = response.data;
                        if (this.SelectedTab == 1) {
                            this.ReportData.TR55.Graph = this.loadGraphData();
                            this.ReportData.TR55.Table = this.GetTableData();
                            this.setGraphOptions();
                        }
                        else if (this.SelectedTab == 2) {
                            this.setPeakQ(this.result.q);
                        }
                    }, (error) => {
                        var x = error;
                        //sm when error                    
                    }).finally(() => {
                        this.CanContinue = true;
                        this.hideAlerts = true;
                    });
            }
            catch (e) {
                console.log("oops GetStormRunoffResults failed to load ", e)
            }
        }

        public validateForm(mainForm) {
            if (mainForm.$valid) {
                this.CheckDASize();
                return true;
            }
            else {
                this.CheckDASize();
                this.showResults = false;
                this.hideAlerts = false;
                return false;
            }
        }

        public ClearResults()
        {
            for (var i in this.studyAreaService.studyAreaParameterList) {
                this.studyAreaService.studyAreaParameterList[i].value = null;
                //this.SelectedParameterList[i].value = null;
            }

            this.SelectedPrecip = this.PrecipOptions[0];
            this.SelectedPrecip.value = null;
            this.DrnAreaAcres = null;
            this.PIntensity = null;
            this.showResults = false;
        }

        public CalculateParameters()
        {
            try {
                this.CanContinue = false;
                this.EventManager.SubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                
                var url: string = configuration.baseurls['ScienceBase'] + configuration.queryparams['SSURGOexCOMS'] + configuration.queryparams['SSURGOexCO'].format(this.studyAreaService.selectedStudyArea.FeatureCollection.bbox);
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
                
                this.Execute(request).then(
                    (response: any) => {
                        this.showResults = true;
                        //sm when complete
                        this.excludearea = response.data;
                        if (this.excludearea.count > 0) {
                            alert("The selected basin may have inadequate SSURGO data to properly compute the runoff curve number.");
                        }
                    }, (error) => {
                        var x = error;
                        //sm when error                    
                    }).finally(() => {
                        this.CanContinue = true;
                        this.hideAlerts = true;
                    }
                );

                //add to studyareaservice if not already there
                for (var i = 0; i < this.SelectedParameterList.length; i++) {
                    let param = this.SelectedParameterList[i];
                    if (this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, param) == -1){
                        this.studyAreaService.studyAreaParameterList.push(param);
                    }//end if
                }//next i

                if (this.SelectedPrecip != null && this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, this.SelectedPrecip) == -1)
                    this.studyAreaService.studyAreaParameterList.push(this.SelectedPrecip);

                this.studyAreaService.loadParameters();                 
            } catch (e) {
                console.log("oops CalculateParams failed to load ",e)
            }
        }

        public CheckDASize()
        {
            switch (this._selectedTab) {
                case StormRunoffType.TR55:
                    if (this.SelectedParameterList[0].value > 25) {
                        this.DASizeAlert = "Value is greater than recommended maximum threshold of 25 square miles"
                    } else {
                        this.DASizeAlert = null;
                    }
                    return;
                default: //case StormRunoffType.RationalMethod
                    if (this.DrnAreaAcres > 200) {
                        this.DASizeAlert = "Value is greater than recommended maximum threshold of 200 acres"
                    } else {
                        this.DASizeAlert = null;
                    }
                    return;
            }
        }

        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }

        public Reset(): void {
            this.init();
        }

        private downloadCSV() {
            //ga event
            this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });

            var filename = 'data.csv';

            var processTR55Table = (data) => {
                var finalVal = 'Peak Runoff from ' + this.SelectedPrecip.name + ' (TR55)\n';
                finalVal += this.tableToCSV($('#TR55ParameterTable'));
                finalVal += '\n' + this.tableToCSV($('#TR55SummaryTable'));
                finalVal += '\n\n' + this.tableToCSV($('#TR55TabularHydrograph'));
                var def = "";
                if(this.SelectedParameterList) {
                    var keylist = [];
                    keylist = Object.keys(this.ReportData.TR55.Table.values[0]);
                    for (var k in keylist) {
                        if (parseInt(k) < 14) {
                            if (keylist[k] != "time") {
                                if (keylist[k] == "span") {
                                    def += '#,Time,Time (HH:MM)\n';
                                } else
                                    def += '#,' + this.getHeading(keylist[k]) + ',' + this.getTitle(keylist[k]) + '\n';
                            }
                        }

                    } 
                }
                return def + '\n' + finalVal + '\r\n';
            };

            var processRMTable = (data) => {
                var finalVal = 'Peak Runoff from ' + this.SelectedPrecip.name + ' (Rational Method)\n';
                finalVal += this.tableToCSV($('#RMParameterTable'));
                finalVal += '\n' + this.tableToCSV($('#RMSummaryTable'));
                
                var def = "";
                if (this.SelectedParameterList) {
                    var keylist = [];
                    keylist = Object.keys(this.ReportData.TR55.Table.values[0]);
                    for (var k in keylist) {
                        if (parseInt(k) < 14) {
                            if (keylist[k] != "time") {
                                if (keylist[k] == "span") {
                                    def += '#,Time,Time (HH:MM)\n';
                                } else
                                    def += '#,' + this.getHeading(keylist[k]) + ',' + this.getTitle(keylist[k]) + '\n';
                            }
                        }

                    }
                }
                return def + '\n' + finalVal + '\r\n';
            };

            //main file header with site information
            var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';

            //first write main parameter table
            if (this.SelectedTab == 1) {
                csvFile += processTR55Table(this.studyAreaService.studyAreaParameterList);
            } else if (this.SelectedTab == 2) {
                csvFile += processRMTable(this.studyAreaService.studyAreaParameterList);
            }

            //download
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

        private generateColorShade(minhue: number, maxhue: number): string {
            try {
                var h = this.rand(minhue, minhue);
                var s = this.rand(30, 100);
                var l = this.rand(30, 70);

                return 'hsla(' + h + ',' + s + '%,' + l + '%,1)';

            } catch (e) {
                return null
            }
        }

        public update(precipoption: any): void {
            console.log(precipoption);
        }

        private loadGraphData(): any {
            try {
                var results = []; 
                var hydrograph = [];
                var hyetograph = [];
                this.GraphXValues.length = 0;
                var firsttime;
                var count = 0;

                for (var k in this.result) {
                    var dur = this.result[k].duration;
                    var t;
                    var kf = parseFloat(k);
                    this.duration = dur;
                    t = this.computeTime(kf, dur);
                    hydrograph.push({ x: t, y: this.result[k].q });
                    hyetograph.push({ x: t, y: this.result[k].p });
                }

                hydrograph.sort((a, b) => a.x - b.x);
                hyetograph.sort((a, b) => a.x - b.x);
                firsttime = hydrograph[0].x;

                for (var time in hydrograph) {
                    hydrograph[time].label = this.getTimeSpan(firsttime, hydrograph[time].x);
                    hyetograph[time].label = this.getTimeSpan(firsttime, hyetograph[time].x);
                }

                for (var d in hydrograph) {
                    hydrograph[d].hours = this.computeHours(firsttime, hydrograph[d].x);
                    hyetograph[d].hours = this.computeHours(firsttime, hydrograph[d].x);
                }

                this.loadGraphLabels(hydrograph);
                this.loadGraphXValues(hydrograph);
                this.loadPadY(hydrograph);
                this.loadDomainY(hydrograph);
                this.loadPadY2(hyetograph);
                this.loadDomainY2(hyetograph);
                results.push({ values: hydrograph, key: "Discharge (ft³/s)", color: " #009900", type: "line", yAxis: 1 });
                results.push({ values: hyetograph, key: "Cum. precipitation (in)", color: "#0033ff", type: "line", yAxis: 2 });
                
                return results;
            } catch(e) {
                var x = e;
            }
        }

        private GetTableData(): any {
            this.ReportData.TR55.PeakQ = 0;
            this.ReportData.TR55.Infiltration = 0;
            this.ReportData.TR55.ExcessPrecip = 0;
            var tableFields: any = [];
            var tableValues: any = [];

            try {
                for (var k in this.result) {
                    var dur = this.result[k].duration;
                    var time;
                    var kf = parseFloat(k);
                    var firsttime;

                    time = this.computeTime(kf, dur);
                    this.result[k].time = time;
                    tableValues.push(this.result[k]);

                    if (tableFields.length == 0) {
                        for (var i in this.result[k]) {
                            tableFields.push(i);
                        }
                    }

                    this.setPeakQ(this.result[k].q);
                    this.setInfiltration(this.result[k].pl);
                    this.setExcessPrecip(this.result[k].dPe);
                }

                tableValues.sort((a, b) => a.time - b.time);
                firsttime = tableValues[0].time;

                for (var t in tableValues) {
                    tableValues[t].span = this.getTimeSpan(firsttime, tableValues[t].time);
                }
                return { "values": tableValues, "Fields": tableFields}
            } catch (e) {
                var x = e;
            }
        }

        private setPeakQ(peak): void {
            try {
                if (this.SelectedTab == 1) {
                    var Q = peak;
                    if (this.ReportData.TR55.PeakQ < Q) {
                        this.ReportData.TR55.PeakQ = Q;
                    }
                } else {
                    this.ReportData.RationalMethod.PeakQ = peak;
                }
            } catch (e) {
                var x = e;
            } 
        }

        private setInfiltration(pl): void {
            try {
                var ploss = pl;
                this.ReportData.TR55.Infiltration = this.ReportData.TR55.Infiltration + pl;
            } catch (e) {
                var x = e;
            } 
        }

        private setExcessPrecip(dpe): void {
            try {
                var exPrecip = dpe;
                this.ReportData.TR55.ExcessPrecip = this.ReportData.TR55.ExcessPrecip + dpe;
            } catch (e) {
                var x = e;
            }
        }

        public getPrecipTitle(): any {
            if (this.SelectedTab == 2) {
                return "Precipitation intensity is computed by dividing the " + this.SelectedPrecip.name + " by " + this.SelectedPrecip.name.substr(0, 2);
            } else {
                return;
            }
        }

        public getTitle(shortname): any {
            try {
                switch (shortname) {
                    case 'q':
                        return 'Discharge (cubic feet per second)';
                    case 'drnarea':
                        return 'Drainage area (square miles)';
                    case 'p':
                        return 'Cumulative precipitation (inches)';
                    case 'rcn':
                        return 'Runoff curve number (unitless)';
                    case 'duration':
                        return 'Duration of storm (hours)';
                    case 'ia':
                        return 'Initial abstraction (inches)';
                    case 's':
                        return 'Total maximum retention (inches)';
                    case 'dP':
                        return 'Incremental precipitation (inches)';
                    case 'pIa':
                        return 'Cumulative precipitation minus initial abstraction (inches)';
                    case 'pl':
                        return 'Precipitation loss (inches)';
                    case 'pe':
                        return 'Cumulative precipitation excess (inches)';
                    case 'dPe':
                        return 'Incremental precipitation excess (inches)';
                }//end switch
            } catch (e) {
                var x = e;
            }
        }

        public getHeading(shortname): any {
            try {
                switch (shortname) {
                    case 'q':
                        return 'Q';
                    case 'drnarea':
                        return 'DRNAREA';
                    case 'p':
                        return 'P';
                    case 'rcn':
                        return 'RCN';
                    case 'duration':
                        return 'Duration';
                    case 'ia':
                        return 'Ia';
                    case 's':
                        return 'S';
                    case 'dP':
                        return 'dP';
                    case 'pIa':
                        return 'P-Ia';
                    case 'pl':
                        return 'Pl';
                    case 'pe':
                        return 'Pe';
                    case 'dPe':
                        return 'dPe';
                }//end switch
            } catch (e) {
                var x = e;
            }
        }

        private setGraphOptions(): void {
            this.ReportOptions = {
                chart: {
                    type: 'multiChart',
                    height: 275,
                    width: 650,
                    margin: {
                        top: 10,
                        right: 80,
                        bottom: 80,
                        left: 90
                    },
                    x: function (d) {
                        return d.hours;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    legend: {
                        align: false,
                        padding: 50,
                        width: 500
                    },
                    dispatch: {
                        stateChange: function (e) { console.log("stateChange"); },
                        changeState: function (e) { console.log("changeState"); },
                        tooltipShow: function (e) { console.log("tooltipShow"); },
                        tooltipHide: function (e) { console.log("tooltipHide"); }
                    },
                    useInteractiveGuideline: true,
                    interactiveLayer: {
                        tooltip: {
                            contentGenerator: function (d) {
                                var minutes = d.value * 60 % 60;
                                var hours = (<any>(Math)).trunc(d.value);
                                var h;
                                var m;

                                if (hours < 10) {
                                    h = "0" + hours;
                                } else {
                                    h = hours;
                                }

                                if (minutes < 10) {
                                    m = "0" + minutes;
                                } else {
                                    m = minutes;
                                }

                                var time = h + ":" + m;
                                var rows = "";

                                for (var i in d.series) {
                                    var x = parseFloat(d.series[i].value);
                                    var ydatatype;
                                    var precision;
                                    if ((x > 1000000) && (x < 10000000)) precision = 10000;
                                    if ((x > 100000) && (x < 1000000)) precision = 1000;
                                    if ((x > 10000) && (x < 100000)) precision = 100;
                                    if ((x > 1000) && (x < 10000)) precision = 10;
                                    if ((x > 100) && (x < 1000)) precision = 1;

                                    ydatatype = parseInt(((x + (precision * .5)) / precision).toString()) * precision;

                                    if (x < 100) ydatatype = Number(x.toPrecision(3));

                                    rows += "<tr>" +
                                        "<td class='legend-color-guide' style='width: 1em;'><div style='background-color: " + d.series[i].color + ";'></div></td>" +
                                        "<td class='key'>" + d.series[i].key + ":</td>" +
                                        "<td><strong>" + ydatatype + "</strong></td>" +
                                        "</tr>";
                                }

                                var header = "<thead>" +
                                        "<tr>" +
                                    "<td colspan='3'><b>" + time + "</b> (HH:mm)</td>" +
                                        "</tr>" +
                                        "</thead>";
                                
                                return "<table>" + header + "<tbody>" + rows + "</tbody></table>";
                            }
                        }
                    },
                    xAxis: {
                        showMaxMin: false,
                        tickValues: this.GraphXValues,
                        axisLabel: 'Time (HH:mm)',
                        tickFormat: function (d) {
                            var hours = (<any>(Math)).trunc(d);
                            var minutes = d * 60 % 60;
                            var h;
                            var m;
                            //var count;

                            //if (this.duration == 24) {
                            //    count++;
                            //    if (count % 3 != 0) {
                            //        if (hours < 10) {
                            //            h = "0" + hours;
                            //        } else {
                            //            h = hours;
                            //        }
                            //        if (minutes < 10) {
                            //            m = "0" + minutes;
                            //        } else {
                            //            m = minutes;
                            //        }
                            //        return h + ":" + m
                            //    } else {
                            //        return "";
                            //    }
                            //} else {
                                if (hours < 10) {
                                    h = "0" + hours;
                                } else {
                                    h = hours;
                                }
                                if (minutes < 10) {
                                    m = "0" + minutes;
                                } else {
                                    m = minutes;
                                }
                                return h + ":" + m
                            //}
                        },
                        rotateLabels: '45'
                    },
                    yAxis1: {
                        axisLabel: 'Discharge (Q), in ft³/s',
                        axisLabelDistance: this.padY,
                        tickFormat: function (d) {
                            return d3.format(',.0f')(d); //,.3f
                        },
                        showMaxMin: false
                    },
                    yAxis2: {
                        axisLabel: 'Cum. precipitation (P), in inches',
                        axisLabelDistance: this.padY2,
                        tickFormat: function (d) {
                            return d3.format(',.0f')(d);
                        },
                        showMaxMin: false
                    },
                    yDomain1: this.domainY,
                    yDomain2: this.domainY2
                },
                title: {
                    enable: true,
                    text: 'Runoff hydrograph from ' + this.SelectedPrecip.name,
                    css: {
                        'font-size': '10pt',
                        'font-weight': 'bold'
                    }
                }
            };
        }
        
        public BrowserAlert(): void {
            if (this.BrowserIE) {
                alert("The Storm Runoff Modeling tool is best viewed with the following browsers\n\n\tChrome\n\tFirefox\n\tEdge");
            }
        }

        private detectIE(): boolean {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            var version;

            if (msie > 0) {
                // IE 10 or older => return version number
                version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                return true;
            }

            var trident = ua.indexOf('Trident/');

            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                return true;
            }

            //var edge = ua.indexOf('Edge/');
            //if (edge > 0) {
            //    // Edge (IE 12+) => return version number
            //    version = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            //}

            if (navigator.userAgent.indexOf("Chrome") != -1) {
                this.BrowserChrome = true;
            }

            return false;
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-        
        private init(): void {            
            this.SelectedTab = StormRunoffType.TR55;
            this.showResults = false;
            this.hideAlerts = false;
            this.CanContinue = true;
            this.showPrint = false;
            this.ReportData = new StormRunoffReportable();
        }

        private loadParameters(): void{
            //unsubscribe first
            this.EventManager.UnSubscribeToEvent(Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
            this.DrnAreaAcres = (this.SelectedParameterList[0].value * 640).toUSGSvalue();
            var dur = parseInt(this.SelectedPrecip.name.substr(0, 2));
            this.PIntensity = (this.SelectedPrecip.value / dur).toUSGSvalue();
            this.CanContinue = true;
            //alert("Parameters loaded");
        }

        private selectRunoffType() {
            switch (this._selectedTab) {
                case StormRunoffType.TR55:
                    this.SelectedParameterList = this.regionParameters.filter(f => { return ["DRNAREA", "RCN"].indexOf(f.code) != -1 });
                    this.SelectedParameterList.forEach(p => p.value = (isNaN(p.value) ? null : p.value));
                    this.showResults = false;
                    break;
                default: //case StormRunoffType.RationalMethod
                    this.SelectedParameterList = this.regionParameters.filter(f => { return ["DRNAREA", "RUNCO_CO"].indexOf(f.code) != -1 });
                    this.SelectedParameterList.forEach(p => p.value = (isNaN(p.value) ? null : p.value));
                    this.showResults = false;
                    break;
            }

            this.PrecipOptions = this.regionParameters.filter(f => { return ["I6H2Y", "I6H100Y", "I24H2Y", "I24H100Y"].indexOf(f.code) != -1 });
            this.PrecipOptions.forEach(p => p.value = (isNaN(p.value) ? null : p.value));

            if (!this.SelectedPrecip) {
                this.SelectedPrecip = this.PrecipOptions[0];
            }
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

        private checkArrayForObj(arr, obj):number {
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], obj)) {
                    return i;
                }
            };
            return -1;
        }

        private rand(min: number, max: number): any {
            return parseInt(<any>(Math.random() * (max - min + 1)), 10) + min;
        }

        private computeTime(time, dur): any {
            var newtime = new Date('January 1, 2018 00:00:00');
            //for SW region, time is a percentage
            //var z = dur * 60 * (0.01 * time);
            //for NW region, time is in hours
            var z = time * 60;

            newtime.setMinutes(z);

            return newtime;
        }

        private computeHours(firsttime, newtime): any {
            var millisec = newtime - firsttime;
            var hours = millisec / (1000 * 60 * 60); 

            return hours;
        }

        private getTimeSpan(firsttime, newtime): any {
            var millisec = newtime - firsttime;
            var minutes = ((millisec / (1000 * 60)) % 60);
            var hours = (<any>(Math)).trunc(millisec / (1000 * 60 * 60)); //Math.trunc
            var h;
            var m;

            if (hours < 10) {
                h = "0" + hours;
            } else {
                h = hours;
            }

            if (minutes < 10) {
                m = "0" + minutes;
            } else {
                m = minutes;
            }

            return h + ":" + m;
        }

        private loadGraphLabels(data): void {
            for (var i in data) {
                this.GraphLabels[i] = data[i].span;
            }
        }

        private loadGraphXValues(data): void {
            var count = 0;
            if (this.duration == 24) {
                for (var i in data) {
                    count++;
                    if (count % 2 != 0) {
                        this.GraphXValues.push(data[i].hours);
                    }
                }
            } else {
                for (var i in data) {
                    this.GraphXValues[i] = data[i].hours;
                }
            }
        }

        //used for Y2 label distance
        private loadPadY(data): void {
            var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
            if (max < 1000) {
                this.padY = -10;
            } else if (max >= 1000 && max < 10000) {
                this.padY2 = 0;
            } else if (max >= 10000 && max < 1000000) {
                this.padY = 20;
            } else if (max >= 1000000 && max < 100000000) {
                this.padY = 30;
            }
        }

        //used for Y domain
        private loadDomainY(data): void {
            var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
            this.domainY = [0, Math.round((max + max * 0.18) / 10) * 10]; 
        }

        //used for Y2 domain
        private loadDomainY2(data): void {
            var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
            this.domainY2 = [0, max + max * 0.18];
        }

        //used for Y2 label distance
        private loadPadY2(data): void {
            var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
            if (max < 1000) {
                this.padY2 = -30;
            } else if (max >= 1000) {
                this.padY2 = -10;
            }
        }

        private sortByKey(array, key): any {
            return array.sort(function (a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
    }//end wimLayerControlController class   

    enum StormRunoffType {
        TR55 = 1,
        RationalMethod = 2
    }

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);

}//end module 