// IKEA — le contrôle de la facture du prestataire : les ÉCRANS communs à ENT-12.4 (guidage) et ENT-12.8 (évaluation) — documents joints (tarif, bons de livraison signés,
// facture), blocs de la fiche de contrôle, réponse par phrases (la réclamation). Chaque séance passe une fonction `dossier(db)` qui rend le dossier de SON élève
// (`construire` de `contenus/ikea-facture.js`) : pièce fixe en guidage, jeu tiré en évaluation. Rien n'est recopié : tout se calcule depuis le dossier.

import { TARIF, TVA, arrondi, tva, ttc, MOTIFS, ERREURS } from './ikea-facture.js';
import { ech, pied, euros, lireNombre as _ln } from './ikea.js';

export const lireNombre = _ln;
export const egal = (a, b) => Math.abs(a - b) < 0.005;
const date = (b, mois) => `${b.jour} ${mois}`;

const prestation = (l) => {
  if (l.issue === 'absent') return `Livraison manquée (client absent) — ${Math.round(TARIF.manquee * 100)} % du prix`;
  const colis = `${l.colis} colis`;
  if (l.mode === 'devant') return `Livraison devant chez vous, ${colis}`;
  return `Livraison dans la pièce, ${l.etages > 0 ? `${l.etages} étage${l.etages > 1 ? 's' : ''} sans ascenseur` : 'avec ascenseur'}, ${colis}`;
};

