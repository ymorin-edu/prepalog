// ENT-19.9 — Amazon, « les robots et moi » : GUIDAGE de CAP-C1.1 (se situer dans l'entreprise) et CAP-C3.6 (les conséquences d'un fait
// économique sur l'activité logistique), CAP OL. Des faits RÉELS et datés (`DOC_FAITS`) : le recrutement de saisonniers avant Noël, les robots,
// la livraison du lendemain ; l'élève relie chaque fait à sa conséquence, fait deux calculs simples, dit ce que les robots changent à son
// poste, puis rend compte.
// Univers : `contenus/amazon.js` ; données : `FAITS` de `contenus/amazon-donnees.js` ; questions : `contenus/questions/ENT-19.9.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : fait → conséquence 6 (1,5 × 4) · les calculs 3 (1,5 × 2) ·
// ce qui change au poste 3 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, proche, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_FAITS } from './amazon.js';
import { FAITS, nombreFr } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.9.js';

export * from './amazon.js';

export const CONSEQUENCES = [
  { v: 'commandes', lib: 'Il y a beaucoup plus de commandes à préparer en peu de temps' },
  { v: 'marche', lib: 'Le salarié reste à son poste : il ne marche plus dans les allées' },
  { v: 'nuit', lib: 'Le centre travaille jour et nuit, en équipes' },
  { v: 'carton', lib: 'On prend le plus petit carton possible' },
  { v: 'ferme', lib: 'Le centre ferme pendant les fêtes' },
];
// CONSTRUIT pour l'exercice : le 4e fait (le prix du carton) ; les trois autres sont réels (`DOC_FAITS`, `DOC_SITE`).
export const LIENS = [
  { id: 'fait-1', fait: `D’octobre à décembre, Amazon recrute ${nombreFr(FAITS.saisonniers)} saisonniers.`, juste: 'commandes' },
  { id: 'fait-2', fait: 'À Brétigny, des robots apportent l’armoire devant le poste.', juste: 'marche' },
  { id: 'fait-3', fait: 'Un client commande le soir et veut son colis le lendemain.', juste: 'nuit' },
  { id: 'fait-4', fait: 'Le carton coûte cher et prend de la place dans le camion.', juste: 'carton' },
];
export const HORS_HDF = FAITS.saisonniers - FAITS.saisonniersHdf;          // 6 800
export const PAR_SITE = FAITS.saisonniers / FAITS.sites;                    // 237,5 : on accepte 237 ou 238
export const CHANGE = [
  { v: 'poste', lib: 'Je reste à mon poste : l’armoire vient à moi', juste: true },
  { v: 'ecran', lib: 'Je suis les consignes de l’écran du poste', juste: true },
  { v: 'barriere', lib: 'Je n’entre jamais dans la zone des robots', juste: true },
  { v: 'personne', lib: 'On n’a plus besoin de personne' },
  { v: 'conduire', lib: 'Je conduis le robot avec une manette' },
];

const S = seanceFiches(U, {
  id: 'amazon-robots', prefixe: '199', titre: 'Les robots et moi', exercice: 'Séance 9 : les robots et moi',
  documents: [DOC_SITE, DOC_FAITS],
  pas: [
    { id: 'liens', libelle: 'Faits et conséquences', titre: 'Un fait, une conséquence', sousTitre: 'Pour chaque fait, choisis ce qu’il change au centre.',
      objet: 'Les chiffres d’Amazon', pieces: ['faits', 'site'], documents: ['faits', 'site'],
      message: 'Bonjour {prenom} ! Aujourd’hui, on lève la tête du poste. Lis « Les chiffres » et « Le centre de Brétigny » : ce sont des faits réels.\n\n'
        + 'Pour chaque fait, dis-moi ce qu’il change pour le centre.',
      blocs: LIENS.map((L, i) => ({ type: 'liste', id: L.id, lib: L.fait, vide: 'Choisir…', manque: `la conséquence du fait ${i + 1}`, choix: CONSEQUENCES })),
      jalons: LIENS.map((L, i) => ({ id: L.id, titre: `Le fait n° ${i + 1} et sa conséquence`, groupe: 'Faits et conséquences', poids: 1.5,
        attendu: CONSEQUENCES.find((c) => c.v === L.juste).lib, juste: (v) => v[L.id] === L.juste })) },
    { id: 'calculs', libelle: 'Les calculs', titre: 'Deux calculs', sousTitre: 'Les chiffres sont dans « Les chiffres ».',
      objet: 'Deux calculs', pieces: ['faits'], documents: ['faits'],
      message: 'Deux calculs rapides avec les saisonniers, s’il te plaît. Tu peux utiliser la calculatrice.',
      blocs: [
        { type: 'nombre', id: 'hors', lib: 'Combien de saisonniers en dehors des Hauts-de-France ?', unite: 'saisonniers', min: 0, entier: true, manque: 'le premier calcul' },
        { type: 'nombre', id: 'site', lib: 'En moyenne, combien de saisonniers par site ? (arrondi à l’unité)', unite: 'saisonniers', min: 0, entier: true, manque: 'le deuxième calcul' }],
      jalons: [
        { id: 'hors', titre: 'Les saisonniers hors Hauts-de-France', groupe: 'Les calculs', poids: 1.5, attendu: `${nombreFr(FAITS.saisonniers)} − ${nombreFr(FAITS.saisonniersHdf)} = ${nombreFr(HORS_HDF)}`,
          juste: (v) => proche(v.hors, HORS_HDF) },
        { id: 'site', titre: 'Les saisonniers par site', groupe: 'Les calculs', poids: 1.5, attendu: `${nombreFr(FAITS.saisonniers)} ÷ ${FAITS.sites} = ${nombreFr(PAR_SITE)}, soit 237 ou 238`,
          juste: (v) => proche(v.site, PAR_SITE, 0.51) }] },
    { id: 'change', libelle: 'Ce qui change', titre: 'Ce que les robots changent à ton poste', sousTitre: 'Coche tout ce qui est vrai.',
      objet: 'Les robots et toi', pieces: ['site'], documents: ['site'],
      message: 'Et pour toi, au poste : qu’est-ce que les robots changent ? Coche tout ce qui est vrai.',
      blocs: [{ type: 'cases', id: 'change', titre: 'Ce qui est vrai', choix: CHANGE.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'change', titre: 'Ce que les robots changent au poste', groupe: 'Ce qui change', poids: 3, attendu: CHANGE.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.change || [], CHANGE.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ce que tu retiens, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'saison', choix: ['Avant Noël, il y a beaucoup plus de commandes : Amazon recrute des saisonniers.', 'Avant Noël, il y a moins de commandes : le centre ferme.', 'Les saisonniers remplacent les robots.'], juste: 0 },
      { id: 'robots', choix: ['Les robots apportent l’armoire : je reste au poste et je n’entre jamais dans leur zone.', 'Les robots font tout : je n’ai plus de travail.', 'Je conduis les robots dans les allées.'], juste: 0 },
      { id: 'calcul', choix: [`${nombreFr(HORS_HDF)} saisonniers travaillent en dehors des Hauts-de-France.`, `${nombreFr(FAITS.saisonniers + FAITS.saisonniersHdf)} saisonniers travaillent en dehors des Hauts-de-France.`, `${nombreFr(FAITS.saisonniersHdf)} saisonniers travaillent en dehors des Hauts-de-France.`], juste: 0 },
      FIN(prenom)] },
  accueil: ['Relie chaque fait à sa conséquence.', 'Fais les deux calculs.', 'Coche ce que les robots changent.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, c’est l’évaluation : prélever et emballer, seul(e).',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
