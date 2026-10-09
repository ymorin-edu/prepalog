# Calage ENT-6.8 France Boissons — planning chauffeurs / camions, panne, location ou sous-traitance.
# Cowork, 05/10/2026 (brief docs/briefs/ENT-6.8-france-boissons-planning.md).
# Énumère, sur les RÈGLES (pas sur un attendu), toutes les organisations (chauffeur + camion par tournée)
# qui ont au moins un horaire juste, avant et après l'imprévu ; vérifie qu'aucun 1er envoi juste ne
# survit à l'imprévu ; joue chaque piège et dit quel jalon tombe. Grille 05:00-19:00 au quart d'heure.
# Lancer : python3 calage-6.8.py          (règle « une tournée par chauffeur et par camion », défaut)
#          python3 calage-6.8.py --plusieurs   (sans cette règle : montre le trou qu'elle bouche)
#          python3 calage-6.8.py --cote-libre  (sans « Lucas fait la côte » : calage d'avant le 06/10/2026)
# 06/10/2026 (décision de Tristan, option A) : la carte « côte » est posée d'avance sur la ligne de Lucas.
# Ce script n'est PAS un test du site : il cale les données. Les tests écrivent leurs valeurs à la main.
import itertools, sys
H = lambda s: int(s[:2])*60 + int(s[3:])
fmt = lambda m: f"{m//60:02d}:{m%60:02d}"
DEBUT, FIN, PAS = H('05:00'), H('19:00'), 15
UNE_PAR_JOUR = '--plusieurs' not in sys.argv   # règle « une tournée par chauffeur et par camion » (défaut du brief)
LUCAS_COTE = '--cote-libre' not in sys.argv    # la côte est posée d'avance sur Lucas (décision du 06/10/2026)
PAUSE, MAXSANS, MAXJOUR, REPOS = 45, 270, 540, 660

TOURS = {  # service (durée du bloc), conduite, km, vides, type exigé
 'cote':  dict(nom='Côte normande', des='06:00', avant='15:30', service=510, conduite=270, km=320, vides=True,  type='porteur'),
 'rouen': dict(nom='Rouen (fûts du concert)', des='06:00', avant='13:00', service=270, conduite=165, km=210, vides=False, type='porteur'),
 'vers':  dict(nom='Versailles', des='06:30', avant=None, service=420, conduite=150, km=110, vides=True, type='electrique'),
 'mantes':dict(nom='Mantes–Vernon', des='06:00', avant='16:00', service=360, conduite=120, km=90, vides=True, type='porteur'),
 'evreux':dict(nom='Évreux', des='06:00', avant=None, service=300, conduite=135, km=120, vides=True, type='vl'),
}
CHAUF = {'lucas':('C','17:00'),'amandine':('C','19:30'),'julien':('B',None),'sebastien':('C','22:00'),'fatou':('C',None)}
def camions(phase):
    C = {'E1':dict(gen='porteur',elec=True,auto=200,dispo=None),
         'E2':dict(gen='porteur',elec=True,auto=200 if phase==1 else 80,dispo=None),
         'T1':dict(gen='porteur',elec=False,auto=None,dispo=None),
         'T2':dict(gen='porteur',elec=False,auto=None,dispo=None if phase==1 else 'PANNE'),
         'VL':dict(gen='vl',elec=False,auto=None,dispo=None)}
    if phase==2: C['LOC']=dict(gen='porteur',elec=False,auto=None,dispo='09:00')
    return C

def reprise(ch):
    f = CHAUF[ch][1]
    return 0 if f is None else H(f)+REPOS-1440

# ---- règles, regroupées par jalon (renvoient la liste des problèmes)
def type_ok(t, k):   # bon type de camion
    T = TOURS[t]['type']
    if T=='electrique': return k['elec']
    if T=='porteur':    return k['gen']=='porteur'
    if T=='vl':         return True          # Évreux : petits volumes, VL ou porteur
def permis_ok(ch, k): return CHAUF[ch][0]=='C' or k['gen']=='vl'
def auto_ok(t, k):    return (not k['elec']) or TOURS[t]['km'] <= k['auto']

