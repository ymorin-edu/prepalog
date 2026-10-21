// ENT-10.2 — Transports Pelleau, « mon premier jour dans l'entrepôt neuf » : le contenu de la séance (brief
// `docs/briefs/ENT-10.2-pelleau-premier-jour.md` ; décisions du chef de chantier `docs/briefs/COORDINATION-pelleau.md` §2, qui passent avant le
// brief). CAP OL, GUIDAGE de CAP-C1.2 (prendre son poste). Univers commun : `contenus/pelleau.js` (À LIRE). Données pures (défaut tiré, inspection,
// planning, lectures, phrases) : `contenus/pelleau-ent102-donnees.js`. Activité : `activites/pelleau-premier-jour.js`. Questions :
// `contenus/questions/ENT-10.2.js`. Corrigé : `contenus/corriges/ENT-10.2.js`.
//
// 5 mai 2026, 7 h (aucun jour de la semaine écrit : FDR §0.7, décision 9 du chef ; le brief en écrivait un, ligne 108, non repris).
// Première séance à utiliser la vue « Inspection du poste » (`core/types/inspection.js`).
//   ① visite de l'entrepôt (plan d'entrepôt, mode visite, noté au premier essai) ;
//   ② mon poste : la vue « Inspection du poste » (défaut du site TIRÉ, avertisseur à essayer), puis la fiche « En attendant » (cases, selon
//      le défaut) ;
//   ③ le planning des quais : document fabriqué depuis la grille, fiche « Lire le planning » (lectures TIRÉES, réponses CALCULÉES) et une
//      carte à poser (jamais au quai B quand son extincteur manque) ;
//   ④ rendre compte à Erwan par phrases (ce qui manque CALCULÉ sur le défaut, l'heure LUE dans la grille).
// Rien n'est jugé à l'écran ; le bandeau de fin dit ✓ / ✗ par bloc, et la case avec `bilanDetail`. « Corriger » rouvre « En attendant », la
// fiche de lecture, le planning et les phrases ; jamais la visite ni l'inspection (`finFige`).
//
// « LOÏC ARRIVE » (brief 10.2:114 « avant que Loïc arrive » contre 10.2:119 « Loïc arrive : la semaine prochaine… ») : tranché en suivant le
// planning (consigne du chef) — Loïc est en tournée de ramasse le matin et revient à l'heure de la grille (7 h 30, au quai A). Erwan demande le
// compte rendu « avant le retour de Loïc » ; sa réponse finale dit l'heure lue dans la grille et renvoie la réception du camion à la semaine
// suivante (amorce d'ENT-10.5).
//
// VÉRIFIÉ / CONSTRUIT (brief §2) — voir aussi l'en-tête de `contenus/pelleau.js` :
//   Vérifié : INRS, brochure ED 36 (transpalettes électriques à conducteur accompagnant, 2e édition 1999, réimpr. 2008 : DOCUMENT ANCIEN, cité
//   comme repère) — au début du service : frein d'immobilisation, avertisseur, frein de service, élévation, batterie chargée et bien branchée,
//   pas de fuite hydraulique, arrêt d'urgence (d'après le brief, non relu ici). Code du travail D4153-27, R4153-40, R4153-51 : textes de
//   `contenus/pelleau.js` (`ARTICLES_JEUNES`, recopiés de Légifrance le 19/10/2026) ; L4141-1, 1er alinéa : texte recopié de Légifrance le
//   15/10/2026 par ENT-8.2 (LEGIARTI000027326445, en vigueur depuis le 18/04/2013), repris ici mot pour mot, non relu.
//   Construit (dit dans la séance) : le plan de l'entrepôt, la liste « Ma prise de poste » (mise en forme d'après l'ED 36), le planning du
//   5 mai et ses camions, les transpalettes et leurs numéros, ce qui manque au site, les heures de poste, Erwan, Yann, Loïc, Maëlys.
//   Photos : la photo d'accueil est celle de Pelleau (`PHOTOS.racks`) ; les autres viennent d'autres entrepôts (fichiers d'Action et de Smoby
//   déjà au dépôt, mentions recopiées de leurs crédits), aucun visage. Dessins : l'engin et l'extincteur d'« Avant de commencer » sont tracés
//   par le kit iso (`core/iso.js`) : aucune photo libre d'un transpalette électrique ni d'un extincteur n'est au dépôt (ÉCART : le brief
//   disait « photo libre »).

import { apresGeste, apresFiche, apresPlanning, apresMail, inspectionFinie } from '../core/declencheurs.js';
import { etapesEntrepot } from '../core/types/entrepot.js';
import { etapesPlanning } from '../core/types/planning.js';
import { etapesInspection } from '../core/types/inspection.js';
import { phrasesJustes } from '../core/phrases.js';
import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette, extincteur, boitesExtincteur } from '../core/iso.js';
import { QUESTIONS } from './questions/ENT-10.2.js';
import { EQUIPE, LEXIQUE, MENTION, LOGO, PHOTOS, PLAN_ENTREPOT, ARTICLES_JEUNES, DROIT_CONSULTE, STYLE_DOCUMENTS, PIED, mailDe, heureScenario,
  ech, pied } from './pelleau.js';
