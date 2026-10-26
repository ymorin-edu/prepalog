// IKEA (centre de distribution clients de Gennevilliers, Hauts-de-Seine) — l'univers commun des séances ENT-12.x (2de GATL, entreprise n° 12).
// Cadrage : `docs/briefs/ikea/CADRAGE-ikea-2de.md` ; choix tranchés par Tristan le 26/10/2026 (« tout ok », `docs/briefs/ikea/A-TRANCHER.md`).
//
// Ce fichier porte ce qui est COMMUN aux séances : identité, charte, l'équipe (construite), le fil rouge (la commande de Mme Benali), les modes de
// livraison et leurs prix (relevés sur la page « Livraison » d'IKEA France le 26/10/2026), les règles de choix du mode, le tarif du prestataire de
// livraison (CONSTRUIT). Chaque séance apporte ses messages, ses données et ses jalons dans `contenus/ikea-ent12x.js`. Importable sous Node.
//
// ────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (cadrage §2)
//
// Vérifié (26/10/2026) : IKEA France, ses centres de distribution clients dont celui de Gennevilliers (inauguré le 29/01/2019, 50 000 m²,
// 71 portes de quai), la livraison par la Seine depuis le 14/12/2022 (péniche jusqu'à Bercy, puis utilitaires électriques) ; les modes de livraison, leurs
// conditions et leurs prix (page « Livraison » d'IKEA France, relevée le 26/10/2026 ; les prix peuvent changer) ; les conditions générales de vente
// (version du 10/08/2026) : engagement sur la date et le créneau, reprise de l'ancien meuble, délai de 72 h.
// Construit, et dit comme tel à l'écran : Mme Benali et sa commande, les prénoms des salariés (prénoms seuls), les articles, leurs poids et leurs prix, le
// prestataire de livraison (jamais nommé) et son tarif, les camions, les créneaux. Aucun document IKEA réel reproduit : tout est reconstitué, avec mention.
// Charte : le bleu d'IKEA reste au bandeau et au menu (repère « client » des vues de transport : jamais dans la zone de travail). Logo : `contenus/trames/logos/ikea.svg` (Wikimedia Commons, domaine public mais marque déposée ; accord de Tristan, 26/10/2026), ovale jaune sur fond bleu.

export const LOGO = './contenus/trames/logos/ikea.svg';

export const ENTREPRISE = {
  id: 'ikea',
  logo: LOGO,
  nom: 'IKEA',
  sousTitre: 'Centre de distribution clients de Gennevilliers (92)',
  exercice: 'Livrer les clients d’Île-de-France',
};

export const VOCAB = {
  unit: 'colis', unitPl: 'colis',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'cdc-gennevilliers.example',
};

export const THEME = { accent: '#0058a3', papier: true };

export const MENTION = 'Réels : IKEA France et son centre de distribution clients de Gennevilliers (Hauts-de-Seine), la livraison par la Seine, les modes de livraison '
  + 'et leurs prix (page « Livraison » d’IKEA France, relevée le 26/10/2026), les conditions de vente. '
  + 'Construit : Mme Benali et sa commande, tous les prénoms, les messages, le prestataire de livraison (jamais nommé) et son tarif.';

export const LIEUX = {
  cdc: 'Centre de distribution clients IKEA de Gennevilliers',
  region: 'Île-de-France', departement: 'Hauts-de-Seine', ville: 'Gennevilliers',
};

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  claire: { prenom: 'Claire', poste: 'responsable du service livraison' },
  hugo: { prenom: 'Hugo', poste: 'responsable administratif du service transport' },
  nadia: { prenom: 'Nadia', poste: 'cheffe de quai' },
  karim: { prenom: 'Karim', poste: 'chef d’équipe de la préparation' },
};

// ─────────────────────────────────────────── les modes de livraison (page « Livraison » d'IKEA France, 26/10/2026)
export const MODES = [
  { v: 'relais', lib: 'Point Relais' },
  { v: 'colis', lib: 'Colis à domicile' },
  { v: 'devant', lib: 'Devant chez vous' },
  { v: 'piece', lib: 'Dans la pièce de votre choix' },
];
export const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;

// Les limites du Point Relais et du colis à domicile : chaque article < 19 kg et au plus 115 cm ; commande < 20 kg (Point Relais), < 60 kg (colis).
export const LIMITES = {
  article: { poidsMax: 19, cote: 115 },
  relais: { commandeMax: 20 },
  colis: { commandeMax: 60 },
  devant: { commandeMax: 1000 },     // « devant chez vous » : commande de moins de 1 000 € (CGV art. 4.1.2.1)
};

