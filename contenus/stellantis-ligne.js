// Stellantis Sochaux — le TEMPS 2, C2.3 « contribuer au processus de logistique industrielle » (ENT-13.6 à 13.9, Terminale) : la matinée du bord
// de ligne (vue `core/types/ligne.js`), les documents, les blocs de fiche et la banque « Avant de commencer » communs. Construit le 27/10/2026
// (choix de Tristan « Les quatre, dans l'ordre conseillé » : le 4e bloc est la vue Bord de ligne et ENT-13.6 à 13.9 ; délégation des poids et des
// questions au fil). Briefs : `docs/briefs/ENT-13.6` à `13.9` ; vue : `docs/briefs/MOTEUR-vue-bord-de-ligne.md`.
//
// RÉEL (cadrage §2, recherches du 26/10/2026 : Le Trois 13/04 et 16/07/2026, Journal de l'Automobile 13/04/2026, communiqué Stellantis du
// 05/09/2022) : environ une voiture par minute ; 3008 (environ 70 %) et 5008 (environ 30 %) sur la même ligne ; trois quarts des pièces arrivent au
// bord de ligne sur des robots autonomes qui portent une tonne ; le stock au bord de ligne ne couvre que quelques heures ; certaines pièces sont
// commandées le matin même à un équipementier voisin ; en crise, un convoi rapide de secours ; une chaîne à l'arrêt immobilise environ 1 200
// personnes ; les arrêts d'avril 2023 (manque de boîtes de vitesses, neuf jours, activité partielle). La 5008 a sept places (troisième rang), la
// 3008 cinq. Droit (résumés) : L4121-1 (sécurité), L6321-1 (adaptation au poste), R5122-1 (activité partielle).
// CONSTRUIT : les quatre postes (et le cinquième du confirmé), les quantités par contenant, les poids, les délais des robots, les stocks, la
// séquence, les camions et leurs heures, la note de Julien (prénom seul), les dates (février 2028). Le KANBAN À DEUX CONTENANTS est une méthode
// générale de l'industrie, présentée comme telle : on ne sait pas comment Sochaux appelle ses pièces. L'équipementier n'est pas nommé.
// ⚠ Le jeu de l'évaluation (13.9) est une fonction de la graine de l'élève ET de ce fichier : ne rien y changer pendant qu'une classe joue.

import { empreinte } from '../core/tirage.js';
import { ech, pied, EQUIPE, STYLE_DOCUMENTS } from './stellantis.js';
import { memes, proche } from './fabrique-fiches.js';
import { catalogueSimple } from './entreprise-commun.js';
import { etatLigne, declarationLigne, resultatLigne } from '../core/types/ligne.js';

// Ce que le moteur exige (aucun article en jeu).
export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

export const MAIL_KARIM = EQUIPE.karim.mail;
export const PERSONNES = { karim: { nom: 'Karim', role: 'chef d’équipe logistique', appel: 'Karim' } };
export const MENTION_LIGNE = 'Réels : l’usine Stellantis de Sochaux (Doubs), sa ligne unique 3008 et 5008, environ une voiture par minute, les robots qui portent une tonne, '
  + 'quelques heures de stock au bord de ligne, environ 1 200 personnes immobilisées par un arrêt (presse 2022-2026). Méthode générale (pas la procédure de Sochaux) : '
  + 'le kanban à deux contenants. Construits : les postes, les quantités, les poids, les délais, les stocks, les camions, les prénoms, les messages.';
const EQUIPE_U = { karim: { nom: 'Karim', role: 'chef d’équipe logistique (ton tuteur)', appel: 'Karim', registre: 'tu', metier: 'Chef d’équipe logistique',
  phrase: 'J’organise l’approvisionnement de la ligne : les robots, le transstockeur, les camions des fournisseurs.' } };
export const STYLE = `${STYLE_DOCUMENTS}
.st-note{background:#fbf8f1; color:#1a1915; border:1px solid #9a948a; border-radius:3px; padding:8px 12px; margin:6px 0 10px; font-family:"Segoe Print","Comic Sans MS",cursive; line-height:1.5}
`;
// L'univers passé à la fabrique.
export const U = { tuteur: { nom: 'Karim, chef d’équipe logistique', mail: MAIL_KARIM, appel: 'Karim' }, MENTION: MENTION_LIGNE, STYLE, EQUIPE: EQUIPE_U };
export const SALUT = { id: 'salutation', choix: ['Bonjour Karim,', 'Salut Karim !', 'Coucou,'], juste: 0 };
export const FIN = (prenom) => ({ id: 'fin', choix: [`Bonne journée, ${prenom}`, 'Bisous', 'À plus !'], juste: 0 });

