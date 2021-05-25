var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
        var StatisticsGroup = (function () {
            function StatisticsGroup() {
            }
            return StatisticsGroup;
        }());
        Services.StatisticsGroup = StatisticsGroup;
        Services.onScenarioExtensionChanged = "onScenarioExtensionChanged";
        Services.onScenarioExtensionResultsChanged = "onScenarioExtensionResultsChanged";
        var NSSEventArgs = (function (_super) {
            __extends(NSSEventArgs, _super);
            function NSSEventArgs(extensions, results) {
                if (extensions === void 0) { extensions = null; }
                if (results === void 0) { results = null; }
                var _this = _super.call(this) || this;
                _this.extensions = extensions;
                _this.results = results;
                return _this;
            }
            return NSSEventArgs;
        }(WiM.Event.EventArgs));
        Services.NSSEventArgs = NSSEventArgs;
        var nssService = (function (_super) {
            __extends(nssService, _super);
            function nssService($http, $q, toaster, modal, regionservice, eventManager) {
                var _this = _super.call(this, $http, configuration.baseurls['NSS']) || this;
                _this.$q = $q;
                _this.regionservice = regionservice;
                _this.eventManager = eventManager;
                _this.toaster = toaster;
                _this.modalService = modal;
                _this._onSelectedStatisticsGroupChanged = new WiM.Event.Delegate();
                _this._onQ10Loaded = new WiM.Event.Delegate();
                _this.clearNSSdata();
                return _this;
            }
            Object.defineProperty(nssService.prototype, "onSelectedStatisticsGroupChanged", {
                get: function () {
                    return this._onSelectedStatisticsGroupChanged;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(nssService.prototype, "onQ10Loaded", {
                get: function () {
                    return this._onQ10Loaded;
                },
                enumerable: false,
                configurable: true
            });
            nssService.prototype.clearNSSdata = function () {
                this.loadingParametersByStatisticsGroupCounter = 0;
                this.estimateFlowsCounter = 0;
                this.selectedStatisticsGroupList = [];
                this.statisticsGroupList = [];
                this.canUpdate = true;
                this.queriedRegions = false;
                this.isDone = false;
                this.reportGenerated = false;
            };
            nssService.prototype.loadStatisticsGroupTypes = function (rcode, regressionregions) {
                var _this = this;
                this.toaster.pop('wait', "Loading Available Scenarios", "Please wait...", 0);
                if (!rcode && !regressionregions)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupLookup'].format(rcode, regressionregions);
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.loadingStatisticsGroup = true;
                this.statisticsGroupList = [];
                this.Execute(request).then(function (response) {
                    if (response.data.length > 0) {
                        _this.loadingStatisticsGroup = false;
                        angular.forEach(response.data, function (value, key) {
                            _this.statisticsGroupList.push(value);
                            if (_this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && value.id == 5) {
                                var val = JSON.parse(JSON.stringify(value));
                                val.id += "_fdctm";
                                val.name = "Flow-Duration QPPQ Method";
                                _this.statisticsGroupList.push(val);
                            }
                        });
                    }
                    _this.toaster.clear();
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Loading Available Scenarios", "Please retry", 0);
                }).finally(function () {
                    _this.loadingStatisticsGroup = false;
                });
            };
            nssService.prototype.checkArrayForObj = function (arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], obj)) {
                        return i;
                    }
                }
                ;
                return -1;
            };
            nssService.prototype.loadParametersByStatisticsGroup = function (rcode, statisticsGroupID, regressionregions, percentWeights, regressionTypes) {
                var _this = this;
                if (this.loadingParametersByStatisticsGroupCounter == 0) {
                    this.toaster.pop('wait', "Loading Parameters by Statistics Group", "Please wait...", 0);
                }
                this.loadingParametersByStatisticsGroupCounter++;
                if (!rcode && !statisticsGroupID && !regressionregions)
                    return;
                var url = configuration.baseurls['NSS'] + configuration.queryparams['statisticsGroupParameterLookup'];
                if (this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && statisticsGroupID.toString().indexOf("_fdctm") > -1) {
                    statisticsGroupID = statisticsGroupID.replace("_fdctm", "");
                    url = url + "&extensions=QPPQ";
                }
                url = url.format(rcode, statisticsGroupID, regressionregions);
                if (regressionTypes != undefined) {
                    url += "&regressiontypes=" + regressionTypes;
                }
                var request = new WiM.Services.Helpers.RequestInfo(url, true);
                this.Execute(request).then(function (response) {
                    if (response.data[0].regressionRegions[0].extensions && response.data[0].regressionRegions[0].extensions.length > 0) {
                        var ext = response.data[0].regressionRegions[0].extensions;
                        _this.eventManager.RaiseEvent(Services.onScenarioExtensionChanged, _this, new NSSEventArgs(ext));
                    }
                    if (response.data[0].regressionRegions[0].parameters && response.data[0].regressionRegions[0].parameters.length > 0) {
                        if (_this.selectedStatisticsGroupList.length == 0) {
                            _this.selectedStatisticsGroupList.push({ 'name': "", 'id': "7", 'code': "", 'regressionRegions': [], 'citations': null, 'disclaimers': "" });
                        }
                        _this.selectedStatisticsGroupList.forEach(function (statGroup) {
                            if ((response.data[0].statisticGroupID == statGroup.id) ||
                                (_this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && typeof (statGroup.id) == 'string' && statGroup.id.indexOf(response.data[0].statisticGroupID, 0) > -1)) {
                                statGroup['statisticGroupName'] = statGroup.name;
                                statGroup['statisticGroupID'] = statGroup.id.toString().replace("_fdctm", "");
                                response.data[0].regressionRegions.forEach(function (regressionRegion) {
                                    if (percentWeights.length > 0) {
                                        percentWeights.forEach(function (regressionRegionPercentWeight) {
                                            if (regressionRegionPercentWeight.code.indexOf(regressionRegion.code.toUpperCase()) > -1) {
                                                regressionRegion["percentWeight"] = regressionRegionPercentWeight.percentWeight;
                                            }
                                        });
                                    }
                                });
                                statGroup.regressionRegions = response.data[0].regressionRegions;
                                _this._onSelectedStatisticsGroupChanged.raise(null, WiM.Event.EventArgs.Empty);
                            }
                        });
                    }
                }, function (error) {
                    _this.toaster.clear();
                    _this.toaster.pop('error', "There was an error Loading Parameters by Statistics Group", "Please retry", 0);
                }).finally(function () {
                    _this.loadingParametersByStatisticsGroupCounter--;
                    if (_this.loadingParametersByStatisticsGroupCounter == 0) {
                        _this.toaster.clear();
                    }
                });
            };
            nssService.prototype.estimateFlows = function (studyAreaParameterList, paramValueField, rcode, append, regressionTypes, showReport) {
                var _this = this;
                if (append === void 0) { append = false; }
                if (showReport === void 0) { showReport = true; }
                if (!this.canUpdate && !append)
                    return;
                this.selectedStatisticsGroupList.forEach(function (statGroup) {
                    _this.canUpdate = false;
                    if (_this.estimateFlowsCounter == 0) {
                        _this.toaster.pop('wait', "Estimating Flows", "Please wait...", 0);
                    }
                    _this.estimateFlowsCounter++;
                    _this.cleanRegressionRegions(statGroup.regressionRegions);
                    statGroup.regressionRegions.forEach(function (regressionRegion) {
                        regressionRegion.parameters.forEach(function (regressionParam) {
                            studyAreaParameterList.forEach(function (param) {
                                if (regressionParam.code.toLowerCase() == param.code.toLowerCase()) {
                                    regressionParam.value = param[paramValueField];
                                }
                            });
                        });
                    });
                    var updatedScenarioObject = angular.fromJson(angular.toJson(statGroup));
                    updatedScenarioObject.regressionRegions.forEach(function (regressionRegion) {
                        if (regressionRegion.results)
                            delete regressionRegion.results;
                        if (regressionRegion.extensions)
                            regressionRegion.extensions.forEach(function (e) {
                                if (e.result)
                                    delete e.result;
                            });
                    });
                    updatedScenarioObject = angular.toJson([updatedScenarioObject], null);
                    var url = configuration.baseurls['NSS'] + configuration.queryparams['estimateFlows'].format(rcode);
                    if (_this.regionservice.selectedRegion.Applications.indexOf("FDCTM") > -1 && typeof statGroup.id == "string" && statGroup.id.indexOf("_fdctm") > -1) {
                        url = url + "&extensions=QPPQ";
                    }
                    if (regressionTypes != "" && regressionTypes != undefined) {
                        url += "&regressiontypes=" + regressionTypes;
                    }
                    var request = new WiM.Services.Helpers.RequestInfo(url, true, 1, 'json', updatedScenarioObject);
                    statGroup.citations = [];
                    _this.Execute(request).then(function (response) {
                        var citationUrl = response.data[0].links[0].href;
                        var regregionCheck = citationUrl.split("regressionregions=")[1];
                        if (!append && regregionCheck && regregionCheck.length > 0)
                            _this.getSelectedCitations(citationUrl, statGroup);
                        if (response.headers()['x-usgswim-messages']) {
                            var headerMsgs = response.headers()['x-usgswim-messages'].split(';');
                            statGroup.disclaimers = {};
                            headerMsgs.forEach(function (item) {
                                var headerMsg = item.split(':');
                                if (headerMsg[0] == 'warning')
                                    statGroup.disclaimers['Warnings'] = headerMsg[1].trim();
                                if (headerMsg[0] == 'error')
                                    statGroup.disclaimers['Error'] = headerMsg[1].trim();
                            });
                        }
                        if (response.data[0].regressionRegions.length > 0 && response.data[0].regressionRegions[0].results && response.data[0].regressionRegions[0].results.length > 0) {
                            if (!append) {
                                response.data[0].regressionRegions.forEach(function (rr) {
                                    if (rr.extensions) {
                                        rr.extensions.forEach(function (e) {
                                            var extension = statGroup.regressionRegions.filter(function (r) { return r.name == rr.name; })[0].extensions.filter(function (ext) { return ext.code == e.code; })[0];
                                            e.parameters.forEach(function (p) {
                                                p.options = extension.parameters.filter(function (param) { return param.code == p.code; })[0].options;
                                            });
                                        });
                                        _this.eventManager.RaiseEvent(Services.onScenarioExtensionResultsChanged, _this, new NSSEventArgs(null, rr.extensions));
                                    }
                                });
                                statGroup.regressionRegions = [];
                                statGroup.regressionRegions = response.data[0].regressionRegions;
                            }
                            else {
                                statGroup.regressionRegions.forEach(function (rr) {
                                    rr.parameters.forEach(function (p) {
                                        var responseRegions = response.data[0].regressionRegions;
                                        for (var i = 0; i < responseRegions.length; i++) {
                                            if (responseRegions[i].id === rr.id) {
                                                for (var j = 0; j < responseRegions[i].parameters.length; j++) {
                                                    if (responseRegions[i].Parameters[j].code == p.code) {
                                                        p[paramValueField] = responseRegions[i].parameters[j].value;
                                                    }
                                                }
                                            }
                                        }
                                        ;
                                    });
                                    rr.results.forEach(function (r) {
                                        var responseRegions = response.data[0].regressionRegions;
                                        for (var i = 0; i < responseRegions.length; i++) {
                                            if (responseRegions[i].id === rr.id) {
                                                for (var j = 0; j < responseRegions[i].results.length; j++) {
                                                    if (responseRegions[i].results[j].code == r.code) {
                                                        r[paramValueField] = responseRegions[i].results[j].value;
                                                    }
                                                }
                                            }
                                        }
                                        ;
                                    });
                                });
                            }
                        }
                        else {
                            _this.toaster.clear();
                            _this.toaster.pop('error', "There was an error Estimating Flows for " + statGroup.name, "No results were returned", 0);
                        }
                    }, function (error) {
                        _this.toaster.clear();
                        _this.toaster.pop('error', "There was an error Estimating Flows", "HTTP request error", 0);
                    }).finally(function () {
                        _this.estimateFlowsCounter--;
                        if (_this.estimateFlowsCounter < 1) {
                            _this.toaster.clear();
                            _this.estimateFlowsCounter = 0;
                            _this.canUpdate = true;
                            if (showReport) {
                                _this.modalService.openModal(Services.SSModalType.e_report);
                                _this.reportGenerated = true;
                            }
                        }
                        _this._onQ10Loaded.raise(null, WiM.Event.EventArgs.Empty);
                    });
                });
            };
            nssService.prototype.getSelectedCitations = function (citationUrl, statGroup) {
                var _this = this;
                var url;
                if (citationUrl.indexOf('https://') == -1)
                    url = 'https://' + citationUrl;
                else
                    url = citationUrl;
                var request = new WiM.Services.Helpers.RequestInfo(url, true, 0, 'json');
                this.Execute(request).then(function (response) {
                    if (response.data[0] && response.data[0].id) {
                        angular.forEach(response.data, function (value, key) {
                            statGroup.citations.push(value);
                        });
                    }
                }, function (error) {
                    _this.toaster.pop('error', "There was an error getting selected Citations for " + statGroup.name, "No results were returned", 0);
                }).finally(function () {
                });
            };
            nssService.prototype.getflattenNSSTable = function (name) {
                var result = [];
                try {
                    this.selectedStatisticsGroupList.forEach(function (sgroup) {
                        sgroup.regressionRegions.forEach(function (regRegion) {
                            regRegion.results.forEach(function (regResult) {
                                result.push({
                                    Name: name,
                                    Region: regRegion.percentWeight ? regRegion.percentWeight.toFixed(1) + "% " + regRegion.name : regRegion.name,
                                    Statistic: regResult.name,
                                    Code: regResult.code,
                                    Value: regResult.value.toUSGSvalue(),
                                    Unit: regResult.unit.unit,
                                    Disclaimers: regRegion.disclaimer ? regRegion.disclaimer : undefined,
                                    Errors: (regResult.errors && regResult.errors.length > 0) ? regResult.errors.map(function (err) { return err.name + " : " + err.value; }).join(', ') : undefined,
                                    MaxLimit: regResult.intervalBounds && regResult.intervalBounds.upper > 0 ? regResult.intervalBounds.upper.toUSGSvalue() : undefined,
                                    MinLimit: regResult.intervalBounds && regResult.intervalBounds.lower > 0 ? regResult.intervalBounds.lower.toUSGSvalue() : undefined,
                                    EquivYears: regResult.equivalentYears ? regResult.equivalentYears : undefined
                                });
                            });
                        });
                    });
                }
                catch (e) {
                    result.push({ Disclaimers: "Failed to output flowstats to table. " });
                }
                return result;
            };
            nssService.prototype.cleanRegressionRegions = function (RegressionRegions) {
                for (var i = 0; i < RegressionRegions.length; i++) {
                    var regRegion = RegressionRegions[i];
                    if (regRegion.name === 'Area-Averaged') {
                        RegressionRegions.splice(i, 1);
                        continue;
                    }
                    RegressionRegions.forEach(function (regressionRegion) {
                        if (regressionRegion.Results)
                            delete regressionRegion.Results;
                    });
                }
            };
            return nssService;
        }(WiM.Services.HTTPServiceBase));
        factory.$inject = ['$http', '$q', 'toaster', 'StreamStats.Services.ModalService', 'StreamStats.Services.RegionService', 'WiM.Event.EventManager'];
        function factory($http, $q, toaster, modal, regionservice, eventManager) {
            return new nssService($http, $q, toaster, modal, regionservice, eventManager);
        }
        angular.module('StreamStats.Services')
            .factory('StreamStats.Services.nssService', factory);
    })(Services = StreamStats.Services || (StreamStats.Services = {}));
})(StreamStats || (StreamStats = {}));
