// Vue « Plan d'entrepôt », mode VISITE — faire visiter une plateforme : photos à découvrir, photos où
// l'on clique pour répondre, parcours de visite posé sur le plan, travée à délimiter sur une photo,
// adresse d'emplacement à décomposer puis à retrouver.
//
// Écrit le 05/10/2026 (brief `docs/briefs/MOTEUR-modes-visite.md`), d'après la maquette v2 validée par
// Tristan (`docs/briefs/smoby/visite/maquette-visite-2de-v2.html`), qui FAIT FOI pour l'interaction : mêmes
// gestes, mêmes textes. Second chantier de la vue (`entrepot.js`, qui importe ce fichier : il dépassait
// 1 400 lignes) : le plan vu de dessus et la travée vue de face sont ceux du premier chantier, prêtés par
// `creerEntrepot` (en lecture pour le parcours, cliquables pour l'adresse).
//
// Pas de maquette universelle (décision 8 du Plan d'entrepôt) : le moteur fournit des BRIQUES, la séance
// déclare ses étapes, ses photos, ses coordonnées, ses textes. Rien de Smoby ici. Décisions de Tristan tenues
// par le moteur (04/10/2026) :
//   - l'élève revient sur une étape faite, ne saute pas en avant ; « Suivant » seulement quand l'étape est finie ;
//   - les questions d'une photo à points ne commencent qu'au clic sur leur bouton, jamais automatiquement ;
//   - un clic faux ne fait pas perdre le jalon : l'élève recommence, « du premier coup » le trace ;
//   - l'adresse se décompose en UNE validation (recommencer reviendrait à deviner) ;
//   - rien de ce qui est attendu (zones, coins, cibles, emplacement) n'est montré avant la réponse.
//
// NOTÉ AU PREMIER ESSAI (`premierEssai: true` dans la déclaration ; lot 3 du brief SMOBY-notation-5.3-5.8,
// décision Q1 de Tristan du 07/10/2026). L'élève recommence toujours jusqu'à trouver (« Suivant » l'exige), mais
// chaque case est jugée sur son PREMIER essai, et ce jugement est figé. Une case reste « à faire » tant que l'élève
// ne l'a pas finie, puis rend 'ok' (du premier coup) ou 'ko' (après une erreur) ; la séance est donc finie à la fin
// de la visite. Les cases deviennent plus fines :
//   - question, photo à associer : juste si trouvée au premier clic ;
//   - la travée : un jalon par COIN, jugé à la première vérification (`faux1`, rangé à ce moment-là) ;
//   - les cibles (lisses) : juste si toutes trouvées sans aucun clic faux ;
//   - l'adresse : un jalon par PARTIE décomposée ; l'emplacement retrouvé en `clicsMax` clics au plus (1 par défaut).
// Sans le réglage, rien ne change (jalons d'origine, un clic faux ne fait pas perdre le jalon).
//
// La déclaration (exemple complet : `contenus/smoby-ent53.js`) :
//
//   entrepot: {
//     id, libelle, mode: 'visite',
//     plan, gammes, produits, stock,                    // ceux du premier chantier (le plan se dessine, la
//                                                       // travée de l'adresse aussi)
//     zones: { reception: { note: 'vide à 8 h' }, passagePietons: { devant: 'reception' } },   // décor
//     personnage: { nom, role, date },
//     images: { ciel: { src, repere: [1600, 1066], alt, mention }, … },   // repère : celui des coordonnées,
//                                                       // à la proportion du fichier (≤ 1 %)
//     etapes: [{ id, type, titre, heure, texte (message du personnage), aide, consigne, … }, …],
//     fin: { heure, texte, … },                         // étape de fin (facultative)
//   }
//
// Les types d'étape (`TYPES_ETAPES`) et ce que chacun déclare :
//   accueil        image, surTitre, grandTitre, intro, programme: [html…], encadre
//   photoPoints    image, effet: 'zoom' | 'bulle', rayon, liste, consigne ({n}), consigneTous, consigneFini,
//                  points: [{ n, x, y, mot, def, zoom?: { cx, cy, s }, cx?, cy? (trait de rappel) }],
//                  puis?: une photoQuestions sur la même photo, lancée par son `bouton`
//   photoQuestions image (sauf en `puis`), liste, consigne ({q} ou {mot}), juste, faux ({aide}, {mot}), encadre,
//                  questions: [{ id, q? | mot?, zones: [[x0, y0, x1, y1], …], aide?, jalon? }]
//   parcours       consigne, debut (encadré avant la 1re), ordre ({n}), etapes: [{ n, ancre, decalage?,
//                  titre, images: [clé…], dir (degrés, 0 = est, 90 = sud), cone (longueur), texte }]
//   associer       parcours (id de l'étape parcours : ses numéros et ses ancres), liste, consigne, consigneFini,
//                  juste ({n} {titre}), faux, photos: [{ id, image, n (l'étape du parcours d'où elle est prise), jalon? }]
//                  — le plan à gauche avec les numéros, une photo à la fois à droite (dans l'ordre déclaré)
//   delimiter      image, coins: { hg, hd, bg, bd }, tolerance, noms, consigne, rappel, messages: { juste, faux
//                  ({coins}) }, correction: { legendes: [{ texte, x, y, rot?, plein? }] }, jalon?,
//                  puis?: { type: 'zones', consigne, rappel, liste, x: [x0, x1], marge, cibles: [{ nom, y0, y1,
//                  x? }], pieges: [{ y0, y1, x?, message }], horsEtendue, horsCible, dejaTrouve, juste ({nom}), jalon? }
//   adresse        code, sens: [4], choix: [ordre des listes], consigne, rappel, encadre, consigneTravee,
//                  consigneEmplacement ({code}), consigneFini, trouve ({adresse} {produit} {kg}), jalons?: {
//                  decomposer, retrouver }, clicsMax? (premier essai : clics d'emplacement permis, 1 par défaut)
//   fin            image?, grandTitre?, texte, consigne
//
// Les ancres du parcours (pas de pixels : la géométrie est celle du plan déclaré) : `quai:<nom du quai>`,
// `zone:reception`, `zone:litiges`, `zone:bureau`, `allee:principale`, `allee:<id d'allée>`.
//
// L'état, dans `db.entrepots[<id>]` (cloisonné par séance) : { courante, atteinte, x: { <id d'étape>: … } } —
// points ouverts, questions lancées, réponses et essais, étapes du parcours vues, coins posés et vérifications,
// cibles trouvées et clics faux, choix de l'adresse, clics d'emplacement. Ce qui est ouvert (point actif,
// photo du parcours, travée de l'adresse) et le dernier message ne sont pas gardés.

const ech = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = (n) => String(n).padStart(2, '0');
// Les textes déclarés sont du HTML de la séance ; `{clé}` y est remplacé par la valeur.
const fmt = (t, v) => String(t == null ? '' : t).replace(/\{(\w+)\}/g, (m, k) => (v && k in v ? v[k] : m));
const decoupe = (a) => {
  const m = /^([A-Z]+\d+)-T(\d+)-N(\d+)-E(\d+)$/.exec(String(a || ''));
  return m ? { c: m[1], t: +m[2], n: +m[3], e: +m[4] } : null;
};
const dansZones = (x, y, zs) => zs.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);

export const TYPES_ETAPES = ['accueil', 'photoPoints', 'photoQuestions', 'parcours', 'associer', 'delimiter', 'adresse', 'fin'];
const COINS = ['hg', 'hd', 'bg', 'bd'];
const NOMS_COINS = { hg: 'en haut à gauche', hd: 'en haut à droite', bg: 'en bas à gauche', bd: 'en bas à droite' };

export const etatVisiteNeuf = () => ({ courante: 0, atteinte: 0, x: {} });

