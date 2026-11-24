// Stratelog, Avant l'Hiver : les écrans (HTML), sans état ni base. Chaque fonction reçoit le contexte `C` que jeu.js
// fabrique à chaque dessin :
//   C.E      l'état de la partie (partie.js)          C.L     les lignes des élèves, { uid: objet }
//   C.moi    { uid, prof }                            C.now   l'heure du poste
//   C.id     la ville affichée (celle de l'élève, ou celle que le Seigneur regarde)
//   C.tit    ses titulaires de rôles                  C.dr    son brouillon du tour
//   C.rendu  vrai si son registre est parti (déposé, ramassé, ou dépôt clos)
//   C.ui     l'état de l'écran : onglet, fiche, placer, aideRes, ouvert, vue, choixVille
// Repris de la page d'essai validée (écrans de jeu v22 et parcours v5), une ville en vrai au lieu de « Valbrume ».

import * as R from './regles.js';
import * as P from './partie.js';
import { dessinBlason, FIGURES, TEINTES } from './blasons.js';
import { plateau, logo, bien, petitPaysan, petiteCharrette, TAILLE, casesLibres } from './dessins.js';
import { METHODES, AIDE_RES, RAPPORTE, BUTINS_LIB, CARTE_INFO, DU_ROLE, NOMS_M, UNITE, POSTES, EFFETS, NOM_SAISON, SAIS_COURT, ROMAIN, libCase, aff } from './textes.js';

export const ech = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const num = (x) => (x === '' || x === null || x === undefined || Number.isNaN(Number(x)) ? undefined : Number(x));
const { ROLES, rempli } = P;
export const mmss = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const nomDe = (C, u) => ech(C.E.noms[u] || 'un élève');
const ville = (C, id) => P.villeDe(C.E, id) || { id, nom: '?', blason: null };
const blason = (v, nom) => (v && v.blason ? dessinBlason(v.blason, nom) : '<div class="pj-vide">?</div>');
const tourTxt = (t) => (t === 0 ? 'Année de fondation · tour d’essai' : `Tour ${t} sur 7 · ${R.saisonDu(t)}`);
// La partie telle qu'on la montre : après la résolution, les réserves de la fin de saison.
const partieVue = (E) => (E.phase === 'resolu' && E.apres ? E.apres : E.partie);
const VUE_POSTE = { champ: 'champ', bucheron: 'bucheron', carriere: 'carriere', atelier: 'atelier', guet: 'guet' };

// ------------------------------------------------------------------------------------- liste « à faire » de chaque rôle
function aFaire(C, r) {
  const v = C.E.partie.etat[C.id]; const dr = C.dr; const d = P.decisionsDe(dr);
  const tot = Object.values(dr.equipes).reduce((a, n) => a + n, 0);
  const L = [];
  const achats = dr.ops.map((o, i) => [o, i]).filter(([o]) => o.sens === 'achat');
  if (r === 'I') {
    L.push({ t: `Placer toutes les équipes (${tot} sur ${R.equipesDe(v.hab)})`, ok: tot === R.equipesDe(v.hab), m: METHODES.equipes });
    L.push({ t: 'Besoin en grain de la saison', ok: rempli(dr.reg.besoin), m: METHODES.besoin, calc: true });
    L.push({ t: 'Place restante au grenier', ok: rempli(dr.reg.grenier), m: METHODES.grenier, calc: true });
    achats.forEach(([o, i]) => L.push({ t: `Quantité reçue, achat ${i + 1}`, ok: rempli(o.recu), m: METHODES.recu }));
  }
  if (r === 'M') {
    L.push({ t: 'Décider avec la ville quoi acheter ou vendre', info: true, m: 'Chaque achat ou vente coûte 1 point d’action. Les prix de la saison sont affichés au Marché.' });
    dr.ops.forEach((o, i) => {
      const nom = `${o.sens === 'achat' ? 'achat' : 'vente'} ${i + 1}`;
      L.push({ t: `Charrettes, ${nom}`, ok: rempli(o.ch), m: METHODES.charrettes, calc: true });
      L.push({ t: `${o.sens === 'achat' ? 'Coût' : 'Recette'}, ${nom}`, ok: rempli(o.montant), m: o.sens === 'achat' ? METHODES.cout : METHODES.recette, calc: true });
    });
  }
  if (r === 'O') {
    L.push({ t: 'Choisir les chantiers et leur case', info: true, m: METHODES.chantiers });
    const touche = d.chantiers.length || [...d.achats, ...d.ventes].some((x) => x.m !== 'grain');
    if (touche) L.push({ t: 'Place restante à la halle', ok: rempli(dr.reg.halle), m: METHODES.halle, calc: true });
    else L.push({ t: 'Place restante à la halle : pas demandée ce tour (aucun bois, pierre, drap ni chantier)', info: true });
  }
  if (r === 'B') {
    if (C.E.partie.tour >= R.TOUR_VOL) L.push({ t: 'Décider d’un larcin (ou non)', info: true, m: METHODES.coup });
    L.push({ t: 'Reste en caisse', ok: rempli(dr.reg.caisse), m: METHODES.caisse, calc: true });
    const autres = ['I', 'M', 'O'].every((x) => aFaire(C, x).every((it) => it.info || it.ok));
    L.push({ t: 'Vérifier que toute la ville a fini', ok: autres, m: 'Toutes les listes des autres rôles doivent être cochées. Une case vide compte fausse.' });
    L.push({ t: 'Déposer le registre', ok: !!C.rendu });
  }
  return L;
}
function listeRole(C, r) {
  const L = aFaire(C, r); const a = L.filter((x) => !x.info); const n = a.filter((x) => x.ok).length;
  const aide = C.E.reglages.aide;
  return `<div class="afaire"><div class="ligne" style="justify-content:space-between"><b>${C.peut(r) ? 'Ta liste du tour' : `La liste ${DU_ROLE[r]}`}</b><span class="note">${n} sur ${a.length}</span></div>
    <ul>${L.map((it, i) => `<li class="${it.info ? 'info' : it.ok ? 'fait' : ''}"><span class="coche" aria-hidden="true">${it.info ? '•' : it.ok ? '✓' : ''}</span>
      <div>${it.info ? '' : `<span class="sr">${it.ok ? 'Fait : ' : 'À faire : '}</span>`}${ech(it.t)}${it.m && aide ? `<details id="m-${r}-${i}" ${C.ui.ouvert[`m-${r}-${i}`] ? 'open' : ''}><summary>Comment faire ?</summary><p>${ech(it.m)}</p>${it.calc && C.E.reglages.calc ? '<button type="button" class="petit" data-calc>Ouvrir la calculatrice</button>' : ''}</details>` : ''}</div></li>`).join('')}</ul></div>`;
}

// --------------------------------------------------------------------------------------------- en-tête et réserves
const qBtn = (C, k) => `<button type="button" class="q-res" data-aide-res="${k}" aria-expanded="${C.ui.aideRes === k}" aria-label="À quoi ça sert ?">?</button>`;
function bulleRes(C, k) {
  if (C.ui.aideRes !== k) return '';
  const A = AIDE_RES[k];
  return `<div class="bulle-res" role="dialog" aria-label="${A.titre}"><div class="ligne" style="justify-content:space-between"><b>${A.titre}</b><button type="button" class="petit" data-aide-res="${k}" aria-label="Fermer">✕</button></div>
    <div class="rubrique">À quoi ça sert</div><ul>${A.sert.map((x) => `<li>${x}</li>`).join('')}</ul>
    <div class="rubrique">Comment en gagner</div><ul>${A.gagner.map((x) => `<li>${x}</li>`).join('')}</ul>
    <p class="attention">${A.attention}</p></div>`;
}
function enTeteVille(C) {
  const E = C.E; const v = partieVue(E).etat[C.id]; const t = E.partie.tour; const V = ville(C, C.id);
  const pa = E.phase === 'tour' && C.dr ? P.paUtilises(C.dr) : 0;
  const jetons = Array.from({ length: Math.max(R.PA, pa) }, (_, i) => `<i class="${i < pa ? (i >= R.PA ? 'trop' : 'pris') : ''}"></i>`).join('');
  return `<div class="tete">
    <div class="bl">${blason(V)}</div>
    <div><div class="nomville">${ech(V.nom)}</div><div class="saison">${tourTxt(t)}</div></div>
    <div class="droite ligne" style="justify-content:flex-end;gap:16px">
      ${E.phase === 'tour' ? `<div><div class="etiq">${logo('sablier', 16)} Points d’action</div><div class="pa" aria-label="${pa} sur ${R.PA} utilisés">${jetons}</div></div>
      <div class="chrono" data-chrono><b>${mmss(P.restant(E, C.now))}</b><small><span></span></small></div>` : ''}
    </div></div>
  <div class="reserves">
    <div class="res">${bulleRes(C, 'deniers')}${logo('deniers', 34, 'Deniers')}<div><span class="etiq">Caisse${qBtn(C, 'deniers')}</span><b>${v.deniers} deniers</b></div></div>
    <div class="res">${bulleRes(C, 'grain')}${logo('grain', 34, 'Grenier')}<div><span class="etiq">Grenier${qBtn(C, 'grain')}</span><b>${v.grain} / ${v.capGrain} sacs</b>
      <div class="jauge"><span class="j-grain" style="width:${Math.min(100, v.grain / v.capGrain * 100)}%"></span></div></div></div>
    <div class="res">${bulleRes(C, 'halle')}${logo('halle', 34, 'Halle')}<div><span class="etiq">Halle${qBtn(C, 'halle')}</span><b>${v.bois + v.pierre + v.drap} / ${v.capHalle}</b>
      <div class="jauge">${['bois', 'pierre', 'drap'].map((m) => `<span class="j-${m}" style="width:${Math.min(100, v[m] / v.capHalle * 100)}%"></span>`).join('')}</div>
      <div class="legende">${['bois', 'pierre', 'drap'].map((m) => `<span>${logo(m, 18)}${v[m]} ${m}</span>`).join('')}</div></div></div>
    <div class="res">${bulleRes(C, 'habitants')}${logo('habitants', 34, 'Habitants')}<div><span class="etiq">Habitants${qBtn(C, 'habitants')}</span><b>${v.hab}</b><span class="note">${R.equipesDe(v.hab)} équipes · ${v.log} logements</span></div></div>
    <div class="res">${bulleRes(C, 'reputation')}${logo('reputation', 34, 'Réputation')}<div><span class="etiq">Réputation${qBtn(C, 'reputation')}</span><b>${v.rep}</b><span class="note">score ${R.score(v)}</span></div></div>
  </div>`;
}

