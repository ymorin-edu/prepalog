// ENT-12.7 — IKEA, « évaluation : la livraison de ta cliente » : le contenu de la séance (brief `docs/briefs/ENT-12.7-ikea-evaluation-transport.md` ; choix de Tristan du 26/10/2026,
// `docs/briefs/ikea/A-TRANCHER.md`). Septième séance de l'entreprise n° 12 (2de GATL, poste B : agent(e) du service livraison, transport), ÉVALUATION d'OTM-C1.1 (prendre en compte la demande du client),
// d'OTM-C1.2 (choisir les modalités) et d'OTM-C3.1 (contrôler les engagements contractuels). Guidage et entraînement : ENT-12.2 et ENT-12.3 (mêmes écrans, aides en moins).
// Univers : `contenus/ikea.js` ; données pures et tirage : `contenus/ikea-ent127-donnees.js` ; activité : `activites/ikea-evaluation-transport.js` ; questions : `contenus/questions/ENT-12.7.js` ;
// corrigé : `contenus/corriges/ENT-12.7.js`.
//
// Écrans, un par étape, sans aucune aide ni retour : Avant de commencer (noté, 4 points) → ① L'appel de la cliente tirée (vue Téléphone, évaluation : la première réponse est la réponse) → ② La fiche « mode de
// livraison » (un mode et ce qui le décide pour chaque article, le prix) → ③ La journée du jeudi (vue Planning : dix commandes sur la péniche, on envoie ; l'imprévu tombe ; on replanifie sur trois camions et on envoie)
// → ④ Prévenir les clients (fiche : qui, et quelle nouvelle date) → « Rendre ma copie ». Rien ne dit juste ou faux.
//
// UN JEU PAR ÉLÈVE (règle du 03/10/2026) : cliente, imprévu et décalage de la journée sont tirés de la graine. Le moteur ne tire pas encore un `planning` ni une `fiche` : comme ENT-11.4, l'activité fabrique
// UN MOTEUR PAR GRAINE (`activites/ikea-evaluation-transport.js`) ; les jalons, les messages et les documents lisent le jeu dans la base de l'élève (`jeuDeBase(db)`).
//
// POIDS (brief §5 et `A-TRANCHER.md`, adaptés comme ENT-12.8) : l'appel 4 (accès et créneau 3 · rien de faux promis 1) · le mode et le prix 6 (un mode juste par article 4 : 1, 1 et 2 ; le prix 2) ·
// la journée 6 (créneaux tenus 3 · clients non tenus prévenus 2 · la nouvelle date 1) · « Avant de commencer » 4 (`part`) = 20. ÉCART : les questions au fil du brief (1 point) sont des réflexions non
// notées, comme en 12.8 ; le point est donné à la nouvelle date proposée aux clients. Rien n'est vrai avant l'envoi : l'inaction vaut 0.

import { apresFiche, apresPlanning, dialogueFini } from '../core/declencheurs.js';
import { jalonDialogue, premiereReponse, appelRetenuDe } from '../core/types/dialogue.js';
import { jalonsPlanning } from '../core/types/planning.js';
import { catalogueSimple } from './entreprise-commun.js';
import { EQUIPE as EQUIPE_IK, MODES, STYLE_DOCUMENTS, htmlTarifs, ech, pied, euros } from './ikea.js';
import { DOC_CGV } from './ikea-ent122.js';
import { DOC_DROIT, DOC_CAMIONS } from './ikea-ent123.js';
import { QUESTIONS } from './questions/ENT-12.7.js';
import {
  ID, ID_VOLET, DIALOGUE_ID, FICHE_MODE, FICHE_PREVENIR, PL, JOUR_APPEL, JOUR, RAISONS, CLIENTES, IMPREVUS, CAMIONS, CAMIONS_IDS, IMPOSSIBLES, CHAMP,
  jeuDe, jeuDeBase, graineDeBase, clienteDe, imprevuDe, commandesDe, creneauLib, kg, lireKg, prixJuste, montantCommande, lireNombre,
  envoyee, valeursDe, dejaEnvoyee, planningEnvoye, nonTenues, toutesPosees, dansCreneau,
} from './ikea-ent127-donnees.js';

export { ID, ID_VOLET, DIALOGUE_ID, FICHE_MODE, FICHE_PREVENIR, PL } from './ikea-ent127-donnees.js';

