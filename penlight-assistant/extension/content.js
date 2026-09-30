/**
 * Penlight Assistant (for MIX PENLa PRO)
 * Version: 4.3.0
 */
(() => {
  "use strict";

  if (window.__psHelperLoaded) return;
  window.__psHelperLoaded = true;

  const CURRENT_VERSION = "4.3.0";
  
  const CONFIG = {
    GITHUB_REPO: "kqkk1/penlight-assistant",
    DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
    SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
    KEYS: { FAV: "ps_fav_idols_v2", ID: "ps_custom_sheet_id", PEN: "ps_pen_mode", DUP: "ps_merge_dup", SORT: "ps_sort_mode" },
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    GROUP_ORDER: { R: 1, P: 2, V: 3, B: 4, GB: 5, G: 6, Y: 7, O: 8, W: 9, H: 10, D: 11 },
    EXCLUDE_ROLES: ["ブランド", "事務員", "ユニット"],
    SITE_RULES: {
      BTN_TITLE: "button[title]", 
      BTN_EDIT: 'button[aria-label="タイトルを編集"]', 
      INPUT_TEXT: 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])', 
      BTN_TITLE_REGEX: /^#(\d+)\s+([A-Z0-9\-]+)/i 
    }
  };

  const Utils = {
    sleep: ms => new Promise(r => setTimeout(r, ms)),
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
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(input, value);
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

  class Store {
    constructor() {
      this.cache = {}; this.selected = new Map(); this.counter = 0;
      this.showBrand = true; this.showStaff = true; this.showUnitColor = true; this.showVariant = false; 
      this.sortMode = localStorage.getItem(CONFIG.KEYS.SORT) || "select";
      this.penMode = localStorage.getItem(CONFIG.KEYS.PEN) || "361";
      this.mergeDuplicates = localStorage.getItem(CONFIG.KEYS.DUP) === "true";
      this.searchQuery = ""; this.selectedUnit = "";
      this.currentBrand = CONFIG.SHEETS[0];
      this.favorites = new Set(JSON.parse(localStorage.getItem(CONFIG.KEYS.FAV) || "[]"));
    }
    getActiveColor(it) { return (this.showVariant && it.c_v) ? it.c_v : (it.c || '#fff'); }
    getActivePen(it) { 
      let code = this.showVariant ? (this.penMode === "361" ? it.p_v_361 : it.p_v_56) : "";
      if (!code) code = this.penMode === "361" ? it.p_361 : it.p_56;
      return code || "--";
    }
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
    getVisibleList() {
      const list = this.cache[this.currentBrand] || [];
      return list.filter(it => {
        if (it.role === "brand" && !this.showBrand) return false;
        if (it.role === "staff" && !this.showStaff) return false;
        if (it.role === "unit_color" && !this.showUnitColor && it.unit !== this.selectedUnit) return false;
        if (this.selectedUnit && it.unit !== this.selectedUnit) return false;
        if (this.searchQuery && !it.n.toLowerCase().includes(this.searchQuery)) return false;
        return true;
      }).sort((a, b) => {
        const priority = i => (this.favorites.has(`${i.brand}:${i.n}`) ? 100 : 0) + (i.role === "brand" ? 40 : (i.role === "staff" ? 30 : (i.role === "unit_color" ? 20 : 0)));
        return (priority(b) - priority(a)) || ((a.rawIndex || 0) - (b.rawIndex || 0));
      });
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
      if (!force) {
        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey));
          if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_EXPIRY) return cached.data;
        } catch (e) {}
      }
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
            let role = /ブランド|プロ|プロダクション|学園/.test(name) || /ブランド/.test(unit) ? "brand" :
                       /事務員|小鳥|美咲|ちひろ|はづき|山村|亜紗里|社長/.test(name) || /事務員/.test(unit) ? "staff" :
                       /ユニット|色|カラー/.test(name) || /ユニット|色|カラー/.test(unit) ? "unit_color" : "idol";
            seen.add(name);
            items.push({ n: name, c: clean(cols[1]), p_361: p361, p_56: p56, unit, c_v: clean(cols[5]), p_v_361: ext(clean(cols[6])), p_v_56: ext(clean(cols[7])), sort_code: sortCode, brand: sheetName, role, rawIndex: i });
          }
        }
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: items }));
        return items;
      } catch (e) { return []; }
    }
  }

  class SiteAdapter {
    constructor() { this.btnCache = new Map(); this.indexMap = new Map(); }
    startObserving() {
      if (this.observer) return;
      this.observer = new MutationObserver(m => {
        if (m.some(x => x.addedNodes.length)) {
          clearTimeout(this.cacheTimer);
          this.cacheTimer = setTimeout(() => this.buildCache(), 300);
        }
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
    buildCache() {
      this.btnCache.clear(); this.indexMap.clear();
      document.querySelectorAll(CONFIG.SITE_RULES.BTN_TITLE).forEach(btn => {
        const m = (btn.getAttribute("title") || "").match(CONFIG.SITE_RULES.BTN_TITLE_REGEX);
        if (m) { this.indexMap.set(m[2].toUpperCase(), parseInt(m[1], 10)); this.btnCache.set(m[2].toUpperCase(), btn); }
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
        if (codeStr === "--") return 999999;
        const code = (codeStr || "").trim().toUpperCase();
        if (!this.indexMap.size) this.buildCache();
        if (this.indexMap.has(code)) return this.indexMap.get(code);
        const m = code.match(/^([A-Z]+)(\d+)?(?:-(\d+))?/);
        return m ? (CONFIG.GROUP_ORDER[m[1]] || 90) * 10000 + (parseInt(m[2] || "0", 10) * 100) + parseInt(m[3] || "0", 10) : 99999;
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

  class UIManager {
    constructor(app, store, site) {
      this.app = app; this.store = store; this.site = site;
      this.els = {}; this.isQueueOpen = false;
    }

    inject() {
      if (document.getElementById("ps-m")) return false;
      this.injectStyles(); this.buildHTML(); this.cacheElements(); this.bindEvents(); this.checkUpdate();
      return true;
    }

    async checkUpdate() {
      if(CONFIG.GITHUB_REPO.includes("YOUR_GITHUB_NAME")) return;
      try {
        const res = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_REPO}/releases/latest`);
        if (!res.ok) return; 
        const latestVer = (await res.json()).tag_name?.replace(/^v/, "");
        if (latestVer && latestVer !== CURRENT_VERSION) {
          const b = document.createElement("div");
          b.style.cssText = "background:#ff9e64;color:#15161e;font-weight:bold;font-size:11px;padding:6px;text-align:center;cursor:pointer;border-radius:4px;margin-bottom:6px;flex-shrink:0;";
          b.innerHTML = `📢 新バージョン(v${latestVer})が公開されています！クリックして更新ページへ`;
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
      s.textContent = `
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
        .ps-opt-lbl { font-size:10px; color:#565f89; width:40px; flex-shrink:0; text-align:right; font-weight:bold; }
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
        
        .ps-star-btn { background:none; border:none; font-size:15px; line-height:1; cursor:pointer; padding:0 6px; color:#565f89; flex-shrink:0; transition:0.12s; }
        .ps-star-btn:hover { transform:scale(1.2); color:#e0af68; }
        .ps-star-btn.active { color:#e0af68 !important; text-shadow:0 0 6px rgba(224,175,104,0.5); }
        .ps-chip { padding:2px 7px; border-radius:10px; font-size:10px; cursor:pointer; background:#1f2335; color:#9aa5ce; border:1px solid #3b4261; white-space:nowrap; user-select:none; transition:0.12s; }
        .ps-chip:hover { background:#24283b; color:#fff; }
        .ps-chip.active { background:#7aa2f722; color:#7aa2f7; border-color:#7aa2f7; font-weight:bold; }
        
        .ps-drag-item { transition: 0.1s; }
        .ps-drag-item.dragging { opacity: 0.4; transform: scale(0.95); }
        .ps-drag-item.drag-over { border: 1px dashed #7aa2f7; filter: brightness(1.3); }
        
        .ps-drag-handle { cursor: grab; padding: 2px 4px; margin-left:-2px; color: #565f89; user-select: none; touch-action: none; transition: 0.2s; }
        .ps-drag-handle.disabled { cursor: not-allowed; opacity: 0.25; }
        
        #ps-queue-list { max-height: 120px; align-content: flex-start; }
        
        #ps-toast-container { position: fixed; bottom: 85px; right: 24px; z-index: 9999999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .ps-toast { background: #1f2335; color: #c0caf5; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #7aa2f7; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-size: 12px; font-weight: bold; transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s; opacity: 0; pointer-events: auto; white-space: pre-wrap; line-height: 1.4; }
        .ps-toast.show { transform: translateX(0); opacity: 1; }
        .ps-toast.error { border-left-color: #f7768e; color: #f7768e; }
        
        #ps-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 9999999999; display: none; justify-content: center; align-items: center; backdrop-filter: blur(2px); opacity: 0; transition: opacity 0.2s; font-family:-apple-system,sans-serif; }
        #ps-modal { background: #1a1b26; border: 1px solid #3b4261; border-radius: 12px; padding: 20px; width: 320px; max-width: 90vw; box-shadow: 0 10px 30px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.2s; }
        #ps-modal.show { transform: translateY(0); }
        .ps-modal-title { font-size: 15px; font-weight: bold; color: #7aa2f7; margin-bottom: 10px; }
        .ps-modal-msg { font-size: 13px; color: #a9b1d6; margin-bottom: 16px; line-height: 1.5; white-space: pre-wrap; }
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
          
          #ps-queue-list { max-height: 110px !important; gap: 4px !important; }
          
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
        }
      `;
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
              <div class="ps-opt-group" style="border-bottom:none;">
                <span class="ps-opt-lbl">動作:</span>
                <div style="display:flex;align-items:center;min-height:24px;flex:1;">
                  <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:#a9b1d6;" title="同じカラーを連名にして1つにまとめます">
                    <input type="checkbox" id="ps-toggle-merge" ${this.store.mergeDuplicates ? "checked" : ""} style="accent-color:#f7768e;">
                    重複カラーを1つにまとめる(連名登録)
                  </label>
                </div>
              </div>
              <div style="margin-top:2px;">
                <div id="ps-opt-adv-toggle" style="cursor:pointer;font-size:10px;color:#565f89;text-align:center;padding:4px;background:#1a1b26;border-radius:4px;">▾ 詳細設定を開く (スプシID等)</div>
                <div id="ps-opt-adv-panel" style="display:none;flex-direction:column;gap:4px;margin-top:6px;padding-top:6px;border-top:1px dashed #2f3549;">
                  <span style="font-size:10px;color:#9aa5ce;">カスタムスプレッドシートID:</span>
                  <div style="display:flex;gap:4px;"><input type="text" id="ps-sheet-id" class="ps-input" style="flex:1;" placeholder="空欄でデフォルト" value="${Utils.escapeHtml(customId)}"><button id="ps-sheet-save" class="ps-btn ps-btn-primary">適用</button></div>
                </div>
              </div>
            </div>
            <div style="background:#13141c;border:1px solid #2f3549;border-radius:6px;padding:5px 8px;flex-shrink:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span id="ps-queue-toggle" style="font-size:11px;color:#7dcfff;cursor:pointer;">追加予定: <b id="ps-queue-count">0</b>名 <span id="ps-queue-arrow">▾</span></span>
                <div style="display:flex;gap:4px;">
                  <button id="ps-extract" class="ps-btn" style="background:#3d59a1;color:#fff;">📋抽出</button>
                  <button id="ps-import" class="ps-btn">読込</button>
                  <button id="ps-export" class="ps-btn">保存</button>
                  <button id="ps-clear-queue" style="background:none;border:none;color:#f7768e;cursor:pointer;font-size:10px;margin-left:4px;">全クリア</button>
                </div>
              </div>
              <div id="ps-queue-list" style="display:none;flex-wrap:wrap;gap:4px;overflow-y:auto;margin-top:5px;padding-top:5px;border-top:1px dashed #2f3549;"></div>
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;">
              <select id="ps-b" class="ps-input" style="flex:1;">${opts}</select>
              <input type="text" id="ps-search" class="ps-input" placeholder="名前検索(Escでクリア)..." style="width:130px;">
              <button id="ps-reload" class="ps-btn" title="再取得・キャッシュクリア" style="padding:4px 8px;">↻</button>
            </div>
            <div id="ps-unit-chips" style="display:none;flex-wrap:nowrap;overflow-x:auto;gap:4px;padding:2px 0;flex-shrink:0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0 2px;flex-shrink:0;">
              <span style="font-size:10px;color:#565f89;">選択操作:</span>
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
        radios: document.querySelectorAll('input[name="ps-pen-mode"]'), merge: get("ps-toggle-merge"),
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
      
      e.min.onclick = () => { e.m.style.display = "none"; e.fab.style.display = "flex"; };
      e.fab.onclick = () => { e.fab.style.display = "none"; e.m.style.display = "flex"; e.m.style.height = this.savedHeight || "750px"; };
      
      e.optBtn.onclick = () => { const show = e.optPanel.style.display === "flex"; e.optPanel.style.display = show ? "none" : "flex"; e.optBtn.style.color = show ? "#a9b1d6" : "#7aa2f7"; };
      e.advBtn.onclick = () => { const show = e.advPanel.style.display === "flex"; e.advPanel.style.display = show ? "none" : "flex"; e.advBtn.textContent = show ? "▾ 詳細設定を開く (スプシID等)" : "▴ 詳細設定を閉じる"; };
      e.qTog.onclick = () => { this.isQueueOpen = !this.isQueueOpen; e.qList.style.display = this.isQueueOpen ? "flex" : "none"; e.qArr.textContent = this.isQueueOpen ? "▴" : "▾"; };
      
      Object.entries(e.sort).forEach(([mode, btn]) => {
        btn.onclick = () => { s.setPref("sortMode", mode, "SORT"); Object.values(e.sort).forEach(b => b.classList.remove("active")); btn.classList.add("active"); this.renderQueue(); };
      });
      
      e.toggles.brand.onchange = ev => { s.showBrand = ev.target.checked; this.renderList(); };
      e.toggles.staff.onchange = ev => { s.showStaff = ev.target.checked; this.renderList(); };
      e.toggles.uc.onchange = ev => { s.showUnitColor = ev.target.checked; this.renderList(); };
      e.toggles.var.onchange = ev => { s.showVariant = ev.target.checked; this.renderQueue(); this.renderList(); };
      e.merge.onchange = ev => s.setPref("mergeDuplicates", ev.target.checked, "DUP");
      e.radios.forEach(r => r.onchange = ev => { if (ev.target.checked) { s.setPref("penMode", ev.target.value, "PEN"); this.renderQueue(); this.renderList(); } });
      
      e.save.onclick = () => {
        const val = e.sid.value.trim();
        val ? localStorage.setItem(CONFIG.KEYS.ID, val) : localStorage.removeItem(CONFIG.KEYS.ID);
        this.showToast(val ? "カスタムIDを適用しました。\nデータを再取得します。" : "デフォルトに戻しました。\nデータを再取得します。");
        CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`));
        s.cache = {}; this.app.loadData(true);
      };
      
      e.search.oninput = ev => { s.searchQuery = ev.target.value.trim().toLowerCase(); this.renderList(); };
      e.search.onkeydown = ev => { if (ev.key === "Escape") { e.search.value = s.searchQuery = ""; this.renderList(); } };
      e.brand.onchange = () => { e.search.value = s.searchQuery = s.selectedUnit = ""; s.currentBrand = e.brand.value; this.app.loadData(false); };
      
      e.reload.onclick = () => { CONFIG.SHEETS.forEach(sheet => localStorage.removeItem(`ps_cache_${sheet}`)); s.cache = {}; this.app.loadData(true); };
      e.sa.onclick = () => { s.getVisibleList().forEach(it => { const key = `${it.brand}:${it.n}`; if (!s.selected.has(key)) s.selected.set(key, { ...it, selectOrder: ++s.counter }); }); this.renderQueue(); this.renderList(); };
      e.ca.onclick = () => { (s.cache[s.currentBrand] || []).forEach(it => s.selected.delete(`${it.brand}:${it.n}`)); this.renderQueue(); this.renderList(); };
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
          const key = ev.target.getAttribute("data-key"), it = (s.cache[s.currentBrand] || []).find(i => `${i.brand}:${i.n}` === key);
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
      e.qList.onclick = ev => { const delKey = ev.target.closest("button")?.getAttribute("data-del"); if (delKey) { s.selected.delete(delKey); this.renderQueue(); this.renderList(); } };

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
        if (!input) return;
        const text = input.replace(/\s+/g, '').toLowerCase();
        
        const orig = e.ext.textContent; e.ext.textContent = "⏳抽出中..."; e.ext.disabled = true; let added = 0;
        try {
          await Promise.all(CONFIG.SHEETS.map(async sheet => { if (!s.cache[sheet]) s.cache[sheet] = await DataFetcher.fetch(sheet, false); }));
          CONFIG.SHEETS.forEach(sheet => (s.cache[sheet] || []).forEach(it => {
            const cleanName = it.n.replace(/\s+/g, '').toLowerCase();
            if (it.role === "idol" && cleanName.length > 1 && text.includes(cleanName)) {
              const key = `${it.brand}:${it.n}`; if (!s.selected.has(key)) { s.selected.set(key, { ...it, selectOrder: ++s.counter }); added++; }
            }
          }));
          this.renderQueue(); this.renderList();
          if (added > 0) this.showToast(`🎉 抽出完了！\n合計 ${added} 名を追加しました。`);
          else this.showToast("一致するアイドルが見つかりませんでした。", true);
        } catch (err) { this.showToast("抽出処理中にエラーが発生しました。", true); } finally { e.ext.textContent = orig; e.ext.disabled = false; }
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

      e.run.onclick = () => this.app.executeAutoAdd();
    }

    renderQueue() {
      const e = this.els, s = this.store;
      e.qCount.textContent = s.selected.size;
      if (!s.selected.size) { e.qList.innerHTML = `<span style="color:#565f89;font-size:10px;">未選択</span>`; return; }
      const isSelect = s.sortMode === "select";
      e.qList.innerHTML = s.getSortedSelectedList(this.site.getRankCalculator()).map(it => {
        const aCol = Utils.escapeHtml(s.getActiveColor(it) || '#fff'), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
        const key = Utils.escapeHtml(`${it.brand}:${it.n}`), n = Utils.escapeHtml(it.n);
        
        const handleHtml = `<span class="ps-drag-handle ${isSelect ? '' : 'disabled'}" title="${isSelect ? 'ドラッグして移動' : '自動ソート中は手動移動できません'}">⠿</span>`;
        
        return `<span class="ps-badge ps-drag-item" data-key="${key}" ${isSelect ? 'draggable="true"' : ''} style="${isSkip ? 'opacity:0.6;' : ''}">${handleHtml}<span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:${aCol};"></span><span style="${isSkip ? 'text-decoration:line-through;' : ''}">${n}</span><span style="color:${isSkip ? '#f7768e' : '#7dcfff'};font-size:9px;font-family:monospace;">(${aPen})</span><button data-del="${key}" style="background:none;border:none;color:#f7768e;cursor:pointer;padding:0 2px;">✕</button></span>`;
      }).join("");
    }

    renderUnitChips() {
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
      this.els.list.innerHTML = list.map(it => {
        const aCol = Utils.escapeHtml(s.getActiveColor(it) || '#fff'), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
        const key = `${it.brand}:${it.n}`, escKey = Utils.escapeHtml(key), n = Utils.escapeHtml(it.n);
        const isChk = s.selected.has(key), isFav = s.favorites.has(key);
        const tag = it.role === "brand" ? `<span class="ps-tag ps-tag-brand">ブランド</span>` : it.role === "staff" ? `<span class="ps-tag ps-tag-staff">事務員</span>` : it.role === "unit_color" ? `<span class="ps-tag ps-tag-unit">ユニット</span>` : "";
        const uTag = it.unit && !CONFIG.EXCLUDE_ROLES.includes(it.unit) && it.role === "idol" && !it.n.includes(it.unit) ? `<span style="font-size:9px;color:#565f89;margin-left:4px;">[${Utils.escapeHtml(it.unit)}]</span>` : "";
        const star = `<button type="button" class="ps-star-btn ${isFav ? 'active' : ''}" data-fav="${escKey}" title="推しピン留め">${isFav ? '★' : '☆'}</button>`;
        return `<div class="ps-row ${isChk ? 'selected' : ''}" data-rowkey="${escKey}" style="${isSkip ? 'opacity:0.6;' : ''}"><input type="checkbox" data-key="${escKey}" class="ps-k" ${isChk ? "checked" : ""} ${isSkip ? 'disabled title="未設定"' : ''}>${star}<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${aCol};border:1px solid rgba(255,255,255,0.4);flex-shrink:0;"></span><span class="ps-name-label" data-key="${escKey}" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; ${isSkip ? 'text-decoration:line-through;opacity:0.6;' : ''}">${n}${tag}${uTag}</span><span style="color:${isSkip ? '#f7768e' : '#7dcfff'};font-family:monospace;font-weight:bold;font-size:12px;flex-shrink:0;margin-left:4px;">${aPen}</span></div>`;
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
        this.ui.els.list.innerHTML = `<span style="color:#aaa;">${force ? '再取得中...' : '読込中...'}</span>`;
        this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, force);
      }
      this.ui.renderUnitChips(); this.ui.renderList();
    }
    async executeAutoAdd() {
      const targets = this.store.getSortedSelectedList(this.siteAdapter.getRankCalculator());
      if (!targets.length) return this.ui.showToast("メンバーを選択してください", true);
      this.ui.els.run.disabled = true; this.siteAdapter.buildCache();

      let pTargets = targets;
      if (this.store.mergeDuplicates) {
        const map = new Map(); pTargets = [];
        targets.forEach(it => {
          const pen = this.store.getActivePen(it);
          if (pen === "--") pTargets.push({ ...it });
          else map.has(pen) ? map.get(pen).n += " / " + it.n : map.set(pen, { ...it, n: it.n });
        });
        pTargets.push(...map.values());
      }

      const validTargets = pTargets.filter(it => this.store.getActivePen(it) !== "--");
      if (validTargets.length > 50) {
        await this.ui.openModal({ 
          title: "⚠️ 登録上限オーバー", 
          message: `一度に登録できるのは「50色」までです。\n（現在: ${validTargets.length}色 追加予定）\n\n※「連名登録」をONにすると、同じ色のアイドルが1色として合算されるため、上限に収まる場合があります。`, 
          hideCancel: true 
        });
        this.ui.els.run.disabled = false;
        return;
      }

      let count = 0, skipped = [];
      for (let i = 0; i < pTargets.length; i++) {
        const it = pTargets[i], activePen = this.store.getActivePen(it);
        this.ui.els.run.textContent = `[${i + 1}/${pTargets.length}] ${it.n.substring(0, 15)}${it.n.length > 15 ? "..." : ""}`;
        if (activePen === "--") { skipped.push(`・${it.n} (コード未設定)`); continue; }

        const btn = this.siteAdapter.getButton(activePen);
        if (btn) {
          btn.scrollIntoView({ block: "nearest", inline: "nearest" });
          const before = this.siteAdapter.getEditButtons();
          Utils.simulateClick(btn); await Utils.sleep(80);
          const after = this.siteAdapter.getEditButtons();
          const newBtn = after.find(el => !before.includes(el)) || after[after.length - 1];
          if (newBtn) {
            const inBefore = this.siteAdapter.getSiteInputs();
            Utils.simulateClick(newBtn); await Utils.sleep(50);
            const inAfter = this.siteAdapter.getSiteInputs();
            const targetIn = inAfter.find(el => !inBefore.includes(el)) || inAfter[inAfter.length - 1];
            if (targetIn) { Utils.setInputValue(targetIn, it.n); targetIn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })); }
          }
          count++; await Utils.sleep(60);
        } else skipped.push(`・${it.n} (コード: ${activePen})`);
      }
      this.ui.els.run.disabled = false; this.ui.els.run.textContent = `完了 (${count}/${pTargets.length}件)`;
      
      if (skipped.length) {
        await this.ui.openModal({ title: "お知らせ", message: `以下のメンバーはスキップされました：\n\n${skipped.join('\n')}`, hideCancel: true });
      } else {
        this.ui.showToast(`🎉 処理が完了しました！`);
      }
      setTimeout(() => this.ui.els.run.textContent = "リストに追加する", 2000);
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => new App().init()) : setTimeout(() => new App().init(), 500);
})();