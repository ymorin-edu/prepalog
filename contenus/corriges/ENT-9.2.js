// Corrigé d'ENT-9.2 (CHEP, un retour à contrôler, une ramasse à organiser), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/chep-ent92-donnees.js`, brief §6 bis) : l'ordre des cinq histoires de piles, leurs
// quantités, le pool et la place des palettes d'un autre pool, les palettes abîmées, le numéro du bon, la plate-forme qui a signalé ses
// vides le plus tard (pièce `dernier`) et les vides de Frais du Nord ; un confirmé a une 6e pile. `CORRIGE` donne ce qui est commun (la
// méthode, le barème) ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa graine (jamais recopié). Un élève qui n'a
// pas encore ouvert la séance : son tirage se calcule quand même (graine = son identifiant).

import { graineDeBase } from '../../core/tirage.js';
import { comptePile, decisionPile } from '../../core/types/quai.js';
import { palettes } from '../chep.js';
import { jeuDe, pilesDe, comptesDe, pieceDernier, ordresDe, nomSite, horaireDit, CAPACITE, PLACES_SOL, PILE_VIDES, BORNES_VIDES, IDS_TOURNEE,
  bilanOrdre, creditDeSonControle, quaiClos } from '../chep-ent92-donnees.js';

const NOMS_POOL = { lpr: 'LPR (rouge)', epal: 'Europe EPAL (bois brut)', logipal: 'Logipal (brique)' };
const FACE = { N: 'arrière', S: 'avant', E: 'droite', W: 'gauche' };
const hm = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')}`; };

export const CORRIGE = {
  code: 'ENT-9.2',
  titre: 'CHEP — un retour à contrôler, une ramasse à organiser',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Contrôler le retour', genre: 'question', texte: 'La méthode (les piles de chaque élève : choisir l’élève ci-dessus)',
      rep: 'Pour chaque pile : compter les palettes une à une en cliquant (le zoom donne le numéro ; la palette du haut donne la hauteur), faire le tour '
        + 'de la pile (un dégât ne se voit que de deux côtés), regarder le marquage des blocs (CHEP bleu ; LPR rouge ; Logipal brique ; Europe EPAL bois '
        + 'brut, plus étroite). Une pile juste : « Accepter ». Sinon « Accepter avec réserves », un motif par écart (manquantes, abîmées, d’un autre '
        + 'pool), chacun avec sa quantité. Puis écrire les réserves sur le bon, le faire signer, clore.',
      note: 'Pièges : recopier 15 (le bon) pour la pile à 14 ; ne pas tourner la pile (dégât de l’arrière non vu) ; une palette Europe ou LPR au milieu de '
        + 'la pile ; mettre « sous réserve » la pile juste.' },
    { etape: 2, etapeTitre: 'Créditer le compte', genre: 'question', texte: 'Le crédit',
      rep: 'À créditer = palettes CHEP reçues, abîmées comprises = palettes comptées − palettes d’un autre pool. Hors pool = les palettes d’un autre pool. '
        + 'Réparation = les palettes CHEP abîmées. Les palettes d’un autre pool sont mises de côté : elles ne sont pas à CHEP et ne se créditent pas.',
      note: 'Le crédit est jugé sur le contrôle DE L’ÉLÈVE (une erreur ne se paie qu’une fois) : une pile mal comptée coûte au compte, pas au crédit.' },
    { etape: 3, etapeTitre: 'Organiser la ramasse', genre: 'question', texte: 'Le besoin et la tournée',
      rep: `Capacité = ${PLACES_SOL} places au sol × ${PILE_VIDES} palettes par pile = ${CAPACITE} palettes vides. Frais du Nord (au moins ${CAPACITE}) : un camion `
        + `complet à lui seul. Les quatre autres (tirés par élève : ${IDS_TOURNEE.map((id) => `${nomSite(id)} ${BORNES_VIDES[id][0]} à ${BORNES_VIDES[id][1]}`).join(', ')}) `
        + `font entre ${IDS_TOURNEE.reduce((t, id) => t + BORNES_VIDES[id][0], 0)} et ${IDS_TOURNEE.reduce((t, id) => t + BORNES_VIDES[id][1], 0)} palettes selon l’élève, `
        + `toujours plus que ${CAPACITE} : ils ne tiennent pas `
        + 'dans un camion : on reporte à vendredi la plate-forme qui a signalé ses vides le plus tard (comparer le jour, puis l’heure), puis on ordonne les '
        + `trois autres pour respecter les heures d’enlèvement (Roubaix ${horaireDit('roubaix')}, Prouvy ${horaireDit('prouvy')}, Douai ${horaireDit('douai')}, `
        + `Dourges ${horaireDit('dourges')}).`,
      note: 'Les quantités des quatre plates-formes sont tirées par élève depuis le 18/10/2026 (par pas de 5, dans les bornes ci-dessus) ; les sites, '
        + 'les horaires et la capacité sont les mêmes pour tous. Ce qui change aussi : les dates et heures des avis, donc le site à reporter. '
        + 'Les quantités de chaque élève sont dans « Sa ramasse » (choisir l’élève ci-dessus).' },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '15 jalons pondérés et 3 questions notées, total 20 : contrôler 8 (le compte de chaque pile 0,4 × 5, les autres pools 2, les abîmées 2, '
        + 'décisions et réserves 2), créditer 3 (à créditer 2 ; hors pool, réparation et sort des autres pools 1), organiser 6 (capacité 1, Frais du Nord 1, '
        + 'site reporté 1,5, la tournée tient 1, horaires 1,5), questions 3 (Grégory : les palettes d’un autre pool ; Yannick : le contrat type, les camions '
        + 'pleins). Rien n’est vrai avant le geste qui le juge ; inaction 0.',
      note: 'Poids fixés par Cowork sur délégation de Tristan (17/10/2026), à corriger à l’écran. Confirmé : une 6e pile (deux palettes abîmées, de '
        + 'l’arrière) : +0,5 si elle est bien contrôlée, caché à l’élève.' },
  ],
};

