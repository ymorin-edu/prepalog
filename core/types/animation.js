// La vue « ANIMATION À QUESTIONS » (05/10/2026, brief `docs/briefs/MOTEUR-vue-animation.md`, lots 2 et 3).
//
// Une scène isométrique (kit `core/iso.js`) rejoue un geste du métier dont la conséquence se voit (une
// palette coincée au fond d'un couloir, un camion qui avance sans cale…), s'ARRÊTE, pose une question à
// choix, montre la correction, puis enchaîne la partie suivante. Référence de rendu et d'interaction : la
// maquette d'ENT-6.5 (`docs/briefs/france-boissons/animation-6.5-couloir-2temps.html`).
//
// Deux usages, un seul lecteur :
//   - dans une séance Simulog, un ÉCRAN DU MENU (« Mon poste ») : `animation` (ou `animations: [A, B]`)
//     dans `creerEntreprise` ; jalons par `etapesAnimation(A)` ;
//   - hors Simulog, une activité Prepalog sans scénario : `creerAnimation(A)` rend `{ rendre, noter }`
//     (une question = un point, `meta.bareme` = nombre de questions).
//
// Principe pédagogique (alerte 23) : l'animation vient AVANT la décision. Le moteur ne verrouille rien
// (décision par défaut du brief, §12-3) : c'est la séance qui la place en premier dans son déroulé.
//
// ── CE QUE LA SÉANCE DÉCLARE ────────────────────────────────────────────────────────────────────────
//   {
//     id: 'fb-fifo',              // clé de l'état dans la base de l'élève, JAMAIS modifiée
//     libelle: 'Comprendre le FIFO',   // entrée du menu
//     vitesse: 0.8,               // facultatif (1 par défaut) ; les attentes et les déplacements sont divisés par elle
//     alt: 'Animation : …',       // texte de remplacement de la scène
//     scene: { decor: [...], lots: { S20: { couleur: 'jaune' } }, acteurs: { chariot: { type: 'chariotFrontal' } } },
//     parties: [{ titre, depart: { palettes: [{ id, lot, place, futs?, etiquette? }] }, pas: [...], question? }],
//     aRetenir: 'texte (HTML court permis : <b>, <u>)',
//   }
// Décor, charges et acteurs : voir `core/iso.js`. Les PAS (fermés, connus du moteur) :
//   { legende: 'html' }                       — numérotée toute seule, sur toutes les parties
//   { attendre: ms }
//   { nouvelle: 'a', charge?: 'retention', futs?: 4, lot? }  — une charge, invisible tant qu'on ne la pose pas
//   { placer: 'a', place: 'M01.fond' }        — sans mouvement
//   { geste: 'poser' | 'reprendre', acteur: 'chariot', objet: 'a', place? }
//   { etiquette: 'a', texte, ton?: 'neutre' | 'ok' | 'alerte' }  — texte au sol près de la charge
//   { alerte: ['a', 'b'] } / { finAlerte: [...] }  — la pastille « ! »
//   { bulle: 'nom', lignes: [...], vers: place | objet | [x, y, z], hauteur?, decalage: [dx, dy], ton?, fleche?, largeur? }
//   { effacer: ['nom', …] }                   — les bulles, par leur nom
// Places nommées, pas de coordonnées dans le script (sauf `vers` d'une bulle, qui peut viser un point).
// Question : { id, titre, enonce, choix: [...], juste: rang DANS L'ORDRE DÉCLARÉ, explication, suite? }.
// Un pas inconnu, une place ou un objet qui n'existe pas, un `juste` hors des choix : la séance ne se
// charge pas, avec un message clair (on ne découvre pas en classe une animation qui s'arrête au milieu).
//
// ── L'ÉTAT DANS LA BASE DE L'ÉLÈVE (cloisonné : `db.animations[<id>]`) ────────────────────────────
//   { reponses: { q1: { premiere: 1, juste: true, quand } }, ordres: { q1: [2, 0, 3, 1] }, partie: 1 }
//   - `premiere` : rang (ordre déclaré) du PREMIER choix validé, écrit une fois, jamais réécrit. Les jalons
//     lisent `premiere` contre le `juste` déclaré (pas le `juste` rangé, qui n'est qu'un témoin).
//   - `ordres` : l'ordre d'affichage des choix, tiré par élève (graine = son identifiant) et rangé à la
//     première ouverture de la question : le même à chaque retour, sur tous les postes.
//   - `partie` : la partie la plus loin qu'il peut ouvrir (0 = la première) ; pas de saut en avant.
// L'enseignant navigue librement, voit la bonne réponse marquée, et rien n'est écrit pour lui.

