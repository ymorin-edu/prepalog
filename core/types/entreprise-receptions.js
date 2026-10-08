// Les RÉCEPTIONS : la liste des livraisons annoncées, la fiche d'une réception (colis posés sur le quai, bon de réception à remplir :
// lot, quantités annoncées et comptées, état, décision), la confirmation, la validation (entrée en stock par lot), et le bon de
// livraison du fournisseur que la messagerie affiche aussi.
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 11) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterReceptions({ db, E, hote, ENTREPRISE, A, VM, SUP_BY_ID, litige, B, sauver, dessiner })`.
// `litige` est `!!U.receptionLitige` (lu dans `entreprise.js`) : la décision « En litige (zone litiges) » n'existe que si la séance le
// déclare. Il ne touche que la clé `E.no` de l'état d'écran, et écrit `db.receptions[].ctrl`, le stock et les mouvements par le socle (`B`).
// Le drapeau de confirmation (`confirmeRec`) vit DANS le montage (une ouverture) : les tests montent plusieurs hôtes dans une page.
// Rien ne se redessine pendant la saisie (la case qu'on quitte ne doit pas disparaître). Le clic sur « Ouvrir » (`[data-ouvrir-rec]`)
// reste branché par le cœur : le mail du bon de livraison porte le même bouton.
// Rend `{ vues: { receptions, reception }, brancher(z), receptionDe, bonDeLivraison, aRecevoir() }`.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech, toast, confirmerDansLaPage } from '../ui.js';
import { fdate, fdt, pastille } from './entreprise-outils.js';

export function monterReceptions({ db, E, hote, ENTREPRISE, A, VM, SUP_BY_ID, litige, B, sauver, dessiner }) {
  const { unite, label, precision, thVariante, tdVariante } = A;
  const { stockDe, mouvement } = B;

      // Une réception, c'est deux documents qui ne disent pas forcément la même chose :
      // le bon de livraison, annoncé par le fournisseur (il arrive par mail), et les colis
      // réellement posés sur le quai. L'élève compte, compare, décide, et saisit. Le module
      // ne remplit rien à sa place et ne corrige rien : il enregistre ce qu'on lui dit, et
      // l'élève va en constater le résultat dans son stock.

      const receptionDe = (no) => (db.receptions || []).find((r) => r.no === no);

      // Le bon de livraison, tel que le fournisseur l'a rempli. C'est un document : il annonce,
      // il n'établit rien. Les quantités réellement reçues sont sur le quai, pas ici.
      function bonDeLivraison(r) {
        const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '', adr: '', cp: '', ville: '' };
        const lignes = (r.bl.lines || []).map((l) => { const v = VM[l.sku];
          return `<tr><td class="mono">${ech(l.sku)}</td><td>${v ? ech(label(v)) : '—'}</td>
            ${tdVariante(v)}
            <td class="num"><b>${l.qty}</b></td></tr>`; }).join('');
        const n = (r.bl.lines || []).reduce((s, l) => s + l.qty, 0);
        return `<section class="panneau ent-doc">
            <div class="rangee"><div><div class="ent-lbl">${ech(sup.name)}</div>
              <h3>Bon de livraison ${ech(r.bl.no)}</h3></div>
              <span class="pousse note" style="text-align:right">${ech(sup.adr)}<br>${ech(sup.cp)} ${ech(sup.ville)}</span></div>
            <div class="ent-cols">
              <div><div class="ent-lbl">Destinataire</div><strong>${ech(ENTREPRISE.nom)}</strong><br>Entrepôt — quai de réception</div>
              <div><div class="ent-lbl">Date d'expédition</div>${fdate(r.bl.date)}</div>
              <div><div class="ent-lbl">Numéro de lot</div><strong class="mono">${ech(r.bl.lot)}</strong></div>
              <div><div class="ent-lbl">Transporteur</div>${ech(r.transporteur || '—')}</div></div>
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th>${thVariante()}
              <th class="num">Qté annoncée</th></tr></thead>
              <tbody>${lignes}</tbody></table></div>
            <p class="ent-droite"><strong>${(r.bl.lines || []).length} ligne${(r.bl.lines || []).length > 1 ? 's' : ''} · ${n} ${ech(unite(n))} annoncée${n > 1 ? 's' : ''}</strong></p>
            <div class="ent-signatures"><div><div class="ent-lbl">Expéditeur</div></div><div><div class="ent-lbl">Réception (nom, date, réserves)</div></div></div>
          </section>`;
      }

      // Les références concernées : celles du bon de livraison ET celles trouvées dans les
      // colis. Un carton contenant une référence non annoncée doit apparaître au contrôle.
      function refsReception(r) {
        const out = [];
        (r.bl.lines || []).forEach((l) => { if (!out.includes(l.sku)) out.push(l.sku); });
        (r.colis || []).forEach((c) => { if (!out.includes(c.sku)) out.push(c.sku); });
        return out;
      }
      const annonceDe = (r, sku) => (r.bl.lines || []).filter((l) => l.sku === sku).reduce((n, l) => n + l.qty, 0);
      const compteReel = (r, sku) => (r.colis || []).filter((c) => c.sku === sku).reduce((n, c) => n + c.qty, 0);
      const colisAbime = (r, sku) => (r.colis || []).some((c) => c.sku === sku && c.etat === 'abime');

      function preparerReception(r) {
        if (r.ctrl) return;
        r.ctrl = { lot: '', rows: {}, validated: false, at: null };
        refsReception(r).forEach((sku) => { r.ctrl.rows[sku] = { annonce: '', compte: '', etat: '', decision: '' }; });
      }
      const ligneRecRemplie = (x) => x.annonce !== '' && x.annonce != null && x.compte !== '' && x.compte != null
        && !!x.etat && !!x.decision;

      // « Annoncée » (ENT-1.1, 06/10/2026) : le camion n'est pas encore arrivé ; la réception se voit dans la
      // liste mais ne se saisit pas (`annoncee: true` dans la réception semée).
      function statutReception(r) {
        if (r.annoncee) return ['Annoncée', 'info'];
        if (!r.ctrl) return ['À contrôler', 'warn'];
        if (r.ctrl.validated) return ['Réceptionnée', 'ok'];
        const debut = r.ctrl.lot || Object.keys(r.ctrl.rows).some((k) => ligneRecRemplie(r.ctrl.rows[k])
          || r.ctrl.rows[k].annonce !== '' || r.ctrl.rows[k].compte !== '' || r.ctrl.rows[k].etat || r.ctrl.rows[k].decision);
        return debut ? ['En cours', 'info'] : ['À contrôler', 'warn'];
      }

      function vueReceptions() {
        const liste = (db.receptions || []).slice().sort((a, b) => b.ts - a.ts);
        const lignes = liste.map((r) => {
          const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '' };
          const s = statutReception(r);
          return `<tr><td class="mono">${ech(r.no)}</td><td>${fdate(r.ts)}</td><td>${ech(sup.brand)}</td>
            <td class="mono">${ech(r.bl.no)}</td><td class="num">${ech(r.colisLibelle || (r.colis || []).length)}</td>
            <td>${pastille(s[0], s[1])}</td>
            <td class="num">${r.annoncee ? '<span class="note" data-rec-annoncee>camion pas encore arrivé</span>'
              : `<button class="btn btn-s" data-ouvrir-rec="${ech(r.no)}">Ouvrir</button>`}</td></tr>`;
        }).join('');
        return `<div class="ent-tete"><h2>Réceptions</h2>
            <p class="note">Les livraisons annoncées par les fournisseurs et les colis reçus sur le quai.</p></div>
          <section class="panneau">${lignes
            ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th>
                <th>Bon de livraison</th><th class="num">Colis</th><th>Statut</th><th></th></tr></thead>
                <tbody>${lignes}</tbody></table></div>`
            : '<div class="vide">Aucune livraison attendue.</div>'}</section>`;
      }

      function vueReception() {
        const r = receptionDe(E.no);
        if (!r || r.annoncee) return vueReceptions();
        preparerReception(r);
        const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '', contact: '' };
        const s = statutReception(r), c = r.ctrl, fige = c.validated;
        const refs = refsReception(r);
        const complet = !!(c.lot || '').trim() && refs.every((sku) => ligneRecRemplie(c.rows[sku]));

        const choixEtat = [['', 'Choisir…'], ['ok', 'Conforme'], ['abime', 'Colis endommagé']];
        // « En litige (zone litiges) » (04/10/2026, ENT-5.5) : la marchandise est là, mais elle attend la
        // réponse du fournisseur ; elle n'entre pas en stock disponible. Seulement si la séance le déclare
        // (`receptionLitige: true`) : les autres séances gardent leurs trois décisions.
        const choixDecision = [['', 'Choisir…'], ['accepte', 'Accepté'], ['reserve', 'Accepté sous réserve'], ['refuse', 'Refusé'],
          ...(litige ? [['litige', 'En litige (zone litiges)']] : [])];

        const colis = (r.colis || []).map((k) => {
          const v = VM[k.sku];
          return `<tr><td class="num">${k.no}</td><td class="mono">${ech(k.sku)}</td>
            <td>${v ? ech(label(v)) : '<span class="faux">Référence inconnue</span>'}
              ${precision(v)}</td>
            <td class="num"><b>${k.qty}</b></td>
            <td>${k.etat === 'abime' ? pastille('Carton endommagé', 'crit') : pastille('Intact', 'ok')}</td></tr>`;
        }).join('');

        const lignes = refs.map((sku) => {
          const v = VM[sku], x = c.rows[sku];
          const champ = (nom, aide) => (fige ? `<b class="mono">${x[nom] === '' ? '—' : x[nom]}</b>`
            : `<input type="number" min="0" data-rec="${nom}" data-sku="${ech(sku)}" value="${x[nom] === '' ? '' : x[nom]}" style="width:78px" aria-label="${ech(aide)}">`);
          const select = (nom, choix, aide) => (fige
            ? `<span class="note">${ech((choix.find((o) => o[0] === x[nom]) || ['', '—'])[1])}</span>`
            : `<select data-rec="${nom}" data-sku="${ech(sku)}" aria-label="${ech(aide)}">
                ${choix.map((o) => `<option value="${o[0]}" ${(x[nom] || '') === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`);
          return `<tr><td class="mono">${ech(sku)}</td>
            <td>${v ? ech(label(v)) : '—'}${precision(v)}</td>
            <td class="num">${champ('annonce', 'Quantité annoncée pour ' + sku)}</td>
            <td class="num">${champ('compte', 'Quantité comptée pour ' + sku)}</td>
            <td>${select('etat', choixEtat, 'État des colis pour ' + sku)}</td>
            <td>${select('decision', choixDecision, 'Décision pour ' + sku)}</td></tr>`;
        }).join('');

        // L'encadré ne renvoie à la messagerie que si le bon de livraison y est arrivé (Spartoo) ;
        // ailleurs (Cdiscount) aucun bon n'y arrive, et l'élève l'y chercherait pour rien.
        const blParMessage = (db.mails || []).some((m) => m.kind === 'bl' && m.rec === r.no);
        // Réception SANS tableau des colis (ENT-1.1, 06/10/2026) : la vérité est sur la palette, au quai ; le
        // tableau la donnait. `colis` reste dans la base (comptes attendus, références du bon), seulement caché.
        // `consigneQuai` : l'encadré qui le remplace (HTML du contenu) ; `colisLibelle` : la colonne de la liste.
        const sansColis = r.colisVisibles === false;

        const cLot = fige ?`<b class="mono">${ech(c.lot || '—')}</b>`
          : `<input type="text" id="recLot" class="mono" value="${ech(c.lot)}" placeholder="ex. LOT-XX-0000" style="width:190px" aria-label="Numéro de lot">`;

        return `<button class="lien-accueil" data-vue2="receptions">← RÉCEPTIONS</button>
          <div class="ent-tete"><h2>Réception <span class="mono">${ech(r.no)}</span> ${pastille(s[0], s[1])}</h2></div>
          <section class="panneau"><dl class="ent-dl">
            <dt>Fournisseur</dt><dd>${ech(sup.brand)} — ${ech(sup.name)} <span class="mono note">${ech(r.supId)}</span></dd>
            <dt>Transporteur</dt><dd>${ech(r.transporteur || '—')}</dd>
            <dt>Bon de livraison</dt><dd class="mono">${ech(r.bl.no)}</dd>
            <dt>Arrivée sur le quai</dt><dd>${fdt(r.ts)}</dd></dl>
            ${sansColis ? `<div class="avis" data-rec-sans-colis>${r.consigneQuai || 'Les cartons ont été comptés au quai : reprends ta fiche de contrôle.'}</div></section>`
              : `<div class="avis">${blParMessage ? 'Le bon de livraison est dans votre messagerie : c\'est lui'
              : 'C\'est le bon de livraison'} qui donne les quantités annoncées et le numéro de lot. Les colis
              ci-dessous sont ce que le transporteur a réellement déposé.</div></section>
          <section class="panneau"><h3>Colis reçus sur le quai</h3>
            <p class="note">${(r.colis || []).length} colis. Additionnez-les par référence pour obtenir la quantité réellement reçue.</p>
            <div class="ent-scroll"><table><thead><tr><th class="num">Colis</th><th>Réf.</th><th>Article</th>
              <th class="num">Contenu</th><th>État du carton</th></tr></thead><tbody>${colis}</tbody></table></div></section>`}
          <section class="panneau"><h3>Bon de réception</h3>
            <p class="note">Reportez le numéro de lot du bon de livraison, puis, pour chaque référence,
              la quantité annoncée, la quantité que vous avez comptée, l'état des colis et votre décision.
              Une ligne refusée${litige ? ' ou en litige' : ''} n'entre pas en stock.</p>
            <div class="champ" style="max-width:260px"><label for="recLot">Numéro de lot</label>${cLot}</div>
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th><th class="num">Annoncé</th>
              <th class="num">Compté</th><th>État</th><th>Décision</th></tr></thead><tbody>${lignes}</tbody></table></div>
            ${fige ? `<div class="avis avis-ok">Réception validée le ${fdt(c.at)} : le stock a été augmenté
                  des quantités acceptées (voir Stock, Mouvements, ou <span class="mono">.getlot ${ech(c.lot)}</span>).</div>`
              : `<div class="rangee" style="margin-top:14px">
                  <button class="btn btn-p" data-valider-rec ${complet ? '' : 'disabled'}>Valider la réception (entrée en stock)</button>
                  <span class="note" id="aideRec" ${complet ? 'hidden' : ''}>Renseignez le numéro de lot et toutes les lignes pour continuer.</span>
                </div>`}
          </section>`;
      }

      function majChampRec(sku, champ, val) {
        const r = receptionDe(E.no); if (!r || !r.ctrl) return;
        const x = r.ctrl.rows[sku]; if (!x) return;
        if (champ === 'annonce' || champ === 'compte') { const n = parseInt(val, 10); x[champ] = isNaN(n) ? '' : Math.max(0, n); }
        else x[champ] = val;
        majBoutonRec();
        sauver();
      }

      // Même prudence que pour le bon de préparation : on ne redessine pas la vue pendant que
      // l'élève saisit, sinon la case qu'il vient de quitter disparaît sous ses doigts.
      function majBoutonRec() {
        const r = receptionDe(E.no); if (!r || !r.ctrl) return;
        const lot = hote.querySelector('#recLot');
        if (lot) r.ctrl.lot = lot.value;
        const complet = !!(r.ctrl.lot || '').trim()
          && refsReception(r).every((sku) => ligneRecRemplie(r.ctrl.rows[sku]));
        const b = hote.querySelector('[data-valider-rec]');
        if (b) b.disabled = !complet;
        const aide = hote.querySelector('#aideRec');
        if (aide) aide.hidden = complet;
      }

      let confirmeRec = false;
      function validerReception() {
        const r = receptionDe(E.no); if (!r || r.annoncee || !r.ctrl || r.ctrl.validated) return;
        majBoutonRec();
        const c = r.ctrl, lot = (c.lot || '').trim().toUpperCase();
        if (!lot) return toast('Le numéro de lot est obligatoire : il est sur le bon de livraison.');
        // Validation définitive : d'abord une confirmation qui rappelle le n° de réception ET le n° de BL — la
        // dernière chance de voir qu'on n'est pas sur sa réception (ENT-1.1 §7.11, 06/10/2026).
        if (!confirmeRec) {
          const refs = refsReception(r), rows = refs.map((sku) => c.rows[sku] || {});
          const entre = rows.filter((x) => x.decision === 'accepte' || x.decision === 'reserve').reduce((n, x) => n + (Number(x.compte) || 0), 0);
          confirmerDansLaPage(hote.querySelector('[data-valider-rec]'),
            `Tu valides la réception ${r.no} du BL ${r.bl.no} : ${refs.length} ligne${refs.length > 1 ? 's' : ''}, ${entre} ${unite(entre)} en stock. Après validation, tu ne pourras plus la modifier.`,
            () => { confirmeRec = true; validerReception(); }, { oui: 'Valider', non: 'Annuler' });
          return;
        }
        confirmeRec = false;
        let entrees = 0;
        refsReception(r).forEach((sku) => {
          const x = c.rows[sku];
          if (!VM[sku]) return;
          const q = x.decision === 'refuse' || x.decision === 'litige' ? 0 : (parseInt(x.compte, 10) || 0);
          if (q <= 0) return;
          db.stock[sku] = stockDe(sku) + q;
          mouvement(sku, 'Entrée : réception', q, r.no, lot);
          entrees += q;
        });
        c.lot = lot; c.validated = true; c.at = Date.now();
        sauver(); dessiner();
        toast(entrees
          ? `Réception validée : ${entrees} ${unite(entrees)} entrée${entrees > 1 ? 's' : ''} en stock.`
          : 'Réception validée : aucune entrée en stock.');
      }

  // Les livraisons à contrôler (menu et accueil).
  const aRecevoir = () => (db.receptions || []).filter((r) => !r.annoncee && (!r.ctrl || !r.ctrl.validated)).length;

  function brancher(z) {
    z.querySelectorAll('[data-rec]').forEach((el) => {
      const maj = () => majChampRec(el.dataset.sku, el.dataset.rec, el.value);
      el.addEventListener('input', maj);
      el.addEventListener('change', maj);
    });
    z.querySelector('#recLot')?.addEventListener('input', () => { majBoutonRec(); sauver(); });
    z.querySelector('[data-valider-rec]')?.addEventListener('click', validerReception);
  }

  return {
    vues: { receptions: vueReceptions, reception: vueReception },
    brancher,
    receptionDe, bonDeLivraison, aRecevoir,
  };
}
