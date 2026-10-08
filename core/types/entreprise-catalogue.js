// L'écran du CATALOGUE et la FICHE PRODUIT : la grille des modèles (recherche, marque, catégorie) et, au clic, la fiche d'un
// modèle (prix, marge, seuils, emplacements, fournisseur).
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 7) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterCatalogue({ E, hote, A, MODELS, MM, VARIANTS, VOCAB, SUP_BY_ID, couleurs, aller })`,
// `A` étant les aides « articles » (`entreprise-outils.js`). Il ne touche que `E.vue` et `E.ref` de l'état d'écran. Rend
// `{ vues: { catalogue, produit }, brancher(z), apres(z) }` : `vues` entre telle quelle dans la table de `dessinerVue`,
// `brancher` n'écoute le champ `[data-filtre]` QUE sur l'écran du catalogue, `apres` remplit la grille juste après le dessin.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech } from '../ui.js';
import { eur, norm } from './entreprise-outils.js';

export function monterCatalogue({ E, hote, A, MODELS, MM, VARIANTS, VOCAB, SUP_BY_ID, couleurs, aller }) {
  const { SIMPLE, nomCouleur } = A;
  const COLORS = couleurs;

      function vueCatalogue() {
        const marques = [], cats = [];
        MODELS.forEach((m) => { if (m.brand && !marques.includes(m.brand)) marques.push(m.brand); if (!cats.includes(m.cat)) cats.push(m.cat); });
        // Un catalogue simple sans marques n'a pas de filtre Marque : un menu vide intriguerait.
        // Le champ reste dans la page, caché, pour que le filtrage n'ait pas deux chemins.
        return `<div class="ent-tete"><h2>Catalogue</h2>
            <p class="note">${SIMPLE ? `${MODELS.length} article${MODELS.length > 1 ? 's' : ''}.`
              : `${MODELS.length} modèles, ${VARIANTS.length} références couleur et ${ech(VOCAB.configWord)}.`}</p></div>
          <div class="ent-filtres">
            <div class="champ"><label for="cQ">Recherche</label><input id="cQ" data-filtre placeholder="${SIMPLE ? 'Désignation ou référence' : 'Nom, marque ou référence'}"></div>
            <div class="champ" ${marques.length ? '' : 'hidden'}><label for="cB">Marque</label><select id="cB" data-filtre><option value="">Toutes</option>
              ${marques.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div>
            <div class="champ"><label for="cC">Catégorie</label><select id="cC" data-filtre><option value="">Toutes</option>
              ${cats.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div></div>
          <div id="entListe"></div>`;
      }

      function majCatalogue() {
        const q = norm(hote.querySelector('#cQ').value), b = hote.querySelector('#cB').value, c = hote.querySelector('#cC').value;
        const res = MODELS.filter((m) => (!b || m.brand === b) && (!c || m.cat === c)
          && (!q || norm(m.brand + ' ' + m.name + ' ' + m.ref + ' ' + m.cat).includes(q)));
        hote.querySelector('#entListe').innerHTML = res.length
          ? `<div class="module-grid">${res.map((m) => `<button class="module-tile" data-produit="${ech(m.ref)}">
              <span class="code">${m.brand ? `${ech(m.brand)} · ` : ''}${ech(m.cat)}</span>
              <span class="titre">${ech(m.name)}</span>
              <span class="desc mono">${ech(m.ref)}</span>
              <span class="desc"><strong>${eur(m.price)}</strong> ${m.colors.filter((k) => COLORS[k]).map((k) => `<span class="teinte" style="background:${COLORS[k][1]}" title="${ech(COLORS[k][0])}"></span>`).join('')}</span>
            </button>`).join('')}</div>`
          : '<div class="vide">Aucun modèle ne correspond.</div>';
        hote.querySelectorAll('[data-produit]').forEach((b2) => b2.addEventListener('click', () => aller('produit', { ref: b2.dataset.produit })));
      }

      function vueProduit() {
        const m = MM[E.ref];
        if (!m) return vueCatalogue();
        const sp = SUP_BY_ID[m.sup], ht = m.price / 1.2;
        return `<button class="lien-accueil" data-vue2="catalogue">← CATALOGUE</button>
          <div class="ent-tete"><h2>${ech([m.brand, m.name].filter(Boolean).join(' '))}</h2><p class="note">${ech(m.desc)}</p></div>
          <section class="panneau"><dl class="ent-dl">
            <dt>${SIMPLE ? 'Référence article' : 'Référence modèle'}</dt><dd class="mono">${ech(m.ref)}</dd>
            ${m.brand ? `<dt>Marque</dt><dd>${ech(m.brand)}</dd>` : ''}
            <dt>Catégorie</dt><dd>${ech(m.cat)}</dd>
            <dt>Prix de vente TTC</dt><dd class="mono"><b>${eur(m.price)}</b></dd>
            <dt>Prix de vente HT</dt><dd class="mono">${eur(ht)}</dd>
            <dt>Prix d'achat HT</dt><dd class="mono">${eur(m.cost)}</dd>
            <dt>Marge brute</dt><dd class="mono">${eur(ht - m.cost)} (${Math.round((ht - m.cost) / ht * 100)} %)</dd>
            ${SIMPLE ? '' : `<dt>${ech(VOCAB.sizeLabel)}s</dt><dd>${m.s0} à ${m.s1}</dd>`}
            <dt>Seuil d'alerte</dt><dd>${m.min} ${ech(VOCAB.unitPl)}${SIMPLE ? '' : ' par référence'}</dd>
            <dt>Stock maximum</dt><dd>${m.max} ${ech(VOCAB.unitPl)}${SIMPLE ? '' : ' par référence'}</dd>
            ${SIMPLE ? `<dt>Emplacement</dt><dd class="mono">${ech(m.emplacement)}</dd>`
              : `<dt>Emplacements</dt><dd>${m.colors.map((c) => `${ech(nomCouleur(c))} <span class="mono">${ech(m.loc[c])}</span>`).join(' · ')}</dd>`}
            ${sp ? `<dt>Fournisseur</dt><dd>${ech(sp.name)} <span class="mono note">${ech(sp.id)}</span><br>
              <span class="note">Délai ${sp.delai} jours · franco ${eur(sp.franco)}</span></dd>` : ''}</dl></section>
          <div class="avis">Le catalogue ne donne pas les quantités en stock : elles changent à
            chaque commande. Pour connaître le stock réel d'une référence, utilisez la console —
            <span class="mono">.getstock ${ech(m.ref)}</span>.</div>`;
      }

  return {
    vues: { catalogue: vueCatalogue, produit: vueProduit },
    brancher(z) {
      if (E.vue !== 'catalogue') return;
      z.querySelectorAll('[data-filtre]').forEach((el) => el.addEventListener('input', () => majCatalogue()));
    },
    apres() { if (E.vue === 'catalogue') majCatalogue(); },
  };
}
