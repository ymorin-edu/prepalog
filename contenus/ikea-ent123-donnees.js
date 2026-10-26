// ENT-12.3 — IKEA, « la Seine est en crue » : les DONNÉES PURES (brief `docs/briefs/ENT-12.3-ikea-seine-en-crue.md` ; choix de Tristan du 26/10/2026).
// Importé par le contenu (`contenus/ikea-ent123.js`), les questions, le corrigé et les tests. Univers : `contenus/ikea.js`.
//
// LE JOUR : jeudi 11 mars 2027. D'ordinaire, les livraisons dans Paris partent par la péniche (Gennevilliers → Bercy) puis en utilitaires électriques. La Seine monte
// (CONSTRUIT : 4,45 m à l'échelle du pont d'Austerlitz, juste au-dessus du seuil réel de 4,30 m) : la péniche ne part pas, les dix commandes du jour passent en camion.
// LES COMMANDES, LES CAMIONS, LES CRÉNEAUX : CONSTRUITS (clients fictifs, noms de famille seuls). Deux commandes ne peuvent PAS tenir leur créneau (le bloc « trajet + livraison » est plus
// long que le créneau promis) : Mme Roux et M. Haddad ; les huit autres peuvent toutes tenir (cherché par calcul : `maxTenues()` rend 8, avec ce seul ensemble). Le planning est le même
// pour tous les élèves (entraînement : décision de Tristan du 21/10/2026, planning fixe) ; l'évaluation ENT-12.7 tire le sien.

export const ID = 'ikea-seine-en-crue';
export const ID_VOLET = 'ik-ent123';
export const PL = 'ik-planning-123';
export const FICHE_PREVENIR = 'prevenir-123';
export const PHRASES_ROUX = 'reponse-roux-123';
export const MAIL_ROUX = 'camille.roux@mail.example';
export const JOUR = { iso: '2027-03-11', lib: 'jeudi 11 mars 2027', lendemain: 'vendredi 12 mars 2027' };
export const COTE = { jour: '4,45 m', seuil: '4,30 m' };

