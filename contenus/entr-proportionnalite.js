// Entraînement « Proportionnalité » — 20 générateurs.
//
// Les générateurs ne sont PAS recopiés : ils ont été extraits par programme du fichier
// source de la Suite Logistique (`PROPORTIONNALITE_TEMPLATES`) et déposés ici tels quels. Ils calculent la
// bonne réponse à chaque tirage au lieu de la porter en dur : aucun corrigé à transporter.
//
// Les outils sont importés sous leur nom d'origine pour que le corps des générateurs
// n'ait eu besoin d'aucune retouche.
// Corrections apportionnées à la Suite (trouvées par l'énumération de 4 000 tirages par
// générateur) : six générateurs (n° 2, 11, 12, 16, 17, 18) perdaient un distracteur au profit
// d'un « Aucune de ces réponses » ; leur dernier distracteur a été remplacé.

import { tirer as randPick, entier as randInt, nombreFR as fmtFR, question as buildQuestion } from '../core/questions.js';


export const TITRE = "Proportionnalité";

export const RAPPEL = [
  "Deux grandeurs sont proportionnelles si l'une s'obtient en multipliant l'autre par un nombre fixe.",
  "Règle de trois : si a correspond à b, alors la valeur x correspondant à c se calcule par x = (b × c) ÷ a.",
  "Vitesse, distance, temps : distance = vitesse × temps · vitesse = distance ÷ temps · temps = distance ÷ vitesse."
];

