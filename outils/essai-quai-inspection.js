// Page d'ESSAI du kit de sécurité du quai iso (chantier moteur D-4, brief `docs/briefs/MOTEUR-quai-inspection.md`,
// étape 1) : les deux vues du quai (« dehors » : le camion devant la façade ; « dedans » : le quai vu de l'intérieur,
// porte levée), les objets de sécurité et un sélecteur d'état par objet. Ce fichier ne dessine rien lui-même : il
// assemble les objets de `core/iso.js` comme le fera la vue quai (étape 2), avec les MÊMES projections et les mêmes
// cadres que le quai d'ENT-1.1 (`core/types/quai.js` : `sceneArrivee`, `imageIso`).
//
// Il sert à deux choses : Tristan regarde chaque objet dans chaque état (est-il reconnaissable seul ?), et la suite
// de tests (`outils/test/quai-iso.mjs`) vérifie que la zone cliquable de chaque objet le contient et le touche.
//
// ÉTAPE 2 : la partie 2 (en bas du fichier) monte la scène d'ENT-6.4 dans le vrai moteur d'entreprise.
//
// Page : outils/essai-quai-inspection.html (servie par `lancer.bat`, http://localhost:8000/outils/essai-quai-inspection.html).

import { projection, facadeQuai, camionPorteur, X_PORTE_FACADE, horlogeQuai, solQuai, niveleur, remorqueInterieur,
  murQuai, ouvertureQuai, lampeQuai, boitesCamion, boitesButoirs, boitesNiveleur, boitesLampe, boiteEcran } from '../core/iso.js';
import { creerEntreprise } from '../core/types/entreprise.js';
import { etapesQuai, jalonsQuai } from '../core/types/quai.js';
import { univers } from './essai-animation.js';

// Les deux vues : projection et cadre (viewBox) du quai d'ENT-1.1.
export const VUES = {
  dehors: { unite: 54, origine: [330, 150], viewBox: '70 -30 800 520' },
  dedans: { unite: 60, origine: [470, 235], viewBox: '290 0 640 480' },
};
const projeter = (vue) => projection({ unite: VUES[vue].unite, origine: VUES[vue].origine });

// Les objets, la vue où on les voit et leurs états possibles (le premier est l'état de départ de la page).
// `null` = l'objet n'est pas dessiné (défaut du kit pour la cale et la lampe).
export const OBJETS = {
  cabine: { vue: 'dehors', etats: ['conduite', 'vide'] },
  fumee: { vue: 'dehors', etats: [true, false] },
  cale: { vue: 'dehors', etats: ['posee', 'absente', null] },
  butoirs: { vue: 'dehors', etats: ['enPlace', 'absents'] },
  niveleur: { vue: 'dedans', etats: ['pose', 'releve'] },
  lampe: { vue: 'dedans', etats: ['allumee', 'eteinte', null] },
};
export const ETATS_DEPART = { cabine: 'conduite', fumee: true, cale: 'posee', butoirs: 'enPlace', niveleur: 'pose', lampe: 'allumee' };
// Les mêmes objets avec leurs états par défaut (ce que dessine le kit sans aucune option).
export const PORTE_CAMION = 1;     // le camion est à la porte du milieu de la façade
export const YR_QUAI = 0.35;       // et reculé jusqu'au bout (comme `sceneArrivee`)

// Le SVG de la vue « dehors » (sans l'élément <svg>). `essai` : entoure chaque objet d'un groupe nommé.
export function sceneDehors(etats, essai = false) {
  const I = projeter('dehors');
  const o = { essai };
  return facadeQuai(I, ['6', '7', '8'], etats.butoirs ? Object.assign({ butoirs: { porte: PORTE_CAMION, etat: etats.butoirs } }, o) : o)
    + camionPorteur(I, X_PORTE_FACADE[PORTE_CAMION], YR_QUAI, Object.assign({}, o,
      etats.cabine ? { cabine: etats.cabine } : {}, etats.fumee ? { fumee: true } : {}, etats.cale ? { cale: etats.cale } : {}))
    + horlogeQuai(I, 0.2, 0.01, 2.35, '10:30');
}
// Le SVG de la vue « dedans » : porte levée, remorque visible par l'ouverture.
export function sceneDedans(etats, essai = false) {
  const I = projeter('dedans');
  const lampe = etats.lampe ? lampeQuai(I, etats.lampe, { essai }) : { cone: '', tete: '' };
  const n = etats.niveleur || 'pose';
  return `<defs><clipPath id="essaiOuv"><polygon points="${ouvertureQuai(I)}"/></clipPath></defs>`
    + solQuai(I, 'Zone de réception')
    + `<g clip-path="url(#essaiOuv)">${remorqueInterieur(I)}${niveleur(I, 'dedans', n, { essai })}${lampe.cone}</g>`
    + murQuai(I, 1, 'Quai 7') + niveleur(I, 'dehors', n, { essai }) + lampe.tete
    + horlogeQuai(I, 6.6, 0.01, 2.25, '10:30');
}

// Les zones cliquables de chaque objet dessiné, en unités du viewBox de sa vue : { objet: { vue, x, y, w, h } }.
// Une cale ou une lampe « non dessinée » n'a pas de zone ; la fumée n'en a que si le moteur tourne.
export function zones(etats, marge = 12) {
  const Z = {}, cam = boitesCamion(X_PORTE_FACADE[PORTE_CAMION], YR_QUAI, {});
  const mettre = (nom, boites) => { Z[nom] = Object.assign({ vue: OBJETS[nom].vue }, boiteEcran(projeter(OBJETS[nom].vue), boites, marge)); };
  mettre('cabine', cam.cabine);
  if (etats.fumee) mettre('fumee', cam.fumee);
  if (etats.cale) mettre('cale', cam.cale);
  mettre('butoirs', boitesButoirs(PORTE_CAMION));
  mettre('niveleur', boitesNiveleur(etats.niveleur || 'pose'));
  if (etats.lampe) mettre('lampe', boitesLampe());
  return Z;
}

const LIBELLES = {
  cabine: { titre: 'Chauffeur', conduite: 'Au volant', vide: 'Cabine vide' },
  fumee: { titre: 'Moteur', true: 'Tourne (fumée)', false: 'Arrêté' },
  cale: { titre: 'Cale de roue', posee: 'Cale posée', absente: 'Pas de cale', null: 'Non dessinée' },
  butoirs: { titre: 'Butoirs', enPlace: 'En place', absents: 'Absents' },
  niveleur: { titre: 'Niveleur', pose: 'Posé', releve: 'Relevé (le vide)' },
  lampe: { titre: 'Lampe de quai', allumee: 'Allumée', eteinte: 'Éteinte', null: 'Non dessinée' },
};

// Monte la page dans `hote` : les réglages, les deux vues, la case « montrer les zones ».
export function monter(hote) {
  const etats = Object.assign({}, ETATS_DEPART);
  hote.innerHTML = `
    <form class="eqi-reglages" data-reglages aria-label="État de chaque objet">
      ${Object.keys(OBJETS).map((nom) => `<fieldset><legend>${LIBELLES[nom].titre}</legend>${OBJETS[nom].etats.map((e) => `
        <label><input type="radio" name="${nom}" value="${e}"${etats[nom] === e ? ' checked' : ''}> ${LIBELLES[nom][e]}</label>`).join('')}</fieldset>`).join('')}
    </form>
    <div class="eqi-options">
      <label><input type="checkbox" data-montrer-zones> Montrer les zones (les rectangles où l'élève pourra cliquer)</label>
      <label><input type="checkbox" data-calme> Mouvement réduit (simulé : la fumée s'arrête, mais reste dessinée)</label>
    </div>
    <div class="eqi-vues">
      <figure><figcaption>Vue de dehors</figcaption>
        <svg data-vue="dehors" viewBox="${VUES.dehors.viewBox}" role="img" aria-label="Le camion à quai devant la façade"><g data-scene></g><g data-zones></g></svg></figure>
      <figure><figcaption>Vue de dedans (porte levée)</figcaption>
        <svg data-vue="dedans" viewBox="${VUES.dedans.viewBox}" role="img" aria-label="Le quai vu de l'intérieur, porte levée"><g data-scene></g><g data-zones></g></svg></figure>
    </div>`;
  const svg = (vue) => hote.querySelector(`svg[data-vue="${vue}"]`);
  function dessiner() {
    svg('dehors').querySelector('[data-scene]').innerHTML = sceneDehors(etats, true);
    svg('dedans').querySelector('[data-scene]').innerHTML = sceneDedans(etats, true);
    const Z = zones(etats);
    for (const vue of Object.keys(VUES)) {
      svg(vue).querySelector('[data-zones]').innerHTML = Object.entries(Z).filter(([, z]) => z.vue === vue).map(([nom, z]) =>
        `<rect data-zone="${nom}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="rgba(47,95,158,.08)" stroke="#2f5f9e" stroke-width="2" stroke-dasharray="6 4"/>`
        + `<text x="${z.x + 4}" y="${z.y + 14}" font-size="13" font-weight="700" fill="#2f5f9e">${nom}</text>`).join('');
    }
  }
  hote.querySelector('[data-reglages]').addEventListener('change', (ev) => {
    const el = ev.target;
    if (!el.name || !(el.name in etats)) return;
    const brut = el.value;
    etats[el.name] = brut === 'true' ? true : brut === 'false' ? false : brut === 'null' ? null : brut;
    dessiner();
  });
  hote.querySelector('[data-montrer-zones]').addEventListener('change', (ev) => hote.classList.toggle('eqi-zones', ev.target.checked));
  hote.querySelector('[data-calme]').addEventListener('change', (ev) => hote.classList.toggle('eqi-calme', ev.target.checked));
  dessiner();
  return { etats, dessiner };
}