def jalons(plan, phase, npauses):
    """plan: {tour: (ligne, camion|None, debut)} ; ligne = chauffeur ou 'TR'. Renvoie dict jalon->bool."""
    C = camions(phase); J = {}
    tous = all(t in plan for t in TOURS) and all(plan[t][1] is not None or plan[t][0]=='TR' for t in TOURS)
    blocs = {t:(l,k,s,s+TOURS[t]['service']) for t,(l,k,s) in plan.items()}
    chev = lambda a,b: a[2]<b[3] and b[2]<a[3]
    # J2 chauffeurs : une à la fois, permis, transporteur dispo dès 07:00
    p2 = []; p3_pre = []
    for a,b in itertools.combinations(blocs,2):
        if blocs[a][0]==blocs[b][0] and chev(blocs[a],blocs[b]): p2.append(('chauffeurUnique',a,b))
    from collections import Counter as _C
    if UNE_PAR_JOUR:
        for l,n in _C(b[0] for b in blocs.values()).items():
            if n>1: p2.append(('uneTourneeChauffeur',l))
        for k,n in _C(b[1] for b in blocs.values() if b[1]).items():
            if n>1: p3_pre.append(('uneTourneeCamion',k))
    for t,(l,k,s,e) in blocs.items():
        if l=='TR':
            if phase==1: p2.append(('pasDeTransporteur',t))
            elif s < H('07:00'): p2.append(('transporteurDispo',t))
        elif k and not permis_ok(l, C[k]): p2.append(('permis',t))
    # J3 camions : un à la fois, bon type, autonomie, disponible
    p3 = list(p3_pre)
    for a,b in itertools.combinations(blocs,2):
        if blocs[a][1] and blocs[a][1]==blocs[b][1] and chev(blocs[a],blocs[b]): p3.append(('camionUnique',a,b))
    for t,(l,k,s,e) in blocs.items():
        if not k: continue
        if not type_ok(t,C[k]): p3.append(('typeCamion',t))
        if not auto_ok(t,C[k]): p3.append(('autonomie',t))
        d = C[k]['dispo']
        if d=='PANNE' or (d and s < H(d)): p3.append(('dispoCamion',t))
    # autonomie sur la journée (un électrique qui fait deux tournées) — signalé à part
    for k in ('E1','E2'):
        km = sum(TOURS[t]['km'] for t,(l,kk,s,e) in blocs.items() if kk==k)
        if km > C[k]['auto'] and sum(1 for b in blocs.values() if b[1]==k) > 1: p3.append(('autonomieJournee',k))
    # J4 fenêtres
    p4 = []
    for t,(l,k,s,e) in blocs.items():
        T = TOURS[t]
        if s < H(T['des']): p4.append(('tot',t))
        if T['avant'] and e > H(T['avant']): p4.append(('tard',t))
        if e > FIN: p4.append(('grille',t))
    # J5 conduite et repos (sur la CONDUITE, décision 58) ; pauses posées au mieux
    p5 = []; pauses_dispo = npauses
    for ch in CHAUF:
        siens = sorted((s,e,t) for t,(l,k,s,e) in blocs.items() if l==ch)
        if not siens: continue
        if siens[0][0] < reprise(ch): p5.append(('repos',ch))
        if sum(TOURS[t]['conduite'] for _,_,t in siens) > MAXJOUR: p5.append(('jour',ch))
        acc = 0
        for i,(s,e,t) in enumerate(siens):
            if i>0 and acc + TOURS[t]['conduite'] > MAXSANS and s - siens[i-1][1] >= PAUSE and pauses_dispo>0:
                pauses_dispo -= 1; acc = 0
            acc += TOURS[t]['conduite']
            if acc > MAXSANS: p5.append(('pause',ch)); break
    J['tous']=tous; J['chauffeurs']=tous and not p2; J['camions']=tous and not p3
    J['fenetre']=tous and not p4; J['conduite']=tous and not p5
    if phase==2:
        J['vides'] = tous and not any(l=='TR' and TOURS[t]['vides'] for t,(l,k,s,e) in blocs.items())
    J['_pb'] = p2+p3+p4+p5
    return J

def juste(J): return all(v for k,v in J.items() if not k.startswith('_'))

def starts(t):
    T = TOURS[t]; lo = H(T['des']); hi = min(H(T['avant']) if T['avant'] else FIN, FIN) - T['service']
    return range(lo, hi+1, PAS)

def organisations(phase, npauses):
    C = camions(phase)
    lignes = list(CHAUF) + (['TR'] if phase==2 else [])
    ts = list(TOURS)
    paires = []
    for t in ts:
        P = []
        for l in lignes:
            if LUCAS_COTE and t=='cote' and l!='lucas': continue
            if l=='TR':
                if not TOURS[t]['vides']: P.append((l,None))
                continue
            for k in C:
                if permis_ok(l,C[k]) and type_ok(t,C[k]) and auto_ok(t,C[k]) and C[k]['dispo']!='PANNE': P.append((l,k))
        paires.append(P)
    res = []
    for combo in itertools.product(*paires):
        L = [c[0] for c in combo]; K = [c[1] for c in combo]
        ks = [k for k in K if k]
        sol = cherche(ts, L, K, phase, npauses)
        if sol: res.append(sol)
    return res

