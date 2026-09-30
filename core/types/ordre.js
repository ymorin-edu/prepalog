// Type « remise en ordre » — replacer des étapes dans le bon ordre.
//
// L'activité fournit un ou plusieurs scénarios, chacun avec ses étapes DANS L'ORDRE
// CORRECT : le moteur se charge de les mélanger. Trois façons de réordonner, pour que
// tout le monde s'en sorte : les flèches, le clic (sélectionner puis déposer) et le
// glisser-déposer.
//
// Score de l'activité = nombre de scénarios réussis entièrement. Le meilleur résultat
// de chaque scénario est conservé dans le jeu de données privé de l'élève.

import { ech, toast } from '../ui.js';

const melange = (t) => {
  const a = [...t];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // On évite de rendre l'ordre initial déjà correct.
  if (a.every((x, i) => x === t[i]) && a.length > 1) { [a[0], a[1]] = [a[1], a[0]]; }
  return a;
};

export function creerOrdre({ scenarios }) {
  return {
    rendre(hote, ctx) {
      let scenario = null;      // scénario en cours, null = liste de choix
      let ordre = [];           // indices des étapes, dans l'ordre proposé par l'élève
      let choisi = null;        // index sélectionné au clic
      let corrige = null;       // tableau de booléens après validation

      const bests = () => {
        const o = {};
        (ctx.jeu.lignes('resultats') || []).forEach((r) => {
          o[r.scenario] = Math.max(o[r.scenario] ?? -1, r.score);
        });
        return o;
      };

      async function enregistrer(sid, score, total) {
        const anciens = ctx.jeu.lignes('resultats') || [];
        const ligne = anciens.find((r) => r.scenario === sid);
        if (ligne) {
          if (score > (ligne.score ?? -1)) await ctx.jeu.modifier('resultats', ligne.id, { score, total });
        } else {
          await ctx.jeu.ajouter('resultats', { scenario: sid, score, total });
        }
        const b = bests();
        const reussis = scenarios.filter((s) => b[s.id] === s.etapes.length).length;
        await ctx.enregistrer({ score: reussis, max: scenarios.length, detail: b });
      }

      // ---------------------------------------------------------- liste des scénarios
      function vueListe() {
        const b = bests();
        hote.innerHTML = `
          <p class="note">Choisissez une chaîne, puis remettez ses étapes dans le bon ordre.
            Une chaîne compte pour réussie lorsque les ${scenarios[0].etapes.length} étapes sont justes.</p>
          <div class="module-grid">
            ${scenarios.map((s) => {
              const sc = b[s.id];
              const fini = sc === s.etapes.length;
              return `<button class="module-tile" data-scen="${ech(s.id)}">
                <span class="code">${fini ? '✓ réussie' : sc !== undefined ? `meilleur : ${sc} / ${s.etapes.length}` : 'non commencée'}</span>
                <span class="titre">${ech(s.titre)}</span>
                <span class="desc">${ech(s.sousTitre || '')}</span>
              </button>`;
            }).join('')}
          </div>`;
        hote.querySelectorAll('[data-scen]').forEach((btn) => btn.addEventListener('click', () => {
          scenario = scenarios.find((s) => s.id === btn.dataset.scen);
          ordre = melange(scenario.etapes.map((_, i) => i));
          choisi = null; corrige = null;
          vueJeu();
        }));
      }

      // ------------------------------------------------------------------ le scénario
      function vueJeu() {
        const n = scenario.etapes.length;
        hote.innerHTML = `
          <button class="lien-accueil" id="btnListe">← TOUTES LES CHAÎNES</button>
          <h2>${ech(scenario.titre)}</h2>
          <p class="note">${ech(scenario.sousTitre || '')}</p>
          <p class="note">Remettez les ${n} étapes dans l'ordre, de la première à la dernière.
            Utilisez les flèches, le glisser-déposer, ou cliquez sur deux étapes pour les échanger.</p>
          <ol class="ordre" id="liste">
            ${ordre.map((idx, pos) => {
              const e = scenario.etapes[idx];
              const etat = corrige ? (corrige[pos] ? 'juste' : 'faux') : '';
              return `<li class="ordre-item ${etat} ${choisi === pos ? 'choisi' : ''}"
                        draggable="true" data-pos="${pos}">
                <span class="ordre-rang">${pos + 1}</span>
                <span class="ordre-icone">${ech(e.icone || '')}</span>
                <span class="ordre-texte">
                  ${ech(e.texte)}
                  ${corrige ? `<span class="note ordre-expl">${ech(e.expl || '')}</span>` : ''}
                </span>
                <span class="ordre-fleches">
                  <button class="btn btn-s" data-haut="${pos}" ${pos === 0 ? 'disabled' : ''} aria-label="Monter">↑</button>
                  <button class="btn btn-s" data-bas="${pos}" ${pos === n - 1 ? 'disabled' : ''} aria-label="Descendre">↓</button>
                </span>
              </li>`;
            }).join('')}
          </ol>
          <div class="rangee" style="margin-top:16px">
            <button class="btn btn-p" id="btnValider">Valider l'ordre</button>
            <button class="btn" id="btnMelanger">Mélanger de nouveau</button>
          </div>
          <div id="bilanOrdre"></div>`;
        brancher();
      }

      function deplacer(de, vers) {
        if (vers < 0 || vers >= ordre.length) return;
        const [x] = ordre.splice(de, 1);
        ordre.splice(vers, 0, x);
        corrige = null; choisi = null;
        vueJeu();
      }

      function brancher() {
        hote.querySelector('#btnListe').addEventListener('click', vueListe);
        hote.querySelectorAll('[data-haut]').forEach((b) => b.addEventListener('click', (ev) => {
          ev.stopPropagation(); deplacer(+b.dataset.haut, +b.dataset.haut - 1);
        }));
        hote.querySelectorAll('[data-bas]').forEach((b) => b.addEventListener('click', (ev) => {
          ev.stopPropagation(); deplacer(+b.dataset.bas, +b.dataset.bas + 1);
        }));

        // Clic : on sélectionne, puis on clique la cible pour échanger.
        hote.querySelectorAll('.ordre-item').forEach((li) => {
          li.addEventListener('click', () => {
            const pos = +li.dataset.pos;
            if (choisi === null) { choisi = pos; vueJeu(); return; }
            if (choisi === pos) { choisi = null; vueJeu(); return; }
            [ordre[choisi], ordre[pos]] = [ordre[pos], ordre[choisi]];
            choisi = null; corrige = null; vueJeu();
          });

          li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', li.dataset.pos);
            li.classList.add('glisse');
          });
          li.addEventListener('dragend', () => li.classList.remove('glisse'));
          li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('survol'); });
          li.addEventListener('dragleave', () => li.classList.remove('survol'));
          li.addEventListener('drop', (e) => {
            e.preventDefault();
            const de = +e.dataTransfer.getData('text/plain');
            deplacer(de, +li.dataset.pos);
          });
        });

        hote.querySelector('#btnMelanger').addEventListener('click', () => {
          ordre = melange(ordre); corrige = null; choisi = null; vueJeu();
        });

        hote.querySelector('#btnValider').addEventListener('click', async () => {
          corrige = ordre.map((idx, pos) => idx === pos);
          const score = corrige.filter(Boolean).length;
          const total = scenario.etapes.length;
          vueJeu();
          const b = hote.querySelector('#bilanOrdre');
          b.innerHTML = `<div class="avis ${score === total ? 'avis-ok' : score >= total * 0.6 ? '' : 'avis-err'}">
            <strong>${score} étape${score > 1 ? 's' : ''} bien placée${score > 1 ? 's' : ''} sur ${total}.</strong>
            ${score === total
              ? ' Chaîne réussie. Les explications de chaque étape sont affichées ci-dessus.'
              : ' Les étapes en rouge ne sont pas à leur place. Relisez les explications et recommencez.'}
          </div>`;
          b.scrollIntoView({ block: 'nearest' });
          await enregistrer(scenario.id, score, total);
          toast(score === total ? 'Chaîne réussie.' : `${score} / ${total}`);
        });
      }

      vueListe();
    },
  };
}
