var configuration = {};
configuration.version = "4.3.11";
configuration.environment = 'development';

configuration.baseurls =
    {
        'NWISurl': 'https://waterservices.usgs.gov/nwis',
        'StreamStatsServices': 'https://test.streamstats.usgs.gov',
        'StreamStatsMapServices': 'https://gis.streamstats.usgs.gov',
        'nssservicesv2':'https://test.streamstats.usgs.gov/nssservices',
        'NSS': 'https://test.streamstats.usgs.gov/nssservices',
        'WaterUseServices': 'https://test.streamstats.usgs.gov/wateruseservices',
        'StormRunoffServices': 'https://test.streamstats.usgs.gov/runoffmodelingservices',
        'ScienceBase': 'https://gis.usgs.gov/sciencebase2',
        'GageStatsServices': 'https://test.streamstats.usgs.gov/gagestatsservices'
    };

//override streamstats arguments if on production, these get overriden again in MapController after load balancer assigns a server
if (window.location.host === 'streamstats.usgs.gov') {
    configuration.baseurls.StreamStatsServices = 'https://streamstats.usgs.gov',
        configuration.baseurls.StreamStatsMapServices = 'https://gis.streamstats.usgs.gov',
        configuration.baseurls.NSS = 'https://streamstats.usgs.gov/nssservicesv2',
        configuration.baseurls.nssservicesv2 = 'https://streamstats.usgs.gov/nssservicesv2',
        configuration.baseurls.WaterUseServices = 'https://streamstats.usgs.gov/wateruseservices',
        configuration.baseurls.StormRunoffServices = 'https://streamstats.usgs.gov/runoffmodelingservices',
        configuration.baseurls.nssservicesv2 = 'https://streamstats.usgs.gov/nssservicesv2',
        configuration.environment = 'production';
}

configuration.queryparams =
    {
        'NWISsite':'/site/?format=rdb,1.0&bBox={0},{1},{2},{3}&seriesCatalogOutput=true&outputDataTypeCd=dv&parameterCd=00060&siteStatus=all&hasDataTypeCd=dv',
        'NWISinfo': '/nldi/linked-data/nwissite/USGS-{0}/?f=json',
        'NWISsiteinfo': '/site?site=',
        'KrigService': '/krigservices/sites/{0}/krig?&x={1}&y={2}&crs={3}',
        'RegressionScenarios': '/{0}/estimate?state={1}',
        'statisticsGroupLookup': '/statisticgroups?regions={0}&regressionregions={1}',
        'statisticsGroupParameterLookup': '/scenarios?regions={0}&statisticgroups={1}&regressionregions={2}&unitsystem=2',
        'estimateFlows': '/scenarios/estimate?regions={0}&unitsystem=2',
        'SSdelineation': '/streamstatsservices/watershed.{0}?rcode={1}&xlocation={2}&ylocation={3}&crs={4}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
        'SSstormwaterDelineation': '/stormwaterservices/watershed?rcode={0}&xlocation={1}&ylocation={2}&surfacecontributiononly={3}',
        'SSwatershedByWorkspace': '/streamstatsservices/watershed.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
        'SSeditBasin': '/streamstatsservices/watershed/edit.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
        'SSAvailableParams': '/streamstatsservices/parameters.json?rcode={0}',
        'SSComputeParams': '/streamstatsservices/parameters.json?rcode={0}&workspaceID={1}&includeparameters={2}',
        'SSavailableFeatures': '/streamstatsservices/features.json?workspaceID={0}',
        'SSfeatures': '/streamstatsservices/features.geojson?workspaceID={0}&crs={1}&includefeatures={2}&simplify=true',
        'SSStateLayers': '/arcgis/rest/services/StreamStats/stateServices/MapServer',
        'SSNationalLayers': '/arcgis/rest/services/StreamStats/nationalLayers_test/MapServer',
        'FARefGage': '/2/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
        'regionService': '/arcgis/rest/services/ss_studyAreas_prod/MapServer/identify',
        'NLCDQueryService': '/LandCover/USGS_EROS_LandCover_NLCD/MapServer/4',
        'regulationService': '/arcgis/rest/services/regulations/{0}/MapServer/exts/RegulationRESTSOE/Regulation',
        'RegressionRegionQueryService': '/regressionregions/bylocation',
        'SSNavigationServices': '/navigationservices/navigation',
        'Wateruse': '/summary?year={0}&endyear={1}&includePermits={2}&computeReturns={3}&computeDomestic={4}',
        'WateruseSourceCSV': '/summary/bysource?year={0}&endyear={1}&includePermits={2}&computeReturns={3}&computeDomestic={4}',
        'WateruseConfig': '/regions/{0}/config',
        'coordinatedReachQueryService': '/arcgis/rest/services/coordinatedreaches/{0}/MapServer/0/query?geometry={1},{2},{3},{4}&geometryType=esriGeometryEnvelope&inSR={5}&spatialRel=esriSpatialRelIntersects&outFields={6}&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
        'StormRunoffTR55': '/TR55/GetResult?area={0}&precip={1}&crvnum={2}&pdur={3}',
        'StormRunoffRationalMethod': '/RationalMethod?area={0}&precipint={1}&rcoeff={2}&pdur={3}',
        'ProsperPredictions': '/rest/services/Catalog/5c5204e4e4b0708288fb42e2/MapServer',
        'ProsperSPPPredictions1': '/rest/services/Catalog/5c538c11e4b0708288fd078b/MapServer',
        'ProsperSPPPredictions2': '/rest/services/Catalog/5c538c71e4b0708288fd078e/MapServer',
        'ProsperIdentify': '/identify?layers=all:{0}&tolerance=5&returnGeometry=false&imageDisplay={1}&mapExtent={2}&geometry={3}&sr={4}&geometryType=esriGeometryPoint&f=json',
        'SSURGOexCOMS': '/rest/services/Catalog/5b96f40ce4b0702d0e8272bf/MapServer',
        'SSURGOexCO': '/0/query?geometry={0}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelContains&returnGeometry=false&returnIdsOnly=false&returnCountOnly=true&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
        'GageStatsServicesStations': '/stations/',
        'GageStatsServicesStationTypes': '/stationtypes/',
        'GageStatsServicesCharacteristics': '/characteristics/',
        'GageStatsServicesVariables': '/variables/',
        'GageStatsServicesUnits': '/units/',
        'GageStatsServicesCitations': '/citations/',
        'GageStatsServicesStatistics': '/statistics/',
        'GageStatsServicesAgencies': '/agencies/',
        'GageStatsServicesStatGroups': '/statisticgroups/',
        'GageStatsServicesNearest': '/stations/Nearest?lat={0}&lon={1}&radius={2}&geojson=true&includeStats=true',
        'GageStatsServicesNetwork': '/stations/Network?lat={0}&lon={1}&distance={2}&page={3}&pageCount={4}&includeStats=true&geojson=true',
        'GageStatsServicesBounds': '/stations/Bounds?xmin={0}&xmax={1}&ymin={2}&ymax={3}&geojson=true'
    };

