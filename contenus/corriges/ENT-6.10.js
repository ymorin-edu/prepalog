// Corrigé d'ENT-6.10 (France Boissons, le retour de Lucas), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données pures de la séance (`contenus/france-boissons-ent610-donnees.js`, sans le moteur : ce fichier
// se charge aussi dans Node) : le contrôle au quai, la feuille du compte de consignes, les phrases attendues, le chiffrage. Rien n'est recopié.

import { LIVRAISON, LIVRES, VIDES_TICKET, AU_QUAI, CHOIX_TICKET, TICKET_JUSTE, AVANT, REEL, FORMULES_COMPTE, FORMULES_CHIFFRAGE, CHIFFRAGE,
  FUT_BOUTEILLE, NUMERO_TICKET } from '../france-boissons-ent610-donnees.js';
import { CONSIGNES } from '../france-boissons.js';

const fr = (x, d = 1) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d }).format(x);
const eu = (x) => `${x < 0 ? '−' : ''}${fr(Math.abs(x), 0)} €`;
const heineken = LIVRAISON.find((l) => l.refuse);
const LIGNES = ['', 'Chez le client avant la tournée', '+ Pleins livrés', '− Vides repris', '= Chez le client après la tournée',
  'Écart (après − avant)', 'Consigne (€)', 'Montant (€)', 'Total de la tournée (€)'];
const resultat = { B2: AVANT.futs, C2: AVANT.casiers, B3: LIVRES.futs, C3: LIVRES.casiers, B4: AU_QUAI.futs, C4: AU_QUAI.casiers,
  B5: REEL.apres.futs, C5: REEL.apres.casiers, B6: REEL.ecart.futs, C6: REEL.ecart.casiers, B7: CONSIGNES.fut, C7: CONSIGNES.casier,
  B8: REEL.montant.futs, C8: REEL.montant.casiers, B9: REEL.total };
const ch = [CHIFFRAGE.bouteilles, CHIFFRAGE.verre, CHIFFRAGE.vie, CHIFFRAGE.fois];

export const CORRIGE = {
  code: 'ENT-6.10',
  titre: 'France Boissons — le retour de Lucas',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Le contrôle au quai', genre: 'tableau', texte: `Ce qui est au quai, et le ticket n° ${NUMERO_TICKET}`,
      entetes: ['Emballage', 'Au quai', 'Sur le ticket'],
      reponses: [['Fûts vides', String(AU_QUAI.futs), String(VIDES_TICKET.futs)], ['Casiers vides', String(AU_QUAI.casiers), String(VIDES_TICKET.casiers)],
        ['Fût plein revenu (refusé)', String(AU_QUAI.plein), '— (non livré)']],
      note: `« Le ticket est-il juste ? » : ${CHOIX_TICKET.find((c) => c.v === TICKET_JUSTE).lib}. Le ticket a RECOPIÉ les vides de la commande d’ENT-6.2 `
        + `(« repris de la commande ») : un fût vide est resté chez Malo. Le ${heineken.court} cabossé est revenu PLEIN : ce n’est pas un vide. `
        + 'Pièges : recopier le ticket (9) ; compter le fût plein avec les vides.' },
    { etape: 2, etapeTitre: 'Le compte de consignes', genre: 'tableau', texte: 'La feuille de calcul attendue (avec les comptes justes du quai)',
      entetes: ['Ligne', '', 'Fûts (B)', 'Casiers (C)', 'Résultat B / C'],
      reponses: [2, 3, 4, 5, 6, 7, 8, 9].map((n) => [String(n), LIGNES[n - 1], n === 2 ? 'donné' : FORMULES_COMPTE[`B${n}`],
        n === 2 ? 'donné' : (FORMULES_COMPTE[`C${n}`] || ''), n === 9 ? eu(resultat.B9) : n >= 8 ? `${eu(resultat[`B${n}`])} / ${eu(resultat[`C${n}`])}`
          : `${fr(resultat[`B${n}`])} / ${fr(resultat[`C${n}`])}`]),
      note: 'Les lignes 5, 6, 8 et 9 exigent une FORMULE (un nombre tapé est faux). La ligne 4 se juge sur les comptes de l’élève à l’étape 1, et les lignes '
        + '5 à 9 sur ses saisies : une erreur de comptage ne se paie qu’une fois. Autre calcul (trame) : on facture la consigne des '
        + `${LIVRES.futs} fûts livrés (${eu(LIVRES.futs * CONSIGNES.fut)}) et on déconsigne les ${AU_QUAI.futs} repris (${eu(AU_QUAI.futs * CONSIGNES.fut)}), soit `
        + `${eu(REEL.montant.futs)} ; casiers ${LIVRES.casiers} × ${CONSIGNES.casier} − ${AU_QUAI.casiers} × ${CONSIGNES.casier} = ${eu(REEL.montant.casiers)} (un avoir).` },
    { etape: 3, etapeTitre: 'Prévenir Malo et Inès', genre: 'question', texte: 'Les phrases attendues (jugées sur le réel, pas sur la feuille)',
      rep: [`À Malo : Bonjour Malo, · le fût de Heineken abîmé ne vous sera pas facturé · ${AU_QUAI.futs} fûts vides repris et non ${VIDES_TICKET.futs}, `
        + `il en reste un chez vous · ${REEL.apres.futs} fûts et ${REEL.apres.casiers} casiers en consigne chez vous · Cordialement, (prénom), exploitation France Boissons.`,
      `À Inès : Bonjour Inès, · fûts : ${eu(REEL.montant.futs)} de consigne à facturer · casiers : avoir de ${eu(-REEL.montant.casiers).replace('−', '')} · `
        + `facture ${heineken.livre} Heineken 30 L, le ${heineken.commande}e a été refusé · Merci, (prénom).`].join(' — '),
      note: 'Ce qui part chez le client et à la facturation doit être le réel : un élève qui a compté 9 au quai perd aussi ces jalons (assumé, comme en 6.9).' },
    { etape: 4, etapeTitre: 'La boucle des vides', genre: 'tableau', texte: 'Le chiffrage : « Ce que rapporte un fût qui revient »',
      entetes: ['Cellule', 'Saisie ou formule', 'Résultat'],
      reponses: Object.entries(FORMULES_CHIFFRAGE).map(([ref, f], i) => [ref, f, i < 5 ? FUT_BOUTEILLE[i].ecrit : fr(ch[i - 5])]),
      note: 'Pièges : 33 au lieu de 0,33 L, 225 au lieu de 0,225 kg (unités) ; valeurs tapées au lieu de formules ; division inversée. Tolérance 1 % sur les '
        + 'calculs (91 bouteilles accepté). Animation : Q1 « sinon, le camion rentrerait vide et il faudrait un autre trajet » ; Q2 « 40 € de consigne, et '
        + 'un fût de moins dans la boucle » (première réponse).' },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '12 jalons pondérés et 3 questions notées, total 20 : contrôle 4,5 (fûts vides 2, casiers et fût plein 1, écart du ticket 1,5), compte de '
        + 'consignes 5 (livrés et consignes lus 1,5, vides repris et solde en formule 1,5, écart, montants et total en formule 2), prévenir 4 (Malo : fût '
        + 'abîmé et ton 1, vides et solde 1,5 ; Inès 1,5), boucle des vides 2,5 (questions de l’animation 0,5 + 0,5, chiffrage 1,5), questions 4 (qui '
        + 'aurait dû compter 1,5, consigne d’un fût gardé 1,5, réemploi 1). Rien n’est vrai avant l’envoi ; inaction 0.',
      note: 'Poids validés par Tristan le 13/10/2026 (option A).' },
  ],
};
