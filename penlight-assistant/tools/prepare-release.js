/**
 * リリース用ファイルを準備するスクリプト（GitHub Actions から呼ばれる）
 *  1. タグ・manifest.json・config.js のバージョンが一致しているか確認（ずれていたら止める）
 *  2. 拡張機能フォルダ（manifest に書かれたファイルだけ）を dist/<名前>/ にコピー
 *  3. ブックマークレット用の1ファイルを dist/<名前>-bookmarklet.js に生成
 * 使い方: node prepare-release.js <タグ名 例: v4.5.0> <extensionフォルダ> <出力フォルダ>
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const [tag, dir, outDir] = process.argv.slice(2);
if (!tag || !dir || !outDir) { console.error("usage: node prepare-release.js <tag> <extension dir> <out dir>"); process.exit(1); }

const tagVer = tag.replace(/^v/, "");
const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
const configSrc = fs.readFileSync(path.join(dir, "config.js"), "utf8");
const codeVer = (configSrc.match(/CURRENT_VERSION\s*=\s*["']([^"']+)["']/) || [])[1];

const errors = [];
if (manifest.version !== tagVer) errors.push(`manifest.json の version (${manifest.version}) がタグ (${tag}) と違います`);
if (codeVer !== tagVer) errors.push(`config.js の CURRENT_VERSION (${codeVer}) がタグ (${tag}) と違います`);
if (errors.length) {
  errors.forEach(e => console.error(`::error::${e}`));
  console.error("バージョンをそろえてから、リリースを作り直してください。");
  process.exit(1);
}

const name = `penlight-assistant-v${tagVer}`;
const pkgDir = path.join(outDir, name);
fs.mkdirSync(pkgDir, { recursive: true });
const files = ["manifest.json", ...manifest.content_scripts.flatMap(cs => cs.js || [])];
for (const f of files) {
  if (!fs.existsSync(path.join(dir, f))) { console.error(`::error::${f} が見つかりません（manifest.json に書かれています）`); process.exit(1); }
  fs.copyFileSync(path.join(dir, f), path.join(pkgDir, f));
}
execFileSync(process.execPath, [path.join(__dirname, "build-bookmarklet.js"), dir, path.join(outDir, `${name}-bookmarklet.js`)], { stdio: "inherit" });

// 後続のステップで使う名前を出力
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `name=${name}\n`);
console.log(`prepared ${name}: ${files.join(", ")}`);
