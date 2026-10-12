// ENT-6.7 — France Boissons, « la commande de Malo à la voix » : les DONNÉES PURES de la séance (écran du matériel, allée de
// picking avec son terminal et ses deux palettes client, poids). À part de `contenus/france-boissons-ent67.js` parce que ce
// fichier-ci se charge aussi hors navigateur (le corrigé `contenus/corriges/ENT-6.7.js` le lit). Rien ici n'importe le moteur.
//
// Vérifié (brief §2) : préparation à la voix chez France Boissons (Vocollect, depuis 2014) ; tiroirs coulissants sous les racks,
// portique à fûts, 6 fûts par palette 1,20 × 0,80 vers les clients (INRS, Travail et Sécurité n° 843, 2022, plateforme de
// Gennevilliers) ; transpalettes à ciseaux et portique à Buchelay (vidéo de présentation, 2025) ; fût Euro de 39,5 cm.
// Construit : le plan de picking (1 allée, 2 côtés, 4 travées), les emplacements, leurs codes et leurs quantités, le fût cabossé,
// la règle de pose, la palette client en bois, la zone de préparation devant le quai 14, l'heure. 8 fûts sur une palette de
// rétention en réserve : règle de l'exercice (décision 52).
//
// LA COMMANDE est celle d'ENT-6.2, reprise (jamais redéclarée) : `ATTENDU` de `contenus/france-boissons-ent62.js` (6 Heineken 30 L,
// 2 Affligem 20 L, 2 Pelforth Blonde 20 L en remplacement, 3 casiers d'eau). Les quantités du terminal en sont CALCULÉES.

import { ATTENDU } from './france-boissons-ent62.js';

export const ID = 'france-boissons-preparation';
export const ENTREPOT_ID = 'fb-ent67-picking';
export const ID_VOLET = 'fb-ent67';

// Jeudi 17 juin 2027, 14 h (décision 50) ; la tournée de la côte part le lendemain, vendredi 18 juin, à 6 h.
export const SCENARIO = { date: '2027-06-17', heure: '14:00' };

const IMG = './contenus/images/france-boissons/';

// ─────────────────────────────────────────────────────────────── étape 0 : le matériel du poste (brief §4, étape 0)
// Même brique qu'ENT-6.5 / 6.6 : une animation faite seulement d'écrans, entrée « Le matériel » du menu, sans jalon.
export const MATERIEL = {
  id: 'fb-ent67-materiel',
  libelle: 'Le matériel',
  ecrans: [
    { titre: 'Le poste de préparation',
      image: { src: IMG + 'materiel-portique-futs.svg',
        alt: 'Sous un portique fixe, un préparateur guide un manipulateur à air qui lève un fût vers une palette client de 1,20 × 0,80 m',
        mention: 'Dessin simplifié d’après une vidéo de présentation de la plateforme de Buchelay (mention dans le dessin)' },
      blocs: ['Les fûts du picking sont dans des <b>[[tiroir coulissant|tiroirs coulissants]]</b>, sous les racks : on tire le tiroir vers soi au lieu de se pencher.',
        'Le <b>[[portique à fûts]]</b> est fixe, au-dessus de la zone de préparation. Son <b>[[manipulateur à air]]</b> saisit le fût et le soulève : '
          + 'tu le guides avec la poignée. Un fût de 30 L pèse environ 40 kg : on ne le porte pas à la main.',
        'La <b>[[palette client]]</b> (1,20 × 0,80 m) passe dans les couloirs et les monte-charges des bars. On la prépare sur un '
          + '<b>[[transpalette à ciseaux]]</b>, qui la monte à hauteur de travail.'] },
  ],
  parties: [],
};

