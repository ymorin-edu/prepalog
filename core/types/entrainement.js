// Type « entraînement » — un quiz qui se joue question par question.
//
// Pourquoi un type de plus à côté de `qcm.js`, et pas un réglage dedans : les deux ne
// servent pas au même moment de la séance. Le QCM affiche ses questions d'un bloc et
// corrige à la fin : c'est une vérification de connaissances, on relit, on revient en
// arrière. L'entraînement, lui, pose une question, corrige tout de suite, explique, et
// passe à la suivante. On y revient dix fois, et les valeurs changent à chaque fois.
//
// Quatre écrans : rappel, jeu, bilan, classement.
//
//   rappel     — la fiche mémo avant de commencer. L'élève la lit, c'est le moment où il
//                apprend ; ensuite il n'y a plus d'aide, sinon elle est prise par réflexe.
//   jeu        — une question, quatre choix, correction immédiate et explication.
//   bilan      — score, temps, et de quoi recommencer.
//   classement — par score, puis par temps à égalité. Mon groupe, ou tous les groupes.
//
// Le score part dans le Suivi de classe par `ctx.enregistrer`, comme tout autre module :
// le barème de l'activité vaut le nombre de questions, donc 20 questions font une note
// sur 20 sans conversion.
//
// Deux points de robustesse, qui viennent de défauts constatés à l'écran :
//   — l'écran n'est redessiné qu'au changement de question. La correction est posée
//     dans la page en place, et le focus va sur « Suivant » : un élève au clavier
//     enchaîne Entrée sans jamais remonter en haut de page (alerte n° 30).
//   — la calculette est décrochée dès que l'activité quitte la page. Elle est posée sur
//     <body>, donc elle survivrait au changement d'écran si personne ne l'enlevait.

import { ech, toast } from '../ui.js';
import { B } from '../backend.js';
import { melangerQuestionsFixes } from '../questions.js';
import { monterCalculette, demonterCalculette } from '../calculette.js';

// Nom affiché dans un classement lu par toutes les classes : prénom et initiale.
// Le classement est le seul écran de Prepalog où le nom d'un élève est lu par des élèves
// d'un autre groupe ; l'initiale suffit à se reconnaître et en montre le moins possible.
//
// Et encore faut-il que l'élève l'ait demandé : par défaut une ligne de classement ne
// porte aucun nom. Un élève en difficulté ne doit pas avoir à choisir entre s'entraîner et
// être vu dernier par trois classes — alors il s'entraîne, et s'affiche s'il en a envie.
function nomCourt(profil) {
  const p = (profil?.prenom || '').trim();
  const n = (profil?.nom || '').trim();
  return p ? (n ? `${p} ${n[0].toUpperCase()}.` : p) : (n || 'Élève');
}

export function minSec(secondes) {
  if (secondes === null || secondes === undefined || !isFinite(secondes)) return '—';
  const s = Math.max(0, Math.round(secondes));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Classement : score décroissant, puis temps croissant. Un temps absent passe en dernier,
// sinon un enregistrement ancien sans chronomètre coifferait tout le monde.
export function classer(lignes) {
  return [...lignes]
    .filter((l) => l && typeof l.score === 'number')
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ta = isFinite(a.temps) ? a.temps : Infinity;
      const tb = isFinite(b.temps) ? b.temps : Infinity;
      return ta - tb;
    });
}

// Un résultat remplace le précédent seulement s'il est meilleur : plus de points, ou
// autant de points en moins de temps.
export function meilleurQue(neuf, ancien) {
  if (!ancien || typeof ancien.score !== 'number') return true;
  if (neuf.score !== ancien.score) return neuf.score > ancien.score;
  const ta = isFinite(ancien.temps) ? ancien.temps : Infinity;
  return (isFinite(neuf.temps) ? neuf.temps : Infinity) < ta;
}

