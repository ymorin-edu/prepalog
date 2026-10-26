// Les questions d'ENT-13.2 — Stellantis, « les camions du matin » (brief `docs/briefs/ENT-13.2-stellantis-camions-du-matin.md` §4 bis et §4 ter ; choix de Tristan du
// 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`).
// Karim est CONSTRUIT. Entraînement : 4 questions notées (part 3 sur 20, 0,75 chacune), corrigées tout de suite, posées à un geste précis :
//   la priorité quand les faisceaux sont posés · le quai 5 à l'envoi du premier planning · la réserve vague quand le BL est écrit · ★ la protestation motivée (Code de commerce, L133-3) quand le BL est signé.
// ★ éco-droit : le texte de L133-3 est celui d'ENT-8.8 et 8.10 (relu sur Légifrance le 17/10/2026) ; Légifrance n'a pas pu être rejoint le 26/10/2026, mais le texte n'a pas changé depuis le 10/12/2009.
// « Avant de commencer » : non noté, 3 questions tirées (une de réception, une de stock, une de droit) parmi 7.

import { ID, planEnCours, planningEnvoye, quaiEcrit, quaiSigne } from '../stellantis-ent132-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } },
  ouverture: { id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['bl-132', 'ligne-132', 'droit-132'],
    tirage: { reception: 1, stock: 1, droit: 1 },
    questions: ['bl', 'reserve', 'precise', 'couverture', 'couv-min', 'delai', 'voiturier'] },
  liste: [
    // ── réception (3 : l'élève en reçoit 1)
    q('bl', 'reception', 'bl-132', 'Le bon de livraison, c’est…',
      [{ v: 'envoye', lib: 'le document qui dit ce que le fournisseur a envoyé' }, { v: 'facture', lib: 'la facture du fournisseur' }, { v: 'commande', lib: 'la commande de l’usine' }], 'envoye',
      'Le bon de livraison (BL) liste ce que le fournisseur a envoyé : on lui compare ce qu’on reçoit. La facture dit ce qu’on doit payer, la commande ce qu’on a demandé.'),
    q('reserve', 'reception', 'bl-132', 'Une réserve, c’est…',
      [{ v: 'ecrit', lib: 'ce qu’on écrit sur le BL quand la livraison n’est pas conforme' }, { v: 'stock', lib: 'un stock de sécurité' }, { v: 'place', lib: 'une place réservée au quai' }], 'ecrit',
      'Une réserve est une remarque écrite sur le BL, avant la signature du chauffeur, quand la livraison n’est pas conforme.'),
    q('precise', 'reception', 'bl-132', 'Une réserve bien écrite dit…',
      [{ v: 'precis', lib: 'combien, quoi, quel dommage' }, { v: 'deballage', lib: '« sous réserve de déballage »' }, { v: 'abimes', lib: '« colis abîmés »' }], 'precis',
      'Une réserve doit être précise : le nombre de cartons, la référence, la nature du dommage. « Sous réserve de déballage » ou « colis abîmés » ne protègent de rien.'),
    // ── stock (2 : l'élève en reçoit 1)
    q('couverture', 'stock', 'ligne-132', '12 contenants à la ligne, 3 consommés par heure : la ligne tient…',
      [{ v: '4', lib: '4 heures' }, { v: '9', lib: '9 heures' }, { v: '36', lib: '36 heures' }], '4',
      '12 ÷ 3 = 4 : la ligne tient 4 heures. La couverture, c’est le stock divisé par la consommation à l’heure.'),
    q('couv-min', 'stock', 'ligne-132', 'La ligne consomme 2 faisceaux par minute. Il en reste 60 à la ligne : elle tient…',
      [{ v: '30', lib: '30 minutes' }, { v: '120', lib: '120 minutes' }, { v: '62', lib: '62 minutes' }], '30',
      '60 ÷ 2 = 30 : la ligne tient 30 minutes. On divise le stock par ce que la ligne consomme à chaque minute.'),
    // ── droit (2 : l'élève en reçoit 1)
    q('delai', 'droit', 'droit-132', 'Un dommage découvert après la livraison se signale au transporteur…',
      [{ v: '3j', lib: 'dans les 3 jours, par écrit motivé' }, { v: 'toujours', lib: 'quand on veut' }, { v: 'jamais', lib: 'jamais' }], '3j',
      'Code de commerce, art. L133-3 : le destinataire a trois jours, jours fériés non compris, pour notifier au transporteur sa protestation motivée, par lettre recommandée.'),
    q('voiturier', 'droit', 'droit-132', 'Dans le Code de commerce, le « voiturier » est…',
      [{ v: 'transporteur', lib: 'le transporteur, celui qui conduit la marchandise' }, { v: 'fournisseur', lib: 'le fournisseur qui vend les pièces' }, { v: 'destinataire', lib: 'l’usine qui reçoit les pièces' }], 'transporteur',
      'Le voiturier est le transporteur : c’est à lui qu’on notifie la protestation motivée de l’article L133-3.'),

    // ── au fil du travail
    { id: 'priorite', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => !!planEnCours(db).faisceaux,
      enonce: 'Deux camions attendent le même quai libre. Les sièges sont arrivés à 5 h 45 et leur pièce couvre 3 h 10 de production ; les faisceaux sont arrivés à 6 h 15 et leur pièce couvre 1 h 40. Lequel décharges-tu en premier ?',
      choix: [{ v: 'faisceaux', lib: 'Les faisceaux : la ligne en manquera la première' }, { v: 'sieges', lib: 'Les sièges : ils sont arrivés les premiers' }, { v: 'peu', lib: 'Peu importe, ils passeront tous les deux' }],
      juste: 'faisceaux', retour: 'La priorité vient de la ligne : la pièce qui manquera la première passe d’abord, même si son camion est arrivé après. Arrivé le premier ne veut pas dire servi le premier.' },
    { id: 'quai5', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => !!planningEnvoye(db, 1),
      enonce: 'Pourquoi le quai 5 ne reçoit-il pas les semi-remorques ?',
      choix: [{ v: 'hauteur', lib: 'Sa hauteur ne convient pas : il est fait pour les porteurs' }, { v: 'loin', lib: 'Il est trop loin de la ligne' }, { v: 'ferme', lib: 'Il est fermé le matin' }],
      juste: 'hauteur', retour: 'Le quai 5 est réservé aux porteurs : sa hauteur ne convient pas à une semi-remorque, qui se pose sur les quais 1 à 4.' },
    { id: 'reserve-vague', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => quaiEcrit(db),
      enonce: 'Sur un bon de livraison, un collègue écrit « colis abîmés » et le chauffeur signe. Le transporteur pourra-t-il contester ?',
      choix: [{ v: 'oui', lib: 'Oui : sans le nombre de cartons, la référence et la nature du dommage, la réserve est trop vague' }, { v: 'non-signe', lib: 'Non : le chauffeur a signé' }, { v: 'non-dit', lib: 'Non : « abîmés » dit tout' }],
      juste: 'oui', retour: 'Une réserve vague se conteste. Il faut écrire combien de cartons, quelle référence, quel dommage : c’est ce qui permet de se faire rembourser.' },
    { id: 'protestation', type: 'fil', de: 'karim', groupe: 'Les questions', poids: 1, cle: true,
      quand: (db) => quaiSigne(db),
      enonce: 'Demain, en ouvrant un carton intact, on découvre des faisceaux coupés. On n’avait rien écrit sur le bon de livraison. Que peut-on faire ?',
      choix: [{ v: 'lettre', lib: 'Envoyer au transporteur une protestation motivée dans les 3 jours, jours fériés non compris, par lettre recommandée' }, { v: 'plus', lib: 'Plus rien : le bon est signé' }, { v: 'chauffeur', lib: 'Appeler le chauffeur quand on veut' }],
      juste: 'lettre', retour: 'Code de commerce, art. L133-3 : il reste trois jours, jours fériés non compris, pour notifier au transporteur une protestation motivée, par lettre recommandée. Passé ce délai, l’action contre lui est éteinte.' },
  ],
};
