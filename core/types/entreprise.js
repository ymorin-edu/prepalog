// Type « entreprise » — un environnement de travail complet, façon ERP.
//
// Portage de LogiSim dans Prepalog. Chaque élève travaille dans SA base : messagerie,
// commandes clients, préparation et bon de préparation, catalogue, stock, tiers, console.
// Rien n'est partagé entre élèves — c'est la portée `eleve`, un blob JSON par activité.
//
// Ce que Prepalog apporte et que LogiSim portait lui-même : la connexion, les groupes, le
// suivi de classe. Ce fichier ne garde que l'environnement lui-même.
//
// Le suivi est automatique : chaque univers déclare ses `etapes`, qui savent lire la base
// d'un élève et dire si le travail attendu est fait. Le score remonté au suivi de classe
// est le nombre d'étapes réussies.

import { ech, toast, confirmer } from '../ui.js';
import { COLORS, SHIP, pad } from '../../contenus/entreprise-commun.js';
import { creerPlan } from './plan.js';
import { creerCarte } from './carte.js';
import { creerTournee } from './tournee.js';
import { creerInventaire } from './inventaire.js';

/* ------------------------------------------------------------------ formats */
export const eur = (n) => Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const fdate = (t) => new Date(t).toLocaleDateString('fr-FR');
export const fdt = (t) => new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const normLoc = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

const pastille = (texte, ton) => `<span class="pastille ${ton}">${ech(texte)}</span>`;

export function creerEntreprise(U) {
  const { ENTREPRISE, VOCAB, CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM,
    baseDeDepart, etapes = [], THEME = {} } = U;
  const { MODELS, MM, VARIANTS, VM } = CATALOGUE;

  // Une entreprise porte plusieurs séances, qui partagent son univers mais pas leur consigne.
  // `exercice` (la ligne sous « Bonjour {prénom} ») et `accueil` (la marche à suivre) sont
  // donc déclarés par l'activité, pas par l'entreprise. Sans eux, on retombe sur ce que
  // portait ENTREPRISE : les modules écrits avant continuent de fonctionner.
  const exercice = U.exercice || ENTREPRISE.exercice || '';
  const accueil = U.accueil || null;
  // Le volet de la base propre à la séance : ses messages, ses livraisons. Il est semé au
  // premier passage, sans toucher au travail déjà fait dans les autres séances.
  const volet = U.volet || null;

  // La trame de la séance, téléchargeable depuis le BANDEAU — révisée le 01/10/2026.
  //
  // La règle du 30/09 voulait que la trame vive uniquement sur le document distribué : le
  // site porte l'environnement, la trame porte les consignes. Le principe ne change pas —
  // les consignes ne sont toujours pas recopiées dans les écrans — mais le fichier, lui,
  // est désormais à portée de clic. Deux raisons, toutes deux pratiques : l'enseignant
  // retrouve en deux secondes le PDF à imprimer, et une séance où l'impression n'a pas pu
  // se faire n'est plus perdue — l'élève télécharge sa trame et travaille dessus.
  //
  //   trame: { pdf: './contenus/trames/x-trame-eleve.pdf',
  //            docx: './contenus/trames/x-trame-eleve.docx' }
  //
  // **Déclarer la trame, c'est la valider.** Une séance dont la trame n'est pas relue n'en
  // déclare pas : le bandeau n'affiche alors rien, et personne ne travaille sur un
  // brouillon. Les deux formats sont facultatifs l'un comme l'autre.
  //
  // Les liens vivaient au milieu du menu de gauche jusqu'au 01/10/2026 au soir. Ils sont
  // remontés dans le bandeau avec la remise à zéro : ce sont des actions de séance, pas
  // des écrans de l'application, et en bas d'un menu de douze entrées personne ne les
  // cherchait.
  const trame = U.trame || null;
  // Une séance qui se fait tout entière à l'écran le dit dans le bandeau, à la place des
  // liens de trame (02/10/2026) : `sansTrame: "Tout à l'écran"`. Sans effet si une trame est
  // déclarée — on ne montre jamais les deux.
  const sansTrame = !trame && U.sansTrame ? String(U.sansTrame) : null;

  // Les deux vues de transport, ajoutées le 02/10/2026 pour la tournée du vélo-cargo.
  // Elles n'existent que si la séance les déclare : une entreprise qui n'a pas de
  // transport garde exactement les écrans d'avant, sans entrée de menu en plus. Le code
  // générique vit dans `plan.js` et `tournee.js` — il ne connaît ni la ville, ni le
  // véhicule, et TechPro comme le choix du véhicule en hériteront tels quels.
  //
  // Depuis le 02/10/2026, une séance peut déclarer la VRAIE carte de la ville à la place du
  // plan schématique : `plan.carte` (le module généré par `outils/carte/construire.py`) fait
  // choisir `carte.js`. Même contrat pour l'hôte — `nav`, `ouvreSuite`, `html`, `brancher` —
  // donc rien d'autre ne change ici. ENT-3.1 ne déclare pas de carte : elle garde son plan.
  // ── La copie rendue (évaluation, 02/10/2026, chantier A) ─────────────────────────────────
  // `copie: true`, passé par l'activité ET déclaré dans son `meta` (le suivi de classe et
  // `core/app.js` le lisent là). Décisions de Tristan pour ENT-3.4, et toutes les évaluations :
  //   - pendant le travail, rien ne remonte au suivi : pas de « meilleur score » qu'on améliore
  //     en réessayant ;
  //   - aucune correction à l'écran : la tournée garde ses limites, sans dire si elles sont
  //     tenues, et ses cases s'enregistrent sans juste / faux (voir `copie` dans tournee.js) ;
  //   - « Rendre ma copie », une seule fois ; la note est calculée à la remise et figée ;
  //   - après la remise, l'environnement se consulte mais ne se modifie plus, sans note affichée.
  // L'enseignant ramasse les copies non rendues et peut en rouvrir une (core/copie.js).
  const COPIE = !!U.copie;
  const VPLAN = U.plan ? (U.plan.carte ? creerCarte(U.plan) : creerPlan(U.plan)) : null;
  const VTOUR = U.tournee ? creerTournee(Object.assign({ plan: U.plan }, U.tournee, COPIE ? { copie: true } : {})) : null;
  // L'écran « Inventaire » (02/10/2026, chantier E), sur le même principe : il n'existe que si
  // la séance déclare un `inventaire` — format dans `claude/prepalog-inventaire-format.md`.
  const VINV = U.inventaire ? creerInventaire(U.inventaire, CATALOGUE) : null;

  const unite = (n) => ((n > 1 || n === 0) ? VOCAB.unitPl : VOCAB.unit);
  // Catalogue « simple » (02/10/2026, chantier E) : des articles sans couleur ni taille — un
  // câble, une batterie, un carton de vin. Jusque-là l'environnement ne connaissait que la
  // chaussure de Spartoo (« modèle-couleur-taille ») et plantait sur un article sans couleur.
  // Pour un tel catalogue (`catalogueSimple`, contenus/entreprise-commun.js), les colonnes
  // Couleur et Taille disparaissent partout ; rien ne change pour Spartoo.
  const SIMPLE = !!CATALOGUE.simple;
  const label = (v) => [v.model.brand, v.model.name].filter(Boolean).join(' ');
  const nomCouleur = (c) => (COLORS[c] ? COLORS[c][0] : '');
  const swatch = (c) => (COLORS[c] ? `<span class="teinte" style="background:${COLORS[c][1]}"></span>${ech(COLORS[c][0])}` : '');
  // La précision « Noir · T.42 » sous une désignation, et les deux colonnes Couleur / Taille.
  const precision = (v) => (SIMPLE || !v ? '' : `<div class="note">${ech(nomCouleur(v.color))} · ${ech(VOCAB.sizeShort)}${v.size}</div>`);
  const precisionTexte = (v) => (SIMPLE ? '' : ` ${nomCouleur(v.color)} ${VOCAB.sizeShort}${v.size}`);
  const thVariante = (couleur = 'Couleur') => (SIMPLE ? '' : `<th>${couleur}</th><th class="num">${ech(VOCAB.sizeLabel)}</th>`);
  const tdVariante = (v, teinte) => (SIMPLE ? '' : (v ? `<td>${teinte ? swatch(v.color) : ech(nomCouleur(v.color))}</td><td class="num">${v.size}</td>` : '<td>—</td><td class="num">—</td>'));
  const etatStock = (q, min) => (q <= 0 ? ['Rupture', 'crit'] : (q <= min ? ['Faible', 'warn'] : ['OK', 'ok']));
  const pastilleStock = (q, min) => { const s = etatStock(q, min); return pastille(s[0], s[1]); };

  // La note d'une base : le nombre d'étapes réussies. Sert au suivi en direct, à la remise de la
  // copie, et à l'enseignant qui ramasse une copie (il lit la base de l'élève sans l'ouvrir).
  // Une étape qui plante sur une base incomplète compte comme non faite, sans tout arrêter.
  function noterBase(db) {
    const detail = {};
    let ok = 0;
    etapes.forEach((e) => {
      let st = 'ko';
      try { st = e.verifier(db, U).status; } catch (x) { st = 'ko'; }
      detail[e.id] = st;
      if (st === 'ok') ok++;
    });
    return { score: ok, max: etapes.length, detail };
  }

  return {
    copie: COPIE,
    // Pour le ramassage des copies (core/copie.js) : la note de la base d'un élève.
    noter(db) { return noterBase(JSON.parse(JSON.stringify(db || {}))); },
    rendre(hote, ctx) {
      if (!!(ctx.meta && ctx.meta.copie) !== COPIE) {
        hote.innerHTML = `<div class="avis avis-err">Évaluation mal déclarée : « copie » doit figurer
          dans le meta de l'activité ET dans ce qu'elle passe à creerEntreprise.</div>`;
        return;
      }
      if (ctx.meta.portee !== 'eleve') {
        hote.innerHTML = `<div class="avis avis-err">Un environnement d'entreprise doit être de portée « eleve ».</div>`;
        return;
      }

      const db = ctx.jeu.etat();
      const prenom = ctx.profil.prenom || ctx.profil.nom || 'Élève';
      const estProf = ctx.profil.role === 'prof';

      // Premier passage : on sème la base de départ. `_depart` porte les messages, qui
      // reçoivent ici leur identifiant — le reste de l'application n'a plus à s'en soucier.
      if (!db.v) {
        const depart = baseDeDepart(prenom);
        Object.keys(depart).forEach((k) => { if (k !== '_depart') db[k] = depart[k]; });
        (depart._depart || []).forEach((m) => ajouterMail(m));
        ctx.jeu.sauver();
      }
      // Les listes que tout le moteur suppose présentes. Appelée à l'ouverture ET après une
      // remise à zéro : `baseDeDepart` n'en fournit qu'une partie (ni `receptions`, ni `transport`).
      function normaliserBase() {
        ['moves', 'mails', 'orders', 'receptions', 'customers', 'suppliers'].forEach((k) => { if (!db[k]) db[k] = []; });
        // L'état des vues de transport vit dans la base de l'élève, comme le reste de son
        // travail : un repérage validé doit se retrouver après une fermeture d'onglet, et
        // d'une semaine sur l'autre.
        if (!db.transport) db.transport = {};
      }
      normaliserBase();

      // Le volet de la séance. Chaque activité sème le sien une seule fois, sans toucher au
      // reste : un élève qui a fait la réception la semaine dernière retrouve son stock, et
      // reçoit en plus les messages de la séance du jour. `db.volets` retient ce qui a été
      // semé, pour ne pas le refaire à chaque ouverture.
      // `semer` reçoit la base : une séance peut donc regarder ce que l'élève a déjà fait
      // avant de décider quoi semer. C'est ce qui permet à la traçabilité de fonctionner
      // pour un élève qui a manqué la réception — elle lui pose l'historique qui manque —
      // sans rien réécrire chez celui qui l'a faite.
      //
      // Fonction à part depuis le 02/10/2026 : la remise à zéro (`reinitialiser`) efface aussi
      // `db.volets`, et ne ressemait pas le volet — l'élève qui cliquait « Réinitialiser » en
      // ENT-1.1 se retrouvait avec une réception vide et sans les messages de la séance, jusqu'à
      // ce qu'il quitte et rouvre. Une base remise à zéro doit être celle d'un premier passage.
      function semerVolet() {
        if (!volet) return;
        if (!db.volets) db.volets = {};
        if (!db.volets[volet.id]) {
          const g = volet.semer(prenom, db) || {};
          (g.receptions || []).forEach((r) => db.receptions.push(r));
          (g.orders || []).forEach((o) => db.orders.push(o));
          // Des mouvements déjà datés : une réception enregistrée par un collègue, des
          // commandes parties les jours précédents. Ils portent leur lot, donc ils se
          // remontent comme les autres. `stockDe` n'est pas encore défini ici.
          (g.mouvements || []).forEach((m) => {
            db.stock[m.sku] = (db.stock[m.sku] == null ? 0 : db.stock[m.sku]) + m.delta;
            db.moves.push({ ts: m.ts || Date.now(), sku: m.sku, type: m.type, delta: m.delta,
              after: db.stock[m.sku], ref: m.ref || '', lot: m.lot || '', by: m.by || prenom });
          });
          if ((g.mouvements || []).length) db.moves.sort((a, b) => a.ts - b.ts);
          (g.mails || []).forEach((m) => ajouterMail(m));
          db.volets[volet.id] = Date.now();
          ctx.jeu.sauver();
        }
      }
      semerVolet();

      // ----------------------------------------------------------- état d'écran
      // Volontairement hors de la base : ce sont des choix d'affichage, pas du travail.
      const E = {
        vue: 'accueil', no: null, ref: null,
        mailSel: null, dossier: 'in', redige: false,
        onglet: {}, console: [{ cmd: null, html: '<span class="note">Console. Tapez <b>.help</b> pour la liste des commandes.</span>' }],
        stockOuvert: estProf, erreurCode: '',
        blocage: { lot: '', ref: '', qte: '', motif: '' }, erreurBlocage: '', okBlocage: '',
      };

      // Les couleurs de l'entreprise remplacent celles de Prepalog, mais seulement pendant
      // que le module est ouvert : dès qu'on en sort, le site retrouve sa charte et son
      // thème clair/sombre.
      //
      // Deux niveaux. THEME.accent seul : seule la couleur d'accent change, le module suit
      // le thème du site. THEME.sombre en plus : le module repeint aussi les surfaces et
      // impose son ambiance sombre, quel que soit le réglage du site — c'est le rendu de
      // LogiSim d'origine, que l'élève doit retrouver en entrant dans l'entreprise.
      const enRgb = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16)).join(',');

      // L'encre à poser SUR un aplat de cette couleur, choisie par sa luminance. Elle sert à
      // la pastille d'ordre de passage de la carte, dessinée en `--vert` : la menthe de Boost
      // (#25c998) est claire, et l'encre blanche du site y devenait illisible — deux pour un
      // de contraste sur un chiffre de dix pixels, au vidéoprojecteur. La calculer évite de
      // demander une couleur de plus à chaque entreprise, et une charte peut toujours imposer
      // la sienne avec `surVert`.
      const surCouleur = (h) => {
        const [r, g, b] = h.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255);
        const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        return L > 0.4 ? '#07261c' : '#ffffff';
      };

      function styleTheme() {
        const v = [];
        const a = THEME.accent;
        if (a) {
          v.push(`--ardoise:${a}`, `--ardoise-fond:${a}`,
            `--sur-ardoise:${THEME.surAccent || '#ffffff'}`,
            `--ardoise-clair:rgba(${enRgb(a)},.11)`);
        }
        const P = THEME.sombre;
        if (P) {
          v.push(
            `--fond:${P.fond}`, `--panneau:${P.panneau}`, `--survol:${P.survol}`,
            `--filet:${P.filet}`, `--encre:${P.encre}`, `--encre-douce:${P.encreDouce}`,
            // Sur fond sombre, l'accent des textes et des bordures doit être plus clair que
            // celui des aplats pleins, sinon il disparaît.
            `--ardoise:${P.accent}`, `--ardoise-fond:${P.accentFond || P.accent}`,
            `--ardoise-clair:${P.accentClair || `rgba(${enRgb(P.accent)},.14)`}`,
            `--terre:${P.terre}`, `--vert:${P.vert}`, `--rouge:${P.rouge}`,
            `--sur-vert:${P.surVert || surCouleur(P.vert)}`,
            `--ent-bandeau:${P.bandeau || P.panneau}`,
            `--ent-side:${P.menu || P.bandeau || 'transparent'}`,
            `--ent-bandeau-txt:${P.encre}`,
            `--ent-marque:${P.accent}`,
            `--ent-badge:${P.accentFond || P.accent}`,
            // Un message flottant sombre disparaîtrait sur ce fond : il prend l'accent.
            `--toast-fond:${P.accentFond || P.accent}`, '--toast-texte:#ffffff',
            '--gele-fond:#2a1a12',
            '--ombre:0 1px 2px rgba(0,0,0,.45)',
            'color-scheme:dark');
        }
        return v.join(';');
      }

      // L'ambiance doit couvrir toute la fenêtre, pas seulement la colonne de contenu :
      // les variables sont posées sur <body>, et retirées à la sortie du module.
      function habiller() {
        document.body.classList.add('immersion');
        document.body.setAttribute('style', styleTheme());
      }
      function deshabiller() {
        document.body.classList.remove('immersion');
        document.body.removeAttribute('style');
      }
      const sortir = (fn) => { deshabiller(); if (fn) fn(); };

      // L'état de la copie (évaluation). `charge` : on sait si elle est déjà rendue — tant qu'on
      // ne le sait pas, le bouton « Rendre » n'est pas offert. Côté enseignant, rien à rendre.
      const copie = { rendue: null, ramassee: false, arme: false, envoi: false, charge: !COPIE || estProf };
      const rendue = () => !!(COPIE && copie.rendue);
      // Copie rendue : plus rien ne s'écrit dans la base, même si un geste passait le verrou.
      const sauver = () => { if (rendue()) return; ctx.jeu.sauver(); remonterEtapes(); };
      const stockDe = (sku) => { const q = db.stock[sku]; return q == null ? 0 : q; };

      function ajouterMail(m) {
        m.id = db.seq++; if (m.read === undefined) m.read = false;
        db.mails.push(m); return m;
      }
      // Le numéro de lot voyage avec le mouvement. C'est lui qui rend la traçabilité possible :
      // sans lui, on sait qu'une paire est sortie, pas de quelle livraison elle venait.
      function mouvement(sku, type, delta, ref, lot) {
        db.moves.push({ ts: Date.now(), sku, type, delta, after: db.stock[sku], ref: ref || 'Console', lot: lot || '', by: prenom });
      }
      const tousClients = () => CUSTOMERS.concat(db.customers || []);
      const tousFournisseurs = () => SUPPLIERS.concat(db.suppliers || []);
      const clientDe = (id) => CM[id] || (db.customers || []).find((c) => c.id === id) || { prenom: '?', nom: '', adr: '', cp: '', ville: '', email: '', tel: '', id };
      function codeSuivant(liste, prefixe, largeur) {
        let mx = 0;
        liste.forEach((x) => { const n = parseInt(String(x.id).replace(/\D/g, ''), 10); if (!isNaN(n) && n > mx) mx = n; });
        return prefixe + pad(mx + 1, largeur);
      }

      // Le score du suivi de classe : le nombre d'étapes réussies.
      function remonterEtapes() {
        if (estProf || !etapes.length) return;
        const { score: ok, max, detail: res } = noterBase(db);
        // Évaluation : rien ne remonte pendant le travail, seule la remise compte.
        if (!COPIE) ctx.enregistrer({ score: ok, max, detail: res });
        // Séance validée : on range une photo du travail, une fois pour toutes. Elle ouvre la
        // séance suivante et sert de point de reprise (voir core/parcours.js).
        if (ctx.meta.parcours && ok === max) {
          if (!db.points) db.points = {};
          if (!db.points[ctx.meta.id]) {
            const { points, reprise, ...reste } = db;
            db.points[ctx.meta.id] = JSON.parse(JSON.stringify(reste));
            ctx.jeu.sauver();
          }
        }
      }

      /* ====================================================== commandes clients */
      const totaux = (o) => {
        let sub = 0, n = 0;
        o.lines.forEach((l) => { sub += VM[l.sku].model.price * l.qty; n += l.qty; });
        const port = SHIP[o.ship][1];
        return { sub, port, total: sub + port, n };
      };
      function statutCommande(o) {
        if (!o.prep) return ['À préparer', 'warn'];
        if (o.prep.validated) return o.prep.complete ? ['Préparée', 'ok'] : ['Préparée (reliquat)', 'info'];
        const debut = Object.keys(o.prep.rows).some((k) => {
          const r = o.prep.rows[k];
          return r.seen !== '' || r.loc || r.qty !== '' || r.status;
        });
        return debut ? ['En cours', 'info'] : ['À préparer', 'warn'];
      }
      function preparer(o) {
        if (o.prep) return;
        o.prep = { rows: {}, doc: false, validated: false };
        o.lines.forEach((l) => { o.prep.rows[l.sku] = { seen: '', loc: '', qty: '', status: '' }; });
      }
      const ligneRemplie = (r) => r.seen !== '' && r.seen != null && !!(r.loc && r.loc.trim()) && r.qty !== '' && r.qty != null && !!r.status;
      const libelleStatut = (s) => (s === 'ok' ? pastille('Complet', 'ok') : s === 'warn' ? pastille('Partiel', 'warn')
        : s === 'crit' ? pastille('Rupture', 'crit') : '<span class="note">—</span>');
      const commandeDe = (no) => db.orders.find((o) => o.no === no);

      function tableauCommande(o, avecPrix) {
        return `<div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Désignation</th>${thVariante()}
          <th class="num">Qté</th>
          ${avecPrix ? '<th class="num">PU TTC</th><th class="num">Total</th>' : ''}</tr></thead><tbody>
          ${o.lines.map((l) => { const v = VM[l.sku]; return `<tr>
            <td class="mono">${ech(l.sku)}</td><td>${ech(label(v))}</td>${tdVariante(v, true)}
            <td class="num">${l.qty}</td>
            ${avecPrix ? `<td class="num">${eur(v.model.price)}</td><td class="num">${eur(v.model.price * l.qty)}</td>` : ''}
          </tr>`; }).join('')}</tbody></table></div>`;
      }

      function corpsMailCommande(o) {
        const c = clientDe(o.customerId), t = totaux(o);
        return `<p>Une nouvelle commande vient d'être passée sur le site. Paiement par carte bancaire accepté.</p>
          <div class="ent-cols">
            <div><div class="ent-lbl">Client</div><strong>${ech(c.prenom + ' ' + c.nom)}</strong><br>${ech(c.adr)}<br>
              ${ech(c.cp)} ${ech(c.ville)}<br><span class="mono note">${ech(c.email)} · ${ech(c.tel)}</span></div>
            <div><div class="ent-lbl">Commande</div><strong class="mono">${ech(o.no)}</strong><br>Date : ${fdt(o.date)}<br>
              Livraison : ${ech(SHIP[o.ship][0])}<br>Code client : <span class="mono">${ech(c.id)}</span></div>
          </div>${tableauCommande(o, true)}
          <p class="ent-droite">Sous-total ${eur(t.sub)} · Port ${eur(t.port)} · <strong>Total TTC ${eur(t.total)}</strong></p>`;
      }

      /* ============================================================== rendu */
      function dessiner() {
        const nonLus = db.mails.filter((m) => m.folder === 'in' && !m.read).length;
        const aFaire = db.orders.filter((o) => ['À préparer', 'En cours'].includes(statutCommande(o)[0])).length;
        const aRecevoir = (db.receptions || []).filter((r) => !r.ctrl || !r.ctrl.validated).length;
        const item = (id, lbl, n, alias) => {
          const actif = (alias || [id]).includes(E.vue);
          return `<button class="ent-nav ${actif ? 'on' : ''}" data-vue="${id}">
            <span>${ech(lbl)}</span>${n ? `<span class="ent-n">${n}</span>` : ''}</button>`;
        };
        // Le mode hors connexion de la vue plan, remonté dans le BANDEAU le 03/10/2026.
        // Tristan : *« il ne faut pas mettre ça ici, la majorité des élèves va juste cliquer
        // dessus pour avoir les réponses »*. Sous la carte, au milieu du travail, il se lisait
        // comme une aide à l'exercice ; à côté de « Réinitialiser », il se lit comme un réglage
        // de poste. Le mécanisme, lui, n'a pas bougé : l'état reste `plan.secours`, horodaté.
        //
        // Lecture SANS création : on passe par la base à la main plutôt que par
        // `etatTransport('plan')`, pour que le simple affichage du bandeau n'aille pas poser
        // l'état de la vue plan dans la base d'un élève qui ne l'a jamais ouverte.
        const horsCo = !!(db.transport && db.transport[cleTransport]
          && db.transport[cleTransport].plan && db.transport[cleTransport].plan.secours);

        hote.innerHTML = `
          <div class="ent-page" style="${styleTheme()}">
            <header class="ent-bandeau">
              ${ENTREPRISE.logo ? `<img class="ent-logo" src="${ech(ENTREPRISE.logo)}" alt="${ech(ENTREPRISE.nom)}">` : ''}
              <span class="ent-marque">${ech(ENTREPRISE.nom)}</span>
              <span class="ent-baseline">${ech(ENTREPRISE.sousTitre)}</span>
              ${etiquetteSeance()}
              <span class="pousse ent-qui">${ech(prenom)}</span>
              <!-- Les actions du bandeau, dans cet ordre : remise à zéro, puis les deux trames
                   de la séance (elles vont par paire), puis le réglage de poste. ENT-3.1 n'a pas
                   encore de trame, mais elle en aura une comme les trois Spartoo : la place est
                   donc tenue, et le mode hors connexion reste en bout de file. -->
              ${boutonsCopie()}
              ${ctx.meta && ctx.meta.reinitialisable && !rendue() ? `<button class="ent-act ent-act-raz" data-raz
                title="Effacer votre travail et repartir d'une base neuve">Réinitialiser</button>` : ''}
              ${trame && trame.pdf ? `<a class="ent-act" href="${ech(trame.pdf)}" download
                title="Le carnet de bord de la séance, à imprimer ou à lire à l'écran">Trame PDF</a>` : ''}
              ${trame && trame.docx ? `<a class="ent-act" href="${ech(trame.docx)}" download
                title="Le même carnet, à compléter au clavier">Trame Word</a>` : ''}
              ${sansTrame ? `<span class="ent-sans-trame" title="Pas de feuille à rendre : tout se fait dans l'environnement">${ech(sansTrame)}</span>` : ''}
              ${!(VPLAN && VPLAN.horsConnexion) ? '' : `<button class="ent-act" data-hors-connexion
                ${horsCo ? 'disabled' : ''}
                title="${horsCo
                  ? 'Les quartiers sont affichés sur le plan. La case du quadrillage reste à trouver.'
                  : 'Si les plans en ligne ne passent pas depuis ce poste : affiche le quartier de chaque point sur le plan. La case du quadrillage reste à trouver.'}"
                >${ech(VPLAN.horsConnexion.libelle)}${horsCo ? ' ✓' : ''}</button>`}
              <span class="ent-barre" aria-hidden="true"></span>
              <button class="ent-sortie" data-quitter>Quitter</button>
            </header>
            <div class="ent-shell">
              <aside class="ent-side">
                ${item('accueil', 'Accueil')}
                ${item('mail', 'Messagerie', nonLus)}
                ${item('commandes', 'Commandes', aFaire, ['commandes', 'commande'])}
                ${item('receptions', 'Réceptions', aRecevoir, ['receptions', 'reception'])}
                ${VPLAN || VTOUR ? `<div class="ent-sep">${ech(U.transportSection || 'Transport')}</div>` : ''}
                ${VPLAN ? item('plan', VPLAN.nav.libelle) : ''}
                ${VTOUR ? item('tournee', VTOUR.nav.libelle) : ''}
                <div class="ent-sep">Articles</div>
                ${item('catalogue', 'Catalogue', 0, ['catalogue', 'produit'])}
                ${item('stock', 'Stock')}
                ${VINV ? item('inventaire', VINV.nav.libelle) : ''}
                ${item('blocage', 'Blocage qualité')}
                <div class="ent-sep">Tiers</div>
                ${item('clients', 'Clients')}
                ${item('fournisseurs', 'Fournisseurs')}
                <div class="ent-sep">Outils</div>
                ${item('console', 'Console')}
              </aside>
              <div class="ent-main" id="entMain"></div>
            </div>
          </div>`;

        hote.querySelectorAll('[data-vue]').forEach((b) => b.addEventListener('click', () => aller(b.dataset.vue)));
        hote.querySelector('[data-raz]')?.addEventListener('click', reinitialiser);
        hote.querySelector('[data-hors-connexion]')?.addEventListener('click', () => {
          VPLAN.activerHorsConnexion(etatTransport('plan'));
          sauver(); dessiner();
          toast('Mode hors connexion : les quartiers sont affichés sur le plan.');
        });
        hote.querySelector('[data-quitter]').addEventListener('click', () => sortir(ctx.quitter));
        hote.querySelector('[data-copie-rendre]')?.addEventListener('click', () => {
          if (!copie.arme) { copie.arme = true; dessiner(); return; }
          rendreLaCopie();
        });
        hote.querySelector('[data-copie-annuler]')?.addEventListener('click', () => { copie.arme = false; dessiner(); });
        habiller();
        dessinerVue();
      }

      /* ------------------------------------------------------------- la copie rendue */
      // Le bouton du bandeau, en deux temps sans boîte de dialogue du navigateur (elles bloquent
      // les postes et les tests) : le premier clic arme, le second rend. Même geste que
      // « Recommencer la tournée ».
      function boutonsCopie() {
        if (!COPIE) return '';
        if (estProf) return '<span class="ent-copie" title="Les élèves rendent leur copie ici ; vous la ramassez depuis le suivi.">Évaluation</span>';
        if (copie.rendue) {
          return `<span class="ent-copie ent-copie-rendue" data-copie-etat="rendue">${
            copie.ramassee ? 'Copie ramassée' : 'Copie rendue'} à ${ech(heureDe(copie.rendue))}</span>`;
        }
        if (!copie.charge) return '<span class="ent-copie">Évaluation</span>';
        return `<span class="ent-copie">Évaluation</span>
          <button class="ent-act ent-act-copie${copie.arme ? ' ent-act-arme' : ''}" data-copie-rendre ${copie.envoi ? 'disabled' : ''}
            title="Remettre votre travail à l'enseignant. Une seule remise : vous ne pourrez plus rien modifier.">${
            copie.envoi ? 'Envoi…' : (copie.arme ? 'Rendre définitivement ? Cliquez pour confirmer' : 'Rendre ma copie')}</button>
          ${copie.arme && !copie.envoi ? '<button class="ent-act" data-copie-annuler>Annuler</button>' : ''}`;
      }
      const heureDe = (ts) => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

      async function rendreLaCopie() {
        if (copie.envoi || copie.rendue) return;
        copie.envoi = true; dessiner();
        const res = noterBase(db);
        try {
          // Le travail d'abord : la base de l'élève est ce que l'enseignant consultera.
          ctx.jeu.sauver();
          if (ctx.jeu.vidange) await ctx.jeu.vidange();
          const t = await ctx.rendreCopie(res);
          copie.rendue = (t && t.rendu) || Date.now();
          copie.ramassee = !!(t && t.ramasse);
          toast('Copie rendue. Votre enseignant vous donnera la note.');
        } catch (e) {
          // Déjà rendue (ramassée par l'enseignant pendant qu'on travaillait, ou un double clic
          // sur deux onglets) : on relit ce qui fait foi.
          const t = await ctx.lireScore().catch(() => null);
          if (t && t.rendu) { copie.rendue = t.rendu; copie.ramassee = !!t.ramasse; toast('Cette copie a déjà été remise.'); }
          else toast("La copie n'a pas pu être rendue. Réessayez, ou appelez votre enseignant.");
        }
        copie.envoi = false; copie.arme = false;
        dessiner();
      }

      // Après la remise : on regarde, on ne touche plus. Le verrou est posé UNE fois sur l'hôte,
      // en phase de capture, donc avant les écouteurs de chaque vue — une vue écrite demain sera
      // verrouillée sans rien savoir de la copie. Restent libres : le menu, la sortie, le zoom
      // de la carte. `sauver` ne fait plus rien non plus : deux gardes valent mieux qu'une.
      const LIBRE = '.ent-nav, [data-quitter], [data-ct-zoom], [data-ct-ensemble]';
      if (COPIE && !estProf) {
        const verrou = (ev) => {
          if (!rendue()) return;
          const t = ev.target;
          if (t && t.closest && t.closest(LIBRE)) return;
          if (ev.type === 'keydown' && ev.key === 'Tab') return;
          ev.stopPropagation(); ev.preventDefault();
        };
        ['click', 'dblclick', 'mousedown', 'input', 'change', 'keydown', 'submit', 'dragstart', 'drop', 'paste']
          .forEach((type) => hote.addEventListener(type, verrou, true));
      }
      function figerVue(z) {
        if (!rendue()) return;
        z.querySelectorAll('input, select, textarea').forEach((el) => { el.disabled = true; });
        z.querySelectorAll('button').forEach((el) => { if (!el.matches(LIBRE)) el.disabled = true; });
        z.insertAdjacentHTML('afterbegin', `<div class="avis ent-copie-avis" data-copie-avis>
          <strong>${copie.ramassee ? 'Copie ramassée' : 'Copie rendue'} à ${ech(heureDe(copie.rendue))}.</strong>
          Votre travail est enregistré tel quel : vous pouvez le consulter, plus le modifier.
          Votre enseignant vous donnera la note.</div>`);
      }

      // La séance en cours, affichée dans le bandeau depuis le 01/10/2026 : trois séances
      // Spartoo partagent la même entreprise et le même décor, donc rien à l'écran ne disait
      // laquelle était ouverte. L'enseignant qui passe dans les rangs doit pouvoir le lire
      // d'un coup d'œil, sans se pencher sur la machine.
      //
      // Le titre de l'activité commence par le nom de l'entreprise (« Spartoo — réception »),
      // déjà affiché deux centimètres à gauche : on le retire pour ne garder que la séance.
      function etiquetteSeance() {
        const code = String((ctx.meta && ctx.meta.code) || '').trim();
        const titre = String((ctx.meta && ctx.meta.titre) || '').trim();
        const nom = String(ENTREPRISE.nom || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let court = nom ? titre.replace(new RegExp('^\\s*' + nom + '\\s*[\u2014\u2013-]\\s*', 'i'), '') : titre;
        court = (court || titre).trim();
        if (court) court = court.charAt(0).toUpperCase() + court.slice(1);
        if (!code && !court) return '';
        return `<span class="ent-seance">${code ? `<b class="mono">${ech(code)}</b>` : ''}${
          code && court ? ' · ' : ''}${ech(court)}</span>`;
      }

      function aller(v, p) {
        E.vue = v; Object.assign(E, p || {});
        dessiner();
        hote.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }

      function dessinerVue() {
        const z = hote.querySelector('#entMain');
        const vues = {
          accueil: vueAccueil, mail: vueMail, commandes: vueCommandes, commande: vueCommande,
          receptions: vueReceptions, reception: vueReception,
          plan: vuePlan, tournee: vueTournee,
          catalogue: vueCatalogue, produit: vueProduit, stock: vueStock, blocage: vueBlocage,
          inventaire: VINV ? vueInventaire : vueAccueil,
          clients: vueClients, fournisseurs: vueFournisseurs, console: vueConsole,
        };
        z.innerHTML = (vues[E.vue] || vueAccueil)();
        brancher(z);
        figerVue(z);
        if (E.vue === 'catalogue') majCatalogue();
        if (E.vue === 'stock' && E.stockOuvert) majStock();
        if (E.vue === 'clients' || E.vue === 'fournisseurs') majTiers();
        if (E.vue === 'console') { const o = z.querySelector('.ent-cout'); if (o) o.scrollTop = o.scrollHeight; }
      }

      async function reinitialiser() {
        if (!confirmer('Effacer tout votre travail et repartir d\'une base neuve ?')) return;
        // Ce qui survit à la remise à zéro : les photos de fin de séance (la validation reste
        // acquise) et la reprise demandée par l'enseignant (voir core/app.js), qui sans cela
        // serait rejouée à la prochaine ouverture et effacerait le travail refait depuis.
        const reprise = db.reprise, points = db.points;
        const photo = ctx.meta.precedente && points && points[ctx.meta.precedente];
        Object.keys(db).forEach((k) => delete db[k]);
        if (photo) {
          // Repartir de ce que l'élève a réellement fait à la séance précédente.
          Object.assign(db, JSON.parse(JSON.stringify(photo)));
        } else {
          const depart = baseDeDepart(prenom);
          Object.keys(depart).forEach((k) => { if (k !== '_depart') db[k] = depart[k]; });
          (depart._depart || []).forEach((m) => ajouterMail(m));
        }
        if (reprise) db.reprise = reprise;
        if (points) db.points = points;
        normaliserBase();
        semerVolet();
        E.vue = 'accueil'; E.mailSel = null; E.no = null;
        sauver(); dessiner(); toast('Base réinitialisée.');
      }

      /* ---------------------------------------------------------- accueil */
      function vueAccueil() {
        const nonLus = db.mails.filter((m) => m.folder === 'in' && !m.read).length;
        const aFaire = db.orders.filter((o) => ['À préparer', 'En cours'].includes(statutCommande(o)[0])).length;
        const aRecevoir = (db.receptions || []).filter((r) => !r.ctrl || !r.ctrl.validated).length;
        let total = 0, rupture = 0;
        VARIANTS.forEach((v) => { const q = stockDe(v.sku); total += q; if (q <= 0) rupture++; });

        // La marche à suivre est celle de la SÉANCE, pas de l'entreprise : réceptionner,
        // préparer ou remonter une traçabilité ne se fait pas dans le même ordre. Sans bloc
        // déclaré, on garde celui du premier exercice.
        const bloc = accueil || {
          titre: "Traiter une commande, dans l'ordre",
          etapes: [
            ['Lire la commande', 'Ouvrez la Messagerie et cliquez sur le mail « Nouvelle commande web ».'],
            ['Enregistrer la commande', 'Le bouton du mail la place dans le menu Commandes.'],
            ['Contrôler le stock de chaque ligne', 'Depuis la commande, ou avec la console : .getstock REF.'],
            ['Éditer le bon de préparation', 'Les articles sont classés par emplacement pour optimiser le parcours.'],
            ['Valider la préparation', 'Le stock est diminué et les mouvements sont enregistrés.'],
          ],
        };
        const kpis = (accueil && accueil.kpis) || ['mail', 'commandes', 'stock', 'rupture'];
        const KPI = {
          mail: ['mail', nonLus, 'messages non lus'],
          commandes: ['commandes', aFaire, 'commandes à préparer'],
          receptions: ['receptions', aRecevoir, 'livraisons à contrôler'],
          stock: ['stock', total, unite(total) + ' en stock'],
          rupture: ['stock', rupture, 'références en rupture'],
        };

        return `
          <div class="ent-tete"><h2>Bonjour ${ech(prenom)}</h2>
            <p class="note">${ech(ENTREPRISE.nom)} · ${ech(exercice)}</p></div>
          <div class="ent-kpis">
            ${kpis.filter((k) => KPI[k]).map((k) => { const x = KPI[k];
              return `<button class="ent-kpi" data-vue2="${x[0]}"><b>${x[1]}</b><span>${ech(x[2])}</span></button>`; }).join('')}
          </div>
          <section class="panneau"><h3>${ech(bloc.titre)}</h3>
            <ol class="ent-etapes">
              ${bloc.etapes.map((e) => `<li><strong>${ech(e[0])}</strong><br><span class="note">${ech(e[1])}</span></li>`).join('')}
            </ol></section>`;
      }

      /* -------------------------------------------------------- messagerie */
      function vueMail() {
        const adresse = `${norm(prenom).replace(/ /g, '')}@${VOCAB.mailDomain}`;
        if (E.redige) {
          const fs = tousFournisseurs().slice().sort((a, b) => (a.brand < b.brand ? -1 : 1));
          return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p></div>
            <section class="panneau">
              <button class="lien-accueil" data-annuler>← Retour</button>
              <h3>Nouveau message</h3>
              <div class="champ"><label for="mTo">Destinataire (fournisseur)</label>
                <select id="mTo"><option value="">Choisir…</option>
                ${fs.map((s) => `<option value="${ech(s.id)}">${ech(s.brand)} — ${ech(s.name)}</option>`).join('')}</select></div>
              <div class="champ"><label for="mObj">Objet</label>
                <input id="mObj" value="Commande de réapprovisionnement"></div>
              <div class="champ"><label for="mTxt">Message</label>
                <textarea id="mTxt" rows="8" placeholder="Précisez, pour chaque référence, sa quantité (ex. ${ech(VARIANTS[0] ? VARIANTS[0].sku : 'REF')} : 12 ${ech(VOCAB.unitPl)})."></textarea></div>
              <button class="btn btn-p" data-envoyer-fou>Envoyer</button>
            </section>`;
        }

        const liste = db.mails.filter((m) => m.folder === E.dossier).sort((a, b) => b.ts - a.ts);
        const sel = liste.find((m) => m.id === E.mailSel);
        const items = liste.map((m) => `
          <button class="ent-mitem ${m.read || E.dossier === 'out' ? '' : 'nonlu'} ${sel && sel.id === m.id ? 'on' : ''}" data-mail="${m.id}">
            <span class="ent-de"><span>${ech(E.dossier === 'in' ? m.from : 'À : ' + m.to)}</span><span class="note">${fdate(m.ts)}</span></span>
            <span class="ent-obj">${ech(m.subject)}</span></button>`).join('')
          || '<div class="vide">Aucun message.</div>';

        let lecteur = '<div class="ent-vide-lect note">Sélectionnez un message pour le lire.</div>';
        if (sel) {
          const enregistree = sel.kind === 'order' && db.orders.some((o) => o.no === sel.order.no);
          const recDuMail = sel.kind === 'bl' ? receptionDe(sel.rec) : null;
          const corps = sel.kind === 'order' ? corpsMailCommande(sel.order)
            : sel.kind === 'bl' ? `<p>${ech(sel.text).replace(/\n/g, '<br>')}</p>${recDuMail ? bonDeLivraison(recDuMail) : ''}`
            : sel.kind === 'releve' ? `<p>${ech(sel.text || '').replace(/\n/g, '<br>')}</p>${VINV && sel.inventaire === VINV.id ? VINV.releve(sel) : ''}`
            : `<p>${ech(sel.text).replace(/\n/g, '<br>')}</p>`;
          let actions = '';
          if (E.dossier === 'in') {
            if (sel.kind === 'order') {
              actions += enregistree
                ? `<button class="btn btn-p" data-ouvrir-cmd="${ech(sel.order.no)}">Ouvrir la commande</button>`
                : `<button class="btn btn-p" data-enreg-cmd="${sel.id}">Enregistrer la commande</button>`;
            }
            if (sel.kind === 'bl' && recDuMail) {
              actions += `<button class="btn btn-p" data-ouvrir-rec="${ech(recDuMail.no)}">Ouvrir la réception</button>`;
            }
            actions += '<button class="btn" data-repondre>Répondre</button>';
          }
          lecteur = `<div class="ent-lecteur">
            <button class="lien-accueil" data-mail-retour>← Retour</button>
            <h3>${ech(sel.subject)}</h3>
            <p class="note">${E.dossier === 'in' ? 'De : ' + ech(sel.from + ' <' + sel.fromMail + '>') : 'À : ' + ech(sel.to + ' <' + (sel.toMail || '') + '>')} · ${fdt(sel.ts)}</p>
            ${corps}
            ${actions ? `<div class="rangee" style="margin-top:14px">${actions}</div>` : ''}
            <form id="formRep" hidden style="margin-top:14px">
              <div class="champ"><label for="repT">Votre réponse</label><textarea id="repT" rows="${sel.amorce ? 8 : 6}">${ech(sel.amorce || '')}</textarea></div>
              <button class="btn btn-p" type="submit">Envoyer</button></form></div>`;
        }

        return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p></div>
          <section class="panneau">
            <div class="rangee" style="margin-bottom:12px">
              <button class="btn btn-s ${E.dossier === 'in' ? 'btn-p' : ''}" data-dossier="in">Réception</button>
              <button class="btn btn-s ${E.dossier === 'out' ? 'btn-p' : ''}" data-dossier="out">Envoyés</button>
              <span class="pousse"><button class="btn btn-s btn-p" data-nouveau>Nouveau message</button></span>
            </div>
            <div class="ent-boite ${sel ? 'sel' : ''}"><div class="ent-mlist">${items}</div>${lecteur}</div>
          </section>`;
      }

      function ouvrirMail(id) {
        E.mailSel = id;
        const m = db.mails.find((x) => x.id === id);
        if (m && !m.read) { m.read = true; sauver(); }
        dessiner();
      }

      function enregistrerCommande(idMail) {
        const m = db.mails.find((x) => x.id === idMail);
        if (!m) return;
        if (!db.orders.some((o) => o.no === m.order.no)) {
          const o = JSON.parse(JSON.stringify(m.order));
          preparer(o); db.orders.push(o); sauver();
        }
        aller('commande', { no: m.order.no });
      }

      function envoyerReponse() {
        const t = (hote.querySelector('#repT').value || '').trim();
        if (!t) return;
        const m = db.mails.find((x) => x.id === E.mailSel);
        if (!m) return;
        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: m.from, toMail: m.fromMail,
          subject: 'RE : ' + m.subject.replace(/^RE : /, ''), kind: 'text', text: t, read: true });
        sauver(); E.dossier = 'out'; E.mailSel = null; dessiner();
        toast('Réponse envoyée.');
      }

      // Le fournisseur répond tout seul : l'outil retrouve dans le message les références et
      // les quantités citées, et rappelle le minimum de commande — respecté ou non.
      const RE_SKU = /\b([A-Z]{2,3}-[A-Z0-9]+-[A-Z]{2}-\d{1,2})\b[^0-9]{0,20}?(\d{1,4})/g;
      function lireRefsQtes(texte, supId) {
        const out = []; let m; RE_SKU.lastIndex = 0;
        while ((m = RE_SKU.exec(texte))) {
          const sku = m[1].toUpperCase(), qty = parseInt(m[2], 10), v = VM[sku];
          if (v && v.model.sup === supId) out.push({ sku, qty, v });
        }
        return out;
      }

      function envoyerAuFournisseur() {
        const id = hote.querySelector('#mTo').value;
        const sup = SUP_BY_ID[id] || (db.suppliers || []).find((s) => s.id === id);
        if (!sup) return toast('Choisissez un fournisseur.');
        const objet = (hote.querySelector('#mObj').value || '').trim() || 'Commande de réapprovisionnement';
        const corps = (hote.querySelector('#mTxt').value || '').trim();
        if (!corps) return toast('Le message est vide.');

        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: sup.contact, toMail: sup.email,
          subject: objet, kind: 'text', text: corps, read: true });

        const trouves = lireRefsQtes(corps, sup.id);
        let total = 0; trouves.forEach((x) => { total += x.qty; });
        let reponse;
        // Un message qui n'est pas une commande (des réserves sur une livraison, par exemple)
        // reçoit la réponse que l'univers a prévue pour lui, pas un rappel du minimum de
        // commande. Trouvé le 02/10/2026 en jouant ENT-1.1 : Puma répondait aux réserves
        // « pour un total de 14 paires, notre minimum de commande est de 20 ».
        const speciale = (U.reponsesFournisseur || []).map((f) => f(corps, sup, db, prenom)).find(Boolean);
        if (speciale) {
          reponse = speciale;
        } else if (!trouves.length) {
          reponse = `Bonjour,\n\nNous ne parvenons pas à identifier, dans votre message, de référence ${sup.brand} accompagnée d'une quantité claire. Merci de préciser pour chaque article sa référence exacte et la quantité souhaitée.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        } else if (total < (sup.moq || 0)) {
          reponse = `Bonjour,\n\nNous avons bien reçu votre demande, pour un total de ${total} ${unite(total)}. Pour rappel, notre minimum de commande est de ${sup.moq} ${VOCAB.unitPl} : merci de compléter votre commande avant que nous puissions la traiter.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        } else {
          reponse = `Bonjour,\n\nCommande bien reçue, pour un total de ${total} ${VOCAB.unitPl} : le minimum de commande (${sup.moq} ${VOCAB.unitPl}) est respecté. Livraison prévue sous ${sup.delai} jours.\n\nCordialement,\n${sup.contact}\n${sup.name}`;
        }
        ajouterMail({ folder: 'in', ts: Date.now() + 1000, from: sup.contact, fromMail: sup.email, to: prenom,
          subject: 'RE : ' + objet, kind: 'text', text: reponse, read: false });

        sauver(); E.redige = false; E.dossier = 'in'; E.mailSel = null; dessiner();
        toast('Message envoyé.');
      }

      /* ---------------------------------------------------------- commandes */
      function vueCommandes() {
        const lignes = db.orders.slice().sort((a, b) => b.date - a.date).map((o) => {
          const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o);
          return `<tr><td class="mono">${ech(o.no)}</td><td>${fdate(o.date)}</td>
            <td>${ech(c.prenom + ' ' + c.nom)}</td><td class="num">${o.lines.length}</td>
            <td class="num">${t.n}</td><td class="num">${eur(t.total)}</td>
            <td>${pastille(s[0], s[1])}</td>
            <td class="num"><button class="btn btn-s" data-ouvrir-cmd="${ech(o.no)}">Ouvrir</button></td></tr>`;
        }).join('');
        const u = VOCAB.unitPl.charAt(0).toUpperCase() + VOCAB.unitPl.slice(1);
        return `<div class="ent-tete"><h2>Commandes clients</h2>
            <p class="note">Les commandes apparaissent ici après avoir été enregistrées depuis la messagerie.</p></div>
          <section class="panneau">${lignes
            ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Date</th><th>Client</th>
                <th class="num">Lignes</th><th class="num">${ech(u)}</th><th class="num">Total TTC</th>
                <th>Statut</th><th></th></tr></thead><tbody>${lignes}</tbody></table></div>`
            : '<div class="vide">Aucune commande enregistrée. Ouvrez un mail de commande dans la messagerie.</div>'}</section>`;
      }

      function vueCommande() {
        const o = commandeDe(E.no);
        if (!o) return vueCommandes();
        preparer(o);
        const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o), p = o.prep;
        const fige = p.validated;
        const complet = o.lines.every((l) => ligneRemplie(p.rows[l.sku]));
        const choixStatut = [['', 'Choisir…'], ['ok', 'Complet'], ['warn', 'Partiel'], ['crit', 'Rupture']];

        const lignes = o.lines.map((l) => {
          const v = VM[l.sku], r = p.rows[l.sku];
          const cStock = fige ? `<b class="mono">${r.seen === '' ? '—' : r.seen}</b>`
            : `<input type="number" min="0" data-prep="seen" data-sku="${ech(l.sku)}" value="${r.seen === '' ? '' : r.seen}" style="width:70px" aria-label="Stock trouvé pour ${ech(l.sku)}">`;
          const cEmpl = fige ? ech(r.loc || '—')
            : `<input type="text" data-prep="loc" data-sku="${ech(l.sku)}" value="${ech(r.loc)}" placeholder="ex. B-01-1" style="width:112px" aria-label="Emplacement pour ${ech(l.sku)}">`;
          const cQte = fige ? (r.qty === '' ? '—' : r.qty)
            : `<input type="number" min="0" data-prep="qty" data-sku="${ech(l.sku)}" value="${r.qty === '' ? '' : r.qty}" style="width:70px" aria-label="Quantité à préparer pour ${ech(l.sku)}">`;
          const cStatut = fige ? libelleStatut(r.status)
            : `<select data-prep="status" data-sku="${ech(l.sku)}" aria-label="Statut pour ${ech(l.sku)}">
                ${choixStatut.map((op) => `<option value="${op[0]}" ${(r.status || '') === op[0] ? 'selected' : ''}>${op[1]}</option>`).join('')}</select>`;
          return `<tr><td class="mono">${ech(l.sku)}</td>
            <td>${ech(label(v))}${precision(v)}</td>
            <td class="num">${l.qty}</td><td class="num">${cStock}</td><td class="mono">${cEmpl}</td>
            <td class="num">${cQte}</td><td>${cStatut}</td></tr>`;
        }).join('');

        return `<button class="lien-accueil" data-vue2="commandes">← COMMANDES</button>
          <div class="ent-tete"><h2>Commande <span class="mono">${ech(o.no)}</span> ${pastille(s[0], s[1])}</h2></div>
          <section class="panneau"><dl class="ent-dl">
            <dt>Client</dt><dd>${ech(c.prenom + ' ' + c.nom)} <span class="mono note">${ech(c.id)}</span></dd>
            <dt>Adresse</dt><dd>${ech(c.adr)}, ${ech(c.cp)} ${ech(c.ville)}</dd>
            <dt>Livraison</dt><dd>${ech(SHIP[o.ship][0])}</dd>
            <dt>Date</dt><dd>${fdt(o.date)}</dd>
            <dt>Montant</dt><dd>${eur(t.total)} TTC, ${t.n} ${ech(unite(t.n))}</dd></dl></section>
          <section class="panneau"><h3>Contrôle du stock</h3>
            <p class="note">Trouvez le stock réel de chaque référence avec la console
              (<span class="mono">.getstock REF</span>) et son emplacement (<span class="mono">.getlocation REF</span>).
              Remplissez pour chaque ligne le stock trouvé, l'emplacement, la quantité à préparer et le statut.</p>
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th><th class="num">Commandé</th>
              <th class="num">Stock trouvé</th><th>Emplacement</th><th class="num">À préparer</th><th>Statut</th>
              </tr></thead><tbody>${lignes}</tbody></table></div>
            <div class="rangee" style="margin-top:14px">
              <button class="btn btn-p" data-bon ${complet ? '' : 'disabled'}>
                ${p.doc ? 'Régénérer le bon de préparation' : 'Éditer le bon de préparation'}</button>
              <span class="note" id="aideBon" ${complet ? 'hidden' : ''}>Complétez toutes les lignes pour continuer.</span>
            </div></section>
          <div id="blocBon">${p.doc ? bonDePreparation(o) : ''}</div>`;
      }

      function majChamp(sku, champ, val) {
        const o = commandeDe(E.no); if (!o) return;
        const r = o.prep.rows[sku]; if (!r) return;
        if (champ === 'seen' || champ === 'qty') { const n = parseInt(val, 10); r[champ] = isNaN(n) ? '' : Math.max(0, n); }
        else r[champ] = val;

        // On ne redessine PAS la vue ici. Le `change` d'un champ arrive au moment où l'élève
        // passe au suivant : remplacer le tableau à cet instant lui volerait la case sur
        // laquelle il vient de cliquer, et la saisie serait perdue. On met donc à jour à la
        // main les seuls éléments concernés.
        if (o.prep.doc) { o.prep.doc = false; const b = hote.querySelector('#blocBon'); if (b) b.innerHTML = ''; }
        const complet = o.lines.every((l) => ligneRemplie(o.prep.rows[l.sku]));
        const btn = hote.querySelector('[data-bon]');
        if (btn) { btn.disabled = !complet; btn.textContent = 'Éditer le bon de préparation'; }
        const aide = hote.querySelector('#aideBon');
        if (aide) aide.hidden = complet;
        sauver();
      }

      function bonDePreparation(o) {
        const p = o.prep, c = clientDe(o.customerId);
        const aPrendre = o.lines.filter((l) => p.rows[l.sku].qty > 0)
          .sort((a, b) => (VM[a.sku].loc < VM[b.sku].loc ? -1 : 1));
        const manquants = o.lines.filter((l) => p.rows[l.sku].qty < l.qty);
        let n = 0; aPrendre.forEach((l) => { n += p.rows[l.sku].qty; });

        const lignes = aPrendre.map((l, i) => {
          const v = VM[l.sku];
          return `<tr><td>${i + 1}</td><td class="mono"><b>${ech(v.loc)}</b></td><td class="mono">${ech(l.sku)}</td>
            <td>${ech(label(v))}</td>${tdVariante(v)}
            <td class="num"><b>${p.rows[l.sku].qty}</b></td><td class="num"><span class="ent-case"></span></td></tr>`;
        }).join('');

        const reliquat = manquants.length ? `<div class="ent-lbl" style="margin-top:14px">Reliquat / articles non préparés</div>
          <table><tbody>${manquants.map((l) => `<tr><td class="mono">${ech(l.sku)}</td><td>${ech(label(VM[l.sku]))}</td>
            <td class="num">Manque ${l.qty - p.rows[l.sku].qty} sur ${l.qty}</td></tr>`).join('')}</tbody></table>` : '';

        const pied = p.validated
          ? '<div class="avis avis-ok">Préparation validée : le stock a été diminué (voir Stock, Mouvements).</div>'
          : `<div class="rangee" style="margin-top:12px">
              <button class="btn btn-p" data-valider ${aPrendre.length ? '' : 'disabled'}>Valider la préparation (sortie de stock)</button>
              <button class="btn" data-copier>Copier le bon en texte</button></div>
             <div id="msgCopie" class="note"></div>`;

        return `<section class="panneau ent-doc" id="bon">
            <div class="rangee"><div><div class="ent-lbl">${ech(ENTREPRISE.nom)} · Entrepôt</div>
              <h3>Bon de préparation BP-${ech(o.no.replace('CMD-', ''))}</h3></div>
              <span class="pousse note" style="text-align:right">Édité le ${fdt(Date.now())}<br>par ${ech(prenom)}</span></div>
            <div class="ent-cols">
              <div><div class="ent-lbl">Commande</div><strong>${ech(o.no)}</strong> du ${fdate(o.date)}</div>
              <div><div class="ent-lbl">Destinataire</div>${ech(c.prenom + ' ' + c.nom)}<br>${ech(c.adr)}<br>${ech(c.cp)} ${ech(c.ville)}</div>
              <div><div class="ent-lbl">Transport</div>${ech(SHIP[o.ship][0])}</div></div>
            ${aPrendre.length ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Emplacement</th><th>Réf.</th>
                <th>Article</th>${thVariante()}<th class="num">Qté</th>
                <th class="num">Prélevé</th></tr></thead><tbody>${lignes}</tbody></table></div>
              <p class="ent-droite"><strong>${aPrendre.length} ligne${aPrendre.length > 1 ? 's' : ''} · ${n} ${ech(unite(n))}</strong></p>`
              : '<p>Aucun article disponible : rien à préparer.</p>'}
            ${reliquat}
            <div class="ent-signatures"><div><div class="ent-lbl">Préparateur</div></div><div><div class="ent-lbl">Contrôle emballage</div></div></div>
          </section>${pied}`;
      }

      function validerPreparation() {
        const o = commandeDe(E.no), p = o.prep, err = [];
        o.lines.forEach((l) => { if (p.rows[l.sku].qty > stockDe(l.sku)) err.push(l.sku); });
        if (err.length) {
          err.forEach((k) => { p.rows[k] = { seen: '', loc: '', qty: '', status: '' }; });
          p.doc = false; sauver(); dessiner();
          return toast(`Le stock a changé pour : ${err.join(', ')}. Remplissez de nouveau ces lignes.`);
        }
        let complet = true;
        o.lines.forEach((l) => {
          const r = p.rows[l.sku];
          // La sortie consomme les lots dans l'ordre d'entrée : c'est ce qui permettra de
          // dire, plus tard, quel lot est parti dans quel colis client.
          if (r.qty > 0) sortirFifo(l.sku, r.qty, 'Sortie : préparation', 'BP-' + o.no.replace('CMD-', ''));
          if (r.qty < l.qty) complet = false;
        });
        p.validated = true; p.complete = complet; p.at = Date.now();
        sauver(); dessiner();
        toast(complet ? 'Préparation validée, commande complète.' : 'Préparation validée, avec reliquat.');
      }

      function copierBon() {
        const o = commandeDe(E.no), p = o.prep, c = clientDe(o.customerId);
        let t = `BON DE PRÉPARATION BP-${o.no.replace('CMD-', '')}\nCommande ${o.no} | Client : ${c.prenom} ${c.nom} | ${SHIP[o.ship][0]}\n\n`;
        o.lines.filter((l) => p.rows[l.sku].qty > 0)
          .sort((a, b) => (VM[a.sku].loc < VM[b.sku].loc ? -1 : 1))
          .forEach((l) => { t += `${VM[l.sku].loc}\t${l.sku}\t${label(VM[l.sku])}${SIMPLE ? '' : `\t${VOCAB.sizeShort}${VM[l.sku].size}`}\tQté ${p.rows[l.sku].qty}\n`; });
        const m = hote.querySelector('#msgCopie');
        const ok = () => { if (m) m.textContent = 'Bon copié dans le presse-papiers.'; };
        const ko = () => { if (m) m.textContent = 'Copie impossible ici : sélectionnez le bon à la souris.'; };
        try { navigator.clipboard.writeText(t).then(ok, ko); } catch (e) { ko(); }
      }

      /* ========================================================== réceptions */
      // Une réception, c'est deux documents qui ne disent pas forcément la même chose :
      // le bon de livraison, annoncé par le fournisseur (il arrive par mail), et les colis
      // réellement posés sur le quai. L'élève compte, compare, décide, et saisit. Le module
      // ne remplit rien à sa place et ne corrige rien : il enregistre ce qu'on lui dit, et
      // l'élève va en constater le résultat dans son stock.

      const receptionDe = (no) => (db.receptions || []).find((r) => r.no === no);

      // Le bon de livraison, tel que le fournisseur l'a rempli. C'est un document : il annonce,
      // il n'établit rien. Les quantités réellement reçues sont sur le quai, pas ici.
      function bonDeLivraison(r) {
        const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '', adr: '', cp: '', ville: '' };
        const lignes = (r.bl.lines || []).map((l) => { const v = VM[l.sku];
          return `<tr><td class="mono">${ech(l.sku)}</td><td>${v ? ech(label(v)) : '—'}</td>
            ${tdVariante(v)}
            <td class="num"><b>${l.qty}</b></td></tr>`; }).join('');
        const n = (r.bl.lines || []).reduce((s, l) => s + l.qty, 0);
        return `<section class="panneau ent-doc">
            <div class="rangee"><div><div class="ent-lbl">${ech(sup.name)}</div>
              <h3>Bon de livraison ${ech(r.bl.no)}</h3></div>
              <span class="pousse note" style="text-align:right">${ech(sup.adr)}<br>${ech(sup.cp)} ${ech(sup.ville)}</span></div>
            <div class="ent-cols">
              <div><div class="ent-lbl">Destinataire</div><strong>${ech(ENTREPRISE.nom)}</strong><br>Entrepôt — quai de réception</div>
              <div><div class="ent-lbl">Date d'expédition</div>${fdate(r.bl.date)}</div>
              <div><div class="ent-lbl">Numéro de lot</div><strong class="mono">${ech(r.bl.lot)}</strong></div>
              <div><div class="ent-lbl">Transporteur</div>${ech(r.transporteur || '—')}</div></div>
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th>${thVariante()}
              <th class="num">Qté annoncée</th></tr></thead>
              <tbody>${lignes}</tbody></table></div>
            <p class="ent-droite"><strong>${(r.bl.lines || []).length} ligne${(r.bl.lines || []).length > 1 ? 's' : ''} · ${n} ${ech(unite(n))} annoncée${n > 1 ? 's' : ''}</strong></p>
            <div class="ent-signatures"><div><div class="ent-lbl">Expéditeur</div></div><div><div class="ent-lbl">Réception (nom, date, réserves)</div></div></div>
          </section>`;
      }

      // Les références concernées : celles du bon de livraison ET celles trouvées dans les
      // colis. Un carton contenant une référence non annoncée doit apparaître au contrôle.
      function refsReception(r) {
        const out = [];
        (r.bl.lines || []).forEach((l) => { if (!out.includes(l.sku)) out.push(l.sku); });
        (r.colis || []).forEach((c) => { if (!out.includes(c.sku)) out.push(c.sku); });
        return out;
      }
      const annonceDe = (r, sku) => (r.bl.lines || []).filter((l) => l.sku === sku).reduce((n, l) => n + l.qty, 0);
      const compteReel = (r, sku) => (r.colis || []).filter((c) => c.sku === sku).reduce((n, c) => n + c.qty, 0);
      const colisAbime = (r, sku) => (r.colis || []).some((c) => c.sku === sku && c.etat === 'abime');

      function preparerReception(r) {
        if (r.ctrl) return;
        r.ctrl = { lot: '', rows: {}, validated: false, at: null };
        refsReception(r).forEach((sku) => { r.ctrl.rows[sku] = { annonce: '', compte: '', etat: '', decision: '' }; });
      }
      const ligneRecRemplie = (x) => x.annonce !== '' && x.annonce != null && x.compte !== '' && x.compte != null
        && !!x.etat && !!x.decision;

      function statutReception(r) {
        if (!r.ctrl) return ['À contrôler', 'warn'];
        if (r.ctrl.validated) return ['Réceptionnée', 'ok'];
        const debut = r.ctrl.lot || Object.keys(r.ctrl.rows).some((k) => ligneRecRemplie(r.ctrl.rows[k])
          || r.ctrl.rows[k].annonce !== '' || r.ctrl.rows[k].compte !== '' || r.ctrl.rows[k].etat || r.ctrl.rows[k].decision);
        return debut ? ['En cours', 'info'] : ['À contrôler', 'warn'];
      }

      function vueReceptions() {
        const liste = (db.receptions || []).slice().sort((a, b) => b.ts - a.ts);
        const lignes = liste.map((r) => {
          const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '' };
          const s = statutReception(r);
          return `<tr><td class="mono">${ech(r.no)}</td><td>${fdate(r.ts)}</td><td>${ech(sup.brand)}</td>
            <td class="mono">${ech(r.bl.no)}</td><td class="num">${(r.colis || []).length}</td>
            <td>${pastille(s[0], s[1])}</td>
            <td class="num"><button class="btn btn-s" data-ouvrir-rec="${ech(r.no)}">Ouvrir</button></td></tr>`;
        }).join('');
        return `<div class="ent-tete"><h2>Réceptions</h2>
            <p class="note">Les livraisons annoncées par les fournisseurs et les colis reçus sur le quai.</p></div>
          <section class="panneau">${lignes
            ? `<div class="ent-scroll"><table><thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th>
                <th>Bon de livraison</th><th class="num">Colis</th><th>Statut</th><th></th></tr></thead>
                <tbody>${lignes}</tbody></table></div>`
            : '<div class="vide">Aucune livraison attendue.</div>'}</section>`;
      }

      function vueReception() {
        const r = receptionDe(E.no);
        if (!r) return vueReceptions();
        preparerReception(r);
        const sup = SUP_BY_ID[r.supId] || (db.suppliers || []).find((s) => s.id === r.supId) || { brand: r.supId, name: '', contact: '' };
        const s = statutReception(r), c = r.ctrl, fige = c.validated;
        const refs = refsReception(r);
        const complet = !!(c.lot || '').trim() && refs.every((sku) => ligneRecRemplie(c.rows[sku]));

        const choixEtat = [['', 'Choisir…'], ['ok', 'Conforme'], ['abime', 'Colis endommagé']];
        const choixDecision = [['', 'Choisir…'], ['accepte', 'Accepté'], ['reserve', 'Accepté sous réserve'], ['refuse', 'Refusé']];

        const colis = (r.colis || []).map((k) => {
          const v = VM[k.sku];
          return `<tr><td class="num">${k.no}</td><td class="mono">${ech(k.sku)}</td>
            <td>${v ? ech(label(v)) : '<span class="faux">Référence inconnue</span>'}
              ${precision(v)}</td>
            <td class="num"><b>${k.qty}</b></td>
            <td>${k.etat === 'abime' ? pastille('Carton endommagé', 'crit') : pastille('Intact', 'ok')}</td></tr>`;
        }).join('');

        const lignes = refs.map((sku) => {
          const v = VM[sku], x = c.rows[sku];
          const champ = (nom, aide) => (fige ? `<b class="mono">${x[nom] === '' ? '—' : x[nom]}</b>`
            : `<input type="number" min="0" data-rec="${nom}" data-sku="${ech(sku)}" value="${x[nom] === '' ? '' : x[nom]}" style="width:78px" aria-label="${ech(aide)}">`);
          const select = (nom, choix, aide) => (fige
            ? `<span class="note">${ech((choix.find((o) => o[0] === x[nom]) || ['', '—'])[1])}</span>`
            : `<select data-rec="${nom}" data-sku="${ech(sku)}" aria-label="${ech(aide)}">
                ${choix.map((o) => `<option value="${o[0]}" ${(x[nom] || '') === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`);
          return `<tr><td class="mono">${ech(sku)}</td>
            <td>${v ? ech(label(v)) : '—'}${precision(v)}</td>
            <td class="num">${champ('annonce', 'Quantité annoncée pour ' + sku)}</td>
            <td class="num">${champ('compte', 'Quantité comptée pour ' + sku)}</td>
            <td>${select('etat', choixEtat, 'État des colis pour ' + sku)}</td>
            <td>${select('decision', choixDecision, 'Décision pour ' + sku)}</td></tr>`;
        }).join('');

        const cLot = fige ? `<b class="mono">${ech(c.lot || '—')}</b>`
          : `<input type="text" id="recLot" class="mono" value="${ech(c.lot)}" placeholder="ex. LOT-XX-0000" style="width:190px" aria-label="Numéro de lot">`;

        return `<button class="lien-accueil" data-vue2="receptions">← RÉCEPTIONS</button>
          <div class="ent-tete"><h2>Réception <span class="mono">${ech(r.no)}</span> ${pastille(s[0], s[1])}</h2></div>
          <section class="panneau"><dl class="ent-dl">
            <dt>Fournisseur</dt><dd>${ech(sup.brand)} — ${ech(sup.name)} <span class="mono note">${ech(r.supId)}</span></dd>
            <dt>Transporteur</dt><dd>${ech(r.transporteur || '—')}</dd>
            <dt>Bon de livraison</dt><dd class="mono">${ech(r.bl.no)}</dd>
            <dt>Arrivée sur le quai</dt><dd>${fdt(r.ts)}</dd></dl>
            <div class="avis">Le bon de livraison est dans votre messagerie : c'est lui qui donne les
              quantités annoncées et le numéro de lot. Les colis ci-dessous sont ce que le
              transporteur a réellement déposé.</div></section>
          <section class="panneau"><h3>Colis reçus sur le quai</h3>
            <p class="note">${(r.colis || []).length} colis. Additionnez-les par référence pour obtenir la quantité réellement reçue.</p>
            <div class="ent-scroll"><table><thead><tr><th class="num">Colis</th><th>Réf.</th><th>Article</th>
              <th class="num">Contenu</th><th>État du carton</th></tr></thead><tbody>${colis}</tbody></table></div></section>
          <section class="panneau"><h3>Bon de réception</h3>
            <p class="note">Reportez le numéro de lot du bon de livraison, puis, pour chaque référence,
              la quantité annoncée, la quantité que vous avez comptée, l'état des colis et votre décision.
              Une ligne refusée n'entre pas en stock.</p>
            <div class="champ" style="max-width:260px"><label for="recLot">Numéro de lot</label>${cLot}</div>
            <div class="ent-scroll"><table><thead><tr><th>Réf.</th><th>Article</th><th class="num">Annoncé</th>
              <th class="num">Compté</th><th>État</th><th>Décision</th></tr></thead><tbody>${lignes}</tbody></table></div>
            ${fige ? `<div class="avis avis-ok">Réception validée le ${fdt(c.at)} : le stock a été augmenté
                  des quantités acceptées (voir Stock, Mouvements, ou <span class="mono">.getlot ${ech(c.lot)}</span>).</div>`
              : `<div class="rangee" style="margin-top:14px">
                  <button class="btn btn-p" data-valider-rec ${complet ? '' : 'disabled'}>Valider la réception (entrée en stock)</button>
                  <span class="note" id="aideRec" ${complet ? 'hidden' : ''}>Renseignez le numéro de lot et toutes les lignes pour continuer.</span>
                </div>`}
          </section>`;
      }

      function majChampRec(sku, champ, val) {
        const r = receptionDe(E.no); if (!r || !r.ctrl) return;
        const x = r.ctrl.rows[sku]; if (!x) return;
        if (champ === 'annonce' || champ === 'compte') { const n = parseInt(val, 10); x[champ] = isNaN(n) ? '' : Math.max(0, n); }
        else x[champ] = val;
        majBoutonRec();
        sauver();
      }

      // Même prudence que pour le bon de préparation : on ne redessine pas la vue pendant que
      // l'élève saisit, sinon la case qu'il vient de quitter disparaît sous ses doigts.
      function majBoutonRec() {
        const r = receptionDe(E.no); if (!r || !r.ctrl) return;
        const lot = hote.querySelector('#recLot');
        if (lot) r.ctrl.lot = lot.value;
        const complet = !!(r.ctrl.lot || '').trim()
          && refsReception(r).every((sku) => ligneRecRemplie(r.ctrl.rows[sku]));
        const b = hote.querySelector('[data-valider-rec]');
        if (b) b.disabled = !complet;
        const aide = hote.querySelector('#aideRec');
        if (aide) aide.hidden = complet;
      }

      function validerReception() {
        const r = receptionDe(E.no); if (!r || !r.ctrl || r.ctrl.validated) return;
        majBoutonRec();
        const c = r.ctrl, lot = (c.lot || '').trim().toUpperCase();
        if (!lot) return toast('Le numéro de lot est obligatoire : il est sur le bon de livraison.');
        let entrees = 0;
        refsReception(r).forEach((sku) => {
          const x = c.rows[sku];
          if (!VM[sku]) return;
          const q = x.decision === 'refuse' ? 0 : (parseInt(x.compte, 10) || 0);
          if (q <= 0) return;
          db.stock[sku] = stockDe(sku) + q;
          mouvement(sku, 'Entrée : réception', q, r.no, lot);
          entrees += q;
        });
        c.lot = lot; c.validated = true; c.at = Date.now();
        sauver(); dessiner();
        toast(entrees
          ? `Réception validée : ${entrees} ${unite(entrees)} entrée${entrees > 1 ? 's' : ''} en stock.`
          : 'Réception validée : aucune entrée en stock.');
      }

      /* ------------------------------------------------------------- lots */
      // Ce qui reste de chaque lot pour une référence. Le stock de départ n'a pas de lot :
      // il est compté à part, et sort le premier — premier entré, premier sorti.
      function restesParLot(sku) {
        const parLot = new Map();
        db.moves.forEach((m) => {
          if (m.sku !== sku || !m.lot) return;
          parLot.set(m.lot, (parLot.get(m.lot) || 0) + m.delta);
        });
        let identifie = 0;
        parLot.forEach((q) => { identifie += Math.max(0, q); });
        const out = [{ lot: '', reste: Math.max(0, stockDe(sku) - identifie) }];
        parLot.forEach((q, lot) => { if (q > 0) out.push({ lot, reste: q }); });
        return out;
      }

      // Une sortie consomme les lots dans l'ordre : elle peut donc donner plusieurs
      // mouvements, un par lot entamé. C'est ce découpage qui permet, plus tard, de dire
      // quel client a reçu quel lot.
      function sortirFifo(sku, qty, type, ref) {
        let reste = qty;
        restesParLot(sku).forEach((x) => {
          if (reste <= 0) return;
          const pris = Math.min(reste, x.reste);
          if (pris <= 0) return;
          db.stock[sku] = stockDe(sku) - pris;
          mouvement(sku, type, -pris, ref, x.lot);
          reste -= pris;
        });
        if (reste > 0) { db.stock[sku] = stockDe(sku) - reste; mouvement(sku, type, -reste, ref, ''); }
      }

      /* ----------------------------------------------------- blocage qualité */
      // Ce qui reste d'un lot pour une référence : la somme des mouvements qui le portent.
      // Jamais une valeur écrite d'avance — si l'élève a réceptionné 10 paires au lieu de 12,
      // c'est 10 qui comptent.
      function resteDuLot(sku, lot) {
        let n = 0;
        db.moves.forEach((m) => { if (m.sku === sku && String(m.lot || '').toUpperCase() === lot) n += m.delta; });
        return Math.max(0, n);
      }

      // Un blocage qualité retire du stock les paires d'un lot précis, sans toucher au reste
      // du stock de la même référence. C'est ce que `.removestock` ne sait pas faire : il sort
      // au premier entré, premier sorti, donc sur l'ancien stock, pas sur le lot en cause.
      //
      // L'écran ne montre ni les références concernées ni ce qu'il en reste : c'est le travail
      // de l'élève de les trouver avec .getlot. Il contrôle, il ne répond pas.
      function vueBlocage() {
        const b = E.blocage;
        const faits = db.moves.filter((m) => m.type === 'Blocage qualité').slice().reverse();
        return `<div class="ent-tete"><h2>Blocage qualité</h2>
            <p class="note">Retirer du stock les articles d'un lot mis en cause, référence par référence.</p></div>
          <section class="panneau" style="max-width:620px">
            <div class="avis">Un blocage ne concerne qu'un lot : les paires de la même référence
              entrées par une autre livraison restent vendables. Renseignez le lot, la référence
              complète et la quantité que vous voulez sortir. Le motif est enregistré avec le
              mouvement : c'est lui qui expliquera plus tard pourquoi ces paires ont disparu.</div>
            ${E.erreurBlocage ? `<div class="avis avis-err">${ech(E.erreurBlocage)}</div>` : ''}
            ${E.okBlocage ? `<div class="avis avis-ok">${ech(E.okBlocage)}</div>` : ''}
            <form id="formBloc" autocomplete="off">
              <div class="ent-filtres">
                <div class="champ"><label for="blLot">Numéro de lot</label>
                  <input id="blLot" class="mono" value="${ech(b.lot)}" placeholder="ex. LOT-XX-0000"
                    autocapitalize="characters" spellcheck="false"></div>
                <div class="champ"><label for="blRef">Référence article</label>
                  <input id="blRef" class="mono" value="${ech(b.ref)}" placeholder="ex. NK-AM270-NR-42"
                    autocapitalize="characters" spellcheck="false"></div>
                <div class="champ"><label for="blQte">Quantité à bloquer</label>
                  <input id="blQte" type="number" min="1" step="1" value="${ech(b.qte)}" style="width:120px"></div>
              </div>
              <div class="champ"><label for="blMotif">Motif</label>
                <input id="blMotif" value="${ech(b.motif)}" placeholder="ex. blocage qualité, défaut fabricant"></div>
              <div class="rangee" style="margin-top:14px">
                <button class="btn btn-p" type="submit">Bloquer ces ${ech(VOCAB.unitPl)}</button></div>
            </form>
          </section>
          <section class="panneau"><h3>Blocages enregistrés</h3>
            ${faits.length
              ? `<div class="ent-scroll"><table><thead><tr><th>Date</th><th>Réf.</th><th>Article</th>
                  <th class="num">Qté</th><th>Lot</th><th>Motif</th></tr></thead><tbody>
                  ${faits.map((m) => { const v = VM[m.sku]; return `<tr><td>${fdt(m.ts)}</td>
                    <td class="mono">${ech(m.sku)}</td><td>${v ? ech(label(v)) : '—'}</td>
                    <td class="num faux"><b class="mono">${m.delta}</b></td>
                    <td class="mono">${ech(m.lot || '—')}</td><td>${ech(m.ref)}</td></tr>`; }).join('')}
                  </tbody></table></div>`
              : '<div class="vide">Aucun blocage enregistré.</div>'}</section>`;
      }

      function bloquerQualite() {
        const val = (id) => (hote.querySelector(id)?.value || '');
        const lot = val('#blLot').trim().toUpperCase();
        const ref = val('#blRef').trim().toUpperCase();
        const brut = val('#blQte').trim();
        const motif = val('#blMotif').trim();
        E.blocage = { lot, ref, qte: brut, motif };
        E.okBlocage = '';
        const refuser = (msg) => { E.erreurBlocage = msg; dessinerVue(); };

        if (!lot) return refuser('Renseignez le numéro de lot. Il est sur le bon de livraison.');
        if (!ref) return refuser('Renseignez la référence de l\'article à bloquer.');
        const v = VM[ref];
        if (!v) return refuser(`Référence article introuvable : ${ref}.${SIMPLE ? '' : ` Il faut la référence complète (modèle, couleur, ${VOCAB.configWord}).`}`);
        const q = parseInt(brut, 10);
        if (isNaN(q) || q <= 0 || String(q) !== brut) return refuser('La quantité doit être un nombre entier supérieur à zéro.');
        if (!motif) return refuser('Le motif est obligatoire : il reste dans l\'historique du mouvement.');
        // Le message ne dit jamais combien il reste : le contrôle est réel, mais l'élève va
        // chercher la réponse dans .getlot, il ne la lit pas ici.
        const reste = resteDuLot(ref, lot);
        if (!reste) return refuser(`Le lot ${lot} n'a aucune ${VOCAB.unit} de ${ref} en stock. Vérifiez le lot et la référence avec .getlot.`);
        if (q > reste) return refuser(`Le lot ${lot} ne contient pas autant de ${VOCAB.unitPl} de ${ref} en stock. Vérifiez ce qu'il en reste avec .getlot.`);

        db.stock[ref] = stockDe(ref) - q;
        mouvement(ref, 'Blocage qualité', -q, motif, lot);
        E.erreurBlocage = '';
        E.okBlocage = `${q} ${unite(q)} de ${ref} bloquée${q > 1 ? 's' : ''} sur le lot ${lot}.`;
        E.blocage = { lot, ref: '', qte: '', motif };
        sauver(); dessinerVue();
        toast('Blocage enregistré.');
      }

      /* ---------------------------------------------------------- catalogue */
      /* ------------------------------------------------- transport : plan et tournée */
      // Les deux vues sont génériques et vivent dans leurs propres fichiers. Ici, on ne
      // fait que leur prêter la base de l'élève, la sauvegarde et le redessin.
      // **Un état par SÉANCE, pas par entreprise.** Les séances d'une même entreprise
      // partagent une seule base (`meta.jeuId`) : deux d'entre elles qui déclareraient
      // chacune sa tournée se seraient écrasées l'une l'autre, et un repérage validé la
      // semaine dernière aurait ouvert d'office le temps 2 d'une autre séance. La clé est
      // donc l'identifiant de l'activité, unique par construction ; `transportId` permet au
      // contenu de la forcer, par exemple pour que deux séances partagent à dessein le même
      // repérage. Les jalons lisent `db.transport[<id de la séance>].plan` / `.tournee`.
      const cleTransport = String(U.transportId || (ctx.meta && ctx.meta.id) || 'transport');
      const etatTransport = (vue) => {
        if (!db.transport) db.transport = {};
        if (!db.transport[cleTransport]) db.transport[cleTransport] = {};
        if (!db.transport[cleTransport][vue]) db.transport[cleTransport][vue] = {};
        return db.transport[cleTransport][vue];
      };
      const apiTransport = (cle) => ({ etat: etatTransport(cle), sauver, redessiner: dessiner, toast, db });

      function vuePlan() { return VPLAN.html(etatTransport('plan')); }

      /* ---------------------------------------------------------- inventaire */
      // L'état de l'inventaire vit dans la base de l'élève, sous le numéro de campagne. Il est
      // créé à la première ouverture de l'écran, avec la PHOTO du stock système de ce moment-là.
      const lireInventaire = () => (VINV && db.inventaires ? db.inventaires[VINV.id] : null);
      function etatInventaire() {
        if (!db.inventaires) db.inventaires = {};
        if (!db.inventaires[VINV.id]) { db.inventaires[VINV.id] = VINV.etatNeuf(stockDe); ctx.jeu.sauver(); }
        return db.inventaires[VINV.id];
      }
      // L'enseignant voit toujours le stock : il prépare et corrige.
      const inventaireBloque = () => !!VINV && !estProf && VINV.bloqueStock(lireInventaire());
      // Ce que l'écran demande à l'environnement. Un ajustement passe par les mêmes chemins
      // qu'à la console : une baisse entame les lots dans l'ordre d'entrée (la traçabilité reste
      // juste), une hausse entre sans lot.
      const apiInventaire = () => ({
        sauver, toast,
        redessiner: dessinerVue,
        mouvements: () => db.moves,
        ajuster(sku, delta, origine) {
          if (delta < 0) sortirFifo(sku, -delta, 'Ajustement inventaire', origine);
          else if (delta > 0) { db.stock[sku] = stockDe(sku) + delta; mouvement(sku, 'Ajustement inventaire', delta, origine); }
        },
      });
      function vueInventaire() { return VINV.html(etatInventaire(), apiInventaire()); }

      // La tournée reste fermée tant que le repérage n'est pas validé : sans lui, l'élève
      // ne sait pas où sont les points et ordonnerait au hasard. C'est le « deux temps »
      // décidé le 02/10/2026, tenu par l'état et non par un réglage d'affichage.
      function vueTournee() {
        const verrou = VPLAN && !VPLAN.ouvreSuite(etatTransport('plan'))
          ? `Commencez par « ${VPLAN.nav.libelle} » : situez chaque point sur le plan, puis validez le repérage.`
          : null;
        // Séance « à corriger » : la tournée du collègue est posée à la première ouverture, une
        // seule fois (voir `amorcer` dans tournee.js). Sans `etatInitial`, rien ne se passe.
        if (!verrou && VTOUR.amorcer && VTOUR.amorcer(etatTransport('tournee'))) sauver();
        return VTOUR.html(etatTransport('tournee'), { verrou, db });
      }

      function vueCatalogue() {
        const marques = [], cats = [];
        MODELS.forEach((m) => { if (m.brand && !marques.includes(m.brand)) marques.push(m.brand); if (!cats.includes(m.cat)) cats.push(m.cat); });
        // Un catalogue simple sans marques n'a pas de filtre Marque : un menu vide intriguerait.
        // Le champ reste dans la page, caché, pour que le filtrage n'ait pas deux chemins.
        return `<div class="ent-tete"><h2>Catalogue</h2>
            <p class="note">${SIMPLE ? `${MODELS.length} article${MODELS.length > 1 ? 's' : ''}.`
              : `${MODELS.length} modèles, ${VARIANTS.length} références couleur et ${ech(VOCAB.configWord)}.`}</p></div>
          <div class="ent-filtres">
            <div class="champ"><label for="cQ">Recherche</label><input id="cQ" data-filtre placeholder="${SIMPLE ? 'Désignation ou référence' : 'Nom, marque ou référence'}"></div>
            <div class="champ" ${marques.length ? '' : 'hidden'}><label for="cB">Marque</label><select id="cB" data-filtre><option value="">Toutes</option>
              ${marques.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div>
            <div class="champ"><label for="cC">Catégorie</label><select id="cC" data-filtre><option value="">Toutes</option>
              ${cats.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div></div>
          <div id="entListe"></div>`;
      }

      function majCatalogue() {
        const q = norm(hote.querySelector('#cQ').value), b = hote.querySelector('#cB').value, c = hote.querySelector('#cC').value;
        const res = MODELS.filter((m) => (!b || m.brand === b) && (!c || m.cat === c)
          && (!q || norm(m.brand + ' ' + m.name + ' ' + m.ref + ' ' + m.cat).includes(q)));
        hote.querySelector('#entListe').innerHTML = res.length
          ? `<div class="module-grid">${res.map((m) => `<button class="module-tile" data-produit="${ech(m.ref)}">
              <span class="code">${m.brand ? `${ech(m.brand)} · ` : ''}${ech(m.cat)}</span>
              <span class="titre">${ech(m.name)}</span>
              <span class="desc mono">${ech(m.ref)}</span>
              <span class="desc"><strong>${eur(m.price)}</strong> ${m.colors.filter((k) => COLORS[k]).map((k) => `<span class="teinte" style="background:${COLORS[k][1]}" title="${ech(COLORS[k][0])}"></span>`).join('')}</span>
            </button>`).join('')}</div>`
          : '<div class="vide">Aucun modèle ne correspond.</div>';
        hote.querySelectorAll('[data-produit]').forEach((b2) => b2.addEventListener('click', () => aller('produit', { ref: b2.dataset.produit })));
      }

      function vueProduit() {
        const m = MM[E.ref];
        if (!m) return vueCatalogue();
        const sp = SUP_BY_ID[m.sup], ht = m.price / 1.2;
        return `<button class="lien-accueil" data-vue2="catalogue">← CATALOGUE</button>
          <div class="ent-tete"><h2>${ech([m.brand, m.name].filter(Boolean).join(' '))}</h2><p class="note">${ech(m.desc)}</p></div>
          <section class="panneau"><dl class="ent-dl">
            <dt>${SIMPLE ? 'Référence article' : 'Référence modèle'}</dt><dd class="mono">${ech(m.ref)}</dd>
            ${m.brand ? `<dt>Marque</dt><dd>${ech(m.brand)}</dd>` : ''}
            <dt>Catégorie</dt><dd>${ech(m.cat)}</dd>
            <dt>Prix de vente TTC</dt><dd class="mono"><b>${eur(m.price)}</b></dd>
            <dt>Prix de vente HT</dt><dd class="mono">${eur(ht)}</dd>
            <dt>Prix d'achat HT</dt><dd class="mono">${eur(m.cost)}</dd>
            <dt>Marge brute</dt><dd class="mono">${eur(ht - m.cost)} (${Math.round((ht - m.cost) / ht * 100)} %)</dd>
            ${SIMPLE ? '' : `<dt>${ech(VOCAB.sizeLabel)}s</dt><dd>${m.s0} à ${m.s1}</dd>`}
            <dt>Seuil d'alerte</dt><dd>${m.min} ${ech(VOCAB.unitPl)}${SIMPLE ? '' : ' par référence'}</dd>
            <dt>Stock maximum</dt><dd>${m.max} ${ech(VOCAB.unitPl)}${SIMPLE ? '' : ' par référence'}</dd>
            ${SIMPLE ? `<dt>Emplacement</dt><dd class="mono">${ech(m.emplacement)}</dd>`
              : `<dt>Emplacements</dt><dd>${m.colors.map((c) => `${ech(nomCouleur(c))} <span class="mono">${ech(m.loc[c])}</span>`).join(' · ')}</dd>`}
            ${sp ? `<dt>Fournisseur</dt><dd>${ech(sp.name)} <span class="mono note">${ech(sp.id)}</span><br>
              <span class="note">Délai ${sp.delai} jours · franco ${eur(sp.franco)}</span></dd>` : ''}</dl></section>
          <div class="avis">Le catalogue ne donne pas les quantités en stock : elles changent à
            chaque commande. Pour connaître le stock réel d'une référence, utilisez la console —
            <span class="mono">.getstock ${ech(m.ref)}</span>.</div>`;
      }

      /* -------------------------------------------------------------- stock */
      function vueStock() {
        if (inventaireBloque()) {
          return `<div class="ent-tete"><h2>Stock</h2><p class="note">Inventaire en cours.</p></div>
            <section class="panneau" style="max-width:520px" data-stock-bloque>
              <p><b>Comptage à l'aveugle :</b> le stock du système est masqué jusqu'à la validation du
                comptage (écran « ${ech(VINV.nav.libelle)} »). On compte ce qu'on voit, sans être influencé
                par le chiffre de l'ordinateur.</p></section>`;
        }
        if (!E.stockOuvert) {
          return `<div class="ent-tete"><h2>Stock</h2><p class="note">Accès verrouillé.</p></div>
            <section class="panneau" style="max-width:480px">
              <p>Pour connaître le stock d'une référence précise, utilisez la console
                (<span class="mono">.getstock REF</span>). La vue d'ensemble est verrouillée :
                demandez le code à votre enseignant.</p>
              ${E.erreurCode ? `<div class="avis avis-err">${ech(E.erreurCode)}</div>` : ''}
              <div class="champ"><label for="codeStock">Code d'accès</label>
                <input id="codeStock" class="mono" autocapitalize="characters" spellcheck="false"></div>
              <button class="btn btn-p" data-deverrouiller>Déverrouiller</button></section>`;
        }
        const onglet = E.onglet.stock || 'niveaux';
        let total = 0, valeur = 0, rupture = 0, bas = 0;
        VARIANTS.forEach((v) => {
          const q = stockDe(v.sku); total += q; valeur += q * v.model.cost;
          if (q <= 0) rupture++; else if (q <= v.model.min) bas++;
        });
        const marques = []; MODELS.forEach((m) => { if (m.brand && !marques.includes(m.brand)) marques.push(m.brand); });

        let corps;
        if (onglet === 'niveaux') {
          corps = `<div class="ent-filtres">
            <div class="champ"><label for="sQ">Recherche</label><input id="sQ" data-filtre placeholder="Référence, nom ou emplacement"></div>
            <div class="champ" ${marques.length ? '' : 'hidden'}><label for="sB">Marque</label><select id="sB" data-filtre><option value="">Toutes</option>
              ${marques.map((b) => `<option>${ech(b)}</option>`).join('')}</select></div>
            <div class="champ"><label for="sS">Statut</label><select id="sS" data-filtre><option value="">Tous</option>
              <option value="crit">Rupture</option><option value="warn">Faible</option><option value="ok">OK</option></select></div>
            </div><div id="entListe"></div>`;
        } else {
          const mv = db.moves.slice().reverse().slice(0, 150).map((m) => `<tr><td>${fdt(m.ts)}</td>
            <td class="mono">${ech(m.sku)}</td><td>${ech(m.type)}</td>
            <td class="num ${m.delta < 0 ? 'faux' : 'juste'}"><b class="mono">${m.delta > 0 ? '+' : ''}${m.delta}</b></td>
            <td class="num">${m.after}</td><td class="mono">${m.lot ? ech(m.lot) : '<span class="note">—</span>'}</td>
            <td class="mono">${ech(m.ref)}</td><td>${ech(m.by)}</td></tr>`).join('');
          corps = `<section class="panneau">${mv
            ? `<div class="ent-scroll"><table><thead><tr><th>Date</th><th>Réf.</th><th>Type</th><th class="num">Qté</th>
                <th class="num">Stock après</th><th>Lot</th><th>Origine</th><th>Par</th></tr></thead><tbody>${mv}</tbody></table></div>`
            : '<div class="vide">Aucun mouvement pour le moment.</div>'}</section>`;
        }

        return `<div class="ent-tete"><h2>Stock</h2><p class="note">Niveaux par référence et historique des mouvements.</p></div>
          <div class="ent-kpis">
            <div class="ent-kpi fixe"><b>${total}</b><span>${ech(unite(total))} en stock</span></div>
            <div class="ent-kpi fixe"><b>${eur(valeur)}</b><span>valeur au prix d'achat HT</span></div>
            <div class="ent-kpi fixe"><b>${bas}</b><span>références sous le seuil</span></div>
            <div class="ent-kpi fixe"><b>${rupture}</b><span>références en rupture</span></div></div>
          <div class="rangee" style="margin-bottom:12px">
            <button class="btn btn-s ${onglet === 'niveaux' ? 'btn-p' : ''}" data-onglet="stock" data-val="niveaux">Niveaux de stock</button>
            <button class="btn btn-s ${onglet === 'mouvements' ? 'btn-p' : ''}" data-onglet="stock" data-val="mouvements">Mouvements</button>
          </div>${corps}`;
      }

      function majStock() {
        const el = hote.querySelector('#sQ'); if (!el) return;
        const q = norm(el.value), b = hote.querySelector('#sB').value, st = hote.querySelector('#sS').value;
        let n = 0, lignes = '';
        for (const v of VARIANTS) {
          const qty = stockDe(v.sku), s = etatStock(qty, v.model.min);
          if (b && v.model.brand !== b) continue;
          if (st && s[1] !== st) continue;
          if (q && !norm(v.sku + ' ' + label(v) + ' ' + v.loc).includes(q)) continue;
          n++;
          if (n <= 150) lignes += `<tr><td class="mono">${ech(v.sku)}</td><td>${ech(label(v))}</td>
            ${tdVariante(v, true)}<td class="num"><b class="mono">${qty}</b></td>
            <td class="num note">${v.model.min}</td><td class="mono">${ech(v.loc)}</td><td>${pastille(s[0], s[1])}</td></tr>`;
        }
        hote.querySelector('#entListe').innerHTML = `<section class="panneau"><div class="ent-scroll"><table>
          <thead><tr><th>Référence</th><th>Article</th>${thVariante()}
          <th class="num">Stock</th><th class="num">Seuil</th><th>Emplacement</th><th>Statut</th></tr></thead>
          <tbody>${lignes || '<tr><td colspan="${SIMPLE ? 6 : 8}" class="note">Aucun résultat.</td></tr>'}</tbody></table></div>
          <p class="note">${n > 150 ? `${n} résultats, les 150 premiers sont affichés.` : `${n} résultat${n > 1 ? 's' : ''}.`}</p></section>`;
      }

      /* -------------------------------------------------------------- tiers */
      function vueClients() {
        return `<div class="ent-tete"><h2>Clients</h2>
            <p class="note">${tousClients().length} clients référencés.</p></div>
          <div class="ent-filtres"><div class="champ"><label for="tQ">Recherche</label>
            <input id="tQ" data-filtre placeholder="Nom, ville, code…"></div></div>
          <div id="entListe"></div>`;
      }

      function vueFournisseurs() {
        return `<div class="ent-tete"><h2>Fournisseurs</h2>
            <p class="note">${tousFournisseurs().length} fournisseurs référencés.</p></div>
          <div class="ent-filtres"><div class="champ"><label for="tQ">Recherche</label>
            <input id="tQ" data-filtre placeholder="Marque, société, ville, code…"></div></div>
          <div id="entListe"></div>`;
      }

      function majTiers() {
        const champ = hote.querySelector('#tQ');
        if (!champ) return;
        const q = norm(champ.value);
        let h;
        if (E.vue === 'clients') {
          const r = tousClients().filter((c) => !q || norm(`${c.id} ${c.prenom} ${c.nom} ${c.ville} ${c.cp} ${c.email}`).includes(q));
          h = `<table><thead><tr><th>Code</th><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Adresse</th>
            <th>Client depuis</th><th class="num">Commandes</th></tr></thead><tbody>
            ${r.map((c) => `<tr><td class="mono">${ech(c.id)}</td><td>${ech(c.prenom + ' ' + c.nom)}</td>
              <td class="mono">${ech(c.email)}</td><td class="mono">${ech(c.tel)}</td>
              <td>${ech(c.adr)}, ${ech(c.cp)} ${ech(c.ville)}</td><td>${fdate(c.since)}</td>
              <td class="num">${c.nb}</td></tr>`).join('')}</tbody></table>`;
        } else {
          const f = tousFournisseurs().filter((s2) => !q || norm(`${s2.id} ${s2.brand} ${s2.name} ${s2.ville}`).includes(q));
          h = `<table><thead><tr><th>Code</th><th>Marque</th><th>Société</th><th>Contact</th><th>Téléphone</th>
            <th>E-mail</th><th>Adresse</th><th class="num">Délai</th><th class="num">Franco</th>
            <th class="num">Mini. commande</th><th>Paiement</th></tr></thead><tbody>
            ${f.map((s2) => `<tr><td class="mono">${ech(s2.id)}</td><td><b>${ech(s2.brand)}</b></td><td>${ech(s2.name)}</td>
              <td>${ech(s2.contact)}</td><td class="mono">${ech(s2.tel)}</td><td class="mono">${ech(s2.email)}</td>
              <td>${ech(s2.adr)}, ${ech(s2.cp)} ${ech(s2.ville)}</td><td class="num">${s2.delai} j</td>
              <td class="num">${eur(s2.franco)}</td><td class="num">${s2.moq || '—'} ${ech(VOCAB.unitPl)}</td>
              <td>${ech(s2.pay)}</td></tr>`).join('')}</tbody></table>`;
        }
        hote.querySelector('#entListe').innerHTML = `<section class="panneau"><div class="ent-scroll">${h}</div></section>`;
      }

      /* ------------------------------------------------------------ console */
      function vueConsole() {
        const out = E.console.slice(-40).map((c) => `<div>${c.cmd != null ? `<div class="ent-cmd">${ech(c.cmd)}</div>` : ''}
          <div class="ent-cres">${c.html}</div></div>`).join('');
        return `<div class="ent-tete"><h2>Console</h2>
            <p class="note">Interrogez et modifiez votre base avec des commandes. Tapez <span class="mono">.help</span> pour les voir.</p></div>
          <div class="ent-console"><div class="ent-cout">${out}</div>
            <form class="ent-cin" id="formCmd" autocomplete="off"><span>&gt;</span>
              <input id="champCmd" placeholder=".getstock REF" spellcheck="false" aria-label="Commande">
              <button class="btn btn-p btn-s" type="submit">Exécuter</button></form></div>`;
      }

      const kv = (paires) => `<div class="ent-kv">${paires.map((p) => `<span>${p[0]}</span><span>${p[1]}</span>`).join('')}</div>`;
      const tbl = (entetes, lignes, droite) => `<div class="ent-scroll"><table><thead><tr>
        ${entetes.map((h, i) => `<th${droite && droite.includes(i) ? ' class="num"' : ''}>${h}</th>`).join('')}</tr></thead>
        <tbody>${lignes.map((r) => `<tr>${r.map((c, i) => `<td${droite && droite.includes(i) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

      function resoudre(brut) {
        const ref = String(brut || '').toUpperCase().trim();
        if (!ref) throw new Error('Il manque la référence. Exemple : .getstock NK-AM270-NR-42');
        if (VM[ref]) return { v: VM[ref] };
        if (MM[ref]) return { m: MM[ref] };
        const part = VARIANTS.filter((v) => v.sku.indexOf(ref) === 0);
        if (part.length && part.length <= 60) return { liste: part };
        throw new Error(`Référence introuvable : ${ech(ref)}. Essayez .find suivi d'un nom de modèle.`);
      }
      const stockModele = (m) => { let n = 0; m.colors.forEach((c) => m.sizes.forEach((s) => { n += stockDe(`${m.ref}-${c}-${s}`); })); return n; };

      function ajuster(genre, a) {
        const ref = String(a[0] || '').toUpperCase(), q = parseInt(a[1], 10);
        const nom = genre === 'set' ? 'setstock' : genre === 'add' ? 'addstock' : 'removestock';
        // Tout ce qui suit la quantité est le motif : « casse », « blocage qualité »… Il est
        // enregistré avec le mouvement, sans quoi l'historique dirait qu'une paire a disparu
        // sans dire pourquoi.
        const motif = a.slice(2).join(' ').trim();
        if (!ref || a[1] === undefined || isNaN(q) || q < 0 || String(q) !== String(a[1]).trim()) {
          throw new Error(`Syntaxe : .${nom} <réf article> <quantité entière positive>${genre === 'rem' ? ' [motif]' : ''}`);
        }
        const v = VM[ref];
        if (!v) throw new Error(`Référence article introuvable : ${ech(ref)}.${SIMPLE ? '' : ' Il faut la référence complète (modèle-couleur-taille).'}`);
        const avant = stockDe(v.sku);
        const apres = genre === 'set' ? q : (genre === 'add' ? avant + q : avant - q);
        if (apres < 0) throw new Error(`Stock insuffisant : ${avant} ${unite(avant)} disponible${avant > 1 ? 's' : ''}, impossible d'en retirer ${q}.`);
        if (genre === 'rem') {
          // Une sortie retire des lots dans l'ordre d'entrée : la trace reste juste.
          sortirFifo(v.sku, q, motif ? 'Sortie : ' + motif : 'Sortie', motif || 'Console');
        } else {
          db.stock[v.sku] = apres;
          mouvement(v.sku, genre === 'set' ? 'Ajustement inventaire' : 'Entrée', apres - avant, motif || 'Console');
        }
        sauver();
        return `<span class="juste">OK</span> ${ech(v.sku)} : ${avant} → <b>${apres}</b>`
          + (motif ? ` <span class="note">(${ech(motif)})</span>` : '');
      }

      const CMDS = {
        help: ['.help', 'Affiche cette aide', () => {
          const lignes = Object.keys(CMDS).filter((k) => k !== 'help')
            .map((k) => [`<span class="mono">${ech(CMDS[k][0])}</span>`, ech(CMDS[k][1])]);
          const exemple = SIMPLE
            ? `Référence article : ${ech(VARIANTS[0] ? VARIANTS[0].sku : 'REF')}.`
            : `Référence modèle : NK-AM270. Référence article : NK-AM270-NR-42 (modèle, couleur, ${ech(VOCAB.configWord)}).`;
          return `<div class="note">Les références ne tiennent pas compte des majuscules. ${exemple}</div>${tbl(['Commande', 'Effet'], lignes)}`;
        }],
        find: ['.find <texte>', 'Cherche un modèle par nom, marque ou catégorie', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error('Exemple : .find air max');
          const r = MODELS.filter((m) => norm(`${m.brand} ${m.name} ${m.ref} ${m.cat}`).includes(q));
          if (!r.length) throw new Error(`Aucun modèle trouvé pour « ${ech(q)} ».`);
          return tbl(['Réf. modèle', 'Modèle', 'Catégorie', 'Prix TTC'],
            r.map((m) => [`<span class="mono">${ech(m.ref)}</span>`, ech(m.brand + ' ' + m.name), ech(m.cat), eur(m.price)]), [3]);
        }],
        getstock: ['.getstock <réf>', "Stock d'une référence article ou d'un modèle", (a) => {
          const r = resoudre(a[0]);
          if (r.v) { const v = r.v, q = stockDe(v.sku);
            return kv([['Référence', `<span class="mono">${ech(v.sku)}</span>`], ['Article', ech(label(v))],
              ...(SIMPLE ? [] : [['Couleur', ech(nomCouleur(v.color))], [ech(VOCAB.sizeLabel), v.size]]),
              ['Stock', `<b>${q}</b> ${ech(unite(q))}`], ['Seuil', v.model.min], ['Stock maximum', v.model.max],
              ['Emplacement', ech(v.loc)], ['Statut', pastilleStock(q, v.model.min)]]); }
          if (r.liste) return tbl(['Référence', 'Article', 'Stock', 'Statut'], r.liste.map((v) => { const q = stockDe(v.sku);
            return [`<span class="mono">${ech(v.sku)}</span>`, ech(label(v) + precisionTexte(v)),
              `<b>${q}</b>`, pastilleStock(q, v.model.min)]; }), [2]);
          // Modèle entier : une ligne par référence complète, la référence en premier —
          // c'est elle que l'élève doit recopier dans son bon de préparation.
          const m = r.m, tot = stockModele(m);
          const lignes = [];
          m.colors.forEach((c) => m.sizes.forEach((t) => {
            const sku = `${m.ref}-${c}-${t}`, q = stockDe(sku);
            lignes.push([`<span class="mono">${ech(sku)}</span>`, ech(nomCouleur(c)),
              t, `<span class="mono">${ech(m.loc[c])}</span>`, `<b>${q}</b>`, pastilleStock(q, m.min)]);
          }));
          return `<div>${ech(m.brand + ' ' + m.name)} : <b>${tot}</b> ${ech(unite(tot))} au total, `
            + `${lignes.length} références</div>`
            + tbl(['Référence', 'Couleur', ech(VOCAB.sizeLabel), 'Emplacement', 'Stock', 'Statut'], lignes, [2, 4]);
        }],
        getprice: ['.getprice <réf>', "Prix de vente et prix d'achat", (a) => {
          const r = resoudre(a[0]), m = r.v ? r.v.model : (r.m || (r.liste && r.liste[0].model)), ht = m.price / 1.2;
          return kv([[SIMPLE ? 'Article' : 'Modèle', `${ech([m.brand, m.name].filter(Boolean).join(' '))} <span class="note">(${ech(m.ref)})</span>`],
            ['Prix TTC', `<b>${eur(m.price)}</b>`], ['Prix HT', eur(ht)], ["Prix d'achat HT", eur(m.cost)],
            ['Marge brute', `${eur(ht - m.cost)} (${Math.round((ht - m.cost) / ht * 100)} %)`]]);
        }],
        getproduct: ['.getproduct <réf>', 'Fiche produit résumée', (a) => {
          const r = resoudre(a[0]), m = r.v ? r.v.model : (r.m || (r.liste && r.liste[0].model)), sp = SUP_BY_ID[m.sup];
          return kv([[SIMPLE ? 'Article' : 'Modèle', ech([m.brand, m.name].filter(Boolean).join(' '))], ['Référence', `<span class="mono">${ech(m.ref)}</span>`],
            ['Catégorie', ech(m.cat)],
            ...(SIMPLE ? [['Emplacement', `<span class="mono">${ech(m.emplacement)}</span>`]]
              : [['Couleurs', m.colors.map((c) => `${ech(nomCouleur(c))} (${c})`).join(', ')],
                [ech(VOCAB.sizeLabel) + 's', `${m.s0} à ${m.s1}`]]),
            ['Prix TTC', eur(m.price)],
            ['Fournisseur', sp ? `${ech(sp.brand)} <span class="note">(${ech(sp.id)}, délai ${sp.delai} j)</span>` : '—'],
            ['Description', ech(m.desc)]]);
        }],
        getlocation: ['.getlocation <réf>', 'Emplacement en entrepôt', (a) => {
          const r = resoudre(a[0]);
          // Un catalogue simple donne son emplacement tel quel : il n'a ni zone ni allée calculées.
          if (r.v) return kv([['Référence', `<span class="mono">${ech(r.v.sku)}</span>`], ['Emplacement', `<b>${ech(r.v.loc)}</b>`],
            ...(SIMPLE ? [] : [['Lecture', `Zone ${ech(r.v.model.zone)}, allée ${pad(r.v.model.aisle, 2)}, niveau ${ech(r.v.loc.split('-')[2])}`]])]);
          const m = r.m || r.liste[0].model;
          return tbl(['Couleur', 'Emplacement'], m.colors.map((c) => [ech(nomCouleur(c)), `<b>${ech(m.loc[c])}</b>`]));
        }],
        lowstock: ['.lowstock [n]', 'Références dont le stock est inférieur ou égal à n (par défaut : le seuil)', (a) => {
          const n = a[0] !== undefined ? parseInt(a[0], 10) : null;
          if (a[0] !== undefined && isNaN(n)) throw new Error('n doit être un nombre. Exemple : .lowstock 3');
          const r = VARIANTS.filter((v) => { const q = stockDe(v.sku); return n === null ? q <= v.model.min : q <= n; })
            .sort((x, y) => stockDe(x.sku) - stockDe(y.sku));
          return `<div>${r.length} référence${r.length > 1 ? 's' : ''}${r.length > 40 ? ' (les 40 plus basses)' : ''}</div>`
            + tbl(['Référence', 'Article', 'Stock', 'Statut'], r.slice(0, 40).map((v) => { const q = stockDe(v.sku);
              return [`<span class="mono">${ech(v.sku)}</span>`, ech(label(v) + precisionTexte(v)),
                `<b>${q}</b>`, pastilleStock(q, v.model.min)]; }), [2]);
        }],
        stockvalue: ['.stockvalue [marque]', "Valeur du stock au prix d'achat HT", (a) => {
          const b = norm(a.join(' ')); let val = 0, n = 0;
          VARIANTS.forEach((v) => { if (b && norm(v.model.brand) !== b) return; const q = stockDe(v.sku); val += q * v.model.cost; n += q; });
          if (b && !n && !MODELS.some((m) => norm(m.brand) === b)) throw new Error(`Marque inconnue : ${ech(a.join(' '))}`);
          return kv([['Périmètre', b ? ech(a.join(' ')) : 'Tout le stock'],
            [VOCAB.unitPl.charAt(0).toUpperCase() + VOCAB.unitPl.slice(1), n], ['Valeur achat HT', `<b>${eur(val)}</b>`]]);
        }],
        getclient: ['.getclient <code ou nom>', 'Fiche client', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error('Exemple : .getclient C0007 ou .getclient dubois');
          const r = tousClients().filter((c) => norm(`${c.id} ${c.prenom} ${c.nom}`).includes(q)).slice(0, 10);
          if (!r.length) throw new Error('Aucun client trouvé.');
          return r.length === 1
            ? kv([['Code', ech(r[0].id)], ['Nom', ech(r[0].prenom + ' ' + r[0].nom)], ['E-mail', ech(r[0].email)],
                ['Téléphone', ech(r[0].tel)], ['Adresse', `${ech(r[0].adr)}, ${ech(r[0].cp)} ${ech(r[0].ville)}`],
                ['Client depuis', fdate(r[0].since)], ['Commandes', r[0].nb]])
            : tbl(['Code', 'Nom', 'Ville'], r.map((c) => [ech(c.id), ech(c.prenom + ' ' + c.nom), ech(c.ville)]));
        }],
        getsupplier: ['.getsupplier <code ou marque>', 'Fiche fournisseur', (a) => {
          const q = norm(a.join(' ')); if (!q) throw new Error('Exemple : .getsupplier nike ou .getsupplier F002');
          const r = tousFournisseurs().filter((s) => norm(`${s.id} ${s.brand} ${s.name}`).includes(q));
          if (!r.length) throw new Error('Aucun fournisseur trouvé.');
          return r.map((s) => kv([['Code', ech(s.id)], ['Marque', ech(s.brand)], ['Société', ech(s.name)],
            ['Contact', `${ech(s.contact)} · ${ech(s.tel)}`], ['E-mail', ech(s.email)],
            ['Adresse', `${ech(s.adr)}, ${ech(s.cp)} ${ech(s.ville)}`], ['Délai', `${s.delai} jours`],
            ['Franco', eur(s.franco)], ['Minimum de commande', `${s.moq || '—'} ${ech(VOCAB.unitPl)}`],
            ['Paiement', ech(s.pay)]])).join('<hr class="ent-hr">');
        }],
        addclient: ['.addclient <prénom nom> ; <e-mail> ; <téléphone> ; <adresse> ; <code postal> ; <ville>', 'Crée un nouveau client', (a) => {
          const p = a.join(' ').split(';').map((x) => x.trim());
          if (p.length < 6 || p.some((x) => !x)) throw new Error('Syntaxe : .addclient <prénom nom> ; <e-mail> ; <téléphone> ; <adresse> ; <code postal> ; <ville>');
          const nm = p[0].split(/\s+/).filter(Boolean);
          if (nm.length < 2) throw new Error('Indiquez le prénom et le nom, séparés par un espace, avant le premier « ; ».');
          if (!/^[0-9]{5}$/.test(p[4])) throw new Error('Le code postal doit comporter 5 chiffres.');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p[1])) throw new Error(`E-mail invalide : ${ech(p[1])}`);
          if (!db.customers) db.customers = [];
          const id = codeSuivant(tousClients(), 'C', 4);
          db.customers.push({ id, prenom: nm[0], nom: nm.slice(1).join(' '), email: p[1], tel: p[2], adr: p[3], cp: p[4], ville: p[5], since: Date.now(), nb: 0 });
          sauver();
          return `<div class="avis avis-ok">Nouveau client créé.</div>${kv([['Code', `<b>${ech(id)}</b>`], ['Nom', ech(p[0])], ['E-mail', ech(p[1])]])}`;
        }],
        addsupplier: ['.addsupplier <marque> ; <société> ; <contact> ; <téléphone> ; <e-mail> ; <adresse> ; <cp> ; <ville> ; <délai j.> ; <franco €> ; <paiement>', 'Crée un nouveau fournisseur', (a) => {
          const p = a.join(' ').split(';').map((x) => x.trim());
          if (p.length < 11 || p.some((x) => !x)) throw new Error('Syntaxe : .addsupplier <marque> ; <société> ; <contact> ; <téléphone> ; <e-mail> ; <adresse> ; <cp> ; <ville> ; <délai en jours> ; <franco en €> ; <conditions de paiement>');
          const delai = parseInt(p[8], 10), franco = parseFloat(p[9].replace(',', '.'));
          if (!/^[0-9]{5}$/.test(p[6])) throw new Error('Le code postal doit comporter 5 chiffres.');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p[4])) throw new Error(`E-mail invalide : ${ech(p[4])}`);
          if (isNaN(delai) || delai < 0) throw new Error('Le délai doit être un nombre de jours (ex. 5).');
          if (isNaN(franco) || franco < 0) throw new Error('Le franco de port doit être un montant en euros (ex. 900).');
          if (!db.suppliers) db.suppliers = [];
          const id = codeSuivant(tousFournisseurs(), 'F', 3);
          db.suppliers.push({ id, brand: p[0], name: p[1], contact: p[2], tel: p[3], email: p[4], adr: p[5], cp: p[6], ville: p[7], delai, franco, pay: p[10], moq: 16 });
          sauver();
          return `<div class="avis avis-ok">Nouveau fournisseur créé.</div>${kv([['Code', `<b>${ech(id)}</b>`], ['Marque', ech(p[0])], ['Société', ech(p[1])]])}`;
        }],
        getorder: ['.getorder <n°>', "Détail d'une commande enregistrée", (a) => {
          const q = String(a[0] || '').toUpperCase(); if (!q) throw new Error('Exemple : .getorder CMD-048213');
          const o = db.orders.find((x) => x.no.includes(q));
          if (!o) throw new Error('Commande non enregistrée. Ouvrez le mail de commande et cliquez sur « Enregistrer la commande ».');
          const c = clientDe(o.customerId), t = totaux(o), s = statutCommande(o);
          return kv([['Commande', ech(o.no)], ['Client', `${ech(c.prenom + ' ' + c.nom)} (${ech(c.id)})`],
            ['Livraison', ech(SHIP[o.ship][0])], ['Total TTC', eur(t.total)], ['Statut', ech(s[0])]])
            + tbl(['Référence', 'Article', 'Qté'], o.lines.map((l) => [`<span class="mono">${ech(l.sku)}</span>`,
              ech(label(VM[l.sku]) + precisionTexte(VM[l.sku])), l.qty]), [2]);
        }],
        movements: ['.movements [réf]', 'Derniers mouvements de stock', (a) => {
          const ref = a[0] ? String(a[0]).toUpperCase() : null;
          const r = db.moves.filter((m) => !ref || m.sku.indexOf(ref) === 0).slice(-15).reverse();
          if (!r.length) return '<span class="note">Aucun mouvement.</span>';
          return tbl(['Date', 'Référence', 'Type', 'Qté', 'Stock après', 'Lot', 'Origine'],
            r.map((m) => [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type),
              (m.delta > 0 ? '+' : '') + m.delta, m.after,
              m.lot ? `<span class="mono">${ech(m.lot)}</span>` : '<span class="note">—</span>',
              `<span class="mono">${ech(m.ref)}</span>`]), [3, 4]);
        }],
        getlot: ['.getlot <n° de lot>', "Remonter un lot : ce qui est entré, ce qui est sorti, et où c'est parti", (a) => {
          const lot = String(a[0] || '').toUpperCase().trim();
          if (!lot) throw new Error('Exemple : .getlot LOT-PS-2409');
          const mv = db.moves.filter((m) => String(m.lot || '').toUpperCase() === lot);
          if (!mv.length) throw new Error(`Aucun mouvement pour le lot ${ech(lot)}. Vérifiez le numéro sur le bon de livraison.`);
          const entrees = mv.filter((m) => m.delta > 0), sorties = mv.filter((m) => m.delta < 0);
          const somme = (l) => l.reduce((n, m) => n + Math.abs(m.delta), 0);
          const reste = somme(entrees) - somme(sorties);
          // Une sortie de préparation porte le numéro du bon (BP-xxxxxx) : on remonte de là à
          // la commande, donc au client. C'est tout l'intérêt d'avoir gardé l'origine.
          const ligneSortie = (m) => {
            const o = db.orders.find((x) => 'BP-' + x.no.replace('CMD-', '') === m.ref);
            const c = o ? clientDe(o.customerId) : null;
            return [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type), Math.abs(m.delta),
              `<span class="mono">${ech(m.ref)}</span>`,
              o ? `<span class="mono">${ech(o.no)}</span>` : '<span class="note">—</span>',
              c ? `${ech(c.prenom + ' ' + c.nom)} <span class="mono note">${ech(c.id)}</span>` : '<span class="note">—</span>'];
          };
          const sup = entrees.length ? (() => { const v = VM[entrees[0].sku];
            return v ? (SUP_BY_ID[v.model.sup] || null) : null; })() : null;
          return kv([['Lot', `<b class="mono">${ech(lot)}</b>`],
            ['Fournisseur', sup ? `${ech(sup.brand)} <span class="note">(${ech(sup.id)})</span>` : '<span class="note">inconnu</span>'],
            ['Entré le', entrees.length ? fdt(entrees[0].ts) : '—'],
            ['Réception', entrees.length ? `<span class="mono">${ech(entrees[0].ref)}</span>` : '—'],
            ['Entrées', `<b>${somme(entrees)}</b> ${ech(unite(somme(entrees)))}`],
            ['Sorties', `<b>${somme(sorties)}</b> ${ech(unite(somme(sorties)))}`],
            ['Reste en stock', `<b>${reste}</b> ${ech(unite(reste))}`]])
            + `<div class="ent-lbl" style="margin-top:12px">Entrées</div>`
            + tbl(['Date', 'Référence', 'Type', 'Qté', 'Origine'],
              entrees.map((m) => [fdt(m.ts), `<span class="mono">${ech(m.sku)}</span>`, ech(m.type), m.delta,
                `<span class="mono">${ech(m.ref)}</span>`]), [3])
            + `<div class="ent-lbl" style="margin-top:12px">Sorties</div>`
            + (sorties.length
              ? tbl(['Date', 'Référence', 'Type', 'Qté', 'Document', 'Commande', 'Client'], sorties.map(ligneSortie), [3])
              : '<span class="note">Aucune sortie : tout le lot est encore en stock.</span>');
        }],
        setstock: ['.setstock <réf> <qté>', "Fixe le stock d'un article (inventaire)", (a) => ajuster('set', a)],
        addstock: ['.addstock <réf> <qté>', 'Ajoute du stock (réception)', (a) => ajuster('add', a)],
        removestock: ['.removestock <réf> <qté>', 'Retire du stock (sortie, casse)', (a) => ajuster('rem', a)],
        clear: ['.clear', 'Vide la console', () => { E.console = []; return null; }],
      };

      // Les commandes qui donnent (ou font voir) le stock du système : bloquées pendant un
      // comptage à l'aveugle. Les ajustements aussi — `.setstock` affiche « avant → après ».
      const CMDS_STOCK = ['getstock', 'lowstock', 'stockvalue', 'movements', 'getlot', 'setstock', 'addstock', 'removestock'];

      function executer(texte) {
        texte = String(texte || '').trim(); if (!texte) return;
        let res;
        if (texte.charAt(0) !== '.') res = '<span class="faux">Une commande commence par un point. Tapez .help pour la liste.</span>';
        else {
          const parts = texte.slice(1).split(/\s+/), nom = parts[0].toLowerCase(), c = CMDS[nom];
          if (!c) res = `<span class="faux">Commande inconnue : .${ech(nom)}. Tapez .help.</span>`;
          else if (CMDS_STOCK.includes(nom) && inventaireBloque()) {
            res = `<span class="faux">Inventaire en cours : le stock du système est masqué jusqu'à la validation du comptage.</span>`;
          }
          else { try { res = c[2](parts.slice(1)); } catch (e) { res = `<span class="faux">${ech(e.message)}</span>`; } }
        }
        if (res === null) E.console = []; else E.console.push({ cmd: texte, html: res });
        if (E.vue !== 'console') aller('console'); else dessinerVue();
        const i = hote.querySelector('#champCmd'); if (i) i.focus();
      }

      /* ------------------------------------------------------- branchements */
      function brancher(z) {
        z.querySelectorAll('[data-vue2]').forEach((b) => b.addEventListener('click', () => aller(b.dataset.vue2)));
        z.querySelectorAll('[data-onglet]').forEach((b) => b.addEventListener('click', () => {
          E.onglet[b.dataset.onglet] = b.dataset.val; dessinerVue();
        }));
        z.querySelectorAll('[data-mail]').forEach((b) => b.addEventListener('click', () => ouvrirMail(+b.dataset.mail)));
        z.querySelectorAll('[data-dossier]').forEach((b) => b.addEventListener('click', () => {
          E.dossier = b.dataset.dossier; E.mailSel = null; dessiner();
        }));
        z.querySelector('[data-mail-retour]')?.addEventListener('click', () => { E.mailSel = null; dessiner(); });
        z.querySelector('[data-nouveau]')?.addEventListener('click', () => { E.redige = true; dessiner(); });
        z.querySelector('[data-annuler]')?.addEventListener('click', () => { E.redige = false; dessiner(); });
        z.querySelector('[data-envoyer-fou]')?.addEventListener('click', envoyerAuFournisseur);
        z.querySelector('[data-repondre]')?.addEventListener('click', () => {
          const f = z.querySelector('#formRep'); f.hidden = !f.hidden;
          if (f.hidden) return;
          const t = z.querySelector('#repT'); t.focus();
          // Réponse amorcée (mail avec `amorce`) : le curseur attend au bout de la première ligne.
          if (t.value) { const i = t.value.indexOf('\n'); const p = i < 0 ? t.value.length : i; t.setSelectionRange(p, p); }
        });
        z.querySelector('#formRep')?.addEventListener('submit', (e) => { e.preventDefault(); envoyerReponse(); });
        z.querySelectorAll('[data-enreg-cmd]').forEach((b) => b.addEventListener('click', () => enregistrerCommande(+b.dataset.enregCmd)));
        z.querySelectorAll('[data-ouvrir-cmd]').forEach((b) => b.addEventListener('click', () => aller('commande', { no: b.dataset.ouvrirCmd })));
        z.querySelectorAll('[data-ouvrir-rec]').forEach((b) => b.addEventListener('click', () => aller('reception', { no: b.dataset.ouvrirRec })));
        z.querySelectorAll('[data-rec]').forEach((el) => {
          const maj = () => majChampRec(el.dataset.sku, el.dataset.rec, el.value);
          el.addEventListener('input', maj);
          el.addEventListener('change', maj);
        });
        z.querySelector('#recLot')?.addEventListener('input', () => { majBoutonRec(); sauver(); });
        z.querySelector('[data-valider-rec]')?.addEventListener('click', validerReception);
        // `input` autant que `change` : le `change` d'un champ texte n'arrive qu'au moment où
        // l'élève en sort. S'il remplit sa dernière case puis ferme l'onglet, ou si le
        // navigateur ne déclenche jamais le blur, la saisie serait perdue.
        z.querySelectorAll('[data-prep]').forEach((el) => {
          const maj = () => majChamp(el.dataset.sku, el.dataset.prep, el.value);
          el.addEventListener('input', maj);
          el.addEventListener('change', maj);
        });
        z.querySelector('[data-bon]')?.addEventListener('click', () => {
          const o = commandeDe(E.no); o.prep.doc = true; sauver();
          const b = hote.querySelector('#blocBon');
          b.innerHTML = bonDePreparation(o);
          brancher(b);
          z.querySelector('[data-bon]').textContent = 'Régénérer le bon de préparation';
          hote.querySelector('#bon')?.scrollIntoView({ block: 'start' });
        });
        z.querySelector('#formBloc')?.addEventListener('submit', (e) => { e.preventDefault(); bloquerQualite(); });
        z.querySelector('[data-valider]')?.addEventListener('click', validerPreparation);
        z.querySelector('[data-copier]')?.addEventListener('click', copierBon);
        z.querySelector('[data-deverrouiller]')?.addEventListener('click', () => {
          const saisi = (z.querySelector('#codeStock').value || '').trim().toUpperCase();
          const attendu = String(ctx.codeStock || '').trim().toUpperCase();
          if (!attendu) { E.erreurCode = "Aucun code n'a encore été défini par votre enseignant."; }
          else if (saisi === attendu) { E.stockOuvert = true; E.erreurCode = ''; }
          else { E.erreurCode = 'Code incorrect.'; }
          dessinerVue();
        });
        z.querySelectorAll('[data-filtre]').forEach((el) => el.addEventListener('input', () => {
          if (E.vue === 'catalogue') majCatalogue();
          else if (E.vue === 'stock') majStock();
          else if (E.vue === 'clients' || E.vue === 'fournisseurs') majTiers();
        }));
        z.querySelector('#formCmd')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const i = z.querySelector('#champCmd'), t = i.value; i.value = ''; executer(t);
        });
        if (E.vue === 'plan' && VPLAN) VPLAN.brancher(z, apiTransport('plan'));
        if (E.vue === 'tournee' && VTOUR) VTOUR.brancher(z, apiTransport('tournee'));
        if (E.vue === 'inventaire' && VINV) VINV.brancher(z, etatInventaire(), apiInventaire());
      }

      remonterEtapes();
      dessiner();
      // Évaluation : la copie est-elle déjà rendue ? Ce qui fait foi est le résultat enregistré
      // (que l'enseignant peut ramasser ou rouvrir), pas la base de l'élève.
      if (COPIE && !estProf) {
        Promise.resolve(ctx.lireScore ? ctx.lireScore() : null).catch(() => null).then((t) => {
          if (t && t.rendu) { copie.rendue = t.rendu; copie.ramassee = !!t.ramasse; }
          copie.charge = true;
          if (hote.isConnected) dessiner();
        });
      }
    },
  };
}