configuration.SupportTicketService = {
    'BaseURL': 'https://streamstats.freshdesk.com',
    'CreateTicket': '/helpdesk/tickets.json',
    'AboutArticle': '/solution/categories/9000106503/folders/9000163536/articles/9000052344.json',
    'RegionInfoFolder': '/solution/categories/9000106501/folders/9000163157.json',
    'UserManualArticlesFolder': '/solution/categories/9000028363/folders/9000042933.json',
    'FAQarticlesFolder': '/solution/categories/9000028363/folders/9000042932.json',
    'ActiveNewsFolder': '/solution/categories/9000028363/folders/9000163894.json',
    'PastNewsFolder': '/solution/categories/9000028363/folders/9000163895.json',
    'DisclaimersArticle': '/solution/categories/9000106503/folders/9000163536/articles/9000127695.json',
    'CreditsArticle': '/solution/categories/9000106503/folders/9000163536/articles/9000127697.json',
    'Token': '***REMOVED***',
    'AccountID': '***REMOVED***'
};

configuration.basemaps =
    {
        natgeo: {
            name: "National Geographic",
            type: "agsBase",
            layer: "NationalGeographic",
            visible: true
        },
        AtnmBaseMap: {
            "name": "National Map",
            "visible": false,
            "type": 'group',
            "layerOptions": {
                "layers": [
                    {
                        "name": "tiles",
                        "url": "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
                        "type": 'agsTiled',
                        "layerOptions": {
                            "opacity": 0.8,
                            "minZoom": 0,
                            "maxZoom": 16,
                            "attribution": "<a href='https://www.doi.gov'>U.S. Department of the Interior</a> | <a href='https://www.usgs.gov'>U.S. Geological Survey</a> | <a href='https://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
                        }
                    },
                    {
                        "name": "dynamic",
                        "url": "https://services.nationalmap.gov/arcgis/rest/services/USGSImageryTopoLarge/MapServer",
                        "type": 'agsDynamic',
                        "layerOptions": {
                            "format": "png8",
                            "f": "image",
                            "position": "back",
                            "opacity": 0.7,
                            "zIndex": -100,
                            "minZoom": 17,
                            "maxZoom": 20,
                            "attribution": "<a href='https://www.doi.gov'>U.S. Department of the Interior</a> | <a href='https://www.usgs.gov'>U.S. Geological Survey</a> | <a href='https://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
                        }
                    }
                ]
            }
        },
        streets: {
            name: "Streets",
            type: "agsBase",
            layer: "Streets",
            visible: true
        },
        topo: {
            name: "World Topographic",
            type: "agsBase",
            layer: "Topographic",
            visible: false
        },
        gray: {
            name: "Gray",
            type: "group",
            visible: false,
            layerOptions: {
                layers: [
                    {
                        name: "gray",
                        type: "agsBase",
                        layer: "Gray"
                    },
                    {
                        name: "graylabel",
                        type: "agsBase",
                        layer: "GrayLabels"
                    }
                ]
            }
        },
        graydark: {
            name: "Dark Gray",
            type: "group",
            visible: false,
            layerOptions: {
                layers: [
                    {
                        name: "darkgray",
                        type: "agsBase",
                        layer: "DarkGray"
                    },
                    {
                        name: "darkgraylabel",
                        type: "agsBase",
                        layer: "DarkGrayLabels"
                    }
                ]
            }
        },
        imagery: {
            name: "Imagery",
            type: "group",
            visible: false,
            layerOptions: {
                layers: [
                    {
                        name: "Imagery",
                        type: "agsBase",
                        layer: "Imagery"
                    },
                    {
                        name: "Imagerylabel",
                        type: "agsBase",
                        layer: "ImageryLabels"
                    }
                ]
            }
        },
        shadeRelief: {
            name: "Shaded Relief",
            type: "group",
            visible: false,
            layerOptions: {
                layers: [
                    {
                        name: "ShadedRelief",
                        type: "agsBase",
                        layer: "ShadedRelief"
                    },
                    {
                        name: "ShadedRelieflabel",
                        type: "agsBase",
                        layer: "ShadedReliefLabels"
                    }
                ]
            }
        }
    };// end baselayer

