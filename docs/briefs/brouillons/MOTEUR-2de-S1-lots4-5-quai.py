import io
p = 'core/types/quai.js'
s = io.open(p, encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)

# ---------------------------------------------------------------- en-tête
rep("""// bloquée » ; la séance ajoute les siens (messages) par `jalonsDossier: { avant(db, e), apres(db, e) }`.
""", """// bloquée » ; la séance ajoute les siens (messages) par `jalonsDossier: { avant(db, e), apres(db, e) }`.
//
// QUAI SANS FROID (04/10/2026, lot 4 du brief `docs/briefs/MOTEUR-2de-S1.md`, 2de, Smoby). `froid: false` :
// marchandise sèche (des jouets), plus rien de ce qui tient au froid — ni ticket de l'enregistreur ni sa
// question, ni sonde, ni temps hors froid (jauge, afficheur, brume), ni chambre froide, ni note de rapidité
// sur le froid, ni motif « température » ; une décision juste ne demande plus d'avoir sondé. L'étape ④
// rentre les palettes en `zone` (« Zone de réception » par défaut, `zone: { nom }`). `motifs: ['avarie',
// 'manquant']` restreint la liste des motifs proposés (toutes les séances peuvent s'en servir).
// `dechargement: { par: 'cariste', nom: 'Yanis' }` : un chariot élévateur frontal conduit par une
// silhouette sans visage sort les palettes, au lieu du chauffeur au transpalette (légende « Yanis sort la
// palette P2 au chariot »). Un seul camion dans ce mode (plusieurs camions : l'ordre se décide sur les
// tickets, donc sur le froid).
//
// SÉCURITÉ AVANT DÉCHARGEMENT (04/10/2026, lot 5). `securite: { scene, points: [{ id, lib, ok }], signaler:
// { bouton, reponse, rien }, arret, commencer, photo }` ajoute une étape ⓪ « Avant de décharger » : une
// scène de trois lignes, chaque point jugé « OK » / « Pas OK », deux boutons « Signaler au chef de quai »
// et « Commencer à décharger ». Les étapes suivantes restent fermées tant que l'élève n'a pas commencé.
// Commencer alors qu'un point faux n'a pas été signalé : en guidage, le chef de quai l'arrête (sans dire
// lequel) et l'élève peut corriger ; en évaluation, rien ne l'arrête. Jalons : `securiteSignalee` (tous
// les points faux signalés AVANT la première tentative de décharger) et `securiteConstat` (chaque point
// jugé, aucun « OK » sur un point faux, aucun « Pas OK » sur un point juste). La liste `points` ne dépend
// pas de l'affichage : la même étape pourra se jouer sur une image à inspecter.
""")

# ---------------------------------------------------------------- libellés
rep("""const ETAPES = ['① Le camion arrive', '② Déchargement', '③ Contrôle des palettes', '④ Réserves et chambre froide'];""",
"""const ETAPES = ['① Le camion arrive', '② Déchargement', '③ Contrôle des palettes', '④ Réserves et chambre froide'];
const ETAPE_SECU = '⓪ Avant de décharger';""")

# ---------------------------------------------------------------- réglages
rep("""  const aides = Object.assign({ regleCouches: false, detailComptage: false, repere: false, chefDeQuai: false, consignes: false }, Q.aides || {});
  return {""", """  const aides = Object.assign({ regleCouches: false, detailComptage: false, repere: false, chefDeQuai: false, consignes: false }, Q.aides || {});
  const froid = Q.froid !== false;
  // Les motifs proposés : tous, ou ceux que la séance déclare ; jamais « température » sans froid.
  const motifs = Object.keys(MOTIFS).filter((m) => m === 'aucun' || ((!Q.motifs || Q.motifs.includes(m)) && (froid || m !== 'temperature')));
  const S = Q.securite && Array.isArray(Q.securite.points) && Q.securite.points.length ? Q.securite : null;
  return {
    froid, motifs, securite: S,
    zone: Object.assign({ nom: 'Zone de réception' }, Q.zone || {}),""")
rep("""    D: Object.assign({ ouverture: 0.5, parPalette: 1 }, Q.dechargement || {}),""",
"""    D: Object.assign({ ouverture: 0.5, parPalette: 1, par: 'chauffeur' }, Q.dechargement || {}),""")

# ---------------------------------------------------------------- état
rep("""  const e = Object.assign({ v: 1, etape: 1, minute: 0, reel: 0, tiersTemps: false, sel: 0, journal: [], palettes, fini: false }, camionNeuf());""",
"""  const e = Object.assign({ v: 1, etape: R.securite ? 0 : 1, minute: 0, reel: 0, tiersTemps: false, sel: 0, journal: [], palettes, fini: false }, camionNeuf());
  if (R.securite) e.securite = securiteNeuve();""")
rep("""const paletteNeuve = () => ({""", """// L'étape ⓪ : la réponse à chaque point, les signalements (avec les points « pas OK » à ce moment-là, et
// s'ils viennent après un arrêt du chef de quai), l'arrêt, et le départ du déchargement.
const securiteNeuve = () => ({ rep: {}, signaux: [], arrete: false, fait: false, chef: '' });
const paletteNeuve = () => ({""")
rep("""  if (!Array.isArray(e.journal)) e.journal = [];
  if (!Array.isArray(e.lignes)) e.lignes = [];""", """  if (!Array.isArray(e.journal)) e.journal = [];
  if (!Array.isArray(e.lignes)) e.lignes = [];
  if (R.securite && !e.securite) e.securite = securiteNeuve();""")

