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

let x = 0;
const n = 30;

const App = () => {
  const requestRef = useRef();
  const graphDomRef = useRef(null);

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
  const pointInfoList = useMemo(() => {
    const resultList = [];
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1;
      resultList.push({
        x: t * Math.PI,
        y: MathUtils.smoothstep(Math.cos(t * Math.PI), 0, 0.9),
      });
    }
    return resultList;
  }, []);

  useEffect(() => {
    const {min: minX, max: maxX} = getDomain(pointInfoList, `x`);
    const {min: minY, max: maxY} = getDomain(pointInfoList, `y`);
    const graphDom = graphDomRef.current;
    Plotly.newPlot(
      graphDom,
      [
        {
          x: pointInfoList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: pointInfoList.map((pointInfo) => {
            return pointInfo.y;
          }),
          mode: 'markers',
        },
      ],
      {
        xaxis: {range: [minX, maxX]},
        yaxis: {range: [minY, maxY]},
        ...size(),
      }
    );
  }, [pointInfoList]);

  const compute = (p) => {
    const resultList = [];

    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1;
      resultList.push({
        x: t * Math.PI,
        y: MathUtils.smoothstep(Math.cos(t * Math.PI - p * Math.PI), 0, 0.9),
      });
    }
    return resultList;
  };

  const loop = useCallback((time) => {
    x = x + 0.01;
    const graphDom = graphDomRef.current;
    const computedPointInfoList = compute(x);
    Plotly.animate(
      graphDom,
      {
        data: [
          {
            x: computedPointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: computedPointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
          },
        ],
        ...size(),
      },
      {
        transition: {
          duration: 0,
        },
        frame: {
          duration: 0,
          redraw: false,
        },
      }
    );
    requestRef.current = window.requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(requestRef.current);
    };
  }, []); // Make sure the effect runs only once

  // https://community.plotly.com/t/resize-of-plotly-chart/333
  //instruction resizes plot
  const handleResize = (e) => {
    const graphDom = graphDomRef.current;
    Plotly.relayout(graphDom, size());
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeventListener('resize', handleResize);
    };
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
