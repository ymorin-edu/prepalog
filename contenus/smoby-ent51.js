// ENT-5.1 — Smoby, « recruter le cariste de Noël » : les données de la séance (brief
// `docs/briefs/ENT-5.1-smoby-recrutement.md`). Univers commun : `contenus/smoby.js`.
//
// L'élève, en renfort au service RH, lit la fiche de poste et les cinq CV joints au message de Sophie,
// remplit la fiche de sélection (tableau de tri, candidat, contrat), puis répond à Sophie par phrases
// à choisir. Rien n'est jugé à l'écran avant l'envoi : le bilan dit quelles cases étaient fausses.
//
// Documents (fiche de poste, CV) : repris TELS QUELS de la maquette validée par Tristan le 04/10/2026
// (`docs/briefs/smoby/maquette-documents-fiche.html`), comme la page d'essai. Personnes, adresses,
// parcours : CONSTRUITS (CV fictifs, mention en pied de chaque document).
//
// Les valeurs attendues (tableau de tri, candidat retenu, contrat) sont CALCULÉES depuis la situation
// de chaque candidat (`CANDIDATS`) et la fiche de poste (`POSTE`), jamais recopiées.

import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { SOPHIE } from './smoby.js';

// La fiche envoyée, lue dans la base comme `ficheEnvoyee` (core/types/fiche.js), sans importer ce module :
// il tire `core/ui.js` et le thème, qui supposent un navigateur, et le corrigé de la séance (qui lit ce
// fichier) est aussi chargé hors navigateur par la suite de tests.
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}

// ─────────────────────────────────────────────────────────────── le poste et les candidats

// La fiche de poste, en données : ce qui sert à juger.
export const POSTE = { priseDePoste: '2026-12-09', fin: '2027-01-08', contrat: 'CDD', caces: '3', validiteAns: 5 };

// Ce que dit chaque CV, en données (mêmes faits que les documents ci-dessous). `caces` : catégorie →
// mois d'obtention ('AAAA-MM') ; `dispo` : date à partir de laquelle il peut commencer (null =
// immédiatement) ; `contrats` : ce qu'il accepte.
export const CANDIDATS = [
  { id: 'yanis', nom: 'Yanis Morel', caces: { 3: '2024-05', 5: '2024-05' }, dispo: '2026-11-30', contrats: ['CDD', 'CDI'] },
  { id: 'laura', nom: 'Laura Petit', caces: { 3: '2021-03' }, dispo: null, contrats: ['CDD', 'CDI'] },
  { id: 'mehdi', nom: 'Mehdi Benali', caces: { '1A': '2025-02' }, dispo: null, contrats: ['CDD', 'CDI'] },
  // « 2023 » sans mois sur son CV : janvier, le cas le moins favorable (valable quand même).
  { id: 'thomas', nom: 'Thomas Girod', caces: { 3: '2023-01' }, dispo: '2027-01-04', contrats: ['CDD'] },
  { id: 'sabrina', nom: 'Sabrina Lopez', caces: { 3: '2022-06', 5: '2022-06' }, dispo: null, contrats: ['CDI'] },
];

// Le CACES exigé est-il encore valable le jour de la prise de poste ? (obtenu + 5 ans ≥ prise de poste)
function cacesValide(c) {
  const obtenu = c.caces[POSTE.caces];
  if (!obtenu) return false;
  const [a, m] = obtenu.split('-').map(Number);
  const finValidite = `${a + POSTE.validiteAns}-${String(m).padStart(2, '0')}-01`;
  return finValidite >= POSTE.priseDePoste;
}
export const COLONNES = [
  { id: 'caces', lib: 'CACES 3 valide le 9/12', attendu: cacesValide },
  { id: 'dispo', lib: 'Disponible le 9/12', attendu: (c) => !c.dispo || c.dispo <= POSTE.priseDePoste },
  { id: 'cdd', lib: 'Accepte un CDD', attendu: (c) => c.contrats.includes(POSTE.contrat) },
];
// Le tableau attendu : { yanis: { caces: true, dispo: true, cdd: true }, … }.
export const TRI_ATTENDU = Object.fromEntries(CANDIDATS.map((c) => [c.id,
  Object.fromEntries(COLONNES.map((k) => [k.id, k.attendu(c)]))]));
