// Picard — ENT-4.3 « La réception de nuit » (erreur induite) : le quai de la séance, ses messages, ses jalons.
//
// Brief `docs/briefs/ENT-4.3-picard-reception-de-nuit.md`. Deux temps, comme ENT-3.3 :
//   1. CONTRÔLER : Mathis (réceptionnaire de nuit, PERSONNAGE FICTIF) a reçu le camion de 3 h ; son travail est
//      figé (vue quai en `mode: 'controle'`, tout vient de `dossier` ci-dessous). L'élève relit le dossier,
//      recompte, relit, re-sonde en chambre froide, puis répond au chef de quai (message à lignes) ;
//   2. CORRIGER : la réponse du chef ouvre le temps 2 (`phaseQuai: 2`, que le diagnostic soit juste ou faux) :
//      bloquer la palette douteuse, protester auprès du transporteur (message à lignes), « J'ai terminé ».
//
// Vérifié (brief §2) : art. L133-3 du Code de commerce (protestation motivée par acte extrajudiciaire ou lettre
// recommandée dans les trois jours, jours fériés non compris) ; « sous réserve de déballage » sans valeur. Le reste
// est CONSTRUIT (voir `contenus/picard.js`) : Mathis, sa fiche, ses erreurs, les produits, les températures. Fournisseur
// et transporteur : les mêmes fictifs qu'ENT-4.1 (Surgelés du Littoral, Transports Givrex).
//
// Les palettes (3 erreurs + 1 fausse piste, brief §5) — températures d'AUJOURD'HUI, après trois heures à −23 °C :
//   N1  colin pané, couche du dessus incomplète : 4×3×4 − 4 = 44 = BL     fausse piste : ne rien signaler
//   N2  frites, fiche « −14 °C à cœur — OK », acceptée                      au-dessus de −15 : à refuser → bloquer,
//       (la sonde dit −21 °C aujourd'hui : recongelée, la preuve est dans la fiche)                protester
//   N3  épinards, fiche « 40 » (= BL) : 4×2×5 − 3 = 37 réels              manquant 3 → protester. Deux trous en haut
//       au fond, et un troisième juste dessous, dans la couche sous celle du dessus (visible de l'arrière)
//   N4  nuggets, N5 pizzas : conformes
//   BL  « Sous réserve de déballage » : sans valeur → protestation motivée dans les 3 jours (réception à 3 h 10 :
//       dans le délai)
// La date de la réception est le jour où l'élève ouvre la séance (rangée dans l'état du quai, `jour`).

import { etapesQuai } from '../core/types/quai.js';
import { nrm, nombres, apresMail } from '../core/declencheurs.js';
import { LIEU, PHOTOS, AVERTISSEMENT, releves } from './picard.js';

export const QUAI_ID = 'picard-ent43';
const ETIQ = (ref, nom, poids, lot, ddm) => ({ ref, nom, poids, lot, ddm });

export const CHEF = { nom: 'Le chef de quai', mail: 'chef.quai@picard-quai.example' };
export const MATHIS = { nom: 'Mathis, réceptionnaire de nuit', mail: 'mathis.nuit@picard-quai.example' };
export const GIVREX = { nom: 'Transports Givrex — exploitation', mail: 'exploitation@transports-givrex.example' };
export const BL = 'SL-26-1207';
export const HEURE = '03 h 10';

