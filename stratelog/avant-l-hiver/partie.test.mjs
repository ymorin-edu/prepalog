// Tests de la partie de classe (partie.js) : `node --test stratelog/avant-l-hiver/`. Valeurs attendues écrites à la main.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as P from './partie.js';

const T0 = 1_000_000;
const classe = (n) => Array.from({ length: n }, (_, i) => ({ uid: `u${i}`, nom: `Élève ${i}` }));
function partieOuverte(membres) {
  let E = P.etatNeuf();
  E.reglages.nbVilles = 3;
  E = P.formerVilles(E, classe(4), 'main', () => 0.5);
  Object.entries(membres).forEach(([u, id]) => { E = P.deplacer(E, u, id); });
  E = P.villesPretes(E, 7);
  const L = Object.fromEntries(Object.keys(membres).map((u) => [u, { uid: u, vu: T0 }]));
  return { E: P.ouvrirTour(E, L, T0 + 1000), L };
}

test('lignes : l’uid est la clé de la ligne ; une ligne posée par un autre est ignorée', () => {
  const L = P.lireLignes([{ id: 'a', json: '{"uid":"b","vu":1}' }, { id: 'c', _par: 'a', json: '{"vu":2}' }, { id: 'd', json: 'pas du json' }]);
  assert.deepEqual(Object.keys(L), ['a']);
  assert.equal(L.a.uid, 'a');
});

test('rôles : deux présents = deux lots ; le premier qui clique l’emporte, le Seigneur passe avant les demandes', () => {
  const { E, L } = partieOuverte({ u0: 'A', u1: 'A', u2: 'B', u3: 'C' });
  L.u0.claim = { tour: 0, n: 2, lot: 0, t: 5 };
  L.u1.claim = { tour: 0, n: 2, lot: 0, t: 3 };
  let tit = P.titulaires(E, L, 'A', T0 + 2000);
  assert.deepEqual(tit.lots, [['M', 'I'], ['O', 'B']]);
  assert.equal(tit.lot[0], 'u1');
  assert.equal(tit.tous, false);
  const E2 = P.reattribuer(E, L, 'A', 0, 'u0', tit);
  tit = P.titulaires(E2, L, 'A', T0 + 2000);
  assert.equal(tit.lot[0], 'u0');
  assert.equal(tit.lot[1], undefined, 'la demande de u1 sur le lot 0 ne glisse pas vers un autre lot');
});

test('rôles : le seul présent de sa ville tient les quatre rôles sans cliquer « Je prends »', () => {
  const { E, L } = partieOuverte({ u0: 'A', u1: 'A', u2: 'B', u3: 'C' });
  const tit = P.titulaires(E, L, 'B', T0 + 2000);
  assert.equal(tit.lot[0], 'u2');
  assert.equal(tit.tous, true);
  assert.deepEqual(tit.rolesDe('u2').sort(), ['B', 'I', 'M', 'O']);
  assert.equal(P.titulaires(E, L, 'A', T0 + 2000).tous, false, 'à deux, chacun doit encore prendre son lot');
});

test('brouillon : sans tour précédent, 9 équipes aux champs et 1 au bûcheron ; rien ne part tant que rien n’est rempli', () => {
  const { E, L } = partieOuverte({ u0: 'A', u1: 'B', u2: 'C', u3: 'C' });
  const tit = P.titulaires(E, L, 'A', T0 + 2000);
  const dr = P.brouillon(E, L, 'A', tit);
  assert.equal(dr.equipes.champ, 9);
  assert.equal(dr.equipes.bucheron, 1);
  assert.deepEqual(dr.ops, []);
});

test('présence : un élève non vu depuis 20 minutes n’est pas présent à l’ouverture', () => {
  let E = P.etatNeuf();
  E = P.formerVilles(E, classe(2), 'main');
  E = P.deplacer(E, 'u0', 'A'); E = P.deplacer(E, 'u1', 'A');
  E = P.villesPretes(E, 3);
  const L = { u0: { uid: 'u0', vu: T0 }, u1: { uid: 'u1', vu: T0 - 21 * 60000 } };
  const E2 = P.ouvrirTour(E, L, T0);
  assert.deepEqual(E2.presents.A, ['u0']);
});