// ─────────────────────────────────────────── la ligne (CONSTRUIT)
// Quatre postes ; un cinquième pour le confirmé (ENT-13.7). `besoin` : pièces par voiture ; `depart` : ce qui reste au bord de ligne à 6 h
// (contenant en cours, contenant d'avance) ; `stock` : contenants pleins au transstockeur.
export const POSTES = [
  { id: 'roue', poste: 'Poste 1', zone: 'roues', nom: 'Roues complètes', piece: 'roue', contenant: 'palette', par: 28, kg: 560, besoin: { 3008: 4, 5008: 4 }, depart: [12, 28], stock: 20 },
  { id: 'retro', poste: 'Poste 2', zone: 'portes', nom: 'Rétroviseurs', piece: 'retro', contenant: 'bac', par: 30, kg: 60, besoin: { 3008: 2, 5008: 2 }, depart: [20, 30], stock: 10 },
  { id: 'pdb', poste: 'Poste 3', zone: 'habitacle', nom: 'Planches de bord', piece: 'pdb', contenant: 'rack', par: 10, kg: 520, besoin: { 3008: 1, 5008: 1 }, depart: [6, 10], stock: 12 },
  { id: 'siege', poste: 'Poste 4', zone: 'sièges', nom: 'Sièges du 3e rang', piece: 'siege', contenant: 'rack', par: 6, kg: 300, besoin: { 3008: 0, 5008: 1 }, depart: [3, 6], stock: 5 },
];
export const POSTE_CONFIRME = { id: 'faisceau', poste: 'Poste 5', zone: 'câblage', nom: 'Faisceaux électriques', piece: 'faisceau', contenant: 'bac', par: 40, kg: 120,
  besoin: { 3008: 1, 5008: 1 }, depart: [16, 40], stock: 4 };
// Trois 5008 sur dix voitures (environ 30 %, comme la ligne réelle).
export const SEQUENCE = ['3008', '3008', '5008', '3008', '3008', '3008', '5008', '3008', '3008', '5008'];
export const ROBOTS = { nombre: 2, places: 2, kgMax: 1000, trajet: 5, retour: 1, urgent: 3, urgents: 2 };
export const PERSONNES_LIGNE = 1200;   // vérifié : une chaîne à l'arrêt immobilise environ 1 200 personnes
const QUI = { prenom: 'Karim', poste: 'chef d’équipe logistique' };
const LIEU = 'Montage · ligne Peugeot 3008 / 5008 · équipe du matin';
export const DECISIONS = (contenant) => [
  { v: 'secours', lib: 'Demander un convoi de secours à l’équipementier et prévenir Sandrine, la cheffe d’atelier du montage', juste: true, secours: true,
    retour: 'Karim : « Je préviens Sandrine. Le convoi part tout de suite. »' },
  { v: 'attendre', lib: 'Attendre le camion : il finira bien par arriver', retour: 'Karim : « D’accord… On croise les doigts. »' },
  { v: 'vider', lib: `Envoyer tout de suite tous les ${contenant}s du transstockeur au bord de ligne`,
    retour: 'Karim : « Le bord de ligne n’a que deux places par poste, et ça ne change rien au total qui reste. »' },
];
const lent = (niveau, s) => (niveau === 'accompagne' ? Math.round(s * 1.5 * 10) / 10 : s);
const base = (o) => ({ libelle: 'Bord de ligne', lieu: LIEU, qui: QUI, debut: '06:00', modeles: [{ id: '3008' }, { id: '5008', long: true }], sequence: SEQUENCE,
  robots: ROBOTS, personnes: PERSONNES_LIGNE, ...o });
const copiePostes = (L = POSTES) => L.map((p) => ({ ...p, depart: p.depart.slice(), besoin: { ...p.besoin } }));

// ENT-13.6 : la matinée guidée, 6 h - 7 h.
export const ligne136 = (g, { niveau = 'standard' } = {}) => base({ id: 'st-ligne-136', titre: 'Mardi 1er février 2028, la matinée guidée', temps: 'guidage',
  minutes: 60, secondes: lent(niveau, 2), postes: copiePostes(), fin: 'Fin de la matinée guidée : 7 h, l’équipe suivante prend le relais.' });
// ENT-13.7 : la matinée sans aide, 6 h - 7 h 30 ; le confirmé a un cinquième poste.
export const ligne137 = (g, { niveau = 'standard' } = {}) => base({ id: 'st-ligne-137', titre: 'Mercredi 2 février 2028, la matinée sans aide', temps: 'entrainement',
  minutes: 90, secondes: lent(niveau, 1.2), postes: copiePostes(niveau === 'confirme' ? [...POSTES, POSTE_CONFIRME] : POSTES),
  fin: 'Fin de la matinée : 7 h 30.' });
