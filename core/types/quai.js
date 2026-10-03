// Vue « quai de réception » — recevoir un camion sous contrainte de temps hors froid.
//
// Écrite le 03/10/2026 (chantier P1, brief `docs/briefs/MOTEUR-vue-quai.md`), d'après la
// maquette jouable v8 (`docs/briefs/picard/maquette-quai-picard.html`), qui FAIT FOI pour
// l'interaction : même déroulé, mêmes durées, mêmes textes. Le code de la maquette était
// jetable (un état global, un seul fichier) : ici on reprend le comportement, pas le code.
//
// Elle vit dans l'environnement d'entreprise (`entreprise.js`), comme l'inventaire et la
// tournée, et n'existe que si la séance déclare `quai`. Elle ne connaît AUCUNE entreprise :
// lieu, photos, camion, palettes, coûts des gestes et aides viennent de la déclaration ; les
// couleurs, du `THEME` de l'entreprise. Pilote : Picard (ENT-4.1 à 4.4).
//
// Quatre étapes, un écran par étape :
//   1. le camion arrive — BL et ticket de l'enregistreur (lu portes fermées : pas de temps hors
//      froid), puis « Oui, vous pouvez ouvrir et décharger » ;
//   2. le déchargement, animé sur la photo du quai : le temps hors froid du lot démarre à
//      l'ouverture de la porte, le chauffeur pose les palettes une à une ;
//   3. le contrôle de chaque palette — dessinée en 3D : faire le tour, sonder à cœur, lire
//      l'étiquette, compter, décider (accepter / réserves / refuser) et donner le motif ;
//   4. rentrer le lot accepté en chambre froide (le temps hors froid s'arrête), écrire les
//      réserves précises sur le BL, faire signer le chauffeur, clore.
//
// Deux temps : le TEMPS DU QUAI (simulé, chaque geste coûte des minutes) et le TEMPS HORS FROID
// du lot (un seul pour tout le lot : le transporteur décharge tout). En évaluation, un troisième,
// le TEMPS RÉEL passé : il MESURE, il ne coupe rien (décision de Tristan, 03/10/2026). Il est
// compté par l'environnement, quel que soit l'écran (`entreprise.js`), et rangé ici dans l'état.
//
// L'état vit dans la base de l'élève, sous `db.quais[<quai.id>]` : une séance, un quai.
// Les jalons et la note se lisent avec `jalonsQuai` / `noteQuai`, exportées : la séance les
// importe (`etapesQuai`) et l'écran les affiche au bilan — une seule lecture, pas deux.
//
// PLUSIEURS CAMIONS (03/10/2026, chantier P4, brief `docs/briefs/ENT-4.2-picard-deux-camions.md` §7).
// Quand `camions` en compte plus d'un :
//   - l'écran ① montre tous les camions (BL et ticket de chacun) ; une fois les tickets lus, l'élève
//     choisit le camion à décharger en premier ET une phrase de justification (`quai.ordre`) ;
//   - un seul quai : le suivant attend porte fermée, et ne se met à quai qu'une fois le précédent
//     reparti (BL signé), après une manœuvre (`quai.manoeuvre`, 3 min par défaut, construit) ;
//   - un camion qui attend peut se réchauffer (`rechauffeEnAttente`, °C par minute du temps du quai
//     écoulé avant SON ouverture) : la sonde lit la température réelle, et la décision attendue en
//     découle selon la règle du quai à trois zones (décision de Tristan, 03/10/2026) : −18 °C ou plus
//     froid, la décision déclarée ; entre `quai.seuilReserve` (−18) et `quai.seuilRefus` (−15) :
//     accepter avec réserves — température ; au-dessus de −15 °C : refuser — température ;
//   - un temps hors froid PAR CAMION : chaque lot démarre à l'ouverture de son camion et s'arrête
//     quand il entre en chambre froide ; les étapes ②③④ montrent le camion choisi.
// L'état du PREMIER camion déclaré reste à la racine de l'état (format d'ENT-4.1, inchangé : ses
// bases et ses tests restent valables) ; ceux des suivants vivent dans `suivants[i - 1]`.
// Une palette peut aussi porter plusieurs références (`refs`, une par groupe de couches : un
// comptage et une étiquette par référence) et une étiquette avant déchirée (`etiqAvant:
// 'dechiree'` : la vraie se lit sur la face arrière).
//
// QUAI « DÉJÀ RÉCEPTIONNÉ » (03/10/2026, chantier P5, brief `docs/briefs/ENT-4.3-picard-reception-de-nuit.md` §7).
// `mode: 'controle'` : un collègue a reçu le camion, les palettes sont en chambre froide, l'élève contrôle
// son travail. Pas d'étapes ni d'horloge : deux onglets, « le dossier » (BL signé, ticket, fiche de comptage
// et de sonde, tout pris dans `dossier` du contenu, donc jamais modifiable : rien n'en est rangé dans la
// base) et « en chambre froide » (palette en 3D : faire le tour, re-sonder, relire l'étiquette, recompter ;
// les relevés de l'élève à côté de ceux du collègue, sans verdict). Deux temps, comme ENT-3.3 :
//   - temps 1 « Contrôler » : on regarde, on ne corrige rien (aucun bouton « Bloquer ») ;
//   - temps 2 « Corriger », ouvert par un message déclenché (`phaseQuai: 2` dans `volet.declencheurs`, voir
//     `entreprise.js`) : « Bloquer — qualité » / « Débloquer », puis « J'ai terminé » (deux clics, définitif)
//     qui fige tout et affiche le bilan.
// Un bouton « Messagerie » mène à l'environnement (le diagnostic et la protestation s'y écrivent). Les jalons
// de la vue : la (les) palette(s) à bloquer (`bloquer: true` dans le contenu) et « aucune palette conforme
// bloquée » ; la séance ajoute les siens (messages) par `jalonsDossier: { avant(db, e), apres(db, e) }`.

// Pas d'import de `ui.js` : le corrigé d'une séance (`contenus/corriges/`) importe ce module, et la
// suite de tests charge les corrigés hors du navigateur.
const ech = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ================================================================== libellés */
export const MOTIFS = {
  aucun: 'aucun motif', temperature: 'Température non conforme', avarie: 'Cartons endommagés',
  manquant: 'Manquant', produit: 'Produit différent de la commande',
};
export const DECISIONS = { '': '— à décider —', accepter: 'Accepter', reserves: 'Accepter avec réserves', refuser: 'Refuser' };
const VUES = ['vue de l’avant', 'vue du côté droit', 'vue de l’arrière', 'vue du côté gauche'];
const QCM_TICKET = [
  { v: 'rien', lib: 'Rien à signaler, la température est restée stable', court: 'rien à signaler' },
  { v: 'bref', lib: 'Un pic très bref, sans conséquence', court: 'pic bref' },
  { v: 'long', lib: 'Une remontée qui a duré : je la signale et je sonde chaque palette à cœur', court: 'remontée qui a duré' },
];
const ETAPES = ['① Le camion arrive', '② Déchargement', '③ Contrôle des palettes', '④ Réserves et chambre froide'];
const COUTS_DEFAUT = { ticket: 2, sonder: 1, tourner: 0.5, etiquette: 0.5, compter: 1, rentrer: 3, ligne: 1, signer: 1 };

/* ==================================================================== formats */
const fmtMin = (m) => { const e = Math.floor(m), s = m - e >= 0.5; if (!e && s) return '30 s'; return s ? `${e} min 30` : `${e} min`; };
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const v1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const virgule = (n) => String(n).replace('.', ',');
const fmtT = (v) => `${String(v).replace('.', ',').replace('-', '−')} °C`;
const minutesDe = (hm) => { const [h, m] = String(hm || '06:00').split(':').map(Number); return h * 60 + (m || 0); };
const palier = (v, paliers) => { for (const [seuil, pts] of paliers) if (v <= seuil) return pts; return 0; };
// Ce que l'élève tape : « −14,2 », « -14.2 », « 2 ». Vide ou autre chose → NaN.
const nombre = (brut) => {
  const t = String(brut == null ? '' : brut).trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.');
  return t === '' || !/^[+-]?\d+(\.\d+)?$/.test(t) ? NaN : Number(t);
};

/* =================================================================== réglages */
// La déclaration de la séance, complétée de ses valeurs par défaut, et les palettes de tous les
// camions mises à plat (chacune garde le numéro de son camion). Les valeurs attendues sont
// CALCULÉES depuis la palette, jamais recopiées : cartons réels, manquants, avaries.
function reglages(Q) {
  const camions = (Q.camions || []).map((c, ci) => Object.assign({}, c, {
    // Le camion porte le nom de son fournisseur à l'écran (« camion Glaces Néviane ») ; la lettre ne sert
    // qu'aux identifiants (jalons, attributs).
    lettre: c.lettre || String.fromCharCode(65 + ci), nom: c.nom || c.fournisseur || c.lettre || String.fromCharCode(65 + ci), rechauffe: Number(c.rechauffeEnAttente) || 0 }));
  const palettes = [];
  camions.forEach((c, ci) => (c.palettes || []).forEach((p) => {
    const manque = p.manque || [], avarie = p.avarie || {};
    const reel = p.W * p.D * p.L - manque.length;
    const plus = {};
    // Palette multi-références : chaque référence occupe des couches entières ; ses cartons réels
    // sont CALCULÉS (couches × cartons par couche − ceux qui manquent dans ces couches).
    if (Array.isArray(p.refs) && p.refs.length) {
      plus.refs = p.refs.map((r) => Object.assign({}, r, {
        reel: r.couches.length * p.W * p.D - manque.filter((m) => r.couches.includes(+m.split(',')[2])).length }));
      plus.ref = plus.refs.map((r) => r.ref).join(' + ');
      plus.nom = plus.refs.map((r) => r.nom).join(' / ');
      plus.bl = plus.refs.reduce((t, r) => t + r.bl, 0);
      plus.etiq = plus.refs[0].etiq;
    }
    const bl = plus.bl != null ? plus.bl : p.bl;
    palettes.push(Object.assign({}, p, plus, { camion: ci, manque, avarie, reel,
      avaries: Object.keys(avarie).length, manquants: bl - reel }));
  }));
  const aides = Object.assign({ regleCouches: false, detailComptage: false, repere: false, chefDeQuai: false, consignes: false }, Q.aides || {});
  return {
    lieu: Object.assign({ nom: 'Quai', temp: 4, refrigere: true, chambre: { nom: 'Chambre froide', temp: -23 } }, Q.lieu || {}),
    seuil: Q.seuilHorsFroid || 30,
    seuilRefus: Q.seuilRefus != null ? Q.seuilRefus : -15,
    seuilReserve: Q.seuilReserve != null ? Q.seuilReserve : -18,
    manoeuvre: Q.manoeuvre != null ? Q.manoeuvre : 3,
    D: Object.assign({ ouverture: 0.5, parPalette: 1 }, Q.dechargement || {}),
    couts: Object.assign({}, COUTS_DEFAUT, Q.couts || {}),
    aides, camions, palettes, multi: camions.length > 1,
    controle: Q.mode === 'controle', dossier: Q.dossier || {},
    // Un second motif proposé pour CHAQUE palette (ENT-4.4 : une palette porte deux problèmes) : la
    // liste ne dit donc pas laquelle. Absent : l'écran d'ENT-4.1 à 4.3, un seul motif.
    deuxMotifs: !!Q.deuxMotifs,
    depart: minutesDe(Q.debut || (camions[0] && camions[0].arrivee)),
  };
}
// L'état propre à un camion : à la racine pour le premier, dans `suivants` pour les autres.
const camionNeuf = () => ({ ticketLu: false, ticketRep: null, decharge: false, evts: 0, froid: 0, ouvertA: null,
  rentre: false, heureRentre: null, ecrit: false, lignes: [], deballage: false, mentionEcrite: false, signe: false,
  chefVu: false, passeOutreChef: false, ordreFroidDabord: null, paroleChauffeur: '' });
const K = (e, ci) => (!ci ? e : ((e.suivants || [])[ci - 1] || camionNeuf()));
const unDecharge = (e, R) => R.camions.some((_, ci) => K(e, ci).decharge);
// La température à cœur RÉELLE d'une palette : celle de la déclaration, plus le réchauffement de
// son camion pendant le temps du quai écoulé avant l'ouverture (porte fermée, groupe froid faible).
function tempReelle(p, e, R) {
  const c = R.camions[p.camion];
  if (!c || !c.rechauffe) return p.temp;
  const k = K(e, p.camion);
  const att = Math.max(0, (k.ouvertA != null ? k.ouvertA : (e.minute || 0)) - Math.max(0, minutesDe(c.arrivee) - R.depart));
  return Math.round((p.temp + c.rechauffe * att) * 10) / 10;
}
// La palette telle qu'elle est dans CETTE réception : température réelle, et décision attendue
// recalculée pour un camion qui s'est réchauffé, selon la règle à trois zones (−18 / −15 °C).
function effective(p, e, R) {
  const temp = tempReelle(p, e, R);
  if (R.camions[p.camion].rechauffe && temp > R.seuilRefus) return Object.assign({}, p, { temp, attendu: 'refuser', motifAttendu: 'temperature', motif2Attendu: undefined });
  if (R.camions[p.camion].rechauffe && temp > R.seuilReserve) return Object.assign({}, p, { temp, attendu: 'reserves', motifAttendu: 'temperature', motif2Attendu: undefined });
  return temp === p.temp ? p : Object.assign({}, p, { temp });
}
export const dureeDechargement = (n, D) => D.ouverture + n * D.parPalette;

/* ======================================================================= état */
// Le jour de la séance (« aaaa-mm-jj », heure locale) : la date de la réception de nuit sur le BL.
const aujourdhui = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const jourAffiche = (j) => (j ? j.split('-').reverse().join('/') : '');
export function etatNeuf(Q) {
  const R = reglages(Q);
  if (R.controle) {
    const pal = {};
    R.palettes.forEach((p) => { pal[p.id] = paletteNeuve(); });
    return { v: 1, mode: 'controle', phase: 1, jour: aujourdhui(), reel: 0, tiersTemps: false, sel: 0, onglet: 'dossier',
      palettes: pal, fini: false, termine: null };
  }
  const palettes = {};
  R.palettes.forEach((p) => { palettes[p.id] = paletteNeuve(); });
  const e = Object.assign({ v: 1, etape: 1, minute: 0, reel: 0, tiersTemps: false, sel: 0, journal: [], palettes, fini: false }, camionNeuf());
  if (R.multi) Object.assign(e, { suivants: R.camions.slice(1).map(camionNeuf), ordre: { premier: null, phrase: null }, actif: 0 });
  return e;
}
const paletteNeuve = () => ({ vue: 0, vues: [0], sonde: null, compte: null, etiqVue: false, detail: {}, decision: '', motif: 'aucun', res: '', motif2: 'aucun', res2: '' });

// Une base écrite avec une autre version du contenu : on complète sans rien effacer.
function normaliser(e, R) {
  if (!e.palettes) e.palettes = {};
  R.palettes.forEach((p) => { if (!e.palettes[p.id]) e.palettes[p.id] = paletteNeuve(); });
  if (R.controle) {
    if (!(e.phase >= 1)) e.phase = 1;
    if (!e.jour) e.jour = aujourdhui();
    if (e.onglet !== 'chambre') e.onglet = 'dossier';
    if (!(e.sel >= 0 && e.sel < R.palettes.length)) e.sel = 0;
    if (typeof e.reel !== 'number') e.reel = 0;
    return;
  }
  if (!Array.isArray(e.journal)) e.journal = [];
  if (!Array.isArray(e.lignes)) e.lignes = [];
  if (typeof e.reel !== 'number') e.reel = 0;
  if (e.sel >= R.palettes.length) e.sel = 0;
  if (R.multi) {
    if (!Array.isArray(e.suivants)) e.suivants = [];
    while (e.suivants.length < R.camions.length - 1) e.suivants.push(camionNeuf());
    if (!e.ordre) e.ordre = { premier: null, phrase: null };
    if (!(e.actif >= 0 && e.actif < R.camions.length)) e.actif = 0;
  }
}

/* ===================================================================== bilan */
// Ce que la réserve doit préciser, selon le motif choisi par l'élève.
const CHAMP_RES = {
  temperature: { lib: 'Température à cœur relevée (°C)', mode: 'decimal', attendu: (p) => p.temp, egal: (v, p) => Math.abs(nombre(v) - p.temp) < 0.05 },
  produit: { lib: 'Référence réellement livrée (lue sur l’étiquette)', mode: 'text', attendu: (p) => p.etiq.ref, egal: (v, p) => String(v).trim().toUpperCase() === String(p.etiq.ref).toUpperCase() },
  avarie: { lib: 'Nombre de cartons endommagés', mode: 'numeric', attendu: (p) => p.avaries, egal: (v, p) => nombre(v) === p.avaries },
  manquant: { lib: 'Nombre de cartons manquants', mode: 'numeric', attendu: (p) => p.manquants, egal: (v, p) => nombre(v) === p.manquants },
  aucun: { lib: 'Nombre de cartons concernés', mode: 'numeric', attendu: () => '?', egal: () => false },
};
// Une ligne de réserve : un constat par motif (deux pour une palette à deux problèmes, ENT-4.4).
// `motifs` : [[motif, valeur saisie], …].
function texteLigne(p, decision, motifs) {
  const vide = (v) => v === '' || v === undefined || v === null;
  const pl = (v) => (String(v).trim() === '1' ? '' : 's'); // « 1 carton manquant », « 2 cartons manquants »
  const L = motifs.length ? motifs : [['aucun', '']];
  if (decision === 'refuser') {
    const pourquoi = L.map(([motif, v]) => {
      const val = vide(v) ? '…' : v, s = pl(v);
      return motif === 'temperature' ? `température à cœur ${vide(v) ? '…' : fmtT(v)} (−18 °C exigé)`
        : motif === 'produit' ? `produit livré ${val} au lieu de ${p.ref} commandé`
          : motif === 'avarie' ? `${val} carton${s} endommagé${s}` : motif === 'manquant' ? `${val} carton${s} manquant${s}` : 'motif non précisé';
    }).join(' ; ');
    return `${p.id} ${p.ref} : palette REFUSÉE — ${pourquoi}. ${p.reel} cartons repris par le chauffeur.`;
  }
  const quoi = L.map(([motif, v]) => {
    const val = vide(v) ? '…' : v, s = pl(v);
    return motif === 'avarie' ? `${val} carton${s} endommagé${s} (écrasé${s})`
      : motif === 'manquant' ? `manque ${val} carton${s} (BL ${p.bl}, reçu ${vide(v) ? '…' : p.bl - (+nombre(v))})`
        : motif === 'temperature' ? `température à cœur ${vide(v) ? '…' : fmtT(v)} (−18 °C exigé)` : motif === 'produit' ? `référence livrée ${val}` : 'réserve sans motif';
  }).join(' ; ');
  return `${p.id} ${p.ref} : acceptée sous réserve — ${quoi}.`;
}
// Les motifs attendus d'une palette (un, ou deux avec `motif2Attendu`) et ceux choisis par l'élève
// (le second menu n'existe que si la séance déclare `deuxMotifs`), sans « aucun » ni doublon.
const motifsAttendus = (p) => [p.motifAttendu, p.motif2Attendu].filter((m) => m && m !== 'aucun');
const motifsChoisis = (s) => [...new Set([s.motif, s.motif2].filter((m) => m && m !== 'aucun'))];
const memesMotifs = (p, s) => { const a = motifsAttendus(p), c = motifsChoisis(s); return a.length === c.length && a.every((m) => c.includes(m)); };
export const libMotifs = (L) => (L.length ? L.map((m) => MOTIFS[m]).join(' + ') : MOTIFS.aucun);
// La valeur saisie pour un motif : `res` pour le premier menu, `res2` pour le second.
const valeurDe = (s, m) => (s.motif === m ? s.res : s.motif2 === m ? s.res2 : '');
const ligneAttendue = (p) => texteLigne(p, p.attendu, motifsAttendus(p).map((m) => [m, CHAMP_RES[m].attendu(p)]));
// Une décision juste demande la palette sondée ; et, quand l'étiquette avant est déchirée, un refus
// « produit différent » demande d'avoir lu l'étiquette arrière (la seule preuve).
const paletteJuste = (p, s) => s.decision === p.attendu && memesMotifs(p, s) && s.sonde !== null
  && !(p.etiqAvant === 'dechiree' && p.motifAttendu === 'produit' && !(s.etiqLues || []).includes('arriere'));
// Le comptage : un total, ou un nombre par référence pour une palette multi-références.
const compteJuste = (p, s) => (p.refs ? p.refs.every((r) => s.comptes && +s.comptes[r.ref] === r.reel && s.comptes[r.ref] !== '') : s.compte === p.reel);

// Les jalons, dans l'ordre de la maquette (fonction `jalons()`). `compte: false` : ligne affichée
// au bilan (le détail du comptage, en guidage) mais qui ne compte pas. Aucun jalon n'est vrai par
// inaction : « mention non ajoutée » demande des réserves écrites, « lot rentré » un geste.
export function jalonsQuai(db, Q) {
  const R = reglages(Q);
  if (R.controle) return jalonsControle(db, Q, R);
  const e = db && db.quais && db.quais[Q.id];
  const L = [];
  let pts = 0, max = 0;
  const j = (id, lib, fait, attendu, ok, compte = true) => {
    if (compte) { max++; if (ok) pts++; }
    L.push({ id, lib, fait, attendu, ok: !!ok, compte });
  };
  const s0 = paletteNeuve();
  const E = e || etatNeuf(Q);
  const M = R.multi;
  const suff = (c) => (M ? `-${c.lettre}` : '');
  const libC = (lib, c) => (M ? `${lib} (camion ${c.nom})` : lib);
  // L'ordre des camions et sa justification : un seul jalon, les deux à la fois.
  if (M && Q.ordre) {
    const O = Q.ordre, o = E.ordre || {}, ph = Object.fromEntries((O.phrases || []).map((x) => [x.v, x.lib]));
    const cP = R.camions[O.premier] || R.camions[0];
    const fait = o.premier != null && unDecharge(E, R) ? `camion ${R.camions[o.premier].nom} d’abord — « ${ph[o.phrase] || 'sans justification'} »` : 'pas encore choisi';
    j('ordre', 'Ordre de déchargement et justification', fait, `camion ${cP.nom} d’abord — « ${ph[O.juste] || O.juste} »`,
      !!e && unDecharge(E, R) && o.premier === O.premier && o.phrase === O.juste);
  }
  R.camions.forEach((c, ci) => {
    const k = K(E, ci);
    const lib = Object.fromEntries((c.qcmTicket && c.qcmTicket.choix || QCM_TICKET).map((x) => [x.v, x.court || x.lib]));
    const attenduTicket = (c.qcmTicket && c.qcmTicket.attendu) || 'long';
    j(`ticket${suff(c)}`, libC('Enregistreur', c), k.ticketLu ? (lib[k.ticketRep] || 'lu, sans réponse') : 'non lu',
      `${lib[attenduTicket] || attenduTicket}${attenduTicket === 'long' ? ', à signaler' : ''}`, !!e && k.ticketLu && k.ticketRep === attenduTicket);
  });
  const PE = R.palettes.map((p) => effective(p, E, R));
  PE.forEach((p) => {
    const s = (E.palettes && E.palettes[p.id]) || s0;
    if (R.aides.detailComptage) {
      const d = s.detail || {}, couche = p.W * p.D, haut = p.manque.length;
      const okD = +d.dCouche === couche && +d.dCouches === p.L && +(d.dManque || 0) === haut;
      j(`${p.id}-detail`, `${p.id} détail`, d.dCouche ? `${d.dCouche} par couche × ${d.dCouches || '?'} couches − ${d.dManque || 0}` : 'non rempli',
        `${couche} par couche × ${p.L} couches − ${haut}`, okD, false);
    }
    if (p.refs) {
      const c = s.comptes || {};
      j(`${p.id}-comptage`, `${p.id} comptage (${p.refs.length} références)`,
        p.refs.some((r) => c[r.ref] != null && c[r.ref] !== '') ? p.refs.map((r) => `${r.ref} : ${c[r.ref] ?? '?'}`).join(' · ') : 'pas compté',
        p.refs.map((r) => `${r.ref} : ${r.reel} (BL ${r.bl})`).join(' · '), compteJuste(p, s));
    } else {
      j(`${p.id}-comptage`, `${p.id} comptage`, s.compte === null ? 'pas compté' : `${s.compte} cartons`, `${p.reel} cartons (BL : ${p.bl})`, s.compte === p.reel);
    }
    const fait = s.decision ? `${DECISIONS[s.decision]} — ${libMotifs(motifsChoisis(s))}${s.sonde === null ? ' (sans sonder)' : ''}` : 'sans contrôle ni décision';
    j(`${p.id}-decision`, `${p.id} décision`, fait, `${DECISIONS[p.attendu]} — ${libMotifs(motifsAttendus(p))}`, paletteJuste(p, s));
  });
  // Une ligne de réserve par palette qui en demande une ; pour un camion qui peut se réchauffer, ses
  // palettes ont TOUJOURS un jalon de réserve (le nombre de jalons ne dépend pas du parcours) :
  // « aucune ligne » est juste quand la palette est acceptée, une fois les papiers écrits.
  PE.forEach((p) => {
    const k = K(E, p.camion);
    if (p.attendu === 'accepter' && !R.camions[p.camion].rechauffe) return;
    const l = k.ecrit ? k.lignes.find((x) => x.id === p.id) : null;
    if (p.attendu === 'accepter') {
      j(`${p.id}-reserve`, `${p.id} réserve écrite`, l ? l.texte : (k.ecrit ? 'aucune ligne' : 'réserves non écrites'), 'aucune ligne : palette acceptée', k.ecrit && !l);
      return;
    }
    j(`${p.id}-reserve`, `${p.id} réserve écrite`, l ? l.texte : (k.ecrit ? 'aucune ligne' : 'réserves non écrites'), ligneAttendue(p), !!l && l.juste);
  });
  const KS = R.camions.map((_, ci) => K(E, ci));
  if (M) {
    j('deballage', 'Mention « sous réserve de déballage » (tous les BL)', KS.some((k) => k.mentionEcrite) ? 'ajoutée' : 'non ajoutée',
      'non ajoutée (aucune valeur juridique)', KS.every((k) => k.ecrit && !k.mentionEcrite));
  } else {
    j('deballage', 'Mention « sous réserve de déballage »', E.mentionEcrite ? 'ajoutée' : 'non ajoutée', 'non ajoutée (aucune valeur juridique)', E.ecrit && !E.mentionEcrite);
  }
  R.camions.forEach((c, ci) => j(`signature${suff(c)}`, libC('Signature du chauffeur sous les réserves', c), KS[ci].signe ? 'obtenue' : 'pas de signature', 'obtenue', KS[ci].signe));
  R.camions.forEach((c, ci) => j(`rentre${suff(c)}`, libC('Lot rentré en chambre froide', c), KS[ci].rentre ? `oui, après ${fmtMin(KS[ci].froid)} hors froid` : 'non', 'oui', KS[ci].rentre));
  return { L, pts, max };
}

// Quai « déjà réceptionné » : les jalons du contenu sur les messages (`jalonsDossier.avant`, le diagnostic),
// ceux de la vue sur le blocage, puis ceux du contenu après (`apres`, la protestation). Aucun n'est vrai par
// inaction : « aucune palette conforme bloquée » demande d'avoir bloqué quelque chose.
function jalonsControle(db, Q, R) {
  const e = db && db.quais && db.quais[Q.id];
  const L = [];
  let pts = 0, max = 0;
  const ajouter = (l) => {
    const compte = l.compte !== false;
    if (compte) { max++; if (l.ok) pts++; }
    L.push(Object.assign({}, l, { ok: !!l.ok, compte }));
  };
  const D = Q.jalonsDossier || {};
  // Un jalon de contenu qui plante sur une base incomplète ne fait rien tomber : il manque, c'est tout.
  const lire = (f) => { try { return (f && f(db || {}, e || null)) || []; } catch (x) { return []; } };
  lire(D.avant).forEach(ajouter);
  const s = (p) => (e && e.palettes && e.palettes[p.id]) || {};
  const aBloquer = R.palettes.filter((p) => p.bloquer);
  const bloquees = R.palettes.filter((p) => s(p).bloque);
  aBloquer.forEach((p) => ajouter({ id: `${p.id}-bloquee`, lib: `${p.id} bloquée (qualité)`, fait: s(p).bloque ? 'bloquée' : 'non bloquée',
    attendu: 'bloquée', ok: !!s(p).bloque }));
  const aTort = bloquees.filter((p) => !p.bloquer);
  ajouter({ id: 'bloque-autres', lib: 'Aucune palette conforme bloquée',
    fait: bloquees.length ? `bloquée${bloquees.length > 1 ? 's' : ''} : ${bloquees.map((p) => p.id).join(', ')}` : 'aucune palette bloquée',
    attendu: `seulement ${aBloquer.map((p) => p.id).join(', ')}`, ok: bloquees.length > 0 && !aTort.length });
  lire(D.apres).forEach(ajouter);
  return { L, pts, max };
}

// Les étapes à donner à `creerEntreprise` : un jalon compté = une étape du suivi.
export function etapesQuai(Q) {
  const ids = jalonsQuai({}, Q).L.filter((l) => l.compte);
  return ids.map(({ id, lib }) => ({
    id, titre: lib,
    verifier(db) {
      const l = jalonsQuai(db, Q).L.find((x) => x.id === id);
      return { status: l && l.ok ? 'ok' : 'attente' };
    },
  }));
}

// Les étapes d'un quai TIRÉ PAR ÉLÈVE (ENT-4.4, `core/tirage.js`) : `quaiDe(graine)` rend la
// déclaration du quai d'une graine. Les identifiants des jalons dépendent du jeu (la réserve écrite
// de P3 n'existe que si P3 porte un aléa) : l'étape n° k est donc le k-ième jalon compté du jeu DE LA
// BASE lue. Le tirage garantit la même structure à tous (même nombre de jalons, dans le même ordre :
// la suite de tests le vérifie sur des centaines de graines).
export function etapesQuaiTire(quaiDe, graineDeBase) {
  const ref = jalonsQuai({}, quaiDe('')).L.filter((l) => l.compte);
  let nRes = 0;
  return ref.map((l, k) => ({
    id: `j${k + 1}`,
    titre: /-reserve$/.test(l.id) ? `Réserve écrite n° ${++nRes}` : l.lib,
    verifier(db) {
      const L = jalonsQuai(db, quaiDe(graineDeBase(db))).L.filter((x) => x.compte);
      return { status: L[k] && L[k].ok ? 'ok' : 'attente' };
    },
  }));
}

// La note d'évaluation sur 20 (brief §6) : 15 points de réception (jalons) + 5 de rapidité
// (hors froid et temps réel), seulement si la réception est COMPLÈTE, et en proportion des
// palettes justes. Seuils et poids viennent de `quai.note` (réglage du contenu).
export function noteQuai(db, Q) {
  const R = reglages(Q);
  const N = Object.assign({ reception: 15, horsFroid: [[20, 3], [25, 2], [30, 1]], reel: [[12, 2], [16, 1]], tiersTemps: 4 / 3 }, Q.note || {});
  const e = (db && db.quais && db.quais[Q.id]) || etatNeuf(Q);
  const { L, pts, max } = jalonsQuai(db, Q);
  const s = (p) => (e.palettes && e.palettes[p.id]) || paletteNeuve();
  const KS = R.camions.map((_, ci) => K(e, ci));
  const complet = R.palettes.every((p) => s(p).decision) && KS.every((k) => k.rentre && k.signe);
  const justes = R.palettes.filter((p) => paletteJuste(effective(p, e, R), s(p))).length;
  const prop = R.palettes.length ? justes / R.palettes.length : 0;
  const fac = e.tiersTemps ? N.tiersTemps : 1;
  // Plusieurs camions : la rapidité se lit sur le lot resté le plus longtemps hors du froid.
  const froidMax = Math.max(0, ...KS.map((k) => k.froid || 0));
  const ptsFroid = KS.every((k) => k.decharge) ? palier(froidMax, N.horsFroid) : 0;
  const ptsReel = palier((e.reel || 0) / 60, N.reel.map(([m, p]) => [m * fac, p]));
  const maxVitesse = (N.horsFroid[0] ? N.horsFroid[0][1] : 0) + (N.reel[0] ? N.reel[0][1] : 0);
  const vitesse = complet ? (ptsFroid + ptsReel) * prop : 0;
  const reception = max ? pts / max * N.reception : 0;
  const note = Math.round((reception + vitesse) * 100) / 100;
  return { score: note, max: N.reception + maxVitesse, L, pts, nJalons: max, complet, justes, nPalettes: R.palettes.length,
    prop, ptsFroid, ptsReel, vitesse, reception, froid: froidMax, reel: e.reel || 0, tiersTemps: !!e.tiersTemps, N, fac };
}

