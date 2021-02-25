var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StreamStats;
(function (StreamStats) {
    var Services;
    (function (Services) {
        'use strict';
        var ProsperService = (function (_super) {
            __extends(ProsperService, _super);
            function ProsperService($http, $q, toaster, modal) {
                var _this = _super.call(this, $http, configuration.baseurls['ScienceBase']) || this;
                _this.$q = $q;
                _this.projectExtent = [[41.96765920367816, -125.48583984375], [49.603590524348704, -110.54443359375]];
                _this.toaster = toaster;
                _this.modalservices = modal;
                _this.init();
                return _this;
            }
            Object.defineProperty(ProsperService.prototype, "SelectedPredictions", {
                get: function () {
                    return this.AvailablePredictions.filter(function (f) { return f.selected; });
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ProsperService.prototype, "Result", {
                get: function () {
                    return this._result;
                },
                enumerable: false,
                configurable: true
            });
            ProsperService.prototype.ResetSelectedPredictions = function () {
                this.ResetResults();
                if (this.AvailablePredictions.length < 1)
                    return;
                this.AvailablePredictions.forEach(function (ap) { return ap.selected = false; });
            };
            ProsperService.prototype.ResetResults = function () {
                this._result = null;
            };
            ProsperService.prototype.GetPredictionValues = function (evnt, bounds) {
                var _this = this;
                this.toaster.pop('wait', "Querying prosper grids", "Please wait...", 0);
                this._result = null;
                var ppt = this.getPointArray(evnt.latlng).join();
                var imgdsplay = this.getDisplayImageArray(evnt.originalEvent.srcElement).join();
                var extent = this.boundsToExtentArray(bounds).join();
                var layers = this.SelectedPredictions.map(function (r) { return r.id; }).join();
                var layers_spp1 = this.SelectedPredictions.filter(function (r) { return r.id < 8; }).map(function (r) { return r.id; });
                var layers_spp2 = this.SelectedPredictions.filter(function (r) { return r.id > 7; }).map(function (r) { return r.id - 8; });
                var spc_url = configuration.queryparams['ProsperPredictions'] + configuration.queryparams['ProsperIdentify']
                    .format(layers, imgdsplay, extent, ppt, 4326);
                var spp_url1 = configuration.queryparams['ProsperSPPPredictions1'] + configuration.queryparams['ProsperIdentify']
                    .format(layers_spp1, imgdsplay, extent, ppt, 4326);
                var spp_url2 = configuration.queryparams['ProsperSPPPredictions2'] + configuration.queryparams['ProsperIdentify']
                    .format(layers_spp2, imgdsplay, extent, ppt, 4326);
                this.$q.all([this.queryExecute(spc_url), this.queryExecute(spp_url1), this.queryExecute(spp_url2)]).then(function (response) {
                    _this.toaster.clear();
                    _this._result = {
                        date: new Date(),
                        point: evnt.latlng,
                        data: {
                            SPC: null,
                            SPP: null
                        }
                    };
                    var spp_data = [];
                    for (var i = 0; i < response.length; i++) {
                        if (i == 0)
                            _this._result.data.SPC = response[i];
                        else if (i == 1 && layers_spp1.length > 0)
                            spp_data = response[i];
                        else if (i == 2 && layers_spp2.length > 0) {
                            spp_data = spp_data.concat(response[i]);
                            for (var i = 0; i < spp_data.length; i++) {
                                spp_data[i].name = spp_data[i].name.charAt(0).toUpperCase() + spp_data[i].name.slice(1).toLowerCase();
                                spp_data[i].value = Math.round(spp_data[i].value * 100) / 100;
                            }
                        }
                        _this._result.data.SPP = spp_data;
                    }
                    _this.toaster.pop('success', "Finished", "See results report.", 5000);
                    _this.modalservices.openModal(Services.SSModalType.e_prosper);
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error querying prosper grids", "Please retry", 0);
                });
            };
            ProsperService.prototype.init = function () {
                this.CanQuery = false;
                this._result = null;
                this.AvailablePredictions = [];
                this.loadAvailablePredictions();
            };
            ProsperService.prototype.loadAvailablePredictions = function () {
                var _this = this;
                try {
                    this.toaster.pop('wait', "Loading Available Prosper Predictions", "Please wait...", 0);
                    var url = configuration.queryparams['ProsperPredictions'] + "/legend?f=pjson";
                    var request = new WiM.Services.Helpers.RequestInfo(url);
                    this.Execute(request).then(function (response) {
                        if (response.data.error) {
                            _this.toaster.pop('error', "There was an error querying prosper predictions", response.data.error.message, 0);
                            return;
                        }
                        _this.AvailablePredictions.length = 0;
                        var layers = response.data.layers;
                        if (layers.length > 0) {
                            layers.map(function (l) { return { id: l.layerId, name: _this.getCleanLabel(l.layerName), selected: false }; }).forEach(function (p) {
                                return _this.AvailablePredictions.push(p);
                            });
                            _this.DisplayedPrediction = _this.AvailablePredictions[0];
                        }
                        _this.toaster.clear();
                    }, function (error) {
                        _this.CanQuery = false;
                        _this.toaster.clear();
                        _this.toaster.pop('error', "There was an HTTP error querying coordinated reach", "Please retry", 0);
                    });
                }
                catch (e) {
                    console.log("There was an error requesting available prosper predictions." + e);
                }
            };
            ProsperService.prototype.boundsToExtentArray = function (bounds) {
                return [
                    bounds.southWest.lng,
                    bounds.southWest.lat,
                    bounds.northEast.lng,
                    bounds.northEast.lat
                ];
            };
            ProsperService.prototype.getDisplayImageArray = function (srcElem) {
                return [
                    srcElem.width,
                    srcElem.height,
                    96
                ];
            };
            ProsperService.prototype.getPointArray = function (latlng) {
                return [
                    latlng.lng,
                    latlng.lat
                ];
            };
            ProsperService.prototype.getCleanLabel = function (label) {
                return label.replace(/[^_]*_|\.[^/.]+$/g, "");
            };
            ProsperService.prototype.queryExecute = function (url) {
                var _this = this;
                return this.Execute(new WiM.Services.Helpers.RequestInfo(url)).then(function (response) {
                    _this.toaster.clear();
                    if (response.data.error) {
                        console.log('query error');
                        throw response.data.error;
                    }
                    if (response.data.results.length > 0) {
                        return response.data.results.map(function (r) {
                            return {
                                "name": _this.getCleanLabel(r.layerName),
                                "value": r["attributes"]["Pixel Value"]
                            };
                        });
                    }
                }, function (error) {
                    throw error;
                });
            };
            return ProsperService;
        }(WiM.Services.HTTPServiceBase));
        factory.$inject = ['$http', '$q', 'toaster', 'StreamStats.Services.ModalService'];
        function factory($http, $q, toaster, modalService) {
            return new ProsperService($http, $q, toaster, modalService);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.ProsperService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
