// France Boissons (Buchelay, Yvelines) — l'univers commun des séances ENT-6.x (scénario S2 de la 2de GATL).
// Créé par ENT-6.1 (brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md` §6), la première séance construite.
//
// Ce fichier porte ce qui est COMMUN aux dix séances : identité, charte, lieux, l'équipe de la plateforme (les
// destinataires d'un message à transférer), le lexique, et deux documents communs : l'ORGANIGRAMME complet et
// l'ANNUAIRE (les six fiches « qui suis-je »), que les séances 6.2 à 6.10 joignent à leur premier message
// (idée de Tristan du 07/10/2026). ENT-6.1 dessine le même organigramme avec les cases vides de l'élève
// (`organigrammeHtml({ vides })`). Chaque séance apporte ses messages, ses fiches et ses jalons.
// ENT-6.2 ajoute la vente aux CHR, commune à la S2 : le stock de Buchelay, les conditions de vente, les montants de consigne,
// le client La Cabane à Malo, et les mots de la commande au lexique.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (brief ENT-6.1 §2, recopié tel quel)
//
// Vérifié (Cowork, 05/10/2026) : France Boissons, filiale de Heineken ; plateforme de Buchelay (78), inaugurée le
// 16/06/2025, 80 salariés (150 à terme), 35 quais, livre du nord-ouest parisien à la côte normande ; transport pour
// compte propre. Vérifié (Cowork, 07/10/2026, vidéo « Présentation de la Plateforme de France Boissons à Buchelay »,
// Grand Paris Seine & Oise, YouTube, 20/06/2025) : 18 tournées en basse saison, jusqu'à 30 en haute saison ;
// « Objectif prioritaire : 0 accident » ; 10 camions électriques. La vidéo n'est PAS dans le site (aucune requête hors
// du domaine) : l'enseignant la projette lui-même (lien dans le corrigé enseignant).
//
// Construit, et annoncé comme tel à l'écran : l'organigramme de la plateforme, les intitulés de poste, tous les
// prénoms, tous les messages. L'organigramme réel n'est pas public ; on ne nomme aucun dirigeant réel. Documents
// reconstitués : mention en pied. Aucun visage, aucune parole prêtée à un salarié réel.
//
// Logo : `contenus/trames/logos/france-boissons.svg`, copie exacte du logo du site (chantier D-E, 09/10/2026, accord
// de Tristan du 05/10). Charte (relevé `docs/briefs/france-boissons/charte-france-boissons.md`) : l'orange du logo
// (#F39200) est trop clair pour porter du texte ; l'accent est cet orange FONCÉ #b34700 (5,50 avec du blanc, 4,88 sur
// le papier), CONSTRUIT pour la lisibilité, à valider à l'écran. Teinte 24° : ni rouge ni vert, le moteur le garde dans
// la zone de travail ; distinct du vert « juste » (#0B7A41). Papier imposé : le brun de « FRANCE » disparaîtrait sur
// fond sombre.

import { catalogueSimple } from './entreprise-commun.js';

export const ENTREPRISE = {
  id: 'france-boissons',
  nom: 'France Boissons',
  sousTitre: 'Plateforme logistique de Buchelay (78)',
  exercice: 'Bienvenue à Buchelay',
  logo: './contenus/trames/logos/france-boissons.svg',
};

export const VOCAB = {
  unit: 'fût', unitPl: 'fûts',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'fb-buchelay.example',
};

export const THEME = { accent: '#b34700', papier: true };

// Ce qui est réel et ce qui est construit, dit à l'élève (accueil des séances). Mention du brief §2, mot pour mot.
export const MENTION = 'Réels : France Boissons (filiale de Heineken) et sa plateforme logistique de Buchelay (Yvelines), '
  + 'inaugurée en juin 2025. Construit : l’organigramme de la plateforme, les intitulés de poste, tous les prénoms, tous les messages.';

export const LIEUX = {
  plateforme: 'Plateforme logistique France Boissons de Buchelay (78)',
  zone: 'du nord-ouest parisien à la côte normande',
};