export const PALETTES_ENT43 = [
  { id: 'N1', ref: 'COL-400', nom: 'Filets de colin panés 400 g', bl: 44,
    etiq: ETIQ('COL-400', 'FILETS DE COLIN PANÉS', '10 × 400 g', 'L26-6011', '01/2028'),
    W: 4, D: 3, L: 4, manque: ['0,0,3', '1,0,3', '2,0,3', '3,0,3'], avarie: {}, temp: -21.4 },
  { id: 'N2', ref: 'FRI-2500', nom: 'Frites allumettes 2,5 kg', bl: 36,
    etiq: ETIQ('FRI-2500', 'FRITES ALLUMETTES', '4 × 2,5 kg', 'L26-6024', '07/2028'),
    W: 3, D: 3, L: 4, manque: [], avarie: {}, temp: -21.0, bloquer: true },
  { id: 'N3', ref: 'EPI-1000', nom: 'Épinards hachés 1 kg', bl: 40,
    etiq: ETIQ('EPI-1000', 'ÉPINARDS HACHÉS', '10 × 1 kg', 'L26-6037', '09/2028'),
    W: 4, D: 2, L: 5, manque: ['1,0,4', '2,0,4', '2,0,3'], avarie: {}, temp: -21.6 },
  { id: 'N4', ref: 'NUG-1000', nom: 'Nuggets de poulet 1 kg', bl: 45,
    etiq: ETIQ('NUG-1000', 'NUGGETS DE POULET', '8 × 1 kg', 'L26-6045', '05/2028'),
    W: 3, D: 3, L: 5, manque: [], avarie: {}, temp: -21.2 },
  { id: 'N5', ref: 'PIZ-400', nom: 'Pizzas jambon-fromage 400 g', bl: 30,
    etiq: ETIQ('PIZ-400', 'PIZZA JAMBON FROMAGE', '8 × 400 g', 'L26-6052', '02/2028'),
    W: 3, D: 2, L: 5, manque: [], avarie: {}, temp: -20.9 },
];
export const PRODUITS_ENT43 = PALETTES_ENT43;

// La fiche de Mathis, telle qu'il l'a remplie à 3 h 10 (construite). N2 : −14 °C « OK » ; N3 : 40, le chiffre du BL.
export const FICHE = [
  { id: 'N1', compte: 44, temp: -19.6, decision: 'Acceptée', remarque: 'couche du dessus pas complète' },
  { id: 'N2', compte: 36, temp: -14.0, decision: 'Acceptée', remarque: 'OK' },
  { id: 'N3', compte: 40, temp: -19.8, decision: 'Acceptée', remarque: '' },
  { id: 'N4', compte: 45, temp: -20.1, decision: 'Acceptée', remarque: '' },
  { id: 'N5', compte: 30, temp: -19.2, decision: 'Acceptée', remarque: '' },
];

// Les chiffres attendus dans les jalons et leurs libellés viennent des données ci-dessus (palettes et fiche), jamais
// recopiés : changer une palette ou la fiche change le jalon ET le texte qui le décrit.
const palette = (id) => PALETTES_ENT43.find((p) => p.id === id);
const reelles = (p) => p.W * p.D * p.L - p.manque.length;          // cartons réellement présents
const N1 = palette('N1'), N3 = palette('N3');
const N3_MANQUANT = N3.bl - reelles(N3);                            // 3 : écart entre le BL et le comptage
const TEMP_FICHE_N2 = FICHE.find((f) => f.id === 'N2').temp;        // −14 °C : ce que Mathis a écrit
const SEUIL_CONFORME = -15;                                         // surgelé : à −15 °C ou plus froid à cœur
const degres = (t) => `${t < 0 ? '−' : ''}${String(Math.abs(t)).replace('.', ',')} °C`;

// Les lignes des deux messages (brief §11 : écrites par Claude Code, à relire par Tristan en jouant).
export const LIGNES_DIAG = { palette: 'Palette acceptée à tort :', preuve: 'Preuve :', manquant: 'Manquant :', reserve: 'Réserve :', delai: 'Délai :' };
export const LIGNES_PROT = { bl: 'BL :', date: 'Réceptionné le :', palette: 'Palette :', constat: 'Constat :', quantite: 'Quantité :' };
const amorce = (L) => Object.values(L).join('\n');

