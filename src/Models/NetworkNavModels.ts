﻿//------------------------------------------------------------------------------
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
        addLocation(name: string, pnt: WiM.Models.IPoint);
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
        constructor(methodtype: number, navigationInfo: any) {

            this.navigationID = methodtype;
            this.navigationInfo = navigationInfo;
            if (this.navigationInfo.configuration) this.minLocations = this.getCountByType(this.navigationInfo.configuration,'geojson point geometry');
            this.navigationConfiguration = [];
            this.navigationPointCount = 0;
            this._locations = [];
        }

        //Methods
        public addLocation(name: string, pnt: WiM.Models.IPoint):void {
            this._locations.push(pnt);

            //console.log('in add location:', name, pnt, this.navigationPointCount, this.navigationConfiguration);

            //delete point if already exists
            this.navigationConfiguration.reverse().forEach((config, index) => {
                if (config.name == name) {
                    console.log('found this point already, deleting:', this.navigationConfiguration, index)
                    this.navigationConfiguration.splice(index, 1);
                    this.navigationPointCount -= 1
                }
            });

            //add point
            this.navigationPointCount+=1
            this.navigationConfiguration.push({
                "id": this.navigationPointCount,
                "name": name,
                "required": true,
                "description": "Specified lat/long/crs  navigation start location",
                "valueType": "geojson point geometry",
                "value": {
                    "type": "Point", "coordinates": [pnt.Longitude, pnt.Latitude], "crs": { "properties": { "name": "EPSG:" + pnt.crs }, "type": "name" }
                }
            })

            //console.log('navigationConfiguration:', this.navigationConfiguration)

            if (this._locations.length > this.minLocations)
                this._locations.shift();
        }

        private getCountByType(object, text) {
            return object.filter(function (item) { return (item.valueType.toLowerCase().indexOf(text) >= 0) }).length;
        }
    }//end class

    export class NetworkPath extends NetworkNav {
        //https://ssdev.cr.usgs.gov/streamstatsservices/navigation/1.geojson?rcode=RRB&startpoint=[-94.311504,48.443681]&endpoint=[-94.349721,48.450215]&crs=4326
        //properties
       
        //Constructor
        constructor() {
            super(2, 2);
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
            super(1, 1);
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
            super(3, 1);
            this.selectedDirectionType = this.DirectionOptions[1];
        }

    }//end class

}//end namespace