// ENT-8.18 — Action, « deux magasins, deux palettes » : les DONNÉES PURES de la séance (deux commandes tirées par élève dans l'entrepôt de
// préparation partagé `contenus/action-prepa-donnees.js` : Nîmes et un autre magasin, 8 lignes mélangées, un produit commun sur deux lignes
// consécutives, un carton abîmé ; le conseil de Yanis et les phrases de la réponse). Aucun effet de bord à l'import, aucune dépendance au
// navigateur. Brief : `docs/briefs/ENT-8.18-action-deux-magasins.md`.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-prepa-donnees.js`. CONSTRUIT : préparer deux magasins à la fois (méthode courante en entrepôt,
// non vérifiée à Ensuès), la liste de colisage, les commandes, Samia et Yanis.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ces fichiers : ne rien y changer pendant qu'une classe joue la séance.

import { graineDeBase } from '../core/tirage.js';
import { preparation, PRODUITS, MAGASINS, quaiDe, KG_MAX, H_MAX, classeDe, MENTION_PREPA } from './action-prepa-donnees.js';

export const ID = 'action-deux-magasins';
export const ID_VOLET = 'action-ent818';
export const ENTREPOT_ID = 'action-deux-magasins';   // les gestes publiés : `entrepot:action-deux-magasins:<geste>`
export const PHRASES_ID = 'yanis-818';
export const MAIL_DOMAINE = 'geodis-ensues.example';
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
export const YANIS_MAIL = `yanis@${MAIL_DOMAINE}`;
export const SUJETS = { accueil: 'Deux magasins', yanis: 'On est en retard', controle: 'Avant de filmer', fin: 'Lundi' };
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
export function unDe(...conditions) {
  const f = (db, seance) => conditions.some((c) => c(db, seance));
  f.gestes = conditions.flatMap((c) => (c && Array.isArray(c.gestes) ? c.gestes : []));
  return f;
}
const virg = (x) => String(x).replace('.', ',');

// ─────────────────────────────────────────────────────────────── les deux commandes (8 lignes mélangées, Nîmes toujours l'un des deux)
export const CONSIGNE_PLAN = 'Deux magasins dans la même tournée de l’allée, deux palettes. Le terminal te dit chaque fois pour qui.';
// « Les règles » : fermées au départ (entraînement), ouvertes pour l'accompagné, avec une ligne d'aide.
const REGLES = (aide) => ({
  titre: 'Les règles de la palette',
  entete: 'Deux palettes qui partent au magasin',
  lignes: [
    `<b>Une palette par magasin</b>${aide ? ' : le terminal dit pour qui, à chaque ligne.' : '.'}`,
    `Avant de filmer, <b>compare chaque palette à sa liste de colisage</b>${aide ? ' : « Contrôler mes palettes ».' : '.'}`,
    'Les <b>lourds en bas</b>, les <b>fragiles en haut</b>.',
    `<b>${KG_MAX} kg</b> et <b>${virg(H_MAX)} m</b> au plus, par palette.`,
    'Film : <b>3 à 5 tours</b>. <b>3 étiquettes</b> du BON magasin : deux faces opposées et le dessus.',
    `Un carton abîmé : <b>« Abîmé »</b>, puis combien${aide ? ' ; tu reprends un bon carton sur la même pile.' : '.'}`,
  ],
});
const BASE = preparation({ id: ENTREPOT_ID, lignes: 8, magasins: 2, abimes: 1, lourds: 2, fragiles: 2, libelle: 'Préparer mes deux commandes',
  terminal: { titre: 'Préparation' },
  jalons: [{ type: 'lignes' }, { type: 'abime' }, { type: 'rienAbime' }, { type: 'grouper' }, { type: 'lourds' }, { type: 'fragiles' },
    { type: 'poids' }, { type: 'hauteur' }, { type: 'film' }, { type: 'etiquettes' }] });
export const jeuDe = (graine) => BASE.jeuDe(graine).jeu;
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
// La déclaration d'un élève : les deux commandes tirées ; « Les règles » fermées (entraînement) ; accompagné : règles ouvertes avec une aide,
// la travée de la ligne en cours cernée et, au contrôle, la liste de colisage qui se coche d'elle-même (`cocher`).
export function entrepotDe(graine, { niveau = 'standard', copie = false } = {}) {
  const d = BASE(graine, { niveau, copie });
  const acc = niveau === 'accompagne';
  return Object.assign(d, {
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'vendredi, 6 h', texte: CONSIGNE_PLAN },
    terminal: Object.assign({}, d.terminal, { fin: `Commandes terminées. Contrôle tes palettes, puis va au ${d.commande.quai.toLowerCase()}.` },
      acc ? { montrer: 'travee', cocher: true } : {}),
    regles: acc ? { ...REGLES(true), ouvertes: true } : REGLES(false),
  });
}
entrepotDe.jeuDe = BASE.jeuDe;

export const magasinDe = (id) => MAGASINS.find((m) => m.id === id);
export const courtDe = (k) => PRODUITS[k].court;
export { classeDe, MENTION_PREPA };
// Les deux magasins d'un jeu, dans l'ordre des palettes : [{ p, nom, court, num }].
export const magasinsDe = (jeu) => jeu.magasins.map((id, p) => ({ p, nom: magasinDe(id).nom, court: magasinDe(id).court, num: jeu.nums[p] }));
export const autreDe = (jeu) => magasinsDe(jeu).find((m) => m.court !== 'Nîmes');
// La ligne abîmée : { id: 'L3', k, a, produit, q, pour }.
export function abimeDe(jeu) {
  const a = Object.keys(jeu.abimes)[0], k = jeu.lignes.findIndex((l) => l.a === a);
  return { id: `L${k + 1}`, k, ...jeu.lignes[k] };
}
export function missionDe(jeu) {
  return { magasins: magasinsDe(jeu), lignes: jeu.lignes.length, quai: jeu.quai, quaiTexte: quaiDe(jeu.quai), depart: jeu.depart };
}

// ─────────────────────────────────────────────────────────────── la réponse à Yanis (la ligne du fond dit la règle, non calculée)
export const SALUTATIONS = ['Salut Yanis,', 'Monsieur Yanis,', 'Yanis !'];
export const FONDS = ['Je fais une palette par magasin, sinon on se trompe au quai.', 'OK, je mets tout ensemble.', 'Fais-le toi-même.'];
export const POLITESSES = ['Bon courage !', 'Débrouille-toi.', 'Lâche-moi.'];
export const finsDe = (prenom) => [prenom, 'Cordialement'];
