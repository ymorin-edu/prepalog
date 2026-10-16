// ENT-8.6 — Action, évaluation « ma prise de poste dans un nouveau site » : le contenu de la séance (brief
// `docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md`, décisions du chef de chantier dans `docs/briefs/COORDINATION-action.md` §7). Univers
// commun : `contenus/action.js` (lu, jamais modifié ici). Les deux sites : `contenus/action-eval-sites.js` (partagé avec ENT-8.5, lu). Données
// pures : `contenus/action-ent86-donnees.js`. Activité : `activites/action-evaluation-prise-de-poste.js`. Questions :
// `contenus/questions/ENT-8.6.js`. Corrigé : `contenus/corriges/ENT-8.6.js`.
//
// Mardi 12 janvier, 6 h (aucune année écrite), le lendemain d’ENT-8.5, dans le MÊME site tiré (Onnaing / GXO, ou Belleville-en-Beaujolais /
// Kuehne+Nagel) ; le tuteur (Karim ou Sandrine) donne la mission puis part en réunion ; l’élève tient la réception seul. CAP OL, ÉVALUATION de
// CAP-C1.2, en copie rendue (`copie: true`) : rien ne remonte pendant le travail, une seule remise (bouton « Rendre ma copie » du bandeau),
// note figée ; aucun bilan, aucun « Corriger », aucun mot cliquable, rien à l’écran ne dit juste ou faux ; pastilles « fait ».
//   Avant de commencer (noté, 4 points, « Le droit » à gauche) → ① Repérer mon poste (plan d’ENT-8.4, numéros TIRÉS) → ② Qui fait quoi ?
//   → ③a Le planigramme : deux lectures tirées → ③b le Planning des quais : poser « Linge de maison — 1 h » (option `rendCopie: false` :
//   l’envoi du planning ne rend pas la copie) → ④ Les documents du camion (note du quai TIRÉE) → ⑤ rendre compte par phrases, jugées sur ce
//   que l’élève a fait et répondu (une erreur ne se paie qu’une fois) → Rendre ma copie.
//
// VÉRIFIÉ / CONSTRUIT (alerte 9) : voir l’en-tête de `contenus/action-ent86-donnees.js` et `MENTION` ci-dessous. « Le droit » : Code du
// travail L4111-5 et L4141-1 (recopiés de Légifrance le 15/10/2026, comme en ENT-8.2) ; convention-type nationale de PFMP (DGESCO, septembre
// 2023, éduscol), art. 8 et 10 : citations du brief d’ENT-8.4, vérifiées par Cowork sur le PDF le 16/10/2026, NON relues par Claude Code.

import { apresFiche, apresPlanning } from '../core/declencheurs.js';
import { etapesPlanning } from '../core/types/planning.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS, TUTEUR } from './questions/ENT-8.6.js';
import * as ACTION from './action.js';
import { PIED, ech, PHOTOS } from './action.js';
import { STYLE as STYLE_84 } from './action-ent84.js';
import { tablePlanigramme } from './action-ent84-donnees.js';
import {
  ID, ID_VOLET, PLANNING_ID, PHRASES_ID, FICHES, TIRAGE, ECHELLE, QUAIS, CAMIONS, CARTE, HAVRE, LECTURES, NUMEROS, CHOIX_OUVRIR, CHOIX_DOCS,
  siteEleve, equipeDe, choixEquipe, quiDe, planNumerote, planDe, numeroDe, lieuxDe, tachesDe, lecturesTirees, documentsDe, noteDe, commandeDe,
  melangerPour, choixDabord, nombresManque, nombre, minQuai, fiche, envoyee, planningEnvoye, placeEnvoyee, ligneCreneau, PHRASES_QUAI, justeQuai,
  choixManque, justeManque,
} from './action-ent86-donnees.js';

export { ID, ID_VOLET, PLANNING_ID, PHRASES_ID, FICHES, TIRAGE } from './action-ent86-donnees.js';

// ─────────────────────────────────────────────────────────────── l’entreprise de CETTE séance (le site est tiré : bandeau neutre)
export const ENTREPRISE = { ...ACTION.ENTREPRISE,
  sousTitre: 'Un nouvel entrepôt d’Action — commerce à petits prix', exercice: 'Évaluation : ma prise de poste dans un nouveau site' };
export const VOCAB = { ...ACTION.VOCAB, mailDomain: 'action-stage.example' };
export const EQUIPE_86 = { tuteur: TUTEUR };

// ─────────────────────────────────────────────────────────────── l’heure du scénario (mardi 12 janvier, aucune année écrite)
const anJanvier = () => { const d = new Date(); return d.getMonth() >= 8 ? d.getFullYear() + 1 : d.getFullYear(); };
export function tsScenario(hhmm, { db, decalage = 0 } = {}) {
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  const ecoule = ouvert ? Math.max(0, Date.now() - ouvert) : 0;
  return new Date(anJanvier(), 0, 12, h, mn).getTime() + ecoule + decalage * 60000;
}

