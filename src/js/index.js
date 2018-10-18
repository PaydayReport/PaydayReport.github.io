import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import {unByKey} from 'ol/Observable.js';
import View from 'ol/View.js';
import {defaults as defaultControls} from 'ol/control.js';
import {easeOut} from 'ol/easing.js';
import Point from 'ol/geom/Point.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {fromLonLat} from 'ol/proj.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Stroke, Style} from 'ol/style.js';


var map = new Map({
  layers: [
  new TileLayer({
    source: new OSM({
      wrapX: false
    })
  })
  ],
  controls: defaultControls({
    attributionOptions: {
      collapsible: false
    }
  }),
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1
  })
});

var source = new VectorSource({
  wrapX: false
});
var vector = new VectorLayer({
  source: source
});
map.addLayer(vector);

function addRandomFeature() {
  var x = Math.random() * 360 - 180;
  var y = Math.random() * 180 - 90;
  var geom = new Point(fromLonLat([x, y]));
  var feature = new Feature(geom);
  source.addFeature(feature);
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

source.on('addfeature', function(e) {
  flash(e.feature);
});

window.setInterval(addRandomFeature, 1000);