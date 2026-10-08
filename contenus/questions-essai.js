// SÉANCE D'ESSAI des questions au fil (08/10/2026, brief `docs/briefs/MOTEUR-questions-au-fil.md`, lot 2).
//
// Une ENT-6.2 simplifiée, comme la page d'essai v2 de Cowork : Malo (gérant d'un café) commande du jus d'orange, en
// rupture ; Inès demande le bon de commande avec un remplacement ; Karim pose une question au fil quand l'élève choisit
// le remplacement ; un point d'étape avec Inès vient entre l'envoi du bon et la réponse à Malo ; une question de
// réflexion suit la réponse à Malo. Questions : `contenus/questions/ESSAI.js`.
//
// Montée par la page `outils/essai-questions.html` et par le bloc de tests `outils/test/questions.mjs`. Ce n'est pas
// une activité : elle n'apparaît nulle part dans le site. Entreprise, personnes, produits et stocks CONSTRUITS.

import { catalogueSimple } from './entreprise-commun.js';
import { apresMail } from '../core/declencheurs.js';
import { ficheEnvoyee, lireNombre } from '../core/types/fiche.js';
import { QUESTIONS } from './questions/ESSAI.js';

export const MENTION = 'Page d’essai des questions au fil. <b>Construit</b> : l’entrepôt, Malo, Inès, Karim, les produits et le stock.';
export const MALO = 'malo@cafe-essai.example';
export const INES = 'ines.moreau@entrepot-essai.example';

const PRODUITS = [
  { ref: 'JUS-ORA', designation: 'Jus d’orange 1 L (carton de 12)', stock: 0 },
  { ref: 'JUS-POM', designation: 'Jus de pomme 1 L (carton de 12)', stock: 24 },
  { ref: 'LIM-1L', designation: 'Limonade 1 L (carton de 12)', stock: 3 },
  { ref: 'NEC-ABR', designation: 'Nectar d’abricot 1 L (carton de 12)', stock: 0 },
];

export const FICHE_BON = {
  id: 'bon', libelle: 'Bon de commande', titre: 'Bon de commande — Café de Malo',
  sousTitre: 'Commande de Malo : 10 cartons de jus d’orange (en rupture).',
  bouton: 'Ouvrir le bon de commande',
  blocs: [
    { type: 'liste', id: 'remplacement', titre: '1. Remplacement', lib: 'Produit livré à la place', vide: 'Choisir un produit…',
      manque: 'le remplacement', choix: PRODUITS.filter((p) => p.ref !== 'JUS-ORA').map((p) => ({ v: p.ref, lib: p.designation })) },
    { type: 'nombre', id: 'quantite', lib: 'Quantité (cartons)', unite: 'cartons', manque: 'la quantité' },
  ],
  envoi: { bouton: 'Envoyer le bon à Inès', a: 'Inès', suite: 'Inès va te répondre.' },
};

export const ETAPES = [
  { id: 'remplacement', titre: 'Remplacement disponible en stock', groupe: 'Bon de commande', poids: 8,
    verifier(db) {
      const f = ficheEnvoyee(db, 'bon');
      if (!f.envoye) return { status: 'attente' };
      return { status: f.valeurs.remplacement === 'JUS-POM' ? 'ok' : 'ko' };
    } },
  { id: 'quantite', titre: 'Quantité commandée', groupe: 'Bon de commande', poids: 4,
    verifier(db) {
      const f = ficheEnvoyee(db, 'bon');
      if (!f.envoye) return { status: 'attente' };
      return { status: lireNombre(f.valeurs.quantite) === 10 ? 'ok' : 'ko' };
    } },
  { id: 'reponse-malo', titre: 'Réponse à Malo', groupe: 'Réponse à Malo', poids: 4,
    verifier(db) {
      const m = (db.mails || []).filter((x) => x.folder === 'out' && x.toMail === MALO);
      if (!m.length) return { status: 'attente' };
      return { status: /pomme/i.test(m[m.length - 1].text) ? 'ok' : 'ko' };
    } },
];

function volet() {
  return {
    id: 'essai-questions',
    semer: (prenom) => ({
      mails: [{
        folder: 'in', ts: Date.now() - 120000, from: 'Malo, Café de Malo', fromMail: MALO, to: prenom, cle: 'malo',
        subject: 'Ma commande de jus d’orange', kind: 'text',
        text: 'Bonjour,\n\nJe voudrais 10 cartons de jus d’orange pour vendredi.\n\nMalo',
      }, {
        folder: 'in', ts: Date.now() - 60000, from: 'Inès Moreau', fromMail: INES, to: prenom,
        subject: 'Le bon de commande de Malo', kind: 'text', ouvreFiche: 'bon',
        text: `Bonjour ${prenom},\n\nLe jus d’orange est en rupture. Prépare le bon de commande de Malo avec un produit de remplacement (regarde le stock), puis envoie-le-moi.\n\nInès`,
      }],
    }),
    declencheurs: [{
      id: 'merci-malo', quand: apresMail({ a: MALO }),
      semer: (prenom) => ({ mails: [{ folder: 'in', ts: Date.now() + 1000, from: 'Malo, Café de Malo', fromMail: MALO, to: prenom,
        subject: 'RE : Ma commande de jus d’orange', kind: 'text', text: 'Merci, c’est noté pour vendredi.\n\nMalo' }] }),
    }],
  };
}

export function univers({ copie = false } = {}) {
  return {
    ENTREPRISE: { id: 'essai-questions', nom: 'Entrepôt d’essai', sousTitre: 'Boissons — page d’essai', exercice: 'Le bon de commande de Malo' },
    VOCAB: { unit: 'carton', unitPl: 'cartons', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'entrepot-essai.example' },
    CATALOGUE: catalogueSimple(PRODUITS.map((p) => ({ ref: p.ref, designation: p.designation }))),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: Object.fromEntries(PRODUITS.map((p) => [p.ref, p.stock])), moves: [], mails: [],
      orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: ETAPES, menu: ['stock'], stockOuvert: true,
    accueil: { titre: 'Le bon de commande de Malo', kpis: ['mail'], etapes: [
      ['Lire les messages', 'Malo veut du jus d’orange ; Inès te demande le bon de commande.'],
      ['Remplir le bon de commande', 'Un produit de remplacement (regarde le stock) et la quantité, puis l’envoyer à Inès.'],
      ['Répondre à Malo', 'Après le point d’étape avec Inès.'],
    ] },
    volet: volet(),
    fiche: FICHE_BON,
    questions: QUESTIONS,
    copie, sansTrame: 'Tout à l’écran',
  };
}

export const META = { id: 'essai-questions', code: 'ESSAI', titre: 'Essai — questions au fil', portee: 'eleve', immersif: true,
  temps: 'guidage', parcours: true, suiteAuBilan: true, reinitialisable: true };
