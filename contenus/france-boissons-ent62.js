// ENT-6.2 — France Boissons, « la commande de La Cabane à Malo » : les données de la séance (brief
// `docs/briefs/ENT-6.2-france-boissons-commande.md`). Univers commun : `contenus/france-boissons.js` (stock de Buchelay,
// conditions de vente CHR, montants de consigne, client La Cabane à Malo, lexique). Activité :
// `activites/france-boissons-commande.js`. Corrigé : `contenus/corriges/ENT-6.2.js`.
//
// L'élève, en renfort à l'administration des ventes de Buchelay (mardi 15 juin 2027, 9 h 40) :
//   1. lit le message d'Inès, puis celui de Malo (tutoiement, ton familier : à ne pas recopier) et ses trois pièces jointes
//      (fiche client, extrait du stock, conditions de vente CHR) ;
//   2. remplit le bon de commande (cases « nombre » entières et positives, D-2) et l'envoie à Inès ;
//   3. répond à Malo par phrases à choisir (6 lignes, ordre des choix tiré par élève), au VOUS : c'est un client ;
//   4. Malo répond, juste ou faux (transition vers ENT-6.3).
//
// LE PIÈGE EN CHAÎNE (décision de Tristan, 05/10/2026) : l'Affligem manque (2 en stock pour 4 demandés), la commande tombe à
// 8 fûts, sous le minimum de 10 ; Malo a donné la solution (« une autre blonde en 20 L ») : 2 fûts de Pelforth Blonde 20 L.
// Distracteurs : Edelweiss (blanche), Heineken 20 L (à 0). Samedi n'est pas un jour de tournée.
//
// Valeurs attendues CALCULÉES ici (`ATTENDU`) depuis la commande de Malo, le stock, le minimum de commande, l'heure limite et
// le jour de tournée, jamais recopiées ; dans les tests, écrites à la main. 8 jalons à 1 point (pas de `poids`).

import { apresFiche, tous } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { EQUIPE, EXTERIEURS, LEXIQUE as LEXIQUE_FB, mailDe, STOCK_BUCHELAY, article, CONDITIONS_CHR, CABANE, CONSIGNES, libArticle,
  DOC_ORGANIGRAMME, DOC_ANNUAIRE, STYLE_DOCUMENTS as STYLE_FB } from './france-boissons.js';

export const ID = 'france-boissons-commande';
export const BON = 'bon-de-commande';
export const REPONSE = 'reponse-malo';

// La fiche envoyée et les saisies, lues comme `ficheEnvoyee` et `lireNombre` (core/types/fiche.js) sans importer ce module :
// il tire `core/ui.js`, et le corrigé de la séance (qui lit ce fichier) est aussi chargé hors de l'écran. Un test du bloc
// `france-boissons` vérifie que cette copie de `lireNombre` lit comme l'original.
function ficheEnvoyee(db, id) {
  const f = db && db.fiches && db.fiches[id];
  return { envoye: !!(f && f.envoye), valeurs: (f && f.valeurs) || {} };
}
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

// ─────────────────────────────────────────────────────────────── la scène et la commande de Malo

// Mardi 15 juin 2027, 9 h 40 ; la Fête de la musique tombe le lundi 21 juin 2027 (brief §4).
export const SCENARIO = { date: '2027-06-15', minutes: 9 * 60 + 40, fete: '2027-06-21' };

// Ce que Malo demande (brief §4, étape 2). Ses vides sont les consignes de sa fiche client.
export const COMMANDE = {
  futs: [{ article: 'heineken30', q: 6 }, { article: 'affligem20', q: 4 }],
  eau: { article: 'eau', q: 3 },
  remplacement: { biere: 'blonde', litres: 20 },   // « mets-moi une autre blonde en 20 L »
  jourSouhaite: '2027-06-19',                       // « Livre-moi samedi »
  vides: CABANE.consignes,                          // « reprends mes vides : 9 fûts et 5 casiers »
};