// ─────────────────────────────────────────────────────────────── les documents
const PIED_RECO = 'Document pédagogique — reconstitution, non contractuel.';
const FOURNISSEUR = 'Jouets Clairbois';                  // nom CONSTRUIT (repris d’ENT-8.4)
const TRANSPORTEUR = 'Transports Estuaire-Seine';        // nom CONSTRUIT
const ARTICLE = 'Jeu de construction en bois, boîte de 100 pièces';
const piedDoc = PIED(`${PIED_RECO} Noms du fournisseur et du transporteur construits.`);
const destinataire = (S) => `Entrepôt Action / ${S.prestataire}, ${S.site}`;

const docPlan = (db) => { const S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Plan de la réception">
    <p class="ac-t">Plan de la réception de ${ech(S.site)} (plan imaginé pour l’exercice)</p>
    <p class="ac-st">Vue de dessus. Les <b>ronds numérotés</b> : les lieux à trouver. Q1 à Q4 : les portes des quais.</p>
    ${planNumerote(planDe(db))}
    ${PIED('Plan construit pour l’exercice : ce n’est pas le vrai plan de l’entrepôt.')}
  </article>`; };

// « L’équipe de la réception » : 4 cartes SANS visage (un pictogramme de métier et un prénom), dans l’ordre fixe de l’équipe (comme ENT-8.4).
const ICONES = {
  chef: '<rect x="10" y="7" width="28" height="36" rx="3"/><rect x="18" y="3" width="12" height="7" rx="2"/><path d="M15 19 H33 M15 26 H33 M15 33 H26"/>',
  cariste: '<path d="M8 36 V22 H26 V36 M10 22 V10 H22 L26 22"/><path d="M33 6 V40 M33 40 H45"/><circle cx="13" cy="38" r="4"/><circle cx="25" cy="38" r="4"/>',
  reception: '<rect x="7" y="18" width="34" height="24"/><path d="M7 18 L13 9 H35 L41 18 M24 18 V42"/><path d="M14 30 L19 35 L28 25"/>',
  admin: '<rect x="6" y="7" width="36" height="24" rx="2"/><path d="M20 31 V37 H28 V31"/><rect x="8" y="39" width="32" height="6" rx="1"/>',
};
const carteEquipe = (icone, nom, role) => `<div class="lb-carte"><svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICONES[icone]}</svg>
    <div><p class="lb-nom">${ech(nom)}</p><p class="lb-role">${ech(role)}</p></div></div>`;
const docEquipe = (db) => { const S = siteEleve(db), Q = equipeDe(S);
  return `<article class="ac-doc" aria-label="L’équipe de la réception">
    <p class="ac-t">L’équipe de la réception</p>
    <p class="ac-st">Mardi 12 janvier, équipe du matin</p>
    <div class="lb-equipe">
      ${carteEquipe('chef', Q.tuteur, Q.chef)}
      ${carteEquipe('cariste', Q.cariste, 'cariste')}
      ${carteEquipe('reception', 'Toi', 'réceptionnaire')}
      ${carteEquipe('admin', Q.agent, 'agent administratif')}
    </div>
    ${PIED(`${ech(Q.tuteur)}, ${ech(Q.cariste)} et ${ech(Q.agent)} sont construits pour l’exercice.`)}
  </article>`; };

// Le planigramme du mardi 12 janvier : les camions prévus (la carte « Linge de maison » n’y est pas encore).
const docPlanigramme = (db) => { const S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Planigramme du mardi 12 janvier">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Entrepôt Action — ${ech(S.prestataire)}, ${ech(S.site)} · mardi 12 janvier · une case = une demi-heure</p>
    ${tablePlanigramme(CAMIONS)}
    ${PIED(`${PIED_RECO} Camions et horaires construits pour l’exercice.`)}
  </article>`; };
