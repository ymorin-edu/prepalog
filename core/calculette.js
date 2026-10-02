// Calculette flottante, posée sur la page par l'activité qui la demande.
//
// Reprise de la Suite Logistique, où elle accompagnait les quiz de calcul. Deux raisons
// de la garder : les élèves n'ont pas toujours leur calculatrice, et surtout, aller
// chercher celle de Windows fait quitter la page — l'élève revient, le quiz a gardé sa
// place, mais l'attention est partie.
//
// Elle est volontairement réduite aux quatre opérations : ce qu'on évalue est le
// raisonnement, pas la virtuosité à la calculette. Virgule française à l'affichage.
//
// Un seul exemplaire vit dans la page. `monterCalculette()` l'installe ou la rallume,
// `demonterCalculette()` l'éteint — à appeler en quittant l'activité, sinon le bouton
// flotte encore sur l'écran suivant.

const ID = 'calculetteFlottante';

const etat = { affichage: '0', accumulateur: null, operation: null, enAttente: false };

function majAffichage() {
  const z = document.getElementById('calcEcran');
  if (z) z.textContent = etat.affichage.replace('.', ',');
}

function chiffre(d) {
  if (etat.enAttente) { etat.affichage = d; etat.enAttente = false; }
  else etat.affichage = etat.affichage === '0' ? d : etat.affichage + d;
  majAffichage();
}

function virgule() {
  if (etat.enAttente) { etat.affichage = '0.'; etat.enAttente = false; }
  else if (!etat.affichage.includes('.')) etat.affichage += '.';
  majAffichage();
}

function effacer() {
  etat.affichage = '0'; etat.accumulateur = null; etat.operation = null; etat.enAttente = false;
  majAffichage();
}

function signe() {
  etat.affichage = etat.affichage.startsWith('-') ? etat.affichage.slice(1) : '-' + etat.affichage;
  majAffichage();
}

function retour() {
  etat.affichage = etat.affichage.length > 1 ? etat.affichage.slice(0, -1) : '0';
  if (etat.affichage === '-') etat.affichage = '0';
  majAffichage();
}

function calculer(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  // Division par zéro : on ne renvoie ni Infinity ni NaN à l'écran d'un élève.
  if (op === '÷') return b === 0 ? null : a / b;
  return b;
}

function arrondir(n) {
  // Dix chiffres significatifs : assez pour tout calcul de logistique, et assez peu pour
  // que 0,1 + 0,2 affiche 0,3 et non 0,30000000000000004.
  return Number.parseFloat(n.toPrecision(10));
}

function operation(op) {
  const v = Number(etat.affichage);
  if (etat.accumulateur !== null && etat.operation && !etat.enAttente) {
    const r = calculer(etat.accumulateur, v, etat.operation);
    if (r === null) { etat.affichage = 'Division par 0'; etat.accumulateur = null; etat.operation = null; etat.enAttente = true; majAffichage(); return; }
    etat.accumulateur = arrondir(r);
    etat.affichage = String(etat.accumulateur);
  } else {
    etat.accumulateur = v;
  }
  etat.operation = op;
  etat.enAttente = true;
  majAffichage();
}

function egal() {
  if (etat.accumulateur === null || !etat.operation) return;
  const r = calculer(etat.accumulateur, Number(etat.affichage), etat.operation);
  if (r === null) { etat.affichage = 'Division par 0'; }
  else etat.affichage = String(arrondir(r));
  etat.accumulateur = null; etat.operation = null; etat.enAttente = true;
  majAffichage();
}

function brancher(racine) {
  // `calc-ouverte` sur <body> réserve de la place sous la page. La calculette flotte
  // au-dessus du contenu : sans ça, elle recouvre les deux choix de droite de la question
  // en cours sur un écran de portable, et l'élève ne peut plus ni lire ni cliquer la
  // réponse qu'il vient de calculer. Avec, il lui suffit de faire défiler.
  const basculer = (ouvrir) => {
    const p = racine.querySelector('#calcPanneau');
    p.classList.toggle('ouvert', ouvrir === undefined ? !p.classList.contains('ouvert') : ouvrir);
    document.body.classList.toggle('calc-ouverte', p.classList.contains('ouvert'));
  };
  racine.querySelector('#calcBascule').addEventListener('click', () => basculer());
  racine.querySelector('#calcFermer').addEventListener('click', () => basculer(false));
  racine.querySelectorAll('[data-calc]').forEach((b) => {
    b.addEventListener('click', () => {
      const a = b.dataset.calc;
      if (a === 'chiffre') chiffre(b.dataset.d);
      else if (a === 'virgule') virgule();
      else if (a === 'effacer') effacer();
      else if (a === 'signe') signe();
      else if (a === 'retour') retour();
      else if (a === 'op') operation(b.dataset.op);
      else if (a === 'egal') egal();
    });
  });
}

export function monterCalculette() {
  let el = document.getElementById(ID);
  if (el) { el.style.display = ''; majAffichage(); return el; }
  el = document.createElement('div');
  el.id = ID;
  el.innerHTML = `
    <button id="calcBascule" class="calc-fab" type="button" title="Calculette" aria-label="Ouvrir la calculette">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M7.5 7h9M8 12h2M11.5 12h1M15 12h1M8 16h2M11.5 16h1M15 16h1"/>
      </svg>
    </button>
    <div id="calcPanneau" class="calc-panneau" role="group" aria-label="Calculette">
      <div class="calc-tete"><span>Calculette</span>
        <button id="calcFermer" class="calc-fermer" type="button" aria-label="Fermer">✕</button></div>
      <div id="calcEcran" class="calc-ecran">${etat.affichage}</div>
      <div class="calc-touches">
        <button data-calc="effacer" class="calc-t calc-t-fn" type="button">C</button>
        <button data-calc="signe" class="calc-t calc-t-fn" type="button">±</button>
        <button data-calc="retour" class="calc-t calc-t-fn" type="button">⌫</button>
        <button data-calc="op" data-op="÷" class="calc-t calc-t-op" type="button">÷</button>
        <button data-calc="chiffre" data-d="7" class="calc-t" type="button">7</button>
        <button data-calc="chiffre" data-d="8" class="calc-t" type="button">8</button>
        <button data-calc="chiffre" data-d="9" class="calc-t" type="button">9</button>
        <button data-calc="op" data-op="×" class="calc-t calc-t-op" type="button">×</button>
        <button data-calc="chiffre" data-d="4" class="calc-t" type="button">4</button>
        <button data-calc="chiffre" data-d="5" class="calc-t" type="button">5</button>
        <button data-calc="chiffre" data-d="6" class="calc-t" type="button">6</button>
        <button data-calc="op" data-op="-" class="calc-t calc-t-op" type="button">−</button>
        <button data-calc="chiffre" data-d="1" class="calc-t" type="button">1</button>
        <button data-calc="chiffre" data-d="2" class="calc-t" type="button">2</button>
        <button data-calc="chiffre" data-d="3" class="calc-t" type="button">3</button>
        <button data-calc="op" data-op="+" class="calc-t calc-t-op" type="button">+</button>
        <button data-calc="chiffre" data-d="0" class="calc-t calc-t-zero" type="button">0</button>
        <button data-calc="virgule" class="calc-t" type="button">,</button>
        <button data-calc="egal" class="calc-t calc-t-egal" type="button">=</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  brancher(el);
  return el;
}

export function demonterCalculette() {
  const el = document.getElementById(ID);
  if (el) el.remove();
  document.body.classList.remove('calc-ouverte');
  effacer();
}
