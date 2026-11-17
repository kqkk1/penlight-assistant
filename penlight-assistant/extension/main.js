/**
 * Penlight Assistant (for MIX PENLa PRO) - main.js
 * 起動と全体の流れ
 * App: 初期化、データ読込、URLパラメータ連携、公式サイトへの自動登録
 */
"use strict";

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
      // colors.json のブランド一覧が変わっていたら、選択肢を作り直す
      if (DataFetcher.sheetsChanged) {
        DataFetcher.sheetsChanged = false;
        const before = this.store.currentBrand;
        this.ui.renderBrandOptions();
        if (this.store.currentBrand !== before) this.store.cache[this.store.currentBrand] = await DataFetcher.fetch(this.store.currentBrand, false);
      }
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