import { ech, toast, memoriserFocus, retrouverFocus } from '../ui.js';
import { hasard } from '../tirage.js';
import { projection, DEFS, compilerScene, dessinerDecor, bornesDecor, dessinerObjets, HAUT_RETENTION,
  TYPES_CHARGE, GESTES } from '../iso.js';

export const TYPES_PAS = ['legende', 'attendre', 'nouvelle', 'placer', 'geste', 'etiquette', 'alerte', 'finAlerte', 'bulle', 'effacer'];
const TONS_BULLE = ['neutre', 'ok', 'alerte'];
const ECART_DEHORS = 0.6;   // le chariot qui ressort avec une charge va un peu plus loin (maquette)

/* ================================================================ compilation */
// Vérifie tout le contenu en rejouant le script « à blanc » (sans dessiner) : chaque objet nommé doit
// exister au moment où on s'en sert, chaque place aussi, une charge ne se pose pas sur une place prise.
const typeDePas = (p) => (p && typeof p === 'object' ? TYPES_PAS.find((t) => t in p) : null);

export function compilerAnimation(A) {
  const ou = `animation ${A && A.id ? A.id : '(sans id)'}`;
  const err = (m) => { throw new Error(`${ou} : ${m}`); };
  if (!A || !A.id) err('il manque l\'`id` (clé de l\'état dans la base de l\'élève)');
  if (!Array.isArray(A.parties) || !A.parties.length) err('`parties` manque (au moins une partie)');
  const sc = compilerScene(A.scene, ou);
  const vitesse = A.vitesse == null ? 1 : +A.vitesse;
  if (!(vitesse > 0)) err('`vitesse` doit être un nombre positif');
  const questions = [];
  let numero = 0;
  const parties = A.parties.map((Pt, k) => {
    const ici = `partie ${k + 1}`;
    if (!Pt || !Array.isArray(Pt.pas)) err(`${ici} : \`pas\` manque`);
    // L'état « à blanc » : où est chaque charge (null = pas posée), quelles bulles sont affichées.
    const pos = new Map();
    const bulles = new Set();
    const place = (nom, lieu) => {
      if (!sc.places[nom]) err(`${lieu} : place inconnue « ${nom} » (places : ${Object.keys(sc.places).join(', ')})`);
      return nom;
    };
    const occupee = (nom) => [...pos.values()].some((v) => v && sc.places[v] === sc.places[nom]);
    const objet = (id, lieu) => { if (!pos.has(id)) err(`${lieu} : objet « ${id} » pas encore créé (\`nouvelle\` ou \`depart\`)`); return id; };
    const lot = (l, lieu) => { if (l != null && !sc.lots[l]) err(`${lieu} : lot « ${l} » absent de \`scene.lots\``); };
    const charge = (o, lieu) => {
      if (o.charge != null && !TYPES_CHARGE.includes(o.charge)) err(`${lieu} : charge inconnue « ${o.charge} » (charges du kit : ${TYPES_CHARGE.join(', ')})`);
      if (o.futs != null && !(Number.isInteger(o.futs) && o.futs >= 0 && o.futs <= 4)) err(`${lieu} : \`futs\` va de 0 à 4`);
      lot(o.lot, lieu);
    };
    ((Pt.depart && Pt.depart.palettes) || []).forEach((p, i) => {
      const lieu = `${ici}, départ n° ${i + 1}`;
      if (!p || !p.id) err(`${lieu} : il manque l'\`id\``);
      if (pos.has(p.id)) err(`${lieu} : objet « ${p.id} » déclaré deux fois`);
      charge(p, lieu);
      place(p.place, lieu);
      if (occupee(p.place)) err(`${lieu} : la place ${p.place} est déjà occupée`);
      pos.set(p.id, p.place);
    });
    const legendes = [];
    const pas = Pt.pas.map((p, i) => {
      const lieu = `${ici}, pas n° ${i + 1}`;
      const t = typeDePas(p);
      if (!t) err(`${lieu} : pas inconnu ${JSON.stringify(p)} (pas connus : ${TYPES_PAS.join(', ')})`);
      const liste = (v) => [].concat(v);
      if (t === 'legende') { numero++; legendes.push(numero); return { t, html: String(p.legende), n: numero }; }
      if (t === 'attendre') { if (!(+p.attendre >= 0)) err(`${lieu} : \`attendre\` = un nombre de millisecondes`); return { t, ms: +p.attendre }; }
      if (t === 'nouvelle') {
        if (pos.has(p.nouvelle)) err(`${lieu} : objet « ${p.nouvelle} » déjà créé`);
        charge(p, lieu);
        pos.set(p.nouvelle, null);
        return { t, id: p.nouvelle, charge: p.charge || 'retention', futs: p.futs, lot: p.lot };
      }
      if (t === 'placer') {
        objet(p.placer, lieu); place(p.place, lieu);
        if (occupee(p.place) && pos.get(p.placer) !== p.place) err(`${lieu} : la place ${p.place} est déjà occupée`);
        pos.set(p.placer, p.place);
        return { t, id: p.placer, place: p.place };
      }
      if (t === 'geste') {
        const a = sc.acteurs[p.acteur];
        if (!a) err(`${lieu} : acteur inconnu « ${p.acteur} » (déclarer dans \`scene.acteurs\`)`);
        if (!(GESTES[a.type] || []).includes(p.geste)) err(`${lieu} : geste inconnu « ${p.geste} » pour ${a.type} (gestes : ${(GESTES[a.type] || []).join(', ')})`);
        objet(p.objet, lieu);
        if (p.geste === 'poser') {
          place(p.place, lieu);
          if (pos.get(p.objet)) err(`${lieu} : « ${p.objet} » est déjà posé (${pos.get(p.objet)})`);
          if (occupee(p.place)) err(`${lieu} : la place ${p.place} est déjà occupée`);
          pos.set(p.objet, p.place);
        } else {
          if (!pos.get(p.objet)) err(`${lieu} : « ${p.objet} » n'est posé nulle part, le chariot ne peut pas le reprendre`);
          pos.set(p.objet, null);
        }
        return { t, geste: p.geste, acteur: p.acteur, id: p.objet, place: p.place || null };
      }
      if (t === 'etiquette') {
        objet(p.etiquette, lieu);
        if (p.ton != null && !TONS_BULLE.includes(p.ton)) err(`${lieu} : ton inconnu « ${p.ton} » (${TONS_BULLE.join(', ')})`);
        return { t, id: p.etiquette, texte: p.texte == null ? '' : String(p.texte), ton: p.ton || 'neutre' };
      }
      if (t === 'alerte' || t === 'finAlerte') { const ids = liste(p[t]); ids.forEach((id) => objet(id, lieu)); return { t, ids }; }
      if (t === 'bulle') {
        if (!Array.isArray(p.lignes) || !p.lignes.length) err(`${lieu} : une bulle a besoin de \`lignes\``);
        if (p.ton != null && !TONS_BULLE.includes(p.ton)) err(`${lieu} : ton inconnu « ${p.ton} » (${TONS_BULLE.join(', ')})`);
        const v = p.vers;
        if (Array.isArray(v)) { if (v.length < 2 || v.some((n) => typeof n !== 'number')) err(`${lieu} : \`vers\` = une place, un objet ou [x, y, z]`); }
        else if (sc.places[v]) { /* une place */ }
        else if (pos.has(v)) { /* un objet */ }
        else err(`${lieu} : \`vers\` vise « ${v} », ni une place ni un objet créé`);
        bulles.add(p.bulle);
        const d = p.decalage || [0, -80];
        return { t, id: p.bulle, lignes: p.lignes.map(String), vers: v, hauteur: +p.hauteur || 0, dx: +d[0] || 0, dy: +d[1] || 0,
          ton: p.ton || 'neutre', fleche: p.fleche !== false, largeur: p.largeur || null };
      }
      // effacer
      const ids = liste(p.effacer);
      ids.forEach((id) => { if (!bulles.has(id)) err(`${lieu} : aucune bulle « ${id} » à effacer`); bulles.delete(id); });
      return { t, ids };
    });
    let Q = null;
    if (Pt.question) {
      const q = Pt.question, lieu = `${ici}, question`;
      if (!q.id) err(`${lieu} : il manque l'\`id\` (clé de la réponse dans la base)`);
      if (questions.some((x) => x.id === q.id)) err(`${lieu} : question « ${q.id} » déclarée deux fois`);
      if (!Array.isArray(q.choix) || q.choix.length < 2) err(`${lieu} : au moins deux \`choix\``);
      if (!(Number.isInteger(q.juste) && q.juste >= 0 && q.juste < q.choix.length)) err(`${lieu} : \`juste\` = ${q.juste} hors des choix (0 à ${q.choix.length - 1}, ordre déclaré)`);
      Q = { id: q.id, titre: q.titre || `Question ${questions.length + 1}`, enonce: String(q.enonce || ''), choix: q.choix.map(String),
        juste: q.juste, explication: String(q.explication || ''), suite: q.suite || null, partie: k, rang: questions.length + 1 };
      questions.push(Q);
    }
    return { titre: Pt.titre || `Partie ${k + 1} sur ${A.parties.length}`, depart: (Pt.depart && Pt.depart.palettes) || [], pas, question: Q, legendes };
  });
  return { id: A.id, libelle: A.libelle || 'Animation', vitesse, alt: A.alt || A.libelle || 'Animation', sc, parties, questions,
    nbLegendes: numero, aRetenir: A.aRetenir || '' };
}

