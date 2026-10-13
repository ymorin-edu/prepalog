// Suite de tests de Prepalog — bloc « carte-region » : la carte des itinéraires (core/types/carte-itineraires.js), d'un
// point A à un point B par plusieurs modes, sur la carte réelle d'Anvers à Rouvignies et Dourges (contenus/decathlon-carte.js).
// Brief docs/briefs/MOTEUR-carte-regionale.md, lot 2 (13/10/2026). `node outils/test.mjs carte-region` ne lance que ce bloc.
//
// Montée dans le vrai moteur d'entreprise, décor Boost (la séance Decathlon n'existe pas encore), comme le bloc `carte`.
//
// Valeurs ÉCRITES À LA MAIN, relevées au build du 13/10/2026 (`outils/carte/construire-region.py`, km sur la sphère) :
//   vers Rouvignies : route 168 ; barge 194 + camion 13 = 207 ; rail 162 + camion 45 = 207 ;
//   vers Dourges    : route 153 ; barge 263 + camion 3 = 266 ; rail 162 + camion 3 = 165.
// Facteurs du CO₂ (brief 7.1 §6.2, kg CO₂ par tonne-km) : camion 0,051 · barge 0,020 · rail 0,0165.
// Ordre voulu : vers Rouvignies barge < rail < route ; vers Dourges rail < barge < route (13,5 et 15,8 t).
//
// Ce que la suite NE refait pas : le build (il lui faut Python, shapely et les extractions OSM, absents de GitHub). Sa
// reproductibilité et l'identité des cartes de Nîmes et de la côte se contrôlent en relançant les scripts (compte rendu
// du brief) ; ici, on garde la vue et les chiffres qu'elle affiche.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ctxCi = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxCi.newPage();
pg.setDefaultTimeout(8000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const SEANCE = 'essai-itin';
// `o` : { destination, quadrillage, role, marque (l'écluse de Kain, visible quand `db.alea` est vrai) }.
const monter = (o = {}) => pg.evaluate(async (o) => {
  document.getElementById('ci-hote')?.remove();
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const B = await import('/contenus/boost.js');
  const { CARTE } = await import('/contenus/decathlon-carte.js');
  const moteur = creerEntreprise({
    ENTREPRISE: B.ENTREPRISE, VOCAB: B.VOCAB, CATALOGUE: B.CATALOGUE, SUPPLIERS: B.SUPPLIERS,
    SUP_BY_ID: B.SUP_BY_ID, CUSTOMERS: B.CUSTOMERS, CM: B.CM, baseDeDepart: B.baseDeDepart, THEME: B.THEME,
    // `o.etape` : un jalon d'essai, pour que la note remonte (sans jalon, le moteur ne remonte rien).
    etapes: o.etape ? [{ id: 'essai', titre: 'Essai', verifier: () => ({ status: 'attente' }) }] : [], exercice: 'Essai',
    carteItineraires: {
      carte: CARTE, destination: o.destination || 'rouvignies', titre: 'Trois façons de venir d’Anvers',
      alt: `Carte d'Anvers à ${o.destination === 'dourges' ? 'Dourges' : 'Rouvignies'} : trois itinéraires, route, barge et rail`,
      offres: (mode) => ({ route: ['Transports Nord Express', 'Delmotte'], barge: ['Contargo'], rail: ['Rail Fret Benelux'] })[mode],
      quadrillage: !!o.quadrillage,
      // L'écluse de Kain : way OSM 152861639 « Écluse de Kain » (50,6284 N ; 3,3714 E), vérifiée dans l'extraction du 13/10.
      marques: o.marque ? [{ id: 'kain', lonlat: [3.3714, 50.6284], titre: 'Écluse de Kain fermée',
        texte: 'Arrêt de navigation du 02/02 au 05/03', coupe: 'barge', legende: 'Navigation arrêtée', quand: (db) => !!db.alea }] : [],
    },
  });
  const hote = document.createElement('div'); hote.id = 'ci-hote'; document.body.prepend(hote);
  const db = {};
  moteur.rendre(hote, {
    meta: { id: 'essai-itin', code: 'ESSAI', titre: 'Carte — essai', portee: 'eleve', immersif: true },
    profil: { prenom: 'Lea', nom: 'Dupont', role: o.role || 'eleve' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: (r) => { window.__ci.remontees.push(JSON.parse(JSON.stringify(r))); },
    quitter: () => {}, codeStock: '',
  });
  window.__ci = Object.assign(window.__ci && window.__ci.hote === hote ? window.__ci : { remontees: [] }, { db, CARTE, hote });
  hote.querySelector('.ent-nav[data-vue="itineraires"]').click();
}, o);
// Immobile = la viewBox ne bouge plus pendant 5 images (le zoom est animé).
const immobile = () => pg.evaluate(() => new Promise((ok) => {
  let y = null, n = 0;
  const f = () => {
    const s = document.querySelector('[data-ct-svg]');
    const cle = window.scrollY + '|' + (s ? s.getAttribute('viewBox') : '');
    if (cle === y) n++; else { n = 0; y = cle; }
    if (n >= 5) ok(); else requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}));
const presse = () => pg.$$eval('[data-ci-mode]', (bs) => bs.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.ciMode));
// Un clic de SOURIS sur le tracé d'un mode : un point de sa zone de clic qui est, à l'écran, bien sous ce tracé-là
// (elementFromPoint), cherché le long du tronçon le plus long ; puis la souris va à ce pixel.
const cliquerTrace = async (mode) => {
  await immobile();
  const pt = await pg.evaluate((mode) => {
    const chemins = [...document.querySelectorAll(`[data-ci-clic="${mode}"]`)].sort((a, b) => b.getTotalLength() - a.getTotalLength());
    for (const p of chemins) {
      const svg = p.ownerSVGElement, L = p.getTotalLength();
      for (let f = 0.5; f > 0.05; f -= 0.05) {
        for (const g of [f, 1 - f]) {
          const q = p.getPointAtLength(L * g), s = svg.createSVGPoint(); s.x = q.x; s.y = q.y;
          const e = s.matrixTransform(svg.getScreenCTM());
          const el = document.elementFromPoint(e.x, e.y);
          if (el && el.dataset && el.dataset.ciClic === mode && e.y > 0 && e.y < innerHeight) return { x: e.x, y: e.y };
        }
      }
    }
    return null;
  }, mode);
  vrai(pt, `aucun point du tracé « ${mode} » n'est cliquable à l'écran`);
  await pg.mouse.click(pt.x, pt.y);
};

await v('Carte des itinéraires : la vue s’ouvre au menu, sans erreur ni requête hors du site ; mention OpenStreetMap ; texte alternatif sans chiffre', async () => {
  await monter();
  await pg.waitForSelector('[data-ct-svg]');
  await immobile();
  vrai(await pg.isVisible('.ent-nav[data-vue="itineraires"]'), 'entrée de menu « Carte des itinéraires » absente');
  vrai((await pg.textContent('.ct-attrib')).includes('© contributeurs OpenStreetMap'), 'mention OSM absente');
  const alt = await pg.getAttribute('[data-ct-svg]', 'aria-label');
  egal(alt, "Carte d'Anvers à Rouvignies : trois itinéraires, route, barge et rail", 'texte alternatif');
  vrai(!/\d/.test(alt), 'le texte alternatif contient un chiffre');
  vrai((await pg.textContent('.ci-panneau h3')).includes("Trois façons d'aller à Rouvignies"), 'titre de la liste');
  egal(await pg.$$eval('[data-ci-mode]', (bs) => bs.map((b) => b.dataset.ciMode)), ['route', 'barge', 'rail'], 'les trois itinéraires de la liste');
  egal(erreurs, [], 'erreurs de page');
  egal([...hotes], [], 'requêtes hors du site');
});

await v('Carte des itinéraires : distances écrites à la main (vers Rouvignies et vers Dourges), affichées dans la liste et la fiche', async () => {
  const km = await pg.evaluate(() => Object.fromEntries(Object.entries(window.__ci.CARTE.itineraires).map(([d, I]) =>
    [d, Object.fromEntries(Object.entries(I).map(([m, it]) => [m, [it.km, it.segments.map((s) => `${s.type} ${s.km}`).join(' + ')]]))])));
  egal(km, {
    rouvignies: { route: [168, 'route 168'], barge: [207, 'barge 194 + camion 13'], rail: [207, 'rail 162 + camion 45'] },
    dourges: { route: [153, 'route 153'], barge: [266, 'barge 263 + camion 3'], rail: [165, 'rail 162 + camion 3'] },
  }, 'distances du module');
  egal(await pg.$$eval('[data-ci-mode] .ci-km', (s) => s.map((x) => x.textContent)), ['168 km', '207 km', '207 km'], 'distances de la liste');
  await pg.click('[data-ci-mode="barge"]');
  const f = await pg.textContent('[data-ci-fiche]');
  vrai(f.includes('barge 194 km + camion 13 km'), 'distance par tronçon absente de la fiche : ' + f);
  vrai(f.includes('Terminal fluvial de Bruay-sur-l\'Escaut'), 'terminal absent de la fiche');
  vrai(/Ruptures de charge\s*1/.test(f), 'une rupture de charge pour la barge');
  vrai(f.includes('Contargo') && f.includes('Les prix, dates et CO₂ sont dans les devis.'), 'offres reçues pour ce mode');
  await pg.click('[data-ci-mode="route"]');
  vrai(/Ruptures de charge\s*aucune/.test(await pg.textContent('[data-ci-fiche]')), 'la route : aucune rupture de charge');
  vrai(/porte à porte/.test(await pg.textContent('[data-ci-fiche]')), 'la route : porte à porte');
  await pg.click('[data-ci-mode="route"]');
});

await v('Carte des itinéraires : l’ordre du CO₂ du brief 7.1 tient avec les distances réelles, à 13,5 t et 15,8 t, vers les deux destinations', async () => {
  const F = { route: 0.051, camion: 0.051, barge: 0.020, rail: 0.0165 };
  const segs = await pg.evaluate(() => Object.fromEntries(Object.entries(window.__ci.CARTE.itineraires).map(([d, I]) =>
    [d, Object.fromEntries(Object.entries(I).map(([m, it]) => [m, it.segments.map((s) => [s.type, s.km])]))])));
  const co2 = (L, t) => Math.round(L.reduce((a, [ty, km]) => a + t * km * F[ty], 0));
  for (const t of [13.5, 15.8]) {
    const r = segs.rouvignies, d = segs.dourges;
    vrai(co2(r.barge, t) < co2(r.rail, t) && co2(r.rail, t) < co2(r.route, t), `vers Rouvignies à ${t} t : ${co2(r.barge, t)} / ${co2(r.rail, t)} / ${co2(r.route, t)}`);
    vrai(co2(d.rail, t) < co2(d.barge, t) && co2(d.barge, t) < co2(d.route, t), `vers Dourges à ${t} t : ${co2(d.rail, t)} / ${co2(d.barge, t)} / ${co2(d.route, t)}`);
  }
  egal([co2(segs.rouvignies.barge, 13.5), co2(segs.rouvignies.rail, 13.5), co2(segs.rouvignies.route, 13.5)], [61, 67, 116], 'CO₂ vers Rouvignies à 13,5 t');
});

// La forme : chaque type de tronçon a sa signature (épaisseur, pointillés, couches) ; un seul est plein et sans pointillés.
const signatures = () => pg.evaluate(() => {
  const out = {};
  for (const t of ['route', 'barge', 'rail', 'camion']) {
    const g = document.querySelector(`[data-ct-svg] [data-type="${t}"]`);
    if (!g) continue;
    out[t] = [...g.querySelectorAll('.ci-couche')].map((p) => {
      const cs = getComputedStyle(p);
      return `${cs.stroke}|${cs.strokeDasharray === 'none' ? 'plein' : 'pointillé'}|${(parseFloat(cs.strokeWidth) / parseFloat(getComputedStyle(g.querySelector('.ci-couche')).strokeWidth)).toFixed(2)}|${p.style.strokeLinecap}`;
    }).join(' / ') + ' # ' + [...g.querySelectorAll('.ci-couche')].map((p) => getComputedStyle(p).strokeDasharray.split(/[ ,]+/).map((x) => Math.round(parseFloat(x) * 10)).join('-')).join('/');
  }
  return out;
});
const estVert = (c) => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); if (!m || m[4] === '0') return false;
  const [r, g, b] = [+m[1], +m[2], +m[3]]; return g > r + 30 && g > b + 15; };
const estBleu = (c) => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); if (!m || m[4] === '0') return false;
  const [r, g, b] = [+m[1], +m[2], +m[3]]; return b > r + 60 && b > g + 30; };

await v('Carte des itinéraires : les quatre traits se distinguent par la forme (un seul plein, des pointillés tous différents) ; aucun vert ; seul l’entrepôt d’arrivée est bleu', async () => {
  await monter();
  await pg.waitForSelector('[data-ct-svg]'); await immobile();
  const S = await signatures();
  egal(Object.keys(S).sort(), ['barge', 'camion', 'rail', 'route'], 'les quatre types sont dessinés');
  egal(new Set(Object.values(S)).size, 4, 'deux types de tronçon ont le même trait : ' + JSON.stringify(S));
  const pleins = Object.entries(S).filter(([, s]) => !s.includes('pointillé')).map(([t]) => t);
  egal(pleins, ['route'], 'un seul trait plein, la route');
  const dashs = Object.values(S).map((s) => s.split(' # ')[1]);
  egal(new Set(dashs).size, 4, 'deux types ont les mêmes pointillés');
  const couleurs = await pg.evaluate(() => [...document.querySelectorAll('[data-ct-svg] *')].map((e) => {
    const cs = getComputedStyle(e);
    return { cl: e.getAttribute('class') || e.tagName, fill: cs.fill, stroke: cs.stroke };
  }));
  const verts = couleurs.filter((c) => estVert(c.fill) || estVert(c.stroke));
  egal(verts.map((c) => c.cl), [], 'éléments verts sur la carte');
  const bleus = couleurs.filter((c) => estBleu(c.fill) || estBleu(c.stroke)).map((c) => c.cl);
  egal(bleus, ['ci-rond'], 'éléments bleus (seul le rond de l’entrepôt d’arrivée)');
  vrai(await pg.$eval('[data-ct-svg] .ci-entrepot', (g) => g.dataset.ciLieu === 'rouvignies'), 'le rond bleu est celui de Rouvignies');
});

