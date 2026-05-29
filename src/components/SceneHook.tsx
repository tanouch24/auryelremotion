import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneHookProps {
  hook: string;
  videoStyle: 0 | 1 | 2;
}

export const SceneHook: React.FC<SceneHookProps> = ({hook, videoStyle}) => {
  const frame = useCurrentFrame();
  const words = hook.split(' ');

  // Style C = bigger font for maximum impact
  const fontSize = videoStyle === 2 ? 64 : 56;
  // Style B = left-aligned confidence
  const isLeftAligned = videoStyle === 1;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        // Hook at 33-38% from top — safely above TikTok's bottom UI zone
        alignItems: isLeftAligned ? 'flex-start' : 'center',
        justifyContent: 'flex-start',
        paddingTop: '33%',
        paddingLeft: isLeftAligned ? 72 : 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: isLeftAligned ? 'flex-start' : 'center',
          gap: '0 14px',
        }}
      >
        {words.map((word, i) => {
          const wordStart = i * 8;
          const opacity = interpolate(frame, [wordStart, wordStart + 7], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = interpolate(frame, [wordStart, wordStart + 7], [0.86, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          // Brief pop-in shake — settles quickly
          const shakePhase = Math.max(0, Math.min(1, (frame - wordStart) / 7));
          const shakeX = Math.sin(shakePhase * 3 * Math.PI) * 3 * (1 - shakePhase);

          return (
            <span
              key={i}
              style={{
                opacity,
                transform: `scale(${scale}) translateX(${shakeX}px)`,
                display: 'inline-block',
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize,
                fontWeight: 'bold',
                color: '#FFFFFF',
                textShadow: '0 2px 28px rgba(0,0,0,0.95)',
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
