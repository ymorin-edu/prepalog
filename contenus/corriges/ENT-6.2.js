// Corrigé d'ENT-6.2 (France Boissons, la commande de La Cabane à Malo), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent62.js`) et l'univers
// (`contenus/france-boissons.js`) : le bon de commande attendu et le message juste. Rien n'est recopié.

import { article, CONDITIONS_CHR, CABANE, CONSIGNES } from '../france-boissons.js';
import { ATTENDU, COMMANDE, SCENARIO, libJour, phrasesMalo, CHOIX_REMPLACEMENT } from '../france-boissons-ent62.js';

const fu = (k) => `${k} fût${k > 1 ? 's' : ''}`;
const ca = (k) => `${k} casier${k > 1 ? 's' : ''}`;
const R = ATTENDU.rupture;
const REMP = ATTENDU.remplacement;
const P = REMP && REMP.article !== 'aucun' ? article(REMP.article) : null;
const total = ATTENDU.totalSansRemplacement + (REMP ? REMP.q : 0);
const pieges = CHOIX_REMPLACEMENT.filter((c) => c.v !== 'aucun' && (!REMP || c.v !== REMP.article))
  .map((c) => { const a = article(c.v); return `${a.court} : ${a.biere !== COMMANDE.remplacement.biere ? `bière ${a.biere}, pas ${COMMANDE.remplacement.biere}` : `${a.dispo} en stock`}`; });
const juste = (l) => l.choix[l.juste];
const MSG = phrasesMalo('{prénom}');

export const CORRIGE = {
  code: 'ENT-6.2',
  titre: 'France Boissons — la commande de La Cabane à Malo',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le bon de commande', genre: 'tableau', texte: 'Le bon de commande attendu',
      contexte: `Commande de Malo reçue le mardi 15 juin 2027 à 9 h 32 ; stock de Buchelay du jour à 9 h ; minimum de ${CONDITIONS_CHR.minimumFuts} fûts par livraison ; `
        + `tournée de la côte le vendredi ; commande reçue avant ${CONDITIONS_CHR.heureLimite} h la veille = livrée le jour de la tournée.`,
      entetes: ['Ligne', 'Attendu', 'Pourquoi'],
      reponses: [
        ...COMMANDE.futs.map((l) => [article(l.article).court, fu(ATTENDU.futs[l.article]),
          ATTENDU.futs[l.article] < l.q ? `Malo en demande ${l.q}, il n’en reste que ${article(l.article).dispo} : on ne promet pas ce qu’on n’a pas.`
            : `Malo en demande ${l.q}, ${article(l.article).dispo} en stock.`]),
        ['Remplacement', P ? `${P.court} × ${REMP.q}` : 'Aucun (0)',
          P ? `Sans remplacement : ${fu(ATTENDU.totalSansRemplacement)}, sous le minimum de ${CONDITIONS_CHR.minimumFuts}. Malo accepte « une autre blonde en 20 L » : `
            + `${P.court} (${P.dispo} en stock), ${fu(total)} en tout. Pièges : ${pieges.join(' ; ')}.` : 'Rien ne manque.'],
        [article(COMMANDE.eau.article).court, ca(ATTENDU.eau), 'Les casiers ne comptent pas dans le minimum.'],
        ['Jour de livraison', libJour(ATTENDU.jour), `Tournée de la côte le vendredi ; commande reçue le mardi, avant ${CONDITIONS_CHR.heureLimite} h la veille. `
          + `Malo voulait le ${libJour(COMMANDE.jourSouhaite)} : ce n’est pas un jour de tournée. La Fête de la musique est le ${libJour(SCENARIO.fete)}.`],
        ['Vides à reprendre', `${fu(ATTENDU.vides.futs)}, ${ca(ATTENDU.vides.casiers)}`,
          `Ce que dit Malo et la fiche client (consignes chez le client). Ne pas inverser fûts et casiers. Consigne : ${CONSIGNES.fut} € le fût, ${CONSIGNES.casier} € le casier.`],
      ],
      note: 'Jugé à l’envoi du bon, en 5 jalons : Heineken, Affligem, remplacement (article ET quantité), jour, eau et vides (les trois cases ensemble).' },
    { etape: 1, etapeTitre: 'Le bon de commande', genre: 'question', texte: 'Le piège en chaîne',
      rep: R && P ? `L’Affligem manque (${R.livre} pour ${R.q} demandés) : la commande tombe à ${fu(ATTENDU.totalSansRemplacement)}, sous le minimum de `
        + `${CONDITIONS_CHR.minimumFuts}. Malo a donné la solution dans son message : ${fu(REMP.q)} de ${P.nom} 20 L.` : '—',
      note: 'Edelweiss est une blanche ; la Heineken 20 L est à 0. Samedi n’est pas un jour de tournée.' },
    { etape: 2, etapeTitre: 'La réponse à Malo', genre: 'question', texte: 'Le message juste (phrases à choisir, au vous : Malo est un client)',
      rep: MSG.lignes.map(juste).join(' '),
      note: 'Jalons : la ligne « rupture », la ligne « livraison », et le ton (salutation, commande et formule de fin justes ensemble). '
        + 'La ligne « vides » n’est pas notée (déjà jugée sur le bon). Le dernier envoi compte. Ordre des choix tiré par élève.' },
    { etape: 3, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '8 jalons à 1 point, ramenés sur 20 : 5 sur le bon de commande, 3 sur la réponse à Malo. Rien n’est vrai sans envoi.',
      note: `Règle du premier bilan : « Corriger » rouvre le bon et la réponse ; la note devient la moyenne du premier bilan et de l’état à la première correction. Client : ${CABANE.nom}.` },
  ],
};
