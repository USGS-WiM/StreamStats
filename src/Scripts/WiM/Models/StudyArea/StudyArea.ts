//------------------------------------------------------------------------------
//----- StudyArea --------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Represents the StudyArea
//          
//discussion:
//

//Comments
//08.14.2014 jkn - Created


//Imports"

///<reference path="../Parameter.ts"/>
///<reference path="../Point.ts"/>

// Class
module StreamStats.Models.StudyArea {
    class StudyArea {
    
        //Properties
        public SelectedModel: Scenario;

        public Pourpoint: IPoint;
        public Description: string;
        public RegionID: string;
        public DownloadURL: string;
        public Basin: Object;
        public StudyParameters: Array<IParameter>;
        public WorkspaceID: string;

        private basinDelineated: boolean;

        public OnDelineationComplete: boolean;

        // Constructor
        constructor(point, regionID: string) {
            this.Pourpoint = point;
            this.RegionID = regionID;
            this.Description = '';
            this.DownloadURL = '';
            this.Basin = null;
            this.basinDelineated = false;

            this.OnDelineationComplete = false;
            this.StudyParameters = [];

        }

        public AddStudyModel(s: Scenario) {
            //select the model
            //this.Description(s().Description + " for location: ("+this.Pourpoint.Longitude+", " +this.Pourpoint.Latitude+")");
            this.SelectedModel = s;
            this.SelectedModel.GetReferenceStation(this.Pourpoint);
            this.GetStudyParameters();
        }
        public GetStudyParameters() {
            if (this.Basin == null) {
                //this.OnNotification(new Notification("Please manually configure model parameters."));
                return;
            }

            //this.OnNotification(new Notification("Calculating model parameters.... Please wait.",null,null,ActionType.SHOW));

            var url = configuration.appSettings['SSbasinChar']
                .format(this.RegionID, this.WorkspaceID,
                $.map(this.SelectedModel().Parameters(), function (obj) { return obj.code }).join(';'));

            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: s=> this.loadStudyParamResults(s),
                error: e=> this.LoadError(e),
                complete: c=> this.LoadParametersComplete()
            });
        }
        //Public Methods
        public GetStudyBoundary(): void {
            this.OnNotification(new Notification("Delineating study boundaries.... Please wait", NotificationType.ALERT, 3, ActionType.SHOW));

            var url = configuration.appSettings['SSwatershed']
                .format(this.RegionID, this.Pourpoint.Longitude.toString(),
                this.Pourpoint.Latitude.toString(), this.Pourpoint.wkid.toString(), false)

            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: s=> this.loadStudyResults(s),
                error: e=> this.LoadError(e),
                complete: c=> this.LoadBoundaryComplete()
            });

        }
        //Helper Methods
        private loadStudyResults(obj: Object) {

            //parse through results       
            this.OnNotification(new Notification("Delineation success..."));
            //set export url
            this.Basin = obj.hasOwnProperty("delineatedbasin") ? obj["delineatedbasin"].features[0] : null;
            this.WorkspaceID = obj.hasOwnProperty("workspaceID") ? obj["workspaceID"] : null;
            this.DownloadURL = "http://ssdev.cr.usgs.gov/streamstatsService/download?item=" + this.WorkspaceID;

            if (this.Basin != null) this.basinDelineated = true;
        }
        private loadStudyParamResults(obj: Object) {
            var msg: string;
            var params: Array<Parameter>
            //parse through results       
            this.OnNotification(new Notification("Parameter request success... loading parameters"));
            msg = obj.hasOwnProperty("messages") ? obj["messages"] : "";
            this.OnNotification(new Notification(msg));

            params = obj.hasOwnProperty("parameters") ? obj["parameters"] : [];
            //populate params
            params.forEach(x=> this.updateStudyParameter(x));

            LocalStorageOp.LocalStorage(StorageType.APPEND, "nss.study.Parameters", this.StudyParameters);

            this.OnNotification(new Notification("Refine calculated parameters or continue on to 'Build a Flow Report'..."));
        }

        private LoadError(err) {

            console.log("error", err);
            this.OnNotification(new Notification("There was an error in the study area process. Please retry or manually enter parameters", NotificationType.ERROR));
            //this.OnDelineationComplete(true);
        }
        private LoadBoundaryComplete() {      

            //regardless of success or fail do this stuff
            console.log("Study Request complete");
            this.OnNotification(new Notification("Request complete", null, null, ActionType.HIDE));
            this.OnDelineationComplete(true);
            //save to localstorage:
            LocalStorageOp.LocalStorage(StorageType.SET, "nss.study", this.Replacer());
            //deactivate map panel
            $('#map').css('cursor', 'hand');
            //$('#loadingSpinner').hide();
        
        }
        private LoadParametersComplete() {
            //regardless of success or fail do this stuff
            console.log("Study Request complete");
            this.OnNotification(new Notification("Parameters request completed", null, null, ActionType.HIDE));
            this.OnDelineationComplete(true);

        }
        private updateStudyParameter(p: Object) {
            var okToAdd = true;
            if (!p.hasOwnProperty("name") || !p.hasOwnProperty("value")) return;
            //check if it already exists in the list if so replace it.
            var spCount: number = this.StudyParameters.length;
            for (var i: number = 0; i < spCount; i++) {
                if (this.StudyParameters[i].name.toLowerCase() === p['name'].toLowerCase()) {
                    this.StudyParameters[i].value(p['value']);
                    okToAdd = false
                    break;
                }//endif
            }//next n
            //include as study property

            if (okToAdd) this.StudyParameters.push(new Parameter(p["name"], p["value"], p["code"], p["description"], "", null));
            this.SelectedModel().UpdateParameter(p);

        }
        private Replacer(): Object {
            return {
                "Pourpoint": this.Pourpoint,
                "Description": this.Description(),
                "RegionID": this.RegionID,
                "Parameters": this.StudyParameters,
                "WorkspaceID": this.WorkspaceID,
                "DownloadURL": this.DownloadURL,
                "Basin": this.Basin
            };
        }

    }//end class
}//end module