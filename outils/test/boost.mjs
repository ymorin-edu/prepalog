// Suite de tests de Prepalog — bloc « boost » : Boost ENT-3.1, la tournée du vélo-cargo (contenu de la séance).
//
// Découpé de `outils/test.mjs` le 02/10/2026 (chantier C, voir `claude/prepalog-chantiers-en-cours.md`).
// Le lanceur reste `node outils/test.mjs` ; `node outils/test.mjs boost` ne lance que ce bloc.
// Le corps n'est volontairement PAS réindenté : c'est le code d'origine, ligne pour ligne, et
// réindenter aurait aussi décalé le contenu des chaînes sur plusieurs lignes.
// Ce que le bloc reçoit du lanceur (`commun.mjs`) : le navigateur, la page partagée, `v()`, etc.

export default async function bloc({ v, page, nav, ok, ko }) {

/* ===================================================================================== */
/* ENT-3.1 — Boost, la tournée du vélo-cargo (lot 2 : le CONTENU)                         */
/*                                                                                        */
/* Les dix-sept cas précédents gardent les deux vues du noyau sur un scénario d'essai.    */
/* Ceux-ci gardent le CONTENU de la séance : les sept adresses, les cases recalculées, le  */
/* calibrage (une seule combinaison de clients possible), le parcours complet d'un élève   */
/* qui réussit, et les cinq jalons — y compris ce qu'ils disent AVANT que l'élève ait      */
/* commencé, parce qu'un jalon qui annonce « à corriger » à l'ouverture ferait croire à    */
/* une faute là où il n'y a rien.                                                         */
/*                                                                                        */
/* On passe par l'activité réelle (`activites/boost-tournee.js`), pas par un montage à la  */
/* main : c'est la déclaration de la séance autant que ses chiffres qu'on veut garder.    */
/* ===================================================================================== */

const ctxBo = await nav.newContext();
const pageBo = await ctxBo.newPage();
pageBo.setDefaultTimeout(8000);
const erreursBo = [];
pageBo.on('pageerror', (e) => erreursBo.push('PAGEERROR: ' + e.message));
pageBo.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursBo.push('CONSOLE: ' + m.text()); });
await pageBo.goto('http://127.0.0.1:8099/');
await pageBo.waitForSelector('#btnProf', { timeout: 8000 });

await pageBo.evaluate(async () => {
  const act = await import('/activites/boost-tournee.js');
  const hote = document.createElement('div');
  hote.id = 'boost31';
  document.body.appendChild(hote);
  const db = {};
  const suivi = [];
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => suivi.push(r),
    quitter: () => {}, codeStock: 'ABC',
  });
  window.__bo = { act, db, suivi, hote };
});

const zBo = '#boost31 .ent-main';
const ouvrirBo = async (vue) => {
  await pageBo.click(`#boost31 .ent-nav[data-vue="${vue}"]`);
  await pageBo.waitForTimeout(140);
};
// L'état de la séance, lu dans la base de l'élève. La clé est `transportId`, pas l'identifiant
// de l'activité : c'est elle que les jalons du contenu interrogent.
const etatBo = (vue) => pageBo.evaluate((v) => {
  const t = window.__bo.db.transport && window.__bo.db.transport['boost-ent31'];
  return t ? JSON.parse(JSON.stringify(t[v] || {})) : null;
}, vue);
const dernierSuivi = () => pageBo.evaluate(() => {
  const s = window.__bo.suivi;
  return s.length ? JSON.parse(JSON.stringify(s[s.length - 1])) : null;
});
// Les modèles HTML coupent leurs phrases sur plusieurs lignes : « manqué\n de 9 min ». Une
// assertion écrite d'un trait ne les retrouve pas. Trois fois le piège sur ce projet, d'où ce
// lecteur qui écrase les blancs.
const texteBo = async (sel) => (await pageBo.textContent(sel || zBo)).replace(/\s+/g, ' ').trim();
// Les jalons, interrogés DIRECTEMENT sur le contenu. Le moteur, lui, ne les remonte au suivi
// qu'au moment où il sauve : un test qui pose un état dans la base puis lit `ctx.enregistrer`
// relirait l'état précédent et se tromperait de verdict.
// Le bilan calculé par le NOYAU pour l'état courant, sans passer par l'écran.
//
// Nécessaire depuis le 04/10 : les jauges ne disent plus le poids total ni l'heure de retour,
// c'est tout l'objet de la feuille de calcul. Les chiffres de calibrage — 179 kg, 16 h 19,
// 15 h 10 — ne sont donc plus à l'écran, et les vérifier à la source est de toute façon plus
// juste : on mesure le modèle, pas sa mise en page.
const bilanBo = () => pageBo.evaluate(async () => {
  const S = await import('/contenus/boost-tournee.js');
  const { creerTournee } = await import('/core/types/tournee.js');
  const vue = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE));
  const t = window.__bo.db.transport['boost-ent31'].tournee;
  const b = vue.bilan(Object.assign({ ordre: [], quai: [], report: {}, juge: {} }, t));
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
  return {
    km: Math.round(b.km * 10) / 10, minutes: Math.round(b.minutes),
    arrivee: b.arrivee == null ? null : hhmm(b.arrivee),
    charge: b.cumuls.charge, colis: b.cumuls.colis,
    arrets: b.retenus.length, enRetard: b.enRetard,
  };
});

const jalonsBo = () => pageBo.evaluate(async () => {
  const S = await import('/contenus/boost-tournee.js');
  const o = {};
  S.ETAPES.forEach((e) => { o[e.id] = e.verifier(window.__bo.db).status; });
  return o;
});

// Les sept cases attendues, ÉCRITES ICI à la main. Le contenu, lui, ne les écrit pas : le
// noyau les recalcule depuis la position du point. Les deux doivent tomber d'accord, et c'est
// tout l'intérêt de les poser en dur dans le test — un point déplacé par erreur se voit.
const CASES31 = { c1: 'D2', c2: 'C2', c3: 'C5', c4: 'B5', c5: 'E1', c6: 'D2', c7: 'D4' };
// Les sept quartiers attendus, ÉCRITS ICI à la main (menus déroulants du repérage, 05/10).
const QUARTIERS31 = { c1: 'Écusson', c2: 'Jardins de la Fontaine', c3: 'Ville Active',
  c4: 'Saint-Césaire', c5: 'Croix de Fer', c6: 'Gambetta', c7: 'Costières' };
// Choisit les bons quartiers dans les menus d'une zone, sauf pour les points de `sauf`.
const choisirQuartiersBo = async (z, sauf = []) => {
  for (const [id, q] of Object.entries(QUARTIERS31)) {
    if (sauf.includes(id)) continue;
    await pageBo.selectOption(`${z} .plan-quartier[data-quartier="${id}"]`, q);
  }
};
// Remplit la feuille de calcul d'une tournée à six arrêts et la fait vérifier : les six
// formules attendues d'un élève (voir le cas « les formules justes sont acceptées »).
// Depuis le chantier F (03/10/2026), la feuille d'ENT-3.1 est EN COLONNES et s'affiche comme un
// tableur : on choisit la cellule (clic), on écrit dans la barre de formule. La tournée et le poids
// total à gauche (B), le calcul du temps à droite, toujours en E2 à E11.
const barreBo = () => `${zBo} [data-gr-barre]`;
const choisirBo = (ref) => pageBo.$eval(`${zBo} [data-gr-cel="${ref}"]`, (td) => td.click());
const taperBo = async (ref, texte) => { await choisirBo(ref); await pageBo.fill(barreBo(), texte); await pageBo.waitForTimeout(40); };
const casesBo = () => pageBo.evaluate(() => window.__bo.db.transport['boost-ent31'].tournee.grille.cases);
const F31 = { B8: '=SOMME(B2:B7)', E4: '=E2/E3', E5: '=E4*60', E8: '=E6*E7', E9: '14:00', E10: '=E9+E5+E8' };
const remplirFeuilleBo = async () => {
  for (const [ref, f] of Object.entries(F31)) await taperBo(ref, f);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
};
// Le meilleur ordre de passage, et ce qu'il donne. Valeurs obtenues par énumération des
// 720 ordres sur les km par les rues (outils/carte/calibrer.mjs, 03/10/2026), pas estimées.
const ORDRE31 = ['c4', 'c7', 'c2', 'c1', 'c6', 'c5'];

await v('ENT-3.1 : la séance déclare un barème de jalons et PAS de notation', async () => {
  const d = await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const notes = await import('/core/notes.js');
    return {
      code: act.meta.code, id: act.meta.id, jeuId: act.meta.jeuId,
      bareme: act.meta.bareme, notation: act.meta.notation,
      immersif: !!act.meta.immersif, portee: act.meta.portee,
      convertie: notes.noteConvertie(act.meta),
      sur20: notes.noteSur20(act.meta.bareme, act.meta.bareme),
    };
  });
  if (d.code !== 'ENT-3.1') throw new Error('code ' + d.code);
  if (d.jeuId !== 'boost') throw new Error('jeuId ' + d.jeuId);
  if (d.portee !== 'eleve' || !d.immersif) throw new Error('portée ou immersion');
  if (d.notation !== undefined) throw new Error('la séance déclare notation: ' + d.notation);
  if (d.bareme !== 6) throw new Error('barème ' + d.bareme + ' au lieu de 6 jalons');
  // C'est l'omission de `notation` qui donne la note sur 20 — vérifié par le moteur lui-même,
  // pas supposé.
  if (!d.convertie) throw new Error('la séance ne serait pas ramenée sur 20');
  if (d.sur20 !== 20) throw new Error('6 jalons sur 6 ne donnent pas 20/20 : ' + d.sur20);
});

await v('ENT-3.1 : sept clients, rues réelles sans numéro, points numérotés visibles, quartiers dessinés', async () => {
  await ouvrirBo('plan');
  const adr = await pageBo.$$eval(`${zBo} .plan-table tbody tr td:nth-child(2)`, (e) => e.map((x) => x.textContent.trim()));
  if (adr.length !== 7) throw new Error(adr.length + ' lignes au lieu de 7');
  // Pas de numéro de rue : la rue est réelle, le commerce est inventé. Un numéro désignerait
  // un vrai bâtiment.
  adr.forEach((a) => {
    if (/^\s*\d/.test(a)) throw new Error('numéro de rue dans « ' + a + ' »');
    if (!/30\d{3} Nîmes$/.test(a)) throw new Error('adresse mal formée : ' + a);
  });
  // Les sept rues de la refonte du 03/10/2026, écrites ici à la main.
  ['Général Perrier', 'Combret', "l'Hostellerie", 'Mascard', 'Edmond Rostand', 'Graverol', 'Roger Sabatier']
    .forEach((r) => { if (!adr.some((a) => a.includes(r))) throw new Error('rue absente : ' + r); });
  // Temps 1 : aucun quartier choisi, aucun nom de client nulle part (ni carte, ni tableau).
  const zones = await pageBo.$$eval(`${zBo} .plan-quartier`, (e) => e.map((x) => x.value));
  if (zones.length !== 7 || zones.some((z) => z !== '')) throw new Error('quartiers choisis au temps 1 : ' + zones.join('|'));
  const d = await pageBo.evaluate((z) => {
    const svg = document.querySelector(`${z} .ct-svg`);
    return {
      texte: svg.textContent, table: document.querySelector(`${z} .plan-table`).textContent,
      points: [...svg.querySelectorAll('[data-ct-point]')].map((g) => g.querySelector('.ct-mk-l').textContent).join(','),
      visibles: [...svg.querySelectorAll('[data-ct-point]')].filter((g) => getComputedStyle(g).display !== 'none'
        && g.getBoundingClientRect().width > 5).length,
      contours: svg.querySelectorAll('.ct-q').length,
      noms: [...svg.querySelectorAll('.ct-qnom')].map((t) => t.textContent),
    };
  }, zBo);
  if (/Comptoir des Halles/.test(d.texte) || /Comptoir des Halles/.test(d.table)) throw new Error('un nom de client est donné au temps 1');
  // Décision de Tristan : les sept points sont numérotés et VISIBLES dès le départ (guidage).
  if (d.points !== '1,2,3,4,5,6,7') throw new Error('points numérotés : ' + d.points);
  if (d.visibles !== 7) throw new Error(d.visibles + ' point(s) visible(s) au lieu de 7');
  // …et les sept quartiers ont leur contour ET leur nom.
  if (d.contours !== 7) throw new Error(d.contours + ' contour(s) de quartier');
  if (d.noms.slice().sort().join('|') !== Object.values(QUARTIERS31).sort().join('|')) throw new Error('noms de quartier : ' + d.noms.join('|'));
});

await v('ENT-3.1 : la carte et la liste des destinataires disent la même chose', async () => {
  // La carte est GÉNÉRÉE (outils/carte/construire.py) ; la fiche du mail, l'écran Clients et les
  // jalons lisent `DESTINATAIRES` de boost.js. Les deux ne doivent pas se contredire.
  const r = await pageBo.evaluate(async () => {
    const { CARTE } = await import('/contenus/boost-ent31-carte.js');
    const B = await import('/contenus/boost.js');
    return B.DESTINATAIRES.map((d) => {
      const c = CARTE.clients.find((x) => x.id === d.id) || {};
      return { id: d.id, ok: c.nom === d.nom && c.kg === d.kg && c.colis === d.colis
        && (CARTE.quartiers[c.quartier] || {}).nom === d.zone && c.adresse === d.adresse, c, d };
    }).filter((x) => !x.ok).map((x) => `${x.id} : carte ${JSON.stringify([x.c.nom, x.c.kg, x.c.colis, x.c.quartier, x.c.adresse])} / liste ${JSON.stringify([x.d.nom, x.d.kg, x.d.colis, x.d.zone, x.d.adresse])}`);
  });
  if (r.length) throw new Error(r.join('\n'));
});

await v('ENT-3.1 : chaque client est sur sa rue, dans le contour de son quartier, loin des lignes', async () => {
  // Données de la carte, relues dans le navigateur : la rue du client passe sous son point, le
  // point est DANS le contour de son quartier (décision de Tristan : on déplace l'adresse, pas le
  // contour), et le rond tient entier dans une case (alerte 15).
  const r = await pageBo.evaluate(async () => {
    const { CARTE: C } = await import('/contenus/boost-ent31-carte.js');
    const { segments, caseCarte } = await import('/core/types/carte.js');
    const dans = (p, d) => {        // pair-impair sur les anneaux du contour
      let n = false;
      for (const [a, b] of segments(d)) {
        if ((a[1] > p.y) !== (b[1] > p.y) && p.x < a[0] + (p.y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])) n = !n;
      }
      return n;
    };
    const distSeg = (p, [a, b]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L)) : 0;
      return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy);
    };
    const [FX, FY] = C.frame;
    return C.clients.map((c) => {
      const mx = ((c.x - FX) % C.pas + C.pas) % C.pas, my = ((c.y - FY) % C.pas + C.pas) % C.pas;
      return { id: c.id, case: caseCarte(C, c), rue: Math.min(...segments(c.rueD).map((s) => distSeg(c, s))),
        dedans: dans(c, C.quartiers[c.quartier].d),
        autres: Object.keys(C.quartiers).filter((k) => k !== c.quartier && dans(c, C.quartiers[k].d)),
        marge: Math.min(mx, C.pas - mx, my, C.pas - my) };
    });
  });
  const cases = Object.fromEntries(r.map((x) => [x.id, x.case]));
  if (JSON.stringify(cases) !== JSON.stringify(CASES31)) throw new Error('cases recalculées : ' + JSON.stringify(cases));
  r.forEach((x) => {
    if (x.rue > 5) throw new Error(`${x.id} : son point est à ${x.rue.toFixed(0)} m de sa rue`);
    if (!x.dedans) throw new Error(`${x.id} : hors du contour de son quartier`);
    if (x.autres.length) throw new Error(`${x.id} : aussi dans ${x.autres.join(', ')}`);
    // 100 m : le rond (11 px + trait) à l'échelle de la vue d'ensemble d'un écran de classe.
    if (x.marge < 100) throw new Error(`${x.id} : à ${x.marge.toFixed(0)} m d'une ligne du quadrillage`);
  });
});

await v('ENT-3.1 : à l’écran, chaque rond tient dans une case et aucun nom de quartier n’est caché', async () => {
  // Le défaut du premier essai (03/10/2026) : « Gambetta », « Écusson », « Costières » étaient
  // sous un point. Mesuré sur le rendu, dans la vue d'ensemble.
  await pageBo.click(`${zBo} [data-ct-ensemble]`);
  await pageBo.waitForTimeout(700);
  const r = await pageBo.evaluate((z) => {
    const svg = document.querySelector(`${z} .ct-svg`);
    const bb = (e) => e.getBoundingClientRect();
    const recoupe = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const pts = [...svg.querySelectorAll('.ct-mk')].map((g) => ({ n: g.textContent.trim(), r: bb(g.querySelector('.ct-rond')) }));
    const noms = [...svg.querySelectorAll('.ct-qnom')].map((t) => ({ n: t.textContent, r: bb(t) }));
    const cadre = bb(svg.querySelector('.ct-cadre'));
    const ctm = svg.getScreenCTM();
    const lignes = [...svg.querySelector('.ct-grille').getAttribute('d').matchAll(/M(-?[\d.]+) (-?[\d.]+)([VH])/g)]
      .map((m) => ({ v: m[3] === 'V', px: m[3] === 'V' ? ctm.a * +m[1] + ctm.e : ctm.d * +m[2] + ctm.f }));
    return {
      sous: noms.filter((q) => pts.some((p) => recoupe(q.r, p.r))).map((q) => q.n),
      croises: noms.filter((q, i) => noms.some((o, j) => j !== i && recoupe(q.r, o.r))).map((q) => q.n),
      dehors: noms.filter((q) => q.r.left < cadre.left || q.r.right > cadre.right).map((q) => q.n),
      aCheval: pts.filter((p) => lignes.some((l) => (l.v ? p.r.left < l.px && l.px < p.r.right : p.r.top < l.px && l.px < p.r.bottom))).map((p) => p.n),
    };
  }, zBo);
  if (r.sous.length) throw new Error('nom(s) de quartier sous un point : ' + r.sous.join(', '));
  if (r.croises.length) throw new Error('noms de quartier qui se chevauchent : ' + r.croises.join(', '));
  if (r.dehors.length) throw new Error('nom(s) de quartier coupé(s) par le cadre : ' + r.dehors.join(', '));
  if (r.aCheval.length) throw new Error('rond(s) à cheval sur une ligne du quadrillage : ' + r.aCheval.join(', '));
});

await v('ENT-3.1 : le calibrage tient — une seule combinaison de clients possible', async () => {
  // La règle du projet est d'ÉNUMÉRER, pas d'estimer. 128 combinaisons et 720 ordres, calculés
  // ici avec les km PAR LES RUES de la carte (table `trajets`) : si un poids ou une position
  // change, ce test tombe.
  const r = await pageBo.evaluate(async () => {
    const B = await import('/contenus/boost.js');
    const { CARTE } = await import('/contenus/boost-ent31-carte.js');
    const P = B.DESTINATAIRES, V = B.VELO;
    const m = (a, b) => CARTE.trajets[`${a}|${b}`].m / 1000;
    const combis = [];
    let sousEnsembles = 0;
    for (let k = 0; k < (1 << P.length); k++) {
      sousEnsembles++;
      const c = P.filter((_, i) => k & (1 << i));
      if (c.reduce((t, x) => t + x.kg, 0) <= V.chargeUtile) combis.push(c);
    }
    const maxn = Math.max(...combis.map((c) => c.length));
    const grandes = combis.filter((c) => c.length === maxn);
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) =>
      perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat([p]).flat())));
    const c = grandes[0];
    let ok = 0, tot = 0, best = Infinity, bestOrdre = null;
    perms(c).forEach((p) => {
      const suite = ['depart', ...p.map((x) => x.id), 'arrivee'];
      let km = 0;
      for (let i = 1; i < suite.length; i++) km += m(suite[i - 1], suite[i]);
      const arr = V.depart + km / V.vitesse * 60 + p.length * V.service;
      tot++;
      if (arr <= V.train) ok++;
      if (arr < best) { best = arr; bestOrdre = p.map((x) => x.id); }
    });
    return {
      total: P.reduce((t, x) => t + x.kg, 0), sousEnsembles, combis: combis.length, maxn,
      nGrandes: grandes.length, quai: P.filter((x) => !c.includes(x)).map((x) => x.id),
      poids: c.reduce((t, x) => t + x.kg, 0), ok, tot, best: Math.round(best), bestOrdre, depart: V.depart,
    };
  });
  if (r.sousEnsembles !== 128) throw new Error(r.sousEnsembles + ' sous-ensembles au lieu de 128');
  if (r.combis !== 115) throw new Error(r.combis + ' combinaisons tenables au lieu de 115');
  if (r.total !== 237) throw new Error('masse totale ' + r.total + ' kg au lieu de 237');
  if (r.maxn !== 6) throw new Error('on pourrait livrer ' + r.maxn + ' clients, pas 6');
  if (r.nGrandes !== 1) throw new Error(r.nGrandes + ' combinaisons de 6 clients : la réponse n’est plus unique');
  if (r.quai.join(',') !== 'c3') throw new Error('à quai : ' + r.quai.join(',') + ' au lieu de c3 (La Pointe Sud)');
  if (r.poids !== 179) throw new Error(r.poids + ' kg chargés au lieu de 179');
  if (r.tot !== 720) throw new Error(r.tot + ' ordres énumérés au lieu de 720');
  if (r.depart !== 14 * 60) throw new Error('départ à ' + r.depart + ' min au lieu de 14 h 00');
  // La contrainte de temps doit mordre : si presque tous les ordres passaient, l'exercice
  // n'aurait plus d'intérêt (c'était le cas à 13 h 00 avec les km par les rues : 720 sur 720).
  if (r.ok !== 189) throw new Error(r.ok + '/720 ordres à l’heure au lieu de 189 : calibrage à revoir');
  if (r.best !== 15 * 60 + 36) throw new Error('meilleure arrivée à ' + r.best + ' min au lieu de 15 h 36');
  if (r.bestOrdre.join(',') !== 'c4,c7,c2,c1,c6,c5') throw new Error('meilleur ordre : ' + r.bestOrdre.join(','));
});

await v('ENT-3.1 : les jalons ne reprochent rien avant que l’élève ait commencé', async () => {
  const s = await dernierSuivi();
  if (!s) throw new Error('aucun avancement remonté au suivi');
  if (s.max !== 6) throw new Error('max ' + s.max + ' au lieu de 6');
  if (s.score !== 0) throw new Error('score ' + s.score + ' avant tout travail');
  // Aucun jalon ne doit être « ko » : rien n'est fait, donc rien n'est faux. La charge est
  // pourtant à 237 kg pour 180 utiles — c'est l'état de départ, pas une erreur de l'élève.
  const ko = Object.keys(s.detail).filter((k) => s.detail[k] === 'ko');
  if (ko.length) throw new Error('jalon(s) à tort en « ko » : ' + ko.join(', '));
});

await v('ENT-3.1 : le mail du responsable porte la fiche des sept commandes', async () => {
  await ouvrirBo('mail');
  const t = await pageBo.textContent(zBo);
  if (!/Tournée vélo-cargo du jour/.test(t)) throw new Error('le mail de la séance n’est pas semé');
  const corps = await pageBo.evaluate(() => {
    const m = window.__bo.db.mails.find((x) => /vélo-cargo du jour/.test(x.subject));
    return m ? m.text : '';
  });
  ['Comptoir des Halles', 'Pointe Sud', 'Caveau Pélissier', '180 kg', '16 h 10']
    .forEach((x) => { if (!corps.includes(x)) throw new Error('le mail ne dit pas « ' + x + ' »'); });
  // La gare, c'est Nîmes-Centre : la gare TGV est à Manduel, inatteignable en vélo-cargo.
  if (!/Nîmes-Centre/.test(corps)) throw new Error('le mail ne nomme pas la gare de Nîmes-Centre');
  if (/Nîmes TGV|Pont-du-Gard/.test(corps)) throw new Error('le mail envoie le vélo-cargo à la gare TGV');
  // Semé une seule fois, même si l'élève revient : la base est partagée par les séances ENT-3.x.
  const n = await pageBo.evaluate(() => window.__bo.db.mails.filter((x) => /vélo-cargo du jour/.test(x.subject)).length);
  if (n !== 1) throw new Error(n + ' exemplaires du mail');
});

await v('ENT-3.1 : l’écran Clients donne l’adresse mais jamais le quartier', async () => {
  await ouvrirBo('clients');
  await pageBo.waitForTimeout(140);
  const t = await pageBo.textContent(zBo);
  if (!/Comptoir des Halles/.test(t)) throw new Error('les sept commerces ne sont pas référencés');
  if (!/Mascard/.test(t)) throw new Error('l’adresse n’est pas donnée');
  // L'écran ne doit pas servir le champ `zone` : c'est précisément ce que l'élève va chercher.
  // C'est ce test qui a attrapé « Épicerie Fontaine » et « Caveau des Costières », deux
  // commerces inventés qui donnaient la réponse dans leur nom. Depuis la refonte du 03/10/2026,
  // aucune des sept rues ne nomme non plus son quartier (il y en avait trois avant).
  Object.values(QUARTIERS31).concat(['Fontaine', 'Courbessac', 'Grézan'])
    .forEach((q) => { if (new RegExp(q).test(t)) throw new Error('le quartier « ' + q + ' » se lit dans l’écran Clients'); });
});

await v('ENT-3.1 : la tournée est fermée tant que le repérage n’est pas fait', async () => {
  await ouvrirBo('tournee');
  const t = await pageBo.textContent(zBo);
  if (!/Plan de Nîmes/.test(t)) throw new Error('la tournée s’ouvre sans repérage : ' + t.slice(0, 200));
  if (await pageBo.$$eval(`${zBo} #tourListe`, (e) => e.length)) throw new Error('les arrêts sont déjà manipulables');
});

await v('ENT-3.1 : le quartier se choisit dans un menu de douze, et seul le champ fautif est signalé', async () => {
  // Tristan, 05/10 : un menu déroulant par ligne, douze quartiers de Nîmes dont sept servent.
  await ouvrirBo('plan');
  const m = await pageBo.$$eval(`${zBo} .plan-quartier`, (sels) => sels.map((s) => ({
    n: s.options.length, vide: s.options[0].value === '', id: s.dataset.quartier,
    noms: Array.from(s.options).slice(1).map((o) => o.value),
  })));
  if (m.length !== 7) throw new Error(m.length + ' menus au lieu de 7 (un par ligne)');
  m.forEach((x) => { if (x.n !== 13 || !x.vide) throw new Error('menu ' + x.id + ' : ' + x.n + ' options'); });
  const noms = m[0].noms;
  if (new Set(noms).size !== 12) throw new Error('les noms ne sont pas douze et distincts : ' + noms.join('|'));
  // Les sept utilisés y sont, plus cinq qu'aucun client n'habite — sans eux, le dernier client
  // se trouverait par élimination.
  Object.values(QUARTIERS31).forEach((q) => { if (!noms.includes(q)) throw new Error('quartier absent du menu : ' + q); });
  if (noms.filter((n) => !Object.values(QUARTIERS31).includes(n)).length !== 5) throw new Error('il faut cinq quartiers en trop : ' + noms.join('|'));
  // Alphabétique : la liste ne suit ni la fiche ni le plan, donc ne souffle rien.
  const tries = [...noms].sort((a, b) => a.localeCompare(b, 'fr'));
  if (tries.join('|') !== noms.join('|')) throw new Error('menu pas dans l’ordre alphabétique : ' + noms.join('|'));
  // Les menus sont les mêmes sur toutes les lignes.
  if (m.some((x) => x.noms.join('|') !== noms.join('|'))) throw new Error('les menus ne se ressemblent pas');

  // Les sept cases JUSTES, mais deux quartiers FAUX : un point n'est juste que si les deux le
  // sont, donc deux points faux dépassent la tolérance (un) et le repérage n'est pas validé.
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${zBo} .plan-case[data-case="${id}"]`, c);
  }
  await choisirQuartiersBo(zBo, ['c1', 'c2']);
  await pageBo.selectOption(`${zBo} .plan-quartier[data-quartier="c1"]`, 'Gambetta');
  await pageBo.selectOption(`${zBo} .plan-quartier[data-quartier="c2"]`, 'Pissevin');
  await pageBo.click(`${zBo} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const e = await etatBo('plan');
  if (e.valide) throw new Error('le repérage est validé avec deux quartiers faux');
  const classes = await pageBo.evaluate((z) => {
    const o = {};
    ['c1', 'c2', 'c3'].forEach((id) => {
      o[id] = {
        q: document.querySelector(`${z} .plan-quartier[data-quartier="${id}"]`).classList.contains('plan-ko'),
        c: document.querySelector(`${z} .plan-case[data-case="${id}"]`).classList.contains('plan-ko'),
        qOk: document.querySelector(`${z} .plan-quartier[data-quartier="${id}"]`).classList.contains('plan-ok'),
      };
    });
    return o;
  }, zBo);
  // Seul le menu fautif est rouge : la case, elle, est juste.
  if (!classes.c1.q || classes.c1.c) throw new Error('c1 mal signalé : ' + JSON.stringify(classes.c1));
  if (!classes.c2.q || classes.c2.c) throw new Error('c2 mal signalé : ' + JSON.stringify(classes.c2));
  if (classes.c3.q || classes.c3.c || !classes.c3.qOk) throw new Error('c3 signalé à tort : ' + JSON.stringify(classes.c3));
  const t = await texteBo();
  if (!/2 point\(s\) encore mal situé/.test(t)) throw new Error('le bilan ne compte pas les deux points : ' + t.slice(-300));
});