import {
  ID, ID_VOLET, VISITE_ID, INSPECTION_ID, PLANNING_ID, PHRASES_ID, JOUR, FICHES, SITE, defautDeBase, inspectionDe, casesAttente, attenteJuste,
  QUAIS, CAMIONS, CARTE, ECHELLE, LECTURES, HEURE_LOIC, QUAI_LOIC, heureLue, lecturesTirees, lecturesBonus, melangerPour, phrasesCompteRendu,
  envoyee, valeurDe, dejaEnvoyee, visiteFinie, planningEnvoye, placeCarte,
} from './pelleau-ent102-donnees.js';

export { ID, ID_VOLET, VISITE_ID, INSPECTION_ID, PLANNING_ID, PHRASES_ID, FICHES, TIRAGE } from './pelleau-ent102-donnees.js';

const toMin = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

// ─────────────────────────────────────────────────────────────── les documents (papier, encre ; pied imposé)
// « Ma prise de poste » : la liste en deux parties (brief §4, étape 2), d'après l'INRS ED 36 ; mise en forme construite.
const DOC_PRISE_DE_POSTE = { id: 'prise-de-poste', titre: 'Ma prise de poste', court: 'Ma prise de poste',
  html: `<article class="pe-doc" aria-label="Ma prise de poste">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Ma prise de poste</p>
    <p class="pe-st">À vérifier chaque matin, avant de commencer.</p>
    <p class="pe-art"><b>1. Mon poste</b></p>
    <ul class="pe-ul pe-coche">
      <li>Mes [[EPI]] : chaussures de sécurité, gilet.</li>
      <li>Un [[extincteur]] à chaque quai, à sa place.</li>
      <li>Le [[plan de circulation]] affiché.</li>
      <li>L’[[allée piétonne]] libre.</li>
    </ul>
    <p class="pe-art"><b>2. Mon transpalette</b></p>
    <ul class="pe-ul pe-coche">
      <li>Les freins.</li>
      <li>L’[[avertisseur]] : je l’essaie (je clique le bouton à la trompe, sous la poignée du timon).</li>
      <li>L’élévation des fourches.</li>
      <li>La batterie : chargée et bien branchée.</li>
      <li>Pas de fuite sous l’engin.</li>
      <li>L’[[arrêt d’urgence]] sur le [[timon]].</li>
    </ul>
    ${pied(`${PIED} Liste d’après l’INRS (brochure ED 36, transpalettes électriques) ; mise en forme construite.`)}
  </article>` };

// « Le droit » : D4153-27, R4153-40, R4153-51 (textes de l'univers) et L4141-1, 1er alinéa (voir l'en-tête).
const L4141_1 = 'L’employeur organise et dispense une information des travailleurs sur les risques pour la santé et la sécurité et les mesures prises pour y remédier.';
const loi = (L) => `<div class="pe-loi">${L.map((p, i) => `<p>${i === 0 ? '« ' : ''}${ech(p)}${i === L.length - 1 ? ' »' : ''}</p>`).join('')}</div>`;
const DOC_DROIT_102 = { id: 'droit-102', titre: 'Le droit : un jeune et un engin', court: 'Le droit',
  html: `<article class="pe-doc" aria-label="Le droit : un jeune et un engin">
    <p class="pe-t">Le droit : un jeune et un engin</p>
    <p class="pe-st">Code du travail — les moins de 18 ans et les engins qui roulent tout seuls (transpalette électrique, chariot)</p>
    <p class="pe-art"><b>Code du travail, article D4153-27</b></p>
    ${loi(ARTICLES_JEUNES['D4153-27'])}
    <p class="pe-art"><b>Code du travail, article R4153-40</b></p>
    ${loi(ARTICLES_JEUNES['R4153-40'])}
    <p class="pe-art"><b>Code du travail, article R4153-51</b></p>
    ${loi(ARTICLES_JEUNES['R4153-51'])}
    <p class="pe-art"><b>Code du travail, article L4141-1</b> (1er alinéa)</p>
    ${loi([L4141_1])}
    ${pied(`Textes réels, recopiés de Légifrance (consulté le ${DROIT_CONSULTE} ; L4141-1 le 15/10/2026).`)}
  </article>` };