# ---------------------------------------------------------------- juste sans sonde
rep("""// Une décision juste demande la palette sondée ; et, quand l'étiquette avant est déchirée, un refus
// « produit différent » demande d'avoir lu l'étiquette arrière (la seule preuve).
const paletteJuste = (p, s) => s.decision === p.attendu && memesMotifs(p, s) && s.sonde !== null""",
"""// Une décision juste demande la palette sondée (sauf quai sans froid : rien à sonder) ; et, quand
// l'étiquette avant est déchirée, un refus « produit différent » demande d'avoir lu l'étiquette arrière.
const paletteJuste = (p, s, froid = true) => s.decision === p.attendu && memesMotifs(p, s) && (!froid || s.sonde !== null)""")

# ---------------------------------------------------------------- jalons
rep("""  R.camions.forEach((c, ci) => {
    const k = K(E, ci);
    const lib = Object.fromEntries(""", """  // L'étape ⓪ (sécurité) : ses deux jalons d'abord, dans l'ordre du jeu.
  if (R.securite) jalonsSecurite(e, R).forEach((l) => j(l.id, l.lib, l.fait, l.attendu, l.ok));
  if (R.froid) R.camions.forEach((c, ci) => {
    const k = K(E, ci);
    const lib = Object.fromEntries(""")
rep("""    const fait = s.decision ? `${DECISIONS[s.decision]} — ${libMotifs(motifsChoisis(s))}${s.sonde === null ? ' (sans sonder)' : ''}` : 'sans contrôle ni décision';
    j(`${p.id}-decision`, `${p.id} décision`, fait, `${DECISIONS[p.attendu]} — ${libMotifs(motifsAttendus(p))}`, paletteJuste(p, s));""",
"""    const fait = s.decision ? `${DECISIONS[s.decision]} — ${libMotifs(motifsChoisis(s))}${R.froid && s.sonde === null ? ' (sans sonder)' : ''}` : 'sans contrôle ni décision';
    j(`${p.id}-decision`, `${p.id} décision`, fait, `${DECISIONS[p.attendu]} — ${libMotifs(motifsAttendus(p))}`, paletteJuste(p, s, R.froid));""")
rep("""  R.camions.forEach((c, ci) => j(`rentre${suff(c)}`, libC('Lot rentré en chambre froide', c), KS[ci].rentre ? `oui, après ${fmtMin(KS[ci].froid)} hors froid` : 'non', 'oui', KS[ci].rentre));
  return { L, pts, max };
}
""", """  R.camions.forEach((c, ci) => j(`rentre${suff(c)}`, R.froid ? libC('Lot rentré en chambre froide', c) : libC(`Palettes rentrées en ${minuscule(R.zone.nom)}`, c),
    KS[ci].rentre ? (R.froid ? `oui, après ${fmtMin(KS[ci].froid)} hors froid` : 'oui') : 'non', 'oui', KS[ci].rentre));
  return { L, pts, max };
}
const minuscule = (t) => String(t).charAt(0).toLowerCase() + String(t).slice(1);

// Les jalons de l'étape ⓪. Aucun n'est vrai par inaction : un signalement demande un clic, un constat
// demande chaque point jugé.
function jalonsSecurite(e, R) {
  const S = R.securite, sec = (e && e.securite) || securiteNeuve();
  const faux = S.points.filter((x) => !x.ok).map((x) => x.id);
  const lib = (id) => (S.points.find((x) => x.id === id) || {}).lib || id;
  const L = [];
  if (faux.length) {
    const bon = (sec.signaux || []).find((g) => !g.apresArret && faux.every((id) => (g.points || []).includes(id)));
    const g0 = (sec.signaux || [])[0];
    const fait = bon ? `signalé : ${faux.map(lib).join(', ')}`
      : g0 ? `signalé${g0.apresArret ? ' après l’arrêt du chef de quai' : ''} : ${(g0.points || []).map(lib).join(', ') || 'rien de précis'}`
        : (sec.arrete ? 'arrêté par le chef de quai avant d’avoir signalé' : 'rien signalé');
    L.push({ id: 'securiteSignalee', lib: 'Danger signalé avant de décharger', fait, attendu: `signaler : ${faux.map(lib).join(', ')}`, ok: !!bon });
  }
  const rep = sec.rep || {};
  const juges = S.points.filter((x) => rep[x.id]);
  const justes = S.points.every((x) => rep[x.id] === (x.ok ? 'ok' : 'ko'));
  L.push({ id: 'securiteConstat', lib: 'Constat de sécurité juste',
    fait: juges.length ? S.points.map((x) => `${x.lib} : ${rep[x.id] === 'ok' ? 'OK' : rep[x.id] === 'ko' ? 'pas OK' : '?'}`).join(' · ') : 'rien de coché',
    attendu: S.points.map((x) => `${x.lib} : ${x.ok ? 'OK' : 'pas OK'}`).join(' · '), ok: justes });
  return L;
}
""")
rep("""  const justes = R.palettes.filter((p) => paletteJuste(effective(p, e, R), s(p))).length;""",
"""  const justes = R.palettes.filter((p) => paletteJuste(effective(p, e, R), s(p), R.froid)).length;""")
rep("""  const ptsFroid = KS.every((k) => k.decharge) ? palier(froidMax, N.horsFroid) : 0;
  const ptsReel = palier((e.reel || 0) / 60, N.reel.map(([m, p]) => [m * fac, p]));
  const maxVitesse = (N.horsFroid[0] ? N.horsFroid[0][1] : 0) + (N.reel[0] ? N.reel[0][1] : 0);""",
"""  // Quai sans froid : la rapidité ne se lit que sur le temps réel.
  const ptsFroid = R.froid && KS.every((k) => k.decharge) ? palier(froidMax, N.horsFroid) : 0;
  const ptsReel = palier((e.reel || 0) / 60, N.reel.map(([m, p]) => [m * fac, p]));
  const maxVitesse = (R.froid && N.horsFroid[0] ? N.horsFroid[0][1] : 0) + (N.reel[0] ? N.reel[0][1] : 0);""")