// ------------------------------------------------------------------------------------------------- onglets des rôles
const dis = (C, r) => (C.peut(r) ? '' : 'disabled');
const caseNum = (C, id, label, val, r) => `<div class="case"><label for="${id}">${label}</label><input type="number" id="${id}" value="${ech(val)}" ${dis(C, r)} inputmode="numeric"></div>`;
const verrou = (C, r) => {
  if (C.rendu || C.peut(r)) return '';
  const qui = C.tit && C.tit.role[r];
  return `<p class="verrou">Ces cases sont celles ${DU_ROLE[r]}${qui && !C.moi.prof ? ` (${nomDe(C, qui)})` : ''} : tu les vois, tu ne les remplis pas.</p>`;
};

function ongletI(C) {
  const E = C.E; const v = E.partie.etat[C.id]; const s = R.saisonDu(E.partie.tour); const e = C.dr.equipes;
  const tot = Object.values(e).reduce((a, n) => a + n, 0); const dispo = R.equipesDe(v.hab); const libres = dispo - tot;
  const d = P.decisionsDe(C.dr);
  const max = P.postesMax(v, s);
  const aDecharger = v.quai.length + v.aRelivrer.length + d.achats.reduce((a, x) => a + x.charrettes, 0);
  const recolte = () => { let r = e.champ; let q = 0; for (let k = 0; k < v.bats.champ; k++) { const n = Math.min(R.equipesParChamp(s), r); r -= n; q += R.recolteParChamp(s, null, n); } return q; };
  const effet = {
    champ: () => R.equipesParChamp(s) ? `${bien('grain', 22)}<span>Ce tour : <b>${recolte()} sacs</b> récoltés</span>` : `<span>Rien à récolter cette saison : les champs dorment.</span>`,
    dech: () => `${bien('charrette', 22)}<span><b>${Math.min(e.dech, aDecharger)} charrette${Math.min(e.dech, aDecharger) > 1 ? 's' : ''}</b> déchargée${Math.min(e.dech, aDecharger) > 1 ? 's' : ''} sur ${aDecharger}${e.dech < aDecharger ? ' : le reste attend au quai' : ''}</span>`,
    bucheron: () => `${bien('bois', 22)}<span>Ce tour : <b>${20 * e.bucheron} bois</b></span>`,
    carriere: () => s === 'Hiver' ? '<span>La carrière est gelée l’hiver.</span>' : `${bien('pierre', 22)}<span>Ce tour : <b>${15 * e.carriere} pierre</b></span>`,
    atelier: () => `${bien('drap', 22)}<span>Ce tour : <b>${8 * e.atelier} drap</b></span>`,
    guet: () => `${bien('cle', 22)}<span>${e.guet ? '<b>Gardée</b> : arrête les voleurs et évite l’incendie (solde 10 deniers)' : 'Pas gardée : elle ne protège rien ce tour'}</span>`,
  };
  const regle = { champ: `${v.bats.champ} champs · ${R.equipesParChamp(s) ? `${R.equipesParChamp(s)} équipe${R.equipesParChamp(s) > 1 ? 's' : ''} par champ cette saison` : 'aucune équipe cette saison'}`,
    dech: '1 équipe décharge 1 charrette', bucheron: '1 équipe = 20 bois', carriere: '1 équipe = 15 pierre, rien l’hiver', atelier: '1 équipe = 8 drap', guet: '1 équipe garde la tour' };
  const postes = Object.entries(POSTES).filter(([k]) => k === 'champ' || k === 'dech' || (k === 'guet' ? v.bats.guet : v.bats[k])).map(([k, p]) => {
    const places = k === 'dech' ? Math.max(aDecharger, e.dech) : Math.max(max[k], e[k]);
    const pions = Array.from({ length: places }, (_, i) => i < e[k] ? petitPaysan(k, 26) : '<span class="place-vide" aria-hidden="true"></span>').join('');
    const [w, h] = TAILLE[k] || [1, 1];
    const vue = k === 'dech' ? `<div class="vue-poste quai">${bien('charrette', 70)}</div>` : `<div class="vue-poste"><svg viewBox="0 0 ${w * 100} ${h * 100}" aria-hidden="true"><use href="#d-${VUE_POSTE[k]}"/></svg></div>`;
    return `<article class="poste ${e[k] ? 'occupe' : ''}"><header>${petitPaysan(k, 30)}<h4>${p.nom}</h4><output aria-label="équipes placées">${e[k]}</output></header>
      ${vue}<p class="regle">${regle[k]}</p>
      <div class="pions">${pions}</div>
      <p class="effet-poste">${effet[k]()}</p>
      <div class="pas"><button type="button" data-eq="${k}" data-pas="-1" aria-label="Retirer une équipe : ${p.nom}" ${dis(C, 'I')} ${e[k] ? '' : 'disabled'}>− Retirer</button>
        <button type="button" class="primaire" data-eq="${k}" data-pas="1" aria-label="Ajouter une équipe : ${p.nom}" ${dis(C, 'I')} ${libres > 0 && e[k] < max[k] ? '' : 'disabled'}>+ Placer</button></div></article>`;
  }).join('');
  const reserveEq = `<div class="pool ${libres ? '' : 'vide'}"><div class="pool-texte">${libres ? `<b>${libres} équipe${libres > 1 ? 's' : ''} à placer</b> sur ${dispo}` : `<b>Toutes les équipes sont placées</b> (${dispo})`}<span class="note">10 habitants = 1 équipe. Une équipe libre ne produit rien.</span></div>
    <div class="pool-pions">${Array.from({ length: Math.max(0, libres) }, () => `<span class="libre">${petitPaysan('dech', 30)}</span>`).join('')}</div></div>`;
  // Réception : un bon de livraison par achat.
  const iE = R.achatEnEcart(v, d.achats, E.partie.tour, E.partie.ecart[C.id]);
  let recep = ''; let ia = -1; let nb = 0;
  C.dr.ops.forEach((o, i) => {
    if (o.sens !== 'achat') return;
    const valide = NOMS_M[o.m] && num(o.q) > 0; if (valide) ia++;
    const l = valide && num(o.ch) > 0 ? R.livrer(d.achats[ia], { tour: E.partie.tour, ecart: ia === iE }) : null;
    recep += `<div class="bon livraison" style="--penche:${nb++ % 2 ? 0.6 : -0.5}deg"><div class="bon-tete">${bien(o.m, 34)}<div><div class="bon-titre">Bon de livraison · achat ${i + 1}</div><div class="note">${valide ? `commandé : ${num(o.q)} ${UNITE[o.m]}` : 'le Marchand n’a pas encore rempli ce bon'}</div></div></div>
      ${l ? `<div class="convoi-arrive"><span class="note">Charrettes arrivées au quai :</span>${l.charrettes.map(petiteCharrette).join('')}${l.reste ? `<span class="note">${l.reste} n’ont pas tenu dans les charrettes</span>` : ''}</div>` : ''}
      ${caseNum(C, `recu${i}`, 'Quantité reçue', o.recu, 'I')}</div>`;
  });
  const quai = v.quai.length ? `<div class="convoi-arrive"><span class="note">Déjà au quai depuis le tour précédent :</span>${v.quai.map(petiteCharrette).join('')}</div>` : '';
  const reception = recep ? `<h3>Réception au quai</h3><div class="bons">${recep}</div>
    <label class="tampon-reserve"><input type="checkbox" id="reserve" ${C.dr.reserve ? 'checked' : ''} ${dis(C, 'I')}><span><b>Émettre une réserve</b><small>Coche si une livraison ne correspond pas au bon : il manque des marchandises.</small></span></label>` : '';
  const mvt = C.dr.ops.map((o, i) => [o, i]).filter(([o]) => o.m === 'grain' && num(o.q) > 0)
    .map(([o, i]) => `<li>${o.sens === 'achat' ? 'entre' : 'sort'} : <b>${num(o.q)} sacs</b> (${o.sens === 'achat' ? 'achat' : 'vente'} ${i + 1})</li>`).join('');
  const greniers = `<h3>Le grenier</h3><div class="grenier-reg">
    <div class="g-carte"><div class="g-tete">${logo('habitants', 30)}<b>Les bouches à nourrir</b></div>
      <p><b>${v.hab}</b> habitants · saison : <b>${s.toLowerCase()}</b>${s === 'Hiver' ? ' <span class="pastille-hiver">l’hiver, on mange une fois et demie plus</span>' : ''}</p>
      ${caseNum(C, 'besoin', 'Besoin en grain de la saison', C.dr.reg.besoin, 'I')}</div>
    <div class="g-carte"><div class="g-tete"><svg viewBox="0 0 200 100" width="64" height="32" aria-hidden="true"><use href="#d-grenier"/></svg><b>Le grenier</b></div>
      <div class="jauge-grenier" aria-label="${v.grain} sacs sur ${v.capGrain} places"><span style="width:${Math.min(100, v.grain / v.capGrain * 100)}%"></span><em>${v.grain} sacs en stock · ${v.capGrain} places</em></div>
      <ul class="mvt">${mvt || '<li class="note">Aucun achat ni vente de grain ce tour.</li>'}</ul>
      ${caseNum(C, 'grenier', 'Place restante au grenier', C.dr.reg.grenier, 'I')}</div></div>`;
  return `<div class="role">${verrou(C, 'I')}${C.rendu ? '' : listeRole(C, 'I')}
    <h3>Les équipes</h3>${reserveEq}
    <p class="note">Tu peux aussi cliquer un bâtiment sur le plateau.</p><div class="postes-cartes">${postes}</div>
    ${quai}${v.aRelivrer.length ? `<p class="note">Relivraison annoncée : ${v.aRelivrer.map((x) => `${x.q} ${UNITE[x.m]}`).join(', ')} (1 charrette).</p>` : ''}
    ${reception}
    <div class="registre reg-i"><span class="etiq">Registre de l’Intendant</span>${greniers}</div></div>`;
}