// Une pile, en clair : ce qui y est, et ce qui est attendu.
function lignePile(p) {
  const c = comptePile(p), d = decisionPile(p);
  const quoi = [];
  if (c.manquantes) quoi.push(`${c.manquantes} manquante${c.manquantes > 1 ? 's' : ''} (la pile fait ${c.hauteur})`);
  Object.entries(p.intrus || {}).forEach(([n, pool]) => quoi.push(`n° ${n} : ${NOMS_POOL[pool]}`));
  Object.entries(p.abimee || {}).forEach(([n, f]) => quoi.push(`n° ${n} abîmée, face ${FACE[f]}`));
  const motifs = { manquant: `manquantes ${c.manquantes}`, avarie: `abîmées ${c.abimees}`, produit: `d’un autre pool ${c.intrus}` };
  return [p.id, String(c.hauteur), quoi.join(' ; ') || 'rien : 15 palettes CHEP en état',
    d.attendu === 'accepter' ? 'Accepter' : `Sous réserve — ${d.motifs.map((m) => motifs[m]).join(' + ')}`];
}

export function corrigeEleve(base, uid) {
  const db = base || {};
  const ouvert = !!graineDeBase(db);
  const g = ouvert ? graineDeBase(db) : String(uid || 'anonyme');
  const J = jeuDe(g);
  const conf = db.aisance === 'confirme';
  const P = pilesDe(J, { confirme: conf }), C = comptesDe(P);
  const Pd = pieceDernier(J.dernier), O = ordresDe(J);
  const juste = O.justes.slice().sort((a, b) => a.km - b.km)[0];
  const bj = bilanOrdre(juste.ordre, J.vides);
  const items = [
    { genre: 'fait', texte: 'Son bon de collecte', rep: `${J.bc} · ${palettes(C.annoncees)} annoncées en ${P.length} piles de ${PILE_VIDES}` },
    { genre: 'tableau', texte: 'Ses piles (dans l’ordre du camion)', entetes: ['Pile', 'Palettes sur la pile', 'Ce qu’il y a', 'Décision et réserve attendues'],
      reponses: P.slice(0, 5).map(lignePile) },
  ];
  if (P.length > 5) items.push({ genre: 'tableau', bonus: true, texte: 'La pile en plus (confirmé)', entetes: ['Pile', 'Palettes sur la pile', 'Ce qu’il y a', 'Attendu'], reponses: P.slice(5).map(lignePile) });
  items.push({ genre: 'question', texte: 'Son crédit attendu (contrôle juste)',
    rep: `Reçues ${C.recues} (manquantes ${C.manquantes}) ; d’un autre pool ${C.autres} ; à créditer ${C.aCrediter} ; en réparation ${C.reparation} ; les palettes d’un autre pool sont mises de côté.` });
  if (ouvert && quaiClos(db)) {
    const s = creditDeSonControle(db);
    items.push({ genre: 'question', texte: 'Le crédit attendu d’après SON contrôle (ce que juge la séance)', rep: `à créditer ${s.aCrediter} ; hors pool ${s.horsPool} ; réparation ${s.reparation}.` });
  }
  items.push({ genre: 'question', texte: 'Sa ramasse',
    rep: `Ses vides : ${IDS_TOURNEE.map((id) => `${nomSite(id)} ${J.vides[id]}`).join(', ')} : ${IDS_TOURNEE.reduce((t, id) => t + J.vides[id], 0)}, plus que ${CAPACITE}. `
      + `Frais du Nord : ${palettes(J.V)} → un camion complet. Plate-forme qui a signalé le plus tard : ${nomSite(Pd.site)} (${Pd.signale[Pd.site].replace(/^2027-01-(\d\d) /, (x, j) => `${j}/01 à `).replace(':', ' h ')}) → reportée à vendredi. `
      + `Les trois autres : ${O.total} palettes, ça tient. Un ordre juste : ${juste.ordre.map(nomSite).join(' → ')} (${Math.round(juste.km)} km, retour vers ${hm(bj.arrivee)}). `
      + `${O.court.tient ? 'Ici, l’ordre au plus court tient aussi les horaires.' : `L’ordre au plus court (${O.court.ordre.map(nomSite).join(' → ')}) rate un horaire.`} `
      + `${O.justes.length} ordre${O.justes.length > 1 ? 's' : ''} sur 6 tiennent.` });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une 6e pile).', items };
  return { texte: '', items };
}
