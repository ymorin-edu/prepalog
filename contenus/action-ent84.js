// ENT-8.4 — Action, « la semaine avant Noël » : le contenu de la séance (brief `docs/briefs/ENT-8.4-action-avant-noel.md` ; décisions du chef
// de chantier : `docs/briefs/COORDINATION-action.md` §6.3). CAP OL, ENTRAÎNEMENT de CAP-C1.2, avec une ERREUR INDUITE (le camion mal placé par
// Romain). Univers commun : `contenus/action.js` (lu, jamais modifié ici). Données pures (plan, équipe, grille, banques, phrases calculées) :
// `contenus/action-ent84-donnees.js`. Activité : `activites/action-avant-noel.js`. Questions : `contenus/questions/ENT-8.4.js`. Corrigé :
// `contenus/corriges/ENT-8.4.js`.
//
// Jeudi 17 décembre, 6 h (aucune année écrite). Deuxième PFMP de l'élève, chez GXO à l'entrepôt Action de Labastide-Saint-Pierre ; tuteur :
// Romain, chef d'équipe réception. UN ÉCRAN PAR ÉTAPE (§0 bis d'ENT-8.3) — le document à gauche de la fiche, la consigne en haut, l'écran
// suivant ouvert à l'envoi du précédent, la barre « Étape suivante » :
//   ① Repérer mon poste (plan dessiné, lieux TIRÉS) ; ② Qui fait quoi ? (tâches TIRÉES) ; ③a Le planigramme : une lecture TIRÉE (réponse
//   CALCULÉE sur la grille) et « Quel camion Romain a-t-il mal placé ? » ; ③b le planning des quais, la carte de Romain posée à sa place
//   fausse (`depart`), à déplacer ; ④ les documents du camion du Havre (deux questions TIRÉES, « Peut-on ouvrir ? », « Que fais-tu
//   d'abord ? ») ; ⑤ rendre compte à Romain par phrases, la ligne « nouveau créneau » CALCULÉE sur la pose envoyée.
// Rien n'est jugé à l'écran ; le bilan détaillé dit juste / à corriger par case.
//
// VÉRIFIÉ / CONSTRUIT : voir l'en-tête de `contenus/action-ent84-donnees.js` et `MENTION` plus bas. Les quatre documents du camion sont des
// RECONSTITUTIONS (fournisseur « Jouets Clairbois » et transporteur « Transports Estuaire-Garonne » : noms CONSTRUITS), avec le pied
// « Document pédagogique — reconstitution, non contractuel ». Les textes des messages, de la note du quai, des phrases et des retours sont ceux
// de Cowork (brief §4, §6.3), écrits tels quels (liste à relire à l'écran dans le compte rendu du brief).

import { apresFiche, apresPlanning, apresMail } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-8.4.js';
import { ENTREPRISE as ENT_ACTION, VOCAB as VOCAB_ACTION, LEXIQUE, STYLE_DOCUMENTS, PIED, ech, figure } from './action.js';
import {
  ID, ID_VOLET, PLANNING_ID, PHRASES_ID, FICHES, EQUIPE_84, EQUIPE_CHOIX, ECHELLE, QUAIS, CAMIONS, CARTE, GRILLE_ROMAIN, HAVRE, PARTENAIRE,
  LECTURES, TROUVE, PLAN_LABASTIDE, TIRAGE, lieuxDe, tachesDe, tachesBonus, lecturesTirees, lecturesBonus, documentsDe, commandeDe,
  melangerPour, tablePlanigramme, minQuai, nombre, ligneCreneau, poseDe, phraseJustePour, placeEnvoyee,
} from './action-ent84-donnees.js';

export { TIRAGE };
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ v: String(k), lib: `n° ${k}` }));

// L'entreprise de CETTE séance : l'entrepôt de Labastide, exploité par GXO (le reste de l'univers d'Action est commun).
export const ENTREPRISE = { ...ENT_ACTION, sousTitre: 'Entrepôt GXO de Labastide-Saint-Pierre (82) — commerce à petits prix', exercice: 'Bienvenue chez GXO' };
export const VOCAB = { ...VOCAB_ACTION, mailDomain: 'gxo-labastide.example' };
const mailDe = (id) => `${id}@${VOCAB.mailDomain}`;

// ─────────────────────────────────────────────────────────────── l'heure du scénario (jeudi 17 décembre, aucune année écrite)
// Le 17 décembre de l'année scolaire en cours (de septembre à décembre : cette année ; de janvier à août : l'année d'avant), comme ENT-8.2.
// Heure d'ouverture + temps réellement passé.
const anScolaire = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1; };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anScolaire(), 11, 17, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── lectures de la base
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeurDe = (db, id, bloc) => ((fiche(db, id) || {}).valeurs || {})[bloc];
const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
// Une fiche « déjà envoyée une fois » : vraie aussi pendant une correction (« Corriger » retire `envoye`, le geste reste rangé).
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
export const planningEnvoye = (db) => !!placeEnvoyee(db) || geste(db, `planning:${PLANNING_ID}:envoyer`);
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les documents
const PIED_84 = 'Document pédagogique — reconstitution, non contractuel.';
const FOURNISSEUR = 'Jouets Clairbois';                  // nom CONSTRUIT
const TRANSPORTEUR = 'Transports Estuaire-Garonne';      // nom CONSTRUIT
const ARTICLE = 'Jeu de construction en bois, boîte de 100 pièces';
const pied = PIED(`${PIED_84} Noms du fournisseur et du transporteur construits.`);

