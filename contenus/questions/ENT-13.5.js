// Les questions d'ENT-13.5 — Stellantis, évaluation de rentrée (brief `docs/briefs/ENT-13.5-stellantis-evaluation-rentree.md` §4 et §4 bis ; choix de Tristan du 26/10/2026 :
// propositions du brief prises telles quelles). Modifier ce fichier suffit (voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`). Karim est CONSTRUIT.
//
// ÉVALUATION, comme ENT-11.3. Deux sortes de questions notées :
//  - « Avant de commencer » (`ouverture.part: 4`) : quatre questions tirées (une de réception, une de calcul ABC, une d'inventaire, une de droit) parmi huit, reprises de 13.2 à 13.4 ;
//    aucune aide, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (mauvaises réponses), plancher 0 ; « Réponse enregistrée. » sans correction.
//  - trois questions au fil (`part: 2`, 2/3 de point chacune, `apres: 'bilan'` : « Merci, je note », la correction n'arrive qu'avec le bilan) :
//    le dommage caché (L133-3, éco-droit appliqué au cas) quand le bon est signé · « tes A : combien, quelle part ? » quand le fichier est déposé (texte calculé sur SON classement) ·
//    « pourquoi ne pas régulariser tout de suite ? » quand l'inventaire est validé.

import { ID, depose, quaiSigne, lesA } from '../stellantis-ent135-donnees.js';

const q = (id, rubrique, doc, enonce, choix, juste, retour, o = {}) => ({ id, type: 'ouverture', de: 'karim', doc, rubrique, enonce, choix, juste, retour, ...o });
const pc = (x) => `${Math.round(x * 100)} %`;
const invValide = (db) => !!(db && db.inventaires && Object.values(db.inventaires).some((e) => e && e.valide));

