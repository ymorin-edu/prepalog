// L'écran du BLOCAGE QUALITÉ : l'élève retire du stock les articles d'un lot mis en cause (n° de lot, référence, quantité, motif),
// sans toucher au reste du stock de la même référence ; la liste des blocages déjà faits est dessous.
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 9) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterBlocage({ db, E, hote, A, VM, VOCAB, B, sauver, dessinerVue })`. Il ne touche que les clés
// `E.blocage`, `E.erreurBlocage` et `E.okBlocage` de l'état d'écran, et écrit `db.stock` et `db.moves` par le socle (`B`).
// L'écran ne montre ni les références concernées ni ce qu'il en reste (c'est le travail de l'élève, avec `.getlot`) : les
// refus disent QUE le lot n'en a pas assez, jamais combien il en reste. Rend `{ vues: { blocage }, brancher(z) }`.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech, toast } from '../ui.js';
import { fdt } from './entreprise-outils.js';

export function monterBlocage({ db, E, hote, A, VM, VOCAB, B, sauver, dessinerVue }) {
  const { SIMPLE, unite, label, REF_EX } = A;
  const { stockDe, mouvement, resteDuLot } = B;

      // Un blocage qualité retire du stock les paires d'un lot précis, sans toucher au reste
      // du stock de la même référence. C'est ce que `.removestock` ne sait pas faire : il sort
      // au premier entré, premier sorti, donc sur l'ancien stock, pas sur le lot en cause.
      //
      // L'écran ne montre ni les références concernées ni ce qu'il en reste : c'est le travail
      // de l'élève de les trouver avec .getlot. Il contrôle, il ne répond pas.
      function vueBlocage() {
        const b = E.blocage;
        const faits = db.moves.filter((m) => m.type === 'Blocage qualité').slice().reverse();
        return `<div class="ent-tete"><h2>Blocage qualité</h2>
            <p class="note">Retirer du stock les articles d'un lot mis en cause, référence par référence.</p></div>
          <section class="panneau" style="max-width:620px">
            <div class="avis">Un blocage ne concerne qu'un lot : les ${ech(VOCAB.unitPl)} de la même référence
              entrées par une autre livraison restent vendables. Renseignez le lot, la référence
              complète et la quantité que vous voulez sortir. Le motif est enregistré avec le
              mouvement : c'est lui qui expliquera plus tard pourquoi ces ${ech(VOCAB.unitPl)} ont disparu.</div>
            ${E.erreurBlocage ? `<div class="avis avis-err">${ech(E.erreurBlocage)}</div>` : ''}
            ${E.okBlocage ? `<div class="avis avis-ok">${ech(E.okBlocage)}</div>` : ''}
            <form id="formBloc" autocomplete="off">
              <div class="ent-filtres">
                <div class="champ"><label for="blLot">Numéro de lot</label>
                  <input id="blLot" class="mono" value="${ech(b.lot)}" placeholder="ex. LOT-XX-0000"
                    autocapitalize="characters" spellcheck="false"></div>
                <div class="champ"><label for="blRef">Référence article</label>
                  <input id="blRef" class="mono" value="${ech(b.ref)}" placeholder="${REF_EX ? `ex. ${ech(REF_EX)}` : 'référence de l’article'}"
                    autocapitalize="characters" spellcheck="false"></div>
                <div class="champ"><label for="blQte">Quantité à bloquer</label>
                  <input id="blQte" type="number" min="1" step="1" value="${ech(b.qte)}" style="width:120px"></div>
              </div>
              <div class="champ"><label for="blMotif">Motif</label>
                <input id="blMotif" value="${ech(b.motif)}" placeholder="ex. blocage qualité, défaut fabricant"></div>
              <div class="rangee" style="margin-top:14px">
                <button class="btn btn-p" type="submit">Bloquer ces ${ech(VOCAB.unitPl)}</button></div>
            </form>
          </section>
          <section class="panneau"><h3>Blocages enregistrés</h3>
            ${faits.length
              ? `<div class="ent-scroll"><table><thead><tr><th>Date</th><th>Réf.</th><th>Article</th>
                  <th class="num">Qté</th><th>Lot</th><th>Motif</th></tr></thead><tbody>
                  ${faits.map((m) => { const v = VM[m.sku]; return `<tr><td>${fdt(m.ts)}</td>
                    <td class="mono">${ech(m.sku)}</td><td>${v ? ech(label(v)) : '—'}</td>
                    <td class="num faux"><b class="mono">${m.delta}</b></td>
                    <td class="mono">${ech(m.lot || '—')}</td><td>${ech(m.ref)}</td></tr>`; }).join('')}
                  </tbody></table></div>`
              : '<div class="vide">Aucun blocage enregistré.</div>'}</section>`;
      }

      function bloquerQualite() {
        const val = (id) => (hote.querySelector(id)?.value || '');
        const lot = val('#blLot').trim().toUpperCase();
        const ref = val('#blRef').trim().toUpperCase();
        const brut = val('#blQte').trim();
        const motif = val('#blMotif').trim();
        E.blocage = { lot, ref, qte: brut, motif };
        E.okBlocage = '';
        const refuser = (msg) => { E.erreurBlocage = msg; dessinerVue(); };

        if (!lot) return refuser('Renseignez le numéro de lot. Il est sur le bon de livraison.');
        if (!ref) return refuser('Renseignez la référence de l\'article à bloquer.');
        const v = VM[ref];
        if (!v) return refuser(`Référence article introuvable : ${ref}.${SIMPLE ? '' : ` Il faut la référence complète (modèle, couleur, ${VOCAB.configWord}).`}`);
        const q = parseInt(brut, 10);
        if (isNaN(q) || q <= 0 || String(q) !== brut) return refuser('La quantité doit être un nombre entier supérieur à zéro.');
        if (!motif) return refuser('Le motif est obligatoire : il reste dans l\'historique du mouvement.');
        // Le message ne dit jamais combien il reste : le contrôle est réel, mais l'élève va
        // chercher la réponse dans .getlot, il ne la lit pas ici.
        const reste = resteDuLot(ref, lot);
        if (!reste) return refuser(`Le lot ${lot} n'a aucune ${VOCAB.unit} de ${ref} en stock. Vérifiez le lot et la référence avec .getlot.`);
        if (q > reste) return refuser(`Le lot ${lot} ne contient pas autant de ${VOCAB.unitPl} de ${ref} en stock. Vérifiez ce qu'il en reste avec .getlot.`);

        db.stock[ref] = stockDe(ref) - q;
        mouvement(ref, 'Blocage qualité', -q, motif, lot);
        E.erreurBlocage = '';
        E.okBlocage = `${q} ${unite(q)} de ${ref} bloquée${q > 1 ? 's' : ''} sur le lot ${lot}.`;
        E.blocage = { lot, ref: '', qte: '', motif };
        sauver(); dessinerVue();
        toast('Blocage enregistré.');
      }

  return {
    vues: { blocage: vueBlocage },
    brancher(z) {
      z.querySelector('#formBloc')?.addEventListener('submit', (e) => { e.preventDefault(); bloquerQualite(); });
    },
  };
}
