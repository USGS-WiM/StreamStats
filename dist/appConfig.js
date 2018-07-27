var configuration={}
configuration.version="4.2.1"
configuration.environment='development'

configuration.baseurls =
{   
    'NWISurl': 'https://waterservices.usgs.gov/nwis',
    'StreamStatsServices': 'https://test.streamstats.usgs.gov',
    'StreamStatsMapServices': 'https://testgis.streamstats.usgs.gov',
    'NSS': 'https://test.streamstats.usgs.gov/nssservices',
    'WaterUseServices': 'https://test.streamstats.usgs.gov/wateruseservices',
    'StormRunoffServices': 'https://test.streamstats.usgs.gov/runoffmodelingservices',
    'ScienceBase': 'https://gis.usgs.gov/sciencebase2'
 
}

//override streamstats arguments if on production, these get overriden again in MapController after load balancer assigns a server
if (window.location.host === 'streamstats.usgs.gov') {
    configuration.baseurls.StreamStatsServices = 'https://streamstats.usgs.gov',
    configuration.baseurls.StreamStatsMapServices = 'https://gis.streamstats.usgs.gov',
    configuration.baseurls.NSS = 'https://streamstats.usgs.gov/nssservices',
    configuration.baseurls.WaterUseServices = 'https://streamstats.usgs.gov/wateruseservices',
    configuration.baseurls.StormRunoffServices = 'https://streamstats.usgs.gov/runoffmodelingservices',
    configuration.environment = 'production'
}

configuration.queryparams =
{
    "NWISsite": '/site/?format=mapper,1.0&stateCd={0}&siteType=GL,OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&hasDataTypeCd=iv',
    'KrigService': '/krig?state={0}&xlocation={1}&ylocation={2}&sr={3}',
    'RegressionScenarios': '/{0}/estimate?state={1}',
    'statisticsGroupLookup': '/statisticgroups.json?region={0}&regressionregions={1}',
    'statisticsGroupParameterLookup': '/scenarios.json?region={0}&statisticgroups={1}&regressionregions={2}&configs=2',
    'estimateFlows': '/scenarios/estimate.json?region={0}&statisticgroups={1}&regressionregions={2}&configs=2',
    'SSdelineation': '/streamstatsservices/watershed.{0}?rcode={1}&xlocation={2}&ylocation={3}&crs={4}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSstormwaterDelineation': '/stormwaterservices/watershed?rcode={0}&xlocation={1}&ylocation={2}&surfacecontributiononly={3}',
    'SSwatershedByWorkspace': '/streamstatsservices/watershed.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSeditBasin': '/streamstatsservices/watershed/edit.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSAvailableParams': '/streamstatsservices/parameters.json?rcode={0}',
    'SSComputeParams': '/streamstatsservices/parameters.json?rcode={0}&workspaceID={1}&includeparameters={2}',
    'SSavailableFeatures': '/streamstatsservices/features.json?workspaceID={0}',
    'SSfeatures': '/streamstatsservices/features.geojson?workspaceID={0}&crs={1}&includefeatures={2}&simplify=true',
    'SSStateLayers': '/arcgis/rest/services/StreamStats/stateServices/MapServer',
    'SSNationalLayers': '/arcgis/rest/services/StreamStats/nationalLayers/MapServer',
    'FARefGage': '/2/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
    'regionService': '/arcgis/rest/services/ss_studyAreas_prod/MapServer/identify',
    'NLCDQueryService': '/LandCover/USGS_EROS_LandCover_NLCD/MapServer/4',
    'regulationService': '/arcgis/rest/services/regulations/{0}/MapServer/exts/RegulationRESTSOE/Regulation',
    'RegressionRegionQueryService': '/arcgis/rest/services/nss/regions/MapServer/exts/PercentOverlayRESTSOE/PercentOverlay',
    'SSNavigationServices': '/navigationservices/navigation',
    'Wateruse': '/summary?year={0}&endyear={1}&includePermits={2}&includereturns={3}&computeDomestic={4}',
    'WateruseSourceCSV':'/summary/bysource?year={0}&endyear={1}&includePermits={2}&includereturns={3}&computeDomestic={4}',
    'WateruseConfig': '/regions/{0}/config',
    'coordinatedReachQueryService': '/arcgis/rest/services/coordinatedreaches/{0}/MapServer/0/query?geometry={1},{2},{3},{4}&geometryType=esriGeometryEnvelope&inSR={5}&spatialRel=esriSpatialRelIntersects&outFields={6}&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
    'StormRunoffTR55': '/TR55/GetResult?area={0}&precip={1}&crvnum={2}&pdur={3}',
    'StormRunoffRationalMethod': '/RationalMethod?area={0}&precipint={1}&rcoeff={2}&pdur={3}',
    'ProsperPredictions': '/rest/services/Catalog/5b416046e4b060350a125fe4/MapServer',
    'ProsperIdentify':'/identify?layers=all:{0}&tolerance=5&returnGeometry=false&imageDisplay={1}&mapExtent={2}&geometry={3}&sr={4}&geometryType=esriGeometryPoint&f=json'
}

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
}

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
    }, 
}// end baselayer