/* ================================================================ compilation */
// Appelée par `compiler` (entrepot.js) : une visite mal déclarée ne se charge pas (la suite de tests le voit).
export function compilerVisite(M, err) {
  const P = M.P;
  const images = P.images || {};
  Object.entries(images).forEach(([k, im]) => {
    if (!im || !im.src) err(`image ${k} : il manque src`);
    if (!Array.isArray(im.repere) || !(im.repere[0] > 0) || !(im.repere[1] > 0)) err(`image ${k} : il manque le repère [largeur, hauteur]`);
  });
  const image = (k, ou) => { if (!images[k]) err(`${ou} : image inconnue (${k})`); };
  const etapes = (P.etapes || []).map((et) => Object.assign({}, et));
  if (P.fin && !etapes.some((et) => et.type === 'fin')) etapes.push(Object.assign({ id: 'fin', type: 'fin', titre: 'Fin' }, P.fin));
  if (!etapes.length) err('la visite n’a aucune étape');
  const zone = (z, ou) => {
    if (!Array.isArray(z) || z.length !== 4 || z.some((v) => typeof v !== 'number') || z[0] > z[2] || z[1] > z[3]) err(`${ou} : zone [x0, y0, x1, y1] mal écrite`);
  };
  const questions = (Q, ou) => {
    if (!Array.isArray(Q.questions) || !Q.questions.length) err(`${ou} : aucune question`);
    const vues = new Set();
    Q.questions.forEach((q, i) => {
      if (!q.id) err(`${ou}, question ${i + 1} : il manque un id`);
      if (vues.has(q.id)) err(`${ou} : question ${q.id} en double`);
      vues.add(q.id);
      if (!q.q && !q.mot) err(`${ou}, question ${q.id} : ni q ni mot`);
      if (!Array.isArray(q.zones) || !q.zones.length) err(`${ou}, question ${q.id} : aucune zone de réponse`);
      q.zones.forEach((z) => zone(z, `${ou}, question ${q.id}`));
    });
  };
  const ancres = ['zone:reception', 'zone:litiges', 'zone:bureau', 'allee:principale',
    ...(M.zones.quais || []).map((q) => `quai:${q}`), ...M.allees.map((al) => `allee:${al.id}`)];
  const ids = new Set();
  const jalons = [];
  etapes.forEach((et, i) => {
    const ou = `étape ${i + 1} (${et.id || '?'})`;
    if (!et.id) err(`étape ${i + 1} : il manque un id`);
    if (ids.has(et.id)) err(`${ou} : id en double`);
    ids.add(et.id);
    if (!TYPES_ETAPES.includes(et.type)) err(`${ou} : type inconnu (${et.type}) — types : ${TYPES_ETAPES.join(', ')}`);
    if (!et.titre) err(`${ou} : il manque un titre`);
    if (et.image) image(et.image, ou);
    const libQ = (q) => q.jalon || `${et.titre} : ${q.q ? `« ${q.q} »` : `cliquer sur ${q.mot}`}`;
    if (et.type === 'photoPoints') {
      if (!et.image) err(`${ou} : il manque l'image`);
      if (!Array.isArray(et.points) || !et.points.length) err(`${ou} : aucun point`);
      et.points.forEach((p) => { if (!(p.n > 0) || typeof p.x !== 'number' || typeof p.y !== 'number' || !p.mot) err(`${ou} : point mal écrit (n, x, y, mot)`); });
      if (et.puis) {
        if (et.puis.type !== 'photoQuestions') err(`${ou} : après les points, seule une photoQuestions est prévue`);
        questions(et.puis, ou);
        et.puis.questions.forEach((q) => jalons.push({ id: `${et.id}-${q.id}`, etape: et.id, type: 'question', question: q.id, lib: libQ(q) }));
      }
    }
    if (et.type === 'photoQuestions') {
      if (!et.image) err(`${ou} : il manque l'image`);
      questions(et, ou);
      et.questions.forEach((q) => jalons.push({ id: `${et.id}-${q.id}`, etape: et.id, type: 'question', question: q.id, lib: libQ(q) }));
    }
    if (et.type === 'parcours') {
      if (!Array.isArray(et.etapes) || !et.etapes.length) err(`${ou} : aucune étape de parcours`);
      et.etapes.forEach((p, k) => {
        if (p.n !== k + 1) err(`${ou} : les étapes du parcours se numérotent 1, 2, 3… dans l'ordre`);
        if (!ancres.includes(p.ancre)) err(`${ou}, étape n° ${p.n} : ancre inconnue (${p.ancre}) — ancres : ${ancres.join(', ')}`);
        (p.images || []).forEach((k2) => image(k2, `${ou}, étape n° ${p.n}`));
      });
    }
    if (et.type === 'associer') {
      const par = (P.etapes || []).find((t) => t.id === et.parcours && t.type === 'parcours');
      if (!par) err(`${ou} : il faut l'id d'une étape parcours (parcours: …)`);
      if (!Array.isArray(et.photos) || !et.photos.length) err(`${ou} : aucune photo`);
      const vues = new Set();
      et.photos.forEach((ph) => {
        if (!ph.id || vues.has(ph.id)) err(`${ou} : photo sans id ou en double`);
        vues.add(ph.id);
        image(ph.image, ou);
        const cible = par.etapes.find((q) => q.n === ph.n);
        if (!cible) err(`${ou}, photo ${ph.id} : le parcours n'a pas d'étape n° ${ph.n}`);
        jalons.push({ id: `${et.id}-${ph.id}`, etape: et.id, type: 'question', question: ph.id, lib: ph.jalon || `${et.titre} : la photo « ${cible.titre} »` });
      });
    }
    if (et.type === 'delimiter') {
      if (!et.image) err(`${ou} : il manque l'image`);
      COINS.forEach((k) => { const c = (et.coins || {})[k]; if (!Array.isArray(c) || c.length !== 2) err(`${ou} : coin ${k} manquant`); });
      if (!(et.tolerance > 0)) err(`${ou} : il manque la tolérance`);
      const noms = Object.assign({}, NOMS_COINS, et.noms || {});
      if (P.premierEssai) COINS.forEach((k) => jalons.push({ id: `${et.id}-${k}`, etape: et.id, type: 'coin', coin: k, lib: `${et.titre} : le coin ${noms[k]}` }));
      else jalons.push({ id: `${et.id}-coins`, etape: et.id, type: 'coins', lib: et.jalon || `${et.titre} : les 4 coins justes` });
      if (et.puis) {
        const Z = et.puis;
        if (Z.type !== 'zones') err(`${ou} : après la délimitation, seules des zones sont prévues`);
        if (!Array.isArray(Z.cibles) || !Z.cibles.length) err(`${ou} : aucune cible`);
        [...Z.cibles, ...(Z.pieges || [])].forEach((c) => {
          if (!(c.y1 > c.y0)) err(`${ou} : bande y0 / y1 mal écrite`);
          if (!(c.x || Z.x)) err(`${ou} : bande sans étendue en x`);
        });
        jalons.push({ id: `${et.id}-cibles`, etape: et.id, type: 'cibles', lib: Z.jalon || `${et.titre} : les ${Z.cibles.length} cibles trouvées` });
      }
    }
    if (et.type === 'adresse') {
      const d = decoupe(et.code);
      if (!d || !M.existe.has(et.code)) err(`${ou} : adresse inconnue du plan (${et.code})`);
      if (!Array.isArray(et.sens) || et.sens.length !== 4) err(`${ou} : il faut le sens des 4 parties`);
      if (!Array.isArray(et.choix) || et.sens.some((s) => !et.choix.includes(s))) err(`${ou} : chaque sens doit être dans les choix`);
      const J = et.jalons || {};
      if (P.premierEssai) {
        et.code.split('-').forEach((p, i) => jalons.push({ id: `${et.id}-partie${i + 1}`, etape: et.id, type: 'partie', partie: i,
          lib: `Adresse ${et.code} : la partie ${p} (${et.sens[i]})` }));
        if (et.clicsMax != null && !(et.clicsMax >= 1)) err(`${ou} : clicsMax doit valoir 1 ou plus`);
      } else jalons.push({ id: `${et.id}-decomposer`, etape: et.id, type: 'decomposer', lib: J.decomposer || `Adresse ${et.code} décomposée (4 parties justes)` });
      jalons.push({ id: `${et.id}-retrouver`, etape: et.id, type: 'retrouver', lib: J.retrouver || `Emplacement ${et.code} retrouvé` });
    }
  });
  M.visite = { etapes, images };
  M.jalons = jalons;
}

/* ================================================================ jugements */
const questionsFinies = (Q, x) => Q.questions.every((q) => (x.rep || {})[q.id]);
function finie(et, x = {}) {
  if (et.type === 'photoPoints') return (x.vus || []).length === et.points.length && (!et.puis || questionsFinies(et.puis, x));
  if (et.type === 'photoQuestions') return questionsFinies(et, x);
  if (et.type === 'parcours') return (x.vus || []).length === et.etapes.length;
  if (et.type === 'associer') return et.photos.every((ph) => (x.rep || {})[ph.id]);
  if (et.type === 'delimiter') return !!x.ok && (!et.puis || (x.cibles || []).length === et.puis.cibles.length);
  if (et.type === 'adresse') return !!x.valide && !!x.trouve;
  return true;
}
// Les 4 coins juste posés, rangés : les 2 plus hauts = le haut, puis gauche / droite dans chaque paire.
function coinsDe(pts) {
  const p = [...pts].sort((a, b) => a[1] - b[1]);
  const h = p.slice(0, 2).sort((a, b) => a[0] - b[0]), b = p.slice(2).sort((a, b) => a[0] - b[0]);
  return { hg: h[0], hd: h[1], bg: b[0], bd: b[1] };
}
const coinsFaux = (et, pts) => {
  const c = coinsDe(pts);
  return COINS.filter((k) => Math.hypot(c[k][0] - et.coins[k][0], c[k][1] - et.coins[k][1]) > et.tolerance);
};

