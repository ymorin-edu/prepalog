// Page d'ESSAI de la vue « Inspection du poste » (chantier Transports Pelleau ; maquette du lot B, 19/10/2026, validée par Tristan à
// l'écran ; branchée dans le moteur au lot G-5, même jour). Brief `docs/briefs/MOTEUR-inspection-poste.md`, décisions
// `docs/briefs/COORDINATION-pelleau.md` §2 (points 1 à 8).
//
//   Partie 1 : chaque objet du kit (`core/iso.js`) dans chaque état, seul (`data-essai-objet`, `data-etat`) : se reconnaît-il sans légende ?
//              21/10/2026 : plus la tête de timon de près (le bouton de l'avertisseur, qu'on clique pour l'essayer) ; sa zone de clic,
//              à part de celle de l'engin, se montre en tirets courts quand « Montrer les zones » est coché.
//   Partie 2 : la scène cliquable avec la déclaration d'exemple (brief §3), en guidage, DANS LE VRAI MOTEUR d'entreprise
//              (`creerEntreprise` avec un faux univers et un faux `ctx`, comme `outils/essai-quai-inspection.js`) : ce que verra l'élève.
//   Partie 3 : la même scène en copie (évaluation) : aucune réparation, aucun commentaire, aucun arrêt.
// La logique vit dans `core/types/inspection.js` (déplacée de l'ancien `essai-inspection-poste-logique.js`). Rien n'est envoyé nulle part :
// la base de l'élève est un objet en mémoire.
//
// Page : outils/essai-inspection-poste.html (servie par `lancer.bat`, http://localhost:8000/outils/essai-inspection-poste.html).

import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette, ETATS_TRANSPALETTE, TEINTES_TRANSPALETTE,
  extincteur, boitesExtincteur, ETATS_EXTINCTEUR, affichage, boitesAffichage, ETATS_AFFICHAGE, borneCharge, prisesBorne } from '../core/iso.js';
import { ech } from '../core/texte.js';
import { creerEntreprise } from '../core/types/entreprise.js';
import { etapesInspection, lignesInspection, etatInspection, recouvrements, etatsInspection } from '../core/types/inspection.js';
import { univers } from './essai-animation.js';

/* ================================================================ la déclaration d'exemple (brief §3) */
// Deux transpalettes : le n° 1 en ordre (un piège), le n° 2 à la fourche tordue et à l'avertisseur muet ; l'extincteur du quai
// absent et NON réparable ; le plan de circulation affiché (un piège). Textes construits pour l'essai (ENT-10.2 les écrira).
// « Il arrive jeudi » du brief devient « demain » (FDR §0.7 : jamais le jour de la semaine dans un message).
export const INSPECTION_EXEMPLE = {
  id: 'pelleau-poste-102',
  libelle: 'Mon poste',
  qui: 'Erwan',
  consigne: 'Regarde ton poste et ton transpalette. Clique ce qui ne va pas, puis signale-le à Erwan.',
  vues: ['charge', 'quai'],
  points: [
    { id: 'tp1', objet: 'transpalette', n: 1, etat: 'ok', ok: true, lib: 'Transpalette n° 1 en ordre' },
    { id: 'tp2-fourche', objet: 'transpalette', n: 2, etat: 'fourcheTordue', ok: false, lib: 'Fourche tordue sur le transpalette n° 2',
      repare: 'Bien vu. Je le mets de côté : prends le n° 1.' },
    { id: 'extincteur', objet: 'extincteur', etat: 'absent', ok: false, reparable: false, lib: 'Extincteur absent au quai B',
      repare: 'Merci. Il arrive demain. En attendant, on ne travaille pas au quai B.' },
    { id: 'plan', objet: 'affichage', etat: 'affiche', ok: true, lib: 'Plan de circulation affiché' },
  ],
  essai: { objet: 'transpalette', n: 2, resultat: 'muet' },
  arret: true,
  commencer: 'C’est bon, je prends mon poste',
  bilan: 'Avant de prendre ton poste, tu regardes ton engin et ton poste, et tu signales tout ce qui ne va pas.',
};