const docBonCommande = (db) => { const C = commandeDe(db), S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Bon de commande">
    <p class="ac-gros">BON DE COMMANDE</p>
    <p class="ac-st">N° <b>${ech(C.numero)}</b></p>
    <dl class="ac-dl">
      <dt>Acheteur</dt><dd>Action (magasins à petits prix)</dd>
      <dt>Fournisseur</dt><dd>${FOURNISSEUR}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité commandée</dt><dd><b>${nombre(C.N)} cartons</b></dd>
      <dt>Livrer à</dt><dd>${ech(destinataire(S))}</dd>
      <dt>Livraison prévue</dt><dd>mardi 12 janvier</dd>
    </dl>
    ${piedDoc}
  </article>`; };
// Le bon de livraison est la copie envoyée par le fournisseur la veille : la note « bon de livraison » (le chauffeur ne l’a pas donné) reste
// cohérente avec ce document (décision du constructeur, compte rendu du brief).
const docBonLivraison = (db) => { const C = commandeDe(db), S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Bon de livraison">
    <p class="ac-gros">BON DE LIVRAISON</p>
    <p class="ac-st">N° <b>${ech(C.bl)}</b> · de ${FOURNISSEUR} · copie envoyée par le fournisseur la veille</p>
    <dl class="ac-dl">
      <dt>Client</dt><dd>${ech(destinataire(S))}</dd>
      <dt>Votre commande</dt><dd>${ech(C.numero)}</dd>
      <dt>Article</dt><dd>${ARTICLE}</dd>
      <dt>Quantité livrée</dt><dd><b>${nombre(C.livre)} cartons</b></dd>
    </dl>
    <p class="ac-st"><b>Réserves</b> (à écrire par le réceptionnaire)</p>
    <div class="ac-res" aria-label="Case réserves, vide"></div>
    ${piedDoc}
  </article>`; };
const docLettreVoiture = (db) => { const C = commandeDe(db), S = siteEleve(db);
  return `<article class="ac-doc" aria-label="Lettre de voiture">
    <p class="ac-gros">LETTRE DE VOITURE</p>
    <p class="ac-st">N° <b>${ech(C.lv)}</b> · transport par route</p>
    <dl class="ac-dl">
      <dt>Transporteur</dt><dd>${TRANSPORTEUR}</dd>
      <dt>Expéditeur</dt><dd>Hub d’import Action, Gonfreville-l’Orcher</dd>
      <dt>Destinataire</dt><dd>${ech(destinataire(S))}</dd>
      <dt>Marchandise</dt><dd>Jouets, ${C.palettes} palettes</dd>
      <dt>Date</dt><dd>mardi 12 janvier</dd>
    </dl>
    ${piedDoc}
  </article>`; };
// La note du quai : TIRÉE (brief §6 bis), écrite par le cariste du site.
const docNoteQuai = (db) => { const N = noteDe(db), Q = equipeDe(siteEleve(db));
  return `<article class="ac-doc" aria-label="Le quai 2 à 6 h 40">
    <p class="ac-gros">LE QUAI 2 À 6 H 40</p>
    <p class="ac-st">Ce que ${ech(Q.cariste)}, cariste, a noté au quai avant l’arrivée du camion du Havre</p>
    <ul class="lb-note">${N.lignes.map((l) => `<li>${ech(l)}</li>`).join('')}</ul>
    <p class="lb-signe">${ech(Q.cariste)}</p>
    ${PIED(PIED_RECO)}
  </article>`; };

// « Le droit » (lisible à gauche pendant « Avant de commencer », décision de Tristan pour ENT-7.4, option B) — sans le Code civil d’ENT-8.2.
const DOC_DROIT = { id: 'droit', titre: 'Le droit', court: 'Le droit',
  html: `<article class="ac-doc" aria-label="Le droit">
    <p class="ac-gros">LE DROIT</p>
    <p class="ac-st">Deux textes du Code du travail, deux articles de la convention de stage</p>
    <p><b>Code du travail, article L4111-5</b> (santé et sécurité au travail)</p>
    <p class="ac-cite">« Pour l’application de la présente partie, les travailleurs sont les salariés, y compris temporaires, et les stagiaires, ainsi que toute personne placée à quelque titre que ce soit sous l’autorité de l’employeur. »</p>
    <p><b>Code du travail, article L4141-1</b> (1er alinéa)</p>
    <p class="ac-cite">« L’employeur organise et dispense une information des travailleurs sur les risques pour la santé et la sécurité et les mesures prises pour y remédier. »</p>
    <p><b>Convention-type de stage (PFMP), article 8</b> (durée du travail)</p>
    <p class="ac-cite">« tous les élèves sont soumis à la durée hebdomadaire légale ou conventionnelle si celle-ci est inférieure à la durée légale »</p>
    <p><b>Convention-type de stage (PFMP), article 10</b> (élève mineur)</p>
    <p class="ac-cite">« La durée de travail de l’élève mineur ne peut excéder 8 heures par jour et 35 heures par semaine »</p>
    ${PIED('Textes réels : Code du travail recopié de Légifrance (consulté le 15/10/2026) ; convention-type nationale de PFMP, DGESCO, septembre 2023, éduscol (consultée le 16/10/2026).')}
  </article>` };
