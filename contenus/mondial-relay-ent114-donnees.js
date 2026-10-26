// ENT-11.4 — Mondial Relay, « évaluation : le samedi du pic » : les DONNÉES de la séance (jeu tiré par élève, tournées, chauffeurs,
// camions, imprévu, solveur). Brief : `docs/briefs/ENT-11.4-mondial-relay-evaluation-planning.md`. Univers : `contenus/mondial-relay.js`.
// Contenu (écrans, messages, jalons) : `contenus/mondial-relay-ent114.js`. Questions : `contenus/questions/ENT-11.4.js`. Corrigé :
// `contenus/corriges/ENT-11.4.js`. Données pures : aucun import du moteur (le corrigé et les questions importent ce fichier).
//
// LE JEU DE CHAQUE ÉLÈVE (graine = l'identifiant de l'élève, `db.tirage.graine`) — tiré, jamais écrit en dur dans un jalon :
//   - qui sont les six chauffeurs (prénoms d'une banque) et dans quel ordre de lignes ;
//   - leur situation : trois chauffeurs « libres » (permis C), un chauffeur « tardif » (permis C, fin de service hier entre 19:30 et 21:00,
//     il ne peut pas partir avant 06:30 à 08:00), un chauffeur au permis B (fourgon seulement), un chauffeur « au repos » (fin de service hier
//     entre 22:30 et 23:30 : il ne peut partir qu'à partir de 09:30, aucune tournée ne le permet — il n'a donc jamais de tournée, comme
//     l'indique son repos de 11 h) ;
//   - la durée de conduite de T5 (4 h 10 à 4 h 50) ;
//   - l'imprévu de 5 h 30 (1 parmi 3) : un camion en panne, un chauffeur malade, ou T2 doublée par le volume du pic.
// ÉQUITÉ : le tirage est refait (`#1`, `#2`…) tant qu'il n'existe pas AU MOINS UNE solution juste avant l'imprévu ET après (solveur
// ci-dessous, validé contre le vrai moteur par le bloc `mr-11.4`). Cinq chauffeurs utilisables pour cinq tournées : tous sont nécessaires,
// donc l'imprévu touche toujours le planning de l'élève (panne : les cinq camions servent ; malade : le chauffeur malade travaillait ;
// doublée : une carte de plus à poser).
// CONSTRUIT (rien n'est vérifié, tout est dit comme tel à l'écran) : les tournées (communes et codes postaux réels, tournées construites),
// leurs horaires, les chauffeurs et leurs horaires d'hier, les camions, les renforts, tous les messages.

import { tirerJeu, graineDeBase } from '../core/tirage.js';

export const ID = 'mondial-relay-evaluation-planning';
export const PL = 'mr-chauffeurs';
export const MSG = 'message-samia';
export const ID_VOLET = 'mr-ent114';
export const SCENARIO = { date: '2026-12-12' };           // samedi 12 décembre 2026 (un samedi du pic)

export { graineDeBase };
export const mm = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
const pad = (n) => String(n).padStart(2, '0');
export const hm = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
export const duree = (min) => `${Math.floor(min / 60)} h${min % 60 ? ` ${pad(min % 60)}` : ''}`;
export const ech = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// L'échelle du planning : 05:00 à 16:00 au quart d'heure (44 créneaux). Un créneau = 15 min depuis 05:00.
export const ECHELLE = { type: 'heures', debut: '05:00', fin: '16:00', pas: 15 };
export const creneau = (hhmm) => Math.round((mm(hhmm) - 300) / 15);
const MAX_CONDUITE = 270;                                 // 4 h 30
const REPOS = 11 * 60;

