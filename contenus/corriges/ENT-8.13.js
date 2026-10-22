// Corrigé d'ENT-8.13 (Action, la palette d'à côté), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu (`contenus/action-ent813-donnees.js`, graine = son identifiant) : trois produits (P1, P3, P9 de Kevin), les adresses
// données, l'adresse libre de P3, l'endroit où Kevin pose P9 et celui où il pose P3 la nuit si elle est restée en réception. `CORRIGE` donne ce qui
// est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis son jeu (jamais recopié), avec les trois chemins du lendemain et
// les phrases justes de chacun.

import { graineDeBase } from '../../core/tirage.js';
import { PRODUITS, jeuDe, lignesCompte, SALUTATIONS, poidsDe } from '../action-ent813-donnees.js';

const nb = (n) => Number(n).toLocaleString('fr-FR');

export const CORRIGE = {
  code: 'ENT-8.13',
  titre: 'Action — la palette d’à côté',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; cours d’une demi-page de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Fin de poste (Plan de l’entrepôt, un jeudi, 20 h 30)', genre: 'question', texte: 'Le geste attendu',
      rep: 'P1 : poser au sol à son adresse, scanner (la palette, puis l’emplacement) — non notée. P3 : son adresse est prise par une palette « à évacuer '
        + 'cette nuit » ; Kevin écrit « Mets-la à côté, on verra demain » ; le bon geste : « Demander une adresse libre » au Terminal, poser P3 à l’adresse '
        + 'libre, la scanner, puis « Valider mon rangement ».',
      note: 'Adresse libre demandée et P3 rangée là : 2 · P3 scannée à l’adresse libre : 1. Posée à côté sans scan, ou laissée en réception : 0 sur ces 3 '
        + 'points (« ne récompense pas l’inaction »). P1, la charge et « pas de pose en hauteur » sont jugés sans points.' },
    { etape: 2, etapeTitre: 'Le lendemain, 6 h : retrouver la palette', genre: 'question', texte: 'Quelle palette, où',
      rep: 'Yanis écrit l’adresse où le Terminal l’envoie : elle est vide. Si l’élève a demandé l’adresse libre (le système sait où est P3), on cherche P9, '
        + 'la palette que Kevin a posée à côté sans scan. Sinon, on cherche P3 : là où l’élève l’a posée, ou (restée en réception) là où Kevin l’a posée '
        + 'la nuit, dans la même travée. Ouvrir l’adresse vide, puis les emplacements voisins.',
      note: 'Retrouvée (ouverte de près) : 3 · en 4 ouvertures au plus (3 au confirmé) : 1.' },
    { etape: 3, etapeTitre: 'La remettre en ordre au Terminal', genre: 'question', texte: 'Le transfert',
      rep: 'De près, scanner l’étiquette de la palette, puis ouvrir son adresse (libérée la nuit) et scanner l’étiquette de l’emplacement : « Transfert '
        + 'enregistré ». Puis « Valider mon transfert ».',
      note: 'À son adresse : 2 · transfert enregistré (le système la sait là) : 3. Une autre cible est refusée par le Terminal.' },
    { etape: 4, etapeTitre: 'Rendre compte à Samia (phrases calculées sur le chemin)', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Samia, · ce qui s’est passé (selon le chemin, voir le corrigé de l’élève) · Elle était en (là où il l’a trouvée). · Je l’ai transférée '
        + 'en (son adresse) et scannée : le système est à jour. · (prénom)',
      note: 'Ce qui s’est passé 1 · où elle était 1 · ce que j’ai fait 1 (juste s’il dit ce qu’il a VRAIMENT fait : « Je ne l’ai pas trouvée. », « Je '
        + 'l’ai laissée là. ») · le ton 1 (salutation, fin, pas d’accusation : « C’est la faute de Kevin. » ne coûte que ce point).' },
    { etape: 5, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-rupture : le produit manque en rayon, des ventes perdues · q-ou-chercher (au bilan) : autour de l’adresse · q-systeme : il ne sait que ce '
        + 'qu’on a scanné · q-terminal : transféré et scanné · q-a-qui (au bilan) : à la cheffe d’équipe, en disant les faits · q-collegue : non, on suit '
        + 'les consignes de l’employeur (C. trav. L4122-1).',
      note: '0,75 + 0,5 + 0,75 + 0,75 + 0,5 + 0,75 = 4. Total : 16 + 4 = 20 ; un élève piégé le soir : 17 au mieux. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const j = jeuDe(g);
  const nom = (id) => PRODUITS[j.produit[id]].nom;
  const pal = (id) => `${id} — ${nom(id)} (${PRODUITS[j.produit[id]].cartons} cartons, ${nb(poidsDe(j.produit[id]))} kg)`;
  const phr = (ch) => { const L = lignesCompte(ch); return `${SALUTATIONS[0]} · ${L.passe[0]} · ${L.ou[0]} · ${L.fait[0]}`; };
  const items = [
    { genre: 'fait', texte: pal('P1'), rep: `poser en ${j.adresse.P1} et scanner (non notée)` },
    { genre: 'fait', texte: pal('P3'), rep: `adresse donnée ${j.adresse.P3}, prise (à évacuer cette nuit) → demander une adresse libre : ${j.libre} ; poser là et scanner` },
    { genre: 'fait', texte: `${pal('P9')} — la palette de Kevin`, rep: `adresse ${j.adresse.P9} (prise le soir) ; Kevin la pose en ${j.posee}, sans scan` },
    { genre: 'fait', texte: 'Chemin A — adresse libre demandée (le bon geste) : on cherche P9',
      rep: `Yanis : ${j.adresse.P9} vide → P9 en ${j.posee} → transférer vers ${j.adresse.P9}. Phrases : `
        + phr({ chemin: 'kevin', systeme: j.adresse.P9, reelle: j.posee, trouvee: true, vers: j.adresse.P9 }) },
    { genre: 'fait', texte: 'Chemin B — P3 posée à côté sans scan : on cherche P3',
      rep: `Yanis : ${j.adresse.P3} vide → P3 là où l’élève l’a posée → transférer vers ${j.adresse.P3}. Phrases (posée en ${j.allee}, par exemple) : `
        + phr({ chemin: 'posee', systeme: j.adresse.P3, reelle: j.allee, trouvee: true, vers: j.adresse.P3 }) },
    { genre: 'fait', texte: 'Chemin C — P3 laissée en réception : Kevin la pose la nuit, on cherche P3',
      rep: `Yanis : ${j.adresse.P3} vide → P3 en ${j.allee} → transférer vers ${j.adresse.P3}. Phrases : `
        + phr({ chemin: 'reception', systeme: j.adresse.P3, reelle: j.allee, trouvee: true, vers: j.adresse.P3 }) },
  ];
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
