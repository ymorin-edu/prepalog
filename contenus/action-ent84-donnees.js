// ENT-8.4 — Action, « la semaine avant Noël » : les DONNÉES PURES de la séance (plan de la réception de Labastide, équipe, planigramme,
// banques et tirage, phrases calculées sur le travail de l'élève). Aucun effet de bord à l'import, aucune interface : importé par le contenu
// (`contenus/action-ent84.js`), les questions (`contenus/questions/ENT-8.4.js`, qui ne peuvent pas importer le contenu : il les importe) et
// le corrigé (`contenus/corriges/ENT-8.4.js`). Brief `docs/briefs/ENT-8.4-action-avant-noel.md` §6 et §6 bis ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-action.md` §6.3.
//
// VÉRIFIÉ / CONSTRUIT (brief ENT-8.3 §2 et ENT-8.4 §2) :
//   Vérifié (Cowork, 15 et 16/10/2026) : l'entrepôt Action de Labastide-Saint-Pierre (Tarn-et-Garonne), exploité par GXO ; le hub d'import
//   d'Action à Gonfreville-l'Orcher (port du Havre). Rien n'est publié sur les volumes du pic de Noël chez Action.
//   CONSTRUIT (dit dans la séance) : le PLAN de la réception (dessiné ici, RIEN n'est repris du livret d'accueil GXO publié), Romain, Lucas,
//   Inès et la répartition des tâches, le planigramme du jeudi 17 décembre et tous ses camions (noms GÉNÉRIQUES, aucune entreprise réelle),
//   l'erreur de Romain, les horaires, les quantités. Le pictogramme du point de rassemblement est un dessin original du dépôt
//   (`contenus/images/action/point-rassemblement.svg`, chantier images du 16/10/2026).
//
// Le plan resservira à l'évaluation C1.1 + C1.2 de janvier : elle l'importera d'ici (`PLAN_LABASTIDE`, `LIEUX_PLAN`), décision §6.3.

import { declarerTirage, hasard } from '../core/tirage.js';
import { ech } from './action.js';

export const ID = 'action-avant-noel';
export const ID_VOLET = 'action-ent84';
export const PLANNING_ID = 'action-labastide-quais';
export const PHRASES_ID = 'compte-rendu-romain';
// Les fiches (ids JAMAIS modifiés : écrits dans la base des élèves).
export const FICHES = { reperer: 'reperer', qui: 'qui-fait-quoi', lire: 'planigramme', docs: 'documents' };

// ─────────────────────────────────────────────────────────────── outils
export const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
const z2 = (n) => String(n).padStart(2, '0');
export const versHHMM = (m) => `${z2(Math.floor(m / 60))}:${z2(m % 60)}`;
// 420 → « 7 h », 450 → « 7 h 30 ».
export const heureLue = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${z2(m % 60)}` : ''}`;
export const nombre = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ─────────────────────────────────────────────────────────────── l'équipe de Labastide (CONSTRUITE, prénoms : brief §11 n° 1, défaut tranché)
export const EQUIPE_84 = {
  romain: { nom: 'Romain', role: 'chef d’équipe à la réception (ton tuteur)', appel: 'Romain', registre: 'tu' },
  lucas: { nom: 'Lucas', role: 'cariste', appel: 'Lucas', registre: 'tu' },
  ines: { nom: 'Inès', role: 'agent administratif', appel: 'Inès', registre: 'tu' },
};
// Les quatre choix de « Qui fait quoi ? », dans l'ordre FIXE de l'équipe (brief §4, étape 2).
export const EQUIPE_CHOIX = [
  { v: 'romain', lib: 'Romain, chef d’équipe' }, { v: 'lucas', lib: 'Lucas, cariste' },
  { v: 'moi', lib: 'toi, réceptionnaire' }, { v: 'ines', lib: 'Inès, agent administratif' },
];

