// ENT-8.18 — Action, « deux magasins, deux palettes » : le contenu de la séance (brief `docs/briefs/ENT-8.18-action-deux-magasins.md`).
// CAP OL, ENTRAÎNEMENT de CAP-C3.1 à C3.3, ERREUR INDUITE. Univers commun : `contenus/action.js`. Données pures :
// `contenus/action-ent818-donnees.js`. Activité : `activites/action-deux-magasins.js`. Questions : `contenus/questions/ENT-8.18.js`. Corrigé :
// `contenus/corriges/ENT-8.18.js`.
//
// Un vendredi, 6 h (AUCUNE date écrite). Deux écrans :
//   ① Préparer mes deux commandes (Plan d'entrepôt, préparation guidée à la voix, chantier E-8 lot 4) : 8 lignes de deux magasins mélangées
//      (« Pour Nîmes. Allée … »), une palette par magasin, un carton abîmé. Après la 3e ligne, Yanis écrit : « mets tout sur une palette, on
//      triera au quai » (l'erreur induite ; aucun bouton ne le « suit »). La commande finie, « Contrôler mes palettes » (la liste de colisage de
//      chaque magasin à côté de sa palette ; déplacer un groupe d'une palette à l'autre) : les deux chemins convergent ici. Film, étiquettes du
//      BON magasin, « Vérifier mes palettes ».
//   ② Répondre à Yanis (phrases) : la ligne du fond est jugée par `q-yanis`, aucun jalon (une erreur ne se paie qu'une fois).
// « Corriger » : le contrôle, le film, les étiquettes restent ouverts ; les lignes dites au terminal ne se redisent pas (`finFige`).

import { apresGeste } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.18.js';
import { pictoFragile } from './action-ent817.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, PHRASES_ID, SAMIA_MAIL, YANIS_MAIL, SUJETS, GESTE, entrepotDe, jeuDeBase, magasinsDe, autreDe, abimeDe, courtDe,
  SALUTATIONS, FONDS, POLITESSES, finsDe, MENTION_PREPA,
} from './action-ent818-donnees.js';

export { ID, ENTREPOT_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un vendredi, 6 h », sans date
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 5) % 7));
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const preparationVerifiee = (db) => !!(etatPlan(db) && etatPlan(db).verifs > 0) || gesteFait(db, GESTE('verifier'));
const reponduYanis = (db) => phrasesJustes(db, PHRASES_ID).envoye;

// ─────────────────────────────────────────────────────────────── les documents
const nomsDe = (db) => { const M = magasinsDe(jeuDeBase(db)); return { autre: autreDe(jeuDeBase(db)), M }; };
const DOC_JOUR = { id: 'jour', titre: 'Ta matinée', court: 'Ta matinée',
  html: (db) => { const { autre } = nomsDe(db); return `<article class="ac-doc" aria-label="Ta matinée">
    <p class="ac-t">Ta quatrième matinée à la préparation</p>
    <p class="ac-st">Un vendredi, 6 h</p>
    <p>Aujourd’hui, <b>deux magasins</b> dans la même [[tournée]] de l’allée : <b>${ech(autre.nom)}</b> et <b>Nîmes</b>. Deux [[palette|palettes]].</p>
    <p>Le terminal dit à chaque ligne <b>pour qui</b> : chaque carton va sur la palette de SON magasin. C’est <b>[[grouper par client]]</b>.</p>
    <p>Avant de filmer, tu compares chaque palette à sa [[liste de colisage]] : c’est le [[contrôle]].</p>
    ${PIED('Samia et Yanis sont construits pour l’exercice.')}
  </article>`; } };
// Une étiquette de palette : le magasin et le numéro de commande, en gros (construite pour l'exercice).
const SVG_ETIQ = `<svg class="ac818-fig" viewBox="0 0 300 180" role="img" aria-label="Une étiquette de palette : magasin Nîmes Cap Costières, commande 4802, quai 3">
  <rect x="20" y="10" width="260" height="160" rx="6" fill="#fdfbf7" stroke="#2b2824" stroke-width="2.4"/>
  <text x="150" y="44" font-size="16" font-weight="800" text-anchor="middle" fill="#2b2824">MAGASIN</text>
  <text x="150" y="80" font-size="24" font-weight="800" text-anchor="middle" fill="#2b2824">Nîmes Cap Costières</text>
  <path d="M40 98 H260" stroke="#2b2824" stroke-width="1.4"/>
  <text x="40" y="128" font-size="15" fill="#2b2824">Commande <tspan font-weight="800">4802</tspan></text>
  <text x="40" y="154" font-size="15" fill="#2b2824">Quai <tspan font-weight="800">3</tspan></text></svg>`;