// ENT-13.8 : le camion de planches de bord en retard (trois racks seulement au transstockeur).
export const CAMION_138 = { poste: 'pdb', annonce: '06:20', prevu: '06:30', arrivee: '07:15', contenants: 8, secours: '06:38', de: 'Karim', decisions: DECISIONS('rack') };
export const ligne138 = (g, { niveau = 'standard' } = {}) => base({ id: 'st-ligne-138', titre: 'Jeudi 3 février 2028, le camion de l’équipementier', temps: 'entrainement',
  minutes: 90, secondes: lent(niveau, 1.2), postes: copiePostes().map((p) => (p.id === 'pdb' ? { ...p, stock: 3 } : p)), camion: CAMION_138,
  fin: 'Fin de la matinée : 7 h 30.' });

// ENT-13.9 : l'évaluation, un jeu tiré par élève. `rot` : la séquence décalée ; `depart` : le contenant en cours de chaque poste ; le camion.
// Contrôle d'équité (bloc `stellantis-ligne`) : pour chaque jeu, un joueur qui groupe et appelle le convoi n'a aucun arrêt ; un joueur qui envoie
// une carte par robot avec deux minutes de retard en a, ou part à moitié vide.
export const JEUX_139 = [
  { rot: 2, depart: { roue: 24, retro: 8, pdb: 5, siege: 6 }, pdbStock: 4, camion: { annonce: '06:20', prevu: '06:30', arrivee: '07:10', secours: '06:36' } },
  { rot: 3, depart: { roue: 16, retro: 14, pdb: 8, siege: 4 }, pdbStock: 4, camion: { annonce: '06:25', prevu: '06:35', arrivee: '07:20', secours: '06:43' } },
  { rot: 5, depart: { roue: 8, retro: 26, pdb: 4, siege: 2 }, pdbStock: 3, camion: { annonce: '06:15', prevu: '06:25', arrivee: '07:05', secours: '06:33' } },
  { rot: 7, depart: { roue: 20, retro: 10, pdb: 7, siege: 5 }, pdbStock: 4, camion: { annonce: '06:30', prevu: '06:40', arrivee: '07:25', secours: '06:48' } },
];
export const indiceJeu139 = (graine) => empreinte(`${graine || ''}|stellantis-evaluation-ligne`) % JEUX_139.length;
export const ligne139 = (g) => {
  const J = JEUX_139[indiceJeu139(g)];
  return base({ id: 'st-ligne-139', titre: 'Vendredi 4 février 2028, l’évaluation', temps: 'evaluation', minutes: 90, secondes: 1.3,
    sequence: SEQUENCE.slice(J.rot).concat(SEQUENCE.slice(0, J.rot)),
    postes: copiePostes().map((p) => ({ ...p, depart: [J.depart[p.id], p.par], stock: p.id === 'pdb' ? J.pdbStock : p.stock })),
    camion: { poste: 'pdb', contenants: 8, de: 'Karim', decisions: DECISIONS('rack'), ...J.camion },
    fin: 'Fin de la matinée : 7 h 30. Écris ton compte rendu à Karim, puis rends ta copie.' });
};
// Les titres des jalons de la matinée.
export const TITRES_LIGNE = { voitures: 'Les voitures montées', arret: 'La ligne sans arrêt', groupes: 'Des robots bien remplis', heure: 'L’heure d’arrêt calculée',
  perdues: 'Les voitures perdues calculées', decision: 'La décision', complet: 'La matinée finie' };
// Le résumé de la première matinée d'un élève (compte rendu par phrases).
export const matineeDe = (decl, seance, db) => { const D = declarationLigne(decl, db || {}); return { D, R: resultatLigne(D, etatLigne(db || {}, seance, D.id)) }; };

// ─────────────────────────────────────────── les documents
const doc = (id, titre, court, corps) => ({ id, titre, court, html: typeof corps === 'function'
  ? (db) => `<article class="st-doc" aria-label="${ech(titre)}">${corps(db)}</article>` : `<article class="st-doc" aria-label="${ech(titre)}">${corps}</article>` });
const PIED_CONSTRUIT = 'Postes, quantités, poids, délais et stocks CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.';
export const DOC_KANBAN = doc('kanban', 'Le kanban à deux contenants', 'Le kanban', `<p class="st-t">Le kanban à deux contenants</p>
  <p class="st-st">Une méthode générale de l’industrie (ce n’est pas la procédure de Sochaux, qui n’est pas publiée)</p>
  <ul class="st-ul">
    <li>Au pied de chaque poste, <b>deux contenants</b> de la même pièce : celui <b>en cours</b>, où l’opérateur prend ses pièces, et celui <b>d’avance</b>, plein.</li>
    <li>Quand le contenant en cours est <b>vide</b>, l’opérateur passe au contenant d’avance et met la <b>carte</b> du contenant vide dans la <b>boîte kanban</b>.</li>
    <li>La carte dit <b>quoi rapporter</b> : la pièce, le poste, le contenant et sa quantité.</li>
    <li>La logistique rapporte un contenant plein <b>avant que le contenant d’avance soit vide</b>. Sinon le poste manque de pièces, et la ligne s’arrête.</li>
    <li>Ici, ce sont des <b>robots</b> qui portent les contenants du transstockeur au bord de ligne : deux contenants et 1 000 kg au plus par robot.</li>
  </ul>
  <p>Le stock au bord de ligne ne couvre que <b>quelques heures</b> : il n’y a pas la place, et un stock immobilise de l’argent.</p>
  ${pied('Méthode générale, présentée comme telle. Réel (presse 2022-2026) : les robots qui portent une tonne, quelques heures de stock au bord de ligne. Document pédagogique — reconstitution, non contractuel.')}`);