/* ========================================================= état, réponses, jalons */
export const etatNeuf = () => ({ reponses: {}, ordres: {}, partie: 0 });
const etatDe = (db, id) => (db && db.animations && db.animations[id]) || null;

// La réponse d'un élève à une question : répondue ? première réponse juste ? (lue contre le contenu)
export function reponseAnimation(db, A, qid) {
  const M = typeof A === 'string' ? null : compile(A);
  const id = typeof A === 'string' ? A : A.id;
  const e = etatDe(db, id);
  const r = e && e.reponses && e.reponses[qid];
  if (!r || r.premiere == null) return { repondu: false, premiereJuste: false };
  const Q = M ? M.questions.find((q) => q.id === qid) : null;
  return { repondu: true, premiereJuste: Q ? r.premiere === Q.juste : !!r.juste };
}

// Un jalon par question : « Question 1 de l'animation : première réponse juste ». Non répondue = à faire
// (jamais une erreur avant que l'élève ait commencé) ; au bilan, non répondue = non franchie.
export function etapesAnimation(A) {
  const M = compile(A);
  return M.questions.map((Q) => ({
    id: `${M.id}-${Q.id}`,
    titre: `Question ${Q.rang} de l'animation : première réponse juste`,
    verifier(db) {
      const r = reponseAnimation(db, A, Q.id);
      return { status: !r.repondu ? 'attente' : r.premiereJuste ? 'ok' : 'ko' };
    },
  }));
}

