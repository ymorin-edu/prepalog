// Corrigé d'ENT-2.5 (Cdiscount, le compte à rebours — évaluation), montré dans l'onglet « Corrigés »
// de l'enseignant.
//
// Chaque élève a reçu SON allée C (tirage par élève, `contenus/cdiscount-compte-a-rebours.js`) : il
// n'y a pas de corrigé fixe. `CORRIGE` décrit la règle et la structure commune (aucune valeur) ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève — son jeu, l'attendu, ce qu'il a fait jalon
// par jalon — calculé depuis sa base (lue comme au ramassage des copies), jamais recopié. Un élève
// qui n'a pas encore ouvert la séance : son jeu se lit quand même (graine = son identifiant).

import { jeuDe, corrige, ETAPES, MOTIF_REGUL, PLAGES } from '../cdiscount-compte-a-rebours.js';
import { graineDeBase } from '../../core/tirage.js';

const v1 = (n) => String(n).replace('.', ',').replace('-', '−');
const SORTE = { rayon: 'Remettre en rayon (articles réintégrés posés ailleurs)', regul: `Régulariser, motif « ${MOTIF_REGUL} » (manque sans cause)`,
  recompter: 'Demander un recomptage (surplus monté en réserve)' };

export const CORRIGE = {
  code: 'ENT-2.5',
  titre: 'Cdiscount — le compte à rebours (évaluation)',
  trame: '(pas de trame : tout se fait à l’écran et dans le tableur)',
  items: [
    { etape: 1, etapeTitre: 'Une allée par élève', genre: 'question',
      texte: 'Pourquoi pas de corrigé unique ?',
      rep: 'Chaque élève reçoit une allée C tirée pour lui (graine = son identifiant) : quelle référence porte quel écart, les stocks, les écarts, les commandes, les dates et les numéros changent d’un élève à l’autre.',
      note: 'Choisissez un élève ci-dessus pour lire SON corrigé : le jeu reçu, l’attendu et ce qu’il a fait.' },
    { etape: 1, etapeTitre: 'Une allée par élève', genre: 'tableau', texte: 'La structure commune (la même pour tous)',
      contexte: `Six références (C-01-1 à C-03-2), trois sans écart et trois écarts, un de chaque sorte. Écarts tirés : rayon ${PLAGES.rayon.join(' à ')}, régulariser ${PLAGES.regul.join(' à ')}, recompter ${PLAGES.recompter.join(' à ')} (en manque) ; 36 à 44 lignes de préparation ; au moins 2 constats par écart ; taux du périmètre exact entre 2 et 8 %.`,
      entetes: ['Sorte', 'Indice', 'Décision attendue'],
      reponses: [
        ['Rayon', 'Message de la préparatrice : commande annulée, articles réintégrés posés sur l’étagère d’en face', SORTE.rayon],
        ['Régulariser', 'Aucun mouvement, aucun message ; relevé : « recompté deux fois, bacs voisins vérifiés »', SORTE.regul],
        ['Recompter', 'Message du cariste : surplus de la réception monté en réserve, au-dessus de l’emplacement', SORTE.recompter],
      ] },
    { etape: 2, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Onze jalons, note = jalons réussis / 11 × 20, figée à la remise de la copie (ou au ramassage) : Écart en formule, SI, NB.SI (dépôt unique), bonne liste (selon la synthèse déposée), comptage, écarts, rayon, régularisation, recomptage, taux, compte rendu (selon ce que l’élève a réellement régularisé).',
      note: 'Ne rien modifier au tirage pendant l’évaluation : le jeu de chaque élève changerait.' },
  ],
};

export function corrigeEleve(base, uid) {
  const db = base || {};
  const graine = graineDeBase(db) || String(uid || '');
  const jeu = jeuDe(graine);
  const C = corrige(jeu);
  const sorteDe = (r) => Object.keys(jeu.sorte).find((s) => jeu.sorte[s] === r);
  const items = [
    { genre: 'tableau', texte: 'L’allée C reçue par cet élève',
      contexte: `Liste juste : ${C.liste.join(', ')}. Taux d’écart du périmètre exact : ${v1(C.taux)} %. Compte rendu juste : « Régularisé : ${C.regularise} » — « Valeur régularisée : ${v1(C.valeur.toFixed(2))} € ».`,
      entetes: ['Référence', 'Constats', 'Système', 'Relevé', 'Écart', 'Décision attendue'],
      reponses: Object.keys(C.systeme).map((r) => [r, String(C.constats[r]), String(C.systeme[r]), String(C.releve[r]),
        v1(C.releve[r] - C.systeme[r]), sorteDe(r) ? SORTE[sorteDe(r)] : '— (aucun écart)']) },
  ];
  const ouvert = !!(db.volets && Object.keys(db.volets).length);
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici l’allée qu’il recevra.', items };
  const st = ETAPES.map((e) => { let r = { status: 'ko' }; try { r = e.verifier(db); } catch (x) { /* compte faux */ } return [e.titre, r]; });
  const ok = st.filter(([, r]) => r.status === 'ok').length;
  // Note pondérée (règle du 10/10/2026) : la somme des poids des jalons justes, sur 20.
  const points = ETAPES.reduce((s, e, i) => s + (st[i][1].status === 'ok' ? e.poids : 0), 0);
  items.push({ genre: 'tableau', texte: 'Ce qu’il a fait, jalon par jalon', entetes: ['Jalon', 'Détail', ''],
    reponses: st.map(([t, r]) => [t, r.detail || '', r.status === 'ok' ? '✓ juste' : r.status === 'attente' ? '— pas fait' : '✗ faux']) });
  items.push({ genre: 'question', texte: 'Sa note', rep: `${v1(Math.round(points * 10) / 10)} / 20 (${ok} jalons sur ${ETAPES.length})`,
    note: 'La note de la copie est celle enregistrée à la remise ou au ramassage.' });
  return { texte: '', items };
}