// ─────────────────────────────────────────────────────────────── l'échelle : 08:00 → 20:00, un créneau tous les 15 minutes
export const DEBUT = 8 * 60, PAS = 15, NB = 48;
export const minutes = (hm) => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
export const slotDe = (hm) => Math.round((minutes(hm) - DEBUT) / PAS);
export const heureDe = (slot) => { const m = DEBUT + slot * PAS; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
export const hlib = (hm) => { const [h, m] = hm.split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; };

// ─────────────────────────────────────────────────────────────── les trois camions de Gennevilliers (capacité : tout ce que le camion porte pour la journée, chargé le matin)
export const CAMIONS = [
  { id: 'c1', nom: 'Camion 1', cap: 1600, note: '1 600 kg' },
  { id: 'c2', nom: 'Camion 2', cap: 1600, note: '1 600 kg' },
  { id: 'c3', nom: 'Camion 3 (plus petit)', cap: 1000, note: '1 000 kg' },
];
export const CAMIONS_IDS = CAMIONS.map((c) => c.id);

// ─────────────────────────────────────────────────────────────── les dix commandes du jour (des/avant = le créneau promis ; dur = trajet + livraison, en minutes)
export const COMMANDES = [
  { id: 'roux', client: 'Mme Roux', quartier: 'Paris 20e', des: '08:00', avant: '10:00', dur: 135, kg: 420, km: 28, meuble: 'une armoire' },
  { id: 'haddad', client: 'M. Haddad', quartier: 'Paris 19e', des: '09:00', avant: '11:00', dur: 135, kg: 350, km: 26, meuble: 'un canapé' },
  { id: 'diallo', client: 'M. Diallo', quartier: 'Paris 14e', des: '14:00', avant: '16:00', dur: 60, kg: 380, km: 22, meuble: 'une bibliothèque' },
  { id: 'martin', client: 'Mme Martin', quartier: 'Paris 15e', des: '08:00', avant: '12:00', dur: 75, kg: 520, km: 24, meuble: 'un lit' },
  { id: 'nguyen', client: 'M. Nguyen', quartier: 'Paris 13e', des: '09:00', avant: '12:00', dur: 90, kg: 610, km: 30, meuble: 'un canapé' },
  { id: 'lefevre', client: 'Mme Lefèvre', quartier: 'Colombes', des: '08:00', avant: '12:00', dur: 60, kg: 240, km: 12, meuble: 'une commode' },
  { id: 'morel', client: 'M. Morel', quartier: 'Paris 17e', des: '10:00', avant: '13:00', dur: 90, kg: 700, km: 20, meuble: 'une armoire' },
  { id: 'garcia', client: 'Mme Garcia', quartier: 'Paris 11e', des: '13:00', avant: '17:00', dur: 90, kg: 450, km: 26, meuble: 'un lit' },
  { id: 'perrin', client: 'M. Perrin', quartier: 'Paris 16e', des: '14:00', avant: '16:00', dur: 75, kg: 300, km: 24, meuble: 'un bureau' },
  { id: 'costa', client: 'Mme Costa', quartier: 'Paris 18e', des: '14:00', avant: '17:00', dur: 90, kg: 520, km: 22, meuble: 'une armoire' },
];
export const IMPOSSIBLES = ['roux', 'haddad'];
export const parId = Object.fromEntries(COMMANDES.map((c) => [c.id, c]));
export const KM_TOTAL = COMMANDES.reduce((s, c) => s + c.km, 0);
export const KM_SANS_REPORTEES = COMMANDES.filter((c) => !IMPOSSIBLES.includes(c.id)).reduce((s, c) => s + c.km, 0);
export const creneauLib = (c) => `de ${hlib(c.des)} à ${hlib(c.avant)}`;

// ─────────────────────────────────────────────────────────────── le jugement d'un planning (lu sur `{ carte: { r, s } }`, `s` = créneau de début)
const longueur = (c) => Math.ceil(c.dur / PAS);
// Une livraison sur un camion est dans son créneau si le bloc « trajet + livraison » tient entre `des` et `avant`.
export const dansCreneau = (c, s) => s >= slotDe(c.des) && s + longueur(c) <= slotDe(c.avant);
// Les commandes non tenues d'un planning : reportées à demain, ou posées sur un camion hors de leur créneau, ou pas posées.
export function nonTenues(place, cmds = COMMANDES) {
  return cmds.filter((c) => {
    const p = place && place[c.id];
    if (!p || p.s == null) return true;
    if (p.r === 'demain') return true;
    return !dansCreneau(c, p.s);
  }).map((c) => c.id);
}
export const toutesPosees = (place, cmds = COMMANDES) => cmds.every((c) => place && place[c.id] && place[c.id].s != null && (CAMIONS_IDS.includes(place[c.id].r) || place[c.id].r === 'demain'));

// Un planning est-il tenable ? Cherche, par exploration, le plus grand nombre de commandes qu'on peut tenir dans leur créneau, sur 3 camions, sans dépasser la charge.
// (Le chargement du matin compte les commandes tenues ; les reportées ne partent pas.) Rend { max, ensembles } : `ensembles` = les ensembles de ce nombre.
export function maxTenues(cmds = COMMANDES, camions = CAMIONS) {
  const faisable = (S) => {
    const L = [...S].sort((a, b) => minutes(a.avant) - minutes(b.avant));
    const libre = camions.map(() => DEBUT), charge = camions.map(() => 0);
    const go = (i) => {
      if (i === L.length) return true;
      const o = L[i];
      for (let t = 0; t < camions.length; t++) {
        const st = Math.max(libre[t], minutes(o.des));
        if (st + o.dur > minutes(o.avant) || charge[t] + o.kg > camions[t].cap) continue;
        const f = libre[t], l = charge[t];
        libre[t] = st + o.dur; charge[t] += o.kg;
        if (go(i + 1)) return true;
        libre[t] = f; charge[t] = l;
      }
      return false;
    };
    return go(0);
  };
  let max = 0, ensembles = [];
  for (let m = 0; m < (1 << cmds.length); m++) {
    const S = cmds.filter((_, i) => (m >> i) & 1);
    if (S.length < max || !faisable(S)) continue;
    if (S.length > max) { max = S.length; ensembles = []; }
    ensembles.push(S.map((o) => o.id));
  }
  return { max, ensembles };
}

// ─────────────────────────────────────────────────────────────── lectures de la base de l'élève
export const planningEnvoye = (db, v = 2) => (db && db.plannings && db.plannings[PL] && db.plannings[PL][`v${v}`]) || null;
const fiche = (db, id) => (db && db.fiches && db.fiches[id]) || null;
export const envoyee = (db, id) => !!(fiche(db, id) && fiche(db, id).envoye);
export const valeursDe = (db, id) => (fiche(db, id) || {}).valeurs || {};
export const geste = (db, nom) => !!(db && db.gestes && db.gestes[ID] && db.gestes[ID][nom]);
export const dejaEnvoyee = (id) => (db) => envoyee(db, id) || geste(db, `fiche:${id}:envoyer`);
// Une condition vraie dès que l'un des gestes a eu lieu (les noms sont contrôlés par le moteur).
export function ouGeste(...noms) {
  const f = (db, seance) => !!(db && db.gestes && db.gestes[seance] && noms.some((n) => db.gestes[seance][n]));
  f.gestes = noms;
  return f;
}