// Le score hors Simulog : une question = un point.
export function scoreAnimation(db, A) {
  const M = compile(A);
  const detail = {};
  let ok = 0;
  M.questions.forEach((Q) => { const r = reponseAnimation(db, A, Q.id); detail[Q.id] = r.repondu ? r.premiereJuste : null; if (r.premiereJuste) ok++; });
  return { score: ok, max: M.questions.length, detail };
}

const compilees = new WeakMap();
function compile(A) { if (!compilees.has(A)) compilees.set(A, compilerAnimation(A)); return compilees.get(A); }

/* ===================================================================== lecteur */
// `creerLecteur(A)` : { id, nav, etatNeuf, html(etat, api), brancher(z, etat, api) }.
// `api` : { estProf, graine (identifiant de l'élève), sauver(), figee }.
export function creerLecteur(A) {
  const M = compile(A);
  const I = projection();
  const reduit = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Le déroulé en cours (un seul à la fois pour cet écran) : le jeton invalide tout ce qui tournait.
  const run = { jeton: 0 };

  function html(e, api) {
    const nav = M.parties.map((Pt, k) => {
      const ouverte = api.estProf || k <= (e.partie || 0);
      const lien = (cle, lib, ok) => (ok ? `<button type="button" class="anim-aller" data-anim-aller="${cle}">${ech(lib)}</button>`
        : `<span class="anim-aller ferme" title="S'ouvre quand tu as répondu à la question d'avant">${ech(lib)} 🔒</span>`);
      let s = lien(`p${k}`, `Partie ${k + 1}`, ouverte);
      if (api.estProf && Pt.question) s += lien(`q${k}`, `Question ${Pt.question.rang}`, true);
      return s;
    }).join('<span class="anim-sep" aria-hidden="true">·</span>');
    return `<div class="anim" data-anim="${ech(M.id)}">
      <div class="anim-legende" aria-live="polite"><span class="anim-num" data-anim-num>1</span><span class="anim-texte" data-anim-texte>…</span></div>
      <div class="anim-scene">
        <svg data-anim-svg viewBox="0 0 1000 600" role="img" aria-label="${ech(M.alt)}">${DEFS}<g data-anim-decor></g><g data-anim-dyn></g><g data-anim-bulles></g></svg>
        <div class="anim-q" data-anim-q hidden></div>
      </div>
      <div class="anim-ctrl">
        <button type="button" class="anim-btn plein" data-anim-lire>▶ Lire</button>
        <button type="button" class="anim-btn" data-anim-pause>⏸ Pause</button>
        <button type="button" class="anim-btn" data-anim-revoir>⟲ Revoir la partie</button>
        <span class="anim-partie" data-anim-partie></span>
        ${M.parties.length > 1 || api.estProf ? `<span class="anim-nav">${api.estProf ? '<span class="note">Enseignant :</span>' : ''}${nav}</span>` : ''}
        <span class="anim-points" aria-hidden="true">${Array.from({ length: M.nbLegendes }, () => '<span></span>').join('')}</span>
      </div>
    </div>`;
  }

  function brancher(z, e, api) {
    const R = { jeton: ++run.jeton, pause: false, k: 0, charges: [], acteurs: {}, finie: false };
    const $ = (s) => z.querySelector(s);
    const svg = $('[data-anim-svg]'), dyn = $('[data-anim-dyn]'), gb = $('[data-anim-bulles]'), boite = $('[data-anim-q]');
    if (!svg) return;
    const vivant = (j) => j === run.jeton && svg.isConnected;
    const ecrire = !api.estProf && !api.figee;

    // Le décor, dessiné une fois ; le cadre de la scène sur le décor (comme la maquette).
    const gd = $('[data-anim-decor]');
    gd.innerHTML = dessinerDecor(I, M.sc);
    let bb = null;
    try { bb = gd.getBBox(); } catch (x) { bb = null; }
    if (!bb || !bb.width) bb = bornesDecor(I, M.sc);
    svg.setAttribute('viewBox', `${(bb.x - 10).toFixed(0)} ${(bb.y - 60).toFixed(0)} ${(bb.width + 20).toFixed(0)} ${(bb.height + 70).toFixed(0)}`);

    /* ------------------------------------------------------------ dessin */
    const dessiner = () => { dyn.innerHTML = dessinerObjets(I, M.sc, R.charges, Object.values(R.acteurs)); };
    function legende(n, h) {
      $('[data-anim-num]').textContent = n;
      $('[data-anim-texte]').innerHTML = h;
      z.querySelectorAll('.anim-points span').forEach((s, i) => s.classList.toggle('fait', i < n));
    }
    function aRetenir() {
      if (M.aRetenir) legende(M.nbLegendes || 1, `<span class="anim-retenir">À retenir : ${M.aRetenir}</span>`);
    }
    const charge = (id) => R.charges.find((p) => p.id === id);
    const placeXY = (nom) => M.sc.places[nom];

    /* ------------------------------------------------- temps : pause, vitesse */
    function attendre(ms, j) {
      ms /= M.vitesse;
      return new Promise((ok) => {
        let t0 = null, e0 = 0;
        const f = (t) => {
          if (!vivant(j)) return;
          if (R.pause) { t0 = null; requestAnimationFrame(f); return; }
          if (t0 === null) t0 = t - e0;
          e0 = t - t0;
          if (e0 >= ms) ok(); else requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      });
    }
    // Un déplacement adouci ; avec « mouvement réduit », instantané (les attentes restent).
    function aller(o, props, ms, j) {
      ms /= M.vitesse;
      if (reduit()) ms = 1;
      const dep = {};
      for (const k in props) dep[k] = o[k];
      return new Promise((ok) => {
        let t0 = null, e0 = 0;
        const f = (t) => {
          if (!vivant(j)) return;
          if (R.pause) { t0 = null; requestAnimationFrame(f); return; }
          if (t0 === null) t0 = t - e0;
          e0 = t - t0;
          const u = Math.min(1, e0 / ms), v = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          for (const k in props) o[k] = dep[k] + (props[k] - dep[k]) * v;
          dessiner();
          if (u < 1) requestAnimationFrame(f); else ok();
        };
        requestAnimationFrame(f);
      });
    }

    /* ------------------------------------------------------------ gestes */
    async function poser(a, p, nom, j) {
      const pl = placeXY(nom), dehors = M.sc.dehors(pl.couloir);
      Object.assign(a, { visible: true, x: pl.x, y: dehors, lev: .25, charge: p });
      dessiner();
      await aller(a, { y: pl.y }, 1900, j); if (!vivant(j)) return;
      await aller(a, { lev: 0 }, 500, j); if (!vivant(j)) return;
      a.charge = null;
      Object.assign(p, { x: pl.x, y: pl.y, z: 0, visible: true });
      await aller(a, { y: dehors }, 1500, j); if (!vivant(j)) return;
      a.visible = false; dessiner();
    }
    async function reprendre(a, p, j) {
      const c = M.sc.couloirEn(p.x), dehors = c ? M.sc.dehors(c) : p.y + 4;
      Object.assign(a, { visible: true, x: p.x, y: dehors, lev: 0, charge: null });
      dessiner();
      await aller(a, { y: p.y }, 1700, j); if (!vivant(j)) return;
      a.charge = p;
      await aller(a, { lev: .25 }, 450, j); if (!vivant(j)) return;
      await aller(a, { y: dehors + ECART_DEHORS }, 1800, j); if (!vivant(j)) return;
      a.charge = null; p.visible = false; a.visible = false; dessiner();
    }

    /* ------------------------------------------------------------ bulles */
    const COUL = { alerte: 'var(--rouge)', ok: 'var(--vert)', neutre: 'var(--encre)' };
    function bulle(b) {
      let anc;
      if (Array.isArray(b.vers)) anc = [b.vers[0], b.vers[1], b.vers[2] != null ? b.vers[2] : b.hauteur];
      else if (M.sc.places[b.vers]) { const pl = M.sc.places[b.vers]; anc = [pl.x + .5, pl.y + .5, b.hauteur]; }
      else { const p = charge(b.vers); anc = [p.x + .5, p.y + .5, b.hauteur || HAUT_RETENTION]; }
      const [vx, vy] = I.P(...anc), x = vx + b.dx, y = vy + b.dy;
      const larg = b.largeur || Math.max(...b.lignes.map((t) => t.length)) * 8.8 + 28, haut = b.lignes.length * 22 + 16;
      const coul = COUL[b.ton];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-anim-bulle', b.id);
      g.setAttribute('class', `anim-bulle ${b.ton}`);
      g.style.opacity = 0;
      g.style.transition = reduit() ? 'none' : 'opacity .35s';
      const cx = Math.max(x + 14, Math.min(x + larg - 14, vx)), cy = vy < y ? y : y + haut;
      let h = b.fleche ? `<line x1="${cx}" y1="${cy}" x2="${vx}" y2="${vy}" style="stroke:${coul}" stroke-width="2.5"/><circle cx="${vx}" cy="${vy}" r="5" style="fill:${coul}"/>` : '';
      h += `<rect x="${x}" y="${y}" width="${larg}" height="${haut}" rx="9" style="fill:var(--panneau);stroke:${coul}" stroke-width="2.5"/>`;
      b.lignes.forEach((t, k) => { h += `<text x="${x + 14}" y="${y + 28 + k * 22}" font-size="16" font-weight="${k === 0 ? 700 : 500}" style="fill:${coul}">${ech(t)}</text>`; });
      g.innerHTML = h;
      gb.appendChild(g);
      requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = 1; }));
    }
    const effacer = (ids) => ids.forEach((id) => gb.querySelectorAll(`[data-anim-bulle="${CSS.escape(id)}"]`).forEach((g) => g.remove()));

    /* ------------------------------------------------------------ une partie */
    function mettreEnPlace(k) {
      gb.innerHTML = '';
      R.charges = M.parties[k].depart.map((p) => {
        const pl = placeXY(p.place);
        return { id: p.id, lot: p.lot, charge: p.charge || 'retention', futs: p.futs, x: pl.x, y: pl.y, z: 0, visible: true,
          etiq: p.etiquette || '', etiqTon: p.ton || 'neutre', alerte: false };
      });
      R.acteurs = {};
      Object.values(M.sc.acteurs).forEach((a) => { R.acteurs[a.id] = { id: a.id, type: a.type, x: 0, y: 0, lev: 0, visible: false, charge: null }; });
      dessiner();
    }
    async function executer(p, j) {
      switch (p.t) {
        case 'legende': legende(p.n, p.html); break;
        case 'attendre': await attendre(p.ms, j); break;
        case 'nouvelle': R.charges.push({ id: p.id, lot: p.lot, charge: p.charge, futs: p.futs, x: 0, y: 0, z: 0, visible: false, etiq: '', etiqTon: 'neutre', alerte: false }); break;
        case 'placer': { const pl = placeXY(p.place); Object.assign(charge(p.id), { x: pl.x, y: pl.y, z: 0, visible: true }); dessiner(); break; }
        case 'geste': {
          const a = R.acteurs[p.acteur], c = charge(p.id);
          if (p.geste === 'poser') await poser(a, c, p.place, j); else await reprendre(a, c, j);
          break;
        }
        case 'etiquette': Object.assign(charge(p.id), { etiq: p.texte, etiqTon: p.ton }); dessiner(); break;
        case 'alerte': p.ids.forEach((id) => { charge(id).alerte = true; }); dessiner(); break;
        case 'finAlerte': p.ids.forEach((id) => { charge(id).alerte = false; }); dessiner(); break;
        case 'bulle': bulle(p); break;
        case 'effacer': effacer(p.ids); break;
        default: break;
      }
    }
    async function jouer(k) {
      const j = R.jeton = ++run.jeton;
      R.k = k; R.pause = false; R.finie = false;
      fermerQuestion();
      $('[data-anim-partie]').textContent = M.parties[k].titre;
      if (k === 0) legende(1, '…');
      mettreEnPlace(k);
      for (const p of M.parties[k].pas) {
        if (!vivant(j)) return;
        await executer(p, j);
      }
      if (!vivant(j)) return;
      R.finie = true;
      finDePartie(k);
    }
    function finDePartie(k) {
      const Pt = M.parties[k];
      if (Pt.question) { ouvrirQuestion(k); return; }
      // Une partie sans question : la suivante s'ouvre, par un bouton.
      if (k < M.parties.length - 1) {
        debloquer(k + 1);
        boite.innerHTML = `<div class="anim-bas"><button type="button" class="anim-act" data-anim-suite>Suite ▶</button></div>`;
        boite.hidden = false;
        boite.querySelector('[data-anim-suite]').addEventListener('click', () => jouer(k + 1));
      } else {
        aRetenir();
        boite.innerHTML = `<div class="anim-bas"><button type="button" class="anim-act" data-anim-suite>⟲ Tout revoir</button></div>`;
        boite.hidden = false;
        boite.querySelector('[data-anim-suite]').addEventListener('click', () => jouer(0));
      }
    }
    function debloquer(k) {
      if (!ecrire) return;
      const n = Math.min(k, M.parties.length - 1);
      if ((e.partie || 0) < n) { e.partie = n; api.sauver(); majNav(); }
    }
    // Les liens « Partie 2 » se déverrouillent sans redessiner l'écran (l'animation continue).
    function majNav() {
      z.querySelectorAll('.anim-aller.ferme').forEach((s) => {
        const lib = s.textContent.replace(' 🔒', '');
        const k = Number((lib.match(/Partie (\d+)/) || [])[1]) - 1;
        if (k >= 0 && k <= (e.partie || 0)) {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'anim-aller'; b.dataset.animAller = `p${k}`; b.textContent = lib;
          b.addEventListener('click', () => jouer(k));
          s.replaceWith(b);
        }
      });
    }

    /* ------------------------------------------------------------ questions */
    function ordreDe(Q) {
      const enBase = e.ordres && e.ordres[Q.id];
      if (Array.isArray(enBase) && enBase.length === Q.choix.length) return enBase;
      const o = hasard(`${api.graine || ''}|${M.id}|${Q.id}`).melanger(Q.choix.map((_, i) => i));
      if (ecrire) { if (!e.ordres) e.ordres = {}; e.ordres[Q.id] = o; api.sauver(); }
      return o;
    }
    function fermerQuestion() { boite.hidden = true; boite.innerHTML = ''; }
    // `mode` : 'neuf' (pas encore répondu, ou « répondre de nouveau »), 'corrige' (après validation).
    function ouvrirQuestion(k, opts = {}) {
      const Q = M.parties[k].question;
      const ordre = ordreDe(Q);
      const premiere = e.reponses && e.reponses[Q.id];
      const dejaRepondu = !!(premiere && premiere.premiere != null);
      const st = { choisi: null, valide: dejaRepondu && !opts.refaire, montre: dejaRepondu ? premiere.premiere : null, refaire: !!opts.refaire };
      if (st.valide) st.choisi = st.montre;
      const focusAvant = memoriserFocus(boite);
      const lettre = (pos) => String.fromCharCode(65 + pos);
      const peindre = () => {
        const cls = (i) => {
          const c = [];
          if (st.valide) { if (i === Q.juste) c.push('juste'); else if (i === st.choisi) c.push('faux'); }
          else if (i === st.choisi) c.push('choisi');
          if (api.estProf && !st.valide && i === Q.juste) c.push('attendu');
          return c.join(' ');
        };
        const ok = st.valide && st.choisi === Q.juste;
        // Relu à chaque dessin : juste après la première validation, la réponse est rangée.
        const pr = e.reponses && e.reponses[Q.id];
        const range = !!(pr && pr.premiere != null) && !api.estProf;
        boite.innerHTML = `<h2>${ech(Q.titre)}</h2><div class="anim-enonce">${ech(Q.enonce)}</div>
          <div class="anim-choix">${ordre.map((i, pos) => `<button type="button" class="${cls(i)}" data-anim-choix="${i}" data-cle="c${i}"
            ${st.valide ? 'disabled' : ''} aria-pressed="${st.choisi === i ? 'true' : 'false'}">${lettre(pos)}. ${ech(Q.choix[i])}${api.estProf && !st.valide && i === Q.juste ? ' <span class="anim-attendu">bonne réponse</span>' : ''}</button>`).join('')}</div>
          <div class="anim-bas">
            ${st.valide ? `<div class="anim-retour"><b class="${ok ? 'juste' : 'faux'}">${ok ? 'Oui.' : 'Non.'}</b> ${ech(Q.explication)}${
              range ? `<div class="note anim-premiere">${st.refaire
                ? `Ta première réponse (${lettre(ordre.indexOf(pr.premiere))}) reste celle qui compte.`
                : 'C\'est ta première réponse : c\'est elle qui compte.'}</div>` : ''}</div>`
              : `<button type="button" class="anim-act" data-anim-valider data-cle="valider" ${st.choisi == null ? 'disabled' : ''}>Valider ma réponse</button><div class="anim-retour"></div>`}
            ${!st.valide ? '<button type="button" class="anim-act second" data-anim-revoirq data-cle="revoirq">⟲ Revoir l\'animation</button>' : ''}
            ${st.valide && range ? '<button type="button" class="anim-act second" data-anim-refaire data-cle="refaire">Répondre de nouveau</button>' : ''}
            ${st.valide ? `<button type="button" class="anim-act" data-anim-suite data-cle="suite">${ech(Q.suite || (k < M.parties.length - 1 ? 'Suite ▶' : '⟲ Tout revoir'))}</button>` : ''}
          </div>`;
        boite.querySelectorAll('[data-anim-choix]').forEach((b) => b.addEventListener('click', () => { st.choisi = Number(b.dataset.animChoix); peindre(); }));
        boite.querySelector('[data-anim-valider]')?.addEventListener('click', valider);
        boite.querySelector('[data-anim-revoirq]')?.addEventListener('click', () => jouer(k));
        boite.querySelector('[data-anim-refaire]')?.addEventListener('click', () => ouvrirQuestion(k, { refaire: true }));
        boite.querySelector('[data-anim-suite]')?.addEventListener('click', () => (k < M.parties.length - 1 ? jouer(k + 1) : jouer(0)));
      };
      function valider() {
        if (st.choisi == null) return;
        // La PREMIÈRE réponse validée est rangée, une fois pour toutes (décision de Tristan, 05/10).
        if (ecrire && !(e.reponses && e.reponses[Q.id] && e.reponses[Q.id].premiere != null)) {
          if (!e.reponses) e.reponses = {};
          e.reponses[Q.id] = { premiere: st.choisi, juste: st.choisi === Q.juste, quand: Date.now() };
          // GESTE (questions au fil, lot 3) : `animation:<id>:<question>`, à la première réponse.
          if (api.signal) api.signal(`animation:${M.id}:${Q.id}`);
          if (k + 1 > (e.partie || 0)) e.partie = Math.min(k + 1, M.parties.length - 1);
          api.sauver();
          majNav();
        }
        st.valide = true;
        if (k === M.parties.length - 1) aRetenir();
        peindre();
        const f = boite.querySelector('[data-anim-suite]');
        if (f && document.activeElement === document.body) f.focus();
      }
      peindre();
      boite.hidden = false;
      if (st.valide && k === M.parties.length - 1) aRetenir();
      // Le focus suit le clavier seulement (un clic de souris ne déplace rien).
      retrouverFocus(boite, focusAvant, { defilement: true });
    }

    /* ------------------------------------------------------------ commandes */
    $('[data-anim-lire]').addEventListener('click', () => { R.pause = false; });
    $('[data-anim-pause]').addEventListener('click', () => { R.pause = true; });
    $('[data-anim-revoir]').addEventListener('click', () => jouer(R.k));
    z.querySelectorAll('[data-anim-aller]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.animAller, k = Number(v.slice(1));
      if (v[0] === 'p') { jouer(k); return; }
      // Enseignant : la question directement, sur la scène de fin de la partie (sans rejouer).
      run.jeton++; R.jeton = run.jeton; R.k = k;
      $('[data-anim-partie]').textContent = M.parties[k].titre;
      mettreEnPlace(k);
      ouvrirQuestion(k);
    }));

    // La partie 1 démarre seule (comme la maquette ; §12-5), avec mouvement réduit aussi.
    jouer(0);
  }

  return { id: M.id, nav: { libelle: M.libelle }, etatNeuf, html, brancher, modele: M,
    signaux: M.questions.map((Q) => `animation:${M.id}:${Q.id}`) };
}