/* ============================================================ palette en 3D */
// Projection isométrique. Rotation de la palette : on change les coordonnées (i, j) selon la vue.
function tourner(i, j, W, D, r) {
  if (r === 0) return [i, j];
  if (r === 1) return [D - 1 - j, i];
  if (r === 2) return [W - 1 - i, D - 1 - j];
  return [j, W - 1 - i];
}
function tournerDir([dx, dy], r) {
  if (r === 0) return [dx, dy];
  if (r === 1) return [-dy, dx];
  if (r === 2) return [-dx, -dy];
  return [dy, -dx];
}
function palette3d(p, s, repereOn) {
  const r = s.vue, W2 = (r % 2) ? p.D : p.W, D2 = (r % 2) ? p.W : p.D;
  const S = 34, H = 26;
  const cx = 230 + (D2 - W2) * S * 0.866 / 2;
  const base = 330 - (W2 + D2) * S * 0.5;
  const P = (a, b, z) => [cx + (a - b) * S * 0.866, base + (a + b) * S * 0.5 - z * H];
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#5e4424" stroke-width="1" ${extra}/>`;
  let o = '';
  const z0 = -0.55, z1 = 0;
  o += poly([P(0, 0, z1), P(W2, 0, z1), P(W2, D2, z1), P(0, D2, z1)], '#c9a46b');
  o += poly([P(W2, 0, z0), P(W2, D2, z0), P(W2, D2, z1), P(W2, 0, z1)], '#a07a43');
  o += poly([P(0, D2, z0), P(W2, D2, z0), P(W2, D2, z1), P(0, D2, z1)], '#8a6634');
  const manque = new Set(p.manque);
  // Carton repère : en vue de face, le plus haut à gauche (i = 0, j = D-1, couche la plus haute présente).
  let kRep = p.L - 1; while (kRep > 0 && manque.has(`0,${p.D - 1},${kRep}`)) kRep--;
  const repere = repereOn ? `0,${p.D - 1},${kRep}` : null;
  const boites = [];
  for (let k = 0; k < p.L; k++) for (let i = 0; i < p.W; i++) for (let j = 0; j < p.D; j++) {
    if (manque.has(`${i},${j},${k}`)) continue;
    const [a, b] = tourner(i, j, p.W, p.D, r);
    const av = p.avarie[`${i},${j},${k}`];
    boites.push({ a, b, k, av: av ? tournerDir(av, r) : null, rep: `${i},${j},${k}` === repere });
  }
  boites.sort((x, y) => (x.a + x.b + x.k) - (y.a + y.b + y.k) || x.k - y.k);
  const fr = tournerDir([0, 1], r), frb = tournerDir([0, -1], r);
  // Multi-références : chaque carton appartient à la référence de sa couche (bande de couleur sur ses
  // côtés, étiquette de SA référence). Étiquette avant déchirée : on en pose aussi sur la face arrière.
  const refDe = (k) => (p.refs ? p.refs.find((x) => x.couches.includes(k)) : null);
  const arriere = p.etiqAvant === 'dechiree';
  for (const { a, b, k, av, rep } of boites) {
    const top = [P(a, b, k + 1), P(a + 1, b, k + 1), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    const droite = [P(a + 1, b, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a + 1, b, k + 1)];
    const gauche = [P(a, b + 1, k), P(a + 1, b + 1, k), P(a + 1, b + 1, k + 1), P(a, b + 1, k + 1)];
    o += poly(top, '#e6cfa3') + poly(droite, '#c9a26a') + poly(gauche, '#b08550');
    o += `<line x1="${((top[0][0] + top[3][0]) / 2).toFixed(1)}" y1="${((top[0][1] + top[3][1]) / 2).toFixed(1)}" x2="${((top[1][0] + top[2][0]) / 2).toFixed(1)}" y2="${((top[1][1] + top[2][1]) / 2).toFixed(1)}" stroke="#a88a5a" stroke-width="2"/>`;
    const rf = refDe(k);
    const surFace = (F) => (u, v) => [F[0][0] + (F[1][0] - F[0][0]) * u + (F[3][0] - F[0][0]) * v, F[0][1] + (F[1][1] - F[0][1]) * u + (F[3][1] - F[0][1]) * v];
    if (rf && rf.teinte) for (const F of [droite, gauche]) { const m = surFace(F); o += `<polygon data-q-bande points="${[m(0, .74), m(1, .74), m(1, .9), m(0, .9)].map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="${rf.teinte}"/>`; }
    if (rep) {
      const c = [(top[0][0] + top[2][0]) / 2, (top[0][1] + top[2][1]) / 2];
      o += `<g data-q-repere><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="15" ry="9" fill="#f6f1e4" style="stroke:var(--ardoise)" stroke-width="1.5"/><text x="${c[0].toFixed(1)}" y="${(c[1] + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--ardoise)">${ech(p.id)}</text></g>`;
    }
    // L'étiquette du carton, sur la face avant de la palette quand elle est tournée vers l'élève
    // (et sur la face arrière pour une palette dont l'étiquette avant est déchirée).
    const etiquette = (dir, cle, dechiree) => {
      const F = dir[0] === 1 && dir[1] === 0 ? droite : dir[0] === 0 && dir[1] === 1 ? gauche : null;
      if (!F) return '';
      const m = surFace(F);
      const ln = (u1, v1_, u2, v2) => `<line x1="${m(u1, v1_)[0].toFixed(1)}" y1="${m(u1, v1_)[1].toFixed(1)}" x2="${m(u2, v2)[0].toFixed(1)}" y2="${m(u2, v2)[1].toFixed(1)}" stroke="#777" stroke-width="1"/>`;
      const corps = dechiree
        ? poly([m(.3, .2), m(.52, .2), m(.46, .3), m(.58, .38), m(.5, .5), m(.62, .62), m(.3, .62)], '#f6f1e4', 'stroke-width=".6" data-q-dechiree')
        : `${poly([m(.3, .2), m(.75, .2), m(.75, .62), m(.3, .62)], '#f6f1e4', 'stroke-width=".6"')}${ln(.36, .35, .68, .35)}${ln(.36, .48, .6, .48)}`;
      return `<g class="quai-etiq-clic" data-q-etiq data-k="${ech(cle)}"><title>Lire l'étiquette</title>${corps}</g>`;
    };
    o += etiquette(fr, rf ? rf.ref : 'avant', arriere);
    if (arriere) o += etiquette(frb, 'arriere', false);
    // Carton écrasé : visible seulement si son côté abîmé fait face à l'élève.
    const face = av && av[0] === 1 && av[1] === 0 ? droite : av && av[0] === 0 && av[1] === 1 ? gauche : null;
    if (face) {
      const m = (u, v) => [face[0][0] + (face[1][0] - face[0][0]) * u + (face[3][0] - face[0][0]) * v, face[0][1] + (face[1][1] - face[0][1]) * u + (face[3][1] - face[0][1]) * v];
      o += `<g data-q-avarie>${poly([m(.15, .25), m(.5, .05), m(.85, .3), m(.75, .8), m(.35, .9), m(.2, .6)], '#6e4c22', 'opacity=".85"')}`;
      o += `<polyline points="${[m(.25, .5), m(.45, .35), m(.55, .6), m(.75, .45)].map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#2b1c0b" stroke-width="1.5"/></g>`;
    }
  }
  o += `<text x="230" y="372" text-anchor="middle" font-size="12" style="fill:var(--encre-douce)">${ech(p.id)} · ${VUES[r]}</text>`;
  return o;
}

/* ============================================ la palette filmée (vue de face) */
// Pour le déchargement et la chambre froide. (x, y) = milieu du bas de la palette ; e = échelle.
const f1 = (n) => n.toFixed(1);
const pts = (a) => a.map((q) => q.map(f1).join(',')).join(' ');
function paletteFace(p, x, y, e, o = {}) {
  const cw = 32 * e, ch = 27 * e, W = p.W, Lc = p.L, w = W * cw, h = Lc * ch;
  const dx = p.D * 7 * e, dy = p.D * 5.5 * e, hb = 13 * e;
  const X = x - w / 2, Y = y - hb;
  const manque = new Set(p.manque);
  let s = '';
  if (o.ombre !== false) s += `<ellipse cx="${f1(x + dx / 2)}" cy="${f1(y + 2 * e)}" rx="${f1(w * .62 + dx / 2)}" ry="${f1(9 * e)}" fill="#000" opacity=".28"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + dx, Y - dy]])}" fill="#b98f55"/>`;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, y - dy], [X + w, y]])}" fill="#7d5a2c"/>`;
  s += `<rect x="${f1(X)}" y="${f1(Y)}" width="${f1(w)}" height="${f1(hb * .35)}" fill="#c99d61"/>`;
  for (const u of [0, .5, 1]) {
    const bx = X + (w - 14 * e) * u;
    s += `<rect x="${f1(bx)}" y="${f1(Y + hb * .35)}" width="${f1(14 * e)}" height="${f1(hb * .65)}" fill="#a77d45"/>`;
  }
  s += `<rect x="${f1(X)}" y="${f1(y - hb * .2)}" width="${f1(w)}" height="${f1(hb * .2)}" fill="#8f6a37"/>`;
  const top = Lc - 1;
  const colPleine = (i) => { for (let j = 0; j < p.D; j++) if (!manque.has(`${i},${j},${top}`)) return true; return false; };
  for (let k = 0; k < Lc; k++) {
    for (let i = 0; i < W; i++) {
      if (k === top && !colPleine(i)) continue;
      const cx = X + i * cw, cy = Y - (k + 1) * ch;
      s += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" fill="${(i + k) % 2 ? '#d2ad73' : '#c9a265'}" stroke="#6e5128" stroke-width="${f1(Math.max(.5, .9 * e))}"/>`;
      s += `<line x1="${f1(cx)}" y1="${f1(cy + ch * .5)}" x2="${f1(cx + cw)}" y2="${f1(cy + ch * .5)}" stroke="#ad8a55" stroke-width="${f1(1.4 * e)}"/>`;
    }
  }
  const hTop = (colPleine(W - 1) ? Lc : Lc - 1) * ch, hTopG = (colPleine(0) ? Lc : Lc - 1) * ch;
  s += `<polygon points="${pts([[X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop]])}" fill="#a98450" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y - hTopG], [X + w, Y - hTop], [X + w + dx, Y - dy - hTop], [X + dx, Y - dy - hTopG]])}" fill="#e2c48e" stroke="#6e5128" stroke-width="${f1(.8 * e)}"/>`;
  s += `<polygon points="${pts([[X, Y], [X + w, Y], [X + w + dx, Y - dy], [X + w + dx, Y - dy - hTop], [X + w, Y - hTop], [X, Y - hTopG]])}" fill="url(#quaiFilm)"/>`;
  for (let u = 1; u < 4; u++) {
    const yy = Y - h * u / 4;
    s += `<line x1="${f1(X)}" y1="${f1(yy + 6 * e)}" x2="${f1(X + w + dx)}" y2="${f1(yy - dy - 4 * e)}" stroke="#fff" stroke-opacity=".22" stroke-width="${f1(1.2 * e)}"/>`;
  }
  const ew = 30 * e, eh = 22 * e, ex = X + w / 2 - ew / 2, ey = Y - h * .55;
  s += `<rect x="${f1(ex)}" y="${f1(ey)}" width="${f1(ew)}" height="${f1(eh)}" fill="#f7f4ec" stroke="#888" stroke-width="${f1(.6 * e)}"/>`;
  if (e > .3) s += `<text x="${f1(ex + ew / 2)}" y="${f1(ey + eh * .68)}" text-anchor="middle" font-size="${f1(12 * e)}" font-weight="700" fill="#0b1f6b" font-family="system-ui,sans-serif">${ech(p.id)}</text>`;
  return s;
}
const DEFS_FILM = `<linearGradient id="quaiFilm" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/>
  <stop offset=".6" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>`;