// Chaque jalon : 'attente' tant que l'élève n'a rien tenté sur lui, puis 'ok' ou 'ko' (convention du lot 6 :
// le premier jugement 'ok' ou 'ko' fait « du premier coup »). Un geste juste en cours de route ne rend
// jamais 'ko' : seule une erreur le fait.
export function jalonsVisite(M, e) {
  const X = (id) => ((e && e.x) || {})[id] || {};
  const et = (id) => M.visite.etapes.find((t) => t.id === id);
  const premier = !!M.P.premierEssai;
  return M.jalons.map((j) => {
    const x = X(j.etape), T = et(j.etape);
    let etat = 'attente';
    if (premier) {
      if (j.type === 'question') etat = !(x.rep || {})[j.question] ? 'attente' : ((x.essais || {})[j.question] || 0) <= 1 ? 'ok' : 'ko';
      // Une base d'avant ce réglage n'a pas `faux1` : une seule vérification = tout juste, sinon on ne sait pas
      // quels coins étaient faux la première fois, et ils comptent tous comme ratés.
      if (j.type === 'coin') etat = !x.ok ? 'attente' : x.faux1 ? (x.faux1.includes(j.coin) ? 'ko' : 'ok') : (x.verifs || 0) <= 1 ? 'ok' : 'ko';
      if (j.type === 'cibles') etat = (x.cibles || []).length !== T.puis.cibles.length ? 'attente' : x.fauxCibles ? 'ko' : 'ok';
      if (j.type === 'partie') etat = !x.valide ? 'attente' : (x.choix || [])[j.partie] === T.sens[j.partie] ? 'ok' : 'ko';
      if (j.type === 'retrouver') etat = !x.trouve ? 'attente' : (x.clics || []).length <= (T.clicsMax || 1) ? 'ok' : 'ko';
      return { id: j.id, lib: j.lib, etape: j.etape, type: j.type, etat, ok: etat === 'ok' };
    }
    if (j.type === 'question') etat = (x.rep || {})[j.question] ? 'ok' : (x.essais || {})[j.question] ? 'ko' : 'attente';
    if (j.type === 'coins') etat = x.ok ? 'ok' : x.verifs ? 'ko' : 'attente';
    if (j.type === 'cibles') etat = (x.cibles || []).length === T.puis.cibles.length ? 'ok' : x.fauxCibles ? 'ko' : 'attente';
    if (j.type === 'decomposer') etat = !x.valide ? 'attente' : T.sens.every((s, i) => (x.choix || [])[i] === s) ? 'ok' : 'ko';
    if (j.type === 'retrouver') etat = x.trouve ? 'ok' : (x.clics || []).length ? 'ko' : 'attente';
    return { id: j.id, lib: j.lib, etape: j.etape, type: j.type, etat, ok: etat === 'ok' };
  });
}
// Ce que l'enseignant lit dans le détail : clics pour retrouver l'adresse, vérifications de la travée…
export function detailVisite(M, e) {
  const d = {};
  M.visite.etapes.forEach((et) => {
    const x = ((e && e.x) || {})[et.id] || {};
    if (et.type === 'adresse') d[et.id] = { clics: (x.clics || []).length, trouve: !!x.trouve };
    if (et.type === 'delimiter') d[et.id] = { verifs: x.verifs || 0, fauxCibles: x.fauxCibles || 0 };
  });
  return d;
}

/* ======================================================================= vue */
// Une seule écoute du redimensionnement pour toute la page, branchée sur la visite affichée en dernier.
let calerCourant = null;
if (typeof window !== 'undefined') window.addEventListener('resize', () => { if (calerCourant) calerCourant(); });

