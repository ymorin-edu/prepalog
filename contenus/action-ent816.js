// ENT-8.16 — Action, « déstocker et signaler » : le contenu de la séance (brief `docs/briefs/ENT-8.16-action-destocker.md`). CAP OL, GUIDAGE de
// CAP-C3.2. Univers commun : `contenus/action.js`. Données pures : `contenus/action-ent816-donnees.js`. Activité : `activites/action-destocker.js`.
// Questions : `contenus/questions/ENT-8.16.js`. Corrigé : `contenus/corriges/ENT-8.16.js`.
//
// Le lendemain d'ENT-8.15 (un mardi), 6 h (AUCUNE date écrite). Trois écrans, chacun ouvert après le précédent :
//   ① Préparer (Plan d'entrepôt, préparation guidée à la voix, chantier E-8) : 7 lignes, un carton abîmé devant une pile (« Abîmé : 1 », il est mis
//      de côté et le bon se reprend sur la même pile), un emplacement vide (« Emplacement vide », Kevin descend la réserve) ; ni film ni étiquettes ;
//   ② Ce que sait le système (fiche, l'écran « Stock » du terminal à gauche) : réponses CALCULÉES sur ce que l'élève a dit au terminal ;
//   ③ Rendre compte : phrases calculées sur ses signalements, seule la forme est notée.
// « Corriger » rouvre la fiche et le message ; pas la préparation (les lignes sont dites au terminal : `finFige`).
//
// VÉRIFIÉ : C. trav. L1331-2 (en entier), recopié par Claude Code le 25/10/2026 (texte de Légifrance, LEGIARTI000006901446, lu sur doctrine.fr).
// L'explication sous le texte (la faute lourde) résume la jurisprudence de la Cour de cassation, sans la citer.

import { apresFiche, apresGeste, apresMail, tous } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.16.js';
import { ENTREPRISE as ENT_ACTION, EQUIPE, LEXIQUE, STYLE_DOCUMENTS, PIED, ech } from './action.js';
import {
  ID, ID_VOLET, ENTREPOT_ID, FICHE_ID, PHRASES_ID, SAMIA_MAIL, SUJETS, GESTE, entrepotDe, jeuDeBase, anomaliesDe, courtDe, ditDe, lignesFiche,
  melangerPour, SALUTATIONS, POLITESSES, finsDe, choixAbime, choixVide, MENTION_PREPA,
} from './action-ent816-donnees.js';

export { ID, ENTREPOT_ID, FICHE_ID, PHRASES_ID };

export const ENTREPRISE = { ...ENT_ACTION, exercice: 'Bienvenue chez Geodis' };

// ─────────────────────────────────────────────────────────────── l'heure du scénario : « le lendemain (un mardi), 6 h », sans date
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 7 - 2) % 7));
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
const reponduSamia = (db) => phrasesJustes(db, PHRASES_ID).envoye;
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les documents
const oui = (b) => (b ? 'oui' : 'non');
// L'écran « Stock » du terminal pour les deux adresses à anomalie, CALCULÉ sur ce que l'élève a dit (rien dit : le système ne sait rien).
export function svgStock(D) {
  const L = [
    ['Adresse', D.A.abime.a, true], ['Produit', courtDe(D.A.abime.produit)], ['Carton abîmé signalé', oui(D.abime === 'abime')],
    ['Adresse', D.A.vide.a, true], ['Produit', courtDe(D.A.vide.produit)], ['Emplacement vide signalé', oui(D.vide === 'vide')],
    ['Réserve descendue', oui(D.reserve)],
  ];
  return `<svg class="ac816-fig" viewBox="0 0 300 330" role="img" aria-label="${ech(`L’écran Stock du terminal : ${L.map((x) => `${x[0]} ${x[1]}`).join(', ')}`)}">
  <rect x="40" y="6" width="220" height="318" rx="26" fill="#3a3a3a" stroke="#1d1d1d" stroke-width="3"/>
  <rect x="58" y="34" width="184" height="216" rx="6" fill="#eef4fa" stroke="#1d1d1d" stroke-width="1.5"/>
  <rect x="58" y="34" width="184" height="26" rx="6" fill="#195799"/>
  <text x="150" y="52" font-size="13" font-weight="800" text-anchor="middle" fill="#fff">Stock</text>
  ${L.map(([k, val, gras], i) => `<text x="66" y="${80 + i * 25 + (i >= 3 ? 10 : 0)}" font-size="11" fill="#1d1d1d"><tspan font-weight="${gras ? 800 : 500}">${ech(k)} : </tspan><tspan font-weight="800">${ech(val)}</tspan></text>`).join('')}
  <path d="M66 ${80 + 2 * 25 + 10} H234" stroke="#9aa" stroke-width="1"/>
  ${[0, 1].map((r) => [0, 1, 2].map((c) => `<rect x="${78 + c * 50}" y="${264 + r * 26}" width="40" height="18" rx="4" fill="#5b5b5b"/>`).join('')).join('')}
  <circle cx="150" cy="20" r="3" fill="#777"/></svg>`;
}
const DOC_STOCK = { id: 'stock', titre: 'L’écran « Stock »', court: 'Stock',
  html: (db) => `<article class="ac-doc" aria-label="L’écran Stock">
    <p class="ac-t">L’écran « Stock » du terminal</p><p class="ac-st">Ce que le système sait, après ta préparation, des deux adresses où quelque chose n’allait pas.</p>
    ${svgStock(ditDe(db))}${PIED(`Dessin construit pour l’exercice. ${MENTION_PREPA}`)}</article>` };
