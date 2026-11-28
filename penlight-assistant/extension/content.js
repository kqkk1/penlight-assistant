/**
 * Penlight Assistant - ブックマークレット用（自動生成ファイル）
 * ※このファイルは GitHub Actions が自動で作ります。直接編集しないでください。
 * 元ファイル: config.js, utils.js, grouper.js, data.js, site.js, styles.js, ui.js, main.js
 * version: 4.6.4 / build: 2026-11-28T02:23:52.995Z
 */
(() => {
"use strict";
// ===== config.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - config.js
 * 設定・定数
 * バージョン、スプシID、しきい値、56色名など。数値の調整はこのファイルだけで完結します。
 */

const CURRENT_VERSION = "4.6.4";

const CONFIG = {
  GITHUB_REPO: "kqkk1/penlight-assistant",
  DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
  // 標準のスプシの内容を GitHub Actions が書き出したファイル（tools/build-colors.js）。カスタムスプシIDのときは使わず、スプシを直接読む
  COLORS_URL: "https://cdn.jsdelivr.net/gh/kqkk1/penlight-assistant@main/penlight-assistant/data/colors.json",
  SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
  KEYS: { FAV: "ps_fav_idols_v2", ID: "ps_custom_sheet_id", PEN: "ps_pen_mode", DUP: "ps_merge_dup", SORT: "ps_sort_mode", MERGE: "ps_merge_mode", STRENGTH: "ps_family_strength", BUNDLE: "ps_cache_colors", QUEUE: "ps_saved_queue", THEME: "ps_theme" },
  CACHE_EXPIRY: 24 * 60 * 60 * 1000,
  QUEUE_EXPIRY: 12 * 60 * 60 * 1000, // 追加予定を、ページを開き直しても戻せる時間
  MAX_COLORS: 50,
  TITLE_MAX: 12, // 公式サイトのタイトル欄の文字数上限
  // 同系色まとめのしきい値（OKLab距離）。グループ内の全員がこの距離以内のときだけまとめる
  FAMILY_THRESHOLDS: {
    "361": { weak: 0.04, medium: 0.09, strong: 0.12 },
    "56":  { weak: 0.06, medium: 0.10, strong: 0.15 }
  },
  // まとめの選択肢（設定画面に左から並ぶ）。保存の形式は以前と同じ（mergeMode と familyStrength）
  MERGE_OPTIONS: [
    { id: "none",   mode: "none",   label: "なし",       hint: "まとめずに1人1色で登録します" },
    { id: "exact",  mode: "exact",  label: "完全一致",   hint: "同じペンラコードの人を、連名で1色にまとめます" },
    { id: "weak",   mode: "family", strength: "weak",   label: "同系色・弱" },
    { id: "medium", mode: "family", strength: "medium", label: "同系色・中" },
    { id: "strong", mode: "family", strength: "strong", label: "同系色・強" }
  ],
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
  // 公式サイト（PENLa PRO-361）の色の並び順。「公式の順」と、まとめたときの登録順に使う
  GROUP_ORDER: { R: 1, B: 2, Y: 3, O: 4, D: 5, G: 6, GB: 7, P: 8, V: 9, W: 10, H: 11 },
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

    // 3) 出力（並び順）
    //    まとめているとき・「公式の順」のとき: 書き込む色（代表コード）の公式の順
    //    まとめずに「選んだ順」「カスタム」のとき: 今までどおり、その順番（先頭メンバーの位置）
    const groups = clusters.map(members => ColorGrouper.finalize(members, mode, store.favorites));
    //    まとめて「選んだ順」のときは、追加予定の一覧で手で並べ替えた順番を優先する
    //    （グループの位置＝メンバーの色のうち一番前のもの。まだ並べていない色は、後ろに公式の順で足す）
    const official = store.sortMode === "code" || mode !== "none";
    const order = mode !== "none" && store.sortMode === "select" && Array.isArray(store.groupOrder) ? store.groupOrder : [];
    const pos = g => { let p = 1e9; g.pens.forEach(c => { const i = order.indexOf(c); if (i >= 0 && i < p) p = i; }); return p; };
    const key = g => official ? [order.length ? pos(g) : 0, rankCalc(g.pen), g.firstIdx] : [g.firstIdx, 0, 0];
    return groups.sort((a, b) => { const x = key(a), y = key(b); return (x[0] - y[0]) || (x[1] - y[1]) || (x[2] - y[2]); });
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
    const base = { members: members.map(m => m.it), pens: members.map(m => m.pen).filter(p => p !== "--"), firstIdx: first.idx };
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
 * Store: 選択状態・設定の保存 / DataFetcher: カラーデータの取得（colors.json またはスプシ）とキャッシュ
 */

class Store {
  constructor() {
    this.cache = {}; this.selected = new Map(); this.counter = 0;
    this.groupOrder = [];   // まとめているときに手で並べ替えた順番（ペンラコードの並び）。空なら公式の順
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
  clearSelection() { this.selected.clear(); this.counter = 0; this.groupOrder = []; }
  // 追加予定を保存しておく（ページの再読み込み・誤操作で消えても戻せるように）。中身は「ブランド:名前」と選んだ順だけ
  saveSelection() {
    try {
      if (!this.selected.size) { localStorage.removeItem(CONFIG.KEYS.QUEUE); return; }
      const keys = [...this.selected.values()].sort((a, b) => (a.selectOrder || 0) - (b.selectOrder || 0)).map(it => `${it.brand}:${it.n}`);
      localStorage.setItem(CONFIG.KEYS.QUEUE, JSON.stringify({ t: Date.now(), keys, go: this.groupOrder }));
    } catch (e) {}
  }
  loadSavedSelection() {
    try {
      const v = JSON.parse(localStorage.getItem(CONFIG.KEYS.QUEUE));
      const ok = v && Date.now() - v.t < CONFIG.QUEUE_EXPIRY && Array.isArray(v.keys);
      if (ok && Array.isArray(v.go)) this.groupOrder = v.go.filter(x => typeof x === "string");
      return ok ? v.keys : [];
    } catch (e) { return []; }
  }
  forgetSavedSelection() { localStorage.removeItem(CONFIG.KEYS.QUEUE); }
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
  /**
   * 1シート分（CSVを解析した行の配列）→ アイドルの一覧。1行目は見出し。
   * colors.json を作るスクリプト（tools/build-colors.js）も、この関数をそのまま使う（読み取りの規則を1か所にまとめるため）
   */
  static parseRows(rows, sheetName) {
    if (!rows || rows.length <= 1) return [];
    const items = [], seen = new Set();
    const ext = r => r ? (r.match(/[A-Za-z]+[0-9]+(?:-[0-9]+)?/)?.[0].toUpperCase() || r.replace(/\s*△.*/, "").trim()) : "";
    const clean = c => c ? c.replace(/^"|"$/g, "").trim() : "";
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i]; if (cols.length < 3) continue;
      let name = clean(cols[0]);
      // シート名が見つからないと、スプシは先頭のシート（765AS）を返してくる。そのときは空として扱う
      if (sheetName !== "765AS" && name === "天海春香" && !items.length) return [];
      if (sheetName === "876" && name.includes("秋月涼")) name = "秋月涼";

      const [p361, p56, unit, sortCode] = [ext(clean(cols[2])), ext(clean(cols[3])), clean(cols[4]), ext(clean(cols[8]))];
      if (name && (p361 || p56) && !seen.has(name)) {
        // 属性(E列)で判定。E列が空のときだけ名前から推定（名前に「色」「プロ」等を含むアイドルの誤判定を防ぐ）
        const role = unit
          ? (/ブランド/.test(unit) ? "brand" : /事務員/.test(unit) ? "staff" : /ユニット|色|カラー/.test(unit) ? "unit_color" : "idol")
          : (/ブランド|プロダクション|学園/.test(name) ? "brand" : /事務員|社長/.test(name) ? "staff" : "idol");
        const aliases = [...new Set([...DataFetcher.jointNames(name), ...clean(cols[9]).split(/[,、，\n]+/)].map(a => a.trim()))].filter(a => a && a !== name);
        seen.add(name);
        items.push({ n: name, c: clean(cols[1]), p_361: p361, p_56: p56, unit, c_v: clean(cols[5]), p_v_361: ext(clean(cols[6])), p_v_56: ext(clean(cols[7])), sort_code: sortCode, brand: sheetName, role, rawIndex: i, ...(aliases.length ? { aliases } : {}) });
      }
    }
    return items;
  }

  /**
   * 照合用の別名（ボタンは1つのまま、出演者の照合にだけ使う）
   *  - A列が「双海亜美・双海真美」のように、同じ名字で始まる名前を「・」でつないだ形なら、1人ずつの名前でも照合する
   *    （名字が違う「イヴ・サンタクロース」のような1人の名前は分けない）
   *  - J列「別名」（任意）にカンマ区切りで書いた名前でも照合する（A列の書き方を変えたくないとき用）
   */
  static jointNames(name) {
    const parts = String(name || "").split("・").map(s => s.trim()).filter(Boolean);
    const head = s => [...s].slice(0, 2).join("");
    return parts.length >= 2 && parts.every(p => [...p].length >= 3 && head(p) === head(parts[0])) ? parts : [];
  }

  // 標準のスプシを使っているときは colors.json（1回の取得で全ブランド）、カスタムスプシIDのときは、これまで通りスプシをシートごとに読む
  static async fetch(sheetName, force = false) {
    DataFetcher.lastError = false;
    if (!localStorage.getItem(CONFIG.KEYS.ID)) {
      const bundle = await DataFetcher.loadBundle(force);
      if (bundle) { DataFetcher.applySheetList(bundle.sheets); DataFetcher.dataUpdatedAt = bundle.updatedAt || null; return bundle.items[sheetName] || []; }
      // colors.json が読めないときは、スプシを直接読む（従来の方法）
    }
    return DataFetcher.fetchSheet(sheetName, force);
  }

  // colors.json の取得（同時に呼ばれても1回だけ取りに行く）。取れなければ、期限切れでも前回のものを使う。どちらもなければ null
  static loadBundle(force = false) {
    if (!force && DataFetcher._bundle) return Promise.resolve(DataFetcher._bundle);
    if (!force && DataFetcher._bundleFailed) return Promise.resolve(null);   // この画面で一度失敗したら、再読み込みボタンを押すまでスプシ直読みで動かす
    if (DataFetcher._bundleLoading) return DataFetcher._bundleLoading;
    DataFetcher._bundleLoading = (async () => {
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(CONFIG.KEYS.BUNDLE)); } catch (e) {}
      if (!force && cached?.data && Date.now() - cached.timestamp < CONFIG.CACHE_EXPIRY) return cached.data;
      try {
        const res = await fetch(CONFIG.COLORS_URL, { cache: force ? "reload" : "default" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data || typeof data.items !== "object" || !Object.keys(data.items).length) throw new Error("invalid colors.json");
        try { localStorage.setItem(CONFIG.KEYS.BUNDLE, JSON.stringify({ timestamp: Date.now(), data })); } catch (e) {}
        CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`));   // 以前のシートごとのキャッシュは、もう使わないので消す
        return data;
      } catch (e) {
        return cached?.data || null;
      }
    })();
    return DataFetcher._bundleLoading.then(data => {
      DataFetcher._bundle = data; DataFetcher._bundleFailed = !data; DataFetcher._bundleLoading = null;
      return data;
    });
  }

  // colors.json に書かれたブランドの一覧を使う（ブランドを増やしても、拡張機能の更新が要らないように）
  static applySheetList(list) {
    if (!Array.isArray(list) || !list.length || !list.every(x => typeof x === "string" && x)) return;
    if (list.join("\u0000") === CONFIG.SHEETS.join("\u0000")) return;
    CONFIG.SHEETS.splice(0, CONFIG.SHEETS.length, ...list);
    DataFetcher.sheetsChanged = true;
  }

  static clearCache() {
    localStorage.removeItem(CONFIG.KEYS.BUNDLE);
    CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`));
    DataFetcher._bundle = null; DataFetcher._bundleFailed = false;
  }

  // スプシをシートごとに直接読む（カスタムスプシID、または colors.json が読めないとき）
  static async fetchSheet(sheetName, force = false) {
    const cacheKey = `ps_cache_${sheetName}`;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch (e) {}
    if (!force && cached && Date.now() - cached.timestamp < CONFIG.CACHE_EXPIRY) return cached.data;
    try {
      const targetId = localStorage.getItem(CONFIG.KEYS.ID) || CONFIG.DEFAULT_SPREADSHEET_ID;
      const res = await fetch(`https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`);
      if (!res.ok) throw new Error("Network error");
      const items = DataFetcher.parseRows(Utils.parseCSV(await res.text()), sheetName);
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
 * 色はすべて一番上の変数で管理しています（ダーク／ライト）。ライブ情報ポータルと同じ配色です。
 * サイズ・スマホ用レイアウトの調整もこのファイルだけで完結します。
 */

const PS_STYLES = `
  /* ===== 色の変数（ダーク）。.ps-root はパネル・丸ボタン・ダイアログ・通知の外枠 ===== */
  .ps-root {
    --ps-bg:#111214; --ps-surface:#17181b; --ps-surface2:#1d1e22; --ps-raise:#232428;
    --ps-line:rgba(255,255,255,.08); --ps-line2:rgba(255,255,255,.16);
    --ps-text:#ececf0; --ps-muted:#9c9ea8; --ps-accent:#a3b6ff; --ps-on-accent:#111214;
    --ps-ok:#94d48c; --ps-warn:#ff95a4; --ps-gold:#e8bd78;
    --ps-sel:#ececf0; --ps-sel-fg:#111214; --ps-cta:#ececf0; --ps-cta-fg:#111214; --ps-on-gold:#111214; --ps-on-warn:#111214;
    --ps-row-sel:rgba(163,182,255,.1); --ps-accent-soft:rgba(163,182,255,.14);
    --ps-ok-soft:rgba(148,212,140,.14); --ps-warn-soft:rgba(255,149,164,.12); --ps-gold-soft:rgba(232,189,120,.14);
    --ps-shadow:0 24px 60px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4);
    color-scheme:dark;
    font-family:"Hiragino Sans","Noto Sans JP","Yu Gothic UI",system-ui,-apple-system,sans-serif;
    font-feature-settings:"palt"; letter-spacing:.01em; line-height:1.5; color:var(--ps-text);
  }
  /* ===== 色の変数（ライト） ===== */
  .ps-root[data-ps-theme="light"] {
    --ps-bg:#f5f4f0; --ps-surface:#ffffff; --ps-surface2:#fbfaf7; --ps-raise:#ffffff;
    --ps-line:rgba(20,22,28,.09); --ps-line2:rgba(20,22,28,.2);
    --ps-text:#17181c; --ps-muted:#5d606a; --ps-accent:#3554c9; --ps-on-accent:#ffffff;
    --ps-ok:#2a7a37; --ps-warn:#c03050; --ps-gold:#9a5f0c;
    --ps-sel:rgba(53,84,201,.1); --ps-sel-fg:#2a45b0; --ps-cta:#3554c9; --ps-cta-fg:#ffffff; --ps-on-gold:#ffffff; --ps-on-warn:#ffffff;
    --ps-row-sel:rgba(53,84,201,.07); --ps-accent-soft:rgba(53,84,201,.1);
    --ps-ok-soft:rgba(42,122,55,.1); --ps-warn-soft:rgba(192,48,80,.08); --ps-gold-soft:rgba(154,95,12,.1);
    --ps-shadow:0 24px 60px rgba(20,22,28,.18), 0 2px 8px rgba(20,22,28,.08);
    color-scheme:light;
  }
  .ps-root, .ps-root * { box-sizing:border-box; }
  /* 公式サイト側のボタン・入力欄の見た目を受け継がないための初期化（:where で優先度を0にして、下の部品の指定が必ず勝つようにする） */
  :where(.ps-root) :is(button, input, select, textarea) { font:inherit; letter-spacing:inherit; color:inherit; margin:0; }
  :where(.ps-root) button { cursor:pointer; }
  .ps-root :focus-visible { outline:2px solid var(--ps-accent); outline-offset:2px; }
  .ps-ic { width:16px; height:16px; flex-shrink:0; display:inline-block; vertical-align:-3px; }

  /* ===== パネル本体 ===== */
  #ps-m { position:fixed; top:18px; right:18px; width:500px; height:750px; min-width:280px; min-height:240px; max-width:95vw; max-height:94vh; background:var(--ps-bg); border:1px solid var(--ps-line2); border-radius:16px; box-shadow:var(--ps-shadow); z-index:999999999; padding:12px 14px 14px; display:flex; flex-direction:column; font-size:13px; }
  /* スクロールする欄では、キーボードで移動したときにフォーカスの枠ごと見える位置まで送る */
  #ps-body, #ps-opt-panel, #ps-l, #ps-queue-list, #ps-unit-chips { scroll-padding:6px; }
  #ps-m ::-webkit-scrollbar { width:8px; height:8px; }
  #ps-m ::-webkit-scrollbar-track { background:transparent; }
  #ps-m ::-webkit-scrollbar-thumb { background:var(--ps-line2); border-radius:4px; border:2px solid transparent; background-clip:padding-box; }
  #ps-resize-handle { position:absolute; left:0; bottom:0; width:18px; height:18px; cursor:nesw-resize; z-index:10; display:flex; align-items:flex-end; padding:4px; }
  #ps-resize-handle::after { content:""; width:7px; height:7px; border-left:2px solid var(--ps-line2); border-bottom:2px solid var(--ps-line2); border-radius:0 0 0 2px; }
  #ps-resize-handle:hover::after { border-color:var(--ps-accent); }
  .ps-head { display:flex; align-items:center; gap:8px; padding-bottom:10px; margin-bottom:10px; border-bottom:1px solid var(--ps-line); flex-shrink:0; }
  .ps-title { font-size:14px; font-weight:700; letter-spacing:.03em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ps-ver { margin-left:6px; font-size:11px; font-weight:600; color:var(--ps-muted); font-variant-numeric:tabular-nums; }
  .ps-head-acts { margin-left:auto; display:flex; gap:6px; flex-shrink:0; }
  /* はみ出しを切る欄は、内側に4pxの余白（＋同じだけの負のマージンで見た目の位置は変えない）を持たせ、
     端にある部品のフォーカスの枠（外側に4px出る）が切れないようにする */
  #ps-body { display:flex; flex-direction:column; gap:10px; flex:1; min-height:0; overflow:hidden; padding:4px; margin:-4px; }
  #ps-main { display:flex; flex-direction:column; gap:8px; flex:1; min-height:0; }
  #ps-m.opt-open #ps-main { display:none; }

  /* ===== ボタン・入力欄 ===== */
  .ps-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:32px; padding:0 12px; border-radius:9px; border:1px solid var(--ps-line); background:transparent; color:var(--ps-text); font-size:12px; font-weight:600; white-space:nowrap; user-select:none; transition:background-color .15s, border-color .15s, color .15s, transform .1s; }
  .ps-btn:hover:not(:disabled) { background:var(--ps-surface2); border-color:var(--ps-line2); }
  .ps-btn:active:not(:disabled) { transform:scale(.97); }
  .ps-btn:disabled { opacity:.5; cursor:not-allowed; }
  .ps-btn-primary { background:var(--ps-cta); border-color:var(--ps-cta); color:var(--ps-cta-fg); }
  .ps-btn-primary:hover:not(:disabled) { background:var(--ps-cta); border-color:var(--ps-cta); filter:brightness(1.08); }
  .ps-btn-sm { min-height:28px; padding:0 10px; font-size:12px; }
  .ps-btn-icon { width:32px; padding:0; color:var(--ps-muted); }
  .ps-btn-icon:hover:not(:disabled) { color:var(--ps-text); }
  .ps-btn-quiet { border-color:transparent; color:var(--ps-muted); }
  .ps-btn-danger { border-color:transparent; color:var(--ps-warn); }
  .ps-btn-danger:hover:not(:disabled) { background:var(--ps-warn-soft); border-color:transparent; }
  #ps-toggle-opt[aria-expanded="true"] { background:var(--ps-sel); border-color:transparent; color:var(--ps-sel-fg); }
  .ps-input { min-height:34px; padding:0 10px; border-radius:9px; border:1px solid var(--ps-line); background:var(--ps-surface); color:var(--ps-text); font-size:13px; outline:none; }
  .ps-input:focus { border-color:var(--ps-accent); }
  select.ps-input { padding-right:6px; cursor:pointer; }
  .ps-search { position:relative; display:flex; align-items:center; }
  .ps-search .ps-ic { position:absolute; left:9px; color:var(--ps-muted); pointer-events:none; }
  .ps-search .ps-input { width:100%; padding-left:30px; }

  /* ===== 選択ボタン（並び・ペンラ・テーマなど） ===== */
  .ps-seg { display:flex; gap:2px; padding:3px; border:1px solid var(--ps-line); border-radius:11px; background:transparent; }
  .ps-seg > button, .ps-seg > label { position:relative; flex:1; display:flex; align-items:center; justify-content:center; min-height:30px; padding:0 8px; border:0; border-radius:8px; background:transparent; color:var(--ps-muted); font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; transition:background-color .15s, color .15s; }
  .ps-seg > button:hover, .ps-seg > label:hover { color:var(--ps-text); }
  .ps-seg > button.active { background:var(--ps-sel); color:var(--ps-sel-fg); }
  .ps-seg input[type="radio"] { position:absolute; opacity:0; pointer-events:none; }
  .ps-seg > label:has(input:checked) { background:var(--ps-sel); color:var(--ps-sel-fg); }
  .ps-seg > label:has(input:focus-visible) { outline:2px solid var(--ps-accent); outline-offset:1px; }
  .ps-merge { display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:2px; padding:3px; border:1px solid var(--ps-line); border-radius:11px; }
  .ps-merge button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; min-height:44px; padding:4px 2px; border:0; border-radius:8px; background:transparent; color:var(--ps-muted); font-size:11px; font-weight:600; line-height:1.25; transition:background-color .15s, color .15s; }
  .ps-merge button:hover { color:var(--ps-text); }
  .ps-merge button.active { background:var(--ps-sel); color:var(--ps-sel-fg); }
  .ps-mlabel { white-space:nowrap; }
  .ps-mcount { font-size:11px; font-weight:500; opacity:.8; font-variant-numeric:tabular-nums; }
  .ps-mcount.over { color:var(--ps-warn); opacity:1; font-weight:700; }
  .ps-hint { margin-top:6px; font-size:11px; color:var(--ps-muted); line-height:1.6; }

  /* ===== チェックボックス（一覧の選択・設定のオンオフ） ===== */
  .ps-root input.ps-k, .ps-root input.ps-cb { appearance:none; -webkit-appearance:none; width:18px; height:18px; margin:0; flex-shrink:0; border:1.5px solid var(--ps-line2); border-radius:6px; background:transparent; display:inline-grid; place-content:center; cursor:pointer; transition:background-color .12s, border-color .12s; }
  .ps-root input.ps-k::after, .ps-root input.ps-cb::after { content:""; width:9px; height:5px; border:2px solid var(--ps-on-accent); border-top:0; border-right:0; transform:translateY(-1px) rotate(-45deg); opacity:0; }
  .ps-root input.ps-k:checked, .ps-root input.ps-cb:checked { background:var(--ps-accent); border-color:var(--ps-accent); }
  .ps-root input.ps-k:checked::after, .ps-root input.ps-cb:checked::after { opacity:1; }
  .ps-root input.ps-k:disabled { opacity:.35; cursor:not-allowed; }
  .ps-check { display:inline-flex; align-items:center; gap:7px; min-height:30px; font-size:12px; color:var(--ps-text); cursor:pointer; user-select:none; }

  /* ===== 設定画面 ===== */
  #ps-opt-panel { display:none; flex-direction:column; gap:16px; flex:1; min-height:0; overflow-y:auto; padding:4px 4px 8px; margin:-2px -2px 0; }
  #ps-m.opt-open #ps-opt-panel { display:flex; }
  .ps-opt-head { display:flex; align-items:center; justify-content:space-between; }
  .ps-opt-head b { font-size:15px; }
  .ps-sec { display:flex; flex-direction:column; gap:8px; }
  .ps-sec + .ps-sec { padding-top:14px; border-top:1px solid var(--ps-line); }
  .ps-sec-title { font-size:11px; font-weight:700; letter-spacing:.08em; color:var(--ps-muted); }
  .ps-sec-row { display:flex; flex-wrap:wrap; align-items:center; gap:6px 16px; }
  .ps-note { font-size:11px; color:var(--ps-muted); line-height:1.6; }

  /* ===== 追加予定 ===== */
  .ps-queue { background:var(--ps-surface); border:1px solid var(--ps-line); border-radius:12px; padding:8px 10px; flex-shrink:0; }
  .ps-qhead { display:flex; flex-wrap:wrap; align-items:center; gap:4px 6px; }
  #ps-queue-toggle { display:inline-flex; align-items:center; gap:6px; min-height:32px; padding:0 4px; margin-left:-4px; border:0; border-radius:8px; background:transparent; font-size:13px; font-weight:600; color:var(--ps-text); white-space:nowrap; flex-shrink:0; }
  #ps-queue-toggle:hover { background:var(--ps-surface2); }
  #ps-queue-toggle b { font-size:15px; font-variant-numeric:tabular-nums; }
  #ps-queue-arrow { display:inline-flex; color:var(--ps-muted); transition:transform .2s; }
  #ps-queue-toggle[aria-expanded="true"] #ps-queue-arrow { transform:rotate(180deg); }
  #ps-queue-merged { font-size:12px; font-weight:600; font-variant-numeric:tabular-nums; color:var(--ps-muted); white-space:nowrap; }
  #ps-queue-merged.ok { color:var(--ps-ok); } #ps-queue-merged.near { color:var(--ps-gold); } #ps-queue-merged.over { color:var(--ps-warn); }
  .ps-qacts { margin-left:auto; display:flex; gap:4px; flex-shrink:0; }
  .ps-meter { height:4px; margin:6px 0 2px; border-radius:2px; background:var(--ps-line); overflow:hidden; }
  .ps-meter i { display:block; height:100%; width:0; border-radius:2px; background:var(--ps-ok); transition:width .25s, background-color .25s; }
  .ps-meter.near i { background:var(--ps-gold); } .ps-meter.over i { background:var(--ps-warn); }
  .ps-limit { display:flex; flex-wrap:wrap; align-items:center; gap:6px 8px; margin-top:8px; padding:8px 10px; border-radius:10px; background:var(--ps-warn-soft); color:var(--ps-warn); font-size:12px; font-weight:600; line-height:1.5; }
  .ps-limit .ps-btn { min-height:28px; padding:0 10px; font-size:12px; }
  #ps-queue-list { display:none; flex-wrap:wrap; gap:6px; overflow-y:auto; align-content:flex-start; margin:8px -4px -4px; padding:9px 4px 4px; background:linear-gradient(var(--ps-line),var(--ps-line)) 4px 0 / calc(100% - 8px) 1px no-repeat; }
  /* 閉じているとき: 登録される色を小さな丸で並べる（押すと開く）。2行まで */
  #ps-qdots { display:none; flex-wrap:wrap; gap:4px; width:100%; max-height:28px; overflow:hidden; margin:6px 0 0; padding:2px 0; border:0; border-radius:6px; background:transparent; cursor:pointer; }
  #ps-qdots i { flex:none; width:10px; height:10px; border-radius:50%; box-shadow:0 0 0 1px var(--ps-line2); }
  #ps-qdots i.skip { background:transparent; box-shadow:inset 0 0 0 1.5px var(--ps-muted); }
  #ps-m:not(.q-open) #ps-qdots.has { display:flex; }
  #ps-qfoot { display:none; align-items:center; justify-content:flex-end; gap:8px; margin-top:8px; padding-top:8px; border-top:1px solid var(--ps-line); }
  #ps-qfoot [data-greset], #ps-qfoot .ps-qhint { margin-right:auto; }
  .ps-qhint { display:inline-flex; align-items:center; gap:4px; font-size:12px; color:var(--ps-muted); }
  .ps-qhint .ps-ic { width:14px; height:14px; }
  #ps-qdone .ps-ic { transform:rotate(180deg); }
  /* 開いているとき（確認モード）: 一覧・検索を隠し、追加予定をその場所まで広げる */
  #ps-m.q-open .ps-tools, #ps-m.q-open .ps-subtools, #ps-m.q-open #ps-l { display:none; }
  #ps-m.q-open .ps-queue { flex:1 1 auto; min-height:0; display:flex; flex-direction:column; }
  #ps-m.q-open #ps-queue-list { display:flex; flex:1 1 auto; min-height:60px; }
  #ps-m.q-open #ps-qfoot { display:flex; }
  .ps-qempty { font-size:12px; color:var(--ps-muted); line-height:1.6; }
  .ps-badge { display:inline-flex; align-items:center; gap:6px; max-width:100%; min-height:30px; padding:2px 2px 2px 8px; border:1px solid var(--ps-line); border-radius:999px; background:var(--ps-surface2); font-size:12px; line-height:1.2; }
  .ps-badge .ps-bname { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ps-badge.skip { opacity:.55; } .ps-badge.skip .ps-bname { text-decoration:line-through; }
  .ps-del { display:inline-grid; place-content:center; width:24px; height:24px; padding:0; border:0; border-radius:50%; background:transparent; color:var(--ps-muted); flex-shrink:0; }
  .ps-del:hover { background:var(--ps-warn-soft); color:var(--ps-warn); }
  .ps-del .ps-ic { width:14px; height:14px; }
  .ps-sw { display:inline-block; width:10px; height:10px; border-radius:3px; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(127,127,127,.35); }
  .ps-code { font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace; font-size:11px; color:var(--ps-muted); white-space:nowrap; }
  .ps-drag-item { transition:opacity .1s, transform .1s; }
  .ps-drag-item.dragging { opacity:.4; transform:scale(.96); }
  .ps-drag-item.drag-over { border-color:var(--ps-accent); border-style:dashed; }
  .ps-drag-handle { display:inline-flex; margin-left:-4px; padding:2px; color:var(--ps-text); opacity:.6; cursor:grab; user-select:none; touch-action:none; }
  .ps-drag-item[draggable="true"] { cursor:grab; }
  .ps-drag-item[draggable="true"]:hover .ps-drag-handle, .ps-drag-handle:hover { opacity:1; color:var(--ps-accent); }
  .ps-drag-handle .ps-ic { width:14px; height:14px; }
  .ps-drag-handle.disabled { cursor:not-allowed; opacity:.3; }
  .ps-linkbtn { border:0; background:none; padding:4px 2px; font-size:12px; color:var(--ps-accent); cursor:pointer; }
  .ps-linkbtn:hover { text-decoration:underline; }
  /* まとめた色: 閉じているときは単体（.ps-badge）と同じ形・同じ高さ。開いたときだけ横いっぱいのパネルになる */
  .ps-group { display:inline-flex; flex-direction:column; max-width:100%; min-width:0; border:1px solid var(--ps-line); border-radius:999px; background:var(--ps-surface2); }
  .ps-group.drag-over { border-color:var(--ps-accent); border-style:dashed; }
  .ps-group-head { display:inline-flex; align-items:center; gap:6px; max-width:100%; min-height:28px; padding:2px 6px 2px 8px; border:0; border-radius:999px; background:transparent; font-size:12px; line-height:1.2; text-align:left; color:var(--ps-text); }
  .ps-group-head:hover { background:var(--ps-accent-soft); }
  .ps-group-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
  .ps-gcount { flex-shrink:0; padding:1px 6px; border-radius:999px; background:var(--ps-accent-soft); color:var(--ps-accent); font-size:11px; font-weight:700; white-space:nowrap; }
  .ps-group-label { margin-left:auto; flex-shrink:0; color:var(--ps-muted); font-size:11px; white-space:nowrap; }
  .ps-group-chev { display:inline-flex; flex-shrink:0; color:var(--ps-muted); }
  .ps-group-chev .ps-ic { width:14px; height:14px; transition:transform .2s; }
  .ps-group.open { flex-basis:100%; border-radius:12px; }
  .ps-group.open .ps-group-head { display:flex; width:100%; border-radius:11px 11px 0 0; padding:4px 8px; }
  .ps-group.open .ps-group-chev .ps-ic { transform:rotate(180deg); }
  .ps-group:not(.open) .ps-group-label + .ps-group-chev, .ps-group.open .ps-group-label ~ .ps-group-chev { margin-left:0; }
  .ps-group.open .ps-group-chev { margin-left:auto; }
  .ps-group.open .ps-group-label + .ps-group-chev { margin-left:0; }
  .ps-group-body { display:flex; flex-wrap:wrap; gap:6px; padding:6px 8px 8px; border-top:1px solid var(--ps-line); }
  .ps-group-title { flex-basis:100%; font-size:11px; color:var(--ps-muted); }
  .ps-group-title b { color:var(--ps-text); font-weight:600; }

  /* ===== ブランド・検索・ユニット ===== */
  .ps-tools { display:flex; gap:6px; flex-shrink:0; }
  .ps-tools select { flex:1 1 40%; min-width:0; }
  .ps-tools .ps-search { flex:1 1 60%; min-width:0; }
  .ps-subtools { display:flex; align-items:center; gap:8px; flex-shrink:0; min-height:30px; }
  #ps-unit-chips { display:none; flex:1; min-width:0; flex-wrap:nowrap; overflow-x:auto; gap:6px; padding:4px; margin:-4px; scrollbar-width:none; }
  #ps-unit-chips::-webkit-scrollbar { display:none; }
  #ps-unit-chips .ps-chip:focus-visible { outline-offset:-2px; }   /* 横にスクロールする欄の端でも切れないよう、枠はチップの内側に描く */
  .ps-sel-acts { display:flex; gap:4px; margin-left:auto; flex-shrink:0; }
  .ps-chip { display:inline-flex; align-items:center; min-height:28px; padding:0 12px; border:1px solid var(--ps-line); border-radius:999px; background:transparent; color:var(--ps-muted); font-size:12px; font-weight:600; white-space:nowrap; cursor:pointer; user-select:none; transition:background-color .15s, color .15s, border-color .15s; }
  .ps-chip:hover { color:var(--ps-text); border-color:var(--ps-line2); }
  .ps-chip.active { background:var(--ps-sel); border-color:transparent; color:var(--ps-sel-fg); }

  /* ===== アイドル一覧 ===== */
  #ps-l { flex:1; min-height:80px; overflow-y:auto; padding:4px; border:1px solid var(--ps-line); border-radius:12px; background:var(--ps-surface); }
  .ps-empty { padding:16px 10px; color:var(--ps-muted); font-size:12px; text-align:center; line-height:1.6; }
  .ps-empty.err { color:var(--ps-warn); }
  .ps-row { display:flex; align-items:center; gap:8px; min-height:38px; padding:4px 8px; border-radius:8px; cursor:pointer; user-select:none; transition:background-color .1s; }
  .ps-row:hover { background:var(--ps-surface2); }
  .ps-row.selected { background:var(--ps-row-sel); }
  .ps-row.skip { opacity:.55; }
  .ps-row.skip .ps-name-label { text-decoration:line-through; }
  .ps-star-btn { display:inline-grid; place-content:center; width:26px; height:26px; margin:0 -2px; padding:0; border:0; border-radius:7px; background:transparent; color:var(--ps-muted); flex-shrink:0; opacity:.6; transition:color .12s, opacity .12s; }
  .ps-star-btn:hover { opacity:1; color:var(--ps-gold); }
  .ps-star-btn.active { opacity:1; color:var(--ps-gold); }
  .ps-star-btn.active .ps-ic { fill:currentColor; }
  .ps-swatch { width:16px; height:16px; border-radius:5px; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(127,127,127,.35); }
  .ps-name-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
  .ps-pen { flex-shrink:0; margin-left:4px; font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace; font-size:12px; font-weight:600; color:var(--ps-muted); font-variant-numeric:tabular-nums; }
  .ps-pen.none { color:var(--ps-warn); }
  .ps-tag { display:inline-block; margin-left:6px; padding:1px 6px; border-radius:5px; font-size:10px; font-weight:700; vertical-align:1px; }
  .ps-tag-brand { color:var(--ps-accent); background:var(--ps-accent-soft); }
  .ps-tag-staff { color:var(--ps-ok); background:var(--ps-ok-soft); }
  .ps-tag-unit { color:var(--ps-gold); background:var(--ps-gold-soft); }
  .ps-utag { margin-left:6px; font-size:11px; color:var(--ps-muted); }
  .ps-brand-head { position:sticky; top:-4px; z-index:1; margin:0 -4px 2px; padding:8px 12px 4px; background:var(--ps-surface); font-size:11px; font-weight:700; letter-spacing:.08em; color:var(--ps-muted); border-bottom:1px solid var(--ps-line); }

  /* ===== 実行ボタン ===== */
  #ps-run { width:100%; min-height:44px; flex-shrink:0; border-radius:12px; font-size:14px; font-weight:700; }
  #ps-run.over { background:var(--ps-gold); border-color:var(--ps-gold); color:var(--ps-on-gold); }
  #ps-run.running { background:var(--ps-warn); border-color:var(--ps-warn); color:var(--ps-on-warn); }
  #ps-run:disabled { background:var(--ps-surface2) !important; border-color:var(--ps-line) !important; color:var(--ps-muted) !important; opacity:1; filter:none; transform:none; }

  /* ===== お知らせ（新バージョン） ===== */
  .ps-update { display:flex; align-items:center; gap:8px; width:100%; min-height:36px; padding:6px 12px; border:0; border-radius:10px; background:var(--ps-gold-soft); color:var(--ps-gold); font-size:12px; font-weight:700; text-align:left; flex-shrink:0; }
  .ps-update:hover { filter:brightness(1.08); }

  /* ===== 閉じたときの丸ボタン ===== */
  #ps-fab { position:fixed; bottom:24px; right:24px; width:52px; height:52px; padding:0; border:0; border-radius:50%; background:var(--ps-cta); color:var(--ps-cta-fg); box-shadow:var(--ps-shadow); z-index:999999999; display:flex; justify-content:center; align-items:center; cursor:pointer; user-select:none; transition:transform .15s; }
  #ps-fab:hover { transform:scale(1.06); }
  #ps-fab .ps-ic { width:24px; height:24px; }

  /* ===== 通知 ===== */
  #ps-toast-container { position:fixed; bottom:88px; right:24px; z-index:9999999999; display:flex; flex-direction:column; align-items:flex-end; gap:8px; pointer-events:none; }
  .ps-toast { display:flex; align-items:flex-start; gap:8px; max-width:360px; padding:10px 14px; border:1px solid var(--ps-line2); border-radius:12px; background:var(--ps-raise); color:var(--ps-text); box-shadow:var(--ps-shadow); font-size:13px; font-weight:600; line-height:1.5; white-space:pre-wrap; pointer-events:auto; opacity:0; transform:translateY(8px); transition:opacity .2s, transform .2s; }
  .ps-toast.show { opacity:1; transform:none; }
  .ps-toast .ps-ic { margin-top:2px; color:var(--ps-ok); }
  .ps-toast.error .ps-ic { color:var(--ps-warn); }

  /* ===== ダイアログ ===== */
  #ps-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9999999999; display:none; justify-content:center; align-items:center; padding:16px; opacity:0; transition:opacity .2s; -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px); }
  #ps-modal { width:360px; max-width:100%; padding:20px; border:1px solid var(--ps-line2); border-radius:16px; background:var(--ps-surface); box-shadow:var(--ps-shadow); transform:translateY(12px); transition:transform .2s; }
  #ps-modal.show { transform:none; }
  .ps-modal-title { font-size:15px; font-weight:700; margin-bottom:8px; }
  .ps-modal-msg { font-size:13px; color:var(--ps-muted); margin-bottom:16px; line-height:1.7; white-space:pre-wrap; max-height:50vh; overflow-y:auto; }
  .ps-modal-input { width:100%; min-height:96px; padding:10px; margin-bottom:6px; border:1px solid var(--ps-line); border-radius:10px; background:var(--ps-bg); color:var(--ps-text); font-size:13px; line-height:1.6; outline:none; resize:vertical; }
  .ps-modal-input:focus { border-color:var(--ps-accent); }
  .ps-modal-kbd { font-size:11px; color:var(--ps-muted); margin-bottom:14px; }
  .ps-modal-actions { display:flex; justify-content:flex-end; gap:8px; }
  .ps-modal-actions .ps-btn { min-height:38px; padding:0 18px; font-size:13px; }

  @media (prefers-reduced-motion: reduce) {
    .ps-root, .ps-root * { transition:none !important; }
  }

  /* ===== スマホ（画面の下から出るシート） ===== */
  @media screen and (max-width: 768px), screen and (max-height: 500px) {
    #ps-m {
      top:auto !important; bottom:0 !important; right:0 !important; left:0 !important;
      width:100% !important; max-width:100% !important; margin:0 !important;
      height:85dvh !important; max-height:calc(100dvh - 20px) !important;
      border-radius:20px 20px 0 0; border-bottom:none;
      padding:14px max(12px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)) !important;
    }
    #ps-resize-handle { display:none !important; }
    #ps-body { overflow-y:auto !important; }
    #ps-l { flex:1 1 auto !important; height:auto !important; min-height:150px !important; overflow-y:auto !important; }
    #ps-run { position:sticky !important; bottom:0 !important; z-index:100 !important; min-height:50px; font-size:15px; box-shadow:0 -14px 18px 4px var(--ps-bg) !important; }
    .ps-row { min-height:48px; padding:6px 10px; gap:10px; }
    .ps-root input.ps-k { width:22px; height:22px; border-radius:7px; }
    .ps-star-btn { width:34px; height:34px; }
    .ps-star-btn .ps-ic { width:18px; height:18px; }
    .ps-name-label { font-size:14px; }
    .ps-btn { min-height:36px; font-size:13px; }
    .ps-btn-icon { width:36px; }
    .ps-input { min-height:40px; font-size:16px; }
    .ps-seg > button, .ps-seg > label { min-height:36px; font-size:13px; }
    .ps-chip { min-height:34px; padding:0 14px; font-size:13px; }
    .ps-badge { min-height:34px; font-size:13px; }
    .ps-group-head { min-height:34px; font-size:13px; }
    .ps-del { width:30px; height:30px; }
    #ps-qdots { gap:5px; max-height:34px; }
    #ps-qdots i { width:12px; height:12px; }
    #ps-m.q-open .ps-queue { min-height:calc(100% - 4px); }
    #ps-m .ps-drag-handle { padding:8px 6px; margin:-8px 0 -8px -6px; color:var(--ps-accent); opacity:1; }
    #ps-m .ps-drag-handle.disabled { color:var(--ps-muted); }
    #ps-fab { bottom:16px; right:16px; width:56px; height:56px; }
    #ps-toast-container { bottom:96px; right:16px; left:16px; align-items:center; }
    .ps-toast { width:100%; max-width:380px; }
  }
  @media screen and (max-height: 500px) and (orientation: landscape) {
    #ps-m { height:100dvh !important; max-height:100dvh !important; border-radius:0 !important; top:0 !important; }
  }
`;

// ===== ui.js =====
/**
 * Penlight Assistant (for MIX PENLa PRO) - ui.js
 * パネルの画面（HTML・操作・描画）
 * UIManager: パネル生成、ボタン操作、追加予定／一覧の描画、抽出処理
 */

// 線のアイコン（絵文字の代わり。文字と同じ色で描かれ、どのOS・テーマでも同じ見た目になる）
const PS_ICONS = {
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  minus: '<path d="M6 12h12"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  chevron: '<path d="M6.5 9.5l5.5 5.5 5.5-5.5"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  paste: '<rect x="6" y="4.5" width="12" height="16" rx="2.5"/><path d="M9.5 4.5V3.5h5v1M9.5 10h5M9.5 13.5h5M9.5 17h3"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  load: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  star: '<path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z"/>',
  grip: '<path d="M9 6.5h.01M15 6.5h.01M9 12h.01M15 12h.01M9 17.5h.01M15 17.5h.01" stroke-width="3"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>',
  alert: '<path d="M12 4.5l8.5 15h-17z"/><path d="M12 10.5v4M12 17h.01"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  pen: '<path d="M9.5 10.5h5V20a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 20z"/><path d="M10 10.5V7a2 2 0 0 1 4 0v3.5"/><path d="M12 2v1.2M6.8 3.6l.9.9M17.2 3.6l-.9.9"/>'
};
const psIcon = (name, cls = "") => `<svg class="ps-ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PS_ICONS[name]}</svg>`;

class UIManager {
  constructor(app, store, site) {
    this.app = app; this.store = store; this.site = site;
    this.els = {}; this.isQueueOpen = false;
    this.openGroups = new Set(); // 追加予定欄で開いているまとめグループ
  }

  inject() {
    if (document.getElementById("ps-m")) return false;
    this.injectStyles(); this.buildHTML(); this.cacheElements(); this.applyTheme(); this.bindEvents(); this.updateMergeUI(); this.checkUpdate();
    return true;
  }

  // いまの「まとめ」の選択肢（CONFIG.MERGE_OPTIONS の1つ）
  currentMergeOption() {
    const s = this.store;
    return CONFIG.MERGE_OPTIONS.find(o => o.mode === s.mergeMode && (o.mode !== "family" || o.strength === s.familyStrength)) || CONFIG.MERGE_OPTIONS[0];
  }
  applyMergeOption(opt) {
    const s = this.store;
    s.setPref("mergeMode", opt.mode, "MERGE");
    if (opt.strength) s.setPref("familyStrength", opt.strength, "STRENGTH");
    this.updateMergeUI(); this.renderQueue();
  }
  mergeHint(opt) {
    if (opt.mode !== "family") return opt.hint;
    return (CONFIG.FAMILY_HINTS[this.store.penMode === "56" ? "56" : "361"] || {})[opt.strength] || "";
  }
  // 選択肢ごとに、まとめた結果の色数を数える（設定画面のボタンと、上限を超えたときの案内に使う）
  mergeCounts(sorted, rank) {
    const s = this.store;
    return CONFIG.MERGE_OPTIONS.map(opt => {
      const v = Object.create(s);
      v.mergeMode = opt.mode; if (opt.strength) v.familyStrength = opt.strength;
      return { opt, count: ColorGrouper.build(sorted, v, rank).filter(g => g.pen !== "--").length };
    });
  }
  // 上限に収まる、いちばん弱いまとめ方（今より強いものだけ）。なければ null
  suggestMerge(counts) {
    const cur = CONFIG.MERGE_OPTIONS.indexOf(this.currentMergeOption());
    return counts.find((c, i) => i > cur && c.count <= CONFIG.MAX_COLORS) || null;
  }

  updateMergeUI() {
    const e = this.els, cur = this.currentMergeOption();
    // 説明はボタンに載せる（マウスを載せる・長押しで表示）。56色／361色で説明が変わるので、ここで毎回入れ直す
    e.mergeBtns.forEach(b => {
      const opt = CONFIG.MERGE_OPTIONS.find(o => o.id === b.dataset.mopt);
      b.classList.toggle("active", opt === cur);
      b.setAttribute("aria-pressed", opt === cur);
      b.title = this.mergeHint(opt);
    });
    if (e.mergeHint) e.mergeHint.textContent = this.mergeHint(cur);
  }

  // テーマ（自動・ダーク・ライト）。自動は端末の設定に合わせる
  applyTheme() {
    const pref = localStorage.getItem(CONFIG.KEYS.THEME) || "auto";
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    const t = pref === "auto" ? (mq?.matches ? "light" : "dark") : pref;
    ["ps-m", "ps-fab", "ps-modal-overlay", "ps-toast-container"].forEach(id => document.getElementById(id)?.setAttribute("data-ps-theme", t));
    this.els.themeBtns?.forEach(b => { const on = b.dataset.theme === pref; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
    if (mq && !this._themeWatch) { this._themeWatch = true; mq.addEventListener?.("change", () => { if ((localStorage.getItem(CONFIG.KEYS.THEME) || "auto") === "auto") this.applyTheme(); }); }
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
        const b = document.createElement("button");
        b.type = "button"; b.className = "ps-update";
        b.innerHTML = `${psIcon("bell")}<span>新しいバージョン（v${Utils.escapeHtml(latestVer)}）があります。押すと更新ページを開きます</span>`;
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
    el.setAttribute("role", isError ? "alert" : "status");
    el.innerHTML = psIcon(isError ? "alert" : "check");
    const t = document.createElement("span"); t.textContent = message; el.appendChild(t);
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
      const kbd = document.getElementById("ps-modal-kbd");
      const opener = document.activeElement;

      titleEl.textContent = opts.title || "お知らせ";
      msgEl.textContent = opts.message || "";
      
      if (opts.isPrompt) {
        inputEl.style.display = "block";
        inputEl.placeholder = opts.placeholder || "";
        inputEl.value = "";
        kbd.style.display = "block";
      } else {
        inputEl.style.display = "none";
        kbd.style.display = "none";
      }

      btnCancel.style.display = opts.hideCancel ? "none" : "block";
      btnOk.textContent = opts.okText || "OK";
      btnCancel.textContent = opts.cancelText || "キャンセル";

      const onKey = ev => {
        if (ev.key === "Escape") { ev.preventDefault(); close(opts.hideCancel ? true : null); }
        else if (ev.key === "Enter" && (!opts.isPrompt || ev.ctrlKey || ev.metaKey) && !ev.isComposing) { ev.preventDefault(); btnOk.click(); }
      };
      const close = (val) => {
        overlay.removeEventListener("keydown", onKey);
        overlay.style.opacity = "0";
        modal.classList.remove("show");
        setTimeout(() => { overlay.style.display = "none"; if (opener && document.contains(opener)) opener.focus?.({ preventScroll: true }); resolve(val); }, 200);
      };

      btnCancel.onclick = () => close(null);
      btnOk.onclick = () => close(opts.isPrompt ? inputEl.value : true);
      overlay.addEventListener("keydown", onKey);

      overlay.style.display = "flex";
      setTimeout(() => {
        overlay.style.opacity = "1";
        modal.classList.add("show");
        (opts.isPrompt ? inputEl : btnOk).focus();
      }, 10);
    });
  }

  injectStyles() {
    const s = document.createElement("style");
    s.textContent = PS_STYLES;
    document.head.appendChild(s);
  }

  // ブランドの選択肢。colors.json のシート一覧が変わったときにも呼ばれる（表示中のブランドがなくなったら先頭へ）
  brandOptionsHTML() {
    return CONFIG.SHEETS.map(k => `<option value="${Utils.escapeHtml(k)}">${Utils.escapeHtml(k)}</option>`).join("") + `<option value="__search" hidden>全ブランドから検索中</option>`;
  }
  renderBrandOptions() {
    const s = this.store;
    if (!CONFIG.SHEETS.includes(s.currentBrand)) { s.currentBrand = CONFIG.SHEETS[0]; s.selectedUnit = ""; }
    this.els.brand.innerHTML = this.brandOptionsHTML();
    this.els.brand.value = s.searchQuery ? "__search" : s.currentBrand;
  }

  buildHTML() {
    const customId = localStorage.getItem(CONFIG.KEYS.ID) || "";
    const st = this.store;
    const segBtn = (id, label, on, title = "") => `<button type="button" id="${id}" class="${on ? "active" : ""}" aria-pressed="${on}" ${title ? `title="${title}"` : ""}>${label}</button>`;
    document.body.insertAdjacentHTML("beforeend", `<button type="button" id="ps-fab" class="ps-root" style="display:none;" title="Penlight Assistant を開く" aria-label="Penlight Assistant を開く">${psIcon("pen")}</button>
      <div id="ps-m" class="ps-root" role="dialog" aria-label="Penlight Assistant">
        <div id="ps-resize-handle" title="ドラッグしてサイズ変更"></div>
        <div class="ps-head">
          <span class="ps-title" title="Penlight Assistant (for MIX PENLa PRO)">Penlight Assistant<span class="ps-ver">v${CURRENT_VERSION}</span></span>
          <div class="ps-head-acts">
            <button type="button" id="ps-toggle-opt" class="ps-btn ps-btn-sm" aria-expanded="false" aria-controls="ps-opt-panel">${psIcon("gear")}設定</button>
            <button type="button" id="ps-minimize" class="ps-btn ps-btn-sm ps-btn-icon" title="小さくする" aria-label="小さくする">${psIcon("minus")}</button>
          </div>
        </div>
        <div id="ps-body">
          <div id="ps-opt-panel">
            <div class="ps-opt-head"><b>設定</b><button type="button" id="ps-opt-close" class="ps-btn ps-btn-sm">閉じる</button></div>
            <div class="ps-sec">
              <div class="ps-sec-title">ペンライト</div>
              <div class="ps-seg" role="radiogroup" aria-label="ペンライトの色数">
                <label><input type="radio" name="ps-pen-mode" value="361" ${st.penMode === "361" ? "checked" : ""}><span>361色</span></label>
                <label><input type="radio" name="ps-pen-mode" value="56" ${st.penMode === "56" ? "checked" : ""}><span>56色</span></label>
              </div>
              <label class="ps-check" title="スプシの特殊カラー（F〜H列）があるアイドルは、そちらの色で登録します"><input type="checkbox" class="ps-cb" id="ps-toggle-variant" ${st.showVariant ? "checked" : ""}>特殊色を使う<span class="ps-note">（特殊カラーがあるアイドルはその色で登録）</span></label>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">まとめ（色数が多いときに）</div>
              <div class="ps-merge" role="group" aria-label="まとめ方">
                ${CONFIG.MERGE_OPTIONS.map(o => `<button type="button" data-mopt="${o.id}" aria-pressed="false"><span class="ps-mlabel">${o.label}</span><span class="ps-mcount" data-mcount="${o.id}">-</span></button>`).join("")}
              </div>
              <div class="ps-hint" id="ps-merge-hint"></div>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">登録の順番</div>
              <div class="ps-seg" role="group" aria-label="登録の順番">
                ${segBtn("ps-sort-select", "選んだ順", st.sortMode === "select")}
                ${segBtn("ps-sort-code", "公式の順", st.sortMode === "code")}
                ${segBtn("ps-sort-preset", "カスタム", st.sortMode === "preset", "スプシのI列で指定した順")}
              </div>
              <div class="ps-note" id="ps-sort-note" style="display:none;"></div>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">一覧に出すもの</div>
              <div class="ps-sec-row">
                ${[["brand", "ブランド"], ["staff", "事務員"], ["unitcolor", "ユニット"]].map(([id, lbl]) => `<label class="ps-check"><input type="checkbox" class="ps-cb" id="ps-toggle-${id}" checked>${lbl}</label>`).join("")}
              </div>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">テーマ</div>
              <div class="ps-seg" role="group" aria-label="テーマ">
                ${[["auto", "自動"], ["dark", "ダーク"], ["light", "ライト"]].map(([k, l]) => `<button type="button" data-theme="${k}" aria-pressed="false">${l}</button>`).join("")}
              </div>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">リストの保存・読込</div>
              <div class="ps-sec-row" style="gap:6px;">
                <button type="button" id="ps-export" class="ps-btn" title="リストをコードにしてコピー">${psIcon("copy")}コードをコピー</button>
                <button type="button" id="ps-import" class="ps-btn" title="保存コードからリストを復元">${psIcon("load")}コードから読込</button>
              </div>
              <div class="ps-note">追加予定のリストを文字のコードにして、別の端末やあとで読み込めます。</div>
            </div>
            <div class="ps-sec">
              <div class="ps-sec-title">カラーデータ</div>
              <span id="ps-data-info" class="ps-note"></span>
              <label class="ps-note" for="ps-sheet-id">自分のスプレッドシートを使う（ID）</label>
              <div style="display:flex;gap:6px;"><input type="text" id="ps-sheet-id" class="ps-input" style="flex:1;min-width:0;" placeholder="空欄で標準のデータ" value="${Utils.escapeHtml(customId)}"><button type="button" id="ps-sheet-save" class="ps-btn ps-btn-primary">適用</button></div>
            </div>
          </div>
          <div id="ps-main">
            <div class="ps-queue">
              <div class="ps-qhead">
                <button type="button" id="ps-queue-toggle" aria-expanded="false" aria-controls="ps-queue-list">追加予定 <b id="ps-queue-count">0</b>名<span id="ps-queue-merged"></span><span id="ps-queue-arrow">${psIcon("chevron")}</span></button>
                <div class="ps-qacts">
                  <button type="button" id="ps-extract" class="ps-btn ps-btn-sm" title="出演者の一覧などを貼り付けて、複数名をまとめて追加">${psIcon("paste")}<span class="ps-ext-label">まとめて追加</span></button>
                  <button type="button" id="ps-clear-queue" class="ps-btn ps-btn-sm ps-btn-danger" title="追加予定をすべて外す">全クリア</button>
                </div>
              </div>
              <div class="ps-meter" id="ps-meter" aria-hidden="true"><i></i></div>
              <button type="button" id="ps-qdots" aria-label="追加予定を開いて確認する" title="追加予定を開いて確認する"></button>
              <div id="ps-limit" class="ps-limit" style="display:none;" role="alert"></div>
              <div id="ps-queue-list"></div>
              <div id="ps-qfoot">
                <span class="ps-qhint" id="ps-qhint" style="display:none;">${psIcon("grip")}ドラッグで並べ替えられます</span>
                <button type="button" class="ps-linkbtn" data-greset style="display:none;">公式の順に戻す</button>
                <button type="button" id="ps-qdone" class="ps-btn ps-btn-sm">${psIcon("chevron")}一覧に戻る</button>
              </div>
            </div>
            <div class="ps-tools">
              <select id="ps-b" class="ps-input" aria-label="ブランド">${this.brandOptionsHTML()}</select>
              <div class="ps-search">${psIcon("search")}<input type="search" id="ps-search" class="ps-input" placeholder="名前で検索" title="全ブランドから名前で検索" aria-label="全ブランドから名前で検索"></div>
              <button type="button" id="ps-reload" class="ps-btn ps-btn-icon" title="データを再読み込み" aria-label="データを再読み込み">${psIcon("refresh")}</button>
            </div>
            <div class="ps-subtools">
              <div id="ps-unit-chips"></div>
              <div class="ps-sel-acts"><button type="button" id="ps-sa" class="ps-btn ps-btn-sm ps-sel-btn" title="表示中の一覧をすべて選ぶ">全選択</button><button type="button" id="ps-ca" class="ps-btn ps-btn-sm ps-btn-quiet ps-sel-btn" title="表示中の一覧の選択を外す">全解除</button></div>
            </div>
            <div id="ps-l"><div class="ps-empty">読込中…</div></div>
          </div>
          <button type="button" id="ps-run" class="ps-btn ps-btn-primary">リストに追加する</button>
        </div>
      </div>

      <!-- モーダル・通知エリア -->
      <div id="ps-toast-container" class="ps-root"></div>
      <div id="ps-modal-overlay" class="ps-root">
        <div id="ps-modal" role="dialog" aria-modal="true" aria-labelledby="ps-modal-title">
          <div class="ps-modal-title" id="ps-modal-title"></div>
          <div class="ps-modal-msg" id="ps-modal-msg"></div>
          <textarea class="ps-modal-input" id="ps-modal-input" rows="4"></textarea>
          <div class="ps-modal-kbd" id="ps-modal-kbd">Ctrl（⌘）+ Enter でも決定できます</div>
          <div class="ps-modal-actions">
            <button type="button" class="ps-btn" id="ps-modal-cancel">キャンセル</button>
            <button type="button" class="ps-btn ps-btn-primary" id="ps-modal-ok">OK</button>
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
      mergeBtns: document.querySelectorAll("#ps-m [data-mopt]"), limit: get("ps-limit"), qMerged: get("ps-queue-merged"),
      sort: { select: get("ps-sort-select"), code: get("ps-sort-code"), preset: get("ps-sort-preset") },
      optBtn: get("ps-toggle-opt"), optPanel: get("ps-opt-panel"), optClose: get("ps-opt-close"), mergeHint: get("ps-merge-hint"), meter: get("ps-meter"),
      themeBtns: document.querySelectorAll("#ps-m [data-theme]"),
      sid: get("ps-sheet-id"), save: get("ps-sheet-save"), qTog: get("ps-queue-toggle"), qDots: get("ps-qdots"), qFoot: get("ps-qfoot"), chips: get("ps-unit-chips"),
      sa: get("ps-sa"), ca: get("ps-ca"), dataInfo: get("ps-data-info")
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
    
    // 設定は一覧の代わりに表示する（一覧が押しつぶされない）。閉じると元の画面に戻る
    const setOpt = open => { e.m.classList.toggle("opt-open", open); e.optBtn.setAttribute("aria-expanded", open); if (open) e.optPanel.scrollTop = 0; };
    e.optBtn.onclick = () => setOpt(!e.m.classList.contains("opt-open"));
    e.optClose.onclick = () => { setOpt(false); e.optBtn.focus(); };
    e.qTog.onclick = () => this.setQueueOpen(!this.isQueueOpen);
    e.qDots.onclick = () => this.setQueueOpen(true);
    e.qFoot.onclick = ev => {
      if (ev.target.closest("[data-greset]")) { s.groupOrder = []; this.renderQueue(); return; }   // 手で並べ替えたのをやめて、公式の順に戻す
      if (ev.target.closest("#ps-qdone")) { this.setQueueOpen(false); e.qTog.focus(); }
    };
    e.themeBtns.forEach(b => b.onclick = () => { localStorage.setItem(CONFIG.KEYS.THEME, b.dataset.theme); this.applyTheme(); });
    
    Object.entries(e.sort).forEach(([mode, btn]) => {
      btn.onclick = () => { s.setPref("sortMode", mode, "SORT"); Object.values(e.sort).forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", b === btn); }); this.renderQueue(); };
    });
    
    e.toggles.brand.onchange = ev => { s.showBrand = ev.target.checked; this.renderList(); };
    e.toggles.staff.onchange = ev => { s.showStaff = ev.target.checked; this.renderList(); };
    e.toggles.uc.onchange = ev => { s.showUnitColor = ev.target.checked; this.renderList(); };
    e.toggles.var.onchange = ev => { s.showVariant = ev.target.checked; this.renderQueue(); this.renderList(); };
    e.mergeBtns.forEach(btn => btn.onclick = () => this.applyMergeOption(CONFIG.MERGE_OPTIONS.find(o => o.id === btn.dataset.mopt)));
    e.limit.onclick = ev => { const id = ev.target.closest("[data-apply]")?.getAttribute("data-apply"); if (id) this.applyMergeOption(CONFIG.MERGE_OPTIONS.find(o => o.id === id)); };
    e.radios.forEach(r => r.onchange = ev => { if (ev.target.checked) { s.setPref("penMode", ev.target.value, "PEN"); this.updateMergeUI(); this.renderQueue(); this.renderList(); } });
    
    e.save.onclick = () => {
      const val = e.sid.value.trim();
      val ? localStorage.setItem(CONFIG.KEYS.ID, val) : localStorage.removeItem(CONFIG.KEYS.ID);
      this.showToast(val ? "カスタムIDを適用しました。\nデータを再取得します。" : "デフォルトに戻しました。\nデータを再取得します。");
      DataFetcher.clearCache();
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
    
    e.reload.onclick = () => { DataFetcher.clearCache(); s.cache = {}; this.app.loadData(true); };
    e.sa.onclick = () => { s.getVisibleList().forEach(it => { const key = `${it.brand}:${it.n}`; if (!s.selected.has(key)) s.selected.set(key, { ...it, selectOrder: ++s.counter }); }); this.renderQueue(); this.renderList(); };
    e.ca.onclick = () => { (s.searchQuery ? s.getVisibleList() : (s.cache[s.currentBrand] || [])).forEach(it => s.selected.delete(`${it.brand}:${it.n}`)); this.renderQueue(); this.renderList(); };
    e.clear.onclick = async () => {
      if (!s.selected.size) return;
      // 抽出したリストを誤タップで消さないよう、ある程度の人数なら確認する
      if (s.selected.size >= 5 && !(await this.openModal({ title: "追加予定を全クリア", message: `追加予定の${s.selected.size}名をすべて外します。よろしいですか？`, okText: "全クリア" }))) return;
      s.clearSelection(); this.renderQueue(); this.renderList();
    };

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

    // 並べ替え: まとめていないときは1人ずつ、まとめているときは、まとめた色（グループ）ごと
    const reorder = (dKey, tKey) => {
      if (dKey === tKey) return;
      if (s.mergeMode === "none") s.reorderSelection(dKey, tKey);
      else {
        if (s.sortMode !== "select") return;
        const keyOf = g => g.pen !== "--" ? `g:${g.pen}` : `${g.members[0].brand}:${g.members[0].n}`;
        const arr = (this.lastGroups || []).slice(), d = arr.findIndex(g => keyOf(g) === dKey), t = arr.findIndex(g => keyOf(g) === tKey);
        if (d < 0 || t < 0) return;
        arr.splice(t, 0, arr.splice(d, 1)[0]);
        s.groupOrder = [...new Set(arr.flatMap(g => g.pens || []))];
      }
      this.renderQueue();
    };
    let dragKey = null;
    e.qList.addEventListener("dragstart", ev => { if (s.sortMode !== "select") return; const it = ev.target.closest(".ps-drag-item"); if (it) { dragKey = it.getAttribute("data-key"); ev.dataTransfer.effectAllowed = "move"; setTimeout(() => it.classList.add("dragging"), 0); } });
    e.qList.addEventListener("dragover", ev => { if (s.sortMode === "select" && dragKey) { ev.preventDefault(); ev.dataTransfer.dropEffect = "move"; const it = ev.target.closest(".ps-drag-item"); if (it && it.getAttribute("data-key") !== dragKey) it.classList.add("drag-over"); } });
    e.qList.addEventListener("dragleave", ev => ev.target.closest(".ps-drag-item")?.classList.remove("drag-over"));
    e.qList.addEventListener("drop", ev => { if (s.sortMode === "select" && dragKey) { ev.preventDefault(); const it = ev.target.closest(".ps-drag-item"); if (it) { it.classList.remove("drag-over"); const tKey = it.getAttribute("data-key"); reorder(dragKey, tKey); } } });
    e.qList.addEventListener("dragend", ev => { ev.target.closest(".ps-drag-item")?.classList.remove("dragging"); dragKey = null; e.qList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over")); });
    e.qList.onclick = ev => {
      const delKey = ev.target.closest("button")?.getAttribute("data-del");
      if (delKey) { s.selected.delete(delKey); this.renderQueue(); this.renderList(); return; }
      if (ev.target.closest(".ps-drag-handle")) return;   // つまみを押しただけでは、グループを開かない
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
        reorder(touchDragKey, tKey);
      }
      if (touchDragItem) touchDragItem.classList.remove("dragging");
      touchDragKey = touchDragItem = lastDragOver = null;
    });

    e.ext.onclick = async () => {
      const input = await this.openModal({ title: "まとめて追加", message: "出演者の一覧など、名前が入った文章をそのまま貼り付けてください。\n見つかった人を全員、追加予定に入れます（区切りは改行・読点・スペースなど何でもOK）。", isPrompt: true, placeholder: "例：\n天海春香、如月千早、春日未来\n（公式サイトの出演者欄をコピーして貼り付けてもOK）", okText: "まとめて追加" });
      if (input) await this.extractFromText(input);
    };

    e.exp.onclick = () => {
      const data = s.getSortedSelectedList(this.site.getRankCalculator());
      if (!data.length) return this.showToast("エクスポートするリストがありません。", true);
      navigator.clipboard.writeText(btoa(encodeURIComponent(JSON.stringify({ showVariant: s.showVariant, penMode: s.penMode, items: data }))))
        .then(() => this.showToast("リストのコードをコピーしました。")).catch(() => this.showToast("コピーに失敗しました。", true));
    };

    e.imp.onclick = async () => {
      const str = await this.openModal({ title: "コードから読込", message: "「コードをコピー」で保存しておいたコードを貼り付けてください。\n今の追加予定は、読み込んだリストに置き換わります。", isPrompt: true, okText: "読み込む" });
      if (!str) return;
      try {
        const dec = JSON.parse(decodeURIComponent(atob(str)));
        const items = Array.isArray(dec) ? dec : (dec?.items || []);
        if (items.length) {
          if (!Array.isArray(dec)) { s.showVariant = !!dec.showVariant; e.toggles.var.checked = s.showVariant; s.setPref("penMode", dec.penMode || "361", "PEN"); e.radios.forEach(r => r.checked = r.value === s.penMode); }
          s.clearSelection();
          items.forEach(it => { if (it?.n && it?.brand) { s.counter = Math.max(s.counter, it.selectOrder || 0); s.selected.set(`${it.brand}:${it.n}`, it); } });
          this.renderQueue(); this.renderList(); 
          this.showToast("リストを読み込みました。");
        } else this.showToast("有効なデータが見つかりません。", true);
      } catch (err) { this.showToast("無効なコードです。", true); }
    };

    e.run.onclick = () => {
      if (this.app.running) { this.app.abortRequested = true; e.run.textContent = "中断しています..."; return; }
      this.app.executeAutoAdd();
    };
  }

  // 追加予定を開く／閉じる。開いているあいだは「確認モード」: 追加予定がアイドルの一覧の場所まで広がり、
  // 並べ替え・確認をスクロールせずにできる。閉じると一覧に戻り、追加予定は色の丸の列だけを出す
  setQueueOpen(open) {
    const e = this.els;
    this.isQueueOpen = open;
    e.m.classList.toggle("q-open", open);
    e.qTog.setAttribute("aria-expanded", open);
    e.qTog.title = open ? "閉じて一覧に戻る" : "追加予定を開いて確認する";
    this.renderQueue();
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
    const lbl = e.ext.querySelector(".ps-ext-label"), orig = lbl.textContent; lbl.textContent = "追加中…"; e.ext.disabled = true; let added = 0;
    try {
      await this.app.ensureAllLoaded();
      const addedNames = new Set([...s.selected.values()].map(it => it.n));
      const candidates = CONFIG.SHEETS.flatMap(sheet => (s.cache[sheet] || []).filter(it => it.role === "idol"))
        .flatMap(it => [it.n, ...(it.aliases || [])].map(name => ({ it, key: Utils.normalizeText(name) })))   // J列「別名」でも照合する
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
      if (added > 0 && !this.isQueueOpen) this.setQueueOpen(true);
      this.renderQueue(); this.renderList();
      const unmatched = isList ? tokens.filter(t => !candidates.some(c => t.key.includes(c.key))).map(t => t.raw) : [];
      if (unmatched.length) {
        await this.openModal({
          title: "見つからなかった名前があります",
          message: `${added}名を追加しました。\n\n以下の名前はスプレッドシートに見つかりませんでした（未登録・表記ゆれの可能性があります）：\n${unmatched.map(n => `・${n}`).join("\n")}`,
          hideCancel: true
        });
      } else if (added > 0) this.showToast(`${added}名をまとめて追加予定に入れました。`);
      else this.showToast("一致するアイドルが見つかりませんでした。", true);
    } catch (err) {
      this.showToast("まとめて追加の途中でエラーが発生しました。", true);
    } finally { lbl.textContent = orig; e.ext.disabled = false; }
    return added;
  }

  renderQueue() {
    const e = this.els, s = this.store;
    if (this.queueReady) s.saveSelection();   // 起動時の復元が終わるまでは保存しない（前回の分を空で上書きしないため）
    e.qCount.textContent = s.selected.size;
    const sortNote = this.els.m.querySelector("#ps-sort-note");   // まとめ中は、並び順の設定に関係なく公式の順になることを知らせる
    if (sortNote) {
      sortNote.style.display = s.mergeMode !== "none" && s.sortMode !== "code" ? "" : "none";
      sortNote.textContent = s.sortMode === "select" ? "まとめているときは、色の公式の順で並びます。追加予定の一覧でドラッグすると、まとめた色ごとに並べ替えられます。" : "まとめているときは、色の公式の順で登録します。";
    }
    if (!s.selected.size) {
      e.qMerged.textContent = ""; e.qMerged.className = ""; this.setMeter(0);
      e.qList.innerHTML = `<span class="ps-qempty">まだ選ばれていません。${this.isQueueOpen ? "「一覧に戻る」で" : "下の一覧で"}1人ずつ選ぶか、「まとめて追加」で出演者の一覧を貼り付けて一度に入れられます。</span>`;
      e.qDots.innerHTML = ""; e.qDots.classList.remove("has");
      const rs = e.qFoot.querySelector("[data-greset]"); if (rs) rs.style.display = "none";
      const qh = e.qFoot.querySelector("#ps-qhint"); if (qh) qh.style.display = "none";
      e.limit.style.display = "none"; this.renderMergeCounts(null); this.updateRunLabel(0, 0);
      return;
    }
    try {
      const rank = this.site.getRankCalculator();
      const sorted = s.getSortedSelectedList(rank);
      const groups = ColorGrouper.build(sorted, s, rank);

      // 色数と上限を常に表示（上限-5を超えたら黄、上限超えで赤）
      const colorCount = groups.filter(g => g.pen !== "--").length, max = CONFIG.MAX_COLORS;
      e.qMerged.textContent = `・ ${colorCount} / ${max}色`;
      e.qMerged.className = colorCount > max ? "over" : colorCount > max - 5 ? "near" : "ok";
      this.setMeter(colorCount);

      // 選択肢ごとの色数（設定画面のボタンに表示）と、上限を超えたときの案内
      const counts = this.mergeCounts(sorted, rank);
      this.renderMergeCounts(counts);
      if (colorCount > max) {
        const sug = this.suggestMerge(counts);
        e.limit.style.display = "block";
        e.limit.innerHTML = sug
          ? `${psIcon("alert")}<span>${max}色を超えています。</span><button type="button" class="ps-btn ps-btn-primary" data-apply="${sug.opt.id}">「${sug.opt.label}」でまとめる（${sug.count}色）</button>`
          : `${psIcon("alert")}<span>${max}色を超えています。まとめても収まらないので、選択を減らしてください。</span>`;
      } else e.limit.style.display = "none";
      this.updateRunLabel(colorCount, sorted.filter(it => s.getActivePen(it) !== "--").length);

      const merged = s.mergeMode !== "none";
      // 閉じているときに出す、登録される色の丸の列（登録される順）
      e.qDots.innerHTML = groups.map(g => {
        const rep = g.members.find(m => s.getActivePen(m) === g.pen) || g.members[0];
        return g.pen === "--" ? `<i class="skip"></i>` : `<i style="background:${Utils.safeColor(s.getActiveColor(rep))};"></i>`;
      }).join("");
      e.qDots.classList.add("has");
      const canDrag = s.sortMode === "select";   // まとめているときも「選んだ順」なら、まとめた色ごとに手で動かせる
      {
        // 下の段の左: 動かせるときは案内、まとめて手で並べ替えた後は「公式の順に戻す」（同じ場所で入れ替わる）
        const custom = merged && canDrag && (s.groupOrder || []).length > 0;
        const rs = e.qFoot.querySelector("[data-greset]"), qh = e.qFoot.querySelector("#ps-qhint");
        if (rs) rs.style.display = custom ? "" : "none";
        if (qh) qh.style.display = canDrag && !custom && groups.length > 1 ? "" : "none";
      }
      const gKeyOf = g => g.pen !== "--" ? `g:${g.pen}` : `${g.members[0].brand}:${g.members[0].n}`;
      this.lastGroups = groups;
      const handleHtml = () => `<span class="ps-drag-handle ${canDrag ? '' : 'disabled'}" title="${canDrag ? 'ドラッグして移動' : '並びが「選んだ順」以外のときは手で動かせません'}">${psIcon("grip")}</span>`;
      // dragKey: 並べ替えの単位のキー（まとめ中は「g:ペンラコード」）。null ならドラッグの対象にしない（グループの中身など）
      const badge = (it, withHandle, dragKey = `${it.brand}:${it.n}`) => {
        const aCol = Utils.safeColor(s.getActiveColor(it)), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
        const key = Utils.escapeHtml(`${it.brand}:${it.n}`), n = Utils.escapeHtml(it.n);
        const handle = withHandle ? handleHtml() : "";
        const drag = dragKey !== null, dk = drag ? Utils.escapeHtml(dragKey) : "";
        return `<span class="ps-badge ${drag ? 'ps-drag-item' : ''} ${isSkip ? 'skip' : ''}" ${drag ? `data-key="${dk}"` : ''} ${drag && canDrag ? 'draggable="true"' : ''}>${handle}<span class="ps-sw" style="background:${aCol};"></span><span class="ps-bname">${n}</span><span class="ps-code">${aPen}</span><button type="button" class="ps-del" data-del="${key}" title="外す" aria-label="${n}を外す">${psIcon("close")}</button></span>`;
      };

      // まとめなし: 1人ずつ（並べ替え可）
      if (!merged) { e.qList.innerHTML = sorted.map(it => badge(it, canDrag)).join(""); return; }

      // まとめあり: 登録される単位で表示。複数人のグループはタップで中身を開く（スマホでも確認できる）
      const manual = merged && s.sortMode === "select" && (s.groupOrder || []).length > 0;
      e.qList.innerHTML = groups.map(g => {
        if (g.members.length === 1) return badge(g.members[0], canDrag, gKeyOf(g));
        const rawKey = `${g.members[0].brand}:${g.members[0].n}`, open = this.openGroups.has(rawKey);
        const repItem = g.members.find(m => s.getActivePen(m) === g.pen) || g.members[0];
        // まとめた色も、単体と同じ形のボタンにする（どちらも「登録する1色」で対等なため）。
        // まとめていることは、どのボタンでも同じ位置に出す人数の印と、開く印（∨）で伝える。
        // 登録される名前（「天ヶ瀬冬馬ら3名」など）は、開いたときに出す
        // 名前はどのボタンも「代表1人（お気に入りがいればその人、いなければ先頭）」にそろえる。全員の名前は開いたとき・カーソルを乗せたときに出す
        const cnt = g.members.length, shown = (g.members.find(m => s.favorites.has(`${m.brand}:${m.n}`)) || g.members[0]).n;
        const tip = `${g.label ? g.label + "・" : ""}${cnt}名: ${g.members.map(m => m.n).join("、")}（押すと中を表示）`;
        return `<div class="ps-group ps-drag-item ${open ? 'open' : ''}" data-key="${Utils.escapeHtml(gKeyOf(g))}" ${canDrag ? 'draggable="true"' : ''}>
          <button type="button" class="ps-group-head" data-gtoggle="${Utils.escapeHtml(rawKey)}" aria-expanded="${open}" title="${Utils.escapeHtml(tip)}">
            ${canDrag ? handleHtml() : ""}<span class="ps-sw" style="background:${Utils.safeColor(s.getActiveColor(repItem))};"></span>
            <span class="ps-group-name">${Utils.escapeHtml(shown)}</span><span class="ps-code">${Utils.escapeHtml(g.pen)}</span>
            <span class="ps-gcount">${cnt}名</span>
            ${open && g.label ? `<span class="ps-group-label">${Utils.escapeHtml(g.label)}</span>` : ""}
            <span class="ps-group-chev">${psIcon("chevron")}</span>
          </button>
          ${open ? `<div class="ps-group-body"><div class="ps-group-title">登録される名前: <b>${Utils.escapeHtml(g.n)}</b></div>${g.members.map(m => badge(m, false, null)).join("")}</div>` : ""}
        </div>`;
      }).join("");
    } catch (err) {
      // 途中で失敗しても、選んだ人がいるのに「まだ選ばれていません」と出たままにしない
      console.error("Penlight Assistant: renderQueue failed", err);
      e.qList.innerHTML = `<span class="ps-qempty">${s.selected.size}名を選んでいますが、追加予定を表示できませんでした。拡張機能を最新版に入れ直してください（ファイルを一部だけ差し替えた場合に起きることがあります）。</span>`;
    }
  }

  // 追加予定の色数を、上限に対するバーで見せる
  setMeter(colorCount) {
    const m = this.els.meter; if (!m) return;
    const max = CONFIG.MAX_COLORS;
    m.firstElementChild.style.width = `${Math.min(100, colorCount / max * 100)}%`;
    m.classList.toggle("over", colorCount > max); m.classList.toggle("near", colorCount <= max && colorCount > max - 5);
  }

  // 設定画面の「まとめ」の各ボタンに、まとめた結果の色数を出す（未選択なら「-」）
  renderMergeCounts(counts) {
    this.els.m.querySelectorAll("[data-mcount]").forEach(el => {
      const c = counts?.find(x => x.opt.id === el.dataset.mcount);
      el.textContent = c ? `${c.count}色` : "-";
      el.classList.toggle("over", !!c && c.count > CONFIG.MAX_COLORS);
    });
  }

  // 実行ボタンに、登録される色数を出す（まとめて人数と違うときは人数も）
  updateRunLabel(colorCount, people) {
    if (this.app.running) return;
    const run = this.els.run, over = colorCount > CONFIG.MAX_COLORS;
    run.classList.toggle("over", over);
    run.textContent = !colorCount ? "リストに追加する"
      : over ? `${colorCount}色（上限${CONFIG.MAX_COLORS}色を超えています）`
      : `${colorCount}色をリストに追加${people !== colorCount ? `（${people}名）` : ""}`;
  }

  // 「その他」に、いま使っているカラーデータの種類と更新日時を出す（問い合わせ・確認用）
  updateDataInfo() {
    const el = this.els.dataInfo; if (!el) return;
    if (localStorage.getItem(CONFIG.KEYS.ID)) { el.textContent = "カラーデータ: カスタムのスプレッドシートから読込中"; return; }
    const d = DataFetcher.dataUpdatedAt ? new Date(DataFetcher.dataUpdatedAt) : null;
    el.textContent = d && !isNaN(d) ? `カラーデータ: ${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} 更新` : "カラーデータ: スプレッドシートから直接読込中";
  }

  renderUnitChips() {
    if (this.store.searchQuery) { this.els.chips.style.display = "none"; return; } // 検索中はブランド別のユニットは出さない
    const units = this.store.getUnits();
    if (!units.length) { this.els.chips.style.display = "none"; this.els.chips.innerHTML = ""; this.store.selectedUnit = ""; return; }
    this.els.chips.style.display = "flex";
    this.els.chips.innerHTML = `<button type="button" class="ps-chip ${!this.store.selectedUnit ? 'active' : ''}" data-unit="" aria-pressed="${!this.store.selectedUnit}">全て</button>` + units.map(u => {
      const eU = Utils.escapeHtml(u), on = this.store.selectedUnit === u; return `<button type="button" class="ps-chip ${on ? 'active' : ''}" data-unit="${eU}" aria-pressed="${on}">${eU}</button>`;
    }).join("");
    this.els.chips.querySelectorAll(".ps-chip").forEach(c => c.onclick = () => { this.store.selectedUnit = c.getAttribute("data-unit"); this.renderUnitChips(); this.renderList(); });
  }

  renderList() {
    const list = this.store.getVisibleList(), s = this.store;
    if (!list.length) { this.els.list.innerHTML = `<div class="ps-empty">一致する項目がありません。${s.searchQuery ? "名前の一部だけでも検索できます。" : ""}</div>`; return; }
    const searching = !!s.searchQuery;
    let lastBrand = null;
    this.els.list.innerHTML = list.map(it => {
      let head = "";
      if (searching && it.brand !== lastBrand) { lastBrand = it.brand; head = `<div class="ps-brand-head">${Utils.escapeHtml(it.brand)}</div>`; }
      const aCol = Utils.safeColor(s.getActiveColor(it)), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
      const key = `${it.brand}:${it.n}`, escKey = Utils.escapeHtml(key), n = Utils.escapeHtml(it.n);
      const isChk = s.selected.has(key), isFav = s.favorites.has(key);
      const tag = it.role === "brand" ? `<span class="ps-tag ps-tag-brand">ブランド</span>` : it.role === "staff" ? `<span class="ps-tag ps-tag-staff">事務員</span>` : it.role === "unit_color" ? `<span class="ps-tag ps-tag-unit">ユニット</span>` : "";
      const uTag = it.unit && !CONFIG.EXCLUDE_ROLES.includes(it.unit) && it.role === "idol" && !it.n.includes(it.unit) ? `<span class="ps-utag">${Utils.escapeHtml(it.unit)}</span>` : "";
      const star = `<button type="button" class="ps-star-btn ${isFav ? 'active' : ''}" data-fav="${escKey}" title="${isFav ? 'ピン留めを外す' : '推しをピン留め（一覧の上に表示）'}" aria-label="${n}をピン留め" aria-pressed="${isFav}">${psIcon("star")}</button>`;
      return head + `<div class="ps-row ${isChk ? 'selected' : ''} ${isSkip ? 'skip' : ''}" data-rowkey="${escKey}"><input type="checkbox" data-key="${escKey}" class="ps-k" aria-label="${n}" ${isChk ? "checked" : ""} ${isSkip ? 'disabled title="ペンラコードが未設定です"' : ''}>${star}<span class="ps-swatch" style="background:${aCol};"></span><span class="ps-name-label" data-key="${escKey}">${n}${tag}${uTag}</span><span class="ps-pen ${isSkip ? 'none' : ''}">${aPen}</span></div>`;
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
      // ★ 起動時にURLパラメータ（?auto_cast=... や &special=1）があれば自動実行。なければ、前回の追加予定を戻す
      const fromUrl = await this.checkUrlAutoExtract();
      if (!fromUrl) await this.restoreSelection();
      this.ui.queueReady = true; this.ui.renderQueue();
    }
  }
  async loadData(force = false) {
    if (!this.store.cache[this.store.currentBrand] || force) {
      this.ui.els.list.innerHTML = `<div class="ps-empty">${force ? '再取得中…' : '読込中…'}</div>`;
      this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, force);
      // colors.json のブランド一覧が変わっていたら、選択肢を作り直す
      if (DataFetcher.sheetsChanged) {
        DataFetcher.sheetsChanged = false;
        const before = this.store.currentBrand;
        this.ui.renderBrandOptions();
        if (this.store.currentBrand !== before) this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, false);
      }
    }
    this.ui.renderUnitChips(); this.ui.renderList(); this.ui.updateDataInfo();
    if (DataFetcher.lastError && !this.store.cache[this.store.currentBrand]?.length) {
      this.store.cache[this.store.currentBrand] = null; // 次回また取得を試みる
      this.ui.els.list.innerHTML = `<div class="ps-empty err">データを取得できませんでした。通信状況を確認して、検索欄の右の再読み込みボタンで試してください。</div>`;
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
  // 前回（12時間以内）の追加予定を戻す。カラーデータは最新のものを使う
  async restoreSelection() {
    const keys = this.store.loadSavedSelection();
    if (!keys.length) return;
    await this.ensureAllLoaded();
    let restored = 0;
    keys.forEach(key => { const it = this.store.findItem(key); if (it && !this.store.selected.has(key)) { this.store.selected.set(key, { ...it, selectOrder: ++this.store.counter }); restored++; } });
    if (!restored) return;
    this.ui.renderQueue(); this.ui.renderList();
    this.ui.showToast(`前回の追加予定（${restored}名）を戻しました。\n不要なら「全クリア」で消せます。`);
  }
  // ★ NotionからのURLパラメータ（?auto_cast=... および &special=1）を受け取り、特殊色トグルON＆自動抽出を実行する処理
  async checkUrlAutoExtract() {
    try {
      const urlObj = new URL(window.location.href);
      const castParam = urlObj.searchParams.get("auto_cast") || urlObj.searchParams.get("cast");
      const isSpecial = urlObj.searchParams.get("special") === "1" || urlObj.searchParams.get("special") === "true";

      if (!castParam && !isSpecial) return false;

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

      if (!castParam) return false;

      // 2. 抽出処理を直接実行（モーダルを経由しないので待ち時間に左右されない）
      //    別のライブのURLから来たので、前回の追加予定は戻さない
      this.store.forgetSavedSelection();
      await this.ui.extractFromText(castParam);
      return true;
    } catch (e) {
      console.error("Penlight Assistant: Auto extract failed", e);
    }
    return false;
  }
  async executeAutoAdd() {
    const rank = this.siteAdapter.getRankCalculator();
    const targets = this.store.getSortedSelectedList(rank);
    if (!targets.length) return this.ui.showToast("メンバーを選択してください", true);
    this.ui.els.run.disabled = true; this.siteAdapter.buildCache();

    const pTargets = ColorGrouper.build(targets, this.store, rank);
    const validCount = pTargets.filter(g => g.pen !== "--").length;
    if (validCount > CONFIG.MAX_COLORS) {
      const sug = this.ui.suggestMerge(this.ui.mergeCounts(targets, rank));
      const tip = sug ? `設定の「まとめ」を「${sug.opt.label}」にすると、${sug.count}色になり上限に収まります。` : "まとめても上限に収まらないので、選択メンバーを減らしてください。";
      await this.ui.openModal({
        title: "登録できる色数を超えています",
        message: `一度に登録できるのは「${CONFIG.MAX_COLORS}色」までです。\n（現在: ${validCount}色 追加予定）\n\n※${tip}`,
        hideCancel: true
      });
      this.ui.els.run.disabled = false;
      return;
    }

    // 公式サイトのカラーボタンが1つも見つからないときは、始めずに知らせる（読み込み途中・サイトの仕様変更）
    if (!this.siteAdapter.btnCache.size) {
      await this.ui.openModal({
        title: "カラーボタンが見つかりません",
        message: "公式サイトのペンライトのカラーボタンが見つかりませんでした。\n\nページの読み込みが終わってから、もう一度押してください。\n何度やっても同じ場合は、公式サイトの仕様が変わった可能性があります。",
        hideCancel: true
      });
      this.ui.els.run.disabled = false;
      return;
    }

    // 登録前の確認（まとめると情報が減るので、実際に登録される内容を見せる）。ボタンが見つからないコードも先に知らせる
    const noBtn = g => g.pen !== "--" && !this.siteAdapter.getButton(g.pen);
    const lines = pTargets.map(g => g.pen === "--" ? `・${g.n}（コード未設定のためスキップ）` : noBtn(g) ? `・${g.n}（${g.pen}：公式サイトにボタンがないためスキップ）` : `・${g.n}（${g.pen}${g.members.length > 1 ? `／${g.members.length}名` : ""}）`);
    const addCount = pTargets.filter(g => g.pen !== "--" && !noBtn(g)).length;
    const ok = await this.ui.openModal({
      title: "登録内容の確認",
      message: `以下の${addCount}色を公式サイトに追加します。\n\n${lines.join("\n")}`,
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
        run.textContent = `中断する（${i + 1}/${pTargets.length}）${it.n.substring(0, 12)}${it.n.length > 12 ? "…" : ""}`;
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
      this.ui.showToast(`登録が完了しました（${count}色）`);
    }
    // スマホではパネルが画面を覆うので、完了後は自動で縮めて公式サイトの結果を見せる
    if (!aborted && window.matchMedia?.("(max-width: 768px)").matches) this.ui.els.min.click();
    setTimeout(() => {
      if (this.running) return;
      this.ui.renderQueue();   // 実行ボタンの表示を、登録される色数に戻す
      if (!aborted && count) this.store.forgetSavedSelection();   // 登録が終わった分は、次に開いたときに戻さない
    }, 2000);
  }
}


// 起動（二重読み込み防止）
if (!window.__psHelperLoaded) {
  window.__psHelperLoaded = true;
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => new App().init()) : setTimeout(() => new App().init(), 500);
}

})();
