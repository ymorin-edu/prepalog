// Corrigé d'ENT-5.1 (Smoby, recruter le cariste de Noël), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/smoby-ent51.js`) : le tableau de tri
// attendu, le candidat retenu, le contrat et le message juste. Rien n'est recopié.

import { CANDIDATS, COLONNES, TRI_ATTENDU, RETENU, POSTE, PHRASES } from '../smoby-ent51.js';
import { CORRIGE as TRAME } from './ENT-5.1-trame.js';

// Le corrigé de la trame élève (généré, relue par Tristan le 06/10/2026), après celui calculé
// depuis la séance. Ses étapes sont celles de la trame : marquées « (trame) », sinon l'onglet
// Corrigés, qui regroupe par numéro d'étape, les mêlerait aux étapes de l'écran (mêmes numéros).
const DE_LA_TRAME = TRAME.items.map((it) => ({ ...it, etape: `${it.etape} (trame)` }));

const ouiNon = (b) => (b ? 'oui' : 'non');
const pourquoi = {
  yanis: 'le seul qui coche les trois critères',
  laura: 'CACES 3 de mars 2021 : périmé depuis mars 2026',
  mehdi: 'CACES 1A seulement (transpalette), pas de CACES 3',
  thomas: 'libre seulement le 4 janvier 2027, après le pic',
  sabrina: 'cherche uniquement un CDI',
};
const juste = (l) => { const c = typeof l.choix === 'function' ? l.choix({}) : l.choix; return c[l.juste]; };

export const CORRIGE = {
  code: 'ENT-5.1',
  titre: 'Smoby — recruter le cariste de Noël',
  trame: TRAME.trame,
  items: [
    { etape: 1, etapeTitre: 'Fiche de sélection', genre: 'tableau', texte: 'Le tableau de tri',
      contexte: `Prise de poste le 9/12/2026 ; CACES ${POSTE.caces} exigé, valable ${POSTE.validiteAns} ans ; contrat ${POSTE.contrat} saisonnier.`,
      entetes: ['Candidat', ...COLONNES.map((k) => k.lib), 'Pourquoi'],
      reponses: CANDIDATS.map((c) => [c.nom, ...COLONNES.map((k) => ouiNon(TRI_ATTENDU[c.id][k.id])), pourquoi[c.id] || '']) },
    { etape: 1, etapeTitre: 'Fiche de sélection', genre: 'question', texte: 'Le choix',
      rep: `Je retiens ${RETENU.nom} · Contrat : ${POSTE.contrat}`,
      note: 'Les cinq lignes du tableau, le candidat et le contrat sont jugés à l’envoi de la fiche (jalons 1 à 7).' },
    { etape: 2, etapeTitre: 'Réponse à Sophie', genre: 'question', texte: 'Le message juste (phrases à choisir)',
      rep: PHRASES.lignes.map(juste).join(' '),
      note: 'Jalon 8 : la ligne « raison » ; jalon 9 : la salutation et la formule de fin. Les lignes « choix » et « contrat » '
        + 'ne sont pas notées (déjà jugées dans la fiche). Le dernier envoi compte.' },
    ...DE_LA_TRAME,
  ],
};
