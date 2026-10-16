// Corrigé d'ENT-8.4 (Action, la semaine avant Noël), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/action-ent84-donnees.js`) : ses lieux à repérer, ses tâches, sa lecture du planigramme, ses deux
// questions de documents, son n° de commande et ses quantités ; un confirmé reçoit en plus une tâche et une lecture (marquées « bonus »).
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié).

import {
  ID, TIRAGE, LECTURES, TROUVE, EQUIPE_CHOIX, LIEUX_PLAN, CAMIONS, CARTE, PARTENAIRE, BANQUE_DOCS, placesLibres, heureLue, nomQuai, toMin,
  lieuxDe, tachesDe, tachesBonus, lecturesTirees, lecturesBonus, documentsDe, commandeDe, poseDe, placeEnvoyee, phraseJustePour,
} from '../action-ent84-donnees.js';
import { CHOIX_DOCS, CHOIX_OUVRIR, CHOIX_DABORD, PHRASE_CONFLIT, NOTE_QUAI } from '../action-ent84.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const libres = placesLibres().map(([q, m]) => `${nomQuai(q)} de ${heureLue(m)} à ${heureLue(m + CARTE.duree)}`);
const lecture = (p) => { const L = LECTURES[p.id]; return [L.q, lib(L.choix, L.juste)]; };

export const CORRIGE = {
  code: 'ENT-8.4',
  titre: 'Action — la semaine avant Noël',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Repérer mon poste (plan, lieux tirés)', genre: 'tableau', texte: 'Les numéros du plan (fixes)',
      entetes: ['Lieu', 'N° sur le plan'], reponses: LIEUX_PLAN.map((l) => [l.nom, String(l.n)]),
      note: 'Chaque élève reçoit 4 lieux (un facile, deux moyens, un difficile), 0,625 chacun.' },
    { etape: 2, etapeTitre: 'Qui fait quoi ? (tâches tirées)', genre: 'question', texte: 'L’équipe',
      rep: 'Lucas, cariste : décharge au chariot, amène les palettes au stock. Toi, réceptionnaire : vérifie le bon de livraison, compte les cartons, '
        + 'trie les palettes renvoyées par les magasins. Romain, chef d’équipe : répartit le travail, décide de refuser une palette. Inès, agent '
        + 'administratif : saisit les réceptions dans le WMS, note et change les rendez-vous au planigramme.',
      note: '3 tâches (facile 0,75, moyenne 0,75, difficile 1) qui vont à 3 personnes différentes.' },
    { etape: 3, etapeTitre: 'Le planigramme (le même pour toute la classe)', genre: 'tableau', texte: 'Les camions prévus',
      entetes: ['Quai', 'Camion', 'Heures'],
      reponses: [...CAMIONS.map((c) => [nomQuai(c.quai), c.court, `${c.de} – ${c.a}`]),
        [nomQuai(CARTE.depart.ligne), `${CARTE.court} (erreur de Romain)`, `${CARTE.depart.de} – ${heureLue(toMin(CARTE.depart.de) + CARTE.duree)}`]],
      note: `Lectures (réponse calculée sur la grille) : ${Object.values(LECTURES).map((L) => `${L.q} → ${lib(L.choix, L.juste)}`).join(' · ')}. `
        + `Le camion mal placé : ${lib(TROUVE, CARTE.id)} (il est au ${nomQuai(CARTE.depart.ligne)} en même temps que ${PARTENAIRE.lib}). `
        + `Créneau libre de 1 h 30 avant midi : ${libres.join(', ')} (le jalon juge les règles « quai libre » et « avant midi », pas une place ; `
        + 'le camion laissé à la place de Romain est faux).' },
    { etape: 4, etapeTitre: 'Les documents du camion', genre: 'question', texte: 'Les réponses',
      rep: `${BANQUE_DOCS.map((l) => `${l.lib} → ${lib(CHOIX_DOCS, l.juste)}`).join(' · ')}. Peut-on ouvrir ? → ${CHOIX_OUVRIR.find((c) => c.juste).lib} `
        + `Que fais-tu d’abord ? → ${CHOIX_DABORD.find((c) => c.juste).lib}`,
      note: `Deux questions de documents tirées parmi trois. Piège : « la facture ». La note de Lucas : ${NOTE_QUAI.join(' ')}` },
    { etape: 5, etapeTitre: 'Rendre compte à Romain', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Romain, · ${PHRASE_CONFLIT} · « Je l’ai mis au … de … à … » : le créneau que l’élève a POSÉ (ou « Je ne l’ai pas déplacé. » s’il ne l’a `
        + 'pas bougé) · Je reste à la réception. (prénom)',
      note: 'Ce qui n’allait pas 0,75 ; le nouveau créneau 0,75 (jugé sur la pose de l’élève : rendre compte, c’est dire ce qu’on a fait) ; salutation 0,5 ; fin 0,5.' },
    { etape: 6, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : repérer mon poste 2,5 (4 lieux à 0,625), qui fait quoi 2,5, le planigramme 4,5 (lecture 1, camion '
        + 'trouvé 1,5, camion replacé 2), les documents 4, rendre compte 2,5, questions de Romain 4 (Q 1,5, S 1,5, R 1). Rien n’est vrai avant un envoi : inaction 0.',
      note: 'Poids des blocs validés par Tristan le 15/10/2026. Confirmé : une tâche et une lecture de plus, +0,5 chacune si juste (caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const C = commandeDe(db);
  const place = placeEnvoyee(db);
  const items = [
    { genre: 'fait', texte: 'Sa commande (sur ses documents)', rep: `n° ${C.numero} · ${C.N} cartons commandés · ${C.livre} livrés · il en manque ${C.k} (question S)` },
    ...lieuxDe(db).map((p) => ({ genre: 'fait', texte: `Lieu : ${p.nom}`, rep: `n° ${p.n}` })),
    ...tachesDe(db).map((p) => ({ genre: 'fait', texte: `Tâche : ${p.lib}`, rep: lib(EQUIPE_CHOIX, p.qui) })),
    ...tachesBonus(db).map((p) => ({ genre: 'fait', bonus: true, texte: `Tâche : ${p.lib}`, rep: lib(EQUIPE_CHOIX, p.qui) })),
    ...lecturesTirees(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', texte: `Lecture : ${q}`, rep: r }; }),
    ...lecturesBonus(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', bonus: true, texte: `Lecture : ${q}`, rep: r }; }),
    ...documentsDe(db).map((p) => ({ genre: 'fait', texte: `Document : ${p.lib}`, rep: lib(CHOIX_DOCS, p.juste) })),
  ];
  if (place) items.push({ genre: 'fait', texte: 'Son compte rendu : la phrase juste du nouveau créneau (sur sa pose envoyée)', rep: phraseJustePour(poseDe(place)) });
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une tâche et une lecture).', items };
  return { texte: '', items };
}
