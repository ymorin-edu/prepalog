// Les questions d'ENT-12.8 — IKEA, évaluation « la facture de mars » (brief `docs/briefs/ENT-12.8-ikea-evaluation-gestion.md` §4, §4 bis ; choix de Tristan du 26/10/2026 :
// propositions du brief prises telles quelles). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Hugo et le prestataire sont CONSTRUITS.
//
// ÉVALUATION, comme ENT-11.7. « Avant de commencer » : NOTÉ (`part: 4` sur 20), sans aide ni mot cliquable ; l'élève reçoit quatre questions tirées (2 de préparation, 2 de droit) parmi
// huit ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction. Les six questions de la préparation et du droit
// d'ENT-12.4 sont reprises (la question « du » sans la mention de l'article dans son choix : en évaluation, elle donnerait sa réponse), et deux nouvelles de droit sont écrites ici.
// Les DEUX questions du brief §4 bis, au fil du travail, sont des RÉFLEXIONS non notées, sans retour montré (« Merci, je note ») : les 20 points sont déjà distribués.
// La question d'éco-droit appliquée au cas (art. 1302) est `deux-fois`.

import { apresFiche } from '../../core/declencheurs.js';
import { ID, FICHE_ID, ouGeste } from '../ikea-ent128-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'hugo', doc, rubrique, enonce, choix, juste, retour, ...o });

export const QUESTIONS = {
  id: ID,
  personnes: { hugo: { nom: 'Hugo', role: 'responsable administratif du service transport', appel: 'Hugo' } },
  ouverture: { id: 'avant-de-commencer', de: 'hugo', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions, sans aide.',
    documents: ['poste-128', 'droit-128'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['facture', 'preuve', 'ht-ttc', 'doublon', 'avoir-quoi', 'du', 'ligne-fausse', 'preuve-litige'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('facture', 'preparation', 'poste-128', 'Une facture d’achat, c’est…',
      [{ v: 'doc', lib: 'le document du fournisseur qui dit ce que l’entreprise doit payer' }, { v: 'commande', lib: 'un bon de commande' }, { v: 'recu', lib: 'un reçu de caisse' }], 'doc',
      'IKEA est ici le client : la facture du prestataire dit ce qu’IKEA doit payer, c’est pourquoi on la contrôle avant de payer.', { cle: true }),
    q('preuve', 'preparation', 'poste-128', 'Pour savoir si une livraison a eu lieu, on regarde…',
      [{ v: 'bon', lib: 'le bon de livraison signé' }, { v: 'tarif', lib: 'le tarif' }, { v: 'catalogue', lib: 'le catalogue' }], 'bon',
      'Le bon signé prouve la livraison ; le tarif donne le prix. Il faut les deux pour contrôler une ligne.', { cle: true }),
    q('ht-ttc', 'preparation', 'poste-128', '300 € HT avec une TVA à 20 %, c’est…',
      [{ v: '360', lib: '360 € TTC' }, { v: '320', lib: '320 € TTC' }, { v: '240', lib: '240 € TTC' }], '360',
      'La TVA de 20 % sur 300 € fait 60 € : 300 + 60 = 360 € TTC.', { cle: true }),
    q('doublon', 'preparation', 'poste-128', 'Deux lignes avec le même numéro de bon et la même date, c’est sans doute…',
      [{ v: 'doublon', lib: 'un doublon' }, { v: 'deux', lib: 'deux livraisons' }, { v: 'remise', lib: 'une remise' }], 'doublon',
      'Un bon, une livraison : deux lignes pour le même bon, c’est une livraison facturée deux fois.', { cle: true }),
    // ── droit (4 : l'élève en reçoit 2)
    q('avoir-quoi', 'droit', 'droit-128', 'On t’a facturé une livraison qui n’a pas eu lieu. Tu demandes…',
      [{ v: 'avoir', lib: 'un avoir' }, { v: 'facture', lib: 'une facture de plus' }, { v: 'rien', lib: 'rien' }], 'avoir',
      'Un avoir annule tout ou partie d’une facture : c’est le document que le fournisseur doit émettre.'),
    q('du', 'droit', 'droit-128', 'Le prestataire a été payé deux fois pour la même livraison. Il doit…',
      [{ v: 'rendre', lib: 'rendre l’argent payé en trop' }, { v: 'garder', lib: 'le garder' }, { v: 'partager', lib: 'le partager' }], 'rendre',
      'Article 1302 : ce qui a été reçu sans être dû est sujet à restitution.', { cle: true }),
    q('ligne-fausse', 'droit', 'droit-128', 'Une ligne de la facture ne correspond à aucun bon signé. IKEA doit payer…',
      [{ v: 'du', lib: 'ce qui est dû, et réclamer un avoir pour le reste' }, { v: 'tout', lib: 'toute la facture, puis oublier' }, { v: 'rien', lib: 'rien du tout, même les lignes justes' }], 'du',
      'On ne paie que ce qui est dû : les lignes justes se paient, la ligne fausse se réclame.'),
    q('preuve-litige', 'droit', 'droit-128', 'Le prestataire affirme avoir livré un client absent. La preuve la plus solide est…',
      [{ v: 'bon', lib: 'le bon de livraison signé, ou la mention « client absent » du livreur' }, { v: 'souvenir', lib: 'le souvenir du livreur' }, { v: 'parole', lib: 'la parole du prestataire' }], 'bon',
      'Un écrit daté et signé vaut mieux qu’un souvenir : c’est ce qui sépare une livraison faite d’une livraison manquée.'),
    // ── au fil du travail : deux réflexions, non notées (brief §4 bis)
    { id: 'preuve-ligne', type: 'fil', de: 'hugo', reflexion: true, groupe: 'Les lignes à contester', quand: ouGeste(`fiche:${FICHE_ID}:doublon`, `fiche:${FICHE_ID}:tarif`, `fiche:${FICHE_ID}:nonfaite`),
      enonce: 'Quelle pièce prouve ton motif pour la ligne que tu viens de contester ?',
      choix: [{ v: 'bon', lib: 'Le bon de livraison signé de cette ligne' }, { v: 'tarif', lib: 'La ligne du tarif qui correspond' }, { v: 'les-deux', lib: 'Le bon et le tarif, ensemble' }, { v: 'catalogue', lib: 'Le catalogue IKEA' }],
      retour: 'Le bon prouve la livraison, le tarif donne le prix : un motif se prouve avec l’une ou l’autre, ou les deux.' },
    { id: 'deux-fois', type: 'fil', de: 'hugo', reflexion: true, groupe: 'La réclamation', quand: apresFiche(FICHE_ID),
      enonce: 'Le prestataire a été payé deux fois pour la même livraison. Il doit…',
      choix: [{ v: 'rendre', lib: 'Rendre ce qu’il a reçu sans que ce soit dû (art. 1302 du Code civil)' }, { v: 'garder', lib: 'Le garder' }, { v: 'moitie', lib: 'En rendre la moitié' }],
      retour: 'Art. 1302 : ce qui a été reçu sans être dû est sujet à restitution.' },
  ],
};
