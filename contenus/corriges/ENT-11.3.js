// Corrigé d'ENT-11.3 (Mondial Relay, évaluation « la ligne de tri »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON quai (deux défauts parmi cinq), SA série de 16 colis et SON horaire de nuit (graine = l'identifiant de l'élève).
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis la graine (jamais recopié) : le bon tri
// de chaque colis vient de `bonTriColis` (la banque de colis, le plan de tri et les règles), pas d'une table écrite.

import { MOTIFS_TRI } from '../../core/types/tri.js';
import { graineDeBase } from '../../core/tirage.js';
import { POIDS, OBJETS, dangersDe, triDe, SECONDES, NB_COLIS } from '../mondial-relay-ent113.js';
import { bonTriColis, SORTIES } from '../mondial-relay-colis.js';
import { horaireDe } from '../questions/ENT-11.3.js';

const NOM_SORTIE = Object.fromEntries(SORTIES.map((s) => [s.id, `${s.id} ${s.nom}`]));
const bonTexte = (c) => { const b = bonTriColis(c); return b.s === 'ecart' ? `à l’écart : ${MOTIFS_TRI[b.motif]}` : NOM_SORTIE[b.s]; };

export const CORRIGE = {
  code: 'ENT-11.3',
  titre: 'Mondial Relay — évaluation : la ligne de tri',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (2 sur le tri, 2 sur la sécurité), sans aide',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Banque : l’étiquette, les 32 kg, la somme des côtés, le code postal (tri) ; avant d’entrer dans la remorque, le protocole, le droit de retrait, la cale, le tapis bloqué (sécurité).' },
    { etape: 2, etapeTitre: 'Le quai : avant de décharger (4 points)', genre: 'question', texte: 'La navette de Reims : deux défauts parmi cinq objets, rien ne dit lesquels',
      rep: `Danger n° 1 signalé avant « C’est bon » (${POIDS['securite-1']}) · danger n° 2 (${POIDS['securite-2']}) · aucun faux signalement (${POIDS['securite-aucun-faux']}, faux si rien n’est signalé).`,
      note: 'Cinq objets : cabine (moteur allumé), cale, butoirs, niveleur, lampe. Un défaut jamais signalé est remis en ordre sans un mot au déchargement : le jalon reste faux. Rien n’est vrai par inaction. Le clavier n’est pas pris en charge sur la scène.' },
    { etape: 3, etapeTitre: 'La ligne de tri (11 points)', genre: 'question', texte: `Une série de ${NB_COLIS} colis tirés, ${SECONDES} s par colis (37 s avec le tiers-temps)`,
      rep: `Colis en règle bien triés (${POIDS.communes}) · communes qui se ressemblent (${POIDS.pieges}) · écarts avec le bon motif (${POIDS.ecarts}) · aucun faux écart, aucun colis oublié (${POIDS.fauxEcarts}).`,
      note: 'Trois écarts de motifs différents, trois pièges, le colis d’Inès (carton enfoncé mais fermé : il part en T3). Une série laissée passer vaut 0 partout. Aucun retour pendant la série.' },
    { etape: 4, etapeTitre: 'Les questions au fil (1 point)', genre: 'question', texte: 'Trois questions de Romain, corrigées au bilan seulement',
      rep: 'Que devient un colis écarté (expertise) · un colis dans la mauvaise sortie (prévenir le chef d’équipe) · le travail de nuit (oui, sur l’horaire tiré). Un tiers de point chacune.',
      note: 'Éco-droit : l’article L3122-2 est cité dans l’énoncé. Les textes R4515-4 et L4131-1 (« Le droit : sécurité ») sont à relire sur Légifrance avant ouverture aux élèves.' },
  ],
};

export function corrigeEleve(base, uid) {
  const db = base || {};
  const vue = !!(db.tirage && db.tirage.graine);
  const g = graineDeBase(db) || uid || '';
  const D = triDe(g);
  const items = [];
  items.push({ genre: 'fait', texte: 'Les deux défauts du quai (à signaler avant « C’est bon »)', rep: dangersDe(g).map((o) => OBJETS[o].libKo).join(' · ') });
  items.push({ genre: 'fait', texte: 'Les trois objets en ordre (à ne pas signaler)', rep: Object.keys(OBJETS).filter((o) => !dangersDe(g).includes(o)).map((o) => OBJETS[o].libOk).join(' · ') });
  D.series[0].colis.forEach((c, k) => items.push({ genre: 'fait', texte: `Colis ${k + 1} — ${c.n} · ${c.commune} · ${String(c.kg).replace('.', ',')} kg · ${c.dim.join(' × ')} cm${c.etat === 'ouvert' ? ' · carton ouvert' : c.etat === 'floue' ? ' · étiquette illisible' : c.etat === 'enfonce' ? ' · coin enfoncé, carton fermé' : ''}${c.piege ? ' (piège)' : ''}`,
    rep: bonTexte(c) }));
  const h = horaireDe(g);
  items.push({ genre: 'fait', texte: 'Son horaire de nuit (question d’éco-droit)', rep: `de ${h.debut} h à ${h.fin} h : du travail de nuit` });
  return { texte: vue ? '' : `Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.`, items };
}
