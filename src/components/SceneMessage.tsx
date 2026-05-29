import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {EMOTIONAL_WORDS, POWER_WORDS, getEffectType, EmotionalWord} from './EmotionalHighlight';

interface SceneMessageProps {
  message: string;
  videoStyle: 0 | 1 | 2;
}

interface WordInfo {
  word: string;
  highlight: boolean;
  isGiant: boolean;
  effectType: 0 | 1 | 2 | 3;
  seed: number;
}

// Precompute word groups — giant word detection (max 1 per video)
function buildWordGroups(lines: string[], videoStyle: 0 | 1 | 2): WordInfo[][] {
  let giantUsed = false;
  return lines.map((line, lineIdx) => {
    const words = line.split(' ');
    let highlightCount = 0;
    return words.map((word, wordIdx) => {
      const clean = word.toLowerCase().replace(/[^a-zàâçéèêëîïôùûüÿæœ]/g, '');
      const isPower = POWER_WORDS.has(clean) && !giantUsed;
      if (isPower) giantUsed = true;
      const highlight = EMOTIONAL_WORDS.has(clean) && highlightCount < 2 && !isPower;
      if (highlight) highlightCount++;
      return {
        word,
        highlight,
        isGiant: isPower,
        effectType: getEffectType(clean, lineIdx, wordIdx, videoStyle),
        seed: lineIdx * 10 + wordIdx,
      };
    });
  });
}

export const SceneMessage: React.FC<SceneMessageProps> = ({message, videoStyle}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - 90;

  const lines = message
    .split(/\\n|\n/)
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 3);

  const STAGGER = 35;
  const FADE_IN = 18;
  // Highlight starts 12 frames after line appears, draws over 9 frames
  const EFFECT_DELAY = 12;
  const EFFECT_DURATION = 9;

  const wordGroups = buildWordGroups(lines, videoStyle);

  // Style B: left-aligned with offset
  const isLeftAligned = videoStyle === 1;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        // Nudge content into 35-55% zone — safe from TikTok bottom UI
        alignItems: isLeftAligned ? 'flex-start' : 'center',
        justifyContent: 'flex-start',
        paddingTop: '28%',
        paddingLeft: isLeftAligned ? 72 : 80,
        paddingRight: 80,
      }}
    >
      {/* AURYEL watermark — top of scene */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 14,
          color: '#FFFFFF',
          opacity: 0.6,
          letterSpacing: '0.3em',
        }}
      >
        AURYEL
      </div>

      {/* Message phrases */}
      <div
        style={{
          textAlign: isLeftAligned ? 'left' : 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
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
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: isLeftAligned ? 'flex-start' : 'center',
                  gap: '0 0.28em',
                  alignItems: 'baseline',
                }}
              >
                {wordGroups[lineIdx].map(({word, highlight, isGiant, effectType, seed}, wordIdx) => {
                  // ── Giant word (first power word only) ──
                  if (isGiant) {
                    const pulseScale = 1 + 0.04 * Math.sin(relativeFrame * 0.12);
                    const glowProgress = Math.max(0, Math.min(1, (relativeFrame - effectStart) / EFFECT_DURATION));
                    const dashOffset = 108 * (1 - glowProgress);
                    return (
                      <span
                        key={wordIdx}
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          fontSize: 80,
                          fontWeight: 'bold',
                          fontStyle: 'normal',
                          color: '#D4AF37',
                          transform: `scale(${pulseScale})`,
                          transformOrigin: 'center bottom',
                          textShadow: '0 0 32px rgba(212,175,55,0.7)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {word}
                        {/* Gold underline draws in */}
                        <svg
                          style={{position: 'absolute', bottom: -8, left: 0, width: '100%', height: 10, overflow: 'visible', pointerEvents: 'none'}}
                          viewBox="0 0 100 10"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M 0 5 Q 50 7 100 5"
                            stroke="#D4AF37"
                            strokeWidth={2.5}
                            fill="none"
                            strokeDasharray={108}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            opacity={0.95}
                          />
                        </svg>
                      </span>
                    );
                  }

                  // ── Normal word ──
                  if (!highlight) {
                    return <span key={wordIdx}>{word}</span>;
                  }

                  // ── Emotional highlight ──
                  const progress = Math.max(0, Math.min(1,
                    (relativeFrame - effectStart) / EFFECT_DURATION,
                  ));
                  return (
                    <EmotionalWord
                      key={wordIdx}
                      word={word}
                      effectType={effectType}
                      progress={progress}
                      seed={seed}
                      videoStyle={videoStyle}
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
