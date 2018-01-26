//------------------------------------------------------------------------------
//----- Network Navigation ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2016 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose: hold relative information for network navigation tools 
//          
//discussion:
//   FINDPATHBETWEENPOINTS = 1,
//   FINDPATH2OUTLET = 2,3
//   GETNETWORKREPORT = 4

//Comments
//07.06.2016 jkn - Created

// Class
module StreamStats.Models {
    export interface INetworkNav {
        locations: Array<WiM.Models.IPoint>;
        addLocation(pnt: WiM.Models.IPoint);
        navigationName: string;
        navigationDescription: string;
        navigationID: number;
        navigationInfo: any;
        navigationConfiguration: Array<any>;
        minLocations: number;
        optionsCount: number;
        navigationPointCount: number;
       
    }

    export class NetworkNav implements INetworkNav{

        //properties
        private _locations: Array<WiM.Models.IPoint>;

        public get locations(): Array <WiM.Models.IPoint> {
            return this._locations;
        }
        
        public navigationName: string;
        public navigationDescription: string;
        public navigationID: number;
        public navigationInfo: any;
        public navigationConfiguration: Array<any>;
        public minLocations: number;
        public optionsCount: number;
        public navigationPointCount: number;

        //Constructor
        constructor(methodtype: number, navigationInfo: any, totalPointCount: number, totalOptionsCount: number) {

            this.navigationID = methodtype;
            this.navigationInfo = navigationInfo;
            this.minLocations = totalPointCount;
            this.navigationConfiguration = [];
            this.optionsCount = totalOptionsCount;
            this.navigationPointCount = 0;
            this._locations = [];
        }

        //Methods
        public addLocation(pnt: WiM.Models.IPoint):void {
            this._locations.push(pnt);
            this.navigationPointCount+=1
            console.log('in add location:', pnt, this.navigationPointCount);

            //replace configuration item with new point
            this.navigationInfo.configuration.forEach((item) => {

            });

            if (this.navigationPointCount === 1) {
                this.navigationConfiguration.push({
                    "id": 1,
                    "name": "Start point location",
                    "required": true,
                    "description": "Specified lat/long/crs  navigation start location",
                    "valueType": "geojson point geometry",
                    "value": {
                        "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                    }
                })
            }

            if (this.navigationPointCount === 2) {
                this.navigationConfiguration.push({
                    "id": this.navigationPointCount ,
                    "name": "End point location",
                    "required": true,
                    "description": "Specified lat/long/crs  navigation end location",
                    "valueType": "geojson point geometry",
                    "value": {
                        "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                    }
                })
            }

            console.log('navigationConfiguration:', this.navigationConfiguration)

            if (this._locations.length > this.minLocations)
                this._locations.shift();
        }
    }//end class

    export class NetworkPath extends NetworkNav {
        //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/1.geojson?rcode=RRB&startpoint=[-94.311504,48.443681]&endpoint=[-94.349721,48.450215]&crs=4326
        //properties
       
        //Constructor
        constructor() {
            super(2, 2, 0 , 1);
        }
    }//end class
    export class FlowPath extends NetworkNav {
        //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/2.geojson?rcode=RRB&startpoint=[-94.719923,48.47219]&crs=4326&workspaceID=RRB20160624114146710000
        //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/3.geojson?rcode=RRB&startpoint=[-94.719923,48.47219]&crs=4326

        //properties
        private _workspaceID: string;
        public get workspaceID(): string {
            return this._workspaceID;
        }
        public set workspaceID(val: string) {
            this._workspaceID = val
        }
        //Constructor
        constructor() {
            super(1, 1, 1, 1);
            this._workspaceID = '';
        }
    }//end class
    export class NetworkTrace extends NetworkNav {
        //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/4.geojson?rcode=RRB&startpoint=[-94.719923,48.47219]&crs=4326&direction=Upstream&layers=NHDFlowline
        //properties
        public layerOptions: Array<any> = [{ name: "NHDFlowline", selected: true }, { name: "Gage", selected: false  }, { name: "Dam", selected:false  }];
        public DirectionOptions: Array<string> = ["Upstream", "Downstream"];
        public selectedDirectionType: string;
        public reportplaceholder: string;

        //Constructor
        constructor() {
            super(3, 1, 4, 1);
            this.selectedDirectionType = this.DirectionOptions[1];
        }

    }//end class

}//end namespace