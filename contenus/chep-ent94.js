// ENT-9.4 — CHEP, évaluation « la semaine de Légumes de la Lys » : le contenu de la séance (brief `docs/briefs/ENT-9.4-chep-evaluation.md`).
// Données (tirage des trois parties, piles, ramasse, attendus) : `contenus/chep-ent94-donnees.js`. Univers commun : `contenus/chep.js` (lu,
// jamais modifié ici). Activité : `activites/chep-evaluation.js`. Questions (ouverture notée seulement) : `contenus/questions/ENT-9.4.js`.
// Corrigé : `contenus/corriges/ENT-9.4.js`.
//
// Lundi 1er février 2027. L'élève est SEUL au service relation clients et flux du centre CHEP de Templemars (Sandrine en congé, Grégory au tri,
// Yannick en rendez-vous), en ÉVALUATION de C2.5, copie rendue (`copie: true`) :
//   A — les déclarations de la semaine de Légumes de la Lys (fiche `decl` d'ENT-9.1, par sa fabrique, sans encadré ni aide), puis son relevé au
//       vendredi 29/01 (fiche `releve`, la grille de la fabrique, sans colonne « Aide », sans note, sans « = » préécrit) ; pas de réponse au client ;
//   B — le retour de Halles d'Artois : le quai iso d'ENT-9.2 (quatre piles, aucune aide, aucun arrêt, aucun bilan ; la clôture NE rend PAS la
//       copie, `rendCopie: false`), puis la fiche `credit` (les nombres, sans encadré ni le choix du sort des autres pools) ;
//   C — la ramasse du jeudi 04/02 : la fiche `besoin` (capacité, le site à camion complet), puis la tournée (quatre sites, un de trop ; jauge
//       muette en copie, `sansVerdict` en plus) ;
//   puis « Rendre ma copie » (bandeau), toujours disponible : le message de Sandrine et l'accueil disent « quand tes trois parties sont envoyées ».
// Rien n'est jugé à l'écran avant la remise. Les personnages ne disent que « Bien reçu. ».
//
// PAS DE LEXIQUE (évaluation) : les documents de l'univers et d'ENT-9.2 portent des marqueurs `[[mot]]` ; sans lexique, le moteur les
// laisserait tels quels. Ils passent tous par `sansLexique` (le mot reste, les crochets partent).

import { apresFiche, apresGeste } from '../core/declencheurs.js';
import { lireFeuille } from '../core/types/fiche.js';
import { estFormule } from '../core/formules.js';
import { comptePile } from '../core/types/quai.js';
import { QUESTIONS } from './questions/ENT-9.4.js';
import { CARTE } from './chep-carte.js';
import { EQUIPE, mailDe, heureScenario, PIED, PIED_RECONSTITUE, DOC_CONDITIONS, DOC_DROIT, docReleve, date, palettes, ech, TRANSPORTEUR, DISTRIBUTEURS,
  cadreSupports } from './chep.js';
import { documentChep, ficheDeclChep, ficheReleveChep } from './chep-ent91.js';
import { htmlBonCollecte, htmlAvis, quaiChep, ficheCreditChep, ficheBesoinChep, nb, DOC_REGLES, DOC_DESSIN_LPR, STYLE as STYLE_92, quandDit } from './chep-ent92.js';
import {
  ID, ID_VOLET, QUAI_ID, TOURNEE_ID, FICHES, SCENARIO, SEMAINE, CLIENT, EXPEDITEUR, PARTENAIRES, PLACES_SOL, PILE_VIDES, CAPACITE, SITES, COMPLET,
  IDS_TOURNEE, IDS_SITES, COMPLET_SIGNALE, nomSite, horaireDit, TOURNEE_BASE, jeuDe, jeuDeBase, jeuEleve, pilesDuJeu, pilesDeBase, dernierDe,
  fiche, declaration, lireNombre, dejaEnvoyee, lignesDeclarees, caseSolde, caseEntree, caseSortie, BLOC_RELEVE, etatQuai, quaiClos, constats,
  creditDeSonControle, tourneeEnvoyee,
} from './chep-ent94-donnees.js';

