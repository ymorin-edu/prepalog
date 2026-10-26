// Mondial Relay (hub et agence de Buchères, Aube) — l'univers commun des séances ENT-11.x (scénario S3 de la 2de GATL,
// scénario d'ÉVALUATION). Cadrage : `docs/briefs/mondial-relay/CADRAGE-S3-mondial-relay.md` (validé par Tristan le 26/10/2026).
//
// Ce fichier porte ce qui est COMMUN aux sept séances : identité, charte, lieux, l'équipe (construite), le fil rouge (le
// colis d'Inès), les tournées de l'agence (le plan de tri), les règles du colis et les extraits des conditions de vente.
// Chaque séance apporte ses messages, ses données et ses jalons dans `contenus/mondial-relay-ent11x.js`.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (cadrage §2)
//
// Vérifié (26/10/2026) : Mondial Relay, créé en 1997 par Les 3 Suisses, racheté par InPost en juillet 2021 ; pic de fin
// octobre à mi-janvier (volume doublé, plus de 8 millions de colis par semaine visés, 3 000 personnes mobilisées, service
// client de plus de 350 conseillers) — communiqué « Peak 2025 » du 23/10/2025 ; hub de Buchères (Parc logistique de
// l'Aube) en service depuis juin 2024, 7 000 m², près de 80 salariés en CDI ou en intérim, machine de tri jusqu'à 11 000
// colis par heure, l'un des cinq hubs nationaux et aussi une agence (livraison et collecte dans l'Aube et la Marne),
// du lundi au samedi — Canal 32, 26/05/2026 ; Points Relais livrés du mardi au samedi pendant leurs heures d'ouverture
// (FAQ Mondial Relay) ; règles du colis et réclamations : conditions générales de vente, offre Start, 07/01/2026.
// Communes et codes postaux : réels.
//
// Construit, et annoncé comme tel à l'écran : les tournées et le plan de tri, les commerces Points Relais, leurs horaires,
// tous les prénoms, tous les messages, le colis du fil rouge et sa cliente. Aucun salarié réel, aucun visage.
// Charte : la couleur réelle de la marque n'est pas relevée ; accent bordeaux CONSTRUIT (teinte rouge : le moteur le garde
// au bandeau et au menu, jamais dans la zone de travail, décision du 05/10/2026). Logo : `contenus/trames/logos/mondial-relay.png`
// (image fournie par Tristan le 26/10/2026 ; fond blanc extérieur rendu transparent, recadré, SHA-256 de l'original 2737a5ad…576ff).

export const LOGO = './contenus/trames/logos/mondial-relay.png';

export const ENTREPRISE = {
  id: 'mondial-relay',
  logo: LOGO,
  nom: 'Mondial Relay',
  sousTitre: 'Hub et agence de Buchères (10)',
  exercice: 'Le pic de fin d’année',
};

export const VOCAB = {
  unit: 'colis', unitPl: 'colis',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'mr-bucheres.example',
};

export const THEME = { accent: '#8a1538', papier: true };

export const MENTION = 'Réels : Mondial Relay (groupe InPost) et son hub de Buchères (Aube), en service depuis juin 2024 ; '
  + 'les règles du colis et des réclamations (conditions de vente de Mondial Relay, janvier 2026) ; les communes de l’Aube. '
  + 'Construit : les tournées, les commerces Points Relais, tous les prénoms, tous les messages.';

export const LIEUX = {
  hub: 'Hub et agence Mondial Relay de Buchères (Aube)',
  region: 'Grand Est', departement: 'Aube', ville: 'Buchères',
  zone: 'l’Aube et la Marne',
  date: 'décembre, au pic de fin d’année',
};

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  romain: { prenom: 'Romain', poste: 'chef d’équipe du tri (nuit)' },
  samia: { prenom: 'Samia', poste: 'responsable d’exploitation de l’agence' },
  claire: { prenom: 'Claire', poste: 'responsable du service client' },
  helene: { prenom: 'Hélène', poste: 'responsable des ressources humaines du hub' },
};

// ─────────────────────────────────────────── le fil rouge (construit)
// Inès, particulière à Reims, vend une lampe en céramique d'occasion ; l'acheteur retire au Point Relais de Bar-sur-Seine.
export const FIL_ROUGE = {
  expeditrice: { prenom: 'Inès', nom: 'Garnier', ville: 'Reims' },
  objet: 'une lampe en céramique d’occasion',
  colis: 'MR 4417 2184',
  destination: { commune: 'Bar-sur-Seine', relais: 'Quincaillerie Régnier' },
};

// ─────────────────────────────────────────── les tournées de l'agence (plan de tri ; communes et CP réels, tournées construites)
export const TOURNEES = [
  { id: 'T1', nom: 'Troyes', communes: [['Troyes', '10000']] },
  { id: 'T2', nom: 'Agglo ouest', communes: [['Sainte-Savine', '10300'], ['La Chapelle-Saint-Luc', '10600'], ['Saint-André-les-Vergers', '10120'], ['Rosières-près-Troyes', '10430'], ['Pont-Sainte-Marie', '10150']] },
  { id: 'T3', nom: 'Sud', communes: [['Saint-Julien-les-Villas', '10800'], ['Buchères', '10800'], ['Bréviandes', '10450'], ['Bar-sur-Seine', '10110'], ['Chaource', '10210'], ['Les Riceys', '10340']] },
  { id: 'T4', nom: 'Nord-ouest', communes: [['Romilly-sur-Seine', '10100'], ['Nogent-sur-Seine', '10400'], ['Arcis-sur-Aube', '10700']] },
  { id: 'T5', nom: 'Est', communes: [['Bar-sur-Aube', '10200'], ['Vendeuvre-sur-Barse', '10140'], ['Brienne-le-Château', '10500']] },
];
export const TOURNEE_DE = Object.fromEntries(TOURNEES.flatMap(t => t.communes.map(([c]) => [c, t.id])));
export const CODE_POSTAL = Object.fromEntries(TOURNEES.flatMap(t => t.communes.map(([c, cp]) => [c, cp])));

// ─────────────────────────────────────────── règles du colis (CGV offre Start, 07/01/2026, art. 2.1 et 10)
export const REGLES_COLIS = {
  relais: { poidsMax: 30, longueurMax: 120, sommeMax: 150 },
  locker: { poidsMax: 25, longueurMax: 64, sommeMax: 142 },
  joursAuRelais: 5,
  livraisonRelais: 'du mardi au samedi, pendant les heures d’ouverture du Point Relais',
};

// ─────────────────────────────────────────── extraits des conditions de vente (reformulés au plus près ; source datée)
export const SOURCE_CGV = 'Conditions générales de vente Mondial Relay, offre Start, version du 07/01/2026';
export const CGV = {
  art11: [
    'Pour un dommage visible, la réclamation doit être faite dans les 72 heures suivant la livraison (jours fériés exclus).',
    'Au Point Relais, le destinataire doit refuser le colis abîmé pour que la réclamation soit recevable.',
    'Les réserves doivent être précises et motivées, écrites sur le document de livraison.',
  ],
  art12: [
    'En cas de perte ou d’avarie, l’indemnité est limitée à 25 € par colis. Les frais d’envoi ne sont pas remboursés.',
    'Une assurance en option permet d’être indemnisé au-delà, jusqu’à 500 € selon le niveau choisi.',
  ],
};
