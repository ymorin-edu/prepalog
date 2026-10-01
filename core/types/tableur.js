// Type « dépôt de classeur » — l'élève remplit un fichier Excel et le dépose ;
// le classeur est lu dans le navigateur et contrôlé cellule par cellule.
//
// Rien n'est envoyé sur un serveur : SheetJS lit le fichier localement. Le classeur
// lui-même n'est pas conservé, seul le résultat du contrôle part dans le suivi.
//
// Déclaration d'un contrôle :
//   { cellule: 'D12', libelle: 'Total des entrées', attendu: 480 }
//   { cellule: 'D13', libelle: 'Valeur du stock', attendu: 1234.5, tolerance: 0.01 }
//   { cellule: 'C4',  libelle: 'Statut', attendu: 'À commander' }   // attendu texte
//   { cellule: 'B2',  libelle: 'Votre nom', texte: true }           // simple présence
//   { feuille: 'Inventaire', cellule: 'E4', attendu: 12 }           // feuille nommée
//   { cellule: 'E4', attendu: -2, formuleAttendue: true }           // signale une valeur tapée
//
// Contrôle de liste, à ordre libre — pour les exercices du genre « relevez les références
// dont le stock est sous le minimum », où l'ordre des lignes n'a aucun sens :
//   { plage: 'A2:C11', libelle: 'Références sous le minimum',
//     lignes: [['REF-104', 'Gants', 12], ['REF-110', 'Sangle', 3]], tolerance: 0.01 }
// Chaque ligne attendue doit se trouver quelque part dans la plage, dans n'importe quel
// ordre ; les lignes vides sont ignorées. Une liste à une seule colonne s'écrit
// `lignes: [['REF-104'], ['REF-110']]`. Le contrôle compte pour un, comme les autres, et
// sa remarque nomme les lignes oubliées et celles en trop : c'est ce que l'élève doit lire
// pour se corriger, et ce que l'enseignant regarde en premier.
//
// Deux fabriques :
//   creerTableur       un seul classeur, une seule note.
//   creerSerieTableur  une progression d'exercices, chacun son classeur et ses contrôles,
//                      chacun son niveau de classe. Voir plus bas.

import { ech, toast } from '../ui.js';
import { estJuste, normaliser } from './numerique.js';
import { concerneNiveau, libelleNiveaux } from '../niveaux.js';
import { texteNoteSur20 } from '../notes.js';

// SheetJS est servi par le site lui-même, jamais par un CDN : les filtrages académiques
// bloquent régulièrement cdnjs et consorts, et une activité qui tombe en panne en séance
// coûte plus cher que 861 Ko dans le dépôt. Voir vendor/LISEZMOI.md.
// L'adresse est calculée depuis ce module : elle reste juste quelle que soit la page.
const URL_XLSX = new URL('../../vendor/xlsx.full.min.js', import.meta.url).href;

let chargement = null;
function chargerXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (chargement) return chargement;
  chargement = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = URL_XLSX;
    s.onload = () => res(window.XLSX);
    s.onerror = () => rej(new Error(
      "Le lecteur de classeurs n'a pas pu être chargé (vendor/xlsx.full.min.js)."));
    document.head.appendChild(s);
  });
  return chargement;
}

// Deux pictogrammes de la même famille que ceux de l'accueil : trait de 1,7, sans
// remplissage. La flèche descend dans le bac pour télécharger, elle en sort pour déposer —
// c'est le seul détail qui les distingue, et il se lit d'un coup d'œil.
const ICONE_TELECHARGER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 3v11"/><path d="M7.5 9.5L12 14l4.5-4.5"/><path d="M4 15v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`;

const ICONE_DEPOSER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 14V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M4 15v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>`;

function valeurCellule(classeur, ctrl, feuilleParDefaut) {
  const nom = ctrl.feuille || feuilleParDefaut || classeur.SheetNames[0];
  const f = classeur.Sheets[nom];
  if (!f) return { absente: true, feuille: nom };
  const c = f[ctrl.cellule];
  if (!c) return { vide: true, feuille: nom };
  return { valeur: c.v, formule: c.f || null, feuille: nom };
}

