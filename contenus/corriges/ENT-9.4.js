// Corrigé d'ENT-9.4 (CHEP, évaluation « la semaine de Légumes de la Lys »), montré dans l'onglet « Corrigés » de l'enseignant SEUL (règle : l'outil
// est formatif, l'évaluation se passe en classe, sous surveillance, sur un jeu neuf).
//
// Chaque élève a reçu SON tirage (`contenus/chep-ent94-donnees.js`, brief §6 bis) : ses quatre documents et leurs quantités, ses quatre piles, la
// plate-forme qui a signalé ses vides le plus tard, ses vides. `CORRIGE` donne ce qui est commun (la méthode, le barème) ; `corrigeEleve(base, uid)`
// rend le corrigé d'un élève, calculé depuis sa graine (jamais recopié). Un élève qui n'a pas encore ouvert la séance : son tirage se calcule quand
// même (graine = son identifiant).

import { graineDeBase } from '../../core/tirage.js';
import { comptePile, decisionPile } from '../../core/types/quai.js';
import { palettes } from '../chep.js';
import { jeuDe, partieA, pilesDuJeu, comptesDe, pieceDernier, ordresDe, bilanOrdre, nomSite, horaireDit, CAPACITE, PLACES_SOL, PILE_VIDES, BORNES_VIDES,
  IDS_TOURNEE, COMPLET, PARTENAIRES, creditDeSonControle, quaiClos, lignesDeclarees, soldeDeclare } from '../chep-ent94-donnees.js';

const NOMS_POOL = { lpr: 'LPR (rouge)', epal: 'Europe EPAL (bois brut)', logipal: 'Logipal (brique)' };
const FACE = { N: 'arrière', S: 'avant', E: 'droite', W: 'gauche' };
const TYPE = { emission: 'Émission reçue de CHEP', transfert: 'Transfert vers un distributeur', aucun: 'Aucun mouvement CHEP' };
const hm = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')}`; };
const libPart = (v) => (PARTENAIRES.find((p) => p.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-9.4',
  titre: 'CHEP — évaluation : la semaine de Légumes de la Lys',
  trame: '(pas de trame : évaluation à l’écran, sous surveillance)',
  items: [
    { etape: 1, etapeTitre: 'Repérer et tenir le compte', genre: 'question', texte: 'La méthode (les documents de chaque élève : choisir l’élève ci-dessus)',
      rep: 'Pour chaque document, le cadre « Supports de charge » : seules les palettes CHEP se déclarent. Bon d’émission → « Émission », CHEP Templemars. '
        + 'Bordereau → « Transfert », vers son destinataire, les seules palettes CHEP (le reste, Europe ou LPR, ne se déclare pas). Bordereau de palettes '
        + 'Europe seules, ou commande à livrer après le 29/01 → « Aucun mouvement CHEP ». Relevé : une ligne par mouvement déclaré, l’émission en entrée, '
        + 'les transferts en sortie (0 dans l’autre colonne) ; solde au 29/01 = D2 + entrées − sorties, par une formule.',
      note: 'Pièges : déclarer tout le camion du bordereau partiel ; déclarer les palettes Europe ou la commande ; taper le solde à la main. Le relevé est '
        + 'jugé sur LES déclarations de l’élève (une erreur ne se paie qu’une fois).' },
    { etape: 2, etapeTitre: 'Contrôler le retour', genre: 'question', texte: 'Le quai et le crédit',
      rep: 'Pour chaque pile : compter les palettes une à une (la palette du haut donne la hauteur), faire le tour (un dégât ne se voit que de deux côtés), '
        + 'regarder le marquage (CHEP bleu ; LPR rouge ; Logipal brique ; Europe EPAL bois brut, plus étroite). Une seule pile est juste. Crédit = palettes '
        + 'CHEP reçues, abîmées comprises ; hors pool = les palettes d’un autre pool ; réparation = les CHEP abîmées.',
      note: 'Le crédit est jugé sur le contrôle DE L’ÉLÈVE : une pile mal comptée coûte au compte de la pile, pas au crédit. Pièges : créditer les 60 '
        + 'annoncées ; un dégât visible seulement de l’arrière.' },
    { etape: 3, etapeTitre: 'Organiser la ramasse', genre: 'question', texte: 'Le besoin et la tournée',
      rep: `Capacité = ${PLACES_SOL} places × ${PILE_VIDES} palettes = ${CAPACITE} palettes vides. MarchéLys (au moins ${CAPACITE}) : un camion complet à lui seul. `
        + `Les quatre autres (tirés par élève : ${IDS_TOURNEE.map((id) => `${nomSite(id)} ${BORNES_VIDES[id][0]} à ${BORNES_VIDES[id][1]}`).join(', ')}) font `
        + `${IDS_TOURNEE.reduce((t, id) => t + BORNES_VIDES[id][0], 0)} à ${IDS_TOURNEE.reduce((t, id) => t + BORNES_VIDES[id][1], 0)} palettes, toujours plus que `
        + `${CAPACITE} : on reporte la plate-forme qui a signalé le plus tard (comparer le jour, puis l’heure), puis on ordonne les trois autres pour tenir `
        + `les heures d’enlèvement (${IDS_TOURNEE.map((id) => `${nomSite(id)} ${horaireDit(id)}`).join(', ')}).`,
      note: 'Les horaires et le site à camion complet ne sont PAS ceux d’ENT-9.2 : un élève qui recopie sa tournée de mardi se trompe. Quand Frais du '
        + 'Nord (ouvert à 9 h 30) est dans la tournée, le camion peut attendre l’ouverture avant Lesquin (moins d’1 h 30 pour un bon ordre) : c’est permis.' },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '13 jalons pondérés et 4 points d’« Avant de commencer », total 20 : compte 6 (documents fixes 1, partiel 1, sans mouvement 1, colonnes 1, solde '
        + 'par formule 2), retour 6 (compte de chaque pile 0,375 × 4, autres pools 1,5, abîmées 1,5, crédit et réparation 1,5), ramasse 4 (capacité et '
        + 'camion complet 1, site reporté 1, la tournée tient 1, horaires 1), questions 4 (juste +1, « Je ne sais pas » 0, fausse −1 ÷ nombre de '
        + 'mauvaises réponses, plancher 0). Rien n’est vrai avant l’envoi ; inaction 0.',
      note: 'Poids fixés par Cowork sur délégation de Tristan (17/10/2026), à corriger à l’écran. Le détail jalon par jalon est dans le Suivi.' },
  ],
};

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
const quand = (s) => s.replace(/^2027-(\d\d)-(\d\d) (\d\d):(\d\d)$/, (x, m, j, hh, mm) => `${j}/${m} à ${+hh} h ${mm}`);

