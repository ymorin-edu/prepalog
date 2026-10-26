// Les questions d'ENT-11.5 — Mondial Relay, évaluation « la tournée Sud et le colis bloqué » (brief `docs/briefs/ENT-11.5-mondial-relay-evaluation-tournee.md`
// §4 et §5 ; règle de Tristan du 10/10/2026 sur les questions à l'écran). Modifier ce fichier suffit : voir « Modifier les questions d'une séance »
// dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES.
//
// ÉVALUATION : AUCUNE question au fil (les trois propositions du brief §4 bis n'ont pas de poids au tableau du §5 : voir le compte rendu du brief).
// Seul l'écran « Avant de commencer » est NOTÉ (`part: 4`) : onze questions, dont les questions clés de ENT-6.9 et ENT-6.10 (`cle: true`) réécrites
// pour Mondial Relay (minutes à 40 km/h, SMS au volant, solde, terminal du chauffeur, réemploi, « une indemnité, c'est… »), plus des questions de la
// séance (attendre devant un commerce fermé, lire le suivi, pause de 45 min, réclamation d'un colis abîmé). L'élève en reçoit 4
// (`tirage: { preparation: 2, droit: 2 }`) ; aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas »
// 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.
// Les `variante` tirent leurs PROPRES nombres, choisis pour ne jamais valoir une quantité de la séance (20 à 90 km : jamais le total d'une tournée
// de 60 à 120 km ; aucune ouverture à l’heure d’un commerce de la tournée : 8 h 15, 8 h 45, 9 h 15, 9 h 45 ou 10 h 15). Les `retour` (jamais montrés en évaluation) sont lus par l'enseignant.

import { EQUIPE, ID } from '../mondial-relay-ent115-donnees.js';

const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const fr = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n);

// Une question clé. Une `variante` ne rend que ce qui change : les autres choix gardent leur texte (`libs` complet, exigé par le moteur).
const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => {
  const libs = Object.fromEntries(choix.map((c) => [c.v, c.lib]));
  const variante = o.variante ? (h) => { const v = o.variante(h); return { ...v, libs: { ...libs, ...(v.libs || {}) } }; } : undefined;
  return { id, type: 'ouverture', de: 'samia', doc, rubrique, cle: o.cle !== false, enonce, choix, juste, retour, ...(variante ? { variante } : {}) };
};

