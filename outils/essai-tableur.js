// La mini-séance d'ESSAI du geste tableur (04/10/2026, chantier C5) : la page
// `outils/essai-tableur.html` l'ouvre dans le vrai moteur d'entreprise, et le bloc de tests
// `tableur-export` s'en sert. Elle n'est inscrite nulle part : aucun élève ne la voit.
//
// Les données sont celles de l'allée A d'ENT-2.3 (`contenus/cdiscount-inventaire.js`), réduites
// aux DIX premières lignes de préparation des emplacements A-01 à A-04 : de quoi faire une colonne
// Écart, une colonne SI et une synthèse NB.SI en cinq minutes, sous Excel comme sous LibreOffice.

import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as S from '../contenus/cdiscount-inventaire.js';

export const COLONNES = ['Date', 'N° bon', 'Commande', 'Référence', 'Désignation', 'Emplacement',
  'Qté préparée', 'Stock logiciel', 'Stock trouvé', 'Préparateur'];
const A01_A04 = S.MODELES.slice(0, 8);

// Les dix lignes de l'essai, depuis la base de l'élève (fonction pure).
export const lignesEssai = (db) => CDISCOUNT.lignesPreparation(db, S.CATALOGUE, (o, sku) => A01_A04.includes(sku)).slice(0, 10);
export const versLigne = (p) => [p.ts, p.bon, p.commande, p.sku, p.designation, p.emplacement, p.qty, p.logiciel, p.trouve, p.preparateur];

// Les contrôles de l'essai, calculés sur l'export de l'élève (rien en dur).
export function controlesEssai(db) {
  const L = lignesEssai(db);
  const refs = A01_A04.filter((r) => L.some((p) => p.sku === r));
  const constats = Object.fromEntries(refs.map((r) => [r, L.filter((p) => p.sku === r && p.trouve !== p.logiciel).length]));
  return [
    { type: 'colonne', id: 'ecart', libelle: 'Colonne Écart (stock trouvé − stock logiciel)', feuille: 'Préparations', titre: 'Écart',
      cle: ['N° bon', 'Référence'], attendu: (l) => l['Stock trouvé'] - l['Stock logiciel'], formule: true },
    { type: 'colonne', id: 'si', libelle: 'Colonne Réf. en écart (fonction SI)', feuille: 'Préparations', titre: 'Réf. en écart',
      cle: ['N° bon', 'Référence'], attendu: (l) => (l['Stock trouvé'] !== l['Stock logiciel'] ? l['Référence'] : ''), fonctions: ['IF'] },
    { type: 'table', id: 'synthese', libelle: 'Synthèse : nombre de constats (fonction NB.SI)', feuille: 'Synthèse', cle: 'Référence',
      colonne: 'Nb constats', attendu: constats, fonctions: ['COUNTIF'] },
  ];
}

export function tableurEssai(retour) {
  return {
    aide: 'SI(test ; valeur si vrai ; valeur si faux) — NB.SI(plage ; critère) compte les cellules de la plage qui répondent au critère.',
    exports: [{
      id: 'preparations', ecran: 'commandes', libelle: 'Exporter les lignes de préparation',
      fichier: 'essai-preparations.xlsx',
      feuilles: [{
        nom: 'Préparations', colonnes: COLONNES, types: { Date: 'date' },
        lignes: (db) => lignesEssai(db).map(versLigne),
      }, {
        nom: 'Synthèse', colonnes: ['Référence', 'Nb constats'],
        lignes: (db) => A01_A04.filter((r) => lignesEssai(db).some((p) => p.sku === r)).map((r) => [r, null]),
      }],
    }],
    depot: { id: 'analyse', export: 'preparations', libelle: 'Déposer mon fichier', retour, controles: controlesEssai },
  };
}

export function univers(retour = 'guidage') {
  return {
    ENTREPRISE: CDISCOUNT.ENTREPRISE, VOCAB: CDISCOUNT.VOCAB, CATALOGUE: S.CATALOGUE,
    SUPPLIERS: CDISCOUNT.SUPPLIERS, SUP_BY_ID: CDISCOUNT.SUP_BY_ID, CUSTOMERS: CDISCOUNT.CUSTOMERS, CM: CDISCOUNT.CM,
    THEME: CDISCOUNT.THEME, baseDeDepart: S.baseDeDepart, exercice: 'Essai du geste tableur', etapes: [],
    sansTrame: "Tout à l'écran",
    volet: {
      id: 'essai-tableur',
      semer(prenom, db) {
        const P = S.periode(Date.now(), (db && db.stock) || S.INVENTAIRE_PRECEDENT);
        return { receptions: P.receptions, orders: P.orders, mouvements: P.mouvements,
          mails: [{ folder: 'in', ts: Date.now() - 60e3, from: 'Essai', fromMail: 'essai@cdiscount.example', to: prenom,
            subject: 'Essai du geste tableur', kind: 'text',
            text: "1. Commandes : « Exporter les lignes de préparation ».\n2. Dans le tableur : colonne « Écart » (stock trouvé − stock logiciel), colonne « Réf. en écart » (fonction SI), feuille Synthèse : « Nb constats » (fonction NB.SI).\n3. Fichiers : déposez votre classeur (.xlsx ou .ods)." }] };
      },
    },
    tableur: tableurEssai(retour),
  };
}
