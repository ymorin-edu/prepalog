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

import { ech } from '../ui.js';

const TROMBONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  aria-hidden="true"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>`;

export function creerDocuments(liste, style) {
  const DOC = {};
  (liste || []).forEach((d) => { DOC[d.id] = d; });
  // Les pièces d'un mail qui existent vraiment (une faute de frappe dans le contenu ne casse rien).
  const pieces = (ids) => (ids || []).filter((id) => DOC[id]);

  return {
    doc: (id) => DOC[id] || null,
    ids: () => Object.keys(DOC),
    pieces,

    // La feuille elle-même.
    feuille: (id) => (DOC[id] ? `<div class="ent-doc" data-doc="${ech(id)}">${DOC[id].html}</div>` : ''),

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
    visionneuse(id, ids) {
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
        <div class="ent-feuille">${this.feuille(id)}</div>
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
