//------------------------------------------------------------------------------
//----- MapController ----------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   Controllers are typically built to reflect a View. 
//              and should only contailn business logic needed for a single view. For example, if a View 
//              contains a ListBox of objects, a Selected object, and a Save button, the Controller 
//              will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//04.15.2015 jkn - Created

//Imports
module StreamStats.Controllers {

    declare var turf;
    declare var ga;

    'use strict';
    interface ILeafletData {
        getMap(mapID:any): ng.IPromise<any>;
        getLayers(mapID:any): ng.IPromise<any>;
    }
    interface ICenter {
        lat: number;
        lng: number;
        zoom: number;
    }
    interface IBounds {
        southWest: IMapPoint;
        northEast: IMapPoint;
    }
    interface IMapPoint {
        lat: number;
        lng: number;
    }
    interface IMapLayers {
        baselayers: Object;
        overlays: ILayer;
        //markers: Object;
        //geojson: Object;
    }
    interface ILayer {
        name: string;
        url: string;
        type: string;
        visible: boolean;
        layerOptions: Object;
    }
    interface IMapDefault {
        maxZoom: number;
        zoomControl: boolean;
        minZoom: number;
    }
    interface IMapController {
        center: ICenter;
        layers: IMapLayers;
        controls: Object;
        markers: Object;
        paths: Object;
        bounds: Object;
        geojson: Object;
        layercontrol: Object;

    }
    interface IMapControllerScope extends ng.IScope {
        vm: MapController;
    }

    interface IMapControllerCompile extends ng.ICompileService {
        vm: MapController;
    }


    class MapPoint implements IMapPoint {
        lat: number;
        lng: number;
        constructor() {
            this.lat = 0;
            this.lng = 0;
        }
    }
    class Center implements ICenter {
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        public lat: number;
        public lng: number;
        public zoom: number;
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        constructor(lt: number, lg: number, zm: number) {
            this.lat = lt;
            this.lng = lg;
            this.zoom = zm;
        }
    }
    class Layer implements ILayer {
        public name: string;
        public url: string;
        public type: string;
        public visible: boolean;
        public layerOptions: Object;

        public constructor(nm: string, ul: string, ty: string, vis: boolean, op: Object = undefined) {
            this.name = nm;
            this.url = ul;
            this.type = ty;
            this.visible = vis;
            this.layerOptions = op;

        }
    }
    class MapDefault implements IMapDefault {
        public maxZoom: number;
        public zoomControl: boolean;
        public minZoom: number;

        constructor(mxZm: number = null, mnZm: number = null, zmCtrl: boolean = true) {
            this.maxZoom = mxZm;
            this.minZoom = mnZm;
            this.zoomControl = zmCtrl;
        }
    }

    class MapController extends WiM.Services.HTTPServiceBase implements IMapController {
        //Events
        //-+-+-+-+-+-+-+-+-+-+-+-
        //Properties
        //-+-+-+-+-+-+-+-+-+-+-+-
        private regionServices: Services.IRegionService;
        private searchService: WiM.Services.ISearchAPIService;
        private leafletBoundsHelperService: any;
        private $locationService: ng.ILocationService;
        private leafletData: ILeafletData;
        private studyArea: Services.IStudyAreaService;
        private nssService: Services.InssService;
        private explorationService: Services.IExplorationService;
        private eventManager: WiM.Event.IEventManager;
        private queryContent: { requestCount: number, Content: any, responseCount:number };

        public cursorStyle: string;
        public center: ICenter = null;
        public layers: IMapLayers = null;
        public mapDefaults: IMapDefault = null;
        public mapPoint: IMapPoint = null;
        public bounds: IBounds = null;

        public controls: any;
        public markers: Object = null;
        public paths: Object = null;
        public geojson: Object = null;
        public events: Object = null;
        public layercontrol: Object = null;
        public regionLayer: Object = null;
        public drawControl: any;
        public toaster: any;
        public angulartics: any;
        public nomnimalZoomLevel: string;
        public get selectedExplorationMethodType(): Services.ExplorationMethodType {
            if (this.explorationService.selectedMethod == null) return 0;
            return this.explorationService.selectedMethod.navigationID;
        }
        public set selectedExplorationMethodType(val: Services.ExplorationMethodType) {  
            this.explorationService.setMethod(val, {});
        }

        private _prosperIsActive: boolean = false;
        public get ProsperIsActive(): boolean {
            return this._prosperIsActive;
        }
        //public explorationMethodBusy: boolean = false;
        private environment: string;
        public explorationToolsExpanded: boolean = false;
        public measuremove: any;
        public measurestart: any;
        public measurestop: any;
        public selectedExplorationTool: any;
        public gageLegendFix = false;
        public regionLegendFix = false;
        public nonsimplifiedBasin: any;
        public nonsimplifiedBasinStyle = {
            //https://www.base64-image.de/
            displayName: "Non-Simplified Basin",
            imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANkAAADJCAYAAACuaJftAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKsSURBVHhe7dwxbsJAEEBRkyPQU3L/A1HScwWCFEuRkEDB7I+t5L2Grei+lmEs7643E5D5mD+BiMggJjKIiQxiIoOYyCD2a3/hXw7H+QTbsz+f5tN4bjKIiQxiIoPYsJnMzMV/8soM5yaDmMggJjKILZ7JzGDw7dmM5iaDmMggJjKIiQxiIoOYyCAmMoj9eE9mLwaP2ZPBikQGMZFBzLOLMICZDFYkMoiJDGIig5jIICYyiIkMYvZksID3LsKGiAxiIoOYmQwG8OwirEhkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnEvOMDFvDeRdgQkUFMZBAzkz3wym9ueMZNBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQExnERAYxkUFMZBATGcREBjGRQUxkEBMZxEQGMZFBTGQQ211v5vNbLofjfPob9ufTfIL3uMkgJjKIiQxiIoOYyCAmMoiJDGLD9mT3Ru/N7vdW9ffDKG4yiIkMYiKDWDaTAV/cZBATGcREBjGRQUxkEBMZxEQGMZFBTGSQmqZPLJhZUkx8RY8AAAAASUVORK5CYII=",
            fillColor: "red",
            weight: 2,
            opacity: 1,
            color: 'red',
            fillOpacity: 0.5
        }
        public imageryToggled = false;
        public additionalHTML: string = ''; 
        //Constructor
        //-+-+-+-+-+-+-+-+-+-+-+-
        static $inject = ['$scope', '$compile', 'toaster', '$analytics', '$location', '$stateParams','leafletBoundsHelpers', 'leafletData', 'WiM.Services.SearchAPIService', 'StreamStats.Services.RegionService', 'StreamStats.Services.StudyAreaService', 'StreamStats.Services.nssService', 'StreamStats.Services.ExplorationService', 'StreamStats.Services.ProsperService', 'WiM.Event.EventManager', 'StreamStats.Services.ModalService', '$modalStack', '$http'];
        constructor(public $scope: IMapControllerScope, public $compile: IMapControllerCompile, toaster, $analytics, $location: ng.ILocationService, $stateParams, leafletBoundsHelper: any, leafletData: ILeafletData, search: WiM.Services.ISearchAPIService, region: Services.IRegionService, studyArea: Services.IStudyAreaService, StatisticsGroup: Services.InssService, exploration: Services.IExplorationService, private _prosperServices: Services.IProsperService, eventManager: WiM.Event.IEventManager, private modal: Services.IModalService, private modalStack: ng.ui.bootstrap.IModalStackService, $http: ng.IHttpService) {
            super($http, configuration.baseurls.StreamStats);
            $scope.vm = this;
            
            this.toaster = toaster;
            this.angulartics = $analytics;
            this.searchService = search;
            this.$locationService = $location;
            this.regionServices = region;
            this.leafletBoundsHelperService = leafletBoundsHelper;
            this.leafletData = leafletData;
            this.studyArea = studyArea;
            this.nssService = StatisticsGroup;
            this.explorationService = exploration;
            this.eventManager = eventManager;
            this.cursorStyle = 'pointer';
            this.environment = configuration.environment;
            this.selectedExplorationTool = null;

            this.init();

            //subscribe to Events
            this.eventManager.SubscribeToEvent(Services.onSelectedStudyAreaChanged, new WiM.Event.EventHandler<Services.StudyAreaEventArgs>(() => {
                this.onSelectedStudyAreaChanged();
            }));
            this.eventManager.SubscribeToEvent(WiM.Directives.onLayerChanged, new WiM.Event.EventHandler<WiM.Directives.LegendLayerChangedEventArgs>((sender, e) => {
                this.onLayerChanged(sender,e);
            }));
            this.eventManager.SubscribeToEvent(WiM.Services.onSelectedAreaOfInterestChanged, new WiM.Event.EventHandler<WiM.Event.EventArgs>((sender: any, e: WiM.Services.SearchAPIEventArgs) => {
                this.onSelectedAreaOfInterestChanged(sender, e);
            }));
            this.eventManager.SubscribeToEvent( Services.onSelectedRegionChanged, new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.onSelectedRegionChanged();
            }));
            this.eventManager.SubscribeToEvent(Services.onEditClick, new WiM.Event.EventHandler<Services.StudyAreaEventArgs>((sender: any, e: Services.StudyAreaEventArgs) => {
                this.basinEditor();
            }));
            
            this.eventManager.SubscribeToEvent(Services.onStudyAreaReset, new WiM.Event.EventHandler<WiM.Event.EventArgs>(() => {
                this.removeGeoJson();
            }));

            this.eventManager.SubscribeToEvent(Services.onSelectedMethodExecuteComplete, new WiM.Event.EventHandler<Services.ExplorationServiceEventArgs>((sender: any, e: Services.ExplorationServiceEventArgs) => {
                this.onExplorationMethodComplete(sender,e);
            }));

            this.eventManager.SubscribeToEvent(Services.onSelectExplorationMethod, new WiM.Event.EventHandler<Services.ExplorationServiceEventArgs>((sender: any, e: Services.ExplorationServiceEventArgs) => {
                if (sender.selectedMethod.navigationID != 0) this.onSelectExplorationMethod(sender, e);
                if (sender.selectedMethod.navigationID == 0) this.selectedExplorationTool = null;
            }));
            

            $scope.$on('leafletDirectiveMap.mainMap.mousemove',(event, args) => {
                var latlng = args.leafletEvent.latlng;
                this.mapPoint.lat = latlng.lat;
                this.mapPoint.lng = latlng.lng;
                //change cursor after delienate button click
                if (this.studyArea.doDelineateFlag) this.cursorStyle = 'crosshair';
            });

            $scope.$on('leafletDirectiveMap.mainMap.drag',(event, args) => {
                this.cursorStyle = 'grabbing';
            });

            $scope.$on('leafletDirectiveMap.mainMap.dragend',(event, args) => {
                this.cursorStyle = 'pointer';
            });

