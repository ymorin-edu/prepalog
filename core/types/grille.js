// Grille de calcul — l'élève écrit la formule, pas le résultat. Écrite le 04/10/2026.
//
// Tristan, le 03/10 au soir : *« il doit disposer d'un petit espace tableur intégré si possible,
// où il doit saisir la formule pour trouver le temps. Même chose pour le poids : il doit
// construire avec une somme pour avoir le poids total. »*
//
// Ce n'est pas une vue de menu comme `plan` et `tournee` : c'est un **fragment** qu'une autre
// vue pose dans sa page, parce que la grille n'a de sens qu'à côté des données dont elle est
// tirée. La vue tournée l'engendre depuis le parcours cliqué par l'élève — changer d'itinéraire
// change les données, donc les formules recalculent et la réponse bouge. C'est ce qui en fait
// un écran de logiciel et pas un exercice posé à côté.
//
//   creerGrille({
//     titre: 'Feuille de calcul', consigne: '…',
//     colonnes: ['A', 'B'],
//     lignes: [                                  // engendrées par l'appelant, à chaque dessin
//       { A: 'Arrêt', B: 'Poids (kg)', entete: true },
//       { A: 'Maison Lauze', B: 42 },
//       { A: 'Poids total (kg)', B: { saisie: true, attendu: 179, formule: true,
//                                     aide: 'Additionnez les poids avec SOMME.' } },
//     ],
//     decimales: 1,
//   })
//
// L'état : `{ cases: { B8: '=SOMME(B2:B7)' }, juge: { B8: true }, valide: ts }`.
//
// ── Deux choses sont corrigées, pas une ────────────────────────────────────────────────────
// La valeur **et** le fait que la cellule contienne bien une FORMULE. Un élève qui calcule de
// tête et tape `179` a trouvé le bon nombre sans faire le travail demandé — et c'est exactement
// le travail demandé qui est la compétence. C'est déjà l'esprit de `formuleAttendue` dans
// `core/types/tableur.js`, qui distingue depuis longtemps une valeur tapée d'une formule.
//
// ── Pourquoi la formule ET son résultat restent affichés ensemble ──────────────────────────
// Un tableur bascule entre les deux : la formule quand on est dans la cellule, la valeur sinon.
// Ici la formule reste visible dans le champ et le résultat s'affiche à côté, en direct. Deux
// raisons. La première est pédagogique : un élève qui découvre les formules doit voir en même
// temps ce qu'il écrit et ce que ça produit. La seconde est technique : basculer demande de
// redessiner la cellule au moment où on la quitte, et un redessin fait perdre le focus — le
// même piège que sur la carte cliquable, où le second Entrée ne faisait plus rien.

import { ech } from '../ui.js';
import { evaluerGrille, afficher, estFormule, nombreFr, cellulesDePlage, formaterHeure } from '../formules.js';

