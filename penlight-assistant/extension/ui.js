/**
 * Penlight Assistant (for MIX PENLa PRO) - ui.js
 * パネルの画面（HTML・操作・描画）
 * UIManager: パネル生成、ボタン操作、追加予定／一覧の描画、抽出処理
 */
"use strict";

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