rep("""    prop, ptsFroid, ptsReel, vitesse, reception, froid: froidMax, reel: e.reel || 0, tiersTemps: !!e.tiersTemps, N, fac };""",
"""    prop, ptsFroid, ptsReel, vitesse, reception, froid: froidMax, reel: e.reel || 0, tiersTemps: !!e.tiersTemps, N, fac, sansFroid: !R.froid };""")

# ---------------------------------------------------------------- la vue
rep("""  const lieuMin = R.lieu.nom.charAt(0).toLowerCase() + R.lieu.nom.slice(1);""",
"""  const lieuMin = R.lieu.nom.charAt(0).toLowerCase() + R.lieu.nom.slice(1);
  const F = R.froid, SEC = R.securite;
  const zoneMin = minuscule(R.zone.nom);
  // Qui sort les palettes : le chauffeur au transpalette, ou un cariste au chariot élévateur.
  const CARISTE = R.D.par === 'cariste';
  const quiSort = CARISTE ? (R.D.nom || 'Le cariste') : 'Le chauffeur';
  const secuFaite = (e) => !SEC || !!(e.securite && e.securite.fait);""")
rep("""  const ui = { chef4: false, arme: false, arme4: false, armeRaz: false, msgCompte: '', anim: null, lancer: false, jouerCf: false, focus: null };""",
"""  const ui = { chef4: false, arme: false, arme4: false, armeRaz: false, msgCompte: '', anim: null, lancer: false, jouerCf: false, focus: null, arretSecu: false };""")
rep("""    R.camions.forEach((_, ci) => { const k = K(e, ci); if (k.decharge && !e.fini && !k.rentre) k.froid += min; });""",
"""    if (F) R.camions.forEach((_, ci) => { const k = K(e, ci); if (k.decharge && !e.fini && !k.rentre) k.froid += min; });""")

# chariot élévateur
rep("""  // Brume froide : l'air froid tombe et coule au sol.""",
"""  // Chariot élévateur frontal (quai sans froid, `dechargement.par: 'cariste'`) : la palette sur les
  // fourches, le mât juste derrière elle, le cariste assis sous le toit de protection (silhouette sans
  // visage). Vu de trois quarts arrière : il recule depuis la remorque vers sa place au sol.
  function chariot(x, y, e, wPal) {
    let s = '';
    const g = x - wPal / 2 - 4 * e, sol = y + 4 * e;           // bord gauche de la palette, sol
    const c = '#232a31', jaune = '#e0a514', noir = '#22272c';
    s += `<ellipse cx="${f1(g - 44 * e)}" cy="${f1(sol + 2 * e)}" rx="${f1(56 * e)}" ry="${f1(8 * e)}" fill="#000" opacity=".3"/>`;
    // mât (deux montants) et fourches sous la palette
    s += `<rect x="${f1(g - 9 * e)}" y="${f1(sol - 150 * e)}" width="${f1(5 * e)}" height="${f1(150 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g - 2 * e)}" y="${f1(sol - 150 * e)}" width="${f1(5 * e)}" height="${f1(150 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g - 9 * e)}" y="${f1(sol - 152 * e)}" width="${f1(12 * e)}" height="${f1(5 * e)}" fill="${noir}"/>`;
    s += `<rect x="${f1(g)}" y="${f1(sol - 7 * e)}" width="${f1(wPal * .9)}" height="${f1(4 * e)}" fill="#555c63"/>`;
    // carrosserie, contrepoids, roues
    s += `<rect x="${f1(g - 82 * e)}" y="${f1(sol - 52 * e)}" width="${f1(74 * e)}" height="${f1(40 * e)}" rx="${f1(6 * e)}" fill="${jaune}" stroke="#5b4508" stroke-width="${f1(e)}"/>`;
    s += `<rect x="${f1(g - 92 * e)}" y="${f1(sol - 46 * e)}" width="${f1(16 * e)}" height="${f1(36 * e)}" rx="${f1(5 * e)}" fill="${noir}"/>`;
    s += `<circle cx="${f1(g - 22 * e)}" cy="${f1(sol - 10 * e)}" r="${f1(11 * e)}" fill="#1c1c1c"/><circle cx="${f1(g - 22 * e)}" cy="${f1(sol - 10 * e)}" r="${f1(4 * e)}" fill="#777"/>`;
    s += `<circle cx="${f1(g - 70 * e)}" cy="${f1(sol - 9 * e)}" r="${f1(9 * e)}" fill="#1c1c1c"/><circle cx="${f1(g - 70 * e)}" cy="${f1(sol - 9 * e)}" r="${f1(3.5 * e)}" fill="#777"/>`;
    // toit de protection (deux montants et le toit)
    s += `<line x1="${f1(g - 16 * e)}" y1="${f1(sol - 52 * e)}" x2="${f1(g - 18 * e)}" y2="${f1(sol - 124 * e)}" stroke="${noir}" stroke-width="${f1(4 * e)}"/>`;
    s += `<line x1="${f1(g - 74 * e)}" y1="${f1(sol - 52 * e)}" x2="${f1(g - 70 * e)}" y2="${f1(sol - 124 * e)}" stroke="${noir}" stroke-width="${f1(4 * e)}"/>`;
    s += `<rect x="${f1(g - 76 * e)}" y="${f1(sol - 128 * e)}" width="${f1(62 * e)}" height="${f1(6 * e)}" rx="${f1(2 * e)}" fill="${noir}"/>`;
    // le cariste, assis : buste, bras vers le volant, tête sans visage, gilet haute visibilité
    s += `<g fill="${c}" stroke="${c}" stroke-linecap="round">`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 96 * e)}" width="${f1(22 * e)}" height="${f1(44 * e)}" rx="${f1(9 * e)}" stroke="none"/>`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 84 * e)}" width="${f1(22 * e)}" height="${f1(5 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<rect x="${f1(g - 58 * e)}" y="${f1(sol - 70 * e)}" width="${f1(22 * e)}" height="${f1(4 * e)}" fill="#c9d64a" stroke="none"/>`;
    s += `<line x1="${f1(g - 40 * e)}" y1="${f1(sol - 86 * e)}" x2="${f1(g - 26 * e)}" y2="${f1(sol - 66 * e)}" stroke-width="${f1(7 * e)}"/>`;
    s += `<circle cx="${f1(g - 47 * e)}" cy="${f1(sol - 106 * e)}" r="${f1(10 * e)}" stroke="none"/>`;
    s += '</g>';
    s += `<line x1="${f1(g - 30 * e)}" y1="${f1(sol - 70 * e)}" x2="${f1(g - 22 * e)}" y2="${f1(sol - 56 * e)}" stroke="${noir}" stroke-width="${f1(3 * e)}"/>`;
    return s;
  }
  // Brume froide : l'air froid tombe et coule au sol.""")
