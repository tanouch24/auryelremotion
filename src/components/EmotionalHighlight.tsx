import React from 'react';

// ─── Emotional word list (French) ─────────────────────────────────────────

export const EMOTIONAL_WORDS = new Set([
  // relations & personnes
  'ex', 'lui', 'elle', 'eux', 'toi', 'moi',
  // actions chargées
  'répondu', 'réponse', 'message', 'messages', 'écrit', 'écrite',
  'revenu', 'revenue', 'parti', 'partie', 'quitté', 'quittée',
  'bloqué', 'bloquée', 'ignoré', 'ignorée', 'supprimé', 'supprimée',
  'oublié', 'oubliée', 'trompé', 'trompée', 'menti', 'mentait',
  'attendu', 'attendue', 'choisi', 'choisie', 'disparu', 'disparue',
  'effacé', 'effacée', 'caché', 'cachée', 'lu', 'vu', 'su',
  'dit', 'cru', 'fait', 'laissé', 'laissée',
  // états émotionnels
  'jaloux', 'jalouse', 'seul', 'seule', 'perdu', 'perdue',
  'blessé', 'blessée', 'triste', 'honte', 'peur', 'honte',
  'regret', 'regrette', 'pleuré', 'pleurée',
  // verbes émotionnels
  'aime', 'aimer', 'aimait', 'ressens', 'ressentir', 'ressenti',
  'pense', 'pensait', 'pensé', 'manque', 'manquait', 'manqué',
  'attend', 'attendait', 'souffre', 'souffrait', 'cherche', 'cherchait',
  'sait', 'savait', 'voit', 'voyait', 'sais', 'sens', 'crois',
  // mots de rupture / tension
  'silence', 'vérité', 'secret', 'mensonge', 'trahison',
  'erreur', 'faute', 'raison', 'larmes', 'douleur',
  // adverbes / mots forts
  'encore', 'toujours', 'jamais', 'trop', 'rien', 'tout', 'vrai',
  'faux', 'tard', 'avant', 'après', 'mal', 'bien', 'fond',
  // contexte numérique / situation
  'ligne', 'online', 'stories', 'profil', 'photo', 'photos',
  'contact', 'numéro', 'nuit', 'soir', 'matin', 'secrètement',
]);

// ─── Deterministic effect selector ────────────────────────────────────────

export function getEffectType(word: string, lineIdx: number, wordIdx: number): 0 | 1 | 2 | 3 {
  const h = (word.charCodeAt(0) + word.length * 3 + lineIdx * 13 + wordIdx * 7) % 4;
  return h as 0 | 1 | 2 | 3;
}

// ─── Effect 0 — Stabilo semi-transparent ──────────────────────────────────
// Rendered as backgroundColor on the parent span (always paints behind text)

export function staliboStyle(progress: number, seed: number): React.CSSProperties {
  const rotations = [-0.9, 0.6, -1.3, 1.1, -0.5, 0.8];
  const rotation = rotations[seed % rotations.length];
  const alphas = [0.30, 0.26, 0.22];
  const alpha = alphas[seed % 3] * progress;
  const hues = [
    `rgba(255, 228, 0, ${alpha})`,
    `rgba(255, 195, 55, ${alpha})`,
    `rgba(210, 255, 90, ${alpha})`,
  ];
  return {
    backgroundColor: hues[seed % 3],
    transform: `rotate(${rotation}deg)`,
    padding: '1px 4px',
    borderRadius: 2,
  };
}

// ─── Effect 1 — Underline feutre (SVG animated) ──────────────────────────

const UnderlineEffect: React.FC<{progress: number; seed: number}> = ({progress, seed}) => {
  const DASH = 108;
  const dashOffset = DASH * (1 - progress);
  const colors = ['#FFFFFF', '#D4AF37', '#FFD700', '#FFFFFF'];
  const color = colors[seed % 4];
  const mid = 4 + (seed % 3); // slight y variation for handmade feel
  return (
    <svg
      style={{position: 'absolute', bottom: -6, left: 0, width: '100%', height: 10, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
    >
      <path
        d={`M 0 ${mid} Q 28 ${mid + 2} 58 ${mid} Q 80 ${mid - 1} 100 ${mid + 1}`}
        stroke={color}
        strokeWidth={1.6}
        fill="none"
        strokeDasharray={DASH}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        opacity={0.88}
      />
    </svg>
  );
};

// ─── Effect 2 — Encadrement manuscrit (SVG rect outline) ─────────────────

const EncadrementEffect: React.FC<{progress: number; seed: number}> = ({progress}) => {
  const PERIMETER = 244;
  const dashOffset = PERIMETER * (1 - progress);
  return (
    <svg
      style={{position: 'absolute', top: -4, left: -7, width: 'calc(100% + 14px)', height: 'calc(100% + 10px)', overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
    >
      <rect
        x={1} y={1} width={98} height={24} rx={2}
        stroke="rgba(255,255,255,0.62)"
        strokeWidth={1.3}
        fill="none"
        strokeDasharray={PERIMETER}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Effect 3 — Double soulignement ──────────────────────────────────────

const DoubleUnderlineEffect: React.FC<{progress: number; seed: number}> = ({progress, seed}) => {
  const p1 = Math.min(1, progress * 1.7);
  const p2 = Math.max(0, progress * 1.7 - 0.7);
  const color = seed % 2 === 0 ? '#FFFFFF' : '#D4AF37';
  return (
    <svg
      style={{position: 'absolute', bottom: -7, left: 0, width: '100%', height: 12, overflow: 'visible', pointerEvents: 'none'}}
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
    >
      <line x1={0} y1={3} x2={100} y2={3} stroke={color} strokeWidth={1.4} strokeDasharray={100} strokeDashoffset={100 * (1 - p1)} opacity={0.88} />
      <line x1={0} y1={8} x2={100} y2={8} stroke={color} strokeWidth={1.0} strokeDasharray={100} strokeDashoffset={100 * (1 - p2)} opacity={0.58} />
    </svg>
  );
};

// ─── EmotionalWord ─────────────────────────────────────────────────────────

interface EmotionalWordProps {
  word: string;
  effectType: 0 | 1 | 2 | 3;
  progress: number;
  seed: number;
}

export const EmotionalWord: React.FC<EmotionalWordProps> = ({word, effectType, progress, seed}) => {
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...(effectType === 0 ? staliboStyle(progress, seed) : {}),
  };

  return (
    <span style={baseStyle}>
      {word}
      {effectType === 1 && <UnderlineEffect progress={progress} seed={seed} />}
      {effectType === 2 && <EncadrementEffect progress={progress} seed={seed} />}
      {effectType === 3 && <DoubleUnderlineEffect progress={progress} seed={seed} />}
    </span>
  );
};
