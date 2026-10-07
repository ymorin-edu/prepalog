// Corrigé d'ENT-5.8 (Kuehne+Nagel, la lettre de voiture et le retard), montré dans l'onglet « Corrigés » de
// l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent58.js`) : la lettre attendue,
// le poids, la nouvelle heure d'arrivée et les deux messages justes. Rien n'est recopié.

import {
  ATTENDU, ACTEURS, LIEUX, NATURES, NUMERO_LV, E1, POIDS, KG_PALETTE_COMPLETE, KG_MIXTE,
  DEPART, ARRIVEE_PREVUE, ARRIVEE, LIMITE, RETARD, ACCIDENT, PHRASES_CLIENT, PHRASES_SMOBY,
} from '../smoby-ent58.js';
import { CHAUFFEURS, CAMIONS } from '../smoby.js';

const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const lib = (L, v) => (L.find((x) => x.v === v || x.id === v) || {}).lib || (L.find((x) => x.id === v) || {}).nom || v;
const jour = (iso) => iso.split('-').reverse().join('/');
const kg = (n) => n.toLocaleString('fr-FR').replace(/[  ]/g, ' ');
const juste = (P) => P.lignes.map((l) => (l.texte != null ? l.texte : l.choix[l.juste])).join(' ');

export const CORRIGE = {
  code: 'ENT-5.8',
  titre: 'Kuehne+Nagel — la lettre de voiture et le retard',
  items: [
    { etape: 1, etapeTitre: 'Lettre de voiture', genre: 'tableau', texte: `La lettre attendue (n° ${NUMERO_LV}, prérempli)`,
      contexte: 'Expéditeur : celui qui envoie (Smoby). Destinataire : celui qui reçoit (le client). Transporteur : Kuehne+Nagel. '
        + 'Chauffeur et véhicule : la ligne d’E1 du planning. Marchandise : l’ordre d’enlèvement.',
      entetes: ['Case', 'Réponse', 'Où la trouver'],
      reponses: [
        ['Établie le', jour(ATTENDU.date), 'message du responsable, planning'],
        ['1. Expéditeur', `${lib(ACTEURS, ATTENDU.expNom)}, ${lib(LIEUX, ATTENDU.expLieu)}`, 'ordre d’enlèvement'],
        ['2. Destinataire', `${lib(ACTEURS, ATTENDU.destNom)}, ${lib(LIEUX, ATTENDU.destLieu)}`, 'fiche client'],
        ['3. Transporteur', lib(ACTEURS, ATTENDU.transporteur), 'ordre d’enlèvement'],
        ['3. Chauffeur · véhicule', `${lib(CHAUFFEURS, ATTENDU.chauffeur)} · ${lib(CAMIONS, ATTENDU.vehicule)}`, 'planning, ligne E1'],
        ['4. Chargement', `${lib(LIEUX, ATTENDU.chargLieu)}, le ${jour(ATTENDU.chargDate)}`, 'ordre d’enlèvement'],
        ['5. Livraison', `${lib(LIEUX, ATTENDU.livLieu)}, le ${jour(ATTENDU.livDate)}`, 'fiche client'],
        ['6. Marchandise', `${lib(NATURES, ATTENDU.nature)} · ${ATTENDU.palettes} palettes · ${kg(ATTENDU.poids)} kg`, 'ordre d’enlèvement'],
      ],
      note: `Une case = un jalon (15 cases, 11 points sur 20 ; la date de la lettre compte avec les lieux et dates). Poids : ${E1.pal - 1} palettes complètes × `
        + `${KG_PALETTE_COMPLETE} kg + la palette mixte d’ENT-5.6 (${KG_MIXTE} kg) = ${kg(POIDS)} kg, écrit tel quel sur l’ordre d’enlèvement. `
        + 'La lettre peut partir incomplète : une case vide est fausse.' },
    { etape: 2, etapeTitre: 'Le retard', genre: 'question', texte: 'La nouvelle heure d’arrivée',
      rep: `${hm(DEPART)} + ${E1.conduite / 60} h de conduite = ${hm(ARRIVEE_PREVUE)} prévu ; + ${RETARD / 60} h de retard = ${hm(ARRIVEE)}. `
        + `${ARRIVEE < LIMITE ? 'Oui' : 'Non'}, ${ARRIVEE < LIMITE ? 'avant' : 'après'} l’heure limite (${hm(LIMITE)}).`,
      note: `Deux jalons : l’heure (1,5 point) et le oui / non (0,5 point). Simplification de la séance : à ${ACCIDENT}, Julie est arrêtée moteur coupé ; ce temps ne compte pas `
        + 'comme de la conduite (elle reste à 4 h de conduite, sans pause obligatoire).' },
    { etape: 3, etapeTitre: 'Prévenir', genre: 'question', texte: 'Le message au client (phrases à choisir)',
      rep: juste(PHRASES_CLIENT), note: 'Une ligne = un jalon (4 points : cause, heure et quai à 1, salutation et fin à 0,5). Pièges : 10 h 00, l’heure prévue sans le retard ; 12 h 30 ; le quai 1, celui de Smoby.' },
    { etape: 3, etapeTitre: 'Prévenir', genre: 'question', texte: 'Le message à Smoby, l’expéditeur (phrases à choisir)',
      rep: juste(PHRASES_SMOBY), note: 'Une ligne = un jalon (3 points : retard et client à 1, salutation et fin à 0,5). Le message à Smoby n’arrive qu’une fois le client prévenu. Le dernier envoi compte.' },
  ],
};
