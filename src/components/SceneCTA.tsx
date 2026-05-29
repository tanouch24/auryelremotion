import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneCTAProps {
  cta: string;
}

export const SceneCTA: React.FC<SceneCTAProps> = ({cta}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - 270;

  // Diamond pulse (cycle: 30 frames)
  const diamondScale = 1 + 0.15 * Math.abs(Math.sin((relativeFrame / 30) * Math.PI));

  // Gold line width animation
  const lineWidth = interpolate(relativeFrame, [0, 20], [0, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Diamond */}
      <div
        style={{
          fontSize: 48,
          color: '#D4AF37',
          transform: `scale(${diamondScale})`,
          marginBottom: 24,
          textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
        }}
      >
        ♦
      </div>

      {/* Gold line */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          backgroundColor: '#D4AF37',
          marginBottom: 24,
        }}
      />

      {/* CTA text */}
      <div
        style={{
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 32,
          color: '#FFFFFF',
          textAlign: 'center',
          letterSpacing: '0.05em',
          textShadow: '0 2px 15px rgba(0,0,0,0.9)',
          padding: '0 60px',
        }}
      >
        {cta}
      </div>

      {/* Bottom Auryel text */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 12,
          color: '#D4AF37',
          letterSpacing: '0.4em',
        }}
      >
        Auryel
      </div>
    </AbsoluteFill>
  );
};
