// La FICHE À REMPLIR de l'environnement d'entreprise (04/10/2026, brief
// `docs/briefs/MOTEUR-documents-formulaire.md`, lot 2 ; maquette validée par Tristan, agencement B).
//
// Un écran de plus, qui n'existe que si la séance le déclare (alerte 13) :
//
//   creerEntreprise({ …, documents: […],
//     fiche: {
//       id: 'selection', libelle: 'Fiche de sélection',       // entrée du menu
//       titre: 'Fiche de sélection', sousTitre: 'Poste : cariste…',
//       documents: ['poste', 'yanis', …],                     // à gauche, en onglets (facultatif)
//       bouton: 'Ouvrir la fiche de sélection',               // le bouton du mail (`ouvreFiche: 'selection'`)
//       blocs: [
//         { type: 'ouinon', id: 'tri', titre: '1. Tableau de tri', consigne: '…',
//           lignes: [{ id: 'yanis', lib: 'Yanis Morel' }, …], colonnes: [{ id: 'caces', lib: 'CACES 3 valide le 9/12' }, …] },
//         { type: 'liste', id: 'candidat', titre: '2. Mon choix', lib: 'Je retiens', manque: 'le candidat',
//           choix: [{ v: 'yanis', lib: 'Yanis Morel' }, …] },
//         { type: 'choix', id: 'contrat', lib: 'Contrat proposé', manque: 'le contrat', choix: ['CDD', 'CDI'] },
//         { type: 'encadre', titre: 'CDD ou CDI ?', texte: '…' },
//         { type: 'cases', id: 'pieces', titre: '1. Pièces à demander', consigne: '…',
//           choix: [{ v: 'identite', lib: 'Pièce d’identité' }, …] },             // cocher plusieurs
//         { type: 'ordre', id: 'jour', titre: '2. Le premier jour', consigne: '…',
//           choix: [{ v: 'epi', lib: 'Remise des EPI' }, …] },                     // ordre de DÉPART, mélangé par le contenu
//       ],
//       envoi: { bouton: 'Envoyer la fiche à Sophie', a: 'Sophie', suite: 'Réponds-lui maintenant dans la Messagerie.' },
//     },
//   })
//
// Avec `documents`, ils s'affichent à gauche en onglets et restent à l'écran quand on descend dans la
// fiche ; la fiche est à droite. Quand la place manque, l'un sous l'autre. Sans `documents` : la fiche seule.
//
// RIEN N'EST JUGÉ AVANT L'ENVOI, rien n'est corrigé à l'écran (guidage compris) : le bilan de la séance dit
// à la fin quelles cases étaient fausses. L'envoi est refusé tant qu'il manque une réponse (la raison
// s'écrit sous le bouton, le travail est gardé) ; une fois envoyée, la fiche est FIGÉE (relue, plus
// modifiable). `manque` (facultatif) : ce que dit « Il manque : … » pour une liste ou un choix vide.
//
// État : `db.fiches[<fiche.id>] = { valeurs, envoye: { at } }` (cloisonné par séance : l'id est celui de
// la fiche de CETTE séance). `valeurs[bloc]` : pour `ouinon`, `{ ligne: { colonne: true | false } }` ;
// pour `liste` et `choix`, la valeur choisie ; pour `cases`, les valeurs cochées (dans l'ordre déclaré,
// `[]` si aucune) ; pour `ordre`, toutes les valeurs dans l'ordre de l'élève.
// Jalons : `ficheEnvoyee(db, 'selection')` → `{ envoye, valeurs, at }` ; les attendus restent dans la
// séance (calculés depuis ses données). Convention du repérage : une étape rend 'attente' tant que la fiche
// n'est pas envoyée. Déclencheur : `apresFiche('selection')` (core/declencheurs.js), vrai à l'envoi.
//
// Blocs : `ouinon`, `liste`, `choix`, `encadre` (lot 2, ENT-5.1) ; `cases` et `ordre` (lot 4, 05/10/2026,
// ENT-5.2). `texte`, `nombre`, `date`, `heure` viendront avec ENT-5.8.
//   - `cases` : une case à cocher par choix. Aucune case cochée est une réponse (rien ne « manque ») : c'est
//     à la séance de ne pas récompenser l'inaction (un jalon « rien de trop » exige au moins une case).
//   - `ordre` : les choix s'affichent dans l'ordre DÉCLARÉ, qui est l'ordre de départ ; le contenu le
//     mélange lui-même (le moteur ne connaît pas l'ordre juste et ne mélange rien : même départ pour tous,
//     jamais déjà juste). Flèches ↑ ↓ sur chaque ligne, sans redessin, le focus suit la ligne déplacée.
//     Rien ne « manque » : un ordre jamais touché part tel quel à l'envoi (et sera faux).

