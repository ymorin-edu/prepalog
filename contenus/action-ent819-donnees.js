// ENT-8.19 — Action, évaluation « préparer une commande dans un autre site » : les DONNÉES PURES de la séance (le site tiré par élève — le MÊME
// qu'ENT-8.5, 8.6, 8.10 et 8.14 —, le défaut du poste tiré, l'entrepôt de préparation DE CE SITE et la commande tirée, la fiche « Ma mission »).
// Aucun effet de bord à l'import, aucune dépendance au navigateur. Brief : `docs/briefs/ENT-8.19-action-evaluation-preparation.md`.
//
// VÉRIFIÉ : les sites et prestataires (`contenus/action-eval-sites.js`, lu, jamais modifié) : Onnaing (GXO, qui y fait la préparation) et
// Belleville-en-Beaujolais (Kuehne+Nagel) ; les magasins Action de La Sentinelle (59) et de Villefranche-sur-Saône (69), vérifiés pour ENT-8.5.
// ÉCART AVEC LE BRIEF §0 : un seul magasin par site, celui déjà vérifié (le brief proposait Valenciennes, Maubeuge, Douai ou Villefranche, Mâcon,
// Lyon, « à vérifier ») : aucun nom de magasin non vérifié n'entre dans la séance.
// CONSTRUIT : l'entrepôt de préparation de chaque site (le plan d'E-8, un autre stock de départ), la commande, les codes, l'abîmé, l'emplacement
// vide, le défaut du poste, que CE site livre CE magasin.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ces fichiers : ne rien y changer pendant qu'une classe joue la séance.

import { hasard, graineDeBase } from '../core/tirage.js';
import { preparation, PRODUITS, quaiDe, MENTION_PREPA } from './action-prepa-donnees.js';
import { siteDeGraine, equipeDe, COLLEGUES } from './action-ent810-donnees.js';

export const ID = 'action-evaluation-preparation';
export const ID_VOLET = 'action-ent819';
export const ENTREPOT_ID = 'action-evaluation-preparation';   // les gestes publiés : `entrepot:action-evaluation-preparation:<geste>`
export const INSPECTION_ID = 'action-poste-819';
export const FICHE_ID = 'mission-819';
export const SUJETS = { accueil: 'Une journée de préparation', mission: 'Ta mission', fin: 'Ta copie' };
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
export { siteDeGraine, equipeDe, MENTION_PREPA };
export const siteEleve = (db) => siteDeGraine(graineDeBase(db || {}));

// ─────────────────────────────────────────────────────────────── ① le poste : UN défaut tiré (le quai ou le transpalette n° 1)
// Six défauts possibles, un par élève ; la place `defaut` porte toujours le défaut (mêmes ids pour toutes les graines). L'essai de
// l'avertisseur du n° 1 est toujours déclaré (même nombre d'essais pour tous) : il ne trouve un défaut que si c'est l'avertisseur.
export const DEFAUTS = ['extincteur', 'affichage', 'fourcheTordue', 'roueAbimee', 'batterie', 'avertisseur'];
export const defautDe = (graine) => DEFAUTS[hasard(`${graine || ''}|${ID}|defaut`).entier(0, DEFAUTS.length - 1)];
const POINT = {
  extincteur: { objet: 'extincteur', etat: 'absent', lib: 'Extincteur absent au quai' },
  affichage: { objet: 'affichage', etat: 'absent', lib: 'Plan de circulation absent au quai' },
  fourcheTordue: { objet: 'transpalette', n: 1, etat: 'fourcheTordue', lib: 'Fourche tordue sur le transpalette n° 1' },
  roueAbimee: { objet: 'transpalette', n: 1, etat: 'roueAbimee', lib: 'Roue abîmée sur le transpalette n° 1' },
  batterie: { objet: 'transpalette', n: 1, etat: 'batterie', lib: 'Câble de charge débranché sur le transpalette n° 1' },
  avertisseur: { objet: 'transpalette', n: 1, etat: 'avertisseur', lib: 'Avertisseur muet sur le transpalette n° 1' },
};
export function inspectionPour(defaut, tuteur) {
  return {
    id: INSPECTION_ID, libelle: 'Prendre mon poste', qui: tuteur,
    consigne: `Regarde ton poste et le transpalette n° 1. Clique ce qui ne va pas, puis signale-le à ${tuteur}. Avertisseur : le bouton sous le timon.`,
    vues: ['charge', 'quai'],
    points: [
      { id: 'defaut', ...POINT[defaut], ok: false, reparable: false },
      // Deux points en ordre, toujours deux (mêmes ids) : le transpalette n° 1 (ou l'extincteur quand le n° 1 porte le défaut) et le n° 2.
      POINT[defaut].objet === 'transpalette'
        ? { id: 'ok-a', objet: 'extincteur', etat: 'present', ok: true, lib: 'Extincteur en place au quai' }
        : { id: 'ok-a', objet: 'transpalette', n: 1, etat: 'ok', ok: true, lib: 'Transpalette n° 1 en ordre' },
      { id: 'ok-b', objet: 'transpalette', n: 2, etat: 'ok', ok: true, lib: 'Transpalette n° 2 en ordre' },
    ],
    essai: { objet: 'transpalette', n: 1, resultat: defaut === 'avertisseur' ? 'muet' : 'sonne' },
    commencer: 'C’est bon, je prends mon poste',
  };
}
export const inspectionDe = (graine) => inspectionPour(defautDe(graine), equipeDe(siteDeGraine(graine)).tuteur);

