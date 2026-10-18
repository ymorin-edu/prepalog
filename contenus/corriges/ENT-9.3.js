// Corrigé d'ENT-9.3 (CHEP, le relevé contesté), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/chep-ent93-donnees.js`, brief §6 bis) : sa pièce de la banque `client` (A2 : un transfert absent
// du relevé ; A3 : une quantité déclarée fausse), ses valeurs (S_rel, k, e, T2, d, x, les bordereaux justes, F…), l'ordre de ses bordereaux,
// et pour un confirmé l'autre pièce en plus. `CORRIGE` donne ce qui est commun (la méthode, le barème) ; `corrigeEleve(base, uid)` rend le
// corrigé d'un élève, calculé depuis sa base (jamais recopié). Un élève qui n'a pas encore ouvert la séance : son tirage standard se calcule
// quand même (graine = son identifiant + l'id de la séance).

import { ID, TIRAGE, CLIENT, CREDITE, jeuEleve, fiche, FICHES, correctionsEleve, soldeDeSesCorrections, TYPES, CORRECTIONS, QUI, libDe }
  from '../chep-ent93-donnees.js';
import { DISTRIBUTEURS, date, palettes } from '../chep.js';

export const CORRIGE = {
  code: 'ENT-9.3',
  titre: 'CHEP — le relevé contesté',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Repérer ce qui explique l’écart', genre: 'question', texte: 'La méthode (les documents et les chiffres de chaque élève : choisir l’élève ci-dessus)',
      rep: '1. Le BON DE RETOUR du 19/01 a été crédité 75 (« 5 piles × 15 = 75 — OK ») ; le RAPPORT DE TRI du 20/01 trouve 75 − k palettes CHEP et k '
        + 'palettes LPR : mal crédité au retour, AJOUTER k au solde, c’est CHEP qui corrige. 2. Le document de la cliente qui explique l’écart : A2 (un '
        + 'transfert vers Frais du Nord absent du relevé : RETIRER T2) ou A3 (vers Halles d’Artois, déclaré d au lieu de r : RETIRER x = r − d) ; c’est '
        + 'Endives du Ternois qui corrige, sur le portail. 3. Les deux autres bordereaux sont enregistrés et justes : aucune correction (0). 4. L’écart '
        + 'restant avec l’inventaire vient des palettes Europe comptées avec les CHEP. 5. Frais du Nord : moins qu’un camion complet, dans la prochaine tournée.',
      note: 'Pièges : le retour « enregistré et juste » (la mention « OK » de Grégory) ; RETIRER k (le crédit était trop haut : le solde AUGMENTE) ; '
        + 'A2 vu comme une quantité fausse ; A3 corrigé de la quantité déclarée (d) ou du bordereau (r) au lieu de l’écart (x) ; « CHEP » partout ; '
        + '« palettes perdues par le transporteur » ; un camion complet pour Frais du Nord.' },
    { etape: 2, etapeTitre: 'Refaire le solde', genre: 'question', texte: 'Le relevé corrigé',
      rep: 'Une ligne par correction de l’élève : « ajouter » → colonne À ajouter (+), « retirer » → colonne À retirer (−), 0 dans l’autre colonne. '
        + 'Solde corrigé = solde du relevé + ajouts − retraits, par une FORMULE ; écart restant = inventaire − solde corrigé, par une FORMULE.',
      note: 'Le relevé corrigé est jugé sur les corrections que l’élève a écrites dans son enquête (une erreur ne se paie qu’une fois) : k retiré au '
        + 'lieu d’ajouté coûte au jalon 1, pas au relevé. Le solde réel n’est jamais rejugé.' },
    { etape: 3, etapeTitre: 'Répondre à Hélène', genre: 'tableau', texte: 'Les phrases justes (jugées sur le réel : c’est ce qui part chez la cliente)',
      entetes: ['Ligne', 'Phrase juste'],
      reponses: [['L’erreur de CHEP', 'En reprenant votre retour du 19/01, nous avons vu que nous vous avions crédité 75 palettes au lieu de {75 − k} : nous corrigeons, et votre solde augmente de {k}.'],
        ['Ce qu’elle doit faire', 'A2 : déclarer sur le portail le transfert du 21/01 vers Frais du Nord ({T2} palettes) ; A3 : corriger sur le portail la quantité du transfert du 20/01 ({r} palettes, et non {d}).'],
        ['L’écart restant', 'L’écart restant vient de {e} palettes Europe comptées dans votre inventaire : elles ne sont pas sur votre compte CHEP.']] },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '11 jalons pondérés et 3 questions notées, total 20 : repérer 7 (bon de retour 2, document de la cliente 2, documents justes 1, écart de '
        + 'l’inventaire 2), mettre à jour 6 (qui corrige 2, colonnes 2, solde et écart par formule 2), ramasse 1 (Frais du Nord), répondre 3 (erreur de '
        + 'CHEP 1, ce qu’elle doit faire 1, écart restant 1), questions de Sandrine 3 (compter un retour, qui déclare, l’écart restant : 1 chacune). '
        + 'Rien n’est vrai avant l’envoi ; inaction 0.',
      note: 'Poids fixés par Cowork sur délégation de Tristan (17/10/2026), à corriger à l’écran. Confirmé : les deux documents de la cliente (A2 et A3) ; '
        + 'le second est jugé en bonus (+0,5 pour ce qu’il est, +0,5 pour la correction et son nombre, +0,5 pour qui la fait), caché à l’élève.' },
  ],
};

