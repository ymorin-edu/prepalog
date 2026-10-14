// Le NOUVEAU COURRIEL de la messagerie d'entreprise (14/10/2026, brief `docs/briefs/MOTEUR-courriel-planning.md`, lot 2 ;
// page d'essai validée par Tristan : `outils/essai-courriel.html`, champ À = liste du carnet, pièces jointes = bouton « Joindre un fichier »).
//
// Une option d'entreprise de plus, qui n'existe que si la séance la déclare (alerte 13) :
//
//   creerEntreprise({ …,
//     courriel: {
//       carnet: [{ id: 'contargo', nom: 'Contargo', mail: 'reservations@contargo.exemple', role: 'prestataire' }, …],  // la liste du champ À, dans cet ordre
//       pieces: ['cdc', 'avis'],                  // facultatif : documents de la séance (option `documents`) que l'élève peut joindre
//       objet: '',                                // facultatif : l'objet prérempli (vide par défaut)
//       reponse: (c, db, prenom) => null | { de, texte, objet?, pieces? } | [ … ],   // facultatif : la réponse automatique
//     },
//   })
//
// Avec cette option, le bouton « Nouveau message » de la messagerie devient « Nouveau courriel » : À (liste déroulante du carnet),
// Objet, Message, Pièces jointes (« Joindre un fichier », étiquettes avec une croix), Envoyer. Sans elle, l'ancien « Nouveau message »
// à un fournisseur ne change pas d'un octet. RIEN N'EST JUGÉ : aucun texte du moteur ne dit si un courriel est bon.
//   - Envoi refusé sans destinataire (la raison s'écrit sous le bouton, le travail est gardé). Objet vide ou message vide : une
//     confirmation DANS la page (« Envoyer sans objet ? »), jamais window.confirm. Entrée dans un champ n'envoie rien.
//   - Pièces jointes proposées : les `pieces` de la séance, plus chaque fiche ENREGISTRÉE (`fiche.envoi.enregistrer`, voir
//     `fiche.js`) dont l'id de pièce est `fiche:<id de la fiche>` — tant qu'elle n'est pas enregistrée, elle n'est pas proposée.
//     Dans un courriel envoyé ou reçu (`pieces: ['fiche:ordre']`), cette pièce s'ouvre comme un document : la fiche figée sur une feuille.
//   - La RÉPONSE AUTOMATIQUE : `reponse(c, db, prenom)` reçoit `c = { a (id du carnet), objet, corps, pieces: [ids], at }` et rend
//     `null` (pas de réponse), une réponse `{ de, texte, objet?, pieces? }` ou une liste. `de` : un id du carnet (le nom et l'adresse
//     viennent de lui) ou un nom libre ; l'objet par défaut est « RE : <objet envoyé> ». Elle arrive aussitôt dans la boîte de
//     réception (même mécanisme que les réponses des fournisseurs : l'heure du message est celle de l'envoi + 1 s), jamais après la
//     remise d'une copie. Elle porte les `pieces` qu'elle déclare.
//   - Le BROUILLON (À, objet, message, pièces) est gardé quand l'élève change d'écran et revient ; vidé à l'envoi. Rangé dans la base
//     de l'élève, cloisonné par séance : `db.courriels[<séance>] = { brouillon, envoyes }`. L'enseignant écrit sur une copie en mémoire.
//   - GESTES (questions au fil, déclencheurs `apresGeste`) : `courriel:envoyer` à chaque envoi et `courriel:envoyer:<id du carnet>`.
//     Le moteur refuse une séance qui cite un autre geste `courriel:…`. Après l'envoi, les messages déclenchés arrivent comme partout.
// Lecture pour les jalons : `courrielsEnvoyes(db, idSeance?)` → `[{ a, objet, corps, pieces, at }]` dans l'ordre d'envoi
// (sans `idSeance` : toutes les séances de la base, par date). **Juste ou faux, peu importe** : le jalon lit ce que l'élève a écrit
// et joint, le moteur ne le juge pas.
//
// Rend `compilerCourriel(C, { VDOC, VFICHES })` → `{ carnet, signaux, piecesDispo(db), reponse, … }` (contrôle au chargement : un
// carnet vide, un id double, une pièce qui n'est pas un document de la séance empêchent la séance de se charger), et
// `monterCourriel(M, services)` → `{ html(adresse), brancher(z), ouvrir() }`, appelé par `entreprise-messagerie.js`.
// Un module `entreprise-*.js` ou `types/*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech, auClavier } from '../ui.js';