// Le planning des quais : un tableau quais × quarts d'heure, fabriqué depuis la grille (jamais recopié).
const d0 = toMin(ECHELLE.debut), d1 = toMin(ECHELLE.fin), PAS = ECHELLE.pas;
export function tablePlanning(camions, { vide = false } = {}) {
  const n = (d1 - d0) / PAS;
  let h = '<tr><th scope="col" class="pe-q">Quai</th>';
  for (let m = d0; m < d1; m += 60) h += `<th scope="col" colspan="${60 / PAS}">${heureLue(m)}</th>`;
  h += '</tr>';
  const lignes = QUAIS.map((q) => {
    let s = `<tr><th scope="row" class="pe-q">${ech(q.nom)}</th>`;
    for (let i = 0; i < n;) {
      const m = d0 + i * PAS;
      const c = vide ? null : camions.find((x) => x.quai === q.id && toMin(x.de) === m);
      if (c) {
        const span = (toMin(c.a) - toMin(c.de)) / PAS;
        s += `<td class="pe-pris" colspan="${span}"><b>${ech(c.court)}</b><br>${heureLue(toMin(c.de))} – ${heureLue(toMin(c.a))}</td>`;
        i += span;
      } else { s += `<td${(m - d0) % 60 === 0 ? ' class="pe-h"' : ''}></td>`; i += 1; }
    }
    return `${s}</tr>`;
  }).join('');
  return `<table class="pe-tab"><colgroup><col class="pe-q">${'<col>'.repeat(n)}</colgroup><thead>${h}</thead><tbody>${lignes}</tbody></table>`;
}
const DOC_PLANNING = { id: 'planning-doc', titre: 'Planning des quais — 5 mai', court: 'Planning des quais',
  html: () => `<article class="pe-doc" aria-label="Planning des quais du 5 mai">
    <img class="pe-logo" src="${LOGO}" alt="Logo des Transports Pelleau">
    <p class="pe-t">Planning des quais — 5 mai, le matin</p>
    <p class="pe-st">Entrepôt de Gouesnou · une case = un quart d’heure</p>
    ${tablePlanning(CAMIONS)}
    <ul class="pe-ul">${CAMIONS.map((c) => `<li><b>${ech(c.titre)}</b> : ${heureLue(toMin(c.de))} – ${heureLue(toMin(c.a))}, ${ech(QUAIS.find((q) => q.id === c.quai).nom)}</li>`).join('')}</ul>
    ${pied(`${PIED} Camions et horaires construits pour l’exercice.`)}
  </article>` };
// Pour « Avant de commencer » : un planning VIDE (aucun camion de la séance) et le contexte du stage.
const DOC_PLANNING_VIDE = { id: 'planning-vide', titre: 'Un planning des quais (vide)', court: 'Un planning',
  html: `<article class="pe-doc" aria-label="Un planning des quais vide">
    <p class="pe-t">Un planning des quais</p>
    <p class="pe-st">Exemple vide : chaque camion prévu prend une case à son quai, de son heure d’arrivée à son heure de départ.</p>
    ${tablePlanning([], { vide: true })}
    ${pied('Document pédagogique — modèle construit pour l’exercice.')}
  </article>` };
const DOC_STAGE = { id: 'stage-102', titre: 'Ton premier jour', court: 'Ton premier jour',
  html: `<article class="pe-doc" aria-label="Ton premier jour">
    <p class="pe-t">Ton premier jour à l’entrepôt</p>
    <p class="pe-st">5 mai, 7 h</p>
    <p>Tu es en stage (PFMP) aux <b>Transports Pelleau</b>, dans l’entrepôt neuf de Gouesnou. Il vient d’ouvrir : rien n’est encore rodé.</p>
    <p>Aujourd’hui, tu tiens le poste de réception avec <b>Yann</b>. Ton [[tuteur]] : <b>Erwan</b>.</p>
    <p>Ton engin : un [[transpalette électrique]]. Tu l’as appris en formation ; avant de t’en servir, tu le contrôles.</p>
    <img class="pe-photo" src="${PHOTOS.racks.src}" alt="${ech(PHOTOS.racks.alt)}">
    <p class="pe-st">${ech(PHOTOS.racks.mention)}</p>
    ${pied('Document pédagogique — Erwan et Yann sont imaginés pour l’exercice.')}
  </article>` };

// Les deux DESSINS d'« Avant de commencer » (kit iso : aucune photo libre au dépôt). Le cadre (viewBox) se calcule sur les boîtes de l'objet.
function dessinIso(I, interieur, boites, aria) {
  const r = boiteEcran(I, boites, 26);
  return `<svg class="pe-dessin" viewBox="${r.x} ${r.y} ${r.w} ${r.h}" role="img" aria-label="${ech(aria)}">${interieur}</svg>`;
}
const DESSIN_ENGIN = (() => {
  const I = projection({ unite: 150, origine: [300, 80] });
  const sol = I.face([[-0.5, -0.4, 0], [1.4, -0.4, 0], [1.4, 2.4, 0], [-0.5, 2.4, 0]], '#e4dfd3', 'none');
  return dessinIso(I, sol + transpaletteElectrique(I, [0, 0], 'ok', { n: 1 }), boitesTranspalette('ok', [0, 0]),
    'Un engin jaune à deux fourches, avec un long manche et un capot qui porte le numéro 1');
})();
const DESSIN_EXTINCTEUR = (() => {
  const I = projection({ unite: 220, origine: [200, 40] });
  const mur = I.boite(-0.6, -0.3, 0, 1.2, 0.3, 2.2, ['#b9b3a6', '#c9c3b6', '#a9a397']);
  return dessinIso(I, mur + extincteur(I, [0, 0], 'present'), [...boitesExtincteur([0, 0]), [-0.45, 0, 0.4, 0.45, 0, 2.0]],
    'Un appareil rouge accroché au mur sur son support, sous un panneau rouge');
})();
const DOC_DESSIN_ENGIN = { id: 'dessin-engin', titre: 'Un engin de l’entrepôt', court: 'Un engin',
  html: `<article class="pe-doc" aria-label="Un engin de l’entrepôt">${DESSIN_ENGIN}<p class="pe-st">Dessin construit pour l’exercice.</p></article>` };
