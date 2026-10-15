// Corrigé d'ENT-8.2 (Action, ma prise de poste à la réception), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/action-ent82.js`) : ses tâches (« Qui fait quoi ? »), ses lectures du planigramme, son n° de commande
// et ses quantités ; un confirmé reçoit en plus une tâche et une lecture (marquées « bonus »). `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié).

import {
  ID, TIRAGE, LECTURES, EQUIPE_CHOIX, CHOIX_DOCS, LIGNES_DOCS, CASES_AVANT, VISITE, CAMIONS, QUAIS, CARTE, QUAI_HAVRE, HEURE_HAVRE,
  placesJustes, heureLue, tachesDe, tachesBonus, lecturesTirees, lecturesBonus, commandeDe,
} from '../action-ent82.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const parcours = VISITE.etapes.find((e) => e.type === 'parcours').etapes;
const associer = VISITE.etapes.find((e) => e.type === 'associer').photos;
const places = placesJustes().map(([q, m]) => `${(QUAIS.find((x) => x.id === q) || {}).nom} à ${heureLue(m)}`);
const lecture = (p) => { const L = LECTURES[p.id]; return [L.q, lib(L.choix, L.juste)]; };

export const CORRIGE = {
  code: 'ENT-8.2',
  titre: 'Action — ma prise de poste à la réception',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Repérer mon poste (visite, au premier essai)', genre: 'tableau', texte: 'Le tour et les photos à associer',
      entetes: ['N°', 'Endroit', 'Qui travaille là'],
      reponses: parcours.map((p) => [String(p.n), p.titre, p.texte.replace(/<[^>]+>/g, '').replace(/\[\[([^|\]]+)\|?([^\]]*)\]\]/g, (m, a, b) => b || a)]),
      note: `Photos à associer : ${associer.map((ph) => `${ph.id} → n° ${ph.n}`).join(' · ')}. Chaque photo compte à son premier clic (0,75).` },
    { etape: 2, etapeTitre: 'Qui fait quoi ? (tâches tirées)', genre: 'question', texte: 'L’équipe',
      rep: 'Kevin, cariste : décharge au chariot, amène les palettes au stock. Toi, réceptionnaire : vérifie le bon de livraison avec le chauffeur, compte les '
        + 'cartons et regarde leur état. Samia, cheffe d’équipe : répartit le travail, décide de refuser une palette. Julie, agent administratif : tient le '
        + 'planigramme, saisit les réceptions dans le WMS.',
      note: 'Chaque élève reçoit 3 tâches (une facile, une moyenne, une difficile) qui vont à 3 personnes différentes.' },
    { etape: 3, etapeTitre: 'Le planigramme (le même pour toute la classe)', genre: 'tableau', texte: 'Les camions prévus',
      entetes: ['Quai', 'Camion', 'Heures'],
      reponses: CAMIONS.map((c) => [(QUAIS.find((q) => q.id === c.quai) || {}).nom, c.titre, `${c.de} – ${c.a}`]),
      note: `Lectures (réponse calculée sur la grille) : ${Object.values(LECTURES).map((L) => `${L.q} → ${lib(L.choix, L.juste)}`).join(' · ')}. `
        + `La carte « ${CARTE.titre} » (de ${CARTE.des} à ${CARTE.avant}) : places justes ${places.join(', ')} (le jalon juge les règles, pas une place).` },
    { etape: 4, etapeTitre: 'Les documents du camion, avant d’ouvrir', genre: 'question', texte: 'Les réponses',
      rep: `${LIGNES_DOCS.map((l) => `${l.lib} → ${lib(CHOIX_DOCS, l.juste)}`).join(' · ')}. Avant d’ouvrir : ${CASES_AVANT.filter((c) => c.juste).map((c) => c.lib).join(', ')} ; rien d’autre.`,
      note: 'Piège : « la facture » (elle ne voyage pas avec le camion). « Avant d’ouvrir » : tout cocher est faux (rien de trop).' },
    { etape: 5, etapeTitre: 'Rendre compte à Samia', genre: 'question', texte: 'Les phrases justes',
      rep: `Bonjour Samia, · ${QUAI_HAVRE.replace(/^q/, 'Q')} est prêt pour le camion du Havre. · Le camion est attendu à ${HEURE_HAVRE}. · Il manque un transpalette chargé : Kevin a mis celui du ${QUAI_HAVRE} en charge. · Je t’attends au quai. (prénom)`,
      note: 'Contenu (quai, heure, ce qui manque : les trois justes) 1 point ; salutation 0,5 ; fin 0,5.' },
    { etape: 6, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : repérer mon poste 3 (4 photos à 0,75), qui fait quoi 3, le planigramme 4 (2 lectures, le camion sur un quai libre, '
        + 'dans le créneau), les documents 4 (3 documents, avant d’ouvrir), rendre compte 2, questions de Samia 4 (F 1, H 1,5, I 1,5 ; K non notée). '
        + 'Rien n’est vrai avant un envoi ou un premier essai : inaction 0.',
      note: 'Poids validés par Tristan le 15/10/2026. Confirmé : une tâche et une lecture de plus, +0,5 chacune si juste (caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const C = commandeDe(db);
  const items = [
    { genre: 'fait', texte: 'Sa commande (sur ses documents)', rep: `n° ${C.numero} · ${C.N} cartons commandés · ${C.livre} livrés · il en manque ${C.k} (question I)` },
    ...tachesDe(db).map((p) => ({ genre: 'fait', texte: `Tâche : ${p.lib}`, rep: lib(EQUIPE_CHOIX, p.qui) })),
    ...tachesBonus(db).map((p) => ({ genre: 'fait', bonus: true, texte: `Tâche : ${p.lib}`, rep: lib(EQUIPE_CHOIX, p.qui) })),
    ...lecturesTirees(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', texte: `Lecture : ${q}`, rep: r }; }),
    ...lecturesBonus(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', bonus: true, texte: `Lecture : ${q}`, rep: r }; }),
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une tâche et une lecture).', items };
  return { texte: '', items };
}
