// Yves Rocher — ce que partagent les fichiers de séance ENT-23.x : les deux univers passés à la fabrique (Soizic pour la préparation, Inès pour la
// relation avec les boutiques) et les lignes de politesse des comptes rendus et des réponses aux boutiques.
import { TUTEUR_PREPA, TUTEUR_BOUTIQUES, MENTION, STYLE, EQUIPE } from './yves-rocher.js';
export const U_PREPA = { tuteur: TUTEUR_PREPA, MENTION, STYLE, EQUIPE };
export const U_BOUTIQUES = { tuteur: TUTEUR_BOUTIQUES, MENTION, STYLE, EQUIPE };
export const SALUT = (a) => ({ id: 'salutation', choix: [`Bonjour ${a},`, `Salut ${a} !`, 'Coucou,'], juste: 0 });
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });
// Une réponse à une boutique : on vouvoie.
export const SALUT_BOUTIQUE = { id: 'salutation', choix: ['Bonjour Madame,', 'Salut !', 'Coucou,'], juste: 0 };
export const FIN_BOUTIQUE = (prenom) => ({ id: 'fin', choix: [`Cordialement, ${prenom}, pour le service relation boutiques`, 'Bisous', 'À plus !'], juste: 0 });
