// Contenu d'ESSAI du mode « stockage de masse » du Plan d'entrepôt (core/types/entrepot-masse.js) — 11/10/2026.
//
// Les données d'ENT-6.5 (brief `docs/briefs/ENT-6.5-france-boissons-rangement.md` §4, étape 2), pour la page
// `outils/essai-entrepot-masse.html` et le bloc de tests `outils/test/entrepot.mjs`. La séance ENT-6.5 déclarera son
// propre contenu (`contenus/france-boissons-ent65.js`). Vérifié : le stockage de masse des fûts chez France Boissons
// (INRS, Travail et Sécurité n° 843, 2022). Construit : le plan (8 couloirs de 4 places), les lots, les hauteurs de
// gerbage, le stock de départ, les poids ; 8 fûts sur palette de rétention = règle de l'exercice (décision 52).

export const MENTION = 'Contenu d’essai : la zone de masse d’ENT-6.5 (France Boissons). Plan, lots, hauteurs de gerbage et stock '
  + '<b>construits</b> ; stockage de masse des fûts <b>vérifié</b> (INRS, 2022). Dessin — scène construite, ce n’est pas la plateforme de Buchelay.';

const pile = (ref, lot, n, futs) => Array.from({ length: n }, () => (futs == null ? { ref, lot } : { ref, lot, futs }));

export const MASSE = {
  id: 'essai-masse',
  libelle: 'Zone de masse',
  mode: 'masse',
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'mercredi 16 juin, 16 h',
    texte: { guidage: 'On range les palettes de Mons dans la zone de masse. Le fût qui fuit reste en zone litiges. Regarde bien les lots.',
      entrainement: 'On range les palettes de Mons dans la zone de masse. Le fût qui fuit reste en zone litiges. Regarde bien les lots.',
      evaluation: 'Range les palettes reçues dans la zone de masse.' } },
  consigne: 'Prends une palette (clique sa carte), puis clique un couloir sur le plan.',
  plan: {
    couloirs: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07'].map((id) => ({ id, places: 4 })).concat({ id: 'M08', places: 4, reserve: 'vides' }),
    reception: 'Zone de réception',
    litiges: { titre: 'Zone litiges', futs: 1 },
    quais: ['QUAI 10', 'QUAI 11', 'QUAI 12', 'QUAI 13', 'QUAI 14'],
  },
  references: {
    HEI30: { nom: 'Heineken fût 30 L', court: 'Heineken 30 L', format: '30 L' },
    AFF20: { nom: 'Affligem Blonde fût 20 L', court: 'Affligem 20 L', format: '20 L' },
    PEL20: { nom: 'Pelforth Blonde fût 20 L', court: 'Pelforth 20 L', format: '20 L' },
    EDW20: { nom: 'Edelweiss fût 20 L', court: 'Edelweiss 20 L', format: '20 L' },
    VIDES: { nom: 'Fûts vides (retours clients)', court: 'VIDES', vides: true },
  },
  hauteurs: { '30 L': 2, '20 L': 3 },
  portee: 4,
  lots: { S18: { couleur: 'ambre' }, S19: { couleur: 'ambre' }, S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },
  stock: {
    M01: [pile('HEI30', 'S20', 2)],
    M03: [pile('PEL20', 'S24', 2)],
    M04: [pile('PEL20', 'S19', 1)],
    M05: [pile('AFF20', 'S18', 1, 2)],
    M07: [pile('EDW20', 'S24', 3)],
    M08: [pile('VIDES', null, 2), pile('VIDES', null, 1, 6)],
  },
  palettes: [
    { id: 'P1', ref: 'HEI30', lot: 'S24', futs: 8, kg: 350, reception: 'conforme' },
    { id: 'P2', ref: 'PEL20', lot: 'S24', futs: 8, kg: 260, reception: 'réserve « produit différent » : c’est de la Pelforth' },
    { id: 'P3', ref: 'AFF20', lot: 'S24', futs: 7, kg: 230, reception: '7 fûts : le 8e fuit, il est en zone litiges' },
    { id: 'P4', ref: 'EDW20', lot: 'S24', futs: 7, kg: 230, reception: 'conforme (une place vide)' },
  ],
  criteres: [{ type: 'zoneReservee', nom: 'couloir VIDES' }, { type: 'uneReference' }, { type: 'unSeulLot' }, { type: 'hauteurGerbage' }, { type: 'parLeFond' }],
  regles: { titre: 'Les règles', lignes: [
    'Un couloir = <b>une seule référence</b>.',
    '<b>Un seul lot par couloir</b> : le chariot entre par l’allée et reprend la palette de devant ; on ne pose donc jamais un lot devant ni sur un lot plus ancien (c’est ce qui permet de respecter le FIFO).',
    '<b>Hauteur de gerbage</b> : fûts 30 L → 2 palettes au plus ; fûts 20 L → 3 au plus.',
    'On remplit un couloir <b>par le fond</b>.',
    'Le couloir <b>VIDES</b> ne reçoit que les fûts vides rendus par les clients.',
  ] },
  note: { sur: 20 },
};

