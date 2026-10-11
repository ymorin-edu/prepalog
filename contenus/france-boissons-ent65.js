// ENT-6.5 — France Boissons, « ranger les fûts » : les données de la séance (brief `docs/briefs/ENT-6.5-france-boissons-rangement.md`,
// choix de Tristan du 11/10/2026 recopiés au §4 bis, §4 ter, §5 et §11 ; moteur : chantier D-5).
// Univers commun : `contenus/france-boissons.js`. Palettes et BL : `contenus/france-boissons-ent64.js` (la réception d'avant).
// Activité : `activites/france-boissons-rangement.js`. Questions : `contenus/questions/ENT-6.5.js`. Corrigé : `contenus/corriges/ENT-6.5.js`.
//
// L'élève, en renfort au quai (mercredi 16 juin 2027, 16 h), cariste en entraînement :
//   0. « Le matériel » : deux écrans (le chariot frontal, la palette de rétention), non notés ;
//   1. « Comprendre le FIFO » : le mot expliqué, puis l'animation en deux temps et ses deux questions (première réponse notée) ;
//   2. « Zone de masse » : ranger les 4 palettes reçues en ENT-6.4, valider ;
//   3. « Entrée en stock » (visible quand le rangement est validé) : une ligne par palette, envoyée à Nadia ; Nadia répond.
//
// Vérifié (brief §2) : stockage de masse des fûts chez France Boissons (INRS, Travail et Sécurité n° 843, 2022), chariot frontal = CACES
// R489 catégorie 3, les textes de loi cités (relus le 11/10/2026 sur code.travail.gouv.fr et EUR-Lex). Construit : le plan de la zone de
// masse, les lots, les hauteurs de gerbage, le stock de départ (celui de l'extrait d'ENT-6.2), les poids, l'heure, tous les messages.
// 8 fûts à plat sur palette de rétention = règle de l'exercice (décision 52).
//
// Les valeurs attendues (stock après, couloir de chaque ligne) sont CALCULÉES : stock d'avant = `dispo` de l'univers, entrée = fûts de
// la palette, couloir = là où l'élève a LUI-MÊME posé la palette (`placeMasse`, pas de double peine).

import { etapesEntrepot, placeMasse, fautesMasse } from '../core/types/entrepot.js';
import { etapesAnimation } from '../core/types/animation.js';
import { ficheEnvoyee, lireNombre } from '../core/types/fiche.js';
import { apresFiche } from '../core/declencheurs.js';
import { QUESTIONS } from './questions/ENT-6.5.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, STOCK_BUCHELAY, mailDe, heureScenario, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';
import { PALETTES_ENT64, QUAI_ENT64 } from './france-boissons-ent64.js';
import { ID, MASSE_ID, FICHE_ID, ID_VOLET, SCENARIO, MATERIEL, FIFO, REFS, articleDe, PALETTES, REGLES, MASSE, attenduLigne, GROUPES, POIDS }
  from './france-boissons-ent65-donnees.js';
export { ID, MASSE_ID, FICHE_ID, ID_VOLET, SCENARIO, MATERIEL, FIFO, PALETTES, REGLES, MASSE, attenduLigne, GROUPES, POIDS };
// Les données pures (animation, zone de masse, palettes, poids) : `contenus/france-boissons-ent65-donnees.js`.


const NADIA = { nom: EQUIPE.nadia.nom, mail: mailDe('nadia') };

const rangementValide = (db) => !!(db && db.entrepots && db.entrepots[MASSE_ID] && db.entrepots[MASSE_ID].valide);

