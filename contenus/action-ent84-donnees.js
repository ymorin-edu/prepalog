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
const PAPIER = '#f7f3ea';
// Retour de classe du 06/11/2026 (« pas assez clair ») — dessins choisis par Tristan sur page d'essai : zone de contrôle « 1a » (emplacements au
// sol, palettes filmées, palette ouverte et bon coché), bureau « 7a » (pièce vitrée côté quais, écran, clavier, chaise, armoire) ; STOCK écrit à
// droite des rayonnages, loin des lieux. Puis : dessins agrandis, CHAQUE lieu dans son cadre (pointillé) ou sa pièce (murs pleins), son
// rond posé dans le coin haut gauche du cadre (aucun doute sur le dessin qu'il désigne), et des repères écrits qui ne nomment aucun lieu à
// trouver (cour des camions, stock, porte du personnel). Les numéros ne bougent pas (les jalons les lisent ; ENT-8.6 les permute).
const rond = (n, x, y) => `<g class="lb-num"><circle cx="${x}" cy="${y}" r="22" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="3.2"/>`
  + `<text x="${x}" y="${y + 9}" text-anchor="middle" font-size="27" font-weight="800" fill="${ENCRE}">${n}</text></g>`;
const cadre = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="rgba(43,40,36,.04)" stroke="${ENCRE}" stroke-width="2.2" stroke-dasharray="9 6"/>`;
const palette = (x, y, w = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/>`
  + `<path d="M${x} ${y + w / 3} H${x + w} M${x} ${y + 2 * w / 3} H${x + w}" stroke="${ENCRE}" stroke-width="1" fill="none"/>`;
const flecheRetour = (x, y) => `<path d="M${x + 13} ${y + 15} V${y + 8} A5.5 5.5 0 0 0 ${x + 2} ${y + 8} V${y + 12} M${x - 2} ${y + 8} L${x + 2} ${y + 13} L${x + 6} ${y + 8}" `
  + `stroke="${ENCRE}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const roll = (x, y) => `<rect x="${x}" y="${y}" width="30" height="40" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="2"/>`
  + `<path d="M${x + 10} ${y} V${y + 40} M${x + 20} ${y} V${y + 40}" stroke="${ENCRE}" stroke-width="1.1"/>`
  + `<circle cx="${x + 3}" cy="${y + 44}" r="3" fill="${ENCRE}"/><circle cx="${x + 27}" cy="${y + 44}" r="3" fill="${ENCRE}"/>`;
// Une palette ouverte vue de dessus : ses quatre cartons visibles.
const cartonsVus = (x, y, w = 56) => { const c = (w - 12) / 2; return `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${GRIS}" stroke="${ENCRE}" stroke-width="2"/>`
  + [0, 1].map((i) => [0, 1].map((j) => `<rect x="${x + 4 + i * (c + 4)}" y="${y + 4 + j * (c + 4)}" width="${c}" height="${c}" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="1.6"/>`).join('')).join(''); };
