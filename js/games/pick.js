// Mini-game "pick": see a thing, choose the right Danish phrase. Template for option-based games.
// params: { id, title, sub, n, rounds: [{ colour, pattern, en, right, wrong: [..], rule }] }
(function (K) {
  'use strict';
  const el = K.el;
  K.game('pick', {
    title: 'Vælg',
    texts: (p) => p.rounds.flatMap((r) => [r.right].concat(r.wrong).concat(r.q ? [r.q.replace(/_+/g, ' ')] : [])),
    lint(p) {
      const e = [];
      p.rounds.forEach((r, i) => {
        if (!r.right) e.push(`round ${i}: no right answer`);
        if (!r.wrong || r.wrong.length < 2) e.push(`round ${i}: needs at least 2 wrong options`);
        if ((r.wrong || []).includes(r.right)) e.push(`round ${i}: a wrong option equals the right one`);
        if (new Set(r.wrong).size !== (r.wrong || []).length) e.push(`round ${i}: duplicate wrong options`);
        if (r.colour && !K.COLORS[r.colour]) e.push(`round ${i}: unknown colour ${r.colour}`);
        if (r.pattern && !K.PATTERNS[r.pattern]) e.push(`round ${i}: unknown pattern ${r.pattern}`);
      });
      return e;
    },
    screen(root, p, s) {
      const { body } = K.frame(root, p.title || 'Vælg', p.sub);
      const rounds = (p.keep ? p.rounds.slice() : K.shuffle(p.rounds)).slice(0, p.n || p.rounds.length);
      let i = 0, score = 0;
      function round() {
        s.unlock(); body.innerHTML = '';
        if (i >= rounds.length) return done();
        const r = rounds[i];
        body.appendChild(el('div', 'progress', `${i + 1} / ${rounds.length}`));
        if (r.q) body.appendChild(el('div', 'frame', K.da(r.q).replace(/_+/g, '<b class="gap">___</b>')));
        else body.appendChild(K.ART.thing(null, r.colour, r.pattern));
        if (r.en) body.appendChild(el('div', 'prompt small', K.esc(r.en)));
        const grid = el('div', 'opts'); body.appendChild(grid);
        K.shuffle([r.right].concat(r.wrong)).forEach((o) => s.btn(grid, K.da(o), (e, b) => answer(r, o === r.right, b), { answer: true, cls: 'opt', data: { right: o === r.right ? '1' : '0' } }));
        // English is always possible, but counts as a miss
        s.btn(body, 'Jeg ved det ikke (EN)', (e, b) => { if (K.st) K.st.english++; answer(r, false, b); }, { answer: true, cls: 'ghost small english', data: { right: '0' } });
      }
      async function answer(r, ok, b) {
        if (ok) { score++; K.ART.pop(b); const q = b.getBoundingClientRect(); K.ART.burst(q.left + q.width / 2, q.top + q.height / 2); K.VOICE.say(r.say || r.right, null, true); }
        else K.ART.shake(b);
        b.classList.add(ok ? 'is-ok' : 'is-no');
        K.feedback(s, body, ok, r.right, r.rule);
        await K.after(s, body, ok);
        i++; round();
      }
      async function done() {
        await K.stamp(s, body, p.id || 'pick', score, rounds.length);
        s.finish();
      }
      s.bot = (mode) => {
        const v = [...body.querySelectorAll('.opts [data-right]')];
        if (!v.length || s.locked) return null;
        if (mode === 'wrong' && Math.random() < 0.6) return v.find((b) => b.dataset.right === '0');
        return v.find((b) => b.dataset.right === '1');
      };
      round();
    },
  });
})(window.K = window.K || {});