await v('Carte des itinéraires (sabotage) : une route colorée en vert fait tomber le contrôle « aucun vert » ; deux traits identiques font tomber le contrôle de forme', async () => {
  await pg.evaluate(() => document.querySelectorAll('[data-ct-svg] [data-type="route"] .ci-couche').forEach((p) => p.setAttribute('stroke', '#0b7a41')));
  const verts = (await pg.evaluate(() => [...document.querySelectorAll('[data-ct-svg] *')].map((e) => getComputedStyle(e).stroke))).filter(estVert);
  vrai(verts.length > 0, 'le sabotage « route verte » ne serait pas vu');
  await monter(); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  await pg.evaluate(() => {
    const barge = document.querySelector('[data-ct-svg] [data-type="barge"] .ci-couche');
    document.querySelectorAll('[data-ct-svg] [data-type="camion"]').forEach((g) => {
      g.querySelectorAll('.ci-couche').forEach((p) => { p.setAttribute('stroke', barge.getAttribute('stroke')); p.style.strokeLinecap = barge.style.strokeLinecap; });
    });
    // L'épaisseur et les pointillés sont reposés à chaque redessin de la scène : on les fige après coup.
    const b = getComputedStyle(barge);
    document.querySelectorAll('[data-ct-svg] [data-type="camion"] .ci-couche').forEach((p) => {
      p.style.setProperty('stroke-width', b.strokeWidth, 'important'); p.style.setProperty('stroke-dasharray', b.strokeDasharray, 'important');
    });
  });
  const S = await signatures();
  vrai(new Set(Object.values(S)).size < 4, 'le sabotage « camion = barge » ne serait pas vu');
  await monter();
});

await v('Carte des itinéraires : clic sur chaque tracé → sa fiche, les deux autres estompés ; second clic → plus rien de choisi', async () => {
  await pg.waitForSelector('[data-ct-svg]'); await immobile();
  const largeur = (m) => pg.$eval(`[data-ci-it="${m}"] .ci-couche`, (p) => parseFloat(getComputedStyle(p).strokeWidth));
  for (const m of ['route', 'barge', 'rail']) {
    const w0 = await largeur(m);
    await cliquerTrace(m);
    egal(await presse(), [m], `après un clic sur le tracé ${m}`);
    const nom = { route: 'Route', barge: 'Barge + camion', rail: 'Rail + camion' }[m];
    vrai((await pg.textContent('[data-ci-fiche] h4')).startsWith(nom), `fiche du mode ${m}`);
    egal(await pg.$$eval('[data-ci-it]', (gs) => gs.map((g) => `${g.dataset.ciIt}:${g.classList.contains('ci-choisi') ? 'choisi' : g.classList.contains('ci-estompe') ? 'estompé' : '-'}`).sort()),
      ['barge', 'rail', 'route'].map((x) => `${x}:${x === m ? 'choisi' : 'estompé'}`), 'choisi et estompés');
    // Le choisi s'épaissit d'un facteur 1,4 (même zoom : la vue d'ensemble ne bouge pas).
    const r = (await largeur(m)) / w0;
    vrai(Math.abs(r - 1.4) < 0.02, `le tracé ${m} choisi n'a pas grossi de 1,4 (${r.toFixed(2)})`);
  }
  await cliquerTrace('rail');
  egal(await presse(), [], 'second clic sur le même tracé : plus rien de choisi');
  vrai((await pg.textContent('[data-ci-fiche]')).includes('Cliquez un itinéraire'), 'la fiche revient à la consigne');
  egal(await pg.$$eval('.ci-estompe, .ci-choisi', (x) => x.length), 0, 'plus rien d’estompé');
});

