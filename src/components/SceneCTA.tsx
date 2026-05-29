import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

interface SceneCTAProps {
  cta: string;
  videoStyle: 0 | 1 | 2;
}

export const SceneCTA: React.FC<SceneCTAProps> = ({cta, videoStyle: _videoStyle}) => {
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
        // Push block into 40-58% — above TikTok's bottom UI zone (starts ~75%)
        justifyContent: 'flex-start',
        paddingTop: '37%',
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

      {/* Auryel signature — inline flow, safely above bottom UI zone */}
      <div
        style={{
          marginTop: 48,
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 12,
          color: '#D4AF37',
          letterSpacing: '0.4em',
          opacity: 0.8,
        }}
      >
        Auryel
      </div>
    </AbsoluteFill>
  );
};
