// Les questions d'ENT-8.11 — Action, ranger à la bonne adresse (brief `docs/briefs/ENT-8.11-action-ranger.md` §4 bis et §4 ter, décidées par
// Tristan le 21/10/2026 : « on garde tout »). Modifier ce fichier suffit : voir « Modifier les questions d'une séance » dans
// `activites/FICHE-SEANCE.md`. Personnes CONSTRUITES : Samia (cheffe d'équipe, la tutrice), Kevin (cariste) — univers `contenus/action.js`.
//
// AU FIL (`part: 4`, une ligne au bandeau : « Les questions de Samia ») ; énoncés, choix et retours de Cowork, tels quels (au « niveau 1, au
// sol ») ; les gestes du brief sont REBRANCHÉS sur ceux que publie le mode palettier (COORDINATION-palettier §3 n° 4) :
// - `q-adresse` (0,75, tout de suite) : « première palette posée » → la première pose réussie, quelle que soit la palette (`entrepot:action-
//   ranger:poser:P1` … `:P6`). Adresse TIRÉE dans la banque de la fiche, autre que celle de la fiche et que celles de ses palettes.
// - `q-plaque` (0,75, AU BILAN) : « palette lourde posée ou confiée » → la première pose ou confiance d'une palette de 400 kg ou plus (seuil
//   des données) ; P5 l'est toujours, donc la question arrive au plus tard quand P5 est confiée à sa nouvelle adresse. Valeurs TIRÉES
//   (multiples de 50 : jamais celles d'une palette de l'élève) ; corrigée au bilan (elle éclairerait le jalon « plaque de charge »).
// - `q-kevin` (0,5, tout de suite) : « première palette confiée » → la première confiance réussie (`…:confier:P1` … `:P6`).
// - `q-sans-scan` (0,75, tout de suite) : « premier scan réussi » → `…:scan:P1` … `:P6` (lot 2 du moteur).
// - `q-materiel` (0,75, tout de suite) : « message à Kevin envoyé » → `apresMail` vers Kevin. Fait VÉRIFIÉ (Gomet') ; document « Action et
//   Geodis à Ensuès », joint au message de Samia « Au rack ! ».
// - `q-securite` (0,5, tout de suite) : « fin du rangement (verifier) » → `…:valider` (« Valider mon rangement », COORDINATION §3 n° 4).
//   Document « Le droit » (C. trav. L4121-1 et L4122-1), joint au même message.
// Ajout de Claude Code : la parenthèse « (Lis « … », joint au message de Samia.) » à la fin de `q-materiel` et `q-securite` (comme ENT-8.9) :
// une question au fil ne montre pas de document.
//
// AVANT DE COMMENCER : banque de 9 notions NON notées, 4 tirées par élève (3 de préparation, 1 image). Celles marquées ★ au brief, validées par
// Tristan (k-adresse, k-sol-reserve, k-plaque, k-scan, img-plaque), et celles proposées par Cowork (k-reserve, k-cariste, k-poids, img-retractable). `k-poids` : n et k TIRÉS. Les `aide` sont
// écrites par Claude Code (à relire). Images : dessins en traits de la séance (aucune image nouvelle).
//
// Ce fichier importe les DONNÉES de la séance (`contenus/action-ent811-donnees.js`), jamais le contenu (`contenus/action-ent811.js` l'importe).

import { apresGeste, apresMail } from '../../core/declencheurs.js';
import { ID, KEVIN_MAIL, PALETTES_IDS, GESTE, unDe, gesteFait, lourdesDe, adresseQuestion, valeursPlaque, decoupe, ordinal } from '../action-ent811-donnees.js';

const GROUPE = 'Les questions de Samia';
const PERSONNES = {
  samia: { nom: 'Samia', role: 'cheffe d’équipe à la réception (ta tutrice)', appel: 'Samia', registre: 'tu' },
  kevin: { nom: 'Kevin', role: 'cariste', appel: 'Kevin', registre: 'tu' },
};
const tousLes = (geste) => unDe(...PALETTES_IDS.map((id) => apresGeste(GESTE(`${geste}:${id}`))));
const nb = (n) => Number(n).toLocaleString('fr-FR');