export { ID, QUAI_ID, TOURNEE_ID, FICHES, BLOC_RELEVE };

// ─────────────────────────────────────────────────────────────── sans lexique
// `[[mot|affiché]]` → « affiché », `[[mot]]` → « mot ».
export const sansLexique = (html) => String(html == null ? '' : html).replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1');
const nettoye = (doc) => ({ ...doc, html: typeof doc.html === 'function' ? (db) => sansLexique(doc.html(db)) : sansLexique(doc.html) });

// ─────────────────────────────────────────────────────────────── les documents
const PIED_94 = PIED(PIED_RECONSTITUE);
const entete = (qui, refs) => `<div class="ch-entete"><b>${ech(qui)}</b><span>${refs.map(ech).join('<br>')}</span></div>`;
const documentLys = documentChep(CLIENT);
const LETTRES = ['a', 'b', 'c', 'd'];
// Ton poste aujourd'hui (« Avant de commencer » : la situation, aucune réponse).
const DOC_POSTE = { id: 'poste', titre: 'Ton poste aujourd’hui', court: 'Ton poste',
  html: `<article class="ch-doc" aria-label="Ton poste aujourd’hui">
    ${entete('CHEP — centre de service de Templemars', ['Service relation clients et flux', 'Lundi 1er février 2027'])}
    <p class="ch-t">Ton poste aujourd’hui</p>
    <ul class="ch-ul">
      <li>Tu es au service relation clients et flux du centre de service CHEP de Templemars.</li>
      <li>Sandrine Delattre est en congé, Grégory Vandamme est au tri, Yannick Desmet est en rendez-vous : tu travailles seul ou seule.</li>
      <li>Tes trois tâches de la journée sont dans la Messagerie.</li>
      <li>C’est une évaluation : rien ne te dit si c’est juste avant que tu rendes ta copie.</li>
    </ul>
    ${PIED('Situation construite pour l’exercice — document pédagogique Prepalog.')}
  </article>` };
// La semi-remorque de collecte (les données du camion, sans le calcul).
const DOC_CAMION = { id: 'camion', titre: 'La semi-remorque de collecte', court: 'Le camion de collecte',
  html: `<article class="ch-doc" aria-label="La semi-remorque de collecte">
    ${entete('CHEP — exploitation transport, Templemars', [`Collecte sous-traitée à ${TRANSPORTEUR.nom}`, 'Fiche du véhicule'])}
    <p class="ch-t">La semi-remorque de collecte</p>
    <dl class="ch-dl">
      <dt>Plateau</dt><dd>13,6 m — <b>${PLACES_SOL} places au sol</b> pour des palettes 1 200 × 1 000</dd>
      <dt>Palettes vides</dt><dd>empilées <b>par ${PILE_VIDES}</b> sur chaque place</dd>
      <dt>Départ, retour</dt><dd>centre de service de Templemars, départ à 6 h</dd>
      <dt>Vitesse moyenne</dt><dd>55 km/h</dd>
      <dt>Enlèvement</dt><dd>20 min par site, plus 3 min par 60 palettes</dd>
    </dl>
    ${PIED('Fiche construite pour l’exercice (capacité, vitesse et temps d’enlèvement inventés) — document pédagogique Prepalog.')}
  </article>` };
