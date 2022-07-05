import {createRoot} from 'react-dom/client';
import {useRef, useState, useCallback, useMemo, useEffect} from 'react';
import gsap, {Linear} from 'gsap';
import {css, cx} from '@emotion/css';
import '@fontsource/inter';
import './styles/index.scss';
import {Button, Slider} from '@mui/material';
import {MathUtils, Vector2} from 'three';
import Plotly from 'plotly.js-dist-min';

let t = 0;

const App = () => {
  const requestRef = useRef();
  const graphDomRef = useRef(null);

  const [edgeCount, setEdgeCount] = useState(10);

  const createPolygonPointList = useCallback(
    ({edgeCount, rotationOffset = Math.PI / edgeCount}) => {
      const stepSize = (Math.PI * 2) / edgeCount;
      return [...Array(edgeCount).keys()].map((edgeIndex, index) => {
        const a = index % 2 === 0 ? 1 : 2;
        return {
          x: Math.cos(edgeIndex * stepSize + rotationOffset) / a,
          y: Math.sin(edgeIndex * stepSize + rotationOffset) / a,
        };
      });
    },
    []
  );

  const pointList = useMemo(() => {
    return createPolygonPointList({edgeCount});
  }, [edgeCount]);

  const getDomain = useCallback((data, key) => {
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
  }, []);

  const makePathList = useCallback((pointList = []) => {
    const resultList = [];
    for (let i = 0; i < pointList.length; i++) {
      const from = pointList[i];
      const to = pointList[(i + 1) % pointList.length];
      let path = ``;
      path = path + `M${from.x},${from.y}`;
      path = path + `L${to.x},${to.y}`;
      path = path + `Z`;
      resultList.push(path);
    }
    return resultList;
  }, []);

  const makePathPlotInfoList = useCallback((pathList = []) => {
    return pathList.map((path) => {
      return {
        type: 'path',
        path,
        line: {
          color: 'rgb(93, 164, 214)',
        },
      };
    });
  }, []);

  const pathTracerList = useMemo(() => {
    const resultList = [];
    for (let i = 0; i < pointList.length; i++) {
      const from = pointList[i];
      const to = pointList[(i + 1) % pointList.length];
      const pathTracer = (t) => {
        const fromVec = new Vector2(from.x, from.y);
        const toVec = new Vector2(to.x, to.y);
        const lerpVec = fromVec.lerp(toVec, t);
        return {x: lerpVec.x, y: lerpVec.y};
      };
      resultList.push(pathTracer);
    }
    return resultList;
  }, [pointList]);

  const size = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const {min: minX, max: maxX} = getDomain(pointList, `x`);
    const {min: minY, max: maxY} = getDomain(pointList, `y`);
    const graphDom = graphDomRef.current;
    Plotly.purge(graphDom);
    Plotly.newPlot(
      graphDom,
      [
        {
          x: pointList.map((point) => {
            return point.x;
          }),
          y: pointList.map((point) => {
            return point.y;
          }),
          mode: 'markers',
          type: 'scatter',
          marker: {
            color: `rgb(17, 37, 255)`,
            size: 10,
          },
        },
      ],
      {
        xaxis: {
          range: [-1.5, 1.5],
        },
        yaxis: {
          range: [-1.5, 1.5],
        },
        ...size(),
        shapes: makePathPlotInfoList(makePathList(pointList)),
      }
    );
  }, [pointList]);

  const getComputedPointList = useCallback(
    (t) => {
      return pathTracerList.map((pathTracer, index) => {
        return pathTracer(t);
      });
    },
    [pathTracerList]
  );

  const loop = useCallback(
    (time) => {
      t = t + 0.01;
      t = t % 1;
      const computedPointList = getComputedPointList(t);
      const {min: minX, max: maxX} = getDomain(computedPointList, `x`);
      const {min: minY, max: maxY} = getDomain(computedPointList, `y`);
      const graphDom = graphDomRef.current;
      Plotly.react(
        graphDom,
        [
          {
            x: computedPointList.map((point) => {
              return point.x;
            }),
            y: computedPointList.map((point) => {
              return point.y;
            }),
            mode: 'markers',
            type: 'scatter',
            marker: {
              color: `rgb(17, 37, 255)`,
              size: 10,
            },
          },
        ],
        {
          xaxis: {
            range: [-1.5, 1.5],
          },
          yaxis: {
            range: [-1.5, 1.5],
          },
          ...size(),
          shapes: makePathPlotInfoList(makePathList(computedPointList)),
        }
      );
      requestRef.current = window.requestAnimationFrame(loop);
    },
    [getComputedPointList]
  );

  useEffect(() => {
    window.cancelAnimationFrame(requestRef.current);
    requestRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(requestRef.current);
    };
  }, [edgeCount, loop]);

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(requestRef.current);
    };
  }, []);

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

  const handleChange = (e) => {
    setEdgeCount(e.target.value);
  };

  return (
    <>
      <div
        className={css`
          max-width: 30rem;
          width: 100%;
          margin: 0 auto;
          padding: 3rem;
        `}
      >
        <Slider
          min={3}
          max={30}
          step={1}
          value={edgeCount}
          aria-label="Default"
          valueLabelDisplay="auto"
          onChange={handleChange}
        />
      </div>
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
    </>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