rep("""        mobile = paletteFace(p, x, y, ee) + transpalette(x, y, ee, (t - depart(n)) / 110, p.W * 32 * ee);""",
"""        mobile = CARISTE ? chariot(x, y, ee, p.W * 32 * ee) + paletteFace(p, x, y, ee)
          : paletteFace(p, x, y, ee) + transpalette(x, y, ee, (t - depart(n)) / 110, p.W * 32 * ee);""")
rep("""    else if (t < T_DEB) leg = `${hhmm(e.minute)} — La porte du quai se lève : l'air froid s'échappe et tombe au sol. Le temps hors froid démarre.`;
    else if (nb < P.length) leg = `${hhmm(e.minute)} — Le chauffeur sort la palette ${P[enCours ?? nb].id} au transpalette (${Math.min(nb + 1, P.length)} sur ${P.length}).`;""",
"""    else if (t < T_DEB) leg = F ? `${hhmm(e.minute)} — La porte du quai se lève : l'air froid s'échappe et tombe au sol. Le temps hors froid démarre.` : `${hhmm(e.minute)} — La porte du quai se lève.`;
    else if (nb < P.length) leg = `${hhmm(e.minute)} — ${quiSort} sort la palette ${P[enCours ?? nb].id} ${CARISTE ? 'au chariot' : 'au transpalette'} (${Math.min(nb + 1, P.length)} sur ${P.length}).`;""")
rep("""      brume: attente ? '' : brume(t),""", """      brume: attente || !F ? '' : brume(t),""")
rep("""role="img" aria-label="${ech(R.lieu.nom)} : la porte s'ouvre, le chauffeur sort les palettes une à une au transpalette">""",
"""role="img" aria-label="${ech(R.lieu.nom)} : la porte s'ouvre, ${ech(minuscule(quiSort))} sort les palettes une à une ${CARISTE ? 'au chariot élévateur' : 'au transpalette'}">""")
rep("""        <g aria-label="Afficheur de température du quai">
          <rect x="${ax}" y="${PORTE.y0 + 14}" width="96" height="54" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text x="${ax + 48}" y="${PORTE.y0 + 30}" text-anchor="middle" font-size="10" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${ech(R.lieu.nom.toUpperCase())}</text>
          <text data-q-afficheur x="${ax + 48}" y="${PORTE.y0 + 56}" text-anchor="middle" font-size="18" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tempQuai}</text>
        </g>""", """        ${F ? `<g aria-label="Afficheur de température du quai">
          <rect x="${ax}" y="${PORTE.y0 + 14}" width="96" height="54" rx="4" fill="#1b2228" stroke="#8d969c" stroke-width="2"/>
          <text x="${ax + 48}" y="${PORTE.y0 + 30}" text-anchor="middle" font-size="10" fill="#c9d2d8" font-family="system-ui,sans-serif" letter-spacing="1">${ech(R.lieu.nom.toUpperCase())}</text>
          <text data-q-afficheur x="${ax + 48}" y="${PORTE.y0 + 56}" text-anchor="middle" font-size="18" font-weight="700" fill="#8fd0ff" font-family="ui-monospace,Consolas,monospace">${tempQuai}</text>
        </g>` : ''}""")
rep("""    ${A.consignes ? `<p class="quai-aide">Le quai est réfrigéré (<b>${tempQuai}</b>, voir l'afficheur à droite de la porte), mais c'est bien plus chaud que la remorque à ${fmtT((cm.ticket && cm.ticket.consigne) || -20)}. Dès que la porte s'ouvre, <b>tout le lot sort du froid</b> : regarde la jauge en haut, elle a démarré. Le chauffeur pose les palettes ; à toi ensuite de les contrôler <b>vite et bien</b>, chaque geste coûte du temps.</p>` : ''}`;""",
"""    ${A.consignes && F ? `<p class="quai-aide">Le quai est réfrigéré (<b>${tempQuai}</b>, voir l'afficheur à droite de la porte), mais c'est bien plus chaud que la remorque à ${fmtT((cm.ticket && cm.ticket.consigne) || -20)}. Dès que la porte s'ouvre, <b>tout le lot sort du froid</b> : regarde la jauge en haut, elle a démarré. Le chauffeur pose les palettes ; à toi ensuite de les contrôler <b>vite et bien</b>, chaque geste coûte du temps.</p>` : ''}
    ${A.consignes && !F ? `<p class="quai-aide">${ech(quiSort)} pose les palettes sur le quai. À toi ensuite de les contrôler <b>une par une</b> : faire le tour, compter, lire l'étiquette, décider.</p>` : ''}`;""")

