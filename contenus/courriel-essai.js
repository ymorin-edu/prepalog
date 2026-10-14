// SÉANCE D'ESSAI du Nouveau courriel (option `courriel`, 14/10/2026, brief `docs/briefs/MOTEUR-courriel-planning.md`, lot 2).
//
// L'élève remplit un ordre de transport minimal (numéro de conteneur, port), l'ENREGISTRE (fiche `envoi.enregistrer`), puis écrit à un
// transporteur en lui joignant le fichier « OT-ESSAI-001.pdf » ; ou sans. Le transporteur répond selon que l'ordre est joint ou non, et cite
// le numéro de conteneur SAISI dans la fiche. Un carnet de quatre contacts (deux transporteurs qui répondent, le quai et la responsable qui
// ne répondent pas), deux documents joignables.
//
// Montée par le bloc de tests `outils/test/courriel.mjs`. Ce n'est pas une activité : elle n'apparaît nulle part dans le site (comme
// `contenus/dialogue-essai.js`). Entreprise, personnes, numéros CONSTRUITS : aucune entreprise réelle ici (l'ordre de transport d'ENT-7.2
// vit dans sa séance).
//
// Valeurs attendues, écrites à la main dans le bloc : pièce de la fiche `fiche:ordre`, fichier « OT-ESSAI-001.pdf », réponse avec l'ordre
// « Ordre bien reçu : conteneur <numéro saisi> », réponse sans l'ordre « sans l’ordre de transport ».

import { catalogueSimple } from './entreprise-commun.js';
import { courrielsEnvoyes } from '../core/types/courriel.js';
import { ficheEnvoyee } from '../core/types/fiche.js';

export const SEANCE = 'essai-courriel';
export const MENTION = 'Séance d’essai du Nouveau courriel. <b>Construit</b> : l’entrepôt, les transporteurs, l’ordre et ses numéros.';
export const FICHIER = 'OT-ESSAI-001.pdf';

export const EQUIPE = { claire: { nom: 'Claire Vasseur', appel: 'Claire', role: 'ta responsable' } };

export const CARNET = [
  { id: 'routiers', nom: 'Routiers du Nord', role: 'transporteur', mail: 'exploitation@routiers-nord.example' },
  { id: 'contargo', nom: 'Barge Contargo', role: 'transporteur · réservations', mail: 'reservations@barge-contargo.example' },
  { id: 'quai', nom: 'Quai de réception', role: 'entrepôt', mail: 'quai@entrepot-essai.example' },
  { id: 'claire', nom: 'Claire Vasseur', role: 'ta responsable', mail: 'claire.vasseur@entrepot-essai.example' },
];

export const DOCUMENTS = [
  { id: 'cdc', titre: 'Cahier des charges', court: 'Cahier des charges',
    html: '<article><h3>Cahier des charges</h3><p>Document d’essai : les conditions de transport de l’entrepôt d’essai.</p></article>' },
  { id: 'avis', titre: 'Avis de mise à disposition', court: 'Avis de mise à disposition',
    html: '<article><h3>Avis de mise à disposition</h3><p>Document d’essai : le conteneur est à disposition au terminal.</p></article>' },
];

export const FICHE = {
  id: 'ordre', libelle: 'Ordre de transport', titre: 'Ordre de transport', sousTitre: 'Remplis l’ordre, enregistre-le, puis joins-le à ton courriel.',
  blocs: [
    { type: 'texte', id: 'conteneur', lib: 'Numéro du conteneur', manque: 'le numéro du conteneur' },
    { type: 'liste', id: 'port', lib: 'Port de départ', manque: 'le port', choix: [{ v: 'anvers', lib: 'Anvers' }, { v: 'rotterdam', lib: 'Rotterdam' }] },
  ],
  envoi: { bouton: 'Enregistrer l’ordre de transport', enregistrer: true, nomPiece: FICHIER, suite: 'Envoie-le maintenant par courriel.' },
};

// Le numéro saisi dans la fiche (tel que tapé), ou rien tant que l'ordre n'est pas enregistré.
export const conteneurSaisi = (db) => { const f = ficheEnvoyee(db, 'ordre'); return f.envoye ? f.valeurs.conteneur : null; };

// La réponse automatique : les deux transporteurs répondent, le quai et la responsable non. Avec l'ordre joint, le transporteur cite le
// numéro SAISI dans la fiche (et joint l'avis de mise à disposition) ; sans lui, il demande l'ordre.
export function reponse(c, db, prenom) {
  if (c.a !== 'routiers' && c.a !== 'contargo') return null;
  if (c.pieces.includes('fiche:ordre')) {
    return { de: c.a, texte: `Bonjour ${prenom}, ordre bien reçu : conteneur ${conteneurSaisi(db)}. Enlèvement confirmé.`, pieces: ['avis'] };
  }
  return { de: c.a, texte: 'Bonjour, nous ne pouvons pas enregistrer votre demande sans l’ordre de transport. Merci de nous l’envoyer en pièce jointe.' };
}

// Les jalons (lecture seule de ce que l'élève a envoyé) : « à faire » tant qu'aucun courriel n'est parti.
const verso = (juge) => (db) => {
  const L = courrielsEnvoyes(db, SEANCE).filter((c) => c.a === 'contargo');
  if (!L.length) return { status: 'attente' };
  return { status: juge(L) ? 'ok' : 'ko' };
};
export const ETAPES = [
  { id: 'ordre-joint', titre: 'Ordre de transport joint au courriel', groupe: 'Courriel à Contargo', poids: 10,
    verifier: verso((L) => L.some((c) => c.pieces.includes('fiche:ordre'))) },
  { id: 'objet-ecrit', titre: 'Objet du courriel renseigné', groupe: 'Objet', poids: 10,
    verifier: verso((L) => L.some((c) => c.objet.trim() !== '')) },
];

const PRODUITS = [{ ref: 'JUS-POM', designation: 'Jus de pomme 1 L (carton de 12)', stock: 24 }];

export function univers({ copie = false, courriel = {} } = {}) {
  return {
    ENTREPRISE: { id: SEANCE, nom: 'Entrepôt d’essai', sousTitre: 'Courriel — séance d’essai', exercice: 'Commander un transport' },
    VOCAB: { unit: 'carton', unitPl: 'cartons', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'entrepot-essai.example' },
    CATALOGUE: catalogueSimple(PRODUITS.map((p) => ({ ref: p.ref, designation: p.designation }))),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: Object.fromEntries(PRODUITS.map((p) => [p.ref, p.stock])), moves: [], mails: [],
      orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: ETAPES, menu: ['stock'], stockOuvert: true,
    accueil: { titre: 'Commander un transport', kpis: ['mail'], etapes: [
      ['Remplir et enregistrer l’ordre', 'Ouvre la fiche « Ordre de transport » et enregistre-la.'],
      ['Écrire au transporteur', 'Dans la Messagerie, joins l’ordre à ton courriel.'],
    ] },
    documents: DOCUMENTS.map((d) => ({ ...d })), fiche: JSON.parse(JSON.stringify(FICHE)), equipe: EQUIPE,
    courriel: { carnet: CARNET.map((c) => ({ ...c })), pieces: ['cdc', 'avis'], reponse, ...courriel },
    copie, sansTrame: 'Tout à l’écran',
  };
}

export const META = { id: SEANCE, code: 'ESSAI', titre: 'Essai — courriel', portee: 'eleve', immersif: true,
  temps: 'guidage', parcours: true, suiteAuBilan: true, reinitialisable: true };
