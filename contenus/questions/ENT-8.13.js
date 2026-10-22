// Les questions d'ENT-8.13 — Action, la palette d'à côté (brief `docs/briefs/ENT-8.13-action-palette-a-cote.md` §4 bis et §4 ter, décidées par
// Tristan : « on garde tout »). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans `activites/FICHE-SEANCE.md`. Personnes
// CONSTRUITES : Samia (cheffe d'équipe, la tutrice), Kevin (cariste) — univers `contenus/action.js` ; Yanis (préparateur) — cette séance.
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia ») ; énoncés, choix et retours de Cowork, tels quels ; les gestes du brief sont
// REBRANCHÉS sur ceux que publie le mode palettier (lot 5 du chantier E-7, COORDINATION-palettier §3 n° 4) :
// - `q-rupture` (0,75, tout de suite) : « première ouverture d'emplacement au lendemain » → `…:ouvrir:lendemain` (le `ouvrir` du soir est déjà retenu).
// - `q-ou-chercher` (0,5, AU BILAN) : « palette trouvée » → `…:trouvee`.
// - `q-systeme` (0,75, tout de suite) : « premier scan du transfert (la palette) » → `…:transfert:scan`.
// - `q-terminal` (0,75, tout de suite) : « transfert fait » → `…:valider:lendemain` (« Valider mon transfert », le geste qui suit le transfert), et
//   PAS `…:transfert` : le transfert ouvre la fenêtre « Message du système », qui couvre le panneau de la question pendant que la question gèle
//   son bouton « Compris » (seul Échap en sort) — demande au moteur écrite dans le compte rendu du brief.
// - `q-a-qui` (0,5, AU BILAN) : « compte rendu envoyé » → `apresMail` vers Samia ; chemin « Kevin » (on a cherché P9) : la bonne réponse ajoute
//   « sans accuser » (`selon`).
// - `q-collegue` (0,75, tout de suite, éco-droit) : « fin » → `apresMail` vers Samia, juste après `q-a-qui` (« Valider mon transfert » porte déjà
//   `q-terminal`). Texte joint : C. trav. L4122-1 (document « Le droit », joint au message de Samia du matin) ; parenthèse « (Lis « Le droit »…) »
//   ajoutée par Claude Code, comme ENT-8.11.
// Une question qui n'arrive pas (palette jamais trouvée, aucun transfert) est rattrapée à la fin par le moteur.
//
// AVANT DE COMMENCER : banque de 9 notions NON notées, 4 tirées par élève (3 de préparation, 1 image) ; textes de Cowork, `aide` écrites par Claude
// Code (à relire). Images : dessins en traits de la séance (aucune image nouvelle, aucun visage).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent813-donnees.js`), jamais le contenu (`contenus/action-ent813.js` l'importe).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { paletteCherchee } from '../../core/types/entrepot.js';
import { ID, SAMIA_MAIL, GESTE, entrepotDe } from '../action-ent813-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = {
  samia: { nom: 'Samia', role: 'cheffe d’équipe (ta tutrice)', appel: 'Samia', registre: 'tu' },
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonsoir ! C’est ta fin de poste. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['poste', 'etiquette', 'allee-encombree', 'emplacement-vide'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-adresse-libre', 'k-transfert', 'k-rupture', 'k-rendre-compte', 'k-allee', 'k-scan-rappel', 'k-preparateur',
      'img-allee-encombree', 'img-emplacement-vide'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'k-adresse-libre', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'L’adresse donnée est prise. On…',
      aide: 'Clique sur les mots [[adresse libre]].',
      choix: [{ v: 'libre', lib: 'demande une adresse libre au terminal, on range là et on scanne' }, { v: 'cote', lib: 'pose à côté, on verra demain' },
        { v: 'allee', lib: 'laisse la palette dans l’allée' }],
      juste: 'libre',
      retour: 'Le terminal donne une adresse libre : tu ranges là et tu scannes. Le système sait où est la palette.' },
    { id: 'k-transfert', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Transférer une palette, c’est…',
      aide: 'Clique sur le mot [[transférer]].',
      choix: [{ v: 'adresse', lib: 'la changer d’adresse et le dire au système en scannant' }, { v: 'camion', lib: 'la charger dans un camion' },
        { v: 'etiquette', lib: 'changer son étiquette de produit' }],
      juste: 'adresse',
      retour: 'Transférer : la palette change de place, et le scan le dit au système.' },
    { id: 'k-rupture', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Une rupture en rayon, c’est…',
      aide: 'Clique sur le mot [[rupture]].',
      choix: [{ v: 'manque', lib: 'un produit qui manque dans le magasin' }, { v: 'cassee', lib: 'une palette cassée' },
        { v: 'rack', lib: 'un rayon de rack qui plie' }],
      juste: 'manque',
      retour: 'Une rupture, c’est un rayon vide au magasin : des clients repartent sans le produit.' },
    { id: 'k-rendre-compte', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Rendre compte, c’est…',
      aide: 'Clique sur les mots [[rendre compte]].',
      choix: [{ v: 'dire', lib: 'dire à son chef ce qu’on a fait et ce qui s’est passé' }, { v: 'roman', lib: 'écrire un roman' },
        { v: 'plainte', lib: 'se plaindre d’un collègue' }],
      juste: 'dire',
      retour: 'Rendre compte : les faits, à ton chef. Court et clair.' },
    { id: 'k-allee', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Une palette dans l’allée de circulation, c’est…',
      aide: 'Pense aux chariots qui passent dans l’allée.',
      choix: [{ v: 'danger', lib: 'un danger : les chariots passent' }, { v: 'place', lib: 'une place de rangement en plus' },
        { v: 'normal', lib: 'normal le soir' }],
      juste: 'danger',
      retour: 'L’allée sert à circuler : une palette posée là, c’est un obstacle pour les chariots.' },
    { id: 'k-scan-rappel', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Sans scan, le système croit que la palette est…',
      aide: 'Clique sur le mot [[scanner]].',
      choix: [{ v: 'prevue', lib: 'là où il l’avait prévue' }, { v: 'posee', lib: 'là où tu l’as posée' }, { v: 'quai', lib: 'au quai' }],
      juste: 'prevue',
      retour: 'Sans scan, le système garde ce qu’il avait prévu : il ne sait pas où tu l’as posée.' },
    { id: 'k-preparateur', type: 'ouverture', de: 'samia', doc: 'poste', rubrique: 'preparation',
      enonce: 'Le préparateur, c’est…',
      aide: 'Clique sur le mot [[préparateur]].',
      choix: [{ v: 'prepare', lib: 'la personne qui prélève les produits pour les commandes des magasins' }, { v: 'chauffeur', lib: 'le chauffeur' },
        { v: 'comptable', lib: 'le comptable' }],
      juste: 'prepare',
      retour: 'Le préparateur prend les produits dans les emplacements pour préparer les commandes. Demain, c’est Yanis.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'img-allee-encombree', type: 'ouverture', de: 'samia', doc: 'allee-encombree', rubrique: 'image',
      enonce: 'Sur ce dessin, qu’est-ce qui ne va pas ?',
      aide: 'Regarde le milieu de l’allée.',
      choix: [{ v: 'allee', lib: 'une palette laissée dans l’allée' }, { v: 'rien', lib: 'rien' }, { v: 'haut', lib: 'le rack est trop haut' }],
      juste: 'allee',
      retour: 'Une palette laissée dans l’allée : elle gêne les chariots, et le système ne sait pas qu’elle est là.' },
    { id: 'img-emplacement-vide', type: 'ouverture', de: 'samia', doc: 'emplacement-vide', rubrique: 'image',
      enonce: 'Cet emplacement est…',
      aide: 'Regarde au-dessus de l’étiquette.',
      choix: [{ v: 'vide', lib: 'vide' }, { v: 'plein', lib: 'plein' }, { v: 'hs', lib: 'hors service' }],
      juste: 'vide',
      retour: 'Vide : il n’y a rien au-dessus de l’étiquette.' },
    // ── au fil du travail (brief §4 bis ; une ligne au bandeau)
    { id: 'q-rupture', type: 'fil', de: 'samia', quand: apresGeste(GESTE('ouvrir:lendemain')), poids: 0.75, groupe: GROUPE,
      enonce: 'Si personne ne retrouve la palette, que se passe-t-il pour le magasin ?',
      choix: [{ v: 'ventes', lib: 'le produit manque en rayon : des ventes perdues' }, { v: 'stock', lib: 'rien, le magasin a du stock pour un an' },
        { v: 'ferme', lib: 'le magasin est fermé' }],
      juste: 'ventes',
      retour: 'Une palette perdue dans l’entrepôt, c’est un rayon vide au magasin.' },
    { id: 'q-ou-chercher', type: 'fil', de: 'samia', quand: apresGeste(GESTE('trouvee')), poids: 0.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'Où chercher en premier ?',
      choix: [{ v: 'autour', lib: 'autour de l’adresse : les emplacements voisins, la même allée' }, { v: 'hasard', lib: 'au hasard dans l’entrepôt' },
        { v: 'quai', lib: 'au quai' }],
      juste: 'autour',
      retour: 'Une palette posée « à côté » est presque toujours… à côté.' },
    { id: 'q-systeme', type: 'fil', de: 'samia', quand: apresGeste(GESTE('transfert:scan')), poids: 0.75, groupe: GROUPE,
      enonce: 'Pourquoi le système ne retrouve-t-il pas la palette tout seul ?',
      choix: [{ v: 'scan', lib: 'il ne sait que ce qu’on a scanné' }, { v: 'panne', lib: 'il est en panne' }, { v: 'efface', lib: 'Kevin l’a effacée' }],
      juste: 'scan',
      retour: 'Le système croit ce qu’on lui dit : pas de scan, pas d’information.' },
    { id: 'q-terminal', type: 'fil', de: 'samia', quand: apresGeste(GESTE('valider:lendemain')), poids: 0.75, groupe: GROUPE,
      enonce: 'Qu’as-tu fait au terminal, et pourquoi ?',
      choix: [{ v: 'transfert', lib: 'transféré la palette à sa bonne adresse et scanné : maintenant, le système sait où elle est' },
        { v: 'rien', lib: 'rien : Yanis la trouvera' }, { v: 'etiquette', lib: 'imprimé une nouvelle étiquette' }],
      juste: 'transfert',
      retour: 'Le transfert remet le système d’accord avec le rack.' },
    { id: 'q-a-qui', type: 'fil', de: 'samia', quand: apresMail({ a: SAMIA_MAIL }), poids: 0.5, groupe: GROUPE, apres: 'bilan',
      enonce: 'À qui le dis-tu, et comment ?',
      // Chemin « Kevin » (on a cherché la palette de Kevin) : la bonne réponse ajoute « sans accuser » (brief §4 bis).
      selon: (db) => {
        const c = paletteCherchee(db, entrepotDe);
        return c && c.id !== 'P3' ? { enonce: 'À qui le dis-tu, et comment ?', libs: { cheffe: 'à la cheffe d’équipe, en disant les faits, sans accuser' } }
          : { enonce: 'À qui le dis-tu, et comment ?' };
      },
      choix: [{ v: 'cheffe', lib: 'à la cheffe d’équipe, en disant les faits' }, { v: 'tous', lib: 'à tout le monde, en nommant le coupable' },
        { v: 'personne', lib: 'à personne' }],
      juste: 'cheffe',
      retour: 'Les faits, à la cheffe. Chercher un coupable ne retrouve pas la palette.' },
    { id: 'q-collegue', type: 'fil', de: 'samia', quand: apresMail({ a: SAMIA_MAIL }), poids: 0.75, groupe: GROUPE,
      enonce: 'Kevin t’a dit de ranger sans scanner. Dois-tu faire tout ce qu’un collègue te demande ? (Lis « Le droit », joint au message de Samia ce matin.)',
      choix: [{ v: 'non', lib: 'non : on suit les consignes de l’employeur, données par le chef ; une procédure ne se saute pas parce qu’un collègue le dit' },
        { v: 'anciennete', lib: 'oui, il a plus d’ancienneté' }, { v: 'presse', lib: 'oui, s’il est pressé' }],
      juste: 'non',
      retour: 'Les consignes viennent de l’employeur. Un collègue pressé ne les change pas.' },
  ],
};
