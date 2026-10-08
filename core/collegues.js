// Plusieurs enseignants sur le même site (chantier 11, lot 11a, 09/10/2026).
//
// Ce fichier ne parle à aucun service : ce sont des règles simples, écrites UNE fois et utilisées
// par les deux backends (réel et démonstration) et par l'espace enseignant. Comme la suite de
// tests ne joue que la démonstration, c'est ce partage qui fait que les gardes testées sont bien
// celles du mode réel.
//
// Principe de tout le chantier : on ne supprime que ce qu'on a créé, ou ce dont on est
// responsable. Sinon, on détache (l'élève réapparaît chez celui qui l'a créé, rien n'est perdu).
// « Responsable » d'un groupe = le premier enseignant de sa liste `profs` (le créateur) : aucun
// champ nouveau, les groupes existants n'ont pas à bouger.

// Les six premiers signes de l'identifiant d'un enseignant : le suffixe d'un groupe dont le nom
// est déjà pris par un collègue (« 1l1 » devient « 1l1-ab12cd »).
export const uidCourt = (uid) => String(uid || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'x';

// L'identifiant technique d'un groupe : le nom sans accent ni espace, borné à 30 signes (la
// ligne de classement d'un élève refuse un identifiant de groupe de 60 signes ou plus, et le
// suffixe d'un collègue en ajoute 7).
export function idGroupe(nom) {
  return String(nom || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 30).replace(/-$/, '');
}

export const responsable = (g) => ((g && g.profs) || [])[0] || null;

// « Prénom Nom » d'un profil d'enseignant, à défaut son adresse.
export const libelleProf = (p) => {
  if (!p) return '';
  return `${p.prenom || ''} ${p.nom || ''}`.trim() || p.email || '';
};

// Pourquoi un enseignant ne peut pas SUPPRIMER cet élève ; null s'il le peut.
//  - `groupes` : les groupes de cet enseignant (documents complets, avec leur liste `profs`).
//  - un élève qui figure dans un groupe qui n'est pas à moi : jamais supprimé (un collègue le suit
//    aussi) ;
//  - un élève créé par un collègue : supprimé seulement par le responsable de son groupe ;
//  - un élève sans auteur (créé à la console) est supprimable par tout enseignant, comme avant.
// La garde du backend est la vraie protection ; l'écran s'en sert pour n'offrir « Supprimer »
// que lorsqu'elle laisserait passer.
export function gardeSuppressionEleve(el, { moi, groupes }) {
  if (!el) return null;
  const gs = el.groupes || [];
  const miens = new Map((groupes || []).map((g) => [g.id, g]));
  if (gs.some((id) => !miens.has(id))) {
    return "Cet élève est aussi dans un groupe qui n'est pas le vôtre : vous pouvez seulement le retirer de votre groupe, pas le supprimer.";
  }
  if (el.creePar && el.creePar !== moi) {
    const g0 = gs.length ? miens.get(gs[0]) : null;
    if (!g0 || responsable(g0) !== moi) {
      return "Cet élève a été créé par un collègue et vous n'êtes pas le responsable de son groupe : vous pouvez le retirer de votre groupe, pas le supprimer.";
    }
  }
  return null;
}

// Pourquoi un enseignant ne peut pas supprimer ce groupe ; null s'il le peut.
export function gardeSuppressionGroupe(g, moi) {
  const r = responsable(g);
  if (g && r && r !== moi) {
    return "Seul le responsable du groupe (l'enseignant qui l'a créé) peut le supprimer. Vous pouvez le quitter : il disparaît alors de votre liste, sans rien effacer.";
  }
  return null;
}

// Une erreur de service dite en français. `defaut` sert quand elle n'a aucun message.
export function lisible(e, defaut = 'Opération impossible.') {
  const code = String((e && e.code) || '').toLowerCase();
  const msg = String((e && e.message) || '');
  if (code.includes('permission-denied') || /insufficient permissions|permission_denied|permission denied/i.test(msg)) {
    return "Refusé par les règles de sécurité : cela appartient à un autre enseignant ou à un groupe qui n'est pas le vôtre.";
  }
  if (code.includes('email-already-in-use')) {
    return "Ce matricule est déjà utilisé sur le site, peut-être par un élève d'un autre enseignant : choisissez-en un autre.";
  }
  return msg || defaut;
}
