// Les DOCUMENTS JOINTS de l'environnement d'entreprise (04/10/2026, brief
// `docs/briefs/MOTEUR-documents-formulaire.md`, lot 1).
//
// Une séance déclare ses documents (contenu, jamais saisi par l'élève) :
//
//   creerEntreprise({ …,
//     documents: [{ id: 'yanis', titre: 'CV — Yanis Morel', court: 'Yanis Morel', html: '<article class="cv cv1">…</article>' }],
//     documentsStyle: '.cv{ … } .cv1{ … }',   // la mise en page PROPRE à la séance (facultatif)
//   })
//
// et un mail semé (volet ou déclencheur) les joint : `pieces: ['poste', 'yanis', …]`. Sous le texte du
// mail, une rangée de pièces jointes (trombone + `court`, « · ouvert » une fois ouvert) ; un clic ouvre
// le document dans le lecteur du mail, avec « ← Retour au message » et « ‹ Précédent / Suivant › » entre
// les pièces du même mail.
//
// Un document est une FEUILLE DE PAPIER, quel que soit le thème : `.ent-doc` (styles/base.css) pose le
// fond papier et redéfinit les couleurs du site à l'intérieur, si bien qu'un `var(--filet)` du contenu
// reste celui du papier en thème sombre. `documentsStyle` est injecté dans un `<style>` dont chaque règle
// est imbriquée sous `.ent-doc` : il ne peut rien toucher hors des documents, et il part avec la séance.
// La mention en pied (« CV fictif — document pédagogique Prepalog ») est écrite par le contenu.
//
// Mots cliquables : dans le texte du mail, comme partout ; dans un document, seulement là où le contenu
// les marque (`[[CACES]]`). Chaque ouverture est comptée dans `db.indicateurs[idSeance].docs[id]`
// (repérage, côté entreprise.js) — jamais un jalon.
//
// FONCTION DE LA BASE (chantier D-1 bis, 09/10/2026, brief ENT-6.1 §7.3) : `html` peut être une fonction `(db) => '<…>'`
// de la base de l'élève (un organigramme avec SES cases vides, tirées). Appelée à chaque dessin, jamais rangée : elle ne
// doit rien écrire. Contrôle au chargement : essayée sur une base vide (`{}`), elle doit rendre un texte, sinon la séance
// ne se charge pas (message qui nomme le document). Au dessin, une fonction qui plante est signalée (console) et la
// feuille affiche un avis d'erreur. Un texte fixe : rien ne change.
//
// UN DESSIN EN DOCUMENT (chantier D-10, 13/10/2026, brief ENT-6.10 §7.2) : `image: { src: './contenus/…svg', alt, mention? }`
// (avec ou sans `html`, qui s'écrit alors dessous). Le dessin prend toute la largeur de la feuille ; un clic (ou « Agrandir »)
// l'ouvre EN PLEIN ÉCRAN (la loupe : Échap, « Fermer » ou un clic sur le fond la referment, le focus revient au dessin).
// `alt` est obligatoire et ne doit pas donner la réponse (ENT-6.10 : il ne dit pas combien de fûts) ; `mention` s'écrit en
// pied du dessin. `src` vient du site (« ./ ») : une adresse d'un autre domaine empêche la séance de se charger.

import { ech } from '../ui.js';

const LOUPE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
  aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>`;

// La loupe plein écran : une seule pour la page, posée au premier clic sur un dessin (délégation sur le document).
let loupePosee = false;
function poserLoupe() {
  if (loupePosee || typeof document === 'undefined') return;
  loupePosee = true;
  let retour = null;
  const fermer = () => {
    const o = document.querySelector('[data-doc-loupe-ouverte]');
    if (!o) return;
    o.remove();
    if (retour && retour.isConnected) retour.focus({ preventScroll: true });
    retour = null;
  };
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('[data-doc-loupe]');
    if (b) {
      ev.preventDefault();
      const img = b.querySelector('img');
      if (!img) return;
      fermer();
      retour = b;
      const o = document.createElement('div');
      o.className = 'ent-loupe';
      o.dataset.docLoupeOuverte = '';
      o.setAttribute('role', 'dialog');
      o.setAttribute('aria-modal', 'true');
      o.setAttribute('aria-label', b.dataset.docLoupe || 'Dessin agrandi');
      o.innerHTML = `<button type="button" class="btn ent-loupe-fermer" data-doc-loupe-fermer>Fermer (Échap)</button>`
        + `<img src="${ech(img.getAttribute('src'))}" alt="${ech(img.getAttribute('alt') || '')}">`;
      document.body.appendChild(o);
      o.querySelector('[data-doc-loupe-fermer]').focus();
      return;
    }
    const o = document.querySelector('[data-doc-loupe-ouverte]');
    if (o && (ev.target === o || (ev.target.closest && ev.target.closest('[data-doc-loupe-fermer]')))) fermer();
  });
  document.addEventListener('keydown', (ev) => {
    const o = document.querySelector('[data-doc-loupe-ouverte]');
    if (!o) return;
    if (ev.key === 'Escape') { ev.preventDefault(); fermer(); }
    // Le focus reste dans la loupe (un seul bouton).
    else if (ev.key === 'Tab') { ev.preventDefault(); o.querySelector('[data-doc-loupe-fermer]').focus(); }
  });
}

const TROMBONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  aria-hidden="true"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>`;

