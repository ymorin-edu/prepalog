// Corrigé d’ENT-8.10 (Action, évaluation « recevoir un camion dans un nouveau site »), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON site (le même qu’en ENT-8.5 et 8.6, `contenus/action-eval-sites.js`) et SON tirage (`contenus/action-ent810-donnees.js`) :
// 3 situations du protocole, l’anomalie de la scène, la palette à problème, la palette au piège. `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d’un élève, CALCULÉ depuis sa base (jamais recopié). Les 4 questions d’« Avant de commencer » tirées
// et ses réponses se lisent dans le Suivi.

import { MOTIFS } from '../../core/types/quai.js';
import { graineDeBase } from '../../core/tirage.js';
import {
  ID, TIRAGE, PALETTES, OBJETS, JUSTES_DIALOGUE, REPLIQUES, siteEleve, siteDeGraine, equipeDe, situationsDe, texteSituation, texteConsigne,
  anomalieDe, jeuDe, quaiDuJeu, reelDe, quantite, phraseReserves, constatsJeu, ATTENDU,
} from '../action-ent810-donnees.js';

const NOM_ANOMALIE = {
  'ecrase-face': 'cartons écrasés sur la face avant', 'ecrase-cache': 'un carton écrasé sur la face arrière (il faut faire le tour)',
  manquant: 'cartons manquants dans la couche du dessus', 'couche-normale': 'PIÈGE : couche du dessus à moitié vide, mais le BL dit le même nombre',
  conforme: 'conforme, pleine',
};
const DECISION = { reserves: 'accepter avec réserves', accepter: 'accepter' };
const libJuste = (r) => { const R = REPLIQUES.find((x) => x.id === r); return R.choix.find((c) => c.v === JUSTES_DIALOGUE[r]).lib; };

export const CORRIGE = {
  code: 'ENT-8.10',
  titre: 'Action — évaluation : recevoir un camion dans un nouveau site',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Le protocole du quai 3 (3 points)', genre: 'question', texte: 'Trois situations tirées (une facile, une moyenne, une difficile), 1 point chacune',
      rep: 'La consigne du protocole DU SITE qui s’applique au cas (corrigé par élève ci-dessous). Les protocoles d’Onnaing et de Belleville diffèrent par la vitesse, le poste d’urgence, le local chauffeurs et le responsable.' },
    { etape: 2, etapeTitre: 'Accueillir le chauffeur (3 points)', genre: 'question', texte: 'Face à face avec Thomas : la PREMIÈRE réponse compte',
      rep: `Se présenter (0,5) · « ${libJuste('documents')} » (0,75) · « ${libJuste('quai')} » (0,5) · moteur coupé, clés, local chauffeurs (0,75) · « ${libJuste('fin')} » (0,5).` },
    { etape: 3, etapeTitre: 'Avant de décharger et faire décharger (3,5 points)', genre: 'question', texte: 'Inspection sur la scène, puis dépose dirigée',
      rep: 'L’anomalie tirée signalée au cariste avant « C’est bon » (2) ; aucun faux signalement (0,5, faux si rien n’est signalé). Dépose : chaque palette en R1 à R4 au PREMIER clic (0,25 × 4) ; l’allée piétonne et la zone du quai 4 sont fausses.',
      note: 'En évaluation, rien n’arrête l’élève : un défaut oublié est remis en ordre sans un mot. Les réponses du cariste sont neutres (« C’est noté. »).' },
    { etape: 4, etapeTitre: 'Contrôler, réserves, signature (5,5 points)', genre: 'question', texte: 'Quatre palettes : une à problème, une au piège, deux conformes',
      rep: 'Palette à problème : comptage ET décision (2), réserve précise (1). Piège (couche du dessus incomplète, BL au même nombre) : accepter (0,75). Conformes : accepter (0,375 chacune). Pas de « sous réserve de déballage » (0,5). Signature du chauffeur (0,5).' },
    { etape: 5, etapeTitre: 'Rendre compte (1 point)', genre: 'question', texte: 'La ligne « ma réception »',
      rep: 'La phrase des réserves que l’élève a ÉCRITES (juste ou faux) ; aucune réserve : « Tout est conforme, aucune réserve. ». Une erreur ne se paie qu’une fois. Salutation et fin non notées.' },
    { etape: 6, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (3 de préparation, 1 d’image), sans aide, « Le droit » à gauche',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Note par compétence : la même note va à CAP-C1.3 et à CAP-C1.4 (le moteur ne répartit pas). Copie rendue : la clôture du quai ne rend pas la copie, l’élève la rend par le bandeau.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const g = graineDeBase(db) || uid || '';
  if (!ouvert) {
    const gt = `${uid || 'anonyme'}|${ID}`;
    db = { tirage: { graine: g }, tirages: { [ID]: { graine: gt, ...TIRAGE.tirer(gt) } } };
  }
  const S = ouvert ? siteEleve(db) : siteDeGraine(g), Q = equipeDe(S);
  const items = [{ genre: 'fait', texte: 'Site tiré', rep: `${S.site} (${S.prestataire}) — ${Q.tuteur}, ${Q.chef} ; ${Q.cariste}, cariste` }];
  situationsDe(db).forEach((s) => items.push({ genre: 'fait', texte: `Situation (${s.difficulte}) : ${texteSituation(s, S)}`, rep: texteConsigne(s.juste, S) }));
  const a = anomalieDe(g);
  items.push({ genre: 'fait', texte: 'Son anomalie au quai', rep: OBJETS[a].libKo });
  items.push({ genre: 'fait', texte: 'Les cases justes de la dépose', rep: 'R1, R2, R3, R4' });
  const jeu = jeuDe(g), QD = quaiDuJeu(jeu, a, S);
  QD.camions[0].palettes.forEach((p, n) => {
    const t = jeu.palettes[n], m = t.anomalie, [att, motif] = ATTENDU[m];
    const qte = m === 'ecrase-face' || m === 'manquant' ? `${quantite(t)} ` : '';
    items.push({ genre: 'fait', texte: `${p.id} — ${p.nom}`,
      rep: `${qte}${NOM_ANOMALIE[m]} · BL ${p.bl} · réel ${reelDe(t)} · ${DECISION[att]}${att === 'reserves' ? ` (${MOTIFS[motif]}) · réserve : ${quantite(t)}` : ''}` });
  });
  items.push({ genre: 'fait', texte: 'Compte rendu, si les réserves sont justes', rep: phraseReserves(constatsJeu(jeu)) });
  return { texte: ouvert ? '' : `Cet élève n’a pas encore ouvert la séance : voici le site et le tirage qu’il recevra (site : ${S.site}).`, items };
}
// Pour les tests : le camion commun.
export { PALETTES };