// ─────────────────────────────────────────────────────────────── étape 3 : l'entrée en stock (brief §4, étape 3)
const COULOIRS = MASSE.plan.couloirs.map((c) => c.id);
const LOTS = Object.keys(MASSE.lots);
const REFS_FICHE = Object.keys(REFS);
const choixRef = REFS_FICHE.map((k) => ({ v: k, lib: articleDe(k).court }));
// Une ligne de la fiche = un cadre par palette (le moteur n'a pas de brique « lignes ») ; ids de blocs `P1-ref`, `P1-lot`…
const cadre = (p) => ({ type: 'cadre', titre: `Palette ${p.id}`, blocs: [
  { type: 'liste', id: `${p.id}-ref`, lib: 'Référence', manque: `la référence de ${p.id}`, choix: choixRef },
  { type: 'liste', id: `${p.id}-lot`, lib: 'Lot', manque: `le lot de ${p.id}`, choix: LOTS.map((l) => ({ v: l, lib: l })) },
  { type: 'nombre', id: `${p.id}-futs`, lib: 'Fûts entrés', unite: 'fûts', min: 0, entier: true, manque: `les fûts entrés de ${p.id}` },
  { type: 'liste', id: `${p.id}-couloir`, lib: 'Couloir', manque: `le couloir de ${p.id}`, choix: COULOIRS.map((c) => ({ v: c, lib: c })) },
  { type: 'nombre', id: `${p.id}-avant`, lib: 'Stock avant', unite: 'fûts', min: 0, entier: true, manque: `le stock avant de ${p.id}` },
  { type: 'nombre', id: `${p.id}-apres`, lib: 'Stock après', unite: 'fûts', min: 0, entier: true, manque: `le stock après de ${p.id}` },
] });
export const FICHE = {
  id: FICHE_ID,
  libelle: 'Entrée en stock',
  titre: 'Entrée en stock — palettes de Mons',
  sousTitre: 'Une ligne par palette, dans l’ordre P1 à P4.',
  documents: ['etat-stock', 'bl'],
  quand: rangementValide,
  grille: true,
  blocs: [
    { type: 'encadre', titre: 'Mettre le stock à jour', texte: '1. Ce qui est vraiment entré (pas ce que dit le BL).<br>2. Le stock d’avant, sur l’état du stock.<br>3. Stock après = stock avant + entrée.' },
    ...PALETTES.map(cadre),
  ],
  envoi: { bouton: 'Enregistrer l’entrée en stock', a: 'Nadia' },
};
// Les cases fausses d'une ligne (noms seulement, jamais la bonne valeur) ; null tant que la fiche n'est pas envoyée.
export function casesFausses(db, id) {
  const f = ficheEnvoyee(db, FICHE_ID);
  if (!f.envoye) return null;
  const v = f.valeurs || {}, att = attenduLigne(id), pl = placeMasse(db, MASSE, id);
  const F = [];
  if (v[`${id}-ref`] !== att.ref) F.push('référence');
  if (lireNombre(v[`${id}-futs`]) !== att.futs) F.push('fûts entrés');
  if (lireNombre(v[`${id}-apres`]) !== att.apres) F.push('stock après');
  if (!pl || v[`${id}-couloir`] !== pl.couloir) F.push('couloir');
  return F;
}

// ─────────────────────────────────────────────────────────────── les messages
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '16:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const SUJET_ARRIVEE = 'On range les palettes de Mons';
export const TEXTE_ARRIVEE = (prenom) => `Re-bonjour ${prenom} !\n\n`
  + 'Les palettes de Mons sont en zone de réception. Le fût qui fuit reste en [[zone litiges]].\n\n'
  + 'Avant de ranger, regarde comment on travaille ici : la réserve n’est pas dans des racks, les palettes pleines sont posées au sol.\n\nNadia';
