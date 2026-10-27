// Airbus Helicopters — le service expéditions des pièces de rechange de Marignane : l'UNIVERS commun des séances ENT-18.1 à 18.5 (Terminale, C2.6
// « confier l'expédition à un prestataire de transport externe », C3.1 « adapter le processus logistique selon le type de produit ou de flux ») et la
// FABRIQUE de leurs écrans. Cadrage : `docs/briefs/airbus/CADRAGE-airbus-tle.md` ; données : `contenus/airbus-donnees.js`.
//
// L'élève est adjoint(e) à la responsable du service expéditions (rôle et prénoms CONSTRUITS ; le site, son magasin de pièces de rechange et le service
// AOG sont réels). Il choisit le prestataire de chaque expédition avec la grille et la règle du site, calcule poids taxable et coût (16.1, 16.2), adapte
// le choix aux flux particuliers : hélicoptère au sol (AOG), colis hors gabarit, marchandise dangereuse (18.3) ; il contrôle les réservations de Sofiane
// (18.4, erreur induite) ; tout en évaluation (18.5). Aucune vue nouvelle : documents joints, fiche, réponse par phrases, questions au fil. Nathalie
// tutoie l'élève.

import { catalogueSimple } from './entreprise-commun.js';
import { apresFiche } from '../core/declencheurs.js';
import { phrasesJustes } from '../core/phrases.js';
import { PRESTAS, PRESTA, volumetrique, offre, bilan, travailDeSofiane, nombreFr } from './airbus-donnees.js';

// ─────────────────────────────────────────── l'univers
export const ENTREPRISE = {
  id: 'airbus',
  nom: 'Airbus Helicopters',
  sousTitre: 'Marignane (Bouches-du-Rhône) — expédition des pièces de rechange',
  exercice: 'Confier les expéditions',
  logo: './contenus/trames/logos/airbus-texte.svg',
};
export const VOCAB = { unit: 'colis', unitPl: 'colis', sizeLabel: '', sizeShort: '', configWord: '', icone: 'carton', mailDomain: 'airbus.example' };
// Un bleu ardoise CONSTRUIT (pas la charte de la marque).
export const THEME = { accent: '#3a4f63', papier: true };
export const CATALOGUE = catalogueSimple([{ ref: 'PR-GEN', designation: 'Pièce de rechange', marque: 'Pièce construite', categorie: 'Pièces de rechange', fournisseur: 'F-AH', stock: 0 }]);
export const SUPPLIERS = [{ id: 'F-AH', brand: 'Airbus Helicopters', name: 'Magasin des pièces de rechange', adr: '', cp: '', ville: 'Marignane', contact: '', tel: '', email: 'magasin@airbus.example', delai: 1, franco: 0, pay: '', moq: 1 }];
export const SUP_BY_ID = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s]));
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MENTION = 'Réels : Airbus Helicopters, son site de Marignane, son magasin de pièces de rechange et son service AOG (hélicoptère immobilisé '
  + 'au sol), 361 hélicoptères livrés en 2024. Construits : les prestataires, leurs tarifs et leurs limites, la règle de choix, les pièces, les colis, '
  + 'les clients, les distances et les prénoms.';

// ─────────────────────────────────────────── l'équipe (construite, prénoms seuls)
export const EQUIPE = {
  nathalie: { nom: 'Nathalie', role: 'responsable du service expéditions (ta responsable)', appel: 'Nathalie' },
  sofiane: { nom: 'Sofiane', role: 'agent d’expédition', appel: 'Sofiane' },
};
const NATHALIE = { nom: 'Nathalie, responsable des expéditions', mail: 'nathalie@airbus.example' };
export const MAIL_NATHALIE = NATHALIE.mail;
export const PERSONNES = { nathalie: EQUIPE.nathalie, sofiane: EQUIPE.sofiane };