/* ============================================================ hors Simulog (lot 3) */
// Une activité Prepalog sans scénario : `export const rendre = (h, c) => anim.rendre(h, c)`,
// `export const noter = (db) => anim.noter(db)`. `meta.bareme` = nombre de questions (le site ramène
// le score sur 20) ; une animation sans question n'a pas de barème (écran de découverte non noté).
export function creerAnimation(A) {
  const L = creerLecteur(A);
  return {
    noter: (db) => scoreAnimation(db, A),
    rendre(hote, ctx) {
      const db = ctx.jeu.etat();
      if (!db.animations) db.animations = {};
      if (!db.animations[L.id]) db.animations[L.id] = etatNeuf();
      const e = db.animations[L.id];
      const estProf = !!(ctx.profil && ctx.profil.role !== 'eleve');
      const api = {
        estProf, figee: false, graine: (ctx.profil && (ctx.profil.uid || ctx.profil.prenom)) || '',
        sauver() {
          ctx.jeu.sauver();
          if (!estProf && L.modele.questions.length) {
            Promise.resolve(ctx.enregistrer(scoreAnimation(db, A), { siChange: true })).catch(() => toast("Le score n'a pas pu être enregistré."));
          }
        },
      };
      hote.innerHTML = `<div class="anim-seule">${L.html(e, api)}</div>`;
      L.brancher(hote, e, api);
    },
  };
}