# chambre froide → zone
rep("""  function sceneCf(e, u) {
    let s = `<defs>${DEFS_FILM}</defs>`;""", """  function sceneCf(e, u) {
    if (!F) return sceneZone(e, u);
    let s = `<defs>${DEFS_FILM}</defs>`;""")
rep("""  function jouerCf(z, e) {""", """  // Quai sans froid : la zone de réception, à gauche, sans afficheur de température.
  function sceneZone(e, u) {
    let s = `<defs>${DEFS_FILM}</defs>`;
    s += '<rect x="0" y="0" width="640" height="300" fill="#4a5258"/>';
    s += '<polygon points="0,210 640,210 640,300 0,300" fill="#6a737a"/>';
    s += '<rect x="20" y="150" width="230" height="60" fill="none" stroke="#e3b21b" stroke-width="3" stroke-dasharray="10 6"/>';
    s += `<text x="135" y="140" text-anchor="middle" font-size="13" font-weight="700" fill="#f2f4f5" font-family="system-ui">${ech(R.zone.nom)}</text>`;
    s += '<rect x="540" y="60" width="100" height="150" fill="#cfd4d8"/><rect x="552" y="72" width="88" height="138" fill="#1d252b"/>';
    s += '<text x="590" y="232" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">Camion (refus)</text>';
    s += `<text x="320" y="292" text-anchor="middle" font-size="12" fill="#e4e8eb" font-family="system-ui">${ech(R.lieu.nom)}</text>`;
    const P = PAL[ca(e)];
    const acc = P.filter((p) => accepte(st(e, p))), ref = P.filter((p) => !accepte(st(e, p)));
    const items = [];
    const pasA = Math.min(48, 220 / Math.max(1, acc.length));
    acc.forEach((p, k) => {
      const x0 = 300 + k * pasA, y0 = 262, uu = Math.max(0, Math.min(1, u * 1.4 - k * .1));
      const xf = 50 + k * Math.min(44, 180 / Math.max(1, acc.length)), yf = 205;
      items.push([y0, paletteFace(p, x0 + (xf - x0) * uu, y0 + (yf - y0) * uu, .55 - .1 * uu), 1]);
    });
    const pasR = Math.min(48, 150 / Math.max(1, ref.length));
    ref.forEach((p, k) => {
      const x0 = 420 + k * pasR, y0 = 262;
      items.push([y0, paletteFace(p, x0, y0, .55) + `<text x="${x0}" y="${y0 + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#ff9a8a" font-family="system-ui">refusée</text>`, 1]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, gg, o]) => { s += `<g opacity="${o.toFixed(2)}">${gg}</g>`; });
    if (u >= 1 && acc.length) s += `<text x="135" y="235" text-anchor="middle" font-size="13" fill="#f2f4f5" font-family="system-ui">${acc.length} palette${acc.length > 1 ? 's' : ''} rangée${acc.length > 1 ? 's' : ''} ✓</text>`;
    return s;
  }
  function jouerCf(z, e) {""")

# horloges : pas de jauge sans froid
rep("""      ${R.camions.map((_, ci) => jauge(ci)).join('')}""", """      ${F ? R.camions.map((_, ci) => jauge(ci)).join('') : ''}""")

# écran 1
rep("""  function ecran1(e) {
    if (M) return ecran1Multi(e);
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">""",
"""  function ecran1(e) {
    if (M) return ecran1Multi(e);
    if (!F) return ecran1SansFroid(e);
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="Remorques frigorifiques à quai devant un entrepôt">""")
rep("""  // Plusieurs camions : les papiers de chacun, puis le choix de l'ordre et sa justification, puis""",
"""  // Quai sans froid : le BL seul (pas de ticket), puis l'ordre de décharger.
  function ecran1SansFroid(e) {
    return `<section class="quai-carte">
      <div class="quai-photo">
        <img src="${ech(PH.arrivee)}" alt="${ech(PH.altArrivee || 'Camion à quai devant un entrepôt')}">
        <div class="quai-legende">${ech(cam.arrivee || '')} — ${ech(R.lieu.nom)}. Le camion de ${fictif(cam.transporteur, cam.fictif)} est à quai, portes fermées.</div>
      </div>
      <div class="quai-chauffeur">${silhouette()}
        <p><b>Le chauffeur :</b> « ${ech(cam.parole || `Bonjour, livraison ${cam.fournisseur || ''}. Voilà mon bon de livraison. Je peux ouvrir ?`)} »</p>
      </div>
      <div class="quai-doc">
        <div class="quai-doc-titre">📄 Bon de livraison</div>
        ${blHtml()}
        <div class="quai-reconst">BL n° ${ech(cam.bl)} — Document pédagogique, reconstitution, non contractuel.</div>
      </div>
      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini || !secuFaite(e) ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>
        <span class="quai-cout">${ech(quiSort)} ${CARISTE ? 'sort' : 'pose'} toutes les palettes sur le quai · durée : ${formule()}</span></p>
    </section>`;
  }

  // Plusieurs camions : les papiers de chacun, puis le choix de l'ordre et sa justification, puis""")