configuration.regions = [
	{ "RegionID": "AK", "Name": "Alaska", "Bounds": [[51.583032,-178.217598],[71.406235,-129.992235]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AL", "Name": "Alabama", "Bounds": [[30.233604, -88.472952], [35.016033, -84.894016]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AR", "Name": "Arkansas", "Bounds": [[33.010151, -94.617257], [36.492811, -89.645479]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "AS", "Name": "American Samoa", "Bounds": [[-14.375555, -170.82611], [-14.166389, -169.438323]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "AZ", "Name": "Arizona", "Bounds": [[31.335634, -114.821761], [37.003926, -109.045615]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "CA", "Name": "California", "Bounds": [[32.535781, -124.392638], [42.002191, -114.12523]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "CO", "Name": "Colorado", "Bounds": [[36.988994,-109.055861],[41.003375,-102.037207]], 

        "Layers":
		{
			"CO_Regulation":{
				"name": "Regulation Points",
				"url": configuration.baseurls['StreamStatsMapServices'] + "/arcgis/rest/services/regulations/co/MapServer",
				"type": 'agsDynamic',
				"visible": true,
				"layerOptions": {
					"zIndex": 1,
					"format": "png8",
					"layers": [0],
					"f": "image"
				}
			}
		},
        "Applications": ["Regulation", "RegulationFlows", "StormRunoff"],
        "regionEnabled": true,
        "ScenariosAvailable": true
    },
    { "RegionID": "CT", "Name": "Connecticut", "Bounds": [[40.998392, -73.725237], [42.047428, -71.788249]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "DE", "Name": "Delaware", "Bounds": [[38.449602,-75.791094],[39.840119,-75.045623]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "FL", "Name": "Florida", "Bounds": [[24.956376,-87.625711],[31.003157,-80.050911]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "GA", "Name": "Georgia", "Bounds": [[30.361291,-85.60896],[35.000366,-80.894753]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "GU", "Name": "Guam", "Bounds": [[13.234996, 144.634155], [13.65361, 144.953308]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "HI", "Name": "Hawaii", "Bounds": [[18.921786,-160.242406],[22.22912,-154.791096]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
	{ "RegionID": "IA", "Name": "Iowa", "Bounds": [[40.371946,-96.640709],[43.501457,-90.142796]], "Layers": 
		{
			//'FLA': {
			//    "name": "Flow Anywhere Model",
			//    "url": 'https://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer',
			//    "type": 'agsDynamic',
			//    "visible": true,
			//    "layerOptions": {
			//        "opacity": 0.5
			//    }
			//},
			//'FDCTM': {
			//    "name": "Flow Duration Curve Transfer Model",
			//    "url": 'https://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowDuration2/MapServer',
			//    "type": 'agsDynamic',
			//    "visible": true,
			//    "layerOptions": {
			//        "opacity": 0.5
			//    }
			//},
			//'PRMS': {
			//    "name": "PRMS",
			//    "url": 'https://wim.usgs.gov/arcgis/rest/services/IowaPRMSMapper/IOWA_PRMS/MapServer',
			//    "type": 'agsDynamic',
			//    "visible": false,
			//    "layerOptions": {
			//        "opacity": 0.5
			//    }
			//}
		},
		"Applications": [], 
        "regionEnabled": true,
		"ScenariosAvailable": true
    },
    { "RegionID": "ID", "Name": "Idaho", "Bounds": [[41.994599,-117.236921],[48.99995,-111.046771]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "IL", "Name": "Illinois", "Bounds": [[36.986822,-91.516284],[42.509363,-87.507909]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "IN", "Name": "Indiana", "Bounds": [[37.776224, -88.10149], [41.76554, -84.787446]], "Layers": {}, "Applications": ["CoordinatedReach"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "KS", "Name": "Kansas", "Bounds": [[36.988875,-102.051535],[40.002987,-94.601224]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
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
                    "layerDefs": {"6": "FCODE>=42000 and FCODE<=42002"},
                    "f": "image"
                }
            }
        }, "Applications": ["KarstCheck"], "regionEnabled": true, "ScenariosAvailable": true
    },
    { "RegionID": "LA", "Name": "Louisiana", "Bounds": [[28.939655,-94.041785],[33.023422,-89.021803]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "MA", "Name": "Massachusetts", "Bounds": [[41.238279, -73.49884], [42.886877, -69.91778]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
	{ "RegionID": "MD", "Name": "Maryland and District of Columbia", "Bounds": [[37.970255, -79.489865], [39.725461, -75.045623]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "ME", "Name": "Maine", "Bounds": [[43.09105,-71.087509],[47.453334,-66.969271]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MI", "Name": "Michigan", "Bounds": [[41.697494,-90.4082],[48.173795,-82.419836]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "MN", "Name": "Minnesota", "Bounds": [[43.498102,-97.229436],[49.37173,-89.530673]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MO", "Name": "Missouri", "Bounds": [[35.989656, -95.767479], [40.609784, -89.105034]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MO_STL", "Name": "Missouri St. Louis", "Bounds": [[38.399258, -90.673599], [38.837568, -89.693069]], "Layers":
        {
            "StormDrainPipes": {
                "name": "Pipes",
                "url": configuration.baseurls['StreamStatsMapServices'] + "/arcgis/rest/services/stormdrain/mo_stl/MapServer",
                "type": 'agsDynamic',
                "visible": true,
                "layerOptions": {
                    "zIndex": 1,
                    "format": "png8",
                    "layers": [0],
                    "f": "image"
                }
            }
        },
        "Applications": [], "regionEnabled": true, "ScenariosAvailable": true
    },
    { "RegionID": "MP", "Name": "Northern Mariana Islands", "Bounds": [[14.105276, 144.89859], [20.556385, 145.870788]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "MS", "Name": "Mississippi", "Bounds": [[30.194935,-91.643682],[35.005041,-88.090468]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false },
    { "RegionID": "MT", "Name": "Montana", "Bounds": [[44.353639,-116.063531],[49.000026,-104.043072]], "Layers": 
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
                }
            }
        },
        "Applications": ["Regulation"],
        "regionEnabled": true,
        "ScenariosAvailable": true
    },
	{ "RegionID": "NC", "Name": "North Carolina", "Bounds": [[33.882164,-84.323773],[36.589767,-75.45658]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
	{ "RegionID": "ND", "Name": "North Dakota", "Bounds": [[45.930822,-104.062991],[49.000026,-96.551931]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NE", "Name": "Nebraska", "Bounds": [[39.992595,-104.056219],[43.003062,-95.308697]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "NH", "Name": "New Hampshire", "Bounds": [[42.698603,-72.553428],[45.301469,-70.734139]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NJ", "Name": "New Jersey", "Bounds": [[38.956682,-75.570234],[41.350573,-73.896148]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NM", "Name": "New Mexico", "Bounds": [[31.343453,-109.051346],[36.99976,-102.997401]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "NV", "Name": "Nevada", "Bounds": [[34.998914,-119.996324],[41.996637,-114.037392]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "NY", "Name": "New York", "Bounds": [[40.506003,-79.763235],[45.006138,-71.869986]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OH", "Name": "Ohio", "Bounds": [[38.400511, -84.81207], [41.986872, -80.519996]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OK", "Name": "Oklahoma", "Bounds": [[33.621136,-102.997709],[37.001478,-94.428552]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "OR", "Name": "Oregon", "Bounds": [[41.987672,-124.559617],[46.236091,-116.470418]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "PA", "Name": "Pennsylvania", "Bounds": [[39.719313,-80.526045],[42.267327,-74.700062]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "PR", "Name": "Puerto Rico", "Bounds": [[17.922222, -67.938339], [18.519443, -65.241958]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "RI", "Name": "Rhode Island", "Bounds": [[41.322769,-71.866678],[42.013713,-71.117132]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "SC", "Name": "South Carolina", "Bounds": [[32.068173,-83.350685],[35.208356,-78.579453]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "SD", "Name": "South Dakota", "Bounds": [[42.488459,-104.061036],[45.943547,-96.439394]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "TN", "Name": "Tennessee", "Bounds": [[34.988759,-90.305448],[36.679683,-81.652272]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "TX", "Name": "Texas", "Bounds": [[25.845557,-106.650062],[36.493912,-93.507389]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "UT", "Name": "Utah", "Bounds": [[36.991746,-114.047273],[42.0023,-109.043206]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "VA", "Name": "Virginia", "Bounds": [[36.541623,-83.675177],[39.456998,-75.242219]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },	
    { "RegionID": "VT", "Name": "Vermont", "Bounds": [[42.725852,-73.436],[45.013351,-71.505372]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "VI", "Name": "Virgin Islands", "Bounds": [[17.676666, -65.026947], [18.377777, -64.560287]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "WA", "Name": "Washington", "Bounds": [[45.543092,-124.732769],[48.999931,-116.919132]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": true },
    { "RegionID": "WI", "Name": "Wisconsin", "Bounds": [[42.489152,-92.885397],[46.952479,-86.967712]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false },	
    { "RegionID": "WV", "Name": "West Virginia", "Bounds": [[37.20491,-82.647158],[40.637203,-77.727467]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": true },
    { "RegionID": "WY", "Name": "Wyoming", "Bounds": [[40.994289,-111.053428],[45.002793,-104.051705]], "Layers": {}, "Applications": [], "regionEnabled": false, "ScenariosAvailable": false },
    { "RegionID": "CRB", "Name": "Connecticut River Basin", "Bounds": [[41.227366,-73.254776],[45.305324,-71.059248]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false},
    { "RegionID": "DRB", "Name": "Delaware River Basin", "Bounds": [[38.666626, -76.452907], [42.507076, -74.319593]], "Layers": {}, "Applications": ["Wateruse"], "regionEnabled": true, "ScenariosAvailable": false },
    { "RegionID": "RRB", "Name": "Rainy River Basin", "Bounds": [[47.268377,-95.64855],[50.054196,-89.766532]], "Layers": {}, "Applications": [], "regionEnabled": true, "ScenariosAvailable": false }

]//end regions

configuration.overlayedLayers = {
    "SSLayer": {
        "name": "National Layers",
        "url": configuration.baseurls['StreamStatsMapServices'] + configuration.queryparams['SSNationalLayers'],
        "type": 'agsDynamic',
        "visible": true,
        "layerOptions": {
            "zIndex": 1,
            "opacity": 0.6,
            "format": "png8",
            "f": "image",
        }
    },//end maskLayer    
    "MaskLayer": {
        "name": "Area of Interest",
        "url": "https://txgeo.usgs.gov/arcgis/rest/services/Mapping/Mask/MapServer",
        "type": 'agsTiled',
        "visible": true,
        "layerOptions": {
            "opacity": 0.6,
            "maxZoom": 10,
            "zIndex": 9999,
        },
        "layerParams": {
            "showOnSelector": false,
        }
    },//end ssLayer    
    "draw": {
        "name": 'draw',
        "type": 'group',
        "visible": true,
        "layerParams": {
            "showOnSelector": false,
        }
    }
}//end overlayedLayers

configuration.stateGeoJSONurl = './data/jsonstates.json'