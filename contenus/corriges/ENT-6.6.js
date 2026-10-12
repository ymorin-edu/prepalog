// Corrigé d'ENT-6.6 (France Boissons, inventaire tournant), montré dans l'onglet « Corrigés » de l'enseignant.
//
// CALCULÉ à l'ouverture depuis les données de la séance (`contenus/france-boissons-ent66-donnees.js`), la vue Plan d'entrepôt (`futsReels` :
// ce qui se voit vraiment dans chaque couloir) et le fichier de questions. Rien n'est recopié.

import { PLAN, LIGNES, SYSTEME, CODES, INVENTAIRE, POIDS, attenduCompteRendu } from '../france-boissons-ent66-donnees.js';
import { QUESTIONS } from '../questions/ENT-6.6.js';
import { futsReels } from '../../core/types/entrepot.js';

const net = (t) => String(t).replace(/<[^>]+>/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, m, a) => a || m);
const libDe = (q) => (q.choix.find((c) => c.v === q.juste) || {}).lib || '';
const signe = (n) => (n > 0 ? `+${n}` : String(n).replace('-', '−'));
const reel = Object.fromEntries(LIGNES.map((l) => [l.couloir, futsReels(PLAN, l.couloir, l.ref, l.lot)]));
const ligneInv = (c) => INVENTAIRE.lignes.find((l) => l.cle === c);
const att = attenduCompteRendu(reel);
const notees = QUESTIONS.liste.filter((q) => q.type !== 'ouverture');
const somme = Object.values(POIDS).reduce((t, p) => t + p, 0);
const LIB = { regul: 'Régulariser', rayon: 'Remettre en place (sans régulariser)' };

export const CORRIGE = {
  code: 'ENT-6.6',
  titre: 'France Boissons — inventaire tournant',
  trame: '(pas de trame : tout se fait à l’écran)',
  items: [
    { etape: 1, etapeTitre: 'Compter avec le terminal', genre: 'tableau', texte: 'Les 7 lignes du terminal, dans son ordre',
      contexte: 'À l’aveugle : le stock du logiciel n’apparaît nulle part avant la fin du comptage. Le code de contrôle n’est pas noté (un code faux '
        + 'est redemandé et gardé en trace). Une palette pleine = 8 fûts ; la palette incomplète est toujours au sommet de la pile.',
      entetes: ['Couloir', 'Code', 'Référence', 'Compté juste', 'Logiciel'],
      reponses: LIGNES.map((l) => [l.couloir, CODES[l.couloir], ligneInv(l.couloir).designation, String(reel[l.couloir]), String(SYSTEME[l.couloir])]),
      note: 'Pièges : M01 = 15 (la palette du dessus n’a que 7 fûts ; le fût percé est en zone litiges) ; M02 = 8 (la Pelforth posée dessus ne se '
        + 'compte pas ici) ; M04 = 0 (couloir vide : 0 est une réponse) ; M08 = 19 (la palette de devant n’a que 3 vides).' },
    { etape: 2, etapeTitre: 'Écarts et décisions', genre: 'tableau', texte: 'L’écran Inventaire, avec un comptage juste',
      contexte: 'Écart = compté − théorique, calculé sur les comptages DE L’ÉLÈVE (un comptage faux n’est pas compté deux fois). Rien n’est corrigé '
        + 'avant le bilan. La décision sur les vides est attendue mais non notée à part (la consigne en euros la porte).',
      entetes: ['Couloir', 'Écart', 'Décision attendue', 'Pourquoi'],
      reponses: LIGNES.map((l) => { const i = ligneInv(l.couloir), e = reel[l.couloir] - SYSTEME[l.couloir];
        return [l.couloir, signe(e), i.attendu ? `${LIB[i.attendu]}${i.motif ? `, motif « ${i.motif} »` : ''}` : '— (pas d’écart)', i.explication || '']; }) },
    { etape: 3, etapeTitre: 'Compte rendu à Nadia', genre: 'tableau', texte: 'La fiche attendue, avec un comptage juste',
      contexte: 'Calculée sur les comptages DE L’ÉLÈVE : M01 compté 16 donne 5 lignes justes et 71 % ; M08 compté 22 donne 0 €.',
      entetes: ['Case', 'Attendu'],
      reponses: [['Fûts vides manquants', String(att.videsManquants)], ['Consigne perdue', `${att.euros} €`],
        ['Lignes justes', `${att.justes} sur ${att.lignes}`], ['Taux de fiabilité', `${att.taux} %`]],
      note: 'Lignes justes : M02, M03, M05 et M06. Le fût percé (M01) n’avait pas été saisi : le logiciel promettait 16 fûts de Heineken S20 pour vendredi.' },
    { etape: 4, etapeTitre: 'Les questions', genre: 'tableau', texte: 'Les questions posées pendant la séance',
      contexte: 'Trois sont notées (4 points sur 20), une est pour réfléchir. Les questions de l’écran « Avant de commencer » ne comptent pas.',
      entetes: ['Question', 'Quand', 'Réponse attendue'],
      reponses: notees.map((q) => [net(q.enonce).slice(0, 110), q.reflexion ? 'pour réfléchir' : `notée ${q.poids}`, q.juste ? libDe(q) : 'sans réponse unique']) },
    { etape: 5, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: `Jalons sur ${somme} points : compter 8 (M01 : 2, M02 : 2, M04 : 1,5, M08 : 1,5, M03-M05-M06 ensemble : 1), écarts et décisions 5,5 `
        + '(les 7 écarts : 1,5, M04 remettre en place : 2,5, M01 régulariser Casse : 1,5), compte rendu 2,5 (vides : 1,5, taux : 1). '
        + 'Questions notées 4 (1 + 1,5 + 1,5). Total 20, tout en C1.6.',
      note: 'Rien n’est vrai sans geste : une ligne non comptée est fausse, un inventaire non validé ou une fiche non envoyée aussi. '
        + 'Règle du premier bilan : « Corriger » rouvre le compte rendu seulement (le comptage et l’inventaire sont figés).' },
  ],
};
