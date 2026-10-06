// Parcours d'un environnement d'entreprise : des séances qui se suivent dans UNE base.
//
// Règle de Tristan (02/10/2026) : chaque élève avance à son rythme, quelle que soit la place de la
// classe. La séance N+1 ne s'ouvre qu'une fois la séance N validée — tous les jalons au vert. À ce
// moment le moteur range dans la base de l'élève une PHOTO de son travail (`db.points[id]`).
// La photo sert deux fois :
//   - elle est la preuve de validation qui ouvre la séance suivante ;
//   - elle est le point de reprise : « remettre au début de la séance N+1 » restaure la photo de
//     la séance N, c'est-à-dire ce que l'élève a RÉELLEMENT fait, pas une base fabriquée.
// L'enseignant peut débloquer à la main un élève qui n'a pas la photo ; il repart alors de la base
// de départ. Une séance déclare `parcours: true` et, sauf la première, `precedente: '<id>'`.
import { B } from './backend.js';

const comparer = (a, b) => String(a.code).localeCompare(String(b.code), 'fr', { numeric: true });

// Les séances d'un même parcours, dans l'ordre de leur code.
export function seancesDuParcours(metas, m) {
  return metas.filter((x) => (x.parcours || x.immersif) && x.portee === 'eleve' && (x.jeuId || x.id) === (m.jeuId || m.id))
    .sort(comparer);
}
// La séance choisie et toutes les suivantes : ce que « remettre au début » défait.
export function seancesDepuis(metas, m) {
  return seancesDuParcours(metas, m).filter((x) => comparer(x, m) >= 0);
}

// La VERSION DE BASE d'un parcours (refonte d'ENT-1.1, 06/10/2026) : la plus haute `versionBase` déclarée par
// ses séances, ou 0. Une base d'une version antérieure repart de zéro à sa prochaine ouverture (core/app.js) ;
// d'ici là, les séances suivantes sont fermées (sa photo de fin de séance est périmée).
export function versionDuParcours(metas, m) {
  return Math.max(0, ...seancesDuParcours(metas, m).map((x) => Number(x.versionBase) || 0));
}

// La base privée de l'élève, ou {} : Firestore et la démonstration la rendent différemment.
export async function baseDe(uid, jeuId) {
  const s = await B.lireJeuPrive(uid, jeuId);
  let brut = s ? s.data : null;
  if (typeof brut === 'string') { try { brut = JSON.parse(brut); } catch (e) { brut = null; } }
  return brut || {};
}

// Une séance est-elle ouverte à cet élève ? Rend null si oui, sinon la raison à lui montrer.
export async function verrou(metas, m, profil, gid) {
  if (!m.parcours || !m.precedente || profil.role !== 'eleve' || !gid) return null;
  const prec = metas.find((x) => x.id === m.precedente);
  const base = await baseDe(profil.uid, m.jeuId || m.id);
  const V = versionDuParcours(metas, m);
  if (V && base.v && base.versionBase !== V) {
    const premiere = seancesDuParcours(metas, m)[0];
    return `Cette entreprise a changé : recommence par ${premiere ? premiere.code : 'la première séance'}.`;
  }
  if (base.points && base.points[m.precedente]) return null;
  try {
    const f = await B.lireScore(gid, profil.uid, '_debloque-' + m.id);
    if (f) return null;
  } catch (e) { /* un drapeau illisible ne doit pas enfermer l'élève */ }
  return `Termine d'abord ${prec ? prec.code : 'la séance précédente'}.`;
}
