// Stellantis Sochaux — le TEMPS 2, C3.4 « coordonner une petite équipe logistique » (ENT-13.10 à 13.12, Terminale) : données, documents et blocs
// de fiche communs. Construit le 27/10/2026 (choix de Tristan « Les quatre, dans l'ordre » : option A, sans vue nouvelle ; délégation du 26/10).
// Écart au cadrage (§3, temps 2) : les séances sont faites de FICHES (fabrique `contenus/fabrique-fiches.js`), pas de la vue `planning` ni de
// `dialogue` : l'affectation se choisit poste par poste dans une liste, l'oral devient un compte rendu par phrases. Dit à Tristan.
//
// RÉEL (repris de `contenus/stellantis.js`) : l'usine de Sochaux, sa ligne unique 3008 et 5008, environ une voiture par minute, 5 400 CDI et
// 1 050 intérimaires ; le transstockeur et ses robots. Droit (résumés) : formation renforcée à la sécurité des intérimaires affectés à un poste à
// risque (L4154-2) ; CACES R489 et autorisation de conduite de l'employeur (R4323-56) ; aménagement raisonnable du poste d'un travailleur handicapé
// (L5213-6) ; le médecin du travail donne des restrictions, jamais le diagnostic (secret médical).
// CONSTRUIT : l'équipe et ses prénoms, les CACES et formations de chacun, les postes et leurs exigences, la règle de priorité, les temps de
// préparation des kits, la part de 5008 de chaque matinée, l'avis du médecin du travail, les dates (mars et mai 2028).
// ⚠ Le jeu de l'évaluation (13.12) est une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte, graineDeBase } from '../core/tirage.js';
import { ech, pied, EQUIPE, STYLE_DOCUMENTS } from './stellantis.js';
import { memes, proche } from './fabrique-fiches.js';
import { catalogueSimple } from './entreprise-commun.js';

// Ce que le moteur exige (aucun article en jeu).
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MAIL_KARIM = EQUIPE.karim.mail;
export const TUTEUR = { nom: 'Karim, chef d’équipe logistique', mail: MAIL_KARIM, appel: 'Karim' };
export const PERSONNES = { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } };
export const MENTION_EQUIPE = 'Réels : l’usine Stellantis de Sochaux (Doubs), sa ligne unique 3008 et 5008, environ une voiture par minute ; le CACES R489 ; '
  + 'des règles du Code du travail, résumées (L4154-2, L1251-23, L1251-24, R4323-56, L5213-6). Construits : l’équipe, ses prénoms et ses CACES, les postes, '
  + 'les temps de préparation des kits, l’avis du médecin du travail, les imprévus, les messages.';
const EQUIPE_U = { karim: { nom: 'Karim', role: 'chef d’équipe logistique (ton tuteur)', appel: 'Karim', registre: 'tu', metier: 'Chef d’équipe logistique',
  phrase: 'J’organise l’équipe du matin du secteur réception et approvisionnement : qui tient quel poste, l’accueil des nouveaux, la consigne du jour.' } };
// L'univers passé à la fabrique.
export const U = { tuteur: { nom: 'Karim, chef d’équipe logistique', mail: EQUIPE.karim.mail, appel: 'Karim' }, MENTION: MENTION_EQUIPE, STYLE: STYLE_DOCUMENTS, EQUIPE: EQUIPE_U };
export const SALUT = { id: 'salutation', choix: ['Bonjour Karim,', 'Salut Karim !', 'Coucou,'], juste: 0 };
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });

// ─────────────────────────────────────────── les postes du matin et leurs exigences
export const POSTES = [
  { v: 'ligne', lib: 'Bord de ligne (chariot frontal, livrer les bacs au pied des postes)', caces: '3', forme: true },
  { v: 'quai', lib: 'Quai de réception (chariot frontal, décharger les camions)', caces: '3' },
  { v: 'racks', lib: 'Stockage en hauteur (chariot à mât rétractable)', caces: '5' },
  { v: 'kits', lib: 'Préparation des kits de pièces (à pied, après formation au poste)', caces: null },
];
// Peut-il tenir ce poste ? (CACES de la bonne catégorie et, pour la ligne, formé(e) au bord de ligne ; les kits : tout le monde, une fois formé au poste.)
export const peutTenir = (p, x) => (!x.caces || p.caces.includes(x.caces)) && (!x.forme || !!p.ligne);
// L'affectation juste : chaque poste tenu par une personne qui le peut, chacun à un seul poste. Les équipes sont faites pour qu'il n'y ait
// qu'une solution (le bloc de test le vérifie) ; on la cherche en essayant tous les ordres.
export function affectation(E) {
  const essai = (i, reste) => { if (i === POSTES.length) return {};
    for (const p of reste.filter((q) => peutTenir(q, POSTES[i]))) { const suite = essai(i + 1, reste.filter((q) => q !== p)); if (suite) return { [POSTES[i].v]: p.id, ...suite }; }
    return null; };
  return essai(0, E);
}
export const nbAffectations = (E) => { const compte = (i, reste) => (i === POSTES.length ? 1
  : reste.filter((q) => peutTenir(q, POSTES[i])).reduce((n, p) => n + compte(i + 1, reste.filter((q) => q !== p)), 0)); return compte(0, E); };
export const LIB_CACES = (p) => (p.caces.length ? `CACES R489 catégorie${p.caces.length > 1 ? 's' : ''} ${p.caces.join(' et ')}` : 'aucun CACES');

// La charge des kits : un kit par voiture ; 0,8 min pour un kit de 3008, 1,4 min pour un kit de 5008 ; une personne prépare des kits 360 minutes
// dans la matinée (6 h de travail effectif) ; 360 voitures dans la matinée (environ une par minute).
export const VOITURES = 360;
export const MIN_3008 = 0.8;
export const MIN_5008 = 1.4;
export const MIN_PERSONNE = 360;
export const charge = (part) => { const n5 = Math.round(VOITURES * part / 100); const n3 = VOITURES - n5;
  const minutes = Math.round((n3 * MIN_3008 + n5 * MIN_5008) * 10) / 10; return { n5, n3, minutes, personnes: Math.ceil(minutes / MIN_PERSONNE) }; };

