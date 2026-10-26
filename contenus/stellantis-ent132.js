// ENT-13.2 — Stellantis Sochaux, « les camions du matin » : le contenu de la séance (brief `docs/briefs/ENT-13.2-stellantis-camions-du-matin.md` ; choix de Tristan du
// 26/10/2026, `docs/briefs/stellantis/A-TRANCHER.md`). Deuxième séance de l'entreprise n° 13 (Terminale, la rentrée), ENTRAÎNEMENT de C1.3 et C1.4 : la réception apprise en 1re,
// refaite seul ; ce que la Terminale ajoute, c'est que LA PRIORITÉ VIENT DE LA LIGNE. Univers : `contenus/stellantis.js` ; données : `contenus/stellantis-ent132-donnees.js` ;
// questions : `contenus/questions/ENT-13.2.js` ; corrigé : `contenus/corriges/ENT-13.2.js` ; activité : `activites/stellantis-camions-du-matin.js`.
//
// Mardi 14 septembre 2027, 5 h 30. Karim : « 8 camions ce matin, 5 quais. Et la ligne a besoin de ses pièces. » Écrans, un par étape :
//   Avant de commencer (non noté) → ① le planning des quais (vue Planning, entraînement : pas de « Vérifier », on envoie) → l'urgence : le camion de faisceaux annonce 45 minutes
//   d'avance, il faut replanifier → ② le quai : recevoir le camion de faisceaux (vue Quai en rendu iso, sans froid : compter, décider, réserves précises, signature) →
//   ③ le message à Karim (phrases à choisir : ce qui est reçu, la couverture qui reste).
//
// ÉCARTS AU BRIEF (dits à Tristan) : le planning et le quai sont FIXES (comme ENT-12.5 : une matinée de révision, même pour tous), donc rien n'est tiré ; l'avance du camion est de
// 45 minutes (et non 40 : le créneau est de 15 minutes) ; le quai ne sait pas montrer « une palette annoncée au BL et absente » : la palette P4 arrive incomplète (six cartons
// manquants) ; un camion urgent (couverture < 3 h) doit commencer À SON ARRIVÉE (règle `critere`, sans changer le moteur) ; les questions sont posées à des gestes précis : la question
// du quai 5 à l'envoi du premier planning (le moteur ne sait pas la poser seulement à l'élève qui a fait l'erreur) ; la couverture de l'« Avant de commencer » n'est pas tirée.
// Poids (brief §5 et A-TRANCHER.md) : planning 4 (arrivée 1 · chevauchement 2 · quai adapté 1) · priorité 3 · replanification 2 · décisions des palettes 4 (0,75 × 4 + comptage 0,25 × 4) ·
// réserves 2 (P3 1, P4 1) · mention « sous réserve de déballage » 0,5 · signature 0,5 · message à Karim 1 (0,5 + 0,5) · questions notées 3 (`part`) = 20.

import { apresPlanning, apresMail } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { jalonsQuai } from '../core/types/quai.js';
import { phrasesJustes } from '../core/phrases.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQ, KARIM, STYLE_DOCUMENTS, ech, pied, heureScenario } from './stellantis.js';
import { QUESTIONS } from './questions/ENT-13.2.js';
import {
  ID, ID_VOLET, PL, ID_QUAI, ID_PHRASES, JOUR, QUAIS, OCCUPE, CAMIONS, SEUIL_URGENT, AVANCE, ARRIVEE_AVANT, PALETTES, QUAI, PHRASES, PAS,
  dureeDe, libType, hlib, duree, planningEnvoye, quaiEcrit, quaiSigne, MIN_PAR_PALETTE,
} from './stellantis-ent132-donnees.js';

