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
          hook: 'Il est revenu après 8 mois.',
          message: 'Tu avais tout effacé.\nIl est revenu quand même.\nTu ne sais plus quoi faire.',
          cta: 'Découvre ce qu\'il ressent encore.',
        }}
      />
    </>
  );
};