/* ================================================================ partie 1 : chaque objet, chaque état */
const LIB = {
  transpalette: { titre: 'Transpalette électrique', ok: 'En ordre', fourcheTordue: 'Fourche tordue', roueAbimee: 'Roue abîmée',
    batterie: 'Batterie (voyant rouge, câble débranché)', arretUrgence: 'Bouton d’arrêt d’urgence absent', fuite: 'Fuite (flaque)' },
  extincteur: { titre: 'Extincteur', present: 'Présent', absent: 'Absent (support vide)' },
  affichage: { titre: 'Plan de circulation', affiche: 'Affiché', absent: 'Absent (cadre vide)' },
  borne: { titre: 'Borne de charge (décor)', decor: 'Décor' },
  tete: { titre: 'Tête de timon, de près (21/10/2026)', avertisseur: 'Le bouton de l’avertisseur (on le clique pour l’essayer)' },
};
// Une vignette : un bout de sol et de mur, l'objet, et sa zone (cachée sauf « Montrer les zones »).
function vignette(objet, etat, teinte) {
  const I = projection({ unite: 100, origine: [300, 200] }), { face, boite } = I;
  let s = face([[-4, 0, 0], [4, 0, 0], [4, 4, 0], [-4, 4, 0]], '#e4dfd3', 'none') + boite(-4, -0.3, 0, 8, 0.3, 2.2, ['#b9b3a6', '#c9c3b6', '#a9a397']);
  let cadre, zones = [];
  if (objet === 'transpalette') {
    const prise = prisesBorne([1.15, 0])[0];
    s += borneCharge(I, [1.15, 0]) + transpaletteElectrique(I, [0, 0.3], etat, { n: 2, teinte, prise, essai: true });
    zones = boitesTranspalette(etat, [0, 0.3], prise);
    cadre = boiteEcran(I, [[-0.3, 0.15, 0, 1.2, 2.0, 1.4]], 6);
  } else if (objet === 'tete') {
    // La tête de timon de près : le transpalette dessiné plus grand, le cadre serré sur la tête et le bouton de l'avertisseur.
    const J = projection({ unite: 420, origine: [300, 560] });
    s = J.face([[-4, 0, 0], [4, 0, 0], [4, 4, 0], [-4, 4, 0]], '#e4dfd3', 'none') + transpaletteElectrique(J, [0, 0.3], 'ok', { n: 2, teinte, essai: true });
    const za = boiteEcran(J, boitesTranspalette('ok', [0, 0.3]).avertisseur, 3);
    cadre = boiteEcran(J, [[0.05, 0.3, 0.95, 0.8, 0.75, 1.32]], 6);
    return `<figure class="eip-vignette"><figcaption>${ech(LIB.tete.avertisseur)}</figcaption>
    <svg viewBox="${cadre.x} ${cadre.y} ${cadre.w} ${cadre.h}" role="img" aria-label="${ech(LIB.tete.titre)}"><g>${s}</g><g data-zones><rect x="${za.x}" y="${za.y}" width="${za.w}" height="${za.h}" fill="rgba(47,95,158,.08)" stroke="#2f5f9e" stroke-width="2" stroke-dasharray="2 3"/></g></svg></figure>`;
  } else if (objet === 'extincteur') {
    s += extincteur(I, [0.4, 0], etat, { essai: true });
    zones = boitesExtincteur([0.4, 0]);
    cadre = boiteEcran(I, [[-0.25, 0, 0.35, 1.05, 0.55, 1.95]], 6);
  } else if (objet === 'affichage') {
    s += affichage(I, [0, 0], etat, { essai: true });
    zones = boitesAffichage([0, 0]);
    cadre = boiteEcran(I, [[-0.15, 0, 0.7, 1.45, 0.45, 1.95]], 6);
  } else {
    s += borneCharge(I, [0.3, 0], { essai: true });
    cadre = boiteEcran(I, [[-0.35, 0, 0.55, 0.95, 0.45, 2.0]], 6);
  }
  const z = zones.map((b) => { const r = boiteEcran(I, b, 10); return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(47,95,158,.08)" stroke="#2f5f9e" stroke-width="2" stroke-dasharray="6 4"/>`; }).join('')
    // 21/10/2026 : la zone du bouton de l'avertisseur, à part (tirets courts) : un clic y vaut l'essai quand l'essai est déclaré.
    + (zones.avertisseur ? (() => { const r = boiteEcran(I, zones.avertisseur, 3); return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#1a1915" stroke-width="2" stroke-dasharray="2 3"/>`; })() : '');
  return `<figure class="eip-vignette"><figcaption>${ech(LIB[objet][etat])}</figcaption>
    <svg viewBox="${cadre.x} ${cadre.y} ${cadre.w} ${cadre.h}" role="img" aria-label="${ech(LIB[objet].titre)} : ${ech(LIB[objet][etat])}"><g>${s}</g><g data-zones>${z}</g></svg></figure>`;
}
export function monterObjets(hote) {
  let teinte = 'jaune';
  const dessiner = () => {
    hote.querySelector('[data-objets]').innerHTML = [
      ['transpalette', ETATS_TRANSPALETTE], ['tete', ['avertisseur']], ['extincteur', ETATS_EXTINCTEUR], ['affichage', ETATS_AFFICHAGE], ['borne', ['decor']],
    ].map(([o, E]) => `<section class="eip-objet"><h3>${ech(LIB[o].titre)}</h3><div class="eip-grille">${E.map((e) => vignette(o, e, teinte)).join('')}</div></section>`).join('');
  };
  hote.innerHTML = `
    <form class="eip-reglages" data-reglages-objets aria-label="Réglages des vignettes">
      <fieldset><legend>Teinte du transpalette</legend>
        ${Object.keys(TEINTES_TRANSPALETTE).map((t) => `<label><input type="radio" name="teinte" value="${t}"${t === teinte ? ' checked' : ''}> ${t}</label>`).join('')}</fieldset>
      <fieldset><legend>Zones</legend><label><input type="checkbox" data-montrer-zones> Montrer les zones (là où l'élève pourra cliquer)</label></fieldset>
    </form>
    <div data-objets></div>`;
  hote.querySelector('[data-reglages-objets]').addEventListener('change', (ev) => {
    if (ev.target.name === 'teinte') { teinte = ev.target.value; dessiner(); }
    if (ev.target.matches('[data-montrer-zones]')) hote.classList.toggle('eip-zones', ev.target.checked);
  });
  dessiner();
}

/* ================================================================ parties 2 et 3 : la vue dans le vrai moteur */
// L'univers d'une séance d'essai : le moteur d'entreprise avec cette seule inspection (décor neutre de l'essai de l'animation).
// `seance` : l'id de la séance (l'état est cloisonné par séance) ; `copie` : une évaluation. Les jalons sont ceux de la vue, sans poids.
export function universInspection(D = INSPECTION_EXEMPLE, { copie = false, seance = 'essai-inspection' } = {}) {
  // `menu: []` : une prise de poste CAP n'a pas d'écrans de données ; sans lui, le menu (Commandes, Stock…) fait défiler la page à 1280 × 720.
  return Object.assign(univers(), { inspection: D, animations: [], etapes: etapesInspection(D, seance, { copie }), copie, menu: [],
    ENTREPRISE: { id: 'essai-inspection-poste', nom: 'Essai de l’inspection', sousTitre: 'Prise de poste',
      exercice: 'Essai de l’inspection du poste' } });
}

// Monte une séance d'essai dans `hote`, ouvre l'écran « Mon poste » et tient à jour, à côté, ce que l'élève ne voit qu'au bilan.
export function monterInspection(hote, infos, { declaration = INSPECTION_EXEMPLE, copie = false, seance = 'essai-inspection', arret = true } = {}) {
  const D = Object.assign(JSON.parse(JSON.stringify(declaration)), { arret });
  let db = {};
  const panneau = () => {
    const L = lignesInspection(D, db, seance, { copie });
    const st = etatInspection(db, seance, D.id);
    const G = Object.keys((db.gestes && db.gestes[seance]) || {});
    infos.innerHTML = `<details class="eip-jalons" open><summary>Les jalons, calculés maintenant (l’élève ne les voit qu’au bilan)</summary>
      <table class="quai-bilan"><thead><tr><th>Jalon</th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) =>
        `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ pas (encore) juste'}</td></tr>`).join('')}</tbody></table>
      <p class="note">Gestes publiés : ${G.length ? G.map((g) => `<code>${ech(g)}</code>`).join(', ') : 'aucun'}. Déclencheur <code>inspectionFinie('${ech(D.id)}')</code> : ${st && st.fait ? 'oui' : 'non'}.</p>
      <p class="note">État rangé (<code>db.inspections['${ech(seance)}']['${ech(D.id)}']</code>) : ${st ? `marques ${st.marques.length}, signaux ${st.signaux.length}, essais [${st.essais.join(', ')}], arrêté ${st.arrete ? 'oui' : 'non'}, figé ${st.fait ? 'oui' : 'non'}` : 'rien encore'}.</p>
      <p class="note">Recouvrement de zones entre deux points : ${ech(recouvrements(D, etatsInspection(D, st, { copie })).join(' · ') || 'aucun')}.</p></details>`;
  };
  function lancer() {
    db = {};
    const h = document.createElement('div');
    h.setAttribute('data-hote-inspection', '');
    hote.replaceChildren(h);
    const ctx = {
      meta: { id: seance, code: 'ESSAI', titre: 'Essai de l’inspection du poste', portee: 'eleve', immersif: true, temps: copie ? 'evaluation' : 'guidage', ...(copie ? { copie: true } : {}) },
      profil: { prenom: 'Essai', nom: 'Inspection', role: 'eleve', uid: 'essai-eleve' },
      jeu: { etat: () => db, sauver: panneau },
      enregistrer: () => {}, quitter: () => { lancer(); }, codeStock: 'ESSAI', lireScore: async () => null,
      rendreCopie: async () => ({ rendu: Date.now() }),
    };
    try { creerEntreprise(universInspection(D, { copie, seance })).rendre(h, ctx); }
    catch (x) { h.innerHTML = `<div class="avis avis-err" role="alert"><b>Déclaration refusée :</b> ${ech(x.message)}</div>`; return; }
    h.querySelector('.ent-nav[data-vue="inspection"]')?.click();
    panneau();
  }
  lancer();
  return { db: () => db, D, relancer: lancer };
}