export const TEXTE_MERCI = (prenom) => `Merci ${prenom}, c’est rangé. Demain 7 h, on compte le stock avant le week-end de la Fête.\n\nNadia`;

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, NADIA, SUJET_ARRIVEE, TEXTE_ARRIVEE(prenom), { heure: '15:55', extra: { pieces: ['droit'] } })] }),
  declencheurs: [
    // La fiche envoyée (juste ou fausse) : Nadia remercie, sans dire si c'était juste ; transition vers ENT-6.6.
    { id: 'merci', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, NADIA, 'RE : l’entrée en stock', TEXTE_MERCI(prenom), { db, decalage: 3 })] }) },
  ],
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(prenom, NADIA, 'RE : l’entrée en stock', `Bien reçu, merci ${prenom}.\n\nNadia`, { db, decalage: 3 })] }),
  },
};

// ─────────────────────────────────────────────────────────────── les documents (reconstitués, mention en pied)
const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;

// L'état du stock AVANT l'entrée : les quatre références de la réception, `dispo` de l'univers.
const docEtatStock = () => `<article class="fb5-doc" aria-label="État du stock">
    <p class="fb-t">État du stock — mercredi 16 juin, 16 h</p>
    <p class="fb-st">Plateforme de Buchelay · fûts pleins en stock, avant le rangement des palettes de Mons</p>
    <table class="fb5-table">
      <thead><tr><th scope="col">Référence</th><th scope="col">Désignation</th><th scope="col">En stock</th></tr></thead>
      <tbody>${REFS_FICHE.map((k) => articleDe(k)).map((a) => `<tr><td>${ech(a.ref)}</td><td>${ech(a.court)}</td><td>${a.dispo} fûts</td></tr>`).join('')}</tbody>
    </table>
    ${PIED('État du stock')}
  </article>`;

// Le BL d'ENT-6.4, avec les réserves écrites à la réception (c'est le piège de P2 : le BL annonce de l'Affligem).
const reserveBL = (p) => (p.etiq.ref !== p.ref ? `Produit différent : étiquette ${p.etiq.nom}`
  : Object.keys(p.avarie).length ? `${Object.keys(p.avarie).length} fût endommagé (fuite)` : '');
const docBL = () => `<article class="fb5-doc" aria-label="Bon de livraison ${ech(QUAI_ENT64.camions[0].bl)}">
    <p class="fb-t">Bon de livraison n° ${ech(QUAI_ENT64.camions[0].bl)} (signé à 14 h 30, avec réserves)</p>
    <p class="fb-st">De : ${ech(QUAI_ENT64.camions[0].fournisseur)} · à : France Boissons, plateforme de Buchelay (78), quai 12</p>
    <table class="fb5-table">
      <thead><tr><th scope="col">Palette</th><th scope="col">Référence</th><th scope="col">Désignation</th><th scope="col">Fûts annoncés</th><th scope="col">Réserves écrites</th></tr></thead>
      <tbody>${PALETTES_ENT64.map((p) => `<tr><td>${p.id}</td><td>${ech(p.ref)}</td><td>${ech(p.nom)}</td><td>${p.bl}</td><td>${ech(reserveBL(p))}</td></tr>`).join('')}</tbody>
    </table>
    ${PIED('Bon de livraison')}
  </article>`;

