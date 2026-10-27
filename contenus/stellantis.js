// Stellantis Sochaux (usine du Doubs) — l'univers commun des séances ENT-13.x (Terminale Bac Pro, entreprise n° 13).
// Cadrage : `docs/briefs/stellantis/CADRAGE-stellantis-tle.md` ; briefs `docs/briefs/ENT-13.1` à `13.5` ; choix tranchés par Tristan le 26/10/2026
// (« tout ok », `docs/briefs/stellantis/A-TRANCHER.md`). Temps 1 : la rentrée (13.1 à 13.5). Importable sous Node.
//
// Ce fichier porte ce qui est COMMUN aux séances : identité, charte, l'équipe (construite), les faits réels de l'usine, le magasin des petites pièces
// (construit : ses 24 références, leurs emplacements, leurs prix), les aides de mise en page des documents. Chaque séance apporte ses messages, ses
// données et ses jalons dans `contenus/stellantis-ent13x.js`.
//
// ────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (cadrage §2, recherches du 26/10/2026)
//
// Vérifié : l'usine Stellantis de Sochaux (Doubs), usine Peugeot depuis 1912 ; 3008 (environ 70 %) et 5008 (environ 30 %) sur la même ligne ;
// environ une voiture par minute ; 5 400 CDI et 1 050 intérimaires ; environ 250 camions et 500 fournisseurs par jour ; le stock sur place couvre quelques
// heures à une journée et demie de production ; le transstockeur (4 500 palettes, 4 allées, mis en service le 16/08/2022) répartit chaque référence sur
// les quatre allées ; une pièce parcourt 150 à 200 m du camion à la ligne ; une chaîne à l'arrêt immobilise environ 1 200 personnes (Le Trois, 13/04 et
// 16/07/2026 ; communiqué Stellantis du 05/09/2022). Aucune parole n'est prêtée au responsable logistique cité par la presse.
// Construit, et dit comme tel à l'écran : le magasin des petites pièces (Sochaux ne dit pas comment il range ses petites pièces : c'est un magasin d'usine
// « type »), ses références (des FAMILLES de pièces, jamais une référence constructeur), leurs emplacements, leurs prix, leurs sorties, les camions, les
// prénoms de l'équipe (prénoms seuls). Aucun document Stellantis reproduit : tout est reconstitué, avec mention en pied.
// Charte : le bleu nuit reste au bandeau et au menu (jamais dans la zone de travail : sur les vues de transport, le bleu est le repère « client »).
// Logo : le logotype officiel (SVG de Wikimedia Commons, 27/10/2026) ; voir `activites/index.js`.

export const ENTREPRISE = {
  id: 'stellantis',
  nom: 'Stellantis',
  sousTitre: 'Usine de Sochaux (Doubs) — équipe logistique',
  exercice: 'Approvisionner et gérer le magasin de l’usine',
};

export const VOCAB = {
  unit: 'pièce', unitPl: 'pièces',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'usine-sochaux.example',
};

export const THEME = { accent: '#14284b', papier: true };

export const MENTION = 'Réels : l’usine Stellantis de Sochaux (Doubs), sa ligne unique 3008 et 5008, ses chiffres de logistique (Le Trois, avril et juillet 2026 ; communiqué Stellantis du 05/09/2022). '
  + 'Construits : le magasin des petites pièces, ses références, ses emplacements et ses prix, les camions, tous les prénoms, les messages.';

export const LIEUX = {
  usine: 'Usine Stellantis de Sochaux',
  region: 'Bourgogne-Franche-Comté', departement: 'Doubs', ville: 'Sochaux',
};

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  karim: { prenom: 'Karim', poste: 'chef d’équipe logistique', mail: 'karim@usine-sochaux.example' },
  sandrine: { prenom: 'Sandrine', poste: 'cheffe d’atelier du montage', mail: 'sandrine@usine-sochaux.example' },
};
export const KARIM = { nom: 'Karim', mail: EQUIPE.karim.mail };

