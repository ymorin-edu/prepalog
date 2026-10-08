// ENT-1.2 — Spartoo, séance « préparation ». Deuxième des trois séances de l'environnement,
// porté depuis LogiSim (org « p42 »).
//
// Chaque élève travaille dans sa propre base : messagerie, commandes, préparation, bon de
// préparation, catalogue, stock, tiers et console. Rien n'est partagé — portée `eleve`.
//
// Les consignes sont dans la trame élève : le site porte l'environnement de travail, la
// trame porte le déroulé de la séance. Depuis le 01/10/2026 elle est aussi **téléchargeable
// depuis le menu de l'environnement** (PDF à imprimer, Word à compléter) : l'enseignant
// retrouve le fichier à imprimer, et une séance sans photocopie reste faisable au clavier.
// La déclarer ci-dessous vaut validation — voir core/types/entreprise.js.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
const s = seanceEntreprise(SPARTOO, SPARTOO, {
  id: 'spartoo',
  code: 'ENT-1.2',
  titre: 'Spartoo — préparation',
  desc: "Traiter une commande client : contrôle du stock, bon de préparation et réapprovisionnement.",
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C2.2'],
  temps: 'guidage',
  notation: 'avancement',
  // Remise à zéro de la base par l'élève : seulement en séance X.1, qui ouvre la chaîne. Une
  // séance X.2 ou X.3 reprend le travail de la précédente ; l'effacer ferait perdre les séances d'avant.
  reinitialisable: false,
  // Base commune aux trois séances de Spartoo : l'élève prépare sur le stock qu'il a
  // lui-même réceptionné. Le score reste propre à cette activité.
  jeuId: 'spartoo',
  // Parcours strict : ENT-1.2 ne s'ouvre qu'à l'élève qui a validé ENT-1.1 (voir core/parcours.js).
  parcours: true,
  precedente: 'spartoo-reception',
  // Trame élève : la déclarer, c'est la valider (relue par Tristan). Le corrigé se déduit du code.
  trame: 'spartoo-preparation',
  pret: true,
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'stock', 'catalogue', 'clients', 'fournisseurs', 'console'],
  reponsesFournisseur: SPARTOO.REPONSES_FOURNISSEUR,
});
export const meta = s.meta;
export const rendre = s.rendre;