// Le candidat à retenir : celui qui coche les trois critères (un seul, vérifié par les tests).
export const RETENU = CANDIDATS.find((c) => COLONNES.every((k) => TRI_ATTENDU[c.id][k.id]));

// ─────────────────────────────────────────────────────────────── les documents

export const STYLE_DOCUMENTS = `
--douce:#555047; --smoby:#E40613;
.pied{margin:0; font-size:.72rem; color:var(--douce); border-top:1px solid var(--filet); padding:6px 22px; text-align:right}
.ligne{display:grid; grid-template-columns:96px 1fr; gap:8px; margin:5px 0; font-size:.9rem}
.ligne .quand{color:var(--douce); font-size:.84rem}
.ligne b{display:block}
.cv ul{margin:4px 0; padding-left:18px; font-size:.9rem}
.recherche{background:rgba(156,98,10,.08); border-left:3px solid var(--terre); padding:7px 10px; font-size:.88rem; margin-top:12px}
/* 1 : bandeau à gauche (Yanis) */
.cv1{display:grid; grid-template-columns:170px 1fr}
.cv1 .gauche{background:rgba(16,124,65,.08); padding:22px 16px; font-size:.85rem}
.cv1 .gauche h3{font-size:.78rem; text-transform:uppercase; letter-spacing:.05em; color:#107c41; margin:16px 0 6px}
.cv1 .gauche h3:first-child{margin-top:0}
.cv1 .gauche p{margin:2px 0}
.cv1 .droite{padding:22px 22px 14px}
.cv1 .nom{font-size:1.4rem; font-weight:800; margin:0}
.cv1 .titre{color:#107c41; font-weight:600; margin:2px 0 14px}
.cv1 h2{font-size:.85rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #107c41; padding-bottom:3px; margin:14px 0 8px}
.cv1 .pied{grid-column:1 / -1}
/* 2 : classique centrée (Laura) */
.cv2 .corps{padding:24px 26px 14px}
.cv2 .nom{font-size:1.35rem; font-weight:700; text-align:center; margin:0; letter-spacing:.03em; text-transform:uppercase}
.cv2 .coord{text-align:center; color:var(--douce); font-size:.85rem; margin:4px 0 6px}
.cv2 .titre{text-align:center; font-weight:600; margin:0 0 14px; color:#9c620a}
.cv2 h2{font-size:.9rem; margin:14px 0 6px; color:#9c620a}
.cv2 h2::after{content:""; display:block; height:1px; background:var(--filet); margin-top:3px}
/* 3 : en-tête plein (Mehdi) */
.cv3 .tete{background:rgba(60,72,88,.12); padding:18px 24px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap}
.cv3 .nom{font-size:1.3rem; font-weight:800; margin:0}
.cv3 .titre{margin:2px 0 0; font-weight:600; color:#3c4858}
.cv3 .coord{font-size:.82rem; text-align:right; color:var(--douce)}
.cv3 .coord p{margin:1px 0}
.cv3 .dispo{margin:0; padding:7px 24px; font-size:.88rem; border-bottom:1px solid var(--filet)}
.cv3 .corps{padding:12px 24px 14px; display:grid; grid-template-columns:1fr 150px; gap:18px}
.cv3 h2{font-size:.82rem; text-transform:uppercase; letter-spacing:.06em; color:#3c4858; margin:12px 0 6px}
.cv3 .cote3{border-left:1px solid var(--filet); padding-left:14px; font-size:.84rem}
.cv3 .cote3 p{margin:3px 0}
/* 4 : tableau (Thomas) */
.cv4 .corps{padding:22px 24px 14px}
.cv4 .nom{font-size:1.25rem; font-weight:700; margin:0}
.cv4 .titre{margin:0 0 12px; color:var(--douce)}
.cv4 table{border-collapse:collapse; width:100%; font-size:.88rem}
.cv4 th{width:120px; text-align:left; vertical-align:top; padding:7px 10px 7px 0; color:#7a4a8c; font-weight:700; border-top:1px solid var(--filet)}
.cv4 td{padding:7px 0; border-top:1px solid var(--filet); vertical-align:top}
.cv4 td p{margin:0 0 4px}
/* 5 : profil en tête, colonne à droite (Sabrina) */
.cv5{display:grid; grid-template-columns:1fr 165px}
.cv5 .principal{padding:22px 20px 14px 24px}
.cv5 .nom{font-size:1.35rem; font-weight:300; margin:0; letter-spacing:.02em}
.cv5 .nom b{font-weight:800}
.cv5 .titre{margin:2px 0 10px; font-size:.9rem; color:#a33f6f; font-weight:600}
.cv5 .profil{font-style:italic; font-size:.9rem; border-top:1px solid var(--filet); border-bottom:1px solid var(--filet); padding:8px 0; margin:0 0 6px}
.cv5 h2{font-size:.85rem; color:#a33f6f; margin:12px 0 5px}
.cv5 .droite5{background:rgba(163,63,111,.07); padding:22px 14px; font-size:.83rem}
.cv5 .droite5 h3{font-size:.76rem; text-transform:uppercase; letter-spacing:.05em; margin:14px 0 5px; color:#a33f6f}
.cv5 .droite5 h3:first-child{margin-top:0}
.cv5 .droite5 p{margin:2px 0}
.cv5 .pied{grid-column:1 / -1}
/* Fiche de poste */
.fp .tete{display:flex; gap:12px; align-items:center; padding:16px 24px; border-bottom:3px solid var(--smoby)}
.fp .tete img{width:52px; height:52px}
.fp .tete p{margin:0}
.fp .tete .t{font-size:1.2rem; font-weight:800}
.fp .corps{padding:12px 24px 14px}
.fp h2{font-size:.88rem; text-transform:uppercase; letter-spacing:.05em; color:var(--smoby); margin:14px 0 6px}
.fp dl{display:grid; grid-template-columns:150px 1fr; gap:4px 10px; margin:0; font-size:.9rem}
.fp dt{color:var(--douce)}
.fp dd{margin:0}
.fp .caces{border:1px solid var(--smoby); border-radius:var(--r); padding:8px 12px; font-size:.88rem; margin-top:12px}
.fp .caces b:first-child{color:var(--smoby)}

`;