// ─────────────────────────────────────────── l'équipe de la plateforme (construite)
// Les six personnes de l'organigramme, dans l'ORDRE DE L'ANNUAIRE (c'est l'ordre de la liste « Transférer à… »).
// Format attendu par le moteur (`equipe`, `core/types/transfert.js`) : { id: { nom, role, appel? } }. Des prénoms
// seuls (aucun nom de famille n'est donné par les briefs) : `nom` est donc le prénom. Collègues : au TU.
export const EQUIPE = {
  helene: { nom: 'Hélène', role: 'directrice de la plateforme', registre: 'tu' },
  ines: { nom: 'Inès', role: 'assistante administrative (ventes et RH)', registre: 'tu' },
  thomas: { nom: 'Thomas', role: 'responsable d’entrepôt', registre: 'tu' },
  nadia: { nom: 'Nadia', role: 'cheffe d’équipe quai et préparation', registre: 'tu' },
  karim: { nom: 'Karim', role: 'responsable d’exploitation transport', registre: 'tu' },
  lucas: { nom: 'Lucas', role: 'chauffeur-livreur (tournée de la côte)', registre: 'tu' },
};
export const ORDRE_ANNUAIRE = Object.keys(EQUIPE);
// Les personnes extérieures citées par les séances : au VOUS (dans les deux sens).
export const EXTERIEURS = {
  malo: { nom: 'Malo', role: 'gérant de La Cabane à Malo (bar de la côte)', registre: 'vous', mail: 'contact@cabane-a-malo.example' },
};
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────── le lexique commun (mots cliquables, tournure neutre)
export const LEXIQUE = {
  organigramme: 'Schéma qui montre comment une entreprise est organisée : les services, les postes et qui dirige qui.',
  'lien hiérarchique': 'Lien entre un chef et la personne qu’il dirige : le chef donne le travail, décide et valide les demandes.',
  'lien fonctionnel': 'Lien entre deux personnes qui travaillent ensemble sans que l’une soit le chef de l’autre : l’une aide, informe ou donne une règle à suivre.',
  service: 'Partie de l’entreprise qui s’occupe d’une même activité : l’entrepôt, le transport, l’administration…',
  'rendre compte': 'Informer son chef de ce qu’on a fait et de ce qui pose problème.',
  exploitation: 'En transport, l’organisation des tournées : quels chauffeurs, quels camions, quels clients, à quelle heure.',
  transférer: 'Envoyer à une autre personne un message qu’on a reçu, pour qu’elle s’en occupe.',
  fût: 'Tonneau en métal qui contient la bière livrée aux bars et aux restaurants.',
  consigne: 'Somme payée pour un emballage (fût, casier) et rendue quand on le rapporte vide.',
  // ENT-6.2 (la commande de La Cabane à Malo).
  vides: 'Emballages consignés que le client rend vides (fûts, casiers) : le chauffeur les reprend à la livraison.',
  casier: 'Caisse en plastique qui range les bouteilles (ici, 12 bouteilles d’eau d’1 litre). Il est consigné, comme le fût.',
  CHR: 'Cafés, hôtels, restaurants : les clients professionnels qui servent des boissons (bars, restaurants, hôtels…).',
  rupture: 'Rupture de stock : il n’y a pas assez d’un article en stock pour livrer la quantité demandée.',
  'minimum de commande': 'Quantité la plus petite qu’un client doit commander pour être livré.',
  tournée: 'Trajet d’un camion qui livre à la suite plusieurs clients d’un même secteur, un jour fixé.',
  'bon de commande': 'Document qui dit ce qu’on va livrer au client : les articles, les quantités, le jour de livraison.',
};