// ─────────────────────────────────────────── les équipes
// ENT-13.10 : lundi 6 mars 2028. Karim est en formation ; Théo, intérimaire, arrive aujourd'hui.
export const E1310 = [
  { id: 'julien', nom: 'Julien', statut: 'cariste, CDI', caces: ['3', '5'], ligne: true },
  { id: 'amel', nom: 'Amel', statut: 'cariste, CDI', caces: ['3'], ligne: false },
  { id: 'sebastien', nom: 'Sébastien', statut: 'cariste, CDI', caces: ['5'], ligne: false },
  { id: 'theo', nom: 'Théo', statut: 'intérimaire, premier jour', caces: [], ligne: false },
];
export const PART1310 = 30;
// ENT-13.11 : mardi 16 mai 2028. Julien est absent ; Amel, formée au bord de ligne en avril, revient avec un avis du médecin du travail ;
// Inès, intérimaire, arrive avec son CACES 5 ; la ligne monte à 45 % de 5008.
export const E1311 = [
  { id: 'amel', nom: 'Amel', statut: 'cariste, CDI (revient aujourd’hui, avis du médecin du travail)', caces: ['3'], ligne: true },
  { id: 'sebastien', nom: 'Sébastien', statut: 'cariste, CDI', caces: ['3', '5'], ligne: false },
  { id: 'ines', nom: 'Inès', statut: 'intérimaire, CACES 5 à jour', caces: ['5'], ligne: false },
  { id: 'theo', nom: 'Théo', statut: 'intérimaire, formé aux kits depuis mars', caces: [], ligne: false },
];
export const PART1311 = 45;
// ENT-13.12 : trois jeux.
const JEUX1312 = [
  { jour: 'jeudi 8 juin 2028', equipe: [
    { id: 'yanis', nom: 'Yanis', statut: 'cariste, CDI', caces: ['3'], ligne: true },
    { id: 'clara', nom: 'Clara', statut: 'cariste, CDI', caces: ['3'], ligne: false },
    { id: 'hugo', nom: 'Hugo', statut: 'cariste, CDI', caces: ['5'], ligne: false },
    { id: 'leo', nom: 'Léo', statut: 'intérimaire, formé aux kits', caces: [], ligne: false }], part: 40, alea: 'restriction' },
  { jour: 'lundi 12 juin 2028', equipe: [
    { id: 'romain', nom: 'Romain', statut: 'cariste, CDI', caces: ['3'], ligne: true },
    { id: 'sarah', nom: 'Sarah', statut: 'cariste, CDI', caces: ['5'], ligne: false },
    { id: 'nolan', nom: 'Nolan', statut: 'cariste, CDI', caces: ['3'], ligne: false },
    { id: 'emma', nom: 'Emma', statut: 'intérimaire, formée aux kits', caces: [], ligne: false }], part: 25, alea: 'interim' },
  { jour: 'mardi 13 juin 2028', equipe: [
    { id: 'ines2', nom: 'Inès', statut: 'cariste, CDI', caces: ['3', '5'], ligne: true },
    { id: 'malik', nom: 'Malik', statut: 'cariste, CDI', caces: ['5'], ligne: false },
    { id: 'lucie', nom: 'Lucie', statut: 'cariste, CDI', caces: ['3'], ligne: false },
    { id: 'tom', nom: 'Tom', statut: 'intérimaire, formé aux kits', caces: [], ligne: false }], part: 50, alea: 'conflit' },
];
export const indiceJeu = (db, n) => empreinte(`${graineDeBase(db)}|stellantis-equipe`) % n;
export const jeu1312 = (db) => JEUX1312[indiceJeu(db, JEUX1312.length)];
export const TOUS_JEUX1312 = JEUX1312;
// Les imprévus de l'évaluation : la situation, trois réponses (la juste n'est pas toujours au même rang), la juste.
export const ALEAS = {
  restriction: { texte: 'Clara revient d’un arrêt : le médecin du travail interdit, pour elle, la manutention à la main de charges de plus de 10 kg.', juste: 'amenager',
    choix: [{ v: 'renvoyer', lib: 'Je la renvoie chez elle : elle ne peut pas travailler' },
      { v: 'amenager', lib: 'Je garde Clara au quai et j’aménage le poste : les charges lourdes au chariot, jamais à la main' },
      { v: 'ignorer', lib: 'Je ne change rien : elle fera attention' }] },
  interim: { texte: 'À 6 h 10, Emma, l’intérimaire des kits, n’est pas arrivée et ne répond pas.', juste: 'karim',
    choix: [{ v: 'nolan', lib: 'Je mets Nolan aux kits et je laisse le quai vide' }, { v: 'attendre', lib: 'J’attends 10 h, elle finira bien par venir' },
      { v: 'karim', lib: 'Je préviens Karim et l’agence d’intérim tout de suite, et je demande un remplaçant formé aux kits' }] },
  conflit: { texte: 'Lucie et Malik se disputent le poste du quai : chacun dit qu’il y était la semaine dernière.', juste: 'regle',
    choix: [{ v: 'regle', lib: 'Je les écoute tous les deux, puis j’applique la règle : le poste selon le CACES ; Malik n’a pas la catégorie 3' },
      { v: 'tirer', lib: 'Je tire au sort' }, { v: 'laisser', lib: 'Je les laisse s’arranger entre eux' }] },
};

// Par ordre alphabétique : l'ordre des équipes ci-dessus est celui des postes, il ne doit pas se voir à l'écran.
export const parNom = (E) => E.slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

