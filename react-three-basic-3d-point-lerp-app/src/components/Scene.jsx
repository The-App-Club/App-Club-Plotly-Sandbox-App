import {useRef, useLayoutEffect, useState, useEffect, useCallback} from 'react';
import {css} from '@emotion/css';
import {Canvas, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Box} from '@react-three/drei';
const Scene = ({x, y, z}) => {
  const box = useRef();
  const vec = new THREE.Vector3(x, y, z);
  useFrame(() => box.current.position.lerp(vec, 0.1));
  return (
    <Box
      ref={box}
      onClick={(event) => {
        console.log('clicked');
      }}
      onPointerOver={(event) => {
        console.log('mouseover');
      }}
      onPointerOut={(event) => {
        console.log('mouseout');
      }}
    >
      >
      <meshLambertMaterial attach="material" color="white" />
    </Box>
  );
};

export {Scene};
