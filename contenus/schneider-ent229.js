// ENT-22.9 — Schneider Electric, « le centre circulaire » : ENTRAÎNEMENT de CAP-C3.7 (les écogestes : tri, gaspillage, logistique inversée) et
// de CAP-C3.6 (les conséquences d'un fait économique sur l'activité logistique), CAP OL. Les deux n'avaient qu'un guidage (Amazon ENT-19.7, 19.9).
// Trier cinq déchets ou retours du quai, relier quatre faits RÉELS du centre (2019, 2025) à leur conséquence, un calcul (les cartons recyclés par
// jour), les écogestes du poste, puis le compte rendu.
// Univers : `contenus/schneider.js` ; données : `DECHETS`, `FAITS229` de `contenus/schneider-donnees.js` ; questions : `contenus/questions/ENT-22.9.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 26/10/2026) : le tri 4 (0,8 × 5) · fait → conséquence 4 (1 × 4) · le calcul 2 ·
// les écogestes 3 · compte rendu 3 · questions au fil 4 = 20.

import { seanceFiches, proche, memes } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './schneider-commun.js';
import { DOC_SITE } from './schneider.js';
import { FILIERES, DECHETS, CONSEQUENCES, FAITS229, CARTONS_JOUR, PART_RECYCLEE, recycles, ECOGESTES, nombreFr } from './schneider-donnees.js';
import { QUESTIONS } from './questions/ENT-22.9.js';

export * from './schneider.js';

const DOC_CIRCULAIRE = { id: 'circulaire', titre: 'Un centre circulaire', court: 'Le centre circulaire', html: `<article class="se-doc" aria-label="Un centre circulaire">
  <div class="se-entete"><img class="se-logo" src="./contenus/trames/logos/schneider-electric.svg" alt="Schneider Electric"><div><p class="se-t">Évreux, un centre « circulaire »</p><p class="se-st">Des faits réels, datés</p></div></div>
  <table class="se-table"><thead><tr><th scope="col">Le fait</th><th scope="col">D’où il vient</th></tr></thead><tbody>
    <tr><td>Chaque jour, environ <b>${nombreFr(CARTONS_JOUR)} cartons</b> arrivent au centre ; <b>${PART_RECYCLEE} %</b> sont recyclés.</td><td>CCI Normandie, 06/11/2019</td></tr>
    <tr><td><b>60 000 palettes</b> reçues au centre servent à nouveau dans d’autres sites du groupe.</td><td>CCI Normandie, 06/11/2019</td></tr>
    <tr><td>En septembre 2025, le Forum économique mondial a reconnu Évreux comme le <b>premier centre de distribution circulaire</b> du groupe :
      <b>-18 %</b> d’énergie et <b>-40 %</b> de plastique à usage unique en deux ans.</td><td>Schneider Electric et The Manufacturer, 16/09/2025</td></tr>
    <tr><td>Les clients peuvent commander, mais aussi faire <b>reprendre</b>, plus de <b>3 000 types de produits</b> : ils sont réparés, remis à neuf ou
      recyclés. C’est la <b>logistique inversée</b> : le produit revient du client vers l’entreprise.</td><td>Schneider Electric, 16/09/2025</td></tr>
  </tbody></table>
  <div class="se-regle"><b>Au quai</b> : le carton va à la benne à carton, le film plastique au bac à film, une palette en bon état sur la pile à
    réutiliser, une palette cassée à la benne à bois, un produit repris chez un client à la zone des retours.</div>
  <p class="se-pied">Faits réels résumés pour l’exercice, avec leurs sources ; consignes du quai CONSTRUITES. Document pédagogique.</p></article>` };

