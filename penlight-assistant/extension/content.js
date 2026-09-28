/**
 * Penlight Supporter Helper (for MIX PENLa PRO)
 * Version: 4.1.0
 */
(() => {
  "use strict";

  if (window.__psHelperLoaded) return;
  window.__psHelperLoaded = true;

  const CURRENT_VERSION = "4.1.0";
  
  const CONFIG = {
    GITHUB_REPO: "kqkk1/penlight-assistant",
    DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
    SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
    FAV_STORAGE_KEY: "ps_fav_idols_v2",
    CUSTOM_ID_KEY: "ps_custom_sheet_id",
    PEN_MODE_KEY: "ps_pen_mode",
    MERGE_DUP_KEY: "ps_merge_dup",
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    GROUP_ORDER: { R: 1, P: 2, V: 3, B: 4, GB: 5, G: 6, Y: 7, O: 8, W: 9, H: 10, D: 11 },
    EXCLUDE_ROLES: ["ブランド", "事務員", "ユニット"]
  };

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

  class Store {
    constructor() {
      this.cache = {}; this.selected = new Map(); this.counter = 0;
      this.showBrand = true; this.showStaff = true; this.showUnitColor = true; this.showVariant = false; 
      this.sortMode = "select";
      this.penMode = localStorage.getItem(CONFIG.PEN_MODE_KEY) || "361";
      this.mergeDuplicates = localStorage.getItem(CONFIG.MERGE_DUP_KEY) === "true";
      this.searchQuery = ""; this.selectedUnit = "";
      this.currentBrand = CONFIG.SHEETS[0];
      this.favorites = new Set(JSON.parse(localStorage.getItem(CONFIG.FAV_STORAGE_KEY) || "[]"));
    }
    getActiveColor(it) { return (this.showVariant && it.c_v) ? it.c_v : (it.c || '#fff'); }
    getActivePen(it) { 
      let code = "";
      if (this.showVariant) {
        code = this.penMode === "361" ? it.p_v_361 : it.p_v_56;
        if (!code) code = this.penMode === "361" ? it.p_361 : it.p_56;
      } else {
        code = this.penMode === "361" ? it.p_361 : it.p_56;
      }
      return code || "--";
    }
    setPenMode(mode) { this.penMode = mode; localStorage.setItem(CONFIG.PEN_MODE_KEY, mode); }
    toggleMergeDuplicates(val) { this.mergeDuplicates = val; localStorage.setItem(CONFIG.MERGE_DUP_KEY, val); }
    toggleFavorite(key) {
      this.favorites.has(key) ? this.favorites.delete(key) : this.favorites.add(key);
      localStorage.setItem(CONFIG.FAV_STORAGE_KEY, JSON.stringify(Array.from(this.favorites)));
    }
    toggleSelection(key, item) {
      if (this.selected.has(key)) this.selected.delete(key);
      else this.selected.set(key, { ...item, selectOrder: ++this.counter });
    }
    clearSelection() { this.selected.clear(); this.counter = 0; }
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
      return Array.from(new Set((this.cache[this.currentBrand] || []).map(it => it.unit).filter(u => u && !CONFIG.EXCLUDE_ROLES.includes(u))));
    }
  }

  class DataFetcher {
    static getTargetSpreadsheetId() { return localStorage.getItem(CONFIG.CUSTOM_ID_KEY) || CONFIG.DEFAULT_SPREADSHEET_ID; }
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
        if (!res.ok) throw new Error("Network error");
        const rows = Utils.parseCSV(await res.text());
        if (rows.length <= 1) return [];

        const items = [];
        const seen = new Set();
        const extractCode = (raw) => {
          if (!raw) return "";
          const match = raw.match(/[A-Za-z]+[0-9]+(?:-[0-9]+)?/);
          return match ? match[0].toUpperCase() : raw.replace(/\s*△.*/, "").trim();
        };
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i];
          if (cols.length < 3) continue;
          let name   = cols[0] ? cols[0].replace(/^"|"$/g, "").trim() : "";
          const c    = cols[1] ? cols[1].replace(/^"|"$/g, "").trim() : "";
          const p361 = extractCode(cols[2] ? cols[2].replace(/^"|"$/g, "").trim() : "");
          const p56  = extractCode(cols[3] ? cols[3].replace(/^"|"$/g, "").trim() : "");
          const unit = cols[4] ? cols[4].replace(/^"|"$/g, "").trim() : "";
          const c_v  = cols[5] ? cols[5].replace(/^"|"$/g, "").trim() : "";
          const pv361= extractCode(cols[6] ? cols[6].replace(/^"|"$/g, "").trim() : "");
          const pv56 = extractCode(cols[7] ? cols[7].replace(/^"|"$/g, "").trim() : "");

          if (sheetName !== "765AS" && name === "天海春香" && items.length === 0) return [];
          if (sheetName === "876" && name.includes("秋月涼")) name = "秋月涼";

          if (name && (p361 || p56) && !seen.has(name)) {
            let role = "idol";
            if (/ブランド/.test(unit) || /ブランド|プロ|プロダクション|学園/i.test(name)) role = "brand";
            else if (/事務員/.test(unit) || /事務員|小鳥|美咲|ちひろ|はづき|山村|亜紗里|社長/i.test(name)) role = "staff";
            else if (/ユニット|色|カラー/.test(unit) || /ユニット|色|カラー/i.test(name)) role = "unit_color";

            seen.add(name);
            items.push({ n: name, c, p_361: p361, p_56: p56, c_v, p_v_361: pv361, p_v_56: pv56, brand: sheetName, role, unit, rawIndex: i });
          }
        }
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: items }));
        return items;
      } catch (e) { return []; }
    }
  }

  class SiteAdapter {
    constructor() { this.btnCache = new Map(); this.indexMap = new Map(); this.observer = null; this.cacheTimer = null; }
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
      this.btnCache.clear(); this.indexMap.clear();
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
      if (code === "--") return null;
      if (this.btnCache.size === 0) this.buildCache();
      const cleanCode = (code || "").trim().toUpperCase();
      let btn = this.btnCache.get(cleanCode);
      if (!btn || !document.body.contains(btn)) { this.buildCache(); btn = this.btnCache.get(cleanCode); }
      return btn || null;
    }
    getRankCalculator() {
      return (codeStr) => {
        if (codeStr === "--") return 999999;
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
      return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])')).filter(x => container ? !container.contains(x) : true);
    }
    getEditButtons() {
      const container = document.getElementById("ps-m");
      return Array.from(document.querySelectorAll('button[aria-label="タイトルを編集"]')).filter(x => container ? !container.contains(x) : true);
    }
  }

  class UIManager {
    constructor(app, store, siteAdapter) {
      this.app = app; this.store = store; this.site = siteAdapter;
      this.savedHeight = ""; this.isQueueOpen = false; this.els = {};
    }

    inject() {
      if (document.getElementById("ps-m")) return false;
      this.injectStyles();
      this.buildHTML();
      this.cacheElements();
      this.bindEvents();
      this.checkUpdate();
      return true;
    }

    async checkUpdate() {
      if(CONFIG.GITHUB_REPO.includes("YOUR_GITHUB_NAME")) return;
      try {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_REPO}/releases/latest`);
        if (!res.ok) return; 
        const data = await res.json();
        const latestTag = data.tag_name || "";
        const latestVer = latestTag.replace(/^v/, "");
        if (latestVer && latestVer !== CURRENT_VERSION) {
          const banner = document.createElement("div");
          banner.style.cssText = "background:#ff9e64;color:#15161e;font-weight:bold;font-size:11px;padding:6px;text-align:center;cursor:pointer;border-radius:4px;margin-bottom:6px;flex-shrink:0;";
          banner.innerHTML = `📢 新バージョン(v${latestVer})が公開されています！クリックして更新ページへ`;
          banner.onclick = () => window.open(`https://github.com/${CONFIG.GITHUB_REPO}/releases/latest`, "_blank");
          this.els.body.insertBefore(banner, this.els.body.firstChild);
        }
      } catch (e) { }
    }

    injectStyles() {
      const style = document.createElement("style");
      style.textContent = `
        #ps-m { position:fixed; top:18px; right:18px; width:500px; height:750px; min-width:280px; min-height:240px; max-width:95vw; max-height:94vh; background:#1a1b26; color:#c0caf5; border-radius:10px; box-shadow:0 12px 32px rgba(0,0,0,0.85); z-index:999999999; padding:12px; display:flex; flex-direction:column; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; font-size:12px; border:1px solid #7aa2f7; box-sizing:border-box; transition: height 0.3s ease; }
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
        
        .ps-row { display:flex; align-items:center; gap:6px; padding:5px 6px; border-radius:4px; transition:0.1s; user-select:none; cursor:pointer; }
        .ps-row:hover { background:#24283b; }
        .ps-row.selected { background:#1e2538; }
        .ps-k { cursor:pointer; flex-shrink:0; }
        .ps-badge { display:inline-flex; align-items:center; gap:3px; background:#24283b; border:1px solid #414868; padding:2px 6px; border-radius:3px; font-size:11px; }
        .ps-star-btn { background:none; border:none; font-size:15px; line-height:1; cursor:pointer; padding:0 6px; color:#565f89; flex-shrink:0; transition:transform 0.12s,color 0.12s; }
        .ps-star-btn:hover { transform:scale(1.2); color:#e0af68; }
        .ps-star-btn.active { color:#e0af68 !important; text-shadow:0 0 6px rgba(224,175,104,0.5); }
        .ps-chip { padding:2px 7px; border-radius:10px; font-size:10px; cursor:pointer; background:#1f2335; color:#9aa5ce; border:1px solid #3b4261; white-space:nowrap; user-select:none; transition:0.12s; }
        .ps-chip:hover { background:#24283b; color:#fff; }
        .ps-chip.active { background:#7aa2f722; color:#7aa2f7; border-color:#7aa2f7; font-weight:bold; }
        .ps-drag-item { transition: transform 0.1s, opacity 0.1s; }
        .ps-drag-item.dragging { opacity: 0.4; transform: scale(0.95); }
        .ps-drag-item.drag-over { border: 1px dashed #7aa2f7; filter: brightness(1.3); }
        .ps-drag-handle { cursor: grab; padding-right: 4px; color: #565f89; user-select: none; }
        .ps-radio-group { display:flex; background:#1f2335; border-radius:4px; border:1px solid #3b4261; overflow:hidden; }
        .ps-radio-group label { flex:1; text-align:center; padding:3px 0; font-size:10px; cursor:pointer; color:#9aa5ce; transition:0.1s; border-right:1px solid #3b4261; }
        .ps-radio-group label:last-child { border-right:none; }
        .ps-radio-group input { display:none; }
        .ps-radio-group input:checked + span { color:#15161e; background:#7aa2f7; display:block; height:100%; font-weight:bold; }
        .ps-opt-group { display:flex; align-items:center; gap:6px; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid #2f3549; }
        .ps-opt-group:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
        .ps-opt-lbl { font-size:10px; color:#565f89; width:35px; flex-shrink:0; text-align:right; margin-right:4px; }

        @media screen and (max-width: 600px) {
          #ps-m {
            top: auto !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 82vh !important;
            height: 82dvh !important;
            max-height: calc(100dvh - 20px) !important;
            border-radius: 16px 16px 0 0;
            border-bottom: none;
            padding: 14px 10px calc(24px + env(safe-area-inset-bottom, 16px)) 10px !important;
          }
          #ps-resize-handle { display: none !important; }
          .ps-row { padding: 10px !important; margin-bottom: 4px; background: #181924; border: 1px solid #282b3d; border-radius: 6px; gap: 10px !important; }
          .ps-row.selected { background: #1f273d !important; border-color: #3d59a1 !important; }
          .ps-k { transform: scale(1.4) !important; margin-right: 4px !important; margin-left: 2px !important; }
          .ps-star-btn { font-size: 18px !important; padding: 4px 8px !important; }
          .ps-name-label { font-size: 13px !important; font-weight: 500; }
          .ps-btn { padding: 6px 10px; font-size: 12px; }
          .ps-input { font-size: 13px; padding: 7px; }
          #ps-run { padding: 14px !important; font-size: 15px !important; border-radius: 8px; font-weight: bold; min-height: 48px; flex-shrink: 0 !important; margin-top: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
          #ps-fab { bottom: 16px; right: 16px; width: 54px; height: 54px; font-size: 26px; }
          .ps-chip { padding: 4px 10px; font-size: 11px; }
        }
      `;
      document.head.appendChild(style);
    }

    buildHTML() {
      const brandOptions = CONFIG.SHEETS.map(k => `<option value="${k}">${k}</option>`).join("");
      const customId = localStorage.getItem(CONFIG.CUSTOM_ID_KEY) || "";

      const fab = document.createElement("div");
      fab.id = "ps-fab"; fab.style.display = "none"; fab.innerHTML = "✨"; fab.title = "アシストを開く";
      document.body.appendChild(fab);

      const m = document.createElement("div");
      m.id = "ps-m";
      m.innerHTML = `
        <div id="ps-resize-handle" title="ドラッグしてサイズ変更"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #2f3549;flex-shrink:0;">
          <b style="font-size:13px;color:#7aa2f7;">PRO-361/56 入力アシスト v${CURRENT_VERSION}</b>
          <div style="display:flex;gap:4px;align-items:center;">
            <button id="ps-toggle-opt" class="ps-btn" style="padding:2px 7px;font-size:12px;" title="設定を開く">⚙設定</button>
            <button id="ps-minimize" class="ps-btn" style="padding:2px 8px;font-size:12px;" title="最小化して隠す">ー</button>
          </div>
        </div>
        <div id="ps-body" style="display:flex;flex-direction:column;gap:6px;flex:1;overflow:hidden;">
          
          <div id="ps-opt-panel" style="display:none;background:#1f2335;border:1px solid #3b4261;border-radius:6px;padding:8px;flex-direction:column;flex-shrink:0;">
            <div class="ps-opt-group">
              <span class="ps-opt-lbl">ペン:</span>
              <div class="ps-radio-group" style="width:120px;">
                <label><input type="radio" name="ps-pen-mode" value="361" ${this.store.penMode==="361"?"checked":""}><span>361色</span></label>
                <label><input type="radio" name="ps-pen-mode" value="56" ${this.store.penMode==="56"?"checked":""}><span>56色</span></label>
              </div>
            </div>
            <div class="ps-opt-group">
              <span class="ps-opt-lbl">表示:</span>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-brand" checked style="accent-color:#7aa2f7;">ブランド</label>
                <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-staff" checked style="accent-color:#9ece6a;">事務員</label>
                <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-unitcolor" checked style="accent-color:#ff9e64;">ユニット色</label>
                <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;"><input type="checkbox" id="ps-toggle-variant" style="accent-color:#e0af68;">特殊色</label>
              </div>
            </div>
            <div class="ps-opt-group" style="border-bottom:none;">
              <span class="ps-opt-lbl">動作:</span>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;gap:4px;">
                  <button id="ps-sort-select" class="ps-btn ps-btn-primary" style="padding:2px 8px;font-size:10px;">選択順</button>
                  <button id="ps-sort-code" class="ps-btn" style="padding:2px 8px;font-size:10px;">公式色順</button>
                </div>
                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;" title="同じカラーのアイドルを『連名』にして1つにまとめます"><input type="checkbox" id="ps-toggle-merge" ${this.store.mergeDuplicates ? "checked" : ""} style="accent-color:#f7768e;">重複カラーを1つにまとめる(連名登録)</label>
              </div>
            </div>
            <div style="margin-top:2px;">
              <div id="ps-opt-adv-toggle" style="cursor:pointer;font-size:10px;color:#565f89;text-align:center;padding:4px;background:#1a1b26;border-radius:4px;user-select:none;">▾ 詳細設定を開く (スプシID等)</div>
              <div id="ps-opt-adv-panel" style="display:none;flex-direction:column;gap:4px;margin-top:6px;padding-top:6px;border-top:1px dashed #2f3549;">
                <span style="font-size:10px;color:#9aa5ce;">カスタムスプレッドシートID:</span>
                <div style="display:flex;gap:4px;width:100%;">
                  <input type="text" id="ps-sheet-id" class="ps-input" style="flex:1;padding:3px 6px;font-size:10px;" placeholder="空欄でデフォルトを使用" value="${Utils.escapeHtml(customId)}">
                  <button id="ps-sheet-save" class="ps-btn ps-btn-primary" style="padding:2px 8px;font-size:10px;">適用</button>
                </div>
              </div>
            </div>
          </div>

          <div style="background:#13141c;border:1px solid #2f3549;border-radius:6px;padding:5px 8px;flex-shrink:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span id="ps-queue-toggle" style="font-size:11px;color:#7dcfff;cursor:pointer;user-select:none;">追加予定: <b id="ps-queue-count">0</b>名 <span id="ps-queue-arrow" style="font-size:9px;color:#9aa5ce;">▾</span></span>
              <div style="display:flex;gap:4px;">
                <button id="ps-extract" class="ps-btn" style="padding:2px 6px;font-size:9px;background:#3d59a1;color:#fff;" title="画像やサイトのテキストから自動抽出">📋抽出</button>
                <button id="ps-import" class="ps-btn" style="padding:2px 6px;font-size:9px;">読込</button>
                <button id="ps-export" class="ps-btn" style="padding:2px 6px;font-size:9px;">保存</button>
                <button id="ps-clear-queue" style="background:none;border:none;color:#f7768e;cursor:pointer;font-size:10px;margin-left:4px;">全クリア</button>
              </div>
            </div>
            <div id="ps-queue-list" style="display:none;flex-wrap:wrap;gap:4px;max-height:140px;overflow-y:auto;margin-top:5px;padding-top:5px;border-top:1px dashed #2f3549;"></div>
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
          
          <button id="ps-run" class="ps-btn ps-btn-primary" style="width:100%;">リストに追加する</button>
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
        toggles: { brand: get("ps-toggle-brand"), staff: get("ps-toggle-staff"), unitColor: get("ps-toggle-unitcolor"), variant: get("ps-toggle-variant") },
        penModeRadios: document.querySelectorAll('input[name="ps-pen-mode"]'), mergeToggle: get("ps-toggle-merge"),
        sortSelectBtn: get("ps-sort-select"), sortCodeBtn: get("ps-sort-code"),
        optBtn: get("ps-toggle-opt"), optPanel: get("ps-opt-panel"), advToggleBtn: get("ps-opt-adv-toggle"), advPanel: get("ps-opt-adv-panel"),
        sheetIdInput: get("ps-sheet-id"), sheetIdSave: get("ps-sheet-save"),
        queueToggle: get("ps-queue-toggle"), queueArrow: get("ps-queue-arrow"), unitChips: get("ps-unit-chips"),
        saBtn: get("ps-sa"), caBtn: get("ps-ca")
      };
    }
    updateReloadTooltip() {
      const cacheKey = `ps_cache_${this.store.currentBrand}`;
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached && cached.timestamp) {
          const d = new Date(cached.timestamp), pad = (n) => String(n).padStart(2, '0');
          this.els.reloadBtn.title = `再取得・キャッシュクリア (最終取得: ${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())})`;
        } else { this.els.reloadBtn.title = `再取得・キャッシュクリア`; }
      } catch (e) { this.els.reloadBtn.title = `再取得・キャッシュクリア`; }
    }
    bindEvents() {
      this.els.resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY, startW = this.els.container.offsetWidth, startH = this.els.container.offsetHeight;
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
      this.els.advToggleBtn.onclick = () => {
        const isShow = this.els.advPanel.style.display === "flex";
        this.els.advPanel.style.display = isShow ? "none" : "flex";
        this.els.advToggleBtn.textContent = isShow ? "▾ 詳細設定を開く (スプシID等)" : "▴ 詳細設定を閉じる";
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
      this.els.toggles.variant.onchange = (e) => { this.store.showVariant = e.target.checked; this.renderQueue(); this.renderList(); };
      this.els.mergeToggle.onchange = (e) => { this.store.toggleMergeDuplicates(e.target.checked); };
      this.els.penModeRadios.forEach(radio => { radio.addEventListener('change', (e) => { if(e.target.checked) { this.store.setPenMode(e.target.value); this.renderQueue(); this.renderList(); } }); });
      this.els.sheetIdSave.onclick = () => {
        const newId = this.els.sheetIdInput.value.trim();
        if (newId) { localStorage.setItem(CONFIG.CUSTOM_ID_KEY, newId); alert("カスタムIDを適用しました。\nデータを再取得します。"); }
        else { localStorage.removeItem(CONFIG.CUSTOM_ID_KEY); alert("デフォルトに戻しました。\nデータを再取得します。"); }
        CONFIG.SHEETS.forEach(s => localStorage.removeItem(`ps_cache_${s}`));
        this.store.cache = {}; this.app.loadData(true);
      };
      this.els.searchInput.oninput = (e) => { this.store.searchQuery = e.target.value.trim().toLowerCase(); this.renderList(); };
      this.els.searchInput.onkeydown = (e) => { if (e.key === "Escape") { this.els.searchInput.value = ""; this.store.searchQuery = ""; this.renderList(); } };
      this.els.brandSelect.onchange = () => { this.els.searchInput.value = ""; this.store.searchQuery = ""; this.store.selectedUnit = ""; this.store.currentBrand = this.els.brandSelect.value; this.app.loadData(false); };
      this.els.reloadBtn.onclick = () => { CONFIG.SHEETS.forEach(s => localStorage.removeItem(`ps_cache_${s}`)); this.store.cache = {}; this.app.loadData(true); };
      this.els.saBtn.onclick = () => { this.store.getVisibleList().forEach(it => { const key = `${it.brand}:${it.n}`; if (!this.store.selected.has(key)) this.store.selected.set(key, { ...it, selectOrder: ++this.store.counter }); }); this.renderQueue(); this.renderList(); };
      this.els.caBtn.onclick = () => { (this.store.cache[this.store.currentBrand] || []).forEach(it => this.store.selected.delete(`${it.brand}:${it.n}`)); this.renderQueue(); this.renderList(); };

      this.els.memberList.onclick = (e) => {
        const favBtn = e.target.closest(".ps-star-btn");
        if (favBtn) {
          e.preventDefault(); e.stopPropagation();
          this.store.toggleFavorite(favBtn.getAttribute("data-fav"));
          this.renderList(); return;
        }
        if (e.target.classList.contains("ps-k")) return;
        const row = e.target.closest(".ps-row");
        if (row) {
          const chk = row.querySelector(".ps-k");
          if (chk && !chk.disabled) {
            chk.checked = !chk.checked;
            chk.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      };

      this.els.memberList.onchange = (e) => {
        if (e.target.classList.contains("ps-k")) {
          const key = e.target.getAttribute("data-key"), item = (this.store.cache[this.store.currentBrand] || []).find(it => `${it.brand}:${it.n}` === key);
          if (item) { if (e.target.checked) this.store.selected.set(key, { ...item, selectOrder: ++this.store.counter }); else this.store.selected.delete(key); }
          this.renderQueue();
          const row = e.target.closest(".ps-row"); if (row) row.classList.toggle("selected", e.target.checked);
        }
      };
      let draggedKey = null;
      this.els.queueList.addEventListener("dragstart", (e) => { if (this.store.sortMode !== "select") return; const item = e.target.closest(".ps-drag-item"); if (!item) return; draggedKey = item.getAttribute("data-key"); e.dataTransfer.effectAllowed = "move"; setTimeout(() => item.classList.add("dragging"), 0); });
      this.els.queueList.addEventListener("dragover", (e) => { if (this.store.sortMode !== "select" || !draggedKey) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; const item = e.target.closest(".ps-drag-item"); if (item && item.getAttribute("data-key") !== draggedKey) item.classList.add("drag-over"); });
      this.els.queueList.addEventListener("dragleave", (e) => { const item = e.target.closest(".ps-drag-item"); if (item) item.classList.remove("drag-over"); });
      this.els.queueList.addEventListener("drop", (e) => { if (this.store.sortMode !== "select" || !draggedKey) return; e.preventDefault(); const item = e.target.closest(".ps-drag-item"); if (item) { item.classList.remove("drag-over"); const dropTargetKey = item.getAttribute("data-key"); if (draggedKey !== dropTargetKey) { this.store.reorderSelection(draggedKey, dropTargetKey); this.renderQueue(); } } });
      this.els.queueList.addEventListener("dragend", (e) => { const item = e.target.closest(".ps-drag-item"); if (item) item.classList.remove("dragging"); draggedKey = null; this.els.queueList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over")); });
      this.els.queueList.onclick = (e) => { const delKey = e.target.closest("button")?.getAttribute("data-del"); if (delKey) { this.store.selected.delete(delKey); this.renderQueue(); this.renderList(); } };
      this.els.clearQueueBtn.onclick = () => { this.store.clearSelection(); this.renderQueue(); this.renderList(); };
      this.els.extractBtn.onclick = async () => {
        const text = prompt("【自動抽出機能】\n公式サイトのテキストや画像からコピーしたテキストを貼り付けてください。");
        if (!text) return; const cleanText = text.replace(/\s+/g, '').toLowerCase(); if (!cleanText) return;
        let addedCount = 0; const originalText = this.els.extractBtn.textContent; this.els.extractBtn.textContent = "⏳抽出中..."; this.els.extractBtn.disabled = true;
        try {
          const fetchPromises = CONFIG.SHEETS.map(async (sheet) => { if (!this.store.cache[sheet]) this.store.cache[sheet] = await DataFetcher.fetch(sheet, false); });
          await Promise.all(fetchPromises);
          CONFIG.SHEETS.forEach(sheet => {
            (this.store.cache[sheet] || []).forEach(it => {
              if (it.role !== "idol") return; const cleanName = it.n.replace(/\s+/g, '').toLowerCase(); if (cleanName.length <= 1) return;
              if (cleanText.includes(cleanName)) { const key = `${it.brand}:${it.n}`; if (!this.store.selected.has(key)) { this.store.selected.set(key, { ...it, selectOrder: ++this.store.counter }); addedCount++; } }
            });
          });
          this.renderQueue(); this.renderList();
          if (addedCount > 0) alert(`🎉 抽出完了！\n合計 ${addedCount} 名をリストに追加しました。`); else alert("一致するアイドルが見つかりませんでした。");
        } catch (e) { alert("抽出処理中にエラーが発生しました。"); } finally { this.els.extractBtn.textContent = originalText; this.els.extractBtn.disabled = false; }
      };
      this.els.exportBtn.onclick = () => {
        const data = this.store.getSortedSelectedList(this.site.getRankCalculator());
        if (data.length === 0) { alert("エクスポートするリストがありません。"); return; }
        const exportPayload = { showVariant: this.store.showVariant, penMode: this.store.penMode, items: data };
        const str = btoa(encodeURIComponent(JSON.stringify(exportPayload)));
        navigator.clipboard.writeText(str).then(() => alert("リストのコードをコピーしました（特殊色や361/56モードも保存されました）！")).catch(() => alert("コピーに失敗しました。"));
      };
      this.els.importBtn.onclick = () => {
        const str = prompt("【リスト読込】\n保存したリストのコードを貼り付けてください:"); if (!str) return;
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(str))); let itemsArray = []; let targetShowVariant = false; let targetPenMode = this.store.penMode;
          if (Array.isArray(decoded)) { itemsArray = decoded; } else if (decoded && Array.isArray(decoded.items)) { itemsArray = decoded.items; targetShowVariant = !!decoded.showVariant; if (decoded.penMode) targetPenMode = decoded.penMode; }
          if (itemsArray.length > 0) {
            this.store.showVariant = targetShowVariant; this.els.toggles.variant.checked = targetShowVariant;
            this.store.setPenMode(targetPenMode); this.els.penModeRadios.forEach(r => r.checked = (r.value === targetPenMode));
            this.store.clearSelection(); let added = 0;
            itemsArray.forEach(it => { if (!it || typeof it.n !== 'string' || typeof it.brand !== 'string') return; this.store.counter = Math.max(this.store.counter, it.selectOrder || 0); this.store.selected.set(`${it.brand}:${it.n}`, it); added++; });
            if (added > 0) { this.renderQueue(); this.renderList(); alert(`リストを読み込みました！`); } else { alert("有効なアイドルデータが見つかりませんでした。"); }
          }
        } catch (e) { alert("無効なコードです。"); }
      };
      this.els.runBtn.onclick = () => this.app.executeAutoAdd();
    }
    updateSortUI() { this.els.sortSelectBtn.className = `ps-btn ${this.store.sortMode === "select" ? "ps-btn-primary" : ""}`; this.els.sortCodeBtn.className = `ps-btn ${this.store.sortMode === "code" ? "ps-btn-primary" : ""}`; }
    renderQueue() {
      this.els.queueCount.textContent = this.store.selected.size;
      if (this.store.selected.size === 0) { this.els.queueList.innerHTML = `<span style="color:#565f89;font-size:10px;">未選択</span>`; return; }
      const isManualSort = this.store.sortMode === "select";
      this.els.queueList.innerHTML = this.store.getSortedSelectedList(this.site.getRankCalculator()).map(it => {
        const activeColor = this.store.getActiveColor(it), activePen = this.store.getActivePen(it), isSkip = (activePen === "--");
        const escKey = Utils.escapeHtml(`${it.brand}:${it.n}`), escN = Utils.escapeHtml(it.n), escC = Utils.escapeHtml(activeColor || '#fff'), escP = Utils.escapeHtml(activePen);
        return `<span class="ps-badge ps-drag-item" data-key="${escKey}" ${isManualSort ? 'draggable="true"' : ''} style="${isSkip ? 'opacity:0.6;' : ''}">${isManualSort ? `<span class="ps-drag-handle" title="ドラッグして移動">⠿</span>` : ''}<span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${escC};"></span><span style="${isSkip ? 'text-decoration:line-through;' : ''}">${escN}</span><span style="color:${isSkip ? '#f7768e' : '#7dcfff'};font-size:9px;font-family:monospace;">(${escP})</span><button data-del="${escKey}" style="background:none;border:none;color:#f7768e;cursor:pointer;padding:0 2px;line-height:1;">✕</button></span>`;
      }).join("");
    }
    renderUnitChips() {
      const units = this.store.getUnits();
      if (units.length === 0) { this.els.unitChips.style.display = "none"; this.els.unitChips.innerHTML = ""; this.store.selectedUnit = ""; return; }
      this.els.unitChips.style.display = "flex";
      this.els.unitChips.innerHTML = `<span class="ps-chip ${this.store.selectedUnit === '' ? 'active' : ''}" data-unit="">全て</span>${units.map(u => { const escU = Utils.escapeHtml(u); return `<span class="ps-chip ${this.store.selectedUnit === u ? 'active' : ''}" data-unit="${escU}">${escU}</span>`; }).join("")}`;
      this.els.unitChips.querySelectorAll(".ps-chip").forEach(chip => { chip.onclick = () => { this.store.selectedUnit = chip.getAttribute("data-unit"); this.renderUnitChips(); this.renderList(); }; });
    }
    renderList() {
      const list = this.store.getVisibleList();
      if (!list.length) { this.els.memberList.innerHTML = `<span style="color:#f7768e;display:block;padding:6px 0;">一致する項目がありません</span>`; return; }
      this.els.memberList.innerHTML = list.map(it => {
        const activeColor = this.store.getActiveColor(it), activePen = this.store.getActivePen(it), isSkip = (activePen === "--");
        const key = `${it.brand}:${it.n}`, escKey = Utils.escapeHtml(key), escN = Utils.escapeHtml(it.n), escC = Utils.escapeHtml(activeColor || '#fff'), escP = Utils.escapeHtml(activePen);
        const isChecked = this.store.selected.has(key), isFav = this.store.favorites.has(key);
        let tag = ""; if (it.role === "brand") tag = `<span class="ps-tag-brand">ブランド</span>`; else if (it.role === "staff") tag = `<span class="ps-tag-staff">事務員</span>`; else if (it.role === "unit_color") tag = `<span class="ps-tag-unit">ユニット</span>`;
        const showUnitTag = it.unit && !CONFIG.EXCLUDE_ROLES.includes(it.unit) && it.role === "idol" && !it.n.includes(it.unit);
        const unitTag = showUnitTag ? `<span style="font-size:9px;color:#565f89;margin-left:4px;">[${Utils.escapeHtml(it.unit)}]</span>` : "";
        const starHtml = (it.role === "idol" || it.role === "unit_color") ? `<button type="button" class="ps-star-btn ${isFav ? 'active' : ''}" data-fav="${escKey}" title="推しピン留め">${isFav ? '★' : '☆'}</button>` : `<span style="width:28px;display:inline-block;flex-shrink:0;"></span>`;
        return `<div class="ps-row ${isChecked ? 'selected' : ''}" data-rowkey="${escKey}" style="${isSkip ? 'opacity:0.6;' : ''}"><input type="checkbox" data-key="${escKey}" class="ps-k" ${isChecked ? "checked" : ""} style="cursor:pointer;flex-shrink:0;" ${isSkip ? 'disabled title="このモードではコードが未設定です"' : ''}>${starHtml}<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${escC};border:1px solid rgba(255,255,255,0.4);flex-shrink:0;"></span><span class="ps-name-label" data-key="${escKey}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; ${isSkip ? 'text-decoration:line-through;opacity:0.6;' : ''}">${escN}${tag}${unitTag}</span><span style="color:${isSkip ? '#f7768e' : '#7dcfff'};font-family:monospace;font-weight:bold;font-size:12px;flex-shrink:0;margin-left:4px;" title="${isSkip ? 'コード未設定のためスキップされます' : ''}">${escP}</span></div>`;
      }).join("");
    }
  }

  class App {
    constructor() { this.store = new Store(); this.siteAdapter = new SiteAdapter(); this.ui = new UIManager(this, this.store, this.siteAdapter); }
    init() {
      if (!window.location.href.includes("penlight-supporter.onrender.com")) return;
      if (this.ui.inject()) { this.siteAdapter.startObserving(); this.ui.renderQueue(); this.loadData(); }
    }
    async loadData(force = false) {
      if (!this.store.cache[this.store.currentBrand] || force) {
        this.ui.els.memberList.innerHTML = `<span style="color:#aaa;">${force ? '再取得中...' : '読込中...'}</span>`;
        this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, force);
      }
      this.ui.updateReloadTooltip(); this.ui.renderUnitChips(); this.ui.renderList();
    }
    async executeAutoAdd() {
      const targets = this.store.getSortedSelectedList(this.siteAdapter.getRankCalculator());
      if (!targets.length) { alert("メンバーを選択してください"); return; }
      this.ui.els.runBtn.disabled = true; this.siteAdapter.buildCache();

      let processTargets = [];
      if (this.store.mergeDuplicates) {
        const map = new Map();
        targets.forEach(it => {
          const pen = this.store.getActivePen(it);
          if (pen === "--") { processTargets.push({ ...it }); }
          else if (map.has(pen)) { map.get(pen).n += " / " + it.n; }
          else { map.set(pen, { ...it, n: it.n }); }
        });
        processTargets = [...processTargets, ...Array.from(map.values())];
      } else { processTargets = targets; }

      let count = 0; let skippedList = [];
      for (let i = 0; i < processTargets.length; i++) {
        const it = processTargets[i];
        const shortName = it.n.length > 15 ? it.n.substring(0, 15) + "..." : it.n;
        this.ui.els.runBtn.textContent = `[${i + 1}/${processTargets.length}] ${shortName}`;
        
        const activePen = this.store.getActivePen(it);
        if (activePen === "--") { skippedList.push(`・${it.n} (コード未設定)`); continue; }

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
          count++; await Utils.sleep(60);
        } else { skippedList.push(`・${it.n} (コード: ${activePen})`); }
      }

      this.ui.els.runBtn.disabled = false;
      this.ui.els.runBtn.textContent = `完了 (${count}/${processTargets.length}件)`;
      if (skippedList.length > 0) alert(`処理が完了しましたが、以下のメンバーはスキップされました（コード未設定または存在しないコード）：\n\n${skippedList.join('\n')}`);
      setTimeout(() => { this.ui.els.runBtn.textContent = "リストに追加する"; }, 2000);
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", () => new App().init()); } else { setTimeout(() => new App().init(), 500); }
})();