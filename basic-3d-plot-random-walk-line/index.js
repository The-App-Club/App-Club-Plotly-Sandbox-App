// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

function loadData() {
  const x1 = [],
    y1 = [],
    z1 = [];
  const x2 = [],
    y2 = [],
    z2 = [];
  const x3 = [],
    y3 = [],
    z3 = [];

  function makePlotData(data, rowNumber) {
    x1.push(+data.x1);
    y1.push(+data.y1);
    z1.push(+data.z1);
    x2.push(+data.x2);
    y2.push(+data.y2);
    z2.push(+data.z2);
    x3.push(+data.x3);
    y3.push(+data.y3);
    z3.push(+data.z3);
  }

  return new Promise(async (resolve, reject) => {
    await d3.csv(
      'https://raw.githubusercontent.com/plotly/datasets/master/_3d-line-plot.csv',
      makePlotData
    );
    resolve({
      trace1: {x: x1, y: y1, z: z1},
      trace2: {x: x2, y: y2, z: z2},
      trace3: {x: x3, y: y3, z: z3},
    });
  });
}

(async () => {
  const loadedData = await loadData();

  const trace1 = {
    x: loadedData['trace1'].x,
    y: loadedData['trace1'].y,
    z: loadedData['trace1'].z,
    mode: 'lines',
    marker: {
      color: '#1f77b4',
      size: 12,
      symbol: 'circle',
      line: {
        color: 'rgb(0,0,0)',
        width: 0,
      },
    },
    line: {
      color: '#1f77b4',
      width: 1,
    },
    type: 'scatter3d',
  };

  const trace2 = {
    x: loadedData['trace2'].x,
    y: loadedData['trace2'].y,
    z: loadedData['trace2'].z,
    mode: 'lines',
    marker: {
      color: '#9467bd',
      size: 12,
      symbol: 'circle',
      line: {
        color: 'rgb(0,0,0)',
        width: 0,
      },
    },
    line: {
      color: 'rgb(44, 160, 44)',
      width: 1,
    },
    type: 'scatter3d',
  };

  const trace3 = {
    x: loadedData['trace3'].x,
    y: loadedData['trace3'].y,
    z: loadedData['trace3'].z,
    mode: 'lines',
    marker: {
      color: '#bcbd22',
      size: 12,
      symbol: 'circle',
      line: {
        color: 'rgb(0,0,0)',
        width: 0,
      },
    },
    line: {
      color: '#bcbd22',
      width: 1,
    },
    type: 'scatter3d',
  };

  const data = [trace1, trace2, trace3];
  const layout = {
    title: '3D Line Plot',
    autosize: false,
    width: 500,
    height: 500,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 65,
    },
  };

  Plotly.newPlot('workspace', data, layout);
})();
