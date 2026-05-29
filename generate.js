import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Helpers ───────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function loadJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return defaultValue;
  }
}

function saveJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Anti-repetition ──────────────────────────────────────────────────────

const WINDOW_DAYS = 7;
const SIMILARITY_THRESHOLD = 0.70;

function wordSet(text) {
  return new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );
}

function jaccardSimilarity(a, b) {
  const setA = wordSet(a);
  const setB = wordSet(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function isRecent(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return diff < WINDOW_DAYS;
}

function isTooSimilar(text, history) {
  return history
    .filter(entry => isRecent(entry.date))
    .some(entry => jaccardSimilarity(text, entry.text) >= SIMILARITY_THRESHOLD);
}

function updateHistory(filePath, text) {
  const history = loadJson(filePath, []);
  history.push({ text, date: today() });
  saveJson(filePath, history);
}

function updateWordCount(text) {
  const wordsPath = path.join(__dirname, 'data', 'words.json');
  const counts = loadJson(wordsPath, {});
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  saveJson(wordsPath, counts);
}

// ─── Claude content generation ─────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es Auryel.

Tu parles directement à une seule personne.

Tu ne parles jamais comme un voyant.
Tu ne fais jamais de guidance spirituelle générique.

INTERDIT — ne jamais utiliser ces mots ou concepts :
- énergie, vibration, univers, guides, âme sœur, mission de vie
- destin, cosmos, signes, synchronicité
- questions rhétoriques
- métaphores abstraites

Tu parles comme si tu avais été témoin de ce que la personne traverse.

Objectif : arrêter le scroll dès la première seconde.
Le spectateur doit penser : "Comment elle sait ça ?"

═══════════════════════════════
RÈGLES DU HOOK
═══════════════════════════════

- maximum 8 mots
- uniquement des faits émotionnels concrets
- jamais de questions
- jamais de métaphores
- jamais de spiritualité abstraite
- une situation précise, un moment précis

Exemples de bons hooks :
"Il est revenu après 8 mois."
"Je n'aurais jamais dû répondre."
"Son message est arrivé à 2h17."
"Cette femme n'était pas une amie."
"Il regardait encore mes stories."
"Je savais qu'il me mentait."
"Je regrette d'avoir demandé."
"J'aurais préféré ne jamais savoir."
"Il a effacé toutes ses photos."
"Elle a bloqué tout le monde sauf toi."
"Tu as vu qu'il était en ligne."
"Il t'a répondu après 3 semaines."

═══════════════════════════════
RÈGLES DU MESSAGE
═══════════════════════════════

- 2 à 3 phrases MAXIMUM
- chaque phrase séparée par \\n
- maximum 8 mots par phrase
- style fragment, émotionnel, direct
- tutoyer toujours
- pas de ponctuation complexe
- respiration entre les phrases

Exemple de bon message :
"Le soir, tu repenses à lui.\\nTu voudrais effacer ce message.\\nMais tu ne l'as pas fait."

Mauvais exemple (trop long, éviter) :
"Mais le soir, quand tout le monde dort, tu repenses encore à cette personne et tu te demandes si tu aurais dû faire autrement..."

═══════════════════════════════
RÈGLES DU CTA
═══════════════════════════════

Choisir UN seul CTA parmi cette liste :
- "Découvre ce qu'il ressent encore."
- "Reçois ta guidance gratuite."
- "Parle avec Auryel."
- "Découvre ce que révèle le tirage."
- "Obtiens ta réponse gratuitement."
- "Vois ce que les cartes révèlent."
- "Découvre la vérité maintenant."

Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication :
{
  "hook": "...",
  "message": "...",
  "cta": "..."
}`;

async function generateContent(client) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: 'Génère un nouveau contenu vidéo TikTok pour Auryel. Réponds uniquement en JSON.',
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Invalid JSON response: ${text}`);

  return JSON.parse(jsonMatch[0]);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY manquant dans .env');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const hooksPath = path.join(__dirname, 'data', 'hooks.json');
  const topicsPath = path.join(__dirname, 'data', 'topics.json');

  let content = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  console.log('🎬 AuryeIRemotion — Génération en cours...\n');

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    console.log(`📝 Tentative ${attempts}/${MAX_ATTEMPTS} — Appel Claude Sonnet...`);

    try {
      const candidate = await generateContent(client);

      // Validate structure
      if (!candidate.hook || !candidate.message || !candidate.cta) {
        console.log('⚠️  Structure JSON invalide, nouvelle tentative...');
        continue;
      }

      // Anti-repetition check
      const hooksHistory = loadJson(hooksPath, []);
      const topicsHistory = loadJson(topicsPath, []);

      if (isTooSimilar(candidate.hook, hooksHistory)) {
        console.log('⚠️  Hook trop similaire à un contenu récent, nouvelle tentative...');
        continue;
      }

      if (isTooSimilar(candidate.message, topicsHistory)) {
        console.log('⚠️  Message trop similaire à un contenu récent, nouvelle tentative...');
        continue;
      }

      content = candidate;
      break;
    } catch (err) {
      console.log(`⚠️  Erreur génération: ${err.message}`);
      if (attempts >= MAX_ATTEMPTS) throw err;
    }
  }

  if (!content) {
    console.error('❌ Impossible de générer un contenu unique après', MAX_ATTEMPTS, 'tentatives.');
    process.exit(1);
  }

  console.log('\n✅ Contenu généré :');
  console.log(`   Hook    : ${content.hook}`);
  console.log(`   Message : ${content.message}`);
  console.log(`   CTA     : ${content.cta}`);

  // Save content and update history
  const outputDir = path.join(__dirname, 'output', today());
  fs.mkdirSync(outputDir, { recursive: true });

  const contentPath = path.join(outputDir, 'content.json');
  saveJson(contentPath, content);

  updateHistory(hooksPath, content.hook);
  updateHistory(topicsPath, content.message);
  updateWordCount(content.hook + ' ' + content.message);

  console.log(`\n💾 content.json → ${contentPath}`);

  // ─── Remotion render ────────────────────────────────────────────────────
  console.log('\n🎥 Lancement du rendu Remotion...');

  const entryPoint = path.join(__dirname, 'src', 'index.ts');
  const outputPath = path.join(outputDir, 'video.mp4');

  console.log('   Bundling...');
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log('   Sélection de la composition...');
  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'AuryeIVideo',
    inputProps: content,
  });

  console.log('   Rendu en cours (1080x1920, 30fps, 360 frames)...');
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: content,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r   Progression : ${Math.round(progress * 100)}%`);
    },
  });

  console.log('\n');
  console.log('━'.repeat(50));
  console.log('✨ Vidéo générée avec succès !');
  console.log(`📁 ${outputPath}`);
  console.log('━'.repeat(50));
}

main().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message);
  process.exit(1);
});
