// Kuehne+Nagel — le hub aérien de Roissy-Charles-de-Gaulle : l'UNIVERS commun des séances ENT-24.1 à 24.5 (1re Bac Pro, entreprise n° 24 ;
// C1.3 « Préparer l'action de réception », le seul trou de la 1re au 26/10/2026) et les DOCUMENTS, blocs de fiche et plannings qu'elles partagent.
// Cadrage : `docs/briefs/kuehne-nagel/CADRAGE-kuehne-nagel-1re.md` ; données : `contenus/kuehne-nagel-donnees.js` ; fabrique : `contenus/fabrique-fiches.js`
// (fiches courtes et, depuis le 27/10/2026, un écran Planning : la vue `core/types/planning.js`).
//
// L'élève est stagiaire en PFMP au service réception import : les envois arrivent par avion, la compagnie les met à disposition, Kuehne+Nagel les
// reçoit à ses quais et les range dans la bonne zone de température. Sophie (cheffe d'équipe réception, sa tutrice), Lucas (agent de réception) et
// Karim (opérateur de la chambre froide) sont CONSTRUITS, prénoms seuls ; aucune parole n'est prêtée à un salarié réel. Tutoiement.

import { catalogueSimple } from './entreprise-commun.js';
import { memes, proche } from './fabrique-fiches.js';
import { ZONES, zoneLib, zoneCourt, PRODUITS, QUAIS, duree, hlib, minutes, MISE_A_QUAI, PAR_PALETTE, DEFAUTS, nombreFr } from './kuehne-nagel-donnees.js';

// ─────────────────────────────────────────── l'univers
export const LOGO = './contenus/trames/logos/kuehne-nagel.svg';
export const ENTREPRISE = {
  id: 'kuehne-nagel',
  nom: 'Kuehne+Nagel',
  sousTitre: 'Hub aérien de Roissy-Charles-de-Gaulle — la réception import',
  exercice: 'À la réception import',
  logo: LOGO,
};
export const VOCAB = { unit: 'palette', unitPl: 'palettes', sizeLabel: '', sizeShort: '', configWord: '', icone: 'palette', mailDomain: 'kuehne-nagel.example' };
// Charte de kuehne-nagel.com (relevé du 27/10/2026) : le bleu marine du logotype #003369, texte blanc dessus (contraste 12:1).
export const THEME = { accent: '#003369', surAccent: '#ffffff', papier: true };
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Kuehne+Nagel et son hub aérien de Roissy-Charles-de-Gaulle, inauguré en octobre 2023 : 12 900 m² dans la Cargo City, '
  + 'dont 4 500 m² à température dirigée (2 à 8 °C, 15 à 25 °C, -20 à -80 °C), 260 collaborateurs, environ 60 % d’activité pharmaceutique, 300 palettes '
  + 'avion par semaine, des pièces d’avion urgentes (AOG) 24 heures sur 24. Construits : les quais, les envois et leurs numéros, les vols, les heures, '
  + 'la règle de durée, les retards et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  sophie: { nom: 'Sophie', role: 'cheffe d’équipe de la réception import (ta tutrice)', appel: 'Sophie', registre: 'tu',
    metier: 'Cheffe d’équipe réception', phrase: 'Je prépare les réceptions de la journée : les pré-alertes, les quais, l’équipe. Je suis ta tutrice.' },
  lucas: { nom: 'Lucas', role: 'agent de réception', appel: 'Lucas', registre: 'tu',
    metier: 'Agent de réception', phrase: 'Je décharge les envois, je contrôle les colis et la température, puis je les range dans leur zone.' },
  karim: { nom: 'Karim', role: 'opérateur de la chambre froide', appel: 'Karim', registre: 'tu',
    metier: 'Opérateur chambre froide', phrase: 'Je surveille les chambres de 2 à 8 °C et je range les médicaments qui craignent la chaleur.' },
};
export const MAIL_SOPHIE = 'sophie@kuehne-nagel.example';
export const TUTEUR = { nom: 'Sophie, cheffe d’équipe réception', mail: MAIL_SOPHIE, appel: 'Sophie' };
export const PERSONNES = { sophie: EQUIPE.sophie, lucas: EQUIPE.lucas, karim: EQUIPE.karim };

