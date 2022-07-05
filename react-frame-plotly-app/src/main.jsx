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

const App = () => {
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

  const frames = useMemo(() => {
    const frames = [
      {name: 'sine', data: [{x: [], y: []}]},
      {name: 'cosine', data: [{x: [], y: []}]},
      {name: 'circle', data: [{x: [], y: []}]},
    ];

    const n = 100;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1;
      // console.log(t);
      // A sine wave:
      frames[0].data[0].x[i] = t * Math.PI;
      frames[0].data[0].y[i] = Math.sin(t * Math.PI);

      // A cosine wave:
      frames[1].data[0].x[i] = t * Math.PI;
      frames[1].data[0].y[i] = Math.cos(t * Math.PI);

      // A circle:
      frames[2].data[0].x[i] = Math.sin(t * Math.PI);
      frames[2].data[0].y[i] = Math.cos(t * Math.PI);
    }
    return frames;
  }, []);

  useEffect(() => {
    const graphDom = graphDomRef.current;
    Plotly.newPlot(
      graphDom,
      [
        {
          x: frames[0].data[0].x,
          y: frames[0].data[0].y,
          line: {simplify: false},
        },
      ],
      {
        xaxis: {range: [-Math.PI, Math.PI]},
        yaxis: {range: [-1.2, 1.2]},
        ...size(),
        updatemenus: [
          {
            buttons: [
              {method: 'animate', args: [['sine']], label: 'sine'},
              {method: 'animate', args: [['cosine']], label: 'cosine'},
              {method: 'animate', args: [['circle']], label: 'circle'},
            ],
          },
        ],
      }
    ).then(function () {
      Plotly.addFrames(graphDom, frames);
    });
  }, [frames]);

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
