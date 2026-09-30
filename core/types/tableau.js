// Type « tableau de données » — le moteur de Magasin, généralisé.
//
// Marche à l'identique quelle que soit la portée du jeu (privée, équipe, groupe, commune) :
// c'est le jeu de données qui décide où les lignes sont stockées, pas ce fichier.
// Fournit sans code supplémentaire : saisie, modification, suppression avec droits,
// traçabilité de l'auteur, liens entre tables, export CSV, gel et réinitialisation.

import { ech, toast, champsHTML, lireChamps, confirmer } from '../ui.js';
import { versCSV, telecharger } from '../store.js';

export function creerTableau({ tables, titre = '' }) {
  return {
    rendre(hote, ctx) {
      const cles = Object.keys(tables);
      let active = cles[0];
      let enEdition = null;
      let gele = false;
      const cache = {};

      const estProf = ctx.profil.role === 'prof';

      function valeurAffichee(ligne, champ) {
        if (champ.type !== 'lien') return ligne[champ.cle] ?? '';
        const src = cache[champ.table] || [];
        const cible = src.find((x) => x[champ.champCle] === ligne[champ.cle]);
        return cible ? `${ligne[champ.cle]} — ${cible[champ.champLibelle] ?? ''}` : (ligne[champ.cle] ?? '');
      }

      function peutModifier(ligne) { return estProf || (ligne._par && ligne._par === ctx.profil.uid); }

      function dessiner() {
        const t = tables[active];
        const lignes = cache[active] || [];
        const enCours = enEdition ? lignes.find((l) => l.id === enEdition) : null;

        hote.innerHTML = `
          ${gele ? `<div class="gele">Séance gelée par l'enseignant : la table est en lecture seule.</div>` : ''}
          <nav class="rangee" style="margin-bottom:14px">
            ${cles.map((k) => `<button class="btn btn-s ${k === active ? 'btn-p' : ''}" data-onglet="${ech(k)}">
              ${ech(tables[k].label)} <span class="note">(${(cache[k] || []).length})</span></button>`).join('')}
          </nav>
          <div class="grille grille-2">
            <section class="panneau">
              <h2>${enCours ? 'Modifier' : 'Ajouter'} — ${ech(t.singulier || t.label)}</h2>
              <div id="hoteChamps">${champsHTML(t.champs, enCours || {})}</div>
              <div id="erreurForm"></div>
              <button class="btn btn-p" id="btnAjouter" ${gele && !estProf ? 'disabled' : ''}>
                ${enCours ? 'Enregistrer' : 'Ajouter'}</button>
              ${enCours ? `<button class="btn" id="btnAnnuler" style="margin-top:8px;width:100%">Annuler</button>` : ''}
            </section>
            <section class="panneau">
              <div class="rangee" style="margin-bottom:10px">
                <strong>${ech(t.label)}</strong>
                <span class="pousse rangee">
                  <button class="btn btn-s" id="btnCsv">Exporter en CSV</button>
                  ${estProf ? `<button class="btn btn-s btn-d" id="btnVider">Vider</button>` : ''}
                </span>
              </div>
              ${lignes.length === 0
                ? `<div class="vide">Table vide. Ajoutez ${ech(t.singulier || 'une entrée')} avec le formulaire.</div>`
                : `<div style="overflow:auto"><table>
                    <thead><tr>${t.champs.map((c) => `<th>${ech(c.label)}</th>`).join('')}<th>Saisi par</th><th></th></tr></thead>
                    <tbody>${lignes.map((l) => `<tr>
                      ${t.champs.map((c) => `<td class="${c.type === 'number' ? 'num' : ''}">${ech(valeurAffichee(l, c))}</td>`).join('')}
                      <td class="note">${ech(l._parNom || '—')}</td>
                      <td style="white-space:nowrap">${peutModifier(l) && !(gele && !estProf)
                        ? `<button class="btn btn-s" data-modif="${ech(l.id)}">Modifier</button>
                           <button class="btn btn-s btn-d" data-suppr="${ech(l.id)}">Suppr.</button>` : ''}</td>
                    </tr>`).join('')}</tbody></table></div>`}
            </section>
          </div>
          <p class="note">${ctx.jeu.partage
            ? "Données partagées : vous modifiez vos propres lignes, l'enseignant peut tout modifier."
            : 'Données personnelles : vous seul y avez accès.'}</p>`;

        brancher();
      }

      function brancher() {
        hote.querySelectorAll('[data-onglet]').forEach((b) => b.addEventListener('click', () => {
          active = b.dataset.onglet; enEdition = null; ouvrirTable(active);
        }));

        const bAdd = hote.querySelector('#btnAjouter');
        if (bAdd) bAdd.addEventListener('click', async () => {
          const t = tables[active];
          const v = lireChamps(hote.querySelector('#hoteChamps'));
          const manquants = t.champs.filter((c) => c.requis && !String(v[c.cle] ?? '').length);
          if (manquants.length) {
            hote.querySelector('#erreurForm').innerHTML =
              `<div class="avis avis-err">Champ obligatoire : ${manquants.map((m) => ech(m.label)).join(', ')}.</div>`;
            return;
          }
          for (const c of t.champs.filter((x) => x.type === 'lien')) {
            if (v[c.cle] && !(cache[c.table] || []).some((x) => x[c.champCle] === v[c.cle])) {
              hote.querySelector('#erreurForm').innerHTML =
                `<div class="avis avis-err">« ${ech(v[c.cle])} » n'existe pas dans ${ech(tables[c.table].label)}.</div>`;
              return;
            }
          }
          if (enEdition) { await ctx.jeu.modifier(active, enEdition, v); enEdition = null; toast('Modifications enregistrées.'); }
          else { await ctx.jeu.ajouter(active, v); toast('Entrée ajoutée.'); }
          if (!ctx.jeu.partage) dessiner();
        });

        const bAnn = hote.querySelector('#btnAnnuler');
        if (bAnn) bAnn.addEventListener('click', () => { enEdition = null; dessiner(); });

        hote.querySelectorAll('[data-modif]').forEach((b) => b.addEventListener('click', () => {
          enEdition = b.dataset.modif; dessiner();
        }));
        hote.querySelectorAll('[data-suppr]').forEach((b) => b.addEventListener('click', async () => {
          if (!confirmer('Supprimer cette entrée ?')) return;
          await ctx.jeu.supprimer(active, b.dataset.suppr);
          if (!ctx.jeu.partage) dessiner();
        }));

        const bCsv = hote.querySelector('#btnCsv');
        if (bCsv) bCsv.addEventListener('click', () => {
          const t = tables[active];
          telecharger(`${ctx.meta.id}-${active}.csv`, versCSV(cache[active] || [], t.champs));
        });

        const bVid = hote.querySelector('#btnVider');
        if (bVid) bVid.addEventListener('click', async () => {
          if (!confirmer(`Vider entièrement « ${tables[active].label} » ? Il n'y a pas de retour en arrière.`)) return;
          await ctx.jeu.vider(active);
          toast('Table vidée.');
          if (!ctx.jeu.partage) dessiner();
        });
      }

      function ouvrirTable(k) {
        // Un seul écouteur à la fois : on n'écoute que la table affichée.
        if (ouvrirTable._stop) ouvrirTable._stop();
        ouvrirTable._stop = ctx.jeu.ecouter(k, (lignes) => { cache[k] = lignes; dessiner(); });
      }

      // Les tables liées sont chargées une fois, sans écouteur permanent.
      (async () => {
        for (const k of cles) {
          if (k === active) continue;
          cache[k] = ctx.jeu.partage ? await ctx.jeu.charger(k) : ctx.jeu.lignes(k);
        }
        ctx.jeu.ecouterMeta((m) => { gele = !!(m && m.gele); dessiner(); });
        ouvrirTable(active);
      })();
    },
  };
}
