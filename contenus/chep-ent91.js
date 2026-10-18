// ENT-9.1 — CHEP, « le compte palettes » : le contenu de la séance (brief `docs/briefs/ENT-9.1-chep-compte-palettes.md`).
// Données pures (le compte, les documents tirés, les attendus) : `contenus/chep-ent91-donnees.js`. Univers commun : `contenus/chep.js`.
// Activité : `activites/chep-compte-palettes.js`. Questions : `contenus/questions/ENT-9.1.js`. Corrigé : `contenus/corriges/ENT-9.1.js`.
//
// Lundi 18 janvier 2027, 8 h 30 : l'élève, alternant au service relation clients et flux du centre CHEP de Templemars (tutrice :
// Sandrine Delattre), en GUIDAGE de C2.5, traite le message d'une cliente nouvelle, Hélène Caron (Endives du Ternois) :
//   ① lit les documents de la semaine du 11 au 15/01 (bon d'émission, bordereaux, bon de retour, commande…) ;
//   ② prépare ses déclarations sur le portail (fiche `decl` : pour chaque document, mouvement CHEP ? avec qui ? combien de palettes CHEP ?) ;
//   ③ tient le compte (fiche `releve` : une grille dont les lignes sont SES déclarations, le solde par une formule) ;
//   ④ lui répond par phrases (ce qu'elle paie, le conseil de déclaration, la formule de fin).
// Rien n'est jugé avant l'envoi ; Hélène et Sandrine reprennent ce que l'élève a écrit, sans corriger (règle du 10/10/2026).
// « Une erreur ne se paie qu'une fois » : le relevé est jugé sur SES lignes, jamais sur le solde réel.

import { apresFiche, apresMail } from '../core/declencheurs.js';
import { lireFeuille } from '../core/types/fiche.js';
import { phrasesJustes } from '../core/phrases.js';
import { estFormule } from '../core/formules.js';
import { niveauEleve } from '../core/tirage.js';
import { QUESTIONS } from './questions/ENT-9.1.js';
import { EQUIPE, CENTRE, DISTRIBUTEURS, LEXIQUE, mailDe, heureScenario, STYLE_DOCUMENTS, DOC_CONDITIONS, DOC_CHEP, DOC_DROIT,
  docBonEmission, docBordereau, docBonRetour, docCommande, docReleve, date, palettes, ech } from './chep.js';
import {
  ID, ID_VOLET, SCENARIO, CLIENT, SEMAINE, FICHES, BLOC_COMPTE, PHRASES_ID, ROLES, ROLES_BONUS, champ, TYPES, PARTENAIRES, libType, libPartenaire,
  jeuEleve, fiche, dejaEnvoyee, declaration, lignesDeclarees, caseSolde, caseEntree, caseSortie, melangeDe, lireNombre, BLOC_RELEVE, soldeDeLaFeuille,
} from './chep-ent91-donnees.js';

export { ID, SCENARIO, TIRAGE, BLOC_RELEVE, lignesReleve } from './chep-ent91-donnees.js';

// ─────────────────────────────────────────────────────────────── les documents
// Un document de l'élève, à sa place (A à G) : rendu par le gabarit de son genre. `(db) => html`.
function documentHtml(d) {
  if (!d) return '<article class="ch-doc"><p class="ch-st">Pas de document à cette place.</p></article>';
  if (d.genre === 'emission') return docBonEmission({ numero: d.numero, iso: d.iso, client: CLIENT, qte: d.qte, camion: 'tournée du matin' });
  if (d.genre === 'retour') return docBonRetour({ numero: d.numero, iso: d.iso, client: CLIENT, qte: d.qte, motif: 'surplus de campagne, palettes vides' });
  if (d.genre === 'commande') return docCommande({ numero: d.numero, iso: d.iso, client: CLIENT, qte: d.qte, livraisonIso: d.livraison });
  return docBordereau({ numero: d.numero, iso: d.iso, de: CLIENT, a: DISTRIBUTEURS[d.a], lignes: d.lignes, supports: d.supports, duplicata: !!d.duplicata });
}
const LETTRES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
export const DOCUMENTS = [
  ...LETTRES.map((l, i) => ({ id: `doc-${l}`, titre: `Document ${l.toUpperCase()}`, court: `Document ${l.toUpperCase()}`,
    html: (db) => documentHtml(jeuEleve(db).documents[i]) })),
  { id: 'releve-11', titre: 'Relevé du compte au 11/01', court: 'Relevé au 11/01',
    html: (db) => docReleve({ client: CLIENT, iso: SEMAINE.debut, solde: jeuEleve(db).s0, periode: 'Semaine du 4 au 8 janvier 2027' }) },
  DOC_CONDITIONS, DOC_CHEP, DOC_DROIT,
];
export { STYLE_DOCUMENTS };
// Les documents de l'élève (5 au socle, 7 pour un confirmé), dans son ordre.
export const docsDe = (db) => jeuEleve(db).documents.map((d) => d.id);