// ─────────────────────────────────────────────────────────────── le planigramme (grille IDENTIQUE pour toute la classe, brief §6.1)
// Échelle 06:00–13:00 au pas de 30 min (décision §6.3 : la fenêtre « avant midi » doit pouvoir se déclencher ; l'après-midi reste vide).
export const ECHELLE = { debut: '06:00', fin: '13:00', pas: 30 };
export const QUAIS = [{ id: 'Q1', nom: 'Quai 1' }, { id: 'Q2', nom: 'Quai 2' }, { id: 'Q3', nom: 'Quai 3' }, { id: 'Q4', nom: 'Quai 4' }];
// Les camions déjà prévus (`occupe` du planning, document, lectures, phrases : TOUT en est calculé). CONSTRUITS.
export const CAMIONS = [
  { id: 'jouets', quai: 'Q1', de: '06:00', a: '07:30', court: 'Jouets', lib: 'le camion de jouets' },
  { id: 'decorations', quai: 'Q1', de: '07:30', a: '09:00', court: 'Décorations de Noël', lib: 'le camion de décorations de Noël' },
  { id: 'confiserie', quai: 'Q1', de: '09:30', a: '11:00', court: 'Confiserie', lib: 'le camion de confiserie' },
  { id: 'retours', quai: 'Q2', de: '06:00', a: '07:00', court: 'Retours des magasins', lib: 'le retour des magasins' },
  { id: 'havre', quai: 'Q2', de: '07:00', a: '08:30', court: 'Camion du Havre', lib: 'le camion du Havre', havre: true },
  { id: 'bougies', quai: 'Q2', de: '08:30', a: '10:00', court: 'Bougies', lib: 'le camion de bougies' },
  { id: 'papeterie', quai: 'Q2', de: '10:30', a: '12:00', court: 'Papeterie', lib: 'le camion de papeterie' },
  { id: 'menagers', quai: 'Q3', de: '06:30', a: '08:00', court: 'Produits ménagers', lib: 'le camion de produits ménagers' },
  { id: 'vaisselle', quai: 'Q3', de: '09:00', a: '10:30', court: 'Vaisselle', lib: 'le camion de vaisselle' },
  { id: 'havre2', quai: 'Q4', de: '06:00', a: '08:00', court: 'Camion du Havre (2e)', lib: 'le 2e camion du Havre', havre: true },
  { id: 'textile', quai: 'Q4', de: '08:00', a: '09:30', court: 'Textile', lib: 'le camion de textile' },
  { id: 'plein-air', quai: 'Q4', de: '10:00', a: '11:30', court: 'Jeux de plein air', lib: 'le camion de jeux de plein air' },
];
// La carte de Romain : posée au départ à sa place FAUSSE (`depart`, correctif moteur du 16/10/2026), l'élève la déplace.
export const CARTE = { id: 'societe', titre: 'Jeux de société — 1 h 30', court: 'Jeux de société', lib: 'le camion de jeux de société',
  duree: 90, des: '06:00', avant: '12:00', depart: { ligne: 'Q3', de: '07:30' } };
// La carte vue comme un camion de la grille (le planigramme de Romain).
export const camionCarte = (r = CARTE.depart.ligne, m = toMin(CARTE.depart.de)) => ({ id: CARTE.id, quai: r, de: versHHMM(m), a: versHHMM(m + CARTE.duree),
  court: CARTE.court, lib: CARTE.lib });
export const GRILLE_ROMAIN = [...CAMIONS, camionCarte()];
export const nomQuai = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
export const minQuai = (q) => nomQuai(q).replace(/^Q/, 'q');   // « quai 3 » dans une phrase
const chevauche = (a, b) => a.quai === b.quai && toMin(a.de) < toMin(b.a) && toMin(b.de) < toMin(a.a);

// Les paires de camions en même temps au même quai (ids triés).
export function conflits(camions) {
  const P = [];
  camions.forEach((c, i) => camions.slice(i + 1).forEach((d) => { if (chevauche(c, d)) P.push([c.id, d.id].sort()); }));
  return P;
}
// Les créneaux libres de la carte (quai, début en minutes) : 1 h 30 sans recouvrir aucun camion, dans la fenêtre (avant midi).
export function placesLibres(camions = CAMIONS) {
  const P = [];
  QUAIS.forEach((q) => {
    for (let m = toMin(CARTE.des); m + CARTE.duree <= toMin(CARTE.avant); m += ECHELLE.pas) {
      const c = camionCarte(q.id, m);
      if (!camions.some((x) => x.id !== CARTE.id && chevauche(x, c))) P.push([q.id, m]);
    }
  });
  return P;
}