function ongletM(C) {
  const E = C.E; const s = R.saisonDu(E.partie.tour); const v = E.partie.etat[C.id];
  const pa = R.PA - P.paUtilises(C.dr);
  const caisses = Object.keys(NOMS_M).map((m) => {
    const p = R.prix(m, s); const base = R.PRIX[m];
    const tendance = m === 'grain' ? (p < base ? 'moins cher cette saison' : p > base ? 'plus cher cette saison' : 'prix ordinaire') : 'prix fixe';
    return `<div class="caisse">
      <div class="ardoise"><span>${p}</span><small>denier${p > 1 ? 's' : ''} l’unité</small></div>
      <div class="marchandise">${bien(m, 84)}</div>
      <div class="nom-m">${m === 'grain' ? 'Grain' : m === 'bois' ? 'Bois' : m === 'pierre' ? 'Pierre' : 'Drap'}</div>
      <div class="note">${tendance}</div>
      <div class="note">Dans ta ville : <b>${v[m]}</b></div>
      ${C.peut('M') ? `<div class="ligne"><button type="button" class="petit" data-ajout-op="achat" data-m="${m}" ${pa > 0 ? '' : 'disabled'}>Acheter</button><button type="button" class="petit" data-ajout-op="vente" data-m="${m}" ${pa > 0 && v[m] > 0 ? '' : 'disabled'}>Vendre</button></div>` : ''}
    </div>`;
  }).join('');
  const bons = C.dr.ops.map((o, i) => {
    const n = num(o.ch) > 0 ? Math.min(12, num(o.ch)) : 0;
    return `<div class="bon ${o.sens}" style="--penche:${(i % 3 - 1) * 0.7}deg">
      <div class="bon-tete">${bien(o.m, 34)}<div><div class="bon-titre">Bon ${o.sens === 'achat' ? 'd’achat' : 'de vente'} n° ${i + 1}</div><div class="note">${o.m} · ${R.prix(o.m, s)} deniers l’unité</div></div>
        ${C.peut('M') ? `<button type="button" class="petit" data-retirer-op="${i}" aria-label="Déchirer le bon n° ${i + 1}">Déchirer</button>` : ''}</div>
      <div class="bon-lignes">
        <label for="q${i}">Quantité</label><input type="number" id="q${i}" value="${ech(o.q)}" ${dis(C, 'M')}>
        <label for="ch${i}">Charrettes</label><div class="ligne"><input type="number" id="ch${i}" value="${ech(o.ch)}" ${dis(C, 'M')}><span class="convoi" aria-hidden="true">${Array.from({ length: n }, () => bien('charrette', 26)).join('')}${num(o.ch) > 12 ? '…' : ''}</span></div>
        <label for="mt${i}">${o.sens === 'achat' ? 'Coût, transport compris' : 'Recette, transport déduit'}</label><input type="number" id="mt${i}" value="${ech(o.montant)}" ${dis(C, 'M')}>
      </div>
      ${o.sens === 'vente' ? `<p class="note">Dans ta ville : ${v[o.m]} ${UNITE[o.m]}</p>` : ''}
      <div class="sceau" aria-hidden="true">${o.sens === 'achat' ? 'A' : 'V'}</div></div>`;
  }).join('');
  return `<div class="role">${verrou(C, 'M')}${C.rendu ? '' : listeRole(C, 'M')}
    <div class="etal">
      <div class="auvent" aria-hidden="true"></div>
      <div class="etal-titre"><h3>Le Marché</h3><span>Prix ${NOM_SAISON[s]}</span></div>
      <div class="caisses">${caisses}</div>
      <div class="charretier">${bien('charrette', 40)}<div><b>Le charretier</b><br>20 unités au plus par charrette · ${R.COUT_CHARRETTE} deniers la charrette</div>
        <div class="pa-rappel">${logo('sablier', 22)} ${pa > 0 ? `${pa} point${pa > 1 ? 's' : ''} d’action restant${pa > 1 ? 's' : ''}` : 'plus de point d’action'}</div></div>
    </div>
    ${bons ? `<h3>${C.peut('M') ? 'Tes bons de commande' : 'Les bons de commande'}</h3><div class="bons">${bons}</div>` : `<p class="note">${C.peut('M') ? 'Choisis une marchandise sur l’étal. Chaque bon coûte 1 point d’action.' : 'Aucun bon de commande pour l’instant.'}</p>`}</div>`;
}

const chip = (n, q, lib, cl = '') => q ? `<span class="tuile ${cl}">${bien(n, 30)}<b>${q}</b><small>${lib}</small></span>` : '';
function ongletO(C) {
  const E = C.E; const v = E.partie.etat[C.id]; const t = E.partie.tour; const plan = E.plans[C.id] || [];
  const cartes = Object.entries(R.BATIMENTS).map(([k, B]) => {
    const n = C.dr.chantiers.filter((x) => x === k).length;
    let pourquoi = '';
    if (B.unique && (v.bats[k] || v.enCours.includes(k))) pourquoi = 'déjà bâti';
    else if (B.unique && n) pourquoi = '';
    else if (k === 'nef' && !v.bats.choeur) pourquoi = 'après le chœur';
    else if (k === 'chancellerie' && t < R.TOUR_CHANCELLERIE) pourquoi = `à partir du tour ${R.TOUR_CHANCELLERIE}`;
    else if (k !== 'nef' && !casesLibres(k, plan, C.dr.places).length) pourquoi = 'plus de case libre';
    const [w, h] = TAILLE[k] || [1, 1];
    const boutons = C.peut('O') && !(B.unique && n) ? `<button type="button" class="primaire" data-bat="${k}">${logo('marteau', 18)} Lancer le chantier</button>` : '';
    const retirer = n && C.peut('O') ? `<button type="button" data-debat="${k}">Retirer${n > 1 ? ` (${n})` : ''}</button>` : n ? `<span class="note">${n} lancé${n > 1 ? 's' : ''}</span>` : '';
    return `<article class="chantier ${n ? 'choisi' : ''} ${pourquoi ? 'ferme' : ''}">
      <header><h4>${B.nom}</h4><span class="prestige" title="points au score de la ville">+${B.pts}<small>pts</small></span></header>
      <div class="vue-bat"><svg viewBox="0 0 ${w * 100} ${h * 100}" role="img" aria-label="${B.nom}"><use href="#d-${k}"/></svg>
        ${v.bats[k] ? `<span class="possede">tu en as ${v.bats[k]}</span>` : ''}${n ? `<span class="lance">${n > 1 ? `${n} lancés` : 'lancé'}</span>` : ''}
        ${pourquoi ? `<span class="tampon">${pourquoi}</span>` : ''}</div>
      <div class="rubrique">Il coûte</div>
      <div class="cout-bat">${chip('deniers', B.d, 'deniers')}${chip('bois', B.b, 'bois')}${chip('pierre', B.p, 'pierre')}${chip('sablier', 1, 'action', 'pa')}</div>
      <div class="rubrique">Il rapporte</div>
      <ul class="effet">${RAPPORTE[k].map(([l, x]) => `<li>${l ? bien(l, 24) : '<span class="puce"></span>'}<span>${x}</span></li>`).join('')}</ul>
      ${pourquoi ? '' : `<div class="ligne actions">${boutons}${retirer}</div>`}</article>`;
  }).join('');
  return `<div class="role">${verrou(C, 'O')}${C.rendu ? '' : listeRole(C, 'O')}
    <div class="chantiers-tete"><h3>Les chantiers</h3><p class="note">« Lancer le chantier » te demande ensuite de choisir sa case sur le plateau. Le chantier se paie au dépôt du registre et le bâtiment est achevé à la fin de la saison, sauf famine.${v.enCours.length ? ` <b>En cours depuis la saison passée :</b> ${v.enCours.map((k) => R.BATIMENTS[k].nom).join(', ')}.` : ''}</p></div>
    <div class="chantiers">${cartes}</div>
    <div class="registre"><span class="etiq">Registre du Maître d’œuvre</span>${caseNum(C, 'halle', 'Place restante à la halle', C.dr.reg.halle, 'O')}</div></div>`;
}

function ongletB(C) {
  const E = C.E; const t = E.partie.tour; const v = E.partie.etat[C.id]; const dr = C.dr; const c = dr.coup;
  let larcin;
  if (t < R.TOUR_VOL) larcin = `<div class="larcin-ferme">${bien('cle', 48)}<div><b>Le larcin s’ouvre au tour ${R.TOUR_VOL}.</b><span class="note">D’ici là, les villes apprennent à se connaître.</span></div></div>`;
  else {
    const villes = E.villes.filter((x) => x.id !== C.id).map((x) => { const guet = E.partie.etat[x.id].bats.guet;
      return `<button type="button" class="cible-ville ${c && c.cible === x.id ? 'choisie' : ''}" data-cible="${x.id}" ${dis(C, 'B')} aria-pressed="${!!(c && c.cible === x.id)}"><span class="bl">${blason(x)}</span><b>${ech(x.nom)}</b>${guet ? '<span class="guet">a une tour de guet</span>' : '<span class="note">pas de tour de guet</span>'}</button>`; }).join('');
    const butins = BUTINS_LIB.map(([k, lib, ic]) => `<button type="button" class="carte-butin ${c && c.butin === k ? 'choisie' : ''}" data-butin="${k}" ${dis(C, 'B')} aria-pressed="${!!(c && c.butin === k)}">${bien(ic, 44)}<span>${lib}</span></button>`).join('');
    larcin = `<label class="tampon-reserve larcin-oui"><input type="checkbox" id="coup" ${c ? 'checked' : ''} ${dis(C, 'B')}><span><b>Tenter un larcin ce tour</b><small>Coûte 1 point d’action et 20 deniers. Si la ville visée a une tour de guet gardée, ton voleur est pris : réputation −2.</small></span></label>
      ${c ? `<h4 class="etape">1. La ville visée</h4><div class="cibles">${villes}</div><h4 class="etape">2. Le butin</h4><div class="butins">${butins}</div>` : ''}`;
  }
  const sorties = [...dr.chantiers.map((k) => `<li>chantier : ${R.BATIMENTS[k].nom}, <b>${R.BATIMENTS[k].d} deniers</b></li>`),
    ...(v.bats.guet && dr.equipes.guet ? ['<li>solde du guet : <b>10 deniers</b></li>'] : []), ...(c ? ['<li>larcin : <b>20 deniers</b></li>'] : [])];
  const nbOps = dr.ops.length;
  return `<div class="role">${verrou(C, 'B')}${C.rendu ? '' : listeRole(C, 'B')}
    <h3>Le larcin</h3>${larcin}
    <div class="registre reg-i"><span class="etiq">Registre de l’Argentier</span>
      <div class="g-carte"><div class="g-tete">${bien('deniers', 30)}<b>La caisse</b></div>
        <p>Au début du tour : <b>${v.deniers} deniers</b></p>
        <p class="note">Ce qui entre et sort ce tour :</p>
        <ul class="mvt">${nbOps ? `<li>${nbOps} bon${nbOps > 1 ? 's' : ''} du Marchand : coûts à retirer, recettes à ajouter</li>` : ''}${sorties.join('')}${!nbOps && !sorties.length ? '<li class="note">rien pour l’instant</li>' : ''}</ul>
        ${caseNum(C, 'caisse', 'Reste en caisse', dr.reg.caisse, 'B')}</div></div>
    ${C.rendu ? '' : `<div class="ligne"><button type="button" data-onglet="R">${logo('registre', 20)} Relire et déposer le registre</button><span class="note">Le dépôt se fait dans l’onglet Registre.</span></div>`}</div>`;
}

