// Corrigé d'ENT-10.3 (Transports Pelleau, on commence quand même ?), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON tirage (`contenus/pelleau-ent103-donnees.js`) : la variante (« le site n'est pas fini » ou « l'engin n'a pas été contrôlé ») et son
// défaut, tirés sur sa graine. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un élève, CALCULÉ depuis sa graine (jamais
// recopié). N'importe que les données pures : se charge aussi sous Node.

import { D, jeuDe, choixSignalement, phrasesCompteRendu } from '../pelleau-ent103-donnees.js';
import { graineDeBase } from '../../core/tirage.js';

const VARIANTES = { S: 'Le site n’est pas fini', E: 'L’engin n’a pas été contrôlé' };
const libChoix = (L, v) => (L.find((x) => x.v === v) || {}).lib || v;
const phrasesDe = (jeu) => {
  const P = phrasesCompteRendu('(prénom)', { tirage: { graine: jeu.graine } });
  return P.lignes.map((l) => (l.choix ? l.choix[l.juste] : l.texte)).join(' · ');
};

export const CORRIGE = {
  code: 'ENT-10.3',
  titre: 'Transports Pelleau — on commence quand même ?',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; fiche de signalement vierge de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Avec Yann, avant de prendre le poste', genre: 'question', texte: 'La bonne réponse à Yann, qui a sorti le transpalette n° 2',
      rep: 'Je le contrôle d’abord, ça prend deux minutes.',
      note: 'Compte dès la première réponse (1,5). « Tu l’as contrôlé, toi ? » fait réagir Yann mais ne rachète pas : seule la première réponse compte.' },
    { etape: 2, etapeTitre: 'Mon poste (inspection, au premier essai)', genre: 'question', texte: 'Ce qu’il faut faire',
      rep: 'Essayer l’avertisseur des deux transpalettes (le n° 2 ne sonne pas seulement si son défaut est l’avertisseur). Marquer le défaut de SA graine '
        + '(extincteur ou plan du quai B, ou un défaut du transpalette n° 2), « Signaler à Erwan », ne rien signaler d’autre. Puis « C’est bon, je prends mon poste ».',
      note: 'Défaut signalé 3,5 · avertisseur n° 1 : 0,5 · avertisseur n° 2 : 0,5 · aucun faux signalement 1,5. Pas d’arrêt : un défaut oublié reste oublié. '
        + 'Erwan, en réunion, répond la même chose à tout signalement.' },
    { etape: 3, etapeTitre: 'Avec Yann, il insiste', genre: 'question', texte: 'La bonne réponse à Yann (selon la variante)',
      rep: 'Selon le défaut : « ' + [D('extincteur'), D('affichage'), D('fuite')].map((d) => d.yann.refuse).join(' » ou « ') + ' ».',
      note: 'Compte dès la première réponse (3). Les trois autres réponses font réagir Yann sans lui donner raison.' },
    { etape: 4, etapeTitre: 'Fiche « Signalement »', genre: 'question', texte: 'Les trois lignes, selon le défaut', rep: '(voir « Son corrigé » par élève)',
      note: 'Qu’est-ce qui ne va pas · ce qu’on ne fait pas · ce que j’ai fait : 1 point chacune.' },
    { etape: 5, etapeTitre: 'Rendre compte à Erwan', genre: 'question', texte: 'Les phrases justes', rep: '(voir « Son corrigé » par élève)',
      note: 'Ce que j’ai vu 0,75 · ce que j’ai fait 0,75 · salutation 0,5 · fin 0,5. Erwan répond toujours le même message : il ne dit pas si le détail est juste.' },
    { etape: 6, etapeTitre: 'La note', genre: 'question', texte: 'Comment la note est-elle calculée ?',
      rep: 'Jalons pondérés et questions, total 20 : avant le premier geste 1,5, mon poste 6, ne pas céder 3, signaler par écrit 3, rendre compte 2,5, '
        + 'questions d’Erwan 4 (A 1,5 · B 1 · C 1,5 ; D non notée). Rien n’est vrai avant un raccrochage, un envoi ou la prise de poste : inaction 0.',
      note: 'Poids validés par Tristan le 18/10/2026. Confirmé : « Ma prise de poste » n’est pas jointe, aucun cas bonus.' },
  ],
};

export function corrigeEleve(base, uid) {
  const ouvert = !!graineDeBase(base || {});
  const graine = graineDeBase(base || {}) || String(uid || 'anonyme');
  const jeu = jeuDe(graine), d = D(jeu.defaut), C = choixSignalement(jeu);
  const juste = (ligne) => libChoix(C[ligne], C[ligne].find((c) => c.juste).v);
  const items = [
    { genre: 'fait', texte: 'Sa variante', rep: VARIANTES[jeu.variante] },
    { genre: 'fait', texte: 'Son défaut', rep: d.lib },
    { genre: 'fait', texte: 'La bonne réponse à Yann (deuxième rencontre)', rep: d.yann.refuse },
    { genre: 'fait', texte: 'Fiche : qu’est-ce qui ne va pas', rep: juste('quoi') },
    { genre: 'fait', texte: 'Fiche : ce qu’on ne fait pas', rep: juste('pas') },
    { genre: 'fait', texte: 'Fiche : ce que j’ai fait', rep: juste('fait') },
    { genre: 'fait', texte: 'Ses phrases justes', rep: phrasesDe(jeu) },
  ];
  if (!ouvert) return { texte: 'Cet élève n’a pas encore ouvert la séance : voici le tirage qu’il recevra.', items };
  return { texte: '', items };
}
