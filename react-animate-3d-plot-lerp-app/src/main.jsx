import {createRoot} from 'react-dom/client';
import {
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {css, cx} from '@emotion/css';
import '@fontsource/inter';
import './styles/index.scss';
import {Button, Slider} from '@mui/material';
import * as d3 from 'd3';
import {MathUtils, Vector3} from 'three';
import Plotly from 'plotly.js-dist-min';
import gsap, {Power3, Linear} from 'gsap';

const size = () => {
  let resizedWidth = window.innerWidth * 0.5;
  let resizedHeight = window.innerHeight * 1;
  return {width: resizedWidth, height: resizedHeight};
};
const fromPointData = [0, 1, 1];
const toPointData = [1, 1, 0];

const createPlotInfo = ({point = new Vector3(0, 0, 0), name, color}) => {
  const {x, y, z} = point;
  return {
    x: [x],
    y: [y],
    z: [z],
    name,
    type: 'scatter3d',
    mode: 'markers',
    line: {
      color,
    },
  };
};

const App = () => {
  const [tik, setTik] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const requestRef = useRef();
  const graphDomRef = useRef(null);

  const cowboy = useCallback(
    (f) => {
      const time = {t: progress};
      gsap.to(time, {
        t: 1,
        ease: Linear.easeInOut,
        duration,
        onUpdate: (instance) => {
          const t = MathUtils.clamp(time.t, 0, 1);
          setProgress(t);
        },
      });
    },
    [duration, progress]
  );

  useEffect(() => {
    const graphDom = graphDomRef.current;
    // https://plotly.com/javascript/colorscales/
    Plotly.newPlot(
      graphDom,
      [
        createPlotInfo({
          point: new Vector3(...fromPointData),
          name: 'from',
          color: '#123456',
        }),
        createPlotInfo({
          point: new Vector3(...toPointData),
          name: 'from',
          color: '#e69c12',
        }),
      ],
      {
        ...size(),
      }
    );
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

  useEffect(() => {
    if (!tik) {
      return;
    }
    cowboy();
  }, [tik]);

  const handleDo = () => {
    setTik(new Date());
  };

  useEffect(() => {
    const fromPoint = new Vector3(...fromPointData);
    const toPoint = new Vector3(...toPointData);
    const lerpedPoint = fromPoint.lerp(toPoint, progress);
    const graphDom = graphDomRef.current;
    Plotly.react(
      graphDom,
      [
        createPlotInfo({
          point: new Vector3(...fromPointData),
          name: 'from',
          color: '#123456',
        }),
        createPlotInfo({
          point: new Vector3(...toPointData),
          name: 'to',
          color: '#e69c12',
        }),
        createPlotInfo({
          point: new Vector3(...lerpedPoint),
          name: 'lerp',
          color: '#b61e93',
        }),
      ],
      {
        ...size(),
      }
    );
  }, [progress]);
  const handleChange = (e) => {
    setProgress(e.target.value);
  };
  return (
    <>
      <Button variant="outlined" onClick={handleDo}>
        {'Do'}
      </Button>
      <div
        className={css`
          max-width: 30rem;
          width: 100%;
          margin: 0 auto;
          padding: 3rem;
        `}
      >
        <Slider
          defaultValue={0}
          min={0}
          max={1}
          step={0.001}
          value={progress}
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
