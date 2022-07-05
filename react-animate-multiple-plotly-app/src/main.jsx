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
        x: t * Math.PI,
        y: f(t * Math.PI),
      });
    });
    return resultList;
  }, []);

  useEffect(() => {
    const sinPointList = getPointInfoList((t) => {
      return Math.sin(t);
    });
    const cosPointList = getPointInfoList((t) => {
      return Math.cos(t);
    });
    const tanPointList = getPointInfoList((t) => {
      return Math.tan(t);
    });
    const joinPointList = getPointInfoList((t) => {
      return Math.sin(t) + Math.cos(t);
    });
    const {min: sinMinX, max: sinMaxX} = getDomain(sinPointList, `x`);
    const {min: sinMinY, max: sinMaxY} = getDomain(sinPointList, `y`);
    const {min: cosMinX, max: cosMaxX} = getDomain(cosPointList, `x`);
    const {min: cosMinY, max: cosMaxY} = getDomain(cosPointList, `y`);
    const {min: joinMinX, max: joinMaxX} = getDomain(joinPointList, `x`);
    const {min: joinMinY, max: joinMaxY} = getDomain(joinPointList, `y`);
    const graphDom = graphDomRef.current;
    Plotly.newPlot(
      graphDom,
      [
        {
          x: sinPointList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: sinPointList.map((pointInfo) => {
            return pointInfo.y;
          }),
          marker: {
            color: `rgb(255, 112, 17)`,
          },
          name: 'sin curve',
        },
        {
          x: cosPointList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: cosPointList.map((pointInfo) => {
            return pointInfo.y;
          }),
          marker: {
            color: `rgb(25, 86, 143)`,
          },
          name: 'cos curve',
        },
        {
          x: tanPointList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: tanPointList.map((pointInfo) => {
            return pointInfo.y;
          }),
          marker: {
            color: `rgb(182, 50, 122)`,
          },
          name: 'tan curve',
        },
        {
          x: joinPointList.map((pointInfo) => {
            return pointInfo.x;
          }),
          y: joinPointList.map((pointInfo) => {
            return pointInfo.y;
          }),
          marker: {
            color: `rgb(25, 143, 41)`,
          },
          name: 'sin + cos curve',
        },
      ],
      {
        xaxis: {
          range: [
            Math.min(joinMinX, sinMinX, cosMinX) - 1,
            Math.max(joinMaxX, sinMaxX, cosMaxX) + 1,
          ],
        },
        yaxis: {
          range: [
            Math.min(joinMinY, sinMinY, cosMinY) - 1,
            Math.max(joinMaxY, sinMaxY, cosMaxY) + 1,
          ],
        },
        ...size(),
      }
    );
  }, []);

  const getComputePointList = useCallback((f) => {
    return (p) => {
      const resultList = [];
      nuts({n: 100}).forEach((t) => {
        resultList.push({
          x: t * Math.PI,
          y: f(t * Math.PI - p * Math.PI),
        });
      });
      return resultList;
    };
  }, []);

  const loop = useCallback((time) => {
    x = x + 0.01;
    const graphDom = graphDomRef.current;
    const computedSinPointInfoList = getComputePointList((t) => {
      return Math.sin(t);
    })(x);
    const computedCosPointInfoList = getComputePointList((t) => {
      return Math.cos(t);
    })(x);
    const computedTanPointInfoList = getComputePointList((t) => {
      return Math.tan(t);
    })(x);
    const computedJoinPointInfoList = getComputePointList((t) => {
      return Math.sin(t) + Math.cos(t);
    })(x);

    Plotly.animate(
      graphDom,
      {
        data: [
          {
            x: computedSinPointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: computedSinPointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
            marker: {
              color: `rgb(255, 112, 17)`,
            },
          },
          {
            x: computedCosPointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: computedCosPointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
            marker: {
              color: `rgb(25, 86, 143)`,
            },
          },
          {
            x: computedTanPointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: computedTanPointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
            marker: {
              color: `rgb(182, 50, 122)`,
            },
          },
          {
            x: computedJoinPointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: computedJoinPointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
            marker: {
              color: `rgb(25, 143, 41)`,
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