// Comparaison de texte indulgente : la casse, les accents et les espaces en trop ne
// doivent pas coûter un point à un élève qui a compris l'exercice.
const pliage = (s) => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim();

// ------------------------------------------------- listes à ordre libre
// Une plage « A2:C11 » se décompose en colonnes et en lignes sans passer par SheetJS :
// le lecteur n'est chargé qu'au dépôt d'un fichier, et ces fonctions servent aussi aux
// tests, qui n'ouvrent aucun classeur.
const colVersIndex = (s) => s.toUpperCase().split('')
  .reduce((n, c) => n * 26 + (c.charCodeAt(0) - 64), 0);
const indexVersCol = (n) => {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - r - 1) / 26; }
  return s;
};

export function decouperPlage(plage) {
  const m = /^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/.exec(String(plage).trim());
  if (!m) return null;
  const c1 = colVersIndex(m[1]), c2 = colVersIndex(m[3]);
  const l1 = Number(m[2]), l2 = Number(m[4]);
  const colonnes = [];
  for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) colonnes.push(indexVersCol(c));
  const lignes = [];
  for (let l = Math.min(l1, l2); l <= Math.max(l1, l2); l++) lignes.push(l);
  return { colonnes, lignes };
}

// VRAI / FAUX. Une formule logique rend un booléen, mais le classeur peut tout aussi bien
// porter le texte « VRAI » selon le tableur et la langue : les deux sont la même réponse.
function memeBooleen(lue, attendue) {
  if (typeof lue === 'boolean') return lue === attendue;
  const t = pliage(lue);
  return attendue ? (t === 'vrai' || t === 'true') : (t === 'faux' || t === 'false');
}

// Une cellule « égale » une valeur attendue : texte indulgent, nombres à la tolérance.
function memeValeur(lue, attendue, tolerance) {
  if (attendue === null || attendue === undefined || attendue === '') {
    return lue === undefined || lue === null || String(lue).trim() === '';
  }
  if (typeof attendue === 'boolean') return memeBooleen(lue, attendue);
  if (typeof attendue === 'number') {
    const n = normaliser(lue);
    return n !== null && n !== undefined && estJuste(n, attendue, tolerance);
  }
  return pliage(lue) === pliage(attendue);
}

const libelleLigne = (l) => l.map((v) => (v === null || v === undefined || v === '' ? '—' : v)).join(' / ');

// Appariement : chaque ligne attendue cherche une ligne saisie encore libre. Glouton, ce
// qui suffit ici — les lignes attendues d'un même exercice ne se recouvrent pas.
function controlerListe(classeur, ctrl, feuilleParDefaut) {
  const nom = ctrl.feuille || feuilleParDefaut || classeur.SheetNames[0];
  const f = classeur.Sheets[nom];
  if (!f) return { ok: false, remarque: `La feuille « ${nom} » est introuvable.`, feuille: nom };

  const decoupe = decouperPlage(ctrl.plage);
  if (!decoupe) return { ok: false, remarque: `Plage « ${ctrl.plage} » illisible.`, feuille: nom };

  // Lignes saisies, les vides mises de côté : un élève qui laisse un trou au milieu de sa
  // liste n'a pas commis de faute.
  const saisies = [];
  decoupe.lignes.forEach((l) => {
    const cells = decoupe.colonnes.map((c) => { const cel = f[c + l]; return cel ? cel.v : undefined; });
    if (cells.some((v) => v !== undefined && String(v).trim() !== '')) saisies.push({ l, cells });
  });

  const libres = saisies.slice();
  const oubliees = [];
  (ctrl.lignes || []).forEach((attendue) => {
    const i = libres.findIndex((s) => attendue.every((v, k) => memeValeur(s.cells[k], v, ctrl.tolerance)));
    if (i < 0) oubliees.push(attendue);
    else libres.splice(i, 1);
  });

  const ok = oubliees.length === 0 && libres.length === 0;
  const bouts = [];
  if (!saisies.length) bouts.push('Aucune ligne saisie dans la plage.');
  else {
    if (oubliees.length) {
      bouts.push(`${oubliees.length} ligne${oubliees.length > 1 ? 's' : ''} manquante${oubliees.length > 1 ? 's' : ''}`
        + ` : ${oubliees.slice(0, 4).map(libelleLigne).join(' ; ')}`
        + (oubliees.length > 4 ? ` ; … et ${oubliees.length - 4} autre${oubliees.length - 4 > 1 ? 's' : ''}` : ''));
    }
    if (libres.length) {
      bouts.push(`${libres.length} ligne${libres.length > 1 ? 's' : ''} en trop ou incorrecte${libres.length > 1 ? 's' : ''}`
        + ` : ${libres.slice(0, 4).map((s) => `ligne ${s.l} (${libelleLigne(s.cells)})`).join(' ; ')}`
        + (libres.length > 4 ? ` ; … et ${libres.length - 4} autre${libres.length - 4 > 1 ? 's' : ''}` : ''));
    }
  }
  return {
    ok, feuille: nom,
    remarque: ok ? `${saisies.length} ligne${saisies.length > 1 ? 's' : ''}, ordre libre.` : bouts.join(' '),
  };
}

