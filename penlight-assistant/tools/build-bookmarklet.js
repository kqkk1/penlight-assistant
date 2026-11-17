/**
 * ブックマークレット用の1ファイル（content.js）を、分割ファイルから自動生成するスクリプト
 *  - 読み込み順は manifest.json の content_scripts[0].js に従う
 *  - 全体を即時関数で包み、公式サイト側の変数名（App, Utils など）とぶつからないようにする
 * 使い方: node build-bookmarklet.js <extensionフォルダ> <出力ファイル>
 */
"use strict";
const fs = require("fs");
const path = require("path");

const [dir, outFile] = process.argv.slice(2);
if (!dir || !outFile) { console.error("usage: node build-bookmarklet.js <extension dir> <output file>"); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
const files = manifest.content_scripts[0].js.filter(f => f !== path.basename(outFile));
if (!files.length) { console.error("manifest.json に js ファイルがありません"); process.exit(1); }

const parts = files.map(f => {
  const src = fs.readFileSync(path.join(dir, f), "utf8").replace(/^\s*["']use strict["'];?\s*$/m, "");
  return `// ===== ${f} =====\n${src.trim()}\n`;
});

const code = [
  "/**",
  " * Penlight Assistant - ブックマークレット用（自動生成ファイル）",
  " * ※このファイルは GitHub Actions が自動で作ります。直接編集しないでください。",
  ` * 元ファイル: ${files.join(", ")}`,
  ` * version: ${manifest.version} / build: ${new Date().toISOString()}`,
  " */",
  "(() => {",
  "\"use strict\";",
  ...parts,
  "})();",
  ""
].join("\n");

new Function(code); // 文法チェック（壊れたファイルは出力しない）
fs.writeFileSync(outFile, code);
console.log(`built ${outFile} (${files.length} files, ${code.length} bytes)`);
