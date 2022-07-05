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

const a = new Vector2(-1, -1);
const b = new Vector2(-1, 0);
const c = new Vector2(0, 1);
const d = new Vector2(1, 1);

const curve = new CubicBezierCurve(a, b, c, d);

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
        ...curve.getPoints(15).map((p) => {
          // https://stackoverflow.com/a/8405756/15972569
          // https://threejs.org/docs/#api/en/extras/core/Curve.getPoints
          return createPlotInfo({
            point: p,
            name: 'p',
            color: schemeTableau10[5],
          });
        }),
      ],
      {
        xaxis: {
          range: [-2, 2],
        },
        yaxis: {
          range: [-2, 2],
        },
        ...size(),
        shapes: [
          makePathPlotInfo({
            path: `M${a.clone().x},${a.clone().y}C${b.clone().x},${
              b.clone().y
            } ${c.clone().x},${c.clone().y} ${d.clone().x},${d.clone().y}`,
          }),
        ],
      },
      {
        scrollZoom: true,
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