const ok = { status: 'ok' }, ko = { status: 'ko' }, attente = { status: 'attente' };

export const CATALOGUE = catalogueSimple([]);
export const SUPPLIERS = [];
export const SUP_BY_ID = {};
export const CUSTOMERS = [];
export const CM = {};
export function baseDeDepart() {
  return { v: 1, created: Date.now(), stock: {}, moves: [], mails: [], orders: [], receptions: [], customers: [], suppliers: [], seq: 1, _depart: [] };
}

// ─────────────────────────────────────────────────────────────── les personnes (prénoms seuls, construits) ; la cliente est celle du jeu
const cl_e = (cl) => (cl.civ === 'Mme' ? 'e' : '');
export const equipeDe = (jeu) => { const cl = clienteDe(jeu); return {
  claire: { nom: EQUIPE_IK.claire.prenom, role: `${EQUIPE_IK.claire.poste} (ta responsable)`, appel: 'Claire' },
  cliente: { nom: `${cl.prenom} ${cl.nom}`, role: `client${cl_e(cl)}`, appel: `${cl.civ} ${cl.nom}` },
}; };
export const EQUIPE = equipeDe(jeuDe(''));
const CLAIRE = { nom: 'Claire', mail: 'claire@cdc-gennevilliers.example' };

// ─────────────────────────────────────────────────────────────── les documents
const DOC_POSTE = { id: 'poste-127', titre: 'Ton poste', court: 'Ton poste',
  html: `<article class="ik-doc" aria-label="Ton poste">
    <p class="ik-t">Ton poste</p>
    <p class="ik-st">Service livraison du centre de distribution clients IKEA de Gennevilliers</p>
    <p>Tu es agent(e) du <b>service livraison</b>, avec <b>Claire</b>. Tu <b>appelles</b> les clients pour préparer leur livraison, tu choisis le <b>mode de livraison</b> de chaque article, puis tu
      tiens les <b>engagements</b> pris auprès d’eux : IKEA a promis une <b>date</b> et un <b>créneau</b>. Cette fois, personne ne te dit si c’est juste : tu travailles seul(e).</p>
    ${pied('Document pédagogique. Réels : IKEA France et son centre de Gennevilliers. Construits : Claire, les clients, leurs commandes, la journée.')}
  </article>` };
const DOC_COMMANDE = { id: 'commande-127', titre: 'La commande du client', court: 'La commande',
  html: (db) => {
    const cl = clienteDe(jeuDeBase(db));
    return `<article class="ik-doc" aria-label="La commande de ${ech(cl.civ)} ${ech(cl.nom)}">
    <p class="ik-t">La commande de ${ech(cl.civ)} ${ech(cl.nom)}</p>
    <p class="ik-st">Passée en ligne — mode choisi par le client sur le site pour les meubles : « devant chez vous » — livraison prévue le mardi 16 mars 2027</p>
    <dl class="ik-dl">
      <dt>Client${cl_e(cl)}</dt><dd>${ech(cl.civ)} ${ech(cl.prenom)} ${ech(cl.nom)}, ${ech(cl.ville)}</dd>
      <dt>IKEA Family</dt><dd>${cl.membre ? 'membre' : 'non membre'}</dd>
      <dt>Créneaux libres</dt><dd>mardi 16 mars 2027, de 8 h à 12 h · mardi 16 mars 2027, de 14 h à 18 h</dd>
    </dl>
    <table class="ik-table">
      <thead><tr><th scope="col">Article</th><th scope="col">Colis</th><th class="ik-d" scope="col">Poids par colis</th><th class="ik-d" scope="col">Prix</th></tr></thead>
      <tbody>${cl.articles.map((a) => `<tr><td>${ech(a.lib)}</td><td>${a.colis.length}</td><td class="ik-d">${a.colis.map(lireKg).join(' kg, ')} kg</td><td class="ik-d">${euros(a.prix)}</td></tr>`).join('')}</tbody>
    </table>
    ${pied('Commande reconstituée pour l’exercice : le client, les articles, les poids et les prix sont construits. Document pédagogique — reconstitution, non contractuel.')}
  </article>`;
  } };
