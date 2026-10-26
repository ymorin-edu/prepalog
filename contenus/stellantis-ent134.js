// ENT-13.4 — Stellantis Sochaux, « ranger et compter selon ABC » : le contenu de la séance (brief `docs/briefs/ENT-13.4-stellantis-ranger-compter-abc.md` ; choix de Tristan du
// 26/10/2026, `docs/briefs/stellantis/A-TRANCHER.md`). Quatrième séance de l'entreprise n° 13 (Terminale, la rentrée), ENTRAÎNEMENT : l'élève a vu la méthode ABC en 13.3.
// Univers : `contenus/stellantis.js` ; calcul et tirage : `contenus/stellantis-abc.js` ; données, plan, export, inventaire : `contenus/stellantis-ent134-donnees.js` ;
// questions : `contenus/questions/ENT-13.4.js` ; corrigé : `contenus/corriges/ENT-13.4.js` ; activité : `activites/stellantis-ranger-compter-abc.js`.
//
// Jeudi 16 septembre 2027, 6 h, magasin des petites pièces. Trois gestes sans aide pas à pas :
//   1. « Plan du magasin » : ranger les quatre palettes de la nuit selon leur classe de rotation (A, B ou C) ; une caisse lourde ;
//   2. Extractions → tableur → Fichiers : classer les 18 références sur leur VALEUR (sorties × prix) ; la vis sort beaucoup et vaut peu, le rétroviseur l'inverse ;
//   3. « Inventaire » : choisir les références à compter (les A en valeur), saisir le relevé de l'équipe, calculer les écarts, traiter chacun selon sa cause.
// Écart au brief (dit à Tristan) : le moteur ne porte qu'UNE vue Plan d'entrepôt par séance. Le plan sert au rangement ; le comptage passe par la vue Inventaire et le relevé de
// l'équipe (messagerie), sans le terminal de comptage.
//
// Poids (brief §5, tranché par Tristan le 26/10/2026) : quatre palettes 4 · valeur 2 · classement 4 · comptage 2 · écarts 3 · questions notées 5 = 20.

import { EQUIPE as EQ, KARIM, JOURS, STYLE_DOCUMENTS, ech, pied, heureScenario } from './stellantis.js';
import { catalogueSimple } from './entreprise-commun.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { bilanInventaire } from '../core/types/inventaire.js';
import { DOC_METHODE } from './stellantis-ent133.js';
import { ID, ID_VOLET, ID_INV, TIRAGE, TABLEUR, PLAN, INVENTAIRE, LIGNES_COMPTAGE, depose, juste } from './stellantis-ent134-donnees.js';
import { QUESTIONS } from './questions/ENT-13.4.js';

export { ID, ID_VOLET, TIRAGE, TABLEUR, PLAN, INVENTAIRE } from './stellantis-ent134-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const EQUIPE = { karim: { nom: EQ.karim.prenom, role: `${EQ.karim.poste} (ton responsable)`, appel: 'Karim' } };