export const DOC_PLAN = { id: 'plan-labastide', titre: 'Plan de la réception de Labastide', court: 'Le plan',
  html: `<article class="ac-doc" aria-label="Plan de la réception">
    <p class="ac-t">Plan de la réception — GXO, Labastide-Saint-Pierre</p>
    <p class="ac-st">Vue de dessus. Les <b>ronds numérotés</b> : les lieux à trouver. Q1 à Q4 : les portes des quais.</p>
    ${PLAN_LABASTIDE}
    ${PIED('Plan construit pour l’exercice : ce n’est pas le vrai plan de l’entrepôt.')}
  </article>` };

// « L'équipe de la réception » : 4 cartes SANS visage (un pictogramme de métier et un prénom), dans l'ordre fixe de l'équipe.
const ICONES = {
  chef: '<rect x="10" y="7" width="28" height="36" rx="3"/><rect x="18" y="3" width="12" height="7" rx="2"/><path d="M15 19 H33 M15 26 H33 M15 33 H26"/>',
  cariste: '<path d="M8 36 V22 H26 V36 M10 22 V10 H22 L26 22"/><path d="M33 6 V40 M33 40 H45"/><circle cx="13" cy="38" r="4"/><circle cx="25" cy="38" r="4"/>',
  reception: '<rect x="7" y="18" width="34" height="24"/><path d="M7 18 L13 9 H35 L41 18 M24 18 V42"/><path d="M14 30 L19 35 L28 25"/>',
  admin: '<rect x="6" y="7" width="36" height="24" rx="2"/><path d="M20 31 V37 H28 V31"/><rect x="8" y="39" width="32" height="6" rx="1"/>',
};
const carteEquipe = (icone, nom, role) => `<div class="lb-carte"><svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONES[icone]}</svg>
    <div><p class="lb-nom">${nom}</p><p class="lb-role">${role}</p></div></div>`;
export const DOC_EQUIPE = { id: 'equipe-labastide', titre: 'L’équipe de la réception', court: 'L’équipe',
  html: `<article class="ac-doc" aria-label="L’équipe de la réception">
    <p class="ac-t">L’équipe de la réception</p>
    <p class="ac-st">Jeudi 17 décembre, équipe du matin</p>
    <div class="lb-equipe">
      ${carteEquipe('chef', 'Romain', 'chef d’équipe')}
      ${carteEquipe('cariste', 'Lucas', 'cariste')}
      ${carteEquipe('reception', 'Toi', 'réceptionnaire')}
      ${carteEquipe('admin', 'Inès', 'agent administratif')}
    </div>
    ${PIED('Romain, Lucas et Inès sont construits pour l’exercice.')}
  </article>` };

// Le planigramme de Romain : les camions prévus ET sa carte à sa place fausse, dans le même style (rien ne la signale).
export const docPlanigramme = (camions = GRILLE_ROMAIN) => `<article class="ac-doc" aria-label="Planigramme du jeudi 17 décembre">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Entrepôt Action — GXO, Labastide-Saint-Pierre · jeudi 17 décembre · préparé par Romain · une case = une demi-heure</p>
    ${tablePlanigramme(camions)}
    ${PIED(`${PIED_84} Camions et horaires construits pour l’exercice.`)}
  </article>`;
const docBonCommande = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Bon de commande">
    <p class="ac-gros">BON DE COMMANDE</p>
    <p class="ac-st">N° <b>${ech(C.numero)}</b></p>
    <dl class="ac-dl">
      <dt>Acheteur</dt><dd>Action (magasins à petits prix)</dd>
      <dt>Fournisseur</dt><dd>${FOURNISSEUR}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité commandée</dt><dd><b>${nombre(C.N)} cartons</b></dd>
      <dt>Livrer à</dt><dd>Entrepôt Action — GXO, Labastide-Saint-Pierre</dd>
      <dt>Livraison prévue</dt><dd>jeudi 17 décembre</dd>
    </dl>
    ${pied}
  </article>`; };
const docBonLivraison = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Bon de livraison">
    <p class="ac-gros">BON DE LIVRAISON</p>
    <p class="ac-st">N° <b>${ech(C.bl)}</b> · de ${FOURNISSEUR}</p>
    <dl class="ac-dl">
      <dt>Client</dt><dd>Action — entrepôt de Labastide-Saint-Pierre</dd>
      <dt>Votre commande</dt><dd>${ech(C.numero)}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité livrée</dt><dd><b>${nombre(C.livre)} cartons</b></dd>
    </dl>
    <p class="ac-st"><b>Réserves</b> (à écrire par le réceptionnaire)</p>
    <div class="ac-res" aria-label="Case réserves, vide"></div>
    <p class="ac-st">Signature du réceptionnaire :</p>
    <div class="ac-res" aria-label="Case signature, vide"></div>
    ${pied}
  </article>`; };
