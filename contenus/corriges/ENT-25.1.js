// Corrigé d'ENT-25.1 (la vitrine du Bac Pro Logistique, semaine des filières de 2de), montré dans l'onglet « Corrigés » de l'enseignant.
// Le même jeu pour tous (aucun tirage). N'importe que les données pures : se charge aussi sous Node.

import { LOCALISER, COLIS_TRI, SORTIES_TRI, REPLIQUES, JUSTES_APPEL, PALETTES_RC, PRODUITS_RC, PLAN_RC, AFFIRMATIONS, POIDS }
  from '../vitrine-logistique.js';

const somme = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const tournee = (commune) => (SORTIES_TRI.find((s) => s.communes.some(([c]) => c === commune)) || {}).nom || '?';
const ECART = { ouvert: 'à l’écart (carton ouvert)', enfonce: 'à l’écart (carton abîmé)', floue: 'à l’écart (étiquette illisible)' };
const choix = (r) => { const q = REPLIQUES.find((x) => x.id === r); return ((q && q.choix.find((c) => c.v === JUSTES_APPEL[r])) || {}).lib || ''; };
const GAMME_COTE = { CHI: 'A1 (chiens)', CHA: 'A2 (chats)' };

export const CORRIGE = {
  code: 'ENT-25.1',
  titre: 'Et si tu choisissais la Logistique ?',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: `⓪ La carte de France (${POIDS.carte * LOCALISER.lieux.length * 2} points)`, genre: 'tableau', texte: 'Région et département de chaque site',
      entetes: ['Site', 'Ville', 'Département'],
      reponses: LOCALISER.lieux.map((l) => [l.nom, l.ville, l.dep]),
      note: `${POIDS.carte} point par réponse juste au premier coup (région, puis département).` },
    { etape: 2, etapeTitre: `① Amazon : le tri (${somme(POIDS.tri)} points)`, genre: 'tableau', texte: 'La tournée de chaque colis',
      entetes: ['Colis', 'Commune', 'Où il va'],
      reponses: COLIS_TRI.map((c) => [c.n, c.commune, c.etat === 'ferme' ? tournee(c.commune) : ECART[c.etat] || 'à l’écart']),
      note: `Colis en règle : ${POIDS.tri.communes} points ; pièges (Dreux, Saran) : ${POIDS.tri.pieges} ; écarts avec le bon motif : ${POIDS.tri.ecarts}. On lit la ligne de la commune, pas le nom du relais.` },
    { etape: 3, etapeTitre: `② Stellantis : la ligne (${somme(POIDS.ligne)} points)`, genre: 'question', texte: 'Vingt minutes au bord de ligne',
      rep: 'Envoyer les robots à temps vers les postes qui vont manquer de pièces : la ligne monte ses voitures sans s’arrêter.',
      note: `Voitures montées : ${POIDS.ligne.voitures} points ; ligne qui ne s’arrête pas (ou très peu) : ${POIDS.ligne.arret} points. Jugé sur la partie de l’élève.` },
    { etape: 4, etapeTitre: `③ Airbus : l’appel (${somme(POIDS.appel)} points)`, genre: 'tableau', texte: 'Les réponses à Nathalie (premier choix compté)',
      entetes: ['Question', 'Réponse attendue'],
      reponses: ['aog', 'transport', 'revision', 'client'].map((r) => [REPLIQUES.find((q) => q.id === r).dit.replace('{prenom}', '…'), choix(r)]),
      note: 'Règle : hélicoptère au sol, le plus rapide ; sinon, le moins cher qui arrive à temps.' },
    { etape: 5, etapeTitre: `④ Royal Canin : ranger (${POIDS.palette * PALETTES_RC.length} points)`, genre: 'tableau', texte: 'Où ranger chaque palette',
      entetes: ['Palette', 'Côté', 'Travée (rotation)'],
      reponses: PALETTES_RC.map((p) => [`${p.id} · ${PRODUITS_RC[p.produit].nom}`, GAMME_COTE[PRODUITS_RC[p.produit].gamme], `${p.rotation} : ${PLAN_RC.rotation[p.rotation].texte}`]),
      note: `${POIDS.palette} point par palette rangée sans faute : bon côté, bonne travée, emplacement libre et en service (A2-T01-N2-E2 est hors service).` },
    { etape: 6, etapeTitre: `⑤ Le Bac Pro Logistique (${somme(POIDS.vf)} points)`, genre: 'tableau', texte: 'Vrai ou faux',
      entetes: ['Affirmation', 'Réponse'],
      reponses: AFFIRMATIONS.map((a) => [a.lib, a.juste === 'vrai' ? 'Vrai' : 'Faux']),
      note: 'Le poste préféré n’est pas jugé : la réponse de chaque élève est rangée dans sa base (fiche « Et toi ? », champ « prefere »).' },
  ],
};
