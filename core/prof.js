// Espace enseignant : groupes, comptes élèves, suivi de classe, conduite de séance.
// Tout y est générique : une activité ajoutée demain apparaît ici sans une ligne de code.

import { B } from './backend.js';
import { ech, toast, confirmer } from './ui.js';
import { AISANCES, amenagements } from './amenagements.js';
import { seancesDepuis, memeBase } from './parcours.js';
import { chargerActivites, activite, entreprisesDe } from '../activites/index.js';
import { versCSV, telecharger, ouvrirJeu, cheminDe } from './store.js';
import { NIVEAUX, libelleNiveau, courtNiveau, libelleNiveaux, activiteVisible, horsNiveau, ouvertureParProf,
  demisDe, nomDemi, forcage } from './niveaux.js';
import { BAREME_AFFICHE, noteSur20, noteConvertie, formaterNote } from './notes.js';
import { estCopie, estRendue, libelleRendu, ramasser, rouvrir, baseDeLEleve } from './copie.js';
import { TEMPS, COEFS_DEFAUT, coefsDuGroupe, seancesParCompetence, seancesParSpecialite, moyenneCompetence } from './competences.js';

// Le nom de famille d'une activité, d'après le préfixe de son code (voir CLAUDE.md) : bandeau du Suivi.
const FAMILLES = { DEC: 'Découverte', ACT: 'Outils métier', TAB: 'Tableur', REF: 'Exercices', SCE: 'Scénarios',
  QUI: 'Quiz', MES: 'Messagerie' };
// Les activités hors entreprise, regroupées par préfixe consécutif (l'ordre des activités est gardé).
function famillesDe(metas) {
  const out = [];
  metas.forEach((m) => {
    const p = String(m.code || '').split('-')[0];
    const der = out[out.length - 1];
    if (der && der.prefixe === p) der.cols.push(m);
    else out.push({ id: 'fam-' + p + '-' + out.length, prefixe: p, nom: FAMILLES[p] || p, ent: false, cols: [m] });
  });
  return out;
}

export async function rendreEspaceProf(hote, ctx) {
  let onglet = ctx.onglet || 'groupes';
  let corrigeActif = null; // id de la séance dont le corrigé est ouvert (onglet Corrigés)
  let corrigeEleve = '';   // uid de l'élève dont on lit le corrigé (séance à jeu tiré par élève)
  let groupes = await B.groupesDuProf(ctx.profil.uid);
  let gidActif = ctx.groupeActif || groupes[0]?.id || null;
  let dernierLot = null;   // résultat de la dernière création de comptes, conservé à l'affichage
  let sansGroupe = [];     // élèves rattachés à aucun groupe — invisibles partout ailleurs
  // Demi-groupe choisi (brief MOTEUR-demi-groupes) : '' = toute la classe. Un seul choix pour
  // Suivi, Compétences et Conduite de séance : l'enseignant qui a 1L1 devant lui le règle une fois.
  let demiActif = '';
  // Entreprises repliées dans le Suivi (07/10/2026) : le choix tient le temps de la visite de l'espace enseignant.
  const suiviPlies = new Set();

  // Le groupe actif est partagé avec l'accueil : l'y remonter à chaque changement.
  function activer(gid) { if (gid !== gidActif) demiActif = ''; gidActif = gid; if (ctx.setGroupe) ctx.setGroupe(gid); }

  // Le sélecteur « Toute la classe / 1L1 / 1L2 », absent d'une classe sans demi-groupes.
  function choixDemi(g, libelle) {
    const demis = demisDe(g);
    if (!demis.length) return '';
    return `<label class="rangee" style="gap:6px">${ech(libelle)}
      <select data-choix-demi style="width:auto">
        <option value=""${demiActif ? '' : ' selected'}>Toute la classe</option>
        ${demis.map((d) => `<option value="${ech(d.id)}"${d.id === demiActif ? ' selected' : ''}>${ech(d.nom)}</option>`).join('')}
      </select></label>`;
  }
  function brancherChoixDemi(z) {
    const s = z.querySelector('[data-choix-demi]');
    s?.addEventListener('change', async () => {
      const auClavier = s.matches(':focus-visible');
      demiActif = s.value;
      await dessiner();
      if (auClavier) hote.querySelector('[data-choix-demi]')?.focus();
    });
  }
  // Le demi-groupe ne fait que filtrer : les résultats restent rangés par classe.
  const dansDemi = (g, e) => !demiActif || (g.demiDe || {})[e.uid] === demiActif;
  const suffixeDemi = (g) => (demiActif ? '-' + nomDemi(g, demiActif).replace(/[^\p{L}\p{N}_-]+/gu, '-') : '');
  activer(gidActif);

  // Relue à l'ouverture de l'espace et après chaque action qui peut en créer ou en défaire
  // un : la pastille de l'onglet n'a d'intérêt que si elle est juste. Un backend qui ne
  // connaîtrait pas encore la méthode, ou un refus de lecture, laisse la liste vide plutôt
  // que de casser tout l'espace enseignant.
  async function majSansGroupe() {
    try {
      sansGroupe = typeof B.elevesSansGroupe === 'function' ? await B.elevesSansGroupe() : [];
    } catch (e) { sansGroupe = []; }
  }
  await majSansGroupe();

  async function dessiner() {
    const g = groupes.find((x) => x.id === gidActif) || null;
    if (demiActif && !demisDe(g).some((d) => d.id === demiActif)) demiActif = '';
    hote.innerHTML = `
      <button class="lien-accueil" id="btnRetour">← ACCUEIL</button>
      <h1>Espace enseignant</h1>
      <nav class="rangee" style="margin-bottom:16px">
        ${[['groupes', 'Groupes'], ['comptes', 'Comptes élèves'], ['suivi', 'Suivi de classe'],
           ['competences', 'Compétences'], ['seance', 'Conduite de séance'], ['corriges', 'Corrigés'],
           ['orphelins', `Élèves sans groupe${sansGroupe.length ? ` (${sansGroupe.length})` : ''}`]]
          .map(([k, l]) => `<button class="btn btn-s ${onglet === k ? 'btn-p' : ''}${k === 'orphelins' && sansGroupe.length ? ' btn-alerte' : ''}" data-ong="${k}">${l}</button>`).join('')}
        ${g ? `<span class="pousse note">Groupe actif : <span class="etiq">${ech(g.nom)}</span>
          <span class="etiq">${ech(courtNiveau(g.niveau))}</span></span>` : ''}
      </nav>
      <div id="contenuProf"></div>`;

    hote.querySelector('#btnRetour').addEventListener('click', ctx.retour);
    hote.querySelectorAll('[data-ong]').forEach((b) => b.addEventListener('click', () => { onglet = b.dataset.ong; dessiner(); }));

    const z = hote.querySelector('#contenuProf');
    if (onglet === 'groupes') await vueGroupes(z);
    // Cet onglet-ci ne dépend d'aucun groupe actif : c'est justement là qu'on atterrit
    // quand il n'en reste plus et que des élèves sont restés derrière.
    else if (onglet === 'orphelins') await vueOrphelins(z);
    // Les corrigés des trames ne dépendent pas non plus d'un groupe : ils servent à préparer.
    else if (onglet === 'corriges') await vueCorriges(z);
    else if (!gidActif) z.innerHTML = `<div class="avis">Créez d'abord un groupe dans l'onglet « Groupes ».</div>`;
    else if (onglet === 'comptes') await vueComptes(z, g);
    else if (onglet === 'suivi') await vueSuivi(z, g);
    else if (onglet === 'competences') await vueCompetences(z, g);
    else await vueSeance(z, g);
  }

  // ------------------------------------------------------------------ corrigés des trames
  // Les QCM d'éco-droit des trames papier (écrits par outils/trame-*.py) ont leur corrigé ici,
  // dans un fichier par séance déclaré par `meta.corrige`. L'élève ne voit jamais cet onglet.
  // Limite assumée, comme pour tous les corrigés du site (voir prepalog-architecture.md) : le
  // fichier est servi par le dépôt public, donc lisible par qui connaît son adresse.
  //
  // Rangement (03/10/2026, décision de Tristan) : entreprise puis séance, comme la pastille
  // Simulog de l'accueil. On choisit une séance, seul son corrigé s'affiche (et se charge).
  async function vueCorriges(z) {
    // Au changement de séance, on garde l'écran en place pendant le chargement (pas de saut).
    if (!z.querySelector('#corrSommaire')) z.innerHTML = `<div class="note">Chargement des corrigés…</div>`;
    const mods = (await chargerActivites()).filter((x) => x.meta.corrige);
    if (!mods.length) {
      z.innerHTML = `<div class="vide">Aucun corrigé n'est publié pour l'instant.</div>`;
      return;
    }
    if (!mods.some((x) => x.meta.id === corrigeActif)) corrigeActif = null;
    const actif = mods.find((x) => x.meta.id === corrigeActif)?.meta || null;
    let lot = null;
    if (actif) {
      try {
        const mod = await import(new URL(actif.corrige, document.baseURI).href);
        lot = { m: actif, c: mod.CORRIGE, parEleve: typeof mod.corrigeEleve === 'function' ? mod.corrigeEleve : null };
      } catch (e) { lot = { m: actif, c: null }; }
    }
    // Séance à JEU TIRÉ PAR ÉLÈVE (évaluation, `core/tirage.js`) : pas de corrigé fixe, le corrigé
    // DE CET ÉLÈVE — son jeu, l'attendu, sa réponse — calculé par le fichier de corrigé
    // (`corrigeEleve(base, uid)`) depuis la base de l'élève, lue comme au ramassage des copies.
    let eleves = [], corrEleve = null;
    if (lot && lot.parEleve && gidActif) {
      try { eleves = await B.elevesDuGroupe(gidActif); } catch (e) { eleves = []; }
      if (!eleves.some((e) => e.uid === corrigeEleve)) corrigeEleve = '';
      if (corrigeEleve) {
        try {
          const base = await baseDeLEleve(B, corrigeEleve, lot.m.jeuId || lot.m.id);
          corrEleve = lot.parEleve(base, corrigeEleve);
        } catch (e) { corrEleve = { erreur: true }; }
      }
    }
    // Le titre d'une séance répète souvent le nom de l'entreprise (« Spartoo — réception ») :
    // sous l'en-tête de l'entreprise, on ne garde que la suite.
    const sansNom = (titre, nom) => String(titre || '').replace(new RegExp(`^${nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[—–-]\\s*`), '');
    const ents = entreprisesDe(mods);
    const sommaire = ents.map((e, i) => `
      <div class="corr-ent" data-entreprise="${ech(e.id)}" style="display:flex;align-items:center;gap:14px;padding:10px 0;${i < ents.length - 1 ? 'border-bottom:1px solid var(--filet);' : ''}flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px;flex:0 0 300px">
          ${e.logo ? `<span style="background:#f7f4ee;border:1px solid var(--filet);border-radius:var(--r);padding:4px 8px;display:inline-flex">
            <img src="${ech(e.logo)}" alt="" style="height:26px;max-width:90px;object-fit:contain;mix-blend-mode:multiply"></span>` : ''}
          <div><strong>${ech(e.nom)}</strong><div class="note" style="margin:0">${ech(e.metier)}</div>
            ${e.intention ? `<div class="note" data-intention style="margin:2px 0 0">Fiche d'intention :
              ${e.intention.pdf ? `<a href="${ech(e.intention.pdf)}" download>PDF</a>` : ''}
              ${e.intention.pdf && e.intention.docx ? ' · ' : ''}
              ${e.intention.docx ? `<a href="${ech(e.intention.docx)}" download>Word</a>` : ''}</div>` : ''}</div>
        </div>
        <div class="rangee" style="gap:8px">${e.acts.map(({ meta: m }) => `
          <button class="btn btn-s ${m.id === corrigeActif ? 'btn-p' : ''}" data-corrige="${ech(m.id)}"
            ${m.id === corrigeActif ? 'aria-pressed="true"' : 'aria-pressed="false"'}>
            <span class="mono">${ech(m.code || m.id)}</span> ${ech(sansNom(m.titre, e.nom))}${m.pret === false ? ' · en préparation' : ''}
          </button>`).join('')}</div>
      </div>`).join('');
    const lettre = (i) => String.fromCharCode(65 + i);
    const liste = (l) => `<ul style="margin:4px 0 4px 18px">${l.map((x) => `<li>${ech(x)}</li>`).join('')}</ul>`;
    const noteHtml = (it) => it.note ? `<div class="note" style="margin-top:4px">${ech(it.note)}</div>` : '';
    // Une question = un bloc ; la réponse attendue change de forme selon le genre.
    const corps = (it) => {
      if (it.genre === 'qcm') return `
        <div style="margin:6px 0 4px 12px">${it.choix.map((ch, i) => i === it.bonne
          ? `<div><strong>✓ ${lettre(i)}. ${ech(ch)}</strong></div>`
          : `<div class="note">&nbsp;&nbsp;${lettre(i)}. ${ech(ch)}</div>`).join('')}</div>
        ${it.explication ? `<div class="note">${ech(it.explication)}</div>` : ''}
        ${it.notion ? `<div class="note"><span class="etiq">${ech(it.notion)}</span></div>` : ''}`;
      if (it.genre === 'tableau') return `
        ${it.contexte ? `<div class="note">${ech(it.contexte)}</div>` : ''}
        <table style="margin:6px 0"><thead><tr>${it.entetes.map((h) => `<th>${ech(h)}</th>`).join('')}</tr></thead>
          <tbody>${(it.reponses || []).map((l) => `<tr>${l.map((c) => `<td>${ech(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        ${noteHtml(it)}`;
      if (it.genre === 'brouillon') return `
        ${it.modele ? `<blockquote style="margin:6px 0;padding:8px 12px;border-left:3px solid var(--filet);white-space:pre-line">${ech(it.modele)}</blockquote>` : ''}
        ${it.criteres ? `<div class="note">Le message doit contenir :</div>${liste(it.criteres)}` : ''}
        ${noteHtml(it)}`;
      if (it.pistes) return `<div class="note">Pistes (pas de réponse unique) :</div>${liste(it.pistes)}${noteHtml(it)}`;
      return `<div style="margin:4px 0 0 12px"><strong>✓ ${ech(it.rep || '')}</strong></div>${noteHtml(it)}`;
    };
    const etiqGenre = { qcm: 'QCM', fait: 'Fait', question: 'Question', reflexion: 'Pour réfléchir', tableau: 'Tableau', brouillon: 'Message' };
    const bloc = ({ m, c }) => {
      if (!c) return `<section class="panneau"><h2><span class="etiq">${ech(m.code || m.id)}</span> ${ech(m.titre)}</h2>
        <div class="avis">Le fichier de corrigé n'a pas pu être chargé.</div></section>`;
      const parEtape = new Map();
      c.items.forEach((it) => {
        if (!parEtape.has(it.etape)) parEtape.set(it.etape, { titre: it.etapeTitre, items: [] });
        parEtape.get(it.etape).items.push(it);
      });
      const nbQcm = c.items.filter((it) => it.genre === 'qcm').length;
      return `<section class="panneau">
        <h2><span class="etiq">${ech(c.code)}</span> ${ech(c.titre)}</h2>
        <p class="note">${c.items.length} questions dont ${nbQcm} QCM — trame <span class="mono">${ech(c.trame)}</span>.
          La réponse attendue est marquée « ✓ » ; les questions « Pour réfléchir » n'ont que des pistes.</p>
        ${/\.1$/.test(c.code) ? '' : `<p class="note"><strong>Chiffres du logiciel :</strong> valables si l'élève a fait la séance précédente
          jusqu'au bout, dans l'ordre. L'élève absent commence la séance manquée à son étape 1 ; la base ne se remet à zéro
          qu'en séance X.1. En cas d'écart, comparer avec l'écran de l'élève.</p>`}
        ${[...parEtape.entries()].map(([n, e]) => `
          <h3 style="margin-top:16px">Étape ${ech(n)} — ${ech(e.titre)}</h3>
          ${e.items.map((it) => `
            <div class="corr-item" data-genre="${ech(it.genre)}" style="padding:10px 0;border-bottom:1px solid var(--filet)">
              <div><span class="etiq">${ech(etiqGenre[it.genre] || it.genre)}</span> ${it.genre === 'tableau' ? '' : `<strong>${ech(it.texte)}</strong>`}</div>
              ${corps(it)}
            </div>`).join('')}`).join('')}
      </section>`;
    };
    // Le choix de l'élève, puis son corrigé (mêmes blocs que le corrigé d'une séance).
    const blocEleve = () => {
      if (!lot || !lot.parEleve) return '';
      if (!gidActif) return '<section class="panneau"><div class="avis">Chaque élève a son propre jeu : choisissez d\'abord un groupe actif pour lire le corrigé d\'un élève.</div></section>';
      const nom = (e) => `${e.nom || ''} ${e.prenom || ''}`.trim() || e.uid;
      const choix = `<div class="champ"><label for="corrEleve">Le corrigé de cet élève (chaque élève a reçu son propre jeu)</label>
        <select id="corrEleve"><option value="">— choisir un élève —</option>
          ${eleves.slice().sort((a, b) => nom(a).localeCompare(nom(b), 'fr')).map((e) => `<option value="${ech(e.uid)}" ${e.uid === corrigeEleve ? 'selected' : ''}>${ech(nom(e))}</option>`).join('')}
        </select></div>`;
      let corpsEleve = '';
      if (corrEleve && corrEleve.erreur) corpsEleve = '<div class="avis">Le jeu de cet élève n\'a pas pu être lu.</div>';
      else if (corrEleve) {
        corpsEleve = `${corrEleve.texte ? `<p class="note">${ech(corrEleve.texte)}</p>` : ''}
          ${corrEleve.items.map((it) => `<div class="corr-item" data-genre="${ech(it.genre)}" style="padding:10px 0;border-bottom:1px solid var(--filet)">
            <div><strong>${ech(it.texte)}</strong></div>${corps(it)}</div>`).join('')}`;
      }
      return `<section class="panneau" data-corr-eleve>${choix}${corpsEleve}</section>`;
    };
    z.innerHTML = `<p class="note">Corrigés complets des trames élèves (QCM, questions du logiciel, recherches Internet, tableaux, messages). Les réponses sont à relire
      avant usage ; celles issues d'Internet portent leur source et la date de relevé. Les nombres du logiciel dépendent de la base de données du site.</p>
      <section class="panneau" id="corrSommaire">${sommaire}</section>
      ${lot ? blocEleve() + bloc(lot) : `<div class="vide">Choisissez une séance ci-dessus pour afficher son corrigé.</div>`}`;
    z.querySelector('#corrEleve')?.addEventListener('change', async (ev) => {
      corrigeEleve = ev.target.value;
      await vueCorriges(z);
      z.querySelector('#corrEleve')?.focus();
    });
    z.querySelectorAll('[data-corrige]').forEach((b) => b.addEventListener('click', async () => {
      corrigeActif = b.dataset.corrige;
      const auClavier = b.matches(':focus-visible');
      await vueCorriges(z);
      if (auClavier) z.querySelector(`[data-corrige="${CSS.escape(b.dataset.corrige)}"]`)?.focus();
    }));
  }

  // ------------------------------------------------------------------ groupes
  async function vueGroupes(z) {
    const gActif = groupes.find((x) => x.id === gidActif) || null;
    z.innerHTML = `
      ${sansGroupe.length ? `<div class="avis avis-err" style="margin-bottom:14px">
        <strong>${sansGroupe.length} élève${sansGroupe.length > 1 ? 's ne sont rattachés' : ' n\'est rattaché'} à aucun groupe.</strong>
        ${sansGroupe.length > 1 ? 'Ils n\'apparaissent' : 'Il n\'apparaît'} dans aucune liste de classe
        et ${sansGroupe.length > 1 ? 'ne peuvent' : 'ne peut'} plus se servir de Prepalog.
        <button class="btn btn-s" id="btnVoirOrphelins" style="margin-left:8px">Voir et régler</button>
      </div>` : ''}
      <div class="grille grille-2">
        <section class="panneau">
          <h2>Nouveau groupe</h2>
          <div class="champ"><label for="gNom">Nom du groupe</label>
            <input id="gNom" placeholder="ex : 1 LOG A"></div>
          <div class="champ"><label for="gNiveau">Niveau</label>
            <select id="gNiveau">
              ${NIVEAUX.map((n) => `<option value="${ech(n.id)}" ${n.id === '1re' ? 'selected' : ''}>${ech(n.label)}</option>`).join('')}
            </select></div>
          <div class="champ"><label for="gAnnee">Année scolaire</label>
            <input id="gAnnee" value="${new Date().getMonth() >= 7 ? new Date().getFullYear() : new Date().getFullYear() - 1}-${new Date().getMonth() >= 7 ? new Date().getFullYear() + 1 : new Date().getFullYear()}"></div>
          <p class="note">Le niveau décide des activités proposées aux élèves du groupe.
             Vous pourrez toujours en ouvrir une d'un autre niveau depuis « Conduite de séance ».</p>
          <button class="btn btn-p" id="btnCreerG">Créer le groupe</button>
        </section>
        <section class="panneau">
          <h2>Mes groupes</h2>
          ${groupes.length === 0 ? `<div class="vide">Aucun groupe pour l'instant.</div>` : `
          <table><thead><tr><th>Groupe</th><th>Niveau</th><th>Année</th><th>Code</th><th></th></tr></thead><tbody>
            ${groupes.map((g) => `<tr>
              <td><strong>${ech(g.nom)}</strong></td>
              <td><span class="etiq">${ech(courtNiveau(g.niveau))}</span></td>
              <td>${ech(g.annee || '')}</td>
              <td><span class="etiq">${ech(g.code || '')}</span></td>
              <td class="rangee">
                ${g.id === gidActif ? '<span class="note">actif</span>' : `<button class="btn btn-s" data-actif="${ech(g.id)}">Activer</button>`}
                <button class="btn btn-s" data-suppr="${ech(g.id)}" style="color:var(--rouge)"
                  title="Supprimer définitivement ce groupe">Supprimer</button>
              </td>
            </tr>`).join('')}
          </tbody></table>`}
        </section>
      </div>
      ${gActif ? `
      <section class="panneau" id="panDemis" style="margin-top:16px">
        <h2>Demi-groupes de ${ech(gActif.nom)}</h2>
        <p class="note">Pour une classe coupée en deux (ou plus) qui ne travaille pas toujours en même temps.
          Le nom est libre et se change à tout moment sans rien casser. Les élèves se répartissent dans
          « Comptes élèves » ; le suivi se filtre, une séance s'ouvre et une base de classe se sépare
          par demi-groupe. Pour une autre classe, activez-la d'abord.</p>
        ${demisDe(gActif).map((d) => `<div class="rangee" style="margin-bottom:8px" data-demi="${ech(d.id)}">
          <input data-renommer="${ech(d.id)}" value="${ech(d.nom)}" style="width:12em" aria-label="Nom du demi-groupe ${ech(d.nom)}">
          <button class="btn btn-s" data-retirer-demi="${ech(d.id)}" style="color:var(--rouge)">Retirer</button>
        </div>`).join('')}
        <div class="rangee">
          <input id="demiNouveau" placeholder="ex : 1L1" style="width:12em" aria-label="Nom du nouveau demi-groupe">
          <button class="btn btn-s" id="btnAjoutDemi">Ajouter un demi-groupe</button>
        </div>
      </section>` : ''}`;

    // ---- demi-groupes (brief MOTEUR-demi-groupes). L'id est technique et ne change jamais :
    // c'est lui qui est écrit dans les affectations, les ouvertures et le chemin des bases.
    const nomLibre = (nom, sauf) => !demisDe(gActif).some((d) => d.id !== sauf && d.nom.toLowerCase() === nom.toLowerCase());
    const ajouterDemi = async () => {
      const inp = z.querySelector('#demiNouveau');
      const nom = inp.value.trim();
      if (!nom) return toast('Donnez un nom au demi-groupe.');
      if (nom.length > 40) return toast('Nom trop long (40 caractères au plus).');
      if (!nomLibre(nom)) return toast('Cette classe a déjà un demi-groupe de ce nom.');
      const demis = [...demisDe(gActif), { id: 'd' + Date.now().toString(36), nom }];
      try {
        await B.majGroupe(gActif.id, { demis });
        gActif.demis = demis;
        toast(`Demi-groupe ${nom} ajouté.`);
        await dessiner();
        hote.querySelector('#demiNouveau')?.focus();
      } catch (e) { toast("Le demi-groupe n'a pas pu être ajouté."); }
    };
    z.querySelector('#btnAjoutDemi')?.addEventListener('click', ajouterDemi);
    z.querySelector('#demiNouveau')?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ajouterDemi(); });

    z.querySelectorAll('[data-renommer]').forEach((inp) => inp.addEventListener('change', async () => {
      const id = inp.dataset.renommer;
      const avant = nomDemi(gActif, id);
      const nom = inp.value.trim();
      if (!nom || nom.length > 40 || !nomLibre(nom, id)) {
        inp.value = avant;
        return toast(!nom ? 'Un demi-groupe garde un nom.' : nom.length > 40 ? 'Nom trop long (40 caractères au plus).'
          : 'Cette classe a déjà un demi-groupe de ce nom.');
      }
      if (nom === avant) return;
      const demis = demisDe(gActif).map((d) => (d.id === id ? { ...d, nom } : d));
      try {
        await B.majGroupe(gActif.id, { demis });
        gActif.demis = demis;
        inp.value = nom;
        toast(`${avant} s'appelle maintenant ${nom}.`);
      } catch (e) { inp.value = avant; toast("Le nom n'a pas pu être enregistré."); }
    }));

    // Retirer un demi-groupe ne laisse rien d'invisible derrière lui : ses bases de classe sont
    // effacées, ses ouvertures et ses affectations retirées. Les bases d'abord : si l'effacement
    // s'arrête en route, le demi-groupe est encore là et l'on peut recommencer.
    z.querySelectorAll('[data-retirer-demi]').forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.retirerDemi;
      const nom = nomDemi(gActif, id);
      const eleves = (await B.elevesDuGroupe(gActif.id)).filter((e) => (gActif.demiDe || {})[e.uid] === id);
      const bases = [...new Map((await chargerActivites()).map((x) => x.meta)
        .filter((m) => m.portee === 'groupe').map((m) => [m.jeuId || m.id, m])).values()];
      const noms = eleves.map((e) => `${e.prenom} ${e.nom}`);
      if (!confirmer(`Retirer le demi-groupe « ${nom} » de ${gActif.nom} ?\n\n`
        + (eleves.length
          ? `${eleves.length} élève${eleves.length > 1 ? 's repassent' : ' repasse'} sans demi-groupe (il${eleves.length > 1 ? 's suivront' : ' suivra'} la classe) : `
            + (noms.length <= 12 ? noms.join(', ') : `${noms.slice(0, 12).join(', ')}… et ${noms.length - 12} autres`) + '.\n\n'
          : 'Aucun élève n\'y est affecté.\n\n')
        + (bases.length ? `Seront effacées définitivement : ses bases partagées (${bases.map((m) => m.code || m.id).join(', ')}) `
          + `et ses réglages d'ouverture.` : `Ses réglages d'ouverture seront effacés.`)
        + `\n\nLes résultats des élèves ne bougent pas.`)) return;
      try {
        for (const m of bases) await B.effacerJeu(cheminDe('groupe', m.jeuId || m.id, gActif.id, null, id));
        const demis = demisDe(gActif).filter((d) => d.id !== id);
        const demiDe = Object.fromEntries(Object.entries(gActif.demiDe || {}).filter(([, d]) => d !== id));
        const ouvertsDemi = { ...(gActif.ouvertsDemi || {}) };
        delete ouvertsDemi[id];
        await B.majGroupe(gActif.id, { demis, demiDe, ouvertsDemi });
        Object.assign(gActif, { demis, demiDe, ouvertsDemi });
        toast(`Demi-groupe ${nom} retiré.`);
        await dessiner();
      } catch (e) { toast('Le demi-groupe n\'a pas pu être retiré entièrement : recommencez.'); }
    }));

    z.querySelector('#btnVoirOrphelins')?.addEventListener('click', () => { onglet = 'orphelins'; dessiner(); });

    z.querySelector('#btnCreerG').addEventListener('click', async () => {
      const nom = z.querySelector('#gNom').value.trim();
      if (!nom) return toast('Donnez un nom au groupe.');
      try {
        const g = await B.creerGroupe({
          nom,
          annee: z.querySelector('#gAnnee').value.trim(),
          niveau: z.querySelector('#gNiveau').value,
          profUid: ctx.profil.uid,
        });
        groupes = await B.groupesDuProf(ctx.profil.uid);
        activer(g.id);
        toast('Groupe créé.');
        dessiner();
      } catch (e) { toast(e.message); }
    });
    z.querySelectorAll('[data-actif]').forEach((b) => b.addEventListener('click', () => { activer(b.dataset.actif); dessiner(); }));

    z.querySelectorAll('[data-suppr]').forEach((b) => b.addEventListener('click', async () => {
      const gid = b.dataset.suppr;
      const gr = groupes.find((x) => x.id === gid);

      // Une seule confirmation, mais qui énumère ce qui part : un « Êtes-vous sûr ? » ne
      // dit rien de ce qu'on perd, et c'est justement là que se jouent les accidents.
      // Le décompte est fait AVANT d'agir, et il est nominatif quand il tient : la
      // suppression du groupe emporte les élèves qui n'ont que lui, et c'est le genre de
      // conséquence qu'on ne découvre pas après coup.
      const eleves = await B.elevesDuGroupe(gid);
      const partent = eleves.filter((e) => (e.groupes || []).length <= 1);
      const restent = eleves.length - partent.length;

      let detail = '';
      if (partent.length) {
        const noms = partent.map((e) => `${e.prenom} ${e.nom}`);
        detail += `\n\n${partent.length} élève${partent.length > 1 ? 's n\'appartiennent' : ' n\'appartient'} `
          + `qu'à ce groupe : ${partent.length > 1 ? 'leurs comptes seront supprimés' : 'son compte sera supprimé'} `
          + `aussi, avec ${partent.length > 1 ? 'leurs codes et leurs travaux' : 'son code et ses travaux'}.\n`
          + (noms.length <= 12 ? noms.join(', ') : `${noms.slice(0, 12).join(', ')}… et ${noms.length - 12} autres`);
      }
      if (restent) {
        detail += `\n\n${restent} élève${restent > 1 ? 's appartiennent' : ' appartient'} aussi à un autre `
          + `groupe : ${restent > 1 ? 'ils seront seulement détachés' : 'il sera seulement détaché'} de celui-ci.`;
      }
      if (!eleves.length) detail = '\n\nCe groupe ne compte aucun élève.';

      if (!confirmer(`Supprimer le groupe « ${gr?.nom || gid} » ?\n\n`
        + `Seront effacés définitivement : le groupe, ses bases de données partagées `
        + `et tous les résultats de ses élèves.`
        + detail)) return;
      try {
        const r = await B.supprimerGroupe(gid);
        groupes = await B.groupesDuProf(ctx.profil.uid);
        await majSansGroupe();
        if (gidActif === gid) activer(groupes[0]?.id || null);
        const bouts = [];
        if (r && r.supprimes) bouts.push(`${r.supprimes} élève${r.supprimes > 1 ? 's supprimés' : ' supprimé'}`);
        if (r && r.detaches) bouts.push(`${r.detaches} détaché${r.detaches > 1 ? 's' : ''}`);
        // Un compte d'authentification sans code enregistré ne peut pas être retiré par
        // l'application (voir supprimerEleve) : le signaler, sinon il reste dans la console
        // sans que personne ne le sache. Un seul message : deux toasts d'affilée se
        // remplacent l'un l'autre, le premier ne serait jamais lu.
        const orphelins = r ? (r.supprimes || 0) - (r.comptes || 0) : 0;
        toast(`Groupe supprimé${bouts.length ? ' — ' + bouts.join(', ') : ''}.`
          + (orphelins > 0
            ? ` ${orphelins} identifiant${orphelins > 1 ? 's' : ''} de connexion subsiste${orphelins > 1 ? 'nt' : ''} :`
              + ` à retirer depuis la console Firebase.`
            : ''), orphelins > 0 ? 7000 : 2600);
        dessiner();
      } catch (e) { toast(e.message || 'Suppression impossible.'); }
    }));
  }

  // ------------------------------------------------------------------ comptes
  async function vueComptes(z, g) {
    const eleves = await B.elevesDuGroupe(g.id);
    // Demi-groupes : la colonne n'apparaît que si la classe en a.
    const demis = demisDe(g);
    const demiEleve = (uid) => { const d = (g.demiDe || {})[uid]; return demis.some((x) => x.id === d) ? d : ''; };
    const sansDemi = () => eleves.filter((e) => !demiEleve(e.uid)).length;
    const avisSansDemi = () => {
      const n = sansDemi();
      return n ? `${n} élève${n > 1 ? 's' : ''} sans demi-groupe : ${n > 1 ? 'ils suivent' : 'il suit'} les réglages de la classe et sa base partagée.` : '';
    };
    z.innerHTML = `
      <div class="grille grille-2">
        <section class="panneau">
          <h2>Créer des comptes en lot</h2>
          <p class="note">Une ligne par élève : <code>NOM ; Prénom ; matricule ; code</code>.
             Le code peut être laissé vide, il sera généré.</p>
          <textarea id="lot" rows="8" placeholder="DUPONT ; Léa ; 2601 ; &#10;MARTIN ; Noé ; 2602 ;"></textarea>
          <div class="rangee" style="margin-top:10px">
            <button class="btn btn-p" id="btnLot">Créer les comptes</button>
            <span class="note" id="progLot"></span>
          </div>
          <div id="resLot">${dernierLot ? `
            <div class="avis ${dernierLot.erreurs.length ? 'avis-err' : 'avis-ok'}">
              ${dernierLot.faits.length} compte${dernierLot.faits.length > 1 ? 's' : ''} créé${dernierLot.faits.length > 1 ? 's' : ''}.
              ${dernierLot.erreurs.length ? `<br>${dernierLot.erreurs.map(ech).join('<br>')}` : ''}
            </div>
            ${dernierLot.faits.length ? `<button class="btn btn-s" id="btnCodes" style="margin-top:8px">Télécharger les identifiants</button>` : ''}` : ''}</div>
        </section>
        <section class="panneau">
          <div class="rangee" style="margin-bottom:10px">
            <strong>${eleves.length} élève${eleves.length > 1 ? 's' : ''} dans ${ech(g.nom)}</strong>
            <span class="pousse"><button class="btn btn-s" id="btnCsvEleves">Exporter la liste</button></span>
          </div>
          ${demis.length && eleves.length ? `<p class="note" id="avisSansDemi"${sansDemi() ? '' : ' hidden'}>${ech(avisSansDemi())}</p>` : ''}
          ${eleves.length === 0 ? `<div class="vide">Aucun élève.</div>` : `
          <table><thead><tr><th>Nom</th><th>Prénom</th><th>Matricule</th><th>Code</th>
            ${demis.length ? '<th>Demi-groupe</th>' : ''}<th>Niveau</th><th>Tiers-temps</th><th></th></tr></thead><tbody>
            ${eleves.map((e) => { const a = amenagements(e); return `<tr><td>${ech(e.nom)}</td><td>${ech(e.prenom)}</td>
              <td class="mono">${ech(e.matricule)}</td><td class="mono">${ech(e.code || '—')}</td>
              ${demis.length ? `<td><select data-demi-eleve="${ech(e.uid)}" style="width:auto;min-width:6em" aria-label="Demi-groupe de ${ech(e.prenom)} ${ech(e.nom)}">
                <option value="">—</option>
                ${demis.map((d) => `<option value="${ech(d.id)}"${demiEleve(e.uid) === d.id ? ' selected' : ''}>${ech(d.nom)}</option>`).join('')}
              </select></td>` : ''}
              <td><select data-aisance="${ech(e.uid)}" style="width:auto;min-width:8.5em" aria-label="Niveau de ${ech(e.prenom)} ${ech(e.nom)}">
                ${AISANCES.map((x) => `<option value="${x.id}"${a.aisance === x.id ? ' selected' : ''}>${x.label}</option>`).join('')}
              </select></td>
              <td><label class="rangee" style="gap:6px"><input type="checkbox" data-tiers="${ech(e.uid)}"${a.tiersTemps ? ' checked' : ''}
                aria-label="Tiers-temps de ${ech(e.prenom)} ${ech(e.nom)}"></label></td>
              <td><button class="btn btn-s" data-suppre="${ech(e.uid)}" style="color:var(--rouge)"
                title="Supprimer définitivement cet élève">Supprimer</button></td></tr>`; }).join('')}
          </tbody></table>
          <p class="note">Les codes sont enregistrés avec le compte : un élève qui a perdu le sien
             le retrouve ici. Les comptes créés avant le 30/09/2026 affichent « — », leur code
             n'ayant pas été conservé.</p>
          <p class="note"><strong>Niveau</strong> : « Confirmé » donne des jeux de données plus
             complets dans les séances qui le prévoient ; les autres restent identiques.
             <strong>Tiers-temps</strong> : seuils de temps × 4/3 dans les épreuves chronométrées.
             Le tiers-temps ne s'affiche qu'ici et chez l'élève concerné ; il n'est ni exporté
             ni visible dans le suivi de classe. Pris en compte à la prochaine séance ouverte.</p>
          ${demis.length ? `<p class="note"><strong>Demi-groupe</strong> : décide des séances ouvertes à l'élève
             (« Conduite de séance ») et de la base partagée où il travaille. Changer un élève de demi-groupe
             ne touche pas à ses résultats ; il passe sur la base partagée de son nouveau demi-groupe à la
             prochaine séance ouverte.</p>` : ''}`}
        </section>
      </div>`;

    z.querySelector('#btnLot').addEventListener('click', async () => {
      const lignes = z.querySelector('#lot').value.split('\n').map((l) => l.trim()).filter(Boolean);
      const liste = lignes.map((l) => {
        const [nom, prenom, matricule, code] = l.split(';').map((x) => (x || '').trim());
        return { nom, prenom, matricule, code: code || Math.random().toString(36).slice(2, 6) };
      }).filter((e) => e.nom && e.prenom && e.matricule);
      if (!liste.length) return toast('Aucune ligne exploitable.');
      const prog = z.querySelector('#progLot');
      dernierLot = await B.creerEleves(g.id, liste, (i, n) => { prog.textContent = `${i} / ${n}`; });
      await dessiner();
    });

    const bc = z.querySelector('#btnCodes');
    if (bc) bc.addEventListener('click', () => telecharger(`identifiants-${g.id}.csv`,
      versCSV(dernierLot.faits, [{ cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' },
        { cle: 'matricule', label: 'Matricule' }, { cle: 'code', label: 'Code' }])));

    // Niveau et tiers-temps : enregistrés au changement, sans redessiner (le focus reste en place).
    // Un refus remet la case comme elle était : jamais d'écran qui ment sur ce qui est enregistré.
    const regler = async (champ, uid, valeur, annuler) => {
      const el = eleves.find((x) => x.uid === uid);
      if (!el) return;
      try {
        await B.majAmenagements(uid, { [champ]: valeur });
        el[champ] = valeur;
        toast(champ === 'tiersTemps'
          ? `Tiers-temps ${valeur ? 'accordé à' : 'retiré à'} ${el.prenom} ${el.nom}.`
          : `${el.prenom} ${el.nom} : niveau ${valeur === 'confirme' ? 'confirmé' : 'standard'}.`);
      } catch (e) { annuler(); toast(e.message || 'Réglage non enregistré.'); }
    };
    z.querySelectorAll('[data-aisance]').forEach((s) => s.addEventListener('change', () => {
      const avant = amenagements(eleves.find((x) => x.uid === s.dataset.aisance)).aisance;
      regler('aisance', s.dataset.aisance, s.value, () => { s.value = avant; });
    }));
    z.querySelectorAll('[data-tiers]').forEach((c) => c.addEventListener('change', () => {
      regler('tiersTemps', c.dataset.tiers, c.checked, () => { c.checked = !c.checked; });
    }));

    // Demi-groupe : enregistré au changement, sans redessiner, comme le niveau. Les changements
    // passent l'un après l'autre (file) : deux listes changées coup sur coup ne s'écrasent pas.
    let file = Promise.resolve();
    z.querySelectorAll('[data-demi-eleve]').forEach((s) => s.addEventListener('change', () => {
      const uid = s.dataset.demiEleve;
      const el = eleves.find((x) => x.uid === uid);
      const valeur = s.value;
      file = file.then(async () => {
        const avant = demiEleve(uid);
        const demiDe = { ...(g.demiDe || {}) };
        if (valeur) demiDe[uid] = valeur; else delete demiDe[uid];
        try {
          await B.majGroupe(g.id, { demiDe });
          g.demiDe = demiDe;
          toast(`${el.prenom} ${el.nom} : ${valeur ? nomDemi(g, valeur) : 'sans demi-groupe'}.`);
        } catch (e) { s.value = avant; toast('Demi-groupe non enregistré.'); }
        const avis = z.querySelector('#avisSansDemi');
        if (avis) { avis.textContent = avisSansDemi(); avis.hidden = !sansDemi(); }
      });
    }));

    z.querySelectorAll('[data-suppre]').forEach((b) => b.addEventListener('click', async () => {
      const el = eleves.find((x) => x.uid === b.dataset.suppre);
      if (!el) return;
      if (!confirmer(`Supprimer ${el.prenom} ${el.nom} (matricule ${el.matricule}) ?\n\n`
        + `Seront effacés définitivement : son profil, ses résultats dans tous ses groupes `
        + `et ses travaux enregistrés.\n\n`
        + `Son identifiant de connexion part aussi, à condition que son code soit connu `
        + `(colonne Code). S'il affiche « — », le compte devra être retiré depuis la `
        + `console Firebase.`)) return;
      try {
        const r = await B.supprimerEleve(el.uid);
        // Son affectation à un demi-groupe part avec lui : rien d'invisible dans le groupe.
        if (g.demiDe && el.uid in g.demiDe) {
          const demiDe = { ...g.demiDe };
          delete demiDe[el.uid];
          try { await B.majGroupe(g.id, { demiDe }); g.demiDe = demiDe; } catch (e) { /* une clé orpheline ne gêne rien */ }
        }
        toast(r && r.compte
          ? 'Élève et compte supprimés.'
          : 'Données supprimées. Le compte de connexion subsiste : retirez-le depuis la console Firebase.');
        await dessiner();
      } catch (e) { toast(e.message || 'Suppression impossible.'); }
    }));

    z.querySelector('#btnCsvEleves').addEventListener('click', () => telecharger(`eleves-${g.id}.csv`,
      versCSV(eleves.map((e) => ({ ...e, demi: nomDemi(g, demiEleve(e.uid)) })),
        [{ cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' },
          { cle: 'matricule', label: 'Matricule' }, { cle: 'code', label: 'Code' },
          ...(demis.length ? [{ cle: 'demi', label: 'Demi-groupe' }] : [])])));
  }

  // -------------------------------------------------------- élèves sans groupe
  // Le cul-de-sac que cette vue ferme : toutes les listes de l'application partent d'un
  // groupe. Un élève qui n'en a plus — groupe supprimé avant le 01/10/2026, profil retouché
  // dans la console — garde son profil, son code et son identifiant de connexion, mais
  // n'apparaît plus nulle part : ni à rattacher, ni à supprimer. Il est seulement invisible.
  // La liste n'est pas relue ici mais par les actions qui la changent, juste avant de
  // redessiner : l'onglet porte le compte, et un compte peint avant la relecture serait
  // faux d'un temps — c'est ce qu'on a vu sur le rattachement.
  async function vueOrphelins(z) {
    const options = groupes.map((g) =>
      `<option value="${ech(g.id)}">${ech(g.nom)} — ${ech(courtNiveau(g.niveau))}</option>`).join('');

    z.innerHTML = `
      <section class="panneau">
        <div class="rangee" style="margin-bottom:12px">
          <strong>${sansGroupe.length === 0 ? 'Aucun élève sans groupe'
            : `${sansGroupe.length} élève${sansGroupe.length > 1 ? 's' : ''} sans groupe`}</strong>
          <span class="pousse"><button class="btn btn-s" id="btnRelireOrph">Actualiser</button></span>
        </div>
        ${sansGroupe.length === 0 ? `
          <div class="vide">Tous les élèves sont rattachés à un groupe.</div>
          <p class="note">Cet écran est un filet de sécurité : il montre les élèves qui existent
            encore dans la base sans appartenir à aucun groupe. Comme toutes les autres listes
            partent d'un groupe, ce sont les seuls que vous ne verriez nulle part ailleurs.</p>`
        : `
        <p class="note">Ces élèves existent dans la base — profil, code, identifiant de
          connexion — mais n'appartiennent à aucun groupe. Ils n'apparaissent dans aucune liste
          de classe et ne peuvent plus travailler. Rattachez-les à un groupe, ou supprimez-les
          définitivement.</p>
        ${groupes.length === 0 ? `<div class="avis">Vous n'avez aucun groupe : créez-en un dans
          l'onglet « Groupes » pour pouvoir y rattacher ces élèves.</div>` : ''}
        <table><thead><tr><th>Nom</th><th>Prénom</th><th>Matricule</th><th>Code</th>
          <th>Rattacher à</th><th></th></tr></thead><tbody>
          ${sansGroupe.map((e) => `<tr>
            <td>${ech(e.nom)}</td><td>${ech(e.prenom)}</td>
            <td class="mono">${ech(e.matricule)}</td><td class="mono">${ech(e.code || '—')}</td>
            <td>${groupes.length ? `<div class="rangee">
              <select data-grp="${ech(e.uid)}" aria-label="Groupe pour ${ech(e.prenom)} ${ech(e.nom)}">${options}</select>
              <button class="btn btn-s" data-ratt="${ech(e.uid)}">Rattacher</button>
            </div>` : '<span class="note">—</span>'}</td>
            <td><button class="btn btn-s" data-suppro="${ech(e.uid)}" style="color:var(--rouge)"
              title="Supprimer définitivement cet élève">Supprimer</button></td>
          </tr>`).join('')}
        </tbody></table>`}
      </section>`;

    z.querySelector('#btnRelireOrph').addEventListener('click', async () => {
      await majSansGroupe(); await dessiner();
    });

    z.querySelectorAll('[data-ratt]').forEach((b) => b.addEventListener('click', async () => {
      const uid = b.dataset.ratt;
      const el = sansGroupe.find((x) => x.uid === uid);
      const gid = z.querySelector(`[data-grp="${CSS.escape(uid)}"]`).value;
      const gr = groupes.find((x) => x.id === gid);
      try {
        await B.rattacherEleve(uid, gid);
        toast(`${el.prenom} ${el.nom} rattaché à ${gr?.nom || gid}.`);
        await majSansGroupe();
        await dessiner();
      } catch (e) { toast(e.message || 'Rattachement impossible.'); }
    }));

    z.querySelectorAll('[data-suppro]').forEach((b) => b.addEventListener('click', async () => {
      const el = sansGroupe.find((x) => x.uid === b.dataset.suppro);
      if (!el) return;
      if (!confirmer(`Supprimer ${el.prenom} ${el.nom} (matricule ${el.matricule}) ?\n\n`
        + `Seront effacés définitivement : son profil, ses travaux enregistrés et son code.\n\n`
        + `Son identifiant de connexion part aussi, à condition que son code soit connu `
        + `(colonne Code). S'il affiche « — », le compte devra être retiré depuis la `
        + `console Firebase.`)) return;
      try {
        const r = await B.supprimerEleve(el.uid);
        toast(r && r.compte
          ? 'Élève et compte supprimés.'
          : 'Données supprimées. Le compte de connexion subsiste : retirez-le depuis la console Firebase.');
        await majSansGroupe();
        await dessiner();
      } catch (e) { toast(e.message || 'Suppression impossible.'); }
    }));
  }

  // -------------------------------------------------------------------- suivi
  async function vueSuivi(z, g) {
    z.innerHTML = `<div class="panneau"><div class="vide">Chargement du suivi…</div></div>`;
    const [tous, travaux, mods] = await Promise.all([
      B.elevesDuGroupe(g.id), B.suivi(g.id), chargerActivites(),
    ]);
    // Sous un demi-groupe, seuls ses élèves : tableau, repérage, ramassage des copies et export.
    const eleves = tous.filter((e) => dansDemi(g, e));
    const deDemi = demiActif ? ` — ${nomDemi(g, demiActif)}` : '';
    // Seules les activités notées apparaissent : c'est le barème qui les y fait entrer.
    // Ordre des colonnes (07/10/2026, maquette validée par Tristan) : les séances d'entreprise D'ABORD, sous un
    // bandeau par entreprise (logo, nom, repli d'un clic), puis les autres activités sous le nom de leur famille.
    // Le CSV suit le même ordre.
    const toutesNotees = mods.map((m) => m.meta).filter((m) => m.bareme);
    const estEnt = (m) => /^ENT-/.test(String(m.code || ''));
    const bandes = [
      ...entreprisesDe(toutesNotees.filter(estEnt).map((meta) => ({ meta }))).map((e) => ({
        id: 'ent-' + e.id, nom: e.nom, logo: e.logo, ent: true, cols: e.acts.map((a) => a.meta) })),
      ...famillesDe(toutesNotees.filter((m) => !estEnt(m))),
    ];
    const notees = bandes.flatMap((b) => b.cols);
    // Celles que le noyau ne sait pas corriger (scénario sur Padlet, oral, dossier
    // papier…) déclarent `notation: 'prof'` : leur colonne devient un champ de saisie.
    const aLaMain = (m) => m.notation === 'prof';
    const par = {};
    travaux.forEach((t) => { (par[t.uid] = par[t.uid] || {})[t.aid] = t; });
    // Séances à base privée d'élève : celles où l'on peut se retrouver bloqué.
    const seancesBase = mods.map((m) => m.meta)
      .filter((m) => m.portee === 'eleve' && m.immersif)
      .sort((a, b) => String(a.code).localeCompare(String(b.code), 'fr', { numeric: true }));
    const metasTous = mods.map((m) => m.meta);
    const verrouillables = seancesBase.filter((m) => m.precedente);

    const cellule = (e, m) => {
      const t = par[e.uid]?.[m.id];
      if (aLaMain(m)) {
        return `<td class="num col-saisie">
          <input type="number" class="note-saisie" data-uid="${ech(e.uid)}" data-aid="${ech(m.id)}"
            data-max="${m.bareme}" min="0" max="${m.bareme}" step="0.5"
            value="${t && typeof t.meilleur === 'number' ? t.meilleur : ''}"
            aria-label="${ech(m.code)} — ${ech(e.nom)} ${ech(e.prenom)}"
            title="Note sur ${m.bareme}. Laisser vide pour effacer.">
        </td>`;
      }
      // Évaluation en copie rendue (core/copie.js) : une copie rendue ou ramassée affiche sa
      // note, la mention et une croix pour la ROUVRIR ; une copie pas encore rendue offre
      // « ramasser » à côté du tiret (le 0 de l'élève présent reste possible).
      if (estCopie(m) && estRendue(t)) {
        const max = t.max || m.bareme;
        const part = max > 0 ? t.meilleur / max : 0;
        const classe = part >= 0.7 ? 'juste' : part < 0.4 ? 'faux' : '';
        const lu = noteConvertie(m)
          ? `${formaterNote(noteSur20(t.meilleur, max))}<span class="note">/${BAREME_AFFICHE}</span>`
          : `${t.meilleur}/${max}`;
        return `<td class="num ${classe} copie-cell" title="${t.meilleur} sur ${max} — copie ${ech(libelleRendu(t))}">${lu}
          <span class="note copie-mention" data-copie-mention>${t.ramasse ? 'ramassée' : 'rendue'}</span>
          <button type="button" class="btn-copie-rouvrir" data-copie-rouvrir data-uid="${ech(e.uid)}" data-aid="${ech(m.id)}"
            title="Rouvrir la copie : la note est effacée, l'élève peut reprendre et rendre de nouveau"
            aria-label="Rouvrir la copie — ${ech(m.code)} — ${ech(e.nom)} ${ech(e.prenom)}">×</button></td>`;
      }
      const ramasserBtn = estCopie(m)
        ? ` <button type="button" class="btn-ramasser" data-copie-ramasser data-uid="${ech(e.uid)}" data-aid="${ech(m.id)}"
            title="Ramasser la copie : elle est notée dans l'état où l'élève l'a laissée, et figée."
            aria-label="Ramasser la copie — ${ech(m.code)} — ${ech(e.nom)} ${ech(e.prenom)}">ramasser</button>` : '';
      // Pas de score : l'élève n'a rien rendu. Un clic sur le tiret met 0 — cas de l'élève
      // présent qui n'a rien fait (demande de Tristan, 02/10/2026). Un absent garde son tiret,
      // et une séance pas faite ne compte pas dans la moyenne par compétence ; un 0, si.
      if (!t) {
        return `<td class="num note"><button type="button" class="btn-zero" data-uid="${ech(e.uid)}"
          data-aid="${ech(m.id)}" title="Pas de note. Cliquer pour mettre 0 (élève présent, rien fait)."
          aria-label="Mettre 0 — ${ech(m.code)} — ${ech(e.nom)} ${ech(e.prenom)}">—</button>${ramasserBtn}</td>`;
      }
      // Un 0 posé par l'enseignant : il se lit comme tel et s'efface d'un clic. Si l'élève fait
      // la séance plus tard, sa vraie note le remplace (le meilleur score est retenu).
      if (t.parProf && t.meilleur === 0) {
        const lu = noteConvertie(m) ? `0<span class="note">/${BAREME_AFFICHE}</span>` : `0/${t.max || m.bareme}`;
        return `<td class="num faux zero-pose" title="0 mis par l'enseignant : élève présent, rien fait.">${lu}
          <span class="note">posé</span>
          <button type="button" class="btn-zero-eff" data-uid="${ech(e.uid)}" data-aid="${ech(m.id)}"
            title="Effacer ce 0" aria-label="Effacer le 0 — ${ech(m.code)} — ${ech(e.nom)} ${ech(e.prenom)}">×</button></td>`;
      }
      // Le `max` enregistré avec le score fait foi : un module dont le nombre d'exercices
      // a changé depuis garde ainsi des notes comparables. Le barème du module ne sert
      // que de secours pour les scores écrits avant que le `max` soit transmis.
      const max = t.max || m.bareme;
      const part = max > 0 ? t.meilleur / max : 0;
      const classe = part >= 0.7 ? 'juste' : part < 0.4 ? 'faux' : '';

      // Les jalons d'un environnement d'entreprise ne sont pas une note : « 3 / 3 » est
      // l'information juste, et c'est elle qu'on affiche. Voir `core/notes.js`.
      if (!noteConvertie(m)) {
        // Les sorties de page pendant une question (questions au fil) : en infobulle, s'il y en a eu.
        const so = sortiesDe(t.detail && t.detail.indicateurs && t.detail.indicateurs[m.id]);
        return `<td class="num ${classe}"${so ? ` title="${ech(so.phrase)}"` : ''}>${t.meilleur}/${max}</td>`;
      }

      // Séance d'entreprise notée sur 20 (07/10/2026) : plus de « (N) tentatives » — chaque sauvegarde en
      // ajoutait une, le nombre ne disait rien. À la place, le nombre de corrections après le premier bilan
      // (`indicateurs[séance].corrections`, lot A du brief SMOBY-retours-classe-5.1), seulement s'il y en a.
      if (estEnt(m)) {
        const ind = t.detail && t.detail.indicateurs && t.detail.indicateurs[m.id];
        const n = (ind && ind.corrections) || 0;
        const corr = n ? `corrigé ${n} fois${n > 1 ? ' (seule la 1re correction compte dans la note)' : ''}` : 'jamais corrigé';
        const so = sortiesDe(ind);
        return `<td class="num ${classe}" title="${ech(`${formaterNote(t.meilleur)} sur ${max} — ${corr}${so ? `
${so.phrase}` : ''}`)}"
          >${formaterNote(noteSur20(t.meilleur, max))}<span class="note">/${BAREME_AFFICHE}</span>${
          n ? `<span class="suivi-corrige" data-corrections="${n}">corrigé ${n}×</span>` : ''}</td>`;
      }

      // Note sur 20. Le score brut reste accessible en infobulle : l'enseignant veut
      // souvent savoir combien d'exercices ont été réussis, pas seulement la note.
      return `<td class="num ${classe}"
        title="${t.meilleur} sur ${max} — ${t.tentatives} tentative${t.tentatives > 1 ? 's' : ''}"
        >${formaterNote(noteSur20(t.meilleur, max))}<span class="note">/${BAREME_AFFICHE}</span>
        <span class="note">(${t.tentatives})</span></td>`;
    };

    // Le REPÉRAGE (2de, lot 6 de MOTEUR-2de-S1) : pour chaque séance d'entreprise où des élèves en ont,
    // le temps passé, les aides ouvertes (mots cliquables, rappels) et les jalons justes au premier
    // jugement. Rangé par le moteur dans le détail du score (`detail.indicateurs[idSeance]`) ; lecture
    // seule, sans export, sans recommandation : l'enseignant règle lui-même standard / confirmé.
    const minutes = (s) => (s >= 60 ? `${Math.round(s / 60)} min` : s > 0 ? '< 1 min' : '—');
    // Les SORTIES DE PAGE pendant une question (questions au fil, §4.8 bis du brief MOTEUR-questions-au-fil, 08/10/2026) :
    // rangées par le moteur avec chaque réponse (`indicateurs[séance].questions[q] = { sorties, horsPage }`). Une ligne
    // seulement s'il y en a eu ; jamais un classement.
    function sortiesDe(ind) {
      const Q = ind && ind.questions;
      if (!Q) return null;
      const L = Object.entries(Q).filter(([k, x]) => k[0] !== '@' && x && x.sorties > 0);
      if (!L.length) return null;
      const fois = L.reduce((a, [, x]) => a + x.sorties, 0), s = L.reduce((a, [, x]) => a + (x.horsPage || 0), 0);
      const duree = s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ` ${String(s % 60).padStart(2, '0')}` : ''}` : `${s} s`;
      const court = `${L.length} question${L.length > 1 ? 's' : ''} (${fois} fois, ${duree})`;
      return { court, phrase: `a quitté la page pendant ${court}`, questions: L.map(([k]) => k) };
    }
    const somme = (o) => Object.values(o || {}).reduce((a, n) => a + n, 0);
    const liste = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(', ');
    function sectionReperage() {
      const blocs = notees.filter((m) => m.portee === 'eleve' && m.immersif).map((m) => {
        const rep = (e) => { const t = par[e.uid]?.[m.id]; return t && t.detail && t.detail.indicateurs && t.detail.indicateurs[m.id]; };
        if (!eleves.some(rep)) return '';
        // « Documents ouverts » : seulement pour une séance qui joint des documents (04/10/2026). « 4 / 6 » =
        // 4 documents différents ouverts sur 6 ; le survol dit lesquels et combien de fois.
        const docsDe = (e) => { const t = par[e.uid]?.[m.id]; return t && t.detail && t.detail.documents; };
        const avecDocs = eleves.some(docsDe);
        // La colonne des sorties de page : seulement pour une séance qui pose des questions au fil.
        const avecQuestions = eleves.some((e) => { const r = rep(e); return !!(r && r.questions); });
        const caseSorties = (r) => {
          if (!avecQuestions) return '';
          const so = sortiesDe(r);
          return so ? `<td class="num" data-rep="sorties" title="${ech(`Questions concernées : ${so.questions.join(', ')}`)}">${ech(so.court)}</td>`
            : '<td class="num" data-rep="sorties">—</td>';
        };
        const caseDocs = (e, r) => {
          if (!avecDocs) return '';
          const D = docsDe(e);
          if (!D) return '<td class="num" data-rep="docs">—</td>';
          const ouverts = Object.entries(r.docs || {}).filter(([id, n]) => n > 0 && D.noms[id]);
          const titre = ouverts.length ? liste(Object.fromEntries(ouverts.map(([id, n]) => [D.noms[id], n]))) : 'Aucun document ouvert';
          return `<td class="num" data-rep="docs" title="${ech(titre)}">${ouverts.length} / ${D.total}</td>`;
        };
        const lignes = eleves.map((e) => {
          const r = rep(e);
          if (!r) return `<tr><td>${ech(e.nom)} ${ech(e.prenom)}</td><td class="num note" colspan="${4 + (avecDocs ? 1 : 0) + (avecQuestions ? 1 : 0)}">—</td></tr>`;
          const reel = par[e.uid][m.id].detail.quai && par[e.uid][m.id].detail.quai.reel;
          const p = Object.entries(r.premier || {});
          // Les jalons ratés sont nommés par leur TITRE (rangé par le moteur avec la note, `detail.titres`, 07/10/2026),
          // un par ligne ; l'identifiant ne sert plus que pour une note écrite avant. Les justes sont seulement comptés.
          const titres = par[e.uid][m.id].detail.titres || {};
          const ok = p.filter(([, st]) => st === 'ok').map(([k]) => k);
          const ko = p.filter(([, st]) => st !== 'ok').map(([k]) => titres[k] || k);
          const bulle = (ko.length ? `Ratés au premier jugement :\n${ko.map((x) => `– ${x}`).join('\n')}` : 'Aucun jalon raté au premier jugement.')
            + `\nJustes du premier coup : ${ok.length} sur ${p.length}.`;
          return `<tr data-rep-eleve="${ech(e.uid)}"><td>${ech(e.nom)} ${ech(e.prenom)}</td>
            <td class="num" data-rep="temps">${minutes(r.temps || 0)}${reel ? `<span class="note"> (quai : ${minutes(reel)})</span>` : ''}</td>
            <td class="num" data-rep="mots" title="${ech(liste(r.mots))}">${somme(r.mots)}</td>
            <td class="num" data-rep="aides" title="${ech(liste(r.aides))}">${somme(r.aides)}</td>${caseDocs(e, r)}
            <td class="num" data-rep="premier" title="${ech(bulle)}">${p.length ? `${ok.length} / ${p.length}` : '—'}</td>${caseSorties(r)}</tr>`;
        }).join('');
        return `<details class="reperage" data-reperage="${ech(m.id)}"><summary>${ech(m.code)} — ${ech(m.titre)}</summary>
          <div style="overflow:auto"><table>
            <thead><tr><th>Élève</th><th class="num">Temps passé</th><th class="num">Mots ouverts</th>
              <th class="num">Autres aides</th>${avecDocs ? '<th class="num">Documents ouverts</th>' : ''}<th class="num">Jalons justes du premier coup</th>${
                avecQuestions ? '<th class="num">Sorties de page pendant une question</th>' : ''}</tr></thead>
            <tbody>${lignes}</tbody></table></div></details>`;
      }).join('');
      if (!blocs) return '';
      return `<section class="panneau" id="reperage">
        <strong>Repérage des élèves (vous seul le voyez)</strong>
        <p class="note">Par séance : le temps passé l'écran ouvert, les mots cliquables et les autres aides ouverts,
          les documents ouverts (s'il y en a : ouverts, pas forcément lus),
          et les jalons justes au premier jugement (premier envoi, premier dépôt, première validation) sur les
          jalons déjà jugés ; pour une séance à questions, les sorties de page pendant une question (onglet quitté,
          fenêtre quittée plus de 3 s : sans effet sur la note). Survolez une case pour le détail. Rien n'est calculé à votre place : vous réglez
          vous-même le niveau standard / confirmé de chaque élève.</p>
        ${blocs}</section>`;
    }

    // Le tableau du suivi : deux rangées d'en-tête (bandeau entreprise ou famille, puis code), figées en haut,
    // et la colonne des noms figée à gauche (CSS `.suivi-cadre`). Une entreprise repliée tient en une colonne.
    const titreCol = (m) => `${m.titre}${aLaMain(m) ? ' — note saisie à la main'
      : noteConvertie(m) ? ` — note sur ${BAREME_AFFICHE}, calculée` : ' — jalons franchis, ce n\'est pas une note'}`;
    const debut = (html) => html.replace('<td class="', '<td class="suivi-debut ');
    function tableauSuivi() {
      let r1 = '<th class="suivi-nom" scope="col">Élève</th>';
      let r2 = `<th class="suivi-nom" scope="col"><span class="note">${eleves.length} élève${eleves.length > 1 ? 's' : ''}</span></th>`;
      bandes.forEach((b) => {
        const plie = b.ent && suiviPlies.has(b.id);
        const n = plie ? 1 : b.cols.length;
        r1 += `<th class="suivi-bande suivi-debut" colspan="${n}" scope="colgroup" data-bande="${ech(b.id)}">${b.ent
          ? `<button type="button" class="suivi-ent" data-replier="${ech(b.id)}" aria-expanded="${!plie}" aria-label="${ech(b.nom)}"
              title="${plie ? 'Déplier' : 'Replier'} les séances ${ech(b.nom)}">${b.logo
              ? `<span class="suivi-logo"><img src="${ech(b.logo)}" alt=""></span>` : ''}${plie ? '' : `<span>${ech(b.nom)}</span>`}<span
              class="suivi-pli" aria-hidden="true">${plie ? '▸' : '▾'}</span></button>`
          : ech(b.nom)}</th>`;
        if (plie) {
          r2 += `<th class="suivi-debut suivi-plie" scope="col" title="${ech(b.nom)} : ${b.cols.length} séance${b.cols.length > 1 ? 's' : ''} repliée${b.cols.length > 1 ? 's' : ''}">…</th>`;
        } else {
          b.cols.forEach((m, i) => {
            r2 += `<th class="${aLaMain(m) ? 'col-saisie ' : ''}${i === 0 ? 'suivi-debut' : ''}" scope="col" title="${ech(titreCol(m))}">
              ${ech(m.code)}${aLaMain(m) ? `<span class="note"> /${m.bareme}</span>`
                : noteConvertie(m) ? `<span class="note"> /${BAREME_AFFICHE}</span>` : ''}</th>`;
          });
        }
      });
      const lignes = eleves.map((e) => `<tr><td class="suivi-nom" title="${ech(e.nom)} ${ech(e.prenom)}">${ech(e.nom)} ${ech(e.prenom)}</td>${
        bandes.map((b) => {
          if (b.ent && suiviPlies.has(b.id)) {
            const faites = b.cols.filter((m) => par[e.uid]?.[m.id]).length;
            return `<td class="num suivi-debut suivi-plie" data-plie="${ech(b.id)}"
              title="${ech(b.nom)} : ${faites} séance${faites > 1 ? 's' : ''} sur ${b.cols.length}">${faites}/${b.cols.length}</td>`;
          }
          return b.cols.map((m, i) => (i === 0 ? debut(cellule(e, m)) : cellule(e, m))).join('');
        }).join('')}</tr>`).join('');
      return `<table><thead><tr class="suivi-r1">${r1}</tr><tr class="suivi-r2">${r2}</tr></thead><tbody>${lignes}</tbody></table>`;
    }

    z.innerHTML = `
      <section class="panneau">
        <div class="rangee" style="margin-bottom:12px">
          <strong>Suivi de ${ech(g.nom + deDemi)}</strong>
          ${choixDemi(g, 'Élèves :')}
          <span class="pousse"><button class="btn btn-s" id="btnCsvSuivi">Exporter en CSV</button></span>
        </div>
        ${notees.length === 0 ? `<div class="vide">Aucune activité notée pour l'instant.</div>` : `
        <div class="suivi-cadre" id="suiviCadre">${tableauSuivi()}</div>
        <p class="note">Les séances d'entreprise viennent en premier ; un clic sur le nom d'une
          entreprise replie ses séances (le nombre de séances faites reste affiché).
          Les activités corrigées automatiquement sont ramenées à une
          <strong>note sur ${BAREME_AFFICHE}</strong>, quel que soit leur nombre d'exercices ;
          survolez une note pour voir le détail. Entre parenthèses : le nombre de tentatives
          (pas pour les séances d'entreprise). Le score retenu est le meilleur.
          Sous une note de séance d'entreprise, « corrigé 2× » : l'élève a corrigé deux fois après
          son premier bilan ; seule la première correction compte dans la note.
          ${notees.some((m) => !noteConvertie(m) && !aLaMain(m)) ? `Les environnements
            d'entreprise affichent des jalons franchis, pas une note.` : ''}
          Un élève présent qui n'a rien fait : cliquez sur son tiret « — » pour lui mettre 0 ;
          la croix « × » efface ce 0, et s'il fait la séance plus tard sa note le remplace.
          ${notees.some(aLaMain) ? `Les colonnes en fond clair sont notées à la main : tapez la note,
            elle s'enregistre en quittant la case. Une case vidée efface la note.` : ''}</p>`}
        ${!notees.some(estCopie) || eleves.length === 0 ? '' : `
        <div class="copie-ramassage" id="copieRamassage">
          <strong>Évaluations : copies non rendues</strong>
          <p class="note">Une évaluation ne compte que la copie rendue, une seule fois. En fin d'heure,
            ramassez les copies que les élèves n'ont pas rendues : chacune est notée dans l'état où
            l'élève l'a laissée, puis figée. La croix « × » d'une copie la rouvre (note effacée,
            l'élève reprend son travail).</p>
          <div class="rangee">${notees.filter(estCopie).map((m) => `
            <button class="btn btn-s" data-copie-tout="${ech(m.id)}">Ramasser les copies de ${ech(m.code + (demiActif ? ` (${nomDemi(g, demiActif)})` : ''))}</button>`).join('')}
          </div>
        </div>`}
      </section>
      ${sectionReperage()}
      ${seancesBase.length === 0 || eleves.length === 0 ? '' : `
      <section class="panneau" id="porteSortie">
        <strong>Élève bloqué : remettre sa base au début d'une séance</strong>
        <p class="note">La base de l'élève revient à ce qu'elle était <strong>à la fin de la séance
          précédente</strong> (ce qu'il a réellement fait), ou à la base de départ s'il n'a pas validé
          la précédente ; à la base de départ pour une entreprise à une base par séance (Smoby). Les scores de la séance choisie et des suivantes sont effacés du suivi ;
          les séances d'avant restent. Demandez d'abord à l'élève de quitter la séance, puis de la
          rouvrir.</p>
        <div class="rangee">
          <select id="razEleve" aria-label="Élève">${eleves.map((e) =>
            `<option value="${ech(e.uid)}">${ech(e.nom)} ${ech(e.prenom)}</option>`).join('')}</select>
          <select id="razSeance" aria-label="Séance">${seancesBase.map((m) =>
            `<option value="${ech(m.id)}">${ech(m.code)} — ${ech(m.titre)}</option>`).join('')}</select>
          <button class="btn btn-s" id="btnRaz">Remettre au début</button>
          ${verrouillables.length ? `<select id="debSeance" aria-label="Séance à débloquer">${verrouillables.map((m) =>
            `<option value="${ech(m.id)}">${ech(m.code)}</option>`).join('')}</select>
          <button class="btn btn-s" id="btnDebloquer"
            title="Ouvre la séance à cet élève sans qu'il ait validé la précédente">Débloquer cette séance</button>` : ''}
        </div>
      </section>`}`;

    brancherChoixDemi(z);

    // Replier / déplier une entreprise : seul le tableau se redessine (aucune lecture de plus en base) ; ses
    // boutons sont rebranchés, la position de défilement est gardée, et le focus revient au bandeau au clavier.
    const cadre = z.querySelector('#suiviCadre');
    cadre?.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-replier]');
      if (!b) return;
      const id = b.dataset.replier;
      if (suiviPlies.has(id)) suiviPlies.delete(id); else suiviPlies.add(id);
      const { scrollLeft, scrollTop } = cadre;
      cadre.innerHTML = tableauSuivi();
      cadre.scrollLeft = scrollLeft; cadre.scrollTop = scrollTop;
      brancherCellules(cadre);
      if (ev.detail === 0) cadre.querySelector(`[data-replier="${CSS.escape(id)}"]`)?.focus();
    });

    function brancherCellules(racine) {
      racine.querySelectorAll('.note-saisie').forEach((inp) => {
        // Dernière valeur acceptée : c'est elle qu'on restaure si la saisie est refusée,
        // pas la valeur d'ouverture de l'écran.
        let dernier = inp.value;
        inp.addEventListener('change', async () => {
          const { uid, aid } = inp.dataset;
          const max = Number(inp.dataset.max);
          const brut = inp.value.trim().replace(',', '.');
          try {
            if (brut === '') {
              await B.poserNote(g.id, uid, aid, null);
              if (par[uid]) delete par[uid][aid];
              toast('Note effacée.');
            } else {
              const note = Number(brut);
              if (!isFinite(note) || note < 0 || note > max) {
                inp.value = dernier;
                return toast(`La note doit être comprise entre 0 et ${max}.`);
              }
              const t = await B.poserNote(g.id, uid, aid, { score: note, max });
              (par[uid] = par[uid] || {})[aid] = t;
              inp.value = note;
              toast('Note enregistrée.');
            }
            dernier = inp.value;
            inp.classList.add('enregistre');
            setTimeout(() => inp.classList.remove('enregistre'), 900);
          } catch (e) {
            inp.value = dernier;
            toast("La note n'a pas pu être enregistrée.");
          }
        });
      });

      // Mettre 0 / effacer le 0. Le barème enregistré est celui du module, pour que le 0 se
      // convertisse comme n'importe quel score (0 sur 20, ou 0 jalon sur 3).
      racine.querySelectorAll('.btn-zero').forEach((b) => b.addEventListener('click', async () => {
        const m = notees.find((x) => x.id === b.dataset.aid);
        if (!m) return;
        try {
          await B.poserNote(g.id, b.dataset.uid, m.id, { score: 0, max: m.bareme });
          toast(`0 mis en ${m.code}.`);
          await vueSuivi(z, g);
        } catch (e) { toast("Le 0 n'a pas pu être enregistré."); }
      }));
      racine.querySelectorAll('.btn-zero-eff').forEach((b) => b.addEventListener('click', async () => {
        try {
          await B.poserNote(g.id, b.dataset.uid, b.dataset.aid, null);
          toast('0 effacé.');
          await vueSuivi(z, g);
        } catch (e) { toast("Le 0 n'a pas pu être effacé."); }
      }));

      // Les copies (core/copie.js). Le module de l'activité sait noter une base : c'est lui qui
      // ramasse, avec les mêmes jalons que la remise par l'élève.
      const moduleDe = (aid) => mods.find((x) => x.meta.id === aid);
      const MOTIF = { rendue: 'déjà rendue', vide: "l'élève n'a pas ouvert la séance", module: "cette activité ne sait pas se noter" };
      racine.querySelectorAll('[data-copie-ramasser]').forEach((b) => b.addEventListener('click', async () => {
        const module = moduleDe(b.dataset.aid);
        const eleve = eleves.find((x) => x.uid === b.dataset.uid);
        if (!module || !eleve) return;
        b.disabled = true;
        try {
          const r = await ramasser(B, { gid: g.id, eleve, module });
          toast(r.ok ? `Copie de ${eleve.prenom} ramassée.` : `Rien à ramasser : ${MOTIF[r.raison] || r.raison}.`);
          await vueSuivi(z, g);
        } catch (e) { b.disabled = false; toast("La copie n'a pas pu être ramassée."); }
      }));
      racine.querySelectorAll('[data-copie-tout]').forEach((b) => b.addEventListener('click', async () => {
        const module = moduleDe(b.dataset.copieTout);
        if (!module) return;
        b.disabled = true;
        const n = { ok: 0, rendue: 0, vide: 0, erreur: 0 };
        for (const eleve of eleves) {
          try {
            const r = await ramasser(B, { gid: g.id, eleve, module });
            if (r.ok) n.ok++; else n[r.raison] = (n[r.raison] || 0) + 1;
          } catch (e) { n.erreur++; }
        }
        toast(`${module.meta.code} : ${n.ok} copie(s) ramassée(s), ${n.rendue} déjà rendue(s), `
          + `${n.vide} élève(s) sans travail${n.erreur ? `, ${n.erreur} en erreur` : ''}.`, 6000);
        await vueSuivi(z, g);
      }));
      racine.querySelectorAll('[data-copie-rouvrir]').forEach((b) => b.addEventListener('click', async () => {
        const m = notees.find((x) => x.id === b.dataset.aid);
        const el = eleves.find((x) => x.uid === b.dataset.uid);
        if (!m || !el) return;
        if (!confirmer(`Rouvrir la copie de ${el.prenom} ${el.nom} en ${m.code} ?\n\n`
          + `Sa note est effacée. Il reprend son travail là où il l'a laissé, et devra rendre de nouveau.`)) return;
        try {
          await rouvrir(B, { gid: g.id, uid: el.uid, aid: m.id });
          toast(`Copie de ${el.prenom} rouverte.`);
          await vueSuivi(z, g);
        } catch (e) { toast("La copie n'a pas pu être rouverte."); }
      }));
    }
    brancherCellules(z);

    z.querySelector('#btnRaz')?.addEventListener('click', async () => {
      const uid = z.querySelector('#razEleve').value;
      const aid = z.querySelector('#razSeance').value;
      const m = seancesBase.find((x) => x.id === aid);
      const el = eleves.find((e) => e.uid === uid);
      if (!m || !el) return;
      const touchees = seancesDepuis(metasTous, m);
      // Base par séance (Smoby) : rien de la séance précédente n'est repris (core/parcours.js).
      const prec = m.precedente && metasTous.find((x) => x.id === m.precedente);
      const depart = prec && memeBase(prec, m)
        ? 'Il repart de ce qu\'il avait à la fin de la séance précédente.'
        : 'Il repart de la base de départ de chaque séance.';
      if (!confirmer(`Remettre la base de ${el.prenom} ${el.nom} au début de ${m.code} ?\n\n`
        + `Son travail dans ${touchees.map((x) => x.code).join(', ')} est effacé et leurs scores `
        + `disparaissent du suivi. ${depart}`)) return;
      try {
        // Un drapeau que le poste de l'élève lira à sa prochaine ouverture : l'enseignant
        // n'écrit jamais dans la base privée de l'élève.
        await B.poserNote(g.id, uid, '_reprise-' + m.id, { score: 0, max: 0 });
        for (const x of touchees) {
          await B.poserNote(g.id, uid, x.id, null);
          if (par[uid]) delete par[uid][x.id];
          // Un déblocage manuel des séances d'après tombe avec elles ; celui de la séance choisie reste.
          if (x.id !== m.id) await B.poserNote(g.id, uid, '_debloque-' + x.id, null);
        }
        toast(`Base de ${el.prenom} remise au début de ${m.code}.`);
        await vueSuivi(z, g);
      } catch (e) {
        toast("La remise à zéro n'a pas pu être enregistrée.");
      }
    });

    z.querySelector('#btnDebloquer')?.addEventListener('click', async () => {
      const uid = z.querySelector('#razEleve').value;
      const m = verrouillables.find((x) => x.id === z.querySelector('#debSeance').value);
      const el = eleves.find((e) => e.uid === uid);
      if (!m || !el) return;
      if (!confirmer(`Ouvrir ${m.code} à ${el.prenom} ${el.nom} sans qu'il ait validé la séance précédente ?\n\n`
        + `Il repartira de la base de départ de cette séance.`)) return;
      try {
        await B.poserNote(g.id, uid, '_debloque-' + m.id, { score: 0, max: 0 });
        toast(`${m.code} est ouverte à ${el.prenom}.`);
      } catch (e) {
        toast("Le déblocage n'a pas pu être enregistré.");
      }
    });

    z.querySelector('#btnCsvSuivi')?.addEventListener('click', () => {
      // L'en-tête dit sur quoi chaque colonne est notée : un CSV se relit des mois plus
      // tard, souvent par quelqu'un qui n'a pas le site sous les yeux.
      const champs = [{ cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' },
        ...notees.map((m) => ({
          cle: m.id,
          label: noteConvertie(m) || aLaMain(m) ? `${m.code} /${aLaMain(m) ? m.bareme : BAREME_AFFICHE}`
            : `${m.code} (jalons)`,
        }))];
      const lignes = eleves.map((e) => {
        const o = { nom: e.nom, prenom: e.prenom };
        notees.forEach((m) => {
          const t = par[e.uid]?.[m.id];
          if (!t || typeof t.meilleur !== 'number') { o[m.id] = ''; return; }
          o[m.id] = noteConvertie(m)
            ? formaterNote(noteSur20(t.meilleur, t.max || m.bareme))
            : t.meilleur;
        });
        return o;
      });
      telecharger(`suivi-${g.id}${suffixeDemi(g)}.csv`, versCSV(lignes, champs));
    });
  }

  // -------------------------------------------------------------- compétences
  // La note qui compte : une moyenne PONDÉRÉE par compétence, le poids venant du temps
  // pédagogique de chaque séance (voir core/competences.js). Le suivi par séance, juste
  // au-dessus dans les onglets, ne change pas : les jalons y restent des jalons.
  async function vueCompetences(z, g) {
    z.innerHTML = `<div class="panneau"><div class="vide">Chargement des compétences…</div></div>`;
    const [tous, travaux, mods] = await Promise.all([
      B.elevesDuGroupe(g.id), B.suivi(g.id), chargerActivites(),
    ]);
    const eleves = tous.filter((e) => dansDemi(g, e));
    const deDemi = demiActif ? ` — ${nomDemi(g, demiActif)}` : '';
    const comps = seancesParCompetence(mods.map((m) => m.meta));
    // En 2de seulement : une moyenne par spécialité (logistique, transport, gestion), même calcul.
    const specs = g.niveau === '2de' ? seancesParSpecialite(mods.map((m) => m.meta)) : [];
    const coefs = coefsDuGroupe(g);
    const par = {};
    travaux.forEach((t) => { (par[t.uid] = par[t.uid] || {})[t.aid] = t; });

    const ligneDetail = (d) => `${d.meta.code} (${TEMPS[d.temps].toLowerCase()}, coef ${formaterNote(d.coef)}) : `
      + (d.note === null ? 'pas faite' : `${formaterNote(d.note)} / ${BAREME_AFFICHE}`);

    // `attr` : l'attribut qui porte le code de la colonne (`data-comp`, ou `data-spe` par spécialité).
    const cellule = (e, c, attr = 'data-comp') => {
      const b = moyenneCompetence(c.seances, par[e.uid], coefs);
      const titre = ech(b.detail.map(ligneDetail).join('\n'));
      if (b.moyenne === null) return `<td class="num note" title="${titre}">—</td>`;
      const part = b.moyenne / BAREME_AFFICHE;
      const classe = part >= 0.7 ? 'juste' : part < 0.4 ? 'faux' : '';
      return `<td class="num ${classe}" title="${titre}" ${attr}="${ech(c.code)}" data-uid="${ech(e.uid)}"
        >${formaterNote(b.moyenne)}<span class="note">/${BAREME_AFFICHE}</span>
        <span class="note">(${b.nbNotes}/${c.seances.length})</span></td>`;
    };

    z.innerHTML = `
      <section class="panneau" id="panCoefs">
        <strong>Coefficients de ${ech(g.nom)}</strong>
        <p class="note">Guidage, entraînement et erreur induite sont des évaluations
          <strong>formatives</strong> (coefficient ${COEFS_DEFAUT.guidage} par défaut) ; l'évaluation est
          <strong>sommative</strong> (coefficient ${COEFS_DEFAUT.evaluation} par défaut). Les coefficients
          valent pour ce groupe seulement. Un coefficient 0 retire ce temps des moyennes.</p>
        <div class="rangee">
          ${Object.entries(TEMPS).map(([k, l]) => `<label>${ech(l)}
            <input type="number" class="note-saisie coef-saisie" data-temps="${k}" min="0" max="10"
              step="0.5" value="${coefs[k]}" aria-label="Coefficient ${ech(l)}"></label>`).join('')}
          <button class="btn btn-s btn-p" id="btnCoefs">Enregistrer</button>
          <button class="btn btn-s" id="btnCoefsDefaut">Revenir aux coefficients par défaut</button>
        </div>
      </section>
      <section class="panneau">
        <div class="rangee" style="margin-bottom:12px">
          <strong>Notes par compétence — ${ech(g.nom + deDemi)}</strong>
          ${choixDemi(g, 'Élèves :')}
          <span class="pousse"><button class="btn btn-s" id="btnCsvComp">Exporter en CSV</button></span>
        </div>
        ${comps.length === 0 ? `<div class="vide">Aucune séance ne déclare encore de compétence.</div>`
          : eleves.length === 0 ? `<div class="vide">Aucun élève dans ${demiActif ? 'ce demi-groupe' : 'ce groupe'}.</div>` : `
        <div style="overflow:auto"><table id="tabComp">
          <thead><tr><th>Élève</th>${comps.map((c) => `
            <th title="${ech(c.libelle)}">${ech(c.code)}<span class="note"> /${BAREME_AFFICHE}</span></th>`).join('')}</tr></thead>
          <tbody>${eleves.map((e) => `<tr>
            <td>${ech(e.nom)} ${ech(e.prenom)}</td>
            ${comps.map((c) => cellule(e, c)).join('')}
          </tr>`).join('')}</tbody>
        </table></div>
        <p class="note">Moyenne <strong>pondérée</strong> des séances faites, chacune ramenée sur
          ${BAREME_AFFICHE} — y compris les environnements en jalons (3 jalons sur 3 = ${BAREME_AFFICHE}).
          Une séance pas encore faite ne compte pas pour zéro : elle n'entre pas dans la moyenne.
          Entre parenthèses : séances faites sur séances de la compétence. Survolez une moyenne
          pour voir le détail. Une séance qui travaille deux compétences compte pour les deux.</p>`}
      </section>
      ${specs.length && eleves.length ? `
      <section class="panneau" id="panSpe">
        <strong>Moyennes par spécialité — ${ech(g.nom + deDemi)}</strong>
        <div style="overflow:auto"><table id="tabSpe">
          <thead><tr><th>Élève</th>${specs.map((c) => `
            <th data-spe="${ech(c.code)}">${ech(c.libelle)}<span class="note"> /${BAREME_AFFICHE}</span></th>`).join('')}</tr></thead>
          <tbody>${eleves.map((e) => `<tr>
            <td>${ech(e.nom)} ${ech(e.prenom)}</td>
            ${specs.map((c) => cellule(e, c, 'data-spe')).join('')}
          </tr>`).join('')}</tbody>
        </table></div>
        <p class="note">Même calcul que par compétence, sur toutes les séances de la spécialité.
          Une séance compte une seule fois dans une spécialité, même si elle y travaille deux
          compétences ; elle compte dans deux spécialités si ses compétences y sont. Codes
          « OTM- » : transport ; « AGO- » : gestion ; les autres : logistique.</p>
      </section>` : ''}
      ${comps.length === 0 ? '' : `
      <section class="panneau" id="panSeancesComp">
        <strong>Les séances de chaque compétence</strong>
        <table>
          <thead><tr><th>Compétence</th><th>Séances</th></tr></thead>
          <tbody>${comps.map((c) => `<tr>
            <td><strong>${ech(c.code)}</strong> ${ech(c.libelle)}</td>
            <td>${c.seances.map((m) => `${ech(m.code)} ${ech(m.titre)}
              <span class="note">· ${ech(TEMPS[m.temps].toLowerCase())}, coef ${formaterNote(coefs[m.temps])}</span>`).join('<br>')}</td>
          </tr>`).join('')}</tbody>
        </table>
        <p class="note">Les modules sans compétence (prise en main d'Excel, calculs commerciaux,
          quiz de calcul) restent dans le suivi de classe mais n'entrent dans aucune moyenne.</p>
      </section>`}`;

    brancherChoixDemi(z);

    // ---- coefficients
    async function enregistrer(nouv) {
      try {
        await B.majGroupe(g.id, { coefs: nouv });
        g.coefs = nouv;
        toast('Coefficients enregistrés.');
        await vueCompetences(z, g);
      } catch (e) {
        toast("Les coefficients n'ont pas pu être enregistrés.");
      }
    }
    z.querySelector('#btnCoefs').addEventListener('click', () => {
      const nouv = {};
      for (const inp of z.querySelectorAll('.coef-saisie')) {
        const v = Number(inp.value.trim().replace(',', '.'));
        if (inp.value.trim() === '' || !Number.isFinite(v) || v < 0 || v > 10) {
          inp.focus();
          return toast('Un coefficient doit être un nombre entre 0 et 10.');
        }
        nouv[inp.dataset.temps] = v;
      }
      enregistrer(nouv);
    });
    z.querySelector('#btnCoefsDefaut').addEventListener('click', () => enregistrer({ ...COEFS_DEFAUT }));

    // ---- export élève × compétence
    // Une ligne par élève et par compétence : c'est la forme qui se trie et se filtre dans un
    // tableur. Le détail des séances (temps, coefficient, note) tient dans une colonne, pour
    // que la ligne se relise seule, des mois plus tard.
    z.querySelector('#btnCsvComp').addEventListener('click', () => {
      const champs = [
        { cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' },
        { cle: 'comp', label: 'Compétence' }, { cle: 'libelle', label: 'Libellé' },
        { cle: 'seances', label: 'Séances (temps, coefficient, note sur 20)' },
        { cle: 'faites', label: 'Séances faites' },
        { cle: 'moyenne', label: `Moyenne pondérée /${BAREME_AFFICHE}` },
      ];
      const lignes = [];
      eleves.forEach((e) => comps.forEach((c) => {
        const b = moyenneCompetence(c.seances, par[e.uid], coefs);
        lignes.push({
          nom: e.nom, prenom: e.prenom, comp: c.code, libelle: c.libelle,
          seances: b.detail.map(ligneDetail).join(' | '),
          faites: `${b.nbNotes} sur ${c.seances.length}`,
          moyenne: b.moyenne === null ? '' : formaterNote(b.moyenne),
        });
      }));
      telecharger(`competences-${g.id}${suffixeDemi(g)}.csv`, versCSV(lignes, champs));
    });
  }

  // ------------------------------------------------------------------- séance
  async function vueSeance(z, g) {
    const mods = await chargerActivites();
    const metas = mods.map((m) => m.meta);
    const partagees = metas.filter((m) => m.portee !== 'eleve');
    const duNiveau = metas.filter((m) => !horsNiveau(m, g));
    const dAutresNiveaux = metas.filter((m) => horsNiveau(m, g));

    // Demi-groupe choisi : ses réglages contredisent ceux de la classe, ligne par ligne.
    const demi = demiActif || null;
    const nomD = demi ? nomDemi(g, demi) : '';
    const propreAuDemi = (m, d) => typeof g.ouvertsDemi?.[d]?.[m.id] === 'boolean';
    const ligneOuverture = (m) => {
      const visible = activiteVisible(m, g, demi);
      const force = forcage(m, g, demi);
      // D'où vient l'état de la ligne : sous un demi-groupe, « comme la classe » ou « réglé pour 1L1 »
      // (et le retour au réglage de la classe) ; sous « Toute la classe », les demi-groupes qui la contredisent.
      const origine = demi
        ? (propreAuDemi(m, demi)
          ? `<span class="etiq" data-origine="demi">réglé pour ${ech(nomD)}</span>
             <button type="button" class="btn btn-s" data-comme-classe="${ech(m.id)}"
               title="Effacer le réglage propre à ${ech(nomD)} : la séance suivra de nouveau la classe">revenir au réglage de la classe</button>`
          : `<span class="note" data-origine="classe">· comme la classe</span>`)
        : demisDe(g).filter((d) => propreAuDemi(m, d.id) && activiteVisible(m, g, d.id) !== visible)
          .map((d) => `<span class="etiq" data-contredit="${ech(d.id)}">${activiteVisible(m, g, d.id) ? 'ouverte' : 'fermée'} pour ${ech(d.nom)}</span>`).join('');
      // Une séance en préparation (`pret: false`) reste cachée aux élèves quoi qu'on coche : la
      // case est donc grisée. Avant le 02/10/2026 elle se laissait cocher, se redécochait aussitôt,
      // et un second clic enregistrait « fermée » sans que rien ne le montre — la séance restait
      // alors fermée le jour où elle passait prête.
      const prepa = !m.pret;
      return `<label class="choix${prepa ? ' choix-prepa' : ''}">
        <input type="checkbox" data-ouvre="${ech(m.id)}" ${visible ? 'checked' : ''} ${prepa ? 'disabled' : ''}>
        <span>
          <span class="etiq">${ech(m.code || m.id)}</span> ${ech(m.titre)}
          <span class="note">— ${ech(libelleNiveaux(m.niveaux))}${
            !m.bareme ? ''
            : m.notation === 'avancement' ? `, ${m.bareme} jalon${m.bareme > 1 ? 's' : ''}`
            : `, noté sur ${noteConvertie(m) ? BAREME_AFFICHE : m.bareme}`}</span>
          ${force === true && horsNiveau(m, g) ? `<span class="etiq" style="color:var(--terre)">ouverte hors niveau</span>` : ''}
          ${prepa ? `<span class="etiq etiq-prepa" title="Cachée aux élèves tant qu'elle n'est pas validée (pret: false). Vous pouvez l'essayer depuis l'accueil.">en préparation</span>` : ''}
          ${!prepa && force === false ? `<span class="etiq" style="color:var(--terre)">fermée</span>` : ''}
          ${!prepa && force === undefined && ouvertureParProf(m) ? `<span class="etiq" data-a-ouvrir title="Cette séance ne s'ouvre aux élèves que quand vous la cochez pour ce groupe.">à ouvrir : cochez-la</span>` : ''}
          ${prepa ? '' : origine}
        </span>
      </label>`;
    };

    z.innerHTML = `
      <section class="panneau">
        <h2>Ouverture des activités</h2>
        ${choixDemi(g, 'Réglages pour :')}
        <p class="note">Groupe <strong>${ech(g.nom)}</strong>, niveau ${ech(libelleNiveau(g.niveau))}.
          Les activités de ce niveau sont proposées d'office ; vous pouvez en fermer une, ou en
          ouvrir une d'un autre niveau. Celles marquées « à ouvrir » restent fermées aux élèves
          tant que vous ne les cochez pas.</p>
        ${demi ? `<p class="note">Vous réglez <strong>${ech(nomD)}</strong> seulement. Une ligne « comme la classe »
          suit le réglage de toute la classe ; la cocher ou la décocher la règle pour ${ech(nomD)} seul,
          jusqu'à ce que vous reveniez au réglage de la classe. Les élèves sans demi-groupe suivent la classe.</p>` : ''}

        <h3 style="margin-top:18px">Niveau du groupe</h3>
        ${duNiveau.length === 0 ? `<div class="note">Aucune activité pour ce niveau.</div>`
          : duNiveau.map((m) => ligneOuverture(m)).join('')}

        ${dAutresNiveaux.length ? `
          <h3 style="margin-top:22px">Autres niveaux</h3>
          <p class="note">Décochées par défaut. Cochez pour ouvrir malgré le niveau.</p>
          ${dAutresNiveaux.map((m) => ligneOuverture(m)).join('')}` : ''}
      </section>
      <section class="panneau">
        <h2>Code d'accès au stock</h2>
        <p class="note">Dans un environnement d'entreprise, la vue d'ensemble du stock est verrouillée :
          l'élève doit chercher référence par référence à la console. Donnez ce code quand vous voulez
          ouvrir la vue complète. Laissez vide pour la garder fermée.</p>
        <div class="rangee">
          <div class="champ" style="margin:0"><label for="codeStock">Code du groupe ${ech(g.nom)}</label>
            <input id="codeStock" class="mono" value="${ech(g.codeStock || '')}" placeholder="ex. STOCK24"></div>
          <button class="btn btn-s" id="btnCodeStock" style="align-self:end">Enregistrer</button>
        </div>
      </section>
      <section class="panneau">
        <h2>Bases partagées${demi ? ` — ${ech(nomD)}` : ''}</h2>
        ${demi ? `<p class="note">Les bases de classe (portée groupe) ci-dessous sont celles de ${ech(nomD)} :
          chaque demi-groupe a la sienne, les élèves sans demi-groupe gardent celle de la classe.</p>` : ''}
        ${partagees.length === 0 ? `<div class="vide">Aucune activité à base partagée.</div>` :
          partagees.map((m) => `<div class="rangee" style="padding:10px 0;border-bottom:1px solid var(--filet)">
            <span><span class="etiq">${ech(m.code || m.id)}</span> ${ech(m.titre)}
              <span class="note">— portée ${ech(m.portee)}${m.portee === 'groupe' && demisDe(g).length
                ? (demi ? `, base de ${ech(nomD)}` : ', base de la classe (élèves sans demi-groupe)') : ''}</span></span>
            <span class="pousse rangee">
              <button class="btn btn-s" data-semer="${ech(m.id)}">Semer le contenu de départ</button>
              <button class="btn btn-s" data-geler="${ech(m.id)}">Geler / dégeler</button>
              <button class="btn btn-s btn-d" data-raz="${ech(m.id)}">Réinitialiser</button>
            </span>
          </div>`).join('')}
        <p class="note" style="margin-top:12px">Geler met la base en lecture seule pour les élèves, sans rien effacer :
          pratique en fin de séance pour figer le travail avant correction.</p>
      </section>`;

    z.querySelector('#btnCodeStock').addEventListener('click', async () => {
      const codeStock = z.querySelector('#codeStock').value.trim();
      try {
        await B.majGroupe(g.id, { codeStock });
        g.codeStock = codeStock;
        groupes = await B.groupesDuProf(ctx.profil.uid);
        toast(codeStock ? 'Code enregistré.' : 'Code retiré : le stock reste verrouillé.');
      } catch (e) { toast("Le code n'a pas pu être enregistré."); }
    });

    brancherChoixDemi(z);

    // Sous un demi-groupe, la case écrit dans `ouvertsDemi[demi]` ; sinon dans `ouverts` (la classe).
    z.querySelectorAll('[data-ouvre]').forEach((c) => c.addEventListener('change', async () => {
      try {
        if (demi) {
          const ouvertsDemi = { ...(g.ouvertsDemi || {}) };
          ouvertsDemi[demi] = { ...(ouvertsDemi[demi] || {}), [c.dataset.ouvre]: c.checked };
          await B.majGroupe(g.id, { ouvertsDemi });
        } else {
          const ouverts = { ...(g.ouverts || {}) };
          ouverts[c.dataset.ouvre] = c.checked;
          await B.majGroupe(g.id, { ouverts });
        }
        groupes = await B.groupesDuProf(ctx.profil.uid);
        toast(`${c.checked ? 'Activité ouverte' : 'Activité fermée'}${demi ? ` pour ${nomD}` : ''}.`);
      } catch (e) { toast("Le réglage n'a pas pu être enregistré."); }
      dessiner();
    }));
    // Revenir au réglage de la classe : la clé du demi-groupe est SUPPRIMÉE, jamais mise à false.
    z.querySelectorAll('[data-comme-classe]').forEach((b) => b.addEventListener('click', async (ev) => {
      ev.preventDefault();
      const ouvertsDemi = { ...(g.ouvertsDemi || {}) };
      const propre = { ...(ouvertsDemi[demi] || {}) };
      delete propre[b.dataset.commeClasse];
      if (Object.keys(propre).length) ouvertsDemi[demi] = propre; else delete ouvertsDemi[demi];
      try {
        await B.majGroupe(g.id, { ouvertsDemi });
        groupes = await B.groupesDuProf(ctx.profil.uid);
        toast(`${nomD} suit de nouveau la classe pour cette activité.`);
      } catch (e) { toast("Le réglage n'a pas pu être enregistré."); }
      dessiner();
    }));

    // La base sur laquelle agissent Semer / Geler / Réinitialiser : celle du demi-groupe choisi
    // pour une base de classe. `jeuId` comme chez l'élève : plusieurs séances peuvent partager une base.
    async function jeuDe(aid) {
      const m = await activite(aid);
      return ouvrirJeu({ aid: m.meta.jeuId || aid, portee: m.meta.portee, tables: m.meta.tables || {},
        uid: ctx.profil.uid, gid: g.id, demi: m.meta.portee === 'groupe' ? demi : null });
    }

    z.querySelectorAll('[data-semer]').forEach((b) => b.addEventListener('click', async () => {
      const m = await activite(b.dataset.semer);
      if (!m.graines) return toast("Cette activité n'a pas de contenu de départ.");
      if (!confirmer('Remplacer le contenu actuel par le contenu de départ ?')) return;
      const jeu = await jeuDe(b.dataset.semer);
      await jeu.semer(m.graines);
      jeu.fermer();
      toast('Contenu de départ installé.');
    }));

    z.querySelectorAll('[data-geler]').forEach((b) => b.addEventListener('click', async () => {
      const jeu = await jeuDe(b.dataset.geler);
      const gele = !(jeu.meta && jeu.meta.gele);
      await jeu.majMeta({ gele });
      jeu.fermer();
      toast(gele ? 'Base gelée.' : 'Base dégelée.');
    }));

    z.querySelectorAll('[data-raz]').forEach((b) => b.addEventListener('click', async () => {
      const m = await activite(b.dataset.raz);
      if (!confirmer(`Vider toutes les tables de « ${m.meta.titre} » pour ${demi && m.meta.portee === 'groupe' ? `le demi-groupe ${nomD}` : 'ce groupe'} ?`)) return;
      const jeu = await jeuDe(b.dataset.raz);
      for (const t of Object.keys(m.meta.tables || {})) await jeu.vider(t);
      jeu.fermer();
      toast('Base réinitialisée.');
    }));
  }

  await dessiner();
}