export const DOC_LIGNE = doc('postes-ligne', 'Les postes de la ligne', 'Les postes', `<p class="st-t">Les postes que tu approvisionnes</p>
  <p class="st-st">Ligne Peugeot 3008 / 5008 — une voiture par minute ; sur dix voitures, trois sont des 5008</p>
  <table class="st-table"><thead><tr><th scope="col">Poste</th><th scope="col">Pièce</th><th scope="col">Contenant</th><th scope="col" class="st-d">Poids plein</th><th scope="col" class="st-d">Par 3008</th><th scope="col" class="st-d">Par 5008</th></tr></thead><tbody>
  ${[...POSTES, POSTE_CONFIRME].map((p) => `<tr><td>${ech(p.poste)} · ${ech(p.zone)}${p === POSTE_CONFIRME ? ' <i>(certains jours)</i>' : ''}</td><td>${ech(p.nom)}</td><td>${ech(p.contenant)} de ${p.par}</td><td class="st-d">${p.kg} kg</td><td class="st-d">${p.besoin[3008]}</td><td class="st-d">${p.besoin[5008]}</td></tr>`).join('')}
  </tbody></table>
  <p style="margin-top:10px">Les robots : <b>deux</b> ; chacun porte <b>2 contenants et 1 000 kg</b> au plus. Du transstockeur au bord de ligne : <b>5 minutes</b> (3 en appel urgent,
    deux appels urgents par matinée) ; retour : 1 minute.</p>
  <p>La 5008 a sept places : c’est la seule à prendre des sièges du 3e rang.</p>
  ${pied(PIED_CONSTRUIT)}`);
export const DOC_POSTE2 = doc('poste-2', 'Le poste 2 à 6 h 40', 'Le poste 2', `<p class="st-t">Le poste 2 (portes) à 6 h 40</p>
  <p class="st-st">Ce que tu lis au bord de ligne</p>
  <ul class="st-ul"><li>Bac <b>en cours</b> : <b>12</b> rétroviseurs.</li><li>Bac <b>d’avance</b> : <b>30</b> rétroviseurs (plein).</li>
    <li>Chaque voiture, 3008 ou 5008, prend <b>2</b> rétroviseurs ; la ligne monte <b>une voiture par minute</b>.</li><li>Le robot met <b>5 minutes</b> du transstockeur au bord de ligne.</li></ul>
  ${pied(PIED_CONSTRUIT)}`);
export const DOC_HEURE = doc('ligne-heure', 'La ligne en une heure', 'Une heure', `<p class="st-t">La ligne en une heure</p>
  <p class="st-st">Avant de prendre la matinée, Karim te demande de compter ce qu’elle consomme</p>
  <ul class="st-ul"><li>Une voiture par minute : <b>60 voitures</b> en une heure.</li><li>Sur dix voitures, <b>trois sont des 5008</b>.</li>
    <li>Chaque voiture prend <b>4 roues</b> ; une palette contient <b>28 roues</b>.</li><li>Seule la 5008 prend un <b>siège du 3e rang</b> ; un rack en contient <b>6</b>.</li>
    <li>Un robot fait un aller-retour en <b>6 minutes</b> (5 minutes à l’aller, 1 au retour) ; il y a <b>deux robots</b>.</li></ul>
  ${pied(PIED_CONSTRUIT)}`);
export const DOC_NOTE = doc('note-julien', 'La note de Julien', 'La note', `<p class="st-t">La note de Julien sur l’arrêt d’hier</p>
  <p class="st-st">Julien, cariste de l’équipe d’après-midi, a laissé cette note à Karim</p>
  <div class="st-note">Mercredi après-midi. Le camion de sièges du 3e rang était prévu à 8 h 30 ; il est arrivé à 9 h 40. Plus aucun rack de sièges au transstockeur depuis 8 h 55.<br>
    La ligne s’est arrêtée de 9 h 12 à 9 h 40 : <b>28 minutes d’arrêt</b>, donc <b>28 voitures perdues</b> (une par minute).<br>
    Temps perdu : 28 × 1 200 personnes = <b>33 600 heures perdues</b>.<br>
    Cause : <b>le cariste du bord de ligne n’a pas envoyé le robot assez tôt</b>.<br>— Julien</div>
  <p>Une chaîne à l’arrêt immobilise environ <b>1 200 personnes</b> (chiffre réel). Une heure, c’est 60 minutes.</p>
  ${pied('Note, horaires et arrêt CONSTRUITS pour l’exercice. Document pédagogique — reconstitution, non contractuel.')}`);
