// ENT-16.3 — Royal Canin, « présenter les indicateurs à la réunion » : RENDRE COMPTE à l'oral (C1.6 et C3.4 : partager l'information, ici à l'oral), Terminale.
// Demandée par Tristan le 27/10/2026 (« on ajoute rendre compte, l'élève doit préparer une présentation type Canva, PPT ») ; format choisi avec lui le même
// jour : un support de trois diapos fait dans PowerPoint ou LibreOffice Impress (Canva si le lycée l'a), présenté trois minutes en classe, NOTÉ PAR
// L'ENSEIGNANT (`notation: 'prof'` : sa note remplace celle du site). Le fichier de présentation ne passe pas par le site (le site ne stocke aucun fichier).
//
// Lundi 4 janvier : jeudi, réunion de production. L'élève exporte l'état du stock de décembre (valeurs TIRÉES pour lui), calcule au tableur et dépose
// (retour détaillé, redépôt illimité : il présentera des chiffres justes), fait un graphique, envoie à Sandrine le plan de ses trois diapos (phrases à
// choisir), puis fabrique son support avec la fiche « Préparer tes diapos » et la grille de l'oral.
// Univers : `contenus/royal-canin.js` ; geste tableur et tirage : `T163` de `contenus/royal-canin-tableur.js` ; questions : `contenus/questions/ENT-16.3.js`.
//
// Poids des jalons du site (Claude, délégation de Tristan du 26/10/2026) : la note de préparation, affichée tant que l'enseignant n'a pas saisi celle de
// l'oral : stock moyen et rotation 2 · consommation et couverture 3 · alerte 3 · taux de service 1 · titre de la diapo 1 2 · graphique de la diapo 2 2 ·
// décisions de la diapo 3 3 · questions au fil 4 = 20. La grille de l'oral (sur 20) est dans `DOC_GRILLE`.

import { phrasesJustes } from '../core/phrases.js';
import { EQUIPE, STYLE, MENTION, SANDRINE, docPoste, docMethodeInd, docDroit, ech, pied, liste } from './royal-canin.js';
import { D163, nombreFr as n } from './royal-canin-donnees.js';
import { T163 as T } from './royal-canin-tableur.js';
import { QUESTIONS } from './questions/ENT-16.3.js';

export * from './royal-canin.js';
export const ID = 'royal-canin-reunion';
export const VOLET_ID = 'rc-163';
export const PHRASES_ID = 'plan-diapos-163';
export const TIRAGE = T.TIRAGE;

// ─────────────────────────────────────────── les documents
const DOC_POSTE = docPoste(D163, '<p>Ton travail cette semaine : <b>présenter les indicateurs de décembre</b> à la réunion de production de jeudi, avec un support de trois diapos que tu prépares toi-même.</p>');
export const DOC_DIAPOS = { id: 'diapos', titre: 'Préparer tes diapos', court: 'Préparer tes diapos',
  html: `<article class="rc-doc" aria-label="Préparer tes diapos">
    <p class="rc-t">Préparer tes diapos</p>
    <p class="rc-st">La réunion de production de jeudi : 3 minutes, 3 diapos, le directeur de l’usine et la planification écoutent</p>
    <ol class="rc-ul">
      <li><b>Diapo 1 — la situation.</b> Un titre qui dit le message (combien de ruptures, combien de surstocks, le taux de service), et les chiffres clés.</li>
      <li><b>Diapo 2 — les alertes.</b> Un <b>graphique en barres</b> fait dans ton tableur : pour chaque référence en alerte, sa couverture et son délai côte à côte.
        Copie-le dans ta diapo, avec un titre et l’unité (jours).</li>
      <li><b>Diapo 3 — les décisions.</b> Quelles productions avancer, et dans quel ordre (la plus urgente d’abord) ; lesquelles retarder.</li>
    </ol>
    <p><b>Les règles d’une diapo projetée</b> :</p>
    <ul class="rc-ul">
      <li>Le titre dit ce qu’il faut retenir, pas seulement le sujet.</li>
      <li>Peu de mots : des chiffres et un graphique. C’est toi qui parles, la diapo t’aide.</li>
      <li>Lisible du fond de la salle : gros caractères, pas de tableau Excel complet copié-collé.</li>
      <li>Les chiffres arrondis (un chiffre après la virgule au plus), avec leur unité.</li>
    </ul>
    <p><b>Avec quoi ?</b> PowerPoint ou LibreOffice Impress, installés au lycée (ou Canva si ton lycée te l’ouvre). Ton fichier reste sur ton poste ou ton espace
      de l’ENT : le site ne le reçoit pas. Tu le présentes en classe, et c’est ton professeur qui note l’oral avec la grille jointe.</p>
    ${pied('Consignes CONSTRUITES pour l’exercice. Document pédagogique.')}
  </article>` };