// ─────────────────────────────────────────────────────────────── les tournées (celles du plan de tri de l'agence, `contenus/mondial-relay.js`)
// `service` = la durée du bloc ; `conduite` = ce que jugent 4 h 30 et 9 h ; `camion` : 'porteur' (obligatoire) ou 'petit' (fourgon ou porteur).
// Départ au plus tôt `des` (les colis sont prêts), retour au hub avant `avant`. T5 : la conduite est TIRÉE (voir `jeuDe`).
export const TOURNEES_114 = [
  { id: 't1', court: 'T1 Troyes', nom: 'Troyes', des: '06:00', avant: '12:30', service: 240, conduite: 135, km: 70, camion: 'petit', lieux: 'Troyes' },
  { id: 't2', court: 'T2 Agglo ouest', nom: 'Agglo ouest', des: '06:00', avant: '12:30', service: 255, conduite: 150, km: 85, camion: 'petit',
    lieux: 'Sainte-Savine, La Chapelle-Saint-Luc, Saint-André-les-Vergers, Rosières-près-Troyes, Pont-Sainte-Marie' },
  { id: 't3', court: 'T3 Sud', nom: 'Sud', des: '06:00', avant: '14:00', service: 390, conduite: 210, km: 190, camion: 'porteur',
    lieux: 'Saint-Julien-les-Villas, Buchères, Bréviandes, Bar-sur-Seine, Chaource, Les Riceys' },
  { id: 't4', court: 'T4 Nord-ouest', nom: 'Nord-ouest', des: '06:00', avant: '14:00', service: 330, conduite: 195, km: 160, camion: 'petit',
    lieux: 'Romilly-sur-Seine, Nogent-sur-Seine, Arcis-sur-Aube' },
  { id: 't5', court: 'T5 Est', nom: 'Est', des: '06:00', avant: '14:30', service: 420, conduite: 270, km: 230, camion: 'porteur',
    lieux: 'Bar-sur-Aube, Vendeuvre-sur-Barse, Brienne-le-Château' },
];
export const T2BIS = { id: 't2bis', court: 'T2 bis', nom: 'Agglo ouest (2e camion)', des: '06:00', avant: '12:30', service: 255, conduite: 150, km: 85, camion: 'petit',
  lieux: 'la moitié des colis de T2' };

// ─────────────────────────────────────────────────────────────── les camions (construits)
export const CAMIONS_114 = [
  { id: 'P1', nom: 'P1', genre: 'porteur', permis: 'C', note: 'porteur 12 t · permis C' },
  { id: 'P2', nom: 'P2', genre: 'porteur', permis: 'C', note: 'porteur 12 t · permis C' },
  { id: 'P3', nom: 'P3', genre: 'porteur', permis: 'C', note: 'porteur 12 t · permis C' },
  { id: 'F1', nom: 'F1', genre: 'fourgon', permis: 'B', note: 'fourgon 3,5 t · permis B ou C' },
  { id: 'F2', nom: 'F2', genre: 'fourgon', permis: 'B', note: 'fourgon 3,5 t · permis B ou C' },
];
export const RENFORT_PORTEUR = { id: 'R1', nom: 'Porteur de renfort', genre: 'porteur', permis: 'C', dispo: '08:00', note: 'porteur 12 t du hub · dès 08:00' };
export const RENFORT_FOURGON = { id: 'R1', nom: 'Fourgon de renfort', genre: 'fourgon', permis: 'B', dispo: '07:00', note: 'fourgon 3,5 t du hub · dès 07:00' };
const renfortChauffeur = (dispo) => ({ id: 'ch7', nom: 'Chauffeur de renfort', permis: 'C', dispo, renfort: true, note: `permis C · du hub · dès ${dispo}` });

// Les prénoms (construits ; aucun salarié réel). Banque de 14 : six tirés par élève.
export const NOMS = ['Kevin', 'Aurélie', 'Bastien', 'Camille', 'Dylan', 'Élodie', 'Farid', 'Gaëtan', 'Jérémy', 'Karine', 'Lucie', 'Mehdi', 'Nadège', 'Olivier'];
export const IDS_CHAUFFEURS = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];
const ROLES = ['libre', 'libre', 'libre', 'tard', 'b', 'repos'];
const FIN_HIER = { libre: [null, '17:00', '17:30', '18:00', '18:30'], tard: ['19:30', '20:00', '20:30', '21:00'], b: [null, '17:30', '18:30'], repos: ['22:30', '23:00', '23:30'] };
export const ALEAS = ['panne', 'malade', 'doublee'];