export function controler(classeur, controles, feuilleParDefaut) {
  return controles.map((ctrl) => {
    // Contrôle de liste : la plage entière, l'ordre indifférent.
    if (ctrl.lignes && ctrl.plage) {
      const r = controlerListe(classeur, ctrl, feuilleParDefaut);
      return { ...ctrl, ok: r.ok, remarque: r.remarque, lu: { feuille: r.feuille } };
    }
    const lu = valeurCellule(classeur, ctrl, feuilleParDefaut);
    let ok = false, remarque = '';
    if (lu.absente) remarque = `La feuille « ${lu.feuille} » est introuvable.`;
    else if (lu.vide) remarque = 'Cellule vide.';
    else if (ctrl.texte) {
      ok = String(lu.valeur).trim().length > 0;
      if (!ok) remarque = 'Rien de saisi.';
    } else if (typeof ctrl.attendu === 'boolean') {
      ok = memeBooleen(lu.valeur, ctrl.attendu);
      if (!ok) remarque = `Lu : « ${lu.valeur} », attendu ${ctrl.attendu ? 'VRAI' : 'FAUX'}.`;
    } else if (typeof ctrl.attendu === 'string') {
      ok = pliage(lu.valeur) === pliage(ctrl.attendu);
      if (!ok) remarque = `Lu : « ${lu.valeur} ».`;
    } else {
      ok = estJuste(normaliser(lu.valeur), ctrl.attendu, ctrl.tolerance);
      if (!ok) remarque = `Valeur lue : ${lu.valeur}.`;
      if (ok && ctrl.formuleAttendue && !lu.formule) {
        remarque = 'Le résultat est bon, mais la cellule ne contient pas de formule.';
      }
    }
    return { ...ctrl, ok, remarque, lu };
  });
}

