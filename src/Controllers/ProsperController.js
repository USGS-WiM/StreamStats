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
            function ProsperController($scope, modal, pservices) {
                $scope.vm = this;
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
                    return this._results.data;
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
            Object.defineProperty(ProsperController.prototype, "Description", {
                get: function () {
                    return "The U.S. Geological Survey (USGS) has developed the PRObability of Streamflow PERmanence (PROSPER) model, a GIS raster-based empirical model that provides streamflow permanence probabilities (probabilistic predictions) of a stream channel having year-round flow for any unregulated and minimally-impaired stream channel in the Pacific Northwest region, U.S. The model provides annual predictions for 2004-2016 at a 30-m spatial resolution based on monthly or annually updated values of climatic conditions and static physiographic variables associated with the upstream basin (Raw streamflow permanence probability rasters). Predictions correspond to pixels on the channel network consistent with the medium resolution National Hydrography Dataset channel network stream grid. Probabilities were converted to wet and dry streamflow permanence classes (Categorical wet/dry rasters) with an associated confidence (Threshold and confidence interval rasters).";
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
                    this._results = this._prosperServices.Result;
                    this._graph = {
                        data: [{
                                key: "",
                                values: this._results.data
                            }],
                        options: {
                            chart: {
                                height: 450,
                                type: 'discreteBarChart',
                                staggerLabels: true,
                                showValues: false,
                                transitionDuration: 350,
                                rotateLabels: 45,
                                x: function (d) { return d.name; },
                                y: function (d) { return d.value; },
                                margin: {
                                    top: 20,
                                    right: 50,
                                    bottom: 100,
                                    left: 55
                                },
                                yAxis: {
                                    axisLabel: 'Confidence in prediction of streamflow permanence',
                                    axisLabelDistance: -10
                                }
                            }
                        }
                    };
                    //reset services
                    this._prosperServices.RestResults();
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
            return ProsperController;
        }()); //end Controller class
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        ProsperController.$inject = ['$scope', '$modalInstance', 'StreamStats.Services.ProsperService'];
        angular.module('StreamStats.Controllers')
            .controller('StreamStats.Controllers.ProsperController', ProsperController);
    })(Controllers = StreamStats.Controllers || (StreamStats.Controllers = {}));
})(StreamStats || (StreamStats = {})); //end module 
//# sourceMappingURL=ProsperController.js.map