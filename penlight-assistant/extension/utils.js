/**
 * Penlight Assistant (for MIX PENLa PRO) - utils.js
 * 汎用ユーティリティ
 * ColorUtil: HEX→OKLab変換・色差 / Utils: 待機・CSV解析・入力操作など
 */
"use strict";

const ColorUtil = {
  parseHex(str) {
    const m = String(str || "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  },
  toOklab(rgb) {
    const [r, g, b] = rgb.map(v => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    ];
  },
  hexToOklab(str) { const rgb = ColorUtil.parseHex(str); return rgb ? ColorUtil.toOklab(rgb) : null; },
  dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
  // "P2-3" → { prefix: "P", block: "P2" }
  parseCode(code) {
    const c = String(code || "").trim().toUpperCase();
    const m = c.match(/^([A-Z]+)(\d+)/);
    return m ? { prefix: m[1], block: m[1] + m[2] } : { prefix: c, block: c };
  }
};

/**
 * まとめ処理（なし / 完全一致 / 同系色）
 * targets は並び替え済みの選択リスト。戻り値は [{ n, pen, members, firstIdx, label }]
 */

const Utils = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  // 条件を満たすまで待つ（固定sleepの代わり。遅い端末でも早い端末でも最短で進む）
  waitFor: async (fn, timeout = 1500, interval = 16) => {
    const end = Date.now() + timeout;
    for (;;) {
      const v = fn();
      if (v) return v;
      if (Date.now() > end) return null;
      await new Promise(r => setTimeout(r, interval));
    }
  },
  // "4.10.0" > "4.9.1" を正しく判定する
  compareVersion: (a, b) => {
    const pa = String(a).split(".").map(n => parseInt(n, 10) || 0), pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; }
    return 0;
  },
  // 検索・抽出用の正規化（全角半角・大文字小文字・カタカナ/ひらがな・空白の違いを吸収）
  normalizeText: str => String(str || "").normalize("NFKC").toLowerCase().replace(/\s+/g, "")
    .replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60)),
  // style属性に入れる色はHEXだけ許可（読込コード経由の不正な値対策）
  safeColor: c => { const rgb = ColorUtil.parseHex(c); return rgb ? "#" + rgb.map(v => v.toString(16).padStart(2, "0")).join("") : "#fff"; },
  escapeHtml: str => String(str || "").replace(/[&<>"']/g, m => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[m])),
  simulateClick: el => {
    if (!el) return;
    const opts = { bubbles: true, cancelable: true, view: window };
    ["pointerdown", "mousedown", "pointerup", "mouseup"].forEach(e => el.dispatchEvent(new Event(e, opts)));
    el.click();
  },
  setInputValue: (input, value) => {
    if (!input) return;
    try {
      const proto = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(input, value);
    } catch (e) { input.value = value; }
    ["input", "change"].forEach(e => input.dispatchEvent(new Event(e, { bubbles: true })));
  },
  parseCSV: text => {
    const rows = []; let row = [], cur = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i + 1];
      if (c === '"') { inQuotes && next === '"' ? (cur += '"', i++) : (inQuotes = !inQuotes); }
      else if (c === ',' && !inQuotes) { row.push(cur.trim()); cur = ""; }
      else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        row.push(cur.trim()); if (row.some(x => x !== "")) rows.push(row);
        row = []; cur = "";
      } else cur += c;
    }
    if (cur !== "" || row.length > 0) { row.push(cur.trim()); if (row.some(x => x !== "")) rows.push(row); }
    return rows;
  }
};
