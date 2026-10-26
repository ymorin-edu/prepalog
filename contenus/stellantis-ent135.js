// ENT-13.5 — Stellantis Sochaux, « évaluation de rentrée » : le contenu de la séance (brief `docs/briefs/ENT-13.5-stellantis-evaluation-rentree.md` ; choix de Tristan du 26/10/2026,
// « tout ok »). Cinquième et dernière séance de l'entreprise n° 13 (Terminale, la rentrée), ÉVALUATION de C1.4, C1.5 et C1.6, après 13.2 (camions), 13.3 (méthode ABC) et 13.4
// (ranger et compter). Sans aide : « Avant de commencer » noté, le camion à réceptionner, le classement ABC au tableur, le rangement des palettes sans litige, un écart d'inventaire.
// Copie rendue (`copie: true`) : rien ne remonte pendant le travail, une seule remise, un dépôt unique ; UN JEU PAR ÉLÈVE (`contenus/stellantis-ent135-donnees.js`).
// Univers : `contenus/stellantis.js` ; tirage, quai, plan, export, inventaire : `contenus/stellantis-ent135-donnees.js` ; questions : `contenus/questions/ENT-13.5.js` ;
// corrigé : `contenus/corriges/ENT-13.5.js` ; activité : `activites/stellantis-evaluation-rentree.js`.
//
// Vendredi 24 septembre 2027, dernier jour de la première période de PFMP. Karim : « Aujourd'hui tu fais seul. »
// Écarts au brief (dits à Tristan) : la palette « quantité différente » n'est pas tirée (le quai la juge comme un manquant) ; le piège « tout refuser » est la couche incomplète MAIS
// conforme au bon ; le plan range les trois palettes sans litige (R1 à R3) et le jalon porte sur le rangement seul : leur classe est sur la fiche (repli du brief §7.2).
//
// Poids (brief §5, validés par Tristan le 26/10/2026 ; total 20) : « Avant de commencer » 4 (`part`) · décisions sur les cinq palettes 3 (0,6 chacune : décision, motif et comptage) ·
// réserves précises et signature 2 (1,5 + 0,5) · cumul juste 3 · classe juste 2 · rangement 2 (trois palettes) · écart traité selon sa cause 2 · questions au fil 2 (`part`).
// Garde d'inaction : rien n'est vrai avant le travail (aucun jalon n'est juste par défaut) ; refuser les cinq palettes fait tomber les palettes conformes ; sans dépôt, cumul et classe valent 0.

import { phrasesJustes } from '../core/phrases.js';
import { jalonsQuai } from '../core/types/quai.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { bilanInventaire } from '../core/types/inventaire.js';
import { EQUIPE as EQ, KARIM, JOURS, STYLE_DOCUMENTS, ech, pied, heureScenario } from './stellantis.js';
import { catalogueSimple } from './entreprise-commun.js';
import { ID, ID_VOLET, ID_QUAI, ID_INV, quaiDe, planDe, inventaireDe, jeuDeBase, causeDe, TABLEUR, depose, juste, quaiEcrit, quaiSigne,
  TEXTE_L133_3, TEXTE_L123_12 } from './stellantis-ent135-donnees.js';
import { graineDeBase } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-13.5.js';
import { parRef } from './stellantis.js';

export { ID, ID_VOLET, TABLEUR } from './stellantis-ent135-donnees.js';

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

