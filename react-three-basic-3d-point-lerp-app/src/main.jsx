import {createRoot} from 'react-dom/client';
import {useRef, useLayoutEffect, useState, useEffect, useCallback} from 'react';
import {css} from '@emotion/css';
import '@fontsource/inter';
import './styles/index.scss';
import {Scene} from './components/Scene';
import {Slider} from '@mui/material';
import {
  Canvas,
  useFrame,
  createRoot as createRootCanvas,
  events,
} from '@react-three/fiber';
import * as THREE from 'three';

const App = () => {
  const canvasDomRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  const handleChange = (e) => {
    setProgress(e.target.value);
  };
  const handleChangeX = (e) => {
    setX(e.target.value);
  };
  const handleChangeY = (e) => {
    setY(e.target.value);
  };
  const handleChangeZ = (e) => {
    setZ(e.target.value);
  };

  const handleResize = useCallback((e) => {}, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin: 0 auto;
        max-width: 30rem;
        padding: 1rem;
        @media screen and (max-width: 768px) {
          max-width: 100%;
          padding: 1rem;
        }
      `}
    >
      <header
        className={css`
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        `}
      >
        <h1>Sketch</h1>
        <div
          className={css`
            width: 100%;
          `}
        >
          <p>progress</p>
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
          <p>x</p>
          <Slider
            defaultValue={0}
            min={-10}
            max={10}
            step={0.01}
            value={x}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={handleChangeX}
          />
          <p>y</p>
          <Slider
            defaultValue={0}
            min={-10}
            max={10}
            step={0.01}
            value={y}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={handleChangeY}
          />
          <p>z</p>
          <Slider
            defaultValue={0}
            min={-10}
            max={10}
            step={0.01}
            value={z}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={handleChangeZ}
          />
        </div>
      </header>
      <main>
        <div className={css``}>
          <Canvas ref={canvasDomRef} flat linear>
            <ambientLight intensity={0.5} />
            <Scene x={x} y={y} z={z} progress={progress} />
          </Canvas>
        </div>
      </main>
    </div>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
