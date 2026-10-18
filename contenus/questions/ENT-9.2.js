// Les questions d'ENT-9.2 — CHEP, un retour à contrôler, une ramasse à organiser (brief `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md`
// §4 bis et §4 ter, choix de Cowork sur délégation de Tristan du 17/10/2026). Modifier ce fichier suffit : voir « Modifier les questions
// d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES (Sandrine Delattre, Grégory Vandamme, Yannick Desmet).
//
// AU FIL (3 notées : `part: 3`, 1 point chacune ; 1 en réserve ; 2 réflexions non notées) :
// - `autre-pool` (NOTÉE, au bilan) : Grégory, quand l'élève a validé au quai une pile où il a coché « palettes d'un autre pool »
//   (`quai:chep-retours:valider`), énoncé sur SA pile (`selon`). Au bilan : elle donnerait la ligne 3 et le choix 5 du crédit.
// - `contrat-type` (NOTÉE, tout de suite, éco-droit appliqué au cas : le contrat type, joint au message de Yannick) : à l'envoi de la
//   fiche « besoin » (`fiche:besoin:envoyer`).
// - `camions-pleins` (NOTÉE, au bilan) : Yannick, à la sortie de la case de la capacité (`fiche:besoin:capacite`). Énoncé sur SA capacité :
//   le brief écrivait « 390 palettes… », ce qui aurait donné la réponse de la case pendant que la fiche est encore ouverte.
// - `reparer` : en réserve (`actif: false`), à la validation d'une pile où l'élève a coché « palettes abîmées ».
// - `appel-du-site` : réflexion non notée à l'envoi de la tournée (`tournee:chep-ramasse:envoyer`), sur SON site reporté.
// - `pour-reflechir` : « Pour réfléchir » du brief §4, réponse libre non notée, lue au bilan, sur la plate-forme de SON tirage.
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 préparation, 1 image, 1 droit). La rubrique « image »
// est une rubrique comme une autre pour le moteur (un nom libre) : le dessin du kit iso est le document de gauche.

import { apresGeste } from '../../core/declencheurs.js';
import { EQUIPE, palettes } from '../chep.js';
import { ID, QUAI_ID, TOURNEE_ID, FICHES, POIDS_PALETTE, pilesDeBase, constats, etatQuai, fiche, lireNombre, tourneeEnvoyee, nomSite, dernierDe }
  from '../chep-ent92-donnees.js';

// Une condition « geste fait ET état vrai », qui déclare ses gestes (le moteur vérifie qu'une vue les publie).
const condition = (gestes, f) => { const q = (db, s) => f(db, s); q.gestes = gestes; return q; };
const fait = (db, s, nom) => apresGeste(nom)(db, s);
const G = { valider: `quai:${QUAI_ID}:valider`, capacite: `fiche:${FICHES.besoin}:capacite`, besoin: `fiche:${FICHES.besoin}:envoyer`,
  tournee: `tournee:${TOURNEE_ID}:envoyer` };

