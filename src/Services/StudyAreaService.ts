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
    declare var turf;
    'use strict'
    export interface IStudyAreaService {
        onStudyAreaServiceBusyChanged: WiM.Event.Delegate<WiM.Event.EventArgs>;
        onQ10Loaded: WiM.Event.Delegate<WiM.Event.EventArgs>;
        selectedStudyArea: Models.IStudyArea;
        undoEdit();
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
        getAdditionalFeatureList();
        getAdditionalFeatures(featureString: string);
        surfacecontributionsonly: boolean
        getflattenStudyArea(): any
        simplify(Feature: any);
        selectedStudyAreaExtensions: Array<any>;
        doSelectMapGage: boolean;
        queryNWIS(point: any): void;
        GetKriggedReferenceGages(): void;
        NSSServicesVersion: string;
        doSelectNearestGage: boolean;
        selectGage(gage: any): void;
        getStreamgages(xmin: number, xmax: number, ymin: number, ymax: number);
        streamgageLayer: any;
        extensionDateRange: IDateRange;
        selectedGage: any;
        computeRegressionEquation(regtype: string);
        updateExtensions();
    }

    interface IDateRange {
        dates: {
            startDate: Date;
            endDate: Date;
        }
        minDate?: Date;
        maxDate?: Date;
    }

    export var onSelectedStudyAreaChanged: string = "onSelectedStudyAreaChanged";
    export var onSelectedStudyParametersLoaded: string = "onSelectedStudyParametersLoaded";
    export var onStudyAreaReset: string = "onStudyAreaReset";
    export var onEditClick: string = "onEditClick";
    //export var onQ10Loaded: string = "onQ10Loaded";
    export var onRegressionLoaded: string = "onRegressionLoaded";
    export class StudyAreaEventArgs extends WiM.Event.EventArgs {
        //properties
        public studyArea: StreamStats.Models.IStudyArea;
        public studyAreaVisible: boolean;
        public parameterLoaded: boolean;
        public additionalFeaturesLoaded: boolean;
        constructor(studyArea = null, saVisible = false, paramState = false, additionalFeatures = false) {
            super();
            this.studyArea = studyArea;
            this.studyAreaVisible = saVisible;
            this.parameterLoaded = paramState;
            this.additionalFeaturesLoaded = additionalFeatures;
        }

    }

    class StudyAreaService extends WiM.Services.HTTPServiceBase implements IStudyAreaService {
        //Events
        private _onStudyAreaServiceFinishedChanged: WiM.Event.Delegate<WiM.Event.EventArgs> = new WiM.Event.Delegate<WiM.Event.EventArgs>();
        public get onStudyAreaServiceBusyChanged(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onStudyAreaServiceFinishedChanged;
        }

        private _onQ10Loaded: WiM.Event.Delegate<WiM.Event.EventArgs>;
        public get onQ10Loaded(): WiM.Event.Delegate<WiM.Event.EventArgs> {
            return this._onQ10Loaded;
        }

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
        public get selectedStudyAreaExtensions(): Array<any> {
            if (this.selectedStudyArea == null) return null;
            else return this.selectedStudyArea.NSS_Extensions
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
        public surfacecontributionsonly: boolean = false;
        public doSelectMapGage: boolean = false;
        public doSelectNearestGage: boolean = false;
        //public requestParameterList: Array<any>; jkn
        private modalservices: IModalService;
        public NSSServicesVersion = '';
        public streamgageLayer: any;
        private parameterloadedEventHandler: WiM.Event.EventHandler<Services.StudyAreaEventArgs>;
        private statisticgroupEventHandler: WiM.Event.EventHandler<Services.NSSEventArgs>;
        private q10EventHandler: WiM.Event.EventHandler<Services.NSSEventArgs>;
        private regtype: string;
        
        //QPPQ
        public extensionDateRange: IDateRange = null;
        public selectedGage: any;

        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(public $http: ng.IHttpService, private $q: ng.IQService, private eventManager: WiM.Event.IEventManager, toaster, modal: Services.IModalService, private nssService: Services.InssService, private regionService: Services.IRegionService) {
            super($http, configuration.baseurls['StreamStatsServices'])
            this.modalservices = modal;

            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyParametersLoaded);
            eventManager.AddEvent<StudyAreaEventArgs>(onSelectedStudyAreaChanged);
            eventManager.AddEvent<StudyAreaEventArgs>(onStudyAreaReset);

            eventManager.SubscribeToEvent(onSelectedStudyAreaChanged, new WiM.Event.EventHandler<StudyAreaEventArgs>((sender: any, e: StudyAreaEventArgs) => {
                this.onStudyAreaChanged(sender, e);
            }));

            eventManager.SubscribeToEvent(onScenarioExtensionChanged, new WiM.Event.EventHandler<NSSEventArgs>((sender: any, e: NSSEventArgs) => {
                this.onNSSExtensionChanged(sender, e);
            }));

            eventManager.SubscribeToEvent(onScenarioExtensionResultsChanged, new WiM.Event.EventHandler<NSSEventArgs>((sender: any, e: NSSEventArgs) => {
                this.onNSSExtensionResultsChanged(sender, e);
            }));

            eventManager.AddEvent<WiM.Event.EventArgs>(onEditClick);
            this._studyAreaList = [];

            this.toaster = toaster;
            this.clearStudyArea();
            this.servicesURL = configuration.baseurls['StreamStatsServices'];
            this._onQ10Loaded = new WiM.Event.Delegate<WiM.Event.EventArgs>(); 
            this.parameterloadedEventHandler = new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                if(e != null && e.parameterLoaded) {                    
                    this.nssService.estimateFlows(this.studyAreaParameterList,"value", this.selectedStudyArea.RegionID, false, this.regtype, false);
                    this.onQ10Available();
                }
            })
            this.statisticgroupEventHandler = new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.eventManager.SubscribeToEvent(onSelectedStudyParametersLoaded, this.parameterloadedEventHandler)
                this.loadParameters();
                this.afterSelectedStatisticsGroupChanged();
            })
            this.q10EventHandler = new WiM.Event.EventHandler<Services.NSSEventArgs>((sender: any, e: Services.NSSEventArgs) => {
                this.afterQ10Loaded();
            })
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
            var regionID = this.selectedStudyArea.RegionID;
            
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSdelineation'].format('geojson', regionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                this.selectedStudyArea.Pourpoint.Latitude.toString(), this.selectedStudyArea.Pourpoint.crs.toString());

            //hack for st louis stormdrain
            if (this.selectedStudyArea.RegionID == 'MO_STL') {
                var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSstormwaterDelineation'].format(regionID, this.selectedStudyArea.Pourpoint.Longitude.toString(),
                    this.selectedStudyArea.Pourpoint.Latitude.toString(), this.surfacecontributionsonly);
            }

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            request.withCredentials = true;

            this.Execute(request).then(
                (response: any) => {  

                    //hack for st louis stormdrain
                    if (this.selectedStudyArea.RegionID == 'MO_STL') {
                        if (response.data.layers && response.data.layers.features && response.data.layers.features[1].geometry.coordinates.length > 0) {
                            this.selectedStudyArea.Disclaimers['isSTL_MO'] = true;
                            //this.selectedStudyArea.Server = response.headers()['x-usgswim-hostname'].toLowerCase();
                            var fc: GeoJSON.FeatureCollection = response.data.hasOwnProperty("layers") ? response.data["layers"] : null;
                            if (fc) fc.features.forEach(f => f.id = f.id.toString().toLowerCase());
                            this.selectedStudyArea.FeatureCollection = fc;
                            this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                            this.selectedStudyArea.Date = new Date();

                            this.toaster.clear();
                            this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
                            this.canUpdate = true;
                        }
                        else {
                            this.clearStudyArea();
                            this.toaster.clear();
                            this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                        }
                    }

                    //otherwise old method
                    else if (response.data.hasOwnProperty("featurecollection") && response.data.featurecollection[1] && response.data.featurecollection[1].feature.features.length > 0) {
                        this.selectedStudyArea.Server = response.headers()['usgswim-hostname'].toLowerCase();
                        this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;

                        //reconfigure response
                        this.selectedStudyArea.FeatureCollection = {
                            type: "FeatureCollection",
                            features: this.reconfigureWatershedResponse(response.data.featurecollection),
                            bbox: response.data.featurecollection.filter(f=>f.name == "globalwatershed")[0].feature.features[0].bbox
                        };

                        this.selectedStudyArea.Date = new Date();

                        this.toaster.clear();
                        this.eventManager.RaiseEvent(onSelectedStudyAreaChanged, this, StudyAreaEventArgs.Empty);
                        this.canUpdate = true;
                    }
                    else {
                        this.clearStudyArea();
                        this.toaster.clear();
                        this.toaster.pop("error", "A watershed was not returned from the delineation request", "Please retry", 0);
                    }

                    //clear properties
                    this.selectedStudyArea.FeatureCollection.features.forEach(f => f.properties = {});

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
                request.withCredentials = true;

                this.Execute(request).then(
                    (response: any) => {                        
                                               
                        this.selectedStudyArea.WorkspaceID = response.data.hasOwnProperty("workspaceID") ? response.data["workspaceID"] : null;
                        this.selectedStudyArea.Date = new Date();   
                        //reconfigure response
                        this.selectedStudyArea.FeatureCollection = {
                            type: "FeatureCollection",
                            features: this.reconfigureWatershedResponse(response.data.featurecollection),                       
                            bbox: response.data.featurecollection.filter(f => f.name == "globalwatershed")[0].feature.features[0].bbox
                        };

                        var pointFeature = response.data.featurecollection.filter(f => f.name == "globalwatershedpoint")[0].feature.features[0]
                        this.selectedStudyArea.Pourpoint = new WiM.Models.Point(pointFeature.bbox[1], pointFeature.bbox[0], pointFeature.crs.properties.code);                        
                        
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
            request.withCredentials = true;

            this.Execute(request).then(
                (response: any) => {
                    //create new study area                    
                    this.AddStudyArea(new Models.StudyArea(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint));

                    this.selectedStudyArea.FeatureCollection = {
                        type: "FeatureCollection",
                        features: this.reconfigureWatershedResponse(response.data.featurecollection),
                        bbox: response.data.featurecollection.filter(f => f.name.toLowerCase() == "globalwatershed")[0].feature.features[0].bbox
                    };
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
            if (requestParameterList.length == 0 && this.regionService.selectedRegion.Applications.indexOf('FDCTM') > -1) requestParameterList.push('drnarea');
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
            request.withCredentials = true;

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
                        this.getAdditionalFeatureList();                          

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

        public getAdditionalFeatureList() {

            //this.toaster.pop("wait", "Information", "Querying for additional features...", 0);
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSavailableFeatures'].format(this.selectedStudyArea.WorkspaceID);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            request.withCredentials = true;

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.featurecollection && response.data.featurecollection.length > 0) {
                        var features = [];
                        angular.forEach(response.data.featurecollection, (feature, index) => {
                            if (this.selectedStudyArea.FeatureCollection.features.map(f => { return f.id }).indexOf(feature.name) === -1){
                                features.push(feature.name)                               
                            }                            
                        });//next feature
                        this.getAdditionalFeatures(features.join(','));
                    }

                    //sm when complete
                }, (error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error requesting additional feautres list", "Please retry", 0);
                }).finally(() => {
                });
        }

        public getAdditionalFeatures(featureString: string) {
            if (!featureString) return;
            //console.log('downloading additional features...')
            var url = configuration.baseurls['StreamStatsServices'] + configuration.queryparams['SSfeatures'].format(this.selectedStudyArea.WorkspaceID, 4326, featureString);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true);
            request.withCredentials = true;

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.featurecollection && response.data.featurecollection.length > 0) {
                        this.toaster.clear();
                        //this.toaster.pop('success', "Additional features found", "Please continue", 5000);
                        //console.log('additional features:', response);

                        var features = this.reconfigureWatershedResponse(response.data.featurecollection);

                        angular.forEach(features, (feature, index) => {
                            //console.log('test', feature, index);
                            if (features.length < 1) {
                                //remove from studyarea array                                
                                for (var i = 0; i < this.selectedStudyArea.FeatureCollection.features.length; i++) {
                                    if ((<string>this.selectedStudyArea.FeatureCollection.features[i].id).toLowerCase() === (<string>feature.id).toLowerCase()) {
                                        this.selectedStudyArea.FeatureCollection.features.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            else {
                                this.selectedStudyArea.FeatureCollection.features.push(feature);                                
                            }

                            this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs(<string>feature.id, "geojson", { displayName: feature.id, imagesrc: null }, false));
                        });
                    }

                    //sm when complete
                }, (error) => {
                    //sm when error
                    this.toaster.clear();
                    this.toaster.pop("error", "There was an HTTP error getting additional features", "Please retry", 0);
                }).finally(() => {
                });
        }

        public queryLandCover() {

            this.toaster.pop('wait', "Querying Land Cover Data with your Basin", "Please wait...", 0);
            //console.log('querying land cover');

            var esriJSON = '{"geometryType":"esriGeometryPolygon","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polygon", "rings":[' + JSON.stringify((<any>this.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0].geometry).coordinates) + ']}}]}'
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
                var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['coordinatedReachQueryService']
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
            
            var headers = {
                "Content-Type": "application/json",
                "X-Is-StreamStats": true
            };
            var url = configuration.baseurls['NSS'] + configuration.queryparams['RegressionRegionQueryService'];
            var studyArea = this.simplify(angular.fromJson(angular.toJson(this.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0])));
            var studyAreaGeom = studyArea.geometry; //this.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0].geometry;
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.POST, "json", angular.toJson(studyAreaGeom), headers);     

            this.Execute(request).then(
                (response: any) => {
                    this.NSSServicesVersion = response.headers()['x-version'];
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
                        //Its possible to have a zero length response from the region query.  In the case probably should clear out nssRegion list in sidebarController ~line 103
                        this.regressionRegionQueryComplete = true; 
                        this.selectedStudyArea.RegressionRegions = response.data;
                        this.toaster.pop('error', "No regression regions were returned", "Regression based scenario computation not allowed", 0);
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

            var watershed = '{"rings":' + angular.toJson((<any>this.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" })[0].geometry).coordinates, null) + ',"spatialReference":{"wkid":4326}}';
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

        public queryNWIS(latlng: any) {
            if (!latlng || !latlng.lng || !latlng.lat) return;
            if (!this.selectedStudyAreaExtensions) return; 
            var sid: Array<any> = this.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []).filter(f => { return (<string>(f.code)).toLowerCase() == "sid" });
            if (sid.length < 0) return;

            var ppt = latlng;
            var ex = new L.Circle([ppt.lat, ppt.lng], 100).getBounds();
            //bBox=-103.767211,44.342474,-103.765657,44.343642
            var url = configuration.baseurls['NWISurl'] + configuration.queryparams['NWISsite']
                .format(ex.getWest().toFixed(7), ex.getSouth().toFixed(7), ex.getEast().toFixed(7), ex.getNorth().toFixed(7));

            var request: WiM.Services.Helpers.RequestInfo =
                new WiM.Services.Helpers.RequestInfo(url, true);

            this.Execute(request).then(
                (response: any) => {
                    if (response.data.error) {
                        //console.log('query error');
                        this.toaster.pop('error', "There was an error querying NWIS", response.data.error.message, 0);
                        return;
                    }

                    if (response.data) {
                        var siteList:Array<Models.IReferenceGage> = [];
                        var data = response.data.split('\n').filter(r => { return (!r.startsWith("#") && r != "") });
                        var headers:Array<string> = data.shift().split('\t');
                        //remove extra random line
                        data.shift();
                        do {
                            var station = data.shift().split('\t');
                            if (station[headers.indexOf("parm_cd")] == "00060") {
                                console.log(station[headers.indexOf("site_no")]);
                                //this.selectedStudyAreaExtensions
                                let rg = new Models.ReferenceGage(station[headers.indexOf("site_no")], station[headers.indexOf("station_nm")]);
                                rg.Latitude_DD = station[headers.indexOf("dec_lat_va")];
                                rg.Longitude_DD = station[headers.indexOf("dec_long_va")];                               
                                //add to list of reference gages
                                siteList.push(rg);
                            }
                        } while (data.length > 0);
                        if (siteList.length > 0) {                           
                            sid[0].options = siteList;
                            sid[0].value = siteList[0];

                            this.toaster.pop('success', "Found USGS NWIS reference gage", "Please continue", 5000);
                             //reopen modal
                            this.modalservices.openModal(SSModalType.e_extensionsupport);
                            this.doSelectMapGage = false;
                        }
                    }

                }, (error) => {
                    //sm when complete
                    //console.log('Regression query failed, HTTP Error');
                    this.toaster.pop('warning', "No USGS NWIS reference gage found at this location.",
                                        "Try zooming in closer or a different location", 5000);
                });
        }

        public selectGage(gage) {
            // selects gage and adds it to gage options for qppq
            // TODO: shoul we change this now that selecting a gage on the map only displays it in QPPQ, not selects it?
            var sid: Array<any> = this.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []).filter(f => { return (<string>(f.code)).toLowerCase() == "sid" });
            var siteList:Array<Models.IReferenceGage> = [];
            let rg = new Models.ReferenceGage(gage.properties.Code, gage.properties.Name);
            rg.Latitude_DD = gage.geometry.coordinates[0];
            rg.Longitude_DD = gage.geometry.coordinates[1];    
            rg.properties = gage.properties;
            //add to list of reference gages
            siteList.push(rg);

            if (siteList.length > 0) {                           
                sid[0].options = siteList;
                sid[0].value = new Models.ReferenceGage('', ''); // doesn't set as selected reference gage in case missing necessary properties
                //reopen modal
                this.modalservices.openModal(SSModalType.e_extensionsupport);
                this.doSelectNearestGage = false;
            }
        }

        public getStreamgages(xmin: number, xmax: number, ymin: number, ymax: number) {
            var url = configuration.baseurls.GageStatsServices + configuration.queryparams.GageStatsServicesBounds.format(xmin, xmax, ymin, ymax);
            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url, true, WiM.Services.Helpers.methodType.GET, 'json');

            this.Execute(request).then(
                (response: any) => {
                    this.streamgageLayer = response.data;

                }, (error) => {
                    //sm when error
                    // TODO: catch error
                });
        }

        public GetKriggedReferenceGages(): void {
            var url = configuration.queryparams['KrigService'].format(this.selectedStudyArea.RegionID, this.selectedStudyArea.Pourpoint.Longitude, this.selectedStudyArea.Pourpoint.Latitude, this.selectedStudyArea.Pourpoint.crs);

            if (!this.selectedStudyAreaExtensions) return;
            var sid: Array<any> = this.selectedStudyAreaExtensions.reduce((acc, val) => acc.concat(val.parameters), []).filter(f => { return (<string>(f.code)).toLowerCase() == "sid" });
            if (sid.length < 0) return;

            var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(url);
            this.Execute(request).then(
                (response: any) => {
                    var siteList: Array<Models.IReferenceGage> = [];
                    //console.log('delineation response headers: ', response.headers());                    
                    var result = response.data;
                    //sm when complete 
                    for (var i = 0; i < result.length; i++) {
                        var gage = new Models.ReferenceGage(result[i].id, result[i].name);
                        gage.DrainageArea_sqMI = result[i].drainageArea;
                        gage.correlation = result[i].correlation;
                        siteList.push(gage);
                    }//next i

                    if (siteList.length > 0) {
                        sid[0].options = siteList;
                        sid[0].value = siteList[0];

                        this.toaster.pop('success', "Found reference gages", "Please continue", 5000);
                    }

                }, (error) => {
                    this.toaster.pop('warning', "No reference gage found at this location.",
                        "Please try again", 5000);

                }).finally(() => {
                    this._onStudyAreaServiceFinishedChanged.raise(null, WiM.Event.EventArgs.Empty);
                });
        }

        public upstreamRegulation() {

            //console.log('upstream regulation');
            this.toaster.pop('wait', "Checking for Upstream Regulation", "Please wait...",0);

            this.regulationCheckComplete = false;

            var watershed = angular.toJson(
                {
                    type: "FeatureCollection",
                    crs: { type: "ESPG", properties: { code: 4326 } },
                    features: this.selectedStudyArea.FeatureCollection.features.filter(f => { return (<string>(f.id)).toLowerCase() == "globalwatershed" }),
                }
                , null);

            var url = configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['regulationService'].format(this.selectedStudyArea.RegionID.toLowerCase());
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

                        var features = this.reconfigureWatershedResponse(response.data["featurecollection"])

                        this.selectedStudyArea.FeatureCollection.features.push(features[0]);
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

        public getflattenStudyArea(): any
        {
            var result: GeoJSON.FeatureCollection = null;
            try {
                var result = this.selectedStudyArea.FeatureCollection
                result.features.forEach(f => {
                    f.properties["Name"] = this.selectedStudyArea.WorkspaceID;
                    if (f.id && f.id == "globalwatershed") {
                        f.properties = [f.properties, this.studyAreaParameterList.reduce((dict, param) => { dict[param.code] = param.value; return dict; }, {})].reduce(function (r, o) {
                            Object.keys(o).forEach(function (k) { r[k] = o[k]; });
                            return r;
                        }, {});
                    }//endif
                });
            }
            catch (e) {
                result = null;
                console.log('Failed to flatted shapefile.')
                }
            return result;
        }

        public simplify(feature: any): any {
            var tolerance = 0;
            try {
                var verticies = feature.geometry.coordinates.reduce((count, row) => count + row.length, 0);
                
                if (verticies < 5000) {
                    // no need to simpify
                    return feature;
                }
                else if (verticies < 10000) {
                    tolerance = 0.0001;
                }
                else if (verticies < 100000) {
                    tolerance = 0.001
                }
                else {
                    tolerance = 0.01
                }
                this.toaster.pop('warning', "Displaying simplified Basin.", "See FAQ for more information.", 0);
                return turf.simplify(feature, { tolerance: tolerance, highQuality: false, mutate: true })

            } catch (e) {

            }
        }

        public computeRegressionEquation(regtype: string) {
            this.regtype = regtype;
            this.onSelectedStatisticsGroupChanged();
            this.nssService.loadParametersByStatisticsGroup(this.selectedStudyArea.RegionID, "", "GC1449, GC1450", [], regtype);            
        }
        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+- 
        private reconfigureWatershedResponse(watershedResponse: Array<any>): Array<GeoJSON.Feature>
        {
            var featureArray: Array<GeoJSON.Feature> =[];
            watershedResponse.forEach(fc => {
                for (var i =0;i<fc.feature.features.length;i++)
                {
                    var feature: GeoJSON.Feature = {
                        type: "Feature",
                        geometry: fc.feature.features[i].geometry,
                        id: fc.feature.features.length > 1 && fc.feature.features[i].properties && fc.feature.features[i].properties["Name"] ? fc.name + "_" + fc.feature.features[i].properties["Name"].toLowerCase() : fc.name.toLowerCase(),
                        properties: fc.feature.features[i].properties
                    }; 
                    featureArray.push(feature);
                }//next i
            });    
            return featureArray;
        }
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
            if (!this.selectedStudyArea || !this.selectedStudyArea.FeatureCollection || this.regressionRegionQueryComplete) return;
            //this.queryRegressionRegions();
        }
        private onNSSExtensionChanged(sender: any, e: NSSEventArgs) {
            console.log('onNSSExtensionChanged');
            e.extensions.forEach(f => {
                if (this.selectedStudyArea.NSS_Extensions.indexOf(f) == -1)
                    this.selectedStudyArea.NSS_Extensions.push(f);
            });
        }
        private onNSSExtensionResultsChanged(sender: any, e: NSSEventArgs) {
            
            e.results.forEach(ex => {

                var item = this.selectedStudyArea.NSS_Extensions.filter(f => f.code == ex.code);
                if (item.length < 1) return;
                //should only be 1
                item[0].parameters = angular.copy(ex.parameters);
                item[0].result = angular.copy(ex.result);
            });
        }

        private afterSelectedStatisticsGroupChanged() {
            this.nssService.onSelectedStatisticsGroupChanged.unsubscribe(this.statisticgroupEventHandler)
        }
        private onSelectedStatisticsGroupChanged() {
            this.nssService.onSelectedStatisticsGroupChanged.subscribe(this.statisticgroupEventHandler)
            
        }

        private onQ10Available(): void {
            this.nssService.onQ10Loaded.subscribe(this.q10EventHandler)
        }

        private afterQ10Loaded() {
            this.selectedStudyArea.wateruseQ10 = this.nssService.selectedStatisticsGroupList[0].regressionRegions[0].results[0].value;
            this._onQ10Loaded.raise(null, WiM.Event.EventArgs.Empty);
            this.eventManager.UnSubscribeToEvent(onSelectedStudyParametersLoaded, this.parameterloadedEventHandler);
            this.nssService.selectedStatisticsGroupList = [];
            this.nssService.onQ10Loaded.unsubscribe(this.q10EventHandler);
        }

        public updateExtensions() {
            // update extensions in nss service when updated after regression calculation
            this.nssService.statisticsGroupList.forEach(sg => {
                if (sg.regressionRegions)
                    sg.regressionRegions.forEach(rr => {
                        if (rr.extensions) {
                            rr.extensions = this.selectedStudyAreaExtensions;
                        }
                    });
            })
        }

    }//end class

    factory.$inject = ['$http', '$q', 'WiM.Event.EventManager', 'toaster', 'StreamStats.Services.ModalService', 'StreamStats.Services.nssService', 'StreamStats.Services.RegionService'];
    function factory($http: ng.IHttpService, $q: ng.IQService, eventManager: WiM.Event.IEventManager, toaster: any, modalService: Services.IModalService, nssService: Services.InssService, regionService: Services.IRegionService) {
        return new StudyAreaService($http,$q, eventManager, toaster, modalService, nssService, regionService)
    }
    angular.module('StreamStats.Services')
        .factory('StreamStats.Services.StudyAreaService', factory)
}//end module