// Le HTML d'un document pour une base : texte fixe, ou fonction de la base (contrôlée : un texte).
function htmlDe(d, db) {
  if (d.image) {
    const I = d.image, reste = d.html == null ? '' : htmlDe(Object.assign({}, d, { image: null }), db);
    return `<figure class="ent-doc-image"><button type="button" class="ent-doc-loupe" data-doc-loupe="${ech(d.titre || I.alt)}" data-libre
      title="Agrandir le dessin"><img src="${ech(I.src)}" alt="${ech(I.alt)}"><span class="ent-doc-loupe-lib">${LOUPE} Agrandir</span></button>${
      I.mention ? `<figcaption>${ech(I.mention)}</figcaption>` : ''}</figure>${reste || ''}`;
  }
  if (typeof d.html !== 'function') return d.html;
  const h = d.html(db || {});
  if (typeof h !== 'string') throw new Error(`« html(db) » rend ${h === null ? 'null' : typeof h} au lieu d’un texte`);
  return h;
}

export function creerDocuments(liste, style, { signaler } = {}) {
  const DOC = {};
  (liste || []).forEach((d) => {
    DOC[d.id] = d;
    if (d.image) {
      if (!d.image.src || !String(d.image.src).startsWith('./')) throw new Error(`document « ${d.id} » : l'image doit venir du site (« ./contenus/… »)`);
      if (!d.image.alt) throw new Error(`document « ${d.id} » : il manque le texte de remplacement (« alt ») du dessin`);
      poserLoupe();
    }
    // Contrôle au chargement : une fonction de la base est essayée sur une base vide.
    if (typeof d.html === 'function') {
      try { htmlDe(d, {}); } catch (x) {
        throw new Error(`document « ${d.id} » : « html(db) » ne marche pas sur une base vide : ${x && x.message ? x.message : x}`);
      }
    }
  });
  // Les pièces d'un mail qui existent vraiment (une faute de frappe dans le contenu ne casse rien).
  const pieces = (ids) => (ids || []).filter((id) => DOC[id]);
  // `db` : la base de l'élève (lue par un document fonction de la base, à chaque dessin).
  function feuille(id, db) {
    if (!DOC[id]) return '';
    let h;
    try { h = htmlDe(DOC[id], db); } catch (x) {
      if (signaler) signaler(`le document « ${id} » ne se dessine pas`, x);
      h = '<div class="avis avis-err" data-doc-erreur>Ce document ne s’affiche pas (erreur de la séance) : signale-le à ton professeur.</div>';
    }
    return `<div class="ent-doc${DOC[id].image ? ' ent-doc-dessin' : ''}" data-doc="${ech(id)}">${h}</div>`;
  }

  return {
    doc: (id) => DOC[id] || null,
    ids: () => Object.keys(DOC),
    pieces,

    // La feuille elle-même.
    feuille,

    // La rangée sous le texte du mail. `vu(id)` : déjà ouvert ?
    rangee(ids, vu) {
      const L = pieces(ids);
      if (!L.length) return '';
      return `<div class="ent-pj-liste" role="group" aria-label="Pièces jointes">${L.map((id) => {
        const v = vu(id);
        return `<button type="button" class="ent-pj${v ? ' vu' : ''}" data-pj="${ech(id)}" data-libre>${TROMBONE}<span>${
          ech(DOC[id].court || DOC[id].titre)}</span>${v ? '<span class="ent-pj-vu">· ouvert</span>' : ''}</button>`;
      }).join('')}</div>`;
    },

    // Le document ouvert dans le lecteur du mail, entre les pièces `ids` du même mail.
    visionneuse(id, ids, db) {
      const L = pieces(ids), k = L.indexOf(id), d = DOC[id];
      if (!d) return '';
      const prec = L[k - 1], suiv = L[k + 1];
      return `<div class="ent-visio" data-visio="${ech(id)}">
        <div class="ent-visio-tete">
          <button type="button" class="lien-accueil" data-pj-retour data-libre>← Retour au message</button>
          <span class="ent-visio-titre">${ech(d.titre || d.court)}</span>
          <span class="ent-visio-nav">
            <button type="button" class="btn btn-s" ${prec ? `data-pj="${ech(prec)}"` : 'disabled'} data-libre>‹ Précédent</button>
            <button type="button" class="btn btn-s" ${suiv ? `data-pj="${ech(suiv)}"` : 'disabled'} data-libre>Suivant ›</button>
          </span>
        </div>
        <div class="ent-feuille">${feuille(id, db)}</div>
      </div>`;
    },

    // La mise en page propre à la séance, posée une fois dans <head>, retirée à la sortie.
    // Celui d'une autre séance (ouverte juste avant, sans passer par « Quitter ») est remplacé.
    poserStyle() {
      const texte = style ? `.ent-doc{\n${style}\n}` : '';
      const deja = document.head.querySelector('style[data-ent-documents]');
      if (deja && deja.textContent === texte) return;
      if (deja) deja.remove();
      if (!texte) return;
      const s = document.createElement('style');
      s.dataset.entDocuments = '';
      s.textContent = texte;
      document.head.appendChild(s);
    },
    retirerStyle() { document.head.querySelectorAll('style[data-ent-documents]').forEach((s) => s.remove()); },
  };
}