export const QUESTIONS = {
  id: ID,
  part: 2,
  personnes: { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } },
  ouverture: { id: 'avant-de-commencer', de: 'karim', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Aujourd’hui, tu fais seul. Avant de commencer, réponds à mes questions, sans aide.',
    documents: ['poste-135', 'mots-135', 'droit-135'],
    tirage: { reception: 1, calcul: 1, inventaire: 1, droit: 1 },
    questions: ['bl', 'reserve', 'pct', 'cumul', 'ecart', 'aveugle', 'delai', 'annuel'] },
  liste: [
    // ── réception (2 : l'élève en reçoit 1)
    q('bl', 'reception', 'mots-135', 'Le bon de livraison, c’est…',
      [{ v: 'envoye', lib: 'le document qui dit ce que le fournisseur a envoyé' }, { v: 'facture', lib: 'la facture du fournisseur' }, { v: 'commande', lib: 'la commande de l’usine' }], 'envoye',
      'Le bon de livraison (BL) liste ce que le fournisseur a envoyé : on lui compare ce qu’on reçoit.', { cle: true }),
    q('reserve', 'reception', 'mots-135', 'Une réserve bien écrite dit…',
      [{ v: 'precis', lib: 'combien, quoi, quel dommage' }, { v: 'deballage', lib: '« sous réserve de déballage »' }, { v: 'abimes', lib: '« colis abîmés »' }], 'precis',
      'Une réserve doit être précise : le nombre de cartons, la référence, la nature du dommage. « Sous réserve de déballage » ou « colis abîmés » ne protègent de rien.', { cle: true }),
    // ── calcul ABC (2)
    q('pct', 'calcul', 'mots-135', 'Une référence a 120 sorties sur 800 sorties au total. Sa part est…',
      [{ v: '15', lib: '15 %' }, { v: '120', lib: '120 %' }, { v: '6', lib: '6,7 %' }], '15',
      '120 ÷ 800 = 0,15 : la part est de 15 %. On divise ses sorties par le total.', { cle: true }),
    q('cumul', 'calcul', 'mots-135', 'Dans la liste triée, la 1re référence a une part de 40 % et la 2e une part de 25 %. Le cumul de la 2e est…',
      [{ v: '65', lib: '65 %' }, { v: '25', lib: '25 %' }, { v: '15', lib: '15 %' }], '65',
      '40 % + 25 % = 65 % : le cumul d’une ligne, c’est le cumul de la ligne du dessus plus sa part.', { cle: true }),
    // ── inventaire (2)
    q('ecart', 'inventaire', 'mots-135', 'Le logiciel dit 20 pièces ; l’équipe en compte 17. L’écart est…',
      [{ v: 'moins3', lib: '−3 (il en manque 3)' }, { v: 'plus3', lib: '+3 (il y en a 3 de trop)' }, { v: 'zero', lib: '0' }], 'moins3',
      'Écart = compté − théorique : 17 − 20 = −3. Négatif : il en manque.', { cle: true }),
    q('aveugle', 'inventaire', 'mots-135', 'Compter « à l’aveugle », c’est compter…',
      [{ v: 'sans', lib: 'ce qu’on voit, sans regarder le chiffre du logiciel' }, { v: 'nuit', lib: 'de nuit' }, { v: 'vite', lib: 'le plus vite possible' }], 'sans',
      'On compte ce qu’on voit, sans regarder le chiffre du logiciel : sinon on le recopie sans le vouloir.', { cle: true }),
    // ── droit (2)
    q('delai', 'droit', 'droit-135', 'Un dommage découvert après la livraison se signale au transporteur…',
      [{ v: '3j', lib: 'dans les 3 jours, par écrit motivé' }, { v: 'toujours', lib: 'quand on veut' }, { v: 'jamais', lib: 'jamais' }], '3j',
      'Code de commerce, art. L133-3 : le destinataire a trois jours, jours fériés non compris, pour notifier au transporteur sa protestation motivée.', { cle: true }),
    q('annuel', 'droit', 'droit-135', 'Une entreprise doit contrôler son stock par inventaire…',
      [{ v: '12', lib: 'au moins une fois tous les douze mois' }, { v: 'jamais', lib: 'quand elle le décide' }, { v: 'jour', lib: 'tous les jours' }], '12',
      'Code de commerce, art. L123-12 : l’entreprise contrôle par inventaire, au moins une fois tous les douze mois, l’existence et la valeur de son patrimoine.', { cle: true }),

    // ── au fil du travail (notées, sans retour avant le bilan)
    { id: 'dommage-cache', type: 'fil', de: 'karim', apres: 'bilan', groupe: 'Le droit appliqué au cas', poids: 1, quand: quaiSigne,
      enonce: 'Lundi, en ouvrant un carton intact, on découvre des pièces cassées. On n’avait rien écrit sur le bon de livraison signé vendredi. Que faire, et dans quel délai ?',
      choix: [{ v: 'lettre', lib: 'Envoyer au transporteur une protestation motivée dans les 3 jours, jours fériés non compris, par lettre recommandée' },
        { v: 'plus', lib: 'Plus rien : le bon est signé' }, { v: 'chauffeur', lib: 'Appeler le chauffeur quand on veut' }],
      juste: 'lettre', retour: 'Code de commerce, art. L133-3 : il reste trois jours, jours fériés non compris, pour notifier au transporteur une protestation motivée, par lettre recommandée. Passé ce délai, l’action contre lui est éteinte.' },
    { id: 'mes-a', type: 'fil', de: 'karim', apres: 'bilan', groupe: 'Lire son classement', poids: 1, quand: depose,
      enonce: 'Dans ton classement, combien de références sont classées A, et quelle part des sorties font-elles ?',
      choix: [{ v: 'juste', lib: '3 références, la majorité des sorties' }, { v: 'nb', lib: '5 références, la majorité des sorties' }, { v: 'part', lib: '3 références, presque toutes les sorties' }],
      juste: 'juste',
      selon: (db) => {
        const A = lesA(db);
        return { enonce: 'Dans ton classement, combien de références sont classées A, et quelle part des sorties font-elles ?',
          libs: { juste: `${A.n} références, ${pc(A.part)} des sorties`, nb: `${A.n + 2} références, ${pc(A.part)} des sorties`, part: `${A.n} références, ${pc(A.cumulB)} des sorties` },
          retour: `Les A de ton classement sont ${A.n} références sur ${A.total} ; elles font ${pc(A.part)} des sorties (le cumul de la dernière A). Peu de références, la plus grande part des sorties : c’est ce que la méthode ABC révèle.` };
      },
      retour: 'Les A sont peu nombreux et font la plus grande part des sorties : c’est le sens de la méthode ABC.' },
    { id: 'pas-regulariser', type: 'fil', de: 'karim', apres: 'bilan', groupe: 'L’écart d’inventaire', poids: 1, quand: invValide,
      enonce: 'Pourquoi ne pas régulariser le stock dès qu’on trouve un écart ?',
      choix: [{ v: 'cause', lib: 'Parce qu’il faut d’abord chercher la cause : la pièce est peut-être seulement mal rangée' }, { v: 'regle', lib: 'Parce que c’est interdit' },
        { v: 'temps', lib: 'Parce que ça prend trop de temps' }],
      juste: 'cause', retour: 'Un écart est un signal : on cherche d’abord la cause. Si la pièce existe (mal rangée), on la remet en place sans toucher au stock ; si elle a vraiment disparu, on régularise avec un motif.' },
  ],
};