// Zone de dépôt : clic, parcourir, glisser-déposer. Rend le classeur lu à `onClasseur`.
function brancherDepot(hote, onClasseur) {
  const champ = hote.querySelector('#fichier');
  const zone = hote.querySelector('#depot');
  if (!champ || !zone) return;

  hote.querySelector('#btnParcourir')?.addEventListener('click', () => champ.click());
  champ.addEventListener('change', () => { if (champ.files[0]) lire(champ.files[0]); });

  ['dragenter', 'dragover'].forEach((e) => zone.addEventListener(e, (ev) => {
    ev.preventDefault(); zone.classList.add('survol');
  }));
  ['dragleave', 'drop'].forEach((e) => zone.addEventListener(e, () => zone.classList.remove('survol')));
  zone.addEventListener('drop', (ev) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files[0];
    if (f) lire(f);
  });

  async function lire(fichier) {
    const z = hote.querySelector('#resultatTableur');
    z.innerHTML = `<div class="avis">Lecture du classeur…</div>`;
    let XLSX;
    try {
      XLSX = await chargerXLSX();
    } catch (e) {
      z.innerHTML = `<div class="avis avis-err">${ech(e.message)} Vérifiez votre connexion et réessayez.</div>`;
      return;
    }
    try {
      const classeur = XLSX.read(await fichier.arrayBuffer(), { type: 'array', cellFormula: true });
      await onClasseur(classeur, fichier.name);
    } catch (e) {
      z.innerHTML = `<div class="avis avis-err">Ce fichier n'a pas pu être ouvert.
        Vérifiez qu'il s'agit bien d'un classeur Excel et qu'il n'est pas protégé par mot de passe.</div>`;
    }
  }
}

// Bouton de téléchargement : c'est le premier geste de l'élève, il doit se voir de loin.
const boutonModeleHTML = (href, libelle = 'Télécharger le classeur à compléter') => `
  <a class="btn btn-p btn-fichier" href="${ech(href)}" download>
    <span class="btn-fichier-icone">${ICONE_TELECHARGER}</span>
    <span>${ech(libelle)}</span>
  </a>`;

const zoneDepotHTML = (nomFichier) => `
  <div class="depot" id="depot">
    <input type="file" id="fichier" accept=".xlsx,.xlsm,.csv" hidden>
    <span class="depot-icone">${ICONE_DEPOSER}</span>
    <p><strong>Déposez votre classeur ici</strong>, ou
      <button class="btn btn-s" id="btnParcourir">parcourir</button></p>
    <p class="note">Formats acceptés : .xlsx, .xlsm, .csv — le fichier reste sur votre ordinateur,
      il est lu dans le navigateur et n'est pas envoyé.</p>
    ${nomFichier ? `<p class="note">Dernier fichier lu : <span class="mono">${ech(nomFichier)}</span></p>` : ''}
  </div>`;

