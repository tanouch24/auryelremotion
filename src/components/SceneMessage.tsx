import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneMessageProps {
  message: string;
}

export const SceneMessage: React.FC<SceneMessageProps> = ({message}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - 90;

  // Split by \n — Claude generates short phrases separated by \n
  const lines = message
    .split(/\\n|\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 3); // hard cap at 3 phrases

  // Each phrase gets 40 frames to appear, staggered by 35 frames
  const STAGGER = 35;
  const FADE_IN = 18;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      {/* AURYEL logo */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 14,
          color: '#FFFFFF',
          opacity: 0.7,
          letterSpacing: '0.3em',
        }}
      >
        AURYEL
      </div>

      {/* Message phrases — one short phrase per line, big font, breathing */}
      <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 40}}>
        {lines.map((line, i) => {
          const lineStart = i * STAGGER;
          const opacity = interpolate(relativeFrame, [lineStart, lineStart + FADE_IN], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const translateY = interpolate(relativeFrame, [lineStart, lineStart + FADE_IN], [16, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: '"Lora", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 46,
                color: '#FFFFFF',
                lineHeight: 1.35,
                textShadow: '0 2px 20px rgba(0,0,0,0.95)',
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
