// Contenu d'ESSAI du mode « picking » du Plan d'entrepôt (core/types/entrepot-picking.js) — 12/10/2026, chantier D-7 lot 3.
//
// Les données d'ENT-6.7 (brief `docs/briefs/ENT-6.7-france-boissons-preparation.md` §4, étape 1), pour la page
// `outils/essai-entrepot.html` (cas « Allée de picking ») et le bloc de tests `outils/test/entrepot.mjs`. La séance ENT-6.7
// déclarera son propre contenu (`contenus/france-boissons-ent67.js`). Vérifié : la préparation à la voix et les tiroirs
// coulissants sous les racks chez France Boissons (INRS, Travail et Sécurité n° 843, 2022 ; site de l'entreprise). Construit :
// le plan (1 allée, 2 côtés, 4 travées), les emplacements, leurs codes et leurs quantités, le fût cabossé.
// Le montage des palettes (lot 4) n'est pas encore là : les lignes n'attendent aucune pose.

export const MENTION = 'Contenu d’essai : l’allée de picking d’ENT-6.7 (France Boissons). Plan, emplacements, codes et quantités '
  + '<b>construits</b> ; préparation à la voix et tiroirs coulissants <b>vérifiés</b> chez France Boissons. Les palettes client arrivent au '
  + 'lot 4. Dessin — scène construite, ce n’est pas la plateforme de Buchelay.';

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
