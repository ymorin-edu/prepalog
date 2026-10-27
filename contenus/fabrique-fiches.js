// La FABRIQUE des séances « en fiches » (27/10/2026) : une séance d'entreprise faite d'une SUITE DE FICHES courtes, une consigne par écran,
// chaque fiche ouverte par un message du tuteur après l'envoi de la précédente, puis (facultatif) un compte rendu par phrases. Écrite pour
// Amazon (ENT-19.x, CAP), Leroy Merlin (ENT-20.x, 1re) et Lidl (ENT-21.x, 2de) : aucune vue nouvelle, rien dans `core/` (elle ne fait
// qu'assembler ce que `seanceEntreprise` attend : FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS). Modèle : `contenus/pelleau-ent101.js`.
//
//   seanceFiches(U, S) avec
//   U (l'univers) : { tuteur: { nom, mail, appel }, MENTION, STYLE, LEXIQUE?, EQUIPE }
//   S (la séance) : {
//     id, titre, exercice, prefixe (ex. '191' : ids des fiches `f191-<pas>`, du message par phrases `cr-191`),
//     documents: [{ id, titre, court, html }],             // tous les documents de la séance
//     pas: [{ id, libelle, titre, sousTitre, objet, message, pieces?: [ids], documents?: [ids], blocs: [...] | (db) => [...],
//             jalons: [{ id, titre, groupe, poids, juste: (valeurs, db) => bool, titreBilan? }], largeurDocs? }],
//     localiser?: { apres: k (la carte s'ouvre après la fiche k ; -1 = d'abord), vue, poids, groupe, objet, message, ... (option `localiser`) },
//     planning?: { apres: k (le Planning s'ouvre après la fiche k ; -1 = d'abord), decl (la déclaration de la vue `core/types/planning.js`, sans `quand`),
//                  poids: { 'v1-<jalon>' | 'v2-<jalon>': poids } (seuls ces jalons comptent), groupe, libelle, objet, message, pieces?,
//                  alea?: { objet, message, pieces? } (le message qui ouvre la reprise : `phasePlanning: 2`), solution?: texte du corrigé },
//     compteRendu?: { objet, message, lignes: (prenom, db) => [...], poids, groupe, titre },   // juste si toutes les lignes (hors salutation/fin) sont justes
//     fin: 'texte du dernier message', questions, accueil?: [[titre, texte]…], finFige?, tirage? (jeu tiré par élève) }
//
// Règles tenues ici (CLAUDE.md, règles de Tristan) : rien n'est jugé avant l'envoi (un jalon rend « attente ») ; l'inaction vaut 0 ; aucun
// message ne juge (un envoi corrigé reçoit un accusé neutre) ; tutoiement.

import { apresFiche, apresPlanning, localiserFini } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { etapesPlanning } from '../core/types/planning.js';