// L'onglet Registre : toutes les cases du tour sur une page, en lecture ; le dépôt (Argentier).
function statutRegistre(C, err) {
  const nv = P.vides(C.E.partie, C.id, C.dr);
  if (err.length) return `<div class="statut bloque"><b>Le registre ne peut pas partir.</b> À régler d’abord :<ul>${err.map((x) => `<li>${ech(x)}</li>`).join('')}</ul></div>`;
  if (nv) return `<div class="statut incomplet"><b>Le registre peut partir, mais il est incomplet.</b> ${nv} case${nv > 1 ? 's' : ''} vide${nv > 1 ? 's' : ''} : ${nv > 1 ? 'elles compteront fausses' : 'elle comptera fausse'}.</div>`;
  return '<div class="statut complet"><b>Le registre est complet : il peut partir.</b></div>';
}
function ongletR(C) {
  const E = C.E; const v = E.partie.etat[C.id]; const dr = C.dr; const t = E.partie.tour; const err = P.erreurs(E.partie, C.id, dr);
  let n = 0; let faits = 0;
  const ligne = (lib, val, unite = '') => { n++; const ok = rempli(val); if (ok) faits++;
    return `<li class="${ok ? 'ok' : 'vide'}"><span class="lib">${lib}</span><span class="pts" aria-hidden="true"></span><span class="val">${ok ? `${ech(val)}${unite ? ` <small>${unite}</small>` : ''}` : '<span class="a-remplir">à remplir</span>'}</span></li>`; };
  const info = (lib, val) => `<li class="info"><span class="lib">${lib}</span><span class="pts" aria-hidden="true"></span><span class="val">${val}</span></li>`;
  const tot = Object.values(dr.equipes).reduce((a, x) => a + x, 0);
  const qui = (r) => (C.tit && C.tit.role[r] ? `<span class="note">${C.tit.role[r] === C.moi.uid ? 'toi' : nomDe(C, C.tit.role[r])}</span>` : '');
  const bloc = (r, icone, lignes) => `<section class="reg-role"><header>${logo(icone, 26)}<h4>${ROLES[r]}</h4>${qui(r)}${C.rendu || !C.peut(r) ? '' : `<button type="button" class="petit" data-onglet="${r}">Aller remplir</button>`}</header><ul>${lignes}</ul></section>`;
  const recus = dr.ops.map((o, i) => [o, i]).filter(([o]) => o.sens === 'achat');
  const I = info('Équipes placées', `${tot} sur ${R.equipesDe(v.hab)}`) + ligne('Besoin en grain de la saison', dr.reg.besoin, 'sacs') + ligne('Place restante au grenier', dr.reg.grenier, 'sacs')
    + recus.map(([o, i]) => ligne(`Quantité reçue, achat ${i + 1}`, o.recu, o.m)).join('');
  const M = dr.ops.length ? dr.ops.map((o, i) => `<li class="sous">${o.sens === 'achat' ? 'Achat' : 'Vente'} ${i + 1} : ${rempli(o.q) ? `${ech(o.q)} ` : ''}${o.m}</li>`
      + ligne('Charrettes', o.ch) + ligne(o.sens === 'achat' ? 'Coût, transport compris' : 'Recette, transport déduit', o.montant, 'deniers')).join('')
    : info('Achats et ventes', 'aucun ce tour');
  const O = info('Chantiers lancés', dr.chantiers.length ? dr.chantiers.map((k) => R.BATIMENTS[k].nom).join(', ') : 'aucun') + (dr.chantiers.length || dr.ops.some((o) => o.m !== 'grain') ? ligne('Place restante à la halle', dr.reg.halle) : info('Place restante à la halle', 'pas demandée ce tour'));
  const B = (t >= R.TOUR_VOL ? info('Larcin', dr.coup ? `${dr.coup.cible ? ech(ville(C, dr.coup.cible).nom) : '?'}${dr.coup.butin ? `, ${dr.coup.butin === 'impot' ? 'son impôt' : dr.coup.butin}` : ''}` : 'aucun') : '') + ligne('Reste en caisse', dr.reg.caisse, 'deniers');
  const corps = bloc('I', 'grain', I) + bloc('M', 'deniers', M) + bloc('O', 'marteau', O) + bloc('B', 'cle', B);
  const etat = C.rendu ? `<div class="sceau-depot">${E.force[C.id] ? 'Ramassé par le Seigneur' : 'Déposé'}</div>` : '';
  const pied = C.rendu ? '<p class="note">Le registre est parti. Attends la chronique du Seigneur.</p>' : `
    <div class="reg-compte ${err.length ? 'bloque' : P.vides(E.partie, C.id, dr) ? 'incomplet' : 'complet'}"><span><b>${faits} case${faits > 1 ? 's' : ''} sur ${n}</b> remplie${faits > 1 ? 's' : ''}</span><div class="jauge"><span class="j-grain" style="width:${n ? faits / n * 100 : 0}%"></span></div></div>
    ${statutRegistre(C, err)}
    <div class="ligne"><button type="button" class="primaire" id="deposer" ${err.length || !C.peut('B') ? 'disabled' : ''}>Déposer le registre</button><span class="note">${C.peut('B') ? 'Le dépôt ferme le registre pour toute la ville.' : 'Seul l’Argentier dépose le registre.'}</span></div>`;
  return `<div class="role"><div class="parchemin-reg">${etat}
    <div class="reg-titre"><span class="lettrine">R</span>egistre de ${ech(ville(C, C.id).nom)}</div>
    <div class="reg-sous">${t === 0 ? 'Année de fondation, tour d’essai' : `Tour ${t}, ${R.saisonDu(t).toLowerCase()}`} · chacun remplit ses cases dans son onglet</div>
    <div class="reg-corps">${corps}</div>${pied}</div></div>`;
}

// Fiche d'un bâtiment (ou du quai), par-dessus le plateau : grand dessin, coût, effet, équipes.
function fiche(C, k) {
  const E = C.E; const v = E.partie.etat[C.id]; const s = R.saisonDu(E.partie.tour); const e = C.dr ? C.dr.equipes : {};
  const tot = Object.values(e).reduce((a, n) => a + n, 0); const dispo = R.equipesDe(v.hab);
  const poste = k === 'quai' ? 'dech' : ({ champ: 'champ', bucheron: 'bucheron', carriere: 'carriere', atelier: 'atelier', guet: 'guet' })[k];
  const max = P.postesMax(v, s);
  const B = R.BATIMENTS[k];
  const [w, h] = TAILLE[k] || [1, 1];
  const travail = { champ: '3 l’été, 1 l’automne, aucune l’hiver et au printemps', bucheron: '1', carriere: '1 (aucune l’hiver)', atelier: '1', guet: '1 pour la garder (solde 10 deniers)' }[k];
  const geste = C.dr && poste && (k === 'quai' || v.bats[k]) ? `<div class="ligne" style="justify-content:space-between">${petitPaysan(poste, 40)}<span style="flex:1"><b>Équipes ici${k === 'champ' ? ' (tous les champs)' : k === 'quai' ? ' (au déchargement)' : ''}</b><br><span class="note" style="color:inherit">${dispo - tot} libre${dispo - tot > 1 ? 's' : ''} sur ${dispo}</span></span>
    <div class="pas"><button type="button" data-eq="${poste}" data-pas="-1" aria-label="Retirer une équipe" ${dis(C, 'I')} ${e[poste] ? '' : 'disabled'}>−</button><output>${e[poste]}</output>
    <button type="button" data-eq="${poste}" data-pas="1" aria-label="Ajouter une équipe" ${dis(C, 'I')} ${tot < dispo && e[poste] < max[poste] ? '' : 'disabled'}>+</button></div></div>
    ${C.peut('I') ? '' : '<p class="note" style="color:inherit">Les équipes sont placées par l’Intendant des greniers.</p>'}` : '';
  const corps = k === 'quai'
    ? `<p>Une équipe décharge une charrette. Une charrette qui n’est pas déchargée attend la saison suivante.</p>
       <p>Au quai : ${v.quai.length ? v.quai.map(petiteCharrette).join(' ') : 'aucune charrette'}${v.aRelivrer.length ? ` · relivraison annoncée : ${v.aRelivrer.map((x) => x.q + ' ' + UNITE[x.m]).join(', ')}` : ''}.</p>`
    : `<div class="grand"><svg viewBox="0 0 ${w * 100} ${h * 100}" role="img" aria-label="${B.nom}"><use href="#d-${k === 'choeur' && v.bats.nef ? 'nef' : k}"/></svg></div>
       <dl><dt>Coût</dt><dd>${B.d} deniers${B.b ? ` · ${B.b} bois` : ''}${B.p ? ` · ${B.p} pierre` : ''}</dd><dt>Effet</dt><dd>${EFFETS[k]}</dd>
       ${travail ? `<dt>Équipes pour travailler</dt><dd>${travail}</dd>` : ''}<dt>Points</dt><dd>${B.pts}${v.bats[k] > 1 ? ` · tu en as ${v.bats[k]}` : ''}</dd></dl>`;
  return `<div class="fiche-fond" data-fermer-fond><div class="fiche" role="dialog" aria-modal="true" aria-label="${k === 'quai' ? 'Le quai' : B.nom}">
    <div class="ligne" style="justify-content:space-between"><h3>${k === 'quai' ? 'Le Quai' : B.nom}</h3><button type="button" id="fermer-fiche">Fermer</button></div>
    ${corps}${geste}</div></div>`;
}

