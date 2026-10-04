// Généré par outils/trame-cdiscount-priorites.py — ne pas modifier à la main : modifier le générateur, puis le relancer.
export const CORRIGE = {
  "code": "ENT-2.6",
  "titre": "Cdiscount — cinq recomptages, pas un de plus",
  "trame": "ENT-2.6-cdiscount-priorites-trame-eleve",
  "items": [
    {
      "etape": 1,
      "etapeTitre": "Découvrir RECHERCHEV",
      "genre": "question",
      "texte": "Que fait la fonction RECHERCHEV ?",
      "rep": "Elle cherche une valeur dans la première colonne d'un tableau et rend la valeur d'une autre colonne, sur la même ligne.",
      "note": "Source : support.microsoft.com, « RECHERCHEV, fonction » (relue le 04/10/2026)."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir RECHERCHEV",
      "genre": "fait",
      "texte": "Dans quelle colonne de la plage doit se trouver la valeur cherchée ?",
      "rep": "Dans la première colonne de la plage."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir RECHERCHEV",
      "genre": "fait",
      "texte": "Que veut dire FAUX en dernier argument ?",
      "rep": "Correspondance exacte : la fonction cherche la valeur exacte, pas une valeur proche."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir RECHERCHEV",
      "genre": "fait",
      "texte": "Que s'affiche-t-il quand la valeur cherchée n'est pas trouvée ?",
      "rep": "#N/A."
    },
    {
      "etape": 1,
      "etapeTitre": "Découvrir RECHERCHEV",
      "genre": "reflexion",
      "texte": "Dans un entrepôt, à quoi pourrait servir RECHERCHEV ? Donne un exemple avec tes mots.",
      "pistes": [
        "Retrouver le prix, le poids, l'emplacement ou le fournisseur d'une référence à partir d'un tableau de référence (tarifs, catalogue).",
        "Rapprocher deux exports (commandes et stock, par exemple) par la référence.",
        "Accepter tout exemple avec une clé (référence, numéro) et une information rendue."
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la mission de Nadia",
      "genre": "tableau",
      "texte": "Information | Ce que tu relèves",
      "entetes": [
        "Information",
        "Ce que tu relèves"
      ],
      "contexte": "Ouvre l'activité « Cdiscount — cinq recomptages, pas un de plus ». Dans « Messagerie », lis le message de Nadia Ferrand : « Bonus : cinq recomptages, pas un de plus ».",
      "reponses": [
        [
          "Combien de références l'équipe peut-elle recompter ?",
          "5"
        ],
        [
          "Quelles allées ?",
          "A et B"
        ],
        [
          "Date du dernier inventaire",
          "Il y a 14 jours (date écrite dans le message)"
        ],
        [
          "Quelle fonction pour compter les constats ?",
          "NB.SI.ENS"
        ],
        [
          "Quelle fonction pour trouver le coût ?",
          "RECHERCHEV"
        ],
        [
          "Sur quoi Nadia veut-elle que tu choisisses : le nombre de constats ou les euros ?",
          "Les euros : là où l'écart pèse le plus"
        ]
      ]
    },
    {
      "etape": 2,
      "etapeTitre": "Lire la mission de Nadia",
      "genre": "reflexion",
      "texte": "Nadia écrit : « Une erreur coûte plus cher sur une batterie que sur une pile. » Explique ce qu'elle veut dire.",
      "pistes": [
        "Un écart d'une batterie (24,90 €) coûte autant que huit lots de piles (3,10 €).",
        "Ce n'est pas le nombre d'erreurs qui compte, c'est leur valeur : on recompte d'abord ce qui coûte cher."
      ]
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "fait",
      "texte": "Nombre de lignes de données avant nettoyage (sans les titres)",
      "rep": "158.",
      "note": "Confirmé : 234."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "fait",
      "texte": "Nombre de lignes vides supprimées",
      "rep": "4.",
      "note": "Positions tirées pour chaque élève (graine) ; le nombre ne change pas pour un niveau donné."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "fait",
      "texte": "Nombre de doublons supprimés",
      "rep": "3.",
      "note": "Au moins un doublon tombe sur un constat d'après l'inventaire : non supprimé, il fausse NB.SI.ENS."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "fait",
      "texte": "Nombre de dates en texte corrigées",
      "rep": "5.",
      "note": "Au moins trois sur des constats d'après l'inventaire. Le contrôle « Export nettoyé » vérifie le nombre de lignes, les doublons ET la colonne Date entièrement en vraies dates."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "fait",
      "texte": "Nombre de lignes de données après nettoyage",
      "rep": "151.",
      "note": "Confirmé : 223."
    },
    {
      "etape": 3,
      "etapeTitre": "Exporter et nettoyer",
      "genre": "reflexion",
      "texte": "Comment as-tu repéré la salissure la plus difficile à trouver ?",
      "pistes": [
        "Souvent les dates en texte (elles ressemblent aux autres) ou les doublons (il faut trier pour les voir).",
        "Valoriser la méthode : trier, regarder l'alignement, compter avant / après."
      ]
    },
    {
      "etape": 4,
      "etapeTitre": "Repérer les écarts depuis l'inventaire",
      "genre": "fait",
      "texte": "Formule que tu as écrite en L2",
      "rep": "=SI(ET(K2<>0;A2>=DATE(aaaa;mm;jj));D2;\"\")",
      "note": "Avec la date du dernier inventaire du message (J-14), par exemple DATE(2026;9;20) pour une séance ouverte le 04/10/2026. M2 : =K2."
    },
    {
      "etape": 4,
      "etapeTitre": "Repérer les écarts depuis l'inventaire",
      "genre": "reflexion",
      "texte": "Une référence avait beaucoup d'écarts avant l'inventaire, aucun après. Pourquoi ne faut-il pas la compter ?",
      "rep": "Ses écarts ont été corrigés (régularisés) le jour de l'inventaire : ils n'existent plus dans le stock. La recompter serait un recomptage perdu.",
      "note": "BAT-10K : 5 constats avant J-14 (6 en confirmé), aucun après. Sans critère de date, elle entre 2e dans les cinq."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les constats (NB.SI.ENS)",
      "genre": "fait",
      "texte": "Formule que tu as écrite en B2",
      "rep": "=NB.SI.ENS(Préparations!D:D;A2;Préparations!K:K;\"<>0\";Préparations!A:A;\">=\"&DATE(aaaa;mm;jj))",
      "note": "Le contrôle exige NB.SI.ENS (COUNTIFS) et les bonnes valeurs (voir l'en-tête du dictionnaire). Variante acceptée : compter la colonne L (Réf. en écart) avec NB.SI.ENS sur la seule référence."
    },
    {
      "etape": 5,
      "etapeTitre": "Compter les constats (NB.SI.ENS)",
      "genre": "reflexion",
      "texte": "Pourquoi as-tu besoin de trois critères, et pas d'un seul comme avec NB.SI ?",
      "pistes": [
        "Il faut à la fois la bonne référence, un écart non nul ET une date après l'inventaire.",
        "NB.SI ne sait tester qu'une condition ; NB.SI.ENS les teste toutes ensemble sur la même ligne."
      ]
    },
    {
      "etape": 6,
      "etapeTitre": "Chiffrer les écarts (RECHERCHEV)",
      "genre": "fait",
      "texte": "Formule que tu as écrite en C2",
      "rep": "=SIERREUR(RECHERCHEV(A2;Préparations!L:M;2;FAUX);0)",
      "note": "L'écart d'une référence est constant après son apparition : la première ligne trouvée suffit."
    },
    {
      "etape": 6,
      "etapeTitre": "Chiffrer les écarts (RECHERCHEV)",
      "genre": "fait",
      "texte": "Formule que tu as écrite en D2",
      "rep": "=RECHERCHEV(A2;Tarifs!A:C;3;FAUX)",
      "note": "E2 : =C2*D2. Le contrôle « Valeur de l'écart » exige une formule dans chaque case, RECHERCHEV quelque part dans la feuille Synthèse, et une tolérance de 0,01 €."
    },
    {
      "etape": 6,
      "etapeTitre": "Chiffrer les écarts (RECHERCHEV)",
      "genre": "reflexion",
      "texte": "Pourquoi RECHERCHEV vaut-elle mieux que recopier les coûts à la main ?",
      "pistes": [
        "Moins d'erreurs de recopie ; si un coût change dans Tarifs, la synthèse suit.",
        "Rapide sur 18 références, indispensable sur des milliers."
      ]
    },
    {
      "etape": 7,
      "etapeTitre": "Déposer, choisir et écrire à Nadia",
      "genre": "tableau",
      "texte": "Référence | Constats | Valeur de l'écart (€) | Référence | Constats | Valeur de l'écart (€)",
      "entetes": [
        "Référence",
        "Constats",
        "Valeur de l'écart (€)",
        "Référence",
        "Constats",
        "Valeur de l'écart (€)"
      ],
      "contexte": "Tu sais combien de fois chaque référence a été signalée. Il te faut maintenant ce que l'écart coûte.",
      "reponses": [
        [
          "ECO-BT-01",
          "2",
          "−59,70",
          "SUP-VOIT",
          "5",
          "−9,60"
        ],
        [
          "CHG-20W",
          "4",
          "−29,70",
          "PIL-AA-8",
          "8",
          "−6,20"
        ],
        [
          "CLA-SF-01",
          "3",
          "−28,40",
          "CAB-USBC-1M",
          "7",
          "+4,90"
        ],
        [
          "BOU-17L",
          "2",
          "−27,80",
          "",
          "",
          ""
        ],
        [
          "MIX-PLG",
          "2",
          "+25,20",
          "",
          "",
          ""
        ]
      ],
      "note": "Les cinq à entourer : ECO-BT-01, CHG-20W, CLA-SF-01, BOU-17L, MIX-PLG. Mêmes valeurs et même top 5 en confirmé (plus de constats). À égalité au 5e rang, l'une ou l'autre est acceptée."
    },
    {
      "etape": 7,
      "etapeTitre": "Déposer, choisir et écrire à Nadia",
      "genre": "fait",
      "texte": "Résultats justes à ton dernier dépôt",
      "rep": "37 sur 37 si tout est juste.",
      "note": "1 (export nettoyé) + 18 constats + 18 valeurs = 37."
    },
    {
      "etape": 7,
      "etapeTitre": "Déposer, choisir et écrire à Nadia",
      "genre": "reflexion",
      "texte": "Compare tes cinq références aux cinq qui ont le plus de constats. Pourquoi ne sont-elles pas toutes les mêmes ?",
      "pistes": [
        "Par constats : PIL, CAB, SUP, CHG, CLA ; par valeur : ECO, CHG, CLA, BOU, MIX. Trois différences.",
        "Les piles et les câbles sont souvent signalés, mais pour 1 ou 2 unités bon marché ; les écouteurs, deux fois seulement, mais 3 × 19,90 €.",
        "Un surplus (MIX-PLG, +2) coûte aussi : de la marchandise qu'on ne vend pas parce que le système l'ignore."
      ]
    }
  ]
};
