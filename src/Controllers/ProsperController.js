//------------------------------------------------------------------------------
//----- Prosper ----------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2018 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//Comments
//07.17.2018 jkn - Created
//Import
var StreamStats;
(function (StreamStats) {
    var Controllers;
    (function (Controllers) {
        'use strict';
        var ProsperController = (function () {
            function ProsperController($scope, modal, $sce, pservices) {
                $scope.vm = this;
                this.sce = $sce;
                this.modalInstance = modal;
                this._prosperServices = pservices;
                this.init();
            }
            Object.defineProperty(ProsperController.prototype, "Location", {
                get: function () {
                    return this._results.point;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "Date", {
                get: function () {
                    return this._results.date;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "Table", {
                get: function () {
                    return this._table;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "ResultsAvailable", {
                get: function () {
                    return this._resultsAvailable;
                },
                enumerable: true,
                configurable: true
            });
            ProsperController.prototype.convertUnsafe = function (x) {
                return this.sce.trustAsHtml(x);
            };
            ;
            Object.defineProperty(ProsperController.prototype, "Description", {
                get: function () {
                    var desc = "The PRObability of Streamflow PERmanence (PROSPER) model provides annual (2004-2016)" +
                        "streamflow permanence probabilities (SPPs; probabilistic predictions) and streamflow permanence" +
                        "classes(SPCs; categorical wet/ dry with an associated confidence level). Probabilities are of a stream" +
                        "channel having year- round flow at a 30- m spatial resolution.Model methods, output, and appropriate" +
                        "uses are detailed in Jaeger et al. (2018).Interpretation of a pixel as wet or dry will be based on" +
                        "combined consideration of the SPP, the sign of the SPC (negative for dry, positive for wet), and the" +
                        "associated confidence (1 - 5 representing 50% - 95 %).For example, predictions with a negative" +
                        "(positive) sign, high confidence level indicated by an SPC of - 5(5), and an SPP of less than (greater" +
                        "than) 0.5 will be the most reliable." +
                        "<a href = 'https://doi.org/10.1016/j.hydroa.2018.100005' target = '_blank' > Click here for more information.</a><br><br><b>Contact " +
                        "information:</b><br>Roy Sando<br>U.S. Geological Survey, Wyoming-Montana Water Science Center<br>Email: <a href='mailto:tsando@usgs.gov' target='_blank'>tsando@usgs.gov</a> <br>Phone: 406-457-5953";
                    return this.sce.trustAsHtml(desc);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "AvailablePredictions", {
                get: function () {
                    return this._prosperServices.AvailablePredictions;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "DisplayedPredictionLayer", {
                get: function () {
                    return this._prosperServices.DisplayedPrediction;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "SelectedPredictions", {
                get: function () {
                    return this._prosperServices.SelectedPredictions;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ProsperController.prototype, "Graph", {
                get: function () {
                    return this._graph;
                },
                enumerable: true,
                configurable: true
            });
            //Methods  
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperController.prototype.Close = function () {
                this.modalInstance.dismiss('cancel');
            };
            ProsperController.prototype.Reset = function () {
                this._prosperServices.ResetSelectedPredictions();
                this.init();
            };
            ProsperController.prototype.Print = function () {
                window.print();
            };
            ProsperController.prototype.DownloadCSV = function () {
                var filename = 'prosper.csv';
                var csvFile = 'StreamStats PROSPER Report\n\n' +
                    '\nLatitude,' + this.Location.lat.toFixed(5) + '\nLongitude,' + this.Location.lng.toFixed(5) +
                    '\nTime,' + this.Date.toLocaleString() + '\n\n';
                csvFile += this.Description + '\n\n';
                csvFile += this.tableToCSV($('#prosperResults'));
                //download
                var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    if (link.download !== undefined) {
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
            };
            ProsperController.prototype.Query = function () {
                this._prosperServices.CanQuery = true;
                this.modalInstance.dismiss();
            };
            ProsperController.prototype.ChangeDisplayedLayer = function (value) {
                if (this.DisplayedPredictionLayer == value)
                    return;
                this._prosperServices.DisplayedPrediction = value;
            };
            //Helper Methods
            //-+-+-+-+-+-+-+-+-+-+-+-
            ProsperController.prototype.init = function () {
                if (this._prosperServices.Result == null) {
                    this._resultsAvailable = false;
                    this._results = null;
                    this._graph = null;
                }
                else {
                    this._resultsAvailable = true;
                    this.setResults(this._prosperServices.Result);
                    this._graph = {
                        data: this.getGraphData(),
                        options: {
                            chart: {
                                showLegend: false,
                                height: 450,
                                type: 'scatterChart',
                                showValues: false,
                                pointShape: function (d) { return 'square'; },
                                pointSize: 10,
                                pointDomain: [0, 10],
                                transitionDuration: 350,
                                rotateLabels: 45,
                                yDomain: [-5, 5],
                                margin: {
                                    top: 20,
                                    right: 50,
                                    bottom: 100,
                                    left: 60
                                },
                                yAxis: {
                                    axisLabel: 'Streamflow Permanence Class',
                                    tickValues: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
                                },
                                xAxis: {
                                    tickValues: this._xValues,
                                    showMaxMin: false,
                                    rotateLabels: 45
                                },
                                scatter: { onlyCircles: false }
                            }
                        }
                    };
                }
            };
            ProsperController.prototype.tableToCSV = function ($table) {
                var $headers = $table.find('tr:has(th)'), $rows = $table.find('tr:has(td)')
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                , tmpColDelim = String.fromCharCode(11) // vertical tab character
                , tmpRowDelim = String.fromCharCode(0) // null character
                // actual delimiter characters for CSV format
                , colDelim = '","', rowDelim = '"\r\n"';
                // Grab text from table into CSV formatted string
                var csv = '"';
                csv += formatRows($headers.map(grabRow));
                csv += rowDelim;
                csv += formatRows($rows.map(grabRow)) + '"';
                return csv;
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
                    if (!$cols.length)
                        $cols = $row.find('th');
                    return $cols.map(grabCol)
                        .get().join(tmpColDelim);
                }
                // Grab and format a column from the table 
                function grabCol(j, col) {
                    var $col = $(col), $text = $col.text();
                    return $text.replace('"', '""'); // escape double quotes
                }
            }; //end tableToCSV
            ProsperController.prototype.setResults = function (results) {
                this._results = results;
                this._table = {};
                this._xValues = [];
                for (var item in this._results.data) {
                    for (var k = 0; k < this._results.data[item].length; k++) {
                        var obj = this._results.data[item][k];
                        if (obj.name.charAt(0) == "2")
                            this._xValues.push(obj.name);
                        if (!(obj.name in this._table))
                            this._table[obj.name] = {};
                        this._table[obj.name][item] = obj.value;
                    } //next k
                } //next item
                this._prosperServices.ResetResults();
            };
            ProsperController.prototype.getGraphData = function () {
                var _this = this;
                var catagories = this._results.data.SPC.map(function (pred) { return pred.value; }).filter(function (val, i, arr) { return arr.indexOf(val) === i; });
                var data = [];
                catagories.forEach(function (cat) {
                    data.push({
                        key: cat,
                        color: _this.getDefinedColor(cat),
                        values: _this._results.data.SPC.filter(function (pred) { return pred.value === cat && pred.name.toLowerCase() != "mean"; }).map(function (val) { return { x: parseInt(val.name), y: parseInt(val.value) }; })
                    });
                }); //next cat
                return data;
            };
            ProsperController.prototype.getDefinedColor = function (index) {
                switch (index) {
                    case "-5": return "rgb(255,102,102)"; //light red
                    case "-4": return "rgb(255,164,102)"; //red-orange
                    case "-3": return "rgb(255,202,102)"; //orange
                    case "-2": return "rgb(255,242,102)"; //yellow
                    case "-1": return "rgb(241,255,146)"; //yellow-green
                    case "0": return "rgb(211,255,188)"; //light green
                    case "1": return "rgb(169,255,228)"; //green-blue
                    case "2": return "rgb(122,239,255)"; //light blue
                    case "3": return "rgb(137,196,255)"; //blue
                    case "4": return "rgb(134,155,255)"; //violet
                    case "5": return "rgb(109,109,255)"; //purple
                    default: return "rgb(64,0,64)"; //black
                }
            };
            return ProsperController;
        }()); //end Controller class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        ProsperController.$inject = ['$scope', '$modalInstance', '$sce', 'StreamStats.Services.ProsperService'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ProsperController', ProsperController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ProsperController.js.map