const docLettreVoiture = (db) => { const C = commandeDe(db);
  return `<article class="ac-doc" aria-label="Lettre de voiture">
    <p class="ac-gros">LETTRE DE VOITURE</p>
    <p class="ac-st">N° <b>${ech(C.lv)}</b> · transport par route</p>
    <dl class="ac-dl">
      <dt>Transporteur</dt><dd>${TRANSPORTEUR}</dd>
      <dt>Expéditeur</dt><dd>Hub d’import Action, Gonfreville-l’Orcher</dd>
      <dt>Destinataire</dt><dd>Entrepôt Action / GXO, Labastide-Saint-Pierre</dd>
      <dt>Marchandise</dt><dd>Jouets, ${C.palettes} palettes</dd>
      <dt>Date</dt><dd>jeudi 17 décembre</dd>
    </dl>
    ${pied}
  </article>`; };
// La note de Lucas (texte du brief §4, étape 4, tel quel).
export const NOTE_QUAI = ['Chaussures et gilet : OK.', 'Transpalette : chargé.', 'Bon de livraison : reçu du chauffeur.',
  'Devant la porte : 12 palettes de retours des magasins, pas encore rangées.'];
const docNoteQuai = `<article class="ac-doc" aria-label="Le quai 2 à 6 h 40">
    <p class="ac-gros">LE QUAI 2 À 6 H 40</p>
    <p class="ac-st">Ce que Lucas, cariste, a noté au quai avant l’arrivée du camion du Havre</p>
    <ul class="lb-note">${NOTE_QUAI.map((l) => `<li>${ech(l)}</li>`).join('')}</ul>
    <p class="lb-signe">Lucas</p>
    ${PIED(PIED_84)}
  </article>`;

// Pour « Avant de commencer » : le stage, et un planigramme VIDE (aucun camion de la séance).
const DOC_STAGE = { id: 'stage', titre: 'Ton stage à Labastide', court: 'Ton stage',
  html: `<article class="ac-doc" aria-label="Ton stage à Labastide">
    <p class="ac-t">Ton stage à la réception</p>
    <p class="ac-st">Jeudi 17 décembre, 6 h — la semaine avant Noël</p>
    <p>Tu es en stage (PFMP) chez <b>GXO</b>, à l’entrepôt Action de <b>Labastide-Saint-Pierre</b>. Aujourd’hui, tu es <b>réceptionnaire</b>.</p>
    <p>Ton [[tuteur]] : <b>Romain</b>, chef d’équipe. Avec toi : <b>Lucas</b>, cariste, et <b>Inès</b>, agent administratif.</p>
    ${figure('quai')}
    ${PIED('Romain, Lucas et Inès sont construits pour l’exercice.')}
  </article>` };
const DOC_PLANIGRAMME_VIDE = { id: 'planigramme-vide', titre: 'Un planigramme (vide)', court: 'Un planigramme',
  html: `<article class="ac-doc" aria-label="Un planigramme vide">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Exemple vide : chaque camion prévu prend une case à son quai, de son heure d’arrivée à son heure de départ.</p>
    ${tablePlanigramme([], { vide: true })}
    ${PIED('Document pédagogique — modèle construit pour l’exercice.')}
  </article>` };