// ─────────────────────────────────────────────────────────────── les documents (aucune fiche méthode : on évalue le geste, pas la mémoire d'un chiffre)
const DOC_POSTE = { id: 'poste-135', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="st-doc" aria-label="Ton poste">
    <p class="st-t">Ton poste</p>
    <p class="st-st">Usine Stellantis de Sochaux — ${ech(JOURS.vendredi.lib)}</p>
    <p>C’est le <b>dernier jour</b> de ta première période de <b>PFMP</b> dans l’<b>équipe logistique</b> de l’usine de Sochaux, avec <b>Karim</b>. Aujourd’hui, tu fais <b>seul</b> : un camion à
      réceptionner, les sorties de la semaine à classer, des palettes à ranger, un écart d’inventaire à expliquer. Personne ne te dit où cliquer.</p>
    ${pied('Réels : l’usine de Sochaux (Le Trois, 2026). Construits : le magasin des petites pièces, le camion, ses palettes, les références, les sorties, les stocks, Karim.')}
  </article>` };
const DOC_MOTS = { id: 'mots-135', titre: 'Les mots du métier', court: 'Les mots du métier',
  html: `<article class="st-doc" aria-label="Les mots du métier">
    <p class="st-t">Les mots du métier</p>
    <table class="st-table"><tbody>
      <tr><th scope="row">Bon de livraison (BL)</th><td>Le document qui dit ce que le fournisseur a envoyé.</td></tr>
      <tr><th scope="row">Réserve</th><td>Une remarque écrite sur le BL, avant la signature du chauffeur, quand la livraison n’est pas conforme.</td></tr>
      <tr><th scope="row">Part</th><td>Les sorties d’une référence divisées par le total des sorties.</td></tr>
      <tr><th scope="row">Cumul</th><td>La part de la référence plus les parts de toutes celles qui sont au-dessus dans la liste triée.</td></tr>
      <tr><th scope="row">Stock théorique</th><td>Le stock que le logiciel croit avoir.</td></tr>
      <tr><th scope="row">Écart</th><td>Écart = compté − théorique. Négatif : il en manque.</td></tr>
      <tr><th scope="row">Compter à l’aveugle</th><td>Compter ce qu’on voit, sans regarder le chiffre du logiciel.</td></tr>
      <tr><th scope="row">Régulariser</th><td>Corriger le stock du logiciel, avec un motif.</td></tr>
      <tr><th scope="row">Remettre en place</th><td>Ne pas toucher au stock du logiciel : la pièce existe, elle est mal rangée.</td></tr>
    </tbody></table>
    ${pied('Aide-mémoire construit pour la séance.')}
  </article>` };
const DOC_DROIT = { id: 'droit-135', titre: 'Le droit : le transport et l’inventaire', court: 'Le droit',
  html: `<article class="st-doc" aria-label="Le droit : le transport et l’inventaire">
    <p class="st-t">Le droit : le transport et l’inventaire</p>
    <p class="st-st">Code de commerce, article L133-3 (1er alinéa) — le voiturier est le transporteur</p>
    <p class="st-loi">« ${ech(TEXTE_L133_3)} »</p>
    <p class="st-st">Code de commerce, article L123-12 (alinéa 2)</p>
    <p class="st-loi">« ${ech(TEXTE_L123_12)} »</p>
    ${pied('Textes réels (Légifrance ; L133-3 relu le 17/10/2026, L123-12 relu le 13/10/2026).')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_MOTS, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les messages de Karim (il tutoie ; une seule remise)
const MIN = 60000;
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOURS.vendredi.iso, o.heure || '06:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: KARIM.nom, fromMail: KARIM.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const inventaireEtape = (db) => { const e = db && db.inventaires && db.inventaires[ID_INV]; return e ? e.etape || 1 : 0; };
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, 'Aujourd’hui tu fais seul',
      `Bonjour ${prenom} !\n\nC’est ton dernier jour avec nous. Aujourd’hui, tu fais seul, sans que je te dise où cliquer. Quatre choses :\n\n`
        + '1. Un camion de petites pièces est au quai 4 : contrôle-le (menu « Quai de réception »), écris les réserves précises sur le bon de livraison, fais signer le chauffeur.\n'
        + '2. Classe les références du magasin selon les sorties de la semaine 39 : menu Extractions, ton tableur, menu Fichiers. Seuils : A jusqu’à 80 % des sorties cumulées, B jusqu’à 95 %, C au-delà. '
        + 'Attention : tu ne peux déposer ton fichier qu’une seule fois.\n'
        + '3. Range dans le magasin les palettes que tu as reçues sans litige (menu « Plan du magasin ») : la classe de rotation est sur leur fiche.\n'
        + '4. L’équipe de nuit a compté une référence : son relevé est dans la messagerie. Menu « Inventaire ».\n\n'
        + 'Je te pose aussi quelques questions au fil de la matinée.\n\nKarim', { db, heure: '06:00', extra: { pieces: ['poste-135', 'mots-135', 'droit-135'] } }),
    mail(prenom, 'Le relevé de la nuit',
      `${prenom}, l’équipe de nuit a compté une référence ce matin. Menu Inventaire : saisis le relevé, calcule l’écart, puis décide.\n\nKarim`,
      { db, heure: '06:40', extra: { pieces: ['mots-135'] } }),
  ].map((m, i) => (i === 1 ? { ...m, kind: 'releve', inventaire: ID_INV } : m)) }),
  declencheurs: [
    // L'écart calculé : ce que l'équipe a vu en passant, selon la cause tirée (sans dire quoi décider).
    { id: 'cause', quand: (db) => inventaireEtape(db) >= 2,
      semer: (prenom, db) => {
        const I = causeDe(db);
        const d = parRef[I.ref].designation.toLowerCase();
        const vu = I.cause === 'rayon'
          ? `Au bout de la rangée, une caisse de ${d} était posée à côté de son emplacement, sur celui d’une autre référence.`
          : `L’opérateur de la ligne m’a dit qu’il avait pris des ${d} cette nuit « sans les scanner ».`;
        return { mails: [mail(prenom, 'Ce qu’on a vu en passant', `${prenom}, une chose entendue ce matin.\n\n— ${vu}\n\nÀ toi de voir ce que ça change pour ton écart.\n\nKarim`,
          { db, heure: '06:55', extra: { pieces: ['mots-135'] } })] };
      } },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5 ; total 20 avec les deux parts de questions)