/* ==================================================================================================================
   PARTIE 2 (étape 2 du chantier D-4) — la scène d'ENT-6.4 dans le VRAI moteur (`core/types/quai.js`, `securite.mode: 'scene'`).
   Rien n'est dessiné ici : on déclare le quai d'ENT-6.4 (bloc `securite` du brief ENT-6.4 §6) et on monte `creerEntreprise`, comme
   le fait une vraie séance. La palette de cartons n'est qu'un prétexte pour jouer la suite (les fûts viennent à l'étape 3).
   ================================================================================================================== */

// Le bloc `securite` d'ENT-6.4 : deux défauts (le chauffeur au volant moteur allumé ; le niveleur relevé) et trois pièges (la
// cale, les butoirs et la lampe sont en ordre). Les `lib` ne s'affichent JAMAIS pendant l'inspection : ils servent au bilan.
export const SECURITE_ENT64 = {
  mode: 'scene',
  arret: false,
  consigne: 'Clique sur ce qui ne va pas, puis signale-le à Nadia.',
  points: [
    { id: 'cabine', objet: 'cabine', etat: 'conduite', vue: 'dehors', ok: false, lib: 'Chauffeur au volant, moteur allumé',
      repare: 'Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend.' },
    { id: 'niveleur', objet: 'niveleur', etat: 'releve', vue: 'dedans', ok: false, lib: 'Niveleur relevé',
      repare: 'Bien vu : je pose le niveleur.' },
    { id: 'cale', objet: 'cale', etat: 'posee', vue: 'dehors', ok: true, lib: 'Cale de roue' },
    { id: 'butoirs', objet: 'butoirs', etat: 'enPlace', vue: 'dehors', ok: true, lib: 'Butoirs de quai' },
    { id: 'lampe', objet: 'lampe', etat: 'allumee', vue: 'dedans', ok: true, lib: 'Lampe de quai' },
  ],
  signaler: { qui: 'Nadia', rien: 'Là, je ne vois rien qui cloche.', fin: 'Tu me dis quand on peut décharger.' },
  bilan: 'La scène n’était pas sûre : avant d’entrer dans un camion, il doit être immobilisé et le passage vers la remorque doit être sûr.',
};

// Le quai d'essai : le quai iso d'ENT-6.4 (sans froid, un camion, une palette de cartons quelconque pour la suite).
// `securite` : une autre déclaration (les tests y passent des variantes) ; `arret` : l'arrêt de Nadia (ENT-6.4 : non).
export function quaiEssai({ arret = false, securite = null } = {}) {
  const S = securite || Object.assign({}, SECURITE_ENT64, { arret });
  return {
    id: 'essai-inspection', rendu: 'iso', froid: false, motifs: ['avarie', 'manquant'],
    titre: 'Plateforme de Buchelay — Quai 12 (page d’essai)',
    avertissement: 'Page d’essai du chantier D-4 : le quai, le camion et la palette sont construits pour l’essai.',
    lieu: { nom: 'Quai 12', temp: 15, refrigere: false }, zone: { nom: 'Zone de réception' },
    dechargement: { ouverture: 0.5, parPalette: 1, par: 'chauffeur' }, aides: { consignes: true },
    camions: [{ transporteur: 'Transporteur d’essai', fournisseur: 'Brasserie d’essai', bl: 'BL-ESSAI-01', arrivee: '07:30',
      parole: 'Bonjour ! Livraison de la brasserie pour la plateforme. Voilà mon bon de livraison : on y va ?',
      palettes: [{ id: 'P1', ref: 'ESS-CAR', nom: 'Cartons d’essai', bl: 8, W: 2, D: 2, L: 2, manque: [], avarie: {}, attendu: 'accepter', motifAttendu: 'aucun',
        etiq: { ref: 'ESS-CAR', nom: 'CARTONS D’ESSAI', poids: '1 carton d’essai', lot: 'ESS-26-0001' } }] }],
    securite: S,
  };
}