const DOC_TARIFS = { id: 'tarifs-127', titre: 'Les modes de livraison et leurs prix', court: 'Modes et prix',
  html: `<article class="ik-doc" aria-label="Modes de livraison et prix">
    <p class="ik-t">Les modes de livraison et leurs prix</p>
    <p class="ik-st">D’après la page « Livraison » d’IKEA France, relevée le 26/10/2026 (les prix peuvent changer)</p>
    ${htmlTarifs()}
    <p class="ik-st" style="margin-top:10px">Règles de l’exercice (simplification) : pour chaque article, choisis le mode <b>le moins cher parmi ceux qui conviennent au client et aux conditions</b> du mode. Le Point Relais se paie
      une seule fois ; les articles livrés par un même mode se paient d’après leur montant <b>ensemble</b>.</p>
    ${pied('Prix réels de la page « Livraison » d’IKEA France, relevés le 26/10/2026. Mise en page reconstituée. Document pédagogique — reconstitution, non contractuel.')}
  </article>` };
const DOC_COMMANDES = { id: 'commandes-127', titre: 'Les dix commandes du jour', court: 'Les commandes',
  html: (db) => {
    const C = commandesDe(jeuDeBase(db));
    return `<article class="ik-doc" aria-label="Les dix commandes du jour">
    <p class="ik-t">Les dix commandes du jeudi 11 mars</p>
    <p class="ik-st">Chaque client a reçu une date et un créneau. « Trajet + livraison » : le temps que le camion passe chez ce client, route comprise.</p>
    <table class="ik-table">
      <thead><tr><th scope="col">Client</th><th scope="col">Où</th><th scope="col">Créneau promis</th><th class="ik-d" scope="col">Trajet + livraison</th><th class="ik-d" scope="col">Poids</th></tr></thead>
      <tbody>${C.map((c) => `<tr><td>${ech(c.client)} <span class="ik-st">(${ech(c.meuble)})</span></td><td>${ech(c.quartier)}</td><td>${ech(creneauLib(c))}</td>
        <td class="ik-d">${Math.floor(c.dur / 60)} h ${String(c.dur % 60).padStart(2, '0')}</td><td class="ik-d">${c.kg} kg</td></tr>`).join('')}</tbody>
    </table>
    ${pied('Commandes CONSTRUITES pour l’exercice (clients fictifs, noms de famille seuls). Document pédagogique — reconstitution, non contractuel.')}
  </article>`;
  } };
const DOC_IMPREVU = { id: 'imprevu-127', titre: 'L’imprévu du jour', court: 'L’imprévu',
  html: (db) => {
    const I = imprevuDe(jeuDeBase(db));
    return `<article class="ik-doc" aria-label="L’imprévu du jour">
    <p class="ik-t">L’imprévu du jour</p>
    <p class="ik-st">Jeudi 11 mars 2027, 6 h 30</p>
    <p>D’ordinaire, les livraisons dans Paris partent par la <b>péniche</b> (Gennevilliers → Bercy), puis en utilitaires électriques. ${I.texte}</p>
    <p>Il reste les <b>trois camions</b> du centre.</p>
    ${pied(`${I.doc} Réel : la chaîne Gennevilliers → péniche → Bercy → utilitaires électriques (IKEA, décembre 2022).`)}
  </article>`;
  } };
export const DOCUMENTS = [DOC_POSTE, DOC_COMMANDE, DOC_TARIFS, DOC_CGV, DOC_COMMANDES, DOC_CAMIONS, DOC_IMPREVU, DOC_DROIT];
export const STYLE = STYLE_DOCUMENTS;