// Les dates, sans dépendre du fuseau ni de la langue du navigateur.
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const jourUTC = (iso) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j)); };
export const libJour = (iso) => { const d = jourUTC(iso); return `${JOURS[d.getUTCDay()]} ${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`; };
export const nomDuJour = (iso) => JOURS[jourUTC(iso).getUTCDay()];

// Le jour de livraison : le premier jour de la tournée du client après aujourd'hui, pour lequel la commande arrive avant
// l'heure limite de la veille.
export function jourDeLivraison() {
  const d0 = jourUTC(SCENARIO.date);
  for (let k = 1; k <= 14; k++) {
    const d = new Date(d0.getTime() + k * 86400000);
    if (d.getUTCDay() !== CABANE.tournee.jour) continue;
    if (k === 1 && SCENARIO.minutes >= CONDITIONS_CHR.heureLimite * 60) continue;   // la veille, c'est aujourd'hui : trop tard
    return d.toISOString().slice(0, 10);
  }
  return null;
}

// Les blondes de même format qui peuvent remplacer ce qui manque (hors articles déjà commandés), dans l'ordre du stock.
const memeFormat = (a) => a.biere === COMMANDE.remplacement.biere && a.litres === COMMANDE.remplacement.litres
  && !COMMANDE.futs.some((l) => l.article === a.id);

// Ce qu'on peut livrer et ce qu'on propose (le bon de commande juste).
export const ATTENDU = (() => {
  const lignes = COMMANDE.futs.map((l) => ({ ...l, livre: Math.min(l.q, article(l.article).dispo) }));
  const total = lignes.reduce((s, l) => s + l.livre, 0);
  const manque = lignes.reduce((s, l) => s + (l.q - l.livre), 0);
  const besoin = Math.max(manque, CONDITIONS_CHR.minimumFuts - total, 0);
  const candidats = besoin ? STOCK_BUCHELAY.filter((a) => memeFormat(a) && a.dispo >= besoin).map((a) => a.id) : [];
  return {
    futs: Object.fromEntries(lignes.map((l) => [l.article, l.livre])),
    rupture: lignes.find((l) => l.livre < l.q) || null,   // { article, q (demandé), livre }
    totalSansRemplacement: total,
    remplacement: besoin ? (candidats.length ? { article: candidats[0], q: besoin } : null) : { article: 'aucun', q: 0 },
    candidats,
    eau: Math.min(COMMANDE.eau.q, article(COMMANDE.eau.article).dispo),
    jour: jourDeLivraison(),
    vides: { futs: COMMANDE.vides.futs, casiers: COMMANDE.vides.casiers },
  };
})();

// ─────────────────────────────────────────────────────────────── les documents (reconstitués, mention en pied)

const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PIED = (quoi) => `<p class="fb-pied">${quoi} — Document pédagogique — reconstitution, non contractuel</p>`;
const HEINEKEN30 = article('heineken30'), AFFLIGEM = article('affligem20'), EAU = article('eau');
const SAMEDI = nomDuJour(COMMANDE.jourSouhaite);

// Le message de Malo, tel qu'il l'a écrit (texte du mail et copie à gauche du bon de commande).
export const TEXTE_MALO = `Salut !\n\nPour la Fête de la musique il me faut ${COMMANDE.futs[0].q} [[fût|fûts]] de Heineken 30 L, `
  + `${COMMANDE.futs[1].q} fûts d’Affligem 20 L et ${COMMANDE.eau.q} [[casier|casiers]] d’eau plate. `
  + 'Si jamais il manque quelque chose, mets-moi une autre blonde en 20 L.\n\n'
  + `Livre-moi ${SAMEDI}, c’est mieux pour moi. Et reprends mes [[vides]] : ${COMMANDE.vides.futs} fûts et ${COMMANDE.vides.casiers} casiers.\n\n`
  + `Merci !\n\nMalo — ${CABANE.nom}, Villers-sur-Mer`;

