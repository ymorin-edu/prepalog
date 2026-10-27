// Amazon — ce que partagent les fichiers de séance ENT-19.x : l'univers passé à la fabrique, et les lignes de politesse des comptes rendus.
import { TUTEUR, MENTION, STYLE, EQUIPE } from './amazon.js';
export const U = { tuteur: TUTEUR, MENTION, STYLE, EQUIPE };
export const SALUT = { id: 'salutation', choix: ['Bonjour Karima,', 'Wesh Karima !', 'Yo,'], juste: 0 };
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });
