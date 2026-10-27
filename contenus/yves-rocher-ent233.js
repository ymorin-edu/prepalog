// ENT-23.3 — Yves Rocher, « contrôler un carton » : ENTRAÎNEMENT de C2.2, 2de Bac Pro. Le carton panaché de Lorient, préparé par Maël, passe au
// contrôle : le statut de chaque ligne (conforme, il en manque, en trop, pas le bon produit), ce qu'on fait du carton, ce qu'il faut ajouter et
// retirer, puis les bonnes pratiques qui évitent l'erreur. Compte rendu à Soizic.
// Univers : `contenus/yves-rocher.js` ; données : `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.3.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le contrôle 5 (1 × 5) · le carton 4 (décision 2, à ajouter 1, à retirer 1) ·
// les bonnes pratiques 3 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, proche, memes } from './fabrique-fiches.js';
import { U_PREPA, SALUT, FIN } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_PREPARER, docControle } from './yves-rocher.js';
import { CONTROLE233, STATUTS, statutDe, COLIS_CHOIX, PRATIQUES, PRATIQUES_JUSTES, nomDe } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.3.js';

export * from './yves-rocher.js';

const L = CONTROLE233;
const de = (p) => L.find((c) => c.prod === p);
const AJOUTER = de('creme').attendu - de('creme').scanne;
const RETIRER = de('masque').scanne - de('masque').attendu;

const S = seanceFiches(U_PREPA, {
  id: 'yves-rocher-controle', prefixe: '233', titre: 'Contrôler un carton', exercice: 'Séance 3 : contrôler un carton',
  documents: [DOC_SITE, DOC_PREPARER, docControle(L)],
  pas: [
    { id: 'controle', libelle: 'Le contrôle', titre: 'Le carton de Lorient', sousTitre: 'Compare le bon et ce qui a été scanné dans le carton.',
      objet: 'Le contrôle', pieces: ['controle'], documents: ['controle'],
      message: 'Bonjour {prenom} ! Avant de fermer un carton, on le contrôle. Voici celui que Maël a préparé pour Lorient : pour chaque ligne, qu’est-ce que tu vois ?',
      blocs: L.map((c) => ({ type: 'liste', id: `ligne-${c.prod}`, lib: `${nomDe(c.prod)}${c.teinte ? `, ${c.teinte}` : ''}`, vide: 'Choisir…', manque: `la ligne ${nomDe(c.prod).toLowerCase()}`, choix: STATUTS })),
      jalons: L.map((c, i) => ({ id: `ligne-${i + 1}`, titre: `Le contrôle : ${nomDe(c.prod).toLowerCase()}`, groupe: 'Le contrôle', poids: 1,
        attendu: STATUTS.find((x) => x.v === statutDe(c)).lib, juste: (v) => v[`ligne-${c.prod}`] === statutDe(c) })) },
    { id: 'carton', libelle: 'Le carton', titre: 'Que fais-tu du carton ?', sousTitre: 'Il n’est pas encore fermé.',
      objet: 'Le carton de Lorient', pieces: ['controle'], documents: ['controle', 'preparer'],
      message: 'Le carton n’est pas encore fermé. Que fais-tu, et combien d’articles faut-il ajouter et retirer ?',
      blocs: [{ type: 'choix', id: 'decision', lib: 'Que fais-tu ?', colonne: true, manque: 'ta décision', choix: COLIS_CHOIX },
        { type: 'nombre', id: 'ajouter', lib: 'Combien de crèmes mains faut-il ajouter ?', unite: 'crèmes mains', min: 0, entier: true, manque: 'les crèmes à ajouter' },
        { type: 'nombre', id: 'retirer', lib: 'Combien de masques faut-il retirer ?', unite: 'masques', min: 0, entier: true, manque: 'les masques à retirer' }],
      jalons: [{ id: 'decision', titre: 'Le carton : la décision', groupe: 'Le carton', poids: 2, attendu: COLIS_CHOIX.find((x) => x.v === 'corriger').lib, juste: (v) => v.decision === 'corriger' },
        { id: 'ajouter', titre: 'Le carton : les crèmes à ajouter', groupe: 'Le carton', poids: 1, attendu: String(AJOUTER), juste: (v) => proche(v.ajouter, AJOUTER) },
        { id: 'retirer', titre: 'Le carton : les masques à retirer', groupe: 'Le carton', poids: 1, attendu: String(RETIRER), juste: (v) => proche(v.retirer, RETIRER) }] },
    { id: 'pratiques', libelle: 'Les bons gestes', titre: 'Pour ne pas se tromper', sousTitre: 'Coche les gestes qui évitent ces erreurs.',
      objet: 'Les bons gestes', documents: ['controle', 'preparer'],
      message: 'Maël s’est trompé trois fois. Quels gestes évitent ces erreurs ? Coche-les.',
      blocs: [{ type: 'cases', id: 'pratiques', titre: 'Les gestes qui évitent les erreurs', choix: PRATIQUES }],
      jalons: [{ id: 'pratiques', titre: 'Les bons gestes', groupe: 'Les bons gestes', poids: 3, attendu: PRATIQUES.filter((x) => PRATIQUES_JUSTES.includes(x.v)).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.pratiques || [], PRATIQUES_JUSTES) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne.',
    lignes: (prenom) => [SALUT('Soizic'),
      { id: 'ecarts', choix: [`Il manquait ${AJOUTER} crèmes mains, il y avait ${RETIRER} masques en trop et les rouges à lèvres n’étaient pas de la bonne teinte.`,
        `Il manquait ${AJOUTER} crèmes mains ; le reste était conforme.`, 'Le carton était conforme.'], juste: 0 },
      { id: 'fait', choix: ['J’ai corrigé le carton avant de le fermer.', 'J’ai fermé le carton et prévenu la boutique.', 'J’ai vidé le carton et tout recommencé.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Contrôle le carton de Lorient, ligne par ligne.', 'Que fais-tu du carton ?', 'Les gestes qui évitent les erreurs.', 'Réponds à Soizic, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, tu aides Inès à répondre à une boutique.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
