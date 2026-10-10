// ENT-6.4 — France Boissons, « le camion de la brasserie » : les données de la séance (brief `docs/briefs/ENT-6.4-france-boissons-reception.md`,
// règles postérieures de `docs/briefs/FRANCE-BOISSONS-refonte.md` §0, chantier moteur D-4 `docs/briefs/MOTEUR-quai-inspection.md`).
// Univers commun : `contenus/france-boissons.js`. Activité : `activites/france-boissons-reception.js`. Questions :
// `contenus/questions/ENT-6.4.js`. Corrigé : `contenus/corriges/ENT-6.4.js`.
//
// L'élève, en renfort au quai de réception (mercredi 16 juin 2027, 14 h), cariste en entraînement :
//   1. lit le message de Nadia (« zéro accident »), puis le camion de la brasserie de Mons recule au quai 12 : il INSPECTE le quai iso
//      lui-même (deux vues, des marques, « Signaler à Nadia », « C'est bon, on peut décharger ») ; rien ne dit où est le défaut ;
//   2. décharge au chariot frontal quatre palettes de fûts (cariste dessiné), les contrôle contre le BL (brouillon de calcul, aides de
//      guidage éteintes), écrit les réserves, fait signer le chauffeur, rentre les palettes ;
//   3. rend compte à Nadia par phrases à choisir (ordre tiré par élève), puis Nadia répond en reprenant ce que l'élève a écrit.
//
// Vérifié (brief §2) : France Boissons (filiale de Heineken), la plateforme de Buchelay (35 quais, portique à fûts, cales de roue et
// marquage au sol), la brasserie Heineken de Mons-en-Barœul, les marques Heineken, Affligem, Pelforth, Edelweiss (Heineken France), les
// fûts de 20 et 30 L, 8 fûts par palette mère (INRS). Construit : Nadia, le quai 12, l'horaire, le transporteur, le BL n° MON-27-0617, les
// références, les défauts (la palette de Pelforth au lieu d'Affligem, le fût qui fuit, la palette à 7 fûts conforme au BL), la scène.
//
// Les valeurs attendues (réel d'une palette, réserves, phrase juste du compte rendu) sont CALCULÉES depuis les palettes, jamais recopiées.

import { jalonsQuai } from '../core/types/quai.js';
import { phrasesJustes } from '../core/phrases.js';
import { QUESTIONS } from './questions/ENT-6.4.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, STOCK_BUCHELAY, mailDe, heureScenario, DOC_ANNUAIRE, DOC_ORGANIGRAMME, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';

export const ID = 'france-boissons-reception';
export const QUAI_ID = 'fb-ent64';
export const PHRASES_ID = 'compte-rendu-nadia';
export const ID_VOLET = 'fb-ent64';

// Mercredi 16 juin 2027, 14 h (calendrier de S2 : 6.3 le mardi après-midi, 6.4 le mercredi à 14 h).
export const SCENARIO = { date: '2027-06-16' };

const NADIA = { nom: EQUIPE.nadia.nom, mail: mailDe('nadia') };

