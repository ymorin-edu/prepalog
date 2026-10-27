// ENT-23.1 — Yves Rocher, « bienvenue à La Villouët » : GUIDAGE de C2.2 (optimiser les préparations de commandes en fonction des demandes), 2de
// Bac Pro. Le voyage d'un gel douche et qui la plateforme livre, puis la commande de la boutique de Rennes : cartons complets, détail ou les deux,
// ligne par ligne, et l'ordre de prélèvement par les adresses. Compte rendu à Soizic.
// Univers : `contenus/yves-rocher.js` ; données : `contenus/yves-rocher-donnees.js` ; questions : `contenus/questions/ENT-23.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le voyage 2 (0,5 × 4) · qui la plateforme livre 1 · préparer 5 (1 × 5) ·
// l'ordre de prélèvement 3 (0,6 × 5) · compte rendu 5 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U_PREPA, SALUT, FIN } from './yves-rocher-commun.js';
import { DOC_SITE, DOC_EQUIPE, DOC_PREPARER, docCommande, blocsTypes, jalonsTypes, blocOrdre, jalonsOrdre } from './yves-rocher.js';
import { CMD231, VOYAGE, VOYAGE_DEPART, DESTINATAIRES, DESTINATAIRES_JUSTES, ordreDe, nomDe, PRODUITS } from './yves-rocher-donnees.js';
import { QUESTIONS } from './questions/ENT-23.1.js';

export * from './yves-rocher.js';

const get = () => CMD231;
const PREMIER = ordreDe(CMD231.lignes)[0];

const S = seanceFiches(U_PREPA, {
  id: 'yves-rocher-bienvenue', prefixe: '231', titre: 'Bienvenue à La Villouët', exercice: 'Séance 1 : bienvenue à La Villouët',
  documents: [DOC_SITE, DOC_EQUIPE, DOC_PREPARER, docCommande(get, 'Le bon de préparation de Rennes')],
  pas: [
    { id: 'voyage', libelle: 'Le voyage', titre: 'Le voyage d’un gel douche', sousTitre: 'De l’usine à la cliente, puis qui la plateforme livre.',
      objet: 'Bienvenue !', pieces: ['site', 'equipe'], documents: ['site', 'equipe'],
      message: 'Bonjour {prenom} ! Bienvenue à la préparation. Lis « La plateforme » et « L’équipe », puis remets dans l’ordre le voyage d’un gel douche.',
      blocs: [{ type: 'ordre', id: 'voyage', titre: 'Dans l’ordre', consigne: 'De l’usine à la cliente.', choix: VOYAGE_DEPART.map((x) => VOYAGE.find((g) => g.v === x)) },
        { type: 'cases', id: 'qui', titre: 'Qui reçoit les commandes préparées à La Villouët ?', choix: DESTINATAIRES }],
      jalons: [...VOYAGE.map((g, k) => ({ id: `voyage-${k + 1}`, titre: `Le voyage : « ${g.lib} » à sa place`, groupe: 'Le voyage', poids: 0.5,
        attendu: `étape ${k + 1}`, juste: (v) => Array.isArray(v.voyage) && v.voyage[k] === g.v })),
      { id: 'qui', titre: 'Qui la plateforme livre', groupe: 'Le voyage', poids: 1, attendu: DESTINATAIRES.filter((x) => DESTINATAIRES_JUSTES.includes(x.v)).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.qui || [], DESTINATAIRES_JUSTES) }] },
    { id: 'types', libelle: 'Préparer', titre: 'Cartons complets ou détail ?', sousTitre: 'Pour chaque ligne, regarde la quantité et le colisage.',
      objet: 'La commande de Rennes', pieces: ['commande', 'preparer'], documents: ['commande', 'preparer'],
      message: 'Voici ta première commande : la boutique de Rennes. Lis « Préparer une commande », puis dis-moi comment tu prépares chaque ligne.',
      blocs: blocsTypes(CMD231), jalons: jalonsTypes(get, { poids: 1, groupe: 'Préparer' }) },
    { id: 'ordre', libelle: 'L’ordre', titre: 'Mon ordre de prélèvement', sousTitre: 'Range les produits dans l’ordre où tu passes devant eux.',
      objet: 'Le parcours', pieces: ['commande', 'preparer'], documents: ['commande', 'preparer'],
      message: 'Le bon range les produits par nom. Toi, tu passes allée par allée. Range les cinq produits dans l’ordre de ton parcours.',
      blocs: [blocOrdre(CMD231)], jalons: jalonsOrdre(get, { poids: 0.6, groupe: 'L’ordre de prélèvement' }) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 5, message: 'Merci {prenom}. Écris-moi ton compte rendu, une phrase par ligne.',
    lignes: (prenom) => [SALUT('Soizic'),
      { id: 'edt', choix: ['Pour les 15 eaux de toilette, je prends 2 cartons de 6 et 3 au détail.', 'Pour les 15 eaux de toilette, je prends les 15 au détail.',
        'Pour les 15 eaux de toilette, je prends 3 cartons de 6.'], juste: 0 },
      { id: 'premier', choix: [`Je commence par : ${nomDe(PREMIER).toLowerCase()}, allée ${PRODUITS[PREMIER].adr.slice(0, 2)}.`,
        'Je commence par : crème mains, la première ligne du bon.', 'Je commence par : eau de toilette, la plus loin.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Le voyage d’un gel douche, et qui la plateforme livre.', 'Cartons complets ou détail, ligne par ligne.', 'L’ordre de ton parcours.', 'Réponds à Soizic, une phrase par ligne.'],
  fin: 'Merci {prenom}. La prochaine fois, tu prends un chariot de quatre commandes.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
