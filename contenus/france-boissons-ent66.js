// ENT-6.6 — France Boissons, « inventaire tournant à la voix » : les données de la séance (brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`,
// poids validés par Tristan le 12/10/2026 ; moteur : chantier D-6, lots 1 à 4).
// Univers commun : `contenus/france-boissons.js`. Plan de masse et stock d'avant : `contenus/france-boissons-ent65-donnees.js` (le rangement d'avant).
// Activité : `activites/france-boissons-inventaire.js`. Questions : `contenus/questions/ENT-6.6.js`. Corrigé : `contenus/corriges/ENT-6.6.js`.
//
// L'élève, en renfort au quai (jeudi 17 juin 2027, 7 h), préparateur, premier temps (guidage) de C1.6 :
//   0. « Le matériel » : le terminal vocal, un écran, non noté ;
//   1. « Zone de masse » : compter à l'aveugle les 7 lignes du terminal (codes de contrôle, comptages) ; point d'étape avec Nadia et Inès ;
//   2. « Inventaire » (ouvert quand le comptage est fini) : écarts à calculer, une décision par ligne en écart, valider ;
//   3. « Compte rendu » (visible quand l'inventaire est validé) : vides × 40 €, taux de fiabilité, envoyé à Nadia ; Nadia répond.
//
// Les valeurs attendues sont CALCULÉES (`france-boissons-ent66-donnees.js`) : comptages depuis le stock déclaré, stock du logiciel depuis le
// rangement d'ENT-6.5, compte rendu depuis les comptages DE L'ÉLÈVE (pas de double peine).

import { etapesEntrepot, comptagesTerminal, comptageFini } from '../core/types/entrepot.js';
import { bilanInventaire } from '../core/types/inventaire.js';
import { ficheEnvoyee, lireNombre } from '../core/types/fiche.js';
import { apresFiche } from '../core/declencheurs.js';
import { QUESTIONS } from './questions/ENT-6.6.js';
import { EQUIPE, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';
import { ID, PLAN_ID, INV_ID, FICHE_ID, ID_VOLET, SCENARIO, MATERIEL, CODES, LIGNES, SYSTEME, STOCK_JEUDI, PLAN, INVENTAIRE as INV_DONNEES,
  MOTIFS, CONSIGNE_FUT, attenduCompteRendu, GROUPES, POIDS } from './france-boissons-ent66-donnees.js';
export { ID, PLAN_ID, INV_ID, FICHE_ID, ID_VOLET, SCENARIO, MATERIEL, CODES, LIGNES, SYSTEME, STOCK_JEUDI, PLAN, MOTIFS, attenduCompteRendu, GROUPES, POIDS };

const NADIA = { nom: EQUIPE.nadia.nom, mail: mailDe('nadia') };

// Les comptages de l'élève, seulement quand le terminal est allé au bout (avant : null, l'écran Inventaire attend).
export const comptesEleve = (db) => (comptageFini(db, PLAN) ? comptagesTerminal(db, PLAN) : null);
export const INVENTAIRE = Object.assign({}, INV_DONNEES, { comptages: comptesEleve });
const bilan = (db) => bilanInventaire(db || {}, INVENTAIRE, null);
export const inventaireValide = (db) => bilan(db).valide;

// ─────────────────────────────────────────────────────────────── étape 3 : le compte rendu (brief §4, étape 3)
export const FICHE = {
  id: FICHE_ID,
  libelle: 'Compte rendu',
  titre: 'Compte rendu d’inventaire — jeudi 17 juin',
  sousTitre: 'Pour Nadia, cheffe de quai.',
  documents: ['mon-inventaire', 'mots'],
  quand: inventaireValide,
  blocs: [
    { type: 'encadre', titre: 'Pourquoi on compte les vides', texte: 'Un fût vide n’est pas un déchet : il retourne à la brasserie, il est lavé et rempli '
      + 'de nouveau, une cinquantaine de fois en 15 ans. C’est du <b>réemploi</b>.<br>Chaque fût vide vaut aussi <b>40 € de consigne</b>. '
      + 'Un vide perdu, c’est de l’argent perdu et un fût à refabriquer.' },
    { type: 'cadre', titre: 'Les vides', blocs: [
      { type: 'nombre', id: 'vides-futs', lib: 'Fûts vides manquants', unite: 'fûts', min: 0, entier: true, manque: 'les fûts vides manquants' },
      { type: 'nombre', id: 'vides-euros', lib: `Consigne perdue (fûts × ${CONSIGNE_FUT} €)`, unite: '€', min: 0, entier: true, manque: 'la consigne perdue' },
    ] },
    { type: 'encadre', titre: 'Le taux de fiabilité', texte: 'Une ligne est juste quand le compté = le théorique.<br>'
      + 'Taux = lignes justes ÷ lignes comptées × 100.<br>Plus il est proche de 100 %, plus on peut croire le logiciel.' },
    { type: 'cadre', titre: 'La fiabilité', blocs: [
      { type: 'nombre', id: 'lignes-justes', lib: `Lignes justes (sur ${LIGNES.length} comptées)`, unite: 'lignes', min: 0, entier: true, manque: 'les lignes justes' },
      { type: 'nombre', id: 'taux', lib: 'Taux de fiabilité (arrondi à l’unité)', unite: '%', min: 0, entier: true, manque: 'le taux de fiabilité' },
    ] },
  ],
  envoi: { bouton: 'Envoyer à Nadia', a: 'Nadia' },
};

// ─────────────────────────────────────────────────────────────── les messages
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || '07:00', { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });

export const SUJET_ARRIVEE = 'On compte avant le week-end';
export const TEXTE_ARRIVEE = (prenom) => `Bonjour ${prenom} !\n\n`
  + 'Avant le week-end de la Fête, on compte ce qui part demain chez nos clients, et les vides.\n\n'
  + 'Prends le [[terminal vocal]] : il te dit où aller. Ne regarde pas le stock du logiciel, compte ce que tu vois.\n\nNadia';
export const TEXTE_MERCI = (prenom) => `Merci ${prenom}. Je préviens Karim pour les vides : on vérifiera les bons de reprise de la semaine.\n\n`
  + 'Cet après-midi, tu prépares la commande de Malo avec le même terminal.\n\nNadia';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [mail(prenom, NADIA, SUJET_ARRIVEE, TEXTE_ARRIVEE(prenom), { heure: '06:55' })] }),
  declencheurs: [
    // La fiche envoyée (juste ou fausse) : Nadia remercie, sans dire si c'était juste ; transition vers ENT-6.7.
    { id: 'merci', quand: apresFiche(FICHE_ID),
      semer: (prenom, db) => ({ mails: [mail(prenom, NADIA, 'RE : le compte rendu d’inventaire', TEXTE_MERCI(prenom), { db, decalage: 3 })] }) },
  ],
  corrections: {
    [FICHE_ID]: (prenom, n, db) => ({ mails: [mail(prenom, NADIA, 'RE : le compte rendu d’inventaire', `Bien reçu, merci ${prenom}.\n\nNadia`, { db, decalage: 3 })] }),
  },
};

// ─────────────────────────────────────────────────────────────── les documents
const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;
const signe = (n) => (n > 0 ? `+${n}` : String(n).replace('-', '−'));

// L'inventaire de l'élève, une fois VALIDÉ (avant : rien, surtout pas le stock du logiciel) : ses comptages et le stock du logiciel,
// pour compter les lignes justes. Aucune marque juste / faux.
const docMonInventaire = (db) => {
  const b = bilan(db);
  if (!b.valide) {
    return `<article class="fb6-doc" aria-label="Mon inventaire"><p class="fb-t">Mon inventaire</p>
      <p data-mon-inv-attente>Ce document se remplit quand ton inventaire est validé (menu Inventaire).</p></article>`;
  }
  return `<article class="fb6-doc" aria-label="Mon inventaire">
    <p class="fb-t">Mon inventaire — ${ech(INV_ID)}, validé</p>
    <p class="fb-st">Ce que tu as compté au terminal, et le stock du logiciel</p>
    <table class="fb6-table" data-mon-inv>
      <thead><tr><th scope="col">Couloir</th><th scope="col">Référence</th><th scope="col">Compté</th><th scope="col">Logiciel</th><th scope="col">Écart</th></tr></thead>
      <tbody>${b.lignes.map((l) => `<tr><td>${ech(l.emplacement)}</td><td>${ech(l.designation)}</td><td>${l.premier == null ? '—' : l.premier}</td>`
        + `<td>${l.systeme}</td><td>${l.ecartPremier == null ? '—' : signe(l.ecartPremier)}</td></tr>`).join('')}</tbody>
    </table>
    ${PIED('Inventaire')}
  </article>`;
};

const docMots = () => `<article class="fb6-doc" aria-label="Mots de l’inventaire">
    <p class="fb-t">Mots de l’inventaire</p>
    <table class="fb6-table"><tbody>
      <tr><th scope="row">Inventaire tournant</th><td>On compte une partie du stock à la fois, souvent le matin, avant les flux.</td></tr>
      <tr><th scope="row">Compter à l’aveugle</th><td>Compter ce qu’on voit, sans regarder le chiffre du logiciel.</td></tr>
      <tr><th scope="row">Stock théorique</th><td>Le stock que le logiciel croit avoir.</td></tr>
      <tr><th scope="row">Écart</th><td>Écart = compté − théorique. Négatif : il en manque.</td></tr>
      <tr><th scope="row">Régulariser</th><td>Corriger le stock du logiciel, avec un motif.</td></tr>
      <tr><th scope="row">Taux de fiabilité</th><td>Lignes justes ÷ lignes comptées × 100.</td></tr>
    </tbody></table>
    ${PIED('Aide-mémoire')}
  </article>`;