// ------------------------------------------------------------------------------------------------- chronique du tour
function chronique(C) {
  const E = C.E; const id = C.id; const j = E.journal[id]; const v = E.apres.etat[id]; const v0 = E.partie.etat[id];
  const avant = R.score(v0); const apres = R.score(v); const t = E.partie.tour; const nom = ech(ville(C, id).nom);
  const V = [];
  const vig = (icone, titre, texte, ton = '') => V.push(`<article class="vignette ${ton}"><div class="v-ic">${icone}</div><div><h4>${titre}</h4><p>${texte}</p></div></article>`);
  if (j.sommeil) vig(logo('sablier', 48), 'En sommeil', 'Ta ville dormait cette saison : rien n’a bougé.');
  else {
    const p = j.production || {}; const prod = Object.entries(p).filter(([, q]) => q);
    vig(bien('grain', 48), 'Production', prod.length ? prod.map(([m, q]) => `<span class="chip">${bien(m, 20)} +${q} ${UNITE[m]}</span>`).join(' ') : 'Rien n’a été produit cette saison.');
    vig(logo('habitants', 48), 'Le repas', `Les habitants ont mangé <b>${j.consommation} sacs</b>.${j.rats ? ` Les rats en ont mangé <b>${j.rats}</b>.` : ''}`);
    if (j.famine) vig(logo('habitants', 48), 'Famine !', `Il manquait <b>${j.famine.manque} sacs</b>. ${j.famine.partis} habitants sont partis, la réputation baisse de 10, les chantiers s’arrêtent.`, 'v-mal');
    else vig(logo('habitants', 48), 'La ville grandit', j.croissance ? `<b>+${j.croissance} habitants</b> sont arrivés.` : 'Personne n’est arrivé : il n’y a plus de logement libre.', j.croissance ? 'v-bien' : '');
    if ((j.decharge && j.decharge.length) || v.quai.length) vig(bien('charrette', 48), 'Le quai', `${j.decharge && j.decharge.length ? `Déchargé : ${j.decharge.map(petiteCharrette).join(' ')}` : 'Rien n’a été déchargé.'}${v.quai.length ? ` <span class="faux">${v.quai.length} charrette${v.quai.length > 1 ? 's attendent' : ' attend'} encore.</span>` : ''}`, v.quai.length ? 'v-mal' : '');
    if (j.ecart) vig(bien(j.ecart.m, 48), 'Livraison incomplète', `Il manquait ${j.ecart.manque} ${UNITE[j.ecart.m]}. ${j.ecart.reserve ? 'Réserve émise : le Marché relivre la saison prochaine.' : 'Pas de réserve : c’est perdu.'}`, j.ecart.reserve ? 'v-bien' : 'v-mal');
    const deb = Object.entries(j.debordement || {}).filter(([, q]) => q);
    if (deb.length) vig(deb.length === 1 && deb[0][0] === 'grain' ? bien('grain', 48) : logo('halle', 48), 'Perdu faute de place', deb.map(([m, q]) => `${q} ${UNITE[m]}`).join(', ') + '.', 'v-mal');
    if ((j.acheves || []).length) V.push(`<article class="vignette v-bien large"><div><h4>Chantiers achevés</h4><div class="acheves">${j.acheves.map((k) => { const [w, h] = TAILLE[k] || [1, 1]; return `<figure><svg viewBox="0 0 ${w * 100} ${h * 100}" aria-hidden="true"><use href="#d-${k}"/></svg><figcaption>${R.BATIMENTS[k].nom}</figcaption></figure>`; }).join('')}</div></div></article>`);
    vig(bien('deniers', 48), 'La caisse', `Impôt : <b>+${j.impot}</b>${j.taxe ? `, taxe sur les ventes : −${j.taxe}` : ''}${j.peage ? `, péage de la Chancellerie : +${j.peage}` : ''}${j.garde ? ', solde du guet : −10' : ''}.`);
    if (j.coup) vig(logo('cle', 48), 'Ton larcin', j.coup.pris ? `Sur ${ech(ville(C, j.coup.cible).nom)} : la tour était gardée, le voleur est pris (réputation −2).` : `Sur ${ech(ville(C, j.coup.cible).nom)} : réussi, ${j.coup.q} ${j.coup.butin === 'impot' ? 'deniers d’impôt' : `${UNITE[j.coup.butin]}, au quai la saison prochaine`}.`, j.coup.pris ? 'v-mal' : 'v-bien');
    (j.evenements || []).forEach((x) => {
      if (x.type === 'vole') vig(logo('cle', 48), `${nom} volée`, `${x.q} ${x.butin === 'impot' ? 'deniers d’impôt' : UNITE[x.butin]} ont disparu. On ne sait pas qui a fait le coup.`, 'v-mal');
      if (x.type === 'voleur-pris') vig(logo('cle', 48), 'Voleur pris', 'La tour de guet a arrêté un voleur.', 'v-bien');
      if (x.type === 'incendie') vig(bien('bois', 48), 'Incendie', `${x.q} bois ont brûlé.`, 'v-mal');
      if (x.type === 'incendie-evite') vig(bien('bois', 48), 'Incendie évité', 'La tour gardée a donné l’alerte à temps.', 'v-bien');
      if (x.type === 'commande') vig(bien('deniers', 48), 'Commande du Seigneur', 'L’atelier a livré : +40 deniers.', 'v-bien');
      if (x.type === 'coup-sans-cible') vig(logo('cle', 48), 'Larcin manqué', 'La ville visée dormait : les 20 deniers sont perdus.', 'v-mal');
    });
    if (j.sansDepot) vig(logo('registre', 48), 'Aucun registre rendu', 'Pas d’action ce tour : les équipes ont été placées d’office.', 'v-mal');
  }
  const delta = (a, b2) => { const d = b2 - a; return d ? `<small class="${d > 0 ? 'plus' : 'moins'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</small>` : '<small>=</small>'; };
  const bilan = [['deniers', 'deniers', 'deniers'], ['grain', 'grain', 'sacs'], ['bois', 'bois', 'bois'], ['pierre', 'pierre', 'pierre'], ['drap', 'drap', 'drap'], ['habitants', 'hab', 'habitants'], ['reputation', 'rep', 'réputation']]
    .map(([ic, k, lib]) => `<div class="b-res">${ic === 'habitants' || ic === 'reputation' ? logo(ic, 30) : bien(ic, 30)}<b>${v[k]}</b>${delta(v0[k], v[k])}<span>${lib}</span></div>`).join('');
  const carte = j.carte ? `<aside class="carte-saison"><div class="cs-nom">${R.CARTES[j.carte].nom}</div>${bien(CARTE_INFO[j.carte][0], 56)}<p>${CARTE_INFO[j.carte][1]}</p>${j.vise ? `<p class="cs-vise">Elle visait ${nom} !</p>` : ''}</aside>` : '';
  const reg = j.registre ? `<div class="reg-corrige"><ul>${j.registre.cases.map((c) => `<li class="${c.juste ? 'ok' : 'ko'}"><span class="marque">${c.juste ? '✓' : '✗'}</span><span class="lib">${libCase(c.cle)}</span><span class="pts" aria-hidden="true"></span><span class="val">${aff(c.donne)}</span>${c.juste ? '' : `<span class="attendu">juste : ${aff(c.attendu)}</span>`}</li>`).join('')}</ul>
    <p class="${j.registre.juste ? 'juste' : 'faux'}">${j.registre.juste ? 'Registre juste : +2 points de bonus.' : 'Une case fausse ou vide : pas de bonus ce tour.'}</p></div>` : '';
  return `${plateau(v, { plan: (E.plansApres || {})[id] || E.plans[id] || [], saison: R.saisonDu(t) })}
    <section class="pile"><div class="parchemin-reg chronique-p">
      <div class="reg-titre"><span class="lettrine">C</span>hronique de ${nom}</div>
      <div class="reg-sous">${t === 0 ? 'Année de fondation, tour d’essai' : `Tour ${t}, ${R.saisonDu(t).toLowerCase()}`}</div>
      <div class="chro-tete">${carte}<div class="score-sceau"><small>Score</small><span class="s-avant">${avant}</span><span class="fleche">→</span><b>${apres}</b></div></div>
      <div class="vignettes">${V.join('')}</div>
      <h3>Les réserves après la saison</h3><div class="bilan-res">${bilan}</div>
      <h3>Le registre corrigé</h3>${reg || '<p class="note">Pas de registre ce tour.</p>'}
      ${t === 0 ? '<p class="alerte">Fin de l’année de fondation : toutes les villes repartent de l’état de départ.</p>' : ''}</div></section>`;
}

