import * as THREE from 'three';
// https://tympanus.net/codrops/2021/08/31/surface-sampling-in-three-js/
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

let geoInfo;

function objectLoader() {
  return new Promise((resolve, reject) => {
    function handleSuccess(e) {
      const normalizedInfo = e.children[0].geometry.attributes.normal;

      const objectInfo = {
        array: normalizedInfo.array,
        count: normalizedInfo.count,
        groupSize: normalizedInfo.itemSize,
      };

      resolve(['handleSuccess', objectInfo]);
    }
    function handleProgress(e) {
      console.log('handleProgress', e);
    }
    function handleError(e) {
      reject(['handleError', e]);
    }
    new OBJLoader().load(
      './models/Mesh_Elephant.obj',
      handleSuccess,
      handleProgress,
      handleError
    );
  });
}

function niceForamt(objectInfo) {
  let x = [],
    y = [],
    z = [];
  for (let index = 0; index < objectInfo.array.length; index++) {
    if (index % objectInfo.groupSize === 0) {
      x.push(objectInfo.array[index]);
    }
    if (index % objectInfo.groupSize === 1) {
      y.push(objectInfo.array[index]);
    }
    if (index % objectInfo.groupSize === 2) {
      z.push(objectInfo.array[index]);
    }
  }
  return [x, y, z];
}

function visualize([x, y, z]) {
  Plotly.newPlot(
    'workspace',
    [
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: x,
        y: y,
        z: z,
        marker: {
          size: 3.5,
          cmin: -20,
          cmax: 50,
        },
      },
    ],
    {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  );
}

(async () => {
  try {
    const [message, resultInfo] = await objectLoader();
    visualize(niceForamt(resultInfo));
  } catch (error) {
    console.log(error);
  }
})();
