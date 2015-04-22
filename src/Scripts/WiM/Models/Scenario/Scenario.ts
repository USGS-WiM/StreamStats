//------------------------------------------------------------------------------
//----- Model ------------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  
//          
//discussion:
//

//Comments
//08.20.2014 jkn - Created


//Imports"

///<reference path="../Parameter.ts"/>
///<reference path="../Point.ts"/>
///<reference path="../TimeSeries/TimeSeries.ts"/>
///<reference path="../Station/Station.ts"/>

// Interface
interface IModel {
    Model: string;
    ModelType: ModelType;
    Description: string;
}//end IModel

enum ModelType {
    UNDEFINED = 0,
    PRMS = 1,
    REGRESSION = 2,
    SIMILAR = 3
}
module StreamStats.Models.Scenario {
    export class SimpleModel implements IModel {
        //Properties
        public Model: string;
        public ModelType: ModelType;
        public Description: string;

        // Constructor
        constructor(m: string = "", mt: ModelType = ModelType.UNDEFINED, d: string = "") {
            this.Model = m;
            this.ModelType = mt;
            this.Description = d;
        }//end constructor

        public static FromJSON(jsn: Object): Scenario {
            var model: string = jsn.hasOwnProperty("ModelType") ? jsn["ModelType"] : "";
            var type: ModelType = jsn.hasOwnProperty("ModelType") ? this.ModelTypeFromString(jsn["ModelType"]) : ModelType.UNDEFINED;
            var description: string = jsn.hasOwnProperty("Description") ? jsn["Description"] : "";

            return new Scenario(model, type, description);
        }//end FromJSON

        private static ModelTypeFromString(m: string) {

            switch (m) {
                case "PRMS":
                    return ModelType.PRMS;
                case 'FDCTM':
                    return ModelType.REGRESSION;
                case 'FLA':
                    return ModelType.SIMILAR;
                default:
                    return ModelType.UNDEFINED;
            }//end switch
        }//end ModelTypeFromString
    }

    // Class
    export class Scenario implements IModel {

        //Properties
        public Model: string;
        public ModelType: ModelType;
        public Description: string;
        public Parameters: Array<IParameter>;
        public RegionID: string;
        public SelectedReferenceGage: Station;
        public ReferenceGageList: Array<Station>;
        public MinDateRange: Date;
        public MaxDateRange: Date;
        public StartDate: Date;
        public EndDate:Date;
        public Notification: Notification;
        public HasRegions: Boolean;
        public ReportReady: Boolean;

        public EstimatedStation: Station;
        public EstimatedFlow: TimeSeries;
        // Constructor
        constructor(m: string = "", mt: ModelType = ModelType.UNDEFINED, d: string = "") {
            this.ModelType = mt;
            this.Description = d;
            this.Model = m;

            this.Parameters =[];
            this.StartDate = this.addDay(new Date(), -1);
            this.EndDate = this.addDay(new Date(), -1);

            this.MinDateRange = new Date(1900, 1, 1);
            this.MaxDateRange = this.addDay(new Date(), -1);

            this.SelectedReferenceGage = new Station("------");
            this.ReferenceGageList = [];
            this.HasRegions =false;
        }//end constructor

        //Methods
        public SetReferenceGage(gage: Station) {
            this.SelectedReferenceGage(gage);
        }
        public LoadParameters(params: Array<IParameter>) {

            if (this.Parameters.length > 0) this.Parameters =[];
            if (params != null) {
                params.forEach(p=> this.Parameters.push(Parameter.FromJSON(p)));
            }
        }
        public GetNWISReferenceStation(RegionID: string) {
            //loads the referance stations from NWIS
            var url = configuration.appSettings['NWISurl'].format(RegionID);

            $.ajax({
                type: "GET",
                url: url,
                processData: false,
                dataType: "xml",
                success: s=> this.loadReferenceStationResults(s),
                error: e=> this.onError(e),
                complete: c=> this.onComplete()
            });
        }

        public GetReferenceStation(pnt: IPoint) {
            throw new Error('This method is abstract');
        }
        public ToJson(): string {
            throw new Error('This method is abstract');
        }
        public CanExecute(): boolean {
            var maxOK: boolean = false;
            var minOK: boolean = false;
            var startEndOK: boolean = false;
            var refStationOK: boolean = false;
            var paramsOK: boolean = false;
            try {
                maxOK = this.StartDate < this.MaxDateRange || this.EndDate < this.MaxDateRange;
                minOK = this.StartDate > this.MinDateRange || this.EndDate > this.MinDateRange;
                startEndOK = this.StartDate <= this.EndDate;

                refStationOK = this.SelectedReferenceGage().StationID != "------" || this.SelectedReferenceGage().StationID != "";
                paramsOK = this.Parameters.length > 0;

                return maxOK && minOK && startEndOK && refStationOK && paramsOK;

            }
            catch (e) {
                return false;
            }
        }