// Les LECTURES, calculées sur une grille (la vraie, ou une grille modifiée par un test). Chaque lecture : { q, choix: [{ v, lib }], juste,
// justes (toutes les valeurs qui répondent à la question sur cette grille : une seule attendue) }. Aucune ne porte sur le quai 3 entre
// 7 h 30 et 9 h (elle montrerait l'erreur de Romain).
export function lecturesDe(camions = CAMIONS) {
  const L = {};
  const alpha = (X) => X.slice().sort((a, b) => a.lib.localeCompare(b.lib, 'fr'));
  const auQuai = (q) => camions.filter((c) => c.quai === q).sort((a, b) => toMin(a.de) - toMin(b.de));
  const vc = (c) => ({ v: c.id, lib: c.lib });
  // À quel quai arrivent les retours des magasins ?
  { const J = camions.filter((c) => c.id === 'retours');
    L['l-retours-quai'] = { q: 'À quel quai arrivent les retours des magasins ?', juste: J[0] ? J[0].quai : null, justes: J.map((c) => c.quai),
      choix: QUAIS.map((q) => ({ v: q.id, lib: q.nom })) }; }
  // Quel camion arrive le dernier au quai 2 ? (choix : les camions du quai 2)
  { const Q = auQuai('Q2'); const m = Q.length ? Math.max(...Q.map((c) => toMin(c.de))) : null; const J = Q.filter((c) => toMin(c.de) === m);
    L['l-q2-dernier'] = { q: 'Quel camion arrive le dernier au quai 2 ?', juste: J[0] ? J[0].id : null, justes: J.map((c) => c.id), choix: alpha(Q.map(vc)) }; }
  // Quel camion est au quai 1 à 10 h ? (choix : les camions du quai 1, et « aucun »)
  { const Q = auQuai('Q1'); const J = Q.filter((c) => toMin(c.de) <= 600 && toMin(c.a) > 600);
    L['l-q1-10h'] = { q: 'Quel camion est au quai 1 à 10 h ?', juste: J.length ? J[0].id : 'aucun', justes: J.length ? J.map((c) => c.id) : ['aucun'],
      choix: [...alpha(Q.map(vc)), { v: 'aucun', lib: 'aucun : le quai est libre' }] }; }
  // Combien de camions du Havre arrivent ce matin ?
  { const n = camions.filter((c) => c.havre).length;
    L['l-havre-combien'] = { q: 'Combien de camions du Havre arrivent ce matin ?', juste: String(n), justes: [String(n)],
      choix: [1, 2, 3, 4].map((k) => ({ v: String(k), lib: String(k) })) }; }
  // Quel camion libère le quai 4 en premier ? (choix : les camions du quai 4, et le camion qui libère son quai le premier ailleurs)
  { const Q = auQuai('Q4'); const m = Q.length ? Math.min(...Q.map((c) => toMin(c.a))) : null; const J = Q.filter((c) => toMin(c.a) === m);
    const ailleurs = camions.filter((c) => c.quai !== 'Q4').sort((a, b) => toMin(a.a) - toMin(b.a) || a.id.localeCompare(b.id))[0];
    L['l-q4-premier'] = { q: 'Quel camion libère le quai 4 en premier ?', juste: J[0] ? J[0].id : null, justes: J.map((c) => c.id),
      choix: alpha([...Q, ailleurs].filter(Boolean).map(vc)) }; }
  // Combien de camions sont prévus ce matin, sans celui de Romain ?
  { const n = camions.filter((c) => c.id !== CARTE.id).length;
    L['l-total'] = { q: 'Combien de camions sont prévus ce matin, sans celui de Romain ?', juste: String(n), justes: [String(n)],
      choix: [n - 1, n, n + 1, n + 2].map((k) => ({ v: String(k), lib: String(k) })) }; }
  return L;
}

// « Quel camion Romain a-t-il mal placé ? » : la carte, et trois camions de la grille qui ne sont dans AUCUN conflit (sinon « les produits
// ménagers » serait aussi une bonne réponse : les deux camions se recouvrent, rien ne dit lequel a été mal posé). D'abord les camions du même
// quai, puis ceux qui arrivent le plus près de l'heure de la carte. Ordre alphabétique des libellés.
export function choixTrouve(camions = CAMIONS, carte = camionCarte()) {
  const enConflit = new Set(conflits([...camions, carte]).flat());
  const autres = camions.filter((c) => !enConflit.has(c.id))
    .sort((a, b) => (a.quai === carte.quai ? 0 : 1) - (b.quai === carte.quai ? 0 : 1)
      || Math.abs(toMin(a.de) - toMin(carte.de)) - Math.abs(toMin(b.de) - toMin(carte.de)) || a.id.localeCompare(b.id));
  return [carte, ...autres.slice(0, 3)].map((c) => ({ v: c.id, lib: c.lib })).sort((a, b) => a.lib.localeCompare(b.lib, 'fr'));
}

