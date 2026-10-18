// Les questions d'ENT-9.3 — CHEP, le relevé contesté (brief `docs/briefs/ENT-9.3-chep-releve-conteste.md` §4, §4 bis et §4 ter, choix de
// Cowork sur délégation de Tristan du 17/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes et situations CONSTRUITES (Sandrine Delattre, Hélène Caron, Grégory Vandamme).
//
// AU FIL (3 notées : `part: 3`, 1 point chacune ; 1 en réserve ; 2 réflexions non notées) :
// - `compter-retour` (n° 1, NOTÉE, au bilan) : Sandrine, quand l'élève a choisi ce que le relevé dit du BON DE RETOUR
//   (`fiche:enquete:type-retour`). Relie l'erreur induite au quai de mardi (ENT-9.2) ; au bilan, sinon elle soufflerait le jalon 1.
// - `qui-declare` (n° 2, NOTÉE, au bilan, éco-droit appliqué au cas : art. 1103 du Code civil et conditions, art. 3) : Sandrine, quand l'élève
//   a choisi « Qui fait la correction ? » pour le document de SA pièce (`fiche:enquete:qui-a2` ou `qui-a3`, geste par rôle). Énoncé sur sa
//   pièce (`selon`) ; au bilan, sinon elle soufflerait le jalon 5.
// - `ecart-restant` (n° 3, NOTÉE, tout de suite) : Sandrine, à la sortie de la case de l'écart restant du relevé corrigé
//   (`fiche:corrige:releve`), énoncé sur SON écart. L'enquête est déjà envoyée : rien n'est soufflé.
// - `delai` (n° 4) : en réserve (`actif: false`), éco-droit (le délai de 60 jours des conditions).
// - `confiance` (n° 5) : réflexion non notée à l'envoi de la réponse à Hélène (`apresMail` : « à l'envoi », comme ENT-9.1 ; le geste
//   `messagerie:phrase:chep` du brief arriverait au premier choix, avant l'envoi), corrigée au bilan.
// - `pour-reflechir` : « Pour réfléchir » du brief §4, réponse libre non notée, lue au bilan.
//
// AVANT DE COMMENCER : une banque de 8 questions NON notées, 4 tirées par élève (2 préparation, 2 droit). `cle: true` = ★ du brief (reprises
// en 9.4). La variante de d1 tire ses propres nombres (jamais ceux d'un jalon).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { lireFeuille } from '../../core/types/fiche.js';
import { EQUIPE, DISTRIBUTEURS, date } from '../chep.js';
import { ID, FICHES, BLOC_GRILLE, champ, jeuEleve, fiche, enquete, correctionsEleve, caseEcart, CLIENT, valeurDeSaFeuille, pieceDuRole, BLOC_CORRIGE }
  from '../chep-ent93-donnees.js';

// Une condition « geste fait ET case remplie », qui déclare ses gestes (le moteur vérifie qu'une vue les publie).
const condition = (gestes, f) => { const q = (db, s) => f(db, s); q.gestes = gestes; return q; };
const fait = (db, s, nom) => apresGeste(nom)(db, s);
const geste = (bloc) => `fiche:${FICHES.enquete}:${bloc}`;
const G = { typeRetour: geste(champ('type', 'retour')), quiA2: geste(champ('qui', 'a2')), quiA3: geste(champ('qui', 'a3')),
  grille: `fiche:${FICHES.corrige}:${BLOC_GRILLE}`, typeB1: geste(champ('type', 'b1')) };

