import React from 'react';

// ─── Word lists ────────────────────────────────────────────────────────────

export const EMOTIONAL_WORDS = new Set([
  'ex', 'lui', 'elle', 'eux', 'toi', 'moi',
  'répondu', 'réponse', 'message', 'messages', 'écrit', 'écrite',
  'revenu', 'revenue', 'parti', 'partie', 'quitté', 'quittée',
  'bloqué', 'bloquée', 'ignoré', 'ignorée', 'supprimé', 'supprimée',
  'oublié', 'oubliée', 'trompé', 'trompée', 'menti', 'mentait',
  'attendu', 'attendue', 'choisi', 'choisie', 'disparu', 'disparue',
  'effacé', 'effacée', 'caché', 'cachée', 'lu', 'vu', 'su',
  'dit', 'cru', 'fait', 'laissé', 'laissée',
  'jaloux', 'jalouse', 'seul', 'seule', 'perdu', 'perdue',
  'blessé', 'blessée', 'honte', 'peur',
  'regret', 'regrette', 'pleuré', 'pleurée',
  'aime', 'aimait', 'ressens', 'ressenti',
  'pense', 'pensait', 'pensé', 'manque', 'manqué',
  'attend', 'attendait', 'souffre', 'cherche',
  'sait', 'savait', 'voit', 'sais', 'sens', 'crois',
  'silence', 'vérité', 'secret', 'mensonge', 'trahison',
  'erreur', 'faute', 'raison', 'larmes', 'douleur',
  'encore', 'toujours', 'jamais', 'trop', 'rien', 'vrai', 'mal',
  'ligne', 'stories', 'profil', 'contact', 'nuit', 'soir',
]);

// Words that can get giant treatment (max 1 per video)
export const POWER_WORDS = new Set([
  'répondu', 'message', 'attend', 'attendu', 'revenu', 'revenue',
  'menti', 'vérité', 'secret', 'oublié', 'oubliée',
  'pense', 'encore', 'jamais', 'toujours', 'seul', 'seule',
  'quitté', 'quittée', 'bloqué', 'bloquée', 'disparu', 'disparue',
  'silence', 'larmes', 'trop', 'rien',
]);

// ─── Deterministic helpers ─────────────────────────────────────────────────

export function getEffectType(
  word: string,
  lineIdx: number,
  wordIdx: number,
  videoStyle: 0 | 1 | 2,
): 0 | 1 | 2 | 3 {
  if (videoStyle === 2) return 3; // Style C always = aggressive double underline
  const h = (word.charCodeAt(0) + word.length * 3 + lineIdx * 13 + wordIdx * 7) % 4;
  return h as 0 | 1 | 2 | 3;
}

// Color: 70% yellow, 20% pink, 10% red — shifted by videoStyle
function pickColor(seed: number, videoStyle: 0 | 1 | 2): {r: number; g: number; b: number; a: number} {
  const r = seed % 10;
  // Style B shifts toward pink
  const pinkThreshold = videoStyle === 1 ? 4 : 6;
  const redThreshold = videoStyle === 1 ? 9 : 9;

  const a = 0.30 + (seed % 4) * 0.03; // 0.30 – 0.39

  if (r <= pinkThreshold) return {r: 255, g: 235, b: 0, a};           // yellow
  if (r <= redThreshold)  return {r: 255, g: 55, b: 155, a};          // pink
  return {r: 255, g: 18, b: 50, a};                                    // red marker
}

function colorStr(c: {r: number; g: number; b: number; a: number}, alphaOverride?: number) {
  return `rgba(${c.r},${c.g},${c.b},${alphaOverride ?? c.a})`;
}

// ─── Effect 0 — Stabilo (backgroundColor sur le span — toujours visible) ─
// Note: pas de SVG ni z-index. Le background d'un span est TOUJOURS derrière
// son propre texte en CSS. Box-shadows simulent les saignées du marqueur.

function staliboSpanStyle(progress: number, seed: number, videoStyle: 0 | 1 | 2): React.CSSProperties {
  const c = pickColor(seed, videoStyle);
  const rotations = [-0.9, 0.7, -1.2, 1.0, -0.5, 0.8, -0.3, 1.1];
  const rot = rotations[seed % rotations.length];
  const bleedA = c.a * 0.55 * progress;
  const bleedB = c.a * 0.40 * progress;
  const bleedC = c.a * 0.30 * progress;
  const ox1 = 2 + (seed % 3); // 2-4px bleed right
  const ox2 = -(1 + seed % 2); // -1/-2px bleed left
  const oy3 = 2 + (seed % 3); // 2-4px bleed bottom
  return {
    backgroundColor: colorStr(c, c.a * progress),
    boxShadow: [
      `${ox1}px 1px 0 ${colorStr(c, bleedA)}`,
      `${ox2}px -1px 0 ${colorStr(c, bleedB)}`,
      `0px ${oy3}px 0 ${colorStr(c, bleedC)}`,
      `0px -1px 0 ${colorStr(c, bleedC * 0.7)}`,
    ].join(', '),
    padding: '3px 6px',
    borderRadius: 3,
    transform: `rotate(${rot}deg)`,
    display: 'inline-block',
  };
}

