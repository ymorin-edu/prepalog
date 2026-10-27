// ENT-24.1 — Kuehne+Nagel, « les pré-alertes de la nuit » : GUIDAGE de C1.3 (préparer l'action de réception), 1re Bac Pro. Au hub aérien de
// Roissy-CDG, Sophie montre comment on prépare une réception à partir des pré-alertes : la zone de température de chaque envoi, la durée de
// réception, ce qu'on prépare avant le premier camion, l'envoi qui passe d'abord, puis le compte rendu.
// Univers : `contenus/kuehne-nagel.js` ; données : `PRE241` de `contenus/kuehne-nagel-donnees.js` ; questions : `contenus/questions/ENT-24.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 4 (0,8 × 5) · les durées 3 (1 × 3) · préparer 2 · qui d'abord 3
// (1,5 × 2) · compte rendu 4 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './kuehne-nagel-commun.js';
import { DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes, blocsZones, jalonsZones, blocsDurees, jalonsDurees, blocPremier } from './kuehne-nagel.js';
import { PRE241, PRODUITS, duree } from './kuehne-nagel-donnees.js';
import { QUESTIONS } from './questions/ENT-24.1.js';

export * from './kuehne-nagel.js';

const L = PRE241;
const DUREES = ['A', 'B', 'E'].map((id) => L.find((x) => x.id === id));
const FROID = L.filter((x) => x.zone === 'froid'), GENERAL = L.filter((x) => x.zone === 'general');
const PREPARER = [
  { v: 'temperature', lib: 'Vérifier que les chambres froides sont bien entre 2 et 8 °C', juste: true },
  { v: 'ouvrir', lib: 'Ouvrir les colis de vaccins pour voir s’ils sont froids', juste: false },
  { v: 'quais', lib: 'Prévoir un quai libre de la bonne zone pour chaque envoi', juste: true },
  { v: 'attendre', lib: 'Ne rien préparer : on verra quand les camions arriveront', juste: false },
  { v: 'equipe', lib: 'Prévenir Karim qu’il y aura des médicaments à ranger au froid', juste: true },
];
const S = seanceFiches(U, {
  id: 'kuehne-nagel-prealertes', prefixe: '241', titre: 'Les pré-alertes de la nuit', exercice: 'Séance 1 : les pré-alertes de la nuit',
  documents: [DOC_HUB, DOC_REGLES, DOC_DROIT, docPreAlertes(L)],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'Dans quelle zone ?', sousTitre: 'Lis l’étiquette de chaque envoi dans les pré-alertes, à gauche.',
      objet: 'Les pré-alertes de la nuit', pieces: ['prealertes', 'regles'], documents: ['prealertes', 'regles'], largeurDocs: 1.4,
      message: 'Bonjour {prenom} ! Bienvenue au service réception import. Chaque matin, je prépare les réceptions à partir des pré-alertes reçues la nuit : '
        + 'elles annoncent les envois qui arrivent par avion. Lis « Préparer une réception », puis dis-moi dans quelle zone va chaque envoi.',
      blocs: blocsZones(L), jalons: jalonsZones(() => L, { poids: 0.8, groupe: 'Les zones' }) },
    { id: 'durees', libelle: 'Les durées', titre: 'Combien de temps au quai ?', sousTitre: 'La règle de durée est dans « Préparer une réception ».',
      objet: 'Combien de temps ?', pieces: ['regles'], documents: ['regles', 'prealertes'],
      message: 'Pour réserver les quais, il faut savoir combien de temps prend chaque réception. Calcule-le pour trois envois.',
      blocs: blocsDurees(DUREES), jalons: jalonsDurees(() => DUREES, { poids: 1, groupe: 'Les durées' }) },
    { id: 'preparer', libelle: 'Préparer', titre: 'Avant le premier camion', sousTitre: 'Coche ce qu’on prépare avant que les envois arrivent.',
      objet: 'Avant le premier camion', pieces: ['droit'], documents: ['droit', 'regles'],
      message: 'Le premier camion arrive à 6 h. Que préparons-nous avant ? Coche ce qu’il faut faire, et seulement ça.',
      blocs: [{ type: 'cases', id: 'preparer', titre: 'Ce qu’on prépare', choix: PREPARER.map(({ v, lib }) => ({ v, lib })) }],
      jalons: [{ id: 'preparer', titre: 'Ce qu’on prépare avant les arrivées', groupe: 'Préparer', poids: 2,
        attendu: PREPARER.filter((x) => x.juste).map((x) => x.lib).join(' ; '), juste: (v) => memes(v.preparer || [], PREPARER.filter((x) => x.juste).map((x) => x.v)) }] },
    { id: 'premier', libelle: 'Qui d’abord ?', titre: 'Qui passe en premier ?', sousTitre: 'Regarde l’heure de mise à disposition et l’heure limite.',
      objet: 'Qui passe en premier ?', pieces: ['prealertes'], documents: ['prealertes', 'regles'],
      message: 'Deux quais froids, un quai de fret général : il faut choisir l’ordre. Dis-moi quel envoi passe en premier, au froid et au fret général.',
      blocs: [blocPremier('froid', 'Au froid, lequel faut-il recevoir en premier ?', FROID), blocPremier('general', 'Au fret général, lequel ne peut pas attendre ?', GENERAL)],
      jalons: [
        { id: 'premier-froid', titre: 'Le premier envoi au froid', groupe: 'Qui d’abord ?', poids: 1.5, attendu: 'A (vaccins, limite 8 h)', juste: (v) => v.froid === 'A' },
        { id: 'premier-general', titre: 'L’envoi urgent du fret général', groupe: 'Qui d’abord ?', poids: 1.5, attendu: 'C (pièces d’avion AOG, limite 9 h)', juste: (v) => v.general === 'C' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Écris-moi ton compte rendu de la préparation, une phrase par ligne.',
    lignes: (prenom) => [SALUT,
      { id: 'froid', choix: ['Les vaccins A et l’insuline E vont en chambre froide de 2 à 8 °C.', 'Les vaccins A vont dans le fret général.', 'Tous les envois vont en chambre froide.'], juste: 0 },
      { id: 'aog', choix: ['Les pièces de moteur C passent avant les montres D : un avion attend au sol.', 'Les montres D passent avant les pièces de moteur C : elles coûtent plus cher.', 'Les pièces de moteur C peuvent attendre demain.'], juste: 0 },
      { id: 'duree', choix: [`L’envoi B, avec ses ${L[1].palettes} palettes, prend ${duree(L[1].palettes)} minutes au quai.`, `L’envoi B prend ${L[1].palettes * 10} minutes au quai.`, 'L’envoi B prend 15 minutes au quai.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['La zone de chaque envoi.', 'Le temps au quai de trois envois.', 'Ce qu’on prépare avant le premier camion.', 'Qui passe en premier.', 'Réponds à Sophie, une phrase par ligne.'],
  fin: 'Merci {prenom}. Demain, tu feras toi-même le planning des quais.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