// ─────────────────────────────────────────────────────────────── ① l'appel (écran Téléphone, ÉVALUATION : la première réponse est la réponse)
const CRENEAU_LIB = { matin: 'Je vous propose le mardi 16 mars, de 8 h à 12 h. Cela vous convient ?', aprem: 'Je vous propose le mardi 16 mars, de 14 h à 18 h. Cela vous convient ?' };
export const FIN_APPEL = 'Merci beaucoup. J’attends votre confirmation. Bonne journée !';
export function repliquesDe(cl) {
  const p = cl.promesse;
  return [
    { id: 'accueil', dit: `Allô ? Oui, bonjour, ${cl.civ} ${cl.nom} à l’appareil.`,
      choix: [
        { v: 'acces', juste: true, lib: `Bonjour ${cl.civ === 'Mme' ? 'Madame' : 'Monsieur'} ${cl.nom}, {prenom}, service livraison d’IKEA Gennevilliers. Pour préparer votre livraison : à quel étage habitez-vous, y a-t-il un ascenseur, et l’escalier est-il assez large ?` },
        { v: 'etage', lib: 'Bonjour, à quel étage habitez-vous ?' },
        { v: 'rien', lib: 'Bonjour, c’est IKEA, c’est bien vous qui avez commandé ?' },
      ] },
    { id: 'creneau', dit: `Oui, c’est bien moi. ${cl.acces} ${cl.prefs} ${cl.dispoDit}`,
      choix: [
        { v: 'matin', ...(cl.dispo === 'matin' ? { juste: true } : {}), lib: CRENEAU_LIB.matin },
        { v: 'aprem', ...(cl.dispo === 'aprem' ? { juste: true } : {}), lib: CRENEAU_LIB.aprem },
        { v: 'jour', lib: 'Le livreur vous appellera le jour même pour fixer l’heure.' },
      ] },
    { id: 'promesse', dit: p.dit,
      choix: [
        { v: 'ok', juste: true, lib: p.juste },
        { v: 'faux1', lib: p.fausses[0] },
        { v: 'faux2', lib: p.fausses[1] },
      ] },
  ];
}
export const telephoneDe = (jeu) => {
  const cl = clienteDe(jeu);
  return {
    libelle: `L’appel de ${cl.civ} ${cl.nom}`,
    situation: `${cl.civ} ${cl.nom} attend ton appel : prépare la livraison de sa commande.`,
    dialogues: [{ id: DIALOGUE_ID, de: 'cliente', contact: { nom: `${cl.civ} ${cl.prenom} ${cl.nom}`, detail: `client${cl_e(cl)}, ${cl.ville}` }, repliques: repliquesDe(cl), fin: FIN_APPEL }],
  };
};
const appelFini = (db) => dialogueFini(DIALOGUE_ID)(db, ID);

// ─────────────────────────────────────────────────────────────── ② la fiche « mode de livraison »
const choixMode = MODES.map(({ v, lib }) => ({ v, lib }));
export function ficheModeDe(jeu) {
  const cl = clienteDe(jeu);
  const bloc = (a) => ({ type: 'cadre', titre: a.lib, blocs: [
    { type: 'liste', id: CHAMP(a.id, 'mode'), lib: 'Mode de livraison', vide: 'Choisir…', manque: `le mode : ${a.lib.toLowerCase()}`, choix: choixMode },
    { type: 'liste', id: CHAMP(a.id, 'raison'), lib: 'Ce qui décide', vide: 'Choisir…', manque: `la raison : ${a.lib.toLowerCase()}`, choix: RAISONS },
  ] });
  return {
    id: FICHE_MODE, libelle: 'Mode de livraison', titre: 'Choisir le mode de livraison de chaque article',
    sousTitre: 'À gauche : la commande, les modes et leurs prix, les conditions de vente. Un mode et ce qui le décide pour chaque article, puis le prix que paiera le client.',
    documents: ['commande-127', 'tarifs-127', 'cgv-122'], largeurDocs: 1.1, defile: true,
    bouton: 'Ouvrir la fiche « mode de livraison »',
    quand: (db) => appelFini(db) || envoyee(db, FICHE_MODE),
    blocs: [
      ...cl.articles.map(bloc),
      { type: 'cadre', titre: 'Le prix', blocs: [
        { type: 'nombre', id: 'prix', lib: `Prix total de la livraison de ${cl.civ} ${cl.nom}`, unite: '€', min: 0, entier: true, manque: 'le prix total' },
      ] },
    ],
    envoi: { bouton: 'Envoyer la fiche à Claire', a: 'Claire', suite: 'Merci, c’est noté.' },
  };
}