// ─────────────────────────────────────────────────────────────── les quatre palettes de fûts (brief §4.4)
// `forme: 'fut'` : un bac de rétention noir, huit places en quinconce 3-2-3 (numérotées du fond vers l'avant, de gauche à droite : 1-2-3,
// 4-5, 6-7-8). `manque` : numéros des places vides ; `avarie` : { place: face } (le fût n° 2 fuit sur sa face arrière `N` : coulure et
// flaque, visibles seulement quand on fait tourner la palette). Le total (8), le réel (8 − manque), le nombre d'avaries et les manquants
// (bl − réel) se CALCULENT dans le moteur. `ref` = ce que dit le BL ; `etiq.ref` = ce que dit l'étiquette collée sur les fûts.
export const PALETTES_ENT64 = [
  // Aucun aléa.
  { id: 'P1', forme: 'fut', ref: 'HEI-30', nom: 'Heineken fût 30 L', bl: 8, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'HEI-30', nom: 'HEINEKEN FÛT 30 L', poids: 'fût de 30 L', lot: 'HEI-26-0412' } },
  // Erreur du BL : l'étiquette dit Pelforth Blonde alors que le BL annonce de l'Affligem (huit fûts, le compte est bon).
  { id: 'P2', forme: 'fut', ref: 'AFF-20', nom: 'Affligem Blonde fût 20 L', bl: 8, manque: [], avarie: {}, attendu: 'reserves', motifAttendu: 'produit',
    etiq: { ref: 'PEL-20', nom: 'PELFORTH BLONDE FÛT 20 L', poids: 'fût de 20 L', lot: 'PEL-26-1107' } },
  // Un fût d'Affligem fuit sur sa face arrière : il faut faire le tour de la palette.
  { id: 'P3', forme: 'fut', ref: 'AFF-20', nom: 'Affligem Blonde fût 20 L', bl: 8, manque: [], avarie: { 2: 'N' }, attendu: 'reserves', motifAttendu: 'avarie',
    etiq: { ref: 'AFF-20', nom: 'AFFLIGEM BLONDE FÛT 20 L', poids: 'fût de 20 L', lot: 'AFF-26-0733' } },
  // Une place vide, mais le BL n'annonce que 7 fûts : conforme (le piège de comptage).
  { id: 'P4', forme: 'fut', ref: 'EDW-20', nom: 'Edelweiss fût 20 L', bl: 7, manque: [7], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
    etiq: { ref: 'EDW-20', nom: 'EDELWEISS FÛT 20 L', poids: 'fût de 20 L', lot: 'EDW-26-0268' } },
];

const reel = (p) => 8 - p.manque.length;
const nbAvaries = (p) => Object.keys(p.avarie).length;
const pal = (id) => PALETTES_ENT64.find((p) => p.id === id);
// L'article du stock de Buchelay qui porte cette référence (les références du stock sont préfixées « FUT- »).
const articleDe = (ref) => STOCK_BUCHELAY.find((a) => a.ref.endsWith(`-${ref}`) || a.ref === ref) || { nom: ref, marque: ref };

// ─────────────────────────────────────────────────────────────── la scène de sécurité (brief §4 étape 2 et §6)
// Deux défauts (le chauffeur au volant moteur allumé ; le niveleur relevé) et trois pièges (la cale, les butoirs et la lampe sont en
// ordre). Les `lib` ne s'affichent JAMAIS pendant l'inspection : ils servent au bilan et au corrigé. Nadia ne dit rien de ce qui n'a pas
// été signalé ; un défaut oublié est remis en ordre sans un mot au déchargement (`arret: false`, entraînement).
export const SECURITE = {
  mode: 'scene',
  arret: false,
  consigne: 'Clique sur ce qui ne va pas, puis signale-le à Nadia.',
  points: [
    { id: 'cabine', objet: 'cabine', etat: 'conduite', vue: 'dehors', ok: false, lib: 'Chauffeur au volant, moteur allumé',
      repare: 'Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend.' },
    { id: 'niveleur', objet: 'niveleur', etat: 'releve', vue: 'dedans', ok: false, lib: 'Niveleur relevé, pas posé sur la remorque',
      repare: 'Bien vu : je pose le niveleur.' },
    { id: 'cale', objet: 'cale', etat: 'posee', vue: 'dehors', ok: true, lib: 'Cale de roue posée' },
    { id: 'butoirs', objet: 'butoirs', etat: 'enPlace', vue: 'dehors', ok: true, lib: 'Butoirs de quai en place' },
    { id: 'lampe', objet: 'lampe', etat: 'allumee', vue: 'dedans', ok: true, lib: 'Lampe de quai allumée' },
  ],
  signaler: { qui: 'Nadia', rien: 'Là, je ne vois rien qui cloche.', fin: 'Tu me dis quand on peut décharger.' },
  bilan: 'La scène n’était pas sûre : avant d’entrer dans un camion, il doit être immobilisé et le passage vers la remorque doit être sûr.',
};

