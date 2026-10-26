// Corrigé d'ENT-11.7 (Mondial Relay, évaluation « la lampe d'Inès »), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON cas (`contenus/mondial-relay-ent117-donnees.js`) : un parmi quatre (a refusé sans assurance · b refusé avec assurance ·
// c retiré · d hors délai), le prix de la lampe, le jour de livraison et le nombre de jours écoulés. `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa base (jamais recopié). N'importe que les données pures : se charge
// aussi sous Node. Les 4 questions d'« Avant de commencer » tirées et leurs réponses se lisent dans le Suivi.

import {
  ID, TIRAGE, CAS, CONCLUSIONS, DECISIONS, MONTANTS, INDEMNITE_DE_BASE, NUMERO_COLIS, situationDe, libDate, rangDecision, rangMontant,
} from '../mondial-relay-ent117-donnees.js';
import { graineDeBase } from '../../core/tirage.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const QUI = { a: 'a. colis refusé, dans les 72 h, sans assurance', b: 'b. colis refusé, dans les 72 h, avec assurance en option', c: 'c. colis retiré, puis réclamation',
  d: 'd. colis refusé, mais réclamation au 5e jour (ou au 6e)' };

export const CORRIGE = {
  code: 'ENT-11.7',
  titre: 'Mondial Relay — évaluation : la lampe d’Inès',
  trame: '(pas de trame : évaluation, tout se fait à l’écran ; le corrigé de chaque élève est dans cet onglet)',
  items: [
    { etape: 1, etapeTitre: 'L’appel (3 points + le ton)', genre: 'question', texte: 'Ce qu’il faut dire à Inès',
      rep: 'Se présenter poliment · demander le numéro de colis (pas de promesse, pas de tutoiement) · reformuler la situation avec le bon fait (colis refusé ou colis retiré) '
        + '· ne rien promettre : « je vérifie les dates et nos conditions de vente, puis je vous réponds par écrit ».',
      note: 'La première réponse à chaque réplique compte ; aucune réaction d’Inès. Écoute 3 points (1 par réplique juste : numéro, reformulation, aucune promesse). '
        + 'Une réplique familière ou agressive fait perdre le point du ton (1 point sur 20, avec le courriel).' },
    { etape: 2, etapeTitre: 'La règle (7 points)', genre: 'question', texte: 'Les quatre cas possibles',
      rep: Object.keys(CAS).map((c) => { const S = situationDe({ tirages: { [ID]: { pieces: { cas: [`cas-${c}`] }, valeurs: { prix: 60, jour: '2026-11-17', retard: 1, tard: 5 } } } });
        return `${QUI[c]} → « ${lib(CONCLUSIONS, S.conclusion)} », montant ${S.montant === 0 ? '0 €' : c === 'b' ? 'la valeur déclarée à l’assurance (celle du suivi)' : `${INDEMNITE_DE_BASE} €`}`; }).join(' · '),
      note: 'Recevable ou non, et pourquoi : 4 points. Le montant : 3 points, compté seulement si la conclusion est juste aussi (un « 0 » deviné ne rapporte rien). '
        + 'Articles 11 et 12 des conditions de vente (offre Start, 07/01/2026) : 72 heures, colis refusé au Point Relais, 25 € au plus par colis, frais d’envoi non remboursés, assurance en option jusqu’à 500 €.' },
    { etape: 3, etapeTitre: 'Le dossier (3 points)', genre: 'question', texte: 'Ce qu’il faut enregistrer',
      rep: `Numéro de colis ${NUMERO_COLIS} · date de livraison au Point Relais (la date du suivi de l’élève) · nature du dommage : colis abîmé · suite : acceptée (cas a, b) ou refusée (cas c, d).`,
      note: 'Colis et date 1,5 point · nature du dommage et suite 1,5 point. Le numéro de colis est lu sur ses seuls chiffres (« MR 4417 2184 », « MR44172184 »).' },
    { etape: 4, etapeTitre: 'Le courriel à Inès (2 points + le ton)', genre: 'question', texte: 'Les phrases justes',
      rep: 'Salutation « Bonjour Madame Garnier, » · la décision de SON cas · le montant de SON cas · le rappel de la règle (72 heures, colis refusé au Point Relais) · fin « Cordialement, … ».',
      note: 'Décision 0,75 · montant 0,75 · rappel de la règle 0,5 ; la salutation et la fin font partie du ton (1 point). Aucun délai de versement n’est écrit : il n’est pas vérifié.' },
    { etape: 5, etapeTitre: 'Avant de commencer (4 points)', genre: 'question', texte: 'Quatre questions tirées (2 de préparation, 2 de droit), sans aide',
      rep: 'Juste +1, « Je ne sais pas » 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0. Le détail se lit dans le Suivi.',
      note: 'Questions clés reprises d’ENT-6.2 : qui est le client (« vous »), l’article 1113 du Code civil (offre + acceptation). Trois réflexions non notées sont posées au fil du travail.' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  const graine = graineDeBase(db) || String(uid || 'anonyme');
  if (!ouvert) db = { tirage: { graine }, tirages: { [ID]: { graine: `${graine}|${ID}`, ...TIRAGE.tirer(`${graine}|${ID}`) } } };
  const S = situationDe(db);
  const montants = MONTANTS(S);
  const items = [
    { genre: 'fait', texte: 'Son cas', rep: QUI[S.cas] },
    { genre: 'fait', texte: 'Le prix de la lampe, les dates', rep: `${S.prix} € · livré au Point Relais le ${libDate(S.jour)} · appel le ${libDate(S.aujourdhui)} (${S.jours} jour${S.jours > 1 ? 's' : ''} après)${S.assure ? ` · valeur déclarée à l’assurance : ${S.valeur} €` : ''}` },
    { genre: 'fait', texte: 'La règle', rep: lib(CONCLUSIONS, S.conclusion) },
    { genre: 'fait', texte: 'Le montant à écrire', rep: `${S.montant} €` },
    { genre: 'fait', texte: 'Le dossier', rep: `colis ${NUMERO_COLIS} · livraison le ${libDate(S.jour)} (${S.jour}) · colis abîmé · ${S.decision === 'acceptee' ? 'réclamation acceptée' : 'réclamation refusée'}` },
    { genre: 'fait', texte: 'Ses phrases justes du courriel', rep: `${DECISIONS[rangDecision(S)].phrase} · ${montants[rangMontant(S)].phrase}` },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
