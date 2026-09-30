// Type « lien » — l'activité se déroule sur un support extérieur (Padlet, Digipad,
// questionnaire de l'ENT…). Prepalog ne fait alors que deux choses, mais bien :
//
//   1. présenter le travail à l'élève et lui ouvrir le support d'un clic ;
//   2. porter la note, saisie par l'enseignant dans « Suivi de classe ».
//
// Il n'y a rien à corriger automatiquement : l'activité déclare `notation: 'prof'`
// dans son `meta`, et le suivi de classe transforme sa colonne en champ de saisie.
//
// Le lien s'ouvre dans un nouvel onglet : Padlet et Digipad refusent l'affichage en
// cadre, et l'élève garde Prepalog sous la main.

import { ech } from '../ui.js';

export function creerLien({
  url,
  service = 'le support',
  objectif = '',
  consigne = '',
  etapes = [],
  rendu = '',
}) {
  return {
    rendre(hote, ctx) {
      const estProf = ctx.profil?.role === 'prof';
      const bareme = ctx.meta?.bareme || 20;

      dessiner(null);

      // L'élève retrouve sa note dès l'ouverture, sans action de sa part.
      if (!estProf && typeof ctx.lireScore === 'function') {
        ctx.lireScore().then((t) => { if (t) dessiner(t); }).catch(() => {});
      }

      function dessiner(travail) {
        const note = travail && typeof travail.meilleur === 'number' ? travail.meilleur : null;

        hote.innerHTML = `
          <section class="panneau lien-ext">
            <div class="lien-tete">
              <div>
                <h2>${ech(objectif || 'Scénario complet')}</h2>
                ${consigne ? `<p class="note">${ech(consigne)}</p>` : ''}
              </div>
              ${note !== null
                ? `<span class="note-badge" title="Note saisie par votre enseignant">${fr(note)} / ${bareme}</span>`
                : ''}
            </div>

            ${etapes.length ? `<ol class="lien-etapes">
              ${etapes.map((e) => `<li>${ech(e)}</li>`).join('')}
            </ol>` : ''}

            <a class="btn btn-p lien-ouvrir" href="${ech(url)}" target="_blank" rel="noopener noreferrer">
              Ouvrir ${ech(service)}
            </a>
            <p class="note lien-adresse">S'ouvre dans un nouvel onglet — gardez celui-ci ouvert.
              <span class="mono">${ech(coupe(url))}</span></p>
          </section>

          ${rendu ? `<div class="avis"><strong>Rendu attendu.</strong> ${ech(rendu)}</div>` : ''}

          ${estProf
            ? `<div class="avis">Activité notée à la main : saisissez les notes dans
                 <strong>Espace enseignant → Suivi de classe</strong>, colonne
                 <span class="etiq">${ech(ctx.meta?.code || '')}</span>.</div>`
            : note !== null
              ? `<div class="avis avis-ok">Votre enseignant a noté ce travail :
                   <strong>${fr(note)} / ${bareme}</strong>.</div>`
              : `<div class="avis">Ce travail n'est pas corrigé automatiquement. Votre note
                   apparaîtra ici une fois saisie par votre enseignant.</div>`}`;
      }
    },
  };
}

// 14.5 → « 14,5 » ; 14 → « 14 ». Les notes se lisent en français.
function fr(n) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

// L'adresse complète d'un Padlet est illisible : on n'en montre que le début.
function coupe(u, max = 52) {
  const s = String(u || '').replace(/^https?:\/\//, '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
