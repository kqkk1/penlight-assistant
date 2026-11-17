/**
 * Penlight Assistant - ブックマークレット用（自動生成ファイル）
 * ※このファイルは GitHub Actions が自動で作ります。直接編集しないでください。
 * 元ファイル: config.js, utils.js, grouper.js, data.js, site.js, styles.js, ui.js, main.js
 * version: 4.5.0 / build: 2026-11-17T17:15:41.894Z
 */
(() => {
"use strict";
// ===== config.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - config.js
 * 設定・定数
 * バージョン、スプシID、しきい値、56色名など。数値の調整はこのファイルだけで完結します。
 */

const CURRENT_VERSION = "4.5.0";

const CONFIG = {
  GITHUB_REPO: "kqkk1/penlight-assistant",
  DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
  SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
  KEYS: { FAV: "ps_fav_idols_v2", ID: "ps_custom_sheet_id", PEN: "ps_pen_mode", DUP: "ps_merge_dup", SORT: "ps_sort_mode", MERGE: "ps_merge_mode", STRENGTH: "ps_family_strength" },
  CACHE_EXPIRY: 24 * 60 * 60 * 1000,
  MAX_COLORS: 50,
  TITLE_MAX: 12, // 公式サイトのタイトル欄の文字数上限
  // 同系色まとめのしきい値（OKLab距離）。グループ内の全員がこの距離以内のときだけまとめる
  FAMILY_THRESHOLDS: {
    "361": { weak: 0.04, medium: 0.09, strong: 0.12 },
    "56":  { weak: 0.06, medium: 0.10, strong: 0.15 }
  },
  FAMILY_HINTS: {
    "361": {
      weak:   "ほぼ同じ色だけをまとめます（普段使いにおすすめ）",
      medium: "同じ系統（頭文字）内で近い色をまとめます",
      strong: "同じ系統（頭文字）内でやや離れた色までまとめます"
    },
    "56": {
      weak:   "同じ系統（頭文字）内でごく近い色だけをまとめます",
      medium: "同じ系統（頭文字）内で近い色をまとめます",
      strong: "同じ系統（頭文字）内でやや離れた色までまとめます"
    }
  },
  GROUP_ORDER: { R: 1, P: 2, V: 3, B: 4, GB: 5, G: 6, Y: 7, O: 8, W: 9, H: 10, D: 11 },
  EXCLUDE_ROLES: ["ブランド", "事務員", "ユニット"],
  SITE_RULES: {
    BTN_TITLE: "button[title]", 
    BTN_EDIT: 'button[aria-label="タイトルを編集"]', 
    INPUT_TEXT: 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])', 
    BTN_TITLE_REGEX: /^#(\d+)\s+([A-Z0-9\-]+)/i 
  }
};

// 公式「56色ブロック」の色名（ラベル表示用）
const BLOCK_NAMES = {
  R1: "レッド", R2: "エンジレッド", R3: "ルビー", R4: "ローズ",
  P1: "ピンク", P2: "ライトピンク", P3: "パッションピンク", P4: "クールピンク", P5: "ピーチ",
  P6: "フレンチローズ", P7: "サクラピンク", P8: "アッシュピンク", P9: "スミレピンク",
  V1: "バイオレット", V2: "パープル", V3: "ラベンダパープル", V4: "アメジスト", V5: "スミレ",
  B1: "ブルー", B2: "スカイブルー", B3: "ライトブルー", B4: "アイスブルー", B5: "ウォーターブルー",
  B6: "アクアブルー", B7: "ターコイズブルー", B8: "パステルブルー", B9: "ミントブルー",
  GB1: "クールグリーン", GB2: "パステルグリーン", GB3: "エメラルドグリーン",
  GB4: "ミントグリーン", GB5: "ロイドグリーン", GB6: "ターコイズグリーン",
  G1: "グリーン", G2: "イエローグリーン", G3: "ライトグリーン", G4: "アッシュグリーン",
  G5: "ペパーミントグリーン", G6: "ペールグリーン",
  Y1: "イエロー", Y2: "ライム", Y3: "アッシュイエロー", Y4: "ライトイエロー", Y5: "オパールイエロー",
  O1: "オレンジ", O2: "ライトオレンジ", O3: "パッションオレンジ", O4: "ヤマブキオレンジ",
  O5: "アッシュオレンジ", O6: "ペールオレンジ",
  D1: "ブラウン", D2: "アイボリーブラウン", D3: "ミルクティー",
  W1: "ホワイト", W2: "ウォームホワイト", H1: "ブラック"
};

// ===== utils.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - utils.js
 * 汎用ユーティリティ
 * ColorUtil: HEX→OKLab変換・色差 / Utils: 待機・CSV解析・入力操作など
 */

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

// ===== grouper.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - grouper.js
 * まとめ処理（なし／完全一致／同系色）
 * 同系色クラスタリングと登録名（12文字）の生成
 */

class ColorGrouper {
  static build(targets, store, rankCalc) {
    const mode = store.mergeMode;
    const is361 = store.penMode !== "56";
    const entries = targets.map((it, idx) => {
      const sp = store.getActiveSpec(it);
      return { it, idx, pen: sp.pen, lab: sp.pen !== "--" ? ColorUtil.hexToOklab(sp.hex) : null, code: ColorUtil.parseCode(sp.pen) };
    });

    // 1) 初期グループ: 同じペンラコード同士
    let clusters = [];
    const keyed = new Map();
    entries.forEach(e => {
      if (e.pen === "--" || mode === "none") { clusters.push([e]); return; }
      const key = e.pen;
      if (!keyed.has(key)) { const c = []; keyed.set(key, c); clusters.push(c); }
      keyed.get(key).push(e);
    });

    // 2) 同系色: 同じ頭文字の中で完全連結クラスタリング
    if (mode === "family") {
      const table = CONFIG.FAMILY_THRESHOLDS[is361 ? "361" : "56"];
      const th = table[store.familyStrength];
      if (th != null) clusters = ColorGrouper.completeLinkage(clusters, th);
    }

    // 3) 出力（並び順: 公式順は代表コード順、それ以外は先頭メンバーの位置）
    const groups = clusters.map(members => ColorGrouper.finalize(members, mode, store.favorites));
    const key = g => store.sortMode === "code" ? [rankCalc(g.pen), g.firstIdx] : [g.firstIdx, 0];
    return groups.sort((a, b) => { const [a1, a2] = key(a), [b1, b2] = key(b); return (a1 - b1) || (a2 - b2); });
  }

  static completeLinkage(clusters, th) {
    const out = [], byPrefix = new Map();
    clusters.forEach(c => {
      if (c[0].pen === "--") { out.push(c); return; }
      const p = c[0].code.prefix;
      if (!byPrefix.has(p)) byPrefix.set(p, []);
      byPrefix.get(p).push(c.slice());
    });
    byPrefix.forEach(list => {
      for (;;) {
        let best = null;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const d = ColorGrouper.linkage(list[i], list[j]);
            if (d <= th && (!best || d < best.d)) best = { i, j, d };
          }
        }
        if (!best) break;
        list[best.i] = list[best.i].concat(list[best.j]).sort((a, b) => a.idx - b.idx);
        list.splice(best.j, 1);
      }
      out.push(...list);
    });
    return out;
  }

  // 完全連結: 2グループ間で最も離れたメンバー同士の距離（色が読めない場合はまとめない）
  static linkage(a, b) {
    let max = -1;
    for (const x of a) {
      if (!x.lab) continue;
      for (const y of b) {
        if (!y.lab) continue;
        const d = ColorUtil.dist(x.lab, y.lab);
        if (d > max) max = d;
      }
    }
    return max < 0 ? Infinity : max;
  }

  static finalize(members, mode, favorites) {
    const first = members[0];
    const base = { members: members.map(m => m.it), firstIdx: first.idx };
    if (members.length === 1) return { ...base, n: first.it.n, pen: first.pen, label: "" };

    // 代表ボタン: OKLab重心に最も近いメンバーのコード
    let rep = first;
    const withLab = members.filter(m => m.lab);
    if (withLab.length) {
      const c = [0, 1, 2].map(k => withLab.reduce((s, m) => s + m.lab[k], 0) / withLab.length);
      rep = withLab.reduce((best, m) => ColorUtil.dist(m.lab, c) < ColorUtil.dist(best.lab, c) ? m : best);
    }
    // ラベル（プレビューのツールチップ用）: グループ内で最も多い56色ブロック名
    const counts = new Map();
    members.forEach(m => counts.set(m.code.block, (counts.get(m.code.block) || 0) + 1));
    let block = rep.code.block, maxCount = counts.get(block) || 0;
    counts.forEach((v, k) => { if (v > maxCount) { maxCount = v; block = k; } });
    const label = BLOCK_NAMES[block] || `${rep.code.prefix}系`;

    // 看板（キュー順で最初のお気に入り → いなければ先頭）を先頭に並べ、12文字に収める
    const lead = members.find(m => favorites.has(`${m.it.brand}:${m.it.n}`)) || first;
    const names = [lead, ...members.filter(m => m !== lead)].map(m => m.it.n);
    return { ...base, n: ColorGrouper.fitName(names), pen: rep.pen, label };
  }

  // 2〜3名: 全員が入れば "本田未央/大槻唯"、入らなければ看板＋総人数
  // 4名以上: 看板＋総人数 "天道輝ら6名"
  static fitName(names, max = CONFIG.TITLE_MAX) {
    const len = s => [...s].length;
    const cut = (s, n) => len(s) <= n ? s : [...s].slice(0, Math.max(1, n - 1)).join("") + "…";
    if (names.length === 1) return cut(names[0], max);
    if (names.length <= 3) {
      const all = names.join("/");
      if (len(all) <= max) return all;
    }
    const suffix = `ら${names.length}名`;
    return cut(names[0], max - len(suffix)) + suffix;
  }
}

