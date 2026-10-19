// Corrigé d'ENT-10.4 (Transports Pelleau, évaluation « prendre son poste »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/pelleau-ent104-donnees.js`) : le défaut du site (extincteur du quai B ou plan de circulation), le
// défaut de son transpalette n° 1 (un parmi six), ses 3 lieux et les numéros de SON plan (permutation de 1 à 7), ses 2 lectures du planning.
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié).
// N'importe que les données pures : se charge aussi sous Node. Les 4 questions d'« Avant de commencer » tirées et leurs réponses se lisent
// dans le Suivi.

import {
  ID, TIRAGE, SITE, ENGIN, LECTURES, LIEUX_PLAN, CAMIONS, QUAIS, CARTE, HEURE_ARVAG, QUAI_ARVAG, DEFAUTS_SITE, ENGINS, defautSiteDe, defautEnginDe,
  placesJustes, heureLue, minutesDe, lieuxDe, lecturesTirees, planDe, numeroDe, phraseEngin, libRefuse,
} from '../pelleau-ent104-donnees.js';
import { graineDeBase } from '../../core/tirage.js';

const S = SITE;
const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const lecture = (p) => { const L = LECTURES[p.id]; return [L.q, lib(L.choix, L.juste)]; };
const nomQ = (q) => (QUAIS.find((x) => x.id === q) || {}).nom || q;
const places = (d) => placesJustes(d).map(([q, m]) => `${nomQ(q)} à ${heureLue(m)}`).join(', ');

export const CORRIGE = {
  code: 'ENT-10.4',
  titre: 'Transports Pelleau — évaluation : prendre son poste',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Où est-ce ? (2 points)', genre: 'question', texte: 'Le plan de l’entrepôt, numéros TIRÉS par élève (une permutation de 1 à 7)',
      rep: 'Les numéros de chaque élève sont dans son corrigé (ci-dessous, choisir l’élève). Trois lieux tirés parmi six (2/3 de point chacun).',
      note: `Les sept lieux du plan : ${LIEUX_PLAN.map((l) => l.nom).join(', ')} (les quais ne sont jamais demandés).` },
    { etape: 2, etapeTitre: 'Mon poste (6 points, inspection en copie)', genre: 'question', texte: 'Ce qu’il faut faire',
      rep: 'Essayer l’avertisseur du transpalette n° 1. Marquer puis « Signaler à Erwan » : le défaut du site (l’extincteur du quai B ou le plan de '
        + 'circulation, selon l’élève) ET le défaut du transpalette n° 1 (un parmi six, selon l’élève). Ne rien signaler d’autre (le transpalette n° 2 '
        + 'est en ordre). Puis « C’est bon, je prends mon poste ».',
      note: 'Défaut du site 2 · défaut de l’engin 2 · avertisseur essayé 0,5 · aucun faux signalement 1,5. Copie : Erwan répond toujours « C’est noté. », '
        + 'rien ne se répare, aucun arrêt. L’avertisseur muet ne se trouve qu’en l’essayant.' },
    { etape: 3, etapeTitre: 'Ne pas céder (2 points)', genre: 'question', texte: 'Yann presse : « Prends le n° 1, on verra ce soir. »',
      rep: DEFAUTS_SITE.map((d) => `${S[d].lib} → « ${libRefuse(d)} »`).join(' || '),
      note: 'La première réponse dite compte. Les trois autres : « D’accord, je prends le n° 1. » · « Je prends le n° 1, mais je roule doucement. » · '
        + '« Je prends le n° 2 sans le contrôler : il est neuf. »' },
    { etape: 4, etapeTitre: 'Le planning des quais (3 points, le même pour toute la classe)', genre: 'tableau', texte: 'Les camions prévus',
      entetes: ['Quai', 'Camion', 'Heures'],
      reponses: CAMIONS.map((c) => [nomQ(c.quai), c.titre, `${heureLue(minutesDe(c.de))} – ${heureLue(minutesDe(c.a))}`]),
      note: `Lectures (réponse calculée sur la grille, deux tirées : une facile, une moyenne, 1 point chacune) : ${Object.values(LECTURES).map((L) => `${L.q} → ${lib(L.choix, L.juste)}`).join(' · ')}. `
        + `La carte « ${CARTE.titre} » (de 10 h à 12 h, 1 point) : places justes ${places('affichage')} ; quand l’extincteur du quai B manque, seulement `
        + `${places('extincteur')}.` },
    { etape: 5, etapeTitre: 'Rendre compte à Erwan (3 points)', genre: 'question', texte: 'Les phrases justes',
      rep: `Salutation « Bonjour Erwan, » 0,5 · ton engin 0,75 (la phrase de SON défaut : ${ENGINS.map((e) => `${ENGIN[e].desc}`).join(' / ')}) · ce qui manque 0,75 `
        + `(${DEFAUTS_SITE.map((d) => `« ${S[d].phrase} »`).join(' / ')}) · l’heure 0,5 (« La Biscuiterie Ar Vag livre à ${HEURE_ARVAG} au ${QUAI_ARVAG}. ») · fin 0,5.`,
      note: 'La forme (salutation, fin) ne dépasse pas 1 point.' },
    { etape: 6, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (3 de préparation, 1 d’image), sans aide',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Copie rendue : rien ne remonte avant la remise ; le planning envoyé ne rend pas la copie, l’élève la rend par le bandeau. Poids validés par '
        + 'Tristan le 18/10/2026 ; ni bonus ni niveau ; inaction : 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  if (!ouvert) db = { tirage: { graine }, tirages: { [ID]: { graine: `${graine}|${ID}`, ...TIRAGE.tirer(`${graine}|${ID}`) } } };
  const s = defautSiteDe(graine), e = defautEnginDe(graine);
  const items = [
    { genre: 'fait', texte: 'Son défaut du site', rep: S[s].lib },
    { genre: 'fait', texte: 'Son défaut sur le transpalette n° 1', rep: ENGIN[e].lib + (e === 'avertisseur' ? ' (ne se trouve qu’en essayant l’avertisseur)' : '') },
    { genre: 'fait', texte: 'La bonne réplique à Yann', rep: libRefuse(s) },
    { genre: 'fait', texte: 'Numéros du plan (rond du dessin → numéro de l’élève)', rep: planDe(db).map((x, i) => `${i + 1}→${x}`).join(' · ') },
    ...lieuxDe(db).map((p) => ({ genre: 'fait', texte: `Où est-ce ? : ${p.q}`, rep: `n° ${numeroDe(db, p)}` })),
    ...lecturesTirees(db).map((p) => { const [q, r] = lecture(p); return { genre: 'fait', texte: `Lecture : ${q}`, rep: r }; }),
    { genre: 'fait', texte: 'La carte d’Agri-Kerlann', rep: `places justes : ${places(s)}` },
    { genre: 'fait', texte: 'Ses phrases justes', rep: `${phraseEngin(e)} · ${S[s].phrase} · La Biscuiterie Ar Vag livre à ${HEURE_ARVAG} au ${QUAI_ARVAG}.` },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