// Les avis de palettes vides des cinq plates-formes : SES quantités, la date de SA pièce `dernier`, les horaires de ce jeudi.
const ADRESSE = Object.fromEntries(CARTE.clients.map((c) => [c.id, c.adresse]));
export function avisDe(db, site) {
  const J = jeuDeBase(db || {}), P = dernierDe(db || {});
  const D = DISTRIBUTEURS[SITES[site].dist];
  return { site, nom: D.nom, ville: D.ville, adresse: ADRESSE[site], horaire: horaireDit(site),
    n: site === COMPLET ? J.V : J.vides[site], signale: site === COMPLET ? COMPLET_SIGNALE : P.signale[site] };
}
const docAvis = (site) => ({ id: `avis-${site}`, titre: `Avis de palettes vides — ${nomSite(site)}`, court: `Avis — ${nomSite(site)}`,
  html: (db) => sansLexique(htmlAvis(avisDe(db, site))) });
export const AVIS_IDS = IDS_SITES.map((s) => `avis-${s}`);
// Le bon de collecte de Halles d'Artois, avec SES réserves écrites au quai (rien de corrigé).
export const docBonCollecte = (db) => {
  const J = jeuDeBase(db || {});
  return sansLexique(htmlBonCollecte({ bc: J.bc, piles: pilesDuJeu(J), etat: etatQuai(db || {}), expediteur: EXPEDITEUR, prepare: '2027-01-29' }));
};
export const DOCUMENTS = [
  ...LETTRES.map((l, i) => ({ id: `doc-${l}`, titre: `Document ${l.toUpperCase()}`, court: `Document ${l.toUpperCase()}`,
    html: (db) => sansLexique(documentLys(jeuEleve(db).documents[i])) })),
  { id: 'releve-25', titre: 'Relevé du compte au 25/01', court: 'Relevé au 25/01',
    html: (db) => sansLexique(docReleve({ client: CLIENT, iso: SEMAINE.debut, solde: jeuEleve(db).s0, periode: 'Semaine du 18 au 22 janvier 2027' })) },
  { id: 'bon-collecte', titre: 'Bon de collecte de Halles d’Artois', court: 'Bon de collecte', html: docBonCollecte },
  ...IDS_SITES.map(docAvis),
  DOC_CAMION, DOC_POSTE,
  nettoye(DOC_CONDITIONS), nettoye(DOC_DROIT), nettoye(DOC_REGLES), DOC_DESSIN_LPR,
];
export const STYLE = STYLE_92;
export const docsDe = (db) => jeuEleve(db).documents.map((d) => d.id);

// ─────────────────────────────────────────────────────────────── A — les déclarations et le relevé (fabriques d'ENT-9.1, en évaluation)
export const FICHE_DECL = ficheDeclChep({ id: FICHES.decl, client: CLIENT, documents: docsDe, jeuEleve, finSemaine: SEMAINE.fin, partenaires: PARTENAIRES,
  evaluation: true,
  sousTitre: 'Les documents de la semaine à gauche, un cadre par document à droite. C’est M. Deroo qui validera.',
  envoi: { bouton: 'Préparer les déclarations pour M. Deroo', a: 'M. Deroo', suite: 'C’est enregistré.' } });
export const FICHE_RELEVE = ficheReleveChep({ id: FICHES.releve, client: CLIENT, semaineDite: '25 au 29/01/2027',
  sousTitre: 'Le solde au 25/01 est donné. Les lignes sont les mouvements que tu as déclarés.',
  documents: ['releve-25', 'conditions'],
  quand: dejaEnvoyee(FICHES.decl),
  bloc: BLOC_RELEVE,
  envoi: { bouton: 'Enregistrer le relevé', a: 'Sandrine', suite: 'C’est enregistré.' } });

