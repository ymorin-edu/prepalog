// Le message PAR PHRASES À CHOISIR (2de, lot 2 du brief `docs/briefs/MOTEUR-2de-S1.md`, 04/10/2026).
//
// En début de 2de, l'élève ne rédige pas sa réponse : il la CONSTRUIT en choisissant une phrase par
// ligne. Un mail semé par le volet (ou par un déclencheur) le déclare ainsi :
//
//   { from: 'Sophie Martin', fromMail: '…', subject: '…', text: '…',
//     phrases: {
//       id: 'reponse-sophie',                       // nom stable, lu par les jalons (obligatoire)
//       lignes: [
//         { id: 'salut', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
//         { id: 'recu',  texte: "J'ai reçu les 4 palettes d'Arinthod." },   // ligne imposée, pas de choix
//         { id: 'qui',   choix: (db) => [...], juste: (db) => 2 },          // valeurs calculées
//       ],
//       melanger: true,                             // ordre des choix tiré par élève (absent = vrai)
//     } }
//
// Le bouton « Répondre » de ce mail ouvre une liste déroulante par ligne et l'aperçu du message ;
// « Envoyer » range un mail envoyé ORDINAIRE (le texte des lignes, donc `apresMail` marche) qui garde
// les choix : `phrases: { id, choix: { salut: 0, … } }`, numéros dans l'ordre DÉCLARÉ (pas l'ordre
// affiché). Aucune correction avant l'envoi : c'est le bilan de la séance qui dit les lignes fausses.
//
// Les fonctions (`choix`, `juste`) sont calculées UNE FOIS, quand le mail entre dans la base (une
// base ne garde pas de fonction) ; l'ordre affiché est tiré à ce moment-là et rangé avec le mail
// (`ordre`), donc il ne bouge plus d'une ouverture à l'autre.

import { hasard } from './tirage.js';

// Le mail tel qu'il entre dans la base : fonctions calculées, ordre d'affichage tiré. `graine` : celle
// de l'élève (son identifiant), pour qu'à la même séance deux élèves n'aient pas le même ordre.
export function preparerPhrases(m, db, graine) {
  const P = m && m.phrases;
  if (!P || !Array.isArray(P.lignes)) return m;
  const id = P.id || `phrases-${m.subject || ''}`;
  const melanger = P.melanger !== false;
  const lignes = P.lignes.map((l) => {
    if (l.texte != null) return { id: l.id, texte: String(typeof l.texte === 'function' ? l.texte(db) : l.texte) };
    const choix = (typeof l.choix === 'function' ? l.choix(db) : l.choix || []).map(String);
    const juste = typeof l.juste === 'function' ? l.juste(db) : l.juste;
    const rangs = choix.map((_, i) => i);
    const ordre = melanger ? hasard(`${graine}|${id}|${l.id}`).melanger(rangs) : rangs;
    return { id: l.id, choix, juste: Number.isInteger(juste) ? juste : -1, ordre };
  });
  m.phrases = { id, lignes };
  return m;
}

// Les lignes à choisir (une ligne imposée ne se juge pas).
const aChoisir = (P) => (P && P.lignes ? P.lignes.filter((l) => l.texte == null) : []);

// Le texte du message composé : une ligne par ligne déclarée, choix manquant = ligne vide.
export function texteCompose(P, choix) {
  return (P.lignes || []).map((l) => (l.texte != null ? l.texte
    : (choix && Number.isInteger(choix[l.id]) ? l.choix[choix[l.id]] || '' : ''))).join('\n');
}

// Pour les jalons : ce que dit le DERNIER message envoyé en réponse (un élève qui se corrige est lu sur
// sa correction), plus de quoi repérer la réussite du premier coup (lot 6).
//   → { envoye, justes: [ids], faux: [ids], envois, premierCoup }
// Rien d'envoyé : toutes les lignes fausses (aucun jalon vrai par inaction).
export function phrasesJustes(db, idMessage) {
  const mails = (db && db.mails) || [];
  const decl = mails.find((m) => m.folder === 'in' && m.phrases && m.phrases.id === idMessage);
  const lignes = aChoisir(decl && decl.phrases);
  const envois = mails.filter((m) => m.folder === 'out' && m.phrases && m.phrases.id === idMessage)
    .sort((a, b) => (a.ts - b.ts) || (a.id - b.id));
  const juger = (envoi) => {
    const justes = [], faux = [];
    lignes.forEach((l) => {
      const c = envoi && envoi.phrases.choix ? envoi.phrases.choix[l.id] : undefined;
      (Number.isInteger(c) && c === l.juste ? justes : faux).push(l.id);
    });
    return { justes, faux };
  };
  const dernier = juger(envois[envois.length - 1]);
  return {
    envoye: envois.length > 0,
    justes: envois.length ? dernier.justes : [],
    faux: envois.length ? dernier.faux : lignes.map((l) => l.id),
    envois: envois.length,
    premierCoup: envois.length > 0 && lignes.length > 0 && juger(envois[0]).faux.length === 0,
  };
}