await v('Carte des itinéraires : au clavier, Tab parcourt les trois itinéraires, Entrée et Espace choisissent, le focus reste sur le bouton', async () => {
  await pg.focus('[data-ci-mode="route"]');
  await pg.keyboard.press('Tab');
  egal(await pg.evaluate(() => document.activeElement.dataset.ciMode), 'barge', 'Tab mène à la barge');
  await pg.keyboard.press('Enter');
  egal(await presse(), ['barge'], 'Entrée choisit la barge');
  egal(await pg.evaluate(() => document.activeElement.dataset.ciMode), 'barge', 'le focus reste sur le bouton (Entrée)');
  await pg.keyboard.press('Tab');
  await pg.keyboard.press('Space');
  egal(await presse(), ['rail'], 'Espace choisit le rail');
  egal(await pg.evaluate(() => document.activeElement.dataset.ciMode), 'rail', 'le focus reste sur le bouton (Espace)');
  await pg.keyboard.press('Space');
  egal(await presse(), [], 'Espace une seconde fois : plus rien de choisi');
});

await v('Carte des itinéraires : le repérage compte les itinéraires ouverts (pas les fermetures), et rien d’autre ne va dans la base', async () => {
  await monter(); await pg.waitForSelector('[data-ct-svg]');
  await pg.click('[data-ci-mode="route"]'); await pg.click('[data-ci-mode="barge"]');
  await pg.click('[data-ci-mode="barge"]'); await pg.click('[data-ci-mode="route"]');
  const db = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__ci.db)));
  egal(db.indicateurs && db.indicateurs['essai-itin'] && db.indicateurs['essai-itin'].carte, { route: 2, barge: 1 }, 'ouvertures comptées');
  vrai(!JSON.stringify(db).includes('choisi') && !('itineraires' in db), 'un état d’affichage est rangé dans la base');
  await monter({ role: 'prof' }); await pg.waitForSelector('[data-ct-svg]');
  await pg.click('[data-ci-mode="rail"]');
  const dbP = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__ci.db)));
  vrai(!(dbP.indicateurs && dbP.indicateurs['essai-itin'] && dbP.indicateurs['essai-itin'].carte), 'chez l’enseignant, rien n’est compté');
});

await v('Carte des itinéraires : « Voir les derniers kilomètres » zoome sur le terminal et l’entrepôt ; « Vue d’ensemble » revient ; pas de quadrillage sans l’option', async () => {
  await monter(); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  const ens = await pg.getAttribute('[data-ct-svg]', 'viewBox');
  await pg.click('[data-ci-derniers]'); await immobile();
  const vue = await pg.evaluate(() => window.__ci.CARTE.vues.rouvignies.join(' '));
  egal((await pg.getAttribute('[data-ct-svg]', 'viewBox')).split(' ').map((x) => Math.round(+x)).join(' '), vue, 'viewBox des derniers kilomètres');
  vrai((await pg.textContent('[data-ct-ech-txt]')).trim() !== '', 'échelle affichée');
  await pg.click('[data-ci-ensemble]'); await immobile();
  egal(await pg.getAttribute('[data-ct-svg]', 'viewBox'), ens, 'retour à la vue d’ensemble');
  egal(await pg.$$eval('.ci-grille', (x) => x.length), 0, 'quadrillage dessiné sans l’option');
  egal(await pg.$$eval('[data-ct-reperes] span', (x) => x.length), 0, 'repères du quadrillage sans l’option');
  await monter({ quadrillage: true }); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  egal(await pg.$$eval('.ci-grille', (x) => x.length), 1, 'quadrillage avec l’option');
  vrai(await pg.$$eval('[data-ct-reperes] span', (x) => x.length) > 10, 'repères avec l’option');
});

await v('Carte des itinéraires : vers Dourges, sa liste et son entrepôt d’arrivée (bleu) ; une destination inconnue empêche la séance de se charger', async () => {
  await monter({ destination: 'dourges' }); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  egal(await pg.$$eval('[data-ci-mode] .ci-km', (s) => s.map((x) => x.textContent)), ['153 km', '266 km', '165 km'], 'distances vers Dourges');
  vrai(await pg.$eval('[data-ct-svg] .ci-entrepot', (g) => g.dataset.ciLieu === 'delta3'), 'l’entrepôt bleu est celui de Dourges');
  egal(await pg.$$eval('[data-ct-svg] [data-ci-lieu="rouvignies"]', (x) => x.length), 0, 'Rouvignies n’est pas sur la carte de Dourges');
  const msg = await pg.evaluate(async () => {
    const { creerCarteItineraires } = await import('/core/types/carte-itineraires.js');
    const { CARTE } = await import('/contenus/decathlon-carte.js');
    try { creerCarteItineraires({ carte: CARTE, destination: 'lille' }); return ''; } catch (e) { return e.message; }
  });
  vrai(msg.includes('destination inconnue « lille »'), 'message : ' + msg);
});


