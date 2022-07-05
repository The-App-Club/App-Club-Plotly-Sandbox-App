// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

let i,
  r,
  pointCount = 31;

const x = [];
const y = [];
const z = [];
const c = [];

for (let i = 0; i < pointCount; i++) {
  r = 10 * Math.cos(i / 10);
  x.push(r * Math.cos(i));
  y.push(r * Math.sin(i));
  z.push(i);
  c.push(i);
}

Plotly.newPlot(
  'workspace',
  [
    {
      type: 'scatter3d',
      mode: 'lines+markers',
      x: x,
      y: y,
      z: z,
      line: {
        width: 6,
        color: c,
        colorscale: 'Viridis',
      },
      marker: {
        size: 3.5,
        color: c,
        colorscale: 'Greens',
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
