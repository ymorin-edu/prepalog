// ENT-23.5 — Yves Rocher, « le pic de fin novembre » : ENTRAÎNEMENT de C2.1 (et C2.2), 2de Bac Pro. Avec Inès, le jour du « Black Friday » : trois
// demandes urgentes de boutiques (avant ou après l'heure limite, assez de stock ou pas), le reliquat, la préparation de ce qui part ce soir, puis
// ce que deviennent trois retours (la loi anti-gaspillage). Compte rendu à Inès.
// Univers : `contenus/yves-rocher.js` ; données : `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.5.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les demandes 4,5 (1,5 × 3) · le reliquat 1,5 · préparer 3 (1 × 3) · les retours
// 3 (1 × 3) · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U_BOUTIQUES, SALUT, FIN } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_PREPARER, DOC_RETOURS, docDemandes, CHOIX_SORTS } from './yves-rocher.js';
import { DEMANDES235, SUITES, suiteDe, reliquat, PREP235, TYPES, typeDe, RETOURS, nomDe, PRODUITS, HEURE_LIMITE } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.5.js';

export * from './yves-rocher.js';

const BREST = DEMANDES235.find((d) => d.id === 'brest');
const H = HEURE_LIMITE.replace(':00', ' h');

const S = seanceFiches(U_BOUTIQUES, {
  id: 'yves-rocher-black-friday', prefixe: '235', titre: 'Le pic de fin novembre', exercice: 'Séance 5 : le pic de fin novembre',
  documents: [DOC_SITE, DOC_PREPARER, DOC_RETOURS, docDemandes(DEMANDES235)],
  pas: [
    { id: 'demandes', libelle: 'Les demandes', titre: 'Trois demandes urgentes', sousTitre: 'L’heure de la demande, le stock : que devient chacune ?',
      objet: 'Les demandes du jour', pieces: ['demandes'], documents: ['demandes'],
      message: 'Bonjour {prenom} ! C’est le jour du « Black Friday » : trois boutiques nous demandent des articles en plus. Lis « Les demandes du jour » et dis-moi ce que devient chacune.',
      blocs: [...DEMANDES235.map((d) => ({ type: 'liste', id: `suite-${d.id}`, lib: `${d.boutique} (reçue à ${d.heure.replace(':', ' h ')})`, vide: 'Choisir…', manque: `la demande de ${d.boutique}`, choix: SUITES })),
        { type: 'nombre', id: 'reliquat', lib: 'Brest : combien de crèmes mains partiront plus tard ?', unite: 'crèmes mains', min: 0, entier: true, manque: 'le reliquat de Brest' }],
      jalons: [...DEMANDES235.map((d) => ({ id: `suite-${d.id}`, titre: `Les demandes : ${d.boutique}`, groupe: 'Les demandes', poids: 1.5,
        attendu: SUITES.find((x) => x.v === suiteDe(d)).lib, juste: (v) => v[`suite-${d.id}`] === suiteDe(d) })),
      { id: 'reliquat', titre: 'Les demandes : le reliquat de Brest', groupe: 'Les demandes', poids: 1.5, attendu: String(reliquat(BREST)), juste: (v) => proche(v.reliquat, reliquat(BREST)) }] },
    { id: 'preparer', libelle: 'Préparer', titre: 'Ce qui part ce soir', sousTitre: 'Comment Maël prépare-t-il ces lignes ?',
      objet: 'Pour Maël', pieces: ['preparer'], documents: ['demandes', 'preparer'],
      message: 'Maël prépare tout de suite ce qui part ce soir. Dis-lui comment préparer chaque ligne.',
      blocs: PREP235.map((L) => ({ type: 'liste', id: `type-${L.id}`, lib: `${L.boutique} : ${L.qte} ${nomDe(L.prod).toLowerCase()} (${PRODUITS[L.prod].parCarton} par carton)`, vide: 'Choisir…',
        manque: `la ligne ${L.boutique}`, choix: TYPES })),
      jalons: PREP235.map((L) => ({ id: `type-${L.id}`, titre: `Préparer : ${L.boutique}, ${nomDe(L.prod).toLowerCase()}`, groupe: 'Préparer', poids: 1,
        attendu: TYPES.find((x) => x.v === typeDe(L)).lib, juste: (v) => v[`type-${L.id}`] === typeDe(L) })) },
    { id: 'retours', libelle: 'Les retours', titre: 'Les retours des boutiques', sousTitre: 'Que devient chaque article renvoyé ?',
      objet: 'Les retours', pieces: ['retours'], documents: ['retours'],
      message: 'Des boutiques nous ont aussi renvoyé des articles. Lis « Les retours des boutiques » : que devient chacun ?',
      blocs: RETOURS.map((r) => ({ type: 'liste', id: `retour-${r.id}`, lib: r.lib, vide: 'Choisir…', manque: `les ${r.id}`, choix: CHOIX_SORTS })),
      jalons: RETOURS.map((r) => ({ id: `retour-${r.id}`, titre: `Les retours : ${r.id}`, groupe: 'Les retours', poids: 1,
        attendu: CHOIX_SORTS.find((x) => x.v === r.sort).lib, juste: (v) => v[`retour-${r.id}`] === r.sort })) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne.',
    lignes: (prenom) => [SALUT('Inès'),
      { id: 'brest', choix: [`Brest reçoit ${BREST.stock.creme} crèmes mains ce soir ; les ${reliquat(BREST)} autres partiront plus tard.`, 'Brest reçoit ses 60 crèmes mains ce soir.',
        'Brest ne reçoit rien : il n’y a pas assez de stock.'], juste: 0 },
      { id: 'lorient', choix: [`La demande de Lorient est arrivée après ${H} : elle sera préparée demain.`, 'Lorient reçoit ses shampooings ce soir.', 'J’ai refusé la demande de Lorient.'], juste: 0 },
      { id: 'coffrets', choix: ['Les coffrets de l’an dernier vont à une association : la loi interdit de les détruire.', 'Les coffrets de l’an dernier vont à la poubelle.',
        'Les coffrets de l’an dernier sont remis en stock.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Trois demandes urgentes : ce soir, en partie, ou demain ?', 'Comment préparer ce qui part ce soir.', 'Ce que deviennent les retours.', 'Réponds à Inès, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, c’est l’évaluation : une commande à préparer et une réclamation, seul(e).',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
