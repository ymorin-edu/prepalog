// Type « dépôt de classeur » — l'élève remplit un fichier Excel et le dépose ;
// le classeur est lu dans le navigateur et contrôlé cellule par cellule.
//
// Rien n'est envoyé sur un serveur : SheetJS lit le fichier localement. Le classeur
// lui-même n'est pas conservé, seul le résultat du contrôle part dans le suivi.
//
// Déclaration côté activité :
//   controles: [
//     { cellule: 'D12', libelle: 'Total des entrées', attendu: 480 },
//     { cellule: 'D13', libelle: 'Valeur du stock', attendu: 1234.5, tolerance: 0.01 },
//     { cellule: 'B2',  libelle: 'Votre nom', texte: true },      // simple présence
//     { feuille: 'Inventaire', cellule: 'E4', attendu: 12 },      // feuille nommée
//   ]

import { ech, toast } from '../ui.js';
import { estJuste, normaliser } from './numerique.js';

const CDN_XLSX = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';

let chargement = null;
function chargerXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (chargement) return chargement;
  chargement = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = CDN_XLSX;
    s.onload = () => res(window.XLSX);
    s.onerror = () => rej(new Error('Le lecteur de classeurs n\'a pas pu être chargé.'));
    document.head.appendChild(s);
  });
  return chargement;
}

function valeurCellule(classeur, ctrl) {
  const nom = ctrl.feuille || classeur.SheetNames[0];
  const f = classeur.Sheets[nom];
  if (!f) return { absente: true, feuille: nom };
  const c = f[ctrl.cellule];
  if (!c) return { vide: true, feuille: nom };
  return { valeur: c.v, formule: c.f || null, feuille: nom };
}

export function creerTableur({ consigne, modele, controles, aide }) {
  return {
    rendre(hote, ctx) {
      let resultats = null;
      let nomFichier = '';

      function dessiner() {
        hote.innerHTML = `
          <div class="panneau">
            ${consigne ? `<p>${ech(consigne)}</p>` : ''}
            ${aide ? `<p class="note">${ech(aide)}</p>` : ''}
            ${modele ? `<p><a class="btn btn-s" href="${ech(modele)}" download>Télécharger le classeur à compléter</a></p>` : ''}

            <div class="depot" id="depot">
              <input type="file" id="fichier" accept=".xlsx,.xlsm,.csv" hidden>
              <p><strong>Déposez votre classeur ici</strong>, ou
                <button class="btn btn-s" id="btnParcourir">parcourir</button></p>
              <p class="note">Formats acceptés : .xlsx, .xlsm, .csv — le fichier reste sur votre ordinateur,
                il est lu dans le navigateur et n'est pas envoyé.</p>
              ${nomFichier ? `<p class="note">Dernier fichier lu : <span class="mono">${ech(nomFichier)}</span></p>` : ''}
            </div>
          </div>
          <div id="resultatTableur"></div>`;

        const champ = hote.querySelector('#fichier');
        const zone = hote.querySelector('#depot');
        hote.querySelector('#btnParcourir').addEventListener('click', () => champ.click());
        champ.addEventListener('change', () => { if (champ.files[0]) lire(champ.files[0]); });

        ['dragenter', 'dragover'].forEach((e) => zone.addEventListener(e, (ev) => {
          ev.preventDefault(); zone.classList.add('survol');
        }));
        ['dragleave', 'drop'].forEach((e) => zone.addEventListener(e, () => zone.classList.remove('survol')));
        zone.addEventListener('drop', (ev) => {
          ev.preventDefault();
          const f = ev.dataTransfer.files[0];
          if (f) lire(f);
        });

        if (resultats) afficherResultats();
      }

      async function lire(fichier) {
        nomFichier = fichier.name;
        const z = hote.querySelector('#resultatTableur');
        z.innerHTML = `<div class="avis">Lecture du classeur…</div>`;
        let XLSX;
        try {
          XLSX = await chargerXLSX();
        } catch (e) {
          z.innerHTML = `<div class="avis avis-err">${ech(e.message)} Vérifiez votre connexion et réessayez.</div>`;
          return;
        }
        let classeur;
        try {
          classeur = XLSX.read(await fichier.arrayBuffer(), { type: 'array', cellFormula: true });
        } catch (e) {
          z.innerHTML = `<div class="avis avis-err">Ce fichier n'a pas pu être ouvert.
            Vérifiez qu'il s'agit bien d'un classeur Excel et qu'il n'est pas protégé par mot de passe.</div>`;
          return;
        }

        resultats = controles.map((ctrl) => {
          const lu = valeurCellule(classeur, ctrl);
          let ok = false, remarque = '';
          if (lu.absente) remarque = `La feuille « ${lu.feuille} » est introuvable.`;
          else if (lu.vide) remarque = 'Cellule vide.';
          else if (ctrl.texte) {
            ok = String(lu.valeur).trim().length > 0;
            if (!ok) remarque = 'Rien de saisi.';
          } else {
            ok = estJuste(normaliser(lu.valeur), ctrl.attendu, ctrl.tolerance);
            if (!ok) remarque = `Valeur lue : ${ech(lu.valeur)}.`;
            if (ok && ctrl.formuleAttendue && !lu.formule) {
              remarque = 'Le résultat est bon, mais la cellule ne contient pas de formule.';
            }
          }
          return { ...ctrl, ok, remarque, lu };
        });

        dessiner();
        const score = resultats.filter((r) => r.ok).length;
        await ctx.enregistrer({
          score, max: controles.length,
          detail: Object.fromEntries(resultats.map((r) => [r.cellule, r.ok])),
        });
        toast(`${score} / ${controles.length}`);
      }

      function afficherResultats() {
        const score = resultats.filter((r) => r.ok).length;
        hote.querySelector('#resultatTableur').innerHTML = `
          <div class="avis ${score === resultats.length ? 'avis-ok' : score >= resultats.length * 0.6 ? '' : 'avis-err'}">
            <strong>${score} contrôle${score > 1 ? 's' : ''} réussi${score > 1 ? 's' : ''} sur ${resultats.length}.</strong>
            ${score === resultats.length ? ' Classeur conforme.' : ' Corrigez votre classeur et déposez-le de nouveau.'}
          </div>
          <div class="panneau">
            <table>
              <thead><tr><th></th><th>Contrôle</th><th>Cellule</th><th>Remarque</th></tr></thead>
              <tbody>${resultats.map((r) => `<tr>
                <td class="${r.ok ? 'juste' : 'faux'}">${r.ok ? '✓' : '✗'}</td>
                <td>${ech(r.libelle || '')}</td>
                <td class="mono">${ech((r.feuille ? r.feuille + '!' : '') + r.cellule)}</td>
                <td class="note">${ech(r.remarque)}</td>
              </tr>`).join('')}</tbody>
            </table>
          </div>`;
      }

      dessiner();
    },
  };
}