// ─────────────────────────────────────────────────────────────── étape 1 : l'allée de picking (brief §4, étape 1)
// Les références de l'allée (`article` : l'article de l'univers, `STOCK_BUCHELAY`, quand il y en a un ; la limonade n'y est pas).
// Teintes par NOM, celles du kit iso (aucun vert).
export const REFERENCES = {
  EAU1L: { article: 'eau', nom: 'Eau minérale 1 L', court: 'eau minérale', voix: 'Eau minérale, casier de douze bouteilles', type: 'casier', capsule: 'bleu' },
  LIM1L: { nom: 'Limonade 1 L', court: 'limonade', voix: 'Limonade, casier de douze bouteilles', type: 'casier', capsule: 'jaune' },
  PEL20: { article: 'pelforth20', nom: 'Pelforth Blonde 20 L', court: 'Pelforth', voix: 'Pelforth Blonde, vingt litres', type: 'fut', litres: 20, bande: 'or' },
  EDW20: { article: 'edelweiss20', nom: 'Edelweiss 20 L', court: 'Edelweiss', voix: 'Edelweiss, vingt litres', type: 'fut', litres: 20, bande: 'bleu' },
  AFF20: { article: 'affligem20', nom: 'Affligem Blonde 20 L', court: 'Affligem', voix: 'Affligem Blonde, vingt litres', type: 'fut', litres: 20, bande: 'cuivre' },
  HEI30: { article: 'heineken30', nom: 'Heineken 30 L', court: 'Heineken 30 L', voix: 'Heineken, trente litres', type: 'fut', litres: 30, bande: 'rouge' },
  HEI20: { article: 'heineken20', nom: 'Heineken 20 L', court: 'Heineken 20 L', voix: 'Heineken, vingt litres', type: 'fut', litres: 20, bande: 'rouge' },
};

// Le contenu des tiroirs (brief §4, construit). B-T04 vide : la rupture de Heineken 20 L d'ENT-6.2. A-T03 : le lot S18 passé ce
// matin de la zone de masse (M05 d'ENT-6.6) au picking, 2 fûts dont 1 cabossé, le plus en avant.
export const EMPLACEMENTS = {
  'A-T01': { ref: 'EAU1L', n: 8, code: '36' },
  'B-T01': { ref: 'LIM1L', n: 6, code: '58' },
  'A-T02': { ref: 'PEL20', n: 5, code: '24' },
  'B-T02': { ref: 'EDW20', n: 4, code: '71' },
  'A-T03': { ref: 'AFF20', lot: 'S18', n: 2, abimes: 1, code: '49' },
  'B-T03': { ref: 'AFF20', lot: 'S24', n: 5, code: '83' },
  'A-T04': { ref: 'HEI30', n: 7, code: '17' },
  'B-T04': { ref: 'HEI20', n: 0, code: '62' },
};

// La commande juste d'ENT-6.2, article par article (quantités CALCULÉES par ENT-6.2).
export const COMMANDE = [
  { article: 'eau', q: ATTENDU.eau },
  ...Object.entries(ATTENDU.futs).map(([article, q]) => ({ article, q })),
  ...(ATTENDU.remplacement && ATTENDU.remplacement.q ? [{ article: ATTENDU.remplacement.article, q: ATTENDU.remplacement.q }] : []),
].filter((l) => l.q > 0);

// L'emplacement de picking d'un article : le tiroir qui en a, côté A d'abord, puis le lot le plus ancien (FIFO).
const travee = (adr) => +adr.slice(3);
const tiroirsDe = (article) => Object.keys(EMPLACEMENTS)
  .filter((adr) => REFERENCES[EMPLACEMENTS[adr].ref].article === article && EMPLACEMENTS[adr].n > 0)
  .sort((a, b) => String(EMPLACEMENTS[a].lot || '').localeCompare(String(EMPLACEMENTS[b].lot || '')) || a.localeCompare(b));

// Les lignes du terminal, dans l'ordre du parcours (de T01, près du quai, vers le fond ; côté A avant B dans une travée). Une ligne
// dont le tiroir a des fûts cabossés attend « Abîmé » pour eux ; sa ligne de remplacement est le tiroir suivant du même article.
export const LIGNES = COMMANDE.map((l) => {
  const [adr, suivant] = tiroirsDe(l.article);
  if (!adr) throw new Error(`ENT-6.7 : aucun tiroir de picking pour ${l.article}`);
  const e = EMPLACEMENTS[adr];
  const ligne = { emplacement: adr, prends: l.q };
  if (e.abimes) {
    if (!suivant) throw new Error(`ENT-6.7 : pas de remplacement pour le tiroir ${adr}`);
    Object.assign(ligne, { attendu: { mot: 'abime', n: Math.min(e.abimes, l.q) }, remplacement: { emplacement: suivant } });
  }
  return ligne;
}).sort((a, b) => travee(a.emplacement) - travee(b.emplacement) || a.emplacement.localeCompare(b.emplacement));

