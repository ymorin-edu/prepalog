// Vue « plan » — situer des adresses sur un plan schématique, puis y lire une tournée.
//
// Première des deux vues de transport du noyau, écrite le 02/10/2026. Elle ne connaît ni
// Nîmes, ni Boost, ni le vélo-cargo : **tout le décor vient du contenu**. Le noyau dessine
// le quadrillage, les repères, le tracé, la légende et l'échelle ; il tient le repérage en
// deux temps et sa correction. Le contenu fournit un fragment SVG de décor (quartiers,
// voies, noms de lieux), la liste des points et les règles de lecture.
//
// Pourquoi un plan DESSINÉ et pas un fond cartographique : un fond Google Maps ou
// OpenStreetMap ne peut pas être repris dans un support diffusé à une classe. Un plan
// schématique est libre de droits, et il est plus lisible au vidéoprojecteur qu'une vraie
// carte. L'élève, lui, va bien chercher l'adresse sur un plan en ligne — dans un autre
// onglet, par un simple lien. Rien n'est intégré dans la page.
//
// Le repérage se fait en DEUX TEMPS, décision de Tristan du 02/10/2026 :
//   temps 1 — le plan est muet. L'élève n'a que l'adresse de rue de chaque point ; il la
//             situe (sur un plan en ligne), puis écrit la case du quadrillage. Il valide,
//             case par case.
//   temps 2 — les noms apparaissent sur le plan. Le repérage est fait, la tournée peut
//             commencer.
//
// Un bouton « je n'ai pas accès à Internet » révèle le quartier de chaque point. Il
// débloque sans donner la réponse : la case du quadrillage reste à trouver sur le plan.
// Il doit être visible mais pas confortable — c'est un filet de sécurité, pas un raccourci.
//
//   creerPlan({
//     libelle: 'Plan de la ville',          // entrée de menu
//     titre, consigne,                      // en-tête de la vue
//     largeur: 600, hauteur: 420,           // repère du plan, en unités SVG
//     fond: '<g>…</g>',                     // le décor, dessiné par le contenu
//     grille: { colonnes: 'ABCDEF', lignes: 4 },
//     echelle: { pixels: 60, libelle: '1 km' },
//     depart:  { nom: 'Entrepôt', lettre: 'B', x, y },
//     arrivee: { nom: 'Gare', x, y },        // facultatif
//     points:  [{ id, nom, zone, adresse, x, y }],
//     enLigne: { libelle: 'Ouvrir un plan en ligne', url: '…' },   // facultatif
//     reperage: { consigne, champ: 'Case', secours: 'Je n’ai pas accès à Internet',
//                 toleres: 0,            // cases fausses admises pour valider quand même
//                 blocant: true,         // la suite attend-elle la validation ?
//                 essaisAvantIssue: 2,   // essais avant d'offrir « continuer quand même »
//                 issue: 'Je ne trouve pas, continuer quand même' },
//     legende: [{ forme: 'carre'|'losange'|'rond', couleur, texte }],  // facultatif
//   })
//
// L'état est un objet simple, rangé par l'appelant dans la base de l'élève :
//   { cases: {…}, juge: {…}, essais: n, valide: ts, force: ts, secours: ts }
//
// **L'autocorrection se règle au cas par cas — règle de Tristan du 02/10/2026 au soir :**
// *« il ne faut pas que l'élève se retrouve complètement bloqué mais il faut en même temps lui
// laisser la possibilité de faire certaines erreurs »*. D'où trois réglages et une porte de
// sortie, plutôt qu'un verrou unique :
//
//   - `toleres` — combien de cases peuvent rester fausses sans empêcher la validation. À zéro,
//     tout doit être juste ; à un, l'élève avance avec une erreur, et elle reste visible ;
//   - `blocant: false` — la suite de la séance n'attend pas la validation du tout. Le repérage
//     se fait quand même, il est corrigé, mais il n'enferme personne ;
//   - `essaisAvantIssue` — au bout de N validations infructueuses, un bouton **« continuer quand
//     même »** apparaît. Il ouvre le temps 2 et libère la suite, **sans** marquer le repérage
//     comme réussi : `force` est horodaté, `valide` reste vide. L'élève n'est jamais coincé,
//     l'enseignant voit la différence dans le suivi, et le jalon ne ment pas.
//
// C'est la distinction qui compte : **débloquer n'est pas valider.**

