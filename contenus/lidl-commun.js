// Lidl — ce que partagent les fichiers de séance ENT-21.x : les trois univers passés à la fabrique (Fatou pour la réception, Mehdi pour le
// transport, Claire pour la comptabilité) et les lignes de politesse des comptes rendus.
import { TUTEUR_RECEPTION, TUTEUR_TRANSPORT, TUTEUR_COMPTA, MENTION, STYLE, EQUIPE } from './lidl.js';
export const U_RECEPTION = { tuteur: TUTEUR_RECEPTION, MENTION, STYLE, EQUIPE };
export const U_TRANSPORT = { tuteur: TUTEUR_TRANSPORT, MENTION, STYLE, EQUIPE };
export const U_COMPTA = { tuteur: TUTEUR_COMPTA, MENTION, STYLE, EQUIPE };
export const SALUT = (a) => ({ id: 'salutation', choix: [`Bonjour ${a},`, `Salut ${a} !`, 'Coucou,'], juste: 0 });
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });
