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
const CASES31 = { c1: 'D2', c2: 'C2', c3: 'C4', c4: 'B3', c5: 'F3', c6: 'E1', c7: 'D4' };
// Les sept quartiers attendus, ÉCRITS ICI à la main (menus déroulants du repérage, 05/10).
const QUARTIERS31 = { c1: 'Écusson', c2: 'Jardins de la Fontaine', c3: 'Ville Active',
  c4: 'Saint-Césaire', c5: 'Courbessac', c6: 'Grézan', c7: 'Costières' };
// Choisit les bons quartiers dans les menus d'une zone, sauf pour les points de `sauf`.
const choisirQuartiersBo = async (z, sauf = []) => {
  for (const [id, q] of Object.entries(QUARTIERS31)) {
    if (sauf.includes(id)) continue;
    await pageBo.selectOption(`${z} .plan-quartier[data-quartier="${id}"]`, q);
  }
};
// Remplit la feuille de calcul d'une tournée à six arrêts et la fait vérifier : les six
// formules attendues d'un élève (voir le cas « les formules justes sont acceptées »).
const remplirFeuilleBo = async () => {
  const formules = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
    B18: '13:00', B19: '=B18+B14+B17' };
  for (const [ref, f] of Object.entries(formules)) {
    await pageBo.fill(`${zBo} [data-gr="${ref}"]`, f);
    await pageBo.waitForTimeout(40);
  }
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
};
// Le meilleur ordre de passage, et ce qu'il donne. Valeurs obtenues par énumération des
// 720 ordres (voir `claude/prepalog-boost-c24-c26.md`), pas estimées.
const ORDRE31 = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7'];

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