const PIED_CV = '<div class="pied">CV fictif — document pédagogique Prepalog</div>';
export const DOCUMENTS = [
  { id: 'poste', titre: 'Fiche de poste — cariste', court: 'Fiche de poste', html: `
  <article class="cv fp" aria-label="Fiche de poste">
    <div class="tete"><img src="./contenus/trames/logos/smoby.svg" alt="Smoby"><div><p class="t">Fiche de poste : [[cariste]]</p>
      <p class="note">Plateforme logistique de Moirans-en-Montagne (39) · Renfort pour le pic de Noël</p></div></div>
    <div class="corps">
      <h2>Le poste</h2>
      <dl>
        <dt>Missions</dt><dd>Décharger et charger les camions au chariot frontal, ranger les palettes dans les racks, préparer des palettes de commande.</dd>
        <dt>Lieu</dt><dd>Plateforme logistique, Moirans-en-Montagne (Jura)</dd>
        <dt>Horaires</dt><dd>En équipe, du lundi au vendredi : semaine du matin ou semaine de l'après-midi</dd>
      </dl>
      <h2>Le contrat</h2>
      <dl>
        <dt>Type</dt><dd><b>CDD saisonnier</b> (pic d'activité de Noël)</dd>
        <dt>Prise de poste</dt><dd><b>Mercredi 9 décembre 2026</b></dd>
        <dt>Fin du contrat</dt><dd>Vendredi 8 janvier 2027</dd>
      </dl>
      <h2>Le profil recherché</h2>
      <ul>
        <li><b>CACES R489 catégorie 3 exigé</b>, en cours de validité le jour de la prise de poste</li>
        <li>CACES R489 catégorie 5 apprécié</li>
        <li>Rigueur, respect des consignes de sécurité, travail en équipe</li>
      </ul>
      <div class="caces"><b>Le CACES, c'est quoi ?</b><br>
        Un certificat qui prouve que tu sais conduire un type d'engin. Une catégorie par sorte de chariot :
        1 = transpalette porté, 3 = chariot frontal, 5 = chariot à mât rétractable. Il est <b>valable 5 ans</b>.</div>
    </div>
    <div class="pied">Document pédagogique, reconstitution, non contractuel</div>
  </article>` },

  { id: 'yanis', titre: 'CV — Yanis Morel', court: 'Yanis Morel', html: `
  <article class="cv cv1" aria-label="CV de Yanis Morel">
    <div class="gauche">
      <h3>Contact</h3>
      <p>12 rue du Pré</p><p>39200 Saint-Claude</p><p>06 00 00 00 01</p><p>y.morel@exemple.fr</p>
      <h3>Permis et CACES</h3>
      <p><b>Permis B</b></p>
      <p><b>CACES R489 cat. 3</b><br>obtenu en mai 2024</p>
      <p><b>CACES R489 cat. 5</b><br>obtenu en mai 2024</p>
      <h3>Langues</h3>
      <p>Français</p><p>Anglais : notions</p>
      <h3>Centres d'intérêt</h3>
      <p>Football (club de Saint-Claude), VTT</p>
    </div>
    <div class="droite">
      <p class="nom">Yanis MOREL</p>
      <p class="titre">Cariste – magasinier</p>
      <h2>Expérience</h2>
      <div class="ligne"><span class="quand">2024 – 2026</span><span><b>Cariste (intérim)</b>Plateforme de distribution, Oyonnax (01)<br>Chargement et déchargement de camions, rangement en hauteur.</span></div>
      <div class="ligne"><span class="quand">2023</span><span><b>Préparateur de commandes</b>Entrepôt de matériaux, Lons-le-Saunier (39)</span></div>
      <h2>Formation</h2>
      <div class="ligne"><span class="quand">2024</span><span><b>Formation CACES R489 cat. 3 et 5</b>Centre de formation, Lons-le-Saunier</span></div>
      <div class="ligne"><span class="quand">2023</span><span><b>CAP Opérateur logistique</b>Lycée professionnel, Saint-Claude</span></div>
      <div class="recherche"><b>Ce que je recherche :</b> un poste de cariste, CDD ou CDI. <b>Disponible dès le 30 novembre 2026.</b></div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'laura', titre: 'CV — Laura Petit', court: 'Laura Petit', html: `
  <article class="cv cv2" aria-label="CV de Laura Petit">
    <div class="corps">
      <p class="nom">Laura Petit</p>
      <p class="coord">4 place de l'Église, 39260 Moirans-en-Montagne · 06 00 00 00 02 · laura.petit@exemple.fr</p>
      <p class="titre">Cariste expérimentée</p>
      <h2>Expériences professionnelles</h2>
      <div class="ligne"><span class="quand">2021 – 2025</span><span><b>Cariste</b>Usine de plasturgie, Oyonnax (01)<br>Approvisionnement des lignes au chariot frontal.</span></div>
      <div class="ligne"><span class="quand">2025 – 2026</span><span><b>Agente d'accueil</b>Office de tourisme, Saint-Claude (39)</span></div>
      <h2>Diplômes et certificats</h2>
      <div class="ligne"><span class="quand">2021</span><span><b>CACES R489 cat. 3</b>obtenu en mars 2021</span></div>
      <div class="ligne"><span class="quand">2019</span><span><b>Bac pro Métiers de la logistique</b>Lycée professionnel, Lons-le-Saunier</span></div>
      <h2>Compétences</h2>
      <ul><li>Conduite de chariot frontal</li><li>Lecture d'un bon de livraison</li><li>Travail en équipe</li></ul>
      <div class="recherche"><b>Ce que je recherche :</b> reprendre un poste de cariste, CDD accepté. <b>Disponible immédiatement.</b></div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'mehdi', titre: 'CV — Mehdi Benali', court: 'Mehdi Benali', html: `
  <article class="cv cv3" aria-label="CV de Mehdi Benali">
    <div class="tete">
      <div><p class="nom">Mehdi Benali</p><p class="titre">Préparateur de commandes</p></div>
      <div class="coord"><p>27 avenue Jean-Jaurès</p><p>01100 Oyonnax</p><p>06 00 00 00 03</p><p>mehdi.benali@exemple.fr</p></div>
    </div>
    <p class="dispo"><b>Disponible tout de suite</b> · CDD ou CDI</p>
    <div class="corps">
      <div>
        <h2>Parcours</h2>
        <div class="ligne"><span class="quand">2025 – 2026</span><span><b>Préparateur de commandes</b>Entrepôt de la grande distribution, Bourg-en-Bresse (01)<br>Préparation au transpalette électrique, filmage des palettes.</span></div>
        <div class="ligne"><span class="quand">2024</span><span><b>Employé de rayon (été)</b>Supermarché, Oyonnax (01)</span></div>
        <h2>Formation</h2>
        <div class="ligne"><span class="quand">2024</span><span><b>Bac pro Logistique</b>Lycée professionnel, Bourg-en-Bresse</span></div>
      </div>
      <div class="cote3">
        <h2>Habilitations</h2>
        <p><b>CACES R489 cat. 1A</b></p><p>obtenu en février 2025</p>
        <h2>Permis</h2>
        <p>Permis B</p>
        <h2>Atouts</h2>
        <p>Ponctuel</p><p>Esprit d'équipe</p><p>Habitué au froid</p>
      </div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'thomas', titre: 'CV — Thomas Girod', court: 'Thomas Girod', html: `
  <article class="cv cv4" aria-label="CV de Thomas Girod">
    <div class="corps">
      <p class="nom">Thomas GIROD</p>
      <p class="titre">Cariste · 18 chemin des Vignes, 39000 Lons-le-Saunier · 06 00 00 00 04 · t.girod@exemple.fr</p>
      <table>
        <tr><th>Expérience</th><td>
          <p><b>2023 – 2026 · Cariste</b>, fromagerie, Poligny (39) : réception des camions au chariot frontal, rangement en chambre froide.</p>
          <p><b>2021 – 2023 · Manutentionnaire</b>, scierie, Champagnole (39).</p></td></tr>
        <tr><th>Formations</th><td>
          <p><b>2023</b> · CACES R489 catégorie 3 (chariot frontal)</p>
          <p><b>2021</b> · CAP Opérateur logistique</p></td></tr>
        <tr><th>Disponibilité</th><td>En poste jusqu'au 31 décembre 2026. <b>Libre à partir du 4 janvier 2027.</b></td></tr>
        <tr><th>Contrat souhaité</th><td>CDD</td></tr>
        <tr><th>Divers</th><td>Permis B, véhicule personnel. Sapeur-pompier volontaire.</td></tr>
      </table>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'sabrina', titre: 'CV — Sabrina Lopez', court: 'Sabrina Lopez', html: `
  <article class="cv cv5" aria-label="CV de Sabrina Lopez">
    <div class="principal">
      <p class="nom">Sabrina <b>LOPEZ</b></p>
      <p class="titre">Cariste confirmée – chariots frontal et rétractable</p>
      <p class="profil">Cariste depuis 2022, disponible immédiatement. Je cherche aujourd'hui un emploi stable :
        <b>uniquement un CDI</b>, pour m'installer durablement dans la région.</p>
      <h2>Expérience</h2>
      <div class="ligne"><span class="quand">2022 – 2026</span><span><b>Cariste</b>Entrepôt de meubles, Saint-Claude (39)<br>Rangement en hauteur au chariot rétractable, inventaires.</span></div>
      <div class="ligne"><span class="quand">2020 – 2022</span><span><b>Agente de quai</b>Messagerie, Lons-le-Saunier (39)</span></div>
      <h2>Formation</h2>
      <div class="ligne"><span class="quand">2020</span><span><b>Bac pro Logistique</b>Lycée professionnel, Morez (39)</span></div>
    </div>
    <div class="droite5">
      <h3>Coordonnées</h3>
      <p>9 rue Carnot</p><p>39200 Saint-Claude</p><p>06 00 00 00 05</p><p>s.lopez@exemple.fr</p>
      <h3>Habilitations</h3>
      <p>CACES R489 cat. 3</p><p>CACES R489 cat. 5</p><p class="note">obtenus en juin 2022</p>
      <h3>Permis</h3>
      <p>Permis B</p>
      <h3>Loisirs</h3>
      <p>Randonnée, chorale</p>
    </div>
    ${PIED_CV}
  </article>` },
];

