// Briques d'interface partagées.

import { majLogos, basculerTheme, ICONE_THEME } from './theme.js';
import { ech, pad2 } from './texte.js';
import { auClavier, secondClic, memoriserFocus, retrouverFocus, garderFocus } from './gestes.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// `ech` et `pad2` vivent dans `texte.js` (sans accès au navigateur : les corrigés s'en servent hors
// navigateur) ; on les ré-exporte ici pour que les imports existants ne bougent pas.
export { ech, pad2 };
// Les deux gestes partagés des vues (confirmation en deux clics, focus clavier conservé) : voir `gestes.js`.
export { auClavier, secondClic, memoriserFocus, retrouverFocus, garderFocus };

export function toast(msg, ms = 2600) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.style.display = 'none'; }, ms);
}

// Traduit une erreur de service en phrase utile. Le code brut reste affiché à côté par
// l'appelant : c'est lui qui permet de chercher, la phrase n'est là que pour ne jamais
// laisser l'utilisateur devant un écran muet.
export function messageErreur(e) {
  const code = String((e && e.code) || '').toLowerCase();
  const msg = String((e && e.message) || '');
  if (code.includes('permission-denied') || /insufficient permissions/i.test(msg)) {
    return "Le service a refusé l'accès aux données. Les règles de sécurité ne sont peut-être pas publiées, ou votre profil n'existe pas encore dans la base.";
  }
  if (code.includes('unauthorized-domain')) {
    return "Ce domaine n'est pas autorisé dans la console Firebase (Authentication, onglet Paramètres, Domaines autorisés).";
  }
  if (code.includes('popup')) {
    return "La fenêtre de connexion Google a été bloquée ou fermée avant la fin. Autorisez les fenêtres surgissantes pour ce site, puis réessayez.";
  }
  if (code.includes('api-key') || code.includes('invalid-argument') || code.startsWith('app/')) {
    return "La configuration Firebase du site semble incorrecte : vérifiez prepalog-config.json.";
  }
  if (code.includes('unavailable') || code.includes('network') || /offline|network|failed to fetch/i.test(msg)) {
    return "Le service de données est injoignable. Vérifiez la connexion du poste : un filtrage réseau peut bloquer l'accès à Firebase.";
  }
  return msg || 'Erreur inconnue.';
}

// Le logo du bandeau ne suit pas le thème : c'est un tracé blanc sur fond
// transparent, posé sur l'aplat vert, identique en clair et en sombre.
//
// Le bouton de thème n'est rendu que pour l'enseignant. Décision du 01/10/2026 :
// les élèves ne choisissent pas leur thème. Attention, cela ne force PAS le clair
// chez eux — un poste réglé en sombre au niveau du système affichera toujours
// Prepalog en sombre, puisque le thème 'auto' suit prefers-color-scheme. Pour
// l'imposer, il faudrait appliquerTheme('clair') à la connexion d'un élève.
//
// Le logo porte déjà son nom en tracés : aucune marque écrite à côté. Prepalog
// complet sur tous les écrans (04/10/2026) ; logo: 'simulog' à l'intérieur de la
// rubrique Simulog seulement (pas à l'accueil, pas dans les séances immersives,
// qui ont leur propre bandeau).
export function entete({ marque, institution, profil, grand, logo }) {
  const estProf = !!profil && profil.role === 'prof';
  const qui = profil
    ? `${ech(profil.prenom || '')} ${ech(profil.nom || '')} · ${profil.role === 'prof' ? 'enseignant' : 'élève'}`
    : '';
  const [fichier, nom] = logo === 'simulog'
    ? ['simulog-logo-bandeau.svg', 'Simulog']
    : ['prepalog-logo-bandeau.svg', 'Prepalog'];
  return `
  <header class="entete${grand ? ' entete-accueil' : ''}">
    <img class="logo logo-complet" src="./styles/${fichier}" alt="${nom}">
    <span class="institution">${ech(institution)}</span>
    <span class="pousse rangee">
      ${profil ? `<span class="qui">${qui}</span>` : ''}
      ${estProf ? `<button class="btn-theme" id="btnTheme" type="button"
        title="Changer de thème" aria-label="Changer de thème">${ICONE_THEME}</button>` : ''}
      ${profil ? `<button class="btn btn-s" id="btnDeco">Se déconnecter</button>` : ''}
    </span>
  </header>`;
}

// À appeler après chaque rendu qui contient l'en-tête.
export function brancherEntete(onDeconnexion) {
  const t = document.getElementById('btnTheme');
  if (t) t.addEventListener('click', () => basculerTheme());
  const b = document.getElementById('btnDeco');
  if (b && onDeconnexion) b.addEventListener('click', onDeconnexion);
  majLogos();
}

// Ancien nom, conservé : l'en-tête se branche entièrement ici.
export const brancherDeconnexion = brancherEntete;

export function confirmer(msg) { return window.confirm(msg); }

// CONFIRMATION DANS LA PAGE avant un envoi définitif (06/10/2026 ; Spartoo ENT-1.1 §7.11 = Smoby C2, décisions de
// Tristan) : une boîte sous le bouton, le texte, « Oui » / « Non ». Jamais `window.confirm` : il bloque les postes
// et l'automatisation des tests. Une seule boîte à la fois. `faire` n'est appelé que sur « Oui ».
export function confirmerDansLaPage(bouton, texte, faire, { oui = 'Oui, envoyer', non = 'Non' } = {}) {
  if (!bouton) { faire(); return; }
  document.querySelectorAll('[data-confirme]').forEach((x) => x.remove());
  bouton.insertAdjacentHTML('afterend', `<div class="confirme-page" data-confirme role="alertdialog" aria-live="assertive">
    <p>${ech(texte)}</p><div class="confirme-boutons"><button type="button" class="btn btn-p" data-confirme-oui>${ech(oui)}</button>
    <button type="button" class="btn" data-confirme-non>${ech(non)}</button></div></div>`);
  const boite = bouton.nextElementSibling;
  boite.querySelector('[data-confirme-oui]').addEventListener('click', (ev) => { ev.preventDefault(); boite.remove(); faire(); });
  boite.querySelector('[data-confirme-non]').addEventListener('click', (ev) => { ev.preventDefault(); boite.remove(); bouton.focus(); });
  boite.querySelector('[data-confirme-oui]').focus();
}

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
