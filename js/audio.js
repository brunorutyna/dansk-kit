// SIMPLE AUDIO (prototype). Every sound goes through SFX / VOICE / MUSIC; promotion replaces this file only.
// Voice never blocks the game: every say() resolves by itself after the line's natural length.
(function (K) {
  'use strict';
  let ac = null;
  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, dur, type, vol, when) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const SOUNDS = {
    tap: () => tone(660, 0.05, 'triangle', 0.05),
    ok: () => { tone(660, 0.08, 'square', 0.06); tone(990, 0.12, 'square', 0.06, 0.07); },
    bad: () => { tone(220, 0.16, 'sawtooth', 0.06); tone(160, 0.2, 'sawtooth', 0.05, 0.1); },
    up: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, 'square', 0.05, i * 0.07)),
    win: () => [523, 659, 784, 659, 1046].forEach((f, i) => tone(f, 0.14, 'triangle', 0.07, i * 0.1)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.2, 'triangle', 0.07, i * 0.14)),
  };
  K.SFX = { play(id) { if (!K.settings || !K.settings.sfx) return; try { (SOUNDS[id] || SOUNDS.tap)(); } catch (e) { /* no audio */ } } };

  // Browser Danish voice (da-DK) if the phone has one. Never needed to understand anything.
  let daVoice = null;
  const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
  function findVoice() { if (!synth) return null; daVoice = synth.getVoices().find((v) => /^da/i.test(v.lang)) || null; return daVoice; }
  if (synth) { findVoice(); synth.onvoiceschanged = findVoice; }
  let queue = Promise.resolve(), gen = 0;
  K.VOICE = {
    available: () => !!(daVoice || findVoice()),
    // say(text, who, mode). A line being spoken is NEVER cut mid-word, except when the player taps ▶ (mode 'replay').
    // mode truthy (a new round, an answer): lines not yet started are dropped, the new one follows the current line.
    // mode falsy: the line queues behind everything (story panels).
    say(text, who, mode) {
      const est = Math.min(9000, 700 + String(text).length * 75);
      let my = 0;
      const speak = () => new Promise((res) => {
        if (my !== gen) return res(); // dropped before it started
        if (!K.settings || !K.settings.voice || !synth || !K.VOICE.available()) return res();
        try {
          const u = new SpeechSynthesisUtterance(text); u.voice = daVoice; u.lang = 'da-DK';
          const c = K.CAST && who && K.CAST[who]; if (c && c.pitch) u.pitch = c.pitch;
          u.rate = 0.95; u.onend = res; u.onerror = res; synth.speak(u);
        } catch (e) { res(); }
      });
      if (mode === 'replay') { K.VOICE.stop(); queue = Promise.resolve(); }
      else if (mode) gen++; // drop what has not started; the current line finishes
      my = gen;
      const p = queue.then(() => K.timeout(speak(), est));
      queue = p;
      return K.timeout(p, est * 2);
    },
    // a screen change: lines that have not started are dropped; the line being spoken finishes
    settle() { gen++; },
    // hard stop: only for the player's own ▶ replay and the settings test (lint enforces this)
    stop() { try { if (synth) { window.__voiceReplay = Date.now(); synth.cancel(); } } catch (e) { /* ignore */ } queue = Promise.resolve(); },
  };

  // One quiet loop per mood at most (prototype). set(null) = silence.
  let loopT = null, mood = null;
  const MOODS = { calm: [262, 330, 392, 330], tense: [220, 233, 220, 196], happy: [392, 494, 587, 494] };
  function play() {
    clearInterval(loopT); loopT = null;
    if (!mood || !K.settings || !K.settings.music || !MOODS[mood]) return;
    let i = 0;
    loopT = setInterval(() => { const a = ac; if (!a || a.state !== 'running') return; tone(MOODS[mood][i++ % 4] / 2, 0.5, 'sine', 0.03); }, 520);
  }
  K.MUSIC = { set(m) { if (m === mood) return; mood = m; play(); }, refresh: play, unlock: ctx };
})(window.K = window.K || {});
