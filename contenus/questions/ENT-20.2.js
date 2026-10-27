// Les questions d'ENT-20.2 — Leroy Merlin (1re, entraînement C1.2). Décidées par Claude (délégation de Tristan du 26/10/2026). 3 notées au fil (part 4),
// dont une d'éco-droit, et une réflexion. « Avant de commencer » : non noté.
import { apresFiche, apresMail } from '../../core/declencheurs.js';
import { BANQUE_SECU, OUVERTURE_SECU, PERSONNES, MAIL_SAMIR } from '../leroy-merlin.js';

export const QUESTIONS = {
  id: 'leroy-merlin-quai',
  part: 4,
  personnes: PERSONNES,
  ouverture: OUVERTURE_SECU(),
  liste: [
    ...BANQUE_SECU,
    { id: 'protocole', type: 'fil', de: 'samir', groupe: 'Le protocole', quand: apresFiche('f202-quai'),
      enonce: 'Le protocole de sécurité est un document écrit entre…',
      choix: [{ v: 'deux', lib: 'la plateforme (l’entreprise d’accueil) et le transporteur' }, { v: 'client', lib: 'le client et le magasin' }, { v: 'chauffeur', lib: 'le chauffeur et sa famille' }],
      juste: 'deux', retour: 'Le Code du travail l’impose pour le chargement et le déchargement (R4515-4).' },
    { id: 'cle', type: 'fil', de: 'samir', groupe: 'Le protocole', quand: apresFiche('f202-quai'),
      enonce: 'Pourquoi la clé du camion est-elle remise au quai ?',
      choix: [{ v: 'depart', lib: 'Pour que le camion ne parte pas pendant que le cariste est dans la remorque' }, { v: 'vol', lib: 'Pour éviter un vol' }, { v: 'pause', lib: 'Pour que le chauffeur prenne sa pause' }],
      juste: 'depart', retour: 'Un camion qui démarre trop tôt fait tomber le chariot du quai : c’est un accident grave.' },
    { id: 'tf-sens', type: 'fil', de: 'samir', groupe: 'Les accidents', quand: apresFiche('f202-taux'),
      enonce: 'Le taux de fréquence permet de…',
      choix: [{ v: 'comparer', lib: 'comparer des équipes de tailles différentes, à heures de travail égales' }, { v: 'jours', lib: 'compter les jours d’arrêt' }, { v: 'cout', lib: 'calculer le coût des accidents' }],
      juste: 'comparer', retour: 'On ramène le nombre d’accidents à un million d’heures : une grande et une petite équipe deviennent comparables.' },
    { id: 'presser', type: 'fil', de: 'samir', reflexion: true, quand: apresMail({ a: MAIL_SAMIR }),
      enonce: 'Le chauffeur est pressé et veut rester dans sa cabine. Que lui dis-tu ?',
      choix: [{ v: 'protocole', lib: 'Que le protocole s’applique à tous, et que c’est pour sa sécurité aussi' }, { v: 'ok', lib: 'D’accord, pour une fois' }, { v: 'rien', lib: 'Rien, je préviens Samir' }],
      retour: 'Rappeler la règle avec calme, et prévenir le chef d’équipe si le chauffeur refuse : les deux sont justes.' },
  ],
};
