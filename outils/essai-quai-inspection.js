// Page d'ESSAI du kit de sécurité du quai iso (chantier moteur D-4, brief `docs/briefs/MOTEUR-quai-inspection.md`,
// étape 1) : les deux vues du quai (« dehors » : le camion devant la façade ; « dedans » : le quai vu de l'intérieur,
// porte levée), les objets de sécurité et un sélecteur d'état par objet. Ce fichier ne dessine rien lui-même : il
// assemble les objets de `core/iso.js` comme le fera la vue quai (étape 2), avec les MÊMES projections et les mêmes
// cadres que le quai d'ENT-1.1 (`core/types/quai.js` : `sceneArrivee`, `imageIso`).
//
// Il sert à deux choses : Tristan regarde chaque objet dans chaque état (est-il reconnaissable seul ?), et la suite
// de tests (`outils/test/quai-iso.mjs`) vérifie que la zone cliquable de chaque objet le contient et le touche.
//
// Page : outils/essai-quai-inspection.html (servie par `lancer.bat`, http://localhost:8000/outils/essai-quai-inspection.html).

import { projection, facadeQuai, camionPorteur, X_PORTE_FACADE, horlogeQuai, solQuai, niveleur, remorqueInterieur,
  murQuai, ouvertureQuai, lampeQuai, boitesCamion, boitesButoirs, boitesNiveleur, boitesLampe, boiteEcran } from '../core/iso.js';

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
