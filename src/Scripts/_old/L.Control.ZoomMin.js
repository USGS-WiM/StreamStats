//------------------------------------------------------
// L.Control.ZoomMin:
//   A Leaflet control that extends L.Control.Zoom.
//   It adds a button to the zoom control that allows you to zoom to the map minimum zoom level in a single click.
//
// to load script:
//   <link rel="stylesheet" href="L.Control.ZoomMin.css" media="screen">
//   <script src="L.Control.ZoomMin.js"></script>
//
// example usage:
// map.addControl(new L.Control.ZoomMin( /* options */ ))
//
// map should have "zoomControl":false to NOT create default zoom buttons when using this.
//
//------------------------------------------------------
// original code: https://github.com/alanshaw/leaflet-zoom-min
// modified by jvrabel@usgs.gov
//
// added "centerLatLng" option
// if not input, retains original behavior (clicking world icon zooms out to farthest level without any centering)
// if input (as L.LatLng object), zooms out to farthest level and centers at the input LatLng
// 
//------------------------------------------------------
L.Control.ZoomMin = L.Control.Zoom.extend({
    // input option defaults:
    options : {
        "position"     : "topleft",   // position on map
        "zoomInText"   : "+",         // zoom in button label
        "zoomInTitle"  : "Zoom in",   // zoom in tooltip
        "zoomOutText"  : "-",         // zoom out button label
        "zoomOutTitle" : "Zoom out",  // zoom out tooltip
        "zoomMinText"  : "Zoom min",  // zoom min (home) button label
        "zoomMinTitle" : "Zoom min",  // zoom min (home) tooltip
        // ...added options...
        "zoomMinPosition" : "middle",  // zoom min (home) button location in widget: "top", "middle", or "bottom"
        "centerLatLng"    : undefined  // zoom min (home) cetner point: undefined or a L.LatLng object
    },
    
    // on add:
    onAdd : function (map) {
        var zoomName  = "leaflet-control-zoom";
        var container = L.DomUtil.create("div", zoomName+" leaflet-bar");
        var options   = this.options;
        this._map = map;
        var that = this;
        
        // function to create zoom in button
        var createIn = function(that) {
            that._zoomInButton = that._createButton(
                options.zoomInText,
                options.zoomInTitle,
                zoomName + '-in',
                container,
                that._zoomIn,
                that
            );
        };
        
        // function to create zoom min (home) button
        var createHome = function(that) {
            that._zoomMinButton = that._createButton(
                options.zoomMinText,
                options.zoomMinTitle,
                zoomName + '-min',
                container,
                that._zoomMin,
                that
            );
        };
        
        // function to create zoom out button
        var createOut = function(that) {
            that._zoomOutButton = that._createButton(
                options.zoomOutText,
                options.zoomOutTitle,
                zoomName + '-out',
                container,
                that._zoomOut,
                that
            );
        };
        
        // buttons appear in widget in the order they are created.
        // create buttons using the "zoomMinPosition" option
        switch( options.zoomMinPosition.toLowerCase() ) {
            case "top":
                createHome(that);
                createIn(that);
                createOut(that);
                break;
            case "bottom":
                createIn(that);
                createOut(that);
                createHome(that);
                break;
            case "middle":
            default:
                createIn(that);
                createHome(that);
                createOut(that);
                break;
        } 
        
        // set update function to disable buttons
        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);
        
        return container;
    },
    
    // zoom min (home) button callback
    _zoomMin: function () {
        if ((typeof this.options.centerLatLng === "object") && (this.options.centerLatLng.lat !== undefined) && (this.options.centerLatLng.lng !== undefined)) {
            this._map.setView( this.options.centerLatLng, this._map.getMinZoom() );
        } else {
            this._map.setZoom(this._map.getMinZoom());
        }
    },
    
    // update function to disable buttons
    _updateDisabled: function () {
        // remove disable class from buttons
        var className = "leaflet-disabled"
        L.DomUtil.removeClass(this._zoomInButton,  className);
        L.DomUtil.removeClass(this._zoomOutButton, className);
        L.DomUtil.removeClass(this._zoomMinButton, className);
        
        // disable zoom out if already zoomed out
        if (this._map._zoom === this._map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        
        // disable zoom in if already zoomed in
        if (this._map._zoom === this._map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
        
        // disable zoom min (home) if already zoomed out and don't have a center point
        // (keep enabled if zoomed out but have center point so clicking centers)
        if ( (this._map._zoom === this._map.getMinZoom() ) && (typeof this.options.centerLatLng !== "object") ) {
            L.DomUtil.addClass(this._zoomMinButton, className);
        }
    }
});