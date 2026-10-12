// ENT-6.8 — France Boissons, « chauffeurs et camions du vendredi » : les données de la séance (brief
// `docs/briefs/ENT-6.8-france-boissons-planning.md`, règles de `docs/briefs/FRANCE-BOISSONS-refonte.md` §0, calage
// `docs/briefs/france-boissons/calage-6.8.py`). Univers commun : `contenus/france-boissons.js`. Activité :
// `activites/france-boissons-planning.js`. Questions : `contenus/questions/ENT-6.8.js`. Corrigé : `contenus/corriges/ENT-6.8.js`.
//
// L'élève, en renfort à l'exploitation (vendredi 18 juin 2027, 5 h, avant le week-end de la Fête de la musique) :
//   1. affecte un chauffeur et un camion aux 5 tournées que Karim lui confie (vue Planning, sans « Vérifier ») et envoie ;
//   2. l'imprévu de 5 h 30 : T2 en panne, E2 chargé à 40 % ; un porteur de location dès 09:00, ou un transporteur dès 07:00
//      (ligne qui vient avec son camion, `porteAffectation`, chantier D-8) ; il reprend le planning et le renvoie ;
//   3. il confirme par écrit la location au loueur (phrases à choisir, au VOUS, NON noté : décision de Tristan du 12/10/2026),
//      dont une ligne « le véhicule demandé » (réflexion de Karim au choix de cette ligne) ;
//   4. il remplit la fiche « Documents à bord » (compte propre / compte d'autrui) ; Karim lance la tournée de la côte (ENT-6.9).
//
// La tournée de la côte ne se pose que sur la ligne de Lucas (option A, décision de Tristan du 06/10/2026, rappelée le 12/10) :
// ENT-6.9 se joue pendant que Lucas roule. Le calage (énumération sur les règles) donne alors 16 organisations justes avant
// l'imprévu, 12 après, et aucune organisation du 1er envoi qui reste juste après l'imprévu (toutes utilisent T2).
//
// Vérifié (brief §2) : camions électriques de France Boissons, porteurs 16 t loués, ≈ 200 km par charge ; permis C pour un
// porteur de 16 t, permis B jusqu'à 3,5 t ; règlement (CE) n° 561/2006 (relu le 12/10/2026 à l'Office des publications de l'UE) ;
// arrêté du 9 novembre 1999, documents à bord (relu le 12/10/2026 sur Légifrance) ; Code du travail L1132-1 (idem).
// Construit : les 5 tournées, leurs fenêtres, km et durées, les 5 camions, les fins de service d'hier, la panne, la borne, les
// règles internes (« Versailles en électrique », « une tournée par chauffeur et par camion », « les vides restent chez nous »),
// le loueur « Locaporteur », le transporteur « Transports Ancelin » et l'organisateur « Rouen en fête » (FICTIFS : aucune
// entreprise active de ce nom trouvée le 12/10/2026), tous les messages.

import { apresFiche, apresPlanning } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { etapesPlanning } from '../core/types/planning.js';
import { QUESTIONS } from './questions/ENT-6.8.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, DOC_ORGANIGRAMME, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';

export const ID = 'france-boissons-planning';
export const PL = 'fb-chauffeurs';
export const MSG = 'confirmation-loueur';
export const FICHE_ID = 'documents';
export const BLOC = 'bord';

// Vendredi 18 juin 2027, 5 h (les tournées partent dès 06:00 : décision de Tristan du 06/10/2026).
export const SCENARIO = { date: '2027-06-18' };

export const LOUEUR = { nom: 'Locaporteur (fictif)', court: 'Locaporteur', mail: 'reservation@locaporteur.example' };
export const TRANSPORTEUR = { nom: 'Transports Ancelin (fictif)', court: 'Transports Ancelin' };
export const ORGANISATEUR = 'Rouen en fête (fictif)';

