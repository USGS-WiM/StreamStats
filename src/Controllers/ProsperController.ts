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
module StreamStats.Controllers {
    'use strict';
    interface IProsperScope extends ng.IScope {
        vm: IProsperController;
    }

    interface IProsperController {
        Location: any;
        Date: Date;
        Description: string;
        AvailablePredictions: Array<Services.IProsperPrediction>;
        DisplayedPredictionLayer: Services.IProsperPrediction;
        SelectedPredictions: Array<Services.IProsperPrediction>;
        ResultsAvailable: boolean;
        Graph: any;
        Table: any;

        ChangeDisplayedLayer(value: Services.IProsperPrediction);
    }

    class ProsperController implements IProsperController {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private _results: Services.IProsperPredictionResults;
        public get Location() {
            return this._results.point;
        }
        public get Date() {
            return this._results.date;
        }
        public get Table():any {
            return this._results.data;
        }
        private modalInstance: ng.ui.bootstrap.IModalServiceInstance;    
        private _prosperServices: Services.IProsperService;
        private _resultsAvailable: boolean;
        public get ResultsAvailable():boolean {
            return this._resultsAvailable;
        }
        public get Description():string {
            return "The U.S. Geological Survey (USGS) has developed the PRObability of Streamflow PERmanence (PROSPER) model, a GIS raster-based empirical model that provides streamflow permanence probabilities (probabilistic predictions) of a stream channel having year-round flow for any unregulated and minimally-impaired stream channel in the Pacific Northwest region, U.S. The model provides annual predictions for 2004-2016 at a 30-m spatial resolution based on monthly or annually updated values of climatic conditions and static physiographic variables associated with the upstream basin (Raw streamflow permanence probability rasters). Predictions correspond to pixels on the channel network consistent with the medium resolution National Hydrography Dataset channel network stream grid. Probabilities were converted to wet and dry streamflow permanence classes (Categorical wet/dry rasters) with an associated confidence (Threshold and confidence interval rasters)."
        }
        public get AvailablePredictions(): Array<Services.IProsperPrediction> {
            return this._prosperServices.AvailablePredictions;
        }
        
        public get DisplayedPredictionLayer(): Services.IProsperPrediction
        {
            return this._prosperServices.DisplayedPrediction;
        }
        public get SelectedPredictions(): Array<Services.IProsperPrediction>
        {
            return this._prosperServices.SelectedPredictions;
        }
        private _graph:any
        public get Graph(): any {
            return this._graph;
        }
       
      //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$modalInstance','StreamStats.Services.ProsperService'];
        constructor($scope: IProsperScope, modal:ng.ui.bootstrap.IModalServiceInstance, pservices:StreamStats.Services.IProsperService) {
            $scope.vm = this;
            this.modalInstance = modal;           
            this._prosperServices = pservices;
            this.init();   
        }  
        
        //Methods  
        //-+-+-+-+-+-+-+-+-+-+-+-
        public Close(): void {
            this.modalInstance.dismiss('cancel')
        }
        public Reset(): void {  
            this._prosperServices.ResetSelectedPredictions();
            this.init();
        }
        public Print(): void {
            window.print();
        }
        
        public DownloadCSV() {            
     
            var filename = 'prosper.csv';
            var csvFile = 'StreamStats PROSPER Report\n\n' +
                '\nLatitude,' + this.Location.lat.toFixed(5) + '\nLongitude,' + this.Location.lng.toFixed(5) +
                '\nTime,' + this.Date.toLocaleString() + '\n\n';

            csvFile += this.Description + '\n\n';

            csvFile += this.tableToCSV($('#prosperResults'))

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

        public Query(): void {
            this._prosperServices.CanQuery = true;
            this.modalInstance.dismiss();

        }
        public ChangeDisplayedLayer(value: Services.IProsperPrediction)
        {
            if (this.DisplayedPredictionLayer == value) return;
            this._prosperServices.DisplayedPrediction = value;            
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void {
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
                }
                
                //reset services
                this._prosperServices.RestResults();
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
        }//end tableToCSV
    }//end Controller class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.ProsperController', ProsperController);
}//end module 