// Rouvre la vue (le moteur la redessine à chaque entrée de menu) : c'est ainsi qu'un aléa déclenché devient visible.
const rouvrir = () => pg.evaluate(() => {
  const h = window.__ci.hote;
  h.querySelector('.ent-nav[data-vue="accueil"]').click();
  h.querySelector('.ent-nav[data-vue="itineraires"]').click();
});

await v('Carte des itinéraires (lot 3) : la marque de Kain est absente avant le déclencheur, présente après ; dessin sans couleur ; texte alternatif sans chiffre', async () => {
  await pg.setViewportSize({ width: 1366, height: 768 });
  await monter({ marque: true }); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  egal(await pg.$$eval('[data-ct-svg] .ci-marque', (x) => x.length), 0, 'marque avant le déclencheur');
  egal(await pg.$$eval('[data-ct-svg] .ci-apres', (x) => x.length), 0, 'trait estompé avant le déclencheur');
  vrai(!(await pg.getAttribute('[data-ct-svg]', 'aria-label')).includes('Kain'), 'le texte alternatif annonce l’aléa avant le déclencheur');
  await pg.evaluate(() => { window.__ci.db.alea = true; });
  await rouvrir(); await pg.waitForSelector('[data-ct-svg] .ci-marque'); await immobile();
  egal(await pg.$$eval('[data-ct-svg] [data-ci-marque]', (x) => x.map((g) => g.dataset.ciMarque)), ['kain'], 'la marque après le déclencheur');
  vrai((await pg.textContent('[data-ct-svg] .ci-marque')).includes('Arrêt de navigation du 02/02 au 05/03'), 'cartouche');
  const alt = await pg.getAttribute('[data-ct-svg]', 'aria-label');
  vrai(alt.includes('Écluse de Kain fermée') && !/\d/.test(alt), 'texte alternatif : ' + alt);
  const coul = await pg.$$eval('[data-ct-svg] .ci-marque *', (els) => els.flatMap((e) => [getComputedStyle(e).fill, getComputedStyle(e).stroke]));
  const teintes = coul.filter((c) => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m && Math.max(+m[1], +m[2], +m[3]) - Math.min(+m[1], +m[2], +m[3]) > 25; });
  egal(teintes, [], 'la marque porte une couleur');
  vrai((await pg.textContent('.ci-legende')).includes('Navigation arrêtée'), 'légende de la marque');
});

await v('Carte des itinéraires (lot 3) : la barge passe en trait estompé APRÈS l’écluse (camion final compris) ; la route et le rail ne bougent pas ; la fiche de la barge annonce l’arrêt', async () => {
  const apres = await pg.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-ci-it]')].map((g) =>
    [g.dataset.ciIt, [...g.querySelectorAll('[data-type]')].map((t) => `${t.dataset.type}${t.classList.contains('ci-apres') ? ':après' : ''}`)])));
  egal(apres, { route: ['route'], barge: ['barge', 'barge:après', 'camion:après'], rail: ['rail', 'camion'] }, 'morceaux des itinéraires');
  // La coupure est à l'écluse : le dernier point du morceau « avant » est à moins de 3 km de la marque.
  const ecart = await pg.evaluate(() => {
    const p = document.querySelector('[data-ci-it="barge"] [data-type="barge"]:not(.ci-apres) .ci-couche');
    const L = p.getTotalLength(), q = p.getPointAtLength(L);
    const m = document.querySelector('[data-ci-marque="kain"]');
    return Math.hypot(q.x - +m.dataset.x, q.y - +m.dataset.y);
  });
  vrai(ecart < 3000, `la coupure est à ${Math.round(ecart)} m de l'écluse`);
  await pg.click('[data-ci-mode="barge"]');
  vrai((await pg.textContent('[data-ci-fiche] .ci-alea')).includes('Écluse de Kain fermée — Arrêt de navigation du 02/02 au 05/03'), 'avis dans la fiche de la barge');
  await pg.click('[data-ci-mode="route"]');
  egal(await pg.$$eval('[data-ci-fiche] .ci-alea', (x) => x.length), 0, 'avis dans la fiche de la route');
  await pg.click('[data-ci-mode="route"]');
  // La marque se dessine aussi au zoom, et reste à l'échelle de l'écran.
  vrai(await pg.$eval('[data-ci-marque="kain"]', (g) => /scale\(/.test(g.getAttribute('transform'))), 'marque mise à l’échelle');
});

