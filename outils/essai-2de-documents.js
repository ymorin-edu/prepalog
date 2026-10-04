// Les DOCUMENTS de la page d'essai de la 2de (brief `docs/briefs/MOTEUR-documents-formulaire.md`) —
// repris tels quels de la maquette validée par Tristan le 04/10/2026
// (`docs/briefs/smoby/maquette-documents-fiche.html`), sans le logo (la séance ENT-5.1 posera le sien).
// Personnes, adresses et parcours : CONSTRUITS (CV fictifs, mention en pied de chaque document).

// La mise en page propre à ces documents (`documentsStyle`) : le moteur l'imbrique sous `.ent-doc`.
// Le papier (fond, bordure, ombre) est celui du moteur : ces règles n'en posent pas.
export const STYLE_DOCUMENTS = `
--douce:#555047; --smoby:#006FA6;
.pied{margin:0; font-size:.72rem; color:var(--douce); border-top:1px solid var(--filet); padding:6px 22px; text-align:right}
.ligne{display:grid; grid-template-columns:96px 1fr; gap:8px; margin:5px 0; font-size:.9rem}
.ligne .quand{color:var(--douce); font-size:.84rem}
.ligne b{display:block}
.cv ul{margin:4px 0; padding-left:18px; font-size:.9rem}
.recherche{background:rgba(156,98,10,.08); border-left:3px solid var(--terre); padding:7px 10px; font-size:.88rem; margin-top:12px}
/* 1 : bandeau à gauche (Yanis) */
.cv1{display:grid; grid-template-columns:170px 1fr}
.cv1 .gauche{background:rgba(16,124,65,.08); padding:22px 16px; font-size:.85rem}
.cv1 .gauche h3{font-size:.78rem; text-transform:uppercase; letter-spacing:.05em; color:#107c41; margin:16px 0 6px}
.cv1 .gauche h3:first-child{margin-top:0}
.cv1 .gauche p{margin:2px 0}
.cv1 .droite{padding:22px 22px 14px}
.cv1 .nom{font-size:1.4rem; font-weight:800; margin:0}
.cv1 .titre{color:#107c41; font-weight:600; margin:2px 0 14px}
.cv1 h2{font-size:.85rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #107c41; padding-bottom:3px; margin:14px 0 8px}
.cv1 .pied{grid-column:1 / -1}
/* 2 : classique centrée (Laura) */
.cv2 .corps{padding:24px 26px 14px}
.cv2 .nom{font-size:1.35rem; font-weight:700; text-align:center; margin:0; letter-spacing:.03em; text-transform:uppercase}
.cv2 .coord{text-align:center; color:var(--douce); font-size:.85rem; margin:4px 0 6px}
.cv2 .titre{text-align:center; font-weight:600; margin:0 0 14px; color:#9c620a}
.cv2 h2{font-size:.9rem; margin:14px 0 6px; color:#9c620a}
.cv2 h2::after{content:""; display:block; height:1px; background:var(--filet); margin-top:3px}
/* 3 : en-tête plein (Mehdi) */
.cv3 .tete{background:rgba(60,72,88,.12); padding:18px 24px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap}
.cv3 .nom{font-size:1.3rem; font-weight:800; margin:0}
.cv3 .titre{margin:2px 0 0; font-weight:600; color:#3c4858}
.cv3 .coord{font-size:.82rem; text-align:right; color:var(--douce)}
.cv3 .coord p{margin:1px 0}
.cv3 .dispo{margin:0; padding:7px 24px; font-size:.88rem; border-bottom:1px solid var(--filet)}
.cv3 .corps{padding:12px 24px 14px; display:grid; grid-template-columns:1fr 150px; gap:18px}
.cv3 h2{font-size:.82rem; text-transform:uppercase; letter-spacing:.06em; color:#3c4858; margin:12px 0 6px}
.cv3 .cote3{border-left:1px solid var(--filet); padding-left:14px; font-size:.84rem}
.cv3 .cote3 p{margin:3px 0}
/* 4 : tableau (Thomas) */
.cv4 .corps{padding:22px 24px 14px}
.cv4 .nom{font-size:1.25rem; font-weight:700; margin:0}
.cv4 .titre{margin:0 0 12px; color:var(--douce)}
.cv4 table{border-collapse:collapse; width:100%; font-size:.88rem}
.cv4 th{width:120px; text-align:left; vertical-align:top; padding:7px 10px 7px 0; color:#7a4a8c; font-weight:700; border-top:1px solid var(--filet)}
.cv4 td{padding:7px 0; border-top:1px solid var(--filet); vertical-align:top}
.cv4 td p{margin:0 0 4px}
/* 5 : profil en tête, colonne à droite (Sabrina) */
.cv5{display:grid; grid-template-columns:1fr 165px}
.cv5 .principal{padding:22px 20px 14px 24px}
.cv5 .nom{font-size:1.35rem; font-weight:300; margin:0; letter-spacing:.02em}
.cv5 .nom b{font-weight:800}
.cv5 .titre{margin:2px 0 10px; font-size:.9rem; color:#a33f6f; font-weight:600}
.cv5 .profil{font-style:italic; font-size:.9rem; border-top:1px solid var(--filet); border-bottom:1px solid var(--filet); padding:8px 0; margin:0 0 6px}
.cv5 h2{font-size:.85rem; color:#a33f6f; margin:12px 0 5px}
.cv5 .droite5{background:rgba(163,63,111,.07); padding:22px 14px; font-size:.83rem}
.cv5 .droite5 h3{font-size:.76rem; text-transform:uppercase; letter-spacing:.05em; margin:14px 0 5px; color:#a33f6f}
.cv5 .droite5 h3:first-child{margin-top:0}
.cv5 .droite5 p{margin:2px 0}
.cv5 .pied{grid-column:1 / -1}
/* Fiche de poste */
.fp .tete{display:flex; gap:12px; align-items:center; padding:16px 24px; border-bottom:3px solid var(--smoby)}
.fp .tete img{width:52px; height:52px}
.fp .tete p{margin:0}
.fp .tete .t{font-size:1.2rem; font-weight:800}
.fp .corps{padding:12px 24px 14px}
.fp h2{font-size:.88rem; text-transform:uppercase; letter-spacing:.05em; color:var(--smoby); margin:14px 0 6px}
.fp dl{display:grid; grid-template-columns:150px 1fr; gap:4px 10px; margin:0; font-size:.9rem}
.fp dt{color:var(--douce)}
.fp dd{margin:0}
.fp .caces{border:1px solid var(--smoby); border-radius:var(--r); padding:8px 12px; font-size:.88rem; margin-top:12px}
.fp .caces b:first-child{color:var(--smoby)}

`;

