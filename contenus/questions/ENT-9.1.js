// Les questions d'ENT-9.1 — CHEP, le compte palettes (brief `docs/briefs/ENT-9.1-chep-compte-palettes.md` §4 bis et §4 ter, choix de
// Cowork sur délégation de Tristan du 17/10/2026). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personne et situations CONSTRUITES (Sandrine Delattre, Hélène Caron).
//
// AU FIL (3 notées : `part: 3`, 1 point chacune ; 1 en réserve ; 2 réflexions non notées) :
// - `palettes-chep` (NOTÉE, au bilan) : Sandrine, quand l'élève a choisi le type du document PARTIEL de son tirage (geste par rôle :
//   `fiche:decl:type-partiel`). Énoncé et réponses calculés sur SA pièce (`selon`) : le total du bordereau, les palettes CHEP, les autres.
// - `qui-repond` (NOTÉE, tout de suite, éco-droit appliqué au cas : art. 1732 du Code civil, joint au message de Sandrine) : Sandrine,
//   quand l'élève a saisi les palettes CHEP du RETOUR (`fiche:decl:qte-retour`).
// - `ce-solde` (NOTÉE, au bilan) : Sandrine, à la sortie de la case du solde du relevé (`fiche:releve:compte`), énoncé sur SON solde.
// - `reemploi` : en réserve (`actif: false`), éco-droit (PPWR).
// - `pourquoi-declarer` : réflexion non notée à l'envoi de la réponse à Hélène (ligne `conseil`), corrigée au bilan.
// - `jours-pour-rien` : « Pour réfléchir » du brief §4, réponse libre non notée, lue au bilan (le transfert du mercredi déclaré 5 jours tard).
//
// AVANT DE COMMENCER : une banque de 9 questions NON notées, 4 tirées par élève (2 préparation, 2 droit). `cle: true` = reprises en 9.4.

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { lireFeuille } from '../../core/types/fiche.js';
import { EQUIPE, PRIX_LOCATION, coutLocation, palettes, euros, DISTRIBUTEURS } from '../chep.js';
import { ID, FICHES, BLOC_COMPTE, champ, jeuEleve, fiche, declaration, lignesDeclarees, caseSolde, CLIENT, BLOC_RELEVE, soldeDeLaFeuille } from '../chep-ent91-donnees.js';

// Une condition « geste fait ET case remplie », qui déclare ses gestes (le moteur vérifie qu'une vue les publie).
const condition = (gestes, f) => { const q = (db, s) => f(db, s); q.gestes = gestes; return q; };
const fait = (db, s, nom) => apresGeste(nom)(db, s);
const G = { typePartiel: `fiche:${FICHES.decl}:${champ('type', 'partiel')}`, qteRetour: `fiche:${FICHES.decl}:${champ('qte', 'retour')}`,
  compte: `fiche:${FICHES.releve}:${BLOC_COMPTE}`, typeEmission: `fiche:${FICHES.decl}:${champ('type', 'emission')}` };

// ── Le document partiel de SON tirage : le type choisi.
const quandPartiel = condition([G.typePartiel], (db, s) => fait(db, s, G.typePartiel) && !!declaration(fiche(db, FICHES.decl).v, 'partiel').type);
const selonPartiel = (db) => {
  const d = jeuEleve(db).parRole.partiel;
  const quoi = d.autres === 'lpr' ? 'rouges LPR' : 'Europe';
  return { enonce: `Le bordereau pour ${DISTRIBUTEURS[d.a].nom} porte ${palettes(d.total)}. Combien vont sur le compte CHEP d’Hélène ?`,
    libs: { chep: `${d.attendu.qte} : seulement les palettes CHEP.`, total: `${d.total} : tout ce qui est dans le camion.`,
      autres: `${d.total - d.attendu.qte} : les palettes ${quoi}.` },
    retour: d.autres === 'lpr'
      ? `Les ${d.total - d.attendu.qte} palettes rouges sont à LPR, un autre pool : sur le compte CHEP, elles fausseraient le solde.`
      : `Les ${d.total - d.attendu.qte} palettes Europe repartent en échange : sur le compte, elles fausseraient le solde.` };
};
// ── Le retour : la case des palettes CHEP remplie.
const quandRetour = condition([G.qteRetour], (db, s) => fait(db, s, G.qteRetour) && Number.isFinite(declaration(fiche(db, FICHES.decl).v, 'retour').qte));
// ── Le solde de SON relevé, à la sortie de la case.
const soldeSaisi = (db) => lireFeuille(FICHES.releve, BLOC_RELEVE, db).cases[caseSolde(lignesDeclarees(db).length)];
const quandSolde = condition([G.compte], (db, s) => fait(db, s, G.compte) && soldeSaisi(db) != null && String(soldeSaisi(db)).trim() !== '');
const selonSolde = (db) => {
  const J = jeuEleve(db);
  // La valeur de SA case (une formule calculée, ou un nombre tapé), jamais corrigée.
  const x = soldeDeLaFeuille(lireFeuille, db);
  return { enonce: Number.isFinite(x)
    ? `Ton solde passe de ${J.s0} à ${x}. Pour Endives du Ternois, ce chiffre, c’est…`
    : `Ton relevé part de ${J.s0} palettes et donne un nouveau solde. Pour Endives du Ternois, ce chiffre, c’est…` };
};
// ── À l'envoi de la réponse : la réflexion, puis « pour réfléchir » (le transfert du mercredi déclaré cinq jours tard).
const selonJours = (db) => {
  const J = jeuEleve(db), n = J.parRole.transfert.attendu.qte;
  return { enonce: `Pour réfléchir : Hélène a déclaré son transfert du mercredi (${palettes(n)} vers Frais du Nord) avec cinq jours de retard. `
      + `Combien de jours de location a-t-elle payés pour rien, et combien cela fait-il pour ${n} palettes à ${String(PRIX_LOCATION).replace('.', ',')} € par jour ?`,
    retour: `Cinq jours pour rien : ${n} palettes × 5 jours × ${String(PRIX_LOCATION).replace('.', ',')} € = ${euros(coutLocation(n, 5))} HT. Peu pour une semaine, `
      + 'beaucoup sur une campagne : c’est pour ça que chaque transfert se déclare dès le départ du camion.' };
};