export const QUAI_ENT43 = {
  id: QUAI_ID,
  mode: 'controle',
  titre: 'Entrepôt Picard de Sainghin-en-Mélantois (59) — Quai 32, la réception de nuit',
  destinataire: 'Picard',
  avertissement: AVERTISSEMENT.replace('Fournisseur,', 'Mathis (le réceptionnaire de nuit), fournisseur,'),
  bonASavoir: 'Bon à savoir : un produit surgelé qui s’est réchauffé puis a été remis au froid a perdu sa qualité, et la sonde '
    + 'du lendemain ne le voit plus. <b>La preuve est dans les documents</b> : la fiche de la réception, le ticket de l’enregistreur.',
  lieu: LIEU,
  photos: PHOTOS,
  camions: [{
    lettre: 'N', transporteur: 'Transports Givrex', fournisseur: 'Surgelés du Littoral', fictif: true, bl: BL, arrivee: '03:00',
    // Une remontée de la température de l'air qui a duré (de 1 h 15 à 2 h 30, jusqu'à −11 °C), revenue à −20 °C à l'arrivée.
    ticket: { remorque: 'FR-206', societe: 'Givrex', consigne: -20, depart: '00:00',
      releves: releves({ 75: -18.2, 90: -15.0, 105: -12.4, 120: -11.1, 135: -11.8, 150: -14.6, 165: -18.0, 180: -20.1 }, 180) },
    palettes: PALETTES_ENT43,
  }],
  dossier: {
    receptionnaire: 'Mathis',
    heure: HEURE,
    reserves: ['Sous réserve de déballage.'],
    titreFiche: 'Fiche de comptage et de sonde',
    fiche: FICHE,
    mot: 'Camion un peu en retard, j’ai fait vite. RAS, tout est rentré en chambre froide. — Mathis',
    rappelProtestation: 'Dans la vraie vie, la protestation motivée part au transporteur en <b>lettre recommandée</b> (ou par huissier) '
      + '<b>dans les 3 jours</b> qui suivent la réception, jours fériés non compris (Code de commerce, art. L133-3). Ici, tu l’écris en '
      + 'répondant à l’avis de livraison de Transports Givrex, dans la Messagerie.',
  },
  jalonsDossier: { avant: (db, e) => jalonsDiagnostic(db, e), apres: (db, e) => jalonsProtestation(db, e) },
};

/* ======================================================================== lecture des messages */

// La DERNIÈRE ligne qui commence par l'intitulé (sans accents ni majuscules ; puces et numéros tolérés),
// sans l'intitulé. `null` si aucune.
export function lire(texte, intitule, brut = false) {
  const cle = nrm(intitule).replace(/\s*:$/, '');
  const l = String(texte || '').split(/\r?\n/).filter((x) => nrm(x).replace(/^[^a-z0-9]+/, '').startsWith(cle));
  if (!l.length) return null;
  const x = l[l.length - 1];
  // `brut` : la ligne telle que l'élève l'a tapée (pour l'afficher), après le premier « : ».
  if (brut) return (x.includes(':') ? x.slice(x.indexOf(':') + 1) : x.replace(/^\s*\S+/, '')).trim();
  return nrm(x).replace(/^[^a-z0-9]+/, '').slice(cle.length).replace(/^\s*:?\s*/, '');
}
// Les palettes citées (« N2 », « n 3 »).
export const palettesCitees = (l) => [...new Set((String(l || '').match(/\bn\s?[1-5]\b/gi) || []).map((x) => x.replace(/\s/g, '').toUpperCase()))].sort();
const sansPalettes = (l) => String(l || '').replace(/\bn\s?[1-5]\b/gi, ' ');
const seules = (l, ids) => JSON.stringify(palettesCitees(l)) === JSON.stringify([...ids].sort());
// La quantité manquante : 3, ou « 37 au lieu de 40 ».
const quantiteJuste = (l) => { const n = nombres(sansPalettes(l)); return n.includes(N3_MANQUANT) || (n.includes(reelles(N3)) && n.includes(N3.bl)); };
const SANS_VALEUR = /\brien\b|aucun|sans valeur|ne vaut|vaut rien|ne sert|sert a rien|inutile|pas valable|invalide|\bnul|ne protege|protege de rien|pas une reserve|pas de valeur|pas de reserve/;
const DANS_DELAI = /dans (le|les) delai|encore|a temps|possible|\breste|\boui\b|\bok\b/;
const HORS_DELAI = /trop tard|depass|hors (du )?delai|plus possible|impossible|pas dans|plus le temps|\bnon\b/;
const MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
// La date de la réception (« 13/10/2026 », « 13/10 », « 13 octobre »).
export function dateJuste(l, jour) {
  if (!l || !jour) return false;
  const [, m, d] = jour.split('-').map(Number);
  return new RegExp(`(^|\\D)0?${d}\\s*[/.-]\\s*0?${m}(\\D|$)`).test(l) || new RegExp(`(^|\\D)0?${d}(er)?\\s+${MOIS[m - 1]}`).test(l);
}
const envoyes = (db, a) => (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(a.mail)).sort((x, y) => x.ts - y.ts);
const montrer = (l) => (l == null ? '(ligne absente)' : l === '' ? '(vide)' : `« ${l} »`);
// Un jalon lu sur des messages : juste si UN message l'est (un élève qui se corrige dans un second message garde
// ses points) ; « fait » montre le message juste, ou le dernier.
function surMessages(mails, juger, rien) {
  if (!mails.length) return { fait: rien, ok: false };
  const r = mails.map((m) => juger(m.text || ''));
  const best = r.find((x) => x.ok) || r[r.length - 1];
  return { fait: best.fait, ok: best.ok };
}

