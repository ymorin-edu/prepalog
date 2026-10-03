// Les conditions des messages DÉCLENCHÉS (option B, « un collègue écrit pendant que tu
// travailles », 03/10/2026, brief `docs/briefs/MOTEUR-messages-en-cours-de-seance.md`).
//
// Un volet d'entreprise peut déclarer des messages qui arrivent en cours de séance
// (`volet.declencheurs`, voir `core/types/entreprise.js`) : une seule fois, quand une condition
// `quand(db)` devient vraie. Ce fichier fabrique ces conditions, sur deux gestes métier :
//
//   quand: apresJalon(ETAPES, 'feuille')                     l'élève a fini une étape
//   quand: apresMail({ a: CHEFFE, ligne: 'Stock actuel :', nombre: true })   il a rendu compte
//   quand: tous(apresJalon(…), apresMail(…))                 les deux
//
// Décision de Tristan : **aucun clic de menu, aucune ouverture d'écran, aucune minuterie** ne
// déclenche quoi que ce soit (un élève qui clique partout au début ferait arriver la suite).
// Une condition n'est ni un jalon ni un point du barème : elle ne compte pas dans le suivi.

// Comparaison sans accents ni majuscules.
export const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// La dernière ligne d'un texte qui porte l'intitulé (un élève qui se corrige en bas de message
// est lu sur sa correction). Venue d'ENT-2.1, partagée avec ENT-2.4.
export function ligne(texte, intitule) {
  const cle = nrm(intitule).replace(/\s*:$/, '');
  const l = String(texte || '').split(/\r?\n/).filter((x) => nrm(x).includes(cle));
  return l.length ? l[l.length - 1] : null;
}

// Les nombres d'une ligne, une fois retirés les références (ECO-BT-01, REC-26-0415…) et les dates.
export function nombres(l) {
  const propre = String(l || '')
    .replace(/\b[A-Z]{2,}[A-Z0-9]*(?:-[A-Z0-9]+)+\b/gi, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ');
  return (propre.match(/\d+/g) || []).map((x) => parseInt(x, 10));
}

// Vrai quand l'étape `id` de la séance est réussie (`status: 'ok'`).
// **Réservé aux étapes dont l'élève voit lui-même qu'elles sont finies** (ENT-3.2 : la feuille
// de calcul affichée « vérifiée ») : sur une étape qu'on ne lui corrige pas à l'écran, l'arrivée
// du message lui dirait « c'est juste » (alerte 28). `U` = l'univers, si l'étape s'en sert.
export function apresJalon(etapes, id, U) {
  return (db) => {
    const e = (etapes || []).find((x) => x.id === id);
    return !!e && e.verifier(db, U).status === 'ok';
  };
}

// Vrai dès qu'un mail ENVOYÉ (dossier 'out') à l'adresse `a` existe — un brouillon ou un mail
// reçu ne comptent pas. Si `ligne` est donnée, le mail doit porter une ligne avec cet intitulé ;
// avec `nombre: true`, cette ligne doit contenir au moins un nombre (références et dates retirées ;
// l'intitulé ne doit donc pas porter de chiffre).
// **Juste ou faux, peu importe** : `nombre` écarte seulement l'envoi vide (l'amorce telle quelle).
// Ne jamais conditionner l'arrivée à une réponse juste : elle la révélerait, et l'élève qui se
// trompe resterait bloqué.
export function apresMail({ a, ligne: intitule, nombre = false } = {}) {
  return (db) => (db.mails || []).some((m) => {
    if (m.folder !== 'out' || nrm(m.toMail) !== nrm(a)) return false;
    if (!intitule) return true;
    const l = ligne(m.text, intitule);
    if (l === null) return false;
    return !nombre || nombres(l).length > 0;
  });
}

// Vrai quand toutes les conditions le sont.
export function tous(...conditions) {
  return (db) => conditions.every((c) => c(db));
}