export const GESTE_ENVOYER = 'courriel:envoyer';
export const gesteEnvoyerA = (id) => `${GESTE_ENVOYER}:${id}`;

// L'état d'une séance dans la base (jamais créé par une lecture).
export const courrielsDe = (db, seance) => (db && db.courriels && db.courriels[seance]) || null;

// Ce que l'élève a envoyé, dans l'ordre d'envoi : pour les jalons et les déclencheurs.
export function courrielsEnvoyes(db, seance) {
  const C = db && db.courriels;
  if (!C) return [];
  const L = seance != null ? ((C[seance] && C[seance].envoyes) || [])
    : Object.values(C).flatMap((x) => (x && x.envoyes) || []).sort((a, b) => a.at - b.at);
  return L.map((x) => ({ a: x.a, objet: x.objet, corps: x.corps, pieces: (x.pieces || []).slice(), at: x.at }));
}

const texte = (x) => typeof x === 'string' && x.trim() !== '';

export function compilerCourriel(C, { VDOC = null, VFICHES = [] } = {}) {
  if (!C || typeof C !== 'object' || Array.isArray(C)) throw new Error('courriel : l’option est un objet { carnet, pieces?, reponse?, objet? }');
  const connues = ['carnet', 'pieces', 'reponse', 'objet'];
  Object.keys(C).forEach((k) => { if (!connues.includes(k)) throw new Error(`courriel : « ${k} » n’existe pas (clés connues : ${connues.join(', ')})`); });
  if (!Array.isArray(C.carnet) || !C.carnet.length) throw new Error('courriel : « carnet » est la liste des destinataires, au moins un');
  const vus = new Set();
  C.carnet.forEach((p, i) => {
    const ou = `courriel : le contact n° ${i + 1}`;
    if (!p || typeof p !== 'object') throw new Error(`${ou} doit être { id, nom, mail, role? }`);
    if (!texte(p.id)) throw new Error(`${ou} n’a pas d’« id »`);
    if (/[\s:]/.test(p.id)) throw new Error(`${ou} : l’id « ${p.id} » ne contient ni espace ni « : » (il sert de geste)`);
    if (vus.has(p.id)) throw new Error(`courriel : deux contacts portent le même « id » « ${p.id} »`);
    vus.add(p.id);
    if (!texte(p.nom)) throw new Error(`${ou} (« ${p.id} ») n’a pas de « nom »`);
    if (!texte(p.mail)) throw new Error(`${ou} (« ${p.id} ») n’a pas de « mail »`);
    if (p.role != null && typeof p.role !== 'string') throw new Error(`${ou} (« ${p.id} ») : « role » est un texte`);
  });
  if (C.pieces != null && !Array.isArray(C.pieces)) throw new Error('courriel : « pieces » est la liste des ids de documents de la séance');
  (C.pieces || []).forEach((id) => {
    if (!VDOC || !VDOC.doc(id) || VDOC.externe(id)) {
      throw new Error(`courriel : la pièce « ${id} » n’est pas un document de la séance (option « documents »${VDOC ? `: ${VDOC.ids().join(', ') || 'aucun'}` : ' absente'})`);
    }
  });
  if (C.reponse != null && typeof C.reponse !== 'function') throw new Error('courriel : « reponse » est une fonction (c, db, prenom) → réponse | null');
  if (C.objet != null && typeof C.objet !== 'string') throw new Error('courriel : « objet » est un texte');

  const parId = new Map(C.carnet.map((p) => [p.id, p]));
  const fichesEnreg = VFICHES.filter((VF) => VF.enregistrer);
  // Les fichiers joignables pour cette base : les documents déclarés, puis chaque fiche enregistrée (et seulement elle).
  function piecesDispo(db) {
    const L = (C.pieces || []).map((id) => ({ id, nom: VDOC.nom(id, db) }));
    fichesEnreg.forEach((VF) => { if (VF.enregistree(db)) L.push({ id: VF.idPiece, nom: VF.nomPiece(db) }); });
    return L;
  }
  return {
    carnet: C.carnet, parId, objet: C.objet || '', reponse: C.reponse || null, piecesDispo,
    // Les gestes que le courriel sait dire (voir l'en-tête).
    signaux: [GESTE_ENVOYER, ...C.carnet.map((p) => gesteEnvoyerA(p.id))],
  };
}

const TROMBONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  aria-hidden="true"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>`;

// Monté à chaque ouverture de la messagerie. `services` : db, E (état d'écran), hote, prenom, estProf, rendue(), ajouterMail,
// declencher, sauver, dessiner, signal, signaler, seance, VDOC.
export function monterCourriel(M, { db, E, hote, prenom, estProf, rendue, ajouterMail, declencher, sauver, dessiner, signal, signaler, seance, VDOC }) {
  const ui = E.courriel || (E.courriel = { retour: '', refus: false });
  const neuf = () => ({ brouillon: { a: '', objet: M.objet, corps: '', pieces: [] }, envoyes: [] });
  // L'élève : sa base, cloisonnée par séance. L'enseignant : une copie en mémoire (rien n'est rangé, rien n'est écrit chez l'élève).
  function etat() {
    if (estProf) return E.courrielProf || (E.courrielProf = neuf());
    // Copie rendue : on regarde, on n'écrit plus (pas même une case vide).
    if (rendue() && !courrielsDe(db, seance)) return neuf();
    if (!db.courriels) db.courriels = {};
    const e = db.courriels[seance] || (db.courriels[seance] = neuf());
    if (!e.brouillon) e.brouillon = neuf().brouillon;
    if (!Array.isArray(e.envoyes)) e.envoyes = [];
    return e;
  }
  // Le brouillon ne garde que des pièces encore proposées (une fiche ne se « désenregistre » pas, mais une déclaration peut changer).
  function brouillon() {
    const b = etat().brouillon, ids = new Set(M.piecesDispo(db).map((p) => p.id));
    b.pieces = (b.pieces || []).filter((id) => ids.has(id));
    return b;
  }

  function html(adresse) {
    const b = brouillon();
    const options = M.carnet.map((p) => `<option value="${ech(p.id)}"${b.a === p.id ? ' selected' : ''}>${ech(p.nom)}${p.role ? ` — ${ech(p.role)}` : ''}</option>`).join('');
    return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p></div>
      <section class="panneau ent-courriel" data-courriel>
        <button class="lien-accueil" data-annuler>← Retour</button>
        <h3>Nouveau courriel</h3>
        <div class="ent-courriel-deux">
          <div class="champ"><label for="cA">À</label>
            <select id="cA" data-c-a><option value="">Choisis un destinataire…</option>${options}</select></div>
          <div class="champ"><label for="cObj">Objet</label>
            <input id="cObj" type="text" autocomplete="off" data-c-objet value="${ech(b.objet)}"></div>
        </div>
        <div class="champ"><label for="cMsg">Message</label>
          <textarea id="cMsg" rows="5" data-c-corps>${ech(b.corps)}</textarea></div>
        <div class="champ" data-c-pj></div>
        <div class="ent-courriel-envoi"><button type="button" class="btn btn-p" data-c-envoyer>Envoyer</button>
          <div class="ent-courriel-retour${ui.refus ? ' refus' : ''}" role="status" aria-live="polite" tabindex="-1" data-c-retour>${ech(ui.retour || '')}</div></div>
      </section>`;
  }

  // Les pièces jointes : le bouton, les étiquettes, la liste des fichiers restants. Dessinées sur place (le focus reste où il est).
  function dessinerPJ(z) {
    const zone = z.querySelector('[data-c-pj]');
    if (!zone) return;
    const b = brouillon(), dispo = M.piecesDispo(db), nom = (id) => (dispo.find((p) => p.id === id) || { nom: id }).nom;
    const restants = dispo.filter((p) => !b.pieces.includes(p.id));
    zone.innerHTML = `<label id="cPjLib">Pièces jointes</label><div class="ent-courriel-pj" role="group" aria-labelledby="cPjLib">
      <button type="button" class="btn btn-s" data-c-joindre aria-expanded="false" aria-controls="cPjMenu">${TROMBONE} Joindre un fichier</button>
      ${b.pieces.map((id) => `<span class="ent-pj" data-c-piece="${ech(id)}">${TROMBONE}<span>${ech(nom(id))}</span><button type="button" data-c-retire="${ech(id)}"
        aria-label="Retirer ${ech(nom(id))}">×</button></span>`).join('')}</div>
      <div class="ent-courriel-menu" id="cPjMenu" data-c-menu hidden>${restants.length
        ? restants.map((p) => `<button type="button" data-c-joint="${ech(p.id)}">${TROMBONE} ${ech(p.nom)}</button>`).join('')
        : '<span class="note ent-courriel-menu-vide">Aucun autre fichier à joindre.</span>'}</div>`;
    const menu = zone.querySelector('[data-c-menu]'), bouton = zone.querySelector('[data-c-joindre]');
    bouton.addEventListener('click', () => {
      menu.hidden = !menu.hidden; bouton.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) menu.querySelector('button')?.focus();
    });
    menu.addEventListener('click', (ev) => {
      const j = ev.target.closest('[data-c-joint]');
      if (!j || rendue()) return;
      const bb = brouillon();
      if (!bb.pieces.includes(j.dataset.cJoint)) bb.pieces.push(j.dataset.cJoint);
      effacerRetour(z); sauver(); dessinerPJ(z);
      z.querySelector('[data-c-joindre]')?.focus();
    });
    menu.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { menu.hidden = true; bouton.setAttribute('aria-expanded', 'false'); bouton.focus(); } });
    zone.querySelectorAll('[data-c-retire]').forEach((x) => x.addEventListener('click', () => {
      if (rendue()) return;
      const bb = brouillon(); bb.pieces = bb.pieces.filter((id) => id !== x.dataset.cRetire);
      effacerRetour(z); sauver(); dessinerPJ(z);
      z.querySelector('[data-c-joindre]')?.focus();
    }));
  }

  function retour(z, message, refus) {
    ui.retour = message; ui.refus = !!refus;
    const r = z.querySelector('[data-c-retour]');
    if (r) { r.className = `ent-courriel-retour${refus ? ' refus' : ''}`; r.textContent = message; }
    return r;
  }
  const effacerRetour = (z) => { if (ui.retour) retour(z, '', false); };

  // Le bouton « Envoyer » : refus, confirmation dans la page (objet ou message vide), puis l'envoi.
  function tenter(z, confirme) {
    if (rendue()) return;
    const b = brouillon(), dest = M.parId.get(b.a);
    if (!dest) return retour(z, 'Choisis un destinataire.', true);
    const sansObjet = !b.objet.trim(), sansMsg = !b.corps.trim();
    if (!confirme && (sansObjet || sansMsg)) {
      const q = sansObjet && sansMsg ? 'Envoyer sans objet et sans message ?' : sansObjet ? 'Envoyer sans objet ?' : 'Envoyer sans message ?';
      const r = retour(z, '', false);
      r.insertAdjacentHTML('beforeend', `<div class="confirme-page" data-c-confirme role="alertdialog" aria-live="assertive"><p>${ech(q)}</p>
        <div class="confirme-boutons"><button type="button" class="btn btn-p" data-c-oui>Oui, envoyer</button>
        <button type="button" class="btn" data-c-non>Non, je complète</button></div></div>`);
      r.querySelector('[data-c-oui]').addEventListener('click', () => tenter(z, true));
      r.querySelector('[data-c-non]').addEventListener('click', () => { retour(z, '', false); (sansObjet ? z.querySelector('[data-c-objet]') : z.querySelector('[data-c-corps]'))?.focus(); });
      r.querySelector('[data-c-oui]').focus();
      return;
    }
    envoyer(dest);
  }

  function envoyer(dest) {
    if (rendue()) return;
    const e = etat(), b = brouillon(), at = Date.now();
    const objet = b.objet.trim(), corps = b.corps, pieces = b.pieces.slice();
    ajouterMail({ folder: 'out', ts: at, from: prenom, fromMail: '', to: dest.nom, toMail: dest.mail, subject: objet, kind: 'text', text: corps,
      pieces, read: true, courriel: true });
    e.envoyes.push({ a: dest.id, objet, corps, pieces, at });
    // La réponse automatique : lue sur ce qui vient d'être rangé. Une réponse qui plante est signalée, l'envoi reste fait.
    let reponses = [];
    if (M.reponse) {
      try {
        const r = M.reponse({ a: dest.id, objet, corps, pieces: pieces.slice(), at }, db, prenom);
        reponses = (Array.isArray(r) ? r : [r]).filter(Boolean);
      } catch (x) { if (signaler) signaler('la réponse du courriel plante', x); }
    }
    reponses.forEach((r, i) => {
      const p = M.parId.get(r.de);
      ajouterMail({ folder: 'in', ts: at + 1000 + i, from: p ? p.nom : String(r.de || dest.nom), fromMail: p ? p.mail : '', to: prenom,
        subject: r.objet || `RE : ${objet || 'votre courriel'}`, kind: 'text', text: String(r.texte || ''), pieces: (r.pieces || []).slice(), read: false });
    });
    e.brouillon = neuf().brouillon;
    signal(GESTE_ENVOYER); signal(gesteEnvoyerA(dest.id));
    ui.retour = `Courriel envoyé à ${dest.nom}. Tu le retrouves dans « Envoyés ».`; ui.refus = false;
    declencher();
    sauver(); dessiner();
    if (auClavier()) hote.querySelector('[data-c-retour]')?.focus();
  }

  function brancher(z) {
    const zone = z.querySelector('[data-courriel]');
    if (!zone) return;
    const garde = (f) => (ev) => { if (rendue()) return; f(ev); };
    zone.querySelector('[data-c-a]').addEventListener('change', garde((ev) => { brouillon().a = ev.target.value; effacerRetour(zone); sauver(); }));
    zone.querySelector('[data-c-objet]').addEventListener('input', garde((ev) => { brouillon().objet = ev.target.value; effacerRetour(zone); }));
    zone.querySelector('[data-c-objet]').addEventListener('change', garde(() => sauver()));
    zone.querySelector('[data-c-corps]').addEventListener('input', garde((ev) => { brouillon().corps = ev.target.value; effacerRetour(zone); }));
    zone.querySelector('[data-c-corps]').addEventListener('change', garde(() => sauver()));
    zone.querySelector('[data-c-envoyer]').addEventListener('click', () => tenter(zone, false));
    dessinerPJ(zone);
  }

  // « Nouveau courriel » : le message de l'envoi précédent ne suit pas.
  function ouvrir() { ui.retour = ''; ui.refus = false; }

  return { html, brancher, ouvrir };
}
