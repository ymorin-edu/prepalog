// Les MOTS CLIQUABLES (2de, lot 3 du brief `docs/briefs/MOTEUR-2de-S1.md`, 04/10/2026).
//
// Un mot du métier, souligné dans un texte du contenu : un clic (ou Entrée) ouvre sa définition en une
// phrase dans une petite bulle, sans quitter l'écran ; Échap ou un second clic la ferment.
//
//   creerEntreprise({ …, lexique: { CACES: "Certificat qui prouve qu'on sait conduire un type d'engin.", … } })
//   et, dans n'importe quel texte du contenu : « Il a le [[CACES]] 3. » ou « Le camion est [[cale|calé]]. »
//   (avant la barre : le mot du lexique ; après : ce qui s'affiche).
//
// La recherche ignore majuscules et accents. Un mot absent du lexique s'affiche en texte normal, sans
// crochets ni erreur. Le moteur transforme les textes APRÈS leur affichage (il observe l'écran) : toutes
// les vues sont servies sans que chacune ait à le savoir. Rien n'est observé si le contenu ne déclare
// pas de lexique (alerte 13). Dans un bouton, un lien ou une liste, le mot reste du texte (pas de bouton
// dans un bouton).
//
// Chaque ouverture est comptée par séance et par mot : `db.reperage[idSeance].mots[mot]` (lot 6).

export const nrmMot = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const MARQUE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const SANS_BOUTON = 'button, a, label, select, option, textarea, input, script, style, .lex';

// Compte une aide ouverte (mot cliquable, bouton d'aide…) dans la base, cloisonnée par séance.
// `sorte` : 'mots' ou 'aides'. Rend la base modifiée (à sauver par l'appelant).
export function compterAide(db, seance, sorte, cle) {
  if (!db.reperage) db.reperage = {};
  const r = db.reperage[seance] || (db.reperage[seance] = {});
  const t = r[sorte] || (r[sorte] = {});
  t[cle] = (t[cle] || 0) + 1;
  return db;
}

// Branche le lexique sur `hote`. `ouvert(mot)` est appelé à chaque ouverture (pour compter).
// Rend une fonction qui débranche tout.
export function brancherLexique(hote, lexique, ouvert) {
  const index = {};
  Object.keys(lexique || {}).forEach((k) => { index[nrmMot(k)] = k; });
  if (!Object.keys(index).length) return () => {};
  let n = 0;

  function transformer(texte) {
    const v = texte.nodeValue;
    if (!v || v.indexOf('[[') < 0) return;
    const parent = texte.parentElement;
    if (!parent) return;
    const simple = !!parent.closest(SANS_BOUTON);
    const frag = document.createDocumentFragment();
    let dernier = 0;
    MARQUE.lastIndex = 0;
    let m;
    while ((m = MARQUE.exec(v))) {
      if (m.index > dernier) frag.appendChild(document.createTextNode(v.slice(dernier, m.index)));
      const cle = index[nrmMot(m[1])];
      const vu = (m[2] || m[1]).trim();
      if (!cle || simple) frag.appendChild(document.createTextNode(vu));
      else {
        const id = `lexBulle${++n}`;
        const w = document.createElement('span'); w.className = 'lex';
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'lex-mot'; b.textContent = vu;
        b.dataset.lex = cle; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', id);
        const bulle = document.createElement('span');
        bulle.className = 'lex-bulle'; bulle.id = id; bulle.hidden = true; bulle.setAttribute('role', 'note');
        const fort = document.createElement('b'); fort.textContent = cle;
        bulle.append(fort, document.createTextNode(' : ' + lexique[cle]));
        w.append(b, bulle);
        frag.appendChild(w);
      }
      dernier = m.index + m[0].length;
    }
    if (dernier < v.length) frag.appendChild(document.createTextNode(v.slice(dernier)));
    texte.replaceWith(frag);
  }

  function parcourir(racine) {
    if (racine.nodeType === 3) { transformer(racine); return; }
    if (racine.nodeType !== 1 || (racine.textContent || '').indexOf('[[') < 0) return;
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    const L = [];
    while (w.nextNode()) if (w.currentNode.nodeValue.indexOf('[[') >= 0) L.push(w.currentNode);
    L.forEach(transformer);
  }

  const fermer = (sauf) => hote.querySelectorAll('.lex-mot[aria-expanded="true"]').forEach((b) => {
    if (b === sauf) return;
    b.setAttribute('aria-expanded', 'false');
    const bu = b.nextElementSibling; if (bu) bu.hidden = true;
  });

  function clic(e) {
    const b = e.target.closest && e.target.closest('.lex-mot');
    // Un clic ailleurs, ou sur la bulle elle-même (elle peut couvrir le mot suivant), la ferme.
    if (!b || !hote.contains(b)) { fermer(); return; }
    e.preventDefault();
    const ouvrir = b.getAttribute('aria-expanded') !== 'true';
    fermer(b);
    b.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    const bu = b.nextElementSibling;
    bu.hidden = !ouvrir;
    if (!ouvrir) return;
    // Un mot près du bord droit : la bulle glisse vers la gauche pour rester entière à l'écran.
    bu.style.left = '0px';
    const deborde = bu.getBoundingClientRect().right - (document.documentElement.clientWidth - 8);
    if (deborde > 0) bu.style.left = `${-Math.min(deborde, b.getBoundingClientRect().left - 8)}px`;
    ouvert(b.dataset.lex);
  }
  function touche(e) {
    if (e.key !== 'Escape') return;
    const b = hote.querySelector('.lex-mot[aria-expanded="true"]');
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    fermer();
    b.focus();
  }

  const obs = new MutationObserver((muts) => muts.forEach((mu) => mu.addedNodes.forEach(parcourir)));
  obs.observe(hote, { childList: true, subtree: true });
  parcourir(hote);
  hote.addEventListener('click', clic);
  hote.addEventListener('keydown', touche, true);
  return () => { obs.disconnect(); hote.removeEventListener('click', clic); hote.removeEventListener('keydown', touche, true); };
}
