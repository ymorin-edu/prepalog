// ENT-6.10 — France Boissons, « le retour de Lucas » : le contenu de la séance (brief `docs/briefs/ENT-6.10-france-boissons-retour.md`,
// maquette validée par Tristan le 13/10/2026). Données pures (ticket, comptes, attendus) : `contenus/france-boissons-ent610-donnees.js`.
// Univers commun : `contenus/france-boissons.js`. Activité : `activites/france-boissons-retour.js`. Questions :
// `contenus/questions/ENT-6.10.js`. Corrigé : `contenus/corriges/ENT-6.10.js`.
//
// Vendredi 18 juin 2027, 17 h : Lucas est rentré au quai 14 avec les vides de la côte. L'élève, agent d'exploitation (tuteur : Karim),
// en ENTRAÎNEMENT d'OTM-C2.3 et en DÉCOUVERTE de LOG-C2.5 (premier et seul temps en 2de : les aides de la feuille restent visibles) :
//   ① contrôle les vides de Malo au quai (dessin à compter, ticket signé à vérifier) ;
//   ② tient le compte de consignes de Malo dans une feuille de calcul (avec SES comptes ; formules exigées) ;
//   ③ prévient Malo et Inès par phrases à choisir (jugées sur le réel : c'est ce qui part chez le client et à la facturation) ;
//   ④ regarde la boucle des vides (animation à deux questions) puis chiffre ce que rapporte un fût qui revient.
// Rien n'est jugé avant l'envoi ; aucun message ne dit si c'était juste (alerte 28).