// ─────────────────────────────────────────────────────────────── ③ la journée (vue Planning) et ④ prévenir les clients (fiche)
const camionsDe = (I) => CAMIONS_IDS.map((id) => [id, I.filter((i) => i.r === id).sort((a, b) => a.s - b.s)]);
const PLANNINGS = new Map();
export function planningDe(graine) {
  const g = String(graine == null ? '' : graine);
  if (PLANNINGS.has(g)) return PLANNINGS.get(g);
  const jeu = jeuDe(g), I0 = imprevuDe(jeu), C = commandesDe(jeu);
  const P = {
    id: PL,
    libelle: 'Planning du jour',
    titre: 'Planning des livraisons — jeudi 11 mars 2027',
    date: 'Jeudi 11 mars 2027',
    quand: (db) => envoyee(db, FICHE_MODE) || dejaEnvoyee(FICHE_MODE)(db),
    infos: (o) => [
      'Dix commandes à livrer aujourd’hui, chacune avec le créneau promis au client',
      o.phase === 2 ? 'Trois camions : un seul bloc à la fois par camion, et le poids de tout ce qu’il livre doit tenir dans sa charge' : 'Aujourd’hui comme d’habitude : toutes les livraisons partent par la péniche',
      o.phase === 2 ? 'Une commande qui ne peut pas tenir son créneau se reporte à demain : on prévient le client' : 'Envoie le planning à Claire',
    ],
    echelle: { type: 'heures', debut: '08:00', fin: '20:00', pas: 15 },
    lignes: { titre: 'Planning des livraisons — jeudi 11 mars 2027', liste: [
      { id: 'peniche', nom: 'Péniche → Bercy', note: 'puis utilitaires électriques' },
      ...CAMIONS.map((c) => ({ id: c.id, nom: c.nom, note: `peut porter ${c.note}`, cap: c.cap })),
    ] },
    cartes: {
      titre: 'Commandes du jour',
      liste: C.map((c) => ({ ...c, titre: `${c.client} — ${c.quartier}`, court: c.client.replace(/^(M\.|Mme) /, ''), famille: 'cmd', depart: { ligne: 'peniche', de: c.des } })),
      details: (c) => [`${ech(c.meuble)} · ${c.kg} kg`, `Créneau promis : <b>${ech(creneauLib(c))}</b>`],
      duree: (c) => c.dur,
      libDuree: 'Trajet + livraison',
      aPlacer: 'À poser',
      nonPosees: (L) => `Commandes pas encore posées : ${L.map((c) => c.court || c.id).join(', ')}.`,
      legende: 'Glisse une commande sur un camion, à l’heure où commence son bloc « trajet + livraison » : il doit tenir dans son créneau. Ou clique la commande, puis la case. '
        + 'Une commande qui ne peut pas tenir son créneau se pose sur la ligne « Reporté à demain ». Clavier : Entrée pour la prendre, flèches, Suppr pour la retirer.',
    },
    familles: { cmd: { couleur: '#8b5cf6', nom: 'violet', legende: 'commande à livrer' } },
    regles: [
      { id: 'chevauche', type: 'critere', verifier: ({ I }) => {
        const out = [];
        camionsDe(I).forEach(([id, L]) => {
          for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
            if (L[a].s < L[b].e && L[b].s < L[a].e) out.push({ texte: `${CAMIONS.find((c) => c.id === id).nom} : deux livraisons en même temps.`, cartes: [L[a].id, L[b].id] });
          }
        });
        return out;
      } },
      { id: 'charge', type: 'critere', verifier: ({ I }) => {
        const out = [];
        camionsDe(I).forEach(([id, L]) => {
          const cam = CAMIONS.find((c) => c.id === id);
          if (L.reduce((s, i) => s + i.c.kg, 0) > cam.cap) out.push({ texte: `${cam.nom} : la charge dépasse ce qu’il peut porter.`, cartes: L.map((i) => i.id) });
        });
        return out;
      } },
      { id: 'tenus', type: 'critere', verifier: ({ I }) => {
        const out = [];
        I.forEach((i) => {
          if (i.r === 'demain') { if (!IMPOSSIBLES.includes(i.id)) out.push({ texte: `${i.c.titre} : cette commande pouvait tenir son créneau.`, cartes: [i.id] }); }
          else if (CAMIONS_IDS.includes(i.r) && !dansCreneau(i.c, i.s)) out.push({ texte: `${i.c.titre} : la livraison sort du créneau promis.`, cartes: [i.id] });
        });
        return out;
      } },
    ],
    jalons: [
      { id: 'creneaux', lib: 'Aucun camion à deux endroits à la fois, la charge respectée, les créneaux tenus pour toutes les commandes qui pouvaient l’être', regles: ['chevauche', 'charge', 'tenus'], versions: [2] },
    ],
    repriseIdentique: 'faux',
    rendCopie: false,                                  // d'autres écrans suivent (prévenir les clients) : la copie se rend par le bandeau
    aides: { verifier: false, consignes: { regles: 'Pose chaque commande sur un camion, à l’heure où commence son bloc « trajet + livraison ». Si une commande ne peut pas tenir son créneau, reporte-la à demain.' } },
    alea: {
      de: 'Claire',
      texte: `${I0.texte} Les dix livraisons passent en camion, avec <b>trois camions</b> seulement.`,
      retraits: { lignes: ['peniche'] },
      ajoutLignes: [{ id: 'demain', nom: 'Reporté à demain', note: 'vendredi 12 mars' }],
    },
  };
  PLANNINGS.set(g, P);
  return P;
}
export function fichePrevenirDe(jeu) {
  const C = commandesDe(jeu);
  return {
    id: FICHE_PREVENIR, libelle: 'Prévenir les clients', titre: 'Prévenir les clients qui ne seront pas livrés à l’heure',
    sousTitre: 'Les commandes à gauche, avec leur créneau promis. Coche les clients à prévenir, et choisis la nouvelle date à leur proposer.',
    documents: ['commandes-127', 'droit-123'], largeurDocs: 1.2, defile: true,
    bouton: 'Ouvrir la fiche « Prévenir les clients »',
    quand: (db) => !!planningEnvoye(db, 2),
    blocs: [
      { type: 'cadre', titre: '1. Les clients à prévenir', large: true, blocs: [
        { type: 'cases', id: 'clients', titre: 'Qui ne sera pas livré dans son créneau ?', choix: C.map((c) => ({ v: c.id, lib: `${c.client} — ${c.quartier} — créneau promis ${creneauLib(c)}` })) },
      ] },
      { type: 'cadre', titre: '2. La nouvelle date', blocs: [
        { type: 'choix', id: 'date', lib: 'Que leur proposes-tu ?', manque: 'la nouvelle date', colonne: true, choix: [
          { v: 'demain', lib: 'Demain, vendredi 12 mars, le matin' }, { v: 'mois', lib: 'Dans un mois' }, { v: 'aucune', lib: 'Pas de date : on les rappellera' },
        ] },
      ] },
    ],
    envoi: { bouton: 'Envoyer à Claire', a: 'Claire', suite: 'Merci, c’est noté.', incomplet: true },
  };
}

