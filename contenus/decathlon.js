// Decathlon (entrepôt de Rouvignies, Nord) — l'univers commun des séances ENT-7.x (1re, transport amont : C2.6).
// Créé par ENT-7.1 (brief `docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md` §6), la première séance construite. Partagé par
// 7.1 à 7.4 : À LIRE, jamais à redéclarer dans une séance (identité, charte, Claire, la liste référencée, les facteurs d'émission, le
// calcul du CO₂, le lexique, les documents communs). Chaque séance apporte son conteneur, ses offres, ses fiches et ses jalons.
//
// ────────────────────────────────────────────────────────────────────────────────────────
// CE QUI EST VÉRIFIÉ, CE QUI EST CONSTRUIT (brief ENT-7.1 §2)
//
// Vérifié (Cowork, 06/10 et 13/10/2026) : objectif public de Decathlon, −20 % d'émissions absolues du transport en 2026 par rapport à
// 2021, leviers : moins d'avion, rail et barge, mesure du CO₂, remplissage des camions (engagements.decathlon.fr) ; entrepôt de
// Rouvignies (59), au bord de l'Escaut, qui approvisionne les magasins d'Europe du Nord (FashionNetwork, 2012 : chiffres datés) ;
// produits venus du Vietnam (DHL 2019, Maersk 2021) ; barge Anvers ↔ Valenciennes de Contargo, 8 allers-retours par semaine, terminal
// de Bruay-sur-l'Escaut (communiqué Contargo du 04/02/2025, L'Observateur du 10/02/2025) ; facteur d'émission du camion 44 t,
// 0,051 kg CO₂ par tonne-km (ADEME Base Carbone, repris par la Banque de France, 07/2026).
// Vérifié par Claude Code le 13/10/2026 : article L1431-3 du Code des transports, version en vigueur depuis le 01/01/2025, lu sur
// Légifrance (texte recopié dans `DOC_DROIT`) ; le bleu de la marque, #3643BA (« cobalt-500 », couleur « brand » du site
// decathlon.fr) ; le préfixe de conteneur PRPU, libre au registre BIC (bic-code.org : « No code found » ; PLGU, proposé par le brief,
// y est attribué à Gulbrandsen Companies, États-Unis).
// Construit (dit en pied de chaque document) : que Decathlon utilise ce service barge ; la liste référencée ; les noms des prestataires
// route et rail ; tous les prix, dates, horaires, références, numéros de conteneur et scellés ; les facteurs d'émission de la barge et du
// rail (ordres de grandeur) ; Claire Vasseur. Contargo est nommé (décision 16) ; aucune personne de Contargo n'est nommée.
// Distances : celles de la carte des itinéraires (`contenus/decathlon-carte.js`, calculées depuis OpenStreetMap), jamais recopiées.
//
// Charte : le bleu de la marque reste au bandeau ; le moteur ne le retire PAS de la zone de travail (il ne le fait que pour une charte
// rouge ou verte, `core/types/entreprise-theme.js`) : signalé à Tristan à la livraison d'ENT-7.1. Thème papier (comme Picard) : la
// carte et les documents sont des papiers clairs. Pas de logo image (accord de Tristan non demandé) : le nom en texte au bandeau.

import { catalogueSimple } from './entreprise-commun.js';
import { CARTE } from './decathlon-carte.js';

export { CARTE };

export const ENTREPRISE = {
  id: 'decathlon',
  nom: 'Decathlon',
  sousTitre: 'Entrepôt de Rouvignies (59) — transport amont',
  exercice: 'Bienvenue au transport amont',
};

export const VOCAB = {
  unit: 'conteneur', unitPl: 'conteneurs',
  sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton',
  mailDomain: 'decathlon-rouvignies.example',
};

export const THEME = { accent: '#3643ba', papier: true };

export const LIEUX = {
  entrepot: 'Entrepôt Decathlon de Rouvignies (59), près de Valenciennes',
  port: 'Port d’Anvers — terminal Antwerp Gateway (Deurganckdok)',
};

