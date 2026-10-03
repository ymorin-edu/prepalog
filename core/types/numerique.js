// Type « saisie numérique » — questions dont la réponse est un nombre.
//
// Tolérance paramétrable par question : absolue (`tolerance: 0.5`) ou relative
// (`tolerance: '1%'`). Indispensable pour les calculs commerciaux, où l'arrondi
// intermédiaire de l'élève ne doit pas être compté faux.
//
// La saisie accepte la virgule française et les espaces des milliers.

import { ech, toast } from '../ui.js';

// `normaliser` et `estJuste` vivent dans `classeur.js` (sans écran) depuis le 04/10/2026.
import { normaliser, estJuste } from './classeur.js';
export { normaliser, estJuste };

const fr = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(n);

export function creerNumerique({ questions, consigne, melanger = false }) {
  return {
    rendre(hote, ctx) {
      const liste = melanger ? [...questions].sort(() => Math.random() - 0.5) : questions;
      let corrige = null;

      function dessiner() {
        hote.innerHTML = `
          ${consigne ? `<p class="note">${ech(consigne)}</p>` : ''}
          <div class="panneau">
            ${liste.map((q, i) => {
              const etat = corrige ? (corrige[q.id] ? 'juste' : 'faux') : '';
              return `<div class="question num-q">
                <div class="enonce">${i + 1}. ${ech(q.enonce)}</div>
                ${q.aide ? `<p class="note">${ech(q.aide)}</p>` : ''}
                <div class="num-saisie">
                  <input type="text" inputmode="decimal" class="${etat}" data-q="${ech(q.id)}"
                    placeholder="nombre" autocomplete="off">
                  ${q.unite ? `<span class="num-unite">${ech(q.unite)}</span>` : ''}
                </div>
                <div class="note num-retour" data-retour="${ech(q.id)}"></div>
              </div>`;
            }).join('')}
            <div class="rangee" style="margin-top:14px">
              <button class="btn btn-p" id="btnValiderNum">Valider mes réponses</button>
            </div>
          </div>
          <div id="bilanNum"></div>`;

        // On réinjecte les saisies après un nouveau rendu.
        hote.querySelectorAll('[data-q]').forEach((i) => {
          if (saisies[i.dataset.q] !== undefined) i.value = saisies[i.dataset.q];
          i.addEventListener('input', () => { saisies[i.dataset.q] = i.value; });
          i.addEventListener('keydown', (e) => { if (e.key === 'Enter') valider(); });
        });
        hote.querySelector('#btnValiderNum').addEventListener('click', valider);

        if (corrige) {
          liste.forEach((q) => {
            const z = hote.querySelector(`[data-retour="${CSS.escape(q.id)}"]`);
            if (!z) return;
            z.className = 'note num-retour ' + (corrige[q.id] ? 'juste' : 'faux');
            z.textContent = corrige[q.id]
              ? '✓ Correct.' + (q.expl ? ' ' + q.expl : '')
              : `✗ Réponse attendue : ${fr(q.reponse)}${q.unite ? ' ' + q.unite : ''}.` + (q.expl ? ' ' + q.expl : '');
          });
        }
      }

      const saisies = {};

      async function valider() {
        corrige = {};
        let score = 0;
        liste.forEach((q) => {
          const ok = estJuste(normaliser(saisies[q.id]), q.reponse, q.tolerance);
          corrige[q.id] = ok;
          if (ok) score++;
        });
        dessiner();
        const b = hote.querySelector('#bilanNum');
        b.innerHTML = `<div class="avis ${score === liste.length ? 'avis-ok' : score >= liste.length * 0.6 ? '' : 'avis-err'}">
          <strong>${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${liste.length}.</strong>
          ${score === liste.length ? ' Tout est juste.' : ' Reprenez les calculs marqués en rouge.'}
        </div>`;
        await ctx.enregistrer({ score, max: liste.length, detail: corrige });
        toast(`${score} / ${liste.length}`);
      }

      dessiner();
    },
  };
}
