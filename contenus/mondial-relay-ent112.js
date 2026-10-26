// ENT-11.2 — Mondial Relay, première nuit au tri : le contenu de la séance (brief `docs/briefs/ENT-11.2-mondial-relay-au-tri.md` ; choix de
// Tristan du 26/10/2026, `docs/briefs/mondial-relay/A-TRANCHER.md`). Deuxième séance de l'entreprise n° 11 (2de GATL, poste C : agent de tri),
// GUIDAGE de C2.1 (le tri) et C1.4 (repérer un colis qui ne peut pas partir), seul temps de travail avant l'évaluation ENT-11.3.
// Univers : `contenus/mondial-relay.js` ; colis : `contenus/mondial-relay-colis.js` ; vue : `core/types/tri.js` ; questions :
// `contenus/questions/ENT-11.2.js`.
//
// Déroulé : Avant de commencer (non noté) → point d'étape « sécurité » (3 questions notées) → série 1 guidée (13 colis : la page d'essai,
// puis le colis d'Inès, carton enfoncé mais fermé) → point d'étape « travail de nuit » → série 2 à la cadence (10 colis tirés par élève,
// 20 s par colis à partir du deuxième) → message de Romain.
//
// Poids (brief §5, validés par Tristan le 26/10/2026) : sécurité 3 (questions) · colis en règle bien triés 5 · pièges 2 · écarts au bon
// motif 4 · aucun faux écart 2 · questions au fil 4 = 20. La série 2 compte pour moitié dans « en règle » et « écarts » (et dans « aucun faux
// écart ») ; les pièges ne se lisent que sur la série 1. Rien ne se gagne sans trier (voir `core/types/tri.js`).
// Niveaux : confirmé = deux colis à la limite en plus dans la série 2 (30,0 kg pile, 151 cm) ; accompagné = 40 s par colis.
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/mondial-relay-colis.js` et du fichier de questions. Construits en plus : la ligne de tri
// manuelle des départs agence derrière la machine (plausible, non vérifiée), les horaires 22 h - 5 h, Romain et ses messages.

import { catalogueSimple } from './entreprise-commun.js';
import { VOCAB, EQUIPE as EQUIPE_MR, MENTION as MENTION_MR, CODE_POSTAL } from './mondial-relay.js';
import { SORTIES, REGLES, ECART, SERIE_GUIDEE, DIFFICILES, tirerSerie } from './mondial-relay-colis.js';
import { QUESTIONS, ID_TRI } from './questions/ENT-11.2.js';
import { jalonTri } from '../core/types/tri.js';
import { hasard } from '../core/tirage.js';
import { apresGeste } from '../core/declencheurs.js';

export const ID = 'mondial-relay-au-tri';
export { ID_TRI };
export const ID_VOLET = 'mr-112';

// ─────────────────────────────────────────────────────────────── ce que le moteur exige (aucun article en stock)
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const EQUIPE = { romain: { nom: EQUIPE_MR.romain.prenom, role: EQUIPE_MR.romain.poste, appel: 'Romain' } };
const ROMAIN = { nom: EQUIPE.romain.nom, mail: `romain@${VOCAB.mailDomain}` };

// ─────────────────────────────────────────────────────────────── la ligne de tri (une série 2 par élève)
export const SECONDES = 20;
export function triDe(graine, { niveau = 'standard' } = {}) {
  const h = hasard(`${graine || ''}|${ID}|s2`);
  const serie2 = tirerSerie(h, { ecarts: 3, pieges: 2, ordinaires: 5, en: niveau === 'confirme' ? DIFFICILES.slice(0, 2) : [] });
  return {
    id: ID_TRI, libelle: 'Ligne de tri', lieu: 'Hub de Buchères · ligne de tri des départs agence · 22 h - 5 h',
    qui: { prenom: 'Romain', poste: 'chef d’équipe' },
    sorties: SORTIES, ecart: ECART, regles: REGLES,
    series: [
      { id: 's1', titre: 'Série 1, guidée', temps: 'guidage', colis: SERIE_GUIDEE.map((x) => ({ ...x })) },
      { id: 's2', titre: 'Série 2, à la cadence', temps: 'entrainement', secondes: niveau === 'accompagne' ? 2 * SECONDES : SECONDES,
        colis: serie2.map(({ geste, ...x }) => x) },
    ],
    fin: 'Fin de la nuit. Les camions des tournées partent à 6 h.',
  };
}

// ─────────────────────────────────────────────────────────────── les jalons
export const POIDS = { communes: 5, pieges: 2, ecarts: 4, fauxEcarts: 2 };
const j = (mesure, titre, groupe, series, coef) => ({ ...jalonTri(triDe, ID, { id: `tri-${mesure}`, titre, mesure, series, coef }), groupe, poids: POIDS[mesure] });
export const ETAPES = [
  j('communes', 'Les colis en règle, dans la bonne sortie', 'Le tri', ['s1', 's2'], { s2: 0.5 }),
  j('pieges', 'Les communes qui se ressemblent', 'Le tri', ['s1']),
  j('ecarts', 'Les colis mis à l’écart, pour la bonne raison', 'Les colis qui ne partent pas', ['s1', 's2'], { s2: 0.5 }),
  j('fauxEcarts', 'Aucun colis en règle écarté ni oublié', 'Les colis qui ne partent pas', ['s1', 's2'], { s2: 0.5 }),
];

// ─────────────────────────────────────────────────────────────── les documents
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = '<p class="mr-pied">Document pédagogique — reconstitution, non contractuel.</p>';
const INES = SERIE_GUIDEE[SERIE_GUIDEE.length - 1];
const DOC_POSTE = { id: 'poste-112', titre: 'Ton poste', court: 'Ton poste', html: `<article class="mr-doc" aria-label="Ton poste">
  <p class="mr-t">Ton poste : agent de tri, la nuit</p>
  <p>Tu es en renfort au <b>hub de Buchères</b> (Aube) pour le pic de fin d’année. Le hub trie les colis qui arrivent de toute la France ;
    il est aussi l’<b>agence</b> qui livre les Points Relais de l’Aube et de la Marne.</p>
  <p>La machine trie vers les grandes directions. Derrière elle, sur la <b>ligne des départs agence</b>, tu finis à la main : chaque colis
    va dans la <b>sortie de sa tournée</b> du lendemain, ou <b>à l’écart</b> s’il ne peut pas partir.</p>
  <p>Ton chef d’équipe : <b>Romain</b>. Au bord du tapis, un gros <b>bouton rouge</b> : l’arrêt d’urgence de la ligne.</p>
  <p>Au pic, une partie des renforts sont <b>intérimaires</b> : une agence d’intérim les embauche et les paie, et les met à disposition du hub.</p>
  ${PIED}</article>` };
const DOC_ETIQUETTE = { id: 'etiquette-112', titre: 'Une étiquette de colis', court: 'L’étiquette', html: `<article class="mr-doc" aria-label="Une étiquette de colis">
  <p class="mr-t">Une étiquette de colis</p>
  <div class="mr-etiq"><b class="mr-num">${ech(INES.n)}</b><br>Point Relais : <b>${ech(INES.relais)}</b><br>${ech(INES.rue)}<br>
    <b class="mr-dest">${ech(CODE_POSTAL[INES.commune])} ${ech(INES.commune.toUpperCase())}</b></div>
  <p>En haut, le <b>numéro du colis</b> (pour le suivre). En bas, le <b>Point Relais</b>, sa commune et son <b>code postal</b> : c’est ce qui
    décide de la tournée.</p>
  ${PIED}</article>` };
const DOC_REGLES = { id: 'regles-112', titre: 'Les règles du poste', court: 'Les règles', html: `<article class="mr-doc" aria-label="Les règles du poste">
  <p class="mr-t">Un colis ne part pas en Point Relais si :</p>
  <ul><li>il pèse plus de <b>${REGLES.poidsMax} kg</b> ;</li>
    <li>il mesure plus de <b>${REGLES.longueurMax} cm</b> de long, ou plus de <b>${REGLES.sommeMax} cm</b> en additionnant longueur, largeur et hauteur ;</li>
    <li>son carton est ouvert ;</li><li>son étiquette ne se lit pas.</li></ul>
  <p>Alors on le met <b>à l’écart</b>, et on dit pourquoi : il part au poste d’<b>expertise</b>.</p>
  <p class="mr-pied">${ech(REGLES.source)}</p></article>` };
const DOC_DROIT = { id: 'droit-112', titre: 'Le droit : équipements de protection, travail de nuit', court: 'Le droit', html: `<article class="mr-doc" aria-label="Le droit">
  <p class="mr-t">Le droit</p>
  <p class="mr-st">Code du travail, article R4323-95 (reformulé)</p>
  <p>Les équipements de protection individuelle (chaussures de sécurité, gilet…) sont <b>fournis gratuitement par l’employeur</b>, qui en assure
    l’entretien, la réparation et le remplacement.</p>
  <p class="mr-st">Code du travail, article L3122-2</p>
  <p>« Tout travail effectué au cours d’une période d’au moins neuf heures consécutives comprenant l’intervalle entre minuit et 5 heures est
    considéré comme du travail de nuit. La période de travail de nuit commence au plus tôt à 21 heures et s’achève au plus tard à 7 heures. »</p>
  <p class="mr-pied">Textes réels — source : Code du travail (Légifrance), relevés le 26/10/2026.</p></article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_ETIQUETTE, DOC_REGLES, DOC_DROIT];
