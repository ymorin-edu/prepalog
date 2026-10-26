// ENT-11.3 — Mondial Relay, évaluation « la ligne de tri » : le contenu de la séance (brief `docs/briefs/ENT-11.3-mondial-relay-evaluation-tri.md` ;
// choix de Tristan du 26/10/2026, tous acceptés). Troisième séance de l'entreprise n° 11 (2de GATL, poste C : agent de tri), ÉVALUATION de C1.2
// (sécurité), C1.4 (contrôler, repérer une anomalie) et C2.1 (expédier : le tri). Univers : `contenus/mondial-relay.js` ; colis :
// `contenus/mondial-relay-colis.js` (la banque d'ENT-11.2, inchangée) ; vue : `core/types/tri.js` ; quai : `core/types/quai.js` ; questions :
// `contenus/questions/ENT-11.3.js` ; corrigé : `contenus/corriges/ENT-11.3.js`.
//
// Déroulé : Avant de commencer (4 questions tirées, notées) → le quai (la navette de Reims : étape « Avant de décharger » seule, sans étape guidée ;
// DEUX défauts tirés parmi CINQ objets, rien ne dit lesquels) → la ligne de tri (fermée tant que le quai n'est pas sécurisé ; UNE série de 16 colis
// tirés par élève, 28 s par colis, aucun retour) → « Rendre ma copie » (le moteur).
//
// Poids (brief §5, validés par Tristan le 26/10/2026) : sécurité 4 · colis en règle bien triés 5 · pièges 2 · écarts au bon motif 3 · aucun faux
// écart 1 · questions au fil 1 · Avant de commencer 4 = 20. La sécurité se lit en TROIS jalons (danger n° 1 : 1,5 · danger n° 2 : 1,5 · aucun faux
// signalement : 1) pour qu'un élève qui n'en repère qu'un garde la moitié ; rien n'est vrai par inaction (voir `core/types/quai.js`).
//
// ÉCART au brief (§4 étape 2) : le quai ne sait pas s'arrêter AVANT le déchargement. Il s'arrête à la dernière palette posée (`arret:
// 'dechargement'`, comme ENT-8.7) : la navette est donc déchargée à l'écran après « C'est bon », mais rien n'y est contrôlé ni jugé. Le contenu du
// camion n'est toujours pas montré en détail (deux palettes de colis en cartons, dessin construit).
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/mondial-relay-colis.js`. Construits en plus : la navette de Reims, le quai, les cinq états de
// la scène (le dessin n'est pas celui du hub de Buchères), l'horaire de la nuit, Romain et son message.

import { catalogueSimple } from './entreprise-commun.js';
import { VOCAB, EQUIPE as EQUIPE_MR, MENTION as MENTION_MR } from './mondial-relay.js';
import { SORTIES, REGLES, ECART, COLIS_INES, tirerSerie, bonTriColis } from './mondial-relay-colis.js';
import { DOCUMENTS as DOCUMENTS_112, STYLE_DOCUMENTS as STYLE_112, LEXIQUE as LEXIQUE_112 } from './mondial-relay-ent112.js';
import { QUESTIONS, ID, ID_TRI, QUAI_ID } from './questions/ENT-11.3.js';
import { jalonTri } from '../core/types/tri.js';
import { jalonsQuai } from '../core/types/quai.js';
import { hasard, graineDeBase } from '../core/tirage.js';
import { apresGeste } from '../core/declencheurs.js';

export { ID, ID_TRI, QUAI_ID };
export const ID_VOLET = 'mr-113';

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

// ─────────────────────────────────────────────────────────────── la ligne de tri (une série de 16 colis par élève)
export const SECONDES = 28;      // brief MOTEUR-vue-tri §5.1 : 28 s par colis ; le tiers-temps l'allonge tout seul (37 s)
export const NB_COLIS = 16;      // 3 écarts de motifs différents, 3 pièges, 9 colis ordinaires, le colis d'Inès
// `graine` : l'identifiant de l'élève. Une fonction PURE de la graine : ne rien changer entre l'ouverture de l'évaluation et le ramassage.
export function triDe(graine) {
  const h = hasard(`${graine || ''}|${ID}|s1`);
  const serie = tirerSerie(h, { ecarts: 3, pieges: 3, ordinaires: 9, en: [COLIS_INES] });
  // Le geste `ecart` part du PREMIER colis à écarter de la série (il déclenche la question « Que devient-il ? ») ; les autres gestes sont retirés.
  let pris = false;
  const colis = serie.map(({ geste, ...x }) => {
    if (pris || bonTriColis(x).s !== 'ecart') return x;
    pris = true;
    return { ...x, geste: 'ecart' };
  });
  return {
    id: ID_TRI, libelle: 'Ligne de tri', lieu: 'Hub de Buchères · ligne de tri des départs agence · nuit',
    qui: { prenom: 'Romain', poste: 'chef d’équipe' },
    sorties: SORTIES, ecart: ECART, regles: REGLES,
    series: [{ id: 's1', titre: 'La ligne de nuit', temps: 'evaluation', secondes: SECONDES, colis }],
    fin: 'Fin de la nuit. Les camions des tournées partent à 6 h.',
  };
}

// ─────────────────────────────────────────────────────────────── le quai : la navette de Reims (sécurité seule)
// Les cinq objets de la scène : leur état sûr, leur état dangereux, les `lib` du bilan et du corrigé (JAMAIS affichés pendant l'inspection).
export const OBJETS = {
  cabine: { sur: 'vide', danger: 'conduite', libOk: 'Cabine vide, moteur coupé', libKo: 'Chauffeur au volant, moteur allumé' },
  cale: { sur: 'posee', danger: 'absente', libOk: 'Cale de roue posée', libKo: 'Cale de roue absente' },
  butoirs: { sur: 'enPlace', danger: 'absents', libOk: 'Butoirs de quai en place', libKo: 'Butoirs de quai absents' },
  niveleur: { sur: 'pose', danger: 'releve', libOk: 'Niveleur posé', libKo: 'Niveleur relevé, pas posé sur la remorque' },
  lampe: { sur: 'allumee', danger: 'eteinte', libOk: 'Lampe de quai allumée', libKo: 'Lampe de quai éteinte' },
};
// DEUX défauts parmi les cinq, tirés de la graine (dans l'ordre des objets : le rang des jalons ne dépend pas de l'ordre du tirage).
export function dangersDe(graine) {
  const choisis = hasard(`${graine == null ? '' : graine}|${ID}|dangers`).prendre(Object.keys(OBJETS), 2);
  return Object.keys(OBJETS).filter((o) => choisis.includes(o));
}
export const CONSIGNE_QUAI = 'La navette de Reims est à quai. Avant qu’on la décharge, regarde le quai et le camion. Si quelque chose ne va pas, signale-le à Romain.';
const PALETTES = [
  { id: 'P1', ref: 'NAV-A', nom: 'Colis en cartons, départs agence', bl: 24, W: 4, D: 2, L: 3, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'NAV-A', nom: 'COLIS EN CARTONS', poids: '1 colis', lot: 'NAV-REIMS-1' } },
  { id: 'P2', ref: 'NAV-B', nom: 'Colis en cartons, départs agence', bl: 18, W: 3, D: 2, L: 3, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'NAV-B', nom: 'COLIS EN CARTONS', poids: '1 colis', lot: 'NAV-REIMS-2' } },
];
export function quaiDuTirage(dangers) {
  return {
    id: QUAI_ID, rendu: 'iso', froid: false,
    titre: 'Hub Mondial Relay de Buchères — Quai 4, arrivée de la navette de Reims',
    destinataire: 'Hub Mondial Relay de Buchères',
    avertissement: 'Réels : Mondial Relay et son hub de Buchères (Aube). Le quai est un <b>dessin construit</b> : ce n’est pas le quai du hub. '
      + 'La navette de Reims, le quai 4, son chargement et ses défauts sont <b>construits pour l’exercice</b>.',
    lieu: { nom: 'Quai 4', temp: 15, refrigere: false },
    unite: 'colis',
    zone: { nom: 'Zone de réception' },
    document: 'Bon de livraison',
    recommencer: false,
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' },
    securite: {
      mode: 'scene', arret: false,
      consigne: CONSIGNE_QUAI,
      points: Object.entries(OBJETS).map(([objet, o]) => (dangers.includes(objet)
        ? { id: objet, objet, etat: o.danger, ok: false, lib: o.libKo }
        : { id: objet, objet, etat: o.sur, ok: true, lib: o.libOk })),
      signaler: { qui: 'Romain', reponse: 'C’est noté. Tu me dis quand on peut décharger.' },
    },
    arret: { etape: 'dechargement', texte: 'La navette est déchargée. Va sur la ligne de tri.' },
    camions: [{
      transporteur: 'Navette Reims — Buchères (construite)', fournisseur: 'Hub de Reims (construit)', bl: 'NAV-REIMS-04', arrivee: '22:10',
      parole: 'Bonsoir. La navette de Reims, voici le bon de livraison.',
      palettes: JSON.parse(JSON.stringify(PALETTES)),
    }],
  };
}
const cache = new Map();
// Le quai d'une graine (l'évaluation est toujours au niveau standard). Même graine, même quai.
export function quaiDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!cache.has(g)) cache.set(g, quaiDuTirage(dangersDe(g)));
  return cache.get(g);
}

// ─────────────────────────────────────────────────────────────── les lectures de la base
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
export const quaiEleve = (db) => quaiDe(graineDeBase(db));
export const quaiSecurise = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const ligneQuai = (db, id) => jalonsQuai(db, quaiEleve(db)).L.find((l) => l.id === id) || null;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { securite: 'Avant de décharger', tri: 'Le tri', ecart: 'Les colis qui ne partent pas' };
export const POIDS = { 'securite-1': 1.5, 'securite-2': 1.5, 'securite-aucun-faux': 1, communes: 5, pieges: 2, ecarts: 3, fauxEcarts: 1 };
// Le jalon d'un défaut de la scène : le n-ième défaut de l'élève (même rang pour tous). Faux tant que le danger n'a pas été signalé AVANT « C'est bon ».
const jalonDanger = (rang) => ({ id: `securite-${rang + 1}`, titre: `Avant de décharger : le danger n° ${rang + 1} signalé`, groupe: GROUPES.securite, poids: POIDS[`securite-${rang + 1}`],
  verifier(db) {
    if (!quaiSecurise(db)) return attente;
    const D = dangersDe(graineDeBase(db))[rang];
    const l = ligneQuai(db, `securite-${D}`);
    if (!l) throw new Error(`ligne du quai « securite-${D} » absente`);
    return l.ok ? ok : ko;
  } });
const jalonAucunFaux = { id: 'securite-aucun-faux', titre: 'Avant de décharger : aucun faux signalement', groupe: GROUPES.securite, poids: POIDS['securite-aucun-faux'],
  verifier(db) { if (!quaiSecurise(db)) return attente; const l = ligneQuai(db, 'securite-aucun-faux'); if (!l) throw new Error('ligne du quai « aucun faux » absente'); return l.ok ? ok : ko; } };
const jTri = (mesure, titre, groupe) => ({ ...jalonTri(triDe, ID, { id: `tri-${mesure}`, titre, mesure, series: ['s1'], copie: true }), groupe, poids: POIDS[mesure] });
export const ETAPES = [
  jalonDanger(0), jalonDanger(1), jalonAucunFaux,
  jTri('communes', 'Les colis en règle, dans la bonne sortie', GROUPES.tri),
  jTri('pieges', 'Les communes qui se ressemblent', GROUPES.tri),
  jTri('ecarts', 'Les colis mis à l’écart, pour la bonne raison', GROUPES.ecart),
  jTri('fauxEcarts', 'Aucun colis en règle écarté ni oublié', GROUPES.ecart),
];

// ─────────────────────────────────────────────────────────────── les documents (ceux d'ENT-11.2, plus « Le droit : sécurité »)
const PIED = '<p class="mr-pied">Document pédagogique — reconstitution, non contractuel.</p>';
const DOC_DROIT_SECURITE = { id: 'droit-securite-113', titre: 'Le droit : sécurité au quai', court: 'Le droit', html: `<article class="mr-doc" aria-label="Le droit : sécurité au quai">
  <p class="mr-t">Le droit : sécurité au quai</p>
  <p class="mr-st">Code du travail, article R4515-4</p>
  <p>« Les opérations de chargement ou de déchargement font l’objet d’un document écrit, dit “protocole de sécurité”, remplaçant le plan de prévention. »</p>
  <p class="mr-st">Code du travail, article L4131-1 (alinéas 1 et 2)</p>
  <p>« Le travailleur alerte immédiatement l’employeur de toute situation de travail dont il a un motif raisonnable de penser qu’elle présente un danger
    grave et imminent pour sa vie ou sa santé ainsi que de toute défectuosité qu’il constate dans les systèmes de protection.</p>
  <p>Il peut se retirer d’une telle situation. »</p>
  <p class="mr-pied">Textes réels — source : Légifrance (à relire avant ouverture aux élèves).</p>
  ${PIED}</article>` };
export const DOCUMENTS = [...DOCUMENTS_112, DOC_DROIT_SECURITE];
export const STYLE_DOCUMENTS = STYLE_112;

// ─────────────────────────────────────────────────────────────── les messages
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decalage || 0) * 60000,
  from: ROMAIN.nom, fromMail: ROMAIN.mail, to: prenom, subject, kind: 'text', text });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, 'Ce soir, tu tiens la ligne',
    `Salut ${prenom} !\n\nCe soir, tu tiens la ligne seul. Je ne te dirai pas si c’est juste : on regarde ça demain.\n\n`
    + 'D’abord, la navette de Reims arrive au quai. Avant qu’on la décharge, regarde le quai et le camion. Si quelque chose ne va pas, signale-le-moi.\n\n'
    + 'Ensuite, ouvre « Ligne de tri » dans le menu : les colis arrivent à la suite, chacun reste un temps limité. Si un colis ne peut pas partir, mets-le à l’écart et dis pourquoi.\n\n'
    + 'Quand tu as fini, rends ta copie.\n\nRomain')] }),
  declencheurs: [
    { id: 'fin', quand: apresGeste(`tri:${ID_TRI}:s1:fini`),
      semer: (prenom) => ({ mails: [mail(prenom, 'Bonne nuit de travail',
        `Merci ${prenom}, les camions peuvent partir.\n\nRends ta copie quand tu es prêt.\n\nRomain`, { decalage: 1 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = `${MENTION_MR} Construits en plus : la navette de Reims, le quai 4 (un dessin), la ligne de tri manuelle des départs agence derrière la machine, `
  + 'les horaires de la nuit, les numéros, poids et dimensions des colis.';
export const LEXIQUE = {
  ...LEXIQUE_112,
  navette: 'Un camion qui fait toujours le même trajet entre deux sites, ici de Reims au hub de Buchères.',
  cale: 'Bloc en forme de coin que l’on pose contre une roue du camion pour qu’il ne puisse pas bouger.',
  butoirs: 'Blocs en caoutchouc fixés au bord du quai : le camion recule jusqu’à eux sans abîmer le quai.',
  niveleur: 'Plaque mobile du quai qui fait le pont entre le quai et le plancher de la remorque : elle doit être posée avant d’entrer.',
};
export const ACCUEIL = {
  titre: 'Évaluation : la ligne de tri',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie.'],
    ['Le quai', 'La navette de Reims arrive. Regarde le quai et le camion avant qu’on la décharge, et signale ce qui ne va pas.'],
    ['La ligne de tri', 'Elle s’ouvre quand le quai est sécurisé. Les colis arrivent un par un, chacun reste un temps limité. Aucun retour pendant le travail.'],
    ['Rendre ma copie', 'Quand tu as fini. Une seule fois : ta note se lit au Suivi.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la ligne de tri',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  tri: triDe,
  quai: quaiDe,
  equipe: EQUIPE,
  questions: QUESTIONS,
  fermetures: {
    tri: { ouvertSi: (db) => quaiSecurise(db), message: 'Après le quai : sécurise-le d’abord' },
  },
};
