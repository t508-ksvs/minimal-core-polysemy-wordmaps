// Check the data-to-image links before copying a new version to GitHub Pages.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), context);
const { words, comparisons } = context.window.POLYSEMY_DATA;
const entries = [...words, ...comparisons];
const errors = [];
const slugs = new Set();

for (const entry of entries) {
  if (!entry.slug || slugs.has(entry.slug)) errors.push(`重複或空白的 slug：${entry.slug}`);
  slugs.add(entry.slug);
  if (!entry.alt) errors.push(`${entry.slug} 缺少圖片說明`);
  if (!entry.pronunciation?.length || entry.pronunciation.some((item) => !item.text || !item.label)) {
    errors.push(`${entry.slug} 缺少發音資料`);
  }
  if (!entry.image?.startsWith("assets/") || entry.image.includes("..") || !fs.existsSync(path.join(root, entry.image))) {
    errors.push(`${entry.slug} 找不到網站圖片：${entry.image}`);
  }
}
for (const word of words) {
  if (word.comparison && !comparisons.some((entry) => entry.slug === word.comparison)) {
    errors.push(`${word.slug} 的比較圖連結不存在`);
  }
}
for (const comparison of comparisons) {
  if (!words.some((word) => word.slug === comparison.relatedWord)) {
    errors.push(`${comparison.slug} 的返回單字連結不存在`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`已核對 ${words.length} 個單字、${comparisons.length} 張比較圖及 ${entries.length} 張網站圖片。`);
}
