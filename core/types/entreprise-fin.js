// Le BANDEAU DE FIN DE SÉANCE : le HTML du bilan (liste des groupes ✓ / ✗, « Corriger », séance suivante) pour une séance de parcours.
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 4) : le texte est celui d'avant, mot pour mot.
// Module PUR : chaque fonction reçoit l'état des jalons (`st`, `{ id: 'ok' | 'ko' | 'erreur' | 'attente' }`) et ses options
// PAR LEUR NOM, et rend du HTML. Rien n'est lu dans `ctx`, `db` ni `U` : c'est `entreprise.js` qui décide SI le bandeau
// s'affiche (élève, parcours, tout jugé), calcule `retours` (explications des questions corrigées au bilan) et
// `peutCorriger`, branche les boutons et rafraîchit la zone. `bilanComplet`, `sansFaux`, `ecransAFaire` y restent : la
// note et « Corriger » s'en servent. Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`.
// L'espace entre deux balises fait partie du HTML rendu : le bandeau doit rester identique octet pour octet (preuve du lot 9c).

import { ech } from '../ui.js';

export function groupesDuBilan(etapes, st) {
  const L = [];
  etapes.forEach((e) => {
    if (e.compte === false) return;
    const nom = e.groupe || e.titre;
    let g = L.find((x) => x.nom === nom);
    if (!g) { g = { nom, ok: true, ids: [] }; L.push(g); }
    g.ids.push(e.id);
    if (st[e.id] !== 'ok') g.ok = false;
    if (st[e.id] === 'erreur') g.erreur = true; else if (st[e.id] !== 'ok') g.faux = true;
  });
  // `etat` : 'ok', 'ko' (au moins une case fausse) ou 'erreur' (aucune fausse, mais une case que le site n'a pas pu juger).
  L.forEach((g) => { g.etat = g.ok ? 'ok' : g.faux ? 'ko' : 'erreur'; });
  return L;
}

const jalonsAVerifier = (etapes, st) => etapes.filter((e) => st[e.id] === 'erreur' && e.compte !== false);
// Ce que dit le bandeau d'un jalon que le site n'a pas pu juger : jamais « faux », jamais la cause.
export const aVerifierHtml = (etapes, st) => {
        const L = jalonsAVerifier(etapes, st);
        return L.length ? `<p class="ent-fin-petit" data-fin-averifier>${L.length > 1 ? 'Des étapes n’ont' : 'Une étape n’a'} pas pu être vérifiée${L.length > 1 ? 's' : ''} par le site :
          ${L.map((e) => ech(e.groupe || e.titre)).join(', ')}. Signale-le à ton professeur : ce n’est pas une erreur de ta part.</p>` : '';
};

