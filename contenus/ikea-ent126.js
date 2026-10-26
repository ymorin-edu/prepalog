// ENT-12.6 — IKEA, « l'armoire de Mme Benali » : le contenu de la séance (brief `docs/briefs/ENT-12.6-ikea-larmoire-de-mme-benali.md` ; choix de Tristan du 26/10/2026, `docs/briefs/ikea/A-TRANCHER.md`).
// Sixième séance de l'entreprise n° 12 (2de GATL, poste C : employé(e) logistique), DÉCOUVERTE de C2.2 (optimiser les préparations de commandes) et de C2.1, en guidage. Univers : `contenus/ikea.js` ;
// données : `contenus/ikea-ent126-donnees.js` ; questions : `contenus/questions/ENT-12.6.js` ; corrigé : `contenus/corriges/ENT-12.6.js` ; activité : `activites/ikea-armoire-preparation.js`.
//
// Mardi 9 mars 2027, 14 h, zone de préparation. Moussa, collègue préparateur, donne à l'élève le bon de deux commandes (celle de Mme Benali, l'armoire et le canapé, et celle d'un second client tiré
// par élève). Écrans, un par étape : Avant de commencer (non noté) → ① le bon (fiche : cocher les colis des deux commandes, pas ceux d'une autre) → ② le prélèvement (fiche : l'ordre des colis,
// les lourds et longs d'abord, les fragiles à la fin, sans aller-retour inutile) → ③ seul ou à deux ? (fiche : une ligne par colis ; consigne de site « à deux au-delà de 25 kg ou de 2 m »)
// → ④ la caisse mobile (fiche : le volume des deux commandes, et tiennent-elles ?).
//
// ÉCARTS AU BRIEF (dits à Tristan) : aucune vue nouvelle et AUCUNE demande au moteur. Le mode « préparation » du plan d'entrepôt (ENT-5.6) est fait pour monter une PALETTE mixte (film, étiquettes, hauteur,
// réapprovisionnement) : il ne sait ni « appeler un collègue » ni un volume en m³ ; les quatre étapes sont donc des FICHES (le repli prévu par le brief §7). Le parcours n'est pas dessiné : l'élève voit la
// position de chaque colis, en mètres depuis le quai, et la longueur de son parcours est calculée sur l'ordre qu'il envoie. « Appeler Moussa » est un choix de la fiche « seul ou à deux ? ». Pas de 3e
// commande bonus du confirmé. Poids (brief §5 et `A-TRANCHER.md` : préparation 8, sécurité 4, parcours 2, volume 2, questions 4) : les bons colis 4 · l'ordre de prélèvement 4 · seul ou à deux 4 ·
// parcours 2 · caisse mobile 2 · questions notées 4 (`part`) = 20. Rien n'est vrai avant l'envoi d'une fiche : l'inaction vaut 0 (l'ordre de départ est toujours faux et plus long que le seuil).

import { apresGeste, apresFiche } from '../core/declencheurs.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, STYLE_DOCUMENTS, ech, pied, lireNombre } from './ikea.js';
import { QUESTIONS } from './questions/ENT-12.6.js';
import {
  ID, ID_VOLET, FICHES, JOUR, SEUIL_KG, SEUIL_M, CAISSE_M3, MARGE_TOLERANCE, NUM_BENALI, NUM_AUTRE, aDeux, dimLib, mLib, longueurParcours, ordreValide,
  jeuDe, colisDe, ordreDepart, seuilParcours, candidats, fiche, envoyee, dejaEnvoyee, champDeux, TIRAGE,
} from './ikea-ent126-donnees.js';

export { ID, ID_VOLET, FICHES, TIRAGE } from './ikea-ent126-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const juge = (b) => (b ? ok : ko);

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}
export const EQUIPE = { moussa: { nom: 'Moussa', role: 'collègue préparateur', appel: 'Moussa', registre: 'tu' } };
const MOUSSA = { nom: 'Moussa', mail: 'moussa@cdc-gennevilliers.example' };