// `documentsStyle` est imbriqué sous `.ent-doc` (CSS natif) : `&:has(…)` élargit la feuille (560 px) à toute la colonne pour le plan et le
// planigramme, comme le moteur le fait pour un document « dessin » (retour de classe du 16/10 : le plan d'ENT-8.2 était trop petit).
export const STYLE = `${STYLE_DOCUMENTS}
&:has(.lb-plan), &:has(.ac-pg){width:100%}
.ac-gros{margin:0 0 4px; font-size:1.45rem; font-weight:900; letter-spacing:.05em}
.ac-dl{display:grid; grid-template-columns:max-content 1fr; gap:5px 14px; margin:6px 0 12px; font-size:1rem}
.ac-dl dt{font-weight:700}
.ac-dl dd{margin:0}
.ac-tab{border-collapse:collapse; width:100%; margin:6px 0 10px; font-size:.78rem; table-layout:fixed}
.ac-tab th,.ac-tab td{border:1px solid #b9b3a6; padding:2px 3px; text-align:center; vertical-align:middle}
.ac-tab th.ac-q,.ac-tab col.ac-q{width:56px}
.ac-tab td.ac-pris{background:rgba(85,80,71,.16); line-height:1.12; font-size:.72rem; border:1.5px solid #555047}
.ac-tab td{height:40px}
.ac-res{border:1.5px solid #555047; min-height:40px; margin:2px 0 8px; border-radius:2px}
.lb-plan{display:block; width:100%; height:auto; margin:2px 0 4px}
.lb-plan text{font-family:inherit}
.lb-equipe{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:8px 0 12px}
.lb-carte{display:flex; gap:12px; align-items:center; border:1.5px solid #555047; border-radius:6px; padding:12px}
.lb-carte svg{flex:0 0 56px; width:56px; height:56px; color:#2b2824}
.lb-carte p{margin:0}
.lb-nom{font-size:1.15rem; font-weight:800}
.lb-role{font-size:.95rem; color:var(--douce)}
.lb-note{margin:6px 0 4px; padding:10px 14px 10px 30px; border:1.5px dashed #555047; border-radius:4px; font-size:1.05rem; line-height:1.6}
.lb-signe{margin:0 0 8px; text-align:right; font-style:italic}
`;
export const DOCUMENTS = [
  DOC_PLAN, DOC_EQUIPE,
  { id: 'planigramme-17', titre: 'Planigramme du jeudi 17 décembre', court: 'Planigramme', html: () => docPlanigramme() },
  { id: 'bon-commande', titre: 'Bon de commande', court: 'Bon de commande', html: docBonCommande },
  { id: 'bon-livraison', titre: 'Bon de livraison', court: 'Bon de livraison', html: docBonLivraison },
  { id: 'lettre-voiture', titre: 'Lettre de voiture', court: 'Lettre de voiture', html: docLettreVoiture },
  { id: 'note-quai', titre: 'Le quai 2 à 6 h 40', court: 'Le quai 2 à 6 h 40', html: docNoteQuai },
  DOC_STAGE, DOC_PLANIGRAMME_VIDE,
];

// ─────────────────────────────────────────────────────────────── ① Repérer mon poste
export const FICHE_REPERER = {
  id: FICHES.reperer, libelle: 'Repérer mon poste', titre: 'Repérer mon poste',
  sousTitre: 'Romain : « Sur le plan, trouve le numéro de chaque lieu. »',
  documents: ['plan-labastide'], largeurDocs: 1.6,
  bouton: 'Ouvrir la fiche « Repérer mon poste »',
  blocs: (db) => lieuxDe(db).map((p) => ({ type: 'liste', id: p.id, lib: p.nom, vide: 'n° ?', choix: NUMEROS, manque: `le numéro de « ${p.nom} »` })),
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va t’écrire.' },
};

// ─────────────────────────────────────────────────────────────── ② Qui fait quoi ?
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi ?',
  sousTitre: 'Romain : « Voici l’équipe d’aujourd’hui. Pour chaque tâche, choisis qui la fait. »',
  documents: ['equipe-labastide'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Qui fait quoi ? »',
  quand: dejaEnvoyee(FICHES.reperer),
  blocs: (db) => [...tachesDe(db), ...tachesBonus(db)].map((p) => ({ type: 'liste', id: p.id, lib: p.lib, vide: 'Choisir…', choix: EQUIPE_CHOIX,
    manque: `qui doit « ${p.lib.replace(/\.$/, '')} »` })),
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va t’écrire.' },
};

// ─────────────────────────────────────────────────────────────── ③a Le planigramme : lire et trouver l'erreur
export const FICHE_LIRE = {
  id: FICHES.lire, libelle: 'Le planigramme', titre: 'Le planigramme',
  sousTitre: 'Romain : « J’ai fait le planigramme trop vite. Je crois qu’un camion est mal placé. Lis-le et dis-moi lequel. »',
  documents: ['planigramme-17'], largeurDocs: 1.55,
  bouton: 'Ouvrir la fiche « Le planigramme »',
  quand: dejaEnvoyee(FICHES.qui),
  blocs: (db) => [
    ...[...lecturesTirees(db), ...lecturesBonus(db)].map((p) => { const L = LECTURES[p.id];
      return { type: 'liste', id: p.id, lib: L.q, vide: 'Choisir…', choix: L.choix, manque: 'une réponse' }; }),
    { type: 'liste', id: 'trouve', lib: 'Quel camion Romain a-t-il mal placé ?', vide: 'Choisir…', choix: TROUVE, manque: 'le camion mal placé' },
  ],
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va t’écrire.' },
};

