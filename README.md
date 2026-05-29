# AuryeIRemotion

Générateur automatique de vidéos TikTok et Reels avec Remotion. Crée des vidéos de 12 secondes mettant en scène Auryel, une femme mystérieuse et élégante qui parle directement au spectateur sur les émotions, les relations et l'intuition.

## Installation

```bash
# Cloner le projet
git clone https://github.com/tanouch24/auryelremotion.git
cd auryelremotion

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env et ajoutez votre ANTHROPIC_API_KEY
```

## Configuration

Le fichier `.env` doit contenir votre clé API Anthropic :

```
ANTHROPIC_API_KEY=votre_clé_api_anthropic
```

Obtenez votre clé API sur [console.anthropic.com](https://console.anthropic.com).

## Génération

```bash
npm run generate
```

Ce script :
- Appelle Claude Sonnet via l'API Anthropic
- Génère le contenu : hook (accroche), message principal et CTA (call-to-action)
- Vérifie les anti-répétitions pour éviter les doublons
- Rend une vidéo de 12 secondes au format TikTok/Reels (1080×1920px)
- Sauvegarde la vidéo dans : `output/YYYY-MM-DD/video.mp4`

## Remplacement de l'image Auryel

L'image à `assets/character/auryel_base.jpg` est un placeholder. Remplacez-la par un vrai portrait d'Auryel :

**Spécifications :**
- Femme de 25-35 ans
- Cheveux longs et foncés
- Regard direct vers la caméra
- Style réaliste et élégant
- Résolution : 1080×1920px (format portrait)
- Format : JPEG

L'image est suivie par Git et sera utilisée dans tous les rendus vidéo.

## Prévisualisation

```bash
npm run preview
```

Lance Remotion Studio dans le navigateur, permettant de prévisualiser la vidéo en temps réel et d'ajuster les paramètres avant le rendu final.

## Structure du projet

```
auryelremotion/
├── .env.example                      # Exemple de configuration (clé API)
├── .gitignore                        # Fichiers ignorés par Git
├── package.json                      # Dépendances et scripts npm
├── tsconfig.json                     # Configuration TypeScript
├── remotion.config.ts                # Configuration Remotion
├── generate.js                       # Script de génération de contenu
│
├── src/
│   ├── index.ts                      # Point d'entrée Remotion
│   ├── compositions/
│   │   ├── AuryeIVideo.tsx          # Composition root Remotion
│   │   └── AuryeIVideoComp.tsx      # Composant principal de la vidéo
│   └── components/
│       ├── CharacterLayer.tsx        # Couche du personnage Auryel
│       ├── SceneHook.tsx             # Scène d'accroche (hook)
│       ├── SceneMessage.tsx          # Scène du message principal
│       ├── SceneCTA.tsx              # Scène du call-to-action
│       └── Particles.tsx             # Effets particulaires
│
├── assets/
│   ├── character/
│   │   └── auryel_base.jpg          # Portrait d'Auryel (1080×1920px)
│   └── music/
│       └── [fichiers audio]         # Musiques et ambiances
│
├── data/
│   ├── hooks.json                    # Accroche déjà générées (anti-répétition)
│   ├── topics.json                   # Thèmes et sujets déjà traités
│   ├── words.json                    # Mots-clés déjà utilisés
│   └── used_psalms.json              # Suivi des contenus générés
│
└── output/
    └── [YYYY-MM-DD]/
        └── video.mp4                 # Vidéo générée
```

## Stack technique

- **Node.js** — Runtime JavaScript
- **TypeScript** — Typage statique
- **Remotion** — Framework vidéo React
- **React** — Composants UI
- **@anthropic-ai/sdk** — Accès à Claude Sonnet
- **Sharp** — Traitement d'images

## Flux de travail

1. **Génération de contenu** : `npm run generate` appelle Claude Sonnet
2. **Validation** : Les contenus générés sont vérifiés contre l'historique
3. **Rendu vidéo** : Remotion rend la composition en vidéo MP4
4. **Sortie** : La vidéo est sauvegardée avec un timestamp

## Notes

- Les vidéos sont optimisées pour TikTok et Instagram Reels (1080×1920px)
- Chaque génération crée un contenu unique grâce à Claude
- Le système mémorise les contenus passés pour éviter les répétitions
- Les vidéos durent 12 secondes avec trois actes : hook → message → CTA
