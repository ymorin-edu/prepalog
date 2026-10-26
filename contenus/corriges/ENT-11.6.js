// Corrigé d'ENT-11.6 (Mondial Relay, évaluation « les renforts de décembre »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// ÉVALUATION, TOUT EST TIRÉ : chaque élève a SON équipe de nuit, SES besoins et SES trois demandes de congé, tirés de sa graine (`db.tirage.graine`, l'identifiant de l'élève).
// `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine (jamais recopié). Toutes les valeurs viennent de
// `contenus/mondial-relay-ent116-donnees.js` et de `contenus/mondial-relay-ent116.js`. Chargé aussi sous Node : aucun import du moteur.

import { graineDeBase } from '../../core/tirage.js';
import { NUITS, SEMAINES, nuitsTexte, besoinDe, decisionsJustes, renfortsJustes, agentRefuse, nomAgent, dateDemande, jeuDe, CHOIX_CONGE } from '../mondial-relay-ent116-donnees.js';
import { phrasesReponse, MENTIONS, CHOIX_POSTE, CHOIX_CONTRAT, CHOIX_MOTIF, CHOIX_DATES, CHOIX_HORAIRES, ATTENDU } from '../mondial-relay-ent116.js';

const lib = (L, v) => (L.find((c) => c.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-11.6',
  titre: 'Mondial Relay — évaluation : les renforts de décembre',
  trame: '(pas de trame : tout se fait à l’écran ; le corrigé de chaque élève est calculé depuis sa graine)',
  items: [
    { etape: 0, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées parmi huit (2 de préparation sur 4, 2 de droit sur 4)',
      rep: 'Réponses attendues dans `contenus/questions/ENT-11.6.js`. Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.' },
    { etape: 1, etapeTitre: 'Les nuits couvertes (4 points)', genre: 'tableau', texte: 'Les renforts à prévoir chaque nuit = le besoin moins les agents présents, d’après LES DÉCISIONS DE L’ÉLÈVE',
      entetes: ['Règle', 'Effet'],
      reponses: [['Le besoin', 'Pic : de 9 ou 10 personnes (jeudi) à 11 ou 12 (samedi de la 2e semaine) ; base : 5 ou 6 (+1 la 2e semaine). Tiré par élève.'],
        ['Les agents', '8 en CDI. Un congé accordé retire un agent ces nuits-là ; un congé refusé ou décalé n’en retire aucun.'],
        ['Les renforts', 'Besoin − présents, jamais moins de 0 : 2 points par semaine, toutes les nuits de la semaine doivent être exactes.']],
      note: 'Une erreur de congé ne se paie qu’une fois : les renforts sont jugés sur les décisions que l’élève a choisies. Mettre le maximum partout ne rapporte rien.' },
    { etape: 2, etapeTitre: 'Les congés (3 points)', genre: 'tableau', texte: 'Une décision par demande, 1 point chacune',
      entetes: ['Demande', 'Décision juste'],
      reponses: [['Titulaire du CACES 1, nuits de base, la plus ancienne des deux', CHOIX_CONGE[1].lib], ['L’autre titulaire, une nuit en commun, demande plus récente', CHOIX_CONGE[2].lib],
        ['Un agent sans CACES, au moins une nuit de pic', CHOIX_CONGE[0].lib]],
      note: 'Règles : pas de congé pendant le pic (refus) ; un chargeur CACES 1 chaque nuit, la demande la plus ancienne garde ses nuits (l’autre est décalée) ; sinon accordé.' },
    { etape: 3, etapeTitre: 'Le contrat des renforts (3 points)', genre: 'tableau', texte: 'Le poste (0,5), le contrat (1,5) et pourquoi (1)',
      entetes: ['Ligne', 'Réponse attendue'],
      reponses: [['Intitulé du poste', lib(CHOIX_POSTE, ATTENDU.poste)], ['Contrat', lib(CHOIX_CONTRAT, ATTENDU.contrat)], ['Pourquoi ce contrat ?', lib(CHOIX_MOTIF, ATTENDU.motif)]],
      note: 'CDD saisonnier (décision de Tristan, 26/10/2026) : l’intérim n’est jamais noté (jamais travaillé en 2de), il n’apparaît que dans une question de réflexion non notée.' },
    { etape: 4, etapeTitre: 'La demande de recrutement (3 points)', genre: 'tableau', texte: 'Le nombre (0,5), les dates (0,75), les horaires (0,5) et cinq mentions (0,25 chacune)',
      entetes: ['Ligne', 'Réponse attendue'],
      reponses: [['Nombre de personnes à recruter', 'le plus grand nombre de renforts prévu une nuit (calculé depuis son planning)'], ['Dates du contrat', lib(CHOIX_DATES, ATTENDU.dates)],
        ['Horaires', `${lib(CHOIX_HORAIRES, ATTENDU.horaires)} (horaire de nuit construit, non vérifié)`],
        ...MENTIONS.map((m) => [m.lib, m.oui ? 'à écrire' : 'à ne pas écrire'])] },
    { etape: 5, etapeTitre: 'Répondre à l’agent (3 points)', genre: 'question', texte: 'La décision (1), la raison (1), la salutation (0,5) et la formule de fin (0,5)',
      rep: 'Calculé depuis SON jeu (voir le corrigé de l’élève).', note: 'L’agent dont la demande doit être refusée écrit toujours ; Hélène ne reprend pas ce que l’élève a écrit.' },
    { etape: 6, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et ouverture, total 20 : avant de commencer 4 · nuits couvertes 4 · congés 3 · contrat des renforts 3 · demande de recrutement 3 · réponse à l’agent 2 · ton 1. '
        + 'Rien n’est vrai avant un envoi : inaction 0.',
      note: 'Poids du brief §5, tranchés par Tristan le 26/10/2026. Évaluation en copie rendue : une seule remise, note figée, ni bonus ni niveau. Les trois questions au fil sont non notées.' },
  ],
};

// Le corrigé d'UN élève : son équipe, ses besoins, ses trois demandes et leur décision, ses renforts, sa réponse (calculés depuis sa graine).
export function corrigeEleve(base, uid) {
  const graine = graineDeBase(base);
  const ouvert = !!graine;
  const jeu = jeuDe(graine || String(uid || 'anonyme'));
  const dec = decisionsJustes(jeu), att = renfortsJustes(jeu), z = agentRefuse(jeu);
  const rep = phrasesReponse('Prénom', { tirage: { graine: graine || String(uid || 'anonyme') } });
  const phr = Object.fromEntries(rep.lignes.map((l) => [l.id, l.choix[l.juste]]));
  const items = [
    { genre: 'fait', texte: 'Son équipe', rep: jeu.equipe.map((a) => a.nom + (a.caces ? ' (CACES 1)' : '')).join(', ') },
    { genre: 'fait', texte: 'Son besoin', rep: NUITS.map((n) => `${n.court} : ${besoinDe(jeu, n.i)}`).join(' · ') },
    ...jeu.demandes.map((d, k) => ({ genre: 'fait', texte: `${nomAgent(jeu, d)} — ${nuitsTexte(d.nuits)} (${dateDemande(d)})`, rep: CHOIX_CONGE.find((c) => c.v === dec[k]).lib })),
    ...SEMAINES.map((s, w) => ({ genre: 'fait', texte: `Renforts — ${s.lib}`, rep: NUITS.filter((n) => n.semaine === w).map((n) => `${n.court} : ${att[n.i]}`).join(' · ') })),
    { genre: 'fait', texte: 'Nombre de personnes à recruter', rep: String(Math.max(0, ...att)) },
    { genre: 'fait', texte: `Réponse à ${nomAgent(jeu, z)}`, rep: `${phr.salutation} ${phr.decision} ${phr.raison} ${phr.fin}` },
  ];
  return { texte: ouvert ? '' : 'Cet élève n’a pas encore ouvert la séance : voici le jeu que sa graine lui donnera.', items };
}