const DOC_DESSIN_EXTINCTEUR = { id: 'dessin-extincteur', titre: 'Au mur du quai', court: 'Au mur',
  html: `<article class="pe-doc" aria-label="Au mur du quai">${DESSIN_EXTINCTEUR}<p class="pe-st">Dessin construit pour l’exercice.</p></article>` };

export const STYLE = `${STYLE_DOCUMENTS}
.pe-coche{list-style:none; padding-left:4px}
.pe-coche li::before{content:"☐"; margin-right:8px; font-size:1.05rem}
.pe-tab{border-collapse:collapse; width:100%; margin:6px 0 10px; font-size:.78rem; table-layout:fixed}
.pe-tab th,.pe-tab td{border:1px solid #d6d0c3; padding:3px 2px; text-align:center; vertical-align:middle}
.pe-tab td.pe-h,.pe-tab th{border-left:1.5px solid #8f897c}
.pe-tab th.pe-q,.pe-tab col.pe-q{width:62px}
.pe-tab td.pe-pris{background:rgba(85,80,71,.16); line-height:1.15; font-size:.74rem; border:1.5px solid #555047}
.pe-tab td{height:44px}
.pe-photo{display:block; width:100%; max-height:200px; object-fit:cover; border-radius:4px; margin:8px 0 2px}
.pe-dessin{display:block; width:100%; max-height:340px; margin:4px auto 6px}
`;
export const DOCUMENTS = [DOC_PRISE_DE_POSTE, DOC_DROIT_102, DOC_PLANNING, DOC_PLANNING_VIDE, DOC_STAGE, DOC_DESSIN_ENGIN, DOC_DESSIN_EXTINCTEUR];

