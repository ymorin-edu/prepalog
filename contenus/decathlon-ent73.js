// ENT-7.3 — Decathlon, « la barge ne passe plus » : le contenu de la séance (brief `docs/briefs/ENT-7.3-decathlon-la-barge-ne-passe-plus.md`).
// Données pures (conteneur, offres, tirage, attendus) : `contenus/decathlon-ent73-donnees.js`. Univers commun : `contenus/decathlon.js`.
// Activité : `activites/decathlon-barge-arretee.js`. Questions : `contenus/questions/ENT-7.3.js`. Corrigé : `contenus/corriges/ENT-7.3.js`.
//
// Lundi 1er février 2027, 8 h : un nouveau conteneur est disponible à Anvers. L'élève, alternant au service transport amont de Rouvignies,
// en ENTRAÎNEMENT AVEC ALÉA de C2.6 :
//   ① COMMANDER comme d'habitude (non noté) : comparateur n° 1 → Claire tranche (la barge de Contargo, option A du brief) → ordre n° 1 →
//      courriel à Contargo → confirmation ;
//   ② L'IMPRÉVU : dès qu'un ordre n° 1 est parti chez un prestataire, Contargo écrit que l'Escaut est arrêté (avarie à l'écluse de Kain) ;
//   ③ RECHOISIR : comparateur n° 2 (la barge ne tient plus la date ; RailCo, hors liste, est moins cher et moins émetteur : l'erreur induite) ;
//   ④ COMMANDER ET ANNULER : ordre n° 2 (« annule et remplace »), courriel au nouveau prestataire, PUIS annulation à Contargo ;
//   ⑤ PRÉVENIR LE QUAI : appel à Mehdi, le chef de quai.
// Rien n'est jugé à l'écran ; les messages (Claire, prestataires, chef de quai) reprennent ce que l'élève a écrit, sans le corriger.
//
// VÉRIFIÉ / CONSTRUIT : voir MENTION (et l'en-tête de `contenus/decathlon.js`). Vérifié : l'Escaut a été fermé cinq semaines en 2024 pour la
// maintenance des écluses (communiqué Contargo du 04/02/2025, brief §2). Construit : l'avarie de l'écluse de Kain (cause, dates), tous les messages
// de Contargo, toutes les offres, RailCo Express. Code civil art. 1218 et 1231-1 : lus sur Légifrance le 15/10/2026 pour la structure (page 1218 :
// définition, empêchement temporaire, empêchement définitif ; 1231-1 : dommages et intérêts sauf force majeure) ; le MOT À MOT recopié ci-dessous
// vient de la connaissance du texte et n'a pas pu être recopié depuis Légifrance (l'outil de lecture ne restitue pas le texte intégral) : SUPPOSÉ,
// à relire sur Légifrance. Art. 1366 : même statut qu'en ENT-7.2.

import { apresFiche, apresGeste, dialogueFini } from '../core/declencheurs.js';
import { courrielsEnvoyes } from '../core/types/courriel.js';
import { jalonDialogue, reprises, leurresAppeles } from '../core/types/dialogue.js';
import { QUESTIONS } from './questions/ENT-7.3.js';
import { CARTE, EQUIPE, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, DOC_LISTE, DOC_DROIT, PIED, PRESTATAIRES, nomLieu, quand, kg, euros, ech } from './decathlon.js';
import {
  ID, ID_VOLET, SCENARIO, DESTINATION, CMP1, CMP2, OT1, OT2, DIALOGUE, ALEA, B, COL, BO, DISPO, LIMITE, BUDGET, CRITERES, CRITERE_JUSTE, ARRET, COMMANDE,
  OT_1, OT_2, FICHIER_1, FICHIER_2, PRESTAS, TYPES, LIEUX_ENL, LIEUX_LIV, BONNES, INSTRUCTIONS,
  jeuEleve, fiche, tri, lireNombre, lireHeure, sansEspaces, caseDe, casePrix, caseCO2, prenomDe, aleaDeclenche, numeroEcrit,
} from './decathlon-ent73-donnees.js';
import { hasard } from '../core/tirage.js';

export { ID, TIRAGE } from './decathlon-ent73-donnees.js';

const nrm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const compact = (s) => nrm(s).replace(/\s/g, '');
const LETTRES = ['a', 'b', 'c', 'd', 'e'];
const idDevis = (i) => `devis-${LETTRES[i]}`;
const libOffre = (o) => `${o.lettre} — ${o.nom}`;
const PRESTA_MAIL = ['routiers', 'contargo', 'rail'];

