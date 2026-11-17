/**
 * Penlight Assistant (for MIX PENLa PRO) - grouper.js
 * まとめ処理（なし／完全一致／同系色）
 * 同系色クラスタリングと登録名（12文字）の生成
 */
"use strict";

class ColorGrouper {
  static build(targets, store, rankCalc) {
    const mode = store.mergeMode;
    const is361 = store.penMode !== "56";
    const entries = targets.map((it, idx) => {
      const sp = store.getActiveSpec(it);
      return { it, idx, pen: sp.pen, lab: sp.pen !== "--" ? ColorUtil.hexToOklab(sp.hex) : null, code: ColorUtil.parseCode(sp.pen) };
    });

    // 1) 初期グループ: 同じペンラコード同士
    let clusters = [];
    const keyed = new Map();
    entries.forEach(e => {
      if (e.pen === "--" || mode === "none") { clusters.push([e]); return; }
      const key = e.pen;
      if (!keyed.has(key)) { const c = []; keyed.set(key, c); clusters.push(c); }
      keyed.get(key).push(e);
    });

    // 2) 同系色: 同じ頭文字の中で完全連結クラスタリング
    if (mode === "family") {
      const table = CONFIG.FAMILY_THRESHOLDS[is361 ? "361" : "56"];
      const th = table[store.familyStrength];
      if (th != null) clusters = ColorGrouper.completeLinkage(clusters, th);
    }

    // 3) 出力（並び順: 公式順は代表コード順、それ以外は先頭メンバーの位置）
    const groups = clusters.map(members => ColorGrouper.finalize(members, mode, store.favorites));
    const key = g => store.sortMode === "code" ? [rankCalc(g.pen), g.firstIdx] : [g.firstIdx, 0];
    return groups.sort((a, b) => { const [a1, a2] = key(a), [b1, b2] = key(b); return (a1 - b1) || (a2 - b2); });
  }

  static completeLinkage(clusters, th) {
    const out = [], byPrefix = new Map();
    clusters.forEach(c => {
      if (c[0].pen === "--") { out.push(c); return; }
      const p = c[0].code.prefix;
      if (!byPrefix.has(p)) byPrefix.set(p, []);
      byPrefix.get(p).push(c.slice());
    });
    byPrefix.forEach(list => {
      for (;;) {
        let best = null;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const d = ColorGrouper.linkage(list[i], list[j]);
            if (d <= th && (!best || d < best.d)) best = { i, j, d };
          }
        }
        if (!best) break;
        list[best.i] = list[best.i].concat(list[best.j]).sort((a, b) => a.idx - b.idx);
        list.splice(best.j, 1);
      }
      out.push(...list);
    });
    return out;
  }

  // 完全連結: 2グループ間で最も離れたメンバー同士の距離（色が読めない場合はまとめない）
  static linkage(a, b) {
    let max = -1;
    for (const x of a) {
      if (!x.lab) continue;
      for (const y of b) {
        if (!y.lab) continue;
        const d = ColorUtil.dist(x.lab, y.lab);
        if (d > max) max = d;
      }
    }
    return max < 0 ? Infinity : max;
  }

  static finalize(members, mode, favorites) {
    const first = members[0];
    const base = { members: members.map(m => m.it), firstIdx: first.idx };
    if (members.length === 1) return { ...base, n: first.it.n, pen: first.pen, label: "" };

    // 代表ボタン: OKLab重心に最も近いメンバーのコード
    let rep = first;
    const withLab = members.filter(m => m.lab);
    if (withLab.length) {
      const c = [0, 1, 2].map(k => withLab.reduce((s, m) => s + m.lab[k], 0) / withLab.length);
      rep = withLab.reduce((best, m) => ColorUtil.dist(m.lab, c) < ColorUtil.dist(best.lab, c) ? m : best);
    }
    // ラベル（プレビューのツールチップ用）: グループ内で最も多い56色ブロック名
    const counts = new Map();
    members.forEach(m => counts.set(m.code.block, (counts.get(m.code.block) || 0) + 1));
    let block = rep.code.block, maxCount = counts.get(block) || 0;
    counts.forEach((v, k) => { if (v > maxCount) { maxCount = v; block = k; } });
    const label = BLOCK_NAMES[block] || `${rep.code.prefix}系`;

    // 看板（キュー順で最初のお気に入り → いなければ先頭）を先頭に並べ、12文字に収める
    const lead = members.find(m => favorites.has(`${m.it.brand}:${m.it.n}`)) || first;
    const names = [lead, ...members.filter(m => m !== lead)].map(m => m.it.n);
    return { ...base, n: ColorGrouper.fitName(names), pen: rep.pen, label };
  }

  // 2〜3名: 全員が入れば "本田未央/大槻唯"、入らなければ看板＋総人数
  // 4名以上: 看板＋総人数 "天道輝ら6名"
  static fitName(names, max = CONFIG.TITLE_MAX) {
    const len = s => [...s].length;
    const cut = (s, n) => len(s) <= n ? s : [...s].slice(0, Math.max(1, n - 1)).join("") + "…";
    if (names.length === 1) return cut(names[0], max);
    if (names.length <= 3) {
      const all = names.join("/");
      if (len(all) <= max) return all;
    }
    const suffix = `ら${names.length}名`;
    return cut(names[0], max - len(suffix)) + suffix;
  }
}