// Une palette encore filmée (hachures du film).
const filmee = (x, y, w = 56) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="rgba(43,40,36,.22)" stroke="${ENCRE}" stroke-width="2"/>`
  + `<path d="M${x} ${y + w / 2} L${x + w / 2} ${y} M${x} ${y + w} L${x + w} ${y} M${x + w / 2} ${y + w} L${x + w} ${y + w / 2}" stroke="${ENCRE}" stroke-width="1.3"/>`;
// Un emplacement marqué au sol (quatre coins).
const coins = (x, y, w, h, l = 12) => `<path d="M${x} ${y + l} V${y} H${x + l} M${x + w - l} ${y} H${x + w} V${y + l} M${x + w} ${y + h - l} V${y + h} H${x + w - l} M${x + l} ${y + h} H${x} V${y + h - l}" stroke="${ENCRE}" stroke-width="3.5" fill="none"/>`;
// Le bon de livraison sur sa planchette, coché.
const bonCoche = (x, y) => `<rect x="${x}" y="${y}" width="46" height="60" rx="3" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="2"/><rect x="${x + 14}" y="${y - 5}" width="18" height="9" rx="2" fill="${ENCRE}"/>`
  + [0, 1, 2].map((k) => `<path d="M${x + 7} ${y + 17 + k * 14} l4 4 l7 -8" stroke="${ENCRE}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x + 23} ${y + 18 + k * 14} H${x + 39}" stroke="${ENCRE}" stroke-width="1.6"/>`).join('');
const transpalette = (x, y) => `<rect x="${x}" y="${y}" width="6" height="52" fill="${ENCRE}"/><rect x="${x + 16}" y="${y}" width="6" height="52" fill="${ENCRE}"/>`
  + `<rect x="${x - 2}" y="${y + 52}" width="26" height="18" rx="2" fill="${GRIS}" stroke="${ENCRE}" stroke-width="2"/>`
  + `<path d="M${x + 11} ${y + 70} V${y + 82}" stroke="${ENCRE}" stroke-width="2.8"/>`;
const casier = (x, y) => `<rect x="${x}" y="${y}" width="26" height="50" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/>`
  + `<path d="M${x} ${y + 12} H${x + 26}" stroke="${ENCRE}" stroke-width="1"/><circle cx="${x + 20}" cy="${y + 30}" r="2.2" fill="${ENCRE}"/>`;
const eclair = (x, y) => `<path d="M${x + 12} ${y} L${x} ${y + 22} L${x + 9} ${y + 22} L${x + 3} ${y + 42} L${x + 21} ${y + 15} L${x + 11} ${y + 15} L${x + 17} ${y} Z" fill="${ENCRE}"/>`;
// Le bureau vu de dessus : l'écran, le clavier, la chaise à dossier ; et une armoire.
const bureau = (x, y) => `<rect x="${x}" y="${y}" width="84" height="40" fill="rgba(43,40,36,.22)" stroke="${ENCRE}" stroke-width="2"/>`
  + `<rect x="${x + 26}" y="${y + 4}" width="32" height="6" fill="${ENCRE}"/><path d="M${x + 42} ${y + 10} V${y + 16}" stroke="${ENCRE}" stroke-width="2.5"/>`
  + `<rect x="${x + 26}" y="${y + 22}" width="32" height="9" rx="1.5" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="1.5"/>`
  + `<rect x="${x + 28}" y="${y + 50}" width="28" height="24" rx="5" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="2"/><path d="M${x + 26} ${y + 72} Q${x + 42} ${y + 84} ${x + 58} ${y + 72}" stroke="${ENCRE}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