export function creerEntrainement({
  rappel = [],
  generateurs = null,
  questions = null,
  calculette = false,
  classement = true,
}) {
  if (!generateurs && !questions) throw new Error('Entraînement : ni générateurs ni questions.');
  const nbQuestions = generateurs ? generateurs.length : questions.length;

  // Des générateurs : chaque tentative retire des valeurs neuves. Des questions figées :
  // on mélange l'ordre des questions et celui des réponses.
  function tirerQuestions() {
    return generateurs ? generateurs.map((f) => f()) : melangerQuestionsFixes(questions);
  }

  return {
    nbQuestions,

    rendre(hote, ctx) {
      const chemin = `communs/classement-${ctx.meta.id}`;
      const estEleve = ctx.profil?.role === 'eleve';
      let jeu = null;          // { qs, i, score, repondu, choisi, depart }
      let ongletClassement = 'groupe';

      if (calculette) monterCalculette();

      // L'activité n'a aucun point de sortie à elle : c'est le site qui remplace la page
      // quand l'élève revient à l'accueil ou se déconnecte. Sans ce guetteur, la
      // calculette — posée sur <body> — flotterait encore sur l'écran suivant, et
      // l'écouteur clavier s'empilerait à chaque ouverture d'un module.
      const obs = new MutationObserver(() => {
        if (hote.isConnected) return;
        if (calculette) demonterCalculette();
        document.removeEventListener('keydown', auClavier);
        obs.disconnect();
      });
      obs.observe(document.body, { childList: true, subtree: true });

      // ------------------------------------------------------------------ rappel
      async function vueRappel() {
        const deja = estEleve ? await ctx.lireScore().catch(() => null) : null;
        hote.innerHTML = `
          <div class="panneau">
            ${deja && typeof deja.meilleur === 'number'
              ? `<div class="avis avis-ok">Votre meilleur résultat : <strong>${deja.meilleur} / ${nbQuestions}</strong>
                   ${deja.tentatives ? `· ${deja.tentatives} tentative${deja.tentatives > 1 ? 's' : ''}` : ''}</div>`
              : ''}
            ${rappel.length ? `
              <div class="qz-rappel">
                <h2>Rappel</h2>
                <ul>${rappel.map((r) => `<li>${ech(r)}</li>`).join('')}</ul>
              </div>` : ''}
            <p class="note">${nbQuestions} questions, correction immédiate.
              ${generateurs ? 'Les nombres changent à chaque tentative.' : 'L\'ordre change à chaque tentative.'}
              ${classement ? ' Le temps est chronométré : à égalité de points, le plus rapide passe devant au classement.' : ''}</p>
            <div class="rangee">
              <button class="btn btn-p" id="qzCommencer" type="button">Commencer</button>
              ${classement ? `<button class="btn btn-s" id="qzVoirClassement" type="button">Voir le classement</button>` : ''}
            </div>
            ${!estEleve ? `<p class="note">Vous êtes connecté comme enseignant : vous pouvez jouer le quiz,
              aucun score ne sera enregistré.</p>` : ''}
          </div>`;
        hote.querySelector('#qzCommencer').addEventListener('click', demarrer);
        hote.querySelector('#qzVoirClassement')?.addEventListener('click', () => vueClassement());
      }

      function demarrer() {
        jeu = { qs: tirerQuestions(), i: 0, score: 0, repondu: false, choisi: null, depart: Date.now() };
        vueQuestion();
      }

      // --------------------------------------------------------------------- jeu
      function vueQuestion() {
        const q = jeu.qs[jeu.i];
        const n = jeu.qs.length;
        hote.innerHTML = `
          <div class="panneau">
            <div class="qz-tete">
              <span>Question ${jeu.i + 1} / ${n}</span>
              <span class="note">Score : ${jeu.score} / ${jeu.i}</span>
            </div>
            <div class="qz-barre"><i style="width:${Math.round((jeu.i / n) * 100)}%"></i></div>
            <div class="qz-enonce">${ech(q.enonce)}</div>
            <div class="qz-choix">
              ${q.choix.map((c, j) => `<button class="qz-opt" type="button" data-j="${j}">
                 <span class="qz-touche">${j + 1}</span>${ech(c)}</button>`).join('')}
            </div>
            <div class="qz-retour" id="qzRetour" aria-live="polite"></div>
            <div class="rangee" id="qzSuite"></div>
            <p class="note">Au clavier : touches 1 à ${q.choix.length} pour répondre, puis Entrée pour continuer.</p>
          </div>`;
        hote.querySelectorAll('.qz-opt').forEach((b) =>
          b.addEventListener('click', () => repondre(Number(b.dataset.j), false)));
        // Le premier choix porte le focus : l'élève au clavier n'a pas à aller le chercher.
        hote.querySelector('.qz-opt')?.focus();
      }

      // `parClavier` sert à ne déplacer le focus que si l'élève est au clavier. Au
      // premier geste de souris, déplacer le focus fait sauter la page sous le curseur.
      function repondre(j, parClavier) {
        if (!jeu || jeu.repondu) return;
        const q = jeu.qs[jeu.i];
        jeu.repondu = true;
        jeu.choisi = j;
        const bon = j === q.juste;
        if (bon) jeu.score++;

        hote.querySelectorAll('.qz-opt').forEach((b, k) => {
          b.disabled = true;
          if (k === q.juste) b.classList.add('juste');
          else if (k === j) b.classList.add('faux');
        });
        hote.querySelector('.qz-tete .note').textContent = `Score : ${jeu.score} / ${jeu.i + 1}`;

        const z = hote.querySelector('#qzRetour');
        z.className = 'qz-retour ' + (bon ? 'juste' : 'faux');
        z.textContent = (bon ? '✓ Bonne réponse. ' : '✗ Pas tout à fait. ') + (q.explication || '');

        const dernier = jeu.i === jeu.qs.length - 1;
        const suite = hote.querySelector('#qzSuite');
        suite.innerHTML = `<button class="btn btn-p" id="qzSuivant" type="button">${dernier ? 'Voir mon résultat' : 'Question suivante'}</button>`;
        const bouton = suite.querySelector('#qzSuivant');
        bouton.addEventListener('click', avancer);
        if (parClavier) bouton.focus();
      }

      function avancer() {
        if (jeu.i === jeu.qs.length - 1) return vueBilan();
        jeu.i++; jeu.repondu = false; jeu.choisi = null;
        vueQuestion();
      }

      function auClavier(e) {
        if (!jeu || !hote.isConnected) return;
        if (!jeu.repondu) {
          const n = Number(e.key);
          if (n >= 1 && n <= jeu.qs[jeu.i].choix.length) { e.preventDefault(); repondre(n - 1, true); }
          return;
        }
        if (e.key === 'Enter') {
          const b = hote.querySelector('#qzSuivant');
          if (b) { e.preventDefault(); b.click(); }
        }
      }
      document.addEventListener('keydown', auClavier);

      // ------------------------------------------------------------------- bilan
      async function vueBilan() {
        const temps = Math.round((Date.now() - jeu.depart) / 1000);
        const score = jeu.score, max = jeu.qs.length;
        const part = score / max;
        const mot = part >= 0.9 ? 'Excellent.' : part >= 0.7 ? 'Très bon résultat.'
          : part >= 0.5 ? "Pas mal, encore un peu d'entraînement." : 'À retravailler : recommencez, les nombres changeront.';

        hote.innerHTML = `
          <div class="panneau qz-bilan">
            <div class="qz-note">${score} / ${max}</div>
            <p class="note">en ${minSec(temps)}</p>
            <div class="avis ${part >= 0.7 ? 'avis-ok' : part >= 0.5 ? '' : 'avis-err'}">${mot}</div>
            <div class="rangee">
              <button class="btn btn-p" id="qzRecommencer" type="button">Recommencer</button>
              ${classement ? `<button class="btn btn-s" id="qzVoirClassement2" type="button">Voir le classement</button>` : ''}
              <button class="btn btn-s" id="qzRetourRappel" type="button">Revoir le rappel</button>
            </div>
            <div id="qzBandeauNom"></div>
          </div>`;
        hote.querySelector('#qzRecommencer').addEventListener('click', demarrer);
        hote.querySelector('#qzRetourRappel').addEventListener('click', () => vueRappel());
        hote.querySelector('#qzVoirClassement2')?.addEventListener('click', () => vueClassement());

        // Le score part dans le Suivi de classe. `enregistrer` ne retient que le meilleur,
        // et ne note rien pour un enseignant qui essaie le module.
        await ctx.enregistrer({ score, max, detail: { temps } });
        if (classement && estEleve) await publier(score, max, temps);
        toast(`Score : ${score} / ${max} en ${minSec(temps)}`);

        // Le choix de l'anonymat se pose ici, au moment où le résultat vient de partir :
        // c'est là que la question se pose vraiment pour l'élève.
        if (classement && estEleve) {
          const zone = hote.querySelector('#qzBandeauNom');
          const peindre = async () => {
            if (!zone.isConnected) return;
            zone.innerHTML = bandeauNom(await maLigne());
            brancherBandeau(peindre);
          };
          await peindre();
        }
      }

      // -------------------------------------------------------------- classement
      async function maLigne() {
        const lignes = await B.lireTable(chemin, 'scores');
        return lignes.find((l) => l.id === ctx.profil?.uid) || null;
      }

      async function publier(score, max, temps) {
        const uid = ctx.profil.uid;
        try {
          const ancien = await maLigne();
          // La clé de la ligne est l'uid, et elle est posée par `poserLigne`, pas portée
          // par la ligne : c'est la clé que la règle de sécurité regarde, et les deux
          // backends la rendent dans le champ `id` à la lecture. Un `id` recopié dans la
          // ligne masquerait un jour une écriture rangée à la mauvaise clé.
          //
          // Le nom n'y figure QUE si l'élève a demandé à s'attribuer son score. Par défaut
          // il n'est pas « masqué » : il n'est pas écrit du tout. C'est la seule façon
          // honnête de promettre l'anonymat sur une base que toutes les classes lisent.
          const neuf = {
            gid: ctx.groupe || '', groupe: ctx.groupeNom || ctx.groupe || '',
            score, max, temps, ts: Date.now(),
          };
          if (ancien?.nom) neuf.nom = nomCourt(ctx.profil);
          if (meilleurQue(neuf, ancien)) await B.poserLigne(chemin, 'scores', uid, neuf);
        } catch (e) {
          // Un classement qui ne s'enregistre pas ne doit pas gâcher la fin du quiz :
          // la note, elle, est déjà partie dans le suivi.
          console.warn('Classement : enregistrement impossible.', e);
        }
      }

      // S'attribuer son score, ou revenir à l'anonymat. Réversible à tout moment, et
      // revenir à l'anonymat EFFACE le nom de la base au lieu de cesser de l'afficher.
      async function basculerNom(visible) {
        const ancien = await maLigne();
        if (!ancien) return;
        const { id, _par, _parNom, _ts, nom, ...reste } = ancien;
        const neuf = visible ? { ...reste, nom: nomCourt(ctx.profil) } : reste;
        await B.poserLigne(chemin, 'scores', ctx.profil.uid, neuf);
      }

      // Le bandeau de choix, posé sous le classement et sous le bilan. Il n'apparaît qu'à
      // un élève qui a déjà un résultat enregistré : avant, il n'y a rien à attribuer.
      function bandeauNom(ligne) {
        if (!classement || !estEleve || !ligne) return '';
        // Le texte est dans un <span> : la boîte est en flex, et un <strong> laissé nu y
        // deviendrait un élément de rangée, avec un blanc de chaque côté du mot.
        return ligne.nom
          ? `<div class="avis qz-anonymat"><span>Votre prénom est affiché au classement.</span>
               <button class="btn btn-s" id="qzAnonyme" type="button">Repasser en anonyme</button></div>`
          : `<div class="avis qz-anonymat"><span>Votre résultat est <strong>anonyme</strong> : les autres
               élèves voient votre groupe et votre score, pas votre nom.</span>
               <button class="btn btn-s" id="qzMontrer" type="button">M'afficher au classement</button></div>`;
      }

      function brancherBandeau(apres) {
        hote.querySelector('#qzMontrer')?.addEventListener('click', async () => {
          await basculerNom(true); await apres();
        });
        hote.querySelector('#qzAnonyme')?.addEventListener('click', async () => {
          await basculerNom(false); await apres();
        });
      }

      async function vueClassement() {
        hote.innerHTML = `<div class="panneau"><div class="vide">Chargement du classement…</div></div>`;
        let lignes = [];
        try { lignes = await B.lireTable(chemin, 'scores'); }
        catch (e) { lignes = []; }

        const dessiner = () => {
          const mien = ctx.profil?.uid;
          const vues = classer(ongletClassement === 'groupe'
            ? lignes.filter((l) => l.gid === ctx.groupe)
            : lignes);
          hote.innerHTML = `
            <div class="qz-onglets">
              <button class="qz-onglet ${ongletClassement === 'groupe' ? 'actif' : ''}" type="button" data-o="groupe">Mon groupe</button>
              <button class="qz-onglet ${ongletClassement === 'tous' ? 'actif' : ''}" type="button" data-o="tous">Tous les groupes</button>
            </div>
            <div class="panneau">
              <p class="note">Classé par score, puis par temps à égalité : le plus rapide passe devant.
                Seul le meilleur résultat de chacun figure ici, et chacun décide d'y mettre son nom
                ou non.</p>
              ${bandeauNom(lignes.find((l) => l.id === mien))}
              ${vues.length === 0
                ? `<div class="vide">Personne n'a encore fait ce quiz${ongletClassement === 'groupe' ? ' dans ce groupe' : ''}.</div>`
                : `<table class="qz-table"><thead><tr><th class="num">Rang</th><th>Élève</th>
                     ${ongletClassement === 'tous' ? '<th>Groupe</th>' : ''}<th class="num">Score</th><th class="num">Temps</th></tr></thead>
                   <tbody>${vues.map((l, i) => `
                     <tr class="${l.id === mien ? 'qz-moi' : ''}">
                       <td class="num">${i === 0 ? '1er' : i + 1 + 'e'}</td>
                       <td>${l.nom ? ech(l.nom) : '<span class="qz-anon">Anonyme</span>'}${l.id === mien ? ' (moi)' : ''}</td>
                       ${ongletClassement === 'tous' ? `<td>${ech(l.groupe || '—')}</td>` : ''}
                       <td class="num">${l.score}${l.max ? ' / ' + l.max : ''}</td>
                       <td class="num">${minSec(l.temps)}</td>
                     </tr>`).join('')}</tbody></table>`}
              <div class="rangee">
                <button class="btn btn-p" id="qzRejouer" type="button">Refaire le quiz</button>
              </div>
            </div>`;
          hote.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => {
            ongletClassement = b.dataset.o; dessiner();
          }));
          hote.querySelector('#qzRejouer').addEventListener('click', () => vueRappel());
          // Changer d'avis recharge le tableau : la ligne de l'élève doit changer sous ses
          // yeux, sinon il ne sait pas si son choix a été pris.
          brancherBandeau(async () => { lignes = await B.lireTable(chemin, 'scores').catch(() => lignes); dessiner(); });
        };
        dessiner();
      }

      vueRappel();
    },
  };
}