// ─────────────────────────────────────────────────────────────── le quai
export const QUAI_ENT64 = {
  id: QUAI_ID,
  rendu: 'iso',
  escalierAccueil: true,   // la porte « Accueil chauffeurs » est sur le quai, avec trois marches
  titre: 'Plateforme France Boissons de Buchelay (78) — Quai 12, réception',
  destinataire: 'France Boissons, plateforme de Buchelay',
  avertissement: 'Réels : France Boissons (filiale de Heineken), sa plateforme de Buchelay, la brasserie Heineken de Mons-en-Barœul et les bières '
    + 'citées. Le quai est un <b>dessin construit</b> : ce n’est pas la plateforme de Buchelay. Le quai 12, l’horaire, le transporteur, '
    + 'le bon de livraison, les références, les quantités et les défauts sont <b>construits pour l’exercice</b>.',
  froid: false,
  // Le BL signé, le camion est reparti : pas de « Recommencer la réception » (comme ENT-5.4 : la note est le premier bilan).
  recommencer: false,
  unite: 'fûts',
  motifs: ['avarie', 'manquant', 'produit'],
  libelles: { avarie: { nom: 'Fût endommagé', precision: 'fuite' } },
  lieu: { nom: 'Quai 12', temp: 15, refrigere: false },
  zone: { nom: 'Zone de réception' },
  dechargement: { ouverture: 0.5, parPalette: 1, par: 'cariste' },
  // Aides de guidage éteintes (entraînement). Une palette de fûts prend toujours le brouillon de calcul (le brief disait `feuille` : périmé).
  calcul: { forme: 'brouillon' },
  aides: {},
  securite: SECURITE,
  camions: [{
    transporteur: 'Transports du Nord (fictif)', fournisseur: 'Heineken, Mons-en-Barœul', bl: 'MON-27-0617', arrivee: '14:00',
    parole: 'Bonjour. Livraison de la brasserie de Mons : voici le bon de livraison.',
    // Une copie : le moteur ne doit jamais modifier les palettes que lisent le corrigé et les tests.
    palettes: JSON.parse(JSON.stringify(PALETTES_ENT64)),
  }],
};

// ─────────────────────────────────────────────────────────────── le compte rendu à Nadia (phrases à choisir, au TU)

const nbFuts = (n) => (n === 1 ? 'un fût' : `${n} fûts`);
const P2 = PALETTES_ENT64.find((p) => p.etiq.ref !== p.ref);           // la palette d'un autre produit
const P3 = PALETTES_ENT64.find((p) => nbAvaries(p) > 0);               // la palette au fût qui fuit
const NOM_LU = articleDe(P2.etiq.ref).nom;                              // « Pelforth Blonde »
const MARQUE_BL = articleDe(P2.ref).marque;                             // « Affligem »
const MARQUE_FUITE = articleDe(P3.ref).marque;

// Chaque ligne choisie porte ce que Nadia en reprend (`echo`), sans corriger (règle du 10/10/2026). La juste en tête (rang déclaré).
export const CHOIX_RESERVES = [
  { phrase: `Réserves : la palette ${P2.id} est de la ${NOM_LU} au lieu de l’${MARQUE_BL}, et ${nbFuts(nbAvaries(P3))} d’${MARQUE_FUITE} ${nbAvaries(P3) > 1 ? 'fuient' : 'fuit'}.`,
    echo: `Noté : la ${P2.id} est de la ${NOM_LU}, et ${nbFuts(nbAvaries(P3))} ${nbAvaries(P3) > 1 ? 'fuient' : 'fuit'}.` },
  { phrase: 'Tout est conforme.', echo: 'Noté : tout est conforme.' },
  { phrase: `Réserves : il manque ${P2.bl} fûts d’${MARQUE_BL}.`, echo: `Noté : il manque ${P2.bl} fûts d’${MARQUE_BL}.` },
  { phrase: `Réserves : ${nbAvaries(P3) + 1} fûts d’${MARQUE_FUITE} fuient.`, echo: `Noté : ${nbAvaries(P3) + 1} fûts d’${MARQUE_FUITE} fuient.` },
];
export const CHOIX_FUT = [
  { phrase: `J’ai mis le fût qui fuit en zone litiges.`, echo: 'Noté : le fût qui fuit est en zone litiges.' },
  { phrase: 'J’ai rangé le fût qui fuit en stock avec les autres.', echo: 'Noté : le fût qui fuit est rangé en stock avec les autres.' },
  { phrase: 'J’ai rendu le fût qui fuit au chauffeur.', echo: 'Noté : le fût qui fuit est reparti avec le chauffeur.' },
];
export const LIGNE_RECU = `J’ai reçu les ${PALETTES_ENT64.length} palettes de Mons.`;