// La grille de l'oral (sur 20) : le fond d'abord (les chiffres, les alertes, la décision), la forme à 3 points sur 20 (15 %).
export const GRILLE = [
  ['Des chiffres justes et lisibles', 5, 'Ceux de ton fichier, arrondis, avec leur unité.'],
  ['Les alertes expliquées', 4, 'La couverture comparée au délai ; la rupture la plus urgente nommée.'],
  ['Une décision proposée et justifiée', 4, 'Quoi avancer, dans quel ordre, quoi retarder, et pourquoi.'],
  ['Un graphique adapté', 4, 'En barres, titré, avec l’unité, lisible du fond de la salle.'],
  ['L’oral', 3, 'Trois minutes, on regarde la salle, les mots du métier (couverture, délai, rupture, surstock).'],
];
export const DOC_GRILLE = { id: 'grille', titre: 'La grille de l’oral', court: 'La grille de l’oral',
  html: `<article class="rc-doc" aria-label="La grille de l’oral">
    <p class="rc-t">La grille de l’oral (sur 20)</p>
    <p class="rc-st">C’est avec elle que ton professeur note ta présentation</p>
    <table class="rc-table"><thead><tr><th scope="col">Critère</th><th class="rc-d" scope="col">Points</th><th scope="col">Ce qu’on attend</th></tr></thead>
      <tbody>${GRILLE.map(([c, p, t]) => `<tr><td>${ech(c)}</td><td class="rc-d">${p}</td><td>${ech(t)}</td></tr>`).join('')}</tbody></table>
    ${pied('Grille CONSTRUITE pour l’exercice. Document pédagogique.')}
  </article>` };
const DOC_DROIT = { id: 'droit-reunion', titre: 'Le droit : la discrétion du salarié', court: 'Le droit',
  html: `<article class="rc-doc" aria-label="Le droit : la discrétion du salarié">
    <p class="rc-t">Le droit : ce qui se dit en réunion reste dans l’entreprise</p>
    <ul class="rc-ul">
      <li>« Le contrat de travail est exécuté de bonne foi » (Code du travail, article L1222-1). Les juges en tirent une <b>obligation de loyauté</b> du salarié,
        qui comprend la <b>discrétion</b> sur les informations internes de l’entreprise (stocks, ruptures, clients, décisions de production).</li>
      <li>Un stagiaire en PFMP s’y engage aussi : la convention de stage lui demande de respecter le règlement et la confidentialité de l’entreprise.</li>
    </ul>
    ${pied('Résumé pour l’exercice ; seule la phrase entre guillemets cite le texte. Document pédagogique.')}
  </article>` };
export const DOCUMENTS = [DOC_POSTE, docMethodeInd(T), DOC_DIAPOS, DOC_GRILLE, DOC_DROIT, docDroit()];
export { STYLE };

// ─────────────────────────────────────────── le plan des diapos (phrases à choisir, calculées sur SON mois)
export function lignesPlan(db, prenom = '{prenom}') {
  const I = T.I(db);
  const nR = I.rupture.length, nS = I.surstock.length;
  const pl = (k, mot) => `${k} ${mot}${k > 1 ? 's' : ''}`;
  const titre = (a, b) => `Diapo 1, le titre : « Décembre : ${pl(a, 'risque')} de rupture, ${pl(b, 'surstock')}, taux de service ${n(I.service)} % ».`;
  const parUrgence = I.rupture.slice().sort((a, b) => (I.par[b].delai - I.par[b].couverture) - (I.par[a].delai - I.par[a].couverture));
  const decide = (avancer, retarder) => `Diapo 3, les décisions : avancer d’abord la production de ${avancer[0]}, puis de ${liste(avancer.slice(1))} ; retarder ${retarder.length > 1 ? 'celles' : 'celle'} de ${liste(retarder)}.`;
  return [
    { id: 'salutation', choix: ['Bonjour Sandrine,', 'Salut la cheffe,', 'Yo,'], juste: 0 },
    { id: 'titre', choix: [titre(nR, nS), titre(nS, nR), 'Diapo 1, le titre : « Les chiffres du mois ».'], juste: 0 },
    { id: 'graphique', choix: ['Diapo 2 : un graphique en barres, la couverture et le délai côte à côte pour chaque référence en alerte.',
      'Diapo 2 : un camembert du stock de toutes les références.', 'Diapo 2 : le tableau Excel complet, copié-collé.'], juste: 0 },
    { id: 'decision', choix: [decide(parUrgence, I.surstock), decide(parUrgence.slice().reverse(), I.surstock), decide(I.surstock, I.rupture)], juste: 0 },
    { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 },
  ];
}

