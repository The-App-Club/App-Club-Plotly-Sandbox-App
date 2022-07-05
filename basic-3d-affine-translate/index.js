// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as THREE from 'three';

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.bottom = 0;
document.body.appendChild(stats.domElement);

let parameter = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
};

let controllerInfo = {
  'Translate X': parameter.translateX,
  'Translate Y': parameter.translateY,
  'Translate Z': parameter.translateZ,
};

const gui = new dat.GUI();
gui.width = 300;
const translate = gui.addFolder('Translate');
translate.add(controllerInfo, 'Translate X', -30, 30, 1).onChange((event) => {
  detectChangeParameter(event, 'Translate X');
});
translate.add(controllerInfo, 'Translate Y', -30, 30, 1).onChange((event) => {
  detectChangeParameter(event, 'Translate Y');
});
translate.add(controllerInfo, 'Translate Z', -30, 30, 1).onChange((event) => {
  detectChangeParameter(event, 'Translate Z');
});

function detectChangeParameter(event, keyName) {
  if (keyName === 'Translate X') {
    parameter.translateX = event;
  }
  if (keyName === 'Translate Y') {
    parameter.translateY = event;
  }
  if (keyName === 'Translate Z') {
    parameter.translateZ = event;
  }

  initialize();
}

function animating(x, y, z) {
  // https://plotly.com/javascript/animations/#animating-the-data
  Plotly.animate(
    'workspace',
    {
      data: [{x: x, y: y, z: z}],
      layout: {
        xaxis: {
          range: [-30, 30],
          fixedrange: true,
        },
        yaxis: {
          range: [-30, 30],
          fixedrange: true,
        },
        zaxis: {
          range: [-30, 30],
          fixedrange: true,
        },
      },
    },
    {
      transition: {
        duration: 500,
        easing: 'cubic-in-out',
      },
      frame: {
        duration: 500,
      },
    }
  );
}

function initialize() {
  x = [];
  y = [];
  z = [];

  const m = new THREE.Matrix4();
  m.makeTranslation(
    parameter.translateX,
    parameter.translateY,
    parameter.translateZ
  );
  v.applyMatrix4(m);

  x.push(v.x);
  y.push(v.y);
  z.push(v.z);

  animating(x, y, z);
}

let v = new THREE.Vector4(10, 10, 10, 1);

let x = [];
let y = [];
let z = [];

x.push(v.x);
y.push(v.y);
z.push(v.z);

Plotly.newPlot(
  'workspace',
  [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      opacity: 0.6,
    },
  ],
  {
    width: window.innerWidth,
    height: window.innerHeight,
    xaxis: {
      range: [-30, 30],
      fixedrange: true,
    },
    yaxis: {
      range: [-30, 30],
      fixedrange: true,
    },
    zaxis: {
      range: [-30, 30],
      fixedrange: true,
    },
  }
);