// ─────────────────────────────────────────────────────────────── les documents
const docCahier = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Cahier des charges">
    <div class="dk-entete"><b>DECATHLON</b><span>Entrepôt de Rouvignies · transport amont<br>Réf. ${ech(J.reference)}</span></div>
    <p class="dk-t">[[cahier des charges|Cahier des charges]] — acheminement d’un [[conteneur]]</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd class="dk-mono">${ech(J.conteneur)}</dd><dt></dt><dd>[[40 pieds high cube|40’ HC]], poids brut ${kg(J.poids)}</dd>
      <dt>Contenu</dt><dd>Collection printemps : chaussures de randonnée (fabriquées au Vietnam)</dd>
      <dt>Situation</dt><dd>[[dédouané|Dédouané]] à Anvers. [[mise à disposition|Disponible]] au terminal d’Anvers le ${quand(DISPO.iso, DISPO.h, { long: true })}.</dd>
      <dt>Destination</dt><dd>Entrepôt Decathlon de Rouvignies (59), quai de réception, sur rendez-vous</dd>
      <dt>Arrivée au quai</dt><dd><b>Au plus tard le ${quand(LIMITE.iso, LIMITE.h, { long: true })}</b> : la collection est mise en rayon dans les magasins ensuite.</dd>
      <dt>Budget</dt><dd><b>${euros(BUDGET)} HT</b> au maximum, tout compris (transport, manutention, camion final)</dd>
      <dt>Prestataire</dt><dd>Obligatoirement un [[prestataire référencé]] (liste du transport amont)</dd>
      <dt>Critère de choix</dt><dd>Parmi les offres qui tiennent la date et le budget, retenir <b>celle qui émet le moins de CO₂</b> (engagement de Decathlon :
        −20 % d’émissions du transport en 2026)</dd>
      <dt>Information CO₂</dt><dd>Chaque [[devis]] indique le CO₂ de la prestation, même pour un transport parti de l’étranger.</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Dates, budget et références construits.')}
  </article>`;
};

const docAvis = (db) => {
  const J = jeuEleve(db);
  return `<article class="dk-doc" aria-label="Avis de mise à disposition">
    <div class="dk-entete"><b>Port d’Anvers — terminal à conteneurs</b><span>Deurganckdok<br>Avis n° AV-2702-${String(J.valeurs.scelle).replace(/\D/g, '').slice(-4)}</span></div>
    <p class="dk-t">Avis de [[mise à disposition]]</p>
    <p class="dk-st">Destinataire : Decathlon — entrepôt de Rouvignies (réf. ${ech(J.reference)})</p>
    <dl class="dk-dl">
      <dt>Conteneur</dt><dd class="dk-mono">${ech(J.conteneur)}</dd>
      <dt>Type</dt><dd>40 pieds high cube (40’ HC)</dd>
      <dt>[[scellé|Scellé]]</dt><dd class="dk-mono">${ech(J.scelle)}</dd>
      <dt>Poids brut vérifié</dt><dd>${kg(J.poids)}</dd>
      <dt>Marchandise</dt><dd>Chaussures de randonnée, non dangereuses, à température ambiante</dd>
      <dt>Douane</dt><dd>Dédouané à Anvers</dd>
      <dt>Référence Decathlon</dt><dd class="dk-mono">${ech(J.reference)}</dd>
      <dt>Disponible</dt><dd>à partir du ${quand(DISPO.iso, DISPO.h, { long: true })}, au terminal</dd>
    </dl>
    ${PIED('Document reconstitué — document pédagogique Prepalog. Numéros et dates construits.')}
  </article>`;
};

// Un devis (un par offre, dans l'ordre de l'élève). La ligne « Information CO₂ » encadrée.
const PIED_CONTARGO = 'Devis reconstitué — document pédagogique Prepalog. Prix, dates et CO₂ construits ; Contargo assure réellement la ligne Anvers ↔ Valenciennes.';
const PIED_FICTIF = 'Devis reconstitué — document pédagogique Prepalog. Prestataire fictif ; prix, dates et CO₂ construits.';
function devisHtml(o) {
  if (!o) return '<article class="dk-doc"><p class="dk-st">Pas de devis à cette place.</p></article>';
  const km = o.troncons.map((s) => `${s.type === 'camion' ? 'camion' : s.type} ${s.km} km`).join(' + ');
  const qui = o.prestataire === 'barge' ? `${ech(o.nom.replace(/ \(.*\)$/, ''))} — ${ech(PRESTATAIRES.barge.service)}` : ech(o.nom.replace(/ \(.*\)$/, ''));
  return `<article class="dk-doc" aria-label="Devis ${ech(o.devis)}">
    <div class="dk-entete"><b>${qui}</b><span>${ech(o.ville || 'Transport — Benelux et nord de la France')}<br>${ech(o.mail)}</span></div>
    <p class="dk-t">[[devis|DEVIS]] n° ${ech(o.devis)} pour Decathlon</p>
    <p class="dk-st">Entrepôt de Rouvignies · devis du lundi 01/02/2027</p>
    <dl class="dk-dl">
      <dt>Trajet</dt><dd>${ech(nomLieu('anvers'))} → ${ech(nomLieu(DESTINATION))}</dd>
      <dt>Mode</dt><dd>${ech(o.modeLib)}</dd>
      <dt>Déroulé</dt><dd>${o.deroule.map(ech).join('<br>')}</dd>
      <dt>Arrivée au quai</dt><dd><b>${quand(o.arrivee.iso, o.arrivee.h, { long: true })}</b></dd>
      <dt>Prix total HT</dt><dd><b>${euros(o.prix)}</b></dd>
    </dl>
    <p class="dk-co2"><span class="dk-gros">[[information CO₂|Information CO₂]] de la prestation : ${kg(o.co2)} de CO₂</span><br>
      <small>Calcul selon la méthode du Code des transports, sur ${km}.</small></p>
    ${PIED(o.prestataire === 'barge' ? PIED_CONTARGO : PIED_FICTIF)}
  </article>`;
}

// ── les documents de « Avant de commencer » (lus, jamais notés)
const DOC_FAIT = { id: 'fait', titre: 'L’Escaut, une voie d’eau qui peut s’arrêter', court: 'L’Escaut et ses arrêts',
  html: `<article class="dk-doc" aria-label="L’Escaut et ses arrêts">
    <p class="dk-t">L’Escaut, une voie d’eau qui peut s’arrêter</p>
    <p class="dk-st">Ce que tu dois savoir avant de commencer</p>
    <ul class="dk-ul">
      <li>L’<b>Escaut</b> est le fleuve que suivent les barges entre Anvers et Valenciennes, et donc jusqu’à Rouvignies.</li>
      <li>Il passe par plusieurs <b>écluses</b>. Si l’une d’elles est fermée, aucune barge ne passe : c’est un <b>[[arrêt de navigation]]</b>.</li>
      <li>En <b>2024</b>, l’Escaut a été fermé <b>cinq semaines</b> pour la maintenance des écluses (communiqué de Contargo du 04/02/2025).</li>
      <li>VNF (Voies navigables de France) publie chaque année des <b>avis à la batellerie</b> : ils annoncent à l’avance les arrêts <b>programmés</b>
        des voies d’eau. Une <b>avarie</b>, elle, ne s’annonce pas.</li>
    </ul>
    ${PIED('Faits réels : communiqué Contargo du 04/02/2025 ; VNF (avis à la batellerie, mécanisme général). Document pédagogique Prepalog.')}
  </article>` };

const DOC_ECLUSE = { id: 'ecluse', titre: 'Une écluse, comment ça marche', court: 'Une écluse',
  html: `<article class="dk-doc" aria-label="Une écluse">
    <p class="dk-t">Une [[écluse]], comment ça marche</p>
    <p class="dk-st">Quand un fleuve descend, il change de niveau : les bateaux passent par un sas</p>
    <ul class="dk-ul">
      <li>La barge entre dans le sas, par les portes d’<b>amont</b> (le côté le plus haut).</li>
      <li>Les portes se ferment. On <b>fait descendre l’eau</b> (ou monter, dans l’autre sens) jusqu’au niveau de l’autre côté.</li>
      <li>Les portes d’<b>aval</b> s’ouvrent : la barge repart, de l’autre côté de la marche d’eau.</li>
      <li>Une barge ne peut pas contourner une écluse : si le sas est en panne, la voie d’eau est coupée à cet endroit.</li>
    </ul>
    ${PIED('Explication pédagogique Prepalog (texte seul).')}
  </article>` };

const DOC_CONFIRMATION = { id: 'confirmation', titre: 'Exemple : la confirmation écrite d’un prestataire', court: 'Une confirmation écrite',
  html: `<article class="dk-doc" aria-label="Une confirmation écrite">
    <p class="dk-t">Exemple : un message de confirmation d’un prestataire</p>
    <p class="dk-st">Reçu par courriel, après l’envoi d’un ordre de transport</p>
    <p class="dk-cite">Bonjour,<br><br>nous avons reçu votre ordre de transport OT-2027-0099 pour le conteneur PRPU 123456 7. Enlèvement confirmé : départ de la barge
      jeudi 28/01 au soir, livraison à votre quai lundi 01/02 vers 9 h.<br><br>Service réservations, Contargo</p>
    <p>Ce message est la <b>confirmation écrite</b> : le prestataire y dit ce qu’il fera, et quand.</p>
    ${PIED('Message reconstitué — document pédagogique Prepalog. Numéros et dates construits.')}
  </article>` };

const DOC_FORCE_MAJEURE = { id: 'forcemajeure', titre: 'Le droit : la force majeure', court: 'Le droit (force majeure)',
  html: `<article class="dk-doc" aria-label="Le droit : la force majeure">
    <p class="dk-t">La [[force majeure]]</p>
    <p class="dk-st">Code civil, article 1218</p>
    <p class="dk-cite">« Il y a force majeure en matière contractuelle lorsqu’un événement échappant au contrôle du débiteur, qui ne pouvait être raisonnablement prévu
      lors de la conclusion du contrat et dont les effets ne peuvent être évités par des mesures appropriées, empêche l’exécution de son obligation.</p>
    <p class="dk-cite">Si l’empêchement est temporaire, l’exécution de l’obligation est suspendue à moins que le retard qui en résulterait ne justifie la résolution du
      contrat. Si l’empêchement est définitif, le contrat est résolu de plein droit et les parties sont libérées de leurs obligations dans les conditions prévues aux
      articles 1351 et 1351-1. »</p>
    <p>En clair : un événement que personne n’a pu <b>prévoir</b> au moment du contrat et qu’on ne peut pas <b>éviter</b> libère celui qui ne peut plus faire ce qu’il avait promis.</p>
    ${PIED('Texte réel — source : Code civil, art. 1218 (Légifrance, version en vigueur depuis le 01/10/2016).')}
  </article>` };

const DOC_ECRIT = { id: 'ecrit', titre: 'Le droit : l’écrit électronique', court: 'Le droit (écrit)',
  html: `<article class="dk-doc" aria-label="Le droit : l’écrit électronique">
    <p class="dk-t">L’écrit électronique comme preuve</p>
    <p class="dk-st">Code civil, article 1366</p>
    <p class="dk-cite">« L’écrit électronique a la même force probante que l’écrit sur support papier, sous réserve que puisse être dûment identifiée la personne
      dont il émane et qu’il soit établi et conservé dans des conditions de nature à en garantir l’intégrité. »</p>
    <p>Un courriel est un écrit électronique : il garde la trace de ce qu’on a demandé, à qui, et quand.</p>
    <p class="dk-pied">Texte réel — source : Code civil, art. 1366 (lu sur un site qui le cite le 14/10/2026 ; à relire sur Légifrance).</p>
  </article>` };

const DOC_RESPONSABILITE = { id: 'responsabilite', titre: 'Le droit : ne pas exécuter un contrat', court: 'Le droit (inexécution)',
  html: `<article class="dk-doc" aria-label="Le droit : ne pas exécuter un contrat">
    <p class="dk-t">Quand un contrat n’est pas exécuté</p>
    <p class="dk-st">Code civil, article 1231-1</p>
    <p class="dk-cite">« Le débiteur est condamné, s’il y a lieu, au paiement de dommages et intérêts soit à raison de l’inexécution de l’obligation, soit à raison du
      retard dans l’exécution, s’il ne justifie pas que l’exécution a été empêchée par la force majeure. »</p>
    <p>En clair : celui qui ne fait pas ce qu’il avait promis doit <b>réparer le dommage</b> qu’il cause, sauf s’il prouve qu’une force majeure l’en a empêché.</p>
    ${PIED('Texte réel — source : Code civil, art. 1231-1 (Légifrance, version en vigueur depuis le 01/10/2016).')}
  </article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.dk-mono{font-family:ui-monospace,Consolas,'Courier New',monospace; letter-spacing:.05em; font-weight:700}