export { ID, ID_VOLET, PL, ID_QUAI, PHRASES, QUAI } from './stellantis-ent132-donnees.js';

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const EQUIPE = { karim: { nom: EQ.karim.prenom, role: `${EQ.karim.poste} (ton responsable)`, appel: 'Karim' } };

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const DOC_POSTE = { id: 'poste-132', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="st-doc" aria-label="Ton poste">
    <p class="st-t">Ton poste</p>
    <p class="st-st">Usine Stellantis de Sochaux — ${ech(JOUR.lib)}</p>
    <p>Tu es en <b>PFMP</b> dans l’<b>équipe logistique</b> de l’usine de Sochaux, avec <b>Karim</b>. Chaque matin, des camions de <b>fournisseurs</b> livrent les pièces de la ligne :
      il y en a environ <b>250 par jour</b>. Une partie de l’équipe <b>planifie</b> les camions (un quai, une heure) et <b>reçoit</b> les pièces.</p>
    <p>Ce matin, tu tiens <b>cinq quais</b> et tu pars de la même chose qu’en première : planifier, recevoir, contrôler, écrire des réserves. Ce qui change : <b>la ligne ne doit pas s’arrêter</b>.
      Une chaîne à l’arrêt immobilise environ 1 200 personnes.</p>
    ${pied('Réels : l’usine de Sochaux, ses 250 camions et 500 fournisseurs par jour (Le Trois, 16/07/2026). Construits : les cinq quais tenus, les huit camions, leurs heures et leurs palettes, Karim.')}
  </article>` };
const DOC_QUAIS = { id: 'quais-132', titre: 'Les quais et la ligne', court: 'Les quais et la ligne',
  html: `<article class="st-doc" aria-label="Les quais et la ligne">
    <p class="st-t">Les cinq quais que tu tiens</p>
    <ul class="st-ul">
      <li>Quais <b>1 à 4</b> : pour les semi-remorques <b>et</b> les porteurs.</li>
      <li>Quai <b>5</b> : réservé aux <b>porteurs</b>. Sa hauteur ne convient pas à une semi-remorque.</li>
      <li>Un quai ne reçoit <b>qu’un camion à la fois</b>. Un camion ne peut pas commencer avant son <b>heure d’arrivée</b>.</li>
      <li>Le <b>quai ${ech(OCCUPE.quai.slice(1))}</b> est encore pris par un camion de la nuit jusqu’à ${ech(hlib(OCCUPE.a))} (la case grise).</li>
      <li>Décharger et contrôler un camion prend <b>${MIN_PAR_PALETTE} minutes par palette</b>.</li>
    </ul>
    <p class="st-t">La ligne d’abord</p>
    <p>Chaque carte de camion dit combien de temps la pièce <b>couvre</b> la production : « 2 h 30 » veut dire que la ligne a de quoi tourner encore 2 h 30 avec le stock qu’il lui reste.
      Quand la couverture est <b>inférieure à ${duree(SEUIL_URGENT)}</b>, le camion est <b>urgent</b> : la ligne ne doit pas l’attendre, il commence à décharger <b>dès son arrivée</b>.</p>
    ${pied('Règles des quais et seuil d’urgence CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_LIGNE = { id: 'ligne-132', titre: 'La couverture de la ligne', court: 'La couverture',
  html: `<article class="st-doc" aria-label="La couverture de la ligne">
    <p class="st-t">La couverture de la ligne</p>
    <p class="st-st">Combien de temps la production tient avec ce qu’il y a à la ligne</p>
    <p>La <b>couverture</b> se calcule en divisant le stock de la ligne par ce qu’elle consomme à l’heure.</p>
    <p class="st-ex"><b>Exemple</b> : 12 contenants à la ligne, 3 consommés par heure → 12 ÷ 3 = <b>4 heures</b>.</p>
    <p>Pour les faisceaux électriques, la ligne consomme <b>1 carton par minute</b> : 100 cartons couvrent 100 minutes, soit 1 h 40.</p>
    ${pied('Consommation construite pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_BL = { id: 'bl-132', titre: 'Un bon de livraison (exemple)', court: 'Un bon de livraison',
  html: `<article class="st-doc" aria-label="Un bon de livraison">
    <p class="st-t">Bon de livraison — exemple</p>
    <p class="st-st">Fournisseur d’exemple → usine, une livraison de deux palettes</p>
    <table class="st-table"><thead><tr><th scope="col">Référence</th><th scope="col">Désignation</th><th class="st-d" scope="col">Cartons annoncés</th></tr></thead>
      <tbody><tr><td>EXE-01</td><td>Pièce d’exemple A</td><td class="st-d">24</td></tr><tr><td>EXE-02</td><td>Pièce d’exemple B</td><td class="st-d">36</td></tr></tbody></table>
    <p>Le <b>bon de livraison</b> (BL) dit ce que le fournisseur a <b>envoyé</b>. À la réception, on compare ce qu’on <b>reçoit</b> à ce papier. Si la livraison n’est pas conforme, on écrit des
      <b>réserves</b> précises sur le BL <b>avant</b> que le chauffeur signe.</p>
    ${pied('Document reconstitué pour la séance : ce n’est pas un document de l’usine ni d’un fournisseur. Document pédagogique, non contractuel.')}
  </article>` };
// Texte RECOPIÉ de `contenus/action-ent810.js` (TEXTE_L133_3 : Légifrance, LEGIARTI000021486442, version en vigueur depuis le 10/12/2009, relu le 17/10/2026 pour ENT-8.8 et 8.10).
// Légifrance n'a pas pu être rejoint depuis le cloud le 26/10/2026 : le texte n'a pas été relu ce jour.
export const TEXTE_L133_3 = 'La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois '
  + 'jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
  + 'ou par lettre recommandée, sa protestation motivée.';
const DOC_DROIT = { id: 'droit-132', titre: 'Le droit : signaler un dommage au transporteur', court: 'Le droit',
  html: `<article class="st-doc" aria-label="Le droit : signaler un dommage au transporteur">
    <p class="st-t">Le droit : signaler un dommage au transporteur</p>
    <p class="st-st">Code de commerce, article L133-3 (1er alinéa) — le voiturier est le transporteur</p>
    <p class="st-loi">« ${ech(TEXTE_L133_3)} »</p>
    ${pied('Texte réel (Légifrance, version en vigueur depuis le 10/12/2009, relu le 17/10/2026 pour les séances Action).')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_QUAIS, DOC_LIGNE, DOC_BL, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── le planning : cinq quais, huit camions, une urgence
const familles = {
  semi: { couleur: '#8b5cf6', nom: 'violet', legende: 'semi-remorque' },
  porteur: { couleur: '#d97706', nom: 'ambre', legende: 'porteur' },
};
const hm = (m) => duree(m);
export const PLANNING = {
  id: PL,
  libelle: 'Planning des quais',
  titre: `Planning des quais — ${JOUR.lib}`,
  date: 'Mardi 14 septembre 2027',
  infos: (o) => [
    o.phase === 2 ? `Le camion de faisceaux annonce 45 minutes d’avance : il sera là à ${hlib(ARRIVEE_AVANT)}. Replanifie ce qui doit l’être` : 'Huit camions arrivent ce matin : donne à chacun un quai et une heure',
    `Un camion dont la pièce couvre moins de ${duree(SEUIL_URGENT)} de production est urgent : il commence dès son arrivée`,
    'Le quai 5 est réservé aux porteurs',
  ],
  echelle: { type: 'heures', debut: '05:30', fin: '11:00', pas: PAS },
  lignes: { titre: 'Les quais de réception', liste: QUAIS.map((q) => ({
    id: q.id, nom: q.nom, note: q.porteurs ? 'porteurs seulement' : 'semi-remorques et porteurs', porteurs: q.porteurs,
    ...(q.id === OCCUPE.quai ? { occupe: [{ de: OCCUPE.de, a: OCCUPE.a, titre: OCCUPE.titre }] } : {}),
  })) },
  cartes: {
    titre: 'Camions attendus',
    liste: CAMIONS.map((c) => ({ ...c, titre: c.nom, famille: c.type, genre: c.type, des: c.arrivee })),
    details: (c) => [
      `${ech(libType(c.genre))} · ${c.palettes} palettes`,
      `Arrive à <b>${ech(hlib(c.arrivee))}</b>`,
      `Couverture à la ligne : <b>${ech(duree(c.couv))}</b>${c.urgent ? ' — urgent' : ''}`,
    ],
    duree: (c) => dureeDe(c),
    libDuree: 'Déchargement',
    detailDuree: (c) => `${c.palettes} palettes × ${MIN_PAR_PALETTE} min = ${hm(dureeDe(c))} de déchargement`,
    aPlacer: 'À poser',
    nonPosees: (L) => `Camions pas encore posés : ${L.map((c) => c.court || c.id).join(', ')}.`,
    legende: 'Glisse un camion sur un quai, à l’heure où il commence à décharger. Ou clique le camion, puis la case. Clavier : Entrée pour le prendre, flèches, Suppr pour le retirer.',
  },
  familles,
  regles: [
    { id: 'chevauche', type: 'unAlaFois', sur: 'ligne',
      message: (a, b, res) => `${res.nom} : ${a.court} et ${b.court} en même temps.`,
      messagePris: (c, res) => `${res.nom} est encore pris à ce moment-là : ${c.court} ne peut pas y décharger.` },
    { id: 'adapte', type: 'compatible', si: (c) => c.genre === 'semi', exige: (res) => !res.porteurs,
      message: (c, res) => `${c.court} : une semi-remorque ne peut pas décharger au ${res.nom.toLowerCase()}.` },
    { id: 'arrivee', type: 'fenetre',
      message: { debut: (c) => `${c.court} commence avant son arrivée.` } },
    // Un camion urgent (couverture < 3 h) qui commence après son arrivée : la ligne l'attend. On dit QUE, jamais lequel passe avant lequel.
    { id: 'priorite', type: 'critere', marque: 'tous',
      verifier: ({ I }) => I.filter((i) => i.c.urgent && i.c._des != null && i.s > i.c._des)
        .map((i) => ({ texte: `${i.c.court} : la ligne l’attend.`, cartes: [i.id] })) },
  ],
  jalons: [
    { id: 'poses', lib: 'Tous les camions sont posés, aucun avant son arrivée', regles: ['arrivee'], versions: [1] },
    { id: 'chevauche', lib: 'Aucun quai ne reçoit deux camions en même temps', regles: ['chevauche'], versions: [1] },
    { id: 'adapte', lib: 'Chaque camion est sur un quai qui lui convient', regles: ['adapte'], versions: [1] },
    { id: 'priorite', lib: 'Les camions urgents commencent dès leur arrivée', regles: ['priorite'], versions: [1] },
    { id: 'replanifier', lib: 'Après l’avance du camion, le planning tient et les camions urgents commencent dès leur arrivée', regles: ['chevauche', 'adapte', 'arrivee', 'priorite'], versions: [2] },
  ],
  repriseIdentique: 'faux',
  aides: {
    consignes: {
      regles: 'Donne à chaque camion un <b>quai</b> et une <b>heure</b>. Un quai ne reçoit <b>qu’un camion à la fois</b>, un camion ne commence <b>pas avant son arrivée</b>, '
        + 'le <b>quai 5</b> est réservé aux porteurs, et un camion <b>urgent</b> (couverture de moins de 3 heures) commence <b>dès son arrivée</b>.',
    },
    detailDuree: true,
    verifier: false,
  },
  alea: {
    de: 'Karim',
    texte: `Le camion de faisceaux annonce <b>45 minutes d’avance</b> : il sera là à <b>${hlib(ARRIVEE_AVANT)}</b>.`,
    cartes: { [AVANCE]: { des: ARRIVEE_AVANT } },
  },
};

// ─────────────────────────────────────────────────────────────── les messages de Karim (il tutoie)
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR.iso, o.heure || '05:30', { db: o.db, volet: ID_VOLET }),
  from: KARIM.nom, fromMail: KARIM.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, 'Les camions du matin',
      `Bonjour ${prenom} !\n\nHuit camions ce matin, cinq quais. Et la ligne a besoin de ses pièces. Lis les trois documents joints, puis ouvre « Planning des quais » : `
        + 'donne à chaque camion un quai et une heure, et envoie-le-moi.\n\nKarim',
      { db, heure: '05:30', extra: { pieces: ['poste-132', 'quais-132', 'ligne-132'] } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux, peu importe) : le camion de faisceaux prévient, et la grille passe à la reprise.
    { id: 'avance', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le camion de faisceaux arrive en avance',
        `${prenom}, le chauffeur du camion de faisceaux est déjà au portail : il a 45 minutes d’avance, il sera là à ${hlib(ARRIVEE_AVANT)}.\n\n`
          + 'Refais le planning pour que tout tienne toujours, puis envoie-le-moi.\n\nKarim',
        { db, heure: '05:55' })] }) },
    // Le planning repris et envoyé : le camion de faisceaux est à quai, l'élève le reçoit.
    { id: 'quai', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le camion de faisceaux est à quai',
        `Merci ${prenom}. Le camion de faisceaux est au quai 4. Ouvre « Quai de réception » : compte chaque palette, décide, écris les réserves sur le bon de livraison, fais signer le chauffeur.\n\n`
          + 'Le bon de livraison dit ce que le fournisseur a envoyé : c’est à lui que tu compares ce que tu reçois.\n\nKarim',
        { db, heure: '06:00', extra: { pieces: ['bl-132'] } })] }) },
    // Le bon signé : Karim demande le compte rendu, par phrases.
    { id: 'compte-rendu', quand: quaiSigne,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Où en est la ligne ?',
        `${prenom}, le chauffeur est reparti. Dis-moi ce que tu as reçu, et combien de temps la ligne tient encore avec ce qui est arrivé.\n\n`
          + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nKarim',
        { db, heure: '07:00', extra: { phrases: PHRASES } })] }) },
    { id: 'fin', quand: apresMail({ a: KARIM.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour ce matin',
        `Merci ${prenom}. Je préviens la ligne. Retiens-le : un camion ne passe pas parce qu’il est arrivé le premier, mais parce que la ligne en a besoin.\n\nKarim`,
        { db, heure: '07:15' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons
const ok = { status: 'ok' }, ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) }), attente = { status: 'attente' };
export const GROUPES = { planning: 'Le planning des quais', priorite: 'La priorité à la ligne', avance: 'Après l’avance du camion', decisions: 'Contrôler chaque palette',
  reserves: 'Les réserves et la signature', message: 'Le message à Karim' };
export const POIDS = { 'v1-poses': 1, 'v1-chevauche': 2, 'v1-adapte': 1, 'v1-priorite': 3, 'v2-replanifier': 2,
  decision: 0.75, comptage: 0.25, reserve: 1, deballage: 0.5, signature: 0.5, recu: 0.5, couverture: 0.5 };
const GROUPE_PLANNING = { 'v1-priorite': GROUPES.priorite, 'v2-replanifier': GROUPES.avance };
const jalonsPlanning = etapesPlanning(PLANNING).map((e) => Object.assign(e, { groupe: GROUPE_PLANNING[e.id] || GROUPES.planning, poids: POIDS[e.id], ecran: `planning:${PL}` }));

const ligne = (db, id) => jalonsQuai(db, QUAI).L.find((l) => l.id === id) || {};
const etat = (db) => (db && db.quais && db.quais[ID_QUAI]) || null;
const decidee = (db, p) => { const e = etat(db); return !!(e && e.palettes && e.palettes[p.id] && e.palettes[p.id].decision); };
const statut = (ok_, essaye, detail) => (ok_ ? ok : essaye ? ko(detail) : attente);
const jalonsPalettes = PALETTES.flatMap((p) => [{
  id: `${p.id}-decision`, titre: `${p.id} (${p.nom}) : décision et motif justes`, groupe: GROUPES.decisions, poids: POIDS.decision,
  verifier(db) { const d = ligne(db, `${p.id}-decision`); return statut(d.ok, decidee(db, p), `décision : ${d.fait}`); },
}, {
  id: `${p.id}-comptage`, titre: `${p.id} (${p.nom}) : comptage juste`, groupe: GROUPES.decisions, poids: POIDS.comptage,
  verifier(db) { const c = ligne(db, `${p.id}-comptage`); return statut(c.ok, decidee(db, p), `comptage : ${c.fait}`); },
}]);
const jalonsReserves = PALETTES.filter((p) => p.attendu !== 'accepter').map((p) => ({
  id: `${p.id}-reserve`, titre: `Réserve précise pour ${p.id}`, groupe: GROUPES.reserves, poids: POIDS.reserve,
  verifier(db) { const l = ligne(db, `${p.id}-reserve`); return statut(l.ok, quaiEcrit(db), `écrit : ${l.fait} — attendu : ${l.attendu}`); },
}));
const jalonsPapiers = [
  { id: 'deballage', titre: 'Aucune mention « sous réserve de déballage »', groupe: GROUPES.reserves, poids: POIDS.deballage,
    verifier(db) { const l = ligne(db, 'deballage'); return statut(l.ok, quaiEcrit(db), l.fait); } },
  { id: 'signature', titre: 'Le bon de livraison signé par le chauffeur', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return quaiSigne(db) ? ok : attente; } },
];
const ECRAN_MESSAGE = `phrases:${ID_PHRASES}`;
const jalonLigne = (lig, id, titre, detail) => ({ id: `message-${id}`, titre, groupe: GROUPES.message, ecran: ECRAN_MESSAGE, poids: POIDS[id],
  verifier(db) { const r = phrasesJustes(db, ID_PHRASES); if (!r.envoye) return attente; return r.justes.includes(lig) ? ok : ko(detail); } });
