// Entraînement « Conversions d'unités » — 20 générateurs.
//
// Les générateurs ne sont PAS recopiés : ils ont été extraits du fichier source de la
// Suite Logistique (`CONVERSIONS_TEMPLATES`) et déposés ici tels quels, ligne pour ligne.
// Ils calculent la bonne réponse à chaque tirage au lieu de la porter en dur : il n'y a
// donc aucun corrigé à transporter, et rien à vérifier à la main.
//
// Les trois outils sont importés sous leur nom d'origine pour que le corps des
// générateurs n'ait eu besoin d'aucune retouche.

import { tirer as randPick, nombreFR as fmtFR, question as buildQuestion } from '../core/questions.js';

export const TITRE = "Conversions d'unités";

export const RAPPEL = [
  "Longueur : 1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm",
  "Masse : 1 t = 1000 kg · 1 kg = 1000 g",
  "Volume / capacité : 1 m³ = 1000 L · 1 L = 1000 mL",
  "Temps : 1 h = 60 min · 1 min = 60 s",
];

// Un générateur par question posée : vingt générateurs, donc vingt questions, toujours
// dans des registres différents (longueurs, masses, volumes, durées).
export const GENERATEURS = [
  () => { // km -> m
    const km = randPick([1.5,2.5,3.5,4.5,6.5,7.5,2.2,3.8,4.4,5.6]);
    const m = km * 1000;
    return buildQuestion(
      `Combien font ${fmtFR(km)} km en mètres ?`,
      `${fmtFR(m)} m`,
      [`${fmtFR(km*100)} m`, `${fmtFR(km*10000)} m`, `${fmtFR(km)} m`],
      `1 km = 1000 m, donc ${fmtFR(km)} × 1000 = ${fmtFR(m)} m.`
    );
  },
  () => { // g -> kg
    const g = randPick([1500,2500,3200,4200,1800,2600,3800,4600]);
    const kg = g / 1000;
    return buildQuestion(
      `Combien font ${fmtFR(g)} g en kilogrammes ?`,
      `${fmtFR(kg)} kg`,
      [`${fmtFR(kg/10)} kg`, `${fmtFR(kg*10)} kg`, `${fmtFR(kg*100)} kg`],
      `1000 g = 1 kg, donc ${fmtFR(g)} ÷ 1000 = ${fmtFR(kg)} kg.`
    );
  },
  () => { // t -> kg
    const t = randPick([0.3,0.5,0.8,1.2,1.6,1.8,2.2,2.4]);
    const kg = t * 1000;
    return buildQuestion(
      `${fmtFR(t)} tonne représente combien de kilogrammes ?`,
      `${fmtFR(kg)} kg`,
      [`${fmtFR(t*10)} kg`, `${fmtFR(t*100)} kg`, `${fmtFR(t*10000)} kg`],
      `1 t = 1000 kg, donc ${fmtFR(t)} × 1000 = ${fmtFR(kg)} kg.`
    );
  },
  () => { // mL -> L
    const ml = randPick([250,350,450,550,650,750,850,120]);
    const l = ml / 1000;
    return buildQuestion(
      `${fmtFR(ml)} mL représentent combien de litres ?`,
      `${fmtFR(l)} L`,
      [`${fmtFR(l/10)} L`, `${fmtFR(l*10)} L`, `${fmtFR(l*100)} L`],
      `1000 mL = 1 L, donc ${fmtFR(ml)} ÷ 1000 = ${fmtFR(l)} L.`
    );
  },
  () => { // h -> min
    const h = randPick([1.5,2,2.5,3,3.5,4,0.5]);
    const min = h * 60;
    return buildQuestion(
      `Combien de minutes dans ${fmtFR(h)} heures ?`,
      `${fmtFR(min)} min`,
      [`${fmtFR(h*10)} min`, `${fmtFR(h*100)} min`, `${fmtFR(min+50)} min`],
      `1 h = 60 min, donc ${fmtFR(h)} × 60 = ${fmtFR(min)} min.`
    );
  },
  () => { // g -> kg (carton)
    const g = randPick([2800,3600,4400,5200,3100,4700,2300]);
    const kg = g / 1000;
    return buildQuestion(
      `Un carton pèse ${fmtFR(g)} g. Combien de kilogrammes ?`,
      `${fmtFR(kg)} kg`,
      [`${fmtFR(kg/10)} kg`, `${fmtFR(kg*10)} kg`, `${fmtFR(kg*100)} kg`],
      `${fmtFR(g)} ÷ 1000 = ${fmtFR(kg)} kg.`
    );
  },
  () => { // m -> cm
    const m = randPick([0.6,0.9,1.2,1.5,1.8,2.1,2.4,1.1]);
    const cm = m * 100;
    return buildQuestion(
      `Une palette mesure ${fmtFR(m)} m de large. Combien de centimètres ?`,
      `${fmtFR(cm)} cm`,
      [`${fmtFR(m*10)} cm`, `${fmtFR(m*1000)} cm`, `${fmtFR(m)} cm`],
      `1 m = 100 cm, donc ${fmtFR(m)} × 100 = ${fmtFR(cm)} cm.`
    );
  },
  () => { // m3 -> L
    const m3 = randPick([1,2,3,4,1.5,2.5,0.5,3.5]);
    const l = m3 * 1000;
    return buildQuestion(
      `${fmtFR(m3)} m³ représentent combien de litres ?`,
      `${fmtFR(l)} L`,
      [`${fmtFR(m3*100)} L`, `${fmtFR(m3*10000)} L`, `${fmtFR(m3*10)} L`],
      `1 m³ = 1000 L, donc ${fmtFR(m3)} × 1000 = ${fmtFR(l)} L.`
    );
  },
  () => { // min -> s
    const min = randPick([2,3,4,5,6,1.5,2.5]);
    const s = min * 60;
    return buildQuestion(
      `Combien de secondes dans ${fmtFR(min)} minutes ?`,
      `${fmtFR(s)} s`,
      [`${fmtFR(min*10)} s`, `${fmtFR(s/2)} s`, `${fmtFR(s+30)} s`],
      `1 min = 60 s, donc ${fmtFR(min)} × 60 = ${fmtFR(s)} s.`
    );
  },
  () => { // t -> kg (0,x)
    const t = randPick([0.2,0.4,0.6,0.7,0.9,0.35,0.45]);
    const kg = t * 1000;
    return buildQuestion(
      `${fmtFR(t)} tonne représente combien de kilogrammes ?`,
      `${fmtFR(kg)} kg`,
      [`${fmtFR(t*10)} kg`, `${fmtFR(t*100)} kg`, `${fmtFR(kg*10)} kg`],
      `${fmtFR(t)} × 1000 = ${fmtFR(kg)} kg.`
    );
  },
  () => { // km -> m (camion)
    const km = randPick([12,25,32,45,58,63,74,19]);
    const m = km * 1000;
    return buildQuestion(
      `Un camion parcourt ${fmtFR(km)} km. Combien de mètres ?`,
      `${fmtFR(m)} m`,
      [`${fmtFR(km*100)} m`, `${fmtFR(km*10)} m`, `${fmtFR(km*10000)} m`],
      `${fmtFR(km)} × 1000 = ${fmtFR(m)} m.`
    );
  },
  () => { // h + min composé -> min
    const h = randPick([1,2,3]);
    const min = randPick([10,15,20,25,30,40,45]);
    const total = h * 60 + min;
    return buildQuestion(
      `${h} heure${h>1?"s":""} ${min} minutes représentent combien de minutes au total ?`,
      `${total} min`,
      [`${h*60 + min - 60} min`, `${h*100 + min} min`, `${total + 10} min`],
      `${h} × 60 = ${h*60}, puis ${h*60} + ${min} = ${total} min.`
    );
  },
  () => { // kg -> g
    const kg = randPick([0.15,0.25,0.35,0.45,0.65,0.75,0.85]);
    const g = kg * 1000;
    return buildQuestion(
      `Combien de grammes dans ${fmtFR(kg)} kg ?`,
      `${fmtFR(g)} g`,
      [`${fmtFR(kg*10)} g`, `${fmtFR(kg*100)} g`, `${fmtFR(g*10)} g`],
      `${fmtFR(kg)} × 1000 = ${fmtFR(g)} g.`
    );
  },
  () => { // cm -> m
    const cm = randPick([40,60,70,80,90,55,65,120]);
    const m = cm / 100;
    return buildQuestion(
      `Une caisse mesure ${fmtFR(cm)} cm de long. Combien de mètres ?`,
      `${fmtFR(m)} m`,
      [`${fmtFR(m/10)} m`, `${fmtFR(m*10)} m`, `${fmtFR(m*100)} m`],
      `${fmtFR(cm)} ÷ 100 = ${fmtFR(m)} m.`
    );
  },
  () => { // m3 -> L (bis)
    const m3 = randPick([1.5,2.5,3.5,4.5,0.5,2,3]);
    const l = m3 * 1000;
    return buildQuestion(
      `Combien de litres dans ${fmtFR(m3)} m³ ?`,
      `${fmtFR(l)} L`,
      [`${fmtFR(m3*100)} L`, `${fmtFR(m3*10)} L`, `${fmtFR(m3*10000)} L`],
      `${fmtFR(m3)} × 1000 = ${fmtFR(l)} L.`
    );
  },
  () => { // g -> kg (colis)
    const g = randPick([1200,1500,1800,2100,2400,1300,1900]);
    const kg = g / 1000;
    return buildQuestion(
      `Un colis pèse ${fmtFR(g)} g. Combien de kilogrammes ?`,
      `${fmtFR(kg)} kg`,
      [`${fmtFR(kg/10)} kg`, `${fmtFR(kg*10)} kg`, `${fmtFR(kg*100)} kg`],
      `${fmtFR(g)} ÷ 1000 = ${fmtFR(kg)} kg.`
    );
  },
  () => { // min -> h
    const min = randPick([120,150,180,210,240,90,300]);
    const h = min / 60;
    return buildQuestion(
      `Combien d'heures dans ${fmtFR(min)} minutes ?`,
      `${fmtFR(h)} h`,
      // `min/100` figurait ici dans la Suite Logistique : pour 150 min il tombait sur 1,5,
      // exactement la même valeur que `h-1`, et la question perdait un distracteur au profit
      // d'un « Aucune de ces réponses ». `min/10` ne collisionne avec aucun tirage.
      [`${fmtFR(h+1)} h`, `${fmtFR(h-1)} h`, `${fmtFR(min/10)} h`],
      `${fmtFR(min)} ÷ 60 = ${fmtFR(h)} h.`
    );
  },
  () => { // kg -> t
    const kg = randPick([3000,4000,5000,6000,7000,8000,9000]);
    const t = kg / 1000;
    return buildQuestion(
      `${fmtFR(kg)} kg représentent combien de tonnes ?`,
      `${fmtFR(t)} t`,
      [`${fmtFR(t/10)} t`, `${fmtFR(t*10)} t`, `${fmtFR(t*100)} t`],
      `${fmtFR(kg)} ÷ 1000 = ${fmtFR(t)} t.`
    );
  },
  () => { // m -> cm (étagère)
    const m = randPick([1.4,1.8,2.2,2.4,2.6,3.2,1.6]);
    const cm = m * 100;
    return buildQuestion(
      `Une étagère fait ${fmtFR(m)} m de long. Combien de centimètres ?`,
      `${fmtFR(cm)} cm`,
      [`${fmtFR(m*10)} cm`, `${fmtFR(m*1000)} cm`, `${fmtFR(m)} cm`],
      `${fmtFR(m)} × 100 = ${fmtFR(cm)} cm.`
    );
  },
  () => { // min -> h décimal
    const min = randPick([15,30,45,20,40,50,10]);
    const h = min / 60;
    return buildQuestion(
      `${fmtFR(min)} minutes représentent combien d'heures (sous forme décimale) ?`,
      `${fmtFR(h,2)} h`,
      [`${fmtFR(min/10,2)} h`, `${fmtFR(h+0.5,2)} h`, `${fmtFR(h*10,2)} h`],
      `${fmtFR(min)} ÷ 60 = ${fmtFR(h,2)} h.`
    );
  }
];