// `O` : ce que prête `creerEntrepot` — la géométrie du plan, le plan et la vue de face déjà écrits, l'état
// d'écran partagé (`ui.trav`, `ui.anim`, `ui.marque`, `ui.focus`), Échap, le clavier.
export function creerVisite(P, M, O) {
  const V = M.visite, ui = O.ui, G = O.G;
  Object.assign(ui, { actif: {}, photo: null, msgs: {}, zoomDe: null, survol: null });
  const ET = V.etapes;
  const per = P.personnage || {};
  const xDe = (e, et) => e.x[et.id] || (e.x[et.id] = {});
  const num = (k, t) => `<span class="pe-num pv-num">${k}</span><span>${t}</span>`;
  const msgDe = (et) => ui.msgs[et.id] || { t: '', type: '' };
  const dire = (et, t, type) => { ui.msgs[et.id] = { t, type: type || '' }; };
  const htmlMsg = (et, cls = '') => { const m = msgDe(et); return `<div class="pe-msg pv-msg ${m.type ? `pe-${m.type}` : ''} ${cls}" data-pv-msg>${m.t}</div>`; };
  // Un faux état pour le plan et la vue de face du premier chantier : aucune palette de l'élève.
  const E0 = { place: {}, vides: [], aideCharge: false };
  const R0 = { bandes: false, parcours: false, eval: false, aideCharge: false, g: false };

  /* ------------------------------------------------------------ les photos */
  // Une photo garde ses proportions et prend la plus grande place qui tient (calée par `ajuster`) ; un calque
  // SVG dans le repère déclaré porte les points, les zones cliquées, la correction.
  function photo(k, calque, o = {}) {
    const im = V.images[k], [L, H] = im.repere;
    const svg = calque == null ? '' : `<svg class="pv-calque${o.vise ? ' pv-vise' : ''}" viewBox="0 0 ${L} ${H}" data-pv-calque="${ech(k)}" aria-hidden="${o.vise ? 'true' : 'false'}">${calque}</svg>`;
    const corps = `<img src="${ech(im.src)}" alt="${ech(o.alt || im.alt || '')}" data-pv-img="${ech(k)}" data-pv-repere="${L}x${H}" draggable="false">${svg}`;
    return `<div class="pv-boite"><div class="pv-fit" data-pv-r="${L / H}">${o.drone ? `<div class="pv-drone" data-pv-drone style="transform:${o.transform || 'none'}">${corps}</div>` : corps}</div></div>
      <div class="pv-mention">${ech(im.mention || '')}${o.apres || ''}</div>`;
  }
  // L'effet drone : la photo zoome sur le point ouvert, sans sortir de ses bords (maquette `zoomer`).
  function zoomDe(et, n) {
    const p = n && et.points.find((q) => q.n === n);
    if (!p || !p.zoom) return 'none';
    const [W, H] = V.images[et.image].repere, s = p.zoom.s;
    const tx = Math.min(0, Math.max(W - W * s, W / 2 - p.zoom.cx * s)), ty = Math.min(0, Math.max(H - H * s, H / 2 - p.zoom.cy * s));
    return `translate(${(tx / W * 100).toFixed(3)}%,${(ty / H * 100).toFixed(3)}%) scale(${s})`;
  }

  /* --------------------------------------------------------- les étapes */
  // Chaque brique rend { consigne, cote, espace } ; ses gestes se branchent dans `brancher`.
  const B = {};

  B.accueil = (e, et) => ({
    consigne: num('→', et.consigne || 'Lisez le message, puis cliquez <b>Suivant</b>.'),
    cote: `<h3>${ech(et.liste || 'Ce que tu vas faire')}</h3><ol class="pv-programme">${(et.programme || []).map((l) => `<li>${l}</li>`).join('')}</ol>
      ${et.encadre ? `<div class="pe-encadre">${et.encadre}</div>` : ''}`,
    espace: heros(et, et.surTitre, et.grandTitre, et.intro),
  });
  function heros(et, sur, titre, texte) {
    const im = et.image && V.images[et.image];
    return `<div class="pv-heros">${im ? `<img src="${ech(im.src)}" alt="${ech(im.alt || '')}" data-pv-img="${ech(et.image)}">` : ''}<div class="pv-voile"></div>
      <div class="pv-heros-txt">${sur ? `<div class="pv-sur">${sur}</div>` : ''}${titre ? `<h2>${titre}</h2>` : ''}${texte ? `<p>${texte}</p>` : ''}</div>
      ${im ? `<div class="pv-credit">${ech(im.mention || '')}</div>` : ''}</div>`;
  }

  B.fin = (e, et) => ({
    consigne: num('✓', et.consigne || 'La visite est terminée.'),
    cote: `<h3>${ech(et.liste || 'La visite')}</h3><div class="pv-liste">${ET.filter((t) => t !== et && t.type !== 'accueil').map((t) => `<div class="pv-ligne${finie(t, e.x[t.id]) ? ' pv-vu' : ''}">${finie(t, e.x[t.id]) ? '✓' : '·'} ${ech(t.titre)}</div>`).join('')}</div>`,
    espace: heros(et, et.surTitre, et.grandTitre || 'Fin de la visite', et.intro || ''),
  });

  // Questions : une à la fois, on clique sur la photo. `Q` = la déclaration (étape ou `puis`), `x` = son état.
  const qCourante = (Q, x) => Q.questions.findIndex((q) => !(x.rep || {})[q.id]);
  function consigneQuestions(et, Q, x) {
    const i = qCourante(Q, x), n = Q.questions.length;
    if (i < 0) return num('✓', Q.consigneFini || et.consigneFini || 'Étape terminée. Cliquez <b>Suivant</b>.');
    return num(`${i + 1}/${n}`, fmt(Q.consigne || '{q} <b>Cliquez sur la photo.</b>', Q.questions[i]));
  }
  function listeQuestions(et, Q, x) {
    const i = qCourante(Q, x);
    return `<h3>${ech(Q.liste || `Les ${Q.questions.length} questions`)}</h3><div class="pv-liste">${Q.questions.map((q, k) => {
      const ok = (x.rep || {})[q.id], ess = (x.essais || {})[q.id] || 0;
      return `<div class="pv-ligne${ok ? ' pv-vu' : ''}${k === i ? ' pv-ici' : ''}" data-pv-q="${ech(q.id)}">${ok ? '✓' : k === i ? '→' : '·'} ${q.q ? ech(q.q) : ech(q.mot)}${ok && ess > 1 ? ` <span class="pe-petit">(${ess} essais)</span>` : ''}</div>`;
    }).join('')}</div>${htmlMsg(et)}`;
  }
  function repondre(et, Q, x, p) {
    const i = qCourante(Q, x);
    if (i < 0) return;
    const q = Q.questions[i];
    x.essais = x.essais || {}; x.rep = x.rep || {};
    x.essais[q.id] = (x.essais[q.id] || 0) + 1;
    if (dansZones(p.x, p.y, q.zones)) { x.rep[q.id] = true; dire(et, fmt(Q.juste || 'Oui, c’est bien ici.', q), 'oui'); }
    else dire(et, fmt(Q.faux || 'Pas ici.', q), 'non');
  }

  B.photoPoints = (e, et) => {
    const x = xDe(e, et), vus = x.vus || [], N = et.points.length, tous = vus.length === N;
    const enQ = !!(et.puis && x.q);
    const actif = enQ ? null : ui.actif[et.id] || null;
    const r = et.rayon || 24, fs = Math.round(r * 0.95);
    let consigne;
    if (enQ) consigne = consigneQuestions(et, et.puis, x);
    else if (!tous) consigne = num(`${vus.length}/${N}`, fmt(et.consigne || 'Ouvrez les <b>{n} points</b> de la photo.', { n: N }));
    else if (et.puis) consigne = num(`${N}/${N}`, et.consigneTous || 'Tous les points sont ouverts. Cliquez le bouton (à gauche) pour passer aux questions.');
    else consigne = num('✓', et.consigneFini || 'Étape terminée. Cliquez <b>Suivant</b>.');
    const zoom = et.effet === 'zoom';
    const lignePoint = (p) => {
      const vu = vus.includes(p.n), on = actif === p.n;
      if (zoom) return `<button type="button" class="pv-btn-ligne${vu ? ' pv-vu' : ''}" data-pv-point="${p.n}" data-pe-cle="ligne:${p.n}" aria-pressed="${on}"><b>${p.n}. ${vu ? ech(p.mot) : '…'}</b>${vu ? (on ? `<span class="pv-def">${ech(p.def)}</span>` : '') : `<span class="pe-petit">${ech(et.indice || 'cliquer pour zoomer')}</span>`}</button>`;
      return `<button type="button" class="pv-btn-ligne${vu ? ' pv-vu' : ''}" data-pv-point="${p.n}" data-pe-cle="ligne:${p.n}" aria-pressed="${on}"><b>${p.n}. ${ech(p.mot)}</b>${on ? `<span class="pv-def">${ech(p.def)}</span>` : vu ? '' : `<span class="pe-petit">${ech(et.indice || 'cliquer pour lire')}</span>`}</button>`;
    };
    let cote;
    if (enQ) {
      cote = listeQuestions(et, et.puis, x) + `<h3>${ech(et.liste || `Les ${N} points`)}</h3><div class="pv-liste">${et.points.map((p) => `<div class="pv-ligne"><b>${p.n}. ${ech(p.mot)}</b><span class="pe-petit">${ech(p.def)}</span></div>`).join('')}</div>`;
    } else {
      cote = `<h3>${ech(et.liste || `Les ${N} points`)} (${vus.length} / ${N})</h3><div class="pv-liste">${et.points.map(lignePoint).join('')}</div>
        ${tous && et.puis ? `<button type="button" class="btn btn-p pv-lancer" data-pv="questions" data-pe-cle="b:questions">${ech(et.puis.bouton || 'Passer aux questions →')}</button>` : ''}`;
    }
    let calque = '';
    if (!enQ) {
      calque = et.points.map((p) => {
        const vu = vus.includes(p.n), on = actif === p.n;
        let s = '';
        if (p.cx != null) s += `<line x1="${p.x}" y1="${p.y}" x2="${p.cx}" y2="${p.cy}" stroke="#fbfaf6" stroke-width="${r / 6}"/><line x1="${p.x}" y1="${p.y}" x2="${p.cx}" y2="${p.cy}" stroke="#1a1915" stroke-width="${r / 12}"/>`;
        s += `<circle cx="${p.x}" cy="${p.y}" r="${(r * 1.42).toFixed(1)}" fill="rgba(0,0,0,.3)"/>
          <circle class="pv-disque" cx="${p.x}" cy="${p.y}" r="${r}" fill="${on ? 'var(--pv-actif)' : vu ? 'var(--pv-vu)' : '#fbfaf6'}" stroke="${vu && !on ? '#fbfaf6' : '#1a1915'}" stroke-width="${(r / 8).toFixed(1)}"/>
          <text x="${p.x}" y="${p.y + fs / 3}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${vu && !on ? '#fbfaf6' : '#1a1915'}">${p.n}</text>`;
        if (et.effet === 'bulle' && on) {
          const [L] = V.images[et.image].repere, bf = Math.round(r * 0.83), lw = Math.round(p.mot.length * bf * 0.6 + bf * 1.5), h = Math.round(bf * 2.3);
          const bx = p.x + r * 1.6 + lw > L ? p.x - r * 1.6 - lw : p.x + r * 1.6;
          s += `<rect x="${bx}" y="${p.y - h / 2}" width="${lw}" height="${h}" rx="5" fill="#fbfaf6" stroke="#1a1915" stroke-width="2.5"/><text x="${bx + bf * 0.75}" y="${p.y + bf * 0.4}" font-size="${bf}" font-weight="700" fill="#1a1915" data-pv-bulle="${p.n}">${ech(p.mot)}</text>`;
        }
        return `<g class="pv-point${on ? ' pv-on' : ''}" data-pv-point="${p.n}" data-pe-cle="point:${p.n}" tabindex="0" role="button" aria-label="Point ${p.n}${vu ? ` : ${ech(p.mot)}` : ''}">${s}</g>`;
      }).join('');
    }
    const vise = enQ && qCourante(et.puis, x) >= 0;
    const tout = zoom && actif ? ' <button type="button" class="btn pv-petit-btn" data-pv="vueEnsemble" data-pe-cle="b:vueEnsemble">⤢ Vue d’ensemble</button>' : '';
    return { consigne, cote, espace: photo(et.image, calque, { drone: zoom, transform: zoom ? zoomDe(et, actif) : null, vise, apres: tout }) };
  };

  B.photoQuestions = (e, et) => {
    const x = xDe(e, et);
    return { consigne: consigneQuestions(et, et, x),
      cote: listeQuestions(et, et, x) + (et.encadre ? `<div class="pe-encadre">${et.encadre}</div>` : ''),
      espace: photo(et.image, '', { vise: qCourante(et, x) >= 0 }) };
  };

  /* ----------------------------------------------------------- le parcours */
  // Les ancres, dans le repère du plan (celui du premier chantier) : les mêmes points que la maquette v2
  // pour un plan de 2 allées de 2 côtés et 4 travées (800 × 562).
  function ancre(p) {
    const [type, nom] = String(p.ancre).split(':');
    const yT = G.yPr + 23, xC = (G.droite + G.ZX) / 2;
    let pt;
    if (type === 'quai') pt = [G.quaiX(M.zones.quais.indexOf(nom)) + 40, yT];
    else if (nom === 'reception') pt = [G.ZX + 108, G.recep.y + Math.min(110, G.recep.h - 20)];
    else if (nom === 'litiges') pt = [xC, G.litiges.y + G.litiges.h / 2];
    else if (nom === 'bureau') pt = [xC, G.bureau.y + 27];
    else if (nom === 'principale') pt = [G.quaiX(0) + 30, yT];
    else pt = [G.allees[nom].cx, O.Y0 + M.T * O.TH * 0.65];
    const d = p.decalage || [0, 0];
    return [pt[0] + d[0], pt[1] + d[1]];
  }
  // La trace : d'une étape à la suivante en suivant les allées — on descend à l'allée principale, on la
  // longe, on remonte (tout droit si les deux étapes sont l'une au-dessus de l'autre).
  function trace(pts) {
    const yT = G.yPr + 23, L = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (Math.abs(x0 - x1) > 1) { if (Math.abs(y0 - yT) > 1) L.push([x0, yT]); L.push([x1, yT]); }
      const z = L[L.length - 1];
      if (Math.abs(z[0] - x1) > 1 || Math.abs(z[1] - y1) > 1) L.push([x1, y1]);
    }
    return L;
  }
  function dessusParcours(et, x) {
    const vus = x.vus || [], on = ui.actif[et.id] || null, pts = et.etapes.map(ancre);
    let s = `<polyline points="${trace(pts).map((p) => p.map((v) => Math.round(v)).join(',')).join(' ')}" fill="none" stroke="var(--pe-visite)" stroke-width="4" stroke-dasharray="10 7" opacity=".85" data-pv-trace/>`;
    et.etapes.forEach((p, i) => {
      if (!(p.images || []).length) return;
      const [cx, cy] = pts[i], a = (p.dir || 0) * Math.PI / 180, L = p.cone || 70, sp = 0.45;
      const p1 = [cx + L * Math.cos(a - sp), cy + L * Math.sin(a - sp)].map((v) => v.toFixed(1)), p2 = [cx + L * Math.cos(a + sp), cy + L * Math.sin(a + sp)].map((v) => v.toFixed(1));
      s += `<path d="M${cx},${cy} L${p1} A${L},${L} 0 0 1 ${p2} Z" fill="var(--pe-visite-voile)" stroke="var(--pe-visite)" stroke-width="1.5" pointer-events="none"/>`;
    });
    et.etapes.forEach((p, i) => {
      const [cx, cy] = pts[i], vu = vus.includes(p.n), o = on === p.n;
      s += `<g class="pv-etape" data-pv-etape="${p.n}" data-pe-cle="etape:${p.n}" tabindex="0" role="button" aria-label="Étape ${p.n}${vu ? ` : ${ech(p.titre)}` : ''}">
        <circle cx="${cx}" cy="${cy}" r="${o ? 21 : 17}" fill="${vu ? 'var(--pe-visite)' : 'var(--panneau)'}" stroke="var(--pe-visite)" stroke-width="4"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="17" font-weight="800" fill="${vu ? 'var(--panneau)' : 'var(--pe-visite)'}">${p.n}</text></g>`;
    });
    return s;
  }
  B.parcours = (e, et) => {
    const x = xDe(e, et), vus = x.vus || [], N = et.etapes.length;
    const on = ui.actif[et.id] ? et.etapes[ui.actif[et.id] - 1] : null;
    const consigne = vus.length < N ? num(`${vus.length}/${N}`, et.consigne || 'Cliquez les étapes du parcours <b>dans l’ordre</b>, sur le plan.')
      : num('✓', et.consigneFini || 'Le tour est fini. Cliquez <b>Suivant</b>.');
    const cote = `<h3>${ech(et.liste || 'Le parcours')} (${vus.length} / ${N})</h3><div class="pv-liste">${et.etapes.map((p) => {
      const vu = vus.includes(p.n);
      return `<button type="button" class="pv-btn-ligne${vu ? ' pv-vu' : ''}" data-pv-etape="${p.n}" data-pe-cle="ligneEtape:${p.n}" aria-pressed="${on === p}"><span class="pv-pastille${vu ? ' pv-plein' : ''}">${p.n}</span>${vu ? ech(p.titre) : '…'}</button>`;
    }).join('')}</div>${htmlMsg(et)}
      ${on ? `<div class="pv-parole"><b>${ech(per.nom || '')} — ${on.n}. ${ech(on.titre)}</b>${on.texte || ''}</div>${(on.images || []).length && ui.photo !== on.n ? `<button type="button" class="btn" data-pv="revoir" data-pe-cle="b:revoir">📷 Revoir la photo</button>` : ''}`
        : et.debut ? `<div class="pe-encadre">${et.debut}</div>` : ''}`;
    let espace;
    if (on && ui.photo === on.n) {
      const ks = on.images;
      espace = `${entete(`Plan › <b>${on.n}. ${ech(on.titre)}</b> › photo`, '')}
        <div class="pv-main">${ks.length === 1 ? photo(ks[0], null, { alt: `${on.titre} : ce qu’on voit depuis l’étape ${on.n}` })
          : `<div class="pv-duo">${ks.map((k) => `<div class="pv-col">${photo(k, null, { alt: on.titre })}</div>`).join('')}</div>`}</div>`;
    } else {
      espace = `<div class="pv-main">${O.htmlPlan(E0, R0, { lecture: true, dessus: dessusParcours(et, x), aria: 'Plan de la plateforme avec le parcours de visite' })}</div>`;
    }
    return { consigne, cote, espace };
  };

  /* ------------------------------------------- associer une photo au plan */
  // Le plan (les numéros du parcours, sans titres ni trace) à gauche, une photo à la fois à droite : l'élève
  // clique le numéro de l'endroit d'où la photo est prise. Juste : photo suivante ; faux : il recommence.
  const parcoursDe = (et) => ET.find((t) => t.id === et.parcours);
  const photoCourante = (et, x) => et.photos.findIndex((ph) => !(x.rep || {})[ph.id]);
  B.associer = (e, et) => {
    const x = xDe(e, et), rep = x.rep || {}, par = parcoursDe(et), N = et.photos.length, i = photoCourante(et, x);
    const titre = (n) => par.etapes[n - 1].titre;
    const consigne = i < 0 ? num('✓', et.consigneFini || 'Étape terminée. Cliquez <b>Suivant</b>.')
      : num(`${i + 1}/${N}`, et.consigne || 'D’où a été prise cette photo ? Cliquez son numéro sur le plan.');
    const faites = et.photos.filter((ph) => rep[ph.id]).length;
    const cote = `<h3>${ech(et.liste || 'Les photos')} (${faites} / ${N})</h3><div class="pv-liste">${et.photos.map((ph, k) => {
      const ok = rep[ph.id], ess = (x.essais || {})[ph.id] || 0;
      return `<div class="pv-ligne${ok ? ' pv-vu' : ''}${k === i ? ' pv-ici' : ''}" data-pv-q="${ech(ph.id)}">${ok ? `✓ Photo ${k + 1} : n° ${ph.n}, ${ech(titre(ph.n))}` : k === i ? `→ Photo ${k + 1}` : `· Photo ${k + 1}`}${ok && ess > 1 ? ` <span class="pe-petit">(${ess} essais)</span>` : ''}</div>`;
    }).join('')}</div>${htmlMsg(et)}${et.encadre ? `<div class="pe-encadre">${et.encadre}</div>` : ''}`;
    // Un numéro dont la photo est trouvée se remplit ; rien d'autre ne distingue les endroits.
    const trouves = new Set(et.photos.filter((ph) => rep[ph.id]).map((ph) => ph.n));
    const dessus = par.etapes.map((p) => {
      const [cx, cy] = ancre(p), plein = trouves.has(p.n);
      return `<g class="pv-etape" data-pv-num="${p.n}" data-pe-cle="num:${p.n}" tabindex="0" role="button" aria-label="Endroit n° ${p.n}">
        <circle cx="${cx}" cy="${cy}" r="24" fill="${plein ? 'var(--pe-visite)' : 'var(--panneau)'}" stroke="var(--pe-visite)" stroke-width="4"/>
        <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${plein ? 'var(--panneau)' : 'var(--pe-visite)'}">${p.n}</text></g>`;
    }).join('');
    const k = i < 0 ? N - 1 : i, ph = et.photos[k];
    const espace = `<div class="pv-duo pv-associer"><div class="pv-col pv-col-plan"><div class="pv-main">${O.htmlPlan(E0, R0, { lecture: true, dessus, aria: 'Plan de la plateforme : les endroits du parcours, numérotés' })}</div></div>
      <div class="pv-col" data-pv-photo="${ech(ph.id)}">${photo(ph.image, null, { alt: `Photo ${k + 1}` })}</div></div>`;
    return { consigne, cote, espace };
  };
  function associer(et, x, n) {
    const i = photoCourante(et, x);
    if (i < 0) return;
    const ph = et.photos[i], par = parcoursDe(et);
    x.essais = x.essais || {}; x.rep = x.rep || {};
    x.essais[ph.id] = (x.essais[ph.id] || 0) + 1;
    if (n === ph.n) { x.rep[ph.id] = true; dire(et, fmt(et.juste || 'Oui.', { n, titre: ech(par.etapes[n - 1].titre) }), 'oui'); }
    else dire(et, fmt(et.faux || 'Non.', { n }), 'non');
  }

  function entete(fil, msg) {
    return `<div class="pe-entete pv-entete"><div class="pe-fil">${fil}</div><div class="pe-msg-vue">${msg}</div>
      <button type="button" class="btn btn-p pe-retour" data-pv="retour" data-pe-cle="b:retour">← Retour au plan</button></div>`;
  }

  /* -------------------------------------------------- délimiter, puis zones */
  B.delimiter = (e, et) => {
    const x = xDe(e, et), pts = x.pts || [], Z = et.puis, ok = !!x.ok;
    const nC = Z ? Z.cibles.length : 0, trouvees = x.cibles || [], toutes = !Z || trouvees.length === nC;
    const consigne = ok && toutes ? num('✓', et.consigneFini || 'Étape terminée. Cliquez <b>Suivant</b>.')
      : ok ? num(`${trouvees.length}/${nC}`, Z.consigne || 'Cliquez chaque cible.')
        : num(`${pts.length}/4`, et.consigne || 'Cliquez <b>les 4 coins</b> sur la photo.');
    const noms = Object.assign({}, NOMS_COINS, et.noms || {});
    const m = msgDe(et);
    let cote;
    if (ok) {
      cote = `<h3>${ech(et.liste || 'La forme')}</h3><div class="pv-liste"><div class="pv-ligne pv-vu" data-pv-coins-ok>✓ Les 4 coins sont justes</div></div>`;
      if (!trouvees.length && !x.fauxCibles) cote += `<div class="pe-msg pv-msg pe-oui" data-pv-msg>${et.messages && et.messages.juste ? et.messages.juste : ''}</div>`;
      if (Z) {
        cote += `<h3>${ech(Z.liste || 'Les cibles')} (${trouvees.length} / ${nC})</h3><div class="pv-liste">${Z.cibles.map((c, i) => `<div class="pv-ligne${trouvees.includes(i) ? ' pv-vu' : ''}" data-pv-cible="${i}">${trouvees.includes(i) ? `✓ ${ech(c.nom)}` : '· …'}</div>`).join('')}</div>`;
        if (trouvees.length || x.fauxCibles) cote += htmlMsg(et);
      }
      cote += Z && Z.rappel ? `<div class="pe-encadre">${Z.rappel}</div>` : '';
    } else {
      cote = `<h3>${ech(et.listeCoins || 'Les 4 coins')}</h3><div class="pv-liste">${COINS.map((k) => {
        const bon = x.verifie && !(x.faux || []).includes(k);
        return `<div class="pv-ligne${x.verifie && bon ? ' pv-vu' : ''}" data-pv-coin="${k}" data-ok="${x.verifie ? bon : ''}">${x.verifie ? (bon ? '✓' : '<span class="pe-ko">✗</span>') : '·'} Coin ${ech(noms[k])}</div>`;
      }).join('')}</div>${m.t ? htmlMsg(et) : ''}
        <div class="pv-boutons"><button type="button" class="btn btn-p" data-pv="verifierCoins" data-pe-cle="b:verifierCoins" ${pts.length < 4 ? 'disabled' : ''}>Vérifier</button>
        <button type="button" class="btn" data-pv="effacerCoins" data-pe-cle="b:effacerCoins" ${pts.length ? '' : 'disabled'}>Effacer</button></div>
        ${et.rappel ? `<div class="pe-encadre">${et.rappel}</div>` : ''}`;
    }
    const [L] = V.images[et.image].repere, u = L / 1100;   // les tailles de la maquette sont pour 1100 de large
    let s = '';
    if (ok) {
      const C = et.coins;
      s += `<polygon points="${[C.hg, C.hd, C.bd, C.bg].map((p) => p.join(',')).join(' ')}" fill="rgba(16,124,65,.18)" stroke="var(--pv-juste)" stroke-width="${8 * u}" data-pv-correction/>`;
      ((et.correction || {}).legendes || []).forEach((l) => {
        const f = (l.plein ? 40 : 34) * u, w = Math.max((l.plein ? 300 : 160) * u, String(l.texte).length * f * 0.62 + 40 * u), h = (l.plein ? 60 : 44) * u;
        s += `<g transform="rotate(${l.rot || 0} ${l.x} ${l.y})"><rect x="${l.x - w / 2}" y="${l.y - h / 2 - 8 * u}" width="${w}" height="${h}" rx="${8 * u}" fill="${l.plein ? 'var(--pv-juste)' : '#fbfaf6'}" stroke="var(--pv-juste)" stroke-width="${4 * u}"/>
          <text x="${l.x}" y="${l.y + f * 0.3 - 8 * u + 2 * u}" text-anchor="middle" font-size="${f}" font-weight="800" fill="${l.plein ? '#fbfaf6' : 'var(--pv-juste)'}">${ech(l.texte)}</text></g>`;
      });
      if (Z) {
        trouvees.forEach((i) => {
          const c = Z.cibles[i], [x0, x1] = c.x || Z.x;
          s += `<rect x="${x0 + 10 * u}" y="${c.y0}" width="${x1 - x0 - 20 * u}" height="${c.y1 - c.y0}" rx="${6 * u}" fill="rgba(251,250,246,.25)" stroke="#fbfaf6" stroke-width="${5 * u}"/>
            <rect x="${x0 + 30 * u}" y="${c.y0 - 2 * u}" width="${String(c.nom).length * 19 * u + 30 * u}" height="${40 * u}" rx="${8 * u}" fill="#fbfaf6" stroke="var(--pv-juste)" stroke-width="${4 * u}"/>
            <text x="${x0 + 45 * u}" y="${c.y0 + 28 * u}" font-size="${30 * u}" font-weight="800" fill="var(--pv-juste)" data-pv-trouvee="${i}">${ech(c.nom)}</text>`;
        });
      }
    } else {
      const c4 = pts.length === 4 ? coinsDe(pts) : null;
      if (c4) s += `<polygon points="${[c4.hg, c4.hd, c4.bd, c4.bg].map((p) => p.join(',')).join(' ')}" fill="rgba(21,101,192,.15)" stroke="var(--pv-pose)" stroke-width="${6 * u}" stroke-dasharray="${18 * u} ${10 * u}" pointer-events="none"/>`;
      pts.forEach((p, i) => {
        const k = c4 ? COINS.find((q) => c4[q] === p) : null, faux = x.verifie && k && (x.faux || []).includes(k);
        s += `<g class="pv-pose" data-pv-pose="${i}" data-faux="${!!faux}"><circle cx="${p[0]}" cy="${p[1]}" r="${34 * u}" fill="${faux ? 'var(--pv-faux)' : 'var(--pv-pose)'}" stroke="#fbfaf6" stroke-width="${6 * u}"/>
          <text x="${p[0]}" y="${p[1] + 12 * u}" text-anchor="middle" font-size="${34 * u}" font-weight="800" fill="#fbfaf6">${faux ? '✗' : i + 1}</text></g>`;
      });
    }
    return { consigne, cote, espace: photo(et.image, s, { vise: !(ok && toutes) }) };
  };
  function verifierCoins(et, x) {
    const pts = x.pts || [];
    if (pts.length !== 4) return;
    x.verifs = (x.verifs || 0) + 1; x.faux = coinsFaux(et, pts); x.verifie = true;
    // Les coins faux de la PREMIÈRE vérification, pour la note au premier essai (rangés une fois pour toutes).
    if (x.verifs === 1) x.faux1 = x.faux.slice();
    const noms = Object.assign({}, NOMS_COINS, et.noms || {});
    const M2 = et.messages || {};
    if (!x.faux.length) { x.ok = true; dire(et, M2.juste || 'Oui.', 'oui'); }
    else {
      const f = x.faux.map((k) => noms[k]);
      dire(et, fmt(M2.faux || 'Pas encore : {coins}.', { coins: `coin${f.length > 1 ? 's' : ''} ${f.join(', ')}` }), 'non');
    }
  }
  // Ordre de jugement (maquette) : cible (dans sa bande ET son étendue) → bonne hauteur hors de l'étendue →
  // piège déclaré → hors cible. Un re-clic sur une cible trouvée n'est pas compté faux.
  function cliquerZones(et, x, p) {
    const Z = et.puis, mg = Z.marge || 0;
    const dansX = (c) => { const [a, b] = c.x || Z.x; return p.x >= a && p.x <= b; };
    const bande = (c) => p.y >= c.y0 - mg && p.y <= c.y1 + mg;
    x.cibles = x.cibles || [];
    const i = Z.cibles.findIndex((c) => bande(c) && dansX(c));
    if (i >= 0) {
      if (x.cibles.includes(i)) { dire(et, Z.dejaTrouve || 'Déjà trouvée.', ''); return; }
      x.cibles.push(i);
      dire(et, fmt(Z.juste || 'Oui : {nom}.', Z.cibles[i]), 'oui');
      return;
    }
    x.fauxCibles = (x.fauxCibles || 0) + 1;
    const pg = (Z.pieges || []).find((c) => p.y >= c.y0 && p.y <= c.y1 && dansX(c));
    if (Z.cibles.some(bande)) dire(et, Z.horsEtendue || 'Pas ici.', 'non');
    else if (pg) dire(et, pg.message || 'Pas ici.', 'non');
    else dire(et, Z.horsCible || 'Pas ici.', 'non');
  }

  /* ---------------------------------------------------------- l'adresse */
  const etiquette = (et, petite) => `<span class="pv-etiq${petite ? ' pv-etiq-petite' : ''}" data-pv-etiquette>${et.code.split('-').map((p) => `<span>${ech(p)}</span>`).join('<span class="pv-tir">-</span>')}</span>`;
  function barreAdresse(et) {
    const t = ui.trav ? decoupe(`${ui.trav}-N1-E1`) : null, s = ui.survol ? decoupe(ui.survol) : null;
    const v = [t && t.c, t && `T${pad2(t.t)}`, s && `N${s.n}`, s && `E${s.e}`];
    const lib = ['allée · côté', 'travée', 'niveau', 'emplacement'];
    return `<span class="pe-lbl">${ech(et.libVous || 'Vous êtes en')}</span>${v.map((x, i) => `<span class="pe-case${x ? ' pe-plein' : ''}"><b>${x || '?'}</b><small>${lib[i]}</small></span>`).join('<span class="pe-tiret">-</span>')}
      <span class="pe-petit pv-cherche">${ech(et.libCherche || 'On cherche')} : <b class="pe-mono">${ech(et.code)}</b></span>`;
  }
  B.adresse = (e, et) => {
    const x = xDe(e, et), choix = x.choix || ['', '', '', ''];
    const parts = et.code.split('-');
    if (!x.valide) {
      const manque = choix.some((c) => !c);
      return { consigne: num(1, et.consigne || 'Que veut dire chaque partie ? Choisissez, puis validez.'),
        cote: `<h3>Rappel</h3>${et.rappel ? `<div class="pe-encadre">${et.rappel}</div>` : ''}`,
        espace: `<div class="pv-main pv-centre">${etiquette(et)}
          <div class="pv-decomp">${parts.map((p, i) => `<label><span class="pv-part pe-mono">${ech(p)}</span><select data-pv-choix="${i}" data-pe-cle="choix:${i}" aria-label="Sens de ${ech(p)}"><option value="">… choisir</option>${et.choix.map((o) => `<option ${choix[i] === o ? 'selected' : ''}>${ech(o)}</option>`).join('')}</select></label>`).join('')}</div>
          <button type="button" class="btn btn-p" data-pv="valider" data-pe-cle="b:valider" ${manque ? 'disabled' : ''}>Valider</button>
          <div class="pe-petit">${manque ? 'Choisissez le sens des 4 parties.' : ''}</div></div>` };
    }
    const consigne = x.trouve ? num('✓', et.consigneFini || 'Emplacement trouvé.')
      : !ui.trav ? num(2, fmt(et.consigneTravee || 'Retrouvez <b>{code}</b> : cliquez la bonne <b>travée</b> sur le plan.', { code: et.code }))
        : num(3, fmt(et.consigneEmplacement || 'Cliquez l’<b>emplacement</b> {code} dans la travée vue de face.', { code: et.code }));
    const cote = `<h3>${ech(et.liste || 'L’étiquette')}</h3>${etiquette(et, true)}
      <div class="pv-liste">${parts.map((p, i) => {
        const bon = choix[i] === et.sens[i];
        return `<div class="pv-ligne${bon ? ' pv-vu' : ''}" data-pv-part="${i}" data-ok="${bon}"><b class="pe-mono">${ech(p)}</b> = ${ech(et.sens[i])} ${bon ? '<span class="pe-ok">✓</span>' : `<span class="pe-ko">✗</span> <span class="pe-petit">(vous : ${ech(choix[i])})</span>`}</div>`;
      }).join('')}</div>${et.encadre ? `<div class="pe-encadre">${et.encadre}</div>` : ''}`;
    ui.marque = x.trouve ? et.code : null;
    let espace;
    const barre = `<div class="pe-adresse pv-barre" data-pv-barre>${barreAdresse(et)}</div>`;
    if (!ui.trav) espace = `${barre}<div class="pv-main">${O.htmlPlan(E0, R0, { aria: 'Plan de la plateforme, travées cliquables' })}</div>`;
    else {
      const c = M.cotes[ui.trav.split('-')[0]], m = msgDe(et);
      espace = `${entete(`Plan › <b>Travée</b> <span class="pe-mono">${ech(ui.trav)}</span> <span class="pe-petit">(vue depuis l’allée ${ech(c.allee)})</span>`,
        `<div class="pe-msg ${m.type ? `pe-${m.type}` : ''}" data-pv-msg>${m.t}</div>`)}${barre}<div class="pv-main">${O.htmlFace(E0, R0)}</div>`;
    }
    return { consigne, cote, espace };
  };
  // Le clic sur un emplacement : juste, ou un message qui NOMME la partie fausse (calculé, jamais déclaré).
  function cliquerEmplacement(et, x, a) {
    if (x.trouve) return;
    x.clics = (x.clics || []).concat(a);
    if (a === et.code) {
      x.trouve = true;
      const st = M.stock[a], p = st && M.produits[st.produit];
      dire(et, st ? fmt(et.trouve || '✓ Trouvé : <b>{adresse}</b> — une {produit} de {kg}.', { adresse: ech(a), produit: ech(p.nom), kg: `${Number(st.kg).toLocaleString('fr-FR')} kg` })
        : `✓ Trouvé : <b>${ech(a)}</b> — emplacement libre.`, 'oui');
      return;
    }
    const v = decoupe(a), c = decoupe(et.code), F = [];
    if (v.c !== c.c) F.push(`le côté (vous êtes en ${v.c}, il faut ${c.c})`);
    if (v.t !== c.t) F.push(`la travée (T${pad2(v.t)} au lieu de T${pad2(c.t)})`);
    if (v.n !== c.n) F.push(`le niveau (N${v.n} au lieu de N${c.n} — le sol est N1)`);
    if (v.e !== c.e) F.push(`l’emplacement (E${v.e} au lieu de E${c.e})`);
    dire(et, `✗ ${ech(a)} : ${F.join(', ')}.${v.c !== c.c || v.t !== c.t ? ' Revenez au plan.' : ''}`, 'non');
  }

  /* --------------------------------------------------------- navigation */
  const courante = (e) => Math.max(0, Math.min(ET.length - 1, e.courante || 0));
  const peutAller = (e, i, api) => !!(api && api.estProf) || i <= (e.atteinte || 0);
  function aller(e, i) {
    e.courante = i; e.atteinte = Math.max(e.atteinte || 0, i);
    ui.photo = null; ui.trav = null; ui.survol = null; ui.zoomDe = null;
  }

  /* ------------------------------------------------------------ l'écran */
  function html(e, api) {
    if (!e.x) Object.assign(e, etatVisiteNeuf(), e);
    const i = courante(e), et = ET[i], x = xDe(e, et);
    const C = B[et.type](e, et, api);
    const fin = finie(et, x), dernier = i === ET.length - 1;
    const file = ET.map((t, k) => {
      const fait = k !== i && t.type !== 'accueil' && t.type !== 'fin' && finie(t, e.x[t.id]);
      const ok = peutAller(e, k, api);
      return `<li><button type="button" class="pv-pas${k === i ? ' pv-on' : ''}${fait ? ' pv-fait' : ''}" data-pv-aller="${k}" data-pe-cle="aller:${k}" ${ok ? '' : 'disabled'} ${k === i ? 'aria-current="step"' : ''}><span>${fait ? '✓' : k + 1}</span>${ech(t.titre)}</button></li>`;
    }).join('');
    const tete = [[per.nom, per.role].filter(Boolean).join(', '), [per.date, et.heure].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
    const act = dernier ? '' : `<button type="button" class="btn btn-p" data-pv="suivant" data-pe-cle="b:suivant" ${fin ? '' : 'disabled'}>${ech(et.suivant || 'Suivant →')}</button>`;
    return `<div class="pe pv" data-entrepot="${ech(P.id)}" data-pe-mode="visite" data-pv-etape="${ech(et.id)}" data-pv-type="${et.type}" data-pv-finie="${fin}">
      <ol class="pv-file" aria-label="Les étapes de la visite">${file}</ol>
      <div class="pv-bandeau">
        <div class="pe-perso pv-perso"><b>${ech(tete)}</b>${et.texte || ''}</div>
        <div class="pv-consigne" data-pv-consigne>${C.consigne}</div>
        <div class="pv-act">${act}<span class="pe-petit" data-pv-aide>${fin ? '' : ech(et.aide || '')}</span></div></div>
      <div class="pv-jeu"><aside class="pv-cote" data-pv-cote>${C.cote}</aside>
        <section class="pv-espace">${C.espace}</section></div></div>`;
  }

  // Les photos et le plan prennent la plus grande taille qui tient sous le bandeau, page remontée en haut.
  function caler(racine) {
    const espace = racine.querySelector('.pv-espace');
    if (!espace || !espace.isConnected) return;
    const haut = espace.getBoundingClientRect().top + window.scrollY;
    racine.style.setProperty('--pv-h', `${Math.max(360, Math.round(window.innerHeight - haut - 14))}px`);
    racine.querySelectorAll('.pv-fit').forEach((el) => {
      const box = el.parentElement.getBoundingClientRect(), r = +el.dataset.pvR;
      let w = box.width, h = w / r;
      if (h > box.height) { h = box.height; w = h * r; }
      el.style.width = `${Math.floor(w)}px`; el.style.height = `${Math.floor(h)}px`;
    });
  }

  function brancher(z, e, api) {
    const racine = z.querySelector('.pv');
    if (!racine) return;
    const i = courante(e), et = ET[i], x = xDe(e, et);
    const redessiner = () => api.redessiner();
    const fait = () => { api.sauver(); redessiner(); };
    const activer = (el, fn) => {
      el.addEventListener('click', fn);
      if (el.tagName !== 'BUTTON') el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(ev); } });
    };
    const on = (cle, fn) => racine.querySelectorAll(`[data-pv="${cle}"]`).forEach((b) => activer(b, fn));
    // Le point cliqué, dans le repère de la photo (la photo peut être agrandie, zoomée : le calque suit).
    const point = (svg, ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

    calerCourant = () => caler(racine);
    caler(racine);
    // Une image dont le repère n'a pas la proportion du fichier : les coordonnées seraient fausses.
    racine.querySelectorAll('img[data-pv-repere]').forEach((im) => {
      const verif = () => {
        const [L, H] = im.dataset.pvRepere.split('x').map(Number);
        if (im.naturalWidth && Math.abs(im.naturalWidth / im.naturalHeight - L / H) / (L / H) > 0.01) console.error(`Visite : l'image ${im.dataset.pvImg} n'a pas la proportion de son repère (${L} × ${H})`);
      };
      if (im.complete) verif(); else im.addEventListener('load', verif, { once: true });
    });
    O.echap(racine, () => {
      if (et.type === 'parcours' && ui.photo) { ui.focus = `etape:${ui.photo}`; ui.photo = null; redessiner(); return true; }
      if (et.type === 'adresse' && ui.trav) { ui.focus = `trav:${ui.trav}`; ui.trav = null; ui.survol = null; dire(et, ''); redessiner(); return true; }
      return false;
    });
    racine.addEventListener('focusin', (ev) => { const t = ev.target.closest && ev.target.closest('[data-pe-cle]'); if (t) ui.focus = t.dataset.peCle; });
    if (O.clavier() && ui.focus) {
      const el = racine.querySelector(`[data-pe-cle="${CSS.escape(ui.focus)}"]`);
      if (el) el.focus({ preventScroll: true });
    }

    racine.querySelectorAll('[data-pv-aller]').forEach((b) => activer(b, () => {
      const k = +b.dataset.pvAller;
      if (k === i || !peutAller(e, k, api)) return;
      aller(e, k); ui.focus = `aller:${k}`; fait();
    }));
    on('suivant', () => { if (!finie(et, x) || i >= ET.length - 1) return; aller(e, i + 1); ui.focus = 'b:suivant'; fait(); });
    on('retour', () => {
      if (et.type === 'parcours') { ui.focus = `etape:${ui.photo}`; ui.photo = null; }
      if (et.type === 'adresse') { ui.focus = `trav:${ui.trav}`; ui.trav = null; ui.survol = null; dire(et, ''); }
      redessiner();
    });

    if (et.type === 'photoPoints') {
      const enQ = !!(et.puis && x.q);
      // Le zoom anime de l'ancien cadrage vers le nouveau : la photo est redessinée au nouveau, on la
      // remet un instant à l'ancien, puis la transition CSS fait le reste (coupée si mouvement réduit).
      const drone = racine.querySelector('[data-pv-drone]');
      if (drone && ui.zoomDe != null) {
        const cible = drone.style.transform;
        drone.style.transition = 'none'; drone.style.transform = ui.zoomDe;
        void drone.offsetWidth;
        drone.style.transition = ''; drone.style.transform = cible;
      }
      ui.zoomDe = null;
      if (!enQ) {
        const ouvrir = (n) => {
          ui.zoomDe = zoomDe(et, ui.actif[et.id] || null);
          ui.actif[et.id] = n;
          x.vus = x.vus || [];
          if (!x.vus.includes(n)) x.vus.push(n);
          fait();
        };
        racine.querySelectorAll('[data-pv-point]').forEach((g) => activer(g, () => { ouvrir(+g.dataset.pvPoint); }));
        on('vueEnsemble', () => { ui.zoomDe = zoomDe(et, ui.actif[et.id] || null); ui.actif[et.id] = null; ui.focus = null; redessiner(); });
        on('questions', () => { x.q = true; ui.actif[et.id] = null; dire(et, ''); fait(); });
      } else {
        const svg = racine.querySelector('.pv-calque.pv-vise');
        if (svg) svg.addEventListener('click', (ev) => { repondre(et, et.puis, x, point(svg, ev)); fait(); });
      }
    }
    if (et.type === 'photoQuestions') {
      const svg = racine.querySelector('.pv-calque.pv-vise');
      if (svg) svg.addEventListener('click', (ev) => { repondre(et, et, x, point(svg, ev)); fait(); });
    }
    if (et.type === 'parcours') {
      const ouvrir = (n) => {
        x.vus = x.vus || [];
        if (et.ordre !== false && n > x.vus.length + 1) { dire(et, fmt(et.ordreMsg || 'Dans l’ordre : l’étape suivante est la n° {n}.', { n: x.vus.length + 1 }), 'non'); redessiner(); return; }
        dire(et, '');
        ui.actif[et.id] = n;
        if (!x.vus.includes(n)) x.vus.push(n);
        ui.photo = (et.etapes[n - 1].images || []).length ? n : null;
        ui.focus = 'b:retour';
        fait();
      };
      racine.querySelectorAll('[data-pv-etape]').forEach((g) => activer(g, () => ouvrir(+g.dataset.pvEtape)));
      on('revoir', () => { ui.photo = ui.actif[et.id]; ui.focus = 'b:retour'; redessiner(); });
    }
    if (et.type === 'associer') {
      racine.querySelectorAll('[data-pv-num]').forEach((g) => activer(g, () => { associer(et, x, +g.dataset.pvNum); ui.focus = `num:${g.dataset.pvNum}`; fait(); }));
    }
    if (et.type === 'delimiter') {
      const svg = racine.querySelector('.pv-calque.pv-vise');
      if (svg && !x.ok) {
        svg.addEventListener('click', (ev) => {
          x.pts = x.pts || [];
          const g = ev.target.closest('[data-pv-pose]');
          if (g) { x.pts.splice(+g.dataset.pvPose, 1); x.verifie = false; dire(et, ''); fait(); return; }
          if (x.pts.length >= 4) return;
          const p = point(svg, ev);
          x.pts.push([Math.round(p.x), Math.round(p.y)]); x.verifie = false; dire(et, ''); fait();
        });
      } else if (svg && et.puis) svg.addEventListener('click', (ev) => { cliquerZones(et, x, point(svg, ev)); fait(); });
      on('verifierCoins', () => { verifierCoins(et, x); ui.focus = x.ok ? 'b:suivant' : 'b:verifierCoins'; fait(); });
      on('effacerCoins', () => { x.pts = []; x.verifie = false; x.faux = []; dire(et, ''); fait(); });
    }
    if (et.type === 'adresse') {
      racine.querySelectorAll('[data-pv-choix]').forEach((s) => s.addEventListener('change', () => {
        x.choix = (x.choix || ['', '', '', '']).slice(); x.choix[+s.dataset.pvChoix] = s.value; ui.focus = s.dataset.peCle; fait();
      }));
      on('valider', () => { if ((x.choix || []).filter(Boolean).length !== 4 || x.valide) return; x.valide = true; ui.focus = null; fait(); });
      racine.querySelectorAll('[data-pe-trav]').forEach((g) => activer(g, () => {
        ui.trav = g.dataset.peTrav; ui.anim = true; ui.survol = null; dire(et, '');
        ui.focus = `emp:${ui.trav}-N1-E1`; redessiner();
      }));
      const barre = racine.querySelector('[data-pv-barre]');
      racine.querySelectorAll('[data-pe-emp]').forEach((g) => {
        activer(g, () => { cliquerEmplacement(et, x, g.dataset.peEmp); fait(); });
        const sur = () => { ui.survol = g.dataset.peEmp; barre.innerHTML = barreAdresse(et); };
        const hors = () => { ui.survol = null; barre.innerHTML = barreAdresse(et); };
        g.addEventListener('mouseenter', sur); g.addEventListener('focus', sur);
        g.addEventListener('mouseleave', hors); g.addEventListener('blur', hors);
      });
    }
  }

  return {
    id: P.id,
    nav: { libelle: P.libelle || 'Visite' },
    etatNeuf: etatVisiteNeuf,
    jalons: (db) => jalonsVisite(M, (db && db.entrepots && db.entrepots[P.id]) || etatVisiteNeuf()),
    note: null,
    bonnesReponses: () => null,
    // Ce que lisent les tests et la page d'essai.
    lire: () => ({ actif: Object.assign({}, ui.actif), photo: ui.photo, trav: ui.trav, msgs: JSON.parse(JSON.stringify(ui.msgs)) }),
    html,
    brancher,
  };
}
