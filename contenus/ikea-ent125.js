// ENT-12.5 — IKEA, « les quais du mardi » : le contenu de la séance (brief `docs/briefs/ENT-12.5-ikea-les-quais-du-mardi.md` ; choix de Tristan du 26/10/2026, `docs/briefs/ikea/A-TRANCHER.md`).
// Cinquième séance de l'entreprise n° 12 (2de GATL, poste C : employé(e) logistique), DÉCOUVERTE de C1.3 (préparer l'action de réception), en guidage. Univers : `contenus/ikea.js` ; données :
// `contenus/ikea-ent125-donnees.js` ; questions : `contenus/questions/ENT-12.5.js` ; corrigé : `contenus/corriges/ENT-12.5.js` ; activité : `activites/ikea-quais-du-mardi.js`.
//
// Mardi 9 mars 2027, 5 h 45, bureau de réception. Samir, chef d'équipe de la réception, confie à l'élève six quais (21 à 26) et sept camions attendus ce matin. Écrans, un par étape :
//   Avant de commencer (non noté) → ① le planning des quais (vue Planning, guidage : « Vérifier mon planning » dit les problèmes ; on envoie) → l'aléa : le camion d'Allemagne annonce 1 h 30 de retard,
//   il faut tout replanifier → ② le message à Samir (fiche : sur quel quai et à quelle heure l'élève a mis le camion en retard).
//
// ÉCARTS AU BRIEF (dits à Tristan) : le planning est FIXE pour tous (séance de découverte en guidage, comme ENT-12.3) : aucun tirage de palettes ni d'heure de retard ; le message à Samir est une FICHE
// à deux listes (quai, heure) et non des phrases à choisir (la réponse juste dépend du planning de l'élève) ; la question sur le quai 26 est posée à l'envoi du premier planning (le moteur ne sait pas
// la poser seulement à l'élève qui a fait l'erreur). Poids (brief §5 et `A-TRANCHER.md` : planning 10, replanifier 4, message 2, questions 4) : camions posés et jamais avant leur arrivée 3 ·
// aucun chevauchement 4 · chaque camion sur un quai adapté 3 · planning refait après le retard 4 · message à Samir 2 · questions notées 4 (`part`) = 20.
// Rien n'est vrai avant l'envoi : planning et fiche à « à faire » tant qu'ils ne sont pas envoyés ; l'inaction vaut 0 (`repriseIdentique: 'faux'`).

import { apresPlanning, apresFiche } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, STYLE_DOCUMENTS, ech, pied } from './ikea.js';
import { QUESTIONS } from './questions/ENT-12.5.js';
import {
  ID, ID_VOLET, PL, FICHE_SAMIR, JOUR, QUAIS, QUAI_PORTEURS, OCCUPE, CAMIONS, RETARDATAIRE, ARRIVEE_APRES, parId, dureeDe, libType, hlib, heureDe, slotDe,
  planningEnvoye, envoyee, valeursDe, dejaEnvoyee,
} from './ikea-ent125-donnees.js';

