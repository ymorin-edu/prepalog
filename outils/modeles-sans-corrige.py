# Prepalog — retrait du corrigé des classeurs modèles.
#
# Les classeurs des séries tableur viennent de la Suite Logistique, où ils étaient
# embarqués en base64 dans index.html. Ils sont repris tels quels — mise en forme,
# consignes, largeurs de colonnes — à une exception près : **l'onglet « Correction »
# est retiré**.
#
# Cet onglet portait les réponses. Il était seulement « masqué », ce qu'un élève annule
# d'un clic droit : le corrigé partait donc avec l'exercice. Le retirer est le seul
# changement apporté aux fichiers.
#
# Le retrait se fait dans l'archive zip du .xlsx, sans réécrire le classeur : passer par
# une bibliothèque de tableur perdrait la mise en forme (gras, couleurs, largeurs), que
# les modèles utilisent pour montrer à l'élève où saisir.
#
# Le script balaie **tous** les dossiers de classeurs de `contenus/`, pas un seul :
# c'est ce qui l'a rendu utile le 01/10, quand TAB-2 s'est révélé porter encore son
# corrigé alors que TAB-1 avait été nettoyé. Un dossier de série ajouté plus tard est
# couvert sans qu'on y pense. Le test « les classeurs ne portent plus l'onglet
# Correction » de `outils/test.mjs` balaie la même liste, et c'est lui le vrai
# garde-fou : ce script répare, le test alerte.
#
# Usage :  python outils/modeles-sans-corrige.py            (vérifie)
#          python outils/modeles-sans-corrige.py --ecrire   (retire l'onglet)

import re
import shutil
import sys
import zipfile
from pathlib import Path

CONTENUS = Path(__file__).resolve().parent.parent / 'contenus'
ONGLET = 'Correction'


def classeurs():
    """Rend tous les .xlsx de `contenus/`, racine et sous-dossiers, triés."""
    return sorted(CONTENUS.rglob('*.xlsx'))


def feuille_de(nom_zip, onglet):
    """Rend (chemin de la feuille, id de relation) de l'onglet nommé, ou (None, None)."""
    with zipfile.ZipFile(nom_zip) as z:
        wb = z.read('xl/workbook.xml').decode('utf-8')
        rels = z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    m = re.search(r'<sheet[^>]*name="%s"[^>]*r:id="([^"]+)"[^>]*/>' % onglet, wb)
    if not m:
        return None, None
    rid = m.group(1)
    mr = re.search(r'<Relationship[^>]*Target="([^"]+)"[^>]*Id="%s"' % rid, rels) \
        or re.search(r'<Relationship[^>]*Id="%s"[^>]*Target="([^"]+)"' % rid, rels)
    cible = mr.group(1).lstrip('/') if mr else None
    if cible and not cible.startswith('xl/'):
        cible = 'xl/' + cible
    return cible, rid


def retirer(chemin):
    cible, rid = feuille_de(chemin, ONGLET)
    if not cible:
        return False
    tmp = chemin.with_suffix('.tmp')
    with zipfile.ZipFile(chemin) as z, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as s:
        for info in z.infolist():
            if info.filename in (cible, 'xl/calcChain.xml'):
                continue                     # la feuille, et la chaîne de calcul qui la cite
            data = z.read(info.filename)
            if info.filename == 'xl/workbook.xml':
                t = data.decode('utf-8')
                t = re.sub(r'<sheet[^>]*name="%s"[^>]*/>' % ONGLET, '', t)
                data = t.encode('utf-8')
            elif info.filename == 'xl/_rels/workbook.xml.rels':
                t = data.decode('utf-8')
                t = re.sub(r'<Relationship[^>]*Id="%s"[^>]*/>' % rid, '', t)
                t = re.sub(r'<Relationship[^>]*calcChain[^>]*/>', '', t)
                data = t.encode('utf-8')
            elif info.filename == '[Content_Types].xml':
                t = data.decode('utf-8')
                t = re.sub(r'<Override[^>]*PartName="/%s"[^>]*/>' % re.escape(cible), '', t)
                t = re.sub(r'<Override[^>]*calcChain[^>]*/>', '', t)
                data = t.encode('utf-8')
            s.writestr(info, data)
    shutil.move(str(tmp), str(chemin))
    return True


def main():
    ecrire = '--ecrire' in sys.argv
    fichiers = classeurs()
    if not fichiers:
        print(f'Aucun classeur sous {CONTENUS}')
        return 1
    restants = 0
    for f in fichiers:
        nom = f.relative_to(CONTENUS).as_posix()
        cible, _ = feuille_de(f, ONGLET)
        if not cible:
            print(f'  ok      {nom}')
            continue
        if ecrire:
            retirer(f)
            print(f'  retiré  {nom}')
        else:
            print(f'  À RETIRER : {nom} porte encore l\'onglet « {ONGLET} »')
            restants += 1
    print(f'\n{len(fichiers)} classeur(s) examiné(s).')
    if restants:
        print(f'{restants} portent encore le corrigé. Relancez avec --ecrire.')
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
