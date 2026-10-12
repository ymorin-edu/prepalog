"""Calage d'ENT-6.9 (France Boissons, la tournée de la côte) : énumère les 720 ordres des six clients et cherche
les jeux de valeurs (vitesse moyenne sur la côte, temps par arrêt, horaires des clients) qui donnent le profil
demandé par le brief (§6).

Usage : py docs/briefs/france-boissons/calage-6.9.py            (balayage, puis les meilleurs jeux)
        py docs/briefs/france-boissons/calage-6.9.py --detail N  (le détail du jeu n° N du classement)

Les km viennent de la carte GÉNÉRÉE (`contenus/fb-ent69-carte.js`, table `trajets`, profil porteur) : ce sont
ceux que la vue Tournée lira. Le calcul est celui de `core/types/tournee.js` (`bilanDe`, chantier D-9) :
  - arrivée chez un client = départ de Buchelay + approche aller + km cumulés ÷ vitesse + service des arrêts
    précédents + attentes précédentes ;
  - arrivé avant l'ouverture (`apres`), le camion ATTEND ; « trop tard » = arrivée + attente > `avant`
    (« avant 8 h 30 » admet 8 h 30 pile) ;
  - conduite = approche aller + km sur la côte ÷ vitesse + approche retour (ni service, ni attente) ;
  - au-delà de 4 h 30 de conduite, la pause de 45 min s'ajoute au retour.
"""
import itertools, json, os, re, sys

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.normpath(os.path.join(ICI, '..', '..', '..'))
def arg(nom, defaut):
    return sys.argv[sys.argv.index(nom) + 1] if nom in sys.argv else defaut
# `--carte` : un autre module généré (essai de variantes) ; `--clients` : les six clients, D'EST EN OUEST le long
# de la côte ; `--matin` : le client dont l'horaire est « avant … le matin » (le rôle de Honfleur dans le brief).
src = open(os.path.join(DEPOT, arg('--carte', 'contenus/fb-ent69-carte.js')), encoding='utf-8').read()
CARTE = json.loads(re.search(r'export const CARTE = (.*);\s*$', src, re.S).group(1))
KM = {k: v['m'] / 1000 for k, v in CARTE['trajets'].items()}
IDS = arg('--clients', 'H,T,D,V,M,G').split(',')
MATIN = arg('--matin', 'H')
NOMS = {c['id']: c['nom'] for c in CARTE['clients']}

# Données fixes de la journée (brief §4, §6) : départ 6 h, 142 km d'autoroute mesurés (OSRM sur OSM, Buchelay →
# bout de l'A132), 90 km/h, retour avant 15 h 30, 4 h 30 de conduite au plus, pause de 45 min.
DEPART, KM_AUTO, V_AUTO, LIMITE, CONDUITE_MAX, PAUSE = 6 * 60, 142, 90, 15 * 60 + 30, 270, 45
APPROCHE = KM_AUTO / V_AUTO * 60
hm = lambda m: f'{int(m // 60):02d} h {int(round(m % 60)):02d}'

def km_ordre(o):
    suite = ['depart'] + list(o) + ['arrivee']
    return sum(KM[f'{a}|{b}'] for a, b in zip(suite, suite[1:]))

def bilan(o, v, s, cr):
    """Le bilan d'un ordre, comme `bilanDe` : km, conduite, retour, créneaux ratés (trop tard), attente."""
    km, servi, attente, rates, arr = 0.0, 0.0, 0.0, [], {}
    prec = 'depart'
    for p in o:
        km += KM[f'{prec}|{p}']
        a = DEPART + APPROCHE + km / v * 60 + servi + attente
        c = cr.get(p, {})
        w = c['apres'] - a if 'apres' in c and a < c['apres'] else 0
        if 'avant' in c and a + w > c['avant']:
            rates.append(p)
        arr[p] = (a, w)
        attente += w; servi += s; prec = p
    km += KM[f'{prec}|arrivee']
    conduite = 2 * APPROCHE + km / v * 60
    pause = PAUSE if conduite > CONDUITE_MAX else 0
    retour = DEPART + 2 * APPROCHE + km / v * 60 + servi + attente + pause
    return dict(km=km, conduite=conduite, retour=retour, rates=rates, attente=attente, arr=arr,
                pause=pause > 0, tard=retour > LIMITE)

ok = lambda b: not b['rates'] and not b['pause'] and not b['tard']
ORDRES = list(itertools.permutations(IDS))
# Géographie : l'ordre de `--clients`, d'est en ouest le long de la côte (« nord → sud » du brief).
NORD_SUD = tuple(IDS)
SUD_NORD = tuple(reversed(NORD_SUD))
PLUS_COURT = min(ORDRES, key=km_ordre)