const place = (r) => (r === 1 ? '1re' : `${r}e`);
function finVille(C) {
  const E = C.E; const N = E.notes; const id = C.id; const n = N[id]; const Et = E.partie.etat; const v = Et[id]; const nom = ech(ville(C, id).nom);
  const tri = [...E.villes].sort((x, y) => N[x.id].rang - N[y.id].rang);
  const ordre = tri.length >= 3 ? [tri[1], tri[0], tri[2], ...tri.slice(3)] : tri;   // podium : 2e à gauche, 1re au centre
  const marches = ordre.map((x) => { const r = N[x.id].rang; return `<div class="marche m${Math.min(r, 3)} ${x.id === id ? 'moi' : ''}">
    <div class="bl">${blason(x)}</div><b class="nom">${ech(x.nom)}</b><span class="sc">${R.score(Et[x.id])} points</span>
    <div class="socle"><span class="rang">${place(r)}</span><span class="nt">${N[x.id].note}<small>/20</small></span></div></div>`; }).join('');
  const bats = Object.entries(v.bats).filter(([, q]) => q).map(([k, q]) => { const [w, h] = TAILLE[k] || [1, 1];
    return `<figure><svg viewBox="0 0 ${w * 100} ${h * 100}" aria-hidden="true"><use href="#d-${k}"/></svg><figcaption>${R.BATIMENTS[k].nom}${q > 1 ? ` × ${q}` : ''}</figcaption></figure>`; }).join('');
  const detail = [['habitants', `${v.hab} habitants`, `${Math.floor(v.hab / 4)} pts`], ['marteau', 'les bâtiments', `${R.points(v)} pts`],
    ['deniers', `${v.deniers} deniers`, `${Math.floor(v.deniers / 50)} pts`], ['reputation', `${v.rep} de réputation`, `${v.rep * 3} pts`], ['registre', 'registres justes', `${v.bonus} pts`]]
    .map(([ic, lib, pts]) => `<li>${logo(ic, 26)}<span>${lib}</span><span class="pts" aria-hidden="true"></span><b>${pts}</b></li>`).join('');
  return `<div class="parchemin-reg fin-partie">
    <div class="reg-titre"><span class="lettrine">L</span>’hiver est passé</div>
    <div class="reg-sous">Fin de la partie · le Seigneur proclame le classement des villes</div>
    <div class="podium">${marches}</div>
    <div class="fin-grille">
      <section><h3>La note de ${nom}</h3><div class="note-calc"><span class="bloc">${n.surQuatorze}<small>sur 14 pour le score</small></span><span class="signe">+</span><span class="bloc">${n.classement}<small>sur 6 pour la ${place(n.rang)} place</small></span><span class="signe">=</span><span class="bloc total">${n.note}<small>sur 20</small></span></div>
        <h3>D’où vient le score</h3><ul class="decompte">${detail}<li class="tot"><span>Score de la ville</span><span class="pts" aria-hidden="true"></span><b>${R.score(v)} pts</b></li></ul>${v.famines ? `<p class="faux">${v.famines} famine${v.famines > 1 ? 's' : ''} pendant la partie.</p>` : '<p class="juste">Aucune famine de toute la partie.</p>'}</section>
      <section><h3>Ce que ${nom} a bâti</h3><div class="acheves">${bats}</div></section>
    </div></div>`;
}

// --------------------------------------------------------------------------------------- écran de jeu d'une ville
export function ecranVilleJeu(C) {
  const E = C.E; const v = partieVue(E).etat[C.id];
  if (E.phase === 'fin') return finVille(C);
  let h = enTeteVille(C);
  if (E.phase === 'resolu') return h + chronique(C);
  if (E.phase === 'avant-tour') {
    return h + `<div class="alerte">Le Seigneur prépare la saison${E.partie.tour === 0 ? ' : c’est l’année de fondation, un tour d’essai qui ne compte pas' : ''}. Regarde ta ville en attendant.</div>
      <section class="pile">${plateau(v, { plan: E.plans[C.id] || [], saison: R.saisonDu(E.partie.tour) })}</section>`;
  }
  if (E.phase === 'carte') h += `<div class="alerte">Les registres sont clos. Le Seigneur tire la carte de la saison${E.carte && E.carte.carte ? ` : <b>${R.CARTES[E.carte.carte].nom}</b>${E.carte.cible ? ` (${ech(ville(C, E.carte.cible).nom)})` : ''}` : ' (aucune carte cette saison)'}.</div>`;
  else if (C.rendu) h += `<div class="alerte">${E.force[C.id] ? 'Le Seigneur a ramassé ton registre tel qu’il était rempli.' : 'Registre déposé.'} En attente des autres villes et du Seigneur.</div>`;
  const mes = C.tit ? C.tit.rolesDe(C.moi.uid) : [];
  const ong = ['I', 'M', 'O', 'B'].map((r) => `<button type="button" role="tab" data-onglet="${r}" aria-selected="${C.ui.onglet === r}">${logo(({ I: 'grain', M: 'deniers', O: 'marteau', B: 'cle' })[r], 22)}${ROLES[r]}${mes.includes(r) ? '<span class="moi">toi</span>' : ''}</button>`).join('') + `<button type="button" role="tab" class="onglet-reg" data-onglet="R" aria-selected="${C.ui.onglet === 'R'}">${logo('registre', 22)}Registre</button>`;
  const enCours = E.phase === 'tour' && !C.rendu;
  h += `<section class="pile">${C.ui.placer ? `<div class="alerte ligne" style="justify-content:space-between"><span>Choisis la case du <b>${R.BATIMENTS[C.ui.placer].nom}</b> : clique une case dorée sur le plateau.</span><button type="button" id="annuler-placer">Annuler</button></div>` : ''}${plateau(v, { plan: E.plans[C.id] || [], saison: R.saisonDu(E.partie.tour), projets: enCours ? C.dr.chantiers : [], places: C.dr.places, equipes: C.dr.equipes, cliquable: !C.ui.placer, placer: C.ui.placer })}
    <p class="plateau-aide">Clique un bâtiment ou le quai pour ouvrir sa fiche${C.peut('I') ? ' et y poser des équipes' : ''}. Les bâtiments barrés sont en chantier.</p></section>
    <section class="pile">${mes.length ? `<p class="note">Ce tour-ci, tu es <b>${mes.map((r) => ROLES[r]).join(' + ')}</b>.</p>` : ''}
      <div class="onglets" role="tablist">${ong}</div>
      ${({ I: ongletI, M: ongletM, O: ongletO, B: ongletB, R: ongletR })[C.ui.onglet](C)}</section>`;
  if (C.ui.fiche) h += fiche(C, C.ui.fiche);
  return h;
}

// ----------------------------------------------------------------------------------- parcours de l'élève (avant le jeu)
export function ecranNomBlason(C) {
  const V = ville(C, C.id); const B = C.ui.choixVille;
  const nom = V.nommee ? V.nom : (B.nom || '…');
  const nommer = C.E.reglages.nommage === 'eleves';
  let h = `<div class="bloc"><h3>Votre ville</h3><p class="note">Mettez-vous d’accord, puis un seul d’entre vous valide. Le Seigneur peut changer ce qui ne convient pas.</p>`;
  if (nommer) h += `<div class="bloc"><span class="etiq">1. Son nom</span><div class="ligne"><input type="text" id="nomville" maxlength="28" placeholder="ex. Pierrefeu" value="${ech(B.nom)}"><button type="button" id="tirernom">Tirer un nom</button></div></div>`;
  h += `<div class="bloc"><span class="etiq">${nommer ? '2' : '1'}. Son blason : une figure…</span><div class="choixbl">${FIGURES.map((f, i) => `<button type="button" data-fig="${i}" aria-pressed="${B.fig === i}" title="${ech(f.nom)}" aria-label="${ech(f.nom)}">${dessinBlason({ fig: i, teinte: B.teinte })}</button>`).join('')}</div>
    <span class="etiq">… et une couleur de fond</span><div class="teintes">${TEINTES.map((t) => `<button type="button" data-teinte="${t.id}" aria-pressed="${B.teinte === t.id}"><i style="background:${t.c}"></i>${ech(t.nom)}</button>`).join('')}</div></div>`;
  h += `<div class="apercu"><div class="grand">${B.fig != null ? dessinBlason({ fig: B.fig, teinte: B.teinte }, nommer ? (B.nom || '…') : nom) : '<p class="note" style="line-height:1.4">Choisis une figure.</p>'}</div>
    <div class="bloc"><p>${B.fig != null ? `<strong>${ech(FIGURES[B.fig].nom)}</strong> : ${ech(FIGURES[B.fig].sens)}` : ''}</p><button type="button" class="primaire" id="validerville">Valider notre ville</button><span class="note" id="msgville">${ech(C.ui.msgVille || '')}</span></div></div></div>`;
  return h;
}

export function ecranRoles(C) {
  const T = C.tit; const u = C.moi.uid; const mien = Object.keys(T.lot).find((i) => T.lot[i] === u);
  const E = C.E; const n = T.presents.length;
  const A = E.attrib && E.attrib[C.id];
  const garde = !E.reglages.rotation && E.partie.tour > 0 && !!(A && A.tour === P.tour(E) && A.L && Object.values(T.lot).some((x) => A.L.includes(x)));
  let h = `<div class="bloc"><h3>Qui fait quoi ce tour-ci ?</h3><p class="note">Vous êtes ${n} présent${n > 1 ? 's' : ''} : ${T.lots.length} lot${T.lots.length > 1 ? 's' : ''} de rôles. Chacun en prend un. Le registre s’ouvre quand tous les lots sont pris.${garde ? ' Celui qui était déjà là garde son rôle du tour précédent ; il peut le rendre.' : ''}${E.reglages.rotation && E.partie.tour > 0 ? ' Cette partie oblige à changer de rôle : ton lot du tour précédent est fermé pour toi.' : ''}</p><div class="lots">`;
  T.lots.forEach((lot, i) => {
    const pris = T.lot[i]; const amoi = pris === u; const interdit = P.lotInterdit(E, T.n, i, u);
    h += `<div class="lot ${amoi ? 'a-moi' : ''}"><span class="roles">${lot.map((r) => ROLES[r]).join(' + ')}</span>
      ${pris ? `<span class="note">${amoi ? 'C’est toi.' : `Pris par ${nomDe(C, pris)}.`}</span>` : `<span class="note">${interdit ? 'Tu l’as tenu au tour précédent.' : 'Libre'}</span>`}
      ${amoi ? `<button type="button" data-lacher="${i}">Rendre ce rôle</button>` : (!pris && mien === undefined ? `<button type="button" class="primaire" data-prendre="${i}" ${interdit ? 'disabled' : ''}>Je prends</button>` : '')}</div>`;
  });
  h += `</div><p class="note">${Object.keys(T.lot).length}/${T.lots.length} lots pris.${mien === undefined ? '' : ' Attends que tes camarades prennent les leurs.'}</p></div>`;
  return h;
}

// L'écran de l'élève, selon la phase.
export function ecranEleve(C) {
  const E = C.E;
  if (!E) return `<p class="attente">Le Seigneur prépare la partie. Attends son signal.</p>`;
  if (!C.id) return `<p class="attente">Attends que le Seigneur te place dans une ville.</p>`;
  const V = ville(C, C.id);
  const autres = P.membresDe(E, C.id).filter((x) => x !== C.moi.uid);
  const phrase = `${autres.length ? ` avec ${autres.map((x) => nomDe(C, x)).join(', ')}` : ', seul'}`;
  const avec = `<p>Tu es à <strong>${ech(V.nom)}</strong>${phrase}${phrase.endsWith('.') ? '' : '.'}</p>`;
  if (E.phase === 'preparation') return `${avec}<p class="attente">Le Seigneur forme les villes. Attends son signal.</p>`;
  if (E.phase === 'avant-tour' && (!V.nommee || !V.blason)) return avec + ecranNomBlason(C);
  if (E.phase === 'tour' && !C.rendu) {
    if (!C.tit.presents.includes(C.moi.uid)) {
      return enTeteVille(C) + (E.presence[C.moi.uid] === false
        ? '<p class="attente">Le Seigneur t’a noté absent pour ce tour. S’il s’agit d’une erreur, dis-le-lui.</p>'
        : '<p class="attente">Tu es arrivé après l’ouverture du tour. Le Seigneur doit t’ajouter à ta ville : préviens-le.</p>');
    }
    if (!C.tit.tous) return enTeteVille(C) + avec + ecranRoles(C);
  }
  return ecranVilleJeu(C);
}

