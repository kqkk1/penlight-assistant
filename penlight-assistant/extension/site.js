/**
 * Penlight Assistant (for MIX PENLa PRO) - site.js
 * 公式サイト（penlight-supporter）との接点
 * ボタン検索・入力欄の取得など。サイトの仕様変更時はここを直します。
 */
"use strict";

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
