/**
 * 標準のスプレッドシートの内容を、1つの colors.json に書き出すスクリプト（GitHub Actions から呼ばれる）
 *  - 読むシートとスプシIDは extension/config.js（CONFIG.SHEETS / DEFAULT_SPREADSHEET_ID）から取る
 *  - 行の読み取りは extension/data.js の DataFetcher.parseRows をそのまま使う（拡張機能と同じ結果になる）
 *  - 1シートでも読めなかったら、何も書かずに失敗する（中途半端なファイルを配らないため）
 *  - 中身が前回と同じなら、ファイルを書き換えない（不要なコミットを作らない）
 * 使い方: node build-colors.js <extensionフォルダ> <出力ファイル>
 */
"use strict";
const fs = require("fs");
const path = require("path");

const [dir, outFile] = process.argv.slice(2);
if (!dir || !outFile) { console.error("usage: node build-colors.js <extension dir> <output file>"); process.exit(1); }

// config.js / utils.js / data.js は、読み込んだだけでは画面に触らないので、Node でもそのまま評価できる
const src = ["config.js", "utils.js", "data.js"].map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
const { CONFIG, Utils, DataFetcher } = new Function(`${src}\nreturn { CONFIG, Utils, DataFetcher };`)();

async function getCsv(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.DEFAULT_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
  for (let i = 1; i <= 3; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
      console.log(`  ${sheet}: HTTP ${res.status}（${i}/3）`);
    } catch (e) { console.log(`  ${sheet}: ${e.message}（${i}/3）`); }
    await new Promise(r => setTimeout(r, 3000 * i));
  }
  throw new Error(`「${sheet}」シートを読めませんでした（スプシの共有設定が「リンクを知っている全員」になっているか確認してください）`);
}

(async () => {
  const sheets = CONFIG.SHEETS.slice();
  const texts = {};
  for (const sh of sheets) texts[sh] = await getCsv(sh);

  const items = {}, errors = [];
  for (const sh of sheets) {
    // シート名が見つからないと、スプシは先頭のシートを返してくる。先頭のシートと同じ中身なら、名前の間違いとみなす
    if (sh !== sheets[0] && texts[sh] === texts[sheets[0]]) { errors.push(`「${sh}」シートが見つかりません（シート名が config.js の SHEETS と一致しているか確認してください）`); continue; }
    items[sh] = DataFetcher.parseRows(Utils.parseCSV(texts[sh]), sh);
    console.log(`  ${sh}: ${items[sh].length}件`);
  }
  const total = Object.values(items).reduce((n, a) => n + a.length, 0);
  if (!total) errors.push("1件も読み取れませんでした");
  if (errors.length) { errors.forEach(e => console.error(`::error::${e}`)); process.exit(1); }

  const body = { sheets, items };
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, "utf8")); } catch (e) {}
  if (prev && JSON.stringify({ sheets: prev.sheets, items: prev.items }) === JSON.stringify(body)) { console.log("変更なし（colors.json はそのまま）"); return; }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  // 1人1行で書く（GitHub上で差分を見やすくするため）
  const lines = ["{", `"updatedAt": ${JSON.stringify(new Date().toISOString())},`, `"sheets": ${JSON.stringify(sheets)},`, `"items": {`];
  sheets.forEach((sh, si) => {
    lines.push(`${JSON.stringify(sh)}: [`);
    items[sh].forEach((it, i) => lines.push(JSON.stringify(it) + (i < items[sh].length - 1 ? "," : "")));
    lines.push("]" + (si < sheets.length - 1 ? "," : ""));
  });
  lines.push("}", "}", "");
  const out = lines.join("\n");
  JSON.parse(out);   // 壊れたファイルは書かない
  fs.writeFileSync(outFile, out);
  console.log(`built ${outFile}（${sheets.length}シート / ${total}件）`);
})().catch(e => { console.error(`::error::${e.message}`); process.exit(1); });
