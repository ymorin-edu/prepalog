// Suite de tests de Prepalog — les aides COMMUNES des blocs IKEA (`ikea-12.2` …). Créé le 26/10/2026 avec ENT-12.2, sur le modèle de
// `outils/test/mondial-relay/commun.mjs` et `outils/test/pelleau/commun.mjs` (sous-dossier exprès : le lanceur refuse tout `.mjs` posé
// directement dans `outils/test/` qui ne serait pas dans `BLOCS`). Reprend `ouvrirPelleau` (montage de la séance dans une page à elle,
// vrais clics à la souris) et ajoute les aides propres aux séances IKEA.

export { proche } from '../pelleau/commun.mjs';
import { ouvrirPelleau } from '../pelleau/commun.mjs';

export async function ouvrirIkea({ nav, BASE, vrai, activite, id }) {
  const P = await ouvrirPelleau({ nav, BASE, vrai, activite, id });
  const { pg, Z, pause, present, texte, clic, aller } = P;
  const sansToast = () => pg.waitForFunction(() => { const t = document.getElementById('toast'); return !t || getComputedStyle(t).display === 'none'; }, null, { timeout: 8000 });
  const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
  const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
  // La note : `noter(db)` pour une évaluation (copie rendue) ; pour un guidage, le dernier résultat remonté au Suivi par le moteur.
  const noter = (activite) => pg.evaluate(async (A) => { const M = await import(A);
    if (typeof M.noter === 'function') return M.noter(window.__f.db);
    const L = window.__f.enregistres; return L.length ? L[L.length - 1] : { score: 0, max: 20, detail: {} }; }, activite);
  // Le courriel par phrases : ouvre le message `objet`, « Répondre », choisit chaque ligne (`lignes` = { ligne: texte }), envoie.
  async function phrases(objet, lignes) {
    await allerV('mail');
    await pg.click(`${Z} [data-dossier="in"]`);
    await pg.click(`${Z} .ent-obj:text-is("${objet}")`);
    await pause();
    await pg.click(`${Z} [data-repondre]`);
    await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
    for (const [l, t] of Object.entries(lignes)) if (t) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
    await sansToast(); await pg.click(`${Z} #formPhr button[type="submit"]`);
    await confirmer();
  }
  // Un appel : `suite` = pour chaque réplique, la clé dite, ou une liste de clés (les maladroites d'abord, la dernière fait avancer en guidage).
  async function appel(did, suite) {
    await allerV('telephone');
    await clic(`[data-dlg-appeler="${did}"]`); await pause();
    for (const x of suite) for (const c of [].concat(x)) { await clic(`[data-dlg-choix="${c}"]`); await pause(); }
    for (let i = 0; i < 4; i++) {
      await sansToast(); await clic('[data-dlg-raccrocher]'); await pause(150);
      if ((await texte()).includes('Appel terminé')) break;
    }
  }
  return { ...P, sansToast, allerV, confirmer, noter, phrases, appel };
}