export function corrigeEleve(base, uid) {
  const db = base || {};
  const ouvert = !!graineDeBase(db);
  const g = ouvert ? graineDeBase(db) : String(uid || 'anonyme');
  const J = jeuDe(g), A = partieA(J);
  const P = pilesDuJeu(J), C = comptesDe(P);
  const Pd = pieceDernier(J.dernier), O = ordresDe(J);
  const juste = O.justes.slice().sort((a, b) => a.km - b.km)[0];
  const bj = bilanOrdre(juste.ordre, J.vides);
  const items = [
    { genre: 'tableau', texte: 'Ses documents (dans son ordre)', entetes: ['Document', 'Mouvement', 'Partenaire', 'Palettes CHEP'],
      reponses: A.documents.map((d) => [`${d.lettre} — ${d.numero}`, TYPE[d.attendu.type], libPart(d.attendu.part), String(d.attendu.qte)]) },
    { genre: 'question', texte: 'Son solde au 29/01',
      rep: `${A.s0} + ${J.e} − ${J.t} − ${A.parRole.partiel.attendu.qte} = ${palettes(A.solde)} CHEP (le bordereau partiel porte ${A.parRole.partiel.total} palettes, dont `
        + `${A.parRole.partiel.total - A.parRole.partiel.attendu.qte} ${A.parRole.partiel.autres === 'lpr' ? 'LPR' : 'Europe'}).` },
  ];
  if (ouvert && lignesDeclarees(db).length) {
    const s = soldeDeclare(db);
    items.push({ genre: 'question', texte: 'Le solde attendu d’après SES déclarations (ce que juge la séance)', rep: s == null ? 'une quantité illisible dans ses déclarations' : palettes(s) });
  }
  items.push({ genre: 'fait', texte: 'Son bon de collecte', rep: `${J.bc} · ${palettes(C.annoncees)} annoncées en ${P.length} piles de ${PILE_VIDES}` });
  items.push({ genre: 'tableau', texte: 'Ses piles (dans l’ordre du camion)', entetes: ['Pile', 'Palettes sur la pile', 'Ce qu’il y a', 'Décision et réserve attendues'],
    reponses: P.map(lignePile) });
  items.push({ genre: 'question', texte: 'Son crédit attendu (contrôle juste)',
    rep: `Reçues ${C.recues} (manquantes ${C.manquantes}) ; d’un autre pool ${C.autres} ; à créditer ${C.aCrediter} ; en réparation ${C.reparation}.` });
  if (ouvert && quaiClos(db)) {
    const s = creditDeSonControle(db);
    items.push({ genre: 'question', texte: 'Le crédit attendu d’après SON contrôle (ce que juge la séance)', rep: `à créditer ${s.aCrediter} ; hors pool ${s.horsPool} ; réparation ${s.reparation}.` });
  }
  items.push({ genre: 'question', texte: 'Sa ramasse',
    rep: `Capacité ${CAPACITE}. ${nomSite(COMPLET)} : ${palettes(J.V)} → un camion complet. Ses vides : ${IDS_TOURNEE.map((id) => `${nomSite(id)} ${J.vides[id]}`).join(', ')} : `
      + `${IDS_TOURNEE.reduce((t, id) => t + J.vides[id], 0)}, plus que ${CAPACITE}. Plate-forme qui a signalé le plus tard : ${nomSite(Pd.site)} `
      + `(${quand(Pd.signale[Pd.site])}) → reportée à vendredi. Les trois autres : ${O.total} palettes, ça tient. Un ordre juste : `
      + `${juste.ordre.map(nomSite).join(' → ')} (${Math.round(juste.km)} km, retour vers ${hm(bj.arrivee)}, ${Math.round(bj.attente)} min d’attente). `
      + `${O.court.tient ? 'Ici, l’ordre au plus court tient aussi les horaires.' : `L’ordre au plus court (${O.court.ordre.map(nomSite).join(' → ')}) rate un horaire.`} `
      + `${O.justes.length} ordre${O.justes.length > 1 ? 's' : ''} sur 6 ${O.justes.length > 1 ? 'tiennent' : 'tient'}.` });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
