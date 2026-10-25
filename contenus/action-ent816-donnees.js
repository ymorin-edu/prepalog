// ENT-8.16 — Action, « déstocker et signaler » : les DONNÉES PURES de la séance (la commande tirée par élève dans l'entrepôt de préparation
// partagé `contenus/action-prepa-donnees.js`, avec un carton abîmé et un emplacement vide ; ce que le système sait, CALCULÉ sur ce que l'élève a
// dit au terminal ; les choix de la fiche et du message). Aucun effet de bord à l'import, aucune dépendance au navigateur. Brief :
// `docs/briefs/ENT-8.16-action-destocker.md`.
//
// VÉRIFIÉ : voir l'en-tête de `contenus/action-prepa-donnees.js`. CONSTRUIT : la commande, l'abîmé, l'emplacement vide, la réserve, l'écran
// « Stock », Samia, Kevin et Yanis.
// ⚠ Le jeu d'un élève est une fonction de son identifiant ET de ces fichiers : ne rien y changer pendant qu'une classe joue la séance.

import { graineDeBase, hasard } from '../core/tirage.js';
import { preparation, PRODUITS, MAGASINS, quaiDe } from './action-prepa-donnees.js';

export const ID = 'action-destocker';
export const ID_VOLET = 'action-ent816';
export const ENTREPOT_ID = 'action-destocker';     // les gestes publiés : `entrepot:action-destocker:<geste>`
export const FICHE_ID = 'stock-816';
export const PHRASES_ID = 'samia-816';
export const MAIL_DOMAINE = 'geodis-ensues.example';
export const SAMIA_MAIL = `samia@${MAIL_DOMAINE}`;
export const SUJETS = { accueil: 'Une commande plus longue', stock: 'Ce que sait le système', compte: 'Rien de spécial ?', fin: 'Jeudi' };
export const GESTE = (n) => `entrepot:${ENTREPOT_ID}:${n}`;
// Vraie dès que l'une des conditions l'est ; garde les gestes cités (contrôlés au chargement).
export function unDe(...conditions) {
  const f = (db, seance) => conditions.some((c) => c(db, seance));
  f.gestes = conditions.flatMap((c) => (c && Array.isArray(c.gestes) ? c.gestes : []));
  return f;
}

// ─────────────────────────────────────────────────────────────── la commande (7 lignes, un abîmé, un emplacement vide)
export const CONSIGNE_PLAN = 'Regarde bien chaque carton avant de le prendre. Si quelque chose ne va pas, tu le dis au terminal.';
export const FIN_TEXTE = 'Yanis filme et étiquette ta palette.';
const REGLES_MOTS = (aide) => ({
  titre: 'Les mots du terminal',
  entete: 'Ce que tu peux dire au terminal',
  lignes: [
    `<b>Abîmé</b>, puis combien${aide ? ' : quand un carton est abîmé (coin enfoncé, ruban déchiré). Sélectionne-le avant.' : '.'}`,
    `<b>Manquant</b>, puis combien${aide ? ' : quand il n’y a pas assez de cartons.' : '.'}`,
    `<b>Emplacement vide</b>${aide ? ' : quand il n’y a rien. Kevin descend la réserve.' : '.'}`,
    'Le terminal ne te dit jamais quel mot choisir : c’est toi qui regardes.',
  ],
});
const BASE = preparation({ id: ENTREPOT_ID, lignes: 7, abimes: 1, vides: 1, libelle: 'Préparer ma commande',
  terminal: { titre: 'Préparation', finir: false, finirTexte: FIN_TEXTE },
  jalons: [{ type: 'lignes' }, { type: 'abime' }, { type: 'vide' }, { type: 'rienAbime' }] });
export const jeuDe = (graine) => BASE.jeuDe(graine).jeu;
export const jeuDeBase = (db) => jeuDe(graineDeBase(db || {}));
// La déclaration d'un élève : la commande tirée ; « Les mots du terminal » ouverts (guidage), repliés au confirmé ; accompagné : une ligne d'aide
// par mot et la travée de la ligne en cours cernée.
export function entrepotDe(graine, { niveau = 'standard', copie = false } = {}) {
  const d = BASE(graine, { niveau, copie });
  const acc = niveau === 'accompagne';
  return Object.assign(d, {
    personnage: { nom: 'Samia', role: 'cheffe d’équipe', date: 'mardi, 6 h', texte: CONSIGNE_PLAN },
    terminal: Object.assign({}, d.terminal, { fin: `Commande terminée. Va au ${d.commande.quai.toLowerCase()}.` }, acc ? { montrer: 'travee' } : {}),
    regles: niveau === 'confirme' ? REGLES_MOTS(false) : { ...REGLES_MOTS(acc), ouvertes: true },
  });
}
entrepotDe.jeuDe = BASE.jeuDe;

