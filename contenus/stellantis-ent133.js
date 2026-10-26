// ENT-13.3 — Stellantis Sochaux, « la méthode ABC au tableur » : le contenu de la séance (brief `docs/briefs/ENT-13.3-stellantis-methode-abc.md` ; choix de Tristan du
// 26/10/2026, `docs/briefs/stellantis/A-TRANCHER.md`). Troisième séance de l'entreprise n° 13 (Terminale, la rentrée), GUIDAGE de la méthode ABC (nouvelle en Terminale :
// en 2de et en 1re, la classe de rotation d'un produit était écrite sur sa fiche ; ici l'élève la calcule). Entraînement : ENT-13.4 ; évaluation : ENT-13.5.
// Univers : `contenus/stellantis.js` ; calcul et tirage : `contenus/stellantis-abc.js` ; données et contrôles : `contenus/stellantis-ent133-donnees.js` ;
// questions : `contenus/questions/ENT-13.3.js` ; corrigé : `contenus/corriges/ENT-13.3.js` ; activité : `activites/stellantis-methode-abc.js`.
//
// Mercredi 15 septembre 2027, 13 h 30, bureau du magasin des petites pièces. Écrans : Avant de commencer (non noté) → Extractions (exporter les sorties de la semaine 37)
// → le tableur de l'élève (trier, total SOMME, part, cumul, classe SI) → Fichiers (déposer ; retour détaillé, redépôt illimité) → des questions sur SON classement.
//
// Poids (brief §5, tranché par Tristan le 26/10/2026) : total 2 · part 3 · cumul 4 · classe 4 · questions notées 7 (lire son classement 2, décider où ranger 2, pourquoi 1,5,
// le stock qui dort 1,5) = 20. Rien n'est vrai avant le dépôt : l'inaction vaut 0 ; les questions de lecture ne sont posées qu'une fois la classe déposée juste.

import { EQUIPE as EQ, KARIM, JOURS, STYLE_DOCUMENTS, ech, pied, heureScenario } from './stellantis.js';
import { catalogueSimple } from './entreprise-commun.js';
import { ID, ID_VOLET, TIRAGE, TABLEUR, depose, juste } from './stellantis-ent133-donnees.js';
import { QUESTIONS } from './questions/ENT-13.3.js';

