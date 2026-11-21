// Tests du moteur de règles d'« Avant l'Hiver ». Valeurs attendues calculées à la main d'après la fiche
// stratelog-ep1-allege (partie 1). Lancer : node --test "stratelog/**/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as R from './regles.js';
import { experience } from './equilibre.mjs';

// Une partie au tour voulu, villes à l'état de départ ; `ecart` = tour de livraison avec écart (hors partie par défaut).
function partie(villes = ['A', 'B', 'C'], tour = 1, ecart = 9) {
  const p = R.nouvellePartie({ villes, graine: 3, toursEcart: Object.fromEntries(villes.map((v) => [v, ecart])) });
  p.tour = tour;
  return p;
}
const dec = (x = {}) => ({ ...R.decisionsVides(), ...x });

test('prix, besoin en grain, récolte au prorata', () => {
  assert.equal(R.prix('grain', 'Été'), 3);
  assert.equal(R.prix('grain', 'Automne'), 4);
  assert.equal(R.prix('grain', 'Hiver'), 6);
  assert.equal(R.prix('grain', 'Printemps'), 6);
  assert.equal(R.prix('drap', 'Été', 'foire'), 16);
  assert.equal(R.besoinGrain(100, 'Été'), 50);
  assert.equal(R.besoinGrain(100, 'Hiver'), 75);
  assert.equal(R.besoinGrain(101, 'Hiver'), 77);            // 51 × 1,5 = 76,5 → 77
  assert.equal(R.besoinGrain(100, 'Automne', 'grand_froid'), 70);
  assert.equal(R.recolteParChamp('Été', null, 2), 33);       // 2 équipes sur 3 : 33 sacs
  assert.equal(R.recolteParChamp('Automne', 'belle_recolte', 1), 30);
  assert.equal(R.recolteParChamp('Hiver', null, 3), 0);
  assert.equal(R.charrettesPour(45), 3);
  assert.equal(R.saisonDu(0), 'Été');
  assert.equal(R.saisonDu(7), 'Hiver');
});

test('premier été : 9 équipes aux champs, registre juste', () => {
  const p = partie();
  const d = dec({ equipes: { champ: 9 }, registre: { besoin: 50, grenier: 70, caisse: 300 } });
  const { partie: q, journal } = R.resoudreTour(p, { A: d, B: dec(), C: dec() });
  const v = q.etat.A;
  // 80 + 150 récoltés − 50 mangés = 180 ; 30 au-delà du grenier, la moitié perdue → 165.
  assert.equal(v.grain, 165);
  assert.equal(journal.A.debordement.grain, 15);
  assert.equal(v.hab, 110);
  assert.equal(v.deniers, 322);                               // impôt 110 ÷ 5 = 22
  assert.equal(v.bois, 40);                                   // bûcheron sans équipe : rien
  assert.equal(journal.A.registre.juste, true);
  assert.equal(journal.A.registre.cases.length, 3);           // ni halle, ni réserve sans action
  assert.equal(v.bonus, 2);
  assert.equal(journal.A.score, 27 + 15 + 6 + 30 + 2);
  assert.equal(q.tour, 2);
  // Ville qui a rendu sans mettre d'équipe aux champs : aucune récolte.
  assert.equal(q.etat.B.grain, 30);
  // Ville qui n'a rien rendu : 9 équipes placées d'office aux champs, 1 au bûcheron (pas de bonus).
  const { partie: q2, journal: j2 } = R.resoudreTour(p, { A: d, B: dec(), C: null });
  assert.deepEqual(j2.C.equipesDOffice, { champ: 9, dech: 0, atelier: 0, carriere: 0, bucheron: 1 });
  assert.equal(q2.etat.C.grain, 165);
  assert.equal(q2.etat.C.bonus, 0);
  assert.equal(journal.B.registre.juste, false);              // cases vides = fausses
});