// ─────────────────────────────────────────────────────────── le sous-mode COMPTAGE (chantier D-6, lot 1)
// La zone de masse d'ENT-6.6 (brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md` §4, étape 1), jeudi 17 juin à 7 h : le
// stock du soir d'ENT-6.5, palettes rangées à leur bonne place, puis les trois écarts construits du brief (un fût Heineken percé
// en zone litiges, la Pelforth S19 reposée sur la Heineken de M02, trois vides manquants). Construit : tout (plan, codes de
// contrôle, stock, étiquettes) ; l'inventaire à la voix aussi (non trouvé chez France Boissons, voir le brief §2).
export const MENTION_COMPTAGE = 'Contenu d’essai : la zone de masse d’ENT-6.6 (France Boissons), comptage à l’aveugle. Plan, codes de '
  + 'contrôle, stock et étiquettes <b>construits</b> ; préparation à la voix <b>vérifiée</b> chez France Boissons, inventaire à la voix '
  + '<b>construit</b> (terminal sans son à ce stade). Dessin — scène construite, ce n’est pas la plateforme de Buchelay.';

const CODES = { M01: '47', M02: '82', M03: '15', M04: '63', M05: '29', M06: '54', M07: '31', M08: '91' };
export const COMPTAGE = {
  id: 'essai-masse-comptage',
  libelle: 'Zone de masse',
  mode: 'masse',
  comptage: true,
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'jeudi 17 juin, 7 h',
    texte: { guidage: 'Ouvre chaque couloir et compte les fûts. Ne regarde pas le stock du logiciel : compte ce que tu vois.' } },
  consigne: 'Lis le terminal, va au couloir, compte, réponds.',
  plan: {
    couloirs: Object.keys(CODES).map((id) => (id === 'M08' ? { id, places: 4, reserve: 'vides', code: CODES[id] } : { id, places: 4, code: CODES[id] })),
    reception: 'Zone de réception',
    litiges: { titre: 'Zone litiges', charges: [
      { ref: 'AFF20', lot: 'S24', futs: 1, fuite: true, etiq: 'Réception 16/06 — fuit' },
      { ref: 'HEI30', lot: 'S20', futs: 1, fuite: true, etiq: 'Percé par une fourche — 16/06, 19 h' },
    ] },
    quais: ['QUAI 10', 'QUAI 11', 'QUAI 12', 'QUAI 13', 'QUAI 14'],
  },
  references: MASSE.references,
  hauteurs: MASSE.hauteurs,
  portee: 4,
  lots: MASSE.lots,
  stock: {
    M01: [[{ ref: 'HEI30', lot: 'S20' }, { ref: 'HEI30', lot: 'S20', futs: 7 }]],
    M02: [[{ ref: 'HEI30', lot: 'S24' }, { ref: 'PEL20', lot: 'S19' }]],
    M03: [pile('PEL20', 'S24', 3)],
    M05: [pile('AFF20', 'S18', 1, 2)],
    M06: [pile('AFF20', 'S24', 1, 7)],
    M07: [pile('EDW20', 'S24', 3), pile('EDW20', 'S24', 1, 7)],
    M08: [pile('VIDES', null, 2), pile('VIDES', null, 1, 3)],
  },
  // Le terminal vocal (chantier D-6, lot 2) : la liste du brief §4, dans son ordre, et ses cinq jalons de comptage (§5, jalons
  // 1 à 5). Les nombres attendus ne sont écrits nulle part : ils se calculent depuis le stock ci-dessus.
  terminal: {
    titre: 'Inventaire tournant',
    lignes: [
      { couloir: 'M01', ref: 'HEI30', lot: 'S20' },
      { couloir: 'M02', ref: 'HEI30', lot: 'S24' },
      { couloir: 'M03', ref: 'PEL20', lot: 'S24' },
      { couloir: 'M04', ref: 'PEL20', lot: 'S19' },
      { couloir: 'M05', ref: 'AFF20', lot: 'S18' },
      { couloir: 'M06', ref: 'AFF20', lot: 'S24' },
      { couloir: 'M08', ref: 'VIDES' },
    ],
    jalons: [
      { id: 'compte-M01', lib: 'M01 : Heineken 30 L compté juste', lignes: ['M01'] },
      { id: 'compte-M02', lib: 'M02 : Heineken 30 L compté juste', lignes: ['M02'] },
      { id: 'compte-M04', lib: 'M04 : Pelforth 20 L compté juste', lignes: ['M04'] },
      { id: 'compte-M08', lib: 'M08 : fûts vides comptés justes', lignes: ['M08'] },
      { id: 'compte-autres', lib: 'M03, M05 et M06 comptés justes', lignes: ['M03', 'M05', 'M06'] },
    ],
    fin: 'Comptage terminé : 7 lignes. Merci.',
  },
  regles: { titre: 'Compter les fûts', entete: 'Compter les fûts', lignes: [
    'Une palette pleine = <b>8 fûts</b>.',
    'Compte les palettes de chaque pile, puis regarde s’il manque des fûts sur une palette.',
    'Ne compte que la référence demandée.',
  ] },
};