// Le poste du jour de chaque jeu : son contenant en cours à 6 h (celui de la matinée tirée), le contenant d'avance plein.
export const POSTES_139 = [
  { nom: 'le poste 2 (portes)', piece: 'rétroviseurs', enCours: 8, avance: 30, par: 2 },
  { nom: 'le poste 3 (habitacle)', piece: 'planches de bord', enCours: 8, avance: 10, par: 1 },
  { nom: 'le poste 1 (roues)', piece: 'roues', enCours: 8, avance: 28, par: 4 },
  { nom: 'le poste 1 (roues)', piece: 'roues', enCours: 20, avance: 28, par: 4 },
]
export const posteJour = (graine) => POSTES_139[indiceJeu139(graine)];
export const docPosteJour = (get) => doc('poste-jour', 'Le poste du jour', 'Le poste', (db) => { const P = get(db);
  return `<p class="st-t">Ce que tu lis au bord de ligne, ${ech(P.nom)}</p>
  <ul class="st-ul"><li>Contenant <b>en cours</b> : <b>${P.enCours}</b> ${ech(P.piece)}.</li><li>Contenant <b>d’avance</b> : <b>${P.avance}</b> ${ech(P.piece)} (plein).</li>
    <li>Chaque voiture prend <b>${P.par}</b> ${ech(P.piece)} ; la ligne monte <b>une voiture par minute</b>.</li><li>Le robot met <b>5 minutes</b> du transstockeur au bord de ligne.</li></ul>
  ${pied(PIED_CONSTRUIT)}`; });
// Le droit des trois séances dans un seul document (la banque « Avant de commencer » est commune et tirée).
export const DOC_DROIT = doc('droit', 'Le droit', 'Le droit', `<p class="st-t">Le droit</p><p class="st-st">Code du travail (résumés)</p>
  <p><b>L4121-1 — la sécurité.</b></p>
  <p class="st-loi">L’employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé de ses salariés : prévenir les risques, informer, former, organiser le travail.</p>
  <p><b>L6321-1 — l’adaptation au poste.</b></p>
  <p class="st-loi">L’employeur assure l’adaptation des salariés à leur poste de travail. Il veille à ce qu’ils restent capables d’occuper un emploi, notamment quand les emplois, les technologies et l’organisation changent.
    Une formation nécessaire pour tenir son poste se fait sur le temps de travail, avec le salaire maintenu (L6321-2).</p>
  <p><b>R5122-1 — l’activité partielle.</b></p>
  <p class="st-loi">L’employeur peut placer ses salariés en activité partielle quand il doit réduire ou arrêter temporairement son activité, notamment pour : la conjoncture économique ;
    des <b>difficultés d’approvisionnement</b> en matières premières ou en énergie ; un sinistre ou des intempéries exceptionnels ; une transformation de l’entreprise ; toute autre circonstance exceptionnelle.
    Les salariés reçoivent une indemnité versée par l’employeur, en partie remboursée par l’État (après autorisation de l’administration).</p>
  ${pied('Textes réels, résumés — source : Code du travail (Légifrance). Réel : en avril 2023, Sochaux s’est arrêté neuf jours faute de boîtes de vitesses, avec de l’activité partielle (presse locale).')}`);