const docMalo = () => `<article class="fb2-doc" aria-label="Le message de Malo">
    <p class="fb-t">Le message de Malo</p>
    <p class="fb-st">De : Malo (${ech(CABANE.nom)}) · reçu le mardi 15 juin 2027, 9 h 32</p>
    <div class="fb2-mail">${TEXTE_MALO.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}</div>
    <p class="fb-pied">Copie du message reçu dans la Messagerie</p>
  </article>`;

const docClient = () => `<article class="fb2-doc" aria-label="Fiche client">
    <p class="fb-t">Fiche client — ${ech(CABANE.nom)}</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay · clients [[CHR]] de la côte</p>
    <dl class="fb2-dl">
      <dt>N° client</dt><dd>${ech(CABANE.numero)}</dd>
      <dt>Client</dt><dd>${ech(CABANE.nom)} — ${ech(CABANE.type)}, ${ech(CABANE.ville)}</dd>
      <dt>Gérant</dt><dd>Malo</dd>
      <dt>Ouverture du bar</dt><dd>${ech(CABANE.ouverture)}</dd>
      <dt>Livraison</dt><dd><b>[[tournée|Tournée]] de la côte : le ${ech(JOURS[CABANE.tournee.jour])}</b></dd>
      <dt>[[consigne|Consignes]] chez le client</dt><dd>${CABANE.consignes.futs} fûts, ${CABANE.consignes.casiers} casiers</dd>
    </dl>
    ${PIED('Fiche client')}
  </article>`;

const docStock = () => `<article class="fb2-doc" aria-label="Extrait du stock de Buchelay">
    <p class="fb-t">Extrait du stock — plateforme de Buchelay</p>
    <p class="fb-st">Mardi 15 juin 2027, 9 h</p>
    <table class="fb2-table">
      <thead><tr><th scope="col">[[référence|Référence]]</th><th scope="col">Article</th><th scope="col">Format</th><th scope="col" class="fb2-n">Disponible</th></tr></thead>
      <tbody>${STOCK_BUCHELAY.map((a) => `<tr data-stock="${a.id}"><td>${ech(a.ref)}</td><td>${ech(a.nom)}</td><td>${ech(a.format)}</td><td class="fb2-n">${a.dispo}</td></tr>`).join('')}</tbody>
    </table>
    <p class="fb2-note">Le réassort d’Affligem attendu de la brasserie n’est pas encore reçu : on ne promet que le stock disponible.</p>
    ${PIED('Extrait du stock')}
  </article>`;

const docConditions = () => `<article class="fb2-doc" aria-label="Conditions de vente CHR">
    <p class="fb-t">Conditions de vente [[CHR]] (extrait)</p>
    <p class="fb-st">France Boissons · plateforme de Buchelay</p>
    <ul class="fb2-ul">
      <li><b>[[minimum de commande|Minimum de commande]] : ${CONDITIONS_CHR.minimumFuts} fûts par livraison</b> (les casiers ne comptent pas).</li>
      <li>Commande reçue <b>avant ${CONDITIONS_CHR.heureLimite} h la veille</b> = livrée le jour de la [[tournée]] du client.</li>
      <li>[[consigne|Consigne]] : <b>${CONSIGNES.fut} € par fût</b> et <b>${CONSIGNES.casier} € par casier</b> (taux fixés par l’arrêté du 6 février 2026,
        en vigueur depuis le 1er janvier 2027).</li>
      <li>[[vides|Vides]] : repris par le chauffeur à la livraison.</li>
    </ul>
    ${PIED('Conditions de vente')}
  </article>`;

export const DOCUMENTS = [
  { id: 'commande-malo', titre: 'Le message de Malo', court: 'Message de Malo', html: docMalo() },
  { id: 'fiche-client', titre: `Fiche client — ${CABANE.nom}`, court: 'Fiche client', html: docClient() },
  { id: 'stock', titre: 'Extrait du stock de Buchelay', court: 'Stock', html: docStock() },
  { id: 'conditions', titre: 'Conditions de vente CHR (extrait)', court: 'Conditions de vente', html: docConditions() },
  DOC_ORGANIGRAMME, DOC_ANNUAIRE,
];