export const ETIQUETTE = 'La Cabane à Malo — Villers-sur-Mer · Tournée de la côte · vendredi 18 juin';
export const REGLES = [
  'Palette client <b>1,20 × 0,80</b> : <b>6 fûts au plus</b>, une seule couche (sur une palette de stock, il y en a 8 : ce n’est pas la même palette).',
  '<b>Jamais un fût sur un casier</b> ; les casiers se posent sur les fûts ou à une place libre.',
  'Un fût abîmé ne part jamais chez le client : <b>signale-le au terminal avec le bon mot</b>.',
  'Film : <b>3 à 5 tours</b>.',
  'Étiquettes : <b>deux côtés opposés + le dessus</b>.',
];
export const REFLEXION = 'Le terminal t’a donné les lignes une par une. Qu’est-ce que tu y as gagné, et qu’est-ce que tu y as perdu, pour faire ta '
  + 'palette ? (L’INRS signale que les préparateurs guidés à la voix ne peuvent plus anticiper leur palette.)';

export const ENTREPOT = {
  id: ENTREPOT_ID,
  libelle: 'Allée de picking',
  mode: 'picking',
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'jeudi 17 juin, 14 h',
    texte: { entrainement: 'La commande de Malo, pour la tournée de la côte demain 6 h. Le terminal te donne les lignes une par une.' } },
  consigne: 'Écoute (ou lis) le terminal, va à l’emplacement, réponds, puis pose.',
  annonce: 'Ce matin, le picking a été réapprovisionné depuis la zone de masse : le lot S18 de M05 est passé dans le tiroir A-T03.',
  plan: { travees: 4, zone: 'Zone de préparation', quai: 'QUAI 14' },
  references: Object.fromEntries(Object.entries(REFERENCES).map(([k, r]) => {
    const { article, ...reste } = r;   // `article` : le lien avec l'univers, pas pour la vue
    return [k, reste];
  })),
  emplacements: EMPLACEMENTS,
  terminal: {
    titre: 'Préparation',
    lignes: LIGNES,
    fin: 'Commande terminée : La Cabane à Malo. Filme et étiquette tes palettes.',
    phraseBilan: 'Chaque réponse au terminal est enregistrée avec son heure. C’est ainsi que l’entreprise mesure la productivité des préparateurs.',
  },
  regles: { entete: 'Les règles de la préparation', lignes: REGLES },
  montage: { palettes: 2, etiquette: ETIQUETTE, reflexion: REFLEXION },
  // Pas de `note` : elle ferait noter la séance par la vue seule (jalons non pondérés, sans les questions), comme une évaluation.
};

// ─────────────────────────────────────────────────────────────── les jalons (10, pondérés : 16 + 4 de questions = 20)
// Poids validés par Tristan le 12/10/2026 : les lignes du terminal 3 (eau 1, Pelforth 1, Heineken 1), le fût abîmé 5 (« Abîmé, 1 »
// puis 1 pris : 3 ; Affligem S24 : 2), le montage 5 (aucun fût sur un casier 2, 6 fûts au plus 2, deux palettes 1), film et
// étiquettes 3 (1,5 + 1,5), plus 4 pour les trois questions notées (`part`). Les `id` sont ceux de la vue (stables).
export const GROUPES = { lignes: 'Les lignes du terminal', abime: 'Le fût abîmé', montage: 'Le montage des palettes',
  film: 'Film et étiquettes' };
export const POIDS = {
  'ligne-A-T01': 1, 'ligne-A-T02': 1, 'ligne-A-T04': 1,
  'ligne-A-T03': 3, 'ligne-B-T03': 2,
  'montage-casier': 2, 'montage-futs': 2, 'montage-palettes': 1,
  'montage-film': 1.5, 'montage-etiquettes': 1.5,
};
export const GROUPE_DE = {
  'ligne-A-T01': GROUPES.lignes, 'ligne-A-T02': GROUPES.lignes, 'ligne-A-T04': GROUPES.lignes,
  'ligne-A-T03': GROUPES.abime, 'ligne-B-T03': GROUPES.abime,
  'montage-casier': GROUPES.montage, 'montage-futs': GROUPES.montage, 'montage-palettes': GROUPES.montage,
  'montage-film': GROUPES.film, 'montage-etiquettes': GROUPES.film,
};
// L'ordre du bandeau de fin : un groupe d'un seul tenant.
export const ORDRE_JALONS = Object.keys(POIDS);