/* ============================================================================== les jalons */
// Dix jalons : cinq sur le diagnostic, deux sur le blocage (la vue), trois sur la protestation. Aucun n'est vrai
// par inaction : « N1 non accusée » demande un diagnostic envoyé, « aucune palette conforme bloquée » un blocage.

export function jalonsDiagnostic(db) {
  const M = envoyes(db || {}, CHEF), L = LIGNES_DIAG, rien = 'aucun diagnostic envoyé au chef de quai';
  const n2 = surMessages(M, (t) => {
    const pal = lire(t, L.palette), pr = lire(t, L.preuve);
    const okPr = pr != null && (nombres(sansPalettes(pr)).includes(Math.abs(TEMP_FICHE_N2)) || /fiche/.test(pr));
    return { ok: seules(pal || '', ['N2']) && okPr, fait: `${montrer(lire(t, L.palette, true))} · preuve ${montrer(lire(t, L.preuve, true))}` };
  }, rien);
  const n3 = surMessages(M, (t) => {
    const l = lire(t, L.manquant);
    return { ok: l != null && seules(l, ['N3']) && quantiteJuste(l), fait: montrer(lire(t, L.manquant, true)) };
  }, rien);
  const deb = surMessages(M, (t) => {
    const l = lire(t, L.reserve);
    return { ok: l != null && /deballage/.test(l) && SANS_VALEUR.test(l), fait: montrer(lire(t, L.reserve, true)) };
  }, rien);
  const del = surMessages(M, (t) => {
    const l = lire(t, L.delai);
    // « pas dépassé », « non dépassé » : dans le délai.
    const l2 = l == null ? '' : l.replace(/\b(pas|non|jamais) (encore )?depasse/g, 'dans le delai');
    return { ok: l != null && DANS_DELAI.test(l2) && !HORS_DELAI.test(l2), fait: montrer(lire(t, L.delai, true)) };
  }, rien);
  // N1 : aucune accusation dans AUCUN message (une accusation retirée plus tard reste dite).
  const accuse = M.some((m) => [L.palette, L.manquant].some((i) => palettesCitees(lire(m.text, i)).includes('N1')));
  return [
    { id: 'diag-n2', lib: 'Diagnostic · N2 acceptée à tort, avec sa preuve', fait: n2.fait,
      attendu: `N2 (et elle seule), preuve : la fiche de Mathis dit ${degres(TEMP_FICHE_N2)} à cœur, au-dessus de ${degres(SEUIL_CONFORME)}`, ok: n2.ok },
    { id: 'diag-n3', lib: 'Diagnostic · le manquant de N3 et sa quantité', fait: n3.fait, attendu: `N3 : ${N3_MANQUANT} cartons manquants (${reelles(N3)} au lieu de ${N3.bl})`, ok: n3.ok },
    { id: 'diag-deballage', lib: 'Diagnostic · la mention « sous réserve de déballage » ne vaut rien', fait: deb.fait,
      attendu: '« sous réserve de déballage » n’a aucune valeur : il faut une protestation motivée', ok: deb.ok },
    { id: 'diag-delai', lib: 'Diagnostic · le délai de protestation', fait: del.fait, attendu: 'encore dans le délai (3 jours après la réception de cette nuit)', ok: del.ok },
    { id: 'diag-n1', lib: 'Diagnostic · N1 n’est pas accusée (couche incomplète, mais conforme au BL)',
      fait: !M.length ? rien : accuse ? 'N1 accusée' : 'N1 non accusée', attendu: `N1 non accusée : ${reelles(N1)} cartons, comme le BL`, ok: M.length > 0 && !accuse },
  ];
}

