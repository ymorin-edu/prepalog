// Spartoo — l'univers de l'exercice 1 : vente de chaussures en ligne.
//
// Données reprises à l'identique de LogiSim (org « p42 ») : fournisseurs, modèles, clients,
// stocks fixés et messages de départ. Extraites par script depuis logisim/index.html plutôt
// que recopiées, pour qu'aucune valeur ne dérive.

import { buildCatalog, pad, rng } from './entreprise-commun.js';

export const VOCAB = {
  unit: 'paire', unitPl: 'paires',
  sizeLabel: 'Taille', sizeShort: 'T.',
  configWord: 'taille', icone: 'chaussure',
  mailDomain: 'spartoo.example',
};

const SUPPLIERS_P42=[
 {id:'F001',brand:'Nike',name:'Nike France, B2B',adr:'Zone d\'activités Paris Nord 2',cp:'95700',ville:'Roissy-en-France',contact:'Julien Marchetti',tel:'01 48 17 20 10',email:'commandes@nike-pro.example',delai:3,franco:1500,pay:'45 jours fin de mois',moq:24},
 {id:'F002',brand:'adidas',name:'adidas France, B2B',adr:'4 rue de l\'Industrie',cp:'67870',ville:'Landersheim',contact:'Sabine Kessler',tel:'03 88 59 40 22',email:'partenaires@adidas-pro.example',delai:4,franco:1200,pay:'60 jours net',moq:20},
 {id:'F003',brand:'Puma',name:'Puma France, B2B',adr:'18 avenue du Rhin',cp:'67000',ville:'Strasbourg',contact:'Marc Oberlé',tel:'03 88 22 71 05',email:'b2b@puma-pro.example',delai:4,franco:1000,pay:'45 jours net',moq:20},
 {id:'F004',brand:'New Balance',name:'New Balance France, B2B',adr:'9 rue des Frères Lumière',cp:'69800',ville:'Saint-Priest',contact:'Élise Fontaine',tel:'04 72 23 18 40',email:'commandes@newbalance-pro.example',delai:5,franco:1500,pay:'30 jours fin de mois',moq:24},
 {id:'F005',brand:'Converse',name:'Converse Europe, B2B',adr:'Tour Ariane, 5 place de la Pyramide',cp:'92800',ville:'Puteaux',contact:'Damien Roche',tel:'01 41 02 36 90',email:'orders@converse-pro.example',delai:6,franco:800,pay:'30 jours net',moq:16},
 {id:'F006',brand:'Vans',name:'Vans Europe, B2B',adr:'Parc logistique de la Haute Borne',cp:'59650',ville:'Villeneuve-d\'Ascq',contact:'Lucie Vandenberghe',tel:'03 20 61 44 18',email:'dealers@vans-pro.example',delai:5,franco:800,pay:'45 jours fin de mois',moq:16},
 {id:'F007',brand:'ASICS',name:'ASICS France, B2B',adr:'2 quai du Point du Jour',cp:'92100',ville:'Boulogne-Billancourt',contact:'Karim Benali',tel:'01 55 20 63 27',email:'pro@asics-pro.example',delai:4,franco:1000,pay:'30 jours fin de mois',moq:20},
 {id:'F008',brand:'Reebok',name:'Reebok France, B2B',adr:'27 rue du Berthelot',cp:'69200',ville:'Vénissieux',contact:'Nadia Perrin',tel:'04 78 70 52 11',email:'distri@reebok-pro.example',delai:5,franco:700,pay:'45 jours net',moq:16},
 {id:'F009',brand:'Skechers',name:'Skechers France, B2B',adr:'Parc d\'affaires du Val d\'Europe',cp:'77700',ville:'Chessy',contact:'Thomas Vidal',tel:'01 60 43 88 02',email:'commercial@skechers-pro.example',delai:3,franco:600,pay:'30 jours net',moq:12},
 {id:'F010',brand:'Timberland',name:'Timberland Europe, B2B',adr:'11 rue de la Plaine',cp:'69680',ville:'Chassieu',contact:'Aurélie Gomez',tel:'04 72 79 30 66',email:'retailers@timberland-pro.example',delai:6,franco:1000,pay:'60 jours fin de mois',moq:24}
];

