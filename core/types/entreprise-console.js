// La CONSOLE : l'écran où l'élève interroge et modifie sa base avec des commandes (`.help`, `.getstock`, `.getorder`, `.addclient`,
// `.setstock`…), l'historique des 40 dernières, et le refus des commandes qui montrent le stock pendant un comptage à l'aveugle.
//
// Extrait de `core/types/entreprise.js` le 09/10/2026 (chantier 9, lot 9c, module 12) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterConsole({ db, E, hote, A, MODELS, MM, VM, VARIANTS, VOCAB, CUSTOMERS, SUPPLIERS, SUP_BY_ID, B, COM,
// inventaireBloque, sauver, aller, dessinerVue })`, `A` étant les aides « articles », `B` le socle de la base, `COM` les commandes.
// Il ne touche que la clé `E.console` (l'historique, initialisé dans `E` par le cœur, et remplacé par `.clear`) et `E.vue`.
// Rend `{ vues: { console }, brancher(z), apres(z) }` : `vues` entre telle quelle dans la table de `dessinerVue`, `brancher` écoute le
// formulaire `#formCmd`, `apres` fait défiler la sortie jusqu'en bas juste après le dessin. `executer` remet le focus sur `#champCmd`.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech } from '../ui.js';
import { eur, fdate, fdt, norm, pad } from './entreprise-outils.js';