// Les textes de loi des questions (relus le 11/10/2026 : Code du travail sur code.travail.gouv.fr ; règlements sur EUR-Lex, versions
// consolidées en français, 178/2002 au 01/07/2022 et 1169/2011 au 01/01/2018). À relire sur Légifrance avant ouverture aux élèves.
const art = (code, num, texte) => `<p class="fb-st" style="margin-top:14px">${code}, ${num}</p>${texte}`;
const docDroit = () => `<article class="fb5-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : charges lourdes, sécurité, traçabilité</p>
    ${art('Code du travail', 'article R4541-3', '<p>« L’employeur prend les mesures d’organisation appropriées ou utilise les moyens appropriés, et notamment les équipements mécaniques, '
      + 'afin d’éviter le recours à la manutention manuelle de charges par les travailleurs. »</p>')}
    ${art('Code du travail', 'article L4122-1 (alinéa 1)', '<p>« Conformément aux instructions qui lui sont données par l’employeur, dans les conditions prévues au règlement intérieur '
      + 'pour les entreprises tenues d’en élaborer un, il incombe à chaque travailleur de prendre soin, en fonction de sa formation et selon ses possibilités, de sa santé et '
      + 'de sa sécurité ainsi que de celles des autres personnes concernées par ses actes ou ses omissions au travail. »</p>')}
    ${art('Code du travail', 'article L4121-1 (extrait)', '<p>« L’employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.</p>'
      + '<p>Ces mesures comprennent : 1° Des actions de prévention des risques professionnels […] ; 2° Des actions d’information et de formation ; '
      + '3° La mise en place d’une organisation et de moyens adaptés. »</p>')}
    ${art('Règlement (CE) n° 178/2002', 'article 18 (extrait)', '<p>« Les exploitants du secteur alimentaire […] doivent être en mesure d’identifier toute personne leur ayant fourni une denrée alimentaire […]. »</p>'
      + '<p>« Les exploitants du secteur alimentaire […] disposent de systèmes et de procédures permettant d’identifier les entreprises auxquelles leurs produits ont été fournis. »</p>')}
    ${art('Règlement (UE) n° 1169/2011', 'article 2 et annexe X (extraits)', '<p>« “date de durabilité minimale d’une denrée alimentaire” : la date jusqu’à laquelle cette denrée alimentaire '
      + 'conserve ses propriétés spécifiques dans des conditions de conservation appropriées ».</p>'
      + '<p>Elle n’est pas requise dans le cas « des boissons titrant 10 % ou plus en volume d’alcool ».</p>')}
    <p class="fb-pied">Textes réels — sources : Code du travail (code.travail.gouv.fr), EUR-Lex</p>
  </article>`;

// Les mots de la zone de masse (écran « Avant de commencer ») : du vocabulaire, aucune règle de rangement (couloir, lot devant un autre,
// hauteur de gerbage : ce sont les jalons).
const docMots = () => `<article class="fb5-doc" aria-label="Mots de la zone de masse">
    <p class="fb-t">Mots de la zone de masse</p>
    <table class="fb5-table"><tbody>
      <tr><th scope="row">Stockage de masse</th><td>Les palettes pleines sont posées au sol, sans rack.</td></tr>
      <tr><th scope="row">Gerber</th><td>Poser une palette sur une autre, avec le chariot frontal.</td></tr>
      <tr><th scope="row">Lot</th><td>Les fûts fabriqués la même semaine : « S20 » = semaine 20.</td></tr>
      <tr><th scope="row">Mettre un stock à jour</th><td>Stock après = stock avant + ce qui est vraiment entré.</td></tr>
    </tbody></table>
    ${PIED('Aide-mémoire')}
  </article>`;

