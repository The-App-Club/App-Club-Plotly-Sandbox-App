// https://codepen.io/ajoposor/pen/RKGGOG?editors=0010
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

function loadData() {
  const resultInfoList = [];
  const x = [],
    y = [],
    z = [],
    color = [];
  function makePlotData(data, rowNumber) {
    x.push(+data.x);
    y.push(+data.y);
    z.push(+data.z);
    color.push(+data.color);
  }

  return new Promise(async (resolve, reject) => {
    await d3.csv(
      'https://raw.githubusercontent.com/plotly/datasets/master/3d-line1.csv',
      makePlotData
    );
    const plotDataInfo = {
      type: 'scatter3d',
      mode: 'lines',
      x: x,
      y: y,
      z: z,
      opacity: 1,
      line: {
        width: 6,
        color: color,
        reversescale: false,
      },
    };
    resolve(plotDataInfo);
  });
}

(async () => {
  const plotDataInfoList = await loadData();
  Plotly.newPlot('workspace', [plotDataInfoList], {
    height: 640,
  });
})();