// Mise en page (règles imbriquées sous `.ent-doc` par le moteur) : celle de l'univers, plus la fiche client, le tableau du
// stock et la liste des conditions. Tout à l'encre du papier, aucune couleur de repère.
export const STYLE_DOCUMENTS = `${STYLE_FB}
.fb2-doc{padding:14px 18px 0}
.fb2-mail p{margin:0 0 8px}
.fb2-dl{display:grid; grid-template-columns:150px 1fr; gap:5px 12px; margin:6px 0 0; font-size:.9rem}
.fb2-dl dt{color:var(--douce)}
.fb2-dl dd{margin:0}
.fb2-table{border-collapse:collapse; width:100%; font-size:.9rem; margin-top:4px}
.fb2-table th, .fb2-table td{border-bottom:1px solid var(--filet); padding:5px 6px; text-align:left}
.fb2-table th{color:var(--douce); font-weight:600}
.fb2-table .fb2-n{text-align:right}
.fb2-note{margin:10px 0 0; font-size:.86rem}
.fb2-ul{margin:6px 0 0; padding-left:18px; font-size:.9rem}
.fb2-ul li{margin:4px 0}
`;

// ─────────────────────────────────────────────────────────────── le bon de commande

const nombre = (id, lib, unite, manque, o = {}) => ({ type: 'nombre', id, lib, unite, min: 0, entier: true, manque, ...o });
export const CHOIX_REMPLACEMENT = [{ v: 'aucun', lib: 'Aucun' },
  ...STOCK_BUCHELAY.filter((a) => a.litres === COMMANDE.remplacement.litres && !COMMANDE.futs.some((l) => l.article === a.id))
    .map((a) => ({ v: a.id, lib: libArticle(a) }))];
export const JOURS_PROPOSES = [ATTENDU.jour, COMMANDE.jourSouhaite, SCENARIO.fete].sort();

export const FICHE = {
  id: BON, libelle: 'Bon de commande', titre: `Bon de commande — ${CABANE.nom}`,
  sousTitre: 'Le message de Malo et les documents sont à gauche. Remplis le bon de commande, puis envoie-le à Inès.',
  documents: ['commande-malo', 'fiche-client', 'stock', 'conditions'],
  bouton: 'Ouvrir le bon de commande',
  entete: `<p class="note">Client : ${ech(CABANE.nom)} (n° ${ech(CABANE.numero)}), ${ech(CABANE.ville)} · commande reçue le mardi 15 juin 2027, 9 h 32</p>`,
  blocs: [
    { type: 'encadre', titre: 'Prendre une commande', texte: '\n1. Ce que le client demande.\n'
      + '2. Ce qu’on peut livrer : stock, minimum, jour de tournée.\n3. Ce qu’on lui propose quand ça ne colle pas.' },
    { type: 'cadre', titre: 'Les fûts', blocs: [
      ...COMMANDE.futs.map((l) => nombre(l.article, libArticle(article(l.article)), 'fûts', `la ligne « ${article(l.article).court} »`)),
      { type: 'liste', id: 'remplacement', lib: 'Remplacement', vide: 'Choisir…', manque: 'le remplacement', choix: CHOIX_REMPLACEMENT },
      nombre('remplacementQte', 'Quantité de remplacement (0 si aucun)', 'fûts', 'la quantité de remplacement'),
    ] },
    { type: 'cadre', titre: 'L’eau', blocs: [nombre('eau', libArticle(EAU), 'casiers', 'l’eau')] },
    { type: 'cadre', titre: 'La livraison', blocs: [
      { type: 'choix', id: 'jour', lib: 'Jour de livraison', manque: 'le jour de livraison', colonne: true,
        choix: JOURS_PROPOSES.map((iso) => ({ v: iso, lib: libJour(iso) })) }] },
    { type: 'cadre', titre: 'Les vides à reprendre', blocs: [
      nombre('videsFuts', 'Fûts vides', 'fûts', 'les fûts vides'),
      nombre('videsCasiers', 'Casiers vides', 'casiers', 'les casiers vides')] },
  ],
  pied: 'Bon de commande — document pédagogique, reconstitution, non contractuel',
  envoi: { bouton: 'Envoyer le bon de commande à Inès', a: 'Inès', suite: 'Inès va te répondre dans la Messagerie.' },
};

