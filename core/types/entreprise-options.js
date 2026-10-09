// Les OPTIONS de `creerEntreprise` : la table unique, son contrôle et le contrôle des identifiants de vues.
//
// Extrait de `core/types/entreprise.js` le 08/10/2026 (chantier 9, lot 9c, module 1) : rien n'a changé, ni
// la table, ni les messages. Module PUR : il ne reçoit rien, ne lit aucun état et n'importe aucun fichier.
// `entreprise.js` l'appelle (`controlerOptions(U)`, `controlerIdentifiants(...)`) et ré-exporte `OPTIONS`.
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

/* ------------------------------------------------------------------ les options */
// LA TABLE UNIQUE DES OPTIONS de `creerEntreprise` (chantier 9, lot 9a, 08/10/2026). Tout ce qu'une séance peut
// passer au moteur est ici, une ligne par clé : son rôle en un mot et, quand c'est sans risque, le type attendu
// (`array`, `object`, `function`, `boolean`, `string` ; `a|b` = l'un ou l'autre ; pas de `type` = aucun contrôle,
// parce que le moteur ne lit que la présence). `null` et `undefined` valent « absent ».
//
// **Une clé qui n'est pas dans cette table fait refuser la séance** (message en français qui la nomme), comme
// un `menu` inconnu : une faute de frappe (`quay`, `finFigé`) n'est plus une option silencieusement ignorée.
// **Ajouter une option au moteur = ajouter sa ligne ici**, puis sa ligne dans la table de `activites/FICHE-SEANCE.md`
// (« Les options de `creerEntreprise` »). Un test relit le code : une clé lue par le moteur (`U` suivi d'un point et de la clé) et absente
// d'ici fait tomber la suite.
export const OPTIONS = {
  // — L'entreprise (la fabrique `seanceEntreprise` les tire de l'univers ; les neuf sont exigées) —
  ENTREPRISE: { type: 'object', role: "identité de l'entreprise (nom, sous-titre, logo, consigne par défaut)" },
  VOCAB: { type: 'object', role: "mots de l'entreprise (unité, taille…)" },
  CATALOGUE: { type: 'object', role: 'articles : { MODELS, MM, VARIANTS, VM }' },
  SUPPLIERS: { type: 'array', role: 'fournisseurs' },
  SUP_BY_ID: { type: 'object', role: 'fournisseurs rangés par identifiant' },
  CUSTOMERS: { type: 'array', role: 'clients' },
  CM: { type: 'object', role: 'clients rangés par identifiant' },
  baseDeDepart: { type: 'function', role: "(prénom, { aisance }) → base de départ de l'élève" },
  THEME: { type: 'object', role: "charte de l'entreprise (papier, accent, surAccent, sombre)" },
  // — La séance : jalons, textes, base —
  etapes: { type: 'array', role: 'jalons de la séance (le score est le nombre de jalons réussis)' },
  accueil: { type: 'object', role: "marche à suivre de l'écran d'accueil" },
  volet: { type: 'object', role: "messages et livraisons semés dans la base de l'élève, déclencheurs" },
  exercice: { type: 'string', role: 'ligne de consigne sous « Bonjour {prénom} »' },
  trame: { type: 'object', role: 'liens trame et corrigé du bandeau : { pdf, docx }' },
  sansTrame: { type: 'string', role: "phrase du bandeau quand tout se fait à l'écran (ignorée si `trame`)" },
  copie: { type: 'boolean', role: 'évaluation : copie rendue une seule fois, note figée' },
  // — Les écrans —
  menu: { type: 'array', role: 'écrans de données gardés au menu (sans lui, tous restent)' },
  fermetures: { type: 'object', role: "écrans fermés tant qu'une condition est fausse : { écran: { ouvertSi(db), message } }" },
  stockOuvert: { type: 'boolean', role: "écran Stock ouvert sans le code de l'enseignant" },
  receptionLitige: { type: 'boolean', role: 'décision « En litige » au bon de réception' },
  lexique: { type: 'object', role: 'mots cliquables : { MOT: définition }' },
  transportSection: { type: 'string', role: 'nom du groupe de menu qui porte plan et tournée (« Transport » par défaut)' },
  transportId: { type: 'string', role: "clé de `db.transport` partagée entre deux séances (sinon l'id de la séance)" },
  // — Les vues (une vue n'existe que si la séance la déclare) —
  plan: { type: 'object', role: 'plan schématique ou carte réelle (`plan.carte`)' },
  tournee: { type: 'object', role: 'tournée à construire sur le plan' },
  quai: { type: 'object|function', role: 'quai de réception ; une fonction de la graine = un quai tiré par élève' },
  planning: { type: 'object', role: 'planning : cartes sur une grille' },
  entrepot: { type: 'object', role: "plan d'entrepôt (rangement, préparation, visite)" },
  inventaire: { type: 'object|function', role: 'inventaire ; une fonction de la graine = un inventaire tiré par élève' },
  tableur: { type: 'object', role: 'geste tableur (extractions, exporter, déposer)' },
  documents: { type: 'array', role: 'documents joints lus sans saisie : [{ id, titre, court, html }]' },
  documentsStyle: { type: 'string', role: 'mise en page CSS des documents joints (règles sous `.ent-doc`)' },
  fiche: { type: 'object', role: 'fiche à remplir (une seule)' },
  fiches: { type: 'array', role: 'plusieurs fiches à remplir' },
  animation: { type: 'object', role: 'animation à questions (une seule)' },
  animations: { type: 'array', role: 'plusieurs animations à questions (rare)' },
  questions: { type: 'object', role: "questions au fil et points d'étape" },
  equipe: { type: 'object', role: 'personnes citées par les questions (en plus de `questions.personnes`)' },
  // — Ce que le contenu fournit au moteur (chantier 9, lot 9b : le moteur n'importe plus aucun fichier de `contenus/`) —
  // Facultatives : la fabrique `seanceEntreprise` les prend dans l'univers (sinon dans la séance, sinon dans les options).
  couleurs: { type: 'object', role: 'noms et teintes des couleurs des variantes : { code: [nom, teinte] } (sans elle, pas de pastille)' },
  livraisons: { type: 'object', role: 'modes de livraison des commandes : { code: [libellé, prix du port] } (code inconnu : le code lui-même, port 0)' },
  // — Fin de séance, réponses —
  tirage: { role: "tirage mémorisé : une déclaration `declarerTirage({ banques, valeurs, verifier })` (core/tirage.js, chantier D-C) ; ou vrai = jeu tiré par élève sans quai ni inventaire tiré (graine posée et notée)" },
  seanceFinie: { type: 'function', role: '(db) → vrai quand la séance est finie sans jalon faux (ENT-5.6)' },
  finFige: { type: 'string', role: 'phrase du bandeau de fin quand une case fausse ne se rouvre plus' },
  reponsesFournisseur: { type: 'array', role: 'fonctions (corps, fournisseur, db, prénom) → réponse qui remplace l\'automatique' },
};