export { ID, ID_VOLET, PL, FICHE_SAMIR } from './ikea-ent125-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const EQUIPE = { samir: { nom: 'Samir', role: 'chef d’équipe de la réception (ton responsable)', appel: 'Samir', registre: 'tu' } };
const SAMIR = { nom: 'Samir', mail: 'samir@cdc-gennevilliers.example' };
const hm = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const DOC_POSTE = { id: 'poste-125', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Réception du centre de distribution clients IKEA de Gennevilliers — ${ech(JOUR.lib)}</p>
    <p>Tu travailles à la <b>réception</b>, avec <b>Samir</b>. Chaque matin, des camions arrivent au centre pour <b>décharger</b> : des navettes des autres centres IKEA, des camions de fournisseurs.
      Tu prépares la matinée : à chaque camion, tu donnes un <b>quai</b> et une <b>heure</b> (un <b>rendez-vous</b>). Ainsi, personne n’attend et deux camions ne se gênent pas.</p>
    <p>Le centre de Gennevilliers a <b>71 portes de quai</b>. Ce matin, tu en tiens <b>six</b> : les quais 21 à 26. L’équipe tourne le matin et l’après-midi.</p>
    ${pied('Réels : le centre de Gennevilliers (71 portes de quai), ses approvisionnements par d’autres centres IKEA de France et d’Allemagne et par des fournisseurs en direct. Construits : les six quais tenus, les sept camions, leurs heures et leurs palettes, Samir.')}
  </article>` };
const DOC_CAMIONS = { id: 'camions-125', titre: 'Les sept camions du matin', court: 'Les camions',
  html: `<article class="ik-doc" aria-label="Les sept camions du matin">
    <p class="ik-t">Les sept camions du ${ech(JOUR.lib)}</p>
    <p class="ik-st">Heure d’arrivée prévue, type et nombre de palettes. Un camion se décharge à <b>${2} minutes par palette</b> (la caisse mobile vide : 30 minutes en tout).</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Camion</th><th scope="col">Type</th><th class="ik-d" scope="col">Arrive à</th><th class="ik-d" scope="col">Palettes</th></tr></thead>
      <tbody>${CAMIONS.map((c) => `<tr><td>${ech(c.nom)}</td><td>${ech(libType(c.type))}</td><td class="ik-d">${ech(hlib(c.arrivee))}</td><td class="ik-d">${c.palettes || '—'}</td></tr>`).join('')}</tbody>
    </table>
    ${pied('Camions CONSTRUITS pour l’exercice (heures, palettes et temps de déchargement inventés). Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_QUAIS = { id: 'quais-125', titre: 'Les six quais', court: 'Les quais',
  html: `<article class="ik-doc" aria-label="Les six quais">
    <p class="ik-t">Les six quais que tu tiens</p>
    <ul class="ik-ul">
      <li>Quais <b>21 à 25</b> : pour les semi-remorques <b>et</b> les porteurs.</li>
      <li>Quai <b>26</b> : réservé aux <b>porteurs</b>. Sa hauteur ne convient pas à une semi-remorque.</li>
      <li>Un quai ne reçoit <b>qu’un camion à la fois</b>. Un camion ne peut pas commencer avant son <b>heure d’arrivée</b>.</li>
      <li>Le <b>quai ${ech(OCCUPE.quai.slice(1))}</b> est encore pris par un camion de la veille jusqu’à ${ech(hlib(OCCUPE.a))} : tu ne peux rien y poser avant (la case grise).</li>
    </ul>
    <p>Un <b>porteur</b> est un camion rigide. Une <b>semi-remorque</b> est un tracteur et une remorque : elle porte jusqu’à 33 palettes.</p>
    ${pied('Règles des quais CONSTRUITES pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
export const DOC_DROIT = { id: 'droit-125', titre: 'Le droit : le temps d’attente du chauffeur', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : le temps d’attente du chauffeur">
    <p class="ik-t">Le droit : le temps d’attente du chauffeur</p>
    <p class="ik-st">Code du travail, durée du travail effectif</p>
    <p>La <b>durée du travail effectif</b> est le temps pendant lequel le salarié est <b>à la disposition de son employeur</b> et doit suivre ses consignes, sans pouvoir s’occuper librement de ses affaires.</p>
    <p>Un chauffeur qui attend devant un quai, parce que l’entreprise qu’il livre n’a pas prévu de place, n’est pas libre de partir : son attente est du <b>temps de travail</b>, que son employeur paie. Pendant une vraie <b>pause</b>, au contraire, le salarié peut quitter son poste et s’occuper librement de ses affaires : ce temps n’est pas du travail effectif.</p>
    ${pied('Texte reformulé (non cité mot pour mot). À relire sur Légifrance avant la classe (Code du travail, art. L3121-1). Document pédagogique, non contractuel.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_CAMIONS, DOC_QUAIS, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── le plan : six quais, sept camions, un aléa
const familles = {
  semi: { couleur: '#8b5cf6', nom: 'violet', legende: 'semi-remorque' },
  porteur: { couleur: '#d97706', nom: 'ambre', legende: 'porteur' },
};
export const PLANNING = {
  id: PL,
  libelle: 'Planning des quais',
  titre: `Planning des quais — ${JOUR.lib}`,
  date: 'Mardi 9 mars 2027',
  infos: (o) => [
    o.phase === 2 ? `Le camion d’Allemagne ne sera là qu’à ${hlib(ARRIVEE_APRES)} : replanifie ce qui doit l’être` : 'Sept camions arrivent ce matin : donne à chacun un quai et une heure',
    'Un quai ne reçoit qu’un camion à la fois, et un camion ne commence pas avant son arrivée',
    'Le quai 26 est réservé aux porteurs',
  ],
  echelle: { type: 'heures', debut: '06:00', fin: '13:30', pas: 15 },
  lignes: { titre: 'Les quais de réception', liste: QUAIS.map((q) => ({
    id: q.id, nom: q.nom, note: q.porteurs ? 'porteurs seulement' : 'semi-remorques et porteurs', porteurs: q.porteurs,
    ...(q.id === OCCUPE.quai ? { occupe: [{ de: OCCUPE.de, a: OCCUPE.a, titre: OCCUPE.titre }] } : {}),
  })) },
  cartes: {
    titre: 'Camions attendus',
    liste: CAMIONS.map((c) => ({ ...c, titre: c.nom, court: c.court, famille: c.type, genre: c.type, des: c.arrivee })),
    details: (c) => [
      `${ech(libType(c.genre))} · ${c.palettes ? `${c.palettes} palettes` : 'caisse mobile vide'}`,
      `Arrive à <b>${ech(hlib(c.arrivee))}</b>`,
    ],
    duree: (c) => dureeDe(c),
    libDuree: 'Déchargement',
    detailDuree: (c) => (c.palettes ? `${c.palettes} palettes × 2 min = ${hm(dureeDe(c))} de déchargement` : `${hm(dureeDe(c))} pour la mettre à quai`),
    aPlacer: 'À poser',
    nonPosees: (L) => `Camions pas encore posés : ${L.map((c) => c.court || c.id).join(', ')}.`,
    legende: 'Glisse un camion sur un quai, à l’heure où il commence à décharger. Ou clique le camion, puis la case. Clavier : Entrée pour le prendre, flèches, Suppr pour le retirer.',
  },
  familles,
  regles: [
    // Un quai ne reçoit qu'un camion à la fois, ni le créneau encore pris par le camion de la veille.
    { id: 'chevauche', type: 'unAlaFois', sur: 'ligne',
      message: (a, b, res) => `${res.nom} : ${a.court} et ${b.court} en même temps.`,
      messagePris: (c, res) => `${res.nom} est encore pris à ce moment-là : ${c.court} ne peut pas y décharger.` },
    // Une semi-remorque ne va pas au quai des porteurs.
    { id: 'adapte', type: 'compatible', si: (c) => c.genre === 'semi', exige: (res) => !res.porteurs,
      message: (c, res) => `${c.court} : une semi-remorque ne peut pas décharger au ${res.nom.toLowerCase()}.` },
    // Aucun camion ne commence avant son arrivée.
    { id: 'arrivee', type: 'fenetre',
      message: { debut: (c) => `${c.court} commence avant son arrivée.` } },
  ],
  jalons: [
    { id: 'poses', lib: 'Tous les camions sont posés, aucun avant son arrivée', regles: ['arrivee'], versions: [1] },
    { id: 'chevauche', lib: 'Aucun quai ne reçoit deux camions en même temps', regles: ['chevauche'], versions: [1] },
    { id: 'adapte', lib: 'Chaque camion est sur un quai qui lui convient', regles: ['adapte'], versions: [1] },
    { id: 'replanifier', lib: 'Après le retard, le planning tient toujours', regles: ['chevauche', 'adapte', 'arrivee'], versions: [2] },
  ],
  repriseIdentique: 'faux',
  aides: {
    consignes: {
      regles: 'Donne à chaque camion un <b>quai</b> et une <b>heure</b>. Un quai ne reçoit <b>qu’un camion à la fois</b>, un camion ne commence <b>pas avant son arrivée</b>, '
        + 'et le <b>quai 26</b> est réservé aux porteurs.',
    },
    detailDuree: true,
  },
  alea: {
    de: 'Samir',
    texte: `Le camion d’Allemagne annonce <b>1 h 30 de retard</b> : il n’arrivera qu’à <b>${hlib(ARRIVEE_APRES)}</b>.`,
    cartes: { [RETARDATAIRE]: { des: ARRIVEE_APRES } },
  },
};

// ─────────────────────────────────────────────────────────────── le message à Samir (fiche : où est le camion d'Allemagne ?)
const HEURES = []; for (let m = slotDe('06:00'); m <= slotDe('12:30'); m++) HEURES.push(heureDe(m));
export const FICHE = {
  id: FICHE_SAMIR, libelle: 'Message à Samir', titre: 'Où as-tu mis le camion d’Allemagne ?',
  sousTitre: 'Samir doit prévenir le chauffeur. Dis-lui sur quel quai et à quelle heure le camion d’Allemagne décharge, d’après TON planning.',
  documents: ['camions-125', 'quais-125'], defile: true,
  bouton: 'Ouvrir la fiche « Message à Samir »',
  quand: (db) => !!planningEnvoye(db, 2),
  blocs: [
    { type: 'cadre', titre: 'Le camion d’Allemagne', blocs: [
      { type: 'liste', id: 'quai', lib: 'Quai', vide: 'Choisir…', manque: 'le quai', choix: QUAIS.map((q) => ({ v: q.id, lib: q.nom })) },
      { type: 'liste', id: 'heure', lib: 'Heure de début du déchargement', vide: 'Choisir…', manque: 'l’heure', choix: HEURES.map((h) => ({ v: h, lib: hlib(h) })) },
    ] },
  ],
  envoi: { bouton: 'Envoyer à Samir', a: 'Samir', suite: 'Merci, je préviens le chauffeur.', incomplet: true },
};
// Où l'élève a posé le camion d'Allemagne dans SON planning d'après le retard.
export function placeRetard(db) {
  const p = planningEnvoye(db, 2);
  const x = p && p.place && p.place[RETARDATAIRE];
  return x && x.s != null ? { quai: x.r, heure: heureDe(x.s) } : null;
}

// ─────────────────────────────────────────────────────────────── les messages (Samir tutoie)
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '05:45'), from: SAMIR.nom, fromMail: SAMIR.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, 'Les quais du mardi',
      `Bonjour ${prenom} ! Je suis Samir, chef d’équipe de la réception. Ce matin, sept camions arrivent, et tu tiens les quais 21 à 26. Lis les trois documents joints, puis ouvre « Planning des quais » : `
        + 'donne à chaque camion un quai et une heure, et envoie-le-moi.\n\nSamir',
      { db, heure: '05:45', extra: { pieces: ['poste-125', 'camions-125', 'quais-125'] } }),
  ] }),
  declencheurs: [
    // Le 1er planning envoyé (juste ou faux, peu importe) : le camion d'Allemagne prévient, et la grille passe à la reprise.
    { id: 'retard', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le camion d’Allemagne est en retard',
        `${prenom}, le chauffeur du camion d’Allemagne vient d’appeler : il a 1 h 30 de retard, il ne sera là qu’à ${hlib(ARRIVEE_APRES)}.\n\n`
          + 'Refais le planning pour que tout tienne toujours, puis envoie-le-moi.\n\nSamir',
        { db, heure: '07:15' })] }) },
    // Le planning repris et envoyé : il faut dire à Samir où est le camion en retard (la fiche s'ouvre).
    { id: 'message', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Où as-tu mis le camion d’Allemagne ?',
        `Merci ${prenom}. Je dois prévenir le chauffeur. Ouvre la fiche « Message à Samir » : dis-moi sur quel quai et à quelle heure il décharge, d’après ton planning.\n\nSamir`,
        { db, heure: '07:30', extra: { ouvreFiche: FICHE_SAMIR } })] }) },
    { id: 'fin', quand: apresFiche(FICHE_SAMIR),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour ce matin',
        `Merci ${prenom}. Tu sais maintenant qu’une réception se prépare : un quai, une heure pour chaque camion, et on refait le planning quand un camion est en retard. À bientôt.\n\nSamir`,
        { db, heure: '08:00' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { planning: 'Le planning des quais', replanifier: 'Après le retard', message: 'Le message à Samir' };
const POIDS_PLANNING = { poses: 3, chevauche: 4, adapte: 3, replanifier: 4 };
const jalonsPlanning = etapesPlanning(PLANNING).map((e) => {
  const k = e.id.replace(/^v\d-/, '');
  return Object.assign(e, { groupe: k === 'replanifier' ? GROUPES.replanifier : GROUPES.planning, poids: POIDS_PLANNING[k], ecran: `planning:${PL}` });
});
export const ETAPES = [
  ...jalonsPlanning,
  // Le message est juste quand il dit où l'élève a vraiment posé le camion d'Allemagne dans son planning d'après le retard (et quand ce camion y est posé).
  { id: 'message', titre: 'Le message à Samir : le quai et l’heure du camion d’Allemagne', groupe: GROUPES.message, poids: 2, ecran: `fiche:${FICHE_SAMIR}`,
    verifier(db) {
      if (!envoyee(db, FICHE_SAMIR)) return attente;
      const v = valeursDe(db, FICHE_SAMIR), p = placeRetard(db);
      return p && v.quai === p.quai && v.heure === p.heure ? ok : ko;
    } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'Le planning', fait: (db) => !!planningEnvoye(db, 1) },
  { libelle: 'Le retard', fait: (db) => !!planningEnvoye(db, 2) },
  { libelle: 'Samir', fait: dejaEnvoyee(FICHE_SAMIR) },
];
export const SUITE = [
  { vue: 'planning', libelle: 'Le planning des quais', fait: (db) => !!planningEnvoye(db, 2) },
  { vue: 'fiche', libelle: 'Message à Samir', fait: dejaEnvoyee(FICHE_SAMIR) },
];
export const MENTION_125 = 'Réels : IKEA France et son centre de distribution clients de Gennevilliers (71 portes de quai), son approvisionnement par d’autres centres IKEA de France et d’Allemagne et par des fournisseurs, '
  + 'le principe de la réception sur rendez-vous, le Code du travail (durée du travail effectif). Construits : les six quais tenus, le quai 26 pour les porteurs, les sept camions, leurs heures, leurs palettes, Samir.';
export const ACCUEIL = {
  titre: 'Les quais du mardi',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samir', 'Menu Messagerie : trois documents sont joints.'],
    ['① Le planning des quais', 'Donne à chaque camion un quai et une heure. Vérifie ton planning, puis envoie-le.'],
    ['② Le retard', 'Le camion d’Allemagne arrive plus tard : refais le planning.'],
    ['③ Le message à Samir', 'Dis-lui sur quel quai et à quelle heure le camion d’Allemagne décharge.'],
    ['Bon à savoir', MENTION_125],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Les quais du mardi',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {
    'quai': 'L’endroit où un camion se met à l’arrière pour être chargé ou déchargé.',
    'rendez-vous': 'Le créneau donné à un camion pour décharger : un quai et une heure.',
    'porteur': 'Un camion rigide, sans remorque.',
    'semi-remorque': 'Un tracteur et une remorque : jusqu’à 33 palettes.',
  },
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  planning: PLANNING,
  fiches: [FICHE],
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