rep("""      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>""",
"""      <p><button class="btn btn-p" data-q="decharger" ${e.decharge || e.fini || !secuFaite(e) ? 'disabled' : ''}>« Oui, vous pouvez ouvrir et décharger »</button>""")
rep("""    if (!unDecharge(e, R)) return tousLus(e) && e.ordre && e.ordre.premier === ci && !!e.ordre.phrase;""",
"""    if (!secuFaite(e)) return false;
    if (!unDecharge(e, R)) return tousLus(e) && e.ordre && e.ordre.premier === ci && !!e.ordre.phrase;""")

# écran 3
rep("""          <div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur <span class="quai-cout">· ${fmtMin(C.sonder)}</span></button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur</span>` : ''}</div>""",
"""          ${F ? `<div class="quai-ligne"><button class="btn" data-q="sonder" ${dis}>Sonder à cœur <span class="quai-cout">· ${fmtMin(C.sonder)}</span></button>
            ${s.sonde !== null ? `<span class="quai-constat" data-q-sonde>${virgule(Number(s.sonde).toFixed(1)).replace('-', '−')} °C à cœur</span>` : ''}</div>` : ''}""")
rep("""            <select id="qMotif" data-q-motif ${dis}>${Object.entries(MOTIFS).map(([kk, v]) => `<option value="${kk}" ${s.motif === kk ? 'selected' : ''}>${v}</option>`).join('')}</select></div>""",
"""            <select id="qMotif" data-q-motif ${dis}>${R.motifs.map((kk) => `<option value="${kk}" ${s.motif === kk ? 'selected' : ''}>${MOTIFS[kk]}</option>`).join('')}</select></div>""")
rep("""            <select id="qMotif2" data-q-motif2 ${dis}>${Object.entries(MOTIFS).map(([kk, v]) => `<option value="${kk}" ${(s.motif2 || 'aucun') === kk ? 'selected' : ''}>${kk === 'aucun' ? 'aucun autre problème' : v}</option>`).join('')}</select></div>` : ''}""",
"""            <select id="qMotif2" data-q-motif2 ${dis}>${R.motifs.map((kk) => `<option value="${kk}" ${(s.motif2 || 'aucun') === kk ? 'selected' : ''}>${kk === 'aucun' ? 'aucun autre problème' : MOTIFS[kk]}</option>`).join('')}</select></div>` : ''}""")
rep("""      const fait = sq.valide ? '✓ validée' : [sq.sonde !== null ? 'sondée' : null, compte ? 'comptée' : null""",
"""      const fait = sq.valide ? '✓ validée' : [F && sq.sonde !== null ? 'sondée' : null, compte ? 'comptée' : null""")
rep("""      : `<button class="btn${nonVal ? '' : ' btn-p'}" data-q="vers4" data-libre>Contrôles terminés → réserves et chambre froide</button>`;""",
"""      : `<button class="btn${nonVal ? '' : ' btn-p'}" data-q="vers4" data-libre>Contrôles terminés → réserves et ${F ? 'chambre froide' : ech(zoneMin)}</button>`;""")
# étiquette
rep("""      return `<div class="quai-etiq quai-etiq-dechiree" data-q-etiquette>${ech(cm.fournisseur)} — produit surgelé, cons…<br>""",
"""      return `<div class="quai-etiq quai-etiq-dechiree" data-q-etiquette>${ech(cm.fournisseur)}${F ? ' — produit surgelé, cons…' : ' — …'}<br>""")
rep("""    return `<div class="quai-etiq" data-q-etiquette><b>${ech(cm.fournisseur)}</b> — produit surgelé, conserver à −18 °C<br>Réf.""",
"""    return `<div class="quai-etiq" data-q-etiquette><b>${ech(cm.fournisseur)}</b>${F ? ' — produit surgelé, conserver à −18 °C' : ''}<br>Réf.""")

# écran 4
rep("""      <h2 class="quai-h2"><span class="quai-pastille-etape">4</span>Rentrer le lot en chambre froide, écrire les réserves, faire signer${M ? ` — camion ${ech(cm.nom)}` : ''}</h2>
      ${choixCamion(e)}
      ${A.consignes ? `<p class="quai-aide">""", """      <h2 class="quai-h2"><span class="quai-pastille-etape">4</span>${F ? 'Rentrer le lot en chambre froide' : `Rentrer les palettes en ${ech(zoneMin)}`}, écrire les réserves, faire signer${M ? ` — camion ${ech(cm.nom)}` : ''}</h2>
      ${choixCamion(e)}
      ${A.consignes && !F ? `<p class="quai-aide">Règle du quai : <b>rentre les palettes acceptées</b> en ${ech(zoneMin)}, puis <b>écris tes réserves sur le BL</b> et fais-les signer par le chauffeur.<br>
        Une réserve doit être <b>précise</b> : quelle palette, quoi, combien. « Sous réserve de déballage » ne vaut rien : ce n'est pas une réserve.</p>` : ''}
      ${A.consignes && F ? `<p class="quai-aide">""")