// « Avant de commencer » : le stage (site, date, équipe ; aucune réponse d’un jalon) et un planigramme VIDE.
const docStage = (db) => { const S = siteEleve(db), Q = equipeDe(S);
  return `<article class="ac-doc" aria-label="Ton stage">
    <p class="ac-t">Ton stage chez ${ech(S.prestataire)}</p>
    <p class="ac-st">Mardi 12 janvier, 6 h</p>
    <p>Tu es en stage (PFMP) chez <b>${ech(S.prestataire)}</b>, à l’entrepôt Action <b>${ech(S.deSite)}</b>. Ce matin, tu tiens le poste de <b>réception</b>.</p>
    <p>${ech(S.tuteur.mot.replace(/^t/, 'T'))} : <b>${ech(Q.tuteur)}</b>, ${ech(Q.chef)}. Avec toi : <b>${ech(Q.cariste)}</b> et <b>${ech(Q.agent)}</b>.</p>
    ${PIED(`${ech(Q.tuteur)}, ${ech(Q.cariste)} et ${ech(Q.agent)} sont construits pour l’exercice.`)}
  </article>`; };
const DOC_PLANIGRAMME_VIDE = { id: 'planigramme-vide', titre: 'Un planigramme (vide)', court: 'Un planigramme',
  html: `<article class="ac-doc" aria-label="Un planigramme vide">
    <p class="ac-gros">PLANIGRAMME DE RÉCEPTION</p>
    <p class="ac-st">Exemple vide : chaque camion prévu prend une case à son quai, de son heure d’arrivée à son heure de départ.</p>
    ${tablePlanigramme([], { vide: true })}
    ${PIED('Document pédagogique — modèle construit pour l’exercice.')}
  </article>` };

export const STYLE = `${STYLE_84}
.ac-cite{margin:2px 0 10px; padding:4px 10px; border-left:3px solid #555047; font-style:italic}
`;
export const DOCUMENTS = [
  { id: 'plan', titre: 'Plan de la réception', court: 'Le plan', html: docPlan },
  { id: 'equipe', titre: 'L’équipe de la réception', court: 'L’équipe', html: docEquipe },
  { id: 'planigramme-12', titre: 'Planigramme du mardi 12 janvier', court: 'Planigramme', html: docPlanigramme },
  { id: 'bon-commande', titre: 'Bon de commande', court: 'Bon de commande', html: docBonCommande },
  { id: 'bon-livraison', titre: 'Bon de livraison', court: 'Bon de livraison', html: docBonLivraison },
  { id: 'lettre-voiture', titre: 'Lettre de voiture', court: 'Lettre de voiture', html: docLettreVoiture },
  { id: 'note-quai', titre: 'Le quai 2 à 6 h 40', court: 'Le quai 2 à 6 h 40', html: docNoteQuai },
  { id: 'stage', titre: 'Ton stage', court: 'Ton stage', html: docStage },
  DOC_DROIT, DOC_PLANIGRAMME_VIDE,
];
export { PHOTOS };

// ─────────────────────────────────────────────────────────────── les fiches (consigne du tuteur dans la fiche ; toutes partent incomplètes)
// Les textes fixes du moteur (sous-titre, bouton d’envoi) ne connaissent pas le site : ils disent « ton tuteur ».
const ENVOI = { bouton: 'Envoyer la fiche à ton tuteur', a: 'ton tuteur', suite: 'Merci, c’est noté.', incomplet: true };
export const FICHE_REPERER = {
  id: FICHES.reperer, libelle: 'Repérer mon poste', titre: 'Repérer mon poste',
  sousTitre: 'Sur le plan, trouve le numéro de chaque lieu.',
  documents: ['plan'], largeurDocs: 1.6,
  bouton: 'Ouvrir la fiche « Repérer mon poste »',
  blocs: (db) => lieuxDe(db).map((p) => ({ type: 'liste', id: p.id, lib: p.nom, vide: 'n° ?', choix: NUMEROS, manque: `le numéro de « ${p.nom} »` })),
  envoi: ENVOI,
};
export const FICHE_QUI = {
  id: FICHES.qui, libelle: 'Qui fait quoi ?', titre: 'Qui fait quoi ?',
  sousTitre: 'Voici l’équipe de ce matin. Pour chaque tâche, choisis qui la fait.',
  documents: ['equipe'], largeurDocs: 1,
  bouton: 'Ouvrir la fiche « Qui fait quoi ? »',
  quand: (db) => envoyee(FICHES.reperer)(db) || envoyee(FICHES.qui)(db),
  blocs: (db) => { const C = choixEquipe(equipeDe(siteEleve(db)));
    return tachesDe(db).map((p) => ({ type: 'liste', id: p.id, lib: p.lib, vide: 'Choisir…', choix: C, manque: `qui doit « ${p.lib.replace(/\.$/, '')} »` })); },
  envoi: ENVOI,
};
export const FICHE_LIRE = {
  id: FICHES.lire, libelle: 'Le planigramme', titre: 'Le planigramme',
  sousTitre: 'Lis le planigramme de ce matin et réponds.',
  documents: ['planigramme-12'], largeurDocs: 1.55,
  bouton: 'Ouvrir la fiche « Le planigramme »',
  quand: (db) => envoyee(FICHES.qui)(db) || envoyee(FICHES.lire)(db),
  blocs: (db) => lecturesTirees(db).map((p) => { const L = LECTURES[p.id];
    return { type: 'liste', id: p.id, lib: L.q, vide: 'Choisir…', choix: L.choix, manque: 'une réponse' }; }),
  envoi: ENVOI,
};