export const magasinDe = (id) => MAGASINS.find((m) => m.id === id);
export const courtDe = (k) => PRODUITS[k].court;
// Les deux lignes à anomalie d'un jeu : { id: 'L3', k (rang), a, produit, q }.
export function anomaliesDe(jeu) {
  const ligne = (a) => { const k = jeu.lignes.findIndex((l) => l.a === a); return { id: `L${k + 1}`, k, ...jeu.lignes[k] }; };
  return { abime: ligne(Object.keys(jeu.abimes)[0]), vide: ligne(jeu.vides[0]) };
}
export function missionDe(jeu) {
  const m = magasinDe(jeu.magasin);
  return { num: jeu.num, magasin: m.nom, court: m.court, lignes: jeu.lignes.length, cartons: jeu.lignes.reduce((t, l) => t + l.q, 0),
    quai: jeu.quai, quaiTexte: quaiDe(jeu.quai), depart: jeu.depart };
}

// ─────────────────────────────────────────────────────────────── ce que l'élève a DIT au terminal (lu dans la base)
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
// { abime: 'abime' | 'manquant' | 'vide' | null (le mot dit sur la ligne abîmée), vide: idem sur la ligne vide, reserve: true si Kevin a descendu }.
export function ditDe(db) {
  const A = anomaliesDe(jeuDeBase(db)), e = etatPlan(db) || {}, EX = (e.terminal && e.terminal.exceptions) || {};
  return { A, abime: EX[A.abime.id] ? EX[A.abime.id].mot : null, vide: EX[A.vide.id] ? EX[A.vide.id].mot : null,
    reserve: (e.reserves || []).some((r) => r.a === A.vide.a), fin: !!(e.terminal && e.terminal.fin) };
}

// ─────────────────────────────────────────────────────────────── la fiche « Le stock après ma préparation » (juste = SA vérité)
export function lignesFiche(D) {
  return [
    { id: 'abime', lib: `En ${D.A.abime.a}, le système sait-il qu’un carton est abîmé ?`, manque: 'le carton abîmé',
      juste: D.abime === 'abime' ? 'oui' : 'non',
      choix: [{ v: 'oui', lib: 'Oui : je l’ai dit au terminal.' }, { v: 'non', lib: 'Non : je ne l’ai pas dit.' }] },
    { id: 'vide', lib: `En ${D.A.vide.a}, que sait le système ?`, manque: 'l’emplacement vide',
      juste: D.vide === 'vide' ? 'vide' : D.vide === 'manquant' ? 'manque' : 'plein',
      choix: [{ v: 'vide', lib: 'Qu’il était vide : la réserve a été descendue.' }, { v: 'manque', lib: 'Qu’il manquait des cartons, pas qu’il était vide.' },
        { v: 'plein', lib: 'Rien : il croit qu’il reste des cartons.' }] },
    { id: 'suivant', lib: 'Si personne ne dit « Emplacement vide », le prochain préparateur…', manque: 'le prochain préparateur', juste: 'vide',
      choix: [{ v: 'vide', lib: 'trouvera l’emplacement vide, lui aussi.' }, { v: 'cartons', lib: 'trouvera des cartons.' }, { v: 'alerte', lib: 'aura une alerte sur son terminal.' }] },
  ];
}
export const melangerPour = (db, quoi, L) => { const g = graineDeBase(db); return g ? hasard(`${g}|${ID}|${quoi}`).melanger(L) : L.slice(); };

// ─────────────────────────────────────────────────────────────── le message à Samia (phrases calculées sur ce qu'il a signalé ; seule la forme compte)
export const SALUTATIONS = ['Bonjour Samia,', 'Salut ma belle,', 'Samia !'];
export const POLITESSES = ['Bonne journée !', 'Débrouille-toi.', 'C’est bon, lâche-moi.'];
export const finsDe = (prenom) => [prenom, 'Bisous'];
const AB_DIT = (a) => `Un carton était abîmé en ${a} : je l’ai signalé et laissé au picking.`;
const AB_RIEN = 'Je n’ai vu aucun carton abîmé.';
const VI_DIT = (a) => `L’emplacement ${a} était vide : Kevin a descendu la réserve.`;
const VI_MANQUE = (a) => `En ${a}, j’ai dit « Manquant » : Kevin a descendu la réserve.`;
const VI_RIEN = 'Tous les emplacements avaient des cartons.';
// La juste d'abord (ce qu'il a VRAIMENT fait), puis les autres phrases du même sujet.
export function choixAbime(D) {
  const a = D.A.abime.a, juste = D.abime === 'abime' ? AB_DIT(a) : AB_RIEN;
  return [juste, ...[AB_DIT(a), AB_RIEN, 'J’ai mis le carton abîmé au fond de la palette.'].filter((x) => x !== juste)];
}
export function choixVide(D) {
  const a = D.A.vide.a, juste = D.vide === 'vide' ? VI_DIT(a) : D.vide ? VI_MANQUE(a) : VI_RIEN;
  return [juste, ...[VI_DIT(a), VI_MANQUE(a), VI_RIEN].filter((x) => x !== juste)];
}
export const MENTION_PREPA = 'L’entrepôt, les adresses, les commandes et les codes de contrôle sont construits pour l’exercice. Action et Geodis ne '
  + 'publient pas l’organisation de l’entrepôt d’Ensuès ni la liste des magasins qu’il livre.';