// ─── Effect 1 — Underline feutre ──────────────────────────────────────────

const UnderlineEffect: React.FC<{progress: number; seed: number; videoStyle: 0 | 1 | 2}> = ({progress, seed, videoStyle}) => {
  const DASH = 108;
  const dashOffset = DASH * (1 - progress);
  const c = pickColor(seed, videoStyle);
  const mid = 8 + (seed % 4); // 8-11 in 0-18 viewBox
  return (
    <svg
      style={{position: 'absolute', bottom: -12, left: 0, width: '100%', height: 18, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 18"
      preserveAspectRatio="none"
    >
      <path
        d={`M 0 ${mid} Q 28 ${mid + 3} 58 ${mid} Q 80 ${mid - 2} 100 ${mid + 1}`}
        stroke={colorStr(c, 0.95)}
        strokeWidth={4}
        fill="none"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Effect 2 — Encadrement manuscrit ────────────────────────────────────

const EncadrementEffect: React.FC<{progress: number; seed: number}> = ({progress}) => {
  const PERIMETER = 244;
  return (
    <svg
      style={{position: 'absolute', top: -6, left: -8, width: 'calc(100% + 16px)', height: 'calc(100% + 14px)', overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
    >
      <rect
        x={1} y={1} width={98} height={24} rx={2}
        stroke="rgba(255,255,255,0.80)"
        strokeWidth={2.5}
        fill="none"
        strokeDasharray={PERIMETER}
        strokeDashoffset={PERIMETER * (1 - progress)}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Effect 3 — Double soulignement agressif ──────────────────────────────

const DoubleUnderlineEffect: React.FC<{progress: number; seed: number; videoStyle: 0 | 1 | 2}> = ({progress, seed, videoStyle}) => {
  const p1 = Math.min(1, progress * 1.7);
  const p2 = Math.max(0, progress * 1.7 - 0.7);
  const c = pickColor(seed, videoStyle);
  // Style C: thicker, more aggressive lines
  const w1 = videoStyle === 2 ? 5 : 3.5;
  const w2 = videoStyle === 2 ? 3 : 2;
  return (
    <svg
      style={{position: 'absolute', bottom: -14, left: 0, width: '100%', height: 20, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
    >
      <line x1={0} y1={5} x2={100} y2={5} stroke={colorStr(c, 0.95)} strokeWidth={w1} strokeDasharray={100} strokeDashoffset={100 * (1 - p1)} />
      <line x1={0} y1={13} x2={100} y2={13} stroke={colorStr(c, 0.65)} strokeWidth={w2} strokeDasharray={100} strokeDashoffset={100 * (1 - p2)} />
    </svg>
  );
};

// ─── EmotionalWord ─────────────────────────────────────────────────────────

interface EmotionalWordProps {
  word: string;
  effectType: 0 | 1 | 2 | 3;
  progress: number;
  seed: number;
  videoStyle: 0 | 1 | 2;
}

export const EmotionalWord: React.FC<EmotionalWordProps> = ({word, effectType, progress, seed, videoStyle}) => {
  // Micro shake: oscillates while drawing, settles cleanly at progress=1
  const shakeX = progress < 1
    ? Math.sin(progress * 10 * Math.PI) * 2.5 * Math.sin(progress * Math.PI)
    : 0;

  // Effect 0: stabilo via backgroundColor (TOUJOURS visible — background du span = toujours derrière son texte)
  const isStabilo = effectType === 0;
  const spanStyle: React.CSSProperties = isStabilo
    ? {
        ...staliboSpanStyle(progress, seed, videoStyle),
        position: 'relative',
        transform: `${staliboSpanStyle(progress, seed, videoStyle).transform as string} translateX(${shakeX}px)`,
      }
    : {
        position: 'relative',
        display: 'inline-block',
        transform: `translateX(${shakeX}px)`,
      };

  return (
    <span style={spanStyle}>
      {word}
      {effectType === 1 && <UnderlineEffect progress={progress} seed={seed} videoStyle={videoStyle} />}
      {effectType === 2 && <EncadrementEffect progress={progress} seed={seed} />}
      {effectType === 3 && <DoubleUnderlineEffect progress={progress} seed={seed} videoStyle={videoStyle} />}
    </span>
  );
};
