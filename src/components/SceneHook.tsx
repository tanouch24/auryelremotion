import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneHookProps {
  hook: string;
}

export const SceneHook: React.FC<SceneHookProps> = ({hook}) => {
  const frame = useCurrentFrame();
  const words = hook.split(' ');

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '25%', // position at ~75% height
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {words.map((word, i) => {
          const wordStart = i * 8;
          const opacity = interpolate(frame, [wordStart, wordStart + 7], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = interpolate(frame, [wordStart, wordStart + 7], [0.88, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <span
              key={i}
              style={{
                opacity,
                transform: `scale(${scale})`,
                display: 'inline-block',
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 56,
                fontWeight: 'bold',
                color: '#FFFFFF',
                textShadow: '0 2px 24px rgba(0,0,0,0.9)',
                textAlign: 'center',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