// La fiche envoyée, lue comme `ficheEnvoyee` (core/types/fiche.js) sans importer ce module (il tire `core/ui.js`, et le corrigé
// lit ce fichier hors de l'écran).
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
const fmtH = (m) => `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, '0')}` : ''}`;

// ─────────────────────────────────────────────────────────────── les chauffeurs, les camions, les tournées (construits)

// 5 des 7 chauffeurs d'ENT-6.3 (Yoann et Kevin ne sont pas de service). « Connaît la côte » : une information, pas une règle.
export const CHAUFFEURS = [
  { id: 'lucas', nom: 'Lucas', permis: 'C', finHier: '17:00', cote: true },
  { id: 'amandine', nom: 'Amandine', permis: 'C', finHier: '19:30', cote: true },
  { id: 'julien', nom: 'Julien', permis: 'B', cote: true },
  { id: 'sebastien', nom: 'Sébastien', permis: 'C', finHier: '22:00' },
  { id: 'fatou', nom: 'Fatou', permis: 'C' },
].map((c) => ({ ...c, note: `permis ${c.permis} · ${c.finHier ? `fin de service hier ${c.finHier}` : 'en repos hier'}` }));

export const CAMIONS = [
  { id: 'E1', nom: 'E1', genre: 'porteur', electrique: true, autonomie: 200, permis: 'C', note: 'porteur électrique 16 t · ≈ 200 km' },
  { id: 'E2', nom: 'E2', genre: 'porteur', electrique: true, autonomie: 200, permis: 'C', note: 'porteur électrique 16 t · ≈ 200 km' },
  { id: 'T1', nom: 'T1', genre: 'porteur', electrique: false, permis: 'C', note: 'porteur thermique (gazole) 16 t' },
  { id: 'T2', nom: 'T2', genre: 'porteur', electrique: false, permis: 'C', note: 'porteur thermique (gazole) 16 t' },
  { id: 'VL', nom: 'VL', genre: 'vl', electrique: false, permis: 'B', note: 'fourgon 3,5 t · permis B' },
];
// L'imprévu : T2 en panne toute la journée ; E2 chargé à 40 % ; un porteur de location dès 09:00 ; le transporteur dès 07:00.
export const LOCATION = { id: 'LOC', nom: 'Porteur de location', genre: 'porteur', electrique: false, permis: 'C', dispo: '09:00',
  note: `porteur thermique 16 t, ${LOUEUR.court} · dès 09:00` };
export const LIGNE_TRANSPORTEUR = { id: 'tr', nom: TRANSPORTEUR.nom, dispo: '07:00', porteAffectation: true,
  note: 'son chauffeur et son camion · dès 07:00' };

// Les tournées : `service` = la durée du bloc ; `conduite` = ce que jugent 4 h 30 et 9 h (D-8) ; `camion` = le type exigé.
// Rouen : `avant: '13:00'` = 08:30 (départ au plus tard) + 4 h 30 ; la carte n'affiche JAMAIS 13:00 ni 08:30.
export const TOURNEES = [
  { id: 'cote', titre: 'Côte normande — Honfleur → Houlgate', court: 'Côte', des: '06:00', avant: '15:30', service: 510, conduite: 270,
    km: 320, vides: true, camion: 'porteur', fenetre: 'Départ dès 06:00 · retour à Buchelay avant 15:30',
    extra: 'Tournée de Lucas (dont La Cabane à Malo)' },
  { id: 'rouen', titre: `Rouen — fûts du concert de ${ORGANISATEUR}`, court: 'Rouen', des: '06:00', avant: '13:00', service: 270, conduite: 165,
    km: 210, vides: false, camion: 'porteur', fenetre: 'Fûts prêts dès 06:00 · livrés avant 11:00, 2 h 30 après le départ',
    extra: 'Pas de vides ce matin : ils seront repris mardi 22 juin' },
  { id: 'versailles', titre: 'Versailles — cafés, hôtels, restaurants', court: 'Versailles', des: '06:30', service: 420, conduite: 150,
    km: 110, vides: true, camion: 'electrique', fenetre: 'Départ dès 06:30', extra: 'Se livre en électrique (règle de la plateforme)' },
  { id: 'mantes', titre: 'Mantes – Vernon', court: 'Mantes', des: '06:00', avant: '16:00', service: 360, conduite: 120,
    km: 90, vides: true, camion: 'porteur', fenetre: 'Départ dès 06:00 · retour à Buchelay avant 16:00' },
  { id: 'evreux', titre: 'Évreux — petits volumes', court: 'Évreux', des: '06:00', service: 300, conduite: 135,
    km: 120, vides: true, camion: 'vl', fenetre: 'Départ dès 06:00', extra: 'Fourgon ou porteur' },
];
const TOUR = Object.fromEntries(TOURNEES.map((t) => [t.id, t]));
const CAMION_EXIGE = { porteur: 'porteur 16 t', electrique: 'porteur électrique', vl: 'fourgon ou porteur' };

// ─────────────────────────────────────────────────────────────── le planning

const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '').replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1');
export const ALEA_TEXTE = 'Deux mauvaises nouvelles. <b>T2 est en panne</b> : il ne roulera pas aujourd’hui. Et la <b>borne n° 2</b> a lâché '
  + 'cette nuit : <b>E2 n’est chargé qu’à 40 %, environ 80 km</b>. J’ai deux solutions : un <b>porteur de location sans chauffeur</b> '
  + `(${LOUEUR.nom}), disponible à <b>09:00</b> ; ou un <b>transporteur</b> (${TRANSPORTEUR.nom}) qui vient avec son chauffeur et son camion, `
  + 'dès <b>07:00</b>. Une règle : <b>une tournée avec des vides à reprendre reste chez nous</b>. Reprends le planning, puis renvoie-le.';

const lignesDe = (I, id) => I.filter((i) => i.r === id && !i.c.pause);
export const PLANNING = {
  id: PL,
  libelle: 'Planning des chauffeurs',
  titre: 'Exploitation — plateforme France Boissons de Buchelay',
  date: 'Vendredi 18 juin, avant le week-end de la Fête de la musique : 5 des 30 tournées du jour',
  infos: (o) => [
    'Un chauffeur et un camion pour chaque tournée ; un chauffeur et un camion font <b>une seule tournée</b> dans la journée',
    'Porteur 16 t : permis C · fourgon : permis B (ou C)',
    'Un électrique ne fait pas plus de km que son autonomie · Versailles se livre en électrique',
    '11 h de repos depuis la fin de service d’hier · 4 h 30 de conduite au plus sans pause · 9 h de conduite au plus dans la journée',
    ...(o.phase >= 2 ? ['Une tournée avec des vides à reprendre reste chez nous (jamais au transporteur)'] : []),
    ...o.ressources.map((k) => `<b>${k.nom}</b> : ${k.panne ? '<b>en panne aujourd’hui</b>' : k.note}`),
  ],
  echelle: { type: 'heures', debut: '05:00', fin: '19:00', pas: 15 },
  lignes: { titre: 'Planning des chauffeurs — vendredi 18 juin', liste: CHAUFFEURS },
  affectation: {
    question: 'Quel camion pour {carte} ?', manque: 'camion ?', lien: 'le camion', porte: 'son camion',
    liste: CAMIONS,
    nonAffectees: (L) => `Tournées sans camion : ${L.map((c) => c.court).join(', ')}.`,
    lecture: { titre: 'Utilisation des camions', bloc: (c, l) => `${c.court} ${l.nom}`,
      legende: 'Ce planning se remplit tout seul quand tu choisis un camion. Hachures : camion indisponible.' },
  },
  cartes: {
    titre: 'Les 5 tournées de Karim',
    liste: TOURNEES.map((t) => ({ ...t, famille: t.camion === 'vl' ? 'petits' : 'porteur' })),
    duree: (c) => c.service,
    // Option A (06/10/2026) : la côte va sur la ligne de Lucas, où qu'on la lâche.
    ligne: (c) => (c.id === 'cote' ? 'lucas' : null),
    details: (c) => [
      `Service <b>${fmtH(c.service)}</b>, dont <b>${fmtH(c.conduite)}</b> de conduite · ${c.km} km`,
      c.fenetre,
      `Camion : ${CAMION_EXIGE[c.camion]} · ${c.vides ? 'vides à reprendre' : 'pas de vides'}`,
      ...(c.extra ? [c.extra] : []),
    ],
    nonPosees: (L) => `Tournées pas encore posées : ${L.map((c) => c.court).join(', ')}.`,
    legende: 'Glisse une tournée sur la ligne d’un chauffeur, à l’heure du départ : une bulle s’ouvre pour choisir son camion. '
      + 'Ou clique la tournée, puis la case. Sur le planning, clique une tournée pour rouvrir sa bulle ; pour la déplacer, glisse-la ou choisis « Déplacer ». '
      + 'Clavier : Entrée pour prendre une tournée (ou ouvrir la bulle sur le planning), Espace pour déplacer un bloc, flèches, Suppr pour retirer, Échap pour fermer.',
  },
  familles: { porteur: { couleur: '#f0be00', nom: 'jaune', legende: 'porteur' }, petits: { couleur: '#8b5cf6', nom: 'violet', legende: 'fourgon ou porteur' } },
  regles: [
    { id: 'uneTourneeChauffeur', type: 'critere',
      verifier: ({ D, I }) => D.lignes.filter((l) => !l.porteAffectation && lignesDe(I, l.id).length > 1)
        .map((l) => ({ texte: `${l.nom} a plus d’une tournée dans la journée.`, cartes: lignesDe(I, l.id).map((i) => i.id) })) },
    { id: 'permis', type: 'critere',
      verifier: ({ D, I }) => I.filter((i) => i.k && D.L[i.r].permis === 'B' && D.R[i.k].genre !== 'vl')
        .map((i) => ({ texte: `${D.L[i.r].nom} a le permis B : il ne peut pas conduire ${D.R[i.k].nom}, un porteur de 16 t.`, cartes: [i.id] })) },
    { id: 'transporteurDispo', type: 'disponible', sur: 'ligne',
      message: (c, l) => `${c.court} : ${l.nom} n’est pas disponible à cette heure-là.` },
    { id: 'uneTourneeCamion', type: 'critere',
      verifier: ({ D, I }) => D.ressources.map((k) => I.filter((i) => i.k === k.id)).filter((L) => L.length > 1)
        .map((L) => ({ texte: `${D.R[L[0].k].nom} fait plus d’une tournée dans la journée.`, cartes: L.map((i) => i.id), cote: 'affectation' })) },
    { id: 'typeCamion', type: 'compatible', sur: 'affectation',
      exige: (k, c) => (c.camion === 'electrique' ? !!k.electrique : c.camion === 'porteur' ? k.genre === 'porteur' : true),
      message: (c, k) => (c.camion === 'electrique' ? `${c.court} se livre en électrique : ${k.nom} ne convient pas.`
        : `${c.court} demande un porteur : ${k.nom} ne convient pas.`) },
    { id: 'autonomie', type: 'compatible', sur: 'affectation', exige: (k, c) => !k.electrique || c.km <= k.autonomie,
      message: (c, k) => `${k.nom} n’a pas assez d’autonomie pour la tournée ${c.court}.` },
    { id: 'disponible', type: 'disponible', sur: 'affectation',
      message: (c, k) => (k.panne ? `${c.court} : ${k.nom} est en panne, il ne roule pas aujourd’hui.` : `${c.court} : ${k.nom} n’est pas disponible à cette heure-là.`) },
    { id: 'fenetre', type: 'fenetre', marque: 'ligne', message: {
      debut: (c) => `${c.court} : le départ est prévu avant que la marchandise soit prête.`,
      fin: (c) => (c.id === 'rouen' ? 'Rouen : les fûts du concert arrivent trop tard.' : `${c.court} : la tournée rentre trop tard.`) } },
    { id: 'repos', type: 'reposDepuisVeille', repos: 11 * 60, message: (l) => `${l.nom} n’a pas eu ses 11 h de repos depuis hier soir.` },
    { id: 'pause', type: 'cumulSansPause', max: 4 * 60 + 30, message: (l) => `${l.nom} conduit plus de 4 h 30 sans pause.` },
    { id: 'jour', type: 'plafond', max: 9 * 60, message: (l) => `${l.nom} conduit plus de 9 h dans la journée.` },
    { id: 'vides', type: 'critere',
      verifier: ({ D, I }) => I.filter((i) => D.L[i.r].porteAffectation && i.c.vides)
        .map((i) => ({ texte: `${i.c.court} a des vides à reprendre : la tournée reste chez nous.`, cartes: [i.id] })) },
  ],
  jalons: [
    { id: 'tous', lib: 'Chaque tournée a un chauffeur et un camion', regles: [] },
    { id: 'chauffeurs', lib: 'Chauffeurs : une tournée chacun, avec le bon permis (le transporteur à son heure)',
      regles: ['uneTourneeChauffeur', 'permis', 'transporteurDispo'] },
    { id: 'camions', lib: 'Camions : une tournée chacun, du bon type, avec assez d’autonomie, disponibles',
      regles: ['uneTourneeCamion', 'typeCamion', 'autonomie', 'disponible'] },
    { id: 'fenetre', lib: 'Chaque tournée part quand elle est prête et rentre (ou livre) à l’heure', regles: ['fenetre'] },
    { id: 'conduite', lib: 'Repos et temps de conduite respectés (11 h, 4 h 30, 9 h)', regles: ['repos', 'pause', 'jour'] },
    { id: 'vides', lib: 'Aucune tournée avec des vides confiée au transporteur', regles: ['vides'], versions: [2] },
  ],
  repriseIdentique: 'faux',
  aides: {
    verifier: false,
    consignes: {
      regles: 'Pose chaque tournée sur la ligne d’un chauffeur, à l’heure du départ, et choisis son camion dans la bulle. '
        + 'Vérifie toi-même : le permis, le type de camion et son autonomie, la fenêtre de la tournée, le repos depuis hier, '
        + 'la conduite. L’heure de reprise d’un chauffeur se calcule : fin de service d’hier + 11 h.',
    },
  },
  alea: {
    de: 'Karim',
    texte: ALEA_TEXTE,
    ressources: { T2: { dispo: '19:00', panne: true }, E2: { autonomie: 80, note: 'porteur électrique 16 t · chargé à 40 % : ≈ 80 km' } },
    ajoutRessources: [LOCATION],
    ajoutLignes: [LIGNE_TRANSPORTEUR],
  },
};

// Les solutions de référence (corrigé ; les tests écrivent les leurs à la main). Créneaux depuis 05:00, au quart d'heure.
const cr = (hm) => { const [h, m] = hm.split(':').map(Number); return (h * 60 + m - 300) / 15; };
export const SOLUTION = {
  v1: { cote: { r: 'lucas', s: cr('06:00'), k: 'T1' }, rouen: { r: 'amandine', s: cr('06:30'), k: 'T2' }, versailles: { r: 'fatou', s: cr('06:30'), k: 'E1' },
    mantes: { r: 'sebastien', s: cr('09:00'), k: 'E2' }, evreux: { r: 'julien', s: cr('06:00'), k: 'VL' } },
  v2: { cote: { r: 'lucas', s: cr('06:00'), k: 'T1' }, rouen: { r: 'tr', s: cr('07:00') }, versailles: { r: 'fatou', s: cr('06:30'), k: 'E1' },
    mantes: { r: 'sebastien', s: cr('09:00'), k: 'LOC' }, evreux: { r: 'julien', s: cr('06:00'), k: 'VL' } },
};

// ─────────────────────────────────────────────────────────────── la confirmation au loueur (phrases à choisir, au VOUS, non notée)

export const CHOIX_VEHICULE = [
  'Nous confirmons la location d’un porteur 16 t thermique, sans chauffeur,',
  'Nous confirmons la location d’un porteur électrique 16 t, sans chauffeur,',
  'Nous confirmons la location d’un fourgon 3,5 t,',
  'Nous confirmons la location d’un porteur 16 t avec son chauffeur,',
];
export function phrasesLoueur(prenom) {
  return {
    id: MSG,
    lignes: [
      { id: 'bonjour', choix: ['Bonjour,', 'Salut !', 'Coucou,'], juste: 0 },
      { id: 'vehicule', choix: CHOIX_VEHICULE, juste: 0 },
      { id: 'quand', choix: ['pour ce vendredi 18 juin, de 09:00 jusqu’au retour du camion ce soir.', 'pour ce vendredi 18 juin, dès 06:00.',
        'pour toute la semaine prochaine.'], juste: 0 },
      { id: 'formule', choix: [`Cordialement, ${prenom}, exploitation France Boissons Buchelay`, 'À plus !', 'Bisous'], juste: 0 },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── la fiche « Documents à bord »

// L'organisation retenue, donnée par Karim après le 2e envoi (la fiche ne pénalise pas une 2e fois le planning) : celle de la
// solution de référence v2. Les attendus sont CALCULÉS : la ligne du transporteur → lettre de voiture ; le camion loué →
// contrat de location ; France Boissons transporte tout ce qui n'est pas chez le transporteur.
export const RETENUE = SOLUTION.v2;
export const COLONNES = [
  { id: 'fb', lib: 'Transportée par France Boissons (son chauffeur) ?' },
  { id: 'lettre', lib: 'Lettre de voiture à bord ?' },
  { id: 'contrat', lib: 'Contrat de location à bord ?' },
];
export const ATTENDU = Object.fromEntries(TOURNEES.map((t) => {
  const p = RETENUE[t.id];
  return [t.id, { fb: p.r !== LIGNE_TRANSPORTEUR.id, lettre: p.r === LIGNE_TRANSPORTEUR.id, contrat: p.k === LOCATION.id }];
}));
const quiTransporte = (t) => { const p = RETENUE[t.id]; return p.r === LIGNE_TRANSPORTEUR.id ? TRANSPORTEUR.court : p.k === LOCATION.id ? 'notre chauffeur, camion loué' : 'notre chauffeur, notre camion'; };

export const FICHE = {
  id: FICHE_ID, libelle: 'Documents à bord', titre: 'Documents à bord — vendredi 18 juin',
  sousTitre: 'Le message de Karim et le droit sont à gauche. Pour chaque tournée, réponds aux trois questions, puis envoie la fiche à Karim.',
  documents: ['organisation', 'droit'],
  bouton: 'Ouvrir la fiche « Documents à bord »',
  // Elle n'apparaît qu'une fois la location confirmée au loueur (au menu comme au bouton du message de Karim).
  quand: (db) => phrasesJustes(db, MSG).envoye,
  blocs: [
    { type: 'encadre', titre: 'Compte propre ou compte d’autrui ?',
      texte: '<b>Compte propre</b> : l’entreprise transporte <b>ses</b> marchandises, avec <b>ses</b> chauffeurs, dans ses camions ou dans des '
        + 'camions <b>loués sans chauffeur</b>. Le [[bon de livraison]] suffit ; un camion loué emporte aussi son [[contrat de location]]. '
        + '<b>Compte d’autrui</b> : un [[transporteur]] transporte les marchandises d’un autre, contre paiement. Il faut une [[lettre de voiture]].' },
    { type: 'cadre', titre: 'Les 5 tournées de ce matin', consigne: 'Le bon de livraison part toujours avec la marchandise. Pour chaque tournée : oui ou non.',
      blocs: [{ type: 'ouinon', id: BLOC, entete: 'Tournée', manque: '{n} réponse(s) manquante(s)',
        colonnes: COLONNES, lignes: TOURNEES.map((t) => ({ id: t.id, lib: `${t.court} (${quiTransporte(t)})` })) }] },
  ],
  pied: 'Fiche de la plateforme — document pédagogique, reconstitution, non contractuel',
  envoi: { bouton: 'Envoyer la fiche à Karim', a: 'Karim', suite: 'Karim va te répondre dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les documents

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;

const docTournees = () => `<article class="fb8-doc" aria-label="Les 5 tournées du vendredi">
    <p class="fb-t">Les 5 [[tournée|tournées]] confiées par Karim — vendredi 18 juin</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · exploitation</p>
    <table class="fb8-table">
      <thead><tr><th scope="col">Tournée</th><th scope="col">Horaires</th><th scope="col">Km</th><th scope="col">Service (dont conduite)</th><th scope="col">Camion</th><th scope="col">Vides</th></tr></thead>
      <tbody>${TOURNEES.map((t) => `<tr data-tournee="${t.id}"><td>${ech(t.court)}</td><td>${ech(t.fenetre)}</td><td>${t.km}</td>
        <td>${fmtH(t.service)} (${fmtH(t.conduite)})</td><td>${ech(CAMION_EXIGE[t.camion])}</td><td>${t.vides ? 'oui' : 'non'}</td></tr>`).join('')}</tbody>
    </table>
    <p class="fb8-note">La côte est la tournée de Lucas. Versailles se livre en électrique (règle de la plateforme).</p>
    ${PIED('Tournées du jour')}
  </article>`;

const docMoyens = () => `<article class="fb8-doc" aria-label="Chauffeurs et camions du jour">
    <p class="fb-t">Chauffeurs et camions du jour</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · exploitation</p>
    <table class="fb8-table">
      <thead><tr><th scope="col">Chauffeur</th><th scope="col">Permis</th><th scope="col">Fin de service hier</th></tr></thead>
      <tbody>${CHAUFFEURS.map((c) => `<tr><td>${ech(c.nom)}</td><td>${c.permis}</td><td>${c.finHier || 'en repos'}</td></tr>`).join('')}</tbody>
    </table>
    <table class="fb8-table">
      <thead><tr><th scope="col">Camion</th><th scope="col">Type</th><th scope="col">Permis</th><th scope="col">Autonomie</th></tr></thead>
      <tbody>${CAMIONS.map((k) => `<tr><td>${k.nom}</td><td>${ech(k.note.split(' · ')[0])}</td><td>${k.permis}${k.genre === 'vl' ? ' (ou C)' : ''}</td>
        <td>${k.electrique ? `≈ ${k.autonomie} km` : '—'}</td></tr>`).join('')}</tbody>
    </table>
    <p class="fb8-note">Les chauffeurs Lucas, Amandine et Julien connaissent la tournée de la côte.</p>
    ${PIED('Chauffeurs et camions')}
  </article>`;

const docRegles = () => `<article class="fb8-doc" aria-label="Les règles de la journée">
    <p class="fb-t">Les règles de la journée</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · exploitation (Karim)</p>
    <ol class="fb8-ul">
      <li>Un chauffeur et un camion font <b>une seule tournée</b> dans la journée.</li>
      <li>Porteur 16 t : [[permis C]] ; fourgon (3,5 t) : [[permis B]] (ou C).</li>
      <li>Un électrique ne fait pas plus de km que son [[autonomie]] ; Versailles se livre en électrique.</li>
      <li>Respecter la fenêtre de chaque tournée.</li>
      <li><b>11 h de [[repos journalier]]</b> depuis la fin de service d’hier ; <b>4 h 30</b> de [[temps de conduite|conduite]] au plus sans pause ;
        <b>9 h</b> de conduite au plus dans la journée.</li>
    </ol>
    ${PIED('Règles de la journée')}
  </article>`;

export const TEXTE_ORGANISATION = (prenom) => `Merci ${prenom}. Voici ce qui part ce matin : Rouen avec ${TRANSPORTEUR.nom}, Mantes sur le `
  + `porteur de location, le reste sur nos camions, avec nos chauffeurs.\n\nJ’ai appelé ${LOUEUR.nom} : ils attendent ta confirmation par écrit `
  + '(leur message est dans ta boîte). Ensuite, remplis la fiche « Documents à bord ».\n\nKarim';
const docOrganisation = () => `<article class="fb8-doc" aria-label="Le message de Karim">
    <p class="fb-t">Le message de Karim : ce qui part ce matin</p>
    <p class="fb-st">De : Karim (responsable d’exploitation transport) · vendredi 18 juin 2027</p>
    <div class="fb8-mail">${TEXTE_ORGANISATION('{ton prénom}').split('\n\n').map((p) => `<p>${ech(p)}</p>`).join('')}</div>
    <p class="fb-pied">Copie du message reçu dans la Messagerie</p>
  </article>`;

// Textes relus le 12/10/2026 : règlement (CE) n° 561/2006, version publiée au Journal officiel de l'Union européenne (Office des
// publications) ; arrêté du 9 novembre 1999 et Code du travail, sur Légifrance.
const src = (t) => `<p class="fb-st" style="margin-top:14px">${t}</p>`;
const docDroit = () => `<article class="fb8-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : temps de conduite, documents à bord</p>
    ${src('Règlement (CE) n° 561/2006, article 2 (extrait)')}<p>« 1. Le présent règlement s’applique au transport routier: a) de marchandises par des véhicules, y compris des véhicules à remorque ou à semi-remorque, dont la masse maximale autorisée dépasse 3,5 tonnes […] »</p>
    ${src('Règlement (CE) n° 561/2006, article 4 g (extrait)')}<p>« “temps de repos journalier normal”: toute période de repos d’au moins onze heures. »</p>
    ${src('Règlement (CE) n° 561/2006, article 6 (extrait)')}<p>« 1. La durée de conduite journalière ne dépasse pas neuf heures. La durée de conduite journalière peut, toutefois, être prolongée jusqu’à dix heures maximum, mais pas plus de deux fois au cours de la semaine. »</p>
    ${src('Règlement (CE) n° 561/2006, article 7')}<p>« Après un temps de conduite de quatre heures et demie, un conducteur observe une pause ininterrompue d’au moins quarante-cinq minutes, à moins qu’il ne prenne un temps de repos. Cette pause peut être remplacée par une pause d’au moins quinze minutes suivie d’une pause d’au moins trente minutes réparties au cours de la période de manière à se conformer aux dispositions du premier alinéa. »</p>
    ${src('Arrêté du 9 novembre 1999, article 2 (extrait)')}<p>« Les transports routiers de marchandises effectués pour leur propre compte par les entreprises […] doivent être accompagnés de la facture, du bon d’enlèvement ou du bon de livraison. »</p>
    ${src('Arrêté du 9 novembre 1999, article 4 (extrait)')}<p>« I.-Tout contrat de transport routier de marchandises intérieur ou international, exécuté par une entreprise résidant ou non en France, donne lieu, avant l’exécution du transport et dans les conditions fixées ci-après, à l’établissement d’une lettre de voiture. »</p>
    ${src('Arrêté du 9 novembre 1999, article 7')}<p>« La location d’un véhicule à moteur avec ou sans conducteur destiné au transport de marchandises donne lieu, avant la mise à disposition du véhicule et dans les conditions fixées ci-après, à l’établissement, par l’entreprise de location, d’une feuille de location dont au moins un exemplaire doit être à bord du véhicule. La feuille de location est de forme libre. Elle peut être établie sous forme électronique. La copie du contrat de location vaut feuille de location. »</p>
    ${src('Arrêté du 9 novembre 1999, article 9 (extrait)')}<p>« Selon la nature juridique du transport effectué, le locataire du véhicule industriel destiné au transport de marchandises est en outre soumis aux dispositions : -soit du titre Ier du présent arrêté relatif au document accompagnant les transports effectués par les entreprises n’exerçant pas une activité de transport public routier de marchandises […] ; -soit des titres II et III du présent arrêté relatif à l’établissement d’une lettre de voiture […] »</p>
    ${src('Code du travail, article L1132-1 (extrait)')}<p>« […] aucun salarié ne peut être sanctionné, licencié ou faire l’objet d’une mesure discriminatoire, directe ou indirecte, […] notamment en matière de rémunération, […] d’affectation, […] en raison de son origine, de son sexe, […] de son âge, […] »</p>
    <p class="fb-pied">Textes de loi (réels) — sources : Office des publications de l’Union européenne (règlement) ; Légifrance (arrêté, Code du travail)</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'tournees', titre: 'Les 5 tournées du vendredi', court: 'Tournées', html: docTournees() },
  { id: 'moyens', titre: 'Chauffeurs et camions du jour', court: 'Chauffeurs et camions', html: docMoyens() },
  { id: 'regles', titre: 'Les règles de la journée', court: 'Règles', html: docRegles() },
  { id: 'organisation', titre: 'Le message de Karim : ce qui part ce matin', court: 'Message de Karim', html: docOrganisation() },
  { id: 'droit', titre: 'Le droit : temps de conduite, documents à bord', court: 'Le droit', html: docDroit() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb8-doc{padding:14px 18px 0}
.fb8-doc p{margin:0 0 8px}
.fb8-mail p{margin:0 0 8px}
.fb8-table{border-collapse:collapse; width:100%; font-size:.9rem; margin:4px 0 10px}
.fb8-table th, .fb8-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left; vertical-align:top}
.fb8-table th{color:var(--douce); font-weight:600}
.fb8-note{margin:6px 0 0; font-size:.86rem}
.fb8-ul{margin:6px 0 0; padding-left:20px; font-size:.9rem}
.fb8-ul li{margin:4px 0}
`;

// ─────────────────────────────────────────────────────────────── les messages

const KARIM = { nom: EQUIPE.karim.nom, mail: mailDe('karim') };
export const ID_VOLET = 'fb-ent68';
// Les messages portent la date du scénario (règle du 10/10/2026) : semis à 5 h, puis heure d'ouverture + temps passé + décalage.
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '05:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_LOUEUR = 'Location d’un porteur — confirmation écrite';
const confirme = (db) => phrasesJustes(db, MSG).envoye;

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, KARIM, 'Le planning des chauffeurs du vendredi',
      `Bonjour ${prenom} !\n\nCe matin, 30 [[tournée|tournées]] partent de Buchelay. Je t’en confie 5 : tu fais le planning de leurs chauffeurs, `
        + '5 tournées, 5 chauffeurs, 5 camions. Un chauffeur et un camion pour chaque tournée.\n\nAttention aux permis, à l’[[autonomie]] des '
        + 'électriques et au repos de chacun. Les tournées, les chauffeurs, les camions et les règles sont en pièces jointes.\n\nKarim',
      { extra: { pieces: ['tournees', 'moyens', 'regles', 'organigramme', 'annuaire'] } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux) : l'imprévu, et la vue passe à la reprise.
    { id: 'imprevu', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'Panne : planning à reprendre', `${prenom}, ${sansBalises(ALEA_TEXTE)}\n\nKarim`, { db, decalage: 1 })] }) },
    // Le planning repris et renvoyé (juste ou faux) : Karim donne l'organisation retenue ; le loueur demande sa confirmation écrite.
    { id: 'organisation', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, KARIM, 'Ce qui part ce matin', TEXTE_ORGANISATION(prenom), { db, decalage: 3, extra: { pieces: ['organisation'] } }),
        mail(prenom, LOUEUR, SUJET_LOUEUR, `Bonjour,\n\nSuite à l’appel de M. Karim, de France Boissons Buchelay, merci de nous confirmer par écrit `
          + 'le véhicule que vous louez et pour quand. Votre message vaut réservation.\n\nService réservation\nLocaporteur (fictif)',
          { db, decalage: 4, extra: { cle: 'loueur', phrases: phrasesLoueur(prenom) } }),
      ] }) },
    // La location confirmée : le loueur accuse réception (sans juger), Karim envoie la fiche.
    { id: 'apres-loueur', quand: confirme,
      semer: (prenom, db) => ({ mails: [
        mail(prenom, LOUEUR, `RE : ${SUJET_LOUEUR}`, 'Bonjour,\n\nNous avons bien reçu votre message. Le véhicule vous attend à notre agence.\n\nService réservation\nLocaporteur (fictif)', { db, decalage: 3 }),
        mail(prenom, KARIM, 'La fiche « Documents à bord »', `Merci ${prenom}. Avant les départs, remplis la fiche « Documents à bord » pour les 5 tournées, `
          + 'puis envoie-la-moi.\n\nKarim', { db, decalage: 4, extra: { ouvreFiche: FICHE_ID } }),
      ] }) },
    // La fiche envoyée (juste ou fausse) : Karim lance la tournée de la côte (décision 66 : ENT-6.9 se joue pendant que Lucas roule).
    { id: 'fin', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'C’est parti', 'C’est parti. Lucas est sur la route de la côte avec la commande de Malo. '
        + 'Tout de suite, tu vas ordonner ses arrêts.\n\nKarim', { db, decalage: 3 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: {
    [PL]: (prenom, n, db) => ({ mails: [mail(prenom, KARIM, 'Planning corrigé', `Merci ${prenom}, j’ai bien reçu ton planning corrigé.\n\nKarim`, { db, decalage: 2 })] }),
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(prenom, KARIM, 'Fiche corrigée', `Merci ${prenom}, j’ai bien reçu ta fiche corrigée.\n\nKarim`, { db, decalage: 2 })] }),
  },
};

// ─────────────────────────────────────────────────────────────── les jalons (13, pondérés : 17 + 3 de questions = 20)
// Poids validés par Tristan le 12/10/2026. Planning 1er envoi 5 · après l'imprévu 7 · documents à bord 5 · questions notées 3 (`part`).
// Rien n'est vrai avant l'envoi : « à faire ».
export const POIDS = {
  v1: { tous: 0.5, chauffeurs: 1, camions: 1.5, fenetre: 1, conduite: 1 },
  v2: { tous: 0.5, chauffeurs: 1, camions: 2, fenetre: 1, conduite: 1, vides: 1.5 },
  doc: { rouen: 2.5, mantes: 2.5 },
};
export const GROUPES = {
  v1: 'Le planning : premier envoi',
  v2: 'Le planning : après l’imprévu',
  doc: 'Les documents à bord',
};
const attente = { status: 'attente' }, ok = { status: 'ok' }, ko = { status: 'ko' };

const jalonsPlanning68 = etapesPlanning(PLANNING).map((e) => {
  const v = e.id.startsWith('v1-') ? 'v1' : 'v2';
  return Object.assign(e, { groupe: GROUPES[v], ecran: `planning:${PL}`, poids: POIDS[v][e.id.slice(3)] });
});
// Une ligne de la fiche est juste quand ses trois réponses sont celles de l'organisation retenue.
const ligneJuste = (valeurs, t) => { const L = (valeurs[BLOC] || {})[t] || {}; return COLONNES.every((c) => L[c.id] === ATTENDU[t][c.id]); };
const jalonDoc = (t, titre) => ({ id: `doc-${t}`, titre, groupe: GROUPES.doc, poids: POIDS.doc[t], ecran: `fiche:${FICHE_ID}`,
  verifier(db) {
    const f = ficheEnvoyee(db, FICHE_ID);
    if (!f.envoye) return attente;
    return ligneJuste(f.valeurs, t) ? ok : ko;
  } });

export const ETAPES = [
  ...jalonsPlanning68,
  jalonDoc('rouen', `Documents à bord : Rouen, chez ${TRANSPORTEUR.court} (compte d’autrui)`),
  jalonDoc('mantes', 'Documents à bord : Mantes, sur le camion loué (compte propre)'),
];

// ─────────────────────────────────────────────────────────────── l'accueil

export const MENTION = 'Réels : France Boissons et sa plateforme de Buchelay (Yvelines), ses porteurs électriques de 16 t loués (≈ 200 km par charge), '
  + 'les permis B et C, le règlement européen sur les temps de conduite et l’arrêté sur les documents à bord. Construit : les tournées, leurs '
  + `horaires et leurs km, les camions, les chauffeurs et leurs horaires d’hier, la panne, le loueur ${LOUEUR.nom}, le transporteur `
  + `${TRANSPORTEUR.nom}, l’organisateur ${ORGANISATEUR}, tous les messages.`;
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  tournée: 'Le trajet d’un camion qui livre plusieurs clients dans la journée, au départ de la plateforme.',
  'compte propre': 'Une entreprise transporte ses propres marchandises, avec ses chauffeurs (dans ses camions ou des camions loués sans chauffeur).',
  'compte d’autrui': 'Un transporteur transporte les marchandises d’un autre, contre paiement.',
  'lettre de voiture': 'Le document du contrat de transport, quand un transporteur transporte pour un autre (compte d’autrui). Il est à bord du camion.',
  'bon de livraison': 'Le document qui accompagne la marchandise jusqu’au client : ce qui est livré, à qui, en quelle quantité.',
  'contrat de location': 'Le document qui prouve qu’un camion est loué (par qui, à qui, pour quelles dates). Une copie est à bord.',
  'location sans chauffeur': 'On loue le camion seul ; c’est notre chauffeur qui le conduit.',
  transporteur: 'Une entreprise dont le métier est de transporter les marchandises des autres.',
  'sous-traiter': 'Confier un travail à une autre entreprise : ici, une tournée à un transporteur.',
  autonomie: 'Les km qu’un camion électrique peut faire avec une charge de batterie.',
  'permis C': 'Permis de conduire les camions de plus de 3,5 t, comme un porteur de 16 t.',
  'permis B': 'Permis de conduire les véhicules de 3,5 t au plus (voitures, fourgons).',
  porteur: 'Camion d’un seul tenant (la caisse est fixée sur le châssis), sans remorque.',
  'temps de conduite': 'Le temps passé au volant. Pour un camion de plus de 3,5 t : 4 h 30 au plus sans pause, 9 h au plus dans la journée.',
  'repos journalier': 'Le temps de repos entre deux journées de travail : 11 h au moins pour un chauffeur de camion.',
});
export const ACCUEIL = {
  titre: 'Chauffeurs et camions du vendredi',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie : les tournées, les chauffeurs, les camions et les règles sont en pièces jointes.'],
    ['Faire le planning', 'Menu « Planning des chauffeurs » : un chauffeur et un camion pour chaque tournée, puis envoie le planning.'],
    ['Reprendre après l’imprévu', 'Un message t’annonce une panne : reprends le planning et renvoie-le.'],
    ['Confirmer la location', 'Réponds au loueur : « Répondre », puis une phrase par ligne.'],
    ['Remplir les documents à bord', 'Karim te l’envoie : pour chaque tournée, qui transporte et quels documents partent à bord.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 8 : chauffeurs et camions du vendredi',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  planning: PLANNING,
  fiche: FICHE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
