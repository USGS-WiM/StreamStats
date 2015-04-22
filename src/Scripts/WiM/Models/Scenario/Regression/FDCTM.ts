//------------------------------------------------------------------------------
//----- FDCTM ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Represents the FDCTM model
//          
//discussion:
//

//Comments
//08.14.2014 jkn - Created


//Imports"
///<reference path="../Scenario.ts"/>
///<reference path="../../TimeSeries/TimeSeries.ts"/>

module Models.Scenario {
    export class FDCTM extends Scenario {
        //Properties
        public ExceedanceProbabilities: Array<IKeyValue>;
    
        //Constructor
        constructor(regionID: string, d: string, loadParameters: boolean = true) {
            super("FDCTM", ModelType.REGRESSION, d);
            this.RegionID = regionID;
            if (loadParameters)
                this.GetParameters(configuration.appSettings['RegressionService'] + '/' + this.Model + '/def?state=' + this.RegionID);

        }//end constructor

        //Override Methods
        public GetReferenceStation(pnt: IPoint) {
            //loads the referance stations
            //points must be in correct sr IA(26915)
            var url: string = configuration.appSettings['KrigService'].format(this.RegionID, pnt.Longitude.toString(), pnt.Latitude.toString(), pnt.wkid);

            $.ajax({
                type: "GET",
                url: url,
                processData: false,
                dataType: "json",
                success: s=> this.loadKriggedReferenceStationResults(s),
                error: e=> this.onError(e),
                complete: c=> this.onComplete()
            });
        }
        public CanExecute(): boolean {
            var superOK: boolean = false;
            try {
                superOK = super.CanExecute();
                if (!superOK) throw new Error();

                return true;
            }
            catch (e) {
                return false;
            }
        }
        public ToJson(): string {
            return ko.toJSON(this.Replacer());

        }
        public static FromJSON(obj: Object): FDCTM {
            var regionID: string = obj.hasOwnProperty("StateCode") ? obj["StateCode"] : "---";
            var descr: string = obj.hasOwnProperty("Description") ? obj["Description"] : "---";

            var fdctm: FDCTM = new FDCTM(regionID, descr, false);

            if (obj.hasOwnProperty("ExceedanceProbabilities")) fdctm.LoadProbabilites(obj["ExceedanceProbabilities"]);

            if (obj.hasOwnProperty("StartDate")) fdctm.StartDate(new Date(obj["StartDate"]));
            if (obj.hasOwnProperty("EndDate")) fdctm.EndDate(new Date(obj["EndDate"]));

            if (obj.hasOwnProperty("Parameters")) fdctm.LoadParameters(obj["Parameters"]);

            fdctm.EstimatedFlow = obj.hasOwnProperty("EstimatedFlow") ? TimeSeries.FromJSON(obj["EstimatedFlow"]) : null;
            fdctm.EstimatedStation = obj.hasOwnProperty("ReferanceGage") ? Station.FromJSON(obj["ReferanceGage"]) : null;

            return fdctm;

        }
        public LoadExecuteResults(jsn: Object) {
            super.LoadExecuteResults(jsn);
            //http://stackoverflow.com/questions/9943220/how-to-delete-a-localstorage-item-when-the-browser-window-tab-is-closed
            if (jsn.hasOwnProperty("ExceedanceProbabilities")) this.LoadProbabilites(jsn["ExceedanceProbabilities"]);
            this.Notification(new Notification("Model finished...", null, null, ActionType.HIDE));
            this.ReportReady(true);
        }
        public LoadProbabilites(obj: Object) {
            //Load Associative array
            this.ExceedanceProbabilities = [];
            for (var key in obj) {
                var val: number = obj[key]

                this.ExceedanceProbabilities.push(new KeyValue<number, number>(key, val));
            }//next key
        }    
        //Helper Methods
        private loadKriggedReferenceStationResults(list: Array<Object>) {
            if (this.ReferenceGageList.length != 0) this.ReferenceGageList.removeAll();

            for (var i = 0; i < list.length; i++) {
                var g: CorrelatedStation = CorrelatedStation.FromJSON(list[i]);
                this.ReferenceGageList.push(g);
            }

            this.SelectedReferenceGage(this.ReferenceGageList()[0]);

        }
        private Replacer(): Object {
            return {
                "startdate": this.StartDate,
                "enddate": this.EndDate,
                "nwis_station_id": this.SelectedReferenceGage().StationID,
                "parameters": this.Parameters
            };

        }
    }
}//end model