import { ech } from '../ui.js';

/* ------------------------------------------------------------------ lecture du quadrillage */

// Les colonnes sont des lettres, les lignes des numéros à partir de 1 : « C2 ». Un point
// posé exactement sur la dernière limite tomberait dans une colonne qui n'existe pas, d'où
// le bornage — sans lui, un client collé au bord droit n'aurait aucune case juste.
export function caseDe(PLAN, p) {
  const cols = String((PLAN.grille && PLAN.grille.colonnes) || 'ABCDEF');
  const lignes = (PLAN.grille && PLAN.grille.lignes) || 4;
  const larg = PLAN.largeur / cols.length;
  const haut = PLAN.hauteur / lignes;
  const c = Math.min(cols.length - 1, Math.max(0, Math.floor(p.x / larg)));
  const r = Math.min(lignes, Math.max(1, Math.floor(p.y / haut) + 1));
  return cols[c] + r;
}

// « c 2 », « C2 », « c-2 » : c'est la lecture du plan qu'on évalue, pas la frappe.
export const normCase = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Distance routière entre deux points, en kilomètres. Le facteur de détour évite de
// prétendre qu'on roule à vol d'oiseau ; il est déclaré par le contenu.
export function distanceKm(PLAN, a, b) {
  const px = (PLAN.echelle && PLAN.echelle.pixels) || 60;
  const f = (PLAN.echelle && PLAN.echelle.facteurRoute) || 1;
  return Math.hypot(a.x - b.x, a.y - b.y) / px * f;
}

/* ------------------------------------------------------------------------- le plan dessiné */

