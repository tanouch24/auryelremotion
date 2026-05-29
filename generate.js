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

function formatDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}

function getSlot() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'MATIN';
  if (h >= 12 && h < 18) return 'MIDI';
  return 'SOIR';
}

// Résout les conflits si plusieurs vidéos dans le même créneau
function resolveOutputPaths(outputRoot) {
  const date = formatDate();
  const slot = getSlot();
  let base = `${date}_${slot}`;
  let videoPath = path.join(outputRoot, `${base}.mp4`);
  let jsonPath  = path.join(outputRoot, `${base}.json`);
  let i = 2;
  while (fs.existsSync(videoPath)) {
    base = `${date}_${slot}_${i}`;
    videoPath = path.join(outputRoot, `${base}.mp4`);
    jsonPath  = path.join(outputRoot, `${base}.json`);
    i++;
  }
  return {videoPath, jsonPath, label: base};
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

const SYSTEM_PROMPT = `Tu génères du contenu pour des vidéos TikTok courtes.

RÈGLE ABSOLUE N°1 — LE HOOK
Exactement 1 phrase. Maximum 8 mots. Aucune question. Aucune métaphore.
Uniquement un fait brut émotionnel, comme si tu décrivais quelque chose que tu as vu.

BONS hooks (copie ce style) :
"Il est revenu après 8 mois."
"Son message est arrivé à 2h17."
"Il a regardé tes stories 3 fois."
"Tu as effacé son numéro. Deux fois."
"Il t'a répondu après 18 jours."
"Elle a bloqué tout le monde sauf toi."
"Il a supprimé sa photo de profil."
"Tu as vérifié son compte ce matin."
"Ce silence dure depuis 3 semaines."
"Tu gardes encore son prénom."

MAUVAIS hooks (ne jamais faire) :
× "Quelque chose va bientôt changer."
× "L'univers t'envoie un message."
× "Tu mérites mieux que ce silence."
× "Ton intuition ne te ment pas."

RÈGLE ABSOLUE N°2 — LE MESSAGE
Exactement 2 ou 3 phrases. SÉPARÉES PAR \\n dans le JSON.
Maximum 7 mots par phrase. Tutoyer. Style télégraphique.

BON message (copie ce format EXACTEMENT) :
"Tu gardes encore son numéro.\\nTu sais que tu l'appelleras pas.\\nMais tu effaces pas."

AUTRE BON exemple :
"Il était en ligne à 2h.\\nTu l'as vu.\\nIl n'a pas écrit."

MAUVAIS message (ne jamais faire) :
× Phrases longues avec subordination
× Tout ce qui parle d'énergie, univers, signes
× Plus de 3 phrases

RÈGLE ABSOLUE N°3 — LE CTA
Choisir EXACTEMENT l'une de ces phrases, mot pour mot :
- "Découvre ce qu'il ressent encore."
- "Parle avec Auryel maintenant."
- "Découvre ce que révèle le tirage."
- "Obtiens ta réponse gratuitement."
- "Vois la vérité sur cette situation."

Réponds UNIQUEMENT en JSON valide, aucun texte autour :
{"hook":"...","message":"...","cta":"..."}`;

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
  const outputRoot = path.join(__dirname, 'output');
  fs.mkdirSync(outputRoot, { recursive: true });

  const {videoPath: outputPath, jsonPath: contentPath, label} = resolveOutputPaths(outputRoot);
  saveJson(contentPath, content);

  updateHistory(hooksPath, content.hook);
  updateHistory(topicsPath, content.message);
  updateWordCount(content.hook + ' ' + content.message);

  console.log(`\n💾 content → ${contentPath}`);
  console.log(`🎬 Créneau : ${label}`);

  // ─── Remotion render ────────────────────────────────────────────────────
  console.log('\n🎥 Lancement du rendu Remotion...');

  const entryPoint = path.join(__dirname, 'src', 'index.ts');

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