await v('ENT-3.1 : les sept cases justes ouvrent la tournée et valident le jalon', async () => {
  await ouvrirBo('plan');
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${zBo} .plan-case[data-case="${id}"]`, c);
  }
  await choisirQuartiersBo(zBo);
  await pageBo.click(`${zBo} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const t = await pageBo.textContent(zBo);
  if (!/Les 7 points sont bien situés/.test(t)) throw new Error('les cases du test ne tombent pas d’accord avec le noyau : ' + t.slice(0, 400));
  const e = await etatBo('plan');
  if (!e.valide) throw new Error('le repérage n’est pas enregistré');
  if (e.force) throw new Error('la porte de sortie a été prise alors que tout est juste');
  // Au temps 2, les noms des clients apparaissent dans le tableau (pas sur la carte : au
  // centre-ville, ils masqueraient les noms de quartier et de rue).
  const table = await pageBo.textContent(`${zBo} .plan-table`);
  if (!/Comptoir des Halles/.test(table)) throw new Error('les noms n’apparaissent pas au temps 2');
  // (L'infobulle du point, elle, le porte : ce n'est pas écrit sur la carte.)
  const ecrit = await pageBo.$$eval(`${zBo} .ct-svg text`, (e) => e.map((x) => x.textContent).join('|'));
  if (/Comptoir des Halles/.test(ecrit)) throw new Error('les noms sont écrits sur la carte');
  const s = await dernierSuivi();
  if (s.detail.reperage !== 'ok') throw new Error('jalon repérage : ' + s.detail.reperage);
  if (s.score !== 1) throw new Error('score ' + s.score + ' au lieu de 1 après le repérage');
});

await v('ENT-3.1 : à l’ouverture de la tournée, rien n’est encore reproché', async () => {
  // Le moment le plus traître de la séance. L'élève vient de valider son repérage, il ouvre la
  // tournée, et les sept commandes y sont toutes chargées : 237 kg pour 180 utiles, et un
  // retour bien après le train. Rien de tout cela n'est une faute — c'est l'énoncé. Un jalon
  // qui afficherait « à corriger » ici ferait croire à l'enseignant que l'élève s'est trompé
  // avant même d'avoir touché à quoi que ce soit.
  await ouvrirBo('tournee');
  const t = await texteBo();
  // Le vélo-cargo part VIDE : la jauge est à 0 sur 180 et les sept commandes sont à quai.
  // Trouver tout déjà chargé n'était pas intuitif, et c'était l'inverse du geste réel.
  // La jauge ne dit plus le total — elle dit la LIMITE. C'est la condition pour que la feuille
  // de calcul serve à quelque chose (04/10). Le vélo-cargo part quand même vide, et ça se lit
  // au quai et au récapitulatif, pas à la jauge.
  if (!/max 180 kg/.test(t)) throw new Error('la jauge n’annonce pas la limite : ' + t.slice(0, 300));
  if (/0 \/ 180 kg|179 \/ 180/.test(t)) throw new Error('la jauge donne encore un total : ' + t.slice(0, 300));
  const b0 = await bilanBo();
  if (b0.charge !== 0 || b0.arrets !== 0) throw new Error('le vélo-cargo ne part pas vide : ' + JSON.stringify(b0));
  if (!/Commandes restées à quai \(7\)/.test(t)) throw new Error('les sept commandes ne sont pas à quai : ' + t.slice(0, 400));
  if (!/Rien n'est chargé/.test(t.replace(/’/g, "'"))) throw new Error('pas d’état vide expliqué : ' + t.slice(0, 300));
  if (await pageBo.$$eval(`${zBo} #tourListe .tour-item`, (e) => e.length)) {
    throw new Error('des arrêts sont déjà chargés');
  }
  const j = await jalonsBo();
  const ko = Object.keys(j).filter((k) => j[k] === 'ko');
  if (ko.length) throw new Error('jalon(s) à tort en « ko » à l’ouverture : ' + ko.join(', ') + ' — ' + JSON.stringify(j));
  if (j.charge !== 'attente') throw new Error('jalon charge à l’ouverture : ' + j.charge);
  if (j.horaire !== 'attente') throw new Error('jalon horaire à l’ouverture : ' + j.horaire);
  if (j.choix !== 'attente') throw new Error('jalon choix à l’ouverture : ' + j.choix);
  if (j.reperage !== 'ok') throw new Error('jalon repérage : ' + j.reperage);
  // Le sixième jalon note la feuille de calcul : tant qu'elle n'a pas été touchée, il n'a rien
  // à dire.
  if (j.formules !== 'na') throw new Error('jalon formules à l’ouverture : ' + j.formules);
  // Et le piège inverse : un élève qui tape un chiffre dans une case SANS rien avoir chargé a
  // bien « commencé », mais son vélo-cargo vide respecte évidemment le plafond. Ça ne vaut pas
  // un point — sinon on en gagne un en ne faisant rien.
  await pageBo.fill(`${zBo} [data-report="total"]`, '237');
  await pageBo.waitForTimeout(80);
  const j2 = await jalonsBo();
  if (j2.charge === 'ok') throw new Error('le vélo-cargo vide fait gagner le jalon « charge »');
  if (j2.horaire === 'ok') throw new Error('le vélo-cargo vide fait gagner le jalon « horaire »');
});

await v('ENT-3.1 : la bonne commande à quai, le bon ordre, le train attrapé, 5 jalons sur 6 puis 6 sur 6', async () => {
  await ouvrirBo('tournee');
  // On charge les six, et on laisse La Pointe Sud à quai : 58 kg, la seule commande qui libère
  // assez de charge à elle seule.
  for (const id of ['c1', 'c2', 'c4', 'c5', 'c6', 'c7']) {
    await pageBo.click(`${zBo} [data-reprendre="${id}"]`);
    await pageBo.waitForTimeout(60);
  }
  // On vise la jauge de CHARGE, pas « une jauge en rouge » : à cet instant l'ordre est encore
  // celui de la fiche, donc la jauge d'horaire est légitimement en rouge. Confondre les deux
  // ferait passer ce test pour un échec du calibrage.
  const chargeTrop = await pageBo.$$eval(`${zBo} .tour-jauge`, (els) => els
    .filter((e) => /Charge du vélo-cargo/.test(e.textContent))
    .map((e) => ({ trop: e.classList.contains('trop'), txt: e.textContent.replace(/\s+/g, ' ').trim() })));
  if (chargeTrop.length !== 1) throw new Error(chargeTrop.length + ' jauge(s) de charge');
  if (chargeTrop[0].trop) throw new Error('la charge dépasse encore : ' + chargeTrop[0].txt);
  // La jauge ne donne plus le chiffre : on le vérifie à la source, et on vérifie EN PLUS
  // qu'elle ne le laisse pas filer — ni en clair, ni par une soustraction (« dépassée de 57 »).
  if (/179/.test(chargeTrop[0].txt)) throw new Error('la jauge donne le poids total : ' + chargeTrop[0].txt);
  if (/dépassée de/.test(chargeTrop[0].txt)) throw new Error('la jauge donne le total par soustraction : ' + chargeTrop[0].txt);
  const bCharge = await bilanBo();
  if (bCharge.charge !== 179) throw new Error('charge calculée : ' + bCharge.charge + ' kg au lieu de 179');
  // L'ordre optimal. Le glisser-déposer et les flèches sont déjà éprouvés par les dix-sept
  // cas du noyau ; ici c'est le CHIFFRE qu'on vérifie, donc on pose l'ordre et on redessine.
  await pageBo.evaluate((ordre) => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ordre;
    // Les deux bouts sont posés ici comme l'élève les poserait d'un clic : depuis le 04/10 ils
    // ne sont plus du décor, et une chaîne incomplète raccourcit légitimement le trajet.
    t.depart = Date.now(); t.arrivee = Date.now();
  }, ORDRE31);
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  const bOpt = await bilanBo();
  if (bOpt.arrivee !== '15 h 36') throw new Error('retour calculé à ' + bOpt.arrivee + ' au lieu de 15 h 36');
  if (/15 h 36/.test(t)) throw new Error('l’écran donne l’heure de retour avant le calcul : ' + t.slice(0, 600));
  if (/manqué/.test(t)) throw new Error('le train est annoncé manqué avec le meilleur ordre');
  // Les deux cases de report. Les valeurs sont écrites ici, pas lues sur l'écran.
  const attendu = { total: '237', trop: '57' };
  for (const [id, val] of Object.entries(attendu)) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(180);
  const faux = await pageBo.$$eval(`${zBo} .tour-saisie input.faux`, (e) => e.length);
  if (faux) throw new Error(faux + ' case(s) de report jugée(s) fausse(s) alors qu’elles sont justes');
  const s = await dernierSuivi();
  // Cinq jalons sur six : la feuille de calcul n'a pas été touchée, et c'est elle que note le
  // sixième. Ne rien y avoir fait ne coûte qu'un jalon, et ne fait rien tomber d'autre.
  if (s.score !== 5 || s.max !== 6) throw new Error('suivi : ' + s.score + '/' + s.max + ' — ' + JSON.stringify(s.detail));
  const pas = Object.keys(s.detail).filter((k) => s.detail[k] !== 'ok');
  if (pas.join(',') !== 'formules') throw new Error('jalon(s) pas au vert : ' + pas.join(', '));
  // Les formules justes, vérifiées : le sixième tombe, et la séance vaut 20/20.
  await remplirFeuilleBo();
  const s6 = await dernierSuivi();
  if (s6.score !== 6 || s6.max !== 6) throw new Error('suivi après la feuille : ' + s6.score + '/' + s6.max + ' — ' + JSON.stringify(s6.detail));
});

await v('ENT-3.1 : un mauvais ordre fait manquer le train, et seul ce jalon tombe', async () => {
  // L'ordre de départ, celui de la fiche : 21,3 km et un retour à 16 h 23, treize minutes après
  // le train. La charge, elle, reste bonne — les deux contraintes se jugent séparément.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7'];
    t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null;
    // Comme `invalider()` quand l'élève change sa tournée : le verdict de la feuille s'efface.
    if (t.grille) { t.grille.juge = {}; t.grille.valide = null; }
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  // Le calibrage, à la source : 21,3 km et un retour à 16 h 23, treize minutes après le train.
  const bTrain = await bilanBo();
  if (bTrain.arrivee !== '16 h 23') throw new Error('retour calculé à ' + bTrain.arrivee + ' au lieu de 16 h 23');
  if (bTrain.km !== 21.3) throw new Error('distance calculée : ' + bTrain.km + ' km au lieu de 21,3');
  // À l'écran, l'élève apprend QUE le train est manqué — c'est indispensable, sinon la
  // contrainte disparaît de la séance — mais pas DE COMBIEN : neuf minutes de retard sur une
  // limite connue redonneraient l'heure de retour, donc le temps total qu'il doit calculer.
  if (!/manqué/.test(t)) throw new Error('le retard n’est pas annoncé du tout : ' + t.slice(0, 600));
  // On lit les JAUGES et pas la page entière : la feuille de calcul, remplie par un cas
  // précédent, affiche légitimement le résultat de la formule de l'élève (16 h 19). Ce qui ne
  // doit pas la donner, c'est le tableau de bord.
  const jaugesTxt = (await pageBo.$$eval(`${zBo} .tour-jauge`, (els) => els.map((e) => e.textContent)))
    .join(' ').replace(/\s+/g, ' ');
  if (/16 h 23|manqué de 13 min/.test(jaugesTxt)) throw new Error('les jauges donnent l’heure de retour : ' + jaugesTxt);
  const j = await jalonsBo();
  if (j.horaire !== 'ko') throw new Error('jalon horaire : ' + j.horaire);
  if (j.charge !== 'ok') throw new Error('jalon charge tombé avec l’horaire : ' + j.charge);
  if (j.choix !== 'ok') throw new Error('jalon choix tombé avec l’horaire : ' + j.choix);
  if (j.reperage !== 'ok') throw new Error('jalon repérage tombé avec l’horaire');
  // Réordonner efface la correction des cases : le jalon « report » repasse en « na ».
  if (j.report !== 'na') throw new Error('jalon report après un changement d’ordre : ' + j.report);
  const vus = Object.keys(j).filter((k) => j[k] === 'ok').length;
  if (vus !== 3) throw new Error(vus + ' jalons au vert au lieu de 3 — ' + JSON.stringify(j));
});

await v('ENT-3.1 : une tournée qui ne tient pas refuse le report des résultats', async () => {
  // Le défaut relevé par Tristan le 03/10 : *« il suffit de garder les 6 premières et on tombe
  // juste, aucun travail de tournée à faire »*. La cause est structurelle — chaque case se
  // corrige contre le bilan DE L'ÉLÈVE, donc aucune ne peut juger son ordre — et dans ENT-3.1
  // les quatre valeurs attendues sont identiques quel que soit l'ordre : 237, 57, 179, 36.
  // Un élève obtenait 4/4 en manquant le train de neuf minutes.
  //
  // On arrive ici avec l'ordre de la fiche, celui qui rentre à 16 h 19. Les quatre valeurs
  // saisies sont les BONNES : c'est bien la tournée, et elle seule, qui doit faire refuser.
  const attendu = { total: '237', trop: '57' };
  for (const [id, val] of Object.entries(attendu)) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(180);
  const t = await texteBo();
  if (!/ne tient pas encore/.test(t)) throw new Error('le report est accepté malgré le train manqué : ' + t.slice(-500));
  // Le refus dit ce qui ne va pas, sans dire de combien — même raison que la jauge : « manqué
  // de 9 min » sur un train à 16 h 10 rend l'heure de retour par une addition.
  if (!/train manqué/.test(t)) throw new Error('le refus ne dit pas ce qui ne va pas : ' + t.slice(-400));
  if (/manqué de \d/.test(t)) throw new Error('le refus donne l’heure de retour par soustraction : ' + t.slice(-400));
  // Aucune case n'est déclarée juste : l'écran ne doit pas afficher quatre « juste » sous une
  // jauge rouge.
  const justes = await pageBo.$$eval(`${zBo} .tour-saisie input.juste`, (e) => e.length);
  if (justes) throw new Error(justes + ' case(s) déclarée(s) justes alors que la tournée ne tient pas');
  const j = await jalonsBo();
  if (j.report === 'ok') throw new Error('le jalon report est validé malgré le train manqué');
  // Et le refus s'efface dès que l'élève touche à son ordre : on ne le laisse pas devant un
  // message rouge qui ne correspond plus à rien.
  await pageBo.click(`${zBo} [data-bas="0"]`);
  await pageBo.waitForTimeout(140);
  if (/ne tient pas encore/.test(await texteBo())) throw new Error('le refus survit à un changement d’ordre');
});

await v('ENT-3.1 : la tournée se construit entièrement à la carte, et les six jalons tombent', async () => {
  // Le cas qui dit si le chantier sert à quelque chose. Les autres cas d'ENT-3.1 posent
  // l'ordre à la main dans la base parce que c'est le CHIFFRE qu'ils vérifient ; celui-ci fait
  // l'inverse : il ne touche pas à la base, il clique les six clients sur la carte dans
  // l'ordre de passage, exactement comme un élève, et regarde si la séance tombe juste.
  //
  // Six clics, et c'est tout. Avant la carte cliquable, il fallait six clics de chargement
  // PUIS une dizaine de clics de flèches pour arriver au même état.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = []; t.quai = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
    // Les deux bouts repartent à zéro eux aussi : ce cas doit TOUT construire au clic, y
    // compris le départ et l'arrivée. Les laisser posés par un cas précédent inverserait le
    // sens des deux clics, qui les retireraient au lieu de les placer.
    t.depart = null; t.arrivee = null;
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  if (await pageBo.$$eval(`${zBo} #tourListe .tour-item`, (e) => e.length)) {
    throw new Error('la tournée ne repart pas à vide');
  }
  // Les deux bouts se cliquent comme les clients — c'est le chantier du 04/10 : l'élève doit
  // poser l'entrepôt et la gare, pas les trouver déjà là. Le départ d'abord, comme on raconte
  // une tournée.
  await pageBo.click(`${zBo} [data-clic-extremite="depart"]`);
  await pageBo.waitForTimeout(70);
  for (const id of ORDRE31) {
    await pageBo.click(`${zBo} [data-clic-point="${id}"]`);
    await pageBo.waitForTimeout(70);
  }
  await pageBo.click(`${zBo} [data-clic-extremite="arrivee"]`);
  await pageBo.waitForTimeout(70);
  const t = await pageBo.evaluate(() => window.__bo.db.transport['boost-ent31'].tournee);
  if (!t.depart || !t.arrivee) throw new Error('les deux bouts ne sont pas posés : ' + JSON.stringify({ d: t.depart, a: t.arrivee }));
  // L'ordre attendu, ÉCRIT ICI à la main plutôt que relu depuis `ORDRE31` : les deux doivent
  // tomber d'accord, sinon la constante et la carte pourraient se tromper ensemble.
  if (t.ordre.join(',') !== 'c4,c7,c2,c1,c6,c5') throw new Error('ordre construit à la carte : ' + t.ordre.join(','));
  if (t.quai.join(',') !== 'c3') throw new Error('La Pointe Sud devrait rester seule à quai : ' + t.quai.join(','));

  // Les chiffres de la séance, écrits ici à la main : 179 kg des six commandes retenues
  // (31 + 24 + 42 + 19 + 36 + 27), 21 colis, et le train attrapé.
  const txt = await texteBo();
  const bCarte = await bilanBo();
  if (bCarte.charge !== 179) throw new Error('charge : ' + bCarte.charge + ' kg au lieu de 179');
  if (bCarte.colis !== 21) throw new Error('colis : ' + bCarte.colis + ' au lieu de 21');
  if (bCarte.arrivee !== '15 h 36') throw new Error('retour : ' + bCarte.arrivee + ' au lieu de 15 h 36');
  if (/dépassée|manqué/.test(txt)) throw new Error('une contrainte est violée alors que l’ordre est le bon');

  // La carte, elle, porte bien les deux encres : sept ronds numérotés de 1 à 7 qui ne bougent
  // pas, six pastilles d'ordre, et La Pointe Sud en creux.
  const c = await pageBo.$$eval(`${zBo} .ct-svg .plan-pt`, (gs) => gs.map((g) => ({
    id: g.dataset.point,
    rond: g.querySelector('.ct-mk-l').textContent.trim(),
    ordre: g.querySelector('.plan-pt-ordre text') ? g.querySelector('.plan-pt-ordre text').textContent.trim() : null,
    quai: g.classList.contains('plan-pt-quai'),
  })));
  if (c.map((x) => x.rond).join(',') !== '1,2,3,4,5,6,7') throw new Error('ronds : ' + JSON.stringify(c));
  if (c.filter((x) => x.ordre).length !== 6) throw new Error('pastilles d’ordre : ' + JSON.stringify(c));
  const pointe = c.find((x) => x.id === 'c3');
  if (!pointe.quai || pointe.ordre !== null) throw new Error('La Pointe Sud n’est pas dessinée à quai : ' + JSON.stringify(pointe));
  // Maison Lauze est le PREMIER arrêt et le client n° 4 : le cas même qui affichait deux « 3 »
  // sur la carte avant la correction (La Pointe Sud, client 3, et le 3ᵉ arrêt).
  const lauze = c.find((x) => x.id === 'c4');
  if (lauze.rond !== '4' || lauze.ordre !== '1') throw new Error('Maison Lauze : ' + JSON.stringify(lauze));

  // La feuille se remplit, les deux résultats se reportent et se valident : les six jalons
  // tombent. 237 kg les sept commandes, 57 kg de trop (179 kg chargés et 36 min d'arrêts se
  // calculent maintenant dans la feuille).
  await remplirFeuilleBo();
  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(200);
  const j = await jalonsBo();
  const pas = Object.keys(j).filter((k) => j[k] !== 'ok');
  if (pas.length) throw new Error('jalon(s) non validé(s) : ' + pas.join(', ') + ' — ' + JSON.stringify(j));
});

await v('ENT-3.1 : la feuille de calcul est engendrée depuis la tournée de l’élève', async () => {
  // Ce qui fait d'une feuille de calcul un écran de logiciel et pas un exercice posé à côté :
  // ses données sont CELLES que l'élève vient de construire en cliquant, dans SON ordre. S'il
  // charge six arrêts, les poids occupent B2 à B7 et le total tombe en B8 ; s'il en charge
  // cinq, tout remonte d'une ligne. La plage se lit sur la grille qu'on a sous les yeux.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c7', 'c2', 'c1', 'c6', 'c5']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null; t.valide = null;
    t.grille = { cases: {}, juge: {}, valide: null };
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  const g = await pageBo.$$eval(`${zBo} .gr-table tr`, (trs) => trs.slice(1).map((tr, i) => ({
    ligne: i + 1,
    a: tr.children[1] ? tr.children[1].textContent.trim() : '',
    b: tr.children[2] ? tr.children[2].textContent.trim() : '',
    d: tr.children[4] ? tr.children[4].textContent.trim() : '',
    e: tr.children[5] ? tr.children[5].textContent.trim() : '',
    saisie: !!tr.querySelector('td.gr-saisie[data-ref^="B"]'),
  })));
  // Les six arrêts dans l'ordre de l'élève, lignes 2 à 7, puis le total à remplir en ligne 8.
  const noms = g.slice(1, 7).map((x) => x.a).join('|');
  if (noms !== 'Maison Lauze|Caveau Pélissier|Épicerie Verdier|Le Comptoir des Halles|Atelier Mazet|Studio Garance') {
    throw new Error('les lignes ne suivent pas la tournée de l’élève : ' + noms);
  }
  const poids = g.slice(1, 7).map((x) => x.b).join('|');
  if (poids !== '42|27|24|31|36|19') throw new Error('poids ligne par ligne : ' + poids);
  const refs = await pageBo.$$eval(`${zBo} td.gr-saisie`, (e) => e.map((x) => x.dataset.ref).sort().join(','));
  if (refs !== 'B8,E10,E4,E5,E8,E9') throw new Error('cellules à remplir : ' + refs);
  if (!g[7].saisie) throw new Error('la ligne 8 n’est pas la cellule du poids total');

  // Et la feuille donne les DONNÉES du calcul — distance, vitesse, nombre d'arrêts, temps par
  // arrêt — sans jamais donner les résultats : ce sont les six cellules à remplir (le poids,
  // les trois étapes du temps, l'heure de départ et l'heure d'arrivée).
  const donnees = g.map((x) => `${x.d}=${x.e}`).join(' ; ');
  if (!/Distance du parcours \(km\)=11,9/.test(donnees)) throw new Error('distance : ' + donnees);
  if (!/Vitesse en ville \(km\/h\)=12/.test(donnees)) throw new Error('vitesse : ' + donnees);
  if (!/Nombre d’arrêts=6/.test(donnees)) throw new Error('nombre d’arrêts : ' + donnees);
  if (!/Temps par arrêt \(min\)=6/.test(donnees)) throw new Error('temps par arrêt : ' + donnees);
});

await v('ENT-3.1 : les formules justes sont acceptées, et le résultat s’affiche en direct', async () => {
  // Les formules qu'on attend d'un élève, et leurs résultats écrits ici à la main : 179 kg,
  // 0,99 h de route (11,9 km ÷ 12 km/h), 59,5 min (× 60), 36 min d'arrêts (6 × 6), un départ
  // à 14 h 00, et l'arrivée à la gare : 840 + 59,5 + 36 = 935,5 min, soit 15 h 36.
  for (const [ref, f] of Object.entries(F31)) await taperBo(ref, f);
  // Le résultat s'affiche dans la cellule, en direct, SANS avoir à valider : c'est ce qui
  // permet à l'élève de voir ce que son calcul produit pendant qu'il l'écrit.
  const res = await pageBo.evaluate((z) => ['B8', 'E4', 'E5', 'E8', 'E9', 'E10']
    .map((r) => document.querySelector(`${z} [data-gr-res="${r}"]`).textContent.trim()).join('|'), zBo);
  if (res !== '179|0,99|59,5|36|14 h 00|15 h 36') throw new Error('résultats affichés : ' + res);

  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('les formules ne sont pas acceptées : ' + t.slice(-400));
  const justes = await pageBo.$$eval(`${zBo} td.gr-saisie.juste`, (e) => e.length);
  if (justes !== 6) throw new Error(justes + ' cellule(s) juste(s) au lieu de 6');
  // L'état vit dans la base de l'élève, cloisonné dans celui de la tournée : il retrouvera ses
  // formules la semaine suivante.
  const enBase = await pageBo.evaluate(() => window.__bo.db.transport['boost-ent31'].tournee.grille.cases);
  if (enBase.B8 !== '=SOMME(B2:B7)') throw new Error('les formules ne sont pas enregistrées : ' + JSON.stringify(enBase));
});