import { apresFiche, apresMail, tous } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { ficheEnvoyee, lireFeuille } from '../core/types/fiche.js';
import { etapesAnimation, reponseAnimation } from '../core/types/animation.js';
import { QUESTIONS } from './questions/ENT-6.10.js';
import { EQUIPE, EXTERIEURS, LEXIQUE as LEXIQUE_FB, mailDe, heureScenario, CABANE, CONSIGNES, DOC_ORGANIGRAMME, DOC_ANNUAIRE,
  STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';
import {
  ID, ID_VOLET, SCENARIO, ANIM, FICHE_CONTROLE, FICHE_COMPTE, FICHE_CHIFFRAGE, BLOC_COMPTE, BLOC_CHIFFRAGE, MSG_MALO, MSG_INES, CLE_MALO, CLE_INES,
  NUMERO_TICKET, LIVRAISON, LIVRES, VIDES_TICKET, AU_QUAI, CHOIX_TICKET, TICKET_JUSTE, AVANT, REEL, comptesEleve,
  lignesCompte, CASES_COMPTE, FUT_BOUTEILLE, lignesChiffrage, CASES_CHIFFRAGE,
} from './france-boissons-ent610-donnees.js';

export { ID, SCENARIO };

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;
const euros = (n) => `${new Intl.NumberFormat('fr-FR').format(Math.abs(n))} €`;
const pl = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const HEINEKEN = LIVRAISON.find((l) => l.refuse);

// ─────────────────────────────────────────────────────────────── les documents
// Le dessin du quai (Cowork, 06/10/2026) : le texte de remplacement ne donne aucun nombre.
const DOC_QUAI = { id: 'quai', titre: 'Le quai 14 : les emballages rapportés de chez Malo', court: 'Le quai',
  image: { src: './contenus/images/france-boissons/quai-retour-vides.svg',
    alt: 'Le quai : l’arrière du camion de Lucas, rideau ouvert, et au sol les emballages rapportés de chez Malo, à compter. Au fond, '
      + 'grisés, les vides des autres clients.',
    mention: 'Dessin — document pédagogique, reconstitution. Clique sur le dessin pour l’agrandir.' } };

// Le ticket imprimé par le terminal de Lucas (reconstitution). « (repris de la commande) » : petit et gris, l'indice de la cause.
const docTicket = () => `<article class="fb10-ticket" aria-label="Le ticket de livraison et de reprise">
    <div class="fb10-tt"><span>FRANCE BOISSONS — Plateforme de Buchelay</span><b>[[ticket de livraison|TICKET DE LIVRAISON ET DE REPRISE]]</b></div>
    <p class="fb10-l">N° ${NUMERO_TICKET} · Tournée de la côte · T1 · chauffeur : Lucas · vendredi 18/06/2027</p>
    <p class="fb10-l">Client : ${ech(CABANE.nom)} — Villers-sur-Mer · n° client ${ech(CABANE.numero)}</p>
    <table class="fb10-t">
      <thead><tr><th scope="col">LIVRAISON</th><th scope="col">Commandé</th><th scope="col">Livré</th><th scope="col">[[non-livré|Non livré]] (motif)</th></tr></thead>
      <tbody>${LIVRAISON.map((l) => `<tr data-ligne="${l.article}"><td>${ech(l.court)}</td><td class="n">${l.commande}</td><td class="n">${l.livre}</td>
        <td>${l.refuse ? `${l.refuse} — ${ech(l.motif)}` : ''}</td></tr>`).join('')}</tbody>
    </table>
    <table class="fb10-t">
      <thead><tr><th scope="col" colspan="3">EMBALLAGES REPRIS</th></tr></thead>
      <tbody>
        <tr data-repris="futs"><td>Fûts vides</td><td class="n">${VIDES_TICKET.futs}</td><td class="fb10-gris">(repris de la commande)</td></tr>
        <tr data-repris="casiers"><td>Casiers vides</td><td class="n">${VIDES_TICKET.casiers}</td><td class="fb10-gris">(repris de la commande)</td></tr>
      </tbody>
    </table>
    <p class="fb10-sig"><span>Signature du client : Malo ✍</span><span>Signature du chauffeur : Lucas ✍</span></p>
    ${PIED('Ticket imprimé par le terminal du chauffeur')}
  </article>`;

const docClient = () => `<article class="fb10-doc" aria-label="Fiche client">
    <p class="fb-t">Fiche client — ${ech(CABANE.nom)}</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · n° client ${ech(CABANE.numero)}</p>
    <dl class="fb10-dl">
      <dt>Client</dt><dd>${ech(CABANE.nom)} — ${ech(CABANE.type)}, ${ech(CABANE.ville)}</dd>
      <dt>Livraison</dt><dd>[[tournée|Tournée]] de la côte, le vendredi</dd>
      <dt>[[emballage consigné|Emballages consignés]] chez le client avant la tournée du 18 juin</dt>
      <dd><b>${pl(AVANT.futs, 'fût')}, ${pl(AVANT.casiers, 'casier')}</b></dd>
    </dl>
    ${PIED('Fiche client')}
  </article>`;

const docConditions = () => `<article class="fb10-doc" aria-label="Conditions de vente CHR">
    <p class="fb-t">Conditions de vente [[CHR]] (extrait)</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay</p>
    <ul class="fb10-ul">
      <li>[[consigne|Consigne]] : <b>${CONSIGNES.fut} € par fût</b> et <b>${CONSIGNES.casier} € par casier</b> (taux fixés par l’arrêté du 6 février 2026,
        en vigueur depuis le 1er janvier 2027).</li>
      <li>La consigne est facturée à la livraison des pleins ; chaque vide rendu est [[déconsigne|déconsigné]] : un [[avoir]] sur la facture.</li>
      <li>[[vides|Vides]] : repris par le chauffeur à la livraison, comptés sur le ticket signé par le client.</li>
      <li>Un article refusé à la livraison n’est pas facturé.</li>
    </ul>
    ${PIED('Conditions de vente')}
  </article>`;

const docFutBouteille = () => `<article class="fb10-doc" aria-label="Un fût, une bouteille">
    <p class="fb-t">Un fût, une bouteille</p>
    <p class="fb-st">Ce qu’il faut pour chiffrer le [[réemploi]] d’un fût</p>
    <ol class="fb10-ol">${FUT_BOUTEILLE.map((x) => `<li>${ech(x.lib)} : <b>${ech(x.ecrit)}</b></li>`).join('')}</ol>
    <p class="fb10-src">Sources : Conseil national de l’emballage (2014 : 53,5 utilisations en 15 ans, arrondi à 53) ; fiche d’un fabricant
      de fûts (fût Euro 30 L, 9,5 kg vide) ; fiche d’un vendeur de bouteilles (33 cl, 225 g vide).</p>
  </article>`;

// Textes de loi : C. civ. 1103 (texte court, connu) ; C. env. L541-1-1 et C. trav. L1222-4 repris d'ENT-6.6 (relus le 12/10/2026,
// L541-1-1 d'après des sources concordantes, Légifrance bloqué : à relire avant ouverture) ; arrêté du 6 février 2026 : montants
// seulement (texte non relu, comme en 6.2 et 6.6).
const art = (code, num, texte) => `<p class="fb-st" style="margin-top:14px">${code}, ${num}</p>${texte}`;
const docDroit = () => `<article class="fb10-doc" aria-label="Le droit">
    <p class="fb-t">Le droit : consigne, contrat, réemploi, information du salarié</p>
    ${art('Arrêté du 6 février 2026', 'consignation des emballages (en vigueur le 1er janvier 2027)', '<p>Montant de la consigne : '
      + '<b>40 €</b> par fût de 20 à 50 litres, <b>4 €</b> par casier.</p>')}
    ${art('Code civil', 'article 1103', '<p>« Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. »</p>')}
    ${art('Code de l’environnement', 'article L541-1-1 (extrait)', '<p>Réemploi : « toute opération par laquelle des substances, matières ou produits '
      + 'qui ne sont pas des déchets sont utilisés de nouveau pour un usage identique à celui pour lequel ils avaient été conçus ».</p>')}
    ${art('Code du travail', 'article L1222-4', '<p>« Aucune information concernant personnellement un salarié ne peut être collectée par un '
      + 'dispositif qui n’a pas été porté préalablement à sa connaissance. »</p>')}
    <p class="fb-pied">Textes réels — sources : Code civil, Code de l’environnement, Code du travail (code.travail.gouv.fr) ; montants de l’arrêté d’après la FNB</p>
  </article>`;

export const DOCUMENTS = [
  DOC_QUAI,
  { id: 'ticket', titre: `Le ticket de Lucas — n° ${NUMERO_TICKET}`, court: 'Le ticket', html: docTicket() },
  { id: 'fiche-client', titre: `Fiche client — ${CABANE.nom}`, court: 'Fiche client', html: docClient() },
  { id: 'conditions', titre: 'Conditions de vente CHR (extrait)', court: 'Conditions de vente', html: docConditions() },
  { id: 'fut-bouteille', titre: 'Un fût, une bouteille', court: 'Un fût, une bouteille', html: docFutBouteille() },
  { id: 'droit', titre: 'Le droit : consigne, contrat, réemploi', court: 'Le droit', html: docDroit() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

// Tout à l'encre du papier, aucune couleur de repère ; le ticket en chasse fixe, comme un ticket imprimé.
export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb10-doc{padding:14px 18px 0}
.fb10-doc p{margin:0 0 8px}
.fb10-dl{display:grid; grid-template-columns:170px 1fr; gap:6px 12px; margin:6px 0 0; font-size:.9rem}
.fb10-dl dt{color:var(--douce)}
.fb10-dl dd{margin:0}
.fb10-ul, .fb10-ol{margin:6px 0 0; padding-left:20px; font-size:.92rem}
.fb10-ul li, .fb10-ol li{margin:5px 0}
.fb10-src{margin-top:12px !important; font-size:.78rem; color:var(--douce)}
.fb10-ticket{padding:10px 12px 0; font-size:.8rem; line-height:1.35}
.fb10-tt{display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px 12px; border-bottom:1px dashed var(--filet); padding-bottom:6px; margin-bottom:6px}
.fb10-l{margin:0 0 3px}
.fb10-t{border-collapse:collapse; width:100%; margin:8px 0 2px}
.fb10-t th{text-align:left; font-weight:700; border-bottom:1px dashed var(--filet); padding:3px 4px}
.fb10-t td{padding:2px 4px; vertical-align:top}
.fb10-t .n{text-align:right; width:4.2em; white-space:nowrap}
.fb10-t th:not(:first-child), .fb10-t td:first-child{white-space:nowrap}
.fb10-gris{color:var(--douce); font-size:.72rem}
.fb10-sig{display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px 12px; margin:10px 0 0; border-top:1px dashed var(--filet); padding-top:6px}
`;

// ─────────────────────────────────────────────────────────────── ④ la boucle des vides (animation à questions, scène « trajet »)
// Brief §4.4a : partie 1, Buchelay → Malo (pleins posés, vides repris dans le MÊME camion) → retour ; partie 2, les vides vers la
// brasserie (Mons-en-Barœul, comme en 6.4) → lavage, remplissage → le fût revient plein. Carte schématique (`compilerTrajet`, kit iso).
// L'écran n'apparaît qu'après les deux réponses (Malo, Inès) ; la fiche ④ qu'après les deux questions.
const deuxReponses = tous(apresMail({ a: EXTERIEURS.malo.mail }), apresMail({ a: mailDe('ines') }));
export const ANIMATION = {
  id: ANIM,
  libelle: '④ La boucle des vides',
  quand: deuxReponses,
  menuApres: true,
  vitesse: 1,
  alt: 'Animation : une carte avec la plateforme de Buchelay, le bar de plage de Malo et la brasserie ; le camion de Lucas roule de l’une à l’autre.',
  scene: {
    trajet: {
      sol: [-1.2, -2.6, 25.4, 14.4],
      route: [[3, 4.6], [3, 12.6], [22.5, 12.6], [22.5, 8.2]],
      lieux: [
        { id: 'brasserie', type: 'brasserie', x: 0, y: 0, nom: 'Brasserie (Mons-en-Barœul)' },
        { id: 'lavage', type: 'lavage', x: 7.4, y: .6, nom: 'Lavage' },
        { id: 'buchelay', type: 'plateforme', x: 9, y: 7.6, nom: 'Plateforme de Buchelay' },
        { id: 'malo', type: 'bar', x: 20.6, y: 4.8, nom: 'La Cabane à Malo' },
      ],
      arrets: { brasserie: [3, 5.6], buchelay: [12.5, 12.6], malo: [22.5, 8.4] },
    },
    acteurs: { camion: { type: 'porteur' } },
  },
  parties: [
    { titre: 'Partie 1 sur 2 : la tournée de Lucas', depart: { camion: { a: 'buchelay', charge: 'pleins' } },
      pas: [
        { legende: 'À Buchelay, le camion part <b>plein</b> : la commande de Malo.' },
        { attendre: 900 },
        { rouler: 'camion', vers: 'malo' },
        { legende: 'Chez Malo : Lucas pose les <b>pleins</b> et reprend les <b>vides</b>, <b>dans le même camion</b>.' },
        { bulle: 'malo', lignes: ['Pleins posés,', 'vides repris'], vers: 'malo', hauteur: 2.2, decalage: [-250, -40] },
        { attendre: 1300 },
        { charger: 'camion', charge: 'vides' },
        { attendre: 1300 },
        { effacer: 'malo' },
        { legende: 'Retour à Buchelay avec les vides.' },
        { rouler: 'camion', vers: 'buchelay' },
        { legende: 'Le camion est rentré. <b>Arrête-toi et réfléchis.</b>' },
      ],
      question: { id: 'q1', titre: 'Question 1', enonce: 'Pourquoi Lucas reprend-il les vides dans le même camion ?',
        choix: ['Sinon, le camion rentrerait vide et il faudrait un autre trajet pour les vides.', 'Parce que les vides sont dangereux.',
          'Parce que Malo n’a pas de poubelle assez grande.', 'Pour les vendre à un ferrailleur.'],
        juste: 0,
        explication: 'Le camion qui a livré rentre de toute façon : il rapporte les vides au lieu de rouler à vide. Pas de trajet en plus, moins de '
          + 'carburant, moins de camions sur la route.' } },
    { titre: 'Partie 2 sur 2 : la boucle du fût', depart: { camion: { a: 'buchelay', charge: 'vides' } },
      pas: [
        { legende: 'Les vides de toute la côte repartent vers la <b>brasserie</b> (Mons-en-Barœul).' },
        { attendre: 700 },
        { rouler: 'camion', vers: 'brasserie' },
        { legende: 'À la brasserie : <b>lavage</b>, contrôle, puis <b>remplissage</b>.' },
        { bulle: 'lavage', lignes: ['Lavé, contrôlé,', 'rempli de nouveau'], vers: 'lavage', hauteur: 1.6, decalage: [60, -40] },
        { attendre: 1500 },
        { charger: 'camion', charge: 'pleins' },
        { attendre: 900 },
        { effacer: 'lavage' },
        { legende: 'Le fût revient <b>plein</b> à Buchelay. Un fût fait ce tour <b>environ 50 fois en 15 ans</b> (Conseil national de l’emballage).' },
        { rouler: 'camion', vers: 'buchelay' },
      ],
      question: { id: 'q2', titre: 'Question 2', enonce: 'Un fût vide perdu, qu’est-ce que ça coûte à France Boissons ?',
        choix: ['40 € de consigne, et un fût de moins dans la boucle.', 'Rien : le client paie toujours.', 'Seulement le prix de la bière.', '4 €.'],
        juste: 0,
        explication: 'La consigne du fût (40 €) ne couvre pas tout : il faut aussi acheter un fût neuf pour le remplacer dans la boucle, '
          + 'alors qu’il aurait pu servir encore des dizaines de fois.' } },
  ],
  aRetenir: 'Un fût <b>revient</b> : il est lavé et rempli de nouveau. Chaque vide repris, c’est <b>un emballage qui n’est pas jeté</b>.',
};
// La fiche ④ s'ouvre quand l'élève a répondu aux deux questions de l'animation (justes ou fausses).
const animationFaite = (db) => ['q1', 'q2'].every((q) => reponseAnimation(db, ANIM, q).repondu);

// ─────────────────────────────────────────────────────────────── les fiches
const nombre = (id, lib, unite, manque) => ({ type: 'nombre', id, lib, unite, min: 0, entier: true, manque });

// ① Le contrôle au quai : le dessin d'abord (onglet ouvert par défaut), puis le ticket.
export const FICHE_1 = {
  id: FICHE_CONTROLE, libelle: '① Contrôle du retour', titre: `Contrôle du retour — ${CABANE.nom}`,
  sousTitre: 'Compte ce qui est au quai (dessin à gauche), puis compare avec le ticket signé.',
  documents: ['quai', 'ticket'],
  largeurDocs: 1.85,
  serree: true,   // un fût du dessin ≥ 40 px à 1366 × 768 (brief §4 bis.6)
  bouton: 'Ouvrir le contrôle du retour',
  blocs: [
    nombre('futs', 'Fûts vides comptés', 'fûts', 'les fûts vides'),
    nombre('casiers', 'Casiers vides comptés', 'casiers', 'les casiers vides'),
    nombre('plein', 'Fût plein revenu (refusé)', 'fût(s)', 'le fût plein'),
    { type: 'liste', id: 'ticket', lib: 'Le ticket est-il juste ?', vide: 'Choisir…', manque: 'ta réponse sur le ticket', choix: CHOIX_TICKET },
    { type: 'encadre', titre: 'Compter avant de croire', texte: 'Un ticket signé peut être faux.\nOn compte ce qui est au quai.\nUn fût plein refusé n’est pas un vide.' },
  ],
  envoi: { bouton: 'Envoyer le contrôle à Karim', a: 'Karim' },
};

// ② Le compte de consignes : la feuille de calcul dans la fiche ; le ticket ouvert par défaut.
export const BLOC_FEUILLE_COMPTE = { type: 'grille', id: BLOC_COMPTE, lignes: lignesCompte,
  feuille: { titre: 'Compte de consignes', colonnes: ['A', 'B', 'C'], decimales: 2, colonneAide: 'Aide', donneesGrisees: true,
    largeurs: { A: '27%', B: '23%', C: '23%', aide: 'auto' } } };
export const FICHE_2 = {
  id: FICHE_COMPTE, libelle: '② Compte de consignes', titre: `Compte de consignes — ${CABANE.nom}`,
  sousTitre: 'Prends tes chiffres du quai. Lignes 5, 6, 8 et 9 : tape « = » puis clique sur les cases.',
  documents: ['ticket', 'fiche-client', 'conditions'],
  largeurDocs: 0.9,
  bouton: 'Ouvrir le compte de consignes',
  quand: apresFiche(FICHE_CONTROLE),
  blocs: [BLOC_FEUILLE_COMPTE],
  envoi: { bouton: 'Envoyer le compte à Inès', a: 'Inès', suite: 'Malo et Inès t’écrivent dans la Messagerie.' },
};

// ④ Le chiffrage du réemploi : l'élève recopie les données de la fiche (lignes 2 à 6), puis calcule (7 à 10).
export const BLOC_FEUILLE_CHIFFRAGE = { type: 'grille', id: BLOC_CHIFFRAGE, lignes: lignesChiffrage,
  feuille: { titre: 'Ce que rapporte un fût qui revient', colonnes: ['A', 'B'], decimales: 1, colonneAide: 'Aide',
    largeurs: { A: '38%', B: '28%', aide: 'auto' } } };
export const FICHE_3 = {
  id: FICHE_CHIFFRAGE, libelle: '④ Ce que rapporte un fût', titre: 'Ce que rapporte un fût qui revient',
  sousTitre: 'Recopie les données de la fiche à gauche (lignes 2 à 6). Lignes 7 à 10 : tape « = » puis clique sur les cases.',
  documents: ['fut-bouteille', 'droit'],
  largeurDocs: 0.75,
  bouton: 'Ouvrir le chiffrage',
  quand: animationFaite,
  blocs: [BLOC_FEUILLE_CHIFFRAGE],
  envoi: { bouton: 'Envoyer à Karim', a: 'Karim', suite: 'Karim te répond dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── les réponses à Malo et à Inès (phrases à choisir)
// Le rang `juste` est le rang DÉCLARÉ (la juste en tête) ; l'ordre affiché est tiré par élève. Jugées sur le RÉEL (le quai), pas sur
// la feuille de l'élève : c'est ce qui part chez le client et à la facturation (même choix qu'ENT-6.9).
const repris = AU_QUAI.futs, restes = VIDES_TICKET.futs - AU_QUAI.futs;
export function phrasesMalo(prenom) {
  return {
    id: MSG_MALO,
    lignes: [
      { id: 'salutation', choix: ['Bonjour Malo,', 'Salut Malo !'], juste: 0 },
      { id: 'fut', choix: [`Le fût de ${HEINEKEN.court.replace(' fût', '')} abîmé à la livraison ne vous sera pas facturé.`,
        `Le fût de ${HEINEKEN.court.replace(' fût', '')} abîmé à la livraison vous sera facturé, consigne comprise.`,
        `Le fût de ${HEINEKEN.court.replace(' fût', '')} abîmé à la livraison sera retiré de vos vides.`], juste: 0 },
      { id: 'vides', choix: [`Nous avons repris ${repris} fûts vides et non ${VIDES_TICKET.futs} : il en reste donc ${restes === 1 ? 'un' : restes} chez vous.`,
        `Nous avons bien repris vos ${VIDES_TICKET.futs} fûts vides.`,
        `Il manque un fût vide : il vous sera facturé ${euros(CONSIGNES.fut)}.`], juste: 0 },
      { id: 'solde', choix: [`Vous avez maintenant ${REEL.apres.futs} fûts et ${REEL.apres.casiers} casiers en consigne chez vous.`,
        `Vous avez maintenant ${AVANT.futs} fûts et ${AVANT.casiers} casiers en consigne chez vous.`,
        `Vous avez maintenant ${repris} fûts et ${AU_QUAI.casiers} casiers en consigne chez vous.`], juste: 0 },
      { id: 'fin', choix: [`Cordialement, ${prenom}, exploitation France Boissons`, 'À plus !'], juste: 0 },
    ],
    melanger: true,
  };
}
export function phrasesInes(prenom) {
  const casiersMoins = -REEL.ecart.casiers;
  return {
    id: MSG_INES,
    lignes: [
      { id: 'bonjour', choix: ['Bonjour Inès,', 'Coucou Inès !'], juste: 0 },
      { id: 'futs', choix: [`Fûts : ${euros(REEL.montant.futs)} de consigne à facturer (${pl(REEL.ecart.futs, 'fût')} de plus chez Malo).`,
        `Fûts : avoir de ${euros(REEL.montant.futs)}.`, `Fûts : ${euros(LIVRES.futs * CONSIGNES.fut)} à facturer.`], juste: 0 },
      { id: 'casiers', choix: [`Casiers : avoir de ${euros(REEL.montant.casiers)} (${pl(casiersMoins, 'casier')} de moins chez Malo).`,
        `Casiers : ${euros(REEL.montant.casiers)} à facturer.`, `Casiers : avoir de ${euros(VIDES_TICKET.casiers * CONSIGNES.casier)}.`], juste: 0 },
      { id: 'heineken', choix: [`Facture ${HEINEKEN.livre} Heineken 30 L : le ${HEINEKEN.commande}e a été refusé.`,
        `Facture les ${HEINEKEN.commande} Heineken commandés.`], juste: 0 },
      { id: 'merci', choix: [`Merci, ${prenom}`, 'Bisous'], juste: 0 },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── les messages
const KARIM = { nom: EQUIPE.karim.nom, mail: mailDe('karim') };
const LUCAS = { nom: EQUIPE.lucas.nom, mail: mailDe('lucas') };
const INES = { nom: EQUIPE.ines.nom, mail: mailDe('ines') };
const MALO = { nom: EXTERIEURS.malo.nom, mail: EXTERIEURS.malo.mail };
const MIN = 60000;
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in',
  ts: heureScenario(SCENARIO.date, o.heure || SCENARIO.heure, { db: o.db, volet: ID_VOLET, decalage: (o.decalage || 0) * MIN }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_MALO = 'Mes consignes ?';
export const SUJET_INES = 'Facture de Malo';

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, KARIM, 'Lucas est au quai 14',
      `${prenom}, Lucas est au quai 14 avec les [[vides]] de la côte.\n\n`
        + 'Il a mis à part ceux de La Cabane à Malo et il te donne le [[ticket de livraison|ticket]] que Malo a signé.\n\n'
        + '[[Compte avant de croire|Compte les vides avant de croire le ticket]], puis envoie-moi ton contrôle.\n\nKarim',
      { extra: { pieces: ['quai', 'ticket'], ouvreFiche: FICHE_CONTROLE } }),
    mail(prenom, LUCAS, 'Le retour de chez Malo',
      `Tout est livré chez Malo, sauf un Heineken 30 L : je l’ai cabossé en déchargeant, Malo l’a refusé. Il est revenu avec moi. `
        + 'Le ticket est signé.\n\nLucas', { decalage: 1, extra: { pieces: ['ticket'] } }),
  ] }),
  declencheurs: [
    // Le contrôle envoyé (juste ou faux) : Karim demande le compte, sans dire si le contrôle était juste (alerte 28).
    { id: 'controle-recu', quand: apresFiche(FICHE_CONTROLE),
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'Contrôle reçu',
        `Contrôle reçu. Fais maintenant le [[solde|compte de consignes]] de Malo avec tes chiffres : Inès en a besoin pour sa facture.\n\nKarim`,
        { db, decalage: 2, extra: { ouvreFiche: FICHE_COMPTE } })] }) },
    // Le compte envoyé : Malo et Inès écrivent (réponses par phrases à choisir).
    { id: 'questions-malo-ines', quand: apresFiche(FICHE_COMPTE),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, MALO, SUJET_MALO, 'Alors, mes [[consigne|consignes]] ? Et le Heineken cabossé, je le paie ?\n\nMalo',
          { db, decalage: 3, extra: { cle: CLE_MALO, pieces: ['ticket', 'conditions'], phrases: phrasesMalo(prenom) } }),
        mail(prenom, INES, SUJET_INES, 'J’édite la facture de Malo. Qu’est-ce que je mets en consignes, et pour le Heineken ?\n\nInès',
          { db, decalage: 4, extra: { cle: CLE_INES, pieces: ['ticket', 'conditions'], phrases: phrasesInes(prenom) } }),
      ] }) },
    // Les deux réponses envoyées : Karim ouvre la boucle des vides (sans nombre : rien ne souffle ce qui vient d'être envoyé).
    { id: 'boucle', quand: deuxReponses,
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'Où vont les vides ?',
        'Les vides de Malo ne restent pas ici. Regarde où ils vont (« La boucle des vides », dans ton menu), puis chiffre-le pour moi.'
          + '\n\nKarim', { db, decalage: 2 })] }) },
    // L'animation faite (ses deux questions répondues, justes ou fausses) : Karim ouvre le chiffrage. Il arrive à la navigation suivante
    // (l'écran de l'animation ne se redessine pas sous l'élève).
    { id: 'chiffrer', quand: animationFaite,
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'À toi de chiffrer',
        'Tu as vu où vont les vides. Maintenant, chiffre ce que rapporte un fût qui revient : la fiche est dans ton menu.\n\nKarim',
        { db, decalage: 3, extra: { ouvreFiche: FICHE_CHIFFRAGE } })] }) },
    // Le chiffrage envoyé : fin de la séance.
    { id: 'fin', quand: apresFiche(FICHE_CHIFFRAGE),
      semer: (prenom, db) => ({ mails: [mail(prenom, KARIM, 'Merci',
        `Merci ${prenom}. Une tonne de verre pour un seul fût… Bonne Fête de la musique à Malo !\n\nKarim`, { db, decalage: 2 })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (12, pondérés : 16 + 4 de questions = 20)
// Poids validés par Tristan le 13/10/2026 (option A) : contrôle 4,5 · compte 5 · rendre compte 4 · boucle 2,5 · questions 4 (`part`).
// Rien n'est vrai avant l'envoi de la fiche ou du message concerné : l'inaction vaut 0. Les jalons 4 à 6 jugent la feuille sur SES
// comptes (une erreur ne se paie qu'une fois) ; les jalons 7 à 9, ce qui part chez Malo et chez Inès (le réel).
export const GROUPES = {
  controle: '① Le contrôle au quai',
  compte: '② Le compte de consignes',
  prevenir: '③ Prévenir Malo et Inès',
  boucle: '④ La boucle des vides',
};
export const POIDS = {
  'futs-vides': 2, 'casiers-plein': 1, ticket: 1.5,
  'compte-lus': 1.5, 'compte-solde': 1.5, 'compte-montants': 2,
  'malo-fut-ton': 1, 'malo-vides-solde': 1.5, ines: 1.5,
  'anim-q1': 0.5, 'anim-q2': 0.5, chiffrage: 1.5,
};
const attente = { status: 'attente' };
const ok = { status: 'ok' };
const ko = (detail) => (detail ? { status: 'ko', detail } : { status: 'ko' });

const jalonControle = (id, titre, juste) => ({ id, titre, groupe: GROUPES.controle, poids: POIDS[id], ecran: 'fiche',
  verifier(db) { const c = comptesEleve(db); return c ? (juste(c) ? ok : ko()) : attente; } });

const MOTS = { vide: 'vide', pasFormule: 'nombre tapé au lieu d’une formule', erreur: 'formule mal écrite', attente: 'il manque une donnée', valeur: 'à revoir' };
const jalonFeuille = (id, titre, groupe, ficheId, bloc, refs) => ({ id, titre, groupe, poids: POIDS[id], ecran: `fiche:${ficheId}`,
  verifier(db) {
    if (!ficheEnvoyee(db, ficheId).envoye) return attente;
    const j = lireFeuille(ficheId, bloc, db).juge;
    const faux = refs.filter((r) => j[r] !== 'ok');
    return faux.length ? ko(`À revoir : ${faux.map((r) => `${r} (${MOTS[j[r]] || 'à revoir'})`).join(', ')}.`) : ok;
  } });

const jalonPhrases = (id, titre, msg, lignes) => ({ id, titre, groupe: GROUPES.prevenir, poids: POIDS[id],
  verifier(db) { const r = phrasesJustes(db, msg); return !r.envoye ? attente : (lignes.every((l) => r.justes.includes(l)) ? ok : ko()); } });

export const ETAPES = [
  jalonControle('futs-vides', 'Contrôle : les fûts vides comptés au quai', (c) => c.futs === AU_QUAI.futs),
  jalonControle('casiers-plein', 'Contrôle : les casiers vides et le fût plein refusé', (c) => c.casiers === AU_QUAI.casiers && c.plein === AU_QUAI.plein),
  jalonControle('ticket', 'Contrôle : l’écart du ticket trouvé', (c) => c.ticket === TICKET_JUSTE),
  jalonFeuille('compte-lus', 'Compte : pleins livrés et consignes lus justes (lignes 3 et 7)', GROUPES.compte, FICHE_COMPTE, BLOC_FEUILLE_COMPTE, CASES_COMPTE.lus),
  jalonFeuille('compte-solde', 'Compte : tes vides repris et le solde après la tournée, en formule (lignes 4 et 5)', GROUPES.compte, FICHE_COMPTE,
    BLOC_FEUILLE_COMPTE, CASES_COMPTE.solde),
  jalonFeuille('compte-montants', 'Compte : écart, montants et total, en formule (lignes 6, 8 et 9)', GROUPES.compte, FICHE_COMPTE, BLOC_FEUILLE_COMPTE,
    CASES_COMPTE.montants),
  jalonPhrases('malo-fut-ton', 'Malo : le fût abîmé non facturé, et le ton (salutation, fin)', MSG_MALO, ['salutation', 'fut', 'fin']),
  jalonPhrases('malo-vides-solde', 'Malo : les vides vraiment repris et son solde de consignes', MSG_MALO, ['vides', 'solde']),
  jalonPhrases('ines', 'Inès : consigne des fûts, avoir des casiers, Heineken livrés', MSG_INES, ['futs', 'casiers', 'heineken']),
  // Jalons 10 et 11 : les deux questions de l'animation, jugées sur la PREMIÈRE réponse (règle de la vue).
  ...etapesAnimation(ANIMATION).map((e, k) => ({ ...e, id: `anim-q${k + 1}`, titre: `Boucle des vides : question ${k + 1} de l’animation`,
    groupe: GROUPES.boucle, poids: POIDS[`anim-q${k + 1}`], ecran: `animation:${ANIM}` })),
  jalonFeuille('chiffrage', 'Chiffrage : données lues justes et calculs en formule', GROUPES.boucle, FICHE_CHIFFRAGE, BLOC_FEUILLE_CHIFFRAGE,
    [...CASES_CHIFFRAGE.donnees, ...CASES_CHIFFRAGE.calculs]),
];

// ─────────────────────────────────────────────────────────────── les pastilles d'étape (« fait », jamais « juste »)
export const PASTILLES = [
  { libelle: 'Contrôler', fait: (db) => ficheEnvoyee(db, FICHE_CONTROLE).envoye },
  { libelle: 'Compter les consignes', fait: (db) => ficheEnvoyee(db, FICHE_COMPTE).envoye },
  { libelle: 'Prévenir', fait: (db) => phrasesJustes(db, MSG_MALO).envoye && phrasesJustes(db, MSG_INES).envoye },
  { libelle: 'La boucle des vides', fait: (db) => ficheEnvoyee(db, FICHE_CHIFFRAGE).envoye },
];

// ─────────────────────────────────────────────────────────────── l'accueil
export const MENTION = 'Réels : France Boissons et sa plateforme de Buchelay (Yvelines) ; le terminal des chauffeurs, qui enregistre le non-livré '
  + 'et les consignes et imprime le ticket ; l’avoir des emballages rendus ; les montants de consigne (arrêté du 6 février 2026) ; le poids '
  + 'd’un fût et d’une bouteille ; le nombre d’utilisations d’un fût (Conseil national de l’emballage). Construit : le fût cabossé, le ticket et '
  + 'son numéro, le 9e vide resté chez Malo, le solde de Malo, tous les messages.';
export const LEXIQUE = Object.assign({}, LEXIQUE_FB, {
  déconsigne: 'Le remboursement de la consigne quand le client rend l’emballage vide.',
  avoir: 'Une somme que l’entreprise doit au client, déduite de sa prochaine facture.',
  'ticket de livraison': 'Le ticket imprimé chez le client par le terminal du chauffeur : ce qui est livré, ce qui ne l’est pas, les vides repris. Le client le signe.',
  'non-livré': 'Ce qui était commandé mais n’a pas été livré, avec la raison (le motif) : rupture, refus, casse…',
  réemploi: 'Utiliser de nouveau un emballage pour le même usage : un fût lavé, puis rempli. Ce n’est pas du recyclage.',
  solde: 'Ce qui reste au bout du compte : ici, le nombre d’emballages consignés chez le client après la tournée.',
  'emballage consigné': 'Un emballage (fût, casier) dont le client paie la consigne : elle lui est rendue quand il le rapporte.',
  RSE: 'Responsabilité sociétale des entreprises : ce qu’une entreprise fait pour l’environnement et les personnes, au-delà de ce que la loi impose.',
  'Compte avant de croire': 'Un document signé peut être faux : on compte d’abord ce qui est là, puis on compare.',
  CHR: 'Cafés, hôtels, restaurants : les clients professionnels de la boisson.',
});
export const ACCUEIL = {
  titre: 'Le retour de Lucas',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : Karim et Lucas, avec le ticket signé par Malo.'],
    ['① Contrôler', 'Compte les vides de Malo sur le dessin du quai, puis compare avec le ticket. Envoie ton contrôle à Karim.'],
    ['② Compter les consignes', 'Dans la feuille : avant + livré − repris, puis l’écart et ce qu’on facture (ou l’[[avoir]]).'],
    ['③ Prévenir', 'Réponds à Malo et à Inès : une phrase par ligne.'],
    ['④ La boucle des vides', 'Regarde où vont les vides, puis chiffre ce que rapporte un fût qui revient.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance
export const OPTIONS = {
  menu: [],
  exercice: 'Séance 10 : le retour de Lucas',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  fiches: [FICHE_1, FICHE_2, FICHE_3],
  animation: ANIMATION,
  pastilles: PASTILLES,
  equipe: EQUIPE,
  questions: QUESTIONS,
};
