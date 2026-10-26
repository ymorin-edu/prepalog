// ENT-12.7 — IKEA, « évaluation : la livraison de ta cliente » : les DONNÉES PURES (brief `docs/briefs/ENT-12.7-ikea-evaluation-transport.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent127.js`), les questions, le corrigé et les tests. Univers : `contenus/ikea.js`. Aucun effet de bord.
//
// UN JEU PAR ÉLÈVE (règle du 03/10/2026) : la graine (l'identifiant de l'élève) tire trois choses, indépendantes, une fois pour toutes :
//   - la CLIENTE (4 profils, tous à trois articles) : l'accès à son logement, sa disponibilité, la question piège de l'appel, le mode juste de chaque article et le prix ;
//   - l'IMPRÉVU de la journée (3 récits de MÊME effet : la péniche ne part pas) ;
//   - le DÉCALAGE de la journée (0 h, 1 h ou 2 h) : les dix commandes de la journée gardent leur structure (durées, poids, longueurs de créneau), leurs créneaux glissent.
// ÉCART AU BRIEF (dit à Tristan) : le brief prévoyait un imprévu de nature différente (camion en panne, chauffeur absent) et une banque de 16 commandes. Ici l'imprévu change de RÉCIT, pas de
// mécanique, et la journée est celle d'ENT-12.3 décalée : l'équité (huit commandes tenables, deux impossibles, un seul ensemble) se prouve par le calcul, pour chacun des trois décalages.
//
// CONSTRUIT (dit à l'écran) : les quatre clientes, leurs commandes, leurs poids et leurs prix, les créneaux, la journée, les récits d'imprévu. RÉEL : les modes de livraison et leurs prix
// (page « Livraison » d'IKEA France, 26/10/2026), les conditions de vente (10/08/2026), la livraison par la Seine.

import { tirerJeu, graineDeBase } from '../core/tirage.js';
import { prixMode } from './ikea.js';
import { COMMANDES, IMPOSSIBLES, slotDe, heureDe, hlib, nonTenues, toutesPosees, dansCreneau, maxTenues, CAMIONS, CAMIONS_IDS } from './ikea-ent123-donnees.js';

export { lireNombre } from './ikea.js';
export { IMPOSSIBLES, CAMIONS, CAMIONS_IDS, nonTenues, toutesPosees, dansCreneau, maxTenues, hlib };

export const ID = 'ikea-evaluation-transport';
export const ID_VOLET = 'ik-ent127';
export const DIALOGUE_ID = 'ik-appel-127';
export const FICHE_MODE = 'mode-livraison-127';
export const FICHE_PREVENIR = 'prevenir-127';
export const PL = 'ik-planning-127';
export const JOUR_APPEL = { iso: '2027-03-09', lib: 'mardi 9 mars 2027' };
export const JOUR = { iso: '2027-03-11', lib: 'jeudi 11 mars 2027', lendemain: 'vendredi 12 mars 2027' };

