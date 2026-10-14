// Corrigé d'ENT-7.2 (Decathlon, passer la commande), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/decathlon-ent72-donnees.js`) : son numéro de conteneur (chiffre de contrôle calculé), son scellé,
// son poids brut, sa référence, ses deux instructions fausses (et, pour un confirmé, une de plus). `CORRIGE` donne ce qui est commun ;
// `corrigeEleve(base, uid)` rend le corrigé d'un élève, calculé depuis sa base (jamais recopié).

import { ID, TIRAGE, LIMITE, PRESTAS, TYPES, LIEUX_ENL, LIEUX_LIV, BONNES, INSTRUCTIONS_JUSTES, OT, ARRIVEE, jeuEleve } from '../decathlon-ent72-donnees.js';
import { quand, kg } from '../decathlon.js';

const lib = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;

export const CORRIGE = {
  code: 'ENT-7.2',
  titre: 'Decathlon — passer la commande',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame courte de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'L’ordre de transport', genre: 'tableau', texte: 'Ce qui est le même pour tous',
      entetes: ['Case', 'Réponse attendue'],
      reponses: [['Transporteur', lib(PRESTAS, BONNES.presta)], ['Type', lib(TYPES, BONNES.type)], ['Lieu d’enlèvement', lib(LIEUX_ENL, BONNES.enl)],
        ['Lieu de livraison', lib(LIEUX_LIV, BONNES.liv)], ['Arrivée au plus tard', quand(LIMITE.iso, LIMITE.h, { long: true })],
        ['Instructions justes', INSTRUCTIONS_JUSTES.map((x) => x.lib).join(' · ')]],
      note: 'Pièges : le chiffre de contrôle oublié ou deux chiffres inversés ; 40 pieds au lieu de 40’ HC ; Bruay en enlèvement ; Dourges en livraison ; la date de mise à disposition recopiée en limite ; une instruction fausse cochée.' },
    { etape: 2, etapeTitre: 'Le courriel, l’appel, le créneau', genre: 'question', texte: 'La méthode',
      rep: `Courriel à Contargo avec l’ordre en pièce jointe (vouvoiement, formule d’appel, objet qui nomme le conteneur ou l’ordre, signature). Appel au chef de quai (tu poli) : `
        + `se présenter, donner le n° de l’avis et l’ordre ${OT}, dire l’arrivée (${quand(ARRIVEE.iso, ARRIVEE.h, { long: true })}, en camion depuis le terminal de Bruay). `
        + 'Planning : Quai 6 à 09:30 (les autres quais sont pris ou font attendre plus d’une heure).',
      note: 'Le chef de quai lit l’avis du terminal, pas l’ordre de l’élève : un numéro faux dans l’ordre ne coûte que le jalon 1. Un mauvais numéro de téléphone avant le quai compte comme une reprise.' },
    { etape: 3, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: '10 jalons pondérés et 3 questions notées, total 20 : ordre de transport 10 (n° de conteneur 3 ; scellé, poids et type, transporteur et enlèvement, livraison et limite '
        + '1,5 chacun ; instructions 1), courriel 4 (destinataire et pièce jointe 3 ; forme 1), appel au quai 3 (appel 1,5 ; créneau 1,5), questions de Claire 3 (1 chacune). '
        + 'Rien n’est vrai avant l’enregistrement de l’ordre, l’envoi du courriel, la fin de l’appel ou l’envoi du planning : inaction 0.',
      note: 'Poids validés par Tristan le 14/10/2026. Confirmé : une instruction fausse de plus (« hayon élévateur »), +0,5 si elle n’est pas cochée (caché à l’élève).' },
  ],
};

export function corrigeEleve(base, uid) {
  let db = base || {};
  const ouvert = !!TIRAGE.tirage(db);
  if (!ouvert) db = { tirages: { [ID]: { graine: `${uid || 'anonyme'}|${ID}`, ...TIRAGE.tirer(`${uid || 'anonyme'}|${ID}`) } } };
  const J = jeuEleve(db);
  const items = [
    { genre: 'fait', texte: 'Son conteneur (sur l’avis)', rep: `${J.conteneur} · scellé ${J.scelle} · poids brut ${kg(J.poids)} · référence ${J.reference}` },
    { genre: 'fait', texte: 'À écrire dans l’ordre de transport', rep: `n° de conteneur ${J.conteneur} (espaces ignorés) · scellé ${J.scelle} · poids ${J.poids} kg · type 40’ HC` },
    { genre: 'fait', texte: 'Le numéro « piège » de l’appel (deux chiffres inversés)', rep: J.piege },
    { genre: 'fait', texte: 'Ses instructions', rep: J.instructions.filter((x) => !x.bonus).map((x) => `${x.juste ? 'à cocher' : 'À NE PAS cocher'} : ${x.lib}`).join(' | ') },
  ];
  J.instructions.filter((x) => x.bonus).forEach((x) => items.push({ genre: 'fait', bonus: true, texte: 'Instruction en plus (confirmé)', rep: `À NE PAS cocher : ${x.lib}` }));
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra en niveau standard (un confirmé reçoit en plus une instruction fausse).', items };
  return { texte: '', items };
}
