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
import {schemeTableau10} from 'd3';
import {
  MathUtils,
  Vector2,
  CubicBezierCurve,
  QuadraticBezierCurve,
} from 'three';
import Plotly from 'plotly.js-dist-min';

let t = 0;

const a = new Vector2(-0.5, -0.5);
const b = new Vector2(-0.5, 0);
const c = new Vector2(0, 0.5);
const d = new Vector2(0.5, 0.5);

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

  const xy = ({point = new Vector2(0, 0)}) => {
    const {x, y} = point;
    return [x, y];
  };

  const makeQuadraticCurvePath = ({pointList = []}) => {
    let path = ``;
    path = path + `M${pointList[0][0]},${pointList[0][1]}`;
    path =
      path +
      `Q${pointList[1][0]},${pointList[1][1]} ${pointList[2][0]},${pointList[2][1]}`;
    return path;
  };

  useEffect(() => {
    const q = a.clone();
    const _a = a.clone();
    const _b = b.clone();
    const _c = c.clone();
    const _d = d.clone();
    const graphDom = graphDomRef.current;
    Plotly.newPlot(
      graphDom,
      [
        createPlotInfo({
          point: a.clone(),
          name: 'q',
          color: schemeTableau10[0],
        }),
        createPlotInfo({
          point: a.clone(),
          name: 'a',
          color: schemeTableau10[1],
        }),
        createPlotInfo({
          point: b.clone(),
          name: 'b',
          color: schemeTableau10[2],
        }),
        createPlotInfo({
          point: c.clone(),
          name: 'c',
          color: schemeTableau10[3],
        }),
        createPlotInfo({
          point: d.clone(),
          name: 'd',
          color: schemeTableau10[4],
        }),
      ],
      {
        xaxis: {
          range: [-1, 1],
        },
        yaxis: {
          range: [-1, 1],
        },
        ...size(),
        shapes: [
          makePathPlotInfo({
            path: `M${_a.x},${_a.y}C${_b.x},${_b.y} ${_c.x},${_c.y} ${_d.x},${_d.y}`,
          }),
        ],
      }
    );
  }, []);

  const createPlotInfo = useCallback(
    ({point = new Vector2(0, 0), name, color}) => {
      const {x, y} = point;
      return {
        x: [x],
        y: [y],
        name,
        type: 'scatter',
        marker: {
          color,
          size: 10,
        },
      };
    },
    []
  );
  const doLerp = useCallback(({from, to, t}) => {
    const a = from.clone();
    const b = to.clone();
    return a.lerp(b, t);
  }, []);
  const makePath = useCallback(({from, to}) => {
    let path = ``;
    path = path + `M${from.x},${from.y}`;
    path = path + `L${to.x},${to.y}`;
    path = path + `Z`;
    return path;
  }, []);
  const makePathPlotInfo = useCallback(({path}) => {
    return {
      type: 'path',
      path,
      line: {
        color: 'rgb(0, 0, 0)',
      },
    };
  }, []);
  let from;
  const loop = useCallback((time) => {
    t = t + 0.01;
    t = t % 1;
    const curve = new CubicBezierCurve(
      a.clone(),
      b.clone(),
      c.clone(),
      d.clone()
    );
    const graphDom = graphDomRef.current;
    Plotly.react(
      graphDom,
      [
        createPlotInfo({
          point: curve.getPoint(t),
          name: 'q',
          color: schemeTableau10[0],
        }),
        createPlotInfo({
          point: a.clone(),
          name: 'a',
          color: schemeTableau10[1],
        }),
        createPlotInfo({
          point: b.clone(),
          name: 'b',
          color: schemeTableau10[2],
        }),
        createPlotInfo({
          point: c.clone(),
          name: 'c',
          color: schemeTableau10[3],
        }),
        createPlotInfo({
          point: d.clone(),
          name: 'd',
          color: schemeTableau10[4],
        }),
        createPlotInfo({
          point: doLerp({from: a.clone(), to: b.clone(), t}),
          name: 'e',
          color: schemeTableau10[5],
        }),
        createPlotInfo({
          point: doLerp({from: b.clone(), to: c.clone(), t}),
          name: 'f',
          color: schemeTableau10[6],
        }),
        createPlotInfo({
          point: doLerp({from: c.clone(), to: d.clone(), t}),
          name: 'g',
          color: schemeTableau10[7],
        }),
        createPlotInfo({
          point: doLerp({
            from: doLerp({from: a.clone(), to: b.clone(), t}),
            to: doLerp({from: b.clone(), to: c.clone(), t}),
            t,
          }),
          name: 'h',
          color: schemeTableau10[8],
        }),
        createPlotInfo({
          point: doLerp({
            from: doLerp({from: b.clone(), to: c.clone(), t}),
            to: doLerp({from: c.clone(), to: d.clone(), t}),
            t,
          }),
          name: 'i',
          color: schemeTableau10[9],
        }),
      ],
      {
        xaxis: {
          range: [-1, 1],
        },
        yaxis: {
          range: [-1, 1],
        },
        ...size(),
        shapes: [
          makePathPlotInfo({
            path: makePath({
              from: a,
              to: b,
            }),
          }),
          makePathPlotInfo({
            path: makePath({
              from: b,
              to: c,
            }),
          }),
          makePathPlotInfo({
            path: makePath({
              from: c,
              to: d,
            }),
          }),
          makePathPlotInfo({
            path: makePath({
              from: doLerp({from: a.clone(), to: b.clone(), t}),
              to: doLerp({from: b.clone(), to: c.clone(), t}),
            }),
          }),
          makePathPlotInfo({
            path: makePath({
              from: doLerp({from: b.clone(), to: c.clone(), t}),
              to: doLerp({from: c.clone(), to: d.clone(), t}),
            }),
          }),
          makePathPlotInfo({
            path: makePath({
              from: doLerp({
                from: doLerp({from: a.clone(), to: b.clone(), t}),
                to: doLerp({from: b.clone(), to: c.clone(), t}),
                t,
              }),
              to: doLerp({
                from: doLerp({from: b.clone(), to: c.clone(), t}),
                to: doLerp({from: c.clone(), to: d.clone(), t}),
                t,
              }),
            }),
          }),
          makePathPlotInfo({
            path: `M${a.clone().x},${a.clone().y}C${b.clone().x},${
              b.clone().y
            } ${c.clone().x},${c.clone().y} ${d.clone().x},${d.clone().y}`,
          }),
        ],
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