// `q-plaque` : la pose ou la confiance d'une palette lourde de l'élève. Les gestes cités sont tous ceux des six palettes (contrôle au chargement).
const lourdePosee = (() => {
  const f = (db) => lourdesDe(db).some((id) => gesteFait(db, GESTE(`poser:${id}`)) || gesteFait(db, GESTE(`confier:${id}`)));
  f.gestes = PALETTES_IDS.flatMap((id) => [GESTE(`poser:${id}`), GESTE(`confier:${id}`)]);
  return f;
})();

const varianteKPoids = (h) => {
  const n = h.entier(20, 40), k = h.entier(3, 12);
  return {
    enonce: `Une palette de ${n} cartons de ${k} kg, plus 25 kg de palette, pèse…`,
    libs: { juste: `${nb(n * k + 25)} kg`, sans: `${nb(n * k)} kg`, somme: `${nb(n + k + 25)} kg` },
    retour: `${n} cartons × ${k} kg = ${nb(n * k)} kg, plus 25 kg de palette : ${nb(n * k + 25)} kg.`,
  };
};

export const QUESTIONS = {
  id: ID,
  part: 4,
  personnes: PERSONNES,
  ouverture: { id: 'avant-de-commencer', de: 'samia', titre: 'Avant de commencer', continuer: 'voir l’accueil',
    situation: 'Bonjour ! Cet après-midi, tu ranges des palettes. Avant de commencer, regarde les documents à gauche et réponds à mes questions.',
    documents: ['stage', 'etiquette', 'travee', 'panneau', 'chariot'],
    tirage: { preparation: 3, image: 1 },
    questions: ['k-adresse', 'k-sol-reserve', 'k-plaque', 'k-scan', 'k-reserve', 'k-cariste', 'k-poids', 'img-plaque', 'img-retractable'] },
  liste: [
    // ── préparation (7 : l'élève en reçoit 3)
    { id: 'k-adresse', type: 'ouverture', de: 'samia', doc: 'etiquette', rubrique: 'preparation',
      enonce: 'Une adresse de rangement dit…',
      aide: 'Regarde l’étiquette à gauche. Clique sur le mot [[adresse]].',
      choix: [{ v: 'ou', lib: 'où ranger la palette : allée, travée, niveau, emplacement' }, { v: 'magasin', lib: 'à quel magasin l’envoyer' },
        { v: 'produit', lib: 'le nom du produit' }],
      juste: 'ou',
      retour: 'L’adresse dit où va la palette : allée et côté, travée, niveau, emplacement.' },
    { id: 'k-sol-reserve', type: 'ouverture', de: 'samia', doc: 'travee', rubrique: 'preparation',
      enonce: 'Au niveau 1, au sol, on met…',
      aide: 'Regarde le bas de la travée. Clique sur le mot [[picking]].',
      choix: [{ v: 'picking', lib: 'les palettes où l’on prépare les commandes (le picking)' }, { v: 'vides', lib: 'les palettes vides' },
        { v: 'abimees', lib: 'les palettes abîmées' }],
      juste: 'picking',
      retour: 'Au sol, le picking : les préparateurs y prennent les cartons des commandes.' },
    { id: 'k-plaque', type: 'ouverture', de: 'samia', doc: 'panneau', rubrique: 'preparation',
      enonce: 'La plaque de charge d’un rack dit…',
      aide: 'Regarde le panneau à gauche. Clique sur les mots [[plaque de charge]].',
      choix: [{ v: 'kilos', lib: 'combien de kilos chaque niveau peut porter au plus' }, { v: 'palettes', lib: 'le nombre de palettes dans l’allée' },
        { v: 'plafond', lib: 'la hauteur du plafond' }],
      juste: 'kilos',
      retour: 'La plaque dit le poids maximum d’un niveau : au-delà, le rack peut plier.' },
    { id: 'k-scan', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Scanner l’emplacement après avoir rangé, ça sert à…',
      aide: 'Clique sur le mot [[scanner]].',
      choix: [{ v: 'systeme', lib: 'dire au système où est la palette' }, { v: 'compter', lib: 'compter les cartons' },
        { v: 'imprimer', lib: 'imprimer une étiquette' }],
      juste: 'systeme',
      retour: 'Le scan dit au système où est la palette : sans lui, personne ne la retrouve.' },
    { id: 'k-reserve', type: 'ouverture', de: 'samia', doc: 'travee', rubrique: 'preparation',
      enonce: 'Les niveaux au-dessus du sol servent…',
      aide: 'Regarde le haut de la travée. Clique sur le mot [[réserve]].',
      choix: [{ v: 'reserve', lib: 'de réserve : on y descend une palette quand le picking se vide' }, { v: 'cassees', lib: 'à ranger les palettes cassées' },
        { v: 'bureaux', lib: 'aux bureaux' }],
      juste: 'reserve',
      retour: 'En hauteur, la réserve : quand le picking se vide, on descend une palette.' },
    { id: 'k-cariste', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation',
      enonce: 'Le cariste, c’est…',
      aide: 'Clique sur le mot [[cariste]].',
      choix: [{ v: 'chariot', lib: 'la personne qui conduit le chariot élévateur' }, { v: 'chauffeur', lib: 'le chauffeur du camion' },
        { v: 'chef', lib: 'le chef d’équipe' }],
      juste: 'chariot',
      retour: 'Le cariste conduit le chariot élévateur. Ici, c’est Kevin.' },
    { id: 'k-poids', type: 'ouverture', de: 'samia', doc: 'stage', rubrique: 'preparation', variante: varianteKPoids,
      enonce: 'Une palette de 30 cartons de 9 kg, plus 25 kg de palette, pèse…',
      aide: 'Multiplie les cartons par le poids d’un carton, puis ajoute la palette.',
      choix: [{ v: 'juste', lib: '295 kg' }, { v: 'sans', lib: '270 kg' }, { v: 'somme', lib: '64 kg' }],
      juste: 'juste',
      retour: '30 cartons × 9 kg = 270 kg, plus 25 kg de palette : 295 kg.' },
    // ── image (2 : l'élève en reçoit 1)
    { id: 'img-plaque', type: 'ouverture', de: 'samia', doc: 'panneau', rubrique: 'image',
      enonce: 'Ce panneau fixé au bout du rack, c’est…',
      aide: 'Lis ce qui est écrit sur le panneau.',
      choix: [{ v: 'plaque', lib: 'la plaque de charge' }, { v: 'evacuation', lib: 'un plan d’évacuation' }, { v: 'adresse', lib: 'une adresse' }],
      juste: 'plaque',
      retour: 'C’est la plaque de charge : le poids maximum de chaque niveau.' },
    { id: 'img-retractable', type: 'ouverture', de: 'samia', doc: 'chariot', rubrique: 'image',
      enonce: 'Ce chariot, qui monte les palettes très haut, c’est…',
      aide: 'Regarde le mât, très haut, et la palette au bout des fourches.',
      choix: [{ v: 'retractable', lib: 'un chariot à mât rétractable' }, { v: 'transpalette', lib: 'un transpalette' }, { v: 'tracteur', lib: 'un tracteur' }],
      juste: 'retractable',
      retour: 'Un chariot à mât rétractable : il range en grande hauteur. Il demande une autorisation de conduite à part.' },
    // ── au fil du travail (brief §4 bis ; une ligne au bandeau)
    { id: 'q-adresse', type: 'fil', de: 'samia', quand: tousLes('poser'), poids: 0.75, groupe: GROUPE,
      enonce: 'L’étiquette dit B1-T04-N3-E2. Que veut dire le 3 ?',
      selon: (db) => { const a = adresseQuestion(db), n = decoupe(a).n;
        return { enonce: `L’étiquette dit ${a}. Que veut dire le ${n} ?`, libs: { niveau: `le niveau : le ${ordinal(n)} en partant du sol` },
          retour: `Le ${ordinal(n)} niveau en partant du sol : c’est Kevin qui y va.` }; },
      choix: [{ v: 'niveau', lib: 'le niveau : le 3e en partant du sol' }, { v: 'travee', lib: 'la travée' }, { v: 'emplacement', lib: 'l’emplacement' },
        { v: 'allee', lib: 'l’allée' }],
      juste: 'niveau',
      retour: 'Le 3e niveau en partant du sol : c’est Kevin qui y va.' },
    { id: 'q-plaque', type: 'fil', de: 'samia', quand: lourdePosee, poids: 0.75, groupe: GROUPE, apres: 'bilan',
      enonce: 'Une plaque dit 800 kg par niveau. Le niveau porte déjà 300 kg. Une palette de 650 kg peut-elle y aller ?',
      selon: (db) => { const v = valeursPlaque(db);
        return { enonce: `Une plaque dit ${nb(v.plaque)} kg par niveau. Le niveau porte déjà ${nb(v.deja)} kg. Une palette de ${nb(v.palette)} kg peut-elle y aller ?` }; },
      choix: [{ v: 'non', lib: 'non : ça dépasserait la plaque' }, { v: 'oui', lib: 'oui, il reste de la place' }, { v: 'fond', lib: 'oui si on la pousse au fond' }],
      juste: 'non',
      retour: 'Au-delà de la plaque, le rack peut plier. On signale, on ne pose pas.' },
    { id: 'q-kevin', type: 'fil', de: 'samia', quand: tousLes('confier'), poids: 0.5, groupe: GROUPE,
      enonce: 'Pourquoi c’est Kevin qui monte la palette, et pas toi ?',
      choix: [{ v: 'autorisation', lib: 'monter en hauteur demande un autre chariot et une autorisation de conduite que je n’ai pas encore' },
        { v: 'stagiaire', lib: 'parce que je suis stagiaire et que je n’ai pas le droit de toucher aux palettes' }, { v: 'vite', lib: 'parce que Kevin va plus vite' }],
      juste: 'autorisation',
      retour: 'En hauteur, c’est un autre chariot et une autre autorisation. Tu y viendras peut-être.' },
    { id: 'q-sans-scan', type: 'fil', de: 'samia', quand: tousLes('scan'), poids: 0.75, groupe: GROUPE,
      enonce: 'Imagine : tu poses une palette sans la scanner. Où le système croit-il qu’elle est ?',
      choix: [{ v: 'nulle-part', lib: 'à l’adresse qu’il avait donnée, ou nulle part : il ne sait pas où elle est vraiment' },
        { v: 'posee', lib: 'là où tu l’as posée' }, { v: 'devine', lib: 'il le devine' }],
      juste: 'nulle-part',
      retour: 'Sans scan, le système se trompe, et demain un préparateur trouve un emplacement vide.' },
    { id: 'q-materiel', type: 'fil', de: 'samia', quand: apresMail({ a: KEVIN_MAIL }), poids: 0.75, groupe: GROUPE,
      enonce: 'Ici, le chariot et l’ordinateur appartiennent à Action, mais toi, tu travailles pour Geodis. Pourquoi ? (Lis « Action et Geodis à Ensuès », joint au message de Samia.)',
      choix: [{ v: 'prestataire', lib: 'Action confie son entrepôt à Geodis, un prestataire : Geodis fournit l’équipe, Action le matériel' },
        { v: 'loue', lib: 'Geodis loue ses salariés à Action' }, { v: 'patron', lib: 'Action est le patron de Geodis' }],
      juste: 'prestataire',
      retour: 'C’est le travail d’un prestataire logistique.' },
    { id: 'q-securite', type: 'fil', de: 'samia', quand: apresGeste(GESTE('valider')), poids: 0.5, groupe: GROUPE,
      enonce: 'Une palette mal posée tombe d’un rack. Qui devait organiser la sécurité ? (Lis « Le droit », joint au message de Samia.)',
      choix: [{ v: 'les-deux', lib: 'l’employeur doit assurer la sécurité ; chacun doit aussi faire attention à la sienne et à celle des autres' },
        { v: 'salarie', lib: 'seulement le salarié qui a posé la palette' }, { v: 'personne', lib: 'personne : c’est un accident' }],
      juste: 'les-deux',
      retour: 'L’employeur organise ; toi, tu fais attention. Les deux.' },
  ],
};
