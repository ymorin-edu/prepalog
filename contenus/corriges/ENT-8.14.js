// Corrigé d'ENT-8.14 (Action, évaluation « ranger et compter dans le site d'évaluation »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON site (le même qu'en ENT-8.5, 8.6 et 8.10, `contenus/action-eval-sites.js`) et SON tirage (`contenus/action-ent814-donnees.js`) : cinq palettes
// (adresses, produits), l'adresse libre de P5, quatre adresses à compter et l'écart (manque ou surplus). `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le
// corrigé d'un élève, CALCULÉ depuis sa graine (jamais recopié). Les quatre questions d'« Avant de commencer » tirées et leurs réponses se lisent dans le Suivi.

import { graineDeBase } from '../../core/tirage.js';
import {
  jeuDe, siteDeGraine, equipeDe, PRODUITS, PLANS, stockDe, chargeStock, plaqueDe, poidsDe, nomSens, CAUSES, causesJustes,
} from '../action-ent814-donnees.js';

const nb = (n) => Number(n).toLocaleString('fr-FR');

export const CORRIGE = {
  code: 'ENT-8.14',
  titre: 'Action — évaluation : ranger et compter dans un nouveau site',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'Repérer les adresses du site (3 points)', genre: 'question', texte: 'P1, P2 au sol ; P3 en réserve : chacune rangée à son adresse (1 point chacune)',
      rep: 'P1 et P2 : poser au sol, à l’adresse de l’étiquette. P3 : confier au cariste (au-dessus du sol, on ne pose pas soi-même), puis le faire monter avant « Valider ». Signaler une de ces palettes à tort : 0 pour elle.' },
    { etape: 2, etapeTitre: 'Ranger et voir la plaque (4 points)', genre: 'question', texte: 'P4 : l’adresse dépasserait la plaque (3 points) ; aucune pose tentée en hauteur (1 point)',
      rep: 'P4 est à SIGNALER : le motif « La charge serait dépassée », depuis son adresse ; elle reste en réception (aucune nouvelle adresse : « C’est noté. »). La poser ou la confier là : 0. Le point « aucune pose en hauteur » exige aussi que toutes les palettes soient traitées (posée, confiée ou signalée).',
      note: 'Le jalon « aucune plaque dépassée » (`charge`) est sans point : le signalement de P4 le dit déjà.' },
    { etape: 3, etapeTitre: 'L’adresse prise (2 points)', genre: 'question', texte: 'P5 : l’adresse donnée est occupée',
      rep: 'Ouvrir l’adresse, voir qu’elle est prise, « Demander une adresse libre », puis ranger P5 À CETTE adresse. La poser à côté sans rien demander, ou la laisser dans l’allée : 0. Personne ne pousse à la poser à côté.' },
    { etape: 4, etapeTitre: 'Scanner (3 points)', genre: 'question', texte: 'P1, P2, P3 et P5 scannées (la palette, puis l’emplacement), 0,75 chacune',
      rep: 'Le scan se juge à l’adresse que le système attend : l’adresse donnée, ou l’adresse libre demandée pour P5. P4 n’a pas de scan (elle ne se range pas). Une palette scannée à côté : refusée par le Terminal, 0.' },
    { etape: 5, etapeTitre: 'Compter à l’aveugle (2 points)', genre: 'question', texte: 'Quatre adresses de la liste « À compter », 0,5 chacune',
      rep: 'Le dernier compte confirmé doit être le nombre de cartons réel. Quand le compte ne colle pas avec le système, le Terminal propose « Recompter ou confirmer ? » (ni de combien, ni dans quel sens) : c’est l’outil, il ne rapporte et ne retire aucun point.' },
    { etape: 6, etapeTitre: 'Signaler l’écart, avec une cause (2 points)', genre: 'question', texte: 'La fiche : une ligne par écart confirmé de l’élève',
      rep: '« Je le signale à mon tuteur » (1 point), et une cause possible juste pour le SENS de l’écart (1 point). Jugé sur SES écarts : un compte faux confirmé sur une adresse conforme ajoute une ligne, jugée comme les autres ; une fiche sans ligne : 0 aux deux.' },
    { etape: 7, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (2 de préparation, 1 d’éco-droit, 1 d’image), sans aide, « Le droit » à gauche',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Note par compétence : la même note va à CAP-C1.5. Copie rendue : « Valider mon rangement », « Terminer le comptage » ne rendent pas la copie, l’élève la rend par le bandeau.' },
  ],
};

export function corrigeEleve(base, uid) {
  const db = base || {};
  const g = graineDeBase(db) || uid || '';
  const S = siteDeGraine(g), Q = equipeDe(S), jeu = jeuDe(g), P = jeu.palettes;
  const nom = (id) => `${id} — ${PRODUITS[P[id].produit].nom}`;
  const items = [{ genre: 'fait', texte: 'Site tiré', rep: `${S.site} (${S.prestataire}) — ${Q.tuteur}, ${Q.chef} ; ${Q.cariste}, cariste ; ${PLANS[S.id].allees.length} allées, plaques ${[2, 3, 4].map((n) => `N${n} ${nb(PLANS[S.id].plaques[n])} kg`).join(', ')}` }];
  items.push({ genre: 'fait', texte: nom('P1'), rep: `au sol, à ${P.P1.adresse} (poser)` });
  items.push({ genre: 'fait', texte: nom('P2'), rep: `au sol, à ${P.P2.adresse} (poser)` });
  const n3 = P.P3.adresse;
  items.push({ genre: 'fait', texte: nom('P3'), rep: `en réserve, à ${n3} : la confier à ${Q.cariste} (niveau ${n3.match(/-N(\d)/)[1]}, plaque ${nb(plaqueDe(S.id, n3))} kg, déjà ${nb(chargeStock(S.id, n3))} kg + ${nb(poidsDe(P.P3.produit))} kg), le faire monter` });
  const n4 = P.P4.adresse;
  items.push({ genre: 'fait', texte: nom('P4'), rep: `À SIGNALER (« La charge serait dépassée ») depuis ${n4} : plaque ${nb(plaqueDe(S.id, n4))} kg, déjà ${nb(chargeStock(S.id, n4))} kg + ${nb(poidsDe(P.P4.produit))} kg = ${nb(chargeStock(S.id, n4) + poidsDe(P.P4.produit))} kg ; ni posée ni confiée là` });
  items.push({ genre: 'fait', texte: nom('P5'), rep: `l’adresse donnée ${P.P5.adresse} est prise (${PRODUITS[stockDe(S.id)[P.P5.adresse].produit].nom}) : demander une adresse libre → ${P.P5.libre}, y ranger P5, scanner` });
  jeu.comptage.forEach((x) => items.push({ genre: 'fait', texte: `À compter n° ${x.rang} : ${x.adresse} (${PRODUITS[x.produit].nom})`,
    rep: `réel ${x.reel} cartons, le système croit ${x.systeme}${x.role === 'ok' ? ' (conforme)' : ` (${nomSens(x.role)} : écart à signaler)`}` }));
  const e = jeu.comptage.find((x) => x.role !== 'ok');
  items.push({ genre: 'fait', texte: 'La fiche « Signaler l’écart »', rep: `ligne de l’adresse n° ${e.rang} (${nomSens(e.role)}) : « je le signale », cause juste parmi ${causesJustes(e.role).map((v) => `« ${CAUSES[e.role].find((c) => c.v === v).lib} »`).join(' ou ')}` });
  return { texte: base && graineDeBase(base) ? '' : `Cet élève n’a pas encore ouvert la séance : voici le site et le tirage qu’il recevra (site : ${S.site}).`, items };
}