const typeDe = (v) => (Array.isArray(v) ? 'array' : typeof v);

// Le contrôle, appelé en tête de `creerEntreprise` : une clé inconnue, ou d'un type que le moteur ne sait pas lire,
// empêche la séance de se charger.
export function controlerOptions(U) {
  if (!U || typeof U !== 'object' || Array.isArray(U)) throw new Error('creerEntreprise : les options doivent être un objet.');
  const connues = Object.keys(OPTIONS);
  for (const [cle, v] of Object.entries(U)) {
    const o = Object.hasOwn(OPTIONS, cle) ? OPTIONS[cle] : null;
    if (!o) {
      const proche = connues.find((c) => c.toLowerCase() === cle.toLowerCase());
      throw new Error(`creerEntreprise : l'option « ${cle} » n'existe pas${proche ? ` (« ${proche} » ?)` : ''}. `
        + `Options connues : ${connues.join(', ')}.`);
    }
    if (v == null || !o.type) continue;
    if (!o.type.split('|').includes(typeDe(v))) {
      throw new Error(`creerEntreprise : l'option « ${cle} » doit être de type ${o.type.split('|').join(' ou ')} (reçu : ${typeDe(v)}).`);
    }
  }
}

// Les `id` des vues d'une séance : chacune en a un (texte non vide), car l'état de l'élève est rangé dessous
// (`db.quais[id]`, `db.plannings[id]`, `db.entrepots[id]`, `db.fiches[id]`, `db.animations[id]`), et deux vues de la
// même famille et de même `id` écriraient dans la même case. Appelé dès que les vues sont créées.
// `familles` : [[nom au singulier, nom au pluriel, liste de vues]].
export function controlerIdentifiants(familles) {
  for (const [nom, pluriel, liste] of familles) {
    const vus = new Set();
    liste.forEach((V, i) => {
      if (typeof V.id !== 'string' || !V.id.trim()) {
        throw new Error(`creerEntreprise : ${liste.length > 1 ? `${nom} n° ${i + 1}` : nom} sans « id » `
          + "(texte non vide exigé : l'état de l'élève est rangé sous cet identifiant).");
      }
      if (vus.has(V.id)) throw new Error(`creerEntreprise : deux ${pluriel} portent le même « id » « ${V.id} » : l'état de l'élève serait partagé.`);
      vus.add(V.id);
    });
  }
}