// L'univers d'une séance d'essai : le moteur d'entreprise avec ce seul quai. `copie` : simule une évaluation (tests).
export function universQuai(Q, { copie = false } = {}) {
  return Object.assign(univers(), { quai: Q, animations: [], etapes: etapesQuai(Q), copie,
    ENTREPRISE: { id: 'essai-inspection', nom: 'France Boissons — essai de l’inspection', sousTitre: 'Plateforme — quai de réception', exercice: 'Essai de l’inspection du quai' } });
}

// Monte la partie 2 dans `hote` : réglages, jalons de sécurité (ce que l'élève ne voit qu'au bilan), et l'inspection.
export function monterScene(hote) {
  hote.innerHTML = `
    <form class="eqi-reglages" data-reglages-scene aria-label="Réglages de l'essai">
      <fieldset><legend>Nadia et l'oubli d'un défaut</legend>
        <label><input type="radio" name="arret" value="non" checked> ne l'arrête pas (ENT-6.4)</label>
        <label><input type="radio" name="arret" value="oui"> l'arrête (guidage)</label></fieldset>
      <fieldset><legend>Essai</legend>
        <button type="button" data-recommencer-scene>Tout remettre à zéro</button></fieldset>
    </form>
    <details class="eqi-declare"><summary>Ce que la séance a déclaré (pour toi, jamais pour l'élève)</summary>
      <ul>${SECURITE_ENT64.points.map((p) => `<li><b>${p.objet}</b>, ${p.vue === 'dehors' ? 'dehors' : 'dedans'}, ${p.etat} : ${p.ok ? 'en ordre (piège)' : '<b>défaut</b>'} — ${p.lib}</li>`).join('')}</ul></details>
    <div data-seance-scene></div>
    <details class="eqi-jalons" data-jalons-secu open><summary>Les jalons de sécurité, calculés maintenant (l'élève ne les voit qu'au bilan)</summary>
      <div data-jalons-corps></div></details>`;
  const corps = hote.querySelector('[data-jalons-corps]'), seance = hote.querySelector('[data-seance-scene]');
  let db = {}, Q = null;
  const majJalons = () => {
    if (!Q) return;
    const L = jalonsQuai(db, Q).L.filter((l) => /^securite-/.test(l.id));
    corps.innerHTML = `<table class="quai-bilan"><thead><tr><th>Jalon</th><th>Ce que l'élève a fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) =>
      `<tr><td>${l.lib}</td><td>${l.fait}</td><td>${l.attendu}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ pas (encore) juste'}</td></tr>`).join('')}</tbody></table>
      <p class="note">Phrase du bilan (affichée au bilan du quai si un de ces jalons est faux) : « ${Q.securite.bilan} »</p>`;
  };
  function lancer() {
    db = {};
    Q = quaiEssai({ arret: hote.querySelector('input[name="arret"]:checked').value === 'oui' });
    const h = document.createElement('div');
    h.setAttribute('data-hote-quai', '');
    seance.replaceChildren(h);
    const ctx = {
      meta: { id: 'essai-inspection', code: 'ESSAI', titre: 'Essai de l’inspection', portee: 'eleve', immersif: true, temps: 'guidage', bareme: 2 },
      profil: { prenom: 'Essai', nom: 'Inspection', role: 'eleve', uid: 'essai-eleve' },
      jeu: { etat: () => db, sauver: majJalons },
      enregistrer: () => {}, quitter: () => { lancer(); }, codeStock: 'ESSAI', lireScore: async () => null,
    };
    creerEntreprise(universQuai(Q)).rendre(h, ctx);
    h.querySelector('.ent-nav[data-vue="quai"]')?.click();
    majJalons();
    window.__essaiScene = { db: () => db, quai: () => Q };
  }
  hote.querySelector('[data-reglages-scene]').addEventListener('change', lancer);
  hote.querySelector('[data-recommencer-scene]').addEventListener('click', lancer);
  lancer();
}