const MODELS_RAW_P42=[
 ['NK-AM270','Nike','Air Max 270','Lifestyle',149.99,72,['NR','BL','GR'],[39,46],'F001','Semelle Air visible au talon, tige en mesh respirant. Un classique du quotidien.'],
 ['NK-PEG40','Nike','Pegasus 40','Running',129.99,62,['NR','BL','MA'],[39,46],'F001','Chaussure de running polyvalente, amorti réactif pour les sorties régulières.'],
 ['NK-AF1','Nike','Air Force 1 \'07','Lifestyle',119.99,58,['BL','NR'],[39,46],'F001','Basket en cuir à semelle épaisse, coupe basse.'],
 ['AD-SST','adidas','Superstar','Lifestyle',109.99,52,['BL','NR','RS'],[38,46],'F002','Basket en cuir à coquille caoutchouc, trois bandes contrastées.'],
 ['AD-STS','adidas','Stan Smith','Lifestyle',109.99,52,['BL','VE','MA'],[39,46],'F002','Tennis en cuir lisse, languette et talon colorés.'],
 ['AD-UBL','adidas','Ultraboost Light','Running',189.99,92,['NR','BL','GR'],[39,46],'F002','Running haut de gamme, semelle Boost allégée, maintien Primeknit.'],
 ['AD-GAZ','adidas','Gazelle','Lifestyle',99.99,47,['MA','NR','RG'],[38,45],'F002','Modèle en daim, profil bas, semelle gomme.'],
 ['PM-SUE','Puma','Suede Classic XXI','Lifestyle',89.99,41,['NR','RG','MA'],[36,42],'F003','Basket en daim, coupe basse et bande latérale Formstrip.'],
 ['PM-RSX','Puma','RS-X','Lifestyle',129.99,60,['BL','GR'],[39,46],'F003','Silhouette massive, semelle RS pour un maintien souple.'],
 ['NB-574','New Balance','574','Lifestyle',99.99,48,['GR','MA','BE'],[39,46],'F004','Semelle ENCAP, daim et mesh. Le modèle le plus vendu de la marque.'],
 ['NB-1080','New Balance','Fresh Foam X 1080 v13','Running',179.99,88,['NR','BL'],[39,46],'F004','Running longue distance, mousse Fresh Foam X très amortissante.'],
 ['CV-CTAS','Converse','Chuck Taylor All Star Classic','Lifestyle',79.99,36,['NR','BL','RG'],[37,46],'F005','Toile montante, embout caoutchouc, œillets métal.'],
 ['CV-CT70','Converse','Chuck 70 High','Lifestyle',109.99,52,['NR','BE'],[37,46],'F005','Version premium en toile épaisse avec semelle intérieure rembourrée.'],
 ['VN-OLD','Vans','Old Skool','Skate',79.99,37,['NR','MA','RG'],[38,46],'F006','Basket de skate en toile et daim, bande latérale signature.'],
 ['VN-AUT','Vans','Authentic','Skate',69.99,32,['NR','BL','VE'],[38,46],'F006','Toile légère à lacets, semelle gaufrée.'],
 ['AS-KAY','ASICS','Gel-Kayano 30','Running',169.99,82,['NR','MA'],[39,46],'F007','Running stabilité, technologie GEL et tige tricotée.'],
 ['AS-NIM','ASICS','Gel-Nimbus 26','Running',179.99,86,['GR','NR'],[39,46],'F007','Running amorti maximal pour les longues distances.'],
 ['RB-CL','Reebok','Classic Leather','Lifestyle',89.99,42,['BL','NR','GR'],[39,46],'F008','Basket rétro en cuir souple, semelle EVA.'],
 ['SK-GW','Skechers','Go Walk Flex','Confort',74.99,34,['NR','GR','MA'],[37,46],'F009','Chaussure de marche légère à enfiler, semelle Goga Mat.'],
 ['TB-6IN','Timberland','6-Inch Premium Boot','Bottes',219.99,105,['BE','NR','MR'],[39,46],'F010','Botte en nubuck imperméable, coutures étanches.']
];