// ─────────────────────────────────────────────────────────────── ① la visite de l'entrepôt (plan CONSTRUIT : `PLAN_ENTREPOT`)
const AUTRE = 'Photo d’un autre entrepôt — ';
const IMG_A = './contenus/images/action/';
export const IMAGES_VISITE = {
  racks: { src: PHOTOS.racks.src, repere: [1536, 824], alt: PHOTOS.racks.alt, mention: PHOTOS.racks.mention },
  vestiaire: { src: `${IMG_A}vestiaire.jpg`, repere: [1200, 807], alt: 'Un couloir de vestiaire entre deux rangées de casiers métalliques orange',
    mention: 'Photo d’un autre vestiaire — ubeyde oral / Pexels' },
  quai: { src: PHOTOS.quai.src, repere: [1200, 801], alt: PHOTOS.quai.alt, mention: PHOTOS.quai.mention },
  reception: { src: `${IMG_A}zone-colis.jpg`, repere: [1200, 800],
    alt: 'Des palettes de cartons filmés, posées à même le sol d’un entrepôt, avec un ruban orange peint par terre', mention: `${AUTRE}Freek Wolsink / Pexels` },
  controle: { src: `${IMG_A}palette-filmee.jpg`, repere: [740, 1040],
    alt: 'Des piles de cartons posées sur des palettes et entourées de film plastique transparent', mention: `${AUTRE}Freek Wolsink / Pexels` },
  litiges: { src: './contenus/smoby/visite/visite-litiges-dessin.jpg', repere: [1280, 854],
    alt: 'Dessin d’une zone litiges : marquage au sol, panneau, deux emplacements, palettes bloquées', mention: 'Dessin : ce qu’on doit voir dans une zone litiges.' },
  bureau: { src: './contenus/smoby/visite/visite-bureau-pexels-7658310.jpg', repere: [1280, 854],
    alt: 'Un bureau : une grande table, des écrans, des classeurs et des papiers', mention: `${AUTRE}Pavel Danilyuk / Pexels` },
};
export const VISITE = {
  id: VISITE_ID, libelle: 'Visite de l’entrepôt', mode: 'visite',
  premierEssai: true,
  // La note du vestiaire de `PLAN_ENTREPOT` (50 signes) dépasse ce que la visite accepte (34) : raccourcie ici, l'univers n'est pas touché.
  plan: { ...PLAN_ENTREPOT, zones: { ...PLAN_ENTREPOT.zones, vestiaire: { note: 'EPI ; local de charge à côté' } } },
  zones: { reception: { note: 'palettes rangées par client' } },
  personnage: { nom: 'Erwan', role: 'responsable de l’entrepôt', date: '5 mai' },
  images: IMAGES_VISITE,
  etapes: [
    { id: 'accueil', type: 'accueil', titre: 'Accueil', heure: '7:00', image: 'racks',
      texte: 'Bienvenue dans l’entrepôt neuf ! On en fait le tour. Ensuite, tu prends ton poste.',
      consigne: 'Lis le message d’Erwan, puis clique <b>Suivant</b>.',
      surTitre: 'Transports Pelleau · entrepôt neuf de Gouesnou',
      grandTitre: 'Bienvenue dans l’entrepôt neuf',
      intro: '5 mai, 7 h. Erwan, ton tuteur, te fait visiter l’entrepôt.',
      programme: ['Suivre le tour de l’entrepôt sur le plan', 'Reconnaître chaque endroit sur une photo'],
      encadre: 'La première photo est celle de Pelleau ; les autres viennent <b>d’autres entrepôts</b>. Le plan est <b>construit pour l’exercice</b>.' },
    { id: 'parcours', type: 'parcours', titre: 'Le tour', heure: '7:02',
      texte: 'Suis-moi : je te montre où travaille chacun.',
      aide: 'Ouvre les étapes du tour, dans l’ordre.',
      consigne: 'Clique les étapes du tour <b>dans l’ordre</b>, sur le plan.',
      consigneFini: 'Le tour est fini. Clique <b>Suivant</b>.',
      debut: 'Commence par l’étape <b>n° 1</b>.',
      ordreMsg: 'Dans l’ordre : l’étape suivante est la n° {n}.',
      etapes: [
        { n: 1, ancre: 'zone:vestiaire', titre: 'Vestiaire et EPI', images: ['vestiaire'], dir: 0, cone: 50,
          texte: 'Chaussures de sécurité et gilet avant tout : ce sont tes [[EPI]]. À côté : le [[local de charge]] des transpalettes.' },
        { n: 2, ancre: 'quai:Quai A', titre: 'Les quais A et B', images: ['quai'], dir: 90, cone: 34,
          texte: 'Les camions s’y mettent à quai. Yann les décharge au chariot.' },
        { n: 3, ancre: 'zone:reception', titre: 'Zone de réception', images: ['reception'], dir: 0, cone: 50,
          texte: 'Les palettes déchargées attendent ici, rangées par client.' },
        { n: 4, ancre: 'zone:controle', titre: 'Zone de contrôle', images: ['controle'], dir: 0, cone: 50,
          texte: 'On compte les colis et on regarde leur état.' },
        { n: 5, ancre: 'zone:litiges', titre: 'Zone litiges', images: ['litiges'], dir: 0, cone: 50,
          texte: 'Ce qui pose problème attend ici, avec une étiquette.' },
        { n: 6, ancre: 'zone:bureau', titre: 'Le bureau', images: ['bureau'], dir: 0, cone: 50,
          texte: 'Erwan organise l’entrepôt. Maëlys tient le [[planning des quais|planning]] des camions et saisit les réceptions.' },
      ] },
    { id: 'reperer', type: 'associer', titre: 'Où est-ce ?', heure: '7:06', parcours: 'parcours', deuxBlocs: true,
      texte: 'À toi. Je te montre une photo : dis-moi à quel endroit du tour elle a été prise.',
      aide: 'Associe chaque photo à son endroit.',
      liste: 'Les photos',
      consigne: 'Où est-ce ? <b>Clique son numéro sur le plan.</b>',
      consigneFini: 'Toutes les photos sont associées. Clique <b>Suivant</b>.',
      juste: 'Oui : n° {n}, {titre}.',
      faux: 'Non, pas le n° {n}. Regarde bien la photo, ou revois le tour.',
      photos: [{ id: 'vestiaire', image: 'vestiaire', n: 1 }, { id: 'reception', image: 'reception', n: 3 }, { id: 'quai', image: 'quai', n: 2 },
        { id: 'bureau', image: 'bureau', n: 6 }] },
  ],
  fin: { titre: 'Fin', heure: '7:10', image: 'quai', texte: 'Tu connais l’entrepôt. Maintenant, ton poste.', consigne: 'La visite est terminée.',
    grandTitre: 'Fin de la visite' },
};

// ─────────────────────────────────────────────────────────────── ② mon poste : l'inspection (vue « Inspection du poste ») et « En attendant »
// L'inspection est une FONCTION de la graine (`inspectionDe`, données) : le défaut du site est tiré par élève.
export const INSPECTION = (graine) => inspectionDe(graine);
const inspectionFaite = inspectionFinie(INSPECTION_ID);
export const FICHE_ATTENTE = {
  id: FICHES.attente, libelle: 'En attendant', titre: 'En attendant',
  sousTitre: 'Il manque quelque chose au site. Coche ce que tu fais en attendant.',
  bouton: 'Ouvrir la fiche « En attendant »',
  quand: (db) => inspectionFaite(db, ID) || envoyee(db, FICHES.attente),
  blocs: (db) => [{ type: 'cases', id: 'attente', titre: SITE[defautDeBase(db)].manque, consigne: 'Coche ce que tu fais en attendant.',
    choix: melangerPour(db, 'attente', casesAttente(db)).map((c) => ({ v: c.v, lib: c.lib })) }],
  envoi: { bouton: 'Envoyer la fiche à Erwan', a: 'Erwan', suite: 'Regarde tes messages.' },
};