// ─────────────────────────────────────────── la vente aux CHR (ENT-6.2, repris par les séances suivantes de S2)
// VÉRIFIÉ (brief ENT-6.2 §2) : les marques (Heineken, Affligem, Pelforth, Edelweiss : marques de Heineken France ; Affligem
// Blonde et Pelforth Blonde existent en fût de 20 L) et les montants de consigne de l'arrêté du 6 février 2026, en vigueur
// le 1er janvier 2027 (40 € par fût de 20 à 50 L, 4 € par casier), valables pour toute la S2.
// CONSTRUIT : les stocks, le minimum de commande, l'heure limite, le jour de tournée, le client et son numéro.

// Les montants de consigne, en euros (arrêté du 6 février 2026).
export const CONSIGNES = { fut: 40, casier: 4 };

// L'extrait du stock de Buchelay, le mardi 15 juin 2027 à 9 h (brief ENT-6.2 §4, recalé sur le plan de stockage de masse
// d'ENT-6.5 : le stock reste le même d'une séance à l'autre). Dans l'ordre du document. `biere` : 'blonde' ou 'blanche'
// (absent = pas une bière) ; `de` : le complément « de … » d'une phrase (« 2 fûts de Pelforth Blonde 20 L »).
export const STOCK_BUCHELAY = [
  { id: 'heineken30', nom: 'Heineken', marque: 'Heineken', format: 'fût 30 L', litres: 30, biere: 'blonde', dispo: 16, court: 'Heineken fût 30 L', de: 'de Heineken 30 L' },
  { id: 'affligem20', nom: 'Affligem Blonde', marque: 'Affligem', format: 'fût 20 L', litres: 20, biere: 'blonde', dispo: 2, court: 'Affligem Blonde fût 20 L', de: 'd’Affligem' },
  { id: 'pelforth20', nom: 'Pelforth Blonde', marque: 'Pelforth', format: 'fût 20 L', litres: 20, biere: 'blonde', dispo: 24, court: 'Pelforth Blonde fût 20 L', de: 'de Pelforth Blonde 20 L' },
  { id: 'edelweiss20', nom: 'Edelweiss (bière blanche)', marque: 'Edelweiss', format: 'fût 20 L', litres: 20, biere: 'blanche', dispo: 24, court: 'Edelweiss fût 20 L', de: 'd’Edelweiss' },
  { id: 'heineken20', nom: 'Heineken', marque: 'Heineken', format: 'fût 20 L', litres: 20, biere: 'blonde', dispo: 0, court: 'Heineken fût 20 L', de: 'de Heineken 20 L' },
  { id: 'eau', nom: 'Eau minérale plate 1 L, verre consigné', marque: 'eau', format: 'casier de 12', dispo: 60, court: 'Eau plate 1 L (casier de 12)', de: 'd’eau plate' },
];
export const article = (id) => STOCK_BUCHELAY.find((a) => a.id === id);

// Les conditions de vente aux CHR (extrait, construit).
export const CONDITIONS_CHR = { minimumFuts: 10, heureLimite: 12 };

// Le client de S2 : le bar de Malo (construit, nom vérifié libre par Cowork). `tournee` : jour de la semaine (5 = vendredi).
export const CABANE = {
  nom: 'La Cabane à Malo', type: 'bar de plage', ville: 'Villers-sur-Mer (14)', numero: 'C-14-2047',
  tournee: { nom: 'tournée de la côte', jour: 5 }, ouverture: '10 h',
  consignes: { futs: 9, casiers: 5 },   // emballages consignés chez le client (ses vides)
};

// Pas d'article en jeu dans la séance d'ouverture : un catalogue vide, une base neuve. Les séances qui manipulent des
// produits (6.2, 6.4…) apporteront leur catalogue.
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};

export function baseDeDepart() {
  return {
    v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
    customers: [], suppliers: [], seq: 1, _depart: [],
  };
}