// ─────────────────────────────────────────────────────────────── ② la fiche « déclarations à valider » (portail clients)
const AIDE_ACCOMPAGNE = 'Regarde le cadre « Supports de charge » du document : combien de palettes CHEP ?';
export const FICHE_DECL = {
  id: FICHES.decl, libelle: 'Portail — déclarations', titre: `Portail clients CHEP — déclarations à valider — compte ${CLIENT.compte}`,
  sousTitre: 'Les documents de la semaine à gauche, un cadre par document à droite. C’est Hélène Caron qui validera.',
  documents: docsDe,
  largeurDocs: 0.9,
  serree: true,
  defile: true,   // cinq à sept cadres : la fiche défile dans sa colonne, le bouton d'envoi reste visible (comme ENT-7.1)
  bouton: 'Ouvrir le portail — déclarations',
  blocs: (db) => {
    const J = jeuEleve(db);
    const accompagne = niveauEleve(db) === 'accompagne';
    return [
      { type: 'encadre', titre: 'Pour déclarer', texte: 'Seules les palettes CHEP se déclarent.\nUne palette Europe ou d’un autre pool ne passe pas sur le compte.\n'
        + `Une commande ou un document daté après le ${date(SEMAINE.fin, { annee: true })} n’est pas encore un mouvement.` },
      ...J.documents.map((d) => ({ type: 'cadre', titre: `Document ${d.lettre}`, blocs: [
        { type: 'liste', id: champ('type', d.role), lib: 'Mouvement de palettes CHEP', vide: 'Choisir…', choix: TYPES, manque: `le mouvement du document ${d.lettre}` },
        { type: 'liste', id: champ('part', d.role), lib: 'Partenaire', vide: 'Choisir…', choix: PARTENAIRES, manque: `le partenaire du document ${d.lettre}` },
        { type: 'nombre', id: champ('qte', d.role), lib: 'Palettes CHEP', unite: 'palettes', min: 0, entier: true, manque: `les palettes CHEP du document ${d.lettre}`,
          ...(accompagne ? { consigne: AIDE_ACCOMPAGNE } : {}) },
      ] })),
    ];
  },
  envoi: { bouton: 'Préparer les déclarations pour Hélène', a: 'Hélène Caron', suite: 'Sandrine t’écrit dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── ③ le relevé du compte (bloc grille, lignes = SES déclarations)
// La grille (`BLOC_RELEVE`, `lignesReleve`) est dans les données pures : les questions au fil et le corrigé la lisent aussi.
export const FICHE_RELEVE = {
  id: FICHES.releve, libelle: 'Portail — relevé du compte', titre: `Relevé du compte ${CLIENT.compte} — semaine du 11 au 15/01/2027`,
  sousTitre: 'Une ligne par mouvement que tu as déclaré. Dernière ligne : tape « = » puis clique sur les cases.',
  documents: ['releve-11', 'conditions'],
  largeurDocs: 0.6,   // la grille a besoin de place : le relevé au 11/01 et les conditions se lisent dans une colonne plus étroite
  serree: true,
  bouton: 'Ouvrir le relevé du compte',
  // « Déjà envoyée » et non « envoyée » : une fiche rouverte par « Corriger » perd son état envoyé, le relevé resterait ouvert.
  quand: dejaEnvoyee(FICHES.decl),
  blocs: [BLOC_RELEVE],
  defile: true,   // jusqu'à sept lignes (un confirmé qui déclare tout) : la fiche défile dans sa colonne, le bouton d'envoi reste visible
  envoi: { bouton: 'Enregistrer le relevé', a: 'Sandrine', suite: 'Hélène t’écrit dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── ④ la réponse à Hélène (phrases à choisir)
// Le solde repris est CELUI DE L'ÉLÈVE (la valeur de sa case du relevé), jamais corrigé. Calculé une fois, quand le message entre dans la base.
export const soldeEleve = (db) => soldeDeLaFeuille(lireFeuille, db);
export const PAIE = [
  'Vous payez la location de ces palettes pour chaque jour où elles restent sur votre compte.',
  'Vous ne payez que les palettes que vous perdez.',
  'La location s’arrête dès que le camion quitte votre quai, même sans déclaration.',
];
export const CONSEIL = [
  'Déclarez chaque transfert dès le départ du camion, avec le nombre de palettes CHEP du bordereau.',
  'Déclarez aussi vos palettes Europe : elles comptent sur votre compte.',
  'Inutile de déclarer : CHEP compte les palettes à leur retour.',
];
export const FIN = (prenom) => [
  `Je reste à votre disposition. Bien cordialement, ${prenom} — CHEP France, Templemars`,
  `À plus, ${prenom}`,
  `Bisous, ${prenom}`,
];
export const phrasesReponse = (prenom) => ({ id: PHRASES_ID, melanger: true, lignes: [
  { id: 'salut', texte: 'Bonjour Madame Caron,' },
  { id: 'decl', texte: 'Les déclarations de la semaine sont prêtes sur le portail : il vous reste à les valider.' },
  { id: 'solde', texte: (db) => { const s = soldeEleve(db); return s == null ? `Au ${date(SEMAINE.fin)}, votre compte compte … palettes CHEP (voir le relevé).`
    : `Au ${date(SEMAINE.fin)}, votre compte compte ${palettes(s)} CHEP.`; } },
  { id: 'paie', choix: PAIE, juste: 0 },
  { id: 'conseil', choix: CONSEIL, juste: 0 },
  { id: 'fin', choix: FIN(prenom), juste: 0 },
] });

// ─────────────────────────────────────────────────────────────── les messages
const SANDRINE = { nom: EQUIPE.sandrine.nom, mail: mailDe('sandrine') };
const HELENE = { nom: CLIENT.contact.nom, mail: CLIENT.contact.mail };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: o.a || prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (de, texte = 'Bien reçu, merci.') => (prenom, nb, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `${texte}\n\n${de.nom}`, { db, decalage: 1 })] });
// Une déclaration corrigée ne rouvre pas le relevé (resté tel qu'il a été enregistré) : Sandrine le dit, sans dire si c'est juste.
const MERCI_DECL = 'Bien reçu, merci. Ton relevé, lui, reste tel que tu l’as enregistré.';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [
    mail(prenom, HELENE, 'Nos documents de la semaine dernière',
      'Bonjour,\n\nnous travaillons avec CHEP depuis le début de la campagne d’endives et je ne suis pas encore à l’aise avec les déclarations. '
        + 'Vous trouverez les documents de la semaine dernière. Pouvez-vous me préparer les déclarations à valider sur le portail, et me dire où en est '
        + 'notre compte ?\n\nBien cordialement,\nHélène Caron — Responsable logistique, Endives du Ternois',
      { heure: '08:02', a: 'Service relation clients', extra: { pieces: [...docsDe(db || {}), 'releve-11'] } }),
    mail(prenom, SANDRINE, 'Le message d’Hélène Caron',
      `Bonjour ${prenom},\n\ntu prends le message d’Hélène Caron ? C’est une nouvelle cliente. Pour chaque document, dis si c’est un mouvement de palettes CHEP, `
        + 'avec qui, et combien de palettes CHEP. Prépare ses déclarations sur le portail (c’est elle qui les validera), puis fais son relevé au '
        + 'vendredi 15 et réponds-lui.\n\nL’extrait de ses conditions de location est joint, avec le rappel du droit.\n\nSandrine',
      { heure: '08:20', extra: { pieces: ['conditions', 'droit'], ouvreFiche: FICHES.decl } }),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.decl]: merci(SANDRINE, MERCI_DECL), [FICHES.releve]: merci(SANDRINE), [PHRASES_ID]: merci(HELENE) },
  declencheurs: [
    // Les déclarations envoyées (justes ou fausses) : Sandrine passe au relevé, sans dire si c'est juste.
    { id: 'decl-recue', quand: apresFiche(FICHES.decl),
      semer: (prenom, db) => ({ mails: [mail(prenom, SANDRINE, 'Son relevé',
        `Bien. Fais maintenant son relevé au vendredi 15/01 : c’est là qu’on voit où en est son compte.\n\nSandrine`,
        { db, decalage: 3, extra: { ouvreFiche: FICHES.releve } })] }) },
    // Le relevé enregistré : Hélène attend la réponse (par phrases, le solde repris est celui de l'élève).
    { id: 'releve-recu', quand: apresFiche(FICHES.releve),
      semer: (prenom, db) => ({ mails: [mail(prenom, HELENE, 'Où en est notre compte ?',
        'Merci, j’attends vos explications : que payons-nous au fil des jours, et que dois-je faire pour les prochaines expéditions ?\n\nHélène Caron',
        { db, decalage: 5, a: 'Service relation clients', extra: { phrases: phrasesReponse(prenom) } })] }) },
    // La réponse partie : Hélène remercie, Sandrine clôt. Ni l'une ni l'autre ne dit « juste ».
    { id: 'reponse-partie', quand: apresMail({ a: HELENE.mail }),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, HELENE, 'Merci', 'Merci, je valide tout ça ce matin.\n\nHélène Caron', { db, decalage: 8, a: 'Service relation clients' }),
        mail(prenom, SANDRINE, 'C’est envoyé', `Merci ${prenom}, c’est envoyé. On en reparle demain, avec la collecte de ses plates-formes.\n\nSandrine`, { db, decalage: 9 }),
      ] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (11, pondérés : 17 + 3 de questions = 20)