const armoire = (x, y) => `<rect x="${x}" y="${y}" width="24" height="58" fill="${GRIS}" stroke="${ENCRE}" stroke-width="2"/><path d="M${x} ${y + 29} H${x + 24}" stroke="${ENCRE}" stroke-width="1.2"/>`;
const PORTES = [['Q1', 250], ['Q2', 390], ['Q3', 530], ['Q4', 670]];
export const PLAN_LABASTIDE = `<svg class="lb-plan" viewBox="0 0 910 600" role="img" aria-label="Plan de la réception, vue de dessus : huit lieux numérotés de 1 à 8, chacun dans son cadre, la cour des camions au nord, la porte du personnel au sud">
  <text x="36" y="44" font-size="21" font-weight="800" letter-spacing="1" fill="${ENCRE}">COUR DES CAMIONS</text>
  <g fill="none" stroke="${ENCRE}">
    ${PORTES.map(([, x]) => `<path d="M${x + 4} 18 V112 M${x + 76} 18 V112" stroke-width="1" stroke-dasharray="6 6"/>`).join('')}
    <path d="M30 120 H880 V520 H195 M155 520 H30 Z" stroke-width="5" stroke-linejoin="miter"/>
    <path d="M155 520 V486 M155 486 A34 34 0 0 1 189 520" stroke-width="1.8"/>
  </g>
  ${PORTES.map(([q, x]) => `<rect x="${x}" y="114" width="80" height="12" fill="rgba(43,40,36,.35)" stroke="${ENCRE}" stroke-width="1.5"/>`
    + `<text x="${x + 40}" y="150" text-anchor="middle" font-size="18" font-weight="700" fill="${ENCRE}">${q}</text>`).join('')}
  <g stroke="${ENCRE}" stroke-width="2">
    <rect x="398" y="22" width="64" height="90" rx="3" fill="${GRIS}"/>
    <rect x="407" y="2" width="46" height="18" rx="3" fill="rgba(43,40,36,.3)"/>
    <rect x="392" y="80" width="6" height="16" fill="${ENCRE}"/><rect x="462" y="80" width="6" height="16" fill="${ENCRE}"/>
  </g>
  ${cadre(50, 170, 200, 170)}
  ${[[112, 186], [182, 186], [147, 266]].map(([x, y]) => `${palette(x, y, 54)}<text x="${x + 27}" y="${y + 40}" text-anchor="middle" font-size="36" font-weight="900" fill="${ENCRE}">!</text>`).join('')}
  ${cadre(280, 170, 280, 170)}
  ${coins(344, 196, 64, 64)}${filmee(348, 200)}${coins(420, 196, 64, 64)}${filmee(424, 200)}${coins(344, 268, 64, 64)}${cartonsVus(348, 272)}${bonCoche(440, 272)}
  <path d="M640 340 H590 V170 M740 170 V340 H684" stroke="${ENCRE}" stroke-width="3.5" fill="none"/>
  <path d="M588 170 H742" stroke="${ENCRE}" stroke-width="3.5"/><rect x="604" y="164" width="124" height="12" fill="${PAPIER}" stroke="${ENCRE}" stroke-width="1.6"/>
  <path d="M645 164 V176 M687 164 V176" stroke="${ENCRE}" stroke-width="1.6"/>
  <path d="M640 340 V306 A34 34 0 0 1 674 340" stroke="${ENCRE}" stroke-width="1.8" fill="none"/>
  ${bureau(632, 216)}${armoire(706, 270)}
  ${cadre(770, 170, 100, 170)}
  ${roll(784, 228)}${flecheRetour(792, 238)}${roll(828, 228)}${flecheRetour(836, 238)}${palette(796, 284, 48)}${flecheRetour(812, 296)}
  <text x="814" y="432" text-anchor="middle" font-size="20" font-weight="800" letter-spacing="1" fill="${ENCRE}">STOCK</text>
  ${[368, 418, 468].map((y) => `<rect x="370" y="${y}" width="392" height="24" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.6"/>`
    + `<path d="${[1, 2, 3, 4, 5, 6, 7].map((k) => `M${370 + k * 49} ${y} V${y + 24}`).join(' ')}" stroke="${ENCRE}" stroke-width="1"/>`).join('')}
  <path d="M30 350 H150 M190 350 H200 V520 M200 350 H286 M326 350 H340 V520" stroke="${ENCRE}" stroke-width="3.5" fill="none"/>
  ${[0, 1, 2, 3].map((k) => casier(50 + k * 30, 404)).join('')}
  <rect x="50" y="476" width="96" height="14" fill="${GRIS}" stroke="${ENCRE}" stroke-width="1.8"/>
  <rect x="256" y="360" width="14" height="22" fill="none" stroke="${ENCRE}" stroke-width="1.8"/>${eclair(274, 358)}
  ${transpalette(214, 412)}${transpalette(254, 412)}${transpalette(296, 412)}
  <path d="M175 526 V564 H214" stroke="${ENCRE}" stroke-width="2.2" stroke-dasharray="5 5" fill="none"/>
  <text x="30" y="556" font-size="17" fill="${ENCRE}">porte du</text><text x="30" y="576" font-size="17" fill="${ENCRE}">personnel</text>
  <image href="./contenus/images/action/point-rassemblement.svg" x="218" y="528" width="72" height="72"/>
  <!-- les ronds en dernier, par-dessus les dessins, dans l’ordre lu par ENT-8.6 (ses tests) : 3, 8, 1, 7, 6, 4, 2, 5 -->
  ${rond(3, 508, 62)}
  ${rond(8, 798, 198)}
  ${rond(1, 308, 198)}
  ${rond(7, 618, 198)}
  ${rond(6, 78, 198)}
  ${rond(4, 228, 378)}
  ${rond(2, 58, 378)}
  ${rond(5, 318, 564)}
</svg>`;

// La légende des OBJETS dessinés (sous le plan d'ENT-8.4 seulement : ENT-8.6 est une évaluation, sans aide). Elle ne nomme aucun lieu.
const icone = (vb, corps) => `<svg viewBox="${vb}" aria-hidden="true">${corps}</svg>`;
const LEGENDE = [
  [icone('0 0 40 40', palette(3, 3, 34)), 'palette'],
  [icone('-2 -2 38 52', roll(2, 0)), 'roll'],
  [icone('-6 -2 36 88', transpalette(2, 0)), 'transpalette'],
  [icone('-4 -2 34 56', casier(0, 0)), 'casier'],
  [icone('0 0 60 60', filmee(2, 2, 56)), 'palette filmée'],
  [icone('-2 -6 50 70', bonCoche(0, 0)), 'bon coché'],
  [icone('-2 -2 88 90', bureau(1, 0)), 'bureau, chaise'],
  [icone('-6 -2 34 46', eclair(0, 0)), 'électricité'],
  [icone('0 0 40 40', `<text x="20" y="32" text-anchor="middle" font-size="34" font-weight="900" fill="${ENCRE}">!</text>`), 'problème'],
  [icone('-4 0 24 22', flecheRetour(2, 2)), 'retour'],
];
export const LEGENDE_PLAN = `<ul class="lb-legende" aria-label="Légende des dessins">${LEGENDE.map(([i, t]) => `<li>${i}<span>${t}</span></li>`).join('')}</ul>`;

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