// ─────────────────────────────────────────── les documents communs
// L'organigramme est dessiné en SVG dans le document (aucun fichier, aucune image extérieure). Traits PLEINS = lien
// hiérarchique, POINTILLÉS = lien fonctionnel (on distingue par la forme, jamais par la couleur : tout est à l'encre).
// Les postes, leur place (coordonnées du dessin) et l'ORDRE DE LECTURE (de haut en bas, puis de gauche à droite) :
// les cases vides d'ENT-6.1 reçoivent leurs lettres A, B, C (D) dans cet ordre.
export const POSTES = {
  helene: { x: 220, y: 6, titre: ['directrice', 'de la plateforme'] },
  ines: { x: 15, y: 120, titre: ['assistante', 'administrative', '(ventes et RH)'] },
  thomas: { x: 220, y: 120, titre: ['responsable', 'd’entrepôt'] },
  karim: { x: 425, y: 120, titre: ['responsable', 'd’exploitation', 'transport'] },
  nadia: { x: 220, y: 238, titre: ['cheffe d’équipe', 'quai et préparation'] },
  lucas: { x: 425, y: 238, titre: ['chauffeur-livreur', '(tournée de la côte)'] },
};
export const ORDRE_LECTURE = Object.keys(POSTES).slice().sort((a, b) => POSTES[a].y - POSTES[b].y || POSTES[a].x - POSTES[b].x);
const L = 160, H = 82;

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function boite(id, lettre) {
  const P = POSTES[id], cx = P.x + L / 2;
  if (lettre) {
    return `<g data-og-case="${lettre}"><rect class="og-vide" x="${P.x}" y="${P.y}" width="${L}" height="${H}" rx="6"/>
      <text class="og-case-mot" x="${cx}" y="${P.y + 24}" text-anchor="middle">Case</text>
      <text class="og-case-lettre" x="${cx}" y="${P.y + 66}" text-anchor="middle">${lettre}</text></g>`;
  }
  const t = P.titre.map((l, i) => `<text class="og-titre" x="${cx}" y="${P.y + 42 + i * 16}" text-anchor="middle">${ech(l)}</text>`).join('');
  return `<g data-og-poste="${id}"><rect class="og-boite" x="${P.x}" y="${P.y}" width="${L}" height="${H}" rx="6"/>
    <text class="og-nom" x="${cx}" y="${P.y + 23}" text-anchor="middle">${ech(EQUIPE[id].nom)}</text>${t}</g>`;
}

// L'organigramme. `vides` : { poste: 'A', … } — les cases vides et leur lettre (ENT-6.1) ; vide = l'organigramme complet.
// Une case vide ne garde ni nom ni intitulé : l'élève la retrouve par la place dans le dessin et par les fiches.
export function organigrammeHtml({ vides = {}, titre = 'Organigramme simplifié de la plateforme de Buchelay' } = {}) {
  const h = (d) => `<path class="og-h" d="${d}"/>`;
  const f = (d) => `<path class="og-f" d="${d}"/>`;
  const decrit = Object.keys(vides).length
    ? `Organigramme de la plateforme, avec ${Object.keys(vides).length} cases vides marquées par une lettre.`
    : 'Organigramme complet de la plateforme.';
  return `<article class="fb-og" aria-label="${ech(titre)}">
    <p class="fb-t">${ech(titre)}</p>
    <p class="fb-st">France Boissons · plateforme logistique de Buchelay (78)</p>
    <svg viewBox="0 0 600 394" role="img" aria-label="${ech(decrit)}">
      ${h('M300 88V104M95 104H505M95 104V120M300 104V120M505 104V120')}
      ${h('M300 202V238M300 320V346M505 202V238M505 220H592V367H575')}
      ${f('M95 202V238')}
      ${f('M380 279H425')}
      <text class="og-repere" x="402.5" y="270" text-anchor="middle">1</text>
      ${ORDRE_LECTURE.map((id) => boite(id, vides[id])).join('')}
      <rect class="og-fboite" x="15" y="238" width="${L}" height="${H}" rx="6"/>
      <text class="og-nom og-petit" x="95" y="260" text-anchor="middle">tous les services</text>
      <text class="og-titre" x="95" y="279" text-anchor="middle">congés, contrats,</text>
      <text class="og-titre" x="95" y="295" text-anchor="middle">candidatures,</text>
      <text class="og-titre" x="95" y="311" text-anchor="middle">commandes clients</text>
      <rect class="og-groupe" x="225" y="346" width="150" height="42" rx="5"/>
      <text class="og-groupe-t" x="300" y="372" text-anchor="middle">préparateurs, caristes</text>
      <rect class="og-groupe" x="430" y="346" width="150" height="42" rx="5"/>
      <text class="og-groupe-t" x="505" y="363" text-anchor="middle">6 autres</text>
      <text class="og-groupe-t" x="505" y="380" text-anchor="middle">chauffeurs-livreurs</text>
    </svg>
    <div class="fb-legende">
      <p><svg class="fb-ech" viewBox="0 0 44 10" aria-hidden="true"><path class="og-h" d="M2 5H42"/></svg>
        Trait plein : [[lien hiérarchique]] (qui dirige qui).</p>
      <p><svg class="fb-ech" viewBox="0 0 44 10" aria-hidden="true"><path class="og-f" d="M3 5H42"/></svg>
        Pointillés : [[lien fonctionnel]] (qui aide ou informe, sans être le chef).</p>
      <p><span class="fb-num">1</span> Ordre de chargement des camions au quai.</p>
    </div>
    <p class="fb-pied">Organigramme simplifié — document pédagogique, reconstitution, non contractuel</p>
  </article>`;
}