// ─────────────────────────────────────────── aides
const ech = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pied = (t) => `<p class="ah-pied">${ech(t)}</p>`;
const n = (x) => nombreFr(x);
const eur = (x) => `${n(x)} €`;
export const liste = (L) => (L.length <= 1 ? L.join('') : `${L.slice(0, -1).join(', ')} et ${L[L.length - 1]}`);
export function lireNombre(s) {
  const t = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace('€', '').replace(/kg$/i, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
const memes = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const demande = (E) => (E.aog ? '<b>HÉLICOPTÈRE AU SOL (AOG)</b> : au plus vite' : `livré sous ${E.delai} jour${E.delai > 1 ? 's' : ''} ouvré${E.delai > 1 ? 's' : ''}`);
const court = (p) => PRESTA[p].nom.split(' (')[0].toLowerCase();

export const STYLE = `
--douce:#555047;
.ah-doc{padding:14px 18px 0}
.ah-doc p{margin:0 0 8px}
.ah-t{margin:0; font-size:1.08rem; font-weight:800}
.ah-st{margin:2px 0 10px; font-size:.84rem; color:var(--douce)}
.ah-ul{margin:4px 0 8px; padding-left:20px; font-size:.92rem}
.ah-ul li{margin:4px 0}
.ah-regle{margin:6px 0 10px; padding:8px 12px; border:2px solid #555047}
.ah-table{border-collapse:collapse; width:100%; font-size:.86rem; margin-top:4px}
.ah-table th, .ah-table td{border-bottom:1px solid #d6d0c3; padding:4px 6px; text-align:left; vertical-align:top}
.ah-table th{color:var(--douce); font-weight:600}
.ah-table .ah-d{text-align:right; white-space:nowrap}
.ah-table th.ah-d{white-space:normal}
.ah-table th{letter-spacing:0}
.ah-table td.ah-md{white-space:normal}
.ah-doc{overflow-x:auto}
.ah-mono{font-family:ui-monospace, Consolas, monospace; white-space:nowrap}
.ah-pied{margin:12px -18px 0; font-size:.72rem; color:var(--douce); border-top:1px solid #e3ded3; padding:6px 18px; text-align:right}
`;

// ─────────────────────────────────────────── les documents
function docPoste(D, texte) {
  return { id: 'poste', titre: 'Ton poste', court: 'Ton poste',
    html: `<article class="ah-doc" aria-label="Ton poste">
    <p class="ah-t">Ton poste</p>
    <p class="ah-st">Airbus Helicopters — Marignane — service expéditions des pièces de rechange — ${ech(D.jour)}</p>
    <p>Tu es adjoint(e) à <b>Nathalie</b>, la responsable des expéditions. Les pièces de rechange partent du magasin vers les clients qui exploitent des
      hélicoptères : secours, gendarmerie, transport sanitaire, écoles, maintenance. Tu choisis à quel <b>prestataire de transport</b> confier chaque colis,
      au bon prix et à temps.</p>
    ${texte}
    <p><b>Ce qui est réel</b> : Airbus Helicopters a livré 361 hélicoptères en 2024, commandés par 182 clients dans 42 pays. Son site de Marignane, près de
      Marseille, est présenté comme le 3e site industriel français ; il a un magasin de pièces de rechange pour toute la gamme, et un service <b>AOG</b>
      (« aircraft on ground » : un appareil immobilisé au sol qui attend une pièce) chargé de livrer au plus vite.</p>
    ${pied(`Document pédagogique. ${MENTION}`)}
  </article>` };
}
const docExpeditions = (D) => ({ id: 'expeditions', titre: 'Les expéditions du jour', court: 'Les expéditions',
  html: `<article class="ah-doc" aria-label="Les expéditions du jour">
    <p class="ah-t">Expéditions à confier — ${ech(D.jour)}</p>
    <p class="ah-st">Un colis par expédition ; dimensions en cm (longueur × largeur × hauteur) ; distance retenue par les transporteurs</p>
    <table class="ah-table"><thead><tr><th scope="col">N°</th><th scope="col">Pièce</th><th scope="col">Client</th><th class="ah-d" scope="col">Colis</th>
      <th class="ah-d" scope="col">Poids</th><th scope="col">Demande</th></tr></thead>
      <tbody>${D.expeditions.map((E) => `<tr><td class="ah-mono">${E.no}</td><td>${ech(E.piece)}${E.danger ? ' <i>(contient une batterie lithium-ion)</i>' : ''}</td>
        <td>${ech(E.client)}, ${ech(E.ville)} (${n(E.km)} km)</td><td class="ah-d">${E.colis.L} × ${E.colis.l} × ${E.colis.h}</td><td class="ah-d">${n(E.colis.kg)} kg</td>
        <td>${demande(E)}</td></tr>`).join('')}</tbody></table>
    ${pied('Expéditions, clients et distances CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docTarifs = () => ({ id: 'tarifs', titre: 'La grille des prestataires', court: 'Les prestataires',
  html: `<article class="ah-doc" aria-label="Grille des prestataires">
    <p class="ah-t">Les prestataires sous contrat</p>
    <table class="ah-table"><thead><tr><th scope="col">Prestataire</th><th scope="col">Délai</th><th scope="col">Prix</th><th scope="col">Poids volumétrique</th>
      <th scope="col">Limites</th><th class="ah-d" scope="col">Marchandise dangereuse</th></tr></thead><tbody>
      ${PRESTAS.map((p) => `<tr><td><b>${ech(p.nom.split(' (')[0])}</b><br><span class="ah-st">${ech((p.nom.split(' (')[1] || '').replace(')', ''))}</span></td>
        <td>${p.delai === 0 ? 'le jour même' : p.delai === 1 ? 'le lendemain (1 jour)' : `${p.delai} jours`}</td>
        <td>${p.parKg ? `${n(p.parKg)} € par kg taxable, ${p.minimum} € au moins` : `${n(p.parKm)} € par km${p.minimum ? `, ${p.minimum} € au moins` : ''}`}</td>
        <td>${p.diviseur ? `L × l × h ÷ ${n(p.diviseur)}` : 'sans objet (prix au km)'}</td>
        <td>colis de ${n(p.longMax / 100)} m au plus${p.kmMax ? ` ; ${p.kmMax} km au plus` : ''}</td>
        <td class="ah-d ah-md">${p.md ? `+ ${p.md} €` : 'sans supplément'}</td></tr>`).join('')}
    </tbody></table>
    ${pied('Prestataires et tarifs CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` });
const docRegle = () => ({ id: 'regle', titre: 'La méthode du service', court: 'Méthode',
  html: `<article class="ah-doc" aria-label="Méthode du service">
    <p class="ah-t">La méthode du service expéditions</p>
    <ol class="ah-ul">
      <li><b>Poids volumétrique</b> (kg) = longueur × largeur × hauteur (en cm) ÷ le diviseur du prestataire. <b>Poids taxable</b> = le plus grand du poids
        réel et du poids volumétrique, <b>arrondi au kg supérieur</b>. Un colis léger mais encombrant se paie à sa place dans le camion.</li>
      <li><b>Coût</b> = prix × poids taxable (ou × km), sans descendre sous le minimum, + le supplément « marchandise dangereuse » s’il y a lieu.</li>
      <li>Un prestataire n’est possible que s’il accepte le colis (longueur, distance) et livre <b>à temps</b>.</li>
      <li><b>Hélicoptère au sol (AOG)</b> : le prestataire possible le plus <b>RAPIDE</b>. Sinon : le possible le <b>MOINS CHER</b>.</li>
      <li>Une <b>marchandise dangereuse</b> (batterie lithium-ion…) part avec sa <b>déclaration</b> et son étiquette, préparées par nous, l’expéditeur.</li>
    </ol>
    <p class="ah-st">Exemple : colis 100 × 50 × 40 cm, 12 kg, en messagerie : 200 000 ÷ 4 000 = 50 kg volumétriques → taxable 50 kg → 50 × 0,80 = 40 €.</p>
    ${pied('Méthode CONSTRUITE pour l’exercice (le poids volumétrique et le poids taxable sont des pratiques réelles du transport). Document pédagogique.')}
  </article>` });
function docSofiane(D) {
  const J = travailDeSofiane(D);
  return { id: 'reservations-sofiane', titre: `Les réservations de ${D.collegue}`, court: `Les réservations de ${D.collegue}`,
    html: `<article class="ah-doc" aria-label="Réservations de ${ech(D.collegue)}">
    <p class="ah-t">Réservations du matin</p>
    <p class="ah-st">Saisies par ${ech(D.collegue)}, pas encore confirmées aux prestataires</p>
    <table class="ah-table"><thead><tr><th scope="col">N°</th><th scope="col">Prestataire</th><th class="ah-d" scope="col">Poids retenu</th><th class="ah-d" scope="col">Coût prévu</th></tr></thead>
      <tbody>${D.expeditions.map((E) => `<tr><td class="ah-mono">${E.no}</td><td>${ech(PRESTA[D.choixCollegue[E.no]].nom.split(' (')[0])}</td>
        <td class="ah-d">${n(Math.ceil(E.colis.kg))} kg</td><td class="ah-d">${eur(J.couts[E.no])}</td></tr>`).join('')}</tbody></table>
    <p class="ah-st">Note de ${ech(D.collegue)} : « J’ai pris le moins cher à chaque fois. »</p>
    ${pied('Réservations CONSTRUITES pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
}
const docDroit = () => ({ id: 'droit', titre: 'Le droit : confier un transport', court: 'Le droit',
  html: `<article class="ah-doc" aria-label="Le droit : confier un transport">
    <p class="ah-t">Le droit : confier une marchandise à un transporteur</p>
    <ul class="ah-ul">
      <li>Le <b>contrat de transport</b> : l’expéditeur confie la marchandise, le transporteur s’engage à la déplacer et à la livrer. La <b>lettre de
        voiture</b> (ou le récépissé) prouve le contrat et ce qui a été remis.</li>
      <li>Le transporteur répond de la <b>perte</b>, de l’<b>avarie</b> et du <b>retard</b>, dans les limites prévues ; l’expéditeur répond des informations
        qu’il donne (nature, poids, emballage).</li>
      <li><b>Marchandises dangereuses</b> : par la route, l’accord européen <b>ADR</b> ; par avion, des règles encore plus strictes. C’est l’<b>expéditeur</b>
        qui classe, emballe, étiquette et déclare. Une batterie lithium-ion est une marchandise dangereuse (classe 9).</li>
    </ul>
    ${pied('Résumé pour l’exercice (pas une citation des textes). Document pédagogique.')}
  </article>` });

// ─────────────────────────────────────────── la fiche
const nb = (id, lib, unite, manque) => ({ type: 'nombre', id, lib, unite, min: 0, manque });
function blocsSofiane(D, num) {
  return [{ type: 'cadre', titre: `${num}. Les réservations de ${D.collegue}`, large: true, blocs: [
    { type: 'cases', id: 'erreurs', titre: `Les réservations de ${D.collegue} à corriger (mauvais prestataire ou coût faux)`, choix: D.expeditions.map((E) => ({ v: E.no, lib: `${E.no} — ${E.piece}` })) },
    { type: 'choix', id: 'cause', lib: `Pourquoi les coûts de ${D.collegue} sont-ils trop bas ?`, colonne: true, manque: 'la cause', choix: [
      { v: 'reel', lib: 'Il a pris le poids réel, jamais le poids volumétrique' },
      { v: 'minimum', lib: 'Il a oublié les minimums de facturation' },
      { v: 'tarif', lib: 'Il s’est trompé de ligne dans la grille' }] },
  ] }];
}
function blocsExp(D, num) {
  const B = bilan(D);
  const prestas = PRESTAS.map((p) => ({ v: p.id, lib: p.nom.split(' (')[0] }));
  const calc = D.calcul || D.expeditions.map((E) => E.no);
  return [{ type: 'cadre', titre: `${num}. ${D.collegue ? 'Tes réservations' : 'Le choix des prestataires'}`, large: true, blocs: [
    ...D.expeditions.map((E) => ({ type: 'liste', id: `presta-${E.no}`, lib: `${E.no} — ${E.piece}`, manque: `le prestataire de ${E.no}`, choix: prestas })),
    ...calc.flatMap((no) => [
      ...(B.off[no].taxable != null ? [nb(`tax-${no}`, `${no} : poids taxable chez le prestataire choisi`, 'kg', `le poids taxable de ${no}`)] : []),
      nb(`cout-${no}`, `${no} : coût`, '€', `le coût de ${no}`)]),
    ...(D.expeditions.some((E) => E.danger) || D.danger ? [{ type: 'cases', id: 'danger', titre: 'Les expéditions qui partent avec une déclaration de marchandise dangereuse',
      choix: D.expeditions.map((E) => ({ v: E.no, lib: `${E.no} — ${E.piece}` })) }] : []),
  ] }];
}

// ─────────────────────────────────────────── l'état de l'élève
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};

// ─────────────────────────────────────────── les phrases (de l'élève à Nathalie : tu poli)
function phrases(D, prenom) {
  const id = `compte-rendu-${D.code.slice(4).replace('.', '')}`;
  const B = bilan(D);
  const salut = { id: 'salutation', choix: ['Bonjour Nathalie,', 'Salut Nath !', 'Yo,'], juste: 0 };
  const fin = { id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 };
  const lignes = [salut];
  const dit = (P) => `Je confie : ${PRESTAS.map((p) => p.id).filter((p) => D.expeditions.some((E) => P[E.no] === p))
    .map((p) => `${court(p)} pour ${liste(D.expeditions.filter((E) => P[E.no] === p).map((E) => E.no))}`).join(' ; ')}.`;
  const moinsCher = Object.fromEntries(D.expeditions.map((E) => { const ok = PRESTAS.filter((p) => offre({ ...E, delai: 9 }, p.id).ok);
    return [E.no, ok.sort((a, b) => offre({ ...E, delai: 9 }, a.id).cout - offre({ ...E, delai: 9 }, b.id).cout)[0].id]; }));
  const plusVite = Object.fromEntries(D.expeditions.map((E) => { const ok = PRESTAS.filter((p) => offre({ ...E, delai: 9 }, p.id).ok);
    return [E.no, ok.sort((a, b) => a.delai - b.delai)[0].id]; }));
  lignes.push({ id: 'prestas', choix: [dit(B.presta), dit(moinsCher), dit(plusVite)], juste: 0 });
  const total = D.expeditions.reduce((t, E) => t + B.off[E.no].cout, 0);
  const reel = D.expeditions.reduce((t, E) => { const P = PRESTA[B.presta[E.no]]; return t + (P.parKg ? Math.max(P.minimum, P.parKg * Math.ceil(E.colis.kg)) + (E.danger ? P.md : 0) : B.off[E.no].cout); }, 0);
  const sansMd = total - D.expeditions.reduce((t, E) => t + (E.danger ? PRESTA[B.presta[E.no]].md : 0), 0);
  const autre = reel !== total ? reel : sansMd !== total ? sansMd : total + 30;
  const tot = (x) => `Coût total des expéditions du jour : ${eur(Math.round(x * 100) / 100)}.`;
  lignes.push({ id: 'cout', choix: [tot(total), tot(autre), tot(Math.round(total * 1.2 * 100) / 100)], juste: 0 });
  if (B.danger.length) {
    lignes.push({ id: 'danger', choix: [`${liste(B.danger)} part avec sa déclaration de marchandise dangereuse et l’étiquette des batteries au lithium.`,
      'Aucune marchandise dangereuse aujourd’hui.', `${liste(B.danger)} part comme un colis ordinaire : une batterie n’a pas besoin de formalité.`], juste: 0 });
  }
  if (D.collegue) {
    const J = travailDeSofiane(D);
    lignes.push({ id: 'erreur', choix: [`${D.collegue} a fait deux erreurs : ${liste(J.faux)} ; il a mis un hélicoptère au sol en messagerie et calculé sur le poids réel.`,
      `Les réservations de ${D.collegue} sont justes : il a pris le moins cher.`, `${D.collegue} a seulement oublié un supplément de marchandise dangereuse.`], juste: 0 });
  }
  lignes.push(fin);
  return { id, melanger: true, lignes };
}

// ─────────────────────────────────────────── la fabrique d'une séance
// D : le jeu ; O : { id, poids, titre, consigne, poste, objet, etape, questions }.
export function seance(D, O) {
  const suffixe = D.code.slice(4).replace('.', '');
  const FICHE_ID = `fiche-${suffixe}`, VOLET_ID = `ah-${suffixe}`;
  const P = phrases(D, '{prenom}');
  const PHRASES_ID = P.id;
  const B = bilan(D);

  const DOCUMENTS = [docPoste(D, O.poste), docExpeditions(D), docTarifs(), docRegle(), ...(D.collegue ? [docSofiane(D)] : []), docDroit()];
  let num = 1;
  const blocs = [];
  if (D.collegue) blocs.push(...blocsSofiane(D, num++));
  blocs.push(...blocsExp(D, num++));
  const surFicheDocs = DOCUMENTS.map((d) => d.id).filter((x) => x !== 'poste' && x !== 'droit');
  const FICHE = {
    id: FICHE_ID, libelle: 'Fiche de travail', titre: O.titre, sousTitre: 'À gauche : les expéditions, la grille et la méthode. Calcule au brouillon ou à la calculatrice.',
    documents: surFicheDocs, largeurDocs: 1.3, defile: true, bouton: 'Ouvrir la fiche de travail', blocs,
    envoi: { bouton: 'Envoyer la fiche à Nathalie', a: 'Nathalie', suite: 'Écris-lui maintenant ton compte rendu, dans la Messagerie.' },
  };
  const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: Date.now() + (o.decale || 0), from: NATHALIE.nom, fromMail: NATHALIE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
  const VOLET = {
    id: VOLET_ID,
    semer: (prenom) => ({ mails: [mail(prenom, O.objet, `Bonjour ${prenom} !\n\n${O.consigne}\n\nNathalie`, { decale: -3600e3, extra: { pieces: DOCUMENTS.map((d) => d.id).filter((x) => x !== 'droit'), ouvreFiche: FICHE_ID } })] }),
    declencheurs: [
      { id: 'compte', quand: apresFiche(FICHE_ID),
        semer: (prenom) => ({ mails: [mail(prenom, 'Ton compte rendu', `Bonjour ${prenom},\n\nJ’ai ta fiche. Écris-moi en quelques lignes à qui tu confies `
          + 'chaque colis et ce que ça coûte : je confirme les réservations derrière toi.\n\nNathalie', { extra: { phrases: phrases(D, prenom) } })] }) },
      { id: 'fin', quand: (db) => phrasesJustes(db, PHRASES_ID).envoye,
        semer: (prenom) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}. Je regarde ta fiche et ton compte rendu.\n\nNathalie`, { decale: 1000 })] }) },
    ],
  };

  // ── les jalons
  const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };
  const W = O.poids;
  const G = { col: `Les réservations de ${D.collegue || ''}`, exp: 'Les expéditions', compte: 'Le compte rendu' };
  const surFiche = (id, titre, groupe, juste, poids = W[id]) => ({ id, titre, groupe, poids, ecran: `fiche:${FICHE_ID}`,
    verifier(db) { if (!envoyee(db, FICHE_ID)) return attente; return juste(valeursDe(db, FICHE_ID)) ? ok : ko; } });
  const proche = (k, attendu) => (v) => Math.abs(lireNombre(v[k]) - attendu) < 0.051;
  const ETAPES = [];
  if (D.collegue) {
    const J = travailDeSofiane(D);
    ETAPES.push(surFiche('erreurs', `Les réservations de ${D.collegue} à corriger`, G.col, (v) => Array.isArray(v.erreurs) && memes(v.erreurs, J.faux)));
    ETAPES.push(surFiche('cause', 'Pourquoi ses coûts sont trop bas', G.col, (v) => v.cause === 'reel'));
  }
  for (const E of D.expeditions) ETAPES.push(surFiche(`presta-${E.no}`, `${E.no} : son prestataire`, G.exp, (v) => v[`presta-${E.no}`] === B.presta[E.no], W[`presta-${E.no}`] ?? W.presta));
  for (const no of D.calcul || D.expeditions.map((E) => E.no)) {
    if (B.off[no].taxable != null) ETAPES.push(surFiche(`tax-${no}`, `${no} : le poids taxable`, G.exp, proche(`tax-${no}`, B.off[no].taxable), W[`tax-${no}`] ?? W.tax));
    ETAPES.push(surFiche(`cout-${no}`, `${no} : le coût`, G.exp, proche(`cout-${no}`, B.off[no].cout), W[`cout-${no}`] ?? W.cout));
  }
  if (B.danger.length) ETAPES.push(surFiche('danger', 'Les marchandises dangereuses', G.exp, (v) => Array.isArray(v.danger) && memes(v.danger, B.danger)));
  const cles = P.lignes.map((l) => l.id).filter((x) => x !== 'salutation' && x !== 'fin');
  ETAPES.push({ id: 'compte-rendu', titre: 'Le compte rendu à Nathalie', groupe: G.compte, poids: W['compte-rendu'], ecran: `phrases:${PHRASES_ID}`,
    verifier(db) { const r = phrasesJustes(db, PHRASES_ID); if (!r.envoye) return attente; return cles.every((l) => r.justes.includes(l)) ? ok : ko; } });
  const manque = ETAPES.filter((e) => typeof e.poids !== 'number');
  if (manque.length) throw new Error(`${D.code} : jalon sans poids (${manque.map((e) => e.id).join(', ')})`);

  const ficheFaite = (db) => envoyee(db, FICHE_ID);
  const rendu = (db) => phrasesJustes(db, PHRASES_ID).envoye;
  const PASTILLES = [{ libelle: 'La fiche', fait: ficheFaite }, { libelle: 'Le compte rendu', fait: rendu }];
  const SUITE = [{ vue: 'fiche', libelle: 'La fiche de travail', fait: ficheFaite }, { vue: 'mail', mail: PHRASES_ID, libelle: 'Le compte rendu à Nathalie', fait: rendu }];
  const ACCUEIL = {
    titre: O.titre, kpis: ['mail'],
    etapes: [
      ['Lire le message de Nathalie', 'Menu Messagerie. Les expéditions, la grille des prestataires et la méthode sont jointes.'],
      ['① La fiche de travail', O.etape],
      ['② Le compte rendu', 'Réponds à Nathalie, une phrase par ligne.'],
      ['Bon à savoir', MENTION],
    ],
  };
  const OPTIONS = { menu: [], exercice: O.titre, sansTrame: 'Tout se fait à l’écran', documents: DOCUMENTS, documentsStyle: STYLE, fiches: [FICHE],
    pastilles: PASTILLES, suite: SUITE, equipe: EQUIPE, ...(O.questions ? { questions: O.questions } : {}) };
  return { ID: O.id, FICHE_ID, PHRASES_ID, VOLET_ID, B, DOCUMENTS, FICHE, VOLET, ETAPES, PASTILLES, SUITE, ACCUEIL, OPTIONS };
}