export const QUESTIONS = {
  id: ID,
  part: 3,
  personnes: { sandrine: EQUIPE.sandrine },
  ouverture: { id: 'avant-de-commencer', de: 'sandrine', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Bienvenue au service relation clients. Ce matin, tu vas t’occuper du compte palettes d’une cliente. Avant de commencer, '
      + 'lis les documents à gauche et réponds à mes questions.',
    documents: ['chep', 'conditions', 'droit'],
    tirage: { preparation: 2, droit: 2 },
    questions: ['p1', 'p2', 'p3', 'p4', 'p5', 'd1', 'd2', 'd3', 'd4'] },
  liste: [
    // ── préparation (5 : l'élève en reçoit 2)
    { id: 'p1', type: 'ouverture', de: 'sandrine', doc: 'chep', rubrique: 'preparation', cle: true,
      enonce: 'CHEP, c’est…',
      aide: 'Lis « CHEP en bref », à gauche.',
      choix: [{ v: 'loueur', lib: 'un loueur de palettes qui les récupère, les répare et les remet en circulation' },
        { v: 'fabricant', lib: 'un fabricant qui vend des palettes neuves' }, { v: 'transporteur', lib: 'un transporteur de marchandises' }],
      juste: 'loueur',
      retour: 'CHEP loue ses palettes bleues et les fait tourner : livrées à un client, elles reviennent dans un centre de service pour repartir.' },
    { id: 'p2', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'preparation',
      enonce: 'Une palette bleue posée chez Endives du Ternois appartient à…',
      aide: 'Lis l’article 1 des conditions de location.',
      choix: [{ v: 'chep', lib: 'CHEP' }, { v: 'ternois', lib: 'Endives du Ternois, puisqu’elle l’a reçue' }, { v: 'plateforme', lib: 'la plate-forme qui recevra les endives' }],
      juste: 'chep',
      retour: 'Les palettes restent la propriété de CHEP : le client les loue, il ne les achète jamais.' },
    { id: 'p3', type: 'ouverture', de: 'sandrine', doc: 'chep', rubrique: 'preparation', cle: true,
      enonce: 'Dans le pool CHEP, un « émetteur », c’est…',
      aide: 'Lis « CHEP en bref » ; le mot [[émetteur]] est dans le lexique.',
      choix: [{ v: 'emetteur', lib: 'l’entreprise qui reçoit des palettes de CHEP et y charge sa marchandise' },
        { v: 'plateforme', lib: 'la plate-forme qui reçoit la marchandise' }, { v: 'centre', lib: 'le centre de service qui répare les palettes' }],
      juste: 'emetteur',
      retour: 'Endives du Ternois est un émetteur : elle reçoit des palettes vides, les charge d’endives et les expédie. C’est elle qui déclare les transferts.' },
    { id: 'p4', type: 'ouverture', de: 'sandrine', doc: 'chep', rubrique: 'preparation',
      enonce: 'À quoi sert le centre de Templemars ?',
      aide: 'Lis « CHEP en bref » (chiffres de 2017, donnés comme tels).',
      choix: [{ v: 'trier', lib: 'à trier, contrôler, réparer et stocker les palettes avant de les réémettre' },
        { v: 'fabriquer', lib: 'à fabriquer des palettes neuves' }, { v: 'endives', lib: 'à vendre des endives' }],
      juste: 'trier',
      retour: 'Les palettes qui reviennent y sont inspectées, triées, réparées s’il le faut, puis stockées avant de repartir chez un client.' },
    { id: 'p5', type: 'ouverture', de: 'sandrine', doc: 'chep', rubrique: 'preparation', cle: true,
      enonce: 'Une palette en bois brut marquée EPAL, chez CHEP…',
      aide: 'Le mot [[palette Europe]] est dans le lexique.',
      choix: [{ v: 'hors', lib: 'n’est pas dans le pool : elle ne se déclare pas sur un compte CHEP' },
        { v: 'declare', lib: 'se déclare comme une palette bleue' }, { v: 'repeinte', lib: 'est repeinte en bleu et devient CHEP' }],
      juste: 'hors',
      retour: 'Une palette Europe s’échange une pour une entre entreprises : elle n’a rien à faire sur un compte CHEP.' },
    // ── droit (4 : l'élève en reçoit 2)
    { id: 'd1', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit',
      enonce: 'Endives du Ternois paie CHEP pour se servir de ses palettes. En droit, ce contrat est…',
      aide: 'Lis l’article 1709, à gauche.',
      choix: [{ v: 'louage', lib: 'un louage de choses (une location)' }, { v: 'vente', lib: 'une vente' }, { v: 'pret', lib: 'un prêt gratuit' }],
      juste: 'louage',
      retour: 'Faire jouir d’une chose pendant un temps, contre un prix : c’est la définition du louage. Les palettes ne changent pas de propriétaire.' },
    { id: 'd2', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit', cle: true,
      variante: (h) => { const n = h.entier(3, 9); return { enonce: `Un cariste d’Endives du Ternois casse ${n} palettes CHEP en les chargeant. Qui en répond devant CHEP ?`,
        libs: { ternois: 'Endives du Ternois : la perte arrive pendant qu’elle a les palettes, par sa faute', chep: 'CHEP, propriétaire des palettes', personne: 'Personne : c’est un accident' },
        retour: `L’article 1732 : le locataire répond des dégradations et des pertes pendant sa jouissance. Les ${n} palettes cassées par son cariste sont pour Endives du Ternois.` }; },
      enonce: 'Un cariste d’Endives du Ternois casse des palettes CHEP en les chargeant. Qui en répond devant CHEP ?',
      aide: 'Lis l’article 1732, à gauche.',
      choix: [{ v: 'ternois', lib: 'Endives du Ternois : la perte arrive pendant qu’elle a les palettes, par sa faute' },
        { v: 'chep', lib: 'CHEP, propriétaire des palettes' }, { v: 'personne', lib: 'Personne : c’est un accident' }],
      juste: 'ternois',
      retour: 'L’article 1732 : le locataire répond des dégradations et des pertes pendant sa jouissance, sauf s’il prouve qu’elles ne sont pas de sa faute.' },
    { id: 'd3', type: 'ouverture', de: 'sandrine', doc: 'conditions', rubrique: 'droit', cle: true,
      enonce: 'Le contrat dit : « la location court jusqu’à la déclaration du transfert ». Hélène a oublié de déclarer. Doit-elle payer ces jours ?',
      aide: 'Lis l’article 1103 dans « Le droit », et les articles 2 et 3 des conditions.',
      choix: [{ v: 'oui', lib: 'Oui : le contrat signé s’impose aux deux parties' }, { v: 'oubli', lib: 'Non : un oubli n’engage à rien' },
        { v: 'loi', lib: 'Non : la loi interdit de faire payer une location' }],
      juste: 'oui',
      retour: 'Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits (art. 1103) : tant que le transfert n’est pas déclaré, la location court.' },
    { id: 'd4', type: 'ouverture', de: 'sandrine', doc: 'droit', rubrique: 'droit',
      enonce: 'Depuis août 2026, le règlement européen sur les emballages (PPWR) pousse au réemploi des palettes. Le pool CHEP…',
      aide: 'Lis « Et l’Europe ? » dans « Le droit ».',
      choix: [{ v: 'reemploi', lib: 'est un système de réemploi : chaque palette est contrôlée, réparée et suivie avant de resservir' },
        { v: 'interdit', lib: 'est interdit par ce règlement' }, { v: 'obligatoire', lib: 'devient obligatoire pour toutes les entreprises' }],
      juste: 'reemploi',
      retour: 'Réemployer, c’est remettre en circulation après contrôle : c’est le métier de CHEP. Mais personne n’est obligé de louer ses palettes.' },
    // ── au fil du travail (notées : 1 point chacune)
    { id: 'palettes-chep', type: 'fil', de: 'sandrine', quand: quandPartiel, poids: 1, apres: 'bilan', selon: selonPartiel,
      enonce: 'Ce bordereau mêle des palettes CHEP à d’autres. Combien vont sur le compte CHEP d’Hélène ?',
      choix: [{ v: 'chep', lib: 'Seulement les palettes CHEP.' }, { v: 'total', lib: 'Tout ce qui est dans le camion.' }, { v: 'autres', lib: 'Les palettes Europe (ou rouges).' }],
      juste: 'chep', groupe: 'Question de Sandrine : les palettes à déclarer',
      retour: 'Seules les palettes CHEP se déclarent : les autres fausseraient le solde, et donc ce qu’Hélène paie.' },
    { id: 'qui-repond', type: 'fil', de: 'sandrine', quand: quandRetour, poids: 1,
      enonce: 'Hélène écrit : « 4 palettes ont disparu de notre parc, c’est sûrement le transporteur. » D’après l’article 1732 du Code civil (joint au message), qui répond de ces palettes devant CHEP ?',
      choix: [{ v: 'ternois', lib: 'Endives du Ternois, sauf si elle prouve que la perte n’est pas de sa faute.' },
        { v: 'chep', lib: 'CHEP, puisqu’elle en est propriétaire.' }, { v: 'transporteur', lib: 'Le transporteur, dans tous les cas.' },
        { v: 'personne', lib: 'Personne : une palette vide ne vaut rien.' }],
      juste: 'ternois', groupe: 'Question de Sandrine : qui répond des palettes',
      retour: 'C’est elle qui a les palettes en location : à elle de se retourner vers le transporteur si c’est lui.' },
    { id: 'ce-solde', type: 'fil', de: 'sandrine', quand: quandSolde, poids: 1, apres: 'bilan', selon: selonSolde,
      enonce: 'Ton relevé donne un nouveau solde. Pour Endives du Ternois, ce chiffre, c’est…',
      choix: [{ v: 'paie', lib: 'le nombre de palettes CHEP dont elle paie la location chaque jour' },
        { v: 'rangees', lib: 'le nombre de palettes rangées dans son entrepôt ce matin' }, { v: 'perdues', lib: 'le nombre de palettes qu’elle a perdues' }],
      juste: 'paie', groupe: 'Question de Sandrine : ce que dit le solde',
      retour: 'Ce solde, elle le paie tous les jours : c’est pour ça que chaque transfert compte.' },
    { id: 'reemploi', type: 'fil', de: 'sandrine', actif: false, quand: apresGeste(G.typeEmission), poids: 1,
      enonce: 'Depuis le 12/08/2026, un règlement européen pousse au réemploi des palettes. Le pool CHEP en est-il un exemple ?',
      choix: [{ v: 'oui', lib: 'Oui : chaque palette est contrôlée, réparée et suivie avant de resservir.' },
        { v: 'non', lib: 'Non : une palette louée n’est pas réemployée.' }, { v: 'oblige', lib: 'Oui, et ce règlement oblige tout le monde à louer chez CHEP.' }],
      juste: 'oui', groupe: 'Question de Sandrine : le réemploi',
      retour: 'Louer dans un pool, c’est réemployer : la palette repart après contrôle. Le règlement pousse au réemploi, il n’impose pas la location.' },
    { id: 'pourquoi-declarer', type: 'fil', de: 'sandrine', quand: apresMail({ a: CLIENT.contact.mail }), reflexion: true, apres: 'bilan',
      enonce: 'Pourquoi CHEP ne déclare-t-elle pas elle-même les transferts de ses clients ?',
      choix: [{ v: 'bonne-foi', lib: 'Les palettes ne sont pas numérotées : CHEP ne voit pas où elles vont, seul l’émetteur le sait.' },
        { v: 'flemme', lib: 'Parce que ça ne l’intéresse pas.' }, { v: 'loi', lib: 'Parce que la loi le lui interdit.' }],
      retour: 'Une palette bleue ressemble à toutes les autres : c’est l’émetteur, qui charge le camion, qui sait chez qui elle part. Tout repose sur ses déclarations.' },
    { id: 'jours-pour-rien', type: 'fil', de: 'sandrine', quand: apresMail({ a: CLIENT.contact.mail }), reflexion: true, libre: true, apres: 'bilan', selon: selonJours,
      enonce: 'Pour réfléchir : Hélène a déclaré son transfert du mercredi avec cinq jours de retard. Combien de jours de location a-t-elle payés pour rien, et combien cela fait-il ?',
      retour: 'Cinq jours pour rien : les palettes × 5 jours × 0,04 €. Peu pour une semaine, beaucoup sur une campagne : chaque transfert se déclare dès le départ du camion.' },
  ],
};