// Le CONTRÔLE de la grille (au chargement : la séance refuse de s'ouvrir s'il rend quelque chose) — brief §6.1 : une seule paire en conflit
// (la carte de Romain contre les produits ménagers), au moins un créneau libre de 1 h 30 finissant avant midi, une seule bonne réponse par
// lecture ; heures sur la demi-heure, dans l'échelle ; la question « quel camion ? » a une seule bonne réponse parmi 4 choix.
export function ecartsGrille(camions = CAMIONS, carte = camionCarte()) {
  const E = [];
  Object.entries(lecturesDe(camions)).forEach(([id, x]) => {
    if (x.justes.length !== 1) E.push(`lecture ${id} : ${x.justes.length} bonne(s) réponse(s) sur la grille au lieu d'une`);
    else if (!x.choix.some((c) => c.v === x.juste)) E.push(`lecture ${id} : la bonne réponse n'est pas dans les choix`);
    if (x.choix.length !== 4) E.push(`lecture ${id} : ${x.choix.length} choix au lieu de 4`);
    if (new Set(x.choix.map((c) => c.v)).size !== x.choix.length) E.push(`lecture ${id} : deux choix identiques`);
  });
  [...camions, carte].forEach((c) => {
    [c.de, c.a].forEach((h) => { if (toMin(h) % ECHELLE.pas || toMin(h) < toMin(ECHELLE.debut) || toMin(h) > toMin(ECHELLE.fin)) E.push(`camion ${c.id} : ${h} hors de la demi-heure ou de l'échelle`); });
    if (toMin(c.de) >= toMin(c.a)) E.push(`camion ${c.id} : il repart avant d'arriver`);
  });
  conflits(camions).forEach(([a, b]) => E.push(`camions ${a} et ${b} en même temps au même quai`));
  const P = conflits([...camions, carte]);
  if (P.length !== 1) E.push(`${P.length} paire(s) en conflit avec la carte de Romain au lieu d'une`);
  else if (!P[0].includes(carte.id)) E.push('la paire en conflit ne contient pas la carte de Romain');
  if (!placesLibres(camions).length) E.push('la carte « jeux de société » n’a aucun créneau libre avant midi');
  const T = choixTrouve(camions, carte);
  if (T.length !== 4 || !T.some((c) => c.v === carte.id)) E.push('« quel camion ? » : 4 choix attendus, dont la carte');
  return E;
}
{ const E = ecartsGrille(); if (E.length) throw new Error(`ENT-8.4 : le planigramme ne tient pas — ${E.join(' ; ')}`); }
export const LECTURES = lecturesDe();
export const TROUVE = choixTrouve();
export const HAVRE = CAMIONS.find((c) => c.id === 'havre');
// Le camion en conflit avec la carte de Romain (les produits ménagers) : lu dans la grille.
export const PARTENAIRE = CAMIONS.find((c) => conflits(GRILLE_ROMAIN)[0].includes(c.id));

// Le tableau du planigramme (quais × demi-heures), fabriqué depuis les mêmes données que le planning (jamais recopié). Deux camions qui se
// recouvrent sur un quai sont dessinés sur deux rangs du même quai (on VOIT qu'ils sont en même temps), dans le même style que les autres :
// rien ne signale le camion de Romain. `vide` : la grille sans camion (« Avant de commencer »).
export function tablePlanigramme(camions, { vide = false } = {}) {
  const d0 = toMin(ECHELLE.debut), d1 = toMin(ECHELLE.fin), n = (d1 - d0) / 30;
  let h = '<tr><th scope="col" class="ac-q">Quai</th>';
  for (let m = d0; m < d1; m += 60) h += `<th scope="col" colspan="2">${heureLue(m)}</th>`;
  h += '</tr>';
  const lignes = QUAIS.map((q) => {
    const C = vide ? [] : camions.filter((c) => c.quai === q.id).sort((a, b) => toMin(a.de) - toMin(b.de) || a.id.localeCompare(b.id));
    const rangs = [];
    C.forEach((c) => { const r = rangs.find((R) => toMin(R[R.length - 1].a) <= toMin(c.de)); if (r) r.push(c); else rangs.push([c]); });
    if (!rangs.length) rangs.push([]);
    return rangs.map((R, k) => {
      let s = k ? '<tr class="ac-suite">' : `<tr><th scope="row" class="ac-q"${rangs.length > 1 ? ` rowspan="${rangs.length}"` : ''}>${ech(q.nom)}</th>`;
      for (let i = 0; i < n;) {
        const m = d0 + i * 30;
        const c = R.find((x) => toMin(x.de) === m);
        if (c) {
          const span = (toMin(c.a) - toMin(c.de)) / 30;
          s += `<td class="ac-pris" colspan="${span}"><b>${ech(c.court)}</b><br>${heureLue(toMin(c.de))} – ${heureLue(toMin(c.a))}</td>`;
          i += span;
        } else { s += '<td></td>'; i += 1; }
      }
      return `${s}</tr>`;
    }).join('');
  }).join('');
  return `<table class="ac-tab ac-pg"><colgroup><col class="ac-q">${'<col>'.repeat(n)}</colgroup><thead>${h}</thead><tbody>${lignes}</tbody></table>`;
}