// ===== data.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - data.js
 * データと状態
 * Store: 選択状態・設定の保存 / DataFetcher: スプシ取得とキャッシュ
 */

class Store {
  constructor() {
    this.cache = {}; this.selected = new Map(); this.counter = 0;
    this.showBrand = true; this.showStaff = true; this.showUnitColor = true; this.showVariant = false; 
    this.sortMode = localStorage.getItem(CONFIG.KEYS.SORT) || "select";
    this.penMode = localStorage.getItem(CONFIG.KEYS.PEN) || "361";
    // まとめモード（旧設定 ps_merge_dup からの移行込み）
    let mm = localStorage.getItem(CONFIG.KEYS.MERGE);
    if (!mm) {
      mm = localStorage.getItem(CONFIG.KEYS.DUP) === "true" ? "exact" : "none";
      localStorage.setItem(CONFIG.KEYS.MERGE, mm);
      localStorage.removeItem(CONFIG.KEYS.DUP);
    }
    this.mergeMode = ["none", "exact", "family"].includes(mm) ? mm : "none";
    const fs = localStorage.getItem(CONFIG.KEYS.STRENGTH);
    this.familyStrength = ["weak", "medium", "strong"].includes(fs) ? fs : "weak";
    this.searchQuery = ""; this.selectedUnit = "";
    this.currentBrand = CONFIG.SHEETS[0];
    this.favorites = new Set(JSON.parse(localStorage.getItem(CONFIG.KEYS.FAV) || "[]"));
  }
  // 色とペンラコードを必ず同じ組み合わせで返す（特殊色コードを使う時だけ特殊色HEXを使う）
  getActiveSpec(it) {
    const is361 = this.penMode !== "56";
    const vPen = this.showVariant ? (is361 ? it.p_v_361 : it.p_v_56) : "";
    if (vPen) return { pen: vPen, hex: it.c_v || "", color: it.c_v || it.c || "#fff" };
    return { pen: (is361 ? it.p_361 : it.p_56) || "--", hex: it.c || "", color: it.c || "#fff" };
  }
  getActiveColor(it) { return this.getActiveSpec(it).color; }
  getActivePen(it) { return this.getActiveSpec(it).pen; }
  setPref(key, val, storeKey) { this[key] = val; localStorage.setItem(CONFIG.KEYS[storeKey], val); }
  toggleFavorite(key) {
    this.favorites.has(key) ? this.favorites.delete(key) : this.favorites.add(key);
    localStorage.setItem(CONFIG.KEYS.FAV, JSON.stringify([...this.favorites]));
  }
  clearSelection() { this.selected.clear(); this.counter = 0; }
  reorderSelection(draggedKey, targetKey) {
    if (this.sortMode !== "select") return;
    const arr = [...this.selected.values()].sort((a, b) => (a.selectOrder || 0) - (b.selectOrder || 0));
    const [dIdx, tIdx] = [draggedKey, targetKey].map(k => arr.findIndex(it => `${it.brand}:${it.n}` === k));
    if (dIdx < 0 || tIdx < 0) return;
    arr.splice(tIdx, 0, arr.splice(dIdx, 1)[0]);
    arr.forEach((it, idx) => it.selectOrder = idx + 1);
  }
  // 検索中（searchQueryあり）は全ブランド横断、それ以外は表示中のブランドのみ
  getVisibleList() {
    const q = this.searchQuery;
    const list = q ? CONFIG.SHEETS.flatMap(sh => this.cache[sh] || []) : (this.cache[this.currentBrand] || []);
    const brandIdx = b => CONFIG.SHEETS.indexOf(b);
    return list.filter(it => {
      if (it.role === "brand" && !this.showBrand) return false;
      if (it.role === "staff" && !this.showStaff) return false;
      if (q) {
        if (it.role === "unit_color" && !this.showUnitColor) return false;
        return Utils.normalizeText(it.n).includes(q);
      }
      if (it.role === "unit_color" && !this.showUnitColor && it.unit !== this.selectedUnit) return false;
      if (this.selectedUnit && it.unit !== this.selectedUnit) return false;
      return true;
    }).sort((a, b) => {
      const priority = i => (this.favorites.has(`${i.brand}:${i.n}`) ? 100 : 0) + (i.role === "brand" ? 40 : (i.role === "staff" ? 30 : (i.role === "unit_color" ? 20 : 0)));
      return (q ? brandIdx(a.brand) - brandIdx(b.brand) : 0) || (priority(b) - priority(a)) || ((a.rawIndex || 0) - (b.rawIndex || 0));
    });
  }
  // "ブランド:名前" のキーから、どのブランドのデータでも探す
  findItem(key) {
    for (const sh of CONFIG.SHEETS) {
      const it = (this.cache[sh] || []).find(i => `${i.brand}:${i.n}` === key);
      if (it) return it;
    }
    return null;
  }
  getSortedSelectedList(rankCalculator) {
    return [...this.selected.values()].sort((a, b) => {
      if (this.sortMode === "code") return rankCalculator(this.getActivePen(a)) - rankCalculator(this.getActivePen(b));
      if (this.sortMode === "preset") return rankCalculator(a.sort_code || this.getActivePen(a)) - rankCalculator(b.sort_code || this.getActivePen(b));
      return (a.selectOrder || 0) - (b.selectOrder || 0);
    });
  }
  getUnits() {
    return [...new Set((this.cache[this.currentBrand] || []).map(it => it.unit).filter(u => u && !CONFIG.EXCLUDE_ROLES.includes(u)))];
  }
}