def bornes(t, l, k, phase):
    C = camions(phase); T = TOURS[t]
    lo = H(T['des'])
    if l == 'TR': lo = max(lo, H('07:00'))
    else: lo = max(lo, reprise(l))
    if k and C[k]['dispo'] and C[k]['dispo'] != 'PANNE': lo = max(lo, H(C[k]['dispo']))
    lo = DEBUT + -(-(lo - DEBUT)//PAS)*PAS
    hi = min(H(T['avant']) if T['avant'] else FIN, FIN) - T['service']
    return lo, hi

def cherche(ts, L, K, phase, npauses):
    B = {}
    for t,l,k in zip(ts,L,K):
        lo,hi = bornes(t,l,k,phase)
        if lo>hi: return None
        B[t]=(lo,hi)
    # groupes de tournées qui partagent une ressource
    par = {t:t for t in ts}
    def f(x):
        while par[x]!=x: x=par[x]
        return x
    for i,a in enumerate(ts):
        for j,b in enumerate(ts):
            if i<j and (L[i]==L[j] or (K[i] and K[i]==K[j])): par[f(a)]=f(b)
    plan = {t:(l,k,B[t][0]) for t,l,k in zip(ts,L,K)}
    groupes = {}
    for t in ts: groupes.setdefault(f(t),[]).append(t)
    multi = [g for g in groupes.values() if len(g)>1]
    idx = {t:i for i,t in enumerate(ts)}
    choix = [t for g in multi for t in g]
    def rec(i):
        if i==len(choix):
            J = jalons(plan, phase, npauses)
            return dict(plan) if juste(J) else None
        t = choix[i]; lo,hi = B[t]; l,k = L[idx[t]],K[idx[t]]
        for s in range(lo,hi+1,PAS):
            e = s+TOURS[t]['service']; bad=False
            for u in choix[:i]:
                l2,k2,s2 = plan[u]; e2=s2+TOURS[u]['service']
                if s<e2 and s2<e and (l2==l or (k2 and k2==k)): bad=True;break
            if bad: continue
            plan[t]=(l,k,s)
            r = rec(i+1)
            if r: return r
        plan[t]=(l,k,lo)
        return None
    return rec(0)

def court(sol): return ' · '.join(f"{TOURS[t]['nom'].split(' ')[0]} {l}/{k or '—'} {fmt(s)}" for t,(l,k,s) in sol.items())

def pieges():
    J_ = lambda P,ph: {k:v for k,v in jalons(P,ph,0).items() if not k.startswith('_')}
    def montre(nom, P, ph):
        J = jalons(P, ph, 0); faux = [k for k,v in J.items() if not k.startswith('_') and not v]
        print(f"{nom:62s} faux : {faux or '—'}   {[p[0] for p in J['_pb']]}")
    V1 = dict(cote=('lucas','T1',H('06:00')), rouen=('amandine','T2',H('06:30')), vers=('fatou','E1',H('06:30')),
              mantes=('sebastien','E2',H('09:00')), evreux=('julien','VL',H('06:00')))
    V2 = dict(cote=('lucas','T1',H('06:00')), rouen=('TR',None,H('07:00')), vers=('fatou','E1',H('06:30')),
              mantes=('sebastien','LOC',H('09:00')), evreux=('julien','VL',H('06:00')))
    def m(base, **kw):
        P = dict(base); P.update({k:(v[0],v[1],H(v[2])) for k,v in kw.items()}); return P
    print("=== Références"); montre("1er envoi attendu (cadrage)", V1, 1); montre("après l'imprévu attendu", V2, 2)
    montre("1er envoi relu après l'imprévu", V1, 2)
    print("=== Pièges du 1er envoi")
    if LUCAS_COTE: print("(carte côte posée sur Lucas à 06:00 : les pièges « X sur la côte », « côte partie à 07:15 » et « côte au transporteur » ne sont plus jouables, ni ceux qui mettent la côte sur un autre camion que T1/T2 avant l'imprévu ou que T1 après ; gardés pour mémoire)")
    montre("Julien (permis B) sur la côte, T1", m(V1, cote=('julien','T1','06:00'), evreux=('lucas','VL','06:00')), 1)
    montre("Sébastien sur la côte à 06:00", m(V1, cote=('sebastien','T1','06:00'), mantes=('lucas','E2','06:00')), 1)
    montre("Sébastien sur Rouen à 08:30", m(V1, rouen=('sebastien','T2','08:30'), mantes=('amandine','E2','06:30')), 1)
    montre("Sébastien sur Rouen à 09:00 (repos ok)", m(V1, rouen=('sebastien','T2','09:00'), mantes=('amandine','E2','06:30')), 1)
    montre("Amandine sur la côte à 06:00", m(V1, cote=('amandine','T1','06:00'), rouen=('lucas','T2','06:00')), 1)
    montre("Côte sur électrique E2 (320 km)", m(V1, cote=('lucas','E2','06:00'), mantes=('sebastien','T1','09:00')), 1)
    montre("Versailles sur thermique T1", m(V1, vers=('fatou','T1','06:30'), cote=('lucas','E1','06:00')), 1)
    montre("Rouen sur E2 (210 km)", m(V1, rouen=('amandine','E2','06:30'), mantes=('sebastien','T2','09:00')), 1)
    montre("Mantes sur le VL, Évreux sur E2", m(V1, mantes=('sebastien','VL','09:00'), evreux=('julien','E2','06:00')), 1)
    montre("Côte partie à 07:15 (rentre trop tard)", m(V1, cote=('lucas','T1','07:15')), 1)
    montre("Fatou fait Versailles puis Évreux (2 tournées)", m(V1, evreux=('fatou','VL','13:30')), 1)
    print("=== Pièges après l'imprévu")
    montre("1er envoi gardé tel quel", V1, 2)
    montre("Rouen sur le camion loué à 09:00 (Amandine), Mantes au transporteur", m(V2, rouen=('amandine','LOC','09:00'), mantes=('TR',None,'07:00')), 2)
    montre("Rouen sur le camion loué à 08:30", m(V2, rouen=('amandine','LOC','08:30'), mantes=('TR',None,'07:00')), 2)
    montre("Côte au transporteur, Lucas libre", m(V2, cote=('TR',None,'07:00'), rouen=('lucas','T1','06:00')), 2)
    montre("Mantes au transporteur, Rouen sur T1 ? (côte sur LOC)", m(V2, mantes=('TR',None,'07:00'), rouen=('amandine','T1','06:30'), cote=('lucas','LOC','09:00')), 2)
    montre("Mantes sur E2 (80 km d'autonomie)", m(V2, mantes=('sebastien','E2','09:00')), 2)
    montre("Versailles sur le camion loué, Mantes sur E1", m(V2, vers=('fatou','LOC','09:00'), mantes=('sebastien','E1','09:00')), 2)
    montre("Rouen au transporteur à 06:30", m(V2, rouen=('TR',None,'06:30')), 2)
    montre("Mantes sur le loué à 08:30 (avant 09:00)", m(V2, mantes=('amandine','LOC','08:30')), 2)
    montre("Côte sur T2 (en panne)", m(V2, cote=('lucas','T2','06:00'), mantes=('sebastien','T1','09:00')), 2)
    montre("Évreux au transporteur, Rouen sur le VL (Julien)", m(V2, evreux=('TR',None,'07:00'), rouen=('julien','VL','06:00')), 2)
    montre("Mantes au transporteur, Rouen sur le loué à 09:00", m(V2, mantes=('TR',None,'07:00'), rouen=('amandine','LOC','09:00')), 2)
    montre("Amandine sur Mantes à 09:00 (au lieu de Sébastien)", m(V2, mantes=('amandine','LOC','09:00')), 2)

if __name__ == '__main__':
    for np_ in (0,):
        print(f"\n===== cartes Pause disponibles : {np_}")
        v1 = organisations(1, np_); v2 = organisations(2, np_)
        print(f"Organisations justes AVANT l'imprévu : {len(v1)}")
        for s in v1: print('  ', court(s))
        print(f"Organisations justes APRÈS l'imprévu : {len(v2)}")
        for s in v2: print('  ', court(s))
        surv = []
        for s in v1:
            # le même planning, relu avec les données de l'imprévu (on cherche s'il existe un horaire qui tient)
            J = jalons(s, 2, np_)
            if juste(J): surv.append(s)
        print(f"Plannings du 1er envoi encore justes après l'imprévu : {len(surv)}")
    print("\n===== Pièges"); pieges()