const ATTENDU_TYPE = (c) => libDe(TYPES, c.attendu.type);
const ligneCadre = (c, J) => {
  const quoi = c.role === 'retour'
    ? `Bon de retour ${c.numero} (${date(c.iso)}) : crédité ${CREDITE}, le tri trouve ${c.chep} CHEP et ${c.lpr} LPR`
    : `Bordereau ${c.rang} — ${c.numero} (${date(c.iso)}) → ${DISTRIBUTEURS[c.a].nom} : ${palettes(c.qte)} CHEP ; relevé : ${c.declare == null ? 'absent' : palettes(c.declare)}`;
  return [quoi, ATTENDU_TYPE(c), `${libDe(CORRECTIONS, c.attendu.corr)}${c.attendu.corr === 'aucune' ? '' : ` ${c.attendu.qte}`}`, libDe(QUI, c.attendu.qui)];
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db), V = J.valeurs;
  const socle = J.cadres.filter((c) => !c.bonus);
  const items = [
    { genre: 'fait', texte: 'Son compte', rep: `${CLIENT.nom}, compte ${CLIENT.compte} · relevé au 22/01 : ${palettes(J.sRel)} CHEP · son inventaire du 25/01 : ${palettes(J.sParc)} · `
      + `sa pièce : ${J.role === 'a2' ? 'A2 (transfert absent)' : 'A3 (quantité déclarée fausse)'} · k = ${V.k}, e = ${V.e}, F = ${V.f}` },
    { genre: 'tableau', texte: 'Ses documents, dans l’ordre de sa fiche', entetes: ['Document', 'Dans le relevé', 'Correction', 'Qui'],
      reponses: socle.map((c) => ligneCadre(c, J)) },
  ];
  const B = J.cadres.filter((c) => c.bonus);
  if (B.length) items.push({ genre: 'tableau', bonus: true, texte: 'Le second document de la cliente (confirmé, fin de liste)', entetes: ['Document', 'Dans le relevé', 'Correction', 'Qui'],
    reponses: B.map((c) => ligneCadre(c, J)) });
  const anomalies = J.bordereaux.filter((b) => b.attendu.corr === 'retirer');
  items.push({ genre: 'question', texte: 'Son relevé corrigé attendu',
    rep: `Solde corrigé = ${J.sRel} + ${V.k}${anomalies.map((b) => ` − ${b.attendu.qte}`).join('')} = ${J.sCorrige} palettes CHEP ; écart restant = ${J.sParc} − ${J.sCorrige} = ${J.ecart} `
      + `(les palettes Europe de son inventaire). Frais du Nord (${V.f} palettes) : dans la prochaine tournée de ramasse.` });
  if (ouvert && fiche(db, FICHES.enquete).deja) {
    const L = correctionsEleve(db), s = soldeDeSesCorrections(db);
    items.push({ genre: 'question', texte: 'Ce qu’il a écrit (ses lignes du relevé corrigé)',
      rep: L.length ? `${L.map((l) => `${l.numero} : ${l.corr} ${Number.isFinite(l.qte) ? l.qte : '?'}`).join(' · ')} — son solde corrigé attendu : ${s == null ? '?' : s}, `
        + `son écart : ${s == null ? '?' : J.sParc - s}.` : 'aucune correction.' });
  }
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus l’autre document de la cliente).', items };
  return { texte: '', items };
}
