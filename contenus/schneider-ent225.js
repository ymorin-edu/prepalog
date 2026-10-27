// ENT-22.5 — Schneider Electric, « le contrôle de Mehdi » : ENTRAÎNEMENT de CAP-C1.4 avec ERREUR INDUITE, CAP OL. Mehdi a contrôlé une
// livraison et s'est trompé (deux statuts faux, une décision et une réserve fausses) : l'élève trouve ses erreurs, refait le contrôle, choisit la
// bonne décision et la bonne réserve, puis rend compte à Nadia sans accuser Mehdi.
// Univers : `contenus/schneider.js` ; données : `BL225`, `MEHDI225` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les erreurs de Mehdi 3 · les lignes 5 (1 × 5) · la décision 1,5 ·
// la réserve 1,5 · compte rendu 5 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_CONTROLE, docBL, blocsLignes, jalonsLignes, blocsReserve, jalonsReserve, ech } from './schneider.js';
import { BL225, MEHDI225, STATUTS, DECISIONS, erreursMehdi, nomDe } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.5.js';

export * from './schneider.js';

const get = () => BL225;
const ERREURS = erreursMehdi(BL225, MEHDI225);
const lib = (L, v) => L.find((x) => x.v === v).lib;
const DOC_MEHDI = { id: 'mehdi', titre: 'La fiche de contrôle de Mehdi', court: 'La fiche de Mehdi', html: `<article class="se-doc" aria-label="La fiche de contrôle de Mehdi">
  <p class="se-t">La fiche de contrôle de Mehdi</p><p class="se-st">Remplie avant ton arrivée — à vérifier</p>
  <table class="se-table"><thead><tr><th scope="col">Ligne</th><th scope="col">Produit</th><th scope="col">Statut noté par Mehdi</th></tr></thead><tbody>
    ${BL225.lignes.map((L) => `<tr><td>${L.id}</td><td>${ech(nomDe(L.prod))}</td><td>${ech(lib(STATUTS, MEHDI225.statuts[L.id]))}</td></tr>`).join('')}
  </tbody></table>
  <p><b>Décision :</b> ${ech(lib(DECISIONS, MEHDI225.decision))}. <b>Réserve écrite :</b> « ${ech(MEHDI225.reserve)} ».</p>
  <p class="se-pied">Fiche CONSTRUITE pour l’exercice. Document pédagogique — reconstitution, non contractuel.</p></article>` };

const S = seanceFiches(U, {
  id: 'schneider-mehdi', prefixe: '225', titre: 'Le contrôle de Mehdi', exercice: 'Séance 5 : le contrôle de Mehdi',
  documents: [DOC_SITE, DOC_CONTROLE, docBL(BL225), DOC_MEHDI],
  pas: [
    { id: 'erreurs', libelle: 'Les erreurs de Mehdi', titre: 'Où Mehdi s’est-il trompé ?', sousTitre: 'Compare sa fiche avec le bon de livraison et le comptage.',
      objet: 'Le contrôle de Mehdi', pieces: ['mehdi', 'bl'], documents: ['mehdi', 'bl'], largeurDocs: 1.3,
      message: 'Bonjour {prenom}. Mehdi a contrôlé le camion des bornes ce matin, mais le chauffeur n’est pas encore parti : je veux qu’on vérifie avant qu’il signe. '
        + 'Coche les lignes où Mehdi s’est trompé de statut.',
      blocs: [{ type: 'cases', id: 'erreurs', titre: 'Les lignes où le statut de Mehdi est faux', choix: BL225.lignes.map((L) => ({ v: L.id, lib: `${L.id} : ${nomDe(L.prod)}` })) }],
      jalons: [{ id: 'erreurs', titre: 'Les erreurs de Mehdi', groupe: 'Les erreurs de Mehdi', poids: 3, attendu: ERREURS.join(', '), juste: (v) => memes(v.erreurs || [], ERREURS) }] },
    { id: 'lignes', libelle: 'Le bon contrôle', titre: 'Le contrôle, refait', sousTitre: 'Le bon statut de chaque ligne.',
      objet: 'Le contrôle refait', pieces: ['bl', 'controle'], documents: ['bl', 'controle'],
      message: 'Refais maintenant le contrôle : le bon statut de chaque ligne.',
      blocs: blocsLignes(BL225), jalons: jalonsLignes(get, { poids: 1, groupe: 'Le bon contrôle' }) },
    { id: 'reserve', libelle: 'La réserve', titre: 'La décision et la réserve', sousTitre: 'Mehdi a accepté sans réserve. Et toi ?',
      objet: 'La lettre de voiture', pieces: ['controle'], documents: ['controle', 'mehdi'],
      message: 'Le chauffeur attend toujours. Que fais-tu de la livraison, et qu’écris-tu sur la lettre de voiture ?',
      blocs: blocsReserve(BL225), jalons: jalonsReserve(get, { decision: 1.5, reserve: 1.5, groupe: 'La réserve' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 5, message: 'Merci {prenom}. Écris-moi ton compte rendu : ce que Mehdi avait noté, et ce qui est juste.',
    lignes: (prenom) => [SALUT,
      { id: 'borne', choix: ['Mehdi a noté les bornes conformes : il en manque une.', 'Mehdi a noté les bornes conformes : il y en a une en trop.', 'Les bornes étaient bien conformes.'], juste: 0 },
      { id: 'contacteur', choix: ['Mehdi a noté qu’il manquait des contacteurs : il y en a 2 en trop.', 'Il manque bien 2 contacteurs.', 'Les contacteurs sont abîmés.'], juste: 0 },
      { id: 'reserve', choix: ['J’ai remplacé « sous réserve de déballage » par une réserve précise, avant que le chauffeur signe.', 'J’ai gardé « sous réserve de déballage ».', 'J’ai refusé toute la livraison.'], juste: 0 },
      { id: 'ton', choix: ['On en parle avec Mehdi pour comprendre ce qui s’est passé.', 'Mehdi est nul.', 'Je ne dis rien à Mehdi.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Coche les lignes où Mehdi s’est trompé.', 'Refais le contrôle.', 'La décision et la réserve.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Une erreur, ça arrive : l’important, c’est de la voir avant que le chauffeur parte.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