            $scope.$on('leafletDirectiveMap.mainMap.click', (event, args) => {

                //console.log('test',this.explorationService.drawElevationProfile)

                //listen for click
                if (this._prosperServices.CanQuery) {
                    this._prosperServices.GetPredictionValues(args.leafletEvent, this.bounds)
                    return;
                }

                if (this.studyArea.doDelineateFlag) {
                    this.checkDelineatePoint(args.leafletEvent.latlng);
                    return;
                }
                

                //check if in edit mode
                if (this.studyArea.showEditToolbar) return;

                //check if in measurement mode
                if (this.explorationService.drawMeasurement) return; 

                //check if in elevation profile mode
                if (this.explorationService.drawElevationProfile) return; 
                if (this.studyArea.doSelectMapGage) {
                    this.studyArea.queryNWIS(args.leafletEvent.latlng);
                    return;
                }
                //network navigation
                if (exploration.selectedMethod != null && exploration.selectedMethod.locations.length <= exploration.selectedMethod.minLocations) {

                    console.log('in mapcontroller add point', exploration.selectedMethod.navigationPointCount, exploration.selectedMethod.locations.length)

                    //add point
                    if (exploration.explorationPointType == 'Start point location') exploration.selectedMethod.addLocation('Start point location', new WiM.Models.Point(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, '4326'));
                    if (exploration.explorationPointType == 'End point location') exploration.selectedMethod.addLocation('End point location', new WiM.Models.Point(args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng, '4326'));

                    //add temporary marker to map
                    for (var i: number = 0; i < exploration.selectedMethod.locations.length; i++) {
                        var item = exploration.selectedMethod.locations[i];
                        this.markers['netnav_' + i] = {
                            lat: item.Latitude,
                            lng: item.Longitude,
                            message: exploration.selectedMethod.navigationName,
                            focus: true,
                            draggable: false
                        };
                    }//next i

                    this.modal.openModal(Services.SSModalType.e_exploration);
                }
                //query streamgage is default map click action
                else {
                    this.queryPoints(args.leafletEvent);
                }
            });

            $scope.$watch(() => this.bounds,(newval, oldval) => this.mapBoundsChange(oldval, newval));

            $scope.$watch(() => this.explorationService.elevationProfileGeoJSON, (newval, oldval) => {
                if (newval) this.displayElevationProfile()
            });

            $scope.$watch(() => this.explorationService.drawElevationProfile,(newval, oldval) => {
                if (newval) {
                    this.modal.openModal(Services.SSModalType.e_exploration);
                }
            });

            $scope.$watch(() => this.explorationService.selectElevationPoints, (newval, oldval) => {
                if (newval) this.elevationProfile();
            });        

            $scope.$watch(() => this.explorationService.drawMeasurement,(newval, oldval) => {
                //console.log('measurementListener ', newval, oldval);
                if (newval) this.measurement();
            });

            $scope.$watch(() => this.regionServices.regionMapLayerListLoaded,(newval, oldval) => {
                if (newval) {
                    //console.log('in regionMapLayerListLoaded watch: ', this.regionServices.selectedRegion);
                    this.addRegionOverlayLayers(this.regionServices.selectedRegion.RegionID);
                }
            });

            $scope.$watch(() => this._prosperServices.DisplayedPrediction, (newval, oldval) => {
                if (newval && this.ProsperIsActive) {   
                    this.removeOverlayLayers("prosper",true)
                    this.AddProsperLayer(newval.id);
                }
            });


            //$scope.$watch(() => this.explorationService.selectedMethod, (newval, oldval) => {
            //    if (newval) {
            //        console.log('watch selectedMethod', newval);
            //        if (newval.navigationID == 0) this.resetExplorationTools();
            //    }
            //});

            $scope.$on('$locationChangeStart',() => this.updateRegion());

            // check if region was explicitly set.
            if ($stateParams.rcode) {
                this.regionServices.loadParametersByRegion();
                this.setBoundsByRegion($stateParams.rcode);
            }
            if ($stateParams.rcode && $stateParams.workspaceID) {
                this.regionServices.loadParametersByRegion();
                this.studyArea.loadWatershed($stateParams.rcode, $stateParams.workspaceID);
            }

            //watch for result of regressionregion query
            $scope.$watch(() => this.studyArea.regressionRegionQueryComplete,(newval, oldval) => {
                //join codes from regression region object list and run query
                if (newval && this.studyArea.selectedStudyArea.RegressionRegions) this.nssService.loadStatisticsGroupTypes(this.regionServices.selectedRegion.RegionID, this.studyArea.selectedStudyArea.RegressionRegions.map(function (elem) {
                    return elem.code;
                }).join(","));
            });

