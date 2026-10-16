// Corrigé d’ENT-8.6 (Action, évaluation « ma prise de poste dans un nouveau site »), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON site (le même qu’en ENT-8.5, `contenus/action-eval-sites.js`) et SON tirage (`contenus/action-ent86-donnees.js`) :
// les numéros du plan, ses 4 lieux, ses 3 tâches, ses 2 lectures, ses 2 questions « Quel document dit… ? », la commande (N, k), la note du
// quai. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d’un élève, calculé depuis sa base (jamais recopié).
// Les 4 questions d’« Avant de commencer » tirées et ses réponses se lisent dans le Suivi.

import {
  ID, TIRAGE, CAMIONS, CARTE, LECTURES, NOTES, CHOIX_OUVRIR, CHOIX_DOCS, BANQUE_DOCS, siteEleve, equipeDe, choixEquipe, quiDe, planDe, numeroDe,
  lieuxDe, tachesDe, lecturesTirees, documentsDe, noteDe, commandeDe, choixDabord, placesLibres, minQuai, heureLue, nombre, PHRASES_QUAI,
} from '../action-ent86-donnees.js';
import { siteDe, SITES } from '../action-eval-sites.js';

const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const lectureJuste = (id) => { const L = LECTURES[id]; return libDe(L.choix, L.juste); };
const places = placesLibres().map(([r, m]) => `${minQuai(r)} à ${heureLue(m)}`).join(' · ');

export const CORRIGE = {
  code: 'ENT-8.6',
  titre: 'Action — évaluation : ma prise de poste dans un nouveau site',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Repérer mon poste (2,5 points)', genre: 'question', texte: 'Le plan de Labastide (ENT-8.4), numéros TIRÉS par élève (une permutation de 1 à 8)',
      rep: 'Les numéros de chaque élève sont dans son corrigé (ci-dessous, choisir l’élève). 0,625 par lieu (4 lieux tirés : 1 facile, 2 moyens, 1 difficile).' },
    { etape: 2, etapeTitre: 'Qui fait quoi ? (2,5 points)', genre: 'question', texte: 'Les tâches de la banque d’ENT-8.4, trois tirées (facile 0,75, moyenne 0,75, difficile 1), trois personnes différentes',
      rep: 'Le chef d’équipe (Karim ou Sandrine) : répartir le travail, refuser une palette abîmée ; le cariste (Léo ou Hugo) : décharger, amener au stock ; '
        + 'l’agent administratif (Manon ou Chloé) : saisir au WMS, noter ou changer un rendez-vous ; toi : bon de livraison, compter, trier les retours.' },
    { etape: 3, etapeTitre: 'Le planigramme (4 points)', genre: 'tableau', texte: 'Les lectures (deux tirées : une facile, une moyenne, 1 point chacune)',
      entetes: ['Question', 'Réponse'],
      reponses: Object.values(LECTURES).map((L) => [L.q, libDe(L.choix, L.juste)]),
      note: `Le camion « ${CARTE.titre} » (2 points) : juste sur un quai libre, entre 9 h et midi. Places justes : ${places}. Non posé = faux.` },
    { etape: 4, etapeTitre: 'Les documents du camion (4 points)', genre: 'tableau', texte: 'La note du quai, tirée par élève',
      entetes: ['Note', 'Peut-on ouvrir ?', 'Que fais-tu d’abord ?'],
      reponses: NOTES.map((n) => [n.lignes.join(' / '), libDe(CHOIX_OUVRIR, n.ouvrir), libDe(choixDabord('le cariste'), n.dabord)]),
      note: `« Quel document dit… ? » : ${BANQUE_DOCS.map((d) => `${d.lib} → ${libDe(CHOIX_DOCS, d.juste)}`).join(' ; ')} (0,75 chacune). `
        + '« Combien de cartons manquent ? » : k = commandé − livré (1 point). Peut-on ouvrir : 1 ; que fais-tu d’abord : 0,5.' },
    { etape: 5, etapeTitre: 'Rendre compte (3 points)', genre: 'question', texte: 'Le message au tuteur, par phrases',
      rep: 'Salutation 0,5 · le créneau 1 (la phrase de ce que l’élève a POSÉ, juste ou faux ; non posé : « Je ne l’ai pas placé. ») · le quai 2 0,5 '
        + `(la phrase de sa réponse à « Peut-on ouvrir ? » ; « je n’ai pas mes EPI » ou rien : celle de la note) · ce qui manque 0,5 (la phrase de sa réponse ; `
        + 'un autre nombre : k) · fin 0,5. Une erreur ne se paie qu’une fois.',
      note: `Phrases du quai 2 : ${PHRASES_QUAI.join(' · ')}` },
    { etape: 6, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (3 de préparation, 1 d’image), sans aide, « Le droit » à gauche',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Copie rendue : rien ne remonte avant la remise ; le planning envoyé ne rend pas la copie, l’élève la rend par le bandeau.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) {
    const g = `${uid || 'anonyme'}|${ID}`;
    db = { tirages: { [ID]: { graine: g, ...TIRAGE.tirer(g) } } };
  }
  const S = siteEleve(db), Q = equipeDe(S), C = commandeDe(db), N = noteDe(db);
  const eq = choixEquipe(Q);
  const items = [{ genre: 'fait', texte: 'Site tiré', rep: `${S.site} (${S.prestataire}) — ${Q.tuteur}, ${Q.chef} ; ${Q.cariste}, cariste ; ${Q.agent}, agent administratif` }];
  items.push({ genre: 'fait', texte: 'Numéros du plan (rond d’ENT-8.4 → numéro de l’élève)', rep: planDe(db).map((x, i) => `${i + 1}→${x}`).join(' · ') });
  lieuxDe(db).forEach((p) => items.push({ genre: 'fait', texte: `Repérer : ${p.nom}`, rep: `n° ${numeroDe(db, p)}` }));
  tachesDe(db).forEach((p) => items.push({ genre: 'fait', texte: `Qui fait quoi ? : ${p.lib}`, rep: libDe(eq, quiDe(p)) }));
  lecturesTirees(db).forEach((p) => items.push({ genre: 'fait', texte: `Planigramme : ${LECTURES[p.id].q}`, rep: lectureJuste(p.id) }));
  documentsDe(db).forEach((p) => items.push({ genre: 'fait', texte: `Documents : ${p.lib}`, rep: libDe(CHOIX_DOCS, p.juste) }));
  items.push({ genre: 'fait', texte: `Commande : ${nombre(C.N)} cartons commandés, ${nombre(C.livre)} livrés`, rep: `il manque ${nombre(C.k)} cartons` });
  items.push({ genre: 'fait', texte: `Note du quai : ${N.lignes.join(' / ')}`,
    rep: `${libDe(CHOIX_OUVRIR, N.ouvrir)} — d’abord : ${libDe(choixDabord(Q.cariste), N.dabord)} — compte rendu : « ${N.phrase} »` });
  if (!ouvert) {
    const nom = (SITES[siteDe(uid)] || SITES.onnaing).site;
    return { texte: `Cet élève n’a pas encore ouvert la séance : voici le site et le tirage qu’il recevra (site : ${nom}).`, items };
  }
  return { texte: '', items };
}
// Pour les tests : la grille commune.
export { CAMIONS };
