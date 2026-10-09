// Type « association » — ranger des étiquettes dans les bonnes catégories.
//
// Glisser-déposer pour ceux qui ont une souris, sélection au clic pour les autres :
// les deux mènent au même résultat. Une étiquette mal placée se reprend.

import { ech, toast } from '../ui.js';
import { melangerListe } from '../tirage.js';

export function creerAssoc({ consigne, categories, etiquettes, melanger = true }) {
  return {
    rendre(hote, ctx) {
      // placement[etiquetteId] = categorieId | null (non rangée)
      const placement = {};
      etiquettes.forEach((e) => { placement[e.id] = null; });
      let choisie = null;
      let corrige = null;

      const enReserve = () => {
        const l = etiquettes.filter((e) => placement[e.id] === null);
        return melanger && !corrige ? melangerListe(l) : l;
      };
      const dansCategorie = (cid) => etiquettes.filter((e) => placement[e.id] === cid);

      function etiquetteHTML(e) {
        const etat = corrige ? (placement[e.id] === e.categorie ? 'juste' : 'faux') : '';
        return `<button class="etiquette ${etat} ${choisie === e.id ? 'choisie' : ''}"
          draggable="true" data-etiq="${ech(e.id)}">${ech(e.texte)}</button>`;
      }

      function dessiner() {
        const restantes = enReserve();
        hote.innerHTML = `
          <p class="note">${ech(consigne || 'Rangez chaque étiquette dans la bonne catégorie.')}
            Cliquez une étiquette puis une catégorie, ou faites-la glisser.</p>

          <section class="panneau reserve" id="reserve">
            <h3>À ranger <span class="note">(${restantes.length})</span></h3>
            <div class="etiquettes">
              ${restantes.length ? restantes.map(etiquetteHTML).join('')
                : `<span class="note">Toutes les étiquettes sont rangées.</span>`}
            </div>
          </section>

          <div class="bacs">
            ${categories.map((c) => `
              <section class="panneau bac" data-cat="${ech(c.id)}">
                <h3>${ech(c.label)}</h3>
                ${c.aide ? `<p class="note">${ech(c.aide)}</p>` : ''}
                <div class="etiquettes">${dansCategorie(c.id).map(etiquetteHTML).join('')}</div>
              </section>`).join('')}
          </div>

          <div class="rangee" style="margin-top:16px">
            <button class="btn btn-p" id="btnValider" ${restantes.length ? 'disabled' : ''}>
              ${restantes.length ? `Rangez les ${restantes.length} étiquettes restantes` : 'Valider'}
            </button>
            <button class="btn" id="btnVider">Tout reprendre</button>
          </div>
          <div id="bilanAssoc"></div>`;
        brancher();
      }

      function placer(eid, cid) {
        placement[eid] = cid;
        choisie = null; corrige = null;
        dessiner();
      }

      function brancher() {
        hote.querySelectorAll('[data-etiq]').forEach((el) => {
          el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = el.dataset.etiq;
            // Une étiquette déjà rangée revient en réserve au clic.
            if (placement[id] !== null && choisie === null) return placer(id, null);
            choisie = choisie === id ? null : id;
            dessiner();
          });
          el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', el.dataset.etiq);
            el.classList.add('glisse');
          });
          el.addEventListener('dragend', () => el.classList.remove('glisse'));
        });

        const deposer = (zone, cid) => {
          zone.addEventListener('click', () => { if (choisie) placer(choisie, cid); });
          zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('survol'); });
          zone.addEventListener('dragleave', () => zone.classList.remove('survol'));
          zone.addEventListener('drop', (e) => {
            e.preventDefault(); zone.classList.remove('survol');
            const id = e.dataTransfer.getData('text/plain');
            if (id) placer(id, cid);
          });
        };
        hote.querySelectorAll('[data-cat]').forEach((z) => deposer(z, z.dataset.cat));
        deposer(hote.querySelector('#reserve'), null);

        hote.querySelector('#btnVider').addEventListener('click', () => {
          etiquettes.forEach((e) => { placement[e.id] = null; });
          choisie = null; corrige = null; dessiner();
        });

        hote.querySelector('#btnValider').addEventListener('click', async () => {
          corrige = true;
          const justes = etiquettes.filter((e) => placement[e.id] === e.categorie).length;
          dessiner();
          const b = hote.querySelector('#bilanAssoc');
          b.innerHTML = `<div class="avis ${justes === etiquettes.length ? 'avis-ok' : justes >= etiquettes.length * 0.6 ? '' : 'avis-err'}">
            <strong>${justes} étiquette${justes > 1 ? 's' : ''} bien rangée${justes > 1 ? 's' : ''} sur ${etiquettes.length}.</strong>
            ${justes === etiquettes.length ? ' Tout est juste.' : ' Les étiquettes en rouge sont mal placées : reprenez-les et recommencez.'}
          </div>`;
          await ctx.enregistrer({ score: justes, max: etiquettes.length, detail: { ...placement } });
          toast(`${justes} / ${etiquettes.length}`);
        });
      }

      dessiner();
    },
  };
}