// ─────────────────────────────────────────── les blocs de fiche
const choix = (id, lib, L, manque) => ({ type: 'choix', id, lib, colonne: true, manque, choix: L });
// ENT-13.6, « Le kanban ».
export const blocsKanban = () => [
  choix('quand', 'La carte tombe dans la boîte quand…', [{ v: 'vide', lib: 'le contenant en cours est vide' }, { v: 'moitie', lib: 'le contenant en cours est à moitié vide' },
    { v: 'deux', lib: 'les deux contenants sont vides' }], 'quand la carte tombe'),
  choix('dit', 'La carte dit…', [{ v: 'quoi', lib: 'quoi rapporter : la pièce, le poste, le contenant et sa quantité' }, { v: 'qui', lib: 'qui doit aller chercher la pièce' },
    { v: 'prix', lib: 'le prix de la pièce' }], 'ce que dit la carte'),
  choix('deux', 'Deux contenants par poste, c’est pour…', [{ v: 'temps', lib: 'laisser le temps de rapporter un contenant plein pendant que le poste travaille sur l’autre' },
    { v: 'stock', lib: 'avoir le plus de stock possible au bord de ligne' }, { v: 'tri', lib: 'trier les pièces bonnes et mauvaises' }], 'pourquoi deux contenants'),
];
export const jalonsKanban = ({ poids, groupe }) => [
  { id: 'kanban-quand', titre: 'Quand tombe la carte', groupe, poids, attendu: 'quand le contenant en cours est vide', juste: (v) => v.quand === 'vide' },
  { id: 'kanban-dit', titre: 'Ce que dit la carte', groupe, poids, attendu: 'la pièce, le poste, le contenant et sa quantité', juste: (v) => v.dit === 'quoi' },
  { id: 'kanban-deux', titre: 'Pourquoi deux contenants', groupe, poids, attendu: 'le temps de rapporter un plein pendant que le poste travaille sur l’autre', juste: (v) => v.deux === 'temps' },
];
// La couverture d'un poste (ENT-13.6 : le poste 2 ; ENT-13.9 : le poste du jour, tiré). `tient` = (en cours + avance) / par ; `vide` = en cours / par ;
// `tard` = avance / par − 5 (le contenant d'avance tient `avance / par` minutes, le robot en met 5).
export const couv = (P) => ({ tient: Math.floor((P.enCours + P.avance) / P.par), vide: Math.floor(P.enCours / P.par), tard: Math.floor(P.avance / P.par) - 5 });
export const POSTE2 = { enCours: 12, avance: 30, par: 2 };
export const blocsCouverture = ({ vide = true } = {}) => [
  { type: 'nombre', id: 'tient', lib: 'Combien de voitures le poste tient-il avec ses deux contenants ?', unite: 'voitures', min: 0, entier: true, manque: 'combien de voitures il tient' },
  ...(vide ? [{ type: 'nombre', id: 'vide', lib: 'Dans combien de minutes le contenant en cours sera-t-il vide ?', unite: 'min', min: 0, entier: true, manque: 'quand il sera vide' }] : []),
  { type: 'nombre', id: 'tard', lib: 'La carte vient de tomber : au plus tard combien de minutes après dois-tu envoyer le robot ?', unite: 'min', min: 0, entier: true, manque: 'au plus tard quand envoyer' },
];
export const jalonsCouverture = (get, { poids, groupe, vide = true }) => { const P = (db) => (typeof get === 'function' ? get(db) : get); return [
  { id: 'couv-tient', titre: 'Ce que tient le poste', groupe, poids, attendu: (db) => `(${P(db).enCours} + ${P(db).avance}) ÷ ${P(db).par} = ${couv(P(db)).tient} voitures`, juste: (v, db) => proche(v.tient, couv(P(db)).tient) },
  ...(vide ? [{ id: 'couv-vide', titre: 'Quand le contenant en cours sera vide', groupe, poids, attendu: (db) => `${P(db).enCours} ÷ ${P(db).par} = ${couv(P(db)).vide} min`, juste: (v, db) => proche(v.vide, couv(P(db)).vide) }] : []),
  { id: 'couv-tard', titre: 'Au plus tard quand envoyer le robot', groupe, poids, attendu: (db) => `${P(db).avance} ÷ ${P(db).par} = ${P(db).avance / P(db).par} min de contenant d’avance, moins 5 min de trajet = ${couv(P(db)).tard} min`,
    juste: (v, db) => proche(v.tard, couv(P(db)).tard) },
]; };
// ENT-13.7, « Ce que consomme la ligne ». 60 voitures × 3/10 = 18 5008 ; 18 sièges ÷ 6 = 3 racks ; 60 × 4 = 240 roues ÷ 28 ≈ 8,6 palettes ;
// 2 robots × 60 ÷ 6 = 20 allers-retours.
export const CONSO = { cinq: 18, racks: 3, palettes: 240 / 28, allers: 20 };
export const blocsConso = () => [
  { type: 'nombre', id: 'cinq', lib: 'Combien de 5008 la ligne monte-t-elle en une heure ?', unite: 'voitures', min: 0, entier: true, manque: 'le nombre de 5008' },
  { type: 'nombre', id: 'racks', lib: 'Combien de racks de sièges du 3e rang consomme-t-elle en une heure ?', unite: 'racks', min: 0, manque: 'les racks de sièges' },
  { type: 'nombre', id: 'palettes', lib: 'Combien de palettes de roues consomme-t-elle en une heure (au dixième près) ?', unite: 'palettes', min: 0, manque: 'les palettes de roues' },
  { type: 'nombre', id: 'allers', lib: 'Combien d’allers-retours les deux robots peuvent-ils faire en une heure ?', unite: 'allers-retours', min: 0, entier: true, manque: 'les allers-retours' },
  choix('conclusion', 'Les quatre postes vident plus de 20 contenants par heure. Donc…', [{ v: 'grouper', lib: 'il faut mettre deux cartes par robot dès que le poids le permet' },
    { v: 'un', lib: 'une carte par robot suffit largement' }, { v: 'urgent', lib: 'il faut tout envoyer en appel urgent' }], 'la conclusion'),
];
export const jalonsConso = ({ poids, groupe }) => [
  { id: 'conso-cinq', titre: 'Les 5008 en une heure', groupe, poids, attendu: '60 × 3 ÷ 10 = 18', juste: (v) => proche(v.cinq, CONSO.cinq) },
  { id: 'conso-racks', titre: 'Les racks de sièges', groupe, poids, attendu: '18 sièges ÷ 6 = 3 racks', juste: (v) => proche(v.racks, CONSO.racks) },
  { id: 'conso-palettes', titre: 'Les palettes de roues', groupe, poids, attendu: '60 × 4 = 240 roues ; 240 ÷ 28 ≈ 8,6 palettes', juste: (v) => proche(v.palettes, CONSO.palettes, 0.06) },
  { id: 'conso-allers', titre: 'Les allers-retours des robots', groupe, poids, attendu: '2 robots × 60 ÷ 6 = 20', juste: (v) => proche(v.allers, CONSO.allers) },
  { id: 'conso-conclusion', titre: 'La conclusion', groupe, poids, attendu: 'deux cartes par robot dès que le poids le permet', juste: (v) => v.conclusion === 'grouper' },
];
// ENT-13.8, « La note de Julien » (erreur induite). Les deux erreurs : les « heures » (ce sont des minutes de travail : 28 × 1 200 = 33 600 minutes
// = 560 heures) et la cause (plus aucun rack au transstockeur depuis 8 h 55 : c'est le camion en retard, pas le cariste).
export const NOTE = [
  { v: 'minutes', lib: '28 minutes d’arrêt' },
  { v: 'voitures', lib: '28 voitures perdues' },
  { v: 'heures', lib: '33 600 heures perdues', faux: true },
  { v: 'cause', lib: 'La cause : le cariste n’a pas envoyé le robot assez tôt', faux: true },
];
export const HEURES_PERDUES = 560;
export const blocsNote = () => [
  { type: 'cases', id: 'erreurs', titre: 'Ce qui est FAUX dans la note de Julien', choix: NOTE.map(({ v, lib }) => ({ v, lib })) },
  { type: 'nombre', id: 'heures', lib: 'Le temps de travail vraiment perdu, en heures', unite: 'h', min: 0, manque: 'le temps perdu en heures' },
];
export const jalonsNote = ({ erreurs, heures, groupe }) => [
  { id: 'note-erreurs', titre: 'Les erreurs de Julien', groupe, poids: erreurs, attendu: NOTE.filter((x) => x.faux).map((x) => x.lib).join(' ; '),
    juste: (v) => memes(v.erreurs || [], NOTE.filter((x) => x.faux).map((x) => x.v)) },
  { id: 'note-heures', titre: 'Le temps perdu, corrigé', groupe, poids: heures, attendu: '28 × 1 200 = 33 600 minutes ; 33 600 ÷ 60 = 560 heures',
    juste: (v) => proche(v.heures, HEURES_PERDUES) },
];

