// ENT-8.17 — Action, « monter et conditionner sa palette » : le contenu de la séance (brief `docs/briefs/ENT-8.17-action-conditionner.md`).
// CAP OL, GUIDAGE de CAP-C3.3. Univers commun : `contenus/action.js`. Données pures : `contenus/action-ent817-donnees.js`. Activité :
// `activites/action-conditionner.js`. Questions : `contenus/questions/ENT-8.17.js`. Corrigé : `contenus/corriges/ENT-8.17.js`.
//
// Un jeudi, 6 h (AUCUNE date écrite). Deux écrans, le second ouvert après le premier :
//   ① Lire un carton (fiche, trois cartons dessinés à gauche, tirés par élève) : fragile, lourd, doit rester debout ;
//   ② Préparer et monter (Plan d'entrepôt, préparation guidée à la voix, chantier E-8) : 6 lignes dont l'ordre du circuit casse TOUJOURS une
//      règle de calage (il faut poser « À côté ») ; film, étiquettes, « Vérifier ma préparation ».
// « Corriger » rouvre la fiche ; la palette, elle, se remonte tant qu'on veut (« ↶ Reposer le dernier », film, étiquettes, vérifier encore) ;
// seules les lignes dites au terminal ne se redisent pas (`finFige`).

import { apresFiche, apresGeste } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { QUESTIONS } from './questions/ENT-8.17.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, FICHE_ID, SAMIA_MAIL, SUJETS, GESTE, entrepotDe, jeuDeBase, courtDe, cartonsDeBase, SORTES, LIB_SORTE,
  melangerPour, MENTION_PREPA,
} from './action-ent817-donnees.js';

export { ID, ENTREPOT_ID, FICHE_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « un jeudi, 6 h », sans date
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 4) % 7));
  d.setHours(h, mn, 0, 0);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return d.getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const gesteFait = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || gesteFait(db, `fiche:${id}:envoyer`);
const etatPlan = (db) => (db && db.entrepots && db.entrepots[ENTREPOT_ID]) || null;
export const preparationVerifiee = (db) => !!(etatPlan(db) && etatPlan(db).verifs > 0) || gesteFait(db, GESTE('verifier'));
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les dessins (noir et blanc, des traits ; aucun mot qui donne la réponse)
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
// Le pictogramme « fragile » : un verre à pied (ISO 7000-0621, redessiné), dans le carré (x, y, côté c).
export const pictoFragile = (x, y, c) => {
  const k = c / 60;
  return `<g transform="translate(${x} ${y}) scale(${k})"><rect x="1" y="1" width="58" height="58" fill="#fff" stroke="#2b2824" stroke-width="2"/>
    <path d="M19 10 H41 L39 26 Q30 36 21 26 Z M30 32 V48 M21 49 H39" ${T}/><path d="M33 12 L28 19 L33 22" ${T} stroke-width="1.6"/></g>`;
};
// Le pictogramme « haut » : deux flèches vers le haut sur une barre (ISO 7000-0623, redessiné).
export const pictoHaut = (x, y, c) => {
  const k = c / 60;
  return `<g transform="translate(${x} ${y}) scale(${k})"><rect x="1" y="1" width="58" height="58" fill="#fff" stroke="#2b2824" stroke-width="2"/>
    <path d="M14 50 H46 M22 46 V16 M38 46 V16" ${T}/><path d="M15 23 L22 12 L29 23 Z M31 23 L38 12 L45 23 Z" fill="#2b2824" stroke="#2b2824" stroke-width="1.5" stroke-linejoin="round"/></g>`;
};
// Un carton de face : son numéro, son poids écrit, et selon sa sorte le verre (fragile) ou les deux flèches (haut). Le lourd n'a que son poids.
function svgCarton(c, x) {
  const P = c.sorte === 'fragile' ? pictoFragile(x + 70, 52, 44) : c.sorte === 'debout' ? pictoHaut(x + 70, 52, 44) : '';
  return `<g><rect x="${x + 6}" y="40" width="124" height="104" fill="#c9a06b" stroke="#2b2824" stroke-width="2.2"/>
    <rect x="${x + 60}" y="40" width="16" height="104" fill="#e8dcc0" stroke="none"/>
    <rect x="${x + 14}" y="104" width="52" height="28" fill="#fdfbf7" stroke="#2b2824" stroke-width="1.5"/>
    <text x="${x + 40}" y="123" font-size="15" font-weight="800" text-anchor="middle" fill="#2b2824">${c.kg} kg</text>
    ${P}<text x="${x + 68}" y="168" font-size="15" font-weight="800" text-anchor="middle" fill="#2b2824">Carton ${c.n}</text></g>`;
}
export const svgCartons = (L) => `<svg class="ac817-fig" viewBox="0 0 420 180" role="img" aria-label="${ech(L.map((c) => `Carton ${c.n} : ${c.kg} kg${
  c.sorte === 'fragile' ? ', un pictogramme verre à pied' : c.sorte === 'debout' ? ', un pictogramme deux flèches vers le haut' : ', aucun pictogramme'}`).join(' ; '))}">
  ${L.map((c, i) => svgCarton(c, i * 140)).join('')}</svg>`;