export function phrasesNadia(prenom) {
  return {
    id: PHRASES_ID,
    lignes: [
      { id: 'salutation', choix: ['Bonjour Nadia,', 'Salut !', 'Coucou Nadia'], juste: 0 },
      { id: 'recu', texte: LIGNE_RECU },
      { id: 'reserves', choix: CHOIX_RESERVES.map((c) => c.phrase), juste: 0 },
      { id: 'fut-fuit', choix: CHOIX_FUT.map((c) => c.phrase), juste: 0 },
      { id: 'fin', choix: [`Cordialement, ${prenom}`, 'À plus !', 'Bisous'], juste: 0 },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── les messages

const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '14:05', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const SUJET_ARRIVEE = 'Le camion de la brasserie de Mons';
export const SUJET_COMPTE_RENDU = 'Ton compte rendu de réception';
export const TEXTE_ARRIVEE = (prenom) => `Bonjour ${prenom}, bienvenue au quai ! Ici, l’objectif, c’est zéro accident.\n\n`
  + 'Le camion de la brasserie de Mons arrive au quai 12 : 4 palettes de [[fût|fûts]], dont l’Affligem qu’on attendait.\n\n'
  + 'Ma procédure de réception, pour chaque palette :\n'
  + '1. je compte les fûts ;\n'
  + '2. je lis l’étiquette et je la compare au [[BL]] : même produit, même quantité ;\n'
  + '3. tout est conforme : j’accepte ;\n'
  + '4. il manque des fûts ou un fût est abîmé : j’accepte avec [[reserve|réserves]], en écrivant quoi et combien ;\n'
  + '5. c’est une référence que nous n’avons pas commandée : j’accepte avec réserves, motif « produit différent », et j’écris la référence lue sur l’étiquette, pas celle du BL. On la rangera sous la référence lue, pas sous celle du BL, et la réserve prévient le transporteur.\n\n'
  + 'Avant de décharger, regarde bien la scène.\n\nNadia';

// Le BL signé (le camion est reparti) : l'état du quai de la séance.
const etatQuai = (db) => (db && db.quais && db.quais[QUAI_ID]) || null;
const signe = (db) => !!(etatQuai(db) && etatQuai(db).signe);
const envoye = (db) => phrasesJustes(db, PHRASES_ID).envoye;

// Le DERNIER envoi du compte rendu (même tri que `phrasesJustes`), ou null.
const dernierEnvoi = (db) => ((db && db.mails) || []).filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === PHRASES_ID)
  .sort((a, b) => (a.ts - b.ts) || (a.id - b.id)).pop() || null;
// La réponse de Nadia : elle REPREND ce que l'élève lui a écrit (lignes « réserves » et « fût qui fuit » du dernier envoi), sans corriger
// ni dire si c'était juste. Exportée pour les tests.
export function texteReponseNadia(db) {
  const e = dernierEnvoi(db), c = (e && e.phrases && e.phrases.choix) || {};
  const r = CHOIX_RESERVES[c.reserves], f = CHOIX_FUT[c['fut-fuit']];
  return `${[r && r.echo, f && f.echo].filter(Boolean).join(' ') || 'Merci.'} Tout à l’heure, on range les fûts.\n\nNadia`;
}

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, NADIA, SUJET_ARRIVEE, TEXTE_ARRIVEE(prenom), { heure: '13:50', extra: { pieces: ['droit', 'annuaire'] } }),
  ] }),
  declencheurs: [
    // Le BL signé : Nadia demande le compte rendu, par phrases.
    { id: 'compte-rendu', quand: signe,
      semer: (prenom, db) => ({ mails: [mail(prenom, NADIA, SUJET_COMPTE_RENDU,
        'Le chauffeur est reparti. Fais-moi un compte rendu de ta réception.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nNadia',
        { db, decalage: 2, extra: { phrases: phrasesNadia(prenom) } })] }) },
    // Le compte rendu envoyé (juste ou faux) : Nadia reprend ce qu'on lui a écrit et passe au rangement (ENT-6.5).
    { id: 'reponse', quand: envoye,
      semer: (prenom, db) => ({ mails: [mail(prenom, NADIA, `RE : ${SUJET_COMPTE_RENDU}`, texteReponseNadia(db), { db, decalage: 4 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: {
    [PHRASES_ID]: (prenom, n, db) => ({ mails: [mail(prenom, NADIA, `RE : ${SUJET_COMPTE_RENDU}`, `Bien reçu, merci ${prenom}.\n\nNadia`, { db, decalage: 3 })] }),
  },
};

// ─────────────────────────────────────────────────────────────── les documents (reconstitués, mention en pied)

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;

// Le BL de la séance : ce que le camion doit livrer (les quantités annoncées, jamais celles qui arrivent).
const docBL = () => `<article class="fb4-doc" aria-label="Bon de livraison MON-27-0617">
    <p class="fb-t">Bon de livraison n° ${ech(QUAI_ENT64.camions[0].bl)}</p>
    <p class="fb-st">De : ${ech(QUAI_ENT64.camions[0].fournisseur)} · à : France Boissons, plateforme de Buchelay (78), quai 12 · transporteur : ${ech(QUAI_ENT64.camions[0].transporteur)}</p>
    <table class="fb4-table">
      <thead><tr><th scope="col">Palette</th><th scope="col">Référence</th><th scope="col">Désignation</th><th scope="col">Fûts annoncés</th></tr></thead>
      <tbody>${PALETTES_ENT64.map((p) => `<tr><td>${p.id}</td><td>${ech(p.ref)}</td><td>${ech(p.nom)}</td><td>${p.bl}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">Total</td><td>${PALETTES_ENT64.reduce((t, p) => t + p.bl, 0)}</td></tr></tfoot>
    </table>
    <p class="fb4-note">Le BL annonce ce que la brasserie a voulu envoyer. Une palette = un bac de rétention noir, des [[fût|fûts]] posés debout.</p>
    ${PIED('Bon de livraison')}
  </article>`;

// Les textes de loi. L133-3 al. 1 (relu sur Légifrance le 03/10/2026 pour ENT-4.1 et 4.3), R4515-4 et L4131-1 (relus par Cowork sur
// code.travail.gouv.fr le 10/10/2026). À RELIRE SUR LÉGIFRANCE AVANT OUVERTURE AUX ÉLÈVES : L133-1 et R4323-56 (extrait avec […]).
const art = (code, num, texte) => `<p class="fb-st" style="margin-top:14px">${code}, article ${num}</p>${texte}`;
const docDroit = () => `<article class="fb4-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : transport, réserves, sécurité au quai</p>
    ${art('Code de commerce', 'L133-1', '<p>« Le voiturier est garant de la perte des objets à transporter, hors les cas de la force majeure.</p>'
      + '<p>Il est garant des avaries autres que celles qui proviennent du vice propre de la chose ou de la force majeure.</p>'
      + '<p>Toute clause contraire insérée dans toute lettre de voiture, tarif ou autre pièce quelconque, est nulle. »</p>')}
    ${art('Code de commerce', 'L133-3 (alinéa 1)', '<p>« La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si, dans les trois jours, '
      + 'non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire '
      + 'ou par lettre recommandée, sa protestation motivée. »</p>')}
    ${art('Code du travail', 'R4515-4', '<p>« Les opérations de chargement ou de déchargement font l’objet d’un document écrit, dit “protocole de sécurité”, '
      + 'remplaçant le plan de prévention. »</p>')}
    ${art('Code du travail', 'R4323-56 (extrait)', '<p>« La conduite de certains équipements présentant des risques particuliers, en raison de leurs caractéristiques […] '
      + 'est subordonnée à l’obtention d’une autorisation de conduite délivrée par l’employeur. »</p>')}
    ${art('Code du travail', 'L4131-1 (alinéas 1 et 2)', '<p>« Le travailleur alerte immédiatement l’employeur de toute situation de travail dont il a un motif raisonnable '
      + 'de penser qu’elle présente un danger grave et imminent pour sa vie ou sa santé ainsi que de toute défectuosité qu’il constate dans les systèmes de protection.</p>'
      + '<p>Il peut se retirer d’une telle situation. »</p>')}
    <p class="fb-pied">Texte de loi (réel) — source : Légifrance</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'bl', titre: 'Bon de livraison n° MON-27-0617', court: 'Bon de livraison (BL)', html: docBL() },
  { id: 'droit', titre: 'Le droit : transport, réserves, sécurité au quai', court: 'Le droit', html: docDroit() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb4-doc{padding:14px 18px 0}
.fb4-doc p{margin:0 0 8px}
.fb4-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb4-table th, .fb4-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb4-table th{color:var(--douce); font-weight:600}
.fb4-table tfoot td{font-weight:700}
.fb4-note{margin:10px 0 0; font-size:.86rem}
`;

// ─────────────────────────────────────────────────────────────── les jalons (10, pondérés : 16 + 4 de questions = 20)
// Poids validés par Tristan le 10/10/2026 (brief §5) : sécurité 5,5 (cabine 2, niveleur 2, aucun faux signalement 1,5), contrôle des palettes
// 2,5 (P1 1, P4 1,5), réserves et BL 6 (P2 2,5, P3 2,5, BL signé 1), message 2 (réserves 1, fût qui fuit 1), plus 4 pour les questions
// notées (`part`). La forme (salutation, fin du message) pèse 0. Aucun jalon à 0.
// Comme ENT-5.4, une palette = comptage ET décision justes ; P2 et P3 portent en plus leur réserve écrite (un seul jalon chacune).
// Les trois jalons de sécurité ne sont jugés qu'au figeage de l'inspection (« C'est bon, on peut décharger ») : un défaut jamais
// signalé reste faux, rien n'est vrai par inaction (aucun signalement = « aucun faux signalement » faux aussi).
export const POIDS = {
  'securite-cabine': 2, 'securite-niveleur': 2, 'securite-aucun-faux': 1.5,
  'P1': 1, 'P2': 2.5, 'P3': 2.5, 'P4': 1.5,
  signature: 1, 'msg-reserves': 1, 'msg-fut-fuit': 1,
};
export const GROUPES = {
  securite: 'Sécurité avant de décharger',
  palettes: 'Contrôle des palettes',
  reserves: 'Réserves et BL',
  message: 'Message à Nadia',
};
const attente = { status: 'attente' }, ok = { status: 'ok' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });
const ligneQuai = (db, id) => jalonsQuai(db, QUAI_ENT64).L.find((l) => l.id === id) || {};

// Sécurité : jugé au figeage de l'inspection seulement.
const figee = (db) => !!(etatQuai(db) && etatQuai(db).securite && etatQuai(db).securite.fait);
const jalonSecurite = (id, titre, poids) => ({ id, titre, groupe: GROUPES.securite, poids,
  verifier(db) {
    const l = ligneQuai(db, id);
    if (!figee(db)) return attente;
    return l.ok ? ok : ko(l.fait);
  } });
// Une palette : comptage et décision justes (et la réserve écrite, pour celles qui en demandent une). Titres tous construits pareil.
const decidee = (db, id) => { const s = etatQuai(db) && etatQuai(db).palettes && etatQuai(db).palettes[id]; return !!(s && s.decision); };
const ecrit = (db) => !!(etatQuai(db) && etatQuai(db).ecrit);
const jalonPalette = (id, groupe) => {
  const avecReserve = pal(id).attendu !== 'accepter';
  return { id, titre: `Palette ${id} : comptage, décision et réserve éventuelle`, groupe, poids: POIDS[id],
    verifier(db) {
      const c = ligneQuai(db, `${id}-comptage`), d = ligneQuai(db, `${id}-decision`), r = avecReserve ? ligneQuai(db, `${id}-reserve`) : { ok: true };
      if (c.ok && d.ok && r.ok) return ok;
      if (!decidee(db, id) || (avecReserve && !ecrit(db))) return attente;
      return ko(`comptage : ${c.fait} — décision : ${d.fait}${avecReserve ? ` — réserve : ${r.fait}` : ''}`);
    } };
};
const jalonMessage = (ligne, id, titre, poids) => ({ id, titre, groupe: GROUPES.message, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) {
    const r = phrasesJustes(db, PHRASES_ID);
    if (!r.envoye) return attente;
    return r.justes.includes(ligne) ? ok : ko();
  } });

export const ETAPES = [
  jalonSecurite('securite-cabine', 'Danger n° 1 signalé avant de décharger', POIDS['securite-cabine']),
  jalonSecurite('securite-niveleur', 'Danger n° 2 signalé avant de décharger', POIDS['securite-niveleur']),
  jalonSecurite('securite-aucun-faux', 'Aucun faux signalement', POIDS['securite-aucun-faux']),
  jalonPalette('P1', GROUPES.palettes),
  jalonPalette('P2', GROUPES.reserves),
  jalonPalette('P3', GROUPES.reserves),
  jalonPalette('P4', GROUPES.palettes),
  { id: 'signature', titre: 'BL signé par le chauffeur', groupe: GROUPES.reserves, poids: POIDS.signature,
    verifier(db) { return signe(db) ? ok : attente; } },
  jalonMessage('reserves', 'msg-reserves', 'Compte rendu à Nadia : les réserves', POIDS['msg-reserves']),
  jalonMessage('fut-fuit', 'msg-fut-fuit', 'Compte rendu à Nadia : le fût qui fuit', POIDS['msg-fut-fuit']),
];

// Ce que le bandeau de fin dit quand une case du quai est fausse (elle ne se rouvre pas). La suite (« Tu peux corriger… ») vient du
// moteur, seulement si le compte rendu a une case fausse.
export const FIN_FIGE = 'Le camion est reparti : la réception ne se corrige plus.';

// ─────────────────────────────────────────────────────────────── le lexique et l'accueil

export const MENTION = 'Réels : France Boissons (filiale de Heineken) et sa plateforme de Buchelay (Yvelines), la brasserie Heineken de Mons-en-Barœul, '
  + 'les bières citées (marques de Heineken France), les textes de loi cités. Construit : Nadia, le quai 12 et sa scène (un dessin), l’horaire, le '
  + 'transporteur, le bon de livraison, les références, les quantités, les défauts et tous les messages.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  niveleur: 'Plaque mobile du quai qui fait le pont entre le quai et le plancher de la remorque : elle doit être posée avant d’entrer.',
  cale: 'Bloc posé contre une roue du camion (ou bloqueur fixé au quai) qui l’empêche de bouger pendant le déchargement.',
  BL: 'Bon de livraison : la liste de ce que le camion apporte ; on compare ce qu’on reçoit à ce papier.',
  réserve: 'Remarque précise écrite sur le BL avant la signature du chauffeur, quand la livraison n’est pas conforme : quoi, combien.',
  'zone litiges': 'Zone de la plateforme où l’on met de côté ce qui est abîmé ou contesté, le temps de régler avec la brasserie et le transporteur.',
  'produit différent': 'Le produit livré n’est pas celui que le BL annonce : l’étiquette porte une autre référence.',
  'chariot frontal': 'Chariot élévateur qui porte la charge à l’avant, sur des fourches ; il faut une formation (CACES) et une autorisation de conduite.',
});
export const ACCUEIL = {
  titre: 'Le camion de la brasserie',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Nadia', 'Menu Messagerie : le camion de la brasserie de Mons arrive au quai 12.'],
    ['Avant de décharger', 'Menu Quai de réception : le camion arrive. Regarde la scène, signale à Nadia ce qui ne va pas, puis dis-lui quand on peut décharger.'],
    ['Décharger, puis contrôler chaque palette', 'Les palettes sortent au [[chariot frontal]]. Pour chacune : compter, lire l’étiquette, comparer au [[BL]], décider.'],
    ['Les papiers', 'Écrire des [[reserve|réserves]] précises sur le BL, faire signer le chauffeur, rentrer les palettes.'],
    ['Rendre compte à Nadia', 'Quand le chauffeur est reparti : « Répondre » à Nadia, une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 4 : le camion de la brasserie',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  quai: QUAI_ENT64,
  finFige: FIN_FIGE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
