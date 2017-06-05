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
        selectedStudyArea: Models.IStudyArea;
        loadParameters();
        loadStudyBoundary();
        upstreamRegulation();
        AddStudyArea(sa: Models.IStudyArea);
        RemoveStudyArea();
        doDelineateFlag: boolean;
        parametersLoading: boolean;
        showEditToolbar: boolean;
        checkingDelineatedPoint: boolean;
        canUpdate: boolean;
        studyAreaParameterList: Array<IParameter>;
        drawControl: any;
        drawControlOption: any;
        WatershedEditDecisionList: Models.IEditDecisionList;
        clearStudyArea();
        zoomLevel15: boolean;
        loadEditedStudyBoundary();
        loadWatershed(rcode:string, workspaceID: string): void
        queryRegressionRegions();
        queryKarst(regionID: string, regionMapLayerList:any);
        queryCoordinatedReach();
        regressionRegionQueryComplete: boolean;
        baseMap: Object;
        showModifyBasinCharacterstics: boolean;
        getAdditionalFeatures();
        //requestParameterList: Array<any>; jkn
    }

    export var onSelectedStudyAreaChanged: string = "onSelectedStudyAreaChanged";
    export var onSelectedStudyParametersLoaded: string = "onSelectedStudyParametersLoaded";
    export var onStudyAreaReset: string = "onStudyAreaReset";
    export var onEditClick: string = "onEditClick";
    export class StudyAreaEventArgs extends WiM.Event.EventArgs {
        //properties
        public studyArea: StreamStats.Models.IStudyArea;
        public studyAreaVisible: boolean;
        public parameterLoaded: boolean;
        constructor(studyArea = null, saVisible = false, paramState = false) {
            super();
            this.studyArea = studyArea;
            this.studyAreaVisible = saVisible;
            this.parameterLoaded = paramState;
        }

    }

    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public toaster: any;
        public canUpdate: boolean;
        public regulationCheckComplete: boolean
        public parametersLoading: boolean;
        public checkingDelineatedPoint: boolean;
        private _studyAreaList: Array<Models.IStudyArea>;
        public get StudyAreaList(): Array<Models.IStudyArea> {
            return this._studyAreaList;
        }
        public doDelineateFlag: boolean;

        private _selectedStudyArea: Models.IStudyArea;
        public set selectedStudyArea(val: Models.IStudyArea) {
            if (!this.canUpdate) return;
            if (this._selectedStudyArea != val) {
                this._selectedStudyArea = val;
                this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
            }
        }
        public get selectedStudyArea(): Models.IStudyArea {
            return this._selectedStudyArea           
        }
        public studyAreaParameterList: Array<IParameter>;
        public drawControl: any;
        public showEditToolbar: boolean;
        public drawControlOption: any;
        public WatershedEditDecisionList: Models.IEditDecisionList;
        public regulationCheckResults: any;
        public zoomLevel15: boolean;
        public regressionRegionQueryComplete: boolean;
        public regressionRegionQueryLoading: boolean;
        public servicesURL: string;
        public baseMap: Object;
        public showModifyBasinCharacterstics: boolean;
        //public requestParameterList: Array<any>; jkn

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(public $http: ng.IHttpService, private $q: ng.IQService, private eventManager: WiM.Event.IEventManager, toaster) {
            super($http, configuration.baseurls['StreamStatsServices'])
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyParametersLoaded);
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyAreaChanged);
            eventManager.AddEvent<StudyAreaEventArgs>(onStudyAreaReset);
            eventManager.SubscribeToEvent(onSelectedStudyAreaChanged, new WiM.Event.EventHandler<StudyAreaEventArgs>((sender: any, e: StudyAreaEventArgs) => {
                this.onStudyAreaChanged(sender, e);
            }));
            eventManager.AddEvent<WiM.Event.EventArgs>(onEditClick);
            this._studyAreaList = [];

            this.toaster = toaster;
            this.clearStudyArea();
            this.servicesURL = configuration.baseurls['StreamStatsServices'];
           
        }
        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        public editBasin(selection) {
            //console.log('in editbasin, selection: ', selection);
            this.selectedStudyArea.Disclaimers['isEdited']=true;
            this.drawControlOption = selection;
            this.eventManager.RaiseEvent(onEditClick,this,WiM.Event.EventArgs.Empty)
        }

        public undoEdit() {
            //console.log('undo edit');
            delete this.selectedStudyArea.Disclaimers['isEdited'];
            this.WatershedEditDecisionList = new Models.WatershedEditDecisionList();
            this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
        }

        public AddStudyArea(sa: Models.IStudyArea) {
            //add the study area to studyAreaList
            this.clearStudyArea();
            this.StudyAreaList.push(sa);
            this.selectedStudyArea = sa;
            this.selectedStudyArea.Disclaimers = {};
        }

        public RemoveStudyArea() {
            //remove the study area to studyAreaList
        }

        public clearStudyArea() {
            //console.log('in clear study area');
            this.canUpdate = true;
            this.regulationCheckComplete = true;
            
            this.parametersLoading = false;
            this.doDelineateFlag = false;
            this.checkingDelineatedPoint = false;
            this.studyAreaParameterList = [];  //angular.fromJson(angular.toJson(configuration.alwaysSelectedParameters));
            this.regulationCheckResults = [];
            if (this.selectedStudyArea) this.selectedStudyArea.Disclaimers = {};
            this.showEditToolbar = false;
            this.WatershedEditDecisionList = new Models.WatershedEditDecisionList();
            this.selectedStudyArea = null;
            this.zoomLevel15 = true;
            this.regressionRegionQueryComplete = false;
            this.regressionRegionQueryLoading = false;

            this.eventManager.RaiseEvent(Services.onStudyAreaReset, this, WiM.Event.EventArgs.Empty);
        }

        public loadStudyBoundary() {

            this.toaster.pop("wait", "Delineating Basin", "Please wait...", 0);
            this.canUpdate = false;

            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString(), false)
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {  
                    //console.log('delineation response headers: ', response.headers());

                    //tests
                    //response.data.featurecollection[1].feature.features.length = 0;

                    if (response.data.featurecollection && response.data.featurecollection[1] && response.data.featurecollection[1].feature.features.length > 0) {
                        this.selectedStudyArea.Server = response.headers()['usgswim-hostname'];
                        this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                        this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        this.selectedStudyArea.Date = new Date();

                        //stub code for global check, but the services need to be updated first
                        //right now GlobalWshd is always 1

                        //this.selectedStudyArea.isGlobal = false;
                        //this.selectedStudyArea.Features.forEach((item) => { 
                        //    if (item.name == "globalwatershed") {
                        //        angular.forEach(item.feature.features[0].properties, (i,v) => {
                        //            console.log(v, i);
                        //            if (v == "GlobalWshd" && i == 1) {
                        //                this.selectedStudyArea.isGlobal = true;
                        //            }
                        //        });
                        //    }
                        //});

                        this.toaster.clear();
                        this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
                        this.canUpdate = true;
                    }
                    else {
                        this.clearStudyArea();
                        this.toaster.clear();
                        this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.clearStudyArea();
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error with the delineation request", "Please retry", 0);
                }).finally(() => {
                    
            });
        }

        public loadWatershed(rcode: string, workspaceID: string): void {
            try {

                this.toaster.pop("wait", "Opening Basin", "Please wait...", 0);
                var studyArea: Models.IStudyArea = new Models.StudyArea(rcode,null);
                this.AddStudyArea(studyArea);

                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSwatershedByWorkspace'].format('geojson', rcode, workspaceID, 4326, false)
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

                this.Execute(request).then(
                    (response: any) => {                        
                        this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;                        
                        this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        this.selectedStudyArea.Date = new Date();                   

                        //set point
                        this.selectedStudyArea.Features.forEach((layer) => { 
                            var item = angular.fromJson(angular.toJson(layer));

                            if (item.name == 'globalwatershedpoint') {
                                //get and set geometry
                                var geom = item.feature.features[0].bbox 
                                this.selectedStudyArea.Pourpoint = new WiM.Models.Point(geom[1], geom[0], item.feature.crs.properties.code);
                                return;
                            }//end if
                        });           
                    }, (error) => {
                        //sm when error
                        this.toaster.clear();
                        this.toaster.pop("error", "Error Delineating Basin", "Please retry", 0);
                    }).finally(() => {
                        this.canUpdate = true;
                        this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);    
                        this.toaster.clear();
                    });
            }
            catch(err){
                return;
            }
        }

        public loadEditedStudyBoundary() {

            this.toaster.pop("wait", "Loading Edited Basin", "Please wait...", 0);
            this.canUpdate = false;
            //Content-Type: application/json
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSeditBasin'].format('geojson', this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID, this.selectedStudyArea.Pourpoint.crs.toString())
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.PUT, 'json', angular.toJson(this.WatershedEditDecisionList), {});
            this.Execute(request).then(
                (response: any) => {
                    //create new study area                    
                    this.AddStudyArea(new Models.StudyArea(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint));
                    
                    this.selectedStudyArea.Features = response.data.hasOwnProperty("featurecollection") ? response.data["featurecollection"] : null;
                    this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                    this.selectedStudyArea.Date = new Date();

                    this.toaster.clear();
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "Error Delineating Basin", "Please retry", 0);
                }).finally(() => {
                this.canUpdate = true;
                var evnt = new StudyAreaEventArgs();
                evnt.studyArea = this.selectedStudyArea;                
                this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, evnt);
                this.selectedStudyArea.Disclaimers['isEdited'] = true;

            });
        }

        public loadParameters() {
            this.parametersLoading = true;
            var argState = { "isLoaded": false };
            var requestParameterList = [];
            this.toaster.clear();
            this.toaster.pop('wait', "Calculating Selected Basin Characteristics", "Please wait...", 0);
            //console.log('in load parameters');
            //this.canUpdate = false;
            
            this.eventManager.RaiseEvent(onSelectedStudyParametersLoaded, this,StudyAreaEventArgs.Empty );

            if (!this.selectedStudyArea || !this.selectedStudyArea.WorkspaceID || !this.selectedStudyArea.RegionID) {
                alert('No Study Area');
                return;
            }//end if

            //only compute missing characteristics
            requestParameterList = this.studyAreaParameterList.filter((param) => { return (!param.value || param.value < 0) }).map(param => { return param.code; });
            if (requestParameterList.length < 1) {  
                let saEvent = new StudyAreaEventArgs();
                saEvent.parameterLoaded = true;             
                this.eventManager.RaiseEvent(onSelectedStudyParametersLoaded, this, saEvent);
                this.toaster.clear();
                this.parametersLoading = false;
                return;
            }//end if
            

            //console.log('request parameter list before: ', this.requestParameterList);
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.WorkspaceID,
                requestParameterList.join(','));
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.parameters && response.data.parameters.length > 0) {

                        this.toaster.clear();

                        //check each returned parameter for issues
                        var paramErrors = false;
                        angular.forEach(response.data.parameters, (parameter, index) => {

                            //for testing
                            //if (parameter.code == 'DRNAREA') {
                            //    parameter.value = -999;
                            //}

                            if (!parameter.hasOwnProperty('value') || parameter.value == -999) {
                                paramErrors = true;
                                console.error('Parameter failed to compute: ', parameter.code);
                                parameter.loaded = false;
                            }
                            else {
                            //    //remove this param from requestParameterList
                            //    var idx = this.requestParameterList.indexOf(parameter.code);
                            //    if (idx != -1) this.requestParameterList.splice(idx, 1);
                                parameter.loaded = true;
                            }
                        });

                        //if there is an issue, pop open 
                        if (paramErrors) {
                            this.showModifyBasinCharacterstics = true;
                            this.toaster.pop('error', "One or more basin characteristics failed to compute", "Click the 'Calculate Missing Parameters' button or manually enter parameter values to continue", 0);
                        }

                        var results = response.data.parameters;
                        this.loadParameterResults(results);

                        //get additional features for this workspace
                        //this.getAdditionalFeatures();                          

                        //do regulation parameter update if needed
                        if (this.selectedStudyArea.Disclaimers['isRegulated']) {
                            this.loadRegulatedParameterResults(this.regulationCheckResults.parameters);
                          }

                        let saEvent = new StudyAreaEventArgs();
                        saEvent.parameterLoaded = true;
                        this.eventManager.RaiseEvent(onSelectedStudyParametersLoaded, this, saEvent);
                    }

                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error calculating basin characteristics", "Please retry", 0);
                }).finally(() => {
                    //this.canUpdate = true;
                    this.parametersLoading = false;
                });
        }

        public getAdditionalFeatures() {
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSComputeParams'].format(this.selectedStudyArea.RegionID);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.parameters && response.data.parameters.length > 0) {

                        this.toaster.clear();

                    }

                    //sm when complete
                }, (error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error calculating basin characteristics", "Please retry", 0);
                }).finally(() => {
                    //this.canUpdate = true;
                    this.parametersLoading = false;
                });
        }

        public queryLandCover() {

            this.toaster.pop('wait', "Querying Land Cover Data with your Basin", "Please wait...", 0);
            //console.log('querying land cover');

            var esriJSON = '{"geometryType":"esriGeometryPolygon","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polygon", "rings":[' + JSON.stringify(this.selectedStudyArea.Features[1].feature.features[0].geometry.coordinates) + ']}}]}'
            //var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);

            var url = configuration.baseurls['NationalMapRasterServices'] + configuration.queryparams['NLCDQueryService'];

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { InputLineFeatures: esriJSON, returnZ: true, f: 'json' },
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);
                    this.toaster.clear();

                    if (response.data.length > 0) {
                        //console.log('query success');

                        this.toaster.pop('success', "Land Cover was succcessfully queried", "Please continue", 5000);
                    }

                },(error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.pop('error', "There was an HTTP error querying Land Cover", "Please retry", 0);
                    return this.$q.reject(error.data);

                }).finally(() => {
            });
        }

        public queryCoordinatedReach() {

                this.toaster.pop('wait', "Checking if study area is a coordinated reach.", "Please wait...", 0);
                           
                var ppt = this.selectedStudyArea.Pourpoint;
                var ex = new L.Circle([ppt.Longitude, ppt.Latitude], 50).getBounds();
                var outFields = "eqWithStrID.BASIN_NAME,eqWithStrID.DVA_EQ_ID,eqWithStrID.a10,eqWithStrID.b10,eqWithStrID.a25,eqWithStrID.b25,eqWithStrID.a50,eqWithStrID.b50,eqWithStrID.a100,eqWithStrID.b100,eqWithStrID.a500,eqWithStrID.b500";
                var url = configuration.baseurls['GISserver'] + configuration.queryparams['coordinatedReachQueryService']
                    .format(this.selectedStudyArea.RegionID.toLowerCase(), ex.getNorth(), ex.getWest(), ex.getSouth(), ex.getEast(), ppt.crs, outFields);

                var request: WiM.Services.Helpers.RequestInfo =
                    new WiM.Services.Helpers.RequestInfo(url, true);

                this.Execute(request).then(
                    (response: any) => {
                        if (response.data.error) {
                            //console.log('query error');
                            this.toaster.pop('error', "There was an error querying coordinated reach", response.data.error.message, 0);
                            return;
                        }

                        if (response.data.features.length > 0) {
                            var attributes = response.data.features[0].attributes
                            //console.log('query success');

                            this.selectedStudyArea.CoordinatedReach = new Models.CoordinatedReach(attributes["eqWithStrID.BASIN_NAME"], attributes["eqWithStrID.DVA_EQ_ID"]);
                            //remove from arrays
                            delete attributes["eqWithStrID.BASIN_NAME"];
                            delete attributes["eqWithStrID.DVA_EQ_ID"];

                            var feildprecursor = "eqWithStrID.";

                            var pkID = Object.keys(attributes).map((key, index) => {
                                return key.substr(feildprecursor.length + 1);
                            }).filter((value, index, self) => { return self.indexOf(value) === index; })

                            for (var i = 0; i < pkID.length; i++) {
                                var code = pkID[i];
                                var acoeff = attributes[feildprecursor + "a" + code];
                                var bcoeff = attributes[feildprecursor + "b" + code];

                                if (acoeff != null && bcoeff != null)
                                    this.selectedStudyArea.CoordinatedReach.AddFlowCoefficient("PK" + code, acoeff, bcoeff);

                            }//next i
                            this.toaster.pop('success', "Selected reach is a coordinated reach", "Please continue", 5000);
                        }

                    }, (error) => {
                        //sm when complete
                        //console.log('Regression query failed, HTTP Error');
                        this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);

                    });
        }

        public queryRegressionRegions() {

            this.toaster.pop('wait', "Querying regression regions with your Basin", "Please wait...", 0);
            //console.log('in load query regression regions');

            this.regressionRegionQueryLoading = true;
            this.regressionRegionQueryComplete = false;

            var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);

            //var url = configuration.baseurls['NodeServer'] + configuration.queryparams['RegressionRegionQueryService'];
            //var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, 'json', watershed);

            var url = configuration.baseurls['GISserver'] + configuration.queryparams['RegressionRegionQueryService'];
            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { geometry: watershed, f: 'json' },
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);          

            this.Execute(request).then(
                (response: any) => {
                    //console.log(response.data);
                    this.toaster.clear();
                    
                    //tests
                    //response.data.error = true;

                    if (response.data.error) {
                        //console.log('query error');
                        this.toaster.pop('error', "There was an error querying regression regions", response.data.error.message, 0);
                        return;
                    }

                    if (response.data.length == 0) {
                        //console.log('query error');
                        this.toaster.pop('error', "Regression region query failed", "This type of query may not be supported here at this time", 0);
                        return;
                    }

                    if (response.data.length > 0) {
                        //console.log('query success');
                        this.regressionRegionQueryComplete = true; 
                        response.data.forEach(p => { p.code = p.code.toUpperCase().split(",") });       
                        this.selectedStudyArea.RegressionRegions = response.data;
                        this.toaster.pop('success', "Regression regions were succcessfully queried", "Please continue", 5000);
                    }

                    //this.queryLandCover();

                },(error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return this.$q.reject(error.data);
                    
                }).finally(() => {
                    this.regressionRegionQueryLoading = false;
            });
        }

        public queryKarst(regionID: string, regionMapLayerList: any) {

            this.toaster.pop('wait', "Querying for Karst Areas", "Please wait...", 0);
            //console.log('in load query regression regions');

            //get layerID of exclude poly
            var layerID;
            regionMapLayerList.forEach((item) => {
                if (item[0] == 'ExcludePolys') layerID = item[1];
            });

            this.regressionRegionQueryLoading = true;
            this.regressionRegionQueryComplete = false;

            var watershed = '{"rings":' + angular.toJson(this.selectedStudyArea.Features[1].feature.features[0].geometry.coordinates, null) + ',"spatialReference":{"wkid":4326}}';
            var options = {
                where: '1=1',
                geometry: watershed,
                geometryType: 'esriGeometryPolygon',
                inSR: 4326,
                spatialRel: 'esriSpatialRelIntersects',
                outFields: '*',
                returnGeometry: false,
                outSR: 4326,
                returnIdsOnly: false,
                returnCountOnly: false,
                returnZ: false,
                returnM: false,
                returnDistinctValues: false,
                returnTrueCurves: false,
                f: 'json'
            }

            var url = configuration.baseurls.StreamStatsMapServices + configuration.queryparams.SSStateLayers + '/' + layerID + '/query';
            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(
                    url,
                    true,
                    WiM.Services.Helpers.methodType.POST,
                    'json',
                    options,
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform
                );

            this.Execute(request).then(
                (response: any) => {

                    this.toaster.clear();
                    if (response.status == 200) {
                        this.toaster.pop('success', "Karst regions were succcessfully queried", "Please continue", 5000);
                        var karstFound = false;

                        if (response.data.features.length > 0) {
                            response.data.features.forEach((exclusionArea) => {
                                if (exclusionArea.attributes.ExcludeCode == 2) {
                                    karstFound = true;
                                    this.toaster.pop("warning", "Warning", exclusionArea.attributes.ExcludeReason, 0);
                                    this.selectedStudyArea.Disclaimers['hasKarst'] = exclusionArea.attributes.ExcludeReason;
                                }
                            });
                            if (!karstFound) this.toaster.pop('success', "No Karst found", "Please continue", 5000);
                        }                       
                    }

                    else {
                        this.toaster.pop('error', "Error", "Karst region query failed", 0);
                    }

                    //this.queryLandCover();

                }, (error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.pop('error', "There was an HTTP error querying Regression regions", "Please retry", 0);
                    return this.$q.reject(error.data);

                }).finally(() => {
                    this.regressionRegionQueryLoading = false;
                });
        }

        public upstreamRegulation() {

            //console.log('upstream regulation');
            this.toaster.pop('wait', "Checking for Upstream Regulation", "Please wait...",0);

            this.regulationCheckComplete = false;

            var watershed = angular.toJson(this.selectedStudyArea.Features[1].feature, null);

            var url = configuration.baseurls['GISserver'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID);
            //CLOUD CHECK
            if (configuration.cloud) url = configuration.baseurls['GISserver'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID.toLowerCase());
            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST,
                    'json', { watershed: watershed, outputcrs: 4326, f: 'geojson' },
                    { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    WiM.Services.Helpers.paramsTransform);

            this.Execute(request).then(
                (response: any) => {
                    //add generic 'regulation has been checked' disclaimer
                    this.selectedStudyArea.Disclaimers['regulationChecked'] = true;  

                    if (response.data.percentarearegulated > 0) {
                        this.toaster.clear();
                        this.toaster.pop('success', "Map updated with Regulated Area", "Continue to 'Modify Basin Characteristics' to see area-weighted basin characteristics", 5000);
                        this.selectedStudyArea.Features.push(response.data["featurecollection"][0]);
                        this.regulationCheckResults = response.data;
                        //this.loadRegulatedParameterResults(this.regulationCheckResults.parameters);
                        this.selectedStudyArea.Disclaimers['isRegulated'] = true;     
                         
                        //COMMENT OUT ONSELECTEDSTUDYAREA changed event 3/11/16
                        this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);                    
                    }
                    else {
                        //alert("No regulation found");
                        this.selectedStudyArea.Disclaimers['isRegulated'] = false;
                        this.toaster.clear();
                        this.toaster.pop('warning', "No regulation found", "Please continue", 5000);
                        
                    }
                    //sm when complete
                },(error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop('error', "Error Checking for Upstream Regulation", "Please retry", 0);
                }).finally(() => {
                    //this.toaster.clear();
                    this.regulationCheckComplete = true;
                     

            });
        }

        
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-       
        private loadParameterResults(results: Array<WiM.Models.IParameter>) {

            //this.toaster.pop('wait', "Loading Basin Characteristics", "Please wait...", 0);
            //console.log('in load parameter results');

            var paramList = this.studyAreaParameterList;
            results.map(function (val) {
                angular.forEach(paramList, function (value, index) {
                    if (val.code.toUpperCase().trim() === value.code.toUpperCase().trim()) {
                        value.value = val.value;
                        value.loaded = val.loaded;
                        return;//exit loop
                    }//endif
                });
            });
            //console.log('params', this.studyAreaParameterList);
        }

        private loadRegulatedParameterResults(regulatedResults: Array<Models.IRegulationParameter>) {

            this.toaster.pop('wait', "Loading Regulated Basin Characteristics", "Please wait...");

            //console.log('in load regulated parameter results');

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

                                //console.log('regulated params: ', regulatedParam.code, totalSum, regulatedSum, regulatedValue, totalValue);
                                
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
                    else {
                    }
                });
            });
            //console.log('regulated params', this.studyAreaParameterList);
        }
        //EventHandlers Methods
        //-+-+-+-+-+-+-+-+-+-+-+- 
        private onStudyAreaChanged(sender: any, e: StudyAreaEventArgs) {
            //console.log('in onStudyAreaChanged');
            if (!this.selectedStudyArea || !this.selectedStudyArea.Features || this.regressionRegionQueryComplete) return;
            //this.queryRegressionRegions();
        }

    }//end class

    factory.$inject = ['$http', '$q', 'WiM.Event.EventManager', 'toaster'];
    function factory($http: ng.IHttpService, $q: ng.IQService, eventManager: WiM.Event.IEventManager, toaster:any) {
        return new StudyAreaService($http,$q, eventManager, toaster)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module