// ─────────────────────────────────────────────────────────────── le plan de la réception de Labastide (CONSTRUIT, dessiné pour la séance)
// Vue de dessus, noir et blanc (encre sur le papier du document). 8 lieux, un rond numéroté chacun, SANS nom ; chaque lieu se devine par son
// dessin (brief §4, étape 1). Les numéros sont FIXES (jamais changés : les jalons les lisent). Les portes de quai portent « Q1 » à « Q4 »
// (les quais du planigramme), écrites petit et sans rond : la légende dit que seuls les ronds sont des lieux à trouver.
export const LIEUX_PLAN = [
  { id: 'l-quai', nom: 'Un quai', n: 3, difficulte: 'facile' },
  { id: 'l-vestiaire', nom: 'Le vestiaire', n: 2, difficulte: 'facile' },
  { id: 'l-rassemblement', nom: 'Le point de rassemblement', n: 5, difficulte: 'facile' },
  { id: 'l-controle', nom: 'La zone de contrôle', n: 1, difficulte: 'moyen' },
  { id: 'l-bureau', nom: 'Le bureau du chef d’équipe', n: 7, difficulte: 'moyen' },
  { id: 'l-charge', nom: 'Le local de charge des transpalettes', n: 4, difficulte: 'moyen' },
  { id: 'l-retours', nom: 'La zone de retours', n: 8, difficulte: 'difficile' },
  { id: 'l-litiges', nom: 'La zone litiges', n: 6, difficulte: 'difficile' },
];
const ENCRE = '#2b2824';
const GRIS = 'rgba(43,40,36,.12)';
const rond = (n, x, y) => `<g class="lb-num"><circle cx="${x}" cy="${y}" r="20" fill="#f7f3ea" stroke="${ENCRE}" stroke-width="3"/>`
  + `<text x="${x}" y="${y + 8}" text-anchor="middle" font-size="24" font-weight="800" fill="${ENCRE}">${n}</text></g>`;