await v('ENT-3.1 : sept clients, adresses réelles sans numéro de rue, quartiers cachés', async () => {
  await ouvrirBo('plan');
  const adr = await pageBo.$$eval(`${zBo} .plan-table tbody tr td:nth-child(2)`, (e) => e.map((x) => x.textContent.trim()));
  if (adr.length !== 7) throw new Error(adr.length + ' lignes au lieu de 7');
  // Pas de numéro de rue : la rue est réelle, le commerce est inventé. Un numéro désignerait
  // un vrai bâtiment.
  adr.forEach((a) => {
    if (/^\s*\d/.test(a)) throw new Error('numéro de rue dans « ' + a + ' »');
    if (!/30\d{3} Nîmes$/.test(a)) throw new Error('adresse mal formée : ' + a);
  });
  if (!adr.some((a) => /Mascard/.test(a)) || !adr.some((a) => /Bouvine/.test(a))) {
    throw new Error('les deux rues vérifiées en source officielle ont disparu');
  }
  // Temps 1 : le plan est muet et les quartiers ne sont pas donnés.
  // Depuis le 05/10 le quartier est un MENU : au temps 1 aucun n'est choisi.
  const zones = await pageBo.$$eval(`${zBo} .plan-quartier`, (e) => e.map((x) => x.value));
  if (zones.length !== 7 || zones.some((z) => z !== '')) throw new Error('quartiers choisis au temps 1 : ' + zones.join('|'));
  const svg = await pageBo.textContent(`${zBo} .plan-svg`);
  if (/Comptoir des Halles/.test(svg)) throw new Error('les noms des clients sont sur le plan muet');
  // Le décor nomme les quartiers, mais aucun ne porte le nom d'un client : lire le décor ne
  // donne pas la réponse.
  if (!/Écusson/.test(svg) || !/Costières/.test(svg)) throw new Error('le décor a perdu ses quartiers');
  if (/Route d'Avignon/.test(svg)) throw new Error('le décor dit encore « Route d’Avignon » au lieu de Grézan');
});

await v('ENT-3.1 : aucun point du plan ne se pose sur une ligne du quadrillage', async () => {
  // Tristan, 05/10 : *« le point 3 est en plein sur le quadrillage »*. La Pointe Sud est à
  // x = 200, exactement entre les colonnes B et C : la bonne case est C4 par arrondi, B4 pour
  // l'œil, et l'élève qui lit B4 est jugé faux sans s'être trompé. Une case ne se juge que si
  // le rond du point (rayon 12) tient ENTIÈREMENT dans une cellule.
  //
  // Défaut connu et pas encore corrigé : déplacer un point change les kilomètres, donc le
  // calibrage entier (22,1 km, 15 h 27…). La liste ci-dessous est FIGÉE : elle ne doit jamais
  // s'allonger, et un nouveau point ou un nouveau plan doit passer sans exception.
  const FIGES = ['c1', 'c3', 'c5', 'c6'];
  const r = await pageBo.evaluate(async () => {
    const S = await import('/contenus/boost-tournee.js');
    const P = S.PLAN;
    const L = P.largeur, H = P.hauteur;
    const nc = String(P.grille.colonnes).length, nl = P.grille.lignes;
    const proche = (v, pas, n) => {
      let d = Infinity;
      for (let i = 1; i < n; i++) d = Math.min(d, Math.abs(v - i * pas));
      return d;
    };
    return P.points.map((p) => ({
      id: String(p.id),
      d: Math.min(proche(p.x, L / nc, nc), proche(p.y, H / nl, nl)),
    }));
  });
  const trop = r.filter((x) => x.d < 12).map((x) => x.id);
  const nouveaux = trop.filter((id) => !FIGES.includes(id));
  if (nouveaux.length) throw new Error('point(s) à cheval sur le quadrillage : ' + nouveaux.join(', '));
  // Et la liste figée ne ment pas : si un point est corrigé, on le retire d'ici.
  const guéris = FIGES.filter((id) => !trop.includes(id));
  if (guéris.length) throw new Error('point(s) désormais bien placés, à retirer de la liste figée : ' + guéris.join(', '));
  // Le pire cas, exactement SUR une ligne, est interdit sans exception possible… sauf celui
  // que Tristan a trouvé et qui attend sa décision.
  const surLigne = r.filter((x) => x.d === 0).map((x) => x.id);
  if (surLigne.join(',') !== 'c3') throw new Error('points exactement sur une ligne : ' + surLigne.join(','));
});

await v('ENT-3.1 : l’entrepôt est au sud-ouest, et le décor ne double pas le noyau', async () => {
  const g = await pageBo.evaluate(() => {
    const svg = document.querySelector('#boost31 .plan-svg');
    const d = svg.querySelector('.plan-depart rect');
    return {
      x: +d.getAttribute('x') + 13, y: +d.getAttribute('y') + 13,
      departs: svg.querySelectorAll('.plan-depart').length,
      arrivees: svg.querySelectorAll('.plan-arrivee').length,
      traces: svg.querySelectorAll('.plan-trace').length,
      points: svg.querySelectorAll('.plan-pt').length,
      echelles: (svg.innerHTML.match(/1 km/g) || []).length,
    };
  });
  // Sud-ouest : moitié gauche du plan (600 de large), moitié basse (420 de haut). La maquette
  // le plaçait au nord-est, à l'opposé de son adresse réelle.
  if (!(g.x < 300 && g.y > 210)) throw new Error(`entrepôt en (${g.x},${g.y}) : pas au sud-ouest`);
  // Le quadrillage, les repères, le tracé, les points et l'échelle sont dessinés par le NOYAU.
  // Si le décor du contenu les redessinait, on les verrait en double.
  if (g.departs !== 1 || g.arrivees !== 1 || g.traces !== 1) throw new Error('repères en double dans le SVG');
  if (g.points !== 7) throw new Error(g.points + ' points dessinés');
  if (g.echelles !== 1) throw new Error(g.echelles + ' échelles « 1 km » : le décor en redessine une');
});

await v('ENT-3.1 : le plan porte trois repères nîmois, la voie ferrée et le nord', async () => {
  // Le premier décor aurait pu être celui de n'importe quelle ville moyenne. Un élève reconnaît
  // sa ville par ses monuments, ses axes structurants et son orientation — ce cas garde les
  // trois, et garde surtout que le décor ne reprend pas la couleur des points clients.
  const d = await pageBo.evaluate(() => {
    const svg = document.querySelector('#boost31 .plan-svg');
    const rail = svg.querySelector('.plan-rail');
    const [a, b] = (rail ? rail.dataset.rail : '0,0 0,0').split(' ')
      .map((p) => p.split(',').map(Number));
    // Distance de la gare à la droite du rail : la voie ferrée n'a de sens que si elle passe
    // par la gare. Produit vectoriel sur la longueur, pas d'à-peu-près à l'œil.
    const G = { x: 318, y: 255 };
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const ecart = Math.abs((G.x - a[0]) * dy - (G.y - a[1]) * dx) / Math.hypot(dx, dy);
    return {
      reperes: svg.querySelectorAll('.plan-reperes > g').length,
      nord: svg.querySelectorAll('.plan-nord').length,
      rails: svg.querySelectorAll('.plan-rail').length,
      ecart,
      texte: svg.textContent,
      // `--ardoise-fond`, c'est le bleu des clients. Le noyau le pose sur les sept points, et
      // sur eux seuls : si le décor le reprend pour ses quartiers, les pastilles disparaissent
      // dans le fond. C'était le défaut de la première version.
      bleus: (svg.innerHTML.match(/var\(--ardoise-fond\)/g) || []).length,
    };
  });
  if (d.reperes !== 3) throw new Error(d.reperes + ' repère(s) dessiné(s) au lieu de 3');
  ['Arènes', 'Maison Carrée', 'Tour Magne'].forEach((m) => {
    if (!d.texte.includes(m)) throw new Error('le repère « ' + m + ' » n’est pas nommé');
  });
  if (d.nord !== 1) throw new Error('pas de flèche du nord : l’élève ne peut pas raccrocher le plan en ligne');
  if (d.rails !== 1) throw new Error(d.rails + ' voie(s) ferrée(s)');
  if (!(d.ecart < 6)) throw new Error('la voie ferrée passe à ' + d.ecart.toFixed(1) + ' px de la gare');
  if (!/voie ferrée/.test(d.texte)) throw new Error('la voie ferrée n’est pas nommée');
  if (d.bleus !== 7) throw new Error(d.bleus + ' usages du bleu des clients au lieu de 7 : le décor leur fait concurrence');
});

await v('ENT-3.1 : le calibrage tient — une seule combinaison de clients possible', async () => {
  // La règle du projet est d'ÉNUMÉRER, pas d'estimer. 128 combinaisons et 720 ordres, calculés
  // ici à partir du contenu réel : si un poids ou une position change, ce test tombe.
  const r = await pageBo.evaluate(async () => {
    const B = await import('/contenus/boost.js');
    const { distanceKm } = await import('/core/types/plan.js');
    const P = B.DESTINATAIRES, V = B.VELO, PLAN = B.PLAN_NIMES;
    const combis = [];
    let sousEnsembles = 0;
    for (let m = 0; m < (1 << P.length); m++) {
      sousEnsembles++;
      const c = P.filter((_, i) => m & (1 << i));
      if (c.reduce((t, x) => t + x.kg, 0) <= V.chargeUtile) combis.push(c);
    }
    const maxn = Math.max(...combis.map((c) => c.length));
    const grandes = combis.filter((c) => c.length === maxn);
    // Les ordres de passage de la meilleure combinaison.
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) =>
      perms(a.slice(0, i).concat(a.slice(i + 1))).map((p) => [x].concat([p]).flat())));
    const c = grandes[0];
    let ok = 0, tot = 0, best = Infinity, bestOrdre = null;
    perms(c).forEach((p) => {
      const suite = [PLAN.depart].concat(p, [PLAN.arrivee]);
      let km = 0;
      for (let i = 1; i < suite.length; i++) km += distanceKm(PLAN, suite[i - 1], suite[i]);
      const arr = V.depart + km / V.vitesse * 60 + p.length * V.service;
      tot++;
      if (arr <= V.train) ok++;
      if (arr < best) { best = arr; bestOrdre = p.map((x) => x.id); }
    });
    return {
      total: P.reduce((t, x) => t + x.kg, 0), utile: V.chargeUtile,
      sousEnsembles, combis: combis.length, maxn, nGrandes: grandes.length,
      quai: P.filter((x) => !c.includes(x)).map((x) => x.id),
      poids: c.reduce((t, x) => t + x.kg, 0),
      ok, tot, best: Math.round(best), bestOrdre,
    };
  });
  // 128 sous-ensembles de sept clients, dont 115 tiennent dans les 180 kg. On énumère les
  // 128 — c'est la règle du projet : énumérer, pas estimer.
  if (r.sousEnsembles !== 128) throw new Error(r.sousEnsembles + ' sous-ensembles au lieu de 128');
  if (r.combis !== 115) throw new Error(r.combis + ' combinaisons tenables au lieu de 115');
  if (r.total !== 237) throw new Error('masse totale ' + r.total + ' kg au lieu de 237');
  if (r.maxn !== 6) throw new Error('on pourrait livrer ' + r.maxn + ' clients, pas 6');
  if (r.nGrandes !== 1) throw new Error(r.nGrandes + ' combinaisons de 6 clients : la réponse n’est plus unique');
  if (r.quai.join(',') !== 'c3') throw new Error('à quai : ' + r.quai.join(',') + ' au lieu de c3 (La Pointe Sud)');
  if (r.poids !== 179) throw new Error(r.poids + ' kg chargés au lieu de 179');
  if (r.tot !== 720) throw new Error(r.tot + ' ordres énumérés au lieu de 720');
  // La contrainte de temps doit mordre : si presque tous les ordres passaient, l'exercice
  // n'aurait plus d'intérêt ; si aucun ne passait, il serait infaisable.
  if (!(r.ok > 40 && r.ok < 300)) throw new Error(r.ok + '/720 ordres à l’heure : calibrage à revoir');
  if (r.best !== 15 * 60 + 27) throw new Error('meilleure arrivée à ' + r.best + ' min au lieu de 15 h 27');
  if (r.bestOrdre.join(',') !== 'c4,c2,c1,c6,c5,c7') throw new Error('meilleur ordre : ' + r.bestOrdre.join(','));
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
  // Cinq quartiers sur sept n'apparaissent ni dans un nom de rue ni dans une enseigne, et
  // aucun ne doit donc se lire ici. C'est ce test qui a attrapé « Épicerie Fontaine » et
  // « Caveau des Costières », deux commerces inventés qui donnaient la réponse dans leur nom.
  ['Écusson', 'Ville Active', 'Saint-Césaire', 'Costières']
    .forEach((q) => { if (new RegExp(q).test(t)) throw new Error('le quartier « ' + q + ' » est donné dans l’écran Clients'); });
  // Les trois autres SONT dans le nom de la rue — quai de la Fontaine, route de Courbessac,
  // rue de Grézan — et il n'y a rien à y faire : ces rues sont réelles et cohérentes avec la
  // position de leur point, les renommer serait mentir. Pour ces trois clients, le quartier
  // vient avec l'adresse ; la CASE du quadrillage reste à lire sur le plan, et c'est elle
  // qu'on corrige. Le test garde qu'on n'en ajoute pas un quatrième par mégarde — c'est lui
  // qui a attrapé « Caveau des Costières », dont l'enseigne donnait la réponse.
  const donnes = ['Fontaine', 'Courbessac', 'Grézan'].filter((q) => new RegExp(q).test(t));
  if (donnes.length !== 3) throw new Error('quartiers lisibles dans les adresses : ' + donnes.join(', '));
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
  const svg = await pageBo.textContent(`${zBo} .plan-svg`);
  if (!/Comptoir des Halles/.test(svg)) throw new Error('les noms n’apparaissent pas au temps 2');
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
  if (bOpt.arrivee !== '15 h 27') throw new Error('retour calculé à ' + bOpt.arrivee + ' au lieu de 15 h 27');
  if (/15 h 27/.test(t)) throw new Error('l’écran donne l’heure de retour avant le calcul : ' + t.slice(0, 600));
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
  // L'ordre de départ, celui de la fiche : 32,6 km et un retour à 16 h 19, neuf minutes après
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
  // Le calibrage, à la source : 32,6 km et un retour à 16 h 19, neuf minutes après le train.
  const bTrain = await bilanBo();
  if (bTrain.arrivee !== '16 h 19') throw new Error('retour calculé à ' + bTrain.arrivee + ' au lieu de 16 h 19');
  if (bTrain.km !== 32.6) throw new Error('distance calculée : ' + bTrain.km + ' km au lieu de 32,6');
  // À l'écran, l'élève apprend QUE le train est manqué — c'est indispensable, sinon la
  // contrainte disparaît de la séance — mais pas DE COMBIEN : neuf minutes de retard sur une
  // limite connue redonneraient l'heure de retour, donc le temps total qu'il doit calculer.
  if (!/manqué/.test(t)) throw new Error('le retard n’est pas annoncé du tout : ' + t.slice(0, 600));
  // On lit les JAUGES et pas la page entière : la feuille de calcul, remplie par un cas
  // précédent, affiche légitimement le résultat de la formule de l'élève (16 h 19). Ce qui ne
  // doit pas la donner, c'est le tableau de bord.
  const jaugesTxt = (await pageBo.$$eval(`${zBo} .tour-jauge`, (els) => els.map((e) => e.textContent)))
    .join(' ').replace(/\s+/g, ' ');
  if (/16 h 19|manqué de 9 min/.test(jaugesTxt)) throw new Error('les jauges donnent l’heure de retour : ' + jaugesTxt);
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
  if (t.ordre.join(',') !== 'c4,c2,c1,c6,c5,c7') throw new Error('ordre construit à la carte : ' + t.ordre.join(','));
  if (t.quai.join(',') !== 'c3') throw new Error('La Pointe Sud devrait rester seule à quai : ' + t.quai.join(','));

  // Les chiffres de la séance, écrits ici à la main : 179 kg des six commandes retenues
  // (31 + 24 + 42 + 19 + 36 + 27), 21 colis, et le train attrapé.
  const txt = await texteBo();
  const bCarte = await bilanBo();
  if (bCarte.charge !== 179) throw new Error('charge : ' + bCarte.charge + ' kg au lieu de 179');
  if (bCarte.colis !== 21) throw new Error('colis : ' + bCarte.colis + ' au lieu de 21');
  if (bCarte.arrivee !== '15 h 27') throw new Error('retour : ' + bCarte.arrivee + ' au lieu de 15 h 27');
  if (/dépassée|manqué/.test(txt)) throw new Error('une contrainte est violée alors que l’ordre est le bon');

  // La carte, elle, porte bien les deux encres : sept ronds numérotés de 1 à 7 qui ne bougent
  // pas, six pastilles d'ordre, et La Pointe Sud en creux.
  const c = await pageBo.$$eval(`${zBo} .plan-svg .plan-pt`, (gs) => gs.map((g) => ({
    id: g.dataset.point,
    rond: g.querySelector('text').textContent.trim(),
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
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7']; t.quai = ['c3'];
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
    saisie: !!tr.querySelector('[data-gr]'),
  })));
  // Les six arrêts dans l'ordre de l'élève, lignes 2 à 7, puis le total à remplir en ligne 8.
  const noms = g.slice(1, 7).map((x) => x.a).join('|');
  if (noms !== 'Maison Lauze|Épicerie Verdier|Le Comptoir des Halles|Atelier Mazet|Studio Garance|Caveau Pélissier') {
    throw new Error('les lignes ne suivent pas la tournée de l’élève : ' + noms);
  }
  const poids = g.slice(1, 7).map((x) => x.b).join('|');
  if (poids !== '42|24|31|36|19|27') throw new Error('poids ligne par ligne : ' + poids);
  const refs = await pageBo.$$eval(`${zBo} [data-gr]`, (e) => e.map((x) => x.dataset.gr).join(','));
  if (refs !== 'B8,B13,B14,B17,B18,B19') throw new Error('cellules à remplir : ' + refs);
  if (!g[7].saisie) throw new Error('la ligne 8 n’est pas la cellule du poids total');

  // Et la feuille donne les DONNÉES du calcul — distance, vitesse, nombre d'arrêts, temps par
  // arrêt — sans jamais donner les résultats : ce sont les six cellules à remplir (le poids,
  // les trois étapes du temps, l'heure de départ et l'heure d'arrivée).
  const donnees = g.map((x) => `${x.a}=${x.b}`).join(' ; ');
  if (!/Distance du parcours \(km\)=22,1/.test(donnees)) throw new Error('distance : ' + donnees);
  if (!/Vitesse en ville \(km\/h\)=12/.test(donnees)) throw new Error('vitesse : ' + donnees);
  if (!/Nombre d’arrêts=6/.test(donnees)) throw new Error('nombre d’arrêts : ' + donnees);
  if (!/Temps par arrêt \(min\)=6/.test(donnees)) throw new Error('temps par arrêt : ' + donnees);
});

