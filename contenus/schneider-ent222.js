// ENT-22.2 — Schneider Electric, « accueillir un camion » : GUIDAGE de CAP-C1.3 (prendre en charge les opérations de réception : accueillir,
// protocole de sécurité, pré-contrôle, décharger), CAP OL. Le planigramme du lundi (le quai, l'heure et les palettes de « ton » camion), les gestes
// du protocole dans l'ordre, trois situations de pré-contrôle, les colis à porter avec une aide, puis le compte rendu à Nadia.
// Univers : `contenus/schneider.js` ; données : `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : planigramme 3 (1 × 3) · protocole 3 (0,5 par geste à son rang) · pré-contrôle
// 3 (1 × 3) · colis lourds 3 · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE, DOC_PROTOCOLE, docPlanigramme, docPrecontrole, docColis, blocsQuai, jalonsQuai, blocsPrecontrole, jalonsPrecontrole, blocLourds, jalonLourds } from './schneider.js';
import { PLAN222, MON222, HEURES, SIT222, LOURDS222, nomDe, aAider } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.2.js';

export * from './schneider.js';

const J = { plan: PLAN222, mon: MON222 };
const MIEN = PLAN222.find((c) => c.id === MON222);
export const GESTES = [
  { v: 'quai', lib: 'Le camion se met à quai, le chauffeur coupe le moteur' },
  { v: 'cles', lib: 'Le chauffeur me remet ses clés' },
  { v: 'scelle', lib: 'Je compare le numéro du scellé avec l’avis d’expédition' },
  { v: 'ouvrir', lib: 'Je coupe le scellé et j’ouvre les portes' },
  { v: 'pre', lib: 'Je compte les palettes et je regarde leur état' },
  { v: 'decharger', lib: 'Je décharge, palette par palette' },
];
const DEPART = ['ouvrir', 'decharger', 'quai', 'pre', 'cles', 'scelle'];

const S = seanceFiches(U, {
  id: 'schneider-accueil', prefixe: '222', titre: 'Accueillir un camion', exercice: 'Séance 2 : accueillir un camion',
  documents: [DOC_SITE, DOC_PROTOCOLE, docPlanigramme(J, 'Le planigramme du lundi'), docPrecontrole(SIT222), docColis(LOURDS222)],
  pas: [
    { id: 'plani', libelle: 'Le planigramme', titre: 'Mon camion sur le planigramme', sousTitre: 'Ton camion est en gras, à gauche.',
      objet: 'Ton premier camion', pieces: ['planigramme'], documents: ['planigramme'],
      message: 'Bonjour {prenom} ! Aujourd’hui, tu accueilles ton premier camion avec Mehdi : celui de l’usine du Vaudreuil. Lis le planigramme du lundi et remplis la fiche.',
      blocs: [...blocsQuai(J).slice(0, 1), { type: 'liste', id: 'heure', lib: 'À quelle heure arrive-t-il ?', vide: 'Choisir…', manque: 'l’heure', choix: HEURES.map((h) => ({ v: h, lib: h.replace(':', ' h ') })) }, ...blocsQuai(J).slice(1)],
      jalons: [...jalonsQuai(() => J, { quai: 1, palettes: 1, groupe: 'Le planigramme' }).slice(0, 1),
        { id: 'heure', titre: 'Le planigramme : l’heure', groupe: 'Le planigramme', poids: 1, attendu: MIEN.heure.replace(':', ' h '), juste: (v) => v.heure === MIEN.heure },
        ...jalonsQuai(() => J, { quai: 1, palettes: 1, groupe: 'Le planigramme' }).slice(1)] },
    { id: 'protocole', libelle: 'Le protocole', titre: 'Les gestes du protocole', sousTitre: 'Range les gestes dans l’ordre, de l’arrivée au déchargement.',
      objet: 'Le protocole', pieces: ['protocole'], documents: ['protocole'],
      message: 'Avant d’aller au quai, lis « Au quai : le protocole » et remets les gestes dans l’ordre.',
      blocs: [{ type: 'ordre', id: 'ordre', titre: 'Dans l’ordre', consigne: 'De l’arrivée du camion au déchargement.', choix: DEPART.map((x) => GESTES.find((g) => g.v === x)) }],
      jalons: GESTES.map((g, k) => ({ id: `geste-${k + 1}`, titre: `Le protocole : « ${g.lib} » à sa place`, groupe: 'Le protocole', poids: 0.5,
        attendu: `geste ${k + 1}`, juste: (v) => Array.isArray(v.ordre) && v.ordre[k] === g.v })) },
    { id: 'precontrole', libelle: 'Le pré-contrôle', titre: 'Avant d’ouvrir les portes', sousTitre: 'Trois camions ce matin. Pour chacun, que fais-tu ?',
      objet: 'Le pré-contrôle', pieces: ['precontrole'], documents: ['precontrole', 'protocole'],
      message: 'Trois camions sont à quai. Pour chacun, compare l’avis d’expédition et ce que tu vois, puis dis-moi ce que tu fais.',
      blocs: blocsPrecontrole(SIT222), jalons: jalonsPrecontrole(() => SIT222, { poids: 1, groupe: 'Le pré-contrôle' }) },
    { id: 'lourds', libelle: 'Les colis lourds', titre: 'Les colis à porter', sousTitre: 'Coche les colis qui se portent avec un exosquelette ou à deux.',
      objet: 'Les colis lourds', pieces: ['colis'], documents: ['colis', 'protocole'],
      message: 'Quelques colis se déchargent à la main. Coche ceux qui se portent avec un exosquelette ou à deux.',
      blocs: [blocLourds(LOURDS222)], jalons: [jalonLourds(() => LOURDS222, { poids: 3, groupe: 'Les colis lourds' })] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu du matin, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'camion', choix: [`Le camion du Vaudreuil était au quai ${MIEN.quai}, avec ${MIEN.palettes} palettes.`, `Le camion du Vaudreuil était au quai Q2, avec 22 palettes.`, `Le camion du Vaudreuil était au quai ${MIEN.quai}, avec 26 palettes.`], juste: 0 },
      { id: 'scelle', choix: ['Le camion de l’usine en Europe avait un scellé différent : je n’ai pas ouvert, je t’ai appelée.', 'Le camion de l’usine en Europe avait un scellé différent : j’ai ouvert quand même.', 'Tous les scellés étaient bons.'], juste: 0 },
      { id: 'lourds', choix: [`J’ai porté ${aAider(LOURDS222).map((x) => nomDe(x).toLowerCase()).join(' et ')} avec l’exosquelette.`, 'J’ai porté tous les colis seul(e), même les plus lourds.', 'Je n’ai porté aucun colis.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Lis le planigramme : quai, heure, palettes.', 'Range les gestes du protocole.', 'Pour chaque camion, dis ce que tu fais.', 'Coche les colis lourds.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, tu accueilles toute seule ou tout seul les camions du mardi.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
