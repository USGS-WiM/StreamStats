﻿//------------------------------------------------------------------------------
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
        selectedStudyArea: Models.IStudyArea;
        loadStudyBoundary();
        upstreamRegulation();
        AddStudyArea(sa: Models.IStudyArea);
        RemoveStudyArea();
        doDelineateFlag: boolean;
        isRegulated: boolean;
        canUpdate: boolean;
        studyAreaParameterList: Array<IParameter>;
    }
    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Events
        private _onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStudyAreaChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStudyAreaChanged;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public canUpdate: boolean;
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

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration.baseurls['StreamStats'])
            this._onSelectedStudyAreaChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this._studyAreaList = []; 
            this.canUpdate = true;
            this.doDelineateFlag = false;
            this.studyAreaParameterList = [];
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AddStudyArea(sa: Models.IStudyArea) {
            //add the study area to studyAreaList
            this.StudyAreaList.push(sa);
            this.selectedStudyArea = sa;
        }
        public RemoveStudyArea() {
            //remove the study area to studyAreaList
        }

        public loadStudyBoundary() {
            this.canUpdate = false;
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                    this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    //sm when complete
                },(error) => {
                    //sm when error
                }).finally(() => {
                    this.canUpdate = true;
                    this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);
            });
        }
        public loadParameters() {
            console.log('in load parameters');
            this.canUpdate = false;
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
                        this.loadParameterResults(response.data.parameters);
                        //this.selectedStudyArea.Parameters = response.data.parameters;
                    }
                    //sm when complete
                },(error) => {
                    //sm when complete
                }).finally(() => { this.canUpdate = true; });
        }

        public upstreamRegulation() {

            this.isRegulated = false;
            this.canUpdate = false;

            var watershed = JSON.stringify(this.selectedStudyArea.Features[1].feature, null);
            var url = configuration.baseurls['RegulationServices'] + configuration.queryparams['COregulationService'].format('', 'CO20150629082308341000','4326',
                'geojson')
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    console.log(response);
                    if (response.data.hasOwnProperty("percentarearegulated")) {
                        this.selectedStudyArea.Features.push(response.data["featurecollection"][0]);
                        this.loadRegulatedParameterResults(response.data.parameters);
                        this.isRegulated = true;
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                }).finally(() => {
                    this.canUpdate = true;
                    this._onSelectedStudyAreaChanged.raise(null, WiM.Event.EventArgs.Empty);

            });
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-       
        private loadParameterResults(results: Array<WiM.Models.IParameter>) {
            console.log('in load parameter results');
            for (var i: number = 0; i < results.length; i++) {
                for (var j: number = 0; j < this.studyAreaParameterList.length; j++) {
                    if (results[i].code.toUpperCase().trim() === this.studyAreaParameterList[j].code.toUpperCase().trim()) {
                        this.studyAreaParameterList[j].value = results[i].value;
                        break;//exit loop
                    }//endif
                }//next sa Parameter
            }//next result
            console.log('params', this.studyAreaParameterList);
        }

        private loadRegulatedParameterResults(results: Array<WiM.Models.IParameter>) {
            console.log('in load regulated parameter results');
            for (var i: number = 0; i < results.length; i++) {
                for (var j: number = 0; j < this.studyAreaParameterList.length; j++) {
                    if (results[i].code.toUpperCase().trim() === this.studyAreaParameterList[j].code.toUpperCase().trim()) {
                        this.studyAreaParameterList[j].regulatedValue = results[i].value;
                        break;//exit loop
                    }//endif
                }//next sa Parameter
            }//next result
            console.log('regulated params', this.studyAreaParameterList);
        }

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new StudyAreaService($http,$q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module