// ─────────────────────────────────────────────────────────────── la réponse à Malo (phrases à choisir)

const elide = (m) => (/^[aeiouyhéèêâ]/i.test(m) ? `l’${m}` : `la ${m}`);
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// Le piège « blanche » : la bière de même format qui n'est pas de la couleur demandée (Edelweiss).
const AUTRE_COULEUR = STOCK_BUCHELAY.find((a) => a.biere && a.biere !== COMMANDE.remplacement.biere && a.litres === COMMANDE.remplacement.litres);

// Brief §4, étape 6. `juste` = rang dans l'ordre DÉCLARÉ (toujours le premier ici) ; l'ordre affiché est tiré par élève.
// Construite à l'arrivée du message de Malo, avec le prénom de l'élève (ligne de fin).
export function phrasesMalo(prenom) {
  const R = ATTENDU.rupture, AR = article(R.article), P = article(ATTENDU.remplacement.article), q = ATTENDU.remplacement.q;
  const V = ATTENDU.vides;
  return {
    id: REPONSE,
    lignes: [
      { id: 'salutation', choix: ['Bonjour Malo,', 'Salut Malo !', 'Coucou,'], juste: 0 },
      { id: 'commande', choix: ['Votre commande pour la Fête de la musique est bien enregistrée.', 'C’est bon, j’ai noté ta commande.'], juste: 0 },
      { id: 'rupture', choix: [
        `Il ne nous reste que ${R.livre} fûts ${AR.de} : je vous propose ${q} fûts ${P.de} à la place.`,
        `${majuscule(elide(AR.marque))} est en rupture, je retire la ligne.`,
        `Je vous livre bien ${R.q} fûts ${AR.de}.`,
        `Il ne nous reste que ${R.livre} fûts ${AR.de} : je vous propose ${q} fûts ${AUTRE_COULEUR.de} à la place.`], juste: 0 },
      { id: 'livraison', choix: [
        `Vous serez livré ${libJour(ATTENDU.jour)}, par notre ${CABANE.tournee.nom}.`,
        `Vous serez livré ${libJour(COMMANDE.jourSouhaite)}, comme vous le souhaitez.`,
        `Vous serez livré ${libJour(SCENARIO.fete)}.`], juste: 0 },
      { id: 'vides', choix: [
        `Le chauffeur reprendra vos ${V.futs} fûts et ${V.casiers} casiers vides.`,
        `Le chauffeur reprendra vos ${V.casiers} fûts et ${V.futs} casiers vides.`,
        'Gardez vos vides jusqu’à la prochaine fois.'], juste: 0 },
      { id: 'fin', choix: [`Cordialement, ${prenom}, administration des ventes France Boissons`, 'Bisous', 'À plus !'], juste: 0 },
    ],
    melanger: true,
  };
}

// ─────────────────────────────────────────────────────────────── les messages

const INES = { nom: EQUIPE.ines.nom, mail: mailDe('ines') };
const MALO = { nom: `Malo (${CABANE.nom})`, mail: EXTERIEURS.malo.mail };
const mail = (prenom, de, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decalage || 0), from: de.nom, fromMail: de.mail,
  to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const SUJET_MALO = 'Commande pour la Fête de la musique';
const repondu = (db) => phrasesJustes(db, REPONSE).envoye;

