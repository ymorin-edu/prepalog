// Stratelog, Avant l'Hiver : les textes du jeu montrés aux élèves (méthodes « Comment faire ? », bulles « ? » des réserves,
// fiches de chantier, cartes de saison), repris tels quels de la page d'essai validée par Tristan (24/11/2026).

export const DU_ROLE = { I: 'de l’Intendant des greniers', M: 'du Marchand', O: 'du Maître d’œuvre', B: 'de l’Argentier' };
export const NOMS_M = { grain: 'grain', bois: 'bois', pierre: 'pierre', drap: 'drap' };
export const UNITE = { grain: 'sacs', bois: 'bois', pierre: 'pierre', drap: 'pièces de drap' };
export const POSTES = {
  champ: { nom: 'Champs', aide: '3 par champ l’été, 1 l’automne' },
  dech: { nom: 'Quai', aide: '1 équipe décharge 1 charrette' },
  bucheron: { nom: 'Bûcheron', aide: '20 bois par équipe' },
  carriere: { nom: 'Carrière', aide: '15 pierre, rien l’hiver' },
  atelier: { nom: 'Atelier de drapier', aide: '8 drap par équipe' },
  guet: { nom: 'Tour de guet', aide: '1 équipe, solde 10 deniers' },
};
export const EFFETS = {
  champ: '50 sacs l’été, 20 l’automne', bucheron: '20 bois par tour', carriere: '15 pierre par tour, rien l’hiver',
  atelier: '8 drap par tour', grenier: '+150 places de grain', halle: '+100 places à la halle', quartier: '+40 logements',
  guet: 'protège du vol et de l’incendie si gardée', choeur: '+3 réputation', nef: 'après le chœur', chancellerie: 'péage : 3 deniers par charrette des rivales',
};
export const SAIS_COURT = ['Fondation', 'Été', 'Automne', 'Hiver', 'Printemps', 'Été', 'Automne', 'Hiver'];
export const ROMAIN = ['I', 'II', 'III', 'IV', 'V'];

export const METHODES = {
  equipes: 'Une équipe = 10 habitants. L’été, 3 équipes par champ ; l’automne, 1 par champ ; l’hiver et au printemps, aucune. Au quai, une équipe décharge une charrette : compte les charrettes qui attendent et celles que tu achètes ce tour. Une équipe libre ne produit rien.',
  besoin: 'Habitants ÷ 2, arrondi au nombre entier au-dessus. L’hiver, multiplie ce résultat par 1,5 et arrondis encore au-dessus.',
  grenier: 'Places du grenier − (grain en stock + grain acheté ce tour − grain vendu ce tour). On compte le grain acheté même s’il attend encore au quai.',
  recu: 'Additionne ce que contient vraiment chaque charrette (le détail des charrettes), pas ce qui est écrit sur le bon de livraison. Si c’est moins que la commande, coche « Émettre une réserve » : le Marché relivrera le manquant.',
  charrettes: 'Quantité ÷ 20, arrondi au-dessus. 45 unités ne tiennent pas dans 2 charrettes : il en faut 3. Le Marché charge exactement le nombre écrit.',
  cout: 'Quantité × prix de la saison + charrettes × 2 deniers de transport.',
  recette: 'Quantité × prix de la saison − charrettes × 2 deniers de transport.',
  halle: 'Places de la halle − (bois + pierre + drap en stock + achats de bois, pierre, drap − ventes − bois et pierre utilisés par les chantiers).',
  chantiers: 'Chaque chantier coûte 1 point d’action. Il se paie au dépôt (deniers, bois, pierre) et s’achève à la fin de la saison, sauf famine. La nef vient après le chœur.',
  caisse: 'Caisse − coût des achats + recettes des ventes − deniers des chantiers − 10 si la tour est gardée − 20 pour un larcin. Tout ce qui se paie au dépôt sort de la caisse.',
  coup: 'Dès le tour 4 : 1 point d’action + 20 deniers. Tu vois si la ville visée a une tour de guet, pas si elle est gardée. Tour gardée : le voleur est pris (réputation −2).',
};

