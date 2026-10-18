// Corrigé d'ENT-9.1 (CHEP, le compte palettes), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/chep-ent91-donnees.js`, brief §6 bis) : son solde de départ, ses quantités, son document
// partiel (palettes Europe ou LPR mêlées), son document sans mouvement (palettes Europe seules, ou une commande), l'ordre de ses documents,
// et pour un confirmé deux documents de plus. `CORRIGE` donne ce qui est commun (la méthode, le barème) ; `corrigeEleve(base, uid)` rend le
// corrigé d'un élève, calculé depuis sa base (jamais recopié). Un élève qui n'a pas encore ouvert la séance : son tirage standard se calcule
// quand même (graine = son identifiant + l'id de la séance).

import { ID, TIRAGE, CLIENT, jeuEleve, libType, libPartenaire, lignesDeclarees, caseSolde, fiche, FICHES } from '../chep-ent91-donnees.js';
import { date, palettes } from '../chep.js';

export const CORRIGE = {
  code: 'ENT-9.1',
  titre: 'CHEP — le compte palettes',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Repérer les mouvements', genre: 'question', texte: 'La méthode (les documents et les chiffres de chaque élève : choisir l’élève ci-dessus)',
      rep: '1. Un bon d’ÉMISSION (CHEP Templemars livre des palettes vides) : les palettes ENTRENT sur le compte. 2. Un BORDEREAU vers une plate-forme : '
        + 'un TRANSFERT, avec seulement les palettes CHEP du cadre « Supports de charge » (ni les Europe, ni les LPR). 3. Un bon de RETOUR : les palettes '
        + 'SORTENT du compte. 4. Un bordereau sans aucune palette CHEP, une commande à livrer plus tard, un duplicata ou un document daté après le 15/01 : '
        + 'AUCUN mouvement CHEP.',
      note: 'Pièges : l’émission classée « retour » (le camion vient de Templemars) ; tout le camion déclaré pour le document partiel ; les palettes Europe '
        + 'déclarées ; la commande du 19/01 déclarée comme émission ; le nombre de colis recopié à la place des palettes.' },
    { etape: 2, etapeTitre: 'Tenir le compte', genre: 'question', texte: 'Le relevé',
      rep: 'Émission → colonne Entrées (+) ; transfert et retour → colonne Sorties (−) ; 0 dans l’autre colonne. Solde au 15/01 = solde au 11/01 '
        + '+ entrées − sorties, par une FORMULE (« =D2+SOMME(B3:B…)−SOMME(C3:C…) » ou toute formule équivalente qui lit les cases).',
      note: 'Le relevé est jugé sur les lignes que l’élève a déclarées (une erreur ne se paie qu’une fois) : un transfert oublié coûte au jalon '
        + '« repérer », pas au relevé. Le solde réel n’est jamais rejugé.' },
    { etape: 3, etapeTitre: 'Répondre à Hélène', genre: 'tableau', texte: 'Les phrases justes (le solde repris est celui de l’élève, sans correction)',
      entetes: ['Ligne', 'Phrase juste'],
      reponses: [['Ce qu’elle paie', 'Vous payez la location de ces palettes pour chaque jour où elles restent sur votre compte.'],
        ['Le conseil', 'Déclarez chaque transfert dès le départ du camion, avec le nombre de palettes CHEP du bordereau.'],
        ['La fin', 'Je reste à votre disposition. Bien cordialement, {prénom} — CHEP France, Templemars']] },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '11 jalons pondérés et 3 questions notées, total 20 : repérer 8 (types des trois documents fixes 2, document partiel 2, document sans '
        + 'mouvement 2, partenaires 1, quantités 1), mettre à jour 6 (colonnes 3, formule 1, solde 2), informer 3 (ce qu’elle paie 1, conseil 1, fin 1), '
        + 'questions de Sandrine 3 (les palettes à déclarer, qui répond des palettes, ce que dit le solde : 1 chacune). Rien n’est vrai avant l’envoi ; '
        + 'inaction 0.',
      note: 'Poids fixés par Cowork sur délégation de Tristan (17/10/2026), à corriger à l’écran. Confirmé : deux documents de plus (+0,5 chacun s’il est '
        + 'classé « Aucun mouvement CHEP », caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db);
  const socle = J.documents.filter((d) => !d.role.startsWith('bonus'));
  const items = [
    { genre: 'fait', texte: 'Son compte', rep: `${CLIENT.nom}, compte ${CLIENT.compte} · solde au ${date('2027-01-11')} : ${palettes(J.s0)} CHEP` },
    { genre: 'tableau', texte: 'Ses documents, dans l’ordre de sa fiche',
      entetes: ['Document', 'Date', 'Ce que c’est', 'Mouvement attendu', 'Partenaire', 'Palettes CHEP'],
      reponses: socle.map((d) => [`Document ${d.lettre}`, date(d.iso), titreDoc(d), libType(d.attendu.type), d.attendu.type === 'aucun' ? '—' : libPartenaire(d.attendu.part),
        d.attendu.type === 'aucun' ? '0' : String(d.attendu.qte)]) },
  ];
  const B = J.documents.filter((d) => d.role.startsWith('bonus'));
  if (B.length) {
    items.push({ genre: 'tableau', bonus: true, texte: 'Documents en plus (fin de liste)', entetes: ['Document', 'Date', 'Ce que c’est', 'Attendu'],
      reponses: B.map((d) => [`Document ${d.lettre}`, date(d.iso), titreDoc(d), 'Aucun mouvement CHEP']) });
  }
  const e = J.parRole.emission.attendu.qte, t = J.parRole.transfert.attendu.qte, c = J.parRole.partiel.attendu.qte, r = J.parRole.retour.attendu.qte;
  items.push({ genre: 'question', texte: 'Son relevé attendu',
    rep: `Solde au 15/01 = ${J.s0} + ${e} − ${t} − ${c} − ${r} = ${J.solde} palettes CHEP. Formule : le solde de départ + les entrées − les sorties.` });
  if (ouvert && fiche(db, FICHES.decl).deja) {
    const L = lignesDeclarees(db);
    items.push({ genre: 'question', texte: 'Ce qu’il a déclaré (ses lignes du relevé)',
      rep: L.length ? L.map((l) => `Doc. ${l.lettre} : ${libType(l.type)}, ${libPartenaire(l.part) || '?'}, ${Number.isFinite(l.qte) ? l.qte : '?'}`).join(' · ')
        + ` — case du solde : ${caseSolde(L.length)}.` : 'aucun mouvement déclaré.' });
  }
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus deux documents).', items };
  return { texte: '', items };
}

function titreDoc(d) {
  if (d.genre === 'emission') return 'Bon d’émission (CHEP Templemars → Endives du Ternois)';
  if (d.genre === 'retour') return 'Bon de retour (Endives du Ternois → Templemars)';
  if (d.genre === 'commande') return `Commande de ${palettes(d.qte)} à livrer le ${date(d.livraison)}`;
  const S = d.supports || {};
  const parts = [];
  if (S.chep) parts.push(`${S.chep} CHEP`);
  if (S.europe) parts.push(`${S.europe} Europe`);
  if (S.lpr) parts.push(`${S.lpr} LPR`);
  return `Bordereau → ${libPartenaire(d.a)}${d.duplicata ? ' (duplicata)' : ''} : ${parts.join(' + ')}`;
}
