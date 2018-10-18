import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import {unByKey} from 'ol/Observable.js';
import View from 'ol/View.js';
import {defaults as defaultControls, FullScreen} from 'ol/control.js';
import {easeOut} from 'ol/easing.js';
import Point from 'ol/geom/Point.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {fromLonLat} from 'ol/proj.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style} from 'ol/style.js';


const randomDotSource = new VectorSource({ wrapX: false });

var map = new Map({
  target: document.getElementById('map'),
  loadTilesWhileAnimating: true,
  view: new View({
    center: [-5639523.95, -3501274.52],
    zoom: 10,
    minZoom: 2,
    maxZoom: 19
  }),
  controls: defaultControls().extend([
    new FullScreen({
      source: 'fullscreen',
    }),
  ]),
  layers: [
    new TileLayer({
      source: new OSM({
        wrapX: false
      })
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            type: 'icon',
            geometry: new Point([-5639523.95, -3501274.52])
          })
        ]
      }),
      style(feature) {
        return new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: 'https://paydayreport.github.io/dist/images/icon.png'
          })
        });
      }
    }),
    new VectorLayer({ source: randomDotSource })
  ]
});

let count = 30;

let theRandomFeatureInterval;

function addRandomFeature() {
  if (!count--) {
    clearInterval(theRandomFeatureInterval);
    return;
  }
  var x = Math.random() * 360 - 180;
  var y = Math.random() * 180 - 90;
  var geom = new Point(fromLonLat([x, y]));
  var feature = new Feature(geom);
  randomDotSource.addFeature(feature);
}

var duration = 3000;
function flash(feature) {
  var start = new Date().getTime();
  var listenerKey = map.on('postcompose', animate);

  function animate(event) {
    var vectorContext = event.vectorContext;
    var frameState = event.frameState;
    var flashGeom = feature.getGeometry().clone();
    var elapsed = frameState.time - start;
    var elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    var radius = easeOut(elapsedRatio) * 25 + 5;
    var opacity = easeOut(1 - elapsedRatio);

    var style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity
        })
      })
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    if (elapsed > duration) {
      unByKey(listenerKey);
      return;
    }
    // tell OpenLayers to continue postcompose animation
    map.render();
  }
}

randomDotSource.on('addfeature', function(e) {
  flash(e.feature);
});

theRandomFeatureInterval = window.setInterval(addRandomFeature, 1000);