// Graine d'origine : ne pas la modifier, les stocks de départ en dépendent.
export const CATALOGUE = buildCatalog(MODELS_RAW_P42, 20260927);

// Stocks fixés à la main pour que l'exercice 1 tombe juste : une référence en rupture,
// une insuffisante, deux confortables.
CATALOGUE.VM['NK-AM270-NR-42'].qty0 = 8;
CATALOGUE.VM['AD-STS-BL-41'].qty0 = 1;
CATALOGUE.VM['PM-SUE-NR-40'].qty0 = 0;
CATALOGUE.VM['AD-STS-BL-44'].qty0 = 3;

const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function genCustomers() {
  var CUSTOMERS=[],CM={};
  var FN=['Camille','Lucas','Léa','Hugo','Emma','Nathan','Chloé','Louis','Manon','Théo','Inès','Enzo','Sarah','Maxime','Jade','Tom','Laura','Yanis','Clara','Antoine','Lina','Mathis','Zoé','Adam','Océane','Noah','Anaïs','Rayan','Élodie','Bastien','Margaux','Kylian'];
  var LN=['Martin','Bernard','Dubois','Thomas','Robert','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier','Morel','Girard','André','Mercier','Blanc','Guérin','Boyer','Garnier','Chevalier','François','Legrand','Faure','Perrot'];
  var ST=['rue des Lilas','avenue Jean Jaurès','rue Victor Hugo','boulevard Gambetta','rue de la République','allée des Tilleuls','rue Pasteur','chemin des Vignes','place du Marché','rue du Général Leclerc','impasse des Roses','rue Nationale'];
  var CT=[['Lyon','69003'],['Marseille','13008'],['Lille','59000'],['Nantes','44000'],['Bordeaux','33000'],['Toulouse','31000'],['Strasbourg','67000'],['Rennes','35000'],['Dijon','21000'],['Grenoble','38000'],['Montpellier','34000'],['Nice','06000'],['Tours','37000'],['Rouen','76000'],['Metz','57000'],['Angers','49000']];
  var r=rng(777);
  FN.forEach(function(fn,i){
    var ln=LN[(i*7+3)%LN.length],c=CT[(i*5+2)%CT.length];
    var tel='0'+(6+Math.floor(r()*2))+' '+pad(Math.floor(r()*100),2)+' '+pad(Math.floor(r()*100),2)+' '+pad(Math.floor(r()*100),2)+' '+pad(Math.floor(r()*100),2);
    var cu={id:'C'+pad(i+1,4),prenom:fn,nom:ln,email:norm(fn).replace(/ /g,'')+'.'+norm(ln).replace(/ /g,'')+'@mail.example',tel:tel,adr:(1+Math.floor(r()*98))+' '+ST[(i*3)%ST.length],cp:c[1],ville:c[0],since:new Date(2021+Math.floor(r()*5),Math.floor(r()*12),1+Math.floor(r()*27)).getTime(),nb:1+Math.floor(r()*9)};
    CUSTOMERS.push(cu);CM[cu.id]=cu;
  });
  return {CUSTOMERS:CUSTOMERS,CM:CM};
}

const _c = genCustomers();

export const SUPPLIERS = SUPPLIERS_P42;
export const CUSTOMERS = _c.CUSTOMERS;
export const CM = _c.CM;
export const SUP_BY_ID = (() => { const o = {}; SUPPLIERS_P42.forEach((s) => { o[s.id] = s; }); return o; })();

export const ENTREPRISE = {
  id: 'spartoo',
  nom: 'Spartoo',
  sousTitre: 'Vente de chaussures en ligne',
  exercice: "Exercice 1 : réception d'une commande et bon de préparation",
};

