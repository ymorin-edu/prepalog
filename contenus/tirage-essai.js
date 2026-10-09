// SÉANCE D'ESSAI du tirage mémorisé, des niveaux et du bonus du confirmé (chantier D-C, 09/10/2026, brief
// `docs/briefs/MOTEUR-tirage-et-niveaux.md`). Ce n'est PAS une activité : elle n'apparaît nulle part dans le site. Le bloc de
// tests `outils/test/tirage-niveaux.mjs` la monte dans la page (et, pour l'onglet Corrigés et l'accueil, la sert comme
// activité à SON navigateur seulement). Entreprise, personnes et CV CONSTRUITS.
//
// Un tri de CV : le CV de Yanis (pièce FIXE, le fil conducteur) et quatre CV tirés dans une banque de 15 (1 facile,
// 2 moyens, 1 difficile) ; un élève CONFIRMÉ en reçoit deux de plus (1 moyen, 1 difficile), comptés en bonus. Une fiche
// « Tri des CV » : pour chaque rang, « retenir » ou « écarter ». Socle : 5 jalons × 4 points = 20 ; bonus : 2 jalons.
// `essai(o)` fabrique des VARIANTES (banque enrichie, mélange changé, pièce supprimée, quatre cas bonus) pour les tests.

import { catalogueSimple } from './entreprise-commun.js';
import { declarerTirage, corrigeDuTirage } from '../core/tirage.js';
import { ficheEnvoyee } from '../core/types/fiche.js';

// La banque : JAMAIS de pièce supprimée ni renumérotée (le test « banque stable » le garde).
export const CV = [
  { id: 'cv-yanis', titre: 'CV de Yanis (préparateur de commandes)', attendu: 'retenir' },
  { id: 'cv-f1', difficulte: 'facile', titre: 'CV 1 — CACES R489 à jour', attendu: 'retenir' },
  { id: 'cv-f2', difficulte: 'facile', titre: 'CV 2 — aucune expérience en entrepôt', attendu: 'ecarter' },
  { id: 'cv-f3', difficulte: 'facile', titre: 'CV 3 — trois ans de quai', attendu: 'retenir' },
  { id: 'cv-f4', difficulte: 'facile', titre: 'CV 4 — disponible dans six mois', attendu: 'ecarter' },
  { id: 'cv-m1', difficulte: 'moyen', titre: 'CV 5 — CACES périmé', attendu: 'ecarter' },
  { id: 'cv-m2', difficulte: 'moyen', titre: 'CV 6 — intérim en préparation', attendu: 'retenir' },
  { id: 'cv-m3', difficulte: 'moyen', titre: 'CV 7 — horaires incompatibles', attendu: 'ecarter' },
  { id: 'cv-m4', difficulte: 'moyen', titre: 'CV 8 — Bac Pro Logistique', attendu: 'retenir' },
  { id: 'cv-m5', difficulte: 'moyen', titre: 'CV 9 — permis C sans CACES', attendu: 'ecarter' },
  { id: 'cv-m6', difficulte: 'moyen', titre: 'CV 10 — chef d’équipe', attendu: 'retenir' },
  { id: 'cv-d1', difficulte: 'difficile', titre: 'CV 11 — trou de deux ans expliqué', attendu: 'retenir' },
  { id: 'cv-d2', difficulte: 'difficile', titre: 'CV 12 — références invérifiables', attendu: 'ecarter' },
  { id: 'cv-d3', difficulte: 'difficile', titre: 'CV 13 — surqualifié, mobile', attendu: 'retenir' },
  { id: 'cv-d4', difficulte: 'difficile', titre: 'CV 14 — contre-indication au port de charges', attendu: 'ecarter' },
];
export const RANGS_SOCLE = 5, RANGS_BONUS = 4;   // jusqu’à quatre cas bonus (variante des tests)

const FICHE_TRI = {
  id: 'tri', libelle: 'Tri des CV', titre: 'Tri des CV — poste de préparateur', bouton: 'Ouvrir la fiche de tri',
  blocs: Array.from({ length: RANGS_SOCLE + RANGS_BONUS }, (_, i) => ({
    type: 'liste', id: `r${i + 1}`, lib: `CV n° ${i + 1}`, vide: 'Choisir…', manque: `le CV n° ${i + 1}`,
    choix: [{ v: 'retenir', lib: 'Retenir' }, { v: 'ecarter', lib: 'Écarter' }] })),
  envoi: { bouton: 'Envoyer le tri à Inès', a: 'Inès', suite: 'Inès va te répondre.' },
};