await v('ENT-3.1 : un nombre tapé à la main est refusé, même quand il est juste', async () => {
  // Le cœur du chantier. Un élève qui calcule de tête et tape « 179 » a trouvé le bon nombre
  // sans faire le travail demandé — et c'est le travail demandé qui est la compétence. Le
  // message doit le lui dire autrement que « faux », parce qu'il n'a pas faux.
  await taperBo('B8', '179');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  let t = await texteBo();
  if (/Toutes les formules sont justes/.test(t)) throw new Error('un nombre tapé à la main est accepté');
  if (!/écrivez une formule/.test(t)) throw new Error('le refus ne dit pas ce qui manque : ' + t.slice(-400));
  if (!/tapé à la main/.test(t)) throw new Error('le bilan ne distingue pas le nombre tapé du résultat faux : ' + t.slice(-400));
  // Le jalon « formules » le dit aussi : une formule fausse n'est pas du travail manquant.
  if ((await jalonsBo()).formules !== 'ko') throw new Error('jalon formules avec un nombre tapé : ' + (await jalonsBo()).formules);

  // Une formule juste mais qui ne tombe pas sur la bonne valeur, c'est « à revoir », pas la
  // même chose : les deux verdicts ne doivent pas se confondre.
  await taperBo('B8', '=SOMME(B2:B6)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (/écrivez une formule/.test(t)) throw new Error('une formule juste est prise pour un nombre tapé');
  if (!/à revoir/.test(t)) throw new Error('une plage trop courte est acceptée : ' + t.slice(-400));

  // Et une formule mal écrite est signalée comme telle, pas comme un résultat faux.
  await taperBo('B8', '=SOMM(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (!/formule mal écrite/i.test(t)) throw new Error('une fonction inconnue n’est pas signalée : ' + t.slice(-400));

  await taperBo('B8', '=SOMME(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  if ((await jalonsBo()).formules !== 'ok') throw new Error('jalon formules avec toutes les formules justes : ' + (await jalonsBo()).formules);
});

await v('feuille de calcul : désigner une cellule à la souris écrit sa référence', async () => {
  // Tristan, le 04/10 : *« il ne reproduit pas le clic ou le clic glissé pour sélectionner les
  // cellules »*. C'est le geste d'Excel, et c'est comme ça qu'on apprend ce qu'est une plage :
  // on la montre, on ne l'épelle pas. Trois gestes, plus deux règles qui disent QUAND ils
  // s'arment — ces deux-là sont sorties en pilotant l'écran à la souris, pas d'une relecture.
  // Depuis le chantier F, on écrit dans la BARRE DE FORMULE, la cellule B8 choisie.
  const champ = barreBo();
  const val = () => pageBo.inputValue(champ);
  // Le message flottant du test précédent reste 2,6 s en bas de l'écran, pile là où tombent les
  // cellules de la feuille : un clic de souris brut atterrissait DESSUS et ne faisait rien. On
  // le retire plutôt que d'attendre — et c'est aussi ce qui rend ce cas rapide.
  await pageBo.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
  const centre = async (ref) => {
    const el = pageBo.locator(`${zBo} .gr-table [data-ref="${ref}"]`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const cliquer = async (ref, maj) => {
    const p = await centre(ref);
    if (maj) await pageBo.keyboard.down('Shift');
    await pageBo.mouse.move(p.x, p.y);
    await pageBo.mouse.down();
    await pageBo.mouse.up();
    if (maj) await pageBo.keyboard.up('Shift');
    await pageBo.waitForTimeout(90);
  };
  const ouvrirFormule = async (texte) => {
    await choisirBo('B8');
    await pageBo.fill(champ, texte);
    await pageBo.click(champ);
    await pageBo.keyboard.press('End');
    await pageBo.waitForTimeout(60);
  };

  // ── Le clic simple insère la référence de la cellule désignée.
  await ouvrirFormule('=');
  await cliquer('B4');
  if (await val() !== '=B4') throw new Error('clic simple : ' + await val());

  // ── Le clic glissé suit la souris et écrit UNE plage, pas six références empilées.
  await ouvrirFormule('=SOMME(');
  const d = await centre('B2');
  await pageBo.mouse.move(d.x, d.y);
  await pageBo.mouse.down();
  for (const r of ['B3', 'B4', 'B5', 'B6', 'B7']) {
    const p = await centre(r);
    await pageBo.mouse.move(p.x, p.y);
    await pageBo.waitForTimeout(25);
  }
  await pageBo.mouse.up();
  await pageBo.waitForTimeout(100);
  if (await val() !== '=SOMME(B2:B7') throw new Error('clic glissé : ' + await val());
  // Et la plage obtenue est la bonne : refermée, elle vaut les 179 kg des six commandes.
  await pageBo.keyboard.type(')');
  await pageBo.waitForTimeout(140);
  const res = await pageBo.textContent(`${zBo} [data-gr-res="B8"]`);
  if (res.trim() !== '179') throw new Error('la plage désignée ne vaut pas 179 : ' + res);

  // ── Maj-clic étend la dernière référence posée, sans en empiler une seconde.
  await ouvrirFormule('=SOMME(');
  await cliquer('B2');
  await cliquer('B5', true);
  if (await val() !== '=SOMME(B2:B5') throw new Error('Maj-clic : ' + await val());

  // ── Un glissement de bas en haut s'écrit quand même à l'endroit : « B2:B7 », jamais
  // « B7:B2 ». C'est ce que l'élève doit lire et réécrire ensuite tout seul.
  await ouvrirFormule('=SOMME(');
  await cliquer('B7');
  await cliquer('B3', true);
  if (await val() !== '=SOMME(B3:B7') throw new Error('plage à l’envers non remise à l’endroit : ' + await val());

  // ── La référence s'insère AU CURSEUR, pas à la fin : l'élève qui reprend le début de sa
  // formule ne doit pas voir sa cellule atterrir tout au bout.
  await choisirBo('B8');
  await pageBo.fill(champ, '=+100');
  await pageBo.click(champ);
  await pageBo.evaluate((sel) => {
    const e = document.querySelector(sel);
    e.setSelectionRange(1, 1);
    e.dispatchEvent(new Event('select'));
  }, champ);
  await cliquer('B3');
  if (await val() !== '=B3+100') throw new Error('insertion ailleurs qu’au curseur : ' + await val());

  await taperBo('B8', '=SOMME(B2:B7)');
  await pageBo.waitForTimeout(80);
});

await v('feuille de calcul : le pointage se tait quand la formule n’attend pas de référence', async () => {
  // Les deux pièges d'une cellule cliquable, trouvés en pilotant la souris. Sans ces deux
  // règles, l'élève récolte des références dont il n'a rien demandé et ne comprend pas d'où
  // elles sortent — ce qui est pire que l'absence du geste.
  // Depuis le chantier F : la barre de formule, sur la cellule B8. Hors formule, cliquer une autre
  // cellule la CHOISIT (comme Excel) ; ce qui compte, c'est que B8 n'ait rien récolté.
  const champ = barreBo();
  await pageBo.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
  const centre = async (ref) => {
    const el = pageBo.locator(`${zBo} .gr-table [data-ref="${ref}"]`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };

  // 1. Hors formule, une cellule cliquée reste une cellule cliquée : elle devient la cellule choisie.
  await taperBo('B8', '179');
  await pageBo.click(champ);
  const p4 = await centre('B4');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if ((await casesBo()).B8 !== '179') throw new Error('un clic insère une référence hors formule : ' + (await casesBo()).B8);
  if ((await pageBo.textContent(`${zBo} [data-gr-barre-ref]`)).trim() !== 'B4') throw new Error('la cellule cliquée n’est pas choisie');

  // 2. Sur une formule TERMINÉE, le clic ne vient pas la polluer : l'élève qui a fini et qui
  //    clique la cellule suivante veut y aller, pas y faire référence.
  await taperBo('B8', '=SOMME(B2:B7)');
  await pageBo.click(champ);
  await pageBo.keyboard.press('End');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if ((await casesBo()).B8 !== '=SOMME(B2:B7)') throw new Error('une formule finie est polluée par un clic : ' + (await casesBo()).B8);

  // 3. Cliquer DANS la barre pour y poser le curseur n'insère pas de référence.
  await choisirBo('B8');
  await pageBo.fill(champ, '=SOMME(');
  await pageBo.click(champ);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '=SOMME(') {
    throw new Error('le champ s’auto-référence quand on y clique : ' + await pageBo.inputValue(champ));
  }

  await taperBo('B8', '=SOMME(B2:B7)');
  await pageBo.waitForTimeout(80);
});

await v('ENT-3.1 : l’élève pose lui-même le départ et l’arrivée, et ils comptent dans le trajet', async () => {
  // Tristan, le 04/10 : *« l'élève ne sélectionne ni le départ (entrepôt Boost) ni l'arrivée
  // (la gare) »*. Ils étaient dessinés et comptés, mais jamais touchés : on pouvait finir la
  // séance sans voir que la tournée part de Carémeau et finit à la gare, alors que ces deux
  // trajets font une bonne part des kilomètres à calculer.
  const poser = async (ordre, depart, arrivee) => {
    await pageBo.evaluate((o) => {
      const t = window.__bo.db.transport['boost-ent31'].tournee;
      t.ordre = o.ordre; t.quai = ['c3'];
      t.depart = o.depart ? Date.now() : null;
      t.arrivee = o.arrivee ? Date.now() : null;
      t.juge = {}; t.bloque = null; t.valide = null;
    }, { ordre, depart, arrivee });
    await ouvrirBo('plan');
    await ouvrirBo('tournee');
    return bilanBo();
  };

  // Les longueurs, par les rues : 11,9 km la chaîne complète ; sans la gare il manque le
  // retour, sans l'entrepôt il manque l'aller. Les deux bouts pèsent 3,8 km à eux seuls —
  // c'est précisément ce que l'élève ne voyait pas.
  const complet = await poser(ORDRE31, true, true);
  if (complet.km !== 11.9) throw new Error('chaîne complète : ' + complet.km + ' km au lieu de 11,9');
  if (!complet.arrivee) throw new Error('pas d’heure de retour sur une chaîne complète');

  const sansGare = await poser(ORDRE31, true, false);
  if (sansGare.km >= complet.km) throw new Error('retirer la gare ne raccourcit pas le trajet : ' + sansGare.km);

  const sansRien = await poser(ORDRE31, false, false);
  if (sansRien.km >= sansGare.km) throw new Error('retirer l’entrepôt ne raccourcit pas le trajet : ' + sansRien.km);

  // Et la carte le montre : un bout pas encore posé est dessiné en creux, comme un arrêt resté
  // à quai — même signe pour le même sens.
  const dessin = await pageBo.evaluate(() => ({
    departVide: !!document.querySelector('#boost31 .ct-mk-depart.ct-mk-creux'),
    arriveeVide: !!document.querySelector('#boost31 .ct-mk-arrivee.ct-mk-creux'),
    pastilles: [...document.querySelectorAll('#boost31 .ct-mk-depart .plan-pt-ordre, #boost31 .ct-mk-arrivee .plan-pt-ordre')].length,
  }));
  if (!dessin.departVide || !dessin.arriveeVide) throw new Error('un bout non posé est dessiné comme posé : ' + JSON.stringify(dessin));
  if (dessin.pastilles) throw new Error('un bout non posé porte une pastille de tournée');

  // Posés, ils prennent leur pastille menthe « D » et « A » : la chaîne se lit D → 1 … → A.
  await poser(ORDRE31, true, true);
  const lettres = await pageBo.evaluate(() => [...document.querySelectorAll(
    '#boost31 .ct-mk-depart .plan-pt-ordre text, #boost31 .ct-mk-arrivee .plan-pt-ordre text')]
    .map((t) => t.textContent.trim()).join(','));
  if (lettres !== 'D,A') throw new Error('pastilles des deux bouts : ' + lettres);
});

await v('ENT-3.1 : oublier la gare ne doit pas devenir une façon d’attraper le train', async () => {
  // Le trou que ce chantier aurait pu ouvrir, et la raison pour laquelle le report doit refuser
  // une chaîne incomplète. C'est la troisième fois que le même piège se présente sur cette
  // séance : « il suffit de garder les 6 premières », puis les cases identiques quel que soit
  // l'ordre, et maintenant le retour qu'on n'a pas placé.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    // Un ordre qui finit à Saint-Césaire, loin de la gare : complet il rentre à 16 h 16, après
    // le train ; sans le retour vers la gare, il « finirait » à 15 h 57 (carte réelle, 03/10/2026).
    t.ordre = ['c1', 'c5', 'c2', 'c6', 'c7', 'c4']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = null;        // la gare n'est pas placée
    t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  // Sans le retour vers la gare, le modèle dit que le train est attrapé : c'est bien une
  // tricherie praticable, et c'est pour ça qu'elle doit être refusée ailleurs.
  const b = await bilanBo();
  if (b.enRetard) throw new Error('test invalide : la chaîne incomplète est déjà en retard, il n’y a rien à refuser');

  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(200);
  const t = await texteBo();
  if (!/ne tient pas encore/.test(t)) throw new Error('le report est accepté avec une chaîne incomplète : ' + t.slice(-400));
  if (!/arrivée n’est pas placée/.test(t)) throw new Error('le refus ne dit pas ce qui manque : ' + t.slice(-400));
  const justes = await pageBo.$$eval(`${zBo} .tour-saisie input.juste`, (e) => e.length);
  if (justes) throw new Error(justes + ' case(s) déclarée(s) justes avec une chaîne incomplète');
  const j = await jalonsBo();
  if (j.report === 'ok') throw new Error('le jalon report est validé avec une chaîne incomplète');
});

await v('ENT-3.1 : vert = l’ordre, bleu = le client — sur la carte ET dans la liste', async () => {
  // Relevé par Tristan le 04/10, capture à l'appui : *« le jeu de couleur est inversé, le vert
  // doit signifier l'ordre de la tournée, le bleu l'emplacement physique de la boutique »*. La
  // carte disait vert = ordre, la liste disait l'inverse — et les deux écrans se contredisaient
  // sur la seule chose que ce chantier devait rendre univoque.
  //
  // Ce cas tient les DEUX écrans ensemble. Un test qui n'en regarderait qu'un laisserait
  // repartir l'incohérence au premier coup de pinceau.
  const c = await pageBo.evaluate(() => {
    const rgb = (s) => String(s || '').replace(/\s/g, '');
    const lu = (el, prop) => (el ? rgb(getComputedStyle(el)[prop]) : 'absent');
    const page = document.querySelector('#boost31 .ent-page');
    const vari = (v) => rgb(getComputedStyle(page).getPropertyValue(v));
    return {
      vert: vari('--vert'), bleu: vari('--ardoise-fond'),
      carteClient: lu(document.querySelector('#boost31 .plan-pt .ct-rond'), 'fill'),
      carteOrdre: lu(document.querySelector('#boost31 .plan-pt-ordre circle'), 'fill'),
      // Dans le RÉCAPITULATIF, pas dans les lignes de départ/arrivée qui le précèdent : leurs
      // étiquettes ne portent ni l'une ni l'autre des deux encres, et les lire ici ferait
      // passer ce cas pour vert quoi qu'il arrive.
      listeOrdre: lu(document.querySelector('#boost31 #tourListe .tour-rang'), 'backgroundColor'),
      listeClient: lu(document.querySelector('#boost31 #tourListe .tour-num'), 'color'),
    };
  });
  // Les deux couleurs de la charte de Boost, écrites ici à la main.
  if (c.vert !== '#25c998' && c.vert !== 'rgb(37,201,152)') throw new Error('--vert : ' + c.vert);
  if (c.bleu !== '#345cfd' && c.bleu !== 'rgb(52,92,253)') throw new Error('--ardoise-fond : ' + c.bleu);
  const VERT = 'rgb(37,201,152)';
  const BLEU = 'rgb(52,92,253)';
  if (c.carteOrdre !== VERT) throw new Error('carte, pastille d’ordre : ' + c.carteOrdre + ' au lieu du vert');
  if (c.carteClient !== BLEU) throw new Error('carte, rond du client : ' + c.carteClient + ' au lieu du bleu');
  if (c.listeOrdre !== VERT) throw new Error('liste, pastille d’ordre : ' + c.listeOrdre + ' au lieu du vert');
  if (c.listeClient !== BLEU) throw new Error('liste, numéro du client : ' + c.listeClient + ' au lieu du bleu');
});

await v('formules : une heure se tape « 13:00 » ou « 13h00 » et vaut des minutes', async () => {
  // Demandé par Tristan le 05/10 : l'élève entre l'heure de départ, puis y AJOUTE le temps de
  // route en minutes. Une heure vaut donc des minutes depuis minuit (13 h 00 = 780). Les valeurs
  // sont écrites ici à la main.
  const r = await pageBo.evaluate(async () => {
    const F = await import('/core/formules.js');
    return {
      a: F.heureFr('13:00'), b: F.heureFr('13h05'), c: F.heureFr('13 h 05'), d: F.heureFr('13h'),
      nu: F.heureFr('13'), tard: F.heureFr('25:00'), min: F.heureFr('12:75'), texte: F.heureFr('Arrêt'),
      somme: F.evaluerGrille({ B1: '13:00', B2: '110,5', B3: '36', B4: '=B1+B2+B3' }).valeurs.B4,
      fmt: F.formaterHeure(926.5), fmt2: F.formaterHeure(970), fmt3: F.formaterHeure(785),
      aff: F.afficher('B4', F.evaluerGrille({ B4: '=13*60+5' }), 1, 'heure'),
    };
  });
  const attendu = { a: 780, b: 785, c: 785, d: 780, nu: null, tard: null, min: null, texte: null,
    somme: 926.5, fmt: '15 h 27', fmt2: '16 h 10', fmt3: '13 h 05', aff: '13 h 05' };
  for (const [k, val] of Object.entries(attendu)) {
    if (r[k] !== val) throw new Error(`${k} : ${r[k]} au lieu de ${val}`);
  }
});

// ── Les états posés à la main pour les cas de la feuille de calcul : six arrêts qui tiennent,
// ou les sept qui ne tiennent pas. Les adresses suivent le nombre d'arrêts (voir plus haut).
const poserGrille = async (ordre, quai, cases) => {
  await pageBo.evaluate((o) => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = o.ordre; t.quai = o.quai;
    t.depart = Date.now(); t.arrivee = Date.now();
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
    t.grille = { cases: o.cases || {}, juge: {}, valide: null };
  }, { ordre, quai, cases });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
};
const SIX = ['c4', 'c7', 'c2', 'c1', 'c6', 'c5'];
const FORM6 = F31;
const SEPT = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
// Sept arrêts : le total descend en B9 ; le calcul du temps, à droite, ne bouge pas.
const FORM7 = Object.fromEntries([...Object.entries(F31).filter(([k]) => k !== 'B8'), ['B9', '=SOMME(B2:B8)']]);

await v('ENT-3.1 : les étapes et les résultats ont chacun leur surbrillance, et les contraintes sont dans la feuille', async () => {
  // Tristan, le 05/10 : *« une surbrillance différente pour distinguer les étapes et les
  // résultats (poids total chargé) et heure d'arrivée »*. On mesure les couleurs RENDUES, pas
  // les noms de classes : une classe sans règle CSS passerait un test de classes.
  await poserGrille(SIX, ['c3']);
  // En colonnes, une ligne porte deux blocs : on lit chaque libellé (colonne A ou D) et la teinte de
  // la cellule à sa droite (B ou E).
  const fond = await pageBo.$$eval(`${zBo} .gr-table tbody tr`, (trs) => trs.flatMap((tr) => [1, 4].map((k) => ({
    a: tr.children[k] ? tr.children[k].textContent.replace(/\s+/g, ' ').trim() : '',
    bg: tr.children[k + 1] ? getComputedStyle(tr.children[k + 1]).backgroundColor : '',
  }))));
  const de = (re) => {
    const l = fond.find((x) => re.test(x.a));
    if (!l) throw new Error('ligne introuvable : ' + re + ' dans ' + fond.map((x) => x.a).join(' | '));
    return l.bg;
  };
  const e1 = de(/^Étape 1/), e2 = de(/^Étape 2/), e3 = de(/^Étape 3/);
  const poids = de(/^Poids total chargé/), arrivee = de(/^Heure d’arrivée/);
  const depart = de(/^Heure de départ/), fixe = de(/^Distance du parcours/);
  if (e1 !== e2 || e2 !== e3) throw new Error('les trois étapes n’ont pas la même surbrillance : ' + [e1, e2, e3]);
  if (poids !== arrivee) throw new Error('les deux résultats n’ont pas la même surbrillance : ' + [poids, arrivee]);
  if (e1 === poids) throw new Error('une étape et un résultat ont la même surbrillance : ' + e1);
  if (e1 === depart || poids === depart) throw new Error('l’heure de départ se confond avec une étape ou un résultat');
  if (e1 === fixe || poids === fixe) throw new Error('une donnée fixe se confond avec une étape ou un résultat');

  // Les explications s'affichent SOUS LA BARRE quand on choisit la cellule (chantier F, choix de
  // Tristan) : la formule distance ÷ vitesse avec ses unités, la conversion, l'heure d'arrivée.
  const aide = async (ref) => { await choisirBo(ref); return (await pageBo.textContent(`${zBo} [data-gr-barre-info]`)).replace(/\s+/g, ' '); };
  if (!/Distance \(km\) ÷ vitesse \(km\/h\) = temps \(h\)/.test(await aide('E4'))) throw new Error('l’étape 1 n’est pas expliquée : ' + await aide('E4'));
  if (!/1 heure = 60 minutes/.test(await aide('E5'))) throw new Error('la conversion en minutes n’est pas expliquée');
  if (!/Nombre d’arrêts × temps par arrêt/.test(await aide('E8'))) throw new Error('l’étape 3 n’est pas expliquée');
  if (!/SOMME/.test(await aide('B8'))) throw new Error('le poids total n’est pas expliqué');
  if (!/Heure de départ \+ temps de route \(min\) \+ temps aux arrêts \(min\)/.test(await aide('E10'))) throw new Error('l’heure d’arrivée n’est pas expliquée');
  if (await aide('E2')) throw new Error('une donnée fixe a une aide : ' + await aide('E2'));
  const t = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  // Les deux contraintes figurent aussi dans la feuille, pour la comparaison.
  if (!/Charge utile maximale \(kg\)\s*180/.test(t)) throw new Error('la charge maximale n’est pas dans la feuille : ' + t);
  if (!/Départ du train \(contrainte\)\s*16 h 10/.test(t)) throw new Error('le train n’est pas dans la feuille : ' + t);
  // La légende dit ce que les couleurs veulent dire.
  const leg = await pageBo.$eval(`${zBo} .gr-legende`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Étape du calcul/.test(leg) || !/Résultat à comparer/.test(leg)) throw new Error('légende : ' + leg);

  // Les contraintes sont DANS le bloc de la feuille, à sa droite — et plus au-dessus.
  const place = await pageBo.evaluate((z) => {
    const racine = document.querySelector(z);
    const droite = racine.querySelector('.gr-bloc .gr-droite');
    const gauche = racine.querySelector('.gr-bloc .gr-gauche .gr-table');
    const haut = racine.querySelector('.tour-grille .tour-jauge');
    if (!droite || !gauche) return { ok: false };
    const a = gauche.getBoundingClientRect(), b = droite.getBoundingClientRect();
    return { ok: true, aDroite: b.left >= a.right - 1, jauges: droite.querySelectorAll('.tour-jauge').length, haut: !!haut };
  }, zBo);
  if (!place.ok) throw new Error('les contraintes ne sont pas dans le bloc de la feuille');
  if (!place.aDroite) throw new Error('les contraintes ne sont pas à droite de la feuille');
  if (place.jauges < 3) throw new Error(place.jauges + ' jauge(s) à droite de la feuille');
  if (place.haut) throw new Error('des jauges restent au-dessus de la feuille');
});

await v('ENT-3.1 : des formules justes avec une tournée qui ne tient pas — le calcul est vert, la contrainte est rouge', async () => {
  // Le cas qui a motivé la demande : un élève charge les sept commandes (237 kg pour 180), écrit
  // des formules PARFAITES, et doit voir d'un coup d'œil que son calcul est bon et que c'est sa
  // tournée qui ne passe pas. Les adresses suivent : sept arrêts, donc le total tombe en B9.
  await poserGrille(SEPT, [], FORM7);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(220);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('les formules sept arrêts ne sont pas acceptées : ' + t.slice(-500));
  const justes = await pageBo.$$eval(`${zBo} td.gr-saisie.juste`, (e) => e.length);
  if (justes !== 6) throw new Error(justes + ' cellule(s) en vert au lieu de 6');
  // À droite, la charge est en rouge — et la carte de la charge ne dit PAS de combien.
  const droite = await pageBo.$$eval(`${zBo} .gr-droite .tour-jauge`, (els) => els.map((e) => ({
    trop: e.classList.contains('trop'), txt: e.textContent.replace(/\s+/g, ' ').trim() })));
  const charge = droite.find((x) => /Charge du vélo-cargo/.test(x.txt));
  if (!charge || !charge.trop) throw new Error('la charge dépassée n’est pas en rouge : ' + JSON.stringify(droite));
  if (!/dépassée/.test(charge.txt)) throw new Error('la carte ne dit pas que la limite est franchie : ' + charge.txt);
  const fuite = droite.map((x) => x.txt).join(' ');
  if (/\b(237|57)\b/.test(fuite)) throw new Error('la colonne de droite laisse filer un total : ' + fuite);
  if (/dépassée de/.test(fuite)) throw new Error('la colonne de droite donne l’écart : ' + fuite);
  // Et le message qui relie les deux : le calcul est bon, c'est la tournée qui est à revoir.
  const av = await pageBo.$$eval(`${zBo} .avis-contrainte`, (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (av.length !== 1 || !/Vos formules sont justes, mais la tournée ne respecte pas/.test(av[0])) {
    throw new Error('message manquant : ' + JSON.stringify(av));
  }
  // Le vert et le rouge ne se mélangent pas : une cellule juste n'est jamais rouge.
  const mele = await pageBo.$$eval(`${zBo} td.gr-saisie.juste.faux`, (e) => e.length);
  if (mele) throw new Error('une cellule est à la fois juste et fausse');

  // Retirer un arrêt change les données sous les formules : le verdict périmé disparaît, avec
  // son message. Sans ça, « juste » restait affiché sur un total devenu faux.
  await pageBo.click(`${zBo} [data-quai="c3"]`);
  await pageBo.waitForTimeout(220);
  const reste = await pageBo.evaluate((z) => ({
    justes: document.querySelectorAll(`${z} td.gr-saisie.juste`).length,
    avis: document.querySelectorAll(`${z} .avis-contrainte`).length,
    base: Object.keys(window.__bo.db.transport['boost-ent31'].tournee.grille.juge || {}).length,
  }), zBo);
  if (reste.justes || reste.avis || reste.base) throw new Error('le verdict de la feuille survit à un changement de tournée : ' + JSON.stringify(reste));
});

await v('ENT-3.1 : une tournée qui tient et des formules justes — la contrainte est verte, sans message d’alerte', async () => {
  await poserGrille(SIX, ['c3'], FORM6);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(220);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('formules six arrêts : ' + t.slice(-400));
  const trop = await pageBo.$$eval(`${zBo} .gr-droite .tour-jauge.trop`, (e) => e.length);
  if (trop) throw new Error(trop + ' contrainte(s) en rouge alors que la tournée tient');
  const ok = await pageBo.$$eval(`${zBo} .gr-droite .pastille.ok`, (e) => e.map((x) => x.textContent.trim()).join('|'));
  if (ok !== 'limite respectée|horaire tenu') throw new Error('pastilles vertes : ' + ok);
  if (await pageBo.$$eval(`${zBo} .avis-contrainte`, (e) => e.length)) throw new Error('un message d’alerte alors que tout tient');
});

await v('ENT-3.1 : l’heure de départ se tape « 14h00 » ou « 14:00 », et « 14 » est refusé', async () => {
  await poserGrille(SIX, ['c3'], Object.assign({}, FORM6, { E9: '14' }));
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  let faux = await pageBo.$$eval(`${zBo} td.gr-saisie.faux`, (e) => e.map((x) => x.dataset.ref).join(','));
  // « 14 » ne dit pas si c'est 14 minutes ou 14 heures : la cellule est à revoir, et c'est la
  // SEULE — l'heure d'arrivée, calculée depuis un 14, est fausse elle aussi, ce qui est normal.
  if (!/E9/.test(faux)) throw new Error('« 14 » est accepté comme heure de départ : ' + faux);
  await taperBo('E9', '14h00');
  await pageBo.waitForTimeout(60);
  const res = await pageBo.textContent(`${zBo} [data-gr-res="E10"]`);
  if (res.trim() !== '15 h 36') throw new Error('« 14h00 » ne donne pas 15 h 36 : ' + res);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} td.gr-saisie.faux`, (e) => e.length);
  if (faux) throw new Error(faux + ' cellule(s) fausses avec « 14h00 »');
  // Un départ tapé à 15:00 donne une arrivée plus tard : la formule reste JUSTE comme formule,
  // mais l'heure de départ n'est pas celle de la consigne.
  await taperBo('E9', '15:00');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} td.gr-saisie.faux`, (e) => e.map((x) => x.dataset.ref).join(','));
  if (!/E9/.test(faux)) throw new Error('un départ à 15:00 est accepté : ' + faux);
});

await v('ENT-3.1 : les jauges ne donnent plus les totaux, et les rendent après validation', async () => {
  // La décision qui décide de tout : si la jauge affiche « 179 / 180 kg », l'élève le recopie
  // et la feuille de calcul ne sert à rien — exactement le défaut relevé par Tristan le 03/10
  // sur les cases de report, d'un cran plus haut.
  // On repart de la tournée qui tient, chaîne complète : les cas précédents ont laissé des
  // états volontairement bancals, et ce cas-ci parle des CHIFFRES, pas de l'organisation.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c7', 'c2', 'c1', 'c6', 'c5']; t.quai = ['c3'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.report = {}; t.juge = {}; t.bloque = null; t.valide = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');

  const lire = async () => (await pageBo.$$eval(`${zBo} .tour-jauges`, (e) => e[0].textContent.replace(/\s+/g, ' ')))[0] === undefined
    ? '' : (await pageBo.$$eval(`${zBo} .tour-jauges`, (e) => e[0].textContent.replace(/\s+/g, ' ').trim()));

  let j = await lire();
  if (!/max 180 kg/.test(j)) throw new Error('la jauge de charge n’annonce pas sa limite : ' + j);
  if (/179/.test(j)) throw new Error('la jauge donne le poids total : ' + j);
  if (/15 h 36|95,5 min/.test(j)) throw new Error('la jauge donne l’heure de retour ou le temps total : ' + j);
  // Ce qu'elle CONTINUE de donner : la limite. Les données du calcul (distance, vitesse, temps
  // par arrêt) sont passées dans la feuille de calcul, à gauche, et ne sont plus répétées ici.
  if (!/16 h 10/.test(j)) throw new Error('le train n’est plus annoncé : ' + j);
  const feuille = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Distance du parcours \(km\)\s*11,9/.test(feuille)) throw new Error('la distance n’est plus donnée : ' + feuille);
  if (!/Temps par arrêt \(min\)\s*6/.test(feuille)) throw new Error('le temps par arrêt n’est plus donné : ' + feuille);
  // Une mesure SANS plafond n'est pas un repère de limite : elle garde son total, sinon on
  // enverrait l'élève calculer un nombre que personne ne lui demande.
  if (!/21 colis/.test(j)) throw new Error('les colis, sans plafond, ont été rendus muets : ' + j);

  // Le travail fait, le chiffre revient : c'est le retour, et il n'a plus rien à donner.
  for (const [id, val] of Object.entries({ total: '237', trop: '57' })) {
    await pageBo.fill(`${zBo} [data-report="${id}"]`, val);
  }
  await pageBo.click(`${zBo} [data-tour-valider]`);
  await pageBo.waitForTimeout(220);
  j = await lire();
  if (!/179 \/ 180 kg/.test(j)) throw new Error('la jauge ne rend pas le total après validation : ' + j);
  if (!/15 h 36/.test(j)) throw new Error('l’heure de retour n’est pas rendue après validation : ' + j);

  // Et elle se retait dès que l'élève touche à sa tournée : une validation ancienne ne doit
  // pas dévoiler les totaux d'une tournée qui a changé.
  await pageBo.click(`${zBo} [data-bas="0"]`);
  await pageBo.waitForTimeout(200);
  j = await lire();
  if (/179 \/ 180 kg|15 h 3/.test(j)) throw new Error('les jauges restent dévoilées après un changement d’ordre : ' + j);
  if (!/max 180 kg/.test(j)) throw new Error('les jauges ne redeviennent pas des repères : ' + j);
  // Et l'horodatage de la validation part avec elle. L'écran est déjà protégé par la règle de
  // dévoilement, qui exige une correction EN COURS ; mais laisser un `valide` derrière soi
  // ferait écrire au suivi qu'une tournée a été validée à une heure où ce n'était plus vrai.
  const reste = await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    return { valide: t.valide, juges: Object.keys(t.juge || {}).length };
  });
  if (reste.valide) throw new Error('la validation survit à un changement d’ordre : ' + reste.valide);
  if (reste.juges) throw new Error('la correction survit à un changement d’ordre');
});

await v('ENT-3.1 : laisser deux commandes à quai reste une sortie de secours praticable', async () => {
  // Décision du calibrage : l'élève en difficulté peut laisser DEUX clients à quai et tenir
  // l'horaire largement. Le jalon « choix » le dit faux, mais il n'est pas bloqué.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c7'];
    t.quai = ['c3', 'c5'];
    t.depart = Date.now(); t.arrivee = Date.now();
    t.juge = {}; t.bloque = null;
  });
  await ouvrirBo('plan');
  await ouvrirBo('tournee');
  const t = await texteBo();
  if (/manqué/.test(t)) throw new Error('deux clients à quai et le train est encore manqué : ' + t.slice(0, 400));
  const bDeux = await bilanBo();
  if (bDeux.arrivee !== '15 h 24') throw new Error('retour calculé à ' + bDeux.arrivee + ' au lieu de 15 h 24');
  if (/15 h 24/.test(t)) throw new Error('l’écran donne l’heure de retour : ' + t.slice(0, 400));
  const j = await jalonsBo();
  if (j.horaire !== 'ok' || j.charge !== 'ok') throw new Error('horaire ou charge en faute : ' + JSON.stringify(j));
  if (j.choix !== 'ko') throw new Error('deux clients à quai sont comptés comme le bon choix');
});

