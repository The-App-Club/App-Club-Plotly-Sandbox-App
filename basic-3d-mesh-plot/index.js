// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

let i,
  r,
  pointCount = 31;

const x = [];
const y = [];
const z = [];

for (let i = 0; i < pointCount; i++) {
  r = 10 * Math.cos(i / 10);
  x.push(r * Math.cos(i));
  y.push(r * Math.sin(i));
  z.push(i);
}

const nicePlot = Plotly.newPlot(
  'workspace',
  [
    {
      type: 'mesh3d',
      x: x,
      y: y,
      z: z,
      opacity: 0.8,
      color: `hsl(235, 100%, 50%, .5)`,
    },
  ],
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);

// https://plotly.com/javascript/animations/#animating-many-frames-quickly

let time = 0;
let frame = 0;
function loop() {
  time = frame / 60;
  if ((time * 60) | (0 == frame - 1)) {
    time += 0.000001;
  }
  frame++;

  // 固まる
  const color = ((frame * 100) / 360) % 360;
  const update = {
    color: `hsl(${color}, 100%, 50%, .5)`,
  };
  Plotly.restyle('workspace', update, 0);

  window.requestAnimationFrame(loop);
}

loop();
