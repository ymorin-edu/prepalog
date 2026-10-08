// L'écran du STOCK : le verrou à code (l'enseignant donne le code), les niveaux par référence avec leurs filtres (recherche, marque,
// statut), l'onglet Mouvements, et le masquage pendant un comptage à l'aveugle (inventaire).
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 8) : le code est celui d'avant, mot pour mot,
// y compris le `colspan` de « Aucun résultat. » de `majStock`, qui est écrit tel quel dans la page (point relevé au plan, NON corrigé).
// Monté à chaque ouverture : `monterStock({ db, E, hote, A, MODELS, VARIANTS, VINV, B, inventaireBloque, codeStock, dessinerVue })`.
// `codeStock` est une FONCTION (le code change quand l'enseignant le règle pendant la séance) ; `inventaireBloque` reste au cœur
// (la console s'en sert). Il ne touche que `E.vue`, `E.onglet`, `E.stockOuvert` et `E.erreurCode`. Les noms `#codeStock`,
// `[data-deverrouiller]`, `[data-onglet]` et `[data-filtre]` sont ceux que le gel des questions au fil laisse libres : ne pas les renommer.
// Rend `{ vues: { stock }, brancher(z), apres(z) }`. Le clic sur un onglet (`[data-onglet]`) est branché par le cœur.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech } from '../ui.js';
import { eur, fdt, norm, pastille } from './entreprise-outils.js';