// ─────────────────────────────────────────────────────────────── la fiche de sélection

export const FICHE = {
  id: 'selection', libelle: 'Fiche de sélection', titre: 'Fiche de sélection',
  sousTitre: 'Poste : cariste en CDD saisonnier, prise de poste le mercredi 9 décembre 2026.',
  documents: DOCUMENTS.map((d) => d.id),
  bouton: 'Ouvrir la fiche de sélection',
  blocs: [
    { type: 'ouinon', id: 'tri', titre: '1. Tableau de tri', entete: 'Candidat',
      lignes: CANDIDATS.map((c) => ({ id: c.id, lib: c.nom })),
      colonnes: COLONNES.map((k) => ({ id: k.id, lib: k.lib })) },
    { type: 'liste', id: 'candidat', titre: '2. Mon choix', lib: 'Je retiens', vide: 'Choisir un candidat…', manque: 'le candidat',
      choix: CANDIDATS.map((c) => ({ v: c.id, lib: c.nom })) },
    { type: 'choix', id: 'contrat', lib: 'Contrat proposé', manque: 'le contrat', choix: ['CDD', 'CDI'] },
    { type: 'encadre', titre: 'CDD ou CDI ?', texte: 'CDI : contrat sans date de fin. CDD : contrat avec une date de fin, pour un '
      + 'besoin limité dans le temps (un pic d’activité, un remplacement). Le CDD saisonnier sert aux activités qui reviennent '
      + 'chaque année à la même période.' },
  ],
  envoi: { bouton: 'Envoyer la fiche à Sophie', a: 'Sophie', suite: 'Sophie va te répondre dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── la réponse à Sophie

// Brief §4, étape 6. `juste` = rang dans l'ordre déclaré ; l'ordre affiché est tiré par élève.
export const PHRASES = {
  id: 'reponse-sophie',
  lignes: [
    { id: 'salutation', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
    { id: 'choix', choix: CANDIDATS.map((c) => `Je retiens la candidature de ${c.nom}`), juste: CANDIDATS.indexOf(RETENU) },
    { id: 'raison', choix: [
      'car ce candidat a le CACES 3 valide, est disponible le 9 décembre et accepte un CDD.',
      'car ce candidat habite le plus près.',
      'car ce candidat a le CACES.'], juste: 0 },
    { id: 'contrat', choix: ['Je propose un CDD saisonnier.', 'Je propose un CDI.'], juste: 0 },
    { id: 'fin', choix: ['Peux-tu valider ? Merci, bonne journée.', 'Merci de valider vite', 'Bisous'], juste: 0 },
  ],
  melanger: true,
};

// ─────────────────────────────────────────────────────────────── les messages

export const SUJET_CHOIX = 'Ton choix pour le poste de cariste';
// La suite n'arrive qu'après la réponse PAR PHRASES (une réponse libre au premier message ne compte pas).
const repondu = (db) => phrasesJustes(db, PHRASES.id).envoye;

export const VOLET = {
  id: 'smoby-ent51',
  semer: (prenom) => ({
    mails: [{
      folder: 'in', ts: Date.now() - 60000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: 'Recrutement du cariste de Noël', kind: 'text',
      text: `Bonjour ${prenom}, bienvenue au service RH !\n\n`
        + 'Pour le pic de Noël, la plateforme a besoin d’un [[cariste]] en [[CDD]] [[saisonnier]], à partir du mercredi 9 décembre.\n\n'
        + 'Voici la [[fiche de poste]] et les 5 CV reçus. Remplis la fiche de sélection, puis dis-moi qui tu retiens.\n\nSophie',
      pieces: DOCUMENTS.map((d) => d.id),
      ouvreFiche: FICHE.id,
    }],
  }),
  declencheurs: [{
    // La fiche envoyée (juste ou fausse) : Sophie demande la réponse, par phrases.
    id: 'fiche-recue',
    quand: apresFiche(FICHE.id),
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 1000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: SUJET_CHOIX, kind: 'text',
      text: `Merci ${prenom}, j’ai bien reçu ta fiche.\n\n`
        + 'Écris-moi maintenant qui tu retiens, pourquoi, et quel contrat tu proposes ([[CDD]] ou [[CDI]]).\n\n'
        + 'Clique sur « Répondre » et choisis une phrase par ligne.\n\nSophie',
      phrases: PHRASES,
    }] }),
  }, {
    // La réponse envoyée (juste ou fausse) : la suite de l'histoire, sans dire si c'était juste.
    id: 'reponse',
    quand: repondu,
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now() + 2000, from: SOPHIE.nom, fromMail: SOPHIE.mail, to: prenom,
      subject: `RE : ${SUJET_CHOIX}`, kind: 'text',
      text: 'Merci ! La direction valide Yanis. Il arrive le mercredi 9 décembre : on prépare son arrivée la prochaine fois.\n\nSophie',
    }] }),
  }],
};