`;
export const DOCUMENTS = [
  { id: 'avis', titre: 'Avis de mise à disposition', court: 'Avis de mise à disposition', html: docAvis },
  { id: 'cahier', titre: 'Cahier des charges', court: 'Cahier des charges', html: docCahier },
  DOC_LISTE,
  ...LETTRES.map((l, i) => ({ id: idDevis(i), titre: `Devis ${l.toUpperCase()}`, court: `Devis ${l.toUpperCase()}`, html: (db) => devisHtml(jeuEleve(db).offres[i]) })),
  DOC_FAIT, DOC_ECLUSE, DOC_CONFIRMATION, DOC_FORCE_MAJEURE, DOC_ECRIT, DOC_RESPONSABILITE, DOC_DROIT,
];
// Les devis de l'élève (autant que d'offres reçues : 4 au socle, 5 pour un confirmé).
export const devisDe = (db) => jeuEleve(db).offres.map((o, i) => idDevis(i));

// ─────────────────────────────────────────────────────────────── les comparateurs d'offres (n° 1 : échauffement ; n° 2 : après l'imprévu)
// La feuille ③ : un bloc CONSTANT par fiche (la feuille garde son état dans l'objet), ses lignes calculées sur le jeu de l'élève.
export function lignesOffres(db) {
  const J = jeuEleve(db);
  const saisie = (attendu) => ({ saisie: true, attendu, tolerance: 0, placeholder: ' ' });
  return [
    { A: 'Devis', B: 'Prix total (€ HT)', C: 'CO₂ (kg)', entete: true },
    ...J.offres.map((o) => ({ A: libOffre(o), B: saisie(o.prix), C: saisie(o.co2) })),
  ];
}
const blocOffres = (titre) => ({ type: 'grille', id: B.offres, titre, lignes: lignesOffres, manque: 'des cases du tableau ({n})',
  feuille: { colonnes: ['A', 'B', 'C'], decimales: 0, largeurs: { A: '52%', B: '24%', C: '24%' } } });
const blocTri = (titre) => (db) => {
  const J = jeuEleve(db);
  return { type: 'ouinon', id: B.tri, titre, entete: 'Devis', manque: 'le tri des offres ({n} case(s))',
    lignes: J.offres.map((o) => ({ id: o.slot, lib: libOffre(o) })),
    colonnes: [{ id: COL.liste, lib: 'Dans la liste référencée ?' }, { id: COL.date, lib: 'Tient la date ?' }] };
};

// Les phrases de justification (ordre tiré par élève, recalculé de la graine, rien n'est rangé).
const JUSTIFS_1 = [
  { v: 'co2', lib: 'Les offres restantes tiennent toutes la date ; je retiens celle qui émet le moins de CO₂.' },
  { v: 'prix', lib: 'Je retiens l’offre la moins chère, pour respecter le budget.' },
  { v: 'tot', lib: 'Je retiens l’offre qui arrive le plus tôt, pour avoir de la marge.' },
];
export const JUSTIFS_2 = [
  { v: 'date-co2', lib: 'La barge ne tient plus la date ; parmi les offres référencées qui la tiennent, je retiens celle qui émet le moins.' },
  { v: 'cher', lib: 'Je retiens l’offre la moins chère et la moins émettrice.' },
  { v: 'attendre', lib: 'J’attends la réouverture de l’Escaut.' },
];
export const JUSTIF_JUSTE_2 = 'date-co2';
const melangees = (L, cle) => (db) => {
  const g = db && db.tirages && db.tirages[ID] && db.tirages[ID].graine;
  return g ? hasard(`${g}|${cle}`).melanger(L) : L;
};
const decision = (titre, justifs) => (db) => {
  const J = jeuEleve(db);
  return { type: 'cadre', titre, blocs: [
    { type: 'liste', id: B.retenue, lib: 'Je retiens', vide: 'Choisir une offre…', choix: J.offres.map((o) => ({ v: o.slot, lib: libOffre(o) })), manque: 'l’offre retenue' },
    { type: 'choix', id: B.justif, lib: 'Ma justification', colonne: true, choix: justifs(db), manque: 'ta justification' },
  ] };
};

const BLOC_OFFRES_1 = blocOffres('③ Comparer : reporte le prix et le CO₂ de chaque devis');
const BLOC_OFFRES_2 = blocOffres('② Comparer : reporte le prix et le CO₂ de chaque devis');

export const FICHE_CMP1 = {
  id: CMP1, libelle: 'Comparateur d’offres', titre: 'Comparateur d’offres',
  sousTitre: 'Les documents à gauche : le cahier des charges, la liste référencée, un devis par offre.',
  documents: (db) => ['cahier', 'liste', ...devisDe(db)],
  largeurDocs: 0.9, serree: true, defile: true,
  bouton: 'Ouvrir le comparateur d’offres',
  blocs: (db) => [
    { type: 'cadre', titre: '① Le besoin', blocs: [
      { type: 'date', id: B.limite, lib: 'Arrivée au quai au plus tard le', manque: 'la date limite' },
      { type: 'heure', id: B.heure, lib: 'à (heure)', manque: 'l’heure limite' },
      { type: 'nombre', id: B.budget, lib: 'Budget maximum', unite: '€ HT', min: 0, entier: true, manque: 'le budget' },
      { type: 'liste', id: B.critere, lib: 'Pour départager les offres qui tiennent la date', vide: 'Choisir…', choix: CRITERES, manque: 'le critère' },
    ] },
    blocTri('② Trier les offres')(db),
    BLOC_OFFRES_1,
    decision('④ Ma décision', melangees(JUSTIFS_1, 'justif73a'))(db),
  ],
  envoi: { bouton: 'Envoyer mon choix à Claire', a: 'Claire', suite: 'Claire te répond dans la Messagerie.' },
};

export const FICHE_CMP2 = {
  id: CMP2, libelle: 'Nouveau comparateur', titre: 'Comparateur d’offres, une fois l’imprévu connu',
  sousTitre: 'Les mêmes devis qu’au départ : lis-les avec ce qui s’est passé depuis.',
  documents: (db) => ['cahier', 'liste', ...devisDe(db)],
  largeurDocs: 0.9, serree: true, defile: true,
  quand: aleaDeclenche,
  bouton: 'Ouvrir le nouveau comparateur',
  blocs: (db) => [
    blocTri('① Trier les offres')(db),
    BLOC_OFFRES_2,
    decision('③ Mon nouveau choix', melangees(JUSTIFS_2, 'justif73b'))(db),
  ],
  envoi: { bouton: 'Envoyer mon nouveau choix à Claire', a: 'Claire', suite: 'Claire te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les ordres de transport (fiches enregistrées)
const saisie = (type, id, lib, manque, o = {}) => ({ type, id, lib, manque, ...o });
const libDe = (L, v) => (L.find((x) => x.v === v) || {}).lib || '';
const instructions = () => ({ type: 'cadre', titre: 'Instructions', large: true, blocs: [{ type: 'cases', id: BO.inst, choix: INSTRUCTIONS.map((x) => ({ v: x.v, lib: x.lib })) }] });
const ENTETE = '<b>Donneur d’ordre :</b> Decathlon, entrepôt de Rouvignies — service transport amont.';

export const FICHE_OT1 = {
  id: OT1, libelle: 'Ordre de transport', titre: `Ordre de transport ${OT_1}`,
  sousTitre: 'Les documents à gauche : l’avis du terminal, le cahier des charges, le devis retenu.',
  entete: ENTETE,
  documents: (db) => ['avis', 'cahier', ...(jeuEleve(db).offres.map((o, i) => (o.slot === 'barge' ? idDevis(i) : null)).filter(Boolean))],
  quand: apresFiche(CMP1),
  largeurDocs: 0.9, serree: true, grille: true, defile: true,
  pied: 'Document reconstitué — document pédagogique Prepalog.',
  bouton: 'Ouvrir l’ordre de transport',
  blocs: () => [
    { type: 'cadre', titre: 'Prestataire', blocs: [{ type: 'liste', id: BO.presta, lib: 'Transporteur', vide: 'Choisir…', choix: PRESTAS, manque: 'le transporteur' }] },
    { type: 'cadre', titre: 'Le conteneur', blocs: [
      saisie('texte', BO.cont, 'N° de conteneur', 'le n° de conteneur'),
      { type: 'liste', id: BO.type, lib: 'Type', vide: 'Choisir…', choix: TYPES, manque: 'le type du conteneur' },
      saisie('texte', BO.scelle, 'N° de scellé', 'le n° de scellé'),
      saisie('nombre', BO.poids, 'Poids brut', 'le poids brut', { unite: 'kg' }),
    ] },
    { type: 'cadre', titre: 'Enlèvement et livraison', large: true, blocs: [
      { type: 'liste', id: BO.enl, lib: 'Lieu d’enlèvement', vide: 'Choisir…', choix: LIEUX_ENL, manque: 'le lieu d’enlèvement' },
      saisie('date', BO.dispo, 'Disponible à partir du', 'la date de mise à disposition'),
      saisie('texte', BO.ref, 'Référence Decathlon', 'la référence Decathlon'),
      { type: 'liste', id: BO.liv, lib: 'Lieu de livraison', vide: 'Choisir…', choix: LIEUX_LIV, manque: 'le lieu de livraison' },
      saisie('date', BO.limd, 'Arrivée au quai au plus tard le', 'la date limite d’arrivée'),
      saisie('heure', BO.limh, 'à (heure)', 'l’heure limite d’arrivée'),
    ] },
    instructions(),
  ],
  envoi: { enregistrer: true, nomPiece: FICHIER_1, bouton: 'Enregistrer l’ordre de transport', suite: 'Il est prêt à être joint à un courriel.' },
};

// L'ordre n° 2 « annule et remplace » le n° 1 : les cases du conteneur reprennent ce que l'élève a écrit dans le n° 1 et ne se modifient plus
// (une erreur ne se paie qu'une fois). Le type est un `texte` figé : `fige` n'existe pas pour une `liste`.
export const FICHE_OT2 = {
  id: OT2, libelle: 'Nouvel ordre de transport', titre: `Ordre de transport ${OT_2}`,
  sousTitre: 'Les documents à gauche : l’avis du terminal, le cahier des charges, la liste référencée et les devis.',
  entete: `${ENTETE}<br><b>Cet ordre annule et remplace l’ordre ${OT_1}.</b>`,
  documents: (db) => ['avis', 'cahier', 'liste', ...devisDe(db)],
  quand: (db) => !!(db && db.fiches && db.fiches[CMP2] && db.fiches[CMP2].envoye),
  largeurDocs: 0.9, serree: true, grille: true, defile: true,
  pied: 'Document reconstitué — document pédagogique Prepalog.',
  bouton: 'Ouvrir le nouvel ordre de transport',
  blocs: (db) => {
    const v = fiche(db, OT1).v;
    const repris = (x) => (x == null ? '' : String(x));
    return [
      { type: 'cadre', titre: 'Prestataire', blocs: [{ type: 'liste', id: BO.presta, lib: 'Transporteur', vide: 'Choisir…', choix: PRESTAS, manque: 'le transporteur' }] },
      { type: 'cadre', titre: 'Le conteneur (repris de l’ordre n° 1)', blocs: [
        saisie('texte', BO.cont, 'N° de conteneur', 'le n° de conteneur', { valeur: repris(v[BO.cont]), fige: true }),
        saisie('texte', BO.type, 'Type', 'le type du conteneur', { valeur: libDe(TYPES, v[BO.type]), fige: true }),
        saisie('texte', BO.scelle, 'N° de scellé', 'le n° de scellé', { valeur: repris(v[BO.scelle]), fige: true }),
        saisie('nombre', BO.poids, 'Poids brut', 'le poids brut', { unite: 'kg', valeur: repris(v[BO.poids]), fige: true }),
      ] },
      { type: 'cadre', titre: 'Enlèvement et livraison', large: true, blocs: [
        { type: 'liste', id: BO.enl, lib: 'Lieu d’enlèvement', vide: 'Choisir…', choix: LIEUX_ENL, manque: 'le lieu d’enlèvement' },
        saisie('date', BO.dispo, 'Disponible à partir du', 'la date de mise à disposition', { valeur: repris(v[BO.dispo]), fige: true }),
        saisie('texte', BO.ref, 'Référence Decathlon', 'la référence Decathlon', { valeur: repris(v[BO.ref]), fige: true }),
        { type: 'liste', id: BO.liv, lib: 'Lieu de livraison', vide: 'Choisir…', choix: LIEUX_LIV, manque: 'le lieu de livraison' },
        saisie('date', BO.limd, 'Arrivée au quai au plus tard le', 'la date limite d’arrivée'),
        saisie('heure', BO.limh, 'à (heure)', 'l’heure limite d’arrivée'),
      ] },
      instructions(),
    ];
  },
  envoi: { enregistrer: true, nomPiece: FICHIER_2, bouton: 'Enregistrer l’ordre de transport', suite: 'Il est prêt à être joint à un courriel.' },
};

// ─────────────────────────────────────────────────────────────── le courriel aux prestataires
export const CARNET = [
  { id: 'routiers', nom: PRESTATAIRES.route.nom, mail: PRESTATAIRES.route.mail, role: 'transporteur routier' },
  { id: 'contargo', nom: PRESTATAIRES.barge.nom, mail: PRESTATAIRES.barge.mail, role: 'barge · service réservations' },
  { id: 'rail', nom: PRESTATAIRES.rail.nom, mail: PRESTATAIRES.rail.mail, role: 'transport ferroviaire' },
  { id: 'quai', nom: 'Quai de réception Rouvignies', mail: mailDe('quai'), role: 'entrepôt Decathlon' },
  { id: 'claire', nom: EQUIPE.claire.nom, mail: mailDe('claire'), role: 'transport amont' },
];
// Ce que chaque prestataire annonce (construit), pour tout ordre qu'on lui envoie. Les confirmations ne disent jamais si l'ordre est le bon.
const HORAIRES = {
  contargo: { texte: `Enlèvement confirmé : départ de la barge mercredi 03/02 au soir, livraison à votre quai vendredi 05/02 vers 9 h. Référence de commande : ${COMMANDE}.`,
    signature: 'Service réservations, Contargo' },
  routiers: { texte: 'Enlèvement confirmé : départ du camion mercredi 10/02 au matin, livraison à votre quai mercredi 10/02 vers 11 h.', signature: 'Affrètement, Routiers du Hainaut' },
  rail: { texte: 'Enlèvement confirmé : départ du train jeudi 04/02 d’Anvers, terminal de Dourges vendredi 05/02, livraison à votre quai vendredi 05/02 vers 15 h.',
    signature: 'Service commandes, Rail Flandres-Artois' },
};
// La réponse reprend le n° ÉCRIT DANS L'ORDRE DE L'ÉLÈVE (jamais celui de l'avis) et ne corrige rien.
export function reponse(c, db) {
  if (!PRESTA_MAIL.includes(c.a)) return null;
  const H = HORAIRES[c.a];
  const texteC = nrm(`${c.objet} ${c.corps}`);
  // Contargo, une fois l'Escaut arrêté : l'annulation est acceptée, tout autre message reçoit un accusé neutre (le bilan juge le moment, pas Contargo).
  if (c.a === 'contargo' && aleaDeclenche(db)) {
    if (texteC.includes('annul')) {
      return { de: 'contargo', texte: `Bonjour,\n\nNous annulons votre commande ${COMMANDE}, sans frais en raison de l’arrêt de navigation.\n\n${H.signature}` };
    }
    return { de: 'contargo', texte: `Bonjour,\n\nNous avons reçu votre message concernant la commande ${COMMANDE}. La navigation sur l’Escaut reste arrêtée jusqu’au vendredi 05/03/2027.\n\n${H.signature}` };
  }
  const piece = c.pieces.includes(`fiche:${OT2}`) ? OT2 : c.pieces.includes(`fiche:${OT1}`) ? OT1 : null;
  if (!piece) {
    return { de: c.a, texte: `Bonjour,\n\nnous ne pouvons pas enregistrer votre demande sans l’ordre de transport. Merci de nous le transmettre en pièce jointe.\n\n${H.signature}` };
  }
  const x = fiche(db, piece).v[BO.cont];
  const n = String(x == null ? '' : x).trim();
  return { de: c.a, texte: `Bonjour,\n\nnous avons reçu votre ordre de transport ${piece === OT2 ? OT_2 : OT_1} pour le conteneur ${n}. ${H.texte}\n\n${H.signature}` };
}
export const COURRIEL = { carnet: CARNET, pieces: ['cahier', 'avis'], reponse };

// ─────────────────────────────────────────────────────────────── le téléphone (le chef de quai)
// Le téléphone s'ouvre quand le nouvel ordre est parti (ou qu'un ordre est parti chez le nouveau prestataire : l'ordre n° 1 renvoyé par erreur ne ferme pas l'appel
// au quai, sinon l'élève resterait sans bilan).
const aEnvoyeOrdre2 = (db, seance) => { const L = courrielsEnvoyes(db, seance); return L.some((c) => c.pieces.includes(`fiche:${OT2}`)) || !!courrielNouveau(L); };
export const TELEPHONE = {
  libelle: 'Téléphone',
  quand: aEnvoyeOrdre2,
  situation: 'Appelle le quai de réception pour le prévenir du changement.',
  leurres: [
    { id: 'claire', nom: 'Claire Vasseur', detail: 'responsable transport amont',
      message: 'Bonjour, vous êtes sur la messagerie de Claire Vasseur. Je suis en réunion : laissez-moi un message.' },
    { id: 'contargo', nom: 'Contargo — réservations', detail: 'service réservations',
      message: 'Bonjour, vous êtes sur la messagerie du service réservations de Contargo. Nos bureaux sont fermés pour le moment : laissez un message ou écrivez-nous par courriel.' },
  ],
  dialogues: [{
    id: DIALOGUE, de: 'mehdi',
    contact: { nom: 'Quai de réception — Rouvignies', detail: 'poste 214' },
    repliques: [
      { id: 'accueil', dit: 'Quai de réception, Mehdi, j’écoute.',
        choix: [
          { v: 'presente', juste: true, lib: 'Bonjour, c’est {prenom}, du transport amont. Je t’appelle pour un changement sur le conteneur PRPU 000000 0.' },
          { v: 'salut', lib: 'Salut, ça va ?', reaction: 'Ça va. C’est pour quoi ?' },
          { v: 'bateau', lib: 'Il y a un problème avec un bateau.', reaction: 'Quel bateau ? Quel conteneur ?' },
        ],
        // Calculé UNE FOIS, sur l'AVIS de l'élève (le chef de quai lit l'avis du terminal, pas l'ordre de l'élève).
        selon: (db) => ({ libs: { presente: `Bonjour, c’est ${prenomDe(db) || '{prenom}'}, du transport amont. Je t’appelle pour un changement sur le conteneur ${jeuEleve(db).conteneur}.` } }) },
      { id: 'changement', dit: 'Je t’écoute.',
        choix: [
          { v: 'juste', juste: true, lib: 'La barge est annulée, l’Escaut est fermé. Il arrive vendredi 5 février vers 15 h, en camion depuis le terminal de Dourges.' },
          { v: 'prevu', lib: 'Il arrive vendredi 9 h, comme prévu.', reaction: 'Comme prévu par barge ? Tu m’as dit qu’elle ne partait pas…' },
          { v: 'inconnu', lib: 'Je ne sais pas encore quand.', reaction: 'Le rail t’a confirmé une heure, non ? Regarde son message.' },
        ] },
      { id: 'fin', dit: 'OK, je déplace ton créneau à 15 h et je libère celui de 9 h. Autre chose ?',
        choix: [
          { v: 'merci', juste: true, lib: 'Non, c’est tout. Merci, bonne journée !' },
          { v: 'sec', lib: 'Non. Salut.', reaction: '… Bon. À plus.', accepte: true },
        ] },
    ],
    fin: 'Merci, {prenom}. À bientôt.',
  }],
};

// ─────────────────────────────────────────────────────────────── les messages
const CLAIRE = { nom: EQUIPE.claire.nom, mail: mailDe('claire') };
const CONTARGO = { nom: 'Contargo — Service réservations', mail: PRESTATAIRES.barge.mail };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

// Ce que Claire reprend de l'envoi : l'offre retenue (sans corriger), puis SA décision.
export function texteDecision(prenom, db) {
  const J = jeuEleve(db), v = fiche(db, CMP1).v;
  const o = J.offres.find((x) => x.slot === v[B.retenue]);
  const reprise = o ? `Tu proposes ${o.nom}. ` : '';
  return `Merci ${prenom}. ${reprise}Pour ce trajet on part sur la barge de Contargo, comme d’habitude : passe-lui la commande. J’ai déjà réservé le quai pour vendredi 9 h.\n\nClaire`;
}
export function texteNote(prenom, db) {
  const J = jeuEleve(db), o = J.offres.find((x) => x.slot === fiche(db, CMP2).v[B.retenue]);
  return `${o ? `Je note : ${o.nom}. ` : 'Je note ton nouveau choix. '}Commande-la, et règle la question de Contargo.\n\nClaire`;
}

// Une courrier à un prestataire qui porte le PREMIER ordre : c'est lui qui déclenche l'imprévu (juste ou faux, peu importe qui le reçoit ;
// jamais un courriel à Claire, ni un courriel sans l'ordre).
export const premierOrdre = (L) => L.find((c) => PRESTA_MAIL.includes(c.a) && c.pieces.includes(`fiche:${OT1}`));
const apresOrdre1 = (db, seance) => !!premierOrdre(courrielsEnvoyes(db, seance));

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, CLAIRE, 'Un nouveau conteneur à Anvers',
      `Bonjour ${prenom},\n\nun nouveau conteneur est disponible à Anvers aujourd’hui. Même chose que la semaine dernière : compare les offres, envoie-moi ton choix, puis passe la commande.\n\nClaire`,
      { extra: { pieces: ['cahier', 'liste', ...devisDe(db), 'avis'], ouvreFiche: CMP1 } }),
  ] }),
  declencheurs: [
    // Le comparateur n° 1 envoyé (juste ou faux) : Claire reprend l'offre de l'élève, puis décide. Aucun mot ne dit si c'est juste.
    { id: 'decision', quand: apresFiche(CMP1),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Ton choix', texteDecision(prenom, db), { db, decalage: 3, extra: { ouvreFiche: OT1 } })] }) },
    // L'IMPRÉVU : l'ordre n° 1 est parti chez un prestataire (la confirmation est déjà dans la boîte : elle naît à l'envoi, avant ce déclencheur).
    { id: ALEA, quand: apresOrdre1,
      semer: (prenom, db) => ({ mails: [
        mail(prenom, CONTARGO, `Arrêt de navigation sur l’Escaut — commande ${COMMANDE}`,
          'Madame, Monsieur,\n\nà la suite d’une avarie à l’écluse de Kain, la navigation sur l’Escaut est arrêtée du mardi 02/02 au vendredi 05/03/2027. '
            + `La barge prévue pour votre conteneur ${numeroEcrit(db)} ne pourra pas partir. Nous ne pouvons proposer aucune date avant la réouverture.\n\n`
            + `Merci de nous dire si vous maintenez ou annulez votre commande ${COMMANDE}.\n\nService réservations, Contargo`, { db, decalage: 2 }),
        mail(prenom, CLAIRE, 'Le message de Contargo',
          `Tu as vu le message de Contargo ? À toi de jouer : il faut que ce conteneur soit à quai jeudi 11 à 14 h.\n\nClaire`,
          { db, decalage: 3, extra: { ouvreFiche: CMP2 } }),
      ] }) },
    // Le comparateur n° 2 envoyé : Claire reprend le choix, sans le juger.
    { id: 'note', quand: apresFiche(CMP2),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Ton nouveau choix', texteNote(prenom, db), { db, decalage: 6, extra: { ouvreFiche: OT2 } })] }) },
    // L'appel fini : le mot de la fin.
    { id: 'fin', quand: dialogueFini(DIALOGUE),
      semer: (prenom, db) => ({ mails: [mail(prenom, CLAIRE, 'Merci',
        `Merci ${prenom}. Un conteneur, un imprévu, et il arrive quand même avant la mise en rayon.\n\nClaire`, { db, decalage: 12 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (7 + 1 bonus : 17 + 3 de questions = 20)
// Poids validés par Tristan le 15/10/2026 (option b, §5 : la part des questions au fil est prise sur Rechoisir, Sécuriser et Prévenir) :
// Qualifier 3 · Rechoisir 4 (RailCo hors liste 1,5 · rail retenu 2,5) · Sécuriser 3 · Annuler au bon moment 4 · Prévenir le quai 2 · Forme 1 ·
// questions 3 (`part`). Rien n'est vrai avant le geste : l'inaction vaut 0, et le comparateur n° 1, l'ordre n° 1 et le premier courriel ne sont pas notés.
export const GROUPES = {
  qualifier: 'Qualifier les offres après l’imprévu', rechoisir: 'Rechoisir', securiser: 'Sécuriser la nouvelle commande',
  annuler: 'Annuler au bon moment', prevenir: 'Prévenir le quai', forme: 'Forme des courriels',
};
export const POIDS = { 'qualifier-barge': 3, 'rechoisir-horsliste': 1.5, 'rechoisir-rail': 2.5, securiser: 3, annuler: 4, 'appel-quai': 2, forme: 1 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = { status: 'ko' };

const jalonCmp2 = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id],
  verifier(db) { const f = fiche(db, CMP2); return f.envoye ? (juste(f.v, jeuEleve(db)) ? ok : ko) : attente; } });

// Les courriels, lus à l'HEURE (`at`) : jamais sur l'ordre du tableau.
const parHeure = (L) => L.slice().sort((a, b) => a.at - b.at);
// Le premier courriel, APRÈS l'ordre n° 1, qui porte un ordre (le n° 2, ou le n° 1 envoyé par erreur) à un prestataire AUTRE que Contargo : la
// confirmation du nouveau prestataire naît avec lui (une erreur ne se paie qu'une fois : l'ordre n° 1 envoyé au rail coûte « sécuriser », pas « annuler »).
export const courrielNouveau = (L) => {
  const p = premierOrdre(L);
  return p ? parHeure(L).find((c) => c.at > p.at && c.a !== 'contargo' && PRESTA_MAIL.includes(c.a)
    && (c.pieces.includes(`fiche:${OT2}`) || c.pieces.includes(`fiche:${OT1}`))) : undefined;
};
// Une annulation : un courriel à Contargo, après l'ordre n° 1, qui dit « annul » ET nomme la commande ou le conteneur (celui de l'avis ou celui que l'élève a écrit).
export function annulation(c, db, apres) {
  if (c.a !== 'contargo' || !(c.at > apres.at)) return false;
  const t = compact(`${c.objet} ${c.corps}`);
  if (!t.includes('annul')) return false;
  const J = jeuEleve(db);
  return [COMMANDE, J.conteneur, numeroEcrit(db)].some((r) => r && t.includes(compact(r)));
}
export const courrielAnnulation = (L, db) => { const p = premierOrdre(L); return p ? parHeure(L).find((c) => annulation(c, db, p)) : undefined; };

// La forme d'un courriel : un objet clair, une formule d'appel, une signature, le vouvoiement (comme ENT-7.2, mots de l'objet propres à chaque courriel).
export function formeCourriel(c, db, motsObjet) {
  const objet = nrm(c.objet), objetCompact = objet.replace(/\s/g, '');
  const objetOk = motsObjet.some((m) => m && (objet.includes(nrm(m)) || objetCompact.includes(compact(m))));
  const corps = nrm(c.corps);
  const lignes = String(c.corps || '').split('\n').map((x) => nrm(x).trim()).filter(Boolean).slice(-3).join(' ');
  const prenom = nrm(prenomDe(db)).trim();
  const signe = lignes.includes('decathlon') || (prenom !== '' && lignes.includes(prenom));
  const formule = /\b(bonjour|madame|monsieur)\b/.test(corps);
  const tutoie = /\b(tu|te|ton|ta|salut|stp)\b/.test(corps);
  return objetOk && formule && signe && !tutoie;
}
const motsOrdre2 = (db) => [jeuEleve(db).conteneur, numeroEcrit(db), 'ordre de transport', OT_2];
const motsAnnulation = (db) => [jeuEleve(db).conteneur, numeroEcrit(db), 'annul', COMMANDE];

export const ETAPES = [
  jalonCmp2('qualifier-barge', 'qualifier', 'Le tri : la barge ne tient plus la date', (v) => tri(v, 'barge', COL.date) === false),
  jalonCmp2('rechoisir-horsliste', 'rechoisir', 'Le tri : l’offre hors liste écartée', (v) => tri(v, 'horsliste', COL.liste) === false),
  jalonCmp2('rechoisir-rail', 'rechoisir', 'La décision : l’offre qui émet le moins de CO₂ parmi celles qui tiennent encore la date et sont référencées', (v, J) => v[B.retenue] === J.bonne.slot),
  { id: 'securiser', titre: 'La commande : l’ordre n° 2 envoyé au rail, bien rempli', groupe: GROUPES.securiser, poids: POIDS.securiser,
    verifier(db) {
      const L = courrielsEnvoyes(db, ID), p = premierOrdre(L);
      if (!p) return attente;
      // « À faire » tant que l'élève n'a rien envoyé de plus au nouveau prestataire ; un courriel à un prestataire autre que Contargo sans l'ordre
      // n° 2 (par exemple l'ordre n° 1 envoyé une seconde fois) se juge : faux, sinon l'élève resterait sans bilan.
      const ot2 = L.some((c) => c.pieces.includes(`fiche:${OT2}`));
      const ailleurs = L.some((c) => c.at > p.at && c.a !== 'contargo' && PRESTA_MAIL.includes(c.a));
      if (!ot2 && !ailleurs) return attente;
      const o = fiche(db, OT2).v;
      const rempli = o[BO.presta] === BONNES.presta && o[BO.liv] === BONNES.liv && o[BO.limd] === LIMITE.iso && lireHeure(o[BO.limh]) === LIMITE.h * 60;
      return rempli && L.some((c) => c.a === 'rail' && c.pieces.includes(`fiche:${OT2}`)) ? ok : ko;
    } },
  // Le MOMENT de l'annulation : après la confirmation écrite du NOUVEAU prestataire (quel qu'il soit : une erreur ne se paie qu'une fois). Annuler avant,
  // c'est risquer de laisser le conteneur sans transport. Rien n'est vrai tant que l'élève n'a pas fini (l'absence d'annulation ne se juge qu'après l'appel).
  { id: 'annuler', titre: 'L’annulation de Contargo : envoyée au bon moment', groupe: GROUPES.annuler, poids: POIDS.annuler,
    verifier(db) {
      const L = courrielsEnvoyes(db, ID);
      if (!premierOrdre(L)) return attente;
      const ann = courrielAnnulation(L, db), nv = courrielNouveau(L);
      if (!ann) return dialogueFini(DIALOGUE)(db, ID) ? ko : attente;
      return nv && ann.at > nv.at ? ok : ko;
    } },
  { ...jalonDialogue({ seance: ID, dialogue: DIALOGUE, id: 'appel-quai', titre: 'L’appel au quai : mené jusqu’au bout avec au plus deux reprises', groupe: GROUPES.prevenir,
    poids: POIDS['appel-quai'], juge: (a, db) => reprises(a) + leurresAppeles(db.dialogues && db.dialogues[ID], { avant: DIALOGUE }).length <= 2 }), ecran: undefined },
  { id: 'forme', titre: 'Les courriels : un objet clair, une formule d’appel, le vouvoiement et une signature', groupe: GROUPES.forme, poids: POIDS.forme,
    verifier(db) {
      // Le courriel au nouveau prestataire (à défaut, le dernier courriel envoyé à un prestataire autre que Contargo après l'ordre n° 1) et le courriel
      // d'annulation (à défaut, le dernier courriel à Contargo après l'ordre n° 1) : chacun jugé s'il existe. Jugé quand les deux existent, ou l'appel fini.
      const L = courrielsEnvoyes(db, ID), p = premierOrdre(L);
      if (!p) return attente;
      const apres = parHeure(L).filter((c) => c.at > p.at);
      const nv = courrielNouveau(L) || apres.filter((c) => c.a !== 'contargo' && PRESTA_MAIL.includes(c.a)).pop();
      const ann = courrielAnnulation(L, db) || apres.filter((c) => c.a === 'contargo').pop();
      if (!(dialogueFini(DIALOGUE)(db, ID) || (nv && ann))) return attente;
      if (!nv && !ann) return ko;
      return (!nv || formeCourriel(nv, db, motsOrdre2(db))) && (!ann || formeCourriel(ann, db, motsAnnulation(db))) ? ok : ko;
    } },
  // Le bonus du confirmé : la cinquième offre du comparateur n° 2, écartée pour la bonne raison. `null` si l'élève ne l'a pas reçue.
  { id: 'bonus-offre', bonus: true, titre: 'Offre en plus écartée pour la bonne raison',
    verifier(db) {
      const o = jeuEleve(db).offres.find((x) => x.slot === 'bonus1');
      if (!o) return null;
      const f = fiche(db, CMP2);
      return f.envoye ? (tri(f.v, o.slot, o.ecarte) === false ? ok : ko) : attente;
    } },
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
const courrielsA = (db) => courrielsEnvoyes(db, ID);
export const PASTILLES = [
  { libelle: 'Commander', fait: (db) => !!premierOrdre(courrielsA(db)) },
  { libelle: 'L’imprévu', fait: (db) => aleaDeclenche(db) },
  { libelle: 'Rechoisir', fait: (db) => fiche(db, CMP2).envoye },
  { libelle: 'Commander et annuler', fait: (db) => { const L = courrielsA(db); const p = premierOrdre(L);
    return !!courrielNouveau(L) && !!p && L.some((c) => c.a === 'contargo' && c.at > p.at); } },
  { libelle: 'Prévenir le quai', fait: (db) => dialogueFini(DIALOGUE)(db, ID) },
];

// ─────────────────────────────────────────────────────────────── la carte (l'Escaut barré à Kain, après l'imprévu)
export const CARTE_ITINERAIRES = {
  carte: CARTE,
  destination: DESTINATION,
  libelle: 'Carte des itinéraires',
  titre: 'D’Anvers à Rouvignies : trois itinéraires',
  consigne: 'Clique sur un itinéraire (ou dans la liste) pour lire sa fiche. Les prix, les dates et le CO₂ sont dans les devis.',
  alt: 'Carte d’Anvers à Rouvignies : trois itinéraires, route, barge et rail',
  offres: (mode, db) => jeuEleve(db).offres.filter((o) => o.mode === mode).map((o) => o.nom),
  marques: [{ id: 'kain', lonlat: ARRET.lonlat, titre: 'Écluse de Kain : avarie',
    texte: 'Navigation arrêtée du mardi 02/02 au vendredi 05/03/2027', coupe: 'barge', quand: aleaDeclenche, legende: 'Navigation arrêtée' }],
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_73 = {
  ...LEXIQUE,
  'arrêt de navigation': 'Période pendant laquelle les bateaux ne peuvent pas passer sur une voie d’eau (écluse fermée, travaux, avarie).',
  écluse: 'Sas qui fait monter ou descendre l’eau pour qu’un bateau passe d’un niveau de rivière à un autre.',
  'force majeure': 'Événement imprévisible, qu’on ne peut pas éviter, et qui empêche d’exécuter ce qu’on avait promis dans un contrat.',
  'ordre de transport': 'Document par lequel le donneur d’ordre commande un transport à un prestataire et lui donne ses instructions.',
};
export const MENTION = 'Réels : Decathlon et son entrepôt de Rouvignies (Nord), la ligne de barges de Contargo entre Anvers et Valenciennes, la fermeture de l’Escaut '
  + 'pendant cinq semaines en 2024 (communiqué Contargo), le Code civil (art. 1218, 1231-1 et 1366), le Code des transports (L1431-3). Construit : l’avarie de l’écluse de Kain '
  + '(cause et dates), les messages de Contargo, toutes les offres et RailCo Express, le chef de quai (Mehdi Benali), Claire.';
export const ACCUEIL = {
  titre: 'La barge ne passe plus',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie : le cahier des charges, la liste référencée, les devis et l’avis du terminal sont joints.'],
    ['① Commander', 'Compare les offres, envoie ton choix à Claire, puis passe la commande par courriel.'],
    ['La suite', 'Lis ta Messagerie au fil de la séance : la suite s’y trouve.'],
    ['Bon à savoir', MENTION],
  ],
};

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 3 : la barge ne passe plus',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_73,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_CMP1, FICHE_OT1, FICHE_CMP2, FICHE_OT2],
  courriel: COURRIEL,
  telephone: TELEPHONE,
  carteItineraires: CARTE_ITINERAIRES,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