// ─────────────────────────────────────────── la banque « Avant de commencer » (préparation : la ligne ; droit : la loi)
const q = (id, rubrique, docu, enonce, L, juste, retour) => ({ id, type: 'ouverture', de: 'karim', doc: docu, rubrique, enonce, choix: L, juste, retour });
export const BANQUE = [
  q('bord', 'preparation', 'kanban', 'Le bord de ligne, c’est…', [{ v: 'pied', lib: 'l’endroit, au pied de chaque poste, où l’on pose les pièces qu’il monte' },
    { v: 'quai', lib: 'le quai où arrivent les camions' }, { v: 'bureau', lib: 'le bureau du chef d’équipe' }], 'pied', 'Les pièces attendent au pied du poste, dans leurs contenants.'),
  q('minute', 'preparation', 'postes-ligne', '« Une voiture par minute », pour un poste qui prend 4 roues par voiture, c’est…', [{ v: '4', lib: '4 roues par minute' },
    { v: '1', lib: '1 roue par minute' }, { v: '60', lib: '60 roues par minute' }], '4', 'Chaque minute, une voiture passe, et prend ses 4 roues.'),
  q('carte', 'preparation', 'kanban', 'La carte kanban d’un poste tombe quand…', [{ v: 'vide', lib: 'son contenant en cours est vide' }, { v: 'chef', lib: 'le chef d’équipe le décide' },
    { v: 'heure', lib: 'il est l’heure de la pause' }], 'vide', 'La carte du contenant vide part dans la boîte : c’est la commande.'),
  q('robot', 'preparation', 'postes-ligne', 'Un robot peut-il emporter une palette de roues (560 kg) et un rack de planches de bord (520 kg) ensemble ?', [{ v: 'non', lib: 'non : 1 080 kg, plus que ses 1 000 kg' },
    { v: 'oui', lib: 'oui : ce sont deux contenants' }, { v: 'urgent', lib: 'oui, en appel urgent' }], 'non', 'Deux contenants ET 1 000 kg au plus : les deux conditions comptent.'),
  q('grouper', 'preparation', 'postes-ligne', 'Deux cartes attendent, un rack de sièges (300 kg) et une palette de roues (560 kg). Que fais-tu ?', [{ v: 'un', lib: 'je les mets dans le même robot (860 kg)' },
    { v: 'deux', lib: 'j’envoie deux robots, un par carte' }, { v: 'attendre', lib: 'j’attends une troisième carte' }], 'un', 'Un seul robot : l’autre reste libre pour la carte suivante.'),
  q('secours', 'preparation', 'postes-ligne', 'Un camion de pièces est annoncé en retard. Le premier geste, c’est…', [{ v: 'calcul', lib: 'calculer à quelle heure la ligne manquera de cette pièce' },
    { v: 'rien', lib: 'attendre qu’il arrive' }, { v: 'vider', lib: 'vider tout de suite le transstockeur au bord de ligne' }], 'calcul', 'On calcule d’abord : c’est ce qui dit s’il faut un convoi de secours.'),
  q('securite', 'droit', 'droit', 'Les robots roulent dans l’allée de l’atelier. Qui doit assurer la sécurité des salariés ?', [{ v: 'employeur', lib: 'l’employeur' },
    { v: 'salaries', lib: 'chaque salarié, seul' }, { v: 'fabricant', lib: 'le fabricant des robots, seul' }], 'employeur', 'Code du travail, L4121-1 : l’employeur prend les mesures nécessaires.'),
  q('adaptation', 'droit', 'droit', 'L’usine remplace un chariot par des robots. Doit-elle former ses caristes à ce changement ?', [{ v: 'oui', lib: 'oui : l’employeur adapte les salariés à leur poste' },
    { v: 'non', lib: 'non : c’est à eux d’apprendre seuls' }, { v: 'licencier', lib: 'non : elle peut les licencier' }], 'oui', 'Code du travail, L6321-1 : l’employeur assure l’adaptation des salariés à leur poste.'),
  q('partielle', 'droit', 'droit', 'La ligne s’arrête plusieurs jours faute de pièces. Que peut demander l’usine ?', [{ v: 'partielle', lib: 'l’activité partielle (difficultés d’approvisionnement)' },
    { v: 'conges', lib: 'imposer à tous des congés sans solde' }, { v: 'rien', lib: 'rien : les salariés ne sont pas payés' }], 'partielle', 'Code du travail, R5122-1 : les difficultés d’approvisionnement font partie des motifs.'),
];
export const OUVERTURE = (o = {}) => ({ id: 'avant-de-commencer', de: 'karim', titre: 'Avant de commencer', continuer: 'voir l’accueil',
  situation: 'Bonjour ! Avant de commencer, lis les documents à gauche et réponds à mes questions.', documents: ['kanban', 'postes-ligne', 'droit'], tirage: { preparation: 2, droit: 1 }, questions: BANQUE.map((x) => x.id), ...o });