// ---------------------------------------------------------------------------------------------- écrans du Seigneur
function etapes(E) {
  const ici = { preparation: 0, 'avant-tour': 1, tour: 2, carte: 3, resolu: 4, fin: 4 }[E.phase];
  const L = ['Former les villes', 'Avant le tour : présents, noms, blasons', 'Tour ouvert : rôles puis registre', 'Registres clos : carte et résolution', 'Chronique et classement'];
  return `<ol class="etapes">${L.map((t, i) => `<li class="${i === ici ? 'ici' : ''}">${t}</li>`).join('')}</ol>`;
}
function etatVille(C, id) {
  const E = C.E;
  if (E.phase === 'resolu' || E.phase === 'fin') return { t: 'saison résolue', ok: true };
  if (E.phase === 'carte') { const d = E.depots[id]; return { t: d === 'sommeil' ? 'en sommeil' : d === null ? 'n’a rien rendu' : E.force[id] ? 'rendu forcé' : 'registre déposé ✓', ok: !!d }; }
  if (E.phase !== 'tour') return { t: `${P.presentsDe(E, C.L, id, C.now).length} présent(s)`, ok: false };
  if (!P.presentsDe(E, C.L, id, C.now).length) return { t: E.vides[id] === 'sommeil' ? 'en sommeil' : 'consomme sans agir', ok: true, dort: true };
  if (E.depots[id] !== undefined) return { t: 'rendu forcé', ok: true };
  if (P.depotDe(E, C.L, id)) return { t: 'registre déposé ✓', ok: true };
  const T = P.titulaires(E, C.L, id, C.now);
  if (!T.tous) return { t: `rôles ${Object.keys(T.lot).length}/${T.lots.length}`, ok: false };
  return { t: 'remplit son registre', ok: false };
}
const reglage = (E, html) => `<div class="reglage">${html}</div>`;

