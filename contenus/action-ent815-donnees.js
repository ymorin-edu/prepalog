// ENT-8.15 — Action, « prendre en charge une préparation » : les DONNÉES PURES de la séance (les défauts du poste tirés par élève, l'inspection,
// la mission et la commande tirées par élève — l'entrepôt de préparation partagé `contenus/action-prepa-donnees.js` —, les choix de la fiche
// « Ma mission », les phrases du message à Samia calculées sur LA MISSION). Aucun effet de bord à l'import, aucune dépendance au navigateur : le
// contenu (`contenus/action-ent815.js`), les questions (`contenus/questions/ENT-8.15.js`), le corrigé (`contenus/corriges/ENT-8.15.js`) et les
// tests l'importent. Brief : `docs/briefs/ENT-8.15-action-preparer.md`.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-prepa-donnees.js` (préparation à la voix à Ensuès, magasins Action du Sud-Est).
// CONSTRUIT (dit dans la séance, `MENTION`) : le poste et ses défauts, la mission, la commande, l'heure du camion, le quai, le circuit, Samia et
// Yanis (univers `contenus/action.js`).
//
// CE QUI EST TIRÉ (graine = l'identifiant de l'élève) :
//   - le défaut du SITE (extincteur absent ou plan de circulation absent) et celui du TRANSPALETTE n° 1 (fourche tordue, roue abîmée, câble de
//     charge débranché — l'état « batterie » du kit —, avertisseur muet : il ne se trouve qu'en essayant l'avertisseur). ÉCART AVEC LE BRIEF §4
//     (« 2 défauts tirés parmi 6 ») : un du site et un de l'engin, comme Pelleau 10.4, parce que les jalons de l'inspection se lisent par place
//     (mêmes ids pour toutes les graines). Le transpalette n° 2 est toujours en ordre (« prends le transpalette 2 ») ;
//   - la mission et ses 5 lignes (`preparation`, ordre favorable : lourds d'abord dans le circuit, aucun fragile, aucune exception).
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ces fichiers : ne rien y changer pendant qu'une classe joue la séance.

import { hasard, graineDeBase } from '../core/tirage.js';
import { preparation, PRODUITS, MAGASINS, quaiDe } from './action-prepa-donnees.js';

export const ID = 'action-preparer';
export const ID_VOLET = 'action-ent815';
export const ENTREPOT_ID = 'action-preparer';     // les gestes publiés : `entrepot:action-preparer:<geste>`
export const INSPECTION_ID = 'action-poste-815';
export const FICHE_ID = 'mission-815';
export const PHRASES_ID = 'samia-815';
export const MAIL_DOMAINE = 'geodis-ensues.example';   // celui de l'univers (`contenus/action.js`, VOCAB.mailDomain)
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
export const YANIS_MAIL = `yanis@${MAIL_DOMAINE}`;
export const SUJETS = { accueil: 'Aujourd’hui : la préparation', mission: 'Ta mission', poste: 'Ton transpalette', commande: 'Ta commande ?', fin: 'Demain' };
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;

