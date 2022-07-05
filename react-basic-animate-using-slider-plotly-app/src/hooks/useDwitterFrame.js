import {useRef, useEffect} from 'react';
let time = 0;
let frame = 0;

const useDwitterFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const loop = (time) => {
    time = frame / 60;
    time += 0.000001;
    frame++;
    callback({time});
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []); // Make sure the effect runs only once
};

export {useDwitterFrame};