// ─────────────────────────────────────────────────────────────── les chauffeurs, camions et tournées d'un jeu (phase 1 = avant l'imprévu, 2 = après)
export function chauffeursDe(jeu, phase = 1) {
  let L = IDS_CHAUFFEURS.map((id) => {
    const r = jeu.roles[id];
    const finHier = jeu.finHier[id] || null;
    return { id, nom: jeu.noms[id], role: r, permis: r === 'b' ? 'B' : 'C', ...(finHier ? { finHier } : {}),
      note: `permis ${r === 'b' ? 'B' : 'C'} · ${finHier ? `fin de service hier ${finHier}` : 'en repos hier'}` };
  });
  if (phase >= 2 && jeu.alea === 'malade') L = L.filter((c) => c.id !== jeu.cible);
  if (phase >= 2 && jeu.alea === 'malade') L = L.concat([renfortChauffeur('07:30')]);
  if (phase >= 2 && jeu.alea === 'doublee') L = L.concat([renfortChauffeur('07:00')]);
  return L;
}
export function camionsDe(jeu, phase = 1) {
  let L = CAMIONS_114.map((k) => (phase >= 2 && jeu.alea === 'panne' && jeu.cible === k.id ? { ...k, panne: true, dispo: '19:00' } : k));
  if (phase >= 2 && jeu.alea === 'panne') L = L.concat([RENFORT_PORTEUR]);
  if (phase >= 2 && jeu.alea === 'doublee') L = L.concat([RENFORT_FOURGON]);
  return L;
}
export function tourneesDe(jeu, phase = 1) {
  const L = TOURNEES_114.map((t) => (t.id === 't5' ? { ...t, conduite: Math.min(jeu.t5, MAX_CONDUITE), conduiteTotale: jeu.t5 } : t));
  return phase >= 2 && jeu.alea === 'doublee' ? L.concat([T2BIS]) : L;
}
// La pause de 45 min d'un chauffeur qui conduit plus de 4 h 30 : prise en route, elle fait partie du service de la tournée.
export const pauseEnRoute = (conduiteTotale) => conduiteTotale > MAX_CONDUITE;

// ─────────────────────────────────────────────────────────────── le solveur (une solution juste, pour le tirage, le corrigé et les tests)
// Rend { <tournée>: { r, s, k } } (s = créneau de départ) ou null. Départ le plus tôt possible (repos de 11 h, présence du chauffeur et du camion).
const reprise = (c) => (c.finHier ? Math.max(0, mm(c.finHier) + REPOS - 1440) : 0);
export function resoudre(jeu, phase = 1) {
  const tours = tourneesDe(jeu, phase), chs = chauffeursDe(jeu, phase), ks = camionsDe(jeu, phase);
  const out = {};
  const pris = new Set(), prisK = new Set();
  const essayer = (i) => {
    if (i === tours.length) return true;
    const t = tours[i];
    const L = Math.ceil(t.service / 15), fin = Math.floor((mm(t.avant) - 300) / 15);
    for (const c of chs) {
      if (pris.has(c.id)) continue;
      for (const k of ks) {
        if (prisK.has(k.id)) continue;
        if (c.permis === 'B' && k.genre !== 'fourgon') continue;
        if (t.camion === 'porteur' && k.genre !== 'porteur') continue;
        if (k.panne) continue;
        const depart = Math.max(mm(t.des), reprise(c), c.dispo ? mm(c.dispo) : 0, k.dispo ? mm(k.dispo) : 0);
        const s = Math.ceil((depart - 300) / 15);
        if (s + L > fin) continue;
        pris.add(c.id); prisK.add(k.id); out[t.id] = { r: c.id, s, k: k.id };
        if (essayer(i + 1)) return true;
        pris.delete(c.id); prisK.delete(k.id); delete out[t.id];
      }
    }
    return false;
  };
  return essayer(0) ? JSON.parse(JSON.stringify(out)) : null;
}

