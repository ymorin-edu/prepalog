// Les questions d'ENT-8.16 — Action, déstocker et signaler (brief `docs/briefs/ENT-8.16-action-destocker.md` §4 bis et §4 ter, PROPOSÉES par le
// brief, à relire par Tristan). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`.
//
// AU FIL (`part: 4`, « Les questions de Samia »), branchées sur les gestes de la préparation vocale :
// - `q-abime` (1, AU BILAN : elle éclairerait le jalon) : « Abîmé » dit, ou la ligne abîmée finie (`mot:abime`, `abime`) ;
// - `q-vide` (0,75) : « Emplacement vide » dit, ou la ligne vide finie (`mot:vide`, `vide`) ;
// - `q-reappro` (0,75) : la réserve descendue par Kevin (`reserve`) ;
// - `q-tomber` (1,5, éco-droit) : la fiche envoyée ; « Le droit » (C. trav. L1331-2) est joint au message « Ce que sait le système ».
// AVANT DE COMMENCER : banque de 8 notions NON notées, 4 tirées (3 de préparation, 1 image) ; `k-cariste`, `k-actualiser` et `img-vide` ajoutées
// par Claude Code (le moteur veut une banque double du tirage). Les `aide` sont de Claude Code (à relire).

import { apresFiche, apresGeste } from '../../core/declencheurs.js';
import { ID, GESTE, unDe } from '../action-ent816-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = { samia: { nom: 'Samia', role: 'cheffe d’équipe (ta tutrice)', appel: 'Samia', registre: 'tu' } };

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Ce matin, la commande est plus longue. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['jour', 'dessin-abime', 'dessin-vide'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-anomalie', 'k-signaler', 'k-reserve', 'k-code', 'k-cariste', 'k-actualiser', 'img-abime', 'img-vide'] },
  liste: [
    { id: 'k-anomalie', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Une anomalie, c’est…', aide: 'Clique sur le mot [[anomalie]].',
      choix: [{ v: 'probleme', lib: 'quelque chose qui ne va pas : carton abîmé, emplacement vide' }, { v: 'urgent', lib: 'une commande urgente' },
        { v: 'nouveau', lib: 'un nouveau produit' }],
      juste: 'probleme', retour: 'Une anomalie : quelque chose qui ne va pas. On la signale.' },
    { id: 'k-signaler', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Quand un carton est abîmé, je…', aide: 'Clique sur les mots [[carton abîmé]].',
      choix: [{ v: 'signale', lib: 'le laisse et je le signale' }, { v: 'cache', lib: 'le cache au fond de la palette' }, { v: 'jette', lib: 'le jette sans rien dire' }],
      juste: 'signale', retour: 'On le laisse et on le signale : le magasin ne le recevra pas.' },
    { id: 'k-reserve', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Les niveaux au-dessus du sol, c’est…', aide: 'Clique sur le mot [[réserve]].',
      choix: [{ v: 'reserve', lib: 'la réserve' }, { v: 'picking', lib: 'le picking' }, { v: 'quai', lib: 'le quai' }],
      juste: 'reserve', retour: 'En hauteur, la réserve ; au sol, le picking.' },
    { id: 'k-code', type: 'ouverture', de: 'samia', doc: 'dessin-vide', rubrique: 'preparation',
      enonce: 'Le code de contrôle se lit…', aide: 'Regarde l’emplacement, à gauche.',
      choix: [{ v: 'lisse', lib: 'sur la lisse, devant l’emplacement' }, { v: 'carton', lib: 'sur le carton' }, { v: 'terminal', lib: 'sur le terminal' }],
      juste: 'lisse', retour: 'Sur l’étiquette de la lisse : tu prouves que tu es au bon endroit.' },
    { id: 'k-cariste', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Quand le picking est vide, qui descend la palette de réserve ?', aide: 'Lis « Ta matinée ».',
      choix: [{ v: 'kevin', lib: 'Kevin, le cariste' }, { v: 'moi', lib: 'moi, avec le transpalette' }, { v: 'chauffeur', lib: 'le chauffeur du camion' }],
      juste: 'kevin', retour: 'Kevin, avec un chariot qui monte. Toi, tu signales.' },
    { id: 'k-actualiser', type: 'ouverture', de: 'samia', doc: 'jour', rubrique: 'preparation',
      enonce: 'Actualiser le stock, c’est…', aide: 'Clique sur le mot [[actualiser]].',
      choix: [{ v: 'maj', lib: 'dire au système ce qui a changé' }, { v: 'compter', lib: 'recompter tout l’entrepôt' }, { v: 'commander', lib: 'commander des produits' }],
      juste: 'maj', retour: 'Le système ne sait que ce qu’on lui dit.' },
    { id: 'img-abime', type: 'ouverture', de: 'samia', doc: 'dessin-abime', rubrique: 'image',
      enonce: 'Ce carton est…', aide: 'Regarde le coin en bas à droite, et le ruban.',
      choix: [{ v: 'abime', lib: 'abîmé' }, { v: 'normal', lib: 'normal' }, { v: 'fragile', lib: 'fragile' }],
      juste: 'abime', retour: 'Coin enfoncé, ruban déchiré : il est abîmé.' },
    { id: 'img-vide', type: 'ouverture', de: 'samia', doc: 'dessin-vide', rubrique: 'image',
      enonce: 'Cet emplacement de picking est…', aide: 'Regarde le sol, sous la lisse.',
      choix: [{ v: 'vide', lib: 'vide' }, { v: 'plein', lib: 'plein' }, { v: 'reserve', lib: 'en réserve' }],
      juste: 'vide', retour: 'Rien au sol : l’emplacement est vide. On le dit au terminal.' },
    // ── au fil du travail (brief §4 bis)
    { id: 'q-abime', type: 'fil', de: 'samia', quand: unDe(apresGeste(GESTE('mot:abime')), apresGeste(GESTE('abime'))), poids: 1, groupe: GROUPE, apres: 'bilan',
      enonce: 'Pourquoi ne pas envoyer un carton abîmé au magasin ?',
      choix: [{ v: 'vendre', lib: 'le magasin ne pourra pas le vendre : il sera refusé ou jeté' }, { v: 'repare', lib: 'le magasin le répare' },
        { v: 'personne', lib: 'personne ne le verra' }],
      juste: 'vendre', retour: 'Un carton abîmé envoyé, c’est un retour, un camion et de l’argent perdus.' },
    { id: 'q-vide', type: 'fil', de: 'samia', quand: unDe(apresGeste(GESTE('mot:vide')), apresGeste(GESTE('vide'))), poids: 0.75, groupe: GROUPE,
      enonce: 'Qui descend la palette de réserve ?',
      choix: [{ v: 'kevin', lib: 'Kevin, le cariste : il faut un chariot qui monte' }, { v: 'moi', lib: 'moi, avec le transpalette' }, { v: 'chauffeur', lib: 'le chauffeur' }],
      juste: 'kevin', retour: 'Toi, tu signales ; Kevin monte.' },
    { id: 'q-reappro', type: 'fil', de: 'samia', quand: apresGeste(GESTE('reserve')), poids: 0.75, groupe: GROUPE,
      enonce: 'Descendre la réserve dans le picking, ça s’appelle…',
      choix: [{ v: 'reappro', lib: 'réapprovisionner' }, { v: 'inventaire', lib: 'inventorier' }, { v: 'expedier', lib: 'expédier' }],
      juste: 'reappro', retour: 'Le picking ne doit jamais rester vide.' },
    { id: 'q-tomber', type: 'fil', de: 'samia', quand: apresFiche('stock-816'), poids: 1.5, groupe: GROUPE,
      enonce: 'Un carton t’échappe et se casse. Est-ce toi qui le paies ? (Lis « Le droit », joint au message de Samia.)',
      choix: [{ v: 'non', lib: 'non : l’employeur supporte ce risque, sauf faute très grave et volontaire' }, { v: 'paie', lib: 'oui, sur ma paie' },
        { v: 'moitie', lib: 'oui, la moitié' }],
      juste: 'non', retour: 'Tu dois faire attention, mais casser par accident n’est pas une faute. On le signale.' },
  ],
};