import { ech } from '../ui.js';

export function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {}, at: (f && f.envoye && f.envoye.at) || null };
}

const jourHeure = (t) => {
  const d = new Date(t), z = (n) => String(n).padStart(2, '0');
  return `${z(d.getDate())}/${z(d.getMonth() + 1)} à ${z(d.getHours())}:${z(d.getMinutes())}`;
};
const minus = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
const options = (choix) => (choix || []).map((c) => (typeof c === 'object' ? c : { v: c, lib: c }));
// L'ordre d'un bloc `ordre` : celui de l'élève s'il est complet, sinon l'ordre déclaré (le départ).
const ordreDe = (b, v) => {
  const O = options(b.choix), x = v && v[b.id];
  const complet = Array.isArray(x) && x.length === O.length && O.every((o) => x.includes(o.v));
  return complet ? x.map((id) => O.find((o) => o.v === id)) : O;
};

export function creerFiche(F, VDOC) {
  const blocs = F.blocs || [];
  const docs = VDOC ? VDOC.pieces(F.documents) : [];
  const envoi = F.envoi || {};
  const libelle = F.libelle || F.titre || 'Fiche';

  // Ce qui manque avant l'envoi, dans l'ordre de la fiche.
  function manque(e) {
    const v = e.valeurs || {}, L = [];
    blocs.forEach((b) => {
      if (b.type === 'ouinon') {
        let n = 0;
        (b.lignes || []).forEach((l) => (b.colonnes || []).forEach((c) => {
          const x = v[b.id] && v[b.id][l.id] && v[b.id][l.id][c.id];
          if (x !== true && x !== false) n++;
        }));
        if (n) L.push(b.manque ? b.manque.replace('{n}', n) : `${n} case${n > 1 ? 's' : ''} du tableau sans réponse`);
      } else if (b.type === 'liste' || b.type === 'choix') {
        if (v[b.id] == null || v[b.id] === '') L.push(b.manque || `« ${b.lib || b.titre || b.id} »`);
      }
    });
    return L;
  }

  function bloc(b, e) {
    const v = e.valeurs || {};
    const titre = b.titre && b.type !== 'encadre' ? `<h3 class="ent-fiche-h">${ech(b.titre)}</h3>` : '';
    const consigne = b.consigne ? `<p class="note">${ech(b.consigne)}</p>` : '';
    if (b.type === 'ouinon') {
      const lignes = (b.lignes || []).map((l) => `<tr><th scope="row">${ech(l.lib)}</th>${(b.colonnes || []).map((c) => {
        const x = v[b.id] && v[b.id][l.id] ? v[b.id][l.id][c.id] : undefined;
        const k = `${ech(b.id)}|${ech(l.id)}|${ech(c.id)}`;
        return `<td><span class="ent-ouinon" role="group" aria-label="${ech(l.lib)} — ${ech(c.lib)}">
          <button type="button" data-ouinon="${k}|1" aria-pressed="${x === true}">oui</button>
          <button type="button" data-ouinon="${k}|0" aria-pressed="${x === false}">non</button></span></td>`;
      }).join('')}</tr>`).join('');
      return `${titre}${consigne}<div class="ent-scroll"><table class="ent-tri">
        <thead><tr><th scope="col">${ech(b.entete || '')}</th>${(b.colonnes || []).map((c) => `<th scope="col">${ech(c.lib)}</th>`).join('')}</tr></thead>
        <tbody>${lignes}</tbody></table></div>`;
    }
    if (b.type === 'liste') {
      return `${titre}${consigne}<div class="champ"><label for="fi-${ech(b.id)}">${ech(b.lib || '')}</label>
        <select id="fi-${ech(b.id)}" data-fiche-champ="${ech(b.id)}">
          <option value="">${ech(b.vide || 'Choisir…')}</option>
          ${options(b.choix).map((o) => `<option value="${ech(o.v)}"${v[b.id] === o.v ? ' selected' : ''}>${ech(o.lib)}</option>`).join('')}
        </select></div>`;
    }
    if (b.type === 'choix') {
      return `${titre}${consigne}<div class="champ"><span class="ent-fiche-lib" id="fl-${ech(b.id)}">${ech(b.lib || '')}</span>
        <div class="ent-radios" role="radiogroup" aria-labelledby="fl-${ech(b.id)}">
          ${options(b.choix).map((o) => `<label><input type="radio" name="fi-${ech(b.id)}" value="${ech(o.v)}" data-fiche-champ="${ech(b.id)}"${
            v[b.id] === o.v ? ' checked' : ''}> ${ech(o.lib)}</label>`).join('')}
        </div></div>`;
    }
    if (b.type === 'cases') {
      const coches = Array.isArray(v[b.id]) ? v[b.id] : [];
      return `${titre}${consigne}<div class="ent-cases" role="group" aria-label="${ech(b.titre || b.lib || b.id)}">
        ${options(b.choix).map((o) => `<label><input type="checkbox" value="${ech(o.v)}" data-fiche-case="${ech(b.id)}"${
          coches.includes(o.v) ? ' checked' : ''}> <span>${ech(o.lib)}</span></label>`).join('')}
      </div>`;
    }
    if (b.type === 'ordre') {
      const L = ordreDe(b, v), n = L.length;
      return `${titre}${consigne}<ol class="ent-ordre" data-fiche-ordre="${ech(b.id)}" aria-label="${ech(b.titre || b.lib || b.id)}">
        ${L.map((o, k) => `<li data-v="${ech(o.v)}"><span class="ent-ordre-rang" aria-hidden="true">${k + 1}</span>
          <span class="ent-ordre-lib">${ech(o.lib)}</span><span class="ent-ordre-fleches">
          <button type="button" data-ordre-sens="-1" aria-label="Monter « ${ech(o.lib)} »"${k === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" data-ordre-sens="1" aria-label="Descendre « ${ech(o.lib)} »"${k === n - 1 ? ' disabled' : ''}>↓</button></span></li>`).join('')}
      </ol><p class="ent-ordre-annonce" aria-live="polite" data-ordre-annonce></p>`;
    }
    if (b.type === 'encadre') {
      return `<div class="ent-encadre">${b.titre ? `<b>${ech(b.titre)}</b>` : ''}${ech(b.texte || '').replace(/\n/g, '<br>')}</div>`;
    }
    return `<div class="avis avis-err">Bloc de fiche inconnu : « ${ech(b.type)} ».</div>`;
  }

  // Les onglets des documents (à gauche) et le document choisi.
  function onglets(ui, docVu) {
    const sel = docs.includes(ui.doc) ? ui.doc : docs[0];
    return `<div class="ent-onglets" role="tablist" aria-label="Documents">${docs.map((id) => {
      const d = VDOC.doc(id), on = id === sel;
      return `<button type="button" role="tab" id="fdo-${ech(id)}" data-fiche-doc="${ech(id)}" data-libre aria-selected="${on}"
        aria-controls="fichePanneauDoc" tabindex="${on ? 0 : -1}"${docVu(id) ? ' class="vu"' : ''}>${ech(d.court || d.titre)}</button>`;
    }).join('')}</div>
    <div class="ent-feuille" role="tabpanel" id="fichePanneauDoc" aria-labelledby="fdo-${ech(sel)}" data-fiche-panneau>${VDOC.feuille(sel)}</div>`;
  }

  function html(e, ui, api) {
    const fige = !!e.envoye || api.figee;
    const formulaire = `<form class="panneau ent-fiche-form" data-fiche="${ech(F.id)}" novalidate>
        <fieldset${fige ? ' disabled' : ''}>${blocs.map((b) => `<div class="ent-fiche-bloc">${bloc(b, e)}</div>`).join('')}</fieldset>
        ${e.envoye
          ? `<div class="ent-fiche-envoyee" data-fiche-envoyee tabindex="-1">Fiche envoyée${envoi.a ? ` à ${ech(envoi.a)}` : ''} le ${
            ech(jourHeure(e.envoye.at))}.${envoi.suite ? ' ' + ech(envoi.suite) : ''}
            <button type="button" class="lien-accueil" data-vue2="mail" data-libre>Ouvrir la Messagerie</button></div>`
          : (api.figee ? '' : `<button class="btn btn-p" type="submit" data-fiche-envoyer>${ech(envoi.bouton || 'Envoyer la fiche')}</button>
            <p class="ent-fiche-manque" data-fiche-manque role="alert">${ech(ui.manque || '')}</p>`)}
      </form>`;
    return `<div class="ent-tete"><h2>${ech(F.titre || libelle)}</h2>${F.sousTitre ? `<p class="note">${ech(F.sousTitre)}</p>` : ''}</div>
      <div class="ent-fiche${docs.length ? ' ent-fiche-cote' : ''}">
        ${docs.length ? `<div class="ent-fiche-docs">${onglets(ui, api.docVu)}</div>` : ''}
        <div class="ent-fiche-droite">${formulaire}</div>
      </div>`;
  }

  // Aucun redessin pendant le remplissage : le focus et la place dans la page restent où ils sont.
  function brancher(z, e, ui, api) {
    if (!e.valeurs) e.valeurs = {};
    const ecrit = () => { if (ui.manque) { ui.manque = ''; const m = z.querySelector('[data-fiche-manque]'); if (m) m.textContent = ''; } api.sauver(); };
    z.querySelectorAll('[data-ouinon]').forEach((btn) => btn.addEventListener('click', () => {
      if (e.envoye || api.figee) return;
      const [b, l, c, o] = btn.dataset.ouinon.split('|');
      const t = e.valeurs[b] || (e.valeurs[b] = {});
      (t[l] || (t[l] = {}))[c] = o === '1';
      btn.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
      ecrit();
    }));
    z.querySelectorAll('[data-fiche-champ]').forEach((el) => el.addEventListener('change', () => {
      if (e.envoye || api.figee) return;
      if (el.type === 'radio' && !el.checked) return;
      e.valeurs[el.dataset.ficheChamp] = el.value === '' ? null : el.value;
      ecrit();
    }));
    // Cases à cocher : la liste des cochées, dans l'ordre déclaré.
    z.querySelectorAll('[data-fiche-case]').forEach((el) => el.addEventListener('change', () => {
      if (e.envoye || api.figee) return;
      const id = el.dataset.ficheCase;
      e.valeurs[id] = [...z.querySelectorAll('[data-fiche-case]')].filter((x) => x.dataset.ficheCase === id && x.checked).map((x) => x.value);
      ecrit();
    }));
    // Remise en ordre : la ligne change de place dans la page (pas de redessin), le focus la suit.
    z.querySelectorAll('[data-ordre-sens]').forEach((btn) => btn.addEventListener('click', () => {
      if (e.envoye || api.figee) return;
      const li = btn.closest('li'), ol = li.parentElement, sens = Number(btn.dataset.ordreSens);
      const voisin = sens < 0 ? li.previousElementSibling : li.nextElementSibling;
      if (!voisin) return;
      if (sens < 0) ol.insertBefore(li, voisin); else ol.insertBefore(voisin, li);
      const L = [...ol.children];
      L.forEach((x, k) => {
        x.querySelector('.ent-ordre-rang').textContent = k + 1;
        x.querySelector('[data-ordre-sens="-1"]').disabled = k === 0;
        x.querySelector('[data-ordre-sens="1"]').disabled = k === L.length - 1;
      });
      e.valeurs[ol.dataset.ficheOrdre] = L.map((x) => x.dataset.v);
      const k = L.indexOf(li);
      (btn.disabled ? li.querySelector(`[data-ordre-sens="${-sens}"]`) : btn).focus();
      const annonce = ol.nextElementSibling;
      if (annonce) annonce.textContent = `${li.querySelector('.ent-ordre-lib').textContent} : position ${k + 1} sur ${L.length}.`;
      ecrit();
    }));
    z.querySelector('[data-fiche]')?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (e.envoye || api.figee) return;
      const m = manque(e);
      if (m.length) {
        ui.manque = `Il manque : ${m.join(', ')}.`;
        z.querySelector('[data-fiche-manque]').textContent = ui.manque;
        return;
      }
      ui.manque = '';
      // Un ordre jamais touché part tel quel (celui de départ) ; des cases jamais cochées, vides.
      blocs.filter((b) => b.type === 'ordre').forEach((b) => { e.valeurs[b.id] = ordreDe(b, e.valeurs).map((o) => o.v); });
      blocs.filter((b) => b.type === 'cases' && !Array.isArray(e.valeurs[b.id])).forEach((b) => { e.valeurs[b.id] = []; });
      e.envoye = { at: Date.now() };
      api.envoyee();
      z.querySelector('[data-fiche-envoyee]')?.focus({ preventScroll: true });
    });
    // Les onglets : seul le document change (la fiche ne bouge pas) ; flèches gauche / droite au clavier.
    const tabs = [...z.querySelectorAll('[data-fiche-doc]')];
    const choisir = (btn, clavier) => {
      const id = btn.dataset.ficheDoc;
      if (id !== ui.doc || !btn.classList.contains('vu')) api.compterDoc(id);
      ui.doc = id;
      tabs.forEach((t) => { const on = t === btn; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (api.docVu(t.dataset.ficheDoc)) t.classList.add('vu'); });
      const p = z.querySelector('[data-fiche-panneau]');
      p.innerHTML = VDOC.feuille(id); p.setAttribute('aria-labelledby', btn.id);
      if (clavier) btn.focus();
    };
    tabs.forEach((btn, k) => {
      btn.addEventListener('click', () => choisir(btn, false));
      btn.addEventListener('keydown', (ev) => {
        const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        ev.preventDefault();
        choisir(tabs[(k + d + tabs.length) % tabs.length], true);
      });
    });
  }

  return {
    id: F.id, docs, nav: { libelle },
    bouton: F.bouton || `Ouvrir la ${minus(libelle)}`,
    etatNeuf: () => ({ valeurs: {} }),
    manque, html, brancher,
  };
}