// ─────────────────────────────────────────────────────────────── ③b le Planning des quais : poser le camion de linge de maison
// `rendCopie: false` (moteur, 16/10/2026) : en évaluation, l’envoi du planning fige la version SANS rendre la copie (d’autres écrans suivent).
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning des quais', titre: 'Planning des quais — mardi 12 janvier', date: 'Mardi 12 janvier',
  rendCopie: false,
  infos: () => ['Un fournisseur de linge de maison demande un créneau d’une heure, entre 9 h et midi.',
    'Le camion reste <b>1 h</b> à quai. Un quai ne reçoit qu’un camion à la fois : les blocs gris pointillés sont déjà pris.'],
  echelle: { type: 'heures', debut: ECHELLE.debut, fin: ECHELLE.fin, pas: ECHELLE.pas },
  lignes: { titre: 'Quais de réception', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom,
    occupe: CAMIONS.filter((c) => c.quai === q.id).map((c) => ({ de: c.de, a: c.a, titre: c.court })) })) },
  cartes: { titre: 'Le camion à placer',
    liste: [{ id: CARTE.id, titre: CARTE.titre, court: CARTE.court, famille: 'linge', des: CARTE.des, avant: CARTE.avant }],
    details: () => [], duree: () => CARTE.duree, nonPosees: () => 'Le camion de linge de maison n’est pas posé.', legende: ' ' },
  familles: { linge: { couleur: '#8b5cf6', nom: 'violet', legende: 'linge de maison' } },
  regles: [
    { id: 'quai', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fenetre', type: 'fenetre', message: { debut: () => 'Le camion arrive trop tôt.', fin: () => 'Le camion repart après midi.' } },
  ],
  jalons: [{ id: 'pose', lib: 'Le camion sur un créneau libre, entre 9 h et midi', regles: ['quai', 'fenetre'] }],
  aides: { consignes: { regles: 'Glisse le camion de linge de maison sur un quai, à une heure libre (ou clique-le, puis clique la case). Puis envoie le planning.' } },
};

// ─────────────────────────────────────────────────────────────── ④ Les documents du camion
export const FICHE_DOCS = {
  id: FICHES.docs, libelle: 'Les documents du camion', titre: 'Les documents du camion',
  sousTitre: `Le camion du Havre est au ${minQuai(HAVRE.quai)}. Lis ses documents et la note du quai.`,
  documents: ['bon-commande', 'bon-livraison', 'lettre-voiture', 'note-quai'], largeurDocs: 1.15,
  bouton: 'Ouvrir la fiche « Les documents du camion »',
  quand: (db) => planningEnvoye(db) || envoyee(FICHES.docs)(db),
  blocs: (db) => { const C = commandeDe(db), Q = equipeDe(siteEleve(db));
    return [
      { type: 'cadre', titre: 'Les documents', blocs: [
        ...documentsDe(db).map((l) => ({ type: 'liste', id: l.id, lib: l.lib, vide: 'Choisir…', choix: melangerPour(db, 'documents', CHOIX_DOCS), manque: 'un document' })),
        { type: 'liste', id: 'manque', lib: 'Combien de cartons manquent ?', vide: 'Choisir…', manque: 'combien de cartons manquent',
          choix: melangerPour(db, 'manque', nombresManque(C).map((x) => ({ v: String(x), lib: nombre(x) }))) },
      ] },
      { type: 'cadre', titre: 'Avant d’ouvrir le camion', blocs: [
        { type: 'choix', id: 'ouvrir', lib: 'Peut-on ouvrir le camion maintenant ?', colonne: true, choix: melangerPour(db, 'ouvrir', CHOIX_OUVRIR), manque: 'peut-on ouvrir ?' },
        { type: 'choix', id: 'dabord', lib: 'Que fais-tu d’abord ?', colonne: true, choix: melangerPour(db, 'dabord', choixDabord(Q.cariste)), manque: 'que fais-tu d’abord ?' },
      ] },
    ]; },
  envoi: ENVOI,
};

