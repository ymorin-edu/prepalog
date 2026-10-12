// Contenu d'ESSAI du mode « picking » du Plan d'entrepôt (core/types/entrepot-picking.js) — 12/10/2026, chantier D-7 lot 3.
//
// Les données d'ENT-6.7 (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md` §4, étape 1), pour la page
// `outils/essai-entrepot.html` (cas « Allée de picking ») et le bloc de tests `outils/test/entrepot.mjs`. La séance ENT-6.7
// déclarera son propre contenu (`contenus/france-boissons-ent67.js`). Vérifié : la préparation à la voix et les tiroirs
// coulissants sous les racks chez France Boissons (INRS, Travail et Sécurité n° 843, 2022 ; site de l'entreprise). Construit :
// le plan (1 allée, 2 côtés, 4 travées), les emplacements, leurs codes et leurs quantités, le fût cabossé.
// `PICKING` : l'allée seule (lot 3, sans palettes : ses tests). `PICKING_PALETTES` : la même avec le montage des deux palettes
// client (lot 4, brief §4 étape 2 et §5 jalons 6 à 10), celle de la page d'essai.

export const MENTION = 'Contenu d’essai : l’allée de picking d’ENT-6.7 (France Boissons). Plan, emplacements, codes et quantités '
  + '<b>construits</b> ; préparation à la voix et tiroirs coulissants <b>vérifiés</b> chez France Boissons. Règle de pose des palettes '
  + 'client <b>construite</b> (brief). Dessin — scène construite, ce n’est pas la plateforme de Buchelay.';

export const PICKING = {
  id: 'essai-picking',
  libelle: 'Allée de picking',
  mode: 'picking',
  personnage: { nom: 'Nadia', role: 'cheffe de quai', date: 'jeudi 17 juin, 14 h',
    texte: { guidage: 'La commande de Malo, pour la tournée de la côte demain 6 h. Le terminal te donne les lignes une par une.',
      entrainement: 'La commande de Malo, pour la tournée de la côte demain 6 h. Le terminal te donne les lignes une par une.' } },
  consigne: 'Écoute (ou lis) le terminal, va à l’emplacement, réponds.',
  annonce: 'Ce matin, le picking a été réapprovisionné depuis la zone de masse : le lot S18 de M05 est passé dans le tiroir A-T03.',
  plan: { travees: 4, zone: 'Zone de préparation', quai: 'QUAI 14' },
  references: {
    EAU1L: { nom: 'Eau minérale 1 L', court: 'eau minérale', voix: 'Eau minérale, casier de douze bouteilles', type: 'casier', capsule: 'bleu' },
    LIM1L: { nom: 'Limonade 1 L', court: 'limonade', voix: 'Limonade, casier de douze bouteilles', type: 'casier', capsule: 'jaune' },
    PEL20: { nom: 'Pelforth Blonde 20 L', court: 'Pelforth', voix: 'Pelforth Blonde, vingt litres', type: 'fut', litres: 20, bande: 'or' },
    EDW20: { nom: 'Edelweiss 20 L', court: 'Edelweiss', voix: 'Edelweiss, vingt litres', type: 'fut', litres: 20, bande: 'bleu' },
    AFF20: { nom: 'Affligem Blonde 20 L', court: 'Affligem', voix: 'Affligem Blonde, vingt litres', type: 'fut', litres: 20, bande: 'cuivre' },
    HEI30: { nom: 'Heineken 30 L', court: 'Heineken 30 L', voix: 'Heineken, trente litres', type: 'fut', litres: 30, bande: 'rouge' },
    HEI20: { nom: 'Heineken 20 L', court: 'Heineken 20 L', voix: 'Heineken, vingt litres', type: 'fut', litres: 20, bande: 'rouge' },
  },
  emplacements: {
    'A-T01': { ref: 'EAU1L', n: 8, code: '36' },
    'B-T01': { ref: 'LIM1L', n: 6, code: '58' },
    'A-T02': { ref: 'PEL20', n: 5, code: '24' },
    'B-T02': { ref: 'EDW20', n: 4, code: '71' },
    'A-T03': { ref: 'AFF20', lot: 'S18', n: 2, abimes: 1, code: '49' },
    'B-T03': { ref: 'AFF20', lot: 'S24', n: 5, code: '83' },
    'A-T04': { ref: 'HEI30', n: 7, code: '17' },
    'B-T04': { ref: 'HEI20', n: 0, code: '62' },
  },
  terminal: {
    titre: 'Préparation',
    lignes: [
      { emplacement: 'A-T01', prends: 3 },
      { emplacement: 'A-T02', prends: 2 },
      { emplacement: 'A-T03', prends: 2, attendu: { mot: 'abime', n: 1 }, remplacement: { emplacement: 'B-T03' } },
      { emplacement: 'A-T04', prends: 6 },
    ],
    fin: 'Commande terminée : La Cabane à Malo. Filme et étiquette tes palettes.',
    phraseBilan: 'Chaque réponse au terminal est enregistrée avec son heure. C’est ainsi que l’entreprise mesure la productivité des préparateurs.',
  },
  regles: { entete: 'Les règles de la préparation', lignes: [
    'Un fût abîmé ne part jamais chez le client : <b>signale-le au terminal avec le bon mot</b>.',
    'Le terminal te donne le code de contrôle à lire : il est sur l’<b>étiquette de la lisse</b>, devant le tiroir.',
  ] },
  note: { sur: 20 },
};

// La même allée, avec les deux palettes client à monter (lot 4). Construit : la règle de pose, le texte de l'étiquette (la commande
// de Malo d'ENT-6.2, tournée de la côte). Vérifié : 6 fûts au plus vers les clients (palette 1,20 × 0,80, INRS ED 135).
export const PICKING_PALETTES = Object.assign({}, PICKING, {
  id: 'essai-picking-palettes',
  consigne: 'Écoute (ou lis) le terminal, va à l’emplacement, réponds, puis pose.',
  regles: { entete: 'Les règles de la préparation', lignes: [
    'Palette client <b>1,20 × 0,80</b> : <b>6 fûts au plus</b>, une seule couche (sur une palette de stock, il y en a 8 : ce n’est pas la même palette).',
    '<b>Jamais un fût sur un casier</b> ; les casiers se posent sur les fûts ou à une place libre.',
    'Un fût abîmé ne part jamais chez le client : <b>signale-le au terminal avec le bon mot</b>.',
    'Film : <b>3 à 5 tours</b>.',
    'Étiquettes : <b>deux côtés opposés + le dessus</b>.',
  ] },
  montage: {
    palettes: 2,
    etiquette: 'La Cabane à Malo — Villers-sur-Mer · Tournée de la côte · vendredi 18 juin',
    reflexion: 'Le terminal t’a donné les lignes une par une. Qu’est-ce que tu y as gagné, et qu’est-ce que tu y as perdu, pour faire ta palette ? (L’INRS signale que les préparateurs guidés à la voix ne peuvent plus anticiper leur palette.)',
  },
});
