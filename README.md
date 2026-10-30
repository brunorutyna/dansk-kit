# dansk-kit

Starter kit for Bruno's Danish-learning browser games. Every new game starts as a copy of this repo. Plain JavaScript, no build step, phone first, served by GitHub Pages.

Demo: https://brunorutyna.github.io/dansk-kit/

## What the kit gives a game for free
- **Screen router** (`K.show`): showing a screen kills the old one completely: timers, listeners, overlays, voice queue, modals. No stale buttons, no stuck async chains.
- **Screen context `s`**: `s.timer`, `s.every`, `s.wait`, `s.on`, `s.loop` (an animation loop that cannot die), `s.btn` (≥ 44 px, with an input lock for answers), `s.finish()`. Everything dies with the screen.
- **Never stuck**: an error box with *Fortsæt* / *Til start* on any error, and a watchdog if nothing can be tapped for 8 s.
- **Saves** that survive new versions; **"Ny version ↻"** sticker when a new deploy is live.
- **Every Danish word tappable** for its meaning (long-press inside buttons); **Hvorfor?** rule on mistakes; missed phrases remembered for review; S/A/B/C ranks.
- **Story** as data (`K.FLOW`): cards, panels with lines (only *Videre* advances), choices with an English option that costs.
- **Simple art** (`js/art.js`) and **simple audio** (`js/audio.js`): shapes and blips for the prototype. Promotion to final art replaces only these two files.
- **Checks**: `tools/lint.js`, `tools/playtest.js` (plays the whole game with real taps using each screen's bot), `tools/bump.sh`.

## Files
| File | What | A new game… |
| --- | --- | --- |
| `js/data.js` | CONFIG, glossary (DICT), names, colours, cast, scenes, **FLOW** | replaces it |
| `js/games/*.js` | mini-games (`pick`, `build` are templates) | adds its own |
| `js/core.js`, `js/screens.js`, `js/main.js` | engine | keeps (fixes go back to the kit) |
| `js/art.js`, `js/audio.js` | simple art and sound | keeps until promotion |
| `css/kit.css` | look | restyles freely, keeps class names |
| `tools/` | lint, playtest, bump, blocklist | keeps; adds game checks |

## Start a new game
1. Copy this repo's files into the new repo (not the `.git` folder).
2. In `js/data.js`: set `CONFIG.id` (unique save key), title, endings; write the glossary, cast, scenes and `FLOW` from the design doc.
3. For each new mini-game, copy `js/games/pick.js` or `build.js`, register it with `K.game(id, {...})`, give it `texts()`, `lint()` and `s.bot`, and add its `<script>` to `index.html` before `main.js`.
4. `npm test` (lint + 2 playtest runs), `npm run shots` (real speed, one contact sheet in `shots/contact.png`), `sh tools/bump.sh`, push.

## A mini-game, in short
```js
K.game('myGame', {
  texts: (p) => [/* every Danish string it shows */],
  lint: (p) => [/* error strings */],
  screen(root, p, s) {
    const { body } = K.frame(root, 'Titel');
    s.btn(body, K.da('en rød hat'), (e, b) => { /* answer */ }, { answer: true });
    s.bot = (mode) => /* the element to tap: right answer, or a wrong one when mode === 'wrong' */;
    // when done: await K.stamp(s, body, 'myGame', score, max); s.finish();
  },
});
```
Rules lint enforces in `js/games/`: no raw `setTimeout` / `setInterval` / `requestAnimationFrame` / `addEventListener` (use `s.*`), no lookups by global id, and a `s.bot` in every mini-game.

## Process
The full process (design doc, plan critic, prototype, promotion) and the ledger of every bug seen so far are in the Claude skills `danish-game-design`, `game-twist-critic` and `language-game-qa`.