// ─────────────────────────────────────────── les documents
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="st-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="st-doc" aria-label="${ech(titre)}">${corps}</article>` });
export const docEquipe = (get, jour) => doc('equipe-matin', 'L’équipe du matin', 'L’équipe', (db) => { const E = get(db);
  return `<p class="st-t">L’équipe du matin — secteur réception et approvisionnement</p><p class="st-st">${ech(typeof jour === 'function' ? jour(db) : jour)}</p>
  <table class="st-table"><thead><tr><th scope="col">Qui</th><th scope="col">Statut</th><th scope="col">CACES R489</th><th scope="col">Formé(e) au bord de ligne</th></tr></thead><tbody>
    ${parNom(E).map((p) => `<tr><td><b>${ech(p.nom)}</b></td><td>${ech(p.statut)}</td><td>${p.caces.length ? `catégorie${p.caces.length > 1 ? 's' : ''} ${p.caces.join(' et ')}` : 'aucun'}</td><td>${p.ligne ? 'oui' : 'non'}</td></tr>`).join('')}
  </tbody></table>${pied('Équipe, prénoms, CACES et formations CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}`; });
export const DOC_POSTES = doc('postes', 'Les postes du matin', 'Les postes', `<p class="st-t">Les quatre postes du matin</p><p class="st-st">Ce que chaque poste demande</p>
  <table class="st-table"><thead><tr><th scope="col">Poste</th><th scope="col">Il faut</th></tr></thead><tbody>
    ${POSTES.map((x) => `<tr><td><b>${ech(x.lib)}</b></td><td>${x.caces ? `le CACES R489 catégorie ${x.caces}` : 'une formation au poste'}${x.forme ? ', et être formé(e) au bord de ligne' : ''}</td></tr>`).join('')}
  </tbody></table>
  <ul class="st-ul">
    <li><b>Catégorie 3</b> : chariot élévateur frontal (porte-à-faux) ; <b>catégorie 5</b> : chariot à mât rétractable. Sans le CACES de la bonne catégorie et
      sans autorisation de conduite de l’employeur, on ne conduit pas.</li>
    <li><b>La règle de l’équipe</b> : on affecte d’abord le poste le plus exigeant (le bord de ligne : la ligne ne doit jamais manquer de pièces), puis
      le quai, les racks, les kits. Chaque personne tient un seul poste. Les deux robots du transstockeur roulent seuls : personne ne leur est affecté.</li>
  </ul>${pied('Postes, exigences et règle de l’équipe CONSTRUITS d’après l’usage ; CACES R489 : recommandation réelle de l’Assurance maladie. Document pédagogique.')}`);
export const docCharge = (part) => doc('charge', 'La charge des kits', 'Les kits', (db) => { const P = typeof part === 'function' ? part(db) : part;
  return `<p class="st-t">La charge de la préparation des kits</p><p class="st-st">Le planning de la ligne pour la matinée</p>
  <ul class="st-ul">
    <li>La ligne fait environ <b>${VOITURES} voitures</b> dans la matinée (une par minute), dont <b>${P} %</b> de 5008 ; les autres sont des 3008.</li>
    <li>Chaque voiture a son kit de pièces : <b>${String(MIN_3008).replace('.', ',')} minute</b> pour un kit de 3008, <b>${String(MIN_5008).replace('.', ',')} minute</b> pour un kit de 5008 (plus de pièces).</li>
    <li>Une personne prépare des kits pendant <b>${MIN_PERSONNE} minutes</b> dans la matinée.</li>
  </ul>${pied('Temps de préparation et planning CONSTRUITS pour l’exercice ; part de 5008 de l’usine : environ 30 % (Le Trois, 2026). Document pédagogique.')}`; });
export const DOC_ACCUEIL = doc('accueil', 'Accueillir un intérimaire', 'L’accueil', `<p class="st-t">Accueillir un nouvel arrivant</p><p class="st-st">Le livret du chef d’équipe</p>
  <ul class="st-ul">
    <li>Un intérimaire affecté à un poste à risque reçoit une <b>formation renforcée à la sécurité</b> et un accueil adapté (Code du travail, L4154-2).</li>
    <li>On l’accueille <b>avant</b> de le mettre au poste : la sécurité d’abord (règles du site, EPI, circulation des piétons et des chariots),
      puis l’équipe et son tuteur, puis le geste montré au poste ; il le fait ensuite sous l’œil de son tuteur, et on fait le point avec lui.</li>
    <li>Sans CACES de la bonne catégorie et sans autorisation de conduite de l’employeur (R4323-56), il ne conduit aucun chariot ; il n’entre pas dans les
      allées du transstockeur.</li>
    <li>Ses équipements de protection sont fournis par l’usine, et il ne les paie jamais (L1251-23) ; il a accès à la cantine et aux vestiaires comme les
      salariés de l’usine (L1251-24).</li>
  </ul>${pied('Règles RÉELLES (résumés de la loi, pas des citations) (résumé de la loi, pas une citation) ; livret CONSTRUIT. Document pédagogique.')}`);