await v('ENT-3.1 : le mode hors connexion donne le quartier, et le suivi garde la trace', async () => {
  // Nouvelle base : on refait le parcours depuis zéro pour éprouver le mode hors connexion et la
  // porte de sortie sans défaire le travail déjà vérifié.
  await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const hote = document.createElement('div');
    hote.id = 'boost31b';
    document.body.appendChild(hote);
    const db = {}; const suivi = [];
    act.rendre(hote, {
      meta: Object.assign({}, act.meta, { id: 'boost-tournee-b' }),
      profil: { prenom: 'Theo', nom: 'Martin', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    window.__bo2 = { db, suivi };
  });
  const z2 = '#boost31b .ent-main';
  await pageBo.click('#boost31b .ent-nav[data-vue="plan"]');
  await pageBo.waitForTimeout(140);
  // Il n'est PAS proposé dans la vue, et il n'y est pas non plus annoncé : un élève bloqué
  // demande à son enseignant, qui sait si les postes de la salle laissent passer les plans
  // en ligne. C'est tout l'objet du déplacement du 03/10.
  if (await pageBo.$$eval(`${z2} [data-plan-secours]`, (e) => e.length)) {
    throw new Error('le mode hors connexion est proposé dans la vue plan');
  }
  const vu = await pageBo.textContent(z2);
  if (/hors connexion/i.test(vu)) throw new Error('la vue annonce le mode hors connexion : ' + vu.slice(0, 200));
  await pageBo.click('#boost31b [data-hors-connexion]');
  await pageBo.waitForTimeout(140);
  // Les menus sont remplis ET verrouillés : le filet donne le quartier, pas la case.
  const zones = await pageBo.$$eval(`${z2} .plan-quartier`, (e) => e.map((x) => x.value + (x.disabled ? '' : '!')));
  if (zones.join('|') !== ['Écusson', 'Jardins de la Fontaine', 'Ville Active', 'Saint-Césaire', 'Croix de Fer', 'Gambetta', 'Costières'].join('|')) {
    throw new Error('les quartiers ne sont pas révélés (ou pas verrouillés) : ' + zones.join('|'));
  }
  // Mais PAS les cases : le filet débloque, il ne donne pas la réponse.
  const cases = await pageBo.$$eval(`${z2} .plan-case`, (e) => e.map((x) => x.value));
  if (cases.some((c) => c !== '')) throw new Error('le filet de sécurité a rempli des cases : ' + cases.join('|'));
  const s = await pageBo.evaluate(() => {
    const s = window.__bo2.suivi; return s.length ? JSON.parse(JSON.stringify(s[s.length - 1])) : null;
  });
  // Le recours au mode hors connexion est horodaté, donc visible dans le suivi, sans compter
  // pour une faute.
  if (s.detail.reperage !== 'attente') throw new Error('jalon repérage : ' + s.detail.reperage);
  const trace = await pageBo.evaluate(() => !!window.__bo2.db.transport['boost-ent31'].plan.secours);
  if (!trace) throw new Error('le recours au mode hors connexion n’est pas enregistré dans la base');
});

await v('ENT-3.1 : la porte de sortie débloque sans valider, et le jalon ne ment pas', async () => {
  const z2 = '#boost31b .ent-main';
  // Trois validations infructueuses : la porte n'apparaît qu'ensuite (essaisAvantIssue: 3).
  for (let essai = 1; essai <= 3; essai++) {
    for (const id of Object.keys(CASES31)) await pageBo.fill(`${z2} .plan-case[data-case="${id}"]`, 'A1');
    const avant = await pageBo.$$eval(`${z2} [data-plan-issue]`, (e) => e.length);
    if (essai < 3 && avant) throw new Error('la porte de sortie est offerte dès l’essai ' + essai);
    await pageBo.click(`${z2} [data-plan-valider]`);
    await pageBo.waitForTimeout(140);
  }
  if (!(await pageBo.$$eval(`${z2} [data-plan-issue]`, (e) => e.length))) {
    throw new Error('la porte de sortie n’apparaît pas après trois essais');
  }
  await pageBo.click(`${z2} [data-plan-issue]`);
  await pageBo.waitForTimeout(160);
  const e = await pageBo.evaluate(() => JSON.parse(JSON.stringify(window.__bo2.db.transport['boost-ent31'].plan)));
  if (e.valide) throw new Error('la porte de sortie a validé le repérage');
  if (!e.force) throw new Error('le recours à la porte de sortie n’est pas enregistré');
  // La suite s'ouvre quand même : personne ne reste coincé sur une case.
  await pageBo.click('#boost31b .ent-nav[data-vue="tournee"]');
  await pageBo.waitForTimeout(160);
  // La tournée s'ouvre — vide, puisque le vélo-cargo part à quai. C'est la liste des commandes
  // à charger qui prouve que l'écran est bien là.
  if (!(await pageBo.$$eval(`${z2} .tour-liste-quai .tour-item`, (e2) => e2.length))) {
    throw new Error('la tournée reste fermée après la porte de sortie');
  }
  const s = await pageBo.evaluate(() => {
    const s2 = window.__bo2.suivi; return JSON.parse(JSON.stringify(s2[s2.length - 1]));
  });
  if (s.detail.reperage !== 'ko') throw new Error('jalon repérage après la porte de sortie : ' + s.detail.reperage);
});

await v('ENT-3.1 : une case tolérée laisse avancer, mais ne donne pas le point', async () => {
  // `toleres: 1` : six cases justes sur sept suffisent pour continuer. Le jalon, lui, exige
  // les sept — c'est la distinction entre « ne pas bloquer un élève » et « valider un acquis ».
  await pageBo.evaluate(async () => {
    const act = await import('/activites/boost-tournee.js');
    const hote = document.createElement('div');
    hote.id = 'boost31c';
    document.body.appendChild(hote);
    const db = {}; const suivi = [];
    act.rendre(hote, {
      meta: Object.assign({}, act.meta, { id: 'boost-tournee-c' }),
      profil: { prenom: 'Ines', nom: 'Roux', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: (r) => suivi.push(r),
      quitter: () => {}, codeStock: 'ABC',
    });
    window.__bo3 = { db, suivi };
  });
  const z3 = '#boost31c .ent-main';
  await pageBo.click('#boost31c .ent-nav[data-vue="plan"]');
  await pageBo.waitForTimeout(140);
  for (const [id, c] of Object.entries(CASES31)) {
    await pageBo.fill(`${z3} .plan-case[data-case="${id}"]`, id === 'c5' ? 'A1' : c);
  }
  await choisirQuartiersBo(z3);
  await pageBo.click(`${z3} [data-plan-valider]`);
  await pageBo.waitForTimeout(160);
  const t = await pageBo.textContent(z3);
  if (!/vous pouvez continuer/.test(t)) throw new Error('la tolérance ne joue pas : ' + t.slice(0, 300));
  if (!/Repérage validé/.test(t)) throw new Error('le repérage n’est pas validé malgré la tolérance');
  const s = await pageBo.evaluate(() => {
    const s2 = window.__bo3.suivi; return JSON.parse(JSON.stringify(s2[s2.length - 1]));
  });
  if (s.detail.reperage !== 'ko') throw new Error('six cases sur sept donnent le point : ' + s.detail.reperage);
});

await v('ENT-3.1 : la charte de Boost habille les deux vues sans une ligne de CSS en plus', async () => {
  const c = await pageBo.evaluate(() => {
    const page = document.querySelector('#boost31 .ent-page');
    const lu = (v) => getComputedStyle(page).getPropertyValue(v).trim().toLowerCase();
    const svg = document.querySelector('#boost31 .ct-svg');
    const hex = (el, attr) => (el ? getComputedStyle(el).fill || el.getAttribute(attr) : '');
    return {
      vert: lu('--vert'), terre: lu('--terre'), fond: lu('--ardoise-fond'), marque: lu('--ent-marque'),
      depart: hex(svg.querySelector('.ct-mk-depart .ct-rond'), 'fill'),
      arrivee: hex(svg.querySelector('.ct-mk-arrivee .ct-rond'), 'fill'),
      point: hex(svg.querySelector('.ct-mk-client .ct-rond'), 'fill'),
    };
  });
  // Les trois valeurs relevées sur le site et le logo de Boost, dans leurs rôles.
  if (c.vert !== '#25c998') throw new Error('--vert (menthe du logo) : ' + c.vert);
  if (c.terre !== '#f0bd3c') throw new Error('--terre (jaune de la charte) : ' + c.terre);
  if (c.fond !== '#345cfd') throw new Error('--ardoise-fond (bleu électrique) : ' + c.fond);
  if (c.marque !== '#25c998') throw new Error('--ent-marque : ' + c.marque);
  // Et les vues les prennent : l'entrepôt en menthe, la gare en jaune, les clients en bleu.
  const rgb = (s) => s.replace(/\s/g, '');
  if (rgb(c.depart) !== 'rgb(37,201,152)') throw new Error('entrepôt : ' + c.depart);
  if (rgb(c.arrivee) !== 'rgb(240,189,60)') throw new Error('gare : ' + c.arrivee);
  if (rgb(c.point) !== 'rgb(52,92,253)') throw new Error('point client : ' + c.point);
});

await v('ENT-3.1 : le logo réel de Boost est servi par le dépôt', async () => {
  const r = await pageBo.evaluate(async () => {
    const img = document.querySelector('#boost31 .ent-logo');
    if (!img) return { absent: true };
    const rep = await fetch(img.src);
    const buf = await rep.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return {
      src: img.getAttribute('src'), ok: rep.ok, octets: buf.byteLength,
      sha: [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''),
    };
  });
  if (r.absent) throw new Error('le bandeau n’affiche pas le logo');
  if (!r.ok) throw new Error('le logo ne se charge pas : ' + r.src);
  // L'empreinte du fichier d'origine, recalculée sur le fichier SERVI. Une image recopiée à la
  // main se serait corrompue sans que la taille le dise — c'est arrivé une fois sur ce projet.
  if (r.octets !== 9861) throw new Error(r.octets + ' octets au lieu de 9 861');
  if (r.sha !== 'b1e5c4ec368a158251bdb989fc56d34f439bf488e3297ad368782339d0aa2388') {
    throw new Error('empreinte du logo : ' + r.sha);
  }
  if (!/^\.\/contenus\/trames\/logos\/boost\.png$/.test(r.src)) throw new Error('chemin du logo : ' + r.src);
});

await v('ENT-3.1 : aucune carte en ligne n’est intégrée, et la séance ne renvoie pas vers Internet', async () => {
  // Depuis la refonte du 03/10/2026, la carte réelle est DANS le dépôt : plus de lien vers un
  // plan en ligne (le point est déjà sur la carte, le zoom donne les noms de rues).
  await ouvrirBo('plan');
  const a = await pageBo.evaluate(() => {
    const z = document.querySelector('#boost31 .ent-main');
    return {
      iframes: z.querySelectorAll('iframe, embed, object').length,
      liens: [...z.querySelectorAll('a[href]')].map((l) => l.getAttribute('href')).filter((h) => /^https?:/.test(h)),
      images: [...z.querySelectorAll('img')].map((i) => i.getAttribute('src')),
      attrib: /contributeurs OpenStreetMap/.test(z.textContent),
    };
  });
  if (a.iframes) throw new Error(a.iframes + ' cadre(s) intégré(s) : aucune carte en ligne ne doit être embarquée');
  if (a.liens.length) throw new Error('lien vers l’extérieur dans la vue : ' + a.liens.join(', '));
  if (a.images.some((s) => /^https?:/.test(s))) throw new Error('image chargée depuis l’extérieur : ' + a.images.join(', '));
  if (!a.attrib) throw new Error('la mention « © contributeurs OpenStreetMap » manque');
});

await v('ENT-3.1 : aucune erreur de console sur tout le parcours', async () => {
  if (erreursBo.length) throw new Error([...new Set(erreursBo)].slice(0, 3).join(' | '));
});

/* ===================================================================================== */
/* ENT-3.2 — Boost, la tournée sous contrainte (entraînement, C2.4)                       */
/*                                                                                        */
/* Ajouté le 02/10/2026 (chantier A). On passe par l'activité réelle                      */
/* (`activites/boost-ent32.js`) et par l'écran : la déclaration de la séance, les chiffres */
/* de la journée (écrits ICI à la main), le mail, la feuille de calcul, les jauges        */
/* muettes, et surtout les huit jalons — dont les deux paliers du trajet le plus court,   */
/* dont l'optimum est recalculé par le contenu et jamais recopié.                         */
/* ===================================================================================== */

const ctx32 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page32 = await ctx32.newPage();
page32.setDefaultTimeout(8000);
if (process.env.LENT) { const cdp = await ctx32.newCDPSession(page32); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.LENT) }); }
const erreurs32 = [];
page32.on('pageerror', (e) => erreurs32.push('PAGEERROR: ' + e.message));
page32.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs32.push('CONSOLE: ' + m.text()); });
await page32.goto('http://127.0.0.1:8099/');
await page32.waitForSelector('#btnProf', { timeout: 8000 });

