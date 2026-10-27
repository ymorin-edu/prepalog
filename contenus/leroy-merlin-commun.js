// Leroy Merlin — ce que partagent les fichiers de séance ENT-20.x : les deux univers passés à la fabrique (Samir pour la sécurité, Nadia pour
// les clients) et les lignes de politesse des comptes rendus.
import { TUTEUR_SECU, TUTEUR_CLIENTS, MENTION, STYLE, EQUIPE } from './leroy-merlin.js';
export const U_SECU = { tuteur: TUTEUR_SECU, MENTION, STYLE, EQUIPE };
export const U_CLIENTS = { tuteur: TUTEUR_CLIENTS, MENTION, STYLE, EQUIPE };
export const SALUT = (a) => ({ id: 'salutation', choix: [`Bonjour ${a},`, `Salut ${a} !`, 'Coucou,'], juste: 0 });
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });
