// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// https://github.com/ae14watanabe/high-dimensional_gaussian_is_like_sphere/blob/master/pdf_1d_gauss.py#L5

const x = d3.range(-4, 4, 8 / 100);
const n = x
  .map((_) => {
    return _ ** 2;
  })
  .map((_) => {
    return -0.5 * _;
  })
  .map((_) => {
    return Math.exp(_);
  });
const m = Math.sqrt(2.0 * Math.PI);

const y = n.map((_) => {
  return _ / m;
});

Plotly.newPlot(
  'workspace',
  [
    {
      x: x,
      y: y,
      name: 'Gaussian 1 Dimesion',
    },
  ],
  {
    showlegend: true,
    width: window.innerWidth,
    height: window.innerHeight,
  }
);