// ─────────────────────────────────────────────────────────────── ① le poste : l'inspection tirée
export const DEFAUTS_SITE = ['extincteur', 'affichage'];
export const ENGINS = ['fourcheTordue', 'roueAbimee', 'batterie', 'avertisseur'];
export const defautSiteDe = (graine) => DEFAUTS_SITE[hasard(`${graine || ''}|${ID}|defaut-site`).entier(0, 1)];
export const defautEnginDe = (graine) => ENGINS[hasard(`${graine || ''}|${ID}|defaut-engin`).entier(0, ENGINS.length - 1)];
export const SITE = {
  extincteur: { objet: 'extincteur', etat: 'absent', lib: 'Extincteur absent au quai' },
  affichage: { objet: 'affichage', etat: 'absent', lib: 'Plan de circulation absent au quai' },
};
export const ENGIN = {
  fourcheTordue: 'Fourche tordue sur le transpalette n° 1',
  roueAbimee: 'Roue abîmée sur le transpalette n° 1',
  batterie: 'Câble de charge débranché sur le transpalette n° 1',
  avertisseur: 'Avertisseur muet sur le transpalette n° 1',
};
export const REPONSE_SAMIA = 'C’est noté, prends le transpalette 2.';
export function inspectionPour(site, engin) {
  const S = SITE[site];
  return {
    id: INSPECTION_ID, libelle: 'Prendre mon poste', qui: 'Samia',
    consigne: 'Regarde ton poste et le transpalette n° 1. Clique ce qui ne va pas, puis signale-le à Samia. Avertisseur : le bouton sous le timon.',
    vues: ['charge', 'quai'],
    points: [
      { id: 'site-defaut', objet: S.objet, etat: S.etat, ok: false, reparable: false, lib: S.lib },
      { id: 'tp1-defaut', objet: 'transpalette', n: 1, etat: engin, ok: false, reparable: false, lib: ENGIN[engin] },
      { id: 'tp2', objet: 'transpalette', n: 2, etat: 'ok', ok: true, lib: 'Transpalette n° 2 en ordre' },
    ],
    essai: { objet: 'transpalette', n: 1, resultat: engin === 'avertisseur' ? 'muet' : 'sonne' },
    arret: true,
    commencer: 'C’est bon, je prends mon poste',
    signaler: { reponse: REPONSE_SAMIA },
    bilan: 'Avant de prendre ton poste, on regarde tout : le quai et le transpalette.',
  };
}
export const inspectionDe = (graine) => inspectionPour(defautSiteDe(graine), defautEnginDe(graine));

// ─────────────────────────────────────────────────────────────── ② et ③ la mission, la commande (entrepôt de préparation partagé)
export const CONSIGNE_PLAN = 'Le terminal te dit une adresse. Tu y vas, tu lis le code sur la lisse, tu le tapes. Il te dit combien prendre.';
export const FIN_TEXTE = 'Yanis filme et étiquette ta palette.';
export const REGLES = {
  titre: 'Les règles',
  entete: 'Suivre le terminal',
  lignes: [
    'Le terminal dit une <b>adresse</b> : allée, travée, niveau 1, emplacement.',
    'Clique la travée, puis l’emplacement : le <b>code de contrôle</b> est sur l’étiquette de la lisse.',
    'Tape le code. Le terminal dit le produit et <b>combien en prendre</b>.',
    'Sélectionne les cartons, tape la quantité, puis <b>pose</b> sur la palette.',
    'Commande terminée : « Vérifier ma préparation ».',
  ],
};
const BASE = preparation({ id: ENTREPOT_ID, lignes: 5, libelle: 'Préparer ma commande', terminal: { titre: 'Préparation', finir: false, finirTexte: FIN_TEXTE },
  jalons: [{ type: 'lignes' }] });
export const jeuDe = (graine) => BASE.jeuDe(graine).jeu;
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
// La déclaration d'un élève (graine, niveau) : la commande tirée ; accompagné : « Les règles » ouvertes et la travée de la ligne en cours cernée.
export function entrepotDe(graine, { niveau = 'standard', copie = false } = {}) {
  const d = BASE(graine, { niveau, copie });
  const acc = niveau === 'accompagne';
  return Object.assign(d, {
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'lundi, 6 h', texte: CONSIGNE_PLAN },
    terminal: Object.assign({}, d.terminal, { fin: `Commande terminée. Va au ${d.commande.quai.toLowerCase()}.` }, acc ? { montrer: 'travee' } : {}),
    regles: acc ? { ...REGLES, ouvertes: true } : REGLES,
  });
}
entrepotDe.jeuDe = BASE.jeuDe;