export const GROUPES = { decisions: 'Contrôler le camion', reserves: 'Les réserves et la signature', abc: 'Le classement ABC', rangement: 'Ranger les palettes', inventaire: 'L’écart d’inventaire' };
const Q = (db) => quaiDe(graineDeBase(db));
const lignes = (db) => jalonsQuai(db, Q(db)).L;
const etatQuai = (db) => (db && db.quais && db.quais[ID_QUAI]) || null;
const decidee = (db, id) => { const e = etatQuai(db); return !!(e && e.palettes && e.palettes[id] && e.palettes[id].decision); };
const IDS_PALETTES = ['P1', 'P2', 'P3', 'P4', 'P5'];
const jalonsPalettes = IDS_PALETTES.map((id) => ({
  id: `palette-${id}`, titre: `Palette ${id} : décision, motif et comptage justes`, groupe: GROUPES.decisions, poids: 0.6,
  verifier(db) {
    if (!decidee(db, id)) return attente;
    const L = lignes(db);
    const d = L.find((l) => l.id === `${id}-decision`), c = L.find((l) => l.id === `${id}-comptage`);
    return d && d.ok && c && c.ok ? ok : ko;
  },
}));
const jalonReserves = { id: 'reserves', titre: 'Chaque réserve est précise (et jamais « sous réserve de déballage »)', groupe: GROUPES.reserves, poids: 1.5,
  verifier(db) {
    if (!quaiEcrit(db)) return attente;
    const L = lignes(db);
    const R = L.filter((l) => /-reserve$/.test(l.id)), d = L.find((l) => l.id === 'deballage');
    return R.length && R.every((l) => l.ok) && d && d.ok ? ok : ko;
  } };
const jalonSignature = { id: 'signature', titre: 'Le bon de livraison signé par le chauffeur', groupe: GROUPES.reserves, poids: 0.5,
  verifier(db) { return quaiSigne(db) ? ok : attente; } };
const jalonDepot = (id, titre, poids, controle) => ({ id, titre, groupe: GROUPES.abc, poids,
  verifier(db) { if (!depose(db)) return attente; return juste(db, controle) ? ok : ko; } });
// Le rangement : les trois palettes sans litige, 2 points au total (identifiants `palette-R1` à `palette-R3`, les mêmes pour tous : seul leur nom change d'un jeu à l'autre).
const rangement = etapesEntrepot(planDe(''), { copie: true }).map((e) => ({ ...e, groupe: GROUPES.rangement, poids: 2 / 3 }));
const bilan = (db) => bilanInventaire(db || {}, inventaireDe(graineDeBase(db)), CATALOGUE);
const jalonEcart = { id: 'ecart', titre: 'L’écart traité selon sa cause', groupe: GROUPES.inventaire, poids: 2,
  verifier(db) { const b = bilan(db); return b.valide ? (b.lignes.filter((l) => l.attendu).every((l) => l.juste) ? ok : ko) : attente; } };
export const ETAPES = [
  ...jalonsPalettes, jalonReserves, jalonSignature,
  jalonDepot('cumul', 'Le pourcentage cumulé, liste triée par sorties décroissantes', 3, 'cumul'),
  jalonDepot('classe', 'La classe A, B ou C avec SI', 2, 'classe'),
  ...rangement,
  jalonEcart,
];

// ─────────────────────────────────────────────────────────────── accueil et options
export const MENTION_135 = 'Réels : l’usine Stellantis de Sochaux (Doubs), ses camions et ses fournisseurs, la réception des pièces, le Code de commerce (L133-3 et L123-12). '
  + 'Construits : le magasin des petites pièces, le camion, son bon de livraison, ses palettes et leurs défauts, les références, les sorties, le stock, Karim.';
export const ACCUEIL = {
  titre: 'Évaluation de rentrée',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie : quatre choses à faire, seul.'],
    ['① Le camion', 'Menu Quai de réception : contrôle chaque palette, écris les réserves, fais signer.'],
    ['② Le classement ABC', 'Menu Extractions, ton tableur, menu Fichiers (un seul dépôt).'],
    ['③ Ranger', 'Menu Plan du magasin : les palettes sans litige.'],
    ['④ L’inventaire', 'Menu Inventaire : le relevé de l’équipe de nuit.'],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation de rentrée',
  sansTrame: 'Tout se fait à l’écran et dans ton tableur',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: (graine) => quaiDe(graine),
  entrepot: (graine) => planDe(graine),
  inventaire: (graine) => inventaireDe(graine),
  tableur: TABLEUR,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
