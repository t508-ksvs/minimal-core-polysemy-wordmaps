// Sync the published word list from the reviewed Obsidian inventory.
// Usage: node scripts/sync_catalog.js <inventory.md> <source-image-folder>
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const [notePath, sourcePath] = process.argv.slice(2);
if (!notePath || !sourcePath) {
  console.error("Usage: node scripts/sync_catalog.js <inventory.md> <source-image-folder>");
  process.exit(2);
}

const root = path.resolve(__dirname, "..");
const note = fs.readFileSync(notePath, "utf8");
const rows = [...note.matchAll(/^\|\s*([^|]+?)\s*\|\s*[^|]+\|\s*`(Codex_[a-z_]+_43\.png)`\s*\|/gm)]
  .map((match) => ({ title: match[1].trim(), filename: match[2] }));
if (!rows.length) throw new Error("Inventory has no Codex_*_43.png rows");

const seen = new Set();
for (const row of rows) {
  if (seen.has(row.filename)) throw new Error(`Duplicate inventory image: ${row.filename}`);
  seen.add(row.filename);
  if (!fs.existsSync(path.join(sourcePath, row.filename))) {
    throw new Error(`Missing source image: ${row.filename}`);
  }
}

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), context);
const old = context.window.POLYSEMY_DATA;
const oldWords = new Map(old.words.map((item) => [item.slug, item]));
const oldComparisons = new Map(old.comparisons.map((item) => [item.slug, item]));
const words = [];
const comparisons = [];

for (const row of rows) {
  const image = `assets/${row.filename.replace(/\.png$/, ".webp")}`;
  if (row.title.includes(" vs. ")) {
    const slug = row.title.replace(" vs. ", "-").replaceAll(" ", "-");
    const current = oldComparisons.get(slug) || {};
    comparisons.push({
      slug,
      title: row.title,
      description: current.description || "",
      image,
      alt: current.alt || `${row.title} 一字多義比較圖。`,
      relatedWord: current.relatedWord || row.title.split(" vs. ")[0],
      pronunciation: current.pronunciation || row.title.split(" vs. ").map((word) => ({ label: `聽 ${word}`, text: word }))
    });
    continue;
  }

  const slug = row.title;
  const current = oldWords.get(slug) || {};
  words.push({
    slug,
    word: row.title,
    concept: current.concept || "",
    image,
    alt: current.alt || `${row.title} 一字多義教學圖。`,
    pronunciation: current.pronunciation || [{ label: "單字發音", text: row.title }],
    ...(current.comparison ? { comparison: current.comparison } : {})
  });
}

for (const comparison of comparisons) {
  for (const word of words) {
    if (comparison.title.split(" vs. ").includes(word.word)) word.comparison = comparison.slug;
  }
}

const output = `// 以正式字圖索引同步；可在每筆資料補入經核對的中文核心概念。\nwindow.POLYSEMY_DATA = ${JSON.stringify({ words, comparisons }, null, 2)};\n`;
fs.writeFileSync(path.join(root, "data.js"), output, "utf8");
console.log(`已同步 ${words.length} 個單字、${comparisons.length} 張比較圖。`);