// ─────────────────────────────────────────────────────────────── les quatre clientes (construites)
export const RAISONS = [
  { v: 'leger', lib: 'Article léger (moins de 19 kg), que le client veut retirer près de chez lui' },
  { v: 'porter', lib: 'Le client peut porter l’article lui-même, et « devant chez vous » est possible pour sa commande' },
  { v: 'monter', lib: 'Le client ne peut pas porter l’article seul jusqu’à son logement' },
  { v: 'plafond', lib: '« Devant chez vous » n’est pas possible : la commande dépasse 1 000 €' },
  { v: 'prix', lib: 'C’est le mode le moins cher' },
];
// Une réplique pour chaque cliente : ce qu'elle dit de son logement (acces), de ses préférences (prefs), de ses jours (dispo), puis la question piège (promesse).
export const CLIENTES = [
  { id: 'lemaire', civ: 'Mme', nom: 'Lemaire', prenom: 'Hélène', ville: 'Paris 15e', membre: false, logement: '3e étage, avec ascenseur', dispo: 'aprem',
    acces: 'Je suis au 3e étage, avec un ascenseur : il est petit, mais mon mari et moi montons les colis nous-mêmes sans problème.',
    prefs: 'La lampe, je passerai la chercher au Point Relais en bas de chez moi.',
    dispoDit: 'Pour le jour : plutôt l’après-midi, le matin je travaille.',
    promesse: { id: 'heure', dit: 'Dernière chose : le livreur peut arriver à 14 h pile ? J’ai un rendez-vous juste après.',
      juste: 'Je ne peux pas vous garantir une heure précise : je vous garantis le créneau choisi, de 14 h à 18 h.',
      fausses: ['Oui, 14 h pile, je le note.', 'Le livreur fera ce qu’il peut, on ne sait jamais.'] },
    articles: [
      { id: 'lampe', lib: 'Lampe de bureau', colis: [1.5], prix: 25, mode: 'relais', raison: 'leger' },
      { id: 'biblio', lib: 'Bibliothèque', colis: [28, 26], prix: 199, mode: 'devant', raison: 'porter' },
      { id: 'commode', lib: 'Commode', colis: [34], prix: 149, mode: 'devant', raison: 'porter' },
    ] },
  { id: 'petit', civ: 'M.', nom: 'Petit', prenom: 'Jean', ville: 'Colombes', membre: true, logement: 'maison de plain-pied', dispo: 'matin',
    acces: 'J’habite une maison de plain-pied, sans marche, mais je suis seul et opéré du dos : je ne peux rien porter.',
    prefs: 'Je n’ai pas de voiture : je ne peux pas aller chercher quoi que ce soit, ni au Point Relais, ni ailleurs.',
    dispoDit: 'Pour le jour : plutôt le matin, l’après-midi j’ai mes soins.',
    promesse: { id: 'absence', dit: 'Et si jamais je suis absent le jour de la livraison, il se passe quoi ?',
      juste: 'Prévenez-nous au plus tard 72 heures avant la livraison : nous la reprogrammerons.',
      fausses: ['Ne vous inquiétez pas, le livreur laissera les colis chez un voisin.', 'Le livreur repassera de lui-même le lendemain.'] },
    articles: [
      { id: 'miroir', lib: 'Miroir', colis: [5], prix: 39, mode: 'piece', raison: 'monter' },
      { id: 'etagere', lib: 'Étagère', colis: [27, 22], prix: 179, mode: 'piece', raison: 'monter' },
      { id: 'lit', lib: 'Lit', colis: [35, 33, 18], prix: 329, mode: 'piece', raison: 'monter' },
    ] },
  { id: 'rey', civ: 'Mme', nom: 'Rey', prenom: 'Sabrina', ville: 'Paris 18e', membre: false, logement: '5e étage, sans ascenseur', dispo: 'matin',
    acces: 'Je suis au 5e étage, sans ascenseur, avec un escalier étroit : seule, je ne monterai jamais les colis.',
    prefs: 'La lampe, je la prendrai moi-même au Point Relais, il y a en a un au coin de ma rue.',
    dispoDit: 'Pour le jour : le matin, de préférence.',
    promesse: { id: 'fenetre', dit: 'Mon canapé ne passera sans doute pas dans mon escalier. Vous le monterez par la fenêtre, non ?',
      juste: 'IKEA n’assure pas la livraison par la fenêtre : si l’article ne peut pas entrer, il faudra le faire reprendre, à vos frais.',
      fausses: ['Oui, bien sûr, le livreur passera par la fenêtre.', 'Ne vous inquiétez pas, un canapé passe toujours.'] },
    articles: [
      { id: 'lampe', lib: 'Lampe', colis: [1.8], prix: 29, mode: 'relais', raison: 'leger' },
      { id: 'armoire', lib: 'Armoire', colis: [40, 38, 36], prix: 249, mode: 'piece', raison: 'monter' },
      { id: 'canape', lib: 'Canapé', colis: [42, 31], prix: 349, mode: 'piece', raison: 'monter' },
    ] },
  { id: 'garnier', civ: 'M.', nom: 'Garnier', prenom: 'Paul', ville: 'Paris 12e', membre: true, logement: '2e étage, avec ascenseur', dispo: 'aprem',
    acces: 'Je suis au 2e étage, avec un ascenseur ; nous sommes trois à la maison, nous pouvons porter les colis sans souci.',
    prefs: 'La lampe, je la prendrai au Point Relais près de mon travail. Et pour le reste, je veux le mode le moins cher, c’est tout.',
    dispoDit: 'Pour le jour : l’après-midi, plutôt.',
    promesse: { id: 'reprise', dit: 'J’ai un vieux lit dont je voudrais me débarrasser : vous le reprenez en même temps que l’armoire et le canapé ?',
      juste: 'La reprise vise un meuble de même nature que celui que vous achetez : un vieux lit avec une armoire et un canapé, ce ne sera pas possible.',
      fausses: ['Oui, nous reprenons tous les anciens meubles.', 'Oui, si vous payez la reprise.'] },
    articles: [
      { id: 'lampe', lib: 'Lampe', colis: [2.1], prix: 35, mode: 'relais', raison: 'leger' },
      { id: 'armoire', lib: 'Armoire', colis: [45, 40, 38], prix: 549, mode: 'piece', raison: 'plafond' },
      { id: 'canape', lib: 'Canapé', colis: [44, 33], prix: 599, mode: 'piece', raison: 'plafond' },
    ] },
];

