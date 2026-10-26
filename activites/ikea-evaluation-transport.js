// ENT-12.7 — IKEA, « évaluation : la livraison de ta cliente » (2de, poste B, transport, évaluation de OTM-C1.1, OTM-C1.2 et OTM-C3.1). Voir `contenus/ikea-ent127.js`.
//
// UN JEU PAR ÉLÈVE (règle du 03/10/2026) : cliente, imprévu et décalage de la journée sont tirés de la graine de l'élève. Le moteur ne sait pas encore tirer un `planning`, ni une fiche, ni un
// appel : comme ENT-11.4, un moteur par graine est fabriqué à la demande (`instance`) ; la graine est celle que le moteur pose à l'ouverture (`db.tirage.graine`), `noter(db)` la relit dans la base.
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as IKEA from '../contenus/ikea.js';
import * as SEANCE from '../contenus/ikea-ent127.js';
import { jeuDe, graineDeBase } from '../contenus/ikea-ent127-donnees.js';

const META = {
  id: 'ikea-evaluation-transport',
  code: 'ENT-12.7',
  titre: 'IKEA — évaluation : la livraison de ta cliente',
  desc: 'Sans aide : appeler un(e) client(e), choisir le mode de livraison de chaque article et son prix, puis tenir les créneaux de la journée quand un imprévu tombe et prévenir les clients.',
  niveaux: ['2de'],
  competences: ['OTM-C1.1', 'OTM-C1.2', 'OTM-C3.1'],
  domaines: ['D1', 'D2'],
  temps: 'evaluation',
  bareme: 20,                                          // jalons pondérés (16) + « Avant de commencer » (4), somme = 20
  copie: true,
  questions: 'ENT-12.7',
  pret: true,
  ouverture: 'prof',                                   // livrée fermée aux élèves : l'enseignant l'essaie, puis l'ouvre lui-même (Conduite de séance)
};

const instances = new Map();
const instance = (graine) => {
  const g = String(graine || '');
  if (!instances.has(g)) {
    const jeu = jeuDe(g);
    instances.set(g, seanceEntreprise(IKEA, SEANCE, META, {
      ...SEANCE.OPTIONS,
      equipe: SEANCE.equipeDe(jeu),
      telephone: SEANCE.telephoneDe(jeu),
      fiches: [SEANCE.ficheModeDe(jeu), SEANCE.fichePrevenirDe(jeu)],
      planning: SEANCE.planningDe(g),
    }));
  }
  return instances.get(g);
};

export const meta = instance('').meta;
export const rendre = (hote, ctx) => {
  const db = (ctx.jeu && ctx.jeu.etat && ctx.jeu.etat()) || {};
  const prenom = ctx.profil.prenom || ctx.profil.nom || 'Élève';
  return instance(graineDeBase(db) || ctx.profil.uid || prenom).rendre(hote, ctx);
};
export const noter = (db) => instance(graineDeBase(db)).noter(db);
