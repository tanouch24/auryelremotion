import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const PARTICLE_DATA = [
  {x: 8,  y: 12, color: '#FFFFFF', size: 1.5, speed: 0.8, phase: 0},
  {x: 23, y: 45, color: '#D4AF37', size: 1,   speed: 1.1, phase: 1.2},
  {x: 67, y: 8,  color: '#FFFFFF', size: 2,   speed: 0.6, phase: 2.4},
  {x: 89, y: 34, color: '#D4AF37', size: 1.5, speed: 0.9, phase: 0.7},
  {x: 45, y: 78, color: '#FFFFFF', size: 1,   speed: 1.3, phase: 3.1},
  {x: 12, y: 67, color: '#D4AF37', size: 2,   speed: 0.7, phase: 1.8},
  {x: 78, y: 56, color: '#FFFFFF', size: 1.5, speed: 1.0, phase: 0.3},
  {x: 34, y: 23, color: '#D4AF37', size: 1,   speed: 1.2, phase: 2.9},
  {x: 56, y: 89, color: '#FFFFFF', size: 2,   speed: 0.8, phase: 1.5},
  {x: 90, y: 70, color: '#D4AF37', size: 1.5, speed: 0.5, phase: 0.9},
  {x: 5,  y: 90, color: '#FFFFFF', size: 1,   speed: 1.4, phase: 2.1},
  {x: 71, y: 18, color: '#D4AF37', size: 2,   speed: 0.7, phase: 3.5},
  {x: 38, y: 51, color: '#FFFFFF', size: 1.5, speed: 1.1, phase: 1.0},
  {x: 82, y: 88, color: '#D4AF37', size: 1,   speed: 0.9, phase: 2.6},
  {x: 18, y: 30, color: '#FFFFFF', size: 2,   speed: 0.6, phase: 0.5},
];

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {PARTICLE_DATA.map((p, i) => {
        const opacity = 0.3 * (0.5 + 0.5 * Math.sin(frame * p.speed * 0.05 + p.phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