// ─────────────────────────────────────────────────────────────── les trois imprévus (même effet : la péniche ne part pas)
export const IMPREVUS = [
  { id: 'crue', titre: 'La Seine est en crue : il faut tout replanifier', court: 'la Seine est en crue',
    texte: 'La Seine est à <b>4,45 m</b> à l’échelle du pont d’Austerlitz : la péniche ne part pas (la navigation est interdite à 4,30 m).',
    mail: 'la Seine est à 4,45 m à l’échelle d’Austerlitz : la péniche ne part pas.', doc: 'Ce matin, la Seine est à 4,45 m (construit) ; la navigation est interdite à 4,30 m (règle réelle, HAROPA).' },
  { id: 'avarie', titre: 'La péniche est en avarie : il faut tout replanifier', court: 'la péniche est en avarie',
    texte: 'La péniche a une <b>avarie de moteur</b> : elle ne part pas, et ne repartira pas avant demain.',
    mail: 'la péniche a une avarie de moteur : elle ne part pas aujourd’hui.', doc: 'Avarie de moteur : événement construit pour l’exercice.' },
  { id: 'ecluse', titre: 'L’écluse est fermée : il faut tout replanifier', court: 'l’écluse est fermée',
    texte: 'Une <b>écluse est fermée</b> sur le parcours de la péniche : elle ne part pas aujourd’hui.',
    mail: 'une écluse est fermée sur le parcours de la péniche : elle ne part pas aujourd’hui.', doc: 'Fermeture d’écluse : événement construit pour l’exercice.' },
];
export const DECALAGES = [0, 4, 8];   // en créneaux de 15 minutes : 0 h, 1 h, 2 h

// ─────────────────────────────────────────────────────────────── le tirage (fonction pure de la graine)
const tirer = (h) => ({ cliente: h.entier(0, CLIENTES.length - 1), imprevu: h.entier(0, IMPREVUS.length - 1), decalage: h.choisir(DECALAGES) });
const ecarts = (j) => {
  const E = [];
  if (!(Number.isInteger(j.cliente) && j.cliente >= 0 && j.cliente < CLIENTES.length)) E.push('cliente hors bornes');
  if (!(Number.isInteger(j.imprevu) && j.imprevu >= 0 && j.imprevu < IMPREVUS.length)) E.push('imprévu hors bornes');
  if (!DECALAGES.includes(j.decalage)) E.push('décalage hors bornes');
  return E;
};
const SECOURS = { cliente: 0, imprevu: 0, decalage: 0 };
const JEUX = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (JEUX.has(g)) return JEUX.get(g);
  const r = tirerJeu({ tirer, verifier: ecarts, secours: SECOURS, essais: 40 }, g);
  const jeu = { ...r.jeu, graine: g, secours: r.secours };
  JEUX.set(g, jeu);
  return jeu;
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));
export { graineDeBase };

// ─────────────────────────────────────────────────────────────── ce que dit le jeu
export const clienteDe = (jeu) => CLIENTES[jeu.cliente];
export const imprevuDe = (jeu) => IMPREVUS[jeu.imprevu];
const cmd = (c, dec) => ({ ...c, des: heureDe(slotDe(c.des) + dec), avant: heureDe(slotDe(c.avant) + dec) });
export const commandesDe = (jeu) => COMMANDES.map((c) => cmd(c, jeu.decalage));
export const creneauLib = (c) => `de ${hlib(c.des)} à ${hlib(c.avant)}`;
export const kg = (c) => c.colis.reduce((s, x) => s + x, 0);
export const lireKg = (x) => String(x).replace('.', ',');

// Le prix JUSTE de la livraison : le Point Relais se paie une fois ; les articles livrés par un même mode se tarifent sur leur montant ensemble.
export function prixJuste(cl) {
  let total = 0;
  if (cl.articles.some((a) => a.mode === 'relais')) total += prixMode('relais', 0, cl.membre);
  ['devant', 'piece'].forEach((m) => {
    const L = cl.articles.filter((a) => a.mode === m);
    if (L.length) total += prixMode(m, L.reduce((s, a) => s + a.prix, 0), cl.membre);
  });
  return total;
}
export const montantCommande = (cl) => cl.articles.reduce((s, a) => s + a.prix, 0);
export const CHAMP = (art, quoi) => `${quoi}_${art}`;

// Les contrôles d'équité : le même nombre d'articles, une réponse juste unique et décidable pour chacun, un prix entier.
export function ecartsClientes() {
  const E = [];
  CLIENTES.forEach((cl) => {
    if (cl.articles.length !== 3) E.push(`${cl.id} : ${cl.articles.length} articles`);
    cl.articles.forEach((a) => {
      if (a.mode === 'devant' && montantCommande(cl) >= 1000) E.push(`${cl.id}/${a.id} : « devant chez vous » impossible au-delà de 1 000 €`);
      if (a.mode === 'relais' && (a.colis.some((k) => k >= 19) || kg(a) >= 20)) E.push(`${cl.id}/${a.id} : trop lourd pour le Point Relais`);
    });
    if (!Number.isInteger(prixJuste(cl)) || !(prixJuste(cl) > 0)) E.push(`${cl.id} : prix ${prixJuste(cl)}`);
  });
  return E;
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
export const planningEnvoye = (db, v = 2) => (db && db.plannings && db.plannings[PL] && db.plannings[PL][`v${v}`]) || null;
// Les commandes non tenues du planning ENVOYÉ de l'élève (jamais « les deux de la correction » : c'est SON planning qui décide).
export const nonTenuesDeLEleve = (db) => { const v = planningEnvoye(db, 2); return v ? nonTenues(v.place, commandesDe(jeuDeBase(db))) : null; };