// ─────────────────────────────────────────────────────────────── les messages (Claire tutoie ; la date du scénario, jamais la date réelle)
function heure(db, iso, hhmm) {
  const [a, m, j] = iso.split('-').map(Number), [h, mn] = hhmm.split(':').map(Number);
  const ouvert = (db && db.volets && db.volets[ID_VOLET]) || 0;
  return new Date(a, m - 1, j, h, mn).getTime() + (ouvert ? Math.max(0, Date.now() - ouvert) : 0);
}
const mail = (prenom, subject, text, o = {}) => ({ folder: 'in', ts: heure(o.db, o.iso || JOUR.iso, o.heure || '06:15'), from: CLAIRE.nom, fromMail: CLAIRE.mail, to: prenom, subject, kind: 'text', text, ...(o.extra || {}) });
export const VOLET = {
  id: ID_VOLET,
  semer: (prenom, db) => { const cl = clienteDe(jeuDeBase(db)); return { mails: [
    mail(prenom, 'Un client à appeler',
      `Bonjour ${prenom} ! ${cl.civ} ${cl.nom} a commandé trois articles. Appelle ${cl.civ === 'Mme' ? 'la' : 'le'} client${cl_e(cl)} pour caler sa livraison : ouvre « ${telephoneDe(jeuDeBase(db)).libelle} », dans le menu. `
        + 'Ensuite, tu choisiras le mode de livraison de chaque article. Pas d’aide cette fois : je regarderai ton travail à la fin.\n\nClaire',
      { db, iso: JOUR_APPEL.iso, heure: '09:00', extra: { pieces: ['poste-127', 'commande-127'] } }),
  ] }; },
  declencheurs: [
    { id: 'fiche', quand: appelFini,
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Les modes de livraison',
        `Merci ${prenom}. Voici les modes de livraison et leurs prix, et les extraits des conditions de vente. Ouvre la fiche « mode de livraison » : un mode pour chaque article, `
          + 'ce qui le décide, puis le prix total de la livraison.\n\nClaire',
        { db, iso: JOUR_APPEL.iso, heure: '09:12', extra: { pieces: ['tarifs-127', 'cgv-122'], ouvreFiche: FICHE_MODE } })] }) },
    { id: 'journee', quand: apresFiche(FICHE_MODE),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Le planning du jeudi 11 mars',
        `Merci ${prenom}, c’est noté. Jeudi, voici les dix commandes du jour : tout part par la péniche, comme d’habitude. Ouvre « Planning du jour », regarde-le, puis envoie-le-moi.\n\nClaire`,
        { db, heure: '06:15', extra: { pieces: ['commandes-127', 'camions-123'] } })] }) },
    { id: 'imprevu', quand: apresPlanning(PL), phasePlanning: 2,
      semer: (prenom, db) => { const I = imprevuDe(jeuDeBase(db)); return { mails: [mail(prenom, I.titre,
        `${prenom}, ${I.mail} Les dix livraisons passent en camion, et nous n’avons que trois camions.\n\n`
          + 'Reprends le planning : tiens les créneaux promis aux clients autant que possible, et reporte à demain ce qui ne peut pas tenir. Puis envoie-le-moi.\n\nClaire',
        { db, heure: '06:30', extra: { pieces: ['imprevu-127', 'camions-123', 'droit-123'] } })] }; } },
    { id: 'prevenir', quand: apresPlanning(PL, 2),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Les clients à prévenir',
        `Merci ${prenom}. Maintenant, il faut prévenir les clients que nous ne livrerons pas dans leur créneau. Ouvre la fiche « Prévenir les clients » : coche ceux qu’il faut appeler, et propose-leur une nouvelle date.\n\nClaire`,
        { db, heure: '08:30', extra: { ouvreFiche: FICHE_PREVENIR } })] }) },
    { id: 'fin', quand: apresFiche(FICHE_PREVENIR),
      semer: (prenom, db) => ({ mails: [mail(prenom, 'Merci', `Merci ${prenom}, c’est noté. Quand tu as fini, rends ta copie.\n\nClaire`, { db, heure: '09:00' })] }) },
  ],
};