// ─────────────────────────────────────────────────────────────── les libellés des colis (ce que dit la fiche ; jamais « lourd » ni « à deux »)
const kgLib = (c) => `${c.kg} kg`;
const libCourt = (c) => `${c.lib} — ${kgLib(c)}, à ${c.pos} m du quai`;
const libDetail = (c) => `${c.lib} — ${kgLib(c)}, ${dimLib(c)}, à ${c.pos} m du quai`;

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; aucune couleur de repère)
const DOC_POSTE = { id: 'poste-126', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Zone de préparation du centre de distribution clients IKEA de Gennevilliers — ${ech(JOUR.lib)}, 14 h</p>
    <p>Tu travailles à la <b>préparation</b>, avec <b>Moussa</b>. Une commande de meubles est faite de gros colis. Tu les prends dans la zone, <b>dans le bon ordre</b>, avec un chariot, puis ils partent
      vers le quai : demain matin, ils seront chargés dans une <b>caisse mobile</b>, qui part par la Seine vers le port de Bercy.</p>
    <p>Le centre prépare surtout des produits <b>lourds et volumineux</b>. Aujourd’hui, tu prépares la commande de <b>Mme Benali</b> (une armoire en trois colis et un canapé en deux colis) et celle d’un autre client.</p>
    ${pied('Réels : le centre de Gennevilliers (produits lourds et volumineux), les commandes chargées en caisses mobiles vers le port de Bercy. Construits : la zone de préparation, les colis, Moussa, le second client.')}
  </article>` };
const DOC_REGLES = { id: 'regles-126', titre: 'Les règles de la zone', court: 'Les règles',
  html: `<article class="ik-doc" aria-label="Les règles de la zone de préparation">
    <p class="ik-t">Les règles de la zone de préparation</p>
    <ul class="ik-ul">
      <li><b>Le parcours.</b> Tu pars du quai, tu prends les colis, tu reviens au quai. Chaque colis est à une distance du quai, en mètres, le long de l’allée.</li>
      <li><b>L’ordre sur le chariot.</b> Les colis <b>lourds et longs</b> d’abord (ils vont en bas, ils n’écrasent rien), les colis <b>normaux</b> ensuite, les colis <b>fragiles à la fin</b> (ils vont en haut).</li>
      <li><b>Porter.</b> Consigne de la zone : un colis de <b>plus de ${SEUIL_KG} kg</b> ou de <b>plus de ${SEUIL_M} m</b> de long se porte <b>à deux</b>. Tu appelles Moussa avant de le prendre.</li>
      <li><b>La caisse mobile.</b> Elle contient <b>${CAISSE_M3} m³</b> au plus. Le volume d’un colis, c’est sa longueur × sa largeur × sa hauteur (en mètres).</li>
    </ul>
    ${pied('Consigne « à deux » CONSTRUITE pour l’exercice (plus prudente que la loi). Une seule source (L’Info durable, décembre 2022) donne 18 m³ et 13 commandes au plus par caisse mobile. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
export const DOC_DROIT = { id: 'droit-126', titre: 'Le droit : porter des charges', court: 'Le droit',
  html: `<article class="ik-doc" aria-label="Le droit : porter des charges">
    <p class="ik-t">Le droit : porter des charges</p>
    <p class="ik-st">Code du travail, port de charges</p>
    <p>L’employeur doit éviter que ses salariés portent des charges lourdes, avec des <b>aides</b> (chariot, matériel) et des consignes. Un salarié ne doit pas porter <b>de façon habituelle</b> une charge de plus de
      <b>55 kg</b> sauf si le <b>médecin du travail</b> l’a reconnu apte.</p>
    <p>Le règlement intérieur et les consignes de sécurité de l’entreprise <b>s’imposent aux salariés</b>. Une entreprise peut être plus prudente que la loi : par exemple, demander de porter à deux dès 25 kg.</p>
    ${pied('Texte reformulé (non cité mot pour mot). À relire sur Légifrance avant la classe (Code du travail, art. R4541-9). Document pédagogique, non contractuel.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, DOC_REGLES, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── les fiches
const txtBon = (db) => {
  const J = jeuDe(db);
  return `Commande ${NUM_BENALI} — Mme Benali : 1 armoire ALDA (3 colis), 1 canapé LINN (2 colis)\nCommande ${J.client.num} — ${J.client.client} : ${J.client.colis.map((c) => c.lib.split(' — ')[0]).join(', ')}`;
};
const numDe = (db, c) => (c.cmd === 'benali' ? NUM_BENALI : c.cmd === 'autre' ? NUM_AUTRE : jeuDe(db).client.num);
export const FICHE_BON = {
  id: FICHES.bon, libelle: 'Le bon de préparation', titre: 'Le bon de préparation',
  sousTitre: 'Deux commandes à préparer cet après-midi. Dans la zone, des colis de plusieurs commandes se côtoient : coche seulement ceux des DEUX commandes du bon.',
  documents: ['poste-126', 'regles-126'], defile: true,
  bouton: 'Ouvrir la fiche « Le bon de préparation »',
  blocs: (db) => [
    { type: 'encadre', titre: 'Le bon : ', texte: `\n${txtBon(db)}` },
    { type: 'cases', id: 'colis', titre: 'Les colis de la zone', choix: candidats(db).map((c) => ({ v: c.id, lib: `${libDetail(c)} — commande ${numDe(db, c)}` })) },
  ],
  envoi: { bouton: 'Envoyer le bon à Moussa', a: 'Moussa', suite: 'Moussa va te répondre.', incomplet: true },
};
export const FICHE_ORDRE = {
  id: FICHES.ordre, libelle: 'Le prélèvement', titre: 'Dans quel ordre prends-tu les colis ?',
  sousTitre: 'Tu pars du quai, tu prends les huit colis, tu reviens au quai. Remets les colis dans l’ordre du prélèvement, du premier au dernier. Les règles de la zone sont en haut.',
  documents: ['regles-126'], defile: true,
  bouton: 'Ouvrir la fiche « Le prélèvement »',
  quand: (db) => dejaEnvoyee(FICHES.bon)(db),
  blocs: (db) => [
    { type: 'ordre', id: 'ordre', titre: 'Les colis, dans l’ordre du prélèvement', consigne: 'Remets les colis dans l’ordre, du premier au dernier.',
      choix: ordreDepart(db).map((id) => { const c = colisDe(db).find((x) => x.id === id); return { v: id, lib: libCourt(c) }; }) },
  ],
  envoi: { bouton: 'Envoyer l’ordre à Moussa', a: 'Moussa', suite: 'Moussa va te répondre.' },
};
export const FICHE_DEUX = {
  id: FICHES.deux, libelle: 'Seul ou à deux ?', titre: 'Seul ou à deux ?',
  sousTitre: 'Pour chaque colis, dis si tu le portes seul ou à deux. Un colis à deux : tu appelles Moussa avant de le prendre.',
  documents: ['regles-126'], defile: true,
  bouton: 'Ouvrir la fiche « Seul ou à deux ? »',
  quand: (db) => dejaEnvoyee(FICHES.ordre)(db),
  blocs: (db) => colisDe(db).map((c) => ({ type: 'liste', id: champDeux(c.id), lib: `${c.lib} — ${kgLib(c)}, ${mLib(c.L)} m de long`, vide: 'Choisir…', manque: c.lib,
    choix: [{ v: 'seul', lib: 'Seul' }, { v: 'deux', lib: 'À deux (j’appelle Moussa)' }] })),
  envoi: { bouton: 'Envoyer à Moussa', a: 'Moussa', suite: 'Moussa va te répondre.' },
};
export const FICHE_CAISSE = {
  id: FICHES.caisse, libelle: 'La caisse mobile', titre: 'Les deux commandes tiennent-elles dans la caisse ?',
  sousTitre: `La caisse mobile contient ${CAISSE_M3} m³ au plus. Calcule le volume des huit colis (longueur × largeur × hauteur), additionne, et compare avec la place qui reste.`,
  documents: ['regles-126'], defile: true,
  bouton: 'Ouvrir la fiche « La caisse mobile »',
  quand: (db) => dejaEnvoyee(FICHES.deux)(db),
  blocs: (db) => [
    { type: 'encadre', titre: 'Les colis des deux commandes : ', texte: `\n${colisDe(db).map((c) => `${c.lib} : ${dimLib(c)}`).join('\n')}` },
    { type: 'encadre', titre: 'Dans la caisse : ', texte: `\nLa caisse contient déjà ${mLib(jeuDe(db).deja)} m³ de commandes. Sa capacité est de ${CAISSE_M3} m³.` },
    { type: 'nombre', id: 'volume', lib: 'Volume des deux commandes', unite: 'm³', min: 0, manque: 'le volume des deux commandes' },
    { type: 'choix', id: 'tient', lib: 'Les deux commandes tiennent-elles dans la caisse ?', manque: 'si elles tiennent', colonne: true,
      choix: [{ v: 'oui', lib: 'Oui, elles tiennent' }, { v: 'non', lib: 'Non, elles ne tiennent pas' }] },
  ],
  envoi: { bouton: 'Envoyer à Moussa', a: 'Moussa', suite: 'Merci, c’est noté.' },
};

// ─────────────────────────────────────────────────────────────── les jalons (16 ici + 4 de questions = 20)
export const GROUPES = { bon: 'Préparer la commande', ordre: 'Préparer la commande', deux: 'La sécurité', parcours: 'Le parcours', caisse: 'La caisse mobile' };
export const POIDS = { bon: 4, ordre: 4, deux: 4, parcours: 2, caisse: 2 };
const bonsColis = (db) => { const f = fiche(db, FICHES.bon), a = (f.valeurs.colis || []).slice().sort(), b = colisDe(db).map((c) => c.id).sort(); return a.length === b.length && a.every((x, i) => x === b[i]); };
const ordreEnvoye = (db) => { const f = fiche(db, FICHES.ordre); return f.valeurs.ordre || ordreDepart(db); };
export const ETAPES = [
  { id: 'bon-colis', titre: 'Le bon : les huit colis des deux commandes, et eux seuls', groupe: GROUPES.bon, poids: POIDS.bon, ecran: 'fiche',
    verifier(db) { return !envoyee(db, FICHES.bon) ? attente : juge(bonsColis(db)); } },
  { id: 'ordre', titre: 'Le prélèvement : les lourds et longs d’abord, les fragiles à la fin', groupe: GROUPES.ordre, poids: POIDS.ordre, ecran: `fiche:${FICHES.ordre}`,
    verifier(db) { return !envoyee(db, FICHES.ordre) ? attente : juge(ordreValide(ordreEnvoye(db), colisDe(db))); } },
  { id: 'deux', titre: 'Chaque colis lourd ou long est pris à deux', groupe: GROUPES.deux, poids: POIDS.deux, ecran: `fiche:${FICHES.deux}`,
    verifier(db) {
      if (!envoyee(db, FICHES.deux)) return attente;
      const v = fiche(db, FICHES.deux).valeurs;
      return juge(colisDe(db).every((c) => v[champDeux(c.id)] === (aDeux(c) ? 'deux' : 'seul')));
    } },
  { id: 'parcours', titre: 'Un parcours sans aller-retour inutile', groupe: GROUPES.parcours, poids: POIDS.parcours, ecran: `fiche:${FICHES.ordre}`,
    verifier(db) { return !envoyee(db, FICHES.ordre) ? attente : juge(longueurParcours(ordreEnvoye(db), colisDe(db)) <= seuilParcours(db)); } },
  { id: 'caisse', titre: 'La caisse mobile : le volume et la réponse', groupe: GROUPES.caisse, poids: POIDS.caisse, ecran: `fiche:${FICHES.caisse}`,
    verifier(db) {
      if (!envoyee(db, FICHES.caisse)) return attente;
      const v = fiche(db, FICHES.caisse).valeurs, J = jeuDe(db), n = lireNombre(v.volume);
      return juge(Number.isFinite(n) && Math.abs(n - J.total) <= MARGE_TOLERANCE && v.tient === (J.marge >= 0 ? 'oui' : 'non'));
    } },
];

// ─────────────────────────────────────────────────────────────── les messages de Moussa (au tu ; mardi 9 mars 2027, l'après-midi)
function heure(db, hhmm) {
  const [a, m, j] = JOUR.iso.split('-').map(Number);
  const [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.heure || '14:00'), from: MOUSSA.nom, fromMail: MOUSSA.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => ({ mails: [mail(prenom, 'Deux commandes à préparer',
    `Salut ${prenom} ! Moi c’est Moussa, je prépare les commandes avec toi cet après-midi. On en a deux à faire pour demain matin : celle de Mme Benali (une armoire et un canapé) et celle d’un autre client.\n\n`
      + 'Lis d’abord les documents joints. Puis ouvre la fiche « Le bon de préparation » : coche les colis des deux commandes, et seulement ceux-là.\n\nMoussa',
    { db, extra: { pieces: ['poste-126', 'regles-126'], ouvreFiche: FICHES.bon } })] }),
  declencheurs: [
    { id: 'ordre', quand: apresFiche(FICHES.bon), semer: (prenom, db) => ({ mails: [mail(prenom, 'Dans quel ordre on les prend ?',
      'Merci, j’ai ton bon. Maintenant, l’ordre : on part du quai, on prend les colis avec le chariot, et on revient au quai. Remets les colis dans l’ordre du prélèvement. Pense à la règle du chariot : '
        + 'qu’est-ce qui doit être en bas, et qu’est-ce qui doit être en haut ?\n\nMoussa', { db, heure: '14:20', extra: { ouvreFiche: FICHES.ordre } })] }) },
    { id: 'deux', quand: apresFiche(FICHES.ordre), semer: (prenom, db) => ({ mails: [mail(prenom, 'Seul ou à deux ?',
      'Bien reçu pour l’ordre. Avant de partir : certains colis ne se portent pas seul. Ouvre la fiche « Seul ou à deux ? » et dis-moi, pour chaque colis, comment tu le prends. S’il faut être deux, tu m’appelles.\n\nMoussa',
      { db, heure: '14:40', extra: { ouvreFiche: FICHES.deux } })] }) },
    { id: 'caisse', quand: apresFiche(FICHES.deux), semer: (prenom, db) => ({ mails: [mail(prenom, 'Ça tient dans la caisse ?',
      'Les colis sont prêts. Dernière question : demain matin, ils partent dans une caisse mobile, et elle est déjà en partie chargée. Calcule le volume de nos deux commandes, et dis-moi si ça tient.\n\nMoussa',
      { db, heure: '15:10', extra: { ouvreFiche: FICHES.caisse } })] }) },
    { id: 'fin', quand: apresFiche(FICHES.caisse), semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci pour cet après-midi',
      `Merci ${prenom}. Tu as vu qu’on peut préparer mieux : choisir l’ordre des colis, demander de l’aide pour les lourds, et vérifier que tout tient dans la caisse. À bientôt.\n\nMoussa`,
      { db, heure: '15:40' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── lexique, accueil, options
export const LEXIQUE_126 = {
  'bon de préparation': 'La liste de ce qu’il faut prendre pour une commande : quels articles, combien, et où.',
  'caisse mobile': 'Un grand contenant sur roues dans lequel on charge les commandes. Elle part vers le port de Bercy.',
  'chariot': 'Le petit véhicule qu’on pousse dans la zone pour transporter les colis.',
};
export const MENTION_126 = 'Réels : IKEA France et son centre de distribution clients de Gennevilliers (produits lourds et volumineux, commandes chargées en caisses mobiles vers Bercy), le port de charges dans le Code du travail (55 kg, aptitude reconnue par le médecin du travail ; reformulé). '
  + 'Construits : la zone de préparation, les colis (poids, dimensions, positions), la consigne « à deux au-delà de 25 kg ou de 2 m », le volume déjà chargé dans la caisse, Moussa, le second client. Une seule source donne 18 m³ par caisse mobile.';
export const ACCUEIL = {
  titre: 'L’armoire de Mme Benali',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Moussa', 'Menu Messagerie : deux documents sont joints.'],
    ['① Le bon de préparation', 'Coche les colis des deux commandes du bon, et eux seuls.'],
    ['② Le prélèvement', 'Remets les colis dans l’ordre : les lourds et longs d’abord, les fragiles à la fin, sans aller-retour inutile.'],
    ['③ Seul ou à deux ?', 'Pour chaque colis, dis comment tu le portes.'],
    ['④ La caisse mobile', 'Calcule le volume des deux commandes : tiennent-elles dans la caisse ?'],
    ['Bon à savoir', MENTION_126],
  ],
};
export const SUITE = [
  { vue: 'fiche', libelle: 'Le bon de préparation', fait: dejaEnvoyee(FICHES.bon) },
  { vue: `fiche:${FICHES.ordre}`, libelle: 'Le prélèvement', fait: dejaEnvoyee(FICHES.ordre) },
  { vue: `fiche:${FICHES.deux}`, libelle: 'Seul ou à deux ?', fait: dejaEnvoyee(FICHES.deux) },
  { vue: `fiche:${FICHES.caisse}`, libelle: 'La caisse mobile', fait: dejaEnvoyee(FICHES.caisse) },
];
export const OPTIONS = {
  suite: SUITE,
  menu: [],
  exercice: 'L’armoire de Mme Benali',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_126,
  equipe: EQUIPE,
  questions: QUESTIONS,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_BON, FICHE_ORDRE, FICHE_DEUX, FICHE_CAISSE],
  // Le bon est le premier travail ; l'ordre s'ouvre après le bon, « seul ou à deux » après l'ordre, la caisse après les portages.
  fermetures: {
    [`fiche:${FICHES.ordre}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.bon)(db), message: 'Après « Le bon de préparation »' },
    [`fiche:${FICHES.deux}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.ordre)(db), message: 'Après « Le prélèvement »' },
    [`fiche:${FICHES.caisse}`]: { ouvertSi: (db) => dejaEnvoyee(FICHES.deux)(db), message: 'Après « Seul ou à deux ? »' },
  },
};
