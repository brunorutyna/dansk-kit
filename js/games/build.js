// Mini-game "build": build a Danish sentence from tiles. Accepts EVERY correct word order listed in answers.
// params: { id, title, sub, rounds: [{ en, answers: ['Jeg køber ...', 'I dag køber jeg ...'], traps: ['rødt'], rule }] }
// Tiles are lower-case (except names in K.NAMES), so a capital never gives away the first word.
(function (K) {
  'use strict';
  const el = K.el;
  const words = (t) => String(t).replace(/[.,!?;:]/g, ' ').split(/\s+/).filter(Boolean);
  const tileOf = (w) => ((K.NAMES || []).includes(w) ? w : w.toLowerCase());
  const norm = (arr) => arr.map((w) => w.toLowerCase()).join(' ');
  // the union of all answers' words (max count of each across answers) plus traps
  function tilesFor(r) {
    const need = {};
    r.answers.forEach((a) => {
      const c = {}; words(a).forEach((w) => { const t = tileOf(w); c[t] = (c[t] || 0) + 1; });
      Object.entries(c).forEach(([t, n]) => { need[t] = Math.max(need[t] || 0, n); });
    });
    const out = [];
    Object.entries(need).forEach(([t, n]) => { for (let i = 0; i < n; i++) out.push(t); });
    return out.concat((r.traps || []).map(tileOf));
  }
  K.game('build', {
    title: 'Byg sætningen',
    texts: (p) => p.rounds.flatMap((r) => r.answers.concat(r.traps || []).concat(r.reply ? [r.reply] : [])),
    tilesFor,
    lint(p) {
      const e = [];
      p.rounds.forEach((r, i) => {
        if (!r.answers || !r.answers.length) e.push(`round ${i}: no answers`);
        const tiles = tilesFor(r);
        if (tiles.length > 18) e.push(`round ${i}: ${tiles.length} tiles (max 18; split the sentence)`);
        (r.traps || []).forEach((t) => { if (r.answers.some((a) => words(a).map(tileOf).includes(tileOf(t)))) e.push(`round ${i}: trap "${t}" is also an answer word`); });
        if (new Set(r.answers.map((a) => norm(words(a)))).size !== r.answers.length) e.push(`round ${i}: duplicate answers`);
      });
      return e;
    },
    screen(root, p, s) {
      const { body } = K.frame(root, p.title || 'Byg sætningen', p.sub);
      const rounds = p.rounds.slice();
      let i = 0, score = 0;
      function round() {
        s.unlock(); body.innerHTML = '';
        if (i >= rounds.length) return done();
        const r = rounds[i];
        body.appendChild(el('div', 'progress', `${i + 1} / ${rounds.length}`));
        body.appendChild(el('div', 'prompt', K.esc(r.en)));
        const built = el('div', 'built'); body.appendChild(built);
        const pool = el('div', 'pool'); body.appendChild(pool);
        const bar = el('div', 'row'); body.appendChild(bar);
        const picked = [];
        const draw = () => {
          built.innerHTML = picked.length ? '' : '<span class="ph">…</span>';
          picked.forEach((t, k) => s.btn(built, K.esc(k === 0 ? t[0].toUpperCase() + t.slice(1) : t), () => { picked.splice(k, 1); pool.querySelector(`[data-k="${t.__k}"]`).hidden = false; draw(); }, { cls: 'tile in' }));
          done_.disabled = !picked.length;
        };
        K.shuffle(tilesFor(r)).forEach((t, k) => {
          const b = s.btn(pool, K.da(t), () => { const w = new String(t); w.__k = k; picked.push(w); b.hidden = true; draw(); }, { cls: 'tile', data: { k: String(k), w: t } });
        });
        const done_ = s.btn(bar, 'Færdig', () => {
          const got = norm(picked.map(String));
          const ok = r.answers.some((a) => norm(words(a)) === got);
          if (ok) { score++; K.ART.pop(built); K.VOICE.say(r.answers[0], null, true); } else K.ART.shake(built);
          pool.querySelectorAll('button').forEach((b) => { b.disabled = true; });
          K.feedback(s, body, ok, r.answers[0], r.rule);
          const rep = ok ? r.reply : r.miss;
          if (rep) { const d = el('div', 'reply'); d.innerHTML = (p.who && K.CAST[p.who] ? `<b>${K.esc(K.CAST[p.who].name)}</b> ` : '') + (ok ? K.da(rep) : K.esc(rep)); body.appendChild(d); }
          K.after(s, body, ok && !r.reply).then(() => { i++; round(); });
        }, { answer: true, cls: 'main', data: { done: '1' } });
        draw();
        // bot: right = next word of the first answer; wrong = any tiles, then Færdig
        s.bot = (mode) => {
          if (s.locked) return null;
          const target = words(r.answers[0]).map(tileOf);
          const free = [...pool.querySelectorAll('.tile')].filter((b) => !b.hidden);
          if (mode === 'wrong' && r.__wrong == null) r.__wrong = Math.random() < 0.6;
          if (mode === 'wrong' && r.__wrong) return picked.length >= Math.min(2, target.length) || !free.length ? done_ : free[0];
          if (picked.length >= target.length) return done_;
          return free.find((b) => b.dataset.w === target[picked.length]) || done_;
        };
      }
      async function done() { s.bot = null; await K.stamp(s, body, p.id || 'build', score, rounds.length); s.finish(); }
      round();
    },
  });
})(window.K = window.K || {});