const silhouette = (t = 48) => `<svg viewBox="0 0 60 60" width="${t}" height="${t}" aria-hidden="true"><circle cx="30" cy="20" r="11" style="fill:var(--filet)"/><path d="M8 58c2-14 11-22 22-22s20 8 22 22z" style="fill:var(--filet)"/></svg>`;
function signature(c, graine) {
  const g = graine === 1 ? [18, 34, 30, 8, 46, 40] : [22, 40, 16, 6, 52, 30];
  const d = `M8 ${g[1]} C ${g[0]} 4, ${g[0] + 20} 4, ${g[0] + 10} ${g[1]} S ${g[0] + 2} 50, ${g[0] + 24} 30`
    + ` C ${g[0] + 40} ${g[2]}, ${g[0] + 50} ${g[3] + 40}, ${g[0] + 64} 28`
    + ` S ${g[0] + 86} ${g[4]}, ${g[0] + 100} 26 S ${g[0] + 124} ${g[5]}, ${g[0] + 150} 24`;
  return `<svg viewBox="0 0 190 54"><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// Au clavier seulement, on rend le focus après un redessin (charte : « conserver le focus »).
let clavier = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', () => { clavier = true; }, true);
  document.addEventListener('pointerdown', () => { clavier = false; }, true);
}
const reduit = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==================================================================== la vue */
export function creerQuai(Q, opts = {}) {
  const R = reglages(Q);
  const EVAL = !!opts.copie;
  const A = R.aides;
  const C = R.couts;
  const M = R.multi;
  // Les palettes de chaque camion ; `ca(e)` = le camion montré aux étapes ②③④ (le seul, ou celui
  // que l'élève a choisi parmi les camions déchargés).
  const PAL = R.camions.map((_, ci) => R.palettes.filter((p) => p.camion === ci));
  const cam = R.camions[0] || {};
  const ca = (e) => (M ? (e.actif || 0) : 0);
  const hhmm = (m) => { const t = R.depart + m; const h = Math.floor(t / 60) % 24, mm = Math.floor(t % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}${t % 1 ? '’30' : ''}`; };
  const formule = (ci = 0) => { const n = PAL[ci].length; return `${n} palettes × ${fmtMin(R.D.parPalette)} + ${fmtMin(R.D.ouverture)} d’ouverture = ${fmtMin(dureeDechargement(n, R.D))}`; };
  const fictif = (nom, f) => `${ech(nom)}${f ? ' (fictif)' : ''}`;
  const lieuMin = R.lieu.nom.charAt(0).toLowerCase() + R.lieu.nom.slice(1);
  const accepte = (s) => s.decision === 'accepter' || s.decision === 'reserves';
  const st = (e, p) => e.palettes[p.id];
  const nomCam = (ci) => `camion ${R.camions[ci].nom}`;
  // L'état d'écran : ce qui n'est pas du travail (chef de quai affiché, animation en cours…).
  const ui = { chef4: false, arme: false, arme4: false, armeRaz: false, msgCompte: '', anim: null, lancer: false, jouerCf: false, focus: null };

  // Chaque geste avance l'horloge du quai, et le temps hors froid de CHAQUE lot sorti du camion et
  // pas encore rentré en chambre froide.
  function avancer(e, min, texte) {
    e.minute += min;
    R.camions.forEach((_, ci) => { const k = K(e, ci); if (k.decharge && !e.fini && !k.rentre) k.froid += min; });
    e.journal.unshift(`${hhmm(e.minute)} — ${texte} (+${fmtMin(min)})`);
    if (e.journal.length > 80) e.journal.length = 80;
  }

  /* ------------------------------------------------------- déchargement animé */
  // Coordonnées dans la photo du quai (1280 × 853 pour Picard). Tout se déduit de la porte.
  const PH = Object.assign({ porte: { x0: 455, x1: 786, y0: 352, y1: 585 }, cadre: [0, 190, 1280, 663], largeur: 1280, hauteur: 853 }, Q.photos || {});
  const PORTE = PH.porte;
  const OUV = { L: PORTE.x0 + 23, R: PORTE.x1 - 23, T: PORTE.y0 + 20, B: PORTE.y1 - 19 };
  const VP = { x: (PORTE.x0 + PORTE.x1) / 2, y: PORTE.y0 + 106 }, PROF = .36;
  const SOL_Y0 = OUV.B, SOL_Y1 = PH.cadre[1] + PH.cadre[3] - 18;
  // Places au sol, de part et d'autre de l'allée centrale : les 5 de la maquette d'abord, puis
  // un rang de plus à droite, puis un second rang en retrait (ENT-4.2 en aura 8).
  const PLACES = PH.places || [[150, 800], [320, 768], [466, 738], [808, 738], [985, 768], [1150, 805], [245, 700], [1060, 700], [80, 712], [1225, 722]];
  const T_OUVRE = 900, T_PORTE = 2000, T_DEB = 2700, T_PAL = 2100, T_TRAJET = 1850;
  const fin = (n) => T_DEB + n * T_PAL + 200;
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const echelle = (y) => .42 + (y - SOL_Y0) / (SOL_Y1 - SOL_Y0) * .58;

  function interieur(restantes, N) {
    const { L, R: Rr, T, B } = OUV;
    const pr = (x, y, k) => [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k];
    const [l2, t2] = pr(L, T, PROF), [r2, b2] = pr(Rr, B, PROF);
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    let s = `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#11161b"/>`;
    s += `<rect x="${L - 14}" y="${T - 14}" width="${Rr - L + 28}" height="${B - T + 14}" fill="#a7afb5"/>`;
    s += `<rect x="${L - 4}" y="${T - 4}" width="${Rr - L + 8}" height="${B - T + 4}" fill="#3a4148"/>`;
    s += `<polygon points="${pts([[L, T], [Rr, T], [r2, t2], [l2, t2]])}" fill="#b8c1c7"/>`;
    s += `<polygon points="${pts([[L, T], [l2, t2], [l2, b2], [L, B]])}" fill="#8f999f"/>`;
    s += `<polygon points="${pts([[Rr, T], [r2, t2], [r2, b2], [Rr, B]])}" fill="#9ea7ad"/>`;
    s += `<polygon points="${pts([[L, B], [Rr, B], [r2, b2], [l2, b2]])}" fill="#5f676c"/>`;
    s += `<rect x="${f1(l2)}" y="${f1(t2)}" width="${f1(r2 - l2)}" height="${f1(b2 - t2)}" fill="#7f8a92"/>`;
    s += `<rect x="${f1(l2 + 18)}" y="${f1(t2 + 3)}" width="${f1(r2 - l2 - 36)}" height="9" rx="2" fill="#8d979f"/>`;
    s += `<line x1="${VP.x}" y1="${T + 6}" x2="${VP.x}" y2="${f1(t2 + 2)}" stroke="#ffffff" stroke-width="5" opacity=".75"/>`;
    for (const k of [.82, .64, .48]) {
      const [a, b] = pr(L, T, k), [c, d] = pr(L, B, k), [ee] = pr(Rr, T, k);
      s += `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(c)}" y2="${f1(d)}" stroke="#a7afb6" stroke-width="2"/>`;
      s += `<line x1="${f1(ee)}" y1="${f1(b)}" x2="${f1(ee)}" y2="${f1(d)}" stroke="#b5bcc2" stroke-width="2"/>`;
    }
    for (let u = 1; u < 8; u++) {
      const x = L + (Rr - L) * u / 8, [x2] = pr(x, B, PROF);
      s += `<line x1="${f1(x)}" y1="${B}" x2="${f1(x2)}" y2="${f1(b2)}" stroke="#6c757b" stroke-width="1"/>`;
    }
    // Palettes encore dans la remorque, deux par rang, les plus proches devant.
    const rangs = Math.max(1, Math.ceil(N / 2)), pas = Math.min(.24, .6 / rangs);
    const places = [];
    restantes.forEach((p, m) => {
      const rang = Math.floor(m / 2), cote = m % 2 ? 1 : -1;
      const k = 1 - rang * pas - .04;
      const [x, y] = pr(VP.x + cote * 62, B - 2, k);
      places.push([p, x, y, .42 * k]);
    });
    places.reverse().forEach(([p, x, y, e]) => { s += paletteFace(p, x, y, e, { ombre: false }); });
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#1c3442" opacity=".30"/>`;
    s += `<rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}" fill="#a9d2f0" opacity=".08"/>`;
    s += `<polygon points="${pts([[L - 6, B], [Rr + 6, B], [Rr + 20, PORTE.y1], [L - 20, PORTE.y1]])}" fill="#6b7279"/>`;
    for (let u = 0; u < 14; u++) {
      const x = L - 20 + (Rr - L + 40) * (u + .5) / 14;
      s += `<rect x="${f1(x - 7)}" y="${PORTE.y1 - 5}" width="7" height="5" fill="${u % 2 ? '#1d1d1d' : '#e3b21b'}"/>`;
    }
    return s;
  }
  // Transpalette électrique + chauffeur (silhouette sans visage).
  function transpalette(x, y, e, pas, wPal) {
    let s = '';
    const bx = x - wPal * .18, by = y + 7 * e;
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by + 2 * e)}" rx="${f1(30 * e)}" ry="${f1(6 * e)}" fill="#000" opacity=".3"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(44 * e)}" rx="${f1(5 * e)}" fill="#d9a514" stroke="#5b4508" stroke-width="${f1(e)}"/>`;
    s += `<rect x="${f1(bx - 22 * e)}" y="${f1(by - 44 * e)}" width="${f1(44 * e)}" height="${f1(10 * e)}" rx="${f1(4 * e)}" fill="#2b2b2b"/>`;
    s += `<rect x="${f1(bx - 16 * e)}" y="${f1(by - 26 * e)}" width="${f1(32 * e)}" height="${f1(4 * e)}" fill="#2b2b2b" opacity=".5"/>`;
    s += `<circle cx="${f1(bx)}" cy="${f1(by - 1 * e)}" r="${f1(6 * e)}" fill="#1c1c1c"/>`;
    const cx = bx - 58 * e, sol = by + 6 * e, b = Math.sin(pas) * 7 * e, c = '#232a31';
    const hx = cx + 16 * e, hy = sol - 92 * e;
    s += `<line x1="${f1(bx - 6 * e)}" y1="${f1(by - 42 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke="#2b2b2b" stroke-width="${f1(5 * e)}" stroke-linecap="round"/>`;
    s += `<g fill="${c}" stroke="${c}" stroke-linecap="round">`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(sol + 1 * e)}" rx="${f1(18 * e)}" ry="${f1(4 * e)}" fill="#000" stroke="none" opacity=".3"/>`;
    s += `<line x1="${f1(cx - 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx - 7 * e + b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<line x1="${f1(cx + 5 * e)}" y1="${f1(sol - 60 * e)}" x2="${f1(cx + 7 * e - b)}" y2="${f1(sol - 3 * e)}" stroke-width="${f1(10 * e)}"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 114 * e)}" width="${f1(28 * e)}" height="${f1(58 * e)}" rx="${f1(11 * e)}" stroke="none"/>`;
    s += `<line x1="${f1(cx + 8 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(hx)}" y2="${f1(hy)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<line x1="${f1(cx - 9 * e)}" y1="${f1(sol - 104 * e)}" x2="${f1(cx - 13 * e - b * .6)}" y2="${f1(sol - 70 * e)}" stroke-width="${f1(8 * e)}"/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(sol - 128 * e)}" r="${f1(12 * e)}" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 98 * e)}" width="${f1(28 * e)}" height="${f1(6 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<rect x="${f1(cx - 14 * e)}" y="${f1(sol - 80 * e)}" width="${f1(28 * e)}" height="${f1(5 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += '</g>';
    return s;
  }
  // Brume froide : l'air froid tombe et coule au sol.
  function brume(t) {
    let s = '';
    for (let n = 0; n < 14; n++) {
      const d = T_OUVRE + 300 + n * 330, u = (t - d) / 4200;
      if (u <= 0 || u >= 1) continue;
      const a = Math.sin(u * Math.PI) * .72;
      const x = VP.x + (n % 2 ? 1 : -1) * (20 + (n % 5) * 40) * u, y = SOL_Y0 - 6 + 150 * u;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(80 + 170 * u)}" ry="${f1(16 + 22 * u)}" fill="#eef5fa" opacity="${a.toFixed(2)}"/>`;
    }
    return s;
  }
  // L'image à l'instant t : les morceaux dynamiques de la scène, et la légende.
  function image(t, e, attente) {
    const P = PAL[ca(e)];
    const depart = (n) => T_DEB + n * T_PAL;
    const montee = attente ? 0 : ease((t - T_OUVRE) / T_PORTE);
    const posees = [];
    let mobile = '', enCours = null;
    P.forEach((p, n) => {
      const [xf, yf] = PLACES[n % PLACES.length];
      if (attente) return;
      if (t >= depart(n) + T_TRAJET) posees.push([p, xf, yf]);
      else if (t >= depart(n)) {
        const u = ease((t - depart(n)) / T_TRAJET);
        const x0 = VP.x, y0 = SOL_Y0 + 4, cx = VP.x + (xf - VP.x) * .12, cy = yf - 10;
        const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * xf, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * yf;
        const ee = echelle(y);
        mobile = paletteFace(p, x, y, ee) + transpalette(x, y, ee, (t - depart(n)) / 110, p.W * 32 * ee);
        enCours = n;
      }
    });
    posees.sort((a, b) => a[2] - b[2]);
    const nb = posees.length;
    let leg;
    if (attente) leg = `${hhmm(e.minute)} — Le camion est à quai, portes fermées.`;
    else if (t < T_OUVRE) leg = `${hhmm(e.minute)} — Le chauffeur ouvre les portes arrière de sa remorque.`;
    else if (t < T_DEB) leg = `${hhmm(e.minute)} — La porte du quai se lève : l'air froid s'échappe et tombe au sol. Le temps hors froid démarre.`;
    else if (nb < P.length) leg = `${hhmm(e.minute)} — Le chauffeur sort la palette ${P[enCours ?? nb].id} au transpalette (${Math.min(nb + 1, P.length)} sur ${P.length}).`;
    else leg = `${hhmm(e.minute)} — Les ${P.length} palettes sont sur le quai. Le camion attend la fin de tes contrôles.`;
    const posIds = new Set(posees.map((q) => q[0].id));
    return {
      porte: `translate(0 ${f1(-montee * (PORTE.y1 - PORTE.y0 + 3))})`,
      remorque: interieur(attente ? P : P.filter((_, n) => t < depart(n)), P.length),
      brume: attente ? '' : brume(t),
      posees: posees.map(([p, x, y]) => paletteFace(p, x, y, echelle(y))).join(''),
      mobile, leg, nb,
      pastilles: P.map((p) => `<i class="${posIds.has(p.id) ? 'sur' : ''}">${ech(p.id)}</i>`).join(''),
    };
  }
  function scene2(e) {
    const ci = ca(e), k = K(e, ci), N = PAL[ci].length, cm = R.camions[ci];
    const fini = k.evts > N, attente = !k.decharge;
    const im = image(fini ? fin(N) : 0, e, attente);
    const [cx, cy, cw, chh] = PH.cadre;
    const pw = PORTE.x1 - PORTE.x0, ph = PORTE.y1 - PORTE.y0;
    const ax = PORTE.x1 + 14;
    const tempQuai = `${R.lieu.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.temp).toFixed(1))} °C`;
    return `<div class="quai-scene2">
      <svg data-q-scene2 viewBox="${cx} ${cy} ${cw} ${chh}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${ech(R.lieu.nom)} : la porte s'ouvre, le chauffeur sort les palettes une à une au transpalette">
        <defs>
          <clipPath id="quaiCPorte"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <clipPath id="quaiCPorte2"><rect x="${PORTE.x0}" y="${PORTE.y0}" width="${pw}" height="${ph}"/></clipPath>
          <filter id="quaiFlou" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
          ${DEFS_FILM}
        </defs>
        <image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}"/>
        <g clip-path="url(#quaiCPorte)">
          <g data-g="remorque">${im.remorque}</g>
          <g data-g="porte" transform="${im.porte}"><image href="${ech(PH.quai)}" x="0" y="0" width="${PH.largeur}" height="${PH.hauteur}" clip-path="url(#quaiCPorte2)"/></g>
        </g>
        <g aria-label="Afficheur de température du quai">
          <rect x="${ax}" y="${PORTE.y0 + 14}" width="96" height="54" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text x="${ax + 48}" y="${PORTE.y0 + 30}" text-anchor="middle" font-size="10" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${ech(R.lieu.nom.toUpperCase())}</text>
          <text data-q-afficheur x="${ax + 48}" y="${PORTE.y0 + 56}" text-anchor="middle" font-size="18" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tempQuai}</text>
        </g>
        <g aria-label="Horloge du quai">
          <rect x="${ax}" y="${PORTE.y0 + 78}" width="96" height="44" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text data-q-mur-lib x="${ax + 48}" y="${PORTE.y0 + 92}" text-anchor="middle" font-size="9" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${EVAL ? 'TEMPS PASSÉ' : 'HEURE DU QUAI'}</text>
          <text data-q-mur x="${ax + 48}" y="${PORTE.y0 + 114}" text-anchor="middle" font-size="18" font-weight="700" fill="#ffd27a" font-family="ui-monospace,Consolas,monospace">${EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5)}</text>
        </g>
        <g data-g="brume" filter="url(#quaiFlou)">${im.brume}</g>
        <g data-g="posees">${im.posees}</g>
        <g data-g="mobile">${im.mobile}</g>
      </svg>
      <div class="quai-legende" data-q-leg>${ech(im.leg)}</div>
    </div>
    <div class="quai-barre2">
      <div><div class="quai-compteur2">Palettes sur le quai : <b data-q-nb>${im.nb} / ${N}</b><span class="quai-pastilles2" data-q-past>${im.pastilles}</span></div>
        <div class="note">${M ? `Camion ${ech(cm.nom)}, ${fictif(cm.transporteur, cm.fictif)} · ` : ''}Durée du déchargement : <b>${formule(ci)}</b> de temps du quai</div></div>
      <div class="quai-ligne">
        <button class="btn" data-q="passer" ${fini || attente ? 'hidden' : ''}>⏩ Passer l'animation</button>
        <button class="btn" data-q="revoir" data-libre ${fini ? '' : 'hidden'}>↺ Revoir le déchargement</button>
        <button class="btn btn-p" data-q="vers3" data-libre ${fini ? '' : 'disabled'}>Contrôler les palettes →</button>
      </div>
    </div>
    ${A.consignes ? `<p class="quai-aide">Le quai est réfrigéré (<b>${tempQuai}</b>, voir l'afficheur à droite de la porte), mais c'est bien plus chaud que la remorque à ${fmtT((cm.ticket && cm.ticket.consigne) || -20)}. Dès que la porte s'ouvre, <b>tout le lot sort du froid</b> : regarde la jauge en haut, elle a démarré. Le chauffeur pose les palettes ; à toi ensuite de les contrôler <b>vite et bien</b>, chaque geste coûte du temps.</p>` : ''}`;
  }
  // Le contrôleur de l'animation, posé sur la scène affichée. Les événements du temps du quai
  // (porte ouverte, chaque palette posée) ne passent qu'une fois, jamais en « revoir » ; s'ils
  // n'ont pas tous eu lieu quand l'écran disparaît, ils sont appliqués d'un coup.
  function evenements(e, t, ci = ca(e)) {
    let fait = false;
    const k = K(e, ci), P = PAL[ci];
    if (k.evts === 0 && t >= T_OUVRE) {
      k.evts = 1; avancer(e, R.D.ouverture, `porte du quai ouverte, début du déchargement${M ? ` du ${nomCam(ci)}` : ''}`); fait = true;
    }
    while (k.evts >= 1 && k.evts <= P.length && t >= T_DEB + (k.evts - 1) * T_PAL + T_TRAJET) {
      avancer(e, R.D.parPalette, `${P[k.evts - 1].id} posée sur le quai`); k.evts++; fait = true;
    }
    return fait;
  }
  function animer(z, e, api, rejeu) {
    const svg = z.querySelector('[data-q-scene2]');
    if (!svg) return null;
    const g = (n) => svg.querySelector(`[data-g="${n}"]`);
    const N = PAL[ca(e)].length, FIN = fin(N);
    let t = 0, t0 = null, raf = null;
    const a = {
      rejeu,
      finir() {
        cancelAnimationFrame(raf); raf = null;
        if (ui.anim === a) ui.anim = null;
        if (!rejeu && evenements(e, FIN)) api.sauver();
      },
    };
    const dessinerT = () => {
      const im = image(t, e, false);
      g('porte').setAttribute('transform', im.porte);
      g('remorque').innerHTML = im.remorque;
      g('brume').innerHTML = im.brume;
      g('posees').innerHTML = im.posees;
      g('mobile').innerHTML = im.mobile;
      const q = (s) => z.querySelector(s);
      if (q('[data-q-leg]')) q('[data-q-leg]').textContent = im.leg;
      if (q('[data-q-nb]')) q('[data-q-nb]').textContent = `${im.nb} / ${N}`;
      if (q('[data-q-past]')) q('[data-q-past]').innerHTML = im.pastilles;
    };
    const boucle = (now) => {
      if (!svg.isConnected) { a.finir(); return; }
      if (t0 === null) t0 = now - t;
      t = now - t0;
      if (!rejeu && evenements(e, t)) { api.sauver(); majHorloges(z, e); }
      dessinerT();
      if (t >= FIN) { a.finir(); api.redessiner(); return; }
      raf = requestAnimationFrame(boucle);
    };
    ui.anim = a;
    raf = requestAnimationFrame(boucle);
    return a;
  }

  /* ------------------------------------------------------ chambre froide (④) */
  function sceneCf(e, u) {
    let s = `<defs>${DEFS_FILM}</defs>`;
    s += '<rect x="0" y="0" width="640" height="300" fill="#3a4349"/>';
    s += '<polygon points="0,210 640,210 640,300 0,300" fill="#59636a"/>';
    s += '<rect x="0" y="0" width="250" height="210" fill="#d5dade"/>';
    for (let x = 0; x < 250; x += 50) s += `<line x1="${x}" y1="0" x2="${x}" y2="210" stroke="#b9c0c5" stroke-width="2"/>`;
    s += '<rect x="70" y="40" width="130" height="170" fill="#0f2233"/>';
    for (let k = 0; k < 9; k++) s += `<rect x="${72 + k * 14.2}" y="42" width="13" height="168" fill="#cfe6f7" opacity=".35"/>`;
    const tc = `${R.lieu.chambre.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.chambre.temp).toFixed(1))} °C`.replace('-', '−');
    s += `<rect x="85" y="6" width="100" height="28" rx="3" fill="#1b2228"/><text x="135" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tc}</text>`;
    s += `<text x="20" y="232" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.chambre.nom)}</text>`;
    s += '<rect x="540" y="60" width="100" height="150" fill="#cfd4d8"/><rect x="552" y="72" width="88" height="138" fill="#1d252b"/>';
    s += '<text x="590" y="232" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">Camion (refus)</text>';
    s += `<text x="320" y="292" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.nom)} · ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C</text>`;
    const P = PAL[ca(e)];
    const acc = P.filter((p) => accepte(st(e, p))), ref = P.filter((p) => !accepte(st(e, p)));
    const items = [];
    const pasA = Math.min(48, 220 / Math.max(1, acc.length));
    acc.forEach((p, k) => {
      const x0 = 300 + k * pasA, y0 = 262, uu = Math.max(0, Math.min(1, u * 1.4 - k * .1));
      const x = x0 + (135 - x0) * uu, y = y0 + (205 - y0) * uu, ee = .55 - .15 * uu;
      items.push([y, uu >= 1 ? '' : paletteFace(p, x, y, ee), uu < 1 ? 1 - uu * .9 : 0]);
    });
    const pasR = Math.min(48, 150 / Math.max(1, ref.length));
    ref.forEach((p, k) => {
      const x0 = 420 + k * pasR, y0 = 262;
      items.push([y0, paletteFace(p, x0, y0, .55) + `<text x="${x0}" y="${y0 + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#ff9a8a" font-family="system-ui">refusée</text>`, 1]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, gg, o]) => { s += `<g opacity="${o.toFixed(2)}">${gg}</g>`; });
    if (u >= 1 && acc.length) s += `<text x="135" y="130" text-anchor="middle" font-size="13" fill="#cfe6f7" font-family="system-ui">${acc.length} palettes au froid ✓</text>`;
    return s;
  }
  function jouerCf(z, e) {
    const svg = z.querySelector('[data-q-cf]');
    if (!svg) return;
    if (reduit()) { svg.innerHTML = sceneCf(e, 1); return; }
    let t0 = null;
    const pas = (now) => {
      if (!svg.isConnected) return;
      if (t0 === null) t0 = now;
      const u = Math.min(1, (now - t0) / 2600);
      svg.innerHTML = sceneCf(e, u);
      if (u < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  /* -------------------------------------------------------------- horloges */
  function horloges(e) {
    const lieu = `quai ${R.lieu.refrigere ? 'réfrigéré' : 'non réfrigéré'} ${R.lieu.temp > 0 ? '+' : ''}${virgule(R.lieu.temp)} °C`;
    // Une jauge par lot : un seul camion (format d'ENT-4.1), ou une par camion.
    const jauge = (ci) => {
      const k = K(e, ci), lt = M ? R.camions[ci].lettre : '', nm = M ? R.camions[ci].nom : '';
      const trop = k.decharge && k.froid > R.seuil && !e.fini && !k.rentre;
      const attr = (nom) => (M ? `${nom}="${lt}"` : nom);
      return `<div class="quai-horloge quai-h-froid">
        <div class="quai-lib">Temps hors froid ${M ? `du lot du camion ${ech(nm)}` : 'du lot'}</div>
        <div class="quai-val" ${attr('data-q-froid')}>${k.decharge ? `<span class="${k.froid > R.seuil ? 'quai-depasse' : ''}">${fmtMin(k.froid)}</span>` : `— <span class="note">${M ? 'porte fermée' : 'camion fermé'}</span>`}</div>
        <div class="quai-jauge"><i data-q-jauge style="width:${k.decharge ? Math.min(100, k.froid / (R.seuil * 1.5) * 100) : 0}%"></i></div>
        <div class="note" ${attr('data-q-nfroid')}>${trop
          ? (A.consignes ? '<span class="quai-depasse">Repère dépassé : la marchandise se réchauffe. Termine tes contrôles et rentre le lot.</span>' : '<span class="quai-depasse">Repère dépassé.</span>')
          : `${M ? 'démarre à l’ouverture de ce camion' : 'démarre quand le transporteur décharge'} · repère construit : ${R.seuil} min (${lieu})${k.rentre ? ' · arrêté : lot en chambre froide' : ''}`}</div>
      </div>`;
    };
    return `<div class="quai-horloges">
      <div class="quai-horloge">
        <div class="quai-lib">Horloge du quai (temps simulé)</div>
        <div class="quai-val" data-q-heure>${hhmm(e.minute)}</div>
        <div class="note">avance seulement quand tu fais un geste</div>
      </div>
      ${R.camions.map((_, ci) => jauge(ci)).join('')}
      ${EVAL ? `<div class="quai-horloge quai-h-reel">
        <div class="quai-lib">Temps passé (temps réel)</div>
        <div class="quai-val" data-q-reel>${mmss(e.reel)}</div>
        <div class="note">${e.tiersTemps ? 'mesuré, ne coupe rien · tiers-temps : seuils × 4/3' : 'mesuré, ne coupe rien : il compte dans la note de rapidité'}</div>
      </div>` : ''}
    </div>`;
  }
  // Mise à jour en place, sans redessiner (animation, chrono) : le reste de l'écran ne bouge pas.
  function majHorloges(z, e) {
    const h = z.querySelector('.quai-horloges');
    if (h) h.outerHTML = horloges(e);
    const mur = z.querySelector('[data-q-mur]');
    if (mur) mur.textContent = EVAL ? mmss(e.reel) : hhmm(e.minute).slice(0, 5);
  }

  /* ---------------------------------------------------------------- écrans */
  // Le BL d'un camion : une ligne par palette, une par référence pour une palette multi-références.
  const blHtml = (ci = 0) => `<table class="quai-bl"><thead><tr><th>Palette</th><th>Réf.</th><th>Désignation</th><th class="num">Cartons</th></tr></thead>
    <tbody>${PAL[ci].map((p) => (p.refs || [p]).map((r) => `<tr><td>${ech(p.id)}</td><td class="mono">${ech(r.ref)}</td><td>${ech(r.nom)}</td><td class="num">${r.bl}</td></tr>`).join('')).join('')}</tbody></table>`;
  function ticketTexte(ci = 0) {
    const cm = R.camions[ci], T = cm.ticket || {};
    const lignes = ['  ENREGISTREUR TEMP.  ', ` Remorque ${T.remorque || ''}  ${T.societe || ''}`, ` Consigne : ${Number(T.consigne ?? -20).toFixed(1)} C`,
      ` Depart  : ${T.depart || '00:00'}`, ' --------------------- ', '  HEURE      TEMP. C'];
    (T.releves || []).forEach(([h, t]) => lignes.push(`  ${h}      ${Number(t).toFixed(1).padStart(6)}`));
    lignes.push(' --------------------- ', ` Arrivee : ${cm.arrivee || ''}`, ' Signature chauffeur :', '', '  ~~~~~~~~~~~~~~~~~ ');
    return lignes.join('\n');
  }
  // Le ticket d'un camion et la question « ce que montre le ticket » (`data-c` : le camion).
  function blocTicket(e, ci) {
    const cm = R.camions[ci], k = K(e, ci);
    const choix = (cm.qcmTicket && cm.qcmTicket.choix) || QCM_TICKET;
    const c = M ? ` data-c="${ci}"` : '';
    return `<button class="btn" data-q="ticket"${c} ${k.ticketLu || e.fini ? 'disabled' : ''}>Lire le ticket${M ? ` du camion ${ech(cm.nom)}` : ''} <span class="quai-cout">· ${fmtMin(C.ticket)}</span></button>
      ${k.ticketLu ? `<div class="quai-ticket" data-q-ticket${M ? `="${cm.lettre}"` : ''}>${ech(ticketTexte(ci))}</div>
      <div class="quai-qcm" role="radiogroup" aria-label="Ce que montre le ticket${M ? ` du camion ${ech(cm.nom)}` : ''}">
        <b>Ce que montre le ticket :</b>
        ${choix.map((x) => `<label><input type="radio" name="quaiTicket${M ? `-${ci}` : ''}" data-q="ticketRep"${c} value="${ech(x.v)}" ${k.ticketRep === x.v ? 'checked' : ''} ${e.fini ? 'disabled' : ''}> ${ech(x.lib)}</label>`).join('')}
      </div>` : ''}`;
  }

  function ecran1(e) {
    if (M) return ecran1Multi(e);
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">
        <div class="quai-legende">${ech(cam.arrivee || '')} — ${ech(R.lieu.nom)}. Le camion de ${fictif(cam.transporteur, cam.fictif)} vient de se mettre à quai, portes fermées.</div>
      </div>
      <div class="quai-chauffeur">${silhouette()}
        <p><b>Le chauffeur :</b> « Bonjour, livraison ${ech(cam.fournisseur)} pour le ${ech(lieuMin)}. Voilà mon bon de livraison et le ticket de l'enregistreur. Je peux ouvrir ? »</p>
      </div>
      <div class="quai-grille2">
        <div class="quai-doc">
          <div class="quai-doc-titre">📄 Bon de livraison</div>
          ${blHtml()}
          <div class="quai-reconst">BL n° ${ech(cam.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">🧾 Ticket de l'enregistreur de température</div>
          ${blocTicket(e, 0)}
        </div>
      </div>
      <p class="note">Tant que les portes sont fermées, la marchandise est au froid : c'est le bon moment pour lire les papiers.</p>
      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>
        <span class="quai-cout">le chauffeur pose toutes les palettes sur le quai ; le temps hors froid démarre · durée : ${formule()}</span></p>
    </section>`;
  }

  // Plusieurs camions : les papiers de chacun, puis le choix de l'ordre et sa justification, puis
  // un camion à la fois sur l'unique quai.
  const tousLus = (e) => R.camions.every((_, ci) => K(e, ci).ticketLu);
  const auQuai = (e) => R.camions.findIndex((_, ci) => K(e, ci).decharge && !K(e, ci).signe);
  function peutDecharger(e, ci) {
    const k = K(e, ci);
    if (k.decharge || e.fini) return false;
    if (!unDecharge(e, R)) return tousLus(e) && e.ordre && e.ordre.premier === ci && !!e.ordre.phrase;
    return auQuai(e) < 0;
  }
  function boutonDecharger(e, ci) {
    const premier = !unDecharge(e, R);
    const lib = premier ? `« Oui, vous pouvez ouvrir et décharger » — camion ${ech(R.camions[ci].nom)}` : `Faire mettre à quai le camion ${ech(R.camions[ci].nom)} et décharger`;
    const cout = premier ? `durée : ${formule(ci)}` : `manœuvre ${fmtMin(R.manoeuvre)}, puis ${formule(ci)}`;
    return `<p class="quai-ligne"><button class="btn btn-p" data-q="decharger" data-c="${ci}" ${peutDecharger(e, ci) ? '' : 'disabled'}>${lib}</button>
      <span class="quai-cout">${cout}</span></p>`;
  }
  function ecran1Multi(e) {
    const O = Q.ordre || {}, o = e.ordre || {}, engage = unDecharge(e, R), lus = tousLus(e);
    const etat = (ci) => { const k = K(e, ci); return k.signe ? 'reparti, BL signé' : k.decharge ? 'à quai, porte ouverte' : 'attend porte fermée'; };
    const cartes = R.camions.map((c, ci) => `<div class="quai-doc" data-q-camion="${ech(c.lettre)}">
        <div class="quai-doc-titre">🚚 Camion ${ech(c.nom)} — arrivé à ${ech(c.arrivee || '')}</div>
        <p class="note">${fictif(c.fournisseur, c.fictif)} · transporteur ${fictif(c.transporteur, c.fictif)} · ${PAL[ci].length} palettes · <b data-q-etat-camion>${etat(ci)}</b></p>
        <div class="quai-chauffeur">${silhouette(36)}<p><b>Le chauffeur :</b> « ${ech(c.parole || `Bonjour, livraison ${c.fournisseur}. Voilà mon bon de livraison et le ticket de l'enregistreur.`)} »</p></div>
        <div class="quai-doc-titre">📄 Bon de livraison</div>
        ${blHtml(ci)}
        <div class="quai-reconst">BL n° ${ech(c.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
        <div class="quai-doc-titre" style="margin-top:10px">🧾 Ticket de l'enregistreur de température</div>
        ${blocTicket(e, ci)}
      </div>`).join('');
    const radios = (nom, q, items, val) => items.map((x) => `<label><input type="radio" name="${nom}" data-q="${q}" value="${ech(x.v)}" ${String(val) === String(x.v) ? 'checked' : ''} ${engage || e.fini ? 'disabled' : ''}> ${ech(x.lib)}</label>`).join('');
    const choix = lus ? `<div class="quai-grille2">
        <div class="quai-qcm" role="radiogroup" aria-label="Le camion à décharger en premier">${radios('quaiPremier', 'premier', R.camions.map((c, ci) => ({ v: ci, lib: `Le camion ${c.nom}` })), o.premier)}</div>
        <div class="quai-qcm" role="radiogroup" aria-label="Pourquoi"><b>Pourquoi ?</b>${radios('quaiPhrase', 'phrase', O.phrases || [], o.phrase)}</div>
      </div>` : '<p class="note">Lis d’abord le ticket de chaque camion : c’est là que se décide l’ordre.</p>';
    const suite = engage ? R.camions.map((_, ci) => (K(e, ci).decharge ? '' : boutonDecharger(e, ci))).join('')
      : (o.premier != null && R.camions[o.premier] ? boutonDecharger(e, o.premier) : '');
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">
        <div class="quai-legende">${ech(hhmm(0))} — ${ech(R.lieu.nom)}. ${['', 'Un', 'Deux', 'Trois', 'Quatre'][R.camions.length] || R.camions.length} camions frigorifiques attendent, portes fermées. Un seul quai : un camion à la fois.</div>
      </div>
      <div class="quai-grille2">${cartes}</div>
      <p class="note">Tant que les portes sont fermées, rien ne sort du froid du camion : c'est le bon moment pour lire les papiers.</p>
      <div class="quai-doc" data-q-ordre>
        <div class="quai-doc-titre">${ech(O.question || 'Quel camion faites-vous décharger en premier ?')}</div>
        ${choix}
        ${suite}
      </div>
    </section>`;
  }

  // Le choix du camion montré aux étapes ③ et ④ (seulement les camions déjà ouverts).
  const choixCamion = (e) => (M ? `<div class="quai-onglets" role="tablist" aria-label="Camion">${R.camions.map((c, ci) => (K(e, ci).decharge
    ? `<button role="tab" data-q="camion" data-libre data-c="${ci}" aria-selected="${ci === ca(e)}" class="${ci === ca(e) ? 'on' : ''}">🚚 Camion ${ech(c.nom)}<span class="quai-etat">${K(e, ci).signe ? 'reparti' : 'à quai'}</span></button>` : '')).join('')}</div>` : '');

  function zoomEtiquette(p, s, cm) {
    const cle = s.etiqMontre || (s.etiqVue ? 'avant' : null);
    if (!cle) return `<span class="note">🔍 Clique sur l'étiquette d'un carton pour la lire de près (${fmtMin(C.etiquette)}).</span>`;
    if (cle === 'avant' && p.etiqAvant === 'dechiree') {
      return `<div class="quai-etiq quai-etiq-dechiree" data-q-etiquette>${ech(cm.fournisseur)} — produit surgelé, cons…<br><i>(étiquette déchirée : la référence et la désignation sont arrachées, illisibles)</i></div>`;
    }
    const r = p.refs ? (p.refs.find((x) => x.ref === cle) || p.refs[0]) : null;
    const et = r ? r.etiq : p.etiq;
    return `<div class="quai-etiq" data-q-etiquette><b>${ech(cm.fournisseur)}</b> — produit surgelé, conserver à −18 °C<br>Réf. ${ech(et.ref)}<br><b>${ech(et.nom)}</b><br>Contenu : ${ech(et.poids)}<br>Lot : ${ech(et.lot)} · À consommer de préférence avant fin : ${ech(et.ddm)}<div class="quai-code">||| |||| || ||||| | ||| 3 760000 ${ech(String(et.ref).replace('-', ''))}</div></div><div class="quai-reconst">Étiquette reconstituée, non contractuelle.</div>`;
  }

  function ecran3(e) {
    const ci = ca(e), cm = R.camions[ci];
    const p = R.palettes[e.sel], s = st(e, p), k = K(e, p.camion);
    const fige = e.fini || k.rentre || k.ecrit;
    const dis = fige ? 'disabled' : '';
    const onglets = R.palettes.map((q, n) => {
      if (q.camion !== ci) return '';
      const sq = st(e, q);
      const compte = q.refs ? sq.comptes && Object.keys(sq.comptes).length : sq.compte !== null;
      const fait = sq.valide ? '✓ validée' : [sq.sonde !== null ? 'sondée' : null, compte ? 'comptée' : null, sq.decision ? 'décidée' : null].filter(Boolean).join(', ') || 'à contrôler';
      return `<button role="tab" data-q="sel" data-libre data-n="${n}" aria-selected="${n === e.sel}" class="${n === e.sel ? 'on' : ''}">${ech(q.id)}<span class="quai-etat">${fait}</span></button>`;
    }).join('');
    const d = s.detail || {};
    const comptage = p.refs
      ? `<div class="quai-champ"><span class="quai-lib-champ">Cartons comptés, référence par référence</span>
          ${p.refs.map((r) => `<label for="qCompte-${ech(r.ref)}">${ech(r.ref)} — ${ech(r.nom)}</label><input id="qCompte-${ech(r.ref)}" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte-ref="${ech(r.ref)}" value="${s.comptes && s.comptes[r.ref] != null ? s.comptes[r.ref] : ''}" ${dis}>`).join('')}
          <div class="quai-ligne"><button class="btn" data-q="compter" ${dis}>Noter le comptage <span class="quai-cout">· ${fmtMin(C.compter * p.refs.length)}</span></button></div>
          <span class="note" data-q-rcompte>${ui.msgCompte ? ech(ui.msgCompte) : (s.comptes ? `Comptage noté : ${p.refs.map((r) => `${r.ref} : ${s.comptes[r.ref]} (BL : ${r.bl})`).join(' · ')}.` : '')}</span>
        </div>`
      : `<div class="quai-champ">
          <label for="qCompte">Total : cartons comptés sur cette palette</label>
          <div class="quai-ligne"><input id="qCompte" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte value="${s.compte ?? ''}" ${dis}>
            <button class="btn" data-q="compter" ${dis}>Noter le comptage <span class="quai-cout">· ${fmtMin(C.compter)}</span></button></div>
          <span class="note" data-q-rcompte>${ui.msgCompte ? ech(ui.msgCompte) : (s.compte !== null ? `Comptage noté : ${s.compte} cartons (BL : ${p.bl}).` : '')}</span>
        </div>`;
    // Passer aux réserves : en haut à droite, toujours avec confirmation (qui dit ce qui n'est pas validé).
    const nonVal = PAL[ci].filter((q) => !st(e, q).valide).length;
    const vers4 = ui.arme4
      ? `<button class="btn quai-arme" data-q="vers4" data-libre>${nonVal ? `${nonVal} palette${nonVal > 1 ? 's' : ''} non validée${nonVal > 1 ? 's' : ''} : passer quand même ?` : 'Passer aux réserves ?'} Cliquez pour confirmer</button>
        <button class="btn" data-q="desarmer4" data-libre>Annuler</button>`
      : `<button class="btn${nonVal ? '' : ' btn-p'}" data-q="vers4" data-libre>Contrôles terminés → réserves et chambre froide</button>`;
    return `<section class="quai-carte">
      <div class="quai-titre-ligne">
        <h2 class="quai-h2"><span class="quai-pastille-etape">3</span>Le quai : contrôler chaque palette${M ? ` du camion ${ech(cm.nom)}` : ''}</h2>
        <div class="quai-ligne" data-q-vers4>${vers4}</div>
      </div>
      ${choixCamion(e)}
      <div class="quai-onglets" role="tablist">${onglets}</div>
      <details class="quai-rappel-bl" data-libre><summary data-libre>📄 Revoir le bon de livraison${M ? ` du camion ${ech(cm.nom)}` : ''}</summary>${blHtml(ci)}</details>
      <div class="quai-poste">
        <div class="quai-scene">
          <svg data-q-palette viewBox="0 0 460 380" role="img" aria-label="Palette ${ech(p.id)} vue en trois dimensions">${palette3d(p, s, A.repere)}</svg>
          <div class="quai-vue-lib">Côtés déjà vus : ${s.vues.length} sur 4</div>
          <button class="btn" data-q="tourner" ${dis}>↻ Faire le tour de la palette <span class="quai-cout">· ${fmtMin(C.tourner)}</span></button>
        </div>
        <div class="quai-outils">
          ${A.consignes ? '<div class="quai-aide">Pour compter sans tout compter : combien de cartons dans une couche ? combien de couches ? Puis regarde bien la couche du dessus.</div>' : ''}
          <div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur <span class="quai-cout">· ${fmtMin(C.sonder)}</span></button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur</span>` : ''}</div>
          <div class="quai-zoom">${zoomEtiquette(p, s, R.camions[p.camion])}</div>
          ${A.regleCouches ? `<div class="quai-aide">Règle du quai : sur une palette, toutes les couches <b>sous la couche du dessus</b> sont complètes. Les cartons que tu ne vois pas au cœur sont donc bien là.${A.repere ? ' Le carton marqué <b>P1, P2…</b> te sert de repère quand tu fais le tour.' : ''}</div>` : ''}
          ${A.detailComptage && !p.refs ? `<div class="quai-detail">
            <label for="qdCouche">Cartons dans une couche complète</label><input id="qdCouche" type="number" min="0" data-q-detail="dCouche" value="${ech(d.dCouche ?? '')}" ${dis}>
            <label for="qdCouches">Nombre de couches</label><input id="qdCouches" type="number" min="0" data-q-detail="dCouches" value="${ech(d.dCouches ?? '')}" ${dis}>
            <label for="qdManque">Cartons manquants dans la couche du dessus</label><input id="qdManque" type="number" min="0" data-q-detail="dManque" value="${ech(d.dManque ?? '')}" ${dis}>
          </div>` : ''}
          ${comptage}
          <div class="quai-champ"><label for="qDecision">Décision</label>
            <select id="qDecision" data-q-decision ${dis}>${Object.entries(DECISIONS).map(([kk, v]) => `<option value="${kk}" ${s.decision === kk ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="quai-champ"><label for="qMotif">Motif de la réserve ou du refus</label>
            <select id="qMotif" data-q-motif ${dis}>${Object.entries(MOTIFS).map(([kk, v]) => `<option value="${kk}" ${s.motif === kk ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          ${R.deuxMotifs ? `<div class="quai-champ"><label for="qMotif2">Second motif, si la palette a un autre problème</label>
            <select id="qMotif2" data-q-motif2 ${dis}>${Object.entries(MOTIFS).map(([kk, v]) => `<option value="${kk}" ${(s.motif2 || 'aucun') === kk ? 'selected' : ''}>${kk === 'aucun' ? 'aucun autre problème' : v}</option>`).join('')}</select></div>` : ''}
          <div class="quai-ligne"><button class="btn btn-p" data-q="valider" ${manqueValider(p, s) || e.fini ? 'disabled' : ''}>✓ Valider cette palette</button>
            <span class="note" data-q-valide>${s.valide ? 'Palette validée.' : manqueValider(p, s)}</span></div>
        </div>
      </div>
      <div class="quai-journal" aria-live="polite">${e.journal.map((l) => `<div>${ech(l)}</div>`).join('')}</div>
    </section>`;
  }

  // « Valider cette palette » (demande de Tristan, 03/10/2026) : seulement le comptage noté (chaque
  // référence d'une palette multi-références), la décision choisie, et un motif quand la décision est
  // des réserves ou un refus. Sinon, la phrase dit ce qui manque ('' = tout est rempli).
  function manqueValider(p, s) {
    const compte = p.refs ? p.refs.every((r) => s.comptes && s.comptes[r.ref] != null && s.comptes[r.ref] !== '') : s.compte !== null && s.compte !== undefined;
    const manque = [];
    if (!compte) manque.push(p.refs ? 'note le comptage de chaque référence' : 'note le comptage');
    if (!s.decision) manque.push('choisis une décision');
    else if (s.decision !== 'accepter' && (!s.motif || s.motif === 'aucun')) manque.push('donne le motif de la réserve ou du refus');
    if (!manque.length) return '';
    const t = manque.join(', ');
    return `Pour valider : ${t.charAt(0).toLowerCase()}${t.slice(1)}.`;
  }
  const aEcrire = (e, ci = 0) => PAL[ci].filter((p) => ['reserves', 'refuser'].includes(st(e, p).decision));
  const toutFini = (e) => R.camions.every((_, ci) => K(e, ci).rentre && K(e, ci).signe);
  function ecran4(e, api) {
    const ci = ca(e), k = K(e, ci), cm = R.camions[ci], P = PAL[ci], N = P.length;
    const toutDecide = P.every((p) => st(e, p).decision);
    const liste = aEcrire(e, ci);
    const nAcc = P.filter((p) => accepte(st(e, p))).length;
    let form;
    if (!toutDecide) form = `<p class="note">Décide d'abord pour chaque palette (étape 3) : il en reste ${P.filter((p) => !st(e, p).decision).length}.</p>`;
    else if (!liste.length) form = '<p class="note">Aucune palette refusée ou acceptée sous réserve : tu écriras « Néant ».</p>';
    else {
      form = liste.map((p) => {
        const s = st(e, p), c = CHAMP_RES[s.motif] || CHAMP_RES.aucun;
        const dis4 = k.signe || e.fini ? 'disabled' : '';
        // Second motif (ENT-4.4) : un second constat, une seconde valeur.
        const m2 = R.deuxMotifs && s.motif2 && s.motif2 !== 'aucun' && s.motif2 !== s.motif ? CHAMP_RES[s.motif2] : null;
        return `<div class="quai-res-ligne"><b>${ech(p.id)} — ${DECISIONS[s.decision]} · ${libMotifs(motifsChoisis(s))}</b>
          <label class="quai-res-lib">${ech(c.lib)} <input class="quai-court" id="qRes-${ech(p.id)}" data-q-res="${ech(p.id)}" type="text" inputmode="${c.mode === 'text' ? 'text' : c.mode}" value="${ech(s.res)}" ${dis4}></label>
          ${m2 ? `<label class="quai-res-lib">${ech(m2.lib)} <input class="quai-court" id="qRes2-${ech(p.id)}" data-q-res2="${ech(p.id)}" type="text" inputmode="${m2.mode === 'text' ? 'text' : m2.mode}" value="${ech(s.res2 || '')}" ${dis4}></label>` : ''}</div>`;
      }).join('');
    }
    const lignes = k.ecrit ? ((k.lignes.length ? k.lignes.map((l) => `<div>${ech(l.texte)}</div>`).join('') : '<div>Néant — marchandise reçue conforme.</div>') + (k.mentionEcrite ? '<div>Sous réserve de déballage.</div>' : '')) : '';
    const parole = k.paroleChauffeur || (k.signe ? 'C’est signé. Je recharge les palettes refusées et j’y vais. Bonne journée !' : k.ecrit ? 'Faites voir ce que vous avez écrit… Je signe ?' : 'J’attends vos papiers pour signer. Mes autres clients m’attendent aussi.');
    const prof = api.estProf;
    const ouvert = unDecharge(e, R);
    let clore;
    if (EVAL && !prof) {
      clore = `<button class="btn btn-p${ui.arme ? ' quai-arme' : ''}" data-q="clore" ${!ouvert || e.fini || !toutFini(e) || api.copieRendue() ? 'disabled' : ''}>${ui.arme ? 'Rendre définitivement ? Cliquez pour confirmer' : 'Clore la réception et rendre ma copie'}</button>
        ${ui.arme ? '<button class="btn" data-q="desarmer">Annuler</button>' : ''}`;
    } else {
      clore = `<button class="btn btn-p" data-q="clore" ${!ouvert || e.fini || !toutFini(e) ? 'disabled' : ''}>Clore la réception</button>`;
    }
    // Plusieurs camions : celui qui est reparti libère le quai pour le suivant.
    const reste = M ? R.camions.map((_, cj) => cj).filter((cj) => !K(e, cj).decharge) : [];
    const suivant = M && k.signe && reste.length && !e.fini
      ? `<div class="quai-doc" data-q-suivant><p>Le camion ${ech(cm.nom)} repart, le quai est libre. ${reste.map((cj) => `Le camion ${ech(R.camions[cj].nom)}`).join(', ')} attend porte fermée.</p>${reste.map((cj) => boutonDecharger(e, cj)).join('')}</div>` : '';
    return `<section class="quai-carte">
      <h2 class="quai-h2"><span class="quai-pastille-etape">4</span>Rentrer le lot en chambre froide, écrire les réserves, faire signer${M ? ` — camion ${ech(cm.nom)}` : ''}</h2>
      ${choixCamion(e)}
      ${A.consignes ? `<p class="quai-aide">Règle du quai : <b>le froid d'abord, les papiers ensuite</b>. 1) <b>Rentre le lot</b> accepté en chambre froide (le temps hors froid s'arrête). 2) <b>Écris tes réserves sur le BL</b> et fais-les signer par le chauffeur. Le chauffeur peut attendre ; les surgelés, non.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${ui.chef4 ? `<div class="quai-alerte" role="alert" data-q-chef>
        <p><b>Le chef de quai :</b> « Attends ! Tes palettes sont toujours sur le quai. <b>Rentre d'abord le lot accepté en chambre froide</b> : le chauffeur, lui, peut attendre cinq minutes ; les surgelés, non. Les papiers, tu les feras juste après. »</p>
        <button class="btn btn-p" data-q="chefRentrer">D'accord, je rentre le lot d'abord</button>
        <button class="btn" data-q="chefPapiers">J'écris quand même les réserves</button>
      </div>` : ''}
      ${A.chefDeQuai && k.mentionEcrite ? '<div class="quai-alerte" role="alert" data-q-chef-deballage><b>Le chef de quai :</b> « « Sous réserve de déballage », ça ne te protège de rien : ça ne dit ni quoi, ni combien, ni sur quelle palette. Ce sont tes réserves précises qui comptent. »</div>' : ''}
      <div class="quai-grille2">
        <div class="quai-doc">
          <div class="quai-doc-titre">🧊 ${ech(R.lieu.chambre.nom)}</div>
          <svg class="quai-cf" data-q-cf viewBox="0 0 640 300" role="img" aria-label="Le quai et l'entrée de la chambre froide">${sceneCf(e, k.rentre ? 1 : 0)}</svg>
          <p class="note" data-q-etatcf>${k.rentre ? `Lot rentré à ${hhmm(k.heureRentre ?? e.minute)} : ${nAcc} palettes en chambre froide, ${N - nAcc} refusée(s) au quai.`
            : (toutDecide ? `${nAcc} palettes à rentrer · temps hors froid : ${fmtMin(k.froid)}.` : 'Décide d’abord pour chaque palette.')}</p>
          <button class="btn btn-p" data-q="rentrer" ${!k.decharge || !toutDecide || k.rentre || e.fini ? 'disabled' : ''}>Rentrer le lot accepté en chambre froide <span class="quai-cout">· ${fmtMin(C.rentrer)} de manutention</span></button>
          <p class="note">Les palettes refusées restent au quai et repartent dans le camion.</p>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">✍️ Tes réserves</div>
          <div>${form}</div>
          <label class="quai-res-ligne quai-case"><input type="checkbox" data-q-deballage ${k.deballage ? 'checked' : ''} ${k.signe || e.fini || !toutDecide ? 'disabled' : ''}> Ajouter la mention « Sous réserve de déballage »</label>
          <div class="quai-ligne"><button class="btn" data-q="ecrire" ${!k.decharge || !toutDecide || k.signe || e.fini ? 'disabled' : ''}>${k.ecrit ? 'Réécrire les réserves' : 'Écrire les réserves sur le BL'} <span class="quai-cout">· ${fmtMin(Math.max(1, liste.length) * C.ligne)}</span></button></div>
        </div>
      </div>
      <div class="quai-doc quai-papier">
        <div class="quai-doc-titre">📄 Bon de livraison n° ${ech(cm.bl)} — exemplaire du destinataire</div>
        ${blHtml(ci)}
        <div class="quai-zone-res"><div class="quai-lib-res">Réserves du destinataire :</div><div class="quai-manuscrit" data-q-lignes>${lignes}</div></div>
        <div class="quai-signatures">
          <div><div class="quai-lib-res">Le réceptionnaire (${ech(Q.destinataire || '')}${Q.destinataire ? ', ' : ''}${ech(R.lieu.nom)})</div><div class="quai-sig" data-q-sig-moi>${k.ecrit ? signature('#1d3a7a', 1) : ''}</div></div>
          <div><div class="quai-lib-res">Le chauffeur (${ech(cm.transporteur)})</div><div class="quai-sig" data-q-sig-chauffeur>${k.signe ? signature('#222', 2) : ''}</div></div>
        </div>
        <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
      </div>
      <div class="quai-chauffeur" data-q-parole>${silhouette(40)}<p><b>Le chauffeur :</b> « ${ech(parole)} »</p></div>
      <p class="quai-ligne"><button class="btn" data-q="signer" ${!k.ecrit || k.signe || e.fini ? 'disabled' : ''}>Faire signer le chauffeur <span class="quai-cout">· ${fmtMin(C.signer)}</span></button>
        ${clore}</p>
      ${suivant}
      ${bilan(e, api)}
    </section>`;
  }

  function bilan(e, api) {
    if (!e.fini) return '';
    if (EVAL && !api.estProf) {
      return `<div class="avis" data-q-bilan>Réception close${api.copieRendue() ? ' et copie rendue' : ''}. Ton enseignant te donnera la note.</div>`;
    }
    const db = { quais: { [Q.id]: e } };
    const { L } = jalonsQuai(db, Q);
    const tableau = `<table class="quai-bilan" data-q-bilan><thead><tr><th></th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) => `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ à revoir'}${l.compte ? '' : ' <span class="note">(non compté)</span>'}</td></tr>`).join('')}</tbody></table>`;
    let teteProf = '';
    if (EVAL) {
      const n = noteQuai(db, Q);
      teteProf = `<details open class="quai-note-prof"><summary class="note">Côté enseignant : note ${v1(n.score)}/${n.max}</summary>${tableauNote(n)}</details>`;
    }
    const ordre = (k) => (k.rentre ? (k.ordreFroidDabord
      ? ' Tu as rentré le lot <b>avant</b> d’écrire les papiers : bon réflexe, le chauffeur attend, les surgelés non.'
      : ` Tu as écrit les papiers <b>avant</b> de rentrer le lot${k.passeOutreChef ? ', malgré le chef de quai' : ''} : le temps hors froid a continué de tourner pendant ce temps. <b>Règle à retenir : le froid d’abord, les papiers ensuite.</b>`) : '');
    const temps = M
      ? R.camions.map((c, ci) => {
        const k = K(e, ci);
        // Le camion qui se réchauffe : ce que son attente a coûté, lu sur la sonde.
        const tMax = Math.max(...PAL[ci].map((p) => tempReelle(p, e, R)));
        const zone = tMax > R.seuilRefus ? `, au-dessus de ${fmtT(R.seuilRefus)} : à refuser`
          : tMax > R.seuilReserve ? `, entre ${fmtT(R.seuilReserve)} et ${fmtT(R.seuilRefus)} : à accepter avec réserves (température relevée)` : '';
        const chaud = c.rechauffe && k.decharge
          ? ` Il a attendu ${fmtMin(k.ouvertA)} porte fermée, groupe froid faible : ses palettes sont sorties à ${fmtT(tMax)} à cœur${zone}.`
          : '';
        return `<p class="note" data-q-bilan-camion="${ech(c.lettre)}">Camion ${ech(c.nom)} : temps hors froid du lot ${k.decharge ? fmtMin(k.froid) : '—'} (repère ${R.seuil} min).${chaud}${ordre(k)}</p>`;
      }).join('')
      : `<p class="note">Temps hors froid du lot : ${e.decharge ? fmtMin(e.froid) : '—'} (repère ${R.seuil} min).${ordre(e)}</p>`;
    return `<div class="quai-bilan-bloc">
      <h3>Bilan de ta réception</h3>
      ${teteProf}${tableau}
      ${temps}
      <p class="note" data-q-reel-bilan>Temps réel passé : ${mmss(e.reel)} (mesuré pour caler les seuils de l'évaluation, non noté).</p>
      ${Q.bonASavoir ? `<p class="note">${Q.bonASavoir}</p>` : ''}
      ${EVAL ? '' : `<p><button class="btn${ui.armeRaz ? ' quai-arme' : ''}" data-q="recommencer">${ui.armeRaz ? 'Tout effacer et recommencer ? Cliquez pour confirmer' : 'Recommencer la réception'}</button></p>`}
    </div>`;
  }
  function tableauNote(n) {
    const sf = n.N.horsFroid.map(([m, p], i) => `${i ? '' : '≤ '}${m} min${i ? '' : ''} : ${p}`).join(' · ');
    const sr = n.N.reel.map(([m, p]) => `≤ ${v1(m * n.fac)} min : ${p}`).join(' · ');
    return `<table class="quai-note" data-q-note><tbody>
      <tr><td>Réception</td><td>${n.pts}/${n.nJalons} jalons</td><td>${v1(n.reception)} / ${n.N.reception}</td></tr>
      <tr><td>Temps hors froid</td><td>${fmtMin(n.froid)}</td><td>${n.ptsFroid} / ${n.N.horsFroid[0][1]} (${sf})</td></tr>
      <tr><td>Temps réel</td><td>${mmss(n.reel)}${n.tiersTemps ? ' (tiers-temps)' : ''}</td><td>${n.ptsReel} / ${n.N.reel[0][1]} (${sr})</td></tr>
      <tr><td>Rapidité retenue</td><td>${n.complet ? `réception complète, ${n.justes}/${n.nPalettes} palettes justes` : 'réception incomplète : pas de points de rapidité'}</td><td>${v1(n.vitesse)} / ${n.max - n.N.reception}</td></tr>
    </tbody></table>`;
  }

  /* --------------------------------------------------------------- gestes */
  function ecrireReserves(e, api, ci = ca(e)) {
    const k = K(e, ci);
    const liste = aEcrire(e, ci);
    k.lignes = liste.map((p) => {
      const s = st(e, p), pe = effective(p, e, R), choisis = motifsChoisis(s);
      // Juste : la bonne décision, les bons motifs, et pour chacun la bonne valeur (deux constats,
      // deux quantités pour une palette à deux problèmes).
      const juste = s.decision === pe.attendu && memesMotifs(pe, s)
        && choisis.every((m) => { const v = valeurDe(s, m); return v !== '' && v != null && CHAMP_RES[m].egal(v, pe); });
      const vals = choisis.map((m) => [m, valeurDe(s, m)]);
      return { id: p.id, texte: texteLigne(p, s.decision, vals), juste, vide: !vals.length || vals.some(([, v]) => String(v == null ? '' : v).trim() === '') };
    });
    avancer(e, Math.max(1, liste.length) * C.ligne, `réserves écrites sur le BL${M ? ` du ${nomCam(ci)}` : ''} (${liste.length} ligne${liste.length > 1 ? 's' : ''})`);
    k.ecrit = true; k.paroleChauffeur = ''; k.mentionEcrite = !!k.deballage;
    api.sauver(); api.redessiner();
  }
  function rentrer(e, api, ci = ca(e)) {
    const k = K(e, ci);
    const n = PAL[ci].filter((p) => accepte(st(e, p))).length;
    avancer(e, C.rentrer, `lot${M ? ` du ${nomCam(ci)}` : ''} rentré en chambre froide (${n} palettes)`);
    k.ordreFroidDabord = !k.ecrit;
    k.rentre = true; k.heureRentre = e.minute;
    ui.jouerCf = true;
    api.sauver(); api.redessiner();
  }
  function aller(e, n, api) {
    if (n > 1 && !unDecharge(e, R)) return;
    if (ui.anim) ui.anim.finir();
    e.etape = n; ui.chef4 = false; ui.msgCompte = ''; ui.arme4 = false;
    api.sauver(); api.redessiner();
    if (api.haut) api.haut();
  }
  // Ouvrir un camion. Le premier : une fois l'ordre choisi et justifié. Les suivants : quand le quai
  // est libre (camion précédent reparti), après la manœuvre de mise à quai.
  function decharger(e, ci, api) {
    const k = K(e, ci);
    if (k.decharge) return;
    if (M) {
      if (!peutDecharger(e, ci)) return;
      if (unDecharge(e, R)) avancer(e, R.manoeuvre, `${nomCam(ci)} mis à quai à la place du camion reparti`);
      e.actif = ci; e.sel = R.palettes.indexOf(PAL[ci][0]);
    }
    k.decharge = true; k.ouvertA = e.minute; k.evts = 0; e.etape = 2; ui.lancer = true; ui.chef4 = false;
    api.sauver(); api.redessiner(); if (api.haut) api.haut();
  }

  if (R.controle) return vueControle();

  /* ================================================ quai « déjà réceptionné » */
  // Voir l'en-tête du fichier. Le camion est reparti, les palettes sont en chambre froide ; tout ce que
  // le collègue a fait vient de `Q.dossier` (jamais de la base) : le temps 1 est figé par construction.
  function vueControle() {
    const DOS = R.dossier;
    const ui2 = { armeFin: false, msgCompte: '', focus: null };
    const P = PAL[0];
    const fiche = (p) => (DOS.fiche || []).find((f) => f.id === p.id) || {};
    const sc = (e, p) => e.palettes[p.id];
    const phase2 = (e) => (e.phase || 1) >= 2;
    const qui = DOS.receptionnaire || 'le collègue';
    const heure = DOS.heure || '';

    const dossierHtml = (e) => {
      const lignes = (DOS.reserves || []).map((l) => `<div>${ech(l)}</div>`).join('') || '<div>Néant.</div>';
      const tete = '<thead><tr><th>Palette</th><th class="num">Cartons comptés</th><th class="num">T° à cœur</th><th>Décision</th><th>Remarque</th></tr></thead>';
      const rangs = P.map((p) => {
        const f = fiche(p);
        return `<tr data-q-fiche="${ech(p.id)}"><td>${ech(p.id)}</td><td class="num">${ech(f.compte ?? '')}</td><td class="num">${f.temp != null ? fmtT(f.temp) : ''}</td><td>${ech(f.decision || '')}</td><td class="quai-main">${ech(f.remarque || '')}</td></tr>`;
      }).join('');
      return `<div class="quai-grille2" data-q-dossier>
        <div class="quai-doc quai-papier">
          <div class="quai-doc-titre">📄 Bon de livraison n° ${ech(cam.bl)} — exemplaire du destinataire</div>
          <p class="note">${fictif(cam.fournisseur, cam.fictif)} · transporteur ${fictif(cam.transporteur, cam.fictif)} · réceptionné le <b data-q-jour>${ech(jourAffiche(e.jour))}</b> à <b>${ech(heure)}</b>, ${ech(R.lieu.nom)}</p>
          ${blHtml(0)}
          <div class="quai-zone-res"><div class="quai-lib-res">Réserves du destinataire :</div><div class="quai-manuscrit" data-q-lignes>${lignes}</div></div>
          <div class="quai-signatures">
            <div><div class="quai-lib-res">Le réceptionnaire (${ech(Q.destinataire || '')}${Q.destinataire ? ', ' : ''}${ech(qui)})</div><div class="quai-sig">${signature('#1d3a7a', 1)}</div></div>
            <div><div class="quai-lib-res">Le chauffeur (${ech(cam.transporteur)})</div><div class="quai-sig">${signature('#222', 2)}</div></div>
          </div>
          <div class="quai-reconst">Document pédagogique, reconstitution, non contractuel.</div>
        </div>
        <div class="quai-doc">
          <div class="quai-doc-titre">🧾 Ticket de l'enregistreur de température</div>
          <div class="quai-ticket" data-q-ticket>${ech(ticketTexte(0))}</div>
          <div class="quai-reconst">Ticket reconstitué, non contractuel.</div>
        </div>
      </div>
      <div class="quai-doc quai-papier" data-q-fiche-tableau>
        <div class="quai-doc-titre">📋 ${ech(DOS.titreFiche || 'Fiche de comptage et de sonde')} — ${ech(qui)}, ${ech(heure)}</div>
        <table class="quai-bl">${tete}<tbody>${rangs}</tbody></table>
        ${DOS.mot ? `<p class="quai-main" data-q-mot>${ech(DOS.mot)}</p>` : ''}
        <div class="quai-reconst">${ech(qui)} est un personnage fictif. Document pédagogique, reconstitution, non contractuel.</div>
      </div>`;
    };

    // La chambre froide vue de face : les palettes au froid, les bloquées dans la zone à part.
    const sceneChambre = (e) => {
      let o = `<defs>${DEFS_FILM}</defs><rect x="0" y="0" width="700" height="190" fill="#2f3a42"/><rect x="0" y="150" width="700" height="40" fill="#46525a"/>`;
      o += '<rect x="470" y="12" width="222" height="170" rx="6" fill="none" stroke="#e0a090" stroke-width="2" stroke-dasharray="7 5"/>';
      o += '<text x="581" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#ffb9a8" font-family="system-ui">Zone de blocage qualité</text>';
      const tc = `${R.lieu.chambre.temp > 0 ? '+' : ''}${virgule(Number(R.lieu.chambre.temp).toFixed(1))} °C`.replace('-', '−');
      o += `<text x="12" y="24" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.chambre.nom)} · ${tc}</text>`;
      const libres = P.filter((p) => !sc(e, p).bloque), bl = P.filter((p) => sc(e, p).bloque);
      libres.forEach((p, k) => { o += paletteFace(p, 60 + k * 90, 172, 0.5); });
      bl.forEach((p, k) => {
        const x = 528 + k * 105;
        o += paletteFace(p, x, 172, 0.5);
        // L'étiquette juste au-dessus de la palette (hauteur de `paletteFace` à l'échelle 0,5).
        const y = Math.round(172 - 6.5 - p.L * 13.5 - 28);
        o += `<g data-q-etiq-bloque="${ech(p.id)}"><rect x="${x - 50}" y="${y}" width="100" height="22" rx="3" fill="#f6f1e4" stroke="#b8431b" stroke-width="2"/><text x="${x}" y="${y + 15}" text-anchor="middle" font-size="10" font-weight="700" fill="#9d2727" font-family="system-ui">BLOQUÉ — QUALITÉ</text></g>`;
      });
      return o;
    };

    const chambreHtml = (e) => {
      const p = R.palettes[e.sel], s = sc(e, p), f = fiche(p);
      const dis = e.fini ? 'disabled' : '';
      const onglets = P.map((q, n) => {
        const sq = sc(e, q);
        const fait = [sq.compte !== null ? 'recomptée' : null, sq.sonde !== null ? 'sondée' : null, sq.bloque ? 'bloquée' : null].filter(Boolean).join(', ') || 'à contrôler';
        return `<button role="tab" data-q="sel" data-libre data-n="${n}" aria-selected="${n === e.sel}" class="${n === e.sel ? 'on' : ''}">${ech(q.id)}<span class="quai-etat">${fait}</span></button>`;
      }).join('');
      const bloc = phase2(e)
        ? `<div class="quai-ligne">${s.bloque
          ? `<button class="btn" data-q="debloquer" ${dis}>Débloquer ${ech(p.id)}</button><span class="quai-constat" data-q-bloquee>🔒 Bloquée — qualité, en zone à part</span>`
          : `<button class="btn" data-q="bloquer" ${dis}>🔒 Bloquer ${ech(p.id)} — qualité</button>`}</div>`
        : '<p class="note" data-q-pas-bloquer>Temps 1 : tu contrôles, tu ne corriges rien. Le blocage s’ouvrira après ton diagnostic au chef de quai.</p>';
      const etiq = s.etiqMontre || s.etiqVue ? zoomEtiquette(p, s, cam) : '<span class="note">🔍 Clique sur l’étiquette d’un carton pour la lire de près.</span>';
      return `<svg class="quai-cf" data-q-chambre viewBox="0 0 700 190" role="img" aria-label="La chambre froide : les palettes au froid et la zone de blocage qualité">${sceneChambre(e)}</svg>
      <div class="quai-onglets" role="tablist" aria-label="Palette">${onglets}</div>
      <details class="quai-rappel-bl" data-libre><summary data-libre>📄 Revoir le bon de livraison</summary>${blHtml(0)}</details>
      <div class="quai-poste">
        <div class="quai-scene">
          <svg data-q-palette viewBox="0 0 460 380" role="img" aria-label="Palette ${ech(p.id)} vue en trois dimensions">${palette3d(p, s, false)}</svg>
          <div class="quai-vue-lib">Côtés déjà vus : ${s.vues.length} sur 4</div>
          <button class="btn" data-q="tourner" ${dis}>↻ Faire le tour de la palette</button>
        </div>
        <div class="quai-outils">
          <div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur</button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur maintenant</span>` : ''}</div>
          <p class="note">Fiche de ${ech(qui)} à ${ech(heure)} : <b data-q-fiche-temp>${f.temp != null ? fmtT(f.temp) : '—'}</b> à cœur.</p>
          <div class="quai-zoom">${etiq}</div>
          <div class="quai-champ">
            <label for="qCompte">Ton comptage : cartons sur cette palette</label>
            <div class="quai-ligne"><input id="qCompte" class="quai-court" type="number" min="0" inputmode="numeric" data-q-compte value="${s.compte ?? ''}" ${dis}>
              <button class="btn" data-q="compter" ${dis}>Noter mon comptage</button></div>
            <span class="note" data-q-rcompte>${ui2.msgCompte ? ech(ui2.msgCompte) : `${s.compte !== null ? `Ton comptage : ${s.compte} cartons · ` : ''}fiche de ${ech(qui)} : ${ech(f.compte ?? '—')} · BL : ${p.bl}.`}</span>
          </div>
          ${bloc}
        </div>
      </div>`;
    };

    const bilanControle = (e, api) => {
      if (!e.fini) return '';
      const db = api.db ? api.db() : { quais: { [Q.id]: e } };
      const { L, pts, max } = jalonsQuai(db, Q);
      return `<div class="quai-bilan-bloc">
        <h3>Bilan de ton contrôle</h3>
        <p class="note">${pts} jalon${pts > 1 ? 's' : ''} juste${pts > 1 ? 's' : ''} sur ${max}.</p>
        <table class="quai-bilan" data-q-bilan><thead><tr><th></th><th>Ce que tu as fait</th><th>Attendu</th><th></th></tr></thead><tbody>${L.map((l) => `<tr data-jalon="${ech(l.id)}"><td>${ech(l.lib)}</td><td>${ech(l.fait)}</td><td>${ech(l.attendu)}</td><td class="${l.ok ? 'quai-ok' : 'quai-ko'}">${l.ok ? '✓ juste' : '✗ à revoir'}</td></tr>`).join('')}</tbody></table>
        ${Q.bonASavoir ? `<p class="note">${Q.bonASavoir}</p>` : ''}
      </div>`;
    };

    const finHtml = (e) => {
      if (!phase2(e)) return '';
      const fin = e.fini
        ? `<p class="quai-constat" data-q-termine>Terminé à ${new Date(e.termine || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ')} : le dossier est figé.</p>`
        : `<button class="btn btn-p${ui2.armeFin ? ' quai-arme' : ''}" data-q="terminer">${ui2.armeFin ? 'C’est définitif : plus aucun changement possible. Cliquez pour confirmer' : 'J’ai terminé'}</button>
           ${ui2.armeFin ? '<button class="btn" data-q="desarmerFin">Annuler</button>' : ''}`;
      return `<div class="quai-doc" data-q-fin>
        ${DOS.rappelProtestation ? `<p class="quai-aide" data-q-rappel>${DOS.rappelProtestation}</p>` : ''}
        <div class="quai-ligne">${fin}</div>
      </div>`;
    };

    return {
      id: Q.id,
      nav: { libelle: Q.libelle || 'Quai de réception' },
      etatNeuf: () => etatNeuf(Q),
      jalons: (db) => jalonsQuai(db, Q),
      note: null,
      tic() {},
      // Le message déclenché qui ouvre le temps 2 (`phaseQuai` dans `entreprise.js`) : une fois, sans retour.
      passerPhase(e, n) { normaliser(e, R); if (n > (e.phase || 1)) e.phase = n; },
      html(e, api) {
        normaliser(e, R);
        const t2 = phase2(e);
        const bandeau = t2
          ? `<div class="quai-temps quai-temps-2" data-q-temps="2"><b>Temps 2 — Corriger.</b> ${e.fini ? 'Tu as terminé : le dossier est figé, ton bilan est en bas.' : 'Bloque ce qui doit l’être (onglet « En chambre froide »), écris au transporteur s’il le faut (Messagerie), puis « J’ai terminé ».'}</div>`
          : `<div class="quai-temps" data-q-temps="1"><b>Temps 1 — Contrôler.</b> Le travail de ${ech(qui)} est figé : tu peux tout relire, recompter, re-sonder, mais rien corriger. Quand tu sais ce qui ne va pas, envoie ton diagnostic au chef de quai (Messagerie, réponds à son message).</div>`;
        const onglet = (v, lib) => `<button role="tab" data-q="onglet" data-libre data-v="${v}" aria-selected="${e.onglet === v}" class="${e.onglet === v ? 'on' : ''}">${lib}</button>`;
        return `<div class="quai quai-controle" data-quai="${ech(Q.id)}" data-q-phase="${t2 ? 2 : 1}">
          <div class="quai-tete">
            <div><h2>${ech(Q.titre || R.lieu.nom)}</h2>
              <div class="note">Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · transporteur ${fictif(cam.transporteur, cam.fictif)} · réceptionnée à ${ech(heure)} par ${ech(qui)} (personnage fictif) · camion reparti, palettes en chambre froide</div></div>
            <button class="btn" data-q="messagerie" data-libre>✉ Messagerie</button>
          </div>
          ${Q.avertissement ? `<div class="quai-avert">${Q.avertissement}</div>` : ''}
          ${bandeau}
          <div class="quai-onglets quai-onglets-dossier" role="tablist" aria-label="Le dossier">${onglet('dossier', `📁 Le dossier de ${ech(qui)}`)}${onglet('chambre', '🧊 En chambre froide')}</div>
          <section class="quai-carte">${e.onglet === 'chambre' ? chambreHtml(e) : dossierHtml(e)}</section>
          ${finHtml(e)}
          ${bilanControle(e, api)}
        </div>`;
      },
      brancher(z, e, api) {
        const p = () => R.palettes[e.sel];
        const s = () => sc(e, p());
        const geste = (fn) => (ev, b) => { if (e.fini) return; fn(ev, b); };
        const on = (cle, fn) => z.querySelectorAll(`[data-q="${cle}"]`).forEach((b) => b.addEventListener('click', (ev) => fn(ev, b)));
        const refaire = () => { api.sauver(); api.redessiner(); };
        z.querySelectorAll('[data-q], input').forEach((el) => el.addEventListener('focus', () => {
          ui2.focus = el.id ? `#${el.id}` : el.dataset.q ? `[data-q="${el.dataset.q}"]${el.dataset.n ? `[data-n="${el.dataset.n}"]` : ''}${el.dataset.v ? `[data-v="${el.dataset.v}"]` : ''}` : null;
        }));
        if (clavier && ui2.focus) { const f = z.querySelector(ui2.focus); if (f && !f.disabled) f.focus(); }
        on('messagerie', () => { if (api.messagerie) api.messagerie(); });
        on('onglet', (ev, b) => { e.onglet = b.dataset.v === 'chambre' ? 'chambre' : 'dossier'; ui2.msgCompte = ''; refaire(); });
        on('sel', (ev, b) => { e.sel = +b.dataset.n; ui2.msgCompte = ''; refaire(); });
        on('tourner', geste(() => { const ss = s(); ss.vue = (ss.vue + 1) % 4; if (!ss.vues.includes(ss.vue)) ss.vues.push(ss.vue); refaire(); }));
        // La sonde lit la température d'AUJOURD'HUI : après des heures en chambre froide, tout est froid.
        on('sonder', geste(() => { s().sonde = p().temp; refaire(); }));
        on('compter', geste(() => {
          const v = parseInt(z.querySelector('[data-q-compte]').value, 10);
          if (Number.isNaN(v)) { ui2.msgCompte = 'Écris d’abord le nombre de cartons que tu as comptés.'; api.redessiner(); return; }
          ui2.msgCompte = ''; s().compte = v; refaire();
        }));
        z.querySelector('[data-q-palette]')?.addEventListener('click', (ev) => {
          const g = ev.target.closest('[data-q-etiq]');
          if (!g || e.fini) return;
          const cle = g.dataset.k || 'avant', ss = s();
          if (!Array.isArray(ss.etiqLues)) ss.etiqLues = [];
          ss.etiqMontre = cle; if (!ss.etiqLues.includes(cle)) ss.etiqLues.push(cle); ss.etiqVue = true;
          refaire();
        });
        // Bloquer / débloquer : seulement au temps 2, tant que « J'ai terminé » n'est pas cliqué.
        on('bloquer', geste(() => { if (!phase2(e)) return; s().bloque = true; refaire(); }));
        on('debloquer', geste(() => { if (!phase2(e)) return; s().bloque = false; refaire(); }));
        on('terminer', geste(() => {
          if (!phase2(e)) return;
          if (!ui2.armeFin) { ui2.armeFin = true; api.redessiner(); return; }
          ui2.armeFin = false; e.fini = true; e.termine = Date.now(); refaire();
        }));
        on('desarmerFin', () => { ui2.armeFin = false; api.redessiner(); });
      },
    };
  }

  return {
    id: Q.id,
    nav: { libelle: Q.libelle || 'Quai de réception' },
    etatNeuf: () => etatNeuf(Q),
    jalons: (db) => jalonsQuai(db, Q),
    note: Q.note || EVAL ? (db) => noteQuai(db, Q) : null,
    // Le jeu reçu, l'attendu et la réponse, jalon par jalon (quai tiré par élève, ENT-4.4) : rangé
    // dans le `detail` de la copie pour l'enseignant (des objets : Firestore refuse les tableaux de tableaux).
    resume: (db) => jalonsQuai(db, Q).L.filter((l) => l.compte).map((l) => ({ lib: l.lib, fait: l.fait, attendu: l.attendu, ok: l.ok })),
    // Le chrono réel, appelé chaque seconde par l'environnement : mise à jour en place.
    tic(z, e) {
      if (!z) return;
      const r = z.querySelector('[data-q-reel]');
      if (r) r.textContent = mmss(e.reel);
      const mur = z.querySelector('[data-q-mur]');
      if (mur && EVAL) mur.textContent = mmss(e.reel);
    },
    html(e, api) {
      normaliser(e, R);
      // Un déchargement interrompu (rechargement de page en pleine animation) : ce qui restait
      // du temps du quai s'applique d'un coup.
      R.camions.forEach((_, ci) => {
        const k = K(e, ci);
        if (k.decharge && k.evts <= PAL[ci].length && !ui.anim && !ui.lancer) { evenements(e, fin(PAL[ci].length), ci); api.sauver(); }
      });
      // La palette sélectionnée appartient au camion montré.
      if (M && R.palettes[e.sel] && R.palettes[e.sel].camion !== ca(e) && PAL[ca(e)].length) e.sel = R.palettes.indexOf(PAL[ca(e)][0]);
      const ouvert = unDecharge(e, R);
      const etape = ouvert ? (e.etape || 1) : 1;
      const corps = etape === 1 ? ecran1(e) : etape === 2 ? `<section class="quai-carte">${scene2(e)}</section>` : etape === 3 ? ecran3(e) : ecran4(e, api);
      const libs = M ? ['① Les camions arrivent'].concat(ETAPES.slice(1)) : ETAPES;
      const tete = M
        ? R.camions.map((c) => `Camion « ${fictif(c.nom, c.fictif)} », transporteur ${fictif(c.transporteur, c.fictif)}`).join(' · ')
        : `Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · camion frigorifique ${fictif(cam.transporteur, cam.fictif)}`;
      return `<div class="quai" data-quai="${ech(Q.id)}">
        <div class="quai-tete">
          <div><h2>${ech(Q.titre || R.lieu.nom)}</h2>
            <div class="note">${tete}</div></div>
        </div>
        ${Q.avertissement ? `<div class="quai-avert">${Q.avertissement}</div>` : ''}
        ${horloges(e)}
        <nav class="quai-stepper" aria-label="Étapes de la réception">
          ${libs.map((l, i) => `<button data-q="etape" data-libre data-n="${i + 1}" class="${etape === i + 1 ? 'on' : ''}" ${i > 0 && !ouvert ? 'disabled' : ''} ${etape === i + 1 ? 'aria-current="step"' : ''}>${l}</button>`).join('')}
        </nav>
        ${corps}
      </div>`;
    },
    brancher(z, e, api) {
      const p = () => R.palettes[e.sel];
      const s = () => st(e, p());
      const kc = () => K(e, ca(e));
      const ciDe = (b) => (b && b.dataset.c != null ? +b.dataset.c : 0);
      const geste = (fn) => (ev, b) => { if (e.fini) return; fn(ev, b); };
      const on = (cle, fn) => z.querySelectorAll(`[data-q="${cle}"]`).forEach((b) => b.addEventListener('click', (ev) => fn(ev, b)));
      // Le focus suit l'élève qui travaille au clavier d'un redessin à l'autre.
      z.querySelectorAll('[data-q], input, select').forEach((el) => el.addEventListener('focus', () => {
        ui.focus = el.id ? `#${el.id}` : el.dataset.q ? `[data-q="${el.dataset.q}"]${el.dataset.n ? `[data-n="${el.dataset.n}"]` : ''}${el.dataset.c ? `[data-c="${el.dataset.c}"]` : ''}` : null;
      }));
      if (clavier && ui.focus) { const f = z.querySelector(ui.focus); if (f && !f.disabled) f.focus(); }

      on('etape', (ev, b) => aller(e, +b.dataset.n, api));
      on('ticket', geste((ev, b) => {
        const ci = ciDe(b), k = K(e, ci);
        if (k.ticketLu) return;
        k.ticketLu = true; avancer(e, C.ticket, M ? `ticket de l’enregistreur du ${nomCam(ci)} lu` : 'ticket de l’enregistreur lu');
        api.sauver(); api.redessiner();
      }));
      z.querySelectorAll('[data-q="ticketRep"]').forEach((r) => r.addEventListener('change', () => { if (e.fini) return; K(e, ciDe(r)).ticketRep = r.value; api.sauver(); }));
      // L'ordre et sa justification : libres tant qu'aucun camion n'est ouvert.
      z.querySelectorAll('[data-q="premier"], [data-q="phrase"]').forEach((r) => r.addEventListener('change', () => {
        if (e.fini || unDecharge(e, R)) return;
        if (r.dataset.q === 'premier') e.ordre.premier = +r.value; else e.ordre.phrase = r.value;
        api.sauver(); api.redessiner();
      }));
      on('decharger', geste((ev, b) => decharger(e, ciDe(b), api)));
      on('camion', (ev, b) => {
        const ci = ciDe(b);
        if (!K(e, ci).decharge || ci === ca(e)) return;
        if (ui.anim) ui.anim.finir();
        e.actif = ci; e.sel = R.palettes.indexOf(PAL[ci][0]); ui.chef4 = false; ui.msgCompte = '';
        api.sauver(); api.redessiner();
      });
      // Le déchargement démarre dans l'écran qu'on vient de dessiner. `prefers-reduced-motion` :
      // pas d'animation, la fin directement (palettes posées, temps du quai compté).
      if (ui.lancer) {
        ui.lancer = false;
        if (reduit()) { evenements(e, fin(PAL[ca(e)].length)); api.sauver(); api.redessiner(); return; }
        animer(z, e, api, false);
      }
      on('passer', () => { if (ui.anim) ui.anim.finir(); api.redessiner(); });
      on('revoir', () => {
        if (kc().evts <= PAL[ca(e)].length) return;
        api.redessiner();
        const z2 = api.zone();
        z2.querySelector('[data-q="revoir"]')?.setAttribute('hidden', '');
        z2.querySelector('[data-q="passer"]')?.removeAttribute('hidden');
        if (!reduit()) animer(z2, e, api, true);
      });
      on('vers3', () => aller(e, 3, api));
      on('vers4', () => {
        if (!ui.arme4) { ui.arme4 = true; api.redessiner(); return; }
        aller(e, 4, api);
      });
      on('desarmer4', () => { ui.arme4 = false; api.redessiner(); });
      // Valider une palette : une coche, rien de figé (décision de Tristan, 03/10/2026). On passe à la
      // suivante non validée du même camion.
      on('valider', geste(() => {
        const pal = p();
        if (manqueValider(pal, s())) return;
        s().valide = true; ui.arme4 = false; ui.msgCompte = '';
        const L = PAL[pal.camion], i = L.indexOf(pal);
        const suite = L.slice(i + 1).concat(L.slice(0, i)).find((q) => !st(e, q).valide);
        if (suite) e.sel = R.palettes.indexOf(suite);
        api.sauver(); api.redessiner();
      }));
      on('sel', (ev, b) => { e.sel = +b.dataset.n; ui.msgCompte = ''; ui.arme4 = false; api.sauver(); api.redessiner(); });
      on('tourner', geste(() => {
        const ss = s(); ss.vue = (ss.vue + 1) % 4; if (!ss.vues.includes(ss.vue)) ss.vues.push(ss.vue);
        avancer(e, C.tourner, `${p().id} : ${VUES[ss.vue]}`); api.sauver(); api.redessiner();
      }));
      // La sonde lit la température RÉELLE (un camion qui a attendu s'est réchauffé).
      on('sonder', geste(() => { s().sonde = tempReelle(p(), e, R); avancer(e, C.sonder, `${p().id} sondée`); api.sauver(); api.redessiner(); }));
      on('compter', geste(() => {
        const pal = p();
        if (pal.refs) {
          const champs = [...z.querySelectorAll('[data-q-compte-ref]')];
          const vals = champs.map((i) => parseInt(i.value, 10));
          if (vals.some((v) => Number.isNaN(v))) { ui.msgCompte = 'Écris d’abord le nombre de cartons de chaque référence.'; api.redessiner(); return; }
          ui.msgCompte = ''; s().comptes = Object.fromEntries(champs.map((i, n) => [i.dataset.qCompteRef, vals[n]]));
          avancer(e, C.compter * pal.refs.length, `${pal.id} : ${champs.map((i, n) => `${i.dataset.qCompteRef} ${vals[n]}`).join(', ')} cartons notés`);
          api.sauver(); api.redessiner(); return;
        }
        const v = parseInt(z.querySelector('[data-q-compte]').value, 10);
        if (Number.isNaN(v)) { ui.msgCompte = 'Écris d’abord le nombre de cartons que tu as comptés.'; api.redessiner(); return; }
        ui.msgCompte = ''; s().compte = v; avancer(e, C.compter, `${pal.id} : ${v} cartons notés`); api.sauver(); api.redessiner();
      }));
      z.querySelector('[data-q-palette]')?.addEventListener('click', (ev) => {
        const g = ev.target.closest('[data-q-etiq]');
        const k = K(e, p().camion);
        if (!g || e.fini || k.rentre || k.ecrit) return;
        // Une étiquette = une face (avant, arrière) ou une référence ; chacune ne coûte qu'une fois.
        const cle = g.dataset.k || 'avant', ss = s();
        if (!Array.isArray(ss.etiqLues)) ss.etiqLues = ss.etiqVue ? ['avant'] : [];
        ss.etiqMontre = cle;
        if (!ss.etiqLues.includes(cle)) {
          ss.etiqLues.push(cle); ss.etiqVue = true;
          const quoi = cle === 'avant' ? '' : cle === 'arriere' ? ' (face arrière)' : ` (${cle})`;
          avancer(e, C.etiquette, `${p().id} : étiquette lue${quoi}`);
        }
        api.sauver(); api.redessiner();
      });
      z.querySelectorAll('[data-q-detail]').forEach((i) => i.addEventListener('input', () => { s().detail[i.dataset.qDetail] = i.value; api.sauver(); }));
      z.querySelector('[data-q-decision]')?.addEventListener('change', (ev) => { s().decision = ev.target.value; api.sauver(); api.redessiner(); });
      z.querySelector('[data-q-motif]')?.addEventListener('change', (ev) => { s().motif = ev.target.value; api.sauver(); api.redessiner(); });
      z.querySelector('[data-q-motif2]')?.addEventListener('change', (ev) => { s().motif2 = ev.target.value; api.sauver(); api.redessiner(); });
      z.querySelectorAll('[data-q-res]').forEach((i) => i.addEventListener('input', () => { e.palettes[i.dataset.qRes].res = i.value; api.sauver(); }));
      z.querySelectorAll('[data-q-res2]').forEach((i) => i.addEventListener('input', () => { e.palettes[i.dataset.qRes2].res2 = i.value; api.sauver(); }));
      z.querySelector('[data-q-deballage]')?.addEventListener('change', (ev) => { kc().deballage = ev.target.checked; api.sauver(); });
      on('rentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('ecrire', geste(() => {
        // Guidage : apprendre l'ordre (le froid d'abord, les papiers ensuite) sans l'imposer.
        const k = kc();
        if (A.chefDeQuai && !k.rentre && !k.chefVu) { k.chefVu = true; ui.chef4 = true; api.sauver(); api.redessiner(); api.zone().querySelector('[data-q-chef]')?.scrollIntoView({ block: 'center' }); return; }
        ecrireReserves(e, api);
      }));
      on('chefRentrer', geste(() => { ui.chef4 = false; rentrer(e, api); }));
      on('chefPapiers', geste(() => { ui.chef4 = false; kc().passeOutreChef = true; ecrireReserves(e, api); }));
      on('signer', geste(() => {
        const k = kc();
        // Guidage : le chauffeur refuse de signer une réserve sans valeur.
        const vides = k.lignes.filter((l) => l.vide);
        if (A.chefDeQuai && vides.length) {
          k.paroleChauffeur = `Votre réserve sur ${vides.map((l) => l.id).join(', ')} ne dit pas combien ni quoi. Une réserve pas précise, ça ne vaut rien. Complétez et je signe.`;
          api.sauver(); api.redessiner(); return;
        }
        k.signe = true; k.paroleChauffeur = '';
        avancer(e, C.signer, `BL${M ? ` du ${nomCam(ca(e))}` : ''} signé par le chauffeur, réserves comprises`);
        api.sauver(); api.redessiner();
      }));
      on('clore', geste(() => {
        if (!toutFini(e)) return;
        if (EVAL && !api.estProf) {
          if (!ui.arme) { ui.arme = true; api.redessiner(); return; }
          ui.arme = false; e.fini = true; api.sauver(); api.redessiner(); api.rendreCopie(); return;
        }
        e.fini = true; api.sauver(); api.redessiner();
      }));
      on('desarmer', () => { ui.arme = false; api.redessiner(); });
      on('recommencer', () => {
        if (!ui.armeRaz) { ui.armeRaz = true; api.redessiner(); return; }
        ui.armeRaz = false; api.recommencer();
      });
      if (ui.jouerCf) { ui.jouerCf = false; jouerCf(z, e); }
    },
  };
}
