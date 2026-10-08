// Entraînement « Arrondis et pourcentages » — 20 générateurs.
//
// Les générateurs ne sont PAS recopiés : ils ont été extraits par programme du fichier
// source de la Suite Logistique (`ARRONDIS_TEMPLATES`) et déposés ici tels quels. Ils calculent la
// bonne réponse à chaque tirage au lieu de la porter en dur : aucun corrigé à transporter.
//
// Les outils sont importés sous leur nom d'origine pour que le corps des générateurs
// n'ait eu besoin d'aucune retouche.
// Corrections apportées à la Suite (trouvées par l'énumération de 4 000 tirages par
// générateur) :
//  - arrondi au centième (n° 4) : en flottants, 2,425 donnait 2,42 au lieu de 2,43 — la BONNE
//    réponse affichée était fausse. Le résultat est maintenant calculé en entiers.
//  - cinq autres générateurs (n° 9, 10, 12, 17, 20) perdaient un distracteur ; remplacé.

import { tirer as randPick, entier as randInt, nombreFR as fmtFR, question as buildQuestion } from '../core/quiz.js';

// Outil local de la Suite, repris à l'identique.
function roundToDecimals(n, dec) {
  const f = Math.pow(10, dec);
  return Math.round(n * f) / f;
}

export const TITRE = "Arrondis et pourcentages";

export const RAPPEL = [
  "Pour arrondir, on regarde le chiffre juste après la position voulue : s'il est inférieur à 5, on ne change rien ; s'il est égal ou supérieur à 5, on augmente le chiffre précédent de 1.",
  "Calculer X % d'un nombre N : N × X ÷ 100.",
  "Augmentation de X % : nouvelle valeur = ancienne valeur × (1 + X/100). Diminution de X % : ancienne valeur × (1 − X/100)."
];