// La commande qui attend l'élève à l'ouverture, et les trois messages de départ.
export function baseDeDepart(prenom) {
  const now = Date.now();
  const stock = {};
  CATALOGUE.VARIANTS.forEach((v) => { stock[v.sku] = v.qty0; });

  const commande = {
    no: 'CMD-048213', date: now - 3600e3 * 3, customerId: 'C0007', ship: 'COL',
    lines: [
      { sku: 'NK-AM270-NR-42', qty: 1 },
      { sku: 'AD-STS-BL-41', qty: 2 },
      { sku: 'PM-SUE-NR-40', qty: 1 },
    ],
  };

  return {
    v: 1, created: now, stock, moves: [], mails: [], orders: [], seq: 1,
    customers: [], suppliers: [],
    _depart: [
      { folder: 'in', ts: now - 3600e3 * 26, from: 'M. Morin, responsable logistique',
        fromMail: 'direction@spartoo.example', to: prenom,
        subject: 'Bienvenue chez Spartoo : votre mission', kind: 'text',
        text: `Bonjour ${prenom},\n\nVous rejoignez l'équipe logistique de Spartoo, boutique de chaussures en ligne. Chaque commande client arrive par mail dans cette messagerie.\n\nPour chaque commande, vous devez :\n1. l'enregistrer,\n2. contrôler le stock de chaque ligne,\n3. éditer le bon de préparation,\n4. valider la préparation pour sortir les articles du stock.\n\nLa console (menu Console) vous permet d'interroger la base avec des commandes comme .getstock REF. Tapez .help pour les voir toutes.\n\nBon courage,\nM. Morin` },
      { folder: 'in', ts: now - 3600e3 * 5, from: 'Léa Dubois',
        fromMail: 'lea.dubois@mail.example', to: prenom,
        subject: 'Question sur les Stan Smith blanches', kind: 'text',
        text: `Bonjour,\n\nJe cherche des Stan Smith blanches en pointure 44. Est-ce que vous en avez en stock actuellement ? Combien de paires ?\n\nMerci d'avance,\nLéa` },
      { folder: 'in', ts: commande.date, from: 'Site web Spartoo',
        fromMail: 'no-reply@spartoo.example', to: prenom,
        subject: 'Nouvelle commande web n° ' + commande.no, kind: 'order', order: commande },
    ],
  };
}

/* ============================ Suivi de l'exercice ============================
 * Trois jalons, repris de LogiSim. Chacun sait lire la base d'un élève et dire si le
 * travail attendu est fait. Aucune vérification n'est proposée à l'élève pendant
 * l'exercice : il travaille, et c'est l'enseignant qui voit le résultat dans le suivi.
 *
 *   ok      le travail est fait et juste
 *   ko      il est fait mais à corriger
 *   attente il est commencé, la réponse manque
 *   na      l'élève n'en est pas encore là
 */

const stockDe = (db, sku) => (db.stock && db.stock[sku] != null ? db.stock[sku] : 0);
const nrm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const nrmLoc = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');
const RE_SKU = /\b([A-Z]{2,3}-[A-Z0-9]+-[A-Z]{2}-\d{1,2})\b[^0-9]{0,20}?(\d{1,4})/g;

function refsQtes(texte, supId, VM) {
  const out = []; let m; RE_SKU.lastIndex = 0;
  while ((m = RE_SKU.exec(texte))) {
    const sku = m[1].toUpperCase(), qty = parseInt(m[2], 10), v = VM[sku];
    if (v && v.model.sup === supId) out.push({ sku, qty, v });
  }
  return out;
}