export { memes };
// La ligne du compte rendu sur SA matinée (la première finie) : la phrase juste et deux fausses, toujours distinctes.
const min = (x) => `${x} minute${x > 1 ? 's' : ''} d’arrêt`;
export const ligneMatinee = (R, minutes) => (!R
  ? { id: 'matinee', choix: ['J’ai tenu la matinée jusqu’au bout.', 'Je n’ai pas fini la matinée.', 'Je n’ai envoyé aucun robot.'], juste: 0 }
  : { id: 'matinee', choix: [`Ce matin, la ligne a monté ${R.n} voitures sur ${minutes}, avec ${R.arret ? min(R.arret) : 'aucune minute d’arrêt'}.`,
    `Ce matin, la ligne a monté ${R.n} voitures sur ${minutes}, avec ${min(R.arret + 4)}.`,
    `Ce matin, la ligne a monté ${Math.max(0, R.n - 6)} voitures sur ${minutes}, avec ${R.arret ? min(R.arret) : 'aucune minute d’arrêt'}.`], juste: 0 });
export const LIGNE_GROUPER = { id: 'grouper', choix: ['Je mets deux cartes dans le même robot dès que le poids le permet (1 000 kg au plus).',
  'Je mets toujours une seule carte par robot, c’est plus sûr.', 'Je charge trois contenants par robot pour gagner du temps.'], juste: 0 };
export const LIGNE_DECISION = { id: 'decision', choix: ['Le camion de planches de bord était en retard : j’ai demandé le convoi de secours et prévenu Sandrine.',
  'Le camion de planches de bord était en retard : j’ai attendu qu’il arrive.', 'Le camion de planches de bord était en retard : j’ai vidé le transstockeur au bord de ligne.'], juste: 0 };