export function monterStock({ db, E, hote, A, MODELS, VARIANTS, VINV, B, inventaireBloque, codeStock, dessinerVue }) {
  const { SIMPLE, unite, label, tdVariante, thVariante, etatStock } = A;
  const { stockDe } = B;

      function vueStock() {
        if (inventaireBloque()) {
          return `<div class="ent-tete"><h2>Stock</h2><p class="note">Inventaire en cours.</p></div>
            <section class="panneau" style="max-width:520px" data-stock-bloque>
              <p><b>Comptage à l'aveugle :</b> le stock du système est masqué jusqu'à la validation du
                comptage (écran « ${ech(VINV.nav.libelle)} »). On compte ce qu'on voit, sans être influencé
                par le chiffre de l'ordinateur.</p></section>`;
        }
        if (!E.stockOuvert) {
          return `<div class="ent-tete"><h2>Stock</h2><p class="note">Accès verrouillé.</p></div>
            <section class="panneau" style="max-width:480px">
              <p>Pour connaître le stock d'une référence précise, utilisez la console
                (<span class="mono">.getstock REF</span>). La vue d'ensemble est verrouillée :
                demandez le code à votre enseignant.</p>
              ${E.erreurCode ? `<div class="avis avis-err">${ech(E.erreurCode)}</div>` : ''}
              <div class="champ"><label for="codeStock">Code d'accès</label>
                <input id="codeStock" class="mono" autocapitalize="characters" spellcheck="false"></div>
              <button class="btn btn-p" data-deverrouiller>Déverrouiller</button></section>`;
        }
        const onglet = E.onglet.stock || 'niveaux';
        let total = 0, valeur = 0, rupture = 0, bas = 0;
        VARIANTS.forEach((v) => {
          const q = stockDe(v.sku); total += q; valeur += q * v.model.cost;
          if (q <= 0) rupture++; else if (q <= v.model.min) bas++;
        });
        const marques = []; MODELS.forEach((m) => { if (m.brand && !marques.includes(m.brand)) marques.push(m.brand); });

        let corps;
        if (onglet === 'niveaux') {
          corps = `<div class="ent-filtres">
            <div class="champ"><label for="sQ">Recherche</label><input id="sQ" data-filtre placeholder="Référence, nom ou emplacement"></div>
            <div class="champ" ${marques.length ? '' : 'hidden'}><label for="sB">Marque</label><select id="sB" data-filtre><option value="">Toutes</option>
              ${marques.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div>
            <div class="champ"><label for="sS">Statut</label><select id="sS" data-filtre><option value="">Tous</option>
              <option value="crit">Rupture</option><option value="warn">Faible</option><option value="ok">OK</option></select></div>
            </div><div id="entListe"></div>`;
        } else {
          const mv = db.moves.slice().reverse().slice(0, 150).map((m) => `<tr><td>${fdt(m.ts)}</td>
            <td class="mono">${ech(m.sku)}</td><td>${ech(m.type)}</td>
            <td class="num ${m.delta < 0 ? 'faux' : 'juste'}"><b class="mono">${m.delta > 0 ? '+' : ''}${m.delta}</b></td>
            <td class="num">${m.after}</td><td class="mono">${m.lot ? ech(m.lot) : '<span class="note">—</span>'}</td>
            <td class="mono">${ech(m.ref)}</td><td>${ech(m.by)}</td></tr>`).join('');
          corps = `<section class="panneau">${mv
            ? `<div class="ent-scroll"><table><thead><tr><th>Date</th><th>Réf.</th><th>Type</th><th class="num">Qté</th>
                <th class="num">Stock après</th><th>Lot</th><th>Origine</th><th>Par</th></tr></thead><tbody>${mv}</tbody></table></div>`
            : '<div class="vide">Aucun mouvement pour le moment.</div>'}</section>`;
        }

        return `<div class="ent-tete"><h2>Stock</h2><p class="note">Niveaux par référence et historique des mouvements.</p></div>
          <div class="ent-kpis">
            <div class="ent-kpi fixe"><b>${total}</b><span>${ech(unite(total))} en stock</span></div>
            <div class="ent-kpi fixe"><b>${eur(valeur)}</b><span>valeur au prix d'achat HT</span></div>
            <div class="ent-kpi fixe"><b>${bas}</b><span>références sous le seuil</span></div>
            <div class="ent-kpi fixe"><b>${rupture}</b><span>références en rupture</span></div></div>
          <div class="rangee" style="margin-bottom:12px">
            <button class="btn btn-s ${onglet === 'niveaux' ? 'btn-p' : ''}" data-onglet="stock" data-val="niveaux">Niveaux de stock</button>
            <button class="btn btn-s ${onglet === 'mouvements' ? 'btn-p' : ''}" data-onglet="stock" data-val="mouvements">Mouvements</button>
          </div>${corps}`;
      }

      function majStock() {
        const el = hote.querySelector('#sQ'); if (!el) return;
        const q = norm(el.value), b = hote.querySelector('#sB').value, st = hote.querySelector('#sS').value;
        let n = 0, lignes = '';
        for (const v of VARIANTS) {
          const qty = stockDe(v.sku), s = etatStock(qty, v.model.min);
          if (b && v.model.brand !== b) continue;
          if (st && s[1] !== st) continue;
          if (q && !norm(v.sku + ' ' + label(v) + ' ' + v.loc).includes(q)) continue;
          n++;
          if (n <= 150) lignes += `<tr><td class="mono">${ech(v.sku)}</td><td>${ech(label(v))}</td>
            ${tdVariante(v, true)}<td class="num"><b class="mono">${qty}</b></td>
            <td class="num note">${v.model.min}</td><td class="mono">${ech(v.loc)}</td><td>${pastille(s[0], s[1])}</td></tr>`;
        }
        hote.querySelector('#entListe').innerHTML = `<section class="panneau"><div class="ent-scroll"><table>
          <thead><tr><th>Référence</th><th>Article</th>${thVariante()}
          <th class="num">Stock</th><th class="num">Seuil</th><th>Emplacement</th><th>Statut</th></tr></thead>
          <tbody>${lignes || '<tr><td colspan="${SIMPLE ? 6 : 8}" class="note">Aucun résultat.</td></tr>'}</tbody></table></div>
          <p class="note">${n > 150 ? `${n} résultats, les 150 premiers sont affichés.` : `${n} résultat${n > 1 ? 's' : ''}.`}</p></section>`;
      }

  return {
    vues: { stock: vueStock },
    brancher(z) {
      z.querySelector('[data-deverrouiller]')?.addEventListener('click', () => {
        const saisi = (z.querySelector('#codeStock').value || '').trim().toUpperCase();
        const attendu = String(codeStock() || '').trim().toUpperCase();
        if (!attendu) { E.erreurCode = "Aucun code n'a encore été défini par votre enseignant."; }
        else if (saisi === attendu) { E.stockOuvert = true; E.erreurCode = ''; }
        else { E.erreurCode = 'Code incorrect.'; }
        dessinerVue();
      });
      if (E.vue !== 'stock') return;
      z.querySelectorAll('[data-filtre]').forEach((el) => el.addEventListener('input', () => majStock()));
    },
    apres() { if (E.vue === 'stock' && E.stockOuvert) majStock(); },
  };
}
