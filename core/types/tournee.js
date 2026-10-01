// Vue « tournée » — organiser l'ordre des arrêts sous contrainte, puis reporter ses résultats.
//
// Seconde des deux vues de transport du noyau, écrite le 02/10/2026. Comme la vue plan, elle
// ne connaît ni l'entreprise, ni le véhicule, ni l'unité : **le contenu déclare ce qui se
// cumule et ce qui est plafonné**. Le noyau tient l'ordre, les déplacements, les cumuls, les
// jauges, les cases de report et leur correction.
//
// Deux gestes, pour que personne ne reste bloqué (décision de Tristan du 02/10/2026) :
// l'élève **glisse** les arrêts pour les ordonner, et deux **flèches** font la même chose au
// clic. Le glisser-déposer n'avait jamais été éprouvé sur les postes du lycée ; le repli au
// clic est obligatoire, pas décoratif. C'est le même choix que dans `core/types/ordre.js`.
//
// Un arrêt peut être **laissé à quai** : c'est ce qui rend la contrainte de charge parlante.
// Le véhicule ne peut pas tout emporter, donc il faut choisir — et le cumul se recalcule.
//
// Enfin l'élève **reporte** ses résultats dans des cases qui se corrigent seules. Le contenu
// décide, case par case, quelle valeur est attendue : c'est lui qui sait ce que l'élève doit
// calculer lui-même et ce qu'une jauge lui donne déjà.
//
//   creerTournee({
//     libelle: 'Tournée',                  // entrée de menu
//     titre, consigne,
//     plan: PLAN,                           // le même objet que la vue plan : positions, échelle
//     points: [{ id, nom, zone, kg, colis, … }],   // facultatif : par défaut, ceux du plan
//     mesures: [                            // ce qui se cumule sur les arrêts retenus
//       { id: 'charge', libelle: 'Charge', unite: 'kg', champ: 'kg', max: 180 },
//       { id: 'colis',  libelle: 'Colis',  unite: 'colis', champ: 'colis' },
//     ],
//     horaire: {                            // facultatif : la contrainte de temps
//       depart: 13 * 60, limite: 16 * 60 + 10, vitesse: 12, service: 6,
//       libelleLimite: 'départ du train',
//     },
//     report: [{ id, libelle, unite, tolerance, valeur: (bilan) => … }],
//   })
//
// L'état, rangé par l'appelant dans la base de l'élève :
//   { ordre: [id…], quai: [id…], report: { [id]: '…' }, juge: { [id]: bool }, valide: ts }
//
// `bilan` passé aux cases de report et aux jalons du contenu :
//   { retenus, ecartes, cumuls: { [idMesure]: nombre }, km, minutes, arrivee,
//     depassements: [idMesure…], enRetard }

import { ech } from '../ui.js';
import { svgPlan, legendePlan, distanceKm } from './plan.js';
import { normaliser, estJuste } from './numerique.js';

export const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
const fr = (n, d = 2) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d }).format(n);

