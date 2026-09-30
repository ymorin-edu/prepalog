// Briques d'interface partagées.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export function ech(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function toast(msg, ms = 2600) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.style.display = 'none'; }, ms);
}

export function entete({ marque, institution, profil, onDeconnexion }) {
  const qui = profil
    ? `${ech(profil.prenom || '')} ${ech(profil.nom || '')} · ${profil.role === 'prof' ? 'enseignant' : 'élève'}`
    : '';
  return `
  <header class="entete">
    <span class="marque">${ech(marque)}</span>
    <span class="institution">${ech(institution)}</span>
    <span class="pousse rangee">
      ${profil ? `<span class="qui">${qui}</span>
      <button class="btn btn-s" id="btnDeco">Se déconnecter</button>` : ''}
    </span>
  </header>`;
}

export function brancherDeconnexion(fn) {
  const b = document.getElementById('btnDeco');
  if (b) b.addEventListener('click', fn);
}

export function confirmer(msg) { return window.confirm(msg); }

// Formulaire générique à partir d'une description de champs.
export function champsHTML(champs, valeurs = {}) {
  return champs.map((c) => {
    const v = valeurs[c.cle] ?? '';
    const id = 'ch_' + c.cle;
    let saisie;
    if (c.type === 'select') {
      saisie = `<select id="${id}" data-cle="${ech(c.cle)}">
        <option value="">—</option>
        ${(c.options || []).map((o) => `<option ${String(v) === String(o) ? 'selected' : ''}>${ech(o)}</option>`).join('')}
      </select>`;
    } else if (c.type === 'textarea') {
      saisie = `<textarea id="${id}" data-cle="${ech(c.cle)}" rows="3">${ech(v)}</textarea>`;
    } else {
      saisie = `<input id="${id}" data-cle="${ech(c.cle)}" type="${c.type === 'number' ? 'number' : 'text'}"
        value="${ech(v)}" placeholder="${ech(c.placeholder || '')}" ${c.pas ? `step="${c.pas}"` : ''}>`;
    }
    return `<div class="champ"><label for="${id}">${ech(c.label)}${c.requis ? ' *' : ''}</label>${saisie}</div>`;
  }).join('');
}

export function lireChamps(hote) {
  const o = {};
  $$('[data-cle]', hote).forEach((e) => {
    o[e.dataset.cle] = e.type === 'number' ? (e.value === '' ? '' : Number(e.value)) : e.value.trim();
  });
  return o;
}