// `o.noms` : afficher le nom des points (temps 2). `o.ordre` : les identifiants des points
// à relier, dans l'ordre, pour tracer la tournée. `o.id` : suffixe des identifiants DOM,
// pour que deux plans sur la même page ne se marchent pas dessus.
export function svgPlan(PLAN, o = {}) {
  const L = PLAN.largeur, H = PLAN.hauteur;
  const cols = String((PLAN.grille && PLAN.grille.colonnes) || 'ABCDEF');
  const nl = (PLAN.grille && PLAN.grille.lignes) || 4;
  const lc = L / cols.length, hl = H / nl;
  const px = (PLAN.echelle && PLAN.echelle.pixels) || 60;
  const sfx = o.id ? String(o.id) : 'plan';

  const grille = `
    <g stroke="var(--filet)" stroke-width="1" opacity=".85">
      ${Array.from({ length: cols.length - 1 }, (_, i) => `<line x1="${(i + 1) * lc}" y1="0" x2="${(i + 1) * lc}" y2="${H}"/>`).join('')}
      ${Array.from({ length: nl - 1 }, (_, i) => `<line x1="0" y1="${(i + 1) * hl}" x2="${L}" y2="${(i + 1) * hl}"/>`).join('')}
    </g>
    <g font-size="13" font-weight="700" fill="var(--encre-douce)" text-anchor="middle">
      ${cols.split('').map((c, i) => `<text x="${i * lc + lc / 2}" y="15">${c}</text>`).join('')}
      ${Array.from({ length: nl }, (_, i) => `<text x="12" y="${i * hl + hl / 2 + 5}">${i + 1}</text>`).join('')}
    </g>`;

  // Le tracé passe par le départ, les points dans l'ordre demandé, puis l'arrivée.
  const suite = [];
  if (o.ordre && o.ordre.length) {
    if (PLAN.depart) suite.push(PLAN.depart);
    o.ordre.forEach((id) => {
      const p = PLAN.points.find((q) => String(q.id) === String(id));
      if (p) suite.push(p);
    });
    if (PLAN.arrivee) suite.push(PLAN.arrivee);
  }
  const trace = `<polyline class="plan-trace" fill="none" stroke="var(--vert)" stroke-width="4"
      stroke-linejoin="round" stroke-linecap="round"
      points="${suite.map((p) => `${p.x},${p.y}`).join(' ')}"/>`;

  // Un nom écrit par-dessus le décor deviendrait illisible : `paint-order` lui pose un
  // liseré de la couleur du panneau, donc il reste net sur n'importe quel fond.
  const etiquette = (p, dx, dy, ancre) => `<text x="${p.x + dx}" y="${p.y + dy}"
      text-anchor="${ancre}" font-size="12.5" font-weight="600" fill="var(--encre)"
      paint-order="stroke" stroke="var(--panneau)" stroke-width="3.5">${ech(p.nom)}</text>`;

  const depart = !PLAN.depart ? '' : `<g class="plan-depart">
      <rect x="${PLAN.depart.x - 13}" y="${PLAN.depart.y - 13}" width="26" height="26" rx="5"
        fill="var(--vert)" stroke="var(--panneau)" stroke-width="2"/>
      <text x="${PLAN.depart.x}" y="${PLAN.depart.y + 5}" text-anchor="middle" font-size="14"
        font-weight="700" fill="var(--panneau)">${ech(PLAN.depart.lettre || 'D')}</text>
      ${etiquette(PLAN.depart, 0, -20, 'middle')}
    </g>`;

  const arrivee = !PLAN.arrivee ? '' : `<g class="plan-arrivee">
      <path d="M${PLAN.arrivee.x} ${PLAN.arrivee.y - 15} L${PLAN.arrivee.x + 14} ${PLAN.arrivee.y}
        L${PLAN.arrivee.x} ${PLAN.arrivee.y + 15} L${PLAN.arrivee.x - 14} ${PLAN.arrivee.y} Z"
        fill="var(--terre)" stroke="var(--panneau)" stroke-width="2"/>
      ${etiquette(PLAN.arrivee, 20, 20, 'start')}
    </g>`;

  const points = PLAN.points.map((p, i) => {
    const rang = o.ordre ? o.ordre.findIndex((x) => String(x) === String(p.id)) : -1;
    const droite = p.x > L * 0.68;          // à droite du plan, l'étiquette part vers la gauche
    return `<g class="plan-pt" data-point="${ech(p.id)}">
      <circle cx="${p.x}" cy="${p.y}" r="12" fill="var(--ardoise-fond)"
        stroke="var(--panneau)" stroke-width="2"/>
      <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="12" font-weight="700"
        fill="var(--sur-ardoise,#fff)">${rang >= 0 ? rang + 1 : i + 1}</text>
      ${o.noms ? etiquette(p, droite ? -16 : 16, 4, droite ? 'end' : 'start') : ''}
    </g>`;
  }).join('');

  const echelle = `<g transform="translate(${L - px - 85},${H - 16})">
      <line x1="0" y1="0" x2="${px}" y2="0" stroke="var(--encre)" stroke-width="3"/>
      <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--encre)" stroke-width="3"/>
      <line x1="${px}" y1="-5" x2="${px}" y2="5" stroke="var(--encre)" stroke-width="3"/>
      <text x="${px + 8}" y="5" font-size="12.5" font-weight="600" fill="var(--encre)"
        >${ech((PLAN.echelle && PLAN.echelle.libelle) || '1 km')}</text>
    </g>`;

  return `<svg class="plan-svg" id="svg-${ech(sfx)}" viewBox="0 0 ${L} ${H}" role="img"
      aria-label="${ech(PLAN.alt || 'Plan schématique')}">
    ${PLAN.fond || ''}
    ${grille}
    ${trace}
    ${depart}${arrivee}
    ${points}
    ${echelle}
  </svg>`;
}

export function legendePlan(PLAN) {
  const items = PLAN.legende || [
    PLAN.depart && { forme: 'carre', couleur: 'var(--vert)', texte: PLAN.depart.nom },
    PLAN.arrivee && { forme: 'losange', couleur: 'var(--terre)', texte: PLAN.arrivee.nom },
    { forme: 'rond', couleur: 'var(--ardoise-fond)', texte: PLAN.legendePoints || 'Point à desservir' },
  ].filter(Boolean);
  return `<div class="plan-legende">
    ${items.map((x) => `<span><i class="plan-l-${ech(x.forme)}" style="background:${x.couleur}"></i>${ech(x.texte)}</span>`).join('')}
    <span>Échelle : ${ech((PLAN.echelle && PLAN.echelle.libelle) || '1 km')}</span>
  </div>`;
}

/* ------------------------------------------------------------------------------- la vue */

