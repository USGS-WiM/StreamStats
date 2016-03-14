var configuration = {}
configuration.baseurls =
{   
    'MercuryService': 'http://54.174.81.42/mercuryservices',
    'MercuryAuth': 'http://54.174.81.42/mercuryauth',
    'RegressionService': 'http://commons.wim.usgs.gov/regressionservice/models',
    'KrigService': 'http://commons.wim.usgs.gov/krigservice',
    "NWISurl": 'http://waterservices.usgs.gov/nwis',
    'StreamStats': 'http://streamstats09.cr.usgs.gov',
    //'StreamStatsServices': 'http://streamstatsags.cr.usgs.gov',
    'StreamStatsServices':'http://ssdev.cr.usgs.gov',
    'NSS': 'http://commons.wim.usgs.gov/nssservices',
    'SearchAPI': 'http://txpub.usgs.gov/DSS/search_api/1.1/dataService/dataService.ashx',
    'FARefGage': 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer',
    'GISserver': 'http://54.164.188.167',
    'NationalMapRasterServices': 'http://raster.nationalmap.gov/arcgis/rest/services'
}

configuration.queryparams =
{
    "NWISsite": '/site/?format=mapper,1.0&stateCd={0}&siteType=GL,OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&hasDataTypeCd=iv',
    'KrigService': '/krig?state={0}&xlocation={1}&ylocation={2}&sr={3}',
    'RegressionScenarios': '/{0}/estimate?state={1}',
    'statisticsGroupLookup': '/statisticgroups.json?region={0}&regressionregions={1}&unitsystems=2',
    'statisticsGroupParameterLookup': '/scenarios.json?region={0}&statisticgroups={1}&regressionregions={2}&unitsystems=2',
    'estimateFlows': '/scenarios/estimate.json?region={0}&statisticgroups={1}&regressionregions={2}&unitsystems=2',
    'SSdelineation': '/streamstatsservices/watershed.{0}?rcode={1}&xlocation={2}&ylocation={3}&crs={4}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSwatershedByWorkspace': '/streamstatsservices/watershed.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSeditBasin': '/streamstatsservices/watershed/edit.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSAvailableParams': '/streamstatsservices/parameters.json?rcode={0}',
    'SSComputeParams': '/streamstatsservices/parameters.json?rcode={0}&workspaceID={1}&includeparameters={2}',
    'SSStateLayers': '/arcgis/rest/services/{0}_ss/MapServer?f=pjson',
    'FARefGage': '/2/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
    'regionService': '/arcgis/rest/services/ss_studyAreas_prod/MapServer/identify',
    'NLCDQueryService': '/LandCover/USGS_EROS_LandCover_NLCD/MapServer/4',
    'regulationService': '/arcgis/rest/services/Regulation/{0}RegulationSites/MapServer/exts/RegulationRESTSOE/Regulation',
    'RegressionRegionQueryService': '/arcgis/rest/services/NSS/regions/MapServer/exts/PercentOverlayRESTSOE/PercentOverlay',
    'Wateruse': '/streamstatsservices/wateruse.json?rcode={0}&workspaceID={1}&startyear={2}&endyear={3}',
}

configuration.SupportTicketService = {
    'BaseURL': 'https://streamstats.freshdesk.com',
    'CreateTicket': '/helpdesk/tickets.json',
    'RegionInfo': '/solution/categories/9000106501/folders/9000163157.json',
    'Token': 'yxAClTZwexFeIxpRR6g',
    'AccountID': '303973'
}