await v('ENT-3.1 : les formules justes sont acceptées, et le résultat s’affiche en direct', async () => {
  // Les formules qu'on attend d'un élève, et leurs résultats écrits ici à la main : 179 kg,
  // 1,84 h de route (22,1 km ÷ 12 km/h), 110,5 min (× 60), 36 min d'arrêts (6 × 6), un départ
  // à 13 h 00, et l'arrivée à la gare : 780 + 110,5 + 36 = 926,5 min, soit 15 h 27.
  const formules = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
    B18: '13:00', B19: '=B18+B14+B17' };
  for (const [ref, f] of Object.entries(formules)) {
    await pageBo.fill(`${zBo} [data-gr="${ref}"]`, f);
    await pageBo.waitForTimeout(40);
  }
  // Le résultat s'affiche à côté de la formule, en direct, SANS avoir à valider : c'est ce qui
  // permet à l'élève de voir ce que son calcul produit pendant qu'il l'écrit.
  const res = await pageBo.$$eval(`${zBo} [data-gr-res]`, (e) => e.map((x) => x.textContent.trim()).join('|'));
  if (res !== '179|1,84|110,5|36|13 h 00|15 h 27') throw new Error('résultats affichés : ' + res);

  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  const t = await texteBo();
  if (!/Toutes les formules sont justes/.test(t)) throw new Error('les formules ne sont pas acceptées : ' + t.slice(-400));
  const justes = await pageBo.$$eval(`${zBo} .gr-saisie input.juste`, (e) => e.length);
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
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '179');
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
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMME(B2:B6)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (/écrivez une formule/.test(t)) throw new Error('une formule juste est prise pour un nombre tapé');
  if (!/à revoir/.test(t)) throw new Error('une plage trop courte est acceptée : ' + t.slice(-400));

  // Et une formule mal écrite est signalée comme telle, pas comme un résultat faux.
  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMM(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  t = await texteBo();
  if (!/formule mal écrite/.test(t)) throw new Error('une fonction inconnue n’est pas signalée : ' + t.slice(-400));

  await pageBo.fill(`${zBo} [data-gr="B8"]`, '=SOMME(B2:B7)');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  if ((await jalonsBo()).formules !== 'ok') throw new Error('jalon formules avec toutes les formules justes : ' + (await jalonsBo()).formules);
});

