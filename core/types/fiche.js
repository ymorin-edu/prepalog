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
// ENT-5.2) ; `texte`, `nombre`, `date`, `heure` et `cadre` (lot 4, 05/10/2026, ENT-5.8).
//   - `choix` avec `colonne: true` (ENT-1.1, 06/10/2026) : les réponses l'une sous l'autre (réponses longues d'un QCM).
//   - `cases` : une case à cocher par choix. Aucune case cochée est une réponse (rien ne « manque ») : c'est
//     à la séance de ne pas récompenser l'inaction (un jalon « rien de trop » exige au moins une case).
//   - `ordre` : les choix s'affichent dans l'ordre DÉCLARÉ, qui est l'ordre de départ ; le contenu le
//     mélange lui-même (le moteur ne connaît pas l'ordre juste et ne mélange rien : même départ pour tous,
//     jamais déjà juste). Flèches ↑ ↓ sur chaque ligne, sans redessin, le focus suit la ligne déplacée.
//     Rien ne « manque » : un ordre jamais touché part tel quel à l'envoi (et sera faux).
//   - Les SAISIES (ENT-5.8) : `{ type: 'nombre', id, lib, unite: 'kg', manque }`, `{ type: 'heure', … }` (HH:MM),
//     `{ type: 'date', … }` (calendrier du navigateur, rangée 'AAAA-MM-JJ'), `{ type: 'texte', … }` ; `texte` peut
//     porter `valeur` et `fige: true` (case préremplie, non modifiable : un numéro de document). Rangées TELLES QUE
//     TAPÉES, sans redessin ; les jalons les lisent avec `lireNombre` (« 6 091 », « 6091 », « 2,5 ») et
//     `lireHeure` (« 11:00 », « 11h00 », « 11 h ») ci-dessous. Une saisie vide « manque ». Entrée dans une case ne
//     part jamais (seul le bouton envoie).
// GESTES (questions au fil, lot 3, 08/10/2026) : `fiche:<id>:<bloc>` quand l'élève remplit un bloc (choisir, cocher,
// remettre en ordre ; une saisie à la sortie de la case, jamais pendant la frappe), `fiche:<id>:<bloc>:<ligne>` quand il
// classe une ligne d'un tableau oui / non (« il classe le CV de Yanis »), `fiche:<id>:envoyer` à l'envoi. Liste :
// `signaux` de la vue. Condition : `apresGeste('fiche:bon:remplacement')` (core/declencheurs.js).
//   - `cadre` : `{ type: 'cadre', titre: '1. Expéditeur', large: true, blocs: [...] }` encadre ses blocs, comme les
//     cases numérotées d'un document. `grille: true` sur la fiche les pose sur deux colonnes (un cadre `large`
//     prend toute la ligne). La fiche peut aussi porter `entete` (HTML du contenu : titre du document, numéro…)
//     et `pied` (texte : « Document pédagogique, reconstitution, non contractuel »).
//
// Envoi incomplet (ENT-5.8) : `envoi: { incomplet: true }` laisse partir la fiche avec des cases vides, comme
// une vraie lettre mal remplie (c'est alors à un jalon de la séance de dire « incomplète »). Sans l'option,
// l'envoi est refusé tant qu'il manque une réponse.
//
// Plusieurs fiches dans une séance (ENT-5.8) : `creerEntreprise({ …, fiches: [F1, F2] })` (ou `fiche` + `fiches`).
// Une entrée de menu par fiche ; la première garde l'écran `fiche`, les autres `fiche:<id>`. Une fiche qui porte
// `quand(db)` n'apparaît (menu, bouton du mail) qu'une fois la condition vraie : un écran qui attend un message.
//
// FONCTION DE LA BASE (chantier D-1 bis, 09/10/2026, brief ENT-6.1 §7.3) : `blocs` et `documents` peuvent être des
// fonctions `(db) => …` de la base de l'élève, pour une fiche TIRÉE par élève (ses cases, ses lignes : `TIRAGE.piecesTirees`).
// La fonction est appelée À CHAQUE DESSIN (et à l'envoi), jamais rangée dans la base : elle ne doit rien écrire. Contrôle
// au chargement : elle est appelée une fois sur une base VIDE (`{}`) ; si elle plante ou ne rend pas un tableau, la séance
// ne se charge pas (message qui nomme la fiche). Les gestes publiés par blocs (`fiche:<id>:<bloc>`) sont ceux de ce dessin
// sur base vide, plus `fiche:<id>:envoyer`. Au dessin, une fonction qui plante est signalée (console, comme un jalon) et
// la fiche affiche un avis d'erreur à la place, sans casser l'écran. Valeurs fixes : rien ne change.

import { ech, confirmerDansLaPage } from '../ui.js';

// Une saisie de nombre, telle que tapée → un nombre, ou NaN. Espaces (milliers), virgule décimale.
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
// Une saisie d'heure → minutes depuis minuit, ou NaN. « 11:00 », « 11h00 », « 11 h ».
export function lireHeure(s) {
  const m = String(s == null ? '' : s).trim().toLowerCase().match(/^(\d{1,2})\s*(?:[:h]\s*(\d{2})?)?$/);
  if (!m) return NaN;
  const h = Number(m[1]), mn = m[2] ? Number(m[2]) : 0;
  return h < 24 && mn < 60 ? h * 60 + mn : NaN;
}

export function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {}, at: (f && f.envoye && f.envoye.at) || null };
}

const jourHeure = (t) => {
  const d = new Date(t), z = (n) => String(n).padStart(2, '0');
  return `${z(d.getDate())}/${z(d.getMonth() + 1)} à ${z(d.getHours())}:${z(d.getMinutes())}`;
};
const SAISIES = ['texte', 'nombre', 'date', 'heure'];
// Les blocs d'une fiche à plat (ceux d'un cadre compris), dans l'ordre de la fiche.
const aPlat = (L) => (L || []).flatMap((b) => (b.type === 'cadre' ? aPlat(b.blocs) : [b]));
const minus = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
const options = (choix) => (choix || []).map((c) => (typeof c === 'object' ? c : { v: c, lib: c }));
// L'ordre d'un bloc `ordre` : celui de l'élève s'il est complet, sinon l'ordre déclaré (le départ).
const ordreDe = (b, v) => {
  const O = options(b.choix), x = v && v[b.id];
  const complet = Array.isArray(x) && x.length === O.length && O.every((o) => x.includes(o.v));
  return complet ? x.map((id) => O.find((o) => o.v === id)) : O;
};

// Un champ « fonction de la base » d'une fiche, évalué et contrôlé : il rend un tableau (sinon une erreur qui le dit).
function evaluerChamp(F, champ, db) {
  const x = F[champ];
  if (typeof x !== 'function') return x;
  const r = x(db);
  if (r != null && !Array.isArray(r)) throw new Error(`« ${champ}(db) » rend ${typeof r} au lieu d’un tableau`);
  return r || [];
}

export function creerFiche(F, VDOC, { signaler } = {}) {
  // Contrôle au chargement : une fonction de la base est essayée sur une base vide.
  ['blocs', 'documents'].forEach((champ) => {
    if (typeof F[champ] !== 'function') return;
    try { evaluerChamp(F, champ, {}); } catch (x) {
      throw new Error(`fiche « ${F.id} » : « ${champ}(db) » ne marche pas sur une base vide : ${x && x.message ? x.message : x}`);
    }
  });
  const blocsFixes = typeof F.blocs === 'function' ? null : aPlat(F.blocs);
  const docsFixes = typeof F.documents === 'function' ? null : (VDOC ? VDOC.pieces(F.documents) : []);
  // Les blocs (tels que déclarés, et à plat) et les documents de CETTE base ; `null` si la fonction plante au dessin.
  function blocsBrutsDe(db) {
    if (blocsFixes) return F.blocs;
    try { return evaluerChamp(F, 'blocs', db || {}); } catch (x) { if (signaler) signaler(`la fiche « ${F.id} » ne se dessine pas`, x); return null; }
  }
  const blocsDe = (db) => (blocsFixes || aPlat(blocsBrutsDe(db) || []));
  function docsDe(db) {
    if (docsFixes) return docsFixes;
    try { return VDOC ? VDOC.pieces(evaluerChamp(F, 'documents', db || {})) : []; } catch (x) {
      if (signaler) signaler(`les documents de la fiche « ${F.id} » ne se dessinent pas`, x);
      return [];
    }
  }
  const blocs = blocsDe({});
  const envoi = F.envoi || {};
  const libelle = F.libelle || F.titre || 'Fiche';

  // Ce qui manque avant l'envoi, dans l'ordre de la fiche (`db` : la base, pour une fiche fonction de la base).
  function manque(e, db) {
    const blocs = blocsDe(db);
    const v = e.valeurs || {}, L = [];
    blocs.forEach((b) => {
      if (b.type === 'ouinon') {
        let n = 0;
        (b.lignes || []).forEach((l) => (b.colonnes || []).forEach((c) => {
          const x = v[b.id] && v[b.id][l.id] && v[b.id][l.id][c.id];
          if (x !== true && x !== false) n++;
        }));
        if (n) L.push(b.manque ? b.manque.replace('{n}', n) : `${n} case${n > 1 ? 's' : ''} du tableau sans réponse`);
      } else if (b.type === 'liste' || b.type === 'choix' || (SAISIES.includes(b.type) && !b.fige)) {
        if (v[b.id] == null || String(v[b.id]).trim() === '') L.push(b.manque || `« ${b.lib || b.titre || b.id} »`);
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
        <div class="ent-radios${b.colonne ? ' ent-radios-colonne' : ''}" role="radiogroup" aria-labelledby="fl-${ech(b.id)}">
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
    if (SAISIES.includes(b.type)) {
      const val = b.fige ? (b.valeur == null ? '' : b.valeur) : (v[b.id] == null ? '' : v[b.id]);
      const attrs = {
        texte: 'type="text"',
        nombre: 'type="text" inputmode="decimal" autocomplete="off"',
        heure: 'type="text" inputmode="numeric" autocomplete="off" placeholder="HH:MM" maxlength="5"',
        date: 'type="date"',
      }[b.type];
      return `${titre}${consigne}<div class="champ ent-saisie ent-saisie-${b.type}"><label for="fi-${ech(b.id)}">${ech(b.lib || '')}</label>
        <span class="ent-saisie-case"><input id="fi-${ech(b.id)}" ${attrs} value="${ech(val)}"${b.fige ? ' readonly' : ` data-fiche-saisie="${ech(b.id)}"`}>${
          b.unite ? `<span class="ent-saisie-unite">${ech(b.unite)}</span>` : ''}</span></div>`;
    }
    if (b.type === 'cadre') {
      return `<section class="ent-cadre" aria-label="${ech(b.titre || '')}">${b.titre ? `<h3 class="ent-cadre-t">${ech(b.titre)}</h3>` : ''}${consigne}${
        (b.blocs || []).map((x) => `<div class="ent-cadre-bloc">${bloc(x, e)}</div>`).join('')}</section>`;
    }
    if (b.type === 'encadre') {
      return `<div class="ent-encadre">${b.titre ? `<b>${ech(b.titre)}</b>` : ''}${ech(b.texte || '').replace(/\n/g, '<br>')}</div>`;
    }
    return `<div class="avis avis-err">Bloc de fiche inconnu : « ${ech(b.type)} ».</div>`;
  }

  // Les onglets des documents (à gauche) et le document choisi.
  function onglets(ui, docVu, docs, db) {
    const sel = docs.includes(ui.doc) ? ui.doc : docs[0];
    return `<div class="ent-onglets" role="tablist" aria-label="Documents">${docs.map((id) => {
      const d = VDOC.doc(id), on = id === sel;
      return `<button type="button" role="tab" id="fdo-${ech(id)}" data-fiche-doc="${ech(id)}" data-libre aria-selected="${on}"
        aria-controls="fichePanneauDoc" tabindex="${on ? 0 : -1}"${docVu(id) ? ' class="vu"' : ''}>${ech(d.court || d.titre)}</button>`;
    }).join('')}</div>
    <div class="ent-feuille" role="tabpanel" id="fichePanneauDoc" aria-labelledby="fdo-${ech(sel)}" data-fiche-panneau>${VDOC.feuille(sel, db)}</div>`;
  }

  // `api.db` : la base de l'élève (une fiche ou des documents fonction de la base la lisent à chaque dessin).
  function html(e, ui, api) {
    const fige = !!e.envoye || api.figee;
    const brut = blocsBrutsDe(api.db);
    const docs = docsDe(api.db);
    const formulaire = `<form class="panneau ent-fiche-form${F.grille ? ' ent-fiche-grille' : ''}" data-fiche="${ech(F.id)}" novalidate>
        <fieldset${fige ? ' disabled' : ''}>${F.entete ? `<div class="ent-fiche-entete">${F.entete}</div>` : ''}<div class="ent-fiche-blocs">${
          brut ? (brut || []).map((b) => `<div class="ent-fiche-bloc${b.type === 'cadre' && b.large ? ' large' : ''}">${bloc(b, e)}</div>`).join('')
            : '<div class="avis avis-err" data-fiche-erreur>Cette fiche ne s’affiche pas (erreur de la séance) : signale-le à ton professeur.</div>'}</div>${
          F.pied ? `<p class="ent-fiche-pied">${ech(F.pied)}</p>` : ''}</fieldset>
        ${e.envoye
          ? `<div class="ent-fiche-envoyee" data-fiche-envoyee tabindex="-1">Fiche envoyée${envoi.a ? ` à ${ech(envoi.a)}` : ''} le ${
            ech(jourHeure(e.envoye.at))}.${envoi.suite ? ' ' + ech(envoi.suite) : ''}
            <button type="button" class="lien-accueil" data-vue2="mail" data-libre>Ouvrir la Messagerie</button></div>`
          : (api.figee ? '' : `<button class="btn btn-p" type="submit" data-fiche-envoyer>${ech(envoi.bouton || 'Envoyer la fiche')}</button>
            <p class="ent-fiche-manque" data-fiche-manque role="alert">${ech(ui.manque || '')}</p>`)}
      </form>`;
    return `<div class="ent-tete"><h2>${ech(F.titre || libelle)}</h2>${F.sousTitre ? `<p class="note">${ech(F.sousTitre)}</p>` : ''}</div>
      <div class="ent-fiche${docs.length ? ' ent-fiche-cote' : ''}">
        ${docs.length ? `<div class="ent-fiche-docs">${onglets(ui, api.docVu, docs, api.db)}</div>` : ''}
        <div class="ent-fiche-droite">${formulaire}</div>
      </div>`;
  }

  // Aucun redessin pendant le remplissage : le focus et la place dans la page restent où ils sont.
  function brancher(z, e, ui, api) {
    if (!e.valeurs) e.valeurs = {};
    const sig = (n) => { if (api.signal) api.signal(`fiche:${F.id}:${n}`); };
    const ecrit = () => { if (ui.manque) { ui.manque = ''; const m = z.querySelector('[data-fiche-manque]'); if (m) m.textContent = ''; } api.sauver(); };
    z.querySelectorAll('[data-ouinon]').forEach((btn) => btn.addEventListener('click', () => {
      if (e.envoye || api.figee) return;
      const [b, l, c, o] = btn.dataset.ouinon.split('|');
      const t = e.valeurs[b] || (e.valeurs[b] = {});
      (t[l] || (t[l] = {}))[c] = o === '1';
      btn.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
      sig(b); sig(`${b}:${l}`);
      ecrit();
    }));
    z.querySelectorAll('[data-fiche-champ]').forEach((el) => el.addEventListener('change', () => {
      if (e.envoye || api.figee) return;
      if (el.type === 'radio' && !el.checked) return;
      e.valeurs[el.dataset.ficheChamp] = el.value === '' ? null : el.value;
      sig(el.dataset.ficheChamp);
      ecrit();
    }));
    // Les saisies : rangées telles que tapées, à chaque touche (rien n'est perdu si l'élève change d'écran).
    z.querySelectorAll('[data-fiche-saisie]').forEach((el) => el.addEventListener('input', () => {
      if (e.envoye || api.figee) return;
      e.valeurs[el.dataset.ficheSaisie] = el.value === '' ? null : el.value;
      ecrit();
    }));
    // Le geste d'une saisie : à la sortie de la case (une question ne tombe jamais au milieu d'un mot).
    z.querySelectorAll('[data-fiche-saisie]').forEach((el) => el.addEventListener('change', () => {
      if (e.envoye || api.figee || el.value === '') return;
      sig(el.dataset.ficheSaisie); api.sauver();
    }));
    // Entrée dans une case ne fait pas partir la fiche (un envoi incomplet serait possible) : seul le bouton envoie.
    z.querySelector('[data-fiche]')?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') ev.preventDefault();
    });
    // Cases à cocher : la liste des cochées, dans l'ordre déclaré.
    z.querySelectorAll('[data-fiche-case]').forEach((el) => el.addEventListener('change', () => {
      if (e.envoye || api.figee) return;
      const id = el.dataset.ficheCase;
      e.valeurs[id] = [...z.querySelectorAll('[data-fiche-case]')].filter((x) => x.dataset.ficheCase === id && x.checked).map((x) => x.value);
      sig(id);
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
      sig(ol.dataset.ficheOrdre);
      ecrit();
    }));
    z.querySelector('[data-fiche]')?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (e.envoye || api.figee) return;
      // Une fiche fonction de la base qui ne se dessine pas ne part pas (l'élève a l'avis d'erreur à l'écran).
      if (!blocsFixes && !blocsBrutsDe(api.db)) return;
      const blocs = blocsDe(api.db);
      const m = envoi.incomplet ? [] : manque(e, api.db);
      if (m.length) {
        ui.manque = `Il manque : ${m.join(', ')}.`;
        z.querySelector('[data-fiche-manque]').textContent = ui.manque;
        return;
      }
      ui.manque = '';
      // Envoi définitif : d'abord une confirmation dans la page (06/10/2026, Smoby C2).
      if (!ui.confirme) {
        confirmerDansLaPage(z.querySelector('[data-fiche-envoyer]'), e.envois
          ? `Tu renvoies ta fiche corrigée${envoi.a ? ` à ${envoi.a}` : ''} ?`
          : `Tu envoies ta fiche${envoi.a ? ` à ${envoi.a}` : ''} ? Tu ne pourras plus la modifier.`,
          () => { ui.confirme = true; z.querySelector('[data-fiche]').requestSubmit(); });
        return;
      }
      ui.confirme = false;
      // Un ordre jamais touché part tel quel (celui de départ) ; des cases jamais cochées, vides.
      blocs.filter((b) => b.type === 'ordre').forEach((b) => { e.valeurs[b.id] = ordreDe(b, e.valeurs).map((o) => o.v); });
      blocs.filter((b) => b.type === 'cases' && !Array.isArray(e.valeurs[b.id])).forEach((b) => { e.valeurs[b.id] = []; });
      // Une case préremplie part avec sa valeur ; une saisie laissée vide part vide (`null`).
      blocs.filter((b) => SAISIES.includes(b.type)).forEach((b) => {
        const x = e.valeurs[b.id];
        e.valeurs[b.id] = b.fige ? (b.valeur == null ? null : String(b.valeur)) : (x == null || String(x).trim() === '' ? null : x);
      });
      e.envoye = { at: Date.now() };
      // Le nombre d'envois (une fiche rouverte pour correction se renvoie : lot A, 07/10/2026).
      e.envois = (e.envois || 0) + 1;
      sig('envoyer');
      api.envoyee({ id: F.id, envois: e.envois });
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
      p.innerHTML = VDOC.feuille(id, api.db); p.setAttribute('aria-labelledby', btn.id);
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
    id: F.id, docs: docsFixes || docsDe({}), nav: { libelle }, quand: F.quand || null,
    bouton: F.bouton || `Ouvrir la ${minus(libelle)}`,
    etatNeuf: () => ({ valeurs: {} }),
    manque, html, brancher,
    // Les gestes que la fiche sait dire (voir l'en-tête).
    signaux: [`fiche:${F.id}:envoyer`, ...blocs.filter((b) => b.id && b.type !== 'encadre' && b.type !== 'cadre').flatMap((b) => [
      `fiche:${F.id}:${b.id}`, ...(b.type === 'ouinon' ? (b.lignes || []).map((l) => `fiche:${F.id}:${b.id}:${l.id}`) : [])])],
  };
}