configuration.basemaps =
{
    "tnmBaseMap": {
        "name": "USGS National Map",
        "visible": true,
        "type": 'group',
        "layerOptions": {
            "layers": [
                {
                    "name": "tiles",
                    "url": "http://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",
                    "type": 'agsTiled',
                    "layerOptions": {
                        "opacity": 0.8,
                        "minZoom": 0,
                        "maxZoom": 15,
                        "attribution": "<a href='http://www.doi.gov'>U.S. Department of the Interior</a> | <a href='http://www.usgs.gov'>U.S. Geological Survey</a> | <a href='http://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
                    }
                },
                {
                    "name": "dynamic",
                    "url": "http://services.nationalmap.gov/arcgis/rest/services/USGSTopoLarge/MapServer",
                    "type": 'agsDynamic',
                    "layerOptions": {
                        "format": "png8",
                        "f": "image",
                        "position": "back",
                        "opacity": 0.7,
                        "zIndex": -100,
                        "minZoom": 16,
                        "maxZoom": 20,
                        "attribution": "<a href='http://www.doi.gov'>U.S. Department of the Interior</a> | <a href='http://www.usgs.gov'>U.S. Geological Survey</a> | <a href='http://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
                    }
                }
            ]
        }
    },
    national: {
        name: "National Geographic",
        type: "agsBase",
        layer: "NationalGeographic",
        visible: false
    },
    streets: {
        name: "ESRI Streets",
        type: "agsBase",
        layer: "Streets",
        visible: true
    },
    topo: {
        name: "ESRI World Topographic",
        type: "agsBase",
        layer: "Topographic",
        visible: false
    },
    oceans: {
        name: "ESRI Oceans",
        type: "agsBase",
        layer: "Oceans",
        visible: false
    },
    gray: {
        name: "ESRI Gray",
        type: "agsBase",
        layer: "Gray",
        visible: false
    },
    imagery: {
        name: "ESRI Imagery",
        type: "agsBase",
        layer: "Imagery",
        visible: false
    },
    "MapquestOAM": {
        "name": "Mapquest Areal",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
        "visible": false,
        "type": 'xyz',
        "layerOptions": {
            "maxZoom": 19,
            "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
            "attribution": 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
        }
    },
    "MapquestHYB": {
        "name": "Mapquest Hybrid",
        "type": 'group',
        "visible": false,
        "layerOptions": {
            "maxZoom": 19,
            "layers": [
                {
                    "name": "tiles",
                    "url": "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg",
                    "type": 'xyz',
                    "layerOptions": {
                        "maxZoom": 19,
                        "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4']
                    }
                },
                {
                    "name": "roads",
                    "url": "http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png",
                    "type": 'xyz',
                    "layerOptions": {
                        "maxZoom": 19,
                        "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
                        "attribution": 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
                    }
                }
            ],
        }
    },
    "mapquestOSM": {
        "name": "Mapquest Streets",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
        "visible": false,
        "type": 'xyz',
        "layerOptions": {
            "maxZoom": 19,
            "subdomains": ['otile1', 'otile2', 'otile3', 'otile4'],
            "attribution": "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>. Map data (c) <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> contributors, CC-BY-SA."
        }
    }
}// end baselayer

