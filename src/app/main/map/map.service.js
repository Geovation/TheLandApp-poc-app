(function() {
  'use strict';

  angular
    .module('LandApp')
    .service('mapService', ['ol', '$log', 'proj4', mapService]);

  /** @ngInject */
  function mapService(ol, $log, proj4) {
    // define EPSG:27700
    proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");

    // TODO: remove this hard code
    // var timsFarm = ol.proj.fromLonLat([-0.658493, 51.191286]);
    var jamesFarm = ol.proj.fromLonLat([-1.315305, 51.324901]);

    // name: ol's layer
    var osLayers = {};
    var currentBaseMap = {};
    var view = {};
    var map = {};

    var service = {
      createMap: createMap,
      setBaseMap: setBaseMap,
      toggleLayerFromCheckProperty: toggleLayerFromCheckProperty
    };

    return service;


    ///////////////
    function createMap() {
      view = new ol.View({
        center: jamesFarm,
        maxZoom: 20,
        minZoom: 7,
        zoom: 13
      });

      map = new ol.Map({
        target: 'map',
        layers: [],
        loadTilesWhileAnimating: true,
        view: view,
        controls: []
      });
    }

    function addLayer(layer) {
      buildAndCacheLayer(layer);
      map.addLayer(osLayers[layer.name]);
    }

    function removeLayer(layer) {
      buildAndCacheLayer(layer);
      map.removeLayer(osLayers[layer.name]);
    }

    function toggleLayerFromCheckProperty(layer) {
      if (layer.checked) {
        addLayer(layer);
      } else {
        removeLayer(layer);
      }
    }

    function buildAndCacheLayer(layer) {
      if (!osLayers[layer.name]) {
        switch (layer.type) {
          case 'xyz':
            osLayers[layer.name] = new ol.layer.Tile({
                source: new ol.source.XYZ({
                  url: layer.url
                })
              });
            break;
          case 'osm':
            osLayers[layer.name] = new ol.layer.Tile({
                source: new ol.source.OSM()
              });
            break;
          case 'vector':
            osLayers[layer.name] = new ol.layer.Vector({
              source: new ol.source.Vector({
                url: layer.url,
                format: new ol.format.GeoJSON({
                  defaultDataProjection: layer.projection
                })
              }),
              style: new ol.style.Style({
                fill: new ol.style.Fill({
                  color: layer.fillColor,
                }),
                stroke: new ol.style.Stroke({
                  color: layer.strokeColer,
                  width: layer.strokeWidth
                })
              })
            });
            break;
          default:
            $log.log("layer type '" + layer.type + "' not defined");
        }
      }
    } //buildAndCacheLayer

    function setBaseMap(baseMap) {
      removeLayer(currentBaseMap);
      currentBaseMap = baseMap;
      addLayer(currentBaseMap);
    }
    
  } // mapService


  ///////////////






  // function addBaseMaps(map) {
  //   angular.forEach(baseMapLayers, function(layerDefinition) {
  //     if (layerDefinition.layer) {
  //       map.addLayer(layerDefinition.layer);
  //     }
  //   });
  // }

  // var baseMapLayers = [{
  //     name: "Open Street Map",
  //     layer: new ol.layer.Tile({
  //       source: new ol.source.OSM()
  //     })
  //   }, {
  //     name: "Aerial",
  //     layer: new ol.layer.Tile({
  //       source: new ol.source.XYZ({
  //         url: "https://api.tiles.mapbox.com/v4/truetoffee.a6d1c57e/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidHJ1ZXRvZmZlZSIsImEiOiJPU2NGeVpNIn0.ZJjeKACNei3rl6k9KLzJlA"
  //       })
  //     })
  //   }, {
  //     name: "Ordnance Survey",
  //     disabled: true
  //   }
  // ];
  //
  // var map = {
  //   basemap: baseMapLayers[0],
  //   enabledFarmLayers: [],
  //   enabledEnvironmentalLayers: [],
  // };

  // var environmentalLayers = [{
  //     name: 'Ancient Woodland',
  //     layer: new ol.layer.Vector({
  //       source: new ol.source.Vector({
  //         url: "/data/geojson/Ancient_Woodland_England_clipped.geojson",
  //         format: new ol.format.GeoJSON({
  //           defaultDataProjection: "EPSG:27700"
  //         })
  //       }),
  //
  //       style: new ol.style.Style({
  //         fill: new ol.style.Fill({
  //           color: "rgba(176, 23, 21, 0.5)",
  //         }),
  //         stroke: new ol.style.Stroke({
  //           color: "rgba(176, 23, 21, 1)",
  //           width: 2
  //         })
  //       })
  //     })
  //   }, {
  //     name: 'AONB',
  //     layer: new ol.layer.Vector({
  //       source: new ol.source.Vector({
  //         url: "/data/geojson/AONB_clipped.geojson",
  //         format: new ol.format.GeoJSON({
  //           defaultDataProjection: "EPSG:27700"
  //         })
  //       }),
  //       style: new ol.style.Style({
  //         fill: new ol.style.Fill({
  //           color: "rgba(176, 23, 21, 0.5)",
  //         }),
  //         stroke: new ol.style.Stroke({
  //           color: "rgba(176, 23, 21, 1)",
  //           width: 2
  //         })
  //       })
  //     })
  //   }, {
  //     name: 'SSSI',
  //     layer: new ol.layer.Vector({
  //       source: new ol.source.Vector({
  //         url: "/data/geojson/Sites_of_special_scientific_interest_england_clipped.geojson",
  //         format: new ol.format.GeoJSON({
  //           defaultDataProjection: "EPSG:27700"
  //         })
  //       }),
  //       style: new ol.style.Style({
  //         fill: new ol.style.Fill({
  //           color: "rgba(176, 23, 21, 0.5)",
  //         }),
  //         stroke: new ol.style.Stroke({
  //           color: "rgba(176, 23, 21, 1)",
  //           width: 2
  //         })
  //       })
  //     })
  //   }];

  // var farmLayers = [{
  //     name: 'Land Registry',
  //     layer: new ol.layer.Vector({
  //       source: new ol.source.Vector({
  //         // url: "/data/geojson/land_registry_boundaries.geojson",
  //         url: "/data/geojson/watership_down_pif.geojson",
  //         format: new ol.format.GeoJSON({
  //           defaultDataProjection: "EPSG:27700"
  //         })
  //       }),
  //       style: new ol.style.Style({
  //         fill: new ol.style.Fill({
  //           color: "rgba(176, 23, 21, 0.5)",
  //         }),
  //         stroke: new ol.style.Stroke({
  //           color: "rgba(176, 23, 21, 1)",
  //           width: 2
  //         })
  //       })
  //     })
  //   }, {
  //     name: 'RPA Boundaries',
  //     layer: new ol.layer.Vector({
  //       source: new ol.source.Vector({
  //         // url: "/data/geojson/rpa_field_boundaries.geojson",
  //         url: "/data/geojson/watership_down_rpa.geojson",
  //         format: new ol.format.GeoJSON({
  //           defaultDataProjection: "EPSG:27700"
  //         })
  //       }),
  //       style: new ol.style.Style({
  //         fill: new ol.style.Fill({
  //           color: "rgba(255, 165, 0, 0.5)",
  //         }),
  //         stroke: new ol.style.Stroke({
  //           color: "rgba(255, 165, 0, 1)",
  //           width: 2
  //         })
  //       })
  //     })
  //   }, {
  //     name: "LR Vectors",
  //     layer: new ol.layer.Vector({
  //       title: 'added Layer',
  //       //maxResolution:1.75,
  //       maxResolution: 5,
  //       eventListeners: {
  //         featureClick: function(e) {
  //           console.log(e.object.name, e.feature.id);
  //           return false;
  //         }
  //       },
  //       source: new ol.source.Vector({
  //         format: new ol.format.GeoJSON(),
  //         strategy: ol.loadingstrategy.bbox,
  //         loader: function(extent, resolution, projection) {
  //           // wgs84
  //           extent = ol.proj.transformExtent(extent, "EPSG:3857", "EPSG:4326");
  //           var url = "https://api.vectorspace.io/spaces/27085816987650/layers/27790585888771/features?bbox=" + extent.join() + ",4326&key=22749233807361";
  //
  //           var layer = this;
  //
  //           this.$http({
  //             method: 'GET',
  //             url: url,
  //             headers: {
  //               "Accept": "application/json;srid=4326"
  //             }
  //           }).then(function(response) {
  //             if (response.data) {
  //               var features = (new ol.format.GeoJSON()).readFeatures(response.data, {dataProjection: "EPSG:4326", featureProjection: projection});
  //
  //               var src = this.myFarmLayers[2].layer.getSource();
  //               src['addFeatures'](features);
  //               console.log('new featurecount:', src['getFeatures']().length);
  //             }
  //           });
  //         }
  //       })
  //     })
  //   }];

})();
