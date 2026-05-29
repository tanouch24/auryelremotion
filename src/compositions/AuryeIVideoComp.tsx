import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {CharacterLayer} from '../components/CharacterLayer';
import {SceneHook} from '../components/SceneHook';
import {SceneMessage} from '../components/SceneMessage';
import {SceneCTA} from '../components/SceneCTA';
import {Particles} from '../components/Particles';

interface AuryeIVideoProps {
  hook: string;
  message: string;
  cta: string;
}

export const AuryeIVideo: React.FC<AuryeIVideoProps> = ({hook, message, cta}) => {
  const frame = useCurrentFrame();

  // Derived style (0=A, 1=B, 2=C) — deterministic from content, rotates across generations
  const videoStyle = ((hook.charCodeAt(0) + message.charCodeAt(0)) % 3) as 0 | 1 | 2;

  // Hook: 0-90, fade in 0-5, fade out 81-90
  const hookOpacityFinal = interpolate(frame, [0, 5, 81, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Message: 90-270, fade in 90-99, fade out 261-270
  const messageOpacityFinal = interpolate(frame, [90, 99, 261, 270], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CTA: 270-360, fade in 270-279, fade out 355-360
  const ctaOpacityFinal = interpolate(frame, [270, 279, 355, 360], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#000', fontFamily: 'sans-serif'}}>
      <CharacterLayer />
      <Particles />

      <AbsoluteFill style={{opacity: hookOpacityFinal}}>
        <SceneHook hook={hook} videoStyle={videoStyle} />
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: messageOpacityFinal}}>
        <SceneMessage message={message} videoStyle={videoStyle} />
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: ctaOpacityFinal}}>
        <SceneCTA cta={cta} videoStyle={videoStyle} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