// ── Les valeurs tirées.
const varianteMinutes = (h) => {
  const km = h.choisir([20, 30, 50, 70, 90]);
  return {
    enonce: `À 40 km/h, combien de minutes faut-il pour faire ${km} km ?`,
    libs: { juste: `${fr(km / 40 * 60)} min`, heures: `${fr(km / 40)} min`, fois: `${fr(km * 40 / 60)} min` },
    retour: `${km} ÷ 40 × 60 = ${fr(km / 40 * 60)} min. Temps (min) = km ÷ vitesse × 60 : c’est le calcul de ta tournée.`,
  };
};
const varianteSolde = (h) => {
  let a, l, r;
  do { a = h.choisir([3, 4, 5, 6, 7, 8]); l = h.choisir([2, 3, 4, 5, 6]); r = h.choisir(Array.from({ length: a }, (_, k) => k + 1)); } while (r === l || a - l + r <= 0);
  return {
    enonce: `Un Point Relais avait ${a} colis en dépôt. On lui en livre ${l} et ses clients en retirent ${r}. Combien de colis a-t-il maintenant ?`,
    libs: { juste: `${a + l - r} colis`, plus: `${a + l + r} colis`, inverse: `${a - l + r} colis` },
    retour: `${a} + ${l} − ${r} = ${a + l - r} colis. Ce qu’il avait, plus ce qu’on lui livre, moins ce qu’on retire.`,
  };
};
const variantePasAvant = (h) => {
  const o = h.choisir([495, 525, 555, 585, 615]), a = o - h.choisir([15, 20, 25, 30, 35, 40]);
  return {
    enonce: `Un commerce ouvre à ${hm(o)}. Le camion arrive à ${hm(a)}. Que se passe-t-il ?`,
    libs: { attend: `Il attend jusqu’à ${hm(o)}, puis livre : il repartira plus tard`, tout: 'Il livre tout de suite',
      suivant: 'Il passe au commerce suivant et ne revient pas' },
    retour: `Il attend ${o - a} min, puis livre. Arriver trop tôt, c’est du temps perdu : toute la suite de la tournée glisse d’autant.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: { samia: EQUIPE.samia },
  ouverture: { id: 'avant-de-commencer', de: 'samia', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Je suis en réunion jusqu’à midi : avant de partir, je t’ai laissé ces questions. Réponds sans aide ; pour celles de droit, '
      + 'lis les textes à gauche. Mes consignes sont ensuite dans la Messagerie.',
    documents: ['poste', 'droit', 'cgv'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['k-p1', 'k-p2', 'k-p3', 'k-p4', 'k-p5', 'k-p6', 'k-d1', 'k-d2', 'k-d3', 'k-d4', 'k-d5'] },
  liste: [
    // ── préparation (6 : l'élève en reçoit 2)
    q('k-p1', 'preparation', 'poste', 'À 40 km/h, combien de minutes faut-il pour faire 60 km ?',
      [{ v: 'juste', lib: '90 min' }, { v: 'heures', lib: '1,5 min' }, { v: 'fois', lib: '40 min' }], 'juste',
      '60 ÷ 40 × 60 = 90 min. Temps (min) = km ÷ vitesse × 60 : c’est le calcul de ta tournée.', { variante: varianteMinutes }),
    q('k-p2', 'preparation', 'poste', 'Un Point Relais avait 5 colis en dépôt. On lui en livre 4 et ses clients en retirent 3. Combien de colis a-t-il maintenant ?',
      [{ v: 'juste', lib: '6 colis' }, { v: 'plus', lib: '12 colis' }, { v: 'inverse', lib: '4 colis' }], 'juste',
      '5 + 4 − 3 = 6 colis. Ce qu’il avait, plus ce qu’on lui livre, moins ce qu’on retire.', { variante: varianteSolde }),
    q('k-p3', 'preparation', 'poste', 'Un commerce ouvre à 9:00. Le camion arrive à 8:35. Que se passe-t-il ?',
      [{ v: 'attend', lib: 'Il attend jusqu’à 9:00, puis livre : il repartira plus tard' }, { v: 'tout', lib: 'Il livre tout de suite' },
        { v: 'suivant', lib: 'Il passe au commerce suivant et ne revient pas' }], 'attend',
      'Il attend 25 min, puis livre. Arriver trop tôt, c’est du temps perdu : toute la suite de la tournée glisse d’autant.',
      { variante: variantePasAvant, cle: false }),
    q('k-p4', 'preparation', 'poste', 'Un colis est resté « Pris en charge » pendant 4 jours. Que fais-tu d’abord ?',
      [{ v: 'suivi', lib: 'Je lis son suivi, événement par événement' }, { v: 'perdu', lib: 'Je dis à tout le monde qu’il est perdu' },
        { v: 'attendre', lib: 'J’attends encore une semaine' }], 'suivi',
      'Le suivi garde la trace de chaque passage du colis : c’est là qu’on trouve ce qui l’a arrêté, avant de prévenir qui que ce soit.', { cle: false }),
    q('k-p5', 'preparation', 'cgv', 'Une indemnité, c’est…',
      [{ v: 'somme', lib: 'Une somme versée pour réparer un dommage (colis perdu ou abîmé, par exemple)' }, { v: 'facture', lib: 'Une facture en plus' },
        { v: 'amende', lib: 'Une amende' }], 'somme',
      'Quand un colis est perdu ou abîmé, le transporteur verse une indemnité, dans la limite fixée par ses conditions de vente.'),
    q('k-p6', 'preparation', 'poste', 'Un colis est « écarté au tri ». Cela veut dire qu’il…',
      [{ v: 'cote', lib: 'ne continue pas sa route : il est mis de côté' }, { v: 'part', lib: 'part quand même vers sa destination' },
        { v: 'detruit', lib: 'est détruit tout de suite' }], 'cote',
      'Un colis écarté est retiré du flux : il est mis de côté, à l’agence, le temps de savoir ce qu’on en fait.', { cle: false }),
    // ── droit (5 : l'élève en reçoit 2)
    q('k-d1', 'droit', 'droit', 'Tu envoies le nouvel ordre des arrêts au chauffeur de la tournée, qui roule. Peut-il lire ton SMS en conduisant, téléphone en main ?',
      [{ v: 'non', lib: 'Non : c’est interdit ; il le lira à l’arrêt' }, { v: 'autoroute', lib: 'Oui, sur route rapide c’est permis' },
        { v: 'travail', lib: 'Oui, si c’est pour le travail' }], 'non',
      'Amende et points en moins sur le permis : il le lira à l’arrêt (R412-6-1).'),
    q('k-d2', 'droit', 'droit', 'Le chauffeur de la tournée a conduit 4 h 30. Que doit-il faire ?',
      [{ v: 'pause', lib: 'Une pause ininterrompue d’au moins 45 minutes' }, { v: 'continuer', lib: 'Continuer jusqu’à la fin de la tournée' },
        { v: 'decharger', lib: 'Décharger un colis : cela compte comme une pause' }], 'pause',
      'Après 4 h 30 de conduite, une pause d’au moins 45 minutes (règlement 561/2006, art. 7). Décharger, c’est travailler : ce n’est pas une pause (art. 4 d).', { cle: false }),
    q('k-d3', 'droit', 'droit', 'Le scanner de la tournée enregistre l’heure de chaque livraison du chauffeur. Le chauffeur doit-il le savoir ?',
      [{ v: 'oui', lib: 'Oui : il doit en avoir été informé avant' }, { v: 'non', lib: 'Non, c’est le scanner de l’entreprise' },
        { v: 'demande', lib: 'Non, seulement s’il le demande' }], 'oui',
      'Aucune information sur un salarié ne peut être collectée par un dispositif qu’il ne connaît pas (L1222-4).'),
    q('k-d4', 'droit', 'droit', 'Un carton de colis, bien refermé, resert tel quel pour un autre envoi. Un autre carton est broyé pour refaire du carton. Lequel est du réemploi ?',
      [{ v: 'servi', lib: 'Le carton qui resert tel quel' }, { v: 'broye', lib: 'Le carton broyé' }, { v: 'deux', lib: 'Les deux' }], 'servi',
      'Réemploi : le même objet resert pour le même usage. Recyclage : on refait de la matière (L541-1-1).'),
    q('k-d5', 'droit', 'cgv', 'Au Point Relais, un destinataire voit que son colis est abîmé. Que doit-il faire pour que sa réclamation soit recevable ?',
      [{ v: 'refuser', lib: 'Refuser le colis, et écrire des réserves précises' }, { v: 'prendre', lib: 'Le prendre, et réclamer le mois suivant' },
        { v: 'rien', lib: 'Rien : une réclamation est toujours recevable' }], 'refuser',
      'Au Point Relais, le destinataire doit refuser le colis abîmé, avec des réserves précises et motivées (conditions de vente, art. 11).', { cle: false }),
  ],
};
