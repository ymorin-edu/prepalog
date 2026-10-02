// Fabrique de questions tirées au sort.
//
// Un quiz d'entraînement ne pose pas vingt questions figées : il pose vingt *sortes*
// de questions, dont les valeurs changent à chaque tentative. Un élève qui recommence
// retravaille le même raisonnement sur d'autres nombres, et n'apprend pas les réponses
// par cœur.
//
// Ces quatre outils sont ceux de la Suite Logistique, repris à l'identique pour que les
// générateurs migrés n'aient pas eu à être réécrits. Seuls les noms exportés sont en
// français ; les fichiers de contenu les importent sous leur nom d'origine.

export function entier(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function tirer(arr) { return arr[entier(0, arr.length - 1)]; }

// Mélange de Fisher-Yates, en place.
export function melanger(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = entier(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Nombre au format français : virgule décimale, espace fine insécable aux milliers.
// Un élève qui lit « 3 500 » doit voir ce qu'il verrait sur un bon de livraison.
export function nombreFR(n, maxDec) {
  maxDec = maxDec === undefined ? 2 : maxDec;
  const factor = Math.pow(10, maxDec);
  let rounded = Math.round((n + Number.EPSILON) * factor) / factor;
  // évite -0
  if (Object.is(rounded, -0)) rounded = 0;
  let s = rounded.toString();
  let [intPart, decPart] = s.split('.');
  const neg = intPart.startsWith('-');
  if (neg) intPart = intPart.slice(1);
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  let out = (neg ? '-' : '') + intPart;
  if (decPart) out += ',' + decPart;
  return out;
}

// Assemble une question à quatre choix : la bonne réponse, trois distracteurs, mélangés.
// Deux distracteurs qui tomberaient sur la même valeur que la bonne réponse sont écartés,
// et remplacés par « Aucune de ces réponses » — sans quoi une question pourrait avoir deux
// bonnes réponses cochables.
export function question(qText, correctDisplay, distractorDisplays, explication) {
  const seen = new Set([correctDisplay]);
  const cleanDistractors = [];
  for (const d of distractorDisplays) {
    if (!seen.has(d)) { seen.add(d); cleanDistractors.push(d); }
  }
  let fallbackN = 0;
  while (cleanDistractors.length < 3) {
    fallbackN++;
    cleanDistractors.push(fallbackN === 1 ? 'Aucune de ces réponses' : `Aucune de ces réponses (${fallbackN})`);
  }
  const options = [correctDisplay, ...cleanDistractors.slice(0, 3)];
  melanger(options);
  return { enonce: qText, choix: options, juste: options.indexOf(correctDisplay), explication };
}

// Questions figées (géographie, français, CACES) : on mélange l'ordre des questions ET
// celui des réponses, pour qu'un élève ne puisse pas retenir « c'était la troisième ».
export function melangerQuestionsFixes(questions) {
  const qs = questions.map((q) => {
    const entrees = q.choix.map((opt, i) => ({ opt, ok: i === q.juste }));
    melanger(entrees);
    return {
      enonce: q.enonce,
      choix: entrees.map((e) => e.opt),
      juste: entrees.findIndex((e) => e.ok),
      explication: q.explication,
    };
  });
  return melanger(qs);
}