// Les textes de loi des questions. Code du travail L1222-3 et L1222-4 relus le 12/10/2026 sur code.travail.gouv.fr ; Code de commerce
// L123-12 (al. 2), Code de l'environnement L541-1-1 (définition du réemploi) et arrêté du 6 février 2026 (art. 1er, 4° et 11°) relus sur
// Légifrance le 13/10/2026 (versions en vigueur).
const art = (code, num, texte) => `<p class="fb-st" style="margin-top:14px">${code}, ${num}</p>${texte}`;
const docDroit = () => `<article class="fb6-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : inventaire, consigne, réemploi, information du salarié</p>
    ${art('Code de commerce', 'article L123-12 (alinéa 2)', '<p>« Elle doit contrôler par inventaire, au moins une fois tous les douze mois, '
      + 'l’existence et la valeur des éléments actifs et passifs du patrimoine de l’entreprise. »</p>')}
    ${art('Code de l’environnement', 'article L541-1-1 (extrait)', '<p>Réemploi : « toute opération par laquelle des substances, matières ou produits '
      + 'qui ne sont pas des déchets sont utilisés de nouveau pour un usage identique à celui pour lequel ils avaient été conçus ».</p>')}
    ${art('Arrêté du 6 février 2026', 'consignation des emballages (en vigueur le 1er janvier 2027)', '<p>Article 1er (extrait) : « 4° Fûts d’une contenance égale ou supérieure à 20 litres : <b>40 euros</b> ; […] 11° Casiers à trous : '
      + '<b>4 euros</b>. »</p>')}
    ${art('Code du travail', 'article L1222-3', '<p>« Le salarié est expressément informé, préalablement à leur mise en oeuvre, des méthodes et '
      + 'techniques d’évaluation professionnelles mises en oeuvre à son égard.</p><p>Les résultats obtenus sont confidentiels.</p>'
      + '<p>Les méthodes et techniques d’évaluation des salariés doivent être pertinentes au regard de la finalité poursuivie. »</p>')}
    ${art('Code du travail', 'article L1222-4', '<p>« Aucune information concernant personnellement un salarié ne peut être collectée par un '
      + 'dispositif qui n’a pas été porté préalablement à sa connaissance. »</p>')}
    <p class="fb-pied">Textes réels — sources : Code du travail (code.travail.gouv.fr), Code de commerce, Code de l’environnement ; arrêté du 6 février 2026, Journal officiel du 26 février 2026 (Légifrance)</p>
  </article>`;

export const DOCUMENTS = [
  { id: 'mots', titre: 'Mots de l’inventaire', court: 'Mots de l’inventaire', html: docMots() },
  { id: 'mon-inventaire', titre: 'Mon inventaire', court: 'Mon inventaire', html: docMonInventaire },
  { id: 'droit', titre: 'Le droit : inventaire, consigne, réemploi, information du salarié', court: 'Le droit', html: docDroit() },
  DOC_ANNUAIRE,
];

