//------------------------------------------------------------------------------
//----- StudyAreaService -------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//

//Comments
//04.15.2015 jkn - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface IStudyAreaService {
        onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        onEditClick: WiM.Event.Delegate<WiM.Event.EventArgs>;
        selectedStudyArea: Models.IStudyArea;
        loadParameters();
        loadStudyBoundary();
        upstreamRegulation();
        AddStudyArea(sa: Models.IStudyArea);
        RemoveStudyArea();
        doDelineateFlag: boolean;
        isRegulated: boolean;
        parametersLoading: boolean;
        parametersLoaded: boolean;
        canUpdate: boolean;
        studyAreaParameterList: Array<IParameter>;
        drawControl: any;
        drawControlOption: any;
        editedAreas: any;
    }
    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Events
        private _onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStudyAreaChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStudyAreaChanged;
        }
        private _onEditClick: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onEditClick(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onEditClick;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public toaster: any;
        public canUpdate: boolean;
        public regulationCheckComplete: boolean
        public parametersLoaded: boolean;
        public parametersLoading: boolean;
        private _studyAreaList: Array<Models.IStudyArea>;
        public get StudyAreaList(): Array<Models.IStudyArea> {
            return this._studyAreaList;
        }
        public doDelineateFlag: boolean;
        public isRegulated: boolean;

        private _selectedStudyArea: Models.IStudyArea;
        public set selectedStudyArea(val: Models.IStudyArea) {
            if (!this.canUpdate) return;
            if (this._selectedStudyArea != val) {
                this._selectedStudyArea = val;
                this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
            }
        }
        public get selectedStudyArea(): Models.IStudyArea {
            return this._selectedStudyArea
        }
        public studyAreaParameterList: Array<IParameter>;
        public drawControl: any;
        public showAddRemoveButtons: boolean;
        public drawControlOption: any;
        public editedAreas: any;
        public regulationCheckResults: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService, toaster) {
            super($http, configuration.baseurls['StreamStats'])
            this._onSelectedStudyAreaChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this._onEditClick = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this.toaster = toaster;
            this._studyAreaList = []; 
            this.canUpdate = true;
            this.regulationCheckComplete = true;
            this.parametersLoaded = false;
            this.parametersLoading = false;
            this.doDelineateFlag = false;
            this.studyAreaParameterList = [];
            this.showAddRemoveButtons = false;
            this.editedAreas = { "added": [], "removed": [] };
            this.isRegulated = null;
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public editBasin(selection) {
            this.drawControlOption = selection;
            this._onEditClick.raise(null, WiM.Event.EventArgs.Empty);
        }

        public undoEdit() {
            console.log('undo edit');
            this.editedAreas = { "added": [], "removed": [] };
            this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
        }

        public AddStudyArea(sa: Models.IStudyArea) {
            //add the study area to studyAreaList
            this.StudyAreaList.push(sa);
            this.selectedStudyArea = sa;
        }
        public RemoveStudyArea() {
            //remove the study area to studyAreaList
        }

        public loadStudyBoundary() {

            this.toaster.pop("info", "Delineating Basin", "Please wait...", 0);
            console.log('toast', this.toaster);
            this.canUpdate = false;
            
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                    this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    this.selectedStudyArea.Date = new Date();

                    this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "Error Delineating Basin", "Please retry", 5000);
                }).finally(() => {
                    this.canUpdate = true;
                    this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
                   
            });
        }

        public loadParameters() {

            this.toaster.pop('info', "Calculating Selected Parameters", "Please wait...", 0);
            console.log('in load parameters');
            //this.canUpdate = false;
            this.parametersLoading = true;
            this.parametersLoaded = false;

            if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                alert('No Study Area');
                return;//sm study area is incomplete
            }

            var requestParameterList = [];
            this.studyAreaParameterList.map((param) => { requestParameterList.push(param.code); })

            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID,
                requestParameterList.join(','));
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.parameters && response.data.parameters.length > 0) {
                        var results = response.data.parameters;
                        this.loadParameterResults(results);
                        this.parametersLoaded = true;
                        
                        //do regulation parameter update if needed
                        if (this.isRegulated) {
                            this.loadRegulatedParameterResults(this.regulationCheckResults.parameters);
                        }

                    }

                    this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "Error Calculating Basin Characteristics", "Please retry", 5000);
                }).finally(() => {
                    //this.canUpdate = true;
                    this.parametersLoading = false;
                });
        }

        public upstreamRegulation() {

            console.log('upstream regulation');
            this.toaster.pop('info', "Checking for Upstream Regulation", "Please wait...",0);

            this.regulationCheckComplete = false;

            var watershed = JSON.stringify(this.selectedStudyArea.Features[1].feature, null);
            var url = configuration.baseurls['RegulationServices'] + configuration.queryparams['COregulationService'];
            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { watershed: watershed, outputcrs: 4326, f: 'geojson' },
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);

            this.Execute(request).then(
                (response: any) => {
                    console.log(response);
                    if (response.data.percentarearegulated > 0) {
                        this.toaster.clear();
                        this.toaster.pop('success', "Regulation was found", "Continue to 'Modify Parameters' to see area-weighted parameters", 5000);
                        this.selectedStudyArea.Features.push(response.data["featurecollection"][0]);
                        this.regulationCheckResults = response.data;
                        //this.loadRegulatedParameterResults(this.regulationCheckResults.parameters);
                        this.isRegulated = true;                      
                    }
                    else {
                        //alert("No regulation found");
                        this.isRegulated = false;
                        this.toaster.clear();
                        this.toaster.pop('warning', "No regulation found", "Please continue", 5000);
                        
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "Error Checking for Upstream Regulation", "Please retry", 5000);
                }).finally(() => {
                    //this.toaster.clear();
                    this.regulationCheckComplete = true;
                    this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);

            });
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-       
        private loadParameterResults(results: Array<WiM.Models.IParameter>) {

            this.toaster.pop('info', "Loading Parameters", "Please wait...");

            console.log('in load parameter results');

            var paramList = this.studyAreaParameterList;
            results.map(function (val) {
                angular.forEach(paramList, function (value, index) {
                    if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                        value.value = val.value;
                        return;//exit loop
                    }//endif
                });
            });
            console.log('params', this.studyAreaParameterList);
        }

        private loadRegulatedParameterResults(regulatedResults: Array<WiM.Models.IParameter>) {

            this.toaster.pop('info', "Loading Regulated Parameters", "Please wait...");

            console.log('in load regulated parameter results');

            var paramList = this.studyAreaParameterList;
            regulatedResults.map(function (regulatedParam) {
                angular.forEach(paramList, function (param, index) {
                    if (regulatedParam.code.toUpperCase().trim() === param.code.toUpperCase().trim()) {

                        //calculate unregulated values
                        switch (regulatedParam.operation) {

                            case "Sum":
                                param.unRegulatedValue = param.value - regulatedParam.value;
                                break;
                            case "WeightedAverage":

                                var totalSum, regulatedSum, regulatedValue, totalValue;

                                //get the value for the weight field, need to find it from parameter list
                                angular.forEach(paramList, function (checkParam, index) {
                                     if (checkParam.code == regulatedParam.operationField) {
                                        totalSum = checkParam.value;
                                    }
                                });

                                //get the value for the weight field, need to find it from regulated parameter list
                                angular.forEach(regulatedResults, function (checkRegulatedParam, index) {
                                    if (checkRegulatedParam.code == regulatedParam.operationField) {
                                        regulatedSum = checkRegulatedParam.value;
                                    }
                                });

                                regulatedValue = regulatedParam.value;
                                totalValue = param.value;
                                
                                var tempVal1 = regulatedSum * (regulatedValue / totalSum);
                                var tempVal2 = totalValue - tempVal1;
                                var tempVal3 = totalSum - regulatedSum;
                                var tempVal4 = tempVal2 * (totalSum / tempVal3);
                                param.unRegulatedValue = tempVal4;                                
                        }

                        //pass through regulated value
                        param.regulatedValue = regulatedParam.value;

                        return;//exit loop
                    }//endif
                });
            });
            console.log('regulated params', this.studyAreaParameterList);
        }

    }//end class

    factory.$inject = ['$http', '$q', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, toaster:any) {
        return new StudyAreaService($http,$q, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module