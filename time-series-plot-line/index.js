import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';

function loadData(publicURL) {
  const resultInfoList = [];
  const x = [],
    y = [];

  function makePlotData(data, rowNumber) {
    x.push(data.AAPL_x);
    y.push(+data.AAPL_y);
  }

  return new Promise(async (resolve, reject) => {
    await d3.csv(publicURL, makePlotData);
    const plotDataInfo = {
      x: x,
      y: y,
      name: 'Apple stock price',
    };
    resolve(plotDataInfo);
  });
}

(async () => {
  // Section deals with buttons for time range selection
  const selectorOptions = {
    buttons: [
      {
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m',
      },
      {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y',
      },
      {
        step: 'all',
      },
    ],
  };

  // Next piece of code deals with responsiveness
  const WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 97;

  d3.select("div[id='workspace']")
    .attr('width', `${WIDTH_IN_PERCENT_OF_PARENT}%`)
    .attr('margin-left', `${(100 - WIDTH_IN_PERCENT_OF_PARENT) / 2}%`)
    .attr('height', `${HEIGHT_IN_PERCENT_OF_PARENT}vh`)
    .attr('margin-left', `${(100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2}vh`);

  const plodataInfo = await loadData(
    'https://raw.githubusercontent.com/plotly/datasets/master/2014_apple_stock.csv'
  );
  Plotly.newPlot(
    'workspace',
    [plodataInfo],
    {
      xaxis: {
        rangeselector: selectorOptions,
        rangeslider: {},
      },
      yaxis: {
        fixedrange: true,
        side: 'right',
      },
      showlegend: true,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    {
      showLink: false,
      displayModeBar: true,
    }
  );
  console.log(plodataInfo);

  // https://community.plotly.com/t/resize-of-plotly-chart/333
  //instruction resizes plot
  window.addEventListener('resize', () => {
    const resizedWidth = window.innerWidth;
    const resizedHeight = window.innerHeight;
    const update = {
      width: resizedWidth,
      height: resizedHeight,
    };
    Plotly.relayout('workspace', update);
  });
})();