// Sans le drapeau `correction` : le bandeau d'origine (06/10/2026). Tous justes → « Séance validée » et la
// séance suivante ouverte ; sinon le TITRE des jalons faux, jamais leur détail.
export function bandeauAncien(st, { etapes, suiteAuBilan, suivante, reinitialisable, retours }) {
        const faux = etapes.filter((e) => st[e.id] !== 'ok' && st[e.id] !== 'erreur');
        const aVerifier = aVerifierHtml(etapes, st);
        if (!faux.length && aVerifier) {
          // Rien de faux, mais une étape que le site n'a pas pu juger : ni « validée » ni « à corriger ».
          const S = suivante;
          return `<div class="ent-fin" role="status" data-fin="averifier"><span class="ent-fin-ico" aria-hidden="true">?</span>
            <div><b>Séance terminée.</b> Les étapes que le site a pu vérifier sont justes${S ? ` : la séance suivante, ${ech(S.code)} « ${ech(S.titre)} », est ouverte.` : '.'}
              ${aVerifier}${retours()}</div>
            <button class="btn ent-fin-btn" data-fin-quitter>Retour aux séances</button></div>`;
        }
        if (!faux.length) {
          const S = suivante;
          return `<div class="ent-fin ent-fin-ok" role="status" data-fin="ok"><span class="ent-fin-ico" aria-hidden="true">✓</span>
            <div><b>Séance validée.</b> Toutes tes étapes sont justes${S ? ` : la séance suivante, ${ech(S.code)} « ${ech(S.titre)} », est ouverte.` : '.'}${retours()}</div>
            <button class="btn ent-fin-btn" data-fin-quitter>Retour aux séances</button></div>`;
        }
        return `<div class="ent-fin ent-fin-ko" role="status" data-fin="ko"><span class="ent-fin-ico" aria-hidden="true">⚠</span>
          <div><b>Tu as tout fait, mais il reste quelque chose à corriger :</b>
            <ul>${faux.map((e) => `<li data-fin-jalon="${ech(e.id)}">${ech(e.titre)}</li>`).join('')}</ul>
            <span class="ent-fin-petit">${suiteAuBilan
              ? `Relis ta trame à ces étapes.${suivante ? ` La séance suivante, ${ech(suivante.code)} « ${ech(suivante.titre)} », est ouverte.` : ''}`
              : `Relis ta trame à ces étapes. Si tu ne trouves pas, appelle ton professeur${reinitialisable ? ' ou réinitialise ta séance' : ''}.
            La séance suivante s'ouvrira quand tout sera juste.`}</span>${aVerifier}${retours()}</div></div>`;
}
export function bandeauFin(st, { etapes, correction, premierEssai, suiteAuBilan, suivante, reinitialisable, avecQuestions,
  finFige, retours, peutCorriger }) {
        if (!correction && !premierEssai) return bandeauAncien(st, { etapes, suiteAuBilan, suivante, reinitialisable, retours });
        const G = groupesDuBilan(etapes, st);
        const tout = G.every((g) => g.ok);
        // Rien de faux, mais une ligne que le site n'a pas pu juger ('erreur') : ni « tout juste » ni « à corriger ».
        const incertain = !tout && G.every((g) => g.etat !== 'ko');
        const S = suivante;
        const [motOk, motKo] = correction ? ['juste', 'à corriger'] : ['du premier coup', 'après une erreur'];
        const liste = `<ul class="ent-fin-liste" aria-label="Résultat par étape">${G.map((g) => `<li class="${g.etat === 'ok' ? 'ent-fin-juste' : g.etat === 'ko' ? 'ent-fin-faux' : ''}" data-fin-jalon="${ech(g.ids[0])}"
          data-fin-etat="${g.etat}"><span class="ent-fin-m" aria-hidden="true">${g.etat === 'ok' ? '✓' : g.etat === 'ko' ? '✗' : '?'}</span><span>${ech(g.nom)}</span>
          <span class="ent-fin-a">${g.etat === 'ok' ? motOk : g.etat === 'ko' ? motKo : 'à vérifier'}</span></li>`).join('')}</ul>`;
        if (incertain) {
          return `<div class="ent-fin ent-fin-v2" role="status" data-fin="averifier"><div class="ent-fin-corps">
            <h2 class="ent-fin-t">Tu as fini.</h2>
            <p>Les étapes que le site a pu vérifier sont justes.${S ? ` La séance suivante, ${ech(S.code)} « ${ech(S.titre)} », est ouverte.` : ''}</p>
            ${liste}${aVerifierHtml(etapes, st)}${retours()}<div class="ent-fin-btns"><button class="btn" data-fin-quitter>Retour aux séances</button></div></div></div>`;
        }
        // Sans « Corriger » : rien ne se rouvre, la note est celle du premier essai.
        if (!correction) {
          return `<div class="ent-fin ent-fin-v2 ${tout ? 'ent-fin-ok' : 'ent-fin-ko'}" role="status" data-fin="${tout ? 'ok' : 'ko'}"><div class="ent-fin-corps">
            <h2 class="ent-fin-t">${tout ? 'Tout est juste du premier coup ✓' : 'Tu as fini : voici ce que tu as réussi du premier coup.'}</h2>
            <p>${tout ? 'Bravo.' : 'Ta note compte ton premier essai à chaque étape.'}${S ? ` La séance suivante, ${ech(S.code)} « ${ech(S.titre)} », est ouverte.` : ''}</p>
            ${liste}${aVerifierHtml(etapes, st)}${retours()}<div class="ent-fin-btns"><button class="btn" data-fin-quitter>Retour aux séances</button></div></div></div>`;
        }
        if (tout) {
          return `<div class="ent-fin ent-fin-v2 ent-fin-ok" role="status" data-fin="ok"><div class="ent-fin-corps">
            <h2 class="ent-fin-t">Tout est juste ✓</h2>
            <p>Bravo, toutes tes étapes sont justes.${S ? ` La séance suivante, ${ech(S.code)} « ${ech(S.titre)} », est ouverte.` : ''}</p>
            ${liste}${retours()}<div class="ent-fin-btns"><button class="btn" data-fin-quitter>Retour aux séances</button></div></div></div>`;
        }
        // Une question ne se rouvre jamais (seule la première réponse compte) : le bandeau le dit quand l'une est fausse.
        const questionsFausses = avecQuestions && etapes.some((e) => e.question && st[e.id] === 'ko')
          ? '<p data-fin-questions>Les réponses aux questions ne se corrigent pas : seule la première compte.</p>' : '';
        // Une case fausse sans `ecran` ne se rouvre pas (ENT-5.4 : le BL est signé, le camion est reparti). La séance
        // le dit avec `finFige` (une phrase, dans `creerEntreprise`), et le bandeau ne promet pas une correction
        // qu'aucun bouton n'offre.
        const fige = finFige && etapes.some((e) => e.compte !== false && st[e.id] === 'ko' && !e.ecran)
          ? `<p data-fin-fige>${ech(finFige)}</p>` : '';
        return `<div class="ent-fin ent-fin-v2 ent-fin-ko" role="status" data-fin="ko"><div class="ent-fin-corps">
          <h2 class="ent-fin-t">Tu as fini : voici ce qui est juste et ce qui est à corriger.</h2>
          ${fige}${questionsFausses}<p>${peutCorriger ? 'Tu peux corriger pour améliorer ta note, ou passer à la séance suivante'
            : 'Tu peux passer à la séance suivante'}${S ? ` (${ech(S.code)}, déjà ouverte)` : ''}.</p>
          ${liste}${aVerifierHtml(etapes, st)}${retours()}<div class="ent-fin-btns">${peutCorriger ? `<button class="btn btn-p ent-fin-corriger" data-fin-corriger>Corriger</button>
            <span class="ent-fin-gain">Corriger améliore ta note.</span>` : ''}
            <button class="btn" data-fin-quitter>Retour aux séances</button></div></div></div>`;
}