export const DOC_AVIS = doc('avis', 'L’avis du médecin du travail', 'L’avis', `<p class="st-t">Avis du médecin du travail — Amel</p><p class="st-st">Reçu par le service des ressources humaines</p>
  <ul class="st-ul">
    <li>Apte à la conduite des chariots de catégorie 3.</li>
    <li><b>Restriction</b> : pas de manutention à la main de charges de plus de 10 kg. Aménagement du poste à prévoir.</li>
  </ul>
  <p>Le médecin donne des <b>restrictions</b>, jamais la maladie ni le handicap : ce qu’Amel en dit, c’est à elle de le décider. L’employeur prend les
    mesures appropriées pour qu’un travailleur handicapé garde son emploi (« aménagement raisonnable », Code du travail, L5213-6).</p>
  ${pied('Avis CONSTRUIT pour l’exercice ; règles RÉELLES (résumé de la loi, pas une citation). Document pédagogique.')}`);

// ─────────────────────────────────────────── les blocs de fiche partagés
// L'affectation : un menu par poste, la personne choisie. Ids `poste-ligne`…
export const blocsAffectation = (E) => POSTES.map((x) => ({ type: 'liste', id: `poste-${x.v}`, lib: x.lib, vide: 'Choisir qui…', manque: `qui tient le poste « ${x.lib} »`,
  choix: parNom(E).map((p) => ({ v: p.id, lib: `${p.nom} (${LIB_CACES(p)})` })) }));
export const jalonsAffectation = (get, { poids, groupe }) => POSTES.map((x) => ({ id: `poste-${x.v}`, titre: `Le poste « ${x.lib.split(' (')[0]} »`, groupe, poids,
  attendu: (db) => { const E = get(db); return E.find((p) => p.id === affectation(E)[x.v]).nom; }, juste: (v, db) => v[`poste-${x.v}`] === affectation(get(db))[x.v] }));
// La charge des kits.
export const blocsCharge = () => [
  { type: 'nombre', id: 'cinq', lib: 'Le nombre de 5008 dans la matinée', min: 0, manque: 'le nombre de 5008' },
  { type: 'nombre', id: 'minutes', lib: 'Le temps de préparation de tous les kits', unite: 'min', min: 0, manque: 'le temps de préparation' },
  { type: 'nombre', id: 'personnes', lib: 'Le nombre de personnes qu’il faut aux kits', min: 0, manque: 'le nombre de personnes' }];
export const jalonsCharge = (part, { cinq, minutes, personnes, groupe }) => { const P = (db) => (typeof part === 'function' ? part(db) : part); return [
  { id: 'cinq', titre: 'Le nombre de 5008', groupe, poids: cinq, attendu: (db) => `${VOITURES} × ${P(db)} % = ${charge(P(db)).n5}`, juste: (v, db) => proche(v.cinq, charge(P(db)).n5) },
  { id: 'minutes', titre: 'Le temps de préparation', groupe, poids: minutes,
    attendu: (db) => { const C = charge(P(db)); return `${C.n3} × ${String(MIN_3008).replace('.', ',')} + ${C.n5} × ${String(MIN_5008).replace('.', ',')} = ${String(C.minutes).replace('.', ',')} min`; },
    juste: (v, db) => proche(v.minutes, charge(P(db)).minutes, 0.11) },
  { id: 'personnes', titre: 'Le nombre de personnes aux kits', groupe, poids: personnes, attendu: (db) => `${charge(P(db)).personnes} (360 minutes par personne)`,
    juste: (v, db) => proche(v.personnes, charge(P(db)).personnes) }]; };