// ─────────────────────────────────────────────────────────────── les documents
const DOC_POSTE = { id: 'poste-134', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="st-doc" aria-label="Ton poste">
    <p class="st-t">Ton poste</p>
    <p class="st-st">Usine Stellantis de Sochaux — ${ech(JOURS.jeudi.lib)}</p>
    <p>Tu es toujours en <b>PFMP</b> dans l’<b>équipe logistique</b> de l’usine de Sochaux, avec <b>Karim</b>. Hier, tu as refait le classement ABC du magasin des petites pièces d’après les sorties.</p>
    <p>Ce matin, trois choses : <b>ranger</b> les palettes arrivées cette nuit, <b>classer</b> les références sur leur valeur (et plus seulement sur leurs sorties), puis <b>compter</b> les références
      les plus importantes pour l’usine.</p>
    ${pied('Réels : l’usine de Sochaux (Le Trois, 2026). Construits : le magasin des petites pièces, ses palettes, ses références, ses prix, ses sorties, son stock, Karim.')}
  </article>` };
const DOC_VALEUR = { id: 'valeur-134', titre: 'Classer sur la valeur', court: 'Classer sur la valeur',
  html: `<article class="st-doc" aria-label="Classer sur la valeur">
    <p class="st-t">Classer sur la valeur</p>
    <p class="st-st">Le même classement ABC, pour une autre raison</p>
    <p>Classer sur les <b>sorties</b> dit ce qu’on va chercher le plus souvent : c’est utile pour <b>ranger</b>. Classer sur la <b>valeur</b> dit ce qui compte le plus pour l’argent de l’entreprise :
      c’est utile pour décider ce qu’on <b>compte</b> le plus souvent.</p>
    <ul class="st-ul">
      <li>La <b>valeur</b> d’une référence, c’est ses <b>sorties × son prix unitaire</b>.</li>
      <li>Les seuils sont ceux de la méthode : A jusqu’à 80 % de la valeur cumulée, B jusqu’à 95 %, C au-delà.</li>
      <li>La fiche « Méthode ABC » d’hier reste dans les documents.</li>
    </ul>
    ${pied('Fiche de travail construite pour la séance.')}
  </article>` };
const DOC_MOTS = { id: 'inv-134', titre: 'Mots de l’inventaire', court: 'Mots de l’inventaire',
  html: `<article class="st-doc" aria-label="Mots de l’inventaire">
    <p class="st-t">Mots de l’inventaire</p>
    <table class="st-table"><tbody>
      <tr><th scope="row">Inventaire tournant</th><td>On compte une partie du stock à la fois, souvent les références les plus importantes, au lieu de tout compter une fois par an.</td></tr>
      <tr><th scope="row">Compter à l’aveugle</th><td>Compter ce qu’on voit, sans regarder le chiffre du logiciel.</td></tr>
      <tr><th scope="row">Stock théorique</th><td>Le stock que le logiciel croit avoir.</td></tr>
      <tr><th scope="row">Écart</th><td>Écart = compté − théorique. Négatif : il en manque.</td></tr>
      <tr><th scope="row">Régulariser</th><td>Corriger le stock du logiciel, avec un motif.</td></tr>
      <tr><th scope="row">Remettre en place</th><td>Ne pas toucher au stock du logiciel : la pièce existe, elle est mal rangée, on la remet où elle doit être.</td></tr>
    </tbody></table>
    ${pied('Aide-mémoire construit pour la séance.')}
  </article>` };
const DOC_DROIT = { id: 'droit-134', titre: 'Le droit : l’inventaire', court: 'Le droit',
  html: `<article class="st-doc" aria-label="Le droit : l’inventaire">
    <p class="st-t">Le droit : l’inventaire</p>
    <p class="st-st">Code de commerce, article L123-12 (alinéa 2)</p>
    <p class="st-loi">« Elle doit contrôler par inventaire, au moins une fois tous les douze mois, l’existence et la valeur des éléments actifs et passifs du patrimoine de l’entreprise. »</p>
    ${pied('Texte réel (Légifrance, version en vigueur, relu pour les séances France Boissons le 13/10/2026).')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_VALEUR, { ...DOC_METHODE, id: 'methode-133' }, DOC_MOTS, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les messages de Karim (il tutoie)
const MIN = 60000;
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOURS.jeudi.iso, o.heure || '06:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: KARIM.nom, fromMail: KARIM.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const inventaireEtape = (db) => { const e = db && db.inventaires && db.inventaires[ID_INV]; return e ? e.etape || 1 : 0; };
const questionRepondue = (db, id) => !!(db && db.questions && db.questions[ID] && db.questions[ID][id] && db.questions[ID][id].premiere);
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, 'Les palettes de la nuit',
      `Bonjour ${prenom} !\n\nQuatre palettes sont arrivées cette nuit. Menu « Plan du magasin » : range-les. La classe de rotation (A, B ou C) est sur la fiche de chaque palette, les règles sont dans « Les règles ». `
        + 'Attention à la caisse de rétroviseurs : elle est lourde.\n\nEnsuite, je te redis la suite.\n\nKarim', { db, heure: '06:00', extra: { pieces: ['poste-134'] } }),
    mail(prenom, 'Quelles pièces on compte chaque semaine ?',
      `${prenom}, la comptabilité veut savoir quelles pièces on compte chaque semaine.\n\nHier, tu as classé les références sur leurs sorties. Cette fois, classe-les sur leur valeur : menu Extractions, liste « Sorties de la semaine 38 », puis ton tableur. `
        + 'La fiche méthode d’hier est toujours dans les documents, et « Classer sur la valeur » dit ce qui change. Dépose ton fichier dans le menu Fichiers.\n\n'
        + 'Quand c’est déposé, je te poserai une question : quelles références comptes-tu cette semaine ?\n\nKarim', { db, heure: '06:10', extra: { pieces: ['valeur-134', 'methode-133'] } }),
  ] }),
  declencheurs: [
    // La question « quelles références comptes-tu » répondue : l'équipe de nuit a compté les lignes A en valeur, son relevé arrive.
    { id: 'releve', quand: (db) => questionRepondue(db, 'quoi-compter'),
      semer: (prenom, db) => ({ mails: [{ ...mail(prenom, 'Le relevé de la nuit', `${prenom}, l’équipe de nuit a compté ces références ce matin. Menu Inventaire : saisis le relevé, calcule les écarts, puis traite chacun.\n\n`
        + 'Compte rendu de ce qu’ils ont vu : rien d’autre à te dire pour l’instant.\n\nKarim', { db, heure: '06:40', decalage: 0, extra: { pieces: ['inv-134'] } }), kind: 'releve', inventaire: ID_INV }] }) },
    // Les écarts calculés : ce que l'équipe a vu en passant (les causes), sans dire quoi décider.
    { id: 'causes', quand: (db) => inventaireEtape(db) >= 2,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Ce qu’on a vu en passant', `${prenom}, deux choses entendues ce matin.\n\n`
        + '— Au bout de la rangée des rétroviseurs, une caisse de 2 rétroviseurs droits était posée sur l’emplacement des gauches.\n'
        + '— L’opérateur de la ligne 3 m’a dit qu’il avait pris un faisceau d’habitacle cette nuit « sans le scanner ».\n\n'
        + 'À toi de voir ce que ça change pour chaque écart.\n\nKarim', { db, heure: '06:55', extra: { pieces: ['inv-134'] } })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, 26/10/2026 ; 15 points ici + 5 de questions = 20)
