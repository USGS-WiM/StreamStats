//------------------------------------------------------------------------------
//----- SessionService -----------------------------------------------------
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
        onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        selectedRegion: Models.IRegion;
    }

    class SessionService implements ISessionService {
        //Events
        private _onSelectedAreaOfInterestChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedAreaOfInterestChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedAreaOfInterestChanged;
        }

        private _onSelectedStudyAreaChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onSelectedStudyAreaChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onSelectedStudyAreaChanged;
        }
        
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public selectedRegion: Models.IRegion;

        private _selectedAreaOfInterest:WiM.Services.ISearchAPIOutput;
        public set selectedAreaOfInterest(val: WiM.Services.ISearchAPIOutput) {
            if (this._selectedAreaOfInterest !== val) {
                this._selectedAreaOfInterest = val;
                this._onSelectedAreaOfInterestChanged.raise(null, WiM.Event.EventArgs.Empty);
            }
        }
        public get selectedAreaOfInterest(): WiM.Services.ISearchAPIOutput {
            return this._selectedAreaOfInterest
        }

        private _studyAreaList: Array<Models.IStudyArea>;
        public get StudyAreaList(): Array<Models.IStudyArea> {
            return this._studyAreaList;
        }

        private _selectedStudyArea:Models.IStudyArea;
        public set selectedStudyArea(val: Models.IStudyArea) {
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
        constructor() {
            this._onSelectedAreaOfInterestChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>();  
            this._onSelectedStudyAreaChanged = new WiM.Event.Delegate<WiM.Event.EventArgs>(); 
            this.StudyAreaList = [];          
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public AddStudyArea() {
            //add the study area to studyAreaList
        } 
        public RemoveStudyArea() {
            //add the study area to studyAreaList
        } 

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