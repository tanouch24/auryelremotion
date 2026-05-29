import React from 'react';
import {AbsoluteFill, useCurrentFrame, Img, staticFile, interpolate} from 'remotion';

export const CharacterLayer: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow cinematic zoom: 1.00 → 1.06 over full 360 frames
  const zoomScale = 1 + 0.06 * (frame / 360);

  // Breathing animation (cycle: 90 frames) — combined with zoom
  const breathScale = zoomScale * (1 + 0.004 * Math.sin((frame / 90) * Math.PI * 2));

  // Camera drift (cycle: 200 frames) — slightly more pronounced for cinema feel
  const driftX = 4 * Math.sin((frame / 200) * Math.PI * 2);
  const driftY = 2.5 * Math.sin((frame / 200) * Math.PI * 2 + 1);

  // Eye blink: every 120 frames, blink for 4 frames
  const frameInCycle = frame % 120;
  const blinkOpacity =
    frameInCycle < 4
      ? interpolate(frameInCycle, [0, 1, 3, 4], [0, 0.15, 0.15, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <AbsoluteFill>
      {/* Main character image */}
      <AbsoluteFill
        style={{
          transform: `scale(${breathScale}) translate(${driftX}px, ${driftY}px)`,
          transformOrigin: 'center 30%',
        }}
      >
        <Img
          src={staticFile('character/auryel_base.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>

      {/* Eye blink overlay */}
      <AbsoluteFill
        style={{
          top: '33%',
          height: '8%',
          backgroundColor: '#000',
          opacity: blinkOpacity,
        }}
      />

      {/* Purple color overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: '#6B21A8',
          opacity: 0.15,
        }}
      />

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