// ─────────────────────────────────────────────────────────────── le tirage
function tirer(h) {
  const noms = h.prendre(NOMS, 6);
  const roles = h.melanger(ROLES);
  const jeu = { noms: {}, roles: {}, finHier: {}, t5: 250 + 5 * h.entier(0, 8), alea: h.choisir(ALEAS), cible: null };
  IDS_CHAUFFEURS.forEach((id, i) => {
    jeu.noms[id] = noms[i]; jeu.roles[id] = roles[i];
    jeu.finHier[id] = h.choisir(FIN_HIER[roles[i]]);
  });
  if (jeu.alea === 'panne') jeu.cible = h.choisir(CAMIONS_114.map((k) => k.id));
  if (jeu.alea === 'malade') jeu.cible = h.choisir(IDS_CHAUFFEURS.filter((id) => jeu.roles[id] !== 'repos'));
  return jeu;
}
// Les écarts d'équité d'un jeu (vide = conforme) : une solution avant l'imprévu ET après, T5 dans ses bornes, un seul chauffeur au repos.
export function fautes(jeu) {
  const F = [];
  if (!resoudre(jeu, 1)) F.push('aucune solution juste avant l’imprévu');
  if (!resoudre(jeu, 2)) F.push('aucune solution juste après l’imprévu');
  if (jeu.t5 < 250 || jeu.t5 > 290) F.push('conduite de T5 hors bornes');
  if (IDS_CHAUFFEURS.filter((id) => jeu.roles[id] === 'repos').length !== 1) F.push('pas exactement un chauffeur au repos');
  return F;
}
// Le jeu de secours (jamais donné si le tirage tient sa promesse : le test exige zéro secours sur des centaines de graines).
export const SECOURS = {
  noms: { ch1: 'Kevin', ch2: 'Aurélie', ch3: 'Bastien', ch4: 'Camille', ch5: 'Dylan', ch6: 'Élodie' },
  roles: { ch1: 'repos', ch2: 'libre', ch3: 'libre', ch4: 'libre', ch5: 'tard', ch6: 'b' },
  finHier: { ch1: '23:00', ch2: null, ch3: '17:00', ch4: '18:00', ch5: '20:30', ch6: null },
  t5: 270, alea: 'panne', cible: 'P1',
};
const JEUX = new Map();
export function jeuDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (!JEUX.has(g)) {
    const r = tirerJeu({ tirer: (h) => tirer(h), verifier: fautes, secours: SECOURS, essais: 40 }, g);
    JEUX.set(g, Object.freeze({ ...r.jeu, graine: g, secours: r.secours }));
  }
  return JEUX.get(g);
}
export const jeuDeBase = (db) => jeuDe(graineDeBase(db));

// ─────────────────────────────────────────────────────────────── l'imprévu
export const nomCible = (jeu) => (jeu.alea === 'malade' ? jeu.noms[jeu.cible] : jeu.alea === 'panne' ? jeu.cible : null);
export function texteAlea(jeu) {
  if (jeu.alea === 'panne') {
    return `Mauvaise nouvelle : <b>le camion ${jeu.cible} est en panne</b>, il ne roulera pas ce matin. J’ai un <b>porteur de renfort</b> du hub, `
      + 'disponible à <b>08:00</b>. Reprends le planning, puis renvoie-le.';
  }
  if (jeu.alea === 'malade') {
    return `<b>${jeu.noms[jeu.cible]} est malade</b> : il vient de me prévenir et ne viendra pas travailler ce matin. Un <b>chauffeur de renfort</b> du hub `
      + '(permis C) est disponible à <b>07:30</b>. Reprends le planning, puis renvoie-le.';
  }
  return 'Le pic de décembre : le volume de <b>T2 (Agglo ouest)</b> a doublé, il faut <b>deux camions</b>. J’ajoute une 2e tournée, <b>T2 bis</b>, '
    + 'avec un <b>chauffeur de renfort</b> et un <b>fourgon de renfort</b> du hub, disponibles à <b>07:00</b>. Reprends le planning, puis renvoie-le.';
}
export const sansBalises = (t) => String(t).replace(/<[^>]+>/g, '');

