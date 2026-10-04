// Univers d'ESSAI des briques de la 2de (brief `docs/briefs/MOTEUR-2de-S1.md`) — 04/10/2026.
//
// La page `outils/essai-2de.html` et le bloc de tests `outils/test/smoby.mjs` montent le vrai moteur
// d'entreprise sur ce petit univers. Lot 2 : la réponse à Sophie par phrases à choisir (texte du brief
// ENT-5.1), la réponse de Sophie qui arrive après l'envoi (juste ou faux), et un jalon qui lit les
// choix (`phrasesJustes`). Les lots suivants (mots cliquables, quai sans froid, sécurité, indicateurs)
// viendront s'y ajouter.
//
// Les personnes (Sophie Martin, les candidats) sont CONSTRUITES, comme dans le brief de la séance.

import { catalogueSimple } from '../contenus/entreprise-commun.js';
import { apresMail } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';

export const MENTION = 'Page d’essai des briques de la 2de. <b>Construit</b> : Sophie Martin, les candidats et '
  + 'leurs situations (personnes fictives, comme dans le brief ENT-5.1).';

export const SOPHIE = 'sophie.martin@smoby-essai.example';
export const CANDIDATS = ['Yanis Morel', 'Léa Garnier', 'Hugo Petit', 'Inès Benali', 'Tom Leroy'];

// La réponse à Sophie (brief ENT-5.1, étape 6). `juste` = rang dans l'ordre déclaré ci-dessous.
export const PHRASES_SOPHIE = {
  id: 'reponse-sophie',
  lignes: [
    { id: 'salut', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
    // Calculée (essai d'une valeur tirée de la base) : le candidat retenu est le premier de la liste.
    { id: 'choix', choix: () => CANDIDATS.map((c) => `Je retiens la candidature de ${c}`), juste: () => 0 },
    { id: 'raison', choix: [
      'car il a le CACES 3 valide, il est disponible le 9 décembre et il accepte un CDD.',
      'car il habite le plus près.',
      'car il a le CACES.'], juste: 0 },
    { id: 'contrat', choix: ['Je propose un CDD saisonnier.', 'Je propose un CDI.'], juste: 0 },
    { id: 'fin', choix: ['Pouvez-vous valider ? Cordialement,', 'Merci de valider vite', 'Bisous'], juste: 0 },
  ],
  melanger: true,
};

function voletEssai() {
  return {
    id: 'essai-2de',
    semer: (prenom) => ({
      mails: [{
        folder: 'in', ts: Date.now(), from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
        subject: 'Le cariste pour le pic de Noël', kind: 'text',
        text: `Bonjour ${prenom},\n\nTu as trié les candidatures. Réponds-moi : qui retiens-tu, pourquoi, et quel contrat ?\n\nSophie`,
        phrases: PHRASES_SOPHIE,
      }],
    }),
    declencheurs: [{
      id: 'reponse',
      quand: apresMail({ a: SOPHIE }),
      semer: (prenom) => ({
        mails: [{
          folder: 'in', ts: Date.now() + 1000, from: 'Sophie Martin', fromMail: SOPHIE, to: prenom,
          subject: 'RE : Le cariste pour le pic de Noël', kind: 'text',
          text: 'Merci ! La direction valide. Il arrive le mercredi 9 décembre : on prépare son arrivée la prochaine fois.',
        }],
      }),
    }],
  };
}

export const ETAPES = [{
  id: 'message',
  titre: 'Message à Sophie juste',
  verifier(db) {
    const r = phrasesJustes(db, PHRASES_SOPHIE.id);
    if (!r.envoye) return { status: 'attente' };
    return r.faux.length ? { status: 'ko', detail: `Lignes fausses : ${r.faux.join(', ')}.` } : { status: 'ok' };
  },
}];

export function univers({ temps = 'guidage' } = {}) {
  return {
    ENTREPRISE: { id: 'essai-2de', nom: 'Smoby — essai 2de', sousTitre: 'Plateforme de Moirans-en-Montagne (39)', exercice: 'Essai des briques de la 2de' },
    VOCAB: { unit: 'unité', unitPl: 'unités', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'smoby-essai.example' },
    CATALOGUE: catalogueSimple([{ ref: 'ESSAI', designation: 'Article d’essai' }]),
    SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [],
      customers: [], suppliers: [], seq: 1, _depart: [] }),
    etapes: ETAPES, exercice: 'Essai des briques de la 2de',
    volet: voletEssai(),
    copie: temps === 'evaluation', sansTrame: "Tout à l'écran",
  };
}
