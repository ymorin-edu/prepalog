// La MESSAGERIE : la boîte de réception et les envoyés, le mail ouvert (corps d'une commande ou d'un bon de livraison, pièces jointes,
// boutons « Enregistrer la commande », « Ouvrir la commande », « Ouvrir la réception », bouton d'une fiche, cadenas d'un point d'étape),
// le nouveau message à un fournisseur (réponse automatique du fournisseur), la réponse libre et la réponse par phrases à choisir.
//
// Extrait de `core/types/entreprise.js` le 09/10/2026 (chantier 9, lot 9c, module 13) : le code est celui d'avant, mot pour mot.
// Monté à chaque ouverture : `monterMessagerie({ db, E, hote, prenom, estProf, rendue, A, VOCAB, VARIANTS, SUP_BY_ID, B, COM, REC, VDOC,
// VFICHES, vueDeFiche, VINV, VQUAI, MQ, SEANCE, reponsesFournisseur, ajouterMail, declencher, accuseCorrection, etapeQuiFerme, sauver,
// dessiner, dessinerVue, aller, PERSONNES, signal })`. `reponsesFournisseur` est `U.reponsesFournisseur || []` (lu dans `entreprise.js`) ;
// `ajouterMail`, `declencher`, `accuseCorrection`, `etapeQuiFerme`, `signal` sont des services du cœur ; `PERSONNES` = `equipe` + personnes
// des questions. L'état d'écran reste dans `E` (clés `mailSel`, `dossier`, `redige`, `piece`, `vus`, `brouillon`, `retourQuai`, et pour le
// transfert `transfertListe`, `transfertsProf`) : le cœur l'écrit aussi (`corriger()`, le bouton « Messagerie » du quai, les cartes).
//
// LE TRANSFERT (chantier D-1, 09/10/2026, état et format dans `transfert.js`) : sous un mail reçu qui porte `transfert: { a: [ids] }` et
// une `cle`, le bouton « Transférer à… » ouvre la liste des destinataires (nom et fonction, sans aplat), puis une confirmation dans la page ;
// le mail porte ensuite « Transféré à Nadia, 8 h 42 ». Un geste de travail : rangé dans `db.transferts[<séance>]`, signal
// `messagerie:transfert`, messages déclenchés (`apresTransfert`), accusé d'un transfert corrigé (`volet.corrections[<clé>]`). Gelé par le
// gel générique du cœur (le bouton n'est pas `data-libre`). L'enseignant voit tout et ne range rien (`E.transfertsProf`, écran seulement).
// Le drapeau de confirmation d'un envoi par phrases (`confirmeEnvoi`) vit DANS le montage (une ouverture), jamais en haut du fichier.
// Rend `{ vues: { mail }, brancher(z), ouvrirMail, docVu, compterDoc }` : `ouvrirMail` sert aux cartes des messages et au retour du quai ;
// `docVu` et `compterDoc` aux fiches (pièces jointes ouvertes). Les clics `[data-ouvrir-cmd]`, `[data-ouvrir-rec]` et `[data-enreg-cmd]`
// sont branchés ici : les mails de commande et de bon de livraison portent ces boutons, et ce sont les mêmes que les boutons « Ouvrir »
// des listes des commandes et des réceptions (`aller('commande' | 'reception', { no })`). Comme `brancher(z)` est appelé à chaque
// dessin de chaque écran, ils marchent partout ; la liste des commandes et celle des réceptions comptent donc sur ce module.
//
// INDENTATION : les corps de fonction et les gabarits de texte gardent l'indentation qu'ils avaient dans `entreprise.js`
// (l'espace entre deux balises fait partie du HTML rendu : la preuve du lot 9c compare ce HTML octet pour octet).
// Un module `entreprise-*.js` n'importe JAMAIS `entreprise.js` (import circulaire).

import { ech, toast, confirmerDansLaPage, auClavier } from '../ui.js';
import { appel } from './questions.js';
import { texteCompose } from '../phrases.js';
import { compterAide } from '../lexique.js';
import { fdate, fdt, norm } from './entreprise-outils.js';
import { GESTE_TRANSFERT, GESTE_PHRASE, transfertsDe, peutTransferer, rangerTransfert, heureTransfert } from './transfert.js';