await v('Carte des itinéraires (lot 3) : une marque mal déclarée (sans lonlat, hors de la carte, type inconnu) empêche la séance de se charger', async () => {
  const msgs = await pg.evaluate(async () => {
    const { creerCarteItineraires } = await import('/core/types/carte-itineraires.js');
    const { CARTE } = await import('/contenus/decathlon-carte.js');
    const essai = (m) => { try { creerCarteItineraires({ carte: CARTE, destination: 'rouvignies', marques: [m] }); return ''; } catch (e) { return e.message; } };
    return [essai({ id: 'a', titre: 'x' }), essai({ id: 'b', titre: 'x', lonlat: [5.5, 45] }), essai({ id: 'c', titre: 'x', lonlat: [3.37, 50.63], coupe: 'avion' })];
  });
  vrai(msgs[0].includes('lonlat'), msgs[0]);
  vrai(msgs[1].includes('hors de la carte'), msgs[1]);
  vrai(msgs[2].includes('type inconnu « avion »'), msgs[2]);
});

await v('Carte des itinéraires (lot 3) : au zoom de Dourges, les noms du terminal et de l’entrepôt ne se chevauchent pas, et aucun ne couvre l’autre point', async () => {
  await monter({ destination: 'dourges' }); await pg.waitForSelector('[data-ct-svg]'); await immobile();
  await pg.click('[data-ci-derniers]'); await immobile();
  const r = await pg.evaluate(() => {
    const b = (el) => { const x = el.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom }; };
    const nom = (txt) => [...document.querySelectorAll('[data-ct-svg] .ci-lnom')].find((t) => t.textContent === txt);
    return { t: b(nom('Terminal de Dourges')), e: b(nom('Entrepôt de Dourges')),
      pt: b(document.querySelector('[data-ci-lieu="ldct"] .ci-rond')), pe: b(document.querySelector('[data-ci-lieu="delta3"] .ci-rond')) };
  });
  const coupe = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
  vrai(!coupe(r.t, r.e), 'les deux noms se chevauchent : ' + JSON.stringify(r));
  vrai(!coupe(r.t, r.pe) && !coupe(r.e, r.pt), 'un nom couvre l’autre point');
  await pg.click('[data-ci-ensemble]'); await immobile();
});

for (const [w, h] of [[1366, 768], [1280, 720]]) {
  // La VUE tient dans la fenêtre (le menu de gauche, lui, dépend de la séance : celui du décor Boost est long).
  await v(`Carte des itinéraires : ${w} × ${h}, la vue tient sans défilement — carte, liste et fiche du plus long itinéraire visibles`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    await monter(); await pg.waitForSelector('[data-ct-svg]');
    await pg.evaluate(() => window.scrollTo(0, 0)); await immobile();
    await pg.click('[data-ci-mode="rail"]');
    const m = await pg.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const pan = document.querySelector('.ci-panneau');
      return { vue: r('.ci-vue').bottom, ih: innerHeight, droite: r('.ci-vue').right, iw: innerWidth,
        sw: document.scrollingElement.scrollWidth, carte: r('[data-ct-cadre]').height, fiche: r('[data-ci-fiche]').bottom,
        panDefile: pan.scrollHeight > pan.clientHeight + 1 };
    });
    vrai(m.vue <= m.ih, `la vue dépasse le bas de la fenêtre : ${Math.round(m.vue)} pour ${m.ih}`);
    vrai(m.droite <= m.iw && m.sw <= m.iw + 1, `défilement horizontal : ${m.sw} pour ${m.iw}`);
    vrai(m.carte >= 380, `carte trop petite : ${m.carte} px`);
    vrai(!m.panDefile && m.fiche <= m.ih, 'la fiche du rail ne tient pas dans la colonne');
    await pg.click('[data-ci-mode="rail"]');
  });
}


await v('Suivi de classe : ouvrir un itinéraire fait remonter le compte avec la note, et les noms des itinéraires y sont rangés', async () => {
  await monter({ etape: true }); await pg.waitForSelector('[data-ct-svg]');
  await pg.evaluate(() => { window.__ci.remontees.length = 0; });
  await pg.click('[data-ci-mode="barge"]');
  const r = await pg.evaluate(() => window.__ci.remontees.at(-1));
  vrai(r, 'aucune remontée après l’ouverture d’un itinéraire');
  egal(r.detail.indicateurs['essai-itin'].carte, { barge: 1 }, 'compte remonté');
  egal(r.detail.itineraires, { noms: { route: 'Route', barge: 'Barge + camion', rail: 'Rail + camion' } }, 'noms rangés avec la note');
});