// ─────────────────────────────────────────────────────────────── B — le quai des retours et le crédit (fabriques d'ENT-9.2, en évaluation)
export const AVERTISSEMENT = 'Le quai est un <b>dessin construit</b>. Halles d’Artois, le transporteur, les piles et le bon de collecte sont <b>construits pour l’exercice</b>.';
// Le quai d'une graine (une déclaration neuve à chaque appel : le moteur garde la sienne en cache). Évaluation : ni aide, ni arrêt, ni
// « Recommencer » ; la clôture ne rend pas la copie (`rendCopie: false`) : les parties A et C peuvent suivre.
export const quaiDe = (graine) => {
  const J = jeuDe(graine);
  return quaiChep({ id: QUAI_ID, piles: pilesDuJeu(J), bc: J.bc, debut: '09:00', arrivee: '09:00', fournisseur: `${EXPEDITEUR.nom} (Douai)`,
    avertissement: AVERTISSEMENT, parole: 'Bonjour ! Les vides de Halles d’Artois, de Douai. Voilà le bon de collecte.', aides: {}, rendCopie: false });
};
export const FICHE_CREDIT = ficheCreditChep({ id: FICHES.credit, titre: 'Crédit du retour — Halles d’Artois',
  sousTitre: 'À gauche, le bon de collecte avec tes réserves et les règles de crédit.',
  documents: ['bon-collecte', 'regles-credit'],
  quand: quaiClos,
  blocs: [
    nb('annoncees', 'Palettes annoncées sur le bon', 'les palettes annoncées'),
    nb('aCrediter', 'Palettes à créditer au compte de Halles d’Artois', 'les palettes à créditer'),
    nb('horsPool', 'Palettes hors pool', 'les palettes hors pool'),
    nb('reparation', 'Palettes à envoyer en réparation', 'les palettes à réparer'),
  ],
  envoi: { bouton: 'Envoyer le crédit à Grégory', a: 'Grégory', suite: 'C’est enregistré.' } });

// ─────────────────────────────────────────────────────────────── C — la ramasse du jeudi (fabriques d'ENT-9.2, en évaluation)
export const CHOIX_COMPLET = [
  ...IDS_SITES.map((id) => ({ v: id, lib: `${nomSite(id)} (${SITES[id].ville})` })),
  { v: 'aucun', lib: 'Aucun : tous les sites en tournée' },
];
export const FICHE_BESOIN = ficheBesoinChep({ id: FICHES.besoin, libelle: 'Ramasse du jeudi', titre: 'Ramasse du jeudi 04/02 — besoin',
  sousTitre: 'À gauche, la fiche du camion et les avis de palettes vides.',
  documents: ['camion', ...AVIS_IDS],
  blocs: [
    nb('capacite', 'Capacité d’un camion (palettes vides)', 'la capacité du camion'),
    { type: 'liste', id: 'complet', lib: 'Le site qui reçoit un camion complet à lui seul', vide: 'Choisir…', choix: CHOIX_COMPLET, manque: 'le site à camion complet' },
  ],
  envoi: { bouton: 'Envoyer à Yannick', a: 'Yannick', suite: 'C’est enregistré.' } });
// La tournée n'apparaît qu'une fois la fiche du besoin envoyée (et figée) : ses quatre sites diraient lequel n'y est pas.
export const TOURNEE = {
  ...TOURNEE_BASE,
  libelle: 'Tournée de ramasse',
  titre: 'La tournée de ramasse du jeudi 04/02',
  consigne: 'Clique les plates-formes sur la carte, dans l’ordre de passage. Le semi part de Templemars à 6 h et y revient. Une plate-forme que tu '
    + 'ne prends pas jeudi reste dans « Reportés » : elle passera vendredi.',
  sansVerdict: true,
  termine: { libelle: 'Envoyer la tournée à Yannick', confirmer: 'Envoyer cette tournée à Yannick ? Clique encore', fait: 'Tournée envoyée à Yannick à {h}.',
    toast: 'Tournée envoyée.' },
  rappel: [`Capacité : ${PLACES_SOL} piles de ${PILE_VIDES} palettes vides`, 'Départ 6 h de Templemars, retour à Templemars',
    '55 km/h, 20 min par arrêt + 3 min par 60 palettes'],
  quand: dejaEnvoyee(FICHES.besoin),
};