rep("""          <div class="quai-doc-titre">🧊 ${ech(R.lieu.chambre.nom)}</div>
          <svg class="quai-cf" data-q-cf viewBox="0 0 640 300" role="img" aria-label="Le quai et l'entrée de la chambre froide">${sceneCf(e, k.rentre ? 1 : 0)}</svg>
          <p class="note" data-q-etatcf>${k.rentre ? `Lot rentré à ${hhmm(k.heureRentre ?? e.minute)} : ${nAcc} palettes en chambre froide, ${N - nAcc} refusée(s) au quai.`
            : (toutDecide ? `${nAcc} palettes à rentrer · temps hors froid : ${fmtMin(k.froid)}.` : 'Décide d’abord pour chaque palette.')}</p>
          <button class="btn btn-p" data-q="rentrer" ${!k.decharge || !toutDecide || k.rentre || e.fini ? 'disabled' : ''}>Rentrer le lot accepté en chambre froide <span class="quai-cout">· ${fmtMin(C.rentrer)} de manutention</span></button>""",
"""          <div class="quai-doc-titre">${F ? `🧊 ${ech(R.lieu.chambre.nom)}` : `📦 ${ech(R.zone.nom)}`}</div>
          <svg class="quai-cf" data-q-cf viewBox="0 0 640 300" role="img" aria-label="${F ? 'Le quai et l\\'entrée de la chambre froide' : `Le quai et la ${ech(zoneMin)}`}">${sceneCf(e, k.rentre ? 1 : 0)}</svg>
          <p class="note" data-q-etatcf>${k.rentre ? `Lot rentré à ${hhmm(k.heureRentre ?? e.minute)} : ${nAcc} palettes en ${F ? 'chambre froide' : ech(zoneMin)}, ${N - nAcc} refusée(s) au quai.`
            : (toutDecide ? `${nAcc} palettes à rentrer${F ? ` · temps hors froid : ${fmtMin(k.froid)}` : ''}.` : 'Décide d’abord pour chaque palette.')}</p>
          <button class="btn btn-p" data-q="rentrer" ${!k.decharge || !toutDecide || k.rentre || e.fini ? 'disabled' : ''}>${F ? 'Rentrer le lot accepté en chambre froide' : `Rentrer les palettes acceptées en ${ech(zoneMin)}`} <span class="quai-cout">· ${fmtMin(C.rentrer)} de manutention</span></button>""")
# bilan
rep("""      : `<p class="note">Temps hors froid du lot : ${e.decharge ? fmtMin(e.froid) : '—'} (repère ${R.seuil} min).${ordre(e)}</p>`;""",
"""      : (F ? `<p class="note">Temps hors froid du lot : ${e.decharge ? fmtMin(e.froid) : '—'} (repère ${R.seuil} min).${ordre(e)}</p>` : '');""")
rep("""      <tr><td>Temps hors froid</td><td>${fmtMin(n.froid)}</td><td>${n.ptsFroid} / ${n.N.horsFroid[0][1]} (${sf})</td></tr>""",
"""      ${n.sansFroid ? '' : `<tr><td>Temps hors froid</td><td>${fmtMin(n.froid)}</td><td>${n.ptsFroid} / ${n.N.horsFroid[0][1]} (${sf})</td></tr>`}""")
# rentrer : journal
rep("""    avancer(e, C.rentrer, `lot${M ? ` du ${nomCam(ci)}` : ''} rentré en chambre froide (${n} palettes)`);""",
"""    avancer(e, C.rentrer, `lot${M ? ` du ${nomCam(ci)}` : ''} rentré en ${F ? 'chambre froide' : zoneMin} (${n} palettes)`);""")
# chef « le froid d'abord » : seulement avec froid
rep("""        if (A.chefDeQuai && !k.rentre && !k.chefVu) {""", """        if (A.chefDeQuai && F && !k.rentre && !k.chefVu) {""")
# aller / décharger : fermés tant que la sécurité n'est pas faite
rep("""  function aller(e, n, api) {
    if (n > 1 && !unDecharge(e, R)) return;""", """  function aller(e, n, api) {
    if (n >= 1 && !secuFaite(e)) return;
    if (n > 1 && !unDecharge(e, R)) return;""")
rep("""    const k = K(e, ci);
    if (k.decharge) return;
    if (M) {""", """    const k = K(e, ci);
    if (k.decharge || !secuFaite(e)) return;
    if (M) {""")
# tête : camion frigorifique
rep("""        : `Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · camion frigorifique ${fictif(cam.transporteur, cam.fictif)}`;""",
"""        : `Livraison « ${fictif(cam.fournisseur, cam.fictif)} » · camion ${F ? 'frigorifique ' : ''}${fictif(cam.transporteur, cam.fictif)}`;""")
# étapes : libellé ④ et étape ⓪
rep("""      const ouvert = unDecharge(e, R);
      const etape = ouvert ? (e.etape || 1) : 1;
      const corps = etape === 1 ? ecran1(e) : etape === 2 ? `<section class="quai-carte">${scene2(e)}</section>` : etape === 3 ? ecran3(e) : ecran4(e, api);
      const libs = M ? ['① Les camions arrivent'].concat(ETAPES.slice(1)) : ETAPES;""",
"""      const ouvert = unDecharge(e, R);
      // Étape ⓪ (sécurité) : tant que l'élève n'a pas commencé à décharger, ou s'il y revient pour relire.
      const etape = ouvert ? (e.etape ?? 1) || 1 : (SEC && (!secuFaite(e) || e.etape === 0) ? 0 : 1);
      const corps = etape === 0 ? ecran0(e) : etape === 1 ? ecran1(e) : etape === 2 ? `<section class="quai-carte">${scene2(e)}</section>` : etape === 3 ? ecran3(e) : ecran4(e, api);
      const libs4 = (M ? ['① Les camions arrivent'].concat(ETAPES.slice(1)) : ETAPES.slice()).map((l, i) => (i === 3 && !F ? `④ Réserves et ${zoneMin}` : l));
      const libs = SEC ? [ETAPE_SECU].concat(libs4) : libs4;
      const n0 = SEC ? 0 : 1;   // numéro de la première étape affichée""")
rep("""          ${libs.map((l, i) => `<button data-q="etape" data-libre data-n="${i + 1}" class="${etape === i + 1 ? 'on' : ''}" ${i > 0 && !ouvert ? 'disabled' : ''} ${etape === i + 1 ? 'aria-current="step"' : ''}>${l}</button>`).join('')}""",
"""          ${libs.map((l, i) => { const n = i + n0, ferme = (n >= 1 && !secuFaite(e)) || (n > 1 && !ouvert);
            return `<button data-q="etape" data-libre data-n="${n}" class="${etape === n ? 'on' : ''}" ${ferme ? 'disabled' : ''} ${etape === n ? 'aria-current="step"' : ''}>${l}</button>`; }).join('')}""")