const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
const gesteFait = (db, seance, nom) => !!(db && db.gestes && db.gestes[seance] && db.gestes[seance][nom]);
export const memes = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x) => b.includes(x));
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(/[€%]/g, '').replace(/(kg|m|cm|m³|m3|°C|min|h|L)$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
export const proche = (v, attendu, tol = 0.051) => Math.abs(lireNombre(v) - attendu) < tol;

export function seanceFiches(U, S) {
  const ID = S.id;
  const fid = (p) => `f${S.prefixe}-${p.id}`;
  const PHRASES_ID = `cr-${S.prefixe}`;
  const VOLET_ID = `v-${S.prefixe}`;
  const T = U.tuteur;
  const fait = (p) => (db) => envoyee(db, fid(p)) || gesteFait(db, ID, `fiche:${fid(p)}:envoyer`);
  const L = S.localiser || null;
  const carteFaite = L ? (db) => localiserFini(L.vue)(db, ID) : null;
  // Le Planning (Kuehne+Nagel ENT-24.x, 27/10/2026) : fait quand sa dernière version est envoyée (la reprise s'il y a un aléa).
  const PL = S.planning || null;
  const planFait = PL ? (db) => apresPlanning(PL.decl.id, PL.alea ? 2 : 1)(db) : null;

  // L'ordre des écrans : fiches, avec la carte glissée après la fiche `L.apres`.
  const ordre = [];
  if (L && L.apres === -1) ordre.push({ carte: true });
  if (PL && PL.apres === -1) ordre.push({ plan: true });
  S.pas.forEach((p, k) => { ordre.push({ p }); if (L && L.apres === k) ordre.push({ carte: true }); if (PL && PL.apres === k) ordre.push({ plan: true }); });
  const faitDe = (x) => (x.carte ? carteFaite : x.plan ? planFait : fait(x.p));
  const avant = (i) => (i > 0 ? faitDe(ordre[i - 1]) : null);

  const FICHES = ordre.filter((x) => x.p).map((x) => {
    const p = x.p; const i = ordre.indexOf(x); const pre = avant(i);
    return { id: fid(p), libelle: p.libelle, titre: p.titre, sousTitre: p.sousTitre || '', documents: p.documents || [],
      ...(p.largeurDocs ? { largeurDocs: p.largeurDocs } : {}), defile: true,
      bouton: `Ouvrir la fiche « ${p.libelle} »`, ...(pre ? { quand: (db) => pre(db) } : {}), blocs: p.blocs,
      envoi: { bouton: `Envoyer la fiche à ${T.appel}`, a: T.appel, suite: p.suite || `${T.appel} va te répondre.` } };
  });

  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: T.nom, fromMail: T.mail, to: prenom,
    subject, kind: 'text', text, ...(o.extra || {}) });
  const signe = (t) => `${t}\n\n${T.appel}`;
  const ouvre = (x, prenom, decale) => (x.plan
    ? mail(prenom, PL.objet, signe(PL.message.replace(/\{prenom\}/g, prenom)), { decale, extra: PL.pieces ? { pieces: PL.pieces } : {} })
    : x.carte
    ? mail(prenom, L.objet, signe(L.message), { decale })
    : mail(prenom, x.p.objet, signe(x.p.message.replace(/\{prenom\}/g, prenom)), { decale, extra: { ...(x.p.pieces ? { pieces: x.p.pieces } : {}), ouvreFiche: fid(x.p) } }));
  const CR = S.compteRendu || null;
  const declencheurs = [];
  ordre.forEach((x, i) => { if (i > 0) declencheurs.push({ id: `ouvre-${i}`, quand: faitDe(ordre[i - 1]), semer: (prenom) => ({ mails: [ouvre(x, prenom, 1000)] }) }); });
  // L'aléa du Planning : la 1re version envoyée (juste ou fausse), le message ouvre la reprise.
  if (PL && PL.alea) declencheurs.push({ id: 'alea', quand: apresPlanning(PL.decl.id), phasePlanning: 2, semer: (prenom) => ({ mails: [mail(prenom, PL.alea.objet,
    signe(PL.alea.message.replace(/\{prenom\}/g, prenom)), { decale: 1000, extra: PL.alea.pieces ? { pieces: PL.alea.pieces } : {} })] }) });
  const dernier = faitDe(ordre[ordre.length - 1]);
  if (CR) {
    declencheurs.push({ id: 'compte', quand: dernier, semer: (prenom, db) => ({ mails: [mail(prenom, CR.objet, signe(CR.message.replace(/\{prenom\}/g, prenom)), {
      decale: 1000, extra: { phrases: { id: PHRASES_ID, melanger: true, lignes: CR.lignes(prenom, db || {}) } } })] }) });
    declencheurs.push({ id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye, semer: (prenom) => ({ mails: [mail(prenom, 'Merci', signe(S.fin.replace(/\{prenom\}/g, prenom)), { decale: 2000 })] }) });
  } else {
    declencheurs.push({ id: 'fin', quand: dernier, semer: (prenom) => ({ mails: [mail(prenom, 'Merci', signe(S.fin.replace(/\{prenom\}/g, prenom)), { decale: 2000 })] }) });
  }
  const accuse = (p) => (prenom) => ({ mails: [mail(prenom, `RE : ${p.objet}`, signe('Merci, j’ai ta nouvelle fiche.'), { decale: 500 })] });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({ mails: [ouvre(ordre[0], prenom, -3600e3)] }),
    declencheurs,
    corrections: Object.fromEntries(S.pas.map((p) => [fid(p), accuse(p)])),
  };

  // Les jalons : rien de juste avant l'envoi ; l'ordre est celui des écrans.
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const ETAPES = [];
  for (const x of ordre) {
    if (x.carte) {
      ETAPES.push(...etapesLocaliser(L, ID).map((j) => (j.bonus ? j : Object.assign(j, { poids: L.poids, groupe: L.groupe }))));
      continue;
    }
    if (x.plan) {
      const E = etapesPlanning(PL.decl).filter((e) => PL.poids[e.id] != null);
      const inconnus = Object.keys(PL.poids).filter((k) => !E.some((e) => e.id === k));
      if (inconnus.length) throw new Error(`${ID} : jalon du Planning inconnu (${inconnus.join(', ')})`);
      ETAPES.push(...E.map((e) => Object.assign(e, { poids: PL.poids[e.id], groupe: PL.groupe || PL.libelle, ecran: `planning:${PL.decl.id}` })));
      continue;
    }
    const p = x.p; const F = fid(p);
    for (const j of p.jalons) {
      ETAPES.push({ id: j.id, titre: j.titre, groupe: j.groupe || p.libelle, poids: j.poids, ecran: `fiche:${F}`, ...(j.titreBilan ? { titreBilan: j.titreBilan } : {}),
        verifier(db) { if (!envoyee(db, F)) return attente; return j.juste(valeursDe(db, F), db) ? ok : ko; } });
    }
  }
  if (CR) {
    const cles = CR.lignes('X', {}).map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
    ETAPES.push({ id: 'compte-rendu', titre: CR.titre || `Le compte rendu à ${T.appel}`, groupe: CR.groupe || 'Le compte rendu', poids: CR.poids,
      ecran: `phrases:${PHRASES_ID}`,
      verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  }
  const sansPoids = ETAPES.filter((e) => !e.bonus && typeof e.poids !== 'number');
  if (sansPoids.length) throw new Error(`${ID} : jalon sans poids (${sansPoids.map((e) => e.id).join(', ')})`);
  const ids = ETAPES.map((e) => e.id);
  if (new Set(ids).size !== ids.length) throw new Error(`${ID} : deux jalons ont le même id`);

  const SUITE = ordre.map((x) => (x.plan ? { vue: 'planning', libelle: PL.libelle, fait: planFait } : x.carte ? { vue: 'localiser', libelle: L.libelle, fait: carteFaite }
    : { vue: x === ordre.find((y) => y.p) ? 'fiche' : `fiche:${fid(x.p)}`, libelle: x.p.libelle, fait: fait(x.p) }));
  if (CR) SUITE.push({ vue: 'mail', mail: PHRASES_ID, libelle: `Le compte rendu à ${T.appel}`, fait: (db) => phrasesJustes(db, PHRASES_ID).envoye });
  const num = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  const ACCUEIL = {
    titre: S.titre, kpis: ['mail'],
    etapes: [
      [`Lire le message de ${T.appel}`, 'Menu Messagerie : chaque message ouvre l’écran suivant.'],
      ...SUITE.map((x, i) => [`${num[i]} ${x.libelle}`, (S.accueil && S.accueil[i]) || '']),
      ['Bon à savoir', U.MENTION],
    ],
  };
  const OPTIONS = {
    suite: SUITE, menu: [], exercice: S.exercice || S.titre, sansTrame: 'Tout se fait à l’écran', equipe: U.EQUIPE,
    ...(U.LEXIQUE ? { lexique: U.LEXIQUE } : {}), ...(S.questions ? { questions: S.questions } : {}),
    documents: S.documents, documentsStyle: U.STYLE, fiches: FICHES,
    ...(L ? { localiser: L, finFige: S.finFige || 'La carte se joue au premier essai : elle ne se rejoue pas.' } : {}),
    ...(S.tirage ? { tirage: true } : {}),   // jeu tiré par élève : le moteur pose la graine (l'identifiant de l'élève) à la première ouverture
    ...(PL ? { planning: PL.apres >= 0 ? { ...PL.decl, quand: (db) => fait(S.pas[PL.apres])(db) } : PL.decl } : {}),
    ...(L && L.apres >= 0 ? { fermetures: { localiser: { ouvertSi: (db) => fait(S.pas[L.apres])(db), message: `Après la fiche « ${S.pas[L.apres].libelle} »` } } } : {}),
  };
  // Le corrigé (onglet « Corrigés » de l'enseignant), recalculé depuis les jalons : `attendu` (texte ou fonction de la base) de chaque
  // jalon, la bonne phrase de chaque ligne du compte rendu. `corrige(db)` : celui d'un élève (son jeu, ses cases) ; `db = {}` : le jeu de référence.
  const pts = (x) => `${String(x).replace('.', ',')} pt${x >= 2 ? 's' : ''}`;
  const val = (a, db) => (typeof a === 'function' ? a(db) : a);
  function corrige(db = {}, { questions } = {}) {
    const items = [];
    let k = 0;
    if (L) items.push({ etape: ++k, etapeTitre: `${L.libelle || 'La carte'} (${pts(L.poids)} par réponse)`, genre: 'question', texte: 'La région et le département de chaque lieu',
      rep: L.lieux.map((x) => `${x.ville} : département ${x.dep}`).join(' · ') });
    if (PL) {
      const E = etapesPlanning(PL.decl).filter((e) => PL.poids[e.id] != null);
      const tot = E.reduce((t, e) => t + PL.poids[e.id], 0);
      items.push({ etape: ++k, etapeTitre: `${PL.libelle} (${pts(Math.round(tot * 100) / 100)})`, genre: 'question', texte: PL.decl.titre || PL.libelle,
        rep: E.map((e) => `${e.titre} (${pts(PL.poids[e.id])})`).join(' · '), note: PL.solution || '' });
    }
    for (const p of S.pas) {
      const tot = p.jalons.reduce((t, j) => t + j.poids, 0);
      items.push({ etape: ++k, etapeTitre: `${p.libelle} (${pts(Math.round(tot * 100) / 100)})`, genre: 'question', texte: p.titre,
        rep: p.jalons.map((j) => `${val(j.titreBilan, db) || j.titre} (${pts(j.poids)}) : ${val(j.attendu, db) ?? '—'}`).join(' · '),
      });
    }
    if (CR) items.push({ etape: ++k, etapeTitre: `${CR.titre || `Le compte rendu à ${T.appel}`} (${pts(CR.poids)})`, genre: 'question', texte: 'Les phrases justes',
      rep: CR.lignes('(prénom)', db).map((l) => l.choix[l.juste]).join(' · '), note: 'Toutes les lignes justes (la salutation et la fin ne comptent pas).' });
    if (questions) items.push({ etape: ++k, etapeTitre: 'Les questions', genre: 'question', texte: questions.texte, rep: questions.rep, note: questions.note || '' });
    return items;
  }
  return { ID, PHRASES_ID, VOLET_ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige };
}