export const ETAPES = [
  {
    id: 'lea',
    titre: 'Réponse à Léa Dubois (stock Stan Smith blanches, T.44)',
    verifier(db) {
      const q = (db.mails || []).find((m) => m.folder === 'in' && /dubois/i.test(m.from || '') && /stan smith/i.test(m.subject || ''));
      if (!q) return { status: 'na' };
      const reps = (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.to) === nrm(q.from)
        && nrm(m.subject).includes(nrm(q.subject))).sort((a, b) => a.ts - b.ts);
      if (!reps.length) return { status: 'attente' };
      const rep = reps[reps.length - 1], reel = stockDe(db, 'AD-STS-BL-44');
      // Le stock réel doit apparaître en chiffres dans la réponse : c'est ce qu'on demande
      // explicitement à l'élève dans la trame.
      const ok = new RegExp(`\\b${reel}\\b`).test(rep.text || '');
      return { status: ok ? 'ok' : 'ko', detail: rep.text || '', ts: rep.ts };
    },
  },
  {
    id: 'commande',
    titre: 'Commande CMD-048213 préparée et validée',
    verifier(db, U) {
      const VM = U.CATALOGUE.VM;
      const o = (db.orders || []).find((x) => x.no === 'CMD-048213');
      if (!o) return { status: 'na' };
      if (!o.prep || !o.prep.validated) return { status: 'attente' };
      // Le stock réel au moment de la préparation se reconstitue : stock actuel + sortie faite.
      const lignes = o.lines.map((l) => {
        const r = (o.prep.rows || {})[l.sku] || {};
        const qty = (r.qty === '' || r.qty == null) ? 0 : r.qty;
        const reel = stockDe(db, l.sku) + qty, v = VM[l.sku];
        const qteAttendue = Math.min(l.qty, reel);
        const statutAttendu = reel >= l.qty ? 'ok' : (reel === 0 ? 'crit' : 'warn');
        const ok = r.seen === reel && nrmLoc(r.loc) === nrmLoc(v.loc) && r.qty === qteAttendue && r.status === statutAttendu;
        return { sku: l.sku, ok, seen: r.seen, reel, loc: r.loc, locReel: v.loc, qty: r.qty, qteAttendue, statut: r.status, statutAttendu };
      });
      const tout = lignes.every((x) => x.ok);
      const detail = `Préparation validée le ${new Date(o.prep.at).toLocaleString('fr-FR')} — `
        + (o.prep.complete ? 'commande complète' : 'commande avec reliquat') + '.\n'
        + lignes.map((x) => `${x.sku} : ${x.ok ? 'correct' : 'à corriger'} — stock trouvé `
          + `${x.seen === '' ? '(vide)' : x.seen} (réel ${x.reel}), emplacement ${x.loc || '(vide)'} (réel ${x.locReel}), `
          + `à préparer ${x.qty === '' ? '(vide)' : x.qty} (attendu ${x.qteAttendue}), `
          + `statut ${x.statut || '(vide)'} (attendu ${x.statutAttendu})`).join('\n');
      return { status: tout ? 'ok' : 'ko', detail, ts: o.prep.at };
    },
  },
  {
    id: 'reappro',
    titre: 'Réapprovisionnement envoyé à Puma (PM-SUE-NR-40)',
    verifier(db, U) {
      const sup = U.SUP_BY_ID.F003, VM = U.CATALOGUE.VM;
      if (!sup) return { status: 'na' };
      const mails = (db.mails || []).filter((m) => m.folder === 'out' && nrm(m.toMail) === nrm(sup.email))
        .sort((a, b) => a.ts - b.ts);
      if (!mails.length) return { status: 'attente' };
      const juger = (msg) => {
        const trouves = refsQtes(msg.text || '', sup.id, VM);
        let total = 0, exact = true;
        trouves.forEach((x) => {
          total += x.qty;
          const courant = stockDe(db, x.sku);
          if (x.qty !== x.v.model.max - courant) exact = false;
        });
        const aSue = trouves.some((x) => x.sku === 'PM-SUE-NR-40');
        const moqOk = total >= (sup.moq || 0);
        const ok = trouves.length > 0 && aSue && exact && moqOk;
        const detail = `Message envoyé le ${new Date(msg.ts).toLocaleString('fr-FR')} à ${sup.brand} — `
          + `total ${total} paire${total > 1 ? 's' : ''} (minimum requis ${sup.moq}).\n`
          + (trouves.length
            ? trouves.map((x) => { const c = stockDe(db, x.sku), e = x.v.model.max - c;
                return `${x.sku} : ${x.qty} demandée(s) (stock actuel ${c}, maximum ${x.v.model.max}, attendu ${e})`
                  + (x.qty === e ? ' — correct' : ' — à corriger'); }).join('\n')
            : `Aucune référence ${sup.brand} avec une quantité claire n'a été reconnue.`)
          + (trouves.length && !aSue ? "\nLa référence PM-SUE-NR-40 n'apparaît pas dans ce message." : '');
        return { ok, detail, ts: msg.ts };
      };
      const evals = mails.map(juger);
      const best = evals.find((e) => e.ok) || evals[evals.length - 1];
      return { status: best.ok ? 'ok' : 'ko', detail: best.detail, ts: best.ts };
    },
  },
];
