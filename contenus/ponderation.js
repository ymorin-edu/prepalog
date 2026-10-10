// Poids et blocs posés sur des jalons déjà fabriqués (règle du 10/10/2026, `docs/briefs/NOTATION-ponderation.md`) :
// la vue quai (`etapesQuai`) et les séances dont les jalons sont écrits ailleurs n'ont ni `poids` ni `groupe`.
//
// `bareme` = { idDuJalon: [poids, 'Bloc (la ligne du bandeau de fin)'] } ; le bloc est facultatif (`[poids]` : le jalon fait sa
// propre ligne, avec son titre). Le tableau doit nommer TOUS les jalons et rien
// d'autre, et peser 20 : sinon la séance refuse de se charger (un oubli ne doit jamais passer pour un jalon à 1 point).
export function ponderer(etapes, bareme, quelle = 'séance') {
  const ids = etapes.map((e) => e.id);
  const sans = ids.filter((id) => !bareme[id]);
  const inconnus = Object.keys(bareme).filter((id) => !ids.includes(id));
  if (sans.length || inconnus.length) {
    throw new Error(`${quelle} : barème et jalons ne concordent pas (sans poids : ${sans.join(', ') || 'aucun'} ; poids sans jalon : ${inconnus.join(', ') || 'aucun'}).`);
  }
  const total = Math.round(ids.reduce((t, id) => t + bareme[id][0], 0) * 1e6) / 1e6;
  if (total !== 20) throw new Error(`${quelle} : les poids valent ${total} au lieu de 20.`);
  return etapes.map((e) => ({ ...e, ...(bareme[e.id][1] ? { groupe: bareme[e.id][1] } : {}), poids: bareme[e.id][0] }));
}