// ─────────────────────────────────────────── l'accueil de Théo, la consigne du jour, ses droits (ENT-13.10)
export const ACCUEIL_ETAPES = [
  { v: 'securite', lib: 'Les règles de sécurité du site : EPI, circulation des piétons et des chariots' },
  { v: 'equipe', lib: 'Présenter l’équipe et son tuteur pour la matinée' },
  { v: 'montrer', lib: 'Lui montrer le geste au poste des kits' },
  { v: 'faire', lib: 'Il prépare des kits sous l’œil de son tuteur' },
  { v: 'point', lib: 'Faire le point avec lui à la fin de la matinée' },
];
// L'ordre de départ : aucune étape à sa place (laisser tel quel ne rapporte rien).
const ACCUEIL_DEPART = ['point', 'securite', 'faire', 'equipe', 'montrer'];
export const blocAccueil = () => ({ type: 'ordre', id: 'accueil', titre: 'Dans l’ordre', consigne: 'De son arrivée à la fin de sa matinée.',
  choix: ACCUEIL_DEPART.map((x) => ACCUEIL_ETAPES.find((e) => e.v === x)) });
export const jalonsAccueil = ({ poids, groupe }) => ACCUEIL_ETAPES.map((e, k) => ({ id: `accueil-${k + 1}`, titre: `L’accueil : « ${e.lib.split(' :')[0]} » à sa place`,
  groupe, poids, attendu: `étape ${k + 1}`, juste: (v) => Array.isArray(v.accueil) && v.accueil[k] === e.v }));
export const CONSIGNE = [
  { v: 'postes', lib: 'Qui tient quel poste ce matin', juste: true },
  { v: 'tuteur', lib: 'Qui est le tuteur de Théo pour la matinée', juste: true },
  { v: 'securite', lib: 'Le rappel sécurité du jour (les piétons dans les allées marquées)', juste: true },
  { v: 'releve', lib: 'Ce que la relève de l’après-midi doit savoir', juste: true },
  { v: 'avis', lib: 'Ce que je pense du travail de chacun' },
  { v: 'salaire', lib: 'Le salaire de Théo' },
  { v: 'vie', lib: 'Pourquoi Karim est absent et ce qu’il fait le soir' },
];
export const blocConsigne = () => ({ type: 'cases', id: 'consigne', titre: 'Ce que tu écris dans la consigne affichée à l’équipe', choix: CONSIGNE.map(({ v, lib }) => ({ v, lib })) });
export const jalonConsigne = ({ poids, groupe }) => ({ id: 'consigne', titre: 'La consigne du jour', groupe, poids,
  attendu: CONSIGNE.filter((x) => x.juste).map((x) => x.lib).join(' ; '), juste: (v) => memes(v.consigne || [], CONSIGNE.filter((x) => x.juste).map((x) => x.v)) });
export const DROITS = [
  { v: 'formation', lib: 'Il reçoit une formation renforcée à la sécurité avant de prendre son poste', juste: true },
  { v: 'chariot', lib: 'Il ne conduit aucun chariot : il n’a ni CACES ni autorisation de conduite', juste: true },
  { v: 'epi', lib: 'Ses équipements de protection lui sont fournis : il ne les paie pas', juste: true },
  { v: 'cantine', lib: 'Il n’a pas accès à la cantine : elle est réservée aux salariés de l’usine' },
  { v: 'seul', lib: 'Il peut commencer seul : il apprendra sur le tas' },
  { v: 'montrer', lib: 'Il peut conduire le chariot si Julien lui montre comment faire' },
];
export const blocDroits = () => ({ type: 'cases', id: 'droits', titre: 'Théo, intérimaire, aujourd’hui : ce qui est vrai', choix: DROITS.map(({ v, lib }) => ({ v, lib })) });
export const jalonDroits = ({ poids, groupe }) => ({ id: 'droits', titre: 'Les droits de Théo', groupe, poids,
  attendu: DROITS.filter((x) => x.juste).map((x) => x.lib).join(' ; '), juste: (v) => memes(v.droits || [], DROITS.filter((x) => x.juste).map((x) => x.v)) });

