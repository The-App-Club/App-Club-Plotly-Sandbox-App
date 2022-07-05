import Plotly from 'plotly.js-dist-min';
import * as math from 'mathjs';
import * as d3 from 'd3';

// https://kumpei.ikuta.me/benchmark-normal-variates/
// https://observablehq.com/@sw1227/box-muller-transform
// Generate n samples from standard normal distribution
function boxMuller(n) {
  const samples = [];
  Array(Math.ceil(n / 2))
    .fill()
    .forEach((_) => {
      const R = Math.sqrt(-2 * Math.log(Math.random()));
      const theta = 2 * Math.PI * Math.random();
      samples.push(R * Math.cos(theta)); // z1
      samples.push(R * Math.sin(theta)); // z2
    });
  // if n is odd, drop the last element
  return samples.slice(0, n);
}

function choleskyDecomposition(matrix) {
  // https://observablehq.com/@sw1227/cholesky-decomposition

  // Argument "matrix" can be either math.matrix or standard 2D array
  const A = math.matrix(matrix);
  // Matrix A must be symmetric
  console.assert(math.deepEqual(A, math.transpose(A)));

  const n = A.size()[0];
  // Prepare 2D array with 0
  const L = new Array(n).fill(0).map((_) => new Array(n).fill(0));

  d3.range(n).forEach((i) => {
    d3.range(i + 1).forEach((k) => {
      const s = d3.sum(d3.range(k).map((j) => L[i][j] * L[k][j]));
      L[i][k] =
        i === k
          ? math.sqrt(A.get([k, k]) - s)
          : (1 / L[k][k]) * (A.get([i, k]) - s);
    });
  });
  return L;
}

function multivariateNormal(mean, covArray) {
  // https://observablehq.com/@sw1227/multivariate-normal-distribution
  const n = mean.length;
  const cov = math.matrix(covArray);

  return {
    // Probability Density Function
    pdf: (x) => {
      const c = 1 / (math.sqrt(2 * math.PI) ** n * math.sqrt(math.det(cov)));
      return (
        c *
        math.exp(
          -(1 / 2) *
            math.multiply(
              math.subtract(math.matrix(x), math.matrix(mean)),
              math.inv(cov),
              math.subtract(math.matrix(x), math.matrix(mean))
            )
        )
      );
    },
    // Differential entropy
    entropy:
      0.5 * math.log(math.det(cov)) + 0.5 * n * (1 + math.log(2 * math.PI)),
    // Generate n samples using Cholesky Decomposition
    sample: (n_samples) =>
      Array(n_samples)
        .fill()
        .map((_) => {
          const L = choleskyDecomposition(cov);
          const z = boxMuller(n);
          return math
            .add(math.matrix(mean), math.multiply(cov, math.matrix(z)))
            .toArray();
        }),
  };
}

const norm = multivariateNormal(
  [0, 0],
  [
    [1, 0],
    [0, 1],
  ]
);

function makePlotData(dataList) {
  const x = [],
    y = [];
  for (let index = 0; index < dataList.length; index++) {
    const data = dataList[index];
    x.push(data[0]);
    y.push(data[1]);
  }
  const plotDataInfo = {
    mode: 'markers',
    type: 'scatter',
    x: x,
    y: y,
    name: 'Gaussian 2D Dimension',
  };
  return plotDataInfo;
}

// https://github.com/ae14watanabe/high-dimensional_gaussian_is_like_sphere/blob/master/samples_2d_gauss.py#L6
Plotly.newPlot('workspace', [makePlotData(norm.sample(5000))], {
  showlegend: true,
  width: window.innerWidth,
  height: window.innerHeight,
});
