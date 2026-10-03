// Vérifie le CALAGE d'une journée de tournée sur la carte réelle — par énumération complète.
//
//   node outils/carte/calibrer.mjs [contenus/boost-ent32-carte.js] [outils/carte/boost-ent32.json] [imprévu.js]
//
// Sans argument, c'est la journée d'ENT-3.2 ET son imprévu. Avec une autre carte, l'imprévu n'est
// vérifié que s'il est donné en troisième argument.
//
// Ce que doit tenir une journée (règles d'ENT-3.1, reprises pour ENT-3.2) :
//   1. la charge dépasse, et UN SEUL client suffit, à lui seul, à la ramener sous la limite :
//      « ce qui reste à quai » a une seule réponse quand on charge le plus de clients possible ;
//   2. avec ce client à quai, une part MINORITAIRE des ordres de passage attrape le train ;
//   3. s'il y a un créneau, le plus court chemin ne le respecte PAS (l'ordre compte vraiment),
//      et une part encore plus petite des ordres tient tout à la fois.
//   4. s'il y a un IMPRÉVU (ENT-3.2, phase 2 : `contenus/boost-ent32-imprevu.js`) :
//      - aucune tournée qui tenait tout en phase 1 ne tient encore, client annulé retiré ;
//      - une nouvelle tournée qui tient tout existe, et la meilleure n'est pas l'ancienne ;
//      - le plus court chemin de la phase 2 rate un créneau (l'ordre compte encore) ;
//      - le client resté à quai laisse la charge sous la limite.
// Les km sont ceux de la table des itinéraires par les rues, dans le sens du trajet.
// Sort en erreur (code 1) si une règle tombe : à relancer après tout changement de client.
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const DEPOT = path.resolve(ICI, '..', '..');
const modF = path.resolve(DEPOT, process.argv[2] || 'contenus/boost-ent32-carte.js');
const jsonF = path.resolve(DEPOT, process.argv[3] || 'outils/carte/boost-ent32.json');
const { CARTE: C } = await import(pathToFileURL(modF).href);
const J = JSON.parse(fs.readFileSync(jsonF, 'utf8')).calibrage;
const impF = process.argv[4] ? path.resolve(DEPOT, process.argv[4])
  : (process.argv[2] ? null : path.resolve(DEPOT, 'contenus/boost-ent32-imprevu.js'));
const IMP = impF ? (await import(pathToFileURL(impF).href)).IMPREVU : null;
const d = (a, b) => C.trajets[`${a}|${b}`].m;
const hm = (m) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')}`;
function* perms(a) { if (a.length < 2) { yield a; return; } for (let i = 0; i < a.length; i++) for (const p of perms([...a.slice(0, i), ...a.slice(i + 1)])) yield [a[i], ...p]; }

const pb = [];
const W = C.clients.reduce((s, c) => s + c.kg, 0), trop = W - J.chargeUtile;
const seuls = C.clients.filter((c) => c.kg >= trop);
console.log(`charge : ${W} kg pour ${J.chargeUtile} ; à écarter au moins ${trop} kg ; clients qui y suffisent seuls : ${seuls.map((c) => `${c.nom} (${c.kg} kg)`).join(', ') || 'aucun'}`);
if (trop <= 0) pb.push('la charge ne dépasse pas : personne ne reste à quai');
if (!seuls.length) pb.push('aucun client ne suffit seul à ramener la charge : il faut en laisser plusieurs à quai');
if (seuls.length > 1) pb.push(`${seuls.length} clients suffisent seuls à ramener la charge : la réponse n'est pas unique`);
const S = C.clients.filter((c) => c.id !== (seuls[0] || {}).id);
console.log(`chargés : ${S.reduce((s, c) => s + c.kg, 0)} kg en ${S.length} arrêts`);