const DOC_CARTONS = { id: 'cartons', titre: 'Trois cartons', court: 'Trois cartons',
  html: (db) => `<article class="ac-doc" aria-label="Trois cartons">
    <p class="ac-t">Trois cartons de ta commande</p><p class="ac-st">Chaque carton dit comment le traiter : regarde les [[pictogramme|pictogrammes]] et le poids écrit.</p>
    ${svgCartons(cartonsDeBase(db))}
    <p class="ac-legende">Un carton de plus de 10 kg est lourd.</p>
    ${PIED('Dessins construits pour l’exercice ; pictogrammes redessinés d’après la norme ISO 7000.')}</article>` };
const picto = (id, titre, svg, alt) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${ech(titre)}">
  <svg class="ac817-picto" viewBox="0 0 80 80" role="img" aria-label="${ech(alt)}">${svg}</svg>${PIED('Pictogramme redessiné d’après la norme ISO 7000.')}</article>` });
const DOC_PICTO_FRAGILE = picto('picto-fragile', 'Un pictogramme', pictoFragile(10, 10, 60), 'Un pictogramme : un verre à pied');
const DOC_PICTO_HAUT = picto('picto-haut', 'Un autre pictogramme', pictoHaut(10, 10, 60), 'Un pictogramme : deux flèches vers le haut');
const DOC_JOUR = { id: 'jour', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="ac-doc" aria-label="Ta matinée">
    <p class="ac-t">Ta troisième matinée à la préparation</p>
    <p class="ac-st">Un jeudi, 6 h</p>
    <p>Le terminal te donne les cartons dans l’ordre de l’allée. Mais une [[palette]] se monte dans un autre ordre : les lourds en bas, les
      [[fragile|fragiles]] en haut. C’est le [[calage]] : il fait la [[stabilité]] de la palette.</p>
    <p>Un carton qui arrive trop tôt, tu le poses <b>à côté</b>. Tu le mets sur la palette quand la commande est terminée.</p>
    <p>À la fin, tu [[filmer|filmes]] la palette et tu poses les [[étiquette|étiquettes]] du magasin.</p>
    ${PIED('Samia est construite pour l’exercice.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac817-fig{display:block; width:100%; max-width:440px; height:auto; margin:4px auto 10px}
.ac817-fig text{font-family:system-ui, sans-serif}
.ac817-picto{display:block; width:160px; height:auto; margin:8px auto}
.ac-legende{font-size:.95rem; margin:4px 0 8px}
`;
export const DOCUMENTS = [DOC_JOUR, DOC_CARTONS, DOC_PICTO_FRAGILE, DOC_PICTO_HAUT];

