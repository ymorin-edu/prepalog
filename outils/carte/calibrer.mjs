// Vérifie le CALAGE d'une journée de tournée sur la carte réelle — par énumération complète.
//
//   node outils/carte/calibrer.mjs [contenus/boost-ent32-carte.js] [outils/carte/boost-ent32.json]
//
// Ce que doit tenir une journée (règles d'ENT-3.1, reprises pour ENT-3.2) :
//   1. la charge dépasse, et UN SEUL client suffit, à lui seul, à la ramener sous la limite :
//      « ce qui reste à quai » a une seule réponse quand on charge le plus de clients possible ;
//   2. avec ce client à quai, une part MINORITAIRE des ordres de passage attrape le train ;
//   3. s'il y a un créneau, le plus court chemin ne le respecte PAS (l'ordre compte vraiment),
//      et une part encore plus petite des ordres tient tout à la fois.
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
  if (okTrain && okCren) { tout++; if (!meilleur || m < meilleur.m) meilleur = { p, m, fin }; }
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
if (pb.length) { console.error('\nCALAGE FAUX :\n  - ' + pb.join('\n  - ')); process.exit(1); }
console.log('\ncalage tenu.');