// La mission d'un jeu, en clair (l'écran d'accueil du terminal, la fiche, la phrase du compte rendu, le corrigé).
export const magasinDe = (id) => MAGASINS.find((m) => m.id === id);
export function missionDe(jeu) {
  const m = magasinDe(jeu.magasin);
  return { num: jeu.num, magasin: m.nom, court: m.court, lignes: jeu.lignes.length, cartons: jeu.lignes.reduce((t, l) => t + l.q, 0),
    quai: jeu.quai, quaiTexte: quaiDe(jeu.quai), depart: jeu.depart };
}
export const missionDeBase = (db) => missionDe(jeuDeBase(db));
export const courtDe = (k) => PRODUITS[k].court;

// ─────────────────────────────────────────────────────────────── la fiche « Ma mission » : 4 listes, la juste d'abord (`v: 'juste'`)
const HEURES = ['7 h 00', '7 h 15', '7 h 30', '7 h 45', '8 h 00', '8 h 15', '8 h 30', '8 h 45'];
// Les pièges sont calculés sur la mission (jamais la valeur juste deux fois) ; l'ordre affiché est tiré par élève (`melangerPour`).
export function lignesFiche(M) {
  const autresMag = MAGASINS.filter((m) => m.nom !== M.magasin);
  const k = (M.cartons + M.quai) % autresMag.length;
  const autreQuai = (d) => ((M.quai - 1 + d) % 6) + 1;
  const i = HEURES.indexOf(M.depart);
  return [
    { id: 'magasin', lib: 'Pour quel magasin ?', manque: 'le magasin',
      choix: [{ v: 'juste', lib: M.magasin }, { v: 'autre1', lib: autresMag[k].nom }, { v: 'autre2', lib: autresMag[(k + 3) % autresMag.length].nom }] },
    { id: 'cartons', lib: 'Combien de cartons ?', manque: 'le nombre de cartons',
      choix: [{ v: 'juste', lib: `${M.cartons} cartons` }, { v: 'lignes', lib: `${M.lignes} cartons` }, { v: 'plus', lib: `${M.cartons + 4} cartons` }] },
    { id: 'quai', lib: 'Sur quel quai ?', manque: 'le quai',
      choix: [{ v: 'juste', lib: `Quai ${M.quai}` }, { v: 'autre1', lib: `Quai ${autreQuai(2)}` }, { v: 'autre2', lib: `Quai ${autreQuai(4)}` }] },
    { id: 'heure', lib: 'Avant quelle heure ?', manque: 'l’heure de départ',
      choix: [{ v: 'juste', lib: M.depart }, { v: 'avant', lib: HEURES[(i + 6) % HEURES.length] }, { v: 'apres', lib: HEURES[(i + 3) % HEURES.length] }] },
  ];
}
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

// ─────────────────────────────────────────────────────────────── ④ le message à Samia (phrases calculées sur LA MISSION)
export const SALUTATIONS = ['Bonjour Samia,', 'Salut ma belle,', 'Samia !'];
export const POLITESSES = ['Bonne journée !', 'Débrouille-toi.', 'C’est bon, lâche-moi.'];
export const finsDe = (prenom) => [prenom, 'Bisous'];
export const phrasePrete = (mag, quai) => `La commande de ${mag} est prête, quai ${quai}.`;
// La juste dit SA mission ; les pièges : un autre quai, un autre magasin, « pas finie ».
export function choixPrete(M) {
  const autre = MAGASINS.find((m) => m.nom !== M.magasin);
  return [phrasePrete(M.magasin, M.quai), phrasePrete(M.magasin, (M.quai % 6) + 1), phrasePrete(autre.nom, M.quai), 'Je n’ai pas fini, je ne sais pas où elle est.'];
}
export const MENTION_PREPA = 'L’entrepôt, les adresses, les commandes et les codes de contrôle sont construits pour l’exercice. Action et Geodis ne '
  + 'publient pas l’organisation de l’entrepôt d’Ensuès ni la liste des magasins qu’il livre.';
