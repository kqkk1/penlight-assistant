/**
 * Penlight Assistant (for MIX PENLa PRO) - ui.js
 * パネルの画面（HTML・操作・描画）
 * UIManager: パネル生成、ボタン操作、追加予定／一覧の描画、抽出処理
 */
"use strict";

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
              <div id="ps-limit" class="ps-limit" style="display:none;" role="alert"></div>
              <div id="ps-queue-list"></div>
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
      sid: get("ps-sheet-id"), save: get("ps-sheet-save"), qTog: get("ps-queue-toggle"), chips: get("ps-unit-chips"),
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

  // 追加予定の一覧を開く／閉じる
  setQueueOpen(open) {
    const e = this.els;
    this.isQueueOpen = open;
    e.qList.style.display = open ? "flex" : "none";
    e.qTog.setAttribute("aria-expanded", open);
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
    if (!s.selected.size) {
      e.qMerged.textContent = ""; e.qMerged.className = ""; this.setMeter(0);
      e.qList.innerHTML = `<span class="ps-qempty">まだ選ばれていません。下の一覧で1人ずつ選ぶか、「まとめて追加」で出演者の一覧を貼り付けて一度に入れられます。</span>`;
      e.limit.style.display = "none"; this.renderMergeCounts(null); this.updateRunLabel(0, 0);
      return;
    }
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
    const canDrag = s.sortMode === "select" && !merged;
    const badge = (it, withHandle) => {
      const aCol = Utils.safeColor(s.getActiveColor(it)), aPen = Utils.escapeHtml(s.getActivePen(it)), isSkip = aPen === "--";
      const key = Utils.escapeHtml(`${it.brand}:${it.n}`), n = Utils.escapeHtml(it.n);
      const handle = withHandle ? `<span class="ps-drag-handle ${canDrag ? '' : 'disabled'}" title="${canDrag ? 'ドラッグして移動' : '並びが「選んだ順」以外、またはまとめ中は手動で動かせません'}">${psIcon("grip")}</span>` : "";
      return `<span class="ps-badge ps-drag-item ${isSkip ? 'skip' : ''}" data-key="${key}" ${canDrag ? 'draggable="true"' : ''}>${handle}<span class="ps-sw" style="background:${aCol};"></span><span class="ps-bname">${n}</span><span class="ps-code">${aPen}</span><button type="button" class="ps-del" data-del="${key}" title="外す" aria-label="${n}を外す">${psIcon("close")}</button></span>`;
    };

    // まとめなし: 1人ずつ（並べ替え可）
    if (!merged) { e.qList.innerHTML = sorted.map(it => badge(it, true)).join(""); return; }

    // まとめあり: 登録される単位で表示。複数人のグループはタップで中身を開く（スマホでも確認できる）
    e.qList.innerHTML = groups.map(g => {
      if (g.members.length === 1) return badge(g.members[0], false);
      const rawKey = `${g.members[0].brand}:${g.members[0].n}`, open = this.openGroups.has(rawKey);
      const repItem = g.members.find(m => s.getActivePen(m) === g.pen) || g.members[0];
      return `<div class="ps-group ${open ? 'open' : ''}">
        <button type="button" class="ps-group-head" data-gtoggle="${Utils.escapeHtml(rawKey)}" aria-expanded="${open}">
          <span class="ps-sw" style="background:${Utils.safeColor(s.getActiveColor(repItem))};"></span>
          <span class="ps-group-name">${Utils.escapeHtml(g.n)}</span><span class="ps-code">${Utils.escapeHtml(g.pen)}</span>
          <span class="ps-group-meta">${g.label ? Utils.escapeHtml(g.label) + "・" : ""}${g.members.length}名${psIcon("chevron")}</span>
        </button>
        ${open ? `<div class="ps-group-body">${g.members.map(m => badge(m, false)).join("")}</div>` : ""}
      </div>`;
    }).join("");
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