configuration.regions = [
    { "RegionID": "AK", "Name": "Alaska", "Bounds": [[51.583032, -178.217598], [71.406235, -129.992235]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AL", "Name": "Alabama", "Bounds": [[30.233604, -88.472952], [35.016033, -84.894016]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AR", "Name": "Arkansas", "Bounds": [[33.010151, -94.617257], [36.492811, -89.645479]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AS", "Name": "American Samoa", "Bounds": [[-14.375555, -170.82611], [-14.166389, -169.438323]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "AZ", "Name": "Arizona", "Bounds": [[31.335634, -114.821761], [37.003926, -109.045615]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "CA", "Name": "California", "Bounds": [[32.535781, -124.392638], [42.002191, -114.12523]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "CO", "Name": "Colorado", "Bounds": [[36.988994, -109.055861], [41.003375, -102.037207]],

        "Layers":
        {
            "CO_Regulation": {
                "name": "Regulation Points",
                "url": configuration.baseurls['StreamStatsMapServices'] + "/arcgis/rest/services/regulations/co/MapServer",
                "type": 'agsDynamic',
                "visible": true,
                "layerOptions": {
                    "zIndex": 1,
                    "format": "png8",
                    "layers": [0],
                    "f": "image"
                },
                "queryProperties": { "Regulation Points": {"Source_Fea":"Description", "Source_Dat": "Source" } }
            }
        },
        "Applications": ["Regulation", "StormRunoff"],
        "regionEnabled": true,
        "ScenariosAvailable": true
    },
    { "RegionID": "CT", "Name": "Connecticut", "Bounds": [[40.998392, -73.725237], [42.047428, -71.788249]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "DE", "Name": "Delaware", "Bounds": [[38.449602, -75.791094], [39.840119, -75.045623]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "FL", "Name": "Florida", "Bounds": [[24.956376, -87.625711], [31.003157, -80.050911]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "GA", "Name": "Georgia", "Bounds": [[30.361291, -85.60896], [35.000366, -80.894753]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "GU", "Name": "Guam", "Bounds": [[13.234996, 144.634155], [13.65361, 144.953308]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "HI", "Name": "Hawaii", "Bounds": [[18.921786, -160.242406], [22.22912, -154.791096]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "IA", "Name": "Iowa", "Bounds": [[40.371946, -96.640709], [43.501457, -90.142796]], "Layers":{},
        "Applications": [],
        "regionEnabled": true,
        "ScenariosAvailable": true
    },
    { "RegionID": "ID", "Name": "Idaho", "Bounds": [[41.994599, -117.236921], [48.99995, -111.046771]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "IL", "Name": "Illinois", "Bounds": [[36.986822, -91.516284], [42.509363, -87.507909]], "Layers": {}, "Applications": ["FDCTM"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "IN", "Name": "Indiana", "Bounds": [[37.776224, -88.10149], [41.76554, -84.787446]], "Layers": {}, "Applications": ["CoordinatedReach", "FDCTM"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "KS", "Name": "Kansas", "Bounds": [[36.988875, -102.051535], [40.002987, -94.601224]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "KY", "Name": "Kentucky", "Bounds": [[36.49657, -89.568231], [39.142063, -81.959575]], "Layers":
        {
            "UndergroundConduit": {
                "name": "Underground Conduit",
                "url": "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer",
                "type": 'agsDynamic',
                "visible": true,
                "layerOptions": {
                    "zIndex": 1,
                    "format": "png8",
                    "layers": [6],
                    "layerDefs": { "6": "FCODE>=42000 and FCODE<=42002" },
                    "f": "image"
                },
                "layerArray": [{
                    note: "This overrides the ESRI legend",
                    "layerName": "Flowline - Large Scale",
                    "layerId": 6,
                    "legend": [{                        
                        "contentType": "image/png",
                        "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADFJREFUOI1jYaAyYBk1cNTAwWKgZyHDf2oYtr2fgZE2Ltzez8BIVQOpCUYNHDWQDAAArzAEmJdX26AAAAAASUVORK5CYII =",
                        "label": "Underground Conduit"
                    }]
                }]
            }
        }, "Applications": ["KarstCheck"], "regionEnabled": true, "ScenariosAvailable": true
    },
    { "RegionID": "LA", "Name": "Louisiana", "Bounds": [[28.939655, -94.041785], [33.023422, -89.021803]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "MA", "Name": "Massachusetts", "Bounds": [[41.238279, -73.49884], [42.886877, -69.91778]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MD", "Name": "Maryland and District of Columbia", "Bounds": [[37.970255, -79.489865], [39.725461, -75.045623]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "ME", "Name": "Maine", "Bounds": [[43.09105, -71.087509], [47.453334, -66.969271]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MI", "Name": "Michigan", "Bounds": [[41.697494, -90.4082], [48.173795, -82.419836]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "MN", "Name": "Minnesota", "Bounds": [[43.498102, -97.229436], [49.37173, -89.530673]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MO", "Name": "Missouri", "Bounds": [[35.989656, -95.767479], [40.609784, -89.105034]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "MO_STL", "Name": "Missouri St. Louis", "Bounds": [[38.399258, -90.673599], [38.837568, -89.693069]], "Layers":
            {
                "StormDrainPipes": {
                    "name": "Pipes",
                    "url": configuration.baseurls['StreamStatsMapServices'] + "/arcgis/rest/services/stormdrain/mo_stl/MapServer",
                    "type": 'agsDynamic',
                    "visible": true,
                    "layerOptions": {
                        "zIndex": 1,
                        "format": "png8",
                        "layers": [1],
                        "f": "image"
                    },
                    "queryProperties": { "Pipe": { "PIPEMATERI": "Pipe Material", "WIDTH": "Width", "LENGTH": "Length" } }

                }
            },
        "Applications": [], "regionEnabled": true, "ScenariosAvailable": true
    },
    { "RegionID": "MP", "Name": "Northern Mariana Islands", "Bounds": [[14.105276, 144.89859], [20.556385, 145.870788]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MS", "Name": "Mississippi", "Bounds": [[30.194935, -91.643682], [35.005041, -88.090468]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "MT", "Name": "Montana", "Bounds": [[44.353639, -116.063531], [49.000026, -104.043072]], "Layers":
            {
                "MT_Regulation": {
                    "name": "Regulation Points",
                    "url": configuration.baseurls['StreamStatsMapServices'] + "/arcgis/rest/services/regulations/mt/MapServer",
                    "type": 'agsDynamic',
                    "visible": true,
                    "layerOptions": {
                        "zIndex": 1,
                        "format": "png8",
                        "layers": [0],
                        "f": "image"
                    },
                    "queryProperties": { "Regulation Points": { "Descript": "Description" } }
                }
            },
        "Applications": ["Regulation"],
        "regionEnabled": true,
        "ScenariosAvailable": true
    },
    { "RegionID": "NC", "Name": "North Carolina", "Bounds": [[33.882164, -84.323773], [36.589767, -75.45658]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "ND", "Name": "North Dakota", "Bounds": [[45.930822, -104.062991], [49.000026, -96.551931]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NE", "Name": "Nebraska", "Bounds": [[39.992595, -104.056219], [43.003062, -95.308697]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "NH", "Name": "New Hampshire", "Bounds": [[42.698603, -72.553428], [45.301469, -70.734139]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NJ", "Name": "New Jersey", "Bounds": [[38.956682, -75.570234], [41.350573, -73.896148]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NM", "Name": "New Mexico", "Bounds": [[31.343453, -109.051346], [36.99976, -102.997401]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NV", "Name": "Nevada", "Bounds": [[34.998914, -119.996324], [41.996637, -114.037392]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "NY", "Name": "New York", "Bounds": [[40.506003, -79.763235], [45.006138, -71.869986]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OH", "Name": "Ohio", "Bounds": [[38.400511, -84.81207], [41.986872, -80.519996]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OK", "Name": "Oklahoma", "Bounds": [[33.621136, -102.997709], [37.001478, -94.428552]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OR", "Name": "Oregon", "Bounds": [[41.987672, -124.559617], [46.236091, -116.470418]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "PA", "Name": "Pennsylvania", "Bounds": [[39.719313, -80.526045], [42.267327, -74.700062]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "PR", "Name": "Puerto Rico", "Bounds": [[17.922222, -67.938339], [18.519443, -65.241958]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": true },
    { "RegionID": "RI", "Name": "Rhode Island", "Bounds": [[41.322769, -71.866678], [42.013713, -71.117132]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    {
        "RegionID": "SC", "Name": "South Carolina", "Bounds": [[32.068173, -83.350685], [35.208356, -78.579453]], "Layers":
            {
                "SCDOT_Bridges": {
                    "name": "Bridges",
                    "url": "https://services1.arcgis.com/VaY7cY9pvUYUP1Lf/arcgis/rest/services/Statewide_Bridges/FeatureServer/0",
                    "type": 'agsFeature',
                    "visible": true,
                    "layerOptions": {
                        pointToLayer: function (geojson, latlng) {
                            return L.marker(latlng, {
                                icon: L.icon({
                                    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAe9JREFUOI21lMFLG0EYxd837taDNXhoKZsixEslWMhhDfYivVRCIXvzpKInN9B/wuTPyOLFv0DQvfQgHqSK1j0ImiW5GCgkl56E0GKSeT00azdNm0Ro32n45pvfvGHmjYH/ JCMaaK0dAHkATaVU8TEQrbUjIi6AoogED2CSNoCDerWK1Pw8tNaBUupwHGi09jYMMZdO50kWRMQzAEBEApK4OT3F00QCzyzrgORitPsI6GG9WsWXWg1z6TQA / HLcUyG3sVH2d3exsr6OqUTiUmvtjTBsf202rcrZGd5vboJkSSnVDxYRjyRyW1vlj3t7eLe2hgnDcIdRv7VaONnfh7O9DVHKF5FiNBd3DBHxtNb229VVtzQzM8LsTxXv7mCYpi8iTrxu / N4oIt7U9PRQp3E9mZwEyYG7GAD / Kw2ASTrdbvdRkOgN / xVM0iW588n38aFSwYQx / EDfWy0Ex8d4k8tZWuuyUqowAO4lr / z56AiZ5WU8TyYDkv4op7dhaIVBgLRtuyQDEfH6wCKyU7u6wovZ2QhaGiN9RZKN6 / Nzq1GvI5lKlXvwIB5pu31 / j1eZDMaEAgA6nc7i66Wly + uLCyuZSgGADSB4iHS73X65kM3mSTbHhQKAaZoNks5CNusC8Po + oagBwKgI / 1E9WCFe+wGwdtl + 2b+bewAAAABJRU5ErkJggg == ",
                                    iconSize: [27, 31],
                                    iconAnchor: [13.5, 17.5],
                                    popupAnchor: [0, -11]
                                })
                            });
                        },
                        "minZoom": 12,
                        onEachFeature: function (feature, layer) {
                            var popupContent = '<h5>SCDOT Bridges</h5> ';
                            var queryProperties = { "COUNTY_ID": "County Identifier", "RTE_TYPE": "Route Type", "RTE_NBR": "Route Number", "RTE_DIR": "Route Direction", "RTE_LRS": "Route LRS", "STRUCTURE_": "Structure ID", "CROSSING": "Crossing", "LOCATION": "Location", "STRUCTURE1": "Structure" };
                            Object.keys(queryProperties).map(function (k) {
                                popupContent += '<strong>' + queryProperties[k] + ': </strong>' + feature.properties[k] + '</br>';
                            });
                            layer.bindPopup(popupContent);                     
                        }
                    },
                    "layerArray": [{
                        note: "This overrides the ESRI legend",
                        "layerName": "SCDOT Bridges",
                        "legend": [{
                            "contentType": "image/png",
                            "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAUlJREFUOI3VlDFLAmEYx/+PnUoS4hKBINgSODm4tEhLIQ1tTgpuLn2K+h4ufgKXWwLBIVI8uEEoxVs6CHJpEt6uzuHfEHedXORlBvVOLw+8P37v8/zfV8OGl/ Z / gCQpIrIOJHhW8wr2dLoWlCTvJxP / rG941 + 9jJ53+FtQTebAs7BcK8A1FRBauS73Vwkm9DpKMAnyazTAeDHDaaPg13zCeSMizUrxqt3Fcq2FL + 3pejlK47nRw1mxCYjEs9dBb26kUjqpVXGYyUQRxMZ9Di8cRbNESUETk1XEiXRcAEslkqPa7wSZJR6mNAnGj6zgfj1cO5UUpmL0eDiuVcLA9O6PbRbFcxm42i1VZ9AI9MU0USqVlQ5K0RiPs5XKRYMD7AEnydjjEo22HX8rCdXFQLEaChaCGgWw+/2G47qcQhH4a7J9Avf3f/2DfAC / knupCOYW2AAAAAElFTkSuQmCC",
                            "label": ""
                        }]
                    }],
                    "queryProperties": { "SCDOT Bridges": { "COUNTY_ID": "County Identifier", "RTE_Type": "Route Type", "RTE_NBR": "Route Number", "RTE_DIR": "Route Direction", "RTE_LRS": "Route LRS", "Structure_": "Type", "Crossing": "Crossing", "Location": "Location", "Structure1": "Structure" } }
                },
                "SCDOT_Roads": {
                    "name": "Road Network",
                    "url": "https://services1.arcgis.com/VaY7cY9pvUYUP1Lf/ArcGIS/rest/services/HIGHWAYS/FeatureServer/0",
                    "type": 'agsFeature',
                    "visible": true,
                    "layerOptions": {
                        style: function (feature) {
                            var c, o = 0.75;
                            switch (feature.properties.ROUTE_TYPE) {
                                case '':
                                    c = '#007D7D';
                                    break;
                                default:
                                    c = '#C0C0C0';
                            }
                            return { color: c, opacity: o, weight: 5 };
                        },
                        "minZoom": 15
                    },
                    "layerArray": [{
                        note: "This overrides the ESRI legend",
                        "layerName": "Road Network Routes",
                        "legend": [{
                            "contentType": "image/png",
                            "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAC9JREFUOI1jYaAyYBk1cNTAYWtgenr6f2oYNnPmTEYWGIMaBjIwDJkwHDVwmBsIADDsBh2b0c5hAAAAAElFTkSuQmCC",
                            "label": ""
                        }]
                    }],
                    "queryProperties": { "Road Network Routes": { "COUNTY_ID": "County Identifier", "ROUTE_TYPE": "Route Type", "ROUTE_NUMB": "Route Number", "ROUTE_DIR": "Route Direction", "ROUTE_ID": "Route Identifier", "FEATURE_TY": "Type", "STREET_NAM": "Street Name", "NAME": "Name" } }
                }
            },
        "Applications": [], "regionEnabled": true, "ScenariosAvailable": true
    },
    { "RegionID": "SD", "Name": "South Dakota", "Bounds": [[42.488459, -104.061036], [45.943547, -96.439394]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "TN", "Name": "Tennessee", "Bounds": [[34.988759, -90.305448], [36.679683, -81.652272]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "TX", "Name": "Texas", "Bounds": [[25.845557, -106.650062], [36.493912, -93.507389]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "UT", "Name": "Utah", "Bounds": [[36.991746, -114.047273], [42.0023, -109.043206]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "VA", "Name": "Virginia", "Bounds": [[36.541623, -83.675177], [39.456998, -75.242219]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "VT", "Name": "Vermont", "Bounds": [[42.725852, -73.436], [45.013351, -71.505372]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "VI", "Name": "Virgin Islands", "Bounds": [[17.676666, -65.026947], [18.377777, -64.560287]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "WA", "Name": "Washington", "Bounds": [[45.543092, -124.732769], [48.999931, -116.919132]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "WI", "Name": "Wisconsin", "Bounds": [[42.489152, -92.885397], [46.952479, -86.967712]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false },
    { "RegionID": "WV", "Name": "West Virginia", "Bounds": [[37.20491, -82.647158], [40.637203, -77.727467]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": true },
    { "RegionID": "WY", "Name": "Wyoming", "Bounds": [[40.994289, -111.053428], [45.002793, -104.051705]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "CRB", "Name": "Connecticut River Basin", "Bounds": [[41.227366, -73.254776], [45.305324, -71.059248]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false },
    { "RegionID": "DRB", "Name": "Delaware River Basin", "Bounds": [[38.666626, -76.452907], [42.507076, -74.319593]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": false },
    { "RegionID": "RRB", "Name": "Rainy River Basin", "Bounds": [[47.268377, -95.64855], [50.054196, -89.766532]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true }

];//end regions

configuration.overlayedLayers = {
    "SSLayer": {
        "name": "National Layers",
        "url": configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSNationalLayers'], // note: we should remove the streamgages from the NationalLayer when ready
        "type": 'agsDynamic',
        "visible": true,
        "layerOptions": {
            "opacity": 1,
            "format": "png8",
            "f": "image"
        },
        "layerArray": [{
            note: "This overrides the ESRI legend",
            "layerName": "Streamgages",
            "layerId": 0,
            "legend": [{
                "contentType": "image/png",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAaJJREFUOI3dzz1IW1EYxvF/TMqpFQsJCF4QOuhUpTpEVCw6RSsdQhFB6hfiF0IDFqkoOCqKEhxEqm0H20YUgpQoqOBWOkgjpQgXowREEC5SuVBE6QtFHXQwYjSJmXzgDO85hx/PayPJsd0TcD6sqM6ZBFqAk7uD4dCyqu3dkLnhRmD6bqB/ q5DwZrl4hv6rb2MWEfEDR4mD + q9ZSl + mAC75 + HOGxvwuYDAx8MNaK / +Os3mUfj5nP + tSSlsUMbKAvfhA / dSKb3qEqvrLtwUS0CeVW + sWkbfxgcsr4zx12rFe + ZJu75PMPK / jcKfQNM1gbKBPz2Az2EzJi + ten / B1LdUse9AGxAhu//ZTXPkwanurrRd3RyeBqRrAfzM48b2IvwfPcWRG9QC76nnvlMDUY2ABkOjgbshHxWvrTRqAYPGo/s9uGWh6A3ivBR3epTZTpeWQmnabB6CkqqFOjbbvi0gG8CcSXF1NMZdCw7zqjAW7iKWOT+sVqtX5TkR6IkGXqx4IMub5EYeIQAlQrmlarmEY+uWVv1ycRDJgGAaRDZOUpINnJ5KDtx5X6hkAAAAASUVORK5CYII=",
                "label": "Gaging Station, Continuous Record"
            },{
                "contentType": "image/png",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZxJREFUOI1jYaAyYBk2BjIZGAgtunDhXRwDA8M/ig10cBDKrqiwt5848WDq9u3vZlJqoIC/v3a0u7uyzLVrbxK2bz+ 8hIGB4SvZBoaGyjcnJenpMTAwMCQm6ukdPHineuPG51XkGqgVEqJjzcfHycnAwMAgIMDJFRys57px4/NpDAwMT0g2MDZWvjUoSM0AWSwsTMNgx467zcuW3Ukk1UD/nBxrdRYWZkZkQXZ2VpaEBH39HTvemb579+ 40sQay5+cbFJiZSWlik3R2ljcMDBStnjv3XQBRBqqosBeVlJgp43I6ExMTQ36 + mercuTdDGRgYVhMyUDItzdhLRoZPFpeBDAwMDLq64lolJQYpPT0XNjEwMPzEaaCDg3xzZqaRHj7DYKCoyFJ19erreQ8f / uzGaqCQkJBZRoaOJg8PBx8xBkpKcitmZpq5VFQcXsDAwPAa3UBGW1v2upAQdTNiDIOB7Gx9 / dWrr1adPfuuEN3AWAMDKbODBx + SWgKJ6 + gIhT57xj7n + fPnV5E1L2psPLuIgeEsieahgsFfwAIAW21yjgzG0zwAAAAASUVORK5CYII=",
                "label": "Low Flow, Partial Record"
                }, {
                    "contentType": "image/png",
                    "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV5JREFUOI3d1DFIlGEYwPGfcvBRhMi3xIENURJKndfQLSEJFUGLpp6LGBoViZEpDqIQxNFUS0sQJMQhLTfZoqtzBC25B9I3BO/W8C7RJB2HV3d6U// xeXl + PNOb0 + Fy / w3YXaT6hbv4dWxwhIVVrr3mwTZvjwv2jibJ9K0Y + /aY3WYTP48Mlqnci7EAcxR2Wd9i7ajg4CRXezgBvZycSJKbWzG+wX7b4AwvxinWz6ZiLO5Q+cBcu+DoYy7k6KofJuRmGdpJ0yshhE+tgskiT0sMHPZ4nct3QljfYKwl8DzLK5xrdno3FunfoIzav8D8Q273caYZCJcYXOH+Kz4iNgVHqMxT+Bt20DL9NZ584+WhYJqmpUchDJyipxUwz9l5bqzyHj8awa7hEJ5NUmoFO2iBoVqSrH2OcakRnClS2m3/Bzp9Mcby93z + XZZlX + uXq8 + pton9Kcs0XtiROg7 + BnYMUkljozdEAAAAAElFTkSuQmCC",
                    "label": "Peak Flow, Partial Record"
            }, {
                "contentType": "image/png",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYlJREFUOI3d1E0og3EcwPHv1lMPEnouWmHJJOLZJCuWzFtjDsPMRYQQkbd20FZKy4mLi1KU5uWygyhxcODARWolcl3kOajn5vA4yInWMjZ28j3+/v0+/U5 / gRQn / BtQbzEQDCv0A29 / Bu1GJuZ7qV / dZeQ4wvpfwRyXXex1mLW8uwcGjrfZAV5 + DXqqCAw1aDLAYCPy + Q3 + gzC + 34Jl3TZsWemkA+RkkOGuFVsOwtoa8Jg02FfHUlcNluhZj02znIQJ7F0ymCzommylRNCjix6KAsKAHfPJvVStqupVoqA47WDGaqL0q8cmmcpOWfVvntGREGgSmfN2UBTvdL0Opp0Ub57hAUI / gYZRN848ifx4IECFkTJvO8MrRxwCWlzQbiIw7kD + DvtozkVx6JSpiMbyl6AkSdYxp1qamUZWIqAhm8JxN83ze2wBz7Ggrq5AXeiuwZoI9tFEG + bQhei7jmizsWCfpRDr + W3SP1BueYHmeXo1bCiKchu9HFzcJ8h + ktxnCrEXpqSUg + 93zWK9ULsBDQAAAABJRU5ErkJggg==",
                "label": "Peak and Low Flow, Partial Record"
                }, {
                    "contentType": "image/png",
                    "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXZJREFUOI3d1E8ow2EYwPHvmF5j/vRLbT/ZlmxpykayjJjkT0iUXIgoTko4buWynNyVctDIxUEpNwcXLi4rrRxclHqVvBc5vA5yoVjGxk6+ x + ft + fScXit5zvpvwAJMEkhmgJc / g4aHxbJJIo / 7LKgbtv4KVoouMeUM6prnW2bZZQ94+j3YQtzRowMARoSAuiSmk0R / CzaYYTqEDRuA3U6Jq130XSf1JnCbMyg6WXeHafo4qwjrJiNJXJ0zlys46h2gnkIsnxaKsJZ1E + TKaFVKXWQLCjHAst2L / 6tHZyPNdwEV45Sx7EDBqn+Uuoy3W8A7iC91ygRw8BNoesYZEgaujCBg99BgDjMvjzkCdGbQS7yqn8B32HuOEXzyhCU0G1 + ChmGExJDyW4spzwYUldSa4 / TKfXaA + 3TQ8uRWa742Qtlg71X3E1RnIqpv9Eo6OF1aS+ghlfMP5NBuPWE + m9tSytTH5YQ6JKEOc + TekkjSL8xLeQdfAVOiXI3dacB + AAAAAElFTkSuQmCC",
                    "label": "Stage Only"
            }, {
                "contentType": "image/png",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAYVJREFUOI3d1E8og3Ecx/H3mB6Tfz0XTWwtln/t2YQnjz+ b / A2J0i5EFCclHCmX5eSulINGLg5KOXEQcdFqJeWAWqmnqN / N4ecgBxQyNhzkc / nW99v31ff0tfLLsf4bMEXFHhaYw8DDj0EV50Q3A4EDNsZjxJZ / CubWKP7BUuktuOF6JMbaOnD3bbCEqpAumzWAagLaJadzF0RnvwuWaxj16dhsABlkZniVurYLGV0CrpMGK2hc8GD4Xvc80vCdEw2dcTyaLNjbQEdJKqmW18000qzVNHlN9bxGCHGSKKhU0THloLjso6EbT6VLaHOC / b6EQAVlpoXeoninW7BQS6c7wn4Q2PwKtPvp78pBLYwHAuTjLK + je + yYnW1AxgWdFIcM2rXPsJcE6HFH2JuUyMUPQVVVdV10lSmkZycCZpLr8tPfusvGKnD7HrRkCce8h1o9EewlBu3eiHI0K2Rs + j045MClX3GW7AfKs0tHULHfr5im + WY5fMhW + JCtJL3nmE / l7z / YR0W7YFxuKhm3AAAAAElFTkSuQmCC",
                "label": "Low Flow, Partial Record, Stage"
                }, {
                    "contentType": "image/png",
                    "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAZtJREFUOI1jYaAyYBk2BjKpCBksuvPuQhwDA8M/ig00FnLIzrOvsJ9zcGLq4XfbZ1JqoICXtn+0vbK7zJ031xIOH96+hIGB4SvZBrrLhzaH6yXpMTAwMIToJeodvXOwet/zjVXkGqjlpxNizcPJx8nAwMDAzynA5aMX7Lrv+ cZpDAwMT0g20F8 + ttVdLcgAWcxHI8xg / 90dzZvvLEsk1UD/ROscdRZmFkZkQTZWdpZQ/QT9o+ 92mL579+40sQayJxjkFxhImWlik7SRdzZ0Ew2sXvFubgBRBkqyqxRlmJUo43I6ExMTQ4JZvuqKm3NDGRgYVhMyUDLBOM1Lgk9GFpeBDAwMDBriulopBiUpcy70bGJgYPiJ00BzeYfmGKNMPXyGwUCaZZHq4uur837+fNiN1UAhISGzWJ0MTW4OHj5iDBTjllQsMst0aT9csYCBgeE1uoGMBuy2dZ7qIWbEGAYDMfrZ + tuvrq668O5sIbqBsTpSBmYnHx4ktQQSVxbSCX3J / mzO8 + fPryJrXjTpbOOiSWdJNA4NDP4CFgA3c3Kc0o9KfgAAAABJRU5ErkJggg == ",
                    "label": "Miscellaneous Record"
            }, {
                "contentType": "image/png",
                "imageData": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAARVJREFUOI3d1L8rhVEYB/APqROD9C66xSBJDH4MLAYLi4XFJKKYlDBSlpvJrpRBstn8G2b/gXoHdTbDs8jgKt38eF138q1T55yn59MznE6XNqfr34CduMYGXtoB7mIeO7j4K9iXUlqLiAFs4gbPfwHrETHR2E/ gGEetguOYQ3fj3JNSWoyIczy2Ap5i6uNFREyhjq3fgssYRccnPZNFUczknO + rggn7GPuiPp1zPsZKVfAQw1 / U3jOCVdz + BNawhMEfwHFs4w7xHVj39jyqZAR7OPsULIpiNuc8ht6K4BAWcIWnZrAj53yC2YrYeyZTSkcRcdAMrjew3 / 5A/RGxWqvVLsuyfPjYfN1YLaUsS80TtiVtB18BHWxAwwk6imsAAAAASUVORK5CYII=",
                "label": "Unknown"
            }]
        }],
        "queryProperties": { "Streamgages":{ "STA_ID": "Station ID", "STA_NAME": "Station Name", "Latitude": "Latitude", "Longitude": "Longitude", "FeatureURL": "URL" }}
    },//end ssLayer
    "MaskLayer": {
        "name": "Area of Interest",
        "url": "https://streamstats.usgs.gov/maptiles/MaskLayer/{z}/{y}/{x}.png",
        "type": 'xyz',
        "visible": true,
        "layerOptions": {
            "opacity": 0.6,
            "maxZoom": 10,
            "zIndex": 9999
        },
        "layerParams": {
            "showOnSelector": false,
        }
    },//end maskLayer    
    "draw": {
        "name": 'draw',
        "type": 'group',
        "visible": true,
        "layerParams": {
            "showOnSelector": false,
        }
    }
};//end overlayedLayers

configuration.stateGeoJSONurl = './data/jsonstates.json';