const S = seanceFiches(U, {
  id: 'schneider-circulaire', prefixe: '229', titre: 'Le centre circulaire', exercice: 'Séance 9 : le centre circulaire',
  documents: [DOC_SITE, DOC_CIRCULAIRE],
  pas: [
    { id: 'tri', libelle: 'Le tri au quai', titre: 'Où va chaque chose ?', sousTitre: 'Pour chaque déchet ou retour, choisis où il va.',
      objet: 'Le tri au quai', pieces: ['circulaire'], documents: ['circulaire'],
      message: 'Bonjour {prenom}. Aujourd’hui, on parle de ce qui ne se voit pas : ce que le quai jette, garde ou renvoie. Lis « Un centre circulaire », puis dis-moi où va chaque chose.',
      blocs: DECHETS.map((d) => ({ type: 'liste', id: d.id, lib: d.lib, vide: 'Choisir…', manque: `« ${d.lib} »`, choix: FILIERES })),
      jalons: DECHETS.map((d) => ({ id: `tri-${d.id}`, titre: `Le tri : « ${d.lib} »`, groupe: 'Le tri au quai', poids: 0.8,
        attendu: FILIERES.find((x) => x.v === d.juste).lib, juste: (v) => v[d.id] === d.juste })) },
    { id: 'faits', libelle: 'Les faits', titre: 'Un fait, une conséquence', sousTitre: 'Pour chaque fait, choisis sa conséquence pour le centre.',
      objet: 'Les faits du centre', pieces: ['circulaire'], documents: ['circulaire'],
      message: 'Ces faits sont réels. Pour chacun, quelle conséquence pour le centre ?',
      blocs: FAITS229.map((f) => ({ type: 'liste', id: f.id, lib: f.lib, vide: 'Choisir…', manque: 'une conséquence', choix: CONSEQUENCES })),
      jalons: FAITS229.map((f, i) => ({ id: `fait-${i + 1}`, titre: `Le fait n° ${i + 1} et sa conséquence`, groupe: 'Les faits', poids: 1,
        attendu: CONSEQUENCES.find((x) => x.v === f.juste).lib, juste: (v) => v[f.id] === f.juste })) },
    { id: 'calcul', libelle: 'Un calcul', titre: 'Les cartons recyclés', sousTitre: `${nombreFr(CARTONS_JOUR)} cartons par jour, ${PART_RECYCLEE} % recyclés.`,
      objet: 'Un calcul', pieces: ['circulaire'], documents: ['circulaire'],
      message: 'Un petit calcul : combien de cartons sont recyclés chaque jour ?',
      blocs: [{ type: 'nombre', id: 'recycles', lib: 'Cartons recyclés par jour', unite: 'cartons', min: 0, entier: true, manque: 'le nombre de cartons' }],
      jalons: [{ id: 'recycles', titre: 'Le calcul des cartons recyclés', groupe: 'Un calcul', poids: 2, attendu: `${nombreFr(recycles())} (${nombreFr(CARTONS_JOUR)} × ${PART_RECYCLEE} ÷ 100)`,
        juste: (v) => proche(v.recycles, recycles()) }] },
    { id: 'gestes', libelle: 'Les écogestes', titre: 'Mes écogestes au quai', sousTitre: 'Coche ce que tu fais.',
      objet: 'Tes écogestes', pieces: ['circulaire'], documents: ['circulaire'],
      message: 'Dernière fiche : coche les gestes que tu fais au quai.',
      blocs: [{ type: 'cases', id: 'eco', titre: 'Ce que je fais', choix: ECOGESTES.map((x) => ({ v: x.v, lib: x.lib })) }],
      jalons: [{ id: 'eco', titre: 'Les écogestes', groupe: 'Les écogestes', poids: 3, attendu: ECOGESTES.filter((x) => x.juste).map((x) => x.lib).join(' ; '),
        juste: (v) => memes(v.eco || [], ECOGESTES.filter((x) => x.juste).map((x) => x.v)) }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 3, message: 'Merci {prenom}. Écris-moi en deux phrases ce que tu as retenu.',
    lignes: (prenom) => [SALUT,
      { id: 'palette', choix: ['Une palette en bon état ne se jette pas : elle sert à nouveau, le centre en achète moins.', 'Une palette vide se jette dans la benne à bois.', 'Une palette en bon état va dans la benne à carton.'], juste: 0 },
      { id: 'inverse', choix: ['Un produit repris chez un client va à la zone des retours : c’est la logistique inversée.', 'Un produit repris chez un client se jette.', 'Le centre ne reprend jamais de produit.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Où va chaque chose ?', 'Un fait, une conséquence.', 'Un calcul.', 'Tes écogestes.', 'Réponds à Nadia, une phrase par ligne.'],
  fin: 'Merci {prenom}. Bientôt, ton évaluation : ranger et compter.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