// ─────────────────────────────────────────────────────────────── les jalons
export const GROUPES = { appel: 'L’appel', mode: 'Le mode de livraison', journee: 'La journée' };
export const POIDS = { demande: 3, promesse: 1, mode: [1, 1, 2], prix: 2, creneaux: 3, qui: 2, date: 1 };
const surAppel = (id, titre, poids, juge) => jalonDialogue({ seance: ID, dialogue: DIALOGUE_ID, id, titre, groupe: GROUPES.appel, poids, juge });
const surFiche = (fid, id, titre, groupe, poids, juste) => ({ id, titre, groupe, poids, ecran: `fiche:${fid}`,
  verifier(db) {
    if (!envoyee(db, fid)) return attente;
    return juste(valeursDe(db, fid), db, jeuDeBase(db)) ? ok : ko;
  } });
const articleDe = (i) => (v, db, jeu) => { const a = clienteDe(jeu).articles[i]; return v[CHAMP(a.id, 'mode')] === a.mode && v[CHAMP(a.id, 'raison')] === a.raison; };
export const ETAPES = [
  surAppel('demande', 'L’appel : l’accès demandé et le créneau qui convient au client', POIDS.demande,
    (a, db) => premiereReponse(a, 'accueil') === 'acces' && premiereReponse(a, 'creneau') === clienteDe(jeuDeBase(db)).dispo),
  surAppel('promesse', 'L’appel : rien de faux promis', POIDS.promesse, (a) => premiereReponse(a, 'promesse') === 'ok'),
  ...[0, 1, 2].map((i) => surFiche(FICHE_MODE, `mode-${i + 1}`, `Le mode de livraison de l’article n° ${i + 1} de la commande (mode et raison)`, GROUPES.mode, POIDS.mode[i], articleDe(i))),
  surFiche(FICHE_MODE, 'prix', 'Le prix total de la livraison', GROUPES.mode, POIDS.prix, (v, db, jeu) => lireNombre(v.prix) === prixJuste(clienteDe(jeu))),
  { id: 'creneaux', titre: 'La journée : camions, charge et créneaux tenus pour tout ce qui pouvait l’être', groupe: GROUPES.journee, poids: POIDS.creneaux, ecran: `planning:${PL}`,
    verifier(db) {
      const l = jalonsPlanning(db, planningDe(graineDeBase(db))).L.find((x) => x.id === 'v2-creneaux');
      if (!l) throw new Error('jalon de planning « v2-creneaux » absent');
      return !l.envoye ? attente : l.ok ? ok : ko;
    } },
  // Les clients prévenus sont, ni plus ni moins, ceux que SON planning ne tient pas ; le planning doit être complet (sans quoi tout est « non tenu »).
  surFiche(FICHE_PREVENIR, 'prevenir-qui', 'Les clients non tenus sont prévenus, et eux seuls', GROUPES.journee, POIDS.qui, (v, db, jeu) => {
    const p = planningEnvoye(db, 2), C = commandesDe(jeu);
    if (!p || !toutesPosees(p.place, C)) return false;
    const attendu = nonTenues(p.place, C).sort(), coches = (v.clients || []).slice().sort();
    return attendu.length > 0 && attendu.length === coches.length && attendu.every((x, i) => x === coches[i]);
  }),
  surFiche(FICHE_PREVENIR, 'prevenir-date', 'La nouvelle date proposée aux clients', GROUPES.journee, POIDS.date, (v, db, jeu) => {
    const p = planningEnvoye(db, 2);
    return !!p && toutesPosees(p.place, commandesDe(jeu)) && v.date === 'demain' && (v.clients || []).length > 0;
  }),
];

