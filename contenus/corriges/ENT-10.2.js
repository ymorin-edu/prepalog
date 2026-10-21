// Corrigé d'ENT-10.2 (Transports Pelleau, mon premier jour dans l'entrepôt neuf), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/pelleau-ent102-donnees.js`) : le défaut du site (extincteur du quai B ou plan de circulation, tiré
// sur sa graine), ses lectures du planning ; un confirmé reçoit en plus une lecture (marquée « bonus »). `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié). N'importe que les données pures : se charge
// aussi sous Node.

import {
  ID, TIRAGE, SITE, CASES_ATTENTE, LECTURES, CAMIONS, QUAIS, CARTE, HEURE_LOIC, QUAI_LOIC, DEFAUTS, defautDe, placesJustes, heureLue,
  lecturesTirees, lecturesBonus, phrasesCompteRendu, minutesDe,
} from '../pelleau-ent102-donnees.js';
import { graineDeBase } from '../../core/tirage.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const lecture = (p) => { const L = LECTURES[p.id]; return [L.q, lib(L.choix, L.juste)]; };
const nomQ = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
const places = (d) => placesJustes(d).map(([q, m]) => `${nomQ(q)} à ${heureLue(m)}`).join(', ');
const justesAttente = (d) => CASES_ATTENTE[d].filter((c) => c.juste).map((c) => c.lib).join(' · ');
const phrasesDe = (d) => {
  // Les phrases justes pour ce défaut : on reconstruit la ligne « ce qui manque » sur une base dont le défaut est `d`.
  const P = phrasesCompteRendu('(prénom)', null);
  return P.lignes.map((l) => (l.id === 'manque' ? SITE[d].phrase : l.choix[l.juste])).join(' · ');
};

export const CORRIGE = {
  code: 'ENT-10.2',
  titre: 'Transports Pelleau — mon premier jour dans l’entrepôt neuf',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Repérer l’entrepôt (visite, au premier essai)', genre: 'question', texte: 'Les photos à associer',
      rep: 'Vestiaire → n° 1 · Zone de réception → n° 3 · Quai → n° 2 · Bureau → n° 6.',
      note: 'Chaque photo compte à son premier clic (0,75). Le tour lui-même ne rapporte rien.' },
    { etape: 2, etapeTitre: 'Mon poste (inspection, au premier essai)', genre: 'question', texte: 'Ce qu’il faut faire',
      rep: 'Essayer l’avertisseur du transpalette n° 1 : cliquer le bouton à la trompe, sous la poignée du timon (il sonne : l’engin est en ordre). Aller voir le quai : marquer ce qui manque (selon l’élève, '
        + 'l’extincteur du quai B ou le plan de circulation), puis « Signaler à Erwan ». Ne rien signaler d’autre (l’engin et l’autre objet du site sont en '
        + 'ordre). Puis « C’est bon, je prends mon poste ».',
      note: 'Défaut signalé avant de prendre le poste 2,5 · avertisseur essayé 1,5 · aucun faux signalement 1,5 (faux sans aucun signal). '
        + 'Un défaut oublié : Erwan arrête l’élève sans nommer le point ; un signalement après l’arrêt ne rapporte pas le jalon.' },
    { etape: 3, etapeTitre: 'En attendant (selon le défaut)', genre: 'question', texte: 'Les deux cases justes, rien d’autre',
      rep: DEFAUTS.map((d) => `${SITE[d].manque} → ${justesAttente(d)}`).join(' || '),
      note: 'Cocher tout est faux (rien de trop). 1,5 point.' },
    { etape: 4, etapeTitre: 'Le planning des quais (le même pour toute la classe)', genre: 'tableau', texte: 'Les camions prévus',
      entetes: ['Quai', 'Camion', 'Heures'],
      reponses: CAMIONS.map((c) => [nomQ(c.quai), c.titre, `${heureLue(minutesDe(c.de))} – ${heureLue(minutesDe(c.a))}`]),
      note: `Lectures (réponse calculée sur la grille) : ${Object.values(LECTURES).map((L) => `${L.q} → ${lib(L.choix, L.juste)}`).join(' · ')}. `
        + `La carte « ${CARTE.titre} » (de 10 h à 12 h) : places justes ${places('affichage')} ; quand l’extincteur du quai B manque, seulement `
        + `${places('extincteur')}.` },
    { etape: 5, etapeTitre: 'Rendre compte à Erwan', genre: 'question', texte: 'Les phrases justes',
      rep: DEFAUTS.map((d) => `${SITE[d].manque} → ${phrasesDe(d)}`).join(' || '),
      note: `Ton engin et ce qui manque 1 point ; l’heure du retour de Loïc (${HEURE_LOIC}, ${QUAI_LOIC}) 1 ; salutation 0,5 ; fin 0,5.` },
    { etape: 6, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : repérer l’entrepôt 3 (4 photos à 0,75), mon poste 7 (défaut signalé 2,5, avertisseur 1,5, aucun faux 1,5, '
        + 'en attendant 1,5), le planning 3 (2 lectures, la carte), rendre compte 3, questions d’Erwan 4 (A 1,5 · B 1 · C 1,5 ; D non notée). '
        + 'Rien n’est vrai avant un envoi, un premier essai ou la prise de poste : inaction 0.',
      note: 'Poids validés par Tristan le 18/10/2026. Confirmé : une lecture de plus, cachée.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  if (!ouvert) db = { tirage: { graine }, tirages: { [ID]: { graine: `${graine}|${ID}`, ...TIRAGE.tirer(`${graine}|${ID}`) } } };
  const d = defautDe(graine);
  const items = [
    { genre: 'fait', texte: 'Son défaut du site', rep: SITE[d].lib },
    { genre: 'fait', texte: 'En attendant : les cases justes', rep: justesAttente(d) },
    ...lecturesTirees(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', texte: `Lecture : ${q}`, rep: r }; }),
    ...lecturesBonus(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', bonus: true, texte: `Lecture : ${q}`, rep: r }; }),
    { genre: 'fait', texte: 'La carte de la Biscuiterie', rep: `places justes : ${places(d)}` },
    { genre: 'fait', texte: 'Ses phrases justes', rep: phrasesDe(d) },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une lecture).', items };
  return { texte: '', items };
}
