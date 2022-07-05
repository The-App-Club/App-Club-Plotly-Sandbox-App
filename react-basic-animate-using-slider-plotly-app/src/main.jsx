import {createRoot} from 'react-dom/client';
import {
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import gsap, {Linear} from 'gsap';
import {css, cx} from '@emotion/css';
import '@fontsource/inter';
import './styles/index.scss';
import {Button, Slider} from '@mui/material';
import * as d3 from 'd3';
import {range} from 'mathjs';
import {useDwitterFrame} from './hooks/useDwitterFrame';
import {MathUtils} from 'three';
import {wrap} from 'popmotion';
import {useTransition, animated} from 'react-spring';
import {transform} from 'framer-motion';
import {samples} from 'culori';
import Plotly from 'plotly.js-dist-min';
import {default as chance} from 'chance';
import dayjs from 'dayjs';

const data = [...Array(60)].map((n, index) => {
  return {
    productName: chance(index).name(),
    price: chance(index).integer({min: 10, max: 200}),
    createdAt: dayjs().add(index, 'days').format('YYYY-MM-DD'),
    seq: index + 1,
  };
});
const getDomain = (data, key) => {
  const {min, max} = data.reduce(
    (acc, row) => {
      return {
        min: Math.min(acc.min, row[key]),
        max: Math.max(acc.max, row[key]),
      };
    },
    {min: Infinity, max: -Infinity}
  );
  return {min, max};
};

const size = () => {
  let resizedWidth = window.innerWidth;
  let resizedHeight = window.innerHeight;
  if (window.matchMedia(`(max-width: 768px)`).matches) {
    if (window.matchMedia('(orientation:portrait)').matches) {
      resizedWidth = window.innerWidth * 0.9;
      resizedHeight = window.innerHeight * 0.6;
    } else {
      resizedWidth = window.innerWidth * 0.9;
      resizedHeight = window.innerHeight * 0.9;
    }
  } else {
    resizedWidth = 600;
    resizedHeight = 400;
  }
  return {width: resizedWidth, height: resizedHeight};
};

const App = () => {
  const requestRef = useRef();
  const graphDomRef = useRef(null);

  useEffect(() => {
    const graphDom = graphDomRef.current;
    const {min: minX, max: maxX} = getDomain(data, `createdAt`);
    const {min: minY, max: maxY} = getDomain(data, `price`);
    Plotly.newPlot(
      graphDom,
      [
        {
          x: data.map((item) => {
            return item.createdAt;
          }),
          y: data.map((item) => {
            return item.price * (Math.random() - 1);
          }),
          name: 'line1',
          type: 'scatter',
          mode: 'lines+markers',
          line: {
            color: '#feaa56',
          },
          marker: {
            color: `#ec7105`,
          },
        },
        {
          x: data.map((item) => {
            return item.createdAt;
          }),
          y: data.map((item) => {
            return item.price;
          }),
          name: 'line2',
          type: 'scatter',
          mode: 'lines+markers',
          line: {
            color: '#17a4cf',
          },
          marker: {
            color: `#1751cf`,
          },
        },
      ],
      {
        xaxis: {
          range: [Math.min(minX), Math.max(maxX)],
          rangeselector: {
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
                step: 'day',
                count: 7,
                label: 'day',
                stepmode: 'backward',
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
          },
          autorange: true,
          rangeslider: {},
          type: 'date',
        },
        yaxis: {
          range: [Math.min(minY), Math.max(maxY)],
          autorange: true,
        },
        showlegend: true,
        ...size(),
      },
      {
        scrollZoom: true,
      }
    );
  }, []);

  return (
    <div
      className={css`
        display: grid;
        place-items: center;
        min-height: 100vh;
        width: 100%;
      `}
    >
      <div ref={graphDomRef} />
    </div>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