export const GENERATEURS = [
  () => { // distance = vitesse x temps
    const v = randPick([60,70,80,90,100,110]);
    const t = randPick([2,3,4,5]);
    const d = v * t;
    return buildQuestion(
      `Un camion roule à ${v} km/h pendant ${t} heures. Quelle distance parcourt-il ?`,
      `${fmtFR(d)} km`,
      [`${fmtFR(d+v/2)} km`, `${fmtFR(v+t)} km`, `${fmtFR(d-t)} km`],
      `distance = vitesse × temps = ${v} × ${t} = ${fmtFR(d)} km.`
    );
  },
  () => { // poids proportionnel cartons
    const n1 = randPick([4,5,6]);
    const p1 = n1 * randPick([6,8,10]);
    const n2 = randPick([7,8,9,10]);
    const res = p1 / n1 * n2;
    return buildQuestion(
      `${n1} cartons identiques pèsent ${fmtFR(p1)} kg au total. Combien pèsent ${n2} cartons ?`,
      `${fmtFR(res)} kg`,
      [`${fmtFR(res+n2)} kg`, `${fmtFR(res-n2)} kg`, `${fmtFR(p1)} kg`],
      `${fmtFR(p1)} ÷ ${n1} × ${n2} = ${fmtFR(res)} kg.`
    );
  },
  () => { // colis par heure
    const colisH = randPick([20,25,30,40]);
    const h1 = randPick([2,3]);
    const h2 = randPick([4,5,6,7]);
    const total1 = colisH * h1;
    const res = colisH * h2;
    return buildQuestion(
      `Un préparateur prépare ${fmtFR(total1)} colis en ${h1} heures. À ce rythme, combien de colis en ${h2} heures ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+colisH)}`, `${fmtFR(res-colisH)}`, `${fmtFR(total1+h2)}`],
      `${fmtFR(total1)} ÷ ${h1} × ${h2} = ${fmtFR(res)} colis.`
    );
  },
  () => { // palette cartons -> poids
    const c1 = randPick([10,12,15]);
    const poidsUnit = randPick([12,15,18,20]);
    const p1 = c1 * poidsUnit;
    const c2 = randPick([16,18,20,24]);
    const res = poidsUnit * c2;
    return buildQuestion(
      `Une palette de ${c1} cartons pèse ${fmtFR(p1)} kg. Combien pèse une palette de ${c2} cartons identiques ?`,
      `${fmtFR(res)} kg`,
      [`${fmtFR(res+poidsUnit)} kg`, `${fmtFR(res-poidsUnit)} kg`, `${fmtFR(p1+c2)} kg`],
      `${fmtFR(p1)} ÷ ${c1} × ${c2} = ${fmtFR(res)} kg.`
    );
  },
  () => { // conso carburant
    const conso100 = randPick([25,28,30,32,35]);
    const km = randPick([150,200,250,300,350]);
    const res = conso100 / 100 * km;
    return buildQuestion(
      `Un camion consomme ${fmtFR(conso100)} L de carburant pour 100 km. Combien consomme-t-il pour ${fmtFR(km)} km ?`,
      `${fmtFR(res)} L`,
      [`${fmtFR(res+10)} L`, `${fmtFR(res-10)} L`, `${fmtFR(conso100+km)} L`],
      `${fmtFR(conso100)} ÷ 100 × ${fmtFR(km)} = ${fmtFR(res)} L.`
    );
  },
  () => { // échelle plan
    const cm1 = randPick([1,2,3]);
    const km1 = randPick([20,30,40,50]);
    const cm2 = randPick([4,5,6,7]);
    const res = km1 / cm1 * cm2;
    return buildQuestion(
      `Sur un plan, ${cm1} cm représentent ${fmtFR(km1)} km en réalité. Que représentent ${cm2} cm sur ce même plan ?`,
      `${fmtFR(res)} km`,
      [`${fmtFR(res+km1)} km`, `${fmtFR(res-km1)} km`, `${fmtFR(km1+cm2)} km`],
      `${fmtFR(km1)} ÷ ${cm1} × ${cm2} = ${fmtFR(res)} km.`
    );
  },
  () => { // production machine
    const p1 = randPick([200,250,300,350]);
    const h1 = randPick([3,4,5]);
    const h2 = randPick([6,7,8,9]);
    const res = p1 / h1 * h2;
    return buildQuestion(
      `Une machine produit ${fmtFR(p1)} pièces en ${h1} heures. Combien de pièces produit-elle en ${h2} heures, au même rythme ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+p1/h1)}`, `${fmtFR(res-p1/h1)}`, `${fmtFR(p1+h2)}`],
      `${fmtFR(p1)} ÷ ${h1} × ${h2} = ${fmtFR(res)} pièces.`
    );
  },
  () => { // vitesse moyenne
    const t = randPick([2,3,4,5]);
    const v = randPick([55,60,65,70,75]);
    const d = v * t;
    return buildQuestion(
      `Un véhicule parcourt ${fmtFR(d)} km en ${t} heures. Quelle est sa vitesse moyenne ?`,
      `${fmtFR(v)} km/h`,
      [`${fmtFR(v+5)} km/h`, `${fmtFR(v-5)} km/h`, `${fmtFR(d/(t+1))} km/h`],
      `vitesse = distance ÷ temps = ${fmtFR(d)} ÷ ${t} = ${fmtFR(v)} km/h.`
    );
  },
  () => { // temps de trajet
    const v = randPick([80,90,100,110]);
    const tDemi = randPick([2,2.5,3,3.5,4]);
    const d = v * tDemi;
    return buildQuestion(
      `À une vitesse de ${v} km/h, combien de temps faut-il pour parcourir ${fmtFR(d)} km ?`,
      `${fmtFR(tDemi)} h`,
      [`${fmtFR(tDemi+1)} h`, `${fmtFR(tDemi-0.5)} h`, `${fmtFR(tDemi*2)} h`],
      `temps = distance ÷ vitesse = ${fmtFR(d)} ÷ ${v} = ${fmtFR(tDemi)} h.`
    );
  },
  () => { // employés -> commandes
    const e1 = randPick([2,3,4]);
    const cUnit = randPick([20,25,30]);
    const c1 = e1 * cUnit;
    const e2 = randPick([5,6,7,8]);
    const res = cUnit * e2;
    return buildQuestion(
      `${e1} employés préparent ${fmtFR(c1)} commandes par jour. Combien ${e2} employés préparent-ils par jour, au même rythme ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+cUnit)}`, `${fmtFR(res-cUnit)}`, `${fmtFR(c1+e2)}`],
      `${fmtFR(c1)} ÷ ${e1} × ${e2} = ${fmtFR(res)} commandes.`
    );
  },
  () => { // prix au kilo
    const kg1 = randPick([5,8,10]);
    const prixKg = randPick([2,2.5,3,3.5,4]);
    const prix1 = kg1 * prixKg;
    const kg2 = randPick([12,15,18,20,26]);
    const res = prixKg * kg2;
    return buildQuestion(
      `Un fournisseur facture ${fmtFR(prix1)} € pour ${kg1} kg de marchandise. Combien facture-t-il pour ${kg2} kg ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(res+prixKg)} €`, `${fmtFR(res-prixKg)} €`, `${fmtFR(prix1)} €`],
      `${fmtFR(prix1)} ÷ ${kg1} × ${kg2} = ${fmtFR(res)} €.`
    );
  },
  () => { // chariot palettes / minutes -> par heure
    const pal = randPick([6,8,10]);
    const minRef = randPick([15,20,30]);
    const res = pal / minRef * 60;
    return buildQuestion(
      `Un chariot élévateur déplace ${pal} palettes en ${minRef} minutes. Combien de palettes déplace-t-il en 1 heure, au même rythme ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+pal)}`, `${fmtFR(res-pal)}`, `${fmtFR(pal*minRef)}`],
      `${pal} ÷ ${minRef} × 60 = ${fmtFR(res)} palettes.`
    );
  },
  () => { // échelle 1cm = X km
    const echelle = randPick([10,15,20,25,30]);
    const cm = randPick([2.5,3.5,4.5,5.5]);
    const res = echelle * cm;
    return buildQuestion(
      `Une échelle de plan indique que 1 cm représente ${echelle} km. Quelle distance réelle représentent ${fmtFR(cm)} cm ?`,
      `${fmtFR(res)} km`,
      [`${fmtFR(res+echelle)} km`, `${fmtFR(res-echelle)} km`, `${fmtFR(echelle+cm)} km`],
      `${echelle} × ${fmtFR(cm)} = ${fmtFR(res)} km.`
    );
  },
  () => { // volume cartons
    const n1 = randPick([2,4,5]);
    const volUnit = randPick([0.15,0.2,0.25,0.3]);
    const v1 = n1 * volUnit;
    const n2 = randPick([8,10,12,15]);
    const res = volUnit * n2;
    return buildQuestion(
      `${n1} cartons identiques occupent un volume de ${fmtFR(v1,2)} m³. Quel volume occupent ${n2} cartons identiques ?`,
      `${fmtFR(res,2)} m³`,
      [`${fmtFR(res+volUnit,2)} m³`, `${fmtFR(res-volUnit,2)} m³`, `${fmtFR(v1+n2,2)} m³`],
      `${fmtFR(v1,2)} ÷ ${n1} × ${n2} = ${fmtFR(res,2)} m³.`
    );
  },
  () => { // vitesse constante minutes -> km/h
    const distRef = randPick([40,50,60]);
    const minRef = randPick([30,40,45]);
    const res = distRef / minRef * 60;
    return buildQuestion(
      `Un camion à vitesse constante parcourt ${distRef} km en ${minRef} minutes. Combien de km parcourt-il en 60 minutes ?`,
      `${fmtFR(res)} km`,
      [`${fmtFR(res+distRef/10)} km`, `${fmtFR(res-distRef/10)} km`, `${fmtFR(distRef+minRef)} km`],
      `${distRef} ÷ ${minRef} × 60 = ${fmtFR(res)} km.`
    );
  },
  () => { // rouleaux film
    const prod1 = randPick([80,100,120]);
    const roul1 = randPick([3,4,5]);
    const prod2 = randPick([200,250,300]);
    const res = roul1 / prod1 * prod2;
    return buildQuestion(
      `Pour emballer ${prod1} produits, il faut ${roul1} rouleaux de film. Combien de rouleaux pour ${prod2} produits, au même rythme ?`,
      `${fmtFR(res)}`,
      [`${fmtFR(res+1)}`, `${fmtFR(res-1)}`, `${fmtFR(res+2)}`],
      `${roul1} ÷ ${prod1} × ${prod2} = ${fmtFR(res)} rouleaux.`
    );
  },
  () => { // prix kg 2
    const kg1 = randPick([2,3,4]);
    const prixKg = randPick([5,6,7,8]);
    const prix1 = kg1 * prixKg;
    const kg2 = randPick([6,7,9,11]);
    const res = prixKg * kg2;
    return buildQuestion(
      `${kg1} kg d'un produit coûtent ${fmtFR(prix1)} € au même prix au kilo. Combien coûtent ${kg2} kg ?`,
      `${fmtFR(res)} €`,
      [`${fmtFR(res+prixKg)} €`, `${fmtFR(res-prixKg)} €`, `${fmtFR(res+2*prixKg)} €`],
      `${fmtFR(prix1)} ÷ ${kg1} × ${kg2} = ${fmtFR(res)} €.`
    );
  },
  () => { // proportionnalité inverse : personnes / temps
    const p1 = randPick([3,4,5]);
    const t1 = randPick([30,40,45,60]);
    const p2 = randPick([p1+1, p1+2, p1+3]);
    const res = p1 * t1 / p2;
    return buildQuestion(
      `Une équipe de ${p1} personnes décharge un camion en ${t1} minutes. Combien de temps faudrait-il à ${p2} personnes, au même rythme individuel ?`,
      `${fmtFR(res)} min`,
      [`${fmtFR(t1)} min`, `${fmtFR(t1*p2/p1)} min`, `${fmtFR(t1-p2)} min`],
      `Attention : plus il y a de monde, moins il faut de temps (proportionnalité inverse). ${p1} × ${t1} ÷ ${p2} = ${fmtFR(res)} min.`
    );
  },
  () => { // double distance meme vitesse
    const t1 = randPick([3,4,5,6]);
    const facteur = randPick([2,3]);
    const res = t1 * facteur;
    return buildQuestion(
      `Un camion parcourt une distance en ${t1} heures à vitesse constante. Un autre camion parcourt ${facteur} fois cette distance à la même vitesse. Combien de temps met-il ?`,
      `${fmtFR(res)} h`,
      [`${fmtFR(t1)} h`, `${fmtFR(t1+facteur)} h`, `${fmtFR(res+facteur)} h`],
      `À vitesse égale, ${facteur} fois la distance demande ${facteur} fois le temps : ${t1} × ${facteur} = ${fmtFR(res)} h.`
    );
  },
  () => { // conditionnement matière -> unités
    const mat1 = randPick([2,3,4]);
    const unites1 = randPick([5,6,8]);
    const unites2 = randPick([10,12,15,18]);
    const res = mat1 / unites1 * unites2;
    return buildQuestion(
      `Un conditionnement utilise ${fmtFR(mat1)} kg de matière pour produire ${unites1} unités. Combien de kg faut-il pour produire ${unites2} unités, au même ratio ?`,
      `${fmtFR(res,2)} kg`,
      [`${fmtFR(res+mat1,2)} kg`, `${fmtFR(res-mat1,2)} kg`, `${fmtFR(mat1+unites2,2)} kg`],
      `${fmtFR(mat1)} ÷ ${unites1} × ${unites2} = ${fmtFR(res,2)} kg.`
    );
  }
];