const bilan = (db) => bilanInventaire(db || {}, INVENTAIRE, CATALOGUE);
const rangement = etapesEntrepot(PLAN).map((e) => ({ ...e, groupe: 'Ranger selon la rotation', poids: 1 }));
const jalonDepot = (id, titre, groupe, poids, controles) => ({ id, titre, groupe, poids,
  verifier(db) { if (!depose(db)) return attente; return controles.every((c) => juste(db, c)) ? ok : ko; } });
const jalonInv = (id, titre, poids, juger) => ({ id, titre, groupe: 'Compter les références A', poids,
  verifier(db) { const b = bilan(db); return b.valide ? (juger(b) ? ok : ko) : attente; } });
export const ETAPES = [
  ...rangement,
  jalonDepot('valeur', 'La valeur de chaque référence (formule)', 'Classer sur la valeur', 2, ['valeur']),
  jalonDepot('classement', 'Le classement ABC sur la valeur (total, part, cumul, classe)', 'Classer sur la valeur', 4, ['total', 'part', 'cumul', 'classe']),
  jalonInv('comptage', 'Le relevé saisi et les écarts calculés', 2, (b) => b.saisieOk && b.ecartsOk),
  jalonInv('ecarts', 'Chaque écart traité selon sa cause', 3, (b) => b.lignes.filter((l) => l.attendu).every((l) => l.juste)),
];

// ─────────────────────────────────────────────────────────────── accueil et options
export const ACCUEIL = {
  titre: 'Ranger et compter selon ABC',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages de Karim', 'Menu Messagerie : les palettes de la nuit, puis les pièces à compter.'],
    ['① Ranger les palettes', 'Menu Plan du magasin : la classe de rotation est sur la fiche de chaque palette.'],
    ['② Classer sur la valeur', 'Menu Extractions, ton tableur, menu Fichiers : valeur = sorties × prix.'],
    ['③ Choisir ce qu’on compte', 'Karim te pose la question dès que ton fichier est déposé.'],
    ['④ Compter et traiter les écarts', 'Menu Inventaire : le relevé de l’équipe, les écarts, une décision par écart.'],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Ranger et compter selon ABC',
  sansTrame: 'Tout se fait à l’écran et dans ton tableur',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  entrepot: PLAN,
  tableur: TABLEUR,
  inventaire: INVENTAIRE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
export { LIGNES_COMPTAGE };
