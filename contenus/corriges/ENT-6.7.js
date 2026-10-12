// Corrigé d'ENT-6.7 (France Boissons, la commande de Malo à la voix), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent67-donnees.js` : la commande d'ENT-6.2, les tiroirs,
// les lignes du terminal) et le fichier de questions. Rien n'est recopié.

import { ENTREPOT, REFERENCES, EMPLACEMENTS, LIGNES, POIDS, GROUPES, GROUPE_DE } from '../france-boissons-ent67-donnees.js';
import { QUESTIONS } from '../questions/ENT-6.7.js';

const net = (t) => String(t).replace(/<[^>]+>/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, a) => a || m);
const libDe = (q) => (q.choix.find((c) => c.v === q.juste) || {}).lib || '';
const nb = (x) => String(x).replace('.', ',');
const refDe = (adr) => REFERENCES[EMPLACEMENTS[adr].ref];
const desig = (adr) => { const e = EMPLACEMENTS[adr]; return `${refDe(adr).nom}${e.lot ? `, lot ${e.lot}` : ''}`; };
const notees = QUESTIONS.liste.filter((q) => q.type !== 'ouverture');
const somme = Object.values(POIDS).reduce((t, p) => t + p, 0);
const partDe = (g) => Object.entries(POIDS).filter(([id]) => GROUPE_DE[id] === g).reduce((t, [, p]) => t + p, 0);

// Les lignes dans l'ordre du terminal, la ligne de remplacement juste après celle qui la déclenche (« Abîmé » attendu).
const lignes = LIGNES.flatMap((l) => {
  const attendu = l.attendu ? `« Abîmé », ${l.attendu.n}, puis ${l.prends - l.attendu.n} pris` : `${l.prends} pris, sans mot`;
  const L = [[l.emplacement, EMPLACEMENTS[l.emplacement].code, desig(l.emplacement), String(l.prends), attendu]];
  if (l.remplacement) {
    const n = l.attendu.n;
    L.push([l.remplacement.emplacement, EMPLACEMENTS[l.remplacement.emplacement].code, `${desig(l.remplacement.emplacement)} (ajoutée par le terminal)`,
      String(n), `${n} pris`]);
  }
  return L;
});

// Un montage de référence (un juste parmi d'autres) : tous les fûts de 30 L sur la palette 1, le reste sur la palette 2, les casiers
// en dernier (« à côté » puis posés), sur les cases libres puis sur un fût.
const futs = (adr) => refDe(adr).type === 'fut';
const compte = [{}, {}];
LIGNES.concat(LIGNES.filter((l) => l.remplacement).map((l) => ({ emplacement: l.remplacement.emplacement, prends: l.attendu.n })))
  .slice().sort((a, b) => futs(b.emplacement) - futs(a.emplacement))   // les fûts d'abord, les casiers en dernier
  .forEach((l) => {
    const n = l.attendu ? l.prends - l.attendu.n : l.prends;
    const r = refDe(l.emplacement);
    const k = futs(l.emplacement) && r.litres === 30 ? 0 : 1;
    const nom = r.type === 'casier' ? `casiers ${r.court}` : r.court;
    if (n) compte[k][nom] = (compte[k][nom] || 0) + n;
  });
const parPalette = compte.map((C) => Object.entries(C).map(([nom, n]) => `${n} ${nom}`));

export const CORRIGE = {
  code: 'ENT-6.7',
  titre: 'France Boissons — la commande de Malo à la voix',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Préparer à la voix', genre: 'tableau', texte: 'Les lignes du terminal, dans son ordre',
      contexte: 'La commande juste d’ENT-6.2. Le code ne se lit que de près (étiquette de la lisse) ; un code faux est redemandé et gardé en '
        + 'trace, jamais noté. Le fût cabossé (A-T03, le plus en avant) se signale « Abîmé », 1 : le terminal ajoute la ligne du lot S24.',
      entetes: ['Emplacement', 'Code', 'Article', 'Demandé', 'Réponse juste'],
      reponses: lignes,
      note: 'Pièges : prendre 2 Affligem S18 sans rien dire (le terminal accepte : le fût cabossé part chez Malo, jalons 3 et 4 faux, '
        + 'pas de ligne S24) ; « Manquant » ou « Emplacement vide » au lieu d’« Abîmé » (la ligne S24 arrive, mais le jalon 3 est faux : le '
        + 'fût est là, il est inutilisable).' },
    { etape: 2, etapeTitre: 'Finir les palettes', genre: 'tableau', texte: 'Un montage juste (parmi d’autres)',
      contexte: 'Les critères jugent les règles, pas ce montage. Ils ne sont jugés que si les lignes sont justes et que rien n’est « à côté » '
        + '(aucun point par inaction). Règle de pose : 6 cases par palette ; un objet va d’abord sur une case vide ; sinon un fût monte sur un '
        + 'casier (la faute), un casier sur un fût.',
      entetes: ['Palette', 'Contenu', 'Film', 'Étiquettes'],
      reponses: parPalette.map((L, i) => [`Palette ${i + 1}`, L.join(' + '), '3 à 5 tours', 'deux côtés opposés + le dessus']),
      note: `Les casiers d’eau arrivent en premier mais se posent à la fin : « À côté, je le pose après ». Étiquette : « ${ENTREPOT.montage.etiquette} ».` },
    { etape: 3, etapeTitre: 'Les questions', genre: 'tableau', texte: 'Les questions posées pendant la séance',
      contexte: 'Trois sont notées (4 points sur 20). La réflexion « gagné / perdu à la voix » est sous le bilan, non notée. Les questions de '
        + 'l’écran « Avant de commencer » ne comptent pas.',
      entetes: ['Question', 'Quand', 'Réponse attendue'],
      reponses: notees.map((q) => [net(q.enonce).slice(0, 110), `notée ${nb(q.poids)}${q.apres === 'bilan' ? ', corrigée au bilan' : ''}`, libDe(q)]) },
    { etape: 4, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: `Jalons sur ${nb(somme)} points : ${Object.values(GROUPES).map((g) => `${g.toLowerCase()} ${nb(partDe(g))}`).join(', ')}. `
        + `Questions notées ${QUESTIONS.part}. Total 20, tout en C2.1.`,
      note: 'Codes faux, durée et lignes par heure (« Ce que le terminal sait de toi ») : non notés. Les lignes du terminal ne se refont pas ; '
        + 'le montage se reprend (« Reposer le dernier ») et se revérifie.' },
  ],
};
