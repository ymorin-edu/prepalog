// Page d'ESSAI de la vue « Inspection du poste » (chantier Transports Pelleau, lot B, phase 1 ; 19/10/2026).
// Brief `docs/briefs/MOTEUR-inspection-poste.md`, décisions `docs/briefs/COORDINATION-pelleau.md` §2 (points 1 à 8).
//
// RIEN N'EST BRANCHÉ DANS LE MOTEUR : la page monte la scène avec la logique pure de `outils/essai-inspection-poste-logique.js`
// (qui ira dans `core/types/inspection.js` en phase 2) et un FAUX état en mémoire (`db.inspections[<séance>][<id>]`, comme le
// rangera la vue). Les objets sont ceux du kit (`core/iso.js`).
//   Partie 1 : chaque objet dans chaque état, seul (`data-essai-objet`, `data-etat`) : se reconnaît-il sans légende ?
//   Partie 2 : la scène cliquable avec la déclaration d'exemple (brief §3), en guidage.
//   Partie 3 : la même scène en copie (évaluation) : aucune réparation, aucun commentaire, aucun arrêt.
//
// Page : outils/essai-inspection-poste.html (servie par `lancer.bat`, http://localhost:8000/outils/essai-inspection-poste.html).

import { projection, boiteEcran, transpaletteElectrique, boitesTranspalette, ETATS_TRANSPALETTE, TEINTES_TRANSPALETTE,
  extincteur, boitesExtincteur, ETATS_EXTINCTEUR, affichage, boitesAffichage, ETATS_AFFICHAGE, borneCharge, prisesBorne } from '../core/iso.js';
