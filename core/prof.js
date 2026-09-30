// Espace enseignant : groupes, comptes élèves, suivi de classe, conduite de séance.
// Tout y est générique : une activité ajoutée demain apparaît ici sans une ligne de code.

import { B } from './backend.js';
import { ech, toast, confirmer } from './ui.js';
import { chargerActivites, activite } from '../activites/index.js';
import { versCSV, telecharger, ouvrirJeu } from './store.js';
import { NIVEAUX, libelleNiveau, courtNiveau, libelleNiveaux, activiteVisible, horsNiveau } from './niveaux.js';

export async function rendreEspaceProf(hote, ctx) {
  let onglet = ctx.onglet || 'groupes';
  let groupes = await B.groupesDuProf(ctx.profil.uid);
  let gidActif = ctx.groupeActif || groupes[0]?.id || null;
  let dernierLot = null;   // résultat de la dernière création de comptes, conservé à l'affichage

  // Le groupe actif est partagé avec l'accueil : l'y remonter à chaque changement.
  function activer(gid) { gidActif = gid; if (ctx.setGroupe) ctx.setGroupe(gid); }
  activer(gidActif);

  async function dessiner() {
    const g = groupes.find((x) => x.id === gidActif) || null;
    hote.innerHTML = `
      <button class="lien-accueil" id="btnRetour">← ACCUEIL</button>
      <h1>Espace enseignant</h1>
      <nav class="rangee" style="margin-bottom:16px">
        ${[['groupes', 'Groupes'], ['comptes', 'Comptes élèves'], ['suivi', 'Suivi de classe'], ['seance', 'Conduite de séance']]
          .map(([k, l]) => `<button class="btn btn-s ${onglet === k ? 'btn-p' : ''}" data-ong="${k}">${l}</button>`).join('')}
        ${g ? `<span class="pousse note">Groupe actif : <span class="etiq">${ech(g.nom)}</span>
          <span class="etiq">${ech(courtNiveau(g.niveau))}</span></span>` : ''}
      </nav>
      <div id="contenuProf"></div>`;

    hote.querySelector('#btnRetour').addEventListener('click', ctx.retour);
    hote.querySelectorAll('[data-ong]').forEach((b) => b.addEventListener('click', () => { onglet = b.dataset.ong; dessiner(); }));

    const z = hote.querySelector('#contenuProf');
    if (onglet === 'groupes') await vueGroupes(z);
    else if (!gidActif) z.innerHTML = `<div class="avis">Créez d'abord un groupe dans l'onglet « Groupes ».</div>`;
    else if (onglet === 'comptes') await vueComptes(z, g);
    else if (onglet === 'suivi') await vueSuivi(z, g);
    else await vueSeance(z, g);
  }

  // ------------------------------------------------------------------ groupes
  async function vueGroupes(z) {
    z.innerHTML = `
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
              <td>${g.id === gidActif ? '<span class="note">actif</span>' : `<button class="btn btn-s" data-actif="${ech(g.id)}">Activer</button>`}</td>
            </tr>`).join('')}
          </tbody></table>`}
        </section>
      </div>`;

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
  }

  // ------------------------------------------------------------------ comptes
  async function vueComptes(z, g) {
    const eleves = await B.elevesDuGroupe(g.id);
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
          ${eleves.length === 0 ? `<div class="vide">Aucun élève.</div>` : `
          <table><thead><tr><th>Nom</th><th>Prénom</th><th>Matricule</th><th>Code</th></tr></thead><tbody>
            ${eleves.map((e) => `<tr><td>${ech(e.nom)}</td><td>${ech(e.prenom)}</td>
              <td class="mono">${ech(e.matricule)}</td><td class="mono">${ech(e.code || '—')}</td></tr>`).join('')}
          </tbody></table>
          <p class="note">Les codes ne sont lisibles ici qu'en mode démonstration. En production, notez-les à la création.</p>`}
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

    z.querySelector('#btnCsvEleves').addEventListener('click', () => telecharger(`eleves-${g.id}.csv`,
      versCSV(eleves, [{ cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' }, { cle: 'matricule', label: 'Matricule' }])));
  }

  // -------------------------------------------------------------------- suivi
  async function vueSuivi(z, g) {
    z.innerHTML = `<div class="panneau"><div class="vide">Chargement du suivi…</div></div>`;
    const [eleves, travaux, mods] = await Promise.all([
      B.elevesDuGroupe(g.id), B.suivi(g.id), chargerActivites(),
    ]);
    // Seules les activités notées apparaissent : c'est le barème qui les y fait entrer.
    const notees = mods.map((m) => m.meta).filter((m) => m.bareme);
    // Celles que le noyau ne sait pas corriger (scénario sur Padlet, oral, dossier
    // papier…) déclarent `notation: 'prof'` : leur colonne devient un champ de saisie.
    const aLaMain = (m) => m.notation === 'prof';
    const par = {};
    travaux.forEach((t) => { (par[t.uid] = par[t.uid] || {})[t.aid] = t; });

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
      if (!t) return `<td class="num note">—</td>`;
      const part = t.meilleur / (t.max || m.bareme);
      return `<td class="num ${part >= 0.7 ? 'juste' : part < 0.4 ? 'faux' : ''}">${t.meilleur}/${t.max || m.bareme}
        <span class="note">(${t.tentatives})</span></td>`;
    };

    z.innerHTML = `
      <section class="panneau">
        <div class="rangee" style="margin-bottom:12px">
          <strong>Suivi de ${ech(g.nom)}</strong>
          <span class="pousse"><button class="btn btn-s" id="btnCsvSuivi">Exporter en CSV</button></span>
        </div>
        ${notees.length === 0 ? `<div class="vide">Aucune activité notée pour l'instant.</div>` : `
        <div style="overflow:auto"><table>
          <thead><tr><th>Élève</th>${notees.map((m) => `
            <th class="${aLaMain(m) ? 'col-saisie' : ''}" title="${ech(m.titre)}${aLaMain(m) ? ' — note saisie à la main' : ''}">
              ${ech(m.code)}${aLaMain(m) ? `<span class="note"> /${m.bareme}</span>` : ''}
            </th>`).join('')}</tr></thead>
          <tbody>${eleves.map((e) => `<tr>
            <td>${ech(e.nom)} ${ech(e.prenom)}</td>
            ${notees.map((m) => cellule(e, m)).join('')}
          </tr>`).join('')}</tbody>
        </table></div>
        <p class="note">Entre parenthèses : le nombre de tentatives. Le score retenu est le meilleur.
          ${notees.some(aLaMain) ? `Les colonnes en fond clair sont notées à la main : tapez la note,
            elle s'enregistre en quittant la case. Une case vidée efface la note.` : ''}</p>`}
      </section>`;

    z.querySelectorAll('.note-saisie').forEach((inp) => {
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

    z.querySelector('#btnCsvSuivi')?.addEventListener('click', () => {
      const champs = [{ cle: 'nom', label: 'Nom' }, { cle: 'prenom', label: 'Prénom' },
        ...notees.map((m) => ({ cle: m.id, label: m.code }))];
      const lignes = eleves.map((e) => {
        const o = { nom: e.nom, prenom: e.prenom };
        notees.forEach((m) => { o[m.id] = par[e.uid]?.[m.id]?.meilleur ?? ''; });
        return o;
      });
      telecharger(`suivi-${g.id}.csv`, versCSV(lignes, champs));
    });
  }

  // ------------------------------------------------------------------- séance
  async function vueSeance(z, g) {
    const mods = await chargerActivites();
    const metas = mods.map((m) => m.meta);
    const partagees = metas.filter((m) => m.portee !== 'eleve');
    const duNiveau = metas.filter((m) => !horsNiveau(m, g));
    const dAutresNiveaux = metas.filter((m) => horsNiveau(m, g));

    const ligneOuverture = (m) => {
      const visible = activiteVisible(m, g);
      const force = g.ouverts?.[m.id];
      return `<label class="choix">
        <input type="checkbox" data-ouvre="${ech(m.id)}" ${visible ? 'checked' : ''}>
        <span>
          <span class="etiq">${ech(m.code || m.id)}</span> ${ech(m.titre)}
          <span class="note">— ${ech(libelleNiveaux(m.niveaux))}${m.bareme ? `, noté sur ${m.bareme}` : ''}</span>
          ${force === true && horsNiveau(m, g) ? `<span class="etiq" style="color:var(--terre)">ouverte hors niveau</span>` : ''}
        </span>
      </label>`;
    };

    z.innerHTML = `
      <section class="panneau">
        <h2>Ouverture des activités</h2>
        <p class="note">Groupe <strong>${ech(g.nom)}</strong>, niveau ${ech(libelleNiveau(g.niveau))}.
          Les activités de ce niveau sont proposées d'office ; vous pouvez en fermer une, ou en
          ouvrir une d'un autre niveau.</p>

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
        <h2>Bases partagées</h2>
        ${partagees.length === 0 ? `<div class="vide">Aucune activité à base partagée.</div>` :
          partagees.map((m) => `<div class="rangee" style="padding:10px 0;border-bottom:1px solid var(--filet)">
            <span><span class="etiq">${ech(m.code || m.id)}</span> ${ech(m.titre)}
              <span class="note">— portée ${ech(m.portee)}</span></span>
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

    z.querySelectorAll('[data-ouvre]').forEach((c) => c.addEventListener('change', async () => {
      const ouverts = { ...(g.ouverts || {}) };
      ouverts[c.dataset.ouvre] = c.checked;
      await B.majGroupe(g.id, { ouverts });
      g.ouverts = ouverts;
      groupes = await B.groupesDuProf(ctx.profil.uid);
      toast(c.checked ? 'Activité ouverte.' : 'Activité fermée.');
      dessiner();
    }));

    async function jeuDe(aid) {
      const m = await activite(aid);
      return ouvrirJeu({ aid, portee: m.meta.portee, tables: m.meta.tables || {}, uid: ctx.profil.uid, gid: g.id });
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
      if (!confirmer(`Vider toutes les tables de « ${m.meta.titre} » pour ce groupe ?`)) return;
      const jeu = await jeuDe(b.dataset.raz);
      for (const t of Object.keys(m.meta.tables || {})) await jeu.vider(t);
      jeu.fermer();
      toast('Base réinitialisée.');
    }));
  }

  await dessiner();
}
