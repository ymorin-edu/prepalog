// LE TRANSFERT D'UN MESSAGE (chantier D-1, 09/10/2026, brief `docs/briefs/ENT-6.1-france-boissons-organigramme.md`, §7.1).
//
// L'élève tient un accueil ou une boîte partagée : un message arrive, il le TRANSFÈRE à la personne qui doit s'en
// occuper (geste réel, décision de Tristan du 08/10/2026). La messagerie (`core/types/entreprise-messagerie.js`) dessine
// le bouton « Transférer à… », la liste et la confirmation ; ce module ne fait que lire et ranger l'état. Il est PUR
// (aucun accès au navigateur, aucun import) : un contenu de séance l'importe, comme `ficheEnvoyee` de `fiche.js`.
//
// ── CE QUE LA SÉANCE DÉCLARE ──────────────────────────────────────────────────────────────────────────────────
//   Un mail semé ou déclenché porte une clé et la liste des destinataires possibles (ids de `equipe`, dans l'ordre
//   où ils s'affichent ; `equipe` est passée à `creerEntreprise`, avec `nom` et `role`, et `appel` si besoin) :
//     { folder: 'in', cle: 'msg-malo', from: 'Malo, La Cabane à Malo', …, transfert: { a: ['helene', 'ines', 'karim'] } }
//   Jalon :      transfertDe(db, 'msg-malo', '<id de la séance>') → { fait, a, at, premier, n, rouvert }
//                ('à faire' tant que `fait` est faux ; le jalon juge `a`, le DERNIER destinataire : voir plus bas)
//   Condition :  apresTransfert('msg-malo') (`core/declencheurs.js`) ; geste `messagerie:transfert` (`apresGeste`)
//   Corriger :   le jalon déclare `ecran: 'transfert:msg-malo'` ; l'accusé d'un transfert corrigé vient de
//                `volet.corrections['msg-malo'](prenom, n, db)` (n = 2 au premier transfert corrigé).
//
// ── L'ÉTAT DANS LA BASE DE L'ÉLÈVE (cloisonné par séance) ──────────────────────────────────────────────────────
//   db.transferts[<séance>][<clé du mail>] = { a, at, premier, n, rouvert? }
//   a       : l'id du destinataire du DERNIER transfert ; at : son heure (ms)
//   premier : l'id du destinataire du PREMIER transfert, écrit une fois, jamais réécrit
//   n       : le nombre de transferts (1, puis 2 après une correction…) : `nombreDeCorrections` le lit
//   rouvert : posé par « Corriger » (jalon faux), retiré au transfert suivant. Hors correction, un message transféré
//             ne se transfère plus.
// Le PREMIER BILAN est figé par le moteur (`db.indicateurs[séance].bilan1`, au premier moment où tous les jalons sont
// jugés), comme pour une fiche ou une réponse par phrases : avant lui, chaque message n'a qu'un transfert (le bouton
// disparaît au premier), donc `a` vaut `premier`. Après « Corriger », `a` est le nouvel état (`bilan2`, note moyennée).
// Un jalon qui lirait `premier` ne verrait jamais la correction. Rien n'est écrit pour l'enseignant ni après la remise
// d'une copie. « Réinitialiser » efface les transferts avec le reste du travail.

export const GESTE_TRANSFERT = 'messagerie:transfert';

// Les transferts de la séance (lecture seule, sans rien créer).
export const transfertsDe = (db, seance) => (db && db.transferts && db.transferts[seance]) || {};

// L'aide des jalons. `seance` est obligatoire (l'id de la séance, `meta.id`) : deux séances qui partagent une base
// peuvent porter un message de même clé.
export function transfertDe(db, idMail, seance) {
  if (!seance) throw new Error(`transfertDe(db, '${idMail}', seance) : il manque l’id de la séance (meta.id)`);
  const t = transfertsDe(db, seance)[idMail];
  if (!t || !t.a) return { fait: false, a: null, at: null, premier: null, n: 0, rouvert: false };
  return { fait: true, a: t.a, at: t.at || null, premier: t.premier || t.a, n: t.n || 1, rouvert: !!t.rouvert };
}

// Le bouton « Transférer à… » est offert : jamais transféré, ou rouvert par « Corriger ».
export function peutTransferer(db, seance, idMail) {
  const t = transfertsDe(db, seance)[idMail];
  return !t || !!t.rouvert;
}

// Range un transfert. `premier` n'est écrit qu'au premier ; les suivants changent `a`, `at`, `n` et ferment la reprise.
export function rangerTransfert(db, seance, idMail, a, at) {
  if (!db.transferts) db.transferts = {};
  const S = db.transferts[seance] || (db.transferts[seance] = {});
  const t = S[idMail];
  if (!t) return (S[idMail] = { a, at, premier: a, n: 1 });
  t.a = a; t.at = at; t.n = (t.n || 1) + 1;
  delete t.rouvert;
  return t;
}

// « Corriger » : rouvre un message déjà transféré. Rend vrai s'il vient d'être rouvert.
export function rouvrirTransfert(db, seance, idMail) {
  const t = transfertsDe(db, seance)[idMail];
  if (!t || t.rouvert) return false;
  t.rouvert = true;
  return true;
}

// Ce qui ne va pas dans le `transfert` d'un mail (null si rien) : une clé, au moins un destinataire, tous connus.
export function fauteTransfert(m, personnes) {
  const T = m && m.transfert;
  if (!T) return null;
  if (!m.cle) return `le message « ${m.subject || '?'} » porte « transfert » sans « cle » (la clé qui range le transfert)`;
  if (!Array.isArray(T.a) || !T.a.length) return `le message « ${m.cle} » : « transfert.a » doit lister au moins un destinataire`;
  const inconnus = T.a.filter((id) => !(personnes && personnes[id]));
  if (inconnus.length) return `le message « ${m.cle} » : destinataire inconnu ${inconnus.map((x) => `« ${x} »`).join(', ')} (passer « equipe » à creerEntreprise)`;
  return null;
}

// L'heure d'un transfert, à la française : « 8 h 42 ».
export function heureTransfert(ts) {
  const d = new Date(ts);
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`;
}