// L'annuaire : les six fiches « qui suis-je » (4 lignes chacune). Elles disent qui va dans chaque case et à qui
// transmettre chaque message (brief ENT-6.1 §4, étape 1 : ce qu'elles doivent rendre clair).
export const FICHES_QUI = {
  helene: { missions: 'dirige la plateforme ; valide les recrutements et les budgets ; seule à parler aux journalistes et aux élus au nom de la plateforme.',
    rend: 'la direction de France Boissons (hors de la plateforme).', dirige: 'Inès, Thomas et Karim.', avec: 'tous les services de la plateforme.' },
  ines: { missions: 'reçoit les commandes des clients et leurs réclamations (factures, consignes) ; s’occupe des papiers du personnel (attestations, visites médicales, congés une fois décidés) ; reçoit les candidatures et les transmet.',
    rend: 'Hélène.', dirige: 'personne.', avec: 'tous les services : congés, contrats, candidatures, commandes clients.' },
  thomas: { missions: 'responsable de l’entrepôt : stockage, matériel, racks, sécurité de l’entrepôt.',
    rend: 'Hélène.', dirige: 'Nadia (et, avec elle, les préparateurs et les caristes).', avec: 'Karim, pour les camions qui partent de l’entrepôt.' },
  nadia: { missions: 'dirige les préparateurs et les caristes (horaires, tâches du jour) ; organise le quai : réceptions des brasseries, ordre de chargement des camions.',
    rend: 'Thomas.', dirige: 'les préparateurs et les caristes.', avec: 'les chauffeurs-livreurs, pour l’ordre de chargement au quai.' },
  karim: { missions: 'dirige les chauffeurs-livreurs ; décide de leurs tournées, de leurs congés, de leurs camions ; suit les camions au garage.',
    rend: 'Hélène.', dirige: 'Lucas et 6 autres chauffeurs-livreurs.', avec: 'Nadia, pour les heures de départ et le chargement.' },
  lucas: { missions: 'chauffeur-livreur : livre les bars et les restaurants de la tournée de la côte.',
    rend: 'Karim.', dirige: 'personne.', avec: 'Nadia au quai, pour l’ordre de chargement.' },
};

