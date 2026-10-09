#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Photos libres du scenario France Boissons (ENT-6.x), chantier D-D.

Pour chaque image : telecharge l'original (Unsplash ou Pexels), applique la
retouche decrite dans docs/briefs/IMAGES-france-boissons.md, reduit a 1200 px
de large au plus, enregistre en JPEG qualite 80 dans
contenus/images/france-boissons/, RELIT le fichier ecrit et affiche son
SHA-256, sa taille et ses dimensions.

Les originaux vont dans outils/images-france-boissons-sources/ (jamais
commites, voir .gitignore). Un original deja present n'est pas retelecharge.
Pour recommencer a zero : vider ce dossier.

Dependances (utilisateur) : pillow, numpy, opencv-python-headless.
Lancer :  python outils/images-france-boissons.py            (toutes les images)
          python outils/images-france-boissons.py futs-mur   (une seule)

Aucune image n'est chargee depuis Unsplash ou Pexels par le site : ce script
est le seul a y aller, une fois, a la fabrication.
"""
import hashlib
import io
import os
import sys
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageOps

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = os.path.join(RACINE, "outils", "images-france-boissons-sources")
SORTIE = os.path.join(RACINE, "contenus", "images", "france-boissons")
LARGEUR_MAX = 1200
QUALITE = 80


def url_unsplash(ident):
    return "https://unsplash.com/photos/%s/download?force=true&w=1600" % ident


def url_pexels(ident):
    # adresse directe de l'image (page : https://www.pexels.com/fr-fr/photo/<...>-<id>/)
    return ("https://images.pexels.com/photos/%s/pexels-photo-%s.jpeg"
            "?auto=compress&cs=tinysrgb&w=1600" % (ident, ident))


# ----------------------------------------------------------------- outils


def en_cv(img):
    """PIL RGB -> tableau BGR."""
    return cv2.cvtColor(np.array(img.convert("RGB")), cv2.COLOR_RGB2BGR)


def en_pil(arr):
    return Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))


def remplir_par_voisinage(arr, masque, sigma, sources=None):
    """Remplace les pixels du masque par la moyenne (floue) des pixels voisins
    hors masque : efface un motif sur un aplat (plastique rouge, mur blanc)."""
    m = (masque > 0).astype(np.float32)
    libre = 1.0 - m
    if sources is not None:  # ne copier que des pixels de cette nature
        libre = libre * (sources > 0).astype(np.float32)
    f = arr.astype(np.float32)
    fond = np.zeros_like(f)
    rempli = np.zeros(m.shape, bool)
    # plusieurs echelles : on prend la plus fine qui voit assez de voisins
    for sg in (sigma, sigma * 2, sigma * 4, sigma * 8, sigma * 16, sigma * 32):
        num = cv2.GaussianBlur(f * libre[..., None], (0, 0), sg)
        den = cv2.GaussianBlur(libre, (0, 0), sg)
        ok = (den > (0.25 if sg < sigma * 32 else 0.01)) & ~rempli
        fond[ok] = (num[ok] / den[ok][:, None])
        rempli |= ok
    ok = ~rempli
    fond[ok] = f[ok]
    # fondu sur le bord du masque pour ne pas laisser de contour
    alpha = cv2.GaussianBlur(m, (0, 0), 1.5)[..., None]
    alpha = np.clip(alpha * 1.6, 0, 1)
    out = f * (1 - alpha) + fond * alpha
    return np.clip(out, 0, 255).astype(np.uint8)


def composantes_larges(masque, aire_min):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(masque, connectivity=8)
    out = np.zeros_like(masque)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= aire_min:
            out[lab == i] = 255
    return out


def dilater(masque, rayon):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * rayon + 1, 2 * rayon + 1))
    return cv2.dilate(masque, k)


def rect_masque(forme, x0, y0, x1, y1):
    m = np.zeros(forme[:2], np.uint8)
    m[y0:y1, x0:x1] = 255
    return m


def poly_masque(forme, points):
    m = np.zeros(forme[:2], np.uint8)
    cv2.fillPoly(m, [np.array(points, np.int32)], 255)
    return m


def flouter_zone(arr, masque, sigma):
    """Flou fort (illisible) limite au masque, avec bord adouci."""
    flou = cv2.GaussianBlur(arr, (0, 0), sigma)
    alpha = cv2.GaussianBlur((masque > 0).astype(np.float32), (0, 0), 6)[..., None]
    out = arr.astype(np.float32) * (1 - alpha) + flou.astype(np.float32) * alpha
    return np.clip(out, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- retouches


def retouche_aucune(img):
    return img


def retouche_futs_mur(img):
    # au-dessus des herbes du sol : on garde le mur et les deux rangees de futs
    return img.crop((0, 0, 1600, 900))


def retouche_casier_vides(img):
    # recadrage sur le casier du bas, puis effacement de « mini SUPER BOCK »
    # (arc jaune, textes, « 30 grfs ») sur les deux faces visibles
    x0, y0, x1, y1 = 130, 1180, 1520, 2300
    arr = en_cv(img.crop((x0, y0, x1, y1)))
    hsv = cv2.cvtColor(arr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    jaune = ((h >= 12) & (h <= 35) & (s > 90) & (v > 140)).astype(np.uint8) * 255
    # les deux faces visibles de la caisse (pas les goulots des bouteilles)
    zone = poly_masque(jaune.shape, [(93, 185), (649, 417), (649, 938), (116, 579)])
    zone |= poly_masque(jaune.shape, [(655, 422), (1214, 278), (1181, 695), (660, 938)])
    m = composantes_larges(cv2.bitwise_and(jaune, zone), 12)
    m = dilater(m, 11)
    # on ne recopie que du plastique rouge uni (pas les bouteilles ni le mur)
    rouge = (((h <= 8) | (h >= 170)) & (s > 120) & (v > 50)).astype(np.uint8) * 255
    rouge = cv2.erode(rouge, np.ones((5, 5), np.uint8))
    arr = remplir_par_voisinage(arr, m, 7, rouge)
    return en_pil(arr)


def retouche_bar_plage(img):
    # efface l'enseigne « SHOP » (lettres bleu-vert sur mur blanc) et la
    # lettre d'enseigne coupee au bord droit
    arr = en_cv(img)
    hsv = cv2.cvtColor(arr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    sombre = ((v < 150) | (s > 80)).astype(np.uint8) * 255
    zone = rect_masque(sombre.shape, 755, 565, 925, 630)
    zone |= rect_masque(sombre.shape, 1575, 615, 1600, 690)
    m = dilater(cv2.bitwise_and(sombre, zone), 5)
    arr = remplir_par_voisinage(arr, m, 8)
    return en_pil(arr)


def retouche_chariot_boissons(img):
    # flou net sur le cariste (tete et epaules)
    arr = en_cv(img)
    m = np.zeros(arr.shape[:2], np.uint8)
    cv2.ellipse(m, (975, 855), (75, 75), 0, 0, 360, 255, -1)
    cv2.ellipse(m, (1000, 960), (85, 70), 0, 0, 360, 255, -1)
    arr = flouter_zone(arr, m, 22)
    return en_pil(arr)


def retouche_entrepot_cartons(img):
    # efface la banniere du fond (magasin IKEA de Pekin) : on la recouvre par
    # le gris du mur voisin
    arr = en_cv(img)
    m = rect_masque(arr.shape, 733, 282, 845, 482)
    arr = cv2.inpaint(arr, m, 9, cv2.INPAINT_TELEA)
    return en_pil(arr)


def retouche_camion_port(img):
    # enseigne coreenne du bras de la grue (lettres noires sur jaune), plaques,
    # puis recadrage au-dessus des bacs verts (inscriptions coreennes)
    arr = en_cv(img)
    hsv = cv2.cvtColor(arr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    jaune = (h >= 15) & (h <= 35) & (s >= 110)
    ciel = (h >= 90) & (h <= 135) & (s >= 60)
    pas_jaune = (~jaune & ~ciel).astype(np.uint8) * 255
    zone = np.zeros(pas_jaune.shape, np.uint8)
    # cinq plaques blanches a caracteres coreens sur le bras de la grue
    for cx, cy in [(915, 172), (949, 200), (978, 226), (1004, 248), (1029, 268)]:
        cv2.circle(zone, (cx, cy), 19, 255, -1)
    m = dilater(cv2.bitwise_and(pas_jaune, zone), 2)
    arr = remplir_par_voisinage(arr, m, 5)
    # plaques d'immatriculation : flou
    p = rect_masque(arr.shape, 692, 762, 730, 792)
    p |= rect_masque(arr.shape, 830, 722, 890, 746)
    arr = flouter_zone(arr, p, 6)
    return en_pil(arr).crop((0, 0, 1600, 826))


# ------------------------------------------------------------------ tableau

# (fichier, source, identifiant, retouche)
IMAGES = [
    ("futs-vrac",         "unsplash", "2Gx8qmygwqg", retouche_aucune),
    ("futs-mur",          "unsplash", "UuyY2Ep3z4I", retouche_futs_mur),
    ("casier-vides",      "unsplash", "OYvf8JthYe8", retouche_casier_vides),
    ("tireuse",           "unsplash", "p_Z7UOqYrlA", retouche_aucune),
    ("bar-plage",         "unsplash", "JVfHTJwawA8", retouche_bar_plage),
    ("entrepot-allee",    "unsplash", "GK8x_XCcDZg", retouche_aucune),
    ("entrepot-racks",    "unsplash", "OnbSOhz0oig", retouche_aucune),
    ("chariot-boissons",  "unsplash", "F2C_mSrb6iM", retouche_chariot_boissons),
    ("entrepot-cartons",  "unsplash", "h3pVxOIpnzk", retouche_entrepot_cartons),
    ("camion-route",      "pexels",   "11262203",    retouche_aucune),
    ("camion-port",       "pexels",   "16718733",    retouche_camion_port),
]


def telecharger(source, ident):
    os.makedirs(SOURCES, exist_ok=True)
    chemin = os.path.join(SOURCES, "%s-%s.jpg" % (source, ident))
    if not os.path.exists(chemin):
        url = url_unsplash(ident) if source == "unsplash" else url_pexels(ident)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            donnees = r.read()
        Image.open(io.BytesIO(donnees)).verify()  # c'est bien une image
        with open(chemin, "wb") as f:
            f.write(donnees)
    return chemin


def sha(chemin):
    with open(chemin, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def fabriquer(nom, source, ident, retouche):
    chemin_src = telecharger(source, ident)
    img = ImageOps.exif_transpose(Image.open(chemin_src)).convert("RGB")
    img = retouche(img)
    if img.width > LARGEUR_MAX:
        h = round(img.height * LARGEUR_MAX / img.width)
        img = img.resize((LARGEUR_MAX, h), Image.LANCZOS)
    os.makedirs(SORTIE, exist_ok=True)
    chemin = os.path.join(SORTIE, nom + ".jpg")
    img.save(chemin, "JPEG", quality=QUALITE, optimize=True)
    # relecture du fichier ecrit
    with Image.open(chemin) as relu:
        relu.load()
        dims = "%dx%d" % relu.size
    return (nom, sha(chemin), os.path.getsize(chemin), dims, sha(chemin_src)[:12])


def main():
    choisies = set(sys.argv[1:])
    lignes = []
    for nom, source, ident, retouche in IMAGES:
        if choisies and nom not in choisies:
            continue
        lignes.append(fabriquer(nom, source, ident, retouche))
    print("%-18s %-64s %9s %-10s %s" % ("nom", "sha256", "octets", "dimensions", "source"))
    total = 0
    for nom, h, taille, dims, hs in lignes:
        total += taille
        print("%-18s %-64s %9d %-10s %s" % (nom, h, taille, dims, hs))
    print("total : %d octets (%.0f Ko)" % (total, total / 1024))


if __name__ == "__main__":
    main()