export function jalonsProtestation(db, e) {
  const M = envoyes(db || {}, GIVREX), L = LIGNES_PROT, rien = 'aucun message envoyé au transporteur';
  const jour = e && e.jour;
  const refs = surMessages(M, (t) => {
    const b = lire(t, L.bl), d = lire(t, L.date);
    const okB = b != null && b.replace(/[^a-z0-9]/g, '').includes(nrm(BL).replace(/[^a-z0-9]/g, ''));
    return { ok: okB && dateJuste(d, jour), fait: `BL ${montrer(lire(t, L.bl, true))} · réceptionné le ${montrer(lire(t, L.date, true))}` };
  }, rien);
  const pal = surMessages(M, (t) => { const l = lire(t, L.palette); return { ok: l != null && seules(l, ['N2', 'N3']), fait: montrer(lire(t, L.palette, true)) }; }, rien);
  const cq = surMessages(M, (t) => {
    const c = lire(t, L.constat), q = lire(t, L.quantite);
    const okC = c != null && /temp|chaud|tiede|recongel|-?\b14\b|froid/.test(c) && /manqu|absent|\bmanque/.test(c);
    return { ok: okC && q != null && quantiteJuste(q), fait: `constat ${montrer(lire(t, L.constat, true))} · quantité ${montrer(lire(t, L.quantite, true))}` };
  }, rien);
  const jourLu = jour ? jour.split('-').reverse().join('/') : 'le jour de la séance';
  return [
    { id: 'prot-refs', lib: 'Protestation · le BL et la date de réception', fait: refs.fait, attendu: `BL ${BL}, réceptionné le ${jourLu}`, ok: refs.ok },
    { id: 'prot-palettes', lib: 'Protestation · les palettes en cause', fait: pal.fait, attendu: 'N2 et N3 (et elles seules)', ok: pal.ok },
    { id: 'prot-constat', lib: 'Protestation · le constat et la quantité', fait: cq.fait,
      attendu: `N2 : température non conforme à la réception (${degres(TEMP_FICHE_N2)} à cœur) ; N3 : ${N3_MANQUANT} cartons manquants`, ok: cq.ok },
  ];
}

// Un jalon = une étape du suivi (10).
export const ETAPES = etapesQuai(QUAI_ENT43);

/* =========================================================================== accueil et volet */

export const ACCUEIL = {
  titre: 'La réception de nuit',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : le chef de quai, Mathis, l’avis de livraison du transporteur.'],
    ['Contrôler', 'Menu Quai de réception : le dossier de Mathis (figé), puis la chambre froide — recompter, relire, re-sonder.'],
    ['Répondre au chef de quai', 'Messagerie : ton diagnostic, ligne par ligne.'],
    ['Corriger', 'Après sa réponse : bloquer ce qui doit l’être, protester auprès du transporteur s’il le faut, « J’ai terminé ».'],
  ],
};

// Les messages : textes écrits par Claude Code (brief §11), à relire par Tristan en jouant la séance.
export const VOLET = {
  id: 'picard-ent43',
  semer(prenom) {
    const now = Date.now();
    return { mails: [
      { folder: 'in', ts: now - 9600e3, from: GIVREX.nom, fromMail: GIVREX.mail, to: 'Picard — quai 32',
        subject: `Avis de livraison — BL ${BL}`, kind: 'text', amorce: amorce(LIGNES_PROT),
        text: `Bonjour,\n\nNous vous confirmons la livraison du BL ${BL} (Surgelés du Littoral, 5 palettes) cette nuit au quai 32, `
          + `réceptionnée à ${HEURE} par Mathis. Réserve portée sur le BL : « sous réserve de déballage ».\n\n`
          + 'Pour toute réclamation, répondez à ce message.\n\nTransports Givrex — service exploitation' },
      { folder: 'in', ts: now - 8400e3, from: MATHIS.nom, fromMail: MATHIS.mail, to: prenom,
        subject: 'Camion Givrex de 3 h', kind: 'text',
        text: 'Salut,\n\nRAS, tout est rentré. 5 palettes en chambre froide n° 2. La fiche est dans le dossier, au quai.\n\nBonne journée !\nMathis' },
      { folder: 'in', ts: now - 300e3, from: CHEF.nom, fromMail: CHEF.mail, to: prenom,
        subject: 'Réception de nuit : à vérifier ce matin', kind: 'text', amorce: amorce(LIGNES_DIAG),
        text: `Bonjour ${prenom},\n\nMathis, notre réceptionnaire de nuit, a réceptionné le camion Transports Givrex de 3 h `
          + '(Surgelés du Littoral, 5 palettes). Le camion est reparti, les palettes sont en chambre froide.\n\n'
          + 'Vérifie sa réception avant que le transporteur ne soit trop loin : menu Quai de réception, tu y trouves son dossier '
          + '(le BL signé, le ticket, sa fiche de comptage et de sonde) et les palettes en chambre froide. Son dossier est '
          + 'verrouillé : pour l’instant, tu regardes, tu ne corriges rien.\n\n'
          + 'Ensuite, réponds-moi en complétant ces cinq lignes :\n\n'
          + `${LIGNES_DIAG.palette} laquelle (ou « aucune »)\n`
          + `${LIGNES_DIAG.preuve} ce qui le montre dans le dossier\n`
          + `${LIGNES_DIAG.manquant} quelle palette, combien de cartons (ou « aucun »)\n`
          + `${LIGNES_DIAG.reserve} ce que vaut la réserve écrite sur le BL\n`
          + `${LIGNES_DIAG.delai} peut-on encore se retourner contre le transporteur ?\n\n`
          + 'Dès que ta réponse m’arrive, je te déverrouille le dossier.\n\nLe chef de quai' },
    ] };
  },
  // Le temps 2 : un message parti vers le chef, JUSTE OU FAUX (l'arrivée ne révèle rien, l'élève qui se trompe
  // n'est pas bloqué). La réponse ne dit pas ce qu'il faut corriger.
  declencheurs: [{
    id: 'deverrouille',
    quand: apresMail({ a: CHEF.mail }),
    phaseQuai: 2,
    semer: (prenom) => ({ mails: [{
      folder: 'in', ts: Date.now(), from: CHEF.nom, fromMail: CHEF.mail, to: prenom,
      subject: 'Re : réception de nuit', kind: 'text',
      text: `Merci ${prenom}, bien reçu.\n\nLe dossier est à toi maintenant : au quai, dans la chambre froide, tu peux bloquer `
        + 'une palette (étiquette « Bloqué — qualité », emplacement à part) et la débloquer.\n\n'
        + 'S’il faut protester auprès du transporteur, réponds à son avis de livraison (Messagerie), avec ces cinq lignes :\n'
        + `${Object.values(LIGNES_PROT).join('\n')}\n\n`
        + 'Quand tu as fini, clique « J’ai terminé » en bas du quai.\n\nLe chef de quai',
    }] }),
  }],
};