// ─────────────────────────────────────────────────────────────── ① la fiche « Lire un carton »
const CHOIX_SORTE = SORTES.map((v) => ({ v, lib: LIB_SORTE[v] }));
export const FICHE = {
  id: FICHE_ID, libelle: 'Lire un carton', titre: 'Lire un carton',
  sousTitre: 'À gauche, trois cartons de ta commande. Pour chacun, choisis ce qu’il te dit.',
  documents: ['cartons'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Lire un carton »',
  blocs: (db) => [1, 2, 3].map((n) => ({ type: 'liste', id: `carton-${n}`, lib: `${n}. Le carton ${n}…`, vide: 'Choisir…', manque: `le carton ${n}`,
    choix: melangerPour(db, `fiche-${n}`, CHOIX_SORTE) })),
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Le terminal te donne les cartons dans l’ordre de l’allée. Toi, tu montes la palette dans le bon ordre. Si un carton arrive trop tôt, pose-le à côté.';
export const MONTER_SAMIA = 'Bien. Maintenant, à toi de monter.';
// Le brief disait « Belle palette. » : un verdict (la palette peut être fausse) ; remplacé par « Merci. ».
export const FIN_SAMIA = 'Merci. Demain, deux magasins à la fois.';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! ${ACCUEIL_SAMIA}\n\nCommence par la fiche « Lire un carton ».\n\nSamia`, { heure: '06:00', extra: { ouvreFiche: FICHE_ID } })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:10' })] }),
  },
  declencheurs: [
    { id: 'monter', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.monter, `${MONTER_SAMIA} Va au Plan de l’entrepôt et suis le terminal.\n\nSamia`, { db, heure: '06:10' })] }) },
    { id: 'fin', quand: apresGeste(GESTE('verifier')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `${FIN_SAMIA}\n\nSamia`, { db, heure: '06:50' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 25/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Les critères de montage ne se jugent que si les lignes sont justes et que rien ne reste
// à côté (règle du moteur) ; la fiche, qu'envoyée : l'inaction vaut 0.
export const GROUPES = { lire: 'Lire un carton', prelever: 'Les lignes', calage: 'Le calage', limites: 'Poids et hauteur', emballer: 'Emballer',
  etiqueter: 'Étiqueter' };
export const POIDS = {
  'carton-1': 1, 'carton-2': 1, 'carton-3': 1,
  'ligne-1': 0.5, 'ligne-2': 0.5, 'ligne-3': 0.5, 'ligne-4': 0.5, 'ligne-5': 0.5, 'ligne-6': 0.5,
  lourds: 2, fragiles: 2, poids: 1, hauteur: 1, film: 2, etiquettes: 2,
};
const PLAN = {
  lourds: [GROUPES.calage, 'Les lourds en bas'],
  fragiles: [GROUPES.calage, 'Les fragiles en haut'],
  poids: [GROUPES.limites, 'Le poids de la palette'],
  hauteur: [GROUPES.limites, 'La hauteur de la palette'],
  film: [GROUPES.emballer, 'Le film : 3 à 5 tours'],
  etiquettes: [GROUPES.etiqueter, 'Les étiquettes : deux faces opposées et le dessus'],
};
const jalonsPlan = etapesEntrepot(entrepotDe).map((e) => {
  const m = /^ligne-(\d)$/.exec(e.id);
  if (m) {
    const k = +m[1] - 1;
    return Object.assign(e, { titre: `Ligne n° ${k + 1} : la bonne quantité, au bon emplacement`, groupe: GROUPES.prelever, poids: POIDS[e.id],
      titreBilan: (db) => { const l = jeuDeBase(db).lignes[k]; return l ? `${l.q} ${courtDe(l.produit)} en ${l.a}` : null; } });
  }
  const [groupe, titre] = PLAN[e.id];
  return Object.assign(e, { titre, titreBilan: titre, groupe, poids: POIDS[e.id] });
});
const jalonCarton = (n) => ({ id: `carton-${n}`, titre: `Lire un carton : le carton ${n}`, groupe: GROUPES.lire, poids: POIDS[`carton-${n}`],
  ecran: `fiche:${FICHE_ID}`, titreBilan: (db) => `Le carton ${n} ${LIB_SORTE[cartonsDeBase(db)[n - 1].sorte]}`,
  verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return valeurDe(db, FICHE_ID, `carton-${n}`) === cartonsDeBase(db)[n - 1].sorte ? ok : ko; } });
export const ETAPES = [
  ...[1, 2, 3].map(jalonCarton),
  ...jalonsPlan,
];
{
  const ids = ETAPES.filter((e) => e.poids).map((e) => e.id).sort().join();
  if (ids !== Object.keys(POIDS).sort().join()) throw new Error(`ENT-8.17 : les jalons notés ne sont pas ceux du barème (${ids})`);
}

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'fiche', libelle: 'Lire un carton', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'entrepot', libelle: 'Préparer et monter ma palette', fait: preparationVerifiee },
];
// Les mots du brief (§4) ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_817 = {
  ...LEXIQUE,
  pictogramme: 'Petit dessin imprimé sur un carton : il dit comment le traiter (fragile, ce côté en haut…), sans mots.',
  fragile: 'Qui se casse facilement : verre, céramique. Un carton fragile va en haut de la palette.',
  calage: 'L’ordre et la place des cartons sur la palette : les lourds en bas, les fragiles en haut, rien qui bouge.',
  stabilité: 'Une palette stable ne penche pas et ne tombe pas, même quand on la déplace.',
  filmeuse: 'Machine qui fait tourner une palette pour l’entourer de film étirable.',
  étiquette: 'Papier collé sur la palette : il dit pour quel magasin elle part.',
  colis: 'Un carton (ou un paquet) prêt à être transporté.',
  palette: 'Plateau en bois sur lequel on pose les cartons pour les déplacer avec un transpalette ou un chariot.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), la préparation à la voix à Ensuès '
  + `(le préparateur filme sa palette), les magasins Action du Sud-Est, les pictogrammes d’emballage (norme ISO 7000, redessinés). ${MENTION_PREPA} `
  + 'Construits aussi : les limites de poids et de hauteur, le nombre de tours de film, la place des étiquettes, les trois cartons, Samia, le '
  + 'terminal et ses messages, les produits (sans marque).';
export const ACCUEIL = {
  titre: 'Monter et conditionner sa palette',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Lire un carton', 'La fiche, avec trois cartons dessinés à gauche.'],
    ['② Préparer et monter ma palette', 'Plan de l’entrepôt : suis le terminal. Lourds en bas, fragiles en haut ; un carton trop tôt, « À côté ». Puis film et étiquettes.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Les lignes dites au terminal ne se redisent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 17 : monter et conditionner sa palette',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_817,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    entrepot: { ouvertSi: (db) => dejaEnvoyee(FICHE_ID)(db), message: 'Après la fiche « Lire un carton »' },
  },
};
