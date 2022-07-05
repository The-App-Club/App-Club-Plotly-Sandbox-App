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

let t = 0;
const n = 30;

const App = () => {
  const requestRef = useRef();
  const graphDomRef = useRef(null);
  const nuts = useCallback(({n = 100}) => {
    const resultList = [];
    for (let i = 0; i < n - 1; i++) {
      const t = (i / (n - 2)) * 2 - 1;
      resultList.push(t);
    }
    return resultList;
  }, []);

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

  const getPointInfoList = useCallback((f) => {
    const resultList = [];
    nuts({n: 100}).forEach((t) => {
      resultList.push({
        x: t,
        y: f(t),
      });
    });
    return resultList;
  }, []);

  useEffect(() => {
    const inverseSmoothStepPointList = getPointInfoList((t) => {
      // https://iqtuilezles.org/articles/ismoothstep/
      // https://graphtoy.com/
      return t * Math.sin(t);
    });
    const {min: minX, max: maxX} = getDomain(inverseSmoothStepPointList, `x`);
    const {min: minY, max: maxY} = getDomain(inverseSmoothStepPointList, `y`);
    const graphDom = graphDomRef.current;
    Plotly.newPlot(
      graphDom,
      [
        {
          x: inverseSmoothStepPointList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: inverseSmoothStepPointList.map((pointInfo) => {
            return pointInfo.y;
          }),
          marker: {
            color: `rgb(255, 112, 17)`,
          },
          name: 'sin curve',
        },
      ],
      {
        xaxis: {
          range: [Math.min(minX) - 5, Math.max(maxX) + 5],
        },
        yaxis: {
          range: [Math.min(minY) - 1, Math.max(maxY) + 1],
        },
        ...size(),
      }
    );
  }, []);

  const getComputePointList = useCallback((f) => {
    return (t) => {
      const resultList = [];
      nuts({n: 100}).forEach((x) => {
        resultList.push({
          x: x * Math.PI,
          y: f(x * Math.PI, t),
        });
      });
      return resultList;
    };
  }, []);

  const loop = useCallback((time) => {
    t = t + 0.01;
    const graphDom = graphDomRef.current;
    const computedPointInfoList = getComputePointList((x, t) => {
      // return Math.sin((t + Math.floor(x * 2 - t / 3)) / 3);
      // return Math.sin(x - t * Math.PI);
      // http://tobyschachman.com/Shadershop/instructions.png
      // return (
      //   Math.sin((x - 0.84 - t) / 1.35) * 2.74 +
      //   0.43 +
      //   Math.sin(x / 0.21 - t) * 0.69
      // );
      // https://docs.google.com/presentation/d/1NMhx4HWuNZsjNRRlaFOu2ysjo04NgcpFlEhzodE8Rlg/edit#slide=id.g368d0406a6_1_293
      // return Math.abs(Math.cos(x * 12 - t) * Math.sin(x * 3 - t)) * 0.8 + 1;
      return (
        Math.min(
          Math.abs(Math.cos(x * 2.5 + t) + 0.4),
          Math.abs(Math.sin(x * 2.5 + t) + 1.1)
        ) * 0.63
      );
    })(t);

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
            marker: {
              color: `rgb(255, 112, 17)`,
            },
          },
        ],
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
      window.removeEventListener('resize', handleResize);
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