export const GENERATEURS = [
  () => { // arrondi unité, chiffre < 5
    const entier = randInt(5, 90);
    const dec = randPick([1,2,3,4]);
    const n = entier + dec/10;
    return buildQuestion(
      `Arrondir ${fmtFR(n,1)} à l'unité près.`,
      `${entier}`,
      [`${entier+1}`, `${fmtFR(n,1)}`, `${entier-1}`],
      `Le chiffre après la virgule (${dec}) est inférieur à 5 : on garde ${entier}.`
    );
  },
  () => { // arrondi unité, chiffre >= 5
    const entier = randInt(5, 90);
    const dec = randPick([5,6,7,8,9]);
    const n = entier + dec/10;
    return buildQuestion(
      `Arrondir ${fmtFR(n,1)} à l'unité près.`,
      `${entier+1}`,
      [`${entier}`, `${fmtFR(n,1)}`, `${entier+2}`],
      `Le chiffre après la virgule (${dec}) est ≥ 5 : on arrondit à ${entier+1}.`
    );
  },
  () => { // arrondi dixieme, chiffre centieme < 5
    const base = randInt(10, 90);
    const d1 = randPick([1,2,3,4,6,7]);
    const d2 = randPick([1,2,3,4]);
    const n = base + d1/10 + d2/100;
    const res = base + d1/10;
    return buildQuestion(
      `Arrondir ${fmtFR(n,2)} au dixième près.`,
      `${fmtFR(res,1)}`,
      [`${fmtFR(res+0.1,1)}`, `${fmtFR(n,2)}`, `${fmtFR(res-0.1,1)}`],
      `Le chiffre après le dixième (${d2}) est < 5 : on garde ${fmtFR(res,1)}.`
    );
  },
  () => { // arrondi centieme, chiffre millieme >= 5
    const base = randInt(1, 9);
    const d1 = randPick([1,2,3,4,5,6]);
    const d2 = randPick([1,2,3,4,6,7]);
    const d3 = randPick([5,6,7,8,9]);
    const n = base + d1/10 + d2/100 + d3/1000;
    const res = roundToDecimals(base + d1/10 + d2/100 + 0.001*10, 2); // s'assure de l'arrondi correct
    // Calcul en entiers : n*100 en flottants tombe sous la demi-valeur (2,425 → 242,4999…)
    // et donnerait 2,42 au lieu de 2,43. Le chiffre des millièmes est ≥ 5 : on monte d'un centième.
    const correctVal = (base*100 + d1*10 + d2 + 1) / 100;
    return buildQuestion(
      `Arrondir ${fmtFR(n,3)} au centième près.`,
      `${fmtFR(correctVal,2)}`,
      [`${fmtFR(base + d1/10 + d2/100,2)}`, `${fmtFR(correctVal+0.1,2)}`, `${fmtFR(correctVal-0.1,2)}`],
      `Le chiffre après le centième (${d3}) est ≥ 5 : on arrondit à ${fmtFR(correctVal,2)}.`
    );
  },
  () => { // arrondi dizaine
    const dizaine = randInt(10, 80) * 10;
    const unite = randPick([1,2,3,4,6,7,8,9]);
    const n = dizaine + unite;
    const roundDown = dizaine;
    const roundUp = dizaine + 10;
    const res = unite >= 5 ? roundUp : roundDown;
    const autreArrondi = unite >= 5 ? roundDown : roundUp;
    return buildQuestion(
      `Arrondir ${fmtFR(n)} à la dizaine la plus proche.`,
      `${fmtFR(res)}`,
      [`${fmtFR(autreArrondi)}`, `${fmtFR(n)}`, `${fmtFR(dizaine+20)}`],
      `Le chiffre des unités (${unite}) est ${unite>=5 ? "≥ 5" : "< 5"} : on arrondit à ${fmtFR(res)}.`
    );
  },
  () => { // pourcentage simple
    const base = randPick([50,80,120,150,200,250,300]);
    const pct = randPick([10,15,20,25,30,40]);
    const res = base * pct / 100;
    return buildQuestion(
      `Quel est ${pct} % de ${fmtFR(base)} ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+5)}`, `${fmtFR(res-5)}`, `${fmtFR(base-res)}`],
      `${fmtFR(base)} × ${pct} ÷ 100 = ${fmtFR(res)}.`
    );
  },
  () => { // pourcentage simple 2
    const base = randPick([40,60,90,140,180,220]);
    const pct = randPick([5,10,15,20,25]);
    const res = base * pct / 100;
    return buildQuestion(
      `Quel est ${pct} % de ${fmtFR(base)} ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+3)}`, `${fmtFR(res-3)}`, `${fmtFR(base-pct)}`],
      `${fmtFR(base)} × ${pct} ÷ 100 = ${fmtFR(res)}.`
    );
  },
  () => { // remise
    const prix = randPick([30,40,50,60,80,100]);
    const remise = randPick([5,10,15,20]);
    const res = prix * (1 - remise/100);
    const montantRemise = prix * remise / 100;
    return buildQuestion(
      `Un produit coûte ${fmtFR(prix)} € avec une remise de ${remise} %. Quel est le nouveau prix ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(montantRemise)} €`, `${fmtFR(res+5)} €`, `${fmtFR(res-5)} €`],
      `${fmtFR(prix)} × (1 − ${remise}/100) = ${fmtFR(res)} €.`
    );
  },
  () => { // augmentation stock
    const stock = randPick([120,160,200,240,280]);
    const hausse = randPick([10,15,20,25,30]);
    const res = stock * (1 + hausse/100);
    return buildQuestion(
      `Un stock de ${fmtFR(stock)} unités augmente de ${hausse} %. Quel est le nouveau stock ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(stock * hausse / 100)}`, `${fmtFR(res+10)}`, `${fmtFR(res-10)}`],
      `${fmtFR(stock)} × (1 + ${hausse}/100) = ${fmtFR(res)}.`
    );
  },
  () => { // taux de casse
    const total = randPick([200,300,400,500,600]);
    const casse = randPick([10,15,20,25,30]);
    const pct = casse / total * 100;
    return buildQuestion(
      `Sur ${fmtFR(total)} colis expédiés, ${casse} sont arrivés endommagés. Quel est le taux de casse ?`,
      `${fmtFR(pct,1)} %`,
      [`${fmtFR(pct+2,1)} %`, `${fmtFR(pct-2,1)} %`, `${fmtFR(casse/total,2)} %`],
      `${casse} ÷ ${fmtFR(total)} × 100 = ${fmtFR(pct,1)} %.`
    );
  },
  () => { // taux de remplissage
    const capacite = randPick([400,500,600,800]);
    const occupe = randPick([0.6,0.65,0.7,0.75,0.8,0.85]);
    const contenu = capacite * occupe;
    const pct = occupe * 100;
    return buildQuestion(
      `Un entrepôt de ${fmtFR(capacite)} palettes en contient actuellement ${fmtFR(contenu)}. Quel est le taux de remplissage ?`,
      `${fmtFR(pct)} %`,
      [`${fmtFR(pct+5)} %`, `${fmtFR(pct-5)} %`, `${fmtFR(contenu/10)} %`],
      `${fmtFR(contenu)} ÷ ${fmtFR(capacite)} = ${fmtFR(pct)} %.`
    );
  },
  () => { // erreur commande
    const total = randPick([80,100,120,150,200]);
    const pct = randPick([2,4,5,6,8]);
    const res = total * pct / 100;
    return buildQuestion(
      `Une commande de ${fmtFR(total)} articles a un taux d'erreur de ${pct} %. Combien d'articles sont concernés ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+2)}`, `${fmtFR(res-1)}`, `${fmtFR(total-res)}`],
      `${fmtFR(total)} × ${pct} ÷ 100 = ${fmtFR(res)}.`
    );
  },
  () => { // augmentation salaire/tarif
    const base = randPick([1500,1800,2000,2200,2500]);
    const hausse = randPick([2,3,4,5]);
    const res = base * (1 + hausse/100);
    return buildQuestion(
      `Un montant de ${fmtFR(base)} € augmente de ${hausse} %. Quel est le nouveau montant ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(base+hausse)} €`, `${fmtFR(res+20)} €`, `${fmtFR(res-20)} €`],
      `${fmtFR(base)} × 1,${hausse<10?"0"+hausse:hausse} = ${fmtFR(res)} €.`
    );
  },
  () => { // arrondi centaine
    const centaine = randInt(5, 40) * 100;
    const dizaine = randPick([10,20,30,40,60,70,80,90]);
    const n = centaine + dizaine;
    const roundDown = centaine;
    const roundUp = centaine + 100;
    const res = dizaine >= 50 ? roundUp : roundDown;
    const autreArrondi = dizaine >= 50 ? roundDown : roundUp;
    return buildQuestion(
      `Arrondir ${fmtFR(n)} à la centaine la plus proche.`,
      `${fmtFR(res)}`,
      [`${fmtFR(autreArrondi)}`, `${fmtFR(n)}`, `${fmtFR(centaine+200)}`],
      `Le chiffre des dizaines (${dizaine/10}) est ${dizaine>=50?"≥ 5":"< 5"} : on arrondit à ${fmtFR(res)}.`
    );
  },
  () => { // arrondi euro
    const prix = randPick([59.99, 69.99, 89.99, 99.99, 19.99, 29.99, 49.99]);
    const res = Math.round(prix);
    return buildQuestion(
      `Un prix de ${fmtFR(prix,2)} € est arrondi à l'euro. Quel est le résultat ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(res-1)} €`, `${fmtFR(prix,2)} €`, `${fmtFR(res+1)} €`],
      `La partie décimale est ≥ 0,50 : on arrondit à ${fmtFR(res)} €.`
    );
  },
  () => { // poids emballage
    const poids = randPick([500,800,1000,1200,1500]);
    const pct = randPick([4,6,8,10,12]);
    const res = poids * pct / 100;
    return buildQuestion(
      `Sur une palette de ${fmtFR(poids)} kg, ${pct} % du poids correspond à l'emballage. Quel est ce poids ?`,
      `${fmtFR(res)} kg`,
      [`${fmtFR(res+10)} kg`, `${fmtFR(res-10)} kg`, `${fmtFR(poids-res)} kg`],
      `${fmtFR(poids)} × ${pct} ÷ 100 = ${fmtFR(res)} kg.`
    );
  },
  () => { // majoration tarif transport
    const tarif = randPick([150,200,250,300,350]);
    const pct = randPick([8,10,12,15]);
    const res = tarif * (1 + pct/100);
    return buildQuestion(
      `Un transporteur applique une majoration de ${pct} % sur un tarif de ${fmtFR(tarif)} €. Quel est le nouveau tarif ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(tarif*pct/100)} €`, `${fmtFR(res+10)} €`, `${fmtFR(res-10)} €`],
      `${fmtFR(tarif)} × (1 + ${pct}/100) = ${fmtFR(res)} €.`
    );
  },
  () => { // taux de service
    const total = randPick([150,200,250,300]);
    const taux = randPick([92,94,96,98]);
    const res = total * taux / 100;
    return buildQuestion(
      `Un taux de service de ${taux} % sur ${fmtFR(total)} commandes : combien ont été livrées correctement ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+5)}`, `${fmtFR(res-5)}`, `${fmtFR(taux)}`],
      `${fmtFR(total)} × ${taux} ÷ 100 = ${fmtFR(res)}.`
    );
  },
  () => { // arrondi unité exactement ,5
    const entier = randInt(5, 90);
    const n = entier + 0.5;
    return buildQuestion(
      `Arrondir ${fmtFR(n,1)} à l'unité près.`,
      `${entier+1}`,
      [`${entier}`, `${fmtFR(n,1)}`, `${entier+2}`],
      `0,5 s'arrondit vers le haut selon la règle usuelle : on obtient ${entier+1}.`
    );
  },
  () => { // diminution stock
    const stock = randPick([200,250,300,340,400]);
    const baisse = randPick([10,15,20,25]);
    const res = stock * (1 - baisse/100);
    return buildQuestion(
      `Un stock de ${fmtFR(stock)} unités diminue de ${baisse} %. Combien reste-t-il d'unités ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(stock*baisse/100)}`, `${fmtFR(res+10)}`, `${fmtFR(res-10)}`],
      `${fmtFR(stock)} × (1 − ${baisse}/100) = ${fmtFR(res)}.`
    );
  }
];