// ─────────────────────────────────────────────────────────────── le planning (vue Planning) d'un jeu
const CAMION_EXIGE = { porteur: 'porteur 12 t', petit: 'fourgon ou porteur' };
const lignesDe = (I, id) => I.filter((i) => i.r === id && !i.c.pause);
const PLANNINGS = new Map();
export function planningDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (PLANNINGS.has(g)) return PLANNINGS.get(g);
  const jeu = jeuDe(g);
  const dateTexte = 'Samedi 12 décembre : 5 des tournées de l’agence de Buchères';
  const alea = jeu.alea === 'panne' ? { ressources: { [jeu.cible]: { dispo: '19:00', panne: true } }, ajoutRessources: [RENFORT_PORTEUR] }
    : jeu.alea === 'malade' ? { retraits: { lignes: [jeu.cible] }, ajoutLignes: [renfortChauffeur('07:30')] }
      : { ajoutCartes: [{ ...T2BIS, famille: 'petits' }], ajoutRessources: [RENFORT_FOURGON], ajoutLignes: [renfortChauffeur('07:00')] };
  const P = {
    id: PL,
    libelle: 'Planning du samedi',
    titre: 'Exploitation — agence Mondial Relay de Buchères',
    date: dateTexte,
    infos: (o) => [
      'Un chauffeur et un camion pour chaque tournée ; un chauffeur et un camion font <b>une seule tournée</b> dans la journée',
      'Porteur 12 t : permis C · fourgon 3,5 t : permis B ou C',
      'Chaque tournée part quand ses colis sont prêts et rentre avant son heure limite',
      '11 h de repos depuis la fin de service d’hier · 4 h 30 de conduite au plus sans pause · 9 h de conduite au plus dans la journée',
      ...o.ressources.map((k) => `<b>${k.nom}</b> : ${k.panne ? '<b>en panne aujourd’hui</b>' : k.note}`),
    ],
    echelle: ECHELLE,
    lignes: { titre: 'Planning des chauffeurs — samedi 12 décembre', liste: chauffeursDe(jeu, 1) },
    affectation: {
      question: 'Quel camion pour {carte} ?', manque: 'camion ?', lien: 'le camion', porte: 'son camion',
      liste: camionsDe(jeu, 1),
      nonAffectees: (L) => `Tournées sans camion : ${L.map((c) => c.court).join(', ')}.`,
      lecture: { titre: 'Utilisation des camions', bloc: (c, l) => `${c.court} ${l.nom}`,
        legende: 'Ce planning se remplit tout seul quand tu choisis un camion. Hachures : camion indisponible.' },
    },
    cartes: {
      titre: 'Les tournées du samedi',
      liste: tourneesDe(jeu, 1).map((t) => ({ ...t, titre: t.court,
        famille: t.camion === 'porteur' ? 'porteur' : 'petits' })),
      duree: (c) => c.service,
      details: (c) => [
        `Service <b>${duree(c.service)}</b>, dont <b>${duree(c.conduiteTotale || c.conduite)}</b> de conduite${c.conduiteTotale > MAX_CONDUITE ? ' (avec la pause de 45 min en route)' : ''} · ${c.km} km`,
        `Départ dès ${c.des} · retour au hub avant ${c.avant}`,
        `Camion : ${CAMION_EXIGE[c.camion]}`,
        `Communes : ${c.lieux}`,
      ],
      nonPosees: (L) => `Tournées pas encore posées : ${L.map((c) => c.court).join(', ')}.`,
      legende: 'Glisse une tournée sur la ligne d’un chauffeur, à l’heure du départ : une bulle s’ouvre pour choisir son camion. '
        + 'Ou clique la tournée, puis la case. Sur le planning, clique une tournée pour rouvrir sa bulle ; pour la déplacer, glisse-la ou choisis « Déplacer ». '
        + 'Clavier : Entrée pour prendre une tournée (ou ouvrir la bulle sur le planning), Espace pour déplacer un bloc, flèches, Suppr pour retirer, Échap pour fermer.',
    },
    familles: { porteur: { couleur: '#f0be00', nom: 'jaune', legende: 'porteur obligatoire' }, petits: { couleur: '#8b5cf6', nom: 'violet', legende: 'fourgon ou porteur' } },
    regles: [
      { id: 'uneTourneeChauffeur', type: 'critere',
        verifier: ({ D, I }) => D.lignes.filter((l) => lignesDe(I, l.id).length > 1)
          .map((l) => ({ texte: `${l.nom} a plus d’une tournée dans la journée.`, cartes: lignesDe(I, l.id).map((i) => i.id) })) },
      { id: 'permis', type: 'critere',
        verifier: ({ D, I }) => I.filter((i) => i.k && D.L[i.r].permis === 'B' && D.R[i.k].genre !== 'fourgon')
          .map((i) => ({ texte: `${D.L[i.r].nom} a le permis B : il ne peut pas conduire ${D.R[i.k].nom}, un porteur de 12 t.`, cartes: [i.id] })) },
      { id: 'chauffeurDispo', type: 'disponible', sur: 'ligne', message: (c, l) => `${c.court} : ${l.nom} n’est pas là à cette heure-là.` },
      { id: 'uneTourneeCamion', type: 'critere',
        verifier: ({ D, I }) => D.ressources.map((k) => I.filter((i) => i.k === k.id)).filter((L) => L.length > 1)
          .map((L) => ({ texte: `${D.R[L[0].k].nom} fait plus d’une tournée dans la journée.`, cartes: L.map((i) => i.id), cote: 'affectation' })) },
      { id: 'typeCamion', type: 'compatible', sur: 'affectation', si: (c) => c.camion === 'porteur', exige: (k) => k.genre === 'porteur',
        message: (c, k) => `${c.court} demande un porteur : ${k.nom} ne convient pas.` },
      { id: 'disponible', type: 'disponible', sur: 'affectation',
        message: (c, k) => (k.panne ? `${c.court} : ${k.nom} est en panne, il ne roule pas aujourd’hui.` : `${c.court} : ${k.nom} n’est pas disponible à cette heure-là.`) },
      { id: 'fenetre', type: 'fenetre', marque: 'ligne', message: {
        debut: (c) => `${c.court} : le départ est prévu avant que les colis soient prêts.`,
        fin: (c) => `${c.court} : la tournée rentre trop tard au hub.` } },
      { id: 'repos', type: 'reposDepuisVeille', repos: REPOS, message: (l) => `${l.nom} n’a pas eu ses 11 h de repos depuis hier soir.` },
      { id: 'pause', type: 'cumulSansPause', max: MAX_CONDUITE, message: (l) => `${l.nom} conduit plus de 4 h 30 sans pause.` },
      { id: 'jour', type: 'plafond', max: 9 * 60, message: (l) => `${l.nom} conduit plus de 9 h dans la journée.` },
    ],
    jalons: [
      { id: 'tous', lib: 'Chaque tournée a un chauffeur et un camion, et part à son heure', regles: ['fenetre'], versions: [1] },
      { id: 'permis', lib: 'Permis et camions : le bon permis, le bon type de camion, une tournée par chauffeur et par camion',
        regles: ['uneTourneeChauffeur', 'permis', 'chauffeurDispo', 'uneTourneeCamion', 'typeCamion', 'disponible'], versions: [1] },
      { id: 'repos', lib: 'Repos de 11 h respecté', regles: ['repos'], versions: [1] },
      { id: 'conduite', lib: 'Conduite et pause : aucune journée hors règle', regles: ['pause', 'jour'], versions: [1] },
      { id: 'replanifier', lib: 'Après l’imprévu : planning de nouveau complet et dans les règles',
        regles: ['fenetre', 'uneTourneeChauffeur', 'permis', 'chauffeurDispo', 'uneTourneeCamion', 'typeCamion', 'disponible', 'repos', 'pause', 'jour'], versions: [2] },
    ],
    repriseIdentique: 'faux',
    rendCopie: false,                                  // d'autres écrans suivent (le message à Samia) : la copie se rend par le bandeau
    aides: {
      verifier: false,
      consignes: { regles: 'Pose chaque tournée sur la ligne d’un chauffeur, à l’heure du départ, et choisis son camion dans la bulle.' },
    },
    alea: { de: 'Samia', texte: texteAlea(jeu), ...alea },
  };
  PLANNINGS.set(g, P);
  return P;
}