export const VOLET = {
  id: 'fb-ent62',
  semer: (prenom) => ({ mails: [
    mail(prenom, INES, 'Bienvenue à l’administration des ventes',
      `Bonjour ${prenom}, bienvenue à l’administration des ventes !\n\n`
        + 'Les bars de la côte normande préparent la Fête de la musique. Malo, le gérant de La Cabane à Malo, vient de nous écrire.\n\n'
        + 'Prends sa commande : vérifie le stock et les conditions de vente, remplis le [[bon de commande]], puis réponds-lui. Chaque article a une [[référence]] : tu la retrouves dans le stock et sur le bon.\n\nInès',
      { decalage: -60000, extra: { pieces: ['organigramme', 'annuaire'], ouvreFiche: BON } }),
    mail(prenom, MALO, SUJET_MALO, TEXTE_MALO,
      { decalage: -30000, extra: { pieces: ['fiche-client', 'stock', 'conditions'], ouvreFiche: BON, phrases: phrasesMalo(prenom) } }),
  ] }),
  declencheurs: [
    // Le bon envoyé (juste ou faux) : Inès demande la réponse à Malo (ou remercie, si l'élève lui a déjà répondu).
    { id: 'bon-recu', quand: apresFiche(BON), semer: (prenom, db) => ({ mails: [mail(prenom, INES, 'Bon de commande reçu',
      repondu(db) ? `Bon de commande reçu, merci ${prenom}.\n\nInès`
        : 'Bon de commande reçu. Réponds maintenant à Malo : il attend de savoir ce qu’il aura, et quand.\n\n'
          + 'Ouvre son message, clique sur « Répondre » et choisis une phrase par ligne.\n\nInès', { decalage: 1000 })] }) },
    // Le bon envoyé ET la réponse envoyée (justes ou fausses) : Malo répond, toujours pareil (il ne dit pas si c'était juste).
    { id: 'reponse-malo', quand: tous(apresFiche(BON), repondu), semer: (prenom) => ({ mails: [mail(prenom, MALO, `RE : ${SUJET_MALO}`,
      `Ok pour ${elide(article(ATTENDU.remplacement.article).marque)}, à ${nomDuJour(ATTENDU.jour)} !\n\nMalo`, { decalage: 2000 })] }) },
  ],
  // Les envois corrigés (séance `correction`) : un accusé, jamais « juste » ni « faux ».
  corrections: {
    [BON]: (prenom) => ({ mails: [mail(prenom, INES, 'Bon de commande corrigé', `Merci ${prenom}, j’ai bien reçu ton bon de commande corrigé.\n\nInès`, { decalage: 3000 })] }),
    [REPONSE]: (prenom) => ({ mails: [mail(prenom, MALO, `RE : ${SUJET_MALO}`, 'Bien reçu, merci !\n\nMalo', { decalage: 3000 })] }),
  },
};

// ─────────────────────────────────────────────────────────────── les jalons (8, un point chacun)
// Rien n'est vrai avant l'envoi du bon (jalons 1 à 5) ou de la réponse (jalons 6 à 8) : « à faire », puis juste ou faux.
// Le DERNIER envoi de la réponse compte (`phrasesJustes`). `groupe` = la ligne du bandeau de fin : les trois lignes de fûts
// font un seul bloc (le piège en chaîne se raisonne en entier) ; le bandeau ne descend jamais à la case.
export const GROUPES = {
  futs: 'Le bon de commande : les fûts',
  jour: 'Le bon de commande : le jour de livraison',
  vides: 'Le bon de commande : l’eau et les vides',
  rupture: 'La réponse à Malo : la rupture',
  livraison: 'La réponse à Malo : la livraison',
  ton: 'La réponse à Malo : le ton',
};
const ECRAN_BON = `fiche:${BON}`;
const ECRAN_REPONSE = `phrases:${REPONSE}`;
const attente = { status: 'attente' };
const ok = { status: 'ok' }, ko = { status: 'ko' };
const n = (v, k) => lireNombre(v[k]);

