// Questions d'ENT-11.3 — Mondial Relay, évaluation « la ligne de tri » (2de, évaluation). Brief `docs/briefs/ENT-11.3-mondial-relay-evaluation-tri.md`,
// §4, §4 bis et §5 ; choix de Tristan du 26/10/2026 (tous acceptés). Modifier ce fichier suffit : voir « Modifier les questions d'une séance »
// dans `activites/FICHE-SEANCE.md`.
//
// ÉVALUATION. Deux sortes de questions notées :
//  - « Avant de commencer » (`ouverture.part: 4`) : 9 questions clés en banque, l'élève en reçoit 4 tirées (`tirage: { tri: 2, securite: 2 }`) :
//    * « tri » (4) : les trois questions ★ d'ENT-11.2 (l'étiquette, les 32 kg, la somme des côtés) et la question du code postal (reprise du
//      piège de Bar-sur-Aube, noté en réflexion en 11.2) ;
//    * « sécurité » (5) : trois questions de sécurité au quai reprises d'ENT-6.4 (avant d'entrer dans la remorque, le protocole, le droit de
//      retrait), une sur la cale (nouvelle, la définition vient du lexique d'ENT-8.7) et celle du tapis bloqué d'ENT-11.2.
//    Aucune aide, aucun mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ (mauvaises
//    réponses), plancher 0. Les documents sont à gauche : « Ton poste », l'étiquette, les règles (d'ENT-11.2) et « Le droit : sécurité » (ci-dessous).
//  - Trois questions AU FIL (`part: 1`, poids égaux : un tiers de point chacune), toutes corrigées au bilan seulement (« Merci, je note »).
//    * `ecart-devenir` : au premier colis qui quitte le tapis alors qu'il devait être mis à l'écart (geste `ecart`, posé sur le premier colis
//      à écarter de la série de l'élève) ; la question ne dit pas pourquoi ni lequel ;
//    * `mauvaise-sortie` : à la fin de la série ;
//    * `travail-nuit` : l'éco-droit appliqué à un horaire TIRÉ par élève (de 21, 22 ou 23 h à 5 ou 6 h), le texte de l'article L3122-2 cité dans
//      l'énoncé (la vue du quai n'a pas de volet « documents »). Même bonne réponse pour tous, seuls les chiffres changent ; posée au clic
//      « C'est bon, on peut décharger » du quai (geste `scene:<quai>:decharger`).
//
// VÉRIFIÉ : Code du travail, art. L3122-2 (relevé le 26/10/2026 pour ENT-11.2) ; art. R4515-4 et L4131-1 (textes repris d'ENT-6.4, relus par Cowork
// sur code.travail.gouv.fr le 10/10/2026 : **à relire sur Légifrance avant ouverture aux élèves**, comme en 6.4).
// CONSTRUIT : Romain, le quai, tous les énoncés et les choix.

import { apresGeste } from '../../core/declencheurs.js';
import { graineDeBase, hasard } from '../../core/tirage.js';
import { EQUIPE as EQUIPE_MR } from '../mondial-relay.js';

export const ID = 'mondial-relay-evaluation-tri';
export const ID_TRI = 'mr-tri-113';
export const QUAI_ID = 'mr-quai-113';
const GROUPES = {
  ecart: 'Ce que devient un colis écarté',
  sortie: 'Un colis dans la mauvaise sortie',
  nuit: 'Le travail de nuit',
};

// L'horaire de nuit de l'élève, tiré de sa graine : de 21, 22 ou 23 h à 5 ou 6 h (toujours du travail de nuit).
export function horaireDe(graine) {
  const h = hasard(`${graine == null ? '' : graine}|${ID}|nuit`);
  return { debut: h.choisir([21, 22, 23]), fin: h.choisir([5, 6]) };
}
const L3122_2 = '« Tout travail effectué au cours d’une période d’au moins neuf heures consécutives comprenant l’intervalle entre minuit et 5 heures est '
  + 'considéré comme du travail de nuit. La période de travail de nuit commence au plus tôt à 21 heures et s’achève au plus tard à 7 heures. »';

const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'romain', doc, rubrique, enonce, choix, juste, retour });

