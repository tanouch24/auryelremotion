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

// ─── Effect 0 — Dirty stabilo (multi-layer SVG + displacement filter) ─────

const DirtyStabilo: React.FC<{progress: number; seed: number; videoStyle: 0 | 1 | 2}> = ({progress, seed, videoStyle}) => {
  const c = pickColor(seed, videoStyle);
  const filterId = `stbl-${seed}`;

  // 3 overlapping strokes with different y, length, opacity → marker feel
  const y1 = 17 + (seed % 4);          // main stroke y (17–20)
  const y2 = 10 + (seed % 5);          // top bleed (10–14)
  const y3 = 26 + (seed % 3);          // bottom bleed (26–28)

  const w1 = 200 * Math.min(1, progress * 1.04);
  const w2 = 190 * Math.min(1, progress * 0.93);
  const w3 = 205 * Math.min(1, progress * 1.10);

  return (
    <svg
      style={{
        position: 'absolute',
        top: '-12%',
        left: '-3px',
        width: 'calc(100% + 6px)',
        height: '128%',
        zIndex: -1,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={filterId} x="-8%" y="-40%" width="116%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.10"
            numOctaves="2"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {/* Main thick stroke */}
        <line
          x1={0} y1={y1}
          x2={w1} y2={y1 + (seed % 3) * 0.4 - 0.4}
          stroke={colorStr(c)}
          strokeWidth={20}
          strokeLinecap="round"
        />
        {/* Top bleed — lighter */}
        <line
          x1={2} y1={y2}
          x2={w2} y2={y2 + (seed % 2) * 0.6}
          stroke={colorStr(c, c.a * 0.55)}
          strokeWidth={11}
          strokeLinecap="round"
        />
        {/* Bottom bleed — lightest */}
        <line
          x1={0} y1={y3}
          x2={w3} y2={y3 - (seed % 2) * 0.5}
          stroke={colorStr(c, c.a * 0.38)}
          strokeWidth={7}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

// ─── Effect 1 — Underline feutre ──────────────────────────────────────────

const UnderlineEffect: React.FC<{progress: number; seed: number; videoStyle: 0 | 1 | 2}> = ({progress, seed, videoStyle}) => {
  const DASH = 108;
  const dashOffset = DASH * (1 - progress);
  const c = pickColor(seed, videoStyle);
  const mid = 4 + (seed % 3);
  return (
    <svg
      style={{position: 'absolute', bottom: -6, left: 0, width: '100%', height: 10, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
    >
      <path
        d={`M 0 ${mid} Q 28 ${mid + 2} 58 ${mid} Q 80 ${mid - 1} 100 ${mid + 1}`}
        stroke={colorStr(c, 0.92)}
        strokeWidth={1.8}
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
      style={{position: 'absolute', top: -4, left: -7, width: 'calc(100% + 14px)', height: 'calc(100% + 10px)', overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
    >
      <rect
        x={1} y={1} width={98} height={24} rx={2}
        stroke="rgba(255,255,255,0.60)"
        strokeWidth={1.4}
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
  const w1 = videoStyle === 2 ? 2.2 : 1.4;
  const w2 = videoStyle === 2 ? 1.4 : 1.0;
  return (
    <svg
      style={{position: 'absolute', bottom: -8, left: 0, width: '100%', height: 14, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
    >
      <line x1={0} y1={3} x2={100} y2={3} stroke={colorStr(c, 0.9)} strokeWidth={w1} strokeDasharray={100} strokeDashoffset={100 * (1 - p1)} />
      <line x1={0} y1={9} x2={100} y2={9} stroke={colorStr(c, 0.55)} strokeWidth={w2} strokeDasharray={100} strokeDashoffset={100 * (1 - p2)} />
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
  // Micro shake: oscillates during draw phase, settles at progress=1
  const shakeX = progress < 1
    ? Math.sin(progress * 10 * Math.PI) * 2.2 * Math.sin(progress * Math.PI)
    : 0;

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    transform: `translateX(${shakeX}px)`,
  };

  return (
    <span style={baseStyle}>
      {effectType === 0 && <DirtyStabilo progress={progress} seed={seed} videoStyle={videoStyle} />}
      {word}
      {effectType === 1 && <UnderlineEffect progress={progress} seed={seed} videoStyle={videoStyle} />}
      {effectType === 2 && <EncadrementEffect progress={progress} seed={seed} />}
      {effectType === 3 && <DoubleUnderlineEffect progress={progress} seed={seed} videoStyle={videoStyle} />}
    </span>
  );
};