export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb6-doc{padding:14px 18px 0}
.fb6-doc p{margin:0 0 8px}
.fb6-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb6-table th, .fb6-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb6-table th{color:var(--douce); font-weight:600}
`;

// ─────────────────────────────────────────────────────────────── les jalons
const attente = { status: 'attente' }, ok = { status: 'ok' };
const ko = (detail) => ({ status: 'ko', ...(detail ? { detail } : {}) });

// Jalons 1 à 5 : le terminal (rien n'est jugé avant la dernière ligne ; une ligne non comptée est fausse).
const jalonsComptage = etapesEntrepot(PLAN).map((e) => ({ ...e, groupe: GROUPES.compter, poids: POIDS[e.id] }));

// Jalons 6 à 8 : l'écran Inventaire, jugé à la validation (définitive). L'écart attendu est celui des comptages DE L'ÉLÈVE.
const jalonInv = (id, titre, juger) => ({ id, titre, groupe: GROUPES.decider, poids: POIDS[id],
  verifier(db) { const b = bilan(db); return b.valide ? juger(b) : attente; } });
const decision = (cle) => (b) => {
  const l = b.lignes.find((x) => x.cle === cle);
  if (l && l.juste) return ok;
  return ko(l && l.action ? 'décision à revoir' : 'aucune décision : pas d’écart sur ton comptage');
};

// Jalons 9 et 10 : la fiche, comparée à ce que l'élève a LUI-MÊME compté.
const jalonFiche = (id, titre, juger) => ({ id, titre, groupe: GROUPES.compteRendu, poids: POIDS[id], ecran: 'fiche',
  verifier(db) {
    const f = ficheEnvoyee(db, FICHE_ID);
    if (!f.envoye) return attente;
    return juger(f.valeurs || {}, attenduCompteRendu(comptagesTerminal(db, PLAN)));
  } });

export const ETAPES = [
  ...jalonsComptage,
  jalonInv('ecarts', 'Les 7 écarts calculés', (b) => (b.ecartsOk ? ok : ko('au moins un écart est faux'))),
  jalonInv('decision-M04', 'M04 : la bonne décision', decision('M04')),
  jalonInv('decision-M01', 'M01 : la bonne décision', decision('M01')),
  jalonFiche('vides-euros', 'Compte rendu : les vides manquants et leur consigne', (v, a) => {
    const F = [];
    if (lireNombre(v['vides-futs']) !== a.videsManquants) F.push('fûts manquants');
    if (lireNombre(v['vides-euros']) !== a.euros) F.push('consigne perdue');
    return F.length ? ko(`à revoir : ${F.join(', ')}`) : ok;
  }),
  jalonFiche('taux', 'Compte rendu : le taux de fiabilité', (v, a) => (lireNombre(v.taux) === a.taux ? ok : ko('taux à revoir'))),
];

// ─────────────────────────────────────────────────────────────── le lexique et l'accueil
export const MENTION = 'Réels : France Boissons (filiale de Heineken), sa plateforme de Buchelay (Yvelines) et sa préparation de commandes à la voix '
  + '(depuis 2014), le principe de l’inventaire tournant, la consigne de 40 € par fût (arrêté du 6 février 2026), le réemploi des fûts (une '
  + 'cinquantaine d’usages en 15 ans, chiffres de 2014) et les textes de loi. Construit : l’inventaire à la voix, Nadia, les codes de contrôle, le '
  + 'stock, les écarts et leurs causes, l’heure et tous les messages. 8 fûts sur une palette de rétention : règle de l’exercice. '
  + 'Dessins — scène construite, ce n’est pas la plateforme de Buchelay.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  inventaire: 'Compter ce qui est vraiment en stock et le comparer à ce que dit le logiciel.',
  'inventaire tournant': 'On compte une partie du stock à la fois (quelques références), souvent le matin avant les flux, au lieu de tout compter une fois par an.',
  'compter à l’aveugle': 'Compter ce qu’on voit, sans connaître le chiffre du logiciel : on n’est pas influencé.',
  'stock théorique': 'Le stock que le logiciel croit avoir, d’après les entrées et les sorties saisies.',
  écart: 'Différence entre ce qu’on a compté et le stock théorique : écart = compté − théorique. Négatif : il en manque.',
  régulariser: 'Corriger le stock du logiciel pour qu’il dise ce qui est vraiment là, avec un motif.',
  motif: 'La raison d’une régularisation : casse, vides manquants, erreur de réception…',
  'zone litiges': 'Zone de la plateforme où l’on met de côté ce qui est abîmé ou contesté, le temps de régler le problème.',
  'fût vide': 'Fût rendu par un client après usage. Il est consigné : il retourne à la brasserie pour être lavé et rempli de nouveau.',
  réemploi: 'Utiliser de nouveau un objet pour le même usage, sans en faire un déchet (un fût lavé puis rempli de nouveau).',
  'taux de fiabilité': 'Lignes justes ÷ lignes comptées × 100. Plus il est proche de 100 %, plus on peut croire le logiciel.',
  'terminal vocal': 'Petit appareil porté à la ceinture, avec un casque et un micro : il dit où aller et quoi faire ; on lui répond à voix haute.',
  'code de contrôle': 'Nombre écrit sur le panneau d’un emplacement : on le donne au terminal pour prouver qu’on est au bon endroit.',
  'palette de rétention': 'Palette en plastique avec un bac sous une grille : si un fût fuit, le liquide reste dans le bac.',
});
export const ACCUEIL = {
  titre: 'Inventaire tournant',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Nadia', 'Menu Messagerie : on compte ce qui part demain, et les vides.'],
    ['Le matériel', 'Menu Le matériel : le [[terminal vocal]].'],
    ['Compter', 'Menu Zone de masse : le terminal te dit où aller ; compte et réponds, ligne par ligne.'],
    ['Écarts et décisions', 'Menu Inventaire : calcule chaque écart, cherche sa cause, décide, puis valide.'],
    ['Rendre compte', 'Menu Compte rendu : les vides et le taux de fiabilité, puis envoie à Nadia.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 6 : inventaire tournant',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  animations: [MATERIEL],
  entrepot: PLAN,
  inventaire: INVENTAIRE,
  fiche: FICHE,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
