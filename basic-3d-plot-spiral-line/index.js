// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

let i,
  r,
  pointCount = 3142;

const x = [];
const y = [];
const z = [];
const c = [];

for (let i = 0; i < pointCount; i++) {
  r = i * (pointCount - i);
  x.push(r * Math.cos(i / 30));
  y.push(r * Math.sin(i / 30));
  z.push(i);
  c.push(i);
}

Plotly.newPlot(
  'workspace',
  [
    {
      type: 'scatter3d',
      mode: 'lines',
      x: x,
      y: y,
      z: z,
      opacity: 0.6,
      line: {
        width: 10,
        color: c,
        colorscale: 'Viridis',
      },
    },
  ],
  {
    width: window.innerWidth,
    height: window.innerHeight,
  }
);
