// ENT-19.2 — Amazon, « prendre mon poste » : GUIDAGE de CAP-C1.2 (prendre un poste en autonomie), CAP OL.
// La sécurité au poste (4 situations), l'écran du poste (mission, armoire, bac), le planigramme de réception du matin, puis le compte rendu à Karima.
// Univers : `contenus/amazon.js` ; fabrique : `contenus/fabrique-fiches.js` ; questions : `contenus/questions/ENT-19.2.js`.
//
// Poids (décidés par Claude, délégation de Tristan du 27/10/2026) : sécurité 5 (1,25 × 4) · écran du poste 4 (1 × 4) · planigramme 3 (1 × 3) ·
// compte rendu 4 · questions au fil 4 = 20. RÉEL : la procédure publique d'Amazon pour les transporteurs tolère 30 minutes de retard.

import { seanceFiches, proche } from './fabrique-fiches.js';
import { U, SALUT, FIN } from './amazon-commun.js';
import { DOC_SITE, DOC_SECURITE, blocsSecurite, jalonsSecurite, ech } from './amazon.js';
import { SECU192, POSTE192 as P, PLANIGRAMME, RETARD_MAX, palettesAuQuai } from './amazon-donnees.js';
import { QUESTIONS } from './questions/ENT-19.2.js';

export * from './amazon.js';

const DOC_ECRAN = { id: 'ecran', titre: 'L’écran de ton poste', court: 'L’écran du poste', html: `<article class="az-doc" aria-label="L’écran de ton poste">
  <p class="az-t">L’écran de ton poste</p><p class="az-st">Ce que tu lis en arrivant</p>
  <div class="az-ecran"><p><b>Poste ${P.poste}</b> · niveau ${P.niveau}</p>
    <p>Mission : <b>${P.mission.toUpperCase()}</b></p>
    <p>Armoire devant toi : <b class="az-mono">${P.armoire}</b></p>
    <p>Bac à vider : <b class="az-mono">${P.bac}</b> — ${P.articles} articles</p>
    <p>Un problème ? Bouton <b>« Aide »</b> : Théo vient.</p></div>
  <p class="az-pied">Écran CONSTRUIT pour l’exercice. Document pédagogique — reconstitution, non contractuel.</p></article>` };
const DOC_PLANI = { id: 'planigramme', titre: 'Le planigramme de réception', court: 'Le planigramme', html: `<article class="az-doc" aria-label="Le planigramme de réception">
  <p class="az-t">Le planigramme de réception — ce matin</p><p class="az-st">Les camions des vendeurs qui livrent le centre, et le quai de chacun</p>
  <table class="az-table"><thead><tr><th scope="col">Rendez-vous</th><th scope="col">Vendeur</th><th scope="col">Quai</th><th class="az-d" scope="col">Palettes</th></tr></thead><tbody>
    ${PLANIGRAMME.map((x) => `<tr><td>${x.heure.replace(':', ' h ')}</td><td>${ech(x.vendeur)}</td><td>${x.quai}</td><td class="az-d">${x.palettes}</td></tr>`).join('')}
  </tbody></table>
  <div class="az-regle">Règle d’Amazon pour les transporteurs : le rendez-vous est pris à l’avance, un par camion. <b>Plus de ${RETARD_MAX} minutes de
    retard</b> : le camion peut être refusé. C’est la manageuse qui décide.</div>
  <p class="az-pied">Vendeurs, heures et palettes CONSTRUITS pour l’exercice ; la règle des ${RETARD_MAX} minutes vient de la procédure publique d’Amazon pour les transporteurs (2023). Document pédagogique.</p></article>` };

const MISSIONS = [{ v: 'prelevement', lib: 'Prélèvement' }, { v: 'rangement', lib: 'Rangement' }, { v: 'emballage', lib: 'Emballage' }];
const NUMEROS = [{ v: String(P.poste), lib: String(P.poste) }, { v: P.bac, lib: P.bac }, { v: P.armoire, lib: P.armoire }];
const QUAIS = [12, 14, 15].map((x) => ({ v: String(x), lib: `Quai ${x}` }));
const RETARD = [{ v: 'tot', lib: 'Il est en avance : je le décharge' }, { v: 'refus', lib: 'Plus de 30 minutes de retard : il peut être refusé, je préviens Karima' },
  { v: 'rien', lib: 'Je le décharge tout de suite sans rien dire' }];
const camion = (v) => PLANIGRAMME.find((x) => x.vendeur.startsWith(v));