// ── La première pile validée où l'élève a coché un motif donné.
const pileValidee = (db, motif) => pilesDeBase(db).find((p) => { const c = constats(db, p.id); return c.valide && c.motifs.includes(motif); }) || null;
const quandAutrePool = condition([G.valider], (db, s) => fait(db, s, G.valider) && !!pileValidee(db, 'produit'));
const quandAbimees = condition([G.valider], (db, s) => fait(db, s, G.valider) && !!pileValidee(db, 'avarie'));
// Le nombre que l'élève a noté sur sa fiche de contrôle (case « d'un autre pool »), s'il en a noté un ; sinon « des palettes ».
const selonAutrePool = (db) => {
  const p = pileValidee(db, 'produit');
  if (!p) return { enonce: 'Tu as mis des palettes de côté dans une pile. Pourquoi ne pas les créditer à Opale Frais ?' };
  const s = (etatQuai(db).palettes || {})[p.id] || {};
  const k = lireNombre(s.fiche && s.fiche.autre);
  return { enonce: `Tu as mis ${Number.isFinite(k) && k > 0 ? palettes(k) : 'des palettes'} de côté dans la pile ${p.id}. Pourquoi ne pas les créditer à Opale Frais ?` };
};
// ── La capacité de SA case, sortie remplie.
const quandCapacite = condition([G.capacite], (db, s) => fait(db, s, G.capacite) && Number.isFinite(lireNombre(fiche(db, FICHES.besoin).v.capacite)));
const selonCapacite = (db) => {
  const c = lireNombre(fiche(db, FICHES.besoin).v.capacite);
  if (!Number.isFinite(c) || c <= 0) return { enonce: 'Un camion plein de palettes vides pèse plusieurs tonnes. Pourquoi CHEP préfère-t-elle envoyer des camions pleins ?' };
  const t = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(c * POIDS_PALETTE / 1000);
  return { enonce: `${palettes(c)} vides à ${POIDS_PALETTE} kg, c’est environ ${t} t. Pourquoi CHEP préfère-t-elle envoyer des camions pleins ?` };
};
// ── La tournée envoyée : SON site reporté, la plate-forme de SON tirage.
const selonAppel = (db) => {
  const T = tourneeEnvoyee(db);
  const rep = T && T.b.reportes.length ? T.b.reportes.map(nomSite).join(' et ') : null;
  return { enonce: rep ? `Ta tournée laisse ${rep} à vendredi. Que dirais-tu à son responsable de quai s’il appelle demain ?`
    : 'Ta tournée ne laisse aucun site à vendredi. Que dirais-tu au responsable de quai d’un site si le camion ne pouvait pas tout prendre ?' };
};
const selonReflechir = (db) => {
  const P = dernierDe(db || {});
  const nom = P ? nomSite(P.site) : 'la plate-forme qui a signalé le plus tard';
  return { enonce: `Pour réfléchir : si ${nom} avait signalé ses vides avant les autres, qu’est-ce qui aurait changé dans ta tournée ?` };
};

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { sandrine: EQUIPE.sandrine, gregory: EQUIPE.gregory, yannick: EQUIPE.yannick },
  ouverture: { id: 'avant-de-commencer', de: 'sandrine', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, tu passes la matinée au quai des retours avec Grégory, puis l’après-midi à l’exploitation avec Yannick. '
      + 'Avant de commencer, lis le document à gauche et réponds à mes questions.',
    documents: ['bon-vierge', 'mots-retour', 'regles-credit', 'dessin-lpr', 'dessin-abimee', 'contrat-type', 'droit'],
    tirage: { preparation: 2, image: 1, droit: 1 },
    questions: ['p1', 'p2', 'p3', 'p4', 'i1', 'i2', 'd1', 'd2'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'sandrine', doc: 'bon-vierge', rubrique: 'preparation',
      enonce: 'Un bon de collecte, c’est…',
      aide: 'Regarde le bon, à gauche ; le mot [[bon de collecte]] est dans le lexique.',
      choix: [{ v: 'bon', lib: 'le document qui accompagne les palettes vides collectées et en annonce le nombre' },
        { v: 'facture', lib: 'la facture de la location' }, { v: 'commande', lib: 'le bon de commande de palettes neuves' }],
      juste: 'bon',
      retour: 'Le bon dit ce que le distributeur annonce. Au quai, on compte ce qui arrive vraiment, et on compare.' },
    { id: 'p2', type: 'ouverture', de: 'sandrine', doc: 'mots-retour', rubrique: 'preparation',
      enonce: 'Une réserve sur le bon de collecte sert à…',
      aide: 'Lis le mot [[réserve]], à gauche.',
      choix: [{ v: 'ecart', lib: 'garder par écrit l’écart entre ce qui est annoncé et ce qui est reçu' },
        { v: 'refuser', lib: 'refuser les palettes vides' }, { v: 'commander', lib: 'commander d’autres palettes' }],
      juste: 'ecart',
      retour: 'Sans réserve écrite et signée, l’écart n’existe pas sur le papier : le distributeur pourrait dire qu’il a tout rendu.' },
    { id: 'p3', type: 'ouverture', de: 'sandrine', doc: 'regles-credit', rubrique: 'preparation',
      enonce: 'Une palette CHEP abîmée, au retour…',
      aide: 'Lis les règles de crédit, à gauche.',
      choix: [{ v: 'reparer', lib: 'reste à CHEP : elle est créditée et part en réparation' },
        { v: 'jetee', lib: 'est jetée et retirée du crédit' }, { v: 'rendue', lib: 'est rendue au distributeur' }],
      juste: 'reparer',
      retour: 'Elle est à CHEP, abîmée ou non : le distributeur l’a bien rendue, elle se crédite, et l’atelier la répare.' },
    { id: 'p4', type: 'ouverture', de: 'sandrine', doc: 'mots-retour', rubrique: 'preparation',
      enonce: 'La ramasse, c’est…',
      aide: 'Lis le mot [[ramasse]], à gauche.',
      choix: [{ v: 'enlevement', lib: 'l’enlèvement des palettes vides chez les distributeurs, pour les ramener au centre de service' },
        { v: 'livraison', lib: 'la livraison de palettes neuves aux producteurs' }, { v: 'tri', lib: 'le tri des palettes à Templemars' }],
      juste: 'enlevement',
      retour: 'Les distributeurs préviennent CHEP quand leurs vides sont prêts ; un camion passe les reprendre.' },
    // ── image (2 : l'élève en reçoit 1) — le dessin du kit iso à gauche
    { id: 'i1', type: 'ouverture', de: 'sandrine', doc: 'dessin-lpr', rubrique: 'image',
      enonce: 'Cette palette arrive avec un retour CHEP. Que fais-tu ?',
      aide: 'Regarde la couleur et le marquage des blocs ; le mot [[autre pool]] est dans le lexique.',
      choix: [{ v: 'cote', lib: 'Je la mets de côté : c’est une palette d’un autre pool' },
        { v: 'credite', lib: 'Je la crédite : elle est arrivée avec les nôtres' }, { v: 'reparation', lib: 'Je l’envoie en réparation' }],
      juste: 'cote',
      retour: 'Rouge et marquée LPR : elle appartient à un autre loueur. Elle ne passe pas sur un compte CHEP.' },
    { id: 'i2', type: 'ouverture', de: 'sandrine', doc: 'dessin-abimee', rubrique: 'image',
      enonce: 'Cette palette, c’est…',
      aide: 'Regarde le marquage des blocs, puis la façade.',
      choix: [{ v: 'reparer', lib: 'une palette CHEP à envoyer en réparation' },
        { v: 'autre', lib: 'une palette d’un autre pool' }, { v: 'prete', lib: 'une palette prête à repartir chez un client' }],
      juste: 'reparer',
      retour: 'Bleue et marquée CHEP, mais une planche est cassée : elle reste à CHEP et part à l’atelier.' },
    // ── droit (2 : l'élève en reçoit 1)
    { id: 'd1', type: 'ouverture', de: 'sandrine', doc: 'contrat-type', rubrique: 'droit',
      enonce: 'Le transporteur qui ramène nos vides doit-il payer leur location pendant le trajet ?',
      aide: 'Lis le contrat type, à gauche.',
      choix: [{ v: 'non', lib: 'Non : le contrat type dit que les supports de charge ne donnent lieu ni à location ni à consignation au transporteur, sauf accord contraire' },
        { v: 'charge', lib: 'Oui, dès qu’il les charge' }, { v: 'perd', lib: 'Oui, s’il en perd une' }],
      juste: 'non',
      retour: 'Le transporteur ne fait que les déplacer : il ne les loue pas. La location reste au distributeur jusqu’au retour.' },
    { id: 'd2', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit',
      variante: (h) => { const n = 5 * h.entier(12, 18), k = h.entier(2, 5);
        return { enonce: `Opale Frais avait ${n} palettes CHEP sur son compte et n’en rend que ${n - k}. Qui répond des ${k} manquantes ?`,
          libs: { opale: 'Opale Frais, qui les avait en location, sauf si elle prouve qu’elle n’y est pour rien', chep: 'CHEP, propriétaire',
            transporteur: 'Le transporteur de la collecte' },
          retour: `L’article 1732 : le locataire répond des pertes pendant sa jouissance. Les ${k} palettes manquantes sont pour Opale Frais, sauf si elle prouve qu’elle n’y est pour rien.` }; },
      enonce: 'Opale Frais n’a pas rendu toutes les palettes CHEP de son compte. Qui répond des palettes manquantes ?',
      aide: 'Lis l’article 1732, à gauche.',
      choix: [{ v: 'opale', lib: 'Opale Frais, qui les avait en location, sauf si elle prouve qu’elle n’y est pour rien' },
        { v: 'chep', lib: 'CHEP, propriétaire' }, { v: 'transporteur', lib: 'Le transporteur de la collecte' }],
      juste: 'opale',
      retour: 'L’article 1732 : le locataire répond des pertes pendant sa jouissance, sauf s’il prouve qu’elles ne sont pas de sa faute.' },
    // ── au fil du travail (notées : 1 point chacune)
    { id: 'autre-pool', type: 'fil', de: 'gregory', quand: quandAutrePool, poids: 1, apres: 'bilan', selon: selonAutrePool,
      enonce: 'Tu as mis des palettes de côté dans une pile. Pourquoi ne pas les créditer à Opale Frais ?',
      choix: [{ v: 'loueur', lib: 'Elles appartiennent à un autre loueur : elles ne sont pas sur le compte CHEP d’Opale Frais.' },
        { v: 'abimees', lib: 'Parce qu’elles sont abîmées.' }, { v: 'payees', lib: 'Parce qu’Opale Frais les a déjà payées.' }],
      juste: 'loueur', groupe: 'Question de Grégory : les palettes d’un autre pool',
      retour: 'Créditées, elles feraient croire à Opale Frais qu’il lui reste moins de palettes CHEP qu’en réalité.' },
    { id: 'contrat-type', type: 'fil', de: 'yannick', quand: apresGeste(G.besoin), poids: 1,
      enonce: 'Transports Lys-Escaut transporte nos palettes vides jusqu’ici. D’après le contrat type (joint à mon message), lui fait-on payer la location de ces palettes pendant le trajet ?',
      choix: [{ v: 'non', lib: 'Non : les supports de charge ne donnent lieu ni à location ni à consignation au transporteur, sauf accord contraire.' },
        { v: 'camion', lib: 'Oui, dès qu’elles sont dans son camion.' }, { v: 'vide', lib: 'Oui, mais seulement s’il roule à vide.' },
        { v: 'rien', lib: 'Non, parce que des palettes vides ne valent rien.' }],
      juste: 'non', groupe: 'Question de Yannick : le contrat type',
      retour: 'C’est le distributeur qui les avait en location : le camion ne fait que les ramener.' },
    { id: 'camions-pleins', type: 'fil', de: 'yannick', quand: quandCapacite, poids: 1, apres: 'bilan', selon: selonCapacite,
      enonce: 'Un camion plein de palettes vides pèse plusieurs tonnes. Pourquoi CHEP préfère-t-elle envoyer des camions pleins ?',
      choix: [{ v: 'trajets', lib: 'Pour faire moins de trajets, et moins de km à vide, pour le même nombre de palettes.' },
        { v: 'vite', lib: 'Parce qu’un camion plein roule plus vite.' }, { v: 'loi', lib: 'Parce que la loi interdit les camions à moitié vides.' }],
      juste: 'trajets', groupe: 'Question de Yannick : les camions pleins',
      retour: 'CHEP dit avoir évité 5 millions de km à vide en 2025 en regroupant ses transports (L’Officiel des transporteurs, 28/05/2026).' },
    { id: 'reparer', type: 'fil', de: 'gregory', actif: false, quand: quandAbimees, poids: 1,
      enonce: 'Tes palettes abîmées partent en réparation. Pourquoi CHEP les répare-t-elle au lieu d’en acheter des neuves ?',
      choix: [{ v: 'resservir', lib: 'Une palette réparée resservira : c’est moins cher et ça consomme moins de bois.' },
        { v: 'loi', lib: 'Parce que la loi interdit les palettes neuves.' }, { v: 'client', lib: 'Parce que le client paie la réparation.' }],
      juste: 'resservir', groupe: 'Question de Grégory : réparer',
      retour: 'Réparer, c’est réemployer : la palette repart chez un client après contrôle.' },
    // ── réflexions (non notées)
    { id: 'appel-du-site', type: 'fil', de: 'yannick', quand: apresGeste(G.tournee), reflexion: true, selon: selonAppel,
      enonce: 'Ta tournée laisse un site à vendredi. Que dirais-tu à son responsable de quai s’il appelle demain ?',
      choix: [{ v: 'expliquer', lib: 'Je lui explique que le camion était plein et que son site passe vendredi, parce qu’il a signalé ses vides en dernier.' },
        { v: 'transporteur', lib: 'Je lui dis que c’est la faute du transporteur.' }, { v: 'rien', lib: 'Je ne lui dis rien : il verra bien.' }],
      retour: 'Un client prévenu, avec la raison et le jour du passage, s’organise. Un client qui attend un camion qui ne vient pas rappelle, et il est fâché.' },
    { id: 'pour-reflechir', type: 'fil', de: 'yannick', quand: apresGeste(G.tournee), reflexion: true, libre: true, apres: 'bilan', selon: selonReflechir,
      enonce: 'Pour réfléchir : si la plate-forme qui a signalé le plus tard avait signalé ses vides avant les autres, qu’est-ce qui aurait changé dans ta tournée ?',
      retour: 'Un autre site serait passé vendredi, et l’ordre de la tournée aurait changé : signaler tôt, c’est être collecté plus tôt.' },
  ],
};