        public UpdateParameter(p: Object) {
            var pCount: number = this.Parameters.length;
            for (var i: number = 0; i < pCount; i++) {
                if (this.Parameters[i].code.toLowerCase() === p['code'].toLowerCase()) {
                    this.Parameters[i].value=p['value'];
                    break;
                }//endif
            }//next n

        }

        public LoadExecuteResults(jsn: Object) {
            //LocalStorageOp.LocalStorage(StorageType.APPEND, "nss." + this.Model, jsn);

            this.EstimatedFlow = jsn.hasOwnProperty("EstimatedFlow") ? TimeSeries.FromJSON(jsn["EstimatedFlow"]) : null;
            this.EstimatedStation = jsn.hasOwnProperty("ReferanceGage") ? Station.FromJSON(jsn["ReferanceGage"]) : null;
        }
        public GetParameters(URL: string) {
            //get parameters from service       
            $.ajax({
                type: "GET",
                url: URL,
                dataType: "json",
                success: m=> this.LoadParameters((m["Parameters"] != null) ? m["Parameters"] : m["Regions"][0].Parameters),
                async: false
            });
        }
        public Execute() {
            if (!this.CanExecute()) return;

            var url = configuration.appSettings['ScenarioService'].format(this.Model, this.RegionID);

            var sd = this.StartDate;
            var ed = this.EndDate;
            //this.Notification(new Notification("Executing " + this.ModelType.toString() + " model. Please wait....", null, null, ActionType.SHOW));

            $.ajax({
                type: "POST",
                url: url,
                data: this.ToJson(),
                contentType: "application/json",
                processData: false,
                dataType: "json",
                success: s=> this.LoadExecuteResults(s),
                error: e=> this.onError(e),
                complete: c=> this.onComplete()
            });

        }
        //http request handlers
        public onError(err) {
            var errorMsg: string = "Error computing flow report";

            errorMsg = err.hasOwnProperty("responseText") && err["responseText"] != "" ? err["responseText"] : errorMsg;

            //this.Notification(new Notification(errorMsg, NotificationType.ERROR, null, ActionType.HIDE));
        }
        public onComplete() {
            //TODO add cleanup code.
            //TODO change MSG Obj to Notification so subscribed objects can inform to turn on/off notifications

            var cleanup = "";
        }

        //Helper Methods
        private loadReferenceStationResults(xml: Document) {
            if (this.ReferenceGageList.length != 0) this.ReferenceGageList.removeAll();

            var single_sites = <HTMLCollection>xml.getElementsByTagName("sites");

            //loop over single sites object
            if (single_sites.length == 1) {
                var markers = <HTMLCollection>single_sites[0].getElementsByTagName("site");

                // it's possible to have an XML tag but with no markers
                if (markers.length == 0) {
                    return;

                    // otherwise process the single sites			
                } else {

                    // loop through the marker elements
                    var nmarkers = 0;
                    while (nmarkers < markers.length) {

                        //increment marker loop
                        nmarkers++;

                        //make sure there is a marker
                        if (markers[nmarkers]) {
                            var siteno = markers[nmarkers].getAttribute("sno");
                            var stat = new Station(siteno);
                            stat.StationID = siteno;
                            stat.Name = markers[nmarkers].getAttribute("sna");
                            stat.Latitude_DD = parseFloat(markers[nmarkers].getAttribute("lat"));
                            stat.Longitude_DD = parseFloat(markers[nmarkers].getAttribute("lng"));
                        }

                        this.ReferenceGageList.push(stat);
                    }
                }
            }

            this.SelectedReferenceGage(this.ReferenceGageList[0]);
        }
        private addDay(d: Date, days: number): Date {
            try {
                var dayAsTime: number = 1000 * 60 * 60 * 24;
                return new Date(d.getTime() + days * dayAsTime);
            }
            catch (e) {
                return d;
            }
        }
        private JSONReplacer(key, value) {
            switch (key) {
                case "ReferenceGage":
                    key = "nwis_station_id";
                    return value;

                case "MinDateRange":
                case "MaxDateRange":
                case "Model":
                case "ModelType":
                case "Description":
                case "RegionID":
                    return undefined;
                default:
                    return value;
            }//end switch
        }
    }//end class

}//end module