export function creerTournee(T) {
  // Le plan est FACULTATIF. Une séance peut n'avoir qu'une contrainte de charge — ordonner
  // des arrêts et voir le plafond — sans aucune carte : c'est le cas de la plupart des
  // scénarios Logisim, où le transport n'est qu'une contrainte de plus et non le sujet.
  // Sans plan, pas de carte dessinée et pas de distance, donc pas d'horaire : seuls les
  // cumuls et leurs plafonds jouent. Avec plan, tout fonctionne.
  const PLAN = T.plan || null;
  const POINTS = T.points || (PLAN ? PLAN.points : []);
  const MESURES = T.mesures || [];
  const H = T.horaire || null;
  const REPORT = T.report || [];
  const pointDe = (id) => POINTS.find((p) => String(p.id) === String(id));

  const vide = () => ({
    ordre: POINTS.map((p) => String(p.id)), quai: [], report: {}, juge: {}, valide: null,
  });

  /* ------------------------------------------------------------------ le calcul du bilan */
  // Tout se recalcule à partir de l'ordre courant, à chaque dessin. Rien n'est mémorisé :
  // une valeur mise en cache finirait par mentir après un déplacement.
  function bilanDe(etat) {
    const retenus = etat.ordre.map(pointDe).filter(Boolean);
    const ecartes = etat.quai.map(pointDe).filter(Boolean);

    const cumuls = {};
    const depassements = [];
    MESURES.forEach((m) => {
      const s = retenus.reduce((t, p) => t + Number(p[m.champ] || 0), 0);
      cumuls[m.id] = s;
      if (m.max != null && s > m.max) depassements.push(m.id);
    });

    // Le trajet : départ → arrêts dans l'ordre → arrivée. Un arrêt coûte en plus son temps
    // de service, qui pèse souvent plus lourd que la distance en ville.
    let km = 0, minutes = 0, arrivee = null;
    if (H && PLAN && retenus.length) {
      const suite = [];
      if (PLAN.depart) suite.push(PLAN.depart);
      retenus.forEach((p) => suite.push(p));
      if (PLAN.arrivee) suite.push(PLAN.arrivee);
      for (let i = 1; i < suite.length; i++) km += distanceKm(PLAN, suite[i - 1], suite[i]);
      minutes = km / H.vitesse * 60 + retenus.length * (H.service || 0);
      arrivee = H.depart + minutes;
    }
    const enRetard = !!(H && arrivee != null && H.limite != null && arrivee > H.limite);

    return { retenus, ecartes, cumuls, km, minutes, arrivee, depassements, enRetard };
  }

  /* --------------------------------------------------------------------------- les jauges */
  function jauge(m, valeur) {
    const max = m.max;
    const trop = max != null && valeur > max;
    const part = max ? Math.min(100, valeur / max * 100) : 0;
    return `<div class="tour-jauge ${trop ? 'trop' : ''}">
      <div class="tour-j-tete"><span>${ech(m.libelle)}</span>
        <b class="mono">${fr(valeur)}${max != null ? ` / ${fr(max)}` : ''} ${ech(m.unite || '')}</b></div>
      ${max != null ? `<div class="tour-j-barre"><i style="width:${part}%"></i></div>` : ''}
      ${trop ? `<span class="pastille crit">${ech(m.libelle)} dépassée de ${fr(valeur - max)} ${ech(m.unite || '')}</span>` : ''}
    </div>`;
  }

  function jaugeHoraire(b) {
    if (!H || b.arrivee == null) return '';
    const part = H.limite ? Math.min(100, (b.arrivee - H.depart) / (H.limite - H.depart) * 100) : 0;
    return `<div class="tour-jauge ${b.enRetard ? 'trop' : ''}">
      <div class="tour-j-tete"><span>Retour prévu</span>
        <b class="mono">${hhmm(b.arrivee)}${H.limite != null ? ` / ${hhmm(H.limite)}` : ''}</b></div>
      <div class="tour-j-barre"><i style="width:${part}%"></i></div>
      <span class="note">${fr(b.km, 1)} km parcourus, ${fr(b.minutes, 0)} min au total
        (${b.retenus.length} arrêt${b.retenus.length > 1 ? 's' : ''}
        × ${H.service || 0} min de service).</span>
      ${b.enRetard ? `<span class="pastille crit">${ech(H.libelleLimite || 'Horaire limite')} manqué
        de ${fr(b.arrivee - H.limite, 0)} min</span>` : ''}
    </div>`;
  }

  /* ------------------------------------------------------------------------------- la vue */
  return {
    nav: { id: 'tournee', libelle: T.libelle || 'Tournée' },

    html(etat0, opts = {}) {
      const etat = Object.assign(vide(), etat0 || {});
      const b = bilanDe(etat);
      const juge = etat.juge || {};
      const aJuge = Object.keys(juge).length > 0;
      const n = etat.ordre.length;

      // Le repérage d'abord : sans lui, l'élève ne sait pas où sont les points, et la
      // tournée se ferait au hasard. La vue le dit plutôt que de se laisser ouvrir à vide.
      if (opts.verrou) {
        return `<div class="ent-tete"><h2>${ech(T.titre || 'Tournée')}</h2></div>
          <div class="avis">${ech(opts.verrou)}</div>`;
      }

      const ligne = (id, pos) => {
        const p = pointDe(id);
        if (!p) return '';
        return `<li class="tour-item" draggable="true" data-pos="${pos}">
          <span class="tour-rang">${pos + 1}</span>
          <span class="tour-texte"><strong>${ech(p.nom)}</strong>
            <span class="note">${ech(p.zone || '')}${MESURES.map((m) => ` · ${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join('')}</span>
          </span>
          <span class="tour-boutons">
            <button class="btn btn-s" data-haut="${pos}" ${pos === 0 ? 'disabled' : ''}
              aria-label="Monter ${ech(p.nom)}">↑</button>
            <button class="btn btn-s" data-bas="${pos}" ${pos === n - 1 ? 'disabled' : ''}
              aria-label="Descendre ${ech(p.nom)}">↓</button>
            <button class="btn btn-s" data-quai="${ech(id)}"
              title="Laisser cet arrêt à quai, pour une autre tournée">à quai</button>
          </span>
        </li>`;
      };

      const quai = `<div class="tour-quai">
        <div class="ent-lbl">Laissés à quai (${etat.quai.length})</div>
        ${etat.quai.length === 0
          ? '<p class="note">Aucun. Tout est chargé dans le véhicule.</p>'
          : `<ul class="tour-liste tour-liste-quai">${etat.quai.map((id) => {
              const p = pointDe(id);
              return !p ? '' : `<li class="tour-item"><span class="tour-texte">
                <strong>${ech(p.nom)}</strong>
                <span class="note">${MESURES.map((m) => `${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join(' · ')}</span>
                </span><span class="tour-boutons">
                <button class="btn btn-s" data-reprendre="${ech(id)}">reprendre</button>
                </span></li>`;
            }).join('')}</ul>`}
      </div>`;

      const cases = !REPORT.length ? '' : `
        <div class="tour-report">
          <div class="ent-lbl">${ech(T.titreReport || 'Reportez vos résultats')}</div>
          ${T.consigneReport ? `<p class="note">${ech(T.consigneReport)}</p>` : ''}
          <div class="tour-cases">
            ${REPORT.map((r) => {
              const v = etat.report[r.id] == null ? '' : String(etat.report[r.id]);
              const j = juge[r.id];
              const cl = !aJuge ? '' : (j ? 'juste' : 'faux');
              return `<label class="tour-case">
                <span>${ech(r.libelle)}</span>
                <span class="tour-saisie">
                  <input type="text" inputmode="decimal" class="champ ${cl}"
                    data-report="${ech(r.id)}" value="${ech(v)}" autocomplete="off">
                  ${r.unite ? `<span class="num-unite">${ech(r.unite)}</span>` : ''}
                </span>
                ${!aJuge ? '' : (j
                  ? '<span class="pastille ok">juste</span>'
                  : '<span class="pastille crit">à revoir</span>')}
              </label>`;
            }).join('')}
          </div>
          ${!aJuge ? '' : (REPORT.every((r) => juge[r.id])
            ? '<div class="avis avis-ok">Tous les résultats sont justes.</div>'
            : `<div class="avis avis-err">${REPORT.filter((r) => !juge[r.id]).length} résultat(s)
                 à revoir. Reprenez votre calcul : les cases ne donnent pas la réponse.</div>`)}
          <div class="rangee" style="margin-top:12px">
            <button class="btn btn-p" data-tour-valider>Valider mes résultats</button>
          </div>
        </div>`;

      return `
        <div class="ent-tete"><h2>${ech(T.titre || 'Tournée')}</h2></div>
        ${T.consigne ? `<p class="note">${ech(T.consigne)}</p>` : ''}
        ${PLAN ? `<div class="plan-boite">
          ${svgPlan(PLAN, { noms: true, ordre: etat.ordre, id: 'tournee' })}
          ${legendePlan(PLAN)}
        </div>` : ''}
        <div class="tour-grille">
          <div>
            <p class="note">Glissez les arrêts pour les ordonner, ou utilisez les flèches
              ↑ et ↓.${PLAN ? ' Le tracé du plan suit votre ordre.' : ''}</p>
            <ul class="tour-liste" id="tourListe">
              ${etat.ordre.map((id, i) => ligne(id, i)).join('')}
            </ul>
            ${quai}
          </div>
          <div class="tour-jauges">
            ${MESURES.map((m) => jauge(m, b.cumuls[m.id])).join('')}
            ${jaugeHoraire(b)}
          </div>
        </div>
        ${cases}`;
    },

    // Exposé pour les jalons du contenu : `verifier(db)` recalcule le bilan sans dessiner.
    bilan: bilanDe,

    brancher(z, api) {
      const etat = api.etat;
      if (!etat.ordre) Object.assign(etat, vide());
      if (!etat.report) etat.report = {};

      const deplacer = (de, vers) => {
        if (vers < 0 || vers >= etat.ordre.length) return;
        const [x] = etat.ordre.splice(de, 1);
        etat.ordre.splice(vers, 0, x);
        // Un ordre modifié invalide la correction précédente : les quatre résultats ne
        // valent plus rien. Les effacer est plus honnête que de laisser « juste » affiché.
        etat.juge = {};
        api.sauver(); api.redessiner();
      };

      z.querySelectorAll('[data-haut]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.haut, +btn.dataset.haut - 1);
      }));
      z.querySelectorAll('[data-bas]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.bas, +btn.dataset.bas + 1);
      }));
      z.querySelectorAll('[data-quai]').forEach((btn) => btn.addEventListener('click', () => {
        const id = btn.dataset.quai;
        etat.ordre = etat.ordre.filter((x) => String(x) !== String(id));
        if (!etat.quai.some((x) => String(x) === String(id))) etat.quai.push(String(id));
        etat.juge = {};
        api.sauver(); api.redessiner();
      }));
      z.querySelectorAll('[data-reprendre]').forEach((btn) => btn.addEventListener('click', () => {
        const id = btn.dataset.reprendre;
        etat.quai = etat.quai.filter((x) => String(x) !== String(id));
        if (!etat.ordre.some((x) => String(x) === String(id))) etat.ordre.push(String(id));
        etat.juge = {};
        api.sauver(); api.redessiner();
      }));

      // Glisser-déposer. Le repli au clic ci-dessus reste la voie sûre : si ce bloc ne
      // fonctionne pas sur un poste, la séance tient quand même.
      z.querySelectorAll('#tourListe .tour-item').forEach((li) => {
        li.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', li.dataset.pos);
          li.classList.add('glisse');
        });
        li.addEventListener('dragend', () => li.classList.remove('glisse'));
        li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('survol'); });
        li.addEventListener('dragleave', () => li.classList.remove('survol'));
        li.addEventListener('drop', (e) => {
          e.preventDefault();
          const de = +e.dataTransfer.getData('text/plain');
          deplacer(de, +li.dataset.pos);
        });
      });

      z.querySelectorAll('[data-report]').forEach((el) => {
        const maj = () => { etat.report[el.dataset.report] = el.value; api.sauver(); };
        el.addEventListener('input', maj);
        el.addEventListener('change', maj);
      });

      z.querySelector('[data-tour-valider]')?.addEventListener('click', () => {
        const b = bilanDe(etat);
        const juge = {};
        REPORT.forEach((r) => {
          juge[r.id] = estJuste(normaliser(etat.report[r.id]), r.valeur(b), r.tolerance);
        });
        etat.juge = juge;
        const fini = REPORT.every((r) => juge[r.id]);
        if (fini) etat.valide = Date.now(); else etat.valide = null;
        api.sauver(); api.redessiner();
        if (api.toast) api.toast(fini ? 'Résultats justes.' : 'Résultats à revoir.');
      });
    },
  };
}