// ─────────────────────────────────────────── les dates du scénario (septembre 2027, première période de PFMP)
export const JOURS = {
  mardi: { iso: '2027-09-14', lib: 'mardi 14 septembre 2027' },
  mercredi: { iso: '2027-09-15', lib: 'mercredi 15 septembre 2027' },
  jeudi: { iso: '2027-09-16', lib: 'jeudi 16 septembre 2027' },
  vendredi: { iso: '2027-09-24', lib: 'vendredi 24 septembre 2027' },
};
// Le message daté du scénario (jamais la date réelle) : `iso` + « hh:mm », décalé du temps réellement passé depuis l'ouverture du volet.
export function heureScenario(iso, hhmm, { db = null, volet = null, decalage = 0 } = {}) {
  const [a, m, j] = iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && volet && db.volets && db.volets[volet]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + decalage * 60000 + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}

// ─────────────────────────────────────────── le magasin des petites pièces (CONSTRUIT)
// 24 références, des FAMILLES de pièces d'une voiture. Les 18 premières sont celles du magasin ; les 6 dernières s'ajoutent pour l'élève « confirmé »
// (mêmes contrôles). `pop` : la popularité de départ (1 à 10) — elle ne sert qu'à tirer des sorties vraisemblables (les petites pièces peu chères sortent
// beaucoup, les grosses pièces peu). `prix` : prix d'une pièce, en euros. `emplacement` : `A1-T03-N3-E1` = allée A côté 1, travée 03 (T01 près de la sortie
// du magasin), niveau 3 (N1 sol, N2 hauteur d'homme, N3 en hauteur), emplacement 1. Rangement « d'il y a deux ans » : il ne suit plus la rotation.
export const REFS = [
  { ref: 'VIS-M6', designation: 'Vis hexagonale M6', famille: 'Visserie', prix: 0.04, pop: 10, emplacement: 'A1-T03-N3-E1' },
  { ref: 'ECR-M6', designation: 'Écrou M6', famille: 'Visserie', prix: 0.03, pop: 9, emplacement: 'A1-T03-N1-E1' },
  { ref: 'CLP-PAN', designation: 'Clip de panneau de porte', famille: 'Clips', prix: 0.18, pop: 9, emplacement: 'B1-T03-N2-E1' },
  { ref: 'AGR-PLA', designation: 'Agrafe de garniture', famille: 'Agrafes', prix: 0.12, pop: 8, emplacement: 'A2-T02-N3-E1' },
  { ref: 'CLP-CAB', designation: 'Clip de câble', famille: 'Clips', prix: 0.09, pop: 8, emplacement: 'A2-T03-N2-E1' },
  { ref: 'VIS-M8', designation: 'Vis hexagonale M8', famille: 'Visserie', prix: 0.06, pop: 7, emplacement: 'B2-T02-N1-E1' },
  { ref: 'CAC-MON', designation: 'Cache de montant', famille: 'Caches', prix: 1.6, pop: 6, emplacement: 'B1-T02-N3-E1' },
  { ref: 'AMP-W5', designation: 'Ampoule W5W', famille: 'Éclairage', prix: 0.9, pop: 6, emplacement: 'B2-T03-N3-E1' },
  { ref: 'JNT-POR', designation: 'Joint de porte', famille: 'Joints', prix: 2.4, pop: 5, emplacement: 'A1-T02-N2-E1' },
  { ref: 'POI-INT', designation: 'Poignée intérieure de porte', famille: 'Poignées', prix: 6.8, pop: 5, emplacement: 'B1-T03-N1-E1' },
  { ref: 'AMP-H7', designation: 'Ampoule H7', famille: 'Éclairage', prix: 4.2, pop: 4, emplacement: 'B2-T01-N3-E1' },
  { ref: 'CAC-BAT', designation: 'Cache de batterie', famille: 'Caches', prix: 3.5, pop: 3, emplacement: 'A2-T02-N1-E1' },
  { ref: 'JNT-CAP', designation: 'Joint de capot', famille: 'Joints', prix: 3.1, pop: 3, emplacement: 'B1-T02-N1-E1' },
  { ref: 'POI-EXT', designation: 'Poignée extérieure de porte', famille: 'Poignées', prix: 17.5, pop: 3, emplacement: 'A2-T01-N3-E1' },
  { ref: 'FAS-PLA', designation: 'Faisceau de plafonnier', famille: 'Faisceaux', prix: 14.5, pop: 2, emplacement: 'A1-T01-N2-E1' },
  { ref: 'RET-DRO', designation: 'Rétroviseur droit', famille: 'Rétroviseurs', prix: 82, pop: 2, emplacement: 'B1-T01-N3-E1' },
  { ref: 'RET-GAU', designation: 'Rétroviseur gauche', famille: 'Rétroviseurs', prix: 82, pop: 2, emplacement: 'B2-T01-N1-E1' },
  { ref: 'FAS-HAB', designation: 'Faisceau d’habitacle', famille: 'Faisceaux', prix: 38, pop: 1, emplacement: 'A2-T01-N1-E1' },
  // les six références de plus du confirmé
  { ref: 'FUS-15A', designation: 'Fusible 15 A', famille: 'Électricité', prix: 0.3, pop: 9, emplacement: 'A2-T03-N1-E1' },
  { ref: 'COL-NYL', designation: 'Collier de serrage nylon', famille: 'Fixations', prix: 0.05, pop: 8, emplacement: 'B1-T01-N1-E1' },
  { ref: 'BOU-RES', designation: 'Bouchon de réservoir', famille: 'Bouchons', prix: 2.8, pop: 4, emplacement: 'A1-T02-N1-E1' },
  { ref: 'GRI-AER', designation: 'Grille d’aération', famille: 'Habitacle', prix: 9.5, pop: 3, emplacement: 'B2-T03-N1-E1' },
  { ref: 'SUP-RET', designation: 'Support de rétroviseur', famille: 'Supports', prix: 5.2, pop: 2, emplacement: 'A1-T02-N3-E1' },
  { ref: 'TAP-COF', designation: 'Tapis de coffre', famille: 'Habitacle', prix: 24, pop: 1, emplacement: 'B1-T02-N2-E1' },
];
export const N_STANDARD = 18, N_CONFIRME = 24;
export const refsDe = (n) => REFS.slice(0, n);
export const parRef = Object.fromEntries(REFS.map((r) => [r.ref, r]));
// La référence rangée « au meilleur emplacement » du magasin (près de la sortie, à hauteur d'homme) : l'ancien rangement l'a donné à une pièce qui sort peu.
export const MEILLEUR_EMPLACEMENT = 'A1-T01-N2-E1';
export const REF_AU_MEILLEUR = REFS.find((r) => r.emplacement === MEILLEUR_EMPLACEMENT).ref;
// Les emplacements triés (l'export du logiciel liste « dans l'ordre des emplacements »).
export const parEmplacement = (L) => L.slice().sort((a, b) => (a.emplacement < b.emplacement ? -1 : a.emplacement > b.emplacement ? 1 : 0));

// ─────────────────────────────────────────── aides communes
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const euros = (n) => `${String(Math.round(n * 100) / 100).replace('.', ',')} €`;
export const PIED = 'Document pédagogique — reconstitution, non contractuel.';
export const pied = (texte = PIED) => `<p class="st-pied">${ech(texte)}</p>`;

// La mise en page des documents joints (papier, encre ; le bleu nuit de la charte n'y entre pas).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.st-doc{padding:14px 18px 0}
.st-doc p{margin:0 0 8px}
.st-t{margin:0; font-size:1.08rem; font-weight:800}
.st-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.st-ul{margin:4px 0 0; padding-left:20px; font-size:.92rem}
.st-ul li{margin:4px 0}
.st-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.st-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.st-table th, .st-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left}
.st-table th{color:var(--douce); font-weight:600}
.st-table .st-d{text-align:right; white-space:nowrap}
.st-ex{margin:6px 0 10px}
.st-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
