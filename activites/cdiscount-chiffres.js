// ENT-2.2 — Cdiscount, séance « Ce que disent les chiffres ». Deuxième séance de l'environnement
// Cdiscount (C1.6, suivi des stocks et inventaire, 1L), GUIDAGE du geste tableur.
//
// L'élève exporte les lignes des bons de préparation (écran Commandes), calcule dans Excel ou
// LibreOffice l'écart entre le stock trouvé au rayon et le stock du logiciel, isole les références
// en écart (SI), compte les constats par référence (NB.SI), dépose son fichier (menu Fichiers :
// retour détaillé, redépôt illimité), puis écrit à Nadia les références à recompter — la liste
// qu'ENT-2.3 lui redemandera. Écrite le 04/10/2026 (brief
// `docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md`). Données : `contenus/cdiscount-chiffres.js`
// (importées d'ENT-2.3) ; geste : `core/types/export-tableur.js`.
//
// Compétence : C1.6 seule. Le brief proposait C3.2 « si le code le porte » : C3.2 existe, mais c'est
// la TRAÇABILITÉ — y ranger une séance de tableur fausserait cette note.
//
// Livrée fermée (`pret: true, ouverture: 'prof'`) : Tristan l'essaie, puis l'ouvre lui-même.
// Trame élève et corrigé : déposés par Cowork, branchés le 04/10/2026 (brief `docs/briefs/CDISCOUNT-trames-eleve.md`).

import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as CDISCOUNT from '../contenus/cdiscount.js';
import * as SEANCE from '../contenus/cdiscount-chiffres.js';
const s = seanceEntreprise(CDISCOUNT, SEANCE, {
  id: 'cdiscount-chiffres',
  code: 'ENT-2.2',
  titre: 'Cdiscount — ce que disent les chiffres',
  desc: 'Exporter les constats des préparateurs, les analyser dans le tableur et choisir les références à recompter.',
  // Compétences et temps pédagogique : voir core/competences.js.
  competences: ['C1.6'],
  temps: 'guidage',
  volume: SEANCE.VOLUME,
  notation: 'avancement',
  // PAS de `reinitialisable` : la remise à zéro est réservée aux séances X.1 (décision du 02/10/2026).
  trame: 'cdiscount-chiffres',
  pret: true,
  ouverture: 'prof',
}, {
  // Les écrans de données du menu (05/10/2026) : ceux dont la séance se sert, et au moindre doute on les garde.
  menu: ['commandes', 'stock'],
  exercice: SEANCE.EXERCICE,
  tableur: SEANCE.TABLEUR,
});
export const meta = s.meta;
export const rendre = s.rendre;
