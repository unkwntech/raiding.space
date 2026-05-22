import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPS_DIR = path.resolve(__dirname, '../public/maps');

const REGIONS = [
  'New_Eden',
  'Derelik', 'The_Forge', 'Vale_of_the_Silent', 'UUA-F4', 'Detorid',
  'Wicked_Creek', 'Cache', 'Scalding_Pass', 'Insmother', 'Tribute',
  'Great_Wildlands', 'Curse', 'Malpais', 'Catch', 'Venal', 'Lonetrek',
  'J7HZ-F', 'The_Spire', 'A821-A', 'Tash-Murkon', 'Outer_Passage', 'Stain',
  'Pure_Blind', 'Immensea', 'Etherium_Reach', 'Molden_Heath', 'Geminate',
  'Heimatar', 'Impass', 'Sinq_Laison', 'The_Citadel', 'The_Kalevala_Expanse',
  'Deklein', 'Devoid', 'Everyshore', 'The_Bleak_Lands', 'Esoteria', 'Oasa',
  'Syndicate', 'Metropolis', 'Domain', 'Solitude', 'Tenal', 'Fade',
  'Providence', 'Placid', 'Khanid', 'Querious', 'Cloud_Ring', 'Kador',
  'Cobalt_Edge', 'Aridia', 'Branch', 'Feythabolis', 'Outer_Ring', 'Fountain',
  'Paragon_Soul', 'Delve', 'Tenerifis', 'Omist', 'Period_Basis', 'Essence',
  'Kor-Azor', 'Perrigen_Falls', 'Genesis', 'Verge_Vendor', 'Black_Rise',
  'Pochven',
];

const CONCURRENCY = 8;

fs.mkdirSync(MAPS_DIR, { recursive: true });

function stripLinks(svg) {
  return svg
    .replace(/<a\s[^>]*>/g, '')
    .replace(/<\/a>/g, '');
}

function stripGlowEffects(svg) {
  return svg
    .replace(/(<g\s+id="glow">)[\s\S]*?(<\/g>)/, '$1$2')
    .replace(/(<g\s+id="campaigns">)[\s\S]*?(<\/g>)/, '$1$2');
}

function download(name) {
  return new Promise((resolve, reject) => {
    const url = `https://evemaps.dotlan.net/svg/${name}.dark.svg`;
    const dest = path.join(MAPS_DIR, `${name}.dark.svg`);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; raiding.space/1.0)' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${name}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const svg = stripGlowEffects(stripLinks(Buffer.concat(chunks).toString('utf8')));
        fs.writeFile(dest, svg, 'utf8', (err) => {
          if (err) reject(err); else resolve();
        });
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const results = { ok: [], failed: [] };

  for (let i = 0; i < REGIONS.length; i += CONCURRENCY) {
    const batch = REGIONS.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (name) => {
      try {
        await download(name);
        process.stdout.write(`  OK  ${name}\n`);
        results.ok.push(name);
      } catch (err) {
        process.stdout.write(`  FAIL ${name}: ${err.message}\n`);
        results.failed.push(name);
      }
    }));
  }

  console.log(`\nDone: ${results.ok.length} downloaded, ${results.failed.length} failed.`);
  if (results.failed.length > 0) process.exit(1);
}

run();
