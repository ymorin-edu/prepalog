// L'écran des CLIENTS et des FOURNISSEURS : deux listes avec un champ de recherche (code, nom, ville…), qui regroupent ceux de la
// séance et ceux que l'élève a créés à la console (`.addclient`, `.addsupplier`).
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 6) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterTiers({ E, hote, VOCAB, B })`, `B` étant le socle de la base (`entreprise-base.js`).
// Il ne touche que la clé `E.vue` de l'état d'écran. Rend `{ vues: { clients, fournisseurs }, brancher(z), apres(z) }` :
// `vues` entre telle quelle dans la table de `dessinerVue`, `brancher` n'écoute le champ `[data-filtre]` QUE sur ces deux écrans
// (le catalogue et le stock ont le leur), `apres` remplit la liste juste après le dessin.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech } from '../ui.js';
import { eur, fdate, norm } from './entreprise-outils.js';

export function monterTiers({ E, hote, VOCAB, B }) {
  const { tousClients, tousFournisseurs } = B;

      function vueClients() {
        return `<div class="ent-tete"><h2>Clients</h2>
            <p class="note">${tousClients().length} clients référencés.</p></div>
          <div class="ent-filtres"><div class="champ"><label for="tQ">Recherche</label>
            <input id="tQ" data-filtre placeholder="Nom, ville, code…"></div></div>
          <div id="entListe"></div>`;
      }

      function vueFournisseurs() {
        return `<div class="ent-tete"><h2>Fournisseurs</h2>
            <p class="note">${tousFournisseurs().length} fournisseurs référencés.</p></div>
          <div class="ent-filtres"><div class="champ"><label for="tQ">Recherche</label>
            <input id="tQ" data-filtre placeholder="Marque, société, ville, code…"></div></div>
          <div id="entListe"></div>`;
      }

      function majTiers() {
        const champ = hote.querySelector('#tQ');
        if (!champ) return;
        const q = norm(champ.value);
        let h;
        if (E.vue === 'clients') {
          const r = tousClients().filter((c) => !q || norm(`${c.id} ${c.prenom} ${c.nom} ${c.ville} ${c.cp} ${c.email}`).includes(q));
          h = `<table><thead><tr><th>Code</th><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Adresse</th>
            <th>Client depuis</th><th class="num">Commandes</th></tr></thead><tbody>
            ${r.map((c) => `<tr><td class="mono">${ech(c.id)}</td><td>${ech(c.prenom + ' ' + c.nom)}</td>
              <td class="mono">${ech(c.email)}</td><td class="mono">${ech(c.tel)}</td>
              <td>${ech(c.adr)}, ${ech(c.cp)} ${ech(c.ville)}</td><td>${fdate(c.since)}</td>
              <td class="num">${c.nb}</td></tr>`).join('')}</tbody></table>`;
        } else {
          const f = tousFournisseurs().filter((s2) => !q || norm(`${s2.id} ${s2.brand} ${s2.name} ${s2.ville}`).includes(q));
          h = `<table><thead><tr><th>Code</th><th>Marque</th><th>Société</th><th>Contact</th><th>Téléphone</th>
            <th>E-mail</th><th>Adresse</th><th class="num">Délai</th><th class="num">Franco</th>
            <th class="num">Mini. commande</th><th>Paiement</th></tr></thead><tbody>
            ${f.map((s2) => `<tr><td class="mono">${ech(s2.id)}</td><td><b>${ech(s2.brand)}</b></td><td>${ech(s2.name)}</td>
              <td>${ech(s2.contact)}</td><td class="mono">${ech(s2.tel)}</td><td class="mono">${ech(s2.email)}</td>
              <td>${ech(s2.adr)}, ${ech(s2.cp)} ${ech(s2.ville)}</td><td class="num">${s2.delai} j</td>
              <td class="num">${eur(s2.franco)}</td><td class="num">${s2.moq || '—'} ${ech(VOCAB.unitPl)}</td>
              <td>${ech(s2.pay)}</td></tr>`).join('')}</tbody></table>`;
        }
        hote.querySelector('#entListe').innerHTML = `<section class="panneau"><div class="ent-scroll">${h}</div></section>`;
      }

  const surTiers = () => E.vue === 'clients' || E.vue === 'fournisseurs';
  return {
    vues: { clients: vueClients, fournisseurs: vueFournisseurs },
    brancher(z) {
      if (!surTiers()) return;
      z.querySelectorAll('[data-filtre]').forEach((el) => el.addEventListener('input', () => majTiers()));
    },
    apres() { if (surTiers()) majTiers(); },
  };
}