// ─────────────────────────────────────────────────────────────── ③b Le planning des quais : replacer le camion de Romain
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning des quais', titre: 'Planning des quais — jeudi 17 décembre', date: 'Jeudi 17 décembre',
  infos: () => ['Romain : « Trouve-lui un créneau libre, avant midi. »',
    'Le camion de jeux de société reste <b>1 h 30</b> à quai. Un quai ne reçoit qu’un camion à la fois : les blocs gris pointillés sont déjà pris.'],
  echelle: { type: 'heures', debut: ECHELLE.debut, fin: ECHELLE.fin, pas: ECHELLE.pas },
  lignes: { titre: 'Quais de réception', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom,
    occupe: CAMIONS.filter((c) => c.quai === q.id).map((c) => ({ de: c.de, a: c.a, titre: c.court })) })) },
  cartes: { titre: 'Le camion de Romain',
    liste: [{ id: CARTE.id, titre: CARTE.titre, court: CARTE.court, famille: 'societe', des: CARTE.des, avant: CARTE.avant, depart: CARTE.depart }],
    details: () => [], duree: () => CARTE.duree, nonPosees: () => 'Le camion de jeux de société n’est pas posé.', legende: ' ' },
  familles: { societe: { couleur: '#8b5cf6', nom: 'violet', legende: 'jeux de société' } },
  regles: [
    { id: 'quai', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fenetre', type: 'fenetre', message: { debut: () => 'Le camion arrive trop tôt.', fin: () => 'Le camion repart après midi.' } },
  ],
  jalons: [{ id: 'replace', lib: 'Le camion sur un créneau libre, avant midi', regles: ['quai', 'fenetre'] }],
  aides: { consignes: { regles: 'Déplace le camion de jeux de société : glisse-le sur un quai, à une heure libre (ou clique-le, puis clique la case). Puis envoie le planning.' } },
};

// ─────────────────────────────────────────────────────────────── ④ Les documents du camion
export const CHOIX_DOCS = [{ v: 'commande', lib: 'le bon de commande' }, { v: 'livraison', lib: 'le bon de livraison' },
  { v: 'voiture', lib: 'la lettre de voiture' }, { v: 'facture', lib: 'la facture' }];