export const ETAPES = [
  ...jalonsPlanning,
  ...jalonsPalettes,
  ...jalonsReserves,
  ...jalonsPapiers,
  jalonLigne('recu', 'recu', 'Message à Karim : ce qui est arrivé', 'La ligne doit dire combien de cartons sont arrivés sur ceux du bon de livraison.'),
  jalonLigne('couverture', 'couverture', 'Message à Karim : combien de temps la ligne tient', 'La couverture se calcule sur les cartons utilisables, ceux qui ne sont ni manquants ni écrasés.'),
];

// ─────────────────────────────────────────────────────────────── accueil et options
export const MENTION_132 = 'Réels : l’usine Stellantis de Sochaux, ses 250 camions et 500 fournisseurs par jour, la planification des camions et la réception (Le Trois, 16/07/2026), '
  + 'le Code de commerce (L133-3). Construits : les cinq quais tenus, le quai 5 pour les porteurs, les huit camions, leurs heures, palettes et couvertures, le camion de faisceaux et son bon de livraison, Karim.';
export const ACCUEIL = {
  titre: 'Les camions du matin',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie : trois documents sont joints.'],
    ['① Le planning des quais', 'Donne à chaque camion un quai et une heure : la ligne d’abord. Envoie ton planning.'],
    ['② L’avance du camion', 'Le camion de faisceaux arrive plus tôt : refais le planning.'],
    ['③ Recevoir le camion de faisceaux', 'Menu Quai de réception : compter, décider, écrire les réserves, faire signer.'],
    ['④ Le message à Karim', 'Dis-lui ce qui est arrivé et combien de temps la ligne tient.'],
    ['Bon à savoir', MENTION_132],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Les camions du matin',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {
    'quai': 'L’endroit où un camion se met à l’arrière pour être déchargé.',
    'couverture': 'Le temps pendant lequel la production tient avec le stock qui reste à la ligne.',
    'urgent': 'Un camion dont la pièce couvre moins de trois heures de production : la ligne ne doit pas l’attendre.',
    'BL': 'Bon de livraison : la liste de ce que le fournisseur a envoyé.',
    'réserve': 'Remarque précise écrite sur le BL, avant la signature du chauffeur, quand la livraison n’est pas conforme.',
  },
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  planning: PLANNING,
  quai: QUAI,
  equipe: EQUIPE,
  questions: QUESTIONS,
  fermetures: {
    quai: { ouvertSi: (db) => !!planningEnvoye(db, 2), message: 'Après le planning refait' },
  },
};
