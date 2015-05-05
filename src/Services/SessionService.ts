//------------------------------------------------------------------------------
//----- DelineationService -----------------------------------------------------
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
//https://docs.angularjs.org/api/ng/service/$http

//Comments
//03.26.2015 jkn - Created

//Import
module StreamStats.Services {
    'use strict'
    export interface ISessionService{
        selectedAreaOfInterest: WiM.Services.ISearchAPIOutput;
        onSelectedAreaOfInterestChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        selectedRegion: Models.IRegion;
    }

    class SessionService implements ISessionService {
        //Events
        private _onSelectedAreaOfInterestChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedAreaOfInterestChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedAreaOfInterestChanged;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private _selectedAreaOfInterest;
        public set selectedAreaOfInterest(val: WiM.Services.ISearchAPIOutput) {
            if (this._selectedAreaOfInterest !== val) {
                this._selectedAreaOfInterest = val;
                this._onSelectedAreaOfInterestChanged.raise(null, WiM.Event.EventArgs.Empty);
            }
        }
        public get selectedAreaOfInterest(): WiM.Services.ISearchAPIOutput {
            return this._selectedAreaOfInterest
        }
        
        public selectedRegion: Models.IRegion;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor() {
            this._onSelectedAreaOfInterestChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();
            
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-

        //public AddStudyBoundary() {
        //    var sa: Models.IStudyArea = this.SelectedStudyArea;

        //    var url = configuration.requests['SSdelineation'].format(sa.RegionID, sa.Pourpoint.Longitude.toString(),
        //        sa.Pourpoint.Latitude.toString(), sa.Pourpoint.crs.toString(), false)
        //    var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);
        
        //    this.Execute(request).then(
        //        (response) => {
        //            sa.Basin = response.hasOwnProperty("delineatedbasin") ? response["delineatedbasin"].features[0] : null;
        //            sa.WorkspaceID = response.hasOwnProperty("workspaceID") ? response["workspaceID"] : null;
        //        },(error) => {
        //            return this.$q.reject(error.data)
        //        });

        //    this.SetSelectedStudy(sa);
        //}

        //public SetSelectedStudy(sa:Models.IStudyArea) {
        //    var saIndex: number = this.StudyAreaList.indexOf(sa);
        //    if (saIndex <= 0) throw new Error("Study area not in collection");

        //    this.SelectedStudyArea = this.StudyAreaList[this.StudyAreaList.indexOf(sa)]
        //}

        //HelperMethods
        //-+-+-+-+-+-+-+-+-+-+-+-

    }//end class

    factory.$inject = [];
    function factory() {
        return new SessionService()
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.SessionService', factory)
}//end module