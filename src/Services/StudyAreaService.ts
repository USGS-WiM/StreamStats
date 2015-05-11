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
        loadStudyBoundary(sa: Models.IStudyArea);
    }
    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Events
        private _onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStudyAreaChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStudyAreaChanged;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private canUpdate: boolean;
        private _studyAreaList: Array<Models.IStudyArea>;
        public get StudyAreaList(): Array<Models.IStudyArea> {
            return this._studyAreaList;
        }

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

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor($http: ng.IHttpService, private $q: ng.IQService) {
            super($http, configuration['StreamStats'])
            this._onSelectedStudyAreaChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            this._studyAreaList = []; 
            this.canUpdate = true;
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AddStudyArea() {
            //add the study area to studyAreaList
        }
        public RemoveStudyArea() {
            //add the study area to studyAreaList
        }

        public loadStudyBoundary() {
            this.canUpdate = false;
            var url = configuration.requests['SSdelineation'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response) => {
                    this.selectedStudyArea.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
                    this.selectedStudyArea.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
                    //sm when complete
                },(error) => {
                    //sm when error
                }).finally(() => {  this.canUpdate = true; });
        }
        public loadParameters(params: Array<WiM.Models.IParameter> = []) {
            this.canUpdate = false;
            if (!this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) return;//sm study area is incomplete
            var paramsToCalc: Array<WiM.Models.IParameter> = params.length < 1 ? this.selectedStudyArea.Parameters : params;
            if (paramsToCalc.length < 1) return;

            var url = configuration.requests['SSparams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID,
                paramsToCalc.map((param: WiM.Models.IParameter) => { param.code }).join(';'));

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);

            this.Execute(request).then(
                (response) => {
                    var msg: string;
                    response.hasOwnProperty("parameters") ? this.loadParameterResults(response["parameters"]) : [];
                   //sm when complete
                },(error) => {
                    //sm when complete
                }).finally(() => { this.canUpdate = true; });
        }

        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-       
        private loadParameterResults(results:Array<WiM.Models.IParameter>) {
            for (var i: number = 0; i < results.length; i++) {
                for (var j: number = 0; j < this.selectedStudyArea.Parameters.length; j++) {
                    if (results[i].code.toUpperCase().trim() === this.selectedStudyArea.Parameters[j].code.toUpperCase().trim()) {
                        this.selectedStudyArea.Parameters[j].value = results[i].value;
                        break;//exit loop
                    }//endif
                }//next sa Parameter
            }//next result
        }

    }//end class

    factory.$inject = ['$http', '$q'];
    function factory($http: ng.IHttpService, $q: ng.IQService) {
        return new StudyAreaService($http,$q)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module