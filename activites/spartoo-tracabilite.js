// ENT-1.3 — Spartoo, séance « traçabilité ». Dernière des trois séances de l'environnement.
//
// Même entreprise, même base que la réception (ENT-1.1) et la préparation (ENT-1.2) : c'est ce
// que dit `meta.jeuId`. L'élève remonte ici le lot qu'il a lui-même réceptionné, retrouve les
// clients qui ont reçu des paires de ce lot, et bloque ce qu'il en reste.
//
// Les consignes sont dans la trame élève : le site porte l'environnement de travail, la
// trame porte le déroulé de la séance. Depuis le 01/10/2026 elle est aussi **téléchargeable
// depuis le menu de l'environnement** (PDF à imprimer, Word à compléter) : l'enseignant
// retrouve le fichier à imprimer, et une séance sans photocopie reste faisable au clavier.
// La déclarer ci-dessous vaut validation — voir core/types/entreprise.js.

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as SPARTOO from '../contenus/spartoo.js';
import * as SEANCE from '../contenus/spartoo-tracabilite.js';
const s = seanceEntreprise(SPARTOO, SEANCE, {
  id: 'spartoo-tracabilite',
  code: 'ENT-1.3',
  titre: 'Spartoo — traçabilité',
  desc: "Remonter un lot défectueux dans les deux sens, bloquer le stock restant et rendre compte.",
  // Compétences et temps pédagogique : voir core/competences.js (validé par Tristan, 02/10/2026).
  competences: ['C3.2'],
  temps: 'guidage',
  notation: 'avancement',
  // Remise à zéro de la base par l'élève : seulement en séance X.1, qui ouvre la chaîne. Une
  // séance X.2 ou X.3 reprend le travail de la précédente ; l'effacer ferait perdre les séances d'avant.
  reinitialisable: false,
  // La base est celle de Spartoo, partagée avec les deux autres séances. Le score, lui, reste
  // enregistré sur cette activité : le suivi de classe garde une ligne par séance.
  jeuId: 'spartoo',
  // Parcours strict : ENT-1.3 ne s'ouvre qu'à l'élève qui a validé ENT-1.2 (voir core/parcours.js).
  parcours: true,
  precedente: 'spartoo',
  // Trame élève : la déclarer, c'est la valider (relue par Tristan). Le corrigé se déduit du code.
  trame: 'spartoo-tracabilite',
  pret: true,
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'blocage', 'clients', 'console'],
  reponsesFournisseur: SPARTOO.REPONSES_FOURNISSEUR,
  exercice: SEANCE.EXERCICE,
});
export const meta = s.meta;
export const rendre = s.rendre;