// Poids fixés par Cowork sur délégation de Tristan (17/10/2026), codés tels quels (brief §5) : Repérer 8 · Mettre à jour 6 · Informer 3 ·
// questions 3 (`part`). Rien n'est vrai avant l'envoi : l'inaction vaut 0. Tout attendu est calculé sur le jeu de l'élève.
export const GROUPES = {
  reperer: '① Repérer les mouvements',
  compte: '② Mettre à jour le compte',
  informer: '③ Informer la cliente',
};
export const POIDS = { 'types-fixes': 2, partiel: 2, 'non-mouvement': 2, partenaires: 1, quantites: 1, colonnes: 3, formule: 1, solde: 2, paie: 1, conseil: 1, fin: 1 };
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = (detail) => (detail ? { status: 'ko', detail } : { status: 'ko' });
const jalonDecl = (id, groupe, titre, juste) => ({ id, titre, groupe: GROUPES[groupe], poids: POIDS[id], ecran: `fiche:${FICHES.decl}`,
  verifier(db) { const f = fiche(db, FICHES.decl); return f.envoye ? (juste(f.v, jeuEleve(db)) ? ok : ko()) : attente; } });
const jalonReleve = (id, titre, juste) => ({ id, titre, groupe: GROUPES.compte, poids: POIDS[id], ecran: `fiche:${FICHES.releve}`,
  verifier(db) { if (!fiche(db, FICHES.releve).envoye) return attente; const r = juste(db); return r === true ? ok : ko(typeof r === 'string' ? r : undefined); } });