test('achat : charrettes, coût, quai, reste du Marché', () => {
  const p = partie();
  const A = dec({ achats: [{ m: 'bois', q: 45, charrettes: 3 }], equipes: { champ: 8, dech: 2 },
    registre: { besoin: 50, grenier: 70, caisse: 159, halle: -5, achats: [{ cout: 141, recu: 45 }] }, reserve: false });
  const B = dec({ achats: [{ m: 'bois', q: 45, charrettes: 2 }], equipes: { dech: 2 } });
  assert.deepEqual(R.valider(p, 'A', A), []);
  const { partie: q, journal } = R.resoudreTour(p, { A, B, C: dec() });
  assert.equal(journal.A.registre.juste, true, JSON.stringify(journal.A.registre.cases.filter((c) => !c.juste)));
  assert.equal(q.etat.A.bois, 80);                            // 2 charrettes de 20 déchargées
  assert.deepEqual(q.etat.A.quai.map((c) => c.q), [5]);       // la 3e attend
  assert.equal(q.etat.A.grain, 157);                          // 80 + 133 − 50 = 163, 13 de trop → −6
  assert.equal(q.etat.A.deniers, 300 - 141 + 22);
  // B n'a écrit que 2 charrettes : 40 chargés, payés 135 + 4, les 5 derniers arrivent au tour suivant.
  const casesB = Object.fromEntries(journal.B.registre.cases.map((c) => [c.cle, c]));
  assert.equal(casesB['achat0.charrettes'].juste, false);
  assert.equal(q.etat.B.deniers, 300 - 139 + 22);
  assert.deepEqual(q.etat.B.resteMarche, [{ m: 'bois', q: 5 }]);
  const { partie: r } = R.resoudreTour(q, { A: dec(), B: dec({ equipes: { champ: 3, dech: 1 } }), C: dec() });
  assert.equal(r.etat.B.bois, 83);                            // 85 + 20 pierre = 105 > 100 : moitié des 5 perdue
  assert.equal(r.etat.B.deniers, 300 - 139 + 22 - 2 + 24);    // transport du reste payé à sa livraison (120 hab.)
});

test('livraison avec écart : réserve juste = manquant relivré', () => {
  for (const reserve of [true, false]) {
    let p = partie(['A', 'B', 'C'], 2, 2);
    const A = dec({ achats: [{ m: 'pierre', q: 40, charrettes: 2 }], equipes: { champ: 3, dech: 2 }, reserve,
      registre: { achats: [{ recu: 30 }] } });
    const res = R.resoudreTour(p, { A, B: dec(), C: dec() });
    const cas = res.journal.A.registre.cases.find((c) => c.cle === 'achat0.recu');
    assert.equal(cas.attendu, 30);
    assert.equal(cas.juste, true);
    assert.equal(res.journal.A.registre.cases.find((c) => c.cle === 'reserve').juste, reserve);
    assert.equal(res.partie.etat.A.pierre, 50);
    p = res.partie;
    const { partie: q } = R.resoudreTour(p, { A: dec({ equipes: { dech: 1 } }), B: dec(), C: dec() });
    assert.equal(q.etat.A.pierre, reserve ? 60 : 50);
    // Une seule fois par ville.
    assert.equal(R.achatEnEcart(q.etat.A, [{ m: 'bois', q: 40 }], 2, 2), -1);
  }
});

test('famine : habitants partis, chantier arrêté puis achevé', () => {
  const p = partie(['A', 'B', 'C'], 4);
  p.etat.A.grain = 0;
  const A = dec({ chantiers: ['quartier'] });
  const { partie: q, journal } = R.resoudreTour(p, { A, B: dec(), C: dec() });
  assert.deepEqual(journal.A.famine, { manque: 50, partis: 33 });
  assert.equal(q.etat.A.hab, 67);
  assert.equal(q.etat.A.rep, 0);
  assert.equal(q.etat.A.deniers, 300 - 40 + 13);
  assert.deepEqual(q.etat.A.enCours, ['quartier']);
  assert.equal(q.etat.A.bats.quartier, undefined);
  q.etat.A.grain = 100;
  const { partie: r, journal: j2 } = R.resoudreTour(q, { A: dec(), B: dec(), C: dec() });
  assert.deepEqual(j2.A.acheves, ['quartier']);
  assert.equal(r.etat.A.log, 160);
});