// ─────────────────────────────────────────────────────────────── les documents
export const docTarif = (id = 'tarif-presta', mois = '') => ({ id, titre: 'Le tarif du prestataire de livraison', court: 'Le tarif',
  html: `<article class="ik-doc" aria-label="Tarif du prestataire de livraison">
    <p class="ik-t">Tarif du prestataire de livraison${mois ? ` (en vigueur en ${ech(mois)})` : ''}</p>
    <p class="ik-st">Convenu entre IKEA et son prestataire pour le dernier kilomètre — prix en euros hors taxes (HT)</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Prestation</th><th class="ik-d" scope="col">Prix HT</th></tr></thead>
      <tbody>
        <tr><td>Livraison « devant chez vous » (au pied de l’immeuble)</td><td class="ik-d">${euros(TARIF.devant)}</td></tr>
        <tr><td>Livraison « dans la pièce de votre choix »</td><td class="ik-d">${euros(TARIF.piece)}</td></tr>
        <tr><td>Supplément par étage sans ascenseur (« dans la pièce » seulement)</td><td class="ik-d">${euros(TARIF.etage)}</td></tr>
        <tr><td>Colis au-delà de ${TARIF.colisInclus} (${TARIF.colisInclus} colis sont compris dans le prix), par colis</td><td class="ik-d">${euros(TARIF.colisEnPlus)}</td></tr>
        <tr><td>Livraison manquée, client absent et prévenu : ${Math.round(TARIF.manquee * 100)} % du prix de la livraison, sans supplément</td><td class="ik-d">selon le mode</td></tr>
      </tbody>
    </table>
    <p class="ik-st" style="margin-top:10px">TVA : ${Math.round(TVA * 100)} %. Le total TTC est le total HT plus la TVA.</p>
    ${pied('Tarif CONSTRUIT pour l’exercice : le vrai tarif entre IKEA et son prestataire n’est pas public, et le prestataire n’est pas nommé. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });

export const docBons = (id, dossier, mois) => ({ id, titre: 'Les bons de livraison signés', court: 'Les bons signés',
  html: (db) => {
    const F = dossier(db);
    const acces = (b) => (b.mode === 'devant' ? 'pied de l’immeuble' : b.etages > 0 ? `${b.etages} étage${b.etages > 1 ? 's' : ''} sans ascenseur` : 'immeuble avec ascenseur');
    return `<article class="ik-doc" aria-label="Bons de livraison signés">
    <p class="ik-t">Les bons de livraison signés du mois</p>
    <p class="ik-st">Un bon par livraison : le client signe à la remise, ou le livreur note qu’il était absent</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Bon</th><th scope="col">Date</th><th scope="col">Client</th><th scope="col">Mode et accès</th><th class="ik-d" scope="col">Colis</th><th scope="col">Résultat</th></tr></thead>
      <tbody>${F.bons.map((b) => `<tr><td>${ech(b.bl)}</td><td>${ech(date(b, mois))}</td><td>${ech(b.client)}</td><td>${b.mode === 'devant' ? 'Devant chez vous' : 'Dans la pièce'}, ${ech(acces(b))}</td>
        <td class="ik-d">${b.colis}</td><td>${b.issue === 'absent' ? 'Client absent (prévenu) — non livré' : `Livré — signé${b.reserve ? ` — réserve : ${ech(b.reserve)}` : ''}`}</td></tr>`).join('')}</tbody>
    </table>
    ${pied('Bons CONSTRUITS pour l’exercice (clients fictifs, noms de famille seuls). Document pédagogique — reconstitution, non contractuel.')}
  </article>`;
  } });

export const docFacture = (id, dossier, { mois, numero, periode }) => ({ id, titre: `La facture ${periode}`, court: 'La facture',
  html: (db) => {
    const F = dossier(db), T = F.totalAffiche;
    return `<article class="ik-doc" aria-label="Facture ${ech(numero)}">
    <p class="ik-t">Facture n° ${ech(numero)} — ${ech(periode)}</p>
    <p class="ik-st">Du prestataire de livraison à IKEA, centre de distribution clients de Gennevilliers — à régler sous 30 jours</p>
    <table class="ik-table">
      <thead><tr><th scope="col">N°</th><th scope="col">Bon</th><th scope="col">Date</th><th scope="col">Client</th><th scope="col">Prestation</th><th class="ik-d" scope="col">HT</th></tr></thead>
      <tbody>${F.lignes.map((l) => `<tr><td>${l.n}</td><td>${ech(l.bl)}</td><td>${ech(date(l, mois))}</td><td>${ech(l.client)}</td><td>${ech(prestation(l))}</td><td class="ik-d">${euros(l.ht)}</td></tr>`).join('')}</tbody>
      <tfoot>
        <tr><th scope="row" colspan="5">Total HT</th><td class="ik-d"><b>${euros(T)}</b></td></tr>
        <tr><th scope="row" colspan="5">TVA ${Math.round(TVA * 100)} %</th><td class="ik-d">${euros(tva(T))}</td></tr>
        <tr><th scope="row" colspan="5">Total TTC</th><td class="ik-d"><b>${euros(ttc(T))}</b></td></tr>
      </tfoot>
    </table>
    ${pied('Facture CONSTRUITE pour l’exercice : le prestataire n’est pas nommé, tout est fictif. Document pédagogique — reconstitution, non contractuel.')}
  </article>`;
  } });

// ─────────────────────────────────────────────────────────────── la fiche de contrôle
// Trois blocs « cases » (un par motif) : l'élève coche la ligne sous le motif qu'il choisit. Aucune case cochée est une réponse : c'est à la séance de ne pas récompenser l'inaction.
export const blocsControle = (dossier, { avecTotal = false } = {}) => (db) => {
  const F = dossier(db);
  const choix = F.lignes.map((l) => ({ v: String(l.n), lib: `Ligne ${l.n} — ${l.bl} — ${l.client}` }));
  const b = [
    { type: 'cadre', titre: '1. Les lignes à contester', large: true, blocs: MOTIFS.map((m) => ({ type: 'cases', id: m.id, titre: m.lib, choix })) },
  ];
  if (avecTotal) {
    b.push({ type: 'cadre', titre: '2. Le total de la facture', blocs: [
      { type: 'choix', id: 'total', lib: 'Le total HT de la facture est-il exact ?', manque: 'si le total HT est exact', choix: [{ v: 'juste', lib: 'Oui, la somme des lignes donne ce total' }, { v: 'faux', lib: 'Non, la somme des lignes ne donne pas ce total' }] },
    ] });
  }
  b.push({ type: 'cadre', titre: `${avecTotal ? '3' : '2'}. Le bon montant`, blocs: [
    { type: 'nombre', id: 'ht', lib: 'Total HT juste', unite: '€', min: 0, manque: 'le total HT juste' },
    { type: 'nombre', id: 'tva', lib: 'TVA juste', unite: '€', min: 0, manque: 'la TVA' },
    { type: 'nombre', id: 'ttc', lib: 'Total TTC juste', unite: '€', min: 0, manque: 'le total TTC juste' },
    { type: 'nombre', id: 'ecart', lib: 'Écart à réclamer (HT)', unite: '€', min: 0, manque: 'l’écart à réclamer' },
  ] });
  return b;
};

// ─────────────────────────────────────────────────────────────── ce que la fiche donne de juste (jalons)
export function jugerFiche(v, F) {
  const lu = (k) => lireNombre((v || {})[k]);
  return {
    calcul: egal(lu('ht'), F.justes.ht) && egal(lu('tva'), F.justes.tva) && egal(lu('ttc'), F.justes.ttc) && egal(lu('ecart'), F.ecartHT),
  };
}

// ─────────────────────────────────────────────────────────────── la réclamation (réponse par phrases, au vous : on écrit au prestataire)
const motifTexte = (t, f, F) => {
  const l = F.lignes[(f.lignes[0] || 1) - 1] || {};
  const b = F.bons[(f.lignes[0] || 1) - 1] || {};
  if (t === 'doublon') return `ligne ${f.lignes[0]} : doublon de la ligne ${f.accepte[0]} (même bon, même date)`;
  if (t === 'tarif') return `ligne ${f.lignes[0]} : facturée « dans la pièce », le bon dit « devant chez vous »`;
  if (t === 'nonfaite') return `ligne ${f.lignes[0]} : client absent, livraison non faite (livraison manquée seulement)`;
  if (t === 'supp') return `ligne ${f.lignes[0]} : supplément d’étage facturé, l’immeuble a un ascenseur`;
  if (t === 'qte') return `ligne ${f.lignes[0]} : ${l.colis} colis facturés, ${b.colis} sur le bon`;
  return 'total HT : la somme des lignes ne donne pas ce total';
};
const ordreErreurs = (F) => Object.keys(F.fautes).sort((a, b) => (F.fautes[a].lignes[0] || 999) - (F.fautes[b].lignes[0] || 999));
export const listeLignes = (F) => {
  const L = F.lignesContestees;
  return L.length ? (L.length === 1 ? `la ligne ${L[0]}` : `les lignes ${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`) : 'aucune ligne';
};

export const phrasesReclamation = (idPhrases, dossier, prenom) => ({ id: idPhrases, melanger: true, lignes: [
  { id: 'salutation', choix: ['Madame, Monsieur,', 'Salut,', 'Coucou,'], juste: 0 },
  { id: 'lignes', choix: (db) => {
      const F = dossier(db), L = F.lignesContestees;
      const faux = [L.slice(1), [...L.slice(0, -1), L[L.length - 1] === 1 ? 2 : L[L.length - 1] - 1], F.lignes.map((l) => l.n)];
      const dire = (A) => (A.length ? `Nous contestons ${A.length === 1 ? `la ligne ${A[0]}` : `les lignes ${A.slice(0, -1).join(', ')} et ${A[A.length - 1]}`}` : 'Nous ne contestons aucune ligne');
      return [`${dire(L)} de votre facture.`, ...faux.map((A) => `${A.length === F.lignes.length ? 'Nous contestons toutes les lignes' : dire(A)} de votre facture.`)];
    }, juste: 0 },
  { id: 'motifs', choix: (db) => {
      const F = dossier(db), E = ordreErreurs(F);
      const textes = E.map((t) => motifTexte(t, F.fautes[t], F));
      const pref = textes.map((x) => x.split(' : ')[0]), desc = textes.map((x) => x.split(' : ').slice(1).join(' : '));
      const tourne = textes.length > 1 ? pref.map((p, i) => `${p} : ${desc[(i + 1) % textes.length]}`) : [`${pref[0]} : tout est juste`];
      return [`Motifs : ${textes.join(' ; ')}.`, 'Motifs : toutes ces lignes sont au mauvais tarif.', 'Motifs : toutes ces lignes sont des livraisons non faites.', `Motifs : ${tourne.join(' ; ')}.`];
    }, juste: 0 },
  { id: 'avoir', choix: (db) => {
      const F = dossier(db), e = F.ecartHT;
      return [`Merci d’émettre un avoir de ${euros(e)} HT, soit ${euros(ttc(e))} TTC.`, `Merci d’émettre un avoir de ${euros(ttc(e))} HT.`, `Merci d’émettre un avoir de ${euros(F.justes.ht)} HT.`, 'Nous refusons de payer cette facture.'];
    }, juste: 0 },
  { id: 'fin', choix: [`Cordialement, ${prenom}, service transport, IKEA Gennevilliers`, 'Bisous', 'À plus !'], juste: 0 },
] });
