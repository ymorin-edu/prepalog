// Corrigé d'ENT-8.12 (Action, l'inventaire tournant du matin), montré dans l'onglet « Corrigés » de l'enseignant.
//
// Chaque élève a reçu SON jeu (`contenus/action-ent812-donnees.js`, graine = son identifiant) : six adresses de la banque de douze (une septième au
// confirmé), un manque, un surplus et quatre conformes, au hasard. `CORRIGE` donne ce qui est commun ; `corrigeEleve(base, uid)` rend le corrigé d'un
// élève, CALCULÉ depuis son jeu (jamais recopié) : adresse, produit, format de la palette, nombre réel, nombre du système, rôle.

import { graineDeBase } from '../../core/tirage.js';
import { PRODUITS, FORMATS, FAIRE, CAUSES, jeuDe, parCouche, pleine, causesJustes, BANQUE, SAMIA_MAIL } from '../action-ent812-donnees.js';

const SENS = { manque: 'manque', surplus: 'surplus', ok: 'conforme', bonus: 'manque (bonus du confirmé)' };

export const CORRIGE = {
  code: 'ENT-8.12',
  titre: 'Action — l’inventaire tournant du matin',
  trame: '(pas de trame pour l’instant : tout se fait à l’écran ; trame de Cowork après validation)',
  items: [
    { etape: 1, etapeTitre: 'Compter (Plan de l’entrepôt, Terminal, à l’aveugle)', genre: 'question', texte: 'Le geste attendu, adresse par adresse',
      rep: 'Ouvrir l’adresse, cliquer son étiquette (le scan), compter les couches pleines × les cartons par couche, plus les cartons de la couche du dessus, '
        + 'taper le nombre. Si le Terminal dit « Quantité différente. Recompter ou confirmer ? » : « Recompter », compter encore, puis « Confirmer » si le nombre ne bouge pas. '
        + 'Quand les adresses de la liste sont comptées : « Terminer le comptage ».',
      note: 'Scanner avant de compter : 2 (faux si rien n’est compté) · 6 comptes juste, 5/6 de point chacun (le dernier compte confirmé = ce qu’il y a sur la palette) = 5 · '
        + 'recompter : 1,5 sur l’adresse au manque et 1,5 sur l’adresse au surplus (le Terminal a proposé de recompter : « Recompter » au moins une fois ; un compte égal au '
        + 'système, rien n’est proposé : juste, l’erreur se paie au compte ; adresse non comptée : faux). Rien n’est jamais « à faire » après « Terminer ». '
        + `Banque : ${BANQUE.join(', ')} (toutes au sol).` },
    { etape: 2, etapeTitre: 'Les formats de palette (construits ; mêmes cartons par palette qu’ENT-8.11)', genre: 'tableau', texte: 'Cartons par couche × couches pleines',
      entetes: ['Produit', 'Cartons par couche', 'Couches', 'Palette pleine'],
      reponses: Object.keys(FORMATS).map((k) => [PRODUITS[k].nom, `${FORMATS[k].couche[0]} × ${FORMATS[k].couche[1]} = ${parCouche(k)}`, String(FORMATS[k].couches), String(pleine(k))]),
      note: 'Conforme : couche du dessus incomplète, réel = système. Manque : 2 à 4 cartons de moins que le système, sur la couche du dessus. Surplus : palette pleine et 1 à 3 cartons posés dessus. '
        + 'Aveugle : le système n’est jamais à l’écran avant « Terminer le comptage ».' },
    { etape: 3, etapeTitre: 'Signaler à Samia (fiche « Mes écarts »)', genre: 'question', texte: 'Une ligne par écart CONFIRMÉ de l’élève, deux listes',
      rep: `Que fais-tu ? → « ${FAIRE[0].lib} » (jamais « ${FAIRE[1].lib} », ni « ${FAIRE[2].lib} »). Ce qui a pu se passer, s’il MANQUE des cartons → `
        + `${CAUSES.manque.filter((c) => c.juste).map((c) => `« ${c.lib} »`).join(' ou ')} ; s’il y a des cartons EN TROP → ${CAUSES.surplus.filter((c) => c.juste).map((c) => `« ${c.lib} »`).join(' ou ')}.`,
      note: '« Signaler » : 3 points, jugé sur TOUTES les lignes de SA fiche ; « une cause possible » : 2 points, jugé selon le sens de chaque écart. Une fiche sans ligne (aucun écart confirmé) : les deux faux. '
        + 'Une ligne de trop (un compte faux confirmé sur une adresse conforme) est jugée comme les autres : l’erreur est déjà payée au jalon du compte.' },
    { etape: 4, etapeTitre: 'Rendre compte (phrases)', genre: 'question', texte: 'Les phrases',
      rep: 'Bonjour Samia, · « n adresses comptées, n écart(s) signalé(s) dans la fiche. » (calculée sur ses comptes) · (prénom)',
      note: 'Salutation et fin justes : 1 point. La ligne du bilan est calculée sur ce qu’il a compté et n’est pas notée à part.' },
    { etape: 5, etapeTitre: 'Les questions de Samia', genre: 'question', texte: 'Les réponses',
      rep: 'q-pourquoi : pour que le stock reste juste sans arrêter l’entrepôt · q-aveugle : pour compter ce que je vois, sans être influencé · q-colisage : n × a + r '
        + '(un exemple d’articles, valeurs tirées) · q-que-faire (corrigée au bilan) : je le signale à la cheffe d’équipe · q-cause (corrigée au bilan) : des cartons d’une autre palette '
        + 'du même produit posés là (ou, si le sens tiré est « il manque » : des cartons abîmés retirés sans être déclarés) · q-argent : de l’argent. q-robot : réflexion, non notée.',
      note: '0,5 + 0,5 + 0,75 + 0,75 + 0,75 + 0,75 = 4. Total : 16 + 4 = 20. Rien fait = 0.' },
  ],
};