# écran 0 (sécurité) : avant l'écran 1
rep("""  // Quai sans froid : le BL seul (pas de ticket), puis l'ordre de décharger.""",
"""  // L'étape ⓪ : constater avant de décharger (lot 5). Les réponses se figent quand le déchargement commence.
  function ecran0(e) {
    const sec = e.securite, fige = sec.fait || e.fini, dis = fige ? 'disabled' : '';
    const S0 = SEC, sig = S0.signaler || {};
    const lignes = S0.points.map((x) => `<tr data-q-point="${ech(x.id)}"><th scope="row">${ech(x.lib)}</th>
        ${['ok', 'ko'].map((v) => `<td><label><input type="radio" name="qSecu-${ech(x.id)}" data-q-secu="${ech(x.id)}" value="${v}" ${sec.rep[x.id] === v ? 'checked' : ''} ${dis}> ${v === 'ok' ? 'OK' : 'Pas OK'}</label></td>`).join('')}</tr>`).join('');
    return `<section class="quai-carte" data-q-securite>
      <h2 class="quai-h2"><span class="quai-pastille-etape">0</span>Avant de décharger : la sécurité</h2>
      ${S0.photo ? `<div class="quai-photo"><img src="${ech(S0.photo)}" alt="${ech(S0.alt || 'Le camion à quai')}"></div>` : ''}
      <p class="quai-secu-scene">${ech(S0.scene || '')}</p>
      <table class="quai-secu"><thead><tr><th scope="col">À vérifier</th><th scope="col">OK</th><th scope="col">Pas OK</th></tr></thead><tbody>${lignes}</tbody></table>
      ${sec.chef ? `<div class="quai-alerte" role="status" data-q-secu-chef><b>Le chef de quai :</b> « ${ech(sec.chef)} »</div>` : ''}
      ${ui.arretSecu ? `<div class="quai-alerte" role="alert" data-q-secu-arret><b>Le chef de quai :</b> « ${ech(S0.arret || 'Stop ! Avant d’entrer dans la remorque, tout doit être en sécurité. Regarde encore la liste et signale ce qui ne va pas.')} »</div>` : ''}
      <p class="quai-ligne">
        <button class="btn" data-q="signaler" ${dis}>${ech(sig.bouton || 'Signaler au chef de quai')}</button>
        <button class="btn btn-p" data-q="commencer" ${dis}>${ech(S0.commencer || 'Commencer à décharger')} →</button>
      </p>
      ${sec.fait ? '<p class="note">Le déchargement a commencé : ce constat est figé.</p>' : ''}
    </section>`;
  }

  // Quai sans froid : le BL seul (pas de ticket), puis l'ordre de décharger.""")

# gestes de l'étape ⓪
rep("""      on('etape', (ev, b) => aller(e, +b.dataset.n, api));""",
"""      on('etape', (ev, b) => {
        const n = +b.dataset.n;
        if (n === 0 && SEC) { if (ui.anim) ui.anim.finir(); e.etape = 0; api.sauver(); api.redessiner(); return; }
        aller(e, n, api);
      });
      // L'étape ⓪ : chaque réponse est rangée tout de suite ; rien n'est corrigé avant la fin.
      z.querySelectorAll('[data-q-secu]').forEach((r) => r.addEventListener('change', () => {
        const sec = e.securite;
        if (!sec || sec.fait || e.fini) return;
        sec.rep[r.dataset.qSecu] = r.value; api.sauver();
      }));
      on('signaler', geste(() => {
        const sec = e.securite;
        if (!sec || sec.fait) return;
        const ko = SEC.points.filter((x) => sec.rep[x.id] === 'ko').map((x) => x.id);
        const sig = SEC.signaler || {};
        if (!ko.length) { sec.chef = sig.vide || 'Qu’est-ce qui ne va pas ? Coche « Pas OK » sur ce que tu veux me signaler.'; api.sauver(); api.redessiner(); return; }
        sec.signaux.push({ points: ko, apresArret: !!sec.arrete });
        const vrai = SEC.points.some((x) => !x.ok && ko.includes(x.id));
        sec.chef = vrai ? (sig.reponse || 'Bien vu, je m’en occupe. Tu peux décharger.') : (sig.rien || 'Je viens voir… Ce que tu me signales est en ordre.');
        ui.arretSecu = false;
        api.sauver(); api.redessiner();
      }));
      on('commencer', geste(() => {
        const sec = e.securite;
        if (!sec || sec.fait) return;
        // Un point faux pas encore signalé : en guidage, le chef de quai arrête l'élève (sans dire lequel).
        const signales = new Set([].concat(...sec.signaux.map((g) => g.points || [])));
        const oublie = SEC.points.some((x) => !x.ok && !signales.has(x.id));
        if (oublie && !EVAL) { sec.arrete = true; ui.arretSecu = true; api.sauver(); api.redessiner(); return; }
        sec.fait = true; ui.arretSecu = false; e.etape = 1;
        api.sauver(); api.redessiner(); if (api.haut) api.haut();
      }));""")

# plusieurs camions sans froid : pas de ticket dans les cartes, pas d'attente du ticket
rep("""const tousLus = (e) => R.camions.every((_, ci) => K(e, ci).ticketLu);""",
"""const tousLus = (e) => !F || R.camions.every((_, ci) => K(e, ci).ticketLu);""")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