const cren = S.filter((c) => c.creneau);
let n = 0, train = 0, tout = 0, court = null, meilleur = null;
const tiennent = [];
for (const p of perms(S.map((c) => c.id))) {
  n++;
  const ch = ['depart', ...p, 'arrivee'];
  let m = 0; const arr = {};
  for (let i = 1; i < ch.length; i++) {
    m += d(ch[i - 1], ch[i]);
    if (i < ch.length - 1) arr[ch[i]] = J.depart + m / 1000 / J.vitesse * 60 + (i - 1) * J.service;
  }
  const fin = J.depart + m / 1000 / J.vitesse * 60 + S.length * J.service;
  const okTrain = fin <= J.train;
  const okCren = cren.every((c) => arr[c.id] <= c.creneau.avant);
  if (okTrain) train++;
  if (okTrain && okCren) { tout++; tiennent.push(p); if (!meilleur || m < meilleur.m) meilleur = { p, m, fin }; }
  if (!court || m < court.m) court = { p, m, fin, okCren, okTrain };
}
const pc = (x) => `${(100 * x / n).toFixed(1)} %`;
console.log(`${n} ordres de passage : ${train} attrapent le train (${pc(train)}), ${tout} tiennent aussi le créneau (${pc(tout)})`);
console.log(`plus court : ${court.p.join(' ')} — ${(court.m / 1000).toFixed(2)} km, gare à ${hm(court.fin)}, créneau ${court.okCren ? 'tenu' : 'RATÉ'}`);
if (meilleur) console.log(`meilleur qui tient tout : ${meilleur.p.join(' ')} — ${(meilleur.m / 1000).toFixed(2)} km, gare à ${hm(meilleur.fin)}`);
if (!(train > 0 && train < n * 0.5)) pb.push(`train : ${pc(train)} des ordres le prennent (attendu : entre 0 et 50 %)`);
if (cren.length) {
  if (court.okCren) pb.push('le plus court chemin respecte déjà le créneau : il ne force rien');
  if (!(tout > 0 && tout < train)) pb.push(`créneau : ${tout} ordres tiennent tout`);
}

// ── L'imprévu (phase 2) ─────────────────────────────────────────────────────────────────
if (IMP) {
  const an = IMP.annules.map(String);
  const cr2 = (c) => (Object.prototype.hasOwnProperty.call(IMP.creneaux, c.id) ? IMP.creneaux[c.id] : c.creneau) || null;
  if (seuls[0] && String(IMP.aQuai) !== seuls[0].id) pb.push(`imprévu : le client à quai (${IMP.aQuai}) n'est pas celui de la phase 1 (${seuls[0].id})`);
  if (an.some((id) => !S.some((c) => c.id === id))) pb.push('imprévu : le client annulé n’était pas chargé en phase 1 — l’annulation ne change rien');
  const S2 = S.filter((c) => !an.includes(c.id));
  const kg2 = S2.reduce((t, c) => t + c.kg, 0);
  if (kg2 > J.chargeUtile) pb.push(`imprévu : ${kg2} kg chargés pour ${J.chargeUtile}`);
  const ev = (p) => {
    const ch = ['depart', ...p, 'arrivee']; let m = 0, ok = true;
    for (let i = 1; i < ch.length; i++) {
      m += d(ch[i - 1], ch[i]);
      if (i < ch.length - 1) {
        const k = cr2(S2.find((c) => c.id === ch[i]));
        if (k && J.depart + m / 1000 / J.vitesse * 60 + (i - 1) * J.service > k.avant) ok = false;
      }
    }
    const fin = J.depart + m / 1000 / J.vitesse * 60 + p.length * J.service;
    return { m, fin, ok: ok && fin <= J.train };
  };
  const encore = tiennent.filter((p) => ev(p.filter((id) => !an.includes(id))).ok).length;
  let n2 = 0, tout2 = 0, court2 = null, meilleur2 = null;
  for (const p of perms(S2.map((c) => c.id))) {
    n2++;
    const r = ev(p);
    if (r.ok) { tout2++; if (!meilleur2 || r.m < meilleur2.m) meilleur2 = { p, m: r.m, fin: r.fin }; }
    if (!court2 || r.m < court2.m) court2 = { p, m: r.m, ok: r.ok };
  }
  const ancien = meilleur ? meilleur.p.filter((id) => !an.includes(id)) : [];
  console.log(`
imprévu : ${an.join(', ')} annulé(s), ${kg2} kg chargés en ${S2.length} arrêts`);
  console.log(`  tournées justes de la phase 1 qui tiennent encore : ${encore} sur ${tiennent.length}`);
  console.log(`  ${n2} ordres de passage : ${tout2} tiennent tout (${(100 * tout2 / n2).toFixed(1)} %)`);
  if (meilleur2) console.log(`  meilleur qui tient tout : ${meilleur2.p.join(' ')} — ${(meilleur2.m / 1000).toFixed(2)} km, gare à ${hm(meilleur2.fin)}`);
  console.log(`  plus court : ${court2.p.join(' ')} — ${(court2.m / 1000).toFixed(2)} km, ${court2.ok ? 'tient tout' : 'rate une contrainte'}`);
  if (encore) pb.push(`imprévu : ${encore} tournée(s) de la phase 1 tiennent encore, client annulé retiré — rien à replanifier`);
  if (!tout2) pb.push('imprévu : aucune tournée ne tient tout en phase 2');
  if (meilleur2 && meilleur2.p.join() === ancien.join()) pb.push('imprévu : la meilleure tournée est l’ancienne, client annulé retiré');
  if (court2.ok) pb.push('imprévu : le plus court chemin tient tout — l’ordre ne compte plus');
}
if (pb.length) { console.error('\nCALAGE FAUX :\n  - ' + pb.join('\n  - ')); process.exit(1); }
console.log('\ncalage tenu.');
