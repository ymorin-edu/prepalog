// Type « QCM » — questions à choix unique ou multiple, autocorrigées.
//
// Les bonnes réponses ne figurent pas en clair dans le contenu : on n'y stocke qu'une
// empreinte. Un élève qui ouvre les outils de développement ne lit donc pas le corrigé
// d'un coup d'œil. Ce n'est pas de l'inviolabilité — l'usage reste formatif.

import { ech, toast } from '../ui.js';
import { melangerListe } from '../tirage.js';

// Empreinte FNV-1a, suffisante pour masquer une réponse dans un contexte formatif.
export function empreinte(s) {
  let h = 0x811c9dc5;
  const t = String(s).trim().toLowerCase();
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

// Outil d'auteur : transforme un contenu lisible en contenu à empreintes.
// À utiliser une fois, puis coller le résultat dans le fichier de contenu.
export function sceller(questions) {
  return questions.map((q) => ({
    id: q.id,
    enonce: q.enonce,
    multiple: !!q.multiple,
    choix: q.choix,
    justes: (q.justes || []).map(empreinte),
    explication: q.explication || '',
  }));
}

export function creerQCM({ questions, melanger = true }) {
  return {
    rendre(hote, ctx) {
      const ordre = melanger ? melangerListe(questions) : questions;
      hote.dataset.ordre = ordre.map((q) => q.id).join(',');

      hote.innerHTML = `
        <div class="panneau">
          ${ordre.map((q, i) => `
            <div class="question" data-q="${ech(q.id)}">
              <div class="enonce">${i + 1}. ${ech(q.enonce)}</div>
              ${q.choix.map((c, j) => `
                <label class="choix">
                  <input type="${q.multiple ? 'checkbox' : 'radio'}" name="q_${ech(q.id)}" value="${ech(c)}" id="q${ech(q.id)}_${j}">
                  <span>${ech(c)}</span>
                </label>`).join('')}
              <div class="retour-q note" data-retour="${ech(q.id)}"></div>
            </div>`).join('')}
          <div class="rangee" style="margin-top:16px">
            <button class="btn btn-p" id="btnValider">Valider mes réponses</button>
            <span class="note pousse" id="etatQcm"></span>
          </div>
        </div>
        <div id="bilan"></div>`;

      hote.querySelector('#btnValider').addEventListener('click', async () => {
        const res = this.corriger(this.lire(hote));
        this.afficherCorrection(hote, res);
        await ctx.enregistrer(res);
        toast(`Score : ${res.score} / ${res.max}`);
      });
    },

    lire(hote) {
      const rep = {};
      questions.forEach((q) => {
        const cases = Array.from(hote.querySelectorAll(`[name="q_${CSS.escape(q.id)}"]`));
        rep[q.id] = cases.filter((c) => c.checked).map((c) => c.value);
      });
      return rep;
    },

    corriger(reponses) {
      let score = 0;
      const detail = {};
      questions.forEach((q) => {
        const donnees = (reponses[q.id] || []).map(empreinte).sort();
        const attendu = [...q.justes].sort();
        const ok = donnees.length === attendu.length && donnees.every((h, i) => h === attendu[i]);
        if (ok) score++;
        detail[q.id] = ok;
      });
      return { score, max: questions.length, detail };
    },

    afficherCorrection(hote, res) {
      questions.forEach((q) => {
        const z = hote.querySelector(`[data-retour="${CSS.escape(q.id)}"]`);
        if (!z) return;
        const ok = res.detail[q.id];
        z.className = 'retour-q note ' + (ok ? 'juste' : 'faux');
        z.textContent = ok
          ? '✓ Correct.' + (q.explication ? ' ' + q.explication : '')
          : '✗ À revoir.' + (q.explication ? ' ' + q.explication : '');
      });
      const b = hote.querySelector('#bilan');
      if (b) {
        const part = res.score / res.max;
        b.innerHTML = `<div class="avis ${part >= 0.7 ? 'avis-ok' : part >= 0.4 ? '' : 'avis-err'}">
          <strong>${res.score} bonne${res.score > 1 ? 's' : ''} réponse${res.score > 1 ? 's' : ''} sur ${res.max}.</strong>
          ${part >= 0.7 ? ' Bon travail.' : ' Reprenez les questions marquées « à revoir », puis recommencez.'}
        </div>`;
      }
    },
  };
}
