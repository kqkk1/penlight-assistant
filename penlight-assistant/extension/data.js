/**
 * Penlight Assistant (for MIX PENLa PRO) - data.js
 * データと状態
 * Store: 選択状態・設定の保存 / DataFetcher: スプシ取得とキャッシュ
 */
"use strict";

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