// ─────────────────────────────────────────────────────────────── le message à Samia (phrases à choisir, tu)
export function phrasesSamia(prenom, jeu) {
  const bonne = jeu.alea === 'panne'
    ? [`Le camion ${jeu.cible} est en panne : j’ai repris le planning avec le porteur de renfort, disponible à 08:00.`,
      `Le camion ${jeu.cible} est en panne : je n’ai rien changé, les tournées partent comme prévu.`,
      `Le camion ${jeu.cible} est en panne : j’ai pris le porteur de renfort pour partir dès 06:00.`]
    : jeu.alea === 'malade'
      ? [`${jeu.noms[jeu.cible]} est malade : je l’ai retiré du planning et j’ai mis le chauffeur de renfort, disponible à 07:30.`,
        `${jeu.noms[jeu.cible]} est malade : je l’ai gardé sur sa tournée, il viendra plus tard.`,
        `${jeu.noms[jeu.cible]} est malade : le chauffeur de renfort part dès 06:00 à sa place.`]
      : ['T2 est doublée : j’ai posé T2 bis avec le chauffeur et le fourgon de renfort, disponibles à 07:00.',
        'T2 est doublée : j’ai mis deux chauffeurs sur la même tournée T2, sans camion en plus.',
        'T2 est doublée : j’ai posé T2 bis avec le renfort, qui part dès 06:00.'];
  return { id: MSG, melanger: true, lignes: [
    { id: 'salutation', choix: ['Salut Samia,', 'Bonjour Madame la directrice,', 'Bonjour,'], juste: 0 },
    { id: 'changement', choix: bonne, juste: 0 },
    { id: 'raison', choix: ['J’ai vérifié pour chacun le permis, les 11 h de repos et la conduite.',
      'J’ai posé les tournées au hasard, ça passera.', 'Je n’ai pas regardé le repos, ça ira.'], juste: 0 },
    { id: 'formule', choix: [`À tout à l’heure, ${prenom}`, 'Cordialement', 'Cordialement, Madame'], juste: 0 },
  ] };
}
