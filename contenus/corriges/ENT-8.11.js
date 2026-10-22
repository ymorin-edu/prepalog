// Corrigé d'ENT-8.11 (Action, ranger à la bonne adresse), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu (`contenus/action-ent811-donnees.js`, graine = son identifiant) : l'adresse de la fiche, six palettes de produits
// différents (P1, P2 au sol ; P3, P4 pour Kevin ; P5 à signaler, nouvelle adresse en N2 à confier ; P6 au confirmé seulement) et leurs adresses.
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié) : poids des
// palettes, charge du niveau, ce que dit la plaque.

import { graineDeBase } from '../../core/tirage.js';
import {
  PRODUITS, CODES, PLAQUES, SEUIL_LOURDE, BANQUE_ADRESSES, jeuDe, poidsDe, chargeStock, plaqueDe, decoupe, lignesFiche, adresseFiche, demande,
} from '../action-ent811-donnees.js';

const nb = (n) => Number(n).toLocaleString('fr-FR');
const kg = (n) => `${nb(n)} kg`;

export const CORRIGE = {
  code: 'ENT-8.11',
  titre: 'Action — ranger à la bonne adresse',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Lire une adresse (fiche, adresse tirée parmi 8)', genre: 'question', texte: 'Les trois lignes',
      rep: 'B2 : l’allée B, côté 2 · T03 : la 3e travée de l’allée · N2 : le 2e niveau, au-dessus du sol (exemple de B2-T03-N2-E1 ; la fiche de chaque élève suit SON adresse).',
      note: `1 point par ligne. Banque : ${BANQUE_ADRESSES.join(', ')} (niveau, travée et emplacement toujours différents).` },
    { etape: 2, etapeTitre: 'Les produits (colisage construit)', genre: 'tableau', texte: 'Une palette = un produit ; poids = cartons × kg + 25 kg de palette',
      entetes: ['Produit', 'Cartons', 'kg / carton', 'Poids de la palette'],
      reponses: CODES.map((k) => [PRODUITS[k].nom, String(PRODUITS[k].cartons), nb(PRODUITS[k].kg), kg(poidsDe(k))]),
      note: `Lourde : ${nb(SEUIL_LOURDE)} kg ou plus (lessive, nettoyant, croquettes). Plaques de charge : N2 ${kg(PLAQUES[2])}, N3 ${kg(PLAQUES[3])}, N4 ${kg(PLAQUES[4])} ; le sol n’en a pas.` },
    { etape: 3, etapeTitre: 'Ranger (Plan de l’entrepôt)', genre: 'question', texte: 'Le geste attendu',
      rep: 'P1 et P2 : poser au sol à leur adresse · P3 et P4 : confier à Kevin à leur adresse · P5 : signaler « la charge serait dépassée » depuis son '
        + 'adresse, puis la confier à la nouvelle adresse donnée par le Terminal · chaque palette scannée (la palette, puis l’emplacement) · « Faire monter '
        + 'les palettes », répondre à Kevin, puis « Valider mon rangement ».',
      note: 'Ranger au niveau 1 : 2 + 2 · plaque de charge : P5 signalée 2, aucune plaque dépassée 1 (compté seulement si toutes les palettes sont traitées) · '
        + 'passer la main à Kevin : 1 + 1 (confiées ET montées avant « Valider ») · scanner : 0,6 × 5. Signaler à tort une palette : son point « rangée » est perdu. '
        + 'Une tentative de pose en hauteur est refusée et notée en trace, sans point perdu.' },
    { etape: 4, etapeTitre: 'Répondre à Kevin (phrases)', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Kevin, · peux-tu monter (les palettes confiées, avec leurs adresses) ? · Merci ! · (prénom)',
      note: 'Salutation et politesse justes : 1 point. La ligne de la demande est calculée sur ce que l’élève a confié et n’est pas notée à part.' },
    { etape: 5, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-adresse : le niveau (le chiffre après N) · q-plaque (corrigée au bilan) : non, ça dépasserait la plaque · q-kevin : un autre chariot et une '
        + 'autorisation de conduite · q-sans-scan : à l’adresse qu’il avait donnée, ou nulle part · q-materiel : Geodis, prestataire, fournit l’équipe, '
        + 'Action le matériel · q-securite : l’employeur organise, chacun fait attention (C. trav. L4121-1 et L4122-1).',
      note: '0,75 + 0,75 + 0,5 + 0,75 + 0,75 + 0,5 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const fiche = adresseFiche({ tirage: { graine: g } });
  const items = [{ genre: 'fait', texte: `La fiche : ${fiche}`,
    rep: lignesFiche(fiche).map((l) => `${l.lib.replace(' : c’est…', '')} → ${l.choix.find((c) => c.v === l.juste).lib}`).join(' · ') }];
  const ligne = (id, quoi, ou = 'en') => {
    const k = jeu.produit[id], a = jeu.adresse[id], d = decoupe(a);
    const charge = d.n > 1 ? ` · niveau : ${kg(chargeStock(a))} déjà posés, plaque ${kg(plaqueDe(a))}, avec la palette ${kg(chargeStock(a) + poidsDe(k))}` : ' · au sol, pas de plaque';
    return { genre: 'fait', texte: `${id} — ${PRODUITS[k].nom} (${PRODUITS[k].cartons} cartons, ${kg(poidsDe(k))})`, rep: `${quoi} ${ou} ${a}${charge}` };
  };
  items.push(ligne('P1', 'poser'), ligne('P2', 'poser'), ligne('P3', 'confier à Kevin'), ligne('P4', 'confier à Kevin'));
  const p5 = ligne('P5', 'SIGNALER « la charge serait dépassée »', 'depuis');
  const n = jeu.nouvelle;
  p5.rep += ` → nouvelle adresse ${n} (niveau : ${kg(chargeStock(n))} + ${kg(poidsDe(jeu.produit.P5))} = ${kg(chargeStock(n) + poidsDe(jeu.produit.P5))}, plaque ${kg(plaqueDe(n))}) : la confier à Kevin`;
  items.push(p5);
  const p6 = ligne('P6', 'confier à Kevin');
  p6.texte += ' — confirmé seulement (bonus)';
  items.push(p6);
  items.push({ genre: 'fait', texte: 'La demande à Kevin (parcours juste, standard)',
    rep: demande([{ id: 'P3', adresse: jeu.adresse.P3 }, { id: 'P4', adresse: jeu.adresse.P4 }, { id: 'P5', adresse: n }]) });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