export function annuaireHtml() {
  return `<article class="fb-annuaire" aria-label="Annuaire de la plateforme">
    <p class="fb-t">Annuaire de la plateforme — qui suis-je ?</p>
    <p class="fb-st">France Boissons · plateforme logistique de Buchelay (78)</p>
    <div class="fb-cartes">${ORDRE_ANNUAIRE.map((id) => {
      const F = FICHES_QUI[id];
      return `<section class="fb-carte" data-annuaire="${id}">
        <p class="fb-qui"><b>${ech(EQUIPE[id].nom)}</b> — ${ech(EQUIPE[id].role)}</p>
        <dl>
          <dt>Missions</dt><dd>${ech(F.missions)}</dd>
          <dt>[[rendre compte|Rend compte à]]</dt><dd>${ech(F.rend)}</dd>
          <dt>Dirige</dt><dd>${ech(F.dirige)}</dd>
          <dt>Travaille avec</dt><dd>${ech(F.avec)}</dd>
        </dl>
      </section>`;
    }).join('')}</div>
    <p class="fb-pied">Annuaire de la plateforme — document pédagogique, reconstitution, non contractuel</p>
  </article>`;
}

// Les deux documents communs, complets et justes (décision par défaut du §11 du brief ENT-6.1 : l'annuaire joint de
// 6.2 à 6.10 est la version complète, pas la fiche de l'élève).
export const DOC_ORGANIGRAMME = { id: 'organigramme', titre: 'Organigramme simplifié de la plateforme', court: 'Organigramme',
  html: organigrammeHtml() };
export const DOC_ANNUAIRE = { id: 'annuaire', titre: 'Annuaire de la plateforme — qui suis-je ?', court: 'Annuaire (fiches de chacun)',
  html: annuaireHtml() };

// La mise en page des deux documents (règles imbriquées sous `.ent-doc` par le moteur). Tout à l'encre du papier :
// aucune couleur de repère, pas de blanc pur, contrastes ≥ 4,5 (encre #1a1915 et #555047 sur #fdfbf7).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.fb-og, .fb-annuaire{padding:14px 18px 0}
.fb-t{margin:0; font-size:1.05rem; font-weight:800}
.fb-st{margin:2px 0 10px; font-size:.82rem; color:var(--douce)}
.fb-og > svg{display:block; width:100%; height:auto}
.fb-og svg text{fill:var(--encre); font-family:inherit}
.og-nom{font-size:17px; font-weight:700}
.og-petit{font-size:14.5px}
.og-titre{font-size:13.5px}
.og-boite{fill:rgba(26,25,21,.03); stroke:var(--encre); stroke-width:1.6}
.og-vide{fill:rgba(26,25,21,.08); stroke:var(--encre); stroke-width:2.4}
.og-case-mot{font-size:13.5px}
.og-case-lettre{font-size:34px; font-weight:800}
.og-h{fill:none; stroke:var(--encre); stroke-width:2}
.og-f{fill:none; stroke:var(--encre); stroke-width:2.6; stroke-dasharray:.5 6; stroke-linecap:round}
.og-fboite{fill:none; stroke:var(--encre); stroke-width:2.2; stroke-dasharray:.5 5.5; stroke-linecap:round}
.og-groupe{fill:rgba(26,25,21,.03); stroke:var(--douce); stroke-width:1.2}
.fb-og svg .og-groupe-t{font-size:13.5px; fill:var(--douce)}
.fb-og svg .og-repere{font-size:14px; font-weight:800}
.fb-legende{margin:8px 0 0; font-size:.86rem}
.fb-legende p{margin:3px 0; display:flex; align-items:center; gap:8px}
.fb-ech{width:44px; height:10px; flex:none}
.fb-num{display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border:1.5px solid var(--encre); border-radius:50%; font-size:.75rem; font-weight:800; flex:none}
.fb-cartes{display:grid; grid-template-columns:1fr 1fr; gap:10px}
.fb-carte{border:1px solid var(--filet); border-radius:6px; padding:8px 10px; font-size:.84rem}
.fb-qui{margin:0 0 6px}
.fb-carte dl{margin:0}
.fb-carte dt{color:var(--douce); font-size:.78rem; margin-top:4px}
.fb-carte dd{margin:0}
.fb-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid var(--filet); padding:6px 18px; text-align:right}
`;