// ─────────────────────────────────────────── aides
export const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = 'Document pédagogique — reconstitution, non contractuel.';
const pied = (t = PIED) => `<p class="kn-pied">${ech(t)}</p>`;
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="kn-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="kn-doc" aria-label="${ech(titre)}">${corps}</article>` });
const entete = (t, st) => `<div class="kn-entete"><img class="kn-logo" src="${LOGO}" alt="Kuehne+Nagel"><div><p class="kn-t">${ech(t)}</p>${st ? `<p class="kn-st">${ech(st)}</p>` : ''}</div></div>`;
const valeur = (x, db) => (typeof x === 'function' ? x(db) : x);
export const duree_lib = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, '0')}` : ''}`);

export const STYLE = `
--douce:#555047;
.kn-doc{padding:14px 18px 0}
.kn-doc p{margin:0 0 8px}
.kn-entete{display:flex; gap:12px; align-items:center; border-bottom:2px solid #1d1d1b; padding-bottom:6px; margin-bottom:10px}
.kn-logo{height:22px; width:auto}
.kn-t{margin:0; font-size:1.06rem; font-weight:800}
.kn-st{margin:2px 0 0; font-size:.84rem; color:var(--douce)}
.kn-ul{margin:4px 0 8px; padding-left:20px; font-size:.93rem}
.kn-ul li{margin:4px 0}
.kn-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.kn-table{border-collapse:collapse; width:100%; font-size:.88rem; margin-top:4px}
.kn-table th, .kn-table td{border-bottom:1px solid #d6d0c3; padding:5px 6px; text-align:left; vertical-align:top}
.kn-table th{color:var(--douce); font-weight:600}
.kn-table .kn-d{text-align:right; white-space:nowrap}
.kn-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.kn-loi{margin:4px 0 8px; padding:4px 10px; border-left:3px solid #555047}
.kn-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents communs
export const DOC_HUB = doc('hub', 'Le hub de Roissy', 'Le hub de Roissy', `${entete('Le hub aérien de Roissy-Charles-de-Gaulle', 'Cargo City de l’aéroport, Val-d’Oise')}
  <p>Kuehne+Nagel est un <b>commissionnaire de transport</b> et un <b>prestataire logistique</b> : il organise le transport des marchandises de ses clients,
    par mer, par air et par route, et les stocke. À Roissy, il reçoit le <b>fret aérien</b> qui arrive en France et prépare celui qui part.</p>
  <ul class="kn-ul">
    <li>Inauguré en <b>octobre 2023</b>, au bord des pistes : <b>12 900 m²</b> de bâtiments, dont <b>4 500 m²</b> à température dirigée.</li>
    <li>Des zones de <b>2 à 8 °C</b>, de <b>15 à 25 °C</b>, de <b>-20 à -80 °C</b>, et même plus froid encore pour certains médicaments.</li>
    <li>Environ <b>60 %</b> de l’activité du site, ce sont des <b>médicaments</b> : vaccins, insuline, médicaments d’essais cliniques…</li>
    <li>Aussi du fret général : <b>pièces d’avion</b> (un avion cloué au sol, « AOG », attend sa pièce : c’est urgent, jour et nuit), électronique, luxe.</li>
    <li><b>260 collaborateurs</b> ; <b>300 palettes avion</b> par semaine ; 1 332 panneaux solaires sur le toit.</li>
  </ul>
  <p><b>Le chemin d’un envoi à l’arrivée :</b> l’avion atterrit ; la compagnie aérienne décharge et <b>met l’envoi à disposition</b> à une heure donnée ; un camion
    l’amène à un quai de Kuehne+Nagel ; on le décharge, on le contrôle et on le range <b>dans sa zone de température</b>. La veille, une <b>pré-alerte</b> a annoncé
    l’envoi : c’est elle qui permet de <b>préparer la réception</b>.</p>
  ${pied('Réels : le hub et ses chiffres (communiqué de l’inauguration, octobre 2023 ; Journal de l’Aviation, 23/10/2023). Construit : le chemin résumé d’un envoi. Document pédagogique.')}`);

export const DOC_REGLES = doc('regles', 'Préparer une réception', 'Préparer', `${entete('Préparer une réception', 'Les règles du service réception import')}
  <div class="kn-regle"><b>1. La zone.</b> Chaque envoi va dans la zone que dit son <b>étiquette de température</b> : « +2 °C à +8 °C » → chambre froide ;
    « +15 °C à +25 °C » → zone dirigée ; sans température → fret général.</div>
  <table class="kn-table"><thead><tr><th scope="col">Quai</th><th scope="col">Zone desservie</th></tr></thead><tbody>
    ${QUAIS.map((q) => `<tr><td>${ech(q.nom)}</td><td>${ech(zoneLib(q.zone))}</td></tr>`).join('')}</tbody></table>
  <div class="kn-regle"><b>2. La durée.</b> Une réception prend <b>${MISE_A_QUAI} minutes</b> (mise à quai, contrôle des documents et de la température),
    plus <b>${PAR_PALETTE} minutes par palette</b>. Exemple : 3 palettes → ${MISE_A_QUAI} + 3 × ${PAR_PALETTE} = ${duree(3)} minutes.</div>
  <div class="kn-regle"><b>3. L’heure.</b> On ne commence pas avant que la compagnie ait <b>mis l’envoi à disposition</b>. Un envoi qui a une <b>heure limite</b>
    doit être reçu et rangé <b>avant</b> elle (un médicament ne reste pas hors du froid ; un avion au sol attend sa pièce).</div>
  <div class="kn-regle"><b>4. Un quai, un envoi à la fois.</b> Deux envois ne se déchargent pas en même temps sur le même quai.</div>
  ${pied('Règles CONSTRUITES pour l’exercice, d’après le fonctionnement d’un hub de fret aérien. Document pédagogique.')}`);

export const DOC_DROIT = doc('droit', 'Le droit : la chaîne du froid des médicaments', 'Le droit', `${entete('Le droit : les médicaments et le froid', 'Ce que demande la réglementation')}
  <p class="kn-loi">Les <b>bonnes pratiques de distribution en gros</b> des médicaments (texte publié par l’ANSM, l’Agence nationale de sécurité du médicament)
    demandent que les médicaments soient <b>conservés dans les conditions prévues</b> (la température de l’étiquette) pendant <b>tout</b> le stockage et le transport,
    et que ces conditions soient <b>surveillées et enregistrées</b>.</p>
  <p>Un médicament resté trop longtemps hors de sa température peut perdre son effet : il est <b>mis à part</b> et ne doit pas être livré tant qu’on n’a pas
    vérifié qu’il est encore bon. C’est pourquoi un envoi de vaccins a une <b>heure limite</b> de réception.</p>
  ${pied('Texte reformulé (non cité mot pour mot), à relire avant la classe. Document pédagogique.')}`);

// Les pré-alertes : le tableau des envois annoncés.
export function htmlPreAlertes(L, { limite = true } = {}) {
  return `<table class="kn-table"><thead><tr><th scope="col">Envoi</th><th scope="col">Lettre de transport</th><th scope="col">Contenu</th><th scope="col">Étiquette</th>
    <th class="kn-d" scope="col">Palettes</th><th scope="col">Arrive par</th><th class="kn-d" scope="col">Disponible à</th>${limite ? '<th class="kn-d" scope="col">Heure limite</th>' : ''}</tr></thead><tbody>
    ${L.map((x) => `<tr><td><b>${x.id}</b></td><td class="kn-mono">${ech(x.lta)}</td><td>${ech(PRODUITS[x.produit].nom)}</td><td>${ech(PRODUITS[x.produit].etiquette)}</td>
      <td class="kn-d">${x.palettes}</td><td>${ech(x.vol)}</td><td class="kn-d">${hlib(x.des)}</td>${limite ? `<td class="kn-d">${x.avant ? hlib(x.avant) : '—'}</td>` : ''}</tr>`).join('')}
    </tbody></table>`;
}
export const docPreAlertes = (get, titre = 'Les pré-alertes', st = 'Les envois annoncés pour ce matin') => doc('prealertes', titre, 'Les pré-alertes', (db) => `${entete(titre, st)}
  ${htmlPreAlertes(valeur(get, db))}${pied('Envois CONSTRUITS pour l’exercice (lettres de transport au préfixe 999, qui n’est celui d’aucune compagnie). Document pédagogique.')}`);
// Un planning tout fait (celui de Lucas).
export const docPlanningFait = (envois, P, titre, st) => doc('planning-fait', titre, 'Son planning', `${entete(titre, st)}
  <table class="kn-table"><thead><tr><th scope="col">Envoi</th><th scope="col">Contenu</th><th scope="col">Quai</th><th class="kn-d" scope="col">Début</th><th class="kn-d" scope="col">Fin</th></tr></thead><tbody>
    ${envois.map((x) => { const [q, d] = P[x.id]; const f = minutes(d) + duree(x.palettes);
      return `<tr><td><b>${x.id}</b></td><td>${ech(PRODUITS[x.produit].nom)}</td><td>${ech(QUAIS.find((y) => y.id === q).nom)}</td><td class="kn-d">${hlib(d)}</td>
        <td class="kn-d">${hlib(`${Math.floor(f / 60)}:${String(f % 60).padStart(2, '0')}`)}</td></tr>`; }).join('')}
    </tbody></table>${pied('Planning CONSTRUIT pour l’exercice. Document pédagogique.')}`);

// ─────────────────────────────────────────── les blocs de fiche partagés et leurs jalons
const CHOIX_ZONES = ZONES.map((z) => ({ v: z.v, lib: z.lib }));
export const blocsZones = (L) => L.map((x) => ({ type: 'liste', id: `zone-${x.id}`, lib: `Envoi ${x.id} : ${PRODUITS[x.produit].nom}`, vide: 'Choisir…', manque: `la zone de l’envoi ${x.id}`, choix: CHOIX_ZONES }));
export const jalonsZones = (get, { poids, groupe }) => get(null).map((x0, i) => ({ id: `zone-${x0.id}`, titre: `La zone de l’envoi ${x0.id}`, groupe, poids,
  attendu: (db) => zoneLib(get(db)[i].zone), juste: (v, db) => v[`zone-${get(db)[i].id}`] === get(db)[i].zone }));
export const blocsDurees = (L) => L.map((x) => ({ type: 'nombre', id: `duree-${x.id}`, lib: `Envoi ${x.id} (${x.palettes} palette${x.palettes > 1 ? 's' : ''}) : combien de minutes ?`, unite: 'min', min: 0, entier: true,
  manque: `la durée de l’envoi ${x.id}` }));
export const jalonsDurees = (get, { poids, groupe }) => get(null).map((x0, i) => ({ id: `duree-${x0.id}`, titre: `La durée de réception de l’envoi ${x0.id}`, groupe, poids,
  attendu: (db) => `${duree(get(db)[i].palettes)} min`, juste: (v, db) => proche(v[`duree-${get(db)[i].id}`], duree(get(db)[i].palettes)) }));
// « Qui passe d'abord ? » : un choix parmi des envois.
export const blocPremier = (id, lib, L) => ({ type: 'choix', id, lib, colonne: true, manque: 'ton choix', choix: L.map((x) => ({ v: x.id, lib: `Envoi ${x.id} : ${PRODUITS[x.produit].nom} (disponible à ${hlib(x.des)}${x.avant ? `, limite ${hlib(x.avant)}` : ''})` })) });
// Le défaut de chaque ligne d'un planning tout fait.
export const blocsDefauts = (L) => L.map((x) => ({ type: 'liste', id: `defaut-${x.id}`, lib: `Envoi ${x.id} : ${PRODUITS[x.produit].nom}`, vide: 'Choisir…', manque: `l’envoi ${x.id}`, choix: DEFAUTS }));

// ─────────────────────────────────────────── le Planning des quais (une déclaration par séance, construite ici)
// `envois` : ceux du matin ; `alea` : { retard, ajout, retire, texte } ; `jalons` : les versions jugées.
export function planningQuais({ id, date, envois, alea = null, temps = 'guidage', rendCopie }) {
  const carte = (x) => ({ id: x.id, titre: `${x.id} — ${PRODUITS[x.produit].nom}`, court: `${x.id} ${PRODUITS[x.produit].nom.split(' ')[0]}`, famille: PRODUITS[x.produit].aog ? 'aog' : 'envoi',
    des: x.des, ...(x.avant ? { avant: x.avant } : {}), palettes: x.palettes, zone: x.zone, produit: x.produit, lta: x.lta, vol: x.vol });
  const P = {
    id,
    libelle: 'Planning des quais',
    titre: `Planning des quais de réception — ${date}`,
    date,
    infos: (o) => [
      'Chaque envoi va sur un quai de sa zone de température (étiquette de l’envoi, document « Préparer »)',
      'Il commence quand la compagnie l’a mis à disposition, et finit avant son heure limite s’il en a une',
      o.phase === 2 ? 'Reprends ton planning avec ce qui vient de changer, puis envoie-le à Sophie' : 'Un quai ne reçoit qu’un envoi à la fois. Pose tous les envois, puis envoie le planning à Sophie',
    ],
    echelle: { type: 'heures', debut: '06:00', fin: '13:00', pas: 15 },
    lignes: { titre: 'Les quais de réception', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom, note: zoneCourt(q.zone), zone: q.zone })) },
    cartes: {
      titre: 'Envois à recevoir',
      liste: envois.map(carte),
      details: (c) => [`Étiquette : <b>${ech(PRODUITS[c.produit].etiquette)}</b>`, `${c.palettes} palette${c.palettes > 1 ? 's' : ''} · ${ech(c.vol)} · LTA ${ech(c.lta)}`,
        `Disponible à <b>${hlib(c.des)}</b>${c.avant ? ` · reçu et rangé avant <b>${hlib(c.avant)}</b>` : ' · pas d’heure limite'}`],
      duree: (c) => duree(c.palettes),
      libDuree: 'Réception',
      detailDuree: (c) => `${MISE_A_QUAI} min + ${c.palettes} × ${PAR_PALETTE} min = ${duree(c.palettes)} min`,
      aPlacer: 'À poser',
      nonPosees: (L) => `Envois pas encore posés : ${L.map((c) => c.id).join(', ')}.`,
      legende: 'Glisse un envoi sur un quai, à l’heure où commence sa réception. Ou clique l’envoi, puis la case. Clavier : Entrée pour le prendre, flèches, Suppr pour le retirer.',
    },
    familles: { envoi: { couleur: '#8b5cf6', nom: 'violet', legende: 'envoi' }, aog: { couleur: '#f0be00', nom: 'jaune', legende: 'pièce d’avion urgente (AOG)' } },
    regles: [
      { id: 'un', type: 'unAlaFois', message: (a, b, r) => `${r.nom} : les envois ${a.id} et ${b.id} en même temps.` },
      { id: 'zone', type: 'compatible', exige: (r, c) => r.zone === c.zone, message: (c, r) => `${c.id} : le ${r.nom} n’est pas dans sa zone de température.` },
      { id: 'heures', type: 'fenetre', message: { debut: (c) => `${c.id} : la réception commence avant que l’envoi soit disponible.`, fin: (c) => `${c.id} : la réception finit après l’heure limite.` } },
    ],
    jalons: [
      { id: 'zones', lib: 'Chaque envoi est sur un quai de sa zone de température', regles: ['zone'] },
      { id: 'heures', lib: 'Aucune réception avant la mise à disposition, ni après l’heure limite', regles: ['heures'] },
      { id: 'poses', lib: 'Tous les envois sont posés, un seul à la fois par quai', regles: ['un'] },
    ],
    aides: {
      consignes: { regles: 'Chaque envoi va sur un quai de <b>sa zone de température</b>. Sa réception commence <b>quand il est disponible</b> et finit <b>avant son heure limite</b>. '
        + 'Un quai ne reçoit <b>qu’un envoi à la fois</b>.' },
      fenetre: { invite: 'Clique un envoi : une bande ambrée montre quand il peut être reçu.',
        carte: (c) => `<b>${ech(c.titre)}</b> : disponible à ${hlib(c.des)}${c.avant ? `, à recevoir avant ${hlib(c.avant)}` : ', pas d’heure limite'}.` },
      detailDuree: true,
    },
    ...(rendCopie === false ? { rendCopie: false } : {}),
  };
  if (alea) {
    P.alea = { de: 'Sophie', texte: alea.texte,
      ...(alea.retard ? { cartes: alea.retard } : {}),
      ...(alea.ajout ? { ajoutCartes: alea.ajout.map(carte) } : {}),
      ...(alea.retire ? { retraits: { lignes: alea.retire } } : {}) };
    P.repriseIdentique = 'faux';
  }
  return P;
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (non notée, sauf en évaluation)
const q = (id, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'sophie', doc: 'hub', rubrique: 'preparation', enonce, choix, juste, retour });
export const BANQUE = [
  q('metier', 'Kuehne+Nagel, à Roissy, c’est…', [{ v: 'prestataire', lib: 'un prestataire qui reçoit, stocke et fait voyager les marchandises de ses clients' },
    { v: 'compagnie', lib: 'une compagnie aérienne qui transporte des passagers' }, { v: 'labo', lib: 'un laboratoire qui fabrique des médicaments' }], 'prestataire',
    'Kuehne+Nagel ne fabrique rien et ne pilote pas d’avion : il organise le voyage et le stockage pour ses clients.'),
  q('pharma', 'Que représentent les médicaments dans l’activité du hub ?', [{ v: '60', lib: 'Environ 60 %' }, { v: '5', lib: 'Environ 5 %' }, { v: '100', lib: 'Tout' }], '60',
    'Plus de la moitié : d’où les grandes zones à température dirigée.'),
  q('prealerte', 'Une pré-alerte, c’est…', [{ v: 'annonce', lib: 'le message qui annonce un envoi avant qu’il arrive' }, { v: 'alarme', lib: 'l’alarme incendie' },
    { v: 'facture', lib: 'la facture du transport' }], 'annonce', 'Elle dit quoi, combien et quand : c’est avec elle qu’on prépare la réception.'),
  q('aog', '« AOG » sur un envoi veut dire…', [{ v: 'sol', lib: 'qu’un avion est cloué au sol et attend cette pièce : c’est urgent' }, { v: 'fragile', lib: 'que c’est fragile' },
    { v: 'gratuit', lib: 'que le transport est gratuit' }], 'sol', 'Aircraft On Ground : chaque heure d’avion au sol coûte cher à la compagnie.'),
  q('froid', 'Des vaccins étiquetés « +2 °C à +8 °C » vont…', [{ v: 'froid', lib: 'en chambre froide de 2 à 8 °C' }, { v: 'general', lib: 'dans le fret général' },
    { v: 'congel', lib: 'au congélateur, pour être sûr' }], 'froid', 'Ni plus chaud, ni plus froid : un vaccin congelé est perdu aussi.'),
  q('dispo', '« Disponible à 7 h » sur une pré-alerte veut dire…', [{ v: 'compagnie', lib: 'que la compagnie aérienne met l’envoi à notre disposition à 7 h' },
    { v: 'client', lib: 'que le client le veut chez lui à 7 h' }, { v: 'decolle', lib: 'que l’avion décolle à 7 h' }], 'compagnie', 'Avant cette heure, inutile de bloquer un quai : l’envoi n’est pas là.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'sophie', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « Le hub de Roissy » à gauche et réponds à mes questions.',
  documents: ['hub'], tirage: { preparation: 3 }, questions: BANQUE.map((x) => x.id), ...o });

export { ZONES, PRODUITS, QUAIS, duree, hlib, nombreFr, memes };