// ── n° 1 : le bon de retour, le type choisi.
const quandRetour = condition([G.typeRetour], (db, s) => fait(db, s, G.typeRetour) && !!enquete(fiche(db, FICHES.enquete).v, 'retour').type);
// ── n° 2 : « Qui fait la correction ? » du document de SA pièce.
const quandQui = condition([G.quiA2, G.quiA3], (db, s) => {
  const r = jeuEleve(db).role;
  return fait(db, s, geste(champ('qui', r))) && !!enquete(fiche(db, FICHES.enquete).v, r).qui;
});
const selonQui = (db) => {
  const J = jeuEleve(db), p = pieceDuRole(J.role), nom = DISTRIBUTEURS[p.a].nom, jour = date(p.iso).replace(/^\S+\s/, '');
  return { enonce: J.role === 'a2'
    ? `Hélène voudrait que CHEP déclare elle-même son transfert du ${jour} vers ${nom}. D’après les conditions qu’elle a signées, qui doit le faire ?`
    : `Hélène voudrait que CHEP corrige elle-même son transfert du ${jour} vers ${nom}. D’après les conditions qu’elle a signées, qui doit le faire ?` };
};
// ── n° 3 : l'écart restant de SON relevé corrigé, à la sortie de la case.
const caseEcartEleve = (db) => caseEcart(correctionsEleve(db).length);
const ecartSaisi = (db) => lireFeuille(FICHES.corrige, BLOC_CORRIGE, db).cases[caseEcartEleve(db)];
const quandEcart = condition([G.grille], (db, s) => fait(db, s, G.grille) && ecartSaisi(db) != null && String(ecartSaisi(db)).trim() !== '');
const selonEcart = (db) => {
  // La valeur de SA case (une formule calculée, ou un nombre tapé), jamais corrigée.
  const x = valeurDeSaFeuille(lireFeuille, db, caseEcartEleve(db));
  if (!Number.isFinite(x)) return { enonce: 'Ton relevé corrigé laisse un écart avec l’inventaire d’Hélène. Que fais-tu avant de lui répondre ?' };
  if (x === 0) return { enonce: 'Ton relevé corrigé ne laisse plus d’écart avec l’inventaire d’Hélène. Que fais-tu avant de lui répondre ?' };
  return { enonce: `Il te reste ${x} palette${Math.abs(x) > 1 ? 's' : ''} d’écart avec l’inventaire d’Hélène. Que fais-tu avant de lui répondre ?` };
};
// ── d1 : une variante qui tire ses propres nombres (jamais ceux d'un jalon de la séance).
const varianteD1 = (h) => {
  const d = h.entier(9, 15), r = d + h.entier(10, 16);
  return { enonce: `Endives du Ternois a déclaré ${d} palettes au lieu de ${r}. Le contrat dit que l’émetteur déclare. Qui doit corriger ?`,
    libs: { ternois: 'Endives du Ternois : le contrat signé s’impose à elle', chep: 'CHEP, propriétaire', personne: `Personne : ${r - d} palettes, l’erreur est petite` },
    retour: `Le contrat signé s’impose à elle (art. 1103) : c’est Endives du Ternois qui corrige sa déclaration, ${r} palettes et non ${d}.` };
};

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { sandrine: EQUIPE.sandrine },
  ouverture: { id: 'avant-de-commencer', de: 'sandrine', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, une cliente conteste son relevé de palettes. Avant de t’y mettre, lis les documents à gauche et réponds à mes questions.',
    documents: ['chep', 'droit', 'conditions'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['p1', 'p2', 'p3', 'p4', 'd1', 'd2', 'd3', 'd4'] },
  liste: [
    // ── préparation (4 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'preparation', cle: true,
      enonce: 'Qui déclare un transfert de palettes CHEP vers un distributeur ?',
      aide: 'Lis l’article 3 des conditions de location, à gauche.',
      choix: [{ v: 'emetteur', lib: 'l’émetteur, qui a expédié la marchandise' }, { v: 'distributeur', lib: 'le distributeur, qui la reçoit' },
        { v: 'chep', lib: 'CHEP, au retour des palettes' }],
      juste: 'emetteur',
      retour: 'C’est l’émetteur qui sait ce qu’il a chargé dans le camion : c’est lui qui déclare, au plus tard le jour ouvré suivant.' },
    { id: 'p2', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'preparation', cle: true,
      enonce: 'Un transfert non déclaré…',
      aide: 'Lis les articles 2 et 3 des conditions de location.',
      choix: [{ v: 'reste', lib: 'laisse les palettes sur le compte de l’émetteur, qui continue à payer leur location' },
        { v: 'passe', lib: 'passe tout seul sur le compte du distributeur' }, { v: 'annule', lib: 'est annulé au bout d’une semaine' }],
      juste: 'reste',
      retour: 'Tant que le transfert n’est pas déclaré, les palettes restent sur son compte : il paie leur location chaque jour.' },
    { id: 'p3', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'preparation',
      enonce: 'Le tri trouve des palettes LPR dans un retour déjà crédité. Le crédit était…',
      aide: 'Lis l’article 5 des conditions : seules les palettes CHEP se déclarent. Le mot [[autre pool]] est dans le lexique.',
      choix: [{ v: 'haut', lib: 'trop haut : on le corrige' }, { v: 'juste', lib: 'juste : une palette est une palette' },
        { v: 'bas', lib: 'trop bas : on ajoute les LPR' }],
      juste: 'haut',
      retour: 'Les LPR ne sont pas à CHEP : elles n’auraient pas dû sortir du compte. Le crédit était trop haut, on le corrige.' },
    { id: 'p4', type: 'ouverture', de: 'sandrine', doc: 'chep', rubrique: 'preparation', cle: true,
      enonce: 'Le solde d’un compte CHEP, c’est…',
      aide: 'Le mot [[solde]] est dans le lexique.',
      choix: [{ v: 'paie', lib: 'le nombre de palettes dont le client paie la location' }, { v: 'entrepot', lib: 'le nombre de palettes dans son entrepôt' },
        { v: 'reparees', lib: 'le nombre de palettes réparées' }],
      juste: 'paie',
      retour: 'Le solde, c’est ce qu’il paie chaque jour : ce n’est pas forcément ce qu’il voit sur son parc.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'd1', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit', cle: true, variante: varianteD1,
      enonce: 'Endives du Ternois a déclaré moins de palettes que son bordereau n’en porte. Le contrat dit que l’émetteur déclare. Qui doit corriger ?',
      aide: 'Lis l’article 1103 dans « Le droit », et l’article 3 des conditions.',
      choix: [{ v: 'ternois', lib: 'Endives du Ternois : le contrat signé s’impose à elle' }, { v: 'chep', lib: 'CHEP, propriétaire' },
        { v: 'personne', lib: 'Personne : l’erreur est petite' }],
      juste: 'ternois',
      retour: 'Le contrat signé s’impose à elle (art. 1103) : c’est Endives du Ternois qui corrige sa déclaration.' },
    { id: 'd2', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'droit',
      enonce: 'Les conditions prévoient une correction dans les 60 jours après la facture. Une erreur vue après 90 jours…',
      aide: 'Lis l’article 6 des conditions de location.',
      choix: [{ v: 'accord', lib: 'ne se corrige plus sans l’accord écrit de l’autre partie' }, { v: 'quand', lib: 'se corrige quand on veut' },
        { v: 'office', lib: 'est corrigée d’office par CHEP' }],
      juste: 'accord',
      retour: 'Passé le délai du contrat, on ne corrige plus seul : il faut que l’autre partie l’accepte, par écrit.' },
    { id: 'd3', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit',
      enonce: 'Une palette CHEP disparaît chez Endives du Ternois, sans preuve de ce qui s’est passé. Qui en répond ?',
      aide: 'Lis l’article 1732, à gauche.',
      choix: [{ v: 'ternois', lib: 'Endives du Ternois, qui l’avait en location' }, { v: 'chep', lib: 'CHEP' },
        { v: 'transporteur', lib: 'le dernier transporteur passé' }],
      juste: 'ternois',
      retour: 'L’article 1732 : le locataire répond des pertes pendant qu’il a la chose, sauf s’il prouve qu’elles ne sont pas de sa faute.' },
    { id: 'd4', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit',
      enonce: 'Pour le règlement européen PPWR, un système de réemploi doit pouvoir…',
      aide: 'Lis « Et l’Europe ? » dans « Le droit ».',
      choix: [{ v: 'suivre', lib: 'suivre l’usage, le retour, la réparation et la remise en circulation de chaque emballage' },
        { v: 'neuves', lib: 'fabriquer des palettes neuves chaque année' }, { v: 'bois', lib: 'interdire les palettes en bois' }],
      juste: 'suivre',
      retour: 'Réemployer, c’est suivre chaque emballage d’un usage à l’autre : c’est ce que fait un pool de palettes.' },
    // ── au fil du travail (notées : 1 point chacune)
    { id: 'compter-retour', type: 'fil', de: 'sandrine', quand: quandRetour, poids: 1, apres: 'bilan',
      enonce: 'Grégory a écrit « 5 piles × 15 = 75 — OK ». Qu’est-ce qui aurait évité l’erreur ?',
      choix: [{ v: 'compter', lib: 'Compter chaque pile et regarder le marquage des palettes, comme au quai mardi dernier.' },
        { v: 'peser', lib: 'Peser le camion à l’arrivée.' }, { v: 'recopier', lib: 'Recopier le bon de collecte, c’est plus sûr.' }],
      juste: 'compter', groupe: 'Question de Sandrine : compter un retour',
      retour: 'Mardi, tu as vu qu’une palette LPR ne se voit qu’en regardant la pile de près.' },
    { id: 'qui-declare', type: 'fil', de: 'sandrine', quand: quandQui, poids: 1, apres: 'bilan', selon: selonQui,
      enonce: 'Hélène voudrait que CHEP corrige elle-même son transfert. D’après les conditions qu’elle a signées, qui doit le faire ?',
      choix: [{ v: 'ternois', lib: 'Endives du Ternois : l’émetteur déclare ses transferts, et le contrat s’impose aux deux parties.' },
        { v: 'chep', lib: 'CHEP, puisque c’est son relevé.' }, { v: 'distributeur', lib: 'Le distributeur qui a reçu les palettes.' },
        { v: 'petite', lib: 'Personne : une erreur de moins de 30 palettes ne se corrige pas.' }],
      juste: 'ternois', groupe: 'Question de Sandrine : qui déclare',
      retour: 'Le contrat dit que c’est elle qui déclare : si CHEP le faisait à sa place, personne ne pourrait plus se fier aux déclarations.' },
    { id: 'ecart-restant', type: 'fil', de: 'sandrine', quand: quandEcart, poids: 1, selon: selonEcart,
      enonce: 'Ton relevé corrigé laisse un écart avec l’inventaire d’Hélène. Que fais-tu avant de lui répondre ?',
      choix: [{ v: 'verifier', lib: 'Je vérifie que ce que j’ai trouvé l’explique, avant de répondre.' },
        { v: 'retirer', lib: 'Je retire ces palettes de son compte pour qu’elle soit contente.' }, { v: 'rien', lib: 'Je ne dis rien : c’est son problème.' }],
      juste: 'verifier', groupe: 'Question de Sandrine : l’écart restant',
      retour: 'Répondre avec un écart inexpliqué, c’est s’exposer à une deuxième réclamation.' },
    { id: 'delai', type: 'fil', de: 'sandrine', actif: false, quand: apresGeste(G.typeB1), poids: 1,
      enonce: 'Hélène découvre en avril une erreur de janvier. D’après les conditions (60 jours), peut-elle encore la corriger seule ?',
      choix: [{ v: 'accord', lib: 'Non : passé 60 jours, il faut l’accord écrit de CHEP.' }, { v: 'toujours', lib: 'Oui, à tout moment.' },
        { v: 'perdu', lib: 'Non, c’est perdu.' }],
      juste: 'accord', groupe: 'Question de Sandrine : le délai de correction',
      retour: 'Le délai du contrat protège les deux parties : passé 60 jours, on se met d’accord par écrit.' },
    { id: 'confiance', type: 'fil', de: 'sandrine', quand: apresMail({ a: CLIENT.contact.mail }), reflexion: true, apres: 'bilan',
      enonce: 'Pourquoi CHEP a-t-elle intérêt à dire à Hélène une erreur qui était en sa faveur ?',
      choix: [{ v: 'confiance', lib: 'Tout repose sur la bonne foi des déclarations : un loueur qui cache ses erreurs perd la confiance de ses clients.' },
        { v: 'loi', lib: 'Parce que la loi l’oblige à rembourser.' }, { v: 'aucun', lib: 'Elle n’y a aucun intérêt : ce sont des palettes en moins.' }],
      retour: 'Les palettes ne sont pas numérotées : CHEP demande à ses clients de déclarer de bonne foi. Elle doit faire de même avec ses propres erreurs.' },
    { id: 'pour-reflechir', type: 'fil', de: 'sandrine', quand: apresMail({ a: CLIENT.contact.mail }), reflexion: true, libre: true, apres: 'bilan',
      enonce: 'Pour réfléchir : l’erreur de Grégory était en faveur d’Hélène. Pourquoi faut-il quand même la corriger et la lui dire ?',
      retour: 'Un compte juste, c’est un compte juste dans les deux sens : c’est ce qui permet ensuite de demander à la cliente de corriger ses propres déclarations.' },
  ],
};