export function monterConsole({ db, E, hote, A, MODELS, MM, VM, VARIANTS, VOCAB, CUSTOMERS, SUPPLIERS, SUP_BY_ID, B, COM,
  inventaireBloque, sauver, aller, dessinerVue }) {
  const { SIMPLE, unite, label, nomCouleur, precisionTexte, pastilleStock, REF_EX, MODELE_EX } = A;
  const { stockDe, mouvement, sortirFifo, tousClients, tousFournisseurs, clientDe, codeSuivant } = B;
  const { statutCommande, totaux, livraisonDe } = COM;

      function vueConsole() {
        const out = E.console.slice(-40).map((c) => `<div>${c.cmd != null ? `<div class="ent-cmd">${ech(c.cmd)}</div>` : ''}
          <div class="ent-cres">${c.html}</div></div>`).join('');
        return `<div class="ent-tete"><h2>Console</h2>
            <p class="note">Interrogez et modifiez votre base avec des commandes. Tapez <span class="mono">.help</span> pour les voir.</p></div>
          <div class="ent-console"><div class="ent-cout">${out}</div>
            <form class="ent-cin" id="formCmd" autocomplete="off"><span>&gt;</span>
              <input id="champCmd" placeholder=".getstock REF" spellcheck="false" aria-label="Commande">
              <button class="btn btn-p btn-s" type="submit">Exécuter</button></form></div>`;
      }

      const kv = (paires) => `<div class="ent-kv">${paires.map((p) => `<span>${p[0]}</span><span>${p[1]}</span>`).join('')}</div>`;
      const tbl = (entetes, lignes, droite) => `<div class="ent-scroll"><table><thead><tr>
        ${entetes.map((h, i) => `<th${droite && droite.includes(i) ? ' class="num"' : ''}>${h}</th>`).join('')}</tr></thead>
        <tbody>${lignes.map((r) => `<tr>${r.map((c, i) => `<td${droite && droite.includes(i) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

      function resoudre(brut) {
        const ref = String(brut || '').toUpperCase().trim();
        if (!ref) throw new Error(`Il manque la référence. Exemple : .getstock ${REF_EX || 'REF'}`);
        if (VM[ref]) return { v: VM[ref] };
        if (MM[ref]) return { m: MM[ref] };
        const part = VARIANTS.filter((v) => v.sku.indexOf(ref) === 0);
        if (part.length && part.length <= 60) return { liste: part };
        throw new Error(`Référence introuvable : ${ech(ref)}. Essayez .find suivi d'un nom de modèle.`);
      }
      const stockModele = (m) => { let n = 0; m.colors.forEach((c) => m.sizes.forEach((s) => { n += stockDe(`${m.ref}-${c}-${s}`); })); return n; };

      function ajuster(genre, a) {
        const ref = String(a[0] || '').toUpperCase(), q = parseInt(a[1], 10);
        const nom = genre === 'set' ? 'setstock' : genre === 'add' ? 'addstock' : 'removestock';
        // Tout ce qui suit la quantité est le motif : « casse », « blocage qualité »… Il est
        // enregistré avec le mouvement, sans quoi l'historique dirait qu'une paire a disparu
        // sans dire pourquoi.
        const motif = a.slice(2).join(' ').trim();
        if (!ref || a[1] === undefined || isNaN(q) || q < 0 || String(q) !== String(a[1]).trim()) {
          throw new Error(`Syntaxe : .${nom} <réf article> <quantité entière positive>${genre === 'rem' ? ' [motif]' : ''}`);
        }
        const v = VM[ref];
        if (!v) throw new Error(`Référence article introuvable : ${ech(ref)}.${SIMPLE ? '' : ' Il faut la référence complète (modèle-couleur-taille).'}`);
        const avant = stockDe(v.sku);
        const apres = genre === 'set' ? q : (genre === 'add' ? avant + q : avant - q);
        if (apres < 0) throw new Error(`Stock insuffisant : ${avant} ${unite(avant)} disponible${avant > 1 ? 's' : ''}, impossible d'en retirer ${q}.`);
        if (genre === 'rem') {
          // Une sortie retire des lots dans l'ordre d'entrée : la trace reste juste.
          sortirFifo(v.sku, q, motif ? 'Sortie : ' + motif : 'Sortie', motif || 'Console');
        } else {
          db.stock[v.sku] = apres;
          mouvement(v.sku, genre === 'set' ? 'Ajustement inventaire' : 'Entrée', apres - avant, motif || 'Console');
        }
        sauver();
        return `<span class="juste">OK</span> ${ech(v.sku)} : ${avant} → <b>${apres}</b>`
          + (motif ? ` <span class="note">(${ech(motif)})</span>` : '');
      }

      const CMDS = {
        help: ['.help', 'Affiche cette aide', () => {
          const lignes = Object.keys(CMDS).filter((k) => k !== 'help')
            .map((k) => [`<span class="mono">${ech(CMDS[k][0])}</span>`, ech(CMDS[k][1])]);
          const exemple = SIMPLE
            ? `Référence article : ${ech(VARIANTS[0] ? VARIANTS[0].sku : 'REF')}.`
            : `Référence modèle : ${ech(MODELE_EX)}. Référence article : ${ech(REF_EX)} (modèle, couleur, ${ech(VOCAB.configWord)}).`;
          return `<div class="note">Les références ne tiennent pas compte des majuscules. ${exemple}</div>${tbl(['Commande', 'Effet'], lignes)}`;
        }],
        find: ['.find <texte>', 'Cherche un modèle par nom, marque ou catégorie', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error(`Exemple : .find ${MODELS.length ? String(MODELS[0].brand || MODELS[0].name).split(' ')[0].toLowerCase() : '<nom ou marque>'}`);
          const r = MODELS.filter((m) => norm(`${m.brand} ${m.name} ${m.ref} ${m.cat}`).includes(q));
          if (!r.length) throw new Error(`Aucun modèle trouvé pour « ${ech(q)} ».`);
          return tbl(['Réf. modèle', 'Modèle', 'Catégorie', 'Prix TTC'],
            r.map((m) => [`<span class="mono">${ech(m.ref)}</span>`, ech(m.brand + ' ' + m.name), ech(m.cat), eur(m.price)]), [3]);
        }],
        getstock: ['.getstock <réf>', "Stock d'une référence article ou d'un modèle", (a) => {
          const r = resoudre(a[0]);
          if (r.v) { const v = r.v, q = stockDe(v.sku);
            return kv([['Référence', `<span class="mono">${ech(v.sku)}</span>`], ['Article', ech(label(v))],
              ...(SIMPLE ? [] : [['Couleur', ech(nomCouleur(v.color))], [ech(VOCAB.sizeLabel), v.size]]),
              ['Stock', `<b>${q}</b> ${ech(unite(q))}`], ['Seuil', v.model.min], ['Stock maximum', v.model.max],
              ['Emplacement', ech(v.loc)], ['Statut', pastilleStock(q, v.model.min)]]); }
          if (r.liste) return tbl(['Référence', 'Article', 'Stock', 'Statut'], r.liste.map((v) => { const q = stockDe(v.sku);
            return [`<span class="mono">${ech(v.sku)}</span>`, ech(label(v) + precisionTexte(v)),
              `<b>${q}</b>`, pastilleStock(q, v.model.min)]; }), [2]);
          // Modèle entier : une ligne par référence complète, la référence en premier —
          // c'est elle que l'élève doit recopier dans son bon de préparation.
          const m = r.m, tot = stockModele(m);
          const lignes = [];
          m.colors.forEach((c) => m.sizes.forEach((t) => {
            const sku = `${m.ref}-${c}-${t}`, q = stockDe(sku);
            lignes.push([`<span class="mono">${ech(sku)}</span>`, ech(nomCouleur(c)),
              t, `<span class="mono">${ech(m.loc[c])}</span>`, `<b>${q}</b>`, pastilleStock(q, m.min)]);
          }));
          return `<div>${ech(m.brand + ' ' + m.name)} : <b>${tot}</b> ${ech(unite(tot))} au total, `
            + `${lignes.length} références</div>`
            + tbl(['Référence', 'Couleur', ech(VOCAB.sizeLabel), 'Emplacement', 'Stock', 'Statut'], lignes, [2, 4]);
        }],
        getprice: ['.getprice <réf>', "Prix de vente et prix d'achat", (a) => {
          const r = resoudre(a[0]), m = r.v ? r.v.model : (r.m || (r.liste && r.liste[0].model)), ht = m.price / 1.2;
          return kv([[SIMPLE ? 'Article' : 'Modèle', `${ech([m.brand, m.name].filter(Boolean).join(' '))} <span class="note">(${ech(m.ref)})</span>`],
            ['Prix TTC', `<b>${eur(m.price)}</b>`], ['Prix HT', eur(ht)], ["Prix d'achat HT", eur(m.cost)],
            ['Marge brute', `${eur(ht - m.cost)} (${Math.round((ht - m.cost) / ht * 100)} %)`]]);
        }],
        getproduct: ['.getproduct <réf>', 'Fiche produit résumée', (a) => {
          const r = resoudre(a[0]), m = r.v ? r.v.model : (r.m || (r.liste && r.liste[0].model)), sp = SUP_BY_ID[m.sup];
          return kv([[SIMPLE ? 'Article' : 'Modèle', ech([m.brand, m.name].filter(Boolean).join(' '))], ['Référence', `<span class="mono">${ech(m.ref)}</span>`],
            ['Catégorie', ech(m.cat)],
            ...(SIMPLE ? [['Emplacement', `<span class="mono">${ech(m.emplacement)}</span>`]]
              : [['Couleurs', m.colors.map((c) => `${ech(nomCouleur(c))} (${c})`).join(', ')],
                [ech(VOCAB.sizeLabel) + 's', `${m.s0} à ${m.s1}`]]),
            ['Prix TTC', eur(m.price)],
            ['Fournisseur', sp ? `${ech(sp.brand)} <span class="note">(${ech(sp.id)}, délai ${sp.delai} j)</span>` : '—'],
            ['Description', ech(m.desc)]]);
        }],
        getlocation: ['.getlocation <réf>', 'Emplacement en entrepôt', (a) => {
          const r = resoudre(a[0]);
          // Un catalogue simple donne son emplacement tel quel : il n'a ni zone ni allée calculées.
          if (r.v) return kv([['Référence', `<span class="mono">${ech(r.v.sku)}</span>`], ['Emplacement', `<b>${ech(r.v.loc)}</b>`],
            ...(SIMPLE ? [] : [['Lecture', `Zone ${ech(r.v.model.zone)}, allée ${pad(r.v.model.aisle, 2)}, niveau ${ech(r.v.loc.split('-')[2])}`]])]);
          const m = r.m || r.liste[0].model;
          return tbl(['Couleur', 'Emplacement'], m.colors.map((c) => [ech(nomCouleur(c)), `<b>${ech(m.loc[c])}</b>`]));
        }],
        lowstock: ['.lowstock [n]', 'Références dont le stock est inférieur ou égal à n (par défaut : le seuil)', (a) => {
          const n = a[0] !== undefined ? parseInt(a[0], 10) : null;
          if (a[0] !== undefined && isNaN(n)) throw new Error('n doit être un nombre. Exemple : .lowstock 3');
          const r = VARIANTS.filter((v) => { const q = stockDe(v.sku); return n === null ? q <= v.model.min : q <= n; })
            .sort((x, y) => stockDe(x.sku) - stockDe(y.sku));
          return `<div>${r.length} référence${r.length > 1 ? 's' : ''}${r.length > 40 ? ' (les 40 plus basses)' : ''}</div>`
            + tbl(['Référence', 'Article', 'Stock', 'Statut'], r.slice(0, 40).map((v) => { const q = stockDe(v.sku);
              return [`<span class="mono">${ech(v.sku)}</span>`, ech(label(v) + precisionTexte(v)),
                `<b>${q}</b>`, pastilleStock(q, v.model.min)]; }), [2]);
        }],
        stockvalue: ['.stockvalue [marque]', "Valeur du stock au prix d'achat HT", (a) => {
          const b = norm(a.join(' ')); let val = 0, n = 0;
          VARIANTS.forEach((v) => { if (b && norm(v.model.brand) !== b) return; const q = stockDe(v.sku); val += q * v.model.cost; n += q; });
          if (b && !n && !MODELS.some((m) => norm(m.brand) === b)) throw new Error(`Marque inconnue : ${ech(a.join(' '))}`);
          return kv([['Périmètre', b ? ech(a.join(' ')) : 'Tout le stock'],
            [VOCAB.unitPl.charAt(0).toUpperCase() + VOCAB.unitPl.slice(1), n], ['Valeur achat HT', `<b>${eur(val)}</b>`]]);
        }],
        getclient: ['.getclient <code ou nom>', 'Fiche client', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error(CUSTOMERS.length ? `Exemple : .getclient ${CUSTOMERS[0].id} ou .getclient ${String(CUSTOMERS[0].nom || '').toLowerCase()}` : 'Exemple : .getclient <code ou nom>');
          const r = tousClients().filter((c) => norm(`${c.id} ${c.prenom} ${c.nom}`).includes(q)).slice(0, 10);
          if (!r.length) throw new Error('Aucun client trouvé.');
          return r.length === 1
            ? kv([['Code', ech(r[0].id)], ['Nom', ech(r[0].prenom + ' ' + r[0].nom)], ['E-mail', ech(r[0].email)],
                ['Téléphone', ech(r[0].tel)], ['Adresse', `${ech(r[0].adr)}, ${ech(r[0].cp)} ${ech(r[0].ville)}`],
                ['Client depuis', fdate(r[0].since)], ['Commandes', r[0].nb]])
            : tbl(['Code', 'Nom', 'Ville'], r.map((c) => [ech(c.id), ech(c.prenom + ' ' + c.nom), ech(c.ville)]));
        }],
        getsupplier: ['.getsupplier <code ou marque>', 'Fiche fournisseur', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error(SUPPLIERS.length ? `Exemple : .getsupplier ${String(SUPPLIERS[0].brand || SUPPLIERS[0].name || '').split(' ')[0].toLowerCase()} ou .getsupplier ${SUPPLIERS[0].id}` : 'Exemple : .getsupplier <code ou nom>');
          const r = tousFournisseurs().filter((s) => norm(`${s.id} ${s.brand} ${s.name}`).includes(q));
          if (!r.length) throw new Error('Aucun fournisseur trouvé.');
          return r.map((s) => kv([['Code', ech(s.id)], ['Marque', ech(s.brand)], ['Société', ech(s.name)],
            ['Contact', `${ech(s.contact)} · ${ech(s.tel)}`], ['E-mail', ech(s.email)],
            ['Adresse', `${ech(s.adr)}, ${ech(s.cp)} ${ech(s.ville)}`], ['Délai', `${s.delai} jours`],
            ['Franco', eur(s.franco)], ['Minimum de commande', `${s.moq || '—'} ${ech(VOCAB.unitPl)}`],
            ['Paiement', ech(s.pay)]])).join('<hr class="ent-hr">');
        }],
        addclient: ['.addclient <prénom nom> ; <e-mail> ; <téléphone> ; <adresse> ; <code postal> ; <ville>', 'Crée un nouveau client', (a) => {
          const p = a.join(' ').split(';').map((x) => x.trim());
          if (p.length < 6 || p.some((x) => !x)) throw new Error('Syntaxe : .addclient <prénom nom> ; <e-mail> ; <téléphone> ; <adresse> ; <code postal> ; <ville>');
          const nm = p[0].split(/\s+/).filter(Boolean);
          if (nm.length < 2) throw new Error('Indiquez le prénom et le nom, séparés par un espace, avant le premier « ; ».');
          if (!/^[0-9]{5}$/.test(p[4])) throw new Error('Le code postal doit comporter 5 chiffres.');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p[1])) throw new Error(`E-mail invalide : ${ech(p[1])}`);
          if (!db.customers) db.customers = [];
          const id = codeSuivant(tousClients(), 'C', 4);
          db.customers.push({ id, prenom: nm[0], nom: nm.slice(1).join(' '), email: p[1], tel: p[2], adr: p[3], cp: p[4], ville: p[5], since: Date.now(), nb: 0 });
          sauver();
          return `<div class="avis avis-ok">Nouveau client créé.</div>${kv([['Code', `<b>${ech(id)}</b>`], ['Nom', ech(p[0])], ['E-mail', ech(p[1])]])}`;
        }],
        addsupplier: ['.addsupplier <marque> ; <société> ; <contact> ; <téléphone> ; <e-mail> ; <adresse> ; <cp> ; <ville> ; <délai j.> ; <franco €> ; <paiement>', 'Crée un nouveau fournisseur', (a) => {
          const p = a.join(' ').split(';').map((x) => x.trim());
          if (p.length < 11 || p.some((x) => !x)) throw new Error('Syntaxe : .addsupplier <marque> ; <société> ; <contact> ; <téléphone> ; <e-mail> ; <adresse> ; <cp> ; <ville> ; <délai en jours> ; <franco en €> ; <conditions de paiement>');
          const delai = parseInt(p[8], 10), franco = parseFloat(p[9].replace(',', '.'));
          if (!/^[0-9]{5}$/.test(p[6])) throw new Error('Le code postal doit comporter 5 chiffres.');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p[4])) throw new Error(`E-mail invalide : ${ech(p[4])}`);
          if (isNaN(delai) || delai < 0) throw new Error('Le délai doit être un nombre de jours (ex. 5).');
          if (isNaN(franco) || franco < 0) throw new Error('Le franco de port doit être un montant en euros (ex. 900).');
          if (!db.suppliers) db.suppliers = [];
          const id = codeSuivant(tousFournisseurs(), 'F', 3);
          db.suppliers.push({ id, brand: p[0], name: p[1], contact: p[2], tel: p[3], email: p[4], adr: p[5], cp: p[6], ville: p[7], delai, franco, pay: p[10], moq: 16 });
          sauver();
          return `<div class="avis avis-ok">Nouveau fournisseur créé.</div>${kv([['Code', `<b>${ech(id)}</b>`], ['Marque', ech(p[0])], ['Société', ech(p[1])]])}`;
        }],
        getorder: ['.getorder <n°>', "Détail d'une commande enregistrée", (a) => {
          const q = String(a[0] || '').toUpperCase(); if (!q) throw new Error('Exemple : .getorder <numéro de commande>');
          const o = db.orders.find((x) => x.no.includes(q));
          if (!o) throw new Error('Commande non enregistrée. Ouvrez le mail de commande et cliquez sur « Enregistrer la commande ».');
          const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o);
          return kv([['Commande', ech(o.no)], ['Client', `${ech(c.prenom + ' ' + c.nom)} (${ech(c.id)})`],
            ['Livraison', ech(livraisonDe(o)[0])], ['Total TTC', eur(t.total)], ['Statut', ech(s[0])]])
            + tbl(['Référence', 'Article', 'Qté'], o.lines.map((l) => [`<span class="mono">${ech(l.sku)}</span>`,
              ech(label(VM[l.sku]) + precisionTexte(VM[l.sku])), l.qty]), [2]);
        }],
        movements: ['.movements [réf]', 'Derniers mouvements de stock', (a) => {
          const ref = a[0] ? String(a[0]).toUpperCase() : null;
          const r = db.moves.filter((m) => !ref || m.sku.indexOf(ref) === 0).slice(-15).reverse();
          if (!r.length) return '<span class="note">Aucun mouvement.</span>';
          return tbl(['Date', 'Référence', 'Type', 'Qté', 'Stock après', 'Lot', 'Origine'],
            r.map((m) => [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type),
              (m.delta > 0 ? '+' : '') + m.delta, m.after,
              m.lot ? `<span class="mono">${ech(m.lot)}</span>` : '<span class="note">—</span>',
              `<span class="mono">${ech(m.ref)}</span>`]), [3, 4]);
        }],
        getlot: ['.getlot <n° de lot>', "Remonter un lot : ce qui est entré, ce qui est sorti, et où c'est parti", (a) => {
          const lot = String(a[0] || '').toUpperCase().trim();
          if (!lot) throw new Error('Exemple : .getlot <numéro de lot>');
          const mv = db.moves.filter((m) => String(m.lot || '').toUpperCase() === lot);
          if (!mv.length) throw new Error(`Aucun mouvement pour le lot ${ech(lot)}. Vérifiez le numéro sur le bon de livraison.`);
          const entrees = mv.filter((m) => m.delta > 0), sorties = mv.filter((m) => m.delta < 0);
          const somme = (l) => l.reduce((n, m) => n + Math.abs(m.delta), 0);
          const reste = somme(entrees) - somme(sorties);
          // Une sortie de préparation porte le numéro du bon (BP-xxxxxx) : on remonte de là à
          // la commande, donc au client. C'est tout l'intérêt d'avoir gardé l'origine.
          const ligneSortie = (m) => {
            const o = db.orders.find((x) => 'BP-' + x.no.replace('CMD-', '') === m.ref);
            const c = o ? clientDe(o.customerId) : null;
            return [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type), Math.abs(m.delta),
              `<span class="mono">${ech(m.ref)}</span>`,
              o ? `<span class="mono">${ech(o.no)}</span>` : '<span class="note">—</span>',
              c ? `${ech(c.prenom + ' ' + c.nom)} <span class="mono note">${ech(c.id)}</span>` : '<span class="note">—</span>'];
          };
          const sup = entrees.length ? (() => { const v = VM[entrees[0].sku];
            return v ? (SUP_BY_ID[v.model.sup] || null) : null; })() : null;
          return kv([['Lot', `<b class="mono">${ech(lot)}</b>`],
            ['Fournisseur', sup ? `${ech(sup.brand)} <span class="note">(${ech(sup.id)})</span>` : '<span class="note">inconnu</span>'],
            ['Entré le', entrees.length ? fdt(entrees[0].ts) : '—'],
            ['Réception', entrees.length ? `<span class="mono">${ech(entrees[0].ref)}</span>` : '—'],
            ['Entrées', `<b>${somme(entrees)}</b> ${ech(unite(somme(entrees)))}`],
            ['Sorties', `<b>${somme(sorties)}</b> ${ech(unite(somme(sorties)))}`],
            ['Reste en stock', `<b>${reste}</b> ${ech(unite(reste))}`]])
            + `<div class="ent-lbl" style="margin-top:12px">Entrées</div>`
            + tbl(['Date', 'Référence', 'Type', 'Qté', 'Origine'],
              entrees.map((m) => [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type), m.delta,
                `<span class="mono">${ech(m.ref)}</span>`]), [3])
            + `<div class="ent-lbl" style="margin-top:12px">Sorties</div>`
            + (sorties.length
              ? tbl(['Date', 'Référence', 'Type', 'Qté', 'Document', 'Commande', 'Client'], sorties.map(ligneSortie), [3])
              : '<span class="note">Aucune sortie : tout le lot est encore en stock.</span>');
        }],
        setstock: ['.setstock <réf> <qté>', "Fixe le stock d'un article (inventaire)", (a) => ajuster('set', a)],
        addstock: ['.addstock <réf> <qté>', 'Ajoute du stock (réception)', (a) => ajuster('add', a)],
        removestock: ['.removestock <réf> <qté>', 'Retire du stock (sortie, casse)', (a) => ajuster('rem', a)],
        clear: ['.clear', 'Vide la console', () => { E.console = []; return null; }],
      };

      // Les commandes qui donnent (ou font voir) le stock du système : bloquées pendant un
      // comptage à l'aveugle. Les ajustements aussi — `.setstock` affiche « avant → après ».
      const CMDS_STOCK = ['getstock', 'lowstock', 'stockvalue', 'movements', 'getlot', 'setstock', 'addstock', 'removestock'];

      function executer(texte) {
        texte = String(texte || '').trim(); if (!texte) return;
        let res;
        if (texte.charAt(0) !== '.') res = '<span class="faux">Une commande commence par un point. Tapez .help pour la liste.</span>';
        else {
          const parts = texte.slice(1).split(/\s+/), nom = parts[0].toLowerCase(), c = CMDS[nom];
          if (!c) res = `<span class="faux">Commande inconnue : .${ech(nom)}. Tapez .help.</span>`;
          else if (CMDS_STOCK.includes(nom) && inventaireBloque()) {
            res = `<span class="faux">Inventaire en cours : le stock du système est masqué jusqu'à la validation du comptage.</span>`;
          }
          else { try { res = c[2](parts.slice(1)); } catch (e) { res = `<span class="faux">${ech(e.message)}</span>`; } }
        }
        if (res === null) E.console = []; else E.console.push({ cmd: texte, html: res });
        if (E.vue !== 'console') aller('console'); else dessinerVue();
        const i = hote.querySelector('#champCmd'); if (i) i.focus();
      }

  return {
    vues: { console: vueConsole },
    brancher(z) {
      z.querySelector('#formCmd')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const i = z.querySelector('#champCmd'), t = i.value; i.value = ''; executer(t);
      });
    },
    apres(z) {
      if (E.vue === 'console') { const o = z.querySelector('.ent-cout'); if (o) o.scrollTop = o.scrollHeight; }
    },
  };
}