export const CHOIX_OUVRIR = [
  { v: 'encombre', lib: 'Non : le quai est encombré par les palettes de retours.', juste: true },
  { v: 'pret', lib: 'Oui, tout est prêt.' },
  { v: 'bl', lib: 'Non : il manque le bon de livraison.' },
  { v: 'epi', lib: 'Non : je n’ai pas mes EPI.' },
];
export const CHOIX_DABORD = [
  { v: 'degager', lib: 'Je fais dégager le quai et je préviens Romain.', juste: true },
  { v: 'ouvrir', lib: 'J’ouvre quand même et je pose les palettes du camion à côté.' },
  { v: 'chauffeur', lib: 'J’attends que le chauffeur range les retours.' },
  { v: 'vestiaire', lib: 'Je repars au vestiaire.' },
];
const vl = (L) => L.map((c) => ({ v: c.v, lib: c.lib }));
export const FICHE_DOCS = {
  id: FICHES.docs, libelle: 'Les documents du camion', titre: 'Les documents du camion',
  sousTitre: `Romain : « Le camion du Havre est au ${minQuai(HAVRE.quai)}. Voici ses documents et ce que Lucas a noté au quai. »`,
  documents: ['bon-commande', 'bon-livraison', 'lettre-voiture', 'note-quai'], largeurDocs: 1.15,
  bouton: 'Ouvrir la fiche « Les documents du camion »',
  quand: (db) => planningEnvoye(db) || envoyee(db, FICHES.docs),
  blocs: (db) => [
    { type: 'cadre', titre: 'Les documents', blocs: documentsDe(db).map((l) => ({ type: 'liste', id: l.id, lib: l.lib, vide: 'Choisir…',
      choix: melangerPour(db, 'documents', CHOIX_DOCS), manque: 'un document' })) },
    { type: 'cadre', titre: 'Avant d’ouvrir le camion', blocs: [
      { type: 'choix', id: 'ouvrir', lib: 'Peut-on ouvrir le camion maintenant ?', colonne: true, choix: vl(melangerPour(db, 'ouvrir', CHOIX_OUVRIR)), manque: 'peut-on ouvrir ?' },
      { type: 'choix', id: 'dabord', lib: 'Que fais-tu d’abord ?', colonne: true, choix: vl(melangerPour(db, 'dabord', CHOIX_DABORD)), manque: 'que fais-tu d’abord ?' },
    ] },
  ],
  envoi: { bouton: 'Envoyer la fiche à Romain', a: 'Romain', suite: 'Romain va t’écrire.' },
};

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte (phrases à choisir ; textes du brief §6.3)
export const PHRASE_CONFLIT = `Le camion de jeux de société était au ${minQuai(CARTE.depart.ligne)} en même temps que les ${PARTENAIRE.court.toLowerCase()}.`;
// La ligne « nouveau créneau » : calculée UNE FOIS, quand le mail entre dans la base (après l'envoi du planning), sur la pose envoyée.
export const phrasesCompteRendu = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salutation', choix: ['Bonjour Romain,', 'Salut mon pote,', 'Monsieur le directeur,'], juste: 0 },
  { id: 'conflit', choix: [PHRASE_CONFLIT, `Le camion de jeux de société était au ${minQuai(HAVRE.quai)} en même temps que le camion du Havre.`,
    'Il n’y avait aucun problème sur le planigramme.'], juste: 0 },
  { id: 'creneau', choix: (db) => ligneCreneau(placeEnvoyee(db)).choix, juste: (db) => ligneCreneau(placeEnvoyee(db)).juste },
  { id: 'fin', choix: [`Je reste à la réception. ${prenom}`, 'Bisous', 'À plus.'], juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages de Romain (au tu ; date du scénario)
const ROMAIN = { nom: EQUIPE_84.romain.nom, mail: mailDe('romain') };
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: tsScenario(o.heure || '06:00', { db: o.db, decalage: o.decalage || 0 }),
  from: ROMAIN.nom, fromMail: ROMAIN.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (prenom, n, db) => ({ mails: [mail(prenom, 'Bien reçu', 'Bien reçu, merci.\n\nRomain', { db, heure: '06:58' })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, 'La semaine avant Noël',
      `Bonjour ${prenom}. Aujourd’hui, c’est la semaine avant Noël : les magasins vendent beaucoup, les camions arrivent sans arrêt. `
        + 'Tu es à la réception avec moi. Je te donne les consignes, ensuite tu travailles seul et tu me [[rendre compte|rends compte]]. '
        + 'On commence par le plan.\n\nRomain', { extra: { ouvreFiche: FICHES.reperer } }),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.reperer]: merci, [FICHES.qui]: merci, [FICHES.lire]: merci, [PLANNING_ID]: merci, [FICHES.docs]: merci, [PHRASES_ID]: merci },
  declencheurs: [
    { id: 'equipe', quand: apresFiche(FICHES.reperer),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'L’équipe d’aujourd’hui', 'Voici l’équipe d’aujourd’hui. Pour chaque tâche, choisis qui la fait.\n\nRomain',
        { db, heure: '06:10', extra: { ouvreFiche: FICHES.qui } })] }) },
    { id: 'planigramme', quand: apresFiche(FICHES.qui),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le planigramme de ce matin',
        'J’ai fait le [[planigramme]] de ce matin hier soir, trop vite. Je crois qu’un camion est mal placé. Lis-le et dis-moi lequel.\n\nRomain',
        { db, heure: '06:15', extra: { ouvreFiche: FICHES.lire } })] }) },
    { id: 'planning', quand: apresFiche(FICHES.lire),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le camion de jeux de société',
        'Trouve-lui un [[créneau]] libre, avant midi. Il est sur le planning des quais.\n\nRomain', { db, heure: '06:20' })] }) },
    { id: 'documents', quand: apresPlanning(PLANNING_ID),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, 'Le planning des quais', 'Merci, je préviens le transporteur.\n\nRomain', { db, heure: '06:30' }),
        mail(prenom, 'Le camion du Havre',
          `Le camion du Havre est au ${minQuai(HAVRE.quai)}. Voici ses documents et ce que Lucas a noté au [[quai]].\n\nRomain`,
          { db, heure: '06:41', extra: { ouvreFiche: FICHES.docs } }),
      ] }) },
    { id: 'compte-rendu', quand: apresFiche(FICHES.docs),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Rends-moi compte',
        'Avant que je parte en réunion, [[rendre compte|rends-moi compte]] du planigramme : ce qui n’allait pas et ce que tu as fait.\n\n'
          + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nRomain',
        { db, heure: '06:50', extra: { phrases: phrasesCompteRendu(prenom) } })] }) },
    { id: 'fin', quand: apresMail({ a: ROMAIN.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}, c’est clair. Bon courage pour la journée, ça va être long !\n\nRomain`,
        { db, heure: '06:57' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids des blocs validés par Tristan le 15/10/2026, brief §5 ;
// partages internes : défauts du brief §11 n° 2 et 3, tranchés par le chef de chantier)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant l'envoi (fiches, planning, phrases) : l'inaction vaut 0, et le
// camion laissé à la place de Romain est faux (règle `quai` : il chevauche les produits ménagers).
export const GROUPES = { reperer: 'Repérer mon poste', qui: 'Qui fait quoi ?', planigramme: 'Le planigramme', docs: 'Les documents du camion',
  compte: 'Rendre compte' };
export const POIDS_TACHE = { facile: 0.75, moyen: 0.75, difficile: 1 };
const ECRAN = { reperer: `fiche:${FICHES.reperer}`, qui: `fiche:${FICHES.qui}`, lire: `fiche:${FICHES.lire}`, planning: `planning:${PLANNING_ID}`,
  docs: `fiche:${FICHES.docs}`, phrases: `phrases:${PHRASES_ID}` };
const juge = (db, ficheId, id, juste) => (!envoyee(db, ficheId) ? attente : valeurDe(db, ficheId, id) === juste ? ok : ko);
const bonus = (id, titre, ficheId, liste, juste) => ({ id, titre, bonus: true, ecran: `fiche:${ficheId}`,
  verifier(db) { const B = liste(db); if (!B.length) return null; if (!envoyee(db, ficheId)) return attente;
    return B.every((p) => valeurDe(db, ficheId, p.id) === juste(p)) ? ok : ko; } });
const ligneCR = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: ECRAN.phrases,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

// La ligne « nouveau créneau » (décision §6.3) : la phrase choisie au DERNIER envoi est comparée à la phrase recalculée sur la pose COURANTE
// (le planning envoyé, `v1`) ; si cette phrase n'est pas parmi les choix du mail (planning corrigé après le compte rendu), ou si le planning
// est en cours de correction, on juge sur la phrase juste du moment du compte rendu (rangée avec le mail).
export function creneauChoisi(db) {
  const mails = (db && db.mails) || [];
  const decl = mails.find((m) => m.folder === 'in' && m.phrases && m.phrases.id === PHRASES_ID);
  const L = decl && decl.phrases.lignes.find((l) => l.id === 'creneau');
  const envois = mails.filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID).sort((a, b) => (a.ts - b.ts) || (a.id - b.id));
  const dernier = envois[envois.length - 1];
  if (!L || !dernier) return null;
  const c = dernier.phrases.choix ? dernier.phrases.choix.creneau : undefined;
  const place = placeEnvoyee(db);
  const courante = place ? phraseJustePour(poseDe(place)) : null;
  const attendue = courante && L.choix.includes(courante) ? courante : L.choix[L.juste];
  return { choisi: Number.isInteger(c) ? L.choix[c] : null, attendue };
}
const jalonCreneau = { id: 'cr-creneau', titre: 'Le compte rendu : le nouveau créneau', groupe: GROUPES.compte, poids: 0.75, ecran: ECRAN.phrases,
  verifier(db) { const x = creneauChoisi(db); if (!x) return attente; return x.choisi != null && x.choisi === x.attendue ? ok : ko; } };

export const ETAPES = [
  ...[0, 1, 2, 3].map((k) => ({ id: `lieu-${k + 1}`, titre: `Repérer mon poste : la ligne ${k + 1}`, groupe: GROUPES.reperer, poids: 0.625, ecran: ECRAN.reperer,
    // Le bilan détaillé (CAP) : le NOM du lieu (l'ordre des lignes est tiré), jamais son numéro sur le plan.
    titreBilan: (db) => { const p = lieuxDe(db)[k]; return p ? `Repérer mon poste : ${p.nom.charAt(0).toLowerCase()}${p.nom.slice(1)}` : null; },
    verifier(db) { const p = lieuxDe(db)[k]; if (!p) throw new Error(`lieu n° ${k + 1} absent du tirage`); return juge(db, FICHES.reperer, p.id, String(p.n)); } })),
  ...['facile', 'moyen', 'difficile'].map((d) => ({ id: `tache-${d}`, titre: 'Qui fait quoi ? : une tâche', groupe: GROUPES.qui, poids: POIDS_TACHE[d], ecran: ECRAN.qui,
    titreBilan: (db) => { const p = tachesDe(db).find((x) => x.difficulte === d); return p ? `Qui fait quoi ? : ${p.lib.replace(/\.$/, '')}` : null; },
    verifier(db) { const p = tachesDe(db).find((x) => x.difficulte === d); if (!p) throw new Error(`tâche ${d} absente du tirage`); return juge(db, FICHES.qui, p.id, p.qui); } })),
  { id: 'lecture', titre: 'Le planigramme : la lecture', groupe: GROUPES.planigramme, poids: 1, ecran: ECRAN.lire,
    titreBilan: (db) => { const p = lecturesTirees(db)[0]; return p ? `Le planigramme : ${LECTURES[p.id].q.replace(/ \?$/, '')}` : null; },
    verifier(db) { const p = lecturesTirees(db)[0]; if (!p) throw new Error('lecture absente du tirage'); return juge(db, FICHES.lire, p.id, LECTURES[p.id].juste); } },
  { id: 'trouve', titre: 'Le planigramme : le camion mal placé', groupe: GROUPES.planigramme, poids: 1.5, ecran: ECRAN.lire,
    verifier: (db) => juge(db, FICHES.lire, 'trouve', CARTE.id) },
  ...etapesPlanning(PLANNING).map((e) => Object.assign(e, { titre: 'Le planigramme : le camion replacé sur un créneau libre, avant midi',
    groupe: GROUPES.planigramme, poids: 2, ecran: ECRAN.planning })),
  ...[0, 1].map((k) => ({ id: `doc-${k + 1}`, titre: `Les documents : la question ${k + 1}`, groupe: GROUPES.docs, poids: 1, ecran: ECRAN.docs,
    titreBilan: (db) => { const p = documentsDe(db)[k]; return p ? `Les documents : « ${p.lib} »` : null; },
    verifier(db) { const p = documentsDe(db)[k]; if (!p) throw new Error(`question de document n° ${k + 1} absente du tirage`); return juge(db, FICHES.docs, p.id, p.juste); } })),
  { id: 'ouvrir', titre: 'Les documents : peut-on ouvrir le camion ?', groupe: GROUPES.docs, poids: 1, ecran: ECRAN.docs,
    verifier: (db) => juge(db, FICHES.docs, 'ouvrir', CHOIX_OUVRIR.find((c) => c.juste).v) },
  { id: 'dabord', titre: 'Les documents : ce que tu fais d’abord', groupe: GROUPES.docs, poids: 1, ecran: ECRAN.docs,
    verifier: (db) => juge(db, FICHES.docs, 'dabord', CHOIX_DABORD.find((c) => c.juste).v) },
  ligneCR('cr-conflit', 'Le compte rendu : ce qui n’allait pas', ['conflit'], 0.75),
  jalonCreneau,
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation'], 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin'], 0.5),
  // Les cas bonus du confirmé (sans poids ni groupe, cachés à l'élève) : `null` chez qui ne les a pas reçus.
  bonus('bonus-tache', 'Qui fait quoi : une tâche de plus', FICHES.qui, tachesBonus, (p) => p.qui),
  bonus('bonus-lecture', 'Le planigramme : une lecture de plus', FICHES.lire, lecturesBonus, (p) => LECTURES[p.id].juste),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans, lexique, accueil, options
// L'ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste », CAP). L'étape 3 tient sur deux écrans (fiche, puis planning).
export const SUITE = [
  { vue: 'fiche', libelle: 'Repérer mon poste', fait: dejaEnvoyee(FICHES.reperer) },
  { vue: `fiche:${FICHES.qui}`, libelle: 'Qui fait quoi ?', fait: dejaEnvoyee(FICHES.qui) },
  { vue: `fiche:${FICHES.lire}`, libelle: 'Le planigramme : trouver l’erreur', fait: dejaEnvoyee(FICHES.lire) },
  { vue: 'planning', libelle: 'Le planigramme : replacer le camion', fait: planningEnvoye },
  { vue: `fiche:${FICHES.docs}`, libelle: 'Les documents du camion', fait: dejaEnvoyee(FICHES.docs) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte à Romain', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// Les mots du brief (§4, « Mots cliquables ») ; définitions neutres (CONSTRUITES pour les quatre nouvelles).
export const LEXIQUE_84 = {
  ...LEXIQUE,
  'zone de retours': 'Endroit de la réception où l’on dépose ce que les magasins renvoient (rolls, palettes, produits), avant de le trier.',
  'point de rassemblement': 'Endroit dehors, signalé par un panneau, où tout le monde se retrouve quand l’alarme sonne, pour être compté.',
  'local de charge': 'Local où l’on recharge les batteries des engins électriques (transpalettes, chariots).',
  'convention de stage': 'Contrat signé par le lycée, l’entreprise, l’élève (et ses parents s’il est mineur) : il fixe les dates, les horaires et les activités du stage.',
  cariste: 'Personne qui conduit un chariot élévateur pour charger, décharger et ranger les palettes.',
  CACES: 'Certificat qui prouve qu’on sait conduire un engin de manutention (un chariot élévateur, par exemple) en sécurité.',
};
export const MENTION = 'Réels : Action, GXO (qui fait tourner l’entrepôt de Labastide-Saint-Pierre pour Action), le hub d’import du Havre, la convention de stage '
  + '(PFMP). Construit : le plan de la réception, Romain, Lucas et Inès, le planigramme et ses camions, les documents et leurs noms d’entreprises, '
  + 'l’état du quai, les horaires.';
export const ACCUEIL = {
  titre: 'La semaine avant Noël',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Romain', 'Menu Messagerie.'],
    ['① Repérer mon poste', 'Trouve chaque lieu sur le plan.'],
    ['② Qui fait quoi ?', 'Pour chaque tâche, choisis qui la fait.'],
    ['③ Le planigramme', 'Lis-le, trouve le camion mal placé, puis replace-le sur le planning des quais.'],
    ['④ Les documents du camion', 'Dis à quoi sert chaque document, et si on peut ouvrir le camion.'],
    ['⑤ Rendre compte', 'Réponds à Romain, une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};
export const FIN_FIGE = 'Les questions de Romain se jouent au premier essai : elles ne se rejouent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 4 : la semaine avant Noël',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_84,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_REPERER, FICHE_QUI, FICHE_LIRE, FICHE_DOCS],
  planning: PLANNING,
  suite: SUITE,
  equipe: EQUIPE_84,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
  // Le planning des quais reste grisé au menu tant que la fiche « Le planigramme » n'est pas partie (l'élève trouve l'erreur avant de la voir).
  fermetures: { planning: { ouvertSi: (db) => dejaEnvoyee(FICHES.lire)(db), message: 'Après la fiche « Le planigramme »' } },
};