export const PIED_CV = '<div class="pied">CV fictif — document pédagogique Prepalog</div>';
export const DOCUMENTS = [
  { id: 'poste', titre: 'Fiche de poste — cariste', court: 'Fiche de poste', html: `
  <article class="cv fp" aria-label="Fiche de poste">
    <div class="tete"><div><p class="t">Fiche de poste : [[cariste]]</p>
      <p class="note">Plateforme logistique de Moirans-en-Montagne (39) · Renfort pour le pic de Noël</p></div></div>
    <div class="corps">
      <h2>Le poste</h2>
      <dl>
        <dt>Missions</dt><dd>Décharger et charger les camions au chariot frontal, ranger les palettes dans les racks, préparer des palettes de commande.</dd>
        <dt>Lieu</dt><dd>Plateforme logistique, Moirans-en-Montagne (Jura)</dd>
        <dt>Horaires</dt><dd>En équipe, du lundi au vendredi : semaine du matin ou semaine de l'après-midi</dd>
      </dl>
      <h2>Le contrat</h2>
      <dl>
        <dt>Type</dt><dd><b>CDD saisonnier</b> (pic d'activité de Noël)</dd>
        <dt>Prise de poste</dt><dd><b>Mercredi 9 décembre 2026</b></dd>
        <dt>Fin du contrat</dt><dd>Vendredi 8 janvier 2027</dd>
      </dl>
      <h2>Le profil recherché</h2>
      <ul>
        <li><b>CACES R489 catégorie 3 exigé</b>, en cours de validité le jour de la prise de poste</li>
        <li>CACES R489 catégorie 5 apprécié</li>
        <li>Rigueur, respect des consignes de sécurité, travail en équipe</li>
      </ul>
      <div class="caces"><b>Le CACES, c'est quoi ?</b><br>
        Un certificat qui prouve que tu sais conduire un type d'engin. Une catégorie par sorte de chariot :
        1 = transpalette porté, 3 = chariot frontal, 5 = chariot à mât rétractable. Il est <b>valable 5 ans</b>.</div>
    </div>
    <div class="pied">Document pédagogique, reconstitution, non contractuel</div>
  </article>` },

  { id: 'yanis', titre: 'CV — Yanis Morel', court: 'Yanis Morel', html: `
  <article class="cv cv1" aria-label="CV de Yanis Morel">
    <div class="gauche">
      <h3>Contact</h3>
      <p>12 rue du Pré</p><p>39200 Saint-Claude</p><p>06 00 00 00 01</p><p>y.morel@exemple.fr</p>
      <h3>Permis et CACES</h3>
      <p><b>Permis B</b></p>
      <p><b>CACES R489 cat. 3</b><br>obtenu en mai 2024</p>
      <p><b>CACES R489 cat. 5</b><br>obtenu en mai 2024</p>
      <h3>Langues</h3>
      <p>Français</p><p>Anglais : notions</p>
      <h3>Centres d'intérêt</h3>
      <p>Football (club de Saint-Claude), VTT</p>
    </div>
    <div class="droite">
      <p class="nom">Yanis MOREL</p>
      <p class="titre">Cariste – magasinier</p>
      <h2>Expérience</h2>
      <div class="ligne"><span class="quand">2024 – 2026</span><span><b>Cariste (intérim)</b>Plateforme de distribution, Oyonnax (01)<br>Chargement et déchargement de camions, rangement en hauteur.</span></div>
      <div class="ligne"><span class="quand">2023</span><span><b>Préparateur de commandes</b>Entrepôt de matériaux, Lons-le-Saunier (39)</span></div>
      <h2>Formation</h2>
      <div class="ligne"><span class="quand">2024</span><span><b>Formation CACES R489 cat. 3 et 5</b>Centre de formation, Lons-le-Saunier</span></div>
      <div class="ligne"><span class="quand">2023</span><span><b>CAP Opérateur logistique</b>Lycée professionnel, Saint-Claude</span></div>
      <div class="recherche"><b>Ce que je recherche :</b> un poste de cariste, CDD ou CDI. <b>Disponible dès le 30 novembre 2026.</b></div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'laura', titre: 'CV — Laura Petit', court: 'Laura Petit', html: `
  <article class="cv cv2" aria-label="CV de Laura Petit">
    <div class="corps">
      <p class="nom">Laura Petit</p>
      <p class="coord">4 place de l'Église, 39260 Moirans-en-Montagne · 06 00 00 00 02 · laura.petit@exemple.fr</p>
      <p class="titre">Cariste expérimentée</p>
      <h2>Expériences professionnelles</h2>
      <div class="ligne"><span class="quand">2021 – 2025</span><span><b>Cariste</b>Usine de plasturgie, Oyonnax (01)<br>Approvisionnement des lignes au chariot frontal.</span></div>
      <div class="ligne"><span class="quand">2025 – 2026</span><span><b>Agente d'accueil</b>Office de tourisme, Saint-Claude (39)</span></div>
      <h2>Diplômes et certificats</h2>
      <div class="ligne"><span class="quand">2021</span><span><b>CACES R489 cat. 3</b>obtenu en mars 2021</span></div>
      <div class="ligne"><span class="quand">2019</span><span><b>Bac pro Métiers de la logistique</b>Lycée professionnel, Lons-le-Saunier</span></div>
      <h2>Compétences</h2>
      <ul><li>Conduite de chariot frontal</li><li>Lecture d'un bon de livraison</li><li>Travail en équipe</li></ul>
      <div class="recherche"><b>Ce que je recherche :</b> reprendre un poste de cariste, CDD accepté. <b>Disponible immédiatement.</b></div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'mehdi', titre: 'CV — Mehdi Benali', court: 'Mehdi Benali', html: `
  <article class="cv cv3" aria-label="CV de Mehdi Benali">
    <div class="tete">
      <div><p class="nom">Mehdi Benali</p><p class="titre">Préparateur de commandes</p></div>
      <div class="coord"><p>27 avenue Jean-Jaurès</p><p>01100 Oyonnax</p><p>06 00 00 00 03</p><p>mehdi.benali@exemple.fr</p></div>
    </div>
    <p class="dispo"><b>Disponible tout de suite</b> · CDD ou CDI</p>
    <div class="corps">
      <div>
        <h2>Parcours</h2>
        <div class="ligne"><span class="quand">2025 – 2026</span><span><b>Préparateur de commandes</b>Entrepôt de la grande distribution, Bourg-en-Bresse (01)<br>Préparation au transpalette électrique, filmage des palettes.</span></div>
        <div class="ligne"><span class="quand">2024</span><span><b>Employé de rayon (été)</b>Supermarché, Oyonnax (01)</span></div>
        <h2>Formation</h2>
        <div class="ligne"><span class="quand">2024</span><span><b>Bac pro Logistique</b>Lycée professionnel, Bourg-en-Bresse</span></div>
      </div>
      <div class="cote3">
        <h2>Habilitations</h2>
        <p><b>CACES R489 cat. 1A</b></p><p>obtenu en février 2025</p>
        <h2>Permis</h2>
        <p>Permis B</p>
        <h2>Atouts</h2>
        <p>Ponctuel</p><p>Esprit d'équipe</p><p>Habitué au froid</p>
      </div>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'thomas', titre: 'CV — Thomas Girod', court: 'Thomas Girod', html: `
  <article class="cv cv4" aria-label="CV de Thomas Girod">
    <div class="corps">
      <p class="nom">Thomas GIROD</p>
      <p class="titre">Cariste · 18 chemin des Vignes, 39000 Lons-le-Saunier · 06 00 00 00 04 · t.girod@exemple.fr</p>
      <table>
        <tr><th>Expérience</th><td>
          <p><b>2023 – 2026 · Cariste</b>, fromagerie, Poligny (39) : réception des camions au chariot frontal, rangement en chambre froide.</p>
          <p><b>2021 – 2023 · Manutentionnaire</b>, scierie, Champagnole (39).</p></td></tr>
        <tr><th>Formations</th><td>
          <p><b>2023</b> · CACES R489 catégorie 3 (chariot frontal)</p>
          <p><b>2021</b> · CAP Opérateur logistique</p></td></tr>
        <tr><th>Disponibilité</th><td>En poste jusqu'au 31 décembre 2026. <b>Libre à partir du 4 janvier 2027.</b></td></tr>
        <tr><th>Contrat souhaité</th><td>CDD</td></tr>
        <tr><th>Divers</th><td>Permis B, véhicule personnel. Sapeur-pompier volontaire.</td></tr>
      </table>
    </div>
    ${PIED_CV}
  </article>` },

  { id: 'sabrina', titre: 'CV — Sabrina Lopez', court: 'Sabrina Lopez', html: `
  <article class="cv cv5" aria-label="CV de Sabrina Lopez">
    <div class="principal">
      <p class="nom">Sabrina <b>LOPEZ</b></p>
      <p class="titre">Cariste confirmée – chariots frontal et rétractable</p>
      <p class="profil">Cariste depuis 2022, disponible immédiatement. Je cherche aujourd'hui un emploi stable :
        <b>uniquement un CDI</b>, pour m'installer durablement dans la région.</p>
      <h2>Expérience</h2>
      <div class="ligne"><span class="quand">2022 – 2026</span><span><b>Cariste</b>Entrepôt de meubles, Saint-Claude (39)<br>Rangement en hauteur au chariot rétractable, inventaires.</span></div>
      <div class="ligne"><span class="quand">2020 – 2022</span><span><b>Agente de quai</b>Messagerie, Lons-le-Saunier (39)</span></div>
      <h2>Formation</h2>
      <div class="ligne"><span class="quand">2020</span><span><b>Bac pro Logistique</b>Lycée professionnel, Morez (39)</span></div>
    </div>
    <div class="droite5">
      <h3>Coordonnées</h3>
      <p>9 rue Carnot</p><p>39200 Saint-Claude</p><p>06 00 00 00 05</p><p>s.lopez@exemple.fr</p>
      <h3>Habilitations</h3>
      <p>CACES R489 cat. 3</p><p>CACES R489 cat. 5</p><p class="note">obtenus en juin 2022</p>
      <h3>Permis</h3>
      <p>Permis B</p>
      <h3>Loisirs</h3>
      <p>Randonnée, chorale</p>
    </div>
    ${PIED_CV}
  </article>` },
];