const jalonPhrase = (id, titre, ligne) => ({ id, titre, groupe: GROUPES.informer, poids: POIDS[id], ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); return !r.envoye ? attente : (r.justes.includes(ligne) ? ok : ko()); } });
const FIXES = ['emission', 'transfert', 'retour'];
// Le solde attendu d'après les cases de la feuille (la même règle que l'attendu de la grille).
const J_attendu = (F, n, s0) => {
  const refs = [...Array(n).keys()].flatMap((i) => [caseEntree(i), caseSortie(i)]);
  const vals = refs.map((r) => F.valeur(r));
  if (vals.some((x) => x == null || !Number.isFinite(x))) return null;
  return s0 + [...Array(n).keys()].reduce((s, i) => s + F.valeur(caseEntree(i)) - F.valeur(caseSortie(i)), 0);
};
const typeJuste = (v, J, role) => declaration(v, role).type === J.parRole[role].attendu.type;
const partJuste = (v, J, role) => declaration(v, role).part === J.parRole[role].attendu.part;
const qteJuste = (v, J, role) => declaration(v, role).qte === J.parRole[role].attendu.qte;

export const ETAPES = [
  jalonDecl('types-fixes', 'reperer', 'Le type des mouvements : l’émission, le transfert simple et le retour', (v, J) => FIXES.every((r) => typeJuste(v, J, r))),
  jalonDecl('partiel', 'reperer', 'Le document partiel : un transfert, avec seulement les palettes CHEP', (v, J) => typeJuste(v, J, 'partiel') && qteJuste(v, J, 'partiel')),
  jalonDecl('non-mouvement', 'reperer', 'Le document sans mouvement : « Aucun mouvement CHEP »', (v, J) => typeJuste(v, J, 'nonmvt')),
  jalonDecl('partenaires', 'reperer', 'Les partenaires des mouvements', (v, J) => [...FIXES, 'partiel'].every((r) => partJuste(v, J, r))),
  jalonDecl('quantites', 'reperer', 'Les quantités de l’émission, du transfert simple et du retour', (v, J) => FIXES.every((r) => qteJuste(v, J, r))),
  // ② Le relevé, jugé sur SES lignes (jamais sur le solde réel). Sans aucune ligne déclarée, rien n'est « dans la bonne colonne ».
  // La bonne colonne : la quantité (> 0) du côté du sens de la ligne, 0 de l'autre. On ne rejuge pas la quantité elle-même (jalons 2 et 5),
  // et un élève qui corrige une quantité de ses déclarations après le bilan ne voit pas son relevé, resté tel quel, retomber.
  jalonReleve('colonnes', 'Le relevé : chaque quantité dans la bonne colonne, sur tes lignes', (db) => {
    const L = lignesDeclarees(db);
    if (!L.length) return 'aucun mouvement déclaré : le relevé n’a pas de ligne';
    const F = lireFeuille(FICHES.releve, BLOC_RELEVE, db);
    const faux = L.flatMap((l, i) => {
      const b = F.valeur(caseEntree(i)), c = F.valeur(caseSortie(i));
      const [bonne, autre, refBonne] = l.sens === 'entree' ? [b, c, caseEntree(i)] : [c, b, caseSortie(i)];
      return Number.isFinite(bonne) && bonne > 0 && autre === 0 ? [] : [refBonne];
    });
    return faux.length ? `À revoir : ligne${faux.length > 1 ? 's' : ''} ${faux.map((r) => r.slice(1)).join(', ')}.` : true;
  }),
  jalonReleve('formule', 'Le relevé : le solde calculé par une formule', (db) => {
    const F = lireFeuille(FICHES.releve, BLOC_RELEVE, db);
    return estFormule(String(F.brut(caseSolde(lignesDeclarees(db).length)) || '')) ? true : 'le solde est tapé à la main : il faut une formule (elle commence par « = »)';
  }),
  // Le solde juste d'après SES cases (départ + ses entrées − ses sorties, telles qu'il les a écrites) : la grille le calcule (`attendu`).
  jalonReleve('solde', 'Le relevé : le solde juste d’après tes déclarations', (db) => {
    const L = lignesDeclarees(db);
    if (!L.length) return 'aucun mouvement déclaré';
    const j = lireFeuille(FICHES.releve, BLOC_RELEVE, db).juge[caseSolde(L.length)];
    if (j === 'ok') return true;
    if (j === 'pasFormule') {
      // Un nombre tapé à la main (jalon « formule » faux) peut être juste : on le compare à ce que ses cases donnent.
      const F = lireFeuille(FICHES.releve, BLOC_RELEVE, db);
      const att = J_attendu(F, L.length, jeuEleve(db).s0);
      const v = lireNombre(F.brut(caseSolde(L.length)));
      return att != null && Number.isFinite(v) && Math.abs(v - att) < 0.01 ? true : 'le solde ne vaut pas le départ + tes entrées − tes sorties';
    }
    return 'le solde ne vaut pas le départ + tes entrées − tes sorties';
  }),
  // ③ La réponse à Hélène.
  jalonPhrase('paie', 'La réponse : ce qu’elle paie', 'paie'),
  jalonPhrase('conseil', 'La réponse : le conseil de déclaration', 'conseil'),
  jalonPhrase('fin', 'La réponse : la formule de fin', 'fin'),
  // Les cas bonus du confirmé : sans poids ni groupe, `null` quand l'élève ne les a pas reçus (caché à l'élève).
  ...ROLES_BONUS.map((role, k) => ({ id: `bonus-${k + 1}`, bonus: true, ecran: `fiche:${FICHES.decl}`, titre: `Document en plus n° ${k + 1} : « Aucun mouvement CHEP »`,
    verifier(db) {
      const d = jeuEleve(db).parRole[role];
      if (!d) return null;
      const f = fiche(db, FICHES.decl);
      return f.envoye ? (declaration(f.v, role).type === 'aucun' ? ok : ko()) : attente;
    } })),
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
const rempli = (x) => x != null && String(x).trim() !== '';
const declTouchee = (db) => { const { v } = fiche(db, FICHES.decl); return ROLES.some((r) => rempli(v[champ('type', r)])); };
export const PASTILLES = [
  { libelle: 'Lire les documents', fait: declTouchee },
  { libelle: 'Préparer les déclarations', fait: dejaEnvoyee(FICHES.decl) },
  { libelle: 'Tenir le compte', fait: dejaEnvoyee(FICHES.releve) },
  { libelle: 'Répondre à la cliente', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// L'ordre des écrans de travail (barre « Étape suivante », option `suite`, comme ENT-8.2 : la séance enchaîne deux fiches et une réponse).
export const SUITE = [
  { vue: 'mail', libelle: 'Lire les messages d’Hélène et de Sandrine', fait: (db) => (db.mails || []).filter((m) => m.folder === 'in').every((m) => m.read) },
  { vue: `fiche:${FICHES.decl}`, libelle: 'Préparer les déclarations', fait: dejaEnvoyee(FICHES.decl) },
  { vue: `fiche:${FICHES.releve}`, libelle: 'Le relevé du compte', fait: dejaEnvoyee(FICHES.releve) },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Répondre à Hélène', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = 'Réels : CHEP et son centre de service de Templemars, le fonctionnement du pool (émission, transfert déclaré par l’émetteur, retour), '
  + 'les palettes Europe hors pool, la campagne de l’endive dans les Hauts-de-France, les articles du Code civil. Construits : Endives du Ternois, '
  + 'Hélène Caron, les plates-formes, Sandrine, le portail, tous les numéros, les quantités et le prix de location.';
export const ACCUEIL = {
  titre: 'Le compte palettes',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Hélène Caron envoie les documents de la semaine, Sandrine te dit quoi faire.'],
    ['① Lire les documents', 'Dans chaque document, trouve le cadre « Supports de charge » : combien de palettes CHEP ?'],
    ['② Préparer les déclarations', 'Portail — déclarations : pour chaque document, le mouvement, le partenaire, les palettes CHEP.'],
    ['③ Tenir le compte', 'Portail — relevé : chaque quantité dans la bonne colonne, puis la formule du solde.'],
    ['④ Répondre à Hélène', 'Messagerie : réponds à son message en choisissant les phrases.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 1 : le compte palettes',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  fiches: [FICHE_DECL, FICHE_RELEVE],
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
// Pour le corrigé et les tests : l'ordre tiré des choix de phrases n'est pas rangé ici (le moteur le tire par élève : `core/phrases.js`).
export { melangeDe, ech, CENTRE };