// ─────────────────────────────────────────── le renfort, l'aménagement et le secret (ENT-13.11)
export const RENFORT = [
  { v: 'karim', lib: 'Je demande tout de suite un renfort formé aux kits à Karim, avec mon calcul' },
  { v: 'vite', lib: 'Je demande à Théo d’aller plus vite' },
  { v: 'quai', lib: 'J’enlève Sébastien du quai pour les kits : les camions attendront' },
  { v: 'rien', lib: 'Je ne change rien : on verra bien' },
];
export const AMENAGEMENT = [
  { v: 'garder', lib: 'Je garde Amel au bord de ligne : le médecin la dit apte au chariot de catégorie 3', juste: true },
  { v: 'chariot', lib: 'Les bacs de plus de 10 kg se déplacent au chariot, jamais à la main', juste: true },
  { v: 'renvoyer', lib: 'Je la renvoie chez elle tant qu’elle ne peut pas tout porter' },
  { v: 'porter', lib: 'Elle porte comme avant : elle fera attention' },
];
export const SECRET = [
  { v: 'amenage', lib: 'Je dis seulement que son poste est aménagé : le reste lui appartient' },
  { v: 'avis', lib: 'Je lui lis l’avis du médecin du travail' },
  { v: 'raconte', lib: 'Je lui explique ce qu’Amel a eu pendant son arrêt' },
];

// ─────────────────────────────────────────── la banque « Avant de commencer » (préparation : les postes ; droit : la loi)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('caces3', 'preparation', 'postes', 'Le CACES R489 de catégorie 3, c’est pour…', [{ v: 'frontal', lib: 'le chariot élévateur frontal' },
    { v: 'retractable', lib: 'le chariot à mât rétractable' }, { v: 'robot', lib: 'les robots du transstockeur' }], 'frontal', 'Catégorie 3 : chariot frontal ; catégorie 5 : mât rétractable.'),
  q('caces5', 'preparation', 'postes', 'Pour le stockage en hauteur, il faut…', [{ v: '5', lib: 'le CACES de catégorie 5' }, { v: '3', lib: 'le CACES de catégorie 3' },
    { v: 'rien', lib: 'aucun CACES' }], '5', 'Le chariot à mât rétractable demande la catégorie 5.'),
  q('premier', 'preparation', 'postes', 'Le premier poste qu’on affecte le matin, c’est…', [{ v: 'ligne', lib: 'le bord de ligne' }, { v: 'kits', lib: 'les kits' },
    { v: 'quai', lib: 'le quai' }], 'ligne', 'La ligne ne doit jamais manquer de pièces : on commence par le poste le plus exigeant.'),
  q('robots', 'preparation', 'postes', 'Les deux robots du transstockeur…', [{ v: 'seuls', lib: 'roulent seuls : personne ne leur est affecté' },
    { v: 'cariste', lib: 'ont chacun leur cariste' }, { v: 'arret', lib: 'sont à l’arrêt le matin' }], 'seuls', 'On n’affecte que des personnes, et chacune à un seul poste.'),
  q('autorisation', 'droit', 'postes', 'Pour conduire un chariot dans l’usine, il faut…', [{ v: 'deux', lib: 'le CACES et l’autorisation de conduite de l’employeur' },
    { v: 'permis', lib: 'le permis de conduire' }, { v: 'rien', lib: 'savoir conduire' }], 'deux', 'Code du travail, R4323-56 : l’employeur délivre une autorisation de conduite.'),
  q('renforcee', 'droit', 'accueil', 'Un intérimaire affecté à un poste à risque a droit…', [{ v: 'formation', lib: 'à une formation renforcée à la sécurité' },
    { v: 'rien', lib: 'à rien de plus que les autres' }, { v: 'prime', lib: 'à une prime de risque, à la place de la formation' }], 'formation',
  'Code du travail, L4154-2 : formation renforcée, accueil et information adaptés.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis « Les postes » et « L’accueil » à gauche, et réponds à mes questions.',
  documents: ['postes', 'accueil'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
export { memes };
