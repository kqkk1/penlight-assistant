/**
 * Penlight Assistant (for MIX PENLa PRO) - styles.js
 * パネルの見た目（CSS）
 * 色・サイズ・スマホ用レイアウトの調整はこのファイルだけで完結します。
 */
"use strict";

const PS_STYLES = `
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
  #ps-m .ps-btn { white-space:nowrap; }
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
  .ps-merge { display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); background:#1a1b26; border-radius:6px; border:1px solid #3b4261; overflow:hidden; }
  .ps-merge button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; min-height:34px; padding:3px 2px; font-size:10px; line-height:1.15; cursor:pointer; color:#9aa5ce; background:transparent; border:none; border-right:1px solid #3b4261; transition:0.15s; }
  .ps-merge button:last-child { border-right:none; }
  .ps-merge button:hover { background:#24283b; color:#fff; }
  .ps-merge button.active { color:#15161e; background:#7aa2f7; font-weight:bold; }
  .ps-mlabel { white-space:nowrap; }
  .ps-mcount { font-size:9px; opacity:0.85; font-weight:normal; }
  .ps-mcount.over { color:#f7768e; opacity:1; }
  .ps-merge button.active .ps-mcount.over { color:#8c1d2f; }
  .ps-limit { margin-top:5px; padding:5px 6px; border-radius:4px; background:#2d202a; border:1px solid #f7768e; color:#f7a1b3; font-size:10px; line-height:1.5; }
  .ps-limit .ps-btn { margin-left:4px; padding:2px 6px; font-size:10px; background:#7aa2f7; color:#15161e; font-weight:bold; }
  #ps-run.over { background:#e0af68; color:#15161e; }
  .ps-opt-group { display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #2f3549; }
  .ps-opt-group:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
  .ps-opt-lbl { font-size:10px; color:#8a93c0; width:40px; flex-shrink:0; text-align:right; font-weight:bold; }
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
  
  .ps-star-btn { background:none; border:none; font-size:15px; line-height:1; cursor:pointer; padding:0 6px; color:#737aa2; flex-shrink:0; transition:0.12s; }
  .ps-star-btn:hover { transform:scale(1.2); color:#e0af68; }
  .ps-star-btn.active { color:#e0af68 !important; text-shadow:0 0 6px rgba(224,175,104,0.5); }
  .ps-chip { padding:2px 7px; border-radius:10px; font-size:10px; cursor:pointer; background:#1f2335; color:#9aa5ce; border:1px solid #3b4261; white-space:nowrap; user-select:none; transition:0.12s; }
  .ps-chip:hover { background:#24283b; color:#fff; }
  .ps-chip.active { background:#7aa2f722; color:#7aa2f7; border-color:#7aa2f7; font-weight:bold; }
  
  .ps-drag-item { transition: 0.1s; }
  .ps-drag-item.dragging { opacity: 0.4; transform: scale(0.95); }
  .ps-drag-item.drag-over { border: 1px dashed #7aa2f7; filter: brightness(1.3); }
  
  .ps-drag-handle { cursor: grab; padding: 2px 4px; margin-left:-2px; color: #737aa2; user-select: none; touch-action: none; transition: 0.2s; }
  .ps-drag-handle.disabled { cursor: not-allowed; opacity: 0.25; }
  
  #ps-queue-list { max-height: 160px; align-content: flex-start; }
  .ps-sw { display:inline-block; width:9px; height:9px; border-radius:2px; flex-shrink:0; }
  .ps-code { color:#7dcfff; font-size:9px; font-family:monospace; }
  .ps-group { flex-basis:100%; background:#1f2335; border:1px solid #3d59a1; border-radius:4px; }
  .ps-group-head { display:flex; align-items:center; gap:4px; padding:3px 6px; cursor:pointer; font-size:11px; user-select:none; }
  .ps-group-head:hover { background:#24283b; }
  .ps-group-name { font-weight:bold; color:#c0caf5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ps-group-meta { margin-left:auto; color:#8a93c0; font-size:10px; white-space:nowrap; }
  .ps-group-body { display:flex; flex-wrap:wrap; gap:4px; padding:4px 6px 6px; border-top:1px dashed #2f3549; }
  .ps-brand-head { font-size:10px; font-weight:bold; color:#7aa2f7; padding:6px 4px 3px; border-bottom:1px solid #2f3549; margin-bottom:2px; position:sticky; top:-4px; background:#13141c; z-index:1; }
  #ps-run.running { background:#f7768e !important; color:#15161e !important; }
  
  #ps-toast-container { position: fixed; bottom: 85px; right: 24px; z-index: 9999999999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .ps-toast { background: #1f2335; color: #c0caf5; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #7aa2f7; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-size: 12px; font-weight: bold; transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s; opacity: 0; pointer-events: auto; white-space: pre-wrap; line-height: 1.4; }
  .ps-toast.show { transform: translateX(0); opacity: 1; }
  .ps-toast.error { border-left-color: #f7768e; color: #f7768e; }
  
  #ps-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 9999999999; display: none; justify-content: center; align-items: center; backdrop-filter: blur(2px); opacity: 0; transition: opacity 0.2s; font-family:-apple-system,sans-serif; }
  #ps-modal { background: #1a1b26; border: 1px solid #3b4261; border-radius: 12px; padding: 20px; width: 320px; max-width: 90vw; box-shadow: 0 10px 30px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.2s; }
  #ps-modal.show { transform: translateY(0); }
  .ps-modal-title { font-size: 15px; font-weight: bold; color: #7aa2f7; margin-bottom: 10px; }
  .ps-modal-msg { font-size: 13px; color: #a9b1d6; margin-bottom: 16px; line-height: 1.5; white-space: pre-wrap; max-height: 50vh; overflow-y: auto; }
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
    
    #ps-queue-list { max-height: 140px !important; gap: 4px !important; }
    .ps-group-head { padding: 8px 10px; font-size: 12px; }
    .ps-brand-head { font-size: 11px; padding: 8px 4px 4px; }
    
    #ps-sa, #ps-ca { padding: 6px 12px !important; font-size: 12px !important; font-weight: bold !important; border-radius: 6px !important; }
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