            //watch for streamgages layer
            $scope.$watch(() => this.studyArea.streamgageLayer, (newval, oldval) => {
                if (newval != oldval) {
                    this.addGeoJSON('streamgages', newval)
                }
            })
        }

        //Methods
        //-+-+-+-+-+-+-+-+-+-+-+-


        public setExplorationMethodType(val: number) {
           
            //check if can select
            this.removeGeoJsonLayers("netnav_",true);

            //get this configuration
            this.explorationService.getNavigationConfiguration(val);

        }

        public ExecuteNav(): void {
            //validate request
            if (this.explorationService.selectedMethod.locations.length != this.explorationService.selectedMethod.minLocations) {
                this.toaster.pop("warning", "Warning", "You must select at least " + this.explorationService.selectedMethod.minLocations + " points.", 10000);
                return;
            }
            var isOK:boolean = false;

            this.explorationService.explorationMethodBusy = true;

            this.explorationService.ExecuteSelectedModel();
        }

        public ToggleProsper(): void {
            if (this._prosperIsActive) {
                this._prosperIsActive = false;
                this._prosperServices.CanQuery = false;
                this.removeOverlayLayers("prosper",true)
            }
            else {
                this._prosperIsActive = true;
                //add prosper maplayers
                this.AddProsperLayer(this._prosperServices.DisplayedPrediction.id);
                this.ConfigureProsper();
            }//end if
        }
        public ConfigureProsper(): void {
            this.modal.openModal(Services.SSModalType.e_prosper);
            //check if this bounds is outside of project bound, if so set proj extent
            //this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this._prosperServices.projectExtent);
        }
        public openGagePage(siteid: string): void {
            console.log('gage page id:', siteid)
            this.modal.openModal(Services.SSModalType.e_gagepage, { 'siteid':siteid });
        }


        //Helper Methods
        //-+-+-+-+-+-+-+-+-+-+-+-
        private init(): void { 

            this.setupMap();
            //console.log('in map init')
            this.explorationService.getNavigationEndPoints();
        }

        public setupMap() {
      
            this.center = new Center(39, -100, 4);
            this.layers = {
                baselayers: configuration.basemaps,
                overlays: configuration.overlayedLayers
            }
            this.mapDefaults = new MapDefault(null, 3, true);
            this.markers = {};
            this.paths = {};
            this.geojson = {};
            this.regionLayer = {};

            //for elevation div
            var width = 600;
            if ($(window).width() < 768) width = $(window).width() * 0.7;
            this.controls = {
                scale: true,
                draw: {
                    draw: {
                        polygon: false,
                        polyline: false,
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false
                    }
                },
                custom:
                new Array(
                    (<any>L.control).locate({ follow: false, locateOptions: { "maxZoom": 15 } }),
                    (<any>L.control).elevation({ imperial: true, width: width })
                )
            };
            this.events = {
                map: {
                    enable: ['mousemove']
                }
            }
            this.mapPoint = new MapPoint();
            L.Icon.Default.imagePath = 'images';
        }

        public scaleLookup(mapZoom: number) {
            switch (mapZoom) {
                case 19: return '1,128'
                case 18: return '2,256'
                case 17: return '4,513'
                case 16: return '9,027'
                case 15: return '18,055'
                case 14: return '36,111'
                case 13: return '72,223'
                case 12: return '144,447'
                case 11: return '288,895'
                case 10: return '577,790'
                case 9: return '1,155,581'
                case 8: return '2,311,162'
                case 7: return '4,622,324'
                case 6: return '9,244,649'
                case 5: return '18,489,298'
                case 4: return '36,978,596'
                case 3: return '73,957,193'
                case 2: return '147,914,387'
                case 1: return '295,828,775'
                case 0: return '591,657,550'
            }
        }

        private queryPoints(evt) {

            //console.log('in query regional layers');
            this.toaster.pop("wait", "Information", "Querying Points...", 0);
            this.cursorStyle = 'wait';
            this.markers = {};        

            this.leafletData.getMap("mainMap").then((map: any) => {
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {

                    //check to make sure layer is visible
                    if (map.getZoom() <= 8) {
                        this.cursorStyle = 'pointer';
                        this.toaster.clear();
                        this.toaster.pop("warning", "Warning", "You must be at Zoom Level 9 or greater to query points", 5000);
                        return;
                    }  
                    this.queryContent = { requestCount:0, Content:$("<div>").attr("id", 'popupContent'),responseCount:0}
                                                                              
                    for (let lyr in maplayers.overlays) {
                        if (!maplayers.overlays.hasOwnProperty(lyr)) continue;
                        //skip these layers
                        if (["MaskLayer", "draw"].indexOf(lyr) > -1) continue;
                        //visible Layers only
                        if (!map.hasLayer(maplayers.overlays[lyr])) continue;

                        switch (this.layers.overlays[lyr].type) {
                            case "agsFeature":
                                //query
                                maplayers.overlays[lyr].query().nearby(evt.latlng, 4).returnGeometry(false).run((error: any, results: any) => this.handleQueryResult(lyr, error, results, map, evt.latlng))
                                break;
                            default://agsDynamic
                                var saveLayerName = lyr; // need to save layer name, or it sometimes doesn't send the correct layer in the handleQueryResult function
                                maplayers.overlays[lyr].identify().on(map).at(evt.latlng).returnGeometry(false).tolerance(5).run((error: any, results: any) => this.handleQueryResult(saveLayerName, error, results, map, evt.latlng))
                                
                        }
                        this.queryContent.requestCount++;        
                    }//next lyr
                });
            });
        }
        private handleQueryResult(lyr: string, error: any, results: any, map:any, latlng:any) {
            var querylayers = $("<div>").attr("id", lyr).appendTo(this.queryContent.Content);
            this.queryContent.requestCount--;
            results.features.forEach((queryResult) => {
                if (this.layers.overlays[lyr].hasOwnProperty('layerArray')) {
                    this.layers.overlays[lyr].layerArray.forEach((item) => {
                        if (item.layerId !== queryResult.layerId) return;
                        if (["StreamGrid", "ExcludePolys", "Region", "Subregion", "Basin", "Subbasin", "Watershed", "Subwatershed"].indexOf(item.layerName) > -1) return;                
                        querylayers.append('<h5>' + item.layerName + '</h5>');
                        this.queryContent.responseCount++;
                        //report ga event
                        this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'queryPoints' });
    
                        //show only specified fields (if applicable)
                        if (this.layers.overlays[lyr].hasOwnProperty("queryProperties") && this.layers.overlays[lyr].queryProperties.hasOwnProperty(item.layerName)) {      
                            let queryProperties = this.layers.overlays[lyr].queryProperties[item.layerName];
                            Object.keys(queryProperties).map(k => {
                                if (item.layerName == "Streamgages" && k == "FeatureURL") {
                                    var siteNo = queryResult.properties[k].split('site_no=')[1];
                                    var SSgagepage = "vm.openGagePage('" + siteNo + "')";
                                    var urls = ['https://streamstatsags.cr.usgs.gov/NC_gagePages/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-wateryears.txt',
                                    'https://streamstatsags.cr.usgs.gov/NC_gagePages/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-day-month-seasonal.txt',
                                    'https://streamstatsags.cr.usgs.gov/IA_gagePages/' + siteNo + '_stats.pdf'];
                                    var text = ['Flow-Duration Statistics by Water Years:',
                                    'Flow-Duration Statistics by Period of Record, Calendar Day & Month, & Seasonal Periods:',
                                    'Stream Flow Statistics:'];
                                    
                                    var html = '<strong>NWIS page: </strong><a href="' + queryResult.properties[k] + ' "target="_blank">link</a></br><strong>StreamStats Gage Page: </strong><a ng-click="' + SSgagepage + '">link</a></br>';
                                    this.additionalLinkCheck(urls.length-1, urls, '', text);
                                    setTimeout(() => {
                                        html = html + this.additionalHTML;
                                        querylayers.append(html);
                                    },700)
                                    this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'streamgageQuery' });
                                }
                                else {
                                    querylayers.append('<strong>' + queryProperties[k] + ': </strong>' + queryResult.properties[k] + '</br>');
                                }
                            });
                        }
                        else {//show all fields
                            angular.forEach(queryResult.properties, function (value, key) {
                                querylayers.append('<strong>' + key + ': </strong>' + value + '</br>');
                            });
                        }
                    });
                }
            });

            if (this.queryContent.requestCount < 1) {
                this.toaster.clear();
                this.cursorStyle = 'pointer';
                if (this.queryContent.responseCount > 0) {

                    var html = this.queryContent.Content.html();
                    var compiledHtml = this.$compile(html)(this.$scope);

                    var compiledHtmlIndex = 0;
                    compiledHtml.toArray().forEach( function (htmlElement, index) {
                        if (htmlElement.innerHTML.length > 0) {
                            compiledHtmlIndex = index;
                        }
                    });
                    map.openPopup(compiledHtml[compiledHtmlIndex], [latlng.lat, latlng.lng], { maxHeight: 200 });
                }
                else {
                    this.toaster.pop("warning", "Information", "No points were found at this location", 5000);
                }
            }
            
        }
        private elevationProfile() {

            document.getElementById('measurement-div').innerHTML = '';
            this.explorationService.measurementData = '';
            this.explorationService.showElevationChart = true;

            var el;

            //get reference to elevation control
            this.controls.custom.forEach((control) => {
                if (control._container.className.indexOf("elevation") > -1) el = control;
            });

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'elevationProfile' });

            this.leafletData.getMap("mainMap").then((map: any) => {
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();

                    this.drawController({ metric: false }, true);

                    delete this.geojson['elevationProfileLine3D'];

                    map.on('draw:drawstart',(e) => {
                        //console.log('in draw start');
                        el.clear();
                    });

                    //listen for end of draw
                    map.on('draw:created',(e) => {

                        map.removeEventListener('draw:created');

                        var feature = e.layer.toGeoJSON();
			
                        //convert to esriJSON
                        var esriJSON = '{"geometryType":"esriGeometryPolyline","spatialReference":{"wkid":"4326"},"fields": [],"features":[{"geometry": {"type":"polyline", "paths":[' + JSON.stringify(feature.geometry.coordinates) + ']}}]}'

                        //make the request
                        this.toaster.pop("wait", "Information", "Querying the elevation service...", 0);
                        this.explorationService.elevationProfile(esriJSON)

                        //disable button 
                        this.explorationService.drawElevationProfile = false;

                        //force map refresh
                        map.panBy([0, 1]);

                    }); 
                });
            });
        }

        private drawController(options: Object, enable: boolean) {
            //console.log('in drawcontroller: ', options, enable);

            if (!enable) {               
                this.drawControl.disable();
                this.drawControl = undefined;
                //console.log('removing drawControl', this.drawControl);
                return;
            }
            this.leafletData.getMap("mainMap").then((map: any) => {
                //console.log('enable drawControl');
                this.drawControl = new (<any>L).Draw.Polyline(map, options);
                this.drawControl.enable();
            });
        }

        private displayElevationProfile() {

            //get reference to elevation control
            var el;
            this.controls.custom.forEach((control) => {
                if (control._container && control._container.className.indexOf("elevation") > -1) el = control;
            });

            //parse it
            this.geojson["elevationProfileLine3D"] = {
                data: this.explorationService.elevationProfileGeoJSON,
                style: {
                    "color": "#ff7800",
                    "weight": 5,
                    "opacity": 0.65
                },
                onEachFeature: el.addData.bind(el)
            }

            this.leafletData.getMap("mainMap").then((map: any) => {
                var container = el.onAdd(map);

                this.explorationService.elevationProfileHTML = container.innerHTML;
                this.modal.openModal(Services.SSModalType.e_exploration);

                 //delete line
                delete this.geojson['elevationProfileLine3D'];

            });

            this.toaster.clear();
            this.cursorStyle = 'pointer';
            this.selectedExplorationTool = null;
        }

        private showLocation() {

            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'showLocation' });

            //get reference to location control
            var lc;
            this.controls.custom.forEach((control) => {
                if (control._container.className.indexOf("leaflet-control-locate") > -1) lc = control; 
            });
            lc.start();

            this.leafletData.getMap("mainMap").then((map: any) => {
                map.on('locationfound', () => { this.selectedExplorationTool = null });
            });

        }

        private resetExplorationTools() {
            document.getElementById('measurement-div').innerHTML = '';
            this.explorationService.elevationProfileHTML = '';
            if (this.drawControl) this.drawController({ }, false);
            this.explorationService.measurementData = '';

            this.explorationService.drawElevationProfile = false;
            this.explorationService.drawMeasurement = false;
            this.explorationService.selectElevationPoints = false;

            delete this.geojson['elevationProfileLine3D'];
            this.leafletData.getMap("mainMap").then((map: any) => {
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();

                     //remove listeners
                    if (this.measurestart) map.off("click", this.measurestart);
                    if (this.measuremove) map.off("mousemove", this.measuremove);
                    if (this.measurestop) map.off("draw:created", this.measurestop);
                });
            });

            this.explorationService.networkNavResults = [];
            this.selectedExplorationMethodType = 0;
            this.removeMarkerLayers("netnav_", true);
            this.removeGeoJsonLayers("netnavpoints", true);
            this.removeGeoJsonLayers("netnavroute", true);

            this.selectedExplorationTool = null;
            this.explorationService.explorationPointType = null;
        }

        private measurement() {

            //user affordance
            this.explorationService.measurementData = 'Click the map to begin\nDouble click to end the Drawing';

            //report ga event
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'measurement' });

            this.leafletData.getMap("mainMap").then((map: any) => {
                //console.log('got map: ', map);
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {
                    //console.log('got maplayers: ', maplayers);
                    var stopclick = false; //to prevent more than one click listener

                    this.drawController({shapeOptions: { color: 'blue' }, metric: false }, true);

                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();
			
                    //listeners active during drawing
                    this.measuremove = () => {
                        this.explorationService.measurementData = "Total length: " + this.drawControl._getMeasurementString();
                    };
                    this.measurestart = () => {
                        if (stopclick == false) {
                            stopclick = true;
                            this.explorationService.measurementData = "Total Length: ";
                            map.on("mousemove", this.measuremove);
                        };
                    };

                    this.measurestop = (e) => {
                        var layer = e.layer;
                        drawnItems.addLayer(layer);
                        drawnItems.addTo(map);

                        // Calculating the distance of the polyline, internal funciton '_getMeasurementString' doesn't work on mobile
                        var tempLatLng = null;
                        var totalDistance = 0.00000;
                        $.each(e.layer._latlngs, function (i, latlng) {
                            if (tempLatLng == null) {
                                tempLatLng = latlng;
                                return;
                            }

                            totalDistance += tempLatLng.distanceTo(latlng);
                            tempLatLng = latlng;
                        });

                        //reset button
                        this.explorationService.measurementData = "Total length: " + (totalDistance * 3.28084).toFixed(0) + " ft";
       
                        //remove listeners
                        map.off("click", this.measurestart);
                        map.off("mousemove", this.measuremove);
                        map.off("draw:created", this.measurestop);

                        this.drawControl.disable();
                        this.explorationService.drawMeasurement = false;
                        this.selectedExplorationTool = null;
                    };

                    map.on("click", this.measurestart);
                    map.on("draw:created", this.measurestop);

                });
            });
        }

        private checkDelineatePoint(latlng) {

            //make sure were still at level 15 or greater
            this.leafletData.getMap("mainMap").then((map: any) => {
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {
                    if (map.getZoom() < 15) {
                        this.toaster.pop("error", "Delineation not allowed at this zoom level", 'Please zoom in to level 15 or greater', 5000);
                    }

                    //good to go
                    else {
                        this.toaster.clear();
                        this.studyArea.checkingDelineatedPoint = true;

                        this.toaster.pop("info", "Information", "Validating your clicked point...", true, 0);
                        this.cursorStyle = 'wait';
                        this.markers = {};

                        //put pourpoint on the map
                        this.markers['pourpoint'] = {
                            lat: latlng.lat,
                            lng: latlng.lng,
                            message: 'Your clicked point</br></br><strong>Latitude: </strong>' + latlng.lat.toFixed(5) + '</br><strong>Longitude: </strong>' + latlng.lng.toFixed(5),
                            focus: true,
                            draggable: true
                        }

                        //turn off delineate flag
                        this.studyArea.doDelineateFlag = false;

                        //build list of layers to query before delineate
                        var queryString = 'visible:'

                        this.regionServices.regionMapLayerList.forEach((item) => {
                            if (item[0] == 'ExcludePolys') queryString += item[1];
                        });

                        this.angulartics.eventTrack('delineationClick', { category: 'Map', label: this.regionServices.selectedRegion.Name });

                        //force map refresh
                        map.invalidateSize();

                        var selectedRegionLayerName = this.regionServices.selectedRegion.RegionID + "_region";

                        //if there are no map layers to query, skip with warning
                        if (queryString === 'visible:') {
                            this.toaster.clear();
                            this.toaster.pop("warning", "Selected State/Region does not have exlusion areas defined", "Delineating with no exclude polygon layer...", true, 0);
                            this.startDelineate(latlng, true);
                            this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not advised (no point query)' });
                            this.cursorStyle = 'pointer';
                            return;
                        }
                        // Get name of exclude poly layer
                        var layerName;
                        for(var layer in maplayers.overlays) {
                            for(var llayer in this.layers.overlays){
                                if(llayer === layer && this.layers.overlays[llayer].layerArray !== undefined && this.layers.overlays[llayer].layerArray[0].layerName === 'ExcludePolys'){
                                    layerName = layer;
                                }
                            }
                        };
                        //do point validation query
                        maplayers.overlays[layerName].identify().on(map).at(latlng).returnGeometry(false).layers(queryString).run((error: any, results: any) => {
                            //console.log('exclusion area check: ', queryString, results); 
                            this.toaster.clear();

                            //if there are no exclusion area hits
                            if (results.features.length == 0) {
                                //ga event
                                this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'valid' });

                                this.toaster.pop("success", "Your clicked point is valid", "Delineating your basin now...", 5000)
                                this.studyArea.checkingDelineatedPoint = false;

                                this.startDelineate(latlng, false);
                            }

                            //otherwise parse exclude Codes
                            else {
                                this.studyArea.checkingDelineatedPoint = false;
                                var excludeCode = results.features[0].properties.ExcludeCod;
                                var popupMsg = results.features[0].properties.ExcludeRea;
                                if (excludeCode == 1) {
                                    this.toaster.pop("error", "Delineation and flow statistic computation not allowed here", popupMsg, 0);
                                    //ga event
                                    this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not allowed' });
                                }
                                else {
                                    this.toaster.pop("warning", "Delineation and flow statistic computation possible but not advised", popupMsg, true, 0);
                                    this.startDelineate(latlng, true, popupMsg);
                                    this.angulartics.eventTrack('validatePoint', { category: 'Map', label: 'not advised' });
                                }
                            }

                            this.cursorStyle = 'pointer';
                        });
                    }
                });
            });
        }

        private basinEditor() {

            this.leafletData.getMap("mainMap").then((map: any) => {
                this.leafletData.getLayers("mainMap").then((maplayers: any) => {

                    //create draw control
                    var drawnItems = maplayers.overlays.draw;
                    drawnItems.clearLayers();
                    var drawControl = new (<any>L).Draw.Polygon(map, drawnItems);
                    drawControl.enable();

                    //listen for end of draw
                    map.on('draw:created', (e) => {

                        //turn off the listener, we now have a shape
                        map.removeEventListener('draw:created');

                        //convert edit item into geoJSON so we can temporarily store it
                        var editLayer = e.layer;
                        drawnItems.addLayer(editLayer);
                        var clipPolygon = editLayer.toGeoJSON();

                        //console.log('finish draw:', clipPolygon)
                        
                        if (this.studyArea.drawControlOption == 'add') {

                            if (this.checkEditIntersects('adds', clipPolygon)) {
                                this.toaster.pop("warning", "Warning", "Overlapping add and remove edit areas are not allowed", 5000);
                            }

                            else{
                                this.addGeoJSON('adds', clipPolygon);
                                this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'addArea' });
                                this.studyArea.WatershedEditDecisionList.append.push(clipPolygon);
                            }

                        }

                        if (this.studyArea.drawControlOption == 'remove') {

                            if (this.checkEditIntersects('removes', clipPolygon)) {
                                this.toaster.pop("warning", "Warning", "Overlapping add and remove edit areas are not allowed", 5000);
                            }

                            else{
                                this.addGeoJSON('removes', clipPolygon);
                                this.angulartics.eventTrack('basinEditor', { category: 'Map', label: 'removeArea' });
                                this.studyArea.WatershedEditDecisionList.remove.push(clipPolygon);
                            }

                        }

                        drawnItems.clearLayers();
                    });
                });
            });
        }

        private checkEditIntersects(editType, editPolygon){

            var found = false;
            var oppositeEditType;

            (editType === 'adds') ? oppositeEditType = 'removes': oppositeEditType = 'adds';

            //console.log('checking edit intersections:', editType, oppositeEditType)

            //first check if we have both adds and removes we need to check for intersections
            if (this.geojson.hasOwnProperty(oppositeEditType)) {

                //check for intersections
                this.geojson[oppositeEditType].data.features.forEach(function(layer){
                    var intersection = turf.intersect(editPolygon, layer);
                    if(intersection!=undefined){
                        found = true;
                    }
                });
            }

            return found;
        }
        
        private canSelectExplorationTool(methodval: Services.ExplorationMethodType): boolean {            
            switch (methodval) {
                case Services.ExplorationMethodType.NETWORKPATH:
                    //if (this.regionServices.selectedRegion == null) {
                    //    this.toaster.pop("warning", "Warning", "you must first select a state or region to use this tool", 5000);
                    //    return false;
                    //}
                    //if (this.center.zoom < 10) {
                    //    this.toaster.pop("warning", "Warning", "you must be zoomed into at least a zoomlevel of 10 to use this tool", 5000);
                    //    return false;
                    //}
                    break;
                case Services.ExplorationMethodType.FLOWPATH:
                    //if (this.regionServices.selectedRegion == null) {
                    //    this.toaster.pop("warning", "Warning", "you must first select a state or region to use this tool", 5000);
                    //    return false;
                    //}
                    //if (this.center.zoom < 10) {
                    //    this.toaster.pop("warning", "Warning", "you must be zoomed into at least a zoomlevel of 10 to use this tool", 5000);
                    //    return false;
                    //}
                    break;
                case Services.ExplorationMethodType.NETWORKTRACE:
                    //if (this.regionServices.selectedRegion == null) {
                    //    this.toaster.pop("warning", "Warning", "you must first select a state or region to use this tool", 5000);
                    //    return false;
                    //}
                    //if (this.center.zoom < 10) {
                    //    this.toaster.pop("warning", "Warning", "you must be zoomed into at least a zoomlevel of 10 to use this tool", 5000);
                    //    return false;
                    //}
                    break;
                default:
                    return false;
            }//end switch

            return true;
        }
        private onExplorationMethodComplete(sender: any, e: Services.ExplorationServiceEventArgs) {
            this.angulartics.eventTrack('explorationTools', { category: 'Map', label: 'networknav-' + this.explorationService.selectedMethod.navigationInfo.code });

            //console.log('in onexplorationmethodCOmplete:', this.explorationService.selectedMethod.navigationInfo.code)
            this.explorationService.explorationMethodBusy = false;
            if (e.features != null && e.features['features'].length > 0) {
                //console.log('exploration method complete', e)

                this.removeMarkerLayers("netnav_", true);

                this.explorationService.networkNavResults.forEach((layer, key)=> {

                    this.addGeoJSON(layer.name, layer.feature); 

                    //zoomTo logic
                    if (layer.name == "netnavroute") {
                        this.leafletData.getMap("mainMap").then((map: any) => {
                            var tempExtent = L.geoJson(layer.feature);
                            map.fitBounds(tempExtent.getBounds());
                        });
                    }

                    this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs(layer.name, "geojson", this.geojson[layer.name].style));
                });      

                //disable tool
                this.selectedExplorationMethodType = 0;
                this.selectedExplorationTool = null;
                this.modalStack.dismissAll();

            }//end if
            if (e.report != null && e.report != '') {          
                this.modal.openModal(Services.SSModalType.e_navreport, { placeholder:e.report});
            }//end if
        }

        private onSelectExplorationMethod(sender: any, e: Services.ExplorationServiceEventArgs) {
            this.modal.openModal(Services.SSModalType.e_exploration);
        }

        private onSelectedAreaOfInterestChanged(sender: any, e: WiM.Services.SearchAPIEventArgs) {

            //ga event
            this.angulartics.eventTrack('Search', { category: 'Sidebar' });

            this.paths = {};
            var AOI = e.selectedAreaOfInterest;

            this.paths['AOI'] = {
                type: "circleMarker",
                radius: 15,
                color: '#ff0000',
                fillOpacity: 0.6,
                stroke: false,
                latlngs: {
                    lat: AOI.properties['Lat'],
                    lng: AOI.properties['Lon'],
                }
            }

            this.leafletData.getMap("mainMap").then((map: any) => {

                map.fitBounds([ // zoom to location
                    [AOI.properties['LatMin'], AOI.properties['LonMin']],
                    [AOI.properties['LatMax'], AOI.properties['LonMax']]
                ])

                //force level 8
                setTimeout(() => {
                    if (map.getZoom() < 8) map.setZoom(8);
                }, 500);

                map.openPopup(  // open popup at location listing all properties
                    $.map(Object.keys(AOI.properties), function (property) {
                        if (["Label", "ElevFt", "Lat", "Lon", "Source"].indexOf(property) !=0 -1) return "<b>" + property + ": </b>" + AOI.properties[property];
                    }).join("<br/>"),
                    [AOI.properties['Lat'], AOI.properties['Lon']]
                    );
            });
        }

        private onSelectedRegionChanged() {
            if (!this.regionServices.selectedRegion) return;
            this.removeOverlayLayers("_region", true);

            // toggle the imagery layer if a localres or stormdrain state is selected
            if (this.studyArea.zoomLevel15 && !this.imageryToggled && this.regionServices.selectedRegion.Applications.some(a => ['StormDrain', 'Localres'].indexOf(a) > -1)) this.toggleImageryLayer();

            this.regionServices.loadMapLayersByRegion(this.regionServices.selectedRegion.RegionID)
        }
       
        private onSelectedStudyAreaChanged() {
            var bbox: GeoJSON.BBox;
            //console.log('in onselectedstudyareachange1', this.studyArea.selectedStudyArea.Features)

            if (!this.studyArea.selectedStudyArea || !this.studyArea.selectedStudyArea.FeatureCollection) return;

            //clear out this.markers
            this.markers = {};

            this.removeOverlayLayers('globalwatershed', true);

            this.studyArea.selectedStudyArea.FeatureCollection['features'].forEach((layer) => {

                var item = angular.fromJson(angular.toJson(layer));
                var name = item.id.toLowerCase();
                this.addGeoJSON(name, item);
                this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs(name, "geojson", this.geojson[name].style));
            });
            //zoom to bounding box
            if (this.studyArea.selectedStudyArea.FeatureCollection['bbox']) {
                bbox = this.studyArea.selectedStudyArea.FeatureCollection['bbox'];
                this.leafletData.getMap("mainMap").then((map: any) => {
                    map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                    });
                });
            }            
            
            //query basin against Karst
            if (this.regionServices.selectedRegion.Applications.indexOf("KarstCheck") > -1) {
                this.studyArea.queryKarst(this.regionServices.selectedRegion.RegionID, this.regionServices.regionMapLayerList);
            }

            //query basin against regression regions
            if (!this.nssService.queriedRegions) {

                //return if this state is not enabled
                if (!this.regionServices.selectedRegion.ScenariosAvailable) {
                    this.studyArea.regressionRegionQueryComplete = true;
                    return;
                }

                this.nssService.queriedRegions = true;
                //console.log('set queriedregions flag to true: ', this.nssService.queriedRegions);
            }
            
        }

        private AddProsperLayer( id:number) {
            this.layers.overlays["prosper"+id] = new Layer("Prosper Layer", configuration.baseurls['ScienceBase'] + configuration.queryparams['ProsperPredictions'],
                "agsDynamic", true, {
                    "opacity": 1,
                    "layers": [id],
                    "format": "png8",
                    "f": "image"
                });
        }
        
        private removeGeoJson(layerName: string = "") {
            // TODO: None of these are getting removed from the legend when this is run
            // remove non-simplified basin
            if (this.geojson['nonsimplifiedbasin'] == undefined && this.nonsimplifiedBasin != undefined) {
                this.eventManager.RaiseEvent(WiM.Directives.onLayerRemoved, this, new WiM.Directives.LegendLayerRemovedEventArgs('nonsimplifiedbasin', "geojson"));
                this.nonsimplifiedBasin = undefined;
            }

            for (var k in this.geojson) {
                if (typeof this.geojson[k] !== 'function' && (k != 'streamgages' || k == layerName)) {
                    delete this.geojson[k];
                    this.eventManager.RaiseEvent(WiM.Directives.onLayerRemoved, this, new WiM.Directives.LegendLayerRemovedEventArgs(k, "geojson")); 
                }
            }
        }

        private addGeoJSON(LayerName: string, feature: any) {
            if (LayerName == 'globalwatershed') {
                var verticies = feature.geometry.coordinates.reduce((count, row) => count + row.length, 0);
                var data = this.studyArea.simplify(angular.copy(feature));
                var data_verticies = data.geometry.coordinates.reduce((count, row) => count + row.length, 0);
                this.geojson[LayerName] =
                {
                    data: data,
                    style: {
                        //https://www.base64-image.de/
                        displayName: "Basin Boundary",
                        imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADCCAYAAAC/i6XiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKOSURBVHhe7dxBjoJAEEBRcO/9D+oBlElYTEwmE7XlI763kS2Ln0qlsefrYgIyp/UXiIgQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGL7+GztMq8PEDi3CZiEEBMhxEQIsW12QjsfRzJ4hzQJISZCiIkQYu/ZCe2AfJMXd0STEGIihJgIISZCiIkQYiKEmAghNuac0Lkg38w5IXw2EUJMhBATIcRECDERQkyEEBMhxEQIMRFCTIQQ8+0oPMq9o3AsIoSYCCFmJ4RX+T8hfDYRQkyEEBMhxEQIMRFCTIQQEyHERAgxEUJMhBATIcRECDERQkyEEBMhxEQIMRFCTIQQc8cMPMq9o3AsIoSYCCFmJ4R7g3e+/5iEEBMhxEQIMTvhj413APjNJISYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIiRBiIoSYCCEmQoiJEGIihJgIISZCiIkQYiKEmAghJkKIzdfF+jzOZV4fduo8/pXhWSYhxEQIMRFCTIQQEyHERAgxEULsPeeE9+pzQ+eC7JhJCDERQkyEENtmJwT+ZBJCTISQmqYb05tLRBeJJLsAAAAASUVORK5CYII=",
                        fillColor: "yellow",
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.5
                    }
                }
                // add non-simplified basin but default to off
                if (verticies != data_verticies) {
                    this.nonsimplifiedBasin = feature;
                    this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs('nonsimplifiedbasin', "geojson", this.nonsimplifiedBasinStyle, false));
                }
            }
            else if (LayerName == 'nonsimplifiedbasin') {
                this.geojson[LayerName] = {
                    data: feature,
                    style: this.nonsimplifiedBasinStyle
                };
            }
            else if (LayerName == 'globalwatershedpoint') {
                var lat = this.studyArea.selectedStudyArea.Pourpoint.Latitude;
                var lng = this.studyArea.selectedStudyArea.Pourpoint.Longitude;
                var rcode = this.studyArea.selectedStudyArea.RegionID;
                var workspaceID = this.studyArea.selectedStudyArea.WorkspaceID;

                this.geojson[LayerName] = {
                    data: feature,
                    onEachFeature: function (feature, layer) {
                        var popupContent = '<strong>Latitude: </strong>' + lat + '</br><strong>Longitude: </strong>' + lng + '</br><strong>Region: </strong>' + rcode + '</br><strong>WorkspaceID: </strong>' + workspaceID + '</br>';
                        angular.forEach(feature.properties, function (value, key) {
                            popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                        });
                        layer.bindPopup(popupContent);
                    },
                    style: {
                        displayName: "Basin Clicked Point",
                        imagesrc: "data:image/png;base64,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",
                        visible: true
                    }
                }
            }
            else if (LayerName == 'regulatedwatershed') {
                this.geojson[LayerName] =
                    {
                        data: feature,
                        style: {
                            //https://www.base64-image.de/
                            displayName: "Basin Boundary (Regulated Area)",
                            imagesrc: "data:image/png;base64,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",
                            fillColor: "red",
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.5
                        }
                    }
            }
            else if (LayerName.indexOf('netnavpoints') != -1)  {

                this.geojson[LayerName] = {
                    data: feature,
                    onEachFeature: function (feature, layer) {

                        var popupContent = '<strong>Network navigation start/end point</strong></br>';
                        angular.forEach(feature.properties, function (value, key) {
                            popupContent += '<strong>' + key + ': </strong>' + value + '</br>';
                        });
                        layer.bindPopup(popupContent);
                    },
                    pointToLayer: function (feature, latlng) {

                        //default class
                        var classname = "wmm-pin wmm-mutedblue wmm-icon-noicon wmm-icon-black wmm-size-25";

                        if (feature.properties.source == 'ss_gages') classname = "wmm-pin wmm-blue wmm-icon-triangle wmm-icon-black wmm-size-25";
                        if (feature.properties.source == 'WQP') classname = "wmm-pin wmm-sky wmm-icon-square wmm-icon-black wmm-size-25";

                        var myIcon = L.divIcon({
                            className: classname,
                        });

                        return L.marker(latlng, { icon: myIcon });
                    },
                    style: {
                        displayName: "Network navigation point",
                        imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAlCAYAAAC+uuLPAAAACXBIWXMAAA7EAAAOxAGVKw4bAAA57GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTgtMDEtMzBUMTU6NTk6NDgtMDU6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0wMS0zMVQxMTowMDoyMC0wNTowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTgtMDEtMzFUMTE6MDA6MjAtMDU6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6M2FkNDgxMTctYjA3Mi05NjQ4LTk5MmYtZmIyZTgzNTcwOTkxPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDZiMzhiZmUtMDY5Zi0xMWU4LTk2OTAtOGIzNWZmM2I1YzJjPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NDQ0OTVjNjYtY2JjZS04ZDQyLWFhYmUtYjJmZTM4MjRmYWI3PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjQ0NDk1YzY2LWNiY2UtOGQ0Mi1hYWJlLWIyZmUzODI0ZmFiNzwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOC0wMS0zMFQxNTo1OTo0OC0wNTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDozYWQ0ODExNy1iMDcyLTk2NDgtOTkyZi1mYjJlODM1NzA5OTE8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDEtMzFUMTE6MDA6MjAtMDU6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj45NjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjk2MDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mjk8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzc8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pj4hpkQAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAA2xJREFUeNrs181rI3Ucx/H3b2YyD8mkMZslSZOsaVfsXpaFlYLg3jwvgl4XRVGPXZ8FRawXQQVXlD3pQegee+tfIQiFZV1auw9tau3zQ9KkM5OZyfw81JV1aZNMCiq43/Mwr9985/f9zG+ElJJ/uhT+hfr/oFq/F07PzMj7tWU2t7dwHBdVU0nbaYbzea6++YaIg4peG+n7qSk5e+sX6o0GrucRBAGdKEIIgaqq6IkESctiuJDnufFxXrp8WZwI/fSLL+XthQUOHIdei9M0jbSd4pnz5/lwYkIMhL4/OSkX7i/S9n2EomAPDZErFknZaSzbJooimvU6rUaDxu4OTrMJgGWajF+4wCfvvStioR9Mfibn7t0lCEIM06JYrVKqjmBYJqqqoagqSEkYhnQ6Ic5+k5XFe2yurBBFEaZh8OzFi3z8ztuiL/Tza9/In2Zn8YOAoewpqmPnyBUK6IYB4ujFR1FE23VYW66xfOcOvueRtCyev3SJiSM22d9G5sb0tPz55k38ICBp25RGRsmXy+imeSwIoCgKVsqmVB2lNDKKoig4rsut+fnec3p7fh7X89ASCU4XhymcqaBqfU8VhmWRL5XJ5vMArK6v89X167IrenepBoCdyZCvVDAMM9bQCyEYymYpVs6gmyZBGLK6vtH9SVsHBwAk7TSZ3OmuLT221apKKpPBzmQAqO83uqNSSrREAjOZRFXVgWMukdAxTAsAx3F7Z6+iqmha4kTZqmoaCV0HIOiEvVEpJVEUnTDS5V8JpiB6o6Hv0/bcE5GBH+D/eQ/d0LujQgiklATtNr7nDYy2PZeDZutwElKp7uhw4XC+9vf22FpbHQj0220aOzs4rcMszj2R7Y6OnX0KANc5YGPlNxq7O/HeZBSxt7XJ+nKNqNNhKG3z9NnR7uhHb10VpWIRGUXUt3dYq9VitblZr7O6tITTOmxttVLh9StXRF9fmRdffU06rotumpRHRqmOnTvM3y61v7fL4twc2+trdMKQJ8tlfrj2dX9fmQf1wsuvyLbv9wU/CpYKBX787lsR+2A2c2NKGLqO73n8vrRIbeHXI1sdF+x5GuwFDwL2dTA7rtWe6wwE9o0+CmdO5QDY3dyIDcZCH4YVVUUAnU4nNhgbfRgGBgIHQh/AuWx2IHBg9PFf22P0P4H+MQCyncndp+2ZGQAAAABJRU5ErkJggg==",
                        visible: true
                    }
                }
            }
            else if (LayerName == 'netnavroute') {

                this.geojson[LayerName] =
                    {
                        data: feature,
                        visible: true,
                        style: {
                            displayName: "Network navigation route",
                            imagesrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVaSURBVGhDzZr5VxpXFMf7n7ZpkqZLmqbRaIxaEzWyzIjghhtuQBQNuKMii0vSnqZb2qZNm66iwfavuL33jVbEOzBvmBn44XOOHD3P+TD3vXu/MG95MsdQL3h38rDgjsLu9fvw9O07hll6MAb9Sz9eWKuuxGaCSch8+IC9eD1Stx7B4OK3l9aqGzHf+q+w2jYM++82sQIcB+80QNSfAF/yt0vr1Y1Y1B+H7I12vOCGSwJ6rLX0w+CT78CbPrq0Xl2IBR9/CVt3vHgHGlkBjtyNNpiYzIGS+ptds+ZivZt/QOLhBOxdvccK6DGvzEEfli+3JlFzsdmhtdMDw3gJbjaqMBz7Ckswz65J1FSM9keyySdVgntXm2FqdBvUrb/YNc+omZiSOoTFnlnYvdbCCugR75qEwPJP7JrF1EwsFMrCzsfdcCBRgvT3I5HPRSPn1iymJmL+lZ9h7f4A7F+5ywpwHFxphPDAqjhsuDVLcVyMes68GoPce62sgB4r2LwH4t+Dh+lZHI6LjYafwfZtt9SBkX2/Hcan98S+5NbkcFSsN/k7LHeM4tjUzAroMYd32Lf+ml1TD0fFwgMrkP3gM7xY4wfGRlMfDC18w45N5XBMbCj2NSSxscqU4O71FpicSIOyXb5ncTgiRhcW756CvWtyY9OiKwz+1VfsmpVwRGxqLAXpm514scZLkA4YGo6N9CwO28UCyy9h/V5AqmfR384Mb+DYZKxncdgqRhs+5n0Mu5I9a6njNOpLHhjF2Co2PrMPqU96RNLlBDjSHz2EsdmnWILGexaHbWIU9VfarYv6stgmJqI+TgxWRX1ZbBELzmHUb5CL+rQPaeLXi/qyWC6mbv0JiU75qB/zRKFv7Rd2TTNYLkafDdIBIBX1GxQYnn9eNurLYqnYQPwFbDT3YXYy3rMo6k+Pbok7za1pFsvEzEb9RGfIUNSXxTKx0CRG/VtyUZ/GrNHIs6p7FoclYv61Vxj1B6WjfqR/WWQ0bs1qsURsrndBfDLLCeix2jYkFfVlqVqMPjXa+tT+qC9LVWJORn1ZqhIzF/V9pqK+LKbF6OJMRf3xHVBNRH1ZTInRPPeke9rRqC+LKTF613duduHFGi/B7duuqqJ+Ke5TPJk3oGQ1vIg7ewyuzJG8mIj6GC9MRX2DH09XgoRcaeINvi6AmjsReHMFcKFYdzYvJ2Y26tPJWW3UL0aICXixLlmxMYz626ai/gEoFo9NWimSGJVhAcuwIH4m4UcypejbeI1RP1izqM+jiXlwbwkpUZ7H0IO/MywWCSzhxCDXs9ZbAjC4aE3UL8WLJSfAn8/3nAbdSUNiwbnnIgzWMuqXoqCUKsSOUCYPPfjmCSk8ULzpQmUxLeqHah71S1FQSM0eoVge99WZGJYkSqnpfyqLTY9sSkd9embD6qhfiiaWPxfD19rdOoHe9L/lxfoTP2DU98tHfXwzrI76FzlCsTyoyLkY7S08HfFulRWjSLHgjkg/iaZF/ZfsmtahiSkZaiGHQoz6F/U0pZIYPc5DT5ZJ9SyK+mF7ov5FcG9hmStp/D+Im8qQxLCXKRkS09ljFPVXWynqy/Qse6P+RbB9oJjYw8iZGDVpJYtTCO4zVsxU1G+lqP/CsrGpIvh/NDGUotdiCCYxumtMHxuJfoFR3yPVsyjqT0zt2tazWETPopNQa8hi+vifksmDHg6hx1DpZOME9HAi6hejzYnnU8bZaEXl6Mbe5i4dgrUn0TrwYo0fGMm7veKLc7ujfjFnA7AGDb/aACxkUcyVKxITUR8vUqYEaRqh75ediPrFaGIF5ARfY1zBacOLzVmI4UHSkzuE/wDtg18mgH26LgAAAABJRU5ErkJggg==",
                            color: 'red'
                        }
                    }
            }
            else if (LayerName == 'adds') {

                //if it already exists just add the polygon
                if (this.geojson.hasOwnProperty(LayerName)) {
                    this.geojson[LayerName].data.features.push(feature);
                }
        
                else {
                    this.geojson[LayerName] =
                    {
                        data: {
                            "type": "FeatureCollection",
                            "features": [feature]
                        },
                        visible: true,
                        style: {
                            displayName: LayerName,
                            fillColor: "green",
                            color: 'green'
                        }                 
                    }
                }

            }
            else if (LayerName == 'removes') {

                //if it already exists just add the polygon
                if (this.geojson.hasOwnProperty(LayerName)) {
                    this.geojson[LayerName].data.features.push(feature);
                }
        
                else {
                    this.geojson[LayerName] =
                    {
                        data: {
                            "type": "FeatureCollection",
                            "features": [feature]
                        },
                        visible: true,
                        style: {
                            displayName: LayerName,
                            fillColor: "red",
                            color: 'red'
                        }                 
                    }
                } 
            }
            else if (LayerName == 'streamgages') {
                var self = this;
                this.geojson['streamgages'] = {
                    name: 'Streamgages',
                    type: 'geoJSONShape',
                    data: feature,
                    visible: true,
                    style: {
                        displayName: 'Streamgages'
                    },
                    onEachFeature: function (feature, layer) {
                        var siteNo = feature.properties['Code'];
                        var urls = ['https://streamstatsags.cr.usgs.gov/NC_gagePages/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-wateryears.txt',
                        'https://streamstatsags.cr.usgs.gov/NC_gagePages/Sta_' + siteNo + '_daily_discharge_percentiles_table_by-day-month-seasonal.txt',
                        'https://streamstatsags.cr.usgs.gov/IA_gagePages/' + siteNo + '_stats.pdf'];
                        var text = ['Flow-Duration Statistics by Water Years:',
                        'Flow-Duration Statistics by Period of Record, Calendar Day & Month, & Seasonal Periods:',
                        'Stream Flow Statistics:'];
                        var NWISpage = 'http://nwis.waterdata.usgs.gov/nwis/inventory/?site_no=' + siteNo;
                        var gageButtonDiv = L.DomUtil.create('div', 'innerDiv');
                        var gageButtonLoaderDiv = L.DomUtil.create('div', 'innerDiv');

                        
                        gageButtonLoaderDiv.innerHTML = '<i class="fa fa-spinner fa-3x fa-spin loadingSpinner"></i>';

                        layer.bindPopup(gageButtonLoaderDiv);

                        var styling = configuration.streamgageSymbology.filter(function (item) {
                            return item.label.toLowerCase() == feature.properties.StationType.name.toLowerCase();
                        })[0];
                        if (styling == undefined) {
                            styling = configuration.streamgageSymbology.filter(function (item) {
                                return item.label == 'Unknown'; // better way to do this?
                            })[0]
                        }

                        var icon = L.icon({
                            iconUrl: 'data:image/png;base64,' + styling.imageData,
                            iconSize: [15, 16],
                            iconAnchor: [7.5, 8],
                            popupAnchor: [0, -11],
                        })
                        layer.setIcon(icon);

                        L.DomEvent.on(gageButtonDiv, 'click', (event) => {
                            const id = event.target['id'];
                            if (id === 'gagePageLink') {
                                self.openGagePage(siteNo);
                            }
                        })

                        layer.on('mouseover', function(e) {
                            if (self.studyArea.doSelectMapGage){
                                self.additionalLinkCheck(urls.length-1, urls, '', text);
                                setTimeout(() => {
                                    gageButtonDiv.innerHTML = '<strong>Station ID: </strong>' + siteNo + '</br><strong>Station Name: </strong>' + feature.properties['Name'] + '</br><strong>Latitude: </strong>' + feature.geometry.coordinates[1] + '</br><strong>Longitude: </strong>' + feature.geometry.coordinates[0] + '</br><strong>Station Type</strong>: ' + feature.properties.StationType.name +
                                    '</br><strong>NWIS Page: </strong><a href="' + NWISpage + ' "target="_blank">link</a></br><strong>StreamStats Gage Page: </strong><a id="gagePageLink" class="' + siteNo + '">link</a><br>';
                                    gageButtonDiv.innerHTML = gageButtonDiv.innerHTML + self.additionalHTML;
                                    layer.bindPopup(gageButtonDiv);
                                    this.openPopup();
                                },700);
                            } 
                        });

                        layer.on('click', function(e) {
                            // need to select gage if that's the question
                            if (self.studyArea.doSelectMapGage) {
                                self.studyArea.selectGage(feature);
                                self.studyArea.doSelectMapGage = false;
                            }
                            else {
                                self.additionalLinkCheck(urls.length-1, urls, '', text);
                                setTimeout(() => {
                                    gageButtonDiv.innerHTML = '<strong>Station ID: </strong>' + siteNo + '</br><strong>Station Name: </strong>' + feature.properties['Name'] + '</br><strong>Latitude: </strong>' + feature.geometry.coordinates[1] + '</br><strong>Longitude: </strong>' + feature.geometry.coordinates[0] + '</br><strong>Station Type</strong>: ' + feature.properties.StationType.name +
                                    '</br><strong>NWIS Page: </strong><a href="' + NWISpage + ' "target="_blank">link</a></br><strong>StreamStats Gage Page: </strong><a id="gagePageLink" class="' + siteNo + '">link</a><br>';
                                    gageButtonDiv.innerHTML = gageButtonDiv.innerHTML + self.additionalHTML;
                                    layer.bindPopup(gageButtonDiv);
                                    this.openPopup();
                                },700);
                            } 
                        })

                    }
                }
                this.eventManager.RaiseEvent(WiM.Directives.onLayerAdded, this, new WiM.Directives.LegendLayerAddedEventArgs('streamgages', 'geojson', this.geojson['streamgages'].style));
                this.updateLegend();
            }
            //additional features get generic styling for now
            else {
                this.geojson[LayerName] =
                    {
                        data: feature,
                        visible: true,
                        style: {
                            displayName: LayerName,
                            fillColor: "blue",
                            color: 'blue'
                        }                 
                    }
            }
        }

        public additionalLinkCheck(lastIndex, urls, additionalHTML, text)  {
            if (lastIndex >= 0) {
                var request: WiM.Services.Helpers.RequestInfo = new WiM.Services.Helpers.RequestInfo(urls[lastIndex], true, WiM.Services.Helpers.methodType.GET, 'json');
                this.Execute(request).then((response: any) => {
                    if (response.status == 200) { // display ncGagePageWY link
                        additionalHTML = additionalHTML + '<strong>'+ text[lastIndex] +' </strong><a href="' + urls[lastIndex] + ' "target="_blank">link</a></br>';
                    }
                },(error) => {
                }).finally(() => {
                    lastIndex = lastIndex - 1;
                    this.additionalLinkCheck(lastIndex, urls, additionalHTML, text); // recursively call function 
                });  
            } else {
                this.additionalHTML = additionalHTML;
            }
        }

        private onLayerChanged(sender: WiM.Directives.IwimLegendController, e: WiM.Directives.LegendLayerChangedEventArgs) {

            if (e.PropertyName === "visible") {
                if (!e.Value){
                    delete this.geojson[e.LayerName];
                    if(e.LayerName === "streamgages"){
                        this.studyArea.streamgagesVisible = false;
                    }
                }else {
                    //get feature
                    var value: any = null;

                    //need this in if now that we have network nav results 
                    if (this.studyArea.selectedStudyArea && this.studyArea.selectedStudyArea.FeatureCollection.features.length > 0) {
                        this.studyArea.selectedStudyArea.FeatureCollection['features'].forEach((layer:any) => {
                            if (layer.id == e.LayerName) {
                                var item = angular.fromJson(angular.toJson(layer));
                                var name = item.id;
                                this.addGeoJSON(name, item);
                            }
                        });
                    }

                    // if nonsimplified basin
                    if (e.LayerName == 'nonsimplifiedbasin') {
                        this.addGeoJSON('nonsimplifiedbasin', this.nonsimplifiedBasin)
                    }


                    if (this.explorationService.networkNavResults) {
                        for (var i = 0; i < this.explorationService.networkNavResults.length; i++) {
                            var item = angular.fromJson(angular.toJson(this.explorationService.networkNavResults[i]));
                            if (item.name == e.LayerName)
                                this.addGeoJSON(e.LayerName, item.feature);
                        }//next
                    }

                    if (e.LayerName == 'streamgages' && this.center.zoom >= 8) {
                        // re-query streamgages on toggle
                        this.studyArea.getStreamgages(this.bounds.southWest.lng, this.bounds.northEast.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                    }else if(e.LayerName == 'streamgages' && this.center.zoom < 8){
                        // Streamgages checked but not added to map at this zoom level
                        this.studyArea.streamgagesVisible = true;
                    }


                }//end if  
            }//end if
        }

        private mapBoundsChange(oldValue, newValue) {
            this.nomnimalZoomLevel = this.scaleLookup(this.center.zoom);

            if (this.center.zoom >= 8 && oldValue !== newValue) {
                //console.log('requesting region list');
                this.regionServices.loadRegionListByExtent(this.bounds.northEast.lng, this.bounds.southWest.lng,
                    this.bounds.southWest.lat, this.bounds.northEast.lat);

                if (!this.regionServices.selectedRegion) {
                    this.toaster.pop("info", "Information", "User input is needed to continue", 5000);
                }

                if(this.studyArea.streamgagesVisible){
                    this.studyArea.getStreamgages(this.bounds.southWest.lng, this.bounds.northEast.lng, this.bounds.southWest.lat, this.bounds.northEast.lat);
                }
            }

            if (this.center.zoom < 8 && oldValue !== newValue) {
                
                //clear region list
                this.regionServices.regionList = [];

                this.removeGeoJsonLayers('streamgages');
            }
            
            if (this.center.zoom >= 15) {
                // select the imagery layer if a localres or stormdrain state is selected
                if (!this.imageryToggled && this.regionServices.selectedRegion && this.regionServices.selectedRegion.Applications.some(a => ['StormDrain', 'Localres'].indexOf(a) > -1)) this.toggleImageryLayer();
                this.studyArea.zoomLevel15 = true;
            }
            else {
                this.studyArea.zoomLevel15 = false;
            }

        }
        private updateLegend() {
            // patch fix for streamgages legend
            if (!this.gageLegendFix) {
                setTimeout(() => {
                    // find legend item for Streamgages layer and adjust inner html to include gage symbology
                    var legendItems = document.getElementsByClassName('wimLegend-application-group');
                    for (var item in legendItems) {
                        if (legendItems[item]['innerHTML'] && legendItems[item]['innerHTML'].indexOf('Application Layers') > -1) {
                            var children = legendItems[item]['children'][1]['children'];
                            for (var child in children) {
                                if (children[child]['innerHTML'] && children[child]['innerHTML'].indexOf('Streamgages') > -1 && !this.gageLegendFix) {
                                    var layer = children[child]['children'][0];
                                    var node = document.createElement('div');
                                    node.innerHTML = '<div class="legendGroup"><!----><div ng-repeat="lyr in layer.layerArray "><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII="><i>Gaging Station, Continuous Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZxJREFUOI1jYaAyYBk2BjIZGAgtunDhXRwDA8M/ig10cBDKrqiwt5848WDq9u3vZlJqoIC/v3a0u7uyzLVrbxK2bz+ 8hIGB4SvZBoaGyjcnJenpMTAwMCQm6ukdPHineuPG51XkGqgVEqJjzcfHycnAwMAgIMDJFRys57px4/NpDAwMT0g2MDZWvjUoSM0AWSwsTMNgx467zcuW3Ukk1UD/nBxrdRYWZkZkQXZ2VpaEBH39HTvemb579+ 40sQay5+cbFJiZSWlik3R2ljcMDBStnjv3XQBRBqqosBeVlJgp43I6ExMTQ36 + mercuTdDGRgYVhMyUDItzdhLRoZPFpeBDAwMDLq64lolJQYpPT0XNjEwMPzEaaCDg3xzZqaRHj7DYKCoyFJ19erreQ8f / uzGaqCQkJBZRoaOJg8PBx8xBkpKcitmZpq5VFQcXsDAwPAa3UBGW1v2upAQdTNiDIOB7Gx9 / dWrr1adPfuuEN3AWAMDKbODBx + SWgKJ6 + gIhT57xj7n + fPnV5E1L2psPLuIgeEsieahgsFfwAIAW21yjgzG0zwAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZxJREFUOI1jYaAyYBk2BjIZGAgtunDhXRwDA8M/ig10cBDKrqiwt5848WDq9u3vZlJqoIC/v3a0u7uyzLVrbxK2bz+ 8hIGB4SvZBoaGyjcnJenpMTAwMCQm6ukdPHineuPG51XkGqgVEqJjzcfHycnAwMAgIMDJFRys57px4/NpDAwMT0g2MDZWvjUoSM0AWSwsTMNgx467zcuW3Ukk1UD/nBxrdRYWZkZkQXZ2VpaEBH39HTvemb579+ 40sQay5+cbFJiZSWlik3R2ljcMDBStnjv3XQBRBqqosBeVlJgp43I6ExMTQ36 + mercuTdDGRgYVhMyUDItzdhLRoZPFpeBDAwMDLq64lolJQYpPT0XNjEwMPzEaaCDg3xzZqaRHj7DYKCoyFJ19erreQ8f / uzGaqCQkJBZRoaOJg8PBx8xBkpKcitmZpq5VFQcXsDAwPAa3UBGW1v2upAQdTNiDIOB7Gx9 / dWrr1adPfuuEN3AWAMDKbODBx + SWgKJ6 + gIhT57xj7n + fPnV5E1L2psPLuIgeEsieahgsFfwAIAW21yjgzG0zwAAAAASUVORK5CYII="><i>Low Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV5JREFUOI3d1DFIlGEYwPGfcvBRhMi3xIENURJKndfQLSEJFUGLpp6LGBoViZEpDqIQxNFUS0sQJMQhLTfZoqtzBC25B9I3BO/W8C7RJB2HV3d6U// xeXl + PNOb0 + Fy / w3YXaT6hbv4dWxwhIVVrr3mwTZvjwv2jibJ9K0Y + /aY3WYTP48Mlqnci7EAcxR2Wd9i7ajg4CRXezgBvZycSJKbWzG+wX7b4AwvxinWz6ZiLO5Q+cBcu+DoYy7k6KofJuRmGdpJ0yshhE+tgskiT0sMHPZ4nct3QljfYKwl8DzLK5xrdno3FunfoIzav8D8Q273caYZCJcYXOH+Kz4iNgVHqMxT+Bt20DL9NZ584+WhYJqmpUchDJyipxUwz9l5bqzyHj8awa7hEJ5NUmoFO2iBoVqSrH2OcakRnClS2m3/Bzp9Mcby93z + XZZlX + uXq8 + pton9Kcs0XtiROg7 + BnYMUkljozdEAAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV5JREFUOI3d1DFIlGEYwPGfcvBRhMi3xIENURJKndfQLSEJFUGLpp6LGBoViZEpDqIQxNFUS0sQJMQhLTfZoqtzBC25B9I3BO/W8C7RJB2HV3d6U// xeXl + PNOb0 + Fy / w3YXaT6hbv4dWxwhIVVrr3mwTZvjwv2jibJ9K0Y + /aY3WYTP48Mlqnci7EAcxR2Wd9i7ajg4CRXezgBvZycSJKbWzG+wX7b4AwvxinWz6ZiLO5Q+cBcu+DoYy7k6KofJuRmGdpJ0yshhE+tgskiT0sMHPZ4nct3QljfYKwl8DzLK5xrdno3FunfoIzav8D8Q273caYZCJcYXOH+Kz4iNgVHqMxT+Bt20DL9NZ584+WhYJqmpUchDJyipxUwz9l5bqzyHj8awa7hEJ5NUmoFO2iBoVqSrH2OcakRnClS2m3/Bzp9Mcby93z + XZZlX + uXq8 + pton9Kcs0XtiROg7 + BnYMUkljozdEAAAAAElFTkSuQmCC"><i>Peak Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYlJREFUOI3d1E0og3EcwPHv1lMPEnouWmHJJOLZJCuWzFtjDsPMRYQQkbd20FZKy4mLi1KU5uWygyhxcODARWolcl3kOajn5vA4yInWMjZ28j3+/v0+/U5 / gRQn / BtQbzEQDCv0A29 / Bu1GJuZ7qV / dZeQ4wvpfwRyXXex1mLW8uwcGjrfZAV5 + DXqqCAw1aDLAYCPy + Q3 + gzC + 34Jl3TZsWemkA+RkkOGuFVsOwtoa8Jg02FfHUlcNluhZj02znIQJ7F0ymCzommylRNCjix6KAsKAHfPJvVStqupVoqA47WDGaqL0q8cmmcpOWfVvntGREGgSmfN2UBTvdL0Opp0Ub57hAUI / gYZRN848ifx4IECFkTJvO8MrRxwCWlzQbiIw7kD + DvtozkVx6JSpiMbyl6AkSdYxp1qamUZWIqAhm8JxN83ze2wBz7Ggrq5AXeiuwZoI9tFEG + bQhei7jmizsWCfpRDr + W3SP1BueYHmeXo1bCiKchu9HFzcJ8h + ktxnCrEXpqSUg + 93zWK9ULsBDQAAAABJRU5ErkJggg==" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYlJREFUOI3d1E0og3EcwPHv1lMPEnouWmHJJOLZJCuWzFtjDsPMRYQQkbd20FZKy4mLi1KU5uWygyhxcODARWolcl3kOajn5vA4yInWMjZ28j3+/v0+/U5 / gRQn / BtQbzEQDCv0A29 / Bu1GJuZ7qV / dZeQ4wvpfwRyXXex1mLW8uwcGjrfZAV5 + DXqqCAw1aDLAYCPy + Q3 + gzC + 34Jl3TZsWemkA+RkkOGuFVsOwtoa8Jg02FfHUlcNluhZj02znIQJ7F0ymCzommylRNCjix6KAsKAHfPJvVStqupVoqA47WDGaqL0q8cmmcpOWfVvntGREGgSmfN2UBTvdL0Opp0Ub57hAUI / gYZRN848ifx4IECFkTJvO8MrRxwCWlzQbiIw7kD + DvtozkVx6JSpiMbyl6AkSdYxp1qamUZWIqAhm8JxN83ze2wBz7Ggrq5AXeiuwZoI9tFEG + bQhei7jmizsWCfpRDr + W3SP1BueYHmeXo1bCiKchu9HFzcJ8h + ktxnCrEXpqSUg + 93zWK9ULsBDQAAAABJRU5ErkJggg=="><i>Peak and Low Flow, Partial Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXZJREFUOI3d1E8ow2EYwPHvmF5j/vRLbT/ZlmxpykayjJjkT0iUXIgoTko4buWynNyVctDIxUEpNwcXLi4rrRxclHqVvBc5vA5yoVjGxk6+ x + ft + fScXit5zvpvwAJMEkhmgJc / g4aHxbJJIo / 7LKgbtv4KVoouMeUM6prnW2bZZQ94+j3YQtzRowMARoSAuiSmk0R / CzaYYTqEDRuA3U6Jq130XSf1JnCbMyg6WXeHafo4qwjrJiNJXJ0zlys46h2gnkIsnxaKsJZ1E + TKaFVKXWQLCjHAst2L / 6tHZyPNdwEV45Sx7EDBqn+Uuoy3W8A7iC91ygRw8BNoesYZEgaujCBg99BgDjMvjzkCdGbQS7yqn8B32HuOEXzyhCU0G1 + ChmGExJDyW4spzwYUldSa4 / TKfXaA + 3TQ8uRWa742Qtlg71X3E1RnIqpv9Eo6OF1aS+ghlfMP5NBuPWE + m9tSytTH5YQ6JKEOc + TekkjSL8xLeQdfAVOiXI3dacB + AAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXZJREFUOI3d1E8ow2EYwPHvmF5j/vRLbT/ZlmxpykayjJjkT0iUXIgoTko4buWynNyVctDIxUEpNwcXLi4rrRxclHqVvBc5vA5yoVjGxk6+ x + ft + fScXit5zvpvwAJMEkhmgJc / g4aHxbJJIo / 7LKgbtv4KVoouMeUM6prnW2bZZQ94+j3YQtzRowMARoSAuiSmk0R / CzaYYTqEDRuA3U6Jq130XSf1JnCbMyg6WXeHafo4qwjrJiNJXJ0zlys46h2gnkIsnxaKsJZ1E + TKaFVKXWQLCjHAst2L / 6tHZyPNdwEV45Sx7EDBqn+Uuoy3W8A7iC91ygRw8BNoesYZEgaujCBg99BgDjMvjzkCdGbQS7yqn8B32HuOEXzyhCU0G1 + ChmGExJDyW4spzwYUldSa4 / TKfXaA + 3TQ8uRWa742Qtlg71X3E1RnIqpv9Eo6OF1aS+ghlfMP5NBuPWE + m9tSytTH5YQ6JKEOc + TekkjSL8xLeQdfAVOiXI3dacB + AAAAAElFTkSuQmCC"><i>Stage Only</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYVJREFUOI3d1E8og3Ecx/H3mB6Tfz0XTWwtln/t2YQnjz+ b / A2J0i5EFCclHCmX5eSulINGLg5KOXEQcdFqJeWAWqmnqN / N4ecgBxQyNhzkc / nW99v31ff0tfLLsf4bMEXFHhaYw8DDj0EV50Q3A4EDNsZjxJZ / CubWKP7BUuktuOF6JMbaOnD3bbCEqpAumzWAagLaJadzF0RnvwuWaxj16dhsABlkZniVurYLGV0CrpMGK2hc8GD4Xvc80vCdEw2dcTyaLNjbQEdJKqmW18000qzVNHlN9bxGCHGSKKhU0THloLjso6EbT6VLaHOC / b6EQAVlpoXeoninW7BQS6c7wn4Q2PwKtPvp78pBLYwHAuTjLK + je + yYnW1AxgWdFIcM2rXPsJcE6HFH2JuUyMUPQVVVdV10lSmkZycCZpLr8tPfusvGKnD7HrRkCce8h1o9EewlBu3eiHI0K2Rs + j045MClX3GW7AfKs0tHULHfr5im + WY5fMhW + JCtJL3nmE / l7z / YR0W7YFxuKhm3AAAAAElFTkSuQmCC" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYVJREFUOI3d1E8og3Ecx/H3mB6Tfz0XTWwtln/t2YQnjz+ b / A2J0i5EFCclHCmX5eSulINGLg5KOXEQcdFqJeWAWqmnqN / N4ecgBxQyNhzkc / nW99v31ff0tfLLsf4bMEXFHhaYw8DDj0EV50Q3A4EDNsZjxJZ / CubWKP7BUuktuOF6JMbaOnD3bbCEqpAumzWAagLaJadzF0RnvwuWaxj16dhsABlkZniVurYLGV0CrpMGK2hc8GD4Xvc80vCdEw2dcTyaLNjbQEdJKqmW18000qzVNHlN9bxGCHGSKKhU0THloLjso6EbT6VLaHOC / b6EQAVlpoXeoninW7BQS6c7wn4Q2PwKtPvp78pBLYwHAuTjLK + je + yYnW1AxgWdFIcM2rXPsJcE6HFH2JuUyMUPQVVVdV10lSmkZycCZpLr8tPfusvGKnD7HrRkCce8h1o9EewlBu3eiHI0K2Rs + j045MClX3GW7AfKs0tHULHfr5im + WY5fMhW + JCtJL3nmE / l7z / YR0W7YFxuKhm3AAAAAElFTkSuQmCC"><i>Low Flow, Partial Record, Stage</i></div><!----><div ng-repeat="leg in lyr.legend ">' + 
                                        '<img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZtJREFUOI1jYaAyYBk2BjKpCBksuvPuQhwDA8M/ig00FnLIzrOvsJ9zcGLq4XfbZ1JqoICXtn+0vbK7zJ031xIOH96+hIGB4SvZBrrLhzaH6yXpMTAwMIToJeodvXOwet/zjVXkGqjlpxNizcPJx8nAwMDAzynA5aMX7Lrv+ cZpDAwMT0g20F8 + ttVdLcgAWcxHI8xg / 90dzZvvLEsk1UD/ROscdRZmFkZkQTZWdpZQ/QT9o+ 92mL579+40sQayJxjkFxhImWlik7SRdzZ0Ew2sXvFubgBRBkqyqxRlmJUo43I6ExMTQ4JZvuqKm3NDGRgYVhMyUDLBOM1Lgk9GFpeBDAwMDBriulopBiUpcy70bGJgYPiJ00BzeYfmGKNMPXyGwUCaZZHq4uur837+fNiN1UAhISGzWJ0MTW4OHj5iDBTjllQsMst0aT9csYCBgeE1uoGMBuy2dZ7qIWbEGAYDMfrZ + tuvrq668O5sIbqBsTpSBmYnHx4ktQQSVxbSCX3J / mzO8 + fPryJrXjTpbOOiSWdJNA4NDP4CFgA3c3Kc0o9KfgAAAABJRU5ErkJggg == " src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZtJREFUOI1jYaAyYBk2BjKpCBksuvPuQhwDA8M/ig00FnLIzrOvsJ9zcGLq4XfbZ1JqoICXtn+0vbK7zJ031xIOH96+hIGB4SvZBrrLhzaH6yXpMTAwMIToJeodvXOwet/zjVXkGqjlpxNizcPJx8nAwMDAzynA5aMX7Lrv+ cZpDAwMT0g20F8 + ttVdLcgAWcxHI8xg / 90dzZvvLEsk1UD/ROscdRZmFkZkQTZWdpZQ/QT9o+ 92mL579+40sQayJxjkFxhImWlik7SRdzZ0Ew2sXvFubgBRBkqyqxRlmJUo43I6ExMTQ4JZvuqKm3NDGRgYVhMyUDLBOM1Lgk9GFpeBDAwMDBriulopBiUpcy70bGJgYPiJ00BzeYfmGKNMPXyGwUCaZZHq4uur837+fNiN1UAhISGzWJ0MTW4OHj5iDBTjllQsMst0aT9csYCBgeE1uoGMBuy2dZ7qIWbEGAYDMfrZ + tuvrq668O5sIbqBsTpSBmYnHx4ktQQSVxbSCX3J / mzO8 + fPryJrXjTpbOOiSWdJNA4NDP4CFgA3c3Kc0o9KfgAAAABJRU5ErkJggg == "><i>Miscellaneous Record</i></div><!----><div ng-repeat="leg in lyr.legend "><img class="legendSwatch" alt="Embedded Image" ng-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII=" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII="><i>Unknown</i></div><!----></div><!----></div>'
                                    
                                    layer.appendChild(node);
                                    this.gageLegendFix = true;
                                }
                            }
                        }
                    }
                }, 500);
            }
        }
        private updateRegion() {
            //get regionkey
            var key: string = (this.$locationService.search()).region
            this.setBoundsByRegion(key);

        }
        private setBoundsByRegion(key: string) {
            if (key && this.regionServices.loadRegionListByRegion(key)) {
                //console.log('in setBoundsByRegion selectedRegion gets set here');
                this.regionServices.selectedRegion = this.regionServices.regionList[0];
                this.bounds = this.leafletBoundsHelperService.createBoundsFromArray(this.regionServices.selectedRegion.Bounds);
                //this.center = <ICenter>{};
            }

        }

        private toggleImageryLayer() {
            // get all legend basemap items
            var legendItems = document.getElementsByClassName('wimLegend-basemap-item');
            for (var item in legendItems) {
                var children = legendItems[item].childNodes;
                var radio;
                for (var child in children) {
                    // get all basemap radios
                    if (children[child]['className'] == 'rdo') {
                        radio = children[child];
                        // click the radio button for the "Imagery" layer
                        for (var chd in radio.childNodes) {
                            if (radio.childNodes[chd]['innerHTML'] == 'Imagery') radio.click();
                        }
                    }
                }
            }
            this.imageryToggled = true;
        }

        private addRegionOverlayLayers(regionId: string) {

            //console.log('in addRegionOverlayLayers');

            if (this.regionServices.regionMapLayerList.length < 1) return;

            var layerList = [];
            var roots = this.regionServices.regionMapLayerList.map(function (layer) {
                layerList.push(layer[1])
            });
            var visible = true;
            if (regionId == 'MRB') visible = false;
            layerList.forEach(layer => {
                this.layers.overlays[regionId + "_region" + layer] = 
                {
                    name: String(layer),
                    group: regionId + " Map layers",
                    url: configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSStateLayers'],
                    type: 'agsDynamic',
                    visible: visible,
                    layerOptions: {
                        opacity: 1,
                        layers: [layer],
                        format: "png8",
                        f: "image"
                    },
                }
            });

            //bring streamgages (all national layers) to front
            this.leafletData.getLayers("mainMap").then((maplayers: any) => {
                layerList.forEach(layer => {
                    maplayers.overlays[regionId + "_region" + layer].bringToBack();
                });
                maplayers.overlays.SSLayer.bringToFront();
            });
            
            //get any other layers specified in config
            var layers = this.regionServices.selectedRegion.Layers;
            if (layers == undefined) return;

            for (var layer in layers) {
                this.layers.overlays[layer + "_region"] = layers[layer];
            }

        }
        private removeOverlayLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.layers.overlays, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.layers.overlays[item];
            });
        }
        private removeMarkerLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.markers, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.markers[item];
            });
        }
        private removeGeoJsonLayers(name: string, isPartial: boolean = false) {
            var layeridList: Array<string>;

            layeridList = this.getLayerIdsByID(name, this.geojson, isPartial);

            layeridList.forEach((item) => {
                //console.log('removing map overlay layer: ', item);
                delete this.geojson[item];
            });
        }
        private getLayerIdsByName(name: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (layerObj[variable].hasOwnProperty("name") && (isPartial ? (layerObj[variable].name.indexOf(name) > -1) : (layerObj[variable].name === name))) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }
        private getLayerIdsByID(id: string, layerObj: Object, isPartial: boolean): Array<string> {
            var layeridList: Array<string> = [];

            for (var variable in layerObj) {
                if (isPartial ? (variable.indexOf(id) > -1) : (variable === id)) {
                    layeridList.push(variable);
                }
            }//next variable
            return layeridList;
        }
        private startDelineate(latlng: any, isInExclusionArea?: boolean, excludeReason?: string) {
            //console.log('in startDelineate', latlng);


            var studyArea: Models.IStudyArea = new Models.StudyArea(this.regionServices.selectedRegion.RegionID, new WiM.Models.Point(latlng.lat, latlng.lng, '4326'));
            this.studyArea.AddStudyArea(studyArea);
            this.studyArea.loadStudyBoundary();
            

            //add disclaimer here
            if (isInExclusionArea && excludeReason) this.studyArea.selectedStudyArea.Disclaimers['isInExclusionArea'] = 'The delineation point is in an exclusion area. ' + excludeReason;
        }
    }//end class

    angular.module('StreamStats.Controllers')
        .controller('StreamStats.Controllers.MapController', MapController)
}//end module
 