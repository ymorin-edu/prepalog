// ENT-12.4 — IKEA, « la facture du transporteur » : les DONNÉES PURES (brief `docs/briefs/ENT-12.4-ikea-facture-du-transporteur.md` ; choix de Tristan du 26/10/2026,
// `docs/briefs/ikea/A-TRANCHER.md`). Importé par le contenu (`contenus/ikea-ent124.js`), les questions, le corrigé et les tests. Mécanique de la facture :
// `contenus/ikea-facture.js` ; écrans communs : `contenus/ikea-facture-ecrans.js` ; univers : `contenus/ikea.js`.
//
// CONSTRUIT (le prestataire n'est PAS nommé, choix de Tristan du 26/10/2026) : le tarif, les bons, la facture de février, les clients. GUIDAGE : la facture est la pièce FIXE (la même
// pour tous, trois erreurs : un doublon, un mauvais tarif, une livraison non faite) ; l'évaluation ENT-12.8 tire la sienne.
// Art. 1302 du Code civil (alinéa 1) : « Tout paiement suppose une dette ; ce qui a été reçu sans être dû est sujet à restitution. » — recopié sans relecture sur Légifrance
// pendant cette session (à relire à la source avant la classe).

import { FACTURE_GUIDAGE } from './ikea-facture.js';

export const ID = 'ikea-facture-transporteur';
export const ID_VOLET = 'ik-ent124';
export const FICHE_ID = 'controle-facture-124';
export const PHRASES_ID = 'reclamation-124';
export const MAIL_PRESTA = 'facturation@prestataire-livraison.example';
export const JOUR = { iso: '2027-03-08', lib: 'lundi 8 mars 2027' };
export const NUMERO = 'F-2027-0231';
export const PERIODE = 'livraisons de février 2027';

let F = null;
export const dossier = () => F || (F = FACTURE_GUIDAGE());

export const ARTICLE_1302 = 'Tout paiement suppose une dette ; ce qui a été reçu sans être dû est sujet à restitution.';

// Une condition vraie dès que l'un des gestes a eu lieu (les noms sont contrôlés par le moteur).
export function ouGeste(...noms) {
  const f = (db, seance) => !!(db && db.gestes && db.gestes[seance] && noms.some((n) => db.gestes[seance][n]));
  f.gestes = noms;
  return f;
}
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
