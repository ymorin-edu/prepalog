// Les questions d'ENT-11.7 — Mondial Relay, évaluation « la lampe d'Inès » (brief `docs/briefs/ENT-11.7-mondial-relay-evaluation-client.md` §4, §4 bis ;
// choix de Tristan du 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une
// séance » dans `activites/FICHE-SEANCE.md`. Claire, Inès et leurs phrases sont CONSTRUITES.
//
// ÉVALUATION. Deux sortes de questions :
// - « Avant de commencer » : NOTÉ (`part: 4` sur 20), sans aide ni mot cliquable. L'élève reçoit quatre questions tirées (2 de préparation, 2 de droit)
//   parmi huit. Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Deux questions clés d'ENT-6.2 (France Boissons,
//   la commande de La Cabane à Malo) sont reprises, adaptées à Mondial Relay : `qui-est-ines` (qui est le client, d'où le « vous » ; ENT-6.2 `qui-est-malo`) et
//   `vente-conclue` (l'article 1113 du Code civil, offre et acceptation ; ENT-6.2 `vente-conclue`). Les autres notions du contrat et des conditions de vente
//   sont reprises dans les questions de droit.
// - Les TROIS questions du brief §4 bis, au fil du travail, en RÉFLEXION (non notées, sans bonne réponse, aucun retour montré en copie : « Merci, je
//   note ») : les points de l'évaluation sont déjà tous distribués (poids du brief §5, 4 points pour l'ouverture), une question notée de plus ferait
//   dépasser les 20. La question d'éco-droit appliquée au cas (l'indemnité de 25 € de l'article 12) est `combien-lampe`.
//
// Ce fichier n'importe que les données pures de la séance (`contenus/mondial-relay-ent117-donnees.js`).

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { ID, DIALOGUE_ID, FICHES, INDEMNITE_DE_BASE, MAIL_INES, situationDe } from '../mondial-relay-ent117-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'claire', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  personnes: {
    claire: { nom: 'Claire', role: 'responsable du service client', appel: 'Claire' },
    ines: { nom: 'Inès Garnier', role: 'cliente', appel: 'Inès' },
  },
  ouverture: { id: 'avant-de-commencer', de: 'claire', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.',
    documents: ['poste-117', 'droit-117'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['qui-est-ines', 'poste-relais', 'numero-colis', 'ecrit-client', 'vente-conclue', 'offre-magasin', 'acceptation-depot', 'cgv-pourquoi'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('qui-est-ines', 'preparation', 'poste-117', 'Qui est Inès Garnier pour Mondial Relay ?',
      [{ v: 'cliente', lib: 'Une cliente : elle envoie un colis avec Mondial Relay' }, { v: 'collegue', lib: 'Une collègue du service client' },
        { v: 'relais', lib: 'La commerçante d’un Point Relais' }], 'cliente',
      'Inès est une cliente : on lui répond au « vous », même si elle est fâchée.', { cle: true }),
    q('poste-relais', 'preparation', 'poste-117', 'Un Point Relais, c’est…',
      [{ v: 'commerce', lib: 'un commerce où le destinataire retire son colis' }, { v: 'entrepot', lib: 'un entrepôt de Mondial Relay' },
        { v: 'camion', lib: 'un camion de livraison' }], 'commerce',
      'Le colis attend au Point Relais, chez un commerçant, que son destinataire vienne le chercher.'),
    q('numero-colis', 'preparation', 'poste-117', 'À quoi sert le numéro de colis ?',
      [{ v: 'suivi', lib: 'À retrouver le suivi du colis' }, { v: 'payer', lib: 'À payer l’envoi' }, { v: 'relais', lib: 'À choisir le Point Relais' }], 'suivi',
      'Le numéro de colis retrouve tout le parcours du colis, jusqu’au Point Relais.'),
    q('ecrit-client', 'preparation', 'poste-117', 'Tu écris à une cliente que tu ne connais pas. Tu commences par…',
      [{ v: 'madame', lib: '« Bonjour Madame, »' }, { v: 'salut', lib: '« Salut, »' }, { v: 'coucou', lib: '« Coucou, »' }], 'madame',
      'À une cliente, on écrit poliment et au « vous ».'),
    // ── droit (4 : l'élève en reçoit 2)
    q('vente-conclue', 'droit', 'droit-117', 'Inès confie son colis à Mondial Relay en acceptant ses conditions de vente. D’après l’article 1113 du Code civil, qu’est-ce qui forme le contrat ?',
      [{ v: 'offre-acceptation', lib: 'L’offre de Mondial Relay et l’acceptation d’Inès' }, { v: 'notaire', lib: 'La signature d’un notaire' },
        { v: 'paiement', lib: 'Le paiement seul' }], 'offre-acceptation',
      'Le contrat est formé par la rencontre d’une offre et d’une acceptation. Les conditions de vente en font partie.', { cle: true }),
    q('offre-magasin', 'droit', 'droit-117', 'Un magasin écrit à un client : « Nous pouvons vous livrer jeudi. » D’après l’article 1113, ce message est…',
      [{ v: 'offre', lib: 'une offre : la vente sera conclue si le client l’accepte' }, { v: 'acceptation', lib: 'une acceptation : la vente est déjà conclue' },
        { v: 'rien', lib: 'sans aucune valeur' }], 'offre',
      'Offre + acceptation = contrat. Ce que tu écris à un client peut engager l’entreprise.'),
    q('acceptation-depot', 'droit', 'droit-117', 'Inès dépose son colis après avoir coché « J’accepte les conditions de vente ». D’après l’article 1113, c’est…',
      [{ v: 'acceptation', lib: 'une acceptation : sa volonté de s’engager résulte d’un comportement non équivoque' }, { v: 'offre', lib: 'une offre de Mondial Relay' },
        { v: 'attente', lib: 'rien, tant qu’elle n’a pas été indemnisée' }], 'acceptation',
      'La volonté de s’engager peut résulter d’un comportement non équivoque : cocher puis déposer le colis.'),
    q('cgv-pourquoi', 'droit', 'droit-117', 'Pourquoi Mondial Relay écrit-il ses conditions de vente ?',
      [{ v: 'memes-regles', lib: 'Pour fixer les mêmes règles (délais, indemnités) à tous ses clients' }, { v: 'secret', lib: 'Pour les garder secrètes' },
        { v: 'chaque-fois', lib: 'Pour changer les règles à chaque client' }], 'memes-regles',
      'Les mêmes règles écrites pour tous : c’est ce qui permet de répondre à une réclamation sans faire de favoris.'),
    // ── au fil du travail : trois réflexions, non notées (brief §4 bis)
    { id: 'numero-d-abord', type: 'fil', de: 'claire', reflexion: true, quand: apresGeste(`dialogue:${DIALOGUE_ID}:numero`),
      enonce: 'Pourquoi demander le numéro de colis avant tout le reste ?',
      choix: [{ v: 'suivi', lib: 'Tout part de ce numéro : il retrouve le suivi du colis' }, { v: 'patienter', lib: 'Pour faire patienter la cliente' },
        { v: 'temps', lib: 'Pour remplir le temps de l’appel' }, { v: 'payer', lib: 'Pour lui demander de payer' }],
      retour: 'Avec le numéro, tu retrouves les dates et l’état du colis : sans lui, tu ne peux rien vérifier.' },
    { id: 'combien-lampe', type: 'fil', de: 'claire', reflexion: true, quand: apresFiche(FICHES.regle),
      enonce: 'Inès a vendu sa lampe 60 €. Quelle phrase de l’article 12 s’applique à elle ?',
      selon: (db) => ({ enonce: `Inès a vendu sa lampe ${situationDe(db).prix} €. Quelle phrase de l’article 12 s’applique à son colis ?` }),
      choix: [{ v: 'plafond', lib: `« L’indemnité est limitée à ${INDEMNITE_DE_BASE} € par colis. Les frais d’envoi ne sont pas remboursés. »` },
        { v: 'assurance', lib: '« Une assurance en option permet d’être indemnisé au-delà, jusqu’à 500 € selon le niveau choisi. »' },
        { v: 'prix', lib: 'Aucune : le prix de la lampe est toujours remboursé en entier' }],
      retour: 'L’article 12 fixe une indemnité de base et une assurance en option : la phrase qui s’applique dépend de l’assurance prise.' },
    { id: 'prochain-envoi', type: 'fil', de: 'claire', reflexion: true, quand: apresMail({ a: MAIL_INES }),
      enonce: 'Inès n’est pas contente du montant. Que peux-tu lui conseiller pour son prochain envoi ?',
      choix: [{ v: 'assurance', lib: 'L’assurance en option, pour être indemnisée au-delà de la base' }, { v: 'rien', lib: 'Rien : ce n’est pas notre problème' },
        { v: 'emballer', lib: 'Mieux emballer seulement' }, { v: 'offrir', lib: 'Lui offrir son prochain envoi' }],
      retour: 'Un bon conseil vient de la règle : l’assurance en option et un emballage soigné vont ensemble. Une promesse qu’on ne peut pas tenir, jamais.' },
  ],
};