function preparation(C) {
  const E = C.E; const Rg = E.reglages; const el = C.eleves || [];
  const sans = el.filter((e) => !E.membres[e.uid]);
  let h = `<div class="bloc"><h3>1. Créer la partie</h3>
    ${reglage(E, `<label class="choix" for="nbv">Nombre de villes <select id="nbv">${[3, 4, 5].map((n) => `<option ${n === Rg.nbVilles ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="choix" for="nommage">Nom des villes <select id="nommage"><option value="liste" ${Rg.nommage === 'liste' ? 'selected' : ''}>tirés d’une liste de villages médiévaux</option><option value="prof" ${Rg.nommage === 'prof' ? 'selected' : ''}>choisis par moi</option><option value="eleves" ${Rg.nommage === 'eleves' ? 'selected' : ''}>choisis par les élèves</option></select></label>
      <label class="choix" for="rot"><input type="checkbox" id="rot" ${Rg.rotation ? 'checked' : ''}> Obliger à changer de rôle à chaque tour (par défaut, chacun garde le sien)</label>`)}
    <p class="note">${el.length} élève${el.length > 1 ? 's' : ''} dans le groupe. Une ville compte 1 à 4 élèves : il faut ${Math.max(3, Math.ceil(el.length / 4))} villes au moins${Math.ceil(el.length / 4) > 5 ? ' (au-delà de 20 élèves, une partie ne suffit pas : fais deux parties, une par demi-groupe)' : ''}.</p></div>
    <div class="bloc"><h3>2. Former les villes</h3>
    <div class="ligne"><button type="button" class="primaire" id="hasard">Tirer au hasard</button><button type="button" id="main">Les faire à la main avec les élèves</button></div>`;
  if (E.mode) {
    h += `${E.mode === 'hasard' ? '<p class="note">Tirage fait. Tu peux encore déplacer un élève ci-dessous.</p>' : ''}${tableauVilles(C, true)}`;
    if (E.reglages.nommage === 'eleves') h += '<p class="note">Les élèves de chaque ville choisiront son nom à leur arrivée (écrit, ou tiré dans la liste). Tu pourras toujours le changer.</p>';
    else h += `<div class="bloc"><span class="etiq">Noms des villes</span><div class="ligne">${E.villes.map((v) => `<span class="choix"><input type="text" id="nom-${v.id}" data-nom="${v.id}" value="${ech(v.nom)}" aria-label="Nom de la ville" maxlength="28"><button type="button" data-de="${v.id}" title="Tirer un autre nom" aria-label="Tirer un autre nom">⚄</button></span>`).join('')}</div></div>`;
    const trop = E.villes.filter((v) => P.membresDe(E, v.id).length > 4); const vide = E.villes.filter((v) => !P.membresDe(E, v.id).length);
    const msg = trop.length ? `${trop.map((v) => v.nom).join(', ')} : plus de 4 élèves.` : vide.length ? `${vide.map((v) => v.nom).join(', ')} : aucun élève.` : sans.length ? `${sans.length} élève(s) sans ville (ils attendront).` : 'Toutes les villes ont entre 1 et 4 élèves.';
    h += `<div class="ligne"><button type="button" class="primaire" id="pretes" ${P.nbOk(E) ? '' : 'disabled'}>Les villes sont prêtes</button><span class="note">${ech(msg)}</span></div>`;
  }
  return h + '</div>';
}
function tableauVilles(C, prepa) {
  const E = C.E; const el = C.eleves || [];
  return `<div class="defile"><table><thead><tr><th>Élève</th><th>Ville</th>${prepa ? '' : '<th>Présence</th>'}</tr></thead><tbody>${
    el.map((e) => { const id = E.membres[e.uid]; const pres = id ? P.presentEnDirect(E, C.L, e.uid, C.now) : false;
      return `<tr><td>${ech(e.nom)}</td><td><select data-ville="${e.uid}" aria-label="Ville de ${ech(e.nom)}"><option value="">— sans ville —</option>${E.villes.map((v) => `<option value="${v.id}" ${id === v.id ? 'selected' : ''}>${ech(v.nom)}</option>`).join('')}</select></td>${prepa ? '' : `<td>${id ? (pres ? '<span class="pastille ok">présent</span>' : '<span class="pastille att">pas connecté</span>') : ''}</td>`}</tr>`; }).join('')
  }</tbody></table></div>`;
}

function carteVille(C, v) {
  const E = C.E; const id = v.id; const P0 = partieVue(E); const st = etatVille(C, id);
  const mb = P.membresDe(E, id);
  const enT = E.phase === 'tour';
  const T = enT ? P.titulaires(E, C.L, id, C.now) : null;
  const pres = P.presentsDe(E, C.L, id, C.now);
  const roleDe = (u) => (T ? T.rolesDe(u).map((r) => P.ROLES_COURTS[r]).join(' + ') : '');
  const gens = mb.map((u) => {
    const p = pres.includes(u);
    const btn = E.phase === 'avant-tour' || enT ? `<button type="button" class="petit" data-presence="${u}" data-valeur="${p ? '0' : '1'}">${p ? 'noter absent' : enT ? 'l’ajouter' : 'noter présent'}</button>` : '';
    return `<li class="${p ? '' : 'abs'}">${nomDe(C, u)}${p && roleDe(u) ? ` <span>${roleDe(u)}</span>` : ''}${p ? '' : ` <span>${enT && P.retardataires(E, C.L, id, C.now).includes(u) ? 'vient d’arriver' : 'absent'}</span>`} ${btn}</li>`;
  }).join('');
  let detail = '';
  if (E.phase === 'avant-tour' && !pres.length) {
    detail += `<div class="ligne"><label class="choix" for="c-${id}"><input type="radio" id="c-${id}" name="vide-${id}" value="consomme" ${E.vides[id] === 'consomme' ? 'checked' : ''}> consomme sans agir</label>
      <label class="choix" for="s-${id}"><input type="radio" id="s-${id}" name="vide-${id}" value="sommeil" ${E.vides[id] === 'sommeil' ? 'checked' : ''}> en sommeil (ni action ni consommation)</label></div>`;
  }
  if (enT && !P.aRendu(E, C.L, id) && T.lots.length) {
    detail += `<div class="bloc">${T.lots.map((lot, i) => `<label class="note" for="r-${id}-${i}">${lot.map((r) => ROLES[r]).join(' + ')}<br><select id="r-${id}-${i}" data-reattr="${id}|${i}"><option value="">— libre —</option>${T.presents.map((u) => `<option value="${u}" ${T.lot[i] === u ? 'selected' : ''}>${nomDe(C, u)}</option>`).join('')}</select></label>`).join('')}<span class="note">Réattribuer un rôle d’un clic.</span></div>`;
  }
  if (enT && P.aRendu(E, C.L, id) && !(E.force[id])) detail += `<div class="ligne"><button type="button" class="petit" data-rouvrir="${id}">Rouvrir son registre</button></div>`;
  if (E.phase === 'resolu' && E.journal[id] && E.journal[id].registre) detail += `<span class="note">Registre ${E.journal[id].registre.juste ? 'juste' : `${E.journal[id].registre.cases.filter((c) => !c.juste).length} case(s) fausse(s)`}</span>`;
  const renommer = E.phase === 'fin' ? '' : `<label class="note" for="ren-${id}">Renommer <input type="text" id="ren-${id}" data-renom="${id}" value="${v.nommee ? ech(v.nom) : ''}" placeholder="nom de la ville" maxlength="28" style="width:100%"></label>`;
  const bl = E.phase === 'fin' ? '' : `<button type="button" class="petit" data-tirerbl="${id}">${v.blason ? 'Changer le blason au hasard' : 'Tirer un blason au hasard'}</button>`;
  return `<div class="ville"><h3><span class="mini">${v.blason ? dessinBlason(v.blason) : ''}</span>${ech(v.nom)}</h3>
    <span class="pastille ${st.dort ? 'dort' : st.ok ? 'ok' : 'att'}">${st.t}</span>
    <span class="note">Score ${R.score(P0.etat[id])} · ${P0.etat[id].hab} habitants · ${P0.etat[id].deniers} deniers</span>
    <ul class="pj-gens">${gens || '<li class="note">aucun élève</li>'}</ul>${detail}
    <div class="ligne">${renommer}${bl}<button type="button" class="petit" data-voir="${id}">Voir son écran</button></div></div>`;
}

export function ecranSeigneur(C) {
  const E = C.E;
  if (!E) return '<p class="attente">Préparation de la partie…</p>';
  const t = E.partie ? E.partie.tour : 0;
  const undo = C.derniere ? `<button type="button" id="annuler">↶ Revenir en arrière (${ech(C.derniere)})</button>` : '<button type="button" id="annuler" disabled>↶ Revenir en arrière</button>';
  let h = `<div class="ligne" style="justify-content:space-between"><div><h2>Le Seigneur</h2><p class="saison">${E.phase === 'preparation' ? 'Préparation de la partie' : E.phase === 'fin' ? 'Partie terminée' : tourTxt(t)}</p></div>${undo}</div>`;
  if (E.phase === 'preparation') return h + preparation(C);
  h += etapes(E);
  h += `<div class="commandes"><span class="etiq">Aides pour les élèves</span>
    <label class="ligne"><input type="checkbox" id="opt-aide" ${E.reglages.aide ? 'checked' : ''}> « Comment faire ? » (méthodes de calcul)</label>
    <label class="ligne"><input type="checkbox" id="opt-calc" ${E.reglages.calc ? 'checked' : ''}> Calculatrice</label>
    <span class="note">La liste « à faire » reste toujours visible.</span></div>`;
  if (E.phase === 'tour') {
    const r = P.restant(E, C.now);
    h += `<div class="commandes"><span class="etiq">Compte à rebours</span>
      <label class="ligne">Durée <input type="number" id="minutes" min="1" max="60" value="${E.reglages.minutes}" style="width:4.5rem"> min</label>
      ${E.chrono.fin ? '<button type="button" id="pause">Pause</button>' : `<button type="button" class="primaire" id="lancer" ${r ? '' : 'disabled'}>${E.chrono.restant < E.reglages.minutes * 60000 ? 'Reprendre' : 'Lancer'}</button>`}
      <button type="button" id="plus1">+1 min</button><button type="button" id="remise">Remettre à ${E.reglages.minutes} min</button>
      <span class="chrono" data-chrono><b>${mmss(r)}</b><small><span></span></small></span></div>`;
  }
  h += `<div class="villes">${E.villes.map((v) => carteVille(C, v)).join('')}</div>`;
  if (E.phase === 'avant-tour') {
    const m = P.manquesOuverture(E, C.L, C.now);
    h += `<div class="bloc"><h3>Avant d’ouvrir le tour</h3>${m.length ? `<ul class="alerte">${m.map((x) => `<li>${ech(x)}</li>`).join('')}</ul>` : '<p class="note">Tout est prêt. Les élèves présents sont ceux qui ont ouvert la partie depuis 20 minutes ; corrige-les d’un clic dans les cartes des villes.</p>'}
      <div class="ligne"><button type="button" class="primaire" id="ouvrir" ${m.length ? 'disabled' : ''}>Ouvrir le tour${t === 0 ? ' d’essai' : ''}</button></div></div>`;
  }
  if (E.phase === 'tour') {
    const reste = P.enAttente(E, C.L, C.now).length;
    h += `<div class="ligne">${reste ? `<button type="button" class="${P.restant(E, C.now) === 0 ? 'attention' : ''}" id="forcer">Forcer le rendu (${reste} ville${reste > 1 ? 's' : ''})</button>` : ''}
      <button type="button" class="primaire" id="clore" ${reste ? 'disabled' : ''}>Clore les registres et tirer la carte</button></div>
      <p class="note">Forcer le rendu ramasse chaque registre tel qu’il est rempli : une case vide compte fausse, une opération incomplète est ignorée.</p>`;
  }
  if (E.phase === 'carte') {
    const c = E.carte && E.carte.carte;
    h += `<div class="pile"><span class="etiq">Carte de la saison</span><span class="carte-ev">${c ? R.CARTES[c].nom : 'Aucune carte (tour d’essai et tour 1)'}${E.carte && E.carte.cible ? ` · ${ech(ville(C, E.carte.cible).nom)}` : ''}</span>
      <div class="ligne"><button type="button" class="primaire" id="resoudre">Résoudre la saison</button></div></div>`;
  }
  if (E.phase === 'resolu') h += `<div class="ligne"><button type="button" class="primaire" id="suivant">${t === 0 ? 'Fin de l’année de fondation : remettre les villes à zéro' : t === R.DERNIER_TOUR ? 'Terminer la partie et calculer les notes' : 'Préparer la saison suivante'}</button></div>`;
  if (E.phase === 'fin') {
    const N = P.notesEleves(E);
    h += `<div class="defile"><table><thead><tr><th>Ville</th><th class="n">Score</th><th class="n">Place</th><th class="n">Score /14</th><th class="n">Classement /6</th><th class="n">Note /20</th></tr></thead><tbody>
      ${E.villes.map((v) => { const n = E.notes[v.id]; return `<tr><td>${ech(v.nom)}</td><td class="n">${R.score(E.partie.etat[v.id])}</td><td class="n">${n.rang}</td><td class="n">${n.surQuatorze}</td><td class="n">${n.classement}</td><td class="n"><b>${n.note}</b></td></tr>`; }).join('')}</tbody></table></div>
      <p class="note">${E.notesPosees ? `Notes posées dans le suivi de classe pour ${Object.keys(N).length} élève(s), sur les compétences de la séance.` : 'Les notes partent dans le suivi de classe…'} Un élève qui n’a joué aucun tour n’a pas de note.</p>`;
  }
  if (E.phase !== 'fin') h += `<details class="bloc"><summary><strong>Déplacer un élève d’une ville à l’autre</strong> (possible à tout moment)</summary>${tableauVilles(C, false)}</details>`;
  return h;
}

// -------------------------------------------------------------------------------------------------- tableau projeté
export function ecranTableau(C) {
  const E = C.E;
  let h = `<div class="pj-tete"><div><div class="pj-titre">Avant l’Hiver</div><div class="pj-sous">${!E || E.phase === 'preparation' ? 'Les villes se forment' : E.phase === 'fin' ? 'Partie terminée' : tourTxt(E.partie.tour)}</div></div>
    ${E && E.phase === 'tour' ? `<div class="pj-chrono" data-chrono><b>${mmss(P.restant(E, C.now))}</b><span></span></div>` : ''}</div>`;
  if (!E || E.phase === 'preparation') return h + '<p class="pj-attente">Patience : le Seigneur forme les villes.</p>';
  const t = E.partie.tour; const fini = E.phase === 'fin'; const P0 = partieVue(E);
  const phaseTxt = fini ? 'Le second hiver est passé' : E.phase === 'avant-tour' ? 'Le Seigneur prépare la saison' : E.phase === 'tour' ? 'Les villes tiennent leur registre' : E.phase === 'carte' ? 'Le Seigneur tire la carte' : 'Voici ce que la saison a donné';
  h += `<p class="pj-phase">${phaseTxt}</p><ol class="pj-saisons">${SAIS_COURT.map((x, i) => `<li class="${i < t || (i === t && E.phase === 'resolu') || fini ? 'fait' : i === t ? 'ici' : ''}"><span class="pt"></span>${x}</li>`).join('')}</ol>`;
  if ((E.phase === 'carte' || E.phase === 'resolu') && E.carte) h += `<div class="pj-carte">${E.carte.carte ? `${R.CARTES[E.carte.carte].nom}${E.carte.cible ? ` frappe ${ech(ville(C, E.carte.cible).nom)}` : ''}` : 'Pas de carte cette saison'}</div>`;
  const classe = !(t === 0 && E.phase !== 'resolu') && !(E.phase === 'tour' && t === 1) && !(E.phase === 'avant-tour' && t === 1);
  const ordre = classe ? [...E.villes].sort((a, b) => R.score(P0.etat[b.id]) - R.score(P0.etat[a.id])) : E.villes;
  h += `<div class="pj-villes">${ordre.map((v, i) => {
    const st = etatVille(C, v.id); const sc = R.score(P0.etat[v.id]); const n = fini ? E.notes[v.id] : null;
    const T = E.phase === 'tour' ? P.titulaires(E, C.L, v.id, C.now) : null;
    const pres = P.presentsDe(E, C.L, v.id, C.now);
    const gens = P.membresDe(E, v.id).map((u) => { const p = pres.includes(u); const r = T && p ? T.rolesDe(u).map((x) => P.ROLES_COURTS[x]).join(' + ') : '';
      return `<li class="${p || fini ? '' : 'abs'}">${nomDe(C, u)}${r ? ` <span>${r}</span>` : ''}</li>`; }).join('');
    const etat = fini ? `${n.note} / 20` : E.phase === 'resolu' ? (E.journal[v.id].sommeil ? 'endormie' : E.journal[v.id].famine ? 'famine !' : `+${E.journal[v.id].croissance} habitants`) : E.phase === 'avant-tour' ? (v.blason && v.nommee ? 'prête' : 'choisit son nom et son blason') : st.t;
    return `<div class="pj-ville"><div class="bl">${blason(v)}</div><div class="pj-corps"><div class="pj-nom">${ech(v.nom)}</div>
      <ul class="pj-gens">${gens}</ul>
      <div class="pj-etat ${st.ok ? 'ok' : ''}">${etat}</div>
      ${classe ? `<div class="pj-rang">${ROMAIN[i]}${i === 0 ? 'ère' : 'e'} place</div>` : ''}</div>
      <div class="pj-score"><span>${sc}</span>points</div></div>`; }).join('')}</div>`;
  if (E.phase === 'tour') { const act = E.villes.filter((v) => P.presentsDe(E, C.L, v.id, C.now).length); h += `<p class="pj-pied">Registres déposés : ${act.filter((v) => P.aRendu(E, C.L, v.id)).length} sur ${act.length}</p>`; }
  return h;
}