const S = seanceFiches(U, {
  id: 'amazon-poste', prefixe: '192', titre: 'Prendre mon poste', exercice: 'Séance 2 : prendre mon poste',
  documents: [DOC_SITE, DOC_SECURITE, DOC_ECRAN, DOC_PLANI],
  pas: [
    { id: 'securite', libelle: 'La sécurité', titre: 'La sécurité au poste', sousTitre: 'Pour chaque situation, choisis ce que tu fais.',
      objet: 'Ton premier jour au poste', pieces: ['securite'], documents: ['securite'],
      message: 'Bonjour {prenom} ! Aujourd’hui, tu prends ton poste de rangement. D’abord la sécurité : lis le document « La sécurité » et dis-moi ce que tu fais dans chaque situation.',
      blocs: blocsSecurite(SECU192), jalons: jalonsSecurite(() => SECU192, { poids: 1.25, groupe: 'La sécurité' }) },
    { id: 'ecran', libelle: 'L’écran du poste', titre: 'L’écran de mon poste', sousTitre: 'Lis l’écran, à gauche.',
      objet: 'Ton écran', pieces: ['ecran'], documents: ['ecran'],
      message: 'Tu es devant le poste. Lis l’écran et remplis la fiche : ta mission, ton armoire, ton bac.',
      blocs: [
        { type: 'liste', id: 'mission', lib: 'Ma mission aujourd’hui', vide: 'Choisir…', manque: 'ta mission', choix: MISSIONS },
        { type: 'liste', id: 'armoire', lib: 'Le numéro de l’armoire devant moi', vide: 'Choisir…', manque: 'l’armoire', choix: NUMEROS },
        { type: 'liste', id: 'bac', lib: 'Le numéro du bac à vider', vide: 'Choisir…', manque: 'le bac', choix: NUMEROS },
        { type: 'nombre', id: 'articles', lib: 'Le nombre d’articles dans le bac', unite: 'articles', min: 0, entier: true, manque: 'le nombre d’articles' }],
      jalons: [
        { id: 'mission', titre: 'L’écran : la mission', groupe: 'L’écran du poste', poids: 1, attendu: 'Rangement', juste: (v) => v.mission === 'rangement' },
        { id: 'armoire', titre: 'L’écran : l’armoire', groupe: 'L’écran du poste', poids: 1, attendu: P.armoire, juste: (v) => v.armoire === P.armoire },
        { id: 'bac', titre: 'L’écran : le bac', groupe: 'L’écran du poste', poids: 1, attendu: P.bac, juste: (v) => v.bac === P.bac },
        { id: 'articles', titre: 'L’écran : le nombre d’articles', groupe: 'L’écran du poste', poids: 1, attendu: String(P.articles), juste: (v) => proche(v.articles, P.articles) }] },
    { id: 'plani', libelle: 'Le planigramme', titre: 'Le planigramme de réception', sousTitre: 'Les camions de ce matin, à gauche.',
      objet: 'Les camions du matin', pieces: ['planigramme'], documents: ['planigramme'],
      message: 'Tes articles arrivent des camions du matin. Lis le planigramme de réception et réponds.',
      blocs: [
        { type: 'liste', id: 'quai', lib: 'À quel quai arrive le camion de Jouets Maël ?', vide: 'Choisir…', manque: 'le quai', choix: QUAIS },
        { type: 'nombre', id: 'palettes', lib: 'Combien de palettes arrivent au quai 12 ce matin ?', unite: 'palettes', min: 0, entier: true, manque: 'les palettes du quai 12' },
        { type: 'choix', id: 'retard', lib: 'Le camion de Sport Ouest arrive à 10 h 50. Que fais-tu ?', colonne: true, manque: 'le camion en retard', choix: RETARD }],
      jalons: [
        { id: 'quai', titre: 'Le planigramme : le quai de Jouets Maël', groupe: 'Le planigramme', poids: 1, attendu: `Quai ${camion('Jouets').quai}`, juste: (v) => v.quai === String(camion('Jouets').quai) },
        { id: 'palettes', titre: 'Le planigramme : les palettes du quai 12', groupe: 'Le planigramme', poids: 1, attendu: String(palettesAuQuai(12)), juste: (v) => proche(v.palettes, palettesAuQuai(12)) },
        { id: 'retard', titre: 'Le planigramme : le camion en retard', groupe: 'Le planigramme', poids: 1, attendu: RETARD[1].lib, juste: (v) => v.retard === 'refus' }] },
  ],
  compteRendu: { objet: 'Ton compte rendu', poids: 4, message: 'Merci {prenom}. Avant de commencer, écris-moi en quelques lignes où tu es et ce que tu fais : je note ta prise de poste.',
    lignes: (prenom) => [SALUT,
      { id: 'poste', choix: [`Je suis au poste ${P.poste}, en rangement, devant l’armoire ${P.armoire}.`, `Je suis au poste ${P.poste}, en prélèvement, devant l’armoire ${P.bac}.`, 'Je suis au poste 12, en emballage.'], juste: 0 },
      { id: 'bac', choix: [`Mon bac ${P.bac} a ${P.articles} articles à ranger.`, `Mon bac ${P.armoire} a ${P.articles} articles à ranger.`, `Mon bac ${P.bac} a ${P.poste} articles à ranger.`], juste: 0 },
      { id: 'secu', choix: ['J’ai mes chaussures de sécurité, et je ne passe jamais la barrière des robots.', 'Si un article tombe chez les robots, je passe la barrière pour le ramasser.', 'Au poste, je n’ai pas besoin de chaussures de sécurité.'], juste: 0 },
      FIN(prenom)] },
  accueil: ['Pour chaque situation, choisis ce que tu fais.', 'Lis l’écran du poste.', 'Lis le planigramme des camions.', 'Réponds à Karima, une phrase par ligne.'],
  fin: 'Merci {prenom}, ta prise de poste est notée. La prochaine fois, tu ranges ton premier bac.',
  questions: QUESTIONS,
});
export const { ID, FICHES, VOLET, ETAPES, SUITE, ACCUEIL, OPTIONS, fid, corrige } = S;