await v('Suivi de classe : colonne « Itinéraires ouverts » au Repérage (2 / 3, détail au survol) ; absente d’une séance sans carte', async () => {
  const ctxP = await nav.newContext({ viewport: { width: 1366, height: 900 } });
  const pp = await ctxP.newPage();
  pp.setDefaultTimeout(8000);
  try {
    await pp.goto(BASE);
    await pp.waitForSelector('#btnProf');
    await pp.click('#btnProf');
    await pp.waitForSelector('#btnProfEspace');
    const ids = await pp.evaluate(async () => {
      const { B } = await import('/core/backend.js');
      const prof = B.profilCourant();
      const gid = (await B.creerGroupe({ nom: 'Carte régionale', annee: '2026-2027', niveau: '1re', profUid: prof.uid })).id
        || (await B.groupesDuProf(prof.uid)).find((g) => g.nom === 'Carte régionale').id;
      await B.creerEleves(gid, [{ nom: 'CARTE', prenom: 'Test', matricule: 'carte-test', code: 'x' }, { nom: 'SANS', prenom: 'Carte', matricule: 'sans-carte', code: 'x' }]);
      const els = await B.elevesDuGroupe(gid);
      const el = els.find((x) => x.nom === 'CARTE'), autre = els.find((x) => x.nom === 'SANS');
      const { chargerActivites } = await import('/activites/index.js');
      const m = (await chargerActivites()).map((x) => x.meta).find((x) => x.portee === 'eleve' && x.immersif && x.bareme && !x.copie);
      const noms = { route: 'Route', barge: 'Barge + camion', rail: 'Rail + camion' };
      // `avion` : un itinéraire qui n'est plus sur la carte ne compte pas.
      await B.ecrireScore(gid, el.uid, m.id, { score: 1, max: 5, detail: { itineraires: { noms },
        indicateurs: { [m.id]: { temps: 600, carte: { barge: 3, rail: 1, avion: 2 } } } } });
      await B.ecrireScore(gid, autre.uid, m.id, { score: 1, max: 5, detail: { indicateurs: { [m.id]: { temps: 300 } } } });
      return { gid, uid: el.uid, autre: autre.uid, aid: m.id };
    });
    await pp.click('#btnProfEspace');
    await pp.click('[data-ong="suivi"]');
    await pp.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    const lu = await pp.$eval(`#reperage [data-reperage="${ids.aid}"]`, (b, ids) => {
      const c = (uid) => { const x = b.querySelector(`tr[data-rep-eleve="${uid}"] [data-rep="itineraires"]`); return x && [x.textContent, x.title]; };
      return { entete: [...b.querySelectorAll('thead th')].map((t) => t.textContent).includes('Itinéraires ouverts'), carte: c(ids.uid), sans: c(ids.autre) };
    }, ids);
    egal(lu, { entete: true, carte: ['2 / 3', 'Barge + camion (3), Rail + camion (1)'], sans: ['—', ''] }, 'colonne des itinéraires');
    // Sans carte dans aucune note : pas de colonne.
    await pp.evaluate(async (ids) => {
      const { B } = await import('/core/backend.js');
      await B.ecrireScore(ids.gid, ids.uid, ids.aid, { score: 1, max: 5, detail: { indicateurs: { [ids.aid]: { temps: 600 } } } });
    }, ids);
    await pp.reload();
    await pp.waitForSelector('#btnProfEspace');
    await pp.click('#btnProfEspace');
    await pp.click('[data-ong="suivi"]');
    await pp.waitForSelector(`#reperage [data-reperage="${ids.aid}"]`, { timeout: 6000 });
    egal(await pp.$$eval(`#reperage [data-reperage="${ids.aid}"] [data-rep="itineraires"]`, (x) => x.length), 0, 'colonne sans carte');
    vrai(!(await pp.$eval(`#reperage [data-reperage="${ids.aid}"]`, (b) => [...b.querySelectorAll('thead th')].some((t) => t.textContent === 'Itinéraires ouverts'))),
      'en-tête sans carte');
  } finally {
    await ctxP.close();
  }
});

await v('Carte des itinéraires : aucune erreur de page pendant le bloc ; aucune requête hors du site', async () => {
  egal(erreurs, [], 'erreurs de page');
  egal([...hotes], [], 'requêtes hors du site');
});

await ctxCi.close();
}
