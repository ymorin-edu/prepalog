// Les COMMANDES CLIENTS : la liste, la fiche d'une commande (contrôle du stock ligne par ligne), le bon de préparation (édité, copié en
// texte, validé : la sortie de stock se fait au plus ancien lot), la commande annulée, et les aides que le reste du moteur appelle
// (statut, totaux, mode de livraison, corps du mail de commande).
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 10) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterCommandes({ db, E, hote, prenom, ENTREPRISE, A, VM, VOCAB, livraisons, B, sauver, dessiner })`.
// `livraisons` est la table `U.livraisons || {}` de la séance (lue dans `entreprise.js`, passée par son nom). Il ne touche que la clé
// `E.no` de l'état d'écran, et écrit `db.orders[].prep` et, à la validation, le stock et les mouvements par le socle (`B`).
// Le champ saisi ne redessine PAS l'écran (la case garde le focus) ; le bouton du bon rappelle `brancher` sur le seul bloc du bon.
// Rend `{ vues: { commandes, commande }, brancher(z), statutCommande, totaux, livraisonDe, preparer, corpsMailCommande, aFaire() }` :
// le cœur s'en sert pour le menu, l'accueil, la console (`.getorder`) et la messagerie (enregistrer une commande, afficher son mail).
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech, toast } from '../ui.js';
import { eur, fdate, fdt, pastille } from './entreprise-outils.js';

export function monterCommandes({ db, E, hote, prenom, ENTREPRISE, A, VM, VOCAB, livraisons, B, sauver, dessiner }) {
  const { SIMPLE, unite, label, precision, thVariante, tdVariante } = A;
  const { stockDe, sortirFifo, clientDe } = B;
  const livraisonDe = (o) => livraisons[o.ship] || [o.ship == null ? '' : String(o.ship), 0];

      const totaux = (o) => {
        let sub = 0, n = 0;
        o.lines.forEach((l) => { sub += VM[l.sku].model.price * l.qty; n += l.qty; });
        const port = livraisonDe(o)[1];
        return { sub, port, total: sub + port, n };
      };
      // Une commande semée annulée (`annulee: { motif, at }`, brief MOTEUR-statut-annulee) :
      // « Annulée » l'emporte sur tout, même préparée ou commencée. Elle ne se prépare plus.
      function statutCommande(o) {
        if (o.annulee) return ['Annulée', 'crit'];
        if (!o.prep) return ['À préparer', 'warn'];
        if (o.prep.validated) return o.prep.complete ? ['Préparée', 'ok'] : ['Préparée (reliquat)', 'info'];
        const debut = Object.keys(o.prep.rows).some((k) => {
          const r = o.prep.rows[k];
          return r.seen !== '' || r.loc || r.qty !== '' || r.status;
        });
        return debut ? ['En cours', 'info'] : ['À préparer', 'warn'];
      }
      const jourHeure = (t) => {
        const d = new Date(t), z = (n) => String(n).padStart(2, '0');
        return `${z(d.getDate())}/${z(d.getMonth() + 1)} à ${z(d.getHours())}:${z(d.getMinutes())}`;
      };
      const avisAnnulee = (o) => `<div class="avis avis-err" data-annulee>Annulée${o.annulee.at ? ' le ' + jourHeure(o.annulee.at) : ''}${
        o.annulee.motif ? ' — ' + ech(o.annulee.motif) : ''}</div>`;
      function preparer(o) {
        if (o.prep || o.annulee) return;
        o.prep = { rows: {}, doc: false, validated: false };
        o.lines.forEach((l) => { o.prep.rows[l.sku] = { seen: '', loc: '', qty: '', status: '' }; });
      }
      const ligneRemplie = (r) => r.seen !== '' && r.seen != null && !!(r.loc && r.loc.trim()) && r.qty !== '' && r.qty != null && !!r.status;
      const libelleStatut = (s) => (s === 'ok' ? pastille('Complet', 'ok') : s === 'warn' ? pastille('Partiel', 'warn')
        : s === 'crit' ? pastille('Rupture', 'crit') : '<span class="note">—</span>');
      const commandeDe = (no) => db.orders.find((o) => o.no === no);

      function tableauCommande(o, avecPrix) {
        return `<div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Désignation</th>${thVariante()}
          <th class="num">Qté</th>
          ${avecPrix ? '<th class="num">PU TTC</th><th class="num">Total</th>' : ''}</tr></thead><tbody>
          ${o.lines.map((l) => { const v = VM[l.sku]; return `<tr>
            <td class="mono">${ech(l.sku)}</td><td>${ech(label(v))}</td>${tdVariante(v, true)}
            <td class="num">${l.qty}</td>
            ${avecPrix ? `<td class="num">${eur(v.model.price)}</td><td class="num">${eur(v.model.price * l.qty)}</td>` : ''}
          </tr>`; }).join('')}</tbody></table></div>`;
      }

      function corpsMailCommande(o) {
        const c = clientDe(o.customerId), t = totaux(o);
        return `<p>Une nouvelle commande vient d'être passée sur le site. Paiement par carte bancaire accepté.</p>
          <div class="ent-cols">
            <div><div class="ent-lbl">Client</div><strong>${ech(c.prenom + ' ' + c.nom)}</strong><br>${ech(c.adr)}<br>
              ${ech(c.cp)} ${ech(c.ville)}<br><span class="mono note">${ech(c.email)} · ${ech(c.tel)}</span></div>
            <div><div class="ent-lbl">Commande</div><strong class="mono">${ech(o.no)}</strong><br>Date : ${fdt(o.date)}<br>
              Livraison : ${ech(livraisonDe(o)[0])}<br>Code client : <span class="mono">${ech(c.id)}</span></div>
          </div>${tableauCommande(o, true)}
          <p class="ent-droite">Sous-total ${eur(t.sub)} · Port ${eur(t.port)} · <strong>Total TTC ${eur(t.total)}</strong></p>`;
      }

      /* ---------------------------------------------------------- les écrans */
      function vueCommandes() {
        const lignes = db.orders.slice().sort((a, b) => b.date - a.date).map((o) => {
          const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o);
          return `<tr><td class="mono">${ech(o.no)}</td><td>${fdate(o.date)}</td>
            <td>${ech(c.prenom + ' ' + c.nom)}</td><td class="num">${o.lines.length}</td>
            <td class="num">${t.n}</td><td class="num">${eur(t.total)}</td>
            <td>${pastille(s[0], s[1])}</td>
            <td class="num"><button class="btn btn-s" data-ouvrir-cmd="${ech(o.no)}">Ouvrir</button></td></tr>`;
        }).join('');
        const u = VOCAB.unitPl.charAt(0).toUpperCase() + VOCAB.unitPl.slice(1);
        return `<div class="ent-tete"><h2>Commandes clients</h2>
            <p class="note">Les commandes apparaissent ici après avoir été enregistrées depuis la messagerie.</p></div>
          <section class="panneau">${lignes
            ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Date</th><th>Client</th>
                <th class="num">Lignes</th><th class="num">${ech(u)}</th><th class="num">Total TTC</th>
                <th>Statut</th><th></th></tr></thead><tbody>${lignes}</tbody></table></div>`
            : '<div class="vide">Aucune commande enregistrée. Ouvrez un mail de commande dans la messagerie.</div>'}</section>`;
      }

      function vueCommande() {
        const o = commandeDe(E.no);
        if (!o) return vueCommandes();
        if (o.annulee && !o.prep) return vueCommandeAnnulee(o);
        preparer(o);
        const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o), p = o.prep;
        // Annulée en cours de préparation : le contrôle et le bon restent lisibles, rien ne se saisit.
        const fige = p.validated || !!o.annulee;
        const complet = o.lines.every((l) => ligneRemplie(p.rows[l.sku]));
        const choixStatut = [['', 'Choisir…'], ['ok', 'Complet'], ['warn', 'Partiel'], ['crit', 'Rupture']];

        const lignes = o.lines.map((l) => {
          const v = VM[l.sku], r = p.rows[l.sku];
          const cStock = fige ? `<b class="mono">${r.seen === '' ? '—' : r.seen}</b>`
            : `<input type="number" min="0" data-prep="seen" data-sku="${ech(l.sku)}" value="${r.seen === '' ? '' : r.seen}" style="width:70px" aria-label="Stock trouvé pour ${ech(l.sku)}">`;
          const cEmpl = fige ? ech(r.loc || '—')
            : `<input type="text" data-prep="loc" data-sku="${ech(l.sku)}" value="${ech(r.loc)}" placeholder="emplacement" style="width:112px" aria-label="Emplacement pour ${ech(l.sku)}">`;
          const cQte = fige ? (r.qty === '' ? '—' : r.qty)
            : `<input type="number" min="0" data-prep="qty" data-sku="${ech(l.sku)}" value="${r.qty === '' ? '' : r.qty}" style="width:70px" aria-label="Quantité à préparer pour ${ech(l.sku)}">`;
          const cStatut = fige ? libelleStatut(r.status)
            : `<select data-prep="status" data-sku="${ech(l.sku)}" aria-label="Statut pour ${ech(l.sku)}">
                ${choixStatut.map((op) => `<option value="${op[0]}" ${(r.status || '') === op[0] ? 'selected' : ''}>${op[1]}</option>`).join('')}</select>`;
          return `<tr><td class="mono">${ech(l.sku)}</td>
            <td>${ech(label(v))}${precision(v)}</td>
            <td class="num">${l.qty}</td><td class="num">${cStock}</td><td class="mono">${cEmpl}</td>
            <td class="num">${cQte}</td><td>${cStatut}</td></tr>`;
        }).join('');

        return `<button class="lien-accueil" data-vue2="commandes">← COMMANDES</button>
          <div class="ent-tete"><h2>Commande <span class="mono">${ech(o.no)}</span> ${pastille(s[0], s[1])}</h2></div>
          ${o.annulee ? avisAnnulee(o) : ''}
          <section class="panneau"><dl class="ent-dl">
            <dt>Client</dt><dd>${ech(c.prenom + ' ' + c.nom)} <span class="mono note">${ech(c.id)}</span></dd>
            <dt>Adresse</dt><dd>${ech(c.adr)}, ${ech(c.cp)} ${ech(c.ville)}</dd>
            <dt>Livraison</dt><dd>${ech(livraisonDe(o)[0])}</dd>
            <dt>Date</dt><dd>${fdt(o.date)}</dd>
            <dt>Montant</dt><dd>${eur(t.total)} TTC, ${t.n} ${ech(unite(t.n))}</dd></dl></section>
          <section class="panneau"><h3>Contrôle du stock</h3>
            ${o.annulee ? '<p class="note">Commande annulée : le contrôle saisi reste consultable, rien ne se modifie.</p>' : `<p class="note">Trouvez le stock réel de chaque référence avec la console
              (<span class="mono">.getstock REF</span>) et son emplacement (<span class="mono">.getlocation REF</span>).
              Remplissez pour chaque ligne le stock trouvé, l'emplacement, la quantité à préparer et le statut.</p>`}
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th><th class="num">Commandé</th>
              <th class="num">Stock trouvé</th><th>Emplacement</th><th class="num">À préparer</th><th>Statut</th>
              </tr></thead><tbody>${lignes}</tbody></table></div>
            ${o.annulee ? '' : `<div class="rangee" style="margin-top:14px">
              <button class="btn btn-p" data-bon ${complet ? '' : 'disabled'}>
                ${p.doc ? 'Régénérer le bon de préparation' : 'Éditer le bon de préparation'}</button>
              <span class="note" id="aideBon" ${complet ? 'hidden' : ''}>Complétez toutes les lignes pour continuer.</span>
            </div>`}</section>
          <div id="blocBon">${p.doc ? bonDePreparation(o) : ''}</div>`;
      }

      // Annulée sans avoir été commencée : la commande se lit, aucun contrôle à remplir.
      function vueCommandeAnnulee(o) {
        const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o);
        return `<button class="lien-accueil" data-vue2="commandes">← COMMANDES</button>
          <div class="ent-tete"><h2>Commande <span class="mono">${ech(o.no)}</span> ${pastille(s[0], s[1])}</h2></div>
          ${avisAnnulee(o)}
          <section class="panneau"><dl class="ent-dl">
            <dt>Client</dt><dd>${ech(c.prenom + ' ' + c.nom)} <span class="mono note">${ech(c.id)}</span></dd>
            <dt>Adresse</dt><dd>${ech(c.adr)}, ${ech(c.cp)} ${ech(c.ville)}</dd>
            <dt>Livraison</dt><dd>${ech(livraisonDe(o)[0])}</dd>
            <dt>Date</dt><dd>${fdt(o.date)}</dd>
            <dt>Montant</dt><dd>${eur(t.total)} TTC, ${t.n} ${ech(unite(t.n))}</dd></dl></section>
          <section class="panneau"><h3>Articles commandés</h3>${tableauCommande(o, true)}</section>`;
      }

      function majChamp(sku, champ, val) {
        const o = commandeDe(E.no); if (!o || o.annulee) return;
        const r = o.prep.rows[sku]; if (!r) return;
        if (champ === 'seen' || champ === 'qty') { const n = parseInt(val, 10); r[champ] = isNaN(n) ? '' : Math.max(0, n); }
        else r[champ] = val;

        // On ne redessine PAS la vue ici. Le `change` d'un champ arrive au moment où l'élève
        // passe au suivant : remplacer le tableau à cet instant lui volerait la case sur
        // laquelle il vient de cliquer, et la saisie serait perdue. On met donc à jour à la
        // main les seuls éléments concernés.
        if (o.prep.doc) { o.prep.doc = false; const b = hote.querySelector('#blocBon'); if (b) b.innerHTML = ''; }
        const complet = o.lines.every((l) => ligneRemplie(o.prep.rows[l.sku]));
        const btn = hote.querySelector('[data-bon]');
        if (btn) { btn.disabled = !complet; btn.textContent = 'Éditer le bon de préparation'; }
        const aide = hote.querySelector('#aideBon');
        if (aide) aide.hidden = complet;
        sauver();
      }

      function bonDePreparation(o) {
        const p = o.prep, c = clientDe(o.customerId);
        const aPrendre = o.lines.filter((l) => p.rows[l.sku].qty > 0)
          .sort((a, b) => (VM[a.sku].loc < VM[b.sku].loc ? -1 : 1));
        const manquants = o.lines.filter((l) => p.rows[l.sku].qty < l.qty);
        let n = 0; aPrendre.forEach((l) => { n += p.rows[l.sku].qty; });

        const lignes = aPrendre.map((l, i) => {
          const v = VM[l.sku];
          return `<tr><td>${i + 1}</td><td class="mono"><b>${ech(v.loc)}</b></td><td class="mono">${ech(l.sku)}</td>
            <td>${ech(label(v))}</td>${tdVariante(v)}
            <td class="num"><b>${p.rows[l.sku].qty}</b></td><td class="num"><span class="ent-case"></span></td></tr>`;
        }).join('');

        const reliquat = manquants.length ? `<div class="ent-lbl" style="margin-top:14px">Reliquat / articles non préparés</div>
          <table><tbody>${manquants.map((l) => `<tr><td class="mono">${ech(l.sku)}</td><td>${ech(label(VM[l.sku]))}</td>
            <td class="num">Manque ${l.qty - p.rows[l.sku].qty} sur ${l.qty}</td></tr>`).join('')}</tbody></table>` : '';

        const pied = o.annulee ? ''
          : p.validated
          ? '<div class="avis avis-ok">Préparation validée : le stock a été diminué (voir Stock, Mouvements).</div>'
          : `<div class="rangee" style="margin-top:12px">
              <button class="btn btn-p" data-valider ${aPrendre.length ? '' : 'disabled'}>Valider la préparation (sortie de stock)</button>
              <button class="btn" data-copier>Copier le bon en texte</button></div>
             <div id="msgCopie" class="note"></div>`;

        return `<section class="panneau ent-doc" id="bon">
            <div class="rangee"><div><div class="ent-lbl">${ech(ENTREPRISE.nom)} · Entrepôt</div>
              <h3>Bon de préparation BP-${ech(o.no.replace('CMD-', ''))}</h3></div>
              <span class="pousse note" style="text-align:right">Édité le ${fdt(Date.now())}<br>par ${ech(prenom)}</span></div>
            <div class="ent-cols">
              <div><div class="ent-lbl">Commande</div><strong>${ech(o.no)}</strong> du ${fdate(o.date)}</div>
              <div><div class="ent-lbl">Destinataire</div>${ech(c.prenom + ' ' + c.nom)}<br>${ech(c.adr)}<br>${ech(c.cp)} ${ech(c.ville)}</div>
              <div><div class="ent-lbl">Transport</div>${ech(livraisonDe(o)[0])}</div></div>
            ${aPrendre.length ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Emplacement</th><th>Réf.</th>
                <th>Article</th>${thVariante()}<th class="num">Qté</th>
                <th class="num">Prélevé</th></tr></thead><tbody>${lignes}</tbody></table></div>
              <p class="ent-droite"><strong>${aPrendre.length} ligne${aPrendre.length > 1 ? 's' : ''} · ${n} ${ech(unite(n))}</strong></p>`
              : '<p>Aucun article disponible : rien à préparer.</p>'}
            ${reliquat}
            <div class="ent-signatures"><div><div class="ent-lbl">Préparateur</div></div><div><div class="ent-lbl">Contrôle emballage</div></div></div>
          </section>${pied}`;
      }

      function validerPreparation() {
        const o = commandeDe(E.no);
        if (!o || o.annulee) return;
        const p = o.prep, err = [];
        o.lines.forEach((l) => { if (p.rows[l.sku].qty > stockDe(l.sku)) err.push(l.sku); });
        if (err.length) {
          err.forEach((k) => { p.rows[k] = { seen: '', loc: '', qty: '', status: '' }; });
          p.doc = false; sauver(); dessiner();
          return toast(`Le stock a changé pour : ${err.join(', ')}. Remplissez de nouveau ces lignes.`);
        }
        let complet = true;
        o.lines.forEach((l) => {
          const r = p.rows[l.sku];
          // La sortie consomme les lots dans l'ordre d'entrée : c'est ce qui permettra de
          // dire, plus tard, quel lot est parti dans quel colis client.
          if (r.qty > 0) sortirFifo(l.sku, r.qty, 'Sortie : préparation', 'BP-' + o.no.replace('CMD-', ''));
          if (r.qty < l.qty) complet = false;
        });
        p.validated = true; p.complete = complet; p.at = Date.now();
        sauver(); dessiner();
        toast(complet ? 'Préparation validée, commande complète.' : 'Préparation validée, avec reliquat.');
      }

      function copierBon() {
        const o = commandeDe(E.no), p = o.prep, c = clientDe(o.customerId);
        let t = `BON DE PRÉPARATION BP-${o.no.replace('CMD-', '')}\nCommande ${o.no} | Client : ${c.prenom} ${c.nom} | ${livraisonDe(o)[0]}\n\n`;
        o.lines.filter((l) => p.rows[l.sku].qty > 0)
          .sort((a, b) => (VM[a.sku].loc < VM[b.sku].loc ? -1 : 1))
          .forEach((l) => { t += `${VM[l.sku].loc}\t${l.sku}\t${label(VM[l.sku])}${SIMPLE ? '' : `\t${VOCAB.sizeShort}${VM[l.sku].size}`}\tQté ${p.rows[l.sku].qty}\n`; });
        const m = hote.querySelector('#msgCopie');
        const ok = () => { if (m) m.textContent = 'Bon copié dans le presse-papiers.'; };
        const ko = () => { if (m) m.textContent = 'Copie impossible ici : sélectionnez le bon à la souris.'; };
        try { navigator.clipboard.writeText(t).then(ok, ko); } catch (e) { ko(); }
      }

  // Les commandes à préparer (menu et accueil).
  const aFaire = () => db.orders.filter((o) => ['À préparer', 'En cours'].includes(statutCommande(o)[0])).length;

  // Le branchement des champs du contrôle, du bon et de sa validation. Rappelé sur le seul bloc du bon quand on l'édite.
  function brancher(z) {
    // `input` autant que `change` : le `change` d'un champ texte n'arrive qu'au moment où
    // l'élève en sort. S'il remplit sa dernière case puis ferme l'onglet, ou si le
    // navigateur ne déclenche jamais le blur, la saisie serait perdue.
    z.querySelectorAll('[data-prep]').forEach((el) => {
      const maj = () => majChamp(el.dataset.sku, el.dataset.prep, el.value);
      el.addEventListener('input', maj);
      el.addEventListener('change', maj);
    });
    z.querySelector('[data-bon]')?.addEventListener('click', () => {
      const o = commandeDe(E.no); if (!o || o.annulee) return; o.prep.doc = true; sauver();
      const b = hote.querySelector('#blocBon');
      b.innerHTML = bonDePreparation(o);
      brancher(b);
      z.querySelector('[data-bon]').textContent = 'Régénérer le bon de préparation';
      hote.querySelector('#bon')?.scrollIntoView({ block: 'start' });
    });
    z.querySelector('[data-valider]')?.addEventListener('click', validerPreparation);
    z.querySelector('[data-copier]')?.addEventListener('click', copierBon);
  }

  return {
    vues: { commandes: vueCommandes, commande: vueCommande },
    brancher,
    statutCommande, totaux, livraisonDe, preparer, corpsMailCommande, aFaire,
  };
}