const DOC_JOUR = { id: 'jour', titre: 'Ta matinée', court: 'Ta matinée',
  html: `<article class="ac-doc" aria-label="Ta matinée">
    <p class="ac-t">Ta deuxième matinée à la préparation</p>
    <p class="ac-st">Le lendemain, 6 h</p>
    <p>Même entrepôt, même terminal. La commande est plus longue : <b>7 lignes</b>.</p>
    <p>Avant de prendre un carton, tu le regardes. Une [[anomalie]] (un [[carton abîmé]], un [[emplacement vide]]) se dit au terminal, avec le bon mot.</p>
    <p>Quand le picking est vide, <b>Kevin</b>, le cariste, descend une palette de la [[réserve]] : c’est le [[réapprovisionnement]].</p>
    <p>Ce que tu dis au terminal [[actualiser|actualise]] le [[stock]] : le système sait ce qui est vraiment là.</p>
    ${PIED('Samia, Kevin et Yanis sont construits pour l’exercice.')}
  </article>` };
const T = 'fill="none" stroke="#2b2824" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
// Un carton abîmé, de face : un coin enfoncé, le ruban déchiré. Aucun mot.
const SVG_ABIME = `<svg class="ac816-fig" viewBox="0 0 300 220" role="img" aria-label="Un carton vu de face : un coin enfoncé, le ruban adhésif déchiré">
  <rect x="50" y="40" width="200" height="150" fill="#c9a06b" stroke="#2b2824" stroke-width="2.2"/>
  <path d="M50 40 L150 40 L150 190" ${T} stroke-dasharray="0"/>
  <rect x="135" y="40" width="30" height="150" fill="#e8dcc0" stroke="none"/>
  <path d="M135 40 V95 L150 104 L141 116 L158 128 L165 190 M165 40 V80 L150 92" ${T}/>
  <path d="M210 190 L250 150 L250 190 Z" fill="#8f6b40" stroke="#2b2824" stroke-width="2"/>
  <path d="M208 190 L222 170 L236 176 L250 150" ${T}/>
  <path d="M215 180 l8 -6 M228 172 l6 4" ${T} stroke-width="1.4"/></svg>`;
// Un emplacement de picking vide : deux montants, la lisse et son étiquette, rien au sol.
const SVG_VIDE = `<svg class="ac816-fig" viewBox="0 0 300 220" role="img" aria-label="Un emplacement de rack au sol, entre deux montants : l’étiquette sur la lisse, et rien sur le sol">
  <g ${T}><path d="M40 210 V10 M260 210 V10" stroke-width="3"/><path d="M40 40 H260" stroke-width="3.4"/></g>
  <path d="M30 208 H270" ${T}/>
  <rect x="105" y="46" width="90" height="22" rx="3" fill="#fdfbf7" stroke="#2b2824" stroke-width="1.6"/>
  <text x="150" y="61" font-size="11" font-weight="800" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" fill="#2b2824">B1-T03-N1-E2</text></svg>`;