import { ech } from '../core/texte.js';
import { secondClic } from '../core/gestes.js';
import { VUES_INSPECTION, verifierInspection, inspectionNeuve, etatsInspection, sceneDe, zonesInspection, recouvrements,
  numerosDessines, textes, cliquer, retirerMarque, signaler, essayer, valider, jalonsInspection, marquesSvg, texteMarques } from './essai-inspection-poste-logique.js';

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
  const z = zones.map((b) => { const r = boiteEcran(I, b, 10); return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(47,95,158,.08)" stroke="#2f5f9e" stroke-width="2" stroke-dasharray="6 4"/>`; }).join('');
  return `<figure class="eip-vignette"><figcaption>${ech(LIB[objet][etat])}</figcaption>
    <svg viewBox="${cadre.x} ${cadre.y} ${cadre.w} ${cadre.h}" role="img" aria-label="${ech(LIB[objet].titre)} : ${ech(LIB[objet][etat])}"><g>${s}</g><g data-zones>${z}</g></svg></figure>`;
}
export function monterObjets(hote) {
  let teinte = 'jaune';
  const dessiner = () => {
    hote.querySelector('[data-objets]').innerHTML = [
      ['transpalette', ETATS_TRANSPALETTE], ['extincteur', ETATS_EXTINCTEUR], ['affichage', ETATS_AFFICHAGE], ['borne', ['decor']],
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

/* ================================================================ parties 2 et 3 : la scène cliquable */
// Monte l'inspection dans `hote`. `copie` : évaluation. `seance` : l'id de la séance (l'état est cloisonné par séance).
// `essaiTous` : un bouton d'avertisseur par engin DESSINÉ (au lieu de : par engin déclaré avec un essai).
export function monterInspection(hote, { declaration = INSPECTION_EXEMPLE, copie = false, seance = 'ESSAI-10.2', essaiTous = false, arret = true } = {}) {
  const D = Object.assign(JSON.parse(JSON.stringify(declaration)), { arret });
  const ecarts = verifierInspection(D);
  if (ecarts.length) { hote.innerHTML = `<div class="quai-alerte" role="alert"><b>Déclaration refusée :</b><ul>${ecarts.map((e) => `<li>${ech(e)}</li>`).join('')}</ul></div>`; return null; }
  const db = { inspections: { [seance]: { [D.id]: inspectionNeuve() } }, gestes: [] };
  const st = db.inspections[seance][D.id];
  const T = textes(D);
  const vues = D.vues || ['charge', 'quai'];
  const ui = { vue: vues[0], arme: false, arret: false, essai: '', zones: false };
  const publier = (g) => { db.gestes.push(`inspection:${D.id}:${g}`); };
  const majuscule = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
  const numerosEssai = () => (essaiTous ? numerosDessines(D) : [].concat(D.essai || []).map((e) => e.n));

  function html() {
    const et = etatsInspection(D, st, { copie });
    const V = VUES_INSPECTION[ui.vue], [vx, vy, vw, vh] = V.viewBox;
    const dis = st.fait ? 'disabled' : '';
    const zones = ui.zones ? zonesInspection(D, et).filter((z) => z.vue === ui.vue).map((z) => z.rects.map((r) =>
      `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(47,95,158,.08)" stroke="#2f5f9e" stroke-width="2" stroke-dasharray="6 4" pointer-events="none"/>`).join('')
      + `<text x="${z.rects[0].x + 4}" y="${z.rects[0].y + 14}" font-size="13" font-weight="700" fill="#2f5f9e" pointer-events="none">${ech(z.id)}</text>`).join('') : '';
    const bascule = vues.length < 2 ? '' : `<p class="quai-ligne eip-bascule" role="group" aria-label="Où regarder">${vues.map((v) =>
      `<button type="button" class="btn${v === ui.vue ? ' btn-p' : ''}" data-i="vue" data-v="${v}" aria-pressed="${v === ui.vue}" ${dis}>${ech(VUES_INSPECTION[v].titre)}</button>`).join('')}</p>`;
    const essais = ui.vue !== 'charge' ? '' : numerosEssai().map((n) => `<button type="button" class="btn" data-i="essai" data-n="${n}" ${dis}>Essayer l’avertisseur du n° ${n}</button>`).join('');
    return `<div data-i-inspection>
      <p class="quai-secu-scene" data-i-consigne>${ech(D.consigne || 'Clique sur ce qui ne va pas, puis signale-le.')}</p>
      ${bascule}
      <div class="quai-scene2 quai-iso quai-inspection eip-scene">
        <svg data-i-scene data-vue="${ui.vue}" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="${ech(V.aria)}"><g data-g="iso">${sceneDe(ui.vue, et)}</g><g>${zones}</g><g data-i-marques>${marquesSvg(st, ui.vue)}</g></svg>
      </div>
      ${essais ? `<p class="quai-ligne">${essais}</p>` : ''}
      ${ui.essai ? `<p class="eip-essai" role="status" data-i-essai>${ech(ui.essai)}</p>` : ''}
      <div data-i-chef role="status" ${st.chef ? 'class="quai-alerte"' : ''}>${st.chef ? `<b>${ech(majuscule(T.qui))} :</b> « ${ech(st.chef)} »` : ''}</div>
      ${ui.arret ? `<div class="quai-alerte" role="alert" data-i-arret><b>${ech(majuscule(T.qui))} :</b> « ${ech(T.arret)} »</div>` : ''}
      ${st.fait ? '<p class="note" data-i-fige>Tu as pris ton poste : l’inspection est figée.</p>' : ''}
      <p class="quai-ligne">
        <button type="button" class="btn" data-i="signaler" ${dis}>Signaler à ${ech(T.qui)}</button>
        <span class="note" data-i-nb>${texteMarques(st)}</span>
        <button type="button" class="btn btn-p${ui.arme ? ' quai-arme' : ''}" data-i="valider" ${dis}>${ui.arme ? ech(T.confirmer) : `${ech(T.commencer)} →`}</button>
        ${ui.arme ? '<button type="button" class="btn" data-i="desarmer">Annuler</button>' : ''}
      </p>
    </div>`;
  }
  const panneau = () => {
    const J = jalonsInspection(D, st);
    return `<details class="eip-jalons" open><summary>Les jalons, calculés maintenant (l’élève ne les voit qu’au bilan)</summary>
      <table class="quai-bilan"><thead><tr><th>Jalon</th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${J.map((l) =>
        `<tr data-jalon="${l.id}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ pas (encore) juste'}</td></tr>`).join('')}</tbody></table>
      <p class="note">Gestes publiés : ${db.gestes.length ? db.gestes.map((g) => `<code>${ech(g)}</code>`).join(', ') : 'aucun'}. Déclencheur <code>inspectionFinie('${ech(D.id)}')</code> : ${st.fait ? 'oui' : 'non'}.</p>
      <p class="note">État rangé (<code>db.inspections['${ech(seance)}']['${ech(D.id)}']</code>) : marques ${st.marques.length}, signaux ${st.signaux.length}, essais [${st.essais.join(', ')}], arrêté ${st.arrete ? 'oui' : 'non'}, figé ${st.fait ? 'oui' : 'non'}.</p>
      <p class="note">Recouvrement de zones entre deux points : ${ech(recouvrements(D, etatsInspection(D, st, { copie })).join(' · ') || 'aucun')}.</p></details>`;
  };
  const scene = document.createElement('div'), infos = document.createElement('div');
  hote.replaceChildren(scene, infos);
  function rendre(focus) {
    scene.innerHTML = html();
    infos.innerHTML = panneau();
    if (focus) { const b = scene.querySelector(focus); if (b && !b.disabled) b.focus(); }
    const svg = scene.querySelector('[data-i-scene]');
    svg.addEventListener('click', (ev) => {
      if (st.fait) return;
      const sur = ev.target.closest && ev.target.closest('[data-i-marque]');
      if (sur) { if (retirerMarque(st, +sur.getAttribute('data-i-marque'))) changer(); return; }
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const M = svg.getScreenCTM();
      if (!M) return;
      const p = pt.matrixTransform(M.inverse()), [vx, vy, vw, vh] = VUES_INSPECTION[ui.vue].viewBox;
      if (p.x < vx || p.x > vx + vw || p.y < vy || p.y > vy + vh) return;
      if (cliquer(D, st, ui.vue, Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10, { copie })) changer();
    });
  }
  // Une marque posée ou retirée : seules la couche des marques et le compteur changent (comme au quai) ; un « C'est bon » armé se désarme.
  function changer() {
    if (ui.arme) { ui.arme = false; rendre(); return; }
    scene.querySelector('[data-i-marques]').innerHTML = marquesSvg(st, ui.vue);
    scene.querySelector('[data-i-nb]').textContent = texteMarques(st);
    infos.innerHTML = panneau();
  }
  scene.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-i]');
    if (!b || b.disabled) return;
    const quoi = b.dataset.i, focus = `[data-i="${quoi}"]${b.dataset.n ? `[data-n="${b.dataset.n}"]` : ''}${b.dataset.v ? `[data-v="${b.dataset.v}"]` : ''}`;
    if (quoi === 'vue') { ui.vue = b.dataset.v; ui.arme = false; ui.essai = ''; }
    else if (quoi === 'essai') {
      ui.arme = false;
      const r = essayer(D, st, +b.dataset.n);
      ui.essai = r.texte;
      if (r.premier) publier('essai');
    } else if (quoi === 'signaler') {
      ui.arme = false;
      if (signaler(D, st, { copie })) { publier('signaler'); ui.arret = false; }
    } else if (quoi === 'valider') {
      if (!secondClic(ui, 'arme')) { rendre(focus); return; }
      const r = valider(D, st, { copie });
      ui.arret = r === 'arret';
      if (r === 'fait') { publier('fini'); ui.essai = ''; }
    } else if (quoi === 'desarmer') ui.arme = false;
    rendre(focus);
  });
  rendre();
  return {
    db, st, D, ui,
    montrerZones(v) { ui.zones = v; rendre(); },
  };
}
