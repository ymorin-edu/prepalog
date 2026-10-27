// ENT-23.2 — Yves Rocher, « le chariot de quatre commandes » : ENTRAÎNEMENT de C2.2, 2de Bac Pro. Seul(e) avec un chariot de quatre bacs (Rennes,
// Vannes, Lorient, Saint-Malo) : la façon de préparer quatre lignes (et une ligne en détail chiffré), l'ordre des cinq arrêts, ce qu'on prend en
// une fois à une adresse partagée et le bac où va chaque article. Compte rendu à Soizic.
// Univers : `contenus/yves-rocher.js` ; données : `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : préparer 3 (0,75 × 4) · cartons et détail de Saint-Malo 2 (1 × 2) · l'ordre
// des arrêts 3 (0,6 × 5) · le chariot 4 (1 × 4) · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U_PREPA, SALUT, FIN } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_PREPARER, docChariot } from './yves-rocher.js';
import { CHARIOT232, TYPES232, TYPES, typeDe, ligneDe, arrets, ordreChariot, totalA, bacDe, BACS, nomDe, PRODUITS, cartons, detail } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.2.js';

export * from './yves-rocher.js';

const C = CHARIOT232;
const SM = ligneDe(C, 4, 'gel');
const boutique = (bac) => C.find((b) => b.bac === bac).boutique;
const ORDRE = ordreChariot(C);