// ─────────────────────────────────────────────────────────────── ③ « Lire le planning » et le planning des quais
export const FICHE_LIRE = {
  id: FICHES.lire, libelle: 'Lire le planning', titre: 'Lire le planning des quais',
  sousTitre: 'Le planning est à gauche. Réponds aux questions de Maëlys.',
  documents: ['planning-doc'], largeurDocs: 1.3,
  bouton: 'Ouvrir la fiche « Lire le planning »',
  quand: dejaEnvoyee(FICHES.attente),
  blocs: (db) => [...lecturesTirees(db), ...lecturesBonus(db)].map((p) => { const L = LECTURES[p.id];
    return { type: 'liste', id: p.id, lib: L.q, vide: 'Choisir…', choix: L.choix, manque: 'une réponse' }; }),
  envoi: { bouton: 'Envoyer la fiche à Maëlys', a: 'Maëlys', suite: 'Place maintenant le camion sur le planning des quais.' },
};
export const PLANNING = {
  id: PLANNING_ID, libelle: 'Planning des quais', titre: 'Planning des quais — 5 mai', date: '5 mai',
  quand: (db) => dejaEnvoyee(FICHES.lire)(db),
  infos: () => ['La Biscuiterie Ar Vag livre pendant <b>une heure</b>, <b>entre 10 h et 12 h</b>.',
    'Un quai ne reçoit qu’un camion à la fois : les blocs gris pointillés sont déjà pris.',
    'Un camion ne se met qu’à un quai prêt : l’extincteur à sa place.'],
  echelle: { type: 'heures', debut: ECHELLE.debut, fin: ECHELLE.fin, pas: ECHELLE.pas },
  lignes: { titre: 'Quais', liste: QUAIS.map((q) => ({ id: q.id, nom: q.nom,
    occupe: CAMIONS.filter((c) => c.quai === q.id).map((c) => ({ de: c.de, a: c.a, titre: c.titre })) })) },
  cartes: { titre: 'Le camion à placer',
    liste: [{ id: CARTE.id, titre: CARTE.titre, court: CARTE.court, famille: 'biscuits', des: CARTE.des, avant: CARTE.avant }],
    details: () => [], duree: () => CARTE.duree, nonPosees: () => 'Le camion de la Biscuiterie n’est pas encore posé.', legende: ' ' },
  familles: { biscuits: { couleur: '#8b5cf6', nom: 'violet', legende: 'Biscuiterie Ar Vag' } },
  regles: [
    { id: 'quai', type: 'unAlaFois', sur: 'ligne' },
    { id: 'fenetre', type: 'fenetre', message: { debut: () => 'Le camion arrive avant 10 h.', fin: () => 'Le camion finit après 12 h.' } },
  ],
  jalons: [{ id: 'place', lib: 'Le camion sur un quai libre, dans le créneau', regles: ['quai', 'fenetre'] }],
  aides: { consignes: { regles: 'Glisse le camion sur un quai, à l’heure où il arrive (ou clique-le, puis clique la case). Puis envoie le planning.' } },
};

// ─────────────────────────────────────────────────────────────── les messages (au tu ; 5 mai, aucun jour de la semaine)
const ERWAN = { nom: EQUIPE.erwan.nom, mail: mailDe('erwan') };
const MAELYS = { nom: EQUIPE.maelys.nom, mail: mailDe('maelys') };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: heureScenario(JOUR, o.heure || '07:00', { db: o.db, volet: ID_VOLET, decalage: o.decalage || 0 }),
  from: de.nom, fromMail: de.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
const merci = (de) => (prenom, n, db) => ({ mails: [mail(prenom, de, 'Bien reçu', `Bien reçu, merci.\n\n${de.nom}`, { db, heure: '07:29' })] });

