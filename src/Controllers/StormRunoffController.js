var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var StormRunoffReportable = (function () {
            function StormRunoffReportable() {
                this.TR55 = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
                this.RationalMethod = { Graph: {}, Table: {}, PeakQ: {}, Infiltration: {}, ExcessPrecip: {} };
            }
            return StormRunoffReportable;
        }());
        var StormRunoffController = (function (_super) {
            __extends(StormRunoffController, _super);
            function StormRunoffController($scope, $analytics, $http, studyAreaService, StatisticsGroup, region, modal, $timeout, EventManager) {
                var _this = _super.call(this, $http, configuration.baseurls.StormRunoffServices) || this;
                _this.$timeout = $timeout;
                _this.EventManager = EventManager;
                _this.regionParameters = [];
                _this.PrecipOptions = [];
                _this.SelectedParameterList = [];
                _this.GraphLabels = [];
                _this.GraphXValues = [];
                _this.padY = 0;
                _this.padY2 = 0;
                _this.domainY = [];
                _this.domainY2 = [];
                $scope.vm = _this;
                _this.angulartics = $analytics;
                _this.modalInstance = modal;
                _this.StudyArea = studyAreaService.selectedStudyArea;
                _this.nssService = StatisticsGroup;
                _this.studyAreaService = studyAreaService;
                _this.regionParameters = region.parameterList;
                _this.BrowserIE = _this.detectIE();
                _this.AppVersion = configuration.version;
                _this.parameterloadedEventHandler = new WiM.Event.EventHandler(function (sender, e) {
                    if (e.parameterLoaded)
                        _this.loadParameters();
                });
                _this.init();
                _this.print = function () {
                    window.print();
                };
                return _this;
            }
            Object.defineProperty(StormRunoffController.prototype, "SelectedPrecip", {
                get: function () {
                    return this._selectedPrecip;
                },
                set: function (val) {
                    this._selectedPrecip = val;
                    this.PIntensity = null;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StormRunoffController.prototype, "SelectedTab", {
                get: function () {
                    return this._selectedTab;
                },
                set: function (val) {
                    if (this._selectedTab != val) {
                        this._selectedTab = val;
                        this.selectRunoffType();
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(StormRunoffController.prototype, "SelectedParametersAreValid", {
                get: function () {
                    for (var i = 0; i < this.SelectedParameterList.length; i++) {
                        var item = this.SelectedParameterList[i];
                        if (isNaN(item.value)) {
                            return false;
                        }
                    }
                    return true;
                },
                enumerable: false,
                configurable: true
            });
            StormRunoffController.prototype.GetStormRunoffResults = function () {
                var _this = this;
                try {
                    this.CanContinue = false;
                    var equation = "";
                    var headers = {
                        "Content-Type": "application/json"
                    };
                    if (this.SelectedTab == 1) {
                        var equation_1 = StormRunoffType.TR55;
                        var url = configuration.queryparams['StormRunoffTR55'].format(this.SelectedParameterList[0].value, this.SelectedPrecip.value, this.SelectedParameterList[1].value, this.SelectedPrecip.code);
                    }
                    else if (this.SelectedTab == 2) {
                        var equation_2 = StormRunoffType.RationalMethod;
                        var url = configuration.queryparams['StormRunoffRationalMethod'].format(this.DrnAreaAcres, this.PIntensity, this.SelectedParameterList[1].value, this.SelectedPrecip.code);
                    }
                    var request = new WiM.Services.Helpers.RequestInfo(url);
                    this.Execute(request).then(function (response) {
                        _this.showResults = true;
                        _this.result = response.data;
                        if (_this.SelectedTab == 1) {
                            _this.ReportData.TR55.Graph = _this.loadGraphData();
                            _this.ReportData.TR55.Table = _this.GetTableData();
                            _this.setGraphOptions();
                        }
                        else if (_this.SelectedTab == 2) {
                            _this.setPeakQ(_this.result.q);
                        }
                    }, function (error) {
                        var x = error;
                    }).finally(function () {
                        _this.CanContinue = true;
                        _this.hideAlerts = true;
                    });
                }
                catch (e) {
                    console.log("oops GetStormRunoffResults failed to load ", e);
                }
            };
            StormRunoffController.prototype.validateForm = function (mainForm) {
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
            };
            StormRunoffController.prototype.ClearResults = function () {
                for (var i in this.studyAreaService.studyAreaParameterList) {
                    this.studyAreaService.studyAreaParameterList[i].value = null;
                }
                this.SelectedPrecip = this.PrecipOptions[0];
                this.SelectedPrecip.value = null;
                this.DrnAreaAcres = null;
                this.PIntensity = null;
                this.showResults = false;
            };
            StormRunoffController.prototype.CalculateParameters = function () {
                var _this = this;
                try {
                    this.CanContinue = false;
                    this.EventManager.SubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                    var url = configuration.baseurls['ScienceBase'] + configuration.queryparams['SSURGOexCOMS'] + configuration.queryparams['SSURGOexCO'].format(this.studyAreaService.selectedStudyArea.FeatureCollection.bbox);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    this.Execute(request).then(function (response) {
                        _this.showResults = true;
                        _this.excludearea = response.data;
                        if (_this.excludearea.count > 0) {
                            alert("The selected basin may have inadequate SSURGO data to properly compute the runoff curve number.");
                        }
                    }, function (error) {
                        var x = error;
                    }).finally(function () {
                        _this.CanContinue = true;
                        _this.hideAlerts = true;
                    });
                    for (var i = 0; i < this.SelectedParameterList.length; i++) {
                        var param = this.SelectedParameterList[i];
                        if (this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, param) == -1) {
                            this.studyAreaService.studyAreaParameterList.push(param);
                        }
                    }
                    if (this.SelectedPrecip != null && this.checkArrayForObj(this.studyAreaService.studyAreaParameterList, this.SelectedPrecip) == -1)
                        this.studyAreaService.studyAreaParameterList.push(this.SelectedPrecip);
                    this.studyAreaService.loadParameters();
                }
                catch (e) {
                    console.log("oops CalculateParams failed to load ", e);
                }
            };
            StormRunoffController.prototype.CheckDASize = function () {
                switch (this._selectedTab) {
                    case StormRunoffType.TR55:
                        if (this.SelectedParameterList[0].value > 25) {
                            this.DASizeAlert = "Value is greater than recommended maximum threshold of 25 square miles";
                        }
                        else {
                            this.DASizeAlert = null;
                        }
                        return;
                    default:
                        if (this.DrnAreaAcres > 200) {
                            this.DASizeAlert = "Value is greater than recommended maximum threshold of 200 acres";
                        }
                        else {
                            this.DASizeAlert = null;
                        }
                        return;
                }
            };
            StormRunoffController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            StormRunoffController.prototype.Reset = function () {
                this.init();
            };
            StormRunoffController.prototype.downloadCSV = function () {
                var _this = this;
                this.angulartics.eventTrack('Download', { category: 'Report', label: 'CSV' });
                var filename = 'data.csv';
                var processTR55Table = function (data) {
                    var finalVal = 'Peak Runoff from ' + _this.SelectedPrecip.name + ' (TR55)\n';
                    finalVal += _this.tableToCSV($('#TR55ParameterTable'));
                    finalVal += '\n' + _this.tableToCSV($('#TR55SummaryTable'));
                    finalVal += '\n\n' + _this.tableToCSV($('#TR55TabularHydrograph'));
                    var def = "";
                    if (_this.SelectedParameterList) {
                        var keylist = [];
                        keylist = Object.keys(_this.ReportData.TR55.Table.values[0]);
                        for (var k in keylist) {
                            if (parseInt(k) < 14) {
                                if (keylist[k] != "time") {
                                    if (keylist[k] == "span") {
                                        def += '#,Time,Time (HH:MM)\n';
                                    }
                                    else
                                        def += '#,' + _this.getHeading(keylist[k]) + ',' + _this.getTitle(keylist[k]) + '\n';
                                }
                            }
                        }
                    }
                    return def + '\n' + finalVal + '\r\n';
                };
                var processRMTable = function (data) {
                    var finalVal = 'Peak Runoff from ' + _this.SelectedPrecip.name + ' (Rational Method)\n';
                    finalVal += _this.tableToCSV($('#RMParameterTable'));
                    finalVal += '\n' + _this.tableToCSV($('#RMSummaryTable'));
                    var def = "";
                    if (_this.SelectedParameterList) {
                        var keylist = [];
                        keylist = Object.keys(_this.ReportData.TR55.Table.values[0]);
                        for (var k in keylist) {
                            if (parseInt(k) < 14) {
                                if (keylist[k] != "time") {
                                    if (keylist[k] == "span") {
                                        def += '#,Time,Time (HH:MM)\n';
                                    }
                                    else
                                        def += '#,' + _this.getHeading(keylist[k]) + ',' + _this.getTitle(keylist[k]) + '\n';
                                }
                            }
                        }
                    }
                    return def + '\n' + finalVal + '\r\n';
                };
                var csvFile = 'StreamStats Output Report\n\n' + 'State/Region ID,' + this.studyAreaService.selectedStudyArea.RegionID.toUpperCase() + '\nWorkspace ID,' + this.studyAreaService.selectedStudyArea.WorkspaceID + '\nLatitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Latitude.toFixed(5) + '\nLongitude,' + this.studyAreaService.selectedStudyArea.Pourpoint.Longitude.toFixed(5) + '\nTime,' + this.studyAreaService.selectedStudyArea.Date.toLocaleString() + '\n\n';
                if (this.SelectedTab == 1) {
                    csvFile += processTR55Table(this.studyAreaService.studyAreaParameterList);
                }
                else if (this.SelectedTab == 2) {
                    csvFile += processRMTable(this.studyAreaService.studyAreaParameterList);
                }
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
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
            };
            StormRunoffController.prototype.generateColorShade = function (minhue, maxhue) {
                try {
                    var h = this.rand(minhue, minhue);
                    var s = this.rand(30, 100);
                    var l = this.rand(30, 70);
                    return 'hsla(' + h + ',' + s + '%,' + l + '%,1)';
                }
                catch (e) {
                    return null;
                }
            };
            StormRunoffController.prototype.update = function (precipoption) {
                console.log(precipoption);
            };
            StormRunoffController.prototype.loadGraphData = function () {
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
                    hydrograph.sort(function (a, b) { return a.x - b.x; });
                    hyetograph.sort(function (a, b) { return a.x - b.x; });
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
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.GetTableData = function () {
                this.ReportData.TR55.PeakQ = 0;
                this.ReportData.TR55.Infiltration = 0;
                this.ReportData.TR55.ExcessPrecip = 0;
                var tableFields = [];
                var tableValues = [];
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
                    tableValues.sort(function (a, b) { return a.time - b.time; });
                    firsttime = tableValues[0].time;
                    for (var t in tableValues) {
                        tableValues[t].span = this.getTimeSpan(firsttime, tableValues[t].time);
                    }
                    return { "values": tableValues, "Fields": tableFields };
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.setPeakQ = function (peak) {
                try {
                    if (this.SelectedTab == 1) {
                        var Q = peak;
                        if (this.ReportData.TR55.PeakQ < Q) {
                            this.ReportData.TR55.PeakQ = Q;
                        }
                    }
                    else {
                        this.ReportData.RationalMethod.PeakQ = peak;
                    }
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.setInfiltration = function (pl) {
                try {
                    var ploss = pl;
                    this.ReportData.TR55.Infiltration = this.ReportData.TR55.Infiltration + pl;
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.setExcessPrecip = function (dpe) {
                try {
                    var exPrecip = dpe;
                    this.ReportData.TR55.ExcessPrecip = this.ReportData.TR55.ExcessPrecip + dpe;
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.getPrecipTitle = function () {
                if (this.SelectedTab == 2) {
                    return "Precipitation intensity is computed by dividing the " + this.SelectedPrecip.name + " by " + this.SelectedPrecip.name.substr(0, 2);
                }
                else {
                    return;
                }
            };
            StormRunoffController.prototype.getTitle = function (shortname) {
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
                    }
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.getHeading = function (shortname) {
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
                    }
                }
                catch (e) {
                    var x = e;
                }
            };
            StormRunoffController.prototype.setGraphOptions = function () {
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
                                    var hours = (Math).trunc(d.value);
                                    var h;
                                    var m;
                                    if (hours < 10) {
                                        h = "0" + hours;
                                    }
                                    else {
                                        h = hours;
                                    }
                                    if (minutes < 10) {
                                        m = "0" + minutes;
                                    }
                                    else {
                                        m = minutes;
                                    }
                                    var time = h + ":" + m;
                                    var rows = "";
                                    for (var i in d.series) {
                                        var x = parseFloat(d.series[i].value);
                                        var ydatatype;
                                        var precision;
                                        if ((x > 1000000) && (x < 10000000))
                                            precision = 10000;
                                        if ((x > 100000) && (x < 1000000))
                                            precision = 1000;
                                        if ((x > 10000) && (x < 100000))
                                            precision = 100;
                                        if ((x > 1000) && (x < 10000))
                                            precision = 10;
                                        if ((x > 100) && (x < 1000))
                                            precision = 1;
                                        ydatatype = parseInt(((x + (precision * .5)) / precision).toString()) * precision;
                                        if (x < 100)
                                            ydatatype = Number(x.toPrecision(3));
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
                                var hours = (Math).trunc(d);
                                var minutes = d * 60 % 60;
                                var h;
                                var m;
                                if (hours < 10) {
                                    h = "0" + hours;
                                }
                                else {
                                    h = hours;
                                }
                                if (minutes < 10) {
                                    m = "0" + minutes;
                                }
                                else {
                                    m = minutes;
                                }
                                return h + ":" + m;
                            },
                            rotateLabels: '45'
                        },
                        yAxis1: {
                            axisLabel: 'Discharge (Q), in ft³/s',
                            axisLabelDistance: this.padY,
                            tickFormat: function (d) {
                                return d3.format(',.0f')(d);
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
            };
            StormRunoffController.prototype.BrowserAlert = function () {
                if (this.BrowserIE) {
                    alert("The Storm Runoff Modeling tool is best viewed with the following browsers\n\n\tChrome\n\tFirefox\n\tEdge");
                }
            };
            StormRunoffController.prototype.detectIE = function () {
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf('MSIE ');
                var version;
                if (msie > 0) {
                    version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                    return true;
                }
                var trident = ua.indexOf('Trident/');
                if (trident > 0) {
                    var rv = ua.indexOf('rv:');
                    version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                    return true;
                }
                if (navigator.userAgent.indexOf("Chrome") != -1) {
                    this.BrowserChrome = true;
                }
                return false;
            };
            StormRunoffController.prototype.init = function () {
                this.SelectedTab = StormRunoffType.TR55;
                this.showResults = false;
                this.hideAlerts = false;
                this.CanContinue = true;
                this.showPrint = false;
                this.ReportData = new StormRunoffReportable();
            };
            StormRunoffController.prototype.loadParameters = function () {
                this.EventManager.UnSubscribeToEvent(StreamStats.Services.onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
                this.DrnAreaAcres = (this.SelectedParameterList[0].value * 640).toUSGSvalue();
                var dur = parseInt(this.SelectedPrecip.name.substr(0, 2));
                this.PIntensity = (this.SelectedPrecip.value / dur).toUSGSvalue();
                this.CanContinue = true;
            };
            StormRunoffController.prototype.selectRunoffType = function () {
                switch (this._selectedTab) {
                    case StormRunoffType.TR55:
                        this.SelectedParameterList = this.regionParameters.filter(function (f) { return ["DRNAREA", "RCN"].indexOf(f.code) != -1; });
                        this.SelectedParameterList.forEach(function (p) { return p.value = (isNaN(p.value) ? null : p.value); });
                        this.showResults = false;
                        break;
                    default:
                        this.SelectedParameterList = this.regionParameters.filter(function (f) { return ["DRNAREA", "RUNCO_CO"].indexOf(f.code) != -1; });
                        this.SelectedParameterList.forEach(function (p) { return p.value = (isNaN(p.value) ? null : p.value); });
                        this.showResults = false;
                        break;
                }
                this.PrecipOptions = this.regionParameters.filter(function (f) { return ["I6H2Y", "I6H100Y", "I24H2Y", "I24H100Y"].indexOf(f.code) != -1; });
                this.PrecipOptions.forEach(function (p) { return p.value = (isNaN(p.value) ? null : p.value); });
                if (!this.SelectedPrecip) {
                    this.SelectedPrecip = this.PrecipOptions[0];
                }
            };
            StormRunoffController.prototype.tableToCSV = function ($table) {
                var $headers = $table.find('tr:has(th)'), $rows = $table.find('tr:has(td)'), tmpColDelim = String.fromCharCode(11), tmpRowDelim = String.fromCharCode(0), colDelim = '","', rowDelim = '"\r\n"';
                var csv = '"';
                csv += formatRows($headers.map(grabRow));
                csv += rowDelim;
                csv += formatRows($rows.map(grabRow)) + '"';
                return csv;
                function formatRows(rows) {
                    return rows.get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim);
                }
                function grabRow(i, row) {
                    var $row = $(row);
                    var $cols = $row.find('td');
                    if (!$cols.length)
                        $cols = $row.find('th');
                    return $cols.map(grabCol)
                        .get().join(tmpColDelim);
                }
                function grabCol(j, col) {
                    var $col = $(col), $text = $col.text();
                    return $text.replace('"', '""');
                }
            };
            StormRunoffController.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            StormRunoffController.prototype.rand = function (min, max) {
                return parseInt((Math.random() * (max - min + 1)), 10) + min;
            };
            StormRunoffController.prototype.computeTime = function (time, dur) {
                var newtime = new Date('January 1, 2018 00:00:00');
                var z = time * 60;
                newtime.setMinutes(z);
                return newtime;
            };
            StormRunoffController.prototype.computeHours = function (firsttime, newtime) {
                var millisec = newtime - firsttime;
                var hours = millisec / (1000 * 60 * 60);
                return hours;
            };
            StormRunoffController.prototype.getTimeSpan = function (firsttime, newtime) {
                var millisec = newtime - firsttime;
                var minutes = ((millisec / (1000 * 60)) % 60);
                var hours = (Math).trunc(millisec / (1000 * 60 * 60));
                var h;
                var m;
                if (hours < 10) {
                    h = "0" + hours;
                }
                else {
                    h = hours;
                }
                if (minutes < 10) {
                    m = "0" + minutes;
                }
                else {
                    m = minutes;
                }
                return h + ":" + m;
            };
            StormRunoffController.prototype.loadGraphLabels = function (data) {
                for (var i in data) {
                    this.GraphLabels[i] = data[i].span;
                }
            };
            StormRunoffController.prototype.loadGraphXValues = function (data) {
                var count = 0;
                if (this.duration == 24) {
                    for (var i in data) {
                        count++;
                        if (count % 2 != 0) {
                            this.GraphXValues.push(data[i].hours);
                        }
                    }
                }
                else {
                    for (var i in data) {
                        this.GraphXValues[i] = data[i].hours;
                    }
                }
            };
            StormRunoffController.prototype.loadPadY = function (data) {
                var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
                if (max < 1000) {
                    this.padY = -10;
                }
                else if (max >= 1000 && max < 10000) {
                    this.padY2 = 0;
                }
                else if (max >= 10000 && max < 1000000) {
                    this.padY = 20;
                }
                else if (max >= 1000000 && max < 100000000) {
                    this.padY = 30;
                }
            };
            StormRunoffController.prototype.loadDomainY = function (data) {
                var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
                this.domainY = [0, Math.round((max + max * 0.18) / 10) * 10];
            };
            StormRunoffController.prototype.loadDomainY2 = function (data) {
                var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
                this.domainY2 = [0, max + max * 0.18];
            };
            StormRunoffController.prototype.loadPadY2 = function (data) {
                var max = Math.max.apply(Math, data.map(function (o) { return o.y; }));
                if (max < 1000) {
                    this.padY2 = -30;
                }
                else if (max >= 1000) {
                    this.padY2 = -10;
                }
            };
            StormRunoffController.prototype.sortByKey = function (array, key) {
                return array.sort(function (a, b) {
                    var x = a[key];
                    var y = b[key];
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            };
            StormRunoffController.$inject = ['$scope', '$analytics', '$http', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService', '$modalInstance', '$timeout', 'WiM.Event.EventManager'];
            return StormRunoffController;
        }(WiM.Services.HTTPServiceBase));
        var StormRunoffType;
        (function (StormRunoffType) {
            StormRunoffType[StormRunoffType["TR55"] = 1] = "TR55";
            StormRunoffType[StormRunoffType["RationalMethod"] = 2] = "RationalMethod";
        })(StormRunoffType || (StormRunoffType = {}));
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.StormRunoffController', StormRunoffController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {}));