// ─────────────────────────────────────────────────────────────── ⑤ rendre compte (phrases à choisir ; textes du brief §6.3)
// Les lignes « le créneau », « le quai 2 » et « ce qui manque » sont calculées UNE FOIS, quand le mail entre dans la base (après l’envoi de
// la fiche des documents, donc après celui du planning) : la phrase juste est celle de ce que l’élève a POSÉ et RÉPONDU.
export const phrasesCompteRendu = (prenom, db) => { const Q = equipeDe(siteEleve(db));
  return { id: PHRASES_ID, melanger: true, lignes: [
    { id: 'salutation', choix: [`Bonjour ${Q.tuteur},`, 'Salut mon pote,', 'Madame, Monsieur le directeur,'], juste: 0 },
    { id: 'creneau', choix: (d) => ligneCreneau(placeEnvoyee(d)).choix, juste: (d) => ligneCreneau(placeEnvoyee(d)).juste },
    { id: 'quai', choix: PHRASES_QUAI, juste: (d) => justeQuai(d) },
    { id: 'manque', choix: (d) => choixManque(commandeDe(d)), juste: (d) => justeManque(d) },
    { id: 'fin', choix: [`Je reste à la réception. ${prenom}`, 'Bisous', 'À plus.'], juste: 0 },
  ] }; };

// ─────────────────────────────────────────────────────────────── les messages (au tu ; date du scénario ; jamais juste ni faux)
const mail = (prenom, db, subject, text, o = {}) => { const Q = equipeDe(siteEleve(db));
  const agent = o.de === 'agent';
  return { folder: 'in', ts: tsScenario(o.heure || '06:00', { db, decalage: o.decalage || 0 }),
    from: agent ? Q.agent : Q.tuteur, fromMail: agent ? Q.mailAgent : Q.mailTuteur, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) }; };
