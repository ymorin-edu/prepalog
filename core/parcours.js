// Parcours d'un environnement d'entreprise : des séances qui se suivent dans UNE base.
//
// Règle de Tristan (02/10/2026) : chaque élève avance à son rythme, quelle que soit la place de la
// classe. La séance N+1 ne s'ouvre qu'une fois la séance N validée — tous les jalons au vert. À ce
// moment le moteur range dans la base de l'élève une PHOTO de son travail (`db.points[id]`).
// EXCEPTION (07/10/2026, lots A et A bis de SMOBY-retours-classe-5.1) : une séance qui déclare `correction: true`
// (ENT-5.1 d'abord) range la photo dès que TOUS les jalons sont jugés, justes ou faux (le premier bilan), et la
// remplace à chaque nouveau bilan complet qui change : la séance suivante s'ouvre sans attendre que tout soit juste,
// et part du travail corrigé. Ce fichier n'a pas changé : le verrou lit toujours la photo.
// La photo sert deux fois :
//   - elle est la preuve de validation qui ouvre la séance suivante ;
//   - elle est le point de reprise : « remettre au début de la séance N+1 » restaure la photo de
//     la séance N, c'est-à-dire ce que l'élève a RÉELLEMENT fait, pas une base fabriquée.
// L'enseignant peut débloquer à la main un élève qui n'a pas la photo ; il repart alors de la base
// de départ. Une séance déclare `parcours: true` et, sauf la première, `precedente: '<id>'`.
//
// Deux façons de ranger un parcours (brief SMOBY-retours-5.1-5.2, lot B, 06/10/2026) :
//   - UNE base commune (Spartoo : `jeuId` partagé) ; la photo de la séance N est dans cette base ;
//   - UNE base PAR SÉANCE (Smoby : pas de `jeuId`) ; les séances ne sont liées que par `precedente`,
//     la photo de la séance N reste dans la base de N, et chaque séance repart de SA base de départ.
// Les séances d'un parcours sont donc celles qui partagent la base OU que relie la chaîne des `precedente`.
import { B } from './backend.js';
import { estSimulog } from '../activites/index.js';

const comparer = (a, b) => String(a.code).localeCompare(String(b.code), 'fr', { numeric: true });

// La base d'une séance, et deux séances qui partagent la leur.
export const baseDeSeance = (m) => m.jeuId || m.id;
export const memeBase = (a, b) => baseDeSeance(a) === baseDeSeance(b);

// Les séances d'un même parcours, dans l'ordre de leur code.
export function seancesDuParcours(metas, m) {
  const L = metas.filter((x) => estSimulog(x) && x.portee === 'eleve');
  const dedans = new Set(L.filter((x) => memeBase(x, m)).map((x) => x.id));
  for (let n = -1; n !== dedans.size;) {
    n = dedans.size;
    L.forEach((x) => {
      if (x.parcours && x.precedente && (dedans.has(x.id) || dedans.has(x.precedente))) { dedans.add(x.id); dedans.add(x.precedente); }
    });
  }
  return L.filter((x) => dedans.has(x.id)).sort(comparer);
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
  const base = await baseDe(profil.uid, baseDeSeance(m));
  const V = versionDuParcours(metas, m);
  if (V && base.v && base.versionBase !== V) {
    const premiere = seancesDuParcours(metas, m)[0];
    return `Cette entreprise a changé : recommence par ${premiere ? premiere.code : 'la première séance'}.`;
  }
  // La photo de la séance précédente est dans SA base : celle de la séance quand elle est commune (Spartoo).
  const basePrec = !prec || memeBase(prec, m) ? base : await baseDe(profil.uid, baseDeSeance(prec));
  if (basePrec.points && basePrec.points[m.precedente]) return null;
  try {
    const f = await B.lireScore(gid, profil.uid, '_debloque-' + m.id);
    if (f) return null;
  } catch (e) { /* un drapeau illisible ne doit pas enfermer l'élève */ }
  return `Termine d'abord ${prec ? prec.code : 'la séance précédente'}.`;
}

// Reprise demandée par l'enseignant (« Remettre au début de la séance S », espace enseignant > Suivi) :
// le drapeau `_reprise-<S>` le plus récent, pas encore appliqué à cette base (`base.reprise`), est appliqué
// à l'ouverture de la séance `m` (voir core/app.js, qui dit pourquoi c'est l'élève qui le fait).
// « Au début de S » = la photo de la séance précédente quand elle est dans cette base (base commune), sinon
// la base de départ. Les photos de S et des suivantes sont retirées. Base par séance : une reprise de S ne
// touche que les bases de S et des suivantes ; celle d'une séance d'avant reste telle quelle.
// `lireDrapeau(id)` rend le drapeau `_reprise-<id>` ou null. Rend vrai si la base a été remise.
export async function appliquerReprise(metas, m, base, lireDrapeau) {
  let derniere = null;
  for (const x of seancesDuParcours(metas, m)) {
    if (!memeBase(x, m) && comparer(m, x) < 0) continue;
    const rep = await lireDrapeau(x.id);
    if (rep && rep.dateMaj > (base.reprise || 0) && (!derniere || rep.dateMaj > derniere.rep.dateMaj)) derniere = { x, rep };
  }
  if (!derniere) return false;
  const { x, rep } = derniere;
  const prec = metas.find((y) => y.id === x.precedente);
  const photo = prec && memeBase(prec, m) && base.points && base.points[x.precedente];
  const aDefaire = new Set(seancesDepuis(metas, x).map((y) => y.id));
  const versionBase = base.versionBase;
  const gardees = {};
  Object.keys(base.points || {}).forEach((k) => { if (!aDefaire.has(k)) gardees[k] = base.points[k]; });
  Object.keys(base).forEach((k) => delete base[k]);
  if (photo) Object.assign(base, JSON.parse(JSON.stringify(photo)));
  else Object.keys(m.tables || {}).forEach((t) => { base[t] = []; });
  if (Object.keys(gardees).length) base.points = gardees;
  if (versionBase) base.versionBase = versionBase;
  base.reprise = rep.dateMaj;
  return true;
}
