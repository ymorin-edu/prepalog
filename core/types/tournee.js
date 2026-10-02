// Vue « tournée » — organiser l'ordre des arrêts sous contrainte, puis reporter ses résultats.
//
// Seconde des deux vues de transport du noyau, écrite le 02/10/2026. Comme la vue plan, elle
// ne connaît ni l'entreprise, ni le véhicule, ni l'unité : **le contenu déclare ce qui se
// cumule et ce qui est plafonné**. Le noyau tient l'ordre, les déplacements, les cumuls, les
// jauges, les cases de report et leur correction.
//
// **Le geste principal est le clic sur la carte** (depuis le 04/10/2026, voir `CLIQUABLE` plus
// bas) : l'élève clique les clients dans l'ordre où il veut y passer, et chacun s'ajoute à la
// fin de la tournée. C'est le geste du métier, et c'est le seul qui marche partout — le clic
// n'a jamais échoué sur un poste, contrairement au glisser-déposer.
//
// Deux autres gestes restent, pour que personne ne reste bloqué (décision de Tristan du
// 02/10/2026) : l'élève **glisse** les arrêts pour les ordonner, et deux **flèches** font la
// même chose au clic. Ce ne sont plus les gestes de construction mais ceux de la retouche —
// insérer un arrêt au milieu sans défaire la fin. C'est le même choix que dans
// `core/types/ordre.js`.
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
import { creerGrille } from './grille.js';

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
  // Le numéro du client, celui que portent la fiche de tournée, le mail du responsable et le
  // rond bleu de la carte. Il ne bouge jamais ; l'ordre de passage, lui, est la pastille verte.
  const numeroDe = (id) => {
    const p = pointDe(id);
    if (p && p.numero != null) return p.numero;
    const i = POINTS.findIndex((q) => String(q.id) === String(id));
    return i < 0 ? '' : i + 1;
  };

  // ── La carte cliquable ──────────────────────────────────────────────────────────────────
  // Tristan, le 03/10/2026, après avoir fait tourner ENT-3.1 : *« en termes d'ergonomie je ne
  // suis pas totalement satisfait. Tout est laborieux, on pourrait repartir sur une carte
  // cliquable beaucoup plus intuitive ? »* Charger six commandes demandait six clics dans une
  // liste, les ordonner une dizaine de plus, et au moment d'ordonner la carte était déjà sortie
  // de l'écran.
  //
  // Donc : **on construit la tournée en cliquant les points sur la carte, dans l'ordre où on
  // veut y passer.** Un clic sur un point à quai l'ajoute À LA FIN de la tournée ; un clic sur
  // un point déjà chargé le retire. C'est aussi plus proche du métier — un logiciel de tournées
  // se pilote à la carte — et c'est le cahier des charges de Logisim.
  //
  // **Ajouter à la fin** est la règle la plus simple à expliquer à une classe : on ne discute
  // pas de l'endroit où l'arrêt se glisse, on le met au bout et on retouche ensuite avec les
  // flèches du récapitulatif. Celui-ci ne disparaît donc pas : c'est lui qui permet d'insérer
  // un arrêt au milieu sans défaire la fin, et c'est le second chemin si un poste du lycée
  // rendait le clic sur SVG capricieux.
  //
  // Elle n'existe que s'il y a un plan : sans carte, le récapitulatif reste la seule interface.
  const CLIQUABLE = !!PLAN && T.carteCliquable !== false;

  // Chaque clic redessine la vue entière, donc l'élément qui avait le focus DISPARAÎT. Au
  // clavier, l'élève se retrouvait renvoyé en haut de la page : son premier Entrée ajoutait
  // bien l'arrêt, le second ne faisait plus rien. Vu à l'essai, pas par un test — d'où ce
  // report du focus sur le même point après le redessin.
  //
  // Il n'est armé QUE par le clavier. Le rendre aussi après un clic de souris déplacerait la
  // page sous le curseur de l'élève à chaque arrêt ajouté.
  let focusApresRedessin = null;

  // ── Les jauges se taisent ───────────────────────────────────────────────────────────────
  // `jaugesRepere: true`. Dès qu'on demande à l'élève de CALCULER le poids total et le temps,
  // les jauges ne doivent plus les afficher : sinon il lit *179 kg* sur la jauge, il le
  // recopie dans sa case, et la feuille de calcul ne sert à rien. C'est exactement le défaut
  // que Tristan avait relevé le 03/10 sur les cases de report — *« aucun travail de tournée à
  // faire »* — transposé d'un cran.
  //
  // Ce que l'outil continue de donner, parce que ce ne sont pas des compétences : la
  // **distance** du parcours (c'est de la géométrie sur une carte, et c'est le produit du
  // clic), le poids de chaque commande, la vitesse, le temps par arrêt, et les **limites**.
  // Ce qu'il ne donne plus : le poids **total**, le temps **total** et l'heure de retour.
  //
  // Les jauges deviennent donc des repères de limite. Elles gardent une chose, et une seule :
  // dire QUE la limite est franchie — sans dire de combien, ce qui redonnerait le total par
  // soustraction. Sans ça, l'élève n'aurait plus aucun moyen de savoir que son vélo-cargo est
  // trop chargé, et la contrainte disparaîtrait de la séance.
  //
  // Et elles se remplissent **après** validation, comme retour : le travail fait, le chiffre
  // revient.
  const REPERE = !!T.jaugesRepere;

  // La feuille de calcul, facultative. Elle n'est pas une vue de menu : elle se pose dans
  // cette page, sous les jauges, parce qu'elle est tirée des données que l'élève vient de
  // construire en cliquant.
  // ── Les deux bouts de la chaîne sont des arrêts à poser ─────────────────────────────────
  // `extremitesACliquer: true`. Tristan, le 04/10 : *« l'élève ne sélectionne ni le départ
  // (entrepôt Boost) ni l'arrivée (la gare) »*. Tant qu'ils étaient du décor, l'élève pouvait
  // finir la séance sans voir que sa tournée part de l'entrepôt et finit à la gare — alors que
  // ces deux trajets pèsent dans la distance et dans le temps qu'on lui fait calculer.
  //
  // Ils se cliquent donc comme les clients, et la tournée n'est **complète** que quand les deux
  // sont posés. Ils restent aux extrémités : on ne discute pas de l'endroit où ils vont, c'est
  // précisément la leçon — une tournée part du dépôt et finit là où on l'a dit.
  const EXTREMITES = !!T.extremitesACliquer;
  const departPose = (e) => !EXTREMITES || !!(e && e.depart);
  const arriveePose = (e) => !EXTREMITES || !!(e && e.arrivee);
  const chaineComplete = (e) => departPose(e) && arriveePose(e);

  const estRevele = (e) => !!(e && e.valide && e.juge && Object.keys(e.juge).length);

  const GRILLE = T.grille ? creerGrille(T.grille) : null;
  // ── Les contraintes descendent dans la feuille de calcul ─────────────────────────────────
  // `contraintesDansGrille: true`. Tristan, le 05/10 : *« les contraintes de droite descendent
  // dans la partie tableur »*. Les jauges quittaient l'écran de la carte pour se poser à droite
  // de la feuille : l'élève calcule son poids total et son heure d'arrivée à gauche, et lit à
  // droite si la limite est tenue — la comparaison qu'on lui demande de faire se fait d'un coup
  // d'œil. La carte et le récapitulatif, eux, se partagent le haut de la page.
  const DANS_GRILLE = !!T.contraintesDansGrille && !!GRILLE;
  const lignesGrille = (etat) => (T.grille && T.grille.lignes ? T.grille.lignes(bilanDe(etat)) : []);

  // ── D'où part l'élève : véhicule vide, ou véhicule plein ? ──────────────────────────────
  // Par défaut, tous les arrêts sont déjà chargés et l'élève retire ce qui ne passe pas.
  // `departAQuai: true` inverse le geste : le véhicule part **vide** et l'élève le charge.
  //
  // Tristan, le 03/10/2026 : *« lorsqu'on débloque la tournée, toutes les commandes sont
  // sélectionnées, ce n'est pas intuitif, je préfère qu'elle commence dans la catégorie
  // laissés à quai »*. Il a raison, et c'est aussi le geste réel : on charge un véhicule, on
  // ne le décharge pas. La jauge part alors de zéro et monte jusqu'au plafond, ce qui montre
  // la contrainte au lieu de l'annoncer.
  //
  // L'option reste déclarative : un scénario où le transporteur arrive déjà chargé et où le
  // travail consiste à retirer le surplus garde l'ancien comportement sans rien écrire.
  const vide = () => (T.departAQuai
    ? { ordre: [], quai: POINTS.map((p) => String(p.id)), report: {}, juge: {}, valide: null }
    : { ordre: POINTS.map((p) => String(p.id)), quai: [], report: {}, juge: {}, valide: null });

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
    // Le trajet ne compte que les bouts RÉELLEMENT posés. Une chaîne incomplète donne donc une
    // distance plus courte — et c'est exactement pour ça que le report des résultats la refuse :
    // sans ce garde-fou, oublier la gare deviendrait la façon la plus simple d'attraper le train.
    let km = 0, minutes = 0, arrivee = null;
    if (H && PLAN && retenus.length) {
      const suite = [];
      if (PLAN.depart && departPose(etat)) suite.push(PLAN.depart);
      retenus.forEach((p) => suite.push(p));
      if (PLAN.arrivee && arriveePose(etat)) suite.push(PLAN.arrivee);
      for (let i = 1; i < suite.length; i++) km += distanceKm(PLAN, suite[i - 1], suite[i]);
      minutes = km / H.vitesse * 60 + retenus.length * (H.service || 0);
      arrivee = H.depart + minutes;
    }
    const enRetard = !!(H && arrivee != null && H.limite != null && arrivee > H.limite);

    return {
      retenus, ecartes, cumuls, km, minutes, arrivee, depassements, enRetard,
      // Exposé pour les jalons du contenu, qui doivent pouvoir distinguer « mal organisé » de
      // « pas fini ». `arrivee` est déjà l'HEURE de retour, d'où les noms explicites.
      departPose: departPose(etat), arriveePose: arriveePose(etat), complete: chaineComplete(etat),
    };
  }

  /* --------------------------------------------------------------------------- les jauges */
  // `muet` : la jauge est un repère de limite et ne dit plus le total. Elle perd aussi sa
  // barre — un trait rempli à 99 % sur un plafond de 180 kg annoncerait « 179 » aussi sûrement
  // que le chiffre.
  function jauge(m, valeur, muet) {
    const max = m.max;
    const trop = max != null && valeur > max;
    const part = max ? Math.min(100, valeur / max * 100) : 0;
    // Seules les mesures PLAFONNÉES se taisent. Une mesure sans plafond n'est pas une
    // contrainte, donc il n'y a pas de « repère de limite » à en faire — et afficher
    // « à calculer » sur un total que personne ne demande enverrait l'élève travailler pour
    // rien. Vu à l'écran : les colis de Boost n'ont pas de maximum et aucune case ne les
    // réclame ; leur jauge disait pourtant « à calculer ».
    if (muet && max != null) {
      return `<div class="tour-jauge tour-jauge-repere ${trop ? 'trop' : ''}">
        <div class="tour-j-tete"><span>${ech(m.libelle)}</span>
          <b class="mono">max ${fr(max)} ${ech(m.unite || '')}</b></div>
        <span class="note">C'est la limite à ne pas dépasser.
          Le total, c'est à vous de le calculer.</span>
        ${m.comparaison ? `<span class="tour-compare">${ech(m.comparaison)}</span>` : ''}
        ${trop ? `<span class="pastille crit">${ech(m.libelle)} dépassée</span>`
          : (DANS_GRILLE && valeur > 0 ? '<span class="pastille ok">limite respectée</span>' : '')}
      </div>`;
    }
    return `<div class="tour-jauge ${trop ? 'trop' : ''}">
      <div class="tour-j-tete"><span>${ech(m.libelle)}</span>
        <b class="mono">${fr(valeur)}${max != null ? ` / ${fr(max)}` : ''} ${ech(m.unite || '')}</b></div>
      ${max != null ? `<div class="tour-j-barre"><i style="width:${part}%"></i></div>` : ''}
      ${trop ? `<span class="pastille crit">${ech(m.libelle)} dépassée de ${fr(valeur - max)} ${ech(m.unite || '')}</span>` : ''}
    </div>`;
  }

  function jaugeHoraire(b, muet) {
    if (!H || b.arrivee == null) return '';
    const part = H.limite ? Math.min(100, (b.arrivee - H.depart) / (H.limite - H.depart) * 100) : 0;
    if (muet) {
      // La distance reste donnée : elle est le produit du parcours cliqué, pas un calcul que
      // l'élève doit savoir faire. Le nombre d'arrêts et le temps par arrêt aussi — ce sont
      // les données de son calcul, pas son résultat.
      return `<div class="tour-jauge tour-jauge-repere ${b.enRetard ? 'trop' : ''}">
        <div class="tour-j-tete"><span>${ech(H.libelleLimite || 'Horaire limite')}</span>
          <b class="mono">${H.limite != null ? hhmm(H.limite) : '—'}</b></div>
        ${DANS_GRILLE
          // Les données du calcul (distance, vitesse, arrêts) sont dans la feuille, à gauche :
          // les répéter ici les ferait lire deux fois sans rien apprendre.
          ? `<span class="note">Il faut être à la gare avant cette heure.
              L'heure d'arrivée, c'est à vous de la calculer.</span>`
          : `<span class="note">Départ à ${hhmm(H.depart)}. ${fr(b.km, 1)} km à parcourir,
              ${b.retenus.length} arrêt${b.retenus.length > 1 ? 's' : ''},
              ${ech(String(H.service || 0))} min par arrêt, ${ech(String(H.vitesse))} km/h en ville.
              L'heure de retour, c'est à vous de la calculer.</span>`}
        ${H.comparaison ? `<span class="tour-compare">${ech(H.comparaison)}</span>` : ''}
        ${b.enRetard ? `<span class="pastille crit">${ech(H.libelleLimite || 'Horaire limite')} manqué</span>`
          : (DANS_GRILLE && b.complete ? '<span class="pastille ok">horaire tenu</span>' : '')}
      </div>`;
    }
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

      // Le récapitulatif, compact : une ligne par arrêt. Le numéro du client est posé AVANT le
      // nom — « 3 · La Pointe Sud » — pour faire le lien avec la fiche et avec le rond bleu de
      // la carte, et il reste en dehors du `<strong>` qui ne porte que le nom.
      const ligne = (id, pos) => {
        const p = pointDe(id);
        if (!p) return '';
        return `<li class="tour-item" draggable="true" data-pos="${pos}">
          <span class="tour-rang">${pos + 1}</span>
          <span class="tour-texte">
            <span class="tour-nom"><span class="tour-num mono">${ech(numeroDe(id))} ·</span><strong>${ech(p.nom)}</strong></span>
            <span class="note">${ech(p.zone || '')}${MESURES.map((m) => ` · ${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join('')}</span>
          </span>
          <span class="tour-boutons">
            <button class="btn btn-s" data-haut="${pos}" ${pos === 0 ? 'disabled' : ''}
              aria-label="Monter ${ech(p.nom)}">↑</button>
            <button class="btn btn-s" data-bas="${pos}" ${pos === n - 1 ? 'disabled' : ''}
              aria-label="Descendre ${ech(p.nom)}">↓</button>
            <button class="btn btn-s" data-quai="${ech(id)}"
              title="Laisser cet arrêt à quai, pour une autre tournée">retirer</button>
          </span>
        </li>`;
      };

      // Les deux bouts de la chaîne, encadrant le récapitulatif : l'élève lit sa tournée de
      // haut en bas comme elle se déroule — on part de l'entrepôt, on passe les clients, on
      // finit à la gare. Tant qu'un bout n'est pas posé, la ligne le dit et le bouton l'offre :
      // la carte reste le geste principal, mais personne ne doit rester coincé parce qu'il n'a
      // pas vu qu'un carré se cliquait.
      const bout = (quoi) => {
        if (!EXTREMITES || !PLAN) return '';
        const p = quoi === 'depart' ? PLAN.depart : PLAN.arrivee;
        if (!p) return '';
        const pose = quoi === 'depart' ? !!etat.depart : !!etat.arrivee;
        const mot = quoi === 'depart' ? 'Départ' : 'Arrivée';
        return `<div class="tour-bout${pose ? ' tour-bout-pose' : ''}">
          <span class="tour-rang tour-rang-bout">${quoi === 'depart' ? 'D' : 'A'}</span>
          <span class="tour-texte"><span class="tour-nom">
            <span class="tour-bout-lbl mono">${ech(mot)} ·</span><strong>${ech(p.nom)}</strong></span>
            <span class="note">${pose
              ? (quoi === 'depart' ? 'La tournée part d’ici.' : 'La tournée se termine ici.')
              : `À placer : cliquez ${quoi === 'depart' ? 'l’entrepôt' : 'ce point'} sur la carte.`}</span>
          </span>
          <span class="tour-boutons">
            <button class="btn btn-s" data-bout="${quoi}">${pose ? 'retirer' : 'placer'}</button>
          </span>
        </div>`;
      };

      // Les laissés à quai : un bandeau de puces et non plus une seconde liste de cartes.
      // Deux listes symétriques se confondaient (quatrième défaut relevé par Tristan) et elles
      // poussaient la carte hors de l'écran au moment même où l'élève en avait besoin. Ici,
      // c'est une ligne de puces, et la carte reste visible.
      const quai = `<div class="tour-quai">
        <div class="ent-lbl">${ech(T.libelleQuai || 'Laissés à quai')} (${etat.quai.length})</div>
        ${etat.quai.length === 0
          ? '<p class="note">Aucun. Tout est chargé dans le véhicule.</p>'
          : `<ul class="tour-liste tour-liste-quai tour-puces">${etat.quai.map((id) => {
              const p = pointDe(id);
              return !p ? '' : `<li class="tour-item tour-puce">
                <span class="tour-texte">
                <span class="tour-nom"><span class="tour-num mono">${ech(numeroDe(id))} ·</span><strong>${ech(p.nom)}</strong></span>
                <span class="note">${MESURES.map((m) => `${fr(Number(p[m.champ] || 0))} ${ech(m.unite || '')}`).join(' · ')}</span>
                </span><span class="tour-boutons">
                <button class="btn btn-s" data-reprendre="${ech(id)}">${ech(T.libelleCharger || 'reprendre')}</button>
                </span></li>`;
            }).join('')}</ul>`}
      </div>`;

      // Les jauges se taisent tant que le travail n'est pas validé. Après, elles le rendent :
      // c'est le retour, et il n'a plus rien à donner puisque l'élève a déjà répondu.
      //
      // Le dévoilement suit la correction EN COURS (`juge`), pas seulement l'horodatage de la
      // validation : `juge` est effacé dès que l'élève touche à sa tournée, donc les jauges se
      // retaisent au premier changement. Se fier au seul `valide` laissait une validation
      // ancienne dévoiler les totaux d'une tournée qui n'avait plus rien à voir.
      const muet = REPERE && !estRevele(etat);

      // Ce que dit la feuille quand ses formules sont toutes justes et que la tournée, elle,
      // ne tient pas : l'élève doit voir que ce n'est PAS son calcul qui est en cause. On dit
      // QUE une contrainte est franchie, jamais de combien (alerte n° 28).
      const gj = (etat.grille && etat.grille.juge) || {};
      const formulesJustes = Object.keys(gj).length > 0 && Object.values(gj).every((x) => x === 'ok');
      const contrainteFranchie = (b.depassements && b.depassements.length > 0) || b.enRetard;
      const avertissement = DANS_GRILLE && formulesJustes && contrainteFranchie
        ? 'Vos formules sont justes, mais la tournée ne respecte pas toutes les contraintes '
          + '(colonne de droite, en rouge). Le calcul est bon : c’est la tournée qu’il faut revoir.'
        : '';
      const jaugesHtml = `${MESURES.map((m) => jauge(m, b.cumuls[m.id], muet)).join('')}
            ${jaugeHoraire(b, muet)}`;
      const grille = !GRILLE ? '' : GRILLE.html(lignesGrille(etat), etat.grille, DANS_GRILLE
        ? { droite: `<div class="tour-jauges gr-contraintes">${jaugesHtml}</div>`, avertissement }
        : {});

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
          ${etat.bloque ? `<div class="avis avis-err">${ech(etat.bloque)}</div>` : ''}
          ${(etat.bloque || !aJuge) ? '' : (REPORT.every((r) => juge[r.id])
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
        <div class="tour-grille${DANS_GRILLE ? ' tour-grille-deux' : ''}">
          <div class="tour-col">
            ${PLAN ? `<div class="plan-boite${CLIQUABLE ? ' plan-boite-clic' : ''}">
              ${svgPlan(PLAN, {
                noms: true, ordre: etat.ordre, cliquable: CLIQUABLE, id: 'tournee',
                extremites: EXTREMITES, departPose: etat.depart, arriveePose: etat.arrivee,
              })}
              ${legendePlan(PLAN, { ordre: etat.ordre, extremites: EXTREMITES })}
            </div>` : ''}
            ${DANS_GRILLE ? '</div><div class="tour-col">' : ''}
            ${T.libelleCharge ? `<div class="ent-lbl">${ech(T.libelleCharge)} (${n})</div>` : ''}
            ${n === 0
              ? (CLIQUABLE
                ? `<p class="note">Rien n'est chargé. <strong>Cliquez les clients sur la carte</strong>,
                   dans l'ordre où vous voulez y passer : chacun s'ajoute à la fin de la tournée.${
                     EXTREMITES ? ' Et n’oubliez pas les deux bouts : le départ et l’arrivée se cliquent aussi.' : ''}</p>`
                : `<p class="note">Rien n'est chargé. Prenez les arrêts dans
                   « ${ech(T.libelleQuai || 'Laissés à quai')} » ci-dessous, puis ordonnez-les.</p>`)
              : (CLIQUABLE
                ? `<p class="note">Cliquez un client de la carte pour l'ajouter à la fin, ou pour le
                   retirer s'il est déjà chargé. Le tracé du plan suit votre ordre ; les flèches
                   ↑ et ↓ servent à insérer un arrêt au milieu.</p>`
                : `<p class="note">Glissez les arrêts pour les ordonner, ou utilisez les flèches
                   ↑ et ↓.${PLAN ? ' Le tracé du plan suit votre ordre.' : ''}</p>`)}
            ${bout('depart')}
            <ul class="tour-liste" id="tourListe">
              ${etat.ordre.map((id, i) => ligne(id, i)).join('')}
            </ul>
            ${bout('arrivee')}
            ${quai}
          </div>
          ${DANS_GRILLE ? '' : `<div class="tour-jauges">${jaugesHtml}</div>`}
        </div>
        ${grille}
        ${cases}`;
    },

    // Exposé pour les jalons du contenu : `verifier(db)` recalcule le bilan sans dessiner.
    bilan: bilanDe,

    brancher(z, api) {
      const etat = api.etat;
      if (!etat.ordre) Object.assign(etat, vide());
      if (!etat.report) etat.report = {};

      // Un ordre ou un chargement modifié invalide tout ce qui avait été jugé : les résultats
      // reportés ne valent plus rien. Les effacer est plus honnête que de laisser « juste »
      // affiché sous une tournée qui a changé.
      //
      // **`valide` part avec le reste**, et c'est ce qui manquait : il commande aussi le
      // dévoilement des jauges (`jaugesRepere`). Sans ça, un élève validait une tournée facile,
      // les jauges lui rendaient les totaux, et il lisait ensuite les chiffres de n'importe
      // quelle autre tournée sans plus rien calculer — le défaut même qu'on corrigeait.
      const invalider = () => {
        etat.juge = {};
        etat.bloque = null;
        etat.valide = null;
        // La correction de la feuille ne vaut plus rien non plus : les données ont changé sous
        // les formules. Sans ça, « juste » restait affiché sur un total devenu faux, et le
        // message « vos formules sont justes, mais… » se fondait sur un verdict périmé.
        if (etat.grille) { etat.grille.juge = {}; etat.grille.valide = null; }
      };

      const deplacer = (de, vers) => {
        if (vers < 0 || vers >= etat.ordre.length) return;
        const [x] = etat.ordre.splice(de, 1);
        etat.ordre.splice(vers, 0, x);
        invalider();
        api.sauver(); api.redessiner();
      };

      z.querySelectorAll('[data-haut]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.haut, +btn.dataset.haut - 1);
      }));
      z.querySelectorAll('[data-bas]').forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation(); deplacer(+btn.dataset.bas, +btn.dataset.bas + 1);
      }));
      // Retirer et charger, les deux seuls mouvements entre la tournée et le quai. Le clic sur
      // la carte ci-dessous ne fait rien d'autre que les appeler : un seul chemin de code, donc
      // un seul endroit où l'état peut se tromper.
      const retirer = (id) => {
        etat.ordre = etat.ordre.filter((x) => String(x) !== String(id));
        if (!etat.quai.some((x) => String(x) === String(id))) etat.quai.push(String(id));
        invalider();
        api.sauver(); api.redessiner();
      };
      // **À la fin, toujours.** C'est la règle expliquée à la classe, et c'est ce qui fait de la
      // carte une construction et non une correction.
      const charger = (id) => {
        etat.quai = etat.quai.filter((x) => String(x) !== String(id));
        if (!etat.ordre.some((x) => String(x) === String(id))) etat.ordre.push(String(id));
        invalider();
        api.sauver(); api.redessiner();
      };

      z.querySelectorAll('[data-quai]').forEach((btn) => btn.addEventListener('click', () => {
        retirer(btn.dataset.quai);
      }));
      z.querySelectorAll('[data-reprendre]').forEach((btn) => btn.addEventListener('click', () => {
        charger(btn.dataset.reprendre);
      }));

      // Les deux bouts : même bascule que les clients, au clic sur la carte comme au bouton du
      // récapitulatif. Les poser ou les retirer invalide la correction comme n'importe quel
      // autre changement — la tournée n'est plus la même.
      const basculerBout = (quoi) => {
        const cle = quoi === 'depart' ? 'depart' : 'arrivee';
        etat[cle] = etat[cle] ? null : Date.now();
        invalider();
        api.sauver(); api.redessiner();
      };
      z.querySelectorAll('[data-bout]').forEach((btn) => btn.addEventListener('click', () => {
        basculerBout(btn.dataset.bout);
      }));
      z.querySelectorAll('[data-clic-extremite]').forEach((cible) => {
        const quoi = cible.dataset.clicExtremite;
        cible.addEventListener('click', () => basculerBout(quoi));
        cible.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          basculerBout(quoi);
        });
      });

      // Le clic sur la carte. Un point déjà chargé se retire, un point à quai s'ajoute à la
      // fin : le même geste dans les deux sens, comme une case qu'on cocherait.
      //
      // Le CLAVIER est traité ici et non plus tard : chaque cible est un bouton (`role`,
      // `tabindex` posés dans `svgPlan`), donc Entrée et Espace doivent faire ce que fait la
      // souris. `preventDefault` sur Espace empêche la page de défiler sous l'élève.
      z.querySelectorAll('[data-clic-point]').forEach((cible) => {
        const id = cible.dataset.clicPoint;
        const basculer = () => {
          if (etat.ordre.some((x) => String(x) === String(id))) retirer(id); else charger(id);
        };
        cible.addEventListener('click', basculer);
        cible.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          focusApresRedessin = String(id);
          basculer();
        });
      });

      // Le report du focus, après que les cibles du nouveau dessin sont branchées.
      if (focusApresRedessin) {
        const vise = focusApresRedessin;
        focusApresRedessin = null;
        z.querySelectorAll('[data-clic-point]').forEach((c) => {
          if (String(c.dataset.clicPoint) === vise && c.focus) c.focus();
        });
      }

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

      // La feuille de calcul. Elle a son propre état, rangé dans celui de la tournée : ses
      // formules survivent à un changement d'ordre, et c'est voulu — l'élève qui déplace un
      // arrêt ne doit pas avoir à réécrire `=SOMME(B2:B7)`. Les valeurs, elles, recalculent
      // toutes seules, et sa correction est effacée parce qu'elle ne vaut plus rien.
      if (GRILLE) {
        if (!etat.grille) etat.grille = { cases: {}, juge: {}, valide: null };
        GRILLE.brancher(z, {
          etat: etat.grille,
          lignes: () => lignesGrille(etat),
          sauver: api.sauver,
          redessiner: api.redessiner,
          toast: api.toast,
        });
      }

      z.querySelectorAll('[data-report]').forEach((el) => {
        const maj = () => { etat.report[el.dataset.report] = el.value; api.sauver(); };
        el.addEventListener('input', maj);
        el.addEventListener('change', maj);
      });

      z.querySelector('[data-tour-valider]')?.addEventListener('click', () => {
        const b = bilanDe(etat);
        // ── Les résultats ne se valident pas tant que la tournée ne tient pas ──────────────
        // Défaut relevé par Tristan le 03/10/2026 : *« il suffit de garder les 6 premières et
        // on tombe juste, aucun travail de tournée à faire »*. Il a raison, et la cause est
        // structurelle : chaque case se corrige contre le bilan DE L'ÉLÈVE, donc une case ne
        // peut jamais juger son ordre. Dans ENT-3.1 (à l’époque des quatre cases), les valeurs attendues étaient même
        // identiques quel que soit l'ordre — 237, 57, 179, 36 — si bien qu'un élève obtenait
        // 4/4 en manquant le train de cinquante minutes.
        //
        // La réponse n'est pas de tordre une case, c'est de refuser le report tant que les
        // contraintes sont violées. L'élève est renvoyé à sa tournée, pas à son calcul, et
        // l'écran cesse de se contredire (quatre « juste » sous une jauge rouge).
        //
        // Déclaratif : `exigeConforme: true`. Une séance où le report porte sur un chargement
        // volontairement impossible n'en veut pas.
        const muetAuReport = REPERE && !estRevele(etat);
        if (T.exigeConforme) {
          // Quand les jauges se taisent, ce message doit se taire aussi : « dépassée de 57 kg »
          // sur un plafond de 180 rend le total par une soustraction, et l'élève n'a plus rien
          // à calculer. On dit QUE ça ne passe pas, pas DE COMBIEN.
          const maux = [];
          (b.depassements || []).forEach((id) => {
            const m = MESURES.find((x) => x.id === id);
            if (!m) return;
            maux.push(muetAuReport
              ? `${m.libelle.toLowerCase()} dépassée`
              : `${m.libelle.toLowerCase()} dépassée de ${fr(b.cumuls[id] - m.max)} ${m.unite || ''}`.trim());
          });
          if (b.enRetard) {
            maux.push(muetAuReport
              ? `${H.libelleLimite || 'horaire limite'} manqué`
              : `${H.libelleLimite || 'horaire limite'} manqué de ${fr(b.arrivee - H.limite, 0)} min`);
          }
          if (!b.retenus.length) maux.push('aucun arrêt chargé');
          // La chaîne incomplète est refusée au même titre qu'une charge dépassée. Sans ça,
          // oublier la gare raccourcit le trajet et fait attraper le train sans rien faire —
          // le même trou que « il suffit de garder les 6 premières », à un autre endroit.
          if (!b.departPose && !b.arriveePose) maux.push('ni le départ ni l’arrivée ne sont placés');
          else if (!b.departPose) maux.push('le départ n’est pas placé');
          else if (!b.arriveePose) maux.push('l’arrivée n’est pas placée');
          if (maux.length) {
            etat.bloque = `Votre tournée ne tient pas encore : ${maux.join(', ')}. `
              + 'Reprenez le chargement et l’ordre des arrêts avant de reporter vos résultats.';
            etat.juge = {};
            etat.valide = null;
            api.sauver(); api.redessiner();
            if (api.toast) api.toast('Tournée à revoir avant de reporter.');
            return;
          }
        }
        etat.bloque = null;
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