// ─────────────────────────────────────────── l'équipe (construite) : au TU entre collègues
export const EQUIPE = {
  claire: { nom: 'Claire Vasseur', role: 'responsable transport amont (ta tutrice)', appel: 'Claire', registre: 'tu' },
  // Ajouté par ENT-7.2 (14/10/2026) : le chef de quai de Rouvignies, personnage CONSTRUIT (nom choisi par Tristan). Tu poli entre collègues.
  mehdi: { nom: 'Mehdi Benali', role: 'chef de quai, entrepôt de Rouvignies', appel: 'Mehdi', registre: 'tu' },
  // Ajouté par ENT-7.4 (15/10/2026) : le chef de quai de Dourges, personnage CONSTRUIT (nom proposé à Tristan, à valider). Tu entre collègues.
  yanis: { nom: 'Yanis Haddad', role: 'chef de quai, entrepôt de Dourges (Delta 3)', appel: 'Yanis', registre: 'tu' },
};
export const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// L'heure d'un message : celle du SCÉNARIO, jamais la date réelle (règle de Tristan du 10/10/2026, comme France Boissons). Avec `db` et
// `volet`, on ajoute le temps réellement passé depuis l'ouverture de la séance : un message déclenché arrive « quelques minutes après ».
export function heureScenario(iso, hhmm, { db, volet, decalage = 0 } = {}) {
  const [a, m, j] = iso.split('-').map(Number), [h, mn] = hhmm.split(':').map(Number);
  const ouvert = db && db.volets && volet ? db.volets[volet] : 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(a, m - 1, j, h, mn).getTime() + ecoule + decalage;
}

// ─────────────────────────────────────────── la liste référencée (construite ; Contargo réel, données construites)
// `id` = le mode, qui est aussi la clé de l'itinéraire de la carte. JAMAIS renommés : écrits dans la base des élèves.
export const PRESTATAIRES = {
  route: { id: 'route', nom: 'Routiers du Hainaut', mode: 'route', modeLib: 'route', mail: 'affretement@routiers-hainaut.example',
    assure: 'Anvers → entrepôts du Nord, porte à porte', reel: false },
  barge: { id: 'barge', nom: 'Contargo', mode: 'barge', modeLib: 'barge + camion', mail: 'booking@contargo.example',
    assure: 'Anvers → terminal de Bruay-sur-l’Escaut (et Dourges), camion final compris', reel: true, service: 'Service réservations' },
  rail: { id: 'rail', nom: 'Rail Flandres-Artois', mode: 'rail', modeLib: 'rail + camion', mail: 'commandes@rail-flandres-artois.example',
    assure: 'Anvers → terminal de Dourges, camion final compris', reel: false },
};
export const REFERENCES = ['route', 'barge', 'rail'];

// ─────────────────────────────────────────── le CO₂ (calculé, jamais écrit à la main : brief §6.2, décision 21)
// kg CO₂ par tonne-km. Camion : VÉRIFIÉ (ADEME). Barge et rail : CONSTRUITS (ordres de grandeur). Le camion final compte au facteur camion.
// Conséquence voulue, tenue par le build de la carte pour tout poids de 13,5 à 15,8 t : vers Rouvignies, barge < rail < route (le rail
// perd à cause de ses kilomètres de camion) ; vers Dourges (7.4), rail < barge < route.
export const FACTEURS = { route: 0.051, camion: 0.051, barge: 0.020, rail: 0.0165 };
// Les tronçons d'un itinéraire de la carte : [{ type, de, a, km }].
export const troncons = (destination, mode) => CARTE.itineraires[destination][mode].segments.map((s) => ({ type: s.type, de: s.de, a: s.a, km: s.km }));
export const kmTotal = (destination, mode) => CARTE.itineraires[destination][mode].km;
// Le CO₂ d'un transport, en kg : poids du conteneur (t) × Σ (km du tronçon × facteur du tronçon), arrondi au kg.
export function co2(poidsKg, destination, mode) {
  const t = poidsKg / 1000;
  return Math.round(troncons(destination, mode).reduce((s, x) => s + t * x.km * FACTEURS[x.type], 0));
}
export const nomLieu = (id) => (CARTE.lieux[id] ? CARTE.lieux[id].court : id);

// ─────────────────────────────────────────── le conteneur (ISO 6346)
// La valeur des lettres : de 10 à 38, en sautant les multiples de 11 (A = 10, B = 12, … K = 21, L = 23, … U = 32, V = 34, … Z = 38).
const LETTRES = (() => { const T = {}; let v = 10; for (let i = 0; i < 26; i++) { if (v % 11 === 0) v++; T[String.fromCharCode(65 + i)] = v++; } return T; })();
// Le chiffre de contrôle d'un numéro de conteneur (4 lettres + 6 chiffres) : calculé, jamais recopié.
export function chiffreControle(code) {
  const c = String(code).replace(/\s/g, '').toUpperCase().slice(0, 10);
  const val = (ch) => (/\d/.test(ch) ? Number(ch) : LETTRES[ch]);
  const s = [...c].reduce((acc, ch, i) => acc + val(ch) * 2 ** i, 0);
  return (s % 11) % 10;
}
// Le numéro affiché : « PRPU 418207 2 ».
export const numeroConteneur = (prefixe, serie) => `${prefixe} ${serie} ${chiffreControle(prefixe + serie)}`;
export const PREFIXE = 'PRPU';   // libre au registre BIC (vérifié le 13/10/2026)

