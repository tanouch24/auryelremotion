import React from 'react';
import {Composition} from 'remotion';
import {AuryeIVideo} from './AuryeIVideoComp';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AuryeIVideo"
        component={AuryeIVideo}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          hook: 'Tu sais déjà la vérité.',
          message: 'Il y a des silences qui parlent plus fort que les mots. Tu le ressens. Tu sais ce que ça veut dire. Arrête d\'attendre une confirmation que tu as déjà.',
          cta: 'Découvre ton message',
        }}
      />
    </>
  );
};
