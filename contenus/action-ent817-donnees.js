// ENT-8.17 — Action, « monter et conditionner sa palette » : les DONNÉES PURES de la séance (la commande tirée par élève dans l'entrepôt de
// préparation partagé `contenus/action-prepa-donnees.js`, 6 lignes dont l'ordre du circuit casse TOUJOURS une règle de calage ; les trois
// cartons de la fiche « Lire un carton », tirés par élève). Aucun effet de bord à l'import, aucune dépendance au navigateur. Brief :
// `docs/briefs/ENT-8.17-action-conditionner.md`.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-prepa-donnees.js` (le préparateur d'Ensuès filme sa palette : offre 191TDTN). CONSTRUIT : la
// commande, les limites de poids et de hauteur, le nombre de tours de film, la place des étiquettes, les trois cartons de la fiche, Samia.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ces fichiers : ne rien y changer pendant qu'une classe joue la séance.

import { graineDeBase, hasard } from '../core/tirage.js';
import { preparation, PRODUITS, MAGASINS, quaiDe, KG_MAX, H_MAX, classeDe, MENTION_PREPA } from './action-prepa-donnees.js';

export const ID = 'action-conditionner';
export const ID_VOLET = 'action-ent817';
export const ENTREPOT_ID = 'action-conditionner';   // les gestes publiés : `entrepot:action-conditionner:<geste>`
export const FICHE_ID = 'cartons-817';
export const MAIL_DOMAINE = 'geodis-ensues.example';
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
export const SUJETS = { accueil: 'Ta palette', monter: 'À toi de monter', fin: 'Demain' };
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
export function unDe(...conditions) {
  const f = (db, seance) => conditions.some((c) => c(db, seance));
  f.gestes = conditions.flatMap((c) => (c && Array.isArray(c.gestes) ? c.gestes : []));
  return f;
}
const virg = (x) => String(x).replace('.', ',');

// ─────────────────────────────────────────────────────────────── la commande (6 lignes, 2 lourds au moins, 2 fragiles, ordre piège)
export const CONSIGNE_PLAN = 'Le terminal te donne les cartons dans l’ordre de l’allée. Toi, tu montes la palette dans le bon ordre : si un carton arrive trop tôt, pose-le à côté.';
// « Les règles » de la palette (brief §4) : ouvertes au départ (guidage), repliées au confirmé ; accompagné : une ligne d'aide de plus.
const REGLES = (aide) => ({
  titre: 'Les règles de la palette',
  entete: 'Une palette qui part au magasin',
  lignes: [
    `Les <b>lourds en bas</b>${aide ? ' : rien ne les écrase, la palette tient.' : '.'}`,
    `Les <b>fragiles en haut</b>${aide ? ' : rien ne pèse sur eux.' : '.'}`,
    `<b>${KG_MAX} kg</b> et <b>${virg(H_MAX)} m</b> au plus${aide ? ' : de près, la palette affiche son poids et sa hauteur.' : '.'}`,
    `Film : <b>3 à 5 tours</b>${aide ? ', assez pour tenir, pas plus.' : '.'}`,
    `<b>3 étiquettes</b> : deux faces opposées et le dessus${aide ? ', pour la lire de partout.' : '.'}`,
    `Un carton qui arrive trop tôt : <b>« À côté »</b>${aide ? ', tu le poses quand la commande est terminée.' : '.'}`,
  ],
});
const BASE = preparation({ id: ENTREPOT_ID, lignes: 6, lourds: 2, fragiles: 2, ordre: 'piege', libelle: 'Préparer et monter ma palette',
  terminal: { titre: 'Préparation' },
  jalons: [{ type: 'lignes' }, { type: 'lourds' }, { type: 'fragiles' }, { type: 'poids' }, { type: 'hauteur' }, { type: 'film' }, { type: 'etiquettes' }] });
export const jeuDe = (graine) => BASE.jeuDe(graine).jeu;
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
// La déclaration d'un élève : la commande tirée ; « Les règles » ouvertes (guidage), repliées au confirmé ; accompagné : une ligne d'aide par
// règle, la travée de la ligne en cours cernée et, sous « Où poses-tu ? », la classe du carton (`terminal.classe`).
export function entrepotDe(graine, { niveau = 'standard', copie = false } = {}) {
  const d = BASE(graine, { niveau, copie });
  const acc = niveau === 'accompagne';
  return Object.assign(d, {
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'jeudi, 6 h', texte: CONSIGNE_PLAN },
    terminal: Object.assign({}, d.terminal, { fin: `Commande terminée. Monte ta palette, puis va au ${d.commande.quai.toLowerCase()}.` },
      acc ? { montrer: 'travee', classe: true } : {}),
    regles: niveau === 'confirme' ? REGLES(false) : { ...REGLES(acc), ouvertes: true },
  });
}
entrepotDe.jeuDe = BASE.jeuDe;

export const magasinDe = (id) => MAGASINS.find((m) => m.id === id);
export const courtDe = (k) => PRODUITS[k].court;
export { classeDe };
export function missionDe(jeu) {
  const m = magasinDe(jeu.magasin);
  return { num: jeu.num, magasin: m.nom, court: m.court, lignes: jeu.lignes.length, cartons: jeu.lignes.reduce((t, l) => t + l.q, 0),
    quai: jeu.quai, quaiTexte: quaiDe(jeu.quai), depart: jeu.depart };
}

// ─────────────────────────────────────────────────────────────── la fiche « Lire un carton » (trois cartons tirés par élève)
// Trois cartons numérotés : un fragile (le verre), un « haut » (deux flèches), un lourd (plus de 10 kg, le poids écrit) ; leur ordre et leurs
// poids sont tirés. Chaque carton porte son poids : c'est en le lisant qu'on reconnaît le lourd.
export const SORTES = ['fragile', 'debout', 'lourd'];
export const LIB_SORTE = { fragile: 'est fragile', debout: 'doit rester debout', lourd: 'est lourd' };
const KG = { fragile: [3, 4, 5, 6], debout: [5, 6, 7, 8], lourd: [14, 16, 18, 20, 22] };
export function cartonsDe(graine) {
  const h = hasard(`${graine || ''}|${ID}|cartons`);
  return h.melanger(SORTES).map((sorte, i) => ({ n: i + 1, sorte, kg: h.choisir(KG[sorte]) }));
}
export const cartonsDeBase = (db) => cartonsDe(graineDeBase(db || {}));
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };
export { MENTION_PREPA };