// Les prix de livraison : { non-membre, membre }. Les tranches se lisent sur le montant de la commande (en euros).
export const PRIX_FIXES = { relais: { non: 7, membre: 2 }, colis: { non: 14, membre: 9 } };
export const TRANCHES = {
  devant: [[500, 60, 40], [1000, 80, 60]],                                          // [jusqu'à, non-membre, membre]
  piece: [[500, 80, 60], [1000, 100, 80], [2500, 150, 130], [3500, 220, 200], [Infinity, 320, 300]],
};
export const prixMode = (mode, montant, membre) => {
  if (PRIX_FIXES[mode]) return PRIX_FIXES[mode][membre ? 'membre' : 'non'];
  const t = (TRANCHES[mode] || []).find(([max]) => montant <= max);
  return t ? t[membre ? 2 : 1] : NaN;
};

// ─────────────────────────────────────────── le fil rouge (construit)
export const FIL_ROUGE = {
  cliente: { prenom: 'Leïla', nom: 'Benali', appel: 'Mme Benali', ville: 'Paris 11e' },
  commande: 'FR-2703-4418',
};

// ─────────────────────────────────────────── aides communes
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const euros = (n) => `${String(Math.round(n * 100) / 100).replace('.', ',')} €`;
export const PIED = 'Document pédagogique — reconstitution, non contractuel.';
export const pied = (texte = PIED) => `<p class="ik-pied">${ech(texte)}</p>`;

// Un nombre saisi (« 79 », « 79,00 », « 79 € »…).
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace('€', '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

// La mise en page des documents joints (papier, encre ; le bleu d'IKEA n'y entre pas).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.ik-doc{padding:14px 18px 0}
.ik-doc p{margin:0 0 8px}
.ik-t{margin:0; font-size:1.08rem; font-weight:800}
.ik-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.ik-ul{margin:4px 0 0; padding-left:20px; font-size:.92rem}
.ik-ul li{margin:4px 0}
.ik-loi{margin:2px 0 6px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ik-dl{display:grid; grid-template-columns:170px 1fr; gap:5px 12px; margin:6px 0 10px; font-size:.9rem}
.ik-dl dt{color:var(--douce)}
.ik-dl dd{margin:0}
.ik-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.ik-table th, .ik-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left}
.ik-table th{color:var(--douce); font-weight:600}
.ik-table .ik-d{text-align:right; white-space:nowrap}
.ik-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// Le tableau des modes et des prix (document commun à 12.1, 12.2 et 12.7).
export const htmlTarifs = () => `
    <table class="ik-table">
      <thead><tr><th scope="col">Mode</th><th scope="col">Pour qui</th><th class="ik-d" scope="col">Non-membre</th><th class="ik-d" scope="col">Membre IKEA Family</th></tr></thead>
      <tbody>
        <tr><td>Point Relais</td><td>Chaque article de moins de 19 kg et 115 cm au plus ; commande de moins de 20 kg</td><td class="ik-d">7 €</td><td class="ik-d">2 €</td></tr>
        <tr><td>Colis à domicile</td><td>Chaque article de moins de 19 kg et 115 cm au plus ; commande de moins de 60 kg</td><td class="ik-d">14 €</td><td class="ik-d">9 €</td></tr>
        <tr><td rowspan="2">Devant chez vous<br><small>au pied de l’immeuble</small></td><td>Commande jusqu’à 500 €</td><td class="ik-d">60 €</td><td class="ik-d">40 €</td></tr>
        <tr><td>Commande de 500,01 à 1 000 € (pas au-delà)</td><td class="ik-d">80 €</td><td class="ik-d">60 €</td></tr>
        <tr><td rowspan="5">Dans la pièce de votre choix<br><small>le livreur monte l’article</small></td><td>Commande jusqu’à 500 €</td><td class="ik-d">80 €</td><td class="ik-d">60 €</td></tr>
        <tr><td>De 500,01 à 1 000 €</td><td class="ik-d">100 €</td><td class="ik-d">80 €</td></tr>
        <tr><td>De 1 000,01 à 2 500 €</td><td class="ik-d">150 €</td><td class="ik-d">130 €</td></tr>
        <tr><td>De 2 500,01 à 3 500 €</td><td class="ik-d">220 €</td><td class="ik-d">200 €</td></tr>
        <tr><td>Plus de 3 500 €</td><td class="ik-d">320 €</td><td class="ik-d">300 €</td></tr>
      </tbody>
    </table>`;