const S = seanceFiches(U_PREPA, {
  id: 'yves-rocher-chariot', prefixe: '232', titre: 'Le chariot de quatre commandes', exercice: 'Séance 2 : le chariot de quatre commandes',
  documents: [DOC_SITE, DOC_PREPARER, docChariot(C)],
  pas: [
    { id: 'types', libelle: 'Préparer', titre: 'Cartons complets ou détail ?', sousTitre: 'Quatre lignes de ton chariot.',
      objet: 'Ton chariot', pieces: ['chariot', 'preparer'], documents: ['chariot', 'preparer'],
      message: 'Bonjour {prenom} ! Aujourd’hui, tu prends un chariot de quatre commandes, comme Maël. Regarde « Ton chariot » et dis-moi comment tu prépares ces lignes.',
      blocs: [...TYPES232.map(([bac, prod]) => { const L = ligneDe(C, bac, prod); return { type: 'liste', id: `type-${bac}-${prod}`,
        lib: `Bac ${bac} (${boutique(bac)}) : ${L.qte} ${nomDe(prod).toLowerCase()} (${PRODUITS[prod].parCarton} par carton)`, vide: 'Choisir…', manque: `la ligne du bac ${bac}`, choix: TYPES }; }),
      { type: 'nombre', id: 'cartons', lib: `Saint-Malo, ${SM.qte} gels douche : combien de cartons complets ?`, unite: 'cartons', min: 0, entier: true, manque: 'les cartons' },
      { type: 'nombre', id: 'detail', lib: `Saint-Malo, ${SM.qte} gels douche : combien au détail ?`, unite: 'articles', min: 0, entier: true, manque: 'le détail' }],
      jalons: [...TYPES232.map(([bac, prod], i) => { const L = ligneDe(C, bac, prod); return { id: `type-${i + 1}`, titre: `Préparer : bac ${bac}, ${nomDe(prod).toLowerCase()}`,
        groupe: 'Préparer', poids: 0.75, attendu: TYPES.find((x) => x.v === typeDe(L)).lib, juste: (v) => v[`type-${bac}-${prod}`] === typeDe(L) }; }),
      { id: 'cartons', titre: 'Saint-Malo : les cartons complets', groupe: 'Préparer', poids: 1, attendu: String(cartons(SM)), juste: (v) => proche(v.cartons, cartons(SM)) },
      { id: 'detail', titre: 'Saint-Malo : le détail', groupe: 'Préparer', poids: 1, attendu: String(detail(SM)), juste: (v) => proche(v.detail, detail(SM)) }] },
    { id: 'ordre', libelle: 'Les arrêts', titre: 'L’ordre de mes arrêts', sousTitre: 'Une adresse par produit : range-les dans l’ordre de ton parcours.',
      objet: 'Ton parcours', pieces: ['chariot'], documents: ['chariot', 'preparer'],
      message: 'Ton chariot passe par cinq adresses. Range-les dans l’ordre de ton parcours : allée par allée, sans revenir en arrière.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Mes arrêts', consigne: 'De la première adresse à la dernière.',
        choix: arrets(C).map((p) => ({ v: p, lib: `${nomDe(p)} (${PRODUITS[p].adr})` })) }],
      jalons: ORDRE.map((p, k) => ({ id: `ordre-${k + 1}`, titre: `Les arrêts : l’arrêt n° ${k + 1}`, groupe: 'Les arrêts', poids: 0.6, attendu: `${nomDe(p)} (${PRODUITS[p].adr})`,
        juste: (v) => Array.isArray(v.ordre) && v.ordre[k] === p })) },
    { id: 'chariot', libelle: 'Le chariot', titre: 'À chaque arrêt', sousTitre: 'Ce que tu prends en une fois, et le bac où ça va.',
      objet: 'Les bacs', pieces: ['chariot'], documents: ['chariot', 'preparer'],
      message: 'À une adresse, tu prends en une fois ce qu’il faut pour tout le chariot. Combien prends-tu, et dans quel bac vont les articles ?',
      blocs: [
        { type: 'nombre', id: 'total-gel', lib: `À l’adresse ${PRODUITS.gel.adr} : combien de gels douche prends-tu en tout ?`, unite: 'gels douche', min: 0, entier: true, manque: 'les gels douche' },
        { type: 'nombre', id: 'total-deo', lib: `À l’adresse ${PRODUITS.deo.adr} : combien de déodorants prends-tu en tout ?`, unite: 'déodorants', min: 0, entier: true, manque: 'les déodorants' },
        { type: 'liste', id: 'bac-huile', lib: `Les ${ligneDe(C, 4, 'huile').qte} huiles sèches vont dans…`, vide: 'Choisir…', manque: 'le bac des huiles', choix: BACS(C) },
        { type: 'liste', id: 'bac-vernis', lib: `Les ${ligneDe(C, 3, 'vernis').qte} vernis à ongles vont dans…`, vide: 'Choisir…', manque: 'le bac des vernis', choix: BACS(C) }],
      jalons: [
        { id: 'total-gel', titre: 'Le chariot : les gels douche en une fois', groupe: 'Le chariot', poids: 1, attendu: String(totalA(C, 'gel')), juste: (v) => proche(v['total-gel'], totalA(C, 'gel')) },
        { id: 'total-deo', titre: 'Le chariot : les déodorants en une fois', groupe: 'Le chariot', poids: 1, attendu: String(totalA(C, 'deo')), juste: (v) => proche(v['total-deo'], totalA(C, 'deo')) },
        { id: 'bac-huile', titre: 'Le chariot : le bac des huiles sèches', groupe: 'Le chariot', poids: 1, attendu: `Bac ${bacDe(C, 'huile')}`, juste: (v) => v['bac-huile'] === String(bacDe(C, 'huile')) },
        { id: 'bac-vernis', titre: 'Le chariot : le bac des vernis', groupe: 'Le chariot', poids: 1, attendu: `Bac ${bacDe(C, 'vernis')}`, juste: (v) => v['bac-vernis'] === String(bacDe(C, 'vernis')) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne.',
    lignes: (prenom) => [SALUT('Soizic'),
      { id: 'gel', choix: [`À l’adresse ${PRODUITS.gel.adr}, j’ai pris ${totalA(C, 'gel')} gels douche en une fois, pour trois bacs.`,
        `À l’adresse ${PRODUITS.gel.adr}, je suis passé(e) trois fois, une fois par bac.`, `À l’adresse ${PRODUITS.gel.adr}, j’ai pris 24 gels douche, un carton.`], juste: 0 },
      { id: 'malo', choix: [`Pour Saint-Malo : ${cartons(SM)} carton de gel douche et ${detail(SM)} au détail.`, `Pour Saint-Malo : ${SM.qte} gels douche au détail.`,
        'Pour Saint-Malo : 2 cartons de gel douche.'], juste: 0 },
      { id: 'premier', choix: [`Mon premier arrêt : ${nomDe(ORDRE[0]).toLowerCase()}, allée ${PRODUITS[ORDRE[0]].adr.slice(0, 2)}.`,
        'Mon premier arrêt : gel douche, le premier produit du bac 1.', 'Mon premier arrêt : vernis à ongles, la plus grande allée.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Cartons complets ou détail, pour quatre lignes.', 'L’ordre de tes cinq arrêts.', 'Ce que tu prends en une fois, et dans quel bac.', 'Réponds à Soizic, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, tu contrôles un carton avant qu’il parte.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