export const AIDE_RES = {
  deniers: { titre: 'Les deniers (la caisse)',
    sert: ['Payer les achats au marché et leur transport : 2 deniers par charrette.', 'Payer les chantiers et le larcin (20 deniers).', 'Au score : 1 point par tranche de 50 deniers.'],
    gagner: ['L’impôt, à chaque tour : habitants ÷ 5. Le Seigneur en retient 10 % de tes ventes du tour.', 'Vendre au marché : la recette moins le transport.', 'La Chancellerie : un péage sur les charrettes des villes rivales.'],
    attention: 'On ne dépense pas ce qu’on n’a pas : vérifie le reste en caisse avant de lancer un achat.' },
  grain: { titre: 'Le grain (le grenier)',
    sert: ['Nourrir les habitants : chaque saison ils mangent habitants ÷ 2 sacs, et une fois et demie plus l’hiver.', 'S’il manque un seul sac : famine. Des habitants partent, la ville perd 10 de réputation et les chantiers attendent.'],
    gagner: ['La récolte des champs : 50 sacs par champ l’été avec 3 équipes, 20 l’automne avec 1 équipe, rien l’hiver ni au printemps.', 'L’achat au marché : c’est l’été qu’il est le moins cher, l’hiver et au printemps le plus cher.'],
    attention: 'Le grenier a une limite : la moitié de ce qui dépasse est perdue. Un grenier de plus donne 150 places.' },
  halle: { titre: 'La halle (bois, pierre, drap)',
    sert: ['Ranger le bois, la pierre et le drap. Le bois et la pierre servent aux chantiers ; le drap se vend cher au marché.'],
    gagner: ['Bûcheron : 20 bois par tour avec 1 équipe.', 'Carrière : 15 pierre par tour avec 1 équipe, rien l’hiver.', 'Atelier de drapier : 8 drap par tour avec 1 équipe.', 'Ou l’achat au marché.'],
    attention: 'La halle a une limite : la moitié de ce qui dépasse est perdue. Une halle de plus donne 100 places.' },
  habitants: { titre: 'Les habitants',
    sert: ['Travailler : 10 habitants font 1 équipe, à placer aux champs, au quai, au bûcheron, à la carrière, à l’atelier ou à la tour de guet.', 'Payer l’impôt : habitants ÷ 5 deniers par tour.', 'Au score : 1 point pour 4 habitants.'],
    gagner: ['Si personne n’a eu faim, la ville grandit de 10 % à chaque tour…', '… mais seulement s’il reste des logements. Un quartier donne 40 logements de plus.'],
    attention: 'Une famine fait partir des habitants : moins d’équipes et moins d’impôt au tour suivant.' },
  reputation: { titre: 'La réputation',
    sert: ['Au score : chaque point de réputation vaut 3 points.'],
    gagner: ['Achever le chœur de l’église : +3 réputation.'],
    attention: 'Elle se perd : −10 à chaque famine, −2 si ton voleur est pris pendant un larcin.' },
};

export const NOM_SAISON = { 'Été': 'de l’été', Automne: 'de l’automne', Hiver: 'de l’hiver', Printemps: 'du printemps' };

export const RAPPORTE = {
  champ: [['grain', '<b>+50 sacs</b> de grain l’été, avec 3 équipes'], ['grain', '<b>+20 sacs</b> l’automne, avec 1 équipe'], ['', 'rien l’hiver ni au printemps']],
  bucheron: [['bois', '<b>+20 bois</b> par tour, avec 1 équipe']],
  carriere: [['pierre', '<b>+15 pierre</b> par tour, avec 1 équipe'], ['', 'rien l’hiver']],
  atelier: [['drap', '<b>+8 drap</b> par tour, avec 1 équipe']],
  grenier: [['grain', '<b>+150 places</b> au grenier']],
  halle: [['halle', '<b>+100 places</b> à la halle (bois, pierre, drap)']],
  quartier: [['habitants', '<b>+40 logements</b> pour les habitants']],
  guet: [['cle', 'gardée par 1 équipe : <b>arrête les voleurs</b> et <b>évite l’incendie</b>']],
  choeur: [['reputation', '<b>+3 réputation</b>'], ['', 'ouvre le chantier de la nef']],
  nef: [['reputation', 'le prestige seulement : <b>les plus gros points</b> du jeu']],
  chancellerie: [['deniers', '<b>+3 deniers</b> par charrette achetée ou vendue par chaque ville rivale']],
};

export const BUTINS_LIB = [['pierre', '10 pierre', 'pierre'], ['grain', '10 sacs de grain', 'grain'], ['bois', '30 bois', 'bois'], ['impot', 'son impôt du tour', 'deniers']];

export const LIB = { besoin: 'Besoin en grain', grenier: 'Place au grenier', caisse: 'Reste en caisse', halle: 'Place à la halle', reserve: 'Réserve' };
export const libCase = (c) => LIB[c] || c.replace(/^achat(\d+)\.(\w+)$/, (_, i, k) => `Achat ${+i + 1} : ${({ charrettes: 'charrettes', cout: 'coût', recu: 'quantité reçue' })[k]}`)
  .replace(/^vente(\d+)\.(\w+)$/, (_, i, k) => `Vente ${+i + 1} : ${({ charrettes: 'charrettes', recette: 'recette' })[k]}`);
export const aff = (x) => (x === true ? 'oui' : x === false ? 'non' : x ?? '—');

export const CARTE_INFO = {
  calme: ['sablier', 'Rien de particulier cette saison.'], grand_froid: ['grain', 'Chaque ville mange 20 sacs de plus.'],
  recolte_maigre: ['grain', '10 sacs de moins par champ.'], belle_recolte: ['grain', '10 sacs de plus par champ.'],
  foire: ['drap', 'Le drap se vend 16 deniers.'], rats: ['grain', 'Les rats mangent 1 sac sur 10 au grenier.'],
  incendie: ['bois', '30 bois brûlent dans la ville visée, sauf si sa tour est gardée.'],
  route_coupee: ['charrette', 'Le bois et la pierre achetés restent bloqués au quai.'], commande: ['deniers', '+40 deniers si l’atelier a tourné.'],
};