def profil(v, s, cr):
    B = {o: bilan(o, v, s, cr) for o in ORDRES}
    bons = [o for o in ORDRES if ok(B[o])]
    fen_ok_trop_long = [o for o in ORDRES if not B[o]['rates'] and B[o]['pause']]
    court_rate_fen = [o for o in ORDRES if B[o]['rates'] and not B[o]['pause']]
    malo_tot = [o for o in ORDRES if B[o]['arr']['M'][1] > 0]
    malo_tot_bons = [o for o in malo_tot if ok(B[o])]
    meilleure = min(bons, key=lambda o: B[o]['conduite']) if bons else None
    crit = {
        'part': 0.05 <= len(bons) / 720 <= 0.15,
        'nord_sud': not ok(B[NORD_SUD]),
        'sud_nord': not ok(B[SUD_NORD]),
        'plus_court': not ok(B[PLUS_COURT]),
        'fen_ok_trop_long': len(fen_ok_trop_long) > 0,
        'court_rate_fen': len(court_rate_fen) > 0,
        # « Malo en premier » (le piège du brief, §5) : tout ordre qui commence par Malo rate quelque chose.
        # (« aucune attente chez Malo dans un bon ordre » était trop strict : avec un retour avant 15 h 30,
        # une attente vers 9 h 45 ne coûte rien, et Malo devrait toujours finir la tournée.)
        'malo_tot': not any(ok(B[o]) for o in ORDRES if o[0] == 'M'),
        # brief : la meilleure tournée a ≈ 4 h 15 à 4 h 30 de conduite (cohérence avec la carte d'ENT-6.8)
        'meilleure_4h15': meilleure is not None and 255 <= B[meilleure]['conduite'] <= 270,
    }
    return dict(B=B, bons=bons, crit=crit, meilleure=meilleure, n_fen=len(fen_ok_trop_long),
                n_court=len(court_rate_fen), n_malo=len(malo_tot))

def creneaux(d, h, t, g):
    return {'D': {'avant': d}, MATIN: {'avant': h}, 'T': {'avant': t}, 'M': {'apres': 10 * 60}, 'G': {'avant': g}}

def balayage():
    res = []
    for v in [int(x) for x in arg('--vitesses', '30,35,40,45').split(',')]:
        for s in (15, 20, 25):
            for d in range(7 * 60 + 45, 9 * 60 + 1, 15):
                for h in range(9 * 60 + 30, 11 * 60 + 31, 30):
                    for t in range(10 * 60, 12 * 60 + 1, 30):
                        for g in range(10 * 60 + 30, 12 * 60 + 31, 30):
                            cr = creneaux(d, h, t, g)
                            P = profil(v, s, cr)
                            n = sum(P['crit'].values())
                            res.append((n, v, s, cr, P))
    return res

if __name__ == '__main__':
    print('Km sur la côte (carte, profil porteur) :')
    print('  ' + '  '.join(f'entrée→{a} {KM["depart|" + a]:.1f}' for a in IDS))
    print('  ' + '  '.join(f'{a}→{b} {KM[a + "|" + b]:.1f}' for a, b in zip(IDS, IDS[1:])))
    print(f'  ordre le plus court : {"-".join(PLUS_COURT)}, {km_ordre(PLUS_COURT):.1f} km sur la côte ;'
          f' nord → sud {km_ordre(NORD_SUD):.1f} km ; autoroute {2 * KM_AUTO} km, {hm(2 * APPROCHE)} de conduite')
    res = balayage()
    # Chaque horaire doit COMPTER : l'enlever change le nombre d'ordres justes. Sinon c'est un horaire décoratif,
    # que l'élève lirait pour rien. Calculé sur les seuls jeux qui tiennent les 8 critères (le reste est trop lent).
    def utiles(v, s, cr, P):
        return sum(len(profil(v, s, {k: c for k, c in cr.items() if k != x})['bons']) != len(P['bons']) for x in cr)
    res = [(n, v, s, cr, P, utiles(v, s, cr, P) if n == 8 else 0) for n, v, s, cr, P in res]
    res.sort(key=lambda r: (-r[0], -r[5], abs(len(r[4]['bons']) / 720 - 0.10)))
    res = [r[:5] + (r[5],) for r in res]
    print(f'\n{len(res)} jeux essayés ; les 12 meilleurs (critères tenus sur 8, horaires utiles sur 5) :')
    for i, (n, v, s, cr, P, u) in enumerate(res[:12]):
        m = P['meilleure']
        print(f"  n°{i}: {n}/8 {u}/5  côte {v} km/h, {s} min/arrêt, D<{hm(cr['D']['avant'])} {MATIN}<{hm(cr[MATIN]['avant'])}"
              f" T<{hm(cr['T']['avant'])} G<{hm(cr['G']['avant'])} : {len(P['bons'])} ordres bons ({100 * len(P['bons']) / 720:.0f} %)"
              + (f", meilleure {'-'.join(m)} {hm(P['B'][m]['conduite'])} de conduite, retour {hm(P['B'][m]['retour'])}" if m else '')
              + f", {sum(b['tard'] for b in P['B'].values())} ordres rentrent après 15 h 30"
              + f"  manque : {[k for k, x in P['crit'].items() if not x]}")
    if '--detail' in sys.argv:
        n, v, s, cr, P, u = res[int(sys.argv[sys.argv.index('--detail') + 1])]
        B = P['B']
        print(f'\nDétail : côte {v} km/h, {s} min par arrêt, créneaux {cr}')
        for nom, o in (('nord → sud', NORD_SUD), ('sud → nord', SUD_NORD), ('plus court', PLUS_COURT)):
            b = B[o]
            print(f"  {nom} {'-'.join(o)} : {b['km']:.1f} km, conduite {hm(b['conduite'])}, retour {hm(b['retour'])},"
                  f" ratés {b['rates']}, pause {b['pause']}, attente {b['attente']:.0f} min")
        print('  ordres bons :', len(P['bons']))
        for o in sorted(P['bons'], key=lambda o: B[o]['conduite'])[:12]:
            b = B[o]
            print(f"    {'-'.join(o)} : {b['km']:.1f} km, conduite {hm(b['conduite'])}, retour {hm(b['retour'])}, attente {b['attente']:.0f} min")
        print(f"  fenêtres tenues mais > 4 h 30 : {P['n_fen']} ; < 4 h 30 mais fenêtre ratée : {P['n_court']} ;"
              f" Malo avant 10 h : {P['n_malo']} ordres, dont bons : {len([o for o in P['bons'] if B[o]['arr']['M'][1] > 0])}")