await v('feuille de calcul : désigner une cellule à la souris écrit sa référence', async () => {
  // Tristan, le 04/10 : *« il ne reproduit pas le clic ou le clic glissé pour sélectionner les
  // cellules »*. C'est le geste d'Excel, et c'est comme ça qu'on apprend ce qu'est une plage :
  // on la montre, on ne l'épelle pas. Trois gestes, plus deux règles qui disent QUAND ils
  // s'arment — ces deux-là sont sorties en pilotant l'écran à la souris, pas d'une relecture.
  const champ = `${zBo} [data-gr="B8"]`;
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
  await pageBo.fill(champ, '=+100');
  await pageBo.click(champ);
  await pageBo.evaluate((sel) => {
    const e = document.querySelector(sel);
    e.setSelectionRange(1, 1);
    e.dispatchEvent(new Event('select'));
  }, champ);
  await cliquer('B3');
  if (await val() !== '=B3+100') throw new Error('insertion ailleurs qu’au curseur : ' + await val());

  await pageBo.fill(champ, '=SOMME(B2:B7)');
  await pageBo.waitForTimeout(80);
});

await v('feuille de calcul : le pointage se tait quand la formule n’attend pas de référence', async () => {
  // Les deux pièges d'une cellule cliquable, trouvés en pilotant la souris. Sans ces deux
  // règles, l'élève récolte des références dont il n'a rien demandé et ne comprend pas d'où
  // elles sortent — ce qui est pire que l'absence du geste.
  const champ = `${zBo} [data-gr="B8"]`;
  await pageBo.evaluate(() => { const t = document.getElementById('toast'); if (t) t.remove(); });
  const centre = async (ref) => {
    const el = pageBo.locator(`${zBo} .gr-table [data-ref="${ref}"]`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };

  // 1. Hors formule, une cellule cliquée reste une cellule cliquée.
  await pageBo.fill(champ, '179');
  await pageBo.click(champ);
  const p4 = await centre('B4');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '179') {
    throw new Error('un clic insère une référence hors formule : ' + await pageBo.inputValue(champ));
  }

  // 2. Sur une formule TERMINÉE, le clic ne vient pas la polluer : l'élève qui a fini et qui
  //    clique la cellule suivante veut y aller, pas y faire référence.
  await pageBo.fill(champ, '=SOMME(B2:B7)');
  await pageBo.click(champ);
  await pageBo.keyboard.press('End');
  await pageBo.mouse.click(p4.x, p4.y);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '=SOMME(B2:B7)') {
    throw new Error('une formule finie est polluée par un clic : ' + await pageBo.inputValue(champ));
  }

  // 3. Cliquer DANS son propre champ pour y poser le curseur n'insère pas sa propre référence.
  await pageBo.fill(champ, '=SOMME(');
  await pageBo.click(champ);
  await pageBo.waitForTimeout(100);
  if (await pageBo.inputValue(champ) !== '=SOMME(') {
    throw new Error('le champ s’auto-référence quand on y clique : ' + await pageBo.inputValue(champ));
  }

  await pageBo.fill(champ, '=SOMME(B2:B7)');
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

  // Les trois longueurs, écrites ici à la main. 22,1 km la chaîne complète ; sans la gare il
  // manque le retour, sans l'entrepôt il manque l'aller. Les deux bouts pèsent 3,8 km à eux
  // seuls — c'est précisément ce que l'élève ne voyait pas.
  const complet = await poser(ORDRE31, true, true);
  if (complet.km !== 22.1) throw new Error('chaîne complète : ' + complet.km + ' km au lieu de 22,1');
  if (!complet.arrivee) throw new Error('pas d’heure de retour sur une chaîne complète');

  const sansGare = await poser(ORDRE31, true, false);
  if (sansGare.km >= complet.km) throw new Error('retirer la gare ne raccourcit pas le trajet : ' + sansGare.km);

  const sansRien = await poser(ORDRE31, false, false);
  if (sansRien.km >= sansGare.km) throw new Error('retirer l’entrepôt ne raccourcit pas le trajet : ' + sansRien.km);

  // Et la carte le montre : un bout pas encore posé est dessiné en creux, comme un arrêt resté
  // à quai — même signe pour le même sens.
  const dessin = await pageBo.evaluate(() => ({
    departVide: !!document.querySelector('#boost31 .plan-depart.plan-bout-vide'),
    arriveeVide: !!document.querySelector('#boost31 .plan-arrivee.plan-bout-vide'),
    pastilles: [...document.querySelectorAll('#boost31 .plan-depart .plan-pt-ordre, #boost31 .plan-arrivee .plan-pt-ordre')].length,
  }));
  if (!dessin.departVide || !dessin.arriveeVide) throw new Error('un bout non posé est dessiné comme posé : ' + JSON.stringify(dessin));
  if (dessin.pastilles) throw new Error('un bout non posé porte une pastille de tournée');

  // Posés, ils prennent leur pastille menthe « D » et « A » : la chaîne se lit D → 1 … → A.
  await poser(ORDRE31, true, true);
  const lettres = await pageBo.evaluate(() => [...document.querySelectorAll(
    '#boost31 .plan-depart .plan-pt-ordre text, #boost31 .plan-arrivee .plan-pt-ordre text')]
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
    // L'ordre de la fiche : complet il rentre à 16 h 19, NEUF MINUTES APRÈS le train.
    t.ordre = ['c1', 'c2', 'c4', 'c5', 'c6', 'c7']; t.quai = ['c3'];
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
      carteClient: lu(document.querySelector('#boost31 .plan-pt circle'), 'fill'),
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
const SIX = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7'];
const FORM6 = { B8: '=SOMME(B2:B7)', B13: '=B11/B12', B14: '=B13*60', B17: '=B15*B16',
  B18: '13:00', B19: '=B18+B14+B17' };
const SEPT = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
const FORM7 = { B9: '=SOMME(B2:B8)', B14: '=B12/B13', B15: '=B14*60', B18: '=B16*B17',
  B19: '13:00', B20: '=B19+B15+B18' };

await v('ENT-3.1 : les étapes et les résultats ont chacun leur surbrillance, et les contraintes sont dans la feuille', async () => {
  // Tristan, le 05/10 : *« une surbrillance différente pour distinguer les étapes et les
  // résultats (poids total chargé) et heure d'arrivée »*. On mesure les couleurs RENDUES, pas
  // les noms de classes : une classe sans règle CSS passerait un test de classes.
  await poserGrille(SIX, ['c3']);
  const fond = await pageBo.$$eval(`${zBo} .gr-table tbody tr`, (trs) => trs.map((tr) => ({
    a: tr.children[1] ? tr.children[1].textContent.replace(/\s+/g, ' ').trim() : '',
    bg: tr.children[2] ? getComputedStyle(tr.children[2]).backgroundColor : '',
  })));
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

  // Les explications sont SOUS les libellés, là où l'élève cherche : la formule distance ÷
  // vitesse avec ses unités, puis la conversion en minutes.
  const t = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Distance \(km\) ÷ vitesse \(km\/h\) = temps \(h\)/.test(t)) throw new Error('l’étape 1 n’est pas expliquée : ' + t);
  if (!/1 heure = 60 minutes/.test(t)) throw new Error('la conversion en minutes n’est pas expliquée : ' + t);
  if (!/Heure de départ \+ temps de route \(min\) \+ temps aux arrêts \(min\)/.test(t)) throw new Error('l’heure d’arrivée n’est pas expliquée');
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
  const justes = await pageBo.$$eval(`${zBo} .gr-saisie input.juste`, (e) => e.length);
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
  const mele = await pageBo.$$eval(`${zBo} .gr-saisie input.juste.faux`, (e) => e.length);
  if (mele) throw new Error('une cellule est à la fois juste et fausse');

  // Retirer un arrêt change les données sous les formules : le verdict périmé disparaît, avec
  // son message. Sans ça, « juste » restait affiché sur un total devenu faux.
  await pageBo.click(`${zBo} [data-quai="c3"]`);
  await pageBo.waitForTimeout(220);
  const reste = await pageBo.evaluate((z) => ({
    justes: document.querySelectorAll(`${z} .gr-saisie input.juste`).length,
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

await v('ENT-3.1 : l’heure de départ se tape « 13h00 » ou « 13:00 », et « 13 » est refusé', async () => {
  await poserGrille(SIX, ['c3'], Object.assign({}, FORM6, { B18: '13' }));
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  let faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.map((x) => x.dataset.gr).join(','));
  // « 13 » ne dit pas si c'est 13 minutes ou 13 heures : la cellule est à revoir, et c'est la
  // SEULE — l'heure d'arrivée, calculée depuis un 13, est fausse elle aussi, ce qui est normal.
  if (!/B18/.test(faux)) throw new Error('« 13 » est accepté comme heure de départ : ' + faux);
  await pageBo.fill(`${zBo} [data-gr="B18"]`, '13h00');
  await pageBo.waitForTimeout(60);
  const res = await pageBo.textContent(`${zBo} [data-gr-res="B19"]`);
  if (res.trim() !== '15 h 27') throw new Error('« 13h00 » ne donne pas 15 h 27 : ' + res);
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.length);
  if (faux) throw new Error(faux + ' cellule(s) fausses avec « 13h00 »');
  // Un départ tapé à 14:00 donne une arrivée plus tard : la formule reste JUSTE comme formule,
  // mais l'heure de départ n'est pas celle de la consigne.
  await pageBo.fill(`${zBo} [data-gr="B18"]`, '14:00');
  await pageBo.click(`${zBo} [data-gr-verifier]`);
  await pageBo.waitForTimeout(200);
  faux = await pageBo.$$eval(`${zBo} .gr-saisie input.faux`, (e) => e.map((x) => x.dataset.gr).join(','));
  if (!/B18/.test(faux)) throw new Error('un départ à 14:00 est accepté : ' + faux);
});

await v('ENT-3.1 : les jauges ne donnent plus les totaux, et les rendent après validation', async () => {
  // La décision qui décide de tout : si la jauge affiche « 179 / 180 kg », l'élève le recopie
  // et la feuille de calcul ne sert à rien — exactement le défaut relevé par Tristan le 03/10
  // sur les cases de report, d'un cran plus haut.
  // On repart de la tournée qui tient, chaîne complète : les cas précédents ont laissé des
  // états volontairement bancals, et ce cas-ci parle des CHIFFRES, pas de l'organisation.
  await pageBo.evaluate(() => {
    const t = window.__bo.db.transport['boost-ent31'].tournee;
    t.ordre = ['c4', 'c2', 'c1', 'c6', 'c5', 'c7']; t.quai = ['c3'];
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
  if (/15 h 27|147 min/.test(j)) throw new Error('la jauge donne l’heure de retour ou le temps total : ' + j);
  // Ce qu'elle CONTINUE de donner : la limite. Les données du calcul (distance, vitesse, temps
  // par arrêt) sont passées dans la feuille de calcul, à gauche, et ne sont plus répétées ici.
  if (!/16 h 10/.test(j)) throw new Error('le train n’est plus annoncé : ' + j);
  const feuille = await pageBo.$eval(`${zBo} .gr-table`, (e) => e.textContent.replace(/\s+/g, ' '));
  if (!/Distance du parcours \(km\)\s*22,1/.test(feuille)) throw new Error('la distance n’est plus donnée : ' + feuille);
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
  if (!/15 h 27/.test(j)) throw new Error('l’heure de retour n’est pas rendue après validation : ' + j);

  // Et elle se retait dès que l'élève touche à sa tournée : une validation ancienne ne doit
  // pas dévoiler les totaux d'une tournée qui a changé.
  await pageBo.click(`${zBo} [data-bas="0"]`);
  await pageBo.waitForTimeout(200);
  j = await lire();
  if (/179 \/ 180 kg|15 h 2/.test(j)) throw new Error('les jauges restent dévoilées après un changement d’ordre : ' + j);
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
  if (bDeux.arrivee !== '15 h 10') throw new Error('retour calculé à ' + bDeux.arrivee + ' au lieu de 15 h 10');
  if (/15 h 10/.test(t)) throw new Error('l’écran donne l’heure de retour : ' + t.slice(0, 400));
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
  if (zones.join('|') !== ['Écusson', 'Jardins de la Fontaine', 'Ville Active', 'Saint-Césaire', 'Courbessac', 'Grézan', 'Costières'].join('|')) {
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
    const svg = document.querySelector('#boost31 .plan-svg');
    const hex = (el, attr) => (el ? getComputedStyle(el).fill || el.getAttribute(attr) : '');
    return {
      vert: lu('--vert'), terre: lu('--terre'), fond: lu('--ardoise-fond'), marque: lu('--ent-marque'),
      depart: hex(svg.querySelector('.plan-depart rect'), 'fill'),
      arrivee: hex(svg.querySelector('.plan-arrivee path'), 'fill'),
      point: hex(svg.querySelector('.plan-pt circle'), 'fill'),
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

await v('ENT-3.1 : aucune carte en ligne n’est intégrée, seulement un lien', async () => {
  await ouvrirBo('plan');
  const a = await pageBo.evaluate(() => {
    const z = document.querySelector('#boost31 .ent-main');
    const lien = z.querySelector('.plan-barre a');
    return {
      iframes: z.querySelectorAll('iframe, embed, object').length,
      href: lien ? lien.getAttribute('href') : null,
      cible: lien ? lien.getAttribute('target') : null,
      rel: lien ? lien.getAttribute('rel') : null,
      images: [...z.querySelectorAll('img')].map((i) => i.getAttribute('src')),
    };
  });
  if (a.iframes) throw new Error(a.iframes + ' cadre(s) intégré(s) : aucune carte en ligne ne doit être embarquée');
  if (!a.href) throw new Error('pas de lien vers un plan en ligne');
  if (!/^https:\/\//.test(a.href)) throw new Error('lien non sécurisé : ' + a.href);
  if (a.cible !== '_blank' || !/noopener/.test(a.rel || '')) throw new Error('le lien ne s’ouvre pas proprement dans un autre onglet');
  if (a.images.some((s) => /^https?:/.test(s))) throw new Error('image chargée depuis l’extérieur : ' + a.images.join(', '));
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
const point32 = async (sel) => { await immobile32(); await page32.click(`${z32} ${sel}`, { force: true }); };
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

await v('ENT-3.2 : la séance est un entraînement de C2.4, cachée aux élèves, sans notation', async () => {
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
  if (m.pret !== false) throw new Error('pret devrait être false tant que Tristan n’a pas validé la séance');
  if ('notation' in m) throw new Error('une séance notée sur 20 ne déclare pas de `notation`');
  if (m.jeuId !== 'boost' || m.reinitialisable) throw new Error('la base de Boost est partagée avec ENT-3.1 : ni jeu à part, ni remise à zéro');
  if (r.nb !== 8 || m.bareme !== 8) throw new Error('barème : ' + m.bareme + ' pour ' + r.nb + ' jalons');
  if (r.ids.join() !== 'reperage,choix,charge,horaire,creneau,formules,trajet10,trajet5') throw new Error('jalons : ' + r.ids.join());
  if (r.registre > 0 && !r.inscrite) throw new Error('la séance n’est pas dans le registre');
});

await v('ENT-3.2 : la journée — huit clients, 230 kg pour 180, seule la Cave Teissier peut rester à quai', async () => {
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
  if (!r.cren || r.cren.id !== 'c6' || r.cren.avant !== 885) throw new Error('créneau : ' + JSON.stringify(r.cren));
  if (r.j.depart !== 850 || r.j.limite !== 970 || r.j.chargeUtile !== 180) throw new Error('journée : ' + JSON.stringify(r.j));
  if (r.refs.join() !== 'B10,B12') throw new Error('cellules du calcul : ' + r.refs);
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
  if (s.max !== 8 || s.score !== 0) throw new Error('suivi : ' + s.score + '/' + s.max);
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
  if (!/avant 14 h 45/.test(t)) throw new Error('le créneau n’est pas dans le mail');
  if ((t.match(/nouveau client/g) || []).length !== 4) throw new Error('les quatre nouveaux clients ne sont pas signalés');
  if (!/14 h 10/.test(t) || !/16 h 10/.test(t)) throw new Error('départ 14 h 10 / train 16 h 10 absents');
  // Le mail ne fait pas le travail de la feuille : ni le total, ni ce qu'il faut écarter.
  if (/\b230\b/.test(t) || /\b50 kg\b/.test(t)) throw new Error('le mail donne le total ou la masse à écarter');
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
});

await v('ENT-3.2 : les jauges sont muettes — la limite, jamais le total ni l’heure d’arrivée', async () => {
  const t = await texte32();
  // 178 kg chargés, retour à 15 h 55, arrivée chez la pâtisserie vers 14 h 29 : rien de tout ça ne s'écrit.
  if (/\b178\b/.test(t)) throw new Error('la jauge donne le poids chargé');
  if (/15 h 55/.test(t)) throw new Error('la jauge donne l’heure d’arrivée à la gare');
  const cr = await texte32(`${z32} [data-creneau="c6"]`);
  if (!/14 h 45/.test(cr)) throw new Error('la limite du créneau n’est pas lisible : ' + cr);
  if (/ \/ /.test(cr) || /Arrivée prévue/.test(cr)) throw new Error('la jauge de créneau donne l’heure d’arrivée : ' + cr);
  if (!/180/.test(t)) throw new Error('la limite de 180 kg n’est pas lisible');
  if (/raté de|retard de/.test(t)) throw new Error('un retard chiffré est affiché');
});

await v('ENT-3.2 : la feuille — huit poids, total, charge utile, poids à écarter ; la formule est exigée', async () => {
  await ouvrir32('tournee');
  const lignes = await page32.$$eval(`${z32} .gr-table tr, ${z32} table tr`, (tr) => tr.map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  const txt = lignes.join(' | ');
  for (const nom of ['Cave Teissier', 'Pâtisserie Arnaud', 'Poids total des commandes', 'Poids à laisser à quai', 'Poids chargé']) {
    if (!txt.includes(nom)) throw new Error('la feuille ne porte pas « ' + nom + ' » : ' + txt.slice(0, 300));
  }
  if (!/Heure d’arrivée chez Pâtisserie Arnaud/.test(txt)) throw new Error('pas de ligne pour l’heure d’arrivée chez le client à créneau');
  // Un nombre tapé à la main est refusé, même juste : on veut la formule.
  await page32.fill(`${z32} [data-gr="B12"]`, '50');
  await page32.fill(`${z32} [data-gr="B10"]`, '=SOMME(B2:B9)');
  await page32.click(`${z32} [data-gr-verifier]`);
  await page32.waitForTimeout(200);
  const g = (await etat32('tournee')).grille;
  if (g.juge.B10 !== 'ok') throw new Error('B10 : ' + g.juge.B10);
  if (g.juge.B12 !== 'pasFormule') throw new Error('B12 tapé à la main devrait être « pasFormule » : ' + g.juge.B12);
  const j = await jalon32('choix');
  if (j.status === 'ok') throw new Error('« choix » validé avec un nombre tapé à la main');
});

await v('ENT-3.2 : les formules justes valident le calcul, « choix » et « formules » — 8 jalons sur 8', async () => {
  const formules = { B10: '=SOMME(B2:B9)', B12: '=B10-B11', B13: '=B10-B6',
    B17: '=B15/B16', B18: '=B17*60', B21: '=B19*B20', B22: '14:10', B23: '=B22+B18+B21',
    B28: '=B22+B26/B16*60+B27*B20' };
  for (const [ref, f] of Object.entries(formules)) {
    await page32.fill(`${z32} [data-gr="${ref}"]`, f);
    await page32.waitForTimeout(40);
  }
  await page32.click(`${z32} [data-gr-verifier]`);
  await page32.waitForTimeout(250);
  const g = (await etat32('tournee')).grille;
  const pas = Object.keys(g.juge).filter((k) => g.juge[k] !== 'ok');
  if (pas.length) throw new Error('cellules non justes : ' + pas.map((k) => k + '=' + g.juge[k]).join(', '));
  const j = await jalons32();
  const nonOk = Object.keys(j).filter((k) => j[k] !== 'ok');
  if (nonOk.length) throw new Error('jalon(s) non validé(s) : ' + nonOk.join(', ') + ' — ' + JSON.stringify(j));
  const s = await page32.evaluate(() => { const l = window.__b32.suivi; return l[l.length - 1]; });
  if (s.score !== 8 || s.max !== 8) throw new Error('suivi : ' + s.score + '/' + s.max);
});

await v('ENT-3.2 : le trajet le plus court rate le créneau — les deux paliers de distance tombent, les autres non', async () => {
  await construire32(COURT32);
  const j = await jalons32();
  if (j.creneau !== 'ko') throw new Error('créneau : ' + j.creneau);
  if (j.trajet10 !== 'ko' || j.trajet5 !== 'ko') throw new Error('un trajet qui rate le créneau ne vaut pas les paliers : ' + JSON.stringify(j));
  if (j.horaire !== 'ok' || j.charge !== 'ok') throw new Error('train et charge devraient tenir : ' + JSON.stringify(j));
  const d = await jalon32('creneau');
  if (!/Pâtisserie Arnaud/.test(d.detail)) throw new Error('le détail ne nomme pas le client : ' + d.detail);
  // La pastille de la jauge muette dit QUE le créneau est raté.
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
        if (ch[i] === 'c6' && J.depart + m / 1000 / J.vitesse * 60 + (i - 1) * J.service > 885) ok = false;
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
  // Les effectifs du calage : 371 ordres tiennent tout, 57 à moins de 10 %, 17 à moins de 5 %.
  if (r.n !== 371 || r.p10 !== 57 || r.p5 !== 17) throw new Error('effectifs : ' + JSON.stringify([r.n, r.p10, r.p5]));
  if (r.v0 !== 'ok,ok') throw new Error('la meilleure tournée : ' + r.v0);
  if (r.v10 !== 'ok,ko') throw new Error('entre 5 et 10 % (' + (r.entre * 100 - 100).toFixed(1) + ' %) : ' + r.v10);
  if (r.vloin !== 'ko,ko') throw new Error('au-delà de 10 % (' + (r.loin * 100 - 100).toFixed(1) + ' %) : ' + r.vloin);
});

await v('ENT-3.2 : un mauvais client à quai fait tomber « choix », « charge » et les paliers', async () => {
  // La Pâtisserie reste à quai à la place de la Cave : on charge donc 230 − 31 = 199 kg.
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

}