// ─────────────────────────────────────────── la banque « Avant de commencer » (commune aux cinq séances)
const q = (id, rubrique, doc, enonce, choix, juste, retour) => ({ id, type: 'ouverture', de: 'nathalie', doc, rubrique, enonce, choix, juste, retour });
export const BANQUE = [
  q('taxable', 'preparation', 'poste', 'Un colis pèse 5 kg mais prend autant de place que 40 kg de marchandise. Le transporteur facture…',
    [{ v: '40', lib: '40 kg : le plus grand du poids réel et du poids volumétrique' }, { v: '5', lib: '5 kg : le poids réel' }, { v: 'moyenne', lib: 'la moyenne des deux' }], '40',
    'Un camion se remplit en poids ET en volume : l’encombrant se paie à sa place.'),
  q('aog', 'preparation', 'poste', 'Un « AOG », c’est…',
    [{ v: 'sol', lib: 'un appareil immobilisé au sol qui attend une pièce' }, { v: 'avion', lib: 'un avion-cargo' }, { v: 'douane', lib: 'un document de douane' }], 'sol',
    'Aircraft on ground : chaque heure au sol coûte, et prive le client de son appareil.'),
  q('gabarit', 'preparation', 'poste', 'Une pièce de 5 m de long doit partir. Que faut-il prévoir ?',
    [{ v: 'dedie', lib: 'Un camion dédié (plateau) : les colis standards sont limités en longueur' }, { v: 'express', lib: 'Un envoi express' }, { v: 'decouper', lib: 'La couper en deux' }], 'dedie',
    'Messagerie, express et coursier limitent la longueur des colis : au-delà, on affrète un véhicule.'),
  q('messagerie', 'preparation', 'poste', 'La messagerie, c’est…',
    [{ v: 'groupage', lib: 'un transport qui regroupe les colis de plusieurs clients dans un même camion' }, { v: 'courriel', lib: 'l’envoi de courriels' }, { v: 'dedie', lib: 'un camion pour un seul colis' }], 'groupage',
    'Le groupage partage le camion : moins cher, mais plus lent qu’un envoi dédié.'),
  q('md', 'droit', 'droit', 'Qui doit déclarer qu’un colis contient une marchandise dangereuse ?',
    [{ v: 'expediteur', lib: 'L’expéditeur : il classe, emballe, étiquette et déclare' }, { v: 'transporteur', lib: 'Le transporteur' }, { v: 'client', lib: 'Le client qui reçoit' }], 'expediteur',
    'C’est celui qui connaît la marchandise qui la déclare : l’expéditeur.'),
  q('lettre', 'droit', 'droit', 'La lettre de voiture sert à…',
    [{ v: 'preuve', lib: 'prouver le contrat de transport et ce qui a été remis au transporteur' }, { v: 'pub', lib: 'faire la publicité du transporteur' }, { v: 'paie', lib: 'payer le chauffeur' }], 'preuve',
    'En cas de perte ou d’avarie, c’est elle qui dit ce qui a été confié, et à qui.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'nathalie', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de t’y mettre, regarde les documents à gauche et réponds à mes questions.',
  documents: ['poste', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
