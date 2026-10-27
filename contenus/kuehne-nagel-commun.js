// Kuehne+Nagel — ce que partagent les fichiers de séance ENT-24.x : l'univers passé à la fabrique, et les lignes de politesse des comptes rendus.
import { TUTEUR, MENTION, STYLE, EQUIPE } from './kuehne-nagel.js';
export const U = { tuteur: TUTEUR, MENTION, STYLE, EQUIPE };
export const SALUT = { id: 'salutation', choix: ['Bonjour Sophie,', 'Wesh Sophie !', 'Yo,'], juste: 0 };
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });
