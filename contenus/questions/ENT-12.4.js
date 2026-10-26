// Les questions d'ENT-12.4 — IKEA, « la facture du transporteur » (brief `docs/briefs/ENT-12.4-ikea-facture-du-transporteur.md` §4 bis et §4 ter ; choix de Tristan du
// 26/10/2026 : propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`).
// Hugo et le prestataire sont CONSTRUITS. Guidage : 4 questions notées (part 4 sur 20, 1 point chacune), corrigées tout de suite, et une réflexion d'éco-droit (art. 1302).
// « Avant de commencer » : non noté, 3 questions tirées (2 de préparation, 1 de droit) parmi 6.

import { apresGeste, apresFiche, apresMail } from '../../core/declencheurs.js';
import { ID, FICHE_ID, MAIL_PRESTA, ouGeste, valeursDe, dossier } from '../ikea-ent124-donnees.js';
import { lireNombre } from '../ikea.js';
import { ttc, arrondi } from '../ikea-facture.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'hugo', doc, rubrique, enonce, choix, juste, retour, ...o });
const eur = (n) => `${String(arrondi(n)).replace('.', ',')} €`;

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { hugo: { nom: 'Hugo', role: 'responsable administratif du service transport', appel: 'Hugo' } },
  ouverture: { id: 'avant-de-commencer', de: 'hugo', titre: 'Avant de commencer', continuer: 'voir l’accueil', calculette: true,
    situation: 'Bonjour ! Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste-124', 'droit-124'],
    tirage: { preparation: 2, droit: 1 },
    questions: ['facture', 'preuve', 'ht-ttc', 'doublon', 'avoir-quoi', 'du'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    q('facture', 'preparation', 'poste-124', 'Une facture d’achat, c’est…',
      [{ v: 'doc', lib: 'le document du fournisseur qui dit ce que l’entreprise doit payer' }, { v: 'commande', lib: 'un bon de commande' }, { v: 'recu', lib: 'un reçu de caisse' }], 'doc',
      'IKEA est ici le client : la facture du prestataire dit ce qu’IKEA doit payer, c’est pourquoi on la contrôle avant de payer.', { cle: true }),
    q('preuve', 'preparation', 'poste-124', 'Pour savoir si une livraison a eu lieu, on regarde…',
      [{ v: 'bon', lib: 'le bon de livraison signé' }, { v: 'tarif', lib: 'le tarif' }, { v: 'catalogue', lib: 'le catalogue' }], 'bon',
      'Le bon signé prouve la livraison ; le tarif donne le prix. Il faut les deux pour contrôler une ligne.', { cle: true }),
    q('ht-ttc', 'preparation', 'poste-124', '200 € HT avec une TVA à 20 %, c’est…',
      [{ v: '240', lib: '240 € TTC' }, { v: '220', lib: '220 € TTC' }, { v: '180', lib: '180 € TTC' }], '240',
      'La TVA de 20 % sur 200 € fait 40 € : 200 + 40 = 240 € TTC.', { cle: true }),
    q('doublon', 'preparation', 'poste-124', 'Deux lignes avec le même numéro de bon et la même date, c’est sans doute…',
      [{ v: 'doublon', lib: 'un doublon' }, { v: 'deux', lib: 'deux livraisons' }, { v: 'remise', lib: 'une remise' }], 'doublon',
      'Un bon, une livraison : deux lignes pour le même bon, c’est une livraison facturée deux fois.', { cle: true }),
    // ── droit (2 : l'élève en reçoit 1)
    q('avoir-quoi', 'droit', 'droit-124', 'On t’a facturé une livraison qui n’a pas eu lieu. Tu demandes…',
      [{ v: 'avoir', lib: 'un avoir' }, { v: 'facture', lib: 'une facture de plus' }, { v: 'rien', lib: 'rien' }], 'avoir',
      'Un avoir annule tout ou partie d’une facture : c’est le document que le fournisseur doit émettre.'),
    q('du', 'droit', 'droit-124', 'Le prestataire a été payé deux fois pour la même livraison. Il doit…',
      [{ v: 'rendre', lib: 'rendre l’argent payé en trop (art. 1302 du Code civil)' }, { v: 'garder', lib: 'le garder' }, { v: 'partager', lib: 'le partager' }], 'rendre',
      'Article 1302 : ce qui a été reçu sans être dû est sujet à restitution.', { cle: true }),
    // ── au fil du travail
    { id: 'quelle-piece', type: 'fil', de: 'hugo', groupe: 'Les lignes à contester', quand: ouGeste(`fiche:${FICHE_ID}:doublon`, `fiche:${FICHE_ID}:tarif`, `fiche:${FICHE_ID}:nonfaite`),
      enonce: 'Avec quelle pièce compares-tu chaque ligne de la facture ?',
      choix: [{ v: 'bon', lib: 'Le bon de livraison signé et le tarif' }, { v: 'catalogue', lib: 'Le catalogue IKEA' }, { v: 'commande', lib: 'La commande du client' }],
      juste: 'bon', retour: 'Le bon prouve la livraison, le tarif donne le prix : une ligne qui ne tient pas avec les deux est à contester.' },
    { id: 'pourquoi-pas-entiere', type: 'fil', de: 'hugo', groupe: 'Les lignes à contester', quand: apresGeste(`fiche:${FICHE_ID}:nonfaite`),
      enonce: 'Pourquoi le prestataire ne peut-il pas facturer la livraison complète quand le client était absent ?',
      choix: [{ v: 'manquee', lib: 'Il n’a pas livré : le tarif ne prévoit qu’une « livraison manquée »' }, { v: 'livre', lib: 'Il a livré quand même' }, { v: 'paye', lib: 'Le client a déjà payé' }],
      juste: 'manquee', retour: 'Le tarif prévoit 30 % du prix pour une livraison manquée : facturer le prix entier, c’est facturer un service qui n’a pas eu lieu.' },
    { id: 'ecart-ttc', type: 'fil', de: 'hugo', groupe: 'Le bon montant', quand: apresGeste(`fiche:${FICHE_ID}:ecart`),
      enonce: 'Ton écart est de X € HT. Combien est-ce en TTC ?',
      selon: (db) => {
        const n = lireNombre(valeursDe(db, FICHE_ID).ecart);
        const x = Number.isFinite(n) ? n : dossier().ecartHT;
        return { enonce: `Ton écart est de ${eur(x)} HT. Combien est-ce en TTC ?`,
          libs: { juste: eur(ttc(x)), ht: eur(x), dix: eur(x * 1.1), plus: eur(x + 20) } };
      },
      choix: [{ v: 'juste', lib: '120 % de l’écart' }, { v: 'ht', lib: 'La même somme' }, { v: 'dix', lib: '110 % de l’écart' }, { v: 'plus', lib: '20 € de plus' }],
      juste: 'juste', retour: 'Le TTC, c’est le HT plus la TVA de 20 % : on multiplie par 1,2.' },
    { id: 'avoir', type: 'fil', de: 'hugo', groupe: 'La réclamation', quand: apresFiche(FICHE_ID),
      enonce: 'À quoi sert un avoir ?',
      choix: [{ v: 'annuler', lib: 'À annuler tout ou une partie d’une facture' }, { v: 'plustard', lib: 'À payer plus tard' }, { v: 'rembourser', lib: 'À rembourser le client final' }],
      juste: 'annuler', retour: 'En réclamant un avoir, IKEA ne paie que ce qu’il doit : la facture est réduite du montant contesté.' },
    { id: 'payer-d-abord', type: 'fil', de: 'hugo', reflexion: true, quand: apresMail({ a: MAIL_PRESTA }),
      enonce: 'Le prestataire répond : « Payez d’abord, on verra après. » IKEA doit-il payer la ligne en double ?',
      choix: [{ v: 'non', lib: 'Non : on ne paie que ce qui est dû (art. 1302 : ce qui est reçu sans être dû se restitue), et on demande un avoir' }, { v: 'oui', lib: 'Oui, toujours' },
        { v: 'plainte', lib: 'Oui, puis on porte plainte' }],
      retour: 'On ne paie que ce qui est dû. Si le paiement est déjà parti, l’article 1302 oblige à rendre ce qui a été reçu sans être dû.' },
  ],
};
