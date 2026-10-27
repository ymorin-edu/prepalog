// ENT-21.1 — Lidl, « bienvenue à Meaux : préparer la réception » : GUIDAGE de C1.3, 2de GATL. La zone de six produits, le quai de quatre camions,
// ce qu'on contrôle à l'arrivée, trois relevés de température.
// Univers : `contenus/lidl.js` ; données : `P211`, `C211`, `R211` ; questions : `contenus/questions/ENT-21.1.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : les zones 3 (0,5 × 6) · les quais 5 (1,25 × 4) · les contrôles 3 ·
// les relevés 3 (1 × 3) · compte rendu 2 · questions au fil 4 = 20.

import { seanceFiches, memes } from './fabrique-fiches.js';
import { U_RECEPTION, SALUT, FIN } from './lidl-commun.js';
import { DOC_SITE, DOC_EQUIPE, DOC_ZONES, DOC_RECEPTION, docCamions, docReleves, blocsZonesProduits, jalonsZonesProduits, zoneDe } from './lidl.js';
import { P211, C211, R211, QUAIS, CONTROLES, releveJuste } from './lidl-donnees.js';
import { QUESTIONS } from './questions/ENT-21.1.js';

export * from './lidl.js';

const ACTIONS = [{ v: 'accepter', lib: 'Dans les limites : on décharge' }, { v: 'prevenir', lib: 'Hors limites : on ne décharge pas, on prévient Fatou' }];

const S = seanceFiches(U_RECEPTION, {
  id: 'lidl-bienvenue', prefixe: '211', titre: 'Bienvenue à Meaux : préparer la réception', exercice: 'Séance 1 : préparer la réception',
  documents: [DOC_SITE, DOC_EQUIPE, DOC_ZONES, DOC_RECEPTION, docCamions(() => C211), docReleves(R211)],
  pas: [
    { id: 'zones', libelle: 'Les zones', titre: 'La zone de chaque produit', sousTitre: 'Sec, fruits et légumes, frais ou surgelé ?',
      objet: 'Bienvenue à Meaux', pieces: ['site', 'equipe', 'zones'], documents: ['zones', 'site'], largeurDocs: 1.2,
      message: 'Bonjour {prenom}, bienvenue à Meaux ! Je suis Fatou, cheffe de quai à la réception : c’est moi qui te forme.\n\n'
        + 'Ici, chaque produit a sa zone de température. Lis « Les zones », puis dis-moi où va chacun de ces six produits.',
      blocs: blocsZonesProduits(P211), jalons: jalonsZonesProduits(P211, { poids: 0.5, groupe: 'Les zones' }) },
    { id: 'quais', libelle: 'Les quais', titre: 'Le quai de chaque camion', sousTitre: 'Un quai de la zone des produits du camion.',
      objet: 'Les camions du matin', pieces: ['camions', 'zones'], documents: ['camions', 'zones'], largeurDocs: 1.2,
      message: 'Quatre camions arrivent ce matin. Sur quel quai fais-tu venir chacun d’eux ?',
      blocs: C211.map((c) => ({ type: 'liste', id: `quai-${c.id}`, lib: `${c.id} · ${c.de}`, vide: 'Choisir le quai…', manque: `le quai du camion ${c.id}`,
        choix: QUAIS.map((q) => ({ v: q, lib: `Quai ${q}` })) })),
      jalons: C211.map((c, i) => ({ id: `quai-${i + 1}`, titre: `Le quai du camion ${c.id}`, groupe: 'Les quais', poids: 1.25,
        attendu: `${zoneDe(c.zone).quais.map((q) => `quai ${q}`).join(' ou ')} (${zoneDe(c.zone).court})`, juste: (v) => zoneDe(c.zone).quais.includes(v[`quai-${c.id}`]) })) },
    { id: 'controles', libelle: 'Les contrôles', titre: 'Ce que tu contrôles à l’arrivée', sousTitre: 'Coche tout ce qui se contrôle au quai.',
      objet: 'Le camion arrive', pieces: ['reception'], documents: ['reception'],
      message: 'Le premier camion est à quai. Coche tout ce que tu contrôles avant de signer.',
      blocs: [{ type: 'cases', id: 'controles', titre: 'Au quai, je contrôle…', choix: CONTROLES.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'controles', titre: 'Les contrôles au quai', groupe: 'Les contrôles', poids: 3, attendu: CONTROLES.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.controles || [], CONTROLES.filter((x) => x.juste).map((x) => x.v)) }] },
    { id: 'releves', libelle: 'Les températures', titre: 'Trois relevés de température', sousTitre: 'Les limites sont dans « Les zones ».',
      objet: 'Les températures', pieces: ['releves', 'zones'], documents: ['releves', 'zones'],
      message: 'Voici les températures relevées à l’arrivée de trois camions. Pour chacun : on décharge, ou on me prévient ?',
      blocs: R211.map((r) => ({ type: 'choix', id: `releve-${r.id}`, lib: `${r.id} · ${r.camion}`, colonne: true, manque: `le relevé ${r.id}`, choix: ACTIONS })),
      jalons: R211.map((r, i) => ({ id: `releve-${i + 1}`, titre: `Le relevé ${r.id}`, groupe: 'Les températures', poids: 1,
        attendu: ACTIONS.find((a) => a.v === releveJuste(r)).lib, juste: (v) => v[`releve-${r.id}`] === releveJuste(r) })) },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 2, message: 'Merci {prenom}. Écris-moi ce que tu retiens de ta première matinée.',
    lignes: (prenom) => [SALUT('Fatou'),
      { id: 'froid', choix: ['Un produit frais ou surgelé va directement de son camion à sa zone, par un quai de sa zone.', 'Les surgelés peuvent attendre sur le quai des produits secs.', 'La zone d’un produit n’a pas d’importance.'], juste: 0 },
      { id: 'laiterie', choix: ['Le camion de la laiterie était à +7 °C : je ne l’ai pas déchargé et je t’ai prévenue.', 'Le camion de la laiterie était à +7 °C : je l’ai déchargé, c’est presque froid.', 'Le camion de surgelés était trop chaud.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['La zone de six produits.', 'Le quai de quatre camions.', 'Ce que tu contrôles à l’arrivée.', 'Trois relevés de température.', 'Réponds à Fatou, une phrase par ligne.'],
  fin: 'Merci {prenom}. Lundi, tu prépares avec moi le planning des rendez-vous.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