export function creerPlan(PLAN) {
  const R = PLAN.reperage || null;
  const TOL = R && R.toleres ? Number(R.toleres) : 0;
  // Deux essais avant d'ouvrir la porte de sortie : assez pour que l'élève cherche, assez peu
  // pour qu'il ne passe pas la séance bloqué sur une case. `0` l'offre tout de suite, `null`
  // la supprime — à régler séance par séance.
  const ESSAIS = !R ? 0 : (R.essaisAvantIssue === undefined ? 2 : R.essaisAvantIssue);
  const vide = () => ({ cases: {}, juge: {}, essais: 0, valide: null, force: null, secours: null });

  // Une saisie juste n'est pas « la bonne réponse écrite dans le contenu » mais la case
  // RECALCULÉE depuis la position du point : le contenu ne peut pas se contredire.
  const juger = (etat) => {
    const juge = {};
    PLAN.points.forEach((p) => {
      juge[p.id] = normCase(etat.cases[p.id]) === normCase(caseDe(PLAN, p));
    });
    return juge;
  };
  const faux = (juge) => PLAN.points.filter((p) => juge[p.id] !== true).length;
  // « Assez juste », pas « tout juste » : la tolérance est déclarée par la séance.
  const assezJustes = (juge) => faux(juge) <= TOL;

  return {
    nav: { id: 'plan', libelle: PLAN.libelle || 'Plan' },

    // Le temps 2 n'est pas un réglage d'affichage : il se déduit de l'état. Un élève qui
    // revient la semaine suivante retrouve son plan nommé sans avoir à revalider. Il s'ouvre
    // aussi quand l'élève a pris la porte de sortie — il n'a alors rien validé, mais il voit.
    temps2: (etat) => !R || !!(etat && (etat.valide || etat.force)),

    // Ce que la suite de la séance doit interroger. Volontairement distinct de `temps2` et de
    // `valide` : une séance non bloquante laisse tout ouvert sans que rien soit réussi.
    ouvreSuite: (etat) => !R || R.blocant === false || !!(etat && (etat.valide || etat.force)),

    html(etat0) {
      const etat = Object.assign(vide(), etat0 || {});
      const t2 = !R || !!etat.valide || !!etat.force;
      const juge = etat.juge || {};
      const aJuge = Object.keys(juge).length > 0;
      // La porte de sortie n'apparaît qu'après N essais infructueux : elle débloque, elle ne
      // remplace pas le travail. `ESSAIS === null` la supprime pour cette séance.
      const issueOuverte = !!R && ESSAIS !== null && !t2 && (etat.essais || 0) >= ESSAIS;

      const tete = `
        <div class="ent-tete"><h2>${ech(PLAN.titre || 'Plan')}</h2></div>
        ${PLAN.consigne ? `<p class="note">${ech(PLAN.consigne)}</p>` : ''}`;

      const carte = `<div class="plan-boite">
        ${svgPlan(PLAN, { noms: t2, id: 'reperage' })}
        ${legendePlan(PLAN)}
      </div>`;

      if (!R) return tete + carte;

      const lien = PLAN.enLigne && PLAN.enLigne.url
        ? `<a class="btn btn-s" href="${ech(PLAN.enLigne.url)}" target="_blank" rel="noopener"
             >${ech(PLAN.enLigne.libelle || 'Ouvrir un plan en ligne')}</a>`
        : '';

      // Le quartier n'apparaît qu'après le filet de sécurité, ou une fois le repérage fait.
      const montrerZone = !!etat.secours || t2;

      const lignes = PLAN.points.map((p, i) => {
        const val = etat.cases[p.id] == null ? '' : String(etat.cases[p.id]);
        const j = juge[p.id];
        // Classes propres plutôt que `.juste` / `.faux` du noyau : celles-ci repeignent
        // tout le texte de la ligne en vert ou en rouge, ce qui rendrait l'adresse
        // illisible. Ici, c'est un liseré sur le bord gauche, et la case elle-même.
        const etatCl = !aJuge ? '' : (j ? 'plan-ok' : 'plan-ko');
        return `<tr class="${etatCl}">
          <td class="num mono">${i + 1}</td>
          <td>${ech(p.adresse || '')}</td>
          <td class="plan-zone">${montrerZone ? ech(p.zone || '') : '<span class="note">—</span>'}</td>
          <td><input class="champ plan-case ${etatCl}" data-case="${ech(p.id)}" value="${ech(val)}"
                maxlength="4" size="4" aria-label="Case du point ${i + 1}"
                ${t2 ? 'disabled' : ''}></td>
          <td class="plan-verdict">${!aJuge ? '' : (j
            ? '<span class="pastille ok">juste</span>'
            : '<span class="pastille crit">à revoir</span>')}</td>
        </tr>`;
      }).join('');

      const bilan = !aJuge ? '' : (assezJustes(juge)
        ? `<div class="avis avis-ok">${faux(juge) === 0
             ? `Les ${PLAN.points.length} points sont bien situés.`
             : `${faux(juge)} point(s) restent mal situés, mais vous pouvez continuer.`}
             Les noms sont maintenant affichés sur le plan.</div>`
        : `<div class="avis avis-err">${faux(juge)}
             point(s) encore mal situé(s). Reprenez-les sur le plan, puis validez de nouveau.</div>`);

      return `${tete}
        ${R.consigne ? `<p class="note">${ech(R.consigne)}</p>` : ''}
        ${carte}
        <div class="plan-reperage">
          <div class="plan-barre">
            ${lien}
            ${t2 ? '' : `<button class="btn btn-s plan-secours" data-plan-secours
                 title="Affiche le quartier de chaque point. La case du quadrillage reste à trouver."
                 ${etat.secours ? 'disabled' : ''}>${ech(R.secours || 'Je n’ai pas accès à Internet')}</button>`}
          </div>
          ${etat.secours ? `<p class="note">Quartiers affichés, faute d'accès à Internet.
            La case du quadrillage reste à lire sur le plan.</p>` : ''}
          <div class="ent-scroll"><table class="plan-table"><thead><tr>
            <th class="num">N°</th><th>Adresse</th><th>Quartier</th>
            <th>${ech((R.champ || 'Case') + '')}</th><th></th>
          </tr></thead><tbody>${lignes}</tbody></table></div>
          ${bilan}
          ${!etat.force ? '' : `<div class="avis">Vous avez continué sans avoir situé tous les
            points. Les noms sont affichés pour que vous puissiez travailler la suite, mais le
            repérage n'est pas validé — votre enseignant le voit.</div>`}
          <div class="rangee" style="margin-top:14px">
            ${t2
              ? (etat.valide
                ? '<span class="pastille ok">Repérage validé</span>'
                : '<span class="pastille warn">Repérage non validé</span>')
              : `<button class="btn btn-p" data-plan-valider>Valider le repérage</button>
                 ${issueOuverte ? `<button class="btn btn-s plan-issue" data-plan-issue
                      title="Les noms s'afficheront et vous pourrez continuer, mais le repérage ne sera pas compté comme réussi"
                      >${ech(R.issue || 'Je ne trouve pas, continuer quand même')}</button>` : ''}`}
          </div>
        </div>`;
    },

    // `api` = { etat, sauver(), redessiner(), toast(msg) } — fourni par la vue hôte.
    brancher(z, api) {
      const etat = api.etat;
      if (!etat.cases) etat.cases = {};

      z.querySelectorAll('[data-case]').forEach((el) => {
        const maj = () => { etat.cases[el.dataset.case] = el.value; api.sauver(); };
        el.addEventListener('input', maj);
        el.addEventListener('change', maj);
      });

      z.querySelector('[data-plan-secours]')?.addEventListener('click', () => {
        etat.secours = Date.now();
        api.sauver(); api.redessiner();
      });

      z.querySelector('[data-plan-valider]')?.addEventListener('click', () => {
        etat.juge = juger(etat);
        etat.essais = (etat.essais || 0) + 1;
        const fini = assezJustes(etat.juge);
        if (fini) etat.valide = Date.now();
        api.sauver(); api.redessiner();
        if (api.toast) api.toast(fini ? 'Repérage validé.' : 'Repérage à reprendre.');
      });

      // La porte de sortie. Elle n'écrit PAS `valide` : l'élève repart, le suivi garde la trace
      // qu'il n'avait pas trouvé. Débloquer n'est pas valider.
      z.querySelector('[data-plan-issue]')?.addEventListener('click', () => {
        etat.force = Date.now();
        api.sauver(); api.redessiner();
        if (api.toast) api.toast('Vous pouvez continuer. Le repérage reste à revoir.');
      });
    },
  };
}