export function creerGrille(G) {
  const COLS = G.colonnes || ['A', 'B'];
  // Posé par `brancher` pour retirer l'écouteur de document du dessin précédent — voir tout en
  // bas, à la fin du pointage à la souris.
  let detacherPointage = null;
  const DEC = G.decimales == null ? 2 : G.decimales;

  // L'adresse d'une cellule se déduit de sa place : colonne + numéro de ligne, la première
  // ligne portant le 1. C'est l'appelant qui décide de l'ordre des lignes, donc c'est lui qui
  // décide des adresses — et c'est pour ça que `B2:B7` change quand le parcours change.
  const adresse = (col, i) => `${col}${i + 1}`;

  // Ce qu'on donne à l'évaluateur : les cellules verrouillées avec leur nombre, les cellules à
  // remplir avec ce que l'élève a tapé. Un libellé texte est passé tel quel — il ne gêne pas,
  // et une formule qui le référencerait doit voir une cellule vide, pas un nombre inventé.
  function cellulesDe(lignes, cases) {
    const c = {};
    lignes.forEach((L, i) => {
      COLS.forEach((col) => {
        const v = L[col];
        const a = adresse(col, i);
        // Un objet est soit une cellule À REMPLIR (`saisie`), soit une donnée fixe qui porte un
        // format (`{ valeur: 970, format: 'heure' }`). Les deux ne se confondent pas : la
        // seconde vaut son nombre, la première vaut ce que l'élève y a tapé.
        if (v && typeof v === 'object') {
          if (v.saisie) c[a] = cases[a] == null ? '' : String(cases[a]);
          else if (v.valeur !== undefined && v.valeur !== null) c[a] = v.valeur;
        } else if (v !== undefined && v !== null) c[a] = v;
      });
    });
    return c;
  }

  // Les cellules à remplir, avec ce qu'on attend d'elles. Lire la grille plutôt que de tenir
  // une liste en parallèle : les deux ne peuvent pas se désaccorder.
  function aRemplir(lignes) {
    const out = [];
    lignes.forEach((L, i) => {
      COLS.forEach((col) => {
        const v = L[col];
        if (v && typeof v === 'object' && v.saisie) out.push(Object.assign({ ref: adresse(col, i) }, v));
      });
    });
    return out;
  }

  // La correction. Deux verdicts possibles par cellule, et ils ne disent pas la même chose :
  // `'valeur'` le nombre est faux, `'pasFormule'` le nombre est juste mais il a été tapé à la
  // main. Le second mérite un message à lui — l'élève n'a pas « faux », il n'a pas fait ce
  // qu'on lui demandait.
  function juger(lignes, cases) {
    const r = evaluerGrille(cellulesDe(lignes, cases));
    const juge = {};
    aRemplir(lignes).forEach((c) => {
      const brut = cases[c.ref];
      if (brut == null || String(brut).trim() === '') { juge[c.ref] = 'vide'; return; }
      if (r.erreurs[c.ref]) { juge[c.ref] = 'erreur'; return; }
      if (c.formule && !estFormule(brut)) { juge[c.ref] = 'pasFormule'; return; }
      if (c.attendu != null) {
        const v = r.valeurs[c.ref];
        const tol = c.tolerance == null ? 0.01 : c.tolerance;
        if (v == null || Math.abs(v - c.attendu) > tol) { juge[c.ref] = 'valeur'; return; }
      }
      juge[c.ref] = 'ok';
    });
    return juge;
  }

  return {
    juger,
    // Exposé pour les jalons du contenu : « toutes les formules sont justes » se lit sans
    // dessiner et sans attendre que l'élève ait cliqué « vérifier ».
    toutesJustes(lignes, cases) {
      const j = juger(lignes, cases || {});
      const refs = Object.keys(j);
      return refs.length > 0 && refs.every((k) => j[k] === 'ok');
    },

    html(lignes, etat0, opts = {}) {
      const etat = Object.assign({ cases: {}, juge: {}, valide: null }, etat0 || {});
      const cases = etat.cases || {};
      // `sansCorrection` (évaluation en copie rendue) : aucun verdict, aucun bouton « Vérifier ».
      // Le résultat de chaque formule reste affiché à côté : c'est le tableur, pas la correction.
      const SANS = !!opts.sansCorrection;
      const juge = SANS ? {} : (etat.juge || {});
      const aJuge = Object.keys(juge).length > 0;
      const r = evaluerGrille(cellulesDe(lignes, cases));

      const enTete = `<tr><th class="gr-coin"></th>${COLS
        .map((c) => `<th class="gr-col">${ech(c)}</th>`).join('')}</tr>`;

      const corps = lignes.map((L, i) => {
        const cells = COLS.map((col) => {
          const v = L[col];
          const a = adresse(col, i);
          if (v && typeof v === 'object' && v.saisie) {
            const brut = cases[a] == null ? '' : String(cases[a]);
            const verdict = juge[a];
            const cl = !aJuge || !verdict ? '' : (verdict === 'ok' ? 'juste' : 'faux');
            return `<td class="gr-saisie" data-ref="${ech(a)}">
              <span class="gr-champ">
                <input type="text" class="champ ${cl}" data-gr="${ech(a)}" value="${ech(brut)}"
                  autocomplete="off" spellcheck="false"
                  aria-label="Cellule ${ech(a)}${v.libelle ? ', ' + ech(v.libelle) : ''}"
                  placeholder="${ech(v.placeholder || (v.formule ? '= votre formule' : 'votre réponse'))}">
                <b class="gr-res mono" data-gr-res="${ech(a)}" data-fmt="${ech(v.format || '')}"
                  data-dec="${ech(String(v.decimales == null ? DEC : v.decimales))}">${ech(
                  afficher(a, r, v.decimales == null ? DEC : v.decimales, v.format || null))}</b>
              </span>
              ${!aJuge || !verdict ? '' : `<span class="gr-verdict">${
                verdict === 'ok' ? '<span class="pastille ok">juste</span>'
                : verdict === 'pasFormule' ? '<span class="pastille warn">écrivez une formule</span>'
                : verdict === 'vide' ? '<span class="pastille warn">à remplir</span>'
                : verdict === 'erreur' ? '<span class="pastille crit">formule mal écrite</span>'
                : '<span class="pastille crit">à revoir</span>'}</span>`}
            </td>`;
          }
          // Un nombre donné s'affiche À LA FRANÇAISE, comme le résultat calculé juste à côté :
          // une distance écrite « 22.1 » au-dessus d'un résultat écrit « 110,5 » apprendrait à
          // l'élève que les deux écritures se valent, et c'est faux dans le tableur qu'il
          // ouvrira ensuite.
          // Une donnée fixe peut porter un format : le départ du train s'écrit « 16 h 10 », pas
          // « 970 ». Le nombre reste celui que les formules lisent.
          const objet = v && typeof v === 'object';
          const brut = objet ? v.valeur : (v === undefined || v === null ? '' : v);
          const n = typeof brut === 'number' ? brut : nombreFr(brut);
          const nb = n !== null;
          const txt = nb
            ? (objet && v.format === 'heure' ? formaterHeure(n)
              : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: DEC }).format(n))
            : String(brut);
          // Sous le libellé d'une ligne : l'explication de l'étape, à l'endroit où on la cherche.
          const note = col === COLS[0] && L.note
            ? `<span class="gr-expl">${ech(L.note)}</span>` : '';
          return `<td class="gr-fixe${nb ? ' gr-nb mono' : ''}" data-ref="${ech(a)}">${ech(txt)}${note}</td>`;
        }).join('');
        return `<tr class="${L.entete ? 'gr-ligne-entete' : ''}${L.type ? ` gr-t-${ech(L.type)}` : ''}">
          <th class="gr-num mono">${i + 1}</th>${cells}</tr>`;
      }).join('');

      const aides = aRemplir(lignes).filter((c) => c.aide);
      const bilan = !aJuge ? '' : (() => {
        const vals = Object.values(juge);
        if (vals.every((x) => x === 'ok')) {
          return '<div class="avis avis-ok">Toutes les formules sont justes.</div>';
        }
        const pasF = vals.filter((x) => x === 'pasFormule').length;
        const reste = vals.filter((x) => x !== 'ok' && x !== 'pasFormule').length;
        const m = [];
        if (pasF) {
          m.push(`${pasF} cellule(s) contiennent un nombre tapé à la main. Le résultat est
            peut-être juste, mais c'est la formule qui est demandée : commencez par «&nbsp;=&nbsp;».`);
        }
        if (reste) m.push(`${reste} cellule(s) à revoir.`);
        return `<div class="avis avis-err">${m.join(' ')}</div>`;
      })();

      // La légende des surbrillances : seulement celles que la feuille utilise.
      const types = new Set(lignes.map((L) => L.type).filter(Boolean));
      const legende = !types.size ? '' : `<ul class="gr-legende">${[
        ['etape', 'Étape du calcul'],
        ['resultat', 'Résultat à comparer à la contrainte'],
        ['contrainte', 'Contrainte (donnée)'],
      ].filter(([t]) => types.has(t))
        .map(([t, lbl]) => `<li><i class="gr-puce gr-puce-${t}"></i>${ech(lbl)}</li>`).join('')}</ul>`;

      // Le tableau à gauche, les contraintes à droite : l'élève compare le résultat qu'il vient
      // de calculer à la limite, sans quitter la feuille des yeux. `opts.droite` est du HTML
      // posé par l'appelant (la vue tournée y met ses jauges) ; sans lui, la feuille reste seule.
      const gauche = `
        <div class="ent-lbl">${ech(G.titre || 'Feuille de calcul')}</div>
        ${G.consigne ? `<p class="note">${ech(G.consigne)}</p>` : ''}
        ${legende}
        <div class="ent-scroll"><table class="gr-table">
          <thead>${enTete}</thead><tbody>${corps}</tbody>
        </table></div>
        ${!aides.length ? '' : `<ul class="gr-aides">${aides
          .map((c) => `<li><b class="mono">${ech(c.ref)}</b> ${ech(c.aide)}</li>`).join('')}</ul>`}
        ${bilan}
        ${opts.avertissement ? `<div class="avis avis-contrainte">${ech(opts.avertissement)}</div>` : ''}
        ${SANS ? '' : `<div class="rangee" style="margin-top:12px">
          <button class="btn btn-p" data-gr-verifier>${ech(G.libelleValider || 'Vérifier mes formules')}</button>
        </div>`}`;
      return opts.droite
        ? `<div class="gr-bloc gr-deux"><div class="gr-gauche">${gauche}</div>
            <aside class="gr-droite" aria-label="Contraintes de l’exercice">${opts.droite}</aside></div>`
        : `<div class="gr-bloc">${gauche}</div>`;
    },

    // `api` = { etat, lignes(), sauver(), redessiner(), toast() }. `lignes()` est une fonction
    // et non un tableau : la grille est tirée du parcours de l'élève, qui change sous elle.
    brancher(z, api) {
      const etat = api.etat;
      if (!etat.cases) etat.cases = {};

      // Le recalcul se fait SANS redessiner : on ne retouche que les résultats affichés. Un
      // redessin à chaque frappe ferait perdre le curseur au milieu d'une formule — et il
      // effacerait la sélection de l'élève qui corrige une référence.
      const recalculer = () => {
        const lignes = api.lignes();
        const r = evaluerGrille(cellulesDe(lignes, etat.cases));
        z.querySelectorAll('[data-gr-res]').forEach((b) => {
          const dec = b.dataset.dec === undefined || b.dataset.dec === '' ? DEC : Number(b.dataset.dec);
          b.textContent = afficher(b.dataset.grRes, r, dec, b.dataset.fmt || null);
          b.classList.toggle('gr-res-err', !!r.erreurs[String(b.dataset.grRes).toUpperCase()]);
        });
      };

      const noter = (el) => {
        etat.cases[el.dataset.gr] = el.value;
        // Une correction affichée ne vaut plus rien dès que l'élève retouche sa formule.
        if (Object.keys(etat.juge || {}).length) { etat.juge = {}; }
        recalculer();
        api.sauver();
      };

      // Le champ en cours d'écriture, et où en est le curseur dedans. On suit la position du
      // curseur à chaque frappe et à chaque clic DANS le champ, parce qu'au moment où l'élève
      // désigne une cellule à la souris il est trop tard pour la demander : le navigateur a
      // déjà traité l'événement.
      let actif = null;
      const curseur = { debut: 0, fin: 0 };
      // La portion de texte que le geste de pointage en cours a écrite. Déclarée ici, avant les
      // écouteurs de frappe, parce qu'ils doivent pouvoir l'oublier : dès que l'élève tape au
      // clavier, les positions mémorisées ne désignent plus la référence posée, et un Maj-clic
      // qui s'y fierait réécrirait au milieu de sa formule.
      let pose = null;
      let enCours = false;
      const suivreCurseur = (el) => {
        if (el !== actif) return;
        curseur.debut = el.selectionStart == null ? el.value.length : el.selectionStart;
        curseur.fin = el.selectionEnd == null ? curseur.debut : el.selectionEnd;
      };

      z.querySelectorAll('[data-gr]').forEach((el) => {
        // `pose = null` : une frappe au clavier périme le repère du geste précédent.
        const maj = () => { pose = null; noter(el); suivreCurseur(el); };
        el.addEventListener('input', maj);
        el.addEventListener('change', maj);
        el.addEventListener('focus', () => { actif = el; suivreCurseur(el); });
        el.addEventListener('blur', () => { if (actif === el) actif = null; });
        ['keyup', 'click', 'select'].forEach((ev) => el.addEventListener(ev, () => suivreCurseur(el)));
      });

      /* ---------------------------------------------------- désigner une cellule à la souris
       * Tristan, le 04/10 : *« il ne reproduit pas le clic ou le clic glissé pour sélectionner
       * les cellules »*. C'est le geste d'Excel, et c'est comme ça qu'on apprend ce qu'est une
       * plage : on la montre, on ne l'épelle pas. Trois gestes, et le troisième est le filet —
       * le glisser n'a jamais été éprouvé sur les postes du lycée.
       *
       *   clic         → insère « B4 » à l'endroit du curseur
       *   clic glissé  → insère « B2:B7 » et la suit tant qu'on tient le bouton
       *   Maj-clic     → étend la dernière référence posée jusqu'à la cellule cliquée
       *
       * Deux règles qui font que ça marche plutôt que d'agacer :
       *
       * 1. **Ça ne s'active QUE pendant l'écriture d'une formule** — un champ a le focus et son
       *    contenu commence par « = ». Sinon le clic sur une cellule reste un clic ordinaire,
       *    et l'élève peut aller écrire dans une autre case comme avant.
       * 2. **Le geste REMPLACE ce qu'il a posé** au lieu d'empiler. Sans ça, glisser de B2 à B7
       *    écrirait « B2B3B4B5B6B7 » : la référence insérée est mémorisée, et chaque mouvement
       *    la réécrit au même endroit.
       */
      const tableau = z.querySelector('.gr-table');
      if (tableau) {
        const ecrire = (texte) => {
          if (!actif) return;
          const v = actif.value;
          const debut = pose ? pose.debut : curseur.debut;
          const fin = pose ? pose.fin : curseur.fin;
          actif.value = v.slice(0, debut) + texte + v.slice(fin);
          pose = { debut, fin: debut + texte.length, ancre: pose ? pose.ancre : null };
          // Le curseur se replace APRÈS la référence : l'élève continue d'écrire sa formule là
          // où il en était, il n'a pas à aller rechercher sa place.
          curseur.debut = pose.fin;
          curseur.fin = pose.fin;
          try { actif.setSelectionRange(pose.fin, pose.fin); } catch (e) { /* champ détaché */ }
          noter(actif);
        };

        // De deux coins vers l'écriture d'une plage, remise à l'endroit : un élève qui glisse de
        // bas en haut doit lire « B2:B7 », pas « B7:B2 ».
        const designation = (a, b) => {
          if (a === b) return a;
          const cells = cellulesDePlage(a, b);
          if (!cells || !cells.length) return b;
          return `${cells[0]}:${cells[cells.length - 1]}`;
        };

        const surligner = (a, b) => {
          const dans = a && b ? (cellulesDePlage(a, b) || []) : [];
          tableau.querySelectorAll('[data-ref]').forEach((td) => {
            td.classList.toggle('gr-vise', dans.indexOf(td.dataset.ref) >= 0);
          });
        };

        const refSous = (e) => {
          const td = e.target && e.target.closest ? e.target.closest('[data-ref]') : null;
          return td ? td.dataset.ref : null;
        };

        // ── Quand le pointage s'arme, et quand il doit se taire ────────────────────────────
        // Les deux défauts sortis en pilotant l'écran à la souris, et qu'aucun test n'aurait
        // dits — comme d'habitude sur ce projet.
        //
        // 1. **Cliquer DANS son propre champ insérait sa propre référence.** L'élève posait son
        //    curseur au milieu de sa formule et récoltait « B8 » au passage. Un champ qu'on
        //    clique pour y placer le curseur n'est pas une cellule qu'on désigne.
        //
        // 2. **Toute cellule cliquée était insérée, même sur une formule finie.** Un élève qui
        //    a écrit `=SOMME(B2:B7)` et qui clique la cellule d'en dessous pour aller y écrire
        //    se retrouvait avec sa formule polluée et se demandait ce qui s'était passé.
        //
        // La règle est donc celle d'Excel : on ne désigne une cellule que si la formule ATTEND
        // quelque chose à cet endroit — c'est-à-dire si le caractère juste avant le curseur est
        // un opérateur, une parenthèse ouvrante, un séparateur, ou le « = » lui-même. Sinon le
        // clic redevient un clic ordinaire et l'élève va où il voulait aller.
        const enAttenteDeReference = () => {
          if (!actif || !estFormule(actif.value)) return false;
          const avant = actif.value.slice(0, curseur.debut).trimEnd();
          return avant === '' || '=+-*/^(;:'.includes(avant.slice(-1));
        };

        tableau.addEventListener('mousedown', (e) => {
          // Un geste commencé continue tant qu'on tient le bouton ; seul son DÉBUT est soumis
          // aux règles ci-dessus.
          const prolonge = e.shiftKey && pose && pose.ancre;
          if (!actif || !estFormule(actif.value)) return;
          // Son propre champ : jamais. On y pose un curseur, on ne s'y désigne pas soi-même.
          if (e.target === actif) return;
          if (!prolonge && !enAttenteDeReference()) return;
          const ref = refSous(e);
          if (!ref) return;
          // `preventDefault` garde le focus ET le curseur dans le champ. Sans lui, le navigateur
          // déplace le focus sur la cellule cliquée et la formule se referme sous les doigts.
          e.preventDefault();

          if (prolonge) {
            ecrire(designation(pose.ancre, ref));
            surligner(pose.ancre, ref);
            return;
          }
          pose = null;                       // un clic neuf repart du curseur, pas de la pose d'avant
          enCours = true;
          ecrire(ref);
          pose.ancre = ref;
          surligner(ref, ref);
          tableau.classList.add('gr-pointe');
        });

        tableau.addEventListener('mouseover', (e) => {
          if (!enCours || !pose || !pose.ancre) return;
          const ref = refSous(e);
          if (!ref) return;
          ecrire(designation(pose.ancre, ref));
          surligner(pose.ancre, ref);
        });

        // Sur le document : un élève qui relâche hors du tableau doit quand même finir son
        // geste, sinon le surlignage reste collé et le glissement suivant part de travers.
        const finir = () => {
          if (!enCours) return;
          enCours = false;
          tableau.classList.remove('gr-pointe');
          surligner(null, null);
        };
        // Le relâchement s'écoute sur le DOCUMENT et pas sur le tableau, sinon un élève qui
        // relâche en dehors reste en glissement. Mais `brancher` est rappelé à chaque redessin :
        // sans ce détachement, on empilerait un écouteur de plus sur le document à chaque clic
        // de la page, et ils survivraient tous à la vue qui les a posés.
        if (detacherPointage) detacherPointage();
        document.addEventListener('mouseup', finir);
        detacherPointage = () => document.removeEventListener('mouseup', finir);

        tableau.addEventListener('mouseleave', () => { if (!enCours) surligner(null, null); });
      }

      z.querySelector('[data-gr-verifier]')?.addEventListener('click', () => {
        const lignes = api.lignes();
        etat.juge = juger(lignes, etat.cases);
        const fini = Object.values(etat.juge).every((x) => x === 'ok');
        etat.valide = fini ? Date.now() : null;
        api.sauver(); api.redessiner();
        if (api.toast) api.toast(fini ? 'Formules justes.' : 'Formules à revoir.');
      });
    },
  };
}