// ─────────────────────────────────────────── formats
export const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const z2 = (n) => String(n).padStart(2, '0');
// « mer. 27/01 · 11 h » ; `long` : « mercredi 27/01/2027 à 11 h ».
export function quand(iso, h, { long = false } = {}) {
  const [a, m, j] = iso.split('-').map(Number);
  const jour = JOURS[new Date(a, m - 1, j).getDay()];
  const hh = Math.floor(h), mn = Math.round((h - hh) * 60);
  const heure = `${hh} h${mn ? ` ${z2(mn)}` : ''}`;
  return long ? `${jour} ${z2(j)}/${z2(m)}/${a} à ${heure}` : `${jour.slice(0, 3)}. ${z2(j)}/${z2(m)} · ${heure}`;
}
export const euros = (n) => `${new Intl.NumberFormat('fr-FR').format(n)} €`;
export const kg = (n) => `${new Intl.NumberFormat('fr-FR').format(n)} kg`;
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─────────────────────────────────────────── le lexique commun (mots cliquables, tournure neutre)
export const LEXIQUE = {
  conteneur: 'Grande boîte en métal, aux dimensions normalisées, qui passe du bateau au camion, au train ou à la barge sans qu’on touche à la marchandise.',
  '40 pieds high cube': 'Conteneur de 40 pieds (environ 12 m de long), plus haut qu’un conteneur standard (2,9 m au lieu de 2,6 m). On l’écrit « 40’ HC ».',
  scellé: 'Plomb numéroté posé sur les portes du conteneur : tant qu’il est intact et que son numéro est le bon, personne n’a ouvert le conteneur.',
  terminal: 'Lieu où l’on charge et décharge les conteneurs entre deux moyens de transport (bateau, barge, train, camion).',
  barge: 'Bateau à fond plat qui transporte des marchandises sur les fleuves et les canaux. Une barge porte des dizaines de conteneurs à la fois.',
  'rupture de charge': 'Moment où la marchandise change de moyen de transport (de la barge au camion, par exemple).',
  'cahier des charges': 'Document qui dit ce que le client exige : date limite, budget, conditions. Une offre qui ne le respecte pas est écartée.',
  'prestataire référencé': 'Transporteur que l’entreprise a vérifié (contrat, assurance, sécurité) et avec qui elle a le droit de travailler.',
  devis: 'Proposition chiffrée d’un prestataire : ce qu’il fera, quand, et à quel prix.',
  'information CO₂': 'Quantité de CO₂ émise par un transport, que le transporteur indique à son client.',
  dédouané: 'Se dit d’une marchandise dont les formalités de douane sont faites : elle peut circuler librement dans l’Union européenne.',
  'mise à disposition': 'Moment à partir duquel le conteneur peut être enlevé au terminal par le transporteur.',
  'tonne-km': 'Une tonne transportée sur un kilomètre : l’unité qui sert à calculer le CO₂ d’un transport.',
};

// ─────────────────────────────────────────── ce que le moteur exige (aucun article en jeu)
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

