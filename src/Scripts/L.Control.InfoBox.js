L.Control.InfoBox = L.Control.extend({
    options: {
        mobileDevice: false,
        position: 'bottomleft',
        separator: ' ',
        emptyString: '',
        lngFirst: false,
        numDigits: 3,
        lngFormatter: undefined,
        latFormatter: undefined,
        prefix: ""
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-infobox');
        this.zoomlevel = L.DomUtil.create('div', 'zoom-level', container);
        this.latlng = L.DomUtil.create('div', 'lat-lng', container);
        L.DomEvent.disableClickPropagation(container);
    
        map.on('mousemove', this._onMouseMove, this);
        map.on('zoomend dragend', this._onZoomEnd, this);
  
        this.zoomlevel.innerHTML = "<b>Zoom Level: </b>" + map.getZoom();
        this.latlng.innerHTML = map.getCenter().lng.toFixed(3) + ' ' + map.getCenter().lat.toFixed(3);

        return container;
    },
    onRemove: function (map) {
        map.off('mousemove', this._onMouseMove)
    },
    _onMouseMove: function (e) {
        var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
        var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
        var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
        var prefixAndValue = this.options.prefix + ' ' + value;
        this.zoomlevel.innerHTML = "<b>Zoom Level: </b>" + map.getZoom();
        this.latlng.innerHTML = prefixAndValue;
    },

    _onZoomEnd: function (e) {
        this.zoomlevel.innerHTML = "<b>Zoom Level: </b>" + map.getZoom();
        if (isMobile) {
            this.latlng.innerHTML = map.getCenter().lng.toFixed(3) + ' ' + map.getCenter().lat.toFixed(3);
        }
    }

});
L.Map.mergeOptions({
    positionControl: false
});
L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.InfoBox();
        this.addControl(this.positionControl);
    }
});
L.control.InfoBox = function (options) {
    return new L.Control.InfoBox(options);
};