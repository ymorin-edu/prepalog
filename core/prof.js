// Espace enseignant : groupes, comptes élèves, suivi de classe, conduite de séance.
// Tout y est générique : une activité ajoutée demain apparaît ici sans une ligne de code.

import { B } from './backend.js';
import { ech, toast, confirmer } from './ui.js';
import { chargerActivites, activite } from '../activites/index.js';
import { versCSV, telecharger, ouvrirJeu } from './store.js';

export async function rendreEspaceProf(hote, ctx) {
  let onglet = 'groupes';
  let groupes = await B.groupesDuProf(ctx.profil.uid);
  let gidActif = ctx.groupeActif || groupes[0]?.id || null;
  let dernierLot = null;   // résultat de la dernière création de comptes, conservé à l'affichage

  // Le groupe actif est partagé avec l'accueil : l'y remonter à chaque changement.
  function activer(gid) { gidActif = gid; if (ctx.setGroupe) ctx.setGroupe(gid); }
  activer(gidActif);

  async function dessiner() {
    const g = groupes.find((x) => x.id === gidActif) || null;
    hote.innerHTML = `
      <button class="retour" id="btnRetour">← Retour à l'accueil</button>
      <h1>Espace enseignant</h1>
      <nav class="rangee" style="margin-bottom:16px">
        ${[['groupes', 'Groupes'], ['comptes', 'Comptes élèves'], ['suivi', 'Suivi de classe'], ['seance', 'Conduite de séance']]
          .map(([k, l]) => `<button class="btn btn-s ${onglet === k ? 'btn-p' : ''}" data-ong="${k}">${l}</button>`).join('')}
        ${g ? `<span class="pousse note">Groupe actif : <span class="etiq">${ech(g.nom)}</span></span>` : ''}
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
          <div class="champ"><label for="gAnnee">Année scolaire</label>
            <input id="gAnnee" value="${new Date().getMonth() >= 7 ? new Date().getFullYear() : new Date().getFullYear() - 1}-${new Date().getMonth() >= 7 ? new Date().getFullYear() + 1 : new Date().getFullYear()}"></div>
          <button class="btn btn-p" id="btnCreerG">Créer le groupe</button>
        </section>
        <section class="panneau">
          <h2>Mes groupes</h2>
          ${groupes.length === 0 ? `<div class="vide">Aucun groupe pour l'instant.</div>` : `
          <table><thead><tr><th>Groupe</th><th>Année</th><th>Code</th><th></th></tr></thead><tbody>
            ${groupes.map((g) => `<tr>
              <td><strong>${ech(g.nom)}</strong></td><td>${ech(g.annee || '')}</td>
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
        const g = await B.creerGroupe({ nom, annee: z.querySelector('#gAnnee').value.trim(), profUid: ctx.profil.uid });
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
    const par = {};
    travaux.forEach((t) => { (par[t.uid] = par[t.uid] || {})[t.aid] = t; });

    z.innerHTML = `
      <section class="panneau">
        <div class="rangee" style="margin-bottom:12px">
          <strong>Suivi de ${ech(g.nom)}</strong>
          <span class="pousse"><button class="btn btn-s" id="btnCsvSuivi">Exporter en CSV</button></span>
        </div>
        ${notees.length === 0 ? `<div class="vide">Aucune activité notée pour l'instant.</div>` : `
        <div style="overflow:auto"><table>
          <thead><tr><th>Élève</th>${notees.map((m) => `<th title="${ech(m.titre)}">${ech(m.code)}</th>`).join('')}</tr></thead>
          <tbody>${eleves.map((e) => `<tr>
            <td>${ech(e.nom)} ${ech(e.prenom)}</td>
            ${notees.map((m) => {
              const t = par[e.uid]?.[m.id];
              if (!t) return `<td class="num note">—</td>`;
              const part = t.meilleur / (t.max || m.bareme);
              return `<td class="num ${part >= 0.7 ? 'juste' : part < 0.4 ? 'faux' : ''}">${t.meilleur}/${t.max || m.bareme}
                <span class="note">(${t.tentatives})</span></td>`;
            }).join('')}
          </tr>`).join('')}</tbody>
        </table></div>
        <p class="note">Entre parenthèses : le nombre de tentatives. Le score retenu est le meilleur.</p>`}
      </section>`;

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
    const partagees = mods.map((m) => m.meta).filter((m) => m.portee !== 'eleve');
    z.innerHTML = `
      <section class="panneau">
        <h2>Ouverture des activités</h2>
        <p class="note">Une activité fermée n'apparaît pas sur l'accueil des élèves.</p>
        ${mods.map((m) => `<label class="choix">
          <input type="checkbox" data-ouvre="${ech(m.meta.id)}" ${g.ouverts?.[m.meta.id] !== false ? 'checked' : ''}>
          <span><span class="etiq">${ech(m.meta.code || m.meta.id)}</span> ${ech(m.meta.titre)}</span>
        </label>`).join('')}
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

    z.querySelectorAll('[data-ouvre]').forEach((c) => c.addEventListener('change', async () => {
      const ouverts = { ...(g.ouverts || {}) };
      ouverts[c.dataset.ouvre] = c.checked;
      await B.majGroupe(g.id, { ouverts });
      g.ouverts = ouverts;
      toast(c.checked ? 'Activité ouverte.' : 'Activité fermée.');
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