configuration.overlayedLayers = {
    "SSLayer": {
        "name": "National Layers",
        "url": configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ss_studyAreas_prod/MapServer",
        "type": 'agsDynamic',
        "visible": true,
        "layerOptions": {
            "zIndex": 1,
            "opacity": 0.6,
            "format": "png8",
            "f": "image",
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

configuration.regions = [
    { "RegionID": "AL", "Name": "Alabama", "Bounds": [[30.189622, -88.47203], [35.00888, -84.893486]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "AK", "Name": "Alaska", "Bounds": [[51, -179], [72, -140]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "AR", "Name": "Arkansas", "Bounds": [[33.004528, -94.618156], [36.499656, -89.644409]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "AS", "Name": "American Samoa", "Bounds": [[-14.375555, -170.82611], [-14.166389, -169.438323]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "AZ", "Name": "Arizona", "Bounds": [[31.329174, -114.815414], [37.004585, -109.044883]], "Layers": {}, "Applications": [], "ScenariosAvailable": false},
    { "RegionID": "CA", "Name": "California", "Bounds": [[32.530426, -124.411186], [42.009826, -114.129486]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    {
        "RegionID": "CO",
        "Name": "Colorado",
        "Bounds": [[36.992225, -109.060806], [41.005611, -102.041984]],
        "Layers": {"CO_Regulation":{
            "name": "Regulation Points",
            "url": configuration.baseurls['GISserver'] + "/arcgis/rest/services/Regulation/CORegulationSites/MapServer",
            "type": 'agsDynamic',
            "visible": true,
            "layerOptions": {
                "zIndex": 1,
                "format": "png8",
                "layers": [0],
                "f": "image"
            }
        }},
        "Applications": ["Regulation"],
        "ScenariosAvailable": true
    },
    { "RegionID": "CT", "Name": "Connecticut", "Bounds": [[40.982486, -73.729721], [42.049732, -71.788238]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "DE", "Name": "Delaware", "Bounds": [[38.449325, -75.788055], [39.840576, -75.042396]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "DC", "Name": "District of Columbia", "Bounds": [[38.801475, -77.120506], [38.995063, -76.909698]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "FL", "Name": "Florida", "Bounds": [[24.518321, -87.637229], [31.002105, -80.029022]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "GA", "Name": "Georgia", "Bounds": [[30.35713, -85.605514], [35.002037, -80.841957]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "GU", "Name": "Guam", "Bounds": [[13.234996, 144.634155], [13.65361, 144.953308]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "HA", "Name": "Hawaii", "Bounds": [[18.915493, -160.236068], [22.234394, -154.798583]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "ID", "Name": "Idaho", "Bounds": [[41.989837, -117.240196], [49.001522, -111.043617]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "IL", "Name": "Illinois", "Bounds": [[36.971115, -91.512626], [42.509479, -87.018081]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "IN", "Name": "Indiana", "Bounds": [[37.773048, -88.089744], [41.762321, -84.787673]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    {
        "RegionID": "IA", "Name": "Iowa", "Bounds": [[40.374542, -96.635665], [43.504646, -90.139312]],
        "Layers": 
            {
                //'FLA': {
                //    "name": "Flow Anywhere Model",
                //    "url": 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer',
                //    "type": 'agsDynamic',
                //    "visible": true,
                //    "layerOptions": {
                //        "opacity": 0.5
                //    }
                //},
                //'FDCTM': {
                //    "name": "Flow Duration Curve Transfer Model",
                //    "url": 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowDuration2/MapServer',
                //    "type": 'agsDynamic',
                //    "visible": true,
                //    "layerOptions": {
                //        "opacity": 0.5
                //    }
                //},
                //'PRMS': {
                //    "name": "PRMS",
                //    "url": 'http://wim.usgs.gov/arcgis/rest/services/IowaPRMSMapper/IOWA_PRMS/MapServer',
                //    "type": 'agsDynamic',
                //    "visible": false,
                //    "layerOptions": {
                //        "opacity": 0.5
                //    }
                //}
            },
            "Applications": [],
            "ScenariosAvailable": true
    },
    { "RegionID": "KS", "Name": "Kansas", "Bounds": [[36.992221, -102.048553], [40.004512, -94.592735]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "KY", "Name": "Kentucky", "Bounds": [[36.496719, -89.573677], [39.147232, -81.964202]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "LA", "Name": "Louisiana", "Bounds": [[28.918104, -94.045776], [33.020599, -88.814056]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "ME", "Name": "Maine", "Bounds": [[43.064773, -71.082], [47.461883, -66.954002]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MD", "Name": "Maryland", "Bounds": [[37.911422, -79.487152], [39.724014, -75.045898]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "MA", "Name": "Massachusetts", "Bounds": [[41.237003, -73.508407], [42.886661, -69.925399]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MI", "Name": "Michigan", "Bounds": [[41.6958, -90.418708], [48.304248, -82.122901]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MN", "Name": "Minnesota", "Bounds": [[43.502101, -97.238975], [49.38562, -89.487754]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MS", "Name": "Mississippi", "Bounds": [[30.174402, -91.654251], [34.998321, -88.097961]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MO", "Name": "Missouri", "Bounds": [[35.99509, -95.774414], [40.614028, -89.100593]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    {
        "RegionID": "MT",
        "Name": "Montana",
        "Bounds": [[44.357688, -116.050735], [49.001808, -104.03971]],
        "Layers": {
            "MT_Regulation": {
                "name": "Regulation Points",
                "url": configuration.baseurls['GISserver'] + "/arcgis/rest/services/Regulation/MTRegulationSites/MapServer",
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
        "ScenariosAvailable": true
    },
    { "RegionID": "NE", "Name": "Nebraska", "Bounds": [[39.999885, -104.052841], [43.002796, -95.307998]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NV", "Name": "Nevada", "Bounds": [[35.002079, -120.005348], [42.000312, -114.039344]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NH", "Name": "New Hampshire", "Bounds": [[42.697776, -72.556434], [45.308731, -70.7135]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NJ", "Name": "New Jersey", "Bounds": [[38.92564, -75.567596], [41.357639, -73.89363]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NM", "Name": "New Mexico", "Bounds": [[33.027087, -118.366699], [44.777935, -98.5034179]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NX", "Name": "New Mexico", "Bounds": [[31.331899, -109.050102], [36.999423, -103.000656]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NY", "Name": "New York", "Bounds": [[40.499076, -79.763328], [45.017364, -71.85588]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "NC", "Name": "North Carolina", "Bounds": [[33.844467, -84.320968], [36.589008, -75.459503]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "ND", "Name": "North Dakota", "Bounds": [[45.93505, -104.049591], [49.001316, -96.555152]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "MP", "Name": "Northern Mariana Islands", "Bounds": [[14.105276, 144.89859], [20.556385, 145.870788]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
     {
         "RegionID": "OH",
         "Name": "Ohio",
         "Bounds": [[38.4025, -84.819931], [42.324424, -80.51387]],
         "Layers": {},
         "Applications": ["Wateruse"],
         "ScenariosAvailable": true
     },
    { "RegionID": "OK", "Name": "Oklahoma", "Bounds": [[33.615253, -103.000869], [37.00093, -94.430702]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "OR", "Name": "Oregon", "Bounds": [[41.992462, -124.566024], [46.285762, -116.461639]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "PA", "Name": "Pennsylvania", "Bounds": [[39.719429, -80.519561], [42.510452, -74.690032]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "PR", "Name": "Puerto Rico", "Bounds": [[17.922222, -67.938339], [18.519443, -65.241958]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "RI", "Name": "Rhode Island", "Bounds": [[41.144325, -71.888366], [42.0191, -71.120613]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "SC", "Name": "South Carolina", "Bounds": [[32.049209, -83.354354], [35.21611, -78.55368]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "SD", "Name": "South Dakota", "Bounds": [[42.481113, -104.057128], [45.944362, -96.436576]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "TN", "Name": "Tennessee", "Bounds": [[34.983898, -90.310745], [36.679244, -81.647453]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "TX", "Name": "Texas", "Bounds": [[25.83802, -106.645782], [36.50344, -93.508743]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "UT", "Name": "Utah", "Bounds": [[36.99863, -114.054069], [42.004196, -109.040946]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "VT", "Name": "Vermont", "Bounds": [[42.727611, -73.443428], [45.016334, -71.467712]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "VA", "Name": "Virginia", "Bounds": [[36.539142, -83.674819], [39.466579, -75.240722]], "Layers": {}, "Applications": [], "ScenariosAvailable": false },
    { "RegionID": "VI", "Name": "Virgin Islands", "Bounds": [[17.676666, -65.026947], [18.377777, -64.560287]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "WA", "Name": "Washington", "Bounds": [[45.553112, -124.75579], [49.00362, -116.912506]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "WV", "Name": "West Virginia", "Bounds": [[37.202762, -82.640777], [40.638553, -77.719734]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "WI", "Name": "Wisconsin", "Bounds": [[42.494701, -92.885391], [47.302532, -86.249565]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "WY", "Name": "Wyoming", "Bounds": [[40.996269, -111.055137], [45.004203, -104.051986]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "CRB", "Name": "Connecticut River Basin", "Bounds": [[43, -70.5], [44, -74.5]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "DRB", "Name": "Delaware River Basin", "Bounds": [[38.5, -73], [42.5, -77]], "Layers": {}, "Applications": [], "ScenariosAvailable": true },
    { "RegionID": "RRB", "Name": "Rainy River Basin", "Bounds": [[47.3, -89.5], [50, -96]], "Layers": {}, "Applications": [], "ScenariosAvailable": true }

]//end regions

//configuration.alwaysSelectedParameters = [
//    { "name": "DRNAREA", "description": "Area that drains to a point on a stream", "code": "DRNAREA", "unit": "square miles", "checked": true, "toggleable":false }
//]


function USGSRound(x) {
    var precision;
    if ((x > 100000) && (x < 1000000)) precision = 1000;
    if ((x > 10000) && (x < 100000)) precision = 100;
    if ((x > 1000) && (x < 10000)) precision = 10;
    if ((x > 100) && (x < 1000)) precision = 1;

    return parseInt((((x + (precision * .5)) / precision)) * precision);

}