const palette = (x, y, w = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
  + `<path d="M${x} ${y + w / 3} H${x + w} M${x} ${y + 2 * w / 3} H${x + w}" stroke="${ENCRE}" stroke-width=".8" fill="none"/>`;
const flecheRetour = (x, y) => `<path d="M${x + 13} ${y + 15} V${y + 8} A5.5 5.5 0 0 0 ${x + 2} ${y + 8} V${y + 12} M${x - 2} ${y + 8} L${x + 2} ${y + 13} L${x + 6} ${y + 8}" `
  + `stroke="${ENCRE}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const roll = (x, y) => `<rect x="${x}" y="${y}" width="28" height="36" fill="none" stroke="${ENCRE}" stroke-width="1.8"/>`
  + `<path d="M${x + 9} ${y} V${y + 36} M${x + 19} ${y} V${y + 36}" stroke="${ENCRE}" stroke-width="1"/>`
  + `<circle cx="${x + 3}" cy="${y + 39}" r="2.6" fill="${ENCRE}"/><circle cx="${x + 25}" cy="${y + 39}" r="2.6" fill="${ENCRE}"/>`;
const cartonOuvert = (x, y) => `${palette(x, y, 38)}<rect x="${x + 9}" y="${y + 9}" width="20" height="20" fill="#f7f3ea" stroke="${ENCRE}" stroke-width="1.6"/>`
  + `<path d="M${x + 9} ${y + 9} L${x + 3} ${y + 3} M${x + 29} ${y + 9} L${x + 35} ${y + 3} M${x + 9} ${y + 29} L${x + 3} ${y + 35} M${x + 29} ${y + 29} L${x + 35} ${y + 35}" stroke="${ENCRE}" stroke-width="1.6"/>`;
const transpalette = (x, y) => `<rect x="${x}" y="${y}" width="5" height="44" fill="${ENCRE}"/><rect x="${x + 13}" y="${y}" width="5" height="44" fill="${ENCRE}"/>`
  + `<rect x="${x - 2}" y="${y + 44}" width="22" height="16" rx="2" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/>`
  + `<path d="M${x + 9} ${y + 60} V${y + 70}" stroke="${ENCRE}" stroke-width="2.4"/>`;
const PORTES = [['Q1', 250], ['Q2', 390], ['Q3', 530], ['Q4', 670]];
export const PLAN_LABASTIDE = `<svg class="lb-plan" viewBox="0 0 900 625" role="img" aria-label="Plan de la réception, vue de dessus : huit lieux numérotés de 1 à 8, les camions au nord, la sortie du personnel au sud">
  <g fill="none" stroke="${ENCRE}">
    ${PORTES.map(([, x]) => `<path d="M${x + 4} 18 V112 M${x + 76} 18 V112" stroke-width="1" stroke-dasharray="6 6"/>`).join('')}
    <path d="M40 120 H860 V540 H130 M95 540 H40 Z" stroke-width="5" stroke-linejoin="miter"/>
    <path d="M95 540 V506 M95 506 A34 34 0 0 1 129 540" stroke-width="1.6"/>
    <path d="M112 548 V578 H150" stroke-width="2" stroke-dasharray="5 5"/>
  </g>
  ${PORTES.map(([q, x]) => `<rect x="${x}" y="114" width="80" height="12" fill="rgba(43,40,36,.35)" stroke="${ENCRE}" stroke-width="1.5"/>`
    + `<text x="${x + 40}" y="146" text-anchor="middle" font-size="15" font-weight="700" fill="${ENCRE}">${q}</text>`).join('')}
  <g stroke="${ENCRE}" stroke-width="2">
    <rect x="398" y="22" width="64" height="90" rx="3" fill="${GRIS}"/>
    <rect x="407" y="2" width="46" height="18" rx="3" fill="rgba(43,40,36,.3)"/>
    <rect x="392" y="80" width="6" height="16" fill="${ENCRE}"/><rect x="462" y="80" width="6" height="16" fill="${ENCRE}"/>
  </g>
  ${rond(3, 506, 64)}
  <rect x="764" y="136" width="90" height="150" fill="none" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="8 5"/>
  ${roll(772, 146)}${flecheRetour(780, 192)}${roll(814, 146)}${flecheRetour(822, 192)}${palette(790, 228, 40)}${flecheRetour(802, 236)}
  ${rond(8, 810, 312)}
  ${cartonOuvert(372, 236)}${cartonOuvert(512, 236)}
  <rect x="420" y="246" width="80" height="34" rx="2" fill="rgba(43,40,36,.2)" stroke="${ENCRE}" stroke-width="2"/>
  <path d="M432 263 H488" stroke="${ENCRE}" stroke-width="1" stroke-dasharray="3 3"/>
  ${rond(1, 460, 318)}
  <path d="M630 228 H748 M630 228 V332 M636 234 H748 M636 234 V332" stroke="${ENCRE}" stroke-width="1.4" fill="none"/>
  <path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `M${644 + k * 14} 228 V234`).join(' ')} ${[0, 1, 2, 3, 4, 5, 6].map((k) => `M630 ${242 + k * 14} H636`).join(' ')}" stroke="${ENCRE}" stroke-width="1.4" fill="none"/>
  <path d="M748 228 H762 V332 H690 M664 332 H630" stroke="${ENCRE}" stroke-width="3.5" fill="none"/>
  <rect x="690" y="262" width="54" height="26" fill="rgba(43,40,36,.2)" stroke="${ENCRE}" stroke-width="2"/>
  <rect x="706" y="266" width="22" height="6" fill="${ENCRE}"/>
  <circle cx="717" cy="303" r="9" fill="none" stroke="${ENCRE}" stroke-width="2"/>
  ${rond(7, 662, 268)}
  <rect x="58" y="228" width="122" height="116" fill="none" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="8 5"/>
  ${[[68, 238], [110, 238], [68, 290]].map(([x, y]) => `${palette(x, y, 34)}<text x="${x + 17}" y="${y + 27}" text-anchor="middle" font-size="26" font-weight="900" fill="${ENCRE}">!</text>`).join('')}
  ${rond(6, 140, 312)}
  ${[405, 450, 495].map((y) => `<rect x="350" y="${y}" width="490" height="20" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
    + `<path d="${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `M${350 + k * 49} ${y} V${y + 20}`).join(' ')}" stroke="${ENCRE}" stroke-width="1"/>`).join('')}
  <path d="M190 540 V398 H252 M286 398 H316 V540 M40 398 H120 M152 398 H190" stroke="${ENCRE}" stroke-width="3.5" fill="none"/>
  ${transpalette(220, 456)}${transpalette(252, 456)}${transpalette(284, 456)}
  <rect x="196" y="410" width="12" height="18" fill="none" stroke="${ENCRE}" stroke-width="1.6"/>
  <path d="M210 404 L198 424 L206 424 L200 444 L216 418 L208 418 L214 404 Z" fill="${ENCRE}"/>
  ${rond(4, 286, 426)}
  ${[0, 1, 2, 3, 4].map((k) => `<rect x="${46 + k * 26}" y="404" width="22" height="34" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
    + `<path d="M${46 + k * 26} 414 H${68 + k * 26}" stroke="${ENCRE}" stroke-width=".8"/><circle cx="${63 + k * 26}" cy="426" r="1.8" fill="${ENCRE}"/>`).join('')}
  <rect x="60" y="460" width="96" height="12" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>
  ${rond(2, 152, 506)}
  <image href="./contenus/images/action/point-rassemblement.svg" x="150" y="549" width="74" height="74"/>
  ${rond(5, 254, 586)}