// La séance d'essai et ses variantes. `o.plus` : pièces ajoutées à la banque ; `o.melange` : mélange du socle ;
// `o.sans` : ids retirés de la banque (supprimés par erreur) ; `o.bonus` : mélange des cas bonus ; `o.copie` : évaluation.
export function essai(o = {}) {
  const pieces = CV.filter((p) => !(o.sans || []).includes(p.id)).concat(Array.from({ length: o.plus || 0 }, (_, i) => ({
    id: `cv-n${i + 1}`, difficulte: ['facile', 'moyen', 'difficile'][i % 3], titre: `CV ajouté ${i + 1}`, attendu: i % 2 ? 'ecarter' : 'retenir' })));
  const TIRAGE = declarerTirage({
    banques: { cv: { pieces, fixes: ['cv-yanis'], melange: o.melange || { facile: 1, moyen: 2, difficile: 1 },
      bonus: { confirme: o.bonus || { moyen: 1, difficile: 1 } }, ordre: 'melange' } },
    valeurs: (h) => ({ postes: h.entier(2, 4), salaire: h.dixieme(11.8, 13.5) }),
    // Équité : le socle tiré compte au moins un CV à écarter (sinon « tout retenir » vaudrait 20).
    verifier: (jeu) => (jeu.pieces.cv.some((p) => p.attendu === 'ecarter') ? [] : ['aucun CV à écarter dans le socle']),
  });
  const juge = (db, p, champ) => {
    const f = ficheEnvoyee(db, 'tri');
    if (!f.envoye) return { status: 'attente' };
    return { status: p && f.valeurs[champ] === p.attendu ? 'ok' : 'ko' };
  };
  const ETAPES = [
    ...Array.from({ length: RANGS_SOCLE }, (_, i) => ({ id: `cv${i + 1}`, titre: `CV n° ${i + 1}`, poids: 4, ecran: 'fiche:tri',
      groupe: i < 3 ? 'Premiers CV' : 'Derniers CV',
      verifier: (db) => juge(db, TIRAGE.piecesTirees(db, 'cv')[i], `r${i + 1}`) })),
  ];
  const UNIVERS = {
    ENTREPRISE: { id: 'essai-tirage', nom: 'Entrepôt d’essai', sousTitre: 'Recrutement — page d’essai', exercice: 'Le tri des CV' },
    VOCAB: { unit: 'carton', unitPl: 'cartons', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'entrepot-essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'CART', designation: 'Carton' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: { CART: 0 }, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
  };
  const SEANCE = {
    ETAPES, TIRAGE,
    ACCUEIL: { titre: 'Le tri des CV', kpis: ['mail'], etapes: [['Lire le message d’Inès', 'Elle t’envoie les CV reçus.'],
      ['Trier les CV', 'Pour chacun : retenir ou écarter, puis envoyer la fiche.']] },
    VOLET: { id: 'essai-tirage', semer: (prenom) => ({ mails: [{ folder: 'in', ts: Date.now() - 60000, from: 'Inès Moreau',
      fromMail: 'ines@entrepot-essai.example', to: prenom, subject: 'Les CV reçus', kind: 'text', ouvreFiche: 'tri',
      text: `Bonjour ${prenom},\n\nVoici les CV reçus pour le poste de préparateur. Trie-les, puis envoie-moi la fiche.\n\nInès` }] }) },
  };
  const META = { id: o.id || 'essai-tirage', code: 'ENT-99.1', titre: 'Essai — tirage mémorisé', desc: 'Page d’essai du tirage.',
    competences: ['C1.1'], temps: o.copie ? 'evaluation' : 'guidage', bareme: 20, parcours: !o.copie, correction: !o.copie,
    reinitialisable: true, niveauxPrevus: ['confirme'], ...(o.copie ? { copie: true } : {}) };
  const OPTIONS = { fiche: FICHE_TRI, menu: [], sansTrame: 'Tout à l’écran' };
  return { TIRAGE, ETAPES, UNIVERS, SEANCE, META, OPTIONS };
}

export const ESSAI = essai();
export const TIRAGE = ESSAI.TIRAGE;

// Le corrigé d'un élève (onglet Corrigés) : ses CV, ce que la fiche attend pour chacun, ses cas bonus marqués « bonus ».
export function corrigeEleve(base) {
  return corrigeDuTirage(TIRAGE, base, {
    attendu: (p) => (p.attendu === 'retenir' ? 'Retenir' : 'Écarter'),
    texte: 'Chaque élève a reçu le CV de Yanis et quatre CV tirés (deux de plus, en bonus, pour un élève confirmé).',
  });
}