// ─────────────────────────────────────────────────────────────── ② et ③ la mission, la commande (l'entrepôt de préparation DU SITE)
// Les magasins : un par site, vérifié (voir l'en-tête). Le cariste : celui du site (Léo, Hugo).
export const MAGASINS_SITE = {
  onnaing: { id: 'la-sentinelle', nom: 'La Sentinelle', court: 'La Sentinelle' },
  belleville: { id: 'villefranche', nom: 'Villefranche-sur-Saône', court: 'Villefranche' },
};
const PROFIL = { id: ENTREPOT_ID, lignes: 7, abimes: 1, vides: 1, lourds: 2, fragiles: 2, ordre: 'piege', libelle: 'Préparer et monter ma palette',
  jalons: [{ type: 'lignes' }, { type: 'abime' }, { type: 'vide' }, { type: 'lourds' }, { type: 'fragiles' }, { type: 'poids' }, { type: 'hauteur' },
    { type: 'film' }, { type: 'etiquettes' }] };
const BASES = Object.fromEntries(Object.entries(MAGASINS_SITE).map(([cle, m]) => {
  const { cariste } = COLLEGUES[cle];
  return [cle, preparation({ ...PROFIL, site: { cle, magasins: [m] }, terminal: { titre: 'Préparation', montageSurPose: true, cariste } })];
}));
const baseDe = (graine) => BASES[siteDeGraine(graine).id] || BASES.onnaing;
export const jeuDe = (graine) => baseDe(graine).jeuDe(graine).jeu;
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
// La déclaration d'un élève : TOUJOURS en copie (évaluation) ; ni règle, ni aide ; « Valider ma préparation » fige sans rendre la copie
// (`rendCopie: false` : le bandeau « Rendre ma copie » la rend).
export function entrepotDe(graine, { copie = true } = {}) {
  const d = baseDe(graine)(graine, { niveau: 'standard', copie });
  const Q = equipeDe(siteDeGraine(graine));
  return Object.assign(d, {
    personnage: { nom: Q.tuteur, role: Q.chef, date: 'mardi, 6 h', texte: 'Suis le terminal. Ce qui ne va pas se dit au terminal. Monte, filme et étiquette ta palette.' },
    terminal: Object.assign({}, d.terminal, { fin: `Commande terminée. Va au ${d.commande.quai.toLowerCase()}.` }),
    rendCopie: false,
  });
}
// Le jeu se tire par la base du site de l'élève (les tests et le côté enseignant passent par `entrepotDe.jeuDe`).
entrepotDe.jeuDe = (graine) => baseDe(graine).jeuDe(graine);

export const courtDe = (k) => PRODUITS[k].court;
export function missionDe(graine) {
  const j = jeuDe(graine), S = siteDeGraine(graine), m = MAGASINS_SITE[S.id];
  return { num: j.num, magasin: `Action ${m.nom}`, court: m.court, lignes: j.lignes.length, cartons: j.lignes.reduce((t, l) => t + l.q, 0),
    quai: j.quai, quaiTexte: quaiDe(j.quai), depart: j.depart };
}
export const missionDeBase = (db) => missionDe(graineDeBase(db || {}));
// Les deux lignes à anomalie d'un jeu : { id, k, a, produit, q }.
export function anomaliesDe(jeu) {
  const ligne = (a) => { const k = jeu.lignes.findIndex((l) => l.a === a); return { id: `L${k + 1}`, k, ...jeu.lignes[k] }; };
  return { abime: ligne(Object.keys(jeu.abimes)[0]), vide: ligne(jeu.vides[0]) };
}

// ─────────────────────────────────────────────────────────────── la fiche « Ma mission » : 2 listes (quai, heure), la juste `v: 'juste'`
const HEURES = ['7 h 00', '7 h 15', '7 h 30', '7 h 45', '8 h 00', '8 h 15', '8 h 30', '8 h 45'];
export function lignesFiche(M) {
  const autreQuai = (d) => ((M.quai - 1 + d) % 6) + 1;
  const i = HEURES.indexOf(M.depart);
  return [
    { id: 'quai', lib: 'Sur quel quai ?', manque: 'le quai',
      choix: [{ v: 'juste', lib: `Quai ${M.quai}` }, { v: 'autre1', lib: `Quai ${autreQuai(2)}` }, { v: 'autre2', lib: `Quai ${autreQuai(4)}` }] },
    { id: 'heure', lib: 'Avant quelle heure ?', manque: 'l’heure de départ',
      choix: [{ v: 'juste', lib: M.depart }, { v: 'avant', lib: HEURES[(i + 6) % HEURES.length] }, { v: 'apres', lib: HEURES[(i + 3) % HEURES.length] }] },
  ];
}
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