test('coups de main : tour gardée, tour non gardée, impôt', () => {
  const p = partie(['A', 'B', 'C'], 4);
  p.etat.B.bats.guet = 1;
  const D = {
    A: dec({ coup: { cible: 'B', butin: 'pierre' } }),
    B: dec({ equipes: { guet: 1 } }),
    C: dec({ coup: { cible: 'A', butin: 'impot' } }),
  };
  assert.deepEqual(R.valider(p, 'A', D.A), []);
  assert.equal(R.attendus(p, 'A', D.A).caisse, 280);          // les 20 deniers du coup sortent au dépôt
  assert.equal(R.attendus(p, 'B', D.B).caisse, 290);          // la solde du guet aussi
  const { partie: q, journal } = R.resoudreTour(p, D);
  assert.equal(q.etat.A.rep, 8);                              // pris : −2
  assert.equal(q.etat.B.pierre, 20);
  assert.equal(q.etat.B.deniers, 300 - 10 + 22);              // solde du guet
  assert.equal(q.etat.A.deniers, 300 - 20);                   // 20 du coup, impôt volé
  assert.equal(q.etat.C.deniers, 300 - 20 + 22 + 22);
  assert.equal(journal.A.coup.pris, true);
  assert.equal(journal.C.coup.q, 22);
  // Tour non gardée : la pierre part, le butin arrive au quai du voleur.
  const p2 = partie(['A', 'B', 'C'], 4);
  p2.etat.B.bats.guet = 1;
  const { partie: r } = R.resoudreTour(p2, { A: dec({ coup: { cible: 'B', butin: 'pierre' } }), B: dec(), C: dec() });
  assert.equal(r.etat.B.pierre, 10);
  assert.deepEqual(r.etat.A.quai.map((c) => [c.m, c.q, c.origine]), [['pierre', 10, 'butin']]);
  assert.equal(r.etat.A.pierre, 20);
});

test('taxe sur les ventes et péage de la Chancellerie', () => {
  const p = partie(['A', 'B', 'C'], 4);
  p.etat.A.bats.chancellerie = 1;
  const D = {
    A: dec({ ventes: [{ m: 'bois', q: 20, charrettes: 1 }] }),             // ses propres charrettes ne comptent pas
    B: dec({ ventes: [{ m: 'bois', q: 40, charrettes: 2 }] }),
    C: dec({ achats: [{ m: 'grain', q: 20, charrettes: 1 }] }),
  };
  const { partie: q, journal } = R.resoudreTour(p, D);
  assert.equal(journal.B.taxe, 12);
  assert.equal(q.etat.B.deniers, 300 + 116 + 22 - 12);
  assert.equal(journal.A.peage, 9);
  assert.equal(q.etat.A.deniers, 300 + 58 + 22 - 6 + 9);
  assert.equal(q.etat.C.deniers, 300 - 122 + 22);
});

test('foire : le drap se vend 16, caisse du registre au prix normal', () => {
  const p = partie(['A', 'B', 'C'], 4);
  p.etat.A.drap = 20;
  const A = dec({ ventes: [{ m: 'drap', q: 20, charrettes: 1 }] });
  assert.equal(R.attendus(p, 'A', A).caisse, 300 + 240 - 2);
  const { partie: q, journal } = R.resoudreTour(p, { A, B: dec(), C: dec() }, { carte: 'foire' });
  assert.equal(journal.A.taxe, 32);
  assert.equal(q.etat.A.deniers, 300 + 318 + 22 - 32);
});

test('cartes ciblées : incendie, route coupée, commande', () => {
  const p = partie(['A', 'B', 'C'], 4);
  const { partie: q } = R.resoudreTour(p, { A: dec(), B: dec(), C: dec() }, { carte: 'incendie', cible: 'B' });
  assert.equal(q.etat.B.bois, 10);
  assert.equal(q.etat.A.bois, 40);
  const pg = partie(['A', 'B', 'C'], 4);
  pg.etat.B.bats.guet = 1;
  const { partie: qg } = R.resoudreTour(pg, { A: dec(), B: dec({ equipes: { guet: 1 } }), C: dec() }, { carte: 'incendie', cible: 'B' });
  assert.equal(qg.etat.B.bois, 40);                           // tour gardée : rien ne brûle
  const A = dec({ achats: [{ m: 'bois', q: 20, charrettes: 1 }, { m: 'grain', q: 20, charrettes: 1 }], equipes: { dech: 2 } });
  const { partie: r } = R.resoudreTour(p, { A, B: dec(), C: dec() }, { carte: 'route_coupee', cible: 'A' });
  assert.equal(r.etat.A.bois, 40);
  assert.equal(r.etat.A.quai.length, 1);
  assert.equal(r.etat.A.grain, 80 + 20 - 50);
  p.etat.C.bats.atelier = 1;
  const { partie: s } = R.resoudreTour(p, { A: dec(), B: dec(), C: dec({ equipes: { atelier: 1 } }) }, { carte: 'commande', cible: 'C' });
  assert.equal(s.etat.C.deniers, 300 + 40 + 22);
  assert.equal(s.etat.C.drap, 8);
});

test('ville en sommeil : rien ne bouge, un vol contre elle échoue', () => {
  const p = partie(['A', 'B', 'C'], 4);
  const { partie: q, journal } = R.resoudreTour(p, { A: dec({ coup: { cible: 'B', butin: 'grain' } }), B: 'sommeil', C: null });
  assert.deepEqual(q.etat.B, p.etat.B);
  assert.equal(journal.A.evenements[0].type, 'coup-sans-cible');
  assert.equal(q.etat.A.deniers, 300 - 20 + 22);
  // Sans dépôt (printemps) : équipes placées d'office, la ville consomme ; rien aux champs au printemps.
  assert.equal(journal.C.sansDepot, true);
  assert.equal(q.etat.C.grain, 30);
  assert.equal(q.etat.C.bois, 60);                            // le bûcheron a travaillé
});

test('validation avant dépôt', () => {
  const p = partie(['A', 'B', 'C'], 3);
  const err = (d) => R.valider(p, 'A', dec(d));
  assert.match(err({ chantiers: ['nef'] }).join(), /chœur/);
  assert.match(err({ chantiers: ['chancellerie'] }).join(), /tour 4/);
  assert.match(err({ coup: { cible: 'B', butin: 'bois' } }).join(), /avant le tour 4/);
  assert.match(err({ chantiers: ['guet', 'guet'] }).join(), /une seule/);
  assert.match(err({ chantiers: ['champ', 'champ', 'carriere', 'bucheron', 'bucheron'] }).join(), /5 actions/);
  assert.match(err({ chantiers: ['grenier', 'atelier'] }).join(), /bois/);
  assert.match(err({ equipes: { champ: 11 } }).join(), /11 équipes/);
  assert.match(err({ ventes: [{ m: 'drap', q: 10, charrettes: 1 }] }).join(), /drap/);
  assert.match(err({ achats: [{ m: 'pierre', q: 100, charrettes: 5 }] }).join(), /caisse/);
  assert.deepEqual(err({ chantiers: ['champ', 'carriere'], equipes: { carriere: 0 } }), []);  // plusieurs bâtiments, 1 PA chacun
  p.etat.A.bats.choeur = 1;
  assert.deepEqual(err({ chantiers: ['nef'] }), []);
});

test('notes : 3 villes, 4 villes, égalité, plafond', () => {
  const n3 = R.notes({ A: 175, B: 140, C: 100 });
  assert.deepEqual([n3.A.note, n3.B.note, n3.C.note], [20, 15.2, 10]);
  const n4 = R.notes({ A: 4, B: 3, C: 2, D: 1 });
  assert.deepEqual([n4.A.classement, n4.B.classement, n4.C.classement, n4.D.classement], [6, 4.5, 3.5, 2]);
  const n5 = R.notes({ A: 5, B: 4, C: 3, D: 2, E: 1 });
  assert.deepEqual(Object.values(n5).map((x) => x.classement), [6, 5, 4, 3, 2]);
  const eg = R.notes({ A: 100, B: 100, C: 50 });
  assert.deepEqual([eg.A.classement, eg.B.classement, eg.C.rang], [6, 6, 3]);
  assert.equal(R.notes({ A: 400, B: 1 }).A.surQuatorze, 14);
});

test('partie : tour d’essai remis à zéro, cartes, hasard rejouable, état d’origine intact', () => {
  const p = R.nouvellePartie({ villes: ['A', 'B', 'C'], graine: 42 });
  Object.values(p.ecart).forEach((t) => assert.ok(t >= 2 && t <= 5));
  assert.deepEqual(R.nouvellePartie({ villes: ['A', 'B', 'C'], graine: 42 }), p);
  assert.deepEqual(R.tirerCarte(p), { carte: null, cible: null });
  const avant = structuredClone(p);
  const { partie: q } = R.resoudreTour(p, { A: dec({ equipes: { champ: 9 } }), B: dec(), C: dec() });
  assert.deepEqual(p, avant);                                 // la résolution ne touche pas l'état reçu
  const z = R.remettreAZero(q);
  assert.equal(z.tour, 1);
  assert.deepEqual(z.etat.A, R.villeDeDepart());
  z.tour = 2;
  const c = R.tirerCarte(z, () => 0);
  assert.equal(c.carte, z.paquet[0]);
  assert.equal(c.cible === 'A', R.CARTES[c.carte].cible);
});

test('équilibre : la ville honnête de la v15 retrouve ses repères (165 points, famine 6 %)', () => {
  // Même stratégie que le simulateur de référence ; une partie tracée tour par tour donne les mêmes chiffres.
  const x = experience(300, 3);
  assert.ok(x.score > 160 && x.score < 170, `score ${x.score}`);
  assert.ok(x.famine < 0.12, `famine ${x.famine}`);
});
