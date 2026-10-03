// Corrigé d'ENT-4.3 (Picard, la réception de nuit), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/picard-ent43.js`) : la fiche de Mathis, les
// palettes et les lignes des deux messages. Les « attendus » sont ceux des jalons (`jalonsQuai`), jamais recopiés.

import { QUAI_ENT43, PALETTES_ENT43, FICHE, LIGNES_DIAG, LIGNES_PROT, BL, HEURE } from '../picard-ent43.js';
import { jalonsQuai } from '../../core/types/quai.js';

const attendus = jalonsQuai({}, QUAI_ENT43).L;
const attendu = (id) => (attendus.find((l) => l.id === id) || {}).attendu || '';
const reel = (p) => p.W * p.D * p.L - p.manque.length;
const fiche = (p) => FICHE.find((f) => f.id === p.id) || {};
const t = (v) => `${String(v).replace('.', ',').replace('-', '−')} °C`;
const CE_QUIL_FAUT = {
  N1: 'rien : la couche du dessus est incomplète, mais 44 cartons = BL (fausse piste)',
  N2: 'acceptée à tort : −14 °C à cœur à la réception, au-dessus de −15 °C → à refuser ; aujourd’hui à −21 °C (recongelée) → la bloquer, protester',
  N3: '3 cartons manquants (2 en haut au fond + 1 juste dessous, visible de l’arrière) → protester',
  N4: 'rien', N5: 'rien',
};

export const CORRIGE = {
  code: 'ENT-4.3',
  titre: 'Picard — la réception de nuit',
  trame: '(pas encore de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Contrôler', genre: 'tableau', texte: 'Le dossier de Mathis, palette par palette',
      contexte: `Réception à ${HEURE}, BL ${BL}. La sonde d’aujourd’hui lit environ −21 °C partout : la preuve de N2 est dans la fiche.`,
      entetes: ['Palette', 'Fiche de Mathis', 'Réalité', 'Ce qu’il faut faire'],
      reponses: PALETTES_ENT43.map((p) => [p.id, `${fiche(p).compte} cartons, ${t(fiche(p).temp)}, ${fiche(p).decision}`,
        `${reel(p)} cartons (BL ${p.bl}) (${p.W} × ${p.D} × ${p.L}${p.manque.length ? ` − ${p.manque.length}` : ''}), ${t(p.temp)} aujourd’hui`, CE_QUIL_FAUT[p.id]]) },
    { etape: 1, etapeTitre: 'Contrôler', genre: 'question', texte: 'Le diagnostic envoyé au chef de quai',
      rep: [
        `${LIGNES_DIAG.palette} N2`,
        `${LIGNES_DIAG.preuve} la fiche de Mathis : −14 °C à cœur à la réception (au-dessus de −15 °C : à refuser) ; le ticket montre une remontée jusqu’à −11,1 °C`,
        `${LIGNES_DIAG.manquant} N3, 3 cartons (37 au lieu de 40)`,
        `${LIGNES_DIAG.reserve} « sous réserve de déballage » ne vaut rien`,
        `${LIGNES_DIAG.delai} encore dans le délai (réception cette nuit, 3 jours pour protester)`,
      ].join(' · '),
      note: `Jalons : ${['diag-n2', 'diag-n3', 'diag-deballage', 'diag-delai', 'diag-n1'].map((id) => attendu(id)).join(' / ')}. Lecture sans accents ni majuscules ; N1 accusée dans un seul message suffit à faire tomber son jalon.` },
    { etape: 2, etapeTitre: 'Corriger', genre: 'question', texte: 'Le blocage',
      rep: 'Bloquer N2 (et elle seule) : étiquette « Bloqué — qualité », zone à part. N3 n’est pas bloquée : les cartons présents sont bons.',
      note: '« Aucune palette conforme bloquée » n’est vrai qu’une fois une palette bloquée (l’inaction ne rapporte rien).' },
    { etape: 2, etapeTitre: 'Corriger', genre: 'question', texte: 'La protestation au transporteur (réponse à son avis de livraison)',
      rep: [
        `${LIGNES_PROT.bl} ${BL}`,
        `${LIGNES_PROT.date} la date de la séance (la date du BL à l’écran)`,
        `${LIGNES_PROT.palette} N2 et N3`,
        `${LIGNES_PROT.constat} N2 : température non conforme à la réception (−14 °C à cœur) ; N3 : cartons manquants`,
        `${LIGNES_PROT.quantite} N3 : 3 cartons`,
      ].join(' · '),
      note: 'En vrai : lettre recommandée ou acte d’huissier dans les 3 jours, jours fériés non compris (Code de commerce, art. L133-3).' },
  ],
};