class DataFetcher {
  static async fetch(sheetName, force = false) {
    const cacheKey = `ps_cache_${sheetName}`;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch (e) {}
    DataFetcher.lastError = false;
    if (!force && cached && Date.now() - cached.timestamp < CONFIG.CACHE_EXPIRY) return cached.data;
    try {
      const targetId = localStorage.getItem(CONFIG.KEYS.ID) || CONFIG.DEFAULT_SPREADSHEET_ID;
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`);
      if (!res.ok) throw new Error("Network error");
      const rows = Utils.parseCSV(await res.text());
      if (rows.length <= 1) return [];

      const items = [], seen = new Set();
      const ext = r => r ? (r.match(/[A-Za-z]+[0-9]+(?:-[0-9]+)?/)?.[0].toUpperCase() || r.replace(/\s*△.*/, "").trim()) : "";
      const clean = c => c ? c.replace(/^"|"$/g, "").trim() : "";
      
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]; if (cols.length < 3) continue;
        let name = clean(cols[0]);
        if (sheetName !== "765AS" && name === "天海春香" && !items.length) return [];
        if (sheetName === "876" && name.includes("秋月涼")) name = "秋月涼";

        const [p361, p56, unit, sortCode] = [ext(clean(cols[2])), ext(clean(cols[3])), clean(cols[4]), ext(clean(cols[8]))];
        if (name && (p361 || p56) && !seen.has(name)) {
          // 属性(E列)で判定。E列が空のときだけ名前から推定（名前に「色」「プロ」等を含むアイドルの誤判定を防ぐ）
          const role = unit
            ? (/ブランド/.test(unit) ? "brand" : /事務員/.test(unit) ? "staff" : /ユニット|色|カラー/.test(unit) ? "unit_color" : "idol")
            : (/ブランド|プロダクション|学園/.test(name) ? "brand" : /事務員|社長/.test(name) ? "staff" : "idol");
          seen.add(name);
          items.push({ n: name, c: clean(cols[1]), p_361: p361, p_56: p56, unit, c_v: clean(cols[5]), p_v_361: ext(clean(cols[6])), p_v_56: ext(clean(cols[7])), sort_code: sortCode, brand: sheetName, role, rawIndex: i });
        }
      }
      try { localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: items })); } catch (e) {}
      return items;
    } catch (e) {
      // オフライン等で取得できない時は、期限切れでも前回のデータで動かす
      if (cached?.data?.length) return cached.data;
      DataFetcher.lastError = true;
      return [];
    }
  }
}

// ===== site.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - site.js
 * 公式サイト（penlight-supporter）との接点
 * ボタン検索・入力欄の取得など。サイトの仕様変更時はここを直します。
 */

class SiteAdapter {
  constructor() { this.btnCache = new Map(); }
  startObserving() {
    if (this.observer) return;
    this.observer = new MutationObserver(m => {
      const own = n => (n.nodeType === 1 ? n : n.parentElement)?.closest?.("#ps-m, #ps-modal-overlay, #ps-toast-container");
      if (m.some(x => x.addedNodes.length && !own(x.target))) {
        clearTimeout(this.cacheTimer);
        this.cacheTimer = setTimeout(() => this.buildCache(), 300);
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }
  buildCache() {
    this.btnCache.clear();
    document.querySelectorAll(CONFIG.SITE_RULES.BTN_TITLE).forEach(btn => {
      const m = (btn.getAttribute("title") || "").match(CONFIG.SITE_RULES.BTN_TITLE_REGEX);
      if (m) { this.btnCache.set(m[2].toUpperCase(), btn); }
    });
  }
  getButton(code) {
    if (code === "--") return null;
    if (!this.btnCache.size) this.buildCache();
    const c = (code || "").trim().toUpperCase();
    let btn = this.btnCache.get(c);
    if (!btn || !document.body.contains(btn)) { this.buildCache(); btn = this.btnCache.get(c); }
    return btn || null;
  }
  getRankCalculator() {
    return codeStr => {
      if (!codeStr || codeStr === "--") return 99999999;
      const code = codeStr.trim().toUpperCase();
      const m = code.match(/^([A-Z]+)(\d+)?(?:-(\d+))?/);
      if (!m) return 99999999;
      return (CONFIG.GROUP_ORDER[m[1]] || 90) * 1000000 + (parseInt(m[2] || "0", 10) * 1000) + parseInt(m[3] || "0", 10);
    };
  }
  getSiteInputs() {
    const container = document.getElementById("ps-m");
    return [...document.querySelectorAll(CONFIG.SITE_RULES.INPUT_TEXT)].filter(x => !container?.contains(x));
  }
  getEditButtons() {
    const container = document.getElementById("ps-m");
    return [...document.querySelectorAll(CONFIG.SITE_RULES.BTN_EDIT)].filter(x => !container?.contains(x));
  }
}

// ===== styles.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - styles.js
 * パネルの見た目（CSS）
 * 色・サイズ・スマホ用レイアウトの調整はこのファイルだけで完結します。
 */

const PS_STYLES = `
  #ps-m { position:fixed; top:18px; right:18px; width:500px; height:750px; min-width:280px; min-height:240px; max-width:95vw; max-height:94vh; background:#1a1b26; color:#c0caf5; border-radius:10px; box-shadow:0 12px 32px rgba(0,0,0,0.85); z-index:999999999; padding:12px; display:flex; flex-direction:column; font-family:-apple-system,sans-serif; font-size:12px; border:1px solid #7aa2f7; box-sizing:border-box; }
  #ps-m * { box-sizing:border-box; }
  #ps-m ::-webkit-scrollbar { width: 6px; height: 6px; }
  #ps-m ::-webkit-scrollbar-track { background: transparent; }
  #ps-m ::-webkit-scrollbar-thumb { background: #3b4261; border-radius: 3px; }
  #ps-m ::-webkit-scrollbar-thumb:hover { background: #565f89; }
  #ps-resize-handle { position:absolute; left:0; bottom:0; width:16px; height:16px; cursor:nesw-resize; z-index:10; display:flex; align-items:flex-end; padding:2px; }
  #ps-resize-handle::after { content:""; width:6px; height:6px; border-left:2px solid #565f89; border-bottom:2px solid #565f89; }
  #ps-resize-handle:hover::after { border-color:#7aa2f7; }
  #ps-fab { position:fixed; bottom:24px; right:24px; width:48px; height:48px; background:#7aa2f7; color:#15161e; border-radius:50%; box-shadow:0 8px 16px rgba(0,0,0,0.6); z-index:999999999; display:flex; justify-content:center; align-items:center; cursor:pointer; font-size:24px; user-select:none; transition:0.15s ease; border: 2px solid #1a1b26; }
  #ps-fab:hover { transform:scale(1.1); filter:brightness(1.1); }
  .ps-btn { padding:4px 8px; border:none; border-radius:4px; cursor:pointer; font-size:11px; background:#24283b; color:#a9b1d6; transition:0.12s ease; user-select:none; }
  #ps-m .ps-btn { white-space:nowrap; }
  .ps-btn:hover:not(:disabled) { filter:brightness(1.2); color:#fff; }
  .ps-btn-primary { background:#7aa2f7; color:#15161e; font-weight:bold; }
  .ps-btn-primary:hover:not(:disabled) { background:#89b4fa; color:#15161e; }
  #ps-run:disabled { background: #2f3549 !important; color: #565f89 !important; cursor: not-allowed !important; box-shadow: none !important; opacity: 1 !important; transform: none !important; }
  .ps-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ps-input { background:#1f2335; color:#fff; border:1px solid #3b4261; border-radius:4px; padding:5px 8px; font-size:11px; outline:none; }
  .ps-input:focus { border-color:#7aa2f7; }
  .ps-segment { display:flex; background:#1a1b26; border-radius:6px; border:1px solid #3b4261; overflow:hidden; height:24px; }
  .ps-segment label, .ps-segment button { flex:1; display:flex; align-items:center; justify-content:center; font-size:10px; cursor:pointer; color:#9aa5ce; transition:0.15s; border:none; border-right:1px solid #3b4261; background:transparent; margin:0; line-height:1; }
  .ps-segment label:last-child, .ps-segment button:last-child { border-right:none; }
  .ps-segment label:hover, .ps-segment button:hover { background:#24283b; color:#fff; }
  .ps-segment input[type="radio"] { display:none; }
  .ps-segment input[type="radio"]:checked + span { color:#15161e; background:#7aa2f7; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:bold; }
  .ps-segment button.active { color:#15161e; background:#7aa2f7; font-weight:bold; }
  .ps-opt-group { display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #2f3549; }
  .ps-opt-group:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
  .ps-opt-lbl { font-size:10px; color:#8a93c0; width:40px; flex-shrink:0; text-align:right; font-weight:bold; }
  .ps-tag { font-size:9px; padding:1px 4px; border-radius:3px; margin-left:4px; }
  .ps-tag-brand { color:#7aa2f7; background:#1f293d; border:1px solid #3d59a1; }
  .ps-tag-staff { color:#9ece6a; background:#1e2d24; border:1px solid #41a6b5; }
  .ps-tag-unit { color:#ff9e64; background:#2d201a; border:1px solid #8f5a34; font-weight:bold; }
  .ps-row { display:flex; align-items:center; gap:6px; padding:5px 6px; border-radius:4px; transition:0.1s; user-select:none; cursor:pointer; }
  .ps-row:hover { background:#24283b; }
  .ps-row.selected { background:#1e2538; }
  .ps-k { cursor:pointer; flex-shrink:0; }
  
  .ps-badge { display:inline-flex; align-items:center; gap:2px; background:#24283b; border:1px solid #414868; padding:2px 4px; border-radius:3px; font-size:11px; line-height:1.2; }
  .ps-badge button { padding: 0 2px !important; margin-left: 0; }
  
  .ps-star-btn { background:none; border:none; font-size:15px; line-height:1; cursor:pointer; padding:0 6px; color:#737aa2; flex-shrink:0; transition:0.12s; }
  .ps-star-btn:hover { transform:scale(1.2); color:#e0af68; }
  .ps-star-btn.active { color:#e0af68 !important; text-shadow:0 0 6px rgba(224,175,104,0.5); }
  .ps-chip { padding:2px 7px; border-radius:10px; font-size:10px; cursor:pointer; background:#1f2335; color:#9aa5ce; border:1px solid #3b4261; white-space:nowrap; user-select:none; transition:0.12s; }
  .ps-chip:hover { background:#24283b; color:#fff; }
  .ps-chip.active { background:#7aa2f722; color:#7aa2f7; border-color:#7aa2f7; font-weight:bold; }
  
  .ps-drag-item { transition: 0.1s; }
  .ps-drag-item.dragging { opacity: 0.4; transform: scale(0.95); }
  .ps-drag-item.drag-over { border: 1px dashed #7aa2f7; filter: brightness(1.3); }
  
  .ps-drag-handle { cursor: grab; padding: 2px 4px; margin-left:-2px; color: #737aa2; user-select: none; touch-action: none; transition: 0.2s; }
  .ps-drag-handle.disabled { cursor: not-allowed; opacity: 0.25; }
  
  #ps-queue-list { max-height: 160px; align-content: flex-start; }
  .ps-sw { display:inline-block; width:9px; height:9px; border-radius:2px; flex-shrink:0; }
  .ps-code { color:#7dcfff; font-size:9px; font-family:monospace; }
  .ps-group { flex-basis:100%; background:#1f2335; border:1px solid #3d59a1; border-radius:4px; }
  .ps-group-head { display:flex; align-items:center; gap:4px; padding:3px 6px; cursor:pointer; font-size:11px; user-select:none; }
  .ps-group-head:hover { background:#24283b; }
  .ps-group-name { font-weight:bold; color:#c0caf5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ps-group-meta { margin-left:auto; color:#8a93c0; font-size:10px; white-space:nowrap; }
  .ps-group-body { display:flex; flex-wrap:wrap; gap:4px; padding:4px 6px 6px; border-top:1px dashed #2f3549; }
  .ps-brand-head { font-size:10px; font-weight:bold; color:#7aa2f7; padding:6px 4px 3px; border-bottom:1px solid #2f3549; margin-bottom:2px; position:sticky; top:-4px; background:#13141c; z-index:1; }
  #ps-run.running { background:#f7768e !important; color:#15161e !important; }
  
  #ps-toast-container { position: fixed; bottom: 85px; right: 24px; z-index: 9999999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .ps-toast { background: #1f2335; color: #c0caf5; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #7aa2f7; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-size: 12px; font-weight: bold; transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s; opacity: 0; pointer-events: auto; white-space: pre-wrap; line-height: 1.4; }
  .ps-toast.show { transform: translateX(0); opacity: 1; }
  .ps-toast.error { border-left-color: #f7768e; color: #f7768e; }
  
  #ps-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 9999999999; display: none; justify-content: center; align-items: center; backdrop-filter: blur(2px); opacity: 0; transition: opacity 0.2s; font-family:-apple-system,sans-serif; }
  #ps-modal { background: #1a1b26; border: 1px solid #3b4261; border-radius: 12px; padding: 20px; width: 320px; max-width: 90vw; box-shadow: 0 10px 30px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.2s; }
  #ps-modal.show { transform: translateY(0); }
  .ps-modal-title { font-size: 15px; font-weight: bold; color: #7aa2f7; margin-bottom: 10px; }
  .ps-modal-msg { font-size: 13px; color: #a9b1d6; margin-bottom: 16px; line-height: 1.5; white-space: pre-wrap; max-height: 50vh; overflow-y: auto; }
  .ps-modal-input { width: 100%; background: #1f2335; color: #fff; border: 1px solid #3b4261; border-radius: 6px; padding: 10px; font-size: 12px; margin-bottom: 16px; outline: none; }
  .ps-modal-input:focus { border-color: #7aa2f7; }
  .ps-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .ps-modal-actions .ps-btn { padding: 8px 16px; font-size: 12px; }

  @media screen and (max-width: 768px), screen and (max-height: 500px) {
    #ps-m { 
      top:auto !important; bottom:0 !important; right:0 !important; left:0 !important; 
      width:100% !important; max-width:100% !important; margin:0 !important; 
      height:85dvh !important; max-height:calc(100dvh - 20px) !important; 
      border-radius:16px 16px 0 0; border-bottom:none; 
      padding: 14px max(10px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left)) !important; 
    }
    #ps-resize-handle { display: none !important; }
    #ps-body { overflow-y: auto !important; padding-bottom: 5px !important; }
    #ps-l { flex: 1 1 auto !important; height: auto !important; min-height: 150px !important; overflow-y: auto !important; }
    #ps-run { 
      position: sticky !important; bottom: 0 !important; z-index: 100 !important; 
      margin-top: 10px !important; padding: 14px !important; font-size: 15px !important; 
      border-radius: 8px; font-weight: bold; min-height: 48px; flex-shrink: 0 !important; 
      box-shadow: 0 -15px 20px 5px #1a1b26 !important; 
    }
    .ps-row { padding: 10px !important; margin-bottom: 4px; background: #181924; border: 1px solid #282b3d; border-radius: 6px; gap: 10px !important; }
    .ps-row.selected { background: #1f273d !important; border-color: #3d59a1 !important; }
    .ps-k { transform: scale(1.4) !important; margin: 0 4px 0 2px !important; }
    .ps-star-btn { font-size: 18px !important; padding: 4px 8px !important; }
    .ps-name-label { font-size: 13px !important; font-weight: 500; }
    .ps-btn { padding: 6px 10px; font-size: 12px; }
    .ps-input { font-size: 13px; padding: 7px; }
    .ps-segment { height: 32px; }
    .ps-segment label, .ps-segment button { font-size: 11px; }
    #ps-fab { bottom: 16px; right: 16px; width: 54px; height: 54px; font-size: 26px; }
    .ps-chip { padding: 4px 10px; font-size: 11px; }
    
    #ps-queue-list { max-height: 140px !important; gap: 4px !important; }
    .ps-group-head { padding: 8px 10px; font-size: 12px; }
    .ps-brand-head { font-size: 11px; padding: 8px 4px 4px; }
    
    #ps-sa, #ps-ca { padding: 10px 16px !important; font-size: 13px !important; font-weight: bold !important; border-radius: 6px !important; }
    #ps-sa { background: #3d59a1 !important; color: #fff !important; }
    #ps-ca { background: #2f3549 !important; color: #a9b1d6 !important; }
    
    #ps-m .ps-drag-handle { 
      padding: 8px 12px 8px 6px !important; 
      margin: -8px 0 -8px -6px !important; 
      font-size: 15px !important; 
      color: #7aa2f7 !important; 
      line-height: 1 !important;
    }
    #ps-m .ps-drag-handle.disabled { color: #565f89 !important; }
    
    #ps-toast-container { bottom: 100px; right: 16px; left: 16px; align-items: center; }
    .ps-toast { transform: translateY(120%); width: 100%; max-width: 350px; font-size: 13px; }
    .ps-toast.show { transform: translateY(0); }
  }

  @media screen and (max-height: 500px) and (orientation: landscape) {
    #ps-m { height: 100dvh !important; max-height: 100dvh !important; border-radius: 0 !important; top: 0 !important; }
`;

// ===== ui.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - ui.js
 * パネルの画面（HTML・操作・描画）
 * UIManager: パネル生成、ボタン操作、追加予定／一覧の描画、抽出処理
 */

class UIManager {
  constructor(app, store, site) {
    this.app = app; this.store = store; this.site = site;
    this.els = {}; this.isQueueOpen = false;
    this.openGroups = new Set(); // 追加予定欄で開いているまとめグループ
  }

  inject() {
    if (document.getElementById("ps-m")) return false;
    this.injectStyles(); this.buildHTML(); this.cacheElements(); this.bindEvents(); this.updateMergeUI(); this.checkUpdate();
    return true;
  }

  updateMergeUI() {
    const e = this.els, s = this.store;
    e.mergeBtns.forEach(b => b.classList.toggle("active", b.dataset.merge === s.mergeMode));
    e.strengthBtns.forEach(b => b.classList.toggle("active", b.dataset.strength === s.familyStrength));
    e.familyPanel.style.display = s.mergeMode === "family" ? "flex" : "none";
    const hints = CONFIG.FAMILY_HINTS[s.penMode === "56" ? "56" : "361"];
    e.familyHint.textContent = hints[s.familyStrength] || "";
  }

  async checkUpdate() {
    if(CONFIG.GITHUB_REPO.includes("YOUR_GITHUB_NAME")) return;
    try {
      // GitHub APIは未認証だと1時間60回までなので、結果を6時間キャッシュする
      const KEY = "ps_update_check";
      let latestVer = null;
      try { const c = JSON.parse(localStorage.getItem(KEY)); if (c && Date.now() - c.t < 6 * 60 * 60 * 1000) latestVer = c.v; } catch (e) {}
      if (!latestVer) {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_REPO}/releases/latest`);
        if (!res.ok) return;
        latestVer = (await res.json()).tag_name?.replace(/^v/, "");
        if (latestVer) localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v: latestVer }));
      }
      if (latestVer && Utils.compareVersion(latestVer, CURRENT_VERSION) > 0) {
        const b = document.createElement("div");
        b.style.cssText = "background:#ff9e64;color:#15161e;font-weight:bold;font-size:11px;padding:6px;text-align:center;cursor:pointer;border-radius:4px;margin-bottom:6px;flex-shrink:0;";
        b.textContent = `📢 新バージョン(v${latestVer})が公開されています！クリックして更新ページへ`;
        b.onclick = () => window.open(`https://github.com/${CONFIG.GITHUB_REPO}/releases/latest`, "_blank");
        this.els.body.insertBefore(b, this.els.body.firstChild);
      }
    } catch (e) {}
  }

  showToast(message, isError = false) {
    const container = document.getElementById("ps-toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = `ps-toast ${isError ? 'error' : ''}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  openModal(opts) {
    return new Promise(resolve => {
      const overlay = document.getElementById("ps-modal-overlay");
      const modal = document.getElementById("ps-modal");
      const titleEl = document.getElementById("ps-modal-title");
      const msgEl = document.getElementById("ps-modal-msg");
      const inputEl = document.getElementById("ps-modal-input");
      const btnCancel = document.getElementById("ps-modal-cancel");
      const btnOk = document.getElementById("ps-modal-ok");

      titleEl.textContent = opts.title || "お知らせ";
      msgEl.textContent = opts.message || "";
      
      if (opts.isPrompt) {
        inputEl.style.display = "block";
        inputEl.placeholder = opts.placeholder || "";
        inputEl.value = "";
      } else {
        inputEl.style.display = "none";
      }

      btnCancel.style.display = opts.hideCancel ? "none" : "block";
      btnOk.textContent = opts.okText || "OK";
      btnCancel.textContent = opts.cancelText || "キャンセル";

      const close = (val) => {
        overlay.style.opacity = "0";
        modal.classList.remove("show");
        setTimeout(() => { overlay.style.display = "none"; resolve(val); }, 200);
      };

      btnCancel.onclick = () => close(null);
      btnOk.onclick = () => close(opts.isPrompt ? inputEl.value : true);

      overlay.style.display = "flex";
      setTimeout(() => {
        overlay.style.opacity = "1";
        modal.classList.add("show");
        if (opts.isPrompt) inputEl.focus();
      }, 10);
    });
  }

  injectStyles() {
    const s = document.createElement("style");
    s.textContent = PS_STYLES;
    document.head.appendChild(s);
  }

  buildHTML() {
    const opts = CONFIG.SHEETS.map(k => `<option value="${k}">${k}</option>`).join("");
    const customId = localStorage.getItem(CONFIG.KEYS.ID) || "";
    document.body.insertAdjacentHTML("beforeend", `<div id="ps-fab" style="display:none;" title="アシストを開く">✨</div>
      <div id="ps-m">
        <div id="ps-resize-handle" title="ドラッグしてサイズ変更"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2f3549;flex-shrink:0;">
          <b style="font-size:13px;color:#7aa2f7;">Penlight Assistant (for MIX PENLa PRO) v${CURRENT_VERSION}</b>
          <div style="display:flex;gap:4px;">
            <button id="ps-toggle-opt" class="ps-btn" style="padding:2px 7px;">⚙設定</button>
            <button id="ps-minimize" class="ps-btn" style="padding:2px 8px;">ー</button>
          </div>
        </div>
        <div id="ps-body" style="display:flex;flex-direction:column;gap:6px;flex:1;overflow:hidden;">
          <div id="ps-opt-panel" style="display:none;background:#1f2335;border:1px solid #3b4261;border-radius:6px;padding:10px;flex-direction:column;flex-shrink:0;">
            <div class="ps-opt-group">
              <span class="ps-opt-lbl">カラー:</span>
              <div class="ps-segment" style="width:140px;">
                <label><input type="radio" name="ps-pen-mode" value="361" ${this.store.penMode==="361"?"checked":""}><span>361色</span></label>
                <label><input type="radio" name="ps-pen-mode" value="56" ${this.store.penMode==="56"?"checked":""}><span>56色</span></label>
              </div>
            </div>
            <div class="ps-opt-group">
              <span class="ps-opt-lbl">並び:</span>
              <div class="ps-segment" style="flex:1;">
                <button id="ps-sort-select" class="${this.store.sortMode==="select"?"active":""}">選択順</button>
                <button id="ps-sort-code" class="${this.store.sortMode==="code"?"active":""}">公式順</button>
                <button id="ps-sort-preset" class="${this.store.sortMode==="preset"?"active":""}" title="スプシのI列で指定した順">カスタム</button>
              </div>
            </div>
            <div class="ps-opt-group">
              <span class="ps-opt-lbl">表示:</span>
              <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:24px;">
                ${[['brand','ブランド','#7aa2f7'],['staff','事務員','#9ece6a'],['unitcolor','ユニット','#ff9e64'],['variant','特殊色','#e0af68',true]].map(([id,lbl,col,uncheck]) => `<label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#a9b1d6;"><input type="checkbox" id="ps-toggle-${id}" ${uncheck?"":"checked"} style="accent-color:${col};">${lbl}</label>`).join("")}
              </div>
            </div>
            <div class="ps-opt-group" style="border-bottom:none;align-items:flex-start;">
              <span class="ps-opt-lbl" style="line-height:24px;">まとめ:</span>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0;">
                <div class="ps-segment">
                  <button data-merge="none" title="まとめずに1人1色で登録します">なし</button>
                  <button data-merge="exact" title="同じペンラコードを連名にして1つにまとめます">完全一致</button>
                  <button data-merge="family" title="近い色をまとめて登録数を減らします">同系色</button>
                </div>
                <div id="ps-family-panel" style="display:none;flex-direction:column;gap:4px;">
                  <div class="ps-segment">
                    <button data-strength="weak">弱</button>
                    <button data-strength="medium">中</button>
                    <button data-strength="strong">強</button>
                  </div>
                  <div id="ps-family-hint" style="font-size:10px;color:#8a93c0;line-height:1.4;"></div>
                </div>
              </div>
            </div>
            <div style="margin-top:2px;">
              <div id="ps-opt-adv-toggle" style="cursor:pointer;font-size:10px;color:#8a93c0;text-align:center;padding:4px;background:#1a1b26;border-radius:4px;">▾ 詳細設定を開く (スプシID・抽出・読込/保存)</div>
              <div id="ps-opt-adv-panel" style="display:none;flex-direction:column;gap:4px;margin-top:6px;padding-top:6px;border-top:1px dashed #2f3549;">
                <span style="font-size:10px;color:#9aa5ce;">カスタムスプレッドシートID:</span>
                <div style="display:flex;gap:4px;"><input type="text" id="ps-sheet-id" class="ps-input" style="flex:1;" placeholder="空欄でデフォルト" value="${Utils.escapeHtml(customId)}"><button id="ps-sheet-save" class="ps-btn ps-btn-primary">適用</button></div>
                <span style="font-size:10px;color:#9aa5ce;margin-top:6px;">リスト操作:</span>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  <button id="ps-extract" class="ps-btn" style="background:#3d59a1;color:#fff;" title="出演者のテキストからまとめて追加">📋抽出</button>
                  <button id="ps-import" class="ps-btn" title="保存コードからリストを復元">読込</button>
                  <button id="ps-export" class="ps-btn" title="リストをコードにしてコピー">保存</button>
                </div>
              </div>
            </div>
          </div>
          <div style="background:#13141c;border:1px solid #2f3549;border-radius:6px;padding:5px 8px;flex-shrink:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span id="ps-queue-toggle" style="font-size:11px;color:#7dcfff;cursor:pointer;">追加予定: <b id="ps-queue-count">0</b>名<span id="ps-queue-merged" style="margin-left:4px;font-size:10px;"></span> <span id="ps-queue-arrow">▾</span></span>
              <button id="ps-clear-queue" style="background:none;border:none;color:#f7768e;cursor:pointer;font-size:10px;margin-left:4px;">全クリア</button>
            </div>
            <div id="ps-queue-list" style="display:none;flex-wrap:wrap;gap:4px;overflow-y:auto;margin-top:5px;padding-top:5px;border-top:1px dashed #2f3549;"></div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            <select id="ps-b" class="ps-input" style="flex:1;min-width:0;">${opts}<option value="__search" hidden>🔍 全ブランドから検索中</option></select>
            <input type="search" id="ps-search" class="ps-input" placeholder="全ブランドから検索" style="width:130px;">
            <button id="ps-reload" class="ps-btn" title="再取得・キャッシュクリア" style="padding:4px 8px;">↻</button>
          </div>
          <div id="ps-unit-chips" style="display:none;flex-wrap:nowrap;overflow-x:auto;gap:4px;padding:2px 0;flex-shrink:0;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 2px;flex-shrink:0;">
            <span style="font-size:10px;color:#8a93c0;">選択操作:</span>
            <div style="display:flex;gap:4px;"><button id="ps-sa" class="ps-btn">全選択</button><button id="ps-ca" class="ps-btn">全解除</button></div>
          </div>
          <div id="ps-l" style="flex:1;overflow-y:auto;background:#13141c;padding:4px;border-radius:4px;min-height:75px;">読込中...</div>
          <button id="ps-run" class="ps-btn ps-btn-primary" style="width:100%;">リストに追加する</button>
        </div>
      </div>
      
      <!-- モーダル・通知エリア -->
      <div id="ps-toast-container"></div>
      <div id="ps-modal-overlay">
        <div id="ps-modal">
          <div class="ps-modal-title" id="ps-modal-title"></div>
          <div class="ps-modal-msg" id="ps-modal-msg"></div>
          <textarea class="ps-modal-input" id="ps-modal-input" rows="3" style="resize:none;"></textarea>
          <div class="ps-modal-actions">
            <button class="ps-btn" id="ps-modal-cancel">キャンセル</button>
            <button class="ps-btn ps-btn-primary" id="ps-modal-ok">OK</button>
          </div>
        </div>
      </div>
    `);
  }

  cacheElements() {
    const get = id => document.getElementById(id);
    this.els = {
      m: get("ps-m"), body: get("ps-body"), resize: get("ps-resize-handle"), fab: get("ps-fab"), min: get("ps-minimize"),
      brand: get("ps-b"), list: get("ps-l"), search: get("ps-search"), run: get("ps-run"), reload: get("ps-reload"),
      qList: get("ps-queue-list"), qCount: get("ps-queue-count"), clear: get("ps-clear-queue"),
      ext: get("ps-extract"), imp: get("ps-import"), exp: get("ps-export"),
      toggles: { brand: get("ps-toggle-brand"), staff: get("ps-toggle-staff"), uc: get("ps-toggle-unitcolor"), var: get("ps-toggle-variant") },
      radios: document.querySelectorAll('input[name="ps-pen-mode"]'),
      mergeBtns: document.querySelectorAll("#ps-m [data-merge]"), strengthBtns: document.querySelectorAll("#ps-m [data-strength]"),
      familyPanel: get("ps-family-panel"), familyHint: get("ps-family-hint"), qMerged: get("ps-queue-merged"),
      sort: { select: get("ps-sort-select"), code: get("ps-sort-code"), preset: get("ps-sort-preset") },
      optBtn: get("ps-toggle-opt"), optPanel: get("ps-opt-panel"), advBtn: get("ps-opt-adv-toggle"), advPanel: get("ps-opt-adv-panel"),
      sid: get("ps-sheet-id"), save: get("ps-sheet-save"), qTog: get("ps-queue-toggle"), qArr: get("ps-queue-arrow"), chips: get("ps-unit-chips"),
      sa: get("ps-sa"), ca: get("ps-ca")
    };
  }

  bindEvents() {
    const e = this.els, s = this.store;
    
    e.resize.onmousedown = ev => {
      ev.preventDefault();
      const startX = ev.clientX, startY = ev.clientY, w = e.m.offsetWidth, h = e.m.offsetHeight;
      const move = e2 => { e.m.style.width = `${Math.max(280, Math.min(window.innerWidth * 0.9, w + (startX - e2.clientX)))}px`; e.m.style.height = `${Math.max(240, Math.min(window.innerHeight * 0.94, h + (e2.clientY - startY)))}px`; };
      const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
      window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    };
    
    e.min.onclick = () => { this.savedHeight = e.m.style.height; e.m.style.display = "none"; e.fab.style.display = "flex"; };
    e.fab.onclick = () => { e.fab.style.display = "none"; e.m.style.display = "flex"; e.m.style.height = this.savedHeight || "750px"; };
    
    e.optBtn.onclick = () => { const show = e.optPanel.style.display === "flex"; e.optPanel.style.display = show ? "none" : "flex"; e.optBtn.style.color = show ? "#a9b1d6" : "#7aa2f7"; };
    e.advBtn.onclick = () => { const show = e.advPanel.style.display === "flex"; e.advPanel.style.display = show ? "none" : "flex"; e.advBtn.textContent = show ? "▾ 詳細設定を開く (スプシID・抽出・読込/保存)" : "▴ 詳細設定を閉じる"; };
    e.qTog.onclick = () => { this.isQueueOpen = !this.isQueueOpen; e.qList.style.display = this.isQueueOpen ? "flex" : "none"; e.qArr.textContent = this.isQueueOpen ? "▴" : "▾"; };
    
    Object.entries(e.sort).forEach(([mode, btn]) => {
      btn.onclick = () => { s.setPref("sortMode", mode, "SORT"); Object.values(e.sort).forEach(b => b.classList.remove("active")); btn.classList.add("active"); this.renderQueue(); };
    });
    
    e.toggles.brand.onchange = ev => { s.showBrand = ev.target.checked; this.renderList(); };
    e.toggles.staff.onchange = ev => { s.showStaff = ev.target.checked; this.renderList(); };
    e.toggles.uc.onchange = ev => { s.showUnitColor = ev.target.checked; this.renderList(); };
    e.toggles.var.onchange = ev => { s.showVariant = ev.target.checked; this.renderQueue(); this.renderList(); };
    e.mergeBtns.forEach(btn => btn.onclick = () => { s.setPref("mergeMode", btn.dataset.merge, "MERGE"); this.updateMergeUI(); this.renderQueue(); });
    e.strengthBtns.forEach(btn => btn.onclick = () => { s.setPref("familyStrength", btn.dataset.strength, "STRENGTH"); this.updateMergeUI(); this.renderQueue(); });
    e.radios.forEach(r => r.onchange = ev => { if (ev.target.checked) { s.setPref("penMode", ev.target.value, "PEN"); this.updateMergeUI(); this.renderQueue(); this.renderList(); } });
    
    e.save.onclick = () => {
      const val = e.sid.value.trim();
      val ? localStorage.setItem(CONFIG.KEYS.ID, val) : localStorage.removeItem(CONFIG.KEYS.ID);
      this.showToast(val ? "カスタムIDを適用しました。\nデータを再取得します。" : "デフォルトに戻しました。\nデータを再取得します。");
      CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`));
      s.cache = {}; this.app.loadData(true);
    };
    
    e.search.oninput = ev => this.setSearch(ev.target.value);
    e.search.onkeydown = ev => { if (ev.key === "Escape") this.setSearch(""); };
    e.brand.onchange = () => {
      const v = e.brand.value;
      if (v === "__search") return;
      // 検索中にブランドを選んだら、検索をやめてそのブランドの一覧へ
      s.currentBrand = v; s.selectedUnit = ""; s.searchQuery = ""; e.search.value = "";
      this.app.loadData(false);
    };
    
    e.reload.onclick = () => { CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`)); s.cache = {}; this.app.loadData(true); };
    e.sa.onclick = () => { s.getVisibleList().forEach(it => { const key = `${it.brand}:${it.n}`; if (!s.selected.has(key)) s.selected.set(key, { ...it, selectOrder: ++s.counter }); }); this.renderQueue(); this.renderList(); };
    e.ca.onclick = () => { (s.searchQuery ? s.getVisibleList() : (s.cache[s.currentBrand] || [])).forEach(it => s.selected.delete(`${it.brand}:${it.n}`)); this.renderQueue(); this.renderList(); };
    e.clear.onclick = () => { s.clearSelection(); this.renderQueue(); this.renderList(); };

    e.list.onclick = ev => {
      const fav = ev.target.closest(".ps-star-btn");
      if (fav) { ev.preventDefault(); ev.stopPropagation(); s.toggleFavorite(fav.getAttribute("data-fav")); this.renderList(); return; }
      if (ev.target.classList.contains("ps-k")) return;
      const row = ev.target.closest(".ps-row");
      if (row) { const chk = row.querySelector(".ps-k"); if (chk && !chk.disabled) { chk.checked = !chk.checked; chk.dispatchEvent(new Event("change", { bubbles: true })); } }
    };

    e.list.onchange = ev => {
      if (ev.target.classList.contains("ps-k")) {
        const key = ev.target.getAttribute("data-key"), it = s.findItem(key);
        if (it) { ev.target.checked ? s.selected.set(key, { ...it, selectOrder: ++s.counter }) : s.selected.delete(key); }
        this.renderQueue(); ev.target.closest(".ps-row")?.classList.toggle("selected", ev.target.checked);
      }
    };

    let dragKey = null;
    e.qList.addEventListener("dragstart", ev => { if (s.sortMode !== "select") return; const it = ev.target.closest(".ps-drag-item"); if (it) { dragKey = it.getAttribute("data-key"); ev.dataTransfer.effectAllowed = "move"; setTimeout(() => it.classList.add("dragging"), 0); } });
    e.qList.addEventListener("dragover", ev => { if (s.sortMode === "select" && dragKey) { ev.preventDefault(); ev.dataTransfer.dropEffect = "move"; const it = ev.target.closest(".ps-drag-item"); if (it && it.getAttribute("data-key") !== dragKey) it.classList.add("drag-over"); } });
    e.qList.addEventListener("dragleave", ev => ev.target.closest(".ps-drag-item")?.classList.remove("drag-over"));
    e.qList.addEventListener("drop", ev => { if (s.sortMode === "select" && dragKey) { ev.preventDefault(); const it = ev.target.closest(".ps-drag-item"); if (it) { it.classList.remove("drag-over"); const tKey = it.getAttribute("data-key"); if (dragKey !== tKey) { s.reorderSelection(dragKey, tKey); this.renderQueue(); } } } });
    e.qList.addEventListener("dragend", ev => { ev.target.closest(".ps-drag-item")?.classList.remove("dragging"); dragKey = null; e.qList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over")); });
    e.qList.onclick = ev => {
      const delKey = ev.target.closest("button")?.getAttribute("data-del");
      if (delKey) { s.selected.delete(delKey); this.renderQueue(); this.renderList(); return; }
      const gKey = ev.target.closest("[data-gtoggle]")?.getAttribute("data-gtoggle");
      if (gKey) { this.openGroups.has(gKey) ? this.openGroups.delete(gKey) : this.openGroups.add(gKey); this.renderQueue(); }
    };

    let touchDragKey = null, touchDragItem = null, lastDragOver = null;
    e.qList.addEventListener("touchstart", ev => {
      if (s.sortMode !== "select") return;
      const handle = ev.target.closest(".ps-drag-handle");
      if (handle) {
        touchDragItem = handle.closest(".ps-drag-item");
        if (touchDragItem) {
          touchDragKey = touchDragItem.getAttribute("data-key");
          setTimeout(() => touchDragItem.classList.add("dragging"), 0);
        }
      }
    }, { passive: false });

    e.qList.addEventListener("touchmove", ev => {
      if (!touchDragKey) return;
      ev.preventDefault(); 
      const touch = ev.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const hoverItem = el ? el.closest(".ps-drag-item") : null;

      if (lastDragOver && lastDragOver !== hoverItem) {
        lastDragOver.classList.remove("drag-over");
      }
      if (hoverItem && hoverItem !== touchDragItem) {
        hoverItem.classList.add("drag-over");
        lastDragOver = hoverItem;
      } else {
        lastDragOver = null;
      }
    }, { passive: false });

    e.qList.addEventListener("touchend", ev => {
      if (!touchDragKey) return;
      if (lastDragOver) {
        lastDragOver.classList.remove("drag-over");
        const tKey = lastDragOver.getAttribute("data-key");
        if (touchDragKey !== tKey) {
          s.reorderSelection(touchDragKey, tKey);
          this.renderQueue();
        }
      }
      if (touchDragItem) touchDragItem.classList.remove("dragging");
      touchDragKey = touchDragItem = lastDragOver = null;
    });

    e.ext.onclick = async () => {
      const input = await this.openModal({ title: "【自動抽出機能】", message: "公式サイト等のテキストを貼り付けてください。", isPrompt: true, placeholder: "テキストを入力..." });
      if (input) await this.extractFromText(input);
    };

    e.exp.onclick = () => {
      const data = s.getSortedSelectedList(this.site.getRankCalculator());
      if (!data.length) return this.showToast("エクスポートするリストがありません。", true);
      navigator.clipboard.writeText(btoa(encodeURIComponent(JSON.stringify({ showVariant: s.showVariant, penMode: s.penMode, items: data }))))
        .then(() => this.showToast("リストのコードをコピーしました！")).catch(() => this.showToast("コピーに失敗しました。", true));
    };

    e.imp.onclick = async () => {
      const str = await this.openModal({ title: "【リスト読込】", message: "エクスポートしたコードを貼り付けてください:", isPrompt: true });
      if (!str) return;
      try {
        const dec = JSON.parse(decodeURIComponent(atob(str)));
        const items = Array.isArray(dec) ? dec : (dec?.items || []);
        if (items.length) {
          if (!Array.isArray(dec)) { s.showVariant = !!dec.showVariant; e.toggles.var.checked = s.showVariant; s.setPref("penMode", dec.penMode || "361", "PEN"); e.radios.forEach(r => r.checked = r.value === s.penMode); }
          s.clearSelection();
          items.forEach(it => { if (it?.n && it?.brand) { s.counter = Math.max(s.counter, it.selectOrder || 0); s.selected.set(`${it.brand}:${it.n}`, it); } });
          this.renderQueue(); this.renderList(); 
          this.showToast("リストを読み込みました！");
        } else this.showToast("有効なデータが見つかりません。", true);
      } catch (err) { this.showToast("無効なコードです。", true); }
    };

    e.run.onclick = () => {
      if (this.app.running) { this.app.abortRequested = true; e.run.textContent = "中断しています..."; return; }
      this.app.executeAutoAdd();
    };
  }

  // 検索欄の入力。文字があれば全ブランド横断、空なら元のブランドに戻る
  setSearch(raw) {
    const e = this.els, s = this.store;
    if (e.search.value !== raw) e.search.value = raw;
    s.searchQuery = Utils.normalizeText(raw.trim());
    const searching = !!s.searchQuery;
    e.brand.value = searching ? "__search" : s.currentBrand;
    if (searching) { e.chips.style.display = "none"; } else { this.renderUnitChips(); }
    this.renderList();
    if (searching) this.app.ensureAllLoaded().then(() => { if (s.searchQuery) this.renderList(); });
  }

  // テキストからアイドル名を探して追加予定に入れる（長い名前から先に照合し、短い名前の誤ヒットを防ぐ）
  async extractFromText(input) {
    const e = this.els, s = this.store;
    let text = Utils.normalizeText(input);
    if (!text) return 0;
    // 「、」「,」改行などで区切られた出演者リストなら、名前ごとに照合結果を確認する
    const tokens = String(input).split(/[、,，\n\r\t／\/|｜]+/).map(raw => ({ raw: raw.trim(), key: Utils.normalizeText(raw) })).filter(t => t.key.length > 1);
    const isList = tokens.length >= 2 && tokens.every(t => t.key.length <= 20);
    const orig = e.ext.textContent; e.ext.textContent = "⏳抽出中..."; e.ext.disabled = true; let added = 0;
    try {
      await this.app.ensureAllLoaded();
      const addedNames = new Set([...s.selected.values()].map(it => it.n));
      const candidates = CONFIG.SHEETS.flatMap(sheet => (s.cache[sheet] || []).filter(it => it.role === "idol"))
        .map(it => ({ it, key: Utils.normalizeText(it.n) }))
        .filter(c => c.key.length > 1)
        .sort((a, b) => b.key.length - a.key.length);
      candidates.forEach(({ it, key }) => {
        if (!text.includes(key)) return;
        text = text.split(key).join("\u0000"); // 照合済みの部分は消して、名前の一部への誤ヒットを防ぐ
        if (addedNames.has(it.n)) return;
        s.selected.set(`${it.brand}:${it.n}`, { ...it, selectOrder: ++s.counter });
        addedNames.add(it.n); added++;
      });

      // 抽出で1名以上追加されたら、「追加予定」のリストだけ自動で開いて確認しやすくする（ブランドタブは切り替えない）
      if (added > 0 && !this.isQueueOpen) {
        this.isQueueOpen = true;
        e.qList.style.display = "flex";
        e.qArr.textContent = "▴";
      }
      this.renderQueue(); this.renderList();
      const unmatched = isList ? tokens.filter(t => !candidates.some(c => t.key.includes(c.key))).map(t => t.raw) : [];
      if (unmatched.length) {
        await this.openModal({
          title: "見つからなかった名前があります",
          message: `${added}名を追加しました。\n\n以下の名前はスプレッドシートに見つかりませんでした（未登録・表記ゆれの可能性があります）：\n${unmatched.map(n => `・${n}`).join("\n")}`,
          hideCancel: true
        });
      } else if (added > 0) this.showToast(`🎉 抽出完了！\n合計 ${added} 名を追加しました。`);
      else this.showToast("一致するアイドルが見つかりませんでした。", true);
    } catch (err) {
      this.showToast("抽出処理中にエラーが発生しました。", true);
    } finally { e.ext.textContent = orig; e.ext.disabled = false; }
    return added;
  }

  renderQueue() {
    const e = this.els, s = this.store;
    e.qCount.textContent = s.selected.size;
    if (!s.selected.size) { e.qMerged.textContent = ""; e.qList.innerHTML = `<span style="color:#8a93c0;font-size:10px;">未選択</span>`; return; }
    const rank = this.site.getRankCalculator();
    const sorted = s.getSortedSelectedList(rank);
    const groups = ColorGrouper.build(sorted, s, rank);

    // 色数と上限を常に表示（上限-5を超えたら黄、上限超えで赤）
    const colorCount = groups.filter(g => g.pen !== "--").length, max = CONFIG.MAX_COLORS;
    e.qMerged.textContent = `→ ${colorCount}色 / ${max}`;
    e.qMerged.style.color = colorCount > max ? "#f7768e" : colorCount > max - 5 ? "#e0af68" : "#9ece6a";

    const merged = s.mergeMode !== "none";
    const canDrag = s.sortMode === "select" && !merged;
    const badge = (it, withHandle) => {
      const aCol = Utils.safeColor(s.getActiveColor(it)), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
      const key = Utils.escapeHtml(`${it.brand}:${it.n}`), n = Utils.escapeHtml(it.n);
      const handle = withHandle ? `<span class="ps-drag-handle ${canDrag ? '' : 'disabled'}" title="${canDrag ? 'ドラッグして移動' : '自動ソート中は手動移動できません'}">⠿</span>` : "";
      return `<span class="ps-badge ps-drag-item" data-key="${key}" ${canDrag ? 'draggable="true"' : ''} style="${isSkip ? 'opacity:0.6;' : ''}">${handle}<span class="ps-sw" style="width:7px;height:7px;background:${aCol};"></span><span style="${isSkip ? 'text-decoration:line-through;' : ''}">${n}</span><span class="ps-code">(${aPen})</span><button data-del="${key}" style="background:none;border:none;color:#f7768e;cursor:pointer;padding:0 2px;">✕</button></span>`;
    };

    // まとめなし: 1人ずつ（並べ替え可）
    if (!merged) { e.qList.innerHTML = sorted.map(it => badge(it, true)).join(""); return; }

    // まとめあり: 登録される単位で表示。複数人のグループはタップで中身を開く（スマホでも確認できる）
    e.qList.innerHTML = groups.map(g => {
      if (g.members.length === 1) return badge(g.members[0], false);
      const rawKey = `${g.members[0].brand}:${g.members[0].n}`, open = this.openGroups.has(rawKey);
      const repItem = g.members.find(m => s.getActivePen(m) === g.pen) || g.members[0];
      return `<div class="ps-group ${open ? 'open' : ''}">
        <div class="ps-group-head" data-gtoggle="${Utils.escapeHtml(rawKey)}">
          <span class="ps-sw" style="background:${Utils.safeColor(s.getActiveColor(repItem))};"></span>
          <span class="ps-group-name">${Utils.escapeHtml(g.n)}</span><span class="ps-code">(${Utils.escapeHtml(g.pen)})</span>
          <span class="ps-group-meta">${g.label ? Utils.escapeHtml(g.label) + "・" : ""}${g.members.length}名 ${open ? "▴" : "▾"}</span>
        </div>
        ${open ? `<div class="ps-group-body">${g.members.map(m => badge(m, false)).join("")}</div>` : ""}
      </div>`;
    }).join("");
  }

  renderUnitChips() {
    if (this.store.searchQuery) { this.els.chips.style.display = "none"; return; } // 検索中はブランド別のユニットは出さない
    const units = this.store.getUnits();
    if (!units.length) { this.els.chips.style.display = "none"; this.els.chips.innerHTML = ""; this.store.selectedUnit = ""; return; }
    this.els.chips.style.display = "flex";
    this.els.chips.innerHTML = `<span class="ps-chip ${!this.store.selectedUnit ? 'active' : ''}" data-unit="">全て</span>` + units.map(u => {
      const eU = Utils.escapeHtml(u); return `<span class="ps-chip ${this.store.selectedUnit === u ? 'active' : ''}" data-unit="${eU}">${eU}</span>`;
    }).join("");
    this.els.chips.querySelectorAll(".ps-chip").forEach(c => c.onclick = () => { this.store.selectedUnit = c.getAttribute("data-unit"); this.renderUnitChips(); this.renderList(); });
  }

  renderList() {
    const list = this.store.getVisibleList(), s = this.store;
    if (!list.length) { this.els.list.innerHTML = `<span style="color:#f7768e;display:block;padding:6px 0;">一致する項目がありません</span>`; return; }
    const searching = !!s.searchQuery;
    let lastBrand = null;
    this.els.list.innerHTML = list.map(it => {
      let head = "";
      if (searching && it.brand !== lastBrand) { lastBrand = it.brand; head = `<div class="ps-brand-head">${Utils.escapeHtml(it.brand)}</div>`; }
      const aCol = Utils.safeColor(s.getActiveColor(it)), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
      const key = `${it.brand}:${it.n}`, escKey = Utils.escapeHtml(key), n = Utils.escapeHtml(it.n);
      const isChk = s.selected.has(key), isFav = s.favorites.has(key);
      const tag = it.role === "brand" ? `<span class="ps-tag ps-tag-brand">ブランド</span>` : it.role === "staff" ? `<span class="ps-tag ps-tag-staff">事務員</span>` : it.role === "unit_color" ? `<span class="ps-tag ps-tag-unit">ユニット</span>` : "";
      const uTag = it.unit && !CONFIG.EXCLUDE_ROLES.includes(it.unit) && it.role === "idol" && !it.n.includes(it.unit) ? `<span style="font-size:9px;color:#8a93c0;margin-left:4px;">[${Utils.escapeHtml(it.unit)}]</span>` : "";
      const star = `<button type="button" class="ps-star-btn ${isFav ? 'active' : ''}" data-fav="${escKey}" title="推しピン留め">${isFav ? '★' : '☆'}</button>`;
      return head + `<div class="ps-row ${isChk ? 'selected' : ''}" data-rowkey="${escKey}" style="${isSkip ? 'opacity:0.6;' : ''}"><input type="checkbox" data-key="${escKey}" class="ps-k" ${isChk ? "checked" : ""} ${isSkip ? 'disabled title="未設定"' : ''}>${star}<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${aCol};border:1px solid rgba(255,255,255,0.4);flex-shrink:0;"></span><span class="ps-name-label" data-key="${escKey}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; ${isSkip ? 'text-decoration:line-through;opacity:0.6;' : ''}">${n}${tag}${uTag}</span><span style="color:${isSkip ? '#f7768e' : '#7dcfff'};font-family:monospace;font-weight:bold;font-size:12px;flex-shrink:0;margin-left:4px;">${aPen}</span></div>`;
    }).join("");
  }
}

// ===== main.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - main.js
 * 起動と全体の流れ
 * App: 初期化、データ読込、URLパラメータ連携、公式サイトへの自動登録
 */

class App {
  constructor() {
    this.store = new Store(); this.siteAdapter = new SiteAdapter(); this.ui = new UIManager(this, this.store, this.siteAdapter);
    this.running = false; this.abortRequested = false;
  }
  async init() {
    if (!window.location.href.includes("penlight-supporter.onrender.com")) return;
    if (this.ui.inject()) {
      this.siteAdapter.startObserving();
      this.ui.renderQueue();
      await this.loadData();
      // ★ 起動時にURLパラメータ（?auto_cast=... や &special=1）があれば自動実行
      await this.checkUrlAutoExtract();
    }
  }
  async loadData(force = false) {
    if (!this.store.cache[this.store.currentBrand] || force) {
      this.ui.els.list.innerHTML = `<span style="color:#aaa;">${force ? '再取得中...' : '読込中...'}</span>`;
      this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, force);
    }
    this.ui.renderUnitChips(); this.ui.renderList();
    if (DataFetcher.lastError && !this.store.cache[this.store.currentBrand]?.length) {
      this.store.cache[this.store.currentBrand] = null; // 次回また取得を試みる
      this.ui.els.list.innerHTML = `<span style="color:#f7768e;display:block;padding:6px 0;">データを取得できませんでした。通信状況を確認して ↻ で再試行してください。</span>`;
    }
  }
  // 全ブランドのデータを揃える（横断検索・抽出用。同時に呼ばれても取得は1回）
  ensureAllLoaded() {
    if (!this._allLoading) {
      this._allLoading = Promise.all(CONFIG.SHEETS.map(async sh => {
        if (!this.store.cache[sh]?.length) this.store.cache[sh] = await DataFetcher.fetch(sh, false);
      })).finally(() => { this._allLoading = null; });
    }
    return this._allLoading;
  }
  // ★ NotionからのURLパラメータ（?auto_cast=... および &special=1）を受け取り、特殊色トグルON＆自動抽出を実行する処理
  async checkUrlAutoExtract() {
    try {
      const urlObj = new URL(window.location.href);
      const castParam = urlObj.searchParams.get("auto_cast") || urlObj.searchParams.get("cast");
      const isSpecial = urlObj.searchParams.get("special") === "1" || urlObj.searchParams.get("special") === "true";

      if (!castParam && !isSpecial) return;

      // リロード時に二重実行されないよう、アドレスバーからパラメータを消去
      urlObj.searchParams.delete("auto_cast");
      urlObj.searchParams.delete("cast");
      urlObj.searchParams.delete("special");
      window.history.replaceState({}, document.title, urlObj.pathname + urlObj.search + urlObj.hash);

      // 1. &special=1 が指定されている場合、「特殊色」トグル（ps-toggle-variant）と内部状態（showVariant）をONにする
      if (isSpecial) {
        this.store.showVariant = true;
        if (this.ui.els.toggles?.var) {
          this.ui.els.toggles.var.checked = true;
        }
        this.ui.renderQueue();
        this.ui.renderList();
      }

      if (!castParam) return;

      // 2. 抽出処理を直接実行（モーダルを経由しないので待ち時間に左右されない）
      await this.ui.extractFromText(castParam);
    } catch (e) {
      console.error("Penlight Assistant: Auto extract failed", e);
    }
  }
  async executeAutoAdd() {
    const rank = this.siteAdapter.getRankCalculator();
    const targets = this.store.getSortedSelectedList(rank);
    if (!targets.length) return this.ui.showToast("メンバーを選択してください", true);
    this.ui.els.run.disabled = true; this.siteAdapter.buildCache();

    const pTargets = ColorGrouper.build(targets, this.store, rank);
    const validCount = pTargets.filter(g => g.pen !== "--").length;
    if (validCount > CONFIG.MAX_COLORS) {
      const s = this.store;
      const tip = s.mergeMode === "none" ? "設定の「まとめ」を「完全一致」または「同系色」にすると、上限に収まる場合があります。"
        : s.mergeMode === "exact" ? "設定の「まとめ」を「同系色」にすると、近い色が1色にまとまり上限に収まる場合があります。"
        : s.familyStrength !== "strong" ? "同系色の強さを上げると、さらにまとまり上限に収まる場合があります。"
        : "選択メンバーを減らしてください。";
      await this.ui.openModal({
        title: "⚠️ 登録上限オーバー",
        message: `一度に登録できるのは「${CONFIG.MAX_COLORS}色」までです。\n（現在: ${validCount}色 追加予定）\n\n※${tip}`,
        hideCancel: true
      });
      this.ui.els.run.disabled = false;
      return;
    }

    // 登録前の確認（まとめると情報が減るので、実際に登録される内容を見せる）
    const lines = pTargets.map(g => g.pen === "--" ? `・${g.n}（コード未設定のためスキップ）` : `・${g.n}（${g.pen}${g.members.length > 1 ? `／${g.members.length}名` : ""}）`);
    const ok = await this.ui.openModal({
      title: "登録内容の確認",
      message: `以下の${validCount}色を公式サイトに追加します。\n\n${lines.join("\n")}`,
      okText: "登録する"
    });
    if (!ok) { this.ui.els.run.disabled = false; return; }

    let count = 0, aborted = false;
    const skipped = [], nameFailed = [];
    const site = this.siteAdapter, run = this.ui.els.run;
    this.running = true; this.abortRequested = false;
    run.disabled = false; run.classList.add("running"); // 実行中は「中断」ボタンとして押せる
    try {
      for (let i = 0; i < pTargets.length; i++) {
        if (this.abortRequested) { aborted = true; break; }
        const it = pTargets[i], activePen = it.pen;
        run.textContent = `■ 中断 [${i + 1}/${pTargets.length}] ${it.n.substring(0, 12)}${it.n.length > 12 ? "..." : ""}`;
        if (activePen === "--") { skipped.push(`・${it.n} (コード未設定)`); continue; }

        const btn = site.getButton(activePen);
        if (!btn) { skipped.push(`・${it.n} (コード: ${activePen})`); continue; }

        btn.scrollIntoView({ block: "nearest", inline: "nearest" });
        const before = site.getEditButtons();
        Utils.simulateClick(btn);
        // 行が追加される（編集ボタンが増える）まで待つ。増えなければ既存の行を上書きしないよう名前入力はしない
        const newBtn = await Utils.waitFor(() => {
          const after = site.getEditButtons();
          return after.length > before.length ? (after.find(el => !before.includes(el)) || after[after.length - 1]) : null;
        });
        count++;
        if (!newBtn) { nameFailed.push(`・${it.n}`); continue; }

        const inBefore = site.getSiteInputs();
        Utils.simulateClick(newBtn);
        const targetIn = await Utils.waitFor(() => {
          const inAfter = site.getSiteInputs();
          const fresh = inAfter.find(el => !inBefore.includes(el));
          if (fresh) return fresh;
          const act = document.activeElement;
          return act && inAfter.includes(act) ? act : null;
        }, 1000);
        if (!targetIn) { nameFailed.push(`・${it.n}`); continue; }
        Utils.setInputValue(targetIn, it.n);
        targetIn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
        await Utils.sleep(40);
      }
    } catch (err) {
      console.error("Penlight Assistant: auto add failed", err);
      this.ui.showToast("登録中にエラーが発生しました。途中まで登録されています。", true);
    } finally {
      this.running = false; this.abortRequested = false;
      run.disabled = false; run.classList.remove("running");
    }
    run.textContent = aborted ? `中断 (${count}/${pTargets.length}件)` : `完了 (${count}/${pTargets.length}件)`;

    const notes = [];
    if (aborted) notes.push(`途中で中断しました。${count}件まで追加済みです。`);
    if (skipped.length) notes.push(`以下のメンバーはスキップされました：\n${skipped.join("\n")}`);
    if (nameFailed.length) notes.push(`色は追加しましたが、名前を入力できませんでした（手動で入力してください）：\n${nameFailed.join("\n")}`);
    if (notes.length) {
      await this.ui.openModal({ title: "お知らせ", message: notes.join("\n\n"), hideCancel: true });
    } else {
      this.ui.showToast(`🎉 処理が完了しました！`);
    }
    // スマホではパネルが画面を覆うので、完了後は自動で縮めて公式サイトの結果を見せる
    if (!aborted && window.matchMedia?.("(max-width: 768px)").matches) this.ui.els.min.click();
    setTimeout(() => { if (!this.running) this.ui.els.run.textContent = "リストに追加する"; }, 2000);
  }
}


// 起動（二重読み込み防止）
if (!window.__psHelperLoaded) {
  window.__psHelperLoaded = true;
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => new App().init()) : setTimeout(() => new App().init(), 500);
}

})();
