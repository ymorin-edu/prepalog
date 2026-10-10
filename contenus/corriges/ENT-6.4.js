// Corrigé d'ENT-6.4 (France Boissons, le camion de la brasserie), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent64.js`), les jalons de la vue quai
// (`jalonsQuai`) et le fichier de questions : les défauts de la scène, le tableau des palettes, les réserves écrites, le message,
// les questions, le barème. Rien n'est recopié.

import { PALETTES_ENT64, SECURITE, QUAI_ENT64, POIDS, ETAPES, CHOIX_RESERVES, phrasesNadia, LIGNE_RECU } from '../france-boissons-ent64.js';
import { QUESTIONS } from '../questions/ENT-6.4.js';
import { jalonsQuai, DECISIONS, libMotifs } from '../../core/types/quai.js';

// Les marques des mots cliquables (« [[cale|calé]] ») ne servent qu'à l'écran de la séance.
const net = (t) => String(t).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, a) => a || m);
const attendus = jalonsQuai({}, QUAI_ENT64).L;
const attendu = (id) => net((attendus.find((l) => l.id === id) || {}).attendu || '');
const reel = (p) => 8 - p.manque.length;
const ALEA = (p) => {
  const L = [];
  if (p.etiq.ref !== p.ref) L.push(`l’étiquette dit ${p.etiq.ref} alors que le BL annonce ${p.ref} (erreur du BL)`);
  if (Object.keys(p.avarie).length) L.push('un fût fuit : coulure et flaque, visibles seulement de l’arrière (il faut faire le tour)');
  if (p.manque.length) L.push(`une place vide, mais le BL n’annonce que ${p.bl} fûts : la palette est conforme (piège de comptage)`);
  return L.join(' ; ') || 'aucun';
};
const juste = (l) => (l.texte != null ? l.texte : l.choix[l.juste]);
const libDe = (q) => (q.choix.find((c) => c.v === q.juste) || {}).lib || '';
const notees = QUESTIONS.liste.filter((q) => q.juste && q.type !== 'ouverture');
const somme = ETAPES.reduce((t, e) => t + (POIDS[e.id] || 0), 0);

export const CORRIGE = {
  code: 'ENT-6.4',
  titre: 'France Boissons — le camion de la brasserie',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Avant de décharger : la scène', genre: 'tableau', texte: 'Ce que l’élève doit repérer sur le quai',
      contexte: 'L’élève inspecte le quai iso lui-même (deux vues : dehors, puis dedans porte levée), clique ce qui ne va pas, puis « Signaler à Nadia ». '
        + 'Aucune liste. Un clic à côté de tout objet compte comme un faux signalement. Entraînement : un défaut oublié est remis en ordre sans un mot au '
        + 'déchargement (Nadia n’arrête pas l’élève) ; le jalon reste faux.',
      entetes: ['Objet (vue)', 'État dessiné', 'Attendu'],
      reponses: SECURITE.points.map((x) => [`${x.objet} (${x.vue})`, net(x.lib), x.ok ? 'en ordre : ne pas le signaler (piège)' : 'défaut : signaler avant de décharger']),
      note: `Bilan si un défaut manque : « ${SECURITE.bilan} »` },
    { etape: 3, etapeTitre: 'Contrôle des palettes', genre: 'tableau', texte: 'Le contrôle de chaque palette (déchargées au chariot frontal)',
      contexte: 'Une palette = un bac de rétention noir, huit places en quinconce (3 + 2 + 3). Comptage et décision justes forment un seul jalon ; P2 et P3 '
        + 'portent en plus la réserve écrite. Brouillon de calcul (pas de feuille : les lignes de la feuille parlent de couches).',
      entetes: ['Palette', 'Produit au BL', 'BL', 'Fûts réels', 'Aléa', 'Décision — motif'],
      reponses: PALETTES_ENT64.map((p) => [p.id, `${p.nom} (${p.ref})`, String(p.bl), String(reel(p)), ALEA(p),
        `${DECISIONS[p.attendu]} — ${libMotifs(p.motifAttendu === 'aucun' ? [] : [p.motifAttendu], QUAI_ENT64)}`]) },
    { etape: 4, etapeTitre: 'Réserves sur le BL', genre: 'tableau', texte: 'Les réserves écrites sur le BL',
      contexte: 'La référence de P2 est celle LUE sur l’étiquette (PEL-20), pas celle du BL. Le BL signé, le camion est reparti : il ne se corrige plus.',
      entetes: ['Palette', 'Ligne écrite sur le BL'],
      reponses: PALETTES_ENT64.filter((p) => p.attendu !== 'accepter').map((p) => [p.id, attendu(`${p.id}-reserve`)]) },
    { etape: 5, etapeTitre: 'Compte rendu à Nadia', genre: 'question', texte: 'Le message juste (phrases à choisir, au tu : Nadia est une collègue)',
      rep: phrasesNadia('{prénom}').lignes.map(juste).join(' '),
      note: `La ligne « ${LIGNE_RECU} » est imposée. Salutation et fin ne sont pas notées. Nadia répond en reprenant ce que l’élève a écrit, sans corriger `
        + `(par exemple « ${CHOIX_RESERVES[0].echo} »). C’est le seul envoi que « Corriger » rouvre.` },
    { etape: 6, etapeTitre: 'Les questions', genre: 'tableau', texte: 'Les questions posées par Nadia pendant la séance',
      contexte: 'Trois sont notées (4 points sur 20), deux sont pour réfléchir. Les questions de l’écran « Avant de commencer » ne comptent pas.',
      entetes: ['Question', 'Quand', 'Réponse attendue'],
      reponses: QUESTIONS.liste.filter((q) => q.type !== 'ouverture').map((q) => [net(q.enonce).slice(0, 110), q.reflexion ? 'pour réfléchir' : `notée ${q.poids}`, q.juste ? libDe(q) : 'sans réponse unique']),
      note: `Notées : ${notees.map((q) => `${q.id} (${q.poids})`).join(', ')}.` },
    { etape: 7, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: `Jalons sur ${somme} points : sécurité 5,5 (danger n° 1 : 2, danger n° 2 : 2, aucun faux signalement : 1,5), contrôle des palettes 2,5 (P1 : 1, P4 : 1,5), `
        + 'réserves et BL 6 (P2 : 2,5, P3 : 2,5, BL signé : 1), message à Nadia 2 (réserves : 1, fût qui fuit : 1). Questions notées 4 (1,5 + 1 + 1,5). Total 20.',
      note: 'Rien n’est vrai sans geste : sans signalement, les trois jalons de sécurité sont faux ; les jalons de sécurité sont jugés au « C’est bon, on peut décharger ». '
        + 'Règle du premier bilan : « Corriger » rouvre le compte rendu à Nadia seulement ; la note devient la moyenne du premier bilan et de l’état à la première correction.' },
  ],
};