export function monterMessagerie({ db, E, hote, prenom, estProf, rendue, A, VOCAB, VARIANTS, SUP_BY_ID, B, COM, REC, VDOC, VFICHES, vueDeFiche,
  VINV, VQUAI, MQ, SEANCE, reponsesFournisseur, ajouterMail, declencher, accuseCorrection, etapeQuiFerme, sauver, dessiner, dessinerVue,
  aller, PERSONNES = {}, signal = () => {} }) {
  const { unite } = A;
  const { tousFournisseurs } = B;
  const { corpsMailCommande, preparer } = COM;
  const { receptionDe, bonDeLivraison } = REC;

  // ── Le transfert d'un message (chantier D-1) ────────────────────────────────────────────────────────────────
  // L'état vu à l'écran : celui de la base chez l'élève ; chez l'enseignant, celui de l'écran seul (rien n'est rangé).
  const transfertsProf = E.transfertsProf || (E.transfertsProf = {});
  const etatTransfert = (m) => (estProf ? transfertsProf[m.cle] : transfertsDe(db, SEANCE)[m.cle]) || null;
  const aTransferer = (m) => !!(m && m.folder === 'in' && m.transfert && m.cle);
  // Le bouton est offert : jamais transféré, ou rouvert par « Corriger ». L'enseignant peut toujours essayer.
  const transfertOuvert = (m) => estProf || peutTransferer(db, SEANCE, m.cle);
  const appelDe = (id) => appel(PERSONNES[id]) || id;
  // La ligne de la liste des messages : « À transférer » / « Transféré », en texte (jamais de couleur).
  function marqueTransfert(m) {
    if (!aTransferer(m)) return '';
    const t = etatTransfert(m);
    return `<span class="note" data-transfert-marque="${ech(m.cle)}">${t && !(t.rouvert && !estProf) ? '↪ Transféré' : '↪ À transférer'}</span>`;
  }
  // Sous le mail ouvert : la mention du dernier transfert, le bouton, et la liste des destinataires quand elle est ouverte.
  function blocTransfert(sel) {
    if (!aTransferer(sel)) return '';
    const t = etatTransfert(sel);
    const mention = t && t.a ? `<p class="note" data-transfert-fait="${ech(sel.cle)}">Transféré à ${ech(appelDe(t.a))}, ${ech(heureTransfert(t.at))}</p>` : '';
    if (!transfertOuvert(sel)) return `<div class="ent-transfert" data-transfert="${ech(sel.cle)}" style="margin-top:14px">${mention}</div>`;
    const ouverte = E.transfertListe === sel.id;
    const liste = ouverte ? `<ul class="ent-transfert-liste" data-transfert-liste aria-label="Destinataires"
        style="list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;align-items:flex-start">
        ${sel.transfert.a.filter((id) => PERSONNES[id]).map((id) => `<li><button type="button" class="btn" data-transferer="${ech(id)}"
          style="text-align:left"><b>${ech(PERSONNES[id].nom || id)}</b>${PERSONNES[id].role ? ` <span class="note">· ${ech(PERSONNES[id].role)}</span>` : ''}</button></li>`).join('')}
      </ul>` : '';
    return `<div class="ent-transfert" data-transfert="${ech(sel.cle)}" style="margin-top:14px">${mention}
        <button type="button" class="btn" data-transfert-ouvrir aria-expanded="${ouverte ? 'true' : 'false'}">Transférer à…</button>${liste}</div>`;
  }
  // Au clavier, après le transfert (la liste et la confirmation sont parties) : le focus revient au message dans la liste.
  const refocaliser = (m) => { if (auClavier()) hote.querySelector(`[data-mail="${m.id}"]`)?.focus(); };
  function transferer(id, bouton) {
    const m = db.mails.find((x) => x.id === E.mailSel);
    if (!aTransferer(m) || !PERSONNES[id] || !m.transfert.a.includes(id)) return;
    if (!estProf && (rendue() || !peutTransferer(db, SEANCE, m.cle))) return;
    confirmerDansLaPage(bouton, `Transférer le message de ${m.from} à ${appelDe(id)} ?`, () => {
      E.transfertListe = null;
      if (estProf) {
        // L'enseignant voit le geste à l'écran ; rien n'est rangé dans la base.
        transfertsProf[m.cle] = { a: id, at: Date.now() };
        dessiner(); refocaliser(m);
        toast('Vue enseignant : le transfert n’est pas enregistré.');
        return;
      }
      if (rendue() || !peutTransferer(db, SEANCE, m.cle)) return;
      const t = rangerTransfert(db, SEANCE, m.cle, id, Date.now());
      signal(GESTE_TRANSFERT);
      // Comme l'envoi d'une fiche : les messages déclenchés d'abord ; un transfert CORRIGÉ (le deuxième…) reçoit l'accusé du volet.
      const arrive = declencher();
      if (!arrive && t.n > 1) accuseCorrection(m.cle, t.n);
      sauver(); dessiner(); refocaliser(m);
      toast(`Message transféré à ${appelDe(id)}.`);
    }, { oui: 'Oui, transférer' });
  }

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
            <span class="ent-obj">${ech(m.subject)}</span>${marqueTransfert(m)}</button>`).join('')
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
            VFICHES.filter((VF) => sel.ouvreFiche === VF.id && (!VF.quand || VF.quand(db))).forEach((VF) => {
              actions += `<button class="btn btn-p" data-vue2="${ech(vueDeFiche(VF))}" data-libre>${ech(VF.bouton)}</button>`;
            });
            if (sel.kind === 'bl' && recDuMail) {
              actions += `<button class="btn btn-p" data-ouvrir-rec="${ech(recDuMail.no)}">Ouvrir la réception</button>`;
            }
            // Un point d'étape qui garde la réponse fermée (`ferme: 'repondre:<clé>'`) : le bouton laisse la place au cadenas.
            const fe = etapeQuiFerme(`repondre:${sel.cle || (sel.phrases && sel.phrases.id) || ''}`);
            if (fe) {
              const qui = ech(appel(MQ.personnes[fe.de]));
              actions += `<div class="qf-ferme" data-qf-ferme><span>🔒 Fais d’abord le point d’étape avec ${qui}.</span>
                <button class="btn btn-s btn-p" data-q-aller-etape="${ech(fe.id)}" data-libre>Y aller</button></div>`;
            } else actions += '<button class="btn" data-repondre>Répondre</button>';
          }
          // Une pièce jointe ouverte prend la place du texte, dans le même lecteur.
          const piece = VDOC && E.piece && VDOC.pieces(sel.pieces).includes(E.piece) ? E.piece : null;
          if (piece) lecteur = `<div class="ent-lecteur">${VDOC.visionneuse(piece, sel.pieces, db)}</div>`;
          else lecteur = `<div class="ent-lecteur">
            <button class="lien-accueil" data-mail-retour>← Retour</button>
            <h3>${ech(sel.subject)}</h3>
            <p class="note">${E.dossier === 'in' ? 'De : ' + ech(sel.from + ' <' + sel.fromMail + '>') : 'À : ' + ech(sel.to + ' <' + (sel.toMail || '') + '>')} · ${fdt(sel.ts)}</p>
            ${corps}
            ${VDOC ? VDOC.rangee(sel.pieces, docVu) : ''}
            ${actions ? `<div class="rangee" style="margin-top:14px">${actions}</div>` : ''}${E.dossier === 'in' ? blocTransfert(sel) : ''}
            ${E.dossier === 'in' && sel.phrases ? (etapeQuiFerme(`repondre:${sel.cle || sel.phrases.id}`) ? '' : formPhrases(sel)) : `<form id="formRep" hidden style="margin-top:14px">
              <div class="champ"><label for="repT">Votre réponse</label><textarea id="repT" rows="${sel.amorce ? 8 : 6}">${ech(sel.amorce || '')}</textarea></div>
              <button class="btn btn-p" type="submit">Envoyer</button></form>`}</div>`;
        }

        // Venu du quai par son bouton « Messagerie » (ENT-4.3) : un lien pour y revenir.
        const retourQuai = VQUAI && E.retourQuai ? '<button class="lien-accueil" data-retour-quai>← Revenir au quai</button>' : '';
        return `<div class="ent-tete"><h2>Messagerie</h2><p class="note">Adresse : ${ech(adresse)}</p>${retourQuai}</div>
          <section class="panneau">
            <div class="rangee" style="margin-bottom:12px">
              <button class="btn btn-s ${E.dossier === 'in' ? 'btn-p' : ''}" data-dossier="in">Réception</button>
              <button class="btn btn-s ${E.dossier === 'out' ? 'btn-p' : ''}" data-dossier="out">Envoyés</button>
              <span class="pousse"><button class="btn btn-s btn-p" data-nouveau>Nouveau message</button></span>
            </div>
            <div class="ent-boite ${sel ? 'sel' : ''}"><div class="ent-mlist">${items}</div>${lecteur}</div>
          </section>`;
      }

      // La réponse par phrases à choisir (2de, `core/phrases.js`) : une liste déroulante par ligne, dans
      // l'ordre tiré pour l'élève, une ligne imposée en clair, l'aperçu du message en dessous. Le
      // formulaire reste ouvert d'un redessin à l'autre tant qu'un choix est commencé.
      function formPhrases(sel) {
        const P = sel.phrases, b = E.brouillon[sel.id] || {};
        const lignes = P.lignes.map((l, k) => {
          if (l.texte != null) return `<li class="ent-phr-fixe">${ech(l.texte)}</li>`;
          const val = Number.isInteger(b[l.id]) ? b[l.id] : '';
          return `<li><select id="phr-${k}" data-phrase="${ech(l.id)}" aria-label="Ligne ${k + 1} du message">
              <option value=""${val === '' ? ' selected' : ''}>Choisir une phrase…</option>
              ${l.ordre.map((i) => `<option value="${i}"${val === i ? ' selected' : ''}>${ech(l.choix[i])}</option>`).join('')}
            </select></li>`;
        }).join('');
        return `<form id="formPhr" ${E.brouillon[sel.id] ? '' : 'hidden'} class="ent-phrases">
            <p class="note">Choisissez une phrase à chaque ligne.</p>
            <ol class="ent-phr-lignes">${lignes}</ol>
            <p class="note">Aperçu du message</p>
            <div class="ent-phr-apercu" data-phr-apercu>${apercuPhrases(sel)}</div>
            <button class="btn btn-p" type="submit">Envoyer</button></form>`;
      }
      const apercuPhrases = (sel) => texteCompose(sel.phrases, E.brouillon[sel.id] || {}).split('\n')
        .map((x) => (x ? ech(x) : '<span class="ent-phr-trou">…</span>')).join('<br>');

      let confirmeEnvoi = false;
      function envoyerPhrases() {
        const m = db.mails.find((x) => x.id === E.mailSel);
        if (!m || !m.phrases) return;
        const b = E.brouillon[m.id] || {};
        const manque = m.phrases.lignes.some((l) => l.texte == null && !Number.isInteger(b[l.id]));
        if (manque) return toast('Choisissez une phrase à chaque ligne.');
        // Envoi définitif : d'abord une confirmation dans la page (06/10/2026, Smoby C2).
        const dejaEnvoyees = db.mails.filter((x) => x.folder === 'out' && x.phrases && x.phrases.id === m.phrases.id).length;
        if (!confirmeEnvoi) {
          confirmerDansLaPage(hote.querySelector('#formPhr button[type="submit"]'), dejaEnvoyees
            ? `Tu renvoies ta réponse corrigée à ${m.from} ?`
            : `Tu envoies ta réponse à ${m.from} ? Tu ne pourras plus la modifier.`,
            () => { confirmeEnvoi = true; envoyerPhrases(); });
          return;
        }
        confirmeEnvoi = false;
        const choix = {};
        m.phrases.lignes.forEach((l) => { if (l.texte == null) choix[l.id] = b[l.id]; });
        ajouterMail({ folder: 'out', ts: Date.now(), from: prenom, fromMail: '', to: m.from, toMail: m.fromMail,
          subject: 'RE : ' + m.subject.replace(/^RE : /, ''), kind: 'text', text: texteCompose(m.phrases, choix),
          phrases: { id: m.phrases.id, choix }, read: true });
        delete E.brouillon[m.id];
        const arrive = !rendue() && declencher();
        if (!arrive && !rendue() && dejaEnvoyees) accuseCorrection(m.phrases.id, dejaEnvoyees + 1);
        sauver(); E.dossier = 'out'; E.mailSel = null; dessiner();
        toast('Réponse envoyée.');
      }

      // Une pièce jointe ouverte (lot 1) : comptée à chaque ouverture, onglet ou précédent / suivant compris.
      const docVu = (id) => !!(E.vus[id] || (db.indicateurs && db.indicateurs[SEANCE]
        && db.indicateurs[SEANCE].docs && db.indicateurs[SEANCE].docs[id]));
      function compterDoc(id) {
        if (estProf || rendue()) { E.vus[id] = true; return; }
        compterAide(db, SEANCE, 'docs', id); sauver();
      }
      function ouvrirPiece(id) {
        E.piece = id; compterDoc(id); dessinerVue();
        hote.querySelector('.ent-lecteur')?.scrollIntoView({ block: 'nearest' });
      }

      function ouvrirMail(id) {
        E.mailSel = id; E.piece = null;
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
        if (!rendue()) declencher();
        sauver(); E.dossier = 'out'; E.mailSel = null; dessiner();
        toast('Réponse envoyée.');
      }

      // Le fournisseur répond tout seul : l'outil retrouve dans le message les références et
      // les quantités citées, et rappelle le minimum de commande — respecté ou non. On cherche les
      // références DU CATALOGUE de ce fournisseur, quel que soit leur format (05/10/2026 : seul le format
      // Spartoo `XX-MODELE-CC-NN` était reconnu, les autres entreprises recevaient « référence introuvable »).
      const echRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      function lireRefsQtes(texte, supId) {
        const T = String(texte || '').toUpperCase(), out = [];
        VARIANTS.filter((v) => v.model.sup === supId).forEach((v) => {
          const re = new RegExp(`(?:^|[^A-Z0-9-])${echRe(v.sku)}(?![A-Z0-9-])[^0-9]{0,20}?(\\d{1,4})`, 'g');
          let m;
          while ((m = re.exec(T))) out.push({ sku: v.sku, qty: parseInt(m[1], 10), v, i: m.index });
        });
        return out.sort((a, b) => a.i - b.i);
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
        const speciale = reponsesFournisseur.map((f) => f(corps, sup, db, prenom)).find(Boolean);
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

        if (!rendue()) declencher();
        sauver(); E.redige = false; E.dossier = 'in'; E.mailSel = null; dessiner();
        toast('Message envoyé.');
      }

  function brancher(z) {
    z.querySelectorAll('[data-mail]').forEach((b) => b.addEventListener('click', () => ouvrirMail(+b.dataset.mail)));
    z.querySelectorAll('[data-dossier]').forEach((b) => b.addEventListener('click', () => {
      E.dossier = b.dataset.dossier; E.mailSel = null; E.piece = null; dessiner();
    }));
    z.querySelector('[data-mail-retour]')?.addEventListener('click', () => { E.mailSel = null; E.piece = null; dessiner(); });
    z.querySelectorAll('[data-pj]').forEach((b) => b.addEventListener('click', () => ouvrirPiece(b.dataset.pj)));
    z.querySelector('[data-pj-retour]')?.addEventListener('click', () => {
      const pj = E.piece; E.piece = null; dessinerVue();
      z.querySelector(`[data-pj="${pj}"]`)?.focus();
    });
    z.querySelector('[data-nouveau]')?.addEventListener('click', () => { E.redige = true; dessiner(); });
    z.querySelector('[data-retour-quai]')?.addEventListener('click', () => { E.retourQuai = false; aller('quai'); });
    z.querySelector('[data-annuler]')?.addEventListener('click', () => { E.redige = false; dessiner(); });
    z.querySelector('[data-envoyer-fou]')?.addEventListener('click', envoyerAuFournisseur);
    z.querySelector('[data-repondre]')?.addEventListener('click', () => {
      const fp = z.querySelector('#formPhr');
      if (fp) {
        fp.hidden = !fp.hidden;
        if (!fp.hidden) fp.querySelector('select')?.focus();
        return;
      }
      const f = z.querySelector('#formRep'); f.hidden = !f.hidden;
      if (f.hidden) return;
      const t = z.querySelector('#repT'); t.focus();
      // Réponse amorcée (mail avec `amorce`) : le curseur attend au bout de la première ligne.
      if (t.value) { const i = t.value.indexOf('\n'); const p = i < 0 ? t.value.length : i; t.setSelectionRange(p, p); }
    });
    z.querySelector('#formRep')?.addEventListener('submit', (e) => { e.preventDefault(); envoyerReponse(); });
    z.querySelector('#formPhr')?.addEventListener('submit', (e) => { e.preventDefault(); envoyerPhrases(); });
    // Un choix met à jour l'aperçu sur place (pas de redessin : le focus reste dans la liste).
    z.querySelectorAll('[data-phrase]').forEach((el) => el.addEventListener('change', () => {
      const sel = db.mails.find((x) => x.id === E.mailSel);
      if (!sel) return;
      const b = E.brouillon[sel.id] || (E.brouillon[sel.id] = {});
      if (el.value === '') delete b[el.dataset.phrase]; else b[el.dataset.phrase] = +el.value;
      const ap = z.querySelector('[data-phr-apercu]'); if (ap) ap.innerHTML = apercuPhrases(sel);
      // Le geste « choisir une phrase » (ENT-6.2, 10/10/2026) : le premier choix d'une ligne, juste ou faux, est rangé une fois
      // (`messagerie:phrase:<ligne>`) et peut ouvrir une question au fil. Redessin SEULEMENT si le geste a fait arriver un message
      // ou une question (sinon la liste n'est pas redessinée et le focus y reste).
      if (el.value !== '' && !estProf && !rendue()) {
        const nom = GESTE_PHRASE + el.dataset.phrase;
        const neuf = !(db.gestes && db.gestes[SEANCE] && db.gestes[SEANCE][nom]);
        if (neuf) {
          const etat = () => JSON.stringify([db.mails.length, db.questions || null]);
          const avant = etat();
          signal(nom); declencher(); sauver();
          if (etat() !== avant) { const id = el.id; dessiner(); hote.querySelector('#' + id)?.focus(); }
        }
      }
    }));
    // Le transfert : le bouton ouvre (ou referme) la liste ; au clavier, le focus va au premier destinataire.
    z.querySelector('[data-transfert-ouvrir]')?.addEventListener('click', () => {
      E.transfertListe = E.transfertListe === E.mailSel ? null : E.mailSel;
      const clavier = auClavier();
      dessiner();
      if (clavier && E.transfertListe != null) hote.querySelector('[data-transferer]')?.focus();
    });
    z.querySelectorAll('[data-transferer]').forEach((b) => b.addEventListener('click', () => transferer(b.dataset.transferer, b)));
    z.querySelectorAll('[data-enreg-cmd]').forEach((b) => b.addEventListener('click', () => enregistrerCommande(+b.dataset.enregCmd)));
    z.querySelectorAll('[data-ouvrir-cmd]').forEach((b) => b.addEventListener('click', () => aller('commande', { no: b.dataset.ouvrirCmd })));
    z.querySelectorAll('[data-ouvrir-rec]').forEach((b) => b.addEventListener('click', () => aller('reception', { no: b.dataset.ouvrirRec })));
  }

  return {
    vues: { mail: vueMail },
    brancher,
    ouvrirMail, docVu, compterDoc,
  };
}