await page32.evaluate(async () => {
  const act = await import('/activites/boost-ent32.js');
  const hote = document.createElement('div');
  hote.id = 'boost32';
  document.body.appendChild(hote);
  const db = {};
  const suivi = [];
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => suivi.push(r),
    quitter: () => {}, codeStock: 'ABC',
  });
  window.__b32 = { act, db, suivi, hote };
});
const z32 = '#boost32 .ent-main';
const ouvrir32 = async (vue) => { await page32.click(`#boost32 .ent-nav[data-vue="${vue}"]`); await page32.waitForTimeout(140); };
const etat32 = (vue) => page32.evaluate((v) => {
  const t = window.__b32.db.transport && window.__b32.db.transport['boost-ent32'];
  return t ? JSON.parse(JSON.stringify(t[v] || {})) : null;
}, vue);
const texte32 = async (sel) => (await page32.textContent(sel || z32)).replace(/\s+/g, ' ').trim();
const jalons32 = () => page32.evaluate(async () => {
  const S = await import('/contenus/boost-ent32.js');
  const o = {};
  S.ETAPES.forEach((e) => { o[e.id] = e.verifier(window.__b32.db).status; });
  return o;
});
const jalon32 = (id) => page32.evaluate(async (id) => {
  const S = await import('/contenus/boost-ent32.js');
  return S.ETAPES.find((e) => e.id === id).verifier(window.__b32.db);
}, id);
// Le même repère que le bloc `carte` : ni la page ni la carte ne bougent pendant 5 images.
const immobile32 = () => page32.evaluate(() => new Promise((ok) => {
  let y = null, n = 0;
  const f = () => {
    const s = document.querySelector('#boost32 [data-ct-svg]');
    const cle = window.scrollY + '|' + (s ? s.getAttribute('viewBox') : '');
    if (cle === y) n++; else { n = 0; y = cle; }
    if (n >= 5) ok(); else requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}));
// Depuis le chantier F (03/10/2026), la tournée d'ENT-3.2 est en ONGLETS (Données et poids, Tournée,
// Heures) : un geste sur la carte passe d'abord par l'onglet « Tournée », la feuille par les deux autres.
const onglet32 = async (id) => {
  if (await page32.$(`${z32} [data-tour-panneau="${id}"]`)) return;
  await page32.click(`${z32} .tour-onglets [data-tour-onglet="${id}"]`);
  await page32.waitForTimeout(120);
};
const point32 = async (sel) => { await onglet32('tournee'); await immobile32(); await page32.click(`${z32} ${sel}`, { force: true }); };
// La feuille EN COLONNES, comme un tableur : on choisit la cellule, on écrit dans la barre. L'onglet
// « Heures » montre la feuille entière. Les adresses (écrites ici à la main) : B2 à B9 les poids,
// B10 le total, B11 le poids à laisser à quai, B13 le poids laissé à quai, B14 le poids chargé ; F2 à
// F7 les données de la journée, F13 la distance, F14 à F16 le temps et l'arrivée à la gare, F17 à F19
// le client à créneau.
// Les pastilles des trois onglets, dans l'ordre : « à faire » ou « ✓ fait ».
const pastilles32 = () => page32.$$eval(`${z32} [data-onglet-i] [data-etape-etat]`, (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
const taper32 = async (ref, texte) => {
  await onglet32('heures');
  await page32.$eval(`${z32} [data-gr-cel="${ref}"]`, (td) => td.click());
  await page32.fill(`${z32} [data-gr-barre]`, texte);
  await page32.waitForTimeout(30);
};
const SAISIES32 = { F2: '14:35', F3: '14', F4: '5', F5: '190', F6: '16:15', F7: '15:05',
  B2: '18', B3: '12', B4: '34', B5: '16', B6: '52', B7: '31', B8: '29', B9: '38',
  B10: '=SOMME(B2:B9)', B11: '=B10-F5', B13: '=B6', B14: '=B10-B13', F14: '=F13/F3*60', F15: '=7*F4',
  F16: '=F2+F14+F15', F19: '=F2+F17/F3*60+F18*F4' };
// Les quatre nouveaux posés par la base (le repérage au clic est gardé par le bloc `carte`).
const poserNouveaux32 = () => page32.evaluate(() => {
  const d = window.__b32.db;
  d.transport = d.transport || {};
  const t = d.transport['boost-ent32'] = d.transport['boost-ent32'] || {};
  t.plan = { places: { c1: 1, c2: 1, c3: 1, c4: 1 }, essais: {}, valide: Date.now() };
});
// Remet la tournée à zéro, puis la construit au CLIC : départ, clients dans l'ordre, arrivée,
// et les clients à quai se déduisent (le départ part vide).
const construire32 = async (ordre, { depart = true, arrivee = true } = {}) => {
  await page32.evaluate(() => {
    const t = window.__b32.db.transport['boost-ent32'];
    t.tournee = { ordre: [], quai: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], report: {}, juge: {}, depart: null, arrivee: null, valide: null };
  });
  await ouvrir32('plan');
  await ouvrir32('tournee');
  if (depart) await point32('[data-clic-extremite="depart"]');
  for (const id of ordre) await point32(`[data-clic-point="${id}"]`);
  if (arrivee) await point32('[data-clic-extremite="arrivee"]');
  await page32.waitForTimeout(80);
};
// Les valeurs ATTENDUES de la journée, écrites ici à la main (calage de `calibrer.mjs`).
const ORDRE32 = ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2'];   // meilleur qui tient tout : 12,54 km
const COURT32 = ['c4', 'c3', 'c8', 'c1', 'c2', 'c7', 'c6'];   // le plus court : 11,00 km, rate le créneau
const PHASE1_32 = ['reperage', 'donnees', 'choix', 'charge', 'horaire', 'creneau', 'formules', 'trajet10', 'trajet5'];
// La journée du chantier D, lot 2 (jeu A, 03/10/2026) : 14 h 35, 14 km/h, 5 min, 190 kg, train 16 h 15,
// Pâtisserie Arnaud avant 15 h 05 ; l'imprévu : Épicerie Roussel avant 14 h 55.
// L'imprévu (phase 2), écrit à la main d'après l'énumération des 720 ordres : Atelier Ribot (c3)
// annulé, Épicerie Roussel (c8) avant 14 h 55, Pâtisserie Arnaud sans créneau, Cave à quai.
const APRES32 = ['c6', 'c7', 'c8', 'c4', 'c1', 'c2'];          // l'ancienne tournée, Ribot retiré : 12,50 km, Roussel ratée
const OPT2_32 = ['c8', 'c4', 'c1', 'c2', 'c7', 'c6'];          // meilleure qui tient tout : 12,38 km
const LOIN2_32 = ['c8', 'c2', 'c1', 'c4', 'c7', 'c6'];         // tient tout, mais 13,87 km (+12 %)

await v('ENT-3.2 : la séance est un entraînement de C2.4, ouverte aux élèves, sans notation', async () => {
  const r = await page32.evaluate(async () => {
    const { meta } = await import('/activites/boost-ent32.js');
    const { ETAPES } = await import('/contenus/boost-ent32.js');
    const reg = await import('/activites/index.js');
    const liste = reg.ACTIVITES || reg.default || [];
    const m = await Promise.all((Array.isArray(liste) ? liste : []).map((f) => (typeof f === 'function' ? f() : f)));
    return { meta, nb: ETAPES.length, ids: ETAPES.map((e) => e.id),
      inscrite: m.some((x) => x && x.meta && x.meta.id === 'boost-ent32'), registre: Array.isArray(liste) ? liste.length : -1 };
  });
  const m = r.meta;
  if (m.code !== 'ENT-3.2' || m.temps !== 'entrainement' || m.competences.join() !== 'C2.4') throw new Error('déclaration : ' + JSON.stringify(m));
  if (m.pret !== true) throw new Error('pret devrait être true : Tristan a validé la séance le 03/10/2026');
  if ('notation' in m) throw new Error('une séance notée sur 20 ne déclare pas de `notation`');
  if (m.jeuId !== 'boost' || m.reinitialisable) throw new Error('la base de Boost est partagée avec ENT-3.1 : ni jeu à part, ni remise à zéro');
  // Onze jalons depuis le chantier D (lot 2, 03/10/2026) : les neuf de la phase 1 (dont « données »
  // recopiées justes), puis les deux de la phase 2.
  if (r.nb !== 11 || m.bareme !== 11) throw new Error('barème : ' + m.bareme + ' pour ' + r.nb + ' jalons');
  if (r.ids.join() !== 'reperage,donnees,choix,charge,horaire,creneau,formules,trajet10,trajet5,replanif,trajet2') throw new Error('jalons : ' + r.ids.join());
  if (r.registre > 0 && !r.inscrite) throw new Error('la séance n’est pas dans le registre');
});

await v('ENT-3.2 : la journée — huit clients, 230 kg pour 190, seule la Cave Teissier peut rester à quai', async () => {
  const r = await page32.evaluate(async () => {
    const S = await import('/contenus/boost-ent32.js');
    return { n: S.CLIENTS.length, nouveaux: S.NOUVEAUX.map((c) => c.id), total: S.TOTAL, aQuai: S.A_QUAI,
      cren: S.CRENEAU && { id: S.CRENEAU.id, avant: S.CRENEAU.creneau.avant }, j: S.JOURNEE,
      refs: [S.REF_TOTAL, S.REF_ECART], opt: S.optimum(),
      seuls: S.CLIENTS.filter((c) => c.kg >= S.TOTAL - S.JOURNEE.chargeUtile).map((c) => c.id) };
  });
  if (r.n !== 8 || r.nouveaux.join() !== 'c1,c2,c3,c4') throw new Error('clients : ' + JSON.stringify([r.n, r.nouveaux]));
  if (r.total !== 230) throw new Error('total ' + r.total + ' kg au lieu de 230');
  if (r.seuls.join() !== 'c5' || r.aQuai !== 'c5') throw new Error('à quai : ' + r.aQuai + ' (seuls : ' + r.seuls + ')');
  if (!r.cren || r.cren.id !== 'c6' || r.cren.avant !== 905) throw new Error('créneau : ' + JSON.stringify(r.cren));
  if (r.j.depart !== 875 || r.j.limite !== 975 || r.j.chargeUtile !== 190 || r.j.vitesse !== 14 || r.j.service !== 5) throw new Error('journée : ' + JSON.stringify(r.j));
  if (r.refs.join() !== 'B10,B11') throw new Error('cellules du calcul : ' + r.refs);
  // La meilleure tournée qui tient tout, recalculée par le contenu : celle du calage.
  if (r.opt.ordre.join() !== ORDRE32.join()) throw new Error('optimum : ' + r.opt.ordre.join());
  if (Math.abs(r.opt.km - 12.545) > 0.01) throw new Error('optimum : ' + r.opt.km + ' km au lieu de 12,54');
});

await v('ENT-3.2 : les jalons ne reprochent rien avant que l’élève ait commencé', async () => {
  const j = await jalons32();
  const ko = Object.keys(j).filter((k) => j[k] === 'ko');
  if (ko.length) throw new Error('jalon(s) à tort en « ko » : ' + ko.join(', '));
  const faits = Object.keys(j).filter((k) => j[k] === 'ok');
  if (faits.length) throw new Error('jalon(s) validé(s) sans rien avoir fait : ' + faits.join(', '));
  const s = await page32.evaluate(() => { const l = window.__b32.suivi; return l.length ? l[l.length - 1] : null; });
  if (!s) throw new Error('aucun avancement remonté au suivi');
  if (s.max !== 11 || s.score !== 0) throw new Error('suivi : ' + s.score + '/' + s.max);
});

await v('ENT-3.2 : le mail du responsable porte la fiche des huit commandes et le créneau, sans la réponse', async () => {
  await ouvrir32('mail');
  if (!/Tournée vélo-cargo de cet après-midi/.test(await texte32())) throw new Error('le mail de la séance n’est pas semé');
  const t = await page32.evaluate(() => {
    const l = window.__b32.db.mails.filter((x) => /cet après-midi/.test(x.subject));
    return l.length === 1 ? l[0].text.replace(/\s+/g, ' ') : 'EXEMPLAIRES:' + l.length;
  });
  if (/^EXEMPLAIRES/.test(t)) throw new Error('mail semé ' + t);
  for (const nom of ['Torréfaction Guiraud', 'Mercerie Pellet', 'Atelier Ribot', 'Herboristerie Mazel', 'Cave Teissier',
    'Pâtisserie Arnaud', 'Papeterie Bonnet', 'Épicerie Roussel']) {
    if (!t.includes(nom)) throw new Error('la fiche ne porte pas ' + nom);
  }
  if (!/avant 15 h 05/.test(t)) throw new Error('le créneau n’est pas dans le mail');
  if ((t.match(/nouveau client/g) || []).length !== 4) throw new Error('les quatre nouveaux clients ne sont pas signalés');
  // Toutes les données du bloc A sont dans le mail, exactes (fini « une douzaine de km/h »).
  for (const x of ['14 h 35', '16 h 15', '14 km/h', '5 minutes par arrêt', '190 kg']) if (!t.includes(x)) throw new Error('le mail ne donne pas « ' + x + ' »');
  if (/douzaine/.test(t)) throw new Error('la vitesse est approximative');
  const objet = await page32.evaluate(() => window.__b32.db.mails.find((x) => /cet après-midi/.test(x.subject)).subject);
  if (!/14 h 35/.test(objet)) throw new Error('l’objet ne donne pas le départ du jour : ' + objet);
  // Le mail ne fait pas le travail de la feuille : ni le total, ni ce qu'il faut écarter.
  if (/\b230\b/.test(t) || /\b40 kg\b/.test(t)) throw new Error('le mail donne le total ou la masse à écarter');
});

// L'imprévu (03/10/2026) : il ne doit RIEN y avoir à l'ouverture — ni message, ni phase.
const imprevu32 = () => page32.evaluate(() => {
  const d = window.__b32.db;
  const t = d.transport && d.transport['boost-ent32'] && d.transport['boost-ent32'].tournee;
  return { mails: d.mails.filter((m) => m.declenche).map((m) => ({ id: m.id, subject: m.subject, read: m.read, declenche: m.declenche })),
    marque: !!(d.volets && d.volets['boost-ent32#imprevu']), phase: t && t.phase ? t.phase.n : 1 };
});
await v('ENT-3.2 : à l’ouverture, aucun message d’imprévu et la journée est celle de la phase 1', async () => {
  const r = await imprevu32();
  if (r.mails.length || r.marque || r.phase !== 1) throw new Error('imprévu déjà là : ' + JSON.stringify(r));
  const n = await page32.evaluate(() => window.__b32.db.mails.filter((m) => /Changement pour la tournée/.test(m.subject)).length);
  if (n) throw new Error('le message de l’imprévu est semé à l’ouverture');
});

await v('ENT-3.2 : la tournée est fermée tant que les quatre nouveaux ne sont pas situés', async () => {
  await ouvrir32('tournee');
  if (await page32.$(`${z32} [data-clic-point]`)) throw new Error('la tournée est ouverte avant le repérage');
  const j = await jalon32('reperage');
  if (j.status !== 'na') throw new Error('repérage : ' + j.status);
});

await v('ENT-3.2 : la bonne tournée se construit à la carte — jalons sur les trajets, créneau tenu', async () => {
  await poserNouveaux32();
  await construire32(ORDRE32);
  const t = await etat32('tournee');
  if (t.ordre.join() !== ORDRE32.join()) throw new Error('ordre construit : ' + t.ordre.join());
  if (t.quai.join() !== 'c5') throw new Error('à quai : ' + t.quai.join());
  const j = await jalons32();
  for (const k of ['reperage', 'charge', 'horaire', 'creneau', 'trajet10', 'trajet5']) {
    if (j[k] !== 'ok') throw new Error(k + ' : ' + j[k] + ' — ' + JSON.stringify(j));
  }
  // La feuille n'est pas encore faite : « choix » et « formules » ne sont pas validés.
  if (j.choix === 'ok' || j.formules === 'ok') throw new Error('choix/formules validés sans calcul : ' + JSON.stringify(j));
  // Onglets (chantier F) : seule la tournée est faite.
  if (await pastilles32() !== 'à faire | ✓ fait | à faire') throw new Error('pastilles : ' + await pastilles32());
});

await v('ENT-3.2 : une tournée qui tient tout ne suffit pas — sans la feuille vérifiée juste, pas d’imprévu', async () => {
  const r = await imprevu32();
  if (r.mails.length || r.marque || r.phase !== 1) throw new Error('l’imprévu est arrivé avant la feuille : ' + JSON.stringify(r));
  if (await page32.$(`${z32} [data-tour-notif]`)) throw new Error('la notification est affichée');
});

await v('ENT-3.2 : les jauges sont muettes — la limite, jamais le total ni l’heure d’arrivée', async () => {
  await onglet32('heures');      // les jauges sont à droite de la feuille, dans l'onglet « Heures »
  // Le texte TEL QU'AFFICHÉ (cellules séparées) : collé, le n° de ligne 17 et « 8 · Épicerie… » font « 178 ».
  const t = (await page32.evaluate(() => document.querySelector('#boost32 .ent-main').innerText)).replace(/\s+/g, ' ');
  // 178 kg chargés, arrivée à la gare à 16 h 04, chez la pâtisserie à 14 h 55 : rien de tout ça ne s'écrit.
  const i178 = t.search(/\b178\b/);
  if (i178 >= 0) throw new Error('la jauge donne le poids chargé : « ' + t.slice(Math.max(0, i178 - 120), i178 + 20) + ' »');
  if (/16 h 04/.test(t)) throw new Error('la jauge donne l’heure d’arrivée à la gare');
  const cr = await texte32(`${z32} [data-creneau="c6"]`);
  if (!/15 h 05/.test(cr)) throw new Error('la limite du créneau n’est pas lisible : ' + cr);
  if (/ \/ /.test(cr) || /Arrivée prévue/.test(cr)) throw new Error('la jauge de créneau donne l’heure d’arrivée : ' + cr);
  if (!/190/.test(t)) throw new Error('la limite de 190 kg n’est pas lisible');
  if (/raté de|retard de/.test(t)) throw new Error('un retard chiffré est affiché');
});

// Réécrit le 03/10/2026 (chantier F) : la feuille en trois blocs de 38 lignes devient UN SEUL TABLEAU
// des commandes (choix de Tristan), en colonnes, en deux parties pour les onglets.
await v('ENT-3.2 : la feuille en colonnes — un seul tableau des commandes, « Arrêt n° » rempli, deux parties ; la formule est exigée', async () => {
  await ouvrir32('tournee');
  await onglet32('heures');
  const lignes = await page32.$$eval(`${z32} .gr-table tbody tr`, (tr) => tr.map((r) => [...r.children].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  const txt = lignes.map((l) => l.join(' ')).join(' | ');
  for (const x of ['Données de la journée', 'Commandes du jour', 'Arrêt n°', 'Poids total (kg)', 'Poids à laisser à quai',
    'Après la tournée', 'Poids laissé à quai', 'Poids chargé', 'Temps de route (min)', 'Heure d’arrivée chez Pâtisserie Arnaud']) {
    if (!txt.includes(x)) throw new Error('la feuille ne porte pas « ' + x + ' » : ' + txt.slice(0, 300));
  }
  if (lignes.length !== 19) throw new Error(lignes.length + ' lignes au lieu de 19');
  // Plus de second bloc qui répète les poids, plus d'étapes numérotées.
  if (/Tournée \(ordre des arrêts|Étape \d|Temps de route \(heures\)/.test(txt)) throw new Error('ancien bloc ou étape guidée : ' + txt.slice(0, 200));
  // « Arrêt n° » suit la tournée cliquée (Pâtisserie Arnaud en premier) ; la Cave, à quai, n'a pas de numéro.
  const arret = (i) => lignes[i][3];
  if (arret(6) !== '1' || arret(5) !== '' || arret(1) !== '6') throw new Error('Arrêt n° : ' + lignes.slice(1, 9).map((l) => l[1] + '=' + l[3]).join(' ; '));
  // L'onglet « Données et poids » ne montre que le haut : onze lignes.
  await onglet32('donnees');
  const haut = await page32.$$eval(`${z32} .gr-table tbody tr`, (tr) => tr.length);
  if (haut !== 11) throw new Error('onglet « Données et poids » : ' + haut + ' lignes');
  if (await page32.$(`${z32} [data-gr-verifier]`)) throw new Error('« Vérifier » dans l’onglet du haut');
  // Un nombre tapé à la main est refusé, même juste ; un total sans poids tapés n'est pas « juste ».
  await taper32('B11', '40');
  await taper32('B10', '=SOMME(B2:B9)');
  await page32.click(`${z32} [data-gr-verifier]`);
  await page32.waitForTimeout(200);
  const g = (await etat32('tournee')).grille;
  if (g.juge.B10 !== 'attente') throw new Error('total sans poids tapés : ' + g.juge.B10);
  if (g.juge.B11 !== 'pasFormule') throw new Error('B11 tapé à la main devrait être « pasFormule » : ' + g.juge.B11);
  const j = await jalon32('choix');
  if (j.status === 'ok') throw new Error('« choix » validé avec un nombre tapé à la main');
});

// Réécrit le 03/10/2026 (chantier F) : le « ? » d'une ligne devient « ? Aide » sous la barre de formule.
await v('ENT-3.2 : « ? Aide » — le format seul sur les heures à taper, la méthode sur les formules, plié jusqu’au clic', async () => {
  await onglet32('heures');
  const aides = await page32.evaluate(async (z) => {
    const o = {};
    for (const td of document.querySelectorAll(`${z} td.gr-saisie`)) {
      td.click();
      const b = document.querySelector(`${z} [data-gr-aide-barre]`);
      if (!b) continue;
      const t = b.nextElementSibling;
      o[td.dataset.ref] = { plie: t.hidden, texte: t.textContent };
    }
    return o;
  }, z32);
  const refs = Object.keys(aides).sort().join();
  if (refs !== 'B10,B11,B13,B14,F14,F15,F16,F19,F2,F6,F7') throw new Error('« ? Aide » sur ' + refs);
  if (Object.values(aides).some((a) => !a.plie)) throw new Error('une aide est dépliée sans clic');
  for (const r of ['F2', 'F6', 'F7']) {
    const t = aides[r].texte;
    if (!t.includes('9:05') || /14:35|16:15|15:05|14 h 35|16 h 15|15 h 05/.test(t)) throw new Error(`${r} : ${t}`);
  }
  if (!aides.B10.texte.includes('SOMME')) throw new Error('pas d’aide de méthode sur le total');
  await page32.$eval(`${z32} [data-gr-cel="B10"]`, (td) => td.click());
  await page32.click(`${z32} [data-gr-aide-barre]`);
  if (!(await page32.isVisible(`${z32} .gr-info-aide`))) throw new Error('« ? Aide » ne déplie pas l’aide');
});

// Une erreur de lecture ne se paie qu'une fois (règle validée par Tristan le 03/10) : une donnée
// mal recopiée fait tomber « données », pas « formules », et ne bloque pas l'imprévu.
await v('ENT-3.2 : un poids mal recopié — « données » ko, « formules » ok, et l’imprévu peut arriver', async () => {
  const r = await page32.evaluate(async () => {
    const S = await import('/contenus/boost-ent32.js');
    const juge = {};
    [...S.REFS_DONNEES, ...S.REFS_FORMULES].forEach((k) => { juge[k] = 'ok'; });
    juge.B4 = 'valeur';                                      // l'Atelier Ribot mal recopié
    const db = { transport: { 'boost-ent32': { plan: { valide: 1 }, tournee: { ordre: ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2'],
      quai: ['c5'], depart: 1, arrivee: 1, report: {}, juge: {}, grille: { cases: {}, juge, valide: null } } } } };
    const st = (id) => S.ETAPES.find((e) => e.id === id).verifier(db).status;
    const r0 = { donnees: st('donnees'), formules: st('formules'), declenche: S.VOLET.declencheurs[0].quand(db) };
    juge.B14 = 'valeur';                                     // une formule fausse, elle, bloque
    // La feuille d'ENT-3.2 elle-même : Ribot tapé 43 au lieu de 34, tout le reste juste.
    const { creerGrille } = await import('/core/types/grille.js');
    const { creerTournee } = await import('/core/types/tournee.js');
    const vue = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE));
    const L = S.TOURNEE.grille.lignes(vue.bilan(db.transport['boost-ent32'].tournee));
    const cases = { F2: '14:35', F3: '14', F4: '5', F5: '190', F6: '16:15', F7: '15:05',
      B2: '18', B3: '12', B4: '43', B5: '16', B6: '52', B7: '31', B8: '29', B9: '38',
      B10: '=SOMME(B2:B9)', B11: '=B10-F5', B13: '=B6', B14: '=B10-B13', F14: '=F13/F3*60', F15: '=7*F4',
      F16: '=F2+F14+F15', F19: '=F2+F17/F3*60+F18*F4' };
    const jg = creerGrille(S.TOURNEE.grille).juger(L, cases);
    return Object.assign(r0, { bloque: S.VOLET.declencheurs[0].quand(db), formules2: st('formules'),
      feuille: Object.keys(jg).filter((k) => jg[k] !== 'ok').join() });
  });
  if (r.feuille !== 'B4') throw new Error('feuille d’ENT-3.2, Ribot mal recopié : cases non justes ' + r.feuille);
  if (r.donnees !== 'ko' || r.formules !== 'ok') throw new Error('jalons : ' + JSON.stringify(r));
  if (!r.declenche) throw new Error('un poids mal recopié bloque l’imprévu');
  if (r.bloque || r.formules2 !== 'ko') throw new Error('une formule fausse laisse passer : ' + JSON.stringify(r));
});

await v('ENT-3.2 : données et formules justes valident « données », « choix » et « formules » — les 9 jalons de la phase 1', async () => {
  for (const [ref, f] of Object.entries(SAISIES32)) await taper32(ref, f);
  // Les résultats, écrits à la main : 230 kg, 40 à écarter, 178 chargés, gare à 16 h 04, Pâtisserie à
  // 14 h 56 (et non 14 h 55 : la feuille part de la distance arrondie au dixième, comme l'élève la lit).
  const res = async (ref) => (await page32.textContent(`${z32} [data-gr-res="${ref}"]`)).trim();
  const vus = [await res('B10'), await res('B11'), await res('B14'), await res('F16'), await res('F19')].join(' | ');
  if (vus !== '230 | 40 | 178 | 16 h 04 | 14 h 56') throw new Error('résultats : ' + vus);
  await page32.click(`${z32} [data-gr-verifier]`);
  await page32.waitForTimeout(250);
  const g = (await etat32('tournee')).grille;
  const pas = Object.keys(g.juge).filter((k) => g.juge[k] !== 'ok');
  if (pas.length) throw new Error('cellules non justes : ' + pas.map((k) => k + '=' + g.juge[k]).join(', '));
  const j = await jalons32();
  const nonOk = PHASE1_32.filter((k) => j[k] !== 'ok');
  if (nonOk.length) throw new Error('jalon(s) non validé(s) : ' + nonOk.join(', ') + ' — ' + JSON.stringify(j));
  // La phase 1 est finie : l'imprévu vient d'arriver, et rien n'est encore replanifié.
  const s = await page32.evaluate(() => { const l = window.__b32.suivi; return l[l.length - 1]; });
  if (s.score !== 9 || s.max !== 11) throw new Error('suivi : ' + s.score + '/' + s.max);
});

/* ---- ENT-3.2 : l'imprévu (phase 2). La phase 1 vient d'être finie au test précédent ---- */

// Reconstruit la tournée au clic EN PHASE 2 : la phase et la feuille sont gardées.
const construire32p2 = async (ordre) => {
  await page32.evaluate(() => {
    const t = window.__b32.db.transport['boost-ent32'].tournee;
    t.ordre = []; t.quai = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7', 'c8']; t.depart = null; t.arrivee = null;
    t.juge = {}; t.valide = null;
  });
  await ouvrir32('plan');
  await ouvrir32('tournee');
  await point32('[data-clic-extremite="depart"]');
  for (const id of ordre) await point32(`[data-clic-point="${id}"]`);
  await point32('[data-clic-extremite="arrivee"]');
  await page32.waitForTimeout(80);
};

await v('ENT-3.2 : tournée juste + feuille juste — le message arrive, une seule fois, et la journée passe en phase 2', async () => {
  const r = await imprevu32();
  if (r.mails.length !== 1 || !r.marque || r.phase !== 2) throw new Error('imprévu : ' + JSON.stringify(r));
  if (!/Changement pour la tournée/.test(r.mails[0].subject) || r.mails[0].read) throw new Error('message : ' + JSON.stringify(r.mails[0]));
  const t = await etat32('tournee');
  if (t.ordre.join() !== APRES32.join() || t.quai.join() !== 'c5') throw new Error('tournée après le message : ' + t.ordre.join() + ' / ' + t.quai.join());
  if (t.phase.avant.ordre.join() !== ORDRE32.join()) throw new Error('la tournée de la phase 1 n’est pas gardée : ' + JSON.stringify(t.phase.avant));
  // Changer d'écran ne renvoie rien (la feuille revérifiée non plus : voir le test de la feuille).
  await ouvrir32('mail'); await ouvrir32('tournee');
  const r2 = await imprevu32();
  if (r2.mails.length !== 1) throw new Error('message envoyé ' + r2.mails.length + ' fois');
  // Onglets (chantier F) : la journée a changé, les trois pastilles repassent à « à faire » et
  // l'onglet « Données et poids » s'ouvre.
  if (await pastilles32() !== 'à faire | à faire | à faire') throw new Error('pastilles après l’imprévu : ' + await pastilles32());
  if (!(await page32.$(`${z32} [data-tour-panneau="donnees"]`))) throw new Error('l’onglet ouvert après l’imprévu n’est pas « Données et poids »');
});

await v('ENT-3.2 : le message dit ce qui change en texte courant — annulation, nouveau créneau, créneau levé, Cave à quai, 14 h 00', async () => {
  const t = await page32.evaluate(() => window.__b32.db.mails.find((m) => m.declenche).text.replace(/\s+/g, ' '));
  for (const x of ['Il est 14 h 00', 'Atelier Ribot', 'annuler', 'Épicerie Roussel', 'avant 14 h 55', 'Pâtisserie Arnaud', 'Cave Teissier reste à quai', '16 h 15']) {
    if (!t.includes(x)) throw new Error('le message ne dit pas « ' + x + ' » : ' + t);
  }
  // Il ne fait pas le travail : ni la nouvelle tournée, ni « elle ne tient plus », ni un chiffre de calcul.
  if (/ne tient plus|\b196\b|\b144\b|\b6 kg\b|Torréfaction/.test(t)) throw new Error('le message donne la réponse : ' + t);
});

await v('ENT-3.2 : « Nouveau message » en tête de la tournée ; « Lire le message » l’ouvre et éteint la notification', async () => {
  const n = await texte32(`${z32} [data-tour-notif]`);
  if (!/Nouveau message/.test(n) || !/Changement pour la tournée/.test(n)) throw new Error('notification : ' + n);
  await page32.click(`${z32} [data-tour-notif-ouvrir]`);
  await page32.waitForTimeout(150);
  if (!/Il est 14 h 00/.test(await texte32())) throw new Error('le message ne s’est pas ouvert');
  if (!(await imprevu32()).mails[0].read) throw new Error('le message n’est pas marqué lu');
  await ouvrir32('tournee');
  if (await page32.$(`${z32} [data-tour-notif]`)) throw new Error('la notification reste après lecture');
});

await v('ENT-3.2 : après l’imprévu — Atelier Ribot barré et non chargeable ; créneau de l’Épicerie repéré, Pâtisserie sans créneau', async () => {
  await onglet32('tournee');
  if (!(await page32.$(`${z32} [data-annule="c3"]`))) throw new Error('Atelier Ribot n’est pas barré dans le récapitulatif');
  if (!(await page32.$(`${z32} [data-point="c3"][data-annule]`))) throw new Error('Atelier Ribot n’est pas barré sur la carte');
  if (await page32.$(`${z32} [data-clic-point="c3"]`)) throw new Error('Atelier Ribot est encore cliquable sur la carte');
  if (await page32.$(`${z32} [data-reprendre="c3"]`)) throw new Error('Atelier Ribot a encore un bouton « charger »');
  // Même un clic forcé sur son rond ne le charge pas.
  await point32('[data-point="c3"]');
  const t = await etat32('tournee');
  if (t.ordre.includes('c3') || t.quai.includes('c3')) throw new Error('Atelier Ribot a été chargé : ' + JSON.stringify([t.ordre, t.quai]));
  const ch = await page32.$$eval(`${z32} [data-creneau-change]`, (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  if (!ch.some((x) => /14 h 55/.test(x) && /nouveau/.test(x))) throw new Error('le nouveau créneau n’est pas repéré : ' + ch.join(' | '));
  if (!ch.some((x) => /plus de créneau/.test(x))) throw new Error('le créneau levé n’est pas repéré : ' + ch.join(' | '));
  await onglet32('heures');      // les jauges, à droite de la feuille
  if (!(await page32.$(`${z32} [data-creneau="c8"]`)) || await page32.$(`${z32} [data-creneau="c6"]`)) throw new Error('la jauge de créneau n’a pas changé de client');
  if (!/14 h 55/.test(await texte32(`${z32} [data-creneau="c8"]`))) throw new Error('la limite de 14 h 55 n’est pas lisible');
});

await v('ENT-3.2 : après l’imprévu, rien à l’écran ne dit que l’ancienne tournée ne tient plus', async () => {
  // Elle ne tient plus (l'Épicerie est ratée)…
  const b = await page32.evaluate(async () => {
    const S = await import('/contenus/boost-ent32.js');
    const { creerTournee } = await import('/core/types/tournee.js');
    const vue = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE_IMPREVU));
    const x = vue.bilan(window.__b32.db.transport['boost-ent32'].tournee);
    return { rate: x.creneauRate, ids: x.creneauxRates, charge: x.cumuls.charge };
  });
  if (!b.rate || b.ids.join() !== 'c8' || b.charge !== 144) throw new Error('cas mal posé : ' + JSON.stringify(b));
  // … et l'écran se tait : ni pastille, ni jauge rouge, ni avertissement de la feuille.
  // Dans CHACUN des trois onglets.
  const verdict = /raté|manqué|dépassée|respectée|tenu\b|retard/i;
  for (const o of ['donnees', 'tournee', 'heures']) {
    await onglet32(o);
    const t = await texte32();
    if (verdict.test(t)) throw new Error(`onglet ${o} : un verdict est lisible : ` + (t.match(verdict) || [])[0]);
    const n = await page32.evaluate(() => document.querySelectorAll('#boost32 .tour-jauge.trop, #boost32 .avis-contrainte, #boost32 .tour-jauges .pastille').length);
    if (n) throw new Error(`onglet ${o} : ` + n + ' marque(s) de verdict à l’écran');
  }
  // La feuille vérifiée ne l'est plus : les données ont changé sous les formules.
  const g = (await etat32('tournee')).grille;
  if (g.valide) throw new Error('la feuille est encore « vérifiée » après l’imprévu');
});

await v('ENT-3.2 : la tournée laissée telle quelle — les deux jalons de phase 2 ko ; les 9 de la phase 1 restent acquis', async () => {
  const j = await jalons32();
  if (j.replanif !== 'ko' || j.trajet2 !== 'ko') throw new Error('l’inaction rapporte : ' + JSON.stringify(j));
  const p1 = PHASE1_32.filter((k) => j[k] !== 'ok');
  if (p1.length) throw new Error('la phase 1 a perdu : ' + p1.join(', '));
  const d = await jalon32('replanif');
  if (!/pas été replanifiée/.test(d.detail)) throw new Error('détail : ' + d.detail);
});

await v('ENT-3.2 : la feuille suit la phase 2 — Ribot à 0 kg, total 196, à écarter 6, créneau de l’Épicerie à retaper', async () => {
  await onglet32('heures');
  const txt = (await page32.$$eval(`${z32} .gr-table tr`, (tr) => tr.map((r) => r.textContent.replace(/\s+/g, ' ').trim()))).join(' | ');
  if (!/Atelier Ribot — annulée/.test(txt)) throw new Error('la ligne d’Atelier Ribot ne dit pas l’annulation');
  if (!/Heure d’arrivée chez Épicerie Roussel/.test(txt) || /chez Pâtisserie Arnaud/.test(txt)) throw new Error('la ligne du créneau n’a pas changé de client');
  if (!/Limite du créneau \(Épicerie Roussel\)/.test(txt)) throw new Error('la donnée du créneau n’a pas changé de client');
  // Les formules de la phase 1 sont gardées : on revérifie, elles valent sur les nouvelles données ;
  // la limite du créneau, elle, est à retaper (15:05 était celle de la Pâtisserie).
  await page32.click(`${z32} [data-gr-verifier]`);
  await page32.waitForTimeout(200);
  const g = (await etat32('tournee')).grille;
  for (const k of ['B10', 'B11']) if (g.juge[k] !== 'ok') throw new Error(k + ' : ' + g.juge[k]);
  if (g.juge.F7 !== 'valeur') throw new Error('l’ancienne limite de créneau est jugée : ' + g.juge.F7);
  if ('B4' in g.juge) throw new Error('le poids de la commande annulée se tape encore');
  if ((await imprevu32()).mails.length !== 1) throw new Error('la feuille revérifiée a renvoyé le message');
  const res = async (ref) => (await page32.textContent(`${z32} [data-gr-res="${ref}"]`)).trim();
  if (await res('B10') !== '196' || await res('B11') !== '6') throw new Error('total / écart : ' + await res('B10') + ' / ' + await res('B11'));
  await taper32('F7', '14:55');
  // La limite retapée depuis le message : l'onglet « Données et poids » est fait à nouveau.
  if (!(await pastilles32()).startsWith('✓ fait')) throw new Error('pastilles après la limite retapée : ' + await pastilles32());
});

await v('ENT-3.2 : la bonne replanification gagne les deux jalons de phase 2 ; une qui tient à +12 % ne gagne que le premier', async () => {
  await construire32p2(OPT2_32);
  let j = await jalons32();
  if (j.replanif !== 'ok' || j.trajet2 !== 'ok') throw new Error('bonne replanification : ' + JSON.stringify(j));
  const s = await page32.evaluate(() => { const l = window.__b32.suivi; return l[l.length - 1]; });
  if (s.score !== 11 || s.max !== 11) throw new Error('suivi : ' + s.score + '/' + s.max);
  await construire32p2(LOIN2_32);
  j = await jalons32();
  if (j.replanif !== 'ok' || j.trajet2 !== 'ko') throw new Error('à +12 % : ' + JSON.stringify(j));
  // L'ancien ordre, reconstruit à la main : il rate l'Épicerie, il ne vaut rien.
  await construire32p2(APRES32);
  j = await jalons32();
  if (j.replanif !== 'ko' || j.trajet2 !== 'ko') throw new Error('ancien ordre : ' + JSON.stringify(j));
  // La phase 1 n'a pas bougé pendant tout ça.
  if (PHASE1_32.some((k) => j[k] !== 'ok')) throw new Error('la phase 1 a bougé : ' + JSON.stringify(j));
});

await v('ENT-3.2 : l’optimum de la phase 2 est recalculé par le contenu (720 ordres), et ce n’est pas l’ancien', async () => {
  const o = await page32.evaluate(async () => (await import('/contenus/boost-ent32.js')).optimumImprevu());
  if (o.ordre.join() !== OPT2_32.join()) throw new Error('optimum : ' + o.ordre.join());
  if (Math.abs(o.km - 12.38) > 0.01) throw new Error('optimum : ' + o.km + ' km au lieu de 12,38');
  if (o.ordre.join() === APRES32.join()) throw new Error('la meilleure tournée est l’ancienne');
});

await v('ENT-3.2 : « Recommencer » remet la tournée de l’arrivée du message, pas une tournée vide', async () => {
  await construire32p2(OPT2_32);
  const sel = `${z32} [data-tour-raz]`;
  await page32.click(sel); await page32.waitForTimeout(80);
  if (!/arrivée du message/.test(await page32.textContent(sel))) throw new Error('le bouton armé ne dit pas ce qu’il remet');
  await page32.click(sel); await page32.waitForTimeout(120);
  const t = await etat32('tournee');
  if (t.ordre.join() !== APRES32.join() || t.quai.join() !== 'c5' || !t.depart || !t.arrivee) throw new Error('remise : ' + JSON.stringify([t.ordre, t.quai, t.depart, t.arrivee]));
  if (!(await page32.$eval(sel, (b) => b.disabled))) throw new Error('le bouton devrait être grisé sur la tournée de départ de la phase');
  if (!t.phase || t.phase.n !== 2) throw new Error('la remise a fait sortir de la phase 2');
});

await v('ENT-3.2 : remontage et reconnexion — l’imprévu n’est ni rejoué, ni perdu', async () => {
  const r = await page32.evaluate(async () => {
    const act = await import('/activites/boost-ent32.js');
    const avant = JSON.stringify(window.__b32.db.transport['boost-ent32'].tournee);
    const essai = (db) => {
      const hote = document.createElement('div'); document.body.appendChild(hote);
      act.rendre(hote, { meta: act.meta, profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
        jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC' });
      hote.remove();
      return { n: db.mails.filter((m) => m.declenche).length, tournee: JSON.stringify(db.transport['boost-ent32'].tournee) };
    };
    const remonte = essai(window.__b32.db);                                    // même base
    const reco = essai(JSON.parse(JSON.stringify(window.__b32.db)));          // base relue
    return { avant, remonte, reco };
  });
  for (const [nom, x] of [['remontage', r.remonte], ['reconnexion', r.reco]]) {
    if (x.n !== 1) throw new Error(nom + ' : ' + x.n + ' message(s) d’imprévu');
    if (x.tournee !== r.avant) throw new Error(nom + ' : la tournée a changé');
  }
});

await v('Moteur entreprise : un message déclenché part UNE fois, même si sa condition reste vraie (remontage, reconnexion)', async () => {
  const r = await page32.evaluate(async () => {
    const [{ creerEntreprise }, B] = await Promise.all([import('/core/types/entreprise.js'), import('/contenus/boost.js')]);
    // Une condition toujours vraie : seule la marque du moteur empêche de rejouer le message.
    const volet = { id: 'essai', semer: () => ({}),
      declencheurs: [{ id: 'toujours', quand: () => true, semer: () => ({ mails: [{ folder: 'in', ts: 1, from: 'Essai', subject: 'Déclenché', text: '…' }] }) }] };
    const moteur = creerEntreprise({ ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
      SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME, etapes: [], volet });
    const meta = { id: 'essai-declencheur', portee: 'eleve' };
    const monter = (db) => {
      const hote = document.createElement('div'); document.body.appendChild(hote);
      moteur.rendre(hote, { meta, profil: { prenom: 'Lea', role: 'eleve' }, jeu: { etat: () => db, sauver: () => {} },
        enregistrer: () => {}, quitter: () => {} });
      hote.remove();
      return db.mails.filter((m) => m.subject === 'Déclenché').length;
    };
    const db = {};
    const n1 = monter(db), n2 = monter(db);
    const n3 = monter(JSON.parse(JSON.stringify(db)));
    return [n1, n2, n3];
  });
  if (r.join() !== '1,1,1') throw new Error('messages après ouverture, remontage, reconnexion : ' + r.join());
});

await v('ENT-3.2 : le calage de l’imprévu tient — aucune des 264 tournées justes ne tient encore, 120 sur 720 tiennent', async () => {
  const { execFileSync } = await import('node:child_process');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  let sortie;
  try { sortie = execFileSync(process.execPath, [path.join(racine, 'outils', 'carte', 'calibrer.mjs')], { stdio: 'pipe' }).toString(); }
  catch (e) { throw new Error(String(e.stderr || e.message).trim().split('\n').slice(-3).join(' ')); }
  if (!/qui tiennent encore : 0 sur 264/.test(sortie)) throw new Error('ancienne tournée : ' + sortie);
  if (!/720 ordres de passage : 120 tiennent tout/.test(sortie)) throw new Error('phase 2 : ' + sortie);
  if (!/meilleur qui tient tout : c8 c4 c1 c2 c7 c6/.test(sortie)) throw new Error('meilleure tournée : ' + sortie);
});

// Réécrit le 03/10/2026 (chantier E) : ENT-3.3 a désormais deux phases — ses deux temps —, mais ni
// commande annulée ni créneau changé : l'imprévu reste à ENT-3.2.
await v('ENT-3.2 : l’imprévu n’existe que dans ENT-3.2 — les deux temps d’ENT-3.3 n’annulent rien et ne changent aucun créneau', async () => {
  const r = await page32.evaluate(async () => {
    const [a, b] = await Promise.all([import('/contenus/boost-ent33.js'), import('/contenus/boost-ent32.js')]);
    const ph = a.TOURNEE.phases || {};
    return { cles33: Object.keys(ph).join(), imprevu33: Object.values(ph).some((x) => x.annules || x.creneaux),
      decl33: (a.VOLET.declencheurs || []).map((d) => d.id + ':' + d.phaseTournee).join(),
      phases32: 'phases' in b.TOURNEE, imp: !!b.TOURNEE_IMPREVU.phases };
  });
  if (r.cles33 !== '1,2' || r.imprevu33 || r.decl33 !== 'deverrouille:2') throw new Error('ENT-3.3 : ' + JSON.stringify(r));
  if (r.phases32 || !r.imp) throw new Error('ENT-3.2 : ' + JSON.stringify(r));
});

await v('ENT-3.2 : le trajet le plus court rate le créneau — les deux paliers de distance tombent, les autres non', async () => {
  await construire32(COURT32);
  const j = await jalons32();
  if (j.creneau !== 'ko') throw new Error('créneau : ' + j.creneau);
  if (j.trajet10 !== 'ko' || j.trajet5 !== 'ko') throw new Error('un trajet qui rate le créneau ne vaut pas les paliers : ' + JSON.stringify(j));
  if (j.horaire !== 'ok' || j.charge !== 'ok') throw new Error('train et charge devraient tenir : ' + JSON.stringify(j));
  const d = await jalon32('creneau');
  if (!/Pâtisserie Arnaud/.test(d.detail)) throw new Error('le détail ne nomme pas le client : ' + d.detail);
  // La pastille de la jauge muette dit QUE le créneau est raté (onglet « Heures », à droite de la feuille).
  await onglet32('heures');
  const cr = await texte32(`${z32} [data-creneau="c6"]`);
  if (!/Créneau raté/.test(cr)) throw new Error('la jauge ne signale pas le créneau raté : ' + cr);
});

await v('ENT-3.2 : les paliers — à 10 % oui, à 5 % non, au-delà aucun ; recalculés sur les 5 040 ordres', async () => {
  const r = await page32.evaluate(async () => {
    const S = await import('/contenus/boost-ent32.js');
    const C = (await import('/contenus/boost-ent32-carte.js')).CARTE;
    const J = S.JOURNEE;
    const d = (a, b) => C.trajets[`${a}|${b}`].m;
    const ids = S.CLIENTS.filter((c) => c.id !== 'c5').map((c) => c.id);
    function* perms(a) { if (a.length < 2) { yield a; return; } for (let i = 0; i < a.length; i++) for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p]; }
    const tiennent = [];
    for (const p of perms(ids)) {
      const ch = ['depart', ...p, 'arrivee']; let m = 0, ok = true;
      for (let i = 1; i < ch.length; i++) {
        m += d(ch[i - 1], ch[i]);
        if (ch[i] === 'c6' && J.depart + m / 1000 / J.vitesse * 60 + (i - 1) * J.service > 905) ok = false;
      }
      if (J.depart + m / 1000 / J.vitesse * 60 + 7 * J.service > J.limite) ok = false;
      if (ok) tiennent.push({ p, km: m / 1000 });
    }
    const best = Math.min(...tiennent.map((t) => t.km));
    const pris = (min, max) => tiennent.find((t) => t.km > best * min && t.km <= best * max);
    const etat = (p) => ({ ordre: p, quai: ['c5'], depart: 1, arrivee: 1, report: {}, juge: {} });
    const verdict = (t) => {
      window.__b32.db.transport['boost-ent32'].tournee = etat(t.p);
      return ['trajet10', 'trajet5'].map((k) => S.ETAPES.find((e) => e.id === k).verifier(window.__b32.db).status).join();
    };
    const meilleur = tiennent.find((t) => t.km === best);
    const entre = pris(1.05, 1.10), loin = pris(1.10, 9);
    return { n: tiennent.length, best, p10: tiennent.filter((t) => t.km <= best * 1.10).length, p5: tiennent.filter((t) => t.km <= best * 1.05).length,
      v0: verdict(meilleur), v10: entre && verdict(entre), vloin: loin && verdict(loin), entre: entre && entre.km / best, loin: loin && loin.km / best };
  });
  // Les effectifs du calage (journée du lot 2) : 264 ordres tiennent tout, 57 à moins de 10 %, 17 à moins de 5 %.
  if (r.n !== 264 || r.p10 !== 57 || r.p5 !== 17) throw new Error('effectifs : ' + JSON.stringify([r.n, r.p10, r.p5]));
  if (r.v0 !== 'ok,ok') throw new Error('la meilleure tournée : ' + r.v0);
  if (r.v10 !== 'ok,ko') throw new Error('entre 5 et 10 % (' + (r.entre * 100 - 100).toFixed(1) + ' %) : ' + r.v10);
  if (r.vloin !== 'ko,ko') throw new Error('au-delà de 10 % (' + (r.loin * 100 - 100).toFixed(1) + ' %) : ' + r.vloin);
});

await v('ENT-3.2 : un mauvais client à quai fait tomber « choix », « charge » et les paliers', async () => {
  // La Pâtisserie reste à quai à la place de la Cave : on charge donc 230 − 31 = 199 kg (pour 190).
  await construire32(['c5', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2']);
  let j = await jalons32();
  if (j.charge !== 'ko') throw new Error('charge : ' + j.charge);
  if (j.choix !== 'ko') throw new Error('choix : ' + j.choix);
  if (j.trajet10 !== 'ko') throw new Error('trajet10 : ' + j.trajet10);
  // Tout chargé : le vélo-cargo déborde, et « choix » le dit.
  await construire32(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']);
  const d = await jalon32('choix');
  if (d.status !== 'ko' || !/déborde/.test(d.detail)) throw new Error('tout chargé : ' + JSON.stringify(d));
});

await v('ENT-3.2 : sans le départ ni l’arrivée, ni le train ni le créneau ne se gagnent', async () => {
  await construire32(ORDRE32, { depart: false, arrivee: false });
  let j = await jalons32();
  if (j.horaire === 'ok' || j.creneau === 'ok') throw new Error('train/créneau validés sans départ ni arrivée : ' + JSON.stringify(j));
  if (j.trajet10 === 'ok' || j.trajet5 === 'ok') throw new Error('paliers validés sans chaîne complète : ' + JSON.stringify(j));
  // Départ posé, arrivée non : le créneau se juge (il ne dépend que du départ), le train non.
  await construire32(ORDRE32, { depart: true, arrivee: false });
  j = await jalons32();
  if (j.creneau !== 'ok') throw new Error('créneau avec le départ posé : ' + j.creneau);
  if (j.horaire === 'ok' || j.trajet10 === 'ok') throw new Error('train/paliers validés sans la gare : ' + JSON.stringify(j));
});

await v('ENT-3.2 : ENT-3.1 et ENT-3.2 ne s’écrasent pas — états cloisonnés dans la base commune de Boost', async () => {
  const k = await page32.evaluate(() => Object.keys(window.__b32.db.transport || {}));
  if (k.join() !== 'boost-ent32') throw new Error('clés de la base : ' + k.join());
  const ids = await page32.evaluate(async () => [(await import('/contenus/boost-tournee.js')).TRANSPORT_ID, (await import('/contenus/boost-ent32.js')).TRANSPORT_ID]);
  if (ids[0] === ids[1]) throw new Error('les deux séances partagent le même transportId : ' + ids[0]);
});

await v('ENT-3.2 : aucune erreur de console sur tout le parcours', async () => {
  if (erreurs32.length) throw new Error([...new Set(erreurs32)].slice(0, 3).join(' | '));
});

/* ===================================================================================== */
/* Moteur tournée — état initial et « sans verdict » (chantier moteur d'ENT-3.3)          */
/*                                                                                        */
/* Ajouté le 02/10/2026. On monte la vue du moteur directement (journée d'ENT-3.2), sans */
/* passer par une séance : ce qu'on éprouve ici, c'est `etatInitial`, `amorcer`,          */
/* `sansVerdict` et le bouton « Retrouver la tournée de départ ».                         */
/* Les valeurs attendues sont écrites ICI à la main (voir l'énumération des 5 040 ordres  */
/* dans `outils/carte/calibrer.mjs`) : la tournée du collègue est « Mercerie Pellet à     */
/* quai, puis le plus court » — 218 kg pour 180, créneau raté, train tenu.                */
/* ===================================================================================== */

const COLLEGUE = { ordre: ['c4', 'c3', 'c8', 'c1', 'c7', 'c6', 'c5'], quai: ['c2'], depart: true, arrivee: true };

// Monte la vue du moteur dans un div jetable ; `t` complète la déclaration de la tournée d'ENT-3.2.
const monterMoteur = (t, etat0) => page.evaluate(async ({ t, etat0 }) => {
  const [{ creerTournee }, S] = await Promise.all([import('/core/types/tournee.js'), import('/contenus/boost-ent32.js')]);
  const vue = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE, t));
  const etat = etat0 || {};
  // Un essai précédent qui a échoué n'a pas pu défaire son écran : on repart toujours d'une page propre.
  document.getElementById('moteurEssai')?.remove();
  const hote = document.createElement('div');
  hote.id = 'moteurEssai';
  document.body.appendChild(hote);
  const sauvegardes = [];
  const api = { etat, sauver: () => sauvegardes.push(JSON.stringify(etat)), toast: () => {},
    redessiner: () => { hote.innerHTML = vue.html(etat); vue.brancher(hote, api); } };
  window.__moteur = { vue, etat, hote, api, sauvegardes };
  return true;
}, { t, etat0 });
const demonterMoteur = () => page.evaluate(() => { document.getElementById('moteurEssai')?.remove(); delete window.__moteur; });
const lireMoteur = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__moteur.etat)));

await v('Moteur tournée : amorcer pose la tournée du collègue, une fois, avec sa marque', async () => {
  await monterMoteur({ etatInitial: COLLEGUE }, {});
  const r = await page.evaluate(() => { const m = window.__moteur; const a = m.vue.amorcer(m.etat); return { a, e: JSON.parse(JSON.stringify(m.etat)) }; });
  if (r.a !== true) throw new Error('amorcer devait rendre vrai la première fois');
  if (r.e.ordre.join() !== COLLEGUE.ordre.join()) throw new Error('ordre : ' + r.e.ordre);
  if (r.e.quai.join() !== 'c2') throw new Error('à quai : ' + r.e.quai);
  if (!r.e.depart || !r.e.arrivee) throw new Error('départ et arrivée devraient être posés : ' + JSON.stringify([r.e.depart, r.e.arrivee]));
  if (!r.e.amorce) throw new Error('la marque `amorce` manque : rien n’empêcherait de le refaire');
  await demonterMoteur();
});

await v('Moteur tournée : la tournée de départ est celle du brief — 218 kg, créneau raté, train tenu (bilan compté comme les clics)', async () => {
  await monterMoteur({ etatInitial: COLLEGUE }, {});
  const r = await page.evaluate(() => {
    const m = window.__moteur; m.vue.amorcer(m.etat);
    const pose = m.vue.bilan(m.etat);
    // La même tournée posée « comme par des clics » : l'état que le moteur écrit au clic.
    const clic = m.vue.bilan({ ordre: ['c4', 'c3', 'c8', 'c1', 'c7', 'c6', 'c5'], quai: ['c2'], depart: 1, arrivee: 1, report: {}, juge: {} });
    const pick = (b) => ({ km: Math.round(b.km * 1000) / 1000, charge: b.cumuls.charge, creneau: b.creneauRate, retard: b.enRetard, gare: Math.round(b.arrivee) });
    return { pose: pick(pose), clic: pick(clic) };
  });
  if (JSON.stringify(r.pose) !== JSON.stringify(r.clic)) throw new Error('posée ≠ cliquée : ' + JSON.stringify(r));
  if (r.pose.charge !== 218) throw new Error('charge ' + r.pose.charge + ' kg au lieu de 218');
  if (Math.abs(r.pose.km - 11.52) > 0.05) throw new Error('distance ' + r.pose.km + ' km au lieu de ≈ 11,52');
  if (r.pose.creneau !== true) throw new Error('le créneau devrait être raté');
  if (r.pose.retard !== false) throw new Error('le train devrait être tenu (leurre)');
  if (r.pose.gare < 956 || r.pose.gare > 962) throw new Error('arrivée à la gare : ' + r.pose.gare + ' min, attendu ≈ 15 h 59');
  await demonterMoteur();
});

await v('Moteur tournée : amorcer ne réécrase JAMAIS le travail — ni au second appel, ni après reconnexion, ni au redessin', async () => {
  await monterMoteur({ etatInitial: COLLEGUE }, {});
  const r = await page.evaluate(async () => {
    const m = window.__moteur; m.vue.amorcer(m.etat);
    // L'élève répare : il retire la Pâtisserie, puis recharge un client à quai.
    m.etat.ordre = m.etat.ordre.filter((x) => x !== 'c6'); m.etat.quai.push('c6'); m.etat.arrivee = null;
    // Ce qui compte, c'est la tournée : le redessin ajoute de lui-même la feuille de calcul vide
    // (`grille`), qui n'est pas du travail d'élève.
    const tournee = (e) => JSON.stringify([e.ordre, e.quai, e.depart, e.arrivee, e.amorce]);
    const apres = JSON.stringify(m.etat);
    const deuxieme = m.vue.amorcer(m.etat);
    m.api.redessiner(); m.api.redessiner();                        // redessin ×2
    const redessin = tournee(m.etat);
    // Reconnexion : la base est relue (copie JSON) et une NOUVELLE vue la reçoit.
    const { creerTournee } = await import('/core/types/tournee.js');
    const S = await import('/contenus/boost-ent32.js');
    const neuve = creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE, { etatInitial: { ordre: ['c1'], quai: ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], depart: true, arrivee: true } }));
    const relue = JSON.parse(apres);
    const troisieme = neuve.amorcer(relue);
    return { apres, deuxieme, redessin, troisieme, relue: JSON.stringify(relue),
      tourneeApres: tournee(JSON.parse(apres)) };
  });
  if (r.deuxieme !== false) throw new Error('le second amorcer devait ne rien faire');
  if (r.redessin !== r.tourneeApres) throw new Error('le redessin a modifié le travail de l’élève : ' + r.redessin);
  if (r.troisieme !== false || r.relue !== r.apres) throw new Error('la reconnexion a réécrasé le travail');
  if (JSON.parse(r.apres).ordre.includes('c6')) throw new Error('cas mal posé : c6 devrait avoir été retiré');
  await demonterMoteur();
});