const jalonBon = (id, titre, groupe, juste) => ({ id, titre, groupe, ecran: ECRAN_BON,
  verifier(db) {
    const f = ficheEnvoyee(db, BON);
    if (!f.envoye) return attente;
    return juste(f.valeurs) ? ok : ko;
  } });
const jalonReponse = (id, titre, groupe, lignes) => ({ id, titre, groupe, ecran: ECRAN_REPONSE,
  verifier(db) {
    const r = phrasesJustes(db, REPONSE);
    if (!r.envoye) return attente;
    return lignes.every((l) => r.justes.includes(l)) ? ok : ko;
  } });

const [L1, L2] = COMMANDE.futs.map((l) => l.article);
export const ETAPES = [
  jalonBon('heineken30', `Bon de commande : ${article(L1).court}`, GROUPES.futs, (v) => n(v, L1) === ATTENDU.futs[L1]),
  jalonBon('affligem', `Bon de commande : ${article(L2).court}`, GROUPES.futs, (v) => n(v, L2) === ATTENDU.futs[L2]),
  jalonBon('remplacement', 'Bon de commande : le remplacement', GROUPES.futs,
    (v) => !!ATTENDU.remplacement && v.remplacement === ATTENDU.remplacement.article && n(v, 'remplacementQte') === ATTENDU.remplacement.q),
  jalonBon('jour', 'Bon de commande : le jour de livraison', GROUPES.jour, (v) => v.jour === ATTENDU.jour),
  jalonBon('eau-vides', 'Bon de commande : l’eau et les vides', GROUPES.vides,
    (v) => n(v, 'eau') === ATTENDU.eau && n(v, 'videsFuts') === ATTENDU.vides.futs && n(v, 'videsCasiers') === ATTENDU.vides.casiers),
  jalonReponse('msg-rupture', 'Réponse à Malo : la rupture', GROUPES.rupture, ['rupture']),
  jalonReponse('msg-livraison', 'Réponse à Malo : la livraison', GROUPES.livraison, ['livraison']),
  jalonReponse('msg-ton', 'Réponse à Malo : le ton professionnel', GROUPES.ton, ['salutation', 'commande', 'fin']),
];

// ─────────────────────────────────────────────────────────────── l'accueil

export const MENTION = 'Réels : France Boissons et sa plateforme de Buchelay (Yvelines), les bières citées (marques de Heineken France), '
  + 'les montants de consigne (arrêté du 6 février 2026). Construit : le bar La Cabane à Malo, Malo, Inès, les stocks, le minimum '
  + 'de commande, l’heure limite, le jour de tournée, le numéro client, tous les messages.';
export const LEXIQUE = LEXIQUE_FB;
export const ACCUEIL = {
  titre: 'La commande de La Cabane à Malo',
  kpis: ['mail'],
  etapes: [
    ['Lire les messages', 'Menu Messagerie : le message d’Inès, puis celui de Malo, avec la fiche client, le stock et les conditions de vente en pièces jointes.'],
    ['Remplir le bon de commande', 'Ce que Malo demande, ce qu’on peut livrer (stock, [[minimum de commande]], jour de [[tournée]]), ce qu’on lui propose. '
      + 'Puis envoie le [[bon de commande]] à Inès.'],
    ['Répondre à Malo', 'Ouvre son message : « Répondre », puis une phrase par ligne.'],
    ['Bon à savoir', MENTION],
  ],
};

// ─────────────────────────────────────────────────────────────── les options de la séance

export const OPTIONS = {
  menu: [],
  exercice: 'Séance 2 : la commande de La Cabane à Malo',
  sansTrame: 'Tout se fait à l’écran',
  lexique: LEXIQUE,
  documents: DOCUMENTS,
  documentsStyle: STYLE_DOCUMENTS,
  fiche: FICHE,
};