export { ID, ID_VOLET, TIRAGE, TABLEUR } from './stellantis-ent133-donnees.js';

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
const DOC_POSTE = { id: 'poste-133', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="st-doc" aria-label="Ton poste">
    <p class="st-t">Ton poste</p>
    <p class="st-st">Usine Stellantis de Sochaux — ${ech(JOURS.mercredi.lib)}</p>
    <p>Tu es en <b>PFMP</b> dans l’<b>équipe logistique</b> de l’usine de Sochaux (Doubs), où l’on fabrique les Peugeot 3008 et 5008 à raison d’environ <b>une voiture par minute</b>.
      Ton responsable : <b>Karim</b>, chef d’équipe.</p>
    <p>L’usine ne garde que quelques heures de pièces d’avance. Au bord du montage, un <b>magasin des petites pièces</b> (vis, clips, joints, ampoules, faisceaux, rétroviseurs…)
      alimente les postes. Ce magasin a été rangé il y a deux ans : aujourd’hui, certaines pièces sortent beaucoup plus qu’avant.</p>
    <p>Ton travail cet après-midi : <b>refaire le classement ABC</b> des références d’après leurs sorties de la semaine, puis décider où les ranger.</p>
    ${pied('Réels : l’usine de Sochaux, ses modèles, sa cadence (Le Trois, 2026). Construits : le magasin des petites pièces, ses références, ses sorties, Karim.')}
  </article>` };

// Un exemple à six références, ENTIÈREMENT calculé à la main (total 1 000) : valeurs écrites, jamais recalculées.
const EXEMPLE = [['Référence 1', 600, '60 %', '60 %', 'A'], ['Référence 2', 250, '25 %', '85 %', 'B'], ['Référence 3', 80, '8 %', '93 %', 'B'],
  ['Référence 4', 40, '4 %', '97 %', 'C'], ['Référence 5', 20, '2 %', '99 %', 'C'], ['Référence 6', 10, '1 %', '100 %', 'C']];
const DOC_METHODE = { id: 'methode-133', titre: 'Fiche méthode : la méthode ABC', court: 'Méthode ABC',
  html: `<article class="st-doc" aria-label="Fiche méthode ABC">
    <p class="st-t">La méthode ABC</p>
    <p class="st-st">Classer les références d’un magasin d’après ce qu’elles pèsent dans les sorties</p>
    <p><b>Pourquoi ?</b> Dans un magasin, quelques références font l’essentiel des sorties et beaucoup d’autres presque rien. La méthode ABC les range en trois classes pour décider
      <b>où les ranger</b> (les plus demandées au plus près) et, plus tard, <b>combien de fois les compter</b>.</p>
    <p><b>Les seuils de la séance</b> (d’autres seuils existent, celui-ci est le nôtre) :</p>
    <ul class="st-ul">
      <li><b>A</b> : tant que le cumul des sorties ne dépasse pas <b>80 %</b> ;</li>
      <li><b>B</b> : jusqu’à <b>95 %</b> ;</li>
      <li><b>C</b> : au-delà.</li>
    </ul>
    <p><b>Les étapes dans le tableur</b> :</p>
    <ol class="st-ul">
      <li><b>Trier</b> les références par sorties, de la plus grande à la plus petite ;</li>
      <li>calculer le <b>total</b> des sorties (fonction <b>SOMME</b>) ;</li>
      <li>calculer la <b>part</b> de chaque référence : ses sorties ÷ le total (format pourcentage) ;</li>
      <li>calculer le <b>cumul</b> : la part de la première, puis, en descendant, le cumul de la ligne du dessus + la part de la ligne ;</li>
      <li>donner la <b>classe</b> avec la fonction <b>SI</b> : A si le cumul est inférieur ou égal à 80 %, B s’il est inférieur ou égal à 95 %, C sinon.</li>
    </ol>
    <p><b>Un exemple</b> à six références (total des sorties : 1 000) :</p>
    <table class="st-table st-ex">
      <thead><tr><th scope="col">Référence</th><th class="st-d" scope="col">Sorties</th><th class="st-d" scope="col">Part</th><th class="st-d" scope="col">Cumul</th><th scope="col">Classe</th></tr></thead>
      <tbody>${EXEMPLE.map(([r, s, p, c, k]) => `<tr><td>${r}</td><td class="st-d">${s}</td><td class="st-d">${p}</td><td class="st-d">${c}</td><td>${k}</td></tr>`).join('')}</tbody>
    </table>
    <p><b>Où ranger ?</b> Les <b>A</b> près de la sortie du magasin (travée T01) et à hauteur d’homme (niveau N2, entre la taille et l’épaule) ; les <b>C</b> au fond (travée T03) et en
      hauteur (N3) ou au sol (N1) ; les B entre les deux. Le niveau N1 est le sol, N3 le haut du rayonnage.</p>
    <p><b>Une règle, pas une loi.</b> La méthode ABC aide à décider, elle ne remplace pas le jugement : d’autres contraintes (le poids, la sécurité, la continuité de la production) peuvent
      l’emporter.</p>
    ${pied('Sources de la méthode : Office québécois de la langue française (fiche « méthode ABC », Grand dictionnaire terminologique) ; rackdestockage.eu ; mecalux.fr. Exemple construit.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_METHODE];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── le message de Karim (il tutoie)
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOURS.mercredi.iso, o.heure || '13:30', { db: o.db, volet: ID_VOLET }), from: KARIM.nom, fromMail: KARIM.mail,
  to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, 'Refaire le classement ABC du magasin',
      `Bonjour ${prenom} !\n\nLe magasin a été rangé il y a deux ans. Depuis, la 5008 a changé de version et certaines pièces sortent beaucoup plus qu’avant : on refait le classement ABC. `
        + 'Lis d’abord la fiche méthode, puis :\n\n'
        + '1. Menu Extractions, liste « Sorties de la semaine 37 » : clique sur Exporter. Tu obtiens un fichier Excel (les références du magasin et leurs sorties de la semaine, en pièces).\n'
        + '2. Ouvre-le dans Excel ou LibreOffice. Sélectionne les lignes des références (pas la ligne de titres) et trie-les sur la colonne Sorties, de la plus grande à la plus petite.\n'
        + '3. Sous la dernière référence, dans la première ligne libre, écris « Total » dans la colonne Désignation et calcule le total des sorties avec la fonction SOMME.\n'
        + '4. Colonne « Part » : la part de chaque référence (ses sorties divisées par le total), au format pourcentage. Le total ne doit pas bouger quand tu recopies la formule vers le bas : utilise le signe $.\n'
        + '5. Colonne « Cumul » : pour la première, sa part ; ensuite, le cumul de la ligne du dessus plus la part de la ligne. Recopie vers le bas.\n'
        + '6. Colonne « Classe » : avec la fonction SI, A si le cumul est inférieur ou égal à 80 %, B s’il est inférieur ou égal à 95 %, C sinon.\n'
        + '7. Enregistre le fichier (.xlsx) et dépose-le dans le menu Fichiers : le site te dit ce qui est juste et ce qui cloche. Tu peux corriger et redéposer autant de fois que tu veux.\n\n'
        + 'Ensuite, je te poserai quelques questions sur ton classement.\n\nKarim',
      { db, heure: '13:30', extra: { pieces: ['poste-133', 'methode-133'] } }),
  ] }),
};

// ─────────────────────────────────────────────────────────────── les jalons (poids du brief §5, 26/10/2026 ; 13 points ici + 7 de questions = 20)
const jalon = (id, titre, groupe, poids, controle) => ({ id, titre, groupe, poids,
  verifier(db) { if (!depose(db)) return attente; return juste(db, controle) ? ok : ko; } });
export const ETAPES = [
  jalon('total', 'Le total des sorties avec SOMME', 'Le total des sorties', 2, 'total'),
  jalon('part', 'La part de chaque référence (formule)', 'La part de chaque référence', 3, 'part'),
  jalon('cumul', 'Le pourcentage cumulé, liste triée par sorties décroissantes', 'Le cumul', 4, 'cumul'),
  jalon('classe', 'La classe A, B ou C avec SI', 'La classe de chaque référence', 4, 'classe'),
];

// ─────────────────────────────────────────────────────────────── accueil et options
export const ACCUEIL = {
  titre: 'La méthode ABC au tableur',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Karim', 'Menu Messagerie, avec la fiche méthode.'],
    ['① Exporter les sorties', 'Menu Extractions, liste « Sorties de la semaine 37 » : Exporter.'],
    ['② Classer dans le tableur', 'Trier, total (SOMME), part, cumul, classe (SI).'],
    ['③ Déposer ton fichier', 'Menu Fichiers : le site te dit ce qui est juste et ce qui cloche ; corrige et redépose.'],
    ['④ Lire ton classement et décider', 'Karim te pose quelques questions sur ton classement.'],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'La méthode ABC au tableur',
  sansTrame: 'Tout se fait à l’écran et dans ton tableur',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  tableur: TABLEUR,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