const DOC_ETIQ = { id: 'etiquette', titre: 'Une étiquette', court: 'Une étiquette',
  html: `<article class="ac-doc" aria-label="Une étiquette">${SVG_ETIQ}${PIED('Étiquette construite pour l’exercice.')}</article>` };
const DOC_PICTO = { id: 'picto-fragile', titre: 'Un pictogramme', court: 'Un pictogramme',
  html: `<article class="ac-doc" aria-label="Un pictogramme"><svg class="ac817-picto" viewBox="0 0 80 80" role="img" aria-label="Un pictogramme : un verre à pied">${pictoFragile(10, 10, 60)}</svg>
    ${PIED('Pictogramme redessiné d’après la norme ISO 7000.')}</article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac818-fig{display:block; width:100%; max-width:340px; height:auto; margin:4px auto 10px}
.ac818-fig text{font-family:system-ui, sans-serif}
.ac817-picto{display:block; width:160px; height:auto; margin:8px auto}
`;
export const DOCUMENTS = [DOC_JOUR, DOC_ETIQ, DOC_PICTO];

// ─────────────────────────────────────────────────────────────── la réponse à Yanis
export const phrasesYanis = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'fond', choix: FONDS.slice(), juste: 0 },
  { id: 'politesse', choix: POLITESSES.slice(), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL }, YANIS = { nom: 'Yanis', mail: YANIS_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const accueilSamia = (autre) => `Aujourd’hui, deux magasins dans la même tournée de l’allée : ${autre} et Nîmes. Deux palettes. Le terminal te dit chaque fois pour qui.`;
export const YANIS_TEXTE = 'Salut ! On est en retard, mets tout sur une palette, on triera au quai.';
export const CONTROLE_SAMIA = 'Avant de filmer, on compare chaque palette à sa liste. Un carton par ligne.';
// Le brief disait « zéro erreur au quai » : un verdict (les palettes peuvent être fausses) ; remplacé.
export const FIN_SAMIA = 'Merci. Deux magasins, deux palettes, deux listes : c’est le métier. Lundi, je te regarde préparer.';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil, `Bonjour ${prenom} ! ${accueilSamia(autreDe(jeuDeBase(db)).nom)}\n\nSamia`, { heure: '06:00' })] }),
  corrections: {
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(YANIS, prenom, 'Re: On est en retard', 'Ok.\n\nYanis', { db, heure: '06:40' })] }),
  },
  declencheurs: [
    // L'erreur induite : après la 3e ligne, Yanis (la réponse par phrases part de ce message).
    { id: 'yanis', quand: apresGeste(GESTE('ligne:L3')),
      semer: (prenom, db) => ({ mails: [mail(YANIS, prenom, SUJETS.yanis, `${YANIS_TEXTE}\n\nYanis`,
        { db, heure: '06:20', extra: { phrases: phrasesYanis(prenom) } })] }) },
    { id: 'controle', quand: apresGeste(GESTE('controle:ouvrir')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.controle, `${CONTROLE_SAMIA}\n\nSamia`, { db, heure: '06:35' })] }) },
    { id: 'fin', quand: apresGeste(GESTE('verifier')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `${FIN_SAMIA}\n\nSamia`, { db, heure: '06:50' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 25/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Les 7 lignes normales à 0,25 et « aucun carton abîmé sur une palette » à 0,25 font le
// bloc « Prélever » (2) : le moteur sépare la ligne abîmée (`abime-dit`). Grouper, calage, poids, hauteur, film et étiquettes : un jalon par
// palette, jugé sur l'état FINAL (après le contrôle) ; l'inaction vaut 0.
export const GROUPES = { prelever: 'Prélever', abime: 'Le carton abîmé', grouper: 'Grouper par client', calage: 'Le calage',
  limites: 'Poids et hauteur', finir: 'Film et étiquettes' };
export const POIDS = {
  'ligne-1': 0.25, 'ligne-2': 0.25, 'ligne-3': 0.25, 'ligne-4': 0.25, 'ligne-5': 0.25, 'ligne-6': 0.25, 'ligne-7': 0.25, rienAbime: 0.25,
  'abime-dit': 2,
  'grouper-1': 2.5, 'grouper-2': 2.5,
  'lourds-1': 0.5, 'lourds-2': 0.5, 'fragiles-1': 0.5, 'fragiles-2': 0.5,
  'poids-1': 0.5, 'poids-2': 0.5, 'hauteur-1': 0.5, 'hauteur-2': 0.5,
  'film-1': 0.5, 'film-2': 0.5, 'etiquettes-1': 1, 'etiquettes-2': 1,
};
const PAR_PALETTE = {
  grouper: [GROUPES.grouper, 'seulement ses lignes'], lourds: [GROUPES.calage, 'les lourds en bas'], fragiles: [GROUPES.calage, 'les fragiles en haut'],
  poids: [GROUPES.limites, 'le poids'], hauteur: [GROUPES.limites, 'la hauteur'], film: [GROUPES.finir, 'le film, 3 à 5 tours'],
  etiquettes: [GROUPES.finir, 'les étiquettes de SON magasin'],
};
const normalesDe = (db) => { const j = jeuDeBase(db), A = abimeDe(j); return j.lignes.filter((l, k) => k !== A.k); };
const jalonsPlan = etapesEntrepot(entrepotDe).map((e) => {
  let m = /^ligne-(\d)$/.exec(e.id);
  if (m) {
    const k = +m[1] - 1;
    return Object.assign(e, { titre: `Ligne normale n° ${k + 1} : la bonne quantité, au bon emplacement`, groupe: GROUPES.prelever, poids: POIDS[e.id],
      titreBilan: (db) => { const l = normalesDe(db)[k]; return l ? `${l.q} ${courtDe(l.produit)} en ${l.a} (${magasinsDe(jeuDeBase(db))[l.pour].court})` : null; } });
  }
  if (e.id === 'abime-dit') return Object.assign(e, { titre: '« Abîmé : 1 » dit, et la quantité reprise sur la même pile', groupe: GROUPES.abime, poids: POIDS[e.id],
    titreBilan: (db) => { const a = abimeDe(jeuDeBase(db)); return `${a.a} (${courtDe(a.produit)}) : « Abîmé : 1 » dit, et ${a.q} bons cartons pris`; } });
  if (e.id === 'rienAbime') return Object.assign(e, { titre: 'Aucun carton abîmé sur une palette', titreBilan: 'Aucun carton abîmé sur une palette', groupe: GROUPES.prelever, poids: POIDS[e.id] });
  m = /^([a-z]+)-(\d)$/.exec(e.id);
  const [groupe, lib] = PAR_PALETTE[m[1]], p = +m[2] - 1;
  return Object.assign(e, { titre: `Palette ${p + 1} : ${lib}`, groupe, poids: POIDS[e.id],
    titreBilan: (db) => `Palette ${magasinsDe(jeuDeBase(db))[p].court} : ${lib}` });
});
export const ETAPES = [...jalonsPlan];
{
  const ids = ETAPES.filter((e) => e.poids).map((e) => e.id).sort().join();
  if (ids !== Object.keys(POIDS).sort().join()) throw new Error(`ENT-8.18 : les jalons notés ne sont pas ceux du barème (${ids})`);
}

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'entrepot', libelle: 'Préparer mes deux commandes', fait: preparationVerifiee },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Répondre à Yanis', fait: reponduYanis },
];
// Les mots du brief (§4) ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_818 = {
  ...LEXIQUE,
  'liste de colisage': 'La liste de tout ce qui doit être sur une palette (produits et nombre de cartons). On la compare à la palette avant de la filmer.',
  'grouper par client': 'Mettre ensemble tout ce qui part chez le même client : une palette par magasin.',
  palette: 'Plateau en bois sur lequel on pose les cartons pour les déplacer avec un transpalette ou un chariot.',
  colis: 'Un carton (ou un paquet) prêt à être transporté.',
  contrôle: 'Vérifier que ce qui est préparé est bien ce qui est demandé, avant que ça parte.',
  étiquette: 'Papier collé sur la palette : il dit pour quel magasin elle part.',
  tournée: 'Le chemin que suit le préparateur dans l’allée, ou le camion d’un magasin à l’autre.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), la préparation à la voix à Ensuès, '
  + `les magasins Action du Sud-Est et de Nîmes. ${MENTION_PREPA} Construits aussi : préparer deux magasins à la fois (une méthode courante en `
  + 'entrepôt, non vérifiée à Ensuès), la liste de colisage, les commandes, Samia et Yanis, le terminal et ses messages, les produits (sans marque).';
export const ACCUEIL = {
  titre: 'Deux magasins, deux palettes',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Préparer mes deux commandes', 'Plan de l’entrepôt : suis le terminal. Chaque carton sur la palette de son magasin. Puis « Contrôler mes palettes », film et étiquettes.'],
    ['② Répondre à Yanis', 'Il t’écrit pendant la préparation. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Les lignes dites au terminal ne se redisent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 18 : deux magasins, deux palettes',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_818,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: { ...EQUIPE, yanis: { nom: 'Yanis', role: 'préparateur', appel: 'Yanis', registre: 'tu' } },
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