const signe = (db) => equipeDe(siteEleve(db)).tuteur;
const reponduAuTuteur = (db) => ((db && db.mails) || []).some((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID);

export const VOLET = {
  id: ID_VOLET,
  // L’accueil : texte du brief (§4), proposé par Cowork.
  semer: (prenom, db) => { const Q = equipeDe(siteEleve(db));
    return { mails: [mail(prenom, db, 'Ce matin, tu tiens la réception',
      `Bonjour ${prenom}. Aujourd’hui, tu tiens la réception seul ce matin. ${Q.cariste} est au quai, ${Q.agent} au bureau. `
        + `Moi, je suis en réunion jusqu’à 10 h : tu me rends compte par message.\n\n${Q.tuteur}`, { extra: { ouvreFiche: FICHES.reperer } })] }; },
  declencheurs: [
    { id: 'qui', quand: apresFiche(FICHES.reperer), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Qui fait quoi ?',
      `Merci, c’est noté. Maintenant, dis-moi qui fait quoi dans l’équipe.\n\n${signe(db)}`,
      { heure: '06:05', extra: { ouvreFiche: FICHES.qui } })] }) },
    { id: 'planigramme', quand: apresFiche(FICHES.qui), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Le planigramme',
      `Merci, c’est noté. Voici le planigramme de ce matin : lis-le et réponds à mes questions.\n\n${signe(db)}`,
      { heure: '06:10', extra: { ouvreFiche: FICHES.lire } })] }) },
    // Le message de l’agent administratif : texte du brief (§4, étape 3b).
    { id: 'planning', quand: apresFiche(FICHES.lire), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Un créneau à placer',
      `Un fournisseur de linge de maison demande un créneau d’une heure, entre 9 h et midi. Place-le, s’il te plaît.\n\n${equipeDe(siteEleve(db)).agent}`,
      { heure: '06:15', de: 'agent' })] }) },
    // Après l’envoi du planning : texte du brief (§4, étape 4).
    { id: 'documents', quand: apresPlanning(PLANNING_ID), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Le camion du Havre',
      `Le camion du Havre est au ${minQuai(HAVRE.quai)}. Voici ses documents et ce que ${equipeDe(siteEleve(db)).cariste} a noté au quai.\n\n${signe(db)}`,
      { heure: '06:41', extra: { ouvreFiche: FICHES.docs } })] }) },
    // Le compte rendu : texte du brief (§4, étape 5) et la consigne des phrases (comme ENT-8.4).
    { id: 'compte-rendu', quand: apresFiche(FICHES.docs), semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Rends-moi compte',
      'Rends-moi compte avant 10 h : le camion de linge de maison, le quai 2, et ce qui manque.\n\n'
        + `Clique sur « Répondre » et choisis une phrase par ligne.\n\n${signe(db)}`,
      { heure: '06:50', extra: { phrases: phrasesCompteRendu(prenom, db) } })] }) },
    // La fin : texte du brief (§4, étape 5), neutre.
    { id: 'fin', quand: reponduAuTuteur, semer: (prenom, db) => ({ mails: [mail(prenom, db, 'Merci',
      `Merci ${prenom}, je regarde à mon retour.\n\n${signe(db)}`, { heure: '06:57' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de l’ouverture = 20)
// Poids du brief §5 (décidés par Cowork sur délégation de Tristan, repris tels quels par le chef de chantier) : Repérer mon poste 2,5 (0,625
// × 4, jugés contre la PERMUTATION de l’élève) · Qui fait quoi ? 2,5 (0,75 · 0,75 · 1) · Le planigramme 4 (deux lectures 1 + 1, le camion
// posé selon les règles 2) · Les documents du camion 4 (deux « quel document » 0,75 + 0,75, combien manquent 1, peut-on ouvrir 1, que
// fais-tu 0,5 — jugés contre la note TIRÉE) · Rendre compte 3 (le créneau 1, le quai 2 0,5, ce qui manque 0,5, salutation 0,5, fin 0,5 —
// jugés contre ce que l’élève a posé et répondu). Rien n’est vrai avant l’envoi : l’inaction vaut 0.
export const GROUPES = { reperer: 'Repérer mon poste', qui: 'Qui fait quoi ?', planigramme: 'Le planigramme', docs: 'Les documents du camion',
  compte: 'Rendre compte' };
export const POIDS_TACHE = { facile: 0.75, moyen: 0.75, difficile: 1 };
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const ECRAN = { reperer: `fiche:${FICHES.reperer}`, qui: `fiche:${FICHES.qui}`, lire: `fiche:${FICHES.lire}`, planning: `planning:${PLANNING_ID}`,
  docs: `fiche:${FICHES.docs}`, phrases: `phrases:${PHRASES_ID}` };
const juge = (db, ficheId, id, juste) => { const f = fiche(db, ficheId); return !f.envoye ? attente : f.valeurs[id] === juste ? ok : ko; };
const ligneCR = (id, titre, ligne, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: ECRAN.phrases,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes(ligne) ? ok : ko; } });

export const ETAPES = [
  ...[0, 1, 2, 3].map((k) => ({ id: `lieu-${k + 1}`, titre: `Repérer mon poste : la ligne ${k + 1}`, groupe: GROUPES.reperer, poids: 0.625, ecran: ECRAN.reperer,
    titreBilan: (db) => { const p = lieuxDe(db)[k]; return p ? `Repérer mon poste : ${p.nom.charAt(0).toLowerCase()}${p.nom.slice(1)}` : null; },
    verifier(db) { const p = lieuxDe(db)[k]; if (!p) throw new Error(`lieu n° ${k + 1} absent du tirage`); return juge(db, FICHES.reperer, p.id, numeroDe(db, p)); } })),
  ...['facile', 'moyen', 'difficile'].map((d) => ({ id: `tache-${d}`, titre: 'Qui fait quoi ? : une tâche', groupe: GROUPES.qui, poids: POIDS_TACHE[d], ecran: ECRAN.qui,
    titreBilan: (db) => { const p = tachesDe(db).find((x) => x.difficulte === d); return p ? `Qui fait quoi ? : ${p.lib.replace(/\.$/, '')}` : null; },
    verifier(db) { const p = tachesDe(db).find((x) => x.difficulte === d); if (!p) throw new Error(`tâche ${d} absente du tirage`); return juge(db, FICHES.qui, p.id, quiDe(p)); } })),
  ...['facile', 'moyen'].map((d) => ({ id: `lecture-${d}`, titre: 'Le planigramme : une lecture', groupe: GROUPES.planigramme, poids: 1, ecran: ECRAN.lire,
    titreBilan: (db) => { const p = lecturesTirees(db).find((x) => x.difficulte === d); return p ? `Le planigramme : ${LECTURES[p.id].q.replace(/ \?$/, '')}` : null; },
    verifier(db) { const p = lecturesTirees(db).find((x) => x.difficulte === d); if (!p) throw new Error(`lecture ${d} absente du tirage`); return juge(db, FICHES.lire, p.id, LECTURES[p.id].juste); } })),
  ...etapesPlanning(PLANNING).map((e) => Object.assign(e, { titre: 'Le planigramme : le camion posé sur un créneau libre, entre 9 h et midi',
    groupe: GROUPES.planigramme, poids: 2, ecran: ECRAN.planning })),
  ...[0, 1].map((k) => ({ id: `doc-${k + 1}`, titre: `Les documents : la question ${k + 1}`, groupe: GROUPES.docs, poids: 0.75, ecran: ECRAN.docs,
    titreBilan: (db) => { const p = documentsDe(db)[k]; return p ? `Les documents : « ${p.lib} »` : null; },
    verifier(db) { const p = documentsDe(db)[k]; if (!p) throw new Error(`question de document n° ${k + 1} absente du tirage`); return juge(db, FICHES.docs, p.id, p.juste); } })),
  { id: 'manque', titre: 'Les documents : combien de cartons manquent', groupe: GROUPES.docs, poids: 1, ecran: ECRAN.docs,
    verifier: (db) => juge(db, FICHES.docs, 'manque', String(commandeDe(db).k)) },
  { id: 'ouvrir', titre: 'Les documents : peut-on ouvrir le camion ?', groupe: GROUPES.docs, poids: 1, ecran: ECRAN.docs,
    verifier: (db) => juge(db, FICHES.docs, 'ouvrir', noteDe(db).ouvrir) },
  { id: 'dabord', titre: 'Les documents : ce que tu fais d’abord', groupe: GROUPES.docs, poids: 0.5, ecran: ECRAN.docs,
    verifier: (db) => juge(db, FICHES.docs, 'dabord', noteDe(db).dabord) },
  ligneCR('cr-creneau', 'Le compte rendu : le créneau posé', 'creneau', 1),
  ligneCR('cr-quai', 'Le compte rendu : le quai 2', 'quai', 0.5),
  ligneCR('cr-manque', 'Le compte rendu : ce qui manque', 'manque', 0.5),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', 'salutation', 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', 'fin', 0.5),
];

// ─────────────────────────────────────────────────────────────── pastilles, ordre des écrans, accueil, options
export const PASTILLES = [
  { libelle: 'Repérer mon poste', fait: envoyee(FICHES.reperer) },
  { libelle: 'Qui fait quoi ?', fait: envoyee(FICHES.qui) },
  { libelle: 'Le planigramme', fait: envoyee(FICHES.lire) },
  { libelle: 'Planning des quais', fait: planningEnvoye },
  { libelle: 'Les documents du camion', fait: envoyee(FICHES.docs) },
  { libelle: 'Rendre compte', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// L’ordre des écrans de travail (menu « Mon poste » ; le moteur ne montre pas la barre « Étape suivante » en évaluation).
export const SUITE = [
  { vue: 'fiche', libelle: 'Repérer mon poste', fait: envoyee(FICHES.reperer) },
  { vue: `fiche:${FICHES.qui}`, libelle: 'Qui fait quoi ?', fait: envoyee(FICHES.qui) },
  { vue: `fiche:${FICHES.lire}`, libelle: 'Le planigramme : lire', fait: envoyee(FICHES.lire) },
  { vue: 'planning', libelle: 'Le planigramme : poser le camion', fait: planningEnvoye },
  { vue: `fiche:${FICHES.docs}`, libelle: 'Les documents du camion', fait: envoyee(FICHES.docs) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Rendre compte', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const MENTION = 'Réels : Action ; GXO, qui fait tourner l’entrepôt Action d’Onnaing ; Kuehne+Nagel, qui fait tourner celui de '
  + 'Belleville-en-Beaujolais ; le hub d’import du Havre ; la convention de stage (PFMP). Construit : le plan de la réception (le même dessin '
  + 'qu’à Labastide, numéros changés), ton tuteur ou ta tutrice et tes collègues, le planigramme et ses camions, les documents et leurs noms '
  + 'd’entreprises, l’état du quai, les horaires.';
export const ACCUEIL = {
  titre: 'Évaluation : ma prise de poste dans un nouveau site',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de ton tuteur', 'Menu Messagerie.'],
    ['① Repérer mon poste', 'Trouve chaque lieu sur le plan.'],
    ['② Qui fait quoi ?', 'Pour chaque tâche, choisis qui la fait.'],
    ['③ Le planigramme', 'Lis-le, puis place le camion de linge de maison sur le planning des quais.'],
    ['④ Les documents du camion', 'Dis ce que dit chaque document, ce qui manque, et si on peut ouvrir le camion.'],
    ['⑤ Rendre compte', 'Réponds à ton tuteur, une phrase par ligne.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION],
  ],
};
// Le planning des quais reste grisé au menu tant que la fiche « Le planigramme » n’est pas partie (un écran par étape).
export const FERMETURES = {
  planning: { ouvertSi: envoyee(FICHES.lire), message: 'Après la fiche « Le planigramme »' },
};
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'Évaluation : ma prise de poste dans un nouveau site',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  equipe: EQUIPE_86,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_REPERER, FICHE_QUI, FICHE_LIRE, FICHE_DOCS],
  planning: PLANNING,
  fermetures: FERMETURES,
  pastilles: PASTILLES,
};