</svg>`;

// ─────────────────────────────────────────────────────────────── les banques (brief §6 bis ; ids JAMAIS supprimés ni renumérotés)
export const BANQUE_LIEUX = LIEUX_PLAN.map((l) => ({ ...l }));
// Les 8 tâches d'ENT-8.2 recopiées (Romain à la place de Samia, Lucas de Kevin, Inès de Julie) et deux tâches nouvelles. Répartition CONSTRUITE.
export const BANQUE_TACHES = [
  { id: 't-decharger', difficulte: 'facile', lib: 'Décharger le camion au chariot.', qui: 'lucas' },
  { id: 't-saisir', difficulte: 'facile', lib: 'Saisir la réception dans le WMS.', qui: 'ines' },
  { id: 't-bl', difficulte: 'facile', lib: 'Vérifier le bon de livraison avec le chauffeur.', qui: 'moi' },
  { id: 't-compter', difficulte: 'moyen', lib: 'Compter les cartons d’une palette et regarder leur état.', qui: 'moi' },
  { id: 't-rdv', difficulte: 'moyen', lib: 'Noter au planigramme le rendez-vous d’un fournisseur.', qui: 'ines' },
  { id: 't-ranger', difficulte: 'moyen', lib: 'Amener une palette contrôlée jusqu’au stock.', qui: 'lucas' },
  { id: 't-refuser', difficulte: 'difficile', lib: 'Décider de refuser une palette abîmée.', qui: 'romain' },
  { id: 't-equipe', difficulte: 'difficile', lib: 'Répartir le travail de l’équipe le matin.', qui: 'romain' },
  { id: 't-retours', difficulte: 'moyen', lib: 'Trier les palettes renvoyées par les magasins.', qui: 'moi' },
  { id: 't-changer-rdv', difficulte: 'moyen', lib: 'Changer l’heure d’un rendez-vous au planigramme.', qui: 'ines' },
];
// Les lectures : les quatre du socle sont `facile` (une tirée), les deux dernières `difficile` (bonus du confirmé) — décision §6.3 : le
// tirage veut des effectifs fixes par difficulté ; les mentions « moyen » du brief restent indicatives.
export const BANQUE_LECTURES = [
  { id: 'l-retours-quai', difficulte: 'facile' }, { id: 'l-q2-dernier', difficulte: 'facile' },
  { id: 'l-q1-10h', difficulte: 'facile' }, { id: 'l-havre-combien', difficulte: 'facile' },
  { id: 'l-q4-premier', difficulte: 'difficile' }, { id: 'l-total', difficulte: 'difficile' },
];
// Les trois questions « Quel document dit… ? » (deux tirées).
export const BANQUE_DOCS = [
  { id: 'commande', difficulte: 'facile', lib: 'Quel document dit ce qu’Action a commandé ?', juste: 'commande' },
  { id: 'livraison', difficulte: 'facile', lib: 'Quel document dit ce que le camion apporte ?', juste: 'livraison' },
  { id: 'transport', difficulte: 'facile', lib: 'Quel document dit qui transporte la marchandise ?', juste: 'voiture' },
];
// Les valeurs de la commande : n° tiré, N multiple de 24 entre 720 et 1 440, k multiple de 24 entre 24 et 96 (des cartons par couche).
export const valeursCommande = (h) => ({ numero: h.entier(100000, 999999), N: 24 * h.entier(30, 60), k: 24 * h.entier(1, 4) });
// Contrôle d'équité (vide = conforme) : trois personnes différentes dans le socle des tâches (sinon « tout à Romain » rapporterait), et une
// commande cohérente.
export function ecartsJeu(jeu) {
  const E = [];
  const T = (jeu.pieces && jeu.pieces.taches) || [];
  const qui = new Set(T.map((p) => p && p.qui));
  if (qui.size !== T.length) E.push(`les ${T.length} tâches ne vont pas à ${T.length} personnes différentes`);
  const V = jeu.valeurs || {};
  if (!(V.k > 0 && V.k < V.N)) E.push('k doit être entre 0 et N');
  if (V.N % 24 || V.k % 24 || V.N < 720 || V.N > 1440 || V.k < 24 || V.k > 96) E.push('N et k : multiples de 24, N de 720 à 1 440, k de 24 à 96');
  return E;
}
export const TIRAGE = declarerTirage({
  banques: {
    lieux: { pieces: BANQUE_LIEUX, melange: { facile: 1, moyen: 2, difficile: 1 }, ordre: 'melange' },
    taches: { pieces: BANQUE_TACHES, melange: { facile: 1, moyen: 1, difficile: 1 }, bonus: { confirme: { moyen: 1 } }, ordre: 'melange' },
    lectures: { pieces: BANQUE_LECTURES, melange: { facile: 1 }, bonus: { confirme: { difficile: 1 } }, ordre: 'melange' },
    documents: { pieces: BANQUE_DOCS, melange: { facile: 2 }, ordre: 'melange' },
  },
  valeurs: valeursCommande,
  verifier: ecartsJeu,
});
TIRAGE.lier(ID);

// Le jeu de l'élève, lu dans sa base. Sans tirage (base vide au chargement, enseignant) : un jeu témoin.
const parId = (B, id) => B.find((p) => p.id === id);
export const DEFAUT = { lieux: ['l-quai', 'l-controle', 'l-bureau', 'l-retours'], taches: ['t-decharger', 't-retours', 't-refuser'],
  lectures: ['l-retours-quai'], documents: ['commande', 'livraison'], valeurs: { numero: 731542, N: 1152, k: 72 } };
const tire = (banque, B) => (db) => (TIRAGE.tirage(db) ? TIRAGE.piecesTirees(db, banque) : DEFAUT[banque].map((id) => parId(B, id)));
export const lieuxDe = tire('lieux', BANQUE_LIEUX);
export const tachesDe = tire('taches', BANQUE_TACHES);
export const tachesBonus = (db) => TIRAGE.piecesBonus(db, 'taches');
export const lecturesTirees = tire('lectures', BANQUE_LECTURES);
export const lecturesBonus = (db) => TIRAGE.piecesBonus(db, 'lectures');
export const documentsDe = tire('documents', BANQUE_DOCS);
export function commandeDe(db) {
  const V = TIRAGE.tirage(db) ? TIRAGE.valeursTirees(db) : DEFAUT.valeurs;
  const N = V.N, k = V.k, livre = N - k;
  return { numero: `AC-${V.numero}`, N, k, livre, palettes: Math.ceil(livre / 96), bl: `BL-${String(V.numero).slice(-4)}-17`, lv: `LV-${String(V.numero * 7).slice(-6)}` };
}
const graineDe = (db) => { const r = TIRAGE.tirage(db); return r ? r.graine : ''; };
export const melangerPour = (db, quoi, L) => (graineDe(db) ? hasard(`${graineDe(db)}|${quoi}`).melanger(L) : L.slice());

// ─────────────────────────────────────────────────────────────── le compte rendu : la ligne « nouveau créneau », calculée sur la POSE
// La pose de la carte dans un état de planning (`place[carte] = { r, s }`, s = rang de la demi-heure depuis 6 h) → { r, m } ou null.
export function poseDe(place) {
  const p = place && place[CARTE.id];
  return p && p.r ? { r: p.r, m: toMin(ECHELLE.debut) + p.s * ECHELLE.pas } : null;
}
// La carte a-t-elle quitté la place de Romain ? Une carte retirée (absente) n'a pas été « déplacée » vers un créneau : la phrase juste reste
// « Je ne l'ai pas déplacé. » (cas limite, dit dans le compte rendu du brief).
export const deplace = (pose) => !!pose && !(pose.r === CARTE.depart.ligne && pose.m === toMin(CARTE.depart.de));
export const phraseCreneau = (r, m) => `Je l’ai mis au ${minQuai(r)} de ${heureLue(m)} à ${heureLue(m + CARTE.duree)}.`;
export const PAS_DEPLACE = 'Je ne l’ai pas déplacé.';
// Les créneaux proposés en pièges (de la grille, calculés) : le créneau libre d'abord, puis trois créneaux pris ou trop tardifs.
export const CANDIDATS = [...placesLibres().map(([r, m]) => [r, m]), ['Q2', 600], ['Q1', 540], ['Q4', 660]];
// La phrase juste pour une pose : celle de la pose si la carte a bougé, sinon « Je ne l'ai pas déplacé. ».
export const phraseJustePour = (pose) => (deplace(pose) ? phraseCreneau(pose.r, pose.m) : PAS_DEPLACE);
// Les quatre choix de la ligne, calculés sur la pose ENVOYÉE (le mail est semé après l'envoi du planning) ; `juste` = rang déclaré.
export function ligneCreneau(place) {
  const pose = poseDe(place);
  const bouge = deplace(pose);
  const pris = (r, m) => !!pose && pose.r === r && pose.m === m;
  const autres = CANDIDATS.filter(([r, m]) => !pris(r, m) && !(r === CARTE.depart.ligne && m === toMin(CARTE.depart.de)))
    .map(([r, m]) => phraseCreneau(r, m));
  const choix = bouge ? [phraseCreneau(pose.r, pose.m), ...autres.slice(0, 2), PAS_DEPLACE] : [...autres.slice(0, 3), PAS_DEPLACE];
  return { choix, juste: bouge ? 0 : 3 };
}
// La pose envoyée (ou en cours de correction : null) lue dans la base.
export const placeEnvoyee = (db) => { const e = db && db.plannings && db.plannings[PLANNING_ID]; return (e && e.v1 && e.v1.place) || null; };
