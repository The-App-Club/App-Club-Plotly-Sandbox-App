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

let x = -1;
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
      resizedWidth = 500;
      resizedHeight = 500;
    }
    return {width: resizedWidth, height: resizedHeight};
  };

  const nuts = useCallback(({n = 100}) => {
    const resultList = [];
    for (let i = 0; i < n - 1; i++) {
      const t = (i / (n - 2)) * 2 - 1;
      resultList.push(t);
    }
    return resultList;
  }, []);

  const pointInfoList = useMemo(() => {
    const resultList = [];
    nuts({n: 100}).forEach((t) => {
      resultList.push({
        x: Math.cos(t * Math.PI),
        y: Math.sin(t * Math.PI),
      });
    });
    return resultList;
  }, []);

  const pointA = useCallback((t) => {
    return {
      x: Math.cos(t * Math.PI),
      y: Math.sin(t * Math.PI),
    };
  }, []);
  const horizontalLine = (point) => {
    return {
      x: [point.x, 0],
      y: [point.y, point.y],
    };
  };
  const verticaleLine = (point) => {
    return {
      x: [point.x, point.x],
      y: [point.y, 0],
    };
  };
  const trianglePath = (point) => {
    return `M${0},${0}L${point.x},${point.y}L${point.x},${0}Z`;
  };
  const triangleLine = (point) => {
    return {
      x: [0, point.x, point.x],
      y: [0, point.y, 0],
    };
  };
  const line = (point) => {
    return {
      x: [0, point.x],
      y: [0, point.y],
    };
  };
  const dot = (point) => {
    return {
      x: [point.x],
      y: [point.y],
    };
  };

  useEffect(() => {
    const {min: minX, max: maxX} = getDomain(pointInfoList, `x`);
    const {min: minY, max: maxY} = getDomain(pointInfoList, `y`);
    const graphDom = graphDomRef.current;
    // https://plotly.com/javascript/colorscales/
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
          marker: {
            color: 'rgb(255, 112, 17)',
          },
        },
        {
          ...dot(pointA(0)),
          marker: {
            color: 'rgb(0, 0, 0)',
          },
        },
        // {
        //   ...line(pointA(0.1)),
        //   line: {
        //     color: `#eb1212`,
        //   },
        // },
      ],
      {
        xaxis: {range: [minX - 1, maxX + 1]},
        yaxis: {range: [minY - 1, maxY + 1]},
        ...size(),
        // shapes: [
        //   {
        //     type: 'path',
        //     path: 'M0,0L-0.21814324139638264,0.9759167619387832L-0.21814324139638264,0Z',
        //     fillcolor: 'rgba(44, 160, 101, 0.5)',
        //     line: {
        //       color: 'rgb(44, 160, 101)',
        //     },
        //   },
        // ]
      }
    );
  }, [pointInfoList]);
  const computeTrianglePath = (p) => {
    return trianglePath(pointA(p));
  };
  const computeTriangleLine = (p) => {
    return triangleLine(pointA(p));
  };
  const computeVertilcaleLine = (p) => {
    return verticaleLine(pointA(p));
  };
  const computeHorizontalLine = (p) => {
    return horizontalLine(pointA(p));
  };
  const computeLine = (p) => {
    return line(pointA(p));
  };

  const loop = useCallback((time) => {
    x = x + 0.01;
    const graphDom = graphDomRef.current;
    const computedLine = computeLine(wrap(-1, 1, x));
    const computedVerticaleLine = computeVertilcaleLine(wrap(-1, 1, x));
    const computedHorizontalLine = computeHorizontalLine(wrap(-1, 1, x));
    const computedTriangleLine = computeTriangleLine(wrap(-1, 1, x));
    const computedTrianglePath = computeTrianglePath(wrap(-1, 1, x));
    Plotly.animate(
      graphDom,
      {
        data: [
          {
            x: pointInfoList.map((pointInfo) => {
              return pointInfo.x;
            }),
            y: pointInfoList.map((pointInfo) => {
              return pointInfo.y;
            }),
            marker: {
              color: 'rgb(255, 112, 17)',
            },
          },
          {
            ...computedTriangleLine,
            line: {
              color: 'rgb(0, 0, 0)',
            },
          },
          // {
          //   ...computedVerticaleLine,
          //   line: {
          //     color: `#12a6eb`,
          //   },
          // },
          // {
          //   ...computedHorizontalLine,
          //   line: {
          //     color: `#12eb24`,
          //   },
          // },
          // {
          //   ...computedLine,
          //   line: {
          //     color: `#eb1212`,
          //   },
          // },
        ],
        ...size(),
        // shapes: [
        //   {
        //     type: 'path',
        //     path: computedTrianglePath,
        //     fillcolor: 'rgba(44, 160, 101, 0.5)',
        //     line: {
        //       color: 'rgb(44, 160, 101)',
        //     },
        //   },
        // ],
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
