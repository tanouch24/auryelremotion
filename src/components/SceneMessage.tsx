import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneMessageProps {
  message: string;
}

export const SceneMessage: React.FC<SceneMessageProps> = ({message}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - 90;

  // Split message into lines (roughly 35 chars per line)
  const lines: string[] = [];
  const words = message.split(' ');
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > 35 && currentLine.length > 0) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
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

      {/* Message lines */}
      <div style={{textAlign: 'center'}}>
        {lines.map((line, i) => {
          const lineStart = i * 20;
          const opacity = interpolate(relativeFrame, [lineStart, lineStart + 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const translateY = interpolate(relativeFrame, [lineStart, lineStart + 15], [10, 0], {
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
                fontSize: 38,
                color: '#FFFFFF',
                lineHeight: 1.5,
                textShadow: '0 2px 15px rgba(0,0,0,0.9)',
                marginBottom: 8,
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
