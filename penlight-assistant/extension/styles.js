/**
 * Penlight Assistant (for MIX PENLa PRO) - styles.js
 * パネルの見た目（CSS）
 * 色はすべて一番上の変数で管理しています（ダーク／ライト）。ライブ情報ポータルと同じ配色です。
 * サイズ・スマホ用レイアウトの調整もこのファイルだけで完結します。
 */
"use strict";

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