export const STYLE_DOCUMENTS = `.mr-doc{padding:14px 18px 0}
.mr-doc p{margin:0 0 8px}
.mr-t{font-weight:700; font-size:1.05rem}
.mr-st{font-weight:600; color:var(--encre-douce); margin-top:12px !important}
.mr-pied{font-size:.8rem; color:var(--encre-douce); border-top:1px solid var(--filet); padding-top:6px; margin-top:12px !important}
.mr-etiq{background:#fbf8f1; color:#1a1915; border:1px solid #9a948a; border-radius:3px; padding:8px 12px; margin:6px 0 10px; max-width:320px; line-height:1.4}
.mr-num{font-family:var(--mono)}
.mr-dest{font-size:1.1rem}
`;

// ─────────────────────────────────────────────────────────────── les messages
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decalage || 0) * 60000,
  from: ROMAIN.nom, fromMail: ROMAIN.mail, to: prenom, subject, kind: 'text', text });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Ta première nuit au tri',
    `Salut ${prenom} !\n\nCe soir, tu es avec moi sur la ligne des départs agence, de 22 h à 5 h. Les colis arrivent un par un sur la balance : `
    + 'tu lis l’étiquette, tu cherches la commune dans le plan de tri et tu l’envoies dans la sortie de sa tournée. S’il ne peut pas partir, '
    + 'tu le mets à l’écart en disant pourquoi.\n\nD’abord une série tranquille, je te dis à chaque colis si c’est juste. Ensuite, la cadence de la nuit.'
    + '\n\nOuvre « Ligne de tri » dans le menu.\n\nRomain')] }),
  declencheurs: [
    { id: 'fin', quand: apresGeste(`tri:${ID_TRI}:s2:fini`),
      semer: (prenom) => ({ mails: [mail(prenom, 'Bonne nuit de travail',
        `Merci ${prenom}, les camions peuvent partir.\n\nRegarde ton bilan : les communes qui se ressemblent, les colis à écarter. `
        + 'La semaine prochaine, c’est toi qui tiens la ligne seul.\n\nRomain', { decalage: 1 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = `${MENTION_MR} Construits en plus : la ligne de tri manuelle des départs agence derrière la machine, les horaires de la nuit, `
  + 'les numéros, poids et dimensions des colis.';
export const LEXIQUE = {
  hub: 'Grand centre de tri : les colis de toute la France y arrivent, sont triés, et repartent vers leur région.',
  'plan de tri': 'Le tableau qui dit, pour chaque commune, dans quelle sortie (quelle tournée) va le colis.',
  tournée: 'Le trajet d’un camion qui livre plusieurs Points Relais dans la journée.',
  'Point Relais': 'Un commerce (boulangerie, tabac…) qui garde les colis jusqu’à ce que le destinataire vienne les chercher.',
  'à l’écart': 'Un colis qui ne peut pas partir est posé à part, avec la raison ; il part au poste d’expertise.',
  expertise: 'Le poste où l’on décide du sort d’un colis écarté : le remballer, le peser de nouveau, contacter l’expéditeur…',
  'code postal': 'Les cinq chiffres de la commune. Deux communes aux noms proches ont des codes différents.',
};
export const ACCUEIL = {
  titre: 'Première nuit au tri',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie.'],
    ['La sécurité', 'Trois questions avant de prendre ta place sur la ligne.'],
    ['Série 1, guidée', 'Menu Ligne de tri : clique le colis, cherche sa commune dans le plan de tri, choisis la sortie, envoie. Romain te dit si c’est juste.'],
    ['Série 2, à la cadence', 'Le même travail, avec un temps par colis à partir du deuxième. Ton bilan arrive à la fin de la série.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Première nuit au tri',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  tri: triDe,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