await v('Moteur tournée : un état qui porte déjà du travail, sans marque, n’est pas écrasé — la marque seule est posée', async () => {
  await monterMoteur({ etatInitial: COLLEGUE }, { ordre: ['c1'], quai: ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], report: {}, juge: {}, depart: 1, arrivee: null });
  const r = await page.evaluate(() => { const m = window.__moteur; const a = m.vue.amorcer(m.etat); return { a, e: JSON.parse(JSON.stringify(m.etat)) }; });
  if (r.e.ordre.join() !== 'c1' || r.e.arrivee !== null) throw new Error('le travail existant a été écrasé : ' + JSON.stringify(r.e));
  if (!r.e.amorce) throw new Error('la marque devait être posée');
  await demonterMoteur();
});

await v('Moteur tournée : sans etatInitial, amorcer ne fait rien — ENT-3.1 et ENT-3.2 ne bougent pas', async () => {
  await monterMoteur({}, {});
  const r = await page.evaluate(() => { const m = window.__moteur; const a = m.vue.amorcer(m.etat); return { a, e: JSON.stringify(m.etat) }; });
  if (r.a !== false || r.e !== '{}') throw new Error('amorcer a touché une séance sans état de départ : ' + r.e);
  await demonterMoteur();
});

await v('Moteur tournée : un état de départ incohérent est refusé à la création (client inconnu, client chargé ET à quai, client oublié)', async () => {
  const essais = [
    ['client inconnu', { ordre: ['c1', 'zz'], quai: [] }],
    ['chargé et à quai', { ordre: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], quai: ['c8'] }],
    ['client oublié', { ordre: ['c1', 'c2'], quai: ['c3'] }],
  ];
  for (const [nom, I] of essais) {
    const r = await page.evaluate(async (I) => {
      const [{ creerTournee }, S] = await Promise.all([import('/core/types/tournee.js'), import('/contenus/boost-ent32.js')]);
      try { creerTournee(Object.assign({ plan: S.PLAN }, S.TOURNEE, { etatInitial: I })); return 'accepté'; } catch (e) { return 'refusé'; }
    }, I);
    if (r !== 'refusé') throw new Error(nom + ' : ' + r);
  }
});

await v('Moteur tournée : « Retrouver la tournée de départ » — grisé au départ, actif après une modif, remet la tournée du collègue', async () => {
  await monterMoteur({ etatInitial: COLLEGUE }, {});
  await page.evaluate(() => { const m = window.__moteur; m.vue.amorcer(m.etat); m.api.redessiner(); });
  const sel = '#moteurEssai [data-tour-raz]';
  if (!(await page.$eval(sel, (b) => b.disabled))) throw new Error('le bouton devrait être grisé tant que la tournée est celle de départ');
  const texte = (await page.textContent(sel)).trim();
  if (!/Retrouver la tournée de départ/.test(texte) || /Recommencer/.test(texte)) throw new Error('libellé : ' + texte);
  // L'élève répare, puis veut revenir au départ.
  await page.evaluate(() => { const m = window.__moteur; m.etat.ordre = m.etat.ordre.filter((x) => x !== 'c5'); m.etat.quai.push('c5'); m.etat.depart = null; m.api.redessiner(); });
  if (await page.$eval(sel, (b) => b.disabled)) throw new Error('le bouton devrait être actif après une modification');
  await page.click(sel);                                   // arme
  await page.click('#moteurEssai [data-tour-raz]');        // confirme
  const e = await lireMoteur();
  if (e.ordre.join() !== COLLEGUE.ordre.join() || e.quai.join() !== 'c2' || !e.depart || !e.arrivee) {
    throw new Error('la tournée de départ n’est pas revenue : ' + JSON.stringify(e));
  }
  if (!e.amorce) throw new Error('la marque a disparu : la tournée serait reposée à la prochaine ouverture');
  await demonterMoteur();
});

await v('Moteur tournée : sans etatInitial, « Recommencer la tournée » vide toujours la tournée (inchangé)', async () => {
  await monterMoteur({}, { ordre: ['c1', 'c2'], quai: ['c3', 'c4', 'c5', 'c6', 'c7', 'c8'], report: {}, juge: {}, depart: 1, arrivee: 1 });
  await page.evaluate(() => window.__moteur.api.redessiner());
  const texte = (await page.textContent('#moteurEssai [data-tour-raz]')).trim();
  if (texte !== 'Recommencer la tournée') throw new Error('libellé : ' + texte);
  await page.click('#moteurEssai [data-tour-raz]');
  await page.click('#moteurEssai [data-tour-raz]');
  const e = await lireMoteur();
  if (e.ordre.length || e.quai.length !== 8 || e.depart || e.arrivee) throw new Error('la tournée n’est pas vide : ' + JSON.stringify(e));
  await demonterMoteur();
});

await v('Moteur tournée : sansVerdict — la tournée du collègue ne s’accuse nulle part (ni dépassée, ni raté, ni respectée, ni tenu)', async () => {
  const verdict = /dépassée|manqué|raté|retard|respectée|tenu\b|Créneau tenu|horaire tenu/i;
  const lire = async (t) => {
    await monterMoteur(Object.assign({ etatInitial: COLLEGUE }, t), {});
    const r = await page.evaluate(() => { const m = window.__moteur; m.vue.amorcer(m.etat); m.api.redessiner();
      return { txt: m.hote.textContent.replace(/\s+/g, ' '), trop: m.hote.querySelectorAll('.tour-jauge.trop').length,
        crit: m.hote.querySelectorAll('.pastille.crit, .pastille.ok').length }; });
    await demonterMoteur();
    return r;
  };
  const muet = await lire({ sansVerdict: true });
  if (verdict.test(muet.txt)) throw new Error('un verdict est lisible : ' + (muet.txt.match(verdict) || [])[0]);
  if (muet.trop || muet.crit) throw new Error('jauge ou pastille d’alerte visible : ' + JSON.stringify(muet));
  if (!/190/.test(muet.txt)) throw new Error('la limite de 190 kg doit rester lisible');
  if (/\b218\b/.test(muet.txt)) throw new Error('le poids chargé (218) est donné');
  // Témoin : SANS l'option, ce même écran accuse bien la tournée (sinon le test ne prouverait rien).
  const parlant = await lire({});
  if (!verdict.test(parlant.txt) || !parlant.trop) throw new Error('le témoin n’accuse rien : l’essai ne prouve rien');
});


/* ===================================================================================== */
/* ENT-3.3 — « la tournée à corriger » (erreur induite de C2.4)                           */
/*                                                                                        */
/* Ajouté le 02/10/2026. La séance pose la tournée d'Inès (Mercerie Pellet à quai, puis   */
/* le plus court), muette ; l'élève répond contrainte par contrainte, puis répare.        */
/* Les valeurs attendues sont écrites ICI à la main (énumération de `calibrer.mjs` et     */
/* calcul de la tournée d'Inès) : 218 kg, Pâtisserie à ≈ 15 h 27, gare à ≈ 15 h 50.       */
/* ===================================================================================== */

const ctx33 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const page33 = await ctx33.newPage();
page33.setDefaultTimeout(8000);
const erreurs33 = [];
page33.on('pageerror', (e) => erreurs33.push('PAGEERROR: ' + e.message));
page33.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs33.push('CONSOLE: ' + m.text()); });
await page33.goto('http://127.0.0.1:8099/');
await page33.waitForSelector('#btnProf', { timeout: 8000 });

