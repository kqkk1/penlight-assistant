/**
 * Penlight Supporter Helper (for MIX PENLa PRO-361)
 * Smart Timestamp & Highly Optimized - v3.5.0 
 */
(() => {
  "use strict";

  // ==========================================================================
  // 1. Constants & Configuration
  // ==========================================================================
  const CONFIG = {
    DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
    SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
    FAV_STORAGE_KEY: "ps_fav_idols_v2",
    CUSTOM_ID_KEY: "ps_custom_sheet_id",
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    GROUP_ORDER: { R: 1, P: 2, V: 3, B: 4, GB: 5, G: 6, Y: 7, O: 8, W: 9, H: 10, D: 11 },
    EXCLUDE_ROLES: ["ブランド", "事務員", "ユニット"]
  };

  // ==========================================================================
  // 2. Utility Tools
  // ==========================================================================
  const Utils = {
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    escapeHtml: (str) => String(str || "").replace(/[&<>"']/g, m => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[m])),
    simulateClick: (el) => {
      if (!el) return;
      const opts = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new PointerEvent("pointerdown", opts));
      el.dispatchEvent(new MouseEvent("mousedown", opts));
      el.dispatchEvent(new PointerEvent("pointerup", opts));
      el.dispatchEvent(new MouseEvent("mouseup", opts));
      el.click();
    },
    setInputValue: (input, value) => {
      if (!input) return;
      try {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    parseCSV: (text) => {
      const rows = [];
      let row = [], cur = "", inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i], next = text[i + 1];
        if (c === '"') {
          if (inQuotes && next === '"') { cur += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (c === ',' && !inQuotes) {
          row.push(cur.trim()); cur = "";
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
          if (c === '\r' && next === '\n') i++;
          row.push(cur.trim());
          if (row.some(x => x !== "")) rows.push(row);
          row = []; cur = "";
        } else {
          cur += c;
        }
      }
      if (cur !== "" || row.length > 0) {
        row.push(cur.trim());
        if (row.some(x => x !== "")) rows.push(row);
      }
      return rows;
    }
  };

  // ==========================================================================
  // 3. Store (State Management)
  // ==========================================================================
  class Store {
    constructor() {
      this.cache = {}; 
      this.selected = new Map();
      this.counter = 0;
      this.showBrand = true;
      this.showStaff = true;
      this.showUnitColor = true;
      this.showVariant = false; 
      this.sortMode = "select";
      this.searchQuery = "";
      this.selectedUnit = "";
      this.currentBrand = CONFIG.SHEETS[0];
      this.favorites = new Set(JSON.parse(localStorage.getItem(CONFIG.FAV_STORAGE_KEY) || "[]"));
    }

    getActiveColor(it) { return (this.showVariant && it.c_v) ? it.c_v : (it.c || '#fff'); }
    getActivePen(it) { return (this.showVariant && it.p_v) ? it.p_v : it.p; }

    toggleFavorite(key) {
      this.favorites.has(key) ? this.favorites.delete(key) : this.favorites.add(key);
      localStorage.setItem(CONFIG.FAV_STORAGE_KEY, JSON.stringify(Array.from(this.favorites)));
    }

    toggleSelection(key, item) {
      if (this.selected.has(key)) {
        this.selected.delete(key);
      } else {
        this.selected.set(key, { ...item, selectOrder: ++this.counter });
      }
    }

    clearSelection() {
      this.selected.clear();
      this.counter = 0;
    }

    reorderSelection(draggedKey, targetKey) {
      if (this.sortMode !== "select") return;
      const arr = Array.from(this.selected.values()).sort((a, b) => (a.selectOrder || 0) - (b.selectOrder || 0));
      const draggedIdx = arr.findIndex(it => `${it.brand}:${it.n}` === draggedKey);
      const targetIdx = arr.findIndex(it => `${it.brand}:${it.n}` === targetKey);

      if (draggedIdx < 0 || targetIdx < 0) return;
      const [draggedItem] = arr.splice(draggedIdx, 1);
      arr.splice(targetIdx, 0, draggedItem);
      arr.forEach((it, idx) => it.selectOrder = idx + 1);
      this.counter = arr.length;
    }

    getVisibleList() {
      const list = this.cache[this.currentBrand] || [];
      const query = this.searchQuery;
      
      return list.filter(it => {
        if (it.role === "brand" && !this.showBrand) return false;
        if (it.role === "staff" && !this.showStaff) return false;
        if (it.role === "unit_color" && !this.showUnitColor && (!this.selectedUnit || it.unit !== this.selectedUnit)) return false;
        if (this.selectedUnit && it.unit !== this.selectedUnit) return false;
        if (query && !it.n.toLowerCase().includes(query)) return false;
        return true;
      }).sort((a, b) => {
        const getPriority = (item) => {
          if (this.favorites.has(`${item.brand}:${item.n}`)) return 50;
          if (item.role === "brand") return 40;
          if (item.role === "staff") return 30;
          if (item.role === "unit_color") return 20;
          return 0;
        };
        const diff = getPriority(b) - getPriority(a);
        return diff !== 0 ? diff : (a.rawIndex || 0) - (b.rawIndex || 0);
      });
    }

    getSortedSelectedList(rankCalculator) {
      const arr = Array.from(this.selected.values());
      return this.sortMode === "code"
        ? arr.sort((a, b) => rankCalculator(this.getActivePen(a)) - rankCalculator(this.getActivePen(b)))
        : arr.sort((a, b) => (a.selectOrder || 0) - (b.selectOrder || 0));
    }

    getUnits() {
      return Array.from(new Set((this.cache[this.currentBrand] || [])
        .map(it => it.unit)
        .filter(u => u && !CONFIG.EXCLUDE_ROLES.includes(u))
      ));
    }
  }

  // ==========================================================================
  // 4. DataFetcher
  // ==========================================================================
  class DataFetcher {
    static getTargetSpreadsheetId() {
      return localStorage.getItem(CONFIG.CUSTOM_ID_KEY) || CONFIG.DEFAULT_SPREADSHEET_ID;
    }

    static async fetch(sheetName, force = false) {
      const cacheKey = `ps_cache_${sheetName}`;
      if (!force) {
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey));
          if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_EXPIRY) return cached.data;
        } catch (e) {}
      }

      try {
        const targetId = this.getTargetSpreadsheetId();
        const url = `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");
        const rows = Utils.parseCSV(await res.text());
        if (rows.length <= 1) return [];

        const items = [];
        const seen = new Set();
        const nameCount = {};

        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i];
          if (cols.length < 3) continue;

          let name = cols[0] ? cols[0].replace(/^"|"$/g, "").trim() : "";
          const c_norm = cols[1] ? cols[1].replace(/^"|"$/g, "").trim() : "";
          const p_normRaw = cols[2] ? cols[2].replace(/^"|"$/g, "").trim() : "";
          const unit = cols[3] ? cols[3].replace(/^"|"$/g, "").trim() : "";

          const c_var = cols[4] ? cols[4].replace(/^"|"$/g, "").trim() : "";
          const p_varRaw = cols[5] ? cols[5].replace(/^"|"$/g, "").trim() : "";

          if (sheetName !== "765AS" && name === "天海春香" && items.length === 0) return [];
          if (sheetName === "876" && name.includes("秋月涼")) name = "秋月涼";

          const p_normMatch = p_normRaw.match(/[A-Za-z]+[0-9]+(?:-[0-9]+)?/);
          const p_norm = p_normMatch ? p_normMatch[0].toUpperCase() : p_normRaw.replace(/\s*△.*/, "").trim();

          const p_varMatch = p_varRaw.match(/[A-Za-z]+[0-9]+(?:-[0-9]+)?/);
          const p_var = p_varMatch ? p_varMatch[0].toUpperCase() : p_varRaw.replace(/\s*△.*/, "").trim();

          if (name && p_norm && !seen.has(name)) {
            // D列や名前から役割を自動判定
            let role = "idol";
            if (/ブランド/.test(unit) || /ブランド|プロ|プロダクション|学園/i.test(name)) {
              role = "brand";
            } else if (/事務員/.test(unit) || /事務員|小鳥|美咲|ちひろ|はづき|山村|亜紗里|社長/i.test(name)) {
              role = "staff";
            } else if (/ユニット|色|カラー/.test(unit) || /ユニット|色|カラー/i.test(name)) {
              role = "unit_color";
            }

            if (!nameCount[name]) nameCount[name] = 0;
            nameCount[name]++;
            seen.add(name);

            items.push({ 
              n: name, 
              c: c_norm, 
              p: p_norm, 
              c_v: c_var, 
              p_v: p_var, 
              brand: sheetName, 
              role, 
              unit, 
              rawIndex: i 
            });
          }
        }

        items.forEach(it => {
          it.isVariant = false; 
          it.hasVariant = !!(it.c_v && it.p_v); 
        });

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: items }));
        return items;
      } catch (e) {
        console.error(`[PS-Helper] Fetch failed for [${sheetName}]:`, e);
        return [];
      }
    }
  }

  // ==========================================================================
  // 5. SiteAdapter
  // ==========================================================================
  class SiteAdapter {
    constructor() {
      this.btnCache = new Map();
      this.indexMap = new Map();
      this.observer = null;
      this.cacheTimer = null;
    }

    startObserving() {
      if (this.observer) return;
      this.observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
          if (this.cacheTimer) clearTimeout(this.cacheTimer);
          this.cacheTimer = setTimeout(() => this.buildCache(), 300);
        }
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    }

    buildCache() {
      this.btnCache.clear();
      this.indexMap.clear();
      document.querySelectorAll("button[title]").forEach(btn => {
        const title = (btn.getAttribute("title") || "").trim();
        const match = title.match(/^#(\d+)\s+([A-Z0-9\-]+)/i);
        if (match) {
          const code = match[2].toUpperCase();
          this.indexMap.set(code, parseInt(match[1], 10));
          this.btnCache.set(code, btn);
        }
      });
    }

    getButton(code) {
      if (this.btnCache.size === 0) this.buildCache();
      const cleanCode = (code || "").trim().toUpperCase();
      let btn = this.btnCache.get(cleanCode);
      if (!btn || !document.body.contains(btn)) {
        this.buildCache();
        btn = this.btnCache.get(cleanCode);
      }
      return btn || null;
    }

    getRankCalculator() {
      return (codeStr) => {
        const code = (codeStr || "").trim().toUpperCase();
        if (this.indexMap.size === 0) this.buildCache();
        if (this.indexMap.has(code)) return this.indexMap.get(code);
        const m = code.match(/^([A-Z]+)(\d+)?(?:-(\d+))?/);
        if (!m) return 99999;
        return (CONFIG.GROUP_ORDER[m[1]] || 90) * 10000 + (parseInt(m[2] || "0", 10) * 100) + parseInt(m[3] || "0", 10);
      };
    }

    getSiteInputs() {
      const container = document.getElementById("ps-m");
      return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'))
        .filter(x => container ? !container.contains(x) : true);
    }

    getEditButtons() {
      const container = document.getElementById("ps-m");
      return Array.from(document.querySelectorAll('button[aria-label="タイトルを編集"]'))
        .filter(x => container ? !container.contains(x) : true);
    }
  }

  // ==========================================================================
  // 6. UIManager
  // ==========================================================================
  class UIManager {
    constructor(app, store, siteAdapter) {
      this.app = app;
      this.store = store;
      this.site = siteAdapter;
      this.isMin = false;
      this.savedHeight = "";
      this.isQueueOpen = false;
      this.els = {};
    }

    inject() {
      if (document.getElementById("ps-m")) return false;
      this.injectStyles();
      this.buildHTML();
      this.cacheElements();
      this.bindEvents();
      return true;
    }

    injectStyles() {
      const style = document.createElement("style");
      style.textContent = `
        #ps-m { position:fixed; top:18px; right:18px; width:500px; height:750px; min-width:280px; min-height:240px; max-width:90vw; max-height:94vh; background:#1a1b26; color:#c0caf5; border-radius:10px; box-shadow:0 12px 32px rgba(0,0,0,0.85); z-index:999999999; padding:12px; display:flex; flex-direction:column; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; font-size:12px; border:1px solid #7aa2f7; box-sizing:border-box; }
        #ps-m * { box-sizing:border-box; }
        #ps-resize-handle { position:absolute; left:0; bottom:0; width:16px; height:16px; cursor:nesw-resize; z-index:10; display:flex; align-items:flex-end; justify-content:flex-start; padding:2px; }
        #ps-resize-handle::after { content:""; width:6px; height:6px; border-left:2px solid #565f89; border-bottom:2px solid #565f89; pointer-events:none; }
        #ps-resize-handle:hover::after { border-color:#7aa2f7; }
        #ps-fab { position:fixed; bottom:24px; right:24px; width:48px; height:48px; background:#7aa2f7; color:#15161e; border-radius:50%; box-shadow:0 8px 16px rgba(0,0,0,0.6); z-index:999999999; display:flex; justify-content:center; align-items:center; cursor:pointer; font-size:24px; user-select:none; transition:transform 0.15s ease, filter 0.15s ease; border: 2px solid #1a1b26; }
        #ps-fab:hover { transform:scale(1.1); filter:brightness(1.1); }
        .ps-btn { padding:4px 8px; border:none; border-radius:4px; cursor:pointer; font-size:11px; background:#24283b; color:#a9b1d6; transition:0.12s ease; user-select:none; }
        .ps-btn:hover { filter:brightness(1.2); color:#fff; }
        .ps-btn-primary { background:#7aa2f7; color:#15161e; font-weight:bold; }
        .ps-btn-primary:hover { background:#89b4fa; color:#15161e; }
        .ps-input { background:#1f2335; color:#fff; border:1px solid #3b4261; border-radius:4px; padding:5px 8px; font-size:11px; outline:none; }
        .ps-input:focus { border-color:#7aa2f7; }
        .ps-tag-brand { font-size:9px; color:#7aa2f7; background:#1f293d; border:1px solid #3d59a1; padding:1px 4px; border-radius:3px; margin-left:4px; }
        .ps-tag-staff { font-size:9px; color:#9ece6a; background:#1e2d24; border:1px solid #41a6b5; padding:1px 4px; border-radius:3px; margin-left:4px; }
        .ps-tag-unit { font-size:9px; color:#ff9e64; background:#2d201a; border:1px solid #8f5a34; padding:1px 4px; border-radius:3px; margin-left:4px; font-weight:bold; }
        .ps-row { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:4px; transition:0.1s; user-select:none; }
        .ps-row:hover { background:#24283b; }
        .ps-row.selected { background:#1e2538; }
        .ps-k { cursor:pointer; flex-shrink:0; }
        .ps-badge { display:inline-flex; align-items:center; gap:3px; background:#24283b; border:1px solid #414868; padding:2px 6px; border-radius:3px; font-size:11px; }
        .ps-star-btn { background:none; border:none; font-size:14px; line-height:1; cursor:pointer; padding:0 4px; color:#565f89; flex-shrink:0; transition:transform 0.12s,color 0.12s; }
        .ps-star-btn:hover { transform:scale(1.2); color:#e0af68; }
        .ps-star-btn.active { color:#e0af68 !important; text-shadow:0 0 6px rgba(224,175,104,0.5); }
        .ps-chip { padding:2px 7px; border-radius:10px; font-size:10px; cursor:pointer; background:#1f2335; color:#9aa5ce; border:1px solid #3b4261; white-space:nowrap; user-select:none; transition:0.12s; }
        .ps-chip:hover { background:#24283b; color:#fff; }
        .ps-chip.active { background:#7aa2f722; color:#7aa2f7; border-color:#7aa2f7; font-weight:bold; }
        .ps-drag-item { transition: transform 0.1s, opacity 0.1s; }
        .ps-drag-item.dragging { opacity: 0.4; transform: scale(0.95); }
        .ps-drag-item.drag-over { border: 1px dashed #7aa2f7; filter: brightness(1.3); }
        .ps-drag-handle { cursor: grab; padding-right: 4px; color: #565f89; user-select: none; }
        .ps-drag-handle:active { cursor: grabbing; }
      `;
      document.head.appendChild(style);
    }

    buildHTML() {
      const brandOptions = CONFIG.SHEETS.map(k => `<option value="${k}">${k}</option>`).join("");
      const customId = localStorage.getItem(CONFIG.CUSTOM_ID_KEY) || "";

      const fab = document.createElement("div");
      fab.id = "ps-fab";
      fab.style.display = "none";
      fab.innerHTML = "✨";
      fab.title = "アシストを開く";
      document.body.appendChild(fab);

      const m = document.createElement("div");
      m.id = "ps-m";
      m.innerHTML = `
        <div id="ps-resize-handle" title="ドラッグしてサイズ変更"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2f3549;flex-shrink:0;">
          <b style="font-size:13px;color:#7aa2f7;">PRO-361 入力アシスト</b>
          <div style="display:flex;gap:4px;align-items:center;">
            <button id="ps-toggle-opt" class="ps-btn" style="padding:2px 7px;font-size:12px;" title="設定を開く">⚙</button>
            <button id="ps-minimize" class="ps-btn" style="padding:2px 8px;font-size:12px;" title="最小化して隠す">ー</button>
          </div>
        </div>
        <div id="ps-body" style="display:flex;flex-direction:column;gap:6px;flex:1;overflow:hidden;">
          <div id="ps-opt-panel" style="display:none;background:#1f2335;border:1px solid #3b4261;border-radius:6px;padding:6px 8px;flex-direction:column;gap:5px;flex-shrink:0;">
            <div style="display:flex;justify-content:flex-start;align-items:center;flex-wrap:wrap;gap:12px;padding:0 4px;">
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-brand" checked style="accent-color:#7aa2f7;"><span>ブランド色</span></label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-staff" checked style="accent-color:#9ece6a;"><span>事務員</span></label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-unitcolor" checked style="accent-color:#ff9e64;"><span>ユニット色</span></label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-variant" style="accent-color:#e0af68;"><span>特殊色</span></label>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;border-top:1px solid #2f3549;padding-top:4px;margin-top:2px;">
              <span style="color:#9aa5ce;">追加順:</span>
              <div style="display:flex;gap:4px;">
                <button id="ps-sort-select" class="ps-btn ps-btn-primary" style="padding:2px 8px;font-size:10px;">選択順</button>
                <button id="ps-sort-code" class="ps-btn" style="padding:2px 8px;font-size:10px;">361色公式順</button>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;border-top:1px solid #2f3549;padding-top:4px;">
              <span style="color:#9aa5ce;flex-shrink:0;margin-right:6px;">スプシID:</span>
              <div style="display:flex;gap:4px;width:100%;">
                <input type="text" id="ps-sheet-id" class="ps-input" style="flex:1;padding:3px 6px;font-size:10px;" placeholder="空欄でデフォルトを使用" value="${Utils.escapeHtml(customId)}">
                <button id="ps-sheet-save" class="ps-btn ps-btn-primary" style="padding:2px 8px;font-size:10px;">適用</button>
              </div>
            </div>
          </div>
          <div style="background:#13141c;border:1px solid #2f3549;border-radius:6px;padding:5px 8px;flex-shrink:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span id="ps-queue-toggle" style="font-size:11px;color:#7dcfff;cursor:pointer;user-select:none;">追加予定: <b id="ps-queue-count">0</b>名 <span id="ps-queue-arrow" style="font-size:9px;color:#9aa5ce;">▾</span></span>
              <div style="display:flex;gap:4px;">
                <button id="ps-extract" class="ps-btn" style="padding:2px 6px;font-size:9px;background:#3d59a1;color:#fff;" title="画像やサイトのテキストから自動抽出">📋自動抽出</button>
                <button id="ps-import" class="ps-btn" style="padding:2px 6px;font-size:9px;">読込</button>
                <button id="ps-export" class="ps-btn" style="padding:2px 6px;font-size:9px;">保存</button>
                <button id="ps-clear-queue" style="background:none;border:none;color:#f7768e;cursor:pointer;font-size:10px;margin-left:4px;">全クリア</button>
              </div>
            </div>
            <div id="ps-queue-list" style="display:none;flex-wrap:wrap;gap:4px;max-height:180px;overflow-y:auto;margin-top:5px;padding-top:5px;border-top:1px dashed #2f3549;"></div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            <select id="ps-b" class="ps-input" style="flex:1;">${brandOptions}</select>
            <input type="text" id="ps-search" class="ps-input" placeholder="名前検索(Escでクリア)..." style="width:130px;">
            <button id="ps-reload" class="ps-btn" title="再取得・キャッシュクリア" style="padding:4px 8px;">↻</button>
          </div>
          <div id="ps-unit-chips" style="display:none;flex-wrap:nowrap;overflow-x:auto;gap:4px;padding:2px 0;flex-shrink:0;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 2px;flex-shrink:0;">
            <span style="font-size:10px;color:#565f89;">選択操作:</span>
            <div style="display:flex;gap:4px;">
              <button id="ps-sa" class="ps-btn" style="padding:2px 8px;font-size:10px;">全選択</button>
              <button id="ps-ca" class="ps-btn" style="padding:2px 8px;font-size:10px;">全解除</button>
            </div>
          </div>
          <div id="ps-l" style="flex:1;overflow-y:auto;background:#13141c;padding:4px;border-radius:4px;min-height:75px;">読込中...</div>
          <button id="ps-run" class="ps-btn ps-btn-primary" style="width:100%;padding:8px;font-size:12px;flex-shrink:0;">リストに追加する</button>
        </div>
      `;
      document.body.appendChild(m);
    }

    cacheElements() {
      const get = (id) => document.getElementById(id);
      this.els = {
        container: get("ps-m"), body: get("ps-body"), resizeHandle: get("ps-resize-handle"),
        fab: get("ps-fab"), minimizeBtn: get("ps-minimize"),
        brandSelect: get("ps-b"), memberList: get("ps-l"), searchInput: get("ps-search"),
        runBtn: get("ps-run"), reloadBtn: get("ps-reload"),
        queueList: get("ps-queue-list"), queueCount: get("ps-queue-count"), clearQueueBtn: get("ps-clear-queue"),
        extractBtn: get("ps-extract"), importBtn: get("ps-import"), exportBtn: get("ps-export"),
        toggles: { 
          brand: get("ps-toggle-brand"), 
          staff: get("ps-toggle-staff"), 
          unitColor: get("ps-toggle-unitcolor"),
          variant: get("ps-toggle-variant") 
        },
        sortSelectBtn: get("ps-sort-select"), sortCodeBtn: get("ps-sort-code"),
        optBtn: get("ps-toggle-opt"), optPanel: get("ps-opt-panel"),
        sheetIdInput: get("ps-sheet-id"), sheetIdSave: get("ps-sheet-save"),
        queueToggle: get("ps-queue-toggle"), queueArrow: get("ps-queue-arrow"),
        unitChips: get("ps-unit-chips"),
        saBtn: get("ps-sa"), caBtn: get("ps-ca")
      };
    }

    // ★ 最終取得時間のツールチップ更新メソッド
    updateReloadTooltip() {
      const cacheKey = `ps_cache_${this.store.currentBrand}`;
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached && cached.timestamp) {
          const d = new Date(cached.timestamp);
          const pad = (n) => String(n).padStart(2, '0');
          const timeStr = `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          this.els.reloadBtn.title = `再取得・キャッシュクリア (最終取得: ${timeStr})`;
        } else {
          this.els.reloadBtn.title = `再取得・キャッシュクリア`;
        }
      } catch (e) {
        this.els.reloadBtn.title = `再取得・キャッシュクリア`;
      }
    }

    bindEvents() {
      this.els.resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const startW = this.els.container.offsetWidth, startH = this.els.container.offsetHeight;
        const onMouseMove = (ev) => {
          this.els.container.style.width = `${Math.max(280, Math.min(window.innerWidth * 0.9, startW + (startX - ev.clientX)))}px`;
          this.els.container.style.height = `${Math.max(240, Math.min(window.innerHeight * 0.94, startH + (ev.clientY - startY)))}px`;
        };
        const onMouseUp = () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
        window.addEventListener("mousemove", onMouseMove); window.addEventListener("mouseup", onMouseUp);
      });

      this.els.minimizeBtn.onclick = () => { this.els.container.style.display = "none"; this.els.fab.style.display = "flex"; };
      this.els.fab.onclick = () => { this.els.fab.style.display = "none"; this.els.container.style.display = "flex"; this.els.container.style.height = this.savedHeight || "750px"; };
      
      this.els.optBtn.onclick = () => {
        const isShow = this.els.optPanel.style.display === "flex";
        this.els.optPanel.style.display = isShow ? "none" : "flex";
        this.els.optBtn.style.color = isShow ? "#a9b1d6" : "#7aa2f7";
      };
      
      this.els.queueToggle.onclick = () => {
        this.isQueueOpen = !this.isQueueOpen;
        this.els.queueList.style.display = this.isQueueOpen ? "flex" : "none";
        this.els.queueArrow.textContent = this.isQueueOpen ? "▴" : "▾";
      };

      this.els.sortSelectBtn.onclick = () => { this.store.sortMode = "select"; this.updateSortUI(); this.renderQueue(); };
      this.els.sortCodeBtn.onclick = () => { this.store.sortMode = "code"; this.updateSortUI(); this.renderQueue(); };

      this.els.toggles.brand.onchange = (e) => { this.store.showBrand = e.target.checked; this.renderList(); };
      this.els.toggles.staff.onchange = (e) => { this.store.showStaff = e.target.checked; this.renderList(); };
      this.els.toggles.unitColor.onchange = (e) => { this.store.showUnitColor = e.target.checked; this.renderList(); };

      this.els.toggles.variant.onchange = (e) => { 
        this.store.showVariant = e.target.checked; 
        this.renderQueue(); 
        this.renderList(); 
      };

      this.els.sheetIdSave.onclick = () => {
        const newId = this.els.sheetIdInput.value.trim();
        if (newId) {
          localStorage.setItem(CONFIG.CUSTOM_ID_KEY, newId);
          alert("カスタムのスプレッドシートIDを適用しました。\nデータを再取得します。");
        } else {
          localStorage.removeItem(CONFIG.CUSTOM_ID_KEY);
          alert("デフォルトのスプレッドシートに戻しました。\nデータを再取得します。");
        }
        CONFIG.SHEETS.forEach(s => localStorage.removeItem(`ps_cache_${s}`));
        this.store.cache = {};
        this.app.loadData(true);
      };

      this.els.searchInput.oninput = (e) => { this.store.searchQuery = e.target.value.trim().toLowerCase(); this.renderList(); };
      this.els.searchInput.onkeydown = (e) => { if (e.key === "Escape") { this.els.searchInput.value = ""; this.store.searchQuery = ""; this.renderList(); } };
      
      this.els.brandSelect.onchange = () => {
        this.els.searchInput.value = ""; this.store.searchQuery = ""; this.store.selectedUnit = "";
        this.store.currentBrand = this.els.brandSelect.value;
        this.app.loadData(false);
      };
      
      this.els.reloadBtn.onclick = () => {
        CONFIG.SHEETS.forEach(s => localStorage.removeItem(`ps_cache_${s}`));
        this.store.cache = {};
        this.app.loadData(true);
      };

      this.els.saBtn.onclick = () => {
        this.store.getVisibleList().forEach(it => {
          const key = `${it.brand}:${it.n}`;
          if (!this.store.selected.has(key)) this.store.toggleSelection(key, it);
        });
        this.renderQueue(); this.renderList();
      };
      this.els.caBtn.onclick = () => {
        (this.store.cache[this.store.currentBrand] || []).forEach(it => this.store.selected.delete(`${it.brand}:${it.n}`));
        this.renderQueue(); this.renderList();
      };

      this.els.memberList.onclick = (e) => {
        const favBtn = e.target.closest(".ps-star-btn");
        if (favBtn) {
          e.preventDefault(); e.stopPropagation();
          this.store.toggleFavorite(favBtn.getAttribute("data-fav"));
          this.renderList(); return;
        }
        const nameLabel = e.target.closest(".ps-name-label");
        if (nameLabel) {
          const chk = this.els.memberList.querySelector(`.ps-k[data-key="${CSS.escape(nameLabel.getAttribute("data-key"))}"]`);
          if (chk) { chk.checked = !chk.checked; chk.dispatchEvent(new Event("change", { bubbles: true })); }
        }
      };

      this.els.memberList.onchange = (e) => {
        if (e.target.classList.contains("ps-k")) {
          const key = e.target.getAttribute("data-key");
          const item = (this.store.cache[this.store.currentBrand] || []).find(it => `${it.brand}:${it.n}` === key);
          if (item) {
            if (e.target.checked) {
              const savedItem = {
                ...item,
                c: this.store.getActiveColor(item),
                p: this.store.getActivePen(item),
                isForcedVariant: this.store.showVariant
              };
              this.store.selected.set(key, { ...savedItem, selectOrder: ++this.store.counter });
            } else {
              this.store.selected.delete(key);
            }
          }
          this.renderQueue();
          const row = e.target.closest(".ps-row");
          if (row) row.classList.toggle("selected", e.target.checked);
        }
      };

      let draggedKey = null;
      this.els.queueList.addEventListener("dragstart", (e) => {
        if (this.store.sortMode !== "select") return;
        const item = e.target.closest(".ps-drag-item");
        if (!item) return;
        draggedKey = item.getAttribute("data-key");
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => item.classList.add("dragging"), 0);
      });
      this.els.queueList.addEventListener("dragover", (e) => {
        if (this.store.sortMode !== "select" || !draggedKey) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const item = e.target.closest(".ps-drag-item");
        if (item && item.getAttribute("data-key") !== draggedKey) item.classList.add("drag-over");
      });
      this.els.queueList.addEventListener("dragleave", (e) => {
        const item = e.target.closest(".ps-drag-item");
        if (item) item.classList.remove("drag-over");
      });
      this.els.queueList.addEventListener("drop", (e) => {
        if (this.store.sortMode !== "select" || !draggedKey) return;
        e.preventDefault();
        const item = e.target.closest(".ps-drag-item");
        if (item) {
          item.classList.remove("drag-over");
          const dropTargetKey = item.getAttribute("data-key");
          if (draggedKey !== dropTargetKey) { this.store.reorderSelection(draggedKey, dropTargetKey); this.renderQueue(); }
        }
      });
      this.els.queueList.addEventListener("dragend", (e) => {
        const item = e.target.closest(".ps-drag-item");
        if (item) item.classList.remove("dragging");
        draggedKey = null;
        this.els.queueList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
      });
      this.els.queueList.onclick = (e) => {
        const delKey = e.target.closest("button")?.getAttribute("data-del");
        if (delKey) { this.store.selected.delete(delKey); this.renderQueue(); this.renderList(); }
      };
      
      this.els.clearQueueBtn.onclick = () => { this.store.clearSelection(); this.renderQueue(); this.renderList(); };

      this.els.extractBtn.onclick = async () => {
        const text = prompt("【自動抽出機能】\n公式サイトのテキストや画像からコピーしたテキストを貼り付けてください。\n※全ブランドから一括検索します。");
        if (!text) return;

        const cleanText = text.replace(/\s+/g, '').toLowerCase();
        if (!cleanText) return;

        let addedCount = 0;
        const originalText = this.els.extractBtn.textContent;
        this.els.extractBtn.textContent = "⏳抽出中...";
        this.els.extractBtn.disabled = true;

        try {
          const fetchPromises = CONFIG.SHEETS.map(async (sheet) => {
            if (!this.store.cache[sheet]) this.store.cache[sheet] = await DataFetcher.fetch(sheet, false);
          });
          await Promise.all(fetchPromises);

          CONFIG.SHEETS.forEach(sheet => {
            (this.store.cache[sheet] || []).forEach(it => {
              if (it.role !== "idol") return;

              const cleanName = it.n.replace(/\s+/g, '').toLowerCase();
              if (cleanName.length <= 1) return;

              if (cleanText.includes(cleanName)) {
                const key = `${it.brand}:${it.n}`;
                if (!this.store.selected.has(key)) {
                  const savedItem = {
                    ...it,
                    c: this.store.getActiveColor(it),
                    p: this.store.getActivePen(it),
                    isForcedVariant: this.store.showVariant
                  };
                  this.store.selected.set(key, { ...savedItem, selectOrder: ++this.store.counter });
                  addedCount++;
                }
              }
            });
          });

          this.renderQueue();
          this.renderList();
          
          if (addedCount > 0) alert(`🎉 抽出完了！\n合計 ${addedCount} 名をリストに追加しました。`);
          else alert("一致するアイドルが見つかりませんでした。\n※テキストが正しくコピーされているか確認してください。");
        } catch (e) {
          alert("抽出処理中にエラーが発生しました。\nカスタムスプレッドシートの権限等を確認してください。");
        } finally {
          this.els.extractBtn.textContent = originalText;
          this.els.extractBtn.disabled = false;
        }
      };

      this.els.exportBtn.onclick = () => {
        const data = this.store.getSortedSelectedList(this.site.getRankCalculator());
        if (data.length === 0) { alert("エクスポートするリストがありません。"); return; }
        
        const exportPayload = {
          showVariant: this.store.showVariant, 
          items: data.map(it => ({
            ...it,
            c: it.isForcedVariant && it.c_v ? it.c_v : this.store.getActiveColor(it),
            p: it.isForcedVariant && it.p_v ? it.p_v : this.store.getActivePen(it)
          }))
        };

        const str = btoa(encodeURIComponent(JSON.stringify(exportPayload)));
        navigator.clipboard.writeText(str).then(() => alert("リストのコードをコピーしました（トグル状態も保存されました）！")).catch(() => alert("コピーに失敗しました。"));
      };

      this.els.importBtn.onclick = () => {
        const str = prompt("【リスト読込】\n保存したリストのコードを貼り付けてください:");
        if (!str) return;
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(str)));
          
          let itemsArray = [];
          let targetShowVariant = false;

          if (Array.isArray(decoded)) {
            itemsArray = decoded;
          } else if (decoded && Array.isArray(decoded.items)) {
            itemsArray = decoded.items;
            targetShowVariant = !!decoded.showVariant;
          }

          if (itemsArray.length > 0) {
            this.store.showVariant = targetShowVariant;
            if (this.els.toggles.variant) {
              this.els.toggles.variant.checked = targetShowVariant;
            }

            this.store.clearSelection();
            itemsArray.forEach(it => {
              this.store.counter = Math.max(this.store.counter, it.selectOrder || 0);
              this.store.selected.set(`${it.brand}:${it.n}`, it);
            });

            this.renderQueue(); 
            this.renderList();
            alert(`リストを読み込みました！\n（特殊色トグル: ${targetShowVariant ? 'ON' : 'OFF'} に自動設定しました）`);
          }
        } catch (e) { alert("無効なコードです。"); }
      };

      this.els.runBtn.onclick = () => this.app.executeAutoAdd();
    }

    updateSortUI() {
      this.els.sortSelectBtn.className = `ps-btn ${this.store.sortMode === "select" ? "ps-btn-primary" : ""}`;
      this.els.sortCodeBtn.className = `ps-btn ${this.store.sortMode === "code" ? "ps-btn-primary" : ""}`;
    }

    renderQueue() {
      this.els.queueCount.textContent = this.store.selected.size;
      if (this.store.selected.size === 0) {
        this.els.queueList.innerHTML = `<span style="color:#565f89;font-size:10px;">未選択</span>`;
        return;
      }
      const isManualSort = this.store.sortMode === "select";
      this.els.queueList.innerHTML = this.store.getSortedSelectedList(this.site.getRankCalculator()).map(it => {
        const activeColor = it.isForcedVariant && it.c_v ? it.c_v : this.store.getActiveColor(it);
        const activePen = it.isForcedVariant && it.p_v ? it.p_v : this.store.getActivePen(it);

        const escKey = Utils.escapeHtml(`${it.brand}:${it.n}`);
        const escN = Utils.escapeHtml(it.n);
        const escC = Utils.escapeHtml(activeColor || '#fff');
        const escP = Utils.escapeHtml(activePen);
        const draggableAttr = isManualSort ? 'draggable="true"' : '';
        const dragHandle = isManualSort ? `<span class="ps-drag-handle" title="ドラッグして移動">⠿</span>` : '';

        return `
          <span class="ps-badge ps-drag-item" data-key="${escKey}" ${draggableAttr}>
            ${dragHandle}
            <span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${escC};"></span>
            <span>${escN}</span>
            <span style="color:#7dcfff;font-size:9px;font-family:monospace;">(${escP})</span>
            <button data-del="${escKey}" style="background:none;border:none;color:#f7768e;cursor:pointer;padding:0 2px;line-height:1;">✕</button>
          </span>
        `;
      }).join("");
    }

    renderUnitChips() {
      const units = this.store.getUnits();
      if (units.length === 0) {
        this.els.unitChips.style.display = "none"; this.els.unitChips.innerHTML = ""; this.store.selectedUnit = ""; return;
      }
      this.els.unitChips.style.display = "flex";
      this.els.unitChips.innerHTML = `
        <span class="ps-chip ${this.store.selectedUnit === '' ? 'active' : ''}" data-unit="">全て</span>
        ${units.map(u => {
          const escU = Utils.escapeHtml(u);
          return `<span class="ps-chip ${this.store.selectedUnit === u ? 'active' : ''}" data-unit="${escU}">${escU}</span>`;
        }).join("")}
      `;
      this.els.unitChips.querySelectorAll(".ps-chip").forEach(chip => {
        chip.onclick = () => { this.store.selectedUnit = chip.getAttribute("data-unit"); this.renderUnitChips(); this.renderList(); };
      });
    }

    renderList() {
      const list = this.store.getVisibleList();
      if (!list.length) {
        this.els.memberList.innerHTML = `<span style="color:#f7768e;display:block;padding:6px 0;">一致する項目がありません</span>`;
        return;
      }

      this.els.memberList.innerHTML = list.map(it => {
        const activeColor = this.store.getActiveColor(it);
        const activePen = this.store.getActivePen(it);

        const key = `${it.brand}:${it.n}`;
        const escKey = Utils.escapeHtml(key);
        const escN = Utils.escapeHtml(it.n);
        const escC = Utils.escapeHtml(activeColor || '#fff');
        const escP = Utils.escapeHtml(activePen);
        
        const isChecked = this.store.selected.has(key);
        const isFav = this.store.favorites.has(key);

        let tag = "";
        if (it.role === "brand") tag = `<span class="ps-tag-brand">ブランド</span>`;
        else if (it.role === "staff") tag = `<span class="ps-tag-staff">事務員</span>`;
        else if (it.role === "unit_color") tag = `<span class="ps-tag-unit">ユニット</span>`;

        const showUnitTag = it.unit && !CONFIG.EXCLUDE_ROLES.includes(it.unit) && it.role === "idol" && !it.n.includes(it.unit);
        const unitTag = showUnitTag ? `<span style="font-size:9px;color:#565f89;margin-left:4px;">[${Utils.escapeHtml(it.unit)}]</span>` : "";
        const starHtml = (it.role === "idol" || it.role === "unit_color") ? `<button type="button" class="ps-star-btn ${isFav ? 'active' : ''}" data-fav="${escKey}" title="推しピン留め">${isFav ? '★' : '☆'}</button>` : `<span style="width:22px;display:inline-block;flex-shrink:0;"></span>`;

        return `
          <div class="ps-row ${isChecked ? 'selected' : ''}" data-rowkey="${escKey}">
            <input type="checkbox" data-key="${escKey}" class="ps-k" ${isChecked ? "checked" : ""} style="cursor:pointer;flex-shrink:0;">
            ${starHtml}
            <span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${escC};border:1px solid rgba(255,255,255,0.4);flex-shrink:0;"></span>
            <span class="ps-name-label" data-key="${escKey}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;">${escN}${tag}${unitTag}</span>
            <span style="color:#7dcfff;font-family:monospace;font-weight:bold;font-size:11px;flex-shrink:0;margin-left:4px;">${escP}</span>
          </div>
        `;
      }).join("");
    }
  }

  // ==========================================================================
  // 7. Application Bootstrapper (Controller)
  // ==========================================================================
  class App {
    constructor() {
      this.store = new Store();
      this.siteAdapter = new SiteAdapter();
      this.ui = new UIManager(this, this.store, this.siteAdapter);
    }
    init() {
      if (!window.location.href.includes("penlight-supporter.onrender.com")) return;

      if (this.ui.inject()) {
        this.siteAdapter.startObserving();
        this.ui.renderQueue();
        this.loadData();
      }
    }
    async loadData(force = false) {
      if (!this.store.cache[this.store.currentBrand] || force) {
        this.ui.els.memberList.innerHTML = `<span style="color:#aaa;">${force ? '再取得中...' : '読込中...'}</span>`;
        this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, force);
      }
      this.ui.updateReloadTooltip();
      this.ui.renderUnitChips();
      this.ui.renderList();
    }
    
    async executeAutoAdd() {
      const targets = this.store.getSortedSelectedList(this.siteAdapter.getRankCalculator());
      if (!targets.length) { alert("メンバーを選択してください"); return; }
      
      this.ui.els.runBtn.disabled = true;
      this.siteAdapter.buildCache();

      let count = 0;
      for (let i = 0; i < targets.length; i++) {
        const it = targets[i];
        this.ui.els.runBtn.textContent = `[${i + 1}/${targets.length}] ${it.n}...`;
        
        const activePen = it.isForcedVariant && it.p_v ? it.p_v : this.store.getActivePen(it);
        const targetBtn = this.siteAdapter.getButton(activePen);
        
        if (targetBtn) {
          targetBtn.scrollIntoView({ block: "nearest", inline: "nearest" });
          
          const editBtnsBefore = this.siteAdapter.getEditButtons();
          Utils.simulateClick(targetBtn);
          
          await Utils.sleep(80);
          
          const editBtnsAfter = this.siteAdapter.getEditButtons();
          const newEditBtn = editBtnsAfter.find(el => !editBtnsBefore.includes(el)) || editBtnsAfter[editBtnsAfter.length - 1];
          
          if (newEditBtn) {
            const inputsBefore = this.siteAdapter.getSiteInputs();
            Utils.simulateClick(newEditBtn);

            await Utils.sleep(50);

            const inputsAfter = this.siteAdapter.getSiteInputs();
            const targetInput = inputsAfter.find(el => !inputsBefore.includes(el)) || inputsAfter[inputsAfter.length - 1];

            if (targetInput) {
              Utils.setInputValue(targetInput, it.n);
              targetInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
            }
          }

          count++;
          await Utils.sleep(60);
        }
      }

      this.ui.els.runBtn.disabled = false;
      this.ui.els.runBtn.textContent = `完了 (${count}/${targets.length}件)`;
      setTimeout(() => { this.ui.els.runBtn.textContent = "リストに追加する"; }, 2000);
    }
  }

  // ==========================================================================
  // Entry Point
  // ==========================================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new App().init());
  } else {
    setTimeout(() => new App().init(), 500);
  }

})();