function tableauResultats(resultats) {
  const justes = resultats.filter((r) => r.ok).length;
  return `
    <div class="avis ${justes === resultats.length ? 'avis-ok' : justes >= resultats.length * 0.6 ? '' : 'avis-err'}">
      <strong>${justes} contrôle${justes > 1 ? 's' : ''} réussi${justes > 1 ? 's' : ''} sur ${resultats.length}.</strong>
      <span class="note">Soit ${texteNoteSur20(justes, resultats.length)}.</span>
      ${justes === resultats.length ? ' Classeur conforme.' : ' Corrigez votre classeur et déposez-le de nouveau.'}
    </div>
    <div class="panneau">
      <table>
        <thead><tr><th></th><th>Contrôle</th><th>Cellule</th><th>Remarque</th></tr></thead>
        <tbody>${resultats.map((r) => `<tr>
          <td class="${r.ok ? 'juste' : 'faux'}">${r.ok ? '✓' : '✗'}</td>
          <td>${ech(r.libelle || '')}</td>
          <td class="mono">${ech((r.feuille ? r.feuille + '!' : '') + (r.cellule || r.plage || ''))}</td>
          <td class="note">${ech(r.remarque)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

// ------------------------------------------------------------- un seul classeur
export function creerTableur({ consigne, modele, controles, aide, feuille }) {
  return {
    rendre(hote, ctx) {
      let resultats = null;
      let nomFichier = '';

      function dessiner() {
        hote.innerHTML = `
          <div class="panneau">
            ${consigne ? `<p>${ech(consigne)}</p>` : ''}
            ${aide ? `<p class="note">${ech(aide)}</p>` : ''}
            ${modele ? boutonModeleHTML(modele) : ''}
            ${zoneDepotHTML(nomFichier)}
          </div>
          <div id="resultatTableur">${resultats ? tableauResultats(resultats) : ''}</div>`;

        brancherDepot(hote, async (classeur, nom) => {
          nomFichier = nom;
          resultats = controler(classeur, controles, feuille);
          dessiner();
          const score = resultats.filter((r) => r.ok).length;
          await ctx.enregistrer({
            score, max: controles.length,
            detail: Object.fromEntries(resultats.map((r) => [r.cellule || r.plage, r.ok])),
          });
          toast(`${score} / ${controles.length}`);
        });
      }

      dessiner();
    },
  };
}

// ------------------------------------------------------ une série d'exercices
//
// Une progression : dix exercices, chacun son classeur, ses contrôles et son niveau.
// L'élève ne voit que les exercices de son niveau de classe — un exercice de Terminale
// n'encombre pas la liste d'un Seconde. L'enseignant, lui, les voit tous, étiquetés.
//
//   creerSerieTableur({
//     consigne, feuille: 'Exercice', dossier: './contenus/tab2/',
//     exercices: [{ id, titre, groupe, objectif, niveaux, fichier, controles }],
//   })
//
// Le meilleur résultat de chaque exercice est conservé dans le jeu de données privé de
// l'élève (`tables: { resultats: {} }` obligatoire dans le `meta`). Le score remonté au
// suivi de classe est le **nombre d'exercices entièrement réussis** sur le nombre
// d'exercices proposés à ce niveau : un « 7 / 10 » lisible, plutôt qu'un total de
// cellules qui ne dirait rien à personne.
export function creerSerieTableur({ consigne, exercices, feuille, dossier = '' }) {
  return {
    rendre(hote, ctx) {
      let exercice = null;       // exercice ouvert, null = liste
      let resultats = null;      // contrôles du dernier dépôt
      let nomFichier = '';

      const estProf = ctx.profil?.role === 'prof';
      // L'enseignant voit toute la série ; l'élève, ce qui correspond à son niveau.
      const visibles = estProf
        ? exercices
        : exercices.filter((e) => concerneNiveau(e.niveaux, ctx.niveauGroupe));

      // Un exercice sans contrôle ne se corrige pas tout seul — mise en forme
      // conditionnelle, graphique : le lecteur de classeurs ne sait pas les relire. Il
      // reste dans la liste, téléchargeable, mais il ne compte ni au numérateur ni au
      // dénominateur : un score que l'élève ne peut pas atteindre ne veut rien dire.
      const corrigeable = (e) => (e.controles || []).length > 0;
      const notes = () => visibles.filter(corrigeable);

      const bests = () => {
        const o = {};
        (ctx.jeu.lignes('resultats') || []).forEach((r) => {
          o[r.exercice] = Math.max(o[r.exercice] ?? -1, r.score);
        });
        return o;
      };

      async function enregistrer(eid, score, total) {
        const anciens = ctx.jeu.lignes('resultats') || [];
        const ligne = anciens.find((r) => r.exercice === eid);
        if (ligne) {
          if (score > (ligne.score ?? -1)) await ctx.jeu.modifier('resultats', ligne.id, { score, total });
        } else {
          await ctx.jeu.ajouter('resultats', { exercice: eid, score, total });
        }
        if (estProf) return;      // l'enseignant qui essaie un exercice ne se note pas
        const b = bests();
        const aNoter = notes();
        const reussis = aNoter.filter((e) => b[e.id] === e.controles.length).length;
        await ctx.enregistrer({ score: reussis, max: aNoter.length, detail: b });
      }

      // ------------------------------------------------------------- la liste
      function vueListe() {
        const b = bests();
        const aNoter = notes();
        const reussis = aNoter.filter((e) => b[e.id] === e.controles.length).length;

        // Les exercices sont groupés par notion (RECHERCHEV, TCD…) quand ils en portent une.
        const groupes = [];
        visibles.forEach((e) => {
          const cle = e.groupe || '';
          const g = groupes.find((x) => x.cle === cle);
          (g || groupes[groupes.push({ cle, exos: [] }) - 1]).exos.push(e);
        });

        hote.innerHTML = `
          ${consigne ? `<p class="note">${ech(consigne)}</p>` : ''}
          ${visibles.length === 0
            ? `<div class="vide">Aucun exercice de cette série ne correspond au niveau du groupe.</div>`
            : `<p class="note"><strong>${reussis} exercice${reussis > 1 ? 's' : ''} réussi${reussis > 1 ? 's' : ''}
                 sur ${aNoter.length}, soit ${texteNoteSur20(reussis, aNoter.length)}.</strong>
                 Un exercice compte pour réussi quand tous ses contrôles passent.
                 ${aNoter.length < visibles.length
                   ? `${visibles.length - aNoter.length} exercice${visibles.length - aNoter.length > 1 ? 's se vérifient' : ' se vérifie'}
                      en classe et ne compte${visibles.length - aNoter.length > 1 ? 'nt' : ''} pas dans ce total.` : ''}</p>
              ${groupes.map((g) => `
                ${g.cle ? `<h3 class="serie-groupe">${ech(g.cle)}</h3>` : ''}
                <div class="module-grid">
                  ${g.exos.map((e) => {
                    const sc = b[e.id];
                    const fini = corrigeable(e) && sc === e.controles.length;
                    return `<button class="module-tile ${fini ? 'fini' : ''}" data-exo="${ech(e.id)}">
                      <span class="code">${!corrigeable(e) ? 'à vérifier en classe'
                        : fini ? '✓ réussi'
                        : sc !== undefined ? `meilleur : ${sc} / ${e.controles.length}`
                        : 'non commencé'}${estProf ? ' · ' + ech(libelleNiveaux(e.niveaux)) : ''}</span>
                      <span class="titre">${ech(e.titre)}</span>
                      <span class="desc">${ech(e.objectif || '')}</span>
                    </button>`;
                  }).join('')}
                </div>`).join('')}`}`;

        hote.querySelectorAll('[data-exo]').forEach((btn) => btn.addEventListener('click', () => {
          exercice = visibles.find((e) => e.id === btn.dataset.exo);
          resultats = null; nomFichier = '';
          vueExercice();
        }));
      }

      // ---------------------------------------------------------- un exercice
      function vueExercice() {
        const b = bests()[exercice.id];
        hote.innerHTML = `
          <button class="lien-accueil" id="btnListe">← TOUS LES EXERCICES</button>
          <div class="panneau">
            <h2>${ech(exercice.titre)}</h2>
            <p class="note">${ech(exercice.objectif || '')}
              ${b !== undefined ? ` — meilleur résultat : ${b} / ${exercice.controles.length}` : ''}</p>
            ${boutonModeleHTML(dossier + exercice.fichier)}
            ${corrigeable(exercice) ? `
              <p class="note">Complétez-le dans Excel ou LibreOffice, enregistrez-le, puis déposez-le ici.
                Autant de fois que nécessaire : c'est le meilleur résultat qui compte.</p>
              ${zoneDepotHTML(nomFichier)}`
            : `<p class="note">Cet exercice se vérifie en classe : le contrôle automatique ne sait pas
                relire une couleur conditionnelle ni un graphique. Suivez les consignes du classeur,
                enregistrez votre travail et montrez-le à votre enseignant. Il ne compte pas dans
                votre score.</p>`}
          </div>
          <div id="resultatTableur">${resultats ? tableauResultats(resultats) : ''}</div>`;

        hote.querySelector('#btnListe').addEventListener('click', vueListe);
        if (!corrigeable(exercice)) return;
        brancherDepot(hote, async (classeur, nom) => {
          nomFichier = nom;
          resultats = controler(classeur, exercice.controles, feuille);
          vueExercice();
          const score = resultats.filter((r) => r.ok).length;
          const total = exercice.controles.length;
          hote.querySelector('#resultatTableur').scrollIntoView({ block: 'nearest' });
          await enregistrer(exercice.id, score, total);
          toast(score === total ? 'Exercice réussi.' : `${score} / ${total}`);
        });
      }

      vueListe();
    },
  };
}
