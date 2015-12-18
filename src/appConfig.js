var configuration = {}
configuration.baseurls =
{   
    'MercuryService': 'http://54.174.81.42/mercuryservices',
    'MercuryAuth': 'http://54.174.81.42/mercuryauth',
    'RegressionService': 'http://commons.wim.usgs.gov/regressionservice/models',
    'KrigService': 'http://commons.wim.usgs.gov/krigservice',
    "NWISurl": 'http://waterservices.usgs.gov/nwis',
    'StreamStats': 'http://streamstats09.cr.usgs.gov',
    'StreamStatsServices': 'http://streamstatsags.cr.usgs.gov',
    'NSS': 'http://commons.wim.usgs.gov/nssservices',
    'SearchAPI': 'http://txpub.usgs.gov/DSS/search_api/1.1/dataService/dataService.ashx',
    'FARefGage': 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer',
    'GISserver': 'http://54.164.188.167:6080'
}


http://ssdev.cr.usgs.gov/streamstatsservices/watershed/edit.geojson?rcode=CO&workspaceID=CO20151214130113356000&includeparameters=false&includeflowtypes=false&includefeatures=true&crs=4326&simplify=true

configuration.queryparams =
{
    "NWISsite": '/site/?format=mapper,1.0&stateCd={0}&siteType=GL,OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&hasDataTypeCd=iv',
    'KrigService': '/krig?state={0}&xlocation={1}&ylocation={2}&sr={3}',
    'RegressionScenarios': '/{0}/estimate?state={1}',
    'statisticsGroupLookup': '/statisticgroups.json?region={0}&regressionregions={1}&unitsystems=2',
    'statisticsGroupParameterLookup': '/scenarios.json?region={0}&statisticgroups={1}&regressionregions={2}&unitsystems=2',
    'estimateFlows': '/scenarios/estimate.json?region={0}&statisticgroups={1}&regressionregions={2}&unitsystems=2',
    'SSdelineation': '/streamstatsservices/watershed.{0}?rcode={1}&xlocation={2}&ylocation={3}&crs={4}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSeditBasin': '/streamstatsservices/watershed/edit.{0}?rcode={1}&workspaceID={2}&crs={3}&simplify=true&includeparameters=false&includeflowtypes=false&includefeatures=true',
    'SSAvailableParams': '/streamstatsservices/parameters.json?rcode={0}&group={1}',
    'SSComputeParams': '/streamstatsservices/parameters.json?rcode={0}&workspaceID={1}&includeparameters={2}',
    'SSStateLayers': '/arcgis/rest/services/{0}_ss/MapServer?f=pjson',
    'FARefGage': '/2/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson',
    'regionService': '/arcgis/rest/services/ss_studyAreas_prod/MapServer/identify',
    'COregulationService': '/arcgis/rest/services/Regulation/CORegulationSites/MapServer/exts/RegulationRESTSOE/Regulation',
    'RegressionRegionQueryService': '/arcgis/rest/services/NSS/regions/MapServer/exts/PercentOverlayRESTSOE/FeatureLayers/0/PercentOverlay'
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
    darkgray: {
        name: "ESRI Dark Gray",
        type: "agsBase",
        layer: "DarkGray",
        visible: false
    },
    imagery: {
        name: "ESRI Imagery",
        type: "agsBase",
        layer: "Imagery",
        visible: false
    },
    shadedrelief: {
        name: "ESRI Shaded Relief",
        type: "agsBase",
        layer: "ShadedRelief",
        visible: false
    },
    terrain: {
        name: "ESRI Terrain",
        type: "agsBase",
        layer: "Terrain",
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
    /*
    "str900co_utm": {
        "name": "str900 (co) utm",
        "url": "http://54.164.188.167:6080/arcgis/rest/services/streamstats/str900_co/ImageServer",
        "type": 'agsImage',
        "visible": true,
        "layerOptions": {
            "minZoom": 15,
            "maxZoom": 17,
            "opacity": 0.5,
            "renderingRule":  {
              "rasterFunction" : "Colormap",
                        "rasterFunctionArguments" : {
                            "Colormap" : [
                              [1, 0, 0, 255]
                            ]
                        },
                        "variableName" : "Value"
            }
        }
    },*/
    "SSLayer": {
        "name": "StreamStats National Layers",
        "url": configuration.baseurls['StreamStats'] + "/arcgis/rest/services/ss_studyAreas_prod/MapServer",
        "type": 'agsDynamic',
        "visible": true,
        "layerOptions": {
            "zIndex": 1,
            "opacity": 0.6,
            "format": "png8",
            "f": "image"
        }
    },//end ssLayer    
    "draw": {
        "name": 'draw',
        "type": 'group',
        "visible": true,
        "layerParams": {
            "showOnSelector": false,
        },
    }
}//end overlayedLayers
configuration.customMapServices =
    {
        'IA': {
            'FLA': {
                "name": "Flow Anywhere Model",
                "url": 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer',
                "type": 'agsDynamic',
                "visible": true,
                "layerOptions": {
                    "opacity": 0.5
                }
            },
            'FDCTM': {
                "name": "Flow Duration Curve Transfer Model",
                "url": 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowDuration2/MapServer',
                "type": 'agsDynamic',
                "visible": true,
                "layerOptions": {
                    "opacity": 0.5
                }
            },
            'PRMS': {
                "name": "PRMS",
                "url": 'http://wim.usgs.gov/arcgis/rest/services/IowaPRMSMapper/IOWA_PRMS/MapServer',
                "type": 'agsDynamic',
                "visible": false,
                "layerOptions": {
                    "opacity": 0.5
                }
            }
        }//end IA
    }

configuration.regions = [
    { "RegionID": "AL", "Name": "Alabama", "Bounds": [[30.189622, -88.47203], [35.00888, -84.893486]] },
    { "RegionID": "AK", "Name": "Alaska", "Bounds": [[51, -179], [72, -140]] },
    { "RegionID": "AS", "Name": "American Samoa", "Bounds": [[-14.375555, -170.82611], [-14.166389, -169.438323]] },
    { "RegionID": "AZ", "Name": "Arizona", "Bounds": [[31.329174, -114.815414], [37.004585, -109.044883]] },
    { "RegionID": "AR", "Name": "Arkansas", "Bounds": [[33.004528, -94.618156], [36.499656, -89.644409]] },
    { "RegionID": "CA", "Name": "California", "Bounds": [[32.530426, -124.411186], [42.009826, -114.129486]] },
    { "RegionID": "CO", "Name": "Colorado", "Bounds": [[36.992225, -109.060806], [41.005611, -102.041984]] },
    { "RegionID": "CT", "Name": "Connecticut", "Bounds": [[40.982486, -73.729721], [42.049732, -71.788238]] },
    { "RegionID": "DE", "Name": "Delaware", "Bounds": [[38.449325, -75.788055], [39.840576, -75.042396]] },
    { "RegionID": "DC", "Name": "District of Columbia", "Bounds": [[38.801475, -77.120506], [38.995063, -76.909698]] },
    { "RegionID": "FL", "Name": "Florida", "Bounds": [[24.518321, -87.637229], [31.002105, -80.029022]] },
    { "RegionID": "GA", "Name": "Georgia", "Bounds": [[30.35713, -85.605514], [35.002037, -80.841957]] },
    { "RegionID": "GU", "Name": "Guam", "Bounds": [[13.234996, 144.634155], [13.65361, 144.953308]] },
    { "RegionID": "HA", "Name": "Hawaii", "Bounds": [[18.915493, -160.236068], [22.234394, -154.798583]] },
    { "RegionID": "ID", "Name": "Idaho", "Bounds": [[41.989837, -117.240196], [49.001522, -111.043617]] },
    { "RegionID": "IL", "Name": "Illinois", "Bounds": [[36.971115, -91.512626], [42.509479, -87.018081]] },
    { "RegionID": "IN", "Name": "Indiana", "Bounds": [[37.773048, -88.089744], [41.762321, -84.787673]] },
    { "RegionID": "IA", "Name": "Iowa", "Bounds": [[40.374542, -96.635665], [43.504646, -90.139312]] },
    { "RegionID": "KS", "Name": "Kansas", "Bounds": [[36.992221, -102.048553], [40.004512, -94.592735]] },
    { "RegionID": "KY", "Name": "Kentucky", "Bounds": [[36.496719, -89.573677], [39.147232, -81.964202]] },
    { "RegionID": "LA", "Name": "Louisiana", "Bounds": [[28.918104, -94.045776], [33.020599, -88.814056]] },
    { "RegionID": "ME", "Name": "Maine", "Bounds": [[43.064773, -71.082], [47.461883, -66.954002]] },
    { "RegionID": "MD", "Name": "Maryland", "Bounds": [[37.911422, -79.487152], [39.724014, -75.045898]] },
    { "RegionID": "MA", "Name": "Massachusetts", "Bounds": [[41.237003, -73.508407], [42.886661, -69.925399]] },
    { "RegionID": "MI", "Name": "Michigan", "Bounds": [[41.6958, -90.418708], [48.304248, -82.122901]] },
    { "RegionID": "MN", "Name": "Minnesota", "Bounds": [[43.502101, -97.238975], [49.38562, -89.487754]] },
    { "RegionID": "MS", "Name": "Mississippi", "Bounds": [[30.174402, -91.654251], [34.998321, -88.097961]] },
    { "RegionID": "MO", "Name": "Missouri", "Bounds": [[35.99509, -95.774414], [40.614028, -89.100593]] },
    { "RegionID": "MT", "Name": "Montana", "Bounds": [[44.357688, -116.050735], [49.001808, -104.03971]] },
    { "RegionID": "NE", "Name": "Nebraska", "Bounds": [[39.999885, -104.052841], [43.002796, -95.307998]] },
    { "RegionID": "NV", "Name": "Nevada", "Bounds": [[35.002079, -120.005348], [42.000312, -114.039344]] },
    { "RegionID": "NH", "Name": "New Hampshire", "Bounds": [[42.697776, -72.556434], [45.308731, -70.7135]] },
    { "RegionID": "NJ", "Name": "New Jersey", "Bounds": [[38.92564, -75.567596], [41.357639, -73.89363]] },
    { "RegionID": "NM", "Name": "New Mexico", "Bounds": [[31.331899, -109.050102], [36.999423, -103.000656]] },
    { "RegionID": "NY", "Name": "New York", "Bounds": [[40.499076, -79.763328], [45.017364, -71.85588]] },
    { "RegionID": "NC", "Name": "North Carolina", "Bounds": [[33.844467, -84.320968], [36.589008, -75.459503]] },
    { "RegionID": "ND", "Name": "North Dakota", "Bounds": [[45.93505, -104.049591], [49.001316, -96.555152]] },
    { "RegionID": "MP", "Name": "Northern Mariana Islands", "Bounds": [[14.105276, 144.89859], [20.556385, 145.870788]] },
    { "RegionID": "OH", "Name": "Ohio", "Bounds": [[38.4025, -84.819931], [42.324424, -80.51387]] },
    { "RegionID": "OK", "Name": "Oklahoma", "Bounds": [[33.615253, -103.000869], [37.00093, -94.430702]] },
    { "RegionID": "OR", "Name": "Oregon", "Bounds": [[41.992462, -124.566024], [46.285762, -116.461639]] },
    { "RegionID": "PA", "Name": "Pennsylvania", "Bounds": [[39.719429, -80.519561], [42.510452, -74.690032]] },
    { "RegionID": "PR", "Name": "Puerto Rico", "Bounds": [[17.922222, -67.938339], [18.519443, -65.241958]] },
    { "RegionID": "RI", "Name": "Rhode Island", "Bounds": [[41.144325, -71.888366], [42.0191, -71.120613]] },
    { "RegionID": "SC", "Name": "South Carolina", "Bounds": [[32.049209, -83.354354], [35.21611, -78.55368]] },
    { "RegionID": "SD", "Name": "South Dakota", "Bounds": [[42.481113, -104.057128], [45.944362, -96.436576]] },
    { "RegionID": "TN", "Name": "Tennessee", "Bounds": [[34.983898, -90.310745], [36.679244, -81.647453]] },
    { "RegionID": "TX", "Name": "Texas", "Bounds": [[25.83802, -106.645782], [36.50344, -93.508743]] },
    { "RegionID": "UT", "Name": "Utah", "Bounds": [[36.99863, -114.054069], [42.004196, -109.040946]] },
    { "RegionID": "VT", "Name": "Vermont", "Bounds": [[42.727611, -73.443428], [45.016334, -71.467712]] },
    { "RegionID": "VA", "Name": "Virginia", "Bounds": [[36.539142, -83.674819], [39.466579, -75.240722]] },
    { "RegionID": "VI", "Name": "Virgin Islands", "Bounds": [[17.676666, -65.026947], [18.377777, -64.560287]] },
    { "RegionID": "WA", "Name": "Washington", "Bounds": [[45.553112, -124.75579], [49.00362, -116.912506]] },
    { "RegionID": "WV", "Name": "West Virginia", "Bounds": [[37.202762, -82.640777], [40.638553, -77.719734]] },
    { "RegionID": "WI", "Name": "Wisconsin", "Bounds": [[42.494701, -92.885391], [47.302532, -86.249565]] },
    { "RegionID": "WY", "Name": "Wyoming", "Bounds": [[40.996269, -111.055137], [45.004203, -104.051986]] },
    { "RegionID": "CRB", "Name": "Connecticut River Basin", "Bounds": [[43, -70.5], [44, -74.5]] },
    { "RegionID": "DRB", "Name": "Delaware River Basin", "Bounds": [[38.5, -73], [42.5, -77]] },
    { "RegionID": "RRB", "Name": "Rainy River Basin", "Bounds": [[47.3, -89.5], [50, -96]] }

]//end regions