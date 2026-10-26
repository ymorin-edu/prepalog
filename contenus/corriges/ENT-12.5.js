// Corrigé d'ENT-12.5 (IKEA, « les quais du mardi »), montré dans l'onglet « Corrigés » de l'enseignant. Découverte en guidage : le planning est le même pour tous (pièce fixe).
// N'importe que les données pures : se charge aussi sous Node.

import { CAMIONS, QUAIS, OCCUPE, ARRIVEE_APRES, hlib } from '../ikea-ent125-donnees.js';

export const CORRIGE = {
  code: 'ENT-12.5',
  titre: 'IKEA — les quais du mardi',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Le planning des quais (10 points)', genre: 'tableau', texte: 'Un quai et une heure pour chacun des sept camions',
      entetes: ['Camion', 'Arrive à', 'Une solution'],
      reponses: [
        ['Navette 1 (semi, 26 palettes)', hlib('06:00'), 'Quai 21 à 6 h'],
        ['Fournisseur A (porteur, 12 palettes)', hlib('06:15'), 'Quai 26 à 6 h 15'],
        ['Navette 2 (semi, 28 palettes)', hlib('06:30'), 'Quai 23 à 6 h 30'],
        ['Fournisseur B (semi, 24 palettes)', hlib('07:00'), 'Quai 24 à 7 h'],
        ['Fournisseur C (porteur, 18 palettes)', hlib('07:30'), 'Quai 26 à 7 h 30'],
        ['Camion d’Allemagne (semi, 30 palettes)', hlib('08:00'), 'Quai 21 à 8 h'],
        ['Caisse mobile vide (porteur)', hlib('09:00'), 'Quai 22 à 9 h'],
      ],
      note: `Il y a plusieurs solutions : ce qui compte, ce sont les règles. Camions posés et jamais avant leur arrivée 3 · aucun quai avec deux camions en même temps (ni sur le créneau de la veille : ${QUAIS.find((q) => q.id === OCCUPE.quai).nom}, jusqu’à ${hlib(OCCUPE.a)}) 4 · aucune semi-remorque au quai 26 (${QUAIS.filter((q) => q.porteurs).map((q) => q.nom).join(', ')} : porteurs seulement) 3. ${CAMIONS.filter((c) => c.type === 'semi').length} camions sont des semi-remorques.` },
    { etape: 2, etapeTitre: 'Le retard (4 points)', genre: 'question', texte: 'Le camion d’Allemagne n’arrive qu’à ' + hlib(ARRIVEE_APRES),
      rep: `Le planning refait doit toujours tenir : le camion d’Allemagne ne commence pas avant ${hlib(ARRIVEE_APRES)}, personne ne se chevauche, aucune semi au quai 26. Une solution : le camion d’Allemagne sur le quai 21 à ${hlib(ARRIVEE_APRES)}, le reste inchangé.`,
      note: 'Renvoyer le même planning sans rien changer ne rapporte rien (sauf s’il tenait déjà compte du retard).' },
    { etape: 3, etapeTitre: 'Le message à Samir (2 points)', genre: 'question', texte: 'Où est le camion d’Allemagne ?',
      rep: 'Le quai et l’heure que l’élève a lui-même donnés au camion d’Allemagne dans SON planning refait (par exemple quai 21, 9 h 30).',
      note: 'Juste si le message dit exactement ce que le planning refait envoyé dit.' },
    { etape: 4, etapeTitre: 'Les questions (4 points)', genre: 'question', texte: 'Trois questions notées au fil du travail',
      rep: `Pourquoi un rendez-vous (éviter l’attente et les quais bloqués) 1,5 · pourquoi la semi ne va pas au quai 26 (hauteur de quai des porteurs) 1,5 · combien de temps le quai du camion d’Allemagne est pris (30 palettes × 2 min = 1 h) 1, corrigée au bilan. La réflexion sur le temps d’attente du chauffeur (temps de travail) n’est pas notée.`,
      note: '« Avant de commencer » (trois questions tirées) n’est pas noté.' },
  ],
};