// ─────────────────────────────────────────── les messages de Sandrine (elle tutoie)
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: SANDRINE.nom, fromMail: SANDRINE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: VOLET_ID,
  semer: (prenom) => ({ mails: [mail(prenom, 'Jeudi, c’est toi qui présentes',
    `Bonjour ${prenom} !\n\nJeudi, réunion de production avec le directeur de l’usine et la planification. C’est toi qui présentes les indicateurs de décembre : 3 minutes, 3 diapos.\n\n`
      + '1. Menu Extractions, liste « État du stock — décembre » : exporte, calcule dans ton tableur (reprends tes formules), puis dépose ton fichier dans le menu Fichiers. '
      + 'Je vérifie tes chiffres : tu peux corriger et redéposer autant de fois que tu veux. On ne présente que des chiffres justes.\n'
      + '2. Dans ton fichier, fais un graphique en barres : la couverture et le délai côte à côte, pour les références en alerte.\n'
      + '3. Envoie-moi le plan de tes diapos : je te le demande dès que ton fichier est déposé.\n'
      + '4. Fais ton support dans PowerPoint ou LibreOffice Impress, avec la fiche « Préparer tes diapos » et la grille jointes. Tu le présenteras en classe : c’est ton professeur qui notera l’oral.\n\n'
      + 'Sandrine', { decale: -3600e3, extra: { pieces: ['poste', 'methode-ind', 'diapos', 'grille'] } })] }),
  declencheurs: [
    { id: 'plan', quand: T.depose,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le plan de tes diapos',
        `Bonjour ${prenom},\n\nJ’ai ton fichier. Avant que tu fabriques ton support, envoie-moi le plan de tes trois diapos : le titre de la première, le graphique de la deuxième, les décisions de la troisième.\n\nSandrine`,
        { extra: { phrases: { id: PHRASES_ID, melanger: true, lignes: lignesPlan(db, prenom) } } })] }) },
    { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
      semer: (prenom) => ({ mails: [mail(prenom, 'À jeudi',
        `Merci ${prenom}. Ton plan tient la route une fois corrigé : fabrique ton support, entraîne-toi à le dire en trois minutes, et à jeudi.\n\nSandrine`, { decale: 1000 })] }) },
  ],
};

// ─────────────────────────────────────────── les jalons (la note de préparation ; l'enseignant saisit celle de l'oral)
const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
const G = { chiffres: 'Les chiffres de décembre', plan: 'Le plan des diapos' };
const fichier = (id, titre, controles, poids) => ({ id, titre, groupe: G.chiffres, poids,
  verifier(db) { if (!T.depose(db)) return attente; return controles.every((c) => T.juste(db, c)) ? ok : ko; } });
const ligne = (id, titre, poids) => ({ id, titre, groupe: G.plan, poids, ecran: `phrases:${PHRASES_ID}`,
  verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return r.justes.includes(id) ? ok : ko; } });
export const ETAPES = [
  fichier('rotation', 'Le stock moyen et la rotation (formules)', ['moyen', 'rotation'], 2),
  fichier('couverture', 'La consommation par jour et la couverture (formules)', ['conso', 'couverture'], 3),
  fichier('alerte', 'L’alerte de chaque référence (fonction SI)', ['alerte'], 3),
  fichier('service', 'Le taux de service (formule, en %)', ['service'], 1),
  ligne('titre', 'Diapo 1 : un titre qui dit le message', 2),
  ligne('graphique', 'Diapo 2 : le graphique qui convient', 2),
  ligne('decision', 'Diapo 3 : les décisions, dans l’ordre', 3),
];

const plan = (db) => phrasesJustes(db, PHRASES_ID).envoye;
export const PASTILLES = [{ libelle: 'Le fichier', fait: T.depose }, { libelle: 'Le plan des diapos', fait: plan }];
export const SUITE = [
  { vue: 'extractions', libelle: 'Exporter l’état du stock', fait: T.exporte },
  { vue: 'fichiers', libelle: 'Déposer ton fichier', fait: T.depose },
  { vue: 'mail', mail: PHRASES_ID, libelle: 'Le plan de tes diapos', fait: plan },
];
export const ACCUEIL = {
  titre: 'Présenter les indicateurs à la réunion',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Sandrine', 'Menu Messagerie, avec la fiche « Préparer tes diapos » et la grille de l’oral.'],
    ['① Exporter et calculer', 'Menu Extractions, puis ton tableur : les indicateurs de décembre, avec des formules.'],
    ['② Déposer ton fichier', 'Menu Fichiers : corrige et redépose jusqu’à ce que tout soit juste.'],
    ['③ Le plan de tes diapos', 'Réponds à Sandrine, une phrase par ligne.'],
    ['④ Ton support et ton oral', 'Trois diapos dans PowerPoint ou Impress, présentées en classe : ton professeur note l’oral.'],
    ['Bon à savoir', MENTION],
  ],
};
export const OPTIONS = { menu: [], exercice: 'Présenter les indicateurs à la réunion', sansTrame: 'À l’écran, dans ton tableur, puis ton support de présentation',
  documents: DOCUMENTS, documentsStyle: STYLE, fiches: [], pastilles: PASTILLES, suite: SUITE, equipe: EQUIPE, tableur: T.TABLEUR, questions: QUESTIONS };