export const VOLET = {
  id: ID_VOLET,
  semer: (prenom) => ({ mails: [
    mail(prenom, ERWAN, 'Ton premier jour',
      `Bonjour ${prenom} ! Aujourd’hui, tu tiens le poste de réception avec Yann. Je te donne les consignes, ensuite tu travailles seul ; `
        + 'je reste ton [[tuteur]], tu me [[rendre compte|rends compte]].\n\nOn commence par un tour de l’entrepôt. Ouvre « Visite de l’entrepôt ».\n\nErwan'),
  ] }),
  // « Corriger » : un accusé à chaque renvoi, jamais « juste ».
  corrections: { [FICHES.attente]: merci(ERWAN), [FICHES.lire]: merci(MAELYS), [PHRASES_ID]: merci(ERWAN) },
  declencheurs: [
    { id: 'poste', quand: apresGeste(`entrepot:${VISITE_ID}:visite:fin`),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Ton poste',
        'Avant de toucher un engin, on contrôle. Prends la liste « Ma prise de poste », regarde ton poste et le transpalette n° 1. '
          + 'Si quelque chose ne va pas, signale-le-moi. Pour essayer l’avertisseur, clique le bouton à la trompe, sous la poignée du timon. Ouvre « Mon poste ».\n\n'
          + 'Je te joins aussi « Le droit » : ce que dit la loi sur les jeunes et les engins.\n\nErwan',
        { db, heure: '07:10', extra: { pieces: ['prise-de-poste', 'droit-102'] } })] }) },
    { id: 'attente', quand: inspectionFaite,
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'En attendant',
        'Merci pour ton contrôle. Le site n’est pas fini : dis-moi ce que tu fais en attendant.\n\nErwan',
        { db, heure: '07:15', extra: { ouvreFiche: FICHES.attente } })] }) },
    { id: 'planning', quand: apresFiche(FICHES.attente),
      semer: (prenom, db) => ({ mails: [mail(prenom, MAELYS, 'Le planning des quais',
        `Salut ${prenom}, voici le [[planning des quais]] de ce matin. Réponds à mes questions, puis place la livraison de la Biscuiterie Ar Vag `
          + '(menu « Planning des quais »).\n\nMaëlys',
        { db, heure: '07:18', extra: { pieces: ['planning-doc'], ouvreFiche: FICHES.lire } })] }) },
    { id: 'compte-rendu', quand: apresPlanning(PLANNING_ID),
      semer: (prenom, db) => ({ mails: [
        mail(prenom, MAELYS, 'Le camion de la Biscuiterie', 'Merci, je préviens la Biscuiterie.\n\nMaëlys', { db, heure: '07:24' }),
        mail(prenom, ERWAN, 'Rends-moi compte',
          'Avant le retour de Loïc, [[rendre compte|rends-moi compte]] : ton engin, ce qui manque, l’heure de son camion.\n\n'
            + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nErwan',
          { db, heure: '07:25', extra: { phrases: phrasesCompteRendu(prenom, db) } }),
      ] }) },
    { id: 'fin', quand: apresMail({ a: ERWAN.mail }),
      semer: (prenom, db) => ({ mails: [mail(prenom, ERWAN, 'Merci',
        `Merci ${prenom}. Loïc revient à ${HEURE_LOIC} au ${QUAI_LOIC} : avec Yann, je reçois son camion. La semaine prochaine, on le reçoit ensemble.\n\nErwan`,
        { db, heure: '07:28' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons (poids validés par Tristan le 18/10/2026 à 22 h 03, brief §5)
// 16 points de jalons + 4 de questions (`part: 4`) = 20. Rien n'est vrai avant l'envoi (fiches, planning, phrases), le premier essai (visite)
// ou la prise de poste (inspection) : l'inaction vaut 0. La visite et l'inspection n'ont pas d'`ecran` : « Corriger » ne les rouvre pas.
export const GROUPES = { visite: 'Repérer l’entrepôt', poste: 'Mon poste', planning: 'Le planning', compte: 'Rendre compte' };
const POIDS_INSPECTION = { 'securite-site-manque': 2.5, 'essai-1': 1.5, 'securite-aucun-faux': 1.5 };
const TITRES_INSPECTION = { 'securite-site-manque': 'Mon poste : ce qui manque au site, signalé avant de prendre le poste',
  'essai-1': 'Mon poste : l’avertisseur du transpalette essayé', 'securite-aucun-faux': 'Mon poste : aucun faux signalement' };
const jalonsVisite = etapesEntrepot(VISITE).map((e) => { delete e.ecran; return Object.assign(e, { groupe: GROUPES.visite, poids: 0.75 }); });
const jalonsInspection = etapesInspection(INSPECTION, ID).map((e) => Object.assign(e, { groupe: GROUPES.poste, poids: POIDS_INSPECTION[e.id],
  titreBilan: TITRES_INSPECTION[e.id] }));
const casesCochees = (db) => { const v = valeurDe(db, FICHES.attente, 'attente'); return Array.isArray(v) ? v : []; };
const lectureRang = (k) => ({ id: `lecture-${k + 1}`, titre: `Le planning : la lecture n° ${k + 1}`, groupe: GROUPES.planning, poids: 1,
  ecran: `fiche:${FICHES.lire}`,
  verifier(db) { if (!envoyee(db, FICHES.lire)) return attente; const p = lecturesTirees(db)[k]; return p && valeurDe(db, FICHES.lire, p.id) === LECTURES[p.id].juste ? ok : ko; } });
// La carte : les règles du planning (quai libre, créneau) ET, quand l'extincteur du quai B manque, jamais au quai B.
const [jalonCarte] = etapesPlanning(PLANNING);
const ligneCR = (id, titre, lignes, poids) => ({ id, titre, groupe: GROUPES.compte, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return lignes.every((l) => r.justes.includes(l)) ? ok : ko; } });

export const ETAPES = [
  ...jalonsVisite,
  ...jalonsInspection,
  { id: 'en-attendant', titre: 'En attendant : ce que tu fais, rien de trop', groupe: GROUPES.poste, poids: 1.5, ecran: `fiche:${FICHES.attente}`,
    verifier: (db) => (!envoyee(db, FICHES.attente) ? attente : attenteJuste(defautDeBase(db), casesCochees(db)) ? ok : ko) },
  lectureRang(0), lectureRang(1),
  { id: jalonCarte.id, titre: 'Le planning : le camion sur un quai libre et prêt, dans le créneau', groupe: GROUPES.planning, poids: 1,
    ecran: `planning:${PLANNING_ID}`,
    verifier(db) {
      const r = jalonCarte.verifier(db);
      if (r.status !== 'ok') return r;
      const p = placeCarte(db);
      return defautDeBase(db) === 'extincteur' && p && p.r === 'B' ? ko : ok;
    } },
  ligneCR('cr-manque', 'Le compte rendu : ton engin et ce qui manque', ['engin', 'manque'], 1),
  ligneCR('cr-heure', 'Le compte rendu : l’heure du retour de Loïc', ['heure'], 1),
  ligneCR('cr-salutation', 'Le compte rendu : la salutation', ['salutation'], 0.5),
  ligneCR('cr-fin', 'Le compte rendu : la fin du message', ['fin'], 0.5),
  // Le cas bonus du confirmé (sans poids ni groupe, caché à l'élève) : `null` chez qui ne l'a pas reçu.
  { id: 'bonus-lecture', titre: 'Le planning : une lecture de plus', bonus: true,
    verifier(db) { const B = lecturesBonus(db); if (!B.length) return null; if (!envoyee(db, FICHES.lire)) return attente;
      return B.every((p) => valeurDe(db, FICHES.lire, p.id) === LECTURES[p.id].juste) ? ok : ko; } },
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, lexique, accueil, options
const inspectionFaiteBase = (db) => inspectionFaite(db, ID);
export const PASTILLES = [
  { libelle: 'Visite', fait: visiteFinie },
  { libelle: 'Mon poste', fait: (db) => inspectionFaiteBase(db) && dejaEnvoyee(FICHES.attente)(db) },
  { libelle: 'Planning', fait: (db) => dejaEnvoyee(FICHES.lire)(db) && planningEnvoye(db) },
  { libelle: 'Compte rendu', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
// L'ordre des écrans de travail (barre « Étape suivante » et menu « Mon poste », CAP).
export const SUITE = [
  { vue: 'entrepot', libelle: 'Visite de l’entrepôt', fait: visiteFinie },
  { vue: 'inspection', libelle: 'Mon poste', fait: inspectionFaiteBase },
  { vue: 'fiche', libelle: 'En attendant', fait: dejaEnvoyee(FICHES.attente) },
  { vue: `fiche:${FICHES.lire}`, libelle: 'Lire le planning', fait: dejaEnvoyee(FICHES.lire) },
  { vue: 'planning', libelle: 'Planning des quais', fait: planningEnvoye },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Erwan', fait: (db) => phrasesJustes(db, PHRASES_ID).envoye },
];
export const LEXIQUE_102 = {
  ...LEXIQUE,
  EPI: 'Équipements de protection individuelle : chaussures de sécurité, gilet, gants.',
  'local de charge': 'Local où l’on recharge les batteries des engins électriques.',
  'transpalette électrique': 'Transpalette à moteur : on marche à côté et on le guide avec le timon.',
  avertisseur: 'Le klaxon de l’engin : il prévient les piétons.',
  'arrêt d’urgence': 'Gros bouton qui coupe tout de suite le moteur de l’engin.',
  timon: 'Le long manche avec lequel on guide le transpalette.',
  extincteur: 'Appareil pour éteindre un début de feu. Il doit être à sa place, visible et dégagé.',
  'plan de circulation': 'Plan affiché qui montre où roulent les engins et où marchent les piétons.',
  'allée piétonne': 'Passage marqué au sol, réservé aux personnes à pied.',
  'planning des quais': 'Tableau qui montre quel camion arrive, à quelle heure, à quel quai.',
  'rendre compte': 'Dire à son responsable ce qu’on a fait ou vu, même quand tout va bien.',
};
export const MENTION_102 = `${MENTION} Construits aussi : la liste « Ma prise de poste » (d’après l’INRS), le planning du matin et ce qui manque au site.`;
export const ACCUEIL = {
  titre: 'Mon premier jour dans l’entrepôt neuf',
  kpis: ['mail'],
  etapes: [
    ['Lire le message d’Erwan', 'Menu Messagerie.'],
    ['① Repérer l’entrepôt', 'Menu Visite de l’entrepôt.'],
    ['② Mon poste', 'Contrôle ton poste et ton transpalette, signale ce qui ne va pas.'],
    ['③ Le planning des quais', 'Maëlys t’envoie le planning : lis-le, puis place un camion.'],
    ['④ Rendre compte', 'Réponds à Erwan, une phrase par ligne.'],
    ['Bon à savoir', MENTION_102],
  ],
};
export const FIN_FIGE = 'La visite et le contrôle du poste se jouent au premier essai, comme les questions d’Erwan : ils ne se rejouent pas.';

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 2 : mon premier jour',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE_102,
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  fiches: [FICHE_ATTENTE, FICHE_LIRE],
  planning: PLANNING,
  entrepot: VISITE,
  inspection: INSPECTION,
  // « Mon poste » n'ouvre qu'après la visite.
  fermetures: { inspection: { ouvertSi: (db) => visiteFinie(db), message: 'Après la visite' } },
  pastilles: PASTILLES,
  suite: SUITE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  finFige: FIN_FIGE,
};
