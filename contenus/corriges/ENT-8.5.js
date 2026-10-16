// Corrigé d’ENT-8.5 (Action, évaluation « se situer dans un nouveau site »), montré dans l’onglet « Corrigés » de l’enseignant.
//
// Chaque élève a reçu SON site (Onnaing ou Belleville-en-Beaujolais, `contenus/action-eval-sites.js`, le même qu’en ENT-8.6) et SON tirage
// (`contenus/action-ent85-donnees.js`) : ses 3 acteurs tirés de « Qui est qui ? » (avec Action), l’ordre de départ de la chaîne, ses 3
// situations de « Ce que je change ». `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d’un élève, calculé
// depuis sa base (jamais recopié). Les 4 questions d’« Avant de commencer » tirées et ses réponses se lisent dans le Suivi.

import {
  ID, TIRAGE, SITES, ACTEURS, ROLES, CHAINE, SITUATIONS, siteEleve, remplir, nomActeur, acteursDe, situationsDe, ordreDepart, libChaine,
  libRole, texteSituation, justeSituation,
} from '../action-ent85-donnees.js';
import { siteDe } from '../action-eval-sites.js';
import { FRANCE } from '../france-contours.js';

// La carte se calcule ici depuis les lieux et les contours, sans importer le moteur : le test des corrigés charge chaque corrigé sous Node,
// où `window` n’existe pas. Même forme que `corrigeLocaliser` de `core/types/localiser.js`.
const REG = new Map(FRANCE.regions.map((r) => [r.code, r])), DEP = new Map(FRANCE.deps.map((d) => [d.code, d]));
const carteDe = (S) => S.lieux.map((l) => ({ id: l.id, nom: l.nom, ville: l.ville,
  region: `${REG.get(l.region).nom} (${l.region})`, departement: `${DEP.get(l.dep).nom} (${l.dep})` }));
const lieuEnClair = (c) => `${c.nom} : région ${c.region} · département ${c.departement} · ville ${c.ville}`;
const S0 = SITES.onnaing, S1 = SITES.belleville;

export const CORRIGE = {
  code: 'ENT-8.5',
  titre: 'Action — évaluation : se situer dans un nouveau site',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'La carte de France (4,5 points)', genre: 'tableau', texte: 'Les deux sites tirés (un par élève, le même qu’en ENT-8.6)',
      entetes: ['Site', 'Lieu', 'Région', 'Département', 'Ville'],
      reponses: [S0, S1].flatMap((S) => carteDe(S).map((c) => [`${S.site} (${S.prestataire})`, c.nom, c.region, c.departement, c.ville])),
      note: 'Notés au PREMIER essai : la région et le département des 3 lieux (0,75 chacun) ; la ville se joue sans note. Niveau standard pour tous, '
        + 'aide après deux erreurs (elle ne rapporte rien). Points approchés : Onnaing, Belleville et le port au centre de la commune, La Sentinelle sur la zone du Vignoble.' },
    { etape: 2, etapeTitre: 'Qui est qui ? (4 points)', genre: 'tableau', texte: 'Action à chaque élève, et 3 acteurs tirés (un facile, un moyen, un difficile)',
      entetes: ['Acteur', 'Rôle attendu'],
      reponses: ACTEURS.map((p) => [`${remplir(p.nom, { ...S0, prestataire: 'GXO ou Kuehne+Nagel (le prestataire du site)', ville: 'La Sentinelle ou Villefranche-sur-Saône' })}${p.difficulte ? ` (${p.difficulte})` : ' (tous)'}`, libRole(p.role)]),
      note: `Les 8 rôles sont offerts à chaque ligne : ${ROLES.map((r) => r.lib).join(' · ')}. 1 point par ligne ; les rôles justes sont tous différents.` },
    { etape: 3, etapeTitre: 'La chaîne (3,5 points)', genre: 'tableau', texte: 'Le chemin d’un produit (départ mélangé par élève, jamais une moitié juste)',
      entetes: ['Rang', 'Étape (Onnaing)', 'Étape (Belleville)'],
      reponses: CHAINE.map((c, i) => [String(i + 1), remplir(c.lib, S0), remplir(c.lib, S1)]),
      note: 'Les 3 premières dans l’ordre (rangs 1 à 3) : 1,25 ; les 3 dernières dans l’ordre (rangs 4 à 6) : 1,25 ; « Toi, tu travailles ici » = l’entrepôt (rang 4) : 1.' },
    { etape: 4, etapeTitre: 'Ce que je change (4 points)', genre: 'tableau', texte: 'Les 11 situations de la banque (chaque élève en a 3 : facile 1, moyenne 1,5, difficile 1,5)',
      entetes: ['Situation', 'Ce qui arrive au magasin (exemple : Onnaing)'],
      reponses: SITUATIONS.map((p) => [`${texteSituation(p, S0)} (${p.difficulte})`, justeSituation(p, S0)]),
      note: 'Choix : le juste, deux pièges, « Rien ne change au magasin ». Jamais ensemble : s-etiquette et s-camion, s-ordre et s-retard.' },
    { etape: 5, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions clés tirées (3 de préparation, 1 d’image), sans aide',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Copie rendue : rien ne remonte avant la remise, la note est figée à la remise. Une fiche envoyée incomplète : ses lignes vides sont fausses.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) {
    const g = `${uid || 'anonyme'}|${ID}`;
    db = { tirages: { [ID]: { graine: g, ...TIRAGE.tirer(g) } } };
  }
  const S = siteEleve(db);
  const items = [{ genre: 'fait', texte: 'Site tiré', rep: `${S.site} (${S.prestataire}) — magasin de ${S.ville} — tuteur : ${S.tuteur.prenom}` }];
  carteDe(S).forEach((c) => items.push({ genre: 'fait', texte: `Carte : ${c.nom}`, rep: lieuEnClair(c) }));
  acteursDe(db).forEach((p, i) => items.push({ genre: 'fait', texte: `Qui est qui ?, ligne ${i + 1} : ${nomActeur(p, S)}`, rep: libRole(p.role) }));
  items.push({ genre: 'fait', texte: `La chaîne : départ « ${ordreDepart(db).map((v) => libChaine(v, S)).join(' → ')} »`,
    rep: `ordre attendu : ${CHAINE.map((c) => remplir(c.lib, S)).join(' → ')} ; tu travailles ici : « ${libChaine('r', S)} »` });
  situationsDe(db).forEach((p, i) => items.push({ genre: 'fait', texte: `Ce que je change, ligne ${i + 1} (${p.difficulte}) : ${texteSituation(p, S)}`, rep: justeSituation(p, S) }));
  if (!ouvert) return { texte: `Cet élève n’a pas encore ouvert la séance : voici le site et le tirage qu’il recevra (site : ${siteDe(uid) === 'onnaing' ? 'Onnaing' : 'Belleville-en-Beaujolais'}).`, items };
  return { texte: '', items };
}
