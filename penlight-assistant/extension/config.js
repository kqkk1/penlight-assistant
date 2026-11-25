/**
 * Penlight Assistant (for MIX PENLa PRO) - config.js
 * 設定・定数
 * バージョン、スプシID、しきい値、56色名など。数値の調整はこのファイルだけで完結します。
 */
"use strict";

const CURRENT_VERSION = "4.6.2";

const CONFIG = {
  GITHUB_REPO: "kqkk1/penlight-assistant",
  DEFAULT_SPREADSHEET_ID: "1qQ1ezrI5ujr4YIi4hO3EmPSLRTULKtSSV_LQ1Q6SNGo",
  // 標準のスプシの内容を GitHub Actions が書き出したファイル（tools/build-colors.js）。カスタムスプシIDのときは使わず、スプシを直接読む
  COLORS_URL: "https://cdn.jsdelivr.net/gh/kqkk1/penlight-assistant@main/penlight-assistant/data/colors.json",
  SHEETS: ["765AS", "ミリオン", "学マス", "デレマス", "シャニマス", "SideM", "876", "その他"],
  KEYS: { FAV: "ps_fav_idols_v2", ID: "ps_custom_sheet_id", PEN: "ps_pen_mode", DUP: "ps_merge_dup", SORT: "ps_sort_mode", MERGE: "ps_merge_mode", STRENGTH: "ps_family_strength", BUNDLE: "ps_cache_colors", QUEUE: "ps_saved_queue", THEME: "ps_theme" },
  CACHE_EXPIRY: 24 * 60 * 60 * 1000,
  QUEUE_EXPIRY: 12 * 60 * 60 * 1000, // 追加予定を、ページを開き直しても戻せる時間
  MAX_COLORS: 50,
  TITLE_MAX: 12, // 公式サイトのタイトル欄の文字数上限
  // 同系色まとめのしきい値（OKLab距離）。グループ内の全員がこの距離以内のときだけまとめる
  FAMILY_THRESHOLDS: {
    "361": { weak: 0.04, medium: 0.09, strong: 0.12 },
    "56":  { weak: 0.06, medium: 0.10, strong: 0.15 }
  },
  // まとめの選択肢（設定画面に左から並ぶ）。保存の形式は以前と同じ（mergeMode と familyStrength）
  MERGE_OPTIONS: [
    { id: "none",   mode: "none",   label: "なし",       hint: "まとめずに1人1色で登録します" },
    { id: "exact",  mode: "exact",  label: "完全一致",   hint: "同じペンラコードの人を、連名で1色にまとめます" },
    { id: "weak",   mode: "family", strength: "weak",   label: "同系色・弱" },
    { id: "medium", mode: "family", strength: "medium", label: "同系色・中" },
    { id: "strong", mode: "family", strength: "strong", label: "同系色・強" }
  ],
  FAMILY_HINTS: {
    "361": {
      weak:   "ほぼ同じ色だけをまとめます（普段使いにおすすめ）",
      medium: "同じ系統（頭文字）内で近い色をまとめます",
      strong: "同じ系統（頭文字）内でやや離れた色までまとめます"
    },
    "56": {
      weak:   "同じ系統（頭文字）内でごく近い色だけをまとめます",
      medium: "同じ系統（頭文字）内で近い色をまとめます",
      strong: "同じ系統（頭文字）内でやや離れた色までまとめます"
    }
  },
  GROUP_ORDER: { R: 1, P: 2, V: 3, B: 4, GB: 5, G: 6, Y: 7, O: 8, W: 9, H: 10, D: 11 },
  EXCLUDE_ROLES: ["ブランド", "事務員", "ユニット"],
  SITE_RULES: {
    BTN_TITLE: "button[title]", 
    BTN_EDIT: 'button[aria-label="タイトルを編集"]', 
    INPUT_TEXT: 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])', 
    BTN_TITLE_REGEX: /^#(\d+)\s+([A-Z0-9\-]+)/i 
  }
};

// 公式「56色ブロック」の色名（ラベル表示用）
const BLOCK_NAMES = {
  R1: "レッド", R2: "エンジレッド", R3: "ルビー", R4: "ローズ",
  P1: "ピンク", P2: "ライトピンク", P3: "パッションピンク", P4: "クールピンク", P5: "ピーチ",
  P6: "フレンチローズ", P7: "サクラピンク", P8: "アッシュピンク", P9: "スミレピンク",
  V1: "バイオレット", V2: "パープル", V3: "ラベンダパープル", V4: "アメジスト", V5: "スミレ",
  B1: "ブルー", B2: "スカイブルー", B3: "ライトブルー", B4: "アイスブルー", B5: "ウォーターブルー",
  B6: "アクアブルー", B7: "ターコイズブルー", B8: "パステルブルー", B9: "ミントブルー",
  GB1: "クールグリーン", GB2: "パステルグリーン", GB3: "エメラルドグリーン",
  GB4: "ミントグリーン", GB5: "ロイドグリーン", GB6: "ターコイズグリーン",
  G1: "グリーン", G2: "イエローグリーン", G3: "ライトグリーン", G4: "アッシュグリーン",
  G5: "ペパーミントグリーン", G6: "ペールグリーン",
  Y1: "イエロー", Y2: "ライム", Y3: "アッシュイエロー", Y4: "ライトイエロー", Y5: "オパールイエロー",
  O1: "オレンジ", O2: "ライトオレンジ", O3: "パッションオレンジ", O4: "ヤマブキオレンジ",
  O5: "アッシュオレンジ", O6: "ペールオレンジ",
  D1: "ブラウン", D2: "アイボリーブラウン", D3: "ミルクティー",
  W1: "ホワイト", W2: "ウォームホワイト", H1: "ブラック"
};