export const QUESTIONS = {
  id: ID,
  part: 1,
  personnes: { romain: { nom: EQUIPE_MR.romain.prenom, role: EQUIPE_MR.romain.poste, appel: 'Romain' } },
  ouverture: { id: 'avant-de-commencer', de: 'romain', part: 4, titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Salut ! Ce soir, tu tiens la ligne seul. Avant de commencer, réponds à mes questions, sans aide. Les documents sont à gauche.',
    documents: ['poste-112', 'etiquette-112', 'regles-112', 'droit-securite-113'],
    tirage: { tri: 2, securite: 2 },
    questions: ['etiquette-tournee', 'colis-32kg', 'somme-cotes', 'code-postal', 'avant-d-entrer', 'protocole', 'droit-retrait', 'cale-roue', 'tapis-bloque'] },
  liste: [
    // ── le tri (4 : l'élève en reçoit 2)
    q('etiquette-tournee', 'tri', 'etiquette-112', 'Sur l’étiquette, qu’est-ce qui décide de la tournée du colis ?',
      [{ v: 'commune', lib: 'La commune et son code postal' }, { v: 'numero', lib: 'Le numéro du colis' }, { v: 'commerce', lib: 'Le nom du commerce' }],
      'commune', 'La commune et son code postal. Le plan de tri dit dans quelle tournée elle est.'),
    q('colis-32kg', 'tri', 'regles-112', 'Un colis pèse 32 kg. Que devient-il ?',
      [{ v: 'non', lib: 'Il ne part pas en Point Relais : on le met à l’écart' }, { v: 'locker', lib: 'Il part en locker' },
        { v: 'emballe', lib: 'Il part s’il est bien emballé' }],
      'non', 'Plus de 30 kg : il ne part pas en Point Relais. On le met à l’écart.'),
    q('somme-cotes', 'tri', 'regles-112', 'Un colis mesure 60 cm, 50 cm et 45 cm. Peut-il partir ?',
      [{ v: 'non', lib: 'Non : 60 + 50 + 45 = 155 cm, plus de 150 cm' }, { v: 'oui', lib: 'Oui : aucun côté ne dépasse 120 cm' },
        { v: 'oui-60', lib: 'Oui : son plus grand côté fait 60 cm' }],
      'non', 'Deux règles de taille : pas plus de 120 cm de long, ET pas plus de 150 cm en tout. Ici, 155 cm : à l’écart.'),
    q('code-postal', 'tri', 'etiquette-112', 'Bar-sur-Aube et Bar-sur-Seine ont presque le même nom. Qu’est-ce qui permet de ne pas se tromper de sortie ?',
      [{ v: 'cp', lib: 'Le code postal' }, { v: 'couleur', lib: 'La couleur de l’étiquette' }, { v: 'commerce', lib: 'Le nom du commerce' }],
      'cp', 'Le code postal : 10200, c’est Bar-sur-Aube (tournée Est) ; 10110, Bar-sur-Seine (tournée Sud). Quand deux noms se ressemblent, on lit le code.'),
    // ── la sécurité au quai et au poste (5 : l'élève en reçoit 2)
    q('avant-d-entrer', 'securite', 'poste-112', 'Avant d’entrer dans une remorque avec le chariot, qu’est-ce qui doit être vrai ?',
      [{ v: 'immobile', lib: 'Le camion ne peut plus bouger et le passage vers la remorque est sûr' },
        { v: 'chauffeur', lib: 'Le chauffeur nous dit que tout va bien' },
        { v: 'propre', lib: 'Le quai est propre et rangé' },
        { v: 'retard', lib: 'On a du retard, il faut aller vite' }],
      'immobile', 'Camion immobile, passage sûr : on vérifie les deux avant d’entrer, jamais pendant (reprise d’ENT-6.4).'),
    q('protocole', 'securite', 'droit-securite-113', 'Un transporteur vient décharger sur un site. Quel document écrit encadre la sécurité de ce déchargement ?',
      [{ v: 'protocole', lib: 'Le protocole de sécurité' }, { v: 'bl', lib: 'Le bon de livraison' }, { v: 'permis', lib: 'Le permis du chauffeur' }],
      'protocole', 'Le protocole dit qui fait quoi quand un camion est déchargé : il est écrit à l’avance (R4515-4 ; reprise d’ENT-6.4).'),
    q('droit-retrait', 'securite', 'droit-securite-113', 'Une lisse de rack est pliée et une palette penche au-dessus de l’allée. Que peux-tu faire ?',
      [{ v: 'alerter', lib: 'Alerter tout de suite mon responsable et me retirer de ce danger' }, { v: 'continuer', lib: 'Continuer : ce n’est pas mon rôle' },
        { v: 'redresser', lib: 'Redresser la lisse moi-même' }],
      'alerter', 'Alerter, c’est un devoir ; se retirer d’un danger grave et imminent, c’est un droit (L4131-1 ; reprise d’ENT-6.4).'),
    q('cale-roue', 'securite', 'poste-112', 'À quoi sert la cale posée contre la roue d’un camion à quai ?',
      [{ v: 'bloquer', lib: 'À empêcher le camion de bouger pendant qu’on décharge' }, { v: 'peser', lib: 'À peser le camion' },
        { v: 'roue', lib: 'À protéger le pneu de la pluie' }],
      'bloquer', 'Une cale, c’est un coin posé contre une roue : sans elle, le camion peut avancer pendant qu’un chariot entre dans la remorque.'),
    q('tapis-bloque', 'securite', 'poste-112', 'Un colis se coince sous le tapis, qui tourne. Que fais-tu ?',
      [{ v: 'arret', lib: 'J’appuie sur l’arrêt d’urgence et j’appelle Romain' }, { v: 'main', lib: 'Je passe la main dessous pour le dégager vite' },
        { v: 'laisse', lib: 'Je laisse : il finira bien par passer' }],
      'arret', 'Jamais la main sous un tapis en marche. On arrête la ligne, puis on dégage (reprise d’ENT-11.2).'),

    // ── au fil du travail (notées, corrigées au bilan seulement)
    { id: 'ecart-devenir', type: 'fil', de: 'romain', apres: 'bilan', quand: apresGeste(`tri:${ID_TRI}:ecart`),
      enonce: 'Un colis qui ne peut pas partir est mis à l’écart. Que devient-il maintenant ?',
      choix: [{ v: 'expertise', lib: 'Il part au poste d’expertise, qui décide de son sort' },
        { v: 'poubelle', lib: 'Il est jeté' },
        { v: 'demain', lib: 'Il repart demain tel quel, avec les autres' }],
      juste: 'expertise', groupe: GROUPES.ecart,
      retour: 'À l’écart, il ne part pas : l’expertise le regarde, le remballe ou prévient l’expéditeur. On ne le jette pas, on ne le laisse pas partir tel quel.' },
    { id: 'mauvaise-sortie', type: 'fil', de: 'romain', apres: 'bilan', quand: apresGeste(`tri:${ID_TRI}:s1:fini`),
      enonce: 'La série est finie. Tu t’aperçois qu’un colis est tombé dans la mauvaise sortie. Que fais-tu ?',
      choix: [{ v: 'prevenir', lib: 'Je préviens le chef d’équipe' },
        { v: 'laisser', lib: 'Je le laisse : c’est fini' },
        { v: 'reprendre', lib: 'Je le reprends plus tard, sans rien dire' }],
      juste: 'prevenir', groupe: GROUPES.sortie,
      retour: 'Un colis dans la mauvaise sortie finit dans le mauvais camion. On le dit tout de suite, pour qu’il soit repris avant le départ.' },
    { id: 'travail-nuit', type: 'fil', de: 'romain', apres: 'bilan', quand: apresGeste(`scene:${QUAI_ID}:decharger`),
      enonce: `Tu tries de ${horaireDe('').debut} h à ${horaireDe('').fin} h. Article L3122-2 du Code du travail : ${L3122_2} Est-ce du travail de nuit ?`,
      choix: [{ v: 'oui', lib: 'Oui : tes heures sont dans la période de nuit, qui va au plus de 21 h à 7 h' },
        { v: 'non-7h', lib: 'Non : il faudrait travailler jusqu’à 7 h' },
        { v: 'non-minuit', lib: 'Non : seul le travail après minuit compte' }],
      juste: 'oui', groupe: GROUPES.nuit,
      retour: 'Oui. La période de nuit dure au moins 9 heures, entre 21 h et 7 h, et comprend minuit - 5 h. Les heures de l’élève y sont.',
      selon: (db) => {
        const { debut, fin } = horaireDe(graineDeBase(db || {}) || '');
        return { enonce: `Tu tries de ${debut} h à ${fin} h. Article L3122-2 du Code du travail : ${L3122_2} Est-ce du travail de nuit ?`,
          libs: { oui: `Oui : de ${debut} h à ${fin} h, tu es dans la période de nuit, qui va au plus de 21 h à 7 h` },
          retour: `Oui. La période de nuit dure au moins 9 heures, entre 21 h et 7 h, et comprend minuit - 5 h. De ${debut} h à ${fin} h, tu y es.` };
      } },
  ],
};