export function corrigeEleve(base, uid) {
  const g = graineDeBase(base) || uid || '';
  const jeu = jeuDe(g);
  const L = [...jeu.liste, jeu.bonus];
  const items = [{ genre: 'tableau', texte: 'Sa liste à compter (dans l’ordre de l’allée)',
    entetes: ['Rang', 'Adresse', 'Produit', 'Palette pleine', 'Ce qu’il y a (réel)', 'Ce que croit le système', 'Rôle'],
    reponses: L.map((x) => [`${x.rang}${x.rang === 7 ? ' (confirmé)' : ''}`, x.adresse, PRODUITS[x.produit].nom,
      `${FORMATS[x.produit].couche[0]} × ${FORMATS[x.produit].couche[1]} × ${FORMATS[x.produit].couches} = ${pleine(x.produit)}`, String(x.reel), String(x.systeme), SENS[x.role]]) }];
  items.push({ genre: 'fait', texte: 'Le recomptage attendu',
    rep: jeu.liste.filter((x) => x.role === 'manque' || x.role === 'surplus').map((x) => `${x.adresse} : le Terminal propose de recompter ; « Recompter », puis « Confirmer » (jalon recompte-${x.role})`).join(' · ') });
  items.push({ genre: 'fait', texte: 'La fiche attendue (parcours juste)',
    rep: jeu.liste.filter((x) => x.role !== 'ok').map((x) => `${x.adresse} (${x.role === 'manque' ? 'il manque des cartons' : 'des cartons en trop'}) : « ${FAIRE[0].lib} », cause : `
      + `${causesJustes(x.role).map((c) => `« ${CAUSES[x.role].find((y) => y.v === c).lib} »`).join(' ou ')}`).join(' · ') });
  items.push({ genre: 'fait', texte: 'Le bilan à Samia (parcours juste, standard)', rep: `6 adresses comptées, 2 écarts signalés dans la fiche. (Message envoyé à ${SAMIA_MAIL})` });
  return { texte: graineDeBase(base) ? '' : 'Cet élève n’a pas encore ouvert la séance : voici ce qu’il recevra.', items };
}