// ─────────────────────────────────────────── les documents communs (papier, encre ; aucune couleur de repère)
// Les classes `dk-*` (propres à Decathlon : celles du site, `.pied`, `.note`…, s'appliqueraient aussi dans un document).
export const STYLE_DOCUMENTS = `
--douce:#555047;
.dk-doc{padding:14px 18px 0}
.dk-doc p{margin:0 0 8px}
.dk-t{margin:0; font-size:1.05rem; font-weight:800}
.dk-st{margin:2px 0 10px; font-size:.82rem; color:var(--douce)}
.dk-entete{display:flex; justify-content:space-between; align-items:baseline; gap:8px; border-bottom:2px solid var(--encre); padding-bottom:6px; margin-bottom:8px}
.dk-entete b{font-size:1.02rem; letter-spacing:.02em}
.dk-entete span{font-size:.78rem; color:var(--douce); text-align:right}
.dk-dl{display:grid; grid-template-columns:150px 1fr; gap:4px 12px; margin:6px 0 0; font-size:.9rem}
.dk-dl dt{color:var(--douce)}
.dk-dl dd{margin:0}
.dk-ul{margin:6px 0 0; padding-left:20px; font-size:.9rem}
.dk-ul li{margin:4px 0}
.dk-t2{border-collapse:collapse; width:100%; margin:6px 0; font-size:.86rem}
.dk-t2 th, .dk-t2 td{border:1px solid #d6cfc2; padding:4px 6px; text-align:left; vertical-align:top}
.dk-t2 th{font-weight:700}
.dk-co2{border:2px solid var(--encre); border-radius:4px; padding:6px 10px; margin:8px 0; font-size:.92rem}
.dk-gros{font-size:1.02rem; font-weight:800}
.dk-src{margin-top:10px !important; font-size:.76rem; color:var(--douce)}
.dk-cite{margin:4px 0 8px; padding-left:10px; border-left:3px solid #d6cfc2; font-size:.88rem}
.dk-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;
export const PIED = (quoi) => `<p class="dk-pied">${quoi}</p>`;

// La liste référencée (brief §6.1, pied mot pour mot).
export const DOC_LISTE = { id: 'liste', titre: 'Liste des prestataires référencés — transport amont', court: 'Liste référencée',
  html: `<article class="dk-doc" aria-label="Liste des prestataires référencés">
    <div class="dk-entete"><b>DECATHLON</b><span>Entrepôt de Rouvignies · transport amont</span></div>
    <p class="dk-t">Liste des [[prestataire référencé|prestataires référencés]]</p>
    <p class="dk-st">Conteneurs arrivés au port d’Anvers — mise à jour du 04/01/2027</p>
    <table class="dk-t2"><thead><tr><th scope="col">Prestataire</th><th scope="col">Mode</th><th scope="col">Ce qu’il assure</th><th scope="col">Adresse de commande</th></tr></thead>
      <tbody>${REFERENCES.map((k) => { const p = PRESTATAIRES[k];
        return `<tr><td><b>${ech(p.nom)}</b></td><td>${ech(p.modeLib)}</td><td>${ech(p.assure)}</td><td>${ech(p.mail)}</td></tr>`; }).join('')}</tbody></table>
    <p><b>Un prestataire absent de cette liste ne peut pas recevoir de commande, même moins cher.</b></p>
    ${PIED('Document reconstitué. Contargo est un opérateur réel ; les autres prestataires sont fictifs.')}
  </article>` };

// Decathlon en bref (pour « Avant de commencer » : rappel, décision 13 — l'information est donnée, la question la fait lire).
export const DOC_DECATHLON = { id: 'decathlon', titre: 'Decathlon en bref', court: 'Decathlon en bref',
  html: `<article class="dk-doc" aria-label="Decathlon en bref">
    <p class="dk-t">Decathlon en bref</p>
    <p class="dk-st">Ce que tu dois savoir avant de commencer</p>
    <ul class="dk-ul">
      <li><b>Decathlon</b> conçoit et vend des articles de sport, dans ses magasins et en ligne.</li>
      <li>L’<b>entrepôt de Rouvignies</b> est dans le Nord, près de Valenciennes, au bord de l’Escaut. Il approvisionne les <b>magasins
        Decathlon d’Europe du Nord</b> (source : FashionNetwork, 2012 — chiffres de l’époque).</li>
      <li>Une partie des produits (textile, chaussures) vient du <b>Vietnam</b>. Ils traversent la mer en <b>porte-conteneurs</b> jusqu’à un grand
        port européen, comme Anvers (sources : DHL 2019, Maersk 2021).</li>
      <li>Entre Anvers et Valenciennes, l’opérateur <b>Contargo</b> fait circuler des [[barge|barges]] de conteneurs sur l’Escaut, huit allers-retours
        par semaine, jusqu’au terminal de Bruay-sur-l’Escaut (communiqué Contargo, février 2025).</li>
      <li>Decathlon s’est fixé un objectif : <b>−20 % d’émissions du transport en 2026 par rapport à 2021</b>. Ses moyens : moins d’avion, plus de rail
        et de barge, mesurer le CO₂, mieux remplir les camions (engagements.decathlon.fr, lu le 06/10/2026).</li>
    </ul>
    ${PIED('Document pédagogique Prepalog, à partir de sources publiques citées. Que Decathlon utilise ce service barge est construit.')}
  </article>` };

// Le droit : l'article L1431-3 du Code des transports, MOT POUR MOT (version en vigueur depuis le 01/01/2025, lu sur Légifrance le
// 13/10/2026, alinéas 1 à 3 ; le 4e — l'amende — est résumé) ; les articles D1431-1 à D1431-23 (page du ministère, lue le 13/10/2026) ;
// l'engagement de Decathlon (résumé). Le 3e alinéa compte pour la séance : un trajet qui PART de l'étranger n'est pas encore concerné.
export const DOC_DROIT = { id: 'droit', titre: 'Le droit : l’information CO₂ d’un transport', court: 'Le droit (CO₂)',
  html: `<article class="dk-doc" aria-label="Le droit : l’information CO₂">
    <p class="dk-t">L’[[information CO₂]] d’un transport</p>
    <p class="dk-st">Code des transports, article L1431-3 (version en vigueur depuis le 1er janvier 2025)</p>
    <p class="dk-cite">« Toute personne qui commercialise ou organise une prestation de transport de personnes, de marchandises ou de déménagement
      doit fournir au bénéficiaire de la prestation une information relative à la quantité de gaz à effet de serre émise par le ou les modes de
      transport utilisés pour réaliser cette prestation.</p>
    <p class="dk-cite">Le champ et les modalités d’application de cette disposition, notamment le calendrier de leur mise en œuvre selon la taille
      des entreprises de transport, les méthodes de calcul des émissions de gaz à effet de serre et la manière dont le bénéficiaire de la prestation
      est informé sont fixés par voie réglementaire.</p>
    <p class="dk-cite">Les conditions dans lesquelles l’obligation définie au premier alinéa est rendue applicable aux prestations de transport dont
      l’origine ou la destination se situe en dehors du territoire national sont précisées une fois que les dispositions le permettant auront été
      adoptées dans le cadre des organisations européennes et internationales compétentes. »</p>
    <p>Le dernier alinéa prévoit une amende administrative de 3 000 € au plus si l’information n’est pas donnée.</p>
    <p class="dk-st" style="margin-top:12px">Ce que disent les articles D1431-1 à D1431-23 (partie réglementaire du code)</p>
    <ul class="dk-ul">
      <li>Ils fixent la <b>méthode de calcul</b> : le transporteur ne choisit pas sa façon de compter.</li>
      <li>L’obligation vaut pour un transport dont le <b>départ et l’arrivée sont en France</b>.</li>
      <li>L’information porte sur le CO₂ depuis le 1er octobre 2013, et sur tous les gaz à effet de serre depuis le 1er juin 2017.</li>
    </ul>
    <p class="dk-st" style="margin-top:12px">Et Decathlon ?</p>
    <p>La loi oblige à <b>informer</b> du CO₂, pas à le réduire. Réduire, c’est l’<b>engagement</b> que Decathlon a pris lui-même : −20 % d’émissions du
      transport en 2026 par rapport à 2021 (engagements.decathlon.fr). Son cahier des charges demande le CO₂ sur chaque devis, même quand le
      transport part de l’étranger.</p>
    <p class="dk-pied">Texte réel — sources : Code des transports, art. L1431-3 (Légifrance) ; ministère de la Transition écologique, « Information GES
      des prestations de transport » ; engagements.decathlon.fr</p>
  </article>` };

// Les trois itinéraires, en texte (pour « Avant de commencer » : la carte est un écran, pas un document). Distances de la carte.
export function itinerairesHtml(destination = 'rouvignies') {
  const I = CARTE.itineraires[destination];
  const lieu = (id) => nomLieu(id);
  return `<article class="dk-doc" aria-label="Les trois itinéraires">
    <p class="dk-t">Les trois itinéraires d’Anvers à ${ech(lieu(destination))}</p>
    <p class="dk-st">Le détail est sur la carte des itinéraires (menu)</p>
    <table class="dk-t2"><thead><tr><th scope="col">Itinéraire</th><th scope="col">Trajet</th><th scope="col">Tronçons</th></tr></thead>
      <tbody>${['route', 'barge', 'rail'].map((m) => `<tr><td><b>${ech(I[m].nom)}</b></td><td>${ech(I[m].texte)}</td>
        <td>${I[m].segments.map((s) => `${s.type === 'camion' ? 'camion' : s.type} : ${ech(lieu(s.de))} → ${ech(lieu(s.a))}, ${s.km} km`).join('<br>')}</td></tr>`).join('')}</tbody></table>
    <p>Avec la barge et le rail, le conteneur change de moyen de transport au terminal : c’est une [[rupture de charge]].</p>
    ${PIED('Distances calculées sur les cartes OpenStreetMap (© contributeurs OpenStreetMap), arrondies au kilomètre.')}
  </article>`;
}
export const DOC_ITINERAIRES = { id: 'itineraires', titre: 'Les trois itinéraires', court: 'Les itinéraires', html: itinerairesHtml('rouvignies') };