// ─────────────────────────────────────────────────────────────── les messages (date du scénario ; neutres)
const SANDRINE = { nom: EQUIPE.sandrine.nom, mail: mailDe('sandrine') };
const GREGORY = { nom: EQUIPE.gregory.nom, mail: mailDe('gregory') };
const YANNICK = { nom: EQUIPE.yannick.nom, mail: mailDe('yannick') };
const DEROO = { nom: CLIENT.contact.nom, mail: CLIENT.contact.mail };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: o.a || prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const RENDRE = 'Quand tes trois parties sont envoyées, clique sur « Rendre ma copie », en haut de l’écran. Une seule remise.';
export const texteSandrine = (prenom) => `Bonjour ${prenom},\n\nje suis en congé aujourd’hui. Trois choses :\n`
  + '1. M. Deroo (Légumes de la Lys) nous envoie sa semaine : prépare ses déclarations et son solde au vendredi 29/01.\n'
  + '2. Le porteur de Halles d’Artois arrive à 9 h : contrôle-le et prépare le crédit.\n'
  + '3. Prépare la ramasse de jeudi avec les avis joints (même règle que d’habitude).\n\n'
  + `${RENDRE}\n\nSandrine`;
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, DEROO, 'Nos documents de la semaine dernière',
      'Bonjour,\n\nvous trouverez les documents de notre semaine du 25 au 29 janvier et notre relevé au 25. Pouvez-vous préparer nos déclarations '
        + 'sur le portail et me dire où en est notre compte au vendredi 29 ?\n\nCordialement,\nThomas Deroo — Responsable expéditions, Légumes de la Lys',
      { heure: '07:12', a: 'Service relation clients', extra: { pieces: [...docsDe(db || {}), 'releve-25'] } }),
    mail(prenom, SANDRINE, 'Ta journée', texteSandrine(prenom),
      { heure: '07:50', extra: { pieces: [...AVIS_IDS, 'camion', 'conditions', 'regles-credit'] } }),
  ] }),
  declencheurs: [
    { id: 'credit-recu', quand: apresFiche(FICHES.credit),
      semer: (prenom, db) => ({ mails: [mail(prenom, GREGORY, 'Bien reçu', 'Bien reçu.\n\nGrégory', { db, heure: '09:40', decalage: 1 })] }) },
    { id: 'tournee-recue', quand: apresGeste(`tournee:${TOURNEE_ID}:envoyer`),
      semer: (prenom, db) => ({ mails: [mail(prenom, YANNICK, 'Bien reçu', 'Bien reçu.\n\nYannick', { db, heure: '10:30', decalage: 1 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (16 points + 4 d'ouverture = 20 ; poids de Cowork, brief §5)
// Rien n'est vrai avant l'envoi (ou la clôture du quai) : l'inaction vaut 0. « Une erreur ne se paie qu'une fois » : le relevé est jugé sur SES
// déclarations, le crédit sur SON contrôle, la tournée sur SA tournée. Aucun `ecran` : une copie ne se corrige pas.
export const GROUPES = { compte: 'Repérer et tenir le compte', retour: 'Contrôler le retour', ramasse: 'Organiser la ramasse' };
export const POIDS = { fixes: 1, partiel: 1, 'non-mouvement': 1, colonnes: 1, solde: 2, compte: 0.375, 'autre-pool': 1.5, abimees: 1.5, credit: 1.5,
  complet: 1, reporte: 1, tient: 1, horaires: 1 };
const ok = { status: 'ok' }, attente = { status: 'attente' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });
const jalonFiche = (id, ficheId, groupe, titre, juge) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id],
  verifier(db) { const f = fiche(db, ficheId); if (!f.envoye) return attente; const r = juge(f.v, db); return r === true ? ok : ko(typeof r === 'string' ? r : undefined); } });
const jalonQuai = (id, titre, juge) => ({ id, titre, groupe: GROUPES.retour, poids: POIDS[id],
  verifier(db) { if (!quaiClos(db)) return attente; return juge(db) ? ok : ko(); } });
const jalonTournee = (id, titre, juge) => ({ id, titre, groupe: GROUPES.ramasse, poids: POIDS[id],
  verifier(db) { const T = tourneeEnvoyee(db); return T ? (juge(T.b, db) ? ok : ko()) : attente; } });
const decl = (v, role) => declaration(v, role);
const tout = (v, J, role) => { const d = decl(v, role), a = J.parRole[role].attendu; return d.type === a.type && d.part === a.part && d.qte === a.qte; };
// Une quantité de motif juste : le motif coché avec le bon nombre quand la pile en porte, aucun motif sinon.
const motifJuste = (attendu, saisi) => (attendu > 0 ? saisi === attendu : saisi === null);

export const ETAPES = [
  // Repérer et tenir le compte (6).
  jalonFiche('fixes', FICHES.decl, 'compte', 'Les deux documents fixes : type, partenaire, quantité', (v, db) => ['emission', 'transfert'].every((r) => tout(v, jeuEleve(db), r))),
  jalonFiche('partiel', FICHES.decl, 'compte', 'Le document partiel : un transfert vers son distributeur, avec les seules palettes CHEP', (v, db) => tout(v, jeuEleve(db), 'partiel')),
  jalonFiche('non-mouvement', FICHES.decl, 'compte', 'Le document sans mouvement : « Aucun mouvement CHEP »', (v) => decl(v, 'nonmvt').type === 'aucun'),
  // Le relevé, jugé sur SES lignes : la bonne colonne = la quantité (> 0) du côté du sens de la ligne, 0 de l'autre (comme ENT-9.1).
  jalonFiche('colonnes', FICHES.releve, 'compte', 'Le relevé : les quantités dans la bonne colonne, d’après tes déclarations', (v, db) => {
    const L = lignesDeclarees(db);
    if (!L.length) return 'aucun mouvement déclaré : le relevé n’a pas de ligne';
    const F = lireFeuille(FICHES.releve, BLOC_RELEVE, db);
    return L.every((l, i) => {
      const b = F.valeur(caseEntree(i)), c = F.valeur(caseSortie(i));
      const [bonne, autre] = l.sens === 'entree' ? [b, c] : [c, b];
      return Number.isFinite(bonne) && bonne > 0 && autre === 0;
    });
  }),
  // Le solde : une formule, qui vaut le départ + ses entrées − ses sorties telles qu'il les a écrites (la grille le calcule).
  jalonFiche('solde', FICHES.releve, 'compte', 'Le relevé : le solde, par une formule, juste d’après tes déclarations', (v, db) => {
    const L = lignesDeclarees(db);
    if (!L.length) return 'aucun mouvement déclaré';
    const F = lireFeuille(FICHES.releve, BLOC_RELEVE, db), ref = caseSolde(L.length);
    if (!estFormule(String(F.brut(ref) || ''))) return 'le solde est tapé à la main';
    return F.juge[ref] === 'ok' ? true : 'le solde ne vaut pas le départ + tes entrées − tes sorties';
  }),
  // Contrôler le retour (6) : le compte de chaque pile (0,375 × 4), les autres pools (1,5), les abîmées (1,5), le crédit (1,5).
  ...['P1', 'P2', 'P3', 'P4'].map((pid, k) => ({ ...jalonQuai('compte', `Le compte de la pile ${pid}`, (db) => {
    const p = pilesDeBase(db)[k];
    return constats(db, p.id).compte === comptePile(p).hauteur;
  }), id: `compte-${pid}` })),
  jalonQuai('autre-pool', 'Les palettes d’un autre pool repérées, et rien de faux ailleurs', (db) => pilesDeBase(db).every((p) => motifJuste(comptePile(p).intrus, constats(db, p.id).produit))),
  jalonQuai('abimees', 'Les palettes abîmées repérées, et rien de faux ailleurs', (db) => pilesDeBase(db).every((p) => motifJuste(comptePile(p).abimees, constats(db, p.id).avarie))),
  jalonFiche('credit', FICHES.credit, 'retour', 'Le crédit (à créditer, hors pool) et la réparation, d’après ton contrôle', (v, db) => {
    const c = creditDeSonControle(db);
    return lireNombre(v.aCrediter) === c.aCrediter && lireNombre(v.horsPool) === c.horsPool && lireNombre(v.reparation) === c.reparation;
  }),
  // Organiser la ramasse (4).
  jalonFiche('complet', FICHES.besoin, 'ramasse', 'La capacité du camion et le site à camion complet', (v) => lireNombre(v.capacite) === CAPACITE && v.complet === COMPLET),
  jalonTournee('reporte', 'Le site reporté : le dernier à avoir signalé ses vides', (b, db) => b.reportes.length === 1 && b.reportes[0] === dernierDe(db).site),
  jalonTournee('tient', 'La tournée tient dans le camion', (b) => b.retenus.length > 0 && !b.depassements.length),
  jalonTournee('horaires', 'Les horaires d’enlèvement respectés', (b) => b.retenus.length > 0 && !b.creneaux.some((c) => c.charge && c.trop === 'tard')),
];

// ─────────────────────────────────────────────────────────────── l'ordre des écrans au menu, l'accueil, les options
// `suite` ne sert qu'à ranger le groupe « Mon poste » du menu : en copie, la barre « Étape suivante » n'est pas dessinée.
export const SUITE = [
  { vue: 'fiche', libelle: 'Portail — déclarations', fait: dejaEnvoyee(FICHES.decl) },
  { vue: `fiche:${FICHES.releve}`, libelle: 'Portail — relevé du compte', fait: dejaEnvoyee(FICHES.releve) },
  { vue: 'quai', libelle: 'Quai des retours', fait: quaiClos },
  { vue: `fiche:${FICHES.credit}`, libelle: 'Crédit du retour', fait: dejaEnvoyee(FICHES.credit) },
  { vue: `fiche:${FICHES.besoin}`, libelle: 'Ramasse du jeudi', fait: dejaEnvoyee(FICHES.besoin) },
  { vue: 'tournee', libelle: 'Tournée de ramasse', fait: (db) => !!tourneeEnvoyee(db) },
];
export const MENTION = 'Réels : CHEP et son centre de service de Templemars, le fonctionnement du pool (émission, transfert déclaré par l’émetteur, '
  + 'retour), les palettes Europe hors pool, les villes de la ramasse, la carte (© contributeurs OpenStreetMap), les articles du Code civil. '
  + 'Construits : Légumes de la Lys, M. Deroo, Sandrine, Grégory, Yannick, Halles d’Artois et les autres plates-formes, Transports Lys-Escaut, le '
  + 'portail, les piles, tous les numéros, les quantités, les avis de vides, les horaires des quais, la règle de report, la capacité du camion, la '
  + 'vitesse et le temps d’enlèvement.';
export const ACCUEIL = {
  titre: 'Évaluation : la semaine de Légumes de la Lys',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Sandrine te laisse trois tâches, M. Deroo t’envoie ses documents.'],
    ['A — Le compte de Légumes de la Lys', 'Portail — déclarations, puis Portail — relevé du compte.'],
    ['B — Le retour de Halles d’Artois', 'Quai des retours, puis Crédit du retour.'],
    ['C — La ramasse du jeudi', 'Ramasse du jeudi, puis Tournée de ramasse.'],
    ['Rendre ma copie', RENDRE],
    ['Bon à savoir', MENTION],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la semaine de Légumes de la Lys',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  quai: quaiDe,
  fiches: [FICHE_DECL, FICHE_RELEVE, FICHE_CREDIT, FICHE_BESOIN],
  tournee: TOURNEE,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
// Pour le corrigé et les tests.
export { quandDit, cadreSupports, date, palettes };
