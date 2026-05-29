import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {EMOTIONAL_WORDS, getEffectType, EmotionalWord} from './EmotionalHighlight';

interface SceneMessageProps {
  message: string;
}

// Precompute which words get highlighted (max 2 per line, deterministic)
function buildWordGroups(lines: string[]) {
  return lines.map((line, lineIdx) => {
    const words = line.split(' ');
    let count = 0;
    return words.map((word, wordIdx) => {
      const clean = word.toLowerCase().replace(/[^a-zàâçéèêëîïôùûüÿæœ]/g, '');
      const highlight = EMOTIONAL_WORDS.has(clean) && count < 2;
      if (highlight) count++;
      return {
        word,
        highlight,
        effectType: getEffectType(clean, lineIdx, wordIdx),
        seed: lineIdx * 10 + wordIdx,
      };
    });
  });
}

export const SceneMessage: React.FC<SceneMessageProps> = ({message}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - 90;

  // Split by \n — Claude generates short phrases separated by \n
  const lines = message
    .split(/\\n|\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 3);

  const STAGGER = 35;
  const FADE_IN = 18;
  // Highlight starts 12 frames after line appears, draws over 9 frames (~300ms)
  const EFFECT_DELAY = 12;
  const EFFECT_DURATION = 9;

  const wordGroups = buildWordGroups(lines);

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

      {/* Message phrases */}
      <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 40}}>
        {lines.map((_, lineIdx) => {
          const lineStart = lineIdx * STAGGER;
          const opacity = interpolate(relativeFrame, [lineStart, lineStart + FADE_IN], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const translateY = interpolate(relativeFrame, [lineStart, lineStart + FADE_IN], [16, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const effectStart = lineStart + EFFECT_DELAY;

          return (
            <div
              key={lineIdx}
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
              <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.28em', alignItems: 'baseline'}}>
                {wordGroups[lineIdx].map(({word, highlight, effectType, seed}, wordIdx) => {
                  if (!highlight) {
                    return <span key={wordIdx}>{word}</span>;
                  }
                  const progress = Math.max(0, Math.min(1,
                    (relativeFrame - effectStart) / EFFECT_DURATION
                  ));
                  return (
                    <EmotionalWord
                      key={wordIdx}
                      word={word}
                      effectType={effectType as 0 | 1 | 2 | 3}
                      progress={progress}
                      seed={seed}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
