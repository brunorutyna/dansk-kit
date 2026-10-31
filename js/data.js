// GAME CONTENT. A new game replaces this file (and adds its own mini-games in js/games/).
// Everything here is data: lint checks references, glosses and mini-game rounds.
(function (K) {
  'use strict';
  K.CONFIG = {
    id: 'dansk-kit-demo',           // save key: must be unique per game
    title: 'Dansk kit',
    tagline: 'Demo · en rød hat',
    endings: 2,
    yes: ['Ja!', 'Præcis!', 'Flot!'],
    no: ['Nej!', 'Av!'],
    run: () => ({}),                // extra fields for a new run
    ending: (st) => (st.flags.polite ? 'Høflig' : 'Turist'),
  };

  // Every Danish word on screen needs a gloss (lint). Names go in NAMES.
  K.DICT = {
    hej: 'hi', hvad: 'what', kan: 'can', jeg: 'I', hjælpe: 'help', med: 'with', leder: 'look (leder efter = look for)', efter: 'after / for',
    en: 'a (en-word)', et: 'a (et-word)', rød: 'red', rødt: 'red (et-form)', røde: 'red (definite/plural)', hat: 'hat', hatten: 'the hat',
    ja: 'yes', lidt: 'a little', men: 'but', her: 'here', taler: 'speak(s)', vi: 'we', dansk: 'Danish',
    grøn: 'green', grønt: 'green (et-form)', tørklæde: 'scarf', nogle: 'some', blå: 'blue (plural: blå, also blåe)', blåt: 'blue (et-form)', blåen: '(not a word)',
    sokker: 'socks', stribet: 'striped', stribede: 'striped (definite/plural)', kjole: 'dress', gul: 'yellow', gult: 'yellow (et-form)', slips: 'tie',
    i: 'in', dag: 'day (i dag = today)', køber: 'buy(s)', koster: 'cost(s)', er: 'is / are', sikke: 'what a…!', flot: 'nice, fine',
    nej: 'no', av: 'ouch', præcis: 'exactly', test: 'test', stemmen: 'the voice', høre: 'hear', mig: 'me',
  };
  K.NAMES = [];

  K.COLORS = {
    roed: { hex: '#d8352a' }, groen: { hex: '#2f9e44' }, blaa: { hex: '#2f6fd8' }, gul: { hex: '#f2c230' },
    sort: { hex: '#1b1b1b', dark: true }, hvid: { hex: '#f4f1ea' },
  };
  K.PATTERNS = { stribet: 'stripes', prikket: 'dots', ternet: 'checks' };
  K.CAST = { saelger: { name: 'Sælgeren', color: '#e3a64b', pitch: 1.1 } };
  K.SCENES = {
    title: { from: '#2d3a5c', to: '#14161c' },
    shop: { from: '#6b4a33', to: '#1d1712', label: 'Butikken' },
  };

  // The game: one list of steps. screen = a kit screen (card, panel, choice) or a mini-game id.
  K.FLOW = [
    { screen: 'card', title: 'Prøve', sub: 'Et lille demo-spil', music: 'calm' },
    { screen: 'panel', scene: 'shop', cast: ['saelger'], lines: [
      { n: 'A tiny shop. Too many hats. A seller waves.' },
      { w: 'saelger', da: 'Hej! Hvad kan jeg hjælpe med?', en: 'Hi! What can I help with?' },
      { th: 'You need a hat. A red one. Say it in Danish and maybe it costs less.' },
    ] },
    { screen: 'choice', scene: 'shop', cast: ['saelger'], who: 'saelger', prompt: 'Svar:', options: [
      { da: 'Jeg leder efter en rød hat.', set: { polite: true } },
      { en: 'Do you speak English?', after: [{ w: 'saelger', da: 'Ja, lidt. Men her taler vi dansk.', en: 'Yes, a little. But here we speak Danish.' }] },
    ] },
    { screen: 'pick', id: 'Hylden', title: 'Hylden', sub: 'Hvad er det?', rounds: [
      { colour: 'roed', en: 'A red hat', right: 'en rød hat', wrong: ['et rødt hat', 'en røde hat'], rule: 'hat is an en-word: en rød hat.' },
      { colour: 'groen', en: 'A green scarf', right: 'et grønt tørklæde', wrong: ['et grøn tørklæde', 'en grønt tørklæde'], rule: 'tørklæde is an et-word: the adjective gets -t.' },
      { colour: 'blaa', en: 'Some blue socks', right: 'nogle blå sokker', wrong: ['nogle blåt sokker', 'nogle blåen sokker'], rule: 'blå: plural blå (blåe is also allowed). -t is only for et-words.' },
      { colour: 'hvid', pattern: 'stribet', en: 'A striped dress', right: 'en stribet kjole', wrong: ['en stribede kjole', 'et stribet kjole'], rule: 'Indefinite en-word: no ending.' },
      { colour: 'gul', en: 'A yellow tie', right: 'et gult slips', wrong: ['et gul slips', 'en gult slips'], rule: 'slips is an et-word: gul → gult.' },
    ] },
    { screen: 'build', id: 'Kassen', title: 'Ved kassen', rounds: [
      { en: 'I am looking for a red hat.', answers: ['Jeg leder efter en rød hat'], traps: ['rødt', 'et'], rule: 'en hat → en rød hat.' },
      { en: 'Today I buy a green scarf.', answers: ['I dag køber jeg et grønt tørklæde', 'Jeg køber et grønt tørklæde i dag'], traps: ['grøn', 'en'], rule: 'After "I dag" first, the verb comes before the subject: I dag køber jeg…' },
      { en: 'What does the hat cost?', answers: ['Hvad koster hatten'], traps: ['hat', 'er'], rule: 'the hat = hatten.' },
    ] },
    { screen: 'panel', scene: 'shop', cast: ['saelger'], mood: { saelger: 'happy' }, lines: [
      { w: 'saelger', da: 'Sikke en flot hat!', en: 'What a nice hat!' },
      { n: (st) => (st.flags.polite ? 'You leave with the hat, and a discount.' : 'You leave with the hat. Full price.') },
    ] },
  ];
})(window.K = window.K || {});