// Monte la séance ; `garder` reprend la base précédente relue en JSON : c'est la reconnexion.
const monter33 = (garder) => page33.evaluate(async (garder) => {
  const act = await import('/activites/boost-ent33.js');
  document.getElementById('boost33')?.remove();
  const hote = document.createElement('div');
  hote.id = 'boost33';
  document.body.appendChild(hote);
  const db = garder && window.__b33 ? JSON.parse(JSON.stringify(window.__b33.db)) : {};
  const suivi = [];
  act.rendre(hote, {
    meta: act.meta,
    profil: { prenom: 'Lea', nom: 'Dupont', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => suivi.push(r),
    quitter: () => {}, codeStock: 'ABC',
  });
  window.__b33 = { act, db, suivi, hote };
}, garder);
await monter33(false);
const z33 = '#boost33 .ent-main';
const ouvrir33 = async (vue) => { await page33.click(`#boost33 .ent-nav[data-vue="${vue}"]`); await page33.waitForTimeout(140); };
const tournee33 = () => page33.evaluate(() => {
  const t = window.__b33.db.transport && window.__b33.db.transport['boost-ent33'];
  return t && t.tournee ? JSON.parse(JSON.stringify(t.tournee)) : null;
});
const jalons33 = () => page33.evaluate(async () => {
  const S = await import('/contenus/boost-ent33.js');
  const o = {};
  S.ETAPES.forEach((e) => { o[e.id] = e.verifier(window.__b33.db).status; });
  return o;
});
// Pose une tournée dans la base, comme si l'élève l'avait cliquée (la marque `amorce` reste).
const poser33 = (ordre, quai, { depart = true, arrivee = true } = {}) => page33.evaluate(({ ordre, quai, depart, arrivee }) => {
  const t = window.__b33.db.transport['boost-ent33'].tournee;
  Object.assign(t, { ordre, quai, depart: depart ? Date.now() : null, arrivee: arrivee ? Date.now() : null });
}, { ordre, quai, depart, arrivee });
// Range une réponse à Inès dans la base, comme le fait le bouton « Envoyer ».
const repondre33 = (texte) => page33.evaluate(async (texte) => {
  const S = await import('/contenus/boost-ent33.js');
  window.__b33.db.mails.push({ folder: 'out', ts: Date.now(), from: 'Lea', fromMail: '', to: 'Inès', toMail: S.INES.mail,
    subject: 'RE : tournée', kind: 'text', text: texte, read: true, id: 9000 + window.__b33.db.mails.length });
}, texte);
const oublierReponses33 = () => page33.evaluate(() => { const d = window.__b33.db; d.mails = d.mails.filter((m) => m.folder !== 'out'); });
const immobile33 = () => page33.evaluate(() => new Promise((ok) => {
  let y = null, n = 0;
  const f = () => {
    const s = document.querySelector('#boost33 [data-ct-svg]');
    const cle = window.scrollY + '|' + (s ? s.getAttribute('viewBox') : '');
    if (cle === y) n++; else { n = 0; y = cle; }
    if (n >= 5) ok(); else requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}));

// Écrits à la main : la tournée d'Inès, la meilleure réparation, et une réparation qui tient tout
// mais roule trop (14,56 km, +16 %). Journée du chantier D, lot 2 : 190 kg, train 16 h 15, Pâtisserie
// avant 15 h 05 ; Inès arrive chez la Pâtisserie à 15 h 40 et à la gare à 15 h 59, avec 218 kg — et sa
// feuille, dont le poids chargé oublie la dernière ligne (F1), affiche 166 kg.
const INES33 = { ordre: ['c4', 'c3', 'c8', 'c1', 'c7', 'c6', 'c5'], quai: ['c2'] };
const BONNE33 = ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2'];
const LONGUE33 = ['c2', 'c6', 'c1', 'c7', 'c4', 'c3', 'c8'];
const JUSTE33 = 'Bonjour Inès,\n\nCharge utile : dépassée\nTrain de 16 h 15 : attrapé\nCréneau de la Pâtisserie Arnaud : raté\n'
  + 'Poids chargé : 218 kg\nArrivée à la Pâtisserie Arnaud : 15 h 40\nArrivée à la gare : 15 h 59\n\nLéa';
const REPARATION = ['charge', 'horaire', 'creneau', 'trajet'];

await v('ENT-3.3 : la séance est l’erreur induite de C2.4, validée par Tristan (visible des élèves), sept jalons, sans notation ni copie', async () => {
  const r = await page33.evaluate(async () => {
    const { meta } = await import('/activites/boost-ent33.js');
    const { ETAPES } = await import('/contenus/boost-ent33.js');
    const reg = await import('/activites/index.js');
    const liste = await reg.chargerActivites();
    return { meta, ids: ETAPES.map((e) => e.id), inscrite: liste.some((x) => x.meta.id === 'boost-ent33') };
  });
  const m = r.meta;
  if (m.code !== 'ENT-3.3' || m.temps !== 'erreur' || m.competences.join() !== 'C2.4' || m.rubrique !== 'logisim') throw new Error('déclaration : ' + JSON.stringify(m));
  if (m.pret !== true) throw new Error('pret devrait être true : Tristan a validé la séance le 03/10/2026');
  if ('notation' in m || m.copie) throw new Error('jalons et note sur 20 : ni `notation`, ni `copie`');
  if (m.jeuId !== 'boost' || m.reinitialisable) throw new Error('base de Boost partagée : ni jeu à part, ni remise à zéro');
  // Sept jalons depuis le chantier D (lot 2) : « formule », la formule fausse de la feuille d'Inès corrigée.
  if (m.bareme !== 7 || r.ids.join() !== 'contraintes,preuves,formule,charge,horaire,creneau,trajet') throw new Error('jalons : ' + m.bareme + ' ' + r.ids.join());
  if (!r.inscrite) throw new Error('la séance n’est pas dans le registre');
});

await v('ENT-3.3 : la tournée d’Inès est la B du brief, et son diagnostic recalculé dit surcharge + créneau raté, train tenu', async () => {
  const r = await page33.evaluate(async () => {
    const S = await import('/contenus/boost-ent33.js');
    return { c: S.COLLEGUE, d: S.diagnostic(), init: S.TOURNEE.etatInitial === S.COLLEGUE, muet: S.TOURNEE.sansVerdict, ines: S.poidsInes() };
  });
  if (r.c.ordre.join() !== INES33.ordre.join() || r.c.quai.join() !== 'c2' || !r.c.depart || !r.c.arrivee) throw new Error('tournée d’Inès : ' + JSON.stringify(r.c));
  if (!r.init || r.muet !== true) throw new Error('la vue doit déclarer etatInitial et sansVerdict');
  const d = r.d;
  if (d.surcharge !== true || d.creneauRate !== true || d.trainManque !== false) throw new Error('contraintes : ' + JSON.stringify(d));
  if (d.poids !== 218) throw new Error('poids ' + d.poids + ' au lieu de 218');
  if (Math.abs(d.arriveeClient - 939.9) > 0.5) throw new Error('arrivée à la Pâtisserie : ' + d.arriveeClient + ' min, attendu ≈ 15 h 40');
  if (Math.abs(d.arriveeGare - 959.35) > 0.5) throw new Error('arrivée à la gare : ' + d.arriveeGare + ' min, attendu ≈ 15 h 59');
  // La feuille d'Inès oublie la Cave Teissier (52 kg), dernière de sa tournée : 218 − 52 = 166.
  if (r.ines !== 166) throw new Error('poids chargé de la feuille d’Inès : ' + r.ines);
});

await v('ENT-3.3 : à l’ouverture rien n’est validé, pas de menu Plan — et le message d’Inès ne donne ni le total, ni les heures', async () => {
  const j = await jalons33();
  const faits = Object.keys(j).filter((k) => j[k] === 'ok');
  if (faits.length) throw new Error('jalon(s) validé(s) sans rien avoir fait : ' + faits.join(', '));
  if (j.contraintes !== 'attente' || j.preuves !== 'attente') throw new Error('diagnostic sans réponse : ' + JSON.stringify(j));
  const menu = await page33.$$eval('#boost33 .ent-nav', (l) => l.map((b) => b.dataset.vue));
  if (menu.includes('plan') || !menu.includes('tournee')) throw new Error('menu : ' + menu.join());
  await ouvrir33('mail');
  const t = await page33.evaluate(() => {
    const l = window.__b33.db.mails.filter((x) => x.fromMail === 'ines.livraison@boost.example');
    return l.length === 1 ? l[0].text.replace(/\s+/g, ' ') : 'EXEMPLAIRES:' + l.length;
  });
  for (const l of ['Charge utile :', 'Train de 16 h 15 :', 'Créneau de la Pâtisserie Arnaud :', 'Poids chargé :', 'Arrivée à la Pâtisserie Arnaud :', 'Arrivée à la gare :', 'Mercerie Pellet', 'le plus court',
    'on charge 166 kg', '14 km/h']) {
    if (!t.includes(l)) throw new Error('le message ne porte pas « ' + l + ' » : ' + t.slice(0, 200));
  }
  for (const x of [/\b218\b/, /\b230\b/, /15 h 40/, /15 h 59/, /douzaine/]) {
    if (x.test(t)) throw new Error('le message donne la réponse : ' + x);
  }
});

await v('ENT-3.3 : la tournée d’Inès est posée à l’ouverture — départ, ordre, Mercerie Pellet à quai, arrivée', async () => {
  await ouvrir33('tournee');
  const e = await tournee33();
  if (!e || e.ordre.join() !== INES33.ordre.join() || e.quai.join() !== 'c2' || !e.depart || !e.arrivee || !e.amorce) {
    throw new Error('tournée posée : ' + JSON.stringify(e));
  }
});

/* ------------ ENT-3.3 · en deux temps : contrôler (figé), puis corriger (chantier E, 03/10/2026) ------------ */
/* RÉÉCRITS le 03/10/2026 (brief `ENT-3.3-deux-temps.md`) : ils remplacent les cas de la consigne en    */
/* trois étapes (chantier A). Valeurs écrites à la main : 190 kg, 16 h 15, 15 h 05 ; la feuille d'Inès  */
/* en colonnes — B2 à B9 la tournée, B10 « À quai » (Mercerie Pellet, 12 kg), B11 le poids chargé       */
/* `=SOMME(B2:B7)` qui affiche 166 ; E12 l'arrivée à la gare (15 h 59), E15 chez la Pâtisserie (15 h 40). */

const etapes33 = () => page33.evaluate(() => [...document.querySelectorAll('#boost33 [data-etape]')]
  .map((li) => ({ fait: li.classList.contains('fait'), txt: li.textContent.replace(/\s+/g, ' ').trim(),
    pastille: li.querySelector('[data-etape-etat]').textContent.replace(/\s+/g, ' ').trim() })));
const rafraichir33 = async () => { await ouvrir33('mail'); await ouvrir33('tournee'); };
const barre33 = () => page33.evaluate(() => { const b = document.querySelector('#boost33 [data-gr-barre]');
  return { v: b.value, ro: b.readOnly, ref: document.querySelector('#boost33 [data-gr-barre-ref]').textContent.trim() }; });
const cel33 = (r) => page33.evaluate((r) => (document.querySelector(`#boost33 [data-gr-cel="${r}"]`) || {}).innerText, r);
const phase33 = () => page33.evaluate(() => { const t = window.__b33.db.transport['boost-ent33'].tournee; return t.phase ? t.phase.n : 1; });
// Les commandes qui changent l'état : au temps figé, il n'en reste aucune.
const COMMANDES33 = '[data-clic-point], [data-clic-extremite], [data-haut], [data-bas], [data-quai], [data-reprendre], '
  + '[data-bout], [data-tour-raz], [data-gr-verifier], [data-tour-terminer], [data-gr]:not([readonly])';

await v('ENT-3.3 : la vue tient en trois étapes et trois étiquettes de contraintes — sans rappel ni colonne de jauges', async () => {
  const r = await page33.evaluate(() => ({
    titre: document.querySelector('#boost33 .ent-main h2').textContent,
    etiq: [...document.querySelectorAll('#boost33 .tour-etiquette')].map((x) => x.textContent.trim()),
    rappel: document.querySelectorAll('#boost33 .tour-rappel-puce').length,
    jauges: document.querySelectorAll('#boost33 .tour-jauge').length,
    nbNote: document.querySelectorAll('#boost33 .ent-main > p.note').length,
  }));
  if (r.titre !== 'La tournée d’Inès') throw new Error('titre : ' + r.titre);
  const e = await etapes33();
  if (e.length !== 3) throw new Error('étapes : ' + e.length);
  ['1. Contrôler, puis répondre', '2. Corriger', '3. Terminer'].forEach((t, i) => { if (!e[i].txt.startsWith(t)) throw new Error('étape ' + (i + 1) + ' : ' + e[i].txt); });
  if (!/figées/.test(e[0].txt) || !/messagerie/.test(e[0].txt) || !/J’ai terminé/.test(e[2].txt)) throw new Error('textes des étapes');
  if (r.etiq.join('|') !== 'Charge du vélo-cargo : 190 kg au plus|Départ du train : 16 h 15|Pâtisserie Arnaud : avant 15 h 05') throw new Error('étiquettes : ' + r.etiq.join('|'));
  if (r.rappel || r.jauges || r.nbNote) throw new Error('rappel, jauges ou ancienne consigne encore là : ' + JSON.stringify(r));
});

await v('ENT-3.3 : à l’ouverture, les trois pastilles sont grises — « à faire »', async () => {
  const e = await etapes33();
  if (e.some((x) => x.fait || x.pastille !== 'à faire')) throw new Error(JSON.stringify(e.map((x) => x.pastille)));
});

await v('ENT-3.3 : temps 1 — tout est figé : aucune commande, la liste des arrêts se lit, et un geste forcé ne change rien', async () => {
  const r = await page33.evaluate((sel) => ({
    commandes: [...document.querySelectorAll(`#boost33 ${sel}`)].map((x) => x.outerHTML.slice(0, 60)),
    arrets: document.querySelectorAll('#boost33 #tourListe .tour-item').length,
    boutonsListe: document.querySelectorAll('#boost33 #tourListe button').length,
    origine: document.querySelectorAll('#boost33 [data-gr-origine]').length,
  }), COMMANDES33);
  if (r.commandes.length) throw new Error('commandes au temps figé : ' + r.commandes.join(' ; '));
  if (r.arrets !== 7 || r.boutonsListe) throw new Error('liste des arrêts : ' + JSON.stringify(r));
  if (r.origine) throw new Error('« ↺ » au temps figé');
  const avant = JSON.stringify(await tournee33());
  await immobile33();
  await page33.click(`${z33} .ct-mk-client[data-point="c6"], ${z33} [data-point="c6"]`, { force: true });
  await page33.evaluate(() => { const b = document.querySelector('#boost33 [data-gr-barre]');
    b.value = '=1'; b.dispatchEvent(new Event('input', { bubbles: true })); });
  await page33.waitForTimeout(80);
  if (JSON.stringify(await tournee33()) !== avant) throw new Error('l’état a changé au temps figé');
  if ((await etapes33()).some((x) => x.fait)) throw new Error('une pastille s’est allumée au temps figé');
});

await v('ENT-3.3 : la feuille d’Inès en colonnes, comme un tableur — la cellule montre le résultat, la barre la formule', async () => {
  await rafraichir33();
  if (await cel33('B11') !== '166') throw new Error('B11 : ' + await cel33('B11'));
  if (await cel33('B10') !== '12') throw new Error('B10 (à quai) : ' + await cel33('B10'));
  const a10 = await page33.evaluate(() => document.querySelector('#boost33 [data-ref="A10"]').innerText.trim());
  if (a10 !== 'À quai : Mercerie Pellet') throw new Error('A10 : ' + a10);
  if (await cel33('E12') !== '15 h 59' || await cel33('E15') !== '15 h 40') throw new Error('heures : ' + await cel33('E12') + ' / ' + await cel33('E15'));
  const lignes = await page33.evaluate(() => document.querySelectorAll('#boost33 .gr-table tbody tr').length);
  if (lignes !== 15) throw new Error('lignes de la feuille : ' + lignes);
  await page33.click(`${z33} [data-gr-cel="B11"]`);
  let b = await barre33();
  if (b.v !== '=SOMME(B2:B7)' || b.ref !== 'B11' || !b.ro) throw new Error('barre sur B11 : ' + JSON.stringify(b));
  // Au clavier : la flèche descend d'une cellule, et la barre suit.
  await page33.focus(`${z33} [data-gr-cel="E11"]`);
  await page33.keyboard.press('ArrowDown');
  b = await barre33();
  if (b.ref !== 'E12' || b.v !== '=E2+E10+E11') throw new Error('flèche vers E12 : ' + JSON.stringify(b));
});

await v('ENT-3.3 : un message à quelqu’un d’autre ne débloque rien ; un message à Inès, même faux, fait passer au temps 2 — une fois', async () => {
  await page33.evaluate(() => { const d = window.__b33.db; d.mails.push({ folder: 'out', ts: Date.now(), from: 'Lea', fromMail: '', to: 'M. Morin',
    toMail: 'morin@boost.example', subject: 'autre', kind: 'text', text: 'Bonjour', read: true, id: 8000 }); });
  await monter33(true); await ouvrir33('tournee');
  if (await phase33() !== 1) throw new Error('un message à un autre destinataire a débloqué le temps 2');
  // Envoyé depuis la messagerie, comme l'élève, et FAUX : il débloque quand même (alerte 28).
  await ouvrir33('mail');
  const id = await page33.evaluate(() => window.__b33.db.mails.find((m) => m.fromMail === 'ines.livraison@boost.example').id);
  await page33.click(`#boost33 [data-mail="${id}"]`);
  await page33.click('#boost33 [data-repondre]');
  await page33.fill('#boost33 #repT', 'Bonjour Inès, tout me semble bon.');
  await page33.click('#boost33 #formRep button[type="submit"]');
  await page33.waitForTimeout(80);
  if (await phase33() !== 2) throw new Error('le message à Inès n’a pas débloqué le temps 2');
  const r = await page33.evaluate(() => window.__b33.db.mails.filter((m) => m.declenche === 'deverrouille').map((m) => m.text));
  if (r.length !== 1) throw new Error('réponses d’Inès : ' + r.length);
  if (!/déverrouillées/.test(r[0]) || !/J’ai terminé/.test(r[0])) throw new Error('texte : ' + r[0]);
  if (/corrig|erreur|faux|fausse|juste/i.test(r[0])) throw new Error('la réponse d’Inès révèle quelque chose : ' + r[0]);
  await ouvrir33('tournee');
  const notif = await page33.$('#boost33 [data-tour-notif]');
  if (!notif) throw new Error('pas de « Nouveau message » en tête de la tournée');
  const e = await etapes33();
  if (!e[0].fait || e[1].fait || e[2].fait) throw new Error('pastilles : ' + JSON.stringify(e.map((x) => x.pastille)));
  // Une seule fois : un second message ne refait rien, et le temps 2 survit à la reconnexion.
  await repondre33('encore');
  await monter33(true); await ouvrir33('tournee');
  const n = await page33.evaluate(() => window.__b33.db.mails.filter((m) => m.declenche === 'deverrouille').length);
  if (n !== 1 || await phase33() !== 2) throw new Error('après reconnexion : ' + n + ' réponse(s), temps ' + await phase33());
  await oublierReponses33();
});

await v('ENT-3.3 : temps 2 — la barre se modifie, sans redessin ; « ↺ » remet Inès ; la pastille 2 suit, sans rien juger', async () => {
  await rafraichir33();
  await immobile33();
  await page33.evaluate(() => { document.querySelector('#boost33 .ent-main').dataset.temoin = '1'; });
  await page33.click(`${z33} [data-gr-cel="B11"]`);
  const b = await barre33();
  if (b.ro || b.v !== '=SOMME(B2:B7)') throw new Error('barre au temps 2 : ' + JSON.stringify(b));
  await page33.fill(`${z33} [data-gr-barre]`, '=1');
  if (await cel33('B11') !== '1') throw new Error('la cellule ne suit pas la barre : ' + await cel33('B11'));
  let e = await etapes33();
  if (!e[1].fait || e[1].pastille !== '✓ fait') throw new Error('pastille 2 : ' + JSON.stringify(e[1]));
  const r = await page33.evaluate(() => ({ temoin: document.querySelector('#boost33 .ent-main').dataset.temoin,
    juge: JSON.stringify(window.__b33.db.transport['boost-ent33'].tournee.grille.juge || {}),
    plein: document.querySelectorAll('#boost33 .tour-etape .pastille.ok').length }));
  if (r.temoin !== '1') throw new Error('la page a été redessinée à la frappe');
  if (r.juge !== '{}' || r.plein) throw new Error('rien n’est jugé : ' + JSON.stringify(r));
  await page33.click(`${z33} .gr-barre [data-gr-origine]`);
  e = await etapes33();
  if (e[1].fait) throw new Error('après « ↺ », la pastille 2 doit être grise');
  if (await cel33('B11') !== '166') throw new Error('« ↺ » ne remet pas la formule d’Inès');
});

await v('ENT-3.3 : temps 2 — la plage se désigne à la souris depuis la barre, et Entrée descend d’une cellule', async () => {
  await page33.click(`${z33} [data-gr-cel="B11"]`);
  await page33.fill(`${z33} [data-gr-barre]`, '=SOMME(');
  const box = async (r) => { const el = await page33.$(`${z33} [data-gr-cel="${r}"]`); await el.scrollIntoViewIfNeeded(); return el.boundingBox(); };
  const a = await box('B2'), z = await box('B8');
  await page33.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page33.mouse.down();
  await page33.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 4 });
  await page33.mouse.up();
  let b = await barre33();
  if (b.v !== '=SOMME(B2:B8' || b.ref !== 'B11') throw new Error('pointage : ' + JSON.stringify(b));
  await page33.keyboard.type(')');
  if (await cel33('B11') !== '218') throw new Error('poids chargé corrigé : ' + await cel33('B11'));
  await page33.keyboard.press('Enter');
  b = await barre33();
  if (b.ref !== 'B12') throw new Error('Entrée : ' + JSON.stringify(b));
  await page33.evaluate(() => { window.__b33.db.transport['boost-ent33'].tournee.grille.cases = {}; });
  await rafraichir33();
});

await v('ENT-3.3 : temps 2 — la carte se clique ; « Retrouver la tournée d’Inès » la remet, pastille 2 au gris', async () => {
  await immobile33();
  await page33.click(`${z33} [data-clic-point="c6"]`, { force: true });   // retire la Pâtisserie
  await page33.waitForTimeout(100);
  if ((await tournee33()).ordre.includes('c6')) throw new Error('le clic n’a pas retiré la Pâtisserie');
  if (!(await etapes33())[1].fait) throw new Error('modifiée, la pastille 2 reste grise');
  const sel = '#boost33 [data-tour-raz]';
  if (!/Retrouver la tournée d’Inès/.test(await page33.textContent(sel))) throw new Error('libellé : ' + await page33.textContent(sel));
  await page33.click(sel);
  await page33.click(sel);
  await page33.waitForTimeout(100);
  const e = await tournee33();
  if (e.ordre.join() !== INES33.ordre.join() || e.quai.join() !== 'c2') throw new Error('tournée : ' + JSON.stringify(e.ordre));
  if ((await etapes33())[1].fait) throw new Error('la pastille 2 doit être grise sur la tournée d’Inès');
});

await v('ENT-3.3 : « J’ai terminé » — deux clics, puis tout est figé pour de bon ; les jalons ne bougent pas', async () => {
  const sel = '#boost33 [data-tour-terminer]';
  await page33.click(sel);
  if (!/Terminer ma correction \?/.test(await page33.textContent(sel))) throw new Error('premier clic : ' + await page33.textContent(sel));
  await page33.click('#boost33 [data-tour-terminer-non]');
  if ((await tournee33()).termine) throw new Error('« Annuler » a terminé quand même');
  const avantJ = JSON.stringify(await jalons33());
  await page33.click(sel);
  await page33.click(sel);
  await page33.waitForTimeout(80);
  const t = await tournee33();
  if (!t.termine) throw new Error('« J’ai terminé » n’horodate pas');
  const r = await page33.evaluate((s) => ({
    commandes: document.querySelectorAll(`#boost33 ${s}`).length,
    avis: (document.querySelector('#boost33 [data-tour-termine]') || {}).innerText || '',
    rouvrir: !!document.querySelector('#boost33 [data-tour-rouvrir]'),
  }), COMMANDES33);
  if (r.commandes) throw new Error('commandes après « J’ai terminé » : ' + r.commandes);
  if (!/Correction terminée à \d{2} h \d{2}/.test(r.avis) || r.rouvrir) throw new Error('avis : ' + JSON.stringify(r));
  if (/juste|faux|réussi/i.test(r.avis)) throw new Error('verdict après « J’ai terminé » : ' + r.avis);
  if (!(await etapes33())[2].fait) throw new Error('pastille 3');
  if (JSON.stringify(await jalons33()) !== avantJ) throw new Error('« J’ai terminé » a changé les jalons (ils se lisent en continu)');
  await monter33(true); await ouvrir33('tournee');
  if (await page33.$(`#boost33 ${'[data-clic-point]'}`)) throw new Error('rouvert à la reconnexion');
  // Pour la suite des cas, qui travaillent au temps 2 : on retire la marque à la main.
  await page33.evaluate(() => { window.__b33.db.transport['boost-ent33'].tournee.termine = null; });
  await rafraichir33();
});

await v('ENT-3.3 : les options des deux temps n’existent qu’en ENT-3.3 — ENT-3.1 et ENT-3.2 gardent leur vue', async () => {
  const r = await page33.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    const E31 = await import('/contenus/boost-tournee.js');
    const E32 = await import('/contenus/boost-ent32.js');
    const E33 = await import('/contenus/boost-ent33.js');
    // Le plan, comme le passe l'environnement d'entreprise (ENT-3.3 le porte déjà dans sa tournée).
    const dessine = (T, P) => creerTournee(Object.assign({ plan: P }, T)).html({}, { db: {} });
    const marques = (h) => ({ etapes: h.includes('data-tour-etapes'), barre: h.includes('data-gr-barre'), etiq: h.includes('data-tour-etiquettes'),
      readonly: /\breadonly\b/.test(h), terminer: h.includes('data-tour-terminer') });
    return { e31: marques(dessine(E31.TOURNEE, E31.PLAN)), e32: marques(dessine(E32.TOURNEE, E32.PLAN)),
      e32i: marques(dessine(E32.TOURNEE_IMPREVU, E32.PLAN)), e33: marques(dessine(E33.TOURNEE)) };
  });
  // ENT-3.1 a la feuille « comme un tableur » depuis le chantier F (barre de formule, en lecture tant
  // qu'aucune cellule n'est choisie) : seules les options des deux temps lui sont étrangères.
  if (r.e31.etapes || r.e31.etiq || r.e31.terminer || !r.e31.barre) throw new Error('e31 : ' + JSON.stringify(r.e31));
  // ENT-3.2 aussi a la feuille « comme un tableur » depuis le chantier F (et des onglets, pas des pastilles).
  for (const k of ['e32', 'e32i']) if (r[k].etapes || r[k].terminer || !r[k].barre) throw new Error(k + ' : ' + JSON.stringify(r[k]));
  if (!r.e33.etapes || !r.e33.barre || !r.e33.etiq || !r.e33.readonly) throw new Error('ENT-3.3 : ' + JSON.stringify(r.e33));
});

await v('ENT-3.3 : le mail d’Inès regroupe les six lignes en trois blocs, annonce les deux temps, et une réponse recopiée reste juste', async () => {
  const t = await page33.evaluate(() => window.__b33.db.mails.find((x) => x.fromMail === 'ines.livraison@boost.example' && !x.declenche).text);
  for (const b of ['LE RAPPEL', 'LES COMMANDES', 'CE QUE J’AI FAIT', 'CE QUE J’ATTENDS DE TOI', '1. La charge', '2. Le train', '3. Le créneau',
    'En deux temps', 'verrouillées']) {
    if (!t.includes(b)) throw new Error('bloc manquant : ' + b);
  }
  const bloc = (a, z) => t.slice(t.indexOf(a), z ? t.indexOf(z) : undefined);
  const charge = bloc('1. La charge', '2. Le train'), train = bloc('2. Le train', '3. Le créneau'), cren = bloc('3. Le créneau', 'Dès que ta réponse');
  if (!/Charge utile :/.test(charge) || !/Poids chargé :/.test(charge)) throw new Error('bloc charge : ' + charge);
  if (!/Train de 16 h 15 :/.test(train) || !/Arrivée à la gare :/.test(train)) throw new Error('bloc train : ' + train);
  if (!/Créneau de la Pâtisserie Arnaud :/.test(cren) || !/Arrivée à la Pâtisserie Arnaud :/.test(cren)) throw new Error('bloc créneau : ' + cren);
  const modele = [...charge.split('\n'), ...train.split('\n'), ...cren.split('\n')].filter((l) => /:/.test(l));
  const rempli = modele.map((l) => l.replace(/\(respectée ou dépassée\)/, 'dépassée').replace(/\(attrapé ou manqué\)/, 'attrapé')
    .replace(/\(tenu ou raté\)/, 'raté').replace('Poids chargé : (en kg)', 'Poids chargé : 218 kg')
    .replace('Arrivée à la Pâtisserie Arnaud : (l’heure)', 'Arrivée à la Pâtisserie Arnaud : 15 h 40')
    .replace('Arrivée à la gare : (l’heure)', 'Arrivée à la gare : 15 h 59')).join('\n');
  await oublierReponses33();
  await repondre33(rempli);
  const j = await jalons33();
  await oublierReponses33();
  if (j.contraintes !== 'ok' || j.preuves !== 'ok') throw new Error('réponse recopiée dans l’ordre du mail : ' + JSON.stringify(j) + '\n' + rempli);
});

await v('ENT-3.3 : l’accueil annonce quatre étapes — lire, contrôler, répondre, corriger', async () => {
  const e = await page33.evaluate(async () => (await import('/contenus/boost-ent33.js')).ACCUEIL.etapes.map((x) => x[0]));
  if (e.join('|') !== 'Lire le message d’Inès|Contrôler|Répondre|Corriger') throw new Error(e.join('|'));
});

// Nettoyage : les cas suivants repartent de la tournée d'Inès, sans formules, sans message envoyé.
await page33.evaluate(() => { const t = window.__b33.db.transport['boost-ent33'].tournee; if (t.grille) t.grille.cases = {}; });
await rafraichir33();

await v('ENT-3.3 : rien à l’écran ne donne le diagnostic — ni verdict, ni les 218 kg ; la feuille d’Inès affiche ses 166 kg', async () => {
  const r = await page33.evaluate(() => {
    const h = document.querySelector('#boost33 .ent-main');
    return { txt: h.innerText.replace(/\s+/g, ' '), trop: h.querySelectorAll('.tour-jauge.trop').length,
      crit: h.querySelectorAll('.pastille.crit, .pastille.ok').length,
      verifier: !!h.querySelector('[data-gr-verifier]'), b11: h.querySelector('[data-gr-res="B11"]').textContent.trim() };
  });
  const verdict = /dépassée|manqué|raté|en retard|respectée|tenu\b|attrapé/i;
  if (verdict.test(r.txt)) throw new Error('un verdict est lisible : ' + (r.txt.match(verdict) || [])[0]);
  if (r.trop || r.crit) throw new Error('jauge ou pastille d’alerte visible : ' + JSON.stringify(r));
  // Pas de bouton « Vérifier » : il montrerait la formule fausse en rouge (décision de Tristan, 03/10).
  if (r.verifier) throw new Error('la feuille d’Inès a un bouton « Vérifier »');
  if (/\b218\b/.test(r.txt)) throw new Error('le vrai poids chargé est donné à l’écran');
  if (r.b11 !== '166') throw new Error('la feuille d’Inès devrait afficher 166 kg : ' + r.b11);
  if (!/190/.test(r.txt)) throw new Error('la limite de 190 kg doit rester lisible');
});