// ─────────────────────────────────────────────────────────────── les jalons (9, brief §5)

const nomDe = (id) => (CANDIDATS.find((c) => c.id === id) || {}).nom || id;

// 1 à 5 : la ligne de chaque candidat (ses trois cases). Rien n'est vrai avant l'envoi de la fiche.
const jalonsLignes = CANDIDATS.map((c) => ({
  id: `ligne-${c.id}`,
  titre: `Tableau de tri : la ligne de ${c.nom} est juste`,
  verifier(db) {
    const f = ficheEnvoyee(db, FICHE.id);
    if (!f.envoye) return { status: 'attente' };
    const l = (f.valeurs.tri || {})[c.id] || {};
    const fausses = COLONNES.filter((k) => l[k.id] !== TRI_ATTENDU[c.id][k.id]);
    if (!fausses.length) return { status: 'ok' };
    const s = fausses.length > 1 ? 's' : '';
    return { status: 'ko', detail: `Case${s} fausse${s} : ${fausses.map((k) => `« ${k.lib} »`).join(', ')}.` };
  },
}));

export const ETAPES = [
  ...jalonsLignes,
  {
    id: 'candidat',
    titre: 'Le bon candidat est retenu',
    verifier(db) {
      const f = ficheEnvoyee(db, FICHE.id);
      if (!f.envoye) return { status: 'attente' };
      return f.valeurs.candidat === RETENU.id ? { status: 'ok' }
        : { status: 'ko', detail: `${nomDe(f.valeurs.candidat)} ne remplit pas les trois critères du tableau.` };
    },
  },
  {
    id: 'contrat',
    titre: 'Le bon contrat est choisi',
    verifier(db) {
      const f = ficheEnvoyee(db, FICHE.id);
      if (!f.envoye) return { status: 'attente' };
      return f.valeurs.contrat === POSTE.contrat ? { status: 'ok' }
        : { status: 'ko', detail: 'Relis la fiche de poste : le besoin est limité au pic de Noël.' };
    },
  },
  {
    id: 'raison',
    titre: 'Message à Sophie : la raison est complète',
    verifier(db) {
      const r = phrasesJustes(db, PHRASES.id);
      if (!r.envoye) return { status: 'attente' };
      return r.justes.includes('raison') ? { status: 'ok' }
        : { status: 'ko', detail: 'La raison doit reprendre les trois critères du tableau.' };
    },
  },
  {
    id: 'ton',
    titre: 'Message à Sophie : le ton est professionnel',
    verifier(db) {
      const r = phrasesJustes(db, PHRASES.id);
      if (!r.envoye) return { status: 'attente' };
      return r.justes.includes('salutation') && r.justes.includes('fin') ? { status: 'ok' }
        : { status: 'ko', detail: 'Salutation et formule de fin : on écrit à une collègue, au travail.' };
    },
  },
];

// ─────────────────────────────────────────────────────────────── l'accueil

export const ACCUEIL = {
  titre: 'Recruter le cariste de Noël',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sophie', 'Menu Messagerie : la fiche de poste et les 5 CV sont joints au message.'],
    ['Remplir la fiche de sélection', 'Pour chaque candidat : CACES 3 valide ? disponible le 9 décembre ? accepte un CDD ? Puis ton choix et le contrat.'],
    ['Répondre à Sophie', 'Quand elle a reçu ta fiche : « Répondre », puis une phrase par ligne.'],
    ['Bon à savoir', 'Smoby et sa plateforme de Moirans-en-Montagne sont réels. Sophie, les candidats et leurs CV sont inventés pour l’exercice.'],
  ],
};