export const DOCUMENTS = [
  { id: 'mots', titre: 'Mots de la zone de masse', court: 'Mots de la zone de masse', html: docMots() },
  { id: 'etat-stock', titre: 'État du stock — mercredi 16 juin, 16 h', court: 'État du stock', html: docEtatStock() },
  { id: 'bl', titre: `Bon de livraison n° ${QUAI_ENT64.camions[0].bl}`, court: 'Bon de livraison (BL)', html: docBL() },
  { id: 'droit', titre: 'Le droit : charges lourdes, sécurité, traçabilité', court: 'Le droit', html: docDroit() },
  DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb5-doc{padding:14px 18px 0}
.fb5-doc p{margin:0 0 8px}
.fb5-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb5-table th, .fb5-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb5-table th{color:var(--douce); font-weight:600}
`;

const attente = { status: 'attente' }, ok = { status: 'ok' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// Jalons 3 à 6 : le bilan nomme le critère faux (jamais la bonne place) ; non posée = faux après la validation.
const jalonsRangement = etapesEntrepot(MASSE).map((e) => {
  const pid = e.id.replace('palette-', '');
  return { ...e, titre: `${pid} bien rangée`, groupe: GROUPES.rangement, poids: POIDS[e.id],
    verifier(db) {
      const r = e.verifier(db);
      if (r.status !== 'ko') return r;
      const F = fautesMasse(MASSE, (db.entrepots || {})[MASSE_ID] || {}, pid);
      return ko(F == null ? 'palette non posée' : `critère : ${F.join(', ')}`);
    } };
});
const jalonLigne = (pid) => ({ id: `stock-${pid}`, titre: `Entrée en stock : ligne ${pid}`, groupe: GROUPES.stock, poids: POIDS[`stock-${pid}`], ecran: 'fiche',
  verifier(db) {
    const F = casesFausses(db, pid);
    if (F == null) return attente;
    return F.length ? ko(`à revoir : ${F.join(', ')}`) : ok;
  } });

export const ETAPES = [
  ...etapesAnimation(FIFO).map((e) => ({ ...e, groupe: GROUPES.fifo, poids: POIDS[e.id] })),
  ...jalonsRangement,
  ...PALETTES.map((p) => jalonLigne(p.id)),
];

export const FIN_FIGE = 'Les palettes sont rangées : le rangement ne se corrige plus.';

// ─────────────────────────────────────────────────────────────── le lexique et l'accueil
export const MENTION = 'Réels : France Boissons (filiale de Heineken) et sa plateforme de Buchelay (Yvelines), le stockage de masse des fûts '
  + '(INRS, 2022), le CACES R489 catégorie 3, les bières citées et les textes de loi. Construit : Nadia, le plan de la zone de masse, les lots, '
  + 'les hauteurs de gerbage, le stock, les poids et tous les messages. 8 fûts sur une palette de rétention : règle de l’exercice. '
  + 'Dessins — scène construite, ce n’est pas la plateforme de Buchelay.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  FIFO: '« First In, First Out » : premier entré, premier sorti. On fait sortir d’abord le lot le plus ancien.',
  lot: 'Les fûts fabriqués la même semaine (S20 = semaine 20). Plus le numéro est petit, plus le lot est ancien.',
  'stockage de masse': 'Palettes pleines posées au sol, les unes sur les autres, sans rack.',
  couloir: 'Bande de la zone de masse où l’on pose les palettes, du fond vers l’allée. Le chariot y entre et en sort par l’allée.',
  gerber: 'Poser une palette sur une autre.',
  'hauteur de gerbage': 'Le nombre de palettes qu’on peut poser les unes sur les autres sans danger : il dépend du poids.',
  'palette de rétention': 'Palette en plastique avec un bac sous une grille : si un fût fuit, le liquide reste dans le bac.',
  'chariot frontal': 'Chariot élévateur qui porte la charge à l’avant, sur des fourches ; il faut une formation (CACES) et une autorisation de conduite.',
  'zone litiges': 'Zone de la plateforme où l’on met de côté ce qui est abîmé ou contesté, le temps de régler avec la brasserie et le transporteur.',
  'entrée en stock': 'Ajouter au stock ce qui est vraiment arrivé : stock après = stock avant + entrée.',
});
export const ACCUEIL = {
  titre: 'Ranger les fûts',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Nadia', 'Menu Messagerie : les palettes de Mons attendent en zone de réception.'],
    ['Le matériel', 'Menu Le matériel : le [[chariot frontal]] et la [[palette de rétention]].'],
    ['Comprendre le FIFO', 'Menu Comprendre le FIFO : regarde l’animation et réponds aux deux questions.'],
    ['Ranger les palettes', 'Menu Zone de masse : range les 4 palettes, puis valide ton rangement.'],
    ['Mettre le stock à jour', 'Menu Entrée en stock : une ligne par palette, puis enregistre.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 5 : ranger les fûts',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  animations: [MATERIEL, FIFO],
  entrepot: MASSE,
  fiche: FICHE,
  finFige: FIN_FIGE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