await v('ENT-3.3 : le jalon « formule » — en attente sur la feuille d’Inès, ok une fois corrigée, ko si mal corrigée, et la tournée ne la répare pas', async () => {
  const st = async () => (await jalons33()).formule;
  const cases = (c) => page33.evaluate((c) => { window.__b33.db.transport['boost-ent33'].tournee.grille.cases = c; }, c);
  await cases({});
  if (await st() !== 'attente') throw new Error('formule d’Inès intacte : ' + await st());
  await cases({ B11: '=SOMME(B2:B8)' });
  if (await st() !== 'ok') throw new Error('formule corrigée : ' + await st());
  await cases({ B11: '=SOMME(B2:B6)' });
  if (await st() !== 'ko') throw new Error('mal corrigée : ' + await st());
  await cases({ B11: '218' });
  if (await st() !== 'ko') throw new Error('nombre tapé à la main : ' + await st());
  // Réparer la tournée (7 arrêts, Cave à quai) ne répare pas la formule : elle oublie toujours la 7e ligne.
  await poser33(BONNE33, ['c5']);
  await cases({ B11: '=SOMME(B2:B7)' });
  if (await st() === 'ok') throw new Error('la formule d’Inès validée sur la tournée réparée');
  await poser33(INES33.ordre, INES33.quai);
  await cases({});
});

await v('ENT-3.3 : la tournée d’Inès laissée telle quelle ne vaut AUCUN jalon de réparation', async () => {
  const j = await jalons33();
  const faits = REPARATION.filter((k) => j[k] === 'ok');
  if (faits.length) throw new Error('inaction récompensée : ' + faits.join(', '));
  if (j.charge !== 'ko') throw new Error('charge : ' + j.charge);
});

await v('ENT-3.3 : une modification de l’élève survit au changement d’écran et à la reconnexion', async () => {
  await immobile33();
  await page33.click(`${z33} [data-clic-point="c6"]`, { force: true });   // retire la Pâtisserie
  await page33.waitForTimeout(80);
  let e = await tournee33();
  if (e.ordre.includes('c6')) throw new Error('le clic n’a pas retiré la Pâtisserie : ' + e.ordre);
  const avant = JSON.stringify([e.ordre, e.quai, e.amorce]);
  await ouvrir33('mail');
  await ouvrir33('tournee');
  e = await tournee33();
  if (JSON.stringify([e.ordre, e.quai, e.amorce]) !== avant) throw new Error('le changement d’écran a reposé la tournée d’Inès');
  await monter33(true);
  await ouvrir33('tournee');
  e = await tournee33();
  if (JSON.stringify([e.ordre, e.quai, e.amorce]) !== avant) throw new Error('la reconnexion a reposé la tournée d’Inès : ' + JSON.stringify(e.ordre));
});

await v('ENT-3.3 : « Retrouver la tournée de départ » remet celle d’Inès, qui ne vaut toujours rien', async () => {
  const sel = '#boost33 [data-tour-raz]';
  await page33.click(sel);
  await page33.click(sel);
  const e = await tournee33();
  if (e.ordre.join() !== INES33.ordre.join() || e.quai.join() !== 'c2') throw new Error('tournée : ' + JSON.stringify(e));
  const j = await jalons33();
  if (REPARATION.some((k) => j[k] === 'ok')) throw new Error('jalons : ' + JSON.stringify(j));
});

await v('ENT-3.3 : D1 — la réponse juste passe ; accuser le train (leurre), une ligne au choix ou absente ne passe pas', async () => {
  const essai = async (texte) => { await oublierReponses33(); if (texte != null) await repondre33(texte); return (await jalons33()).contraintes; };
  if ((await essai(null)) === 'ok') throw new Error('aucune réponse validée');
  if ((await essai(JUSTE33)) !== 'ok') throw new Error('la réponse juste est refusée');
  const tout = JUSTE33.replace('Train de 16 h 15 : attrapé', 'Train de 16 h 15 : manqué');
  if ((await essai(tout)) === 'ok') throw new Error('« tout accuser » est validé');
  const choix = JUSTE33.replace('Charge utile : dépassée', 'Charge utile : (respectée ou dépassée)');
  if ((await essai(choix)) === 'ok') throw new Error('une ligne laissée au choix est validée');
  const oubli = JUSTE33.replace('Créneau de la Pâtisserie Arnaud : raté\n', '');
  if ((await essai(oubli)) === 'ok') throw new Error('une ligne absente est validée');
  const rien = JUSTE33.replace('Charge utile : dépassée', 'Charge utile : respectée');
  if ((await essai(rien)) === 'ok') throw new Error('la surcharge non vue est validée');
  // Autres écritures justes : négations, majuscules, sans accents.
  const libre = 'charge utile : non respectée, 218 > 190\nTRAIN DE 16 H 15 : pas manqué\ncreneau de patisserie arnaud : en retard\n'
    + 'Poids chargé : 218, pour une charge utile de 190';
  if ((await essai(libre)) !== 'ok') throw new Error('une écriture libre et juste est refusée');
});

await v('ENT-3.3 : D2 — les chiffres justes passent sous plusieurs écritures ; des chiffres faux non', async () => {
  const essai = async (p, c, g) => { await oublierReponses33(); await repondre33(`Poids chargé : ${p}\nArrivée à la Pâtisserie Arnaud : ${c}\nArrivée à la gare : ${g}`); return (await jalons33()).preuves; };
  for (const [p, c, g] of [['218 kg', '15 h 40', '15 h 59'], ['230 - 12 = 218', '15h40', '15:59'], ['218', '15 h 39', '15h58'], ['218 kg (max 190)', '940', '959']]) {
    if ((await essai(p, c, g)) !== 'ok') throw new Error('refusé : ' + [p, c, g].join(' / '));
  }
  // 166 : le chiffre de la feuille d'Inès, sa formule fausse non vue.
  for (const [p, c, g] of [['166', '15 h 40', '15 h 59'], ['190', '15 h 40', '15 h 59'], ['218', '15 h 05', '15 h 59'], ['218', '15 h 40', '16 h 15'], ['230', '15 h 40', '15 h 59']]) {
    if ((await essai(p, c, g)) === 'ok') throw new Error('accepté à tort : ' + [p, c, g].join(' / '));
  }
});

await v('ENT-3.3 : la réponse envoyée depuis la messagerie, comme l’élève, valide le diagnostic', async () => {
  await oublierReponses33();
  await ouvrir33('mail');
  const id = await page33.evaluate(() => window.__b33.db.mails.find((m) => m.fromMail === 'ines.livraison@boost.example').id);
  await page33.click(`#boost33 [data-mail="${id}"]`);
  await page33.click('#boost33 [data-repondre]');
  await page33.fill('#boost33 #repT', JUSTE33);
  await page33.click('#boost33 #formRep button[type="submit"]');
  await page33.waitForTimeout(80);
  const j = await jalons33();
  if (j.contraintes !== 'ok' || j.preuves !== 'ok') throw new Error('diagnostic : ' + JSON.stringify(j));
});

await v('ENT-3.3 : réparations — la bonne vaut les quatre ; la Mercerie à quai, ou deux commandes à quai, ne valent pas la charge', async () => {
  await poser33(BONNE33, ['c5']);
  let j = await jalons33();
  for (const k of REPARATION) if (j[k] !== 'ok') throw new Error('bonne réparation, ' + k + ' : ' + j[k]);
  // La tournée d'Inès réordonnée, Mercerie Pellet toujours à quai : surchargée, rien ne passe.
  await poser33(['c6', 'c4', 'c3', 'c8', 'c1', 'c7', 'c5'], ['c2']);
  j = await jalons33();
  for (const k of REPARATION) if (j[k] === 'ok') throw new Error('Mercerie à quai, ' + k + ' validé');
  // Deux commandes à quai (Cave et Mercerie) : la charge tient, mais ce n'est pas la bonne décision.
  await poser33(['c6', 'c7', 'c8', 'c3', 'c4', 'c1'], ['c2', 'c5']);
  j = await jalons33();
  if (j.charge === 'ok' || j.trajet === 'ok') throw new Error('deux commandes à quai validées : ' + JSON.stringify(j));
});

await v('ENT-3.3 : une réparation qui tient tout mais roule trop (+16 %) ne perd que le jalon « trajet »', async () => {
  await poser33(LONGUE33, ['c5']);
  const j = await jalons33();
  if (j.charge !== 'ok' || j.horaire !== 'ok' || j.creneau !== 'ok') throw new Error('la réparation longue devrait tenir tout : ' + JSON.stringify(j));
  if (j.trajet !== 'ko') throw new Error('trajet : ' + j.trajet);
});

await v('ENT-3.3 : le créneau et le train ne se jugent pas sans le départ et la gare', async () => {
  await poser33(BONNE33, ['c5'], { depart: false, arrivee: false });
  let j = await jalons33();
  if (j.creneau === 'ok' || j.horaire === 'ok' || j.trajet === 'ok') throw new Error('validé sans départ ni gare : ' + JSON.stringify(j));
  await poser33(BONNE33, ['c5'], { depart: true, arrivee: false });
  j = await jalons33();
  if (j.creneau !== 'ok') throw new Error('créneau avec le départ posé : ' + j.creneau);
  if (j.horaire === 'ok' || j.trajet === 'ok') throw new Error('train validé sans la gare : ' + JSON.stringify(j));
});

await v('ENT-3.3 : ENT-3.2 et ENT-3.3 ne s’écrasent pas — tournée et message cloisonnés dans la base commune', async () => {
  const ids = await page33.evaluate(async () => {
    const [a, b] = await Promise.all([import('/contenus/boost-ent32.js'), import('/contenus/boost-ent33.js')]);
    return [a.TRANSPORT_ID, b.TRANSPORT_ID, a.VOLET.id, b.VOLET.id];
  });
  if (ids[0] === ids[1] || ids[2] === ids[3]) throw new Error('clés partagées : ' + ids.join());
  const k = await page33.evaluate(() => Object.keys(window.__b33.db.transport || {}));
  if (k.join() !== 'boost-ent33') throw new Error('clés de la base : ' + k.join());
});

await v('ENT-3.3 : aucune erreur de console sur tout le parcours', async () => {
  if (erreurs33.length) throw new Error([...new Set(erreurs33)].slice(0, 3).join(' | '));
});
await ctx33.close();

/* ===================================================================================== */
/* Chantier D, lot 1 — la feuille de calcul moins guidée (moteur, 03/10/2026)             */
/*                                                                                        */
/* Brief `docs/briefs/ENT-3.x-feuille-moins-guidee.md`. Le moteur se garde sur la PAGE      */
/* D'ESSAI `outils/essai-feuille.html` (celle que Tristan valide en cliquant) : la journée */
/* y est provisoire, mais les trois blocs et leurs adresses sont ceux de la cible.         */
/* Les valeurs attendues sont écrites à la main : 14 h 30, Ribot 34 kg, 178 kg chargés…    */
/* Le service par colis se garde à part, sur le bilan du noyau, sans dessin.              */
/* ===================================================================================== */

const ctxF = await nav.newContext();
const pageF = await ctxF.newPage();
pageF.setDefaultTimeout(8000);
const erreursF = [];
pageF.on('pageerror', (e) => erreursF.push('PAGEERROR: ' + e.message));
pageF.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursF.push('CONSOLE: ' + m.text()); });
// Une base neuve à chaque fois : celle de l'essai vit dans l'onglet (sessionStorage).
const ouvrirF = async (q = '') => {
  await pageF.goto('http://127.0.0.1:8099/outils/essai-feuille.html');
  await pageF.evaluate(() => sessionStorage.clear());
  await pageF.goto('http://127.0.0.1:8099/outils/essai-feuille.html' + q);
  await pageF.waitForSelector('[data-gr-verifier]');
};
const tourF = () => pageF.evaluate(() => JSON.parse(JSON.stringify(window.__essai.db.transport['essai-feuille'].tournee || {})));
// Les clics passent par les boutons du récapitulatif (le même chemin de code que la carte).
const construireF = (ordre) => pageF.evaluate((o) => {
  const clic = (s) => document.querySelector(s).click();
  clic('[data-bout="depart"]');
  o.forEach((id) => clic(`[data-reprendre="${id}"]`));
  clic('[data-bout="arrivee"]');
}, ordre);
const taperF = (ref, val) => pageF.fill(`[data-gr="${ref}"]`, val);
const celluleF = (ref) => pageF.evaluate((r) => document.querySelector(`[data-ref="${r}"]`).innerText.replace(/\s+/g, ' ').trim(), ref);
// Le résultat affiché à côté d'une formule (sans la pastille de correction).
const resF = async (ref) => (await pageF.textContent(`[data-gr-res="${ref}"]`)).trim();
const verifierF = async () => { await pageF.click('[data-gr-verifier]'); return (await tourF()).grille.juge; };
const POIDS_F = [18, 12, 34, 16, 52, 31, 29, 38];          // ordre du mail : c1 … c8
const ORDRE_F = ['c6', 'c7', 'c8', 'c3', 'c4', 'c1', 'c2']; // la Cave Teissier à quai
// La feuille entière remplie juste (le poids de l'Atelier Ribot peut être mal recopié).
const remplirF = async ({ ribot = '34' } = {}) => {
  for (const [r, x] of [['B2', '14:30'], ['B3', '14'], ['B4', '5'], ['B5', '190'], ['B6', '16:10'], ['B7', '15:00']]) await taperF(r, x);
  for (let i = 0; i < 8; i++) await taperF(`B${10 + i}`, i === 2 ? ribot : String(POIDS_F[i]));
  for (const [r, x] of [['B18', '=SOMME(B10:B17)'], ['B19', '=B18-B5'], ['B30', '=SOMME(B22:B29)'],
    ['B32', '=B31/B3*60'], ['B33', '=7*B4'], ['B34', '=B2+B32+B33'], ['B38', '=B2+B36/B3*60+B37*B4']]) await taperF(r, x);
};

await v('Feuille D : une erreur de lecture ne se paie qu’une fois — le total se juge sur les poids TAPÉS', async () => {
  await ouvrirF();
  await construireF(ORDRE_F);
  await remplirF({ ribot: '43' });                          // 43 au lieu de 34
  let j = await verifierF();
  const faux = Object.keys(j).filter((k) => j[k] !== 'ok');
  if (faux.join() !== 'B12') throw new Error('cases non justes : ' + JSON.stringify(j));
  // Le total vaut 239 (230 + 9) et il est juste ; une formule qui oublie une ligne est fausse.
  if (await resF('B18') !== '239') throw new Error('total : ' + await resF('B18'));
  if (await resF('B30') !== '187') throw new Error('poids chargé : ' + await resF('B30'));
  await taperF('B18', '=SOMME(B10:B16)');
  j = await verifierF();
  if (j.B18 !== 'valeur') throw new Error('total amputé jugé : ' + j.B18);
  // Le poids chargé tapé à la main, même juste, n'est pas une formule.
  await taperF('B18', '=SOMME(B10:B17)');
  await taperF('B30', '187');
  j = await verifierF();
  if (j.B30 !== 'pasFormule') throw new Error('poids chargé tapé à la main : ' + j.B30);
});

await v('Feuille D : une feuille vide ne rend aucune case juste (« données à remplir d’abord »)', async () => {
  await ouvrirF();
  await construireF(ORDRE_F);
  await taperF('B18', '=SOMME(B10:B17)');                   // vaut 0, la somme de rien
  await taperF('B30', '=SOMME(B22:B29)');
  const j = await verifierF();
  if (j.B18 !== 'attente' || j.B30 !== 'attente') throw new Error('feuille vide : ' + JSON.stringify(j));
  if (Object.values(j).some((x) => x === 'ok')) throw new Error('une case juste sur une feuille vide : ' + JSON.stringify(j));
  if (!(await pageF.textContent('[data-ref="B18"]')).includes('données à remplir d’abord')) throw new Error('pastille absente');
});

await v('Feuille D : le tableau « Tournée » suit l’ordre, recopie les poids tapés, et rien ne bouge en dessous', async () => {
  await ouvrirF();
  await construireF(ORDRE_F);
  // Rien de tapé : les noms sont là, les poids recopiés sont vides, et ne se modifient pas.
  if (await celluleF('A22') !== 'Arrêt 1 · Pâtisserie Arnaud' || await celluleF('B22') !== '') throw new Error('ligne 22 : ' + await celluleF('A22') + ' | ' + await celluleF('B22'));
  if (await pageF.$('[data-gr="B22"]')) throw new Error('une cellule recopiée se modifie');
  await taperF('B15', '31');                               // le poids de la Pâtisserie Arnaud (c6)
  if (await celluleF('B22') !== '31') throw new Error('recopie à la frappe : ' + await celluleF('B22'));
  await remplirF();
  const avant = await pageF.inputValue('[data-gr="B30"]');
  // On descend la Pâtisserie : elle passe en ligne 23, la Papeterie remonte en 22.
  await pageF.click('[data-bas="0"]');
  if (await celluleF('A22') !== 'Arrêt 1 · Papeterie Bonnet' || await celluleF('B22') !== '29') throw new Error('réordonné : ' + await celluleF('A22'));
  if (await celluleF('A23') !== 'Arrêt 2 · Pâtisserie Arnaud') throw new Error('ligne 23 : ' + await celluleF('A23'));
  // On retire la Papeterie : 6 arrêts, deux lignes vides, et la ligne 30 est TOUJOURS le poids chargé.
  await pageF.click('[data-quai="c7"]');
  if (await celluleF('A28') !== '' || await celluleF('A29') !== '') throw new Error('lignes réservées : ' + await celluleF('A28'));
  if (!(await celluleF('A30')).startsWith('Poids chargé') || !(await celluleF('A34')).startsWith('Heure d’arrivée à la gare')) throw new Error('les lignes du dessous ont bougé');
  if (await pageF.inputValue('[data-gr="B30"]') !== avant) throw new Error('formule déplacée');
  if (await resF('B30') !== '149') throw new Error('poids chargé recalculé : ' + await resF('B30'));   // 178 − 29
});

await v('Feuille D : le « ? » — format seul sur une heure à taper, méthode sur une formule ; clavier ; rien d’enregistré', async () => {
  await ouvrirF();
  await construireF(ORDRE_F);
  // Décision de Tristan (03/10) : sur une heure À TAPER (lignes 2, 6, 7), le format seulement, jamais
  // l'heure du jour ; sur chaque formule avec des calculs, l'aide de méthode.
  const lignesAide = await pageF.$$eval('[data-gr-aide]', (b) => b.map((x) => +x.dataset.grAide + 1));
  if (lignesAide.join() !== '2,6,7,18,19,30,32,33,34,38') throw new Error('« ? » posés sur les lignes ' + lignesAide.join());
  const aideDe = (ligne) => pageF.evaluate((i) => document.getElementById(document.querySelector(`[data-gr-aide="${i}"]`).getAttribute('aria-controls')).textContent, ligne - 1);
  for (const l of [2, 6, 7]) {
    const t = await aideDe(l);
    if (!t.includes('9:05') || /14:30|16:10|15:00|14 h 30|16 h 10|15 h 00/.test(t)) throw new Error(`ligne ${l} : ${t}`);
  }
  if (!(await aideDe(18)).includes('SOMME') || !(await aideDe(32)).includes('× 60')) throw new Error('aide de méthode absente');
  if (!(await aideDe(34)).includes('temps aux arrêts') || !(await aideDe(34)).includes('9:05')) throw new Error('ligne 34 : ' + await aideDe(34));
  // Plié : rien de visible, ni sous les libellés, ni en liste sous la feuille.
  const id = await pageF.getAttribute('[data-gr-aide="33"]', 'aria-controls');
  if (await pageF.isVisible('#' + id)) throw new Error('aide visible avant le clic');
  if (await pageF.$('.gr-aides')) throw new Error('liste d’aides sous la feuille');
  const base = JSON.stringify(await pageF.evaluate(() => window.__essai.db));
  await pageF.click('[data-gr-aide="33"]');
  if (!(await pageF.isVisible('#' + id)) || await pageF.getAttribute('[data-gr-aide="33"]', 'aria-expanded') !== 'true') throw new Error('aide non ouverte');
  if (!(await pageF.textContent('#' + id)).includes('9:05')) throw new Error('texte : ' + await pageF.textContent('#' + id));
  await pageF.focus('[data-gr-aide="1"]');
  await pageF.keyboard.press('Enter');
  if (await pageF.getAttribute('[data-gr-aide="1"]', 'aria-expanded') !== 'true') throw new Error('Entrée n’ouvre pas');
  if (JSON.stringify(await pageF.evaluate(() => window.__essai.db)) !== base) throw new Error('le « ? » a écrit dans la base');
  // Pendant l'écriture d'une formule, cliquer le « ? » n'insère pas la cellule où il est posé.
  await pageF.click('[data-gr="B19"]');
  await pageF.fill('[data-gr="B19"]', '=');
  await pageF.click('[data-gr-aide="37"]');
  if (await pageF.inputValue('[data-gr="B19"]') !== '=') throw new Error('le « ? » a inséré : ' + await pageF.inputValue('[data-gr="B19"]'));
});

await v('Feuille D : la feuille d’Inès — formules pré-remplies, jugées, absentes de la base, gardées par « Recommencer »', async () => {
  await ouvrirF('?ines');
  await construireF(ORDRE_F);
  if (await pageF.inputValue('[data-gr="B34"]') !== '=B2+B32') throw new Error('formule d’Inès : ' + await pageF.inputValue('[data-gr="B34"]'));
  const j = await verifierF();
  const faux = Object.keys(j).filter((k) => j[k] !== 'ok');
  if (faux.join() !== 'B34') throw new Error('la seule fausse doit être B34 : ' + JSON.stringify(j));
  if (Object.keys((await tourF()).grille.cases || {}).length) throw new Error('le pré-rempli est écrit dans la base');
  await pageF.click('[data-tour-raz]'); await pageF.click('[data-tour-raz]');
  if ((await tourF()).ordre.length) throw new Error('tournée non remise à zéro');
  if (await pageF.inputValue('[data-gr="B34"]') !== '=B2+B32') throw new Error('« Recommencer » a effacé la formule');
  // Réparée par l'élève : elle s'enregistre, et elle est juste.
  await construireF(ORDRE_F);
  await taperF('B34', '=B2+B32+B33');
  const j2 = await verifierF();
  if (j2.B34 !== 'ok' || (await tourF()).grille.cases.B34 !== '=B2+B32+B33') throw new Error('réparation : ' + j2.B34);
  // Le « ↺ » (décision de Tristan, 03/10) : caché tant que la case est celle d'Inès, visible dès
  // qu'elle change, et il remet la formule d'origine en la retirant de la base.
  if (!(await pageF.isVisible('[data-gr-origine="B34"]'))) throw new Error('« ↺ » absent sur une case modifiée');
  if (await pageF.isVisible('[data-gr-origine="B32"]')) throw new Error('« ↺ » sur une case intacte');
  await pageF.click('[data-gr-origine="B34"]');
  if (await pageF.inputValue('[data-gr="B34"]') !== '=B2+B32') throw new Error('« ↺ » : ' + await pageF.inputValue('[data-gr="B34"]'));
  if ('B34' in ((await tourF()).grille.cases || {})) throw new Error('« ↺ » laisse la saisie dans la base');
  if (await pageF.isVisible('[data-gr-origine="B34"]')) throw new Error('« ↺ » encore visible');
});

await v('Feuille D : sans couleurs — ni jaune ni violet, cellules à remplir repérées par une bordure, sans aplat', async () => {
  await ouvrirF();
  if (!(await pageF.$('.gr-legende')) || !(await pageF.$('.gr-t-resultat'))) throw new Error('la feuille colorée a perdu ses couleurs');
  await ouvrirF('?sobre');
  if (await pageF.$('.gr-legende') || await pageF.$('.gr-t-etape, .gr-t-resultat, .gr-t-contrainte')) throw new Error('couleurs encore là');
  const s = await pageF.evaluate(() => { const c = getComputedStyle(document.querySelector('.gr-saisie')); return [c.backgroundColor, c.boxShadow]; });
  if (s[0] !== 'rgba(0, 0, 0, 0)' || s[1] === 'none') throw new Error('cellule à remplir : ' + s.join(' / '));
  const trait = await pageF.evaluate(() => getComputedStyle(document.querySelector('.gr-contraintes .tour-jauge-repere')).borderLeftWidth);
  if (trait !== '1px') throw new Error('trait violet des contraintes : ' + trait);
});

await v('Feuille D : le brouillon lit la feuille, n’est jamais jugé, et la feuille ne le lit pas', async () => {
  await ouvrirF('?brouillon');
  await construireF(ORDRE_F);
  await remplirF();
  await pageF.fill('[data-grb="D1"]', '=B31/B3');
  await pageF.fill('[data-grb="D2"]', '=D1*60');
  const km = Number((await celluleF('B31')).replace(',', '.'));
  const d2 = Number((await pageF.textContent('[data-grb-res="D2"]')).replace(',', '.'));
  if (!(km > 5) || Math.abs(d2 - km / 14 * 60) > 0.01) throw new Error(`brouillon : ${d2} pour ${km} km`);
  if ((await tourF()).grille.brouillon.D2 !== '=D1*60') throw new Error('brouillon non enregistré');
  // Une formule de la feuille qui cite le brouillon ne reçoit pas sa valeur.
  await taperF('B33', '=D2');
  if ((await celluleF('B33')).endsWith(String(Math.round(d2 * 10) / 10).replace('.', ','))) throw new Error('la feuille lit le brouillon : ' + await celluleF('B33'));
  const j = await verifierF();
  if (Object.keys(j).some((k) => k.startsWith('D') || k.startsWith('E'))) throw new Error('brouillon jugé : ' + Object.keys(j));
  if (j.B33 === 'ok') throw new Error('=D2 jugé juste');
  // À la souris : depuis le brouillon on désigne la feuille ; depuis la feuille, pas le brouillon.
  await pageF.click('[data-grb="E1"]');
  await pageF.fill('[data-grb="E1"]', '=');
  await pageF.locator('[data-ref="B31"]').scrollIntoViewIfNeeded();
  const b31 = await pageF.locator('[data-ref="B31"]').boundingBox();
  await pageF.mouse.click(b31.x + 20, b31.y + b31.height / 2);
  if (await pageF.inputValue('[data-grb="E1"]') !== '=B31') throw new Error('désigner la feuille depuis le brouillon : ' + await pageF.inputValue('[data-grb="E1"]'));
  await pageF.click('[data-gr="B33"]');
  await pageF.fill('[data-gr="B33"]', '=');
  await pageF.locator('[data-ref="D1"]').scrollIntoViewIfNeeded();
  const d1 = await pageF.locator('[data-ref="D1"]').boundingBox();
  await pageF.mouse.click(d1.x + 4, d1.y + 4);
  if ((await pageF.inputValue('[data-gr="B33"]')).includes('D1')) throw new Error('la feuille a désigné le brouillon');
});

await v('Feuille D : le temps de service par colis (base + par colis) pèse sur les arrivées et le train', async () => {
  const r = await pageF.evaluate(async () => {
    const { creerTournee } = await import('/core/types/tournee.js');
    // Tous les points au même endroit : distance nulle, tout le temps est du service.
    const plan = { depart: { id: 'D', nom: 'Dépôt', x: 0, y: 0 }, arrivee: { id: 'A', nom: 'Arrivée', x: 0, y: 0 },
      points: [{ id: 'p1', nom: 'Un', x: 0, y: 0, colis: 3 }, { id: 'p2', nom: 'Deux', x: 0, y: 0, colis: 5 }] };
    const etat = { ordre: ['p1', 'p2'], quai: [], depart: 1, arrivee: 1 };
    const fixe = creerTournee({ plan, horaire: { depart: 540, limite: 600, vitesse: 12, service: 6 } }).bilan(etat);
    const colis = creerTournee({ plan, horaire: { depart: 540, limite: 555, vitesse: 12, service: { base: 4, parColis: 1 } } }).bilan(etat);
    return { fixe: [fixe.arrivees.p2, fixe.minutes, fixe.service], colis: [colis.arrivees.p1, colis.arrivees.p2, colis.minutes, colis.service, colis.enRetard] };
  });
  // Fixe : 6 + 6. Par colis : (4 + 3) puis (4 + 5) = 16 min, au-delà de la limite de 15.
  if (r.fixe.join() !== '546,12,12') throw new Error('service fixe : ' + r.fixe.join());
  if (r.colis.join() !== '540,547,16,16,true') throw new Error('service par colis : ' + r.colis.join());
});

await v('Feuille D : aucune erreur de console sur la page d’essai', async () => {
  if (erreursF.length) throw new Error([...new Set(erreursF)].slice(0, 3).join(' | '));
});
await ctxF.close();

}