const dessin = (id, titre, svg) => ({ id, titre, court: titre, html: `<article class="ac-doc" aria-label="${ech(titre)}">${svg}${PIED('Dessin construit pour l’exercice.')}</article>` });
const DOC_ABIME = dessin('dessin-abime', 'Un carton', SVG_ABIME);
const DOC_VIDE = dessin('dessin-vide', 'Un emplacement', SVG_VIDE);
// « Le droit » : C. trav. L1331-2 (en entier), recopié le 25/10/2026 (voir l'en-tête), et ce que juge la Cour de cassation (résumé, non cité).
export const TEXTE_L1331_2 = ['Les amendes ou autres sanctions pécuniaires sont interdites.', 'Toute disposition ou stipulation contraire est réputée non écrite.'];
const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-t">Le droit : un carton cassé, qui paie ?</p>
    <p class="ac-art"><b>Code du travail, article L1331-2</b></p>
    <div class="ac-cite">${TEXTE_L1331_2.map((p, i) => `<p>${i === 0 ? '« ' : ''}${p}${i === TEXTE_L1331_2.length - 1 ? ' »' : ''}</p>`).join('')}</div>
    <p>Ce que juge la Cour de cassation : un salarié ne paie de sa poche un dommage causé à l’employeur qu’en cas de <b>faute lourde</b> (une faute faite exprès, pour nuire). Une maladresse n’en est pas une.</p>
    ${PIED('Texte réel du Code du travail (Légifrance), consulté le 25/10/2026. Le second paragraphe résume la jurisprudence, il n’est pas une citation.')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.ac-art{margin:10px 0 2px; font-size:.95rem}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
.ac-cite p{margin:0 0 4px}
.ac816-fig{display:block; width:100%; max-width:340px; height:auto; margin:4px auto 10px}
.ac816-fig text{font-family:system-ui, sans-serif}
`;
export const DOCUMENTS = [DOC_JOUR, DOC_STOCK, DOC_ABIME, DOC_VIDE, DOC_DROIT];

// ─────────────────────────────────────────────────────────────── ② la fiche « Le stock après ma préparation »
export const FICHE = {
  id: FICHE_ID, libelle: 'Ce que sait le système', titre: 'Le stock après ma préparation',
  sousTitre: 'À gauche, l’écran « Stock » de ton terminal. Pour chaque ligne, choisis ce qui est vrai pour TA préparation.',
  documents: ['stock'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Le stock après ma préparation »',
  blocs: (db) => lignesFiche(ditDe(db)).map((l, i) => ({ type: 'liste', id: l.id, lib: `${i + 1}. ${l.lib}`, vide: 'Choisir…', manque: l.manque,
    choix: melangerPour(db, `fiche-${l.id}`, l.choix) })),
  envoi: { bouton: 'Envoyer à Samia', a: 'Samia', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ③ les phrases du message à Samia, calculées sur ses signalements
export const phrasesSamia = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: SALUTATIONS.slice(), juste: 0 },
  { id: 'abime', choix: (d) => choixAbime(ditDe(d)), juste: 0 },
  { id: 'vide', choix: (d) => choixVide(ditDe(d)), juste: 0 },
  { id: 'politesse', choix: POLITESSES.slice(), juste: 0 },
  { id: 'fin', choix: finsDe(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages (au tu ; jamais juste ni faux ; aucune date)
const SAMIA = { nom: EQUIPE.samia.nom, mail: SAMIA_MAIL };
const mail = (qui, prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: qui.nom, fromMail: qui.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const ACCUEIL_SAMIA = 'Commande plus longue aujourd’hui. Regarde bien chaque carton avant de le prendre. Si quelque chose ne va pas, tu le dis au terminal.';
export const STOCK_SAMIA = 'Ta commande est vérifiée. Regarde l’écran « Stock » de ton terminal, puis la fiche « Le stock après ma préparation ».';
export const COMPTE_SAMIA = 'Bien reçu. Ce que tu dis au terminal, c’est le stock de demain.\n\nEt ta commande : rien de spécial ?';
export const FIN_SAMIA = 'Merci. Jeudi, on regarde comment tu montes ta palette.';
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(SAMIA, prenom, SUJETS.accueil,
    `Bonjour ${prenom} ! ${ACCUEIL_SAMIA.replace('quelque chose ne va pas', 'quelque chose ne va pas (une [[anomalie]])')}\n\nSamia`, { heure: '06:00' })] }),
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:50' })] }),
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(SAMIA, prenom, 'Bien reçu', 'Bien reçu, merci.\n\nSamia', { db, heure: '06:55' })] }),
  },
  declencheurs: [
    // « Vérifier ma préparation » : la fiche, et « Le droit » joint (q-tomber).
    { id: 'stock', quand: apresGeste(GESTE('verifier')),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.stock, `${STOCK_SAMIA}\n\nJe te joins « Le droit », à lire.\n\nSamia`,
        { db, heure: '06:40', extra: { ouvreFiche: FICHE_ID, pieces: ['droit'] } })] }) },
    // La fiche envoyée : le compte rendu (phrases calculées sur ce qu'il a signalé).
    { id: 'compte', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.compte, `${COMPTE_SAMIA}\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nSamia`,
        { db, heure: '06:45', extra: { phrases: phrasesSamia(prenom) } })] }) },
    { id: 'fin', quand: tous(apresFiche(FICHE_ID), apresMail({ a: SAMIA.mail })),
      semer: (prenom, db) => ({ mails: [mail(SAMIA, prenom, SUJETS.fin, `${FIN_SAMIA}\n\nSamia`, { db, heure: '06:55' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 25/10/2026, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant la fin du terminal (lignes, anomalies, « rien d'abîmé » : celui-ci
// seulement si toutes les lignes sont posées), l'envoi de la fiche ni l'envoi du message : l'inaction vaut 0.
export const GROUPES = { prelever: 'Prélever', abime: 'Le carton abîmé', vide: 'L’emplacement vide', palette: 'Rien d’abîmé sur la palette',
  systeme: 'Ce que sait le système', compte: 'Rendre compte à Samia' };
export const POIDS = {
  'ligne-1': 1, 'ligne-2': 1, 'ligne-3': 1, 'ligne-4': 1, 'ligne-5': 1,
  'abime-dit': 3, 'vide-dit': 1.5, 'vide-reprise': 1.5, rienAbime: 1,
  'stock-abime': 1, 'stock-vide': 1, 'stock-suivant': 1,
  'cr-forme': 1,
};
// Les lignes normales de L'ÉLÈVE (le titre commun, le produit de l'élève au bilan).
const normalesDe = (db) => { const j = jeuDeBase(db), A = anomaliesDe(j); return j.lignes.filter((l, k) => k !== A.abime.k && k !== A.vide.k); };
const PLAN = {
  'abime-dit': [GROUPES.abime, '« Abîmé : 1 » dit, et la quantité reprise sur la même pile', (db) => { const a = anomaliesDe(jeuDeBase(db)).abime;
    return `${a.a} (${courtDe(a.produit)}) : « Abîmé : 1 » dit, et ${a.q} bons cartons pris`; }],
  'vide-dit': [GROUPES.vide, '« Emplacement vide » dit', (db) => `${anomaliesDe(jeuDeBase(db)).vide.a} : « Emplacement vide » dit`],
  'vide-reprise': [GROUPES.vide, 'La ligne reprise après la réserve', (db) => { const v = anomaliesDe(jeuDeBase(db)).vide;
    return `${v.a} : ${v.q} ${courtDe(v.produit)} pris après la réserve`; }],
  rienAbime: [GROUPES.palette, 'Aucun carton abîmé sur la palette'],
};
const jalonsPlan = etapesEntrepot(entrepotDe).map((e) => {
  const m = /^ligne-(\d)$/.exec(e.id);
  if (m) {
    const k = +m[1] - 1;
    return Object.assign(e, { titre: `Ligne normale n° ${k + 1} : la bonne quantité, au bon emplacement`, groupe: GROUPES.prelever, poids: POIDS[e.id],
      titreBilan: (db) => { const l = normalesDe(db)[k]; return l ? `${l.q} ${courtDe(l.produit)} en ${l.a}` : null; } });
  }
  const [groupe, titre, titreBilan] = PLAN[e.id];
  return Object.assign(e, { titre, titreBilan: titreBilan || titre, groupe, poids: POIDS[e.id] });
});
const LIB_FICHE = { abime: 'le carton abîmé', vide: 'l’emplacement vide', suivant: 'le prochain préparateur' };
const jalonFiche = (l) => ({ id: `stock-${l}`, titre: `Ce que sait le système : ${LIB_FICHE[l]}`, groupe: GROUPES.systeme, poids: POIDS[`stock-${l}`],
  ecran: `fiche:${FICHE_ID}`,
  // Jugée sur SES gestes (ce qu'il a dit au terminal), jamais sur la réponse « idéale ».
  verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; const L = lignesFiche(ditDe(db)).find((x) => x.id === l); return valeurDe(db, FICHE_ID, l) === L.juste ? ok : ko; } });
const ECRAN = `phrases:${PHRASES_ID}`;
export const ETAPES = [
  ...jalonsPlan,
  ...['abime', 'vide', 'suivant'].map(jalonFiche),
  { id: 'cr-forme', titre: 'Le message à Samia : la salutation et la politesse', groupe: GROUPES.compte, poids: POIDS['cr-forme'], ecran: ECRAN,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return ['salutation', 'politesse'].every((x) => r.justes.includes(x)) ? ok : ko; } },
];
{
  const ids = ETAPES.filter((e) => e.poids).map((e) => e.id).sort().join();
  if (ids !== Object.keys(POIDS).sort().join()) throw new Error(`ENT-8.16 : les jalons notés ne sont pas ceux du barème (${ids})`);
}

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
export const SUITE = [
  { vue: 'entrepot', libelle: 'Préparer ma commande', fait: preparationVerifiee },
  { vue: 'fiche', libelle: 'Ce que sait le système', fait: dejaEnvoyee(FICHE_ID) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Samia', fait: reponduSamia },
];
// Les mots du brief (§4) ; définitions neutres CONSTRUITES par Claude Code (à relire).
export const LEXIQUE_816 = {
  ...LEXIQUE,
  anomalie: 'Quelque chose qui ne va pas : un carton abîmé, un emplacement vide, un produit qui manque.',
  'carton abîmé': 'Un carton écrasé, déchiré ou mouillé : le magasin ne pourrait pas le vendre. On le laisse et on le signale.',
  'emplacement vide': 'Un emplacement du picking où il n’y a plus de cartons. On le dit au terminal : le cariste descend la réserve.',
  réapprovisionnement: 'Descendre une palette de la réserve dans le picking, pour qu’il ne reste jamais vide.',
  réserve: 'Les niveaux au-dessus du sol : on y stocke des palettes pleines, qu’on descend quand le picking se vide.',
  actualiser: 'Mettre à jour : dire au système ce qui a changé, pour qu’il sache ce qui est vraiment là.',
  stock: 'Tous les produits rangés dans l’entrepôt, et leur nombre. Le système le connaît par ce qu’on lui dit.',
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
};
export const MENTION = 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), la préparation à la voix à Ensuès, '
  + `les magasins Action du Sud-Est, le Code du travail. ${MENTION_PREPA} Construits aussi : le carton abîmé, l’emplacement vide, Samia, Kevin et Yanis, `
  + 'le terminal et ses messages, les produits (sans marque).';
export const ACCUEIL = {
  titre: 'Déstocker et signaler',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Samia', 'Menu Messagerie.'],
    ['① Préparer ma commande', 'Plan de l’entrepôt : suis le terminal. Regarde chaque carton ; ce qui ne va pas se dit au terminal.'],
    ['② Ce que sait le système', 'La fiche, avec l’écran « Stock » du terminal à gauche.'],
    ['③ Rendre compte à Samia', 'Elle t’écrit après la fiche. Une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Ta préparation est faite : elle ne se refait pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 16 : déstocker et signaler',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_816,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiche: FICHE,
  entrepot: entrepotDe,
  suite: SUITE,
  equipe: { ...EQUIPE, yanis: { nom: 'Yanis', role: 'préparateur', appel: 'Yanis', registre: 'tu' } },
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  fermetures: {
    fiche: { ouvertSi: preparationVerifiee, message: 'Après « Vérifier ma préparation »' },
  },
};