// ─────────────────────────────────────────────────────────────── pastilles, suite, accueil, options
export const PASTILLES = [
  { libelle: 'L’appel', fait: appelFini },
  { libelle: 'Le mode', fait: dejaEnvoyee(FICHE_MODE) },
  { libelle: 'La journée', fait: (db) => !!planningEnvoye(db, 2) },
  { libelle: 'Prévenir', fait: dejaEnvoyee(FICHE_PREVENIR) },
];
export const SUITE = [
  { vue: 'telephone', libelle: 'L’appel du client', fait: appelFini },
  { vue: `fiche:${FICHE_MODE}`, libelle: 'Le mode de livraison', fait: dejaEnvoyee(FICHE_MODE) },
  { vue: 'planning', libelle: 'Le planning du jour', fait: (db) => !!planningEnvoye(db, 2) },
  { vue: `fiche:${FICHE_PREVENIR}`, libelle: 'Prévenir les clients', fait: dejaEnvoyee(FICHE_PREVENIR) },
];
export const MENTION_127 = 'Réels : IKEA France et son centre de Gennevilliers, la péniche Gennevilliers → Bercy puis les utilitaires électriques (depuis décembre 2022), les modes de livraison et leurs prix (relevés le 26/10/2026), '
  + 'les conditions de vente (10/08/2026), le Code de la consommation. Construits : le client, sa commande, les poids et les prix, la journée, l’imprévu, Claire.';
export const ACCUEIL = {
  titre: 'Évaluation : la livraison de ta cliente',
  kpis: ['mail'],
  etapes: [
    ['Lire le message de Claire', 'Menu Messagerie.'],
    ['① L’appel', 'Appelle le client : demande-lui ce qu’il faut pour préparer sa livraison, et choisis tes répliques. Une seule réponse compte : la première.'],
    ['② Le mode de livraison', 'Avec les prix et les conditions de vente, choisis le mode de chaque article et dis le prix total.'],
    ['③ La journée', 'Pose les dix commandes du jeudi. Un imprévu tombera : reprends le planning.'],
    ['④ Prévenir les clients', 'Coche ceux que tu ne livres pas dans leur créneau, et propose-leur une nouvelle date.'],
    ['Rendre ma copie', 'Quand tu as fini, clique sur « Rendre ma copie » en haut de l’écran. Une seule remise.'],
    ['Bon à savoir', MENTION_127],
  ],
};
export const OPTIONS = {
  menu: [],
  exercice: 'Évaluation : la livraison de ta cliente',
  sansTrame: 'Tout se fait à l’écran',
  lexique: {},
  documents: DOCUMENTS,
  documentsStyle: STYLE,
  equipe: EQUIPE,
  questions: QUESTIONS,
  pastilles: PASTILLES,
  suite: SUITE,
  tirage: true,                                        // la graine (l'identifiant de l'élève) est posée à la première ouverture
  // Tirés par élève (le moteur de l'élève est fabriqué par `activites/ikea-evaluation-transport.js`) : valeurs de la graine vide, pour le chargement.
  telephone: telephoneDe(jeuDe('')),
  fiches: [ficheModeDe(jeuDe('')), fichePrevenirDe(jeuDe(''))],
  planning: planningDe(''),
};
export { jeuDe, jeuDeBase, graineDeBase, CLIENTES, IMPREVUS, prixJuste, montantCommande, kg };
