var configuration = {}

configuration.baseurls =
{
    'MercuryService': 'http://54.174.81.42/mercuryservices',
    'MercuryAuth': 'http://54.174.81.42/mercuryauth',
    'RegressionService': 'http://50.17.205.92/regressionservice/models',
    'KrigService': 'http://50.17.205.92/krigservice',
    "NWISurl": 'http://waterservices.usgs.gov/nwis',
    'StreamStats': 'http://ssdev.cr.usgs.gov',
    'SearchAPI': 'http://txpub.usgs.gov/DSS/search_api/1.0/dataService/dataService.ashx',
    'FARefGage': 'http://wim.usgs.gov/arcgis/rest/services/CedarRiverMapper/IowaFlowAnywhere/MapServer'       
}

configuration.queryparams =
{
    "NWISsite": '/site/?format=mapper,1.0&stateCd={0}&siteType=GL,OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS&hasDataTypeCd=iv',
    'KrigService': '/krig?state={0}&xlocation={1}&ylocation={2}&sr={3}',
    'RegressionMScenarios': '/{0}/estimate?state={1}',
    'SSdelineation': '/watershed.geojson?state={0}&xlocation={1}&ylocation={2}&wkid={3}&includecharacteristics={4}',
    'SSbasinChar': '/basincharacteristics?state={0}&workspaceID={1}&includecharacteristics={2}',
    'FARefGage':'/2/query?geometry={0}&geometryType=esriGeometryPoint&inSR={1}&spatialRel=esriSpatialRelIntersects&outFields=regions_local.Region_Agg,reference_gages.site_id,reference_gages.site_name,reference_gages.da_gis_mi2,reference_gages.lat_dd_nad,reference_gages.long_dd_na&returnGeometry=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson'
}

configuration.basemaps = 
{
    "mapquestOSM": {
        "name": "Mapquest Streets",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
        "type":'xyz',
        "layerOptions": {
            "maxZoom": 19, 
            "subdomains": ['otile1', 'otile2', 'otile3', 'otile4'],
            "attribution": "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>. Map data (c) <a href='http://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> contributors, CC-BY-SA."
        }
    },
    "MapquestOAM": {
        "name": "Mapquest Areal",
        "url": "http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
        "type":'xyz',
        "layerOptions": {
            "maxZoom": 19, 
            "subdomains": ['oatile1', 'oatile2', 'oatile3', 'oatile4'],
            "attribution": 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
        }
    },
    "MapquestHYB": {
        "name": "Mapquest Hybrid",
        "type": 'group',
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
    "tnmBaseMap": {
        "name": "USGS National Map",
        "url": "http://navigator.er.usgs.gov/tiles/tcr.cgi/{z}/{x}/{y}.png",
        "type": 'xyz',
        "layerOptions": {
            "maxZoom": 20,
            "attribution": "<a href='http://www.doi.gov'>U.S. Department of the Interior</a> | <a href='http://www.usgs.gov'>U.S. Geological Survey</a> | <a href='http://www.usgs.gov/laws/policies_notices.html'>Policies</a>"
        }
    }
}// end baselayer

configuration.overlayedLayers = {
//"StateLayer": {
//    "name": "States",
//    "url": "http://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/states/FeatureServer/0",
//    "type": 'feature',
//    "visible": false,
//    "layerOptions": {
//        "simplifyFactor": 0.75,
//        "style": function (feature) {
//            return { color: 'gray', weight: 2 };
//        }
//    }
//},

"SSLayer": {
    "name": "streamStats implementation",
    "url": "http://ssdev.cr.usgs.gov/arcgis/rest/services/ss_studyAreas_dev/MapServer",
    "type": 'dynamic',
    "visible": true,
    "layerOptions": {
        "opacity": 0.5,
        "style": function (feature) {
            return { color: 'gray', weight: 2 };
        }
                  
    }
}
    